"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getTeammateSuggestions } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Sparkles,
    Loader2,
    Timer,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    Briefcase,
    RefreshCw,
} from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { toast } from "sonner";
import { AiQuotaNotice, useAiCooldown } from "@/components/ui/AiQuotaNotice";

interface CandidateMatchItem {
    name?: string;
    synergy_score?: number;
    compatibility_score?: number;
    role_fit?: string;
    ai_icebreaker_pitch?: string;
    reasoning?: string;
    rationale?: string;
    matching_strengths?: string[];
    matching_skills?: string[];
    skill_gaps?: string[];
    missing_skills?: string[];
    user?: {
        name?: string;
        image?: string;
        github_url?: string;
        trust_score?: number;
    };
}

export default function SuggestTeammates({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<CandidateMatchItem[]>([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const { isCoolingDown, remainingSeconds, triggerCooldown } = useAiCooldown(
        `ai_match_${projectId}`,
        60
    );

    const [cooldown, setCooldown] = useState(0);
    const [failureCount, setFailureCount] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    async function handleFetchSuggestions(forceRefresh = false) {
        if ((!forceRefresh && hasFetched) || cooldown > 0) return;
        if (forceRefresh && isCoolingDown) {
            toast.error(`Please wait ${remainingSeconds}s before re-running live AI matchmaking.`);
            return;
        }

        setLoading(true);
        try {
            const results = (await getTeammateSuggestions(projectId)) as CandidateMatchItem[];
            setMatches(results);
            setHasFetched(true);
            setFailureCount(0);
            if (forceRefresh) {
                triggerCooldown();
                toast.success("Synergy rankings refreshed via AI Engine!");
            }
        } catch (error: unknown) {
            const currentFailures = failureCount + 1;
            setFailureCount(currentFailures);

            const baseCooldown = 60;
            const penaltyMultiplier = Math.pow(2, currentFailures - 1);
            let nextCooldown = baseCooldown * penaltyMultiplier;
            if (nextCooldown > 300) nextCooldown = 300;

            setCooldown(nextCooldown);
            setOpen(false);

            toast.error("AI Engine Overloaded", {
                description: `Retrying is locked for ${nextCooldown}s to balance loads.`,
            });
            console.error("Matchmaking failed:", error);
        } finally {
            setLoading(false);
        }
    }

    function handleCopyPitch(pitch: string, idx: number) {
        navigator.clipboard.writeText(pitch);
        setCopiedIdx(idx);
        toast.success("AI recruitment pitch copied to clipboard!");
        setTimeout(() => setCopiedIdx(null), 2000);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (cooldown > 0) return;
                setOpen(isOpen);
                if (isOpen) handleFetchSuggestions(false);
            }}
        >
            <DialogTrigger asChild>
                {cooldown > 0 ? (
                    <Button
                        size="sm"
                        variant="destructive"
                        disabled
                        className="gap-1.5 opacity-90"
                    >
                        <Timer className="w-3.5 h-3.5 animate-pulse" />
                        Cooldown ({cooldown}s)
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-medium shadow-xs"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Match
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-3xl min-w-85 max-h-[88vh] min-h-100 resize overflow-auto p-6 sm:p-8">
                <DialogHeader className="border-b pb-4 pr-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">
                                    Explainable Multi-Vector Matchmaking
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Evaluating semantic skill synergy, role complementarity, and verified GitHub trust telemetry.
                                </DialogDescription>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={loading || isCoolingDown}
                            onClick={() => handleFetchSuggestions(true)}
                            className="h-8 text-xs gap-1.5"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                            {isCoolingDown
                                ? `Cooldown (${remainingSeconds}s)`
                                : "Re-Run AI Match"}
                        </Button>
                    </div>
                </DialogHeader>

                {/* AI Hallucination & 60s Rate-Limit Disclaimer Banner */}
                <AiQuotaNotice
                    featureName="Multi-Vector AI Matchmaker"
                    cooldownRemaining={remainingSeconds}
                />

                <div className="py-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-amber-500" />
                            <p className="text-sm font-medium">
                                Computing multi-vector synergy & auditing developer portfolios...
                            </p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground text-sm">
                            No candidate profiles available in the talent pool yet.
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {matches.map((match, idx) => {
                                const score =
                                    match.synergy_score ?? match.compatibility_score ?? 75;
                                const rationale =
                                    match.ai_icebreaker_pitch ||
                                    match.reasoning ||
                                    match.rationale ||
                                    "Strong architectural alignment with project requirements.";
                                const matchingSkills: string[] =
                                    match.matching_strengths || match.matching_skills || [];
                                const missingSkills: string[] =
                                    match.skill_gaps || match.missing_skills || [];
                                const trustScore = match.user?.trust_score;

                                return (
                                    <div
                                        key={idx}
                                        className="border rounded-xl p-5 bg-card/70 shadow-xs space-y-4 hover:border-primary/40 transition-colors"
                                    >
                                        <div className="flex flex-wrap justify-between items-start gap-4">
                                            <div className="flex items-center gap-3 min-w-0">
                                                {match.user?.image ? (
                                                    <Image
                                                        src={match.user.image}
                                                        width={44}
                                                        height={44}
                                                        unoptimized
                                                        alt="avatar"
                                                        className="w-11 h-11 rounded-full border shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-muted flex items-center justify-center font-bold shrink-0">
                                                        {match.user?.name?.charAt(0) || "U"}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="font-bold text-base truncate">
                                                            {match.user?.name || match.name}
                                                        </h4>
                                                        {match.role_fit && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-[10px] gap-1"
                                                            >
                                                                <Briefcase className="w-3 h-3 text-indigo-400" />
                                                                {match.role_fit}
                                                            </Badge>
                                                        )}
                                                        {trustScore ? (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-[10px] border-emerald-500/30 text-emerald-500 gap-1"
                                                            >
                                                                <ShieldCheck className="w-3 h-3" />
                                                                {trustScore}% Verified
                                                            </Badge>
                                                        ) : null}
                                                    </div>
                                                    {match.user?.github_url && (
                                                        <a
                                                            href={
                                                                match.user.github_url.startsWith("http")
                                                                    ? match.user.github_url
                                                                    : `https://github.com/${match.user.github_url}`
                                                            }
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary mt-0.5"
                                                        >
                                                            <GithubIcon className="w-3 h-3" /> GitHub Telemetry
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <div className="text-right">
                                                    <span
                                                        className={`text-2xl font-black ${
                                                            score >= 80
                                                                ? "text-emerald-500"
                                                                : score >= 55
                                                                ? "text-amber-500"
                                                                : "text-red-500"
                                                        }`}
                                                    >
                                                        {score}%
                                                    </span>
                                                    <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                                        Synergy
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-lg bg-muted/40 p-3.5 border border-border/60 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                    AI Match Rationale & Recruitment Pitch
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs gap-1"
                                                    onClick={() => handleCopyPitch(rationale, idx)}
                                                >
                                                    {copiedIdx === idx ? (
                                                        <Check className="w-3 h-3 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="w-3 h-3" />
                                                    )}
                                                    {copiedIdx === idx ? "Copied" : "Copy Pitch"}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-foreground/90 leading-relaxed">
                                                {rationale}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                            <div className="space-y-1.5">
                                                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Matching Strengths
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {matchingSkills.length > 0 ? (
                                                        matchingSkills.map((s, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant="outline"
                                                                className="text-[10px] border-emerald-500/30 bg-emerald-500/5"
                                                            >
                                                                {s}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            General engineering fit
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Skill Gaps / Ramp-Up Areas
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {missingSkills.length > 0 ? (
                                                        missingSkills.map((s, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant="outline"
                                                                className="text-[10px] border-amber-500/30 bg-amber-500/5"
                                                            >
                                                                {s}
                                                            </Badge>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">
                                                            100% stack coverage
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}