// src/actions/project.ts
"use server";

import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Application } from "@/models/Application";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. Create a new project (with optional AI Enterprise Blueprint)
export async function createProject(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized: Must be logged in to create a project.");

    await connectDB();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const required_skills_raw = formData.get("required_skills") as string;
    const domain = (formData.get("domain") as string) || "Enterprise AI";

    const event_name = (formData.get("event_name") as string) || "Zeta Innovate 2026";
    const team_capacity_raw = formData.get("team_capacity") as string;
    const team_capacity = team_capacity_raw ? parseInt(team_capacity_raw, 10) : 4;
    const commitment_required = (formData.get("commitment_required") as string) || "Balanced";

    const deadline_raw = formData.get("deadline") as string;
    const deadline = deadline_raw ? new Date(deadline_raw) : null;

    const required_skills = required_skills_raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    // Parse AI Blueprint if generated during creation
    const blueprintRaw = formData.get("blueprint_json") as string;
    let blueprintFields: Record<string, any> = {};
    if (blueprintRaw) {
        try {
            const parsed = JSON.parse(blueprintRaw);
            blueprintFields = {
                architectureDiagram: parsed.mermaid_architecture || "",
                sprintMilestones: parsed.sprint_milestones || [],
                roleMatrix: parsed.role_matrix || [],
                riskMatrix: parsed.risk_matrix || [],
            };
        } catch (e) {
            console.error("Failed to parse blueprint_json:", e);
        }
    }

    const newProject = await Project.create({
        creator_id: session.user.id,
        title,
        description,
        required_skills,
        domain,
        status: "Open",
        event_name,
        team_capacity,
        commitment_required,
        ...(deadline && { deadline }),
        ...blueprintFields,
    });

    revalidatePath("/bulletin");
    revalidatePath("/dashboard");
    return JSON.parse(JSON.stringify(newProject));
}

// 2. Fetch all open projects for the bulletin board
export async function getOpenProjects() {
    await connectDB();

    const projects = await Project.find({ status: "Open" })
        .populate("creator_id", "name image github_url")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(projects));
}

// 3. Update an existing project configuration (Creator Only)
export async function updateProject(projectId: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const required_skills_raw = formData.get("required_skills") as string;

    const team_capacity_raw = formData.get("team_capacity") as string;
    const team_capacity = team_capacity_raw ? parseInt(team_capacity_raw, 10) : undefined;
    const commitment_required = formData.get("commitment_required") as string;

    const deadline_raw = formData.get("deadline") as string;
    const deadline = deadline_raw ? new Date(deadline_raw) : null;

    const required_skills = required_skills_raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const updatePayload: any = {
        title,
        description,
        required_skills,
        deadline,
    };

    if (team_capacity) updatePayload.team_capacity = team_capacity;
    if (commitment_required) updatePayload.commitment_required = commitment_required;

    const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId, creator_id: session.user.id },
        updatePayload,
        { returnDocument: "after" }
    );

    if (!updatedProject) throw new Error("Project not found or unauthorized.");

    revalidatePath("/bulletin");
    revalidatePath("/dashboard");
    return JSON.parse(JSON.stringify(updatedProject));
}

// 4. Delete a project and cascade purge requests (Creator Only)
export async function deleteProject(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();

    const decommissionedProject = await Project.findOneAndUpdate(
        { _id: projectId, creator_id: session.user.id },
        { status: "Decommissioned" },
        { returnDocument: "after" }
    );

    if (!decommissionedProject) throw new Error("Project not found or unauthorized.");

    await Application.updateMany(
        { project_id: projectId, status: "Pending" },
        { status: "Decommissioned" }
    );

    revalidatePath("/bulletin");
    revalidatePath("/dashboard");
    return { success: true };
}