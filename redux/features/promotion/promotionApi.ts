import { apiSlice } from "../api/apiSlice";

export type PromotionTier = {
  from: number;
  to: number;
  percent: number;
};

/* ────────── Deposit bonus info response ────────── */
export type DepositPromoInfoRes = {
  success: boolean;
  data: {
    tiers: PromotionTier[];
    sponsorTiers: PromotionTier[];
    turnoverMultiplier: number;
    bonusTakenCount: number;
    nextBonusDepositNumber: number;
    nextBonusPercent: number;
    showPromo: boolean;
  };
};

export type DailyBonusStatusRes = {
  success: boolean;
  data: {
    todayKey: string;
    todayDepositsCount: number;
    highestApprovedDeposit: number;
    claimableAmount: number;
    alreadyClaimed: boolean;
    claimedAmount: number;
    canClaim: boolean;
    claimedAt: string | null;
    turnoverMultiplier: number;
    lowDepositThreshold: number;
    lowReward: number;
    highReward: number;
  };
};

export const promotionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── Get deposit promo eligibility ────────── */
    getDepositPromoInfo: builder.query<DepositPromoInfoRes, void>({
      query: () => ({
        url: "/promotion/deposit-bonus",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    /* ────────── Get daily bonus status ────────── */
    getDailyBonusStatus: builder.query<DailyBonusStatusRes, void>({
      query: () => ({
        url: "/promotion/daily-bonus",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    /* ────────── Claim daily bonus ────────── */
    claimDailyBonus: builder.mutation<
      { success: boolean; message: string; data: { claimedAmount: number } },
      void
    >({
      query: () => ({
        url: "/promotion/daily-bonus/claim",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetDepositPromoInfoQuery,
  useGetDailyBonusStatusQuery,
  useClaimDailyBonusMutation,
} = promotionApi;
