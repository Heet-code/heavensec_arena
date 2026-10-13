"""
Scenario Library and Synthetic Environment definitions for HavenSec Arena.
All actions remain 100% synthetic, harmless, and bounded within the simulated environment.
"""

from typing import Dict, Any, List

SYNTHETIC_ENVIRONMENT = {
    "id": "env-acme-web-platform",
    "name": "Acme Web Platform",
    "organization": "Acme Digital",
    "assets": [
        {
            "id": "WEB-01",
            "name": "WEB-01",
            "type": "web",
            "ip": "10.0.1.10",
            "services": ["HTTPS:443", "HTTP:80", "Python/FastAPI:8000"],
            "vulnerabilities": ["missing-rate-limiting", "verbose-error-messages"],
            "status": "normal"
        },
        {
            "id": "API-01",
            "name": "API-01",
            "type": "api",
            "ip": "10.0.1.20",
            "services": ["REST-API:8080", "GraphQL:4000"],
            "vulnerabilities": ["excessive-data-exposure", "missing-auth-on-endpoints"],
            "status": "normal"
        },
        {
            "id": "AUTH-01",
            "name": "AUTH-01",
            "type": "auth",
            "ip": "10.0.2.10",
            "services": ["LDAP:389", "OAuth2:8443", "SAML:8444"],
            "vulnerabilities": ["weak-password-policy", "no-mfa-enforcement"],
            "status": "normal"
        },
        {
            "id": "DB-01",
            "name": "DB-01",
            "type": "database",
            "ip": "10.0.3.10",
            "services": ["PostgreSQL:5432", "Redis:6379"],
            "vulnerabilities": ["overprivileged-service-account", "unencrypted-backup"],
            "status": "normal"
        },
        {
            "id": "FILE-01",
            "name": "FILE-01",
            "type": "file",
            "ip": "10.0.3.20",
            "services": ["SMB:445", "NFS:2049"],
            "vulnerabilities": ["world-readable-shares", "missing-audit-logging"],
            "status": "normal"
        }
    ],
    "users": [
        {"id": "user-001", "username": "employee_001", "role": "employee", "department": "Engineering"},
        {"id": "user-002", "username": "employee_002", "role": "employee", "department": "Marketing"},
        {"id": "user-003", "username": "admin_001", "role": "admin", "department": "IT Security"},
        {"id": "user-004", "username": "service_account_01", "role": "service", "department": "Platform"}
    ],
    "networkRanges": ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"],
    "securityControls": [
        "Web Application Firewall (WAF)",
        "SIEM Event Correlation",
        "Endpoint Sentinel Agent",
        "Identity & Access Management (IAM)",
        "Automated Account Lockout"
    ]
}

