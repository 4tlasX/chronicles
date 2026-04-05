"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetting = getSetting;
exports.getAllSettings = getAllSettings;
exports.upsertSetting = upsertSetting;
exports.deleteSetting = deleteSetting;
exports.createTaxonomy = createTaxonomy;
exports.getTaxonomy = getTaxonomy;
exports.getAllTaxonomies = getAllTaxonomies;
exports.updateTaxonomy = updateTaxonomy;
exports.deleteTaxonomy = deleteTaxonomy;
exports.reorderTaxonomies = reorderTaxonomies;
exports.createPost = createPost;
exports.getPost = getPost;
exports.getAllPosts = getAllPosts;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.ensureDoseLogsTable = ensureDoseLogsTable;
exports.getDoseLogsByDate = getDoseLogsByDate;
exports.upsertDoseLog = upsertDoseLog;
exports.addTaxonomyToPost = addTaxonomyToPost;
exports.removeTaxonomyFromPost = removeTaxonomyFromPost;
exports.getPostTaxonomies = getPostTaxonomies;
exports.setPostTaxonomies = setPostTaxonomies;
const prisma_js_1 = require("./prisma.js");
const escapeSchema_js_1 = require("./escapeSchema.js");
// =============================================================================
// Settings
// =============================================================================
async function getSetting(schemaName, key) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`SELECT key, value, updated_at as "updatedAt" FROM ${s}.settings WHERE key = $1`, key);
    return result[0] || null;
}
async function getAllSettings(schemaName) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    return prisma_js_1.prisma.$queryRawUnsafe(`SELECT key, value, updated_at as "updatedAt" FROM ${s}.settings ORDER BY key`);
}
async function upsertSetting(schemaName, key, value) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`INSERT INTO ${s}.settings (key, value, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()
     RETURNING key, value, updated_at as "updatedAt"`, key, JSON.stringify(value));
    return result[0];
}
async function deleteSetting(schemaName, key) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    await prisma_js_1.prisma.$executeRawUnsafe(`DELETE FROM ${s}.settings WHERE key = $1`, key);
}
// =============================================================================
// Taxonomies
// =============================================================================
async function createTaxonomy(schemaName, name, options) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    // Auto-assign sort_order as max + 1
    const maxResult = await prisma_js_1.prisma.$queryRawUnsafe(`SELECT MAX(sort_order) as max_order FROM ${s}.taxonomies`);
    const nextOrder = (maxResult[0]?.max_order ?? -1) + 1;
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`INSERT INTO ${s}.taxonomies (name, icon, color, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, icon, color, sort_order`, name, options?.icon ?? null, options?.color ?? null, nextOrder);
    return { ...result[0], id: Number(result[0].id), sort_order: Number(result[0].sort_order) };
}
async function getTaxonomy(schemaName, id) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`SELECT id, name, icon, color, sort_order FROM ${s}.taxonomies WHERE id = $1`, id);
    return result[0] || null;
}
async function getAllTaxonomies(schemaName) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const rows = await prisma_js_1.prisma.$queryRawUnsafe(`SELECT id, name, icon, color, sort_order FROM ${s}.taxonomies ORDER BY sort_order, name`);
    return rows.map(r => ({ ...r, id: Number(r.id), sort_order: Number(r.sort_order ?? 0) }));
}
async function updateTaxonomy(schemaName, id, updates) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    if (updates.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        values.push(updates.name);
    }
    if (updates.icon !== undefined) {
        setClauses.push(`icon = $${paramIndex++}`);
        values.push(updates.icon);
    }
    if (updates.color !== undefined) {
        setClauses.push(`color = $${paramIndex++}`);
        values.push(updates.color);
    }
    values.push(id);
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`UPDATE ${s}.taxonomies SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, icon, color, sort_order`, ...values);
    return result[0];
}
async function deleteTaxonomy(schemaName, id) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    await prisma_js_1.prisma.$executeRawUnsafe(`DELETE FROM ${s}.taxonomies WHERE id = $1`, id);
}
async function reorderTaxonomies(schemaName, orderedIds) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    await prisma_js_1.prisma.$transaction(async (tx) => {
        for (let i = 0; i < orderedIds.length; i++) {
            await tx.$executeRawUnsafe(`UPDATE ${s}.taxonomies SET sort_order = $1 WHERE id = $2`, i, orderedIds[i]);
        }
    });
}
const POST_SELECT = `id, content, metadata,
  content_encrypted as "contentEncrypted", content_iv as "contentIv",
  metadata_encrypted as "metadataEncrypted", metadata_iv as "metadataIv",
  is_encrypted as "isEncrypted", created_at as "createdAt", updated_at as "updatedAt"`;
async function createPost(schemaName, input) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    if (input.isEncrypted) {
        if (input.createdAt) {
            const result = await prisma_js_1.prisma.$queryRawUnsafe(`INSERT INTO ${s}.posts (content_encrypted, content_iv, metadata_encrypted, metadata_iv, is_encrypted, created_at, updated_at)
         VALUES ($1, $2, $3, $4, TRUE, $5, $5)
         RETURNING ${POST_SELECT}`, input.contentEncrypted, input.contentIv, input.metadataEncrypted, input.metadataIv, input.createdAt);
            return result[0];
        }
        const result = await prisma_js_1.prisma.$queryRawUnsafe(`INSERT INTO ${s}.posts (content_encrypted, content_iv, metadata_encrypted, metadata_iv, is_encrypted)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING ${POST_SELECT}`, input.contentEncrypted, input.contentIv, input.metadataEncrypted, input.metadataIv);
        return result[0];
    }
    if (input.createdAt) {
        const result = await prisma_js_1.prisma.$queryRawUnsafe(`INSERT INTO ${s}.posts (content, metadata, is_encrypted, created_at, updated_at)
       VALUES ($1, $2::jsonb, FALSE, $3, $3)
       RETURNING ${POST_SELECT}`, input.content ?? '', JSON.stringify(input.metadata ?? {}), input.createdAt);
        return result[0];
    }
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`INSERT INTO ${s}.posts (content, metadata, is_encrypted)
     VALUES ($1, $2::jsonb, FALSE)
     RETURNING ${POST_SELECT}`, input.content ?? '', JSON.stringify(input.metadata ?? {}));
    return result[0];
}
async function getPost(schemaName, id) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`SELECT ${POST_SELECT} FROM ${s}.posts WHERE id = $1`, id);
    return result[0] || null;
}
async function getAllPosts(schemaName, options) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    return prisma_js_1.prisma.$queryRawUnsafe(`SELECT ${POST_SELECT} FROM ${s}.posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`, options?.limit || 1000, options?.offset || 0);
}
async function updatePost(schemaName, id, updates) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const setClauses = [];
    const values = [];
    let paramIndex = 1;
    if (updates.content !== undefined) {
        setClauses.push(`content = $${paramIndex++}`);
        values.push(updates.content);
    }
    if (updates.metadata !== undefined) {
        setClauses.push(`metadata = $${paramIndex}::jsonb`);
        paramIndex++;
        values.push(JSON.stringify(updates.metadata));
    }
    if (updates.contentEncrypted !== undefined) {
        setClauses.push(`content_encrypted = $${paramIndex++}`);
        values.push(updates.contentEncrypted);
    }
    if (updates.contentIv !== undefined) {
        setClauses.push(`content_iv = $${paramIndex++}`);
        values.push(updates.contentIv);
    }
    if (updates.metadataEncrypted !== undefined) {
        setClauses.push(`metadata_encrypted = $${paramIndex++}`);
        values.push(updates.metadataEncrypted);
    }
    if (updates.metadataIv !== undefined) {
        setClauses.push(`metadata_iv = $${paramIndex++}`);
        values.push(updates.metadataIv);
    }
    setClauses.push('updated_at = NOW()');
    values.push(id);
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`UPDATE ${s}.posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING ${POST_SELECT}`, ...values);
    return result[0];
}
async function deletePost(schemaName, id) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    await prisma_js_1.prisma.$executeRawUnsafe(`DELETE FROM ${s}.posts WHERE id = $1`, id);
}
/** JIT migration: create medication_dose_logs table if missing. */
async function ensureDoseLogsTable(schemaName) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const idxPrefix = `idx_${s}`;
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = 'medication_dose_logs'
     ) as exists`, s);
    if (!result[0]?.exists) {
        await prisma_js_1.prisma.$executeRawUnsafe(`
      CREATE TABLE ${s}.medication_dose_logs (
        id SERIAL PRIMARY KEY,
        medication_post_id INTEGER NOT NULL REFERENCES ${s}.posts(id) ON DELETE CASCADE,
        scheduled_time TIME NOT NULL,
        taken_at TEXT,
        date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    }
    // Always ensure indexes exist (handles tables created before indexes were added)
    await prisma_js_1.prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ${idxPrefix}_dose_logs_date ON ${s}.medication_dose_logs (date)`);
    await prisma_js_1.prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS ${idxPrefix}_dose_logs_med_date ON ${s}.medication_dose_logs (medication_post_id, date)`);
    await prisma_js_1.prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS ${idxPrefix}_dose_logs_unique ON ${s}.medication_dose_logs (medication_post_id, scheduled_time, date)`);
}
async function getDoseLogsByDate(schemaName, date) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const rows = await prisma_js_1.prisma.$queryRawUnsafe(`SELECT id, medication_post_id as "medicationPostId", scheduled_time as "scheduledTime",
            taken_at as "takenAt", date, status, created_at as "createdAt"
     FROM ${s}.medication_dose_logs
     WHERE date = $1::date
     ORDER BY scheduled_time ASC`, date);
    return rows.map(r => ({ ...r, id: Number(r.id), medicationPostId: Number(r.medicationPostId) }));
}
async function upsertDoseLog(schemaName, medicationPostId, scheduledTime, date, status, takenAt) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    // Use INSERT ... ON CONFLICT to avoid race conditions between check-and-insert
    const result = await prisma_js_1.prisma.$queryRawUnsafe(`INSERT INTO ${s}.medication_dose_logs (medication_post_id, scheduled_time, date, status, taken_at)
     VALUES ($1, $2::time, $3::date, $4, $5)
     ON CONFLICT (medication_post_id, scheduled_time, date)
     DO UPDATE SET status = EXCLUDED.status, taken_at = EXCLUDED.taken_at
     RETURNING id, medication_post_id as "medicationPostId", scheduled_time as "scheduledTime",
               taken_at as "takenAt", date, status, created_at as "createdAt"`, medicationPostId, scheduledTime, date, status, takenAt);
    return { ...result[0], id: Number(result[0].id), medicationPostId: Number(result[0].medicationPostId) };
}
// =============================================================================
// Post-Taxonomy Relationships
// =============================================================================
async function addTaxonomyToPost(schemaName, postId, taxonomyId) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    await prisma_js_1.prisma.$executeRawUnsafe(`INSERT INTO ${s}.post_taxonomies (post_id, tax_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, postId, taxonomyId);
}
async function removeTaxonomyFromPost(schemaName, postId, taxonomyId) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    await prisma_js_1.prisma.$executeRawUnsafe(`DELETE FROM ${s}.post_taxonomies WHERE post_id = $1 AND tax_id = $2`, postId, taxonomyId);
}
async function getPostTaxonomies(schemaName, postId) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    return prisma_js_1.prisma.$queryRawUnsafe(`SELECT t.id, t.name, t.icon, t.color
     FROM ${s}.taxonomies t
     JOIN ${s}.post_taxonomies pt ON t.id = pt.tax_id
     WHERE pt.post_id = $1
     ORDER BY t.name`, postId);
}
async function setPostTaxonomies(schemaName, postId, taxonomyIds) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    // Wrap in transaction to prevent partial taxonomy state on failure
    await prisma_js_1.prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`DELETE FROM ${s}.post_taxonomies WHERE post_id = $1`, postId);
        for (const taxId of taxonomyIds) {
            await tx.$executeRawUnsafe(`INSERT INTO ${s}.post_taxonomies (post_id, tax_id) VALUES ($1, $2)`, postId, taxId);
        }
    });
}
