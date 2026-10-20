import Navbar from "@/components/ui/Navbar";
import CreateProjectDialog from "@/components/CreateProjectDialog";
import { getOpenProjects } from "@/actions/project";
import { getMyApplications } from "@/actions/application";
import ProjectGrid from "@/components/ProjectGrid";
import { PageGuideBanner } from "@/components/ui/PageGuideBanner";
import { auth } from "@/auth";

interface ApplicationRecord {
    project_id?: { _id?: string } | string | null;
}

export default async function Bulletin() {
    const session = await auth();
    const projects = await getOpenProjects();

    let appliedProjectIds: string[] = [];
    if (session?.user?.id) {
        const myApps = (await getMyApplications()) as ApplicationRecord[];
        appliedProjectIds = myApps
            .map((app) => {
                if (!app.project_id) return "";
                if (typeof app.project_id === "string") return app.project_id;
                return app.project_id._id ? String(app.project_id._id) : "";
            })
            .filter(Boolean);
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <PageGuideBanner
                    currentPage="Project Bulletin"
                    title="How the Project Bulletin & AI Architect Work"
                    description="Browse open enterprise architectures, inspect Mermaid.js system blueprints, or broadcast your own idea."
                    howItWorks={[
                        "1. Broadcast & Auto-Architect: Click 'Broadcast Architecture' and let Gemini 2.5 Flash generate 3-phase sprints, risk matrices, and Mermaid.js diagrams.",
                        "2. Inspect AI Blueprints: Click 'AI Blueprint' on any card to view validated system topologies (.mmd) and estimated engineering hours.",
                        "3. Explainable AI Matchmaking: Project creators can click 'AI Match' to rank candidates by semantic skill overlap and verified GitHub trust scores.",
                    ]}
                    disclaimer="AI & Rate-Limit Disclaimer: Powered by Gemini 2.5 Flash (Free Tier). AI outputs may occasionally contain inaccuracies—review before production use. Live AI generation enforces a 60s anti-spam cooldown."
                    isAuthenticated={Boolean(session?.user)}
                />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div className="max-w-2xl">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                            The Project Bulletin
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Explore AI-architected system blueprints, inspect sprint roadmaps, and join verified engineering teams.
                        </p>
                    </div>
                    {session?.user && <CreateProjectDialog />}
                </div>

                <ProjectGrid
                    initialProjects={projects}
                    appliedProjectIds={appliedProjectIds}
                />
            </main>
        </div>
    );
}