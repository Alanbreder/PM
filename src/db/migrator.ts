import fs from 'fs';
import path from 'path';
import type pg from 'pg';
import type { PGlite } from '@electric-sql/pglite';

export interface MigrationRunner {
  query: (sqlText: string, params?: any[]) => Promise<{ rows: any[] }>;
  exec?: (sqlText: string) => Promise<any>;
}

export const MIGRATION_FILES = [
  '0000_initial_schema.sql',
  '0001_product_insights.sql',
  '0002_roadmap_initiatives.sql',
  '0003_full_product_os_mvp.sql',
] as const;

/**
 * Universal, idempotent migration runner for both Real PostgreSQL and local PGlite.
 * Ensures fresh/empty databases are fully provisioned and existing databases remain untouched.
 */
export async function runMigrations(dbTarget: pg.Pool | PGlite): Promise<{ applied: string[]; skipped: string[] }> {
  const applied: string[] = [];
  const skipped: string[] = [];

  // Adapt target to unified query interface
  const isPgPool = 'connect' in dbTarget && typeof (dbTarget as pg.Pool).connect === 'function';

  const executeSql = async (sqlText: string): Promise<void> => {
    if (isPgPool) {
      const client = await (dbTarget as pg.Pool).connect();
      try {
        await client.query(sqlText);
      } finally {
        client.release();
      }
    } else {
      await (dbTarget as PGlite).exec(sqlText);
    }
  };

  const queryRows = async (sqlText: string): Promise<any[]> => {
    if (isPgPool) {
      const res = await (dbTarget as pg.Pool).query(sqlText);
      return res.rows;
    } else {
      const res = await (dbTarget as PGlite).query(sqlText);
      return res.rows;
    }
  };

  // 1. Ensure migrations tracking table exists
  await executeSql(`
    CREATE TABLE IF NOT EXISTS "__schema_migrations" (
      "id" varchar(255) PRIMARY KEY,
      "applied_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  // 2. Read already applied migrations
  const existingRows = await queryRows(`SELECT id FROM "__schema_migrations";`);
  const appliedSet = new Set(existingRows.map((r: any) => r.id));

  // 3. Apply pending migrations in strict sequential order
  for (const file of MIGRATION_FILES) {
    if (appliedSet.has(file)) {
      skipped.push(file);
      continue;
    }

    const filePath = path.resolve(process.cwd(), 'drizzle', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[Migrator] Arquivo de migração não encontrado no disco: ${filePath}`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      console.log(`[Migrator] Aplicando migração: ${file}...`);
      await executeSql(sql);

      // Record migration as applied
      if (isPgPool) {
        const client = await (dbTarget as pg.Pool).connect();
        try {
          await client.query(`INSERT INTO "__schema_migrations" ("id", "applied_at") VALUES ($1, now()) ON CONFLICT ("id") DO NOTHING;`, [file]);
        } finally {
          client.release();
        }
      } else {
        await (dbTarget as PGlite).query(
          `INSERT INTO "__schema_migrations" ("id", "applied_at") VALUES ($1, now()) ON CONFLICT ("id") DO NOTHING;`,
          [file]
        );
      }

      applied.push(file);
      console.log(`[Migrator] ✅ Migração ${file} aplicada com sucesso.`);
    } catch (err) {
      console.error(`[Migrator] ❌ Erro ao aplicar migração ${file}:`, err instanceof Error ? err.message : err);
      throw new Error(`Falha crítica na migração ${file}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { applied, skipped };
}
