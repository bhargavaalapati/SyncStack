"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Code2, Rocket } from "lucide-react";
import { motion, Variants } from "framer-motion";

// Explicitly type variants to prevent TypeScript widening strings
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export default function AnimatedLanding() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-3xl -z-10" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-4xl mx-auto text-center z-10 pt-16 pb-24"
            >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm font-medium mb-8 text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Powered by Gemini 2.5 Flash
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                    Stop skill-stacking. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500">
                        Start building.
                    </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                    SyncStack is the intelligent matchmaking engine. We algorithmically assemble balanced, cross-functional engineering teams so you can ship deployable products faster.
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/bulletin">
                        <Button size="lg" className="h-12 px-8 text-md font-semibold w-full sm:w-auto shadow-lg hover:shadow-primary/25 transition-all">
                            Enter the Bulletin
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>

            {/* Feature Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full pb-24 z-10"
            >
                {[
                    { icon: <Code2 className="w-6 h-6 text-primary" />, title: "Deterministic Pairing", text: "Post your dependencies. The system filters the talent pool to find exactly what your stack is missing.", color: "bg-primary/10" },
                    { icon: <Sparkles className="w-6 h-6 text-amber-500" />, title: "Semantic Evaluation", text: "Our GenAI microservice evaluates candidate portfolios, generating exact compatibility scores.", color: "bg-amber-500/10" },
                    { icon: <Rocket className="w-6 h-6 text-green-600" />, title: "Enterprise Workflow", text: "Manage your inbound applicants through a clean, intuitive dashboard. Accept, reject, and build.", color: "bg-green-500/10" }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.text}</p>
                    </motion.div>
                ))}
            </motion.div>
        </main>
    );
}