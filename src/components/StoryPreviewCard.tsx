import type { FinalStory } from "@/lib/articles/types";
import { normalizeSourceName } from "@/lib/articles/source";

import { SafeStoryImage } from "./SafeStoryImage";

function getVisualSourceLabel(story: FinalStory) {
  if (story.imageStatus === "fallback") {
    return "Fallback Visual";
  }

  try {
    const imageUrl = new URL(story.imageUrl, story.sourceUrl);
    const storyUrl = new URL(story.sourceUrl);
    const imageHost = imageUrl.hostname.replace(/^www\./, "");
    const storyHost = storyUrl.hostname.replace(/^www\./, "");

    return imageHost && imageHost !== storyHost
      ? normalizeSourceName(imageUrl.toString())
      : story.sourceName;
  } catch {
    return story.sourceName;
  }
}

function clampVisualText(value: string | undefined, maxLength: number) {
  const fallback = "This story is awaiting approved English editorial output.";
  const normalized = (value || fallback).replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const trimmed = normalized.slice(0, maxLength).trimEnd();
  const lastSpace = trimmed.lastIndexOf(" ");

  return `${trimmed.slice(0, lastSpace > maxLength * 0.7 ? lastSpace : trimmed.length)}...`;
}

function getVisualTitle(story: FinalStory) {
  return story.visualHeadlineEN || story.editorialTitleEN || "Needs Review";
}

function getVisualTitleClass(value: string) {
  if (value.length > 105) {
    return "text-sm leading-snug";
  }

  if (value.length > 72) {
    return "text-[15px] leading-snug";
  }

  return "text-base leading-normal";
}

export function StoryPreviewCard({ story }: { story: FinalStory }) {
  const title = getVisualTitle(story);

  return (
    <article className="aspect-[4/5] w-[min(100%,420px)] overflow-hidden rounded-[24px] border border-border bg-panel-strong p-4 shadow-[0_8px_24px_rgba(72,50,33,0.05)]">
      <div className="relative mb-4 h-[42%] overflow-hidden rounded-[18px] border border-border bg-panel">
        <SafeStoryImage
          src={story.imageUrl}
          alt={title || "Editorial story image"}
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {getVisualSourceLabel(story)}
        </span>
      </div>
      <div className="space-y-2.5">
        <h3 className={`line-clamp-3 font-semibold text-foreground ${getVisualTitleClass(title)}`}>
          {title}
        </h3>
        <p className="line-clamp-6 text-sm leading-6 text-muted">
          {clampVisualText(story.editorialSummaryEN, 320)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            {story.sourceName}
          </span>
        </div>
      </div>
    </article>
  );
}
