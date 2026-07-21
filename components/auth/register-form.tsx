"use client";

import CountryPhoneInput from "@/components/auth/CountryPhoneInput";
import AuthInput from "@/components/auth/auth-input";
import Logo from "@/components/branding/logo";
import { Country } from "@/components/profile/CountrySelectDrawer";
import { useRegisterUserMutation } from "@/redux/features/auth/authApi";
import { getDeviceFingerprint } from "@/utils/deviceFingerprint";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const BANGLADESH: Country = { code: "+880", name: "Bangladesh", iso: "BD" };

type FormValues = {
  fullName: string;
  email: string;
  mobileNumber: string;
  partnerCode: string;
  password: string;
  confirmPassword: string;
};

const apiError = (error: any) =>
  error?.data?.error ||
  error?.data?.message ||
  error?.message ||
  "Registration failed";

export default function RegisterForm(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referral = searchParams.get("referral_code")?.trim() || "";
  const [country, setCountry] = useState<Country>(BANGLADESH);
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { partnerCode: referral, mobileNumber: "", email: "" },
  });

  useEffect(() => {
    if (referral) setValue("partnerCode", referral);
  }, [referral, setValue]);

  const password = watch("password");
  const mobileNumber = watch("mobileNumber");
  const emailRequired = country.iso !== "BD";

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await registerUser({
        name: data.fullName.trim(),
        email: data.email.trim().toLowerCase() || undefined,
        localNumber: data.mobileNumber,
        countryCode: country.code,
        countryIso: country.iso,
        countryName: country.name,
        password: data.password,
        partnerCode: data.partnerCode.trim() || undefined,
        deviceFingerprint: getDeviceFingerprint(),
      }).unwrap();

      toast.success(result.message);
      router.push(
        `/verify-email?identifier=${encodeURIComponent(result.identifier)}&channel=${result.verificationChannel}`,
      );
    } catch (error) {
      toast.error(apiError(error));
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <div className="scale-90">
        <Logo />
      </div>
      <h1 className="brand-highlight-text text-center text-2xl font-black uppercase text-white">
        Join the Game!
      </h1>
      <p className="mt-1 text-sm font-semibold text-white/50">
        Create your account &amp; start winning
      </p>

      <div className="mt-4 flex w-full items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-400" />
        <span className="text-xs font-bold text-white">✦ REGISTER ✦</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-400" />
      </div>

      <div className="mt-4 w-full rounded-3xl border border-yellow-400/15 bg-gradient-to-br from-purple-900/60 to-indigo-950/70 p-5 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FieldLabel text="👤 Full Name" />
          <AuthInput
            placeholder="Enter your full name"
            error={errors.fullName?.message}
            {...register("fullName", {
              required: "Full name is required",
              minLength: { value: 3, message: "Minimum 3 characters" },
            })}
          />

          <FieldLabel text="🌍 Country & Mobile Number" />
          <CountryPhoneInput
            country={country}
            value={mobileNumber}
            onCountryChange={(next) => {
              if (!next.code || !next.iso) return;
              setCountry(next);
              setValue("mobileNumber", "");
            }}
            onChange={(value) =>
              setValue("mobileNumber", value, { shouldValidate: true })
            }
            error={errors.mobileNumber?.message}
          />
          <input
            type="hidden"
            {...register("mobileNumber", {
              required: "Mobile number is required",
              minLength: { value: 6, message: "Enter a valid mobile number" },
            })}
          />

          <FieldLabel
            text={emailRequired ? "✉️ Email Address" : "✉️ Email Address "}
          />
          <AuthInput
            type="email"
            placeholder={
              emailRequired
                ? "Code will be sent to this email"
                : "Enter your email"
            }
            error={errors.email?.message}
            {...register("email", {
              required: emailRequired
                ? "Email is required outside Bangladesh"
                : false,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
          />

          <FieldLabel text="🎁 Referral Code (Optional)" />
          <AuthInput
            placeholder="Enter referral code"
            readOnly={Boolean(referral)}
            {...register("partnerCode")}
          />

          <FieldLabel text="🔒 Password" />
          <AuthInput
            type="password"
            placeholder="Minimum 6 characters"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            })}
          />

          <FieldLabel text="🔒 Confirm Password" />
          <AuthInput
            type="password"
            placeholder="Confirm password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Confirm your password",
              validate: (value) =>
                value === password || "Passwords do not match",
            })}
          />

          <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold leading-5 text-cyan-100">
            {country.iso === "BD"
              ? "Verification code will be sent by SMS. Enter only the number after +880."
              : "Verification code will be sent by email. Enter only the local mobile number after the selected country code."}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="ls-btn ls-btn-red ls-shine-effect mt-1 w-full py-3.5 text-[16px] font-black disabled:opacity-60"
          >
            {isLoading ? "Creating Account..." : "🎮 CREATE ACCOUNT"}
          </button>
        </form>
      </div>

      <p className="mt-5 text-sm font-bold text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="text-yellow-400">
          Sign In
        </Link>
      </p>
    </div>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <label className="-mb-2 block text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
      {text}
    </label>
  );
}
