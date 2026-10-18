import os
import re
import json
import hashlib
import time
import httpx
from pathlib import Path
from typing import List, Optional, Dict, Any
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
    version="2.1.0",
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
# 0. ZERO-CREDIT PERSISTENT CACHE LAYER
# ==========================================
CACHE_FILE = Path(__file__).parent / "ai_cache.json"
MEMORY_CACHE: Dict[str, Any] = {}

CACHE_TTL_SECONDS = 86400  # 24-hour TTL revalidation window
MAX_CACHE_ENTRIES = 500    # LRU-style capacity cap

if CACHE_FILE.exists():
    try:
        MEMORY_CACHE = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    except Exception:
        MEMORY_CACHE = {}

def get_cache_key(prefix: str, payload: dict) -> str:
    serialized = json.dumps(payload, sort_keys=True, default=str)
    digest = hashlib.sha256(serialized.encode("utf-8")).hexdigest()[:16]
    return f"{prefix}:{digest}"

def get_cached_response(key: str) -> Optional[Any]:
    entry = MEMORY_CACHE.get(key)
    if not entry:
        return None
    # Support both legacy raw entries and new TTL-wrapped entries
    if isinstance(entry, dict) and "_cached_at" in entry:
        if time.time() - entry["_cached_at"] > CACHE_TTL_SECONDS:
            del MEMORY_CACHE[key]
            return None
        return entry["data"]
    return entry

def set_cached_response(key: str, data: Any) -> None:
    if len(MEMORY_CACHE) >= MAX_CACHE_ENTRIES:
        oldest_key = next(iter(MEMORY_CACHE))
        del MEMORY_CACHE[oldest_key]
    MEMORY_CACHE[key] = {"_cached_at": time.time(), "data": data}
    try:
        CACHE_FILE.write_text(json.dumps(MEMORY_CACHE, indent=2), encoding="utf-8")
    except Exception as e:
        print(f"Cache write warning: {e}")

def sanitize_mermaid_flowchart(raw: str) -> str:
    """Guarantees 1 statement per line, double-quoted labels, and zero reserved keyword collisions."""
    if not raw:
        return 'flowchart TD\n    A["Client App"] --> B["API Gateway"]'

    cleaned = raw.replace("```mermaid", "").replace("```", "").replace("\\n", "\n").replace('\\"', '"').strip()

    # Force first line to be 'flowchart TD'
    cleaned = re.sub(r"^(?:graph|flowchart)\s+(TD|TB|LR|RL|BT)\s*;?\s*", r"flowchart \1\n", cleaned, flags=re.IGNORECASE)

    # Flatten nested brackets: E["Graph DB["Neo4j"]"] or E[Graph DB["Neo4j"]]
    prev = ""
    while prev != cleaned:
        prev = cleaned
        cleaned = re.sub(
            r'\["([^"\[\]]*?)\["?(.*?)"?\](.*?)\]',
            lambda m: f'["{" - ".join(filter(None, [m.group(1).strip(), m.group(2).replace(chr(34), "").strip(), m.group(3).replace(chr(34), "").replace("]", "").strip()]))}"]',
            cleaned
        )
        cleaned = re.sub(
            r'([A-Za-z0-9_]+)\s*\[([^"\[\]\n]+?)\["?(.*?)"?\](.*?)\]',
            lambda m: f'{m.group(1)}["{" - ".join(filter(None, [m.group(2).strip(), m.group(3).replace(chr(34), "").strip(), m.group(4).replace(chr(34), "").replace("]", "").strip()]))}"]',
            cleaned
        )

    # Split multiple statements if LLM placed them on a single line (using horizontal whitespace)
    cleaned = re.sub(r'(\]|"|\)|\})[ \t]+(?=[A-Za-z0-9_]+\s*(?:\[|\(|\{|-->|-.->|==>))', r"\1\n", cleaned)
    cleaned = re.sub(r'((?:-->|-\.->|==>|---)\s*[A-Za-z0-9_]+)[ \t]+(?=[A-Za-z0-9_]+(?:\s*\["[^"\n]*"\])?[ \t]*(?:-->|-\.->|==>|---))', r"\1\n", cleaned)

    lines = []
    for raw_line in cleaned.split("\n"):
        line = raw_line.strip().rstrip(";")
        if not line:
            continue
        if re.match(r"^flowchart\s+(TD|TB|LR|RL|BT)$", line, flags=re.IGNORECASE):
            lines.append(line)
            continue

        # Replace reserved node ID 'end' with 'finishNode'
        line = re.sub(r"\bend\b(?=\s*(?:\[|\(|\{|-->|-\.->|==>|---|\n|$))", "finishNode", line, flags=re.IGNORECASE)
        # Normalize any unquoted [Label] into ["Label"]
        line = re.sub(r'\[(?!")([^\]]+?)(?<!")\]', lambda m: f'["{m.group(1).replace(chr(34), "")}"]', line)
        lines.append(f"    {line}")

    if not lines or not lines[0].lower().startswith("flowchart"):
        lines.insert(0, "flowchart TD")

    return "\n".join(lines)


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
        description="Strict Mermaid flowchart TD syntax. One connection per line separated by \\n. Every node label MUST use square brackets and double quotes like A[\"API Gateway\"]."
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
# 2. ENTERPRISE AI ENDPOINTS (WITH CACHING)
# ==========================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": "SyncStack Enterprise v2.1",
        "model": MODEL_ID,
        "cached_entries": len(MEMORY_CACHE),
    }

