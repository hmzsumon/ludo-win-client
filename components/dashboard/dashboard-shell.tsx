import Link from "next/link";
import ApkDownloadCard from "../ApkDownloadCard";
import DashboardHeader from "./dashboard-header";
import GameModeGrid from "./GameModeGrid";

const DashboardShell = () => {
  return (
    <main
      className="
        relative h-[100dvh] w-full overflow-hidden text-white
        md:h-[880px] md:rounded-[30px] md:border md:border-white/10
        md:shadow-[0_25px_90px_rgba(0,0,0,0.55)]
      "
    >
      {/* ─────────────────────────────────────────────
          Fixed Dashboard Screen Wrapper
          কাজ: পুরো dashboard 100dvh এর মধ্যে fixed থাকবে,
          page scroll হবে না।
      ───────────────────────────────────────────── */}
      <div className="relative h-full w-full overflow-hidden px-4 md:rounded-[30px]">
        {/* ─────────────────────────────────────────────
            Main Blue Game Background
            কাজ: screenshot এর মতো blue/cyan game theme background
        ───────────────────────────────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #1767dd 0%, #078fdd 48%, #00a8df 100%)",
          }}
        />

        {/* ─────────────────────────────────────────────
            Soft Light Overlay
            কাজ: background কে shiny এবং game lobby feel দেওয়া
        ───────────────────────────────────────────── */}
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 72% 8%, rgba(255,255,255,0.28) 0%, transparent 28%), radial-gradient(circle at 22% 30%, rgba(255,255,255,0.14) 0%, transparent 26%), radial-gradient(circle at 55% 58%, rgba(255,255,255,0.1) 0%, transparent 24%)",
          }}
        />

        {/* ─────────────────────────────────────────────
            Decorative Pattern Icons
            কাজ: screenshot এর background এর মতো subtle game icon pattern
        ───────────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.09]">
          {[
            { icon: "🎲", pos: "top-[8%] left-[8%] rotate-[-18deg]" },
            { icon: "🎤", pos: "top-[12%] right-[10%] rotate-[18deg]" },
            { icon: "🎮", pos: "top-[38%] left-[38%] rotate-[8deg]" },
            { icon: "♟️", pos: "top-[32%] right-[26%] rotate-[-10deg]" },
            { icon: "🎲", pos: "top-[45%] right-[10%] rotate-[14deg]" },
            { icon: "🎤", pos: "bottom-[22%] left-[10%] rotate-[-12deg]" },
            { icon: "🎮", pos: "bottom-[13%] right-[19%] rotate-[18deg]" },
            { icon: "♟️", pos: "bottom-[7%] left-[38%] rotate-[5deg]" },
          ].map((item, index) => (
            <div
              key={index}
              className={`absolute ${item.pos} text-5xl text-white`}
            >
              {item.icon}
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────
            Decorative Glow Blobs
            কাজ: background এ depth/glow effect দেওয়া
        ───────────────────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-90px] left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #ffffff 0%, transparent 70%)",
            }}
          />

          <div
            className="absolute bottom-[18%] right-[-70px] h-[220px] w-[220px] rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #7ee8ff 0%, transparent 70%)",
            }}
          />

          <div
            className="absolute top-[40%] left-[-70px] h-[180px] w-[180px] rounded-full opacity-20 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, #5eead4 0%, transparent 70%)",
            }}
          />

          {/* Screenshot-এর মতো ছোট star */}
          {[
            "top-[25%] left-[8%]",
            "top-[30%] right-[12%]",
            "top-[54%] left-[6%]",
            "top-[64%] right-[9%]",
            "top-[16%] right-[31%]",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} text-sm text-yellow-300 opacity-70`}
            >
              ★
            </div>
          ))}
        </div>

        {/* ─────────────────────────────────────────────
            Fixed Content Area
            কাজ: সব content screen এর ভিতরে থাকবে, scroll হবে না
        ───────────────────────────────────────────── */}
        <div
          className="
            relative z-10 flex h-full w-full flex-col
            pt-2
          "
        >
          {/* ─────────────────────────────────────────────
              Dashboard Top Header
          ───────────────────────────────────────────── */}
          <div className="shrink-0">
            <DashboardHeader />
          </div>

          {/* ─────────────────────────────────────────────
              Logo / APK Download Section
              কাজ: আপনার existing ApkDownloadCard রাখা হয়েছে
          ───────────────────────────────────────────── */}
          <div className="shrink-0">
            <ApkDownloadCard />
          </div>

          {/* ─────────────────────────────────────────────
              Game Mode Grid
              কাজ: grid অংশ compact ভাবে fixed screen এ fit থাকবে
          ───────────────────────────────────────────── */}
          <div className="shrink-0">
            <GameModeGrid />
          </div>

          {/* ─────────────────────────────────────────────
              Action Buttons Section
              কাজ: Deposit এবং VIP Cashback button fixed নিচের দিকে থাকবে
          ───────────────────────────────────────────── */}
          <div className="mx-auto mt-auto w-full max-w-md shrink-0 space-y-3 pb-[92px]">
            <Link href="/deposit" className="block w-full">
              <button
                type="button"
                className="
                  ls-btn ls-btn-logo-green ls-shine-effect
                  mt-1 w-full py-3 text-[16px] font-black
                  disabled:cursor-not-allowed disabled:opacity-70
                "
              >
                Deposit
              </button>
            </Link>

            <Link href="/vip-cashback" className="block w-full">
              <button
                type="button"
                className="
                  ls-btn ls-btn-logo-blue ls-shine-effect
                  mt-1 w-full py-3 text-[16px] font-black
                  disabled:cursor-not-allowed disabled:opacity-70
                "
              >
                VIP Cashback Record
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DashboardShell;
