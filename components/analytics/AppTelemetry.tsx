"use client";

import { useEffect } from "react";

type AppContext = {
  installationId: string;
  source: "android-twa" | "legacy-standalone" | "pwa";
  packageName: string;
  appVersion: string;
  versionCode: number;
  deviceManufacturer: string;
  deviceModel: string;
  androidVersion: string;
  androidSdk: number;
};

const CONTEXT_KEY = "ludowin_app_context_v1";
const INSTALLATION_KEY = "ludowin_app_installation_id_v1";
const SESSION_OPEN_KEY = "ludowin_app_open_recorded_v1";
const HEARTBEAT_INTERVAL_MS = 60_000;

const newOpaqueId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return `legacy_${Date.now()}_${Math.random().toString(36).slice(2, 18)}`;
  }
};

const clean = (value: string | null, max = 150) =>
  value?.trim().slice(0, max) || "";

const number = (value: string | null, max = 1_000_000) => {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.min(max, Math.max(0, Math.round(parsed)))
    : 0;
};

const readStoredContext = (): AppContext | null => {
  try {
    const value = JSON.parse(localStorage.getItem(CONTEXT_KEY) || "null");
    return value?.installationId ? (value as AppContext) : null;
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

const stripNativeParameters = (params: URLSearchParams) => {
  const keys = [
    "src",
    "app_installation_id",
    "app_version",
    "app_version_code",
    "app_package",
    "device_manufacturer",
    "device_model",
    "android_version",
    "android_sdk",
  ];
  if (!keys.some((key) => params.has(key))) return;

  keys.forEach((key) => params.delete(key));
  const query = params.toString();
  const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", cleanUrl);
};

const resolveAppContext = (): AppContext | null => {
  const params = new URLSearchParams(window.location.search);
  const nativeId = clean(params.get("app_installation_id"), 128);
  const isNativeLaunch = params.get("src") === "twa";
  const standalone = isStandaloneMode();

  // Normal browser tab কখনো app heartbeat পাঠাবে না।
  if (!isNativeLaunch && !standalone) return null;

  const stored = readStoredContext();
  let installationId = nativeId || stored?.installationId || "";
  if (!installationId) {
    installationId = localStorage.getItem(INSTALLATION_KEY) || newOpaqueId();
  }

  localStorage.setItem(INSTALLATION_KEY, installationId);

  const source: AppContext["source"] = isNativeLaunch
    ? "android-twa"
    : /Android/i.test(navigator.userAgent)
      ? "legacy-standalone"
      : "pwa";

  const context: AppContext = {
    installationId,
    source,
    packageName:
      clean(params.get("app_package"), 150) ||
      stored?.packageName ||
      "app.vercel.ludowinapp.twa",
    appVersion:
      clean(params.get("app_version"), 40) ||
      stored?.appVersion ||
      (source === "android-twa" ? "3" : "legacy"),
    versionCode:
      number(params.get("app_version_code")) || stored?.versionCode || 0,
    deviceManufacturer:
      clean(params.get("device_manufacturer"), 100) ||
      stored?.deviceManufacturer ||
      "",
    deviceModel:
      clean(params.get("device_model"), 150) || stored?.deviceModel || "",
    androidVersion:
      clean(params.get("android_version"), 50) ||
      stored?.androidVersion ||
      "",
    androidSdk:
      number(params.get("android_sdk"), 100) || stored?.androidSdk || 0,
  };

  localStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  stripNativeParameters(params);
  return context;
};

const buildPayload = (context: AppContext) => ({
  ...context,
  screenWidth: window.screen?.width || 0,
  screenHeight: window.screen?.height || 0,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
});

const sendTelemetry = (
  endpoint: "open" | "heartbeat",
  context: AppContext,
) =>
  fetch(`/api/v1/app-analytics/${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify(buildPayload(context)),
  }).catch(() => undefined);

export default function AppTelemetry() {
  useEffect(() => {
    const context = resolveAppContext();
    if (!context) return;

    if (!sessionStorage.getItem(SESSION_OPEN_KEY)) {
      sessionStorage.setItem(SESSION_OPEN_KEY, "1");
      void sendTelemetry("open", context);
    }

    const heartbeat = () => {
      if (document.visibilityState === "visible") {
        void sendTelemetry("heartbeat", context);
      }
    };

    const onVisibilityChange = () => heartbeat();
    const interval = window.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
