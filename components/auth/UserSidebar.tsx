"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { closeUserSidebar } from "@/redux/features/ui/sidebarSlice";
import { ShieldCheck, User2, Wallet2, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import LogoutButton from "./LogoutButton";
import UserBalanceInfo from "./UserBalanceInfo";

type UserSidebarProps = {
  topOffset?: number;
};

const UserSidebar = ({ topOffset = 74 }: UserSidebarProps) => {
  const isUserSidebarOpen = useSelector(
    (state: any) => state.sidebar.isUserSidebarOpen,
  );
  const dispatch = useDispatch();

  const { user } = useSelector((s: any) => s.auth) as any;

  return (
    <Sheet
      open={isUserSidebarOpen}
      onOpenChange={(open) => {
        if (!open) dispatch(closeUserSidebar());
      }}
    >
      <SheetContent
        side="right"
        className="
          w-full max-w-[390px]
          border-none p-0
          bg-transparent shadow-none
          overflow-hidden
          [&>button]:hidden
        "
        style={{
          top: `${topOffset}px`,
          height: `calc(100dvh - ${topOffset}px)`,
        }}
      >
        <div className="relative flex h-full flex-col overflow-hidden border-l border-fuchsia-300/15 bg-[linear-gradient(180deg,rgba(58,6,92,0.97)_0%,rgba(38,4,68,0.98)_55%,rgba(24,3,49,0.99)_100%)] text-white shadow-[-18px_0_50px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {/* animated glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-10 top-8 h-40 w-40 rounded-full bg-fuchsia-500/12 blur-3xl"
              style={{ animation: "floatGlow 8s ease-in-out infinite" }}
            />
            <div
              className="absolute left-0 top-36 h-36 w-36 rounded-full bg-violet-400/10 blur-3xl"
              style={{ animation: "floatGlow 10s ease-in-out infinite 1s" }}
            />
            <div
              className="absolute bottom-16 right-8 h-28 w-28 rounded-full bg-yellow-300/10 blur-3xl"
              style={{ animation: "floatGlow 11s ease-in-out infinite 1.6s" }}
            />
          </div>

          {/* Header */}
          <div className="relative border-b border-white/10 bg-white/[0.03] px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-300/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <User2 className="h-6 w-6 text-yellow-300" />
                </div>

                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-yellow-300/80">
                    Account Center
                  </p>
                  <h2 className="mt-1 text-sm font-black tracking-wide text-white">
                    {user?.name || "User Profile"}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => dispatch(closeUserSidebar())}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-neutral-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,215,0,0.45),transparent)]" />
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-y-auto p-4">
            <div className="rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(34,211,238,0.12)_0%,rgba(255,255,255,0.03)_100%)] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10">
                  <Wallet2 className="h-4.5 w-4.5 text-cyan-200" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200/75">
                    Wallet Overview
                  </p>
                  <p className="text-sm font-semibold text-white/80">
                    Current user balance
                  </p>
                </div>
              </div>

              <UserBalanceInfo />
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10">
                  <ShieldCheck className="h-5 w-5 text-emerald-200" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Account Security
                  </h3>
                  <p className="text-xs text-white/60">
                    Keep your session and account protected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative border-t border-white/10 bg-white/[0.02] p-4">
            <div className="rounded-[24px] border border-red-400/15 bg-[linear-gradient(145deg,rgba(239,68,68,0.12)_0%,rgba(255,255,255,0.03)_100%)] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.2)]">
              <LogoutButton />
            </div>
          </div>

          <style jsx>{`
            @keyframes floatGlow {
              0% {
                transform: translate3d(0, 0, 0) scale(1);
                opacity: 0.45;
              }
              50% {
                transform: translate3d(10px, -12px, 0) scale(1.08);
                opacity: 0.7;
              }
              100% {
                transform: translate3d(0, 0, 0) scale(1);
                opacity: 0.45;
              }
            }
          `}</style>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default UserSidebar;
