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

// Update the user's telemetry
export async function updateProfile(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await connectDB();

    const branch = formData.get("branch") as string;
    const graduation_year = formData.get("graduation_year") as string;
    const tech_skills_raw = formData.get("tech_skills") as string;
    const bio = formData.get("bio") as string;
    const role = formData.get("role") as string;

    // Convert comma-separated string to an array and clean it up
    const tech_skills = tech_skills_raw
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

    const updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        {
            branch,
            graduation_year: graduation_year ? parseInt(graduation_year, 10) : undefined,
            tech_skills,
            bio: bio || "",
            role: role || "Developer",
        },
        { new: true }
    );

    revalidatePath("/profile");
    return JSON.parse(JSON.stringify(updatedUser));
}