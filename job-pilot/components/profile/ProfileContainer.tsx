"use client";

import React, { useState } from "react";
import { CompletionIndicator } from "./CompletionIndicator";
import { ResumeUpload } from "./ResumeUpload";
import { ProfileForm } from "./ProfileForm";

type WorkExperience = {
  company_name: string;
  job_title: string;
  start_date: string;
  end_date: string;
  current: boolean;
  responsibilities: string;
};

type Education = {
  highest_degree: string;
  field_of_study: string;
  institution_name: string;
  graduation_year: string;
};

type ProfileData = {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: string;
  current_title: string;
  experience_level: string;
  years_experience: string;
  skills: string[];
  industries: string[];
  work_experience: WorkExperience[];
  education: Education[];
  job_titles_seeking: string[];
  remote_preference: string;
  salary_expectation: string;
  preferred_locations: string[];
};

type ProfileContainerProps = {
  initialProfile: any;
  userEmail: string;
};

export function ProfileContainer({ initialProfile, userEmail }: ProfileContainerProps) {
  // Map database object structure to component form structure
  const mapProfileToForm = (profile: any): ProfileData => {
    return {
      full_name: profile.full_name || "",
      email: profile.email || userEmail || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin_url: profile.linkedin_url || "",
      portfolio_url: profile.portfolio_url || "",
      work_authorization: profile.work_authorization || "",
      current_title: profile.current_title || "",
      experience_level: profile.experience_level || "",
      years_experience: profile.years_experience?.toString() || "",
      skills: profile.skills || [],
      industries: profile.industries || [],
      work_experience: profile.work_experience || [],
      education: profile.education || [],
      job_titles_seeking: profile.job_titles_seeking || [],
      remote_preference: profile.remote_preference || "",
      salary_expectation: profile.salary_expectation || "",
      preferred_locations: profile.preferred_locations || [],
    };
  };

  const [profile, setProfile] = useState<any>(initialProfile);
  const [formData, setFormData] = useState<ProfileData>(mapProfileToForm(initialProfile));
  const [resumeUrl, setResumeUrl] = useState<string | null>(initialProfile.resume_pdf_url || null);
  const [resumeKey, setResumeKey] = useState<string | null>(null);

  // Dynamic helper to compute completion percentage and missing fields
  const calculateCompletion = (prof: ProfileData) => {
    const missing: string[] = [];
    let filledCount = 0;

    if (prof.full_name && prof.full_name.trim() !== "") {
      filledCount++;
    }

    if (prof.phone && prof.phone.trim() !== "") {
      filledCount++;
    } else {
      missing.push("PHONE");
    }

    if (prof.location && prof.location.trim() !== "") {
      filledCount++;
    } else {
      missing.push("LOCATION");
    }

    if (prof.current_title && prof.current_title.trim() !== "") {
      filledCount++;
    }

    if (prof.work_authorization && prof.work_authorization.trim() !== "") {
      filledCount++;
    }

    if (prof.experience_level && prof.years_experience !== undefined && prof.years_experience !== null && prof.years_experience !== "") {
      filledCount++;
    }

    if (prof.skills && prof.skills.length > 0) {
      filledCount++;
    }

    const hasWorkExp = prof.work_experience && 
                       prof.work_experience.length > 0 && 
                       prof.work_experience[0].company_name && 
                       prof.work_experience[0].company_name.trim() !== "" &&
                       prof.work_experience[0].job_title &&
                       prof.work_experience[0].job_title.trim() !== "";
    if (hasWorkExp) {
      filledCount++;
    }

    const hasEducation = prof.education && 
                         prof.education.length > 0 && 
                         prof.education[0].highest_degree && 
                         prof.education[0].highest_degree.trim() !== "" &&
                         prof.education[0].field_of_study && 
                         prof.education[0].field_of_study.trim() !== "" &&
                         prof.education[0].institution_name && 
                         prof.education[0].institution_name.trim() !== "";
    if (hasEducation) {
      filledCount++;
    } else {
      missing.push("EDUCATION");
    }

    if (prof.job_titles_seeking && prof.job_titles_seeking.length > 0) {
      filledCount++;
    }

    const percentage = filledCount * 10;
    return { percentage, missingFields: missing };
  };

  const { percentage, missingFields } = calculateCompletion(formData);

  const handleUploadSuccess = (url: string, extractedData?: any) => {
    setResumeUrl(url);
    if (extractedData) {
      // Merge extracted fields into current form data
      setFormData((prev) => {
        const updated = {
          ...prev,
          full_name: extractedData.full_name || prev.full_name,
          phone: extractedData.phone || prev.phone,
          location: extractedData.location || prev.location,
          linkedin_url: extractedData.linkedin_url || prev.linkedin_url,
          portfolio_url: extractedData.portfolio_url || prev.portfolio_url,
          work_authorization: extractedData.work_authorization || prev.work_authorization,
          current_title: extractedData.current_title || prev.current_title,
          experience_level: extractedData.experience_level || prev.experience_level,
          years_experience: extractedData.years_experience?.toString() || prev.years_experience,
          skills: extractedData.skills && extractedData.skills.length > 0 ? extractedData.skills : prev.skills,
          industries: extractedData.industries && extractedData.industries.length > 0 ? extractedData.industries : prev.industries,
          work_experience: extractedData.work_experience && extractedData.work_experience.length > 0 ? extractedData.work_experience : prev.work_experience,
          education: extractedData.education && extractedData.education.length > 0 ? extractedData.education : prev.education,
          job_titles_seeking: extractedData.job_titles_seeking && extractedData.job_titles_seeking.length > 0 ? extractedData.job_titles_seeking : prev.job_titles_seeking,
          remote_preference: extractedData.remote_preference || prev.remote_preference,
          salary_expectation: extractedData.salary_expectation || prev.salary_expectation,
          preferred_locations: extractedData.preferred_locations && extractedData.preferred_locations.length > 0 ? extractedData.preferred_locations : prev.preferred_locations,
        };
        return updated;
      });
    }
  };

  const handleGenerateSuccess = (url: string, key: string) => {
    setResumeUrl(url);
    setResumeKey(key);
  };

  const handleSaveSuccess = (updatedPercentage: number, updatedMissingFields: string[]) => {
    // Save is handled inside ProfileForm, we just react to success
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Completion Banner */}
      <CompletionIndicator
        percentage={percentage}
        missingFields={missingFields}
      />

      {/* 2. Resume Section */}
      <ResumeUpload
        resumeUrl={resumeUrl}
        resumeKey={resumeKey}
        onUploadStart={() => {}}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={() => {}}
        onGenerateStart={() => {}}
        onGenerateSuccess={handleGenerateSuccess}
        onGenerateError={() => {}}
      />

      {/* 3. Detailed Profile Form */}
      <ProfileForm
        initialData={formData}
        onSaveSuccess={handleSaveSuccess}
      />
    </div>
  );
}
