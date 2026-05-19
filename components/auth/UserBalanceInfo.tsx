"use client";

import { Check, Copy, Diamond, Download, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";

type CopiedType = "email" | "uid" | null;

const UserBalanceInfo = () => {
  const { user } = useSelector((state: any) => state.auth);
  const [copied, setCopied] = useState<CopiedType>(null);

  const handleCopy = async (type: Exclude<CopiedType, null>, text?: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);

      window.setTimeout(() => {
        setCopied((current) => (current === type ? null : current));
      }, 1600);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const CopyButton = ({
    type,
    text,
    label,
  }: {
    type: Exclude<CopiedType, null>;
    text?: string;
    label: string;
  }) => {
    const isCopied = copied === type;

    return (
      <button
        onClick={() => handleCopy(type, text)}
        className={`
          relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border
          transition-all duration-300 active:scale-95
          ${
            isCopied
              ? "border-emerald-200 bg-emerald-500 text-white shadow-[0_8px_18px_rgba(16,185,129,0.28)]"
              : "border-sky-100 bg-white/75 text-[#0877d7] shadow-sm hover:bg-white hover:shadow-md"
          }
        `}
        aria-label={label}
        type="button"
      >
        {isCopied ? (
          <Check className="h-4 w-4 stroke-[3]" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}

        <span
          className={`
            pointer-events-none absolute -top-8 right-0 rounded-full px-2.5 py-1
            text-[10px] font-black tracking-wide text-white shadow-lg
            transition-all duration-300
            ${
              isCopied
                ? "translate-y-0 scale-100 bg-emerald-500 opacity-100"
                : "translate-y-1 scale-90 bg-emerald-500 opacity-0"
            }
          `}
        >
          Copied!
        </span>
      </button>
    );
  };

  return (
    <div>
      <div className="grid gap-2.5">
        <div className="rounded-2xl border border-white/65 bg-white/42 px-3 py-2.5 shadow-sm backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            Email
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
              {user?.email || "Not available"}
            </span>

            <CopyButton type="email" text={user?.email} label="Copy email" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/65 bg-white/42 px-3 py-2.5 shadow-sm backdrop-blur-md">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
            UID
          </p>

          <div className="mt-1 flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800">
              {user?.customerId || "Not available"}
            </span>

            <CopyButton type="uid" text={user?.customerId} label="Copy uid" />
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[24px] border border-yellow-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(255,246,198,0.78)_55%,rgba(180,235,255,0.62)_100%)] p-4 shadow-[0_14px_28px_rgba(255,196,3,0.12)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0877d7]">
              Main Balance
            </p>

            <h3 className="mt-1 flex items-center gap-1.5 text-2xl font-black leading-none text-slate-950">
              <Diamond className="h-5 w-5 fill-[#ffc403] text-[#f0a800]" />
              {(user?.m_balance || 0.0).toFixed(2)}
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/80 bg-white/60 shadow-sm">
            <Diamond className="h-6 w-6 fill-[#ffc403] text-[#f0a800]" />
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/deposit"
          className="group relative overflow-hidden rounded-[22px] border border-white/65 bg-[linear-gradient(180deg,#62dcff_0%,#168ee9_58%,#0863ca_100%)] px-3 py-4 text-white shadow-[0_12px_26px_rgba(8,119,215,0.26)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
        >
          <span className="absolute inset-x-1 top-1 h-[50%] rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,.48),rgba(255,255,255,0))]" />

          <span className="relative flex items-center justify-center gap-2 text-sm font-black tracking-wide">
            <Download className="h-4 w-4" />
            Deposit
          </span>
        </Link>

        <Link
          href="/withdraw"
          className="group relative overflow-hidden rounded-[22px] border border-white/65 bg-[linear-gradient(180deg,#fff3a3_0%,#ffc403_58%,#f09b00_100%)] px-3 py-4 text-[#073b87] shadow-[0_12px_26px_rgba(255,196,3,0.24)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105"
        >
          <span className="absolute inset-x-1 top-1 h-[50%] rounded-[18px] bg-[linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0))]" />

          <span className="relative flex items-center justify-center gap-2 text-sm font-black tracking-wide">
            <Send className="h-4 w-4" />
            Withdraw
          </span>
        </Link>
      </div>
    </div>
  );
};

export default UserBalanceInfo;
