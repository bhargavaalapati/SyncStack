import Navbar from "@/components/ui/Navbar";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Project } from "@/models/Project";
import { auth } from "@/auth";
import { Trophy } from "lucide-react";
import LeaderboardClient, { LeaderboardDeveloper } from "@/components/LeaderboardClient";
import { ShipProjectDialog, UserProjectOption } from "@/components/ShipProjectDialog";
import { PageGuideBanner } from "@/components/ui/PageGuideBanner";

export const revalidate = 60;

export default async function Leaderboard() {
    await connectDB();
    const session = await auth();

    const rawDevs = await User.find({
        $or: [
            { reputation_score: { $gt: 0 } },
            { trust_score: { $gt: 0 } },
            { projects_shipped: { $gt: 0 } },
        ],
    })
        .sort({ reputation_score: -1, trust_score: -1 })
        .limit(50)
        .lean();

    const topDevs: LeaderboardDeveloper[] = rawDevs.map((d) => ({
        _id: String(d._id),
        name: d.name || "Anonymous Engineer",
        image: d.image || "",
        role: d.role || "Full-Stack Engineer",
        commitment_level: d.commitment_level || "Balanced",
        projects_shipped: d.projects_shipped || 0,
        reputation_score: d.reputation_score || 0,
        trust_score: d.trust_score || 0,
        tech_skills: Array.isArray(d.tech_skills) ? d.tech_skills : [],
        updatedAt: d.updatedAt ? new Date(d.updatedAt as Date).toISOString() : "",
    }));

    let userProjects: UserProjectOption[] = [];
    if (session?.user?.id) {
        const myRawProjects = await Project.find({
            creator_id: session.user.id,
            status: "Open",
        })
            .select("_id title")
            .lean();

        userProjects = myRawProjects.map((p) => ({
            _id: String(p._id),
            title: String(p.title),
        }));
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <PageGuideBanner
                    currentPage="Global Roster"
                    title="How Global Rankings, Streaks & Shipping Work"
                    description="SyncStack combines daily developer check-ins with live GitHub repository verification."
                    howItWorks={[
                        "1. Daily Check-In (+25 Coins): Click 'Daily Check-In' once every 24 hours to log active presence and earn +25 RepCoins.",
                        "2. Verify & Ship (+150 Coins): Submit a public GitHub repo URL—our backend verifies the repo via the GitHub REST API and increments your Shipped count.",
                        "3. AI Trust Badge (0-100%): Generated on the Telemetry (Profile) page by auditing your claimed skills against your actual GitHub repositories.",
                    ]}
                    disclaimer="Anti-Spam Policy: Daily Check-In rewards are strictly locked to once per calendar day per account. Shipped repositories are audited via live GitHub REST telemetry."
                    isAuthenticated={Boolean(session?.user)}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Global Roster & Contribution Streaks
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Ranked by shipped architectures, daily login & shipping streaks, and AI-verified GitHub telemetry.
                            </p>
                        </div>
                    </div>

                    <ShipProjectDialog
                        userProjects={userProjects}
                        isAuthenticated={Boolean(session?.user)}
                    />
                </div>

                {/* Renders the full Leaderboard Table, Category Filters, 14d Streak Heatmap & Load More */}
                <LeaderboardClient initialDevs={topDevs} />
            </main>
        </div>
    );
}