import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
};

export default function AuthShell({ children }: AuthShellProps): JSX.Element {
  return (
    <main className="relative min-h-[100dvh] overflow-y-auto text-white ls-stars-bg">
      {/* ── Decorative glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-25"
          style={{
            background: "radial-gradient(circle, #ff5fe1 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-[10%] right-[-80px] w-[250px] h-[250px] rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, #ff9bf0 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-[50%] left-[-60px] w-[200px] h-[200px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #c86bff 0%, transparent 70%)",
          }}
        />

        {/* Floating star decorations */}
        {[
          "top-[10%] left-[10%] text-base",
          "top-[20%] right-[8%] text-sm",
          "top-[60%] left-[6%] text-xs",
          "top-[75%] right-[12%] text-sm",
          "top-[40%] right-[5%] text-xs",
          "top-[85%] left-[15%] text-base",
        ].map((cls, i) => (
          <div key={i} className={`absolute ${cls} text-yellow-400 opacity-40`}>
            ★
          </div>
        ))}
      </div>

      {/* ── Decorative top arch ── */}
      {/* <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-[180px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,95,225,0.18) 0%, transparent 100%)",
          borderBottom: "1px solid rgba(255,201,245,0.12)",
        }}
      /> */}

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-6 pb-10 pt-3">
        {children}
      </div>
    </main>
  );
}
