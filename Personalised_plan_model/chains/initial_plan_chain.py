from core.llm import get_gemini_model
from prompts.initial_plan_prompt import initial_plan_template
from schemas.initial_plan_input import PlanGenerationInput
from schemas.output_schema import RecoveryPlanOutput


def generate_initial_plan_chain(input_data: PlanGenerationInput) -> RecoveryPlanOutput:
    llm = get_gemini_model()

    # 1. BIND THE SCHEMA: This replaces the parser
    structured_llm = llm.with_structured_output(RecoveryPlanOutput)

    # 2. Create Chain (Simpler: Prompt -> Structured LLM)
    chain = initial_plan_template | structured_llm

    # 3. Prepare Data
    input_dict = input_data.model_dump()
    input_dict['triggers'] = ", ".join(input_data.triggers)
    input_dict['locations'] = ", ".join(input_data.locations)

    return chain.invoke(input_dict)