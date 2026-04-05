"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_js_1 = require("../middleware/auth.js");
const rateLimiter_js_1 = require("../middleware/rateLimiter.js");
const shareQueries_js_1 = require("../db/shareQueries.js");
const shared_1 = require("@chronicles/shared");
const router = (0, express_1.Router)();
// Helper to serialize Buffer fields to base64
function serializeShare(share) {
    const result = { ...share };
    for (const key of ['contentEncrypted', 'contentIv']) {
        const val = result[key];
        if (val instanceof Uint8Array || val instanceof Buffer) {
            result[key] = Buffer.from(val).toString('base64');
        }
    }
    return result;
}
// GET /api/shares/:token — Public, no auth required
router.get('/:token', rateLimiter_js_1.shareLimiter, async (req, res) => {
    try {
        const share = await (0, shareQueries_js_1.getShareByToken)(String(req.params.token));
        if (!share) {
            res.status(404).json({ error: 'Share not found or expired' });
            return;
        }
        res.json(serializeShare(share));
    }
    catch (err) {
        console.error('Get share error:', err);
        res.status(500).json({ error: 'Failed to fetch share' });
    }
});
// POST /api/shares — Create a share (protected)
router.post('/', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const parsed = shared_1.createShareSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }
        const { contentEncrypted, contentIv, expiresAt } = parsed.data;
        const share = await (0, shareQueries_js_1.createShare)({
            accountId: req.auth.accountId,
            contentEncrypted: Buffer.from(contentEncrypted, 'base64'),
            contentIv: Buffer.from(contentIv, 'base64'),
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });
        res.status(201).json(serializeShare(share));
    }
    catch (err) {
        console.error('Create share error:', err);
        res.status(500).json({ error: 'Failed to create share' });
    }
});
// DELETE /api/shares/:token — Revoke a share (protected)
router.delete('/:token', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const revoked = await (0, shareQueries_js_1.revokeShare)(String(req.params.token), req.auth.accountId);
        if (!revoked) {
            res.status(404).json({ error: 'Share not found or not owned by you' });
            return;
        }
        res.json({ success: true });
    }
    catch (err) {
        console.error('Revoke share error:', err);
        res.status(500).json({ error: 'Failed to revoke share' });
    }
});
// GET /api/shares — List my shares (protected)
router.get('/', auth_js_1.authMiddleware, async (req, res) => {
    try {
        const shares = await (0, shareQueries_js_1.getSharesByAccount)(req.auth.accountId);
        res.json(shares.map(s => serializeShare(s)));
    }
    catch (err) {
        console.error('List shares error:', err);
        res.status(500).json({ error: 'Failed to list shares' });
    }
});
exports.default = router;
