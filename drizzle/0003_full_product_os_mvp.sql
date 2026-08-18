-- Migration 0003: Product OS MVP Completo
-- Objectives & Key Results, Personas & Customer Segments, Prioritization, PRDs & User Stories, Outcomes, Collaboration & Toolkit

-- 1. Objectives Table
CREATE TABLE IF NOT EXISTS "objectives" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "description" text,
  "timeframe" varchar(50) NOT NULL DEFAULT 'Q1-2026',
  "status" varchar(50) NOT NULL DEFAULT 'active',
  "progress" integer NOT NULL DEFAULT 0,
  "owner_name" varchar(255),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_objectives_id_workspace" UNIQUE ("id", "workspace_id")
);
CREATE INDEX IF NOT EXISTS "idx_objectives_workspace" ON "objectives" ("workspace_id");

-- 2. Key Results Table
CREATE TABLE IF NOT EXISTS "key_results" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "objective_id" uuid NOT NULL,
  "title" varchar(255) NOT NULL,
  "metric_name" varchar(255) NOT NULL,
  "initial_value" integer NOT NULL DEFAULT 0,
  "target_value" integer NOT NULL,
  "current_value" integer NOT NULL DEFAULT 0,
  "unit" varchar(50) NOT NULL DEFAULT '%',
  "progress" integer NOT NULL DEFAULT 0,
  "status" varchar(50) NOT NULL DEFAULT 'on_track',
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "fk_kr_objective_workspace" FOREIGN KEY ("objective_id", "workspace_id") 
    REFERENCES "objectives"("id", "workspace_id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_kr_workspace" ON "key_results" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_kr_objective" ON "key_results" ("objective_id");

-- 3. Opportunity to Objectives/KRs Link Table
CREATE TABLE IF NOT EXISTS "opportunity_objectives" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "opportunity_id" uuid NOT NULL,
  "objective_id" uuid NOT NULL,
  "kr_id" uuid,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "fk_opp_obj_opportunity_workspace" FOREIGN KEY ("opportunity_id", "workspace_id")
    REFERENCES "opportunities"("id", "workspace_id") ON DELETE CASCADE,
  CONSTRAINT "fk_opp_obj_objective_workspace" FOREIGN KEY ("objective_id", "workspace_id")
    REFERENCES "objectives"("id", "workspace_id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_opp_obj_workspace" ON "opportunity_objectives" ("workspace_id");

-- 4. Prioritizations Table
CREATE TABLE IF NOT EXISTS "prioritizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "opportunity_id" uuid NOT NULL,
  "framework" varchar(50) NOT NULL DEFAULT 'rice',
  "reach" integer DEFAULT 100,
  "impact" integer DEFAULT 3,
  "confidence" integer DEFAULT 80,
  "effort" integer DEFAULT 3,
  "ice_impact" integer DEFAULT 7,
  "ice_confidence" integer DEFAULT 7,
  "ice_ease" integer DEFAULT 7,
  "user_business_value" integer DEFAULT 5,
  "time_criticality" integer DEFAULT 5,
  "risk_reduction" integer DEFAULT 5,
  "job_size" integer DEFAULT 3,
  "score" integer NOT NULL DEFAULT 0,
  "notes" text,
  "evaluator_name" varchar(255),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "fk_prioritization_opportunity_workspace" FOREIGN KEY ("opportunity_id", "workspace_id")
    REFERENCES "opportunities"("id", "workspace_id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_prioritizations_workspace" ON "prioritizations" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_prioritizations_opportunity" ON "prioritizations" ("opportunity_id");

-- 5. Personas Table
CREATE TABLE IF NOT EXISTS "personas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "role_title" varchar(255) NOT NULL,
  "segment" varchar(255),
  "description" text,
  "jobs_to_be_done" jsonb DEFAULT '[]'::jsonb,
  "pains" jsonb DEFAULT '[]'::jsonb,
  "goals" jsonb DEFAULT '[]'::jsonb,
  "behaviors" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_personas_id_workspace" UNIQUE ("id", "workspace_id")
);
CREATE INDEX IF NOT EXISTS "idx_personas_workspace" ON "personas" ("workspace_id");

-- 6. Customer Segments Table
CREATE TABLE IF NOT EXISTS "customer_segments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "type" varchar(50) NOT NULL DEFAULT 'b2b',
  "description" text,
  "criteria" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_customer_segments_id_workspace" UNIQUE ("id", "workspace_id")
);
CREATE INDEX IF NOT EXISTS "idx_customer_segments_workspace" ON "customer_segments" ("workspace_id");

-- 7. Entity Personas Link Table
CREATE TABLE IF NOT EXISTS "entity_personas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "persona_id" uuid NOT NULL,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "fk_entity_personas_persona_workspace" FOREIGN KEY ("persona_id", "workspace_id")
    REFERENCES "personas"("id", "workspace_id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_entity_personas_workspace" ON "entity_personas" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_entity_personas_entity" ON "entity_personas" ("entity_type", "entity_id");

-- 8. PRDs Table
CREATE TABLE IF NOT EXISTS "prds" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "roadmap_item_id" uuid,
  "title" varchar(255) NOT NULL,
  "summary" text,
  "problem_statement" text,
  "goals" jsonb DEFAULT '[]'::jsonb,
  "non_goals" jsonb DEFAULT '[]'::jsonb,
  "user_stories" jsonb DEFAULT '[]'::jsonb,
  "technical_notes" text,
  "dependencies" jsonb DEFAULT '[]'::jsonb,
  "definition_of_done" jsonb DEFAULT '[]'::jsonb,
  "status" varchar(50) NOT NULL DEFAULT 'draft',
  "version" integer NOT NULL DEFAULT 1,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_prds_id_workspace" UNIQUE ("id", "workspace_id"),
  CONSTRAINT "fk_prd_roadmap_workspace" FOREIGN KEY ("roadmap_item_id", "workspace_id")
    REFERENCES "roadmap_items"("id", "workspace_id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "idx_prds_workspace" ON "prds" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_prds_roadmap" ON "prds" ("roadmap_item_id");

-- 9. Outcome Reviews Table
CREATE TABLE IF NOT EXISTS "outcome_reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "roadmap_item_id" uuid,
  "prd_id" uuid,
  "title" varchar(255) NOT NULL,
  "metric_name" varchar(255) NOT NULL,
  "baseline_value" varchar(100) NOT NULL,
  "target_value" varchar(100) NOT NULL,
  "actual_value" varchar(100) NOT NULL,
  "timeframe_days" integer NOT NULL DEFAULT 30,
  "status" varchar(50) NOT NULL DEFAULT 'on_target',
  "what_we_expected" text,
  "what_happened" text,
  "what_we_learned" text,
  "next_actions" text,
  "refeed_to_discovery" integer DEFAULT 0,
  "new_problem_id" uuid,
  "reviewed_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_outcome_reviews_id_workspace" UNIQUE ("id", "workspace_id"),
  CONSTRAINT "fk_outcome_roadmap_workspace" FOREIGN KEY ("roadmap_item_id", "workspace_id")
    REFERENCES "roadmap_items"("id", "workspace_id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "idx_outcome_reviews_workspace" ON "outcome_reviews" ("workspace_id");

-- 10. Comments Table
CREATE TABLE IF NOT EXISTS "comments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" uuid NOT NULL,
  "author_id" varchar(255) NOT NULL,
  "author_name" varchar(255) NOT NULL,
  "author_email" varchar(255) NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_comments_id_workspace" UNIQUE ("id", "workspace_id")
);
CREATE INDEX IF NOT EXISTS "idx_comments_workspace" ON "comments" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_comments_entity" ON "comments" ("entity_type", "entity_id");

-- 11. Activity Logs Table
CREATE TABLE IF NOT EXISTS "activity_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "entity_type" varchar(50) NOT NULL,
  "entity_id" uuid NOT NULL,
  "action" varchar(50) NOT NULL,
  "actor_id" varchar(255) NOT NULL,
  "actor_name" varchar(255) NOT NULL,
  "actor_email" varchar(255) NOT NULL,
  "details" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_activity_logs_id_workspace" UNIQUE ("id", "workspace_id")
);
CREATE INDEX IF NOT EXISTS "idx_activity_logs_workspace" ON "activity_logs" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_entity" ON "activity_logs" ("entity_type", "entity_id");

-- 12. Toolkit Canvases Table
CREATE TABLE IF NOT EXISTS "toolkit_canvases" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE CASCADE,
  "tool_key" varchar(100) NOT NULL,
  "title" varchar(255) NOT NULL,
  "entity_type" varchar(50),
  "entity_id" uuid,
  "canvas_data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "unq_toolkit_canvases_id_workspace" UNIQUE ("id", "workspace_id")
);
CREATE INDEX IF NOT EXISTS "idx_toolkit_canvases_workspace" ON "toolkit_canvases" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_toolkit_canvases_tool_key" ON "toolkit_canvases" ("workspace_id", "tool_key");
