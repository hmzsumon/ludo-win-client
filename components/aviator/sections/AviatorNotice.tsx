"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

type NoticeVariant = "success" | "warning" | "error";
type NoticeInput = { variant: NoticeVariant; title: string; message?: string; label?: string; value?: string };
type NoticeState = NoticeInput & { id: number };
const NoticeContext = createContext<(notice: NoticeInput) => void>(() => undefined);

/* ────────── Reusable Aviator notice hook ────────── */
export const useAviatorNotice = () => useContext(NoticeContext);

/* ────────────────────────────────────────────────────────────────
   🔔 Aviator notice provider
   1) success / warning / error theme পরিচালনা করে
   2) cash-out result-এর label ও value দেখায়
   3) নির্দিষ্ট সময় পরে notice নিজে বন্ধ করে
──────────────────────────────────────────────────────────────── */
export default function AviatorNoticeProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const showNotice = useCallback((input: NoticeInput) => setNotice({ ...input, id: Date.now() }), []);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), notice.variant === "success" ? 3500 : 4500); return () => window.clearTimeout(timer); }, [notice]);
  const theme = notice?.variant === "success" ? "border-[#42c84b]/80 bg-[rgba(35,103,29,.68)]" : notice?.variant === "warning" ? "border-[#e6ad28]/80 bg-[rgba(109,75,12,.7)]" : "border-[#ef4b55]/80 bg-[rgba(112,20,27,.72)]";

  return <NoticeContext.Provider value={showNotice}>{children}{notice && <div role="status" aria-live="polite" className={`fixed left-3 right-3 top-2 z-50 mx-auto grid max-w-[620px] grid-cols-[1fr_auto] items-center overflow-hidden rounded-[22px] border py-1.5 pl-3 pr-10 text-white shadow-xl backdrop-blur-md ${theme}`}><div className="min-w-0 text-center"><div className="text-[11px] opacity-90">{notice.title}</div>{notice.message && <div className="text-[13px] font-bold">{notice.message}</div>}</div>{(notice.label || notice.value) && <div className="mx-2 min-w-[88px] rounded-[18px] bg-white/15 px-3 py-0.5 text-center backdrop-blur-sm"><div className="text-[10px] font-semibold">{notice.label}</div><div className="text-[15px] font-bold">{notice.value}</div></div>}<button type="button" aria-label="Close notice" onClick={() => setNotice(null)} className="absolute right-2 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"><X size={14} strokeWidth={2.5} /></button></div>}</NoticeContext.Provider>;
}
