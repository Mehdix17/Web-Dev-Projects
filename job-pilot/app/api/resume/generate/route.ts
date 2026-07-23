import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { getAiCompletion } from "@/lib/utils";
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/profile/ResumePDF";
import React from "react";

type PolishedExperience = {
  company_name: string;
  job_title: string;
  duration: string;
  bulletPoints: string[];
};

type ResumeData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experience: PolishedExperience[];
  education: {
    degree: string;
    field: string;
    institution: string;
    year: string;
  }[];
};

export async function POST() {
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

    // 1. Fetch current profile data
    const { data: profile, error: fetchError } = await insforge
      .database.from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // 2. Call getAiCompletion helper to polish resume text
    const systemPrompt = `You are a professional resume writer.
Given the candidate's profile, write a polished, high-impact professional resume briefing.
Specifically:
1. Synthesize a professional summary paragraph (2-3 sentences) that highlights their expertise, years of experience, and remote/location details if relevant.
2. For each work experience entry, write 3-4 professional achievements as bullet points, focusing on impact, metrics, and technology use. Frame responsibilities into accomplishments.
3. Keep the output formal and concise.
Return ONLY valid JSON matching this structure:
{
  "summary": string,
  "experience": [
    {
      "company_name": string,
      "job_title": string,
      "duration": string (e.g. "Jan 2022 - Present"),
      "bulletPoints": string[]
    }
  ]
}`;

    const userPrompt = `CANDIDATE DETAILS:
Name: ${profile.full_name}
Title: ${profile.current_title}
Experience Level: ${profile.experience_level} (${profile.years_experience} years)
Skills: ${profile.skills?.join(", ")}
Work History: ${JSON.stringify(profile.work_experience)}`;

    let polishedData: any = {};
    try {
      const completion = await getAiCompletion({
        response_format: { type: "json_object" },
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      polishedData = JSON.parse(completion.choices[0].message.content || "{}");
    } catch (aiErr: any) {
      console.error("[api/resume/generate] AI generator error:", aiErr);
      return NextResponse.json(
        { success: false, error: aiErr.message || "Failed to generate polished resume content." },
        { status: 502 }
      );
    }

    // 3. Format education lists
    const educationList = (profile.education || []).map((edu: any) => ({
      degree: edu.highest_degree || "",
      field: edu.field_of_study || "",
      institution: edu.institution_name || "",
      year: edu.graduation_year || "",
    })).filter((edu: any) => edu.degree || edu.institution);

    // 4. Assemble complete resume data
    const resumeData: ResumeData = {
      name: profile.full_name || "Applicant Name",
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin: profile.linkedin_url || "",
      portfolio: profile.portfolio_url || "",
      summary: polishedData.summary || "",
      skills: profile.skills || [],
      experience: polishedData.experience || [],
      education: educationList,
    };

    // 5. Generate PDF buffer using @react-pdf/renderer
    // Type assertion to 'any' is necessary here because of a type signature mismatch 
    // between @react-pdf/renderer's custom Document React elements and the React 19 environment types.
    const pdfBuffer = await renderToBuffer(React.createElement(ResumePDF, { data: resumeData }) as any);

    // 6. Upload PDF buffer to Storage using a unique path
    const timestamp = Date.now();
    const storagePath = `${userId}/resume-${timestamp}.pdf`;
    const fileBlob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
    const { data: storageData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, fileBlob);

    if (uploadError) {
      console.error("[api/resume/generate] Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload generated PDF to storage" },
        { status: 500 }
      );
    }

    const resumeUrl = storageData?.url || "";
    const resumeKey = storageData?.key || storagePath;

    // 7. Update DB profile url
    const { error: dbError } = await insforge
      .database.from("profiles")
      .update({
        resume_pdf_url: resumeUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (dbError) {
      console.error("[api/resume/generate] DB update error:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        resumeUrl,
        resumeKey,
      },
    });
  } catch (error: any) {
    console.error("[api/resume/generate] Main exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
