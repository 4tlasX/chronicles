"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeSchema = void 0;
exports.registerTenant = registerTenant;
exports.deleteTenant = deleteTenant;
exports.getTenantSchema = getTenantSchema;
exports.generateSchemaName = generateSchemaName;
exports.generateTenantSchemaStatements = generateTenantSchemaStatements;
exports.createTenantSchema = createTenantSchema;
exports.dropTenantSchema = dropTenantSchema;
exports.tenantSchemaExists = tenantSchemaExists;
const crypto_1 = __importDefault(require("crypto"));
const prisma_js_1 = require("./prisma.js");
const escapeSchema_js_1 = require("./escapeSchema.js");
Object.defineProperty(exports, "escapeSchema", { enumerable: true, get: function () { return escapeSchema_js_1.escapeSchema; } });
// =============================================================================
// Tenant Schema Manager
// =============================================================================
async function generateSchemaName() {
    const randomSuffix = crypto_1.default.randomBytes(3).toString('hex');
    // Atomic increment + read via RETURNING to prevent race conditions
    const result = await prisma_js_1.prisma.$queryRaw `
    INSERT INTO schema_counter (id, current_number, updated_at)
    VALUES (1, 1, NOW())
    ON CONFLICT (id) DO UPDATE
    SET current_number = schema_counter.current_number + 1, updated_at = NOW()
    RETURNING current_number
  `;
    const currentNumber = Number(result[0]?.current_number) || 1;
    return `usr_${currentNumber}_${randomSuffix}`;
}
function generateTenantSchemaStatements(schemaName) {
    const s = (0, escapeSchema_js_1.escapeSchema)(schemaName);
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
      color VARCHAR(7),
      sort_order INTEGER DEFAULT 0
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
        // Medication dose logs
        `CREATE TABLE ${s}.medication_dose_logs (
      id SERIAL PRIMARY KEY,
      medication_post_id INTEGER NOT NULL REFERENCES ${s}.posts(id) ON DELETE CASCADE,
      scheduled_time TIME NOT NULL,
      taken_at TEXT,
      date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
        `CREATE INDEX idx_${s}_dose_logs_date ON ${s}.medication_dose_logs (date)`,
        `CREATE INDEX idx_${s}_dose_logs_med_date ON ${s}.medication_dose_logs (medication_post_id, date)`,
        `CREATE UNIQUE INDEX idx_${s}_dose_logs_unique ON ${s}.medication_dose_logs (medication_post_id, scheduled_time, date)`,
        // Indexes
        `CREATE INDEX idx_${s}_posts_meta ON ${s}.posts USING GIN (metadata)`,
        `CREATE INDEX idx_${s}_posts_created ON ${s}.posts (created_at DESC)`,
        // Record initial schema version
        `INSERT INTO ${s}._migrations (version, name) VALUES (1, 'initial_schema')`,
        // Seed default topics
        `INSERT INTO ${s}.taxonomies (name, icon, color) VALUES
      ('Task', 'circle-check', '#3B82F6'),
      ('Goal', 'bullseye', '#8B5CF6'),
      ('Milestone', 'flag', '#6366F1'),
      ('Idea', 'lightbulb', '#F59E0B'),
      ('Research', 'magnifying-glass', '#10B981'),
      ('Event', 'calendar', '#F59E0B'),
      ('Meeting', 'users', '#EC4899'),
      ('Food', 'utensils', '#F97316'),
      ('Exercise', 'dumbbell', '#EF4444'),
      ('Medication', 'pills', '#14B8A6'),
      ('Symptom', 'flask', '#EF4444'),
      ('Music', 'music', '#EC4899'),
      ('Books', 'book', '#8B5CF6'),
      ('TV/Movies', 'film', '#F59E0B'),
      ('Quote', 'quote-left', '#6366F1')`,
    ];
}
async function createTenantSchema(schemaName) {
    const statements = generateTenantSchemaStatements(schemaName);
    for (const sql of statements) {
        await prisma_js_1.prisma.$executeRawUnsafe(sql);
    }
}
async function dropTenantSchema(schemaName) {
    const escaped = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    await prisma_js_1.prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS ${escaped} CASCADE`);
}
async function tenantSchemaExists(schemaName) {
    const escaped = (0, escapeSchema_js_1.escapeSchema)(schemaName);
    const result = await prisma_js_1.prisma.$queryRaw `
    SELECT EXISTS (
      SELECT 1 FROM information_schema.schemata
      WHERE schema_name = ${escaped}
    ) as exists
  `;
    return result[0]?.exists || false;
}
async function registerTenant(email, username, passwordHash, encryptionParams) {
    const schemaName = await generateSchemaName();
    const account = await prisma_js_1.prisma.account.create({
        data: {
            email,
            username,
            passwordHash,
            tenantSchemaName: schemaName,
            ...(encryptionParams && {
                kekSalt: new Uint8Array(encryptionParams.kekSalt),
                encryptedMasterKey: new Uint8Array(encryptionParams.encryptedMasterKey),
                kekWrapIv: new Uint8Array(encryptionParams.kekWrapIv),
                recoveryWrappedMK: new Uint8Array(encryptionParams.recoveryWrappedMK),
                recoveryWrapIv: new Uint8Array(encryptionParams.recoveryWrapIv),
                recoveryKeyHash: encryptionParams.recoveryKeyHash,
                recoveryKeySalt: encryptionParams.recoveryKeySalt,
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
async function deleteTenant(userId) {
    const account = await prisma_js_1.prisma.account.findUnique({ where: { userId } });
    if (!account)
        throw new Error('Account not found');
    // Drop schema and delete account in sequence — schema drop is DDL (can't be in Prisma transaction)
    // but we delete the account only if schema drop succeeds
    await dropTenantSchema(account.tenantSchemaName);
    await prisma_js_1.prisma.account.delete({ where: { userId } });
}
async function getTenantSchema(userId) {
    const account = await prisma_js_1.prisma.account.findUnique({
        where: { userId },
        select: { tenantSchemaName: true },
    });
    return account?.tenantSchemaName || null;
}
