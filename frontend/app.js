/**
 * HavenSec Arena — Vanilla JavaScript Frontend Controller
 * Implements dynamic API auto-discovery, live simulation polling,
 * 8 view controllers, safe DOM escaping, referee rendering, and coach adaptation.
 */

// Candidate API bases for local dev and Docker container deployments
const CANDIDATE_API_BASES = [
  '/api',
  'http://127.0.0.1:8000/api',
  'http://127.0.0.1:9002/api',
  'http://localhost:8000/api',
  'http://localhost:9002/api'
];

let API_BASE = '/api';
let activeExerciseId = null;
let pollTimer = null;
let scenariosCache = [];
let exercisesCache = [];
let displayedTelemetryIds = new Set();

// Utility: HTML Escaper for XSS Defense
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// -------------------------------------------------------------
// Auto-Detect Active Backend API
// -------------------------------------------------------------
async function detectBackend() {
  const statusDot = document.getElementById('backend-status-dot');
  const statusText = document.getElementById('backend-status-text');
  const targetDisplay = document.getElementById('api-target-display');

  for (const base of CANDIDATE_API_BASES) {
    try {
      const healthUrl = base.endsWith('/api') ? base.replace('/api', '/health') : `${base}/health`;
      const res = await fetch(healthUrl, { method: 'GET', signal: AbortSignal.timeout(1200) });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok') {
          API_BASE = base;
          statusDot.className = 'dot green';
          statusText.textContent = 'Backend Online';
          targetDisplay.textContent = `API: ${base}`;
          return true;
        }
      }
    } catch (_) {
      // Try next candidate
    }
  }

  statusDot.className = 'dot red';
  statusText.textContent = 'Backend Offline';
  targetDisplay.textContent = 'API: Connection Failed';
  return false;
}

// -------------------------------------------------------------
// View Switching Navigation
// -------------------------------------------------------------
function switchView(viewName) {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewName);
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${viewName}`);
  });

  const headingMap = {
    overview: ['Executive Overview', 'Continuously simulated cyber-threats, empirical defense metrics, and adaptive resilience.'],
    scenarios: ['Scenario Library', 'Pre-configured synthetic threat scenarios and MITRE ATT&CK objective mappings.'],
    setup: ['Exercise Setup', 'Configure adversarial parameters, target assets, difficulty, and reproducibility seed.'],
    arena: ['Live Arena', 'Real-time observation of Red Team attacks, telemetry streams, and Blue Team defenses.'],
    referee: ['Referee Evaluation', 'Independent ground-truth audit of adversarial and defensive performance.'],
    coach: ['Security Coach', 'Automated gap analysis, evidence-backed recommendations, and adaptive exercise selection.'],
    history: ['Exercise History', 'Persistent audit ledger of all completed and past simulation exercises.'],
    reports: ['Reports & Audit', 'Formal technical evaluation reports for viva defense and compliance review.'],
    health: ['System Health & Orchestration', 'Database integrity, multi-agent orchestration runtime, agent roster, and vendor independence.']
  };

  if (headingMap[viewName]) {
    document.getElementById('page-heading').textContent = headingMap[viewName][0];
    document.getElementById('page-subheading').textContent = headingMap[viewName][1];
  }

  if (viewName === 'health') {
    loadSystemHealth();
  }
}

// -------------------------------------------------------------
// Data Fetching & Rendering
// -------------------------------------------------------------
async function loadScenarios() {
  try {
    const res = await fetch(`${API_BASE}/scenarios`);
    if (!res.ok) return;
    scenariosCache = await res.json();

    // Populate Setup Select
    const select = document.getElementById('select-scenario');
    select.innerHTML = '';
    scenariosCache.forEach(sc => {
      const opt = document.createElement('option');
      opt.value = sc.id;
      opt.textContent = `${sc.name} (${sc.difficulty.toUpperCase()})`;
      select.appendChild(opt);
    });

    // Populate Scenario Cards Grid
    const grid = document.getElementById('scenario-cards-grid');
    grid.innerHTML = '';
    scenariosCache.forEach(sc => {
      const card = document.createElement('div');
      card.className = 'scenario-card';
      card.innerHTML = `
        <div>
          <div class="column-header">
            <h3>${escapeHtml(sc.name)}</h3>
            <span class="badge badge-amber">${escapeHtml(sc.difficulty)}</span>
          </div>
          <p class="subtext mt-10">${escapeHtml(sc.description)}</p>
          <div class="mt-10">
            <strong>Target Assets:</strong> ${sc.targetAssets.map(a => `<span class="tag">${escapeHtml(a)}</span>`).join(' ')}
          </div>
          <div class="mt-10">
            <strong>MITRE Tactics:</strong> ${sc.mitreTactics.map(t => `<span class="badge">${escapeHtml(t)}</span>`).join(' ')}
          </div>
        </div>
        <button class="btn btn-secondary btn-sm mt-15" onclick="selectScenarioForSetup('${escapeHtml(sc.id)}')">Configure Exercise</button>
      `;
      grid.appendChild(card);
    });

    updateScenarioPreview();
  } catch (err) {
    console.error('Failed to load scenarios:', err);
  }
}

function updateScenarioPreview() {
  const scenarioId = document.getElementById('select-scenario').value;
  const sc = scenariosCache.find(s => s.id === scenarioId);
  const previewList = document.getElementById('scenario-preview-objectives');
  previewList.innerHTML = '';

  if (sc && sc.groundTruthObjectives) {
    sc.groundTruthObjectives.forEach(obj => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${escapeHtml(obj.name)}</strong> on <code>${escapeHtml(obj.targetAsset)}</code> (${escapeHtml(obj.criticality.toUpperCase())} criticality) [${escapeHtml(obj.mitreTactic)}]`;
      previewList.appendChild(li);
    });
  }
}

