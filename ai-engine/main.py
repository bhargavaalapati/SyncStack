import os
import json
import httpx
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI(
    title="SyncStack Enterprise AI Engine",
    description="Autonomous Project Architecture, Skill Verification & Workforce Matchmaking Microservice",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None
MODEL_ID = "gemini-2.5-flash"

# ==========================================
# 1. PYDANTIC SCHEMAS (Structured Outputs)
# ==========================================

class SprintMilestone(BaseModel):
    phase: str = Field(description="e.g., Phase 1: Core Architecture & Auth")
    deliverables: List[str]
    estimated_hours: int

class RoleRequirement(BaseModel):
    role_title: str = Field(description="e.g., Lead Full-Stack Engineer")
    required_skills: List[str]
    complexity: str = Field(description="Low, Medium, or High")

class RiskItem(BaseModel):
    risk: str
    mitigation: str
    severity: str = Field(description="Low, Medium, or Critical")

class ProjectBlueprintResponse(BaseModel):
    refined_title: str
    executive_summary: str
    recommended_stack: List[str]
    mermaid_architecture: str = Field(
        description="Valid Mermaid.js graph TD code without markdown fences"
    )
    sprint_milestones: List[SprintMilestone]
    role_matrix: List[RoleRequirement]
    risk_matrix: List[RiskItem]

class ArchitectRequest(BaseModel):
    raw_title: str
    raw_description: str
    domain: Optional[str] = "Enterprise Software"

class SkillVerificationRequest(BaseModel):
    github_username: Optional[str] = None
    claimed_skills: List[str]
    bio_or_resume: Optional[str] = ""

class VerifiedSkillBadge(BaseModel):
    skill: str
    confidence_score: int = Field(description="0 to 100")
    evidence: str

class SkillVerificationResponse(BaseModel):
    overall_trust_score: int
    verified_badges: List[VerifiedSkillBadge]
    architectural_strength: str
    recommended_role: str

class CandidateInput(BaseModel):
    user_id: str
    name: str
    skills: List[str]
    bio: Optional[str] = ""
    trust_score: Optional[int] = 75

class MatchRequest(BaseModel):
    project_title: str
    project_description: str
    required_skills: List[str]
    candidates: List[CandidateInput]

class CandidateMatchResult(BaseModel):
    user_id: str
    name: str
    synergy_score: int = Field(description="0 to 100 overall compatibility")
    technical_overlap_pct: int
    role_fit: str
    matching_strengths: List[str]
    skill_gaps: List[str]
    ai_icebreaker_pitch: str

class MatchResponse(BaseModel):
    matches: List[CandidateMatchResult]

# ==========================================
# 2. ENTERPRISE AI ENDPOINTS
# ==========================================

@app.get("/health")
async def health_check():
    return {"status": "healthy", "engine": "SyncStack Enterprise v2.0", "model": MODEL_ID}

@app.post("/api/v1/architect-project", response_model=ProjectBlueprintResponse)
async def architect_project(req: ArchitectRequest):
    """Transforms a raw 1-2 sentence idea into a full enterprise blueprint with Mermaid architecture."""
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    prompt = f"""
    You are a Principal Enterprise Solutions Architect. Convert this raw project concept into a production-ready technical blueprint.
    Raw Title: {req.raw_title}
    Raw Idea: {req.raw_description}
    Target Domain: {req.domain}

    Requirements:
    1. Provide a crisp, high-impact executive summary.
    2. Recommend a modern, scalable tech stack (6-8 specific technologies).
    3. Generate valid Mermaid.js flowchart syntax starting with 'graph TD' showing client, API gateway, services, AI pipeline, and databases. Do NOT wrap in ```mermaid code fences.
    4. Break down into 3 realistic implementation sprints with estimated engineering hours.
    5. Define 3 specialized team roles required and 2 critical technical risks with mitigations.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectBlueprintResponse,
                temperature=0.3,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Blueprint Generation failed: {str(e)}")


@app.post("/api/v1/verify-skills", response_model=SkillVerificationResponse)
async def verify_skills(req: SkillVerificationRequest):
    """Fetches live GitHub repository telemetry and cross-verifies claimed developer skills."""
    github_summary = "No GitHub telemetry provided."
    if req.github_username:
        async with httpx.AsyncClient(timeout=8.0) as http_client:
            try:
                repos_resp = await http_client.get(
                    f"https://api.github.com/users/{req.github_username}/repos?sort=updated&per_page=12",
                    headers={"User-Agent": "SyncStack-Enterprise-AI", "Accept": "application/vnd.github.v3+json"}
                )
                if repos_resp.status_code == 200:
                    repos = repos_resp.json()
                    repo_summaries = [
                        f"{r.get('name')} (Lang: {r.get('language')}, Stars: {r.get('stargazers_count')}, Desc: {r.get('description')})"
                        for r in repos if not r.get("fork")
                    ]
                    github_summary = "; ".join(repo_summaries) or "Public profile found, no original repositories."
            except Exception:
                github_summary = "GitHub API rate-limited; evaluating via resume context."

    prompt = f"""
    Evaluate this engineer's claimed skills against their verifiable GitHub telemetry and bio.
    Claimed Skills: {', '.join(req.claimed_skills)}
    Bio/Resume Summary: {req.bio_or_resume}
    Live GitHub Repo Telemetry: {github_summary}

    Assign realistic confidence scores (0-100) with specific evidence for each claimed skill.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SkillVerificationResponse,
                temperature=0.2,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill verification failed: {str(e)}")


@app.post("/api/v1/match-teammates", response_model=MatchResponse)
async def match_teammates(req: MatchRequest):
    """Performs explainable multi-vector team matchmaking with skill gap analysis."""
    prompt = f"""
    Match the following candidates to this enterprise project based on technical overlap, role complementarity, and verified trust score.
    Project: {req.project_title}
    Description: {req.project_description}
    Required Skills: {', '.join(req.required_skills)}
    Candidates: {json.dumps([c.model_dump() for c in req.candidates])}

    Rank candidates from highest synergy_score to lowest.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MatchResponse,
                temperature=0.2,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matchmaking failed: {str(e)}")