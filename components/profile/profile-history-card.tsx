type Props = {
  dashboard?: any;
  isLoading?: boolean;
};

const ProfileHistoryCard = ({ dashboard, isLoading }: Props) => {
  const historyRows = dashboard?.gameHistory || [];

  return (
    <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(31,28,102,0.78)_0%,rgba(10,18,62,0.82)_100%)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.28)] backdrop-blur sm:p-5">
      <div className="flex items-center gap-3">
        <span className="text-[28px]">📝</span>
        <h3 className="text-[22px] font-black tracking-tight text-white">
          Game History
        </h3>
      </div>

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="text-white/60">Loading...</p>
        ) : historyRows.length === 0 ? (
          <p className="text-white/60">No game history found.</p>
        ) : (
          historyRows.map((row: any, idx: number) => (
            <div
              key={`${row.roomName}-${idx}`}
              className="flex items-center justify-between rounded-[18px] bg-[rgba(255,255,255,0.04)] px-4 py-4 ring-1 ring-white/10"
            >
              <div>
                <p className="text-lg font-extrabold text-white">
                  {row.opponentName || "Unknown Player"}
                </p>
                <p className="mt-1 text-sm font-medium text-white/60">
                  Recent Match Result
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-xl font-black ${
                    row.result === "win"
                      ? "text-[#ffcf45]"
                      : row.result === "lose"
                        ? "text-[#ff6a8f]"
                        : "text-[#55c7ff]"
                  }`}
                >
                  {row.result === "win"
                    ? "WON"
                    : row.result === "lose"
                      ? "LOSE"
                      : "REFUND"}
                </p>

                <p className="mt-1 text-lg font-extrabold text-white">
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
