import { redirect } from "next/navigation";
import { createInsforgeServer } from "@/lib/insforge-server";
import { signOutAction } from "@/actions/auth";
import { Navbar } from "@/components/layout/Navbar";
import { PostHogIdentify } from "@/components/PostHogIdentify";

export default async function DashboardPage() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  async function handleSignOut() {
    "use server";
    await signOutAction();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <PostHogIdentify
        userId={user.id}
        name={user.profile?.name}
        providers={user.providers}
      />
      <div>
        <Navbar />
        
        <div className="max-w-4xl mx-auto w-full p-8 flex flex-col justify-center items-center mt-12">
          <div className="bg-surface border border-border shadow-md rounded-2xl p-8 max-w-lg w-full space-y-6 text-center">
            <div className="h-16 w-16 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-accent-dark shadow-md shadow-accent/20">
              <span className="text-2xl font-bold text-accent-foreground">JP</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Welcome to JobPilot Dashboard</h1>
              <p className="text-text-secondary text-sm">You have successfully signed in via InsForge OAuth!</p>
            </div>

            <div className="border-t border-border pt-6 text-left space-y-4">
              <h2 className="text-sm font-semibold text-text-dark uppercase tracking-wider">User Details</h2>
              <div className="space-y-2 text-sm text-text-primary">
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">User ID:</span>
                  <span className="font-mono text-xs">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Name:</span>
                  <span>{user.profile?.name || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary font-medium">Providers:</span>
                  <span className="capitalize">{user.providers?.join(", ")}</span>
                </div>
              </div>
            </div>

            <form action={handleSignOut} className="pt-4">
              <button
                type="submit"
                className="w-full bg-accent text-accent-foreground rounded-lg py-2 text-sm font-medium hover:bg-accent-dark transition-colors duration-200"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <p className="text-center text-xs text-text-muted py-8">
        JobPilot &copy; 2026. Built with Next.js and InsForge.
      </p>
    </div>
  );
}
