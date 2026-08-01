"use client";

import LsButton from "@/components/ui/LsButton";
import { useMemo } from "react";

/* NEW ▸ One shared amount list is used by Quick Match and Friends Wager. */
export const WAGER_PRESET_AMOUNTS = [50, 100, 500, 1000] as const;

/* NEW ▸ This is the single source of truth for every wager amount rule. */
export const isAllowedWagerAmount = (amount: number) => {
  if (!Number.isInteger(amount) || amount < 50) return false;

  if (amount <= 1000) return amount % 50 === 0;
  if (amount <= 100000) return amount % 100 === 0;
  return amount % 1000 === 0;
};

/* NEW ▸ Both wager screens now show exactly the same validation message. */
export const getWagerAmountValidationMessage = (rawValue: string) => {
  const trimmedValue = rawValue.trim();

  if (!trimmedValue) return "Enter an amount.";

  const amount = Number(trimmedValue);

  if (!Number.isFinite(amount)) return "Enter a valid number.";
  if (!Number.isInteger(amount)) return "Only whole numbers are allowed.";
  if (amount < 50) return "Minimum amount is 50.";

  if (amount <= 1000 && amount % 50 !== 0) {
    return "Use 50-step amounts up to 1000. Example: 50, 100, 150, 200.";
  }

  /* FIX ▸ Do not run the 100-step rule for valid 50–1000 amounts. */
  if (amount > 1000 && amount <= 100000 && amount % 100 !== 0) {
    return "Use 100-step amounts from 1100 to 100000. Example: 1100, 1200, 1300.";
  }

  if (amount > 100000 && amount % 1000 !== 0) {
    return "Use 1000-step amounts above 100000. Example: 101000, 102000, 103000.";
  }

  return "";
};

interface WagerAmountPickerProps {
  amountInput: string;
  onAmountInputChange: (value: string) => void;
  walletBalance: number;
  inputId: string;
  showHeader?: boolean;
  cooldownRemainingMs?: number;
}

/* NEW ▸ Reusable, visible and mobile-friendly wager amount selector. */
const WagerAmountPicker = ({
  amountInput,
  onAmountInputChange,
  walletBalance,
  inputId,
  showHeader = true,
  cooldownRemainingMs = 0,
}: WagerAmountPickerProps) => {
  const finalAmount = useMemo(() => Number(amountInput || 0), [amountInput]);
  const selectedPresetAmount = useMemo(
    () =>
      WAGER_PRESET_AMOUNTS.includes(
        finalAmount as (typeof WAGER_PRESET_AMOUNTS)[number],
      )
        ? finalAmount
        : null,
    [finalAmount],
  );
  const validationMessage = useMemo(
    () => getWagerAmountValidationMessage(amountInput),
    [amountInput],
  );
  const isValid = validationMessage === "" && isAllowedWagerAmount(finalAmount);
  const insufficientBalance = isValid && walletBalance < finalAmount;
  const cooldownSeconds = Math.max(1, Math.ceil(cooldownRemainingMs / 1000));

  return (
    <div className="flex w-full flex-col gap-3.5">
      {showHeader ? (
        <div className="w-full rounded-[20px] border border-white/15 bg-gradient-to-b from-[#08214d]/90 to-[#061430]/80 px-4 py-3.5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
          <h2 className="m-0 text-sm font-black uppercase leading-[1.1] tracking-[0.04em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)]">
            Choose Wager Amount
          </h2>

          <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-gradient-to-b from-white/15 to-white/10 px-4 py-2.5">
            <span className="text-[15px] font-bold text-[#dff7ff]">
              Available Balance:
            </span>
            <span className="text-lg font-black text-[#ffe36e] drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              {walletBalance}
            </span>
          </div>
        </div>
      ) : (
        <div className="mx-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-[#071a3d]/75 px-3 py-2 text-center shadow-inner">
          <span className="text-xs font-bold text-[#dff7ff]">Balance:</span>
          <span className="text-sm font-black text-[#ffe36e]">
            {walletBalance}
          </span>
        </div>
      )}

      <div className="grid w-full grid-cols-2 gap-3">
        {WAGER_PRESET_AMOUNTS.map((amount) => {
          const active = selectedPresetAmount === amount;

          return (
            <button
              key={amount}
              type="button"
              aria-pressed={active}
              onClick={() => onAmountInputChange(String(amount))}
              className={[
                "relative w-full cursor-pointer rounded-[22px] border-none bg-transparent p-0 transition-all duration-200",
                active
                  ? "-translate-y-0.5 scale-[1.02]"
                  : "shadow-[0_8px_18px_rgba(0,0,0,0.14)]",
              ].join(" ")}
            >
              <span
                className={[
                  "absolute left-2 top-1/2 z-[2] grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-[#ffe066] text-sm font-black text-[#174a9f] shadow-[0_4px_10px_rgba(0,0,0,0.18)] transition-opacity",
                  active ? "opacity-100" : "opacity-0",
                ].join(" ")}
                aria-hidden="true"
              >
                ✓
              </span>

              <LsButton
                variant={
                  amount === 50
                    ? "logo-blue"
                    : amount === 100
                      ? "logo-green"
                      : amount === 500
                        ? "logo-orange"
                        : "logo-purple"
                }
                size="lg"
                fullWidth
              >
                {amount}
              </LsButton>
            </button>
          );
        })}
      </div>

      <div className="w-full rounded-[22px] border border-white/15 bg-gradient-to-b from-[#09224a]/90 to-[#040f23]/80 px-3.5 pb-3 pt-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
        <label
          htmlFor={inputId}
          className="mb-2.5 block text-center text-xs font-extrabold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)]"
        >
          Enter Amount
        </label>

        <div
          className={[
            "flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
            validationMessage
              ? "border border-red-400/70"
              : "border border-yellow-300/60",
          ].join(" ")}
        >
          <span className="min-w-5 text-lg font-black" aria-hidden="true">
            💎
          </span>

          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder="Type amount"
            value={amountInput}
            aria-invalid={Boolean(validationMessage)}
            onChange={(event) =>
              onAmountInputChange(event.target.value.replace(/\D/g, ""))
            }
            className="h-[52px] min-w-0 w-full border-none bg-transparent text-left text-lg font-black text-white caret-[#ffe36e] outline-none [-webkit-text-fill-color:#fff] placeholder:text-white/35 placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.35)]"
          />
        </div>

        <p
          className={`mb-0 mt-2.5 pl-1 text-left text-xs font-bold leading-[1.45] ${
            validationMessage ? "text-[#ffb3b3]" : "text-[#9fffb0]"
          }`}
        >
          {validationMessage || "Valid amount. You can continue."}
        </p>

        <p className="mb-0 mt-2.5 text-center text-sm font-bold text-[#dff7ff]/90">
          Selected Amount:{" "}
          <span className="font-black text-[#ffe36e]">{finalAmount}</span>
        </p>

        {cooldownRemainingMs > 0 && (
          <p className="mb-0 mt-2 text-center text-xs font-bold text-[#ffdf8a]">
            Previous match is reconnecting. Try again after {cooldownSeconds}{" "}
            seconds.
          </p>
        )}

        {insufficientBalance && (
          <p className="mb-0 mt-2 text-center text-xs font-bold text-[#ffb3b3]">
            Insufficient balance for this wager amount.
          </p>
        )}
      </div>
    </div>
  );
};

export default WagerAmountPicker;
