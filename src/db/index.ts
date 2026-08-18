import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import * as schema from './schema.js';

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
let dbReadyPromise: Promise<void> = Promise.resolve();

if (!isPlaceholder && (!isTest || process.env.USE_REAL_POSTGRES_IN_TEST === 'true')) {
  poolInstance = new pg.Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  });
  dbInstance = drizzleNodePg(poolInstance, { schema });
} else {
  if (isProd) {
    throw new Error('FATAL: A variável de ambiente DATABASE_URL é obrigatória e deve ser válida em produção.');
  }

  // Use embedded PostgreSQL engine (PGlite) for local development/testing with persistent data
  const dataDir = isTest ? undefined : path.resolve(process.cwd(), '.pgdata');
  if (dataDir && !fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pglite = new PGlite(dataDir);
  dbInstance = drizzlePglite(pglite, { schema }) as unknown as ReturnType<typeof drizzleNodePg<typeof schema>>;

  const initPglite = async () => {
    // Bootstrap schema migrations into PGlite automatically
    const migrationFiles = [
      '0000_initial_schema.sql',
      '0001_product_insights.sql',
      '0002_roadmap_initiatives.sql',
      '0003_full_product_os_mvp.sql',
    ];

    for (const file of migrationFiles) {
      try {
        const filePath = path.resolve(process.cwd(), 'drizzle', file);
        if (fs.existsSync(filePath)) {
          const sql = fs.readFileSync(filePath, 'utf8');
          await pglite.exec(sql);
        }
      } catch (err) {
        console.error(`Erro ao aplicar migração ${file} no PGlite:`, err);
      }
    }
  };

  dbReadyPromise = initPglite();
}

export const pool = poolInstance;
export const db = dbInstance;
export { dbReadyPromise };


