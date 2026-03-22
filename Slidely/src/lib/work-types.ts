export type WorkCategory =
  | "Pitch Decks"
  | "Keynote"
  | "Sales"
  | "Reports"
  | "Course Materials";

export interface ManagedWork {
  slug: string;
  title: string;
  category: WorkCategory;
  year: number;
  client: string;
  role: string;
  featured: boolean;
  thumbnail: string;
  pdfUrl: string;
  summary: string;
  slides?: string[];
}

export const workCategories: WorkCategory[] = [
  "Pitch Decks",
  "Keynote",
  "Sales",
  "Reports",
  "Course Materials",
];
