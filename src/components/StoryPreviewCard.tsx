import type { FinalStory } from "@/lib/articles/types";

import { SafeStoryImage } from "./SafeStoryImage";

function getVisualTitle(story: FinalStory) {
  return story.visualHeadlineEN || story.editorialTitleEN || "Needs Review";
}

function getVisualTitleClass(value: string) {
  if (value.length > 160) {
    return "text-sm leading-[1.08]";
  }

  if (value.length > 120) {
    return "text-base leading-[1.12]";
  }

  if (value.length > 88) {
    return "text-lg leading-[1.14]";
  }

  if (value.length > 58) {
    return "text-xl leading-[1.12]";
  }

  return "text-2xl leading-tight";
}

function getVisualSummaryClass(value: string | undefined) {
  const length = (value || "").replace(/\s+/g, " ").trim().length;

  return length > 420
    ? length > 700
      ? "text-[10px] leading-[1rem]"
      : "text-xs leading-[1.15rem]"
    : length > 280
      ? "text-[13px] leading-5"
      : length > 180
        ? "text-sm leading-[1.35rem]"
        : "text-base leading-6";
}

export function StoryPreviewCard({ story }: { story: FinalStory }) {
  const title = getVisualTitle(story);

  return (
    <article className="flex aspect-[4/5] w-[min(100%,420px)] flex-col overflow-hidden rounded-[24px] border border-border bg-panel-strong p-4 shadow-[0_8px_24px_rgba(72,50,33,0.05)]">
      <div className="relative mb-4 h-[38%] flex-none overflow-hidden rounded-[18px] border border-border bg-panel">
        <SafeStoryImage
          src={story.imageUrl}
          alt={title || "Editorial story image"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,0.28fr)_minmax(0,0.72fr)_auto] gap-2.5">
        <div className="min-h-0 overflow-hidden">
          <h3 className={`font-semibold text-foreground ${getVisualTitleClass(title)}`}>
            {title}
          </h3>
        </div>
        <div className="min-h-0 overflow-hidden">
          <p className={`text-muted ${getVisualSummaryClass(story.editorialSummaryEN)}`}>
            {story.editorialSummaryEN ||
              "This story is awaiting approved English editorial output."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-border bg-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            {story.sourceName}
          </span>
        </div>
      </div>
    </article>
  );
}
