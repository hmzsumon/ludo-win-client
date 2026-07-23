import Logo from "@/components/branding/logo";
import Link from "next/link";

function ActionButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return <Link href={href}>{children}</Link>;
}

export default function PublicHomePage(): JSX.Element {
  return (
    <main className="ludo-home brand-bg-shell relative min-h-screen overflow-hidden text-white ">
      {/* <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.12)_0%,rgba(2,6,23,0.4)_40%,rgba(2,6,23,0.72)_100%)]" />
      <div className="absolute left-0 right-0 top-0 h-[260px] rounded-b-[50%] bg-[rgba(125,105,255,0.12)] blur-[1px]" /> */}

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-10">
        <div className="scale-100 sm:scale-100 ls-float">
          <Logo />
        </div>
        <div className="mt-10">
          <h1 className="text-base  font-black text-center uppercase italic leading-[0.95] tracking-[-0.03em]">
            <span className="text-white"></span>{" "}
            <span className="brand-highlight-text">
              PLAY LUDO WIN WITH FRIENDS!
            </span>{" "}
            <span className="text-white"></span>
          </h1>
        </div>

        <div className="mt-14 flex flex-col gap-5">
          <Link href="/offline">
            <button
              type="submit"
              className="flex items-center justify-center ls-btn ls-btn-logo-blue ls-shine-effect w-full py-4 text-[16px] font-black disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              Play Offline
            </button>
          </Link>

          {/* ── Decorative Divider ── */}
          <div className=" flex w-full items-center gap-3">
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,215,0,0.9))",
              }}
            />
            <span className="text-white text-xs font-bold">✦ OR ✦</span>
            <div
              className="flex-1 h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,215,0,0.9), transparent)",
              }}
            />
          </div>

          <Link href="/login" className=" text-white">
            <button
              type="submit"
              className="flex items-center justify-center ls-btn ls-btn-logo-pink ls-shine-effect w-full py-4 text-[16px] font-black disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              Sin In
            </button>
          </Link>

          <Link href="/register" className=" text-white">
            <button
              type="submit"
              className="flex items-center justify-center ls-btn ls-btn-logo-green ls-shine-effect w-full py-4 text-[16px] font-black disabled:opacity-70 disabled:cursor-not-allowed mt-1"
            >
              Create New Account
            </button>
          </Link>
        </div>
      </section>
    </main>
  );
}
