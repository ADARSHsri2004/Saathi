"""
Saathi AI Chat Graph
--------------------
LangGraph pipeline for Saathi addiction recovery assistant.

FLOW:
1️⃣ load_context       → fetch user data + memory
2️⃣ clarify_intent     → decide if clarification is ESSENTIAL
3️⃣ ask_clarification  → ask critical question if needed
4️⃣ chatbot            → generate healthcare recovery guidance
5️⃣ update_summary     → store rolling clinical memory

Design Goals:
✔ Essential-only Human-in-the-Loop
✔ Healthcare-grade behavioral coaching
✔ Conversational memory with insights
✔ Token-efficient long-term context
"""

import os
from typing import TypedDict, List
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

from database import db

load_dotenv()

# =========================
# STATE DEFINITION
# =========================
class AgentState(TypedDict):
    user_id: str
    input: str
    summary: str
    user_profile: dict
    relapses: List[str]
    response: str
    needs_clarification: bool


# =========================
# LLM INITIALIZATION
# =========================
llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0.35,
)

# =========================
# NODE 1: LOAD CONTEXT
# =========================
async def load_context(state: AgentState):

    user_id = state["user_id"]

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        await db.user.create(data={"id": user_id, "displayName": "New User"})

    onboarding = await db.onboarding.find_unique(where={"userId": user_id})
    memory_record = await db.chatmemory.find_unique(where={"userId": user_id})
    relapses = await db.relapse.find_many(where={"userId": user_id})

    relapse_dates = [r.relapseDate.strftime("%d %b %Y") for r in relapses]

    return {
        "user_profile": onboarding.__dict__ if onboarding else {},
        "summary": memory_record.summary if memory_record else "",
        "relapses": relapse_dates,
        "needs_clarification": False,
    }

# =========================
# NODE 2: ESSENTIAL CLARIFICATION CHECK
# =========================
async def clarify_intent(state: AgentState):
    """
    Decide whether a clarification question is ESSENTIAL
    using message + memory context.
    """

    message = state["input"]
    memory = state.get("summary", "")

    # If memory already contains meaningful context → skip clarification
    if len(memory) > 150:
        return {"needs_clarification": False}

    # Very short vague messages may need clarification
    if len(message.split()) < 3:
        return {"needs_clarification": True}

    clarification_prompt = f"""
SYSTEM ROLE: Clinical Intake Coordinator.

GOAL:
Decide whether a clarifying question is ESSENTIAL before responding.

ASK ONLY IF:
• the user requests a plan/help but the habit/substance is unclear
• a relapse/slip is mentioned without trigger context
• the message is vague and lacks meaning
• safety or health risk requires clarification

DO NOT ASK IF:
• memory already contains addiction triggers or motivations
• the user is venting emotions
• the question is clear
• the user asks general health advice

MEMORY:
{memory}

USER MESSAGE:
"{message}"

Return ONLY:
YES
NO
"""

    res = await llm.ainvoke(clarification_prompt)
    decision = res.content.strip().split()[0].upper()

    return {"needs_clarification": decision.startswith("YES")}


# =========================
# NODE 3: ASK ESSENTIAL QUESTION
# =========================
async def ask_clarification(state: AgentState):

    question_prompt = f"""
The user said:
"{state['input']}"

Ask ONE essential clarification question ONLY if needed to provide helpful guidance.

Guidelines:
• supportive and respectful
• ask only what is necessary
• avoid multiple questions
• keep under 15 words
"""

    res = await llm.ainvoke(question_prompt)

    return {"response": res.content}


# =========================
# BUILD USER CONTEXT STRING
# =========================
def build_user_context(profile: dict, relapses: list) -> str:

    if not profile:
        return "No onboarding data available."

    return f"""
ADDICTION PROFILE:
- Types: {', '.join(profile.get('addictionTypes', []))}
- Triggers: {', '.join(profile.get('whenItHappens', []))}
- Feel after use: {profile.get('feelAfter')}
- Frequency: {profile.get('frequency')} {profile.get('frequencyQuantity', '')} {profile.get('frequencyUnit', '')}
- Daily spend: ₹{profile.get('moneySpentPerDay')}
- Impact areas: {', '.join(profile.get('impactAreas', []))}
- Goal: {profile.get('intention')}
- Journey started: {profile.get('journeyStartDate')}

RELAPSE HISTORY:
- Total: {len(relapses)}
- Recent: {relapses[:5]}
"""


