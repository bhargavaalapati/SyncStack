"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createProject } from "@/actions/project";
import { generateProjectBlueprint, ProjectBlueprint } from "@/actions/ai";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isArchitecting, setIsArchitecting] = useState(false);

    const [title, setTitle] = useState("");
    const [domain, setDomain] = useState("Healthcare IoT & AI");
    const [description, setDescription] = useState("");
    const [requiredSkills, setRequiredSkills] = useState("");
    const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);

    async function handleAutoArchitect() {
        if (!title.trim() || !description.trim()) {
            toast.error("Enter a rough Project Title and a 1-line idea first!");
            return;
        }

        setIsArchitecting(true);
        try {
            const res = await generateProjectBlueprint(title, description, domain);
            if (res.success && res.data) {
                setTitle(res.data.refined_title);
                setDescription(res.data.executive_summary);
                setRequiredSkills(res.data.recommended_stack.join(", "));
                setBlueprint(res.data);
                toast.success("AI Enterprise Architecture & Sprint Plan generated!");
            }
        } catch (err) {
            console.error("Auto-Architect error:", err);
            toast.error("Failed to generate blueprint.");
        } finally {
            setIsArchitecting(false);
        }
    }

    async function onSubmit(formData: FormData) {
        setLoading(true);
        try {
            await createProject(formData);
            toast.success("Project deployed to Bulletin with AI Blueprint!");
            setOpen(false);
            // Reset state
            setTitle("");
            setDescription("");
            setRequiredSkills("");
            setBlueprint(null);
        } catch (error) {
            console.error("Failed to create project", error);
            toast.error("Failed to deploy project.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="font-semibold shadow-sm gap-2">
                    <Sparkles className="h-4 w-4" />
                    Broadcast Architecture
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        Deploy a New Project
                    </DialogTitle>
                    <DialogDescription>
                        Enter a raw 1-line idea and click <strong>Auto-Architect with AI</strong> to generate a full system topology, tech stack, and sprint plan.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="grid gap-5 py-3">
                    {/* Hidden input carrying the structured AI blueprint to the Server Action */}
                    {blueprint && (
                        <input
                            type="hidden"
                            name="blueprint_json"
                            value={JSON.stringify(blueprint)}
                        />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="title" className="font-semibold">
                                Project Title
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Smart Cold-Chain Monitor"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="domain" className="font-semibold">
                                Domain
                            </Label>
                            <Input
                                id="domain"
                                name="domain"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="e.g., FinTech, IoT, GenAI"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="description" className="font-semibold">
                                Problem Statement & Scope
                            </Label>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleAutoArchitect}
                                disabled={isArchitecting}
                                className="h-7 text-xs gap-1.5 border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                            >
                                {isArchitecting ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Architecting with Gemini 2.5...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Auto-Architect with AI
                                    </>
                                )}
                            </Button>
                        </div>
                        <Textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Type a rough 1-2 sentence idea here, then click 'Auto-Architect with AI'..."
                            rows={4}
                            required
                        />
                    </div>

                    {blueprint && (
                        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs space-y-1.5">
                            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                                <CheckCircle2 className="h-4 w-4" />
                                Enterprise AI Blueprint Attached!
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                <Badge variant="secondary" className="text-[10px]">
                                    {blueprint.sprint_milestones.length} Implementation Sprints
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">
                                    {blueprint.role_matrix.length} Specialized Roles
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">
                                    Mermaid.js Topology Graph
                                </Badge>
                                <Badge variant="secondary" className="text-[10px]">
                                    {blueprint.risk_matrix.length} Risk Mitigations
                                </Badge>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="required_skills" className="font-semibold">
                            Required Tech Stack (Comma separated)
                        </Label>
                        <Input
                            id="required_skills"
                            name="required_skills"
                            value={requiredSkills}
                            onChange={(e) => setRequiredSkills(e.target.value)}
                            placeholder="Auto-filled by AI or enter manually: React, FastAPI, Docker..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="team_capacity" className="font-semibold">
                                Team Capacity
                            </Label>
                            <Input
                                id="team_capacity"
                                name="team_capacity"
                                type="number"
                                min="1"
                                max="20"
                                defaultValue={4}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deadline" className="font-semibold">
                                Deadline (Optional)
                            </Label>
                            <Input id="deadline" name="deadline" type="date" />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="commitment_required" className="font-semibold">
                            Commitment Level
                        </Label>
                        <select
                            id="commitment_required"
                            name="commitment_required"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            defaultValue="Balanced"
                        >
                            <option value="Casual">Casual (Weekend Pacing)</option>
                            <option value="Balanced">Balanced (Steady Pacing)</option>
                            <option value="Grinder">Grinder (Intense/Sprint)</option>
                        </select>
                    </div>

                    <Button type="submit" disabled={loading || isArchitecting} className="w-full mt-2">
                        {loading ? "Deploying Blueprint..." : "Post to Bulletin"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}