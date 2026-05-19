"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

import { useUpdatePersonalProfileMutation } from "@/redux/features/profile/personalProfileApi";
import { useGetMyVipCashbackInfoQuery } from "@/redux/features/vipCashback/vipCashbackApi";
import { getRankConfig } from "../vip/VipRankBadge";

/* ──────────────────────────────────────────────────────────────
   Avatar list
   ────────────────────────────────────────────────────────────── */
const AVATAR_LIST = [
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763047/avatar_12_blopku.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763048/avatyar_15_iaz9ak.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763047/avatar_13_ciioyy.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763047/avatar_10_h554nn.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763047/avatar_9_pkig83.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763047/avatar_19_d8xmjw.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763047/avatar_11_vhfo6s.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763047/avatar_18_g4tuqy.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763046/avatar_6_sayb8t.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763046/avatar_8_zhqdzl.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763046/avatar_17_yum7rj.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763046/avatar_7_jbsa2l.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763045/avatar_16_zaiebd.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763046/avatar_5_i0zxtt.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763045/avatar_4_zvhfdz.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763045/avatar_3_vvyqi1.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763045/avatar_2_jknufy.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763045/avatar_14_v2tqkr.jpg",
  "https://res.cloudinary.com/dh3p9y59j/image/upload/q_auto/f_auto/v1776763045/avatar_1_fkktlw.jpg",
];

/* ────────── Progress helper ────────── */
const getProgressPercent = (
  currentStageMatches: number,
  currentStageTurnover: number,
  currentRankName?: string | null,
  nextRank?: {
    minMatches: number;
    minTurnover: number;
  } | null,
) => {
  if (!nextRank) return currentRankName ? 100 : 0;

  if (!currentRankName && Number(nextRank.minTurnover) === 0) {
    const targetMatches = Math.max(1, Number(nextRank.minMatches || 0));
    return Math.min(100, (currentStageMatches / targetMatches) * 100);
  }

  const targetTurnover = Math.max(1, Number(nextRank.minTurnover || 0));
  return Math.min(100, (currentStageTurnover / targetTurnover) * 100);
};

/* ────────── Progress label helper ────────── */
const getProgressText = (
  currentStageMatches: number,
  currentStageTurnover: number,
  currentRankName?: string | null,
  nextRank?: {
    rank: string;
    minMatches: number;
    minTurnover: number;
  } | null,
) => {
  if (!nextRank) return "Max Rank Reached 🎉";

  if (!currentRankName && Number(nextRank.minTurnover) === 0) {
    return `${currentStageMatches.toLocaleString()} / ${nextRank.minMatches.toLocaleString()} Match → ${nextRank.rank}`;
  }

  return `${currentStageTurnover.toLocaleString()} / ${nextRank.minTurnover.toLocaleString()} XP → ${nextRank.rank}`;
};

/* ────────── Avatar modal ────────── */
type AvatarModalProps = {
  open: boolean;
  onClose: () => void;
  selectedAvatar: string;
  onSelect: (url: string) => void;
  onSave: () => void;
  saving?: boolean;
};

