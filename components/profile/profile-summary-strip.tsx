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
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-2">
      {summaryItems.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-[20px] border border-white/45 bg-white/30 px-2 py-3 text-center shadow-[0_10px_22px_rgba(0,91,190,0.14)] backdrop-blur-xl"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/80" />
          <div className="absolute -top-8 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-cyan-300/25 blur-xl" />

          <span className="relative text-xl drop-shadow">{item.icon}</span>
          <h4 className="relative mt-1 truncate text-[15px] font-black leading-tight text-[#063f9a]">
            {item.value}
          </h4>
          <p className="relative mt-0.5 text-[9px] font-black uppercase tracking-wide text-[#0671cf]/70">
            {item.label}
          </p>
        </div>
      ))}
    </section>
  );
};

export default ProfileSummaryStrip;
