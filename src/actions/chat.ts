"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { Project } from "@/models/Project";
import mongoose from "mongoose";

export interface ChatMessageDTO {
    _id: string;
    sender_name: string;
    sender_image: string;
    sender_role: string;
    trust_score: number;
    tag: "Team Up" | "Architecture" | "General" | "AI Agent";
    content: string;
    reply_to_name?: string;
    reply_to_snippet?: string;
    is_agent?: boolean;
    createdAt: string;
    presence: "online" | "today" | "offline";
}

export interface LobbyStateResponse {
    messages: ChatMessageDTO[];
    isAuthenticated: boolean;
    currentUserName: string;
    onlineCount: number;
}

/**
 * Immediate 20-second heartbeat window:
 * <= 20 seconds -> "online" (Green)
 * <= 15 minutes -> "today" (Amber)
 * > 15 minutes -> "offline" (Gray)
 */
function computePresenceFromDate(
    dateVal?: Date | string | null
): "online" | "today" | "offline" {
    if (!dateVal) return "offline";
    const diffMs = Date.now() - new Date(dateVal).getTime();
    if (diffMs <= 20 * 1000) return "online";
    if (diffMs <= 15 * 60 * 1000) return "today";
    return "offline";
}

export async function getLobbyMessages(): Promise<LobbyStateResponse> {
    await connectDB();
    const session = await auth();

    if (session?.user?.id) {
        await User.findByIdAndUpdate(
            session.user.id,
            { $set: { updatedAt: new Date() } },
            { returnDocument: "after" }
        );
    }

    const count = await Message.countDocuments();
    if (count === 0) {
        const fakeId = new mongoose.Types.ObjectId();
        await Message.insertMany([
            {
                sender_id: fakeId,
                sender_name: "Aarav Sharma",
                sender_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
                sender_role: "Lead Cloud Architect",
                trust_score: 95,
                tag: "Team Up",
                content:
                    "Looking for a Python + FastAPI engineer for our Autonomous FinOps Cloud Cost Engine! 2 seats left on the Bulletin.",
                is_agent: false,
            },
            {
                sender_id: fakeId,
                sender_name: "SyncStack Autonomous Agent",
                sender_image: "",
                sender_role: "Zero-Token MongoDB Matchmaking Concierge",
                trust_score: 100,
                tag: "AI Agent",
                reply_to_name: "Aarav Sharma",
                reply_to_snippet: "Looking for a Python + FastAPI engineer...",
                content:
                    "🤖 Autonomous RAG Scan: @Aarav Sharma, I cross-audited the Global Roster—Sarah Jenkins (92% Trust, Python/FastAPI/LangChain) and Elena Rostova (91% Trust, Kubernetes/Go) have >88% semantic overlap with your FinOps stack.",
                is_agent: true,
            },
        ]);
    }

    const rawMessages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(35)
        .lean();

    const senderIds = rawMessages
        .map((m) => m.sender_id)
        .filter((id) => Boolean(id));

    const users = await User.find({ _id: { $in: senderIds } })
        .select("_id updatedAt")
        .lean();

    const userPresenceMap = new Map<string, "online" | "today" | "offline">();
    for (const u of users) {
        userPresenceMap.set(
            String(u._id),
            computePresenceFromDate(u.updatedAt as Date | undefined)
        );
    }

    const messages: ChatMessageDTO[] = rawMessages.reverse().map((m) => {
        const msgAgeMs = m.createdAt
            ? Date.now() - new Date(m.createdAt as Date).getTime()
            : 99999999;
        const senderPresence = m.is_agent
            ? "online"
            : userPresenceMap.get(String(m.sender_id)) ||
              (msgAgeMs <= 20 * 1000 ? "online" : "offline");

        return {
            _id: String(m._id),
            sender_name: String(m.sender_name || "Engineer"),
            sender_image: String(m.sender_image || ""),
            sender_role: String(m.sender_role || "Developer"),
            trust_score: Number(m.trust_score || 0),
            tag:
                (m.tag as "Team Up" | "Architecture" | "General" | "AI Agent") ||
                "General",
            content: String(m.content || ""),
            reply_to_name: m.reply_to_name ? String(m.reply_to_name) : "",
            reply_to_snippet: m.reply_to_snippet ? String(m.reply_to_snippet) : "",
            is_agent: Boolean(m.is_agent),
            createdAt: m.createdAt
                ? new Date(m.createdAt as Date).toISOString()
                : new Date().toISOString(),
            presence: senderPresence,
        };
    });

    const recentOnlineUsers = await User.countDocuments({
        updatedAt: { $gte: new Date(Date.now() - 20 * 1000) },
    });

    return {
        messages,
        isAuthenticated: Boolean(session?.user?.id),
        currentUserName: session?.user?.name || "",
        onlineCount: Math.max(1, recentOnlineUsers + 1),
    };
}

