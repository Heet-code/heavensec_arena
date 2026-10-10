import requests
import time

res = requests.post('http://127.0.0.1:9000/api/exercises', json={
    "scenario": "Test",
    "attackObjective": "Test",
    "difficulty": "beginner",
    "targetAsset": "WEB-01",
    "techniqueCategory": "Test",
    "startingCondition": "None",
    "simulationDuration": 15
})
ex_id = res.json()['id']
print(f"Created exercise {ex_id}")

requests.post(f'http://127.0.0.1:9000/api/exercises/{ex_id}/start')
print("Started")

for _ in range(16):
    time.sleep(1)
    tel = requests.get(f'http://127.0.0.1:9000/api/exercises/{ex_id}/telemetry').json()
    inc = requests.get(f'http://127.0.0.1:9000/api/exercises/{ex_id}/incidents').json()
    print(f"Telemetry: {len(tel)}, Incidents: {len(inc)}")

score = requests.get(f'http://127.0.0.1:9000/api/exercises/{ex_id}/score').json()
print("Score:", score)
