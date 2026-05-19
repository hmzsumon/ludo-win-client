"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

type Props = {
  dashboard?: any;
  isLoading?: boolean;
};

const ProfileWalletCard = ({ dashboard, isLoading }: Props) => {
  const { user } = useSelector((state: any) => state.auth);
  const balance = Number(user?.m_balance ?? 0);

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-white/50 bg-white/30 p-4 shadow-[0_14px_34px_rgba(0,92,190,0.18)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,243,74,0.95),rgba(35,217,255,0.9),rgba(255,255,255,0))]" />
      <div className="absolute -right-12 -top-10 h-32 w-32 rounded-full bg-yellow-200/35 blur-2xl" />
      <div className="absolute -left-12 bottom-0 h-28 w-28 rounded-full bg-cyan-300/25 blur-2xl" />

      <div className="relative mb-4 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/45 bg-[linear-gradient(180deg,#fff34a_0%,#ffc300_100%)] text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_18px_rgba(231,162,0,0.18)]">
          💎
        </span>
        <h3 className="text-[17px] font-black text-[#073d95]">Wallet</h3>
      </div>

      <div className="relative rounded-[22px] border border-white/55 bg-[linear-gradient(135deg,rgba(35,217,255,0.35)_0%,rgba(255,255,255,0.55)_48%,rgba(255,243,74,0.28)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(0,90,190,0.12)]">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0474d5]/70">
          Total Balance
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h4 className="text-[31px] font-black leading-none text-[#063f9a] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
            {isLoading ? "Loading..." : `💎 ${balance.toLocaleString()}`}
          </h4>
          <span className="rounded-full border border-white/60 bg-white/45 px-3 py-1 text-[10px] font-black text-[#0474d5]">
            LIVE
          </span>
        </div>
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2.5">
        <Link href="/deposit" className="block">
          <button className="w-full rounded-2xl border border-white/45 bg-[linear-gradient(180deg,#23e66e_0%,#08a94d_100%)] px-3 py-3 text-[13px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_7px_0_rgba(0,93,45,0.7),0_12px_22px_rgba(0,107,60,0.18)] transition active:translate-y-1 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_3px_0_rgba(0,93,45,0.7)]">
            ⬆️ Deposit
          </button>
        </Link>
        <Link href="/withdraw" className="block">
          <button className="w-full rounded-2xl border border-white/45 bg-[linear-gradient(180deg,#ff7b7b_0%,#ef174d_100%)] px-3 py-3 text-[13px] font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_7px_0_rgba(135,0,37,0.72),0_12px_22px_rgba(239,23,77,0.16)] transition active:translate-y-1 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_3px_0_rgba(135,0,37,0.72)]">
            ⬇️ Withdraw
          </button>
        </Link>
      </div>
    </section>
  );
};

export default ProfileWalletCard;
