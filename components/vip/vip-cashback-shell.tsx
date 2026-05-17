/* ────────────────────────────────────────────────────────────────
   vip-cashback-shell.tsx
   VIP Cashback Page

   ✅ pending cashback card
   ✅ claim button
   ✅ notification url থেকে claim target highlight
   ✅ claim করলে history + wallet refetch হবে
   ────────────────────────────────────────────────────────────── */

"use client";

import {
  useClaimMyVipCashbackMutation,
  useGetMyVipCashbackInfoQuery,
} from "@/redux/features/vipCashback/vipCashbackApi";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getRankConfig } from "./VipRankBadge";

/* ────────── Rank icon map ────────── */
const RANK_MEDAL_ICON: Record<string, string> = {
  Copper: "🥉",
  Bronze: "🥈",
  Silver: "🥈",
  Gold: "🥇",
  Ruby: "♦️",
  Sapphire: "💠",
  Diamond: "💎",
  VIP: "👑",
};

/* ────────── Number format ────────── */
const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)} 000`
      : String(n);

/* ────────────────────────────────────────────────────────────────
   VipCashbackShell
   ────────────────────────────────────────────────────────────── */
const VipCashbackShell = () => {
  const searchParams = useSearchParams();
  const claimTargetId = searchParams.get("claim");

  const { data, isLoading, refetch } = useGetMyVipCashbackInfoQuery();
  const [claimMyVipCashback, { isLoading: isClaiming }] =
    useClaimMyVipCashbackMutation();

  const [claimSuccessMessage, setClaimSuccessMessage] = useState("");

  const info = data?.data;
  const currentRank = info?.currentRank;
  const allRanks = info?.allRanks ?? [];
  const userProgress = info?.userProgress;
  const thisWeek = info?.thisWeek;
  const lastCashback = info?.lastCashback;
  const pendingCashback = info?.pendingCashback;

  /* ────────── next rank progress ────────── */
  const nextRank = info?.nextRank;
  const progressPercent =
    nextRank && currentRank
      ? Math.min(
          100,
          ((userProgress?.currentStageTurnover ?? 0) / nextRank.minTurnover) *
            100,
        )
      : currentRank
        ? 100
        : 0;

  /* ────────── next Sunday ────────── */
  const nextSunday = thisWeek?.weekEnd ? new Date(thisWeek.weekEnd) : null;

  const formatDate = (d: Date | null) => {
    if (!d) return "—";
    return `${d.getUTCHours().toString().padStart(2, "0")}:${d
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")} ${d.getUTCDate().toString().padStart(2, "0")}.${(
      d.getUTCMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${d.getUTCFullYear()}`;
  };

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${d.getFullYear()}`;
  };

  const rankCfg = getRankConfig(currentRank?.rank);

  /* ────────── notification থেকে আসা claim target match করছে কিনা ────────── */
  const isHighlightedPending =
    pendingCashback?._id && claimTargetId === pendingCashback._id;

  /* ────────── claim handler ────────── */
  const handleClaim = async () => {
    if (!pendingCashback?._id || isClaiming) return;

    try {
      const res = await claimMyVipCashback(pendingCashback._id).unwrap();

      setClaimSuccessMessage(
        `Claim successful. 💎${res.data.claimedAmount.toLocaleString()} added to m_balance. 1x turnover required.`,
      );

      await refetch();
    } catch (error: any) {
      alert(error?.data?.message || "Claim failed");
    }
  };

  const claimCardTitle = useMemo(() => {
    if (!pendingCashback) return "No cashback ready";
    return isHighlightedPending
      ? "Your notification cashback is ready"
      : "VIP cashback ready to claim";
  }, [pendingCashback, isHighlightedPending]);

  return (
    <main className="min-h-screen w-full text-white ls-stars-bg">
      <div className="relative min-h-screen w-full pb-28">
        {/* ── Glow ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #ff9f00 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[430px] px-4 pt-5">
          {/* ─────────────────────────────────────────────────────────
              TOP BAR
              ───────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3 mb-5">
            <Link href="/profile">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                ←
              </button>
            </Link>
            <h1 className="text-[18px] font-black text-white">VIP Cashback</h1>
          </div>

          {/* ─────────────────────────────────────────────────────────
              CLAIM CARD
              ───────────────────────────────────────────────────────── */}
          <section
            className="relative rounded-[22px] overflow-hidden p-5 mb-4"
            style={{
              background: isHighlightedPending
                ? "linear-gradient(145deg, rgba(16,185,129,0.18) 0%, rgba(29,5,70,0.92) 100%)"
                : "linear-gradient(145deg, rgba(30,10,60,0.85) 0%, rgba(10,2,30,0.95) 100%)",
              border: isHighlightedPending
                ? "1px solid rgba(16,185,129,0.6)"
                : "1px solid rgba(255,215,0,0.18)",
              boxShadow: isHighlightedPending
                ? "0 0 28px rgba(16,185,129,0.22)"
                : "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-black">
                  Claim Cashback
                </p>
                <h2 className="mt-1 text-[18px] font-black text-white">
                  {claimCardTitle}
                </h2>
              </div>

              {pendingCashback && (
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-black"
                  style={{
                    background: "rgba(96,165,250,0.16)",
                    color: "#93c5fd",
                    border: "1px solid rgba(96,165,250,0.25)",
                  }}
                >
                  Pending
                </span>
              )}
            </div>

            {pendingCashback ? (
              <>
                <div
                  className="mt-4 rounded-[18px] p-4"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] text-white/45 font-semibold">
                        Rank
                      </p>
                      <p className="text-[15px] font-black text-white">
                        {pendingCashback.rank} · {pendingCashback.percent}%
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] text-white/45 font-semibold">
                        Claim Amount
                      </p>
                      <p className="text-[24px] font-black text-emerald-400">
                        💎 {pendingCashback.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div
                      className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <p className="text-[10px] text-white/35 font-semibold uppercase">
                        Week
                      </p>
                      <p className="mt-1 text-[13px] font-black text-white">
                        {formatDateShort(pendingCashback.weekStart)} →{" "}
                        {formatDateShort(pendingCashback.weekEnd)}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-3"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <p className="text-[10px] text-white/35 font-semibold uppercase">
                        1x Turnover
                      </p>
                      <p className="mt-1 text-[13px] font-black text-yellow-300">
                        💎 {pendingCashback.turnoverRequired.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClaim}
                    disabled={isClaiming}
                    className="mt-4 w-full rounded-xl py-3 text-[14px] font-black text-black disabled:opacity-60"
                    style={{
                      background:
                        "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                      boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
                    }}
                  >
                    {isClaiming ? "Claiming..." : "Claim Now"}
                  </button>
                </div>
              </>
            ) : null}

            {claimSuccessMessage ? (
              <div
                className="mt-4 rounded-xl p-3 text-[13px] font-semibold"
                style={{
                  background: "rgba(16,185,129,0.12)",
                  border: "1px solid rgba(16,185,129,0.25)",
                  color: "#a7f3d0",
                }}
              >
                {claimSuccessMessage}
              </div>
            ) : null}
          </section>

          {/* ─────────────────────────────────────────────────────────
              CURRENT RANK CARD
              ───────────────────────────────────────────────────────── */}
          <section
            className="relative rounded-[24px] overflow-hidden p-5 mb-4"
            style={{
              background:
                "linear-gradient(145deg, rgba(74,26,138,0.85) 0%, rgba(29,5,70,0.9) 100%)",
              border: `1px solid ${rankCfg.border}`,
              boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 40px ${rankCfg.glow}20`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-4xl"
                style={{
                  background: rankCfg.bg,
                  border: `2px solid ${rankCfg.border}`,
                  boxShadow: `0 0 20px ${rankCfg.glow}`,
                }}
              >
                {RANK_MEDAL_ICON[currentRank?.rank ?? "None"] ?? "⚪"}
              </div>

              <div className="flex flex-col gap-2">
                <h2
                  className="text-[24px] font-black leading-tight"
                  style={{ color: rankCfg.color }}
                >
                  {isLoading
                    ? "Loading..."
                    : (currentRank?.rank ?? "No Rank Yet")}
                </h2>

                <div className="flex flex-wrap gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[12px] font-black text-black"
                    style={{
                      background: rankCfg.color,
                      boxShadow: `0 0 10px ${rankCfg.glow}`,
                    }}
                  >
                    {currentRank?.cashback ?? 0}% cashback
                  </span>

                  <span
                    className="rounded-full px-3 py-1 text-[12px] font-black"
                    style={{
                      background: "rgba(255,159,0,0.2)",
                      border: "1px solid rgba(255,159,0,0.4)",
                      color: "#ff9f00",
                    }}
                  >
                    {userProgress?.totalMatches ?? 0} matches
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-white/50">
                  Current stage turnover
                </span>
                <span className="text-[11px] font-black text-white/80">
                  {(userProgress?.currentStageTurnover ?? 0).toLocaleString()}
                  {nextRank
                    ? ` / ${nextRank.minTurnover.toLocaleString()}`
                    : " (Max)"}
                </span>
              </div>
              <div
                className="w-full h-3 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${rankCfg.color}, ${rankCfg.color}aa)`,
                    boxShadow: `0 0 8px ${rankCfg.glow}`,
                  }}
                />
              </div>
              {nextRank && (
                <p className="mt-1 text-[10px] text-white/30 font-semibold text-right">
                  Next: {nextRank.rank} ({nextRank.cashback}% cashback)
                </p>
              )}
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              WEEKLY CARD
              ───────────────────────────────────────────────────────── */}
          <section
            className="rounded-[20px] overflow-hidden mb-4"
            style={{
              background:
                "linear-gradient(145deg, rgba(29,5,70,0.9) 0%, rgba(10,2,30,0.95) 100%)",
              border: "1px solid rgba(255,215,0,0.15)",
            }}
          >
            <div
              className="px-4 py-3 flex items-center justify-center gap-2"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <span className="text-[12px] font-semibold text-white/50">
                Available from:
              </span>
              <span className="text-[13px] font-black text-white">
                {formatDate(nextSunday)}
              </span>
            </div>

            <div className="px-4 py-4">
              <Link href="/vip-cashback/history">
                <button
                  className=" w-full rounded-xl py-3 text-[13px] font-black text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
                    boxShadow: "0 4px 16px rgba(91,33,182,0.4)",
                  }}
                >
                  📜 Find out your cashback amount →
                </button>
              </Link>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────
              LAST CLAIM CARD
              ───────────────────────────────────────────────────────── */}
          {lastCashback ? (
            <section
              className="rounded-[20px] p-4 mb-4"
              style={{
                background:
                  "linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(10,2,30,0.9) 100%)",
                border: "1px solid rgba(16,185,129,0.16)",
              }}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-black">
                Last Claimed Cashback
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-black text-white">
                    {lastCashback.rank} · {lastCashback.percent}%
                  </p>
                  <p className="text-[12px] text-white/50 mt-1">
                    Week: {formatDateShort(lastCashback.weekStart)}
                  </p>
                </div>
                <p className="text-[22px] font-black text-emerald-400">
                  💎 {lastCashback.amount.toLocaleString()}
                </p>
              </div>
            </section>
          ) : null}

          {/* ─────────────────────────────────────────────────────────
              STATUSES LIST
              ───────────────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[17px] font-black text-white">
                VIP cashback statuses
              </h2>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-full text-white/40"
                style={{ border: "1.5px solid rgba(255,255,255,0.2)" }}
              >
                ?
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <RankCardSkeleton key={i} />
                  ))
                : allRanks.map((rankItem) => {
                    const isCurrent = rankItem.rank === currentRank?.rank;

                    return (
                      <RankStatusCard
                        key={rankItem._id}
                        rank={rankItem.rank}
                        cashback={rankItem.cashback}
                        minMatches={rankItem.minMatches}
                        minTurnover={rankItem.minTurnover}
                        isActive={isCurrent}
                        userMatches={userProgress?.totalMatches ?? 0}
                        userTurnover={userProgress?.turnoverTotal ?? 0}
                      />
                    );
                  })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default VipCashbackShell;

/* ════════════════════════════════════════════════════════════════
   SUB COMPONENTS
   ════════════════════════════════════════════════════════════════ */

interface RankStatusCardProps {
  rank: string;
  cashback: number;
  minMatches: number;
  minTurnover: number;
  isActive: boolean;
  userMatches: number;
  userTurnover: number;
}

const RankStatusCard = ({
  rank,
  cashback,
  minMatches,
  minTurnover,
  isActive,
  userMatches,
  userTurnover,
}: RankStatusCardProps) => {
  const cfg = getRankConfig(rank);
  const qualified = userMatches >= minMatches && userTurnover >= minTurnover;

  return (
    <div
      className="relative flex items-center gap-4 rounded-[18px] overflow-hidden p-4"
      style={{
        background: isActive
          ? `linear-gradient(135deg, ${cfg.bg} 0%, rgba(29,5,70,0.9) 100%)`
          : "linear-gradient(145deg, rgba(30,10,60,0.7) 0%, rgba(10,2,30,0.8) 100%)",
        border: isActive
          ? `1px solid ${cfg.border}`
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: isActive
          ? `0 0 24px ${cfg.glow}30, 0 4px 16px rgba(0,0,0,0.4)`
          : "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at left center, ${cfg.glow}15 0%, transparent 60%)`,
          }}
        />
      )}

      <div
        className="relative shrink-0 flex h-14 w-14 items-center justify-center rounded-full text-3xl"
        style={{
          background: isActive ? cfg.bg : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${isActive ? cfg.border : "rgba(255,255,255,0.08)"}`,
          boxShadow: isActive ? `0 0 14px ${cfg.glow}` : "none",
        }}
      >
        {RANK_MEDAL_ICON[rank] ?? "⚪"}

        {qualified && (
          <div
            className="absolute -bottom-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-black"
            style={{ background: "#22c55e", border: "1.5px solid #000" }}
          >
            ✓
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[16px] font-black"
            style={{ color: isActive ? cfg.color : "#fff" }}
          >
            {rank}
          </span>

          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-black"
            style={{
              background: isActive ? cfg.color : "rgba(255,255,255,0.1)",
              color: isActive ? "#000" : "rgba(255,255,255,0.7)",
            }}
          >
            {cashback}% cashback
          </span>
        </div>

        <div className="mt-1.5 flex flex-col gap-0.5">
          <p className="text-[12px] font-semibold text-white/50">
            Experience:{" "}
            <span className="text-white/80 font-black">{fmt(minTurnover)}</span>
          </p>
          <p className="text-[12px] font-semibold text-white/50">
            Matches:{" "}
            <span className="text-white/80 font-black">{minMatches}</span>
          </p>
        </div>
      </div>

      {isActive && (
        <div
          className="shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black"
          style={{
            background: cfg.color,
            color: "#000",
            boxShadow: `0 0 10px ${cfg.glow}`,
          }}
        >
          CURRENT
        </div>
      )}
    </div>
  );
};

const RankCardSkeleton = () => (
  <div
    className="flex items-center gap-4 rounded-[18px] p-4 animate-pulse"
    style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <div className="h-14 w-14 rounded-full bg-white/10" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-24 rounded bg-white/10" />
      <div className="h-3 w-32 rounded bg-white/10" />
      <div className="h-3 w-20 rounded bg-white/10" />
    </div>
  </div>
);
