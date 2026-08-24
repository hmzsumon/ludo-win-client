/* ────────────────────────────────────────────────────────────────
   app/(auth)/promotion/page.tsx
   Promotions & Rewards Page
   ────────────────────────────────────────────────────────────── */

import PromotionShell from "@/components/promotion/PromotionShell";

export const metadata = {
  title: "Promotions | Ludo Win",
  description: "All bonuses, rewards and VIP perks in one place",
};

export default function PromotionPage() {
  return <PromotionShell />;
}
