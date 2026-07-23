import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { getPostHogClient } from "@/lib/posthog-server";
import { discoverJobs } from "@/agent/adzuna";
import { scoreJobs } from "@/agent/matcher";
import type { ScoredJob } from "@/agent/matcher";

export async function POST(request: NextRequest) {
  let posthog: ReturnType<typeof getPostHogClient> | null = null;
  try {
    const insforge = await createInsforgeServer();
    const { data: userData } = await insforge.auth.getCurrentUser();

    if (!userData?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;
    const body = await request.json();
    const { jobTitle, location, resultsPerPage } = body;

    if (!jobTitle?.trim()) {
      return NextResponse.json(
        { success: false, error: "jobTitle is required" },
        { status: 400 }
      );
    }

    const { data: profile } = await insforge
      .database.from("profiles")
      .select("skills, current_title, experience_level, years_experience, job_titles_seeking, industries, preferred_locations")
      .eq("id", userId)
      .single();

    const { data: run, error: runError } = await insforge
      .database.from("agent_runs")
      .insert([{
        user_id: userId,
        status: "running",
        job_title_searched: jobTitle,
        location_searched: location || null,
      }])
      .select()
      .single();

    if (runError || !run) {
      return NextResponse.json(
        { success: false, error: "Failed to create run record" },
        { status: 500 }
      );
    }

    const runId = run.id;

    posthog = getPostHogClient();
    posthog.capture({
      distinctId: userId,
      event: "job_search_started",
      properties: { jobTitle, location, runId },
    });

    let rawJobs: Awaited<ReturnType<typeof discoverJobs>>["jobs"] = [];
    try {
      const result = await discoverJobs(jobTitle, location, resultsPerPage || 20);
      rawJobs = result.jobs;
    } catch (discoveryError: any) {
      console.error("[api/agent/find] Discovery error:", discoveryError);
      await insforge.database.from("agent_runs").update({
        status: "failed",
        completed_at: new Date().toISOString(),
      }).eq("id", runId);

      posthog.capture({
        distinctId: userId,
        event: "job_search_failed",
        properties: { runId, error: discoveryError.message },
      });

      return NextResponse.json(
        { success: false, error: discoveryError.message || "Job discovery failed" },
        { status: 502 }
      );
    }

    const scoredResults = await scoreJobs(rawJobs, {
      skills: profile?.skills,
      current_title: profile?.current_title,
      experience_level: profile?.experience_level,
      years_experience: profile?.years_experience,
      job_titles_seeking: profile?.job_titles_seeking,
      industries: profile?.industries,
      preferred_locations: profile?.preferred_locations,
    });

    const scoringErrors: { title: string; company: string; error?: string }[] = [];
    const scoredJobs: ScoredJob[] = [];

    for (let i = 0; i < scoredResults.length; i++) {
      const scored = scoredResults[i];
      if (!scored) {
        scoringErrors.push({ title: rawJobs[i].title, company: rawJobs[i].company });
      } else {
        scoredJobs.push(scored);
      }
    }

    scoredJobs.sort((a, b) => b.match_score - a.match_score);

    let savedJobs: any[] = [];

    if (scoredJobs.length > 0) {
      const jobsToInsert = scoredJobs.map((s) => ({
        run_id: runId,
        user_id: userId,
        source: "search",
        source_url: s.redirect_url,
        external_apply_url: s.redirect_url,
        title: s.title,
        company: s.company,
        location: s.location,
        salary: s.salary || null,
        job_type: s.contract_type || null,
        about_role: s.description,
        match_score: s.match_score,
        match_reason: s.match_reason,
        matched_skills: s.matched_skills,
        missing_skills: s.missing_skills,
      }));

      const { data: batchSaved, error: batchError } = await insforge
        .database.from("jobs")
        .insert(jobsToInsert)
        .select();

      if (batchError) {
        console.warn("[api/agent/find] Batch insert failed, falling back to individual inserts:", batchError);
        for (let i = 0; i < jobsToInsert.length; i++) {
          const { data, error } = await insforge
            .database.from("jobs")
            .insert([jobsToInsert[i]])
            .select()
            .single();

          if (error) {
            console.error(`[api/agent/find] Save error for job "${scoredJobs[i].title}":`, error);
            scoringErrors.push({ title: scoredJobs[i].title, company: scoredJobs[i].company, error: error.message });
          } else if (data) {
            savedJobs.push(data);
          }
        }
      } else {
        savedJobs = batchSaved || [];
      }
    }

    if (scoringErrors.length > 0) {
      await insforge.database.from("agent_logs").insert(
        scoringErrors.map((e) => ({
          run_id: runId,
          user_id: userId,
          message: e.error || `Failed to score job: ${e.title} at ${e.company}`,
          level: "warning",
        }))
      );
    }

    for (const saved of savedJobs) {
      posthog.capture({
        distinctId: userId,
        event: "job_found",
        properties: {
          runId,
          jobId: saved.id,
          title: saved.title,
          company: saved.company,
          matchScore: saved.match_score,
          source: "search",
        },
      });
    }

    const completedAt = new Date().toISOString();
    await insforge.database.from("agent_runs").update({
      status: "completed",
      jobs_found: savedJobs.length,
      completed_at: completedAt,
    }).eq("id", runId);

    return NextResponse.json({
      success: true,
      data: {
        runId,
        jobs: savedJobs,
        totalFound: rawJobs.length,
        totalSaved: savedJobs.length,
      },
    });
  } catch (error: any) {
    console.error("[api/agent/find] Main exception:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (posthog) await posthog.shutdown();
  }
}

