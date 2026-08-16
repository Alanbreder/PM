-- Migration for Roadmap Items & Strategic Initiatives (Etapa 8)
CREATE TABLE IF NOT EXISTS "roadmap_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"title" varchar(255) NOT NULL,
	"description" text,
	"timeframe" varchar(50) DEFAULT 'now' NOT NULL,
	"status" varchar(50) DEFAULT 'planned' NOT NULL,
	"priority" varchar(50) DEFAULT 'medium' NOT NULL,
	"target_quarter" varchar(50),
	"decision_id" uuid,
	"opportunity_id" uuid,
	"metrics_target" text,
	"progress" integer DEFAULT 0 NOT NULL,
	"owner_name" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fk_roadmap_decision_workspace" FOREIGN KEY ("decision_id", "workspace_id") REFERENCES "decisions"("id", "workspace_id") ON DELETE set null,
	CONSTRAINT "fk_roadmap_opportunity_workspace" FOREIGN KEY ("opportunity_id", "workspace_id") REFERENCES "opportunities"("id", "workspace_id") ON DELETE set null,
	CONSTRAINT "chk_roadmap_timeframe" CHECK ("timeframe" IN ('now', 'next', 'later')),
	CONSTRAINT "chk_roadmap_status" CHECK ("status" IN ('planned', 'in_progress', 'delivered', 'blocked', 'deferred')),
	CONSTRAINT "chk_roadmap_priority" CHECK ("priority" IN ('critical', 'high', 'medium', 'low')),
	CONSTRAINT "chk_roadmap_progress" CHECK ("progress" >= 0 AND "progress" <= 100)
);

CREATE INDEX IF NOT EXISTS "idx_roadmap_items_workspace" ON "roadmap_items" ("workspace_id");
CREATE INDEX IF NOT EXISTS "idx_roadmap_items_decision" ON "roadmap_items" ("decision_id");
CREATE INDEX IF NOT EXISTS "idx_roadmap_items_opportunity" ON "roadmap_items" ("opportunity_id");
CREATE INDEX IF NOT EXISTS "idx_roadmap_items_timeframe" ON "roadmap_items" ("workspace_id", "timeframe");
