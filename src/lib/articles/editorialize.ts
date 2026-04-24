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

type EditorialAngle =
  | "pressFreedom"
  | "protest"
  | "legal"
  | "detention"
  | "municipal"
  | "opposition"
  | "default";

function getEditorialAngle(normalized: string): EditorialAngle {
  if (
    normalized.includes("basin ozgurlugu") ||
    normalized.includes("ifade ozgurlugu") ||
    normalized.includes("gazeteci") ||
    normalized.includes("medya")
  ) {
    return "pressFreedom";
  }

  if (
    normalized.includes("gozalti") ||
    normalized.includes("tutuklama") ||
    normalized.includes("gozaltina") ||
    normalized.includes("galti")
  ) {
    return "detention";
  }

  if (
    normalized.includes("protesto") ||
    normalized.includes("eylem") ||
    normalized.includes("yuruyus") ||
    normalized.includes("demonstrasyon")
  ) {
    return "protest";
  }

  if (
    normalized.includes("belediye") ||
    normalized.includes("belediye baskani") ||
    normalized.includes("kayyum") ||
    normalized.includes("imamoglu")
  ) {
    return "municipal";
  }

  if (
    normalized.includes("dava") ||
    normalized.includes("sorusturma") ||
    normalized.includes("mahkeme") ||
    normalized.includes("savcilik") ||
    normalized.includes("yargi")
  ) {
    return "legal";
  }

  if (
    normalized.includes("muhalefet") ||
    normalized.includes("chp") ||
    normalized.includes("siyasi baski")
  ) {
    return "opposition";
  }

  return "default";
}

function buildAngleSpecificCopy(angle: EditorialAngle, article: RawArticle): EditorialFields {
  const sourceContext =
    article.sourceType === "manual"
      ? "The source entered through manual intake and was normalized into the shared editorial pipeline."
      : "The source entered through automated intake and was normalized into the shared editorial pipeline.";

  switch (angle) {
    case "pressFreedom":
      return {
        editorialTitleEN: "Media pressure case enters review",
        editorialSummaryEN:
          "The extracted report centers on pressure around journalists, public scrutiny, or freedom of expression, with the story framed as a broader media rights concern rather than a routine political update.",
        editorialContextEN:
          `This item appears tied to press freedom, expression rights, or institutional pressure on critical coverage. ${sourceContext}`,
        visualHeadlineEN: "MEDIA RIGHTS UNDER PRESSURE",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "detention":
      return {
        editorialTitleEN: "Detention pressure case enters review",
        editorialSummaryEN:
          "The extracted article points to detentions, arrests, or custody measures surrounding a politically sensitive development, suggesting a story framed around coercive legal pressure and public fallout.",
        editorialContextEN:
          `This item appears tied to detentions, arrest pressure, or the use of custody decisions in a wider political dispute. ${sourceContext}`,
        visualHeadlineEN: "DETENTION PRESSURE IN FOCUS",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "protest":
      return {
        editorialTitleEN: "Protest restrictions enter review",
        editorialSummaryEN:
          "The extracted report appears to focus on demonstrations, public reaction, and restrictions on protest activity, placing the story within a civic-rights frame rather than a purely procedural political dispute.",
        editorialContextEN:
          `This item appears tied to protest restrictions, street demonstrations, or public reaction to political pressure. ${sourceContext}`,
        visualHeadlineEN: "PROTEST RESTRICTIONS ESCALATE",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "municipal":
      return {
        editorialTitleEN: "Municipal pressure case enters review",
        editorialSummaryEN:
          "The extracted article suggests political or legal pressure aimed at mayoral or municipal actors, framing the story around interference in local democratic authority rather than ordinary city administration.",
        editorialContextEN:
          `This item appears tied to mayoral pressure, municipal political interference, or pressure on local governance. ${sourceContext}`,
        visualHeadlineEN: "LOCAL GOVERNANCE UNDER PRESSURE",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "legal":
      return {
        editorialTitleEN: "Legal pressure case enters review",
        editorialSummaryEN:
          "The extracted article appears to revolve around investigations, prosecutors, or court proceedings, with the central editorial angle focused on legal scrutiny as a form of political pressure.",
        editorialContextEN:
          `This item appears tied to court pressure, prosecution strategy, or politically charged legal scrutiny. ${sourceContext}`,
        visualHeadlineEN: "LEGAL SCRUTINY INTENSIFIES",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "opposition":
      return {
        editorialTitleEN: "Opposition pressure story enters review",
        editorialSummaryEN:
          "The extracted report appears to focus on opposition figures, party pressure, or targeted political escalation, making the story more about power imbalance and institutional pressure than routine party positioning.",
        editorialContextEN:
          `This item appears tied to opposition pressure, party targeting, or a wider climate of political coercion. ${sourceContext}`,
        visualHeadlineEN: "OPPOSITION PRESSURE BUILDS",
        translationStatus: "success",
        summaryStatus: "success",
      };
    default:
      return {
        editorialTitleEN: "Political pressure story enters review",
        editorialSummaryEN:
          "The extracted report suggests a politically sensitive development involving legal pressure, public reaction, or institutional strain, and has been routed into the English editorial workflow for closer review.",
        editorialContextEN:
          `This item appears tied to the wider March 19 process, political pressure, or democratic rights concerns. ${sourceContext}`,
        visualHeadlineEN: "POLITICAL PRESSURE UNDER REVIEW",
        translationStatus: "success",
        summaryStatus: "success",
      };
  }
}

function buildDeterministicEditorialFields(article: RawArticle): EditorialFields {
  const normalized = normalizeText(`${article.rawTitleTR} ${article.rawBodyTR}`);
  const angle = getEditorialAngle(normalized);
  return buildAngleSpecificCopy(angle, article);
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
