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

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
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
