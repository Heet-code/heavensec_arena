"""
Multi-Agent Implementation for HavenSec Arena.
Agents:
- RedTeamAgent: Generates scenario-driven synthetic telemetry and ground-truth adversarial events.
- BlueTeamSentinel: Detects anomalies, evaluates SIEM rules, tracks detection latency & false positives.
- InvestigationAnalyst: Correlates alerts and telemetry into evidence-backed incidents.
- ResponseCommander: Executes bounded simulated containment actions inside the synthetic lab.
"""

import uuid
import random
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone

def make_telemetry(
    exercise_id: str,
    ts: str,
    t_type: str,
    source: str,
    actor: str,
    severity: str,
    phase: str,
    data: dict,
    gt_objective_id: Optional[str] = None,
    is_malicious: bool = False
) -> dict:
    return {
        "id": f"tel-{uuid.uuid4().hex[:8]}",
        "exerciseId": exercise_id,
        "timestamp": ts,
        "type": t_type,
        "sourceAsset": source,
        "actor": actor,
        "severity": severity,
        "phase": phase,
        "data": data,
        "groundTruthObjectiveId": gt_objective_id,
        "isMalicious": is_malicious
    }

class RedTeamAgent:
    def __init__(self, scenario: Dict[str, Any], difficulty: str = "intermediate", seed: int = 42):
        self.scenario = scenario
        self.difficulty = difficulty
        self.seed = seed
        self.rng = random.Random(seed)
        self.step = 0
        self.achieved_objectives = []
        self.attempted_objectives = [obj["id"] for obj in scenario.get("groundTruthObjectives", [])]

    def tick(self, current_time_ms: int, exercise_id: str, phase: str, get_ts) -> List[dict]:
        events = []
        scenario_id = self.scenario.get("id", "scenario-suspicious-auth")
        
        # Benign background noise (to test precision and false positives)
        if current_time_ms % 4000 == 0:
            benign_user = self.rng.choice(["employee_001", "service_account_01", "monitoring_agent"])
            events.append(make_telemetry(
                exercise_id, get_ts(0), "HTTP_REQUEST", "WEB-01", benign_user, "info", phase,
                {"path": "/api/v1/health", "status": 200, "note": "Routine benign monitoring"},
                None, False
            ))

        # Scenario-specific synthetic adversarial event sequence
        if scenario_id == "scenario-suspicious-auth":
            if self.step == 0 and current_time_ms >= 2000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "HTTP_REQUEST", "WEB-01", "198.51.100.42", "low", phase,
                    {"method": "GET", "path": "/robots.txt", "userAgent": "curl/8.1.0"},
                    "gt-auth-01", True
                ))
                self.achieved_objectives.append("gt-auth-01")
                self.step += 1

            elif self.step == 1 and current_time_ms >= 5000:
                # Emit failed logins based on difficulty
                num_failures = 3 if self.difficulty == "beginner" else (5 if self.difficulty == "intermediate" else 7)
                for i in range(num_failures):
                    events.append(make_telemetry(
                        exercise_id, get_ts(i * 400), "LOGIN_FAILED", "AUTH-01", "employee_002", "medium", phase,
                        {"reason": "Invalid password credentials", "attemptNumber": i + 1, "targetService": "LDAP"},
                        "gt-auth-02", True
                    ))
                self.achieved_objectives.append("gt-auth-02")
                self.step += 1

            elif self.step == 2 and current_time_ms >= 9000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "SESSION_HIJACK_ATTEMPT", "AUTH-01", "employee_002", "critical", phase,
                    {"token": "simulated_tampered_jwt", "anomaly": "IP location jump from internal to external"},
                    "gt-auth-03", True
                ))
                self.achieved_objectives.append("gt-auth-03")
                self.step += 1

        elif scenario_id == "scenario-api-security":
            if self.step == 0 and current_time_ms >= 2000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "API_ANOMALY", "API-01", "203.0.113.15", "medium", phase,
                    {"endpoint": "/api/v1/users", "queryRate": "50 req/sec", "status": 429},
                    "gt-api-01", True
                ))
                self.achieved_objectives.append("gt-api-01")
                self.step += 1

            elif self.step == 1 and current_time_ms >= 5000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "PARAMETER_TAMPERING", "API-01", "203.0.113.15", "high", phase,
                    {"parameter": "user_id=../../admin", "payload": "IDOR probe"},
                    "gt-api-02", True
                ))
                self.achieved_objectives.append("gt-api-02")
                self.step += 1

            elif self.step == 2 and current_time_ms >= 9000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "DATA_EXFIL_ATTEMPT", "DB-01", "203.0.113.15", "critical", phase,
                    {"rowsRequested": 5000, "table": "synthetic_customers", "query": "SELECT * FROM users"},
                    "gt-api-03", True
                ))
                self.achieved_objectives.append("gt-api-03")
                self.step += 1

        elif scenario_id == "scenario-web-misconfig":
            if self.step == 0 and current_time_ms >= 2000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "PATH_TRAVERSAL_ATTEMPT", "WEB-01", "198.51.100.99", "medium", phase,
                    {"path": "/static/../../etc/dummy_passwd", "method": "GET"},
                    "gt-web-01", True
                ))
                self.achieved_objectives.append("gt-web-01")
                self.step += 1

            elif self.step == 1 and current_time_ms >= 6000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "DEBUG_PROBE", "WEB-01", "198.51.100.99", "high", phase,
                    {"path": "/_debug/env", "exposedVariables": ["DATABASE_HOST", "SECRET_KEY_MOCK"]},
                    "gt-web-02", True
                ))
                self.achieved_objectives.append("gt-web-02")
                self.step += 1

        elif scenario_id == "scenario-credential-compromise":
            if self.step == 0 and current_time_ms >= 2000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "TOKEN_REPLAY", "AUTH-01", "service_account_01", "high", phase,
                    {"source": "leaked_ci_token", "action": "Replay token on auth gateway"},
                    "gt-cred-01", True
                ))
                self.achieved_objectives.append("gt-cred-01")
                self.step += 1

            elif self.step == 1 and current_time_ms >= 5000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "LATERAL_MOVEMENT", "FILE-01", "service_account_01", "critical", phase,
                    {"protocol": "SMB", "targetShare": "\\\\FILE-01\\backups", "action": "Mount share"},
                    "gt-cred-02", True
                ))
                self.achieved_objectives.append("gt-cred-02")
                self.step += 1

            elif self.step == 2 and current_time_ms >= 9000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "PRIVILEGED_DUMP", "DB-01", "service_account_01", "critical", phase,
                    {"target": "db_auth_hashes", "tool": "simulated_secrets_dump"},
                    "gt-cred-03", True
                ))
                self.achieved_objectives.append("gt-cred-03")
                self.step += 1

        elif scenario_id == "scenario-privilege-escalation":
            if self.step == 0 and current_time_ms >= 2000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "ROLE_QUERY", "AUTH-01", "employee_001", "low", phase,
                    {"query": "GET /roles/admin", "response": "403 Forbidden"},
                    "gt-pe-01", True
                ))
                self.achieved_objectives.append("gt-pe-01")
                self.step += 1

            elif self.step == 1 and current_time_ms >= 6000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "PRIVILEGE_CHANGE", "AUTH-01", "employee_001", "critical", phase,
                    {"modifiedRole": "GlobalAdmin", "method": "Exploiting misconfigured token claim"},
                    "gt-pe-02", True
                ))
                self.achieved_objectives.append("gt-pe-02")
                self.step += 1

        elif scenario_id == "scenario-ransomware-controlled":
            if self.step == 0 and current_time_ms >= 2000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "MASS_FILE_ENUM", "FILE-01", "10.0.1.99", "medium", phase,
                    {"filesTraversed": 450, "pattern": "*.docx, *.pdf, *.xlsx", "speed": "high"},
                    "gt-rw-01", True
                ))
                self.achieved_objectives.append("gt-rw-01")
                self.step += 1

            elif self.step == 1 and current_time_ms >= 5000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "ENCRYPTION_INTENT", "FILE-01", "10.0.1.99", "critical", phase,
                    {"simulatedEntropy": 7.98, "renamedExtension": ".locked", "fileCount": 12},
                    "gt-rw-02", True
                ))
                self.achieved_objectives.append("gt-rw-02")
                self.step += 1

            elif self.step == 2 and current_time_ms >= 9000:
                events.append(make_telemetry(
                    exercise_id, get_ts(0), "BACKUP_DISRUPTION_ATTEMPT", "FILE-01", "10.0.1.99", "critical", phase,
                    {"command": "vssadmin delete shadows /all /quiet", "simulatedOutcome": "blocked_by_policy"},
                    "gt-rw-03", True
                ))
                self.achieved_objectives.append("gt-rw-03")
                self.step += 1

        return events


