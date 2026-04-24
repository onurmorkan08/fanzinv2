import { finalizeArticle } from "./finalize";
import type { FinalStory, RawArticle } from "./types";

export const mockRawArticles: RawArticle[] = [
  {
    id: "mock-auto-political",
    sourceType: "auto",
    sourceName: "Cumhuriyet Monitor",
    sourceUrl: "https://example.com/mock-auto-political",
    rawTitleTR:
      "19 Mart sureci ve Imamoglu sorusturmasinda yeni gelisme",
    rawBodyTR:
      "Ekrem Imamoglu, CHP ve 19 Mart sureci etrafindaki gelismeler, dava sureci, sorusturma basliklari, gozalti kararlari, protesto kisitlamalari ve yargi tartismalariyla birlikte aktariliyor. Haberde basin ozgurlugu ve ifade ozgurlugu baglaminda muhalefet uzerindeki baski iddialari ayrintilandiriliyor.",
    rawImageUrl: "/mock-editorial-source.svg",
    publishedAt: "2026-04-23T11:00:00Z",
    extractionStatus: "success",
  },
  {
    id: "mock-manual-political",
    sourceType: "manual",
    sourceName: "Manual Link Intake",
    sourceUrl: "https://example.com/mock-manual-political",
    rawTitleTR:
      "CHP ve protesto yasagi hakkinda yeni gelisme",
    rawBodyTR:
      "Manuel olarak eklenen bu haber girdisi, CHP etrafindaki politik baski, protesto kisitlamalari, gozalti kararlari, yargi sureci ve basin ozgurlugu tartismalarina odaklanan yeterli uzunlukta bir metin sunuyor. Amac, ayni editorial hattin manuel kaynaklari da guvenli bicimde isledigini gostermektir.",
    publishedAt: "2026-04-23T14:45:00Z",
    extractionStatus: "success",
  },
];

export const mockFinalizedStoriesPromise: Promise<FinalStory[]> = Promise.all(
  mockRawArticles.map((article) => finalizeArticle(article)),
);
