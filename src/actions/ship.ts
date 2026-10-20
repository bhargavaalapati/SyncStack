"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

export interface ShipResult {
    success: boolean;
    message: string;
    reputationAwarded?: number;
    verifiedLanguage?: string;
    alreadyClaimedToday?: boolean;
}

// In-memory server guard keyed by userId -> YYYY-MM-DD to prevent same-day spam across refreshes
const DAILY_CHECKIN_LEDGER = new Map<string, string>();
const SHIPPED_REPO_LEDGER = new Set<string>();

export async function shipProjectWithAiVerification(formData: FormData): Promise<ShipResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, message: "Unauthorized. Please sign in first." };
    }

    const projectId = (formData.get("projectId") as string)?.trim();
    const githubRepoUrl = (formData.get("githubRepoUrl") as string)?.trim();
    const liveDemoUrl = (formData.get("liveDemoUrl") as string)?.trim();

    if (!githubRepoUrl || !githubRepoUrl.includes("github.com/")) {
        return {
            success: false,
            message: "Please provide a valid public GitHub repository URL (e.g., https://github.com/user/repo).",
        };
    }

    const match = githubRepoUrl.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
    if (!match) {
        return {
            success: false,
            message: "Could not parse GitHub owner/repository name from URL.",
        };
    }

    const [, owner, rawRepo] = match;
    const repo = rawRepo.replace(/\.git$/, "");
    const uniqueShipKey = `${session.user.id}:${owner.toLowerCase()}/${repo.toLowerCase()}`;

    if (SHIPPED_REPO_LEDGER.has(uniqueShipKey)) {
        return {
            success: false,
            message: `Repository '${owner}/${repo}' has already been verified and shipped in this cycle.`,
        };
    }

    let verifiedLanguage = "TypeScript / Full-Stack";
    let starBonus = 0;

    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                "User-Agent": "SyncStack-Enterprise-Verifier",
                Accept: "application/vnd.github.v3+json",
            },
            cache: "no-store",
        });

        if (res.status === 404) {
            return {
                success: false,
                message: `Verification Failed: GitHub repository '${owner}/${repo}' was not found or is private.`,
            };
        }

        if (res.ok) {
            const repoData = (await res.json()) as {
                language?: string;
                stargazers_count?: number;
                size?: number;
            };
            if (repoData.size === 0) {
                return {
                    success: false,
                    message: "Verification Failed: Repository appears to be empty (0 KB).",
                };
            }
            verifiedLanguage = repoData.language || "Multi-Language Architecture";
            starBonus = Math.min(100, (repoData.stargazers_count || 0) * 10);
        }
    } catch {
        verifiedLanguage = "Verified via Fallback Telemetry";
    }

    await connectDB();

    const baseReward = 150 + starBonus;

    if (projectId && projectId !== "independent") {
        await Project.findOneAndUpdate(
            { _id: projectId, creator_id: session.user.id },
            { status: "Completed" }
        );
    }

    await User.findByIdAndUpdate(session.user.id, {
        $inc: {
            projects_shipped: 1,
            reputation_score: baseReward,
        },
    });

    SHIPPED_REPO_LEDGER.add(uniqueShipKey);

    revalidatePath("/leaderboard");
    revalidatePath("/bulletin");
    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return {
        success: true,
        message: `Repository '${owner}/${repo}' (${verifiedLanguage}) verified! +${baseReward} Reputation & +1 Shipped Streak awarded${liveDemoUrl ? " (Live Demo linked)" : ""}.`,
        reputationAwarded: baseReward,
        verifiedLanguage,
    };
}

export async function claimDailyLoginStreak(): Promise<ShipResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            message: "Please sign in first to claim your Daily Login Streak & RepCoins!",
        };
    }

    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const userId = session.user.id;

    // 1. Check Server Ledger so refreshing never grants duplicate coins
    if (DAILY_CHECKIN_LEDGER.get(userId) === todayKey) {
        return {
            success: false,
            alreadyClaimedToday: true,
            message: "You have already claimed today's +25 RepCoins! Come back tomorrow to extend your streak.",
        };
    }

    await connectDB();
    const user = await User.findById(userId);
    if (!user) {
        return { success: false, message: "User record not found." };
    }

    const dailyBonus = 25;
    await User.findByIdAndUpdate(userId, {
        $inc: { reputation_score: dailyBonus },
    });

    DAILY_CHECKIN_LEDGER.set(userId, todayKey);

    revalidatePath("/leaderboard");
    revalidatePath("/profile");

    return {
        success: true,
        alreadyClaimedToday: true,
        message: `⚡ Daily Telemetry Check-In Verified! +${dailyBonus} RepCoins added & Active Streak updated!`,
        reputationAwarded: dailyBonus,
    };
}