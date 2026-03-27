import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getCurrentAdminUser } from "@/lib/admin-auth";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;
const allowedImageMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);
const PDF_MIME_TYPE = "application/pdf";

function validateFileType(kind: string, contentType: string | undefined) {
  const isDeck = kind === "deck";
  const isImage = kind === "thumbnail" || kind === "slide";

  if (isDeck) {
    if (contentType !== PDF_MIME_TYPE) {
      throw new Error("Invalid content type for PDF upload.");
    }
  } else if (isImage) {
    if (!contentType || !allowedImageMimeTypes.has(contentType)) {
      throw new Error("Invalid content type for image upload.");
    }
  } else {
    throw new Error(
      "Invalid upload kind. Use 'thumbnail', 'slide', or 'deck'.",
    );
  }
}

function validateSize(kind: string, size: number) {
  const maxSize = kind === "deck" ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
  if (size > maxSize) {
    throw new Error(
      kind === "deck"
        ? "File too large. Maximum allowed PDF size is 10MB."
        : "File too large. Maximum allowed image size is 8MB.",
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await getCurrentAdminUser())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const kind = (url.searchParams.get("kind") || "deck").toLowerCase();

    const body = await request.json();

    const response = await handleUpload({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      request,
      body,
      onBeforeGenerateToken: async (_pathname, clientPayloadString) => {
        let clientPayload = {} as {
          kind?: string;
          contentType?: string;
          size?: number;
        };
        if (clientPayloadString) {
          try {
            clientPayload = JSON.parse(clientPayloadString);
          } catch {
            // keep empty if invalid
          }
        }

        const requestedKind =
          typeof clientPayload.kind === "string" ? clientPayload.kind : kind;
        const requestedContentType = String(clientPayload.contentType || "");
        const requestedSize = Number(clientPayload.size || 0);

        if (requestedKind !== kind) {
          throw new Error("Kind mismatch");
        }

        // Accept missing content-type if pathname extension is valid.
        let validatedContentType = requestedContentType;
        if (!validatedContentType) {
          const lowerPath = String(_pathname || "").toLowerCase();
          if (lowerPath.endsWith(".pdf")) validatedContentType = PDF_MIME_TYPE;
          if (lowerPath.endsWith(".jpg") || lowerPath.endsWith(".jpeg"))
            validatedContentType = "image/jpeg";
          if (lowerPath.endsWith(".png")) validatedContentType = "image/png";
          if (lowerPath.endsWith(".webp")) validatedContentType = "image/webp";
          if (lowerPath.endsWith(".avif")) validatedContentType = "image/avif";
          if (lowerPath.endsWith(".gif")) validatedContentType = "image/gif";
          if (lowerPath.endsWith(".svg"))
            validatedContentType = "image/svg+xml";
        }

        validateFileType(kind, validatedContentType);

        const sizeToCheck =
          requestedSize > 0
            ? requestedSize
            : kind === "deck"
              ? MAX_PDF_SIZE_BYTES
              : MAX_IMAGE_SIZE_BYTES;
        validateSize(kind, sizeToCheck);

        return {
          allowedContentTypes:
            kind === "deck"
              ? [PDF_MIME_TYPE]
              : Array.from(allowedImageMimeTypes),
          maximumSizeInBytes:
            kind === "deck" ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES,
        };
      },
      onUploadCompleted: async () => undefined,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected upload error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
