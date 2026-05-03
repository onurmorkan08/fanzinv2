"use client";

import { useEffect, useRef, useState } from "react";

import { SafeStoryImage } from "@/components/SafeStoryImage";
import { normalizeSourceName } from "@/lib/articles/source";
import type { FinalStory } from "@/lib/articles/types";

type AsyncStatus = "idle" | "loading" | "success" | "error";

const TRANSPARENT_IMAGE_PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function addOrUpdateStoryById(stories: FinalStory[], story: FinalStory) {
  const existingIndex = stories.findIndex((item) => item.id === story.id);

  if (existingIndex === -1) {
    return [...stories, story];
  }

  return stories.map((item) => (item.id === story.id ? story : item));
}

function formatPublishedAt(value?: string) {
  if (!value) {
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

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

function formatImageStatus(status: FinalStory["imageStatus"]) {
  if (status === "found") {
    return "Bulundu";
  }

  if (status === "fallback") {
    return "Yedek";
  }

  return "Eksik";
}

function getSafeExportFilename(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function waitForExportImages(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      if (image.complete) {
        return;
      }

      try {
        if (typeof image.decode === "function") {
          await image.decode();
          return;
        }
      } catch {
        // SafeStoryImage swaps broken images to the local fallback; continue with that.
      }

      await new Promise<void>((resolve) => {
        const finish = () => resolve();
        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      });
    }),
  );
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

function StoryEditor({
  story,
  onFieldChange,
}: {
  story: FinalStory;
  onFieldChange: (storyId: string, patch: Partial<FinalStory>) => void;
}) {
  return (
    <div className="grid gap-3 rounded-[22px] border border-border bg-background/70 p-4">
      <label className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          English Title
        </span>
        <input
          value={story.editorialTitleEN}
          onChange={(event) =>
            onFieldChange(story.id, { editorialTitleEN: event.target.value })
          }
          className="w-full rounded-2xl border border-border bg-panel px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          English Headline
        </span>
        <input
          value={story.visualHeadlineEN}
          onChange={(event) =>
            onFieldChange(story.id, { visualHeadlineEN: event.target.value })
          }
          className="w-full rounded-2xl border border-border bg-panel px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          English Summary
        </span>
        <textarea
          value={story.editorialSummaryEN}
          onChange={(event) =>
            onFieldChange(story.id, { editorialSummaryEN: event.target.value })
          }
          rows={3}
          className="w-full rounded-2xl border border-border bg-panel px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          English Story Text
        </span>
        <textarea
          value={story.editorialContextEN}
          onChange={(event) =>
            onFieldChange(story.id, { editorialContextEN: event.target.value })
          }
          rows={4}
          className="w-full rounded-2xl border border-border bg-panel px-3 py-2 text-sm leading-6 text-foreground outline-none focus:border-accent"
        />
      </label>

      <label className="space-y-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Image URL
        </span>
        <input
          value={story.imageUrl}
          onChange={(event) =>
            onFieldChange(story.id, {
              imageUrl: event.target.value,
              imageStatus: event.target.value ? "found" : "fallback",
            })
          }
          className="w-full rounded-2xl border border-border bg-panel px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
        />
      </label>
    </div>
  );
}

function StoryRow({
  story,
  actionLabel,
  onAction,
  onFieldChange,
}: {
  story: FinalStory;
  actionLabel: string;
  onAction: (story: FinalStory) => void;
  onFieldChange: (storyId: string, patch: Partial<FinalStory>) => void;
}) {
  return (
    <article className="rounded-[28px] border border-border bg-panel-strong p-4 shadow-[0_10px_30px_rgba(72,50,33,0.06)]">
      <div className="flex flex-col gap-4">
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
                {story.errorReason ? <p className="text-accent">{story.errorReason}</p> : null}
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
        <StoryEditor story={story} onFieldChange={onFieldChange} />
      </div>
    </article>
  );
}

export default function Home() {
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState("");
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

  async function renderNodeToBlob(node: HTMLElement | null) {
    if (!node) {
      throw new Error("No visual output was available to export.");
    }

    await waitForExportImages(node);

    const exportWidth = Math.ceil(node.scrollWidth || node.getBoundingClientRect().width);
    const exportHeight = Math.ceil(node.scrollHeight || node.getBoundingClientRect().height);

    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(node, {
      cacheBust: true,
      includeQueryParams: true,
      skipFonts: true,
      pixelRatio: 2,
      backgroundColor: "#fcf8f1",
      imagePlaceholder: TRANSPARENT_IMAGE_PLACEHOLDER,
      fetchRequestInit: {
        cache: "no-store",
      },
      style: {
        margin: "0",
        transform: "none",
      },
      width: exportWidth,
      height: exportHeight,
      canvasWidth: exportWidth * 2,
      canvasHeight: exportHeight * 2,
    });

    if (!blob) {
      throw new Error("Image export returned an empty file.");
    }

    return blob;
  }

  function triggerBlobDownload(blob: Blob, filename: string) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  async function downloadNodeAsPng(node: HTMLElement | null, filename: string) {
    setDownloadStatus("loading");
    setDownloadMessage("Preparing PNG export...");

    try {
      const blob = await renderNodeToBlob(node);
      triggerBlobDownload(blob, filename);
      setDownloadStatus("success");
      setDownloadMessage(`${filename} downloaded.`);
    } catch (error) {
      setDownloadStatus("error");
      setDownloadMessage(
        error instanceof Error ? error.message : "Visual export failed.",
      );
    }
  }

  async function downloadAllPosts() {
    if (collageFeed.length === 0) {
      setDownloadStatus("error");
      setDownloadMessage("No selected stories were available to export.");
      return;
    }

    setDownloadStatus("loading");
    setDownloadMessage("Preparing ZIP export...");

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (const story of collageFeed) {
        const blob = await renderNodeToBlob(storyPreviewRefs.current[story.id]);
        zip.file(`${getSafeExportFilename(story.id) || "story"}-instagram-post.png`, blob);
      }

      if (collageRef.current) {
        const collageBlob = await renderNodeToBlob(collageRef.current);
        zip.file("fanzin-homepage-collage.png", collageBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      triggerBlobDownload(zipBlob, "fanzin-instagram-posts.zip");
      setDownloadStatus("success");
      setDownloadMessage("ZIP export downloaded.");
    } catch (error) {
      setDownloadStatus("error");
      setDownloadMessage(
        error instanceof Error ? error.message : "Bulk export failed.",
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
    if (isUnlocked) {
      const timer = window.setTimeout(() => {
        void loadCandidates();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [isUnlocked]);

  function handleUnlock() {
    if (passwordInput === "1919") {
      setIsUnlocked(true);
      setPasswordError("");
      return;
    }

    setPasswordError("Şifre yanlış.");
  }

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

  function updateStoryFields(storyId: string, patch: Partial<FinalStory>) {
    setCandidateStories((stories) =>
      stories.map((story) => (story.id === storyId ? { ...story, ...patch } : story)),
    );
    setSelectedStories((stories) =>
      stories.map((story) => (story.id === storyId ? { ...story, ...patch } : story)),
    );
  }

  const collageFeed =
    selectedStories.length > 0 ? selectedStories : candidateStories.slice(0, 8);
  const heroStory = collageFeed[0];
  const collageStories = collageFeed.slice(1);

  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] w-full max-w-xl items-center justify-center">
          <section className="w-full rounded-[32px] border border-border bg-panel-strong p-8 shadow-[0_12px_40px_rgba(72,50,33,0.06)]">
            <div className="mb-6 flex items-center gap-4">
              <img
                src="/march19-platform-logo.png"
                alt="March 19 Platform logo"
                className="h-16 w-16 rounded-full bg-white p-1 shadow-sm"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
                  Secure Access
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">
                  March 19 Platform Fanzin Paneli
                </h1>
              </div>
            </div>

            <p className="mb-5 text-sm leading-7 text-muted">
              Enter the password to continue to the internal editorial panel.
            </p>

            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Password
                </span>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(event) => setPasswordInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleUnlock();
                    }
                  }}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
                />
              </label>

              {passwordError ? <p className="text-sm text-accent">{passwordError}</p> : null}

              <button
                type="button"
                onClick={handleUnlock}
                className="w-full rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741712]"
              >
                Sign In
              </button>
            </div>
          </section>
        </div>
      </main>
    );
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
                disabled={manualStatus === "loading"}
                className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741712] disabled:cursor-wait disabled:opacity-70"
              >
                {manualStatus === "loading" ? "Adding..." : "Add Link"}
              </button>
              <button
                type="button"
                onClick={() => void loadCandidates()}
                disabled={candidatesStatus === "loading"}
                className="rounded-full border border-border bg-panel px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[#efe6d9] disabled:cursor-wait disabled:opacity-70"
              >
                {candidatesStatus === "loading" ? "Refreshing..." : "Refresh"}
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
                <h2 className="text-2xl font-semibold tracking-tight">Candidate Stories</h2>
                <p className="text-sm text-muted">
                  Finalized V2 story objects with editable English output fields.
                </p>
              </div>
              <StoryBadge tone="muted">{candidateStories.length} stories</StoryBadge>
            </div>
            <div className="max-h-[1760px] overflow-y-auto pr-2">
              <div className="flex flex-col gap-4">
                {candidateStories.length > 0 ? (
                  candidateStories.map((story) => (
                    <StoryRow
                      key={story.id}
                      story={story}
                      actionLabel="Select"
                      onAction={addSelectedStory}
                      onFieldChange={updateStoryFields}
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
          </div>

          <div className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Selected Stories</h2>
                <p className="text-sm text-muted">
                  Selected stories for collage and Instagram-ready single-post visuals.
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
                    actionLabel="Remove"
                    onAction={removeSelectedStory}
                    onFieldChange={updateStoryFields}
                  />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
                  No stories selected yet. Pick candidate items to stage Instagram outputs.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Collage and Single Post Visuals
              </h2>
              <p className="text-sm text-muted">
                Every output below is sized as an Instagram post and uses English editorial text only.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void downloadNodeAsPng(collageRef.current, "fanzin-homepage-collage.png")
                }
                disabled={downloadStatus === "loading" || collageFeed.length === 0}
                className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741712] disabled:cursor-wait disabled:opacity-70"
              >
                {downloadStatus === "loading" ? "Downloading..." : "Download Collage"}
              </button>
              <button
                type="button"
                onClick={() => void downloadAllPosts()}
                disabled={downloadStatus === "loading" || collageFeed.length === 0}
                className="rounded-full border border-border bg-panel px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-[#efe6d9] disabled:cursor-wait disabled:opacity-70"
              >
                {downloadStatus === "loading" ? "Preparing..." : "Download All Posts"}
              </button>
            </div>
          </div>

          {collageFeed.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
              Select stories to generate the collage and square Instagram outputs.
            </div>
          ) : (
            <div className="space-y-6">
              <div ref={collageRef}>
                <article className="overflow-hidden rounded-[34px] border border-border bg-[#5b1816] shadow-[0_18px_44px_rgba(72,50,33,0.18)]">
                  <div className="border-b border-black/15 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src="/march19-platform-logo.png"
                          alt="March 19 Platform logo"
                          className="h-16 w-16 rounded-full bg-white p-1 shadow-sm"
                        />
                        <div>
                          <p className="text-lg font-semibold tracking-tight text-white">
                            March 19 Platform
                          </p>
                          <p className="text-sm text-white/80">Selected story collage</p>
                        </div>
                      </div>
                      <StoryBadge tone="muted">{collageFeed.length} stories</StoryBadge>
                    </div>
                  </div>

                  <div className="aspect-square overflow-hidden">
                    <div className="grid h-full grid-rows-[1.15fr_0.85fr]">
                      <section className="relative overflow-hidden border-b border-black/20">
                        <SafeStoryImage
                          src={heroStory?.imageUrl || ""}
                          alt={heroStory?.editorialTitleEN || "Editorial story image"}
                          className="absolute inset-0 h-full w-full object-contain bg-[#2f1412]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.96)] via-[rgba(0,0,0,0.42)] to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 space-y-4 p-8 text-white sm:p-10">
                          <div className="flex items-center gap-3">
                            <img
                              src="/march19-platform-logo.png"
                              alt="March 19 Platform logo"
                              className="h-12 w-12 rounded-full border border-white/30 bg-white p-1"
                            />
                            {heroStory ? (
                              <span className="inline-flex items-center rounded-full border border-white/25 bg-black/35 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85">
                                {getVisualSourceLabel(heroStory)}
                              </span>
                            ) : null}
                          </div>
                          <h3 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
                            {heroStory?.editorialTitleEN || "Needs Review"}
                          </h3>
                          <p className="max-w-2xl text-sm leading-6 text-white/88 sm:text-base">
                            {heroStory?.editorialSummaryEN ||
                              "This story is awaiting approved English editorial output."}
                          </p>
                          <p className="max-w-2xl text-sm leading-6 text-white/72">
                            {heroStory?.editorialContextEN ||
                              "This item is being held in the internal review queue."}
                          </p>
                        </div>
                      </section>

                      <section className="overflow-hidden bg-[#f7efe4] p-5 sm:p-6">
                        {collageStories.length > 0 ? (
                          <div className="grid h-full auto-rows-fr gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {collageStories.map((story) => (
                              <article
                                key={story.id}
                                className="overflow-hidden rounded-[22px] border border-[#d8c9b6] bg-[#fff9f1]"
                              >
                                <div className="flex h-full flex-col">
                                  <div className="h-32 border-b border-[#d8c9b6] bg-[#efe3d2]">
                                    <div className="relative h-full">
                                      <SafeStoryImage
                                        src={story.imageUrl}
                                        alt={story.editorialTitleEN || "Editorial story image"}
                                        className="h-full w-full object-contain"
                                      />
                                      <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                                        {getVisualSourceLabel(story)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
                                    <h4 className="text-sm font-semibold leading-5 text-foreground">
                                      {story.editorialTitleEN || "Needs Review"}
                                    </h4>
                                    <p className="line-clamp-3 text-xs leading-5 text-muted">
                                      {story.editorialSummaryEN ||
                                        "This story is awaiting approved English editorial output."}
                                    </p>
                                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                                        {story.sourceName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-[24px] border border-[#d8c9b6] bg-[#fff9f1] p-5 text-sm text-muted">
                            When only one story is selected, the collage stays as a single-feature cover.
                          </div>
                        )}
                      </section>
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
                              src="/march19-platform-logo.png"
                              alt="March 19 Platform logo"
                              className="h-10 w-10 rounded-full border border-border bg-white p-1"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {story.sourceName}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="aspect-square p-5">
                          <div className="flex h-full flex-col gap-4">
                            <div className="min-h-0 flex-[0_0_54%] overflow-hidden rounded-[22px] border border-border bg-[#efe3d2]">
                              <div className="relative h-full">
                                <SafeStoryImage
                                  src={story.imageUrl}
                                  alt={story.editorialTitleEN || "Editorial story image"}
                                  className="h-full w-full object-contain"
                                />
                                <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                                  {getVisualSourceLabel(story)}
                                </span>
                              </div>
                            </div>
                            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
                              <h4 className="text-2xl font-semibold tracking-tight text-foreground">
                                {story.editorialTitleEN || "Needs Review"}
                              </h4>
                              <p className="line-clamp-5 text-base leading-7 text-foreground/85">
                                {story.editorialSummaryEN ||
                                  "This story is awaiting approved English editorial output."}
                              </p>
                              <div className="pt-1 text-xs uppercase tracking-[0.18em] text-muted">
                                {formatVisualDate(story.publishedAt)}
                              </div>
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
                          `${getSafeExportFilename(story.id) || "story"}-instagram-post.png`,
                        )
                      }
                      disabled={downloadStatus === "loading"}
                      className="rounded-full border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-[#efe6d9] disabled:cursor-wait disabled:opacity-70"
                    >
                      {downloadStatus === "loading" ? "Downloading..." : "Download This Post"}
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
