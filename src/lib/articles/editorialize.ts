import type { EditorialFields, RawArticle } from "./types";

const MINIMUM_EDITORIAL_BODY_LENGTH = 140;

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

function buildDeterministicEditorialFields(article: RawArticle): EditorialFields {
  const normalized = normalizeText(`${article.rawTitleTR} ${article.rawBodyTR}`);

  let editorialTitleEN = "Political pressure case moves into editorial review";
  let editorialSummaryEN =
    "A politically relevant Turkish news item has been approved for the controlled English editorial workflow and prepared for publication review.";
  let editorialContextEN =
    "This item is connected to the wider March 19 process, opposition pressure, legal scrutiny, or civic rights concerns.";
  let visualHeadlineEN = "POLITICAL PRESSURE UNDER REVIEW";

  if (normalized.includes("basin ozgurlugu") || normalized.includes("ifade ozgurlugu")) {
    editorialTitleEN = "Expression rights case moves into editorial review";
    editorialSummaryEN =
      "A politically relevant media and civic rights report has been approved for the controlled English editorial workflow and prepared for publication review.";
    editorialContextEN =
      "This item is connected to freedom of expression, press freedom, or wider institutional pressure on public scrutiny.";
    visualHeadlineEN = "EXPRESSION RIGHTS UNDER REVIEW";
  } else if (normalized.includes("protesto") || normalized.includes("demokratik haklar")) {
    editorialTitleEN = "Civic rights case moves into editorial review";
    editorialSummaryEN =
      "A politically relevant civic rights report has been approved for the controlled English editorial workflow and prepared for publication review.";
    editorialContextEN =
      "This item is connected to protest restrictions, democratic rights, or broader pressure on public participation.";
    visualHeadlineEN = "CIVIC RIGHTS UNDER REVIEW";
  } else if (
    normalized.includes("dava") ||
    normalized.includes("sorusturma") ||
    normalized.includes("mahkeme") ||
    normalized.includes("yargi")
  ) {
    editorialTitleEN = "Legal pressure case moves into editorial review";
    editorialSummaryEN =
      "A politically relevant legal pressure report has been approved for the controlled English editorial workflow and prepared for publication review.";
    editorialContextEN =
      "This item is connected to investigations, court proceedings, judiciary pressure, or politically sensitive legal scrutiny.";
    visualHeadlineEN = "LEGAL PRESSURE UNDER REVIEW";
  }

  if (article.sourceType === "manual") {
    editorialContextEN =
      `${editorialContextEN} The source entered through manual intake and was normalized into the shared editorial pipeline.`;
  } else {
    editorialContextEN =
      `${editorialContextEN} The source entered through automated intake and was normalized into the shared editorial pipeline.`;
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

export async function editorializeArticle(article: RawArticle): Promise<EditorialFields> {
  const body = article.rawBodyTR.trim();

  if (
    article.extractionStatus === "failed" ||
    !body ||
    body.length < MINIMUM_EDITORIAL_BODY_LENGTH
  ) {
    return failedEditorialFields;
  }

  const _llmConfigured = Boolean(
    process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY?.trim(),
  );

  return buildDeterministicEditorialFields(article);
}
