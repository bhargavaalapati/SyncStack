"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Rocket,
    ShieldCheck,
    ExternalLink,
    Loader2,
    Sparkles,
    Zap,
    Lock,
} from "lucide-react";
import {
    shipProjectWithAiVerification,
    claimDailyLoginStreak,
} from "@/actions/ship";
import { LoginButton } from "@/components/AuthButtons";
import { AiQuotaNotice, useAiCooldown } from "@/components/ui/AiQuotaNotice";
import { toast } from "sonner";

export interface UserProjectOption {
    _id: string;
    title: string;
}

export function ShipProjectDialog({
    userProjects = [],
    isAuthenticated = false,
}: {
    userProjects?: UserProjectOption[];
    isAuthenticated?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [claimingDaily, setClaimingDaily] = useState(false);
    const [dailyClaimed, setDailyClaimed] = useState(false);
    const { isCoolingDown, remainingSeconds, triggerCooldown } = useAiCooldown(
        "ship_audit",
        60
    );

    const todayStorageKey = `syncstack_daily_checkin_${new Date().toISOString().slice(0, 10)}`;

    // Persist Daily Claimed status across page refreshes
    useEffect(() => {
        if (typeof window !== "undefined") {
            const alreadyDone = window.localStorage.getItem(todayStorageKey);
            if (alreadyDone === "true") {
                setDailyClaimed(true);
            }
        }
    }, [todayStorageKey]);

    async function handleDailyCheckIn() {
        if (!isAuthenticated) {
            toast.error("Please sign in first to claim your Daily Login RepCoins & Streak!");
            setOpen(true);
            return;
        }
        if (dailyClaimed) {
            toast.info("You already claimed today's +25 RepCoins! Come back tomorrow.");
            return;
        }

        setClaimingDaily(true);
        const toastId = toast.loading("Verifying daily login telemetry...");
        const res = await claimDailyLoginStreak();
        setClaimingDaily(false);

        if (res.success) {
            setDailyClaimed(true);
            window.localStorage.setItem(todayStorageKey, "true");
            toast.success(res.message, { id: toastId });
        } else {
            if (res.alreadyClaimedToday) {
                setDailyClaimed(true);
                window.localStorage.setItem(todayStorageKey, "true");
            }
            toast.error(res.message, { id: toastId });
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (isCoolingDown) {
            toast.error(`Please wait ${remainingSeconds}s before running another repo audit.`);
            return;
        }

        setLoading(true);
        const toastId = toast.loading(
            "Auditing repository commits & telemetry via GitHub API..."
        );

        const formData = new FormData(e.currentTarget);
        const result = await shipProjectWithAiVerification(formData);

        setLoading(false);
        triggerCooldown();

        if (result.success) {
            toast.success(result.message, { id: toastId, duration: 5000 });
            setOpen(false);
        } else {
            toast.error(result.message, { id: toastId, duration: 5000 });
        }
    }

    return (
        <div className="flex flex-wrap items-center gap-2.5">
            <Button
                type="button"
                variant="outline"
                onClick={handleDailyCheckIn}
                disabled={claimingDaily || dailyClaimed}
                className="gap-1.5 border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-semibold"
            >
                <Zap className="w-4 h-4" />
                {dailyClaimed
                    ? "✓ Daily Streak Claimed (24h Lock)"
                    : "Daily Check-In (+25 Coins)"}
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm">
                        <Rocket className="w-4 h-4" />
                        Verify & Ship Project
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-lg">
                    {!isAuthenticated ? (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Lock className="w-5 h-5 text-amber-500" />
                                    Authentication Required to Ship & Earn Streaks
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Sign in with GitHub, Google, or GitLab to verify repositories, claim daily RepCoins, and appear on the Global Roster.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground space-y-3">
                                <p>
                                    To prevent unverified spam on the Global Roster, SyncStack links every shipped project and daily streak directly to an authenticated developer identity.
                                </p>
                                <div className="pt-1">
                                    <LoginButton triggerLabel="Sign In to Verify & Ship" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                                    <Rocket className="w-5 h-5 text-emerald-500" />
                                    Automated Production Shipping & Verification
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Submit your repository for live telemetry verification to earn{" "}
                                    <strong>+150 Reputation</strong>, increment your{" "}
                                    <strong>Shipped count</strong>, and extend your{" "}
                                    <strong>Global Contribution Streak</strong>.
                                </DialogDescription>
                            </DialogHeader>

                            <AiQuotaNotice
                                featureName="Automated GitHub Repo Auditor"
                                cooldownRemaining={remainingSeconds}
                            />

                            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold">
                                        Select Broadcasted Architecture (Optional)
                                    </label>
                                    <select
                                        name="projectId"
                                        className="h-10 w-full px-3 rounded-md border border-input bg-background text-sm"
                                        defaultValue="independent"
                                    >
                                        <option value="independent">
                                            Independent / Hackathon Build
                                        </option>
                                        {userProjects.map((proj) => (
                                            <option key={proj._id} value={proj._id}>
                                                {proj.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold flex items-center justify-between">
                                        <span>Public GitHub Repository URL *</span>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] text-emerald-400 border-emerald-500/30"
                                        >
                                            Live REST Audit
                                        </Badge>
                                    </label>
                                    <Input
                                        name="githubRepoUrl"
                                        required
                                        placeholder="https://github.com/bhargavaalapati/SyncStack"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold flex items-center gap-1">
                                        <span>Live Production URL (Vercel / Render)</span>
                                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                    </label>
                                    <Input
                                        name="liveDemoUrl"
                                        placeholder="https://syncstack.vercel.app"
                                    />
                                </div>

                                <div className="rounded-lg border border-indigo-500/25 bg-indigo-500/5 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                    <span>
                                        Our backend verifies that the repository is public, non-empty, and contains valid source code before awarding reputation points and lighting up your streak grid.
                                    </span>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || isCoolingDown}
                                    className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Auditing GitHub Telemetry...
                                        </>
                                    ) : isCoolingDown ? (
                                        <>Cooldown Active ({remainingSeconds}s)</>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Run Verification & Claim +150 Reputation
                                        </>
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}