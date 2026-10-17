import mongoose, { Schema, Document, models } from "mongoose";

export interface IVerifiedSkillBadge {
    skill: string;
    confidence_score: number;
    evidence: string;
}

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
    // Enterprise AI Verification Telemetry
    trust_score?: number;
    verified_badges?: IVerifiedSkillBadge[];
    architectural_strength?: string;
    ai_recommended_role?: string;
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
        github_url: { type: String, default: "" },
        bio: { type: String, maxLength: 300, default: "" },
        role: { type: String, maxLength: 80, default: "Developer" },
        reputation_score: { type: Number, default: 0 },
        projects_shipped: { type: Number, default: 0 },
        timezone: { type: String, default: "IST (UTC+5:30)" },
        commitment_level: {
            type: String,
            enum: ["Casual", "Balanced", "Grinder"],
            default: "Balanced",
        },
        trust_score: { type: Number, default: 0 },
        verified_badges: [
            {
                skill: { type: String },
                confidence_score: { type: Number },
                evidence: { type: String },
            },
        ],
        architectural_strength: { type: String, default: "" },
        ai_recommended_role: { type: String, default: "" },
    },
    { timestamps: true }
);

// Prevent mongoose from recompiling the model upon hot-reload
export const User = models.User || mongoose.model<IUser>("User", UserSchema);