"use client";

import { useMemo, useState } from "react";

/* ────────── types ────────── */
export type PromoChoice = "opt_in" | "opt_out";

type Tier = {
  from: number;
  to: number;
  percent: number;
  maxBonus?: number;
};

type Props = {
  value: PromoChoice | null;
  onChange: (v: PromoChoice) => void;
  tiers?: Tier[];
  nextBonusDepositNumber?: number;
  nextBonusPercent?: number;
  nextBonusMaxAmount?: number;
  turnoverMultiplier?: number;
  amount?: number;
};

const money = (n?: number) =>
  Number(n ?? 0).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

const getOrdinal = (n: number) => {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
};

const getTierTitle = (tier: Tier) => {
  if (tier.from === 1 && tier.to === 1) return "1st Deposit";
  if (tier.from === 2 && tier.to === 2) return "2nd Deposit";
  if (tier.from === 3 && tier.to === 3) return "3rd Deposit";
  return tier.from === tier.to
    ? `Deposit ${tier.from}`
    : `Deposit ${tier.from} - ${tier.to}`;
};

export default function PromotionConsent({
  value,
  onChange,
  tiers = [],
  nextBonusDepositNumber = 1,
  nextBonusPercent = 0,
  nextBonusMaxAmount = 10000,
  turnoverMultiplier = 1,
  amount,
}: Props) {
  const [openInfo, setOpenInfo] = useState(true);

  const bonusAmount = useMemo(() => {
    if (!amount || !nextBonusPercent) return 0;

    const calculated = (amount * nextBonusPercent) / 100;
    return nextBonusMaxAmount > 0
      ? Math.min(calculated, nextBonusMaxAmount)
      : calculated;
  }, [amount, nextBonusPercent, nextBonusMaxAmount]);

  const turnoverRequired = useMemo(() => {
    if (!amount || value !== "opt_in") return 0;
    return (amount + bonusAmount) * turnoverMultiplier;
  }, [value, amount, bonusAmount, turnoverMultiplier]);

  const showEligibility = nextBonusPercent > 0;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-2 text-[15px] font-black text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-pink-400 to-yellow-300 shadow-[0_0_14px_rgba(244,114,182,0.8)]" />
        Deposit Bonus Program
      </div>

      <label
        className={[
          "relative block cursor-pointer overflow-hidden rounded-[24px] border p-[1px] transition-all duration-200",
          value === "opt_in"
            ? "border-yellow-300/80 shadow-[0_0_28px_rgba(250,204,21,0.28)]"
            : "border-white/15 hover:border-yellow-300/50",
        ].join(" ")}
      >
        <div
          className={[
            "relative rounded-[23px] p-4",
            value === "opt_in"
              ? "bg-gradient-to-br from-[#ffeff8] via-[#fff7fb] to-[#ffe0f0]"
              : "bg-gradient-to-br from-white/95 to-pink-50",
          ].join(" ")}
        >
          <div className="absolute right-3 top-3 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 px-3 py-1 text-sm font-black text-[#7a2e00] shadow-[0_8px_18px_rgba(245,158,11,0.35)]">
            {showEligibility ? `+${nextBonusPercent}%` : "Ended"}
          </div>

          <div className="flex gap-3 pr-20">
            <input
              type="radio"
              name="promo"
              checked={value === "opt_in"}
              onChange={() => onChange("opt_in")}
              className="mt-1 h-4 w-4 accent-pink-600"
            />

            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-black text-[#7d174b]">
                Participate in Bonus Program
              </div>

              <div className="mt-1 text-[13px] font-semibold leading-5 text-[#9b4f74]">
                {showEligibility ? (
                  <>
                    Your{" "}
                    <b className="text-[#d4146f]">
                      {getOrdinal(nextBonusDepositNumber)}
                    </b>{" "}
                    bonus deposit is eligible for{" "}
                    <b className="text-[#d4146f]">{nextBonusPercent}%</b> bonus,
                    up to{" "}
                    <b className="text-[#d4146f]">
                      💎 {money(nextBonusMaxAmount)}
                    </b>
                    .
                  </>
                ) : (
                  <>You have already used all promotional deposit bonuses.</>
                )}
              </div>
            </div>
          </div>

          {showEligibility && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-pink-100 bg-white/80 p-3 text-center shadow-sm">
                <div className="text-[11px] font-black uppercase tracking-wide text-[#bf4780]">
                  Deposit
                </div>
                <div className="mt-1 text-sm font-black text-[#7d174b]">
                  💎 {amount ? money(amount) : "0"}
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-3 text-center shadow-sm">
                <div className="text-[11px] font-black uppercase tracking-wide text-[#b45309]">
                  Bonus
                </div>
                <div className="mt-1 text-sm font-black text-[#d97706]">
                  💎 {money(bonusAmount)}
                </div>
              </div>

              <div className="rounded-2xl border border-sky-100 bg-white/80 p-3 text-center shadow-sm">
                <div className="text-[11px] font-black uppercase tracking-wide text-[#0284c7]">
                  Turnover
                </div>
                <div className="mt-1 text-sm font-black text-[#0369a1]">
                  💎 {money(turnoverRequired)}
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpenInfo((s) => !s)}
            className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#7d174b]/10 px-3 py-1.5 text-xs font-black text-[#b91568] transition hover:bg-[#7d174b]/15"
          >
            {openInfo ? "Hide bonus rules" : "Show bonus rules"}
          </button>

          {openInfo && (
            <div className="mt-3 rounded-[20px] border border-pink-100 bg-white/75 p-3 shadow-inner">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-black text-[#7d174b]">
                  Bonus Rules
                </div>
                <div className="rounded-full bg-pink-100 px-2.5 py-1 text-[11px] font-black text-[#c2186a]">
                  1x Turnover
                </div>
              </div>

              <div className="grid gap-2">
                {tiers.map((tier) => (
                  <div
                    key={`${tier.from}-${tier.to}`}
                    className="flex items-center justify-between rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-white px-3 py-2"
                  >
                    <div>
                      <div className="text-xs font-black text-[#7d174b]">
                        {getTierTitle(tier)}
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold text-[#a75b7d]">
                        Maximum bonus 💎 {money(tier.maxBonus || 10000)}
                      </div>
                    </div>

                    <div className="rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 px-3 py-1.5 text-sm font-black text-[#7a2e00] shadow">
                      {tier.percent}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl bg-[#7d174b]/8 p-3 text-[12px] font-semibold leading-5 text-[#8b4568]">
                Bonus applies only when you choose{" "}
                <b>Participate in Bonus Program</b>. Every bonus deposit
                requires <b>1x turnover</b> on <b>deposit + bonus</b>.
              </div>
            </div>
          )}
        </div>
      </label>

      <label
        className={[
          "mt-3 flex cursor-pointer items-start gap-3 rounded-[20px] border p-4 transition",
          value === "opt_out"
            ? "border-white/80 bg-white shadow-[0_0_20px_rgba(255,255,255,0.18)]"
            : "border-white/15 bg-white/90 hover:border-white/50",
        ].join(" ")}
      >
        <input
          type="radio"
          name="promo"
          checked={value === "opt_out"}
          onChange={() => onChange("opt_out")}
          className="mt-1 h-4 w-4 accent-pink-600"
        />

        <div className="flex-1">
          <div className="text-sm font-black text-[#7d174b]">
            Do not participate in bonus
          </div>
          <div className="mt-1 text-[12px] font-semibold leading-5 text-[#9b4f74]">
            No bonus will be added. Only normal deposit amount will be credited.
          </div>
        </div>
      </label>
    </div>
  );
}