window.selectScenarioForSetup = function(scenarioId) {
  document.getElementById('select-scenario').value = scenarioId;
  updateScenarioPreview();
  switchView('setup');
};

async function loadExercises() {
  try {
    const res = await fetch(`${API_BASE}/exercises`);
    if (!res.ok) return;
    exercisesCache = await res.json();

    document.getElementById('ov-total-runs').textContent = exercisesCache.length;

    // Populate History Table
    const tbody = document.getElementById('history-table-body');
    tbody.innerHTML = '';

    if (exercisesCache.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No exercises recorded yet. Launch your first simulation!</td></tr>';
      return;
    }

    const reportSelect = document.getElementById('select-report-exercise');
    reportSelect.innerHTML = '';

    exercisesCache.forEach(ex => {
      // Add option to report select
      const opt = document.createElement('option');
      opt.value = ex.id;
      opt.textContent = `${ex.id} — ${ex.scenarioName} (${new Date(ex.createdAt).toLocaleTimeString()})`;
      reportSelect.appendChild(opt);

      // Render table row
      const tr = document.createElement('tr');
      const timeStr = new Date(ex.createdAt).toLocaleString();
      tr.innerHTML = `
        <td><code>${escapeHtml(ex.id)}</code></td>
        <td>${escapeHtml(ex.scenarioName)}</td>
        <td><span class="badge">${escapeHtml(ex.difficulty)}</span></td>
        <td><strong id="hist-res-${ex.id}">--</strong></td>
        <td><span id="hist-blue-${ex.id}" class="text-blue">--</span></td>
        <td><span id="hist-red-${ex.id}" class="text-red">--</span></td>
        <td><span class="badge ${ex.status === 'completed' ? 'badge-completed' : (ex.status === 'running' ? 'badge-running' : 'badge-idle')}">${escapeHtml(ex.currentPhase)}</span></td>
        <td>${escapeHtml(timeStr)}</td>
        <td><button class="btn btn-secondary btn-sm" onclick="viewExerciseDetail('${escapeHtml(ex.id)}')">Inspect</button></td>
      `;
      tbody.appendChild(tr);

      // Lazy-load score for history row
      loadScoreForHistoryRow(ex.id);
    });

    // Populate Overview with latest completed exercise
    const latest = exercisesCache.find(e => e.status === 'completed') || exercisesCache[0];
    if (latest) {
      loadOverviewMetrics(latest.id);
    }
  } catch (err) {
    console.error('Failed to load exercises:', err);
  }
}

