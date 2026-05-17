import { apiSlice } from "@/redux/features/api/apiSlice";

/* ── Types ── */
export interface InviteData {
  totalEarning: number;
  totalTeamMember: number;
  todayBonus: number;
}

export interface TeamMember {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  level: number;
  status: "active" | "inactive";
  deposit: number;
  commission: number;
  joinDate: string;
}

export interface TeamSummary {
  totalTeamMember: number;
  teamActiveMember: number;
  totalTeamCommission: number;
  todayTeamCommission: number;
  thisMonthCommission: number;
  level_1: { activeUsers: number; commission: number };
  level_2: { activeUsers: number; commission: number };
  level_3: { activeUsers: number; commission: number };
}

export const inviteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* GET /get-invite-data */
    getInviteData: builder.query<
      { success: boolean; inviteData: InviteData },
      void
    >({
      query: () => "/get-invite-data",
      providesTags: ["User"],
    }),

    /* GET /get-my-team-summary */
    getMyTeamSummary: builder.query<
      { success: boolean; team: TeamSummary },
      void
    >({
      query: () => "/get-my-team-summary",
      providesTags: ["User"],
    }),

    /* GET /get-my-team-members */
    getMyTeamMembers: builder.query<
      { success: boolean; members: TeamMember[] },
      void
    >({
      query: () => "/get-my-team-members",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useGetInviteDataQuery,
  useGetMyTeamSummaryQuery,
  useGetMyTeamMembersQuery,
} = inviteApi;
