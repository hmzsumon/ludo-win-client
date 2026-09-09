/* ────────── Aviator shared types ────────── */
export type AviatorPhase = "WAITING" | "RUNNING" | "CRASHED";

export type AviatorBet = {
  id: string;
  player: string;
  amount: number;
  status: string;
  cashoutMultiplier?: number;
  payout: number;
  isBot?: boolean;
  avatarUrl?: string;
};

export type AviatorSnapshot = {
  roundId: string;
  phase: AviatorPhase;
  multiplier: number;
  startsAt: number;
  bets: AviatorBet[];
  totalWin: number;
  minBet: number;
  houseEdgePercent?: number;
  maxMultiplier?: number;
  maxBet: number;
};

export type AviatorBetTab = "All Bets" | "Previous" | "Top";

export const EMPTY_AVIATOR_GAME: AviatorSnapshot = {
  roundId: "",
  phase: "WAITING",
  multiplier: 1,
  startsAt: Date.now(),
  bets: [],
  totalWin: 0,
  minBet: 1,
  maxBet: 10_000,
};

export const PREVIEW_ROUND_HISTORY = [
  1.38, 4.21, 2.81, 1.33, 14.5, 1.95, 5.77, 5.32, 1.41, 2.22, 1, 20.07,
  1.33, 1, 1.34, 1.63, 2.33, 1.75, 4.87, 1.61, 6.85, 1.35, 1, 1.26, 1,
  1.06, 1.84, 7.1, 1.26, 1.12,
];
