"use client";

import NotificationDrawer from "@/components/auth/NotificationDrawer";
import UserSidebar from "@/components/auth/UserSidebar";
import { useOptionsContext } from "@/context/optionContext";
import MenuIcon from "@/public/icons/menu.png";
import { useGetMyUnreadNotificationsCountQuery } from "@/redux/features/notifications/notificationApi";
import { openUserSidebar } from "@/redux/features/ui/sidebarSlice";
import { EOptionsGame } from "@/utils/constants";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "../ludo/icon";

function DiamondBalancePill({
  amount = 0,
  onAdd,
}: {
  amount?: number;
  onAdd?: () => void;
}) {
  const formatAmount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <button
      type="button"
      onClick={onAdd}
      className="
        relative flex h-[30px] min-w-[122px] items-center justify-between
        rounded-full border border-[#395cff]
        bg-[linear-gradient(180deg,#1339a8_0%,#08266f_100%)]
        px-3 pl-2 pr-2
        shadow-[inset_0_2px_0_rgba(255,255,255,0.18),0_6px_16px_rgba(0,0,0,0.35)]
        transition active:scale-95
      "
      aria-label="Diamond balance"
    >
      {/* Diamond */}
      <span className="relative mr-2 flex h-8 w-8 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-cyan-300/15 blur-sm" />
        <span className="relative text-[20px] leading-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]">
          💎
        </span>
      </span>

      {/* Amount */}
      <span
        className="
          flex-1 text-left text-sm font-black leading-none
          text-[#fff4a8]
          drop-shadow-[0_2px_0_rgba(0,0,0,0.55)]
        "
      >
        {formatAmount(amount)}
      </span>

      {/* Plus */}
      <span
        className="
          ml-2 flex h-5 w-5 shrink-0 items-center justify-center
          rounded-full
          bg-[linear-gradient(180deg,#ffe66b_0%,#ffc400_45%,#ff9d00_100%)]
          text-[24px] font-black leading-none text-[#17328c]
          shadow-[inset_0_2px_0_rgba(255,255,255,0.65),0_2px_0_#9b5b00]
        "
      >
        +
      </span>
    </button>
  );
}

/* ──────────  Toggle Button  ────────── */
function SettingToggle({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      disabled={disabled}
      className={`flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:bg-white/10 active:scale-[0.98]"
      }`}
    >
      <span className="text-sm font-semibold text-white/90">{label}</span>

      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
          value ? "bg-emerald-500/90" : "bg-white/15"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

/* ──────────  Sound Settings Panel  ────────── */
function SoundSettingsPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { optionsGame, toogleOptions } = useOptionsContext();

  /* ── Close on outside click / Escape ── */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  return (
    /*
     * ── Overlay wrapper ──
     * fixed + inset-0 দিয়ে পুরো screen cover করে
     * তারপর flex দিয়ে panel কে center এ রাখি
     * pointer-events: none যখন বন্ধ, যাতে নিচের UI block না হয়
     */
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-all duration-300 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* ── Backdrop (dim) ── */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        className={`
          relative z-10 w-[300px] max-w-[calc(100vw-32px)]
          overflow-hidden rounded-[28px]
          transition-all duration-300 ease-out
          ${
            open
              ? "translate-x-0 opacity-100 scale-100"
              : "-translate-x-8 opacity-0 scale-95"
          }
        `}
        style={{
          /* ── App থিমের সাথে মিল রেখে deep purple গ্লাসমর্ফিজম ── */
          background:
            "linear-gradient(145deg, rgba(60,10,100,0.97) 0%, rgba(25,5,65,0.97) 100%)",
          border: "1px solid rgba(167,139,250,0.25)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.08) inset",
        }}
      >
        {/* ── Header ── */}
        <div
          className="border-b px-5 py-4"
          style={{ borderColor: "rgba(167,139,250,0.15)" }}
        >
          <p
            className="text-[11px] font-black uppercase tracking-[0.28em]"
            style={{ color: "#00e5cc" }}
          >
            Audio Control
          </p>
          <h3 className="mt-1 text-lg font-black text-white">Sound Settings</h3>
        </div>

        {/* ── Toggles ── */}
        <div className="space-y-3 p-4">
          <SettingToggle
            label="Sound Effects"
            value={optionsGame[EOptionsGame.SOUND]}
            onChange={() => toogleOptions(EOptionsGame.SOUND)}
          />
          <SettingToggle
            label="Background Music"
            value={false}
            disabled
            onChange={() => {}}
          />
          <SettingToggle
            label="Chat Sound"
            value={optionsGame[EOptionsGame.CHAT]}
            onChange={() => toogleOptions(EOptionsGame.CHAT)}
          />
        </div>
      </div>
    </div>
  );
}

/* ──────────  Auth Top Bar  ────────── */
export default function AuthTopBar() {
  const { user } = useSelector((s: any) => s.auth) as any;
  const dispatch = useDispatch();

  const [notifOpen, setNotifOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { data: countData } = useGetMyUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 30000,
  });

  const unreadCount = countData?.dataCount ?? 0;

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] w-full max-w-[430px] items-center justify-between px-4">
          {/* ── Left: Logo ── */}
          <Link href="/personal-profile" className="flex items-center">
            {/* ── User Avatar ── */}
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/14"
              aria-label="Open user menu"
            >
              <div
                className="relative h-10 w-10 overflow-hidden rounded-full"
                style={{
                  background:
                    "linear-gradient(145deg, #5b21b6 0%, #7c3aed 100%)",
                  border: "3px solid #ffd700",
                  boxShadow:
                    "0 0 0 6px rgba(255,215,0,0.15), 0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="user avatar"
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[44px]">
                    👨
                  </div>
                )}
              </div>
            </button>
          </Link>

          {/* ── Center: Diamond Balance ── */}
          <div className="flex flex-1 justify-center px-1">
            <DiamondBalancePill
              amount={user?.m_balance ?? user?.m_balance ?? 0}
              onAdd={() => {
                // এখানে wallet / add money page route দিতে পারেন
                window.location.href = "/wallet";
              }}
            />
          </div>

          {/* ── Right: Settings, Notification, User ── */}
          <div className="flex items-center gap-2">
            {/* ── Notification Bell ── */}
            <button
              className="relative flex h-10 w-10 items-center justify-center rounded-full"
              type="button"
              onClick={() => {
                setNotifOpen(true);
                setSettingsOpen(false);
              }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(74,26,138,0.95) 0%, rgba(29,5,70,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 min-w-[19px] rounded-full border border-[#3c0a54] bg-emerald-400 px-1 text-center text-[10px] font-black leading-4 text-[#24043d]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* ── Settings button ── */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen((prev) => !prev);
                  setNotifOpen(false);
                }}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:bg-white/14"
                aria-label="Open settings"
              >
                <div className="h-5 w-5 [&_svg]:h-5 [&_svg]:w-5">
                  <Icon type="gear" />
                </div>
              </button>
            </div>
            {/* ── Menu button ── */}
            <div className="flex items-center">
              {/* ── User Avatar ── */}
              <button
                type="button"
                onClick={() => {
                  setSettingsOpen(false);
                  setNotifOpen(false);
                  dispatch(openUserSidebar());
                }}
                aria-label="Open user menu"
              >
                <Image
                  src={MenuIcon}
                  alt="Menu"
                  width={28}
                  height={20}
                  className="object-contain"
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Bottom glow line ── */}
        <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(255,215,0,0.45),transparent)]" />
      </header>

      {/* ── Sound Settings Panel (centered overlay) ── */}
      <SoundSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* ── Notification Drawer ── */}
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        topOffset={74}
      />

      {/* ── User Sidebar ── */}
      <UserSidebar topOffset={74} />
    </>
  );
}
