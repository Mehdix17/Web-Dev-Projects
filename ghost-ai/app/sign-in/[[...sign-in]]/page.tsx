import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { History, Share2, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In — Ghost AI",
  description: "Sign in to your Ghost AI workspace.",
};

export default function SignInPage() {
  return (
    <main className="flex min-h-screen bg-bg-base">
      {/* Left panel — hidden on small screens, 50% width on large screens */}
      <aside
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 bg-bg-surface border-r border-border-default"
        aria-label="Product overview"
      >
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-[#00c8d4] flex items-center justify-center shadow-lg shadow-accent-primary/20" />
          <span className="text-lg font-semibold tracking-tight text-text-primary">
            Ghost AI
          </span>
        </div>

        {/* Tagline & Feature List */}
        <div className="max-w-md my-auto py-12">
          <h1 className="text-4xl font-semibold text-text-primary tracking-tight leading-[1.25] mb-4">
            Design systems at the<br />speed of thought.
          </h1>
          <p className="text-sm text-text-secondary mb-12 leading-relaxed">
            Describe your architecture in plain English. Ghost AI maps it to a shared canvas your whole team can refine in real time.
          </p>

          {/* Feature list */}
          <div className="space-y-8">
            {/* Feature 1 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-accent-primary-dim text-accent-primary">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-text-primary mb-1">
                  AI Architecture Generation
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Describe your system, AI maps it to nodes and edges on a live canvas.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-accent-primary-dim text-accent-primary">
                <Share2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-text-primary mb-1">
                  Real-time Collaboration
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Live cursors, presence indicators, and shared node editing across your team.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent-primary/20 bg-accent-primary-dim text-accent-primary">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-text-primary mb-1">
                  Instant Spec Generation
                </h2>
                <p className="text-xs text-text-muted leading-relaxed">
                  Export a complete Markdown technical spec directly from the canvas graph.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-text-faint">
          © 2026 Ghost AI. All rights reserved.
        </div>
      </aside>

      {/* Right panel — Clerk form */}
      <section className="flex flex-1 items-center justify-center px-4 py-12">
        <SignIn />
      </section>
    </main>
  );
}
