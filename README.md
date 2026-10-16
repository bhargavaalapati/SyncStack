# ⚡ SyncStack

<div align="center">
  <img src="public/logo.svg" alt="SyncStack Logo" width="120" />
  <h3>Stop skill-stacking. Start building.</h3>
  <p>An AI-driven matchmaking engine for campus developers and hackathon orchestration.</p>

  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-F4B400?style=for-the-badge&logo=google" alt="Gemini 2.5 Flash" />
  <img src="https://img.shields.io/badge/Deployment-Docker-2496ED?style=for-the-badge&logo=docker" alt="Docker" />
</div>

---

## 📖 Overview

Finding the right teammates for complex engineering projects is often reduced to blind luck or searching for exact keyword matches. **SyncStack** solves this by leveraging a decoupled GenAI microservice. 

Instead of basic keyword matching, SyncStack evaluates candidate portfolios using **Semantic Space Overlap**. If a project requires `Docker` and a candidate knows `Kubernetes`, the AI understands the foundational capability and calculates an accurate compatibility score. 

## ✨ Core Features

* 🧠 **Semantic AI Evaluation:** Powered by Google's **Gemini 2.5 Flash**, our isolated FastAPI microservice deterministically scores applicants against your project's architectural dependencies.
* 🔐 **Secure Bi-Directional Dashboard:** Manage inbound applicants and outbound requests. Personal contact telemetry is strictly firewalled until a mutual "Peer Match" is confirmed.
* 🏆 **Gamification & Leaderboards:** A globally synced ranking system tracking reputation scores, projects shipped, and commitment levels (Casual, Balanced, Grinder).
* 🛡️ **Enterprise State Management:** Soft-delete (decommission) architectures, auto-incrementing team capacity counters, and specific rejection feedback loops.
* 🌓 **Premium UX:** Built with Shadcn UI, Framer Motion, Next-Themes (Dark Mode), and Sonner for globally synchronized, non-blocking toast notifications.

## 🏗️ System Architecture

SyncStack utilizes a secure, distributed microservice architecture to prevent AI rate-limit blocking and isolate database operations.

1. **The Client Edge (Frontend):** Next.js 15 App Router (React), Tailwind CSS.
2. **The Auth & Data Layer:** Auth.js (GitHub OAuth) communicating directly with MongoDB Atlas via Mongoose.
3. **The AI Brain (Backend):** A Python FastAPI ASGI server running the official `google-genai` SDK, enforcing strict JSON output schemas via Pydantic.

---

## 🚀 Quick Start (Docker Deployment)

SyncStack is fully containerized. You can spin up the entire MERN + Python architecture locally with a single command.

### 1. Clone the repository
```bash
git clone [https://github.com/bhargavaalapati/SyncStack.](https://github.com/bhargavaalapati/SyncStack.)
cd syncstack

```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory for the Next.js frontend:

```env
MONGODB_URI="your_mongodb_atlas_connection_string"
AUTH_SECRET="generate_a_random_secret_string"
AUTH_GITHUB_ID="your_github_oauth_client_id"
AUTH_GITHUB_SECRET="your_github_oauth_client_secret"
NEXT_PUBLIC_AI_ENGINE_URL="http://localhost:8000/api/ai/match"

```

Create a `.env` file inside the `/ai-engine` directory for the Python microservice:

```env
GEMINI_API_KEY="your_google_gemini_api_key"

```

### 3. Launch the Matrix

Ensure Docker Desktop is running, then execute:

```bash
docker-compose up --build

```

* **Frontend UI:** `http://localhost:3000`
* **FastAPI Docs (Swagger):** `http://localhost:8000/docs`

---

## 🤝 Contributing

Built with a "Builder Mindset" for campus incubation ecosystems. Pull requests for new features, algorithm tweaks, and domain expansions are welcome!