import type { FinalStory } from "@/lib/articles/types";

import { SafeStoryImage } from "./SafeStoryImage";

function CollageStoryBlock({
  story,
  compact = false,
}: {
  story: FinalStory;
  compact?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-border bg-panel-strong">
      <div className={compact ? "grid grid-cols-[88px_1fr]" : "grid md:grid-cols-[140px_1fr]"}>
        <div className={compact ? "h-full min-h-[88px]" : "h-full min-h-[132px]"}>
          <SafeStoryImage
            src={story.imageUrl}
            alt={story.visualHeadlineEN || story.editorialTitleEN || "Story image"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className={compact ? "space-y-2 p-3" : "space-y-2 p-4"}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            {story.visualHeadlineEN || "EDITORIAL STORY"}
          </p>
          <h3
            className={
              compact
                ? "line-clamp-2 text-sm font-semibold text-foreground"
                : "line-clamp-2 text-base font-semibold text-foreground"
            }
          >
            {story.editorialTitleEN || "Needs Review"}
          </h3>
          <p className="line-clamp-3 text-sm leading-6 text-muted">
            {story.editorialSummaryEN ||
              "This story is awaiting approved English editorial output."}
          </p>
        </div>
      </div>
    </article>
  );
}

export function HomepageCollagePreview({ stories }: { stories: FinalStory[] }) {
  if (stories.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
        Select stories to populate the homepage collage preview.
      </div>
    );
  }

  const featuredStory = stories[0];
  const supportingStories = stories.slice(1, 5);

  if (stories.length === 1) {
    return (
      <article className="overflow-hidden rounded-[32px] border border-border bg-panel-strong shadow-[0_14px_40px_rgba(72,50,33,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[420px] bg-panel">
            <SafeStoryImage
              src={featuredStory.imageUrl}
              alt={featuredStory.visualHeadlineEN || featuredStory.editorialTitleEN || "Story image"}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-[rgba(36,31,26,0.82)] via-[rgba(36,31,26,0.52)] to-transparent p-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/75">
                Homepage Collage
              </p>
              <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight">
                {featuredStory.visualHeadlineEN || featuredStory.editorialTitleEN || "Needs Review"}
              </h2>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6 p-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Lead Story
              </p>
              <h3 className="text-3xl font-semibold tracking-tight text-foreground">
                {featuredStory.editorialTitleEN || "Needs Review"}
              </h3>
              <p className="text-base leading-7 text-foreground/85">
                {featuredStory.editorialSummaryEN ||
                  "This story is awaiting approved English summary output."}
              </p>
            </div>
            <div className="rounded-[24px] border border-border bg-panel p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Editorial Context
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {featuredStory.editorialContextEN ||
                  "This story remains in the internal editorial review queue."}
              </p>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[32px] border border-border bg-panel-strong p-4 shadow-[0_14px_40px_rgba(72,50,33,0.08)] sm:p-5">
      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="overflow-hidden rounded-[28px] border border-border bg-panel">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[380px] bg-panel">
              <SafeStoryImage
                src={featuredStory.imageUrl}
                alt={featuredStory.visualHeadlineEN || featuredStory.editorialTitleEN || "Story image"}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-[rgba(36,31,26,0.86)] via-[rgba(36,31,26,0.54)] to-transparent p-7 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-white/75">
                  Homepage Collage
                </p>
                <h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight">
                  {featuredStory.visualHeadlineEN || featuredStory.editorialTitleEN || "Needs Review"}
                </h2>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-5 p-5">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  Main Feature
                </p>
                <h3 className="text-3xl font-semibold tracking-tight text-foreground">
                  {featuredStory.editorialTitleEN || "Needs Review"}
                </h3>
                <p className="text-base leading-7 text-foreground/85">
                  {featuredStory.editorialSummaryEN ||
                    "This story is awaiting approved English summary output."}
                </p>
              </div>
              <div className="rounded-[24px] border border-border bg-panel-strong p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Supporting Context
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {featuredStory.editorialContextEN ||
                    "This story remains in the internal editorial review queue."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-4 content-start">
          {supportingStories.slice(0, 2).map((story) => (
            <CollageStoryBlock key={story.id} story={story} />
          ))}
        </aside>
      </div>

      {supportingStories.slice(2).length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {supportingStories.slice(2).map((story) => (
            <CollageStoryBlock key={story.id} story={story} compact />
          ))}
        </div>
      ) : null}
    </article>
  );
}
