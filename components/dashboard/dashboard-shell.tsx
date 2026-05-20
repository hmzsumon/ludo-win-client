import Link from "next/link";
import ApkDownloadCard from "../ApkDownloadCard";
import DashboardHeader from "./dashboard-header";
import GameModeGrid from "./GameModeGrid";

const DashboardShell = () => {
  return (
    <main className="relative min-h-screen w-full overflow-hidden text-white md:min-h-[880px] md:rounded-[30px] md:border md:border-white/10 md:shadow-[0_25px_90px_rgba(0,0,0,0.55)] ">
      {/* ── Ludo Star Deep Purple Background ── */}
      <div className="relative w-full min-h-screen overflow-hidden px-4 pb-32  md:min-h-[880px] md:rounded-[30px] ">
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full opacity-30"
            style={{
              background:
                "radial-gradient(circle, #ff5fe1 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-[20%] right-[-60px] w-[200px] h-[200px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #ff9bf0 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-[40%] left-[-40px] w-[160px] h-[160px] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, #c86bff 0%, transparent 70%)",
            }}
          />
          {/* Decorative star dots */}
          {[
            "top-[12%] left-[8%]",
            "top-[25%] right-[12%]",
            "top-[55%] left-[5%]",
            "top-[70%] right-[8%]",
            "top-[8%] right-[30%]",
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute ${pos} text-yellow-300 opacity-60 text-sm`}
            >
              ★
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full space-y-4">
          <DashboardHeader />
          <ApkDownloadCard />
          <GameModeGrid />

          <div className="w-full max-w-md mx-auto mt-2 space-y-4">
            <Link href="/deposit" className="block w-full">
              <button
                type="submit"
                className="ls-btn ls-btn-logo-green ls-shine-effect w-full py-3.5 text-[16px] font-black disabled:opacity-70 disabled:cursor-not-allowed mt-1"
              >
                Deposit
              </button>
            </Link>

            <Link href="/vip-cashback" className="block w-full">
              <button
                type="submit"
                className="ls-btn ls-btn-logo-blue ls-shine-effect w-full py-3.5 text-[16px] font-black disabled:opacity-70 disabled:cursor-not-allowed mt-1"
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
