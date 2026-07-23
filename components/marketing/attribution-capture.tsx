"use client";

import { captureMarketingAttribution } from "@/utils/marketingAttribution";
import { useEffect } from "react";

export default function AttributionCapture() {
  useEffect(() => {
    const attribution = captureMarketingAttribution();
    if (!attribution.sessionId || !attribution.visitorId) return;

    const guardKey = `ludowin_arrival_${attribution.sessionId}`;
    if (window.sessionStorage.getItem(guardKey)) return;
    window.sessionStorage.setItem(guardKey, "1");

    void fetch("/api/v1/traffic/arrival", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        sessionId: attribution.sessionId,
        visitorId: attribution.visitorId,
        pagePath: `${window.location.pathname}${window.location.search}`,
      }),
    }).catch(() => {
      window.sessionStorage.removeItem(guardKey);
    });
  }, []);

  return null;
}
