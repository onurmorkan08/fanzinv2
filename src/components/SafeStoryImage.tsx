"use client";

import { useEffect, useState } from "react";

import { FALLBACK_EDITORIAL_IMAGE } from "@/lib/articles/images";

export function SafeStoryImage({
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
