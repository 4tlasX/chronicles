import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../db/prisma.js';
import { registerTenant } from '../db/schemaManager.js';
import { createSession, revokeSession, revokeAllSessions, authMiddleware } from '../middleware/auth.js';
import { authLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, changePasswordSchema, recoverSchema, emailSchema } from '@chronicles/shared';
import { logSecurityEvent } from '../utils/securityLogger.js';

const router = Router();

const BCRYPT_ROUNDS = 12;
const IS_PRODUCTION = process.env.NODE_ENV !== 'development';
const COOKIE_NAME = IS_PRODUCTION ? '__Host-chronicle_session' : 'chronicle_session';
const SESSION_MAX_AGE_DAYS = 7;
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'strict' as const,
  maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
  path: '/',
};

/** Enforce a constant-time floor on endpoint response time to prevent timing-based enumeration */
async function constantTimeDelay(startTime: number, minMs = 200): Promise<void> {
  const elapsed = Date.now() - startTime;
  if (elapsed < minMs) {
    await new Promise(resolve => setTimeout(resolve, minMs - elapsed));
  }
}

// =============================================================================
// POST /api/auth/register
// =============================================================================
router.post('/register', authLimiter, async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Password does not meet requirements' });
      return;
    }

    const { email: rawEmail, username, password, encryptedMasterKey, kekSalt, kekWrapIv, recoveryWrappedMK, recoveryWrapIv, recoveryKeyHash, recoveryKeySalt } = parsed.data;
    const email = rawEmail.toLowerCase();

    // Check for existing account
    const existing = await prisma.account.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      logSecurityEvent('register_duplicate', { ip: req.ip });
      // Constant-time delay to prevent timing-based enumeration
      await bcrypt.hash('dummy', BCRYPT_ROUNDS);
      res.status(409).json({ error: 'Registration could not be completed. Please try different credentials.' });
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
      recoveryKeySalt,
    });

    // Create session
    const token = await createSession(account.id, schemaName, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    logSecurityEvent('register_success', { accountId: account.id, ip: req.ip });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({
      user: { email: account.email, username: account.username },
    });
  } catch (err) {
    console.error('Registration error:', err instanceof Error ? err.message : 'Unknown error');
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
    console.error('Me error:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// =============================================================================
// POST /api/auth/login
// =============================================================================
router.post('/login', authLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const { email, password } = parsed.data;

    const normalizedEmail = email.toLowerCase();
    const account = await prisma.account.findUnique({ where: { email: normalizedEmail } });
    if (!account) {
      logSecurityEvent('login_failed_no_account', { ip: req.ip });
      // Constant-time delay to prevent timing-based email enumeration
      await bcrypt.hash('dummy', BCRYPT_ROUNDS);
      await constantTimeDelay(startTime);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, account.passwordHash);
    if (!valid) {
      logSecurityEvent('login_failed_bad_password', { accountId: account.id, ip: req.ip });
      await constantTimeDelay(startTime);
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = await createSession(account.id, account.tenantSchemaName, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    logSecurityEvent('login_success', { accountId: account.id, ip: req.ip });
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
    console.error('Login error:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ error: 'Login failed' });
  }
});

// =============================================================================
// POST /api/auth/logout
// =============================================================================
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await revokeSession(req.auth!.selector, 'user_logout');
    logSecurityEvent('logout', { accountId: req.auth!.accountId, ip: req.ip });
    res.clearCookie(COOKIE_NAME, { path: '/', secure: IS_PRODUCTION, sameSite: 'strict' as const });
    res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ error: 'Logout failed' });
  }
});

// =============================================================================
// GET /api/auth/salt — Get encryption params for key derivation
// =============================================================================
router.get('/salt', authLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const rawEmail = req.query.email as string;
    if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.length > 254) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    const emailParsed = emailSchema.safeParse(rawEmail);
    if (!emailParsed.success) {
      res.status(400).json({ error: 'Invalid email' });
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
      await constantTimeDelay(startTime);
      res.json({
        encryptionEnabled: true,
        kekSalt: fakeSalt,
        encryptedMasterKey: fakeWrappedKey,
        kekWrapIv: fakeIv,
        kekIterations: 600000,
      });
      return;
    }

    await constantTimeDelay(startTime);
    res.json({
      encryptionEnabled: account.encryptionEnabled,
      kekSalt: account.kekSalt ? Buffer.from(account.kekSalt).toString('base64') : null,
      encryptedMasterKey: account.encryptedMasterKey ? Buffer.from(account.encryptedMasterKey).toString('base64') : null,
      kekWrapIv: account.kekWrapIv ? Buffer.from(account.kekWrapIv).toString('base64') : null,
      kekIterations: account.kekIterations,
    });
  } catch (err) {
    console.error('Salt error:', err instanceof Error ? err.message : 'Unknown error');
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
      res.status(400).json({ error: 'Password does not meet requirements' });
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
      logSecurityEvent('password_change_failed', { accountId: account.id, ip: req.ip });
      res.status(401).json({ error: 'Current password incorrect' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Atomic: update password + revoke ALL sessions (including current) in a single transaction
    await prisma.$transaction([
      prisma.account.update({
        where: { id: account.id },
        data: {
          passwordHash,
          encryptedMasterKey: new Uint8Array(Buffer.from(newEncryptedMasterKey, 'base64')),
          kekSalt: new Uint8Array(Buffer.from(newKekSalt, 'base64')),
          kekWrapIv: new Uint8Array(Buffer.from(newKekWrapIv, 'base64')),
        },
      }),
      prisma.session.updateMany({
        where: {
          accountId: account.id,
          revokedAt: null,
        },
        data: { revokedAt: new Date(), revokedReason: 'password_change' },
      }),
    ]);

    // Create a fresh session after revoking all old ones (prevents race condition)
    const token = await createSession(account.id, account.tenantSchemaName, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    logSecurityEvent('password_change', { accountId: account.id, ip: req.ip });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ error: 'Password change failed' });
  }
});

