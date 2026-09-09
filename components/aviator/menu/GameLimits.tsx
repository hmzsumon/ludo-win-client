import type { AviatorSnapshot } from "../types";

// Limits reflect the accepted round settings, rather than reference-site values.
export default function GameLimits({ game }: { game: AviatorSnapshot }) {
  const values = [
    ["Minimum bet BDT", game.roundId ? game.minBet : undefined],
    ["Maximum bet BDT", game.roundId ? game.maxBet : undefined],
    ["Maximum win for one bet BDT", game.roundId && game.maxMultiplier ? game.maxBet * game.maxMultiplier : undefined],
  ] as const;
  return <div className="p-4 py-7"><dl className="overflow-hidden rounded-xl border border-[#363636]">
    {values.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-2 border-b border-[#363636] px-2 py-2 last:border-0"><dt className="max-w-[60%] text-sm leading-tight">{label}:</dt><dd className="shrink-0 rounded-full border border-[#4c7c14] bg-[#153500] px-2 py-0.5 text-sm tabular-nums">{value === undefined ? "Unavailable" : value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div>)}
  </dl><p className="mt-3 text-xs text-[#999]">Limits apply to each bet. Maximum win includes the stake.</p></div>;
}