async function loadScoreForHistoryRow(exId) {
  try {
    const res = await fetch(`${API_BASE}/exercises/${exId}/evaluation`);
    if (res.ok) {
      const ev = await res.json();
      const elRes = document.getElementById(`hist-res-${exId}`);
      const elBlue = document.getElementById(`hist-blue-${exId}`);
      const elRed = document.getElementById(`hist-red-${exId}`);
      if (elRes) elRes.textContent = `${ev.resilienceScore}`;
      if (elBlue) elBlue.textContent = `${ev.blueTeamScore}`;
      if (elRed) elRed.textContent = `${ev.redTeamScore}`;
    }
  } catch (_) {}
}

async function loadOverviewMetrics(exId) {
  try {
    const [evalRes, coachRes] = await Promise.all([
      fetch(`${API_BASE}/exercises/${exId}/evaluation`),
      fetch(`${API_BASE}/exercises/${exId}/recommendation`)
    ]);

    if (evalRes.ok) {
      const ev = await evalRes.json();
      document.getElementById('ov-resilience-score').textContent = ev.resilienceScore;
      document.getElementById('ov-blue-score').textContent = ev.blueTeamScore;
      document.getElementById('ov-red-score').textContent = ev.redTeamScore;
      
      const badge = document.getElementById('ov-resilience-badge');
      badge.textContent = `Exercise ${exId}`;
      badge.className = 'badge badge-completed';
    }

    if (coachRes.ok) {
      const rec = await coachRes.json();
      document.getElementById('ov-top-weakness-box').innerHTML = `
        <strong class="text-amber">${escapeHtml(rec.priorityWeakness)}</strong>
        <p class="subtext mt-5">${escapeHtml(rec.recommendationText)}</p>
      `;

      document.getElementById('ov-recommended-box').innerHTML = `
        <strong>Recommended Scenario:</strong> <code>${escapeHtml(rec.recommendedScenarioId)}</code> (${escapeHtml(rec.recommendedDifficulty)})
        <p class="subtext mt-5">${escapeHtml(rec.rationale)}</p>
      `;

      const btnAccept = document.getElementById('btn-accept-recommendation');
      btnAccept.classList.remove('hidden');
      btnAccept.onclick = () => {
        document.getElementById('select-scenario').value = rec.recommendedScenarioId;
        document.getElementById('select-difficulty').value = rec.recommendedDifficulty;
        document.getElementById('input-linked-prev').value = exId;
        updateScenarioPreview();
        switchView('setup');
      };
    }
  } catch (err) {
    console.error('Error loading overview metrics:', err);
  }
}

