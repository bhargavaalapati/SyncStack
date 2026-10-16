// src/app/page.tsx
import Navbar from "@/components/ui/Navbar";
import AnimatedLanding from "@/components/AnimatedLanding";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
            {/* Renders perfectly on the server, safely executing auth() and server actions */}
            <Navbar />

            {/* Captures the client boundary safely for Framer Motion animations */}
            <AnimatedLanding />
        </div>
    );
}