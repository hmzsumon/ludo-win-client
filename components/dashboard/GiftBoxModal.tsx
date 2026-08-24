"use client";

/* ────────────────────────────────────────────────────────────────
   GiftBoxModal.tsx

   Daily Login Gift Box — প্রতিদিন প্রথমবার dashboard লোড হলে দেখাবে।
   ✅ AccountVerificationModal.tsx এর hand-rolled overlay প্যাটার্ন
      অনুসরণ করা হয়েছে (এই প্রজেক্টে shadcn Dialog নেই)
   ✅ canClaim (server truth) থাকলেই শুধু open হয়; sessionStorage flag
      শুধু একই দিনে বারবার popup আটকায় — access কখনো grant করে না
   ✅ যেকোনো box ক্লিক করলে server-authoritative reward credit হয়,
      বাকি ৫টা box শুধু decorative (uncredited) amount দেখায় ও disable থাকে
   ✅ dismiss flag customerId দিয়ে scoped — একই ব্রাউজারে একাধিক অ্যাকাউন্ট
      login করলে (device শেয়ার করলেও) প্রত্যেক অ্যাকাউন্ট আলাদাভাবে modal
      দেখতে ও claim করতে পারবে; sessionStorage শুধু একটা origin-wide store,
      তাই key-তে customerId না রাখলে account-A dismiss করলে account-B এর
      জন্যও ভুলভাবে modal লুকিয়ে যেত
──────────────────────────────────────────────────────────────── */

import {
  useClaimGiftBoxMutation,
  useGetGiftBoxStatusQuery,
} from "@/redux/features/giftBox/giftBoxApi";
import { Gem, Gift, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const dismissKey = (todayKey: string, customerId: string) =>
  `ludowin_giftbox_dismissed_${todayKey}_${customerId}`;

type BoxState = "idle" | "revealed";

export default function GiftBoxModal() {
  const { data, isLoading } = useGetGiftBoxStatusQuery();
  const [claimGiftBox, { isLoading: claiming }] = useClaimGiftBoxMutation();

  const info = data?.data;
  const todayKey = info?.todayKey || "";
  const customerId = info?.customerId || "";

  const [open, setOpen] = useState(false);
  const [boxState, setBoxState] = useState<BoxState>("idle");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [amounts, setAmounts] = useState<number[] | null>(null);
  const [isJackpot, setIsJackpot] = useState(false);

  /* ────────── decide whether to auto-open (server truth + per-day dismiss flag) ────────── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!info || isLoading) return;
    if (!info.canClaim) return;
    if (!info.customerId) return;

    const dismissed =
      window.sessionStorage.getItem(
        dismissKey(info.todayKey, info.customerId),
      ) === "true";
    if (!dismissed) setOpen(true);
  }, [info, isLoading]);

  const boxIndexes = useMemo(() => [0, 1, 2, 3, 4, 5], []);

  const closeModal = () => {
    if (todayKey && customerId) {
      window.sessionStorage.setItem(dismissKey(todayKey, customerId), "true");
    }
    setOpen(false);
  };

  const handleBoxClick = async (index: number) => {
    if (boxState !== "idle" || claiming) return;
    setSelectedIndex(index);

    try {
      const res = await claimGiftBox().unwrap();
      const { claimedAmount, decoyAmounts, isJackpot: jackpot } = res.data;

      /* ────────── clicked box → real reward, others → shuffled decoys ────────── */
      const nextAmounts: number[] = new Array(6).fill(0);
      nextAmounts[index] = claimedAmount;
      let d = 0;
      for (let i = 0; i < 6; i++) {
        if (i === index) continue;
        nextAmounts[i] = decoyAmounts[d++] ?? 0;
      }

      setAmounts(nextAmounts);
      setIsJackpot(jackpot);
      setBoxState("revealed");
      if (todayKey && customerId) {
        window.sessionStorage.setItem(dismissKey(todayKey, customerId), "true");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Gift box claim failed");
      setSelectedIndex(null);
    }
  };

  if (!open) return null;

  return (
    <div className="gb-overlay">
      {/* ────────── Section: Dark blur backdrop ────────── */}
      <button
        type="button"
        aria-label="Close gift box"
        onClick={closeModal}
        className="absolute inset-0 cursor-default bg-transparent"
      />

      <section className="gb-modal">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-fuchsia-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />

        {/* Close button */}
        <button
          type="button"
          onClick={closeModal}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="relative text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-yellow-300/35 bg-[linear-gradient(145deg,rgba(255,221,75,0.24),rgba(255,111,0,0.08))] shadow-[0_0_36px_rgba(255,202,40,0.18)]">
            <Gift className="ls-pulse h-8 w-8 text-yellow-300" />
          </div>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
            Daily Login Reward
          </p>
          <h2 className="mt-1 text-xl font-black text-white">
            {boxState === "idle" ? "Open Your Gift Box!" : "🎁 Reward Revealed"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-[300px] text-[13px] font-semibold text-white/60">
            {boxState === "idle"
              ? "Pick any box below — one lucky box is yours today."
              : isJackpot
                ? "🎉 JACKPOT! Come back tomorrow for another chance."
                : "Come back tomorrow for another gift box."}
          </p>
        </div>

        {/* Result banner */}
        {boxState === "revealed" && selectedIndex !== null && amounts && (
          <div
            className={`relative mt-4 flex items-center justify-center gap-3 rounded-2xl border px-4 py-3 ${
              isJackpot
                ? "border-yellow-300/40 bg-yellow-300/15"
                : "border-yellow-300/25 bg-yellow-300/10"
            }`}
          >
            <Gem className="h-8 w-8 fill-cyan-300/20 text-cyan-300" />
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-200/70">
                You Won
              </p>
              <p className="text-xl font-black text-yellow-300">
                💎{amounts[selectedIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Box grid */}
        <div className="gb-grid relative mt-5">
          {boxIndexes.map((index) => {
            const isSelected = selectedIndex === index;
            const isRevealed = boxState === "revealed";
            const showAmount = isRevealed && amounts;

            return (
              <button
                key={index}
                type="button"
                disabled={boxState !== "idle" || claiming}
                onClick={() => handleBoxClick(index)}
                className={[
                  "gb-box",
                  boxState === "idle" ? "ls-box-idle ls-float" : "",
                  isRevealed && isSelected ? "ls-box-winner" : "",
                  isRevealed && !isSelected ? "ls-box-flip-in gb-box-decoy" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={
                  isRevealed && !isSelected
                    ? { animationDelay: `${0.08 * index}s` }
                    : undefined
                }
              >
                {showAmount ? (
                  <span
                    className={`text-sm font-black ${
                      isSelected ? "text-yellow-300" : "text-white/70"
                    }`}
                  >
                    💎{amounts![index]}
                  </span>
                ) : claiming && isSelected ? (
                  <span className="ls-pulse text-2xl">🎁</span>
                ) : (
                  <span className="text-3xl">🎁</span>
                )}
              </button>
            );
          })}
        </div>

        {boxState === "revealed" ? (
          <button
            type="button"
            onClick={closeModal}
            className="ls-btn ls-btn-gold ls-shine-effect mt-6 w-full py-3.5 text-[16px] font-black"
          >
            Awesome, Continue
          </button>
        ) : (
          <p className="mt-5 text-center text-[11px] font-semibold text-white/35">
            One gift box per day. Choose wisely!
          </p>
        )}
      </section>
    </div>
  );
}
