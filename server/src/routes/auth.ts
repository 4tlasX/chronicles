import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma.js';
import { registerTenant } from '../db/schemaManager.js';
import { createSession, revokeSession, revokeAllSessions, authMiddleware } from '../middleware/auth.js';
import { registerSchema, loginSchema, changePasswordSchema, recoverSchema } from '@chronicles/shared';

const router = Router();

const BCRYPT_ROUNDS = 12;
const COOKIE_NAME = 'chronicle_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

// =============================================================================
// POST /api/auth/register
// =============================================================================
router.post('/register', async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, username, password, encryptedMasterKey, kekSalt, kekWrapIv, recoveryWrappedMK, recoveryWrapIv } = parsed.data;

    // Check for existing account
    const existing = await prisma.account.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      res.status(409).json({ error: existing.email === email ? 'Email already registered' : 'Username taken' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { account, schemaName } = await registerTenant(email, username, passwordHash, {
      kekSalt: new Uint8Array(Buffer.from(kekSalt, 'base64')),
      encryptedMasterKey: new Uint8Array(Buffer.from(encryptedMasterKey, 'base64')),
      kekWrapIv: new Uint8Array(Buffer.from(kekWrapIv, 'base64')),
      recoveryWrappedMK: new Uint8Array(Buffer.from(recoveryWrappedMK, 'base64')),
      recoveryWrapIv: new Uint8Array(Buffer.from(recoveryWrapIv, 'base64')),
    });

    // Create session
    const token = await createSession(account.id, schemaName, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({
      user: { email: account.email, username: account.username },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// =============================================================================
// GET /api/auth/me — Validate current session and return user info
// =============================================================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const account = await prisma.account.findUnique({
      where: { id: req.auth!.accountId },
      select: {
        email: true,
        username: true,
        encryptionEnabled: true,
        kekSalt: true,
        encryptedMasterKey: true,
        kekWrapIv: true,
        kekIterations: true,
        recoveryWrappedMK: true,
        recoveryWrapIv: true,
      },
    });

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    res.json({
      user: { email: account.email, username: account.username },
      encryption: {
        encryptionEnabled: account.encryptionEnabled,
        kekSalt: account.kekSalt ? Buffer.from(account.kekSalt).toString('base64') : null,
        encryptedMasterKey: account.encryptedMasterKey ? Buffer.from(account.encryptedMasterKey).toString('base64') : null,
        kekWrapIv: account.kekWrapIv ? Buffer.from(account.kekWrapIv).toString('base64') : null,
        kekIterations: account.kekIterations,
        recoveryWrappedMK: account.recoveryWrappedMK ? Buffer.from(account.recoveryWrappedMK).toString('base64') : null,
        recoveryWrapIv: account.recoveryWrapIv ? Buffer.from(account.recoveryWrapIv).toString('base64') : null,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// =============================================================================
// POST /api/auth/login
// =============================================================================
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = await createSession(account.id, account.tenantSchemaName, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({
      user: { email: account.email, username: account.username },
      encryption: {
        encryptionEnabled: account.encryptionEnabled,
        kekSalt: account.kekSalt ? Buffer.from(account.kekSalt).toString('base64') : null,
        encryptedMasterKey: account.encryptedMasterKey ? Buffer.from(account.encryptedMasterKey).toString('base64') : null,
        kekWrapIv: account.kekWrapIv ? Buffer.from(account.kekWrapIv).toString('base64') : null,
        kekIterations: account.kekIterations,
        recoveryWrappedMK: account.recoveryWrappedMK ? Buffer.from(account.recoveryWrappedMK).toString('base64') : null,
        recoveryWrapIv: account.recoveryWrapIv ? Buffer.from(account.recoveryWrapIv).toString('base64') : null,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// =============================================================================
// POST /api/auth/logout
// =============================================================================
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await revokeSession(req.auth!.selector, 'user_logout');
    res.clearCookie(COOKIE_NAME);
    res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// =============================================================================
// GET /api/auth/salt — Get encryption params for key derivation
// =============================================================================
router.get('/salt', async (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    const account = await prisma.account.findUnique({
      where: { email },
      select: {
        kekSalt: true,
        encryptedMasterKey: true,
        kekWrapIv: true,
        kekIterations: true,
        encryptionEnabled: true,
      },
    });

    if (!account) {
      // Don't reveal whether email exists
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({
      encryptionEnabled: account.encryptionEnabled,
      kekSalt: account.kekSalt ? Buffer.from(account.kekSalt).toString('base64') : null,
      encryptedMasterKey: account.encryptedMasterKey ? Buffer.from(account.encryptedMasterKey).toString('base64') : null,
      kekWrapIv: account.kekWrapIv ? Buffer.from(account.kekWrapIv).toString('base64') : null,
      kekIterations: account.kekIterations,
    });
  } catch (err) {
    console.error('Salt error:', err);
    res.status(500).json({ error: 'Failed to fetch encryption params' });
  }
});

// =============================================================================
// POST /api/auth/change-password
// =============================================================================
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { currentPassword, newPassword, newEncryptedMasterKey, newKekSalt, newKekWrapIv } = parsed.data;
    const account = await prisma.account.findUnique({ where: { id: req.auth!.accountId } });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, account.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Current password incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.account.update({
      where: { id: account.id },
      data: {
        passwordHash,
        encryptedMasterKey: new Uint8Array(Buffer.from(newEncryptedMasterKey, 'base64')),
        kekSalt: new Uint8Array(Buffer.from(newKekSalt, 'base64')),
        kekWrapIv: new Uint8Array(Buffer.from(newKekWrapIv, 'base64')),
      },
    });

    // Revoke all other sessions
    await revokeAllSessions(account.id, req.auth!.selector, 'password_change');

    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// =============================================================================
// POST /api/auth/recover — Password recovery using recovery key
// =============================================================================
router.post('/recover', async (req, res) => {
  try {
    const parsed = recoverSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, newPassword, newEncryptedMasterKey, newKekSalt, newKekWrapIv } = parsed.data;

    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await prisma.account.update({
      where: { id: account.id },
      data: {
        passwordHash,
        encryptedMasterKey: new Uint8Array(Buffer.from(newEncryptedMasterKey, 'base64')),
        kekSalt: new Uint8Array(Buffer.from(newKekSalt, 'base64')),
        kekWrapIv: new Uint8Array(Buffer.from(newKekWrapIv, 'base64')),
      },
    });

    // Revoke all existing sessions
    await revokeAllSessions(account.id, undefined, 'password_change');

    // Create new session
    const token = await createSession(account.id, account.tenantSchemaName, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({
      user: { email: account.email, username: account.username },
      encryption: {
        encryptionEnabled: account.encryptionEnabled,
        kekSalt: newKekSalt,
        encryptedMasterKey: newEncryptedMasterKey,
        kekWrapIv: newKekWrapIv,
        kekIterations: account.kekIterations,
        recoveryWrappedMK: account.recoveryWrappedMK ? Buffer.from(account.recoveryWrappedMK).toString('base64') : null,
        recoveryWrapIv: account.recoveryWrapIv ? Buffer.from(account.recoveryWrapIv).toString('base64') : null,
      },
    });
  } catch (err) {
    console.error('Recovery error:', err);
    res.status(500).json({ error: 'Recovery failed' });
  }
});

// =============================================================================
// GET /api/auth/recovery-params — Get recovery key params for password reset
// =============================================================================
router.get('/recovery-params', async (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      res.status(400).json({ error: 'Email required' });
      return;
    }

    const account = await prisma.account.findUnique({
      where: { email },
      select: {
        recoveryWrappedMK: true,
        recoveryWrapIv: true,
        encryptionEnabled: true,
      },
    });

    if (!account || !account.encryptionEnabled) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json({
      recoveryWrappedMK: account.recoveryWrappedMK ? Buffer.from(account.recoveryWrappedMK).toString('base64') : null,
      recoveryWrapIv: account.recoveryWrapIv ? Buffer.from(account.recoveryWrapIv).toString('base64') : null,
    });
  } catch (err) {
    console.error('Recovery params error:', err);
    res.status(500).json({ error: 'Failed to fetch recovery params' });
  }
});

export default router;
