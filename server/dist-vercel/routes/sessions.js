"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_js_1 = require("../db/prisma.js");
const auth_js_1 = require("../middleware/auth.js");
const parseId_js_1 = require("../middleware/parseId.js");
const router = (0, express_1.Router)();
// GET /api/sessions — List all sessions for current user
router.get('/', async (req, res) => {
    try {
        const sessions = await prisma_js_1.prisma.session.findMany({
            where: {
                accountId: req.auth.accountId,
                revokedAt: null,
                expiresAt: { gt: new Date() },
            },
            orderBy: { lastActiveAt: 'desc' },
            select: {
                id: true,
                selector: true,
                deviceInfo: true,
                ipAddress: true,
                userAgent: true,
                lastActiveAt: true,
                createdAt: true,
            },
        });
        const result = sessions.map(s => ({
            id: s.id,
            deviceInfo: s.deviceInfo,
            ipAddress: s.ipAddress,
            userAgent: s.userAgent,
            lastActiveAt: s.lastActiveAt.toISOString(),
            createdAt: s.createdAt.toISOString(),
            isCurrent: s.selector === req.auth.selector,
        }));
        res.json(result);
    }
    catch (err) {
        console.error('List sessions error:', err);
        res.status(500).json({ error: 'Failed to list sessions' });
    }
});
// POST /api/sessions/revoke-all — Revoke all sessions except current
// IMPORTANT: Must be defined BEFORE /:id/revoke to avoid Express matching "revoke-all" as :id
router.post('/revoke-all', async (req, res) => {
    try {
        await (0, auth_js_1.revokeAllSessions)(req.auth.accountId, req.auth.selector, 'user_logout');
        res.json({ success: true });
    }
    catch (err) {
        console.error('Revoke all error:', err);
        res.status(500).json({ error: 'Failed to revoke sessions' });
    }
});
// POST /api/sessions/:id/revoke — Revoke a specific session
router.post('/:id/revoke', async (req, res) => {
    try {
        const sessionId = (0, parseId_js_1.parseId)(req.params.id);
        if (Number.isNaN(sessionId)) {
            res.status(400).json({ error: 'Invalid session ID' });
            return;
        }
        const session = await prisma_js_1.prisma.session.findFirst({
            where: { id: sessionId, accountId: req.auth.accountId },
        });
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        await prisma_js_1.prisma.session.update({
            where: { id: sessionId },
            data: { revokedAt: new Date(), revokedReason: 'user_logout' },
        });
        res.json({ success: true });
    }
    catch (err) {
        console.error('Revoke session error:', err);
        res.status(500).json({ error: 'Failed to revoke session' });
    }
});
exports.default = router;
