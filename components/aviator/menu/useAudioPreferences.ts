"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { AudioPreferences } from "./types";

const KEY = "ludowin:aviator:audio:v1";

// Persist separate sound/music choices and re-send them whenever Cocos is ready.
export function useAudioPreferences(frameRef: RefObject<HTMLIFrameElement>) {
  const [preferences, setPreferences] = useState<AudioPreferences>({ sound: true, music: true });
  const latest = useRef(preferences);
  const send = useCallback((value: AudioPreferences) => {
    frameRef.current?.contentWindow?.postMessage({ source: "AVIATOR_NEXT", type: "AUDIO_SETTINGS", payload: value }, window.location.origin);
  }, [frameRef]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (typeof saved?.sound === "boolean" && typeof saved?.music === "boolean") {
        latest.current = saved;
        setPreferences(saved);
      }
    } catch { /* Private browsing can disable storage; switches still work. */ }
    const onReady = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.source === "AVIATOR_COCOS") send(latest.current);
    };
    window.addEventListener("message", onReady);
    send(latest.current);
    return () => window.removeEventListener("message", onReady);
  }, [frameRef, send]);
  const toggle = (key: keyof AudioPreferences) => {
    const next = { ...latest.current, [key]: !latest.current[key] };
    latest.current = next;
    setPreferences(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* Optional persistence. */ }
    send(next);
  };
  return { preferences, toggle };
}
