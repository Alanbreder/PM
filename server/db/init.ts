import { createPool } from '../../src/db/index.js';

export async function ensureExperimentsTableExists() {
  const pool = createPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS experiments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
        hypothesis_id UUID NOT NULL REFERENCES hypotheses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        method TEXT NOT NULL,
        success_criteria TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        result TEXT,
        learning TEXT,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_experiments_workspace_id ON experiments(workspace_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_experiments_hypothesis_id ON experiments(hypothesis_id);
    `);
    console.log('[DB Init] Experiments table checked/created successfully.');
  } catch (err: any) {
    console.error('[DB Init Error] Failed to ensure experiments table exists:', err);
  }
}
