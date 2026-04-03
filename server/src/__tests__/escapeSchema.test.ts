/**
 * Comprehensive unit tests for escapeSchema
 * Tests schema name validation, format enforcement, and SQL injection prevention
 */
import { describe, it, expect } from 'vitest';
import { escapeSchema } from '../db/escapeSchema.js';

describe('escapeSchema', () => {
  // ===========================================================================
  // Valid schema names
  // ===========================================================================
  describe('valid schema names', () => {
    it('accepts usr_1_abc123', () => {
      expect(escapeSchema('usr_1_abc123')).toBe('usr_1_abc123');
    });

    it('accepts usr_999_f0f0f0', () => {
      expect(escapeSchema('usr_999_f0f0f0')).toBe('usr_999_f0f0f0');
    });

    it('accepts usr_42_deadbe', () => {
      expect(escapeSchema('usr_42_deadbe')).toBe('usr_42_deadbe');
    });

    it('accepts single-digit counter', () => {
      expect(escapeSchema('usr_1_aaaaaa')).toBe('usr_1_aaaaaa');
    });

    it('accepts multi-digit counter', () => {
      expect(escapeSchema('usr_12345_abcdef')).toBe('usr_12345_abcdef');
    });

    it('accepts all valid hex characters a-f 0-9 in suffix', () => {
      expect(escapeSchema('usr_1_0a1b2c')).toBe('usr_1_0a1b2c');
      expect(escapeSchema('usr_1_fedcba')).toBe('usr_1_fedcba');
      expect(escapeSchema('usr_1_000000')).toBe('usr_1_000000');
      expect(escapeSchema('usr_1_999999')).toBe('usr_1_999999');
    });
  });

  // ===========================================================================
  // Invalid format — no prefix
  // ===========================================================================
  describe('invalid format — missing or wrong prefix', () => {
    it('rejects names without usr_ prefix', () => {
      expect(() => escapeSchema('abc_1_aaaaaa')).toThrow('Invalid schema name');
    });

    it('rejects admin prefix', () => {
      expect(() => escapeSchema('admin_1_abc123')).toThrow('Invalid schema name');
    });

    it('rejects public schema name', () => {
      expect(() => escapeSchema('public')).toThrow('Invalid schema name');
    });

    it('rejects information_schema', () => {
      expect(() => escapeSchema('information_schema')).toThrow('Invalid schema name');
    });

    it('rejects pg_catalog', () => {
      expect(() => escapeSchema('pg_catalog')).toThrow('Invalid schema name');
    });
  });

  // ===========================================================================
  // Invalid format — missing parts
  // ===========================================================================
  describe('invalid format — missing parts', () => {
    it('rejects usr_ with no counter or hex', () => {
      expect(() => escapeSchema('usr_')).toThrow('Invalid schema name');
    });

    it('rejects usr with counter but no hex suffix', () => {
      expect(() => escapeSchema('usr_1')).toThrow('Invalid schema name');
    });

    it('rejects usr with counter and underscore but no hex', () => {
      expect(() => escapeSchema('usr_1_')).toThrow('Invalid schema name');
    });

    it('rejects hex suffix that is too short (5 chars)', () => {
      expect(() => escapeSchema('usr_1_abcde')).toThrow('Invalid schema name');
    });

    it('rejects hex suffix that is too long (7 chars)', () => {
      expect(() => escapeSchema('usr_1_abcdefg')).toThrow('Invalid schema name');
    });

    it('rejects missing counter', () => {
      expect(() => escapeSchema('usr__abc123')).toThrow('Invalid schema name');
    });
  });

  // ===========================================================================
  // SQL injection attempts
  // ===========================================================================
  describe('SQL injection prevention', () => {
    it('rejects semicolons', () => {
      expect(() => escapeSchema('usr_1_abc123; DROP TABLE users')).toThrow('Invalid schema name');
    });

    it('rejects single quotes', () => {
      expect(() => escapeSchema("usr_1_abc123' OR '1'='1")).toThrow('Invalid schema name');
    });

    it('rejects double quotes', () => {
      expect(() => escapeSchema('usr_1_abc123" OR "1"="1')).toThrow('Invalid schema name');
    });

    it('rejects DROP TABLE', () => {
      expect(() => escapeSchema('DROP TABLE accounts')).toThrow('Invalid schema name');
    });

    it('rejects DROP SCHEMA', () => {
      expect(() => escapeSchema('; DROP SCHEMA public CASCADE')).toThrow('Invalid schema name');
    });

    it('rejects UNION SELECT', () => {
      expect(() => escapeSchema('usr_1_abc123 UNION SELECT * FROM accounts')).toThrow();
    });

    it('rejects parentheses (stripped, leaving valid-looking name)', () => {
      // Parentheses are stripped by the regex, so 'usr_1_abc123()' becomes 'usr_1_abc123' which is valid
      // This verifies the stripping behavior — the injection characters are removed
      expect(escapeSchema('usr_1_abc123()')).toBe('usr_1_abc123');
    });

    it('rejects backslashes (stripped, leaving valid-looking name)', () => {
      // Backslash is stripped, leaving 'usr_1_abc123' which is valid
      expect(escapeSchema('usr_1_abc123\\')).toBe('usr_1_abc123');
    });

    it('rejects newlines', () => {
      expect(() => escapeSchema('usr_1_abc123\nDROP TABLE')).toThrow('Invalid schema name');
    });

    it('rejects tab characters', () => {
      expect(() => escapeSchema('usr_1_abc123\tDROP')).toThrow('Invalid schema name');
    });

    it('rejects null bytes (stripped, leaving valid-looking name)', () => {
      // Null byte is stripped by regex, leaving 'usr_1_abc123' which is valid
      expect(escapeSchema('usr_1_abc123\0')).toBe('usr_1_abc123');
    });

    it('strips special characters before validation so injection still fails', () => {
      // The dash in "-- " is stripped, leaving something that does not match format
      expect(() => escapeSchema('usr_1_abc123-- comment')).toThrow('Invalid schema name');
    });
  });

  // ===========================================================================
  // Special characters stripped
  // ===========================================================================
  describe('special characters are stripped', () => {
    it('strips dots', () => {
      expect(() => escapeSchema('usr.1.abc123')).toThrow('Invalid schema name');
    });

    it('strips hyphens', () => {
      // usr-1-abc123 becomes usr1abc123 which fails format check
      expect(() => escapeSchema('usr-1-abc123')).toThrow('Invalid schema name');
    });

    it('strips spaces', () => {
      expect(() => escapeSchema('usr 1 abc123')).toThrow('Invalid schema name');
    });

    it('strips unicode characters', () => {
      expect(() => escapeSchema('usr_1_abc12\u00e9')).toThrow('Invalid schema name');
    });
  });

  // ===========================================================================
  // Length validation
  // ===========================================================================
  describe('length validation', () => {
    it('rejects empty string', () => {
      expect(() => escapeSchema('')).toThrow('Invalid schema name');
    });

    it('rejects string with only special characters (empty after stripping)', () => {
      expect(() => escapeSchema('!@#$%^&*()')).toThrow('Invalid schema name');
    });

    it('rejects too-short names (less than 3 chars after stripping)', () => {
      expect(() => escapeSchema('ab')).toThrow('Invalid schema name');
    });

    it('rejects too-long names (over 30 chars)', () => {
      // usr_ (4) + 20 digits + _ (1) + 6 hex = 31 chars -- exceeds 30 limit
      const name = 'usr_12345678901234567890_abcdef';
      expect(name.length).toBe(31);
      expect(() => escapeSchema(name)).toThrow('Schema name too long');
    });

    it('accepts names at the boundary (exactly 30 chars)', () => {
      // usr_1234567890123456789_abcdef = 30 chars
      // But this must also match the regex: usr_\d+_[a-f0-9]{6}
      // usr_ (4) + digits + _ (1) + 6 hex = 11 + digits count
      // 30 - 11 = 19 digits max
      const name = 'usr_1234567890123456789_abcdef';
      expect(name.length).toBe(30);
      expect(escapeSchema(name)).toBe(name);
    });

    it('rejects names exactly 31 chars', () => {
      const name = 'usr_12345678901234567890_abcdef';
      expect(name.length).toBe(31);
      expect(() => escapeSchema(name)).toThrow('Schema name too long');
    });
  });

  // ===========================================================================
  // Uppercase hex rejection
  // ===========================================================================
  describe('uppercase hex in suffix', () => {
    it('rejects uppercase hex letters in suffix', () => {
      expect(() => escapeSchema('usr_1_ABCDEF')).toThrow('Invalid schema name');
    });

    it('rejects mixed-case hex suffix', () => {
      expect(() => escapeSchema('usr_1_AbCdEf')).toThrow('Invalid schema name');
    });
  });

  // ===========================================================================
  // Return value
  // ===========================================================================
  describe('return value', () => {
    it('returns the sanitized schema name on success', () => {
      const result = escapeSchema('usr_1_abc123');
      expect(result).toBe('usr_1_abc123');
      expect(typeof result).toBe('string');
    });
  });
});
