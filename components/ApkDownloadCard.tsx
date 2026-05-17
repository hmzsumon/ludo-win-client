"use client";

import { useEffect, useMemo, useState } from "react";
import { FaAndroid, FaDownload, FaExternalLinkAlt } from "react-icons/fa";

type Props = {
  apkUrl?: string;
  appName?: string;
  packageName?: string;
  storageKey?: string;
  host?: string;
  twaQueryKey?: string;
  twaQueryValue?: string;
};

export default function ApkDownloadCard({
  apkUrl = "/apk/ludo_party.apk",
  appName = "Ludo Party",
  packageName = "com.ludoparty.app",
  storageKey,
  host = "www.ludoparty.live",
  twaQueryKey = "src",
  twaQueryValue = "twa",
}: Props) {
  const key = useMemo(
    () => storageKey ?? `apk_installed_${packageName || "ludo_party"}`,
    [storageKey, packageName],
  );

  const [hidden, setHidden] = useState(true);
  const [checking, setChecking] = useState(false);

  const hideCard = () => {
    try {
      localStorage.setItem(key, "1");
    } catch {}
    setHidden(true);
  };

  useEffect(() => {
    const isAppMode = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get(twaQueryKey) === twaQueryValue) return true;
      } catch {}

      try {
        return ["standalone", "fullscreen", "minimal-ui"].some(
          (mode) => window.matchMedia(`(display-mode: ${mode})`).matches,
        );
      } catch {
        return false;
      }
    };

    if (isAppMode()) {
      hideCard();
      return;
    }

    setHidden(false);
  }, [key, twaQueryKey, twaQueryValue]);

  const tryOpenApp = () => {
    if (!packageName) return;

    setChecking(true);
    const start = Date.now();

    const onVisibilityChange = () => {
      if (document.hidden && Date.now() - start < 1800) hideCard();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.location.href = `intent://${host}/#Intent;scheme=https;package=${packageName};end`;

    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      setChecking(false);
    }, 2200);
  };

  if (hidden) return null;

  return (
    <div className="mt-4 w-full">
      <div className="rounded-2xl bg-gradient-to-r from-fuchsia-400/80 via-purple-400/70 to-yellow-300/80 p-[1px] shadow-lg">
        <div className="brand-panel rounded-2xl px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-yellow-300 ring-1 ring-white/15">
              <FaAndroid className="text-xl" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200/90">
                Android App
              </p>
              <h3 className="truncate text-sm font-black leading-tight text-white">
                Download {appName}
              </h3>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={apkUrl}
              download="ludo_party.apk"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 to-fuchsia-300 px-3 py-2 text-xs font-black text-[#2b0737] shadow-md transition hover:scale-[1.01] active:scale-[0.98]"
            >
              <FaDownload />
              Download APK
            </a>

            {packageName ? (
              <button
                type="button"
                onClick={tryOpenApp}
                disabled={checking}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaExternalLinkAlt />
                {checking ? "Checking..." : "Open App"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
