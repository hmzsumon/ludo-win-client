"use client";

import { apiSlice } from "@/redux/features/api/apiSlice";

/* ────────── ludo wager api ────────── */
export const ludoWagerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    reserveLudoWager: builder.mutation<
      {
        success: boolean;
        reservationId: string;
        amount: number;
        balance: number;
        expiresAt: string;
      },
      { amount: number; totalPlayers: 2 }
    >({
      query: (body) => ({
        url: "/games/ludo/wager/reserve",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "User"],
    }),

    cancelLudoWager: builder.mutation<
      { success: boolean; message?: string; balance?: number },
      { reservationId: string }
    >({
      query: (body) => ({
        url: "/games/ludo/wager/cancel",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "User"],
    }),
  }),
});

export const { useReserveLudoWagerMutation, useCancelLudoWagerMutation } =
  ludoWagerApi;
