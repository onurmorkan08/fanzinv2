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

function hasSignal(normalized: string, keywords: string[]) {
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
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

  return `${values.slice(0, -1).join(", ")} ve ${values.at(-1)}`;
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
    actors.push("Ekrem İmamoğlu");
  }

  if (normalized.includes("chp")) {
    actors.push("CHP");
  }

  if (normalized.includes("muhalefet")) {
    actors.push("muhalefet aktörleri");
  }

  if (normalized.includes("gazeteci")) {
    actors.push("gazeteciler");
  }

  if (normalized.includes("medya")) {
    actors.push("medya kuruluşları");
  }

  if (normalized.includes("belediye")) {
    actors.push("belediye yönetimi");
  }

  if (normalized.includes("baskan")) {
    actors.push("seçilmiş belediye başkanları");
  }

  if (normalized.includes("ogrenci")) {
    actors.push("öğrenciler");
  }

  if (normalized.includes("avukat")) {
    actors.push("avukatlar");
  }

  return unique(actors);
}

function detectInstitutions(normalized: string) {
  const institutions: string[] = [];

  if (normalized.includes("ibb") || normalized.includes("istanbul buyuksehir")) {
    institutions.push("İBB yönetimi");
  }

  if (normalized.includes("mahkeme")) {
    institutions.push("mahkeme süreci");
  }

  if (normalized.includes("savci")) {
    institutions.push("savcılık");
  }

  if (normalized.includes("emniyet") || normalized.includes("polis")) {
    institutions.push("emniyet birimleri");
  }

  if (normalized.includes("rtuk")) {
    institutions.push("yayın denetim kurumları");
  }

  if (normalized.includes("belediye")) {
    institutions.push("yerel yönetim kurumları");
  }

  return unique(institutions);
}

function detectLocations(normalized: string) {
  const locations: string[] = [];

  if (normalized.includes("istanbul")) {
    locations.push("İstanbul");
  }

  if (normalized.includes("ankara")) {
    locations.push("Ankara");
  }

  if (normalized.includes("izmir")) {
    locations.push("İzmir");
  }

  if (normalized.includes("turkiye") || normalized.includes("turkey")) {
    locations.push("Türkiye");
  }

  return unique(locations);
}

function detectAction(normalized: string) {
  if (hasSignal(normalized, ["gözaltı", "gozalti", "tutuklama"])) {
    return "gözaltı veya tutuklama adımı";
  }

  if (hasSignal(normalized, ["mahkeme", "dava", "iddianame"])) {
    return "mahkeme ve dava süreci";
  }

  if (hasSignal(normalized, ["soruşturma", "sorusturma", "fezleke"])) {
    return "soruşturma ve hukuki baskı hattı";
  }

  if (hasSignal(normalized, ["protesto", "eylem", "miting", "yuruyus"])) {
    return "kamusal protesto ve toplumsal tepki";
  }

  if (hasSignal(normalized, ["polis müdahalesi", "polis mudahalesi", "yasak"])) {
    return "müdahale ve kısıtlama düzeni";
  }

  if (hasSignal(normalized, ["kayyum", "görevden alma", "gorevden alma"])) {
    return "seçilmiş yerel yönetime müdahale";
  }

  if (hasSignal(normalized, ["basın", "basin", "medya", "gazeteci"])) {
    return "basın ve ifade alanında baskı";
  }

  if (hasSignal(normalized, ["seçim", "secim", "aday", "parti"])) {
    return "siyasal katılım üzerindeki baskı";
  }

  return "politik baskı eksenli bir gelişme";
}

function buildTitle(topic: ReturnType<typeof detectEditorialTopic>) {
  switch (topic) {
    case "media_rights":
      return {
        title: "Basın ve ifade özgürlüğü baskısı izleniyor",
        headline: "BASIN ÜZERİNDE BASKI",
      };
    case "legal_pressure":
      return {
        title: "Hukuki baskı hattındaki gelişme izleniyor",
        headline: "HUKUKİ BASKI İNCELEMEDE",
      };
    case "municipal_pressure":
      return {
        title: "Yerel yönetime dönük baskı hattı izleniyor",
        headline: "YEREL DEMOKRASİ BASKI ALTINDA",
      };
    case "protest_crackdown":
      return {
        title: "Protesto ve kamusal tepki hattı izleniyor",
        headline: "KAMUSAL TEPKİ BASKI ALTINDA",
      };
    case "detention_arrest":
      return {
        title: "Gözaltı ve tutuklama hattı izleniyor",
        headline: "GÖZALTI BASKISI İNCELEMEDE",
      };
    case "opposition_pressure":
      return {
        title: "Muhalefet üzerindeki baskı hattı izleniyor",
        headline: "MUHALEFET ÜZERİNDE BASKI",
      };
    default:
      return {
        title: "Politik baskı hattındaki gelişme izleniyor",
        headline: "POLİTİK BASKI İNCELEMEDE",
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
  const actorPhrase = pickPhrase(actors, "politik aktörler");
  const locationPhrase = locations.length > 0 ? ` ${pickPhrase(locations, "Türkiye")} merkezli` : "";
  const institutionPhrase = pickPhrase(institutions, "kurumsal güç odakları");
  const actionPhrase = detectAction(normalized);
  const titleDetails = buildTitle(topic);

  let context =
    "Bu haber, 19 Mart sonrası siyasal baskı, kamusal haklar ve kurumsal müdahale hattını izleyen editoryal akış için önem taşıyor.";

  if (topic === "media_rights") {
    context =
      "Bu haber, medya görünürlüğü ve ifade özgürlüğü üzerindeki baskının kamusal tartışmayı nasıl daralttığını izlemek açısından önem taşıyor.";
  } else if (topic === "legal_pressure") {
    context =
      "Bu haber, soruşturma, dava ve mahkeme süreçlerinin siyasal alan üzerindeki etkisini takip etmek açısından önem taşıyor.";
  } else if (topic === "municipal_pressure") {
    context =
      "Bu haber, seçilmiş yerel yönetimlere dönük müdahalenin demokratik temsil üzerindeki etkisini izlemek açısından önem taşıyor.";
  } else if (topic === "protest_crackdown") {
    context =
      "Bu haber, kamusal gösteri, protesto hakkı ve müdahale pratiklerinin siyasal iklimi nasıl şekillendirdiğini izlemek açısından önem taşıyor.";
  } else if (topic === "detention_arrest") {
    context =
      "Bu haber, gözaltı ve tutuklama adımlarının politik ve hukuki baskının sertleşen evrelerine işaret edip etmediğini görmek açısından önem taşıyor.";
  } else if (topic === "opposition_pressure") {
    context =
      "Bu haber, muhalefet aktörleri, seçim süreci ve siyasal katılım üzerindeki baskıyı takip etmek açısından önem taşıyor.";
  }

  return {
    ...titleDetails,
    summary: `${actorPhrase},${locationPhrase} ${actionPhrase} eksenindeki bir haberin odağında yer alıyor. Metin, sıradan bir idari gelişmeden çok ${institutionPhrase} üzerinden şekillenen politik bir baskı veya müdahale çizgisine işaret ediyor.`,
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
