"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantQueries_js_1 = require("../db/tenantQueries.js");
const shared_1 = require("@chronicles/shared");
const parseId_js_1 = require("../middleware/parseId.js");
const router = (0, express_1.Router)();
// Helper to serialize Buffer/Uint8Array fields to base64 for JSON response
function serializePost(post) {
    const result = { ...post };
    for (const key of ['contentEncrypted', 'contentIv', 'metadataEncrypted', 'metadataIv']) {
        const val = result[key];
        if (val instanceof Uint8Array || val instanceof Buffer) {
            result[key] = Buffer.from(val).toString('base64');
        }
    }
    return result;
}
// GET /api/entries — Get all entries (paginated)
router.get('/', async (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 200);
        const offset = Math.min(Math.max(parseInt(req.query.offset) || 0, 0), 10000);
        const posts = await (0, tenantQueries_js_1.getAllPosts)(req.auth.tenantSchemaName, { limit, offset });
        res.json(posts.map(p => serializePost(p)));
    }
    catch (err) {
        console.error('Get entries error:', err);
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
});
// POST /api/entries — Create entry
router.post('/', async (req, res) => {
    try {
        const parsed = shared_1.createPostSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }
        const { taxonomyIds, createdAt, ...postData } = parsed.data;
        const input = {};
        if (postData.isEncrypted) {
            input.isEncrypted = true;
            input.contentEncrypted = postData.contentEncrypted ? Buffer.from(postData.contentEncrypted, 'base64') : undefined;
            input.contentIv = postData.contentIv ? Buffer.from(postData.contentIv, 'base64') : undefined;
            input.metadataEncrypted = postData.metadataEncrypted ? Buffer.from(postData.metadataEncrypted, 'base64') : undefined;
            input.metadataIv = postData.metadataIv ? Buffer.from(postData.metadataIv, 'base64') : undefined;
        }
        else {
            input.content = postData.content;
            input.metadata = postData.metadata;
        }
        if (createdAt) {
            input.createdAt = new Date(createdAt);
        }
        const post = await (0, tenantQueries_js_1.createPost)(req.auth.tenantSchemaName, input);
        if (taxonomyIds?.length) {
            // Validate taxonomy IDs belong to this tenant
            const existing = await (0, tenantQueries_js_1.getAllTaxonomies)(req.auth.tenantSchemaName);
            const existingIds = new Set(existing.map(t => t.id));
            const validIds = taxonomyIds.filter(id => existingIds.has(id));
            if (validIds.length > 0) {
                await (0, tenantQueries_js_1.setPostTaxonomies)(req.auth.tenantSchemaName, post.id, validIds);
            }
        }
        res.status(201).json(serializePost(post));
    }
    catch (err) {
        console.error('Create entry error:', err);
        res.status(500).json({ error: 'Failed to create entry' });
    }
});
// GET /api/entries/:id — Get single entry
router.get('/:id', async (req, res) => {
    try {
        const id = (0, parseId_js_1.parseId)(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid entry ID' });
            return;
        }
        const post = await (0, tenantQueries_js_1.getPost)(req.auth.tenantSchemaName, id);
        if (!post) {
            res.status(404).json({ error: 'Entry not found' });
            return;
        }
        const taxonomies = await (0, tenantQueries_js_1.getPostTaxonomies)(req.auth.tenantSchemaName, id);
        res.json({ ...serializePost(post), taxonomies });
    }
    catch (err) {
        console.error('Get entry error:', err);
        res.status(500).json({ error: 'Failed to fetch entry' });
    }
});
// PUT /api/entries/:id — Update entry
router.put('/:id', async (req, res) => {
    try {
        const id = (0, parseId_js_1.parseId)(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid entry ID' });
            return;
        }
        const parsed = shared_1.updatePostSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors[0].message });
            return;
        }
        const { taxonomyIds, ...updates } = parsed.data;
        const input = {};
        if (updates.contentEncrypted !== undefined)
            input.contentEncrypted = Buffer.from(updates.contentEncrypted, 'base64');
        if (updates.contentIv !== undefined)
            input.contentIv = Buffer.from(updates.contentIv, 'base64');
        if (updates.metadataEncrypted !== undefined)
            input.metadataEncrypted = Buffer.from(updates.metadataEncrypted, 'base64');
        if (updates.metadataIv !== undefined)
            input.metadataIv = Buffer.from(updates.metadataIv, 'base64');
        if (updates.content !== undefined)
            input.content = updates.content;
        if (updates.metadata !== undefined)
            input.metadata = updates.metadata;
        const post = await (0, tenantQueries_js_1.updatePost)(req.auth.tenantSchemaName, id, input);
        if (taxonomyIds !== undefined) {
            // Validate taxonomy IDs belong to this tenant
            const existing = await (0, tenantQueries_js_1.getAllTaxonomies)(req.auth.tenantSchemaName);
            const existingIds = new Set(existing.map(t => t.id));
            const validIds = taxonomyIds.filter(id => existingIds.has(id));
            await (0, tenantQueries_js_1.setPostTaxonomies)(req.auth.tenantSchemaName, id, validIds);
        }
        res.json(serializePost(post));
    }
    catch (err) {
        console.error('Update entry error:', err);
        res.status(500).json({ error: 'Failed to update entry' });
    }
});
// DELETE /api/entries/:id — Delete entry
router.delete('/:id', async (req, res) => {
    try {
        const id = (0, parseId_js_1.parseId)(req.params.id);
        if (Number.isNaN(id)) {
            res.status(400).json({ error: 'Invalid entry ID' });
            return;
        }
        await (0, tenantQueries_js_1.deletePost)(req.auth.tenantSchemaName, id);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Delete entry error:', err);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
});
exports.default = router;
