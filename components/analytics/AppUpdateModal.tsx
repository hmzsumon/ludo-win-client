"use client";

import { getMarketingAttribution } from "@/utils/marketingAttribution";
import { Download, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type StoredAppContext = {
  source?: "android-twa" | "legacy-standalone" | "pwa";
  appVersion?: string;
  versionCode?: number;
};

type UpdateState = {
  currentVersionLabel: string;
  isOutdated: boolean;
};

const APP_CONTEXT_KEY = "ludowin_app_context_v1";
const DOWNLOAD_ID_KEY = "ludowin_apk_downloader_id_v1";
const LATEST_APP_VERSION = process.env.NEXT_PUBLIC_APK_VERSION || "3";
const APK_URL = process.env.NEXT_PUBLIC_APK_URL || "/apk/ludo-win.apk";

const newOpaqueId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `update_${Date.now()}_${Math.random().toString(36).slice(2, 18)}`;
  }
};

const readStoredContext = (): StoredAppContext | null => {
  try {
    return JSON.parse(
      localStorage.getItem(APP_CONTEXT_KEY) || "null",
    ) as StoredAppContext | null;
  } catch {
    return null;
  }
};

const isStandaloneMode = () => {
  try {
    return ["standalone", "fullscreen", "minimal-ui"].some((mode) =>
      window.matchMedia(`(display-mode: ${mode})`).matches,
    );
  } catch {
    return false;
  }
};

const versionParts = (value: string) =>
  value
    .trim()
    .split(".")
    .map((part) => Number.parseInt(part.replace(/\D.*$/, ""), 10) || 0);

const compareVersions = (current: string, latest: string) => {
  const currentParts = versionParts(current);
  const latestParts = versionParts(latest);
  const length = Math.max(currentParts.length, latestParts.length);

  for (let index = 0; index < length; index += 1) {
    const left = currentParts[index] || 0;
    const right = latestParts[index] || 0;
    if (left !== right) return left < right ? -1 : 1;
  }

  return 0;
};

const resolveUpdateState = (): UpdateState | null => {
  const params = new URLSearchParams(window.location.search);
  const isNativeLaunch = params.get("src") === "twa";
  const isStandalone = isStandaloneMode();
  const isAndroid = /Android/i.test(navigator.userAgent);

  // A normal browser tab must never receive the APK update prompt.
  if (!isAndroid || (!isNativeLaunch && !isStandalone)) return null;

  const stored = readStoredContext();
  const paramVersion = params.get("app_version")?.trim() || "";
  const paramVersionCode = Number(params.get("app_version_code")) || 0;
  const currentVersion = paramVersion || stored?.appVersion || "";
  const currentVersionCode = paramVersionCode || stored?.versionCode || 0;
  const latestVersionCode = Number(LATEST_APP_VERSION) || 0;

  if (currentVersionCode > 0 && latestVersionCode > 0) {
    return {
      currentVersionLabel: `Version ${currentVersionCode}`,
      isOutdated: currentVersionCode < latestVersionCode,
    };
  }

  if (currentVersion && currentVersion !== "legacy") {
    return {
      currentVersionLabel: `Version ${currentVersion}`,
      isOutdated: compareVersions(currentVersion, LATEST_APP_VERSION) < 0,
    };
  }

  // Version 2 did not send native version metadata. Android standalone mode is
  // therefore treated as the legacy APK and receives the update prompt.
  return {
    currentVersionLabel: "Older version",
    isOutdated: true,
  };
};

