import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export const databasePath = resolve(process.env.DATABASE_PATH || 'server/data/leads.sqlite');
mkdirSync(dirname(databasePath), { recursive: true });

export const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    service_required TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
  CREATE TABLE IF NOT EXISTS admin_sessions (
    sid TEXT PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    data TEXT NOT NULL
  );
`);

const leadColumns = new Set(database.prepare('PRAGMA table_info(leads)').all().map(column => column.name));
if (!leadColumns.has('status')) {
  database.exec("ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost'))");
}

const insertLead = database.prepare(`
  INSERT INTO leads (full_name, phone_number, email, service_required)
  VALUES (?, ?, ?, ?)
`);
const findLead = database.prepare('SELECT id, full_name, phone_number, email, service_required, status, created_at FROM leads WHERE id = ?');

export function saveLead(lead) {
  const result = insertLead.run(lead.fullName, lead.phoneNumber, lead.email, lead.serviceRequired);
  return findLead.get(result.lastInsertRowid);
}
