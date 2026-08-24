"use client";

/* ────────────────────────────────────────────────────────────────
   PromotionShell.tsx

   ✅ প্রজেক্টের সব bonus/promotion একজায়গায় — "smart" accordion cards
   ✅ BottomNav এখানে বসানো হয়নি — app/(auth)/layout.tsx (DashboardLayoutShell)
      ইতিমধ্যে প্রতিটা authenticated route-এ globally BottomNav রেন্ডার করে,
      এখানে আবার বসালে ডাবল bottom-nav দেখাবে
   ────────────────────────────────────────────────────────────── */

import Link from "next/link";
import { PROMOTIONS } from "./promotion-data";
import PromotionCard from "./PromotionCard";

const PromotionShell = () => {
  return (
    <main className="min-h-screen w-full text-white ls-stars-bg">
      <div className="relative min-h-screen w-full pb-28">
        {/* ── Glow blobs ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #ff5fe1 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-[45%] right-[-60px] w-[200px] h-[200px] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, #ffc403 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[430px] px-4 pt-5">
          {/* ── Hero header ── */}
          <div className="mb-5 text-center">
            <span className="text-4xl ls-pulse">🔥</span>
            <h1 className="mt-2 text-[22px] font-black text-white">
              Promotions &amp; Rewards
            </h1>
            <p className="mx-auto mt-1.5 max-w-[300px] text-[13px] font-semibold text-white/50">
              Every way LudoWin pays you back — tap any card for full
              details.
            </p>
          </div>

          {/* ── Promotion cards ── */}
          <div className="flex flex-col gap-3">
            {PROMOTIONS.map((item) => (
              <PromotionCard key={item.id} item={item} />
            ))}
          </div>

          {/* ── Become an Agent CTA ── */}
          <section
            className="relative mt-5 overflow-hidden rounded-[22px] p-5 text-center"
            style={{
              background:
                "linear-gradient(145deg, rgba(16,185,129,0.18) 0%, rgba(29,5,70,0.92) 100%)",
              border: "1px solid rgba(16,185,129,0.4)",
              boxShadow: "0 0 30px rgba(16,185,129,0.15)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent" />
            <span className="text-3xl ls-float">🤝</span>
            <h2 className="mt-2 text-[16px] font-black text-white">
              Turn Your Phone Into Income
            </h2>
            <p className="mx-auto mt-1 max-w-[300px] text-[12.5px] font-semibold text-white/55">
              Become a LudoWin Agent and earn commission on every deposit
              &amp; withdraw you process — starting today.
            </p>
            <Link href="/become-agent" className="mt-4 block">
              <button className="ls-btn ls-btn-green ls-shine-effect w-full py-3 text-[14px] font-black">
                💼 Become an Agent — Apply Now
              </button>
            </Link>
          </section>

          {/* ── Footer note ── */}
          <p className="mt-6 text-center text-[11px] font-semibold text-white/30">
            Bonus diamonds may require turnover before withdrawal. See each
            offer for details.
          </p>
        </div>
      </div>
    </main>
  );
};

export default PromotionShell;
