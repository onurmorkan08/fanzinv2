import { createHash } from "node:crypto";

import type { ExtractionStatus, RawArticle, SourceType } from "./types";

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value: string) {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " "));
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ");
}

function getMetaContent(html: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return normalizeWhitespace(decodeHtmlEntities(match[1]));
    }
  }

  return "";
}

function getTagContent(html: string, tagName: string) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match?.[1] ? normalizeWhitespace(stripTags(match[1])) : "";
}

function getJsonLdBlocks(html: string) {
  return Array.from(
    html.matchAll(
      /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  )
    .map((match) => match[1]?.trim())
    .filter(Boolean);
}

function parseJsonLdValue<T>(value: unknown, key: string): T | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = parseJsonLdValue<T>(entry, key);
      if (nested !== undefined) {
        return nested;
      }
    }

    return undefined;
  }

  const record = value as Record<string, unknown>;

  if (record[key] !== undefined) {
    return record[key] as T;
  }

  for (const nested of Object.values(record)) {
    const result = parseJsonLdValue<T>(nested, key);

    if (result !== undefined) {
      return result;
    }
  }

  return undefined;
}

function extractJsonLdData(html: string) {
  const blocks = getJsonLdBlocks(html);

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block) as unknown;
      const headline = parseJsonLdValue<string>(parsed, "headline");
      const image = parseJsonLdValue<string | string[]>(parsed, "image");
      const datePublished = parseJsonLdValue<string>(parsed, "datePublished");
      const articleBody = parseJsonLdValue<string>(parsed, "articleBody");

      return {
        headline: typeof headline === "string" ? normalizeWhitespace(headline) : "",
        image: Array.isArray(image)
          ? image.find((entry) => typeof entry === "string") ?? ""
          : typeof image === "string"
            ? image
            : "",
        datePublished:
          typeof datePublished === "string" ? normalizeWhitespace(datePublished) : "",
        articleBody:
          typeof articleBody === "string" ? normalizeWhitespace(articleBody) : "",
      };
    } catch {
      continue;
    }
  }

  return {
    headline: "",
    image: "",
    datePublished: "",
    articleBody: "",
  };
}

function absoluteUrl(candidate: string, baseUrl: string) {
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return "";
  }
}

function extractParagraphs(segment: string) {
  const matches = Array.from(segment.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi));

  return matches
    .map((match) => normalizeWhitespace(stripTags(match[1] ?? "")))
    .filter((paragraph) => paragraph.length >= 45)
    .filter(
      (paragraph) =>
        !/^(reklam|advertisement|ilgili haberler|etiketler|kaynak)/i.test(paragraph),
    );
}

