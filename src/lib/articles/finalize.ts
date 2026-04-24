import { editorializeArticle } from "./editorialize";
import { resolveArticleImage } from "./images";
import { isPoliticallyRelevant } from "./relevance";
import type { FinalStory, RawArticle } from "./types";
import { validateFinalStory } from "./validation";

export function finalizeArticle(article: RawArticle): FinalStory {
  const relevance = isPoliticallyRelevant(article);

  if (!relevance.isRelevant) {
    return validateFinalStory({
      id: article.id,
      sourceType: article.sourceType,
      sourceName: article.sourceName,
      sourceUrl: article.sourceUrl,
      publishedAt: article.publishedAt,
      rawTitleTR: article.rawTitleTR,
      rawBodyTR: article.rawBodyTR,
      editorialTitleEN: "",
      editorialSummaryEN: "",
      editorialContextEN: "",
      visualHeadlineEN: "",
      imageUrl: article.rawImageUrl ?? "",
      imageStatus: article.rawImageUrl ? "found" : "fallback",
      extractionStatus: article.extractionStatus,
      translationStatus: "failed",
      summaryStatus: "failed",
      publishable: false,
      needsReview: true,
      errorReason: relevance.reason,
    });
  }

  const editorialFields = editorializeArticle(article);
  const resolvedImage = resolveArticleImage(article);

  return validateFinalStory({
    id: article.id,
    sourceType: article.sourceType,
    sourceName: article.sourceName,
    sourceUrl: article.sourceUrl,
    publishedAt: article.publishedAt,
    rawTitleTR: article.rawTitleTR,
    rawBodyTR: article.rawBodyTR,
    editorialTitleEN: editorialFields.editorialTitleEN,
    editorialSummaryEN: editorialFields.editorialSummaryEN,
    editorialContextEN: editorialFields.editorialContextEN,
    visualHeadlineEN: editorialFields.visualHeadlineEN,
    imageUrl: resolvedImage.imageUrl,
    imageStatus: resolvedImage.imageStatus,
    extractionStatus: article.extractionStatus,
    translationStatus: editorialFields.translationStatus,
    summaryStatus: editorialFields.summaryStatus,
    publishable:
      article.extractionStatus !== "failed" &&
      editorialFields.translationStatus === "success" &&
      editorialFields.summaryStatus === "success",
    needsReview:
      article.extractionStatus !== "success" ||
      editorialFields.translationStatus !== "success" ||
      editorialFields.summaryStatus !== "success",
    errorReason: article.errorReason,
  });
}
