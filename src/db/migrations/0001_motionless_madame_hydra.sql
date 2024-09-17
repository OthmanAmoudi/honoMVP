ALTER TABLE "auth" ADD COLUMN "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "auth" ADD COLUMN "refresh_token_family" text;--> statement-breakpoint
ALTER TABLE "auth" ADD COLUMN "last_authentication" timestamp;