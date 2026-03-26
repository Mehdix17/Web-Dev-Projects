"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import logo from "@/app/logo.png";

type ThemeMode = "light" | "dark";
const THEME_STORAGE_KEY = "slidely-theme";
const THEME_CHANGE_EVENT = "slidely-theme-change";

const readClientThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === "dark" || saved === "light") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyThemeClass = (mode: ThemeMode) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
};

const subscribeThemeMode = (onStoreChange: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleThemeChange = () => onStoreChange();
  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  window.addEventListener("storage", handleThemeChange);

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.removeEventListener("storage", handleThemeChange);
  };
};

const getServerThemeSnapshot = (): ThemeMode => "light";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isThemeToggleVisible, setIsThemeToggleVisible] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const themeHideTimeoutRef = useRef<number | null>(null);
  const pathname = usePathname();
  const themeMode = useSyncExternalStore(
    subscribeThemeMode,
    readClientThemeMode,
    getServerThemeSnapshot,
  );

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
    applyThemeClass(themeMode);
    localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    return () => {
      if (themeHideTimeoutRef.current !== null) {
        window.clearTimeout(themeHideTimeoutRef.current);
      }
    };
  }, []);

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

  const toggleTheme = () => {
    const nextTheme: ThemeMode = themeMode === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 380);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyThemeClass(nextTheme);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  };

  const showThemeToggle = () => {
    if (themeHideTimeoutRef.current !== null) {
      window.clearTimeout(themeHideTimeoutRef.current);
      themeHideTimeoutRef.current = null;
    }
    setIsThemeToggleVisible(true);
  };

  const hideThemeToggle = () => {
    if (themeHideTimeoutRef.current !== null) {
      window.clearTimeout(themeHideTimeoutRef.current);
    }
    themeHideTimeoutRef.current = window.setTimeout(() => {
      setIsThemeToggleVisible(false);
    }, 140);
  };

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
      <div className="mx-auto mt-3 w-[calc(100%-1rem)] max-w-7xl px-1 md:mt-6 md:px-4">
        <div className="grid h-[72px] grid-cols-[1fr_auto] items-center md:grid-cols-[1fr_2fr_1fr]">
          {/* Logo */}
          <div
            className="group/theme relative inline-flex items-center justify-self-start gap-2"
            onMouseEnter={showThemeToggle}
            onMouseLeave={hideThemeToggle}
            onFocus={showThemeToggle}
            onBlur={hideThemeToggle}
          >
            <button
              type="button"
              onClick={toggleTheme}
              className={`z-20 hidden h-10 w-10 items-center justify-center rounded-full border border-[#CDA2F5] bg-white/95 text-[#2A0659] shadow-[0_12px_24px_-18px_rgba(42,6,89,0.95)] backdrop-blur transition-all duration-200 dark:border-[#9D78C8] dark:bg-[#5F3D87]/95 dark:text-[#F8EEFF] md:inline-flex ${
                isThemeToggleVisible
                  ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-x-2 scale-95 opacity-0"
              }`}
              aria-label={
                themeMode === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              title={
                themeMode === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {themeMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              href="/"
              className="group inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
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
          </div>

          {/* Desktop Navigation (hero-style) */}
          <nav
            className="nav-shell hidden md:flex w-[410px] items-center justify-self-center justify-between gap-1 rounded-full border border-[#B353FF]/40 bg-white/75 px-3 py-1.5 shadow-[0_10px_30px_-22px_rgba(42,6,89,0.95)] backdrop-blur-md dark:border-[#B995E2]/70 dark:bg-[#7A59A4]/45 dark:shadow-[0_12px_30px_-24px_rgba(8,3,18,0.95)]"
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
                      ? "bg-[#F6EBFF] text-[#2A0659] shadow-[0_8px_22px_-16px_rgba(42,6,89,0.9)] dark:bg-[#D9C4F2]/30 dark:text-[#F8EEFF] dark:shadow-[0_8px_22px_-16px_rgba(8,3,18,0.95)]"
                      : "text-[#2A0659]/85 hover:bg-[#F6EBFF] hover:text-[#2A0659] hover:shadow-[0_8px_22px_-16px_rgba(42,6,89,0.85)] dark:text-[#F3E8FF] dark:hover:bg-[#D9C4F2]/24 dark:hover:text-[#FFFFFF]"
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
            className="-mr-2 justify-self-end rounded p-2 text-[#2A0659] transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:text-[#F8EEFF] md:hidden"
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
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#fbf6ff] px-6 pb-10 pt-24 md:hidden"
        >
          <button
            type="button"
            className="absolute right-5 top-5 rounded p-2 text-[#2A0659] hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={28} />
          </button>
          <nav className="mt-2 flex flex-col space-y-4" aria-label="Mobile">
            {visibleLinks.map((link) => {
              const active = isActivePath(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-2xl border px-4 py-3 text-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    active
                      ? "border-[#B353FF]/50 bg-[#F3E4FF] text-[#2A0659]"
                      : "border-[#EAD2FF] text-[#2A0659]/85 hover:border-[#B353FF]/50 hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#2A0659] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B353FF] hover:text-[#2A0659] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Let&apos;s Collaborate
          </Link>
        </div>
      )}
    </header>
  );
}
