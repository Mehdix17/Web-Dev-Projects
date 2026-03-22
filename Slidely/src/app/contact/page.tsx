"use client";

import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input, Textarea } from "@/components/ui/Input";

type FormState = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const initialState: FormState = {
  name: "",
  email: "",
  projectType: "",
  budget: "",
  message: "",
};

const formsPreeEndpoint =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
  "https://formspree.io/f/xjkrgqlz";

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
    if (!form.projectType.trim())
      nextErrors.projectType = "Project type is required.";
    if (!form.budget.trim()) nextErrors.budget = "Budget is required.";
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
      const response = await fetch(formsPreeEndpoint, {
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-black tracking-tight">Contact</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Tell me about your project and timeline.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Badge tone={availabilityOpen ? "success" : "neutral"}>
          {availabilityOpen
            ? "Currently accepting projects"
            : "Not accepting new projects"}
        </Badge>
        <a
          href="mailto:hello@slidely.com"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        >
          hello@slidely.com
        </a>
        <div className="flex items-center gap-3 text-sm">
          <a
            className="text-primary hover:underline"
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            className="text-primary hover:underline"
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            className="text-primary hover:underline"
            href="https://behance.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            Behance
          </a>
        </div>
      </div>

      <form
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-semibold">
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
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">
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

        <div>
          <label
            htmlFor="projectType"
            className="mb-1 block text-sm font-semibold"
          >
            Project Type
          </label>
          <Input
            id="projectType"
            name="projectType"
            value={form.projectType}
            hasError={Boolean(errors.projectType)}
            onChange={(e) =>
              setForm((state) => ({ ...state, projectType: e.target.value }))
            }
          />
          {errors.projectType && (
            <p className="mt-1 text-xs text-red-600">{errors.projectType}</p>
          )}
        </div>

        <div>
          <label htmlFor="budget" className="mb-1 block text-sm font-semibold">
            Budget
          </label>
          <Input
            id="budget"
            name="budget"
            value={form.budget}
            hasError={Boolean(errors.budget)}
            onChange={(e) =>
              setForm((state) => ({ ...state, budget: e.target.value }))
            }
          />
          {errors.budget && (
            <p className="mt-1 text-xs text-red-600">{errors.budget}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="message" className="mb-1 block text-sm font-semibold">
            Message
          </label>
          <Textarea
            id="message"
            name="message"
            rows={6}
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

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
          {status === "success" && (
            <p className="mt-2 text-sm text-emerald-600">
              Thanks. Your message has been sent.
            </p>
          )}
          {status === "error" && Object.keys(errors).length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              Submission failed. Please try again.
            </p>
          )}
        </div>
      </form>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
