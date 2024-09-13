ALTER TABLE "notes" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" DROP COLUMN IF EXISTS "created_at";--> statement-breakpoint
ALTER TABLE "todos" DROP COLUMN IF EXISTS "created_at";