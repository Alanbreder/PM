-- Clean duplicates safely before applying unique constraint
DELETE FROM "workspace_members" a USING "workspace_members" b
WHERE a.id < b.id
AND a.workspace_id = b.workspace_id
AND a.user_id = b.user_id;
--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "uq_workspace_members_workspace_user" UNIQUE("workspace_id","user_id");
