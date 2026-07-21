/* ────────── imports ────────── */
import { removeAccessToken, saveAccessToken } from "@/utils/authToken";
import { apiSlice } from "../api/apiSlice";
import { loadUser, logoutUser, setUser } from "./authSlice";

/* ────────── forgot password types ────────── */

export type ResetChannel = "sms" | "email";

export interface SendResetCodePayload {
  channel: ResetChannel;
  phone?: string;
  email?: string;
}

export interface VerifyResetCodePayload {
  channel: ResetChannel;
  phone?: string;
  email?: string;
  otp: string;
}

export interface ResetForgotPasswordPayload {
  channel: ResetChannel;
  phone?: string;
  email?: string;
  newPassword: string;
  resetToken: string;
}

export interface SendResetCodeResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetCodeResponse {
  success: boolean;
  message: string;
  resetToken: string;
}

export interface ResetForgotPasswordResponse {
  success: boolean;
  message: string;
}

/* ────────── auth user types ────────── */

export interface IUser {
  user: any;
  token: string;
  success: boolean;
  message?: string;
  data?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    countryIso?: string;
    countryName?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

/* ────────── api endpoints ────────── */

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── Register User ────────── */

    registerUser: builder.mutation<
      {
        success: boolean;
        message: string;
        verificationChannel: "SMS" | "EMAIL";
        identifier: string;
      },
      {
        name: string;
        email?: string;
        localNumber: string;
        countryCode: string;
        countryIso: string;
        countryName: string;
        password: string;
        partnerCode?: string;
        deviceFingerprint: string;
      }
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Verify Registration ────────── */

    verifyRegistration: builder.mutation<
      {
        success: boolean;
        message: string;
        welcomeBonusGranted?: boolean;
      },
      {
        identifier: string;
        code: string;
      }
    >({
      query: (body) => ({
        url: "/verify-registration",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    /* ────────── Resend Registration Code ────────── */

    resendRegistrationCode: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      {
        identifier: string;
      }
    >({
      query: (body) => ({
        url: "/resend-registration-code",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Login User ────────── */

    loginUser: builder.mutation<
      IUser,
      {
        localNumber: string;
        countryCode: string;
        countryIso: string;
        countryName: string;
        password: string;
      }
    >({
      query: (body) => ({
        url: "/login",
        method: "POST",
        body,
      }),

      invalidatesTags: ["User"],

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;

          saveAccessToken(result?.data?.token || null);
          dispatch(setUser(result.data));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    /* ────────── Load User ────────── */

    loadUser: builder.query<any, void>({
      query: () => ({
        url: "/load-user",
        method: "GET",
      }),

      providesTags: [{ type: "User", id: "ME" }],

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const result = await queryFulfilled;

          dispatch(loadUser(result.data));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    /* ────────── Logout User ────────── */

    logoutUser: builder.mutation<any, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),

      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          /* ────────── clear persisted access token ────────── */

          removeAccessToken();

          /* ────────── clear redux auth state ────────── */

          dispatch(logoutUser());
        } catch (error) {
          console.log(error);
        }
      },
    }),

    /* ────────── Check Email Exists ────────── */

    checkEmailExistOrNot: builder.query<
      {
        success: boolean;
        message: string;
        exists: boolean;
      },
      string
    >({
      query: (email) => ({
        url: "/check-email-exist",
        method: "GET",
        params: { email },
      }),
    }),

    /* ────────── Forgot Password: Send Code ────────── */

    sendResetCode: builder.mutation<
      SendResetCodeResponse,
      SendResetCodePayload
    >({
      query: (body) => ({
        url: "/forgot-password/send-otp",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Forgot Password: Verify Code ────────── */

    verifyResetCode: builder.mutation<
      VerifyResetCodeResponse,
      VerifyResetCodePayload
    >({
      query: (body) => ({
        url: "/verify-otp-for-password",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Forgot Password: Reset Password ────────── */

    resetForgotPassword: builder.mutation<
      ResetForgotPasswordResponse,
      ResetForgotPasswordPayload
    >({
      query: (body) => ({
        url: "/reset-forgot-password",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Change Password ────────── */

    changePassword: builder.mutation<
      {
        success: boolean;
        message: string;
      },
      {
        oldPassword: string;
        newPassword: string;
      }
    >({
      query: (body) => ({
        url: "/change-password",
        method: "PUT",
        body,
      }),

      invalidatesTags: [
        { type: "User", id: "PERSONAL_PROFILE" },
        { type: "User", id: "ME" },
      ],
    }),

    /* ────────── Add User Payment Method ────────── */

    addUserPaymentMethod: builder.mutation<any, any>({
      query: (body) => ({
        url: "/add-user-payment-method",
        method: "POST",
        body,
      }),

      invalidatesTags: ["User"],
    }),

    /* ────────── Get User Payment Methods ────────── */

    getUserPaymentMethods: builder.query<any, void>({
      query: () => ({
        url: "/get-user-payment-methods",
        method: "GET",
      }),
    }),
  }),
});

/* ────────── exported hooks ────────── */

export const {
  useRegisterUserMutation,
  useVerifyRegistrationMutation,
  useResendRegistrationCodeMutation,
  useLoginUserMutation,
  useLoadUserQuery,
  useLogoutUserMutation,
  useLazyCheckEmailExistOrNotQuery,
  useSendResetCodeMutation,
  useVerifyResetCodeMutation,
  useResetForgotPasswordMutation,
  useChangePasswordMutation,
  useAddUserPaymentMethodMutation,
  useGetUserPaymentMethodsQuery,
} = authApi;
