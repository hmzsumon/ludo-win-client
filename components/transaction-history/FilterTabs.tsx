"use client";

import { TxnFilter } from "@/redux/features/transactions/transactionHistoryApi";

// ✅ FilterTabs.tsx — Dark theme filter tabs

interface FilterTabsProps {
  active: TxnFilter;
  onChange: (filter: TxnFilter) => void;
}

const TABS: {
  key: TxnFilter;
  label: string;
  activeColor: string;
  activeText: string;
}[] = [
  { key: "all", label: "All", activeColor: "#0173e5", activeText: "#fff" },
  {
    key: "deposit",
    label: "Deposit",
    activeColor: "#23ffc8",
    activeText: "#0a2a20",
  },
  {
    key: "withdraw",
    label: "Withdraw",
    activeColor: "#ff5c5c",
    activeText: "#fff",
  },
  {
    key: "bonus",
    label: "Bonus",
    activeColor: "#ffc403",
    activeText: "#1a1000",
  },
];

export default function FilterTabs({ active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="shrink-0 px-4 py-1.5 rounded-xl text-[12px] font-bold transition-all active:scale-95"
            style={{
              background: isActive ? tab.activeColor : "rgba(255,255,255,0.08)",
              color: isActive ? tab.activeText : "rgba(255,255,255,0.45)",
              border: `1px solid ${isActive ? tab.activeColor : "rgba(255,255,255,0.12)"}`,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
