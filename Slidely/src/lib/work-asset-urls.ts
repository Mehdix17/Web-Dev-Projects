import type { ManagedWork } from "@/lib/work-types";

const VERCEL_BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

function isVercelBlobUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export function resolvePublicAssetUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/api/blob?url=")) return trimmed;
  if (!isVercelBlobUrl(trimmed)) return trimmed;
  return `/api/blob?url=${encodeURIComponent(trimmed)}`;
}

export function resolvePublicWorkAssets(work: ManagedWork): ManagedWork {
  return {
    ...work,
    thumbnail: resolvePublicAssetUrl(work.thumbnail),
    pdfUrl: resolvePublicAssetUrl(work.pdfUrl),
  };
}
