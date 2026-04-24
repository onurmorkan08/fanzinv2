"use client";

import { useEffect, useRef, useState } from "react";

import { SafeStoryImage } from "@/components/SafeStoryImage";
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

function storyStatusClasses(publishable: boolean) {
  return publishable
    ? "inline-flex items-center rounded-full border border-[#b9cfbf] bg-[#edf6ef] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#35543d]"
    : "inline-flex items-center rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent";
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

export default function Home() {
  const [manualLink, setManualLink] = useState("");
  const [candidateStories, setCandidateStories] = useState<FinalStory[]>([]);
  const [selectedStories, setSelectedStories] = useState<FinalStory[]>([]);
  const [candidatesStatus, setCandidatesStatus] = useState<AsyncStatus>("idle");
  const [candidatesMessage, setCandidatesMessage] = useState("");
  const [manualStatus, setManualStatus] = useState<AsyncStatus>("idle");
  const [manualMessage, setManualMessage] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [downloadMessage, setDownloadMessage] = useState("");
  const [downloadStatus, setDownloadStatus] = useState<AsyncStatus>("idle");
  const collageRef = useRef<HTMLDivElement | null>(null);
  const storyPreviewRefs = useRef<Record<string, HTMLDivElement | null>>({});

  async function downloadNodeAsPng(node: HTMLElement | null, filename: string) {
    if (!node) {
      setDownloadStatus("error");
      setDownloadMessage("No visual output was available to export.");
      return;
    }

    setDownloadStatus("loading");
    setDownloadMessage("Preparing PNG export...");

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#fcf8f1",
      });

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      setDownloadStatus("success");
      setDownloadMessage(`${filename} downloaded.`);
    } catch (error) {
      setDownloadStatus("error");
      setDownloadMessage(
        error instanceof Error ? error.message : "Visual export failed.",
      );
    }
  }

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
      setPreviewMessage("Preview updates automatically from selected stories.");
      setManualLink("");
    } catch (error) {
      setManualStatus("error");
      setManualMessage(
        error instanceof Error ? error.message : "Manual article extraction failed.",
      );
    }
  }

  function addSelectedStory(story: FinalStory) {
    setSelectedStories((stories) => addOrUpdateStoryById(stories, story));
    setPreviewMessage("Preview updates automatically from selected stories.");
  }

  function removeSelectedStory(story: FinalStory) {
    setSelectedStories((stories) => stories.filter((item) => item.id !== story.id));
  }

  const collageFeed =
    selectedStories.length > 0 ? selectedStories : candidateStories.slice(0, 8);
  const heroStory = collageFeed[0];
  const collageStories = collageFeed.slice(1);

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
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted md:grid-cols-4">
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
            <p>
              Download:{" "}
              <span className="font-medium text-foreground">{downloadMessage || "Idle"}</span>
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Aday Haberler</h2>
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
                <h2 className="text-2xl font-semibold tracking-tight">Seçilen Haberler</h2>
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
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Kolaj ve tekil haber görselleri
              </h2>
              <p className="text-sm text-muted">
                Homepage collage and single-story pages built only from final English story fields.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void downloadNodeAsPng(collageRef.current, "fanzin-homepage-collage.png")}
              disabled={downloadStatus === "loading" || collageFeed.length === 0}
              className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741712] disabled:cursor-wait disabled:opacity-70"
            >
              {downloadStatus === "loading" ? "İndiriliyor..." : "Kolajı İndir"}
            </button>
          </div>

          {collageFeed.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
              Seçilen haberler geldiğinde ana sayfa kolajı burada oluşur.
            </div>
          ) : (
            <div className="space-y-6">
              <div ref={collageRef}>
                <article className="overflow-hidden rounded-[34px] border border-border bg-[#5b1816] shadow-[0_18px_44px_rgba(72,50,33,0.18)]">
                  <div className="border-b border-black/15 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-white p-1.5 shadow-sm">
                          <img
                            src="/march19-platform-logo.svg"
                            alt="March 19 Platform logo"
                            className="h-14 w-14 rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                            Homepage Collage
                          </p>
                          <p className="text-sm text-white/85">
                            The first selected story leads the page and every other story appears as
                            a visible front-page block with image and headline.
                          </p>
                        </div>
                      </div>
                      <StoryBadge tone="muted">{collageFeed.length} stories</StoryBadge>
                    </div>
                  </div>

                  <div className="grid gap-0 xl:grid-cols-[1.55fr_1fr]">
                    <section className="relative min-h-[560px] overflow-hidden border-b border-black/20 xl:border-r xl:border-b-0">
                      <SafeStoryImage
                        src={heroStory?.imageUrl || ""}
                        alt={heroStory?.visualHeadlineEN || "Editorial story image"}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.96)] via-[rgba(0,0,0,0.42)] to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 space-y-4 p-8 text-white sm:p-10">
                        <div className="flex items-center gap-3">
                          <img
                            src="/march19-platform-logo.svg"
                            alt="March 19 Platform logo"
                            className="h-12 w-12 rounded-full border border-white/30 bg-white/95 p-1"
                          />
                          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/75">
                            Main Cover Story
                          </p>
                        </div>
                        <h3 className="max-w-3xl text-4xl font-semibold uppercase leading-[1.02] tracking-[0.08em] sm:text-5xl">
                          {heroStory?.visualHeadlineEN || "REVIEW REQUIRED"}
                        </h3>
                        <p className="max-w-2xl text-sm leading-6 text-white/88 sm:text-base">
                          {heroStory?.editorialSummaryEN ||
                            "This story is awaiting approved English editorial output."}
                        </p>
                      </div>
                    </section>

                    <section className="flex flex-col gap-4 bg-[#f7efe4] p-5 sm:p-6">
                      <div className="space-y-4 rounded-[26px] border border-[#d8c9b6] bg-[#fff9f1] p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-border bg-panel px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                            {heroStory?.sourceName || "Editorial Source"}
                          </span>
                          <span className={storyStatusClasses(Boolean(heroStory?.publishable))}>
                            {heroStory?.publishable ? "Ready" : "Needs Review"}
                          </span>
                        </div>
                        <h4 className="text-3xl font-semibold leading-tight tracking-tight text-foreground">
                          {heroStory?.editorialTitleEN || "Needs Review"}
                        </h4>
                        <p className="text-base leading-7 text-foreground/85">
                          {heroStory?.editorialContextEN ||
                            "This story is awaiting approved English editorial output."}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {collageStories.map((story) => (
                          <article
                            key={story.id}
                            className="overflow-hidden rounded-[22px] border border-[#d8c9b6] bg-[#fff9f1]"
                          >
                            <div className="grid grid-cols-[96px_1fr]">
                              <div className="min-h-[112px] border-r border-[#d8c9b6]">
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
                                <h5 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                                  {story.editorialTitleEN || "Needs Review"}
                                </h5>
                                <p className="line-clamp-1 text-xs text-muted">{story.sourceName}</p>
                                <span className={storyStatusClasses(story.publishable)}>
                                  {story.publishable ? "Ready" : "Needs Review"}
                                </span>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="border-t border-black/15 bg-[#6a1d19] p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <img
                        src="/march19-platform-logo.svg"
                        alt="March 19 Platform logo"
                        className="h-10 w-10 rounded-full border border-white/25 bg-white/95 p-1"
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                          Front Page Story Strip
                        </p>
                        <p className="text-sm text-white/85">
                          Every homepage item below keeps a visible image, headline, and short English
                          deck in one collage surface.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {collageFeed.map((story) => (
                        <article
                          key={`${story.id}-front-page`}
                          className="overflow-hidden rounded-[24px] border border-white/15 bg-[#fff7eb]"
                        >
                          <div className="grid grid-cols-[120px_1fr]">
                            <div className="min-h-[128px] border-r border-[#d8c9b6] bg-[#eaddcb]">
                              <SafeStoryImage
                                src={story.imageUrl}
                                alt={story.visualHeadlineEN || "Editorial story image"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="space-y-2 p-4">
                              <p className="line-clamp-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                                {story.visualHeadlineEN || "REVIEW REQUIRED"}
                              </p>
                              <h5 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
                                {story.editorialTitleEN || "Needs Review"}
                              </h5>
                              <p className="line-clamp-2 text-xs leading-5 text-muted">
                                {story.editorialSummaryEN ||
                                  "This story is awaiting approved English editorial output."}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                                  {story.sourceName}
                                </span>
                                <span className={storyStatusClasses(story.publishable)}>
                                  {story.publishable ? "Ready" : "Needs Review"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </article>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {collageFeed.map((story) => (
                  <div key={story.id} className="space-y-3">
                    <div
                      ref={(node) => {
                        storyPreviewRefs.current[story.id] = node;
                      }}
                    >
                      <article className="overflow-hidden rounded-[28px] border border-border bg-panel-strong shadow-[0_10px_30px_rgba(72,50,33,0.08)]">
                        <div className="border-b border-border bg-[#f7efe4] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src="/march19-platform-logo.svg"
                              alt="March 19 Platform logo"
                              className="h-10 w-10 rounded-full border border-border bg-white p-1"
                            />
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                                Single Story Page
                              </p>
                              <p className="text-xs text-muted">Editorial asset preview</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="overflow-hidden rounded-[22px] border border-border bg-panel">
                            <div className="relative aspect-[16/9]">
                              <SafeStoryImage
                                src={story.imageUrl}
                                alt={story.visualHeadlineEN || "Editorial story image"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="mt-5 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <StoryBadge>{story.sourceName}</StoryBadge>
                              {story.publishable ? (
                                <StoryBadge tone="success">Ready</StoryBadge>
                              ) : (
                                <StoryBadge tone="warning">Needs Review</StoryBadge>
                              )}
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                              {story.visualHeadlineEN || "REVIEW REQUIRED"}
                            </p>
                            <h4 className="text-2xl font-semibold tracking-tight text-foreground">
                              {story.editorialTitleEN || "Needs Review"}
                            </h4>
                            <p className="text-base leading-7 text-foreground/85">
                              {story.editorialSummaryEN ||
                                "This story is awaiting approved English editorial output."}
                            </p>
                            <div className="rounded-[22px] border border-border bg-panel p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                                Editorial Context
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted">
                                {story.editorialContextEN ||
                                  "This item is being held in the internal review queue."}
                              </p>
                            </div>
                            <div className="text-xs uppercase tracking-[0.18em] text-muted">
                              {formatPublishedAt(story.publishedAt)}
                            </div>
                          </div>
                        </div>
                      </article>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void downloadNodeAsPng(
                          storyPreviewRefs.current[story.id],
                          `${story.id}-story-page.png`,
                        )
                      }
                      disabled={downloadStatus === "loading"}
                      className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-[#efe6d9] disabled:cursor-wait disabled:opacity-70"
                    >
                      {downloadStatus === "loading" ? "İndiriliyor..." : "Bu Görseli İndir"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
