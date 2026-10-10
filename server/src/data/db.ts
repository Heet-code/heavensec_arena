import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../../database.sqlite');
export const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS store (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (namespace, key)
  );
`);

export class PersistentMap<T> {
  private namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  get(key: string): T | undefined {
    const row = db.prepare('SELECT value FROM store WHERE namespace = ? AND key = ?').get(this.namespace, key) as { value: string } | undefined;
    if (row) {
      return JSON.parse(row.value) as T;
    }
    return undefined;
  }

  set(key: string, value: T): this {
    db.prepare('INSERT OR REPLACE INTO store (namespace, key, value) VALUES (?, ?, ?)').run(this.namespace, key, JSON.stringify(value));
    return this;
  }

  has(key: string): boolean {
    const row = db.prepare('SELECT 1 FROM store WHERE namespace = ? AND key = ?').get(this.namespace, key);
    return !!row;
  }

  delete(key: string): boolean {
    const info = db.prepare('DELETE FROM store WHERE namespace = ? AND key = ?').run(this.namespace, key);
    return info.changes > 0;
  }

  values(): IterableIterator<T> {
    const rows = db.prepare('SELECT value FROM store WHERE namespace = ?').all(this.namespace) as { value: string }[];
    const items = rows.map(r => JSON.parse(r.value) as T);
    return items[Symbol.iterator]();
  }

  get size(): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM store WHERE namespace = ?').get(this.namespace) as { count: number };
    return row.count;
  }
}
