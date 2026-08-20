"use client";

/* ────────────────────────────────────────────────────────────────
   VerifyAccountButton.tsx

   Dashboard এ Deposit / Withdraw button এর উপরে বসবে।
   শুধুমাত্র যাদের email verify করা নেই তারাই এই button দেখবে।
   Click করলে /personal-profile page এ গিয়ে email verify করা যাবে
   এবং 50 diamond welcome bonus claim হবে।
──────────────────────────────────────────────────────────────── */

import { ChevronRight, Gem, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";

const VerifyAccountButton = () => {
  /* ────────── Redux auth state থেকে current user ────────── */
  const { user } = useSelector((s: any) => s.auth) || { user: null };

  /* ────────── Verified flag (snake_case + camelCase দুটোই handle) ────────── */
  const isEmailVerified = Boolean(
    user?.email_verified ?? user?.emailVerified ?? false,
  );

  /* ────────── User load না হওয়া পর্যন্ত কিছু দেখাবে না (flicker guard) ────────── */
  if (!user) return null;

  /* ────────── Email verified হলে button সম্পূর্ণ hidden ────────── */
  if (isEmailVerified) return null;

  return (
    <Link
      href="/personal-profile"
      className="block w-full"
      aria-label="Verify your account and claim 50 diamonds welcome bonus"
    >
      <button
        type="button"
        className="ls-btn ls-btn-logo-gold ls-shine-effect mt-1 w-full px-3.5 py-3 text-left"
      >
        <span className="relative z-10 flex items-center gap-3">
          {/* ────────── Section: Shield badge ────────── */}
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/30 shadow-inner">
            <ShieldCheck className="h-6 w-6 text-[#5a3200]" />
            <Sparkles className="absolute -right-1.5 -top-1.5 h-4 w-4 animate-pulse text-[#0d6efd]" />
          </span>

          {/* ────────── Section: Smart headline + subline ────────── */}
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-black leading-tight text-[#4a2900]">
              Verify Your Account
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-[11px] font-bold leading-tight text-[#6b4300]">
              <Gem className="h-3.5 w-3.5 shrink-0" />
              Claim your 50 Diamond welcome gift
            </span>
          </span>

          {/* ────────── Section: Reward chip + arrow ────────── */}
          <span className="flex shrink-0 items-center gap-1">
            <span className="rounded-full border border-white/60 bg-white/35 px-2.5 py-1 text-[12px] font-black text-[#4a2900] shadow-sm">
              50 💎
            </span>
            <ChevronRight className="h-5 w-5 text-[#5a3200]" />
          </span>
        </span>
      </button>
    </Link>
  );
};

export default VerifyAccountButton;
