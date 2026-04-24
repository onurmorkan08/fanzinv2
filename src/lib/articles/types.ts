export type SourceType = "auto" | "manual";

export type ExtractionStatus = "success" | "partial" | "failed";

export type TranslationStatus = "success" | "failed";

export type SummaryStatus = "success" | "failed";

export type ImageStatus = "found" | "missing" | "fallback";

export type RawArticle = {
  id: string;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl: string;
  rawTitleTR: string;
  rawBodyTR: string;
  rawImageUrl?: string;
  publishedAt?: string;
  extractionStatus: ExtractionStatus;
  errorReason?: string;
};

export type EditorialFields = {
  editorialTitleEN: string;
  editorialSummaryEN: string;
  editorialContextEN: string;
  visualHeadlineEN: string;
  translationStatus: TranslationStatus;
  summaryStatus: SummaryStatus;
};

export type ResolvedImage = {
  imageUrl: string;
  imageStatus: ImageStatus;
};

export type FinalStory = {
  id: string;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl: string;
  publishedAt?: string;
  rawTitleTR: string;
  rawBodyTR: string;
  editorialTitleEN: string;
  editorialSummaryEN: string;
  editorialContextEN: string;
  visualHeadlineEN: string;
  imageUrl: string;
  imageStatus: ImageStatus;
  extractionStatus: ExtractionStatus;
  translationStatus: TranslationStatus;
  summaryStatus: SummaryStatus;
  publishable: boolean;
  needsReview: boolean;
  errorReason?: string;
};
