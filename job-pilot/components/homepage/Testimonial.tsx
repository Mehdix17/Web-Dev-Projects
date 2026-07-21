import Image from "next/image";

export function Testimonial() {
  return (
    <section className="w-full bg-background py-20 px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center">
        {/* Label */}
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-6"
          style={{ color: "var(--color-success-darker)" }}
        >
          Success Stories
        </p>

        {/* Quote */}
        <blockquote
          className="font-bold text-text-primary max-w-2xl mb-8"
          style={{ fontSize: "28px", lineHeight: "38px" }}
        >
          &ldquo;I used to spend my evenings copy-pasting resumes. Now I open my
          dashboard to see interviews waiting. It feels like cheating. Had 3
          offers on the table simultaneously.&rdquo;
        </blockquote>

        {/* Author */}
        <div className="flex items-center gap-3">
          <Image
            src="/images/user-icon.png"
            alt="Tom Wilson"
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">Tom Wilson</p>
            <p className="text-xs text-text-muted">Junior Developer</p>
          </div>
        </div>
      </div>
    </section>
  );
}
