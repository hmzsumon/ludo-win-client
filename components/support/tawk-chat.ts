/*
 * NEW ▸ One application-level event opens tawk.to from any custom button.
 * The pending flag also handles a click made before the third-party widget
 * finishes loading, so the first click is never lost.
 */
export const TAWK_OPEN_EVENT = "ludowin:open-support-chat";

export type SupportChatContext = {
  topic?: string;
  identifier?: string;
  channel?: string;
  message?: string;
};

type TawkCallback = (error?: unknown) => void;

export type TawkApi = {
  onBeforeLoad?: () => void;
  onLoad?: () => void;
  onChatMinimized?: () => void;
  onChatEnded?: () => void;
  hideWidget?: () => void;
  showWidget?: () => void;
  maximize?: () => void;
  setAttributes?: (
    attributes: Record<string, string>,
    callback?: TawkCallback,
  ) => void;
  addEvent?: (
    eventName: string,
    metadata?: Record<string, string>,
    callback?: TawkCallback,
  ) => void;
  addTags?: (tags: string[], callback?: TawkCallback) => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
    __LUDOWIN_TAWK_OPEN_PENDING__?: boolean;
    __LUDOWIN_TAWK_CONTEXT_PENDING__?: SupportChatContext;
  }
}

const cleanValue = (value?: string) =>
  String(value || "")
    .trim()
    .slice(0, 255);

const isSupportChatContext = (value: unknown): value is SupportChatContext => {
  if (!value || typeof value !== "object") return false;
  const context = value as Record<string, unknown>;
  return ["topic", "identifier", "channel", "message"].some(
    (key) => typeof context[key] === "string",
  );
};

export const applyPendingSupportContext = (api?: TawkApi): void => {
  if (typeof window === "undefined" || !api) return;
  const context = window.__LUDOWIN_TAWK_CONTEXT_PENDING__;
  if (!context) return;

  const identifier = cleanValue(context.identifier);
  const channel = cleanValue(context.channel);
  const topic = cleanValue(context.topic) || "support";
  const message = cleanValue(context.message) || "Support requested";
  const attributes: Record<string, string> = {
    "support-topic": topic,
    "support-message": message,
  };
  if (identifier) attributes["verification-destination"] = identifier;
  if (channel) attributes["verification-channel"] = channel;

  api.setAttributes?.(attributes, () => undefined);
  api.addTags?.(["verification-support"], () => undefined);
  api.addEvent?.(
    "verification-support-requested",
    {
      topic,
      message,
      ...(identifier ? { identifier } : {}),
      ...(channel ? { channel } : {}),
    },
    () => undefined,
  );
  window.__LUDOWIN_TAWK_CONTEXT_PENDING__ = undefined;
};

export const openSupportChat = (context?: unknown): void => {
  if (typeof window === "undefined") return;

  // React passes a click event to direct onClick handlers. Only a deliberate
  // support context object should be stored for tawk.to.
  if (isSupportChatContext(context)) {
    window.__LUDOWIN_TAWK_CONTEXT_PENDING__ = context;
  }

  const api = window.Tawk_API;

  if (typeof api?.maximize === "function") {
    window.__LUDOWIN_TAWK_OPEN_PENDING__ = false;
    applyPendingSupportContext(api);
    api.showWidget?.();
    api.maximize();
    return;
  }

  window.__LUDOWIN_TAWK_OPEN_PENDING__ = true;
  window.dispatchEvent(new Event(TAWK_OPEN_EVENT));
};

export {};
