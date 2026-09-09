"use client";

import type { AviatorBet, AviatorBetTab } from "../types";

/* ────────── All bets / previous / top table ────────── */
export default function BetsTable({
  rows,
  tab,
  onTabChange,
}: {
  rows: AviatorBet[];
  tab: AviatorBetTab;
  onTabChange: (tab: AviatorBetTab) => void;
}) {
  /* ────────── প্রতিটি নতুন bet/win-এর পূর্ণ amount এক ধাপে যোগ হয় ────────── */
  const totalBet = rows.reduce((sum, bet) => sum + Number(bet.amount || 0), 0);
  const totalWin = rows.reduce((sum, bet) => sum + Number(bet.payout || 0), 0);
  return (
    <section className="mx-1.5 my-1.5 rounded-[20px] bg-[#1b1c1e] p-2.5">
      <div className="grid h-6 grid-cols-3 rounded-full bg-[#121315]">
        {(["All Bets", "Previous", "Top"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onTabChange(value)}
            className={`rounded-full text-xs ${tab === value ? "bg-[#303136] text-white" : "text-[#aaa]"}`}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between p-3 text-xs">
        <span><b className="font-medium">{totalBet.toFixed(2)} BDT</b><small className="block text-[9px] text-[#777]">{rows.length} total bets</small></span>
        <strong className="text-right text-[21px]">
          {totalWin.toFixed(2)}
          <small className="block text-[10px] font-normal text-[#777]">
            Total win BDT
          </small>
        </strong>
      </div>
      <div className="max-h-[340px] overflow-auto">
        <div className="grid grid-cols-[1.35fr_1fr_.65fr_1fr] gap-2 px-3 py-1 text-[10px] text-[#777]"><span>Player</span><span className="text-right">Bet BDT</span><span className="text-right">X</span><span className="text-right">Win BDT</span></div>
        {rows.map((bet) => (
          <div
            key={bet.id}
            className={`my-1 grid grid-cols-[1.35fr_1fr_.65fr_1fr] items-center gap-2 rounded-full p-2 text-xs ${bet.status === "CASHED_OUT" ? "bg-[#1c3b0d]" : "bg-[#111214]"}`}
          >
            <span className="flex min-w-0 items-center gap-1.5"><img src={bet.avatarUrl || "/ludo/avatar/default.png"} alt="" className="h-7 w-7 shrink-0 rounded-full object-cover" onError={(event) => { event.currentTarget.src = "/ludo/avatar/default.png"; }} /><span className="truncate">{bet.player.replace(/\s·\sBOT$/, "")}</span>{bet.isBot && <span className="shrink-0 rounded bg-amber-500/20 px-1 py-0.5 text-[8px] font-bold text-amber-400">BOT</span>}</span>
            <span className="text-right">{bet.amount.toFixed(2)}</span>
            <span className="text-right">
              {bet.cashoutMultiplier
                ? `${bet.cashoutMultiplier.toFixed(2)}x`
                : ""}
            </span>
            <span className="text-right">
              {bet.payout ? bet.payout.toFixed(2) : ""}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
