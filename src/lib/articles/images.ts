import type { RawArticle, ResolvedImage } from "./types";

export const FALLBACK_EDITORIAL_IMAGE = "/fallback-editorial.svg";

function isUsableImageUrl(value?: string) {
  if (!value) {
    return false;
  }

  return /^(https?:\/\/|\/)/i.test(value.trim());
}

export function resolveArticleImage(article: RawArticle): ResolvedImage {
  if (isUsableImageUrl(article.rawImageUrl)) {
    return {
      imageUrl: article.rawImageUrl!.trim(),
      imageStatus: "found",
    };
  }

  return {
    imageUrl: FALLBACK_EDITORIAL_IMAGE,
    imageStatus: "fallback",
  };
}
