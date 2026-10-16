import Navbar from "@/components/ui/Navbar";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Star } from "lucide-react";

export const revalidate = 60; // Cache and refresh every 60 seconds

export default async function Leaderboard() {
    await connectDB();
    const topDevs = await User.find({ reputation_score: { $gt: 0 } })
        .sort({ reputation_score: -1 })
        .limit(50)
        .lean();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex items-center gap-3 mb-8">
                    <Trophy className="w-10 h-10 text-amber-500" />
                    <h1 className="text-4xl font-extrabold tracking-tight">Global Roster Rankings</h1>
                </div>

                <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-xs">
                            <tr>
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Developer</th>
                                <th className="px-6 py-4 text-center">Projects Shipped</th>
                                <th className="px-6 py-4 text-right">Reputation Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {topDevs.map((dev: any, index: number) => (
                                <tr key={dev._id} className="hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-bold text-lg text-muted-foreground">#{index + 1}</td>
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <img src={dev.image} className="w-8 h-8 rounded-full border" alt="avatar" />
                                        <div>
                                            <div className="font-bold text-foreground">{dev.name}</div>
                                            <div className="text-xs text-muted-foreground">{dev.role} • {dev.commitment_level}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-mono">{dev.projects_shipped}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Badge variant="default" className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-1">
                                            <Flame className="w-3 h-3" /> {dev.reputation_score}
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