import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "database.sqlite")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS store (
            namespace TEXT NOT NULL,
            key TEXT NOT NULL,
            value TEXT NOT NULL,
            PRIMARY KEY (namespace, key)
        )
    """)
    conn.commit()
    conn.close()

class PersistentMap:
    def __init__(self, namespace: str):
        self.namespace = namespace

    def get(self, key: str):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM store WHERE namespace = ? AND key = ?", (self.namespace, key))
        row = cursor.fetchone()
        conn.close()
        if row:
            return json.loads(row["value"])
        return None

    def set(self, key: str, value: dict):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO store (namespace, key, value) VALUES (?, ?, ?)", 
                       (self.namespace, key, json.dumps(value)))
        conn.commit()
        conn.close()

    def values(self):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM store WHERE namespace = ?", (self.namespace,))
        rows = cursor.fetchall()
        conn.close()
        return [json.loads(row["value"]) for row in rows]

    def has(self, key: str) -> bool:
        return self.get(key) is not None

# Stores
exercise_store = PersistentMap("exercises")
telemetry_store = PersistentMap("telemetry")
incident_store = PersistentMap("incidents")
score_store = PersistentMap("scores")

# Initialize DB on import
init_db()
