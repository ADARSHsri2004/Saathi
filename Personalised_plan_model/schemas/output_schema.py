from pydantic import BaseModel, Field
from typing import List, Optional

class AIRecommendations(BaseModel):
    nicotine_replacement: Optional[bool] = Field(
        default=None,
        description="Suggest nicotine replacement if dependence high"
    )
    behavioral_tips: List[str] = Field(
        default_factory=list,
        description="Daily behavioral suggestions"
    )
    trigger_strategies: List[str] = Field(
        default_factory=list,
        description="Trigger avoidance strategies"
    )
    exercise_tips: List[str] = Field(
        default_factory=list,
        description="Some simple exercises for user to help with rehabilitation."
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
        description="Updated daily consumption plan starting from today",
        json_schema_extra={"example": [8, 8, 7, 7, 6, 6, 5, 5, 4, 3, 2, 1, 0]}
    )

    recovery_duration_days: int = Field(
        ...,
        description="Total remaining days in recovery plan"
    )

    ai_recommendations: AIRecommendations