// -------------------------------------------------------------
// Live Arena Simulation Polling
// -------------------------------------------------------------
async function startSimulation(exId, mode = 'automatic') {
  activeExerciseId = exId;
  displayedTelemetryIds.clear();

  document.getElementById('arena-ex-id').textContent = exId;
  document.getElementById('arena-phase-badge').className = 'badge badge-running';
  document.getElementById('arena-phase-badge').textContent = 'PREPARING';
  document.getElementById('btn-cancel-sim').classList.remove('hidden');

  const modeBadge = document.getElementById('arena-mode-badge');
  const btnManualStep = document.getElementById('btn-manual-step');
  const manualBar = document.getElementById('manual-tactical-bar');

  if (mode === 'manual') {
    if (modeBadge) {
      modeBadge.textContent = 'MANUAL';
      modeBadge.className = 'badge badge-amber';
    }
    if (btnManualStep) btnManualStep.classList.remove('hidden');
    if (manualBar) manualBar.classList.remove('hidden');
  } else {
    if (modeBadge) {
      modeBadge.textContent = 'AUTOMATIC';
      modeBadge.className = 'badge badge-green';
    }
    if (btnManualStep) btnManualStep.classList.add('hidden');
    if (manualBar) manualBar.classList.add('hidden');
  }

  // Clear live stream UI
  document.getElementById('telemetry-stream-body').innerHTML = '';
  document.getElementById('red-activity-log').innerHTML = '';
  document.getElementById('blue-activity-log').innerHTML = '';
  document.getElementById('telemetry-counter').textContent = '0 Events';

  switchView('arena');

  // Start simulation on backend
  await fetch(`${API_BASE}/exercises/${exId}/start`, { method: 'POST' });

  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(pollLiveArenaState, 1000);
}

