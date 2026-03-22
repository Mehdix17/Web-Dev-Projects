import { Card } from "@/components/ui/Card";
import { clientLogos, testimonial } from "@/lib/site-data";

export function SocialProofSection() {
  return (
    <section
      className="mx-auto max-w-6xl px-4 py-10 md:py-12"
      aria-labelledby="social-proof"
    >
      <h2 id="social-proof" className="text-3xl font-bold tracking-tight">
        Trusted by Teams That Need Clarity
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {clientLogos.map((logo) => (
          <div
            key={logo}
            className="rounded-xl border border-gray-200 bg-gray-100 px-3 py-4 text-center text-xs font-semibold tracking-[0.16em] text-gray-500 grayscale transition-all hover:grayscale-0 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            {logo}
          </div>
        ))}
      </div>
      <Card className="mt-10">
        <p className="text-lg leading-relaxed">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <p className="mt-4 text-sm font-semibold text-primary">
          {testimonial.author}
        </p>
      </Card>
    </section>
  );
}