function extractBodySegment(html: string) {
  const patterns = [
    /<article\b[^>]*>([\s\S]*?)<\/article>/i,
    /<(?:div|section)\b[^>]+class=["'][^"']*(?:article-body|article__body|content-body|entry-content|news-content|post-content|article-content|detail-content|haber-icerik|haberMetni|story-body)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i,
    /<(?:div|section)\b[^>]+id=["'][^"']*(?:article|content|icerik|news-detail)[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return match[1];
    }
  }

  return html;
}

function extractBodyText(html: string, jsonLdBody: string) {
  if (jsonLdBody.length >= 180) {
    return jsonLdBody;
  }

  const segment = extractBodySegment(html);
  const paragraphs = extractParagraphs(segment);

  if (paragraphs.length > 0) {
    return normalizeWhitespace(paragraphs.join(" "));
  }

  const fallbackParagraphs = extractParagraphs(html);
  return normalizeWhitespace(fallbackParagraphs.join(" "));
}

function extractPublishedAt(html: string, jsonLdDatePublished: string) {
  if (jsonLdDatePublished) {
    return jsonLdDatePublished;
  }

  return (
    getMetaContent(html, "article:published_time") ||
    getMetaContent(html, "og:published_time") ||
    getMetaContent(html, "datePublished") ||
    html.match(/<time[^>]+datetime=["']([^"']+)["'][^>]*>/i)?.[1] ||
    ""
  );
}

function extractTitle(html: string, jsonLdHeadline: string) {
  return (
    getMetaContent(html, "og:title") ||
    getMetaContent(html, "twitter:title") ||
    jsonLdHeadline ||
    getTagContent(html, "h1") ||
    getTagContent(html, "title")
  );
}

function extractImage(html: string, baseUrl: string, jsonLdImage: string) {
  const imageCandidate =
    getMetaContent(html, "og:image") ||
    getMetaContent(html, "twitter:image") ||
    jsonLdImage ||
    html.match(/<figure[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>/i)?.[1] ||
    html.match(/<img[^>]+class=["'][^"']*(?:hero|featured|article)[^"']*["'][^>]+src=["']([^"']+)["'][^>]*>/i)?.[1] ||
    "";

  return imageCandidate ? absoluteUrl(imageCandidate, baseUrl) : "";
}

function determineExtractionStatus(title: string, body: string): ExtractionStatus {
  if (title && body.length >= 220) {
    return "success";
  }

  if (title && body.length >= 80) {
    return "partial";
  }

  return "failed";
}

export function inferSourceNameFromUrl(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const baseName = hostname.split(".")[0] ?? hostname;

  return baseName
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function createArticleId(url: string) {
  return createHash("sha1").update(url).digest("hex").slice(0, 14);
}

export function extractArticleFromHtml(params: {
  html: string;
  sourceType: SourceType;
  sourceUrl: string;
  sourceName?: string;
}): RawArticle {
  const sanitizedHtml = sanitizeHtml(params.html);
  const jsonLd = extractJsonLdData(sanitizedHtml);
  const rawTitleTR = extractTitle(sanitizedHtml, jsonLd.headline);
  const rawBodyTR = extractBodyText(sanitizedHtml, jsonLd.articleBody);
  const rawImageUrl = extractImage(sanitizedHtml, params.sourceUrl, jsonLd.image);
  const publishedAt = extractPublishedAt(sanitizedHtml, jsonLd.datePublished);
  const extractionStatus = determineExtractionStatus(rawTitleTR, rawBodyTR);

  return {
    id: createArticleId(params.sourceUrl),
    sourceType: params.sourceType,
    sourceName: params.sourceName ?? inferSourceNameFromUrl(params.sourceUrl),
    sourceUrl: params.sourceUrl,
    rawTitleTR,
    rawBodyTR,
    rawImageUrl: rawImageUrl || undefined,
    publishedAt: publishedAt || undefined,
    extractionStatus,
    errorReason:
      extractionStatus === "failed"
        ? "Could not extract enough article content from the source page."
        : extractionStatus === "partial"
          ? "Article content was extracted only partially and should be reviewed."
          : undefined,
  };
}

export function extractArticleLinksFromListing(params: {
  html: string;
  listingUrl: string;
  articlePathHints?: string[];
  excludePathHints?: string[];
}) {
  const listingHostname = new URL(params.listingUrl).hostname.replace(/^www\./, "");
  const includeHints = params.articlePathHints ?? [
    "/haber/",
    "/siyaset/",
    "/gundem/",
    "/politika/",
    "/news/",
  ];
  const excludeHints = params.excludePathHints ?? [
    "/video",
    "/yazarlar",
    "/galeri",
    "/kategori",
    "/etiket",
    "/canli",
  ];
  const candidates = new Set<string>();

  for (const match of params.html.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];
    const absolute = absoluteUrl(href, params.listingUrl);

    if (!absolute) {
      continue;
    }

    const url = new URL(absolute);
    const normalizedHost = url.hostname.replace(/^www\./, "");
    const normalizedPath = url.pathname.toLocaleLowerCase("tr-TR");
    const segments = normalizedPath.split("/").filter(Boolean);
    const slug = segments.at(-1) ?? "";

    if (normalizedHost !== listingHostname) {
      continue;
    }

    if (excludeHints.some((hint) => normalizedPath.includes(hint))) {
      continue;
    }

    if (!includeHints.some((hint) => normalizedPath.includes(hint))) {
      continue;
    }

    if (segments.length < 2) {
      continue;
    }

    if (!/-|\d/.test(slug) || slug.length < 12) {
      continue;
    }

    url.hash = "";
    url.search = "";
    candidates.add(url.toString());
  }

  return Array.from(candidates);
}
