"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Info,
    Sparkles,
    ShieldAlert,
    Home,
    ArrowLeft,
    ChevronRight,
    Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/AuthButtons";

interface PageGuideBannerProps {
    currentPage?: string;
    title: string;
    description: string;
    howItWorks: string[];
    disclaimer: string;
    isAuthenticated: boolean;
}

export function PageGuideBanner({
    currentPage = "Workspace",
    title,
    description,
    howItWorks,
    disclaimer,
    isAuthenticated,
}: PageGuideBannerProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [backTarget, setBackTarget] = useState<{ path: string; label: string }>({
        path: "/",
        label: "Home",
    });

    // Track in-app navigation so "Back" always knows the exact previous page
    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedCurrent = window.sessionStorage.getItem("syncstack_curr_path");
        const storedPrev = window.sessionStorage.getItem("syncstack_prev_path");

        let resolvedPrev = storedPrev || "";
        if (storedCurrent && storedCurrent !== pathname) {
            resolvedPrev = storedCurrent;
            window.sessionStorage.setItem("syncstack_prev_path", storedCurrent);
        }
        window.sessionStorage.setItem("syncstack_curr_path", pathname);

        // Decide the smartest "Back" destination so it doesn't blindly duplicate "Home"
        let targetPath = resolvedPrev;
        if (!targetPath || targetPath === pathname) {
            targetPath = pathname === "/leaderboard" ? "/bulletin" : "/";
        }

        const labelMap: Record<string, string> = {
            "/": "Home",
            "/bulletin": "Bulletin",
            "/leaderboard": "Global Roster",
            "/dashboard": "Mission Control",
            "/profile": "Telemetry",
        };

        const targetLabel = labelMap[targetPath] || "Previous Page";
        // Defer state update via requestAnimationFrame to satisfy React 19 lint rules
        const rafId = window.requestAnimationFrame(() => {
            setBackTarget({ path: targetPath, label: targetLabel });
        });

        return () => window.cancelAnimationFrame(rafId);
    }, [pathname]);

    function handleBackClick() {
        router.push(backTarget.path);
    }

    return (
        <div className="space-y-3 mb-8">
            {/* Top Breadcrumb & Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-card/50 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBackClick}
                        className="h-7 px-2.5 text-xs gap-1.5 font-medium"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Back to {backTarget.label}
                    </Button>

                    <span className="text-muted-foreground/40">|</span>

                    <nav
                        aria-label="Breadcrumb"
                        className="flex items-center gap-1.5 text-muted-foreground"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1 hover:text-foreground font-medium transition-colors"
                        >
                            <Home className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Home</span>
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                        <span className="font-semibold text-foreground">
                            {currentPage}
                        </span>
                    </nav>
                </div>

                {/* Quick Cross-Page Switcher */}
                <div className="flex items-center gap-1.5 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-muted-foreground hidden sm:inline" />
                    {pathname !== "/bulletin" && (
                        <Link
                            href="/bulletin"
                            className="px-2 py-1 rounded border bg-background/60 hover:bg-muted font-medium transition-colors"
                        >
                            → Project Bulletin
                        </Link>
                    )}
                    {pathname !== "/leaderboard" && (
                        <Link
                            href="/leaderboard"
                            className="px-2 py-1 rounded border bg-background/60 hover:bg-muted font-medium transition-colors"
                        >
                            → Global Roster
                        </Link>
                    )}
                    {isAuthenticated && pathname !== "/dashboard" && (
                        <Link
                            href="/dashboard"
                            className="px-2 py-1 rounded border bg-background/60 hover:bg-muted font-medium transition-colors"
                        >
                            → Mission Control
                        </Link>
                    )}
                </div>
            </div>

            {/* Page Guide & Disclaimer Banner */}
            <div className="rounded-xl border bg-card/60 backdrop-blur-xs p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                    <div className="space-y-0.5">
                        <h2 className="text-sm font-bold flex items-center gap-2 text-foreground">
                            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                            {title}
                        </h2>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>

                    {!isAuthenticated && (
                        <div className="flex items-center gap-2.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 shrink-0">
                            <span className="text-xs font-medium text-indigo-300">
                                Guest Mode • Sign in to unlock AI & Streaks:
                            </span>
                            <LoginButton triggerLabel="Sign In / Join" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    {howItWorks.map((step, idx) => (
                        <div
                            key={idx}
                            className="rounded-lg border bg-background/60 px-3 py-2 flex items-start gap-2"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{step}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 pt-0.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>{disclaimer}</span>
                </div>
            </div>
        </div>
    );
}