import mongoose, { Schema, Document, models } from "mongoose";

export interface IProject extends Document {
    creator_id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: "Open" | "In-Progress" | "Completed" | "Decommissioned";
    required_skills: string[];
    domain: string;
    event_name: string;
    deadline?: Date;
    team_capacity: number;
    filled_seats: number;
    commitment_required: "Casual" | "Balanced" | "Grinder";
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        creator_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ["Open", "In-Progress", "Completed", "Decommissioned"],
            default: "Open",
        },
        required_skills: { type: [String], required: true },
        domain: { type: String, maxLength: 50, default: "General Tech" },
        event_name: { type: String, default: "Independent Project" },
        deadline: { type: Date },
        team_capacity: { type: Number, default: 4 },
        filled_seats: { type: Number, default: 1 },
        commitment_required: { type: String, enum: ["Casual", "Balanced", "Grinder"], default: "Balanced" },
    },
    { timestamps: true }
);

export const Project = models.Project || mongoose.model<IProject>("Project", ProjectSchema);