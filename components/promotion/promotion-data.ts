/* ────────────────────────────────────────────────────────────────
   promotion-data.ts

   ✅ প্রজেক্টের সব রিয়েল bonus/promotion feature-এর তথ্য এখানে —
      সংখ্যাগুলো ব্যাকএন্ডের বর্তমান ডিফল্ট কনফিগ থেকে নেওয়া
      (promotionRules.ts, VipCashbackConfig defaults, GiftBoxConfig
      defaults, WELCOME_BONUS_AMOUNT)। admin values বদলালে এখানেও
      ম্যানুয়ালি আপডেট করতে হবে — এই পেজ static marketing copy, live
      API-driven না।
   ────────────────────────────────────────────────────────────── */

export type PromotionAccent = {
  glow: string;
  border: string;
  chipBg: string;
  chipColor: string;
  btnClass: string;
};

export type PromotionItem = {
  id: string;
  emoji: string;
  title: string;
  stat: string;
  teaser: string;
  details: string[];
  ctaLabel: string;
  ctaHref: string;
  accent: PromotionAccent;
};

export const PROMOTIONS: PromotionItem[] = [
  {
    id: "gift-box",
    emoji: "🎁",
    title: "Daily Gift Box",
    stat: "Up to 💎10,000",
    teaser: "Open a free gift box every day you log in.",
    details: [
      "6 mystery boxes appear the first time you visit each day.",
      "Pick any one box and instantly reveal your reward.",
      "Rewards range from everyday small prizes to a massive jackpot.",
      "One free box per account, every single day.",
    ],
    ctaLabel: "Open Today's Box",
    ctaHref: "/dashboard",
    accent: {
      glow: "rgba(255,196,3,0.35)",
      border: "rgba(255,196,3,0.4)",
      chipBg: "rgba(255,196,3,0.16)",
      chipColor: "#ffc403",
      btnClass: "ls-btn-gold",
    },
  },
  {
    id: "deposit-bonus",
    emoji: "💰",
    title: "Deposit Bonus",
    stat: "100% on 1st deposit",
    teaser: "Get up to 100% extra on your first 3 deposits.",
    details: [
      "1st deposit → +100% bonus",
      "2nd deposit → +50% bonus",
      "3rd deposit → +25% bonus",
      "Bonus diamonds credit instantly and unlock after 1x turnover.",
    ],
    ctaLabel: "Deposit Now",
    ctaHref: "/deposit",
    accent: {
      glow: "rgba(35,255,200,0.3)",
      border: "rgba(35,255,200,0.4)",
      chipBg: "rgba(35,255,200,0.14)",
      chipColor: "#23ffc8",
      btnClass: "ls-btn-green",
    },
  },
  {
    id: "welcome-bonus",
    emoji: "🎉",
    title: "Welcome Bonus",
    stat: "💎50 Free",
    teaser: "Verify your account and get 50 diamonds — no deposit needed.",
    details: [
      "Verify your email or phone from Personal Profile.",
      "50 💎 credited instantly, one-time for new accounts.",
      "No deposit required to claim it.",
    ],
    ctaLabel: "Verify Account",
    ctaHref: "/personal-profile",
    accent: {
      glow: "rgba(60,180,255,0.32)",
      border: "rgba(60,180,255,0.42)",
      chipBg: "rgba(60,180,255,0.16)",
      chipColor: "#3cb4ff",
      btnClass: "ls-btn-blue",
    },
  },
  {
    id: "daily-bonus",
    emoji: "📅",
    title: "Daily Deposit Bonus",
    stat: "Up to 💎50 / day",
    teaser: "Deposit today and claim an extra reward, every day.",
    details: [
      "Deposit under ৳500 → claim 💎10.",
      "Deposit ৳500 or more → claim 💎50.",
      "Available once every day, on top of your deposit bonus.",
    ],
    ctaLabel: "Go to Dashboard",
    ctaHref: "/dashboard",
    accent: {
      glow: "rgba(255,111,0,0.3)",
      border: "rgba(255,159,0,0.4)",
      chipBg: "rgba(255,159,0,0.16)",
      chipColor: "#ff9f00",
      btnClass: "ls-btn-yellow",
    },
  },
  {
    id: "referral",
    emoji: "👥",
    title: "Invite & Earn",
    stat: "Up to 8% commission",
    teaser: "Earn commission every time your invited friends deposit.",
    details: [
      "Share your personal invite link with friends.",
      "Earn 8% down to 1% commission based on their deposit volume.",
      "Commission credits automatically — no manual claim needed.",
    ],
    ctaLabel: "Invite Friends",
    ctaHref: "/invite",
    accent: {
      glow: "rgba(107,53,200,0.35)",
      border: "rgba(147,97,255,0.4)",
      chipBg: "rgba(147,97,255,0.16)",
      chipColor: "#b794ff",
      btnClass: "ls-btn-purple",
    },
  },
  {
    id: "vip-cashback",
    emoji: "👑",
    title: "VIP Cashback",
    stat: "Up to 20% weekly",
    teaser: "Play more, rank up, and get real cashback every week.",
    details: [
      "8 VIP ranks — from Copper (5%) up to VIP (20%) weekly cashback.",
      "Rank is based on your matches played and turnover.",
      "Higher rank = bigger automatic payout, every week.",
    ],
    ctaLabel: "View VIP Ranks",
    ctaHref: "/vip-cashback",
    accent: {
      glow: "rgba(255,80,199,0.3)",
      border: "rgba(255,110,210,0.4)",
      chipBg: "rgba(255,110,210,0.16)",
      chipColor: "#ff8fdb",
      btnClass: "ls-btn-pink",
    },
  },
];
