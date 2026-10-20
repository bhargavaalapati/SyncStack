import React from "react";
import Navbar from "@/components/ui/Navbar";
import { PageGuideBanner } from "@/components/ui/PageGuideBanner";
import { LobbyChatPanel } from "@/components/GlobalChatDrawer";
import { auth } from "@/auth";
import { Radio, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ChatWorkspacePage() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <PageGuideBanner
                    currentPage="Developer Comms Lobby"
                    title="How the Global Developer Lobby & Autonomous Matchmaking Agent Work"
                    description="Collaborate in real time with verified engineers or let @SyncStack-Agent match your message to open architectures."
                    howItWorks={[
                        "1. Real-Time Presence (10m TTL): Green dots indicate engineers active within the last 10 minutes; Amber indicates active today.",
                        "2. Contextual @Replies: Click 'Reply' on any developer broadcast to quote their message and coordinate sprint roles.",
                        "3. Autonomous @SyncStack-Agent: Keep the AI Agent toggle checked when posting 'Team Up' or 'Architecture' notes to get an instant database-backed match reply.",
                    ]}
                    disclaimer="Session Governance: Only authenticated developers can broadcast messages. Signing out immediately locks composer access across all tabs."
                    isAuthenticated={Boolean(session?.user)}
                />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Radio className="w-7 h-7 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                Developer Comms Workspace
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Full-screen engineering channel with autonomous matchmaking concierge and verified telemetry badges.
                            </p>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 gap-1.5 px-3 py-1 text-xs"
                    >
                        <Bot className="w-4 h-4" /> @SyncStack-Agent Online
                    </Badge>
                </div>

                <div className="rounded-2xl border bg-card/80 shadow-sm p-5 sm:p-6">
                    <LobbyChatPanel isFullPage={true} />
                </div>
            </main>
        </div>
    );
}