"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSharesTable = initSharesTable;
exports.createShare = createShare;
exports.getShareByToken = getShareByToken;
exports.revokeShare = revokeShare;
exports.getSharesByAccount = getSharesByAccount;
const prisma_js_1 = require("./prisma.js");
const crypto_1 = __importDefault(require("crypto"));
/** Ensure the shares table exists in the public schema */
async function initSharesTable() {
    await prisma_js_1.prisma.$executeRaw `
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
async function createShare(data) {
    const token = crypto_1.default.randomBytes(24).toString('base64url');
    const rows = await prisma_js_1.prisma.$queryRaw `
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
async function getShareByToken(token) {
    const rows = await prisma_js_1.prisma.$queryRaw `
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
async function revokeShare(token, accountId) {
    const result = await prisma_js_1.prisma.$executeRaw `
    UPDATE public.shares
    SET is_active = FALSE
    WHERE token = ${token} AND account_id = ${accountId}
  `;
    return result > 0;
}
/** List all active shares for an account */
async function getSharesByAccount(accountId) {
    return prisma_js_1.prisma.$queryRaw `
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
