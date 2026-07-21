import Image from "next/image";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what's missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function Features() {
  return (
    <section className="w-full bg-surface-tertiary py-20 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: agent log screenshot */}
          <div className="flex justify-center lg:justify-start order-2 lg:order-1">
            <div
              className="w-full max-w-[480px] rounded-2xl overflow-hidden border border-border"
              style={{
                boxShadow:
                  "0px 4px 24px rgba(0,0,0,0.08), 0px 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <Image
                src="/images/agnet-log.png"
                alt="Agent log showing JobPilot finding and scoring jobs in real time"
                width={480}
                height={320}
                className="w-full h-auto object-cover object-top"
              />
            </div>
          </div>

          {/* Right: heading + feature list */}
          <div className="order-1 lg:order-2">
            <h2
              className="font-bold text-text-primary mb-10"
              style={{ fontSize: "36px", lineHeight: "44px" }}
            >
              Apply With More
              <br />
              Confidence, Every Time
            </h2>
            <ul className="flex flex-col gap-6">
              {features.map((feature) => (
                <li key={feature.title}>
                  <p className="font-semibold text-text-primary text-sm mb-1">
                    {feature.title}
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
