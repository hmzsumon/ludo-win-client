"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Swal from "sweetalert2";
import AuthInput from "./AuthInput";

// 👉 path নিজের প্রজেক্ট অনুযায়ী ঠিক করে নিও
import { useLoginUserMutation } from "@/redux/features/auth/authApi";

type LoginErrors = {
  mobile?: string;
  password?: string;
  general?: string;
};

const LoginForm = () => {
  const router = useRouter();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});

  // 🔹 RTK Query hook
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: LoginErrors = {};

    if (!mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 🔹 backend এ আমরা phone দিয়ে login করছি
      const body = { phone: mobile, password };

      const res = await loginUser(body).unwrap();

      // চাইলে success alert দিবে, না চাইলে সরাসরি redirect
      await Swal.fire({
        icon: "success",
        title: "Login successful",
        text: `Welcome back${res?.user?.name ? `, ${res.user.name}` : "!"}`,
        confirmButtonColor: "#fbbf24",
      });

      // ✅ পুরো পেজ রিলোড → UserProvider আবার রান হবে, useLoadUserQuery নতুন data নিবে
      // যাতে OnlinePage আর login form না দেখিয়ে game flow তে যায়
      window.location.href = "/online";
      // চাইলে শুধু window.location.reload() ও দিতে পারো
      // window.location.reload();
    } catch (err: any) {
      console.log("Login error:", err);

      const apiMessage =
        err?.data?.error || // { error: "Mobile number already exists" } টাইপ
        err?.data?.message || // { message: "Invalid credentials" } টাইপ
        err?.error ||
        err?.message ||
        "Login failed";

      setErrors({ general: apiMessage });

      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: apiMessage,
        confirmButtonColor: "#f87171",
      });
    }
  };

  return (
    <div className="page-content w-full max-w-md mx-auto mt-4 px-3">
      <div className="bg-sky-900/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/15 px-5 py-6 space-y-4">
        <h2 className="text-center text-xl font-semibold tracking-wide text-white drop-shadow">
          LOGIN
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Mobile number"
            type="tel"
            placeholder="Enter mobile number"
            value={mobile}
            onChange={(v) => {
              setMobile(v);
              if (errors.mobile)
                setErrors((prev) => ({ ...prev, mobile: undefined }));
            }}
            error={errors.mobile}
          />

          <AuthInput
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            showTogglePassword
            error={errors.password}
          />

          {errors.general && (
            <p className="text-xs text-red-200 bg-red-500/25 rounded-xl px-3 py-2 text-center">
              {errors.general}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold py-2.5 text-sm shadow-[0_4px_0_rgba(0,0,0,0.35)] active:shadow-[0_2px_0_rgba(0,0,0,0.55)] active:translate-y-0.5 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-center text-sky-100 mt-1">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-semibold text-yellow-300 hover:text-yellow-200 underline underline-offset-2"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
