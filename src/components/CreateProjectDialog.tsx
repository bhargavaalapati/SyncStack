"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createProject } from "@/actions/project";

export default function CreateProjectDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        try {
            await createProject(formData);
            setOpen(false); // Close the modal on success
        } catch (error) {
            console.error("Failed to create project", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="font-semibold shadow-sm">
                    Broadcast Architecture
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Deploy a New Project</DialogTitle>
                    <DialogDescription>
                        Pitch your idea and specify the exact tech stack dependencies you need to fulfill.
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="font-semibold">Project Title</Label>
                        <Input id="title" name="title" placeholder="e.g., Smart Parking Slot Finder for Vizag" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="font-semibold">Problem Statement & Scope</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Describe the core problem and your proposed technological solution..."
                            rows={4}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="required_skills" className="font-semibold">Required Tech Stack (Comma separated)</Label>
                        <Input id="required_skills" name="required_skills" placeholder="e.g., React, FastAPI, Docker, MongoDB" required />
                    </div>

                    {/* NEW FIELDS ADDED HERE */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="team_capacity" className="font-semibold">Team Capacity</Label>
                            <Input id="team_capacity" name="team_capacity" type="number" min="1" max="20" defaultValue={4} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deadline" className="font-semibold">Deadline (Optional)</Label>
                            <Input id="deadline" name="deadline" type="date" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="commitment_required" className="font-semibold">Commitment Level</Label>
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

                    <Button type="submit" disabled={loading} className="w-full mt-2">
                        {loading ? "Deploying..." : "Post to Bulletin"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}