"use client";

/* ─────────────────────────────────────────────
   📁 profile-shell.tsx
   Profile page main shell with profile_bg.webp
───────────────────────────────────────────── */

import { useGetProfileDashboardQuery } from "@/redux/features/profile/profileDashboardApi";
import LogoutButton from "../auth/LogoutButton";
import BottomNav from "../dashboard/bottom-nav";
import ProfileAccountCard from "./profile-account-card";
import ProfileHeroCard from "./profile-hero-card";
import ProfileHistoryCard from "./profile-history-card";
import ProfileSummaryStrip from "./profile-summary-strip";
import ProfileWalletCard from "./profile-wallet-card";

const ProfileShell = () => {
  const { data, isLoading } = useGetProfileDashboardQuery();
  const dashboard = data?.data;

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* profile_bg.webp background */}
      <div
        className="fixed inset-0 -z-20 bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/profile_bg.webp')" }}
      />

      {/* Blue theme overlays for readability */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,89,214,0.08)_0%,rgba(197,232,249,0.2)_36%,rgba(207,235,249,0.88)_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[250px] bg-[radial-gradient(circle_at_50%_0%,rgba(79,196,255,0.55)_0%,rgba(79,196,255,0)_68%)]" />

      <div className="relative mx-auto min-h-screen w-full max-w-[430px] px-4 pb-28 pt-4">
        <div className="pointer-events-none absolute inset-x-4 top-4 h-28 rounded-[32px] bg-white/12 blur-2xl" />

        <div className="relative z-10">
          <div className="mb-3 flex items-center justify-between rounded-[22px] border border-white/35 bg-white/18 px-4 py-3 shadow-[0_12px_28px_rgba(0,60,160,0.14)] backdrop-blur-md">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/75 drop-shadow">
                Ludo Win
              </p>
              <h1 className="text-[22px] font-black leading-none text-white drop-shadow-[0_2px_4px_rgba(0,45,130,0.35)]">
                My Profile
              </h1>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/45 bg-[linear-gradient(180deg,#24d8ff_0%,#0685e8_100%)] text-[22px] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_20px_rgba(0,90,190,0.28)]">
              👤
            </div>
          </div>

          <ProfileHeroCard />

          <div className="mt-3">
            <ProfileSummaryStrip dashboard={dashboard} isLoading={isLoading} />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3">
            <ProfileWalletCard dashboard={dashboard} isLoading={isLoading} />
            <ProfileAccountCard dashboard={dashboard} isLoading={isLoading} />
            <ProfileHistoryCard dashboard={dashboard} isLoading={isLoading} />
          </div>

          <div className="mt-5 flex justify-center">
            <LogoutButton />
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
};

export default ProfileShell;
