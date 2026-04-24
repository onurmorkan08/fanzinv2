import { finalizeArticle } from "./finalize";
import type { FinalStory, RawArticle } from "./types";

export const mockRawArticles: RawArticle[] = [
  {
    id: "auto-political-001",
    sourceType: "auto",
    sourceName: "Cumhuriyet Monitor",
    sourceUrl: "https://example.com/auto-political-001",
    rawTitleTR: "19 Mart sureci ve muhalefete yonelik baskilar",
    rawBodyTR:
      "Ekrem Imamoglu ve CHP cevresindeki gelismeler, yeni sorusturma basliklari, protesto kisitlamalari ve ifade ozgurlugu tartismalariyla birlikte siyasi baski ekseninde aktarildi. Haberde gozaltılar, mahkeme surecleri ve muhalefet uzerindeki yargi baskisi iddialari detaylandiriliyor ve editor yalnizca ic denetim amaciyla yapilandirilmis bir is akisi bekliyor.",
    rawImageUrl: "https://images.example.com/editorial-auto-001.jpg",
    publishedAt: "2026-04-23T11:00:00Z",
    extractionStatus: "success",
  },
  {
    id: "manual-political-001",
    sourceType: "manual",
    sourceName: "Manual Link Intake",
    sourceUrl: "https://example.com/manual-political-001",
    rawTitleTR: "CHP ve protesto yasaklari hakkinda yeni gelisme",
    rawBodyTR:
      "Manuel olarak eklenen bu haber girdisi, CHP etrafindaki politik baski, protesto kisitlamalari, gozaltı kararları ve yargi sureci tartismalarina odaklanan yeterli uzunlukta bir metin sunuyor. Amac, otomatik kaynaklarla ayni boru hattindan gecen editorluk alanlarini test etmek ve gorunur alanlarda yalnizca denetimli Ingilizce ciktinin kullanildigini dogrulamaktir.",
    publishedAt: "2026-04-23T14:45:00Z",
    extractionStatus: "success",
  },
  {
    id: "manual-failed-001",
    sourceType: "manual",
    sourceName: "Manual Link Intake",
    sourceUrl: "https://example.com/manual-failed-001",
    rawTitleTR: "Ekrem Imamoglu dosyasinda eksik cekim",
    rawBodyTR: "Kisa metin",
    publishedAt: "2026-04-23T15:10:00Z",
    extractionStatus: "failed",
    errorReason: "Manual extraction returned insufficient article content.",
  },
  {
    id: "sports-irrelevant-001",
    sourceType: "manual",
    sourceName: "Sports Desk Feed",
    sourceUrl: "https://example.com/sports-irrelevant-001",
    rawTitleTR: "Galatasaray mac hazirliklarini tamamladi",
    rawBodyTR:
      "Takim antrenman programi, sakatlik durumu ve hafta sonu macinin teknik detaylari aktariliyor. Haberde siyasi surec, protesto, mahkeme veya muhalefet baskisi gibi izlenen editorial konular yer almiyor.",
    publishedAt: "2026-04-23T09:30:00Z",
    extractionStatus: "success",
  },
];

export const mockFinalizedStories: FinalStory[] = mockRawArticles.map(
  finalizeArticle,
);

export const mockManualAddArticle: RawArticle = {
  id: "manual-added-002",
  sourceType: "manual",
  sourceName: "Manual Link Intake",
  sourceUrl: "https://example.com/manual-added-002",
  rawTitleTR: "Muhalefet ve yargi baskisi iddialarina dair yeni baglanti",
  rawBodyTR:
    "Bu manuel baglanti girdisi, muhalefet uzerindeki baski, yeni sorusturma sinyalleri, protesto sinirlamalari ve ifade ozgurlugu tartismalariyla ilgili yeterli uzunlukta bir haber govdesi saglar. Girdi, otomatik akistan farkli bir yol izlemese bile ayni relevance, editorial, image ve validation boru hattindan gecmek uzere tasarlandi.",
  extractionStatus: "success",
  publishedAt: "2026-04-23T16:00:00Z",
};
