"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function ProfileForm({
    user,
    currentSkillsString
}: {
    user: any,
    currentSkillsString: string
}) {
    const [loading, setLoading] = useState(false);

    async function handleAction(formData: FormData) {
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success("Developer telemetry synchronized successfully.");
        } catch (error) {
            toast.error("Failed to synchronize telemetry.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleAction} className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="branch" className="font-semibold">Academic Branch</Label>
                    <Input id="branch" name="branch" defaultValue={user.branch || ""} placeholder="e.g., Computer Science" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="graduation_year" className="font-semibold">Graduation Year</Label>
                    <Input id="graduation_year" name="graduation_year" type="number" defaultValue={user.graduation_year || ""} placeholder="e.g., 2026" />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="role" className="font-semibold">Primary Role</Label>
                <Input id="role" name="role" defaultValue={user.role || "Developer"} placeholder="e.g., MERN Full Stack Engineer" maxLength={50} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="bio" className="font-semibold">Developer Bio</Label>
                <Input id="bio" name="bio" defaultValue={user.bio || ""} placeholder="e.g., Full Stack Engineer specializing in optimization algorithms." maxLength={160} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="tech_skills" className="font-semibold">Technical Skills (Comma separated)</Label>
                <Input id="tech_skills" name="tech_skills" defaultValue={currentSkillsString} placeholder="e.g., React, Node.js, Python, MongoDB" />
                <p className="text-xs text-muted-foreground">
                    These frameworks are ingested directly by the Gemini model to calculate your compatibility scores.
                </p>
            </div>

            {user.tech_skills && user.tech_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {user.tech_skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                    ))}
                </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-4">
                {loading ? "Synchronizing..." : "Save Telemetry"}
            </Button>
        </form>
    );
}