# =========================
# NODE 4: CHATBOT RESPONSE
# =========================
async def chatbot(state: AgentState):

    if state.get("needs_clarification"):
        return state

    user_context = build_user_context(
        state["user_profile"], state.get("relapses", [])
    )

    prompt = f"""
ROLE:
You are Saathi AI, a compassionate healthcare & addiction recovery coach.

You support recovery from:
• smoking & nicotine
• alcohol & drugs
• porn & behavioral addictions
• stress & emotional triggers
• general health & wellness

USER CONTEXT:
{user_context}

RECOVERY MEMORY:
{state['summary']}

USER MESSAGE:
"{state['input']}"

RESPONSE GUIDELINES:

EMPATHY
• warm, calm, supportive
• never judge or shame
• use collaborative tone (“Let’s explore…”)

PERSONALIZATION
• use known triggers & motivations
• acknowledge effort & progress

CRAVINGS & URGES
• suggest immediate coping strategies
• suggest Lung Capacity game for craving refocus
• suggest Jitter Tracking for restlessness

IF USER ASKS FOR HELP OR A PLAN:
Provide:
1. immediate step
2. coping strategy
3. prevention tip

IF USER REPORTS A SLIP:
• respond without shame
• identify trigger
• suggest next positive step

IF USER IS DISTRESSED:
• offer grounding techniques
• encourage reaching out to support

HEALTH SAFETY
• provide evidence-based guidance
• avoid medical diagnosis

LIMIT:
Keep under 120 words unless steps are requested.
"""

    res = await llm.ainvoke(prompt)

    return {"response": res.content}


# =========================
# NODE 5: UPDATE CLINICAL MEMORY
# =========================
async def update_summary(state: AgentState):
    """
    Store compressed conversational memory including:
    AI questions + user answers + insights.
    """
    summary_prompt = f"""
ROLE: Conversational & Behavioral Memory Synthesizer.

GOAL:
Maintain a compact memory of the user and conversation.

EXISTING MEMORY:
{state.get("summary","")}

NEW INTERACTION:
AI: {state["response"]}
User: {state["input"]}

TASK:

Update the memory by compressing important insights.

Include when relevant:

• personal facts shared (name, location, lifestyle)
• health or addiction concerns
• triggers & high-risk situations
• beliefs about habits or coping
• motivations and goals
• coping needs & strategies discussed
• recent important context

If behavioral patterns are clear, you MAY include short markers such as:

FACTS:
TRIGGERS:
BELIEFS:
MOTIVATION:
NEEDS:
STRATEGIES:
STATE:
RISK:

GUIDELINES:

• keep memory concise and natural
• markers optional — use only when useful
• merge with existing memory
• remove repetition and outdated info
• preserve recent context
• avoid rigid formatting
• avoid full conversation detail
• keep under 200 words
• optimize for AI reasoning

STYLE EXAMPLE:

User drinks alcohol mainly on weekends and wants to reduce for better sleep. Social gatherings and stress increase intake. Believes drinking helps relaxation. Needs stress-relief alternatives; breathing exercises suggested. Currently motivated but binge risk during parties.

Return only the updated memory.
"""


    res = await llm.ainvoke(summary_prompt)
    new_summary = res.content.strip()

    await db.chatmemory.upsert(
        where={"userId": state["user_id"]},
        data={
            "create": {"userId": state["user_id"], "summary": new_summary},
            "update": {"summary": new_summary},
        },
    )

    return {"summary": new_summary}


# =========================
# BUILD GRAPH FLOW
# =========================
builder = StateGraph(AgentState)

builder.add_node("load_context", load_context)
builder.add_node("clarify_intent", clarify_intent)
builder.add_node("ask_clarification", ask_clarification)
builder.add_node("chatbot", chatbot)
builder.add_node("update_summary", update_summary)

builder.set_entry_point("load_context")

builder.add_edge("load_context", "clarify_intent")

builder.add_conditional_edges(
    "clarify_intent",
    lambda state: "clarify" if state["needs_clarification"] else "continue",
    {
        "clarify": "ask_clarification",
        "continue": "chatbot",
    },
)

# store Q&A memory even during clarification
builder.add_edge("ask_clarification", "update_summary")
builder.add_edge("chatbot", "update_summary")
builder.add_edge("update_summary", END)

chat_graph = builder.compile()



