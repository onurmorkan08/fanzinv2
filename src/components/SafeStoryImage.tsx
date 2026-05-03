"use client";

import { useState } from "react";

import { FALLBACK_EDITORIAL_IMAGE } from "@/lib/articles/images";

function getSafeImageSrc(src: string) {
  const imageSrc = src || FALLBACK_EDITORIAL_IMAGE;

  if (/^https?:\/\//i.test(imageSrc)) {
    return `/api/images/proxy?url=${encodeURIComponent(imageSrc)}`;
  }

  return imageSrc;
}

export function SafeStoryImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className: string;
}) {
  const safeSrc = getSafeImageSrc(src);
  const [failedSrc, setFailedSrc] = useState("");
  const imageSrc = failedSrc === safeSrc ? FALLBACK_EDITORIAL_IMAGE : safeSrc;

  return (
    <img
      src={imageSrc || FALLBACK_EDITORIAL_IMAGE}
      alt={alt || "Editorial story image"}
      className={className}
      onError={() => setFailedSrc(safeSrc)}
      crossOrigin="anonymous"
    />
  );
}
