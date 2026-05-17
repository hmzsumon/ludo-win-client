"use client";

import Link from "next/link";
import DailyBonus from "./daily-bonus";

type ModeCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  gradient: string;
  shadowColor: string;
  borderColor: string;
  href: string;
};

const ModeCard = ({
  title,
  subtitle,
  icon,
  badge,
  gradient,
  shadowColor,
  borderColor,
  href,
}: ModeCardProps) => {
  return (
    <Link href={href} className="block w-full">
      <div
        className="ls-shine-effect relative flex items-center gap-4 rounded-2xl px-4 py-4 overflow-hidden"
        style={{
          background: gradient,
          border: `1px solid ${borderColor}`,
          boxShadow: `0 8px 0 ${shadowColor}, 0 12px 28px rgba(0,0,0,0.45)`,
        }}
      >
        {/* Top shine line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Icon Box */}
        <div
          className="shrink-0 flex h-14 w-14 items-center justify-center rounded-xl text-[32px]"
          style={{
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
          }}
        >
          {icon}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[18px] font-black text-white">{title}</h3>
            {badge && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-black uppercase"
                style={{
                  background: "rgba(255,215,0,0.2)",
                  color: "#ffd700",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-[12px] font-semibold text-white/60 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Arrow */}
        <div
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-white font-black"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          ›
        </div>
      </div>
    </Link>
  );
};

const ModeCards = () => {
  return (
    <section className="w-full space-y-4">
      <h2
        className="text-center text-[13px] font-black uppercase tracking-widest"
        style={{ color: "rgba(255,215,0,0.7)" }}
      >
        ✦ Choose Your Mode ✦
      </h2>

      <ModeCard
        title="Play Online"
        subtitle="Match with real players worldwide"
        icon="🌐"
        badge="Live"
        gradient="linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)"
        shadowColor="#0a3880"
        borderColor="rgba(91,164,255,0.3)"
        href="/online"
      />

      <ModeCard
        title="Play Offline"
        subtitle="Play with friends on one device"
        icon="🎮"
        gradient="linear-gradient(135deg, #b71c1c 0%, #7f0000 100%)"
        shadowColor="#5c0000"
        borderColor="rgba(255,107,107,0.3)"
        href="/offline"
      />

      <ModeCard
        title="2 Player Mode"
        subtitle="1v1 battle — winner takes all!"
        icon="⚔️"
        badge="Hot"
        gradient="linear-gradient(135deg, #5b21b6 0%, #3b0764 100%)"
        shadowColor="#2e0050"
        borderColor="rgba(171,95,255,0.3)"
        href="/online"
      />

      {/* ── Daily deposit bonus claim section ── */}
      <DailyBonus />
    </section>
  );
};

export default ModeCards;
