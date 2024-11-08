DROP INDEX IF EXISTS "zkp_result_cache__search_idx";--> statement-breakpoint
ALTER TABLE "zkp_result_cache" ADD COLUMN "controlled_by" char(56) NOT NULL;--> statement-breakpoint
ALTER TABLE "zkp_result_cache" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "zkp_result_cache" ADD CONSTRAINT "zkp_result_cache__uniq_by_user" UNIQUE("controlled_by","jal_id");