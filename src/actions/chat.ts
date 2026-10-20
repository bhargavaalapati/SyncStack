"use server";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import mongoose from "mongoose";

export interface ChatMessageDTO {
    _id: string;
    sender_name: string;
    sender_image: string;
    sender_role: string;
    trust_score: number;
    tag: "Team Up" | "Architecture" | "General";
    content: string;
    createdAt: string;
    isOnline: boolean;
}

export async function getLobbyMessages(): Promise<ChatMessageDTO[]> {
    await connectDB();

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
            },
            {
                sender_id: fakeId,
                sender_name: "Sarah Jenkins",
                sender_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
                sender_role: "Applied GenAI Scientist",
                trust_score: 92,
                tag: "Architecture",
                content:
                    "Just tested the Gemini 2.5 Flash Mermaid.js auto-architect—the multi-sprint breakdown saved us 3 hours of scoping.",
            },
            {
                sender_id: fakeId,
                sender_name: "David Kumar",
                sender_image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
                sender_role: "Zero-Knowledge Protocol Dev",
                trust_score: 94,
                tag: "General",
                content:
                    "Tip: Run the GitHub Skill Verifier on your Telemetry page before applying so project leads see your verified trust badge!",
            },
        ]);
    }

    const rawMessages = await Message.find()
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();

    return rawMessages.reverse().map((m) => ({
        _id: String(m._id),
        sender_name: String(m.sender_name || "Engineer"),
        sender_image: String(m.sender_image || ""),
        sender_role: String(m.sender_role || "Developer"),
        trust_score: Number(m.trust_score || 0),
        tag: (m.tag as "Team Up" | "Architecture" | "General") || "General",
        content: String(m.content || ""),
        createdAt: m.createdAt
            ? new Date(m.createdAt as Date).toISOString()
            : new Date().toISOString(),
        isOnline: true,
    }));
}

export async function postLobbyMessage(
    content: string,
    tag: "Team Up" | "Architecture" | "General"
): Promise<{ success: boolean; message?: string }> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            message: "Please sign in to post in the Developer Comms Lobby.",
        };
    }

    const trimmed = content.trim();
    if (!trimmed || trimmed.length < 2) {
        return { success: false, message: "Message cannot be empty." };
    }
    if (trimmed.length > 280) {
        return {
            success: false,
            message: "Message exceeds 280 characters.",
        };
    }

    await connectDB();

    const dbUser = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { updatedAt: new Date() } },
        { new: true }
    ).lean();

    await Message.create({
        sender_id: session.user.id,
        sender_name: dbUser?.name || session.user.name || "SyncStack Engineer",
        sender_image: dbUser?.image || session.user.image || "",
        sender_role: dbUser?.role || "Full-Stack Engineer",
        trust_score: dbUser?.trust_score || 80,
        tag,
        content: trimmed,
    });

    return { success: true };
}