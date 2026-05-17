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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent" />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💰</span>
        <h3 className="text-[17px] font-black text-white">Wallet</h3>
      </div>

      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)",
          border: "1px solid rgba(255,215,0,0.2)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl ls-coin">🪙</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400/60">
              Total Balance
            </p>
            <h4 className="text-[28px] font-black text-yellow-400 leading-tight">
              {isLoading ? "Loading..." : `💎 ${balance.toLocaleString()}`}
            </h4>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link href="/deposit" className="block">
          <button className="ls-btn ls-btn-green ls-shine-effect w-full py-2.5 text-[13px] font-black">
            ⬆️ Deposit
          </button>
        </Link>
        <Link href="/withdraw" className="block">
          <button className="ls-btn ls-btn-red w-full py-2.5 text-[13px] font-black">
            ⬇️ Withdraw
          </button>
        </Link>
      </div>
    </section>
  );
};

export default ProfileWalletCard;
