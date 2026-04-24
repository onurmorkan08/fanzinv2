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
    return "Tarih yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
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
          Başlık
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
          Kısa Başlık
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
          Özet
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
          Haber Metni
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
          Görsel URL
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
              alt={story.visualHeadlineEN || "Haber görseli"}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <StoryBadge>{story.sourceName}</StoryBadge>
              {story.publishable ? (
                <StoryBadge tone="success">Hazır</StoryBadge>
              ) : (
                <StoryBadge tone="warning">İnceleme Gerekli</StoryBadge>
              )}
              {story.imageStatus === "fallback" ? (
                <StoryBadge tone="muted">Yedek Görsel</StoryBadge>
              ) : null}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                {story.visualHeadlineEN || "İNCELEME BEKLİYOR"}
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {story.editorialTitleEN || "İnceleme Gerekli"}
              </h2>
              <p className="text-sm leading-6 text-foreground/85">
                {story.editorialSummaryEN || "Bu haber için görünür özet üretilemedi."}
              </p>
              <p className="text-sm leading-6 text-muted">
                {story.editorialContextEN || "Bu haber iç inceleme kuyruğunda tutuluyor."}
              </p>
            </div>
            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-xs text-muted">
                <p>{formatPublishedAt(story.publishedAt)}</p>
                <p>Görsel durumu: {formatImageStatus(story.imageStatus)}</p>
                <a
                  href={story.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-4"
                >
                  Kaynak linki
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
      setDownloadMessage("İndirilecek görsel bulunamadı.");
      return;
    }

    setDownloadStatus("loading");
    setDownloadMessage("PNG hazırlanıyor...");

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
      setDownloadMessage(`${filename} indirildi.`);
    } catch (error) {
      setDownloadStatus("error");
      setDownloadMessage(
        error instanceof Error ? error.message : "Görsel dışa aktarımı başarısız oldu.",
      );
    }
  }

  async function loadCandidates() {
    setCandidatesStatus("loading");
    setCandidatesMessage("Kaynak haberler çekiliyor...");

    try {
      const response = await fetch("/api/articles/candidates", {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        stories?: FinalStory[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Otomatik kaynak çekimi başarısız oldu.");
      }

      setCandidateStories(payload.stories ?? []);
      setCandidatesStatus("success");
      setCandidatesMessage(
        payload.stories && payload.stories.length > 0
          ? `${payload.stories.length} aday haber yüklendi.`
          : "Kaynak listesinden haber çıkarılamadı.",
      );
    } catch (error) {
      setCandidatesStatus("error");
      setCandidatesMessage(
        error instanceof Error ? error.message : "Otomatik kaynak çekimi başarısız oldu.",
      );
    }
  }

  useEffect(() => {
    void loadCandidates();
  }, []);

  async function handleAddManualLink() {
    if (!manualLink.trim()) {
      setManualStatus("error");
      setManualMessage("Önce bir haber linki yapıştır.");
      return;
    }

    setManualStatus("loading");
    setManualMessage("Manuel link işleniyor...");

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
        throw new Error(payload.error || "Manuel haber çıkarımı başarısız oldu.");
      }

      setCandidateStories((stories) => addOrUpdateStoryById(stories, payload.story!));
      setSelectedStories((stories) => addOrUpdateStoryById(stories, payload.story!));
      setManualStatus("success");
      setManualMessage(
        payload.story.publishable
          ? "Manuel haber eklendi ve seçildi."
          : "Manuel haber inceleme için eklendi ve seçildi.",
      );
      setPreviewMessage("Kolaj ve tekil görseller seçilen haberlere göre güncellendi.");
      setManualLink("");
    } catch (error) {
      setManualStatus("error");
      setManualMessage(
        error instanceof Error ? error.message : "Manuel haber çıkarımı başarısız oldu.",
      );
    }
  }

  function addSelectedStory(story: FinalStory) {
    setSelectedStories((stories) => addOrUpdateStoryById(stories, story));
    setPreviewMessage("Kolaj ve tekil görseller seçilen haberlere göre güncellendi.");
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

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="rounded-[32px] border border-border bg-panel-strong px-6 py-8 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:px-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              Editoryal İç Panel
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              March 19 Platform Fanzin Paneli
            </h1>
            <p className="text-sm leading-7 text-muted sm:text-base">
              Politik açıdan ilgili Türkçe haberleri toplayan, görünür özet alanlarını
              düzenlenebilir tutan ve seçilen haberlerden görsel çıktı hazırlayan iç araç.
            </p>
          </div>
        </header>

        <section className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
            <label className="flex-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Manuel link girişi
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
              <span className="font-medium text-foreground">{candidatesMessage || "Boşta"}</span>
            </p>
            <p>
              Manuel link:{" "}
              <span className="font-medium text-foreground">{manualMessage || "Boşta"}</span>
            </p>
            <p>
              Önizleme:{" "}
              <span className="font-medium text-foreground">{previewMessage || "Boşta"}</span>
            </p>
            <p>
              İndirme:{" "}
              <span className="font-medium text-foreground">{downloadMessage || "Boşta"}</span>
            </p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Aday Haberler</h2>
                <p className="text-sm text-muted">
                  Nihai hikâye alanları üzerinden düzenlenebilir aday haber listesi.
                </p>
              </div>
              <StoryBadge tone="muted">{candidateStories.length} haber</StoryBadge>
            </div>
            <div className="flex flex-col gap-4">
              {candidateStories.length > 0 ? (
                candidateStories.map((story) => (
                  <StoryRow
                    key={story.id}
                    story={story}
                    actionLabel="Seç"
                    onAction={addSelectedStory}
                    onFieldChange={updateStoryFields}
                  />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
                  {candidatesStatus === "loading"
                    ? "Kaynak haberler çekiliyor."
                    : "Henüz aday haber yok."}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[32px] border border-border bg-panel-strong p-5 shadow-[0_12px_40px_rgba(72,50,33,0.06)] sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Seçilen Haberler</h2>
                <p className="text-sm text-muted">
                  Kolaj ve tekil haber görsellerinde kullanılacak düzenlenebilir seçki.
                </p>
              </div>
              <StoryBadge tone="muted">{selectedStories.length} seçili</StoryBadge>
            </div>
            <div className="flex flex-col gap-4">
              {selectedStories.length > 0 ? (
                selectedStories.map((story) => (
                  <StoryRow
                    key={story.id}
                    story={story}
                    actionLabel="Kaldır"
                    onAction={removeSelectedStory}
                    onFieldChange={updateStoryFields}
                  />
                ))
              ) : (
                <div className="rounded-[28px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
                  Henüz seçili haber yok. Aday haberlerden seçtikçe kolaj ve tekil çıktılar oluşur.
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
                Seçili haberlerden otomatik oluşan ana sayfa kolajı ve tekil haber görselleri.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                void downloadNodeAsPng(collageRef.current, "fanzin-ana-sayfa-kolaj.png")
              }
              disabled={downloadStatus === "loading" || collageFeed.length === 0}
              className="rounded-full border border-accent bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#741712] disabled:cursor-wait disabled:opacity-70"
            >
              {downloadStatus === "loading" ? "İndiriliyor..." : "Kolajı İndir"}
            </button>
          </div>

          {collageFeed.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-border bg-panel p-8 text-sm text-muted">
              Seçilen haberler geldiğinde kolaj burada oluşur.
            </div>
          ) : (
            <div className="space-y-6">
              <div ref={collageRef}>
                <article className="overflow-hidden rounded-[34px] border border-border bg-[#5b1816] shadow-[0_18px_44px_rgba(72,50,33,0.18)]">
                  <div className="border-b border-black/15 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src="/march19-platform-logo.svg"
                          alt="March 19 Platform logosu"
                          className="h-16 w-16 rounded-full bg-white p-1 shadow-sm"
                        />
                        <div>
                          <p className="text-lg font-semibold tracking-tight text-white">
                            March 19 Platform
                          </p>
                          <p className="text-sm text-white/80">
                            Seçili haber kolajı
                          </p>
                        </div>
                      </div>
                      <StoryBadge tone="muted">{collageFeed.length} haber</StoryBadge>
                    </div>
                  </div>

                  <div className="grid gap-0 xl:grid-cols-[1.55fr_1fr]">
                    <section className="relative min-h-[580px] overflow-hidden border-b border-black/20 xl:border-r xl:border-b-0">
                      <SafeStoryImage
                        src={heroStory?.imageUrl || ""}
                        alt={heroStory?.editorialTitleEN || "Haber görseli"}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.96)] via-[rgba(0,0,0,0.42)] to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 space-y-4 p-8 text-white sm:p-10">
                        <div className="flex items-center gap-3">
                          <img
                            src="/march19-platform-logo.svg"
                            alt="March 19 Platform logosu"
                            className="h-12 w-12 rounded-full border border-white/30 bg-white p-1"
                          />
                          <span className={storyStatusClasses(Boolean(heroStory?.publishable))}>
                            {heroStory?.publishable ? "Hazır" : "İnceleme Gerekli"}
                          </span>
                        </div>
                        <h3 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl">
                          {heroStory?.editorialTitleEN || "İnceleme Gerekli"}
                        </h3>
                        <p className="max-w-2xl text-sm leading-6 text-white/88 sm:text-base">
                          {heroStory?.editorialSummaryEN || "Bu haber için görünür özet üretilemedi."}
                        </p>
                        <p className="max-w-2xl text-sm leading-6 text-white/72">
                          {heroStory?.editorialContextEN || "Bu haber iç inceleme kuyruğunda tutuluyor."}
                        </p>
                      </div>
                    </section>

                    <section className="flex flex-col gap-4 bg-[#f7efe4] p-5 sm:p-6">
                      {collageStories.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {collageStories.map((story) => (
                            <article
                              key={story.id}
                              className="overflow-hidden rounded-[22px] border border-[#d8c9b6] bg-[#fff9f1]"
                            >
                              <div className="grid grid-cols-[104px_1fr]">
                                <div className="min-h-[136px] border-r border-[#d8c9b6]">
                                  <SafeStoryImage
                                    src={story.imageUrl}
                                    alt={story.editorialTitleEN || "Haber görseli"}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="space-y-2 p-3">
                                  <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                                    {story.editorialTitleEN || "İnceleme Gerekli"}
                                  </h4>
                                  <p className="line-clamp-3 text-xs leading-5 text-muted">
                                    {story.editorialSummaryEN || "Bu haber için görünür özet üretilemedi."}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                                      {story.sourceName}
                                    </span>
                                    <span className={storyStatusClasses(story.publishable)}>
                                      {story.publishable ? "Hazır" : "İnceleme Gerekli"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-[24px] border border-[#d8c9b6] bg-[#fff9f1] p-5 text-sm text-muted">
                          Tek haber seçildiğinde kolaj bu ana görsel üzerinden tekli kapak olarak kalır.
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="border-t border-black/15 bg-[#6a1d19] p-5">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {collageFeed.map((story) => (
                        <article
                          key={`${story.id}-front-page`}
                          className="overflow-hidden rounded-[24px] border border-white/15 bg-[#fff7eb]"
                        >
                          <div className="grid grid-cols-[124px_1fr]">
                            <div className="min-h-[136px] border-r border-[#d8c9b6] bg-[#eaddcb]">
                              <SafeStoryImage
                                src={story.imageUrl}
                                alt={story.editorialTitleEN || "Haber görseli"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="space-y-2 p-4">
                              <h5 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
                                {story.editorialTitleEN || "İnceleme Gerekli"}
                              </h5>
                              <p className="line-clamp-3 text-xs leading-5 text-muted">
                                {story.editorialSummaryEN || "Bu haber için görünür özet üretilemedi."}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                                  {story.sourceName}
                                </span>
                                <span className={storyStatusClasses(story.publishable)}>
                                  {story.publishable ? "Hazır" : "İnceleme Gerekli"}
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
                              alt="March 19 Platform logosu"
                              className="h-10 w-10 rounded-full border border-border bg-white p-1"
                            />
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">{story.sourceName}</span>
                              <span className={storyStatusClasses(story.publishable)}>
                                {story.publishable ? "Hazır" : "İnceleme Gerekli"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="overflow-hidden rounded-[22px] border border-border bg-panel">
                            <div className="relative aspect-[16/9]">
                              <SafeStoryImage
                                src={story.imageUrl}
                                alt={story.editorialTitleEN || "Haber görseli"}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="mt-5 space-y-3">
                            <h4 className="text-2xl font-semibold tracking-tight text-foreground">
                              {story.editorialTitleEN || "İnceleme Gerekli"}
                            </h4>
                            <p className="text-base leading-7 text-foreground/85">
                              {story.editorialSummaryEN || "Bu haber için görünür özet üretilemedi."}
                            </p>
                            <div className="rounded-[22px] border border-border bg-panel p-4">
                              <p className="text-sm leading-6 text-muted">
                                {story.editorialContextEN || "Bu haber iç inceleme kuyruğunda tutuluyor."}
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
                          `${story.id}-haber-gorseli.png`,
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
