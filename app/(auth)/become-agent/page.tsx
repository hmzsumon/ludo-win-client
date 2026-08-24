/* ────────────────────────────────────────────────────────────────
   app/(auth)/become-agent/page.tsx
   Become an Agent — apply, download policy PDF
   ────────────────────────────────────────────────────────────── */

import BecomeAgentShell from "@/components/agent-application/BecomeAgentShell";

export const metadata = {
  title: "Become an Agent | Ludo Win",
  description: "Apply to become a LudoWin e-wallet or cash agent",
};

export default function BecomeAgentPage() {
  return <BecomeAgentShell />;
}
