"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const security_js_1 = require("./middleware/security.js");
const auth_js_1 = require("./middleware/auth.js");
const rateLimiter_js_1 = require("./middleware/rateLimiter.js");
const auth_js_2 = __importDefault(require("./routes/auth.js"));
const entries_js_1 = __importDefault(require("./routes/entries.js"));
const topics_js_1 = __importDefault(require("./routes/topics.js"));
const settings_js_1 = __importDefault(require("./routes/settings.js"));
const sessions_js_1 = __importDefault(require("./routes/sessions.js"));
const shares_js_1 = __importDefault(require("./routes/shares.js"));
const doses_js_1 = __importDefault(require("./routes/doses.js"));
const shareQueries_js_1 = require("./db/shareQueries.js");
// Prisma raw queries return BigInt for integer columns — make JSON.stringify handle them
BigInt.prototype.toJSON = function () {
    return Number(this);
};
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Require CLIENT_URL in production (unless on Vercel where it's same-origin)
if (process.env.NODE_ENV === 'production' && !process.env.CLIENT_URL && !process.env.VERCEL) {
    throw new Error('CLIENT_URL environment variable is required in production');
}
// Validate CLIENT_URL format
if (process.env.CLIENT_URL) {
    try {
        const parsed = new URL(process.env.CLIENT_URL);
        if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
            throw new Error('CLIENT_URL must use HTTPS in production');
        }
        if (parsed.pathname !== '/' || parsed.search || parsed.hash) {
            console.warn('WARNING: CLIENT_URL should be an origin (no path, query, or hash)');
        }
    }
    catch (err) {
        if (err instanceof TypeError) {
            throw new Error(`CLIENT_URL is not a valid URL: ${process.env.CLIENT_URL}`);
        }
        throw err;
    }
}
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173'),
    credentials: true,
}));
app.use(express_1.default.json({ limit: '1mb' }));
app.use((0, cookie_parser_1.default)());
app.use(security_js_1.securityHeaders);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_js_2.default);
app.use('/api/entries', auth_js_1.authMiddleware, rateLimiter_js_1.apiLimiter, entries_js_1.default);
app.use('/api/topics', auth_js_1.authMiddleware, rateLimiter_js_1.apiLimiter, topics_js_1.default);
app.use('/api/settings', auth_js_1.authMiddleware, rateLimiter_js_1.apiLimiter, settings_js_1.default);
app.use('/api/sessions', auth_js_1.authMiddleware, rateLimiter_js_1.apiLimiter, sessions_js_1.default);
app.use('/api/doses', auth_js_1.authMiddleware, rateLimiter_js_1.apiLimiter, doses_js_1.default);
app.use('/api/shares', shares_js_1.default); // public GET by token; POST/DELETE use authMiddleware inline
// Global error handler — sanitize errors in production
app.use((err, _req, res, _next) => {
    if (process.env.NODE_ENV === 'production') {
        console.error('Unhandled error:', err.message);
    }
    else {
        console.error('Unhandled error:', err);
    }
    res.status(500).json({ error: 'Internal server error' });
});
if (process.env.VERCEL) {
    // Serverless: init shares table on cold start (non-blocking)
    (0, shareQueries_js_1.initSharesTable)().catch(err => console.error('Failed to init shares table:', err));
}
else {
    // Standalone server: init + periodic cleanup + listen
    (0, shareQueries_js_1.initSharesTable)().catch(err => console.error('Failed to init shares table:', err));
    (0, auth_js_1.cleanupSessions)().then(count => {
        if (count > 0)
            console.log(`Cleaned up ${count} expired/revoked sessions`);
    }).catch(() => { });
    setInterval(() => {
        (0, auth_js_1.cleanupSessions)().catch(() => { });
    }, 6 * 60 * 60 * 1000);
    app.listen(PORT, () => {
        console.log(`Chronicles API running on port ${PORT}`);
    });
}
exports.default = app;
