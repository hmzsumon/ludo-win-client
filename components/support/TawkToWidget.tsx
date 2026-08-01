"use client";

import { useEffect } from "react";
import { TAWK_OPEN_EVENT } from "./tawk-chat";

/*
 * NEW ▸ Public widget identifiers supplied by tawk.to.
 * Environment variables can override them without requiring a code change.
 */
const TAWK_PROPERTY_ID =
  process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "6a6e79ca74030a1d4226283f";
const TAWK_WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "1juvong0b";

export default function TawkToWidget() {
  useEffect(() => {
    const api = (window.Tawk_API = window.Tawk_API || {});
    window.Tawk_LoadStart = new Date();

    const hideDefaultBubble = () => {
      window.Tawk_API?.hideWidget?.();
    };

    const openChat = () => {
      const currentApi = window.Tawk_API;

      if (typeof currentApi?.maximize !== "function") {
        window.__LUDOWIN_TAWK_OPEN_PENDING__ = true;
        return;
      }

      window.__LUDOWIN_TAWK_OPEN_PENDING__ = false;
      currentApi.showWidget?.();
      currentApi.maximize();
    };

    /* NEW ▸ Keep tawk.to's own launcher hidden before and after loading. */
    api.onBeforeLoad = hideDefaultBubble;
    api.onLoad = () => {
      hideDefaultBubble();

      if (window.__LUDOWIN_TAWK_OPEN_PENDING__) {
        openChat();
      }
    };

    /* NEW ▸ Closing/minimizing chat must not restore the default bubble. */
    api.onChatMinimized = hideDefaultBubble;
    api.onChatEnded = hideDefaultBubble;

    window.addEventListener(TAWK_OPEN_EVENT, openChat);

    if (window.__LUDOWIN_TAWK_OPEN_PENDING__) {
      openChat();
    }

    /*
     * NEW ▸ Register all callbacks before inserting the vendor script.
     * This prevents the stock launcher from flashing on screen during load.
     */
    const scriptId = "tawk-support-widget";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");
      document.head.appendChild(script);
    }

    return () => {
      window.removeEventListener(TAWK_OPEN_EVENT, openChat);
    };
  }, []);

  return null;
}
