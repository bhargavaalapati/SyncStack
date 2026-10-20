"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function SummarizeWithAi() {
    const [copied, setCopied] = useState(false);

    const siteUrl =
        typeof window !== "undefined"
            ? window.location.origin
            : "https://syncstack.vercel.app";

    const rawPrompt = `Analyze and summarize SyncStack Enterprise (${siteUrl}), an AI-powered project architecture, anti-hallucination GitHub skill verification, and multi-vector workforce matchmaking platform built with Next.js 16, Python FastAPI, Google Gemini 2.5 Flash, and MongoDB Atlas. Highlight its key enterprise innovations, system architecture, and scalability.`;

    const encodedPrompt = encodeURIComponent(rawPrompt);

    const aiTools = [
        {
            name: "ChatGPT",
            url: `https://chatgpt.com/?q=${encodedPrompt}`,
            color: "hover:border-emerald-500/50 hover:text-emerald-400",
        },
        {
            name: "Perplexity",
            url: `https://www.perplexity.ai/search/new?q=${encodedPrompt}`,
            color: "hover:border-cyan-500/50 hover:text-cyan-400",
        },
        {
            name: "Claude",
            url: `https://claude.ai/new?q=${encodedPrompt}`,
            color: "hover:border-amber-500/50 hover:text-amber-400",
        },
        {
            name: "Google AI",
            url: `https://www.google.com/search?q=${encodedPrompt}`,
            color: "hover:border-blue-500/50 hover:text-blue-400",
        },
        {
            name: "Grok",
            url: `https://x.com/i/grok?text=${encodedPrompt}`,
            color: "hover:border-zinc-400 hover:text-zinc-200",
        },
    ];

    function handleCopyPrompt() {
        navigator.clipboard.writeText(rawPrompt);
        setCopied(true);
        toast.success("AI evaluation prompt + website link copied!");
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="rounded-2xl border bg-card/70 backdrop-blur-md p-4 sm:p-5 max-w-4xl mx-auto w-full shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Summarize & Audit This Platform with AI
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                            Launch an instant architectural critique of SyncStack in your preferred AI assistant:
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {aiTools.map((tool) => (
                        <a
                            key={tool.name}
                            href={tool.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border bg-background/60 text-xs font-medium transition-all ${tool.color}`}
                        >
                            <span>{tool.name}</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                    ))}

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleCopyPrompt}
                        className="h-8 text-xs gap-1.5"
                    >
                        {copied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied ? "Copied Prompt" : "Copy Prompt"}
                    </Button>
                </div>
            </div>
        </div>
    );
}