// =============================================================================
// POST /api/auth/recover — Password recovery using recovery key
// =============================================================================
router.post('/recover', strictLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const parsed = recoverSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Password does not meet requirements' });
      return;
    }

    const { email: rawEmail, recoveryKey, newPassword, newEncryptedMasterKey, newKekSalt, newKekWrapIv } = parsed.data;
    const email = rawEmail.toLowerCase();

    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
      // Constant-time delay to prevent timing-based enumeration
      await bcrypt.hash('dummy', BCRYPT_ROUNDS);
      await constantTimeDelay(startTime);
      res.status(401).json({ error: 'Recovery failed' });
      return;
    }

    if (!account.recoveryKeyHash || !account.recoveryKeySalt) {
      // Legacy accounts without recoveryKeyHash or accounts that already used recovery
      logSecurityEvent('recovery_failed', { accountId: account.id, ip: req.ip, details: { reason: 'no_recovery_hash' } });
      await constantTimeDelay(startTime);
      res.status(401).json({ error: 'Recovery failed' });
      return;
    }

    // Verify recovery key using PBKDF2 (salted + iterated)
    const recoveryKeySalt = Buffer.from(account.recoveryKeySalt, 'hex');
    const providedHash = crypto.pbkdf2Sync(recoveryKey, recoveryKeySalt, 600000, 32, 'sha256').toString('hex');

    if (!crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(account.recoveryKeyHash))) {
      logSecurityEvent('recovery_failed', { accountId: account.id, ip: req.ip });
      await constantTimeDelay(startTime);
      res.status(401).json({ error: 'Recovery failed' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Interactive transaction with row-level locking to prevent concurrent recovery race condition
    const txResult = await prisma.$transaction(async (tx) => {
      // Lock the account row to prevent concurrent recovery attempts
      const locked = await tx.$queryRawUnsafe<{ id: number; recovery_key_hash: string | null }[]>(
        'SELECT id, recovery_key_hash FROM "Account" WHERE id = $1 FOR UPDATE',
        account.id
      );

      // Re-check recovery key hasn't been used by a concurrent request
      if (!locked[0]?.recovery_key_hash) {
        return null; // Recovery already consumed by another request
      }

      await tx.account.update({
        where: { id: account.id },
        data: {
          passwordHash,
          encryptedMasterKey: new Uint8Array(Buffer.from(newEncryptedMasterKey, 'base64')),
          kekSalt: new Uint8Array(Buffer.from(newKekSalt, 'base64')),
          kekWrapIv: new Uint8Array(Buffer.from(newKekWrapIv, 'base64')),
          recoveryKeyHash: null,
          recoveryKeySalt: null,
          recoveryWrappedMK: null,
          recoveryWrapIv: null,
          recoveryKeyUsedAt: new Date(),
        },
      });

      await tx.session.updateMany({
        where: { accountId: account.id, revokedAt: null },
        data: { revokedAt: new Date(), revokedReason: 'recovery' },
      });

      return { success: true };
    });

    if (!txResult) {
      logSecurityEvent('recovery_failed', { accountId: account.id, ip: req.ip, details: { reason: 'concurrent_recovery' } });
      await constantTimeDelay(startTime);
      res.status(401).json({ error: 'Recovery failed' });
      return;
    }

    logSecurityEvent('recovery_success', { accountId: account.id, ip: req.ip });

    // Create new session after revoking all old ones
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
    console.error('Recovery error:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ error: 'Recovery failed' });
  }
});

// =============================================================================
// GET /api/auth/recovery-params — Get recovery key params for password reset
// =============================================================================
router.get('/recovery-params', authLimiter, async (req, res) => {
  const startTime = Date.now();
  try {
    const rawEmail = req.query.email as string;
    if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.length > 254) {
      res.status(400).json({ error: 'Email required' });
      return;
    }
    const emailParsed = emailSchema.safeParse(rawEmail);
    if (!emailParsed.success) {
      res.status(400).json({ error: 'Invalid email' });
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
      await constantTimeDelay(startTime);
      res.json({
        recoveryWrappedMK: fakeWrappedKey,
        recoveryWrapIv: fakeIv,
      });
      return;
    }

    await constantTimeDelay(startTime);
    res.json({
      recoveryWrappedMK: account.recoveryWrappedMK ? Buffer.from(account.recoveryWrappedMK).toString('base64') : null,
      recoveryWrapIv: account.recoveryWrapIv ? Buffer.from(account.recoveryWrapIv).toString('base64') : null,
    });
  } catch (err) {
    console.error('Recovery params error:', err instanceof Error ? err.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch recovery params' });
  }
});

export default router;
