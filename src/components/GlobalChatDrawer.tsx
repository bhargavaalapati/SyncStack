"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    MessageSquare,
    Send,
    ShieldCheck,
    Loader2,
    Radio,
    Reply,
    X,
    Bot,
    Maximize2,
    GripVertical,
    Minimize2,
    Clock,
} from "lucide-react";
import {
    getLobbyMessages,
    postLobbyMessage,
    ChatMessageDTO,
} from "@/actions/chat";
import { LoginButton } from "@/components/AuthButtons";
import { toast } from "sonner";

export function formatRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const diffSeconds = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 1000)
    );
    const exactTime = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    if (diffSeconds < 30) return `Just now • ${exactTime}`;
    const diffMins = Math.floor(diffSeconds / 60);
    if (diffMins < 60) return `${diffMins}m ago • ${exactTime}`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago • ${exactTime}`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}

export function LobbyChatPanel({
    isFullPage = false,
}: {
    isFullPage?: boolean;
}) {
    const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [onlineCount, setOnlineCount] = useState(1);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [text, setText] = useState("");
    const [selectedTag, setSelectedTag] = useState<
        "Team Up" | "Architecture" | "General"
    >("Team Up");
    const [filterTag, setFilterTag] = useState<string>("All");
    const [askAgent, setAskAgent] = useState<boolean>(true);
    const [replyTarget, setReplyTarget] = useState<{
        name: string;
        snippet: string;
    } | null>(null);

    const syncLobby = useCallback(async () => {
        try {
            const state = await getLobbyMessages();
            setMessages(state.messages);
            setIsAuthenticated(state.isAuthenticated);
            setOnlineCount(state.onlineCount);
        } catch {
            // ignore transient network errors
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const initTimeout = setTimeout(() => {
            if (active) {
                void syncLobby();
            }
        }, 0);

        const interval = setInterval(() => {
            if (active) {
                void syncLobby();
            }
        }, 12000);

        return () => {
            active = false;
            clearTimeout(initTimeout);
            clearInterval(interval);
        };
    }, [syncLobby]);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!text.trim() || sending) return;

        setSending(true);
        const res = await postLobbyMessage({
            content: text,
            tag: selectedTag,
            replyToName: replyTarget?.name,
            replyToSnippet: replyTarget?.snippet,
            askAgent,
        });
        setSending(false);

        if (res.success) {
            setText("");
            setReplyTarget(null);
            await syncLobby();
            toast.success("Broadcasted to Developer Lobby!");
        } else {
            toast.error(res.message || "Could not send message.");
            await syncLobby();
        }
    }

    const filteredMessages =
        filterTag === "All"
            ? messages
            : messages.filter((m) => m.tag === filterTag);

    return (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Compact Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2.5 border-b shrink-0">
                <div className="flex flex-wrap gap-1">
                    {["All", "Team Up", "Architecture", "AI Agent", "General"].map(
                        (t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setFilterTag(t)}
                                className={`h-6 px-2 text-[10px] font-semibold rounded-full border transition-colors cursor-pointer ${
                                    filterTag === t
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-background/60 text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t === "AI Agent" ? "🤖 Agent" : t}
                            </button>
                        )
                    )}
                </div>

                <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5 text-[10px] gap-1 shrink-0"
                >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {onlineCount} Live (20s TTL)
                </Badge>
            </div>

            {/* Scrollable Messages Area */}
            <div
                className={`flex-1 overflow-y-auto space-y-2.5 py-2.5 pr-1 ${
                    isFullPage ? "min-h-[50vh] max-h-[60vh]" : ""
                }`}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-40 text-xs text-muted-foreground gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                        Syncing live channel...
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="text-center py-10 text-xs text-muted-foreground">
                        No messages in this channel filter yet.
                    </div>
                ) : (
                    filteredMessages.map((msg) => {
                        const dotColor =
                            msg.presence === "online"
                                ? "bg-emerald-500"
                                : msg.presence === "today"
                                ? "bg-amber-500"
                                : "bg-zinc-500";
                        const presenceLabel =
                            msg.presence === "online"
                                ? "Online Now (<20s)"
                                : msg.presence === "today"
                                ? "Active Recently"
                                : "Offline";

                        return (
                            <div
                                key={msg._id}
                                className={`rounded-xl border p-3 space-y-1.5 transition-colors ${
                                    msg.is_agent
                                        ? "border-indigo-500/40 bg-indigo-500/5"
                                        : "bg-card/80 hover:border-border"
                                }`}
                            >
                                {/* TOP ROW: Avatar + Name + Trust + Time */}
                                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="relative shrink-0">
                                            {msg.is_agent ? (
                                                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                                                    <Bot className="w-3.5 h-3.5" />
                                                </div>
                                            ) : msg.sender_image ? (
                                                <Image
                                                    src={msg.sender_image}
                                                    width={28}
                                                    height={28}
                                                    unoptimized
                                                    alt={msg.sender_name}
                                                    className="w-7 h-7 rounded-full border"
                                                />
                                            ) : (
                                                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold">
                                                    {msg.sender_name.charAt(0)}
                                                </div>
                                            )}
                                            <span
                                                title={presenceLabel}
                                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${dotColor} ring-2 ring-background`}
                                            />
                                        </div>

                                        <div className="min-w-0">
                                            <div className="text-xs font-bold flex items-center gap-1 truncate">
                                                <span className="truncate">
                                                    {msg.sender_name}
                                                </span>
                                                {msg.is_agent && (
                                                    <Badge className="h-3.5 px-1 text-[9px] bg-indigo-600 text-white shrink-0">
                                                        RAG Agent
                                                    </Badge>
                                                )}
                                                {msg.trust_score > 0 && !msg.is_agent && (
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400 font-semibold shrink-0">
                                                        <ShieldCheck className="w-2.5 h-2.5" />
                                                        {msg.trust_score}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-muted-foreground truncate">
                                                {msg.sender_role}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground font-mono">
                                            <Clock className="w-2.5 h-2.5 opacity-70" />
                                            {formatRelativeTime(msg.createdAt)}
                                        </span>
                                        <span className="text-[9px] font-semibold text-indigo-400">
                                            {msg.tag}
                                        </span>
                                    </div>
                                </div>

                                {msg.reply_to_name && (
                                    <div className="rounded border-l-2 border-indigo-500 bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground truncate">
                                        <span className="font-semibold text-indigo-400">
                                            @{msg.reply_to_name}:
                                        </span>{" "}
                                        &ldquo;{msg.reply_to_snippet}&rdquo;
                                    </div>
                                )}

                                <div className="flex items-end justify-between gap-2 pt-0.5">
                                    <p className="text-xs text-foreground/95 leading-relaxed wrap-break-word">
                                        {msg.content}
                                    </p>

                                    {isAuthenticated && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setReplyTarget({
                                                    name: msg.sender_name,
                                                    snippet: msg.content.slice(0, 50),
                                                })
                                            }
                                            className="text-[10px] text-muted-foreground hover:text-indigo-400 inline-flex items-center gap-0.5 shrink-0 font-medium cursor-pointer"
                                        >
                                            <Reply className="w-3 h-3" /> Reply
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Composer Footer */}
            <div className="border-t pt-2.5 space-y-2 shrink-0">
                {replyTarget && (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-[11px]">
                        <span className="truncate">
                            Replying to <strong>@{replyTarget.name}</strong>
                        </span>
                        <button
                            type="button"
                            onClick={() => setReplyTarget(null)}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {isAuthenticated ? (
                    <form onSubmit={handleSend} className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
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
                                className="h-8 px-2 rounded-md border border-input bg-background text-[11px] font-medium shrink-0"
                            >
                                <option value="Team Up">🤝 Team</option>
                                <option value="Architecture">🏗️ Arch</option>
                                <option value="General">💬 Chat</option>
                            </select>

                            <Input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={320}
                                placeholder={
                                    replyTarget
                                        ? `Reply to @${replyTarget.name}...`
                                        : "Message or ask @agent..."
                                }
                                className="h-8 text-xs flex-1 min-w-0"
                            />

                            <Button
                                type="submit"
                                size="sm"
                                disabled={sending || !text.trim()}
                                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
                            >
                                {sending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                            </Button>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={askAgent}
                                    onChange={(e) => setAskAgent(e.target.checked)}
                                    className="rounded border-input"
                                />
                                <Bot className="w-3 h-3 text-indigo-400" />
                                <span>
                                    Auto-reply via <strong>@SyncStack-Agent</strong> (0 AI Credits • MongoDB RAG)
                                </span>
                            </label>
                            <span>{text.length}/320</span>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px]">
                        <span className="text-amber-300 font-medium">
                            Signed out • Authenticate to chat:
                        </span>
                        <LoginButton triggerLabel="Sign In" />
                    </div>
                )}
            </div>
        </div>
    );
}

export function GlobalChatDrawer() {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);

    return (
        <>
            {/* One-Sided Right-Docked Fixed Drawer Panel */}
            {open && (
                <aside className="fixed bottom-18 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[500px] max-h-[calc(100vh-7rem)] rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col p-4 animate-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Radio className="w-4 h-4 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xs font-extrabold leading-none">
                                    Developer Comms Lobby
                                </h3>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                    Docked Panel • 0-Token Autonomous RAG Agent
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <Link
                                href="/chat"
                                onClick={() => setOpen(false)}
                                title="Open Full-Page Workspace (/chat)"
                                className="p-1.5 rounded-lg border bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                title="Close Docked Drawer"
                                className="p-1.5 rounded-lg border bg-background/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    <LobbyChatPanel isFullPage={false} />
                </aside>
            )}

            {/* Draggable Floating Launcher Pill */}
            <motion.div
                drag
                dragMomentum={false}
                className="fixed bottom-4 right-4 sm:right-6 z-50 flex items-center gap-1 rounded-full border border-emerald-500/40 bg-zinc-950/95 backdrop-blur-md p-1 text-xs font-bold text-zinc-100 shadow-xl"
            >
                <div
                    title="Drag to move anywhere on screen"
                    className="px-1.5 py-1.5 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-200"
                >
                    <GripVertical className="w-3.5 h-3.5" />
                </div>

                {!minimized ? (
                    <>
                        <button
                            type="button"
                            onClick={() => setOpen((prev) => !prev)}
                            className="inline-flex items-center gap-2 px-2.5 py-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{open ? "Hide Lobby" : "Developer Lobby"}</span>
                        </button>

                        <Link
                            href="/chat"
                            title="Open Full-Screen Chat Workspace (/chat)"
                            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </Link>

                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                setMinimized(true);
                            }}
                            title="Minimize Pill"
                            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <Minimize2 className="w-3.5 h-3.5" />
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => setMinimized(false)}
                        title="Expand Developer Lobby Pill"
                        className="p-2 rounded-full text-emerald-400 hover:bg-zinc-800 cursor-pointer"
                    >
                        <MessageSquare className="w-4 h-4" />
                    </button>
                )}
            </motion.div>
        </>
    );
}