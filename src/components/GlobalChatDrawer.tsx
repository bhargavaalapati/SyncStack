"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Send,
    ShieldCheck,
    Users,
    Loader2,
    Radio,
} from "lucide-react";
import {
    getLobbyMessages,
    postLobbyMessage,
    ChatMessageDTO,
} from "@/actions/chat";
import { LoginButton } from "@/components/AuthButtons";
import { toast } from "sonner";

export function GlobalChatDrawer() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [text, setText] = useState("");
    const [selectedTag, setSelectedTag] = useState<
        "Team Up" | "Architecture" | "General"
    >("Team Up");
    const [filterTag, setFilterTag] = useState<string>("All");

    useEffect(() => {
        if (!open) return;

        let active = true;

        async function loadMessages(showSpinner: boolean) {
            if (showSpinner) setLoading(true);
            try {
                const data = await getLobbyMessages();
                if (active) setMessages(data);
            } catch {
                // ignore polling error
            } finally {
                if (active && showSpinner) setLoading(false);
            }
        }

        loadMessages(true);
        const interval = setInterval(() => loadMessages(false), 10000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [open]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || sending) return;

        setSending(true);
        const res = await postLobbyMessage(text, selectedTag);
        setSending(false);

        if (res.success) {
            setText("");
            const updated = await getLobbyMessages();
            setMessages(updated);
            toast.success("Broadcasted to Developer Lobby!");
        } else {
            toast.error(res.message || "Could not send message.");
        }
    }

    const filteredMessages =
        filterTag === "All"
            ? messages
            : messages.filter((m) => m.tag === filterTag);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/40 bg-zinc-950/90 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-zinc-100 shadow-lg hover:border-emerald-500 hover:scale-105 transition-all cursor-pointer"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Developer Lobby</span>
                    <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/15 text-emerald-400"
                    >
                        Live
                    </Badge>
                </button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] sm:max-w-xl max-h-[85vh] flex flex-col p-5 sm:p-6">
                <DialogHeader className="border-b pb-3 pr-6">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Radio className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold flex items-center gap-2">
                                    Global Developer Comms Lobby
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Real-time team formation & architectural discussion • Auto-syncs every 10s
                                </DialogDescription>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-[11px] gap-1 hidden sm:inline-flex"
                        >
                            <Users className="w-3 h-3" /> Online
                        </Badge>
                    </div>

                    {/* Topic Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-3">
                        {["All", "Team Up", "Architecture", "General"].map((t) => (
                            <Button
                                key={t}
                                type="button"
                                size="sm"
                                variant={filterTag === t ? "default" : "outline"}
                                onClick={() => setFilterTag(t)}
                                className="h-6 px-2.5 text-[11px] rounded-full"
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                </DialogHeader>

                {/* Messages Scroll Area */}
                <div className="flex-1 overflow-y-auto space-y-3 py-3 min-h-72 max-h-96 pr-1">
                    {loading ? (
                        <div className="flex items-center justify-center h-48 text-xs text-muted-foreground gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            Synchronizing live developer channel...
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="text-center py-12 text-xs text-muted-foreground">
                            No messages in this channel yet. Start the conversation below!
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div
                                key={msg._id}
                                className="rounded-xl border bg-card/60 p-3.5 space-y-1.5 hover:border-border transition-colors"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            {msg.sender_image ? (
                                                <Image
                                                    src={msg.sender_image}
                                                    width={28}
                                                    height={28}
                                                    unoptimized
                                                    alt={msg.sender_name}
                                                    className="w-7 h-7 rounded-full border"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                    {msg.sender_name.charAt(0)}
                                                </div>
                                            )}
                                            <span
                                                title="Online Now"
                                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold flex items-center gap-1.5">
                                                <span>{msg.sender_name}</span>
                                                {msg.trust_score > 0 && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-semibold">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        {msg.trust_score}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground">
                                                {msg.sender_role}
                                            </div>
                                        </div>
                                    </div>

                                    <Badge
                                        variant="secondary"
                                        className="text-[10px] font-medium"
                                    >
                                        {msg.tag}
                                    </Badge>
                                </div>

                                <p className="text-xs text-foreground/90 leading-relaxed pl-9">
                                    {msg.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Composer or Guest Login Gate */}
                <div className="border-t pt-3">
                    {session?.user ? (
                        <form onSubmit={handleSend} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedTag}
                                    onChange={(e) =>
                                        setSelectedTag(
                                            e.target.value as
                                                | "Team Up"
                                                | "Architecture"
                                                | "General"
                                        )
                                    }
                                    className="h-9 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
                                >
                                    <option value="Team Up">🤝 Team Up</option>
                                    <option value="Architecture">🏗️ Architecture</option>
                                    <option value="General">💬 General</option>
                                </select>

                                <Input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    maxLength={280}
                                    placeholder="Pitch your stack or ask for teammates (max 280 chars)..."
                                    className="h-9 text-xs flex-1"
                                />

                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={sending || !text.trim()}
                                    className="h-9 px-3 gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    {sending ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Send className="w-3.5 h-3.5" />
                                    )}
                                    Send
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                            <span className="text-muted-foreground">
                                Sign in to broadcast messages & show your verified Trust Badge:
                            </span>
                            <LoginButton triggerLabel="Sign In to Chat" />
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}