"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

const WalletBalanceCard = () => {
  const { user } = useSelector((s: any) => s.auth) as any;

  return (
    <section
      className="relative w-full rounded-[24px] overflow-hidden p-5"
      style={{
        background:
          "linear-gradient(145deg, rgba(74,26,138,0.85) 0%, rgba(29,5,70,0.9) 100%)",
        border: "1px solid rgba(255,215,0,0.25)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {/* Top shine */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

      {/* Gold glow bg */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] opacity-20"
        style={{
          background: "radial-gradient(ellipse, #ffd700 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Label */}
        <p className="text-[11px] font-black uppercase tracking-widest text-lime-400">
          Total Balance
        </p>

        {/* Big Coin icon */}
        <span className="mt-2 text-5xl ls-float">💰</span>

        {/* Amount */}
        <h2 className="mt-2 text-xl font-black tracking-tight leading-none">
          <span className="text-xl ">💎</span>{" "}
          <span className="text-yellow-300">
            {user?.m_balance?.toLocaleString?.() ?? "0"}
          </span>
        </h2>

        <p className="mt-1 text-[12px] font-semibold text-white/40">
          Available for withdrawal
        </p>

        {/* Action Buttons */}
        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <Link href="/deposit" className="block">
            <button className="ls-btn ls-btn-green ls-shine-effect w-full py-3.5 text-sm font-black">
              ⬆️ Deposit
            </button>
          </Link>
          <Link href="/withdraw" className="block">
            <button className="ls-btn ls-btn-red w-full py-3.5 text-sm font-black">
              ⬇️ Withdraw
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WalletBalanceCard;