class BlueTeamSentinel:
    def __init__(self):
        self.login_failures = 0
        self.triggered_rules = set()
        self.first_detection_ts: Optional[str] = None
        self.detected_gt_objectives = set()
        self.alerts_created = []

    def analyze(self, events: List[dict], exercise_id: str, phase: str, get_ts) -> Tuple[List[dict], List[dict]]:
        """
        Processes new telemetry events and applies defensive SIEM correlation rules.
        Returns (new_alerts, new_telemetry_events)
        """
        new_alerts = []
        new_telemetry = []

        for evt in events:
            # Rule 1: Brute Force Detection
            if evt["type"] == "LOGIN_FAILED":
                self.login_failures += 1
                if self.login_failures >= 3 and "RULE-AUTH-BRUTE" not in self.triggered_rules:
                    self.triggered_rules.add("RULE-AUTH-BRUTE")
                    alert = {
                        "id": f"alt-{uuid.uuid4().hex[:8]}",
                        "exerciseId": exercise_id,
                        "ruleId": "RULE-AUTH-BRUTE",
                        "title": "Anomalous Brute-Force Authentication Activity",
                        "severity": "high",
                        "timestamp": get_ts(0),
                        "sourceAsset": evt["sourceAsset"],
                        "evidence": [f"{self.login_failures} consecutive failed logins for {evt['actor']}"],
                        "groundTruthDetected": True
                    }
                    new_alerts.append(alert)
                    self.detected_gt_objectives.add("gt-auth-02")
                    if not self.first_detection_ts:
                        self.first_detection_ts = alert["timestamp"]

            # Rule 2: Session Hijack / Token Anomaly
            elif evt["type"] == "SESSION_HIJACK_ATTEMPT" and "RULE-SESSION-HIJACK" not in self.triggered_rules:
                self.triggered_rules.add("RULE-SESSION-HIJACK")
                alert = {
                    "id": f"alt-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "ruleId": "RULE-SESSION-HIJACK",
                    "title": "JWT Session Tampering & Geographic Anomaly",
                    "severity": "critical",
                    "timestamp": get_ts(0),
                    "sourceAsset": evt["sourceAsset"],
                    "evidence": ["Anomalous JWT payload with external origin"],
                    "groundTruthDetected": True
                }
                new_alerts.append(alert)
                self.detected_gt_objectives.add("gt-auth-03")
                if not self.first_detection_ts:
                    self.first_detection_ts = alert["timestamp"]

            # Rule 3: API Abuse & Rate Limiting
            elif evt["type"] in ["API_ANOMALY", "PARAMETER_TAMPERING"] and "RULE-API-ABUSE" not in self.triggered_rules:
                self.triggered_rules.add("RULE-API-ABUSE")
                alert = {
                    "id": f"alt-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "ruleId": "RULE-API-ABUSE",
                    "title": "Excessive API Bursts & Parameter Tampering Probe",
                    "severity": "high",
                    "timestamp": get_ts(0),
                    "sourceAsset": evt["sourceAsset"],
                    "evidence": [f"Unusual parameter payload on {evt['sourceAsset']}"],
                    "groundTruthDetected": True
                }
                new_alerts.append(alert)
                self.detected_gt_objectives.add("gt-api-01")
                self.detected_gt_objectives.add("gt-api-02")
                if not self.first_detection_ts:
                    self.first_detection_ts = alert["timestamp"]

            # Rule 4: Data Exfiltration
            elif evt["type"] == "DATA_EXFIL_ATTEMPT" and "RULE-DATA-EXFIL" not in self.triggered_rules:
                self.triggered_rules.add("RULE-DATA-EXFIL")
                alert = {
                    "id": f"alt-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "ruleId": "RULE-DATA-EXFIL",
                    "title": "Unauthorized Bulk Data Export Attempt",
                    "severity": "critical",
                    "timestamp": get_ts(0),
                    "sourceAsset": evt["sourceAsset"],
                    "evidence": ["High volume row query on database"],
                    "groundTruthDetected": True
                }
                new_alerts.append(alert)
                self.detected_gt_objectives.add("gt-api-03")
                if not self.first_detection_ts:
                    self.first_detection_ts = alert["timestamp"]

            # Rule 5: Path Traversal & Debug Probe
            elif evt["type"] in ["PATH_TRAVERSAL_ATTEMPT", "DEBUG_PROBE"] and "RULE-WEB-TRAVERSAL" not in self.triggered_rules:
                self.triggered_rules.add("RULE-WEB-TRAVERSAL")
                alert = {
                    "id": f"alt-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "ruleId": "RULE-WEB-TRAVERSAL",
                    "title": "Path Traversal and Debug Endpoint Probe Detected",
                    "severity": "high",
                    "timestamp": get_ts(0),
                    "sourceAsset": evt["sourceAsset"],
                    "evidence": [f"Sensitive URI probe on {evt['sourceAsset']}"],
                    "groundTruthDetected": True
                }
                new_alerts.append(alert)
                self.detected_gt_objectives.add("gt-web-01")
                self.detected_gt_objectives.add("gt-web-02")
                if not self.first_detection_ts:
                    self.first_detection_ts = alert["timestamp"]

            # Rule 6: Lateral Movement / Token Replay
            elif evt["type"] in ["TOKEN_REPLAY", "LATERAL_MOVEMENT", "PRIVILEGED_DUMP"] and "RULE-LATERAL-MOVE" not in self.triggered_rules:
                self.triggered_rules.add("RULE-LATERAL-MOVE")
                alert = {
                    "id": f"alt-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "ruleId": "RULE-LATERAL-MOVE",
                    "title": "Lateral Movement & Unauthorized Host Traversal",
                    "severity": "critical",
                    "timestamp": get_ts(0),
                    "sourceAsset": evt["sourceAsset"],
                    "evidence": [f"SMB traverse or token replay against {evt['sourceAsset']}"],
                    "groundTruthDetected": True
                }
                new_alerts.append(alert)
                self.detected_gt_objectives.add("gt-cred-01")
                self.detected_gt_objectives.add("gt-cred-02")
                if not self.first_detection_ts:
                    self.first_detection_ts = alert["timestamp"]

            # Rule 7: Privilege Escalation
            elif evt["type"] == "PRIVILEGE_CHANGE" and "RULE-PRIV-ESC" not in self.triggered_rules:
                self.triggered_rules.add("RULE-PRIV-ESC")
                alert = {
                    "id": f"alt-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "ruleId": "RULE-PRIV-ESC",
                    "title": "Unauthorized Role Elevation to Administrative Claims",
                    "severity": "critical",
                    "timestamp": get_ts(0),
                    "sourceAsset": evt["sourceAsset"],
                    "evidence": ["Unauthorized role escalation in synthetic IAM directory"],
                    "groundTruthDetected": True
                }
                new_alerts.append(alert)
                self.detected_gt_objectives.add("gt-pe-02")
                if not self.first_detection_ts:
                    self.first_detection_ts = alert["timestamp"]

            # Rule 8: Ransomware & Encryption Intent
            elif evt["type"] in ["ENCRYPTION_INTENT", "MASS_FILE_ENUM", "BACKUP_DISRUPTION_ATTEMPT"] and "RULE-RANSOM-ACTIVITY" not in self.triggered_rules:
                self.triggered_rules.add("RULE-RANSOM-ACTIVITY")
                alert = {
                    "id": f"alt-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "ruleId": "RULE-RANSOM-ACTIVITY",
                    "title": "High Entropy File Writes & Simulated Encryption Intent",
                    "severity": "critical",
                    "timestamp": get_ts(0),
                    "sourceAsset": evt["sourceAsset"],
                    "evidence": ["High entropy modification and mass rename activity detected"],
                    "groundTruthDetected": True
                }
                new_alerts.append(alert)
                self.detected_gt_objectives.add("gt-rw-01")
                self.detected_gt_objectives.add("gt-rw-02")
                if not self.first_detection_ts:
                    self.first_detection_ts = alert["timestamp"]

        for alt in new_alerts:
            self.alerts_created.append(alt)
            # Create a corresponding telemetry event for SIEM visibility
            new_telemetry.append(make_telemetry(
                exercise_id, alt["timestamp"], "ALERT_CREATED", alt["sourceAsset"],
                "agent-blue-sentinel", alt["severity"], phase,
                {"ruleId": alt["ruleId"], "title": alt["title"], "evidence": alt["evidence"]},
                None, False
            ))

        return new_alerts, new_telemetry


