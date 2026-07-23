import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { PostHogIdentify } from "@/components/PostHogIdentify";

export default async function ProfilePage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  // Retrieve existing profile from DB
  let { data: profile } = await insforge
    .database.from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile && profile.resume_pdf_url) {
    const storagePath = `${user.id}/resume.pdf`;
    const { data: signedData } = await insforge.storage
      .from("resumes")
      .createSignedUrl(storagePath, 3600);
    if (signedData?.signedUrl) {
      profile.resume_pdf_url = signedData.signedUrl;
    }
  }

  // If no profile exists, create a default mock profile exactly matching the design
  if (!profile) {
    const defaultMockProfile = {
      id: user.id,
      email: user.email,
      full_name: "",
      phone: "",
      location: "",
      linkedin_url: "",
      portfolio_url: "",
      work_authorization: "",
      current_title: "",
      experience_level: "",
      years_experience: null,
      skills: [],
      industries: [],
      work_experience: [],
      education: [],
      job_titles_seeking: [],
      remote_preference: "",
      salary_expectation: "",
      preferred_locations: [],
      is_complete: false,
    };

    const { data: newProfile, error: insertError } = await insforge
      .database.from("profiles")
      .insert([defaultMockProfile])
      .select()
      .single();

    if (insertError) {
      console.error("[ProfilePage] Failed to insert default mock profile:", insertError);
      // Fallback in-memory
      profile = defaultMockProfile;
    } else {
      profile = newProfile;
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between font-sans">
      <PostHogIdentify
        userId={user.id}
        name={user.profile?.name}
        providers={user.providers}
      />
      <div>
        <Navbar />

        <main className="max-w-[1440px] mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-6">
          <div className="max-w-4xl mx-auto w-full">
            <ProfileContainer
              initialProfile={profile}
              userEmail={user.email || ""}
            />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
