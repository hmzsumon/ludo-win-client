// ✅ personalProfileApi.ts
// RTK Query – personal profile endpoints

import { apiSlice } from "../api/apiSlice";

/* ────────── Types ────────── */
export interface IPersonalProfile {
  accountNumber: string;
  email: string;
  pendingEmail: string;
  emailVerified: boolean;
  phone: string;
  avatar: string;
  registrationDate: string;
  daysSincePasswordChange: number;
  fullName: string;
  countryCode: string;
  countryIso: string;
  countryName: string;
  city: string;
  identityDocumentType: "NID" | "PASSPORT" | "DRIVING_LICENSE" | "";
  identityDocumentNumber: string;
  whatsapp: string;
  telegram: string;
  facebook: string;
  profileProgress: number;
  welcomeBonusGranted: boolean;
  welcomeBonusStatus: "pending" | "granted" | "denied" | "failed";
  welcomeBonusReasonCode: string;
  welcomeBonusReason: string;
}

export interface IUpdateProfilePayload {
  fullName?: string;
  countryCode?: string;
  countryName?: string;
  city?: string;
  avatar?: string;
  identityDocumentType?: "NID" | "PASSPORT" | "DRIVING_LICENSE" | "";
  identityDocumentNumber?: string;
  whatsapp?: string;
  telegram?: string;
  facebook?: string;
}

export interface ILinkPhonePayload {
  phone: string;
}

export interface IVerifyProfileEmailResponse {
  success: boolean;
  message: string;
  email: string;
  profileProgress: number;
  welcomeBonusGranted: boolean;
  welcomeBonusStatus: "pending" | "granted" | "denied" | "failed";
  welcomeBonusReasonCode: string;
  welcomeBonusReason: string;
  welcomeBonusAmount: number;
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

    /* ✉️ Profile email verification code send / resend */
    sendProfileEmailCode: builder.mutation<
      {
        success: boolean;
        message: string;
        email: string;
        expiresInSeconds: number;
      },
      { email?: string }
    >({
      query: (body) => ({
        url: "/personal-profile/email/send-code",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "PERSONAL_PROFILE" }],
    }),

    /* ✅ Profile email 6-digit code verification */
    verifyProfileEmail: builder.mutation<
      IVerifyProfileEmailResponse,
      { code: string }
    >({
      query: (body) => ({
        url: "/personal-profile/email/verify",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "User", id: "PERSONAL_PROFILE" },
        { type: "User", id: "ME" },
        "Wallet",
        "Transactions",
      ],
    }),

    /* ✏️ Profile update */
    updatePersonalProfile: builder.mutation<
      { success: boolean; message: string; profileProgress: number },
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
  useSendProfileEmailCodeMutation,
  useVerifyProfileEmailMutation,
  useUpdatePersonalProfileMutation,
  useLinkPhoneMutation,
} = personalProfileApi;
