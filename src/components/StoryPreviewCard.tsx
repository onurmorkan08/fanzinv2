import type { FinalStory } from "@/lib/articles/types";
import { normalizeSourceName } from "@/lib/articles/source";

import { SafeStoryImage } from "./SafeStoryImage";

function formatVisualDate(value?: string) {
  if (!value) {
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

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

export function StoryPreviewCard({ story }: { story: FinalStory }) {
  return (
    <article className="rounded-[24px] border border-border bg-panel-strong p-3 shadow-[0_8px_24px_rgba(72,50,33,0.05)]">
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-[18px] border border-border bg-panel">
        <SafeStoryImage
          src={story.imageUrl}
          alt={story.visualHeadlineEN || "Editorial story image"}
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
          {getVisualSourceLabel(story)}
        </span>
      </div>
      <div className="space-y-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {story.visualHeadlineEN || "REVIEW REQUIRED"}
        </p>
        <h3 className="line-clamp-2 text-base font-semibold text-foreground">
          {story.editorialTitleEN || "Needs Review"}
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {story.editorialSummaryEN ||
            "This story is awaiting approved English editorial output."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            {story.sourceName}
          </span>
          <span className="inline-flex items-center rounded-full border border-border bg-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            {formatVisualDate(story.publishedAt)}
          </span>
        </div>
      </div>
    </article>
  );
}
