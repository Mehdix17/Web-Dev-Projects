ALTER TABLE "works" ADD COLUMN IF NOT EXISTS "date" text;
UPDATE "works" SET "date" = COALESCE("date", "year"::text);
ALTER TABLE "works" ALTER COLUMN "date" SET NOT NULL;
ALTER TABLE "works" DROP COLUMN IF EXISTS "year";