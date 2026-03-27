"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { ManagedWork } from "@/lib/work-types";
import { workCategories } from "@/lib/work-types";
import { Card } from "@/components/ui/Card";

const ADMIN_PAGE_SIZE = 8;
const MAX_PDF_SLIDE_PAGES = 100; // Increased to support larger decks
const TARGET_SLIDE_WIDTH = 1920;
const TARGET_SLIDE_HEIGHT = 1080;

type WorkFormState = {
  slug: string;
  title: string;
  category: ManagedWork["category"];
  year: string;
  client: string;
  role: string;
  featured: boolean;
  thumbnailUrl: string;
  pdfUrl: string;
  slideUrls: string[];
  summary: string;
};

type ToastState = {
  kind: "success" | "error";
  message: string;
} | null;

const emptyForm: WorkFormState = {
  slug: "",
  title: "",
  category: "Pitch Deck",
  year: String(new Date().getFullYear()),
  client: "",
  role: "Presentation Designer",
  featured: false,
  thumbnailUrl: "",
  pdfUrl: "",
  slideUrls: [],
  summary: "",
};

function toForm(work: ManagedWork): WorkFormState {
  return {
    slug: work.slug,
    title: work.title,
    category: work.category,
    year: String(work.year),
    client: work.client,
    role: work.role,
    featured: Boolean(work.featured),
    thumbnailUrl: work.thumbnail,
    pdfUrl: work.pdfUrl,
    slideUrls: work.slides || [],
    summary: work.summary,
  };
}

