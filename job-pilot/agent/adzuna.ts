const ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs";

export type AdzunaJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  redirect_url: string;
  created: string;
  contract_type?: string;
};

type AdzunaRawResult = {
  id: string;
  title: string;
  company?: { display_name: string };
  location?: { display_name: string };
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: string;
  description: string;
  redirect_url: string;
  created: string;
  contract_type?: string;
};

function detectCountry(location: string): string {
  if (!location) return "us";
  const loc = location.toLowerCase();
  if (/\b(uk|united kingdom|england|scotland|wales|london|gb)\b/.test(loc)) return "gb";
  if (/\b(canada|ca|toronto|vancouver|montreal)\b/.test(loc)) return "ca";
  if (/\b(australia|au|sydney|melbourne|brisbane)\b/.test(loc)) return "au";
  if (/\b(india|in|bangalore|mumbai|delhi)\b/.test(loc)) return "in";
  if (/\b(germany|de|berlin|munich|hamburg)\b/.test(loc)) return "de";
  if (/\b(france|fr|paris|lyon)\b/.test(loc)) return "fr";
  if (/\b(spain|es|madrid|barcelona)\b/.test(loc)) return "es";
  if (/\b(netherlands|nl|amsterdam|rotterdam)\b/.test(loc)) return "nl";
  return "us";
}

function formatSalary(min?: number, max?: number, isPredicted?: string): string {
  if (!min && !max) return "Not specified";
  const prefix = isPredicted === "1" ? "Est. " : "";
  if (min && max) return `${prefix}$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min) return `${prefix}$${min.toLocaleString()}+`;
  return `${prefix}$${max!.toLocaleString()}`;
}

export async function discoverJobs(
  jobTitle: string,
  location?: string,
  resultsPerPage: number = 10
): Promise<{ jobs: AdzunaJob[]; totalCount: number }> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("Adzuna API credentials not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY.");
  }

  const country = detectCountry(location || "");
  const url = `${ADZUNA_BASE}/${country}/search/1`;

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    what: jobTitle,
    results_per_page: resultsPerPage.toString(),
    category: "it-jobs",
  });

  if (location) params.set("where", location);

  const requestUrl = `${url}?${params.toString()}`;

  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(requestUrl, {
        headers: { Accept: "application/json" },
      });
      if (response.ok) break;
      if (response.status < 500) break;
    } catch (err) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
        continue;
      }
      throw err;
    }
    if (attempt < 2 && response && !response.ok) {
      await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
    }
  }

  if (!response || !response.ok) {
    const text = response ? await response.text().catch(() => "") : "No response";
    const status = response ? response.status : "0";
    throw new Error(`Adzuna API error: ${status} ${text}`);
  }

  const data = await response.json();
  const rawJobs: AdzunaRawResult[] = data.results || [];
  const totalCount = data.count || 0;

  const jobs: AdzunaJob[] = rawJobs.map((job) => ({
    id: job.id,
    title: job.title,
    company: job.company?.display_name || "Unknown",
    location: job.location?.display_name || "Unknown",
    salary: formatSalary(job.salary_min, job.salary_max, job.salary_is_predicted),
    description: job.description,
    redirect_url: job.redirect_url,
    created: job.created,
    contract_type: job.contract_type,
  }));

  return { jobs, totalCount };
}

export { detectCountry };
