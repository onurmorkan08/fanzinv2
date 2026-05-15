import type { EditorialFields, RawArticle } from "./types";

const MINIMUM_EDITORIAL_BODY_LENGTH = 120;

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

function hasSignal(normalized: string, keywords: string[]) {
  return keywords.some((keyword) => normalized.includes(keyword));
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function pickPhrase(values: string[], fallback: string) {
  if (values.length === 0) {
    return fallback;
  }

  if (values.length === 1) {
    return values[0]!;
  }

  return `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;
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

  if (
    hasSignal(normalized, [
      "gozalti",
      "tutuklama",
      "operasyon",
      "emniyet",
      "serbest birakildi",
    ])
  ) {
    return "detention_arrest";
  }

  if (
    hasSignal(normalized, [
      "dava",
      "sorusturma",
      "iddianame",
      "mahkeme",
      "savci",
      "yargi",
      "fezleke",
      "ceza",
      "hukuk",
    ])
  ) {
    return "legal_pressure";
  }

  if (
    hasSignal(normalized, [
      "protesto",
      "eylem",
      "yuruyus",
      "miting",
      "polis mudahalesi",
      "yasak",
      "meydan",
    ])
  ) {
    return "protest_crackdown";
  }

  if (
    hasSignal(normalized, [
      "basin",
      "medya",
      "gazeteci",
      "ifade ozgurlugu",
      "yayin",
      "sansur",
      "erisim engeli",
    ])
  ) {
    return "media_rights";
  }

  if (
    hasSignal(normalized, [
      "belediye",
      "baskan",
      "gorevden alma",
      "kayyum",
      "ihale",
      "belediye meclisi",
      "yerel yonetim",
    ])
  ) {
    return "municipal_pressure";
  }

  if (
    hasSignal(normalized, [
      "chp",
      "muhalefet",
      "parti",
      "siyasi baski",
      "aday",
      "secim",
      "imamoglu",
      "ekrem",
    ])
  ) {
    return "opposition_pressure";
  }

  return "generic_political";
}

function detectActors(normalized: string) {
  const actors: string[] = [];

  if (normalized.includes("imamoglu") || normalized.includes("ekrem")) {
    actors.push("Ekrem Imamoglu");
  }

  if (normalized.includes("chp")) {
    actors.push("the CHP");
  }

  if (normalized.includes("muhalefet")) {
    actors.push("opposition figures");
  }

  if (normalized.includes("gazeteci")) {
    actors.push("journalists");
  }

  if (normalized.includes("medya")) {
    actors.push("media outlets");
  }

  if (normalized.includes("belediye")) {
    actors.push("municipal authorities");
  }

  if (normalized.includes("baskan")) {
    actors.push("elected mayors");
  }

  return unique(actors);
}

function detectInstitutions(normalized: string) {
  const institutions: string[] = [];

  if (normalized.includes("ibb") || normalized.includes("istanbul buyuksehir")) {
    institutions.push("the Istanbul metropolitan administration");
  }

  if (normalized.includes("mahkeme")) {
    institutions.push("the courts");
  }

  if (normalized.includes("savci")) {
    institutions.push("the prosecution");
  }

  if (normalized.includes("emniyet") || normalized.includes("polis")) {
    institutions.push("police authorities");
  }

  if (normalized.includes("rtuk")) {
    institutions.push("broadcast regulators");
  }

  if (normalized.includes("belediye")) {
    institutions.push("local government institutions");
  }

  return unique(institutions);
}

function detectLocations(normalized: string) {
  const locations: string[] = [];

  if (normalized.includes("istanbul")) {
    locations.push("Istanbul");
  }

  if (normalized.includes("ankara")) {
    locations.push("Ankara");
  }

  if (normalized.includes("izmir")) {
    locations.push("Izmir");
  }

  if (normalized.includes("turkiye") || normalized.includes("turkey")) {
    locations.push("Turkey");
  }

  return unique(locations);
}

function detectAction(normalized: string) {
  if (hasSignal(normalized, ["gozalti", "tutuklama"])) {
    return "detention or arrest action";
  }

  if (hasSignal(normalized, ["mahkeme", "dava", "iddianame"])) {
    return "an active court and prosecution process";
  }

  if (hasSignal(normalized, ["sorusturma", "fezleke"])) {
    return "an investigation and legal pressure track";
  }

  if (hasSignal(normalized, ["protesto", "eylem", "miting", "yuruyus"])) {
    return "public protest and civic reaction";
  }

  if (hasSignal(normalized, ["polis mudahalesi", "yasak"])) {
    return "restriction and enforcement pressure";
  }

  if (hasSignal(normalized, ["kayyum", "gorevden alma"])) {
    return "intervention in elected local authority";
  }

  if (hasSignal(normalized, ["basin", "medya", "gazeteci"])) {
    return "pressure on media visibility and reporting";
  }

  if (hasSignal(normalized, ["secim", "aday", "parti"])) {
    return "pressure on political participation";
  }

  return "political pressure dynamics";
}

function buildTitle(topic: ReturnType<typeof detectEditorialTopic>) {
  switch (topic) {
    case "media_rights":
      return {
        title: "Media pressure case enters editorial review",
        headline: "MEDIA RIGHTS UNDER PRESSURE",
      };
    case "legal_pressure":
      return {
        title: "Legal pressure case moves into editorial review",
        headline: "LEGAL PRESSURE UNDER REVIEW",
      };
    case "municipal_pressure":
      return {
        title: "Municipal pressure case enters editorial review",
        headline: "LOCAL DEMOCRACY UNDER PRESSURE",
      };
    case "protest_crackdown":
      return {
        title: "Protest pressure case enters editorial review",
        headline: "CIVIC ACTION UNDER PRESSURE",
      };
    case "detention_arrest":
      return {
        title: "Detention-related case enters editorial review",
        headline: "DETENTION PRESSURE UNDER REVIEW",
      };
    case "opposition_pressure":
      return {
        title: "Opposition pressure case enters editorial review",
        headline: "OPPOSITION PRESSURE UNDER REVIEW",
      };
    default:
      return {
        title: "Political pressure case enters editorial review",
        headline: "POLITICAL PRESSURE UNDER REVIEW",
      };
  }
}

function buildSummaryDetails(
  topic: ReturnType<typeof detectEditorialTopic>,
  normalized: string,
) {
  const actors = detectActors(normalized);
  const locations = detectLocations(normalized);
  const institutions = detectInstitutions(normalized);
  const actorPhrase = pickPhrase(actors, "political actors");
  const locationPhrase = locations.length > 0 ? ` in ${pickPhrase(locations, "Turkey")}` : "";
  const institutionPhrase = pickPhrase(institutions, "state institutions");
  const actionPhrase = detectAction(normalized);
  const titleDetails = buildTitle(topic);

  let context =
    "This item remains relevant to the March 19 monitoring workflow because it connects institutional pressure with the broader political field.";

  if (topic === "media_rights") {
    context =
      "This item matters because media access and freedom of expression directly shape public visibility around the monitored political process.";
  } else if (topic === "legal_pressure") {
    context =
      "This item matters because investigations, indictments, and court proceedings are core indicators of political pressure in the monitored editorial frame.";
  } else if (topic === "municipal_pressure") {
    context =
      "This item matters because pressure on elected local government is part of the wider democratic and institutional risk landscape.";
  } else if (topic === "protest_crackdown") {
    context =
      "This item matters because protest restrictions and assembly pressure are direct signs of civic rights strain in the broader political environment.";
  } else if (topic === "detention_arrest") {
    context =
      "This item matters because detention and arrest activity can signal a sharper phase of political and legal escalation.";
  } else if (topic === "opposition_pressure") {
    context =
      "This item matters because pressure on opposition actors remains one of the central editorial categories tracked by this panel.";
  }

  return {
    ...titleDetails,
    summary: `${actorPhrase} are central to a Turkish report about ${actionPhrase}${locationPhrase}. The article points to a politically charged development shaped by ${institutionPhrase}, rather than an ordinary administrative update.`,
    context,
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
