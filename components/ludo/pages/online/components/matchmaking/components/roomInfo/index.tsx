"use client";

import Share from "@/components/ludo/share";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface RoomInfoProps {
  roomName: string;
  friendMatchType?: "free" | "wager";
  betAmount?: number;
}

/*
 * NEW ▸ Local SVG icons keep this one-file Tailwind UI isolated from legacy
 * global `.icon-wrapper` sizing. No CSS file is required or changed.
 */
const CopyIcon = () => (
  <svg
    aria-hidden="true"
    className="h-4 w-4 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);

const ShareIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.7 10.7 6.6-4.4M8.7 13.3l6.6 4.4" />
  </svg>
);

/* NEW ▸ Clipboard API with a browser-compatible local fallback. */
const copyText = async (value: string) => {
  if (!value) return false;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      /* Permission denied: continue with hidden textarea fallback. */
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
};

const RoomInfo = ({ roomName, friendMatchType, betAmount }: RoomInfoProps) => {
  const [shareUrl, setShareUrl] = useState("");
  const [copiedItem, setCopiedItem] = useState<"code" | "link" | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* NEW ▸ Generate a clean join URL after mount to avoid hydration mismatch. */
  useEffect(() => {
    const inviteUrl = new URL("/online", window.location.origin);
    inviteUrl.searchParams.set("room", roomName);

    if (new URLSearchParams(window.location.search).get("mode") === "master") {
      inviteUrl.searchParams.set("mode", "master");
    }

    setShareUrl(inviteUrl.toString());

    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, [roomName]);

  const copyValue = useCallback(
    async (type: "code" | "link", value: string) => {
      const copied = await copyText(value).catch(() => false);
      if (!copied) return;

      setCopiedItem(type);
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = setTimeout(() => {
        setCopiedItem(null);
        feedbackTimerRef.current = null;
      }, 1800);
    },
    [],
  );

  const dataShare: ShareData = {
    title: "Join my LudoWin room 🎲",
    text: `Let's play LudoWin together. Room code: ${roomName}`,
    url: shareUrl,
  };

  const baseSmallButton =
    "inline-flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-black uppercase shadow-md transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50";
  const normalSmallButton =
    "border-yellow-200 bg-gradient-to-b from-yellow-200 to-yellow-400 text-amber-900";
  const copiedSmallButton =
    "border-emerald-200 bg-gradient-to-b from-emerald-300 to-emerald-500 text-emerald-950";

  return (
    <section className="mx-auto my-6 w-[88%] max-w-[430px] overflow-hidden rounded-2xl border border-cyan-200/25 bg-gradient-to-br from-[#00407f]/95 to-[#001a3e]/95 text-white shadow-[0_18px_35px_rgba(0,20,54,0.38),0_3px_0_rgba(0,15,42,0.55)]">
      <header className="border-b border-cyan-100/15 bg-[#002f68]/80 px-4 py-3.5 text-center">
        <span className="block text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
          Private invitation
        </span>
        <h3 className="mt-1 text-lg font-black tracking-wide">Room Code</h3>
        {friendMatchType && (
          <p className="mt-1 text-xs font-medium text-white/75">
            {friendMatchType === "wager"
              ? `Wager · ${Number(betAmount || 0)} per player · Server verified`
              : "Free match · 2 players"}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-2.5 p-3.5 max-[360px]:p-3">
        {/* NEW ▸ Room code and its dedicated copy action. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="flex min-h-[62px] min-w-0 flex-col items-center justify-center rounded-xl border border-cyan-100/20 bg-[#011a3f]/85 px-2 py-1.5 shadow-inner">
            <span className="text-[9px] font-black tracking-[0.14em] text-cyan-300">
              ROOM CODE
            </span>
            <span className="mt-0.5 text-[27px] font-black leading-none tracking-[0.12em] text-white">
              {roomName}
            </span>
          </div>

          <button
            type="button"
            className={`${baseSmallButton} min-w-[102px] flex-col ${
              copiedItem === "code" ? copiedSmallButton : normalSmallButton
            }`}
            onClick={() => void copyValue("code", roomName)}
            aria-label="Copy room code"
          >
            <CopyIcon />
            <span>{copiedItem === "code" ? "Copied" : "Copy code"}</span>
          </button>
        </div>

        {/* NEW ▸ The URL stays hidden; only a Copy link action is shown. */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-cyan-100/15 bg-[#02204a]/75 p-2.5">
          <div className="min-w-0 pl-0.5">
            <span className="block text-sm font-extrabold">Invite link</span>
            <span className="mt-0.5 block truncate text-[10px] text-white/55">
              Copy the private join link
            </span>
          </div>

          <button
            type="button"
            className={`${baseSmallButton} min-w-[102px] ${
              copiedItem === "link" ? copiedSmallButton : normalSmallButton
            }`}
            onClick={() => void copyValue("link", shareUrl)}
            disabled={!shareUrl}
          >
            <CopyIcon />
            <span>{copiedItem === "link" ? "Copied" : "Copy link"}</span>
          </button>
        </div>

        {/* NEW ▸ Share is intentionally the final full-width action. */}
        <Share data={dataShare}>
          <button
            type="button"
            disabled={!shareUrl}
            className="inline-flex min-h-[49px] w-full items-center justify-center gap-2.5 rounded-xl border border-cyan-200 bg-gradient-to-b from-cyan-400 to-blue-600 px-4 py-2.5 text-sm font-black uppercase text-white shadow-[0_6px_12px_rgba(0,15,48,0.32),inset_0_-3px_0_rgba(0,48,128,0.34)] transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ShareIcon />
            <span>Share invitation</span>
          </button>
        </Share>
      </div>
    </section>
  );
};

export default React.memo(RoomInfo);
