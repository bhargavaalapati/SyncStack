import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Terminal,
    Home,
    Compass,
    Trophy,
    LayoutDashboard,
    UserCheck,
    ArrowRight,
} from "lucide-react";

export default function NotFound() {
    const quickRoutes = [
        {
            name: "Project Bulletin",
            desc: "Browse AI-architected system blueprints & open teams",
            href: "/bulletin",
            icon: <Compass className="w-4 h-4 text-indigo-400" />,
        },
        {
            name: "Global Roster & Streaks",
            desc: "View developer rankings, 14d streaks & ship projects",
            href: "/leaderboard",
            icon: <Trophy className="w-4 h-4 text-amber-500" />,
        },
        {
            name: "Workforce Command Center",
            desc: "Manage inbound talent queues & accepted matches",
            href: "/dashboard",
            icon: <LayoutDashboard className="w-4 h-4 text-emerald-400" />,
        },
        {
            name: "Developer Telemetry (Profile)",
            desc: "Audit your skills via the live GitHub REST API",
            href: "/profile",
            icon: <UserCheck className="w-4 h-4 text-blue-400" />,
        },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(#8080802e_1px,transparent_1px)] bg-size-[22px_22px]">
            <div className="max-w-2xl w-full rounded-2xl border bg-card/85 backdrop-blur-md p-6 sm:p-10 shadow-lg space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>HTTP 404 • NODE_ROUTE_NOT_FOUND</span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight">
                        Unmapped Telemetry Node
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        The architectural endpoint you requested does not exist in the SyncStack routing table. Select an active workspace node below to continue:
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                    {quickRoutes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className="group rounded-xl border bg-background/60 p-4 hover:border-indigo-500/50 hover:bg-muted/40 transition-all flex items-start justify-between gap-3"
                        >
                            <div className="space-y-1">
                                <div className="font-bold text-sm flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                                    {route.icon}
                                    <span>{route.name}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    {route.desc}
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
                        </Link>
                    ))}
                </div>

                <div className="pt-2">
                    <Link href="/">
                        <Button className="gap-2 font-semibold">
                            <Home className="w-4 h-4" /> Return to Primary Gateway
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}