import { Router } from 'express';
import { prisma } from '../db/prisma.js';
import { revokeAllSessions } from '../middleware/auth.js';
import type { SessionInfo } from '@chronicles/shared';

const router = Router();

// GET /api/sessions — List all sessions for current user
router.get('/', async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        accountId: req.auth!.accountId,
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

    const result: SessionInfo[] = sessions.map(s => ({
      id: s.id,
      deviceInfo: s.deviceInfo,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      lastActiveAt: s.lastActiveAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
      isCurrent: s.selector === req.auth!.selector,
    }));

    res.json(result);
  } catch (err) {
    console.error('List sessions error:', err);
    res.status(500).json({ error: 'Failed to list sessions' });
  }
});

// POST /api/sessions/:id/revoke — Revoke a specific session
router.post('/:id/revoke', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.id);
    const session = await prisma.session.findFirst({
      where: { id: sessionId, accountId: req.auth!.accountId },
    });

    if (!session) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date(), revokedReason: 'user_logout' },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Revoke session error:', err);
    res.status(500).json({ error: 'Failed to revoke session' });
  }
});

// POST /api/sessions/revoke-all — Revoke all sessions except current
router.post('/revoke-all', async (req, res) => {
  try {
    await revokeAllSessions(req.auth!.accountId, req.auth!.selector, 'user_logout');
    res.json({ success: true });
  } catch (err) {
    console.error('Revoke all error:', err);
    res.status(500).json({ error: 'Failed to revoke sessions' });
  }
});

export default router;
