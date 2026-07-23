"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import posthog from "posthog-js";

type ResumeUploadProps = {
  resumeUrl: string | null;
  resumeKey: string | null;
  onUploadStart: () => void;
  onUploadSuccess: (url: string, extractedData?: any) => void;
  onUploadError: (error: string) => void;
  onGenerateStart: () => void;
  onGenerateSuccess: (url: string, key: string) => void;
  onGenerateError: (error: string) => void;
};

export function ResumeUpload({
  resumeUrl,
  resumeKey,
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onGenerateStart,
  onGenerateSuccess,
  onGenerateError,
}: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "extracting" | "success" | "error">("idle");
  const [generateStatus, setGenerateStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStepMessage, setCurrentStepMessage] = useState("");
  const [isOpeningPdf, setIsOpeningPdf] = useState(false);

  const UPLOAD_STEPS = [
    { message: "Uploading resume document...", maxProgress: 15 },
    { message: "Parsing PDF text contents...", maxProgress: 30 },
    { message: "Analyzing details with AI model...", maxProgress: 75 },
    { message: "Uploading to secure storage...", maxProgress: 90 },
    { message: "Updating your profile...", maxProgress: 98 },
    { message: "Finishing up...", maxProgress: 99 },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File) => {
    // Validate file type
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      onUploadError("Only PDF resumes are supported.");
      setUploadStatus("error");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError("Maximum file size is 5MB.");
      setUploadStatus("error");
      return;
    }

    setFileName(file.name);
    setUploadStatus("uploading");
    onUploadStart();
    setProgress(0);
    setCurrentStepMessage(UPLOAD_STEPS[0].message);

    // Smooth non-linear curve starting fast and slowing down near 98 percent
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      let simulatedProgress = Math.floor(98 * (1 - Math.exp(-elapsed / 18000)));
      if (simulatedProgress >= 98) {
        simulatedProgress = 98;
      }
      setProgress(simulatedProgress);

      const matchingStep = UPLOAD_STEPS.find((step) => simulatedProgress <= step.maxProgress);
      if (matchingStep) {
        setCurrentStepMessage(matchingStep.message);
      } else {
        setCurrentStepMessage("Finishing up...");
      }
    }, 100);

    try {
      // 1. Upload to storage & Extract profile
      const formData = new FormData();
      formData.append("resume", file);

      // We'll upload and extract in a single operation
      const response = await fetch("/api/resume/extract", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to extract data from resume");
      }

      clearInterval(intervalId);
      setProgress(100);
      setUploadStatus("success");
      onUploadSuccess(result.data.resumeUrl, result.data.profileData);
      
      // Track upload in PostHog
      posthog.capture("resume_uploaded", {
        file_size_bytes: file.size,
        auto_fill_extracted: true
      });
    } catch (err: any) {
      clearInterval(intervalId);
      console.error("[ResumeUpload] Error uploading resume:", err);
      setUploadStatus("error");
      onUploadError(err.message || "Failed to upload or parse resume PDF.");
    }
  };

  const handleGenerateResume = async () => {
    setGenerateStatus("generating");
    onGenerateStart();

    try {
      const response = await fetch("/api/resume/generate", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate resume");
      }

      setGenerateStatus("success");
      onGenerateSuccess(result.data.resumeUrl, result.data.resumeKey);
      
      // Track in PostHog
      posthog.capture("resume_generated_from_profile");
    } catch (err: any) {
      console.error("[ResumeUpload] Error generating resume:", err);
      setGenerateStatus("error");
      onGenerateError(err.message || "Failed to generate resume PDF.");
      setTimeout(() => setGenerateStatus("idle"), 3000);
    }
  };

  const handleViewDocument = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!resumeUrl) return;
    setIsOpeningPdf(true);

    try {
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(
          "<p style='font-family: sans-serif; font-size: 14px; text-align: center; margin-top: 50px;'>Loading document...</p>"
        );
      }

      const response = await fetch("/api/resume/download");
      if (!response.ok) throw new Error("Failed to fetch PDF");
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);

      if (newWindow) {
        newWindow.location.href = blobUrl;
      } else {
        window.open(blobUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to load PDF:", err);
      window.open("/api/resume/download", "_blank");
    } finally {
      setIsOpeningPdf(false);
    }
  };

  const handleViewGeneratedResume = () => {
    const params = resumeKey ? `?key=${encodeURIComponent(resumeKey)}` : "";
    window.open(`/api/resume/download${params}`, "_blank");
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),_0px_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-6">
      <div className="space-y-1">
        <h2 className="text-text-primary text-[16px] font-semibold leading-6">Resume</h2>
        <p className="text-text-secondary text-sm">
          Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
        </p>
      </div>

      {/* Dotted Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
          isDragging
            ? "border-accent bg-accent-muted"
            : "border-border-muted hover:border-accent hover:bg-surface-secondary"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        {uploadStatus === "idle" && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-accent-light p-3 rounded-full text-accent">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-text-primary font-medium text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-text-muted text-xs">
                PDF formatting only. Maximum file size 5MB.
              </p>
            </div>
            <button
              type="button"
              className="bg-surface border border-border text-text-primary text-xs font-semibold px-4 py-2 rounded-lg hover:bg-surface-secondary shadow-sm"
              onClick={(e) => {
                e.stopPropagation(); // Avoid triggering parent div click
                triggerFileInput();
              }}
            >
              Select Resume
            </button>
          </div>
        )}

        {(uploadStatus === "uploading" || uploadStatus === "extracting") && (
          <div className="flex flex-col items-center space-y-4 py-4 w-full max-w-md mx-auto">
            {/* Animated Loader with Ping Glow Effect */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20 w-16 h-16 animate-ping opacity-75"></div>
              <div className="relative bg-accent-light p-4 rounded-full text-accent shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>
            
            {/* Step Message */}
            <div className="space-y-1">
              <p className="text-text-primary font-semibold text-sm animate-pulse">
                {currentStepMessage || "Processing resume..."}
              </p>
              <p className="text-text-muted text-xs">
                Please wait, processing may take up to a minute
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-border-light h-2.5 rounded-full overflow-hidden relative shadow-inner">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(124,92,252,0.4)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Progress Percent */}
            <span className="text-xs font-bold text-accent">
              {progress}%
            </span>
          </div>
        )}

        {uploadStatus === "success" && (
          <div className="flex flex-col items-center space-y-3 py-2">
            <div className="bg-success-light p-3 rounded-full text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-text-primary font-medium text-sm">
                Resume parsed successfully!
              </p>
              <p className="text-text-secondary text-xs font-mono">
                {fileName || "resume.pdf"}
              </p>
            </div>
            <button
              type="button"
              className="text-accent hover:text-accent-dark text-xs font-semibold pt-1 underline"
              onClick={(e) => {
                e.stopPropagation();
                setUploadStatus("idle");
              }}
            >
              Upload a different file
            </button>
          </div>
        )}

        {uploadStatus === "error" && (
          <div className="flex flex-col items-center space-y-3 py-2">
            <div className="bg-error/10 p-3 rounded-full text-error">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-text-primary font-medium text-sm">
                Failed to process resume
              </p>
              <p className="text-text-muted text-xs">
                Make sure it is a valid, text-based PDF
              </p>
            </div>
            <button
              type="button"
              className="bg-surface border border-border text-text-primary text-xs font-semibold px-4 py-2 rounded-lg hover:bg-surface-secondary"
              onClick={(e) => {
                e.stopPropagation();
                setUploadStatus("idle");
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* PDF URL display if already uploaded and not currently uploading/success state */}
      {resumeUrl && uploadStatus === "idle" && (
        <div className="bg-accent-muted border border-accent/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-accent-light p-2 rounded-full text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-accent text-sm font-medium">Active Resume PDF</p>
              <p className="text-text-secondary text-xs">Your current resume on file</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isOpeningPdf}
            onClick={handleViewDocument}
            className="bg-accent text-accent-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2 shadow-sm disabled:opacity-75 disabled:cursor-not-allowed w-[180px] justify-center"
          >
            {isOpeningPdf ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Opening...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                View Document
              </>
            )}
          </button>
        </div>
      )}

      {/* Resume Generator Bar */}
      <div className="space-y-3">
        {generateStatus === "success" && resumeUrl ? (
          <div className="bg-accent-muted border border-accent/20 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-accent-light p-2 rounded-full text-accent">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-accent text-sm font-medium">Resume generated successfully</p>
                <p className="text-text-secondary text-xs">Click below to view or download your new resume</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleViewGeneratedResume}
              className="bg-accent text-accent-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2 shadow-sm w-[180px] justify-center"
            >
              <FileText className="h-4 w-4" />
              View Resume
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between flex-wrap gap-4 text-sm">
            <span className="text-text-secondary">
              Need a fresh document based on the fields below?
            </span>
            <button
              type="button"
              disabled={generateStatus === "generating"}
              onClick={handleGenerateResume}
              className="bg-accent text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors flex items-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {generateStatus === "generating" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : generateStatus === "error" ? (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Try Again
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Generate Resume from Profile
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
