-- Migration 0003: Cross-tenant database integrity constraints
-- Adds composite unique keys and composite foreign keys to enforce tenant isolation at PostgreSQL level

DO $$
BEGIN
  -- 1. Composite UNIQUE constraints on parent entities (id, workspace_id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_researches_id_workspace'
  ) THEN
    ALTER TABLE "researches" ADD CONSTRAINT "uq_researches_id_workspace" UNIQUE ("id", "workspace_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_evidences_id_workspace'
  ) THEN
    ALTER TABLE "evidences" ADD CONSTRAINT "uq_evidences_id_workspace" UNIQUE ("id", "workspace_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_problems_id_workspace'
  ) THEN
    ALTER TABLE "problems" ADD CONSTRAINT "uq_problems_id_workspace" UNIQUE ("id", "workspace_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_opportunities_id_workspace'
  ) THEN
    ALTER TABLE "opportunities" ADD CONSTRAINT "uq_opportunities_id_workspace" UNIQUE ("id", "workspace_id");
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_hypotheses_id_workspace'
  ) THEN
    ALTER TABLE "hypotheses" ADD CONSTRAINT "uq_hypotheses_id_workspace" UNIQUE ("id", "workspace_id");
  END IF;

  -- 2. Composite Foreign Keys on problem_evidences
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_problem_evidences_problem_ws'
  ) THEN
    ALTER TABLE "problem_evidences"
      ADD CONSTRAINT "fk_problem_evidences_problem_ws"
      FOREIGN KEY ("problem_id", "workspace_id")
      REFERENCES "problems" ("id", "workspace_id")
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_problem_evidences_evidence_ws'
  ) THEN
    ALTER TABLE "problem_evidences"
      ADD CONSTRAINT "fk_problem_evidences_evidence_ws"
      FOREIGN KEY ("evidence_id", "workspace_id")
      REFERENCES "evidences" ("id", "workspace_id")
      ON DELETE CASCADE;
  END IF;

  -- 3. Composite Foreign Keys on opportunity_problems
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_opportunity_problems_opp_ws'
  ) THEN
    ALTER TABLE "opportunity_problems"
      ADD CONSTRAINT "fk_opportunity_problems_opp_ws"
      FOREIGN KEY ("opportunity_id", "workspace_id")
      REFERENCES "opportunities" ("id", "workspace_id")
      ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_opportunity_problems_problem_ws'
  ) THEN
    ALTER TABLE "opportunity_problems"
      ADD CONSTRAINT "fk_opportunity_problems_problem_ws"
      FOREIGN KEY ("problem_id", "workspace_id")
      REFERENCES "problems" ("id", "workspace_id")
      ON DELETE CASCADE;
  END IF;

  -- 4. Composite Foreign Key on hypotheses
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_hypotheses_opp_ws'
  ) THEN
    ALTER TABLE "hypotheses"
      ADD CONSTRAINT "fk_hypotheses_opp_ws"
      FOREIGN KEY ("opportunity_id", "workspace_id")
      REFERENCES "opportunities" ("id", "workspace_id")
      ON DELETE CASCADE;
  END IF;

  -- 5. Composite Foreign Key on experiments
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_experiments_hyp_ws'
  ) THEN
    ALTER TABLE "experiments"
      ADD CONSTRAINT "fk_experiments_hyp_ws"
      FOREIGN KEY ("hypothesis_id", "workspace_id")
      REFERENCES "hypotheses" ("id", "workspace_id")
      ON DELETE CASCADE;
  END IF;

  -- 6. Composite Foreign Key on evidences
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_evidences_research_ws'
  ) THEN
    ALTER TABLE "evidences"
      ADD CONSTRAINT "fk_evidences_research_ws"
      FOREIGN KEY ("research_id", "workspace_id")
      REFERENCES "researches" ("id", "workspace_id")
      ON DELETE CASCADE;
  END IF;

END $$;
