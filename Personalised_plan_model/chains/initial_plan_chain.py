from core.llm import get_gemini_model
from prompts.initial_plan_prompt import initial_plan_template
from schemas.initial_plan_input import PlanGenerationInput
from schemas.output_schema import RecoveryPlanOutput


def generate_initial_plan_chain(input_data: PlanGenerationInput) -> RecoveryPlanOutput:
    llm = get_gemini_model()

    # Bind schema with json_mode for reliable Gemini structured output
    structured_llm = llm.with_structured_output(RecoveryPlanOutput, method="json_mode")

    chain = initial_plan_template | structured_llm

    # Build input dict — only fields that exist in the new schema
    input_dict = {
        "addiction_type": input_data.addiction_type,
        "daily_consumption": input_data.daily_consumption,
        "years_of_addiction": input_data.years_of_addiction,
        "ftnd_score": input_data.ftnd_score if input_data.ftnd_score is not None else "Not provided",
        "dependence_level": input_data.dependence_level if input_data.dependence_level is not None else "Not assessed",
        "triggers": ", ".join(input_data.triggers) if input_data.triggers else "None reported",
        "age": input_data.age if input_data.age is not None else "Not provided",
    }

    return chain.invoke(input_dict)