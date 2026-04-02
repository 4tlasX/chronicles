import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createShare, getShareByToken, revokeShare, getSharesByAccount } from '../db/shareQueries.js';
import { createShareSchema } from '@chronicles/shared';

const router = Router();

// Helper to serialize Buffer fields to base64
function serializeShare(share: Record<string, unknown>) {
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
router.get('/:token', async (req, res) => {
  try {
    const share = await getShareByToken(req.params.token);
    if (!share) {
      res.status(404).json({ error: 'Share not found or expired' });
      return;
    }
    res.json(serializeShare(share as unknown as Record<string, unknown>));
  } catch (err) {
    console.error('Get share error:', err);
    res.status(500).json({ error: 'Failed to fetch share' });
  }
});

// POST /api/shares — Create a share (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const parsed = createShareSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { contentEncrypted, contentIv, expiresAt } = parsed.data;

    const share = await createShare({
      accountId: req.auth!.accountId,
      contentEncrypted: Buffer.from(contentEncrypted, 'base64'),
      contentIv: Buffer.from(contentIv, 'base64'),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    res.status(201).json(serializeShare(share as unknown as Record<string, unknown>));
  } catch (err) {
    console.error('Create share error:', err);
    res.status(500).json({ error: 'Failed to create share' });
  }
});

// DELETE /api/shares/:token — Revoke a share (protected)
router.delete('/:token', authMiddleware, async (req, res) => {
  try {
    const revoked = await revokeShare(String(req.params.token), req.auth!.accountId);
    if (!revoked) {
      res.status(404).json({ error: 'Share not found or not owned by you' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Revoke share error:', err);
    res.status(500).json({ error: 'Failed to revoke share' });
  }
});

// GET /api/shares — List my shares (protected)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const shares = await getSharesByAccount(req.auth!.accountId);
    res.json(shares.map(s => serializeShare(s as unknown as Record<string, unknown>)));
  } catch (err) {
    console.error('List shares error:', err);
    res.status(500).json({ error: 'Failed to list shares' });
  }
});

export default router;
