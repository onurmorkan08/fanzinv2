import type { RawArticle } from "./types";

const relevantKeywords = [
  "imamoglu",
  "imamoglu",
  "ekrem",
  "chp",
  "19 mart",
  "dava",
  "sorusturma",
  "gozalti",
  "tutuklama",
  "mahkeme",
  "protesto",
  "yargi",
  "kayyum",
  "basin ozgurlugu",
];

const excludedKeywords = [
  "football",
  "basketball",
  "futbol",
  "basketbol",
  "spor",
  "sports",
  "match",
  "mac",
  "galatasaray",
  "fenerbahce",
  "besiktas",
  "lig",
  "gol",
  "kadro",
  "antrenman",
  "celebrity",
  "magazine",
  "magazin",
  "lifestyle",
  "yasam",
  "belediye hizmet",
  "altyapi",
  "economy",
  "ekonomi",
  "inflation",
  "culture",
  "kultur",
  "sanat",
  "art",
  "festival",
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
      "Rejected because the article does not match the tracked political relevance criteria for the editorial workflow.",
  };
}
