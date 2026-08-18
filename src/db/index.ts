import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema.js';
import { runMigrations } from './migrator.js';

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
let connectionString = process.env.DATABASE_URL;

// Ignore placeholder strings in dev/test
const isPlaceholder = !connectionString || 
  connectionString.includes('usuario:senha@host') || 
  connectionString.includes('dummy') ||
  connectionString === 'postgresql://';

let dbInstance: ReturnType<typeof drizzleNodePg<typeof schema>>;
let poolInstance: pg.Pool | null = null;
let dbReadyPromise: Promise<{ applied: string[]; skipped: string[] }>;

if (!isPlaceholder && (!isTest || process.env.USE_REAL_POSTGRES_IN_TEST === 'true')) {
  console.log('[Database] 🐘 Conectando ao PostgreSQL Real via DATABASE_URL...');
  poolInstance = new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  dbInstance = drizzleNodePg(poolInstance, { schema });
  // Run migrations safely and idempotently on Real PostgreSQL
  dbReadyPromise = runMigrations(poolInstance);
} else {
  if (isProd) {
    throw new Error('FATAL: A variável de ambiente DATABASE_URL é obrigatória e deve ser válida em produção.');
  }

  // Use embedded PostgreSQL engine (PGlite) for local development/testing with persistent data
  console.log('[Database] 💾 Conectando ao motor PostgreSQL Local PGlite (.pgdata)...');
  const dataDir = isTest ? undefined : path.resolve(process.cwd(), '.pgdata');
  if (dataDir && !fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite = new PGlite(dataDir);
  dbInstance = drizzlePglite(pglite, { schema }) as unknown as ReturnType<typeof drizzleNodePg<typeof schema>>;
  // Run migrations safely and idempotently on PGlite
  dbReadyPromise = runMigrations(pglite);
}

export const pool = poolInstance;
export const db = dbInstance;
export { dbReadyPromise };


