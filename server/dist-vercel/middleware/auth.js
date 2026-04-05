"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.createSession = createSession;
exports.revokeSession = revokeSession;
exports.revokeAllSessions = revokeAllSessions;
exports.cleanupSessions = cleanupSessions;
const crypto_1 = __importDefault(require("crypto"));
const prisma_js_1 = require("../db/prisma.js");
const ACTIVITY_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes
/**
 * Split token auth middleware
 * Supports both cookie (web) and Bearer (mobile) authentication
 * Cookie path enforces CSRF protection via X-Requested-With header
 */
async function authMiddleware(req, res, next) {
    let token;
    // Explicit branching: Bearer vs Cookie
    if (req.headers.authorization?.startsWith('Bearer ')) {
        // MOBILE PATH: Token from secure storage, no CSRF risk
        token = req.headers.authorization.slice(7);
    }
    else if (req.cookies?.['__Host-chronicle_session'] || req.cookies?.chronicle_session) {
        // WEB PATH: Cookie sent automatically — enforce CSRF header
        if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
            res.status(403).json({ error: 'Missing CSRF header' });
            return;
        }
        token = req.cookies['__Host-chronicle_session'] || req.cookies.chronicle_session;
    }
    if (!token || token.length < 44) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    // Split token: first 12 chars = selector, rest = verifier
    const selector = token.slice(0, 12);
    const verifier = token.slice(12);
    // Single-row lookup by selector (indexed)
    const session = await prisma_js_1.prisma.session.findUnique({
        where: { selector },
    });
    if (!session) {
        res.status(401).json({ error: 'Invalid session' });
        return;
    }
    // Check revocation and expiry
    if (session.revokedAt) {
        res.status(401).json({ error: 'Session revoked' });
        return;
    }
    if (session.expiresAt < new Date()) {
        res.status(401).json({ error: 'Session expired' });
        return;
    }
    // Constant-time compare: SHA-256(verifier) === stored verifierHash
    const verifierHash = crypto_1.default.createHash('sha256').update(verifier).digest('hex');
    if (!crypto_1.default.timingSafeEqual(Buffer.from(verifierHash), Buffer.from(session.verifierHash))) {
        res.status(401).json({ error: 'Invalid session' });
        return;
    }
    // Debounced lastActiveAt update (fire-and-forget)
    const timeSinceActive = Date.now() - session.lastActiveAt.getTime();
    if (timeSinceActive > ACTIVITY_DEBOUNCE_MS) {
        prisma_js_1.prisma.session.update({
            where: { id: session.id },
            data: { lastActiveAt: new Date() },
        }).catch((err) => {
            console.error('Session activity update failed:', err instanceof Error ? err.message : 'Unknown error');
        });
    }
    // Attach auth info to request
    req.auth = {
        accountId: session.accountId,
        tenantSchemaName: session.tenantSchemaName,
        sessionId: session.id,
        selector: session.selector,
    };
    next();
}
// =============================================================================
// Session helpers
// =============================================================================
/**
 * Create a new session with split token
 * Returns the full token (selector + verifier) to send to client
 */
async function createSession(accountId, tenantSchemaName, options = {}) {
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const selector = crypto_1.default.randomBytes(6).toString('hex'); // 12 hex chars
        const verifier = crypto_1.default.randomBytes(16).toString('hex'); // 32 hex chars
        const verifierHash = crypto_1.default.createHash('sha256').update(verifier).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7-day max lifetime
        try {
            await prisma_js_1.prisma.session.create({
                data: {
                    selector,
                    verifierHash,
                    accountId,
                    tenantSchemaName,
                    schemaVersion: options.schemaVersion || 0,
                    deviceInfo: options.deviceInfo || null,
                    ipAddress: options.ipAddress || null,
                    userAgent: options.userAgent || null,
                    expiresAt,
                },
            });
            return selector + verifier; // 44 chars total
        }
        catch (err) {
            // Retry on unique constraint violation (selector collision)
            const isUniqueViolation = err instanceof Error && 'code' in err && err.code === 'P2002';
            if (!isUniqueViolation || attempt === MAX_RETRIES - 1)
                throw err;
        }
    }
    throw new Error('Failed to create session after retries');
}
/**
 * Revoke a session by selector
 */
async function revokeSession(selector, reason) {
    await prisma_js_1.prisma.session.update({
        where: { selector },
        data: { revokedAt: new Date(), revokedReason: reason },
    });
}
/**
 * Revoke all sessions for an account except the current one
 */
async function revokeAllSessions(accountId, exceptSelector, reason = 'password_change') {
    await prisma_js_1.prisma.session.updateMany({
        where: {
            accountId,
            revokedAt: null,
            ...(exceptSelector ? { NOT: { selector: exceptSelector } } : {}),
        },
        data: { revokedAt: new Date(), revokedReason: reason },
    });
}
/**
 * Clean up expired and revoked sessions
 */
async function cleanupSessions() {
    // Grace period: only delete sessions expired/revoked for more than 1 day
    // to avoid deleting sessions that are currently in-flight
    const gracePeriod = new Date();
    gracePeriod.setDate(gracePeriod.getDate() - 1);
    const result = await prisma_js_1.prisma.session.deleteMany({
        where: {
            OR: [
                { expiresAt: { lt: gracePeriod } },
                { revokedAt: { not: null, lt: gracePeriod } },
            ],
        },
    });
    return result.count;
}
