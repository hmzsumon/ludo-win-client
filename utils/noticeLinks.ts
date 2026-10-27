/** Normalize notice actions without allowing executable URL schemes. */
export function getNoticeLink(value: unknown): string {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (!url || /[\\\u0000-\u0020]/.test(url)) return "";
  if (/^\/(?!\/)/.test(url)) return url;
  const candidate = /^https?:\/\//i.test(url)
    ? url
    : /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i.test(url)
      ? `https://${url}`
      : "";
  if (!candidate) return "";
  try {
    const parsed = new URL(candidate);
    return parsed.hostname && !parsed.username && !parsed.password ? candidate : "";
  } catch {
    return "";
  }
}

export function splitNoticeLinks(message: string): { text: string; href?: string }[] {
  const pattern = /(?<![\w@])(?:https?:\/\/|www\.)[^\s<>"']+/gi;
  const parts: { text: string; href?: string }[] = [];
  let cursor = 0;
  for (const match of Array.from(message.matchAll(pattern))) {
    const start = match.index!;
    let text = match[0].replace(/[.,!?;:।]+$/, "");
    while (text.endsWith(")") && (text.match(/\)/g)?.length ?? 0) > (text.match(/\(/g)?.length ?? 0)) text = text.slice(0, -1);
    text = text.replace(/[\]}]+$/, "");
    if (start > cursor) parts.push({ text: message.slice(cursor, start) });
    const href = getNoticeLink(text);
    parts.push({ text, ...(href ? { href } : {}) });
    cursor = start + text.length;
  }
  if (cursor < message.length) parts.push({ text: message.slice(cursor) });
  return parts;
}
