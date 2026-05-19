"use client";

type Props = {
  dashboard?: any;
  isLoading?: boolean;
};

const ProfileAccountCard = ({ dashboard, isLoading }: Props) => {
  const infoRows = [
    { label: "Name", value: dashboard?.profile?.name || "-", icon: "👤" },
    { label: "Email", value: dashboard?.profile?.email || "-", icon: "📧" },
    { label: "Mobile", value: dashboard?.profile?.phone || "-", icon: "📱" },
    {
      label: "Customer ID",
      value: dashboard?.profile?.customerId || "-",
      icon: "🆔",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-white/45 bg-white/28 p-4 shadow-[0_14px_34px_rgba(0,92,190,0.16)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(35,217,255,0.9),rgba(255,243,74,0.85),rgba(255,255,255,0))]" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-300/25 blur-2xl" />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/45 bg-[linear-gradient(180deg,#23d9ff_0%,#0676df_100%)] text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_18px_rgba(0,95,190,0.22)]">
            🪪
          </span>
          <h3 className="text-[17px] font-black text-[#073d95]">
            Account Info
          </h3>
        </div>
      </div>

      <div className="space-y-2.5">
        {infoRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center gap-3 rounded-2xl border border-white/55 bg-white/42 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e9f8ff] text-base shadow-[0_6px_14px_rgba(0,86,180,0.1)]">
              {row.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/90 leading-none">
                {row.label}
              </p>
              <p className="mt-1 truncate text-[13px] font-black text-lime-400">
                {isLoading ? "Loading..." : row.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfileAccountCard;
