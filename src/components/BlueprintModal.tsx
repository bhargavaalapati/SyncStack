"use client";

import React from "react";
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
import { Sparkles, Cpu, Calendar, ShieldAlert, Users } from "lucide-react";
import MermaidDiagram from "@/components/blueprint/MermaidDiagram";

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

export function BlueprintModal({
  projectTitle,
  blueprint,
}: {
  projectTitle: string;
  blueprint: BlueprintData;
}) {
  const hasBlueprint =
    Boolean(blueprint?.architectureDiagram) ||
    Boolean(blueprint?.sprintMilestones && blueprint.sprintMilestones.length > 0);

  if (!hasBlueprint) return null;

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

      <DialogContent className="w-[95vw] sm:max-w-225 min-w-85 max-h-[88vh] min-h-105 resize overflow-auto p-6 sm:p-8">
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
                  Enterprise System Architecture & Execution Blueprint
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

          {/* TAB 2: INTERACTIVE MERMAID DIAGRAM + VALIDATED CODE */}
          <TabsContent value="architecture" className="mt-5">
            <MermaidDiagram chart={blueprint.architectureDiagram} />
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