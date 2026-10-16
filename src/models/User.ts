import mongoose, { Schema, Document, models } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    image?: string;
    branch?: string;
    graduation_year?: number;
    tech_skills: string[];
    bio?: string;
    role?: string;
    github_url?: string;
    reputation_score: number;
    projects_shipped: number;
    timezone: string;
    commitment_level: "Casual" | "Balanced" | "Grinder";
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        image: { type: String },
        branch: { type: String },
        graduation_year: { type: Number },
        tech_skills: { type: [String], default: [] },
        github_url: { type: String },
        bio: { type: String, maxLength: 160, default: "" },
        role: { type: String, maxLength: 50, default: "Developer" },
        reputation_score: { type: Number, default: 0 },
        projects_shipped: { type: Number, default: 0 },
        timezone: { type: String, default: "UTC" },
        commitment_level: { type: String, enum: ["Casual", "Balanced", "Grinder"], default: "Balanced" },
    },
    { timestamps: true }
);

// Prevent mongoose from recompiling the model upon hot-reload
export const User = models.User || mongoose.model<IUser>("User", UserSchema);