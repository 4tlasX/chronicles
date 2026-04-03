import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logSecurityEvent } from '../utils/securityLogger.js';

describe('logSecurityEvent', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('outputs structured JSON to console.log', () => {
    logSecurityEvent('test_event');

    expect(console.log).toHaveBeenCalledTimes(1);
    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).toBeDefined();
  });

  it('includes event type in output', () => {
    logSecurityEvent('login_failed');

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.event).toBe('login_failed');
  });

  it('includes level as "security"', () => {
    logSecurityEvent('some_event');

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('security');
  });

  it('includes a valid ISO timestamp', () => {
    logSecurityEvent('some_event');

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.timestamp).toBeDefined();
    // Verify it's a valid ISO string
    const date = new Date(parsed.timestamp);
    expect(date.toISOString()).toBe(parsed.timestamp);
  });

  it('includes accountId when provided', () => {
    logSecurityEvent('login_success', { accountId: 42 });

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.accountId).toBe(42);
  });

  it('excludes accountId when not provided', () => {
    logSecurityEvent('some_event');

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).not.toHaveProperty('accountId');
  });

  it('includes ip when provided', () => {
    logSecurityEvent('brute_force', { ip: '192.168.1.1' });

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.ip).toBe('192.168.1.1');
  });

  it('excludes ip when not provided', () => {
    logSecurityEvent('some_event');

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).not.toHaveProperty('ip');
  });

  it('includes details when provided', () => {
    logSecurityEvent('suspicious_activity', {
      details: { reason: 'too many attempts', count: 10 },
    });

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.details).toEqual({ reason: 'too many attempts', count: 10 });
  });

  it('excludes details when not provided', () => {
    logSecurityEvent('some_event');

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed).not.toHaveProperty('details');
  });

  it('includes all fields when all options are provided', () => {
    logSecurityEvent('full_event', {
      accountId: 7,
      ip: '10.0.0.1',
      details: { key: 'value' },
    });

    const output = (console.log as any).mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('security');
    expect(parsed.event).toBe('full_event');
    expect(parsed.timestamp).toBeDefined();
    expect(parsed.accountId).toBe(7);
    expect(parsed.ip).toBe('10.0.0.1');
    expect(parsed.details).toEqual({ key: 'value' });
  });
});
