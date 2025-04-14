from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import psycopg

app = FastAPI(title="AI Resume Advisor API")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

interview_questions = [
    {"id": 1, "question": "请简要介绍一下您的工作经历？"},
    {"id": 2, "question": "您在过去的工作中有哪些主要成就？"},
    {"id": 3, "question": "您擅长哪些技能？"},
    {"id": 4, "question": "您希望在简历中突出展示什么？"},
    {"id": 5, "question": "您理想中的工作是什么样的？"}
]

user_responses = {}
generated_resumes = {}

class QuestionResponse(BaseModel):
    question_id: int
    response: str

class ResumeContent(BaseModel):
    content: str

class ResumeRequest(BaseModel):
    user_id: str
    responses: List[QuestionResponse]

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/questions")
async def get_questions():
    return interview_questions

@app.post("/api/submit-responses")
async def submit_responses(request: ResumeRequest):
    user_id = request.user_id
    user_responses[user_id] = {resp.question_id: resp.response for resp in request.responses}
    
    resume_content = generate_resume(user_id, user_responses[user_id])
    generated_resumes[user_id] = resume_content
    
    return {"status": "success", "resume_content": resume_content}

@app.get("/api/resume/{user_id}")
async def get_resume(user_id: str):
    if user_id not in generated_resumes:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return {"resume_content": generated_resumes[user_id]}

@app.put("/api/resume/{user_id}")
async def update_resume(user_id: str, resume: ResumeContent):
    generated_resumes[user_id] = resume.content
    return {"status": "success", "resume_content": resume.content}

def generate_resume(user_id: str, responses: Dict[int, str]) -> str:
    """
    Generate resume content based on user responses.
    This is a simplified version that would be replaced with actual AI logic.
    """
    work_experience = responses.get(1, "未提供工作经历")
    achievements = responses.get(2, "未提供成就")
    skills = responses.get(3, "未提供技能")
    highlights = responses.get(4, "未提供亮点")
    ideal_job = responses.get(5, "未提供理想工作")
    
    resume = f"""

{work_experience}

{achievements}

{skills}

{highlights}

{ideal_job}
"""
    
    return resume
