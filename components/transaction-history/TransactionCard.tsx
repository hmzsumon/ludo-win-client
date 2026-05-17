"use client";

import { ITransaction } from "@/redux/features/transactions/transactionHistoryApi";
import { formatTime, getPurposeCategory, getTxnStyle } from "@/utils/txn-utils";
import { formatAmount } from "../../utils/txn-utils";
// ✅ TransactionCard.tsx
// Dark theme card — প্রজেক্টের #14041f background এর সাথে মিল
// Icon: deposit/bonus = "+", withdraw = "−"

interface TransactionCardProps {
  txn: ITransaction;
}

export default function TransactionCard({ txn }: TransactionCardProps) {
  const category = getPurposeCategory(txn.purpose);
  const style = getTxnStyle(category);
  const time = formatTime(txn.createdAt);
  const amount = formatAmount(txn.amount);
  const description = txn.description || txn.purpose;

  return (
    <div
      className="flex items-center gap-2 rounded-xl px-2 py-2 mb-2.5"
      style={{
        background: style.cardBg,
        border: `1px solid ${style.borderColor}`,
      }}
    >
      <div className="flex flex-col gap-1.5">
        {/* ── Left: time ── */}
        <div className="shrink-0 w-10">
          <span className="text-[11px] font-semibold text-white/40 leading-none">
            {time}
          </span>
        </div>

        {/* ── Icon circle: +/− ── */}
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[18px] font-black"
          style={{
            background: style.iconBg,
            color: style.iconColor,
            border: `1.5px solid ${style.borderColor}`,
            // ✅ monospace font যাতে + এবং − সমান দেখায়
            fontFamily: "monospace",
            lineHeight: 1,
          }}
        >
          {style.icon}
        </div>
      </div>

      {/* ── Center: description + badge ── */}
      <div className="flex-1 min-w-0">
        <p className="text-[0.70rem] font-medium text-white/85 leading-snug line-clamp-2">
          {description}
        </p>

        {/* Category badge */}
        <span
          className="inline-block mt-1.5 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md"
          style={{
            background: style.iconBg,
            color: style.iconColor,
            border: `1px solid ${style.borderColor}`,
          }}
        >
          {style.badgeLabel}
        </span>
      </div>

      {/* ── Right: amount ── */}
      <div className="shrink-0 ml-1 text-right">
        <span
          className="text-[13px] font-black leading-none whitespace-nowrap"
          style={{ color: style.amountColor }}
        >
          {style.amountPrefix}
          {amount} 💎
        </span>
      </div>
    </div>
  );
}
