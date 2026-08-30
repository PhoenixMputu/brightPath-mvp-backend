import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  max: process.env.NODE_ENV === 'production' ? 10 : 5, // Reduced from 15
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000, // Increased from 10000
  ssl: connectionString?.includes('sslmode=') ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });