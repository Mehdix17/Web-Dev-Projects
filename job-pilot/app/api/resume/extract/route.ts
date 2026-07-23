import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { PDFParse } from "pdf-parse";
import { getAiCompletion } from "@/lib/utils";
import path from "path";
import { pathToFileURL } from "url";

try {
  const workerPath = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs"
  );
  const workerUrl = pathToFileURL(workerPath).href;
  PDFParse.setWorker(workerUrl);
} catch (e) {
  console.error("Failed to set PDF worker path:", e);
}

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();
    const file = formData.get("resume") as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    // Keep a copy for the storage upload later (line ~147).
    // pdfjs.getDocument transfers the buffer, detaching the original.
    const pdfBytes = new Uint8Array(arrayBuffer);

    // 1. Extract text from PDF
    let pdfText = "";
    try {
      const parser = new PDFParse({ data: pdfBytes.slice() });
      const textResult = await parser.getText();
      pdfText = textResult.text;
    } catch (pdfErr: any) {
      console.error("[api/resume/extract] pdf-parse error:", pdfErr);
      return NextResponse.json(
        { 
          success: false, 
          error: "Could not read text from this PDF file. Please try a different file.",
          details: pdfErr.message,
          stack: pdfErr.stack
        },
        { status: 400 }
      );
    }

    if (!pdfText || pdfText.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Extracted resume text is too short or empty. Please upload a text-based PDF." },
        { status: 400 }
      );
    }

    // 2. Parse text with getAiCompletion helper
    const systemPrompt = `You are an expert resume parsing assistant. 
Analyze the raw text of a candidate's resume and extract all relevant information into a structured JSON object matching the candidate profile schema.

Important guidelines:
- Be extremely accurate and faithful to the source text.
- Do not invent facts, companies, or dates.
- Look carefully for any LinkedIn profile URLs or handles (e.g. linkedin.com/in/username) in the raw text, and populate "linkedin_url" with the full URL beginning with https.
- Look carefully for any GitHub, GitLab, personal websites, or portfolio links in the raw text, and populate "portfolio_url" with the full URL beginning with https.
- For work_experience: extract up to 3 roles. Keep responsibilities concise.
- For education: extract the highest degree, field of study, institution, and graduation year.
- Map work_authorization and remote_preference carefully if mentioned, otherwise leave empty.
- Return ONLY valid JSON.

JSON Structure to return:
{
  "full_name": string,
  "phone": string,
  "location": string,
  "linkedin_url": string,
  "portfolio_url": string,
  "work_authorization": "Citizen" | "Permanent Resident" | "Visa Required" | "",
  "current_title": string,
  "experience_level": "Junior" | "Mid" | "Senior" | "Lead" | "",
  "years_experience": number (approximate count of years),
  "skills": string[] (array of skill tags),
  "industries": string[] (array of industries worked in),
  "work_experience": [
    {
      "company_name": string,
      "job_title": string,
      "start_date": string (e.g. "January 2022"),
      "end_date": string (e.g. "December 2023" or empty if current),
      "current": boolean,
      "responsibilities": string
    }
  ],
  "education": [
    {
      "highest_degree": string (e.g. "Bachelor's" or "Master's" or "High School"),
      "field_of_study": string,
      "institution_name": string,
      "graduation_year": string
    }
  ],
  "job_titles_seeking": string[] (e.g. titles they would seek),
  "remote_preference": "Remote" | "Onsite" | "Hybrid" | "Any" | "",
  "salary_expectation": string,
  "preferred_locations": string[]
}`;

    let parsedContent: any = {};
    try {
      const completion = await getAiCompletion({
        response_format: { type: "json_object" },
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `RESUME TEXT:\n${pdfText}` },
        ],
      });
      parsedContent = JSON.parse(completion.choices[0].message.content || "{}");
      
      if (!parsedContent.linkedin_url || parsedContent.linkedin_url.trim() === "") {
        const linkedinMatch = pdfText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_\x7f-\xff]+/i);
        if (linkedinMatch) {
          let url = linkedinMatch[0];
          if (!url.startsWith("http")) {
            url = "https://" + url;
          }
          parsedContent.linkedin_url = url;
        }
      }
      
      if (!parsedContent.portfolio_url || parsedContent.portfolio_url.trim() === "") {
        const githubMatch = pdfText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9-_\x7f-\xff]+/i);
        if (githubMatch) {
          let url = githubMatch[0];
          if (!url.startsWith("http")) {
            url = "https://" + url;
          }
          parsedContent.portfolio_url = url;
        }
      }
    } catch (aiErr: any) {
      console.error("[api/resume/extract] AI parser error:", aiErr);
      return NextResponse.json(
        { success: false, error: aiErr.message || "Failed to parse resume with AI model." },
        { status: 502 }
      );
    }

    // 3. Upload to storage
    const storagePath = `${userId}/resume.pdf`;
    const fileBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const { data: storageData, error: uploadError } = await insforge.storage
      .from("resumes")
      .upload(storagePath, fileBlob);

    if (uploadError) {
      console.error("[api/resume/extract] Storage upload error:", uploadError);
      return NextResponse.json(
        { success: false, error: "Failed to upload resume to storage" },
        { status: 500 }
      );
    }

    // 4. Use the url from upload response directly
    const resumeUrl = storageData?.url || "";

    // 5. Update profile's resume_pdf_url in DB
    const { error: dbError } = await insforge
      .database.from("profiles")
      .update({
        resume_pdf_url: resumeUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (dbError) {
      console.error("[api/resume/extract] DB update error:", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        resumeUrl,
        profileData: parsedContent,
      },
    });
  } catch (error: any) {
    console.error("[api/resume/extract] Main exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
