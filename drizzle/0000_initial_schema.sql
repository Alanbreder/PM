-- Migration 0000: Initial Schema for Product OS SIP

-- Users table (mirrors Firebase Auth)
CREATE TABLE IF NOT EXISTS "users" (
  "uid" varchar(255) PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "name" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS "workspaces" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL UNIQUE,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Workspace Members
CREATE TABLE IF NOT EXISTS "workspace_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "user_id" varchar(255) NOT NULL REFERENCES "users"("uid") ON DELETE cascade,
  "role" varchar(50) DEFAULT 'member' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_wm_workspace_user" ON "workspace_members" ("workspace_id", "user_id");

-- Researches table
CREATE TABLE IF NOT EXISTS "researches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "title" varchar(255) NOT NULL,
  "objective" text,
  "target_audience" text,
  "raw_notes" text,
  "key_findings" jsonb,
  "suggested_problems" jsonb,
  "analysis_status" varchar(50) DEFAULT 'pending' NOT NULL,
  "status" varchar(50) DEFAULT 'draft' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "unq_researches_id_workspace" UNIQUE ("id", "workspace_id")
);

CREATE INDEX IF NOT EXISTS "idx_researches_workspace" ON "researches" ("workspace_id");

-- Evidences table
CREATE TABLE IF NOT EXISTS "evidences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "research_id" uuid,
  "content" text NOT NULL,
  "source" varchar(255),
  "origin_type" varchar(50),
  "notes" text,
  "impact_score" integer DEFAULT 3 NOT NULL,
  "tags" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "unq_evidences_id_workspace" UNIQUE ("id", "workspace_id"),
  CONSTRAINT "fk_evidences_research_workspace" FOREIGN KEY ("research_id", "workspace_id") REFERENCES "researches"("id", "workspace_id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_evidences_workspace" ON "evidences" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_evidences_research" ON "evidences" ("research_id");

-- Problems table
CREATE TABLE IF NOT EXISTS "problems" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "impact" varchar(50) DEFAULT 'medium' NOT NULL,
  "frequency" varchar(50) DEFAULT 'occasional' NOT NULL,
  "status" varchar(50) DEFAULT 'identified' NOT NULL,
  "score" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "unq_problems_id_workspace" UNIQUE ("id", "workspace_id")
);

CREATE INDEX IF NOT EXISTS "idx_problems_workspace" ON "problems" ("workspace_id");

-- Problem Evidences Junction
CREATE TABLE IF NOT EXISTS "problem_evidences" (
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "problem_id" uuid NOT NULL,
  "evidence_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("problem_id", "evidence_id"),
  CONSTRAINT "fk_pe_problem_workspace" FOREIGN KEY ("problem_id", "workspace_id") REFERENCES "problems"("id", "workspace_id") ON DELETE cascade,
  CONSTRAINT "fk_pe_evidence_workspace" FOREIGN KEY ("evidence_id", "workspace_id") REFERENCES "evidences"("id", "workspace_id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_pe_workspace" ON "problem_evidences" ("workspace_id");

-- Opportunities table
CREATE TABLE IF NOT EXISTS "opportunities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "title" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "effort" varchar(50) DEFAULT 'medium' NOT NULL,
  "value" varchar(50) DEFAULT 'medium' NOT NULL,
  "status" varchar(50) DEFAULT 'backlog' NOT NULL,
  "score" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "unq_opportunities_id_workspace" UNIQUE ("id", "workspace_id")
);

CREATE INDEX IF NOT EXISTS "idx_opportunities_workspace" ON "opportunities" ("workspace_id");

-- Opportunity Problems Junction
CREATE TABLE IF NOT EXISTS "opportunity_problems" (
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "opportunity_id" uuid NOT NULL,
  "problem_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  PRIMARY KEY ("opportunity_id", "problem_id"),
  CONSTRAINT "fk_op_opportunity_workspace" FOREIGN KEY ("opportunity_id", "workspace_id") REFERENCES "opportunities"("id", "workspace_id") ON DELETE cascade,
  CONSTRAINT "fk_op_problem_workspace" FOREIGN KEY ("problem_id", "workspace_id") REFERENCES "problems"("id", "workspace_id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_op_workspace" ON "opportunity_problems" ("workspace_id");

-- Hypotheses table
CREATE TABLE IF NOT EXISTS "hypotheses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "opportunity_id" uuid,
  "title" varchar(255) NOT NULL,
  "statement" text NOT NULL,
  "metrics_to_validate" text,
  "confidence_score" integer DEFAULT 3,
  "status" varchar(50) DEFAULT 'draft' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "unq_hypotheses_id_workspace" UNIQUE ("id", "workspace_id"),
  CONSTRAINT "fk_hypotheses_opportunity_workspace" FOREIGN KEY ("opportunity_id", "workspace_id") REFERENCES "opportunities"("id", "workspace_id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_hypotheses_workspace" ON "hypotheses" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_hypotheses_opportunity" ON "hypotheses" ("opportunity_id");

-- Experiments table
CREATE TABLE IF NOT EXISTS "experiments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "hypothesis_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "methodology" text,
  "sample_size" integer,
  "status" varchar(50) DEFAULT 'draft' NOT NULL,
  "results" text,
  "learnings" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "chk_experiment_status" CHECK ("status" IN ('draft', 'running', 'completed', 'cancelled')),
  CONSTRAINT "unq_experiments_id_workspace" UNIQUE ("id", "workspace_id"),
  CONSTRAINT "fk_experiments_hypothesis_workspace" FOREIGN KEY ("hypothesis_id", "workspace_id") REFERENCES "hypotheses"("id", "workspace_id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_experiments_workspace" ON "experiments" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_experiments_hypothesis" ON "experiments" ("hypothesis_id");

-- Decisions table
CREATE TABLE IF NOT EXISTS "decisions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
  "experiment_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "description" text,
  "decision" text NOT NULL,
  "rationale" text,
  "status" varchar(50) DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "chk_decision_status" CHECK ("status" IN ('pending', 'accepted', 'rejected', 'deferred')),
  CONSTRAINT "unq_decisions_id_workspace" UNIQUE ("id", "workspace_id"),
  CONSTRAINT "fk_decisions_experiment_workspace" FOREIGN KEY ("experiment_id", "workspace_id") REFERENCES "experiments"("id", "workspace_id") ON DELETE cascade
);

CREATE INDEX IF NOT EXISTS "idx_decisions_workspace" ON "decisions" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_decisions_experiment" ON "decisions" ("experiment_id");
