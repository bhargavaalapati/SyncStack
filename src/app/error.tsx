"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, RefreshCw, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical System Boundary Error Caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-[radial-gradient(#8080802e_1px,transparent_1px)] bg-size-[22px_22px]">
            <div className="max-w-lg w-full rounded-2xl border bg-card/85 backdrop-blur-md p-8 shadow-lg space-y-6">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/25">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <Badge
                        variant="outline"
                        className="border-red-500/30 text-red-400 bg-red-500/5 text-[11px] font-mono"
                    >
                        FAULT_DIGEST: {error.digest || "ERR_DISTRIBUTED_BOUNDARY"}
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        Runtime Connection Interrupted
                    </h2>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                        An unhandled exception occurred within our distributed database routing layer or microservice proxy. The core data state remains protected.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="gap-1.5 text-xs font-semibold"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Gateway
                    </Button>
                    <Button
                        onClick={() => reset()}
                        className="gap-1.5 text-xs font-semibold"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Re-evaluate Boundary
                    </Button>
                    <Link href="/">
                        <Button
                            variant="secondary"
                            className="gap-1.5 text-xs font-semibold"
                        >
                            <Home className="w-3.5 h-3.5" /> Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}