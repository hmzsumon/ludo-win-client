"use client";

// ✅ TransactionHistoryShell.tsx
// Dark theme — background #14041f (প্রজেক্টের main color)

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  TxnFilter,
  useGetTransactionHistoryQuery,
} from "@/redux/features/transactions/transactionHistoryApi";
import FilterTabs from "./FilterTabs";
import TransactionDateGroup from "./TransactionDateGroup";

export default function TransactionHistoryShell() {
  const router = useRouter();
  const [filter, setFilter] = useState<TxnFilter>("all");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError } =
    useGetTransactionHistoryQuery({ filter, page, limit: 20 });

  /* ── Filter change হলে page reset ── */
  const handleFilterChange = (f: TxnFilter) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <main className="min-h-screen w-full" style={{ background: "transparent" }}>
      <div className="w-full max-w-[480px] mx-auto  pb-10">
        {/* ────────── Top Bar ────────── */}

        {/* ────────── Title ────────── */}
        <h1 className="text-[22px] font-black text-white mb-4">
          Transaction history
        </h1>

        {/* ────────── Filter Tabs ────────── */}
        <div className="mb-5">
          <FilterTabs active={filter} onChange={handleFilterChange} />
        </div>

        {/* ────────── Content ────────── */}
        {(isLoading || isFetching) && <TransactionSkeleton />}

        {isError && !isLoading && (
          <div className="py-12 text-center text-white/30 text-[14px]">
            Failed to load transactions.
          </div>
        )}

        {!isLoading && !isFetching && !isError && data?.data.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-3">
            <span className="text-5xl opacity-20">📋</span>
            <p className="text-[14px] text-white/30">No transactions found</p>
          </div>
        )}

        {!isLoading &&
          !isError &&
          data?.data.map((group) => (
            <TransactionDateGroup key={group.date} group={group} />
          ))}

        {/* ── Load More ── */}
        {!isLoading && data?.pagination?.hasMore && (
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetching}
            className="w-full py-3 mt-2 rounded-xl text-[13px] font-bold transition-all disabled:opacity-40"
            style={{
              background: "rgba(1,115,229,0.15)",
              border: "1px solid rgba(1,115,229,0.35)",
              color: "#0173e5",
            }}
          >
            {isFetching ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
    </main>
  );
}

/* ────────── Loading Skeleton ────────── */
function TransactionSkeleton() {
  return (
    <div className="space-y-2.5">
      <div
        className="h-3 w-24 rounded animate-pulse mb-4"
        style={{ background: "rgba(255,255,255,0.1)" }}
      />
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl px-4 py-4 animate-pulse"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-10 h-2.5 rounded"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div
            className="w-9 h-9 rounded-full"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div className="flex-1 space-y-2">
            <div
              className="h-3 rounded w-3/4"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />
            <div
              className="h-2.5 rounded w-1/3"
              style={{ background: "rgba(255,255,255,0.07)" }}
            />
          </div>
          <div
            className="w-16 h-3 rounded"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
        </div>
      ))}
    </div>
  );
}
