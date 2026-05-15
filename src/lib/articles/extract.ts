import { createHash } from "node:crypto";

import type { ExtractionStatus, RawArticle, SourceType } from "./types";
import { normalizeSourceName } from "./source";

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

function normalizeJsonLdImage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const image = normalizeJsonLdImage(entry);

      if (image) {
        return image;
      }
    }

    return "";
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return normalizeJsonLdImage(record.url) || normalizeJsonLdImage(record.contentUrl);
  }

  return "";
}

function extractJsonLdData(html: string) {
  const blocks = getJsonLdBlocks(html);

  for (const block of blocks) {
    try {
      const parsed = JSON.parse(block) as unknown;
      const headline = parseJsonLdValue<string>(parsed, "headline");
      const image = parseJsonLdValue<unknown>(parsed, "image");
      const datePublished = parseJsonLdValue<string>(parsed, "datePublished");
      const articleBody = parseJsonLdValue<string>(parsed, "articleBody");

      return {
        headline: typeof headline === "string" ? normalizeWhitespace(headline) : "",
        image: normalizeJsonLdImage(image),
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

function isJunkParagraph(paragraph: string) {
  const normalized = paragraph.toLocaleLowerCase("tr-TR");

  if (paragraph.length < 28) {
    return true;
  }

  return [
    /^reklam$/,
    /^advertisement$/,
    /^ilgili haberler/,
    /^etiketler/,
    /^kaynak$/,
    /^source$/,
    /^video$/,
    /^galeri$/,
    /^son dakika/,
    /^abone ol/,
    /^subscribe/,
    /^paylaş/,
    /^share$/,
    /^share this/,
    /^share on/,
    /^follow us/,
    /^yorumlar/,
    /^çerez/,
    /^cookie/,
    /^gizlilik/,
    /^privacy/,
    /^kullanım şartları/,
    /^terms/,
    /^copyright/,
    /^all rights reserved/,
    /^related articles/,
    /^you may also like/,
    /^tüm hakları saklıdır/,
    /facebook'ta paylaş/,
    /twitter'da paylaş/,
    /whatsapp'ta paylaş/,
    /javascript/,
    /share on facebook/,
    /share on twitter/,
    /share on whatsapp/,
    /sign up for/,
    /newsletter/,
  ].some((pattern) => pattern.test(normalized));
}

function extractParagraphs(segment: string) {
  const matches = Array.from(segment.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi));
  const seen = new Set<string>();
  const paragraphs: string[] = [];

  for (const match of matches) {
    const paragraph = normalizeWhitespace(stripTags(match[1] ?? ""));
    const fingerprint = paragraph.toLocaleLowerCase("tr-TR");

    if (isJunkParagraph(paragraph) || seen.has(fingerprint)) {
      continue;
    }

    seen.add(fingerprint);
    paragraphs.push(paragraph);
  }

  return paragraphs;
}

function extractSegments(html: string, pattern: RegExp) {
  return Array.from(html.matchAll(pattern))
    .map((match) => match[1] ?? "")
    .filter(Boolean);
}

function extractParagraphsByPattern(html: string, pattern: RegExp) {
  const paragraphs: string[] = [];
  const seen = new Set<string>();

  for (const segment of extractSegments(html, pattern)) {
    for (const paragraph of extractParagraphs(segment)) {
      const fingerprint = paragraph.toLocaleLowerCase("tr-TR");

      if (seen.has(fingerprint)) {
        continue;
      }

      seen.add(fingerprint);
      paragraphs.push(paragraph);
    }
  }

  return paragraphs;
}

function extractBodyText(html: string, jsonLdBody: string) {
  const strategies = [
    () => extractParagraphsByPattern(html, /<article\b[^>]*>([\s\S]*?)<\/article>/gi),
    () => extractParagraphsByPattern(html, /<main\b[^>]*>([\s\S]*?)<\/main>/gi),
    () =>
      extractParagraphsByPattern(
        html,
        /<div\b[^>]+class=["'][^"']*entry[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ),
    () =>
      extractParagraphsByPattern(
        html,
        /<div\b[^>]+class=["'][^"']*post[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ),
    () =>
      extractParagraphsByPattern(
        html,
        /<div\b[^>]+class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ),
    () =>
      extractParagraphsByPattern(
        html,
        /<div\b[^>]+class=["'][^"']*article[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
      ),
    () =>
      extractParagraphsByPattern(
        html,
        /<(?:article|main|section|div)\b[^>]+class=["'][^"']*news[^"']*["'][^>]*>([\s\S]*?)<\/(?:article|main|section|div)>/gi,
      ),
    () => extractParagraphs(html),
  ];

  for (const strategy of strategies) {
    const body = normalizeWhitespace(strategy().join(" "));

    if (body.length >= 120) {
      return body;
    }
  }

  return jsonLdBody.length >= 120 ? jsonLdBody : normalizeWhitespace(extractParagraphs(html).join(" "));
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
    getTagContent(html, "h1") ||
    getTagContent(html, "title") ||
    jsonLdHeadline
  );
}

function extractImage(html: string, baseUrl: string, jsonLdImage: string) {
  const articleSegment =
    html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1] ?? "";
  const articleImage = articleSegment.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)?.[1];
  const largeContentImage = Array.from(html.matchAll(/<img\b[^>]*>/gi))
    .map((match) => match[0])
    .find((tag) => {
      const width = Number(tag.match(/\bwidth=["']?(\d+)/i)?.[1] ?? 0);
      const height = Number(tag.match(/\bheight=["']?(\d+)/i)?.[1] ?? 0);
      const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? "";
      const classes = tag.match(/\bclass=["']([^"']+)["']/i)?.[1] ?? "";

      return (
        src &&
        !/logo|icon|avatar|sprite|tracking|pixel/i.test(src + " " + classes) &&
        (width >= 300 || height >= 180 || /content|article|news|hero|featured|image/i.test(classes))
      );
    })
    ?.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  const imageCandidate =
    getMetaContent(html, "og:image") ||
    getMetaContent(html, "twitter:image") ||
    jsonLdImage ||
    articleImage ||
    largeContentImage ||
    "";

  return imageCandidate ? absoluteUrl(imageCandidate, baseUrl) : "";
}

function determineExtractionStatus(title: string, body: string): ExtractionStatus {
  if (title && body.length >= 300) {
    return "success";
  }

  if (title && body.length >= 120) {
    return "partial";
  }

  return "failed";
}

export function inferSourceNameFromUrl(url: string) {
  return normalizeSourceName(url);
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
