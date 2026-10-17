"use server";

import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Fetch the currently logged-in user's full profile
export async function getUserProfile() {
    const session = await auth();
    if (!session?.user?.id) return null;

    await connectDB();
    const user = await User.findById(session.user.id).lean();
    return JSON.parse(JSON.stringify(user));
}

// Update the user's telemetry + AI Skill Verification Badges
export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();

    const branch = formData.get("branch") as string;
    const graduation_year = formData.get("graduation_year") as string;
    const tech_skills_raw = formData.get("tech_skills") as string;
    const bio = formData.get("bio") as string;
    const role = formData.get("role") as string;
    const github_url = formData.get("github_url") as string;

    const tech_skills = tech_skills_raw
        ? tech_skills_raw
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
        : [];

    const updatePayload: Record<string, any> = {
        branch,
        graduation_year: graduation_year ? parseInt(graduation_year, 10) : undefined,
        tech_skills,
        bio: bio || "",
        role: role || "Developer",
    };

    if (github_url !== null && github_url !== undefined) {
        updatePayload.github_url = github_url.trim();
    }

    // Parse AI Skill Verification payload if present
    const verificationRaw = formData.get("verification_json") as string;
    if (verificationRaw) {
        try {
            const parsed = JSON.parse(verificationRaw);
            updatePayload.trust_score = parsed.overall_trust_score || 0;
            updatePayload.verified_badges = parsed.verified_badges || [];
            updatePayload.architectural_strength = parsed.architectural_strength || "";
            updatePayload.ai_recommended_role = parsed.recommended_role || "";
        } catch (e) {
            console.error("Failed to parse verification_json:", e);
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        updatePayload,
        { returnDocument: "after" }
    );

    revalidatePath("/profile");
    revalidatePath("/leaderboard");
    revalidatePath("/dashboard");
    return JSON.parse(JSON.stringify(updatedUser));
}