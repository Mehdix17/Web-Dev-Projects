export type WorkCategory =
  | "Pitch Deck"
  | "Keynote"
  | "Sales"
  | "Reports"
  | "Redesign"
  | "Course Materials"
  | "Educational";

export interface ManagedWork {
  slug: string;
  title: string;
  category: WorkCategory;
  date: string;
  client: string;
  featured: boolean;
  featuredOrder: number | null;
  orderedPosition: number | null;
  thumbnail: string;
  pdfUrl: string;
  summary: string;
  slides?: string[];
}

export const workCategories: WorkCategory[] = [
  "Pitch Deck",
  "Keynote",
  "Sales",
  "Reports",
  "Redesign",
  "Course Materials",
  "Educational",
];
