-- Migration for Product Insights Table
CREATE TABLE IF NOT EXISTS "product_insights" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL REFERENCES "workspaces"("id") ON DELETE cascade,
	"type" varchar(50) NOT NULL,
	"severity" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"facts" jsonb NOT NULL,
	"interpretation" text NOT NULL,
	"uncertainties" jsonb NOT NULL,
	"sources" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'suggested' NOT NULL,
	"feedback_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_product_insights_workspace" ON "product_insights" ("workspace_id");
