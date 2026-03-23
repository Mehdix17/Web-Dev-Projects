import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseProps {
  hasError?: boolean;
}

type TextInputProps = BaseProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const shared =
  "w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-primary/20";

export function Input({
  hasError = false,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <input
      {...props}
      className={`${shared} ${hasError ? "border-red-500" : "border-gray-300 dark:border-gray-700"} ${className}`}
    />
  );
}

export function Textarea({
  hasError = false,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`${shared} ${hasError ? "border-red-500" : "border-gray-300 dark:border-gray-700"} ${className}`}
    />
  );
}
