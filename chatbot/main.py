from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from database import connect_db, disconnect_db
from graph import chat_graph
from contextlib import asynccontextmanager

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs when the server starts
    await connect_db()
    yield
    # This runs when the server stops
    await disconnect_db()

app = FastAPI(title="Saathi Chatbot API", lifespan=lifespan)

# Add a Health Check route (Essential for Render to see the app is 'Ready')
@app.get("/")
async def health():
    return {"status": "healthy", "service": "Saathi AI"}

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.post("/api/chatbot/ask")
async def ask_bot(req: ChatRequest):
    try:
        inputs = {"user_id": req.user_id, "input": req.message}
        config = {"configurable": {"thread_id": req.user_id}}
        
        result = await chat_graph.ainvoke(inputs, config)
        return {
            "success": True,
            "reply": result.get("response"),
            "summary": result.get("summary") 
        }
    except Exception as e:
        print(f"Chatbot Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))