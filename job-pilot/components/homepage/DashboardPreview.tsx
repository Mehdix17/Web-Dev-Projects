import Image from "next/image";

export function DashboardPreview() {
  return (
    <section
      className="w-full px-6 pb-24"
      style={{
        background:
          "linear-gradient(180deg, #F8F5FF 0%, var(--color-background) 100%)",
      }}
    >
      <div className="max-w-[900px] mx-auto">
        {/* Browser chrome frame */}
        <div
          className="rounded-2xl overflow-hidden border border-border shadow-lg"
          style={{
            boxShadow:
              "0px 20px 60px rgba(0,0,0,0.12), 0px 4px 16px rgba(0,0,0,0.06)",
          }}
        >
          {/* Browser bar */}
          <div className="bg-surface-secondary border-b border-border px-4 py-2.5 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-error opacity-70" />
              <span className="w-3 h-3 rounded-full bg-warning opacity-70" />
              <span className="w-3 h-3 rounded-full bg-success opacity-70" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-surface border border-border rounded px-3 py-0.5 text-xs text-text-muted font-mono">
                jobpilot.ai/dashboard
              </div>
            </div>
          </div>
          {/* Dashboard screenshot */}
          <div className="w-full">
            <Image
              src="/images/dashboard-demo.png"
              alt="JobPilot dashboard showing stats, recent activity, and charts"
              width={900}
              height={520}
              className="w-full h-auto object-cover object-top"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
