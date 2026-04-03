import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, TEST_AUTH } from './testHelper.js';

// Mock tenantQueries
vi.mock('../../db/tenantQueries.js', () => ({
  ensureDoseLogsTable: vi.fn().mockResolvedValue(undefined),
  getDoseLogsByDate: vi.fn(),
  upsertDoseLog: vi.fn(),
  getPost: vi.fn(),
}));

import dosesRouter from '../../routes/doses.js';
import { ensureDoseLogsTable, getDoseLogsByDate, upsertDoseLog, getPost } from '../../db/tenantQueries.js';

const app = createTestApp('/api/doses', dosesRouter);

const mockDoseLog = {
  id: 1,
  medicationPostId: 10,
  scheduledTime: '08:00',
  date: '2025-06-15',
  status: 'taken',
  takenAt: '8:00 AM',
};

describe('Dose Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // GET /api/doses
  // =========================================================================
  describe('GET /api/doses', () => {
    it('returns dose logs for a given date', async () => {
      (getDoseLogsByDate as any).mockResolvedValue([mockDoseLog]);

      const res = await request(app)
        .get('/api/doses')
        .query({ date: '2025-06-15' });

      expect(res.status).toBe(200);
      expect(res.body.logs).toHaveLength(1);
      expect(res.body.logs[0].status).toBe('taken');
      expect(ensureDoseLogsTable).toHaveBeenCalledWith(TEST_AUTH.tenantSchemaName);
      expect(getDoseLogsByDate).toHaveBeenCalledWith(TEST_AUTH.tenantSchemaName, '2025-06-15');
    });

    it('returns empty logs when no doses recorded', async () => {
      (getDoseLogsByDate as any).mockResolvedValue([]);

      const res = await request(app)
        .get('/api/doses')
        .query({ date: '2025-06-15' });

      expect(res.status).toBe(200);
      expect(res.body.logs).toEqual([]);
    });

    it('returns 400 when date is missing', async () => {
      const res = await request(app).get('/api/doses');

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('date query parameter is required');
    });

    it('returns 400 when date format is invalid', async () => {
      const res = await request(app)
        .get('/api/doses')
        .query({ date: '15-06-2025' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('YYYY-MM-DD');
    });

    it('returns 400 when date is not a date string', async () => {
      const res = await request(app)
        .get('/api/doses')
        .query({ date: 'not-a-date' });

      expect(res.status).toBe(400);
    });

    it('returns 500 on database error', async () => {
      (getDoseLogsByDate as any).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .get('/api/doses')
        .query({ date: '2025-06-15' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to fetch dose logs');
    });
  });

  // =========================================================================
  // POST /api/doses
  // =========================================================================
  describe('POST /api/doses', () => {
    const validDoseBody = {
      medicationPostId: 10,
      scheduledTime: '08:00',
      date: '2025-06-15',
      status: 'taken' as const,
    };

    it('logs a dose with status taken', async () => {
      (getPost as any).mockResolvedValue({ id: 10, content: 'medication data' });
      (upsertDoseLog as any).mockResolvedValue(mockDoseLog);

      const res = await request(app)
        .post('/api/doses')
        .send(validDoseBody);

      expect(res.status).toBe(200);
      expect(res.body.log).toBeDefined();
      expect(ensureDoseLogsTable).toHaveBeenCalledWith(TEST_AUTH.tenantSchemaName);
      expect(upsertDoseLog).toHaveBeenCalledWith(
        TEST_AUTH.tenantSchemaName,
        10,
        '08:00',
        '2025-06-15',
        'taken',
        expect.any(String), // auto-generated takenAt
      );
    });

    it('logs a dose with status skipped (takenAt should be null)', async () => {
      (getPost as any).mockResolvedValue({ id: 10 });
      (upsertDoseLog as any).mockResolvedValue({ ...mockDoseLog, status: 'skipped', takenAt: null });

      const res = await request(app)
        .post('/api/doses')
        .send({ ...validDoseBody, status: 'skipped' });

      expect(res.status).toBe(200);
      expect(upsertDoseLog).toHaveBeenCalledWith(
        TEST_AUTH.tenantSchemaName,
        10,
        '08:00',
        '2025-06-15',
        'skipped',
        null,
      );
    });

    it('logs a dose with explicit takenAt', async () => {
      (getPost as any).mockResolvedValue({ id: 10 });
      (upsertDoseLog as any).mockResolvedValue(mockDoseLog);

      const res = await request(app)
        .post('/api/doses')
        .send({ ...validDoseBody, takenAt: '8:15 AM' });

      expect(res.status).toBe(200);
      expect(upsertDoseLog).toHaveBeenCalledWith(
        TEST_AUTH.tenantSchemaName,
        10,
        '08:00',
        '2025-06-15',
        'taken',
        '8:15 AM',
      );
    });

    it('returns 404 when medication post not found', async () => {
      (getPost as any).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/doses')
        .send(validDoseBody);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Medication post not found');
    });

    it('returns 400 for invalid scheduledTime format', async () => {
      const res = await request(app)
        .post('/api/doses')
        .send({ ...validDoseBody, scheduledTime: '8am' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('HH:MM');
    });

    it('returns 400 for invalid date format', async () => {
      const res = await request(app)
        .post('/api/doses')
        .send({ ...validDoseBody, date: 'June 15' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('YYYY-MM-DD');
    });

    it('returns 400 for invalid status', async () => {
      const res = await request(app)
        .post('/api/doses')
        .send({ ...validDoseBody, status: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when medicationPostId is missing', async () => {
      const res = await request(app)
        .post('/api/doses')
        .send({ scheduledTime: '08:00', date: '2025-06-15', status: 'taken' });

      expect(res.status).toBe(400);
    });

    it('returns 500 on database error', async () => {
      (getPost as any).mockResolvedValue({ id: 10 });
      (upsertDoseLog as any).mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .post('/api/doses')
        .send(validDoseBody);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to log dose');
    });
  });
});
