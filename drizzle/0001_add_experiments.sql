CREATE TABLE IF NOT EXISTS "experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"hypothesis_id" uuid NOT NULL REFERENCES "hypotheses"("id") ON DELETE cascade,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"method" text NOT NULL,
	"success_criteria" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"result" text,
	"learning" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_experiments_workspace_id" ON "experiments" ("workspace_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_experiments_hypothesis_id" ON "experiments" ("hypothesis_id");
