/**
 * Security audit unit tests — client-side
 * Tests for encryption context, recovery key handling, and client security fixes
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const readSrc = (relativePath: string) =>
  fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

// ============================================================================
// 1. EncryptionContext — inactivity timeout
// ============================================================================
describe('EncryptionContext inactivity timeout', () => {
  it('has inactivity timeout implementation', () => {
    const content = readSrc('contexts/EncryptionContext.tsx');
    expect(content).toContain('INACTIVITY_TIMEOUT_MS');
    expect(content).toContain('15 * 60 * 1000');
    expect(content).toContain('mousedown');
    expect(content).toContain('keydown');
    expect(content).toContain('scroll');
    expect(content).toContain('touchstart');
  });

  it('clears timeout on unmount', () => {
    const content = readSrc('contexts/EncryptionContext.tsx');
    expect(content).toContain('clearTimeout(inactivityTimer)');
    expect(content).toContain('removeEventListener');
  });
});

// ============================================================================
// 2. EncryptionContext — recovery flow converts to non-extractable
// ============================================================================
describe('EncryptionContext recovery key lifecycle', () => {
  it('rewrapMasterKey converts to non-extractable after recovery rewrap', () => {
    const content = readSrc('contexts/EncryptionContext.tsx');
    // In recovery path, should call toNonExtractable AFTER rewrap
    expect(content).toContain('await toNonExtractable(extractableKey)');
  });

  it('clear master key on unmount', () => {
    const content = readSrc('contexts/EncryptionContext.tsx');
    expect(content).toContain('masterKeyRef.current = null');
  });

  it('visibility change locks the context', () => {
    const content = readSrc('contexts/EncryptionContext.tsx');
    expect(content).toContain('visibilitychange');
    expect(content).toContain('document.hidden');
    expect(content).toContain('lock()');
  });
});

// ============================================================================
// 3. RegisterView — PBKDF2 recovery key hashing
// ============================================================================
describe('RegisterView PBKDF2 recovery key hashing', () => {
  it('uses PBKDF2 instead of SHA-256 for recovery key hash', () => {
    const content = readSrc('views/RegisterView.tsx');
    expect(content).toContain('PBKDF2');
    expect(content).toContain('deriveBits');
    expect(content).toContain('iterations: 100000');
    // Should NOT use SHA-256 digest directly
    expect(content).not.toContain("crypto.subtle.digest(\n      'SHA-256'");
  });

  it('generates a random salt for recovery key hashing', () => {
    const content = readSrc('views/RegisterView.tsx');
    expect(content).toContain('recoveryKeySaltBytes');
    expect(content).toContain('crypto.getRandomValues');
    expect(content).toContain('new Uint8Array(16)');
  });

  it('sends recoveryKeySalt to server on register', () => {
    const content = readSrc('views/RegisterView.tsx');
    expect(content).toContain('recoveryKeySalt');
  });

  it('clears recovery key from state on confirm', () => {
    const content = readSrc('views/RegisterView.tsx');
    expect(content).toContain('setRecoveryKey(null)');
    expect(content).toContain('handleConfirm');
  });
});

// ============================================================================
// 4. RecoveryKeyDisplay — clipboard cleanup on unmount
// ============================================================================
describe('RecoveryKeyDisplay clipboard security', () => {
  it('clears clipboard on unmount', () => {
    const content = readSrc('components/molecules/RecoveryKeyDisplay.tsx');
    expect(content).toContain('useEffect');
    expect(content).toContain("navigator.clipboard.writeText('')");
    // Should have cleanup in useEffect return
    expect(content).toContain('return () =>');
  });

  it('auto-clears clipboard after 30 seconds on copy', () => {
    const content = readSrc('components/molecules/RecoveryKeyDisplay.tsx');
    expect(content).toContain('30000');
    expect(content).toContain("navigator.clipboard.writeText('')");
  });
});

// ============================================================================
// 5. API client — CSRF header always sent
// ============================================================================
describe('API client CSRF protection', () => {
  it('always includes X-Requested-With header', () => {
    const content = readSrc('services/api.ts');
    expect(content).toContain("'X-Requested-With': 'XMLHttpRequest'");
  });

  it('always sends credentials', () => {
    const content = readSrc('services/api.ts');
    expect(content).toContain("credentials: 'include'");
  });

  it('register payload includes recoveryKeySalt', () => {
    const content = readSrc('services/api.ts');
    expect(content).toContain('recoveryKeySalt: string');
  });
});

// ============================================================================
// 6. AuthContext — register type includes recoveryKeySalt
// ============================================================================
describe('AuthContext register type', () => {
  it('register type includes recoveryKeySalt', () => {
    const content = readSrc('contexts/AuthContext.tsx');
    expect(content).toContain('recoveryKeySalt: string');
  });
});

// ============================================================================
// 7. EncryptionContext — PBKDF2 iteration downgrade protection
// ============================================================================
describe('PBKDF2 downgrade protection', () => {
  it('rejects iterations below PBKDF2_ITERATIONS minimum', () => {
    const content = readSrc('contexts/EncryptionContext.tsx');
    expect(content).toContain('kekIterations < PBKDF2_ITERATIONS');
    expect(content).toContain('below minimum');
  });
});
