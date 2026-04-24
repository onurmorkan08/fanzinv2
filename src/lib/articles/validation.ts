import { FALLBACK_EDITORIAL_IMAGE } from "./images";
import type { FinalStory } from "./types";

const turkishCharacterPattern =
  /[\u011f\u00fc\u015f\u0131\u00f6\u00e7\u011e\u00dc\u015e\u0130\u00d6\u00c7]/;

function hasTurkishCharacters(value: string) {
  return turkishCharacterPattern.test(value);
}

export function validateFinalStory(story: FinalStory): FinalStory {
  let publishable = story.publishable;
  let needsReview = story.needsReview;
  let imageUrl = story.imageUrl;
  let imageStatus = story.imageStatus;
  const errorReasons = story.errorReason ? [story.errorReason] : [];

  if (!story.editorialTitleEN) {
    publishable = false;
    needsReview = true;
    errorReasons.push("Missing English editorial title.");
  }

  if (!story.editorialSummaryEN) {
    publishable = false;
    needsReview = true;
    errorReasons.push("Missing English editorial summary.");
  }

  if (story.extractionStatus === "failed") {
    publishable = false;
    needsReview = true;
    errorReasons.push("Article extraction failed.");
  }

  if (story.summaryStatus === "failed") {
    publishable = false;
    needsReview = true;
    errorReasons.push("English editorial summary generation failed.");
  }

  if (!imageUrl) {
    imageUrl = FALLBACK_EDITORIAL_IMAGE;
    imageStatus = "fallback";
  }

  const visibleFields = [
    story.editorialTitleEN,
    story.editorialSummaryEN,
    story.editorialContextEN,
    story.visualHeadlineEN,
  ];

  if (visibleFields.some(hasTurkishCharacters)) {
    publishable = false;
    needsReview = true;
    errorReasons.push(
      "Visible English fields contain Turkish-specific characters and require review.",
    );
  }

  return {
    ...story,
    imageUrl,
    imageStatus,
    publishable,
    needsReview,
    errorReason: errorReasons.length > 0 ? errorReasons.join(" ") : undefined,
  };
}
