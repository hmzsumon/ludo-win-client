type Props = {
  dashboard?: any;
  isLoading?: boolean;
};

const ProfileHistoryCard = ({ dashboard, isLoading }: Props) => {
  const historyRows = dashboard?.gameHistory || [];

  return (
    <section className="relative overflow-hidden rounded-[26px] border border-white/45 bg-white/28 p-4 shadow-[0_14px_34px_rgba(0,92,190,0.16)] backdrop-blur-xl">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(35,217,255,0.9),rgba(255,243,74,0.85),rgba(255,255,255,0))]" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-cyan-300/25 blur-2xl" />

      <div className="relative flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/45 bg-[linear-gradient(180deg,#23d9ff_0%,#0676df_100%)] text-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_8px_18px_rgba(0,95,190,0.22)]">
          📝
        </span>
        <h3 className="text-[17px] font-black tracking-tight text-[#073d95]">
          Game History
        </h3>
      </div>

      <div className="relative mt-4 space-y-2.5">
        {isLoading ? (
          <p className="rounded-2xl border border-white/45 bg-white/35 p-4 text-sm font-bold text-[#063f9a]/70">
            Loading...
          </p>
        ) : historyRows.length === 0 ? (
          <p className="rounded-2xl border border-white/45 bg-white/35 p-4 text-sm font-bold text-[#063f9a]/70">
            No game history found.
          </p>
        ) : (
          historyRows.map((row: any, idx: number) => (
            <div
              key={`${row.roomName}-${idx}`}
              className="flex items-center justify-between gap-3 rounded-[20px] border border-white/55 bg-white/42 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
            >
              <div className="min-w-0">
                <p className="truncate text-[15px] font-black text-[#06357f]">
                  {row.opponentName || "Unknown Player"}
                </p>
                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-[#0671cf]/65">
                  Recent Match Result
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={`text-[14px] font-black ${
                    row.result === "win"
                      ? "text-[#f2a900]"
                      : row.result === "lose"
                        ? "text-[#ef174d]"
                        : "text-[#0474d5]"
                  }`}
                >
                  {row.result === "win"
                    ? "WON"
                    : row.result === "lose"
                      ? "LOSE"
                      : "REFUND"}
                </p>

                <p className="mt-0.5 text-[16px] font-black text-[#063f9a]">
                  💎
                  {Number(
                    row.result === "win" ? row.payoutAmount : row.betAmount,
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default ProfileHistoryCard;
