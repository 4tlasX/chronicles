import { describe, it, expect } from 'vitest';
import { generateMasterKey, toNonExtractable, encryptBytes, decryptBytes, generateIv } from '../crypto/primitives.js';
import { uint8ArrayToBase64 } from '../crypto/encoding.js';
import { encryptionService } from '../crypto/encryptionService.js';

async function makeKey(): Promise<CryptoKey> {
  return toNonExtractable(await generateMasterKey());
}

function sampleBytes(length = 4096): ArrayBuffer {
  const data = new Uint8Array(length);
  for (let i = 0; i < length; i++) data[i] = (i * 31 + 7) % 256;
  return data.buffer;
}

describe('binary crypto primitives (encryptBytes/decryptBytes)', () => {
  it('round-trips binary data', async () => {
    const key = await makeKey();
    const original = sampleBytes();

    const { ciphertext, iv } = await encryptBytes(key, original);
    expect(ciphertext.byteLength).toBeGreaterThan(original.byteLength); // GCM tag added
    expect(new Uint8Array(ciphertext)).not.toEqual(new Uint8Array(original));

    const decrypted = await decryptBytes(key, ciphertext, iv);
    expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(original));
  });

  it('works with the non-extractable master key directly', async () => {
    const key = await makeKey();
    expect(key.extractable).toBe(false);
    const { ciphertext, iv } = await encryptBytes(key, sampleBytes(64));
    const decrypted = await decryptBytes(key, ciphertext, iv);
    expect(decrypted.byteLength).toBe(64);
  });

  it('generates a fresh IV per encryption', async () => {
    const key = await makeKey();
    const data = sampleBytes(128);
    const a = await encryptBytes(key, data);
    const b = await encryptBytes(key, data);
    expect(a.iv).not.toBe(b.iv);
    expect(new Uint8Array(a.ciphertext)).not.toEqual(new Uint8Array(b.ciphertext));
  });

  it('fails with the wrong IV', async () => {
    const key = await makeKey();
    const { ciphertext } = await encryptBytes(key, sampleBytes());
    const wrongIv = uint8ArrayToBase64(generateIv());
    await expect(decryptBytes(key, ciphertext, wrongIv)).rejects.toThrow();
  });

  it('fails with tampered ciphertext', async () => {
    const key = await makeKey();
    const { ciphertext, iv } = await encryptBytes(key, sampleBytes());
    const tampered = new Uint8Array(ciphertext);
    tampered[0] ^= 0xff;
    await expect(decryptBytes(key, tampered.buffer, iv)).rejects.toThrow();
  });

  it('fails with a different key', async () => {
    const keyA = await makeKey();
    const keyB = await makeKey();
    const { ciphertext, iv } = await encryptBytes(keyA, sampleBytes());
    await expect(decryptBytes(keyB, ciphertext, iv)).rejects.toThrow();
  });
});

describe('encryptionService.encryptFile/decryptFile', () => {
  it('round-trips through the service pass-throughs', async () => {
    const key = await makeKey();
    const original = sampleBytes(1000);
    const { ciphertext, iv } = await encryptionService.encryptFile(key, original);
    const decrypted = await encryptionService.decryptFile(key, ciphertext, iv);
    expect(new Uint8Array(decrypted)).toEqual(new Uint8Array(original));
  });
});
