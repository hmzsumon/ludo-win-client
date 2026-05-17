"use client";

// ✅ PersonalProfileShell.tsx
// Main shell

import {
  useGetPersonalProfileQuery,
  useLinkPhoneMutation,
  useUpdatePersonalProfileMutation,
} from "@/redux/features/profile/personalProfileApi";
import { ArrowLeft, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import AccountSection from "./Accountsection";
import PersonalInfoSection from "./PersonalInfoSection";

export default function PersonalProfileShell() {
  const router = useRouter();

  /* ── API hooks ── */
  const { data, isLoading, isError } = useGetPersonalProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdatePersonalProfileMutation();
  const [linkPhone, { isLoading: isLinkingPhone }] = useLinkPhoneMutation();

  /* ── Update profile handler ── */
  const handleUpdateProfile = async (payload: {
    countryCode?: string;
    countryName?: string;
    city?: string;
  }) => {
    const result = await updateProfile(payload).unwrap();
    return result;
  };

  /* ── Link phone handler ── */
  const handleLinkPhone = async (phone: string) => {
    const result = await linkPhone({ phone }).unwrap();
    return result;
  };

  if (isLoading) {
    return <PersonalProfileSkeleton />;
  }

  if (isError || !data?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50 text-[14px]">
        Failed to load profile. Please try again.
      </div>
    );
  }

  const profile = data.profile;

  return (
    <main
      className="min-h-screen w-full text-white"
      style={{ background: "#14041f" }}
    >
      <div className="relative w-full max-w-[480px] mx-auto px-4 pb-16">
        {/* ────────── Top Bar ────────── */}
        <div
          className="flex items-center gap-3 pt-5 pb-4 sticky top-0 z-10"
          style={{ background: "#14041f" }}
        >
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="flex-1 text-center text-[17px] font-bold text-white">
            Personal profile
          </h1>
          <div className="w-9" />
        </div>

        {/* ────────── Banner ────────── */}
        <button
          onClick={() =>
            toast("Update your profile details below", { icon: "✏️" })
          }
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-5 active:scale-[0.98] transition-transform"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "rgba(1,115,229,0.2)" }}
          >
            <Pencil className="w-4 h-4 text-[#0173e5]" />
          </div>
          <span className="text-[15px] font-medium text-white/80">
            Enter details
          </span>
        </button>

        {/* ────────── Account Section ────────── */}
        <p className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-2 px-1">
          Account
        </p>
        <AccountSection
          profile={profile}
          onLinkPhone={handleLinkPhone}
          isLinkingPhone={isLinkingPhone}
        />

        {/* ────────── Personal Information Section ────────── */}
        <p className="text-[12px] font-semibold text-white/40 uppercase tracking-wider mb-2 mt-6 px-1">
          Personal information
        </p>
        <PersonalInfoSection
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          isUpdating={isUpdating}
        />
      </div>
    </main>
  );
}

function PersonalProfileSkeleton() {
  return (
    <main className="min-h-screen w-full" style={{ background: "#14041f" }}>
      <div className="w-full max-w-[480px] mx-auto px-4 pt-5">
        <div className="h-8 w-40 mx-auto bg-white/10 rounded-lg animate-pulse mb-6" />
        <div className="h-14 w-full bg-white/5 rounded-2xl animate-pulse mb-5" />
        <div className="h-3 w-16 bg-white/10 rounded animate-pulse mb-3" />

        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-white/5">
              <div className="h-3.5 w-32 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="h-3 w-28 bg-white/10 rounded animate-pulse mt-6 mb-3" />
        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-white/5">
              <div className="h-3.5 w-24 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
