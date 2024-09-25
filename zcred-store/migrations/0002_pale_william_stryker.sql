CREATE TABLE IF NOT EXISTS "zkp_result_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jal_id" char(64) NOT NULL,
	"data" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "zkp_result_cache__search_idx" ON "zkp_result_cache" USING btree ("jal_id","created_at" DESC NULLS LAST);