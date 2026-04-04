import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  date: text("date").notNull(),
  client: text("client").notNull(),
  featured: boolean("featured").notNull().default(false),
  featuredOrder: integer("featured_order"),
  orderedPosition: integer("ordered_position"),
  thumbnail: text("thumbnail").notNull(),
  pdfUrl: text("pdf_url").notNull(),
  summary: text("summary").notNull(),
  slides: text("slides").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type WorkRow = typeof works.$inferSelect;
