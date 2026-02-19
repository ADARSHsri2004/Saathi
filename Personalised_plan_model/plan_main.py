from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
from dotenv import load_dotenv
from schemas.initial_plan_input import PlanGenerationInput
from schemas.update_plan_input import PlanUpdateInput
from schemas.output_schema import RecoveryPlanOutput
from chains.initial_plan_chain import generate_initial_plan_chain
from chains.update_plan_chain import update_plan_chain

load_dotenv()

if not os.getenv("GOOGLE_API_KEY"):
    raise ValueError("GOOGLE_API_KEY not found in .env file.")

app = FastAPI(
    title="Saathi Addiction Recovery API",
    description="AI-powered backend for generating and updating smoking cessation plans.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-plan", response_model=RecoveryPlanOutput)
async def generate_plan_endpoint(user_input: PlanGenerationInput):
    """
    Generates the initial recovery plan.
    """
    try:
        # Run the blocking LangChain function in a separate thread to keep API async
        plan = await asyncio.to_thread(
            generate_initial_plan_chain,
            user_input
        )
        return plan
    except Exception as e:
        print(f"Error generating plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate plan: {str(e)}")


@app.post("/update-plan", response_model=RecoveryPlanOutput)
async def update_plan_endpoint(user_input: PlanUpdateInput):
    """
    Updates the plan based on daily progress (Relapse/Improvement).
    """
    try:
        updated_plan = await asyncio.to_thread(
            update_plan_chain,
            user_input
        )
        return updated_plan
    except Exception as e:
        print(f"Error updating plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update plan: {str(e)}")

@app.get("/")
def read_root():
    return {"status": "Saathi API is running", "model": "Gemini 1.5 Pro"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("plan_main:app", host="0.0.0.0", port=8000, reload=True)