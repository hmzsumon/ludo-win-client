"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import AuthInput from "@/components/auth/auth-input";
import Logo from "@/components/branding/logo";
import { useLoginUserMutation } from "@/redux/features/auth/authApi";

type LoginFormValues = {
  mobileNumber: string;
  password: string;
};

function getApiError(error: any): string {
  return (
    error?.data?.error ||
    error?.data?.message ||
    error?.error ||
    error?.message ||
    "Login failed. Please try again."
  );
}

export default function LoginForm(): JSX.Element {
  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const {
    register,
    handleSubmit,
    watch,
    clearErrors,
    setError,
    formState: { errors, touchedFields },
  } = useForm<LoginFormValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { mobileNumber: "", password: "" },
  });

  const mobileNumber = watch("mobileNumber");
  const password = watch("password");

  useEffect(() => {
    if (touchedFields.mobileNumber && mobileNumber) clearErrors("mobileNumber");
  }, [mobileNumber, touchedFields.mobileNumber, clearErrors]);

  useEffect(() => {
    if (touchedFields.password && password) clearErrors("password");
  }, [password, touchedFields.password, clearErrors]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await loginUser({
        phone: data.mobileNumber.trim(),
        password: data.password,
      }).unwrap();

      toast.success(response?.message || "Login successful");
      router.push("/dashboard");
    } catch (error: any) {
      const message = getApiError(error);
      const lowerMessage = message.toLowerCase();

      /* ────────── Email Verify Redirect ──────────
         API থেকে email verify error আসলে user কে verify-email page এ পাঠাবে।
         Login form এ email input নেই, তাই backend থেকে আসা email ব্যবহার করা হচ্ছে।
      ──────────────────────────────────────────── */
      if (
        lowerMessage.includes("verify your email") ||
        lowerMessage.includes("email before login")
      ) {
        const verifyEmail =
          error?.data?.email ||
          error?.data?.user?.email ||
          error?.data?.data?.email;

        toast.error(message);

        if (verifyEmail) {
          router.push(
            `/verify-email?email=${encodeURIComponent(
              String(verifyEmail).trim().toLowerCase(),
            )}`,
          );
          return;
        }

        setError("mobileNumber", { type: "server", message });
        return;
      }

      if (lowerMessage.includes("mobile") || lowerMessage.includes("phone")) {
        setError("mobileNumber", { type: "server", message });
        toast.error(message);
        return;
      }

      if (lowerMessage.includes("password")) {
        setError("password", { type: "server", message });
        toast.error(message);
        return;
      }

      setError("mobileNumber", { type: "server", message });
      setError("password", { type: "server", message });
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center w-full">
      {/* ── Logo ── */}
      <div className="scale-90 sm:scale-100 ls-float">
        <Logo />
      </div>

      {/* ── Title ── */}
      <div className="text-center">
        <h1 className="text-[24px] brand-highlight-text uppercase font-black tracking-tight ">
          Welcome Back!
        </h1>
        <p className="text-sm text-white/50 font-semibold mt-1">
          Sign in to continue playing
        </p>
      </div>

      {/* ── Decorative Divider ── */}
      <div className="mt-6 flex w-full items-center gap-3">
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.9))",
          }}
        />
        <span className="text-white text-xs font-bold">✦ LOGIN ✦</span>
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,215,0,0.9), transparent)",
          }}
        />
      </div>

      {/* ── Form Card ── */}
      <div
        className="mt-5 w-full rounded-3xl overflow-hidden p-5"
        style={{
          background:
            "linear-gradient(145deg, rgba(74,26,138,0.5) 0%, rgba(29,5,70,0.6) 100%)",
          border: "1px solid rgba(255,215,0,0.15)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Mobile Number Input */}
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

          {/* Password Input */}
          <div>
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
              🔒 Password
            </label>
            <AuthInput
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
                onChange: () => {
                  if (errors.password) clearErrors("password");
                },
              })}
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right -mt-1">
            <Link
              href="/forgot-password"
              className="text-[12px] font-bold text-red-500 hover:text-red-400 transition"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="ls-btn ls-btn-green ls-shine-effect w-full py-3.5 text-[16px] font-black disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Signing In...
              </span>
            ) : (
              "🎲 Sign In & Play"
            )}
          </button>
        </form>
      </div>

      {/* ── Register Link ── */}
      <div className="mt-4 w-full">
        <Link href="/register" className="block w-full">
          <button
            type="button"
            disabled={isLoading}
            className="ls-btn ls-btn-red ls-shine-effect w-full py-3.5 text-[16px] font-black disabled:opacity-70 disabled:cursor-not-allowed mt-1"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Please wait...
              </span>
            ) : (
              "✨ Create New Account"
            )}
          </button>
        </Link>
      </div>

      {/* ── Bottom Divider ── */}
      <div
        className="mt-8 h-[2px] w-[70%] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)",
        }}
      />
    </div>
  );
}
