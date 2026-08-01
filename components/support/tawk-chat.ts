/*
 * NEW ▸ One application-level event opens tawk.to from any custom button.
 * The pending flag also handles a click made before the third-party widget
 * finishes loading, so the first click is never lost.
 */
export const TAWK_OPEN_EVENT = "ludowin:open-support-chat";

export type TawkApi = {
  onBeforeLoad?: () => void;
  onLoad?: () => void;
  onChatMinimized?: () => void;
  onChatEnded?: () => void;
  hideWidget?: () => void;
  showWidget?: () => void;
  maximize?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
    Tawk_LoadStart?: Date;
    __LUDOWIN_TAWK_OPEN_PENDING__?: boolean;
  }
}

export const openSupportChat = (): void => {
  if (typeof window === "undefined") return;

  const api = window.Tawk_API;

  if (typeof api?.maximize === "function") {
    window.__LUDOWIN_TAWK_OPEN_PENDING__ = false;
    api.showWidget?.();
    api.maximize();
    return;
  }

  window.__LUDOWIN_TAWK_OPEN_PENDING__ = true;
  window.dispatchEvent(new Event(TAWK_OPEN_EVENT));
};

export {};
