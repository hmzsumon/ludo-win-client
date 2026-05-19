"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { closeUserSidebar } from "@/redux/features/ui/sidebarSlice";
import {
  BadgeCheck,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  User2,
  Wallet2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import LogoutButton from "./LogoutButton";
import UserBalanceInfo from "./UserBalanceInfo";

type UserSidebarProps = {
  topOffset?: number;
};

const menuItems = [
  {
    label: "My Profile",
    href: "/profile",
    icon: User2,
    subtitle: "Account details",
  },
  {
    label: "Wallet",
    href: "/wallet",
    icon: Wallet2,
    subtitle: "Balance & history",
  },
];

const UserSidebar = ({ topOffset = 74 }: UserSidebarProps) => {
  const isUserSidebarOpen = useSelector(
    (state: any) => state.sidebar.isUserSidebarOpen,
  );
  const dispatch = useDispatch();

  const { user } = useSelector((s: any) => s.auth) as any;
  const firstLetter = (user?.name || user?.email || "U")
    .charAt(0)
    .toUpperCase();

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
        <aside className="relative flex h-full flex-col overflow-hidden border-l border-white/40 bg-[#eaf9ff] text-slate-900 shadow-[-22px_0_60px_rgba(20,93,170,0.28)]">
          {/* background image + theme overlays */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/side_bar_bg.webp')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(184,235,255,0.34)_36%,rgba(255,225,248,0.48)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(22,127,255,0.22),transparent_30%),radial-gradient(circle_at_55%_92%,rgba(255,196,3,0.24),transparent_34%)]" />

          {/* soft floating lights */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-sky-400/25 blur-3xl"
              style={{ animation: "floatGlow 8s ease-in-out infinite" }}
            />
            <div
              className="absolute -left-10 top-40 h-36 w-36 rounded-full bg-fuchsia-300/24 blur-3xl"
              style={{ animation: "floatGlow 10s ease-in-out infinite 1s" }}
            />
            <div
              className="absolute bottom-14 right-8 h-28 w-28 rounded-full bg-yellow-300/30 blur-3xl"
              style={{ animation: "floatGlow 11s ease-in-out infinite 1.6s" }}
            />
          </div>

          {/* Header */}
          <div className="relative px-4 pb-4 pt-5">
            <div className="rounded-[30px] border border-white/60 bg-white/45 p-4 shadow-[0_18px_40px_rgba(53,144,207,0.18)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] border border-white/70 bg-[linear-gradient(145deg,#ffffff_0%,#dff7ff_52%,#b8e9ff_100%)] shadow-[0_12px_28px_rgba(43,133,203,0.22),inset_0_1px_0_rgba(255,255,255,0.95)]">
                    <span className="text-xl font-black text-[#0877d7]">
                      {firstLetter}
                    </span>
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[linear-gradient(180deg,#ffe985_0%,#ffc403_100%)] shadow-[0_6px_12px_rgba(255,196,3,0.35)]">
                      <BadgeCheck className="h-3.5 w-3.5 text-[#095bbf]" />
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1 rounded-full border border-sky-200/75 bg-white/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0877d7] shadow-sm">
                      <Sparkles className="h-3 w-3 text-[#ffc403]" />
                      Account
                    </div>
                    <h2 className="mt-2 truncate text-base font-black leading-tight text-slate-900">
                      {user?.name || "User Profile"}
                    </h2>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-600">
                      {user?.email || "Welcome back"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => dispatch(closeUserSidebar())}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/65 bg-white/55 text-slate-700 shadow-[0_10px_22px_rgba(43,133,203,0.12)] transition hover:scale-105 hover:bg-white/80 hover:text-[#0877d7]"
                  aria-label="Close sidebar"
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="relative flex-1 overflow-y-auto px-4 pb-4">
            <div className="rounded-[30px] border border-white/60 bg-white/42 p-4 shadow-[0_16px_38px_rgba(43,133,203,0.16)] backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-200/70 bg-[linear-gradient(145deg,#e8fbff_0%,#aeeeff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <Wallet2 className="h-[18px] w-[18px] text-[#0877d7]" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0877d7]">
                    Wallet Overview
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    Deposit, withdraw and balance
                  </p>
                </div>
              </div>

              <UserBalanceInfo />
            </div>

            <div className="mt-4 space-y-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => dispatch(closeUserSidebar())}
                    className="group flex items-center justify-between gap-3 rounded-[24px] border border-white/60 bg-white/38 p-3 shadow-[0_12px_28px_rgba(43,133,203,0.12)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/60"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-[#0877d7] shadow-sm">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-slate-900">
                          {item.label}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-500">
                          {item.subtitle}
                        </span>
                      </span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#0877d7]" />
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 rounded-[24px] border border-emerald-100/80 bg-white/38 p-4 shadow-[0_12px_28px_rgba(43,133,203,0.12)] backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200/70 bg-emerald-100/70">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Secure Account
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    Your session is protected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative border-t border-white/45 bg-white/25 p-4 backdrop-blur-xl">
            <div className="rounded-[24px] border border-red-200/70 bg-white/40 p-2 shadow-[0_14px_30px_rgba(43,133,203,0.12)] backdrop-blur-xl">
              <LogoutButton />
            </div>
          </div>

          <style jsx>{`
            @keyframes floatGlow {
              0% {
                transform: translate3d(0, 0, 0) scale(1);
                opacity: 0.55;
              }
              50% {
                transform: translate3d(10px, -12px, 0) scale(1.08);
                opacity: 0.85;
              }
              100% {
                transform: translate3d(0, 0, 0) scale(1);
                opacity: 0.55;
              }
            }
          `}</style>
        </aside>
      </SheetContent>
    </Sheet>
  );
};

export default UserSidebar;
