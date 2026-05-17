type QuickGameCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  bgClass: string;
};

const QuickGameCard = ({
  title,
  subtitle,
  icon,
  bgClass,
}: QuickGameCardProps) => {
  return (
    <button
      className={`flex  items-center gap-3 rounded-[22px] px-4 py-2 text-left shadow-[0_12px_26px_rgba(0,0,0,0.32)] ring-1 ring-white/10 ${bgClass}`}
    >
      <span className="text-[46px]">{icon}</span>

      <div>
        <h3 className="text-[18px] font-extrabold tracking-tight text-white">
          {title}
        </h3>
        <p className="mt-1 text-[16px] font-extrabold text-[#ffd33e]">
          {subtitle}
        </p>
      </div>
    </button>
  );
};

const QuickGames = () => {
  return (
    <section>
      {/* ────────── Section Header ────────── */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[24px] font-extrabold tracking-tight text-white">
          Quick Games
        </h2>
      </div>

      {/* ────────── Quick Game Grid ────────── */}
      <div className="grid grid-cols-1 gap-3">
        <QuickGameCard
          title="1v1 Match"
          subtitle="Play Now"
          icon="🎯"
          bgClass="bg-[linear-gradient(180deg,#f0a12f_0%,#b65b10_100%)]"
        />
        <QuickGameCard
          title="Tournament"
          subtitle="• Join Now"
          icon="🏆"
          bgClass="bg-[linear-gradient(180deg,#f54961_0%,#a11434_100%)]"
        />
        <QuickGameCard
          title="Pass N' Play"
          subtitle="🪙"
          icon="🫂"
          bgClass="bg-[linear-gradient(180deg,#25c24a_0%,#14802d_100%)]"
        />
      </div>
    </section>
  );
};

export default QuickGames;
