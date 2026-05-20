"use client";

// ✅ PersonalProfileShell.tsx
// Smart personal profile screen shell
// - UserSidebar inspired light glass UI
// - App blue/cyan/yellow theme
// - Every visible section is commented for easy editing

import {
  useGetPersonalProfileQuery,
  useLinkPhoneMutation,
  useUpdatePersonalProfileMutation,
} from "@/redux/features/profile/personalProfileApi";
import { ArrowLeft, Pencil, Sparkles, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "react-hot-toast";
import AccountSection from "./Accountsection";
import PersonalInfoSection from "./PersonalInfoSection";

export default function PersonalProfileShell() {
  const router = useRouter();

  /* ────────── API hooks: profile load/update/link phone ────────── */
  const { data, isLoading, isError } = useGetPersonalProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdatePersonalProfileMutation();
  const [linkPhone, { isLoading: isLinkingPhone }] = useLinkPhoneMutation();

  /* ────────── Handler: update editable profile fields ────────── */
  const handleUpdateProfile = async (payload: {
    countryCode?: string;
    countryName?: string;
    city?: string;
  }) => {
    const result = await updateProfile(payload).unwrap();
    return result;
  };

  /* ────────── Handler: link phone number ────────── */
  const handleLinkPhone = async (phone: string) => {
    const result = await linkPhone({ phone }).unwrap();
    return result;
  };

  /* ────────── Loading state: smart skeleton while API loading ────────── */
  if (isLoading) {
    return <PersonalProfileSkeleton />;
  }

  /* ────────── Error state: friendly failed screen ────────── */
  if (isError || !data?.profile) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#eaf9ff] text-slate-900">
        {/* Background image + glass overlays */}
        <ProfileBackground />

        {/* Error content */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-5">
          <div className="w-full max-w-[430px] rounded-[30px] border border-white/65 bg-white/45 p-6 text-center shadow-[0_18px_42px_rgba(43,133,203,0.16)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] border border-red-200/70 bg-red-100/70 text-3xl">
              ⚠️
            </div>
            <h2 className="mt-4 text-base font-black text-slate-900">
              Failed to load profile
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Please go back and try again.
            </p>
            <button
              onClick={() => router.back()}
              className="mt-5 rounded-2xl bg-[linear-gradient(180deg,#62dcff_0%,#168ee9_58%,#0863ca_100%)] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_24px_rgba(8,119,215,0.24)]"
              type="button"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  const profile = data.profile;
  const firstLetter = (profile.fullName || profile.email || "U")
    .charAt(0)
    .toUpperCase();
  const locationText = [profile.city, profile.countryName]
    .filter(Boolean)
    .join(", ");
  const registeredDate = profile.registrationDate
    ? new Date(profile.registrationDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not available";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eaf9ff] text-slate-900">
      {/* ────────── Section: Background image and theme overlays ────────── */}
      <ProfileBackground />

      {/* ────────── Section: Page container ────────── */}
      <div className="relative z-10 mx-auto w-full max-w-[480px] px-4 pb-16">
        {/* ────────── Section: Sticky top navigation bar ────────── */}
        <div className="sticky top-0 z-20 -mx-4 px-4 pb-3 pt-4 backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-[26px] border border-white/60 bg-white/42 p-2 shadow-[0_14px_34px_rgba(43,133,203,0.14)] backdrop-blur-xl">
            <button
              onClick={() => router.back()}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-slate-700 shadow-sm transition hover:scale-105 hover:bg-white/80 hover:text-[#0877d7]"
              aria-label="Go back"
              type="button"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0877d7]">
                Account Center
              </p>
              <h1 className="text-base font-black leading-tight text-slate-900">
                Personal Profile
              </h1>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/55 text-[#ffc403] shadow-sm">
              <Sparkles className="h-5 w-5 fill-[#ffc403]/30" />
            </div>
          </div>
        </div>

        {/* ────────── Section: Profile hero card ────────── */}

        {/* ────────── Section: Edit helper banner ────────── */}
        <button
          onClick={() =>
            toast("Update your profile details below", { icon: "✏️" })
          }
          className="mt-4 flex w-full items-center gap-3 rounded-[26px] border border-white/60 bg-white/38 p-3.5 text-left shadow-[0_12px_30px_rgba(43,133,203,0.12)] backdrop-blur-xl transition active:scale-[0.98] hover:bg-white/55"
          type="button"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/70 bg-[linear-gradient(145deg,#e8fbff_0%,#aeeeff_100%)] text-[#0877d7] shadow-sm">
            <Pencil className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-slate-900">
              Complete your profile
            </span>
            <span className="block text-xs font-semibold text-slate-500">
              Add country, city, phone and keep your account updated
            </span>
          </span>
        </button>

        {/* ────────── Section: Account information card ────────── */}
        <section className="mt-5">
          <SectionTitle
            icon={<UserRound className="h-4 w-4" />}
            title="Account"
            subtitle="Login and security details"
          />
          <AccountSection
            profile={profile}
            onLinkPhone={handleLinkPhone}
            isLinkingPhone={isLinkingPhone}
          />
        </section>

        {/* ────────── Section: Personal information card ────────── */}
        <section className="mt-5">
          <SectionTitle
            icon={<Sparkles className="h-4 w-4" />}
            title="Personal Information"
            subtitle="Country, city and display details"
          />
          <PersonalInfoSection
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            isUpdating={isUpdating}
          />
        </section>
      </div>
    </main>
  );
}

/* ────────── Reusable component: background layer ────────── */
function ProfileBackground() {
  return (
    <>
      {/* Background base image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/side_bar_bg.webp')" }}
      />

      {/* Background soft white/cyan/pink overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.20)_0%,rgba(184,235,255,0.38)_36%,rgba(255,225,248,0.50)_100%)]" />

      {/* Background radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_92%_18%,rgba(22,127,255,0.22),transparent_30%),radial-gradient(circle_at_55%_92%,rgba(255,196,3,0.24),transparent_34%)]" />

      {/* Background floating animated lights */}
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

      {/* Background animation CSS */}
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
    </>
  );
}

/* ────────── Reusable component: section title ────────── */
function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/70 bg-white/50 text-[#0877d7] shadow-sm backdrop-blur-xl">
        {icon}
      </span>
      <span>
        <span className="block text-[13px] font-black uppercase tracking-[0.16em] text-[#0877d7]">
          {title}
        </span>
        <span className="block text-xs font-semibold text-slate-500">
          {subtitle}
        </span>
      </span>
    </div>
  );
}

/* ────────── Reusable component: hero summary chip ────────── */
function ProfileSummaryChip({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/65 bg-white/40 p-2.5 text-center shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-[#0877d7]">
        {icon}
      </div>
      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="text-xs font-black text-slate-900">{value}</p>
    </div>
  );
}

/* ────────── Loading component: smart skeleton UI ────────── */
function PersonalProfileSkeleton() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eaf9ff] text-slate-900">
      {/* Skeleton background */}
      <ProfileBackground />

      {/* Skeleton container */}
      <div className="relative z-10 mx-auto w-full max-w-[480px] px-4 pb-16 pt-4">
        {/* Skeleton topbar */}
        <div className="rounded-[26px] border border-white/60 bg-white/42 p-3 shadow-[0_14px_34px_rgba(43,133,203,0.14)] backdrop-blur-xl">
          <div className="mx-auto h-5 w-36 animate-pulse rounded-lg bg-white/55" />
        </div>

        {/* Skeleton hero card */}
        <div className="mt-4 rounded-[32px] border border-white/65 bg-white/45 p-4 shadow-[0_18px_42px_rgba(43,133,203,0.16)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-[24px] bg-white/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-white/55" />
              <div className="h-5 w-44 animate-pulse rounded bg-white/60" />
              <div className="h-3 w-36 animate-pulse rounded bg-white/45" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-[20px] border border-white/55 bg-white/38"
              />
            ))}
          </div>
        </div>

        {/* Skeleton helper banner */}
        <div className="mt-4 h-[72px] rounded-[26px] border border-white/60 bg-white/38 p-4 shadow-[0_12px_30px_rgba(43,133,203,0.12)] backdrop-blur-xl">
          <div className="h-4 w-52 animate-pulse rounded bg-white/55" />
          <div className="mt-2 h-3 w-64 animate-pulse rounded bg-white/40" />
        </div>

        {/* Skeleton account and personal cards */}
        {[...Array(2)].map((_, sectionIndex) => (
          <div key={sectionIndex} className="mt-5">
            <div className="mb-2 h-9 w-48 animate-pulse rounded-2xl bg-white/45" />
            <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/42 p-2 shadow-[0_16px_38px_rgba(43,133,203,0.14)] backdrop-blur-xl">
              {[...Array(sectionIndex === 0 ? 5 : 3)].map((_, i) => (
                <div key={i} className="px-3 py-4">
                  <div className="h-4 w-36 animate-pulse rounded bg-white/55" />
                  <div className="mt-2 h-3 w-44 animate-pulse rounded bg-white/35" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
