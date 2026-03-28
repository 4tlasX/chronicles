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
  const result = await prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `INSERT INTO ${s}.taxonomies (name, icon, color)
     VALUES ($1, $2, $3)
     RETURNING id, name, icon, color`,
    name,
    options?.icon ?? null,
    options?.color ?? null
  );
  return { ...result[0], id: Number(result[0].id) };
}

export async function getTaxonomy(schemaName: string, id: number): Promise<TenantTaxonomy | null> {
  const s = escapeSchema(schemaName);
  const result = await prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `SELECT id, name, icon, color FROM ${s}.taxonomies WHERE id = $1`,
    id
  );
  return result[0] || null;
}

export async function getAllTaxonomies(schemaName: string): Promise<TenantTaxonomy[]> {
  const s = escapeSchema(schemaName);
  const rows = await prisma.$queryRawUnsafe<TenantTaxonomy[]>(
    `SELECT id, name, icon, color FROM ${s}.taxonomies ORDER BY name`
  );
  // Prisma raw queries return BigInt for integer columns — convert to Number
  return rows.map(r => ({ ...r, id: Number(r.id) }));
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
    `UPDATE ${s}.taxonomies SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, icon, color`,
    ...values
  );
  return result[0];
}

export async function deleteTaxonomy(schemaName: string, id: number): Promise<void> {
  const s = escapeSchema(schemaName);
  await prisma.$executeRawUnsafe(`DELETE FROM ${s}.taxonomies WHERE id = $1`, id);
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
  // Remove all existing
  await prisma.$executeRawUnsafe(`DELETE FROM ${s}.post_taxonomies WHERE post_id = $1`, postId);
  // Add new ones
  for (const taxId of taxonomyIds) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO ${s}.post_taxonomies (post_id, tax_id) VALUES ($1, $2)`,
      postId,
      taxId
    );
  }
}
