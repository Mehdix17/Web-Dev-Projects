import { Card } from "@/components/ui/Card";
import { services } from "@/lib/site-data";
import { ServicesSectionMotion } from "@/components/animations/ServicesSectionMotion";

export function ServicesSection() {
  return (
    <section
      data-services-root
      className="mx-auto max-w-6xl px-4 py-12 md:py-16"
      aria-labelledby="services-overview"
    >
      <ServicesSectionMotion />
      <div data-services-heading>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B353FF]">
          What We Do
        </p>
        <h2
          id="services-overview"
          className="mt-3 text-3xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF] md:text-4xl"
        >
          Services designed for high-stakes communication
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-[#2A0659]/70 dark:text-[#EAD9FF]/90 md:text-base">
          From first narrative draft to final slide handoff, each service is
          built to help your team communicate clearly and move faster.
        </p>
      </div>

      <div
        data-services-grid
        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
      >
        {services.map((service, index) => (
          <Card
            data-service-card
            key={service.title}
            className="group relative overflow-hidden border border-[#E3D7EE] bg-background/95 p-0 transition-all duration-300 hover:-translate-y-1 hover:border-[#B995D8] hover:shadow-[0_20px_40px_-30px_rgba(42,6,89,0.45)] dark:border-[#5A3D7A] dark:bg-[#1B0C30]"
          >
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#2A0659] via-[#7A21C8] to-[#B353FF]" />

            <div className="p-5 pb-4 md:p-5 md:pb-4">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#A86BDA] dark:text-[#CFA9FF]">
                Service {String(index + 1).padStart(2, "0")}
              </p>

              <h3 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[#23044B] dark:text-[#F7ECFF] md:text-[2rem]">
                <span className="block text-[1.22rem] leading-tight sm:text-[1.3rem] md:text-[1.5rem]">
                  {service.title}
                </span>
              </h3>

              <p className="mt-3 max-w-[34ch] text-[0.95rem] leading-relaxed text-[#2A0659]/72 dark:text-[#E9D9FF]/92 md:text-[1rem]">
                {service.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
