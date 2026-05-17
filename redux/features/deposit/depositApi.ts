import { apiSlice } from "../api/apiSlice";

export const depositApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // create deposit request
    createDepositRequest: builder.mutation<any, any>({
      query: (body) => ({
        url: "/create-new-deposit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Deposits"],
    }),

    // get my deposits or logged in user deposits
    getMyDeposits: builder.query<any, any>({
      query: () => "/my-deposits",
      providesTags: ["Deposits"],
    }),

    // get single deposit
    getDeposit: builder.query<any, any>({
      query: (id) => `/deposit/${id}`,
      providesTags: ["Deposits"],
    }),

    // get active deposit method
    getActiveDepositMethod: builder.query<any, any>({
      query: () => "/deposit-method/active",
    }),

    /* ────────── Get Payment Methods ────────── */
    getPaymentMethods: builder.query<any, any>({
      query: () => "/payment-methods",
    }),

    /* ────────── Create new Deposit with BDT ────────── */
    createDepositWithBDT: builder.mutation<any, any>({
      query: (body) => ({
        url: "/create-new-deposit-bdt",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Deposits"],
    }),
    /* ────────── Get Single Payment Method By Name ────────── */
    getPaymentMethodByName: builder.query<any, string>({
      query: (methodName) => `/payment-methods/${methodName}`,
    }),

    /* ─────────────────────────────────────────────
       ✅ NEW (ADDED ONLY) - Agent based deposit channels
       GET /agent/me/payment-methods -> { success:true, data:[...] }
    ───────────────────────────────────────────── */

    getMyDepositPaymentMethods: builder.query<
      GetMyDepositPaymentMethodsResponse,
      void
    >({
      query: () => ({
        url: "/deposit-payment-methods/active",
        method: "GET",
      }),
      providesTags: ["AgentPaymentMethods"],
    }),

    /* ────────── Backward Compatible Hook Alias ────────── */
    getMyAgentPaymentMethods: builder.query<
      GetMyDepositPaymentMethodsResponse,
      void
    >({
      query: () => ({
        url: "/deposit-payment-methods/active",
        method: "GET",
      }),
      providesTags: ["AgentPaymentMethods"],
    }),

    // Optional helper endpoint (client side filter alternative)
    getMyDepositPaymentMethodsByName: builder.query<
      GetMyDepositPaymentMethodsResponse,
      string
    >({
      query: (methodName) => ({
        url: `/agent/me/payment-methods?methodName=${encodeURIComponent(
          methodName,
        )}`,
        method: "GET",
      }),
      providesTags: ["AgentPaymentMethods"],
    }),

    getMyDepositPaymentMethodById: builder.query<
      { success: boolean; data: DepositPaymentMethod },
      string
    >({
      query: (id) => ({
        url: `/deposit-payment-methods/${id}`,
        method: "GET",
      }),
    }),

    /* ────────── Backward Compatible Payment Method By ID Hook ────────── */
    getMyAgentPaymentMethodById: builder.query<
      { success: boolean; data: DepositPaymentMethod },
      string
    >({
      query: (id) => ({
        url: `/deposit-payment-methods/${id}`,
        method: "GET",
      }),
    }),

    /* ────────── Get My Deposits BDT (Deposit Record) ────────── */
    getMyDepositsBDT: builder.query<
      { success: boolean; deposits: any[]; totalAmount: number },
      {
        from?: string;
        to?: string;
        status?: string; // approved | pending | failed | expired | confirmed | all
        walletTitle?: string; // NAGAD/BKASH optional
      }
    >({
      query: (params) => {
        const qs = new URLSearchParams();

        if (params?.from) qs.set("from", params.from);
        if (params?.to) qs.set("to", params.to);
        if (params?.status) qs.set("status", params.status);
        if (params?.walletTitle) qs.set("walletTitle", params.walletTitle);

        return `/my-deposits-bdt?${qs.toString()}`;
      },
      providesTags: ["Deposits"],
    }),

    /* ────────── redux/features/deposit/depositApi.ts এ এই endpoint টি add করো: ────────── */

    /* ════════════════════════════════════════════════════════════════
   BlockBee Deposit API
   ✅ amount
   ✅ chain / network
   ✅ sourceAddress
   ✅ promotionOptIn
════════════════════════════════════════════════════════════════ */
    createDepositWithBlockBee: builder.mutation<
      any,
      {
        amount: number;
        chain?: string;
        network?: string;
        sourceAddress?: string;
        promotionOptIn?: boolean;
      }
    >({
      query: (body) => ({
        url: "/create-new-deposit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Deposits", "User"],
    }),

    /* ────────── binance payment: ────────── */
    depositWithBinance: builder.mutation<any, any>({
      query: (body) => ({
        url: "/binance-payment",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Deposits"],
    }),

    /* ────────── binance payment: ────────── */
    confirmBinanceDeposit: builder.mutation<
      any,
      { depositId: string; orderId: string }
    >({
      query: ({ depositId, orderId }) => ({
        url: `/binance-payment/${depositId}/retry`,
        method: "POST",
        body: { orderId },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

/* ─────────────────────────────
   ✅ NEW Types (ADDED ONLY)
───────────────────────────── */
export type DepositPaymentMethod = {
  _id: string;
  accountNumber: string;
  methodName: string;
  methodType: string;
  title?: string;
  isActive?: boolean;
  isDefault?: boolean;
  isHiddenFromAgent?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type GetMyDepositPaymentMethodsResponse = {
  success: boolean;
  data: DepositPaymentMethod[];
};

/* ────────── Backward Compatible Type Aliases ────────── */
export type AgentPaymentMethod = DepositPaymentMethod;
export type GetMyAgentPaymentMethodsResponse =
  GetMyDepositPaymentMethodsResponse;

export const {
  useCreateDepositRequestMutation,
  useGetMyDepositsQuery,
  useGetDepositQuery,
  useGetActiveDepositMethodQuery,
  useDepositWithBinanceMutation,
  useGetPaymentMethodsQuery,
  useCreateDepositWithBDTMutation,
  useGetPaymentMethodByNameQuery,

  /* ────────── Deposit Payment Method Hooks ────────── */
  useGetMyDepositPaymentMethodsQuery,
  useLazyGetMyDepositPaymentMethodsQuery,
  useGetMyAgentPaymentMethodsQuery,
  useLazyGetMyAgentPaymentMethodsQuery,
  useGetMyDepositPaymentMethodsByNameQuery,
  useLazyGetMyDepositPaymentMethodsByNameQuery,

  useGetMyDepositPaymentMethodByIdQuery,
  useLazyGetMyDepositPaymentMethodByIdQuery,
  useGetMyAgentPaymentMethodByIdQuery,
  useLazyGetMyAgentPaymentMethodByIdQuery,
  /* ✅ Deposit Record (BDT) */
  useGetMyDepositsBDTQuery,
  useLazyGetMyDepositsBDTQuery,

  useCreateDepositWithBlockBeeMutation,

  useConfirmBinanceDepositMutation,
} = depositApi;
