// src/app/api/seed/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";

export async function GET(request: Request) {
    // 1. The Security Lock
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (key !== "hackathon2026") {
        return NextResponse.json({ error: "Unauthorized endpoint access." }, { status: 403 });
    }

    await connectDB();

    // ==========================================
    // 1. SEEDING THE LEADERBOARD (USERS)
    // ==========================================

    // Create or grab the Genesis Creator safely (Idempotent)
    const dummyUser = await User.findOneAndUpdate(
        { email: "admin@syncstack.io" }, // The query
        {
            name: "Campus Incubation Hub",
            image: "https://github.com/github.png",
            tech_skills: ["Product Management", "System Design"],
            reputation_score: 999,
            role: "Incubator Lead",
            commitment_level: "Grinder"
        },
        { upsert: true, new: true } // If not found, create it. Always return the doc.
    );

    const sampleUsers = [
        {
            name: "Alex Chen",
            email: `alex.chen.${Date.now()}@syncstack.io`, // Unique email per run
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            role: "MERN Full Stack Engineer",
            commitment_level: "Grinder",
            projects_shipped: 12,
            reputation_score: 940,
            tech_skills: ["React", "Node.js", "MongoDB", "Express"]
        },
        {
            name: "Sarah Jenkins",
            email: `sarah.j.${Date.now()}@syncstack.io`,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            role: "Machine Learning Researcher",
            commitment_level: "Balanced",
            projects_shipped: 8,
            reputation_score: 850,
            tech_skills: ["Python", "TensorFlow", "PyTorch"]
        },
        {
            name: "David Kumar",
            email: `david.k.${Date.now()}@syncstack.io`,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            role: "Smart Contract Developer",
            commitment_level: "Grinder",
            projects_shipped: 15,
            reputation_score: 1200,
            tech_skills: ["Solidity", "Rust", "Web3.js"]
        },
        {
            name: "Emily Rostova",
            email: `emily.r.${Date.now()}@syncstack.io`,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
            role: "UI/UX Designer & Frontend",
            commitment_level: "Casual",
            projects_shipped: 4,
            reputation_score: 420,
            tech_skills: ["Figma", "Tailwind CSS", "React"]
        },
        {
            name: "Michael Chang",
            email: `mike.c.${Date.now()}@syncstack.io`,
            image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
            role: "DevOps & Cloud Architect",
            commitment_level: "Balanced",
            projects_shipped: 9,
            reputation_score: 780,
            tech_skills: ["Docker", "Kubernetes", "AWS"]
        }
    ];

    await User.insertMany(sampleUsers);

    // ==========================================
    // 2. SEEDING THE BULLETIN (PROJECTS)
    // ==========================================
    const sampleProjects = [
        {
            creator_id: dummyUser._id, // Use the upserted ID
            title: "DeFi Yield Aggregator Protocol",
            description: "Building a cross-chain yield optimizer smart contract system for the upcoming ETHGlobal hackathon. Need deep Web3 expertise.",
            required_skills: ["Solidity", "Next.js", "Web3.js", "Ethers.js"],
            domain: "Web3/Crypto",
            event_name: "ETHGlobal",
            team_capacity: 4,
            filled_seats: 2,
            commitment_required: "Grinder",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "AI Medical Image Scanner",
            description: "Computer vision model to detect anomalies in X-Rays. Have the dataset, need ML engineers capable of building inference pipelines.",
            required_skills: ["Python", "TensorFlow", "PyTorch", "OpenCV"],
            domain: "Healthcare AI",
            event_name: "HealthTech Hack",
            team_capacity: 3,
            filled_seats: 1,
            commitment_required: "Balanced",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "SyncStack Mobile Port",
            description: "Looking to port our Next.js dashboard into a native mobile application using React Native or Flutter. Need UI/UX heavy lifters.",
            required_skills: ["React Native", "Flutter", "TypeScript", "Tailwind CSS"],
            domain: "Mobile Development",
            event_name: "Campus Builder Weekend",
            team_capacity: 4,
            filled_seats: 3,
            commitment_required: "Casual",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "High-Frequency Trading Bot",
            description: "Building an algorithmic trading bot utilizing web sockets for real-time order book execution. Needs low-latency language expertise.",
            required_skills: ["Rust", "Go", "C++", "Redis"],
            domain: "FinTech",
            event_name: "Independent Project",
            team_capacity: 2,
            filled_seats: 1,
            commitment_required: "Grinder",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "Kubernetes Cluster Visualizer",
            description: "A DevOps tool to visually map pod deployments and node health across AWS clusters. Backend infrastructure knowledge required.",
            required_skills: ["Docker", "Kubernetes", "AWS", "Node.js"],
            domain: "Cloud/DevOps",
            event_name: "Independent Project",
            team_capacity: 3,
            filled_seats: 1,
            commitment_required: "Balanced",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "Smart Parking Slot IoT Tracker",
            description: "Integrating ESP32 microcontrollers with a central server to track parking availability on campus in real-time.",
            required_skills: ["C++", "IoT", "MQTT", "Python"],
            domain: "Hardware/IoT",
            event_name: "Smart City Hackathon",
            team_capacity: 5,
            filled_seats: 2,
            commitment_required: "Balanced",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "Automated Accessibility Auditor",
            description: "A Chrome extension that parses DOM trees and flags WCAG compliance issues for visually impaired users.",
            required_skills: ["JavaScript", "Chrome Extensions API", "HTML/CSS"],
            domain: "Web Accessibility",
            event_name: "Hack for Good",
            team_capacity: 3,
            filled_seats: 2,
            commitment_required: "Casual",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "AR Campus Navigation App",
            description: "Using augmented reality to overlay directions to specific lecture halls through the phone's camera.",
            required_skills: ["Swift", "ARKit", "Unity", "C#"],
            domain: "Augmented Reality",
            event_name: "University Demo Day",
            team_capacity: 4,
            filled_seats: 1,
            commitment_required: "Grinder",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "Open Source Database Driver",
            description: "Contributing to a new async database driver. This is a highly technical systems programming task.",
            required_skills: ["Rust", "PostgreSQL", "System Architecture"],
            domain: "Open Source Core",
            event_name: "Independent Project",
            team_capacity: 2,
            filled_seats: 1,
            commitment_required: "Grinder",
            status: "Open"
        },
        {
            creator_id: dummyUser._id,
            title: "P2P Textbook Marketplace",
            description: "A classic MERN stack application for students to buy, sell, and trade textbooks locally without shipping fees.",
            required_skills: ["MongoDB", "Express", "React", "Node.js"],
            domain: "Web Development",
            event_name: "Campus Builder Weekend",
            team_capacity: 4,
            filled_seats: 2,
            commitment_required: "Balanced",
            status: "Open"
        }
    ];

    await Project.insertMany(sampleProjects);

    return NextResponse.json({
        message: "10 Diverse Architectures Seeded Successfully.",
        status: "Ready for Matchmaking Demo"
    });
}