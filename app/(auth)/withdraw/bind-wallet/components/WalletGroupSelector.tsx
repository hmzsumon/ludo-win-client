"use client";
import React from "react";
import { WalletGroup } from "../page";

type Props = {
  group: WalletGroup; onChange: (g: WalletGroup) => void;
  bkashIcon: React.ReactNode; nagadIcon: React.ReactNode;
};

const WalletGroupSelector: React.FC<Props> = ({ group, onChange, bkashIcon, nagadIcon }) => (
  <div>
    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
      Select E-wallet
    </p>
    <div className="flex gap-3">
      {([["bkash", bkashIcon, "#E2136E", "rgba(226,19,110,0.2)"], ["nagad", nagadIcon, "#F7941D", "rgba(247,148,29,0.2)"]] as const).map(([key, icon, color, glow]) => (
        <button key={key} type="button" onClick={() => onChange(key as WalletGroup)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-150"
          style={{
            background: group === key ? `linear-gradient(135deg,rgba(67,11,88,0.9),rgba(34,7,54,0.95))` : "rgba(255,255,255,0.04)",
            border: group === key ? `1.5px solid ${color}` : "1.5px solid rgba(255,255,255,0.08)",
            boxShadow: group === key ? `0 0 14px ${glow}` : "none",
          }}>
          {icon}
        </button>
      ))}
    </div>
  </div>
);

export default WalletGroupSelector;
