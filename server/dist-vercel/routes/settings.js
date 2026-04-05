"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantQueries_js_1 = require("../db/tenantQueries.js");
const shared_1 = require("@chronicles/shared");
const router = (0, express_1.Router)();
// GET /api/settings
router.get('/', async (req, res) => {
    try {
        const settings = await (0, tenantQueries_js_1.getAllSettings)(req.auth.tenantSchemaName);
        res.json(settings);
    }
    catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});
// PUT /api/settings
router.put('/', async (req, res) => {
    try {
        const parsed = shared_1.upsertSettingSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }
        const { key, value } = parsed.data;
        const setting = await (0, tenantQueries_js_1.upsertSetting)(req.auth.tenantSchemaName, key, value);
        res.json(setting);
    }
    catch (err) {
        console.error('Update setting error:', err);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});
exports.default = router;
