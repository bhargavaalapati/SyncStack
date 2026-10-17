import mongoose, { Schema, Document, models } from "mongoose";

export interface ISprintMilestone {
    phase: string;
    deliverables: string[];
    estimated_hours: number;
}

export interface IRoleRequirement {
    role_title: string;
    required_skills: string[];
    complexity: string;
}

export interface IRiskItem {
    risk: string;
    mitigation: string;
    severity: string;
}

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
    architectureDiagram?: string;
    sprintMilestones?: ISprintMilestone[];
    roleMatrix?: IRoleRequirement[];
    riskMatrix?: IRiskItem[];
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
        domain: { type: String, maxLength: 50, default: "Enterprise Tech" },
        event_name: { type: String, default: "Zeta Innovate 2026" },
        deadline: { type: Date },
        team_capacity: { type: Number, default: 4 },
        filled_seats: { type: Number, default: 1 },
        commitment_required: {
            type: String,
            enum: ["Casual", "Balanced", "Grinder"],
            default: "Balanced",
        },
        architectureDiagram: { type: String, default: "" },
        sprintMilestones: [
            {
                phase: { type: String },
                deliverables: [{ type: String }],
                estimated_hours: { type: Number },
            },
        ],
        roleMatrix: [
            {
                role_title: { type: String },
                required_skills: [{ type: String }],
                complexity: { type: String },
            },
        ],
        riskMatrix: [
            {
                risk: { type: String },
                mitigation: { type: String },
                severity: { type: String },
            },
        ],
    },
    { timestamps: true }
);

export const Project = models.Project || mongoose.model<IProject>("Project", ProjectSchema);