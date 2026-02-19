from pydantic import BaseModel, Field
from typing import List, Optional


class PlanGenerationInput(BaseModel):
    addiction_type: str = Field(..., example="cigarette")
    daily_consumption: int = Field(..., example=12)
    years_of_addiction: float = Field(..., example=6)
    # previous_quit_attempts: int = Field(..., example=2)

    ftnd_score: Optional[int] = Field(default=None, example=7)
    dependence_level: Optional[str] = Field(default=None, example="high")

    triggers: List[str] = Field(
        default_factory=list,
        example=["stress","after meal"]
    )

    # locations: List[str] = Field(
    #     default_factory=list,
    #     example=["home","office"]
    # )

    # reason: Optional[str] = Field(default=None, example="stress relief")

    age: Optional[int] = None

    # used to determine aggressiveness of plan
    # motivation_level: int = Field(..., ge=1, le=5, example=3)

    target_quit_days: Optional[int] = Field(
        default=None,
        description="Desired quit duration"
    )
