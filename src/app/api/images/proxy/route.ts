export const dynamic = "force-dynamic";

function isAllowedRemoteImageUrl(value: string) {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const imageUrl = requestUrl.searchParams.get("url")?.trim();

  if (!imageUrl || !isAllowedRemoteImageUrl(imageUrl)) {
    return Response.json({ error: "A valid image URL is required." }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return Response.json(
        { error: `Image request failed with status ${response.status}.` },
        { status: 502 },
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageBody = await response.arrayBuffer();

    return new Response(imageBody, {
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "no-store",
        "content-type": contentType,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Image proxy request failed.",
      },
      { status: 502 },
    );
  }
}
