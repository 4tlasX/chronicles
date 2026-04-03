import { describe, it, expect } from 'vitest';
import { parseId } from '../middleware/parseId.js';

describe('parseId', () => {
  it('returns a number for valid positive integers', () => {
    expect(parseId('1')).toBe(1);
    expect(parseId('42')).toBe(42);
    expect(parseId('999')).toBe(999);
  });

  it('returns NaN for zero', () => {
    expect(parseId('0')).toBeNaN();
  });

  it('returns NaN for negative numbers', () => {
    expect(parseId('-1')).toBeNaN();
    expect(parseId('-100')).toBeNaN();
  });

  it('returns NaN for floats', () => {
    expect(parseId('1.5')).toBeNaN();
    expect(parseId('3.14')).toBeNaN();
    expect(parseId('0.1')).toBeNaN();
  });

  it('returns NaN for non-numeric strings', () => {
    expect(parseId('abc')).toBeNaN();
    expect(parseId('hello')).toBeNaN();
    expect(parseId('12abc')).toBeNaN();
    expect(parseId('abc12')).toBeNaN();
  });

  it('returns NaN for empty string', () => {
    expect(parseId('')).toBeNaN();
  });

  it('handles very large numbers', () => {
    expect(parseId('999999999')).toBe(999999999);
    expect(parseId('2147483647')).toBe(2147483647);
  });

  it('returns NaN for special values', () => {
    expect(parseId('NaN')).toBeNaN();
    expect(parseId('Infinity')).toBeNaN();
    expect(parseId('-Infinity')).toBeNaN();
  });

  it('returns NaN for whitespace-only strings', () => {
    expect(parseId(' ')).toBeNaN();
    expect(parseId('  ')).toBeNaN();
  });
});