const AvatarPickerModal = ({
  open,
  onClose,
  selectedAvatar,
  onSelect,
  onSave,
  saving = false,
}: AvatarModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#003777]/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] border border-white/45 bg-white/35 p-4 shadow-2xl backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[18px] font-black text-[#073d95]">
            Choose Avatar
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-[#073d95]/70 transition hover:bg-white/35 hover:text-[#073d95]"
          >
            ✕
          </button>
        </div>

        <div className="grid max-h-[380px] grid-cols-3 gap-3 overflow-y-auto pr-1">
          {AVATAR_LIST.map((avatar) => {
            const active = selectedAvatar === avatar;

            return (
              <button
                key={avatar}
                type="button"
                onClick={() => onSelect(avatar)}
                className={`rounded-2xl border-2 p-1 transition ${
                  active
                    ? "scale-[1.04] border-yellow-400"
                    : "border-transparent hover:border-white/20"
                }`}
              >
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={avatar}
                    alt="avatar"
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!selectedAvatar || saving}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-[#23d9ff] to-[#0572d1] px-4 py-3 text-[14px] font-black text-white shadow-[0_10px_20px_rgba(0,105,205,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Avatar"}
        </button>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   ProfileHeroCard
   ────────────────────────────────────────────────────────────── */
const ProfileHeroCard = () => {
  const { user } = useSelector((s: any) => s.auth) as any;

  /* ── VIP Cashback info API ── */
  const { data: vipData, isLoading: vipLoading } =
    useGetMyVipCashbackInfoQuery();

  /* ── Update avatar API ── */
  const [updatePersonalProfile, { isLoading: avatarSaving }] =
    useUpdatePersonalProfileMutation();

  /* ── Avatar modal state ── */
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");

  useEffect(() => {
    setSelectedAvatar(user?.avatar || "");
  }, [user?.avatar]);

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      toast.error("Please select an avatar");
      return;
    }

    try {
      await updatePersonalProfile({
        avatar: selectedAvatar,
      }).unwrap();

      toast.success("Avatar updated successfully");
      setIsAvatarModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update avatar");
    }
  };

  const vipInfo = vipData?.data;
  const currentRank = vipInfo?.currentRank;
  const nextRank = vipInfo?.nextRank;
  const userProgress = vipInfo?.userProgress;

  /* ── Rank config (color, glow etc.) ── */
  const rankCfg = getRankConfig(currentRank?.rank);

  const currentStageMatches = userProgress?.currentStageMatches ?? 0;
  const currentStageTurnover = userProgress?.currentStageTurnover ?? 0;

  /* ── Progress percent ── */
  const progressPercent = useMemo(
    () =>
      getProgressPercent(
        currentStageMatches,
        currentStageTurnover,
        currentRank?.rank,
        nextRank,
      ),
    [currentStageMatches, currentStageTurnover, currentRank?.rank, nextRank],
  );

  const progressText = useMemo(
    () =>
      getProgressText(
        currentStageMatches,
        currentStageTurnover,
        currentRank?.rank,
        nextRank,
      ),
    [currentStageMatches, currentStageTurnover, currentRank?.rank, nextRank],
  );

  /* ── Name ── */
  const shortName =
    user?.name?.length > 18
      ? `${user.name.slice(0, 18)}...`
      : user?.name || "Player Name";

  const username = user?.customerId || "@player1234";

  return (
    <>
      <section className="relative w-full overflow-hidden rounded-[30px] border border-white/50 bg-white/30 p-5 shadow-[0_18px_38px_rgba(0,92,190,0.2)] backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,243,74,0.95),rgba(35,217,255,0.9),rgba(255,255,255,0))]" />
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-300/28 blur-2xl" />
        <div className="absolute -left-14 bottom-12 h-32 w-32 rounded-full bg-yellow-200/24 blur-2xl" />

        <div className="relative flex flex-col gap-5">
          {/* ── Avatar + Name section ── */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div
                className="relative h-24 w-24 overflow-hidden rounded-full"
                style={{
                  background:
                    "linear-gradient(145deg, #23d9ff 0%, #0572d1 100%)",
                  border: "3px solid rgba(255,255,255,0.92)",
                  boxShadow:
                    "0 0 0 6px rgba(35,217,255,0.18), 0 10px 22px rgba(0,86,180,0.2)",
                }}
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="user avatar"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[44px]">
                    👨
                  </div>
                )}
              </div>

              <div
                className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-400"
                style={{ boxShadow: "0 0 6px rgba(46,204,113,0.8)" }}
              />

              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-black text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #23d9ff 0%, #0572d1 100%)",
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                🇧🇩 BD
              </div>
            </div>

            <div>
              <h2 className="leading-tight text-[24px] font-black tracking-tight text-[#063f9a] drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]">
                {shortName}
              </h2>

              <p className="mt-0.5 text-[13px] font-black text-[#0671cf]/70">
                {username}
              </p>

              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                className="mt-3 rounded-full border border-white/50 bg-[linear-gradient(180deg,#fff34a_0%,#ffc300_100%)] px-4 py-2 text-[12px] font-black text-[#06357f] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_5px_0_rgba(199,132,0,0.62),0_10px_18px_rgba(0,92,190,0.12)] transition active:translate-y-0.5"
              >
                ✏️ Edit Profile
              </button>
            </div>
          </div>

          {/* ── VIP Rank Card ── */}
          <Link href="/vip-cashback" className="block">
            <div className="relative flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-white/55 bg-white/40 px-6 py-4 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_12px_24px_rgba(0,92,190,0.14)] transition-transform active:scale-[0.98]">
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#0671cf]/70">
                Current Rank
              </p>

              {vipLoading ? (
                <div className="my-1 h-8 w-24 animate-pulse rounded-lg bg-white/10" />
              ) : (
                <h3
                  className="text-[28px] font-black"
                  style={{
                    color: currentRank ? rankCfg.color : "#063f9a",
                    textShadow: currentRank
                      ? `0 0 12px ${rankCfg.glow}`
                      : "none",
                  }}
                >
                  {currentRank ? currentRank.rank : "No Rank Yet"}
                </h3>
              )}

              {currentRank && !vipLoading && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-black text-black"
                    style={{ background: rankCfg.color }}
                  >
                    {currentRank.cashback}% cashback
                  </span>
                  <span className="text-[10px] font-bold text-[#0671cf]/60">
                    {currentStageMatches} fresh matches
                  </span>
                </div>
              )}

              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "rgba(6,113,207,0.16)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPercent}%`,
                    background: currentRank
                      ? `linear-gradient(90deg, ${rankCfg.color}, ${rankCfg.color}aa)`
                      : "linear-gradient(90deg, #ffd700, #ffd700aa)",
                    boxShadow: currentRank ? `0 0 6px ${rankCfg.glow}` : "none",
                  }}
                />
              </div>

              <p className="mt-1 text-[10px] font-bold text-[#0671cf]/65">
                {vipLoading ? "Loading..." : progressText}
              </p>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-black text-[#0671cf]/45">
                →
              </div>
            </div>
          </Link>
        </div>
      </section>

      <AvatarPickerModal
        open={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        selectedAvatar={selectedAvatar}
        onSelect={setSelectedAvatar}
        onSave={handleSaveAvatar}
        saving={avatarSaving}
      />
    </>
  );
};

export default ProfileHeroCard;
