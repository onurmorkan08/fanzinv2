function titleCaseHostname(hostname: string) {
  const baseName = hostname.replace(/^www\./, "").split(".").filter(Boolean)[0] ?? hostname;

  return baseName
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("en-US") + part.slice(1))
    .join(" ");
}

export function normalizeSourceName(url: string) {
  try {
    const hostname = new URL(url).hostname.toLocaleLowerCase("en-US");
    const normalizedHost = hostname.replace(/^www\./, "");

    if (normalizedHost === "turkishminute.com") {
      return "Turkish Minute";
    }

    if (normalizedHost === "t24.com.tr") {
      return "T24";
    }

    if (
      normalizedHost === "facebook.com" ||
      normalizedHost === "m.facebook.com" ||
      normalizedHost === "l.facebook.com"
    ) {
      return "Facebook";
    }

    if (normalizedHost === "x.com" || normalizedHost === "twitter.com") {
      return "X";
    }

    if (normalizedHost === "youtube.com" || normalizedHost === "youtu.be") {
      return "YouTube";
    }

    if (normalizedHost === "instagram.com") {
      return "Instagram";
    }

    return titleCaseHostname(normalizedHost);
  } catch {
    return "Unknown Source";
  }
}
