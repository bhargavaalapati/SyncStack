"use server";

import { connectDB } from "@/lib/db";
import { Application } from "@/models/Application";
import { Project } from "@/models/Project";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. A developer applies to a project
export async function applyToProject(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();

    // Check if they already applied to prevent spam
    const existingApp = await Application.findOne({
        project_id: projectId,
        applicant_id: session.user.id,
    });

    if (existingApp) {
        throw new Error("You have already applied to this project.");
    }

    // Create the pending application
    const newApp = await Application.create({
        project_id: projectId,
        applicant_id: session.user.id,
        status: "Pending",
    });

    revalidatePath("/");
    return JSON.parse(JSON.stringify(newApp));
}

// 2. Fetch applications for a specific project (For the Creator)
export async function getProjectApplications(projectId: string) {
    await connectDB();

    const applications = await Application.find({ project_id: projectId })
        .populate("applicant_id", "name image github_url tech_skills")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(applications));
}

// 3. Update application status (Accept / Reject)
export async function updateApplicationStatus(applicationId: string, status: "Accepted" | "Rejected", reason?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();

    const app = await Application.findByIdAndUpdate(
        applicationId,
        { status, rejection_reason: reason || "" },
        { returnDocument: 'after' }
    );

    // AUTO-INCREMENT SEATS LOGIC
    if (status === "Accepted" && app?.project_id) {
        await Project.findByIdAndUpdate(
            app.project_id,
            { $inc: { filled_seats: 1 } }
        );
    }

    revalidatePath("bulletin");
    revalidatePath("/dashboard");
    return JSON.parse(JSON.stringify(app));
}


export async function getDashboardData() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await connectDB();

    // 1. Find all projects created by this user
    const myProjects = await Project.find({ creator_id: session.user.id }).lean();
    const projectIds = myProjects.map(p => p._id);

    // 2. Find all applications made to those specific projects
    const applications = await Application.find({ project_id: { $in: projectIds } })
        .populate("applicant_id", "name image github_url tech_skills bio role")
        .populate("project_id", "title")
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(applications));
}

// Fetch applications the current user has SENT to other projects
export async function getMyApplications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    await connectDB();

    const myApplications = await Application.find({ applicant_id: session.user.id })
        .populate({
            path: "project_id",
            select: "title description creator_id",
            populate: {
                path: "creator_id",
                select: "name email image github_url"
            }
        })
        .sort({ createdAt: -1 })
        .lean();

    return JSON.parse(JSON.stringify(myApplications));
}