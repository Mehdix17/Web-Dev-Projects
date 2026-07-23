import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function GET(req: NextRequest) {
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
    const keyParam = req.nextUrl.searchParams.get("key");
    const storageKey = keyParam || `${userId}/resume.pdf`;

    const { data: blob, error } = await insforge.storage
      .from("resumes")
      .download(storageKey);

    if (error || !blob) {
      console.error("[api/resume/download] Download error:", error);
      return NextResponse.json(
        { success: false, error: "Resume not found" },
        { status: 404 }
      );
    }

    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="resume.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("[api/resume/download] Main exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
