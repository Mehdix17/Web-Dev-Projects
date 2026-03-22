"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import logo from "@/app/logo.png";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Gallery", href: "/gallery" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const visibleLinks = isAdmin
    ? [...links, { name: "Dashboard", href: "/admin" }]
    : links;

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  useEffect(() => {
    let active = true;

    const refreshAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/me", { cache: "no-store" });
        if (!active) return;
        setIsAdmin(response.ok);
      } catch {
        if (!active) return;
        setIsAdmin(false);
      }
    };

    const onAuthChanged = () => {
      void refreshAdminStatus();
    };

    void refreshAdminStatus();
    window.addEventListener("admin-auth-changed", onAuthChanged);

    return () => {
      active = false;
      window.removeEventListener("admin-auth-changed", onAuthChanged);
    };
  }, [pathname]);

  // Prevent scrolling when mobile menu is open and clean up reliably.
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;

    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMenuOpen]);

  // Ensure menu state and scroll lock reset when returning to desktop.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen]);

  // Basic focus trap + Escape close for keyboard users.
  useEffect(() => {
    if (!isMenuOpen || !mobileMenuRef.current) return;

    const container = mobileMenuRef.current;
    const selectors =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(selectors),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    first?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab" || focusables.length === 0) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  return (
    <header className="relative z-40">
      <div className="mx-auto mt-6 w-[calc(100%-1rem)] max-w-7xl px-1 md:px-4">
        <div className="grid h-[72px] grid-cols-[1fr_auto] items-center md:grid-cols-[1fr_2fr_1fr]">
          {/* Logo */}
          <Link
            href="/"
            className="group inline-flex items-center justify-self-start rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Slidely home"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#2A0659] shadow-[0_8px_20px_-10px_rgba(42,6,89,0.65)] transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6 md:h-12 md:w-12">
              <Image
                src={logo}
                alt="Slidely logo"
                priority
                className="h-full w-full object-cover"
              />
            </span>
          </Link>

          {/* Desktop Navigation (hero-style) */}
          <nav
            className="nav-shell hidden md:flex w-[410px] items-center justify-self-center justify-between gap-1 rounded-full border border-[#B353FF]/40 bg-white/75 px-3 py-1.5 shadow-[0_10px_30px_-22px_rgba(42,6,89,0.95)] backdrop-blur-md"
            aria-label="Primary"
          >
            {visibleLinks.map((link) => {
              const active = isActivePath(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex-1 rounded-full px-2 py-1.5 text-center text-[0.92rem] font-semibold transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-0.5 hover:scale-[1.02] ${
                    active
                      ? "bg-[#F6EBFF] text-[#2A0659] shadow-[0_8px_22px_-16px_rgba(42,6,89,0.9)]"
                      : "text-[#2A0659]/85 hover:bg-[#F6EBFF] hover:text-[#2A0659] hover:shadow-[0_8px_22px_-16px_rgba(42,6,89,0.85)]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block justify-self-end">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-[#2A0659] px-6 py-2.5 text-[0.95rem] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#B353FF] hover:text-[#2A0659] hover:shadow-[0_8px_22px_-14px_rgba(42,6,89,0.9)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Let&apos;s Collaborate
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="justify-self-end md:hidden p-2 -mr-2 text-[#2A0659] dark:text-gray-300 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className="fixed inset-0 z-[60] bg-[#fbf6ff] dark:bg-[#2a0659] flex flex-col p-8 pt-24 md:hidden overflow-y-auto"
        >
          <button
            type="button"
            className="absolute top-6 right-6 p-2 text-gray-700 dark:text-gray-200 hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <nav
            className="flex flex-col space-y-6 text-2xl font-medium"
            aria-label="Mobile"
          >
            {visibleLinks.map((link) => {
              const active = isActivePath(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded py-1 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    active
                      ? "text-primary"
                      : "text-[#2A0659]/85 hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
