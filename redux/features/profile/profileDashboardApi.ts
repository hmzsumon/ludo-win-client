/* ─────────────────────────────────────────────
   📁 profileDashboardApi.ts
   Profile dashboard live data API
───────────────────────────────────────────── */

import { apiSlice } from "../api/apiSlice";

export interface IProfileDashboardResponse {
  success: boolean;
  data: {
    profile: {
      name: string;
      email: string;
      phone: string;
      customerId: string;
    };
    overview: {
      matches: number;
      winRate: number;
      earnings: number;
    };
    wallet: {
      balance: number;
    };
    rank: {
      currentRank: string;
      nextRank: string | null;
      progressPercent: number;
      progressText: string;
    };
    statistics: {
      totalMatches: number;
      wins: number;
      losses: number;
      winStreak: number;
      winRate: number;
    };
    gameHistory: Array<{
      opponentName: string;
      result: "win" | "lose" | "refund";
      betAmount: number;
      payoutAmount: number;
      roomName: string;
      settledAt: string;
    }>;
  };
}

export const profileDashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfileDashboard: builder.query<IProfileDashboardResponse, void>({
      query: () => ({
        url: "/profile-dashboard",
        method: "GET",
      }),
      providesTags: [{ type: "User", id: "PROFILE_DASHBOARD" }],
    }),
  }),
});

export const { useGetProfileDashboardQuery } = profileDashboardApi;
