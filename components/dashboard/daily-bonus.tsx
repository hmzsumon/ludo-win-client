"use client";

import {
  useClaimDailyBonusMutation,
  useGetDailyBonusStatusQuery,
} from "@/redux/features/promotion/promotionApi";
import toast from "react-hot-toast";

const DailyBonus = () => {
  const { data, isLoading } = useGetDailyBonusStatusQuery();
  const [claimDailyBonus, { isLoading: claiming }] = useClaimDailyBonusMutation();

  const info = data?.data;
  if (!isLoading && !info?.canClaim && !info?.alreadyClaimed) return null;

  const handleClaim = async () => {
    try {
      const res = await claimDailyBonus().unwrap();
      toast.success(res?.message || "Daily bonus claimed");
    } catch (error: any) {
      toast.error(error?.data?.message || "Claim failed");
    }
  };

  return (
    <section className="relative mt-4 flex items-center justify-between overflow-hidden rounded-2xl px-4 py-3.5"
      style={{
        background:
          "linear-gradient(135deg, rgba(53,10,110,0.85) 0%, rgba(29,5,70,0.85) 100%)",
        border: "1px solid rgba(255,215,0,0.25)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
      }}
    >
      {/* ────────── decorative line ────────── */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

      {/* ────────── left content ────────── */}
      <div className="flex items-center gap-3">
        <span className="text-3xl ls-pulse">🎁</span>
        <div>
          <p className="text-sm font-black text-yellow-400">Daily Bonus</p>
          <p className="text-[11px] font-semibold text-white/70">
            {isLoading
              ? "Checking today's bonus..."
              : info?.alreadyClaimed
                ? `Claimed 💎${info?.claimedAmount ?? 0} today`
                : `Eligible now: 💎${info?.claimableAmount ?? 0}`}
          </p>
          {!isLoading && info?.canClaim ? (
            <p className="mt-1 text-[10px] text-white/50">
              Deposit below {info.lowDepositThreshold}: 💎{info.lowReward} • {">="} {info.lowDepositThreshold}: 💎{info.highReward}
            </p>
          ) : null}
        </div>
      </div>

      {/* ────────── action button ────────── */}
      <button
        onClick={handleClaim}
        disabled={!info?.canClaim || claiming || isLoading}
        className="ls-btn ls-btn-gold px-4 py-2 text-[12px] font-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {info?.alreadyClaimed ? "Claimed" : claiming ? "Claiming..." : "Claim"}
      </button>
    </section>
  );
};

export default DailyBonus;
