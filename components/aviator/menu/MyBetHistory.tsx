"use client";

import { useEffect, useRef, useState } from "react";
import baseUrl from "@/config/baseUrl";
import type { PersonalBet } from "./types";

const money = (value: number) => value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Each click appends one server page. Cursor + ID deduplication prevents repeats.
export default function MyBetHistory({ demoBets }: { demoBets?: PersonalBet[] }) {
  const [bets, setBets] = useState<PersonalBet[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoCount, setDemoCount] = useState(10);
  const request = useRef<AbortController | null>(null);
  const load = async (next?: string) => {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError("");
    try {
      const response = await fetch(`${baseUrl}/aviator/my-bets?limit=10${next ? `&cursor=${encodeURIComponent(next)}` : ""}`, { credentials: "include", signal: controller.signal });
      if (!response.ok) throw new Error(response.status === 401 ? "Please sign in to see your bets." : "Could not load bet history. Please retry.");
      const body = await response.json();
      if (!body.success || !Array.isArray(body.bets)) throw new Error("Could not load bet history. Please retry.");
      setBets(current => Array.from(new Map([...current, ...body.bets].map(bet => [bet._id, bet])).values()));
      setCursor(body.nextCursor || null); setLoaded(true);
    } catch (cause) {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "History unavailable.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      if (request.current === controller) request.current = null;
    }
  };
  useEffect(() => {
    if (!demoBets) void load();
    return () => { request.current?.abort(); request.current = null; };
    // A newly opened history starts at the newest page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const rows = demoBets ? demoBets.slice(0, demoCount) : bets;
  const hasMore = demoBets ? demoCount < demoBets.length : Boolean(cursor);
  return <div className="px-2 py-3">
    {demoBets && <p className="mb-2 px-1 text-xs text-amber-300">Fun balance only · This browser tab</p>}
    <div className="grid grid-cols-[1fr_1fr_.8fr_1.15fr] gap-1 px-2 pb-2 text-[11px] text-[#888] sm:text-sm"><span>Date</span><span className="text-right">Bet BDT</span><span className="text-center">X</span><span className="text-right">Cash out BDT</span></div>
    <div className="space-y-1" aria-live="polite">
      {rows.map(bet => {
        const won = bet.status === "CASHED_OUT";
        const multiplier = won ? bet.cashoutMultiplier : bet.crashPoint;
        const date = new Date(bet.createdAt);
        return <div key={bet._id} className={`grid min-h-10 grid-cols-[1fr_1fr_.8fr_1.15fr] items-center gap-1 rounded-[8px] border px-2 py-1 text-xs tabular-nums sm:text-sm ${won ? "border-[#477c12] bg-[#153500] text-white" : "border-transparent bg-[#101113] text-[#8e8e92]"}`}>
          <time dateTime={bet.createdAt} className="text-[10px] leading-tight text-[#b8bbc1] sm:text-xs">{date.toLocaleTimeString("en-GB", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit" })}<br />{date.toLocaleDateString("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "2-digit", year: "2-digit" }).replaceAll("/", "-")}</time>
          <span className="text-right">{money(bet.amount)}</span>
          <span className="text-center">{multiplier ? <span className={`inline-block rounded-full bg-black/70 px-1.5 py-1 font-bold ${multiplier >= 10 ? "text-[#cf28a8]" : multiplier >= 2 ? "text-[#913ef8]" : "text-[#35b3ee]"}`}>{multiplier.toFixed(2)}x</span> : <span className="text-[9px]">{bet.status === "PLACED" ? "Pending" : bet.status === "CANCELLED" || bet.status === "REFUNDED" ? "Refunded" : "—"}</span>}</span>
          <span className="text-right">{won ? money(bet.payout) : "—"}</span>
        </div>;
      })}
    </div>
    {!rows.length && (loaded || demoBets) && !loading && <p className="py-8 text-center text-sm text-[#aaa]">No bets yet.</p>}
    {error && <p role="alert" className="px-2 pt-3 text-center text-sm text-red-300">{error}</p>}
    {(loading || hasMore || error) && <div className="pt-4 text-center"><button type="button" disabled={loading} onClick={() => demoBets ? setDemoCount(count => count + 10) : void load(cursor || undefined)} className="min-h-10 rounded-full border border-[#393a42] bg-[#25262a] px-6 text-sm text-[#b3b5bd] hover:bg-[#33343a] disabled:opacity-50">{loading ? "Loading…" : error ? "Retry" : "Load more"}</button></div>}
  </div>;
}
