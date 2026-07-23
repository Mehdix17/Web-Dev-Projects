"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";

export async function updateProfileAction(profileData: any) {
  try {
    const insforge = await createInsforgeServer();
    const { data: userData } = await insforge.auth.getCurrentUser();
    if (!userData?.user) {
      return { success: false, error: "Unauthorized" };
    }
    const userId = userData.user.id;

    // Calculate completion percentage and missing fields
    const missing: string[] = [];
    let filledCount = 0;

    // We have 10 core fields, each worth 10%
    // 1. Full name
    if (profileData.full_name && profileData.full_name.trim() !== "") {
      filledCount++;
    } else {
      missing.push("NAME");
    }

    // 2. Phone
    if (profileData.phone && profileData.phone.trim() !== "") {
      filledCount++;
    } else {
      missing.push("PHONE");
    }

    // 3. Location
    if (profileData.location && profileData.location.trim() !== "") {
      filledCount++;
    } else {
      missing.push("LOCATION");
    }

    // 4. Current job title
    if (profileData.current_title && profileData.current_title.trim() !== "") {
      filledCount++;
    } else {
      missing.push("CURRENT TITLE");
    }

    // 5. Work authorization
    if (profileData.work_authorization && profileData.work_authorization.trim() !== "") {
      filledCount++;
    } else {
      missing.push("WORK AUTH");
    }

    // 6. Experience level & years
    if (profileData.experience_level && profileData.years_experience !== undefined && profileData.years_experience !== null && profileData.years_experience !== "") {
      filledCount++;
    } else {
      missing.push("EXPERIENCE");
    }

    // 7. Skills (must have at least one)
    if (profileData.skills && profileData.skills.length > 0) {
      filledCount++;
    } else {
      missing.push("SKILLS");
    }

    // 8. Work experience (must have at least one role with company and job title)
    const hasWorkExp = profileData.work_experience && 
                       profileData.work_experience.length > 0 && 
                       profileData.work_experience[0].company_name && 
                       profileData.work_experience[0].company_name.trim() !== "" &&
                       profileData.work_experience[0].job_title &&
                       profileData.work_experience[0].job_title.trim() !== "";
    if (hasWorkExp) {
      filledCount++;
    } else {
      missing.push("WORK EXPERIENCE");
    }

    // 9. Education (highest degree, field of study, and institution name)
    const hasEducation = profileData.education && 
                         profileData.education.length > 0 && 
                         profileData.education[0].highest_degree && 
                         profileData.education[0].highest_degree.trim() !== "" &&
                         profileData.education[0].field_of_study && 
                         profileData.education[0].field_of_study.trim() !== "" &&
                         profileData.education[0].institution_name && 
                         profileData.education[0].institution_name.trim() !== "";
    if (hasEducation) {
      filledCount++;
    } else {
      missing.push("EDUCATION");
    }

    // 10. Job titles seeking (must have at least one)
    if (profileData.job_titles_seeking && profileData.job_titles_seeking.length > 0) {
      filledCount++;
    } else {
      missing.push("JOB PREFERENCES");
    }

    const percentage = filledCount * 10;
    const isComplete = percentage === 100;

    // To match the designs exactly, when a user initializes their profile page, 
    // we want them to have missing tags PHONE, LOCATION, EDUCATION, and 70% complete.
    // So the above logic maps perfectly (7 out of 10 filled = 70% with PHONE, LOCATION, EDUCATION missing).

    const { error } = await insforge
      .database.from("profiles")
      .update({
        full_name: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        current_title: profileData.current_title,
        experience_level: profileData.experience_level,
        years_experience: profileData.years_experience ? parseFloat(profileData.years_experience) : null,
        skills: profileData.skills || [],
        industries: profileData.industries || [],
        work_experience: profileData.work_experience || [],
        education: profileData.education || [],
        job_titles_seeking: profileData.job_titles_seeking || [],
        remote_preference: profileData.remote_preference,
        preferred_locations: profileData.preferred_locations || [],
        salary_expectation: profileData.salary_expectation,
        linkedin_url: profileData.linkedin_url,
        portfolio_url: profileData.portfolio_url,
        work_authorization: profileData.work_authorization,
        is_complete: isComplete,
        updated_at: new Date().toISOString()
      })
      .eq("id", userId);

    if (error) {
      console.error("[actions/profile] Update profile DB error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/profile");
    return { success: true, percentage, missingFields: missing };
  } catch (err: any) {
    console.error("[actions/profile] Update profile exception:", err);
    return { success: false, error: err.message || "Failed to update profile" };
  }
}
