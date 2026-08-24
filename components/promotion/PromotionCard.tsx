"use client";

import Link from "next/link";
import { useState } from "react";
import { PromotionItem } from "./promotion-data";

const PromotionCard = ({ item }: { item: PromotionItem }) => {
  const [open, setOpen] = useState(false);
  const { accent } = item;

  return (
    <section
      className="relative overflow-hidden rounded-[22px] p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(45,15,80,0.85) 0%, rgba(15,3,35,0.92) 100%)",
        border: `1px solid ${accent.border}`,
        boxShadow: `0 10px 30px rgba(0,0,0,0.4), 0 0 24px ${accent.glow}20`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 text-left"
        aria-expanded={open}
      >
        {/* Icon */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ls-float"
          style={{
            background: accent.chipBg,
            border: `1px solid ${accent.border}`,
            boxShadow: `0 0 16px ${accent.glow}`,
          }}
        >
          {item.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-black text-white">
              {item.title}
            </h3>
          </div>
          <p className="mt-0.5 truncate text-[12px] font-semibold text-white/50">
            {item.teaser}
          </p>
        </div>

        {/* Stat chip */}
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black whitespace-nowrap"
          style={{ background: accent.chipBg, color: accent.chipColor }}
        >
          {item.stat}
        </span>

        {/* Chevron */}
        <span
          className="shrink-0 text-white/40 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▾
        </span>
      </button>

      {/* Expandable details */}
      <div
        className="grid transition-all duration-300 ease-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
            {item.details.map((line, idx) => (
              <p
                key={idx}
                className="flex items-start gap-2 text-[12.5px] font-medium leading-relaxed text-white/70"
              >
                <span style={{ color: accent.chipColor }}>•</span>
                <span>{line}</span>
              </p>
            ))}

            <Link href={item.ctaHref} className="block pt-2">
              <button
                className={`ls-btn ${accent.btnClass} ls-shine-effect w-full py-2.5 text-[13px] font-black`}
              >
                {item.ctaLabel} →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionCard;
