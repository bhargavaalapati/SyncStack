import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Initialize the Gemini Client
api_key = os.environ.get("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is missing from the .env file.")

client = genai.Client(api_key=api_key)

app = FastAPI(
    title="SyncStack AI Engine",
    description="Gemini 2.5 microservice for semantic project matchmaking",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- PYDANTIC DATA MODELS (For strict type safety and JSON enforcing) ---

class UserProfile(BaseModel):
    user_id: str
    name: str
    tech_skills: list[str]

class ProjectRequirements(BaseModel):
    title: str
    description: str
    required_skills: list[str]

class MatchRequest(BaseModel):
    project: ProjectRequirements
    candidates: list[UserProfile]

class CandidateMatch(BaseModel):
    user_id: str
    compatibility_score: int = Field(description="A mathematically calculated score from 0 to 100")
    rationale: str = Field(description="A concise, 1-2 sentence technical explanation of why this candidate fits the architecture")

class MatchResponse(BaseModel):
    matches: list[CandidateMatch]

# --- API ENDPOINTS ---

@app.get("/api/ai/health")
async def health_check():
    return {"status": "online", "message": "SyncStack AI Engine is running."}

@app.post("/api/ai/match")
async def calculate_matches(payload: MatchRequest):
    try:
        prompt = f"""
        You are an expert technical recruiter and systems architect. Your goal is to evaluate a pool of student developers and determine their technical compatibility for a specific software project.
        
        Project Title: {payload.project.title}
        Project Scope: {payload.project.description}
        Required Tech Stack Dependencies: {', '.join(payload.project.required_skills)}
        
        Candidate Pool:
        """
        
        for candidate in payload.candidates:
            prompt += f"\n- ID: {candidate.user_id} | Name: {candidate.name} | Verified Skills: {', '.join(candidate.tech_skills)}"
            
        prompt += """
        
        Evaluate the semantic overlap between the project requirements and each candidate's skills. 
        Do not rely solely on exact keyword matches. If a project needs "React" and a user knows "Next.js", or a project needs "Express.js" and the user knows "FastAPI", score them highly for foundational capability.
        Calculate a compatibility score (0-100) for every candidate and provide a brief technical rationale.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=MatchResponse,
                temperature=0.1, # Low temperature ensures deterministic, analytical scoring
            ),
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        print(f"GenAI Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process matchmaking request.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)