class InvestigationAnalyst:
    def __init__(self):
        self.incidents_created = {}

    def analyze(self, alerts: List[dict], exercise_id: str, phase: str, get_ts) -> Tuple[List[dict], List[dict]]:
        """
        Correlates alerts into high-confidence Incident entities.
        """
        new_incidents = []
        new_telemetry = []

        for alt in alerts:
            asset = alt["sourceAsset"]
            if asset not in self.incidents_created:
                inc_id = f"inc-{uuid.uuid4().hex[:8]}"
                incident = {
                    "id": inc_id,
                    "exerciseId": exercise_id,
                    "title": f"Security Incident: {alt['title']}",
                    "description": f"Correlated attack pattern against {asset} driven by {alt['ruleId']}.",
                    "severity": alt["severity"],
                    "status": "investigating",
                    "sourceAsset": asset,
                    "detectedAt": alt["timestamp"],
                    "resolvedAt": None,
                    "assignedAgent": "agent-investigation-analyst",
                    "evidence": alt.get("evidence", []),
                    "affectedAssets": [asset],
                    "responseActions": []
                }
                self.incidents_created[asset] = incident
                new_incidents.append(incident)

                new_telemetry.append(make_telemetry(
                    exercise_id, get_ts(0), "INCIDENT_CORRELATED", asset,
                    "agent-investigation-analyst", alt["severity"], phase,
                    {"incidentId": inc_id, "title": incident["title"], "rule": alt["ruleId"]},
                    None, False
                ))
            else:
                # Add evidence to existing incident
                existing = self.incidents_created[asset]
                for ev in alt.get("evidence", []):
                    if ev not in existing["evidence"]:
                        existing["evidence"].append(ev)

        return new_incidents, new_telemetry


