CREATE TABLE IF NOT EXISTS "mangos" (
	"id" text PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
