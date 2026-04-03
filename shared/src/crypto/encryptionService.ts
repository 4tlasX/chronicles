/**
 * EncryptionService - Stateless service for all encryption operations
 *
 * All methods are pure functions — no internal state.
 * The client's EncryptionContext manages the master key state.
 */

import { PBKDF2_ITERATIONS } from './constants.js';
import {
  generateMasterKey,
  generateRecoveryKey,
  generateSalt,
  generateIv,
  deriveKEK,
  importRawKey,
  wrapKey,
  unwrapKey,
  encrypt,
  decrypt,
} from './primitives.js';
import { uint8ArrayToBase64, base64ToUint8Array } from './encoding.js';
import type {
  SetupEncryptionResult,
  RewrapResult,
  EncryptedPostData,
  EncryptedPost,
  DecryptedPost,
} from './types.js';

class EncryptionService {
  /**
   * Set up encryption for a new user (called during registration)
   */
  async setupEncryption(password: string): Promise<SetupEncryptionResult> {
    const masterKey = await generateMasterKey();

    // Wrap with password-derived KEK
    const salt = generateSalt();
    const kek = await deriveKEK(password, salt, PBKDF2_ITERATIONS);
    const wrapIv = generateIv();
    const wrappedMKBuffer = await wrapKey(masterKey, kek, wrapIv);

    // Wrap with recovery key
    const recoveryKeyBytes = generateRecoveryKey();
    const recoveryKeyObj = await importRawKey(recoveryKeyBytes);
    const recoveryWrapIv = generateIv();
    const recoveryWrappedMKBuffer = await wrapKey(masterKey, recoveryKeyObj, recoveryWrapIv);

    return {
      salt: uint8ArrayToBase64(salt),
      wrappedMK: uint8ArrayToBase64(new Uint8Array(wrappedMKBuffer)),
      wrapIv: uint8ArrayToBase64(wrapIv),
      recoveryKey: uint8ArrayToBase64(recoveryKeyBytes),
      recoveryWrappedMK: uint8ArrayToBase64(new Uint8Array(recoveryWrappedMKBuffer)),
      recoveryWrapIv: uint8ArrayToBase64(recoveryWrapIv),
      masterKey,
    };
  }

  /**
   * Unwrap master key using password (called during login)
   */
  async unwrapMasterKey(
    password: string,
    saltBase64: string,
    wrappedMKBase64: string,
    wrapIvBase64: string,
    iterations: number
  ): Promise<CryptoKey> {
    const salt = base64ToUint8Array(saltBase64);
    const wrappedMK = base64ToUint8Array(wrappedMKBase64);
    const wrapIv = base64ToUint8Array(wrapIvBase64);

    const kek = await deriveKEK(password, salt, iterations);
    return unwrapKey(wrappedMK.buffer as ArrayBuffer, kek, wrapIv);
  }

  /**
   * Unwrap master key using recovery key (password reset flow)
   */
  async unwrapWithRecoveryKey(
    recoveryKeyBase64: string,
    recoveryWrappedMKBase64: string,
    recoveryWrapIvBase64: string
  ): Promise<CryptoKey> {
    const recoveryKeyBytes = base64ToUint8Array(recoveryKeyBase64);
    const recoveryWrappedMK = base64ToUint8Array(recoveryWrappedMKBase64);
    const recoveryWrapIv = base64ToUint8Array(recoveryWrapIvBase64);

    const recoveryKeyObj = await importRawKey(recoveryKeyBytes);
    return unwrapKey(recoveryWrappedMK.buffer as ArrayBuffer, recoveryKeyObj, recoveryWrapIv);
  }

  /**
   * Re-wrap master key with a new password (after recovery)
   */
  async rewrapMasterKey(
    masterKey: CryptoKey,
    newPassword: string
  ): Promise<RewrapResult> {
    const salt = generateSalt();
    const kek = await deriveKEK(newPassword, salt, PBKDF2_ITERATIONS);
    const wrapIv = generateIv();
    const wrappedMKBuffer = await wrapKey(masterKey, kek, wrapIv);

    return {
      salt: uint8ArrayToBase64(salt),
      wrappedMK: uint8ArrayToBase64(new Uint8Array(wrappedMKBuffer)),
      wrapIv: uint8ArrayToBase64(wrapIv),
    };
  }

  /**
   * Encrypt post content and metadata
   */
  async encryptPost(
    masterKey: CryptoKey,
    content: string,
    metadata: Record<string, unknown>
  ): Promise<EncryptedPostData> {
    const [contentResult, metadataResult] = await Promise.all([
      encrypt(masterKey, content),
      encrypt(masterKey, JSON.stringify(metadata)),
    ]);

    return {
      contentEncrypted: contentResult.ciphertext,
      contentIv: contentResult.iv,
      metadataEncrypted: metadataResult.ciphertext,
      metadataIv: metadataResult.iv,
    };
  }

  /**
   * Decrypt a single post. Passes through plaintext posts unchanged.
   */
  async decryptPost(
    masterKey: CryptoKey,
    post: EncryptedPost
  ): Promise<DecryptedPost> {
    if (!post.isEncrypted) {
      return {
        id: post.id,
        content: post.content || '',
        metadata: post.metadata || {},
        isEncrypted: false,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    }

    if (!post.contentEncrypted || !post.contentIv || !post.metadataEncrypted || !post.metadataIv) {
      throw new Error('Encrypted post missing required fields');
    }

    const [content, metadataStr] = await Promise.all([
      decrypt(masterKey, post.contentEncrypted, post.contentIv),
      decrypt(masterKey, post.metadataEncrypted, post.metadataIv),
    ]);

    let metadata: Record<string, unknown>;
    try {
      const parsed = JSON.parse(metadataStr);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        metadata = {};
      } else {
        metadata = parsed;
      }
    } catch {
      metadata = {};
    }

    return {
      id: post.id,
      content,
      metadata,
      isEncrypted: true,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  /**
   * Decrypt multiple posts
   */
  async decryptPosts(
    masterKey: CryptoKey,
    posts: EncryptedPost[]
  ): Promise<DecryptedPost[]> {
    return Promise.all(posts.map((post) => this.decryptPost(masterKey, post)));
  }
}

export const encryptionService = new EncryptionService();
