import React from "react";
import { Cpu } from "lucide-react";

export default function GlobalLoading() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Top Animated Indeterminate Progress Bar */}
            <div className="h-1 w-full bg-muted overflow-hidden relative">
                <div className="h-full w-1/3 bg-linear-to-r from-indigo-500 via-primary to-amber-500 animate-pulse rounded-full" />
            </div>

            {/* Navbar Skeleton */}
            <div className="h-16 border-b bg-card/40 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
                    <div className="w-28 h-5 rounded bg-muted animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-20 h-8 rounded-md bg-muted animate-pulse hidden sm:block" />
                    <div className="w-24 h-8 rounded-md bg-muted animate-pulse hidden sm:block" />
                    <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
                </div>
            </div>

            {/* Main Telemetry Loading Canvas */}
            <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl space-y-8">
                {/* Live Sync Status Pill */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
                    <Cpu className="w-3.5 h-3.5 animate-spin" />
                    <span>Synchronizing Enterprise Telemetry & MongoDB Atlas...</span>
                </div>

                {/* Guide Banner Skeleton */}
                <div className="rounded-xl border bg-card/50 p-5 space-y-4">
                    <div className="w-64 h-5 rounded bg-muted animate-pulse" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="h-14 rounded-lg bg-muted/60 animate-pulse" />
                        <div className="h-14 rounded-lg bg-muted/60 animate-pulse" />
                        <div className="h-14 rounded-lg bg-muted/60 animate-pulse" />
                    </div>
                </div>

                {/* Page Title & Action Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                        <div className="w-72 h-9 rounded-lg bg-muted animate-pulse" />
                        <div className="w-96 max-w-full h-4 rounded bg-muted/70 animate-pulse" />
                    </div>
                    <div className="w-44 h-10 rounded-lg bg-muted animate-pulse" />
                </div>

                {/* 6-Card Architecture Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                            key={idx}
                            className="rounded-xl border bg-card/60 p-6 space-y-4 shadow-xs"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="w-3/4 h-6 rounded bg-muted animate-pulse" />
                                <div className="w-16 h-5 rounded-full bg-muted animate-pulse" />
                            </div>
                            <div className="space-y-2">
                                <div className="w-full h-3.5 rounded bg-muted/70 animate-pulse" />
                                <div className="w-5/6 h-3.5 rounded bg-muted/70 animate-pulse" />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <div className="w-16 h-5 rounded bg-muted animate-pulse" />
                                <div className="w-20 h-5 rounded bg-muted animate-pulse" />
                                <div className="w-14 h-5 rounded bg-muted animate-pulse" />
                            </div>
                            <div className="pt-4 border-t flex justify-between items-center">
                                <div className="w-24 h-8 rounded-md bg-muted animate-pulse" />
                                <div className="w-24 h-8 rounded-md bg-muted animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}