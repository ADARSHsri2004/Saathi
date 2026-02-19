import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from graph import chat_graph

load_dotenv()

app = FastAPI(title="Saathi Stateless AI Service")

# --- DATA MODELS (Replacing DB dependencies) ---

class UserProfile(BaseModel):
    """Matches the onboarding data structure previously in DB"""
    addictionTypes: List[str] = []
    whenItHappens: List[str] = []
    feelAfter: Optional[str] = ""
    frequency: Optional[str] = ""
    frequencyQuantity: Optional[str] = ""
    frequencyUnit: Optional[str] = ""
    moneySpentPerDay: Optional[str] = "0"
    impactAreas: List[str] = []
    intention: Optional[str] = ""
    journeyStartDate: Optional[str] = ""

class ChatRequest(BaseModel):
    user_id: str
    message: str
    summary: str = ""           # Current conversational memory from other backend
    user_profile: UserProfile   # Onboarding data from other backend
    relapses: List[str] = []    # List of formatted date strings from other backend

# --- ENDPOINTS ---

@app.get("/")
async def health():
    return {"status": "healthy", "service": "Saathi AI Stateless"}

@app.post("/api/chatbot/ask")
async def ask_bot(req: ChatRequest):
    try:
        # We package the incoming request data directly into the Graph State
        inputs = {
            "user_id": req.user_id,
            "input": req.message,
            "summary": req.summary,
            "user_profile": req.user_profile.model_dump(),
            "relapses": req.relapses
        }
        
        # Invoke the graph. Thread ID is kept for LangGraph internal tracking.
        config = {"configurable": {"thread_id": req.user_id}}
        result = await chat_graph.ainvoke(inputs, config)
        
        return {
            "success": True,
            "reply": result.get("response"),
            "new_summary": result.get("summary") # Return to other backend to SAVE
        }
    except Exception as e:
        print(f"Chatbot Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)