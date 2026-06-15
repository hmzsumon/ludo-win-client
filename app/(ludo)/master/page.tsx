import Image from "next/image";
import Link from "next/link";

/* ════════════════════════════════════════════════════════════════
   Master Mode Select Page
   কাজ:
   - Dashboard থেকে Master click করলে এখানে আসবে
   - Online / Offline দুই জায়গাতেই একই Master rules চালু হবে
   - Classic route/page untouched রাখা হয়েছে
════════════════════════════════════════════════════════════════ */
export default function MasterModePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071a49] px-5 py-8 text-white">
      {/* ────────── blue game background glow ────────── */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(74,153,255,0.65),transparent_42%),linear-gradient(180deg,#094df3_0%,#05a9f0_55%,#0288d1_100%)]" />
      <div className="pointer-events-none absolute -left-16 top-24 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-20 h-56 w-56 rounded-full bg-cyan-200/20 blur-3xl" />

      {/* ────────── content wrapper ────────── */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[430px] flex-col items-center justify-center gap-6">
        {/* ────────── logo/card image ────────── */}
        <div className="text-center">
          <div className="relative mx-auto mb-3 h-[132px] w-[190px] overflow-hidden rounded-[28px] shadow-[0_8px_0_rgba(0,0,0,0.35),0_18px_30px_rgba(0,0,0,0.28)]">
            <Image
              src="/images/dashboard/master.png"
              alt="Master Mode"
              fill
              priority
              sizes="190px"
              className="object-cover"
            />
          </div>

          <h1 className="text-[34px] font-black leading-none drop-shadow-[0_4px_0_rgba(83,34,0,0.85)] [-webkit-text-stroke:1px_rgba(117,48,0,0.7)]">
            Master Mode
          </h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-white/85 drop-shadow">
            Kill required + joint token wall rules enabled.
          </p>
        </div>

        {/* ────────── action buttons ────────── */}
        <div className="w-full space-y-4">
          <Link
            href="/online?mode=master"
            className="block rounded-[24px] border border-white/25 bg-[linear-gradient(180deg,#61ff1d_0%,#17d900_48%,#059500_100%)] px-5 py-5 text-center text-2xl font-black uppercase tracking-wide text-white shadow-[0_8px_0_#076b00,0_16px_22px_rgba(0,0,0,0.35)] transition active:translate-y-[4px] active:shadow-[0_4px_0_#076b00,0_10px_16px_rgba(0,0,0,0.28)]"
          >
            Play Online Master
          </Link>

          <Link
            href="/offline?mode=master"
            className="block rounded-[24px] border border-white/25 bg-[linear-gradient(180deg,#ffea4d_0%,#ffae16_48%,#e76e00_100%)] px-5 py-5 text-center text-2xl font-black uppercase tracking-wide text-white shadow-[0_8px_0_#9a4100,0_16px_22px_rgba(0,0,0,0.35)] transition active:translate-y-[4px] active:shadow-[0_4px_0_#9a4100,0_10px_16px_rgba(0,0,0,0.28)]"
          >
            Play Offline Master
          </Link>

          <Link
            href="/dashboard"
            className="block rounded-full bg-black/25 px-5 py-3 text-center text-sm font-extrabold text-white/80 ring-1 ring-white/15 transition active:scale-95"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
