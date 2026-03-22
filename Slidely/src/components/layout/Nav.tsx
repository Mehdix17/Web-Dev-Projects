"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Gallery", href: "/gallery" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

interface NavProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
  ariaLabel?: string;
}

export function Nav({ isMobile = false, onLinkClick, ariaLabel }: NavProps) {
  const pathname = usePathname();
  const currentPath = pathname ?? "/";

  const baseClasses = isMobile
    ? "flex flex-col space-y-6 text-2xl font-medium"
    : "flex items-center space-x-8 text-sm font-medium";

  const isActivePath = (href: string) => {
    if (href === "/") return currentPath === "/";
    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <nav className={baseClasses} aria-label={ariaLabel}>
      {navLinks.map((link) => {
        const isActive = isActivePath(link.href);

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={onLinkClick}
            className={`group relative py-1 transition-colors hover:text-primary ${
              isActive
                ? "text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
                : "text-gray-600 dark:text-gray-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            }`}
          >
            {link.name}
            {isActive && !isMobile && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-current transform origin-left transition-transform duration-300 ease-out" />
            )}
            {!isActive && !isMobile && (
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-current transition-all duration-300 ease-out group-hover:w-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
