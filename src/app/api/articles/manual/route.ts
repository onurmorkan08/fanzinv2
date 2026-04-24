import { fetchManualRawArticle } from "@/lib/articles/fetch";
import { finalizeArticle } from "@/lib/articles/finalize";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const url = body.url?.trim();

    if (!url) {
      return Response.json({ error: "A manual link is required." }, { status: 400 });
    }

    const parsedUrl = new URL(url);

    if (!/^https?:$/.test(parsedUrl.protocol)) {
      return Response.json(
        { error: "Only http and https manual links are supported." },
        { status: 400 },
      );
    }

    const rawArticle = await fetchManualRawArticle(parsedUrl.toString());
    const story = await finalizeArticle(rawArticle);

    return Response.json({ story });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Manual article extraction failed.",
      },
      { status: 500 },
    );
  }
}
