import BottomNav from "../dashboard/bottom-nav";
import TransactionHistoryShell from "../transaction-history/TransactionHistoryShell";
import WalletBalanceCard from "./wallet-balance-card";

const WalletShell = () => {
  return (
    <main className="min-h-screen w-full overflow-hidden text-white ls-stars-bg">
      <div className="relative min-h-screen w-full px-4 pb-32 pt-4">
        {/* ── Glow Blobs ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #ff5fe1 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-[40%] right-[-60px] w-[200px] h-[200px] rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, #ff9bf0 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="mt-2">
            <WalletBalanceCard />
          </div>
          {/* <div className="mt-4 grid grid-cols-1 gap-4">
            <WalletTransactionCard />
            <WalletPaymentCard />
            <WalletReferralCard />
          </div> */}

          <div className="mt-4">
            <TransactionHistoryShell />
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
};

export default WalletShell;
