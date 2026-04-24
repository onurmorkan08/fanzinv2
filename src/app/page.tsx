"use client";

import { useEffect, useState } from "react";

import { FALLBACK_EDITORIAL_IMAGE } from "@/lib/articles/images";
import type { FinalStory } from "@/lib/articles/types";

type AsyncStatus = "idle" | "loading" | "success" | "error";

function addOrUpdateStoryById(stories: FinalStory[], story: FinalStory) {
  const existingIndex = stories.findIndex((item) => item.id === story.id);

  if (existingIndex === -1) {
    return [...stories, story];
  }

  return stories.map((item) => (item.id === story.id ? story : item));
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

function formatImageStatus(status: FinalStory["imageStatus"]) {
  if (status === "found") {
    return "Found";
  }

  if (status === "fallback") {
    return "Fallback";
  }

  return "Missing";
}

function StoryBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warning" | "muted" | "success";
}) {
  const toneClasses =
    tone === "warning"
      ? "border-accent/20 bg-accent-soft text-accent"
      : tone === "muted"
        ? "border-border bg-panel text-muted"
        : tone === "success"
          ? "border-[#b9cfbf] bg-[#edf6ef] text-[#35543d]"
          : "border-border bg-panel-strong text-foreground";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase ${toneClasses}`}
    >
      {children}
    </span>
  );
}

function SafeStoryImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_EDITORIAL_IMAGE);

  useEffect(() => {
    setImageSrc(src || FALLBACK_EDITORIAL_IMAGE);
  }, [src]);

  return (
    <img
      src={imageSrc || FALLBACK_EDITORIAL_IMAGE}
      alt={alt || "Editorial story image"}
      className={className}
      onError={() => setImageSrc(FALLBACK_EDITORIAL_IMAGE)}
    />
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
          <SafeStoryImage
            src={story.imageUrl}
            alt={story.visualHeadlineEN || "Editorial story image"}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StoryBadge>{story.sourceName}</StoryBadge>
            {story.publishable ? (
              <StoryBadge tone="success">Ready</StoryBadge>
            ) : (
              <StoryBadge tone="warning">Needs Review</StoryBadge>
            )}
            {story.imageStatus === "fallback" ? (
              <StoryBadge tone="muted">Fallback Image</StoryBadge>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {story.visualHeadlineEN || "REVIEW REQUIRED"}
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
              <p>Image status: {formatImageStatus(story.imageStatus)}</p>
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

function PreviewCard({ story }: { story?: FinalStory }) {
  if (!story) {
    return (
      <div className="rounded-[32px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
        Select stories to populate the collage and single-story preview area.
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-[32px] border border-border bg-panel-strong shadow-[0_14px_40px_rgba(72,50,33,0.08)]">
      <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[320px] bg-panel">
          <SafeStoryImage
            src={story.imageUrl}
            alt={story.visualHeadlineEN || "Editorial story image"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(36,31,26,0.78)] to-transparent p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              Main Cover Preview
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {story.visualHeadlineEN || story.editorialTitleEN || "Needs Review"}
            </h2>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6 p-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StoryBadge>{story.sourceName}</StoryBadge>
              {story.publishable ? (
                <StoryBadge tone="success">Ready</StoryBadge>
              ) : (
                <StoryBadge tone="warning">Needs Review</StoryBadge>
              )}
            </div>
            <h3 className="text-3xl font-semibold tracking-tight text-foreground">
              {story.editorialTitleEN || "Needs Review"}
            </h3>
            <p className="text-base leading-7 text-foreground/85">
              {story.editorialSummaryEN ||
                "This story is awaiting approved English summary output."}
            </p>
            <div className="rounded-[24px] border border-border bg-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Editorial Context
              </p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {story.editorialContextEN ||
                  "This story remains in the internal editorial review queue."}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] border border-border bg-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Visual Headline
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {story.visualHeadlineEN || "REVIEW REQUIRED"}
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Source
              </p>
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-sm text-foreground underline decoration-border underline-offset-4"
              >
                {story.sourceName}
              </a>
            </div>
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
        <SafeStoryImage
          src={story.imageUrl}
          alt={story.visualHeadlineEN || "Editorial story image"}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
          {story.visualHeadlineEN || "REVIEW REQUIRED"}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {story.editorialTitleEN || "Needs Review"}
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted">
          {story.editorialSummaryEN ||
            "This story is awaiting approved English editorial output."}
        </p>
        <div className="flex flex-wrap gap-2">
          {story.publishable ? (
            <StoryBadge tone="success">Ready</StoryBadge>
          ) : (
            <StoryBadge tone="warning">Needs Review</StoryBadge>
          )}
          {story.imageStatus === "fallback" ? (
            <StoryBadge tone="muted">Fallback Image</StoryBadge>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [manualLink, setManualLink] = useState("");
  const [candidateStories, setCandidateStories] = useState<FinalStory[]>([]);
  const [selectedStories, setSelectedStories] = useState<FinalStory[]>([]);
  const [candidatesStatus, setCandidatesStatus] = useState<AsyncStatus>("idle");
  const [candidatesMessage, setCandidatesMessage] = useState("");
  const [manualStatus, setManualStatus] = useState<AsyncStatus>("idle");
  const [manualMessage, setManualMessage] = useState("");
  const [previewStatus, setPreviewStatus] = useState<AsyncStatus>("idle");
  const [previewMessage, setPreviewMessage] = useState("");

  async function loadCandidates() {
    setCandidatesStatus("loading");
    setCandidatesMessage("Fetching source articles...");

    try {
      const response = await fetch("/api/articles/candidates", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        stories?: FinalStory[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Automatic source ingestion failed.");
      }

      setCandidateStories(payload.stories ?? []);
      setCandidatesStatus("success");
      setCandidatesMessage(
        payload.stories && payload.stories.length > 0
          ? `${payload.stories.length} candidate stories loaded.`
          : "No source stories were extracted from the current source list.",
      );
    } catch (error) {
      setCandidatesStatus("error");
      setCandidatesMessage(
        error instanceof Error ? error.message : "Automatic source ingestion failed.",
      );
    }
  }

  useEffect(() => {
    void loadCandidates();
  }, []);

  async function handleAddManualLink() {
    if (!manualLink.trim()) {
      setManualStatus("error");
      setManualMessage("Paste a source link before adding it.");
      return;
    }

    setManualStatus("loading");
    setManualMessage("Extracting article from manual link...");

    try {
      const response = await fetch("/api/articles/manual", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ url: manualLink.trim() }),
      });
      const payload = (await response.json()) as {
        story?: FinalStory;
        error?: string;
      };

      if (!response.ok || !payload.story) {
        throw new Error(payload.error || "Manual article extraction failed.");
      }

      setCandidateStories((stories) => addOrUpdateStoryById(stories, payload.story!));
      setSelectedStories((stories) => addOrUpdateStoryById(stories, payload.story!));
      setManualStatus("success");
      setManualMessage(
        payload.story.publishable
          ? "Manual story added and selected."
          : "Manual story added for review and selected.",
      );
      setPreviewStatus("success");
      setPreviewMessage("Preview updated from selected stories.");
      setManualLink("");
    } catch (error) {
      setManualStatus("error");
      setManualMessage(
        error instanceof Error ? error.message : "Manual article extraction failed.",
      );
    }
  }

  function handleCreateCarousel() {
    if (selectedStories.length === 0) {
      setPreviewStatus("error");
      setPreviewMessage("Select at least one story to build the preview section.");
      return;
    }

    setPreviewStatus("success");
    setPreviewMessage("Preview updated from selected stories.");
  }

  function addSelectedStory(story: FinalStory) {
    setSelectedStories((stories) => addOrUpdateStoryById(stories, story));
    setPreviewStatus("success");
    setPreviewMessage("Story added to the preview queue.");
  }

  function removeSelectedStory(story: FinalStory) {
    setSelectedStories((stories) => stories.filter((item) => item.id !== story.id));
  }

  const previewStory = selectedStories[0];

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
                disabled={manualStatus === "loading"}
                className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741712] disabled:cursor-wait disabled:opacity-70"
              >
                {manualStatus === "loading" ? "Ekleniyor..." : "Bağlantı Ekle"}
              </button>
              <button
                type="button"
                onClick={() => void loadCandidates()}
                disabled={candidatesStatus === "loading"}
                className="rounded-full border border-border bg-panel px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[#efe6d9] disabled:cursor-wait disabled:opacity-70"
              >
                {candidatesStatus === "loading" ? "Yenileniyor..." : "Yenile"}
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
          <div className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-3">
            <p>
              Auto fetch:{" "}
              <span className="font-medium text-foreground">{candidatesMessage || "Idle"}</span>
            </p>
            <p>
              Manual link:{" "}
              <span className="font-medium text-foreground">{manualMessage || "Idle"}</span>
            </p>
            <p>
              Preview:{" "}
              <span className="font-medium text-foreground">{previewMessage || "Idle"}</span>
            </p>
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
              {candidateStories.length > 0 ? (
                candidateStories.map((story) => (
                  <StoryRow
                    key={story.id}
                    story={story}
                    actionLabel="Seç"
                    onAction={addSelectedStory}
                  />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
                  {candidatesStatus === "loading"
                    ? "Source ingestion is running."
                    : "No candidate stories are available yet."}
                </div>
              )}
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
            {selectedStories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {selectedStories.map((story) => (
                  <SmallPreviewCard key={story.id} story={story} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
