/**
 * Low-level Web Crypto API wrappers
 * Non-extractable keys where possible for stronger zero-knowledge
 */
import { AES_ALGORITHM, AES_KEY_LENGTH, IV_LENGTH, PBKDF2_ALGORITHM, PBKDF2_HASH, PBKDF2_SALT_LENGTH, RECOVERY_KEY_LENGTH, } from './constants.js';
import { generateRandomBytes, base64ToUint8Array, uint8ArrayToBase64, stringToArrayBuffer, arrayBufferToString, } from './encoding.js';
/**
 * Generate a new AES-256 master key
 * extractable=true during generation because we need to wrap it with KEK and recovery key.
 * After wrapping, callers should convert to non-extractable via toNonExtractable().
 */
export async function generateMasterKey() {
    return crypto.subtle.generateKey({ name: AES_ALGORITHM, length: AES_KEY_LENGTH }, true, // extractable — required by Web Crypto for wrapKey('raw', ...)
    ['encrypt', 'decrypt']);
}
export function generateRecoveryKey() {
    return generateRandomBytes(RECOVERY_KEY_LENGTH);
}
export function generateSalt() {
    return generateRandomBytes(PBKDF2_SALT_LENGTH);
}
export function generateIv() {
    return generateRandomBytes(IV_LENGTH);
}
/**
 * Derive a Key Encryption Key (KEK) from password using PBKDF2
 * Non-extractable — KEK cannot be exported from the browser's crypto subsystem
 */
export async function deriveKEK(password, salt, iterations) {
    const passwordKey = await crypto.subtle.importKey('raw', stringToArrayBuffer(password), PBKDF2_ALGORITHM, false, ['deriveKey']);
    return crypto.subtle.deriveKey({
        name: PBKDF2_ALGORITHM,
        salt: salt.buffer,
        iterations,
        hash: PBKDF2_HASH,
    }, passwordKey, { name: AES_ALGORITHM, length: AES_KEY_LENGTH }, false, // non-extractable
    ['wrapKey', 'unwrapKey']);
}
/**
 * Import a raw key (recovery key) as CryptoKey for wrapping
 */
export async function importRawKey(keyBytes) {
    return crypto.subtle.importKey('raw', keyBytes.buffer, { name: AES_ALGORITHM, length: AES_KEY_LENGTH }, false, ['wrapKey', 'unwrapKey']);
}
/** Encode a wrap purpose string as AAD bytes for AES-GCM */
function purposeToAAD(purpose) {
    return new TextEncoder().encode(purpose).buffer;
}
/**
 * Wrap (encrypt) the master key with a wrapping key (KEK or recovery key).
 * The purpose parameter is authenticated as AAD — prevents cross-purpose key substitution.
 */
export async function wrapKey(masterKey, wrappingKey, iv, purpose = 'kek-wrap') {
    return crypto.subtle.wrapKey('raw', masterKey, wrappingKey, {
        name: AES_ALGORITHM,
        iv: iv.buffer,
        additionalData: purposeToAAD(purpose),
    });
}
/**
 * Unwrap (decrypt) the master key with a wrapping key.
 * By default returns a non-extractable key for encrypt/decrypt operations.
 * Pass extractable=true when the key needs to be re-wrapped (e.g., password change, recovery).
 * Tries with AAD first; falls back to no-AAD for keys wrapped before AAD was introduced.
 */
export async function unwrapKey(wrappedKey, wrappingKey, iv, extractable = false, purpose = 'kek-wrap') {
    try {
        return await crypto.subtle.unwrapKey('raw', wrappedKey, wrappingKey, { name: AES_ALGORITHM, iv: iv.buffer, additionalData: purposeToAAD(purpose) }, { name: AES_ALGORITHM, length: AES_KEY_LENGTH }, extractable, ['encrypt', 'decrypt']);
    }
    catch {
        // Legacy fallback: key was wrapped without AAD before security hardening
        return crypto.subtle.unwrapKey('raw', wrappedKey, wrappingKey, { name: AES_ALGORITHM, iv: iv.buffer }, { name: AES_ALGORITHM, length: AES_KEY_LENGTH }, extractable, ['encrypt', 'decrypt']);
    }
}
/**
 * Convert an extractable CryptoKey to non-extractable.
 * Used after wrapping operations to ensure the in-memory key cannot be exported.
 */
export async function toNonExtractable(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    const rawArray = new Uint8Array(raw);
    try {
        const nonExtractable = await crypto.subtle.importKey('raw', raw, { name: AES_ALGORITHM, length: AES_KEY_LENGTH }, false, ['encrypt', 'decrypt']);
        return nonExtractable;
    }
    finally {
        // Multi-pass zeroing of exported key material
        rawArray.fill(0);
        crypto.getRandomValues(rawArray);
        rawArray.fill(0);
    }
}
/**
 * Encrypt plaintext with AES-GCM
 * Returns { ciphertext, iv } both as Base64 strings
 */
export async function encrypt(masterKey, plaintext) {
    const iv = generateIv();
    const ciphertextBuffer = await crypto.subtle.encrypt({ name: AES_ALGORITHM, iv: iv.buffer }, masterKey, stringToArrayBuffer(plaintext));
    return {
        ciphertext: uint8ArrayToBase64(new Uint8Array(ciphertextBuffer)),
        iv: uint8ArrayToBase64(iv),
    };
}
/**
 * Decrypt ciphertext with AES-GCM
 */
export async function decrypt(masterKey, ciphertext, iv) {
    const ciphertextBuffer = base64ToUint8Array(ciphertext);
    const ivBuffer = base64ToUint8Array(iv);
    const plaintextBuffer = await crypto.subtle.decrypt({ name: AES_ALGORITHM, iv: ivBuffer.buffer }, masterKey, ciphertextBuffer.buffer);
    return arrayBufferToString(plaintextBuffer);
}
