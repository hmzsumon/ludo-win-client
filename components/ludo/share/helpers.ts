// components/ludo/share/helpers.ts
import swal from "sweetalert";

/** Web Share API supported? (SSR-safe) */
export const isWebShareSupported = (): boolean =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

/** Success toast (client-only call sites) */
export const successMessage = () => {
  // swal নিজে DOM দরকার, তাই শুধু client ইভেন্ট থেকে কল করবেন
  swal({
    title: "Thanks for sharing!",
    closeOnEsc: false,
    icon: "success",
    timer: 3000,
  });
};

/** Fallback: copy link (SSR-safe) */
export const copyLinkFallback = async (text: string) => {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  if (typeof document !== "undefined") {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand?.("copy");
    ta.remove();
    return true;
  }
  return false;
};

/** Try native share first, else fallback */
export const shareLink = async (data: ShareData) => {
  if (isWebShareSupported()) {
    try {
      await navigator.share(data);
      successMessage();
      return;
    } catch (err) {
      // user cancelled বা অন্য error হলে fallback দেখাবো
    }
  }
  // Fallback – copy URL/text
  const text = data.url || data.text || "";
  const ok = await copyLinkFallback(text);
  swal({
    title: ok ? "Link copied" : "Sharing failed :(",
    text: ok ? "Copied to clipboard." : "Try copying manually.",
    closeOnEsc: false,
    icon: ok ? "success" : "error",
    timer: ok ? 2500 : undefined,
  });
};
