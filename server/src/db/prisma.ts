import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}
if (process.env.NODE_ENV === 'production' && !databaseUrl.includes('sslmode=require')) {
  throw new Error('DATABASE_URL must include sslmode=require in production');
}

export const prisma = new PrismaClient();
