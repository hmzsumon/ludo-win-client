"use client";

/* ────────────────────────────────────────────────────────────────
   ProfileVerificationSection.tsx

   কাজ:
   ✅ Profile completion progress দেখাবে
   ✅ Email input + Get Code button
   ✅ Code পাঠানো হলে 6টি আলাদা OTP box দেখাবে
   ✅ Verify এবং Resend action দেবে
   ✅ Email verified হলে 50% progress + welcome bonus status দেখাবে
──────────────────────────────────────────────────────────────── */

import {
  IPersonalProfile,
  useSendProfileEmailCodeMutation,
  useVerifyProfileEmailMutation,
} from "@/redux/features/profile/personalProfileApi";
import { BadgeCheck, Gem, Mail, Send, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

const apiError = (error: any) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.message ||
  "Something went wrong";

export default function ProfileVerificationSection({
  profile,
}: {
  profile: IPersonalProfile;
}) {
  const [email, setEmail] = useState(profile.pendingEmail || profile.email || "");
  const [codeSent, setCodeSent] = useState(Boolean(profile.pendingEmail));
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [sendCode, { isLoading: isSending }] =
    useSendProfileEmailCodeMutation();
  const [verifyEmail, { isLoading: isVerifying }] =
    useVerifyProfileEmailMutation();

  /* ────────── API refresh-এর সঙ্গে local email state sync ────────── */
  useEffect(() => {
    if (profile.pendingEmail) {
      setEmail(profile.pendingEmail);
      setCodeSent(true);
    } else if (profile.email) {
      setEmail(profile.email);
    }
  }, [profile.pendingEmail, profile.email]);

  /* ────────── Handler: email code send ────────── */
  const handleSendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      const result = await sendCode({ email: normalizedEmail }).unwrap();
      setEmail(result.email);
      setCodeSent(true);
      setOtp(["", "", "", "", "", ""]);
      toast.success(result.message);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  /* ────────── Handler: pending email-এ নতুন code resend ────────── */
  const handleResendCode = async () => {
    try {
      const result = await sendCode({}).unwrap();
      setOtp(["", "", "", "", "", ""]);
      toast.success(result.message);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  /* ────────── Handler: 6-digit email code verify ────────── */
  const handleVerifyEmail = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Enter the complete 6-digit code");
      return;
    }

    try {
      const result = await verifyEmail({ code }).unwrap();
      toast.success(result.message);

      if (!result.welcomeBonusGranted) {
        const message =
          result.welcomeBonusReasonCode === "SAME_DEVICE_ALREADY_USED"
            ? "Email verified. This device already received a welcome bonus for another account."
            : "Email verified. Welcome bonus could not be added automatically; please contact support.";
        toast(message, { icon: "ℹ️" });
      }
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* ────────── Section: Profile completion progress card ────────── */}
      <section className="rounded-[28px] border border-white/65 bg-white/45 p-4 shadow-[0_16px_38px_rgba(43,133,203,0.14)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0877d7]">
              Profile Completion
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              Verify email to reach 50% and unlock your bonus
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/70 bg-cyan-100/70 text-sm font-black text-[#0877d7]">
            {profile.profileProgress}%
          </div>
        </div>

        {/* Progress track */}
        <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/75 bg-white/55 p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#04bdec_0%,#167fff_52%,#8e4dff_100%)] shadow-[0_0_16px_rgba(22,127,255,0.42)] transition-all duration-700"
            style={{ width: `${profile.profileProgress}%` }}
          />
        </div>

        {/* Progress rules */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-wide">
          <span
            className={`rounded-xl px-2.5 py-2 text-center ${profile.emailVerified ? "bg-emerald-100/80 text-emerald-700" : "bg-white/45 text-slate-500"}`}
          >
            Email 50%
          </span>
          <span
            className={`rounded-xl px-2.5 py-2 text-center ${profile.profileProgress === 100 ? "bg-emerald-100/80 text-emerald-700" : "bg-white/45 text-slate-500"}`}
          >
            Details 50%
          </span>
        </div>
      </section>

      {/* ────────── Section: Email verification card ────────── */}
      <section className="overflow-hidden rounded-[30px] border border-white/65 bg-white/48 p-4 shadow-[0_18px_42px_rgba(43,133,203,0.16)] backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${profile.emailVerified ? "border-emerald-200 bg-emerald-100/80 text-emerald-600" : "border-cyan-200 bg-cyan-100/75 text-[#0877d7]"}`}
          >
            {profile.emailVerified ? (
              <BadgeCheck className="h-6 w-6" />
            ) : (
              <Mail className="h-6 w-6" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-slate-900">
              {profile.emailVerified
                ? "Email Verified"
                : "Verify Your Email Address"}
            </p>
            <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-500">
              {profile.emailVerified
                ? "Your account has completed the 50% verification step."
                : "Enter your email, receive a code and claim 50 welcome diamonds."}
            </p>
          </div>
        </div>

        {profile.emailVerified ? (
          /* ────────── Verified email success state ────────── */
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/75 px-3.5 py-3">
              <span className="min-w-0 truncate text-sm font-black text-emerald-800">
                {profile.email}
              </span>
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-yellow-200/80 bg-yellow-50/75 px-3.5 py-3">
              <Gem className="h-7 w-7 shrink-0 text-[#0877d7]" />
              <div>
                <p className="text-xs font-black text-slate-900">
                  {profile.welcomeBonusGranted
                    ? "50 Diamonds Welcome Bonus Added"
                    : "Welcome Bonus Status"}
                </p>
                <p className="text-[11px] font-semibold text-slate-500">
                  {profile.welcomeBonusGranted
                    ? "Your reward is now available in bonus balance."
                    : profile.welcomeBonusReason || "Bonus is being processed."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ────────── Unverified email input and OTP flow ────────── */
          <div className="mt-4">
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
              Email Address
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (codeSent && event.target.value !== profile.pendingEmail) {
                    setCodeSent(false);
                    setOtp(["", "", "", "", "", ""]);
                  }
                }}
                disabled={isSending || isVerifying}
                placeholder="Enter your email address"
                className="min-w-0 flex-1 rounded-2xl border border-sky-200/75 bg-white/65 px-3.5 py-3 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#168ff0] focus:ring-2 focus:ring-sky-200/65 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={isSending || isVerifying || !email.trim()}
                className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-[linear-gradient(180deg,#5ed9ff_0%,#168ee9_58%,#0863ca_100%)] px-3.5 text-xs font-black text-white shadow-[0_10px_20px_rgba(8,119,215,0.23)] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSending ? "Sending" : "Get Code"}
              </button>
            </div>

            {codeSent ? (
              <div className="mt-4 rounded-2xl border border-sky-200/70 bg-sky-50/60 p-3.5">
                <p className="text-center text-xs font-bold text-slate-600">
                  Enter the 6-digit code sent to {email}
                </p>

                {/* Six separate verification code boxes */}
                <div className="mt-3 flex justify-center gap-1.5 sm:gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(node) => {
                        otpRefs.current[index] = node;
                      }}
                      value={digit}
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      onChange={(event) => {
                        const value = event.target.value
                          .replace(/\D/g, "")
                          .slice(-1);
                        const next = [...otp];
                        next[index] = value;
                        setOtp(next);
                        if (value) otpRefs.current[index + 1]?.focus();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Backspace" && !otp[index]) {
                          otpRefs.current[index - 1]?.focus();
                        }
                      }}
                      className="h-11 w-10 rounded-xl border border-sky-200 bg-white/85 text-center text-lg font-black text-[#0877d7] outline-none focus:border-[#168ff0] focus:ring-2 focus:ring-sky-200 sm:w-11"
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isSending || isVerifying}
                    className="text-xs font-black text-[#0877d7] underline underline-offset-4 disabled:opacity-50"
                  >
                    {isSending ? "Sending..." : "Resend Code"}
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={
                      isVerifying || isSending || otp.join("").length !== 6
                    }
                    className="rounded-xl bg-[linear-gradient(180deg,#36e39f_0%,#0aa86c_100%)] px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_18px_rgba(10,168,108,0.22)] disabled:opacity-50"
                  >
                    {isVerifying ? "Verifying..." : "Verify Email"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