function normalizeFeaturedOrder(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return Number.MAX_SAFE_INTEGER;
  }

  return Math.floor(value);
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [works, setWorks] = useState<ManagedWork[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<WorkFormState>(emptyForm);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [togglingFeaturedSlug, setTogglingFeaturedSlug] = useState<
    string | null
  >(null);
  const [draggingFeaturedSlug, setDraggingFeaturedSlug] = useState<
    string | null
  >(null);
  const [isSavingFeaturedOrder, setIsSavingFeaturedOrder] = useState(false);
  const [editFromQuery, setEditFromQuery] = useState("");
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (kind: "success" | "error", message: string) => {
    setToast({ kind, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const isEditing = useMemo(() => Boolean(editingSlug), [editingSlug]);
  const uniqueClients = useMemo(
    () => new Set(works.map((work) => work.client.trim()).filter(Boolean)).size,
    [works],
  );
  const worksMissingAssets = useMemo(
    () =>
      works.filter(
        (work) =>
          !work.thumbnail?.trim() ||
          !(work.slides && work.slides.length > 0) ||
          !work.summary?.trim() ||
          !work.client?.trim(),
      ).length,
    [works],
  );

  const filteredWorks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return works;

    return works.filter((work) => {
      const value =
        `${work.title} ${work.client} ${work.category} ${work.slug}`.toLowerCase();
      return value.includes(query);
    });
  }, [works, searchQuery]);

  const orderedFeaturedWorks = useMemo(
    () =>
      works
        .filter((work) => work.featured)
        .sort((a, b) => {
          const aOrder = normalizeFeaturedOrder(a.featuredOrder);
          const bOrder = normalizeFeaturedOrder(b.featuredOrder);

          if (aOrder !== bOrder) {
            return aOrder - bOrder;
          }

          return a.title.localeCompare(b.title);
        }),
    [works],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredWorks.length / ADMIN_PAGE_SIZE),
  );
  const visibleWorks = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ADMIN_PAGE_SIZE;
    return filteredWorks.slice(start, start + ADMIN_PAGE_SIZE);
  }, [filteredWorks, currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const fetchWorks = async () => {
    const response = await fetch("/api/admin/works", { cache: "no-store" });
    if (!response.ok) {
      if (response.status === 401) {
        setIsAuthenticated(false);
      }
      return;
    }
    const data = (await response.json()) as { works: ManagedWork[] };
    setWorks(data.works || []);
  };

  useEffect(() => {
    let active = true;

    const init = async () => {
      const me = await fetch("/api/admin/me", { cache: "no-store" });
      if (!active) return;

      if (!me.ok) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      await fetchWorks();
      if (!active) return;

      setIsLoading(false);
    };

    void init();

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: adminUsername,
        password: adminPassword,
      }),
    });

    if (!response.ok) {
      setAuthError("Invalid credentials. Please try again.");
      return;
    }

    setAdminPassword("");
    setIsAuthenticated(true);
    window.dispatchEvent(new Event("admin-auth-changed"));
    await fetchWorks();
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("admin-auth-changed"));
    setWorks([]);
    setForm(emptyForm);
    setEditingSlug(null);
  };

  const handleFormChange = <K extends keyof WorkFormState>(
    key: K,
    value: WorkFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startEdit = (work: ManagedWork) => {
    setEditingSlug(work.slug);
    setFormError("");
    setForm(toForm(work));
  };

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("edit");
    setEditFromQuery((slug || "").trim());
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !editFromQuery) return;
    if (editingSlug === editFromQuery) return;

    const match = works.find((work) => work.slug === editFromQuery);
    if (!match) return;

    startEdit(match);
  }, [isAuthenticated, editFromQuery, works, editingSlug]);

  const resetForm = () => {
    setEditingSlug(null);
    setFormError("");
    setForm(emptyForm);
  };

  const uploadAsset = async (
    file: File,
    kind: "thumbnail" | "deck" | "slide",
  ) => {
    const makeClientUpload = async () => {
      const ext = file.name.includes(".")
        ? file.name.split(".").pop() || "bin"
        : file.type.split("/").pop() || "bin";
      const finalPath = `uploads/works/${kind}-${Date.now()}-${crypto.randomUUID()}.${ext}`;

      const result = await upload(finalPath, file, {
        access: "public",
        handleUploadUrl: `/api/admin/blob-upload?kind=${kind}`,
        clientPayload: JSON.stringify({
          kind,
          contentType: file.type,
          size: file.size,
        }),
        contentType: file.type || undefined,
        multipart: file.size > 4.5 * 1024 * 1024,
      });

      if (!result?.url) {
        throw new Error("Blob client upload did not return a URL.");
      }

      return result.url;
    };

    return await makeClientUpload();
  };

  const canvasToJpegBlob = (canvas: HTMLCanvasElement, quality = 0.86) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Unable to render a slide image from this PDF."));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality,
      );
    });

  const convertPdfToSlideImages = async (file: File) => {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

    const bytes = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;

    if (pdf.numPages > MAX_PDF_SLIDE_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. Maximum supported is ${MAX_PDF_SLIDE_PAGES} pages.`,
      );
    }

    const files: File[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(
        TARGET_SLIDE_WIDTH / baseViewport.width,
        TARGET_SLIDE_HEIGHT / baseViewport.height,
      );
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to create canvas context for PDF conversion.");
      }

      canvas.width = TARGET_SLIDE_WIDTH;
      canvas.height = TARGET_SLIDE_HEIGHT;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const offsetX = (TARGET_SLIDE_WIDTH - viewport.width) / 2;
      const offsetY = (TARGET_SLIDE_HEIGHT - viewport.height) / 2;

      await page.render({
        canvasContext: context,
        viewport,
        transform: [1, 0, 0, 1, offsetX, offsetY],
      }).promise;
      const blob = await canvasToJpegBlob(canvas);

      files.push(
        new File([blob], `slide-${pageNumber}.jpg`, {
          type: "image/jpeg",
        }),
      );
    }

    return files;
  };

  const handleThumbnailUpload = async (file?: File) => {
    if (!file) return;
    setFormError("");
    setIsUploadingThumb(true);

    try {
      const url = await uploadAsset(file, "thumbnail");
      handleFormChange("thumbnailUrl", url);
      showToast("success", "Thumbnail uploaded successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Thumbnail upload failed";
      setFormError(message);
      showToast("error", message);
    } finally {
      setIsUploadingThumb(false);
    }
  };

  const handlePdfUpload = async (file?: File) => {
    if (!file) return;
    setFormError("");
    setIsUploadingPdf(true);

    try {
      const url = await uploadAsset(file, "deck");
      const slideFiles = await convertPdfToSlideImages(file);
      const uploadedSlideUrls: string[] = [];

      for (const slideFile of slideFiles) {
        const slideUrl = await uploadAsset(slideFile, "slide");
        uploadedSlideUrls.push(slideUrl);
      }

      handleFormChange("pdfUrl", url);
      handleFormChange("slideUrls", uploadedSlideUrls);
      showToast(
        "success",
        `PDF uploaded and converted to ${uploadedSlideUrls.length} slide image(s).`,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PDF upload failed";
      setFormError(message);
      showToast("error", message);
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!form.thumbnailUrl.trim()) {
      setFormError("Please upload a thumbnail image.");
      return;
    }

    if (!form.pdfUrl.trim()) {
      setFormError("Please upload a presentation PDF.");
      return;
    }

    if (form.slideUrls.length === 0) {
      setFormError("Please upload a PDF and generate slide images.");
      return;
    }

    setIsSaving(true);

    const existingWork = editingSlug
      ? works.find((work) => work.slug === editingSlug)
      : null;

    const payload = {
      slug: form.slug,
      title: form.title,
      category: form.category,
      year: Number(form.year),
      client: form.client,
      role: form.role,
      featured: form.featured,
      featuredOrder: form.featured
        ? (existingWork?.featuredOrder ?? null)
        : null,
      thumbnail: form.thumbnailUrl,
      pdfUrl: form.pdfUrl,
      slides: form.slideUrls,
      summary: form.summary,
    };

    const endpoint = isEditing
      ? `/api/admin/works/${editingSlug}`
      : "/api/admin/works";
    const method = isEditing ? "PUT" : "POST";
    const actionLabel = isEditing ? "updated" : "created";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data: { error?: string } | null = null;
      try {
        data = raw ? (JSON.parse(raw) as { error?: string }) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          data?.error ||
          `Unable to save this work (status ${response.status}).`;
        setFormError(message);
        showToast("error", message);
        return;
      }

      await fetchWorks();
      resetForm();
      showToast("success", `Project ${actionLabel} successfully.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save this work right now.";
      setFormError(message);
      showToast("error", message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWork = async (slug: string) => {
    const confirmed = window.confirm("Delete this work permanently?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/works/${slug}`, {
        method: "DELETE",
      });
      const raw = await response.text();
      let data: { error?: string } | null = null;
      try {
        data = raw ? (JSON.parse(raw) as { error?: string }) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          data?.error ||
          `Unable to delete this work (status ${response.status}).`;
        setFormError(message);
        showToast("error", message);
        return;
      }

      if (editingSlug === slug) resetForm();
      await fetchWorks();
      showToast("success", "Project deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete this work right now.";
      setFormError(message);
      showToast("error", message);
    }
  };

  const toggleFeatured = async (work: ManagedWork) => {
    const nextFeatured = !work.featured;
    const nextFeaturedOrder = nextFeatured ? orderedFeaturedWorks.length : null;
    setTogglingFeaturedSlug(work.slug);
    setFormError("");

    setWorks((prev) =>
      prev.map((item) =>
        item.slug === work.slug
          ? {
              ...item,
              featured: nextFeatured,
              featuredOrder: nextFeaturedOrder,
            }
          : item,
      ),
    );

    if (editingSlug === work.slug) {
      handleFormChange("featured", nextFeatured);
    }

    try {
      const payload = {
        slug: work.slug,
        title: work.title,
        category: work.category,
        year: work.year,
        client: work.client,
        role: work.role,
        featured: nextFeatured,
        featuredOrder: nextFeaturedOrder,
        thumbnail: work.thumbnail,
        pdfUrl: work.pdfUrl,
        slides: work.slides || [],
        summary: work.summary,
      };

      const response = await fetch(`/api/admin/works/${work.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data: { error?: string } | null = null;
      try {
        data = raw ? (JSON.parse(raw) as { error?: string }) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Unable to update featured status (status ${response.status}).`,
        );
      }

      showToast(
        "success",
        nextFeatured
          ? "Project added to Featured Projects."
          : "Project removed from Featured Projects.",
      );
      await fetchWorks();
    } catch (error) {
      setWorks((prev) =>
        prev.map((item) =>
          item.slug === work.slug
            ? {
                ...item,
                featured: work.featured,
                featuredOrder: work.featuredOrder,
              }
            : item,
        ),
      );

      if (editingSlug === work.slug) {
        handleFormChange("featured", work.featured);
      }

      const message =
        error instanceof Error
          ? error.message
          : "Unable to update featured status.";
      setFormError(message);
      showToast("error", message);
    } finally {
      setTogglingFeaturedSlug(null);
    }
  };

  const persistFeaturedOrder = async (orderedSlugs: string[]) => {
    setIsSavingFeaturedOrder(true);
    try {
      const response = await fetch("/api/admin/works/featured-order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedSlugs }),
      });

      const raw = await response.text();
      const data = raw ? (JSON.parse(raw) as { error?: string }) : null;

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Unable to save featured order (status ${response.status}).`,
        );
      }

      showToast("success", "Featured layout updated.");
      await fetchWorks();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save featured layout right now.";
      setFormError(message);
      showToast("error", message);
      await fetchWorks();
    } finally {
      setIsSavingFeaturedOrder(false);
    }
  };

  const moveFeaturedProject = async (
    sourceSlug: string,
    targetSlug: string,
  ) => {
    if (!sourceSlug || !targetSlug || sourceSlug === targetSlug) {
      return;
    }

    const current = [...orderedFeaturedWorks];
    const fromIndex = current.findIndex((item) => item.slug === sourceSlug);
    const toIndex = current.findIndex((item) => item.slug === targetSlug);

    if (fromIndex < 0 || toIndex < 0) {
      return;
    }

    const next = [...current];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    const orderLookup = new Map(
      next.map((item, index) => [item.slug, index] as const),
    );

    setWorks((prev) =>
      prev.map((item) => {
        if (!item.featured) {
          return item;
        }

        const featuredOrder = orderLookup.get(item.slug);
        return {
          ...item,
          featuredOrder:
            typeof featuredOrder === "number" ? featuredOrder : null,
        };
      }),
    );

    await persistFeaturedOrder(next.map((item) => item.slug));
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-sm font-semibold text-[#2A0659]/70 dark:text-[#EAD9FF]/88">
          Loading admin area...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-[#EAD2FF] bg-background p-8 shadow-[0_20px_50px_-38px_rgba(42,6,89,0.9)] dark:border-[#5A3D7A] dark:bg-[#1A0E2C]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A21C8] dark:text-[#CFA9FF]">
            Admin Access
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF]">
            Slidely Admin
          </h1>
          <p className="mt-3 text-sm text-[#2A0659]/70 dark:text-[#EAD9FF]/90">
            Sign in to manage your work portfolio with secure CRUD controls.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]"
                htmlFor="admin-username"
              >
                Username
              </label>
              <input
                id="admin-username"
                value={adminUsername}
                onChange={(event) => setAdminUsername(event.target.value)}
                className="w-full rounded-xl border border-[#D9B1FF] bg-white px-4 py-3 text-sm text-[#2A0659] outline-none transition-colors focus:border-[#7A21C8] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]"
                htmlFor="admin-password"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="w-full rounded-xl border border-[#D9B1FF] bg-white px-4 py-3 text-sm text-[#2A0659] outline-none transition-colors focus:border-[#7A21C8] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                autoComplete="current-password"
                required
              />
            </div>

            {authError ? (
              <p className="text-sm font-semibold text-red-600">{authError}</p>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2A0659] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B353FF] hover:text-white"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {toast ? (
        <div
          className="fixed right-4 top-4 z-[120]"
          role="status"
          aria-live="polite"
        >
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_20px_40px_-30px_rgba(42,6,89,0.85)] ${
              toast.kind === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}

      <section className="rounded-3xl border border-[#EAD2FF] bg-gradient-to-br from-white via-[#FCF8FF] to-[#F7EFFF] p-6 shadow-[0_28px_60px_-44px_rgba(42,6,89,0.9)] dark:border-[#5A3D7A] dark:from-[#1A0E2C] dark:via-[#211136] dark:to-[#2A1544] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF] md:text-4xl">
              Portfolio Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#2A0659]/70 dark:text-[#EAD9FF]/90">
              You are signed in as admin. Browse the public website normally and
              manage portfolio data from this dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/gallery"
              className="rounded-full border border-[#D9B1FF] bg-background px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:bg-[#F8F1FF] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF] dark:hover:bg-[#362055]"
            >
              View public site
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[#D9B1FF] bg-background px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:bg-[#F8F1FF] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF] dark:hover:bg-[#362055]"
            >
              New project draft
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#D9B1FF] px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:border-[#B353FF] hover:bg-[#F8F1FF] dark:border-[#715095] dark:text-[#F8EEFF] dark:hover:bg-[#362055]"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#EAD2FF] bg-background p-4 dark:border-[#5A3D7A] dark:bg-[#1B0C30]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Total Projects
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659] dark:text-[#F8EEFF]">
              {works.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-background p-4 dark:border-[#5A3D7A] dark:bg-[#1B0C30]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Unique Clients
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659] dark:text-[#F8EEFF]">
              {uniqueClients}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-background p-4 dark:border-[#5A3D7A] dark:bg-[#1B0C30]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Needs Completion
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659] dark:text-[#F8EEFF]">
              {worksMissingAssets}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-background p-4 dark:border-[#5A3D7A] dark:bg-[#1B0C30]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8] dark:text-[#CFA9FF]">
              Active Filter
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659] dark:text-[#F8EEFF]">
              {searchQuery.trim() ? "On" : "Off"}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-3xl border border-[#EAD2FF] bg-background p-6 shadow-[0_24px_55px_-44px_rgba(42,6,89,0.9)] dark:border-[#5A3D7A] dark:bg-[#1A0E2C]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF]">
              Portfolio projects
            </h2>
            <p className="text-xs font-semibold text-[#2A0659]/70 dark:text-[#EAD9FF]/88">
              {filteredWorks.length} matching result(s)
            </p>
          </div>

          <div className="mt-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, client, category, slug"
              className="w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] outline-none focus:border-[#7A21C8] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#F0DFFF] dark:border-[#5A3D7A]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FCF8FF] text-left dark:bg-[#2A1842]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8] dark:text-[#CFA9FF]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8] dark:text-[#CFA9FF]">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8] dark:text-[#CFA9FF]">
                    Year
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8] dark:text-[#CFA9FF]">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8] dark:text-[#CFA9FF]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleWorks.map((work) => (
                  <tr
                    key={work.slug}
                    className="border-t border-[#F0DFFF] dark:border-[#5A3D7A]"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-[#2A0659] dark:text-[#F8EEFF]">
                      {work.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2A0659]/70 dark:text-[#EAD9FF]/90">
                      {work.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2A0659]/70 dark:text-[#EAD9FF]/90">
                      {work.year}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#2A0659]/80 dark:text-[#EAD9FF]/92">
                      <button
                        type="button"
                        aria-label={
                          work.featured
                            ? `Unfeature ${work.title}`
                            : `Feature ${work.title}`
                        }
                        title={
                          work.featured
                            ? "Remove from Featured Projects"
                            : "Add to Featured Projects"
                        }
                        onClick={() => void toggleFeatured(work)}
                        disabled={togglingFeaturedSlug === work.slug}
                        className={`text-lg leading-none transition-colors ${
                          work.featured
                            ? "text-[#7A21C8]"
                            : "text-[#2A0659]/30 hover:text-[#7A21C8]"
                        } disabled:opacity-50`}
                      >
                        {work.featured ? "★" : "☆"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(work)}
                          className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF] dark:border-[#715095] dark:text-[#F8EEFF] dark:hover:bg-[#362055]"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/gallery/${work.slug}`}
                          className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF] dark:border-[#715095] dark:text-[#F8EEFF] dark:hover:bg-[#362055]"
                        >
                          Preview
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteWork(work.slug)}
                          className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {visibleWorks.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-sm font-semibold text-[#2A0659]/70 dark:text-[#EAD9FF]/88"
                      colSpan={5}
                    >
                      No project matches your search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#2A0659]/70 dark:text-[#EAD9FF]/88">
              Page {Math.min(currentPage, totalPages)} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1}
                className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] disabled:opacity-40 dark:border-[#715095] dark:text-[#F8EEFF]"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage >= totalPages}
                className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] disabled:opacity-40 dark:border-[#715095] dark:text-[#F8EEFF]"
              >
                Next
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#F0DFFF] bg-[#FCF8FF]/80 p-4 dark:border-[#5A3D7A] dark:bg-[#221337]">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF]">
                Featured projects layout
              </h3>
              <span className="text-xs font-semibold text-[#2A0659]/70 dark:text-[#EAD9FF]/90">
                Drag to reorder home grid
              </span>
            </div>

            {orderedFeaturedWorks.length === 0 ? (
              <p className="mt-3 text-sm font-semibold text-[#2A0659]/70 dark:text-[#EAD9FF]/88">
                Mark at least one project as featured to customize layout.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-[minmax(180px,auto)_minmax(140px,auto)_minmax(140px,auto)]">
                {orderedFeaturedWorks.slice(0, 5).map((work, index) => (
                  <button
                    key={work.slug}
                    type="button"
                    draggable
                    onDragStart={() => setDraggingFeaturedSlug(work.slug)}
                    onDragEnd={() => setDraggingFeaturedSlug(null)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (!draggingFeaturedSlug) return;
                      void moveFeaturedProject(draggingFeaturedSlug, work.slug);
                    }}
                    className={`group block focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl ${
                      index === 0
                        ? "md:col-span-4 md:row-span-2"
                        : "md:col-span-2 md:row-span-1"
                    } ${
                      draggingFeaturedSlug === work.slug
                        ? "ring-2 ring-offset-2 ring-primary"
                        : ""
                    } ${isSavingFeaturedOrder ? "opacity-70" : ""}`}
                    disabled={isSavingFeaturedOrder}
                  >
                    <Card className="flex h-full flex-col overflow-hidden pb-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg">
                      <div className="relative mb-4 w-full flex-1 min-h-[120px] overflow-hidden rounded-xl">
                        <Image
                          src={work.thumbnail || "/placeholder.jpg"}
                          alt={`${work.title} thumbnail`}
                          className="object-cover"
                          fill
                          sizes={
                            index === 0
                              ? "(min-width: 768px) 66vw, 100vw"
                              : "(min-width: 768px) 33vw, 100vw"
                          }
                        />
                      </div>
                      <div className="shrink-0 px-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          {work.category}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold leading-tight text-gray-900 dark:text-gray-100">
                          {work.title}
                        </h3>
                        <p className="mt-1 text-xs font-medium text-[#2A0659]/70 dark:text-[#EAD9FF]/88">
                          Slot {index + 1}
                        </p>
                      </div>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-[#EAD2FF] bg-background p-6 shadow-[0_24px_55px_-44px_rgba(42,6,89,0.9)] dark:border-[#5A3D7A] dark:bg-[#1A0E2C]">
          <h2 className="text-xl font-black tracking-tight text-[#2A0659] dark:text-[#F8EEFF]">
            {isEditing ? "Edit project" : "Add new project"}
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
            {isEditing
              ? `Editing: ${editingSlug}`
              : "Create a new presentation case study"}
          </p>

          <form className="mt-5 space-y-4" onSubmit={submitForm}>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                Title
              </label>
              <input
                value={form.title}
                onChange={(event) =>
                  handleFormChange("title", event.target.value)
                }
                className="w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    handleFormChange("slug", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                  Year
                </label>
                <input
                  value={form.year}
                  onChange={(event) =>
                    handleFormChange("year", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    handleFormChange(
                      "category",
                      event.target.value as ManagedWork["category"],
                    )
                  }
                  className="w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                  required
                >
                  {workCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                  Client
                </label>
                <input
                  value={form.client}
                  onChange={(event) =>
                    handleFormChange("client", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                Role
              </label>
              <input
                value={form.role}
                onChange={(event) =>
                  handleFormChange("role", event.target.value)
                }
                className="w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                Thumbnail image
              </label>
              <div className="mt-2 flex items-center gap-2">
                <label className="cursor-pointer rounded-full border border-[#D9B1FF] px-3 py-1.5 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF] dark:border-[#715095] dark:text-[#F8EEFF] dark:hover:bg-[#362055]">
                  {isUploadingThumb ? "Uploading..." : "Upload thumbnail"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingThumb}
                    onChange={(event) => {
                      void handleThumbnailUpload(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {form.thumbnailUrl && !isUploadingThumb ? (
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                    ✓ Uploaded
                  </span>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                Presentation PDF (landscape)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <label className="cursor-pointer rounded-full border border-[#D9B1FF] px-3 py-1.5 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF] dark:border-[#715095] dark:text-[#F8EEFF] dark:hover:bg-[#362055]">
                  {isUploadingPdf ? "Uploading + converting..." : "Upload PDF"}
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled={isUploadingPdf}
                    onChange={(event) => {
                      void handlePdfUpload(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
                {form.pdfUrl && form.slideUrls.length > 0 && !isUploadingPdf ? (
                  <span className="inline-flex items-center text-xs font-semibold text-emerald-700">
                    ✓ Uploaded
                  </span>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659] dark:text-[#F3E8FF]">
                Quick description
              </label>
              <textarea
                value={form.summary}
                onChange={(event) =>
                  handleFormChange("summary", event.target.value)
                }
                className="min-h-[90px] w-full rounded-xl border border-[#D9B1FF] bg-white px-3 py-2 text-sm text-[#2A0659] dark:border-[#715095] dark:bg-[#2A1842] dark:text-[#F8EEFF]"
                required
              />
            </div>

            {formError ? (
              <p className="text-sm font-semibold text-red-600">{formError}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-[#2A0659] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B353FF] hover:text-white disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : isEditing
                    ? "Update work"
                    : "Create work"}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-[#D9B1FF] px-5 py-2 text-sm font-semibold text-[#2A0659] dark:border-[#715095] dark:text-[#F8EEFF]"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
