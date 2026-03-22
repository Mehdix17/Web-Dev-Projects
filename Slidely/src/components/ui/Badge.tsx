import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  tone?: "success" | "neutral";
};

export function Badge({ children, tone = "neutral" }: Props) {
  const toneClasses =
    tone === "success"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
      : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}
    >
      {children}
    </span>
  );
}
