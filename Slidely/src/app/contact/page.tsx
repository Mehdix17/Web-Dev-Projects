"use client";

import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";
import { Mail, ArrowUpRight } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  message: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const availabilityOpen = true;

  const announcement = useMemo(() => {
    if (status === "success") return "Message sent successfully.";
    if (status === "error") return "Message failed to send.";
    return "";
  }, [status]);

  const validate = (): Errors => {
    const nextErrors: Errors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Please provide a valid email address.";
    }
    if (!form.message.trim()) nextErrors.message = "Message is required.";

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setStatus("error");
      return;
    }

    try {
      setStatus("sending");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Form submission failed");

      setStatus("success");
      setErrors({});
      setForm(initialState);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:py-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <header className="mb-4">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight">
              Contact
            </h1>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-300 max-w-2xl">
              Ready to elevate your presentations? Reach out directly or hire me
              securely through your preferred freelance platform.
            </p>
          </header>

          <div className="flex flex-wrap items-center gap-4">
            <Badge tone={availabilityOpen ? "success" : "neutral"}>
              {availabilityOpen
                ? "Currently accepting projects"
                : "Not accepting new projects"}
            </Badge>
            <a
              href="mailto:slidelyofficial@gmail.com"
              className="flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            >
              <Mail size={16} />
              slidelyofficial@gmail.com
            </a>
          </div>

          <form
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-semibold"
              >
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={form.name}
                hasError={Boolean(errors.name)}
                onChange={(e) =>
                  setForm((state) => ({ ...state, name: e.target.value }))
                }
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-semibold"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                hasError={Boolean(errors.email)}
                onChange={(e) =>
                  setForm((state) => ({ ...state, email: e.target.value }))
                }
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-semibold"
              >
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={9}
                value={form.message}
                hasError={Boolean(errors.message)}
                onChange={(e) =>
                  setForm((state) => ({ ...state, message: e.target.value }))
                }
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message}</p>
              )}
            </div>

            <div className="md:col-span-2 mt-4">
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-opacity focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>
              {status === "success" && (
                <p className="mt-3 text-sm font-medium text-emerald-600">
                  Thanks. Your message has been sent.
                </p>
              )}
              {status === "error" && Object.keys(errors).length === 0 && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  Submission failed. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
            <h3 className="text-2xl font-black tracking-tight mb-3">
              Hire me directly
            </h3>
            <p className="text-sm text-foreground/75 mb-8 leading-relaxed">
              Prefer to use a freelance platform for escrow and project
              management? Find me here:
            </p>
            <div className="flex flex-col gap-4">
              <a
                className="group flex items-center justify-between rounded-2xl bg-background px-6 py-5 shadow-sm border border-primary/20 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
                href="https://www.upwork.com/freelancers/~018352e06aaf62f49a"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="font-bold text-foreground group-hover:text-primary transition-colors text-lg tracking-tight">
                  Upwork
                </span>
                <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowUpRight size={20} />
                </div>
              </a>
              <a
                className="group flex items-center justify-between rounded-2xl bg-background px-6 py-5 shadow-sm border border-primary/20 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
                href="https://www.fiverr.com/users/mehdix_17"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="font-bold text-foreground group-hover:text-primary transition-colors text-lg tracking-tight">
                  Fiverr
                </span>
                <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowUpRight size={20} />
                </div>
              </a>
              <a
                className="group flex items-center justify-between rounded-2xl bg-background px-6 py-5 shadow-sm border border-primary/20 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary"
                href="https://www.freelancer.com/u/mehdix17"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="font-bold text-foreground group-hover:text-primary transition-colors text-lg tracking-tight">
                  Freelancer.com
                </span>
                <div className="bg-primary/10 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowUpRight size={20} />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
