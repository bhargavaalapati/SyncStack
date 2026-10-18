"use client";

import React, { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Code2, Eye, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface MermaidDiagramProps {
  chart?: string;
  code?: string;
}

/**
 * Normalizes any raw/legacy Mermaid string into strict multi-line flowchart syntax:
 * 1. Strips markdown fences, escaped quotes (\"), escaped newlines (\\n), and non-breaking spaces.
 * 2. Flattens any nested brackets (e.g. E["Graph DB["Neo4j"]"] or E[Graph DB["Neo4j"]]) into clean single labels.
 * 3. Normalizes all node shapes ([], (), {}) into safe NodeID["Label"] format.
 * 4. Splits multiple edge statements on the same line strictly on horizontal whitespace.
 * 5. Guarantees 'flowchart TD' on line 1 and 1 statement per indented line.
 */
export function normalizeMermaidSource(raw?: string): string {
  if (!raw || !raw.trim()) {
    return 'flowchart TD\n    A["Client Interface"] --> B["API Gateway"]';
  }

  // 1. Basic sanitization: code fences, escaped newlines, escaped quotes, non-breaking spaces
  let body = raw
    .replace(/```mermaid/gi, "")
    .replace(/```/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, '"')
    .replace(/\u00a0/g, " ")
    .replace(/&quot;/g, '"')
    .trim();

  // 2. Strip existing header so we work strictly with statements
  body = body.replace(/^(?:graph|flowchart)\s+(?:TD|TB|LR|RL|BT)\s*;?\s*/i, "");

  // 3. Semicolons -> newlines
  body = body.replace(/;/g, "\n");

  // 4. Flatten existing nested brackets (e.g. from LLM prompt output)
  let prev = "";
  while (prev !== body) {
    prev = body;
    body = body.replace(
      /\["([^"\[\]]*?)\["?(.*?)"?\](.*?)\]/g,
      (_m: string, before: string, inner: string, after: string) => {
        const cleanInner = inner.replace(/"/g, "").replace(/[\[\]]/g, "").trim();
        const cleanBefore = before.trim();
        const cleanAfter = after.replace(/^"\]?/, "").replace(/"/g, "").replace(/[\[\]]/g, "").trim();
        const parts = [cleanBefore, cleanInner, cleanAfter].filter(Boolean);
        return `["${parts.join(" - ")}"]`;
      }
    );
  }

  // 5. Square brackets normalization: NodeID[Label (with parens)] -> NodeID["Label (with parens)"]
  // IMPORTANT: Run this BEFORE round-paren normalization so inner parens like (Neo4j) are protected inside quotes!
  body = body.replace(
    /([A-Za-z0-9_]+)\s*\[([^\[\]"\n]+?)\]/g,
    (_m: string, id: string, label: string) => `${id}["${label.trim()}"]`
  );

  // 6. Round-paren nodes: NodeID(Label) -> NodeID["Label"]
  // CRITICAL: Must be preceded by start of line, newline, whitespace, or an arrow so we NEVER match inside labels!
  body = body.replace(
    /((?:-->|-\.->|==>|---|;|\n|^)[ \t]*[A-Za-z0-9_]+)\s*\(([^()"\n]+?)\)/g,
    (_m: string, prefix: string, label: string) => `${prefix}["${label.replace(/"/g, "'").trim()}"]`
  );

  // 7. Curly-brace nodes: NodeID{Label} -> NodeID["Label"]
  body = body.replace(
    /((?:-->|-\.->|==>|---|;|\n|^)[ \t]*[A-Za-z0-9_]+)\s*\{([^{}"\n]+?)\}/g,
    (_m: string, prefix: string, label: string) => `${prefix}["${label.replace(/"/g, "'").trim()}"]`
  );

  // 8. Split multiple edge statements on the same line strictly using horizontal whitespace
  prev = "";
  while (prev !== body) {
    prev = body;

    // Pattern A: After closing label "] followed on the same line by another node and arrow
    body = body.replace(
      /(\]"?)[ \t]+([A-Za-z0-9_]+(?:\s*\["[^"\n]*"\])?[ \t]*(?:-->|-\.->|==>|---|--\s*[^-\n]+\s*-->))/g,
      "$1\n$2"
    );

    // Pattern B: After bare target node followed on the same line by another node and arrow
    body = body.replace(
      /((?:-->|-\.->|==>|---)\s*[A-Za-z0-9_]+)[ \t]+([A-Za-z0-9_]+(?:\s*\["[^"\n]*"\])?[ \t]*(?:-->|-\.->|==>|---|--\s*[^-\n]+\s*-->))/g,
      "$1\n$2"
    );
  }

  // 9. Sanitize reserved words as node IDs: 'end' -> 'finishNode'
  body = body.replace(
    /\bend\b(?=\s*(?:\[|\(|\{|-->|-\.->|==>|---|\n|$))/gi,
    "finishNode"
  );

  // 8. Clean, filter empty lines, and indent
  const cleanLines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(?:graph|flowchart)\s+(?:TD|TB|LR|RL|BT)$/i.test(line))
    .map((line) => `    ${line}`);

  return ["flowchart TD", ...cleanLines].join("\n");
}

export default function MermaidDiagram({ chart, code }: MermaidDiagramProps) {
  const rawInput = chart ?? code ?? "";
  const cleanCode = normalizeMermaidSource(rawInput);

  const uniqueId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function validateAndRender() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        });

        await mermaid.parse(cleanCode);

        const renderId = `mermaid-graph-${uniqueId}-${Date.now()}`;
        const rendered = await mermaid.render(renderId, cleanCode);

        if (isMounted) {
          setSvg(rendered.svg);
          setParseError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Invalid Mermaid syntax detected.";
          setParseError(message);
          setViewMode("code");
        }
      }
    }

    validateAndRender();
    return () => {
      isMounted = false;
    };
  }, [cleanCode, uniqueId]);

  function handleCopy() {
    navigator.clipboard.writeText(cleanCode);
    setCopied(true);
    toast.success("Formatted multi-line Mermaid code copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleToggleView() {
    setViewMode((prev) => (prev === "visual" ? "code" : "visual"));
  }

  const badgeClass = parseError
    ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
    : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10";

  return (
    <div className="space-y-3 w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={badgeClass}>
            {parseError ? "Syntax Fallback Mode" : "✓ mermaid.parse() Verified"}
          </Badge>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {cleanCode.split("\n").length} lines
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!parseError && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={handleToggleView}
            >
              {viewMode === "visual" ? (
                <>
                  <Code2 className="h-3.5 w-3.5" /> View .mmd Code
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" /> View Visual Diagram
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1.5"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "Copied!" : "Copy .mmd"}
          </Button>

          <a
            href="https://mermaid.live"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md border text-xs font-medium hover:bg-muted transition-colors"
          >
            Mermaid.live <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {parseError && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-1 overflow-x-auto">
            <p className="font-semibold">Mermaid Parser Notice:</p>
            <pre className="text-[11px] whitespace-pre-wrap font-mono opacity-90">
              {parseError}
            </pre>
          </div>
        </div>
      )}

      {viewMode === "visual" && svg && !parseError ? (
        <div
          className="rounded-xl border bg-zinc-950/90 p-6 overflow-x-auto flex justify-center items-center min-h-80 shadow-inner [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="relative rounded-xl border bg-zinc-950 text-zinc-50 p-5 font-mono text-xs overflow-x-auto shadow-inner">
          <pre className="whitespace-pre leading-relaxed text-indigo-200">
            {cleanCode}
          </pre>
        </div>
      )}
    </div>
  );
}