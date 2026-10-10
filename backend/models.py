from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class TelemetryEvent(BaseModel):
    id: str
    timestamp: str
    type: str
    sourceAsset: str
    actor: str
    severity: str
    data: Dict[str, Any]
    correlationId: str
    exerciseId: str
    phase: str

class CategoryScore(BaseModel):
    category: str
    score: int
    maxScore: int
    details: str
    weight: float

class Score(BaseModel):
    overall: int
    categories: List[CategoryScore]
    exerciseId: str
    evaluatedAt: str
    summary: str
    strengths: List[str]
    weaknesses: List[str]

class ExerciseConfig(BaseModel):
    scenario: str
    attackObjective: str
    difficulty: str
    targetAsset: str
    techniqueCategory: str
    startingCondition: str
    simulationDuration: int

class Exercise(BaseModel):
    id: str
    number: int
    scenarioId: str
    scenarioName: str
    environmentId: str
    mode: str
    difficulty: str
    status: str
    currentPhase: str
    startedAt: Optional[str] = None
    endedAt: Optional[str] = None
    duration: Optional[int] = None
    score: Optional[Score] = None
    createdAt: str
    config: ExerciseConfig

class Incident(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    status: str
    source: str
    sourceAsset: str
    detectedAt: str
    resolvedAt: Optional[str] = None
    assignedAgent: str
    evidence: List[str]
    timeline: List[Any]
    exerciseId: str
    affectedAssets: List[str]
    responseActions: List[str]
