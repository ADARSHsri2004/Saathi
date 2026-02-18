import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
# from langchain_xai import ChatXAI
from langchain_groq import ChatGroq

from database import db

# Define Agent State
class AgentState(TypedDict):
    user_id: str
    input: str
    summary: str
    user_profile: dict
    relapses: List[str]   
    response: str

# llm = ChatXAI(api_key=os.getenv("GROK_API_KEY"), model="openai/gpt-oss-120b")
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",   # ⭐ recommended
    temperature=0.4
)

# Node 1: Fetch User Data & Previous Summary
async def load_context(state: AgentState):
    user_id = state['user_id']

    user = await db.user.find_unique(where={'id': user_id})
    if not user:
        await db.user.create(data={"id": user_id, "displayName": "New User"})

    onboarding = await db.onboarding.find_unique(where={'userId': user_id})
    memory_record = await db.chatmemory.find_unique(where={'userId': user_id})
    relapses = await db.relapse.find_many(where={'userId': user_id})

    relapse_dates = [r.relapseDate.strftime("%d %b %Y") for r in relapses]


    return {
        "user_profile": onboarding.dict() if onboarding else {},
        "summary": memory_record.summary if memory_record else "",
        "relapses": relapse_dates
    }

def build_user_context(profile: dict, relapses: list) -> str:
    if not profile:
        return "No onboarding data available."

    return f"""
ADDICTION PROFILE:
- Addiction types: {', '.join(profile.get('addictionTypes', []))}
- Usually triggered when: {', '.join(profile.get('whenItHappens', []))}
- Feel after use: {profile.get('feelAfter')}
- Frequency: {profile.get('frequency')} {profile.get('frequencyQuantity', '')} {profile.get('frequencyUnit', '')}
- Money spent daily: ₹{profile.get('moneySpentPerDay')}
- Impact areas: {', '.join(profile.get('impactAreas', []))}
- Goal: {profile.get('intention')}
- Target duration: {profile.get('duration')}
- Journey started: {profile.get('journeyStartDate')}

RELAPSE HISTORY:
- Total relapses: {len(relapses)}
- Recent relapse dates: {relapses[:5]}
"""


# Node 2: Generate Response with Grok
async def chatbot(state: AgentState):
    user_context = build_user_context(
        state['user_profile'],
        state.get('relapses', [])
    )

    prompt = f"""
You are Saathi AI, an expert addiction recovery guide.

USER HEALTH PROFILE:
{user_context}

BEHAVIOR SUMMARY:
{state['summary']}

USER MESSAGE:
{state['input']}

INSTRUCTIONS:
• Respond with warmth and empathy
• Personalize using user's triggers & relapse history
• Reinforce progress and hope
• If craving signals appear → suggest Lungs Capacity game
• If withdrawal/restlessness → suggest Jitter Tracking
• Encourage healthy coping behaviors
• Keep responses supportive and non-judgmental
"""

    res = await llm.ainvoke(prompt)
    return {"response": res.content}


# Node 3: Update Summary (Rolling Memory)
async def update_summary(state: AgentState):
    previous_summary = state.get("summary", "")
    user_message = state["input"]
    ai_response = state["response"]

    summary_prompt = f"""
Update the user's recovery journey summary.

PREVIOUS SUMMARY:
{previous_summary}
    
NEW MESSAGE FROM USER:
{user_message}

AI RESPONSE:
{ai_response}

TASK:
Create a SHORT rolling summary (max 120 words) capturing:
• addiction triggers
• emotional patterns
• cravings
• progress or setbacks
• helpful coping tools suggested

Return only the updated summary.
"""

    res = await llm.ainvoke(summary_prompt)
    new_summary_content = res.content.strip()

    await db.chatmemory.upsert(
        where={'userId': state['user_id']},
        data={
            'create': {
                'userId': state['user_id'],
                'summary': new_summary_content
            },
            'update': {
                'summary': new_summary_content
            }
        }
    )

    return {"summary": new_summary_content}




# Node 3: Update Summary (Recursive Memory)


# Build the Graph
builder = StateGraph(AgentState)
builder.add_node("load_context", load_context)
builder.add_node("chatbot", chatbot)
builder.add_node("update_summary", update_summary)

builder.set_entry_point("load_context")
builder.add_edge("load_context", "chatbot")
builder.add_edge("chatbot", "update_summary")
builder.add_edge("update_summary", END)

chat_graph = builder.compile()