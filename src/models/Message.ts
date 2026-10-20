import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
    sender_id: mongoose.Types.ObjectId;
    sender_name: string;
    sender_image?: string;
    sender_role?: string;
    trust_score?: number;
    tag: "Team Up" | "Architecture" | "General" | "AI Agent";
    content: string;
    reply_to_name?: string;
    reply_to_snippet?: string;
    is_agent?: boolean;
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
            enum: ["Team Up", "Architecture", "General", "AI Agent"],
            default: "General",
        },
        content: { type: String, required: true, maxlength: 360 },
        reply_to_name: { type: String, default: "" },
        reply_to_snippet: { type: String, default: "" },
        is_agent: { type: Boolean, default: false },
    },
    { timestamps: true }
);

MessageSchema.index({ createdAt: -1 });

export const Message =
    mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);