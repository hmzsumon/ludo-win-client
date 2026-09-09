"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FunEngine, type FunRecord } from "./funEngine";
import { EMPTY_AVIATOR_GAME, type AviatorBetTab } from "./types";
import AviatorHeader from "./sections/AviatorHeader";
import AviatorNoticeProvider from "./sections/AviatorNotice";
import BetPanel from "./sections/BetPanel";
import BetsTable from "./sections/BetsTable";
import FlightFrame from "./sections/FlightFrame";
import RoundHistory from "./sections/RoundHistory";
import AviatorMenu from "./menu/AviatorMenu";

const STORAGE_KEY = "ludowin:aviator:fun:v1";
const noop = () => {};

export default function FunAviator() {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const engine = useRef<FunEngine | null>(null);
  const [game, setGame] = useState(EMPTY_AVIATOR_GAME);
  const [balance, setBalance] = useState(50000);
  const [records, setRecords] = useState<FunRecord[]>([]);
  const [tab, setTab] = useState<AviatorBetTab>("All Bets");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  useEffect(() => {
    let saved;
    let lastState = "";
    let lastSave = "";
    const ready = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.source === "AVIATOR_COCOS") lastState = "";
    };
    window.addEventListener("message", ready);
    try { saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null"); } catch { setStorageUnavailable(true); }
    const demo = new FunEngine(() => {
      setGame({ ...demo.game });
      setBalance(demo.balance);
      setRecords(demo.records);
      const serialized = JSON.stringify(demo.save());
      if (serialized !== lastSave) {
        try { sessionStorage.setItem(STORAGE_KEY, serialized); lastSave = serialized; } catch { setStorageUnavailable(true); }
      }
      const send = (type: string, payload: unknown) => frameRef.current?.contentWindow?.postMessage({ source: "AVIATOR_NEXT", type, payload }, window.location.origin);
      const stateKey = `${demo.game.roundId}:${demo.game.phase}`;
      if (stateKey !== lastState) {
        send("ROUND_STATE", { ...demo.game, roundNumber: demo.game.roundId, bettingEndsAt: demo.game.startsAt });
        if (demo.game.phase === "CRASHED") send("ROUND_CRASHED", { roundId: demo.game.roundId, roundNumber: demo.game.roundId, crashPoint: demo.game.multiplier });
        lastState = stateKey;
      }
      send("ROUND_TICK", { multiplier: demo.game.multiplier });
      send("LIVE_BETS", demo.game.bets.map(b => ({ betId: b.id, userId: b.id, name: b.player, stake: b.amount, status: b.status === "PLACED" ? "PENDING" : b.status, cashoutMultiplier: b.cashoutMultiplier, payout: b.payout, avatarUrl: "/ludo/avatar/default.png" })));
    }, saved);
    engine.current = demo;
    demo.tick();
    const timer = window.setInterval(() => demo.tick(), 100);
    return () => { window.clearInterval(timer); window.removeEventListener("message", ready); engine.current = null; };
  }, []);
  const rows = tab === "Previous" ? records[0]?.bets || [] : tab === "Top" ? [...records.flatMap(r => r.bets), ...game.bets].filter(b => b.status === "CASHED_OUT").sort((a, b) => b.payout - a.payout).slice(0, 100) : game.bets;
  return (
    <main className="fixed inset-0 z-[2147483647] overflow-y-auto bg-[#0b0c0d] font-sans text-[#ddd]">
      <AviatorNoticeProvider>
        <AviatorHeader balance={balance} funMode onClose={() => router.push("/dashboard")}
          menu={<AviatorMenu frameRef={frameRef} game={game} name="Demo User" demoBets={records.flatMap(round => round.bets.filter(bet => !bet.isBot).map(bet => ({ _id: bet.id, createdAt: round.time, amount: bet.amount, payout: bet.payout, status: bet.status, cashoutMultiplier: bet.cashoutMultiplier, crashPoint: round.crashPoint })))} />} />
        <RoundHistory history={records.filter(r => r.crashPoint > 0).map(r => r.crashPoint)} />
        <div className="mx-2 rounded-t-[24px] border border-amber-400 bg-[#b77800] py-1 text-center text-xl font-bold text-white">FUN MODE</div>
        <p className="px-3 py-1 text-center text-xs text-amber-300">Demo User · Fun balance only · No real money or withdrawals</p>
        <FlightFrame frameRef={frameRef} />
        {([1, 2] as const).map(slot => <BetPanel key={slot} slot={slot} game={game} socket={engine.current} balance={balance} refresh={noop} />)}
        <BetsTable rows={rows} tab={tab} onTabChange={setTab} />
        <section className="m-2 rounded-2xl bg-[#1b1c1e] p-3">
          <h2 className="font-bold">My Fun History</h2>
          <p className="mb-2 text-xs text-[#aaa]">Last 100 demo rounds in this browser tab. Pending bets are refunded when you leave.</p>
          {storageUnavailable && <p className="text-xs text-amber-300">Browser storage unavailable. History will last until this page closes.</p>}
          {!records.some(r => r.bets.some(b => !b.isBot)) && <p className="py-3 text-sm text-[#aaa]">Your completed demo bets will appear here.</p>}
          <div className="max-h-80 overflow-y-auto">
            {records.map(r => r.bets.filter(b => !b.isBot).map(b => <div key={b.id} className="border-b border-white/10 py-2 text-xs">
              <div className="flex justify-between"><span>{new Date(r.time).toLocaleString()} · Slot {b.slot}</span><span>{b.status}</span></div>
              <div className="mt-1 text-[#aaa]">Bet {b.amount.toFixed(2)} · Win {b.payout.toFixed(2)} Fun BDT · {b.cashoutMultiplier ? `Cash out ${b.cashoutMultiplier.toFixed(2)}x` : b.status === "CANCELLED" ? "Stake refunded" : `Crash ${r.crashPoint.toFixed(2)}x`}</div>
              <div className="text-[10px] text-[#777]">{r.roundId}</div>
            </div>))}
          </div>
        </section>
      </AviatorNoticeProvider>
    </main>
  );
}
