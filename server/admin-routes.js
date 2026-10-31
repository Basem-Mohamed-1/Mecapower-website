import { randomBytes, timingSafeEqual } from 'node:crypto';
import express from 'express';
import bcrypt from 'bcryptjs';
import { rateLimit } from 'express-rate-limit';

export const leadStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
export const serviceNames = [
  'Project Execution',
  'Project design',
  'Design and execution',
  // Keep historical values filterable for leads submitted before the form changed.
  'Mechanical services',
  'Electrical services',
  'Plumbing services',
];
const sessionCookieName = 'ultra_admin_session';

function csrfToken() { return randomBytes(32).toString('base64url'); }

export function requireCsrf(request, response, next) {
  const expected = request.session?.csrfToken;
  const provided = request.get('x-csrf-token');
  if (typeof expected !== 'string' || typeof provided !== 'string') {
    return response.status(403).json({ message: 'Your session expired. Refresh and try again.' });
  }
  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  if (expectedBytes.length !== providedBytes.length || !timingSafeEqual(expectedBytes, providedBytes)) {
    return response.status(403).json({ message: 'Your session expired. Refresh and try again.' });
  }
  return next();
}

export function requireAdmin(request, response, next) {
  if (!Number.isInteger(request.session?.adminId)) {
    return response.status(401).json({ message: 'Please sign in to continue.' });
  }
  return next();
}

function asyncSessionRegenerate(request) {
  return new Promise((resolve, reject) => request.session.regenerate(error => error ? reject(error) : resolve()));
}

function asyncSessionSave(request) {
  return new Promise((resolve, reject) => request.session.save(error => error ? reject(error) : resolve()));
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function integerQuery(value, fallback, max) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 1 && number <= max ? number : null;
}

