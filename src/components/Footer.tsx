import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Cpu, ShieldCheck, Radio, GitBranch } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t bg-card/40 backdrop-blur-md mt-auto">
            <div className="container mx-auto px-4 py-10 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-border/60">
                    {/* Brand & System Telemetry Column */}
                    <div className="space-y-3 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo.svg"
                                alt="SyncStack Logo"
                                width={28}
                                height={28}
                            />
                            <span className="font-extrabold text-lg tracking-tight text-primary">
                                SyncStack Enterprise
                            </span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                v2.4
                            </Badge>
                        </Link>
                        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                            Autonomous project architecture generation, zero-trust GitHub skill verification, and explainable multi-vector workforce matchmaking powered by Google Gemini 2.5 Flash.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                All Systems Operational
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-background/60 text-muted-foreground text-[11px]">
                                <Cpu className="w-3 h-3 text-indigo-400" />
                                SHA-256 Cache &lt;0.5ms
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-background/60 text-muted-foreground text-[11px]">
                                <ShieldCheck className="w-3 h-3 text-amber-500" />
                                Turnstile Guard Active
                            </span>
                        </div>
                    </div>

                    {/* Platform Workspaces */}
                    <div className="space-y-2.5 text-xs">
                        <h4 className="font-bold uppercase tracking-wider text-foreground">
                            Enterprise Workspaces
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>
                                <Link
                                    href="/bulletin"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Project Bulletin & AI Blueprints
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/leaderboard"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Global Roster & Streak Heatmaps
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/chat"
                                    className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
                                >
                                    <span>Developer Comms & AI Agent</span>
                                    <Radio className="w-3 h-3 text-emerald-400" />
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Workforce Command Center
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/profile"
                                    className="hover:text-foreground transition-colors"
                                >
                                    Telemetry & Skill Verification
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Architecture & Governance */}
                    <div className="space-y-2.5 text-xs">
                        <h4 className="font-bold uppercase tracking-wider text-foreground">
                            Architecture & Security
                        </h4>
                        <ul className="space-y-2 text-muted-foreground">
                            <li className="flex items-center gap-1.5">
                                <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                                Next.js 16 + Python FastAPI
                            </li>
                            <li>Google Gemini 2.5 Flash + Pydantic v2</li>
                            <li>GitHub REST API v3 Telemetry</li>
                            <li>Multi-Provider OAuth 2.0 & SSO</li>
                            <li>MongoDB Atlas Compound Indexing</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
                    <p>
                        © 2026 SyncStack Enterprise. Architected by Alapati Bhargava Rama Bharadwaja. All rights reserved.
                    </p>
                    <p className="text-center sm:text-right">
                        AI Disclaimer: Outputs are validated via Pydantic schemas; always verify critical engineering specifications.
                    </p>
                </div>
            </div>
        </footer>
    );
}