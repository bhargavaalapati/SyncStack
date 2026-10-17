// src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (key !== "hackathon2026") {
        return NextResponse.json({ error: "Unauthorized endpoint access." }, { status: 403 });
    }

    await connectDB();

    // 1. Upsert Genesis Enterprise Lead
    const dummyUser = await User.findOneAndUpdate(
        { email: "admin@syncstack.io" },
        {
            name: "Zeta Enterprise Innovation Hub",
            image: "https://github.com/github.png",
            github_url: "https://github.com/bhargavaalapati",
            tech_skills: ["System Architecture", "Next.js", "FastAPI", "Cloud Native"],
            reputation_score: 1450,
            projects_shipped: 18,
            trust_score: 98,
            role: "Principal Solutions Architect",
            bio: "Enterprise R&D hub orchestrating high-impact AI, Cloud, and IoT architectures.",
            commitment_level: "Grinder",
        },
        { upsert: true, returnDocument: "after" }
    );

    // 2. Idempotent Seeded Engineers with Verified AI Trust Telemetry
    const sampleUsers = [
        {
            name: "Aarav Sharma",
            email: "aarav.sharma@syncstack.io",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav",
            github_url: "https://github.com/torvalds",
            role: "Lead Full-Stack & Cloud Architect",
            bio: "Distributed systems engineer specializing in Next.js 15, FastAPI microservices, and Kubernetes.",
            commitment_level: "Grinder",
            projects_shipped: 14,
            reputation_score: 1280,
            trust_score: 95,
            tech_skills: ["Next.js", "TypeScript", "Node.js", "MongoDB", "Docker", "Kubernetes"],
        },
        {
            name: "Sarah Jenkins",
            email: "sarah.jenkins@syncstack.io",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            github_url: "https://github.com/karpathy",
            role: "Applied GenAI & RAG Scientist",
            bio: "Building deterministic LLM pipelines, multi-agent LangGraph workflows, and low-latency inference.",
            commitment_level: "Balanced",
            projects_shipped: 11,
            reputation_score: 1120,
            trust_score: 92,
            tech_skills: ["Python", "FastAPI", "Gemini API", "LangChain", "PyTorch", "Vector DB"],
        },
        {
            name: "David Kumar",
            email: "david.kumar@syncstack.io",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            github_url: "https://github.com/VitalikButerin",
            role: "FinTech & Zero-Knowledge Protocol Engineer",
            bio: "High-throughput settlement engines, Rust systems programming, and smart contract auditing.",
            commitment_level: "Grinder",
            projects_shipped: 15,
            reputation_score: 1340,
            trust_score: 94,
            tech_skills: ["Rust", "Solidity", "Go", "Redis", "PostgreSQL", "Web3.js"],
        },
        {
            name: "Elena Rostova",
            email: "elena.rostova@syncstack.io",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
            github_url: "https://github.com/shadcn",
            role: "Design Systems & Frontend Lead",
            bio: "Crafting accessible WCAG-compliant enterprise interfaces with React, Tailwind CSS, and Framer Motion.",
            commitment_level: "Balanced",
            projects_shipped: 9,
            reputation_score: 890,
            trust_score: 88,
            tech_skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Next.js"],
        },
        {
            name: "Michael Chang",
            email: "michael.chang@syncstack.io",
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
            github_url: "https://github.com/kelseyhightower",
            role: "Edge IoT & DevSecOps Architect",
            bio: " Automated CI/CD telemetry, ESP32 edge sensor fleets, MQTT brokers, and AWS IoT Core.",
            commitment_level: "Balanced",
            projects_shipped: 10,
            reputation_score: 960,
            trust_score: 91,
            tech_skills: ["Docker", "AWS", "Python", "MQTT", "ESP32", "Terraform"],
        },
    ];

    for (const u of sampleUsers) {
        await User.findOneAndUpdate({ email: u.email }, u, { upsert: true });
    }

    // 3. Enterprise Projects with Pre-Computed AI Blueprints
    const sampleProjects = [
        {
            creator_id: dummyUser._id,
            title: "Autonomous FinOps & Cloud Cost Anomaly Engine",
            description:
                "Real-time multi-cloud telemetry analyzer that predicts Kubernetes & serverless spend spikes using Gemini 2.5 Flash and triggers automated Terraform scaling policies.",
            required_skills: ["Python", "FastAPI", "Kubernetes", "Docker", "Next.js", "AWS"],
            domain: "Cloud & FinOps AI",
            event_name: "Zeta Innovate 2026",
            team_capacity: 4,
            filled_seats: 2,
            commitment_required: "Grinder",
            status: "Open",
            architectureDiagram: `graph TD;\n    A["CloudWatch / Prometheus Telemetry"] --> B(Kafka Event Stream);\n    B --> C["FastAPI Anomaly Engine"];\n    C --> D["Gemini 2.5 Root-Cause Agent"];\n    D --> E["PostgreSQL Time-Series DB"];\n    D --> F["Next.js 15 FinOps Command Center"];`,
            sprintMilestones: [
                {
                    phase: "Phase 1: Multi-Cloud Metric Ingestion",
                    deliverables: ["Configure Prometheus & AWS Cost Explorer webhooks", "Build time-series normalization schema"],
                    estimated_hours: 45,
                },
                {
                    phase: "Phase 2: Agentic Root-Cause & Auto-Remediation",
                    deliverables: ["Integrate Gemini 2.5 Flash structured cost advisor", "Build Slack/Webhook approval gates"],
                    estimated_hours: 60,
                },
            ],
            roleMatrix: [
                { role_title: "Cloud Infrastructure Lead", required_skills: ["Kubernetes", "Docker", "AWS"], complexity: "High" },
                { role_title: "GenAI Backend Engineer", required_skills: ["Python", "FastAPI", "Gemini API"], complexity: "High" },
            ],
            riskMatrix: [
                {
                    risk: "Over-aggressive auto-scaling policy termination",
                    mitigation: "Enforce human-in-the-loop approval thresholds for production namespaces.",
                    severity: "Critical",
                },
            ],
        },
        {
            creator_id: dummyUser._id,
            title: "Smart Cold-Chain Vaccine Telemetry & Anomaly Platform",
            description:
                "End-to-end IoT sensor mesh tracking temperature-sensitive pharmaceutical shipments with edge MQTT ingestion and predictive spoilage alerts.",
            required_skills: ["Python", "MQTT", "ESP32", "React", "FastAPI", "MongoDB"],
            domain: "Healthcare IoT",
            event_name: "Zeta Innovate 2026",
            team_capacity: 4,
            filled_seats: 1,
            commitment_required: "Balanced",
            status: "Open",
            architectureDiagram: `graph TD;\n    A["ESP32 Thermal Nodes"] --> B(MQTT TLS Broker);\n    B --> C["FastAPI Ingestion Worker"];\n    C --> D["Anomaly Detection Model"];\n    C --> E["MongoDB Atlas Telemetry Store"];\n    D --> F["Real-Time Cold-Chain Dashboard"];`,
            sprintMilestones: [
                {
                    phase: "Phase 1: Edge Firmware & MQTT Broker Setup",
                    deliverables: ["Configure TLS-authenticated MQTT ingestion", "Build offline ring-buffer retry logic"],
                    estimated_hours: 40,
                },
                {
                    phase: "Phase 2: Predictive Thermal Drift Alerts",
                    deliverables: ["Train thermal excursion classifier", "Deploy live route monitoring UI"],
                    estimated_hours: 55,
                },
            ],
            roleMatrix: [
                { role_title: "Embedded IoT Engineer", required_skills: ["ESP32", "MQTT", "Python"], complexity: "High" },
                { role_title: "Full-Stack Dashboard Engineer", required_skills: ["React", "Next.js", "MongoDB"], complexity: "Medium" },
            ],
            riskMatrix: [
                {
                    risk: "Cellular dead-zones during highway transit",
                    deliverables: [],
                    mitigation: "Store encrypted telemetry snapshots on local flash and batch-sync upon reconnection.",
                    severity: "Medium",
                },
            ],
        },
        {
            creator_id: dummyUser._id,
            title: "Zero-Trust API Compliance & Vulnerability Copilot",
            description:
                "Automated pre-deployment security gatekeeper that audits OpenAPI schemas, Dockerfiles, and repository commits against OWASP Top 10 and enterprise compliance rules.",
            required_skills: ["TypeScript", "Next.js", "Python", "Docker", "FastAPI"],
            domain: "Cybersecurity & DevSecOps",
            event_name: "Zeta Innovate 2026",
            team_capacity: 3,
            filled_seats: 1,
            commitment_required: "Grinder",
            status: "Open",
            architectureDiagram: `graph TD;\n    A["GitHub PR Webhook"] --> B(FastAPI Security Scanner);\n    B --> C["AST & Dockerfile Analyzer"];\n    C --> D["Gemini 2.5 Patch Generator"];\n    D --> E["Automated PR Security Review"];\n    D --> F["Compliance Audit Dashboard"];`,
            sprintMilestones: [
                {
                    phase: "Phase 1: Webhook & Static AST Parser",
                    deliverables: ["Ingest GitHub diffs and OpenAPI specs", "Detect hardcoded secrets and IAM misconfigurations"],
                    estimated_hours: 35,
                },
                {
                    phase: "Phase 2: Automated Remediation PRs",
                    deliverables: ["Generate drop-in code patches via Gemini 2.5", "Build executive compliance scorecard"],
                    estimated_hours: 50,
                },
            ],
            roleMatrix: [
                { role_title: "Security Systems Engineer", required_skills: ["Python", "Docker", "FastAPI"], complexity: "High" },
                { role_title: "Full-Stack Engineer", required_skills: ["TypeScript", "Next.js"], complexity: "Medium" },
            ],
            riskMatrix: [
                {
                    risk: "False-positive blocks on urgent hotfix deployments",
                    mitigation: "Provide signed emergency bypass tokens with full audit logging.",
                    severity: "Medium",
                },
            ],
        },
    ];

    for (const proj of sampleProjects) {
        await Project.findOneAndUpdate(
            { title: proj.title },
            proj,
            { upsert: true }
        );
    }

    return NextResponse.json({
        message: "Enterprise Talent Pool & AI-Blueprinted Architectures Seeded Successfully!",
        status: "Zeta Innovate Demo Ready",
    });
}