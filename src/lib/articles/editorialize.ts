import type { EditorialFields, RawArticle } from "./types";

const MINIMUM_BODY_LENGTH = 80;

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
    .replace(/\u0131/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function editorializeArticle(article: RawArticle): EditorialFields {
  const body = article.rawBodyTR.trim();

  if (
    article.extractionStatus === "failed" ||
    !body ||
    body.length <= MINIMUM_BODY_LENGTH
  ) {
    return failedEditorialFields;
  }

  const normalized = normalizeText(`${article.rawTitleTR} ${article.rawBodyTR}`);

  let editorialTitleEN = "Political pressure case moves into editorial review";
  let editorialSummaryEN =
    "A politically relevant Turkish news item has been approved for the controlled English editorial workflow and prepared for publication review.";
  let editorialContextEN =
    "This item is connected to the wider March 19 process, opposition pressure, legal scrutiny, or civic rights concerns.";
  let visualHeadlineEN = "POLITICAL PRESSURE UNDER REVIEW";

  if (normalized.includes("basin ozgurlugu")) {
    editorialTitleEN = "Press freedom case moves into editorial review";
    editorialSummaryEN =
      "A politically relevant Turkish news item has been approved for the controlled English editorial workflow and prepared for publication review.";
    editorialContextEN =
      "This item is connected to press freedom, freedom of expression, or wider institutional pressure on public scrutiny.";
    visualHeadlineEN = "PRESS FREEDOM UNDER REVIEW";
  } else if (normalized.includes("protesto")) {
    editorialTitleEN = "Civic rights case moves into editorial review";
    editorialSummaryEN =
      "A politically relevant Turkish news item has been approved for the controlled English editorial workflow and prepared for publication review.";
    editorialContextEN =
      "This item is connected to protest restrictions, public assembly pressure, or wider civic rights concerns.";
    visualHeadlineEN = "CIVIC RIGHTS UNDER REVIEW";
  } else if (
    normalized.includes("dava") ||
    normalized.includes("sorusturma") ||
    normalized.includes("mahkeme") ||
    normalized.includes("yargi")
  ) {
    editorialTitleEN = "Legal pressure case moves into editorial review";
    editorialSummaryEN =
      "A politically relevant Turkish news item has been approved for the controlled English editorial workflow and prepared for publication review.";
    editorialContextEN =
      "This item is connected to the wider March 19 process, opposition pressure, legal scrutiny, or civic rights concerns.";
    visualHeadlineEN = "LEGAL PRESSURE UNDER REVIEW";
  }

  return {
    editorialTitleEN,
    editorialSummaryEN,
    editorialContextEN,
    visualHeadlineEN,
    translationStatus: "success",
    summaryStatus: "success",
  };
}
