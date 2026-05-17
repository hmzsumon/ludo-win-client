"use client";

import { useSelector } from "react-redux";

const WalletReferralCard = () => {
  const { user } = useSelector((s: any) => s.auth) as any;
  const referralCode = user?.customerId || "LUDO2024";

  return (
    <section
      className="relative rounded-[20px] overflow-hidden p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(74,26,138,0.6) 0%, rgba(29,5,70,0.7) 100%)",
        border: "1px solid rgba(255,215,0,0.2)",
        boxShadow:
          "0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Shine line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">👥</span>
        <h3 className="text-[17px] font-black text-white">Referral Bonus</h3>
      </div>

      {/* Earnings Row */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)",
          border: "1px solid rgba(255,215,0,0.2)",
        }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400/60">
            Total Earned
          </p>
          <h4 className="text-[26px] font-black text-yellow-400 leading-tight">
            💎500
          </h4>
          <p className="text-[11px] text-white/40 font-semibold">
            5 friends referred
          </p>
        </div>
        <span className="text-5xl ls-float">🎁</span>
      </div>

      {/* Referral Code Box */}
      <div
        className="flex items-center justify-between rounded-xl px-3 py-2.5 mb-3"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400/50">
            Your Code
          </p>
          <p className="text-[16px] font-black text-white tracking-widest">
            {referralCode}
          </p>
        </div>
        <button
          className="ls-btn px-3 py-1.5 text-[11px] font-black text-yellow-400"
          style={{
            background: "rgba(255,215,0,0.15)",
            border: "1px solid rgba(255,215,0,0.3)",
            boxShadow: "none",
            borderRadius: "8px",
          }}
        >
          Copy
        </button>
      </div>

      {/* Invite Button */}
      <button className="ls-btn ls-btn-gold ls-shine-effect w-full py-3 text-[14px] font-black">
        🎉 Invite Friends & Earn 💎100
      </button>
    </section>
  );
};

export default WalletReferralCard;
