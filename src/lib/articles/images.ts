import type { RawArticle, ResolvedImage } from "./types";

export const FALLBACK_EDITORIAL_IMAGE = "/fallback-editorial.svg";

export function resolveArticleImage(article: RawArticle): ResolvedImage {
  if (article.rawImageUrl) {
    return {
      imageUrl: article.rawImageUrl,
      imageStatus: "found",
    };
  }

  return {
    imageUrl: FALLBACK_EDITORIAL_IMAGE,
    imageStatus: "fallback",
  };
}
