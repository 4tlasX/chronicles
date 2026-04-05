"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantQueries_js_1 = require("../db/tenantQueries.js");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;
const logDoseSchema = zod_1.z.object({
    medicationPostId: zod_1.z.number(),
    scheduledTime: zod_1.z.string().regex(timeRegex, 'Must be HH:MM format'),
    date: zod_1.z.string().regex(dateRegex, 'Must be YYYY-MM-DD format'),
    status: zod_1.z.enum(['taken', 'skipped', 'pending']),
    takenAt: zod_1.z.string().nullable().optional(),
});
// GET /api/doses?date=YYYY-MM-DD
router.get('/', async (req, res) => {
    try {
        const date = req.query.date;
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            res.status(400).json({ error: 'date query parameter is required in YYYY-MM-DD format' });
            return;
        }
        await (0, tenantQueries_js_1.ensureDoseLogsTable)(req.auth.tenantSchemaName);
        const logs = await (0, tenantQueries_js_1.getDoseLogsByDate)(req.auth.tenantSchemaName, date);
        res.json({ logs });
    }
    catch (err) {
        console.error('Get dose logs error:', err);
        res.status(500).json({ error: 'Failed to fetch dose logs' });
    }
});
// POST /api/doses
router.post('/', async (req, res) => {
    try {
        const parsed = logDoseSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }
        const { medicationPostId, scheduledTime, date, status, takenAt } = parsed.data;
        // Validate that the medication post exists in this tenant's schema
        await (0, tenantQueries_js_1.ensureDoseLogsTable)(req.auth.tenantSchemaName);
        const post = await (0, tenantQueries_js_1.getPost)(req.auth.tenantSchemaName, medicationPostId);
        if (!post) {
            res.status(404).json({ error: 'Medication post not found' });
            return;
        }
        const resolvedTakenAt = status === 'taken'
            ? (takenAt || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
            : null;
        const log = await (0, tenantQueries_js_1.upsertDoseLog)(req.auth.tenantSchemaName, medicationPostId, scheduledTime, date, status, resolvedTakenAt);
        res.json({ log });
    }
    catch (err) {
        console.error('Log dose error:', err);
        res.status(500).json({ error: 'Failed to log dose' });
    }
});
exports.default = router;
