ALTER TABLE "notes" ALTER COLUMN "updatedAt" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "updatedAt" SET DEFAULT now();