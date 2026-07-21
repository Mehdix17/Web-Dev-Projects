import Image from "next/image";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you've found, tailored. Your activity and progress all stay in one simple place.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full bg-background py-20 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: heading + feature list */}
          <div>
            <h2
              className="font-bold text-text-primary mb-10"
              style={{ fontSize: "36px", lineHeight: "44px" }}
            >
              Manage Your Job
              <br />
              Search With Ease
            </h2>
            <ul className="flex flex-col gap-8">
              {features.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <div
                    className="w-1 rounded-full flex-shrink-0 mt-1"
                    style={{
                      background: "var(--color-accent)",
                      minHeight: "100%",
                    }}
                  />
                  <div>
                    <p className="font-semibold text-text-primary text-sm mb-1">
                      {feature.title}
                    </p>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: jobs list screenshot */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="w-full max-w-[460px] rounded-2xl overflow-hidden border border-border"
              style={{
                boxShadow:
                  "0px 4px 24px rgba(0,0,0,0.08), 0px 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <Image
                src="/images/jobs-lists.png"
                alt="Job listings table showing match scores, companies, and salary ranges"
                width={460}
                height={380}
                className="w-full h-auto object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
