"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
    Sparkles,
    Code2,
    Rocket,
    ShieldCheck,
    Cpu,
    GitBranch,
    Trophy,
    ArrowRight,
    Check,
    CreditCard,
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { SummarizeWithAi } from "@/components/SummarizeWithAi";
import { toast } from "sonner";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.12 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
};

export default function AnimatedLanding() {
    const [selectedPlan, setSelectedPlan] = useState<{
        name: string;
        price: string;
    } | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    function handleSimulateGateway(gateway: "Razorpay" | "Stripe") {
        setProcessingPayment(true);
        const id = toast.loading(`Initializing ${gateway} Secure Checkout...`);
        setTimeout(() => {
            setProcessingPayment(false);
            setSelectedPlan(null);
            toast.success(
                `${gateway} Sandbox Transaction Verified! ${selectedPlan?.name} features unlocked for evaluation.`,
                { id, duration: 5000 }
            );
        }, 1200);
    }

    return (
        <main className="flex-1 flex flex-col items-center justify-center px-4 relative overflow-hidden bg-[radial-gradient(#8080802e_1px,transparent_1px)] bg-size-[22px_22px]">
            {/* Ambient Glow Gradients */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-120 h-120 bg-amber-500/10 rounded-full blur-3xl -z-10" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="max-w-4xl mx-auto text-center z-10 pt-14 pb-12"
            >
                <motion.div
                    variants={itemVariants}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border text-xs sm:text-sm font-medium mb-8 text-muted-foreground shadow-xs"
                >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>
                        Powered by <strong>Gemini 2.5 Flash</strong> • Next.js 16 + FastAPI Microservice
                    </span>
                </motion.div>

                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6"
                >
                    Stop skill-stacking. <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-amber-500">
                        Start building.
                    </span>
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
                >
                    SyncStack is the autonomous project architecture and workforce orchestration engine. Transform raw ideas into validated Mermaid.js blueprints, verify developer skills via live GitHub telemetry, and assemble high-synergy engineering teams.
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/bulletin">
                        <Button
                            size="lg"
                            className="h-12 px-8 text-base font-semibold w-full sm:w-auto shadow-lg hover:shadow-primary/25 transition-all gap-2"
                        >
                            Enter the Bulletin <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Link href="/leaderboard">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-12 px-6 text-base font-semibold w-full sm:w-auto gap-2 bg-background/80"
                        >
                            <Trophy className="w-4 h-4 text-amber-500" /> Global Roster & Streaks
                        </Button>
                    </Link>
                </motion.div>

                {/* Enterprise KPI Telemetry Strip */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 pt-8 border-t border-border/60 text-left"
                >
                    <div className="rounded-xl border bg-card/80 backdrop-blur-xs p-3.5">
                        <div className="text-xl font-black text-foreground">~85%</div>
                        <div className="text-xs text-muted-foreground">
                            Faster Architecture Scoping
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card/80 backdrop-blur-xs p-3.5">
                        <div className="text-xl font-black text-emerald-500">&lt;0.5ms</div>
                        <div className="text-xs text-muted-foreground">
                            SHA-256 Cache Hit Latency
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card/80 backdrop-blur-xs p-3.5">
                        <div className="text-xl font-black text-indigo-400">100%</div>
                        <div className="text-xs text-muted-foreground">
                            mermaid.parse() Validated
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card/80 backdrop-blur-xs p-3.5">
                        <div className="text-xl font-black text-amber-500">Zero-Trust</div>
                        <div className="text-xs text-muted-foreground">
                            Live GitHub Repo Auditing
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Summarize with AI Multi-LLM Bar */}
            <div className="w-full max-w-5xl mx-auto mb-14 z-10">
                <SummarizeWithAi />
            </div>

            {/* Interactive 3-Stage Autonomous Pipeline Preview */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="max-w-5xl mx-auto w-full mb-16 z-10"
            >
                <div className="rounded-2xl border bg-card/85 backdrop-blur-md shadow-sm p-6 sm:p-8 space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4">
                        <div className="flex items-center gap-2.5">
                            <Cpu className="w-5 h-5 text-indigo-400" />
                            <h2 className="text-lg font-bold">
                                Autonomous Enterprise Pipeline
                            </h2>
                        </div>
                        <Badge
                            variant="outline"
                            className="text-xs border-indigo-500/30 text-indigo-400"
                        >
                            Decoupled Next.js 16 + FastAPI Architecture
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                        <div className="rounded-xl border bg-background/70 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-[10px]">
                                    Stage 01
                                </Badge>
                                <Cpu className="w-4 h-4 text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-sm">
                                Autonomous System Architect
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Converts a 1-line idea into 3-phase sprints, hour estimates, risk matrices, and validated Mermaid.js system flowcharts.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-background/70 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-[10px]">
                                    Stage 02
                                </Badge>
                                <GitBranch className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h3 className="font-bold text-sm">
                                Anti-Hallucination Skill Auditor
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Queries the live GitHub REST API to cross-verify repository languages and commit depth against claimed developer skills.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-background/70 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-[10px]">
                                    Stage 03
                                </Badge>
                                <ShieldCheck className="w-4 h-4 text-amber-500" />
                            </div>
                            <h3 className="font-bold text-sm">
                                Multi-Vector Team Matchmaking
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Computes semantic capability overlap, role fit, and ramp-up skill gaps with 1-click AI recruitment pitches.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Core Feature Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full pb-20 z-10"
            >
                {[
                    {
                        icon: <Code2 className="w-6 h-6 text-primary" />,
                        title: "Deterministic Pairing",
                        text: "Post your dependencies. The system filters the talent pool to find exactly what your stack is missing.",
                        color: "bg-primary/10",
                    },
                    {
                        icon: <Sparkles className="w-6 h-6 text-amber-500" />,
                        title: "Semantic Evaluation",
                        text: "Our GenAI microservice evaluates candidate portfolios, generating exact compatibility scores and skill-gap diagnostics.",
                        color: "bg-amber-500/10",
                    },
                    {
                        icon: <Rocket className="w-6 h-6 text-green-600" />,
                        title: "Enterprise Workflow",
                        text: "Manage your inbound applicants through a clean, intuitive Workforce Command Center. Verify, accept, and ship.",
                        color: "bg-green-500/10",
                    },
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="p-6 rounded-2xl bg-card/90 backdrop-blur-xs border border-border/50 shadow-sm"
                    >
                        <div
                            className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                        >
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.text}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Commercial SaaS Tiers & Payment Gateway Integration */}
            <section className="max-w-5xl mx-auto w-full pb-24 z-10">
                <div className="text-center mb-10 space-y-2">
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500">
                        Commercial SaaS Model Preview • Real Payment Integration Coming Soon
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Built for Hackers, Incubators & Enterprise R&D
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                        Scale from campus hackathons to organization-wide workforce allocation with integrated Razorpay & Stripe billing.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Free Tier */}
                    <div className="rounded-2xl border bg-card/85 p-6 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold">Campus Builder</h3>
                            <div className="text-3xl font-black">
                                ₹0 <span className="text-xs font-normal text-muted-foreground">/ forever</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Essential AI architecture and team matchmaking for students and hackathon builders.
                            </p>
                            <ul className="space-y-2 pt-3 text-xs">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> 5 AI Project Blueprints / mo
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Public GitHub Skill Audit
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Global Roster & Streak Tracking
                                </li>
                            </ul>
                        </div>
                        <Link href="/bulletin">
                            <Button variant="outline" className="w-full text-xs font-semibold">
                                Current Active Plan
                            </Button>
                        </Link>
                    </div>

                    {/* Pro Tier */}
                    <div className="rounded-2xl border-2 border-indigo-500/60 bg-card p-6 flex flex-col justify-between space-y-6 shadow-lg relative">
                        <Badge className="absolute -top-3 right-4 bg-indigo-500 text-white text-[10px]">
                            Most Popular
                        </Badge>
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold">Pro Solutions Architect</h3>
                            <div className="text-3xl font-black">
                                ₹499 <span className="text-xs font-normal text-muted-foreground">/ month</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                High-throughput Gemini 2.5 compute, private repo auditing, and priority matchmaking.
                            </p>
                            <ul className="space-y-2 pt-3 text-xs">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Unlimited AI System Blueprints
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Private GitHub & GitLab Repo Audits
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Export Blueprints to Jira & Linear
                                </li>
                            </ul>
                        </div>
                        <Button
                            type="button"
                            onClick={() =>
                                setSelectedPlan({ name: "Pro Solutions Architect", price: "₹499/mo" })
                            }
                            className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5"
                        >
                            <CreditCard className="w-3.5 h-3.5" /> Upgrade with Razorpay / Stripe
                        </Button>
                    </div>

                    {/* Enterprise Tier */}
                    <div className="rounded-2xl border bg-card/85 p-6 flex flex-col justify-between space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold">Enterprise Incubator</h3>
                            <div className="text-3xl font-black">
                                ₹4,999 <span className="text-xs font-normal text-muted-foreground">/ month</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Dedicated workforce orchestration for universities, IT bench allocation, and R&D hubs.
                            </p>
                            <ul className="space-y-2 pt-3 text-xs">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Custom SAML / SSO & Role Governance
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Dedicated Redis + Vector Cache Cluster
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-emerald-500" /> Cohort Telemetry & Exportable Reports
                                </li>
                            </ul>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                setSelectedPlan({ name: "Enterprise Incubator", price: "₹4,999/mo" })
                            }
                            className="w-full text-xs font-semibold"
                        >
                            Provision Enterprise License
                        </Button>
                    </div>
                </div>
            </section>

            {/* Razorpay / Stripe Checkout Modal */}
            <Dialog
                open={Boolean(selectedPlan)}
                onOpenChange={(isOpen) => !isOpen && setSelectedPlan(null)}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-400" />
                            Enterprise Payment Gateway (Sandbox)
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            Upgrading to <strong>{selectedPlan?.name}</strong> ({selectedPlan?.price})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2 text-xs text-muted-foreground">
                        <p>
                            Select your preferred payment rail to test commercial subscription provisioning:
                        </p>
                        <div className="grid gap-2.5 pt-2">
                            <Button
                                type="button"
                                disabled={processingPayment}
                                onClick={() => handleSimulateGateway("Razorpay")}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                            >
                                Pay {selectedPlan?.price} via Razorpay (UPI / Cards / NetBanking)
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processingPayment}
                                onClick={() => handleSimulateGateway("Stripe")}
                                className="w-full font-semibold"
                            >
                                Pay {selectedPlan?.price} via Stripe Global Checkout
                            </Button>
                        </div>
                    </div>
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-300">
                        <strong>Sandbox Placeholder Notice:</strong> This checkout demonstrates our commercial monetization architecture. Live Razorpay/Stripe billing integration is coming soon—no real charges are processed.
                    </div>
                </DialogContent>
            </Dialog>
        </main>
    );
}