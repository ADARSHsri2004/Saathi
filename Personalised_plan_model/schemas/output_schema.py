from pydantic import BaseModel, Field
from typing import List, Optional


class AIRecommendations(BaseModel):
    nicotine_replacement: Optional[bool] = Field(
        default=None,
        description="Suggest nicotine replacement if dependence high"
    )
    behavioral_tips: List[str] = Field(
        default_factory=list,
        description="Daily behavioral suggestions and trigger counter-actions"
    )
    trigger_strategies: List[str] = Field(
        default_factory=list,
        description="Specific strategies to handle each psychological trigger"
    )
    exercise_tips: List[str] = Field(
        default_factory=list,
        description="Simple physical exercises and activities to manage withdrawal cravings and reduce stress"
    )


class RecoveryPlanOutput(BaseModel):
    addiction_severity: str = Field(
        ...,
        description="Low / Moderate / High"
    )

    relapse_risk: str = Field(
        ...,
        description="Low / Medium / High"
    )

    future_daily_limits: List[int] = Field(
        ...,
        description="Full daily consumption plan from Day 1 to quit day. Each index = one day.",
        json_schema_extra={"example": [12, 12, 11, 11, 10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 2, 1, 0]}
    )

    recovery_duration_days: int = Field(
        ...,
        description="Total number of days in the full recovery plan"
    )

    ai_recommendations: AIRecommendations