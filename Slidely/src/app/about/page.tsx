import Link from "next/link";
import Image from "next/image";
import { processTimeline, services } from "@/lib/site-data";
import { AboutPageMotion } from "@/components/animations/AboutPageMotion";
import logo from "@/app/logo.png";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <AboutPageMotion />

      <h1
        data-about-title
        className="text-3xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF] sm:text-4xl"
      >
        About
      </h1>

      <section
        data-about-bio
        className="mt-10 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 lg:gap-16"
        aria-labelledby="bio-heading"
      >
        <div
          data-about-portrait
          className="relative min-h-[250px] overflow-hidden rounded-3xl border border-[#EAD2FF] shadow-[0_12px_40px_-20px_rgba(42,6,89,0.15)] dark:border-gray-800"
        >
          <Image
            src={logo}
            alt="Slidely Logo"
            className="absolute inset-0 w-full h-full object-cover"
            priority
          />
        </div>
        <div
          data-about-copy
          className="flex flex-col justify-center py-4 lg:py-8"
        >
          <h2
            id="bio-heading"
            className="text-3xl font-bold text-[#2A0659] dark:text-gray-100"
          >
            Welcome to Slidely.
          </h2>
          <p className="mt-5 text-[#2A0659]/80 dark:text-gray-300 md:text-lg">
            We help ambitious teams translate complexity into compelling, clear
            stories for decision-makers.
          </p>
          <p className="mt-4 text-[#2A0659]/80 dark:text-gray-300 md:text-lg">
            Our approach combines business strategy, information design, and
            high-end presentation craft to build decks that people can actually
            use.
          </p>
          <p className="mt-4 text-[#2A0659]/80 dark:text-gray-300 md:text-lg">
            Every engagement focuses on narrative clarity, visual consistency,
            and delivering measurable communication outcomes.
          </p>
        </div>
      </section>

      <section
        data-about-philosophy
        className="mt-14 rounded-3xl border border-[#EAD2FF] bg-[#FCF8FF] p-7 dark:border-[#5A3D7A] dark:bg-[#1D1031]"
        aria-labelledby="philosophy-heading"
      >
        <h2
          id="philosophy-heading"
          className="text-2xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF]"
        >
          Philosophy
        </h2>
        <p className="mt-4 max-w-4xl text-foreground/75 dark:text-foreground/90">
          Great presentations are strategic products, not decoration. We design
          them to reduce friction, build confidence, and drive action.
        </p>
        <p className="mt-3 max-w-4xl text-foreground/75 dark:text-foreground/90">
          The goal is to make every slide earn its place by serving the audience
          and the decision you need.
        </p>
      </section>

      <section
        data-about-services
        className="mt-14"
        aria-labelledby="services-heading"
      >
        <h2
          id="services-heading"
          className="text-2xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF]"
        >
          Services
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {services.map((service) => (
            <div
              data-about-service-card
              key={service.title}
              className="group rounded-2xl border border-[#EAD2FF] bg-background p-5 transition-all duration-500 hover:-translate-y-1 hover:border-[#C88BFF] hover:shadow-[0_16px_40px_-30px_rgba(42,6,89,0.9)] dark:border-gray-800"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B353FF]">
                {service.icon}
              </p>
              <h3 className="mt-2 font-bold text-[#2A0659] dark:text-[#F8EEFF]">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#2A0659]/70 dark:text-[#EAD9FF]/90">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        data-about-process
        className="mt-14"
        aria-labelledby="process-heading"
      >
        <h2
          id="process-heading"
          className="text-2xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF]"
        >
          Process
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {processTimeline.map((step, index) => (
            <div
              data-about-step
              key={step}
              className="rounded-2xl border border-[#EAD2FF] bg-gradient-to-b from-white to-[#FCF8FF] p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-[#C88BFF] dark:border-[#5A3D7A] dark:from-[#2A1842] dark:to-[#1D1031]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Step {index + 1}
              </p>
              <p className="mt-1 font-semibold text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        data-about-cta
        className="mt-14 rounded-2xl bg-gray-950 px-6 py-8 text-white sm:px-8 sm:py-10"
      >
        <h2 className="text-2xl font-bold">Ready to work together?</h2>
        <p className="mt-2 text-gray-300">
          Let&apos;s design your next high-stakes presentation.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Contact
        </Link>
      </section>
    </div>
  );
}
