"use client";

import { useMemo, useState } from "react";

/* ────────── types ────────── */
export type PromoChoice = "opt_in" | "opt_out";

type Tier = {
  from: number;
  to: number;
  percent: number;
};

type Props = {
  value: PromoChoice | null;
  onChange: (v: PromoChoice) => void;
  tiers?: Tier[];
  nextBonusDepositNumber?: number;
  nextBonusPercent?: number;
  turnoverMultiplier?: number;
  amount?: number;
};

const money = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 });

export default function PromotionConsent({
  value,
  onChange,
  tiers = [],
  nextBonusDepositNumber = 1,
  nextBonusPercent = 0,
  turnoverMultiplier = 1,
  amount,
}: Props) {
  const [openInfo, setOpenInfo] = useState(false);

  /* ────────── current bonus preview ────────── */
  const bonusAmount = useMemo(() => {
    if (!amount || !nextBonusPercent) return 0;
    return (amount * nextBonusPercent) / 100;
  }, [amount, nextBonusPercent]);

  /* ────────── deposit + bonus both 1x ────────── */
  const turnoverRequired = useMemo(() => {
    if (!amount || value !== "opt_in") return 0;
    return (amount + bonusAmount) * turnoverMultiplier;
  }, [value, amount, bonusAmount, turnoverMultiplier]);

  const showEligibility = nextBonusPercent > 0;

  return (
    <div className="mt-6">
      {/* ────────── section title ────────── */}
      <div className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-neutral-300">
        <span className="h-2 w-2 rounded-full bg-pink-500" />
        Participant in promotion
      </div>

      {/* ────────── opt in card ────────── */}
      <label
        className={[
          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
          value === "opt_in"
            ? "border-red-300 bg-red-50"
            : "border-neutral-200 bg-white hover:border-neutral-300",
        ].join(" ")}
      >
        <input
          type="radio"
          name="promo"
          checked={value === "opt_in"}
          onChange={() => onChange("opt_in")}
          className="mt-1"
        />

        <div className="flex-1">
          {/* ────────── top row ────────── */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-neutral-900">
              Participate in promotions
            </div>

            {showEligibility ? (
              <div className="text-sm font-extrabold text-red-600">
                +{nextBonusPercent}%
              </div>
            ) : (
              <div className="text-xs font-semibold text-neutral-500">
                Bonus limit reached
              </div>
            )}
          </div>

          {/* ────────── summary line ────────── */}
          <div className="mt-1 text-[12px] leading-5 text-neutral-600">
            {showEligibility ? (
              <>
                Deposit bonus no. <b>{nextBonusDepositNumber}</b> eligible for{" "}
                <b>{nextBonusPercent}%</b>. Turnover = <b>1x</b> of{" "}
                <b>(deposit + bonus)</b>.
              </>
            ) : (
              <>All 25 promotional deposit bonuses are already used.</>
            )}
          </div>

          {/* ────────── details toggle ────────── */}
          <button
            type="button"
            onClick={() => setOpenInfo((s) => !s)}
            className="mt-2 text-xs font-semibold text-blue-600 underline"
          >
            {openInfo ? "Hide details" : "How it works"}
          </button>

          {/* ────────── rules box ────────── */}
          {openInfo && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-[12px] leading-5 text-red-700">
              <div className="font-extrabold">Promotion Rules</div>

              <ul className="mt-1 list-disc space-y-1 pl-4">
                {tiers.map((tier) => (
                  <li key={`${tier.from}-${tier.to}`}>
                    Deposit <b>{tier.from}</b>
                    {tier.from !== tier.to ? (
                      <>
                        -<b>{tier.to}</b>
                      </>
                    ) : null}
                    : <b>{tier.percent}%</b> bonus
                  </li>
                ))}
                <li>
                  Every bonus deposit requires <b>1x turnover</b> on{" "}
                  <b>deposit + bonus</b>.
                </li>
                <li>
                  Bonus applies only when you choose{" "}
                  <b>Participate in promotions</b>.
                </li>
              </ul>

              {/* ────────── live amount preview ────────── */}
              {amount ? (
                <div className="mt-3 rounded-lg border border-red-200 bg-white p-2 text-red-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Deposit</span>
                    <span className="font-extrabold">💎 {money(amount)}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold">Bonus</span>
                    <span className="font-extrabold">
                      💎 {money(bonusAmount)}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-semibold">Turnover Required</span>
                    <span className="font-extrabold">
                      💎 {money(turnoverRequired)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </label>

      {/* ────────── opt out card ────────── */}
      <label
        className={[
          "mt-3 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
          value === "opt_out"
            ? "border-red-300 bg-red-50"
            : "border-neutral-200 bg-white hover:border-neutral-300",
        ].join(" ")}
      >
        <input
          type="radio"
          name="promo"
          checked={value === "opt_out"}
          onChange={() => onChange("opt_out")}
          className="mt-1"
        />

        <div className="flex-1">
          <div className="text-sm font-semibold text-neutral-900">
            Do not participate in any promotions
          </div>
          <div className="mt-1 text-[12px] leading-5 text-neutral-600">
            No bonus will be added. Only normal deposit turnover will apply.
          </div>
        </div>
      </label>
    </div>
  );
}
