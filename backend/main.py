from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
import os
from typing import List, Optional

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class Message(BaseModel):
    role: str
    content: str

class DebateMessage(BaseModel):
    topic: str
    user_argument: str
    history: List[Message] = []
    difficulty: Optional[str] = "medium"
    end_debate: Optional[bool] = False

@app.post("/debate")
async def debate(message: DebateMessage):
    difficulty_prompts = {
        "easy": "Use simple arguments. Be encouraging and gentle.",
        "medium": "Use strong arguments with evidence. Challenge the user moderately.",
        "hard": "Use expert-level arguments. Be aggressive and expose every weakness mercilessly."
    }

    if message.end_debate:
        system_prompt = f"""You are an expert debate judge.
        The debate topic was: {message.topic}
        Analyze the entire debate and provide:
        1. Overall Score: X/10
        2. Logic Score: X/10
        3. Evidence Score: X/10
        4. Clarity Score: X/10
        5. Top 3 Strong Points
        6. Top 3 Weaknesses
        7. Logical Fallacies used
        8. Final Verdict: Who won and why
        9. Tips to improve"""
    else:
        system_prompt = f"""You are a world-class expert debate opponent.
        Debate Topic: {message.topic}
        Difficulty: {difficulty_prompts.get(message.difficulty, difficulty_prompts['medium'])}
        Rules:
        - ALWAYS argue the OPPOSITE side of the user
        - Use facts, statistics, and expert opinions
        - Point out logical fallacies
        - Keep response under 150 words
        - End with a challenging question"""

    history_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in message.history
    ]

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            *history_messages,
            {"role": "user", "content": message.user_argument}
        ]
    )

    return {
        "response": response.choices[0].message.content,
        "is_final": message.end_debate
    }

@app.get("/topics")
async def get_topics():
    return {
        "topics": [
            "Social Media does more harm than good",
            "AI will replace human jobs",
            "College education is overrated",
            "Work from home is better than office",
            "Cryptocurrency is the future of money",
            "Space exploration is a waste of money",
            "Reservations should be abolished in India",
            "Cricket is more important than education in India",
            "Electric vehicles will replace petrol cars by 2035",
            "Online learning is better than classroom learning"
        ]
    }

@app.get("/")
async def root():
    return {"message": "Debate Coach API is running! 🎙️"}