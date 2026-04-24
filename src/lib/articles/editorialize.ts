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
      "g\u00f6zalt\u0131",
      "gozalti",
      "tutuklama",
      "operasyon",
      "emniyet",
      "serbest b\u0131rak\u0131ld\u0131",
      "serbest birakildi",
    ])
  ) {
    return "detention_arrest";
  }

  if (
    hasAny([
      "dava",
      "soru\u015fturma",
      "sorusturma",
      "iddianame",
      "mahkeme",
      "savc\u0131",
      "savci",
      "yarg\u0131",
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
      "y\u00fcr\u00fcy\u00fc\u015f",
      "yuruyus",
      "miting",
      "polis m\u00fcdahalesi",
      "polis mudahalesi",
      "yasak",
      "meydan",
    ])
  ) {
    return "protest_crackdown";
  }

  if (
    hasAny([
      "bas\u0131n",
      "basin",
      "medya",
      "gazeteci",
      "ifade \u00f6zg\u00fcrl\u00fc\u011f\u00fc",
      "ifade ozgurlugu",
      "yay\u0131n",
      "yayin",
      "sans\u00fcr",
      "sansur",
      "eri\u015fim engeli",
      "erisim engeli",
    ])
  ) {
    return "media_rights";
  }

  if (
    hasAny([
      "belediye",
      "ba\u015fkan",
      "baskan",
      "g\u00f6revden alma",
      "gorevden alma",
      "kayyum",
      "ihale",
      "belediye meclisi",
      "yerel y\u00f6netim",
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
      "siyasi bask\u0131",
      "siyasi baski",
      "aday",
      "se\u00e7im",
      "secim",
      "imamo\u011flu",
      "imamoglu",
    ])
  ) {
    return "opposition_pressure";
  }

  return "generic_political";
}

function detectFocus(normalized: string) {
  if (normalized.includes("imamoglu")) {
    return "Ekrem Imamoglu";
  }

  if (normalized.includes("chp")) {
    return "the CHP";
  }

  if (normalized.includes("gazeteci") || normalized.includes("medya")) {
    return "journalists and media actors";
  }

  if (normalized.includes("belediye") || normalized.includes("baskan")) {
    return "local government actors";
  }

  if (normalized.includes("protesto") || normalized.includes("eylem")) {
    return "public demonstrators";
  }

  return "opposition actors";
}

function buildSummaryDetails(
  topic: ReturnType<typeof detectEditorialTopic>,
  normalized: string,
) {
  const focus = detectFocus(normalized);

  switch (topic) {
    case "media_rights":
      return {
        title: "Media pressure case enters editorial review",
        headline: "MEDIA RIGHTS UNDER PRESSURE",
        summary: `The extracted report points to pressure around media access, public communication, journalists, or freedom of expression. It appears to focus in particular on ${focus} and the public visibility of the wider political dispute.`,
        context:
          "This item is relevant because restrictions on media and expression can shape public understanding of the March 19 process and related political developments.",
      };
    case "legal_pressure":
      return {
        title: "Legal pressure case moves into editorial review",
        headline: "LEGAL PRESSURE UNDER REVIEW",
        summary: `The extracted report centers on legal scrutiny, court activity, investigation pressure, or prosecution-related developments involving opposition politics. It appears to focus on ${focus} through judicial procedure, prosecutorial pressure, or courtroom escalation.`,
        context:
          "This item is relevant because judicial pressure and legal proceedings are central to the broader political process being monitored.",
      };
    case "municipal_pressure":
      return {
        title: "Municipal pressure case enters editorial review",
        headline: "LOCAL DEMOCRACY UNDER PRESSURE",
        summary: `The extracted report points to political pressure around local government, municipal authority, elected officials, or administrative intervention. It appears to focus on ${focus} through local institutional interference rather than routine service coverage.`,
        context:
          "This item is relevant because pressure on elected local government is part of the wider democratic and institutional context.",
      };
    case "protest_crackdown":
      return {
        title: "Protest pressure case enters editorial review",
        headline: "CIVIC ACTION UNDER PRESSURE",
        summary: `The extracted report appears connected to public demonstrations, protest restrictions, police intervention, or civic reaction to political developments. It appears to focus on ${focus} within a story shaped by street response and assembly pressure.`,
        context:
          "This item is relevant because protest activity and restrictions on assembly are key indicators in the wider political environment.",
      };
    case "detention_arrest":
      return {
        title: "Detention-related case enters editorial review",
        headline: "DETENTION PRESSURE UNDER REVIEW",
        summary: `The extracted report points to detention, arrest, police operation, or custody-related developments connected to the political process. It appears to focus on ${focus} through escalation in police or prosecutorial action.`,
        context:
          "This item is relevant because detention and arrest activity can indicate escalation in political and legal pressure.",
      };
    case "opposition_pressure":
      return {
        title: "Opposition pressure case enters editorial review",
        headline: "OPPOSITION PRESSURE UNDER REVIEW",
        summary: `The extracted report is connected to pressure on opposition figures, party activity, electoral politics, or public political participation. It appears to focus on ${focus} within a broader climate of political targeting and organizational pressure.`,
        context:
          "This item is relevant because opposition pressure is one of the central editorial categories monitored by this panel.",
      };
    default:
      return {
        title: "Political pressure case enters editorial review",
        headline: "POLITICAL PRESSURE UNDER REVIEW",
        summary: `The extracted report contains politically relevant signals connected to legal scrutiny, public rights, opposition activity, or institutional pressure. It appears to focus on ${focus} within the broader March 19 monitoring frame.`,
        context:
          "This item is relevant to the wider March 19 editorial monitoring workflow.",
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

  const normalized = normalizeText(`${article.rawTitleTR} ${article.rawBodyTR}`);
  const topic = detectEditorialTopic(normalized);
  const details = buildSummaryDetails(topic, normalized);

  return {
    editorialTitleEN: details.title,
    editorialSummaryEN: details.summary,
    editorialContextEN: details.context,
    visualHeadlineEN: details.headline,
    translationStatus: "success",
    summaryStatus: "success",
  };
}
