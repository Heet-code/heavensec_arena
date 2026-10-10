import asyncio
from simulation import simulation_loop
from database import exercise_store, telemetry_store, incident_store

async def test():
    ex_id = "test-ex"
    exercise_store.set(ex_id, {"status": "created", "currentPhase": "created"})
    await simulation_loop(ex_id)
    tel = telemetry_store.get(ex_id)
    inc = incident_store.get(ex_id)
    print(f"Test complete. Telemetry: {len(tel) if tel else 0}, Incidents: {len(inc) if inc else 0}")
    print("SUCCESS")

if __name__ == "__main__":
    asyncio.run(test())
