"use client";

import type { ILudoFriendRoomPreview, TColors, TGameMode } from "@/interfaces";
import { apiSlice } from "@/redux/features/api/apiSlice";

/* ────────── ludo wager api ────────── */
export const ludoWagerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* NEW ▸ Public feature gates keep disabled Friends controls out of the UI. */
    getPublicLudoRuntimeConfig: builder.query<
      {
        success: boolean;
        config: {
          enabled: boolean;
          activeMode: "easy" | "assist" | "smart";
          humanSixChancePercent: number;
          playWithFriendsEnabled: boolean;
          freeFriendsEnabled: boolean;
          wagerFriendsEnabled: boolean;
        };
      },
      void
    >({ query: () => "/ludo-bot-config" }),
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

    /* NEW ▸ Server-created Free/Wager friend rooms. */
    createLudoFriendRoom: builder.mutation<
      { success: boolean; room: ILudoFriendRoomPreview },
      {
        matchType: "free" | "wager";
        totalPlayers: 2;
        gameMode: TGameMode;
        initialColor: TColors;
        betAmount?: number;
      }
    >({
      query: (body) => ({
        url: "/games/ludo/friends/rooms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet", "User"],
    }),

    previewLudoFriendRoom: builder.query<
      { success: boolean; room: ILudoFriendRoomPreview },
      string
    >({
      query: (roomCode) => `/games/ludo/friends/rooms/${roomCode}`,
    }),

    joinLudoFriendRoom: builder.mutation<
      { success: boolean; room: ILudoFriendRoomPreview },
      { roomCode: string }
    >({
      query: ({ roomCode }) => ({
        url: `/games/ludo/friends/rooms/${roomCode}/join`,
        method: "POST",
      }),
      invalidatesTags: ["Wallet", "User"],
    }),

    cancelLudoFriendRoom: builder.mutation<
      { success: boolean; message: string },
      { roomCode: string }
    >({
      query: ({ roomCode }) => ({
        url: `/games/ludo/friends/rooms/${roomCode}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Wallet", "User"],
    }),
  }),
});

export const {
  useGetPublicLudoRuntimeConfigQuery,
  useReserveLudoWagerMutation,
  useCancelLudoWagerMutation,
  useCreateLudoFriendRoomMutation,
  useLazyPreviewLudoFriendRoomQuery,
  useJoinLudoFriendRoomMutation,
  useCancelLudoFriendRoomMutation,
} = ludoWagerApi;
