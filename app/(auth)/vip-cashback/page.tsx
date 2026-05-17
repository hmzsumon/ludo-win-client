/* ────────────────────────────────────────────────────────────────
   app/(auth)/vip-cashback/page.tsx
   VIP Cashback Page
   ────────────────────────────────────────────────────────────── */

import VipCashbackShell from "@/components/vip/vip-cashback-shell";

export const metadata = {
  title: "VIP Cashback | Ludo Party",
  description: "Check your VIP cashback rank and weekly earnings",
};

export default function VipCashbackPage() {
  return <VipCashbackShell />;
}
