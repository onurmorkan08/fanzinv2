import { editorializeArticle } from "./editorialize";
import { resolveArticleImage } from "./images";
import { isPoliticallyRelevant } from "./relevance";
import type { FinalStory, RawArticle } from "./types";
import { validateFinalStory } from "./validation";

export async function finalizeArticle(article: RawArticle): Promise<FinalStory> {
  const resolvedImage = resolveArticleImage(article);

  if (article.extractionStatus === "failed") {
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
      imageUrl: resolvedImage.imageUrl,
      imageStatus: resolvedImage.imageStatus,
      extractionStatus: article.extractionStatus,
      translationStatus: "failed",
      summaryStatus: "failed",
      publishable: false,
      needsReview: true,
      errorReason: article.errorReason,
    });
  }

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
      imageUrl: resolvedImage.imageUrl,
      imageStatus: resolvedImage.imageStatus,
      extractionStatus: article.extractionStatus,
      translationStatus: "failed",
      summaryStatus: "failed",
      publishable: false,
      needsReview: true,
      errorReason: relevance.reason,
    });
  }

  const editorialFields = await editorializeArticle(article);

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
      editorialFields.translationStatus === "success" &&
      editorialFields.summaryStatus === "success" &&
      article.extractionStatus === "success",
    needsReview:
      article.extractionStatus !== "success" ||
      editorialFields.translationStatus !== "success" ||
      editorialFields.summaryStatus !== "success",
    errorReason: article.errorReason,
  });
}
