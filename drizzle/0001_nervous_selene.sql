ALTER TABLE "workflows" ADD COLUMN "org_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "graph" json;