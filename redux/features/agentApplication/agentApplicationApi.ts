import { apiSlice } from "../api/apiSlice";

/* ────────── Types ────────── */
export type AgentApplicationType = "e-wallet" | "cash";
export type AgentApplicationStatus = "pending" | "approved" | "rejected";

export interface AgentApplicationStatusRes {
  success: boolean;
  data: {
    _id: string;
    agentType: AgentApplicationType;
    status: AgentApplicationStatus;
    adminNote: string;
    createdAt: string;
    reviewedAt: string | null;
  } | null;
}

export interface SubmitAgentApplicationPayload {
  agentType: AgentApplicationType;
  fullName: string;
  phone: string;
  whatsapp?: string;
  telegram?: string;
  address?: string;
  note?: string;
}

export const agentApplicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── my latest application status ────────── */
    getMyAgentApplicationStatus: builder.query<AgentApplicationStatusRes, void>({
      query: () => ({ url: "/agent-application/my-status", method: "GET" }),
      providesTags: ["AgentApplication"],
    }),

    /* ────────── submit a new application ────────── */
    submitAgentApplication: builder.mutation<
      { success: boolean; message: string },
      SubmitAgentApplicationPayload
    >({
      query: (body) => ({
        url: "/agent-application",
        method: "POST",
        body,
      }),
      invalidatesTags: ["AgentApplication"],
    }),
  }),
});

export const {
  useGetMyAgentApplicationStatusQuery,
  useSubmitAgentApplicationMutation,
} = agentApplicationApi;
