const HeroSection = () => {
  return (
    <section
      className="relative flex w-full items-center justify-between rounded-3xl overflow-hidden px-5 py-5"
      style={{
        background:
          "linear-gradient(135deg, rgba(74,26,138,0.6) 0%, rgba(29,5,70,0.7) 100%)",
        border: "1px solid rgba(255,215,0,0.15)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Decorative shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

      {/* ── Left: Text ── */}
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-widest text-yellow-400/80 mb-1">
          🎲 Online Tournament
        </p>
        <h1 className="text-[28px] font-black leading-tight text-white">
          Play Ludo &
        </h1>
        <h1 className="text-[38px] font-black leading-tight ls-gold-text">
          Win Big!
        </h1>
        <p className="mt-2 text-[12px] font-semibold text-white/60">
          Challenge Friends & Earn Rewards!
        </p>
      </div>

      {/* ── Right: Dice illustration ── */}
      <div className="shrink-0 ls-float">
        <div className="relative">
          {/* Glow behind dice */}
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-60"
            style={{
              background:
                "radial-gradient(circle, #ffd700 0%, transparent 70%)",
            }}
          />
          <div
            className="relative text-[72px] leading-none rounded-2xl flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #4a1a8a 0%, #2d0a5e 100%)",
              border: "2px solid rgba(255,215,0,0.4)",
              boxShadow:
                "0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
              width: 80,
              height: 80,
            }}
          >
            🎲
          </div>
          {/* Stars around dice */}
          <span
            className="absolute -top-2 -right-2 text-yellow-400 text-sm animate-spin"
            style={{ animationDuration: "4s" }}
          >
            ⭐
          </span>
          <span className="absolute -bottom-1 -left-2 text-yellow-300 text-xs">
            ✨
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
