import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex flex-col items-center justify-center gap-4 animate-fade-in">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm font-semibold tracking-wide text-muted-foreground animate-pulse">
                Synchronizing Application Pipeline...
            </p>
        </div>
    );
}