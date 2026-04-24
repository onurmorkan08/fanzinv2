'use client';

import { useState } from "react";
import {
  mockFinalizedStories,
  mockManualAddArticle,
} from "@/lib/articles/mockData";
import { finalizeArticle } from "@/lib/articles/finalize";
import type { FinalStory } from "@/lib/articles/types";

function addOrUpdateStoryById(stories: FinalStory[], story: FinalStory) {
  const existingIndex = stories.findIndex((item) => item.id === story.id);

  if (existingIndex === -1) {
    return [story, ...stories];
  }

  return stories.map((item) => (item.id === story.id ? item : item));
}

function formatPublishedAt(value?: string) {
  if (!value) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StoryBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warning" | "muted";
}) {
  const toneClasses =
    tone === "warning"
      ? "border-accent/20 bg-accent-soft text-accent"
      : tone === "muted"
        ? "border-border bg-panel text-muted"
        : "border-border bg-panel-strong text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${toneClasses}`}
    >
      {children}
    </span>
  );
}

function StoryRow({
  story,
  actionLabel,
  onAction,
}: {
  story: FinalStory;
  actionLabel: string;
  onAction: (story: FinalStory) => void;
}) {
  return (
    <article className="rounded-[28px] border border-border bg-panel-strong p-4 shadow-[0_10px_30px_rgba(72,50,33,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative h-44 w-full overflow-hidden rounded-[22px] border border-border bg-panel md:w-56 md:flex-none">
          <img
            src={story.imageUrl}
            alt={story.visualHeadlineEN}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StoryBadge>{story.sourceName}</StoryBadge>
            {!story.publishable ? (
              <StoryBadge tone="warning">Needs Review</StoryBadge>
            ) : null}
            {story.needsReview ? (
              <StoryBadge tone="warning">Warning</StoryBadge>
            ) : null}
            {story.imageStatus === "fallback" ? (
              <StoryBadge tone="muted">Fallback image</StoryBadge>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {story.visualHeadlineEN}
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {story.editorialTitleEN || "Needs Review"}
            </h2>
            <p className="text-sm leading-6 text-foreground/85">
              {story.editorialSummaryEN ||
                "This story could not produce approved English editorial fields yet."}
            </p>
            <p className="text-sm leading-6 text-muted">
              {story.editorialContextEN ||
                "This item is being held in the internal review queue."}
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-xs text-muted">
              <p>{formatPublishedAt(story.publishedAt)}</p>
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-border underline-offset-4"
              >
                Source link
              </a>
              {story.errorReason ? (
                <p className="text-accent">{story.errorReason}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onAction(story)}
              className="rounded-full border border-accent bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#741712]"
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function PreviewCard({ story }: { story: FinalStory | undefined }) {
  if (!story) {
    return (
      <div className="rounded-[32px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
        Select a story to populate the visual preview area.
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-[32px] border border-border bg-panel-strong shadow-[0_14px_40px_rgba(72,50,33,0.08)]">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="min-h-[300px] bg-panel">
          <img
            src={story.imageUrl}
            alt={story.visualHeadlineEN}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-between gap-6 p-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {story.visualHeadlineEN}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
              {story.editorialTitleEN || "Needs Review"}
            </h2>
            <p className="text-base leading-7 text-foreground/85">
              {story.editorialSummaryEN ||
                "This story is awaiting approved English summary output."}
            </p>
            <p className="text-sm leading-6 text-muted">
              {story.editorialContextEN ||
                "This story remains in the internal editorial review queue."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StoryBadge>{story.sourceName}</StoryBadge>
            {!story.publishable ? (
              <StoryBadge tone="warning">Needs Review</StoryBadge>
            ) : null}
            {story.imageStatus === "fallback" ? (
              <StoryBadge tone="muted">Fallback image</StoryBadge>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function SmallPreviewCard({ story }: { story: FinalStory }) {
  return (
    <article className="rounded-[24px] border border-border bg-panel-strong p-3 shadow-[0_8px_24px_rgba(72,50,33,0.05)]">
      <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-[18px] border border-border bg-panel">
        <img
          src={story.imageUrl}
          alt={story.visualHeadlineEN}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {story.visualHeadlineEN}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {story.editorialTitleEN || "Needs Review"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {!story.publishable ? (
            <StoryBadge tone="warning">Needs Review</StoryBadge>
          ) : null}
          {story.imageStatus === "fallback" ? (
            <StoryBadge tone="muted">Fallback image</StoryBadge>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [manualLink, setManualLink] = useState("");
  const [candidateStories, setCandidateStories] = useState(mockFinalizedStories);
  const [selectedStories, setSelectedStories] = useState<FinalStory[]>(
    mockFinalizedStories.filter((story) => story.publishable).slice(0, 2),
  );

  const previewStory = selectedStories[0] ?? candidateStories[0];

  function handleAddManualLink() {
    const finalizedStory = finalizeArticle({
      ...mockManualAddArticle,
      id: `${mockManualAddArticle.id}-${Date.now()}`,
      sourceUrl: manualLink.trim() || mockManualAddArticle.sourceUrl,
    });

    setCandidateStories((stories) => addOrUpdateStoryById(stories, finalizedStory));
    setManualLink("");
  }

  function handleRefresh() {
    setCandidateStories(mockFinalizedStories);
  }

  function handleCreateCarousel() {
    const storiesToPromote = candidateStories
      .filter((story) => story.publishable)
      .slice(0, 3);

    setSelectedStories((stories) =>
      storiesToPromote.reduce(addOrUpdateStoryById, stories),
    );
  }

  function addSelectedStory(story: FinalStory) {
    setSelectedStories((stories) => addOrUpdateStoryById(stories, story));
  }

  function removeSelectedStory(story: FinalStory) {
    setSelectedStories((stories) => stories.filter((item) => item.id !== story.id));
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-[32px] border border-border bg-panel-strong px-6 py-8 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:px-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Internal Editorial Admin
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              March 19 Platform Fanzin Paneli
            </h1>
            <p className="text-sm leading-7 text-muted sm:text-base">
              Internal editorial tool for collecting politically relevant Turkish
              reporting, converting it into controlled English output, resolving
              imagery, and preparing story-safe data for publication workflows.
            </p>
          </div>
        </header>

        <section className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <label className="flex-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Manual link input
              </span>
              <input
                type="url"
                value={manualLink}
                onChange={(event) => setManualLink(event.target.value)}
                placeholder="https://example.com/manual-story"
                className="w-full rounded-full border border-border bg-background px-4 py-3 text-sm outline-none ring-0 placeholder:text-muted/70 focus:border-accent"
              />
            </label>
            <div className="flex flex-wrap gap-3 pt-6 xl:pt-5">
              <button
                type="button"
                onClick={handleAddManualLink}
                className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741712]"
              >
                Bağlantı Ekle
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded-full border border-border bg-panel px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[#efe6d9]"
              >
                Yenile
              </button>
              <button
                type="button"
                onClick={handleCreateCarousel}
                className="rounded-full border border-border bg-panel px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[#efe6d9]"
              >
                Karusel Oluştur
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Aday Haberler
                </h2>
                <p className="text-sm text-muted">
                  Unified output from the finalized V2 article pipeline.
                </p>
              </div>
              <StoryBadge tone="muted">{candidateStories.length} stories</StoryBadge>
            </div>
            <div className="flex flex-col gap-4">
              {candidateStories.map((story) => (
                <StoryRow
                  key={story.id}
                  story={story}
                  actionLabel="Seç"
                  onAction={addSelectedStory}
                />
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Seçilen Haberler
                </h2>
                <p className="text-sm text-muted">
                  Stories staged for collage and single-story visual output.
                </p>
              </div>
              <StoryBadge tone="muted">{selectedStories.length} selected</StoryBadge>
            </div>
            <div className="flex flex-col gap-4">
              {selectedStories.length > 0 ? (
                selectedStories.map((story) => (
                  <StoryRow
                    key={story.id}
                    story={story}
                    actionLabel="Kaldır"
                    onAction={removeSelectedStory}
                  />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
                  No stories selected yet. Pick candidate items to stage them for
                  visual production.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Kolaj ve tekil haber görselleri
            </h2>
            <p className="text-sm text-muted">
              Preview-safe cards built only from final story fields.
            </p>
          </div>
          <div className="space-y-6">
            <PreviewCard story={previewStory} />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(selectedStories.length > 0 ? selectedStories : candidateStories)
                .slice(0, 4)
                .map((story) => (
                  <SmallPreviewCard key={story.id} story={story} />
                ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
