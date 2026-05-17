type Props = {
  dashboard?: any;
  isLoading?: boolean;
};

const ProfileStatisticsCard = ({ dashboard, isLoading }: Props) => {
  const stats = [
    {
      label: "Total Matches",
      value: String(dashboard?.statistics?.totalMatches ?? 0),
      icon: "🎮",
      color: "#ffffff",
    },
    {
      label: "Wins",
      value: String(dashboard?.statistics?.wins ?? 0),
      icon: "🏆",
      color: "#4cde7e",
    },
    {
      label: "Losses",
      value: String(dashboard?.statistics?.losses ?? 0),
      icon: "💔",
      color: "#ff6b6b",
    },
    {
      label: "Win Streak",
      value: String(dashboard?.statistics?.winStreak ?? 0),
      icon: "🔥",
      color: "#55c7ff",
    },
  ];

  const winRate = Number(dashboard?.statistics?.winRate ?? 0);

  return (
    <section
      className="relative rounded-[20px] overflow-hidden p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(74,26,138,0.6) 0%, rgba(29,5,70,0.7) 100%)",
        border: "1px solid rgba(255,215,0,0.15)",
        boxShadow:
          "0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📊</span>
        <h3 className="text-[17px] font-black text-white">Statistics</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center rounded-xl py-3 px-2 text-center"
            style={{
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <h4
              className="text-[22px] font-black leading-none"
              style={{ color: item.color }}
            >
              {isLoading ? "..." : item.value}
            </h4>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-black uppercase tracking-widest text-yellow-400/70">
            Win Rate
          </span>
          <span className="text-[11px] font-black text-green-400">
            {isLoading ? "..." : `${winRate}%`}
          </span>
        </div>

        <div
          className="h-2 w-full rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, winRate))}%`,
              background: "linear-gradient(90deg, #4cde7e, #1db954)",
              boxShadow: "0 0 8px rgba(76,222,126,0.5)",
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ProfileStatisticsCard;
