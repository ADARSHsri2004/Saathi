from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from database import connect_db, disconnect_db
from graph import chat_graph

load_dotenv()
app = FastAPI(title="Saathi Chatbot API")

class ChatRequest(BaseModel):
    user_id: str
    message: str

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

@app.post("/api/chatbot/ask")
async def ask_bot(req: ChatRequest):
    try:
        inputs = {"user_id": req.user_id, "input": req.message}
        config = {"configurable": {"thread_id": req.user_id}}
        
        result = await chat_graph.ainvoke(inputs, config)
        return {
            "success": True,
            "reply": result["response"],
            "summary": result["summary"] # Optional: for debugging
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)