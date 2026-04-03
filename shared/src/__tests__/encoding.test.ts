/**
 * Unit tests for encoding utilities
 */
import { describe, it, expect } from 'vitest';
import {
  arrayBufferToBase64,
  base64ToArrayBuffer,
  stringToArrayBuffer,
  arrayBufferToString,
  uint8ArrayToBase64,
  base64ToUint8Array,
  generateRandomBytes,
} from '../crypto/encoding.js';

// ============================================================================
// arrayBufferToBase64 / base64ToArrayBuffer roundtrip
// ============================================================================
describe('arrayBufferToBase64 / base64ToArrayBuffer', () => {
  it('roundtrips a simple byte array', () => {
    const original = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    const base64 = arrayBufferToBase64(original.buffer as ArrayBuffer);
    const restored = new Uint8Array(base64ToArrayBuffer(base64));
    expect(restored).toEqual(original);
  });

  it('roundtrips an empty buffer', () => {
    const original = new Uint8Array([]);
    const base64 = arrayBufferToBase64(original.buffer as ArrayBuffer);
    expect(base64).toBe('');
    const restored = new Uint8Array(base64ToArrayBuffer(base64));
    expect(restored.length).toBe(0);
  });

  it('roundtrips a buffer with all byte values 0-255', () => {
    const original = new Uint8Array(256);
    for (let i = 0; i < 256; i++) original[i] = i;
    const base64 = arrayBufferToBase64(original.buffer as ArrayBuffer);
    const restored = new Uint8Array(base64ToArrayBuffer(base64));
    expect(restored).toEqual(original);
  });

  it('produces valid base64 output', () => {
    const data = new Uint8Array([1, 2, 3]);
    const base64 = arrayBufferToBase64(data.buffer as ArrayBuffer);
    expect(base64).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
  });

  it('base64ToArrayBuffer rejects invalid base64 characters', () => {
    expect(() => base64ToArrayBuffer('abc!def')).toThrow('Invalid base64 string');
    expect(() => base64ToArrayBuffer('abc def')).toThrow('Invalid base64 string');
    expect(() => base64ToArrayBuffer('abc\ndef')).toThrow('Invalid base64 string');
  });

  it('roundtrips large data (10KB)', () => {
    const original = new Uint8Array(10240);
    crypto.getRandomValues(original);
    const base64 = arrayBufferToBase64(original.buffer as ArrayBuffer);
    const restored = new Uint8Array(base64ToArrayBuffer(base64));
    expect(restored).toEqual(original);
  });
});

// ============================================================================
// stringToArrayBuffer / arrayBufferToString roundtrip
// ============================================================================
describe('stringToArrayBuffer / arrayBufferToString', () => {
  it('roundtrips ASCII text', () => {
    const original = 'Hello, World!';
    const buffer = stringToArrayBuffer(original);
    const restored = arrayBufferToString(buffer);
    expect(restored).toBe(original);
  });

  it('roundtrips an empty string', () => {
    const buffer = stringToArrayBuffer('');
    const restored = arrayBufferToString(buffer);
    expect(restored).toBe('');
  });

  it('roundtrips unicode text', () => {
    const original = 'Hello \u{1F600} \u00E9\u00E8\u00EA \u4F60\u597D \u0410\u0411\u0412';
    const buffer = stringToArrayBuffer(original);
    const restored = arrayBufferToString(buffer);
    expect(restored).toBe(original);
  });

  it('roundtrips multi-byte emoji', () => {
    const original = '\u{1F1FA}\u{1F1F8}\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}';
    const buffer = stringToArrayBuffer(original);
    const restored = arrayBufferToString(buffer);
    expect(restored).toBe(original);
  });

  it('roundtrips string with special characters', () => {
    const original = '<script>alert("xss")</script>\n\t\r\0';
    const buffer = stringToArrayBuffer(original);
    const restored = arrayBufferToString(buffer);
    expect(restored).toBe(original);
  });
});

// ============================================================================
// uint8ArrayToBase64 / base64ToUint8Array roundtrip
// ============================================================================
describe('uint8ArrayToBase64 / base64ToUint8Array', () => {
  it('roundtrips a Uint8Array', () => {
    const original = new Uint8Array([10, 20, 30, 40, 50]);
    const base64 = uint8ArrayToBase64(original);
    const restored = base64ToUint8Array(base64);
    expect(restored).toEqual(original);
  });

  it('roundtrips an empty Uint8Array', () => {
    const original = new Uint8Array([]);
    const base64 = uint8ArrayToBase64(original);
    expect(base64).toBe('');
    const restored = base64ToUint8Array(base64);
    expect(restored.length).toBe(0);
  });

  it('roundtrips a single byte', () => {
    const original = new Uint8Array([255]);
    const base64 = uint8ArrayToBase64(original);
    const restored = base64ToUint8Array(base64);
    expect(restored).toEqual(original);
  });

  it('returns Uint8Array (not plain ArrayBuffer)', () => {
    const base64 = uint8ArrayToBase64(new Uint8Array([1, 2, 3]));
    const result = base64ToUint8Array(base64);
    expect(result).toBeInstanceOf(Uint8Array);
  });
});

// ============================================================================
// generateRandomBytes
// ============================================================================
describe('generateRandomBytes', () => {
  it('returns correct length', () => {
    expect(generateRandomBytes(16).length).toBe(16);
    expect(generateRandomBytes(32).length).toBe(32);
    expect(generateRandomBytes(12).length).toBe(12);
    expect(generateRandomBytes(1).length).toBe(1);
  });

  it('returns a Uint8Array', () => {
    const result = generateRandomBytes(8);
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('produces different output on successive calls', () => {
    const a = generateRandomBytes(32);
    const b = generateRandomBytes(32);
    // Extremely unlikely to be equal for 32 random bytes
    expect(a).not.toEqual(b);
  });

  it('returns zero-length array when requested', () => {
    const result = generateRandomBytes(0);
    expect(result.length).toBe(0);
  });
});