@app.post("/api/v1/architect-project", response_model=ProjectBlueprintResponse)
async def architect_project(req: ArchitectRequest):
    cache_key = get_cache_key("architect", req.model_dump())
    cached = get_cached_response(cache_key)
    if cached:
        print(f"⚡ [CACHE HIT] Serving blueprint for '{req.raw_title}' (0 API credits used)")
        cached["mermaid_architecture"] = sanitize_mermaid_flowchart(cached.get("mermaid_architecture", ""))
        return cached

    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    prompt = f"""
    You are a Principal Enterprise Solutions Architect. Convert this raw project concept into a production-ready technical blueprint.
    Raw Title: {req.raw_title}
    Raw Idea: {req.raw_description}
    Target Domain: {req.domain}

    STRICT MERMAID.JS RULES FOR 'mermaid_architecture':
    1. Start with 'flowchart TD' on line 1 followed by a newline '\\n'.
    2. Put ONLY ONE arrow statement per line (e.g., A["Browser Client"] --> B["API Gateway"]).
    3. Use simple uppercase letters for Node IDs (A, B, C, D, E, F, G, H). NEVER use 'end' as a node ID.
    4. Wrap EVERY node label inside square brackets and double quotes: A["Node Name (Tech)"]. Do NOT use round parentheses () or curly braces {{}} for node shapes.
    5. Do NOT include markdown ```mermaid code fences.
    """

    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ProjectBlueprintResponse,
                temperature=0.2,
            ),
        )
        result = json.loads(response.text)
        result["mermaid_architecture"] = sanitize_mermaid_flowchart(result.get("mermaid_architecture", ""))
        set_cached_response(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Blueprint Generation failed: {str(e)}")


@app.post("/api/v1/verify-skills", response_model=SkillVerificationResponse)
async def verify_skills(req: SkillVerificationRequest):
    cache_key = get_cache_key("verify", req.model_dump())
    cached = get_cached_response(cache_key)
    if cached:
        print(f"⚡ [CACHE HIT] Serving skill verification for '{req.github_username}' (0 API credits used)")
        return cached

    github_summary = "No GitHub telemetry provided."
    if req.github_username:
        async with httpx.AsyncClient(timeout=8.0) as http_client:
            try:
                repos_resp = await http_client.get(
                    f"[https://api.github.com/users/](https://api.github.com/users/){req.github_username}/repos?sort=updated&per_page=12",
                    headers={"User-Agent": "SyncStack-Enterprise-AI", "Accept": "application/vnd.github.v3+json"},
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
        result = json.loads(response.text)
        set_cached_response(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill verification failed: {str(e)}")


@app.post("/api/v1/match-teammates", response_model=MatchResponse)
async def match_teammates(req: MatchRequest):
    cache_key = get_cache_key("match", req.model_dump())
    cached = get_cached_response(cache_key)
    if cached:
        print(f"⚡ [CACHE HIT] Serving teammate matches for '{req.project_title}' (0 API credits used)")
        return cached

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
        result = json.loads(response.text)
        set_cached_response(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matchmaking failed: {str(e)}")