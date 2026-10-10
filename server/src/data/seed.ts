import { v4 as uuidv4 } from 'uuid';
import type {
  SyntheticEnvironment,
  Agent,
  Scenario,
  Exercise,
  Score,
} from '../types/index';

// ============================================================
// SYNTHETIC ENVIRONMENT
// ============================================================

export const SYNTHETIC_ENVIRONMENT: SyntheticEnvironment = {
  id: 'env-acme-web-platform',
  name: 'Acme Web Platform',
  organization: 'Acme Digital',
  assets: [
    {
      id: 'asset-web-01',
      name: 'WEB-01',
      type: 'web',
      ip: '10.0.1.10',
      services: ['HTTPS:443', 'HTTP:80', 'Node.js:3000'],
      vulnerabilities: ['missing-rate-limiting', 'verbose-error-messages'],
      status: 'normal',
    },
    {
      id: 'asset-api-01',
      name: 'API-01',
      type: 'api',
      ip: '10.0.1.20',
      services: ['REST-API:8080', 'GraphQL:4000'],
      vulnerabilities: ['excessive-data-exposure', 'missing-auth-on-endpoints'],
      status: 'normal',
    },
    {
      id: 'asset-auth-01',
      name: 'AUTH-01',
      type: 'auth',
      ip: '10.0.2.10',
      services: ['LDAP:389', 'OAuth2:8443', 'SAML:8444'],
      vulnerabilities: ['weak-password-policy', 'no-mfa-enforcement'],
      status: 'normal',
    },
    {
      id: 'asset-db-01',
      name: 'DB-01',
      type: 'database',
      ip: '10.0.3.10',
      services: ['PostgreSQL:5432', 'Redis:6379'],
      vulnerabilities: ['overprivileged-service-account', 'unencrypted-backup'],
      status: 'normal',
    },
    {
      id: 'asset-file-01',
      name: 'FILE-01',
      type: 'file',
      ip: '10.0.3.20',
      services: ['SMB:445', 'NFS:2049'],
      vulnerabilities: ['world-readable-shares', 'missing-audit-logging'],
      status: 'normal',
    },
  ],
  users: [
    { id: 'user-001', username: 'employee_001', role: 'employee', department: 'Engineering' },
    { id: 'user-002', username: 'employee_002', role: 'employee', department: 'Marketing' },
    { id: 'user-003', username: 'admin_001', role: 'admin', department: 'IT Security' },
    { id: 'user-004', username: 'service_account_01', role: 'service', department: 'Platform' },
  ],
  networkRanges: ['10.0.1.0/24', '10.0.2.0/24', '10.0.3.0/24'],
  securityControls: [
    'Web Application Firewall',
    'SIEM Integration',
    'Endpoint Detection',
    'Network Monitoring',
    'Identity & Access Management',
  ],
};

// ============================================================
// SCENARIOS
// ============================================================

