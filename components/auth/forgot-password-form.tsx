"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import AuthInput from "@/components/auth/auth-input";
import Logo from "@/components/branding/logo";
import {
  useResetForgotPasswordMutation,
  useSendResetCodeMutation,
  useVerifyResetCodeMutation,
} from "@/redux/features/auth/authApi";

type StepOneValues = {
  email: string;
};

type StepTwoValues = {
  otp: string;
};

type StepThreeValues = {
  newPassword: string;
  confirmPassword: string;
};

function getApiError(error: any): string {
  return (
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function ForgotPasswordForm(): JSX.Element {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [sendResetCode, { isLoading: isSending }] = useSendResetCodeMutation();
  const [verifyResetCode, { isLoading: isVerifying }] =
    useVerifyResetCodeMutation();
  const [resetForgotPassword, { isLoading: isResetting }] =
    useResetForgotPasswordMutation();

  const emailForm = useForm<StepOneValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });

  const otpForm = useForm<StepTwoValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { otp: "" },
  });

  const passwordForm = useForm<StepThreeValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const currentEmail = emailForm.watch("email");
  const currentOtp = otpForm.watch("otp");
  const currentPassword = passwordForm.watch("newPassword");
  const currentConfirmPassword = passwordForm.watch("confirmPassword");

  /* ────────── Email link থেকে email/code থাকলে form ready করে দিলাম ────────── */
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryEmail = searchParams.get("email")?.trim().toLowerCase();
    const queryCode = searchParams.get("code")?.trim();

    if (!queryEmail) return;

    setEmail(queryEmail);
    emailForm.setValue("email", queryEmail);

    if (queryCode) {
      otpForm.setValue("otp", queryCode);
      setStep(2);
    }
  }, [emailForm, otpForm]);

  /* ────────── Clear Errors On Typing ────────── */
  useEffect(() => {
    if (currentEmail) emailForm.clearErrors("email");
  }, [currentEmail, emailForm]);

  useEffect(() => {
    if (currentOtp) otpForm.clearErrors("otp");
  }, [currentOtp, otpForm]);

  useEffect(() => {
    if (currentPassword) passwordForm.clearErrors("newPassword");
  }, [currentPassword, passwordForm]);

  useEffect(() => {
    if (currentConfirmPassword) passwordForm.clearErrors("confirmPassword");
  }, [currentConfirmPassword, passwordForm]);

  /* ────────── Submit Email Step ────────── */
  const handleSendCode = async (data: StepOneValues) => {
    try {
      const normalizedEmail = data.email.trim().toLowerCase();

      const response = await sendResetCode({
        email: normalizedEmail,
      }).unwrap();

      setEmail(normalizedEmail);
      setResetToken("");
      setStep(2);
      toast.success(response?.message || "Verification code sent");
    } catch (error: any) {
      const message = getApiError(error);

      emailForm.setError("email", {
        type: "server",
        message,
      });

      toast.error(message);
    }
  };

  /* ────────── Submit OTP Step ────────── */
  const handleVerifyCode = async (data: StepTwoValues) => {
    try {
      const response = await verifyResetCode({
        email,
        otp: data.otp.trim(),
      }).unwrap();

      /* ────────── OTP verify হলে reset token save করে রাখলাম ────────── */
      setResetToken(response.resetToken);
      setStep(3);
      toast.success(response?.message || "Code verified successfully");
    } catch (error: any) {
      const message = getApiError(error);

      otpForm.setError("otp", {
        type: "server",
        message,
      });

      toast.error(message);
    }
  };

  /* ────────── Submit New Password Step ────────── */
  const handleResetPassword = async (data: StepThreeValues) => {
    try {
      const response = await resetForgotPassword({
        email,
        newPassword: data.newPassword,
        resetToken,
      }).unwrap();

      toast.success(response?.message || "Password reset successfully");
      setStep(1);
      setEmail("");
      setResetToken("");
      emailForm.reset();
      otpForm.reset();
      passwordForm.reset();
    } catch (error: any) {
      const message = getApiError(error);

      passwordForm.setError("newPassword", {
        type: "server",
        message,
      });

      toast.error(message);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="mt-2 scale-90 sm:scale-100">
        <Logo />
      </div>

      <h1 className="mt-8 text-center text-xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]">
        Forgot Password
      </h1>

      <p className="mt-2 text-center text-[0.70rem] leading-6 text-white/75">
        Reset your password in 3 steps.
      </p>

      {step === 1 ? (
        <form
          onSubmit={emailForm.handleSubmit(handleSendCode)}
          className="mt-6 flex w-full flex-col gap-5"
        >
          <AuthInput
            type="email"
            placeholder="Email Address"
            error={emailForm.formState.errors.email?.message}
            {...emailForm.register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />

          <button
            type="submit"
            disabled={isSending}
            className="mt-2 w-full rounded-xl border border-lime-300/30 bg-[linear-gradient(180deg,#8cf61e_0%,#46c81d_56%,#0a991f_100%)] py-3 text-xl font-extrabold tracking-tight text-white shadow-[inset_0_8px_14px_rgba(255,255,255,0.12),inset_0_-6px_10px_rgba(0,0,0,0.16),0_8px_22px_rgba(0,0,0,0.34)] transition hover:-translate-y-[1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isSending ? "Sending..." : "Send Code"}
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <form
          onSubmit={otpForm.handleSubmit(handleVerifyCode)}
          className="mt-6 flex w-full flex-col gap-5"
        >
          <AuthInput
            type="text"
            placeholder="Enter Verification Code"
            error={otpForm.formState.errors.otp?.message}
            {...otpForm.register("otp", {
              required: "Verification code is required",
              minLength: {
                value: 6,
                message: "Code must be 6 digits",
              },
              maxLength: {
                value: 6,
                message: "Code must be 6 digits",
              },
            })}
          />

          <button
            type="submit"
            disabled={isVerifying}
            className="mt-2 w-full rounded-xl border border-lime-300/30 bg-[linear-gradient(180deg,#8cf61e_0%,#46c81d_56%,#0a991f_100%)] py-3 text-xl font-extrabold tracking-tight text-white shadow-[inset_0_8px_14px_rgba(255,255,255,0.12),inset_0_-6px_10px_rgba(0,0,0,0.16),0_8px_22px_rgba(0,0,0,0.34)] transition hover:-translate-y-[1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isVerifying ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      ) : null}

      {step === 3 ? (
        <form
          onSubmit={passwordForm.handleSubmit(handleResetPassword)}
          className="mt-6 flex w-full flex-col gap-5"
        >
          <AuthInput
            type="password"
            placeholder="New Password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <AuthInput
            type="password"
            placeholder="Confirm New Password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword", {
              required: "Confirm new password is required",
              validate: (value) =>
                value === passwordForm.watch("newPassword") ||
                "Passwords do not match",
            })}
          />

          <button
            type="submit"
            disabled={isResetting}
            className="mt-2 w-full rounded-xl border border-lime-300/30 bg-[linear-gradient(180deg,#8cf61e_0%,#46c81d_56%,#0a991f_100%)] py-3 text-xl font-extrabold tracking-tight text-white shadow-[inset_0_8px_14px_rgba(255,255,255,0.12),inset_0_-6px_10px_rgba(0,0,0,0.16),0_8px_22px_rgba(0,0,0,0.34)] transition hover:-translate-y-[1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isResetting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      ) : null}

      <Link
        href="/login"
        className="mt-5 flex w-full items-center justify-center rounded-[14px] border border-[#5f72d5]/50 bg-[rgba(8,14,40,0.24)] py-3 text-center text-sm font-extrabold tracking-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_18px_rgba(0,0,0,0.2)] transition hover:bg-[rgba(12,20,56,0.32)]"
      >
        Back to Sign In
      </Link>

      <div className="mt-8 h-[2px] w-[86%] rounded-full bg-[linear-gradient(90deg,transparent,rgba(74,128,255,0.95),transparent)] shadow-[0_0_12px_rgba(74,128,255,0.9)]" />
    </div>
  );
}
