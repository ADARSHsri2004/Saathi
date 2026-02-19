from langchain_core.prompts import PromptTemplate

update_plan_template = PromptTemplate(
    input_variables=[
        "user_profile",
        "previous_plan",
        "recent_usage",
        "recent_allowed_limits",
        "current_day_index"
    ],
    template="""
You are "Saathi", an Adaptive Recovery Engine. Make SMALL, SURGICAL adjustments to the plan only.

-----------------------------------------------------------------------
CURRENT STATUS:
-----------------------------------------------------------------------
- Current Day Index (0-based): {current_day_index}
- Recent Allowed Limits: {recent_allowed_limits}
- Recent Actual Usage: {recent_usage}

-----------------------------------------------------------------------
PREVIOUS FULL PLAN:
-----------------------------------------------------------------------
{previous_plan}

-----------------------------------------------------------------------
USER PROFILE:
-----------------------------------------------------------------------
{user_profile}

-----------------------------------------------------------------------
STEP 1 - DIAGNOSE:
-----------------------------------------------------------------------
Compare recent_usage vs recent_allowed_limits:
- RELAPSE: usage consistently HIGHER than limits
- IMPROVEMENT: usage consistently LOWER than limits
- STABLE: usage approximately EQUAL (within +/-1)

relapse_risk: RELAPSE=High, STABLE=Medium, IMPROVEMENT=Low

-----------------------------------------------------------------------
STEP 2 - STRICT RULES (NEVER VIOLATE EVEN ONE):
-----------------------------------------------------------------------

RULE 1 - FROZEN PAST:
Copy days 0 to (current_day_index - 1) EXACTLY from previous plan. Zero changes.

RULE 2 - CONTINUITY AT CURRENT DAY (MOST IMPORTANT):
- DO NOT jump back to any value higher than what the previous plan had at current_day_index.
- For RELAPSE: day[current_day_index] = min(recent_average, previous_plan[current_day_index] + 2)
  recent_average = round(average of recent_usage)
  This means even in a relapse, we only go AT MOST 2 above what the plan already had there.
- For IMPROVEMENT/STABLE: day[current_day_index] = previous_plan[current_day_index] (unchanged)

RULE 3 - NO INCREASES EVER FROM current_day_index ONWARDS:
For all i >= current_day_index: new_value[i] <= new_value[i-1]
Values must only decrease or stay flat. They can NEVER go up, even by 1.
This is the most violated rule. Check every single index.

RULE 4 - PER-INDEX CAP:
For every index i >= current_day_index:
  new_value[i] must be within +2 / -2 of previous_plan[i]
No bigger deviation allowed at any single index.

RULE 5 - PLATEAU NUDGE ONLY:
- RELAPSE: add exactly 1 extra day to each remaining plateau (flatten the curve slightly)
- IMPROVEMENT: remove 1 day from each remaining plateau (only if plateau length >= 4 days)
- STABLE: no changes to plateau structure

RULE 6 - LENGTH CAP:
- RELAPSE: extend total plan by AT MOST 5 days
- IMPROVEMENT: shorten total plan by AT MOST 5 days
- STABLE: keep identical length

RULE 7 - TERMINAL ZEROS:
Array must end with at least two consecutive 0 values.

-----------------------------------------------------------------------
WORKED EXAMPLE - RELAPSE at current_day_index=10:
-----------------------------------------------------------------------
Previous plan days 10+: [16, 16, 15, 15, 15, 14, 14, 14, 13, 13, 12, 12, 11, 10, ...]
recent_usage = [17, 18, 19, 17], recent_average = 18
previous_plan[10] = 16

Apply RULE 2: day[10] = min(18, 16+2) = 18. OK.
Apply RULE 3: every value after 18 must be <= 18, and only decrease.
Apply RULE 5: add 1 day to each plateau.

WRONG output:  [18, 18, 18, 18, 17, 17, 17, 16, 16, 16, 16, ...]
  Why wrong: restarts the whole plan from 18 — too radical, violates RULE 4 (some indices jump by more than 2)

CORRECT output: [18, 18, 16, 16, 16, 15, 15, 15, 15, 14, 14, 14, 13, 13, 12, 12, 11, 10, ...]
  Why correct: starts at 18, immediately continues the existing slope, just with 1 extra day per plateau.

-----------------------------------------------------------------------
PLAN SUMMARY:
-----------------------------------------------------------------------
Write 1-2 sentences stating:
1. The detected event with key numbers (e.g. "usage averaged X vs allowed Y")
2. Exactly what was changed (e.g. "plateaus extended by 1 day, total plan +3 days")

-----------------------------------------------------------------------
FINAL CHECKLIST — VERIFY EACH BEFORE OUTPUT:
-----------------------------------------------------------------------
1. Are days 0 to (current_day_index-1) identical to previous plan? 
2. Is day[current_day_index] <= previous_plan[current_day_index] + 2?
3. Does every value from current_day_index onwards only decrease or stay flat (never increase)?
4. Is every future index within +2/-2 of the previous plan value at that same index?
5. Is the total length change within 5 days?
6. Does the array end in at least two 0s?

Generate the updated plan now.
"""
)