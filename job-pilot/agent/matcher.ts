import { getAiCompletion } from "@/lib/utils";
import type { AdzunaJob } from "./adzuna";

export type ScoredJob = AdzunaJob & {
  match_score: number;
  match_reason: string;
  matched_skills: string[];
  missing_skills: string[];
};

const systemPrompt = `You are a career match AI. Score a job against a candidate profile.
Return ONLY valid JSON with these fields:
{
  "match_score": number (0-100),
  "match_reason": string (1-2 sentence explanation),
  "matched_skills": string[] (skills from the candidate that match this job),
  "missing_skills": string[] (skills required by the job the candidate lacks)
}`;

async function scoreJob(
  job: AdzunaJob,
  profile: {
    skills?: string[];
    current_title?: string;
    experience_level?: string;
    years_experience?: number;
    job_titles_seeking?: string[];
    industries?: string[];
    preferred_locations?: string[];
  }
): Promise<ScoredJob | null> {
  const userPrompt = `CANDIDATE PROFILE:
Current Title: ${profile.current_title || "Not specified"}
Experience Level: ${profile.experience_level || "Not specified"}
Years Experience: ${profile.years_experience ?? "Not specified"}
Skills: ${profile.skills?.join(", ") || "None listed"}
Seeking: ${profile.job_titles_seeking?.join(", ") || "Not specified"}
Industries: ${profile.industries?.join(", ") || "Not specified"}

JOB:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Salary: ${job.salary}
Description: ${job.description}
${job.contract_type ? `Type: ${job.contract_type}` : ""}`;

  try {
    const completion = await getAiCompletion({
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (!completion?.choices?.[0]?.message?.content) {
      console.warn(`[agent/matcher] Empty response for "${job.title}" at ${job.company}`);
      return null;
    }

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const content = JSON.parse(cleaned || "{}");

    return {
      ...job,
      match_score: Math.max(0, Math.min(100, content.match_score || 0)),
      match_reason: content.match_reason || "",
      matched_skills: content.matched_skills || [],
      missing_skills: content.missing_skills || [],
    };
  } catch (err) {
    console.error(`[agent/matcher] Failed to score job "${job.title}" at ${job.company}:`, err);
    return null;
  }
}

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 6_000;

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function scoreJobs(
  jobs: AdzunaJob[],
  profile: Parameters<typeof scoreJob>[1]
): Promise<(ScoredJob | null)[]> {
  const results: (ScoredJob | null)[] = [];

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map((job) => scoreJob(job, profile))
    );
    results.push(...settled.map((r) => (r.status === "fulfilled" ? r.value : null)));

    if (i + BATCH_SIZE < jobs.length) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return results;
}