export const SCENARIOS: Scenario[] = [
  {
    id: 'scenario-suspicious-auth',
    name: 'Suspicious Authentication',
    description:
      'Simulates credential-based attack patterns including brute force, credential stuffing, and account takeover attempts against authentication infrastructure.',
    category: 'Authentication',
    difficulty: 'beginner',
    techniques: ['Brute Force', 'Credential Stuffing', 'Password Spraying'],
    targetAssets: ['AUTH-01', 'WEB-01'],
    expectedOutcome: 'Detection of anomalous authentication patterns and automated account lockout',
    mitreTactics: ['Initial Access', 'Credential Access'],
  },
  {
    id: 'scenario-api-security',
    name: 'API Security Detection',
    description:
      'Simulates API abuse patterns including excessive requests, parameter tampering, unauthorized endpoint access, and data extraction attempts.',
    category: 'API Security',
    difficulty: 'intermediate',
    techniques: ['API Abuse', 'Parameter Tampering', 'Excessive Data Exposure'],
    targetAssets: ['API-01', 'DB-01'],
    expectedOutcome: 'Detection of API anomalies and containment of unauthorized data access',
    mitreTactics: ['Initial Access', 'Collection', 'Exfiltration'],
  },
  {
    id: 'scenario-web-misconfig',
    name: 'Web Application Misconfiguration',
    description:
      'Simulates exploitation of common web application misconfigurations including exposed admin panels, debug endpoints, and insecure headers.',
    category: 'Web Security',
    difficulty: 'beginner',
    techniques: ['Directory Traversal', 'Information Disclosure', 'Insecure Configuration'],
    targetAssets: ['WEB-01', 'API-01'],
    expectedOutcome: 'Detection and remediation of web misconfiguration exploitation',
    mitreTactics: ['Discovery', 'Initial Access'],
  },
  {
    id: 'scenario-credential-compromise',
    name: 'Credential Compromise Simulation',
    description:
      'Simulates a full credential compromise scenario including initial access, lateral movement using stolen credentials, and privilege escalation.',
    category: 'Privilege Management',
    difficulty: 'advanced',
    techniques: ['Pass-the-Hash', 'Credential Dumping', 'Lateral Movement'],
    targetAssets: ['AUTH-01', 'DB-01', 'FILE-01'],
    expectedOutcome: 'Full kill chain detection from initial access to containment',
    mitreTactics: ['Credential Access', 'Lateral Movement', 'Privilege Escalation'],
  },
  {
    id: 'scenario-privilege-escalation',
    name: 'Privilege Escalation Simulation',
    description:
      'Simulates privilege escalation attempts from a low-privileged service account to gain administrative access to critical systems.',
    category: 'Privilege Management',
    difficulty: 'intermediate',
    techniques: ['Privilege Escalation', 'Token Manipulation', 'Service Abuse'],
    targetAssets: ['AUTH-01', 'DB-01'],
    expectedOutcome: 'Detection and containment of privilege escalation attempt',
    mitreTactics: ['Privilege Escalation', 'Defense Evasion'],
  },
  {
    id: 'scenario-ransomware-controlled',
    name: 'Controlled Ransomware Simulation',
    description:
      'An isolated, fully synthetic ransomware-style exercise: reconnaissance, credential abuse, simulated encryption-intent telemetry, detection, containment, and recovery. No real systems, files, or networks are targeted.',
    category: 'Ransomware',
    difficulty: 'intermediate',
    techniques: ['Reconnaissance Simulation', 'Credential Abuse Simulation', 'Encryption-Intent Telemetry', 'Backup Disruption Simulation'],
    targetAssets: ['WEB-01', 'AUTH-01', 'FILE-01', 'API-01'],
    expectedOutcome: 'Detect simulated encryption-intent activity, contain affected synthetic assets, and recover the lab environment',
    mitreTactics: ['Initial Access', 'Impact', 'Inhibit System Recovery'],
  },
  {
    id: 'scenario-data-access-anomaly',
    name: 'Data Access Anomaly',
    description:
      'Simulates anomalous data access patterns including bulk data exports, unusual access times, and unauthorized cross-system queries.',
    category: 'Data Protection',
    difficulty: 'intermediate',
    techniques: ['Data Exfiltration', 'Anomalous Access', 'Insider Threat Simulation'],
    targetAssets: ['DB-01', 'FILE-01'],
    expectedOutcome: 'Detection and investigation of anomalous data access behavior',
    mitreTactics: ['Collection', 'Exfiltration'],
  },
];

// ============================================================
// AGENTS
// ============================================================

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'agent-orchestrator',
    name: 'Orchestrator',
    type: 'orchestrator',
    description: 'Coordinates all exercise activities, manages state transitions, and ensures the simulation runs according to plan.',
    status: 'idle',
    capabilities: ['Exercise Management', 'Agent Coordination', 'State Control', 'Phase Transitions'],
    currentTask: null,
    confidence: 98,
    lastAction: null,
    lastActionAt: null,
  },
  {
    id: 'agent-red-alpha',
    name: 'Red Team Alpha',
    type: 'red-team',
    description: 'Primary adversarial simulation agent. Executes controlled threat scenarios within the synthetic environment.',
    status: 'idle',
    capabilities: ['Reconnaissance Simulation', 'Authentication Anomaly', 'API Abuse Simulation', 'Lateral Movement Simulation'],
    currentTask: null,
    confidence: 94,
    lastAction: null,
    lastActionAt: null,
  },
  {
    id: 'agent-red-beta',
    name: 'Red Team Beta',
    type: 'red-team',
    description: 'Secondary adversarial simulation agent. Provides supporting attack patterns and diversionary simulations.',
    status: 'idle',
    capabilities: ['Privilege Escalation Simulation', 'Data Access Simulation', 'Persistence Simulation'],
    currentTask: null,
    confidence: 91,
    lastAction: null,
    lastActionAt: null,
  },
  {
    id: 'agent-blue-sentinel',
    name: 'Blue Team Sentinel',
    type: 'blue-team',
    description: 'Primary detection agent. Monitors telemetry streams and identifies anomalous patterns.',
    status: 'idle',
    capabilities: ['Anomaly Detection', 'Pattern Recognition', 'Alert Triage', 'Threat Correlation'],
    currentTask: null,
    confidence: 89,
    lastAction: null,
    lastActionAt: null,
  },
  {
    id: 'agent-investigation-analyst',
    name: 'Investigation Analyst',
    type: 'blue-team',
    description: 'Investigates detected incidents, correlates evidence, and builds a comprehensive picture of the attack chain.',
    status: 'idle',
    capabilities: ['Evidence Correlation', 'Timeline Analysis', 'Attack Chain Reconstruction', 'Forensic Analysis'],
    currentTask: null,
    confidence: 87,
    lastAction: null,
    lastActionAt: null,
  },
  {
    id: 'agent-response-commander',
    name: 'Response Commander',
    type: 'blue-team',
    description: 'Orchestrates defensive responses including containment actions, isolation, and recovery procedures.',
    status: 'idle',
    capabilities: ['Incident Response', 'Asset Containment', 'Playbook Execution', 'Recovery Coordination'],
    currentTask: null,
    confidence: 85,
    lastAction: null,
    lastActionAt: null,
  },
  {
    id: 'agent-referee',
    name: 'Referee',
    type: 'referee',
    description: 'Impartially evaluates exercise performance across all detection, response, and recovery dimensions.',
    status: 'idle',
    capabilities: ['Performance Evaluation', 'Metric Scoring', 'Timeline Analysis', 'Objective Assessment'],
    currentTask: null,
    confidence: 97,
    lastAction: null,
    lastActionAt: null,
  },
  {
    id: 'agent-security-coach',
    name: 'Security Coach',
    type: 'security-coach',
    description: 'Analyzes exercise results and historical performance to generate targeted improvement recommendations.',
    status: 'idle',
    capabilities: ['Weakness Analysis', 'Recommendation Generation', 'Adaptive Planning', 'Learning Loop Management'],
    currentTask: null,
    confidence: 93,
    lastAction: null,
    lastActionAt: null,
  },
];

