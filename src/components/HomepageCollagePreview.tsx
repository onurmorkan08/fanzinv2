import type { FinalStory } from "@/lib/articles/types";

import { SafeStoryImage } from "./SafeStoryImage";

function getVisualTitle(story: FinalStory | undefined) {
  return story?.visualHeadlineEN || story?.editorialTitleEN || "Needs Review";
}

function getVisualTitleClass(value: string, size: "hero" | "small") {
  const length = value.length;

  if (size === "hero") {
    return length > 130
      ? "text-lg leading-[1.06]"
      : length > 92
      ? "text-[21px] leading-[1.08]"
      : length > 62
        ? "text-2xl leading-[1.07]"
        : "text-3xl leading-tight";
  }

  return length > 130
    ? "text-[8px] leading-[0.68rem]"
    : length > 88
    ? "text-[10px] leading-[0.82rem]"
    : length > 62
      ? "text-[11px] leading-[0.9rem]"
      : length > 38
        ? "text-xs leading-4"
        : "text-sm leading-5";
}

function SupportingStoryBlock({ story }: { story: FinalStory }) {
  const title = getVisualTitle(story);

  return (
    <article className="min-h-0 overflow-hidden rounded-[18px] border border-border bg-panel">
      <div className="relative h-full bg-[#efe3d2]">
        <SafeStoryImage
          src={story.imageUrl}
          alt={title || "Editorial story image"}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-black/45 px-2.5 py-2 text-white backdrop-blur-sm">
          <p className={`line-clamp-3 font-semibold ${getVisualTitleClass(title, "small")}`}>
            {title}
          </p>
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
          <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-[rgba(36,31,26,0.88)] via-[rgba(36,31,26,0.55)] to-transparent p-8 text-white">
            <h2 className={`line-clamp-3 font-semibold tracking-tight ${getVisualTitleClass(heroTitle, "hero")}`}>
              {heroTitle}
            </h2>
          </div>
        </section>

        <section className="overflow-hidden bg-[#f7efe4] p-4">
          <div className={`grid h-full gap-3 ${gridClass}`}>
            {supportingStories.map((story) => (
              <SupportingStoryBlock
                key={story.id}
                story={story}
              />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
