"use client";

import { useState, useEffect } from "react";
import { getTeammateSuggestions } from "@/actions/ai";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Timer } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

export default function SuggestTeammates({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);
    const [hasFetched, setHasFetched] = useState(false);

    // Exponential Backoff State
    const [cooldown, setCooldown] = useState(0);
    const [failureCount, setFailureCount] = useState(0);

    // Countdown Timer Effect
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    async function handleFetchSuggestions() {
        if (hasFetched || cooldown > 0) return; // Block if cooling down or already fetched

        setLoading(true);
        try {
            const results = await getTeammateSuggestions(projectId);
            setMatches(results);
            setHasFetched(true);
            setFailureCount(0); // Reset failures on success!
        } catch (error: any) {
            // EXPONENTIAL BACKOFF LOGIC
            const currentFailures = failureCount + 1;
            setFailureCount(currentFailures);

            // Calculate penalty: 60s -> 120s -> 240s (Max 300s / 5 mins)
            const baseCooldown = 60;
            const penaltyMultiplier = Math.pow(2, currentFailures - 1);
            let nextCooldown = baseCooldown * penaltyMultiplier;

            if (nextCooldown > 300) nextCooldown = 300;

            setCooldown(nextCooldown);
            setOpen(false); // Force close the modal on error to show the red button

            toast.error("AI Engine Overloaded", {
                description: `Google Gemini is at capacity. Retrying is locked for ${nextCooldown}s to balance loads.`
            });

            console.error("Matchmaking failed:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (cooldown > 0) return; // Prevent opening if cooling down
            setOpen(isOpen);
            if (isOpen) handleFetchSuggestions();
        }}>
            <DialogTrigger asChild>
                {cooldown > 0 ? (
                    <Button size="sm" variant="destructive" disabled className="gap-2 opacity-90">
                        <Timer className="w-4 h-4 animate-pulse" />
                        Cooling Down ({cooldown}s)
                    </Button>
                ) : (
                    <Button size="sm" variant="secondary" className="gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        AI Match
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-150 max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                        Gemini Candidate Analysis
                    </DialogTitle>
                    <DialogDescription>
                        Evaluating semantic overlap between your architecture and campus developer portfolios.
                    </DialogDescription>
                </DialogHeader>

                {/* Shortened & Punchy Notice */}
                <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs leading-relaxed text-muted-foreground">
                    <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 mb-1.5 text-sm">
                        <Sparkles className="w-4 h-4" />
                        Algorithmic Execution Notice
                    </div>
                    <p className="mb-2">
                        Evaluates candidates using <strong>Semantic Space Overlap</strong> (functional capability vs. raw keywords).
                    </p>
                    <div className="flex items-center justify-between border-t border-amber-500/10 pt-2 mt-2 font-mono text-[10px] text-amber-700/80 dark:text-amber-400/70">
                        <span>API Rate Ceiling: 5 Req / Min</span>
                        <span className="bg-amber-500/10 px-1.5 py-0.5 rounded">Context Cache Active</span>
                    </div>
                </div>

                <div className="py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p>Analyzing developer repositories and tech stacks...</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No suitable candidates found in the pool yet.
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {matches.map((match, idx) => (
                                <div key={idx} className="border rounded-lg p-4 bg-card shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            {match.user?.image ? (
                                                <img src={match.user.image} alt="avatar" className="w-10 h-10 rounded-full border" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                                                    {match.user?.name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold">{match.user?.name}</h4>
                                                <a href={match.user?.github_url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary">
                                                    <FaGithub className="w-3 h-3" /> GitHub Profile
                                                </a>
                                            </div>
                                        </div>

                                        {/* Compatibility Score Badge */}
                                        <div className="flex flex-col items-end">
                                            <span className={`text-2xl font-black ${match.compatibility_score >= 80 ? 'text-green-500' : match.compatibility_score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {match.compatibility_score}%
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Match</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mt-3 bg-muted/50 p-3 rounded-md border border-border/50">
                                        <span className="font-semibold text-foreground">AI Rationale: </span>
                                        {match.rationale}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {match.user?.tech_skills?.map((skill: string, i: number) => (
                                            <Badge key={i} variant="outline" className="text-[10px]">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}