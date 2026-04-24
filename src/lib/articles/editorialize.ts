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

  const hasAny = (keywords: string[]) =>
    keywords.some((keyword) => normalized.includes(normalizeText(keyword)));

  if (
    hasAny([
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
    hasAny([
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
    hasAny([
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
    hasAny([
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
    hasAny([
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
    hasAny([
      "chp",
      "muhalefet",
      "parti",
      "siyasi baski",
      "aday",
      "secim",
      "imamoglu",
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

  if (normalized.includes("ogrenci")) {
    actors.push("students");
  }

  if (normalized.includes("avukat")) {
    actors.push("lawyers");
  }

  return unique(actors);
}

function detectInstitutions(normalized: string) {
  const institutions: string[] = [];

  if (normalized.includes("ibb") || normalized.includes("istanbul buyuksehir")) {
    institutions.push("Istanbul metropolitan administration");
  }

  if (normalized.includes("belediye")) {
    institutions.push("local government");
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

  if (normalized.includes("turkiye") || normalized.includes("turkiye")) {
    locations.push("Turkey");
  }

  return unique(locations);
}

function buildSummaryDetails(
  topic: ReturnType<typeof detectEditorialTopic>,
  normalized: string,
) {
  const actors = detectActors(normalized);
  const institutions = detectInstitutions(normalized);
  const locations = detectLocations(normalized);
  const actorPhrase = pickPhrase(actors, "opposition actors");
  const institutionPhrase = pickPhrase(institutions, "state institutions");
  const locationPhrase = locations.length > 0 ? ` in ${pickPhrase(locations, "Turkey")}` : "";

  switch (topic) {
    case "media_rights":
      return {
        title: "Media pressure case enters editorial review",
        headline: "MEDIA RIGHTS UNDER PRESSURE",
        summary: `${actorPhrase} appear in a report about media access, public communication, or freedom of expression${locationPhrase}. The article suggests that ${institutionPhrase} are shaping who can speak publicly and how the wider political dispute is being reported.`,
        context:
          "This item is relevant because pressure on journalists, publishers, and public communication can directly narrow civic visibility around the March 19 process.",
      };
    case "legal_pressure":
      return {
        title: "Legal pressure case moves into editorial review",
        headline: "LEGAL PRESSURE UNDER REVIEW",
        summary: `${actorPhrase} are at the center of a report about court action, investigation pressure, or prosecution steps${locationPhrase}. The article points to a legal track shaped by ${institutionPhrase} rather than a routine administrative dispute.`,
        context:
          "This item is relevant because investigations, indictments, and court proceedings are core indicators of political pressure in the monitored editorial frame.",
      };
    case "municipal_pressure":
      return {
        title: "Municipal pressure case enters editorial review",
        headline: "LOCAL DEMOCRACY UNDER PRESSURE",
        summary: `${actorPhrase} appear in a report about municipal authority, elected office, or administrative intervention${locationPhrase}. The article suggests that ${institutionPhrase} are affecting local governance rather than covering ordinary service delivery.`,
        context:
          "This item is relevant because pressure on municipalities and elected local offices is part of the wider democratic and institutional risk landscape.",
      };
    case "protest_crackdown":
      return {
        title: "Protest pressure case enters editorial review",
        headline: "CIVIC ACTION UNDER PRESSURE",
        summary: `${actorPhrase} appear in a report about demonstrations, assembly restrictions, or police intervention${locationPhrase}. The article suggests that ${institutionPhrase} are shaping how public reaction can be expressed in the street.`,
        context:
          "This item is relevant because protest restrictions and assembly pressure are direct signals of civic rights strain in the broader political environment.",
      };
    case "detention_arrest":
      return {
        title: "Detention-related case enters editorial review",
        headline: "DETENTION PRESSURE UNDER REVIEW",
        summary: `${actorPhrase} appear in a report about detention, arrest, or police operations${locationPhrase}. The article points to escalation through custody or enforcement activity linked to ${institutionPhrase}.`,
        context:
          "This item is relevant because detention and arrest activity can mark a sharper phase of political or legal pressure inside the monitored process.",
      };
    case "opposition_pressure":
      return {
        title: "Opposition pressure case enters editorial review",
        headline: "OPPOSITION PRESSURE UNDER REVIEW",
        summary: `${actorPhrase} appear in a report about opposition politics, party activity, or electoral pressure${locationPhrase}. The article suggests that ${institutionPhrase} are shaping the political field around participation, candidacy, or party organization.`,
        context:
          "This item is relevant because pressure on opposition actors remains one of the central editorial categories tracked by this panel.",
      };
    default:
      return {
        title: "Political pressure case enters editorial review",
        headline: "POLITICAL PRESSURE UNDER REVIEW",
        summary: `${actorPhrase} appear in a politically relevant report${locationPhrase}. The article points to pressure involving ${institutionPhrase} and fits the broader monitoring frame around legal scrutiny, civic rights, and opposition activity.`,
        context:
          "This item remains relevant to the March 19 editorial workflow because it connects institutional pressure with the wider political monitoring frame.",
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
