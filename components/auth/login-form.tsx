"use client";

import CountryPhoneInput from "@/components/auth/CountryPhoneInput";
import AuthInput from "@/components/auth/auth-input";
import Logo from "@/components/branding/logo";
import { Country } from "@/components/profile/CountrySelectDrawer";
import { useLoginUserMutation } from "@/redux/features/auth/authApi";
import {
  getMarketingAttribution,
  trackMetaCustomEvent,
} from "@/utils/marketingAttribution";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const BANGLADESH: Country = { code: "+880", name: "Bangladesh", iso: "BD" };

type Values = { mobileNumber: string; password: string };

export default function LoginForm(): JSX.Element {
  const router = useRouter();
  const [country, setCountry] = useState<Country>(BANGLADESH);
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({ defaultValues: { mobileNumber: "" } });
  const mobile = watch("mobileNumber");

  const onSubmit = async (data: Values) => {
    try {
      await loginUser({
        localNumber: data.mobileNumber,
        countryCode: country.code,
        countryIso: country.iso,
        countryName: country.name,
        password: data.password,
      }).unwrap();

      const attribution = getMarketingAttribution();
      trackMetaCustomEvent("LoginSuccess", {
        content_name: "LudoWin login",
        traffic_source: attribution?.source || "direct",
        campaign_id: attribution?.campaignId || "",
        ad_id: attribution?.adId || "",
      });

      toast.success("Welcome back!");
      router.replace("/dashboard");
      router.refresh();
    } catch (error: any) {
      const message =
        error?.data?.error || error?.data?.message || "Login failed";
      if (error?.status === 403 && error?.data?.identifier) {
        router.push(
          `/verify-email?identifier=${encodeURIComponent(error.data.identifier)}&channel=${error.data.verificationChannel}`,
        );
      }
      toast.error(message);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      <div className="scale-90">
        <Logo />
      </div>
      <h1 className="text-2xl font-black uppercase text-white">Welcome Back</h1>
      <p className="mt-1 text-sm font-semibold text-white/50">
        Sign in to continue playing
      </p>

      <div className="mt-5 w-full rounded-2xl border border-yellow-400/15 bg-gradient-to-br from-purple-900/60 to-indigo-950/70 p-5 shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <label className="text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
            🌍 Country & Mobile Number
          </label>
          <CountryPhoneInput
            country={country}
            value={mobile}
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

          <label className="text-[11px] font-black uppercase tracking-widest text-[#03b2fd]">
            🔒 Password
          </label>
          <AuthInput
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-red-400"
            >
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="ls-btn ls-btn-green ls-shine-effect w-full py-3.5 text-[16px] font-black disabled:opacity-60"
          >
            {isLoading ? "Signing In..." : "🎲 Sign In & Play"}
          </button>
        </form>
      </div>

      <Link href="/register" className="mt-4 block w-full">
        <button className="ls-btn ls-btn-red ls-shine-effect w-full py-3.5 text-[16px] font-black">
          ✨ Create New Account
        </button>
      </Link>
    </div>
  );
}
