import os
from typing import TypedDict, List, Optional
from dotenv import load_dotenv

from langgraph.graph import StateGraph, END
from langchain_groq import ChatGroq

# Note: database import removed to make graph stateless

load_dotenv()

# =========================
# STATE DEFINITION
# =========================
class AgentState(TypedDict):
    user_id: str
    input: str
    summary: str           # Passed from external backend
    user_profile: dict     # Passed from external backend
    relapses: List[str]    # Passed from external backend (formatted strings)
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
# NODE 1: LOAD CONTEXT (Stateless)
# =========================
async def load_context(state: AgentState):
    """
    In this stateless version, data is already provided in the state 
    by the FastAPI entry point. This node now simply initializes 
    the control flags.
    """
    return {
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

    clarification_prompt = f"""
SYSTEM ROLE: Clinical Intake Coordinator.

GOAL:
Decide whether a clarifying question is ESSENTIAL before responding.

ASK ONLY FOR CLARIFICATION IF:
• the user requests a plan/help but the habit/substance is unclear
• a relapse/slip is mentioned without trigger context
• the message is vague and lacks meaning
• safety or health risk requires clarification

DO NOT ASK FOR CLARIFICATION IF:
• memory already contains addiction triggers or motivations
• the user is venting emotions
• the question is clear
• the user asks general health advice
• the message is a greeting
• the user asks who you are
• the user asks your name
• the user gives short confirmations (yes, ok)
• the meaning is obvious
• the user is casually chatting

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

    username = profile.get("username", "")

    name_line = f"User name: {username}" if username else ""

    return f"""
{name_line}

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

Your goal is to support recovery and emotional wellbeing in a natural, human way.

USER CONTEXT:
{user_context}

RECOVERY MEMORY:
{state['summary']}

USER MESSAGE:
"{state['input']}"

RESPONSE PRINCIPLES:

🧠 UNDERSTAND FIRST
• detect emotional state before responding
• respond to what the user is truly expressing
• avoid generic advice

🙂 IF USER IS DOING WELL / POSITIVE
• acknowledge and reinforce progress
• encourage continuation
• keep tone uplifting and supportive
• DO NOT suggest coping tools unnecessarily

😐 IF USER IS NEUTRAL / CASUAL
• respond naturally and conversationally
• offer gentle encouragement if relevant
• avoid over-guidance

⚠️ IF USER REPORTS CRAVINGS / URGES
• suggest immediate coping strategies
• suggest Lung Capacity game ONLY if craving present
• suggest Jitter Tracking ONLY if restlessness mentioned

💬 IF USER ASKS FOR HELP OR A PLAN
Provide:
1. immediate step
2. coping strategy
3. prevention tip

🔁 IF USER REPORTS A SLIP
• respond without shame
• help identify trigger
• suggest next positive step

💙 IF USER IS DISTRESSED OR ANXIOUS
• respond with empathy first
• offer grounding or calming techniques
• encourage support if needed

PERSONALIZATION
• use the user's name naturally if known
• avoid repeating the name too often
• reflect known triggers & motivations

COMMUNICATION STYLE
• sound human, not scripted
• avoid repeating the same advice
• avoid over-explaining
• avoid sounding like a rulebook
• keep responses fresh and varied

MOTIVATIONAL SUPPORT
• when appropriate, include a short encouraging insight, quote, or fact
• reinforce progress when user is on the right path

SAFETY
• provide evidence-based guidance
• do not provide medical diagnosis

LIMIT:
Keep under 100 words unless steps are requested.
"""

    res = await llm.ainvoke(prompt)
    return {"response": res.content}


# =========================
# NODE 5: UPDATE CLINICAL MEMORY
# =========================
async def update_summary(state: AgentState):
    """
    Synthesizes conversational memory. 
    Returns the new summary back to the API instead of saving to DB.
    """
    summary_prompt = f"""
ROLE: Conversational Memory Synthesizer.

GOAL:
Maintain a concise conversational memory that preserves:
1. recent AI–user dialogue flow
2. behavioral insights for recovery guidance

EXISTING MEMORY:
{state.get("summary","")}

NEW INTERACTION:
AI: {state.get("response","")}
User: {state["input"]}

TASK:

Update the memory with TWO parts:

━━━━━━━━━━━━━━━━━━
RECENT DIALOGUE
━━━━━━━━━━━━━━━━━━
• capture key AI questions or guidance
• capture user's important responses
• preserve conversational continuity
• compress into short phrases
• keep only the last 3–5 key exchanges

━━━━━━━━━━━━━━━━━━
INSIGHTS
━━━━━━━━━━━━━━━━━━
Update when relevant:

NAME:
FACTS:
TRIGGERS:
BELIEFS:
MOTIVATION:
NEEDS:
STRATEGIES:
STATE:
RISK:

GUIDELINES:

• keep concise and meaningful
• no full conversation transcripts
• compress dialogue into short phrases
• merge with existing memory
• remove repetition & outdated info
• prioritize new important insights
• keep total memory under 120 words
• optimize for AI understanding

FORMAT EXAMPLE:

RECENT:
AI asked about triggers; user said stress after work.
Cravings at night; breathing exercise suggested.
User wants to quit for health.

INSIGHTS EXAMPLES:
NAME: John
FACTS: smoking or alcohol or tobacco
TRIGGERS: stress, after meals
BELIEFS: smoking improves focus
MOTIVATION: health
STRATEGIES: breathing exercise suggested
STATE: motivated but struggling

Return only the updated memory.
"""

    res = await llm.ainvoke(summary_prompt)
    new_summary = res.content.strip()

    # We return the summary; the FastAPI handler will return this to your other backend
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

builder.add_edge("ask_clarification", "update_summary")
builder.add_edge("chatbot", "update_summary")
builder.add_edge("update_summary", END)

chat_graph = builder.compile()