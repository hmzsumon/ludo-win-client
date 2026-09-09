/* ────────── Auto bet + auto cash-out controls ────────── */
export default function AutoControls({
  autoBet,
  autoCash,
  multiplierInput,
  multiplier,
  onAutoBetChange,
  onAutoCashChange,
  onMultiplierInputChange,
}: {
  autoBet: boolean;
  autoCash: boolean;
  multiplierInput: string;
  multiplier: number;
  onAutoBetChange: (value: boolean) => void;
  onAutoCashChange: (value: boolean) => void;
  onMultiplierInputChange: (value: string) => void;
}) {
  const switchClass = (active: boolean) =>
    `relative h-5 w-9 rounded-full transition ${active ? "bg-[#23a817]" : "bg-[#111214]"}`;
  const knobClass = (active: boolean) =>
    `absolute top-1 h-3 w-3 rounded-full bg-[#aaa] transition-all ${active ? "left-5 bg-white" : "left-1"}`;

  return (
    <div className="mt-2 grid grid-cols-[auto_36px_auto_36px_1fr] items-center gap-1.5 border-t border-black/30 pt-2 text-[10px] text-[#c8c8c8] sm:text-xs">
      <span>Auto bet</span>
      <button
        type="button"
        role="switch"
        aria-checked={autoBet}
        onClick={() => onAutoBetChange(!autoBet)}
        className={switchClass(autoBet)}
      >
        <span className={knobClass(autoBet)} />
      </button>
      <span className="whitespace-nowrap">Auto Cash Out</span>
      <button
        type="button"
        role="switch"
        aria-checked={autoCash}
        onClick={() => onAutoCashChange(!autoCash)}
        className={switchClass(autoCash)}
      >
        <span className={knobClass(autoCash)} />
      </button>
      <div
        className={`grid h-6 min-w-0 grid-cols-[20px_1fr_20px] items-center rounded-full bg-[#111214] ${!autoCash ? "opacity-40" : ""}`}
      >
        <button
          type="button"
          aria-label="Decrease auto cash out multiplier"
          onClick={() =>
            onMultiplierInputChange(
              Math.max(1.1, Number((multiplier - 0.1).toFixed(2))).toFixed(2),
            )
          }
          className="h-5 w-5 rounded-full text-[14px] leading-none text-[#888]"
        >
          −
        </button>
        <label className="flex min-w-0 items-center">
          <input
            aria-label="Auto cash out multiplier"
            inputMode="decimal"
            value={multiplierInput}
            type="number"
            min="1.1"
            step="0.1"
            onChange={(event) => onMultiplierInputChange(event.target.value)}
            onBlur={() => onMultiplierInputChange(multiplier.toFixed(2))}
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-center text-[11px] font-semibold text-[#aaa] outline-none ring-0 focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[10px] text-[#777]">x</span>
        </label>
        <button
          type="button"
          aria-label="Increase auto cash out multiplier"
          onClick={() =>
            onMultiplierInputChange(
              Number((multiplier + 0.1).toFixed(2)).toFixed(2),
            )
          }
          className="h-5 w-5 rounded-full text-[14px] leading-none text-[#888]"
        >
          +
        </button>
      </div>
    </div>
  );
}
