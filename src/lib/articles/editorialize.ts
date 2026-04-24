import type { EditorialFields, RawArticle } from "./types";

const MINIMUM_BODY_LENGTH = 120;

const failedEditorialFields: EditorialFields = {
  editorialTitleEN: "",
  editorialSummaryEN: "",
  editorialContextEN: "",
  visualHeadlineEN: "",
  translationStatus: "failed",
  summaryStatus: "failed",
};

export function editorializeArticle(article: RawArticle): EditorialFields {
  const body = article.rawBodyTR.trim();

  if (
    article.extractionStatus === "failed" ||
    !body ||
    body.length < MINIMUM_BODY_LENGTH
  ) {
    return failedEditorialFields;
  }

  const sourceLabel =
    article.sourceType === "manual" ? "manually submitted" : "auto-collected";
  const contextLead =
    article.sourceType === "manual"
      ? "A manual source entered the editorial queue and requires verification."
      : "An automatically collected source entered the editorial queue and requires verification.";

  return {
    editorialTitleEN: `Editorial review required for politically relevant ${sourceLabel} reporting`,
    editorialSummaryEN:
      "A politically relevant Turkish news item was routed into the English editorial workflow and prepared for internal review.",
    editorialContextEN: `${contextLead} The current build keeps visible story fields in controlled English placeholder form until live editorial generation is added.`,
    visualHeadlineEN: "Political pressure story awaiting editorial packaging",
    translationStatus: "success",
    summaryStatus: "success",
  };
}
