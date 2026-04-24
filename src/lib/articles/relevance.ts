import type { RawArticle } from "./types";

const relevantKeywords = [
  "march 19",
  "19 mart",
  "ekrem imamoglu",
  "imamoglu",
  "chp",
  "opposition",
  "muhalefet",
  "investigation",
  "sorusturma",
  "court",
  "dava",
  "mahkeme",
  "arrest",
  "tutuklama",
  "detention",
  "gozalti",
  "protest",
  "protesto",
  "judiciary",
  "yargi",
  "freedom of expression",
  "ifade ozgurl",
  "press freedom",
  "basin ozgurl",
  "trustee",
  "kayyum",
  "legal pressure",
  "political pressure",
  "siyasi bask",
  "politik bask",
];

const excludedKeywords = [
  "football",
  "basketball",
  "spor",
  "sports",
  "match",
  "galatasaray",
  "fenerbahce",
  "besiktas",
  "celebrity",
  "magazine",
  "magazin",
  "lifestyle",
  "yasam",
  "ordinary local service",
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
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isPoliticallyRelevant(article: RawArticle): {
  isRelevant: boolean;
  reason: string;
} {
  const haystack = normalizeText(
    `${article.rawTitleTR} ${article.rawBodyTR} ${article.sourceName}`,
  );

  const matchedRelevantKeyword = relevantKeywords.find((keyword) =>
    haystack.includes(normalizeText(keyword)),
  );

  if (!matchedRelevantKeyword) {
    return {
      isRelevant: false,
      reason:
        "Rejected because the article does not match the tracked political relevance criteria for the editorial workflow.",
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
    isRelevant: true,
    reason:
      "Accepted because the article matches the tracked political relevance criteria.",
  };
}
