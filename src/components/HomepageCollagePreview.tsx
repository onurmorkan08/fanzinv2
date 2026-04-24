import type { FinalStory } from "@/lib/articles/types";

import { SafeStoryImage } from "./SafeStoryImage";

function StatusBadge({ publishable }: { publishable: boolean }) {
  return (
    <span
      className={
        publishable
          ? "inline-flex items-center rounded-full border border-[#b9cfbf] bg-[#edf6ef] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#35543d]"
          : "inline-flex items-center rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent"
      }
    >
      {publishable ? "Ready" : "Needs Review"}
    </span>
  );
}

function SupportingStoryBlock({ story }: { story: FinalStory }) {
  return (
    <article className="overflow-hidden rounded-[20px] border border-border bg-panel">
      <div className="grid grid-cols-[88px_1fr]">
        <div className="min-h-[88px]">
          <SafeStoryImage
            src={story.imageUrl}
            alt={story.visualHeadlineEN || "Editorial story image"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="space-y-2 p-3">
          <p className="line-clamp-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
            {story.visualHeadlineEN || "REVIEW REQUIRED"}
          </p>
          <p className="line-clamp-1 text-xs text-muted">{story.sourceName}</p>
          <StatusBadge publishable={story.publishable} />
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
  const supportingStories = selectedStories.slice(1, 5);

  return (
    <article className="rounded-[32px] border border-border bg-panel-strong p-4 shadow-[0_14px_40px_rgba(72,50,33,0.08)] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-border bg-panel">
          <SafeStoryImage
            src={hero.imageUrl}
            alt={hero.visualHeadlineEN || hero.editorialTitleEN || "Editorial story image"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-[rgba(36,31,26,0.88)] via-[rgba(36,31,26,0.55)] to-transparent p-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/80">
              MAIN COVER STORY
            </p>
            <h2 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight">
              {hero.visualHeadlineEN || hero.editorialTitleEN || "Needs Review"}
            </h2>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-[28px] border border-border bg-panel p-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-border bg-panel-strong px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground">
                {hero.sourceName}
              </span>
              <StatusBadge publishable={hero.publishable} />
            </div>
            <h3 className="text-3xl font-semibold tracking-tight text-foreground">
              {hero.editorialTitleEN || "Needs Review"}
            </h3>
            <p className="text-base leading-7 text-foreground/85">
              {hero.editorialSummaryEN ||
                "This story is awaiting approved English editorial output."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {supportingStories.map((story) => (
              <SupportingStoryBlock key={story.id} story={story} />
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
