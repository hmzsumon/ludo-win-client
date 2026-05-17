/* ────────────────────────────────────────────────────────────────
   VipRankBadge.tsx
   Reusable VIP rank badge component — profile, cashback page সব জায়গায়
   ────────────────────────────────────────────────────────────── */

"use client";

import React from "react";

/* ────────── Rank এর color + icon config ────────── */
export const VIP_RANK_CONFIG: Record<
  string,
  { color: string; glow: string; bg: string; icon: string; border: string }
> = {
  Copper: {
    icon: "🥉",
    color: "#b87333",
    glow: "rgba(184,115,51,0.6)",
    bg: "rgba(184,115,51,0.15)",
    border: "rgba(184,115,51,0.4)",
  },
  Bronze: {
    icon: "🥈",
    color: "#cd7f32",
    glow: "rgba(205,127,50,0.6)",
    bg: "rgba(205,127,50,0.15)",
    border: "rgba(205,127,50,0.4)",
  },
  Silver: {
    icon: "🥈",
    color: "#c0c0c0",
    glow: "rgba(192,192,192,0.5)",
    bg: "rgba(192,192,192,0.1)",
    border: "rgba(192,192,192,0.35)",
  },
  Gold: {
    icon: "🥇",
    color: "#ffd700",
    glow: "rgba(255,215,0,0.7)",
    bg: "rgba(255,215,0,0.12)",
    border: "rgba(255,215,0,0.4)",
  },
  Ruby: {
    icon: "💎",
    color: "#ff3b6b",
    glow: "rgba(255,59,107,0.6)",
    bg: "rgba(255,59,107,0.12)",
    border: "rgba(255,59,107,0.4)",
  },
  Sapphire: {
    icon: "💠",
    color: "#4a9eff",
    glow: "rgba(74,158,255,0.6)",
    bg: "rgba(74,158,255,0.12)",
    border: "rgba(74,158,255,0.4)",
  },
  Diamond: {
    icon: "💎",
    color: "#00d4ff",
    glow: "rgba(0,212,255,0.6)",
    bg: "rgba(0,212,255,0.12)",
    border: "rgba(0,212,255,0.4)",
  },
  VIP: {
    icon: "👑",
    color: "#ff9f00",
    glow: "rgba(255,159,0,0.7)",
    bg: "rgba(255,159,0,0.15)",
    border: "rgba(255,159,0,0.5)",
  },
  None: {
    icon: "⚪",
    color: "#666",
    glow: "rgba(100,100,100,0.3)",
    bg: "rgba(100,100,100,0.08)",
    border: "rgba(100,100,100,0.2)",
  },
};

/* ────────── Helper: rank config বের করো ────────── */
export const getRankConfig = (rank: string | null | undefined) => {
  if (!rank) return VIP_RANK_CONFIG["None"];
  return VIP_RANK_CONFIG[rank] ?? VIP_RANK_CONFIG["None"];
};

/* ────────── Props ────────── */
interface VipRankBadgeProps {
  rank: string | null | undefined;
  cashback?: number;
  size?: "sm" | "md" | "lg";
  showCashback?: boolean;
  className?: string;
}

/* ────────────────────────────────────────────────────────────────
   VipRankBadge Component
   ────────────────────────────────────────────────────────────── */
const VipRankBadge = ({
  rank,
  cashback,
  size = "md",
  showCashback = true,
  className = "",
}: VipRankBadgeProps) => {
  const cfg = getRankConfig(rank);

  /* ── Size variants ── */
  const sizeMap = {
    sm: { icon: "text-base", text: "text-[11px]", badge: "text-[10px] px-1.5 py-0.5", padding: "px-2 py-1" },
    md: { icon: "text-xl",   text: "text-[14px]", badge: "text-[11px] px-2 py-0.5",   padding: "px-3 py-1.5" },
    lg: { icon: "text-3xl",  text: "text-[18px]", badge: "text-[12px] px-2.5 py-1",   padding: "px-4 py-2" },
  };

  const s = sizeMap[size];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full ${s.padding} ${className}`}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 0 12px ${cfg.glow}`,
      }}
    >
      {/* ── Rank Icon ── */}
      <span className={s.icon}>{cfg.icon}</span>

      {/* ── Rank Name ── */}
      <span
        className={`font-black ${s.text}`}
        style={{ color: cfg.color, textShadow: `0 0 8px ${cfg.glow}` }}
      >
        {rank || "No Rank"}
      </span>

      {/* ── Cashback badge ── */}
      {showCashback && cashback !== undefined && (
        <span
          className={`rounded-full font-black ${s.badge}`}
          style={{
            background: cfg.color,
            color: "#000",
            boxShadow: `0 0 8px ${cfg.glow}`,
          }}
        >
          {cashback}% cashback
        </span>
      )}
    </div>
  );
};

export default VipRankBadge;
