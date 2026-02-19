from pydantic import BaseModel, Field
from typing import List, Optional


class PlanGenerationInput(BaseModel):
    addiction_type: str = Field(..., json_schema_extra={"example": "cigarette"})
    daily_consumption: int = Field(..., json_schema_extra={"example": 12})
    years_of_addiction: float = Field(..., json_schema_extra={"example": 6})

    ftnd_score: Optional[int] = Field(default=None, json_schema_extra={"example": 7})
    dependence_level: Optional[str] = Field(default=None, json_schema_extra={"example": "high"})

    triggers: List[str] = Field(
        default_factory=list,
        json_schema_extra={"example": ["stress", "after meal"]}
    )

    age: Optional[int] = None