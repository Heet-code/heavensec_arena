import pytest
from simulation.orchestration import (
    OrchestrationMode,
    OrchestrationManager,
    BuiltinOrchestrator,
    ExternalOrchestrationAdapter
)

@pytest.mark.asyncio
async def test_builtin_orchestrator():
    orch = BuiltinOrchestrator()
    assert orch.mode == OrchestrationMode.BUILTIN

    health = orch.get_health()
    assert health["status"] == "operational"
    assert health["vendorIndependence"] is True
    assert health["offlineReady"] is True
    assert health["requiresApiKey"] is False

    scenario = {"id": "scenario-test", "name": "Test Scenario"}
    plan = await orch.plan_scenario(scenario, "intermediate")
    assert plan["orchestrator"] == "BuiltinDeterministicOrchestrator"
    assert plan["coordinationPlan"]["offlineDeterministic"] is True
    assert plan["coordinationPlan"]["pacingMultiplier"] == 1.25

    advice = await orch.advise_containment({"severity": "critical"}, [])
    assert advice["recommendedTactic"] == "isolate_host_and_revoke_credentials"
    assert advice["priority"] == 1

    eval_data = {"resilienceScore": 88, "redTeamScore": 60, "blueTeamScore": 92}
    explanation = await orch.explain_score(eval_data)
    assert "88/100" in explanation
    assert "92/100" in explanation


@pytest.mark.asyncio
async def test_external_orchestrator_graceful_fallback():
    ext = ExternalOrchestrationAdapter(provider_name="test_external_runtime")
    assert ext.mode == OrchestrationMode.EXTERNAL
    # By default, without an API key set, it must engage fallback transparently
    health = ext.get_health()
    assert health["fallbackAvailable"] is True

    plan = await ext.plan_scenario({"id": "scenario-web"}, "beginner")
    assert plan["fallbackEngaged"] is True
    assert "Builtin" in plan["notice"]

    advice = await ext.advise_containment({"severity": "high"}, [])
    assert advice["fallbackEngaged"] is True


def test_orchestration_manager_singleton_and_modes():
    manager = OrchestrationManager.get_instance()
    assert manager.active_mode == OrchestrationMode.BUILTIN

    health = manager.get_system_health()
    assert health["status"] == "operational"
    assert health["vendorIndependence"] is True
    assert len(health["agentRoster"]) == 6

    # Test mode change
    manager.set_mode(OrchestrationMode.EXTERNAL)
    assert manager.active_mode == OrchestrationMode.EXTERNAL
    assert isinstance(manager.get_orchestrator(), ExternalOrchestrationAdapter)

    # Revert to Builtin
    manager.set_mode(OrchestrationMode.BUILTIN)
    assert manager.active_mode == OrchestrationMode.BUILTIN
    assert isinstance(manager.get_orchestrator(), BuiltinOrchestrator)
