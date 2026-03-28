import crypto from 'crypto';
import { prisma } from './prisma.js';

// =============================================================================
// Tenant Schema Manager
// =============================================================================

function escapeSchemaName(schemaName: string): string {
  return schemaName.replace(/[^a-z0-9_]/gi, '');
}

async function generateSchemaName(): Promise<string> {
  const randomSuffix = crypto.randomBytes(3).toString('hex');

  await prisma.$executeRaw`
    INSERT INTO schema_counter (id, current_number, updated_at)
    VALUES (1, 1, NOW())
    ON CONFLICT (id) DO UPDATE
    SET current_number = schema_counter.current_number + 1, updated_at = NOW()
  `;

  const counter = await prisma.schemaCounter.findUnique({ where: { id: 1 } });
  const currentNumber = counter?.currentNumber || 1;
  return `usr_${currentNumber}_${randomSuffix}`;
}

function generateTenantSchemaStatements(schemaName: string): string[] {
  const s = escapeSchemaName(schemaName);

  return [
    `CREATE SCHEMA ${s}`,

    // Migrations tracking table
    `CREATE TABLE ${s}._migrations (
      version INT PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Settings table
    `CREATE TABLE ${s}.settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Taxonomies table
    `CREATE TABLE ${s}.taxonomies (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      icon TEXT,
      color VARCHAR(7)
    )`,

    // Posts table (supports both plaintext and encrypted)
    `CREATE TABLE ${s}.posts (
      id SERIAL PRIMARY KEY,
      content TEXT,
      metadata JSONB DEFAULT '{}',
      content_encrypted BYTEA,
      content_iv BYTEA,
      metadata_encrypted BYTEA,
      metadata_iv BYTEA,
      is_encrypted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,

    // Post-Taxonomy relationships
    `CREATE TABLE ${s}.post_taxonomies (
      post_id INTEGER REFERENCES ${s}.posts(id) ON DELETE CASCADE,
      tax_id INTEGER REFERENCES ${s}.taxonomies(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tax_id)
    )`,

    // Indexes
    `CREATE INDEX idx_${s}_posts_meta ON ${s}.posts USING GIN (metadata)`,
    `CREATE INDEX idx_${s}_posts_created ON ${s}.posts (created_at DESC)`,

    // Record initial schema version
    `INSERT INTO ${s}._migrations (version, name) VALUES (1, 'initial_schema')`,

    // Seed default topics
    `INSERT INTO ${s}.taxonomies (name, icon, color) VALUES
      ('Task', 'circle-check', '#3B82F6'),
      ('Idea', 'lightbulb', '#8B5CF6'),
      ('Research', 'magnifying-glass', '#10B981'),
      ('Event', 'calendar', '#F59E0B'),
      ('Meeting', 'users', '#EC4899'),
      ('Symptom', 'flask', '#EF4444'),
      ('Music', 'music', '#EC4899'),
      ('Books', 'book', '#8B5CF6'),
      ('TV/Movies', 'film', '#F59E0B'),
      ('Quote', 'quote-left', '#6366F1')`,
  ];
}

async function createTenantSchema(schemaName: string): Promise<void> {
  const statements = generateTenantSchemaStatements(schemaName);
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }
}

async function dropTenantSchema(schemaName: string): Promise<void> {
  const escaped = escapeSchemaName(schemaName);
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS ${escaped} CASCADE`);
}

async function tenantSchemaExists(schemaName: string): Promise<boolean> {
  const escaped = escapeSchemaName(schemaName);
  const result = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.schemata
      WHERE schema_name = ${escaped}
    ) as exists
  `;
  return result[0]?.exists || false;
}

// =============================================================================
// Registration
// =============================================================================

export interface EncryptionSetupParams {
  kekSalt: Uint8Array;
  encryptedMasterKey: Uint8Array;
  kekWrapIv: Uint8Array;
  recoveryWrappedMK: Uint8Array;
  recoveryWrapIv: Uint8Array;
}

export async function registerTenant(
  email: string,
  username: string,
  passwordHash: string,
  encryptionParams?: EncryptionSetupParams
) {
  const schemaName = await generateSchemaName();

  const account = await prisma.account.create({
    data: {
      email,
      username,
      passwordHash,
      tenantSchemaName: schemaName,
      ...(encryptionParams && {
        kekSalt: new Uint8Array(encryptionParams.kekSalt) as Uint8Array<ArrayBuffer>,
        encryptedMasterKey: new Uint8Array(encryptionParams.encryptedMasterKey) as Uint8Array<ArrayBuffer>,
        kekWrapIv: new Uint8Array(encryptionParams.kekWrapIv) as Uint8Array<ArrayBuffer>,
        recoveryWrappedMK: new Uint8Array(encryptionParams.recoveryWrappedMK) as Uint8Array<ArrayBuffer>,
        recoveryWrapIv: new Uint8Array(encryptionParams.recoveryWrapIv) as Uint8Array<ArrayBuffer>,
        encryptionEnabled: true,
      }),
    },
  });

  await createTenantSchema(schemaName);

  return {
    account: {
      id: account.id,
      userId: account.userId,
      email: account.email,
      username: account.username,
      tenantSchemaName: account.tenantSchemaName,
      createdAt: account.createdAt,
      encryptionEnabled: account.encryptionEnabled,
    },
    schemaName,
  };
}

export async function deleteTenant(userId: string): Promise<void> {
  const account = await prisma.account.findUnique({ where: { userId } });
  if (!account) throw new Error(`Account not found for userId: ${userId}`);
  await dropTenantSchema(account.tenantSchemaName);
  await prisma.account.delete({ where: { userId } });
}

export async function getTenantSchema(userId: string): Promise<string | null> {
  const account = await prisma.account.findUnique({
    where: { userId },
    select: { tenantSchemaName: true },
  });
  return account?.tenantSchemaName || null;
}

export {
  escapeSchemaName,
  generateSchemaName,
  generateTenantSchemaStatements,
  createTenantSchema,
  dropTenantSchema,
  tenantSchemaExists,
};
