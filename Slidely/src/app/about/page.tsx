import Link from "next/link";
import Image from "next/image";
import { processTimeline, services } from "@/lib/site-data";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-black tracking-tight text-[#2A0659]">
        About
      </h1>

      <section
        className="mt-10 grid grid-cols-1 items-start gap-8 md:grid-cols-2"
        aria-labelledby="bio-heading"
      >
        <div>
          <Image
            src="/profile-placeholder.svg"
            alt="Portrait of Slidely founder"
            className="w-full max-w-[380px] rounded-2xl border border-[#EAD2FF] object-cover shadow-[0_20px_44px_-30px_rgba(42,6,89,0.85)]"
            loading="lazy"
            width={520}
            height={520}
          />
          <p className="mt-3 text-xs font-medium text-[#2A0659]/65">
            Put your personal image at <strong>public/profile.jpg</strong> and
            update this image src from <strong>/profile-placeholder.svg</strong>
            to <strong>/profile.jpg</strong>
          </p>
        </div>
        <div>
          <h2 id="bio-heading" className="text-2xl font-bold text-[#2A0659]">
            Hi, I&apos;m the designer behind Slidely.
          </h2>
          <p className="mt-4 text-[#2A0659]/75 dark:text-gray-200">
            I help teams translate ambiguity into compelling stories for
            decision-makers.
          </p>
          <p className="mt-4 text-[#2A0659]/75 dark:text-gray-200">
            My background combines business strategy, information design, and
            presentation craft to build decks people can actually use.
          </p>
          <p className="mt-4 text-[#2A0659]/75 dark:text-gray-200">
            Every engagement focuses on narrative clarity, visual consistency,
            and measurable communication outcomes.
          </p>
        </div>
      </section>

      <section
        className="mt-14 rounded-3xl border border-[#EAD2FF] bg-[#FCF8FF] p-7"
        aria-labelledby="philosophy-heading"
      >
        <h2
          id="philosophy-heading"
          className="text-2xl font-black tracking-tight text-[#2A0659]"
        >
          Philosophy
        </h2>
        <p className="mt-4 max-w-4xl text-[#2A0659]/75 dark:text-gray-200">
          Great presentations are strategic products, not decoration. We design
          them to reduce friction, build confidence, and drive action.
        </p>
        <p className="mt-3 max-w-4xl text-[#2A0659]/75 dark:text-gray-200">
          The goal is to make every slide earn its place by serving the audience
          and the decision you need.
        </p>
      </section>

      <section className="mt-14" aria-labelledby="services-heading">
        <h2
          id="services-heading"
          className="text-2xl font-black tracking-tight text-[#2A0659]"
        >
          Services
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="group rounded-2xl border border-[#EAD2FF] bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-[#C88BFF] hover:shadow-[0_16px_40px_-30px_rgba(42,6,89,0.9)] dark:border-gray-800"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B353FF]">
                {service.icon}
              </p>
              <h3 className="mt-2 font-bold text-[#2A0659]">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#2A0659]/70 dark:text-gray-300">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="process-heading">
        <h2
          id="process-heading"
          className="text-2xl font-black tracking-tight text-[#2A0659]"
        >
          Process
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {processTimeline.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-[#EAD2FF] bg-gradient-to-b from-white to-[#FCF8FF] p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-[#C88BFF] dark:bg-gray-900"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Step {index + 1}
              </p>
              <p className="mt-1 font-semibold text-[#2A0659]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl bg-gray-950 px-8 py-10 text-white">
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
