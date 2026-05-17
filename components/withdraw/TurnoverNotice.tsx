/* ── Component: TurnoverNotice ──────────────────────────────────────────── */
"use client";

const formatBDT = (n: number) =>
  `💎 ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export default function TurnoverNotice({
  remaining,
  required,
  onOk,
}: {
  remaining: number;
  required?: number; // ✅ wager_required (optional but recommended)
  onOk: () => void;
}) {
  if (remaining <= 0) return null;

  const req = Number(required ?? 0);
  const rem = Number(remaining ?? 0);

  // If required is 0 but remaining > 0, we still show progress safely
  const effectiveRequired = req > 0 ? req : rem;
  const completed = clamp(effectiveRequired - rem, 0, effectiveRequired);
  const pct = effectiveRequired > 0 ? (completed / effectiveRequired) * 100 : 0;

  return (
    <div className="mt-6 rounded-2xl border border-[#00493B] bg-[#031A15] p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-yellow-300">
            Rollover Locked
          </p>
          <p className="mt-1 text-xs text-white/70">
            Withdraw করার আগে নির্ধারিত wager/rollover complete করতে হবে।
          </p>
        </div>
        <span className="rounded-full border border-[#00493B] bg-[#08251F] px-3 py-1 text-xs text-white/80">
          Active
        </span>
      </div>

      {/* Progress block */}
      <div className="mt-4 rounded-xl border border-[#00493B] bg-[#08251F] p-4">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>Progress</span>
          <span className="text-white/80">{pct.toFixed(1)}%</span>
        </div>

        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${clamp(pct, 0, 100)}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-[#00493B] bg-[#031A15] p-2">
            <div className="text-white/60">Required</div>
            <div className="mt-1 font-semibold text-white">
              {formatBDT(effectiveRequired)}
            </div>
          </div>
          <div className="rounded-lg border border-[#00493B] bg-[#031A15] p-2">
            <div className="text-white/60">Completed</div>
            <div className="mt-1 font-semibold text-white">
              {formatBDT(completed)}
            </div>
          </div>
          <div className="rounded-lg border border-[#00493B] bg-[#031A15] p-2">
            <div className="text-white/60">Remaining</div>
            <div className="mt-1 font-semibold text-red-400">
              {formatBDT(rem)}
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-white/70">
          Tip: Bet যত বেশি হবে, remaining তত দ্রুত কমবে (game callback অনুযায়ী)।
        </div>
      </div>

      {/* OK button */}
      <button
        type="button"
        onClick={onOk}
        className="mt-4 w-full rounded-xl bg-red-600 py-3 text-sm font-semibold hover:bg-red-700"
      >
        OK
      </button>
    </div>
  );
}
