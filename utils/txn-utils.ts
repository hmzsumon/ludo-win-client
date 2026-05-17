// ✅ txn-utils.ts
// Transaction purpose category detect + color/icon helper

export type TxnCategory = "deposit" | "withdraw" | "refund" | "bonus" | "other";

/* ────────── Purpose → Category map ────────── */
const DEPOSIT_SET = new Set(["Deposit", "Admin Deposit", "Refund"]);

const REFUND_SET = new Set([
  "Withdrawal Refund",
  "Withdrawal Cancel Refund", // ✅ old data support: আগে bonus হিসেবে দেখাচ্ছিল
]);

const WITHDRAW_SET = new Set(["Withdraw Request", "Withdraw Completed"]);

export function getPurposeCategory(purpose: string): TxnCategory {
  if (DEPOSIT_SET.has(purpose)) return "deposit";
  if (REFUND_SET.has(purpose)) return "refund";
  if (WITHDRAW_SET.has(purpose)) return "withdraw";
  return "bonus";
}

/* ────────────────────────────────────────────
   ✅ Dark theme color config — প্রজেক্টের #14041f base
   - deposit:  teal  (#23ffc8) — + icon
   - refund:   blue  (#3cb4ff) — + icon
   - withdraw: red   (#ff5c5c) — − icon
   - bonus:    gold  (#ffc403) — + icon
─────────────────────────────────────────────*/
export interface TxnStyle {
  cardBg: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  // "+" অথবা "−" text
  icon: string;
  amountColor: string;
  amountPrefix: string;
  // badge label
  badgeLabel: string;
}

export function getTxnStyle(category: TxnCategory): TxnStyle {
  if (category === "deposit") {
    return {
      // ✅ Deep teal-purple card
      cardBg:
        "linear-gradient(135deg, rgba(35,255,200,0.13) 0%, rgba(1,60,120,0.30) 100%)",
      borderColor: "rgba(35,255,200,0.40)",
      iconBg: "rgba(35,255,200,0.18)",
      iconColor: "#23ffc8",
      icon: "+",
      amountColor: "#23ffc8",
      amountPrefix: "+",
      badgeLabel: "DEPOSIT",
    };
  }

  if (category === "refund") {
    return {
      // ✅ Refund card — bonus না, balance return বোঝাবে
      cardBg:
        "linear-gradient(135deg, rgba(60,180,255,0.16) 0%, rgba(40,60,130,0.30) 100%)",
      borderColor: "rgba(60,180,255,0.48)",
      iconBg: "rgba(60,180,255,0.20)",
      iconColor: "#3cb4ff",
      icon: "+",
      amountColor: "#3cb4ff",
      amountPrefix: "+",
      badgeLabel: "REFUND",
    };
  }

  if (category === "withdraw") {
    return {
      // ✅ Deep red card
      cardBg:
        "linear-gradient(135deg, rgba(255,70,70,0.16) 0%, rgba(100,10,10,0.30) 100%)",
      borderColor: "rgba(255,80,80,0.45)",
      iconBg: "rgba(255,80,80,0.20)",
      iconColor: "#ff5c5c",
      icon: "−",
      amountColor: "#ff5c5c",
      amountPrefix: "−",
      badgeLabel: "WITHDRAW",
    };
  }

  // ✅ Deep golden card
  return {
    cardBg:
      "linear-gradient(135deg, rgba(255,196,3,0.15) 0%, rgba(120,70,0,0.28) 100%)",
    borderColor: "rgba(255,196,3,0.45)",
    iconBg: "rgba(255,196,3,0.20)",
    iconColor: "#ffc403",
    icon: "+",
    amountColor: "#ffc403",
    amountPrefix: "+",
    badgeLabel: "BONUS",
  };
}

/* ── time format: "09:17" ── */
export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/* ── amount format: "1,900" ── */
export function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
