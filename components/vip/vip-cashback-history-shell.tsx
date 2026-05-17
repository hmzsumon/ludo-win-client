/* ────────────────────────────────────────────────────────────────
   vip-cashback-history-shell.tsx
   VIP Cashback History Page
   ────────────────────────────────────────────────────────────── */

"use client";

import {
  useClaimMyVipCashbackMutation,
  useGetMyVipCashbackHistoryQuery,
} from "@/redux/features/vipCashback/vipCashbackApi";
import Link from "next/link";
import { useState } from "react";
import { getRankConfig } from "./VipRankBadge";

const STATUS_CONFIG = {
  paid: { label: "Paid", color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  skipped: { label: "Skipped", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  pending: { label: "Pending", color: "#60a5fa", bg: "rgba(96,165,250,0.15)" },
};

const VipCashbackHistoryShell = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetMyVipCashbackHistoryQuery({
    page,
    limit: 10,
  });

  const [claimMyVipCashback, { isLoading: isClaiming }] =
    useClaimMyVipCashbackMutation();

  const logs = data?.data?.logs ?? [];
  const pagination = data?.data?.pagination;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}.${d.getFullYear()}`;
  };

  const handleClaim = async (logId: string) => {
    try {
      await claimMyVipCashback(logId).unwrap();
      await refetch();
    } catch (error: any) {
      alert(error?.data?.message || "Claim failed");
    }
  };

  return (
    <main className="min-h-screen w-full text-white ls-stars-bg">
      <div className="relative min-h-screen pb-28">
        <div className="relative z-10 mx-auto w-full max-w-[430px] px-4 pt-5">
          <div className="flex items-center gap-3 mb-5">
            <Link href="/vip-cashback">
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
            <h1 className="text-[18px] font-black text-white">
              Cashback History
            </h1>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-[18px] animate-pulse"
                  style={{ background: "rgba(255,255,255,0.05)" }}
                />
              ))
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-white/30">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-semibold">No cashback history yet</p>
              </div>
            ) : (
              logs.map((log) => {
                const rankCfg = getRankConfig(log.rank);
                const statusCfg =
                  STATUS_CONFIG[log.status] ?? STATUS_CONFIG.pending;

                return (
                  <div
                    key={log._id}
                    className="relative rounded-[18px] overflow-hidden p-4"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(30,10,60,0.8) 0%, rgba(10,2,30,0.9) 100%)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                          Week
                        </p>
                        <p className="text-[13px] font-black text-white">
                          {formatDate(log.weekStart)} →{" "}
                          {formatDate(log.weekEnd)}
                        </p>
                      </div>

                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-black"
                        style={{
                          background: statusCfg.bg,
                          color: statusCfg.color,
                        }}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-black"
                          style={{
                            background: rankCfg.bg,
                            color: rankCfg.color,
                            border: `1px solid ${rankCfg.border}`,
                          }}
                        >
                          {log.rank} · {log.cashbackPercent}%
                        </span>

                        <span className="text-[11px] text-white/40">
                          {log.weekMatches} matches
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-white/40 font-semibold">
                          Cashback
                        </p>
                        <p
                          className="text-[18px] font-black"
                          style={{
                            color:
                              log.status === "paid"
                                ? "#22c55e"
                                : log.status === "pending"
                                  ? "#93c5fd"
                                  : "rgba(255,255,255,0.3)",
                          }}
                        >
                          💎 {log.cashbackAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {log.status === "pending" && (
                      <button
                        onClick={() => handleClaim(log._id)}
                        disabled={isClaiming}
                        className="mt-4 w-full rounded-xl py-3 text-[13px] font-black text-black disabled:opacity-60"
                        style={{
                          background:
                            "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
                        }}
                      >
                        {isClaiming ? "Claiming..." : "Claim Now"}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-[13px] font-black text-white disabled:opacity-30"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                ← Prev
              </button>
              <span className="flex items-center text-[13px] font-semibold text-white/60">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded-xl text-[13px] font-black text-white disabled:opacity-30"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default VipCashbackHistoryShell;