export function createAdminRouter(database) {
  const router = express.Router();
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Too many sign-in attempts. Please wait and try again.' },
  });
  const findUser = database.prepare('SELECT id, email, password_hash FROM admin_users WHERE email = ? COLLATE NOCASE');
  const detailsById = database.prepare('SELECT id, full_name, phone_number, email, service_required, status, created_at FROM leads WHERE id = ?');
  const setStatus = database.prepare('UPDATE leads SET status = ? WHERE id = ?');
  const deleteLead = database.prepare('DELETE FROM leads WHERE id = ?');

  router.get('/session', (request, response) => {
    request.session.csrfToken ||= csrfToken();
    return response.json({
      authenticated: Number.isInteger(request.session.adminId),
      csrfToken: request.session.csrfToken,
    });
  });

  router.post('/login', loginLimiter, requireCsrf, async (request, response, next) => {
    try {
      const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
      const password = typeof request.body?.password === 'string' ? request.body.password : '';
      if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          || !password || Buffer.byteLength(password, 'utf8') > 72) {
        return response.status(400).json({ message: 'Enter a valid email and password.' });
      }

      const admin = findUser.get(email);
      if (!admin || !await bcrypt.compare(password, admin.password_hash)) {
        return response.status(401).json({ message: 'Email or password is incorrect.' });
      }

      await asyncSessionRegenerate(request);
      request.session.adminId = admin.id;
      request.session.adminEmail = admin.email;
      request.session.csrfToken = csrfToken();
      await asyncSessionSave(request);
      return response.json({ authenticated: true, email: admin.email, csrfToken: request.session.csrfToken });
    } catch (error) { return next(error); }
  });

  router.post('/logout', requireAdmin, requireCsrf, (request, response, next) => {
    request.session.destroy(error => {
      if (error) return next(error);
      response.clearCookie(sessionCookieName, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/' });
      return response.json({ message: 'Signed out.' });
    });
  });

  router.get('/overview', requireAdmin, (_request, response) => {
    const counts = database.prepare(`
      SELECT COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END), 0) AS new_leads,
        COALESCE(SUM(CASE WHEN status = 'Contacted' THEN 1 ELSE 0 END), 0) AS contacted_leads,
        COALESCE(SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END), 0) AS converted_leads
      FROM leads
    `).get();
    const byService = database.prepare('SELECT service_required AS service, COUNT(*) AS total FROM leads GROUP BY service_required ORDER BY service_required').all();
    return response.json({ total: counts.total, new: counts.new_leads, contacted: counts.contacted_leads, converted: counts.converted_leads, byService });
  });

  router.get('/leads', requireAdmin, (request, response) => {
    const page = integerQuery(request.query.page, 1, 1_000_000);
    const limit = integerQuery(request.query.limit, 10, 50);
    if (!page || !limit || ![10, 25, 50].includes(limit)) {
      return response.status(400).json({ message: 'Page or page size is invalid.' });
    }

    const { q = '', service = '', status = '', from = '', to = '' } = request.query;
    if ([q, service, status, from, to].some(value => typeof value !== 'string')) {
      return response.status(400).json({ message: 'Filters must be single text values.' });
    }
    if (q.length > 120) return response.status(400).json({ message: 'Search is too long.' });
    if (service && !serviceNames.includes(service)) return response.status(400).json({ message: 'Service filter is invalid.' });
    if (status && !leadStatuses.includes(status)) return response.status(400).json({ message: 'Status filter is invalid.' });
    if ((from && !validDate(from)) || (to && !validDate(to)) || (from && to && from > to)) {
      return response.status(400).json({ message: 'Date range is invalid.' });
    }

    const clauses = [];
    const values = [];
    if (q.trim()) {
      clauses.push("(instr(lower(full_name), lower(?)) > 0 OR instr(lower(phone_number), lower(?)) > 0 OR instr(lower(email), lower(?)) > 0)");
      values.push(q.trim(), q.trim(), q.trim());
    }
    if (service) { clauses.push('service_required = ?'); values.push(service); }
    if (status) { clauses.push('status = ?'); values.push(status); }
    if (from) { clauses.push('created_at >= ?'); values.push(`${from}T00:00:00.000Z`); }
    if (to) { clauses.push('created_at <= ?'); values.push(`${to}T23:59:59.999Z`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const total = database.prepare(`SELECT COUNT(*) AS total FROM leads ${where}`).get(...values).total;
    const leads = database.prepare(`
      SELECT id, full_name, phone_number, email, service_required, status, created_at
      FROM leads ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?
    `).all(...values, limit, (page - 1) * limit);
    return response.json({ leads, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
  });

  router.get('/leads/:id', requireAdmin, (request, response) => {
    if (!/^\d+$/.test(request.params.id)) return response.status(400).json({ message: 'Lead ID is invalid.' });
    const lead = detailsById.get(Number(request.params.id));
    if (!lead) return response.status(404).json({ message: 'Lead was not found.' });
    return response.json({ lead });
  });

  router.patch('/leads/:id/status', requireAdmin, requireCsrf, (request, response) => {
    if (!/^\d+$/.test(request.params.id)) return response.status(400).json({ message: 'Lead ID is invalid.' });
    const status = request.body?.status;
    if (typeof status !== 'string' || !leadStatuses.includes(status)) {
      return response.status(400).json({ message: 'Choose a valid lead status.' });
    }
    const result = setStatus.run(status, Number(request.params.id));
    if (!result.changes) return response.status(404).json({ message: 'Lead was not found.' });
    return response.json({ lead: detailsById.get(Number(request.params.id)) });
  });

  router.delete('/leads/:id', requireAdmin, requireCsrf, (request, response) => {
    if (!/^\d+$/.test(request.params.id)) return response.status(400).json({ message: 'Lead ID is invalid.' });
    const result = deleteLead.run(Number(request.params.id));
    if (!result.changes) return response.status(404).json({ message: 'Lead was not found.' });
    return response.json({ message: 'Lead deleted.' });
  });

  return router;
}