const recordUpdateDownload = () => {
  let downloaderId = "";
  try {
    downloaderId = localStorage.getItem(DOWNLOAD_ID_KEY) || newOpaqueId();
    localStorage.setItem(DOWNLOAD_ID_KEY, downloaderId);
  } catch {
    downloaderId = newOpaqueId();
  }

  const attribution = getMarketingAttribution();
  const payload = JSON.stringify({
    eventId: newOpaqueId(),
    downloaderId,
    fileName: "ludo-win.apk",
    targetAppVersion: LATEST_APP_VERSION,
    visitorId: attribution?.visitorId || "",
    sessionId: attribution?.sessionId || "",
    source: "app-update-modal",
    campaignId: attribution?.campaignId || "",
    campaignName: attribution?.campaignName || "",
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/v1/app-analytics/download",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
  } catch {}

  void fetch("/api/v1/app-analytics/download", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
};

export default function AppUpdateModal() {
  const [updateState, setUpdateState] = useState<UpdateState | null>(null);
  const [open, setOpen] = useState(false);

  const downloadUrl = useMemo(() => {
    const separator = APK_URL.includes("?") ? "&" : "?";
    return `${APK_URL}${separator}v=${encodeURIComponent(LATEST_APP_VERSION)}`;
  }, []);

  useEffect(() => {
    const state = resolveUpdateState();
    setUpdateState(state);
    setOpen(Boolean(state?.isOutdated));
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open || !updateState?.isOutdated) return null;

  return (
    <div
      className="lw-smart-overlay fixed inset-0 z-[100001] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-update-title"
      aria-describedby="app-update-description"
    >
      <div className="lw-smart-surface relative w-full max-w-[360px] overflow-hidden">
        <div className="border-b-2 border-[#ffcf3f] bg-[linear-gradient(180deg,#cf2786_0%,#8e145d_100%)] px-5 py-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#fff0a5]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            New version available
          </div>
          <h2
            id="app-update-title"
            className="mt-1 text-[22px] font-black uppercase tracking-[0.04em] text-white"
          >
            Update Ludo Win
          </h2>
        </div>

        <div className="px-5 pb-2 pt-5 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#ffe06a] bg-[radial-gradient(circle_at_35%_25%,#fff6a6_0%,#ffc928_42%,#ef7e00_100%)] shadow-[0_5px_0_#8a4a00,0_10px_24px_rgba(0,0,0,0.42)]">
            <RefreshCw
              className="h-10 w-10 text-[#4a124d] drop-shadow-sm"
              strokeWidth={3}
              aria-hidden="true"
            />
          </div>

          <p
            id="app-update-description"
            className="mx-auto mt-5 max-w-[290px] text-sm font-bold leading-6 text-[#fff7dc]"
          >
            Please update the app to get the latest improvements, better
            performance and full app support.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-wide">
            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-white/70">
              {updateState.currentVersionLabel}
            </span>
            <span className="text-[#ffe06a]" aria-hidden="true">
              →
            </span>
            <span className="rounded-full border border-[#ffe06a]/60 bg-[#ffc928]/15 px-3 py-1.5 text-[#ffe06a]">
              Version {LATEST_APP_VERSION}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-[11px] font-bold text-emerald-100">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            Your account and app data will remain safe
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-11 rounded-full border-2 border-white/80 bg-[linear-gradient(180deg,#55ef42_0%,#079c2c_100%)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.04em] text-white shadow-[0_4px_0_rgba(3,75,25,0.9),inset_0_1px_0_rgba(255,255,255,0.45)] transition active:translate-y-[3px] active:shadow-[0_1px_0_rgba(3,75,25,0.9)]"
          >
            Later
          </button>

          <a
            href={downloadUrl}
            download="ludo-win.apk"
            onClick={recordUpdateDownload}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-white/80 bg-[linear-gradient(180deg,#ff4a62_0%,#c51035_100%)] px-4 py-2.5 text-xs font-black uppercase tracking-[0.04em] text-white shadow-[0_4px_0_rgba(75,3,25,0.9),inset_0_1px_0_rgba(255,255,255,0.45)] transition active:translate-y-[3px] active:shadow-[0_1px_0_rgba(75,3,25,0.9)]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Update now
          </a>
        </div>
      </div>
    </div>
  );
}