export async function postLobbyMessage(input: {
    content: string;
    tag: "Team Up" | "Architecture" | "General";
    replyToName?: string;
    replyToSnippet?: string;
    askAgent?: boolean;
}): Promise<{ success: boolean; message?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            message: "Session expired or signed out. Please sign in to send messages.",
        };
    }

    const trimmed = input.content.trim();
    if (!trimmed || trimmed.length < 2) {
        return { success: false, message: "Message cannot be empty." };
    }
    if (trimmed.length > 320) {
        return { success: false, message: "Message exceeds 320 characters." };
    }

    await connectDB();

    const dbUser = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { updatedAt: new Date() } },
        { returnDocument: "after" }
    ).lean();

    const senderName = dbUser?.name || session.user.name || "SyncStack Engineer";

    await Message.create({
        sender_id: session.user.id,
        sender_name: senderName,
        sender_image: dbUser?.image || session.user.image || "",
        sender_role: dbUser?.role || "Full-Stack Engineer",
        trust_score: dbUser?.trust_score || 82,
        tag: input.tag,
        content: trimmed,
        reply_to_name: input.replyToName || "",
        reply_to_snippet: input.replyToSnippet || "",
        is_agent: false,
    });

    // Zero-Token Deterministic MongoDB RAG Agent (Costs 0 Gemini API Credits!)
    const shouldTriggerAgent =
        input.askAgent ||
        input.tag === "Team Up" ||
        input.tag === "Architecture" ||
        trimmed.toLowerCase().includes("@agent");

    if (shouldTriggerAgent) {
        const lower = trimmed.toLowerCase();

        const openProjects = await Project.find({ status: "Open" })
            .select("title domain required_skills")
            .limit(8)
            .lean();

        const topDevs = await User.find({
            _id: { $ne: session.user.id },
            trust_score: { $gt: 0 },
        })
            .sort({ trust_score: -1, reputation_score: -1 })
            .select("name role trust_score tech_skills")
            .limit(6)
            .lean();

        const matchedProj =
            openProjects.find((p) =>
                (p.required_skills || []).some((s: string) =>
                    lower.includes(s.toLowerCase())
                )
            ) || openProjects[0];

        const matchedDev =
            topDevs.find((d) =>
                (d.tech_skills || []).some((s: string) =>
                    lower.includes(s.toLowerCase())
                )
            ) || topDevs[0];

        let agentResponse = `🤖 Autonomous RAG Scan for @${senderName}: `;
const isSimpleGreeting = trimmed.length < 15 || ["hi", "hello", "hey", "sup"].includes(trimmed.toLowerCase());

if (isSimpleGreeting) {
    agentResponse = `🤖 Hello @${senderName}! I am your Autonomous Matchmaking Concierge. You can ask me things like "Looking for a React/FastAPI developer" or tag @agent to scan open enterprise architectures on the Bulletin.`;
} else if (input.tag === "Team Up" && matchedDev) {
    const devSkills = (matchedDev.tech_skills || []).slice(0, 3).join(", ");
    agentResponse += `Matched Teammate: ${matchedDev.name} (${matchedDev.role}, ${matchedDev.trust_score}% Verified Trust • Stack: ${devSkills}).`;
} else if (matchedProj) {
    const reqSkills = (matchedProj.required_skills || []).slice(0, 3).join(", ");
    agentResponse += `Recommended Blueprint: "${matchedProj.title}" (${matchedProj.domain} • Stack: ${reqSkills}). Open the Spec-to-Repo Compiler to initialize its monorepo!`;
} else {
    agentResponse += `Your telemetry broadcast is indexed. Check out the Global Roster or Bulletin to connect with builders.`;
}
        await Message.create({
            sender_id: session.user.id,
            sender_name: "SyncStack Autonomous Agent",
            sender_image: "",
            sender_role: "Zero-Token MongoDB RAG Concierge",
            trust_score: 100,
            tag: "AI Agent",
            reply_to_name: senderName,
            reply_to_snippet: trimmed.slice(0, 70),
            content: agentResponse.slice(0, 350),
            is_agent: true,
        });
    }

    return { success: true };
}