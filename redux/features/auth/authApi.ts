/* ────────── imports ────────── */
import { removeAccessToken, saveAccessToken } from "@/utils/authToken";
import { apiSlice } from "../api/apiSlice";
import { loadUser, logoutUser, setUser } from "./authSlice";

export interface IUser {
  user: any;
  token: string;
  success: boolean;
  message?: string;
  data?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /* ────────── Register User ────────── */
    registerUser: builder.mutation<
      IUser,
      {
        name: string;
        email: string;
        phone: string;
        password: string;
        partnerCode?: string;
      }
    >({
      query: (body) => ({
        url: "/register",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Verify Email ────────── */
    verifyEmail: builder.mutation<
      { success: boolean; message: string },
      { email: string; code: string }
    >({
      query: (body) => ({
        url: "/verify-email",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    /* ────────── Resend Verification Email ────────── */
    resendVerificationEmail: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (body) => ({
        url: "/resend-verification-email",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Login User ────────── */
    loginUser: builder.mutation<
      IUser,
      {
        phone: string;
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

          /* ────────── persist access token for socket auth ────────── */
          saveAccessToken(result?.data?.token || null);

          /* ────────── update redux auth state ────────── */
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
      { success: boolean; message: string; exists: boolean },
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
      { success: boolean; message: string },
      { email: string }
    >({
      query: (body) => ({
        /* ────────── forgot password এর নিজস্ব OTP endpoint ────────── */
        url: "/forgot-password/send-otp",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Forgot Password: Verify Code ────────── */
    verifyResetCode: builder.mutation<
      { success: boolean; message: string; resetToken: string },
      { email: string; otp: string }
    >({
      query: (body) => ({
        url: "/verify-otp-for-password",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Forgot Password: Reset Password ────────── */
    resetForgotPassword: builder.mutation<
      { success: boolean; message: string },
      { email: string; newPassword: string; resetToken: string }
    >({
      query: (body) => ({
        url: "/reset-forgot-password",
        method: "POST",
        body,
      }),
    }),

    /* ────────── Change Password ────────── */
    changePassword: builder.mutation<
      { success: boolean; message: string },
      { oldPassword: string; newPassword: string }
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

    /* ────────── add user payment method ────────── */
    addUserPaymentMethod: builder.mutation<any, any>({
      query: (body) => ({
        url: `/add-user-payment-method`,
        method: "POST",
        body,
      }),

      invalidatesTags: ["User"],
    }),

    /* ────────── get user payment methods ────────── */
    getUserPaymentMethods: builder.query<any, any>({
      query: () => ({
        url: `/get-user-payment-methods`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useVerifyEmailMutation,
  useResendVerificationEmailMutation,
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
