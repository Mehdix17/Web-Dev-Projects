"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ManagedWork } from "@/lib/work-types";
import { workCategories } from "@/lib/work-types";

const ADMIN_PAGE_SIZE = 8;
const MAX_PDF_SLIDE_PAGES = 24;
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
  category: "Pitch Decks",
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
  const [togglingFeaturedSlug, setTogglingFeaturedSlug] = useState<string | null>(
    null,
  );
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const raw = await response.text();
    let payload: { url?: string; error?: string } | null = null;
    try {
      payload = raw
        ? (JSON.parse(raw) as { url?: string; error?: string })
        : null;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(
        payload?.error || `Upload failed with status ${response.status}`,
      );
    }

    if (!payload?.url) {
      throw new Error("Upload succeeded but no file URL was returned.");
    }

    return payload.url;
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

    const payload = {
      slug: form.slug,
      title: form.title,
      category: form.category,
      year: Number(form.year),
      client: form.client,
      role: form.role,
      featured: form.featured,
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
    setTogglingFeaturedSlug(work.slug);
    setFormError("");

    setWorks((prev) =>
      prev.map((item) =>
        item.slug === work.slug ? { ...item, featured: nextFeatured } : item,
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
          item.slug === work.slug ? { ...item, featured: work.featured } : item,
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-center text-sm font-semibold text-[#2A0659]/70">
          Loading admin area...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-3xl border border-[#EAD2FF] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(42,6,89,0.9)]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7A21C8]">
            Admin Access
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#2A0659]">
            Slidely Admin
          </h1>
          <p className="mt-3 text-sm text-[#2A0659]/70">
            Sign in to manage your work portfolio with secure CRUD controls.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                className="mb-1 block text-sm font-semibold text-[#2A0659]"
                htmlFor="admin-username"
              >
                Username
              </label>
              <input
                id="admin-username"
                value={adminUsername}
                onChange={(event) => setAdminUsername(event.target.value)}
                className="w-full rounded-xl border border-[#D9B1FF] px-4 py-3 text-sm text-[#2A0659] outline-none transition-colors focus:border-[#7A21C8]"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-semibold text-[#2A0659]"
                htmlFor="admin-password"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
                className="w-full rounded-xl border border-[#D9B1FF] px-4 py-3 text-sm text-[#2A0659] outline-none transition-colors focus:border-[#7A21C8]"
                autoComplete="current-password"
                required
              />
            </div>

            {authError ? (
              <p className="text-sm font-semibold text-red-600">{authError}</p>
            ) : null}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#2A0659] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#B353FF] hover:text-[#2A0659]"
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

      <section className="rounded-3xl border border-[#EAD2FF] bg-gradient-to-br from-white via-[#FCF8FF] to-[#F7EFFF] p-6 shadow-[0_28px_60px_-44px_rgba(42,6,89,0.9)] md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7A21C8]">
              Admin Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[#2A0659] md:text-4xl">
              Portfolio Dashboard
            </h1>
            <p className="mt-2 text-sm text-[#2A0659]/70">
              You are signed in as admin. Browse the public website normally and
              manage portfolio data from this dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/gallery"
              className="rounded-full border border-[#D9B1FF] bg-white px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:bg-[#F8F1FF]"
            >
              View public site
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[#D9B1FF] bg-white px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:bg-[#F8F1FF]"
            >
              New project draft
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#D9B1FF] px-4 py-2 text-sm font-semibold text-[#2A0659] transition-colors hover:border-[#B353FF] hover:bg-[#F8F1FF]"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-[#EAD2FF] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
              Total Projects
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659]">
              {works.length}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
              Unique Clients
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659]">
              {uniqueClients}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
              Needs Completion
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659]">
              {worksMissingAssets}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAD2FF] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
              Active Filter
            </p>
            <p className="mt-2 text-3xl font-black text-[#2A0659]">
              {searchQuery.trim() ? "On" : "Off"}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-3xl border border-[#EAD2FF] bg-white p-6 shadow-[0_24px_55px_-44px_rgba(42,6,89,0.9)]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight text-[#2A0659]">
              Portfolio projects
            </h2>
            <p className="text-xs font-semibold text-[#2A0659]/70">
              {filteredWorks.length} matching result(s)
            </p>
          </div>

          <div className="mt-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by title, client, category, slug"
              className="w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm text-[#2A0659] outline-none focus:border-[#7A21C8]"
            />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#F0DFFF]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#FCF8FF] text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8]">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8]">
                    Year
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8]">
                    Featured
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A21C8]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleWorks.map((work) => (
                  <tr key={work.slug} className="border-t border-[#F0DFFF]">
                    <td className="px-4 py-3 text-sm font-semibold text-[#2A0659]">
                      {work.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2A0659]/70">
                      {work.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#2A0659]/70">
                      {work.year}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#2A0659]/80">
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
                          className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF]"
                        >
                          Edit
                        </button>
                        <Link
                          href={`/gallery/${work.slug}`}
                          className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF]"
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
                      className="px-4 py-6 text-center text-sm font-semibold text-[#2A0659]/70"
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
            <p className="text-xs font-semibold text-[#2A0659]/70">
              Page {Math.min(currentPage, totalPages)} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage <= 1}
                className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage >= totalPages}
                className="rounded-full border border-[#D9B1FF] px-3 py-1 text-xs font-semibold text-[#2A0659] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[#EAD2FF] bg-white p-6 shadow-[0_24px_55px_-44px_rgba(42,6,89,0.9)]">
          <h2 className="text-xl font-black tracking-tight text-[#2A0659]">
            {isEditing ? "Edit project" : "Add new project"}
          </h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#7A21C8]">
            {isEditing
              ? `Editing: ${editingSlug}`
              : "Create a new presentation case study"}
          </p>

          <form className="mt-5 space-y-4" onSubmit={submitForm}>
            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                Title
              </label>
              <input
                value={form.title}
                onChange={(event) =>
                  handleFormChange("title", event.target.value)
                }
                className="w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    handleFormChange("slug", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                  Year
                </label>
                <input
                  value={form.year}
                  onChange={(event) =>
                    handleFormChange("year", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
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
                  className="w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm"
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
                <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                  Client
                </label>
                <input
                  value={form.client}
                  onChange={(event) =>
                    handleFormChange("client", event.target.value)
                  }
                  className="w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                Role
              </label>
              <input
                value={form.role}
                onChange={(event) =>
                  handleFormChange("role", event.target.value)
                }
                className="w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                Thumbnail image
              </label>
              <div className="mt-2 flex items-center gap-2">
                <label className="rounded-full border border-[#D9B1FF] px-3 py-1.5 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF] cursor-pointer">
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
              <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                Presentation PDF (landscape)
              </label>
              <div className="mt-2 flex items-center gap-2">
                <label className="rounded-full border border-[#D9B1FF] px-3 py-1.5 text-xs font-semibold text-[#2A0659] hover:bg-[#F8F1FF] cursor-pointer">
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
              <label className="mb-1 block text-sm font-semibold text-[#2A0659]">
                Quick description
              </label>
              <textarea
                value={form.summary}
                onChange={(event) =>
                  handleFormChange("summary", event.target.value)
                }
                className="min-h-[90px] w-full rounded-xl border border-[#D9B1FF] px-3 py-2 text-sm"
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
                className="rounded-full bg-[#2A0659] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#B353FF] hover:text-[#2A0659] disabled:opacity-60"
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
                  className="rounded-full border border-[#D9B1FF] px-5 py-2 text-sm font-semibold text-[#2A0659]"
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
