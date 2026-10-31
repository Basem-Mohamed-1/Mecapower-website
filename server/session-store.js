import session from 'express-session';

const sessionLifetimeMs = 8 * 60 * 60 * 1000;

export class SQLiteSessionStore extends session.Store {
  constructor(database) {
    super();
    this.database = database;
    this.getStatement = database.prepare('SELECT data, expires_at FROM admin_sessions WHERE sid = ?');
    this.upsertStatement = database.prepare(`
      INSERT INTO admin_sessions (sid, expires_at, data) VALUES (?, ?, ?)
      ON CONFLICT(sid) DO UPDATE SET expires_at = excluded.expires_at, data = excluded.data
    `);
    this.deleteStatement = database.prepare('DELETE FROM admin_sessions WHERE sid = ?');
    this.touchStatement = database.prepare('UPDATE admin_sessions SET expires_at = ? WHERE sid = ?');
    this.deleteExpiredStatement = database.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?');
    this.cleanupTimer = setInterval(() => {
      try { this.deleteExpiredStatement.run(Date.now()); } catch (error) { console.error('Session cleanup failed:', error); }
    }, 60 * 60 * 1000).unref();
  }

  get(sid, callback) {
    try {
      const row = this.getStatement.get(sid);
      if (!row) return callback(null, null);
      if (row.expires_at <= Date.now()) {
        this.deleteStatement.run(sid);
        return callback(null, null);
      }
      return callback(null, JSON.parse(row.data));
    } catch (error) { return callback(error); }
  }

  set(sid, value, callback = () => {}) {
    try {
      const expiresAt = value.cookie?.expires ? new Date(value.cookie.expires).getTime() : Date.now() + sessionLifetimeMs;
      this.upsertStatement.run(sid, expiresAt, JSON.stringify(value));
      return callback(null);
    } catch (error) { return callback(error); }
  }

  touch(sid, value, callback = () => {}) {
    try {
      const expiresAt = value.cookie?.expires ? new Date(value.cookie.expires).getTime() : Date.now() + sessionLifetimeMs;
      this.touchStatement.run(expiresAt, sid);
      return callback(null);
    } catch (error) { return callback(error); }
  }

  destroy(sid, callback = () => {}) {
    try { this.deleteStatement.run(sid); return callback(null); }
    catch (error) { return callback(error); }
  }
}

export { sessionLifetimeMs };
