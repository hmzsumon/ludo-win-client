const transactions = [
  {
    type: "Withdraw",
    amount: "💎500",
    time: "2:45 PM Today",
    icon: "⬇️",
    color: "#ff6b6b",
    bg: "rgba(255,107,107,0.1)",
    border: "rgba(255,107,107,0.2)",
  },
  {
    type: "Deposit",
    amount: "💎1,200",
    time: "10:15 AM Today",
    icon: "⬆️",
    color: "#4cde7e",
    bg: "rgba(76,222,126,0.1)",
    border: "rgba(76,222,126,0.2)",
  },
  {
    type: "Game Win",
    amount: "💎350",
    time: "Yesterday 8:30 PM",
    icon: "🏆",
    color: "#ffd700",
    bg: "rgba(255,215,0,0.1)",
    border: "rgba(255,215,0,0.2)",
  },
];

const WalletTransactionCard = () => {
  return (
    <section
      className="relative rounded-[20px] overflow-hidden p-4"
      style={{
        background:
          "linear-gradient(145deg, rgba(74,26,138,0.6) 0%, rgba(29,5,70,0.7) 100%)",
        border: "1px solid rgba(255,215,0,0.15)",
        boxShadow:
          "0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Shine line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">📜</span>
          <h3 className="text-[17px] font-black text-white">Transactions</h3>
        </div>
        <button className="ls-btn ls-btn-purple px-3 py-1.5 text-[11px] font-black">
          View All
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-2">
        {transactions.map((item, idx) => (
          <div
            key={`${item.type}-${idx}`}
            className="flex items-center justify-between rounded-xl px-3 py-3 gap-3"
            style={{ background: item.bg, border: `1px solid ${item.border}` }}
          >
            <div className="flex items-center gap-3">
              {/* Icon circle */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg shrink-0"
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                }}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-[14px] font-black text-white">{item.type}</p>
                <p className="text-[11px] font-semibold text-white/40">
                  {item.time}
                </p>
              </div>
            </div>
            <p
              className="text-[18px] font-black shrink-0"
              style={{ color: item.color }}
            >
              {item.amount}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WalletTransactionCard;
