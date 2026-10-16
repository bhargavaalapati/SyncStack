"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">Runtime Connection Interrupted</h2>
            <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
                An unhandled exception occurred within our distributed database routing layer or microservice proxy. The core data state remains protected.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()} variant="outline">Refresh Gateway</Button>
                <Button onClick={() => reset()}>Re-evaluate Boundary</Button>
            </div>
        </div>
    );
}