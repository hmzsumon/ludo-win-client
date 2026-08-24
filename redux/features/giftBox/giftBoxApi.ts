import { apiSlice } from "../api/apiSlice";

/* ────────── Gift box status response ────────── */
export type GiftBoxStatusRes = {
  success: boolean;
  data: {
    todayKey: string;
    customerId: string | null;
    enabled: boolean;
    canClaim: boolean;
    alreadyClaimed: boolean;
    claimedAmount: number;
    isJackpot: boolean;
    boxCount: number;
  };
};

/* ────────── Gift box claim response ────────── */
export type GiftBoxClaimRes = {
  success: boolean;
  message: string;
  data: {
    claimedAmount: number;
    isJackpot: boolean;
    decoyAmounts: number[];
    claimDateKey: string;
    turnoverRequired: number;
  };
};

export const giftBoxApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── Get today's gift box status ────────── */
    getGiftBoxStatus: builder.query<GiftBoxStatusRes, void>({
      query: () => ({
        url: "/gift-box/status",
        method: "GET",
      }),
      providesTags: ["GiftBox"],
    }),

    /* ────────── Claim today's gift box ────────── */
    claimGiftBox: builder.mutation<GiftBoxClaimRes, void>({
      query: () => ({
        url: "/gift-box/claim",
        method: "POST",
      }),
      invalidatesTags: ["User", "GiftBox"],
    }),
  }),
});

export const { useGetGiftBoxStatusQuery, useClaimGiftBoxMutation } =
  giftBoxApi;
