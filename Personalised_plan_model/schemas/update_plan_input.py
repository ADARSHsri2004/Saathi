from pydantic import BaseModel, Field
from typing import List
from schemas.initial_plan_input import PlanGenerationInput
from schemas.output_schema import RecoveryPlanOutput

class PlanUpdateInput(BaseModel):
    # static user profile
    user_profile: PlanGenerationInput

    # last generated plan
    previous_plan: RecoveryPlanOutput

    # actual usage recent (backend tracked)
    recent_usage: List[int] = Field(
        ...,
        description="Recent actual consumption (last few days)",
        example=[9,10,12,11]
    )

    # what was allowed those days
    recent_allowed_limits: List[int] = Field(
        ...,
        example=[8,8,7,7]
    )

    # where we are currently in plan
    current_day_index: int = Field(
        ...,
        description="Current day index in recovery plan"
    )

    # relapse or improvement signal
    event_type: str = Field(
        ...,
        description="relapse | improvement | stable",
        example="relapse"
    )
