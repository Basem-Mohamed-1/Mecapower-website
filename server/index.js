import { randomBytes } from 'node:crypto';
import express from 'express';
import helmet from 'helmet';
import session from 'express-session';
import { database, databasePath, saveLead } from './database.js';
import { sendLeadNotification } from './email.js';
import { validateLead } from './validation.js';
import { createAdminRouter } from './admin-routes.js';
import { SQLiteSessionStore, sessionLifetimeMs } from './session-store.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.ADMIN_SESSION_SECRET || (!production ? randomBytes(48).toString('base64url') : '');
if (!sessionSecret || Buffer.byteLength(sessionSecret) < 32) {
  throw new Error('Set ADMIN_SESSION_SECRET to a random secret of at least 32 bytes.');
}

app.disable('x-powered-by');
app.set('trust proxy', production ? Number(process.env.TRUST_PROXY_HOPS || 1) : false);
app.use(helmet());
app.use(express.json({ limit: '10kb', type: 'application/json' }));
app.use(session({
  name: 'ultra_admin_session',
  secret: sessionSecret,
  store: new SQLiteSessionStore(database),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: production,
    maxAge: sessionLifetimeMs,
    path: '/',
  },
}));

app.post('/api/contact', async (request, response, next) => {
  const { lead, error } = validateLead(request.body);
  if (error) return response.status(400).json({ message: error });

  let savedLead;
  try {
    savedLead = saveLead(lead);
  } catch (saveError) {
    return next(saveError);
  }

  let emailSent = false;
  try {
    emailSent = await sendLeadNotification(savedLead);
  } catch (emailError) {
    console.error(`Lead ${savedLead.id} was saved, but its notification email failed:`, emailError);
  }

  return response.status(201).json({
    message: 'Thank you. Your request has been received.',
    emailSent,
  });
});

app.use('/api/admin', createAdminRouter(database));
app.use('/api', (_request, response) => response.status(404).json({ message: 'API endpoint not found.' }));

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ message: 'Request body is too large.' });
  }
  console.error('Contact API error:', error);
  return response.status(500).json({ message: 'We could not save your request. Please try again.' });
});

export const server = app.listen(port, () => console.log(`Ultra API listening on http://localhost:${port} (database: ${databasePath})`));
