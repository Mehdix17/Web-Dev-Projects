"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";

export function Navbar() {
  const pathname = usePathname();

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;
    return `font-medium text-sm transition-colors ${
      isActive ? "text-accent" : "text-text-dark hover:text-accent"
    }`;
  };

  const trackNavbarClick = (label: string, targetUrl: string) => {
    posthog.capture("navbar_link_clicked", {
      link_label: label,
      target_url: targetUrl,
    });
  };

  return (
    <header className="w-full bg-surface border-b border-border h-16 flex items-center px-6">
      <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => trackNavbarClick("Logo", "/")}
          className="flex items-center transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={96}
            height={32}
            priority
            className="object-contain"
          />
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-8">
          <Link
            href="/dashboard"
            onClick={() => trackNavbarClick("Dashboard", "/dashboard")}
            className={getLinkClass("/dashboard")}
          >
            Dashboard
          </Link>
          <Link
            href="/find-jobs"
            onClick={() => trackNavbarClick("Find jobs", "/find-jobs")}
            className={getLinkClass("/find-jobs")}
          >
            Find jobs
          </Link>
          <Link
            href="/profile"
            onClick={() => trackNavbarClick("Profile", "/profile")}
            className={getLinkClass("/profile")}
          >
            Profile
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="/login"
          onClick={() => trackNavbarClick("Start for free", "/login")}
          className="bg-text-primary text-accent-foreground text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Start for free
        </Link>
      </div>
    </header>
  );
}
