export type Job = {
  id: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  match_score: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
  source_url: string;
  found_at: string;
};
