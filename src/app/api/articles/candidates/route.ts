import { fetchAutoRawArticles } from "@/lib/articles/fetch";
import { finalizeArticle } from "@/lib/articles/finalize";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rawArticles = await fetchAutoRawArticles();
    const stories = await Promise.all(rawArticles.map((article) => finalizeArticle(article)));

    return Response.json({
      stories,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        stories: [],
        error:
          error instanceof Error
            ? error.message
            : "Automatic source ingestion failed.",
      },
      { status: 500 },
    );
  }
}
