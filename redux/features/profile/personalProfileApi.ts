// ✅ personalProfileApi.ts
// RTK Query – personal profile endpoints

import { apiSlice } from "../api/apiSlice";

/* ────────── Types ────────── */
export interface IPersonalProfile {
  accountNumber: string;
  email: string;
  phone: string;
  registrationDate: string;
  daysSincePasswordChange: number;
  fullName: string;
  countryCode: string;
  countryName: string;
  city: string;
}

export interface IUpdateProfilePayload {
  countryCode?: string;
  countryName?: string;
  city?: string;
  avatar?: string;
}

export interface ILinkPhonePayload {
  phone: string;
}

/* ────────── API Slice Injection ────────── */
export const personalProfileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* 🔍 Profile data */
    getPersonalProfile: builder.query<
      { success: boolean; profile: IPersonalProfile },
      void
    >({
      query: () => ({
        url: "/personal-profile",
        method: "GET",
      }),
      providesTags: [{ type: "User", id: "PERSONAL_PROFILE" }],
    }),

    /* ✏️ Profile update */
    updatePersonalProfile: builder.mutation<
      { success: boolean; message: string },
      IUpdateProfilePayload
    >({
      query: (body) => ({
        url: "/personal-profile/update",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [
        { type: "User", id: "PERSONAL_PROFILE" },
        { type: "User", id: "ME" },
      ],
    }),

    /* 📱 Phone link */
    linkPhone: builder.mutation<
      { success: boolean; message: string },
      ILinkPhonePayload
    >({
      query: (body) => ({
        url: "/personal-profile/link-phone",
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "PERSONAL_PROFILE" }],
    }),
  }),
});

export const {
  useGetPersonalProfileQuery,
  useUpdatePersonalProfileMutation,
  useLinkPhoneMutation,
} = personalProfileApi;
