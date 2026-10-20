"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Terminal,
    Copy,
    Check,
    Download,
    GitBranch,
    FolderTree,
    ListTodo,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export interface CompilerSprintItem {
    phase?: string;
    title?: string;
    duration?: string;
    estimatedHours?: number;
    estimated_hours?: number;
    deliverables?: string[];
    tasks?: string[];
}

export interface CompilerRoleItem {
    role?: string;
    title?: string;
    role_title?: string;
    skills?: string[];
    required_skills?: string[];
    responsibility?: string;
    focus?: string;
    complexity?: string;
}

export interface CompilerBlueprintData {
    recommendedStack?: string[];
    techStack?: string[];
    sprints?: CompilerSprintItem[];
    milestones?: CompilerSprintItem[];
    roleMatrix?: CompilerRoleItem[];
    role_matrix?: CompilerRoleItem[];
}

export interface SpecCompilerProps {
    projectTitle?: string;
    domain?: string;
    blueprint?: CompilerBlueprintData | null;
}

export function SpecToRepoCompiler({
    projectTitle = "SyncStack Enterprise Architecture",
    domain = "Enterprise AI & Cloud",
    blueprint,
}: SpecCompilerProps) {
    const [copiedScript, setCopiedScript] = useState(false);
    const [copiedTickets, setCopiedTickets] = useState(false);

    const techStack =
        blueprint?.recommendedStack ||
        blueprint?.techStack || [
            "Next.js 16",
            "FastAPI",
            "Gemini 2.5 Flash",
            "MongoDB",
        ];

    const sprints = blueprint?.sprints || blueprint?.milestones || [];
    const roles = blueprint?.roleMatrix || blueprint?.role_matrix || [];

    const slug =
        projectTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "syncstack-service";

    const fileTreeSpec = `${slug}/
├── .github/workflows/
│   └── ci-cd-telemetry.yml       # Bi-directional CI/CD webhook pipeline
├── ai-engine/
│   ├── main.py                   # FastAPI async worker + Pydantic v2 schemas
│   ├── requirements.txt          # Python 3.11 dependencies
│   └── Dockerfile                # Isolated microservice container
├── src/
│   ├── app/                      # Next.js 16 Turbopack App Router
│   ├── actions/                  # Server Actions & updateTag() mutations
│   ├── models/                   # Indexed Mongoose ODM schemas
│   └── proxy.ts                  # Next.js 16 lightweight edge traffic boundary
├── AGENTS.md                     # Next.js 16 DevTools MCP Agent Context
└── docker-compose.yml            # Multi-container orchestration bridge`;

    const roleBranches =
        roles.length > 0
            ? roles.map((r, i) => {
                  const roleName = r.role || r.title || r.role_title || `Engineer ${i + 1}`;
                  const respText= r.responsibility || r.focus || r.complexity || "Core architecture implementation";
                  const branchSlug = roleName
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-");
                  return {
                      role: roleName,
                      branch: `feat/sprint0-${branchSlug}`,
                      resp:
                          r.responsibility ||
                          r.focus ||
                          "Core microservice & schema implementation",
                  };
              })
            : [
                  {
                      role: "Lead Backend Architect",
                      branch: "feat/sprint0-fastapi-core",
                      resp: "FastAPI Pydantic contracts & GitHub telemetry worker",
                  },
                  {
                      role: "Frontend Systems Engineer",
                      branch: "feat/sprint0-nextjs16-proxy",
                      resp: "Next.js 16 App Router, proxy.ts & Mermaid AST UI",
                  },
              ];

    const shellScript = `#!/usr/bin/env bash
# ============================================================================
# SyncStack Enterprise — Bi-Directional Spec-to-Repo Sprint 0 Compiler
# Target Architecture: ${projectTitle} (${domain})
# Stack: ${techStack.join(", ")}
# ============================================================================
set -e

mkdir -p ${slug}/{.github/workflows,ai-engine,src/{app,actions,models}}
cd ${slug}
git init -b main

cat << 'EOF' > AGENTS.md
# AGENTS.md — Next.js 16 DevTools MCP Context
- **Architecture:** ${projectTitle}
- **Domain:** ${domain}
- **Core Stack:** ${techStack.join(", ")}
- **Guardrails:** Enforce strict Pydantic v2 JSON schemas and Next.js 16 read-your-writes cache semantics.
EOF

cat << 'EOF' > docker-compose.yml
version: "3.9"
services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      - AI_ENGINE_BASE_URL=http://ai-engine:8000
  ai-engine:
    build: ./ai-engine
    ports: ["8000:8000"]
EOF

# Provision role-isolated feature branches
${roleBranches.map((rb) => `git checkout -b ${rb.branch} && git checkout main`).join("\n")}

echo "✅ Sprint-0 Monorepo '${slug}' compiled with ${roleBranches.length} role branches!"`;

    const ticketsMarkdown = sprints
        .map((m, idx) => {
            const phaseTitle = m.phase || m.title || `Phase ${idx + 1}`;
            const estHours = m.estimatedHours || m.estimated_hours || 16;
            const items = m.deliverables || m.tasks || ["Core service module"];
            const assignedRole =
                roleBranches[idx % roleBranches.length]?.role || "Squad Lead";
            const assignedBranch =
                roleBranches[idx % roleBranches.length]?.branch || "feat/sprint";
            return `### [SPRINT-0${idx + 1}] ${phaseTitle} (${estHours}h est.)
- **Assigned Role:** ${assignedRole} (\`${assignedBranch}\`)
- **Deliverables:** ${items.join(" • ")}`;
        })
        .join("\n\n");

    function handleCopyScript() {
        navigator.clipboard.writeText(shellScript);
        setCopiedScript(true);
        toast.success("Sprint-0 Monorepo Compiler script copied!");
        setTimeout(() => setCopiedScript(false), 2000);
    }

    function handleDownloadScript() {
        const blob = new Blob([shellScript], { type: "text/x-sh" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scaffold-${slug}.sh`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(`Downloaded scaffold-${slug}.sh!`);
    }

    function handleCopyTickets() {
        navigator.clipboard.writeText(
            ticketsMarkdown || `# ${projectTitle} Sprint Tickets`
        );
        setCopiedTickets(true);
        toast.success("GitHub Issues / Linear Sprint Tickets copied!");
        setTimeout(() => setCopiedTickets(false), 2000);
    }

    return (
        <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span>
                            Bi-Directional Spec-to-Repo Compiler (&ldquo;Sprint 0 in 60 Seconds&rdquo;)
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Compiles this Mermaid.js blueprint into an executable monorepo scaffold, `AGENTS.md`, role branches, and Linear/GitHub issues.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleCopyScript}
                        className="h-8 text-xs gap-1.5"
                    >
                        {copiedScript ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedScript ? "Copied Script" : "Copy CLI Scaffold"}
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleDownloadScript}
                        className="h-8 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                        <Download className="w-3.5 h-3.5" /> Download `.sh`
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-xl border bg-zinc-950 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300 border-b border-zinc-800 pb-1.5">
                        <span className="flex items-center gap-1.5">
                            <FolderTree className="w-3.5 h-3.5 text-emerald-400" />
                            Compiled Monorepo Filetree
                        </span>
                        <Badge
                            variant="outline"
                            className="text-[9px] border-zinc-700 text-zinc-400"
                        >
                            Next.js 16 + FastAPI
                        </Badge>
                    </div>
                    <pre className="text-[10px] font-mono text-emerald-400/90 overflow-x-auto leading-relaxed">
                        {fileTreeSpec}
                    </pre>
                </div>

                <div className="rounded-xl border bg-card p-3.5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold border-b pb-1.5">
                            <span className="flex items-center gap-1.5">
                                <GitBranch className="w-3.5 h-3.5 text-amber-500" />
                                Auto-Provisioned Role Branches
                            </span>
                            <Badge variant="secondary" className="text-[9px]">
                                {roleBranches.length} Branches
                            </Badge>
                        </div>

                        <div className="space-y-1.5">
                            {roleBranches.map((rb, i) => (
                                <div
                                    key={i}
                                    className="rounded-lg border bg-background/60 p-2 space-y-0.5"
                                >
                                    <div className="flex items-center justify-between font-bold text-[11px]">
                                        <span>{rb.role}</span>
                                        <code className="text-[10px] text-indigo-400 font-mono">
                                            {rb.branch}
                                        </code>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        {rb.resp}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleCopyTickets}
                        className="w-full h-8 text-xs gap-1.5 font-semibold"
                    >
                        {copiedTickets ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                            <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        {copiedTickets
                            ? "Copied Sprint Issues to Clipboard!"
                            : "Export Nodes as GitHub Issues / Linear Markdown"}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border bg-zinc-950 p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-300">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                        Executable Sprint-0 Provisioning Script (`scaffold-{slug}.sh`)
                    </span>
                </div>
                <pre className="text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-40 leading-relaxed">
                    {shellScript}
                </pre>
            </div>
        </div>
    );
}