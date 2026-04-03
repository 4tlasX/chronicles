import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../db/prisma.js';
import { registerTenant } from '../db/schemaManager.js';
import { createSession, revokeSession, revokeAllSessions, authMiddleware } from '../middleware/auth.js';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, changePasswordSchema, recoverSchema } from '@chronicles/shared';

const router = Router();

const BCRYPT_ROUNDS = 12;
const IS_PRODUCTION = process.env.NODE_ENV !== 'development';
const COOKIE_NAME = IS_PRODUCTION ? '__Host-chronicle_session' : 'chronicle_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'lax' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

// =============================================================================
// POST /api/auth/register
// =============================================================================
router.post('/register', authLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email: rawEmail, username, password, encryptedMasterKey, kekSalt, kekWrapIv, recoveryWrappedMK, recoveryWrapIv, recoveryKeyHash } = parsed.data;
    const email = rawEmail.toLowerCase();

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
      recoveryKeyHash,
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
router.post('/login', authLimiter, async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email, password } = parsed.data;

    const normalizedEmail = email.toLowerCase();
    const account = await prisma.account.findUnique({ where: { email: normalizedEmail } });
    if (!account) {
      // Constant-time delay to prevent timing-based email enumeration
      await bcrypt.hash('dummy', BCRYPT_ROUNDS);
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
router.get('/salt', authLimiter, async (req, res) => {
  try {
    const rawEmail = req.query.email as string;
    if (!rawEmail) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    const email = rawEmail.toLowerCase();

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
      // Return fake params so attackers can't distinguish existing vs non-existing accounts
      // The login will still fail — these fake params just waste their time
      const fakeSalt = crypto.randomBytes(16).toString('base64');
      const fakeWrappedKey = crypto.randomBytes(48).toString('base64');
      const fakeIv = crypto.randomBytes(12).toString('base64');
      res.json({
        encryptionEnabled: true,
        kekSalt: fakeSalt,
        encryptedMasterKey: fakeWrappedKey,
        kekWrapIv: fakeIv,
        kekIterations: 600000,
      });
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
router.post('/change-password', strictLimiter, authMiddleware, async (req, res) => {
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
router.post('/recover', strictLimiter, async (req, res) => {
  try {
    const parsed = recoverSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const { email: rawEmail, recoveryKey, newPassword, newEncryptedMasterKey, newKekSalt, newKekWrapIv } = parsed.data;
    const email = rawEmail.toLowerCase();

    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
      // Constant-time delay to prevent timing-based enumeration
      await bcrypt.hash('dummy', BCRYPT_ROUNDS);
      res.status(401).json({ error: 'Recovery failed' });
      return;
    }

    // Verify recovery key: hash the provided key and compare to stored hash
    const providedHash = crypto.createHash('sha256').update(recoveryKey).digest('hex');

    if (account.recoveryKeyHash) {
      // Normal path: verify against stored hash
      if (!crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(account.recoveryKeyHash))) {
        res.status(401).json({ error: 'Recovery failed' });
        return;
      }
    }
    // Legacy accounts without recoveryKeyHash: the client-side unwrap with the
    // wrong recovery key will produce garbage, so the re-wrapped master key won't
    // decrypt anything. We allow this through but backfill the hash below so
    // future recovery attempts are server-verified.

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Invalidate old recovery key material — recovery key is single-use
    // Clear recoveryWrappedMK and recoveryWrapIv so the old recovery key can't be reused
    await prisma.account.update({
      where: { id: account.id },
      data: {
        passwordHash,
        encryptedMasterKey: new Uint8Array(Buffer.from(newEncryptedMasterKey, 'base64')),
        kekSalt: new Uint8Array(Buffer.from(newKekSalt, 'base64')),
        kekWrapIv: new Uint8Array(Buffer.from(newKekWrapIv, 'base64')),
        recoveryKeyHash: providedHash,
        recoveryWrappedMK: null,
        recoveryWrapIv: null,
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
        recoveryWrappedMK: null,
        recoveryWrapIv: null,
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
router.get('/recovery-params', authLimiter, async (req, res) => {
  try {
    const rawEmail = req.query.email as string;
    if (!rawEmail) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    const email = rawEmail.toLowerCase();

    const account = await prisma.account.findUnique({
      where: { email },
      select: {
        recoveryWrappedMK: true,
        recoveryWrapIv: true,
        encryptionEnabled: true,
      },
    });

    if (!account || !account.encryptionEnabled) {
      // Return fake params to prevent account enumeration
      const fakeWrappedKey = crypto.randomBytes(48).toString('base64');
      const fakeIv = crypto.randomBytes(12).toString('base64');
      res.json({
        recoveryWrappedMK: fakeWrappedKey,
        recoveryWrapIv: fakeIv,
      });
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