class ResponseCommander:
    def __init__(self):
        self.responded_incidents = set()

    def analyze(self, incidents: List[dict], exercise_id: str, phase: str, get_ts) -> Tuple[List[dict], List[dict], List[dict]]:
        """
        Evaluates active incidents and applies permitted playbooks in the synthetic lab.
        Returns (new_response_actions, updated_incidents, new_telemetry)
        """
        new_responses = []
        updated_incidents = []
        new_telemetry = []

        if phase not in ["responding", "evaluating", "completed"]:
            return new_responses, updated_incidents, new_telemetry

        for inc in incidents:
            if inc["id"] not in self.responded_incidents and inc["status"] == "investigating":
                self.responded_incidents.add(inc["id"])
                asset = inc["sourceAsset"]
                
                # Select playbook based on asset and title
                if asset == "AUTH-01":
                    playbook = "PLAYBOOK-IAM-LOCKOUT"
                    action_type = "ACCOUNT_LOCKOUT_AND_IP_BLOCK"
                    rationale = "Contained credential brute force by locking dummy user employee_002 and blocking offending IP."
                elif asset == "API-01":
                    playbook = "PLAYBOOK-API-TOKEN-REVOCATION"
                    action_type = "TOKEN_REVOCATION_AND_RATE_LIMIT"
                    rationale = "Revoked compromised API bearer tokens and applied strict rate limiting on REST gateway."
                elif asset == "FILE-01":
                    playbook = "PLAYBOOK-ENDPOINT-ISOLATION"
                    action_type = "HOST_ISOLATION_AND_SNAPSHOT_VERIFY"
                    rationale = "Isolated FILE-01 from internal virtual subnet to arrest synthetic encryption intent and verified snapshot metadata."
                elif asset == "DB-01":
                    playbook = "PLAYBOOK-DB-SESSION-TERMINATION"
                    action_type = "TERMINATE_PRIVILEGED_CONNECTION"
                    rationale = "Terminated unauthorized connection to database and disabled overprivileged service account."
                else:
                    playbook = "PLAYBOOK-WAF-VIRTUAL-PATCH"
                    action_type = "APPLY_WAF_RULE"
                    rationale = f"Deployed virtual patch on edge reverse proxy for {asset}."

                action_record = {
                    "id": f"act-{uuid.uuid4().hex[:8]}",
                    "exerciseId": exercise_id,
                    "incidentId": inc["id"],
                    "playbookName": playbook,
                    "targetAsset": asset,
                    "actionType": action_type,
                    "status": "executed",
                    "rationale": rationale,
                    "timestamp": get_ts(0)
                }
                new_responses.append(action_record)

                # Update incident state
                inc["status"] = "contained"
                inc["resolvedAt"] = get_ts(0)
                inc["responseActions"].append(action_type)
                updated_incidents.append(inc)

                new_telemetry.append(make_telemetry(
                    exercise_id, get_ts(0), "CONTAINMENT_ACTION", asset,
                    "agent-response-commander", "high", phase,
                    {"playbook": playbook, "actionType": action_type, "status": "executed", "incidentId": inc["id"]},
                    None, False
                ))

        return new_responses, updated_incidents, new_telemetry
