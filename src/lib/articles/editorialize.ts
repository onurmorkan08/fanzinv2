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

function hasSignal(normalized: string, keywords: string[]) {
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
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
    hasSignal(normalized, [
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
    hasSignal(normalized, [
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
    hasSignal(normalized, [
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
    hasSignal(normalized, [
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
    hasSignal(normalized, [
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

function detectAction(normalized: string) {
  if (hasSignal(normalized, ["gözaltı", "gozalti", "tutuklama"])) {
    return "a detention and custody move";
  }

  if (hasSignal(normalized, ["mahkeme", "dava", "iddianame"])) {
    return "an active court and prosecution track";
  }

  if (hasSignal(normalized, ["soruşturma", "sorusturma", "fezleke"])) {
    return "a fresh investigation step";
  }

  if (hasSignal(normalized, ["protesto", "eylem", "miting", "yuruyus"])) {
    return "a street-level protest response";
  }

  if (hasSignal(normalized, ["polis müdahalesi", "polis mudahalesi", "yasak"])) {
    return "a restriction and intervention pattern";
  }

  if (hasSignal(normalized, ["kayyum", "görevden alma", "gorevden alma"])) {
    return "an intervention in elected local authority";
  }

  if (hasSignal(normalized, ["basın", "basin", "medya", "gazeteci"])) {
    return "pressure on public communication and reporting";
  }

  if (hasSignal(normalized, ["seçim", "secim", "aday", "parti"])) {
    return "pressure on political participation";
  }

  return "an episode of political pressure";
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
  const actorPhrase = pickPhrase(actors, "opposition actors");
  const locationPhrase = locations.length > 0 ? ` in ${pickPhrase(locations, "Turkey")}` : "";
  const institutionPhrase = pickPhrase(institutions, "state institutions");
  const actionPhrase = detectAction(normalized);
  const titleDetails = buildTitle(topic);

  let context =
    "This item remains relevant to the March 19 editorial workflow because it connects institutional pressure with the wider political monitoring frame.";

  if (topic === "media_rights") {
    context =
      "This item is relevant because pressure on journalists, publishers, and public communication can directly narrow civic visibility around the March 19 process.";
  } else if (topic === "legal_pressure") {
    context =
      "This item is relevant because investigations, indictments, and court proceedings are core indicators of political pressure in the monitored editorial frame.";
  } else if (topic === "municipal_pressure") {
    context =
      "This item is relevant because pressure on municipalities and elected local offices is part of the wider democratic and institutional risk landscape.";
  } else if (topic === "protest_crackdown") {
    context =
      "This item is relevant because protest restrictions and assembly pressure are direct signals of civic rights strain in the broader political environment.";
  } else if (topic === "detention_arrest") {
    context =
      "This item is relevant because detention and arrest activity can mark a sharper phase of political or legal pressure inside the monitored process.";
  } else if (topic === "opposition_pressure") {
    context =
      "This item is relevant because pressure on opposition actors remains one of the central editorial categories tracked by this panel.";
  }

  return {
    ...titleDetails,
    summary: `${actorPhrase} are featured in a Turkish report about ${actionPhrase}${locationPhrase}. The article indicates that ${institutionPhrase} are shaping the case or confrontation, rather than describing an ordinary civic or municipal update.`,
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
