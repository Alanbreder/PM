DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_workspace_members_workspace_user'
  ) THEN
    ALTER TABLE "workspace_members" ADD CONSTRAINT "uq_workspace_members_workspace_user" UNIQUE("workspace_id", "user_id");
  END IF;
END $$;
