import { finalizeArticle } from "./finalize";
import type { FinalStory, RawArticle } from "./types";

export const mockRawArticles: RawArticle[] = [
  {
    id: "auto-political-001",
    sourceType: "auto",
    sourceName: "Cumhuriyet Monitor",
    sourceUrl: "https://example.com/auto-political-001",
    rawTitleTR:
      "19 Mart ve Ekrem \u0130mamo\u011flu davas\u0131nda yeni CHP soru\u015fturmas\u0131",
    rawBodyTR:
      "Ekrem \u0130mamo\u011flu, CHP ve 19 Mart s\u00fcreci etraf\u0131ndaki geli\u015fmeler bu haberde siyasi bask\u0131, dava s\u00fcreci, soru\u015fturma ba\u015fl\u0131klar\u0131, g\u00f6zalt\u0131 kararlar\u0131, protesto k\u0131s\u0131tlamalar\u0131 ve yarg\u0131 tart\u0131\u015fmalar\u0131yla birlikte aktar\u0131l\u0131yor. Metin ayr\u0131ca bas\u0131n \u00f6zg\u00fcrl\u00fc\u011f\u00fc, ifade \u00f6zg\u00fcrl\u00fc\u011f\u00fc ve mahkeme s\u00fcre\u00e7leri ba\u011flam\u0131nda muhalefet \u00fczerindeki bask\u0131 iddialar\u0131n\u0131 ayr\u0131nt\u0131land\u0131r\u0131yor.",
    rawImageUrl: "/mock-editorial-source.svg",
    publishedAt: "2026-04-23T11:00:00Z",
    extractionStatus: "success",
  },
  {
    id: "manual-political-001",
    sourceType: "manual",
    sourceName: "Manual Link Intake",
    sourceUrl: "https://example.com/manual-political-001",
    rawTitleTR:
      "CHP, protesto yasa\u011f\u0131 ve \u0130mamo\u011flu soru\u015fturmas\u0131 hakk\u0131nda yeni geli\u015fme",
    rawBodyTR:
      "Manuel olarak eklenen bu haber girdisi, Ekrem \u0130mamo\u011flu dosyas\u0131, CHP etraf\u0131ndaki politik bask\u0131, protesto k\u0131s\u0131tlamalar\u0131, g\u00f6zalt\u0131 kararlar\u0131, yarg\u0131 s\u00fcreci, mahkeme takvimi ve bas\u0131n \u00f6zg\u00fcrl\u00fc\u011f\u00fc tart\u0131\u015fmalar\u0131na odaklanan yeterli uzunlukta bir metin sunuyor. Ama\u00e7, otomatik kaynaklarla ayn\u0131 boru hatt\u0131ndan ge\u00e7en editorluk alanlar\u0131n\u0131 test etmek ve g\u00f6r\u00fcn\u00fcr alanlarda yaln\u0131zca denetimli \u0130ngilizce \u00e7\u0131kt\u0131n\u0131n kullan\u0131ld\u0131\u011f\u0131n\u0131 do\u011frulamakt\u0131r.",
    publishedAt: "2026-04-23T14:45:00Z",
    extractionStatus: "success",
  },
  {
    id: "manual-failed-001",
    sourceType: "manual",
    sourceName: "Manual Link Intake",
    sourceUrl: "https://example.com/manual-failed-001",
    rawTitleTR: "Ekrem \u0130mamo\u011flu dosyas\u0131nda eksik \u00e7ekim",
    rawBodyTR: "K\u0131sa metin",
    publishedAt: "2026-04-23T15:10:00Z",
    extractionStatus: "failed",
    errorReason: "Manual extraction returned insufficient article content.",
  },
  {
    id: "sports-irrelevant-001",
    sourceType: "auto",
    sourceName: "Sports Desk Feed",
    sourceUrl: "https://example.com/sports-irrelevant-001",
    rawTitleTR: "Galatasaray futbol ve basketbol haz\u0131rl\u0131klar\u0131n\u0131 tamamlad\u0131",
    rawBodyTR:
      "Tak\u0131m antrenman program\u0131, futbol kadrosu, basketbol salonu takvimi, sakatl\u0131k durumu ve hafta sonu ma\u00e7\u0131n\u0131n teknik detaylar\u0131 aktar\u0131l\u0131yor. Haberde lig fikst\u00fcr\u00fc, gol beklentisi, savunma dizili\u015fi ve spor performans\u0131 \u00f6ne \u00e7\u0131k\u0131yor.",
    publishedAt: "2026-04-23T09:30:00Z",
    extractionStatus: "success",
  },
];

export const mockFinalizedStories: FinalStory[] = mockRawArticles.map(
  finalizeArticle,
);

if (process.env.NODE_ENV !== "production") {
  console.table(
    mockFinalizedStories.map((story) => ({
      id: story.id,
      sourceName: story.sourceName,
      publishable: story.publishable,
      needsReview: story.needsReview,
      extractionStatus: story.extractionStatus,
      translationStatus: story.translationStatus,
      summaryStatus: story.summaryStatus,
      errorReason: story.errorReason ?? "",
    })),
  );
}

export const mockManualAddArticle: RawArticle = {
  id: "manual-added-002",
  sourceType: "manual",
  sourceName: "Manual Link Intake",
  sourceUrl: "https://example.com/manual-added-002",
  rawTitleTR:
    "Muhalefet ve yarg\u0131 bask\u0131s\u0131 iddialar\u0131na dair yeni ba\u011flant\u0131",
  rawBodyTR:
    "Bu manuel ba\u011flant\u0131 girdisi, muhalefet \u00fczerindeki bask\u0131, yeni soru\u015fturma sinyalleri, protesto s\u0131n\u0131rlamalar\u0131 ve ifade \u00f6zg\u00fcrl\u00fc\u011f\u00fc tart\u0131\u015fmalar\u0131yla ilgili yeterli uzunlukta bir haber g\u00f6vdesi sa\u011flar. Girdi, otomatik ak\u0131\u015ftan farkl\u0131 bir yol izlemese bile ayn\u0131 relevance, editorial, image ve validation boru hatt\u0131ndan ge\u00e7mek \u00fczere tasarland\u0131.",
  extractionStatus: "success",
  publishedAt: "2026-04-23T16:00:00Z",
};
