"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SuggestTeammates from "./SuggestTeammates";
import EditProjectDialog from "./EditProjectDialog";
import { deleteProject } from "@/actions/project";
import { applyToProject } from "@/actions/application";
import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Trash2, Users, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function ProjectCard({ project, initialApplied = false }: { project: any, initialApplied?: boolean }) {
    const { data: session } = useSession();
    const [deleting, setDeleting] = useState(false);

    const isCreator = session?.user?.id === project.creator_id?._id;

    async function handleDelete() {
        if (!confirm("Are you absolutely sure you want to decommission this project architecture? This action cannot be undone.")) return;

        setDeleting(true);
        try {
            await deleteProject(project._id);
            toast.success("Architecture purged from campus bulletin.");
        } catch (error) {
            toast.error("Failed to delete project.");
            setDeleting(false);
        }
    }

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            className="border rounded-xl p-6 bg-card flex flex-col justify-between h-full relative overflow-hidden group shadow-sm hover:shadow-lg hover:border-primary/50 transition-all duration-300"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div>
                <div className="flex justify-between items-start mb-2 gap-4">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight leading-tight">{project.title}</h3>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            Posted {timeAgo(project.createdAt)}
                        </span>
                    </div>
                    <Badge variant="secondary" className="whitespace-nowrap shrink-0">{project.domain || "Tech"}</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {project.filled_seats || 1}/{project.team_capacity || 4} Seats</span>
                    {/* Fixed Deadline Rendering */}
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { timeZone: 'UTC' }) : "Rolling"}
                    </span>
                    <span className="flex items-center gap-1 text-amber-500"><Zap className="w-3 h-3" /> {project.commitment_required || "Balanced"}</span>
                </div>

                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                    {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {project.required_skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-primary/5 border-primary/20">
                            {skill}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t gap-2">
                <div className="flex items-center gap-2 max-w-[40%]">
                    {project.creator_id?.image ? (
                        <img
                            src={project.creator_id.image}
                            alt="Creator Avatar"
                            className="w-7 h-7 rounded-full border border-border shrink-0"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                            {project.creator_id?.name?.charAt(0) || "U"}
                        </div>
                    )}
                    <span className="text-xs font-medium text-muted-foreground truncate">
                        {project.creator_id?.name?.split(" ")[0] || "Unknown"}
                    </span>
                </div>

                {isCreator ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                        <SuggestTeammates projectId={project._id} />
                        <EditProjectDialog project={project} />
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-border/60"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                ) : (
                    <div className="shrink-0">
                        <JoinButton projectId={project._id} initialApplied={initialApplied} session={session} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function JoinButton({ projectId, initialApplied, session }: { projectId: string, initialApplied: boolean, session: any }) {
    const [loading, setLoading] = useState(false);
    const [applied, setApplied] = useState(initialApplied);

    useEffect(() => {
        setApplied(initialApplied);
    }, [initialApplied]);

    async function handleApply() {
        // THE INTERCEPT: If no session exists, guide them to login
        if (!session) {
            toast.info("Authentication Required", {
                description: "Please log in to join architectures and sync your telemetry.",
                action: {
                    label: "Login",
                    onClick: () => signIn("github")
                },
            });
            return;
        }

        setLoading(true);
        try {
            await applyToProject(projectId);
            setApplied(true);
            toast.success("Application transmitted! (Global state synced)");
        } catch (error: any) {
            if (error.message.includes("already applied")) {
                setApplied(true);
            }
            toast.error("Failed to complete request propagation.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (applied) {
        return <Button size="sm" variant="secondary" disabled className="opacity-100 font-medium text-green-600 bg-green-500/10">Request Sent</Button>;
    }

    return (
        <Button size="sm" variant="default" onClick={handleApply} disabled={loading}>
            {loading ? "Sending..." : "Request to Join"}
        </Button>
    );
}