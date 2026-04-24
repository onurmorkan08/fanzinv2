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

export function detectEditorialTopic(
  text: string,
):
  | "media_rights"
  | "legal_pressure"
  | "municipal_pressure"
  | "protest_crackdown"
  | "detention_arrest"
  | "opposition_pressure"
  | "generic_political" {
  const normalized = normalizeText(text);

  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) => normalized.includes(normalizeText(keyword)));

  if (
    hasAny([
      "gözaltı",
      "gozalti",
      "tutuklama",
      "operasyon",
      "emniyet",
      "serbest bırakıldı",
      "serbest birakildi",
    ])
  ) {
    return "detention_arrest";
  }

  if (
    hasAny([
      "dava",
      "soruşturma",
      "sorusturma",
      "iddianame",
      "mahkeme",
      "savcı",
      "savci",
      "yargı",
      "yargi",
      "fezleke",
      "ceza",
      "hukuk",
    ])
  ) {
    return "legal_pressure";
  }

  if (
    hasAny([
      "protesto",
      "eylem",
      "yürüyüş",
      "yuruyus",
      "miting",
      "polis müdahalesi",
      "polis mudahalesi",
      "yasak",
      "meydan",
    ])
  ) {
    return "protest_crackdown";
  }

  if (
    hasAny([
      "basın",
      "basin",
      "medya",
      "gazeteci",
      "ifade özgürlüğü",
      "ifade ozgurlugu",
      "yayın",
      "yayin",
      "sansür",
      "sansur",
      "erişim engeli",
      "erisim engeli",
    ])
  ) {
    return "media_rights";
  }

  if (
    hasAny([
      "belediye",
      "başkan",
      "baskan",
      "görevden alma",
      "gorevden alma",
      "kayyum",
      "ihale",
      "belediye meclisi",
      "yerel yönetim",
      "yerel yonetim",
    ])
  ) {
    return "municipal_pressure";
  }

  if (
    hasAny([
      "chp",
      "muhalefet",
      "parti",
      "siyasi baskı",
      "siyasi baski",
      "aday",
      "seçim",
      "secim",
      "imamoğlu",
      "imamoglu",
    ])
  ) {
    return "opposition_pressure";
  }

  return "generic_political";
}

function buildTopicFields(
  topic: ReturnType<typeof detectEditorialTopic>,
): EditorialFields {
  switch (topic) {
    case "media_rights":
      return {
        editorialTitleEN: "Media pressure case enters editorial review",
        visualHeadlineEN: "MEDIA RIGHTS UNDER PRESSURE",
        editorialSummaryEN:
          "The extracted report points to pressure around media access, public communication, journalists, or freedom of expression.",
        editorialContextEN:
          "This item is relevant because restrictions on media and expression can shape public understanding of the March 19 process and related political developments.",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "legal_pressure":
      return {
        editorialTitleEN: "Legal pressure case moves into editorial review",
        visualHeadlineEN: "LEGAL PRESSURE UNDER REVIEW",
        editorialSummaryEN:
          "The extracted report centers on legal scrutiny, court activity, investigation pressure, or prosecution-related developments involving opposition politics.",
        editorialContextEN:
          "This item is relevant because judicial pressure and legal proceedings are central to the broader political process being monitored.",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "municipal_pressure":
      return {
        editorialTitleEN: "Municipal pressure case enters editorial review",
        visualHeadlineEN: "LOCAL DEMOCRACY UNDER PRESSURE",
        editorialSummaryEN:
          "The extracted report points to political pressure around local government, municipal authority, elected officials, or administrative intervention.",
        editorialContextEN:
          "This item is relevant because pressure on elected local government is part of the wider democratic and institutional context.",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "protest_crackdown":
      return {
        editorialTitleEN: "Protest pressure case enters editorial review",
        visualHeadlineEN: "CIVIC ACTION UNDER PRESSURE",
        editorialSummaryEN:
          "The extracted report appears connected to public demonstrations, protest restrictions, police intervention, or civic reaction to political developments.",
        editorialContextEN:
          "This item is relevant because protest activity and restrictions on assembly are key indicators in the wider political environment.",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "detention_arrest":
      return {
        editorialTitleEN: "Detention-related case enters editorial review",
        visualHeadlineEN: "DETENTION PRESSURE UNDER REVIEW",
        editorialSummaryEN:
          "The extracted report points to detention, arrest, police operation, or custody-related developments connected to the political process.",
        editorialContextEN:
          "This item is relevant because detention and arrest activity can indicate escalation in political and legal pressure.",
        translationStatus: "success",
        summaryStatus: "success",
      };
    case "opposition_pressure":
      return {
        editorialTitleEN: "Opposition pressure case enters editorial review",
        visualHeadlineEN: "OPPOSITION PRESSURE UNDER REVIEW",
        editorialSummaryEN:
          "The extracted report is connected to pressure on opposition figures, party activity, electoral politics, or public political participation.",
        editorialContextEN:
          "This item is relevant because opposition pressure is one of the central editorial categories monitored by this panel.",
        translationStatus: "success",
        summaryStatus: "success",
      };
    default:
      return {
        editorialTitleEN: "Political pressure case enters editorial review",
        visualHeadlineEN: "POLITICAL PRESSURE UNDER REVIEW",
        editorialSummaryEN:
          "The extracted report contains politically relevant signals connected to legal scrutiny, public rights, opposition activity, or institutional pressure.",
        editorialContextEN:
          "This item is relevant to the wider March 19 editorial monitoring workflow.",
        translationStatus: "success",
        summaryStatus: "success",
      };
  }
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

  const topic = detectEditorialTopic(`${article.rawTitleTR} ${article.rawBodyTR}`);
  return buildTopicFields(topic);
}
