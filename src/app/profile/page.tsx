// src/app/profile/page.tsx
import Navbar from "@/components/ui/Navbar";
import { getUserProfile } from "@/actions/profile";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
    const session = await auth();
    if (!session) redirect("/");

    const user = await getUserProfile();
    if (!user) redirect("/");

    const currentSkillsString = user.tech_skills?.join(", ") || "";

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Developer Telemetry</h1>
                <p className="text-muted-foreground mb-8">
                    Update your technical stack so the Gemini AI can accurately match you to high-potential projects.
                </p>

                <div className="border rounded-xl p-8 bg-card shadow-sm">
                    <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                        {user.image ? (
                            <img src={user.image} alt="avatar" className="w-16 h-16 rounded-full border-2" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center font-bold text-xl">
                                {user.name?.charAt(0) || "U"}
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    {/* The Interactive Client Component Form */}
                    <ProfileForm user={user} currentSkillsString={currentSkillsString} />

                </div>
            </main>
        </div>
    );
}