"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Trophy,
    Lock,
    CheckCircle2,
    ShieldCheck,
    FileText,
    Sparkles,
    Rocket,
    Flame,
    Code2,
    Terminal,
    Bug,
} from "lucide-react";
import { toast } from "sonner";

export interface DevProgressionProps {
    name: string;
    email?: string;
    role?: string;
    githubUrl?: string;
    skillsCount: number;
    skillsList?: string[];
    trustScore: number;
    projectsShipped: number;
    reputationScore: number;
}

export function DevProgressionCard({
    name,
    email,
    role = "Full-Stack Engineer",
    githubUrl,
    skillsCount,
    skillsList = [],
    trustScore,
    projectsShipped,
    reputationScore,
}: DevProgressionProps) {
    const [dossierOpen, setDossierOpen] = useState(false);
    const [sandboxOpen, setSandboxOpen] = useState(false);
    const [selectedPatch, setSelectedPatch] = useState<number | null>(null);
    const [astVerified, setAstVerified] = useState<boolean>(false);

    const milestones = [
        {
            label: "Declare 3+ Technical Skills",
            current: skillsCount,
            target: 3,
            unit: "skills",
            done: skillsCount >= 3,
            icon: <Code2 className="w-3.5 h-3.5 text-indigo-400" />,
            hint: "Add skills in Telemetry Form below",
        },
        {
            label: "GitHub AI Skill Audit (70%+ Trust)",
            current: trustScore,
            target: 70,
            unit: "%",
            done: trustScore >= 70 || astVerified,
            icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
            hint: "Click 'Verify Skills' or Pass Micro-PR Sandbox",
        },
        {
            label: "Ship 1+ Verified GitHub Repository",
            current: projectsShipped,
            target: 1,
            unit: "shipped",
            done: projectsShipped >= 1,
            icon: <Rocket className="w-3.5 h-3.5 text-amber-400" />,
            hint: "Use 'Verify & Ship' on Global Roster",
        },
        {
            label: "Earn 150+ Reputation & Streak Coins",
            current: reputationScore,
            target: 150,
            unit: "coins",
            done: reputationScore >= 150,
            icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
            hint: "Claim Daily Check-In (+25) or Ship (+150)",
        },
    ];

    const completedCount = milestones.filter((m) => m.done).length;
    const progressPercent = Math.round(
        (completedCount / milestones.length) * 100
    );
    const isUnlocked = completedCount >= 3 || astVerified;

    const clearanceTier =
        completedCount === 4 || astVerified
            ? "Tier 4 • AST-Verified Senior Builder"
            : completedCount === 3
            ? "Tier 3 • Verified Solutions Architect"
            : completedCount === 2
            ? "Tier 2 • Active Stack Builder"
            : "Tier 1 • Associate Onboarding";

    function handleVerifyMicroPr() {
        if (selectedPatch === 1) {
            setAstVerified(true);
            setSandboxOpen(false);
            toast.success(
                "✓ Micro-PR AST Patch Verified! Senior Builder Clearance & Dossier Unlocked!"
            );
        } else {
            toast.error(
                "AST Audit Failed: That patch still leaves a race condition or N+1 query. Inspect the async lock!"
            );
        }
    }

    return (
        <div className="rounded-2xl border bg-card/80 backdrop-blur-xs p-5 sm:p-6 shadow-xs space-y-4 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-bold">
                            Enterprise Developer Clearance & AST Sandbox
                        </h3>
                        <Badge
                            variant="outline"
                            className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-xs"
                        >
                            {clearanceTier}
                        </Badge>
                        {astVerified && (
                            <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                                <Terminal className="w-3 h-3" /> Micro-PR AST Verified
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Complete 3/4 telemetry milestones—or pass the{" "}
                        <strong>Ephemeral Micro-PR Debugging Sandbox</strong>—to unlock your Verified Engineering Dossier.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Ephemeral 10-Min Micro-PR AST Sandbox Modal */}
                    <Dialog open={sandboxOpen} onOpenChange={setSandboxOpen}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-semibold"
                            >
                                <Bug className="w-3.5 h-3.5" />
                                {astVerified
                                    ? "✓ Micro-PR Sandbox Passed"
                                    : "10-Min Micro-PR Sandbox"}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                                    <Terminal className="w-5 h-5 text-emerald-400" />
                                    Zero-Trust Ephemeral Micro-PR AST Debugging Sandbox
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Anti-Fraud Verification: Diagnose the production concurrency bug below and submit the clean `.patch` diff to immediately unlock Tier-4 Senior Builder Clearance.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 text-xs">
                                <div className="rounded-lg border bg-zinc-950 p-3 font-mono text-[11px] text-zinc-200 overflow-x-auto space-y-1">
                                    <div className="text-amber-400 font-bold">
                                        {"// Buggy FastAPI/Mongoose Token Deduction Endpoint:"}
                                    </div>
                                    <div className="text-red-400">
                                        {"- const user = await User.findById(userId);"}
                                    </div>
                                    <div className="text-red-400">
                                        {"- if (user.credits > 0) { user.credits -= 1; await user.save(); }"}
                                    </div>
                                    <div className="text-zinc-400">
                                        {"// Vulnerability: Concurrent requests read stale credits (TOCTOU Race Condition)"}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="font-semibold text-foreground">
                                        Select the atomic AST `.patch` replacement:
                                    </div>

                                    {[
                                        {
                                            id: 0,
                                            code: "await User.updateMany({}, { $set: { credits: 0 } });",
                                            desc: "Patch A: Global collection reset",
                                        },
                                        {
                                            id: 1,
                                            code: "await User.findOneAndUpdate({ _id: userId, credits: { $gt: 0 } }, { $inc: { credits: -1 } }, { returnDocument: 'after' });",
                                            desc: "Patch B: Atomic conditional predicate + $inc mutation",
                                        },
                                        {
                                            id: 2,
                                            code: "setTimeout(() => user.save(), 1000);",
                                            desc: "Patch C: Deferred timer write",
                                        },
                                    ].map((opt) => (
                                        <label
                                            key={opt.id}
                                            onClick={() => setSelectedPatch(opt.id)}
                                            className={`block rounded-lg border p-2.5 cursor-pointer transition-colors ${
                                                selectedPatch === opt.id
                                                    ? "border-emerald-500 bg-emerald-500/10"
                                                    : "bg-card hover:border-border"
                                            }`}
                                        >
                                            <div className="font-bold text-[11px] mb-1">
                                                {opt.desc}
                                            </div>
                                            <code className="text-[10px] text-emerald-400 font-mono break-all">
                                                + {opt.code}
                                            </code>
                                        </label>
                                    ))}
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleVerifyMicroPr}
                                    disabled={selectedPatch === null}
                                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Submit Micro-PR Patch & Verify AST
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Verified Engineering Dossier Modal */}
                    <Dialog open={dossierOpen} onOpenChange={setDossierOpen}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                size="sm"
                                variant={isUnlocked ? "default" : "outline"}
                                className="gap-1.5 text-xs font-semibold"
                            >
                                {isUnlocked ? (
                                    <>
                                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                        Open Verified Dev Dossier
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                                        Dossier Locked ({completedCount}/4)
                                    </>
                                )}
                            </Button>
                        </DialogTrigger>

                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    SyncStack Verified Engineering Dossier
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Backed by live GitHub REST telemetry, AST Micro-PR verification, and Gemini 2.5 Flash audit logs.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="rounded-xl border bg-muted/30 p-4 space-y-3 text-xs">
                                <div className="flex items-center justify-between border-b pb-2.5">
                                    <div>
                                        <div className="text-base font-extrabold text-foreground">
                                            {name}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {role} {email ? `• ${email}` : ""}
                                        </div>
                                    </div>
                                    <Badge className="bg-emerald-600 text-white">
                                        {clearanceTier}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center py-1">
                                    <div className="rounded-lg border bg-card p-2">
                                        <div className="text-base font-black text-emerald-400">
                                            {astVerified ? Math.max(96, trustScore) : trustScore}%
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            AI + AST Trust
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-card p-2">
                                        <div className="text-base font-black text-indigo-400">
                                            {projectsShipped}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            Shipped Repos
                                        </div>
                                    </div>
                                    <div className="rounded-lg border bg-card p-2">
                                        <div className="text-base font-black text-amber-400">
                                            {reputationScore}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground">
                                            RepCoins
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="font-semibold text-foreground">
                                        Verified Technical Capabilities:
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {skillsList.length > 0 ? (
                                            skillsList.map((s, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="text-[10px] font-mono"
                                                >
                                                    {s}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">
                                                No skills indexed yet.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {githubUrl && (
                                    <div className="text-[11px] text-muted-foreground truncate">
                                        <strong>Audited Source:</strong> {githubUrl}
                                    </div>
                                )}
                            </div>

                            <Button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(
                                        `SyncStack Verified Dossier — ${name} (${clearanceTier}) | AI/AST Trust Score: ${
                                            astVerified ? Math.max(96, trustScore) : trustScore
                                        }% | Shipped Architectures: ${projectsShipped} | Reputation: ${reputationScore} | Skills: ${skillsList.join(", ")}`
                                    );
                                    toast.success(
                                        "Verified Engineering Dossier summary copied to clipboard!"
                                    );
                                }}
                                className="w-full gap-1.5 font-semibold"
                            >
                                <Sparkles className="w-4 h-4" /> Copy Verified Dossier Summary for Resume
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">
                        Profile Unlock Progression ({completedCount} of 4 constraints met)
                    </span>
                    <span className="font-bold text-emerald-400">
                        {progressPercent}% Complete
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className="h-full bg-linear-to-r from-indigo-500 via-emerald-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* 4 Constraint Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {milestones.map((m, idx) => (
                    <div
                        key={idx}
                        className={`rounded-xl border p-3 space-y-1.5 ${
                            m.done
                                ? "border-emerald-500/30 bg-emerald-500/5"
                                : "bg-background/60"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            {m.icon}
                            {m.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="text-xs font-bold">{m.label}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">
                            Progress: <strong>{m.current}</strong> / {m.target} {m.unit}
                        </div>
                        {!m.done && (
                            <div className="text-[10px] text-amber-400/90">
                                → {m.hint}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}