import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma';

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
  connectionString,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });