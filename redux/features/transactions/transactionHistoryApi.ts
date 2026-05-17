// ✅ transactionHistoryApi.ts
// RTK Query – Transaction History API

import { apiSlice } from "../api/apiSlice";

/* ────────── Types ────────── */
export type TxnFilter = "all" | "deposit" | "withdraw" | "bonus";

export interface ITransaction {
  _id: string;
  unique_id: string;
  amount: number;
  transactionType: "cashIn" | "cashOut";
  purpose: string;
  description?: string;
  isCashIn: boolean;
  isCashOut: boolean;
  createdAt: string;
}

export interface IGroupedTransactions {
  date: string; // "05.03.2026"
  transactions: ITransaction[];
}

export interface ITransactionHistoryResponse {
  success: boolean;
  data: IGroupedTransactions[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/* ────────── API Injection ────────── */
export const transactionHistoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* 🔍 Transaction history – filter + pagination */
    getTransactionHistory: builder.query<
      ITransactionHistoryResponse,
      { filter?: TxnFilter; page?: number; limit?: number }
    >({
      query: ({ filter = "all", page = 1, limit = 20 }) => ({
        url: "/transaction-history",
        method: "GET",
        params: { filter, page, limit },
      }),
      providesTags: ["Transactions"],
    }),
  }),
});

export const { useGetTransactionHistoryQuery } = transactionHistoryApi;
