import { prisma } from './prisma.js';
import crypto from 'crypto';

// =============================================================================
// Shares Table (public schema)
// =============================================================================

export interface Share {
  id: number;
  token: string;
  accountId: number;
  contentEncrypted: Buffer;
  contentIv: Buffer;
  createdAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

/** Ensure the shares table exists in the public schema */
export async function initSharesTable(): Promise<void> {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS public.shares (
      id             SERIAL PRIMARY KEY,
      token          VARCHAR(64) UNIQUE NOT NULL,
      account_id     INT NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
      content_encrypted BYTEA NOT NULL,
      content_iv        BYTEA NOT NULL,
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      expires_at     TIMESTAMPTZ,
      is_active      BOOLEAN DEFAULT TRUE
    )
  `;
}

/** Create a new share record, returns the token */
export async function createShare(data: {
  accountId: number;
  contentEncrypted: Buffer;
  contentIv: Buffer;
  expiresAt?: Date | null;
}): Promise<Share> {
  const token = crypto.randomBytes(24).toString('base64url');

  const rows = await prisma.$queryRaw<Share[]>`
    INSERT INTO public.shares
      (token, account_id, content_encrypted, content_iv, expires_at)
    VALUES
      (${token}, ${data.accountId}, ${data.contentEncrypted}, ${data.contentIv}, ${data.expiresAt ?? null})
    RETURNING
      id, token, account_id AS "accountId",
      content_encrypted AS "contentEncrypted",
      content_iv AS "contentIv",
      created_at AS "createdAt",
      expires_at AS "expiresAt",
      is_active AS "isActive"
  `;

  return rows[0];
}

/** Fetch a share by token (public — no auth required) */
export async function getShareByToken(token: string): Promise<Share | null> {
  const rows = await prisma.$queryRaw<Share[]>`
    SELECT
      id, token, account_id AS "accountId",
      content_encrypted AS "contentEncrypted",
      content_iv AS "contentIv",
      created_at AS "createdAt",
      expires_at AS "expiresAt",
      is_active AS "isActive"
    FROM public.shares
    WHERE token = ${token}
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  `;
  return rows[0] ?? null;
}

/** Revoke a share — only the owner can do this */
export async function revokeShare(token: string, accountId: number): Promise<boolean> {
  const result = await prisma.$executeRaw`
    UPDATE public.shares
    SET is_active = FALSE
    WHERE token = ${token} AND account_id = ${accountId}
  `;
  return (result as unknown as number) > 0;
}

/** List all active shares for an account */
export async function getSharesByAccount(accountId: number): Promise<Share[]> {
  return prisma.$queryRaw<Share[]>`
    SELECT
      id, token, account_id AS "accountId",
      content_encrypted AS "contentEncrypted",
      content_iv AS "contentIv",
      created_at AS "createdAt",
      expires_at AS "expiresAt",
      is_active AS "isActive"
    FROM public.shares
    WHERE account_id = ${accountId} AND is_active = TRUE
    ORDER BY created_at DESC
  `;
}
