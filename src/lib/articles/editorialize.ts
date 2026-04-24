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

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function editorializeArticle(article: RawArticle): EditorialFields {
  const body = article.rawBodyTR.trim();

  if (
    article.extractionStatus === "failed" ||
    !body ||
    body.length < MINIMUM_BODY_LENGTH
  ) {
    return failedEditorialFields;
  }

  const normalized = normalizeText(`${article.rawTitleTR} ${article.rawBodyTR}`);

  let editorialTitleEN = "Political pressure case enters editorial review";
  let editorialSummaryEN =
    "A politically relevant Turkish news item has been routed into the English editorial workflow for controlled review and publication preparation.";
  let editorialContextEN =
    "This item is connected to the wider March 19 political process, opposition pressure, legal scrutiny, or civic-rights concerns.";
  let visualHeadlineEN = "POLITICAL PRESSURE UNDER REVIEW";

  if (normalized.includes("basin ozgurl") || normalized.includes("press freedom")) {
    editorialTitleEN = "Press freedom case enters editorial review";
    editorialSummaryEN =
      "A politically relevant media-rights report has been routed into the English editorial workflow for controlled review and publication preparation.";
    editorialContextEN =
      "This item is connected to press freedom, freedom of expression, or wider institutional pressure on public scrutiny.";
    visualHeadlineEN = "PRESS FREEDOM UNDER REVIEW";
  } else if (
    normalized.includes("protesto") ||
    normalized.includes("protest") ||
    normalized.includes("ifade ozgurl") ||
    normalized.includes("eylem")
  ) {
    editorialTitleEN = "Civic rights case enters editorial review";
    editorialSummaryEN =
      "A politically relevant civic-rights report has been routed into the English editorial workflow for controlled review and publication preparation.";
    editorialContextEN =
      "This item is connected to protest restrictions, freedom of expression, or pressure on public participation.";
    visualHeadlineEN = "CIVIC RIGHTS UNDER REVIEW";
  } else if (
    normalized.includes("sorusturma") ||
    normalized.includes("mahkeme") ||
    normalized.includes("dava") ||
    normalized.includes("yargi") ||
    normalized.includes("investigation")
  ) {
    editorialTitleEN = "Legal pressure case enters editorial review";
    editorialSummaryEN =
      "A politically relevant legal-pressure report has been routed into the English editorial workflow for controlled review and publication preparation.";
    editorialContextEN =
      "This item is connected to investigations, court proceedings, judiciary pressure, or politically sensitive legal scrutiny.";
    visualHeadlineEN = "LEGAL PRESSURE UNDER REVIEW";
  }

  editorialContextEN =
    article.sourceType === "manual"
      ? `${editorialContextEN} The source entered through manual intake and was normalized into the shared editorial pipeline.`
      : `${editorialContextEN} The source entered through automated intake and was normalized into the shared editorial pipeline.`;

  return {
    editorialTitleEN,
    editorialSummaryEN,
    editorialContextEN,
    visualHeadlineEN,
    translationStatus: "success",
    summaryStatus: "success",
  };
}
