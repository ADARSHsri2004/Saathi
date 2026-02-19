from pydantic import BaseModel, Field
from typing import List
from schemas.initial_plan_input import PlanGenerationInput
from schemas.output_schema import RecoveryPlanOutput


class PlanUpdateInput(BaseModel):
    # static user profile
    user_profile: PlanGenerationInput

    # last generated plan (full plan from day 1)
    previous_plan: RecoveryPlanOutput

    # actual usage recent (backend tracked)
    recent_usage: List[int] = Field(
        ...,
        description="Recent actual consumption (last few days)",
        json_schema_extra={"example": [9, 10, 12, 11]}
    )

    # what was allowed those days
    recent_allowed_limits: List[int] = Field(
        ...,
        json_schema_extra={"example": [8, 8, 7, 7]}
    )

    # current day index in the FULL plan (0-based)
    current_day_index: int = Field(
        ...,
        description="Current day index in the full recovery plan (0-based). Days before this index are already completed and must not change."
    )

    # relapse or improvement signal
    event_type: str = Field(
        ...,
        description="relapse | improvement | stable",
        json_schema_extra={"example": "relapse"}
    )