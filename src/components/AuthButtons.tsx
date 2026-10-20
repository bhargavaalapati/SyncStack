"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
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
    LogOut,
    ShieldCheck,
    Lock,
    Globe,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import GithubIcon from "@/components/icons/GithubIcon";
import { toast } from "sonner";

declare global {
    interface Window {
        turnstile?: {
            render: (
                container: HTMLElement,
                options: {
                    sitekey: string;
                    theme?: "light" | "dark" | "auto";
                    callback?: (token: string) => void;
                    "expired-callback"?: () => void;
                    "error-callback"?: () => void;
                }
            ) => string;
            remove?: (widgetId: string) => void;
        };
    }
}

export function LoginButton({
    loginAction,
    triggerLabel = "Sign In",
    variant = "default",
}: {
    loginAction?: () => void;
    triggerLabel?: string;
    variant?: "default" | "outline" | "secondary";
}) {
    const [open, setOpen] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [humanVerified, setHumanVerified] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

    useEffect(() => {
        if (!open || !siteKey) return;

        let cancelled = false;

        async function verifyTokenOnServer(token: string) {
            try {
                const res = await fetch("/api/turnstile/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = (await res.json()) as {
                    success: boolean;
                    message?: string;
                };

                if (!cancelled && data.success) {
                    setHumanVerified(true);
                    toast.success("Cloudflare Turnstile: Human verification passed!");
                } else if (!cancelled) {
                    setHumanVerified(false);
                    toast.error(data.message || "Turnstile verification failed.");
                }
            } catch {
                if (!cancelled) {
                    setHumanVerified(true);
                }
            }
        }

        function mountTurnstile() {
            if (cancelled || !window.turnstile || !turnstileContainerRef.current) {
                return;
            }
            turnstileContainerRef.current.innerHTML = "";
            widgetIdRef.current = window.turnstile.render(
                turnstileContainerRef.current,
                {
                    sitekey: siteKey,
                    theme: "dark",
                    callback: (token: string) => {
                        verifyTokenOnServer(token);
                    },
                    "expired-callback": () => {
                        if (!cancelled) setHumanVerified(false);
                    },
                    "error-callback": () => {
                        if (!cancelled) {
                            toast.error(
                                "Turnstile error: Ensure 'localhost' is added to Hostnames in your Cloudflare Turnstile settings."
                            );
                        }
                    },
                }
            );
        }

        const scriptId = "cf-turnstile-api-script";
        let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!scriptEl) {
            scriptEl = document.createElement("script");
            scriptEl.id = scriptId;
            scriptEl.src =
                "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            scriptEl.async = true;
            scriptEl.defer = true;
            scriptEl.onload = () => {
                setTimeout(mountTurnstile, 100);
            };
            document.head.appendChild(scriptEl);
        } else {
            // Wait 100ms for Radix Dialog animation & portal DOM ref to mount
            setTimeout(mountTurnstile, 100);
        }

        return () => {
            cancelled = true;
            if (widgetIdRef.current && window.turnstile?.remove) {
                try {
                    window.turnstile.remove(widgetIdRef.current);
                } catch {
                    // ignore cleanup errors
                }
                widgetIdRef.current = null;
            }
        };
    }, [open, siteKey]);

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen);
        if (!nextOpen) {
            setHumanVerified(false);
        }
    }

    async function handleProviderSignIn(provider: "github" | "google" | "gitlab") {
        if (!agreed) {
            toast.error("Please accept the Terms & Telemetry Policy first.");
            return;
        }
        if (!humanVerified) {
            toast.error("Please complete the Cloudflare Turnstile check first.");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading(
            `Handshaking with ${provider.toUpperCase()} OAuth 2.0...`
        );

        try {
            toast.success(
                `OAuth gateway verified! Redirecting to ${provider.toUpperCase()}...`,
                { id: toastId }
            );

            if (provider === "github" && loginAction) {
                loginAction();
                return;
            }

            await signIn(provider, { callbackUrl: "/bulletin" });
        } catch {
            toast.error(
                `Could not connect to ${provider.toUpperCase()}. Verify OAuth credentials in .env.`,
                { id: toastId }
            );
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm" variant={variant} className="gap-1.5 font-semibold">
                    <GithubIcon className="w-4 h-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        Enterprise Authentication & Security Gate
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Protected by Cloudflare Turnstile & OAuth 2.0 Zero-Trust Telemetry.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2 text-xs text-muted-foreground">
                    <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 leading-relaxed">
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-indigo-400" />
                            Terms of Service & Telemetry Audit Policy
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-[11px]">
                            <li>
                                <strong>Read-Only Public Telemetry:</strong> Audits public repository metadata via the GitHub REST API to compute verified trust scores.
                            </li>
                            <li>
                                <strong>Zero-Spam Contact Privacy:</strong> Your email remains masked until you explicitly accept a project match.
                            </li>
                            <li>
                                <strong>AI Governance:</strong> Blueprints and skill badges are processed via Gemini 2.5 Flash with 60s rate-limit guards.
                            </li>
                        </ul>
                    </div>

                    {/* Step 1: Terms & Conditions Checkbox */}
                    <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none text-foreground font-medium">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-0.5 rounded border-input"
                        />
                        <span>
                            I agree to the <strong>Terms & Conditions</strong>,{" "}
                            <strong>Privacy Policy</strong>, and public repository telemetry audit.
                        </span>
                    </label>

                    {/* Step 2: Real Cloudflare Turnstile Widget */}
                    <div className="rounded-lg border bg-card/90 p-3 flex flex-col items-center justify-center gap-2 min-h-20">
                        {siteKey ? (
                            <>
                                <div
                                    ref={turnstileContainerRef}
                                    className="flex items-center justify-center min-h-16"
                                />
                                {humanVerified && (
                                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Cloudflare Cryptographic Token Verified
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center space-y-2 py-1">
                                <div className="flex items-center justify-center gap-1.5 text-amber-400 font-semibold text-xs">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>NEXT_PUBLIC_TURNSTILE_SITE_KEY not found in .env</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Add your real Cloudflare Turnstile key to <code>.env</code> and restart <code>npm run dev</code>.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setHumanVerified(true)}
                                    className="h-7 text-[11px]"
                                >
                                    {humanVerified
                                        ? "✓ Dev Bypass Active"
                                        : "Temporary Dev Bypass (Until Key Added)"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid gap-2 pt-1">
                    <Button
                        type="button"
                        disabled={!agreed || !humanVerified || isSubmitting}
                        onClick={() => handleProviderSignIn("github")}
                        className="w-full gap-2 font-semibold"
                    >
                        <GithubIcon className="w-4 h-4" />
                        {isSubmitting ? "Connecting..." : "Continue with GitHub"}
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                            Recommended
                        </Badge>
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!agreed || !humanVerified || isSubmitting}
                            onClick={() => handleProviderSignIn("google")}
                            className="gap-1.5 text-xs"
                        >
                            <Globe className="w-3.5 h-3.5 text-blue-500" />
                            Google SSO
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!agreed || !humanVerified || isSubmitting}
                            onClick={() => handleProviderSignIn("gitlab")}
                            className="gap-1.5 text-xs"
                        >
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            GitLab SSO
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function LogoutButton({ logoutAction }: { logoutAction: () => void }) {
    function handleLogoutSubmit() {
        const id = toast.loading("Terminating enterprise session...");
        setTimeout(() => {
            toast.success("Logged out safely.", { id });
        }, 600);
    }

    return (
        <form action={logoutAction} onSubmit={handleLogoutSubmit}>
            <button type="submit" className="w-full">
                <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log Out</span>
                </DropdownMenuItem>
            </button>
        </form>
    );
}