async function pollLiveArenaState() {
  if (!activeExerciseId) return;

  try {
    const [exRes, telRes, incRes, altRes, respRes] = await Promise.all([
      fetch(`${API_BASE}/exercises/${activeExerciseId}`),
      fetch(`${API_BASE}/exercises/${activeExerciseId}/telemetry`),
      fetch(`${API_BASE}/exercises/${activeExerciseId}/incidents`),
      fetch(`${API_BASE}/exercises/${activeExerciseId}/alerts`),
      fetch(`${API_BASE}/exercises/${activeExerciseId}/responses`)
    ]);

    const ex = await exRes.json();
    const telemetry = await telRes.json();
    const incidents = await incRes.json();
    const alerts = await altRes.json();
    const responses = await respRes.json();

    // Update phase badge and mode
    const badge = document.getElementById('arena-phase-badge');
    badge.textContent = ex.currentPhase.toUpperCase();
    document.getElementById('arena-scenario-name').textContent = ex.scenarioName;

    const modeBadge = document.getElementById('arena-mode-badge');
    const btnManualStep = document.getElementById('btn-manual-step');
    const manualBar = document.getElementById('manual-tactical-bar');
    if (ex.mode === 'manual') {
      if (modeBadge) {
        modeBadge.textContent = 'MANUAL';
        modeBadge.className = 'badge badge-amber';
      }
      if (btnManualStep) btnManualStep.classList.remove('hidden');
      if (manualBar) manualBar.classList.remove('hidden');
    } else {
      if (modeBadge) {
        modeBadge.textContent = 'AUTOMATIC';
        modeBadge.className = 'badge badge-green';
      }
      if (btnManualStep) btnManualStep.classList.add('hidden');
      if (manualBar) manualBar.classList.add('hidden');
    }

    // Process new telemetry
    const tbody = document.getElementById('telemetry-stream-body');
    const redLog = document.getElementById('red-activity-log');
    const blueLog = document.getElementById('blue-activity-log');

    let newEventsCount = 0;
    telemetry.forEach(t => {
      if (!displayedTelemetryIds.has(t.id)) {
        displayedTelemetryIds.add(t.id);
        newEventsCount++;

        const timeStr = new Date(t.timestamp).toLocaleTimeString();
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHtml(timeStr)}</td>
          <td><code>${escapeHtml(t.type)}</code></td>
          <td><span class="tag">${escapeHtml(t.sourceAsset)}</span></td>
          <td>${escapeHtml(t.actor)}</td>
          <td><span class="badge ${t.severity === 'critical' ? 'badge-red' : (t.severity === 'high' ? 'badge-amber' : 'badge-idle')}">${escapeHtml(t.severity)}</span></td>
        `;
        tbody.prepend(tr);

        // Feed to Red Team feed if malicious or reconnaissance
        if (t.isMalicious || ['HTTP_REQUEST', 'LOGIN_FAILED', 'API_ANOMALY', 'PARAMETER_TAMPERING', 'SESSION_HIJACK_ATTEMPT', 'ENCRYPTION_INTENT'].includes(t.type)) {
          const item = document.createElement('div');
          item.className = 'feed-item red';
          item.innerHTML = `
            <span class="feed-timestamp">${escapeHtml(timeStr)}</span>
            <strong>${escapeHtml(t.type)}</strong> on <code>${escapeHtml(t.sourceAsset)}</code>
            <p class="subtext">${escapeHtml(JSON.stringify(t.data))}</p>
          `;
          redLog.prepend(item);
        }
      }
    });

    document.getElementById('telemetry-counter').textContent = `${displayedTelemetryIds.size} Events`;

    // Render Blue Team alerts and responses
    alerts.forEach(a => {
      const feedId = `alert-${a.id}`;
      if (!document.getElementById(feedId)) {
        const timeStr = new Date(a.timestamp).toLocaleTimeString();
        const item = document.createElement('div');
        item.id = feedId;
        item.className = 'feed-item blue';
        item.innerHTML = `
          <span class="feed-timestamp">${escapeHtml(timeStr)}</span>
          <strong class="text-blue">ALERT [${escapeHtml(a.ruleId)}]:</strong> ${escapeHtml(a.title)}
          <p class="subtext">${escapeHtml(a.evidence.join('; '))}</p>
        `;
        blueLog.prepend(item);
      }
    });

    responses.forEach(r => {
      const feedId = `resp-${r.id}`;
      if (!document.getElementById(feedId)) {
        const timeStr = new Date(r.timestamp).toLocaleTimeString();
        const item = document.createElement('div');
        item.id = feedId;
        item.className = 'feed-item blue';
        item.style.borderLeftColor = 'var(--accent-purple)';
        item.innerHTML = `
          <span class="feed-timestamp">${escapeHtml(timeStr)}</span>
          <strong style="color:var(--accent-purple)">CONTAINMENT PLAYBOOK:</strong> ${escapeHtml(r.playbookName)}
          <p class="subtext">${escapeHtml(r.rationale)}</p>
        `;
        blueLog.prepend(item);
      }
    });

    // Check completion
    if (ex.status === 'completed' || ex.status === 'failed' || ex.status === 'cancelled') {
      clearInterval(pollTimer);
      pollTimer = null;
      badge.className = ex.status === 'completed' ? 'badge badge-completed' : 'badge badge-red';
      badge.textContent = ex.status.toUpperCase();
      document.getElementById('btn-cancel-sim').classList.add('hidden');

      // Load referee evaluation and coach recommendations
      await viewExerciseDetail(activeExerciseId);
      loadExercises();
    }
  } catch (err) {
    console.error('Polling error:', err);
  }
}

// -------------------------------------------------------------
// Exercise Inspection & Detail Loading
// -------------------------------------------------------------
window.viewExerciseDetail = async function(exId) {
  try {
    const [evalRes, coachRes, compRes] = await Promise.all([
      fetch(`${API_BASE}/exercises/${exId}/evaluation`),
      fetch(`${API_BASE}/exercises/${exId}/recommendation`),
      fetch(`${API_BASE}/exercises/${exId}/comparison`)
    ]);

    if (evalRes.ok) {
      const ev = await evalRes.json();
      document.getElementById('ref-resilience-val').textContent = ev.resilienceScore;
      document.getElementById('ref-blue-val').textContent = ev.blueTeamScore;
      document.getElementById('ref-red-val').textContent = ev.redTeamScore;
      document.getElementById('ref-summary-text').textContent = ev.summary;

      // Render Blue Metrics Table
      const blueBody = document.getElementById('ref-blue-metrics-body');
      blueBody.innerHTML = '';
      (ev.metricsBreakdown.blueTeam || []).forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${escapeHtml(m.name)}</strong></td><td>${m.score} / ${m.maxScore}</td><td class="subtext">${escapeHtml(m.details)}</td>`;
        blueBody.appendChild(tr);
      });

      // Render Red Metrics Table
      const redBody = document.getElementById('ref-red-metrics-body');
      redBody.innerHTML = '';
      (ev.metricsBreakdown.redTeam || []).forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td><strong>${escapeHtml(m.name)}</strong></td><td>${m.score} / ${m.maxScore}</td><td class="subtext">${escapeHtml(m.details)}</td>`;
        redBody.appendChild(tr);
      });

      // Render Deductions & Bonuses
      const notesList = document.getElementById('ref-audit-notes');
      notesList.innerHTML = '';
      (ev.deductions || []).forEach(d => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="text-red">Deduction:</span> ${escapeHtml(d)}`;
        notesList.appendChild(li);
      });
      (ev.bonuses || []).forEach(b => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="text-green">Bonus:</span> ${escapeHtml(b)}`;
        notesList.appendChild(li);
      });
      (ev.limitations || []).forEach(l => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="text-amber">Limitation Note:</span> ${escapeHtml(l)}`;
        notesList.appendChild(li);
      });

      switchView('referee');
    }

    if (coachRes.ok) {
      const rec = await coachRes.json();
      document.getElementById('coach-weakness-badge').textContent = `Exercise ${exId}`;
      document.getElementById('coach-weakness-title').textContent = rec.priorityWeakness;
      document.getElementById('coach-recommendation-text').textContent = rec.recommendationText;
      document.getElementById('coach-rationale-text').textContent = rec.rationale;
      document.getElementById('coach-next-scenario').textContent = `${rec.recommendedScenarioId} (${rec.recommendedDifficulty.toUpperCase()})`;

      const evidenceContainer = document.getElementById('coach-evidence-tags');
      evidenceContainer.innerHTML = '';
      (rec.evidenceRefs || []).forEach(ref => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = ref;
        evidenceContainer.appendChild(span);
      });

      document.getElementById('btn-launch-adaptive-next').onclick = () => {
        document.getElementById('select-scenario').value = rec.recommendedScenarioId;
        document.getElementById('select-difficulty').value = rec.recommendedDifficulty;
        document.getElementById('input-linked-prev').value = exId;
        updateScenarioPreview();
        switchView('setup');
      };
    }

    // Render before-and-after comparison
    if (compRes.ok) {
      const comp = await compRes.json();
      const compBox = document.getElementById('comparison-content-box');
      if (comp.hasComparison) {
        compBox.innerHTML = `
          <div class="metrics-hero-grid">
            <div class="metric-card">
              <span class="metric-label">Resilience Delta</span>
              <div class="metric-value-box">
                <span class="metric-value ${comp.deltaResilience >= 0 ? 'text-green' : 'text-red'}">${comp.deltaResilience >= 0 ? '+' : ''}${comp.deltaResilience}</span>
                <span class="metric-unit">pts</span>
              </div>
            </div>
            <div class="metric-card">
              <span class="metric-label">Blue Defense Delta</span>
              <div class="metric-value-box">
                <span class="metric-value text-blue">${comp.deltaBlueScore >= 0 ? '+' : ''}${comp.deltaBlueScore}</span>
                <span class="metric-unit">pts</span>
              </div>
            </div>
          </div>
          <p class="mt-15"><strong>Outcome Analysis:</strong> ${escapeHtml(comp.summary)}</p>
        `;
      } else {
        compBox.innerHTML = `<p class="subtext">${escapeHtml(comp.message)}</p>`;
      }
    }

    // Refresh report select
    document.getElementById('select-report-exercise').value = exId;
    loadReportContent(exId);

  } catch (err) {
    console.error('Error inspecting exercise:', err);
  }
};

// -------------------------------------------------------------
// Report Preview & Markdown Loading
// -------------------------------------------------------------
async function loadReportContent(exId) {
  if (!exId) return;
  try {
    const res = await fetch(`${API_BASE}/exercises/${exId}/report`);
    if (res.ok) {
      const data = await res.json();
      document.getElementById('report-markdown-content').textContent = data.markdown;
    }
  } catch (err) {
    console.error('Error loading report:', err);
  }
}

// -------------------------------------------------------------
// System Health & Orchestration View
// -------------------------------------------------------------
async function loadSystemHealth() {
  try {
    const res = await fetch(`${API_BASE}/system/health`);
    if (!res.ok) return;
    const data = await res.json();

    document.getElementById('health-api-status').textContent = 'Online';
    document.getElementById('health-api-status').className = 'metric-value text-green';
    
    if (data.database && data.database.connected) {
      document.getElementById('health-db-status').textContent = 'Connected';
      document.getElementById('health-db-tables').textContent = `${data.database.tableCount} Tables Verified`;
    }

    if (data.orchestration) {
      const mode = data.orchestration.activeMode || 'builtin';
      document.getElementById('health-orch-mode').textContent = mode.toUpperCase();
      const select = document.getElementById('select-orch-mode');
      if (select) select.value = mode;

      const descBox = document.getElementById('orch-mode-desc');
      if (descBox && data.orchestration.activeOrchestrator) {
        descBox.textContent = data.orchestration.activeOrchestrator.description;
      }
    }
  } catch (err) {
    console.error('Error fetching system health:', err);
  }
}