// ============================================================
// HISTORICAL EXERCISE DATA (Demo Seed)
// ============================================================

export const HISTORICAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-historical-005',
    number: 5,
    scenarioId: 'scenario-privilege-escalation',
    scenarioName: 'Privilege Escalation Simulation',
    environmentId: 'env-acme-web-platform',
    mode: 'manual',
    difficulty: 'intermediate',
    status: 'completed',
    currentPhase: 'completed',
    startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 28 * 60 * 1000).toISOString(),
    duration: 1680,
    score: {
      overall: 71,
      categories: [
        { category: 'Detection', score: 78, maxScore: 100, details: 'Privilege escalation detected after 8 minutes', weight: 0.25 },
        { category: 'Investigation', score: 74, maxScore: 100, details: 'Evidence correlation took longer than expected', weight: 0.20 },
        { category: 'Response', score: 70, maxScore: 100, details: 'Response playbook executed with minor delays', weight: 0.20 },
        { category: 'Containment', score: 63, maxScore: 100, details: 'Containment was partial — lateral movement not fully blocked', weight: 0.20 },
        { category: 'Recovery', score: 69, maxScore: 100, details: 'Recovery completed but residual risk remained', weight: 0.15 },
      ],
      exerciseId: 'ex-historical-005',
      evaluatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      summary: 'Exercise completed with moderate performance. Detection was acceptable but containment needs significant improvement.',
      strengths: ['Privilege escalation detection', 'Incident creation speed'],
      weaknesses: ['Containment effectiveness', 'Lateral movement detection'],
    },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    config: {
      scenario: 'Privilege Escalation Simulation',
      attackObjective: 'Escalate from service_account_01 to admin on DB-01',
      difficulty: 'intermediate',
      targetAsset: 'AUTH-01',
      techniqueCategory: 'Privilege Management',
      startingCondition: 'Attacker has low-privileged service account credentials',
      redTeamAgents: ['agent-red-alpha'],
      blueTeamAgents: ['agent-blue-sentinel', 'agent-response-commander'],
      simulationDuration: 1800,
    },
  },
  {
    id: 'ex-historical-006',
    number: 6,
    scenarioId: 'scenario-suspicious-auth',
    scenarioName: 'Suspicious Authentication',
    environmentId: 'env-acme-web-platform',
    mode: 'adaptive',
    difficulty: 'intermediate',
    status: 'completed',
    currentPhase: 'completed',
    startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
    duration: 1500,
    score: {
      overall: 84,
      categories: [
        { category: 'Detection', score: 92, maxScore: 100, details: 'Brute force detected within 2 minutes', weight: 0.25 },
        { category: 'Investigation', score: 88, maxScore: 100, details: 'Full credential compromise chain reconstructed', weight: 0.20 },
        { category: 'Response', score: 82, maxScore: 100, details: 'Automated lockout triggered correctly', weight: 0.20 },
        { category: 'Containment', score: 74, maxScore: 100, details: 'Account isolated but delayed by 3 minutes', weight: 0.20 },
        { category: 'Recovery', score: 80, maxScore: 100, details: 'Clean recovery with audit trail preserved', weight: 0.15 },
      ],
      exerciseId: 'ex-historical-006',
      evaluatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 27 * 60 * 1000).toISOString(),
      summary: 'Strong performance overall with excellent detection. Containment improved from previous exercise but still has room for growth.',
      strengths: ['Authentication anomaly detection', 'Investigation speed', 'Incident identification'],
      weaknesses: ['Containment response time', 'Cross-asset correlation'],
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    config: {
      scenario: 'Suspicious Authentication',
      attackObjective: 'Compromise employee_002 credentials via brute force',
      difficulty: 'intermediate',
      targetAsset: 'AUTH-01',
      techniqueCategory: 'Authentication',
      startingCondition: 'Attacker has username list from previous reconnaissance',
      redTeamAgents: ['agent-red-alpha', 'agent-red-beta'],
      blueTeamAgents: ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander'],
      simulationDuration: 1800,
    },
  },
  {
    id: 'ex-historical-007',
    number: 7,
    scenarioId: 'scenario-api-security',
    scenarioName: 'API Security Detection',
    environmentId: 'env-acme-web-platform',
    mode: 'adaptive',
    difficulty: 'intermediate',
    status: 'completed',
    currentPhase: 'completed',
    startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    duration: 1800,
    score: {
      overall: 78,
      categories: [
        { category: 'Detection', score: 91, maxScore: 100, details: 'API anomaly detected within 3 minutes of first request', weight: 0.25 },
        { category: 'Investigation', score: 84, maxScore: 100, details: 'Attack chain correlated across 3 assets', weight: 0.20 },
        { category: 'Response', score: 72, maxScore: 100, details: 'Rate limiting applied but initial data exposure occurred', weight: 0.20 },
        { category: 'Containment', score: 61, maxScore: 100, details: 'API endpoint isolated late — 7 min after detection', weight: 0.20 },
        { category: 'Recovery', score: 78, maxScore: 100, details: 'Environment restored with policy updates applied', weight: 0.15 },
      ],
      exerciseId: 'ex-historical-007',
      evaluatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 32 * 60 * 1000).toISOString(),
      summary: 'Detection performance was excellent. API containment remains the critical weakness requiring focused attention.',
      strengths: ['API anomaly detection', 'Incident identification', 'Evidence correlation'],
      weaknesses: ['Containment speed for API-related incidents', 'API anomaly investigation depth'],
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    config: {
      scenario: 'API Security Detection',
      attackObjective: 'Extract sensitive data from API-01 via excessive data exposure',
      difficulty: 'intermediate',
      targetAsset: 'API-01',
      techniqueCategory: 'API Security',
      startingCondition: 'Attacker has valid API credentials from phishing simulation',
      redTeamAgents: ['agent-red-alpha', 'agent-red-beta'],
      blueTeamAgents: ['agent-blue-sentinel', 'agent-investigation-analyst', 'agent-response-commander'],
      simulationDuration: 1800,
    },
  },
];

