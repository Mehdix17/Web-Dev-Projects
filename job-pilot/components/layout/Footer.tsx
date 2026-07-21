import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border">
      <div className="w-full max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center transition-opacity hover:opacity-90">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={96}
            height={32}
            className="object-contain"
          />
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-8">
          <Link
            href="/dashboard"
            className="text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="#"
            className="text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            Terms & Condition
          </Link>
        </nav>
      </div>
    </footer>
  );
}
