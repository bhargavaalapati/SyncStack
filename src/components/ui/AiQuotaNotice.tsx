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
import { Badge } from "@/components/ui/badge";
import { Info, ShieldAlert, AlertTriangle, CheckCircle2, Timer } from "lucide-react";

/**
 * Shared 60-second anti-spam cooldown hook for all AI buttons.
 * Persists across modal re-opens using sessionStorage.
 */
export function useAiCooldown(actionKey: string, cooldownSeconds = 60) {
    const storageKey = `syncstack_cooldown_${actionKey}`;
    const [remaining, setRemaining] = useState<number>(0);

    useEffect(() => {
        const checkTimer = () => {
            const expiresAt = Number(window.sessionStorage.getItem(storageKey) || "0");
            const diff = Math.ceil((expiresAt - Date.now()) / 1000);
            setRemaining(diff > 0 ? diff : 0);
        };

        checkTimer();
        const interval = setInterval(checkTimer, 1000);
        return () => clearInterval(interval);
    }, [storageKey]);

    function triggerCooldown() {
        const expiresAt = Date.now() + cooldownSeconds * 1000;
        window.sessionStorage.setItem(storageKey, String(expiresAt));
        setRemaining(cooldownSeconds);
    }

    return {
        isCoolingDown: remaining > 0,
        remainingSeconds: remaining,
        triggerCooldown,
    };
}

export function AiQuotaNotice({
    featureName = "Gemini 2.5 Flash Engine",
    cooldownRemaining = 0,
}: {
    featureName?: string;
    cooldownRemaining?: number;
}) {
    const [open, setOpen] = useState(false);
    const [acknowledged, setAcknowledged] = useState(false);

    function handleOpenChange(nextOpen: boolean) {
        if (nextOpen && typeof window !== "undefined") {
            const saved = window.sessionStorage.getItem("syncstack_ai_quota_ack");
            if (saved === "true") {
                setAcknowledged(true);
            }
        }
        setOpen(nextOpen);
    }

    function handleAcknowledge() {
        if (acknowledged && typeof window !== "undefined") {
            window.sessionStorage.setItem("syncstack_ai_quota_ack", "true");
        }
        setOpen(false);
    }

    return (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[11px] text-muted-foreground space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>
                        <strong>AI Disclaimer:</strong> SyncStack uses AI and may occasionally hallucinate or make mistakes—verify critical specs.
                    </span>
                </span>

                <div className="flex items-center gap-2">
                    {cooldownRemaining > 0 && (
                        <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500/40 text-amber-400 gap-1"
                        >
                            <Timer className="h-3 w-3" /> Cooldown: {cooldownRemaining}s
                        </Badge>
                    )}

                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <button
                                type="button"
                                className="text-amber-500 hover:underline font-semibold shrink-0 inline-flex items-center gap-1"
                            >
                                <Info className="h-3 w-3" /> Rate-Limit Policy
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-base">
                                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                                    Free-Tier AI Rate-Limit & Accuracy Notice
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Operational governance for {featureName}:
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed py-2">
                                <div className="rounded-lg border bg-card p-3 space-y-1">
                                    <div className="font-semibold text-foreground flex items-center justify-between">
                                        <span>1. 60-Second Anti-Spam Cooldown</span>
                                        <Badge
                                            variant="outline"
                                            className="text-[10px] text-amber-500 border-amber-500/30"
                                        >
                                            5 RPM Guard
                                        </Badge>
                                    </div>
                                    <p>
                                        To protect Free-Tier Gemini API credits from spam, live AI generation buttons enforce a <strong>60-second cooldown</strong> between non-cached requests. Cached SHA-256 blueprints load instantly at 0 cost.
                                    </p>
                                </div>

                                <div className="rounded-lg border bg-card p-3 space-y-1">
                                    <div className="font-semibold text-foreground">
                                        2. Hallucination & Manual Override Disclaimer
                                    </div>
                                    <p>
                                        Generative AI models can occasionally produce inaccurate estimates or edge-case syntax. Always review generated architectures and use manual field editing if rate limits are reached.
                                    </p>
                                </div>

                                <label className="flex items-start gap-2 pt-2 cursor-pointer select-none text-foreground font-medium">
                                    <input
                                        type="checkbox"
                                        checked={acknowledged}
                                        onChange={(e) => setAcknowledged(e.target.checked)}
                                        className="mt-0.5 rounded border-input"
                                    />
                                    <span>
                                        I understand the AI accuracy disclaimer and 60s rate-limit cooldown policy.
                                    </span>
                                </label>
                            </div>

                            <Button
                                type="button"
                                size="sm"
                                disabled={!acknowledged}
                                onClick={handleAcknowledge}
                                className="w-full gap-1.5"
                            >
                                <CheckCircle2 className="h-4 w-4" /> Acknowledge & Continue
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}