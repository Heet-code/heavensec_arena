from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class GroundTruthObjective(BaseModel):
    id: str
    name: str
    phase: str
    targetAsset: str
    expectedIndicator: str
    criticality: str # low, medium, high, critical
    mitreTactic: str

class ScenarioModel(BaseModel):
    id: str
    name: str
    description: str
    category: str
    difficulty: str # beginner, intermediate, advanced
    techniques: List[str]
    targetAssets: List[str]
    expectedOutcome: str
    mitreTactics: List[str]
    groundTruthObjectives: List[GroundTruthObjective]

class ExerciseConfig(BaseModel):
    scenarioId: str = "scenario-suspicious-auth"
    scenarioName: Optional[str] = None
    difficulty: str = "intermediate"
    targetAsset: Optional[str] = "AUTH-01"
    seed: Optional[int] = 42
    mode: str = "autonomous"
    simulationDuration: int = 15
    previousExerciseId: Optional[str] = None

class TelemetryEvent(BaseModel):
    id: str
    exerciseId: str
    timestamp: str
    type: str
    sourceAsset: str
    actor: str
    severity: str
    phase: str
    data: Dict[str, Any]
    groundTruthObjectiveId: Optional[str] = None
    isMalicious: bool = False

class Alert(BaseModel):
    id: str
    exerciseId: str
    ruleId: str
    title: str
    severity: str
    timestamp: str
    sourceAsset: str
    evidence: List[str]
    groundTruthDetected: bool = False

class Incident(BaseModel):
    id: str
    exerciseId: str
    title: str
    description: str
    severity: str
    status: str # investigating, contained, resolved
    sourceAsset: str
    detectedAt: str
    resolvedAt: Optional[str] = None
    assignedAgent: str
    evidence: List[str]
    affectedAssets: List[str]
    responseActions: List[str]

class ResponseAction(BaseModel):
    id: str
    exerciseId: str
    incidentId: str
    playbookName: str
    targetAsset: str
    actionType: str
    status: str # executed, failed, rejected
    rationale: str
    timestamp: str

class MetricScore(BaseModel):
    name: str
    score: float
    maxScore: float = 100.0
    weight: float
    details: str

class RefereeEvaluation(BaseModel):
    id: str
    exerciseId: str
    redTeamScore: float
    blueTeamScore: float
    resilienceScore: float
    metricsBreakdown: Dict[str, List[MetricScore]]
    deductions: List[str]
    bonuses: List[str]
    limitations: List[str]
    summary: str
    evaluatedAt: str

class CoachRecommendation(BaseModel):
    id: str
    exerciseId: str
    priorityWeakness: str
    recommendationText: str
    rationale: str
    evidenceRefs: List[str]
    recommendedScenarioId: str
    recommendedDifficulty: str
    followUpExerciseId: Optional[str] = None
    createdAt: str

class ExerciseDetail(BaseModel):
    id: str
    number: int
    scenarioId: str
    scenarioName: str
    environmentId: str
    mode: str
    difficulty: str
    seed: int
    status: str
    currentPhase: str
    startedAt: Optional[str] = None
    endedAt: Optional[str] = None
    durationSeconds: Optional[int] = None
    previousExerciseId: Optional[str] = None
    config: Dict[str, Any]
    createdAt: str
    evaluation: Optional[RefereeEvaluation] = None
    recommendation: Optional[CoachRecommendation] = None
