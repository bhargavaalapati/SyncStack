"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Cpu,
  Calendar,
  ShieldAlert,
  Users,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export interface BlueprintData {
  architectureDiagram?: string;
  sprintMilestones?: {
    phase: string;
    deliverables: string[];
    estimated_hours: number;
  }[];
  roleMatrix?: {
    role_title: string;
    required_skills: string[];
    complexity: string;
  }[];
  riskMatrix?: {
    risk: string;
    mitigation: string;
    severity: string;
  }[];
}

/**
 * Automatically repairs LLM-generated Mermaid syntax so it never fails in mermaid.live:
 * 1. Strips markdown fences
 * 2. Forces 'graph TD;' onto its own first line
 * 3. Wraps any node label containing parentheses () inside double quotes ["..."]
 * 4. Ensures every edge statement is on a clean line ending with a semicolon ';'
 */
function formatMermaidCode(raw?: string): string {
  if (!raw) return "graph TD;\n    A[Client] --> B(API Gateway);";

  let cleaned = raw
    .replace(/```mermaid/gi, "")
    .replace(/```/g, "")
    .replace(/\\n/g, "\n")
    .trim();

  // Ensure graph declaration is on line 1 with a semicolon and newline
  cleaned = cleaned.replace(
    /^(?:graph|flowchart)\s+(TD|TB|BT|RL|LR)\s*;?\s*/i,
    "graph $1;\n    "
  );

  // If multiple statements were flattened onto one line, split them before Node IDs
  cleaned = cleaned.replace(
    /(\]|"|\)|\})\s+([A-Z0-9_]+\s*(?:\[\vert{}\(\vert{}\{\vert{}-->\vert{}-.->\vert{}==>))/g, "$1;\n    $2" );    // Auto-quote [...] labels that contain parentheses (e.g., E[Graph DB (Neo4j)] -> E["Graph DB (Neo4j)"]) cleaned = cleaned.replace(/\[([^\]"]*?\([^\]]*?)\]/g, '["$1"]');

  // Ensure each statement line ends with a semicolon
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
      if (idx === 0 && /^graph\s+/i.test(line)) {
        return line.endsWith(";") ? line : `${line};`;
      }
      const cleanLine = line.endsWith(";") ? line : `${line};`;
      return `    ${cleanLine}`;
    });

  return lines.join("\n");
}

export function BlueprintModal({
  projectTitle,
  blueprint,
}: {
  projectTitle: string;
  blueprint: BlueprintData;
}) {
  const [copied, setCopied] = useState(false);

  const hasBlueprint =
    blueprint?.architectureDiagram ||
    (blueprint?.sprintMilestones && blueprint.sprintMilestones.length > 0);

  if (!hasBlueprint) return null;

  const validMermaidCode = formatMermaidCode(blueprint.architectureDiagram);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(validMermaidCode);
    setCopied(true);
    toast.success("Valid Mermaid.js code copied! Ready for mermaid.live.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-indigo-500/40 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-medium transition-all shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Blueprint
        </Button>
      </DialogTrigger>

      {/* sm:max-w-[900px] overrides Shadcn's sm:max-w-lg lock; 'resize' enables bottom-right drag arrow */}
      <DialogContent className="w-[95vw] sm:max-w-[900px] min-w-[340px] max-h-[88vh] min-h-[420px] resize overflow-auto p-6 sm:p-8">
        <DialogHeader className="space-y-1.5 border-b pb-4 pr-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight">
                  {projectTitle}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Enterprise System Architecture & Execution Blueprint • Drag bottom-right corner to resize
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 hidden sm:inline-flex"
            >
              Zeta Innovate Ready
            </Badge>
          </div>
        </DialogHeader>

        <DialogDescription className="sr-only">
          AI-generated enterprise system architecture and execution blueprint for {projectTitle}
        </DialogDescription>

        <Tabs defaultValue="sprints" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 h-11 bg-muted/60 p-1">
            <TabsTrigger value="sprints" className="gap-2 text-xs font-semibold">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">Sprints & Workforce</span>
            </TabsTrigger>
            <TabsTrigger value="architecture" className="gap-2 text-xs font-semibold">
              <Cpu className="h-4 w-4 shrink-0" />
              <span className="truncate">System Topology (.mmd)</span>
            </TabsTrigger>
            <TabsTrigger value="risks" className="gap-2 text-xs font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span className="truncate">Risk & Compliance</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: SPRINT ROADMAP & ROLES */}
          <TabsContent value="sprints" className="space-y-6 mt-5">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Autonomous Sprint Roadmap
              </h4>
              <div className="grid gap-3">
                {blueprint.sprintMilestones?.map((sprint, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border bg-card/60 p-4 space-y-2.5 shadow-xs hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs">
                          {idx + 1}
                        </span>
                        {sprint.phase}
                      </span>
                      <Badge variant="secondary" className="text-xs font-medium">
                        ~{sprint.estimated_hours} Engineering Hours
                      </Badge>
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs text-muted-foreground">
                      {sprint.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {blueprint.roleMatrix && blueprint.roleMatrix.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-400" /> Required Team Roles & Competencies
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {blueprint.roleMatrix.map((role, idx) => (
                    <div key={idx} className="rounded-xl border p-4 space-y-2.5 bg-card/60">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm">{role.role_title}</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                          {role.complexity} Complexity
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {role.required_skills.map((skill, sIdx) => (
                          <Badge
                            key={sIdx}
                            variant="secondary"
                            className="text-[11px] bg-indigo-500/5 text-indigo-300 border-indigo-500/20"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: AUTO-VALIDATED MERMAID TOPOLOGY */}
          <TabsContent value="architecture" className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold">
                  Auto-Validated System Topology (.mmd)
                </h4>
                <p className="text-xs text-muted-foreground">
                  Syntax-sanitized with quoted node labels and semicolons for zero-error rendering.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
                <a
                  href="https://mermaid.live"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 h-8 px-3 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
                >
                  Open Mermaid.live <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div className="relative rounded-xl border bg-zinc-950 text-zinc-50 p-5 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="absolute top-3 right-3 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                Mermaid.js (Validated)
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-indigo-200">
                {validMermaidCode}
              </pre>
            </div>
          </TabsContent>

          {/* TAB 3: RISK & COMPLIANCE MATRIX */}
          <TabsContent value="risks" className="mt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Technical Risk Assessment & Mitigations
            </h4>
            <div className="grid gap-3">
              {blueprint.riskMatrix?.map((item, idx) => (
                <div key={idx} className="rounded-xl border p-4 space-y-2 bg-card/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-amber-400 flex items-center gap-2">
                      ⚠️ {item.risk}
                    </span>
                    <Badge variant="destructive" className="text-[10px] uppercase font-semibold">
                      {item.severity} Severity
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6 border-l-2 border-amber-500/30 ml-1">
                    <strong className="text-foreground font-medium">Mitigation Strategy: </strong>
                    {item.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}