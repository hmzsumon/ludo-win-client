// ✅ app/(ludo)/transaction-history/page.tsx

import TransactionHistoryShell from "@/components/transaction-history/TransactionHistoryShell";
import React from "react";

export const metadata = {
  title: "Transaction History",
};

const TransactionHistoryPage = () => {
  return <TransactionHistoryShell />;
};

export default React.memo(TransactionHistoryPage);
