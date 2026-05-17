/* ────────────────────────────────────────────────────────────────
   app/(auth)/vip-cashback/history/page.tsx
   VIP Cashback History Page
   ────────────────────────────────────────────────────────────── */

import VipCashbackHistoryShell from "@/components/vip/vip-cashback-history-shell";

export const metadata = {
  title: "Cashback History | Ludo Party",
};

export default function VipCashbackHistoryPage() {
  return <VipCashbackHistoryShell />;
}
