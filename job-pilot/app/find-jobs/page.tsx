import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { Navbar } from "@/components/layout/Navbar";
import { PostHogIdentify } from "@/components/PostHogIdentify";
import { SearchControls } from "@/components/find-jobs/SearchControls";


export default async function FindJobsPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PostHogIdentify
        userId={user.id}
        name={user.profile?.name}
        providers={user.providers}
      />
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Find Jobs</h1>
          <p className="text-sm text-text-secondary mt-1">
            Discover roles that match your skills and preferences.
          </p>
        </div>

        <SearchControls />
      </main>
    </div>
  );
}
