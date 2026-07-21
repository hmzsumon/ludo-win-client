"use client";

import Logo from "@/components/branding/logo";
import {
  useResendRegistrationCodeMutation,
  useVerifyRegistrationMutation,
} from "@/redux/features/auth/authApi";
import { CircleAlert, Mail, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

const getError = (error: any) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.message ||
  "Something went wrong";

export default function VerifyEmailForm(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const identifier = params.get("identifier") || params.get("email") || "";
  const channel = (params.get("channel") || "EMAIL").toUpperCase();
  const isSms = channel === "SMS";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [verify, { isLoading }] = useVerifyRegistrationMutation();
  const [resend, { isLoading: isResending }] =
    useResendRegistrationCodeMutation();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = otp.join("");
    if (!identifier) return setError("Verification destination is missing");
    if (code.length !== 6)
      return setError("Enter the 6-digit verification code");

    try {
      const result = await verify({ identifier, code }).unwrap();
      toast.success(result.message);
      if (result.welcomeBonusGranted === false) {
        toast(
          "Account verified. Welcome bonus was already used on this device.",
        );
      }
      router.push("/login");
    } catch (err) {
      setError(getError(err));
    }
  };

  const resendCode = async () => {
    try {
      const result = await resend({ identifier }).unwrap();
      toast.success(result.message);
      setError("");
    } catch (err) {
      setError(getError(err));
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="scale-90">
        <Logo />
      </div>
      <h1 className="mt-2 text-center text-2xl font-extrabold text-white">
        Verify your account
      </h1>

      <form
        onSubmit={submit}
        className="mt-4 w-full rounded-2xl border border-white/10 bg-[rgba(7,10,24,0.82)] p-4 shadow-2xl"
      >
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
          {isSms ? (
            <MessageSquareText className="h-5 w-5 text-cyan-300" />
          ) : (
            <Mail className="h-5 w-5 text-cyan-300" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-white/45">
              Code sent by {isSms ? "SMS" : "Email"}
            </p>
            <p className="truncate text-sm font-bold text-white">
              {identifier || "No destination found"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-emerald-200">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-xs leading-5">
            Enter the 6-digit code. The code expires in 5 minutes.
          </p>
        </div>

        <div className="mt-6 flex justify-between gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(node) => {
                refs.current[index] = node;
              }}
              value={digit}
              inputMode="numeric"
              maxLength={1}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(-1);
                const next = [...otp];
                next[index] = value;
                setOtp(next);
                setError("");
                if (value) refs.current[index + 1]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[index])
                  refs.current[index - 1]?.focus();
              }}
              className={`h-11 w-11 rounded-xl border bg-white/5 text-center text-lg font-black text-white outline-none ${error ? "border-red-500" : "border-white/15 focus:border-cyan-400"}`}
            />
          ))}
        </div>

        {error ? (
          <p className="mt-2 text-xs font-bold text-red-400">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={resendCode}
          disabled={isResending}
          className="mx-auto mt-5 block font-bold text-yellow-400 underline disabled:opacity-50"
        >
          {isResending ? "Sending..." : "Get a new code"}
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="ls-btn ls-btn-green mt-6 w-full py-3.5 text-lg font-black disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify Account"}
        </button>

        <Link
          href="/login"
          className="mt-3 flex justify-center rounded-xl border border-white/10 py-3 text-sm font-bold text-white"
        >
          Back to Sign In
        </Link>
      </form>
    </div>
  );
}
