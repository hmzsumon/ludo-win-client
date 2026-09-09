export type MenuPage = "menu" | "history" | "limits" | "how" | "rules";
export type AudioPreferences = { sound: boolean; music: boolean };
export type PersonalBet = {
  _id: string;
  createdAt: string;
  amount: number;
  payout: number;
  status: string;
  cashoutMultiplier?: number;
  crashPoint?: number;
};
