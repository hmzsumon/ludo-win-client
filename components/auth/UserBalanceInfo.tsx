"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { useSelector } from "react-redux";

const UserBalanceInfo = () => {
  const { user } = useSelector((state: any) => state.auth);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="text-white">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white/70">Email :</p>
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-white">
              {user?.email}
            </span>
            <button
              onClick={() => handleCopy(user?.email)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Copy email"
              type="button"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white/70">UID :</p>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">
              {user?.customerId}
            </span>
            <button
              onClick={() => handleCopy(user?.customerId)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
              aria-label="Copy uid"
              type="button"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">
          Balance
        </p>
        <h3 className="mt-1 text-base font-extrabold text-white">
          💎 {(user?.m_balance || 0.0).toFixed(2)}
        </h3>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link
          href="/deposit"
          className="
            group relative overflow-hidden rounded-2xl
            border border-cyan-300/20
            bg-[linear-gradient(180deg,#59d8ff_0%,#1ca7ec_55%,#0b63ce_100%)]
            px-4 py-4 text-white
            shadow-[0_10px_24px_rgba(0,0,0,0.22)]
            transition duration-200 hover:brightness-105
          "
        >
          <span className="absolute inset-x-1 top-1 h-[52%] rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,.42),rgba(255,255,255,0))]" />
          <span className="flex items-center justify-center ">
            <span>
              <span className="block text-sm font-extrabold tracking-wide">
                Deposit
              </span>
            </span>
          </span>
        </Link>

        <Link
          href="/withdraw"
          className="
            group relative overflow-hidden rounded-2xl
            border border-white/10
            bg-[linear-gradient(180deg,#22336d_0%,#182654_55%,#0f1738_100%)]
            px-4 py-4 text-white
            shadow-[0_10px_24px_rgba(0,0,0,0.22)]
            transition duration-200 hover:border-cyan-300/25 hover:brightness-105
          "
        >
          <span className="absolute inset-x-1 top-1 h-[52%] rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,0))]" />
          <span className="relative flex items-center justify-center ">
            <span>
              <span className="block text-sm font-extrabold tracking-wide">
                Withdraw
              </span>
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default UserBalanceInfo;
