"use client";

// ─────────────────────────────────────────────
// 📦 IMPORTS — প্রয়োজনীয় লাইব্রেরি ও হুক
// ─────────────────────────────────────────────
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import AuthInput from "@/components/auth/auth-input";
import Logo from "@/components/branding/logo";
import {
  useLazyCheckEmailExistOrNotQuery,
  useRegisterUserMutation,
} from "@/redux/features/auth/authApi";

// ─────────────────────────────────────────────
// 📝 FORM TYPE — রেজিস্ট্রেশন ফর্মের ফিল্ড টাইপ
// ─────────────────────────────────────────────
type RegisterFormValues = {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  partnerCode: string;
};

// ─────────────────────────────────────────────
// ⚠️ ERROR HELPER — API এরর থেকে সহজপাঠ্য মেসেজ বের করে
// ─────────────────────────────────────────────
function getApiError(error: any): string {
  return (
    error?.data?.error ||
    error?.data?.message ||
    error?.error ||
    error?.message ||
    "Registration failed. Please try again."
  );
}

// ─────────────────────────────────────────────
// 🏠 MAIN COMPONENT — RegisterForm
// ─────────────────────────────────────────────
export default function RegisterForm(): JSX.Element {
  const router = useRouter();

  // ── URL থেকে query params পড়া ──
  // উদাহরণ: /register?referral_code=LUDO1234
  const searchParams = useSearchParams();
  const referralCodeFromUrl = searchParams.get("referral_code")?.trim() || "";

  // referral_code URL-এ থাকলে ফিল্ডটি readonly হবে — ইডিট করা যাবে না
  const isReferralFromLink = Boolean(referralCodeFromUrl);

  // ── API মিউটেশন ও লেজি কোয়েরি ──
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [triggerEmailCheck, emailCheckState] =
    useLazyCheckEmailExistOrNotQuery();

  // ─────────────────────────────────────────────
  // 📋 FORM SETUP — react-hook-form কনফিগারেশন
  // defaultValues-এ URL থেকে পাওয়া referral কোড সেট করা হচ্ছে
  // ─────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    setError,
    setValue,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      mobileNumber: "",
      password: "",
      confirmPassword: "",
      partnerCode: referralCodeFromUrl, // URL-এর কোড দিয়ে ডিফল্ট সেট
    },
  });

  // ─────────────────────────────────────────────
  // 🔗 URL REFERRAL CODE SYNC
  // URL-এ referral_code থাকলে মাউন্টের পরেও ফিল্ডে সেট করে রাখে
  // (ব্রাউজার ব্যাক/ফরওয়ার্ড বা লেট হাইড্রেশনের জন্য)
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (referralCodeFromUrl) {
      setValue("partnerCode", referralCodeFromUrl, { shouldValidate: false });
    }
  }, [referralCodeFromUrl, setValue]);

  // ── ওয়াচ করা ফিল্ড ভ্যালু ──
  const fullName = watch("fullName");
  const email = watch("email");
  const mobileNumber = watch("mobileNumber");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const partnerCode = watch("partnerCode");

  // ইমেইল নরমালাইজ — ছোট হাতে + ট্রিম
  const normalizedEmail = useMemo(
    () => email?.trim().toLowerCase() || "",
    [email],
  );

  // ─────────────────────────────────────────────
  // 📧 EMAIL AVAILABILITY CHECK (Debounced)
  // ইমেইল টাইপের ৫০০ms পর সার্ভারে চেক করে
  // ইমেইল আগে থেকে থাকলে এরর দেখায়
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!normalizedEmail) return;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
    if (!isValidEmail) return;

    const timer = setTimeout(async () => {
      try {
        const result = await triggerEmailCheck(normalizedEmail).unwrap();
        if (result?.exists) {
          setError("email", {
            type: "server",
            message: "Email already exists",
          });
        } else if (errors.email?.type === "server") {
          clearErrors("email");
        }
      } catch {}
    }, 500);

    return () => clearTimeout(timer);
  }, [normalizedEmail, triggerEmailCheck, setError, clearErrors, errors.email]);

  // ─────────────────────────────────────────────
  // 🧹 FIELD ERROR AUTO-CLEAR — টাইপ শুরু করলে এরর সরে যায়
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (touchedFields.fullName && fullName) clearErrors("fullName");
  }, [fullName, touchedFields.fullName, clearErrors]);

  useEffect(() => {
    if (touchedFields.email && normalizedEmail) clearErrors("email");
  }, [normalizedEmail, touchedFields.email, clearErrors]);

  useEffect(() => {
    if (touchedFields.mobileNumber && mobileNumber) clearErrors("mobileNumber");
  }, [mobileNumber, touchedFields.mobileNumber, clearErrors]);

  useEffect(() => {
    if (touchedFields.password && password) clearErrors("password");
  }, [password, touchedFields.password, clearErrors]);

  useEffect(() => {
    if (touchedFields.confirmPassword && confirmPassword)
      clearErrors("confirmPassword");
  }, [confirmPassword, touchedFields.confirmPassword, clearErrors]);

  useEffect(() => {
    // লিংক থেকে আসা কোড হলে auto-clear করবে না
    if (!isReferralFromLink && touchedFields.partnerCode && partnerCode) {
      clearErrors("partnerCode");
    }
  }, [partnerCode, touchedFields.partnerCode, isReferralFromLink, clearErrors]);

  // ─────────────────────────────────────────────
  // 🚀 FORM SUBMIT HANDLER
  // সফল হলে verify-email পেজে রিডাইরেক্ট করে
  // ব্যর্থ হলে সংশ্লিষ্ট ফিল্ডে এরর সেট করে
  // ─────────────────────────────────────────────
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // ইমেইল চেকে ইতিমধ্যে exists ধরা পড়লে সাবমিট বন্ধ
      if (emailCheckState.data?.exists) {
        setError("email", { type: "server", message: "Email already exists" });
        toast.error("Email already exists");
        return;
      }

      const response = await registerUser({
        name: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.mobileNumber.trim(),
        password: data.password,
        partnerCode: data.partnerCode?.trim() || undefined,
      }).unwrap();

      toast.success(response?.message || "Verification email sent");
      router.push(
        `/verify-email?email=${encodeURIComponent(data.email.trim().toLowerCase())}`,
      );
    } catch (error: any) {
      // API এরর অনুযায়ী সংশ্লিষ্ট ফিল্ডে এরর দেখানো
      const message = getApiError(error);
      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes("email")) {
        setError("email", { type: "server", message: "Email already exists" });
        toast.error("Email already exists");
        return;
      }
      if (lowerMessage.includes("mobile") || lowerMessage.includes("phone")) {
        setError("mobileNumber", {
          type: "server",
          message: "Mobile number already exists",
        });
        toast.error("Mobile number already exists");
        return;
      }
      if (lowerMessage.includes("referral")) {
        setError("partnerCode", { type: "server", message });
        toast.error(message);
        return;
      }

      setError("mobileNumber", { type: "server", message });
      toast.error(message);
    }
  };

  // ─────────────────────────────────────────────
  // 🖼️ RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col items-center w-full">
      {/* ─────── LOGO — ব্র্যান্ড লোগো ─────── */}
      <div className="scale-90 sm:scale-100 ls-float">
        <Logo />
      </div>

      {/* ─────── PAGE TITLE — পেজ শিরোনাম ─────── */}
      <div className="text-center">
        <h1 className="text-[24px] brand-highlight-text uppercase font-black tracking-tight text-white">
          Join the Game!
        </h1>
        <p className="text-sm text-white/50 font-semibold mt-1">
          Create your account &amp; start winning
        </p>
      </div>

      {/* ─────── DIVIDER — সোনালি ডিভাইডার লাইন ─────── */}
      <div className="mt-4 flex w-full items-center gap-3">
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.9))",
          }}
        />
        <span className="text-white text-xs font-bold">✦ REGISTER ✦</span>
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,215,0,0.9), transparent)",
          }}
        />
      </div>

      {/* ─────── FORM CARD — মূল রেজিস্ট্রেশন ফর্ম ─────── */}
      <div
        className="mt-4 w-full rounded-3xl overflow-hidden p-5"
        style={{
          background:
            "linear-gradient(145deg, rgba(74,26,138,0.5) 0%, rgba(29,5,70,0.6) 100%)",
          border: "1px solid rgba(255,215,0,0.15)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* ── Full Name ── */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
              👤 Full Name
            </label>
            <AuthInput
              type="text"
              placeholder="Enter your full name"
              error={errors.fullName?.message}
              {...register("fullName", {
                required: "Full name is required",
                minLength: {
                  value: 3,
                  message: "Full name must be at least 3 characters",
                },
                onChange: () => {
                  if (errors.fullName) clearErrors("fullName");
                },
              })}
            />
          </div>

          {/* ── Email Address — সার্ভারে রিয়েলটাইম চেক হয় ── */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
              📧 Email Address
            </label>
            <AuthInput
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
                onChange: () => {
                  if (errors.email) clearErrors("email");
                },
              })}
            />
            {/* চেকিং ইন্ডিকেটর */}
            {normalizedEmail && !errors.email && emailCheckState.isFetching && (
              <p className="mt-1 pl-1 text-xs font-semibold text-white/50">
                Checking email...
              </p>
            )}
            {/* ইমেইল পাওয়া গেলে সবুজ টিক */}
            {normalizedEmail &&
              !errors.email &&
              emailCheckState.data &&
              !emailCheckState.data.exists && (
                <p className="mt-1 pl-1 text-xs font-semibold text-green-400">
                  ✓ Email is available
                </p>
              )}
          </div>

          {/* ── Mobile Number ── */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
              📱 Mobile Number
            </label>
            <AuthInput
              type="tel"
              placeholder="Enter your mobile number"
              error={errors.mobileNumber?.message}
              {...register("mobileNumber", {
                required: "Mobile number is required",
                minLength: {
                  value: 6,
                  message: "Please enter a valid mobile number",
                },
                onChange: () => {
                  if (errors.mobileNumber) clearErrors("mobileNumber");
                },
              })}
            />
          </div>

          {/* ─────── REFERRAL CODE FIELD — রেফারেল কোড ইনপুট ─────── */}
          {/*
            দুটো অবস্থা:
            1. লিংকের মাধ্যমে এলে → কোড অটো-ফিল, readonly, লক আইকন, ব্যাজ দেখায়
            2. সরাসরি এলে → Optional, ইডিট করা যায়
          */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
              🎁 Referral Code
              {isReferralFromLink ? (
                /* লিংক থেকে আসলে — লক ব্যাজ */
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    background: "rgba(255,215,0,0.15)",
                    border: "1px solid rgba(255,215,0,0.35)",
                    borderRadius: 20,
                    padding: "2px 8px",
                    color: "#ffd700",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  🔒 Auto Applied
                </span>
              ) : (
                /* সরাসরি এলে — Optional ট্যাগ */
                <span className="text-white/30 normal-case font-semibold tracking-normal">
                  (Optional)
                </span>
              )}
            </label>

            {isReferralFromLink ? (
              /* ─── লিংক থেকে আসলে: Readonly কাস্টম ইনপুট ─── */
              /* ইডিট করা যাবে না, লক স্টাইল দেখাবে */
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,215,0,0.07)",
                  border: "1px solid rgba(255,215,0,0.35)",
                  borderRadius: 12,
                  padding: "11px 14px",
                  cursor: "not-allowed",
                }}
              >
                {/* লক আইকন */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ffd700"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, opacity: 0.8 }}
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>

                {/* কোডের টেক্সট */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#ffd700",
                    letterSpacing: 2,
                  }}
                >
                  {referralCodeFromUrl}
                </span>

                {/* চেক মার্ক */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>

                {/* Hidden input — ফর্ম সাবমিটে ভ্যালু পাঠাবে */}
                <input
                  type="hidden"
                  {...register("partnerCode")}
                  value={referralCodeFromUrl}
                />
              </div>
            ) : (
              /* ─── সরাসরি রেজিস্ট্রেশন: সাধারণ Optional ইনপুট ─── */
              <AuthInput
                type="text"
                placeholder="Enter referral code (optional)"
                error={errors.partnerCode?.message}
                {...register("partnerCode", {
                  onChange: () => {
                    if (errors.partnerCode) clearErrors("partnerCode");
                  },
                })}
              />
            )}

            {/* লিংক থেকে আসলে সাবটেক্সট দেখাও */}
            {isReferralFromLink && (
              <p className="mt-1.5 pl-1 text-[11px] font-semibold text-yellow-400/50">
                ✓ Referral code applied from invite link
              </p>
            )}
          </div>
          {/* ─────── REFERRAL CODE FIELD END ─────── */}

          {/* ── Password ── */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
              🔒 Password
            </label>
            <AuthInput
              type="password"
              placeholder="Create a password"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                onChange: () => {
                  if (errors.password) clearErrors("password");
                  if (errors.confirmPassword) clearErrors("confirmPassword");
                },
              })}
            />
          </div>

          {/* ── Confirm Password ── */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
              🔒 Confirm Password
            </label>
            <AuthInput
              type="password"
              placeholder="Re-enter your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: "Confirm password is required",
                validate: (value) =>
                  value === password || "Passwords do not match",
                onChange: () => {
                  if (errors.confirmPassword) clearErrors("confirmPassword");
                },
              })}
            />
          </div>

          {/* ─────── SUBMIT BUTTON — ফর্ম সাবমিট বাটন ─────── */}
          {/* লোডিং হলে স্পিনার + টেক্সট, না হলে সাধারণ বাটন */}
          <button
            type="submit"
            disabled={isLoading}
            className="ls-btn ls-btn-logo-pink ls-shine-effect w-full py-3.5 text-[16px] font-black mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-amber-900/50 border-t-amber-900 animate-spin" />
                Creating Account...
              </span>
            ) : (
              "🎮 Create Account"
            )}
          </button>
        </form>
      </div>
      {/* ─────── FORM CARD END ─────── */}

      {/* ─────── LOGIN LINK — লগইন পেজে যাওয়ার লিংক ─────── */}
      <p className="mt-5 text-center text-sm font-semibold text-white/60">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-black text-yellow-400 hover:text-yellow-300 transition"
        >
          Sign In
        </Link>
      </p>

      {/* ─────── BOTTOM DIVIDER — নিচের সোনালি ডিভাইডার ─────── */}
      <div
        className="mt-6 h-[2px] w-[70%] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)",
        }}
      />
    </div>
  );
}
