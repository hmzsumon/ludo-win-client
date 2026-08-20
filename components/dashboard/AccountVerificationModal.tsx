"use client";

/* ────────────────────────────────────────────────────────────────
   AccountVerificationModal.tsx

   নতুন registration সফল হওয়ার পরে একবার dashboard-এ দেখাবে।
   Verify button user-কে Personal Profile page-এ নিয়ে যাবে।
──────────────────────────────────────────────────────────────── */

import { Gem, ShieldCheck, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const VERIFICATION_MODAL_KEY = "ludowin_show_account_verification";

export default function AccountVerificationModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  /* ────────── Registration flag থেকে modal open ────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;

    setOpen(
      window.sessionStorage.getItem(VERIFICATION_MODAL_KEY) === "true",
    );
  }, []);

  /* ────────── Close handler: current session-এ আর দেখাবে না ────────── */
  const closeModal = () => {
    window.sessionStorage.removeItem(VERIFICATION_MODAL_KEY);
    setOpen(false);
  };

  /* ────────── Verify handler: Personal Profile page open ────────── */
  const goToVerification = () => {
    window.sessionStorage.removeItem(VERIFICATION_MODAL_KEY);
    setOpen(false);
    router.push("/personal-profile");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      {/* ────────── Section: Dark blur backdrop ────────── */}
      <button
        type="button"
        aria-label="Close verification message"
        onClick={closeModal}
        className="absolute inset-0 cursor-default bg-[#090016]/82 backdrop-blur-md"
      />

      {/* ────────── Section: Welcome verification card ────────── */}
      <section className="relative w-full max-w-[390px] overflow-hidden rounded-[32px] border border-fuchsia-300/25 bg-[linear-gradient(145deg,#35105f_0%,#18052f_58%,#0c021b_100%)] p-6 text-center shadow-[0_30px_90px_rgba(0,0,0,0.68)]">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

        {/* Close button */}
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Verification badge */}
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-yellow-300/35 bg-[linear-gradient(145deg,rgba(255,221,75,0.24),rgba(255,111,0,0.08))] shadow-[0_0_40px_rgba(255,202,40,0.18)]">
          <ShieldCheck className="h-12 w-12 text-yellow-300" />
          <Sparkles className="absolute -right-2 -top-2 h-7 w-7 text-cyan-300" />
        </div>

        {/* Main message */}
        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
          One more rewarding step
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Verify Your Account
        </h2>
        <p className="mx-auto mt-3 max-w-[300px] text-sm font-semibold leading-6 text-white/65">
          Verify your email from Personal Profile and receive a special welcome
          reward instantly.
        </p>

        {/* 50 diamond bonus highlight */}
        <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 px-4 py-3">
          <Gem className="h-8 w-8 fill-cyan-300/20 text-cyan-300" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200/70">
              Welcome Bonus
            </p>
            <p className="text-xl font-black text-yellow-300">50 Diamonds</p>
          </div>
        </div>

        {/* Verify action */}
        <button
          type="button"
          onClick={goToVerification}
          className="ls-btn ls-btn-green ls-shine-effect mt-6 w-full py-3.5 text-[16px] font-black"
        >
          Verify &amp; Claim 50 💎
        </button>

        <p className="mt-3 text-[11px] font-semibold text-white/35">
          You can continue using your account without verification.
        </p>
      </section>
    </div>
  );
}
