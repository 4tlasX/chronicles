import { Router } from 'express';
import { getAllSettings, upsertSetting } from '../db/tenantQueries.js';
import { upsertSettingSchema } from '@chronicles/shared';

const router = Router();

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const settings = await getAllSettings(req.auth!.tenantSchemaName);
    res.json(settings);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const parsed = upsertSettingSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }
    const { key, value } = parsed.data;
    const setting = await upsertSetting(req.auth!.tenantSchemaName, key, value);
    res.json(setting);
  } catch (err) {
    console.error('Update setting error:', err);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

export default router;
