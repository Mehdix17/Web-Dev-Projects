CREATE TABLE "works" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"year" integer NOT NULL,
	"client" text NOT NULL,
	"role" text NOT NULL,
	"thumbnail" text NOT NULL,
	"pdf_url" text NOT NULL,
	"summary" text NOT NULL,
	"slides" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "works_slug_unique" UNIQUE("slug")
);
