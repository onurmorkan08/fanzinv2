import type { RawArticle } from "./types";

const relevantKeywords = [
  "ekrem",
  "imamoglu",
  "chp",
  "cumhurbaskani",
  "iktidar",
  "bakan",
  "belediye",
  "baskan",
  "yerel yonetim",
  "ibb",
  "19 mart",
  "siyasi baski",
  "siyasi",
  "muhalefet baskisi",
  "muhalefet",
  "secim",
  "aday",
  "parti",
  "sorusturma",
  "gozalti",
  "tutuklama",
  "dava",
  "mahkeme",
  "protesto",
  "yargi",
  "kayyum",
  "ifade ozgurlugu",
  "basin ozgurlugu",
  "demokratik haklar",
  "belediye baskani",
  "hukuki baski",
  "gozalti karari",
  "iddianame",
  "savcilik",
  "emniyet",
  "polis mudahalesi",
];

const excludedKeywords = [
  "spor",
  "sports",
  "futbol",
  "football",
  "basketbol",
  "basketball",
  "magazin",
  "celebrity",
  "yasam",
  "lifestyle",
  "burc",
  "horoscope",
  "sanat",
  "culture",
  "festival",
  "ekonomi",
  "economy",
  "enflasyon",
  "altyapi",
  "belediye hizmet",
];

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

export function isPoliticallyRelevant(article: RawArticle): {
  isRelevant: boolean;
  reason: string;
} {
  const haystack = normalizeText(`${article.rawTitleTR} ${article.rawBodyTR}`);
  const matchedRelevantKeyword = relevantKeywords.find((keyword) =>
    haystack.includes(normalizeText(keyword)),
  );

  if (matchedRelevantKeyword) {
    return {
      isRelevant: true,
      reason:
        "Accepted because the article matches the tracked political relevance criteria.",
    };
  }

  const matchedExcludedKeyword = excludedKeywords.find((keyword) =>
    haystack.includes(normalizeText(keyword)),
  );

  if (matchedExcludedKeyword) {
    return {
      isRelevant: false,
      reason:
        "Rejected because the article appears to belong to an excluded non-political topic.",
    };
  }

  return {
    isRelevant: false,
    reason:
      "Rejected because the article did not show a strong enough political signal for editorial processing.",
  };
}
