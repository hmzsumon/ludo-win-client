export const getDeviceFingerprint = (): string => {
  if (typeof window === "undefined") return "server";

  const nav = window.navigator;
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";

  return [
    nav.userAgent,
    nav.platform,
    nav.language,
    timezone,
    screenInfo,
    nav.hardwareConcurrency || 0,
    nav.maxTouchPoints || 0,
  ].join("|");
};
