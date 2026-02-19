from core.llm import get_gemini_model
from prompts.update_plan_prompt import update_plan_template
from schemas.update_plan_input import PlanUpdateInput
from schemas.output_schema import RecoveryPlanOutput


def update_plan_chain(input_data: PlanUpdateInput) -> RecoveryPlanOutput:
    llm = get_gemini_model()

    # Bind schema with json_mode for reliable Gemini structured output
    structured_llm = llm.with_structured_output(RecoveryPlanOutput, method="json_mode")

    chain = update_plan_template | structured_llm

    return chain.invoke({
        "user_profile": input_data.user_profile.model_dump_json(indent=2),
        "previous_plan": input_data.previous_plan.model_dump_json(indent=2),
        "recent_usage": str(input_data.recent_usage),
        "recent_allowed_limits": str(input_data.recent_allowed_limits),
        "current_day_index": input_data.current_day_index,
        # event_type removed — LLM infers it from recent_usage vs recent_allowed_limits
    })