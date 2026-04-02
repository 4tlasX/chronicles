import { z } from 'zod';

// Auth validation
export const emailSchema = z.string().email('Invalid email address');
export const usernameSchema = z.string().min(3, 'Username must be at least 3 characters').max(30);
export const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  encryptedMasterKey: z.string().min(1),
  kekSalt: z.string().min(1),
  kekWrapIv: z.string().min(1),
  recoveryWrappedMK: z.string().min(1),
  recoveryWrapIv: z.string().min(1),
  recoveryKeyHash: z.string().min(1),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  newEncryptedMasterKey: z.string().min(1),
  newKekSalt: z.string().min(1),
  newKekWrapIv: z.string().min(1),
});

export const recoverSchema = z.object({
  email: emailSchema,
  recoveryKey: z.string().min(1, 'Recovery key is required'),
  newPassword: passwordSchema,
  newEncryptedMasterKey: z.string().min(1),
  newKekSalt: z.string().min(1),
  newKekWrapIv: z.string().min(1),
});

// Shares validation
export const createShareSchema = z.object({
  contentEncrypted: z.string().min(1, 'contentEncrypted is required'),
  contentIv: z.string().min(1, 'contentIv is required'),
  expiresAt: z.string().datetime().nullable().optional(),
});

// Post validation
export const createPostSchema = z.object({
  content: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  contentEncrypted: z.string().optional(),
  contentIv: z.string().optional(),
  metadataEncrypted: z.string().optional(),
  metadataIv: z.string().optional(),
  isEncrypted: z.boolean().optional(),
  taxonomyIds: z.array(z.number()).optional(),
});

export const updatePostSchema = z.object({
  content: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  contentEncrypted: z.string().optional(),
  contentIv: z.string().optional(),
  metadataEncrypted: z.string().optional(),
  metadataIv: z.string().optional(),
  taxonomyIds: z.array(z.number()).optional(),
});

// Taxonomy validation
export const createTaxonomySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
});

export const updateTaxonomySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// Settings validation
export const upsertSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
});
