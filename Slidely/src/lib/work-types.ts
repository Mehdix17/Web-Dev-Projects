export type WorkCategory =
  | "Pitch Deck"
  | "Keynote"
  | "Sales"
  | "Reports"
  | "Course Materials"
  | "Educational";

export interface ManagedWork {
  slug: string;
  title: string;
  category: WorkCategory;
  year: number;
  client: string;
  role: string;
  featured: boolean;
  featuredOrder: number | null;
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
  "Course Materials",
  "Educational",
];
