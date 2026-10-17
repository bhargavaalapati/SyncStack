"use client";

import { useState } from "react";
import { updateProfile } from "@/actions/profile";
import { verifyDeveloperSkills, SkillVerificationResult } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sparkles, ShieldCheck, Loader2, CheckCircle2, Award, Eye } from "lucide-react";
import { toast } from "sonner";
import GithubIcon from "@/components/icons/GithubIcon";

export default function ProfileForm({
    user,
    currentSkillsString,
}: {
    user: any;
    currentSkillsString: string;
}) {
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [githubUrl, setGithubUrl] = useState(user.github_url || "bhargavaalapati");
    const [role, setRole] = useState(user.role || "Developer");
    const [bio, setBio] = useState(user.bio || "");
    const [skillsInput, setSkillsInput] = useState(currentSkillsString || "");

    const [verification, setVerification] = useState<SkillVerificationResult | null>(
        user.trust_score
            ? {
                  overall_trust_score: user.trust_score,
                  verified_badges: user.verified_badges || [],
                  architectural_strength: user.architectural_strength || "",
                  recommended_role: user.ai_recommended_role || user.role || "",
              }
            : null
    );

    async function handleVerifySkills() {
        const parsedSkills = skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        if (parsedSkills.length === 0) {
            toast.error("Please enter at least one technical skill to verify.");
            return;
        }

        setVerifying(true);
        try {
            const res = await verifyDeveloperSkills(githubUrl, parsedSkills, bio);
            if (res.success && res.data) {
                setVerification(res.data);
                if (res.data.recommended_role) {
                    setRole(res.data.recommended_role);
                }
                toast.success(
                    `Telemetry verified! Overall Trust Score: ${res.data.overall_trust_score}%`
                );
            }
        } catch (error) {
            console.error(error);
            toast.error("Skill verification failed.");
        } finally {
            setVerifying(false);
        }
    }

    async function handleAction(formData: FormData) {
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success("Developer telemetry & AI trust badges synchronized!");
        } catch (error) {
            toast.error("Failed to synchronize telemetry.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleAction} className="grid gap-5 w-full min-w-0">
            {verification && (
                <input
                    type="hidden"
                    name="verification_json"
                    value={JSON.stringify(verification)}
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="grid gap-1.5 min-w-0">
                    <Label htmlFor="branch" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Academic Branch
                    </Label>
                    <Input
                        id="branch"
                        name="branch"
                        defaultValue={user.branch || ""}
                        placeholder="e.g., ECE / CSE"
                    />
                </div>
                <div className="grid gap-1.5 min-w-0">
                    <Label htmlFor="graduation_year" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Graduation Year
                    </Label>
                    <Input
                        id="graduation_year"
                        name="graduation_year"
                        type="number"
                        defaultValue={user.graduation_year || 2026}
                        placeholder="e.g., 2026"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="grid gap-1.5 min-w-0">
                    <Label htmlFor="github_url" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <GithubIcon className="h-3.5 w-3.5 shrink-0" /> GitHub Handle
                    </Label>
                    <Input
                        id="github_url"
                        name="github_url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="e.g., bhargavaalapati"
                    />
                </div>
                <div className="grid gap-1.5 min-w-0">
                    <Label htmlFor="role" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Primary Enterprise Role
                    </Label>
                    <Input
                        id="role"
                        name="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g., Full-Stack GenAI Engineer"
                        maxLength={80}
                    />
                </div>
            </div>

            <div className="grid gap-1.5 min-w-0">
                <Label htmlFor="bio" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                    Developer Bio & Architecture Summary
                </Label>
                <Input
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="e.g., Full-Stack & GenAI Engineer building agentic microservices."
                    maxLength={300}
                />
            </div>

            <div className="grid gap-1.5 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor="tech_skills" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Technical Skills (Comma separated)
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleVerifySkills}
                        disabled={verifying}
                        className="h-7 text-xs gap-1.5 shrink-0"
                    >
                        {verifying ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                Auditing GitHub...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                Verify Skills with AI
                            </>
                        )}
                    </Button>
                </div>
                <Input
                    id="tech_skills"
                    name="tech_skills"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g., Next.js, FastAPI, Python, MongoDB, Docker"
                />
            </div>

            {/* COMPACT, NON-OVERFLOWING AI TELEMETRY SUMMARY BAR */}
            {verification && (
                <div className="rounded-lg border bg-muted/30 p-3.5 space-y-3 min-w-0 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="text-xs font-bold truncate">
                                AI Verified Trust Score: {verification.overall_trust_score}%
                            </span>
                            {verification.recommended_role && (
                                <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex gap-1">
                                    <Award className="h-3 w-3 text-amber-500" />
                                    {verification.recommended_role}
                                </Badge>
                            )}
                        </div>

                        {/* Popout Modal for Detailed Skill Evidence */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1">
                                    <Eye className="h-3 w-3" /> View Audit Report
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[82vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-lg">
                                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                        AI Competency & GitHub Audit Report
                                    </DialogTitle>
                                    <DialogDescription>
                                        {verification.architectural_strength}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                    {verification.verified_badges?.map((badge, idx) => (
                                        <div key={idx} className="rounded-lg border bg-card p-3 space-y-1.5">
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="flex items-center gap-1.5 truncate">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                    {badge.skill}
                                                </span>
                                                <span className="text-muted-foreground shrink-0">
                                                    {badge.confidence_score}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${
                                                        badge.confidence_score >= 75
                                                            ? "bg-emerald-500"
                                                            : badge.confidence_score >= 50
                                                            ? "bg-amber-500"
                                                            : "bg-slate-500"
                                                    }`}
                                                    style={{ width: `${badge.confidence_score}%` }}
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                {badge.evidence}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Compact Inline Skill Confidence Pills */}
                    <div className="flex flex-wrap gap-1.5">
                        {verification.verified_badges?.map((badge, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="text-[11px] bg-background font-medium gap-1.5 py-0.5"
                            >
                                <span>{badge.skill}</span>
                                <span
                                    className={
                                        badge.confidence_score >= 75
                                            ? "text-emerald-500 font-bold"
                                            : badge.confidence_score >= 50
                                            ? "text-amber-500 font-bold"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {badge.confidence_score}%
                                </span>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <Button type="submit" disabled={loading || verifying} className="w-full">
                {loading ? "Synchronizing Telemetry..." : "Save Verified Telemetry"}
            </Button>
        </form>
    );
}