import { prisma } from './prisma.js';

// =============================================================================
// Tenant Query Helpers
// =============================================================================

function escapeSchema(schemaName: string): string {
  return schemaName.replace(/[^a-z0-9_]/gi, '');
}

// =============================================================================
// Types
// =============================================================================

export interface TenantSetting {
  key: string;
  value: unknown;
  updatedAt: Date;
}

export interface TenantTaxonomy {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  sort_order: number;
}

export interface TenantPost {
  id: number;
  content: string | null;
  metadata: Record<string, unknown> | null;
  contentEncrypted: Buffer | null;
  contentIv: Buffer | null;
  metadataEncrypted: Buffer | null;
  metadataIv: Buffer | null;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// Settings
// =============================================================================

export async function getSetting(schemaName: string, key: string): Promise<TenantSetting | null> {
  const s = escapeSchema(schemaName);
  const result = await prisma.$queryRawUnsafe<TenantSetting[]>(
    `SELECT key, value, updated_at as "updatedAt" FROM ${s}.settings WHERE key = $1`,
    key
  );
  return result[0] || null;
}

export async function getAllSettings(schemaName: string): Promise<TenantSetting[]> {
  const s = escapeSchema(schemaName);
  return prisma.$queryRawUnsafe<TenantSetting[]>(
    `SELECT key, value, updated_at as "updatedAt" FROM ${s}.settings ORDER BY key`
  );
}

export async function upsertSetting(schemaName: string, key: string, value: unknown): Promise<TenantSetting> {
  const s = escapeSchema(schemaName);
  const result = await prisma.$queryRawUnsafe<TenantSetting[]>(
    `INSERT INTO ${s}.settings (key, value, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()
     RETURNING key, value, updated_at as "updatedAt"`,
    key,
    JSON.stringify(value)
  );
  return result[0];
}

export async function deleteSetting(schemaName: string, key: string): Promise<void> {
  const s = escapeSchema(schemaName);
  await prisma.$executeRawUnsafe(`DELETE FROM ${s}.settings WHERE key = $1`, key);
}

// =============================================================================
// Taxonomies
// =============================================================================

export async function createTaxonomy(
  schemaName: string,
  name: string,
  options?: { icon?: string; color?: string }
): Promise<TenantTaxonomy> {
  const s = escapeSchema(schemaName);
  // Auto-assign sort_order as max + 1
  const maxResult = await prisma.$queryRawUnsafe<{ max_order: number | null }[]>(
    `SELECT MAX(sort_order) as max_order FROM ${s}.taxonomies`
  );
  const nextOrder = (maxResult[0]?.max_order ?? -1) + 1;

  const result = await prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `INSERT INTO ${s}.taxonomies (name, icon, color, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, icon, color, sort_order`,
    name,
    options?.icon ?? null,
    options?.color ?? null,
    nextOrder
  );
  return { ...result[0], id: Number(result[0].id), sort_order: Number(result[0].sort_order) };
}

export async function getTaxonomy(schemaName: string, id: number): Promise<TenantTaxonomy | null> {
  const s = escapeSchema(schemaName);
  const result = await prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `SELECT id, name, icon, color, sort_order FROM ${s}.taxonomies WHERE id = $1`,
    id
  );
  return result[0] || null;
}

export async function getAllTaxonomies(schemaName: string): Promise<TenantTaxonomy[]> {
  const s = escapeSchema(schemaName);
  const rows = await prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `SELECT id, name, icon, color, sort_order FROM ${s}.taxonomies ORDER BY sort_order, name`
  );
  return rows.map(r => ({ ...r, id: Number(r.id), sort_order: Number(r.sort_order ?? 0) }));
}

export async function updateTaxonomy(
  schemaName: string,
  id: number,
  updates: { name?: string; icon?: string; color?: string }
): Promise<TenantTaxonomy> {
  const s = escapeSchema(schemaName);
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) { setClauses.push(`name = $${paramIndex++}`); values.push(updates.name); }
  if (updates.icon !== undefined) { setClauses.push(`icon = $${paramIndex++}`); values.push(updates.icon); }
  if (updates.color !== undefined) { setClauses.push(`color = $${paramIndex++}`); values.push(updates.color); }

  values.push(id);
  const result = await prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `UPDATE ${s}.taxonomies SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, icon, color, sort_order`,
    ...values
  );
  return result[0];
}

export async function deleteTaxonomy(schemaName: string, id: number): Promise<void> {
  const s = escapeSchema(schemaName);
  await prisma.$executeRawUnsafe(`DELETE FROM ${s}.taxonomies WHERE id = $1`, id);
}

export async function reorderTaxonomies(schemaName: string, orderedIds: number[]): Promise<void> {
  const s = escapeSchema(schemaName);
  for (let i = 0; i < orderedIds.length; i++) {
    await prisma.$executeRawUnsafe(
      `UPDATE ${s}.taxonomies SET sort_order = $1 WHERE id = $2`,
      i,
      orderedIds[i]
    );
  }
}

// =============================================================================
// Posts
// =============================================================================

export interface CreatePostInput {
  content?: string;
  metadata?: Record<string, unknown>;
  contentEncrypted?: Buffer;
  contentIv?: Buffer;
  metadataEncrypted?: Buffer;
  metadataIv?: Buffer;
  isEncrypted?: boolean;
}

const POST_SELECT = `id, content, metadata,
  content_encrypted as "contentEncrypted", content_iv as "contentIv",
  metadata_encrypted as "metadataEncrypted", metadata_iv as "metadataIv",
  is_encrypted as "isEncrypted", created_at as "createdAt", updated_at as "updatedAt"`;

export async function createPost(schemaName: string, input: CreatePostInput): Promise<TenantPost> {
  const s = escapeSchema(schemaName);

  if (input.isEncrypted) {
    const result = await prisma.$queryRawUnsafe<TenantPost[]>(
      `INSERT INTO ${s}.posts (content_encrypted, content_iv, metadata_encrypted, metadata_iv, is_encrypted)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING ${POST_SELECT}`,
      input.contentEncrypted,
      input.contentIv,
      input.metadataEncrypted,
      input.metadataIv
    );
    return result[0];
  }

  const result = await prisma.$queryRawUnsafe<TenantPost[]>(
    `INSERT INTO ${s}.posts (content, metadata, is_encrypted)
     VALUES ($1, $2::jsonb, FALSE)
     RETURNING ${POST_SELECT}`,
    input.content ?? '',
    JSON.stringify(input.metadata ?? {})
  );
  return result[0];
}

export async function getPost(schemaName: string, id: number): Promise<TenantPost | null> {
  const s = escapeSchema(schemaName);
  const result = await prisma.$queryRawUnsafe<TenantPost[]>(
    `SELECT ${POST_SELECT} FROM ${s}.posts WHERE id = $1`,
    id
  );
  return result[0] || null;
}

export async function getAllPosts(
  schemaName: string,
  options?: { limit?: number; offset?: number }
): Promise<TenantPost[]> {
  const s = escapeSchema(schemaName);
  return prisma.$queryRawUnsafe<TenantPost[]>(
    `SELECT ${POST_SELECT} FROM ${s}.posts ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    options?.limit || 1000,
    options?.offset || 0
  );
}

export async function updatePost(
  schemaName: string,
  id: number,
  updates: Partial<CreatePostInput>
): Promise<TenantPost> {
  const s = escapeSchema(schemaName);
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.content !== undefined) { setClauses.push(`content = $${paramIndex++}`); values.push(updates.content); }
  if (updates.metadata !== undefined) { setClauses.push(`metadata = $${paramIndex}::jsonb`); paramIndex++; values.push(JSON.stringify(updates.metadata)); }
  if (updates.contentEncrypted !== undefined) { setClauses.push(`content_encrypted = $${paramIndex++}`); values.push(updates.contentEncrypted); }
  if (updates.contentIv !== undefined) { setClauses.push(`content_iv = $${paramIndex++}`); values.push(updates.contentIv); }
  if (updates.metadataEncrypted !== undefined) { setClauses.push(`metadata_encrypted = $${paramIndex++}`); values.push(updates.metadataEncrypted); }
  if (updates.metadataIv !== undefined) { setClauses.push(`metadata_iv = $${paramIndex++}`); values.push(updates.metadataIv); }

  setClauses.push('updated_at = NOW()');
  values.push(id);

  const result = await prisma.$queryRawUnsafe<TenantPost[]>(
    `UPDATE ${s}.posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING ${POST_SELECT}`,
    ...values
  );
  return result[0];
}

export async function deletePost(schemaName: string, id: number): Promise<void> {
  const s = escapeSchema(schemaName);
  await prisma.$executeRawUnsafe(`DELETE FROM ${s}.posts WHERE id = $1`, id);
}

// =============================================================================
// Medication Dose Logs
// =============================================================================

export interface DoseLog {
  id: number;
  medicationPostId: number;
  scheduledTime: string;
  takenAt: string | null;
  date: string;
  status: string;
  createdAt: Date;
}

/** JIT migration: create medication_dose_logs table if missing. */
export async function ensureDoseLogsTable(schemaName: string): Promise<void> {
  const s = escapeSchema(schemaName);
  const result = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = 'medication_dose_logs'
     ) as exists`,
    s
  );
  if (!result[0]?.exists) {
    await prisma.$executeRawUnsafe(`
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
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_${s}_dose_logs_date ON ${s}.medication_dose_logs (date)`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_${s}_dose_logs_med_date ON ${s}.medication_dose_logs (medication_post_id, date)`);
    // Unique constraint for upsert ON CONFLICT support
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS idx_${s}_dose_logs_unique ON ${s}.medication_dose_logs (medication_post_id, scheduled_time, date)`);
  }
}

export async function getDoseLogsByDate(schemaName: string, date: string): Promise<DoseLog[]> {
  const s = escapeSchema(schemaName);
  const rows = await prisma.$queryRawUnsafe<DoseLog[]>(
    `SELECT id, medication_post_id as "medicationPostId", scheduled_time as "scheduledTime",
            taken_at as "takenAt", date, status, created_at as "createdAt"
     FROM ${s}.medication_dose_logs
     WHERE date = $1::date
     ORDER BY scheduled_time ASC`,
    date
  );
  return rows.map(r => ({ ...r, id: Number(r.id), medicationPostId: Number(r.medicationPostId) }));
}

export async function upsertDoseLog(
  schemaName: string,
  medicationPostId: number,
  scheduledTime: string,
  date: string,
  status: string,
  takenAt: string | null
): Promise<DoseLog> {
  const s = escapeSchema(schemaName);

  // Use INSERT ... ON CONFLICT to avoid race conditions between check-and-insert
  const result = await prisma.$queryRawUnsafe<DoseLog[]>(
    `INSERT INTO ${s}.medication_dose_logs (medication_post_id, scheduled_time, date, status, taken_at)
     VALUES ($1, $2::time, $3::date, $4, $5)
     ON CONFLICT (medication_post_id, scheduled_time, date)
     DO UPDATE SET status = EXCLUDED.status, taken_at = EXCLUDED.taken_at
     RETURNING id, medication_post_id as "medicationPostId", scheduled_time as "scheduledTime",
               taken_at as "takenAt", date, status, created_at as "createdAt"`,
    medicationPostId,
    scheduledTime,
    date,
    status,
    takenAt
  );
  return { ...result[0], id: Number(result[0].id), medicationPostId: Number(result[0].medicationPostId) };
}

// =============================================================================
// Post-Taxonomy Relationships
// =============================================================================

export async function addTaxonomyToPost(schemaName: string, postId: number, taxonomyId: number): Promise<void> {
  const s = escapeSchema(schemaName);
  await prisma.$executeRawUnsafe(
    `INSERT INTO ${s}.post_taxonomies (post_id, tax_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    postId,
    taxonomyId
  );
}

export async function removeTaxonomyFromPost(schemaName: string, postId: number, taxonomyId: number): Promise<void> {
  const s = escapeSchema(schemaName);
  await prisma.$executeRawUnsafe(
    `DELETE FROM ${s}.post_taxonomies WHERE post_id = $1 AND tax_id = $2`,
    postId,
    taxonomyId
  );
}

export async function getPostTaxonomies(schemaName: string, postId: number): Promise<TenantTaxonomy[]> {
  const s = escapeSchema(schemaName);
  return prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `SELECT t.id, t.name, t.icon, t.color
     FROM ${s}.taxonomies t
     JOIN ${s}.post_taxonomies pt ON t.id = pt.tax_id
     WHERE pt.post_id = $1
     ORDER BY t.name`,
    postId
  );
}

export async function setPostTaxonomies(schemaName: string, postId: number, taxonomyIds: number[]): Promise<void> {
  const s = escapeSchema(schemaName);
  // Wrap in transaction to prevent partial taxonomy state on failure
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`DELETE FROM ${s}.post_taxonomies WHERE post_id = $1`, postId);
    for (const taxId of taxonomyIds) {
      await tx.$executeRawUnsafe(
        `INSERT INTO ${s}.post_taxonomies (post_id, tax_id) VALUES ($1, $2)`,
        postId,
        taxId
      );
    }
  });
}
