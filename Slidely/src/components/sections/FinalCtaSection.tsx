import { Button } from "@/components/ui/Button";

export function FinalCtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      <div className="rounded-3xl bg-gradient-to-r from-[#2A0659] to-[#B353FF] px-8 py-14 text-center text-white md:px-12">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Ready to elevate your next presentation?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[#E0B4FF] md:text-base">
          Let&apos;s build a presentation narrative your audience understands
          and acts on.
        </p>
        <div className="mt-8">
          <Button href="/contact">Let&apos;s Work Together</Button>
        </div>
      </div>
    </section>
  );
}
