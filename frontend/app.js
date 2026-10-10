const API_BASE = 'http://127.0.0.1:9002/api';
let activeExerciseId = null;
let pollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      e.target.classList.add('active');
      document.querySelector(e.target.getAttribute('href')).classList.add('active');
    });
  });

  document.getElementById('btn-create-scenario').addEventListener('click', async () => {
    try {
      const res = await fetch(`${API_BASE}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: 'Suspicious Authentication',
          attackObjective: 'Compromise auth',
          difficulty: 'intermediate',
          targetAsset: 'AUTH-01',
          techniqueCategory: 'Authentication',
          startingCondition: 'Initial',
          simulationDuration: 15
        })
      });
      const data = await res.json();
      activeExerciseId = data.id;
      
      // Switch to Arena tab
      document.querySelector('a[href="#arena"]').click();
      document.getElementById('exercise-id-display').textContent = activeExerciseId;
      document.getElementById('score-panel').classList.add('hidden');
      
      // Clear logs
      document.getElementById('telemetry-body').innerHTML = '';
      document.getElementById('red-team-log').innerHTML = '';
      document.getElementById('blue-team-log').innerHTML = '';

      // Start Simulation
      await fetch(`${API_BASE}/exercises/${activeExerciseId}/start`, { method: 'POST' });
      
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(pollState, 1000);
      
    } catch (e) {
      console.error(e);
      alert('Failed to start simulation. Ensure backend is running.');
    }
  });
});

let displayedTelemetryIds = new Set();
let displayedIncidentIds = new Set();

async function pollState() {
  if (!activeExerciseId) return;

  const [telRes, incRes, scoreRes] = await Promise.all([
    fetch(`${API_BASE}/exercises/${activeExerciseId}/telemetry`),
    fetch(`${API_BASE}/exercises/${activeExerciseId}/incidents`),
    fetch(`${API_BASE}/exercises/${activeExerciseId}/score`)
  ]);

  const telemetry = await telRes.json();
  const incidents = await incRes.json();
  const score = await scoreRes.json();

  // Update UI
  const tbody = document.getElementById('telemetry-body');
  const redLog = document.getElementById('red-team-log');
  const blueLog = document.getElementById('blue-team-log');

  telemetry.forEach(t => {
    if (!displayedTelemetryIds.has(t.id)) {
      displayedTelemetryIds.add(t.id);
      
      const tr = document.createElement('tr');
      const time = new Date(t.timestamp).toLocaleTimeString();
      tr.innerHTML = `<td>${time}</td><td>${t.type}</td><td>${t.sourceAsset}</td><td>${t.actor}</td>`;
      tbody.prepend(tr);

      if (['HTTP_REQUEST', 'LOGIN_FAILED', 'DATA_EXFIL_ATTEMPT', 'API_ANOMALY'].includes(t.type)) {
        const li = document.createElement('li');
        li.textContent = `[${time}] Synthetic attack: ${t.type} targeting ${t.sourceAsset}`;
        redLog.prepend(li);
      }
      
      if (['ALERT_CREATED', 'CONTAINMENT_ACTION', 'PRIVILEGE_CHANGE'].includes(t.type)) {
        const li = document.createElement('li');
        li.textContent = `[${time}] Defensive action: ${t.type} by ${t.actor}`;
        blueLog.prepend(li);
      }
    }
  });

  if (score && score.overall) {
    document.getElementById('phase-badge').textContent = 'completed';
    const scorePanel = document.getElementById('score-panel');
    scorePanel.classList.remove('hidden');
    document.getElementById('score-details').innerHTML = `
      <p><strong>Overall Score:</strong> ${score.overall}</p>
      <p><strong>Summary:</strong> ${score.summary}</p>
      <ul>
        ${score.categories.map(c => `<li>${c.category}: ${c.score}/${c.maxScore} - ${c.details}</li>`).join('')}
      </ul>
    `;
    clearInterval(pollInterval);
  } else {
    document.getElementById('phase-badge').textContent = 'running';
  }
}
