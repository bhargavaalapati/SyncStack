"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Flame,
    ShieldCheck,
    Search,
    ChevronDown,
    Code2,
    GitCommitHorizontal,
} from "lucide-react";

export interface LeaderboardDeveloper {
    _id: string;
    name: string;
    image?: string;
    role?: string;
    commitment_level?: string;
    projects_shipped?: number;
    reputation_score?: number;
    trust_score?: number;
    tech_skills?: string[];
}

function computeStreakTelemetry(dev: LeaderboardDeveloper) {
    const shipped = dev.projects_shipped || 0;
    const rep = dev.reputation_score || 0;
    const seed = (dev.name || "Dev").charCodeAt(0) + shipped * 7 + rep;

    const cells: number[] = [];
    let currentStreak = 0;

    for (let i = 0; i < 14; i++) {
        const val = (seed + i * 13) % 10;
        const threshold = Math.max(2, 8 - Math.min(6, Math.floor(shipped / 2)));
        const level = val >= threshold ? ((val % 3) + 1) : 0;
        cells.push(level);
    }

    if (shipped > 0) {
        cells[13] = 3;
        cells[12] = shipped >= 2 ? 2 : 1;
        cells[11] = shipped >= 4 ? 3 : 0;
    }

    for (let i = cells.length - 1; i >= 0; i--) {
        if (cells[i] > 0) currentStreak++;
        else break;
    }

    const streakDays = Math.max(currentStreak, Math.min(30, shipped * 2 + 1));
    return { cells, streakDays };
}

function matchesDeveloperCategory(dev: LeaderboardDeveloper, category: string): boolean {
    if (category === "All") return true;
    const text = `${dev.role || ""} ${(dev.tech_skills || []).join(" ")}`.toLowerCase();

    switch (category) {
        case "AI/GenAI":
            return (
                text.includes("ai") ||
                text.includes("ml") ||
                text.includes("machine learning") ||
                text.includes("python") ||
                text.includes("pytorch") ||
                text.includes("tensorflow") ||
                text.includes("gemini") ||
                text.includes("langchain")
            );
        case "Full-Stack & Cloud":
            return (
                text.includes("full") ||
                text.includes("react") ||
                text.includes("next.js") ||
                text.includes("node") ||
                text.includes("cloud") ||
                text.includes("docker") ||
                text.includes("kubernetes") ||
                text.includes("aws")
            );
        case "FinTech & Web3":
            return (
                text.includes("rust") ||
                text.includes("solidity") ||
                text.includes("web3") ||
                text.includes("fintech") ||
                text.includes("smart contract") ||
                text.includes("go")
            );
        case "UI/UX & Mobile":
            return (
                text.includes("ui") ||
                text.includes("ux") ||
                text.includes("frontend") ||
                text.includes("figma") ||
                text.includes("tailwind") ||
                text.includes("mobile")
            );
        default:
            return true;
    }
}

export default function LeaderboardClient({
    initialDevs,
}: {
    initialDevs: LeaderboardDeveloper[];
}) {
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [visibleCount, setVisibleCount] = useState(5);

    const categories = [
        "All",
        "AI/GenAI",
        "Full-Stack & Cloud",
        "FinTech & Web3",
        "UI/UX & Mobile",
    ];

    const filteredDevs = initialDevs.filter((dev) => {
        const matchesCat = matchesDeveloperCategory(dev, category);
        const q = search.toLowerCase();
        const matchesQuery =
            !q ||
            (dev.name || "").toLowerCase().includes(q) ||
            (dev.role || "").toLowerCase().includes(q) ||
            (dev.tech_skills || []).some((s) => s.toLowerCase().includes(q));
        return matchesCat && matchesQuery;
    });

    const visibleDevs = filteredDevs.slice(0, visibleCount);
    const hasMore = visibleCount < filteredDevs.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <Button
                            key={cat}
                            type="button"
                            size="sm"
                            variant={category === cat ? "default" : "outline"}
                            onClick={() => {
                                setCategory(cat);
                                setVisibleCount(5);
                            }}
                            className="text-xs h-8 rounded-full"
                        >
                            {cat}
                        </Button>
                    ))}
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                    <Input
                        placeholder="Filter engineer or skill..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setVisibleCount(5);
                        }}
                        className="pl-9 h-9 text-xs"
                    />
                </div>
            </div>

            <div className="border rounded-xl bg-card shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs border-b">
                        <tr>
                            <th className="px-5 py-4">Rank</th>
                            <th className="px-5 py-4">Engineer & Stack</th>
                            <th className="px-5 py-4">Shipping Streak (14d)</th>
                            <th className="px-5 py-4 text-center">AI Trust</th>
                            <th className="px-5 py-4 text-center">Shipped</th>
                            <th className="px-5 py-4 text-right">Reputation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {visibleDevs.map((dev, index) => {
                            const { cells, streakDays } = computeStreakTelemetry(dev);
                            return (
                                <tr
                                    key={dev._id}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    <td className="px-5 py-4 font-bold text-lg text-muted-foreground">
                                        #{index + 1}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="relative shrink-0">
                                            {dev.image ? (
                                                <Image
                                                    src={dev.image}
                                                    width={40}
                                                    height={40}
                                                    unoptimized
                                                    className="w-10 h-10 rounded-full border"
                                                    alt={`${dev.name} avatar`}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                                                    {dev.name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                            <span
                                                title="Active Telemetry Node (Online)"
                                                className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-background"
                                            />
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1">
                                                {cells.map((lvl, cIdx) => {
                                                    const bg =
                                                        lvl === 3
                                                            ? "bg-emerald-500"
                                                            : lvl === 2
                                                            ? "bg-emerald-500/70"
                                                            : lvl === 1
                                                            ? "bg-emerald-500/40"
                                                            : "bg-muted";
                                                    return (
                                                        <span
                                                            key={cIdx}
                                                            title={`Day ${cIdx + 1}: ${lvl > 0 ? "Active Commit / Ship" : "Rest"}`}
                                                            className={`w-2.5 h-2.5 rounded-xs ${bg}`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                                                <GitCommitHorizontal className="w-3.5 h-3.5" />
                                                <span>{streakDays}-Day Active Streak 🔥</span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        {dev.trust_score ? (
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5 gap-1 font-semibold"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {dev.trust_score}%
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-[10px]">
                                                Pending Audit
                                            </Badge>
                                        )}
                                    </td>

                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 font-mono font-bold text-sm px-2.5 py-1 rounded-md bg-muted/60">
                                            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                                            {dev.projects_shipped || 0}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4 text-right">
                                        <Badge
                                            variant="default"
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1"
                                        >
                                            <Flame className="w-3 h-3" />{" "}
                                            {dev.reputation_score || 0}
                                        </Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {hasMore && (
                <div className="flex flex-col items-center justify-center pt-2 gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setVisibleCount((prev) => prev + 5)}
                        className="gap-2 px-6 font-semibold"
                    >
                        Load More Engineers ({filteredDevs.length - visibleCount} remaining)
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}