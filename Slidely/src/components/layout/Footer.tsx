"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";
import logo from "@/app/logo.png";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2A0659] text-[#F4E4FF] py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0659] rounded"
              aria-label="Slidely home"
            >
              <Image src={logo} alt="Slidely logo" className="h-10 w-auto" />
            </Link>
            <p className="text-[#E0B4FF] text-sm leading-relaxed max-w-xs">
              Elevating presentations through strategic design. Bridging the gap
              between raw data and compelling narratives.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <nav aria-label="Footer navigation">
            <h3 className="text-lg font-semibold mb-4 text-white">
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Gallery", href: "/gallery" },
                { name: "About", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-[#E0B4FF] hover:text-white transition-colors text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0659] rounded"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Socials */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
            <div className="flex flex-col space-y-3">
              <a
                href="https://www.upwork.com/freelancers/~018352e06aaf62f49a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E0B4FF] hover:text-white transition-colors text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0659] rounded w-fit"
                aria-label="Upwork"
              >
                Upwork
              </a>
              <a
                href="https://www.fiverr.com/users/mehdix_17"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E0B4FF] hover:text-white transition-colors text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0659] rounded w-fit"
                aria-label="Fiverr"
              >
                Fiverr
              </a>
              <a
                href="https://www.freelancer.com/u/mehdix17"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E0B4FF] hover:text-white transition-colors text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0659] rounded w-fit"
                aria-label="Freelancer.com"
              >
                Freelancer.com
              </a>
            </div>
          </div>

          {/* Column 4: Contact info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              Let&apos;s Build Projects Together
            </h3>
            <p className="text-[#E0B4FF] text-sm mb-4">
              Currently accepting new projects.
            </p>
            <a
              href="mailto:slidelyofficial@gmail.com"
              className="text-[#BD6BFF] hover:text-[#E0B4FF] transition-colors text-sm font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#2A0659] rounded"
            >
              slidelyofficial@gmail.com
            </a>
          </div>
        </div>

        <div className="border-t border-[#BD6BFF]/30 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-[#E0B4FF]/70 text-xs">
            &copy; {currentYear} Slidely. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-[#E0B4FF]/70 hover:text-white transition-colors text-xs"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-[#E0B4FF]/70 hover:text-white transition-colors text-xs"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
