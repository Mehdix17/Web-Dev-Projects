import { get } from "@vercel/blob";

const VERCEL_BLOB_HOST_SUFFIX = ".blob.vercel-storage.com";

function isBlobUrlAllowed(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.hostname.endsWith(VERCEL_BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

function getBlobAccessMode(): "public" | "private" {
  const mode = (process.env.BLOB_ACCESS || "public").toLowerCase();
  return mode === "private" ? "private" : "public";
}

async function loadBlob(url: string, request: Request, access: "public" | "private") {
  return get(url, {
    access,
    ifNoneMatch: request.headers.get("if-none-match") || undefined,
    useCache: true,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const blobUrl = searchParams.get("url") || "";

  if (!blobUrl || !isBlobUrlAllowed(blobUrl)) {
    return new Response("Invalid Blob URL", { status: 400 });
  }

  try {
    const requestedAccess = getBlobAccessMode();
    let result;

    try {
      result = await loadBlob(blobUrl, request, requestedAccess);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      const shouldRetryAsPrivate =
        requestedAccess === "public" &&
        message.includes(
          "Cannot use public access on a private store. The store is configured with private access.",
        );

      if (!shouldRetryAsPrivate) {
        throw error;
      }

      result = await loadBlob(blobUrl, request, "private");
    }

    if (!result) {
      return new Response("Blob not found", { status: 404 });
    }

    if (result.statusCode === 304) {
      return new Response(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": result.blob.cacheControl,
        },
      });
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type": result.blob.contentType,
        "Cache-Control": result.blob.cacheControl,
        ETag: result.blob.etag,
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return new Response("Unable to load file", { status: 500 });
  }
}
