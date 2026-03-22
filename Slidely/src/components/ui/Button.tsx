import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
};

const styles = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary",
  secondary:
    "bg-transparent border border-gray-300 text-foreground hover:bg-gray-100 dark:hover:bg-gray-900 focus-visible:ring-primary",
};

export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  className = "",
  onClick,
}: Props) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-offset-2 ${styles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={base} onClick={onClick}>
      {children}
    </button>
  );
}
