import { extractArticleFromHtml, extractArticleLinksFromListing, inferSourceNameFromUrl } from "./extract";
import type { RawArticle, SourceDefinition } from "./types";

export const AUTO_SOURCES: SourceDefinition[] = [
  {
    name: "Cumhuriyet",
    listingUrl: "https://www.cumhuriyet.com.tr/siyaset",
    articlePathHints: ["/haber/", "/siyaset/"],
  },
  {
    name: "Sözcü",
    listingUrl: "https://www.sozcu.com.tr/gundem/",
    articlePathHints: ["/", "/gundem/"],
    excludePathHints: ["/yazarlar/", "/video/", "/galeri/", "/astroloji/"],
  },
  {
    name: "BirGün",
    listingUrl: "https://www.birgun.net/kategori/siyaset-8",
    articlePathHints: ["/haber/", "/makale/"],
  },
  {
    name: "T24",
    listingUrl: "https://t24.com.tr/haber/politika",
    articlePathHints: ["/haber/", "/yazarlar/"],
    excludePathHints: ["/video/", "/foto-haber/"],
  },
];

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.text();
}

function dedupeArticles(articles: RawArticle[]) {
  const seen = new Set<string>();
  const unique: RawArticle[] = [];

  for (const article of articles) {
    if (seen.has(article.sourceUrl)) {
      continue;
    }

    seen.add(article.sourceUrl);
    unique.push(article);
  }

  return unique;
}

async function fetchArticle(url: string, sourceType: "auto" | "manual", sourceName?: string) {
  const html = await fetchHtml(url);

  return extractArticleFromHtml({
    html,
    sourceType,
    sourceUrl: url,
    sourceName: sourceName ?? inferSourceNameFromUrl(url),
  });
}

async function fetchSourceArticles(source: SourceDefinition) {
  const listingHtml = await fetchHtml(source.listingUrl);
  const articleLinks = extractArticleLinksFromListing({
    html: listingHtml,
    listingUrl: source.listingUrl,
    articlePathHints: source.articlePathHints,
    excludePathHints: source.excludePathHints,
  }).slice(0, 6);

  const results = await Promise.allSettled(
    articleLinks.map((url) => fetchArticle(url, "auto", source.name)),
  );

  return results
    .flatMap((result) => (result.status === "fulfilled" ? [result.value] : []))
    .filter((article) => article.rawTitleTR || article.rawBodyTR);
}

export async function fetchAutoRawArticles() {
  const results = await Promise.allSettled(
    AUTO_SOURCES.map((source) => fetchSourceArticles(source)),
  );

  const articles = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );

  return dedupeArticles(articles);
}

export async function fetchManualRawArticle(url: string) {
  return fetchArticle(url, "manual");
}
