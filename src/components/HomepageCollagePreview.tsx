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

function getVisualTitle(story: FinalStory | undefined) {
  return story?.visualHeadlineEN || story?.editorialTitleEN || "Needs Review";
}

function getVisualTitleClass(value: string, size: "hero" | "small") {
  const length = value.length;

  if (size === "hero") {
    return length > 92
      ? "text-[23px] leading-[1.08]"
      : length > 62
        ? "text-[26px] leading-[1.07]"
        : "text-3xl leading-tight";
  }

  return length > 84
    ? "text-[11px] leading-4"
    : length > 56
      ? "text-xs leading-[1.1rem]"
      : "text-sm leading-5";
}

function SupportingStoryBlock({ story, compact }: { story: FinalStory; compact: boolean }) {
  const title = getVisualTitle(story);

  return (
    <article className="min-h-0 overflow-hidden rounded-[18px] border border-border bg-panel">
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-[0_0_42%]">
          <div className="relative h-full">
            <SafeStoryImage
              src={story.imageUrl}
              alt={title || "Editorial story image"}
              className="h-full w-full object-contain bg-[#efe3d2]"
            />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
              {getVisualSourceLabel(story)}
            </span>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-1 p-2.5">
          <p className={`line-clamp-3 font-semibold text-foreground ${getVisualTitleClass(title, "small")}`}>
            {title}
          </p>
          {!compact ? (
            <p className="line-clamp-3 text-xs leading-[1.05rem] text-muted">
              {clampVisualText(story.editorialSummaryEN, 220)}
            </p>
          ) : null}
          <p className="line-clamp-1 text-xs text-muted">{story.sourceName}</p>
        </div>
      </div>
    </article>
  );
}

export function HomepageCollagePreview({
  selectedStories,
}: {
  selectedStories: FinalStory[];
}) {
  if (selectedStories.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
        Select stories to populate the homepage collage preview.
      </div>
    );
  }

  const hero = selectedStories[0];
  const heroTitle = getVisualTitle(hero);
  const visibleStories = selectedStories.slice(0, 8);
  const supportingStories = visibleStories.slice(1);
  const gridClass =
    visibleStories.length <= 4
      ? "grid-cols-1 sm:grid-cols-3"
      : visibleStories.length <= 7
        ? "grid-cols-2 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-4";
  const rowClass =
    visibleStories.length === 1
      ? "grid-rows-[1fr_0fr]"
      : visibleStories.length <= 4
        ? "grid-rows-[0.58fr_0.42fr]"
        : "grid-rows-[0.48fr_0.52fr]";

  return (
    <article className="aspect-[4/5] w-[min(100%,540px)] overflow-hidden rounded-[32px] border border-border bg-panel-strong shadow-[0_14px_40px_rgba(72,50,33,0.08)]">
      <div className={`grid h-full ${rowClass}`}>
        <section className="relative overflow-hidden border-b border-border bg-panel">
          <SafeStoryImage
            src={hero.imageUrl}
            alt={hero.visualHeadlineEN || hero.editorialTitleEN || "Editorial story image"}
            className="absolute inset-0 h-full w-full object-contain bg-[#2f1412]"
          />
          <span className="absolute left-6 top-6 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            {getVisualSourceLabel(hero)}
          </span>
          <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-[rgba(36,31,26,0.88)] via-[rgba(36,31,26,0.55)] to-transparent p-8 text-white">
            <h2 className={`line-clamp-3 font-semibold tracking-tight ${getVisualTitleClass(heroTitle, "hero")}`}>
              {heroTitle}
            </h2>
            {visibleStories.length <= 4 ? (
              <p className="line-clamp-3 text-sm leading-6 text-white/88">
                {clampVisualText(hero.editorialSummaryEN, 220)}
              </p>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden bg-[#f7efe4] p-4">
          <div className={`grid h-full gap-3 ${gridClass}`}>
            {supportingStories.map((story) => (
              <SupportingStoryBlock
                key={story.id}
                story={story}
                compact={visibleStories.length > 4}
              />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