// ============================================================
// EXERCISE COUNTER
// ============================================================

export function getNextExerciseNumber(): number {
  return HISTORICAL_EXERCISES.length + 1;
}

import { PersistentMap } from './db';

// ============================================================
// IN-MEMORY STORE REPLACED WITH PERSISTENT SQLITE MAPS
// ============================================================

export const exerciseStore = new PersistentMap<Exercise>('exercises');
if (exerciseStore.size === 0) {
  HISTORICAL_EXERCISES.forEach((ex) => exerciseStore.set(ex.id, ex));
}

export const telemetryStore = new PersistentMap<import('../types/index').TelemetryEvent[]>('telemetry');
export const incidentStore = new PersistentMap<import('../types/index').Incident[]>('incidents');
export const scoreStore = new PersistentMap<Score>('scores');
if (scoreStore.size === 0) {
  HISTORICAL_EXERCISES.filter((ex) => ex.score).forEach((ex) => scoreStore.set(ex.id, ex.score!));
}

export const coachStore = new PersistentMap<import('../types/index').CoachRecommendation>('coach');
export const replayStore = new PersistentMap<import('../types/index').ReplayData>('replay');

export const agentStore = new PersistentMap<Agent>('agents');
if (agentStore.size === 0) {
  DEFAULT_AGENTS.forEach((a) => agentStore.set(a.id, { ...a }));
}
