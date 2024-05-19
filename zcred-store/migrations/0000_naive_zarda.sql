CREATE TABLE IF NOT EXISTS "credential" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"controlled_by" char(56) NOT NULL,
	"data" text NOT NULL,
	"issuer" text NOT NULL,
	"subject_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "controlled_by_idx" ON "credential" ("controlled_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "search_idx" ON "credential" ("controlled_by","subject_id","issuer");