const WalletPromoCard = () => {
  return (
    <section className="relative rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,28,102,0.78)_0%,rgba(10,18,62,0.82)_100%)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.28)] backdrop-blur sm:p-5">
      {/* ────────── Notification Badge ────────── */}
      <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff4c79_0%,#d81d58_100%)] text-sm font-black text-white shadow-[0_8px_16px_rgba(0,0,0,0.24)]">
        1
      </div>

      {/* ────────── Card Header ────────── */}
      <div className="flex items-center gap-3">
        <span className="text-[28px]">☁️</span>
        <h3 className="text-[22px] font-black tracking-tight text-white">
          Promo Rewards
        </h3>
      </div>

      {/* ────────── Promo Body ────────── */}
      <div className="mt-5 rounded-[18px] bg-[rgba(255,255,255,0.04)] p-4 ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-4">
          <div className="text-[58px] leading-none">🎁</div>

          <div className="ml-auto text-right">
            <p className="text-[40px] font-black tracking-tight text-[#ffcf45]">
              💎300
            </p>
            <p className="mt-1 text-sm font-medium text-white/65">
              Expires in 12h
            </p>
          </div>
        </div>

        <button className="mt-4 w-full rounded-full bg-[linear-gradient(180deg,#7b55ff_0%,#4d2de0_100%)] px-6 py-3 text-base font-black text-white shadow-[0_10px_20px_rgba(0,0,0,0.24)]">
          Claim
        </button>
      </div>
    </section>
  );
};

export default WalletPromoCard;
