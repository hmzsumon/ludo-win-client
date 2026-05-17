"use client";

import { IGroupedTransactions } from "@/redux/features/transactions/transactionHistoryApi";
// ✅ TransactionDateGroup.tsx
// Date header blue color — dark background এ ভালো দেখাবে

import TransactionCard from "./TransactionCard";

interface TransactionDateGroupProps {
  group: IGroupedTransactions;
}

export default function TransactionDateGroup({
  group,
}: TransactionDateGroupProps) {
  return (
    <div className="mb-5">
      {/* ── Date label ── */}
      <div className="mb-3 px-1">
        <span className="text-[13px] font-bold" style={{ color: "#0173e5" }}>
          {group.date}
        </span>
      </div>

      {/* ── Cards ── */}
      {group.transactions.map((txn) => (
        <TransactionCard key={txn._id} txn={txn} />
      ))}
    </div>
  );
}