SCENARIOS: Dict[str, Dict[str, Any]] = {
    "scenario-suspicious-auth": {
        "id": "scenario-suspicious-auth",
        "name": "Suspicious Authentication / Brute Force",
        "description": "Simulates credential-based attack patterns including brute force, credential stuffing, and account takeover attempts against authentication infrastructure.",
        "category": "Authentication",
        "difficulty": "beginner",
        "techniques": ["Brute Force (T1110)", "Credential Stuffing (T1110.004)", "Password Spraying (T1110.003)"],
        "targetAssets": ["AUTH-01", "WEB-01"],
        "expectedOutcome": "Detection of anomalous authentication failures, automated IP blocking, and account lockout.",
        "mitreTactics": ["Initial Access", "Credential Access"],
        "groundTruthObjectives": [
            {
                "id": "gt-auth-01",
                "name": "Reconnaissance against Web Portal",
                "phase": "running",
                "targetAsset": "WEB-01",
                "expectedIndicator": "HTTP_REQUEST",
                "criticality": "low",
                "mitreTactic": "Reconnaissance"
            },
            {
                "id": "gt-auth-02",
                "name": "High-Volume Failed Logins",
                "phase": "detecting",
                "targetAsset": "AUTH-01",
                "expectedIndicator": "LOGIN_FAILED",
                "criticality": "high",
                "mitreTactic": "Credential Access"
            },
            {
                "id": "gt-auth-03",
                "name": "Account Takeover Attempt",
                "phase": "investigating",
                "targetAsset": "AUTH-01",
                "expectedIndicator": "SESSION_HIJACK_ATTEMPT",
                "criticality": "critical",
                "mitreTactic": "Initial Access"
            }
        ]
    },
    "scenario-api-security": {
        "id": "scenario-api-security",
        "name": "API Security Abuse & Parameter Tampering",
        "description": "Simulates API abuse patterns including excessive request bursts, parameter tampering, unauthorized endpoint probing, and data extraction attempts.",
        "category": "API Security",
        "difficulty": "intermediate",
        "techniques": ["API Abuse (T1190)", "Parameter Tampering (T1565)", "Data Exfiltration (T1041)"],
        "targetAssets": ["API-01", "DB-01"],
        "expectedOutcome": "Detection of rate limit anomalies, identification of parameter tampering, and revocation of malicious API tokens.",
        "mitreTactics": ["Initial Access", "Collection", "Exfiltration"],
        "groundTruthObjectives": [
            {
                "id": "gt-api-01",
                "name": "API Endpoint Fuzzing",
                "phase": "running",
                "targetAsset": "API-01",
                "expectedIndicator": "API_ANOMALY",
                "criticality": "medium",
                "mitreTactic": "Discovery"
            },
            {
                "id": "gt-api-02",
                "name": "Excessive Parameter Tampering",
                "phase": "detecting",
                "targetAsset": "API-01",
                "expectedIndicator": "PARAMETER_TAMPERING",
                "criticality": "high",
                "mitreTactic": "Collection"
            },
            {
                "id": "gt-api-03",
                "name": "Unauthorized Bulk Data Query",
                "phase": "investigating",
                "targetAsset": "DB-01",
                "expectedIndicator": "DATA_EXFIL_ATTEMPT",
                "criticality": "critical",
                "mitreTactic": "Exfiltration"
            }
        ]
    },
    "scenario-web-misconfig": {
        "id": "scenario-web-misconfig",
        "name": "Web Application Misconfiguration",
        "description": "Simulates exploitation of common web application misconfigurations including exposed debug panels, directory traversal, and insecure headers.",
        "category": "Web Security",
        "difficulty": "beginner",
        "techniques": ["Directory Traversal (T1083)", "Information Disclosure (T1592)", "Insecure Configuration (T1190)"],
        "targetAssets": ["WEB-01", "API-01"],
        "expectedOutcome": "Detection of path traversal attempts, alerts on sensitive file queries, and WAF rule containment.",
        "mitreTactics": ["Discovery", "Initial Access"],
        "groundTruthObjectives": [
            {
                "id": "gt-web-01",
                "name": "Path Traversal Scanning",
                "phase": "running",
                "targetAsset": "WEB-01",
                "expectedIndicator": "PATH_TRAVERSAL_ATTEMPT",
                "criticality": "medium",
                "mitreTactic": "Discovery"
            },
            {
                "id": "gt-web-02",
                "name": "Debug Endpoint Probing",
                "phase": "detecting",
                "targetAsset": "WEB-01",
                "expectedIndicator": "DEBUG_PROBE",
                "criticality": "high",
                "mitreTactic": "Initial Access"
            }
        ]
    },
    "scenario-credential-compromise": {
        "id": "scenario-credential-compromise",
        "name": "Credential Compromise & Lateral Movement",
        "description": "Simulates a full attack chain: initial access via leaked credentials, lateral movement across database and file servers, and administrative token theft.",
        "category": "Privilege Management",
        "difficulty": "advanced",
        "techniques": ["Pass-the-Hash (T1550.002)", "Lateral Movement (T1021)", "Privilege Escalation (T1068)"],
        "targetAssets": ["AUTH-01", "DB-01", "FILE-01"],
        "expectedOutcome": "Cross-asset correlation of stolen session tokens, isolation of compromised hosts, and global credential revocation.",
        "mitreTactics": ["Credential Access", "Lateral Movement", "Privilege Escalation"],
        "groundTruthObjectives": [
            {
                "id": "gt-cred-01",
                "name": "Illicit Token Replay",
                "phase": "running",
                "targetAsset": "AUTH-01",
                "expectedIndicator": "TOKEN_REPLAY",
                "criticality": "high",
                "mitreTactic": "Credential Access"
            },
            {
                "id": "gt-cred-02",
                "name": "Lateral SMB Query to File Server",
                "phase": "detecting",
                "targetAsset": "FILE-01",
                "expectedIndicator": "LATERAL_MOVEMENT",
                "criticality": "critical",
                "mitreTactic": "Lateral Movement"
            },
            {
                "id": "gt-cred-03",
                "name": "Privileged Database Dump",
                "phase": "investigating",
                "targetAsset": "DB-01",
                "expectedIndicator": "PRIVILEGED_DUMP",
                "criticality": "critical",
                "mitreTactic": "Collection"
            }
        ]
    },
    "scenario-privilege-escalation": {
        "id": "scenario-privilege-escalation",
        "name": "Privilege Escalation Simulation",
        "description": "Simulates privilege escalation attempts from a low-privileged service account seeking administrative roles on critical identity stores.",
        "category": "Privilege Management",
        "difficulty": "intermediate",
        "techniques": ["Token Manipulation (T1134)", "Service Account Abuse (T1078.004)", "Sudo Misconfiguration (T1548)"],
        "targetAssets": ["AUTH-01", "DB-01"],
        "expectedOutcome": "Detection of unauthorized role changes, termination of elevated sessions, and containment of service accounts.",
        "mitreTactics": ["Privilege Escalation", "Defense Evasion"],
        "groundTruthObjectives": [
            {
                "id": "gt-pe-01",
                "name": "Service Account Role Query",
                "phase": "running",
                "targetAsset": "AUTH-01",
                "expectedIndicator": "ROLE_QUERY",
                "criticality": "medium",
                "mitreTactic": "Discovery"
            },
            {
                "id": "gt-pe-02",
                "name": "Unauthorized Privilege Grant Attempt",
                "phase": "detecting",
                "targetAsset": "AUTH-01",
                "expectedIndicator": "PRIVILEGE_CHANGE",
                "criticality": "critical",
                "mitreTactic": "Privilege Escalation"
            }
        ]
    },
    "scenario-ransomware-controlled": {
        "id": "scenario-ransomware-controlled",
        "name": "Controlled Ransomware & Backup Disruption Simulation",
        "description": "An isolated, fully synthetic ransomware-style exercise: reconnaissance, file mass-read telemetry, simulated encryption-intent events, and containment via endpoint isolation.",
        "category": "Ransomware",
        "difficulty": "advanced",
        "techniques": ["Data Encrypted for Impact (T1486)", "Inhibit System Recovery (T1490)", "Automated Exfiltration (T1020)"],
        "targetAssets": ["FILE-01", "DB-01", "WEB-01"],
        "expectedOutcome": "Immediate heuristic detection of mass write patterns, endpoint network isolation, and synthetic backup snapshot verification.",
        "mitreTactics": ["Impact", "Inhibit System Recovery"],
        "groundTruthObjectives": [
            {
                "id": "gt-rw-01",
                "name": "Mass File Enumeration",
                "phase": "running",
                "targetAsset": "FILE-01",
                "expectedIndicator": "MASS_FILE_ENUM",
                "criticality": "medium",
                "mitreTactic": "Discovery"
            },
            {
                "id": "gt-rw-02",
                "name": "Simulated Encryption-Intent Telemetry",
                "phase": "detecting",
                "targetAsset": "FILE-01",
                "expectedIndicator": "ENCRYPTION_INTENT",
                "criticality": "critical",
                "mitreTactic": "Impact"
            },
            {
                "id": "gt-rw-03",
                "name": "Simulated Shadow Copy Deletion Query",
                "phase": "investigating",
                "targetAsset": "FILE-01",
                "expectedIndicator": "BACKUP_DISRUPTION_ATTEMPT",
                "criticality": "critical",
                "mitreTactic": "Inhibit System Recovery"
            }
        ]
    }
}

def get_scenario(scenario_id: str) -> Dict[str, Any]:
    return SCENARIOS.get(scenario_id, SCENARIOS["scenario-suspicious-auth"])

def list_all_scenarios() -> List[Dict[str, Any]]:
    return list(SCENARIOS.values())
