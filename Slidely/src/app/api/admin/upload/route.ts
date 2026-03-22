import path from "node:path";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentAdminUser } from "@/lib/admin-auth";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);
const PDF_MIME_TYPE = "application/pdf";

function getExtensionFromType(type: string) {
  if (type === PDF_MIME_TYPE) return "pdf";
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  if (type === "image/gif") return "gif";
  if (type === "image/svg+xml") return "svg";
  return "bin";
}

function sanitizeName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentAdminUser())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const kindRaw = String(form.get("kind") || "thumbnail");
    const kind = sanitizeName(kindRaw) || "thumbnail";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isDeckUpload = kind === "deck";
    const isValidImageUpload = kind === "thumbnail";

    if (isDeckUpload && file.type !== PDF_MIME_TYPE) {
      return NextResponse.json(
        { error: "Invalid file type. Upload a PDF file for deck uploads." },
        { status: 400 },
      );
    }

    if (isValidImageUpload && !allowedImageMimeTypes.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Upload a valid image for thumbnails." },
        { status: 400 },
      );
    }

    if (!isDeckUpload && !isValidImageUpload) {
      return NextResponse.json(
        { error: "Invalid upload kind. Use 'thumbnail' or 'deck'." },
        { status: 400 },
      );
    }

    const maxSize = isDeckUpload ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: isDeckUpload
            ? "File too large. Maximum allowed PDF size is 25MB."
            : "File too large. Maximum allowed image size is 8MB.",
        },
        { status: 400 },
      );
    }

    const extension = getExtensionFromType(file.type);
    const fileName = `${kind}-${Date.now()}-${randomUUID()}.${extension}`;
    const relativeDir = path.join("uploads", "works");
    const relativeUrlPath = `/${relativeDir.replace(/\\/g, "/")}/${fileName}`;

    if (hasBlobStorage()) {
      const blobPath = `${relativeDir.replace(/\\/g, "/")}/${fileName}`;
      const blob = await put(blobPath, file, {
        access: "public",
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Blob storage is not configured. Set BLOB_READ_WRITE_TOKEN in Vercel environment variables.",
        },
        { status: 500 },
      );
    }

    const absoluteDir = path.join(process.cwd(), "public", relativeDir);
    const absoluteFilePath = path.join(absoluteDir, fileName);
    await fs.mkdir(absoluteDir, { recursive: true });
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(absoluteFilePath, Buffer.from(arrayBuffer));

    return NextResponse.json({ url: relativeUrlPath });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected upload error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
