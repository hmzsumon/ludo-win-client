/* ─────────────────────────────────────────────
   📁 profile-summary-strip.tsx
   Live overview strip
───────────────────────────────────────────── */

type Props = {
  dashboard?: any;
  isLoading?: boolean;
};

const ProfileSummaryStrip = ({ dashboard, isLoading }: Props) => {
  const summaryItems = [
    {
      label: "Matches",
      value: isLoading ? "..." : String(dashboard?.overview?.matches ?? 0),
      icon: "🏆",
      color: "#ffd700",
      glow: "rgba(255,215,0,0.3)",
    },
    // {
    //   label: "Win Rate",
    //   value: isLoading ? "..." : `${dashboard?.overview?.winRate ?? 0}%`,
    //   icon: "🔥",
    //   color: "#ff6b35",
    //   glow: "rgba(255,107,53,0.3)",
    // },
    // {
    //   label: "Earnings",
    //   value: isLoading
    //     ? "..."
    //     : `💎${Number(dashboard?.overview?.earnings ?? 0).toLocaleString()}`,
    //   icon: "🪙",
    //   color: "#4cde7e",
    //   glow: "rgba(76,222,126,0.3)",
    // },
  ];

  return (
    <section className="grid grid-cols-1 gap-2">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="relative flex flex-col items-center justify-center rounded-2xl px-2 py-4 text-center overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(74,26,138,0.6) 0%, rgba(29,5,70,0.7) 100%)",
            border: `1px solid ${item.color}30`,
            boxShadow: `0 6px 20px rgba(0,0,0,0.4), 0 0 0 1px ${item.color}10`,
          }}
        >
          <div
            className="absolute inset-0 opacity-10 rounded-2xl"
            style={{
              background: `radial-gradient(circle at center, ${item.color} 0%, transparent 70%)`,
            }}
          />

          <span className="text-2xl mb-1">{item.icon}</span>
          <h4
            className="text-[20px] font-black leading-tight"
            style={{ color: item.color, textShadow: `0 0 10px ${item.glow}` }}
          >
            {item.value}
          </h4>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider mt-0.5">
            {item.label}
          </p>
        </div>
      ))}
    </section>
  );
};

export default ProfileSummaryStrip;
