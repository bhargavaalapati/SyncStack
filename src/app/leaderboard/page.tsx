import Navbar from "@/components/ui/Navbar";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, ShieldCheck } from "lucide-react";

export const revalidate = 60;

export default async function Leaderboard() {
    await connectDB();
    const topDevs = await User.find({
        $or: [{ reputation_score: { $gt: 0 } }, { trust_score: { $gt: 0 } }],
    })
        .sort({ reputation_score: -1, trust_score: -1 })
        .limit(50)
        .lean();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Global Roster Rankings
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Ranked by shipped architectures, peer reputation, and AI-verified GitHub telemetry.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border rounded-xl bg-card shadow-sm overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs border-b">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Engineer</th>
                                <th className="px-6 py-4 text-center">AI Trust Score</th>
                                <th className="px-6 py-4 text-center">Shipped</th>
                                <th className="px-6 py-4 text-right">Reputation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {topDevs.map((dev: any, index: number) => (
                                <tr key={dev._id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-bold text-lg text-muted-foreground">
                                        #{index + 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {dev.image ? (
                                                <img
                                                    src={dev.image}
                                                    className="w-9 h-9 rounded-full border shrink-0"
                                                    alt="avatar"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold shrink-0">
                                                    {dev.name?.charAt(0) || "U"}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-foreground">
                                                    {dev.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {dev.role} • {dev.commitment_level}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {dev.trust_score ? (
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5 gap-1 font-semibold"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                {dev.trust_score}%
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                Unverified
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono font-semibold">
                                        {dev.projects_shipped || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Badge
                                            variant="default"
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1"
                                        >
                                            <Flame className="w-3 h-3" /> {dev.reputation_score || 0}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}