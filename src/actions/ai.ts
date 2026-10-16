"use server";

import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export async function getTeammateSuggestions(projectId: string) {
    await connectDB();

    // 1. Fetch the specific project
    const project = await Project.findById(projectId).lean();
    if (!project) throw new Error("Project not found");

    // 2. Fetch all available candidates (Excluding the project creator)
    // In a production app, we would add pagination/filters here. For the MVP, we grab the pool.
    const candidates = await User.find({ _id: { $ne: project.creator_id } }).lean();

    if (candidates.length === 0) {
        return []; // No candidates available to match
    }

    // 3. Format the payload to strictly match our FastAPI Pydantic models
    const payload = {
        project: {
            title: project.title,
            description: project.description,
            required_skills: project.required_skills,
        },
        candidates: candidates.map((c) => ({
            user_id: c._id.toString(),
            name: c.name,
            tech_skills: c.tech_skills || [],
        })),
    };

    // 4. Fire the request to the Python Microservice
    const aiEngineUrl = process.env.NEXT_PUBLIC_AI_ENGINE_URL || "http://127.0.0.1:8000/api/ai/match";

    const response = await fetch(aiEngineUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch semantic matches from the AI Engine");
    }

    const aiData = await response.json();

    // 5. Re-map the AI's results with the actual User database info (for avatars and GitHub links)
    const enrichedMatches = aiData.matches.map((match: any) => {
        const userDetail = candidates.find((c) => c._id.toString() === match.user_id);
        return {
            ...match,
            user: userDetail,
        };
    });

    // Sort candidates by highest compatibility score first
    enrichedMatches.sort((a: any, b: any) => b.compatibility_score - a.compatibility_score);

    return JSON.parse(JSON.stringify(enrichedMatches));
}