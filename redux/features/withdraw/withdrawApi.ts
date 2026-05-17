import { apiSlice } from "../api/apiSlice";

/* ────────── Types ────────── */

export type WithdrawStatus =
  | "all"
  | "approved"
  | "pending"
  | "confirmed"
  | "rejected"
  | "failed"
  | "cancelled"
  | "expired"; // UI compat (backend map can convert to cancelled)

export type GetMyWithdrawsArgs = {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  status: WithdrawStatus;
};

export type WithdrawMethod = {
  name?: string;
  accountNumber?: string;
};

export type Withdraw = {
  _id: string;
  sl_no?: string;

  userId?: string;

  name?: string;
  phone?: string;
  email?: string;
  customerId?: string;

  amount: number;
  netAmount?: number;
  charge?: number;

  method?: WithdrawMethod;

  status?: string;

  withdrawCode?: string;

  txnId?: string;
  agentNumber?: string;

  approvedAt?: string;
  processedAt?: string;

  createdAt?: string;
  updatedAt?: string;

  rejected_reason?: string;
};

export type GetMyWithdrawsResponse = {
  success: boolean;
  withdraws: Withdraw[];
  totalAmount: number;
  totalNetAmount: number;
};

export type CreateWithdrawRequestResponse = {
  success: boolean;
  message: string;
  data?: Withdraw;
};

export type CreateWithdrawRequestBody = {
  amount: number;
  method: any;
  payoutCurrency: "BDT" | "USDT";
  pass: string;
};

export type CashWithdrawAgent = {
  _id: string;
  agentTitle?: string;
  name?: string;
  customerId?: string;
  phone?: string;
  agentType?: "cash";
  status?: string;
};

/* ────────── API ────────── */

export const withdrawApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // create new withdraw request
    createWithdrawRequest: builder.mutation<
      CreateWithdrawRequestResponse,
      CreateWithdrawRequestBody
    >({
      query: (body) => ({
        url: `/new-withdraw-request`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Withdraws"],
    }),

    // cancel own pending withdraw request
    cancelMyWithdrawRequest: builder.mutation<
      { success: boolean; message: string; withdraw: Withdraw },
      string
    >({
      query: (id) => ({
        url: `/withdraw/cancel/${id}`,
        method: "PUT",
      }),
      invalidatesTags: ["User", "Withdraws"],
    }),

    // old: get my withdraw requests (no filter)
    getMyWithdrawRequests: builder.query<
      { success: boolean; withdraws: Withdraw[] },
      void
    >({
      query: () => `/my-withdraws`,
      providesTags: ["Withdraws"],
    }),

    // get all agents
    getAllAgents: builder.query<any, void>({
      query: () => `/get-all-agents`,
    }),

    // cash type agents for cash withdraw dropdown
    getCashWithdrawAgents: builder.query<
      { success: boolean; data: CashWithdrawAgent[] },
      void
    >({
      query: () => `/withdraw/cash-agents`,
    }),

    // ✅ NEW: filtered withdraw record (from/to/status)
    // endpoint name = getMyWithdraws  => hook = useGetMyWithdrawsQuery ✅
    getMyWithdraws: builder.query<GetMyWithdrawsResponse, GetMyWithdrawsArgs>({
      query: ({ from, to, status }) => ({
        // ⚠️ তুমি যে baseUrl/use case ব্যবহার করো সেটার উপর নির্ভর করে:
        // যদি apiSlice baseUrl already "/withdraw" হয়, তাহলে শুধু "/my-withdraws" দাও
        // নিচে আমি তোমার দেয়া url 그대로 রাখলাম:
        url: `/my-withdraws`,
        method: "GET",
        params: { from, to, status },
      }),
      providesTags: ["Withdraws"],
    }),
  }),
});

export const {
  useCreateWithdrawRequestMutation,
  useCancelMyWithdrawRequestMutation,
  useGetMyWithdrawRequestsQuery,
  useGetAllAgentsQuery,
  useGetCashWithdrawAgentsQuery,

  // ✅ fixed hook name
  useGetMyWithdrawsQuery,
} = withdrawApi;