async function exportExerciseJson() {
  const exId = document.getElementById('select-report-exercise').value;
  if (!exId) {
    alert('Please select an exercise to export.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/exercises/${exId}`);
    if (!res.ok) throw new Error('Failed to fetch exercise details');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HavenSec_Exercise_${exId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Failed to export JSON: ' + err.message);
  }
}

async function exportTelemetryCsv() {
  const exId = document.getElementById('select-report-exercise').value;
  if (!exId) {
    alert('Please select an exercise to export.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/exercises/${exId}/telemetry`);
    if (!res.ok) throw new Error('Failed to fetch telemetry events');
    const telemetry = await res.json();
    if (!telemetry || telemetry.length === 0) {
      alert('No telemetry records available for this exercise.');
      return;
    }

    const headers = ['id', 'timestamp', 'eventType', 'sourceAsset', 'targetAsset', 'actor', 'severity', 'techniqueId', 'phase'];
    const rows = telemetry.map(t => [
      t.id || '',
      t.timestamp || '',
      t.eventType || '',
      t.sourceAsset || '',
      t.targetAsset || '',
      t.actor || '',
      t.severity || '',
      t.techniqueId || '',
      t.phase || ''
    ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HavenSec_Telemetry_${exId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Failed to export CSV: ' + err.message);
  }
}

// -------------------------------------------------------------
// Initialization & Event Binding
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  // Navigation Links Binding
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      switchView(view);
    });
  });

  // Quick Launch Button
  document.getElementById('btn-quick-launch').addEventListener('click', () => {
    switchView('setup');
  });

  // Scenario Selection change in Setup
  document.getElementById('select-scenario').addEventListener('change', updateScenarioPreview);

  // Exercise Form Submit
  document.getElementById('exercise-form').addEventListener('submit', async e => {
    e.preventDefault();
    const scenarioId = document.getElementById('select-scenario').value;
    const difficulty = document.getElementById('select-difficulty').value;
    const mode = document.getElementById('select-mode') ? document.getElementById('select-mode').value : 'automatic';
    const seed = parseInt(document.getElementById('input-seed').value, 10) || 42;
    const targetAsset = document.getElementById('input-target-asset').value;
    const previousExerciseId = document.getElementById('input-linked-prev').value.trim() || null;

    try {
      const res = await fetch(`${API_BASE}/exercises`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          difficulty,
          mode,
          seed,
          targetAsset,
          previousExerciseId,
          simulationDuration: 15
        })
      });

      if (res.ok) {
        const ex = await res.json();
        await startSimulation(ex.id, mode);
      } else {
        alert('Failed to initialize exercise. Inspect console.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error connecting to HavenSec Arena API.');
    }
  });

  // Manual Mode Step Button
  const btnManualStep = document.getElementById('btn-manual-step');
  if (btnManualStep) {
    btnManualStep.addEventListener('click', async () => {
      if (!activeExerciseId) return;
      btnManualStep.disabled = true;
      btnManualStep.textContent = 'Stepping...';
      try {
        const res = await fetch(`${API_BASE}/exercises/${activeExerciseId}/step`, { method: 'POST' });
        if (res.ok) {
          await pollLiveArenaState();
        }
      } catch (err) {
        console.error('Manual step error:', err);
      } finally {
        btnManualStep.disabled = false;
        btnManualStep.textContent = 'Step to Next Phase ▶';
      }
    });
  }

  // Manual Mode Playbook Action Buttons
  document.querySelectorAll('.btn-playbook').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!activeExerciseId) {
        alert('No active exercise running.');
        return;
      }
      const playbook = btn.getAttribute('data-playbook');
      const asset = btn.getAttribute('data-asset');
      try {
        const incRes = await fetch(`${API_BASE}/exercises/${activeExerciseId}/incidents`);
        const incidents = incRes.ok ? await incRes.json() : [];
        const uncontained = incidents.find(i => i.status !== 'contained') || incidents[0];
        const incidentId = uncontained ? uncontained.id : 'inc-manual';

        const res = await fetch(`${API_BASE}/exercises/${activeExerciseId}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            incidentId,
            playbookName: playbook,
            targetAsset: asset,
            rationale: `Manual containment playbook '${playbook}' executed on ${asset} by SOC operator.`
          })
        });
        if (res.ok) {
          alert(`Successfully executed manual playbook '${playbook}' on ${asset}.`);
          await pollLiveArenaState();
        } else {
          alert('Failed to execute playbook.');
        }
      } catch (err) {
        alert('Error executing playbook: ' + err.message);
      }
    });
  });

  // Abort Exercise
  document.getElementById('btn-cancel-sim').addEventListener('click', async () => {
    if (activeExerciseId && confirm('Abort current exercise simulation?')) {
      await fetch(`${API_BASE}/exercises/${activeExerciseId}/cancel`, { method: 'POST' });
    }
  });

  // History Refresh
  document.getElementById('btn-refresh-history').addEventListener('click', loadExercises);

  // Report Select Change
  document.getElementById('select-report-exercise').addEventListener('change', e => {
    loadReportContent(e.target.value);
  });

  // Report Print
  document.getElementById('btn-print-report').addEventListener('click', () => {
    window.print();
  });

  // Report Export JSON
  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', exportExerciseJson);
  }

  // Report Export CSV
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportTelemetryCsv);
  }

  // Orchestrator Mode Change
  const btnSaveOrch = document.getElementById('btn-save-orch-mode');
  if (btnSaveOrch) {
    btnSaveOrch.addEventListener('click', async () => {
      const mode = document.getElementById('select-orch-mode').value;
      try {
        const res = await fetch(`${API_BASE}/system/orchestrator/mode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        });
        if (res.ok) {
          alert(`Orchestration mode updated to ${mode.toUpperCase()}`);
          loadSystemHealth();
        } else {
          alert('Failed to update orchestration mode.');
        }
      } catch (err) {
        alert('Error updating orchestration mode: ' + err.message);
      }
    });
  }

  // Detect Backend and Load Initial State
  const online = await detectBackend();
  if (online) {
    await loadScenarios();
    await loadExercises();
    await loadSystemHealth();
  }
});
