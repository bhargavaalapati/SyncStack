import Navbar from "@/components/ui/Navbar";
import Image from "next/image";
import { getUserProfile } from "@/actions/profile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { PageGuideBanner } from "@/components/ui/PageGuideBanner";
import { DevProgressionCard } from "@/components/DevProgressionCard";

export default async function ProfilePage() {
    const session = await auth();
    if (!session) redirect("/");

    const user = await getUserProfile();
    if (!user) redirect("/");

    const skillsArray: string[] = Array.isArray(user.tech_skills)
        ? user.tech_skills
        : [];
    const currentSkillsString = skillsArray.join(", ");

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <PageGuideBanner
                    currentPage="Developer Telemetry"
                    title="How Zero-Trust GitHub Skill Verification & Clearance Unlocks Work"
                    description="Audit your public repositories via the GitHub REST API and pass the 10-Min Micro-PR AST Sandbox."
                    howItWorks={[
                        "1. Declare Skills & GitHub Handle: Enter your tech stack and GitHub username below.",
                        "2. Live GitHub REST Audit: Click 'Verify Skills with AI' to cross-audit your public repos against your claimed stack.",
                        "3. 10-Min Micro-PR Sandbox: Pass the atomic AST concurrency debugging check above to unlock Tier-4 Senior Builder Clearance.",
                    ]}
                    disclaimer="Telemetry Governance: Only public repository metadata and commit diffs are inspected. AI verification enforces a 60s rate-limit cooldown."
                    isAuthenticated={true}
                />

                <DevProgressionCard
                    name={user.name || "SyncStack Engineer"}
                    email={user.email || ""}
                    role={user.role || "Full-Stack Engineer"}
                    githubUrl={user.github_url || ""}
                    skillsCount={skillsArray.length}
                    skillsList={skillsArray}
                    trustScore={Number(user.trust_score || 0)}
                    projectsShipped={Number(user.projects_shipped || 0)}
                    reputationScore={Number(user.reputation_score || 0)}
                />

                <div className="border rounded-xl p-6 sm:p-8 bg-card shadow-sm">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b">
                        {user.image ? (
                            <Image
                                src={user.image}
                                alt="avatar"
                                width={64}
                                height={64}
                                unoptimized
                                className="w-16 h-16 rounded-full border-2"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-xl">
                                {user.name?.charAt(0) || "U"}
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    <ProfileForm
                        user={user}
                        currentSkillsString={currentSkillsString}
                    />
                </div>
            </main>
        </div>
    );
}