import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { securityHeaders } from './middleware/security.js';
import { authMiddleware, cleanupSessions } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import entriesRoutes from './routes/entries.js';
import topicsRoutes from './routes/topics.js';
import settingsRoutes from './routes/settings.js';
import sessionsRoutes from './routes/sessions.js';
import sharesRoutes from './routes/shares.js';
import dosesRoutes from './routes/doses.js';
import { initSharesTable } from './db/shareQueries.js';

// Prisma raw queries return BigInt for integer columns — make JSON.stringify handle them
(BigInt.prototype as unknown as Record<string, unknown>).toJSON = function () {
  return Number(this);
};

const app = express();
const PORT = process.env.PORT || 3001;

// Require CLIENT_URL in production to prevent misconfigured CORS
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL) {
  throw new Error('CLIENT_URL environment variable is required in production');
}

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(securityHeaders);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', authMiddleware, entriesRoutes);
app.use('/api/topics', authMiddleware, topicsRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/sessions', authMiddleware, sessionsRoutes);
app.use('/api/doses', authMiddleware, dosesRoutes);
app.use('/api/shares', sharesRoutes); // public GET by token; POST/DELETE use authMiddleware inline

// Global error handler — sanitize errors in production
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (process.env.NODE_ENV === 'production') {
    console.error('Unhandled error:', err.message);
  } else {
    console.error('Unhandled error:', err);
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Init shares table + cleanup expired sessions on startup and periodically
initSharesTable().catch(err => console.error('Failed to init shares table:', err));
cleanupSessions().then(count => {
  if (count > 0) console.log(`Cleaned up ${count} expired/revoked sessions`);
}).catch(() => {});

// Run session cleanup every 6 hours
setInterval(() => {
  cleanupSessions().catch(() => {});
}, 6 * 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Chronicles API running on port ${PORT}`);
});

export default app;
