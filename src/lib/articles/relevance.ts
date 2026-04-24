import type { RawArticle } from "./types";

const relevantKeywords = [
  "march 19",
  "19 mart",
  "ekrem imamo",
  "imamoglu",
  "chp",
  "opposition",
  "muhalefet",
  "siyasi bask",
  "politik bask",
  "investigation",
  "sorusturma",
  "arrest",
  "gozalti",
  "detention",
  "court",
  "mahkeme",
  "yargi",
  "protest",
  "eylem",
  "freedom of expression",
  "ifade ozgurl",
  "press freedom",
  "basin ozgurl",
  "trustee",
  "kayyum",
  "state pressure",
  "judiciary pressure",
  "savci",
  "prosecutor",
];

const excludedKeywords = [
  "spor",
  "sports",
  "match",
  "galatasaray",
  "fenerbahce",
  "besiktas",
  "celebrity",
  "magazin",
  "lifestyle",
  "yasam",
  "culture",
  "sanat",
  "art",
  "festival",
  "economy",
  "ekonomi",
  "inflation",
  "belediye hizmet",
  "altyapi",
  "traffic",
  "weather",
  "hava durumu",
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
        "Rejected because the article does not match the tracked political relevance criteria.",
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
