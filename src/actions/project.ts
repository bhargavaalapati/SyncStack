// src/actions/project.ts
"use server";

import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { Application } from "@/models/Application";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. Create a new project
export async function createProject(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized: Must be logged in to create a project.");

    await connectDB();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const required_skills_raw = formData.get("required_skills") as string;

    // Extract new metrics
    const event_name = formData.get("event_name") as string || "Independent Project";
    const team_capacity_raw = formData.get("team_capacity") as string;
    const team_capacity = team_capacity_raw ? parseInt(team_capacity_raw, 10) : 4;
    const commitment_required = formData.get("commitment_required") as string || "Balanced";

    // Explicit Date Parsing Logic
    const deadline_raw = formData.get("deadline") as string;
    const deadline = deadline_raw ? new Date(deadline_raw) : null;

    const required_skills = required_skills_raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const newProject = await Project.create({
        creator_id: session.user.id,
        title,
        description,
        required_skills,
        status: "Open",
        event_name,
        team_capacity,
        commitment_required,
        ...(deadline && { deadline }) // Only attach if it exists
    });

    revalidatePath("/bulletin");
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

    // Extract metrics for update
    const team_capacity_raw = formData.get("team_capacity") as string;
    const team_capacity = team_capacity_raw ? parseInt(team_capacity_raw, 10) : undefined;
    const commitment_required = formData.get("commitment_required") as string;

    // Explicitly handle date updates. If empty string is sent, we nullify it.
    const deadline_raw = formData.get("deadline") as string;
    const deadline = deadline_raw ? new Date(deadline_raw) : null;

    const required_skills = required_skills_raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    // Build the update object carefully
    const updatePayload: any = {
        title,
        description,
        required_skills,
    };

    if (team_capacity) updatePayload.team_capacity = team_capacity;
    if (commitment_required) updatePayload.commitment_required = commitment_required;

    // Only update deadline if it was explicitly provided, otherwise allow removal via $unset if raw was empty string, or handle based on business logic. 
    // To keep it simple, we explicitly overwrite it.
    updatePayload.deadline = deadline;

    // atomic write constraint confirming creator identity
    const updatedProject = await Project.findOneAndUpdate(
        { _id: projectId, creator_id: session.user.id },
        updatePayload,
        { returnDocument: 'after' } // Modern standard
    );

    if (!updatedProject) throw new Error("Project not found or unauthorized.");

    revalidatePath("/bulletin");
    return JSON.parse(JSON.stringify(updatedProject));
}

// 4. Delete a project and cascade purge requests (Creator Only)
export async function deleteProject(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();

    // SOFT DELETE: We do not use findOneAndDelete. We update the status.
    const decommissionedProject = await Project.findOneAndUpdate(
        { _id: projectId, creator_id: session.user.id },
        { status: "Decommissioned" },
        { returnDocument: 'after' }
    );

    if (!decommissionedProject) throw new Error("Project not found or unauthorized.");

    // Update all pending applications to reflect the project closure
    await Application.updateMany(
        { project_id: projectId, status: "Pending" },
        { status: "Decommissioned" }
    );

    revalidatePath("/bulletin");
    revalidatePath("/dashboard");
    return { success: true };
}