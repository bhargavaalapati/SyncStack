import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    sender_id: mongoose.Types.ObjectId;
    sender_name: string;
    sender_image?: string;
    sender_role?: string;
    trust_score?: number;
    tag: "Team Up" | "Architecture" | "General";
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
    {
        sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        sender_name: { type: String, required: true },
        sender_image: { type: String, default: "" },
        sender_role: { type: String, default: "Full-Stack Engineer" },
        trust_score: { type: Number, default: 0 },
        tag: {
            type: String,
            enum: ["Team Up", "Architecture", "General"],
            default: "General",
        },
        content: { type: String, required: true, maxlength: 280 },
    },
    { timestamps: true }
);

// Compound index for fast chronological lobby polling
MessageSchema.index({ createdAt: -1 });

export const Message =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);