"use client";

import { CircleAlert, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

import Logo from "@/components/branding/logo";
import {
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
} from "@/redux/features/auth/authApi";

type Props = {
  email?: string;
};

function getApiError(error: any): string {
  return (
    error?.data?.message ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export default function VerifyEmailForm({ email = "" }: Props): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get("email");
  const queryCode = searchParams.get("code");
  const currentEmail = queryEmail || email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerificationEmail, { isLoading: isResending }] =
    useResendVerificationEmailMutation();

  useEffect(() => {
    if (!queryCode) return;

    const cleaned = queryCode.replace(/\D/g, "").slice(0, 6);
    if (!cleaned) return;

    const next = ["", "", "", "", "", ""];
    cleaned.split("").forEach((char, index) => {
      next[index] = char;
    });

    setOtp(next);
  }, [queryCode]);

  /* ────────── Handle OTP Change ────────── */
  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);

    if (otpError) setOtpError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ────────── Handle OTP Backspace ────────── */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  /* ────────── Handle OTP Paste ────────── */
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });

    setOtp(next);
    setOtpError("");
  };

  /* ────────── Submit Verify Email ────────── */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const code = otp.join("");

    if (!currentEmail) {
      setOtpError("Email address is missing");
      return;
    }

    if (code.length !== 6) {
      setOtpError("Please enter the 6-digit verification code");
      return;
    }

    try {
      const response = await verifyEmail({
        email: currentEmail.trim().toLowerCase(),
        code,
      }).unwrap();

      toast.success(response?.message || "Email verified successfully");
      router.push("/login");
    } catch (error: any) {
      setOtpError(getApiError(error));
    }
  };

  /* ────────── Resend Verification Email ────────── */
  const handleResend = async () => {
    try {
      if (!currentEmail) {
        setOtpError("Email address is missing");
        return;
      }

      const response = await resendVerificationEmail({
        email: currentEmail.trim().toLowerCase(),
      }).unwrap();

      toast.success(response?.message || "Verification code sent");
      setOtpError("");
    } catch (error: any) {
      setOtpError(getApiError(error));
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="scale-90 sm:scale-100">
        <Logo />
      </div>

      <h1 className="mt-2 text-center text-2xl font-extrabold leading-none tracking-tight text-white drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]">
        Verify your email
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-[rgba(7,10,24,0.78)] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[rgba(10,14,30,0.88)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <Mail className="h-5 w-5 text-white/65" />
          <span className="truncate text-sm font-medium text-white">
            {currentEmail || "No email found"}
          </span>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-emerald-300">
          <div className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-[0.70rem] leading-7">
              Please check your inbox and enter the 6-digit verification code.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-[1.05rem] font-bold text-white">
            Verification code
          </h2>

          <div className="mt-5 flex items-center justify-between gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className={`h-10 w-10 rounded-[.70rem] border bg-[rgba(10,14,30,0.88)] text-center text-sm font-bold outline-none transition ${
                  otpError
                    ? "border-red-500 text-red-200 focus:border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.20)]"
                    : "border-white/15 text-white focus:border-[#6b8cff] focus:shadow-[0_0_0_2px_rgba(107,140,255,0.20)]"
                }`}
              />
            ))}
          </div>

          {otpError ? (
            <p className="mt-2 text-xs font-semibold text-red-400">
              {otpError}
            </p>
          ) : null}

          <button
            type="button"
            className="mx-auto mt-5 block text-center text-[1rem] font-bold text-[#f4b400] underline underline-offset-4 transition hover:text-[#ffd45a] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Get a new code"}
          </button>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="mt-6 w-full rounded-xl border border-lime-300/30 bg-[linear-gradient(180deg,#8cf61e_0%,#46c81d_56%,#0a991f_100%)] py-3 text-lg font-extrabold tracking-tight text-white shadow-[inset_0_8px_14px_rgba(255,255,255,0.12),inset_0_-6px_10px_rgba(0,0,0,0.16),0_8px_22px_rgba(0,0,0,0.34)] transition hover:-translate-y-[1px] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>

        <Link
          href="/login"
          className="mt-3 flex w-full items-center justify-center rounded-xl border border-[#5f72d5]/40 bg-[rgba(8,14,40,0.24)] py-3 text-sm font-extrabold tracking-tight text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_18px_rgba(0,0,0,0.2)] transition hover:bg-[rgba(12,20,56,0.32)]"
        >
          Back to Sign In
        </Link>
      </form>
    </div>
  );
}
