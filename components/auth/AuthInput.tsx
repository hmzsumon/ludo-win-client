"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";

interface AuthInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label: string;
  type?: "text" | "email" | "tel" | "password";
  value: string;
  onChange: (value: string) => void;
  showTogglePassword?: boolean;
  error?: string; // 👈 নতুন
}

const AuthInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  showTogglePassword = false,
  error,
  ...rest
}: AuthInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const inputType =
    isPassword && showTogglePassword
      ? showPassword
        ? "text"
        : "password"
      : type;

  const baseInput =
    "w-full rounded-xl bg-white/95 px-4 py-2 text-sm text-slate-800 shadow-inner outline-none transition";
  const extraPadding = isPassword && showTogglePassword ? "pr-10" : "";
  const normalBorder =
    "border border-transparent ring-2 ring-transparent focus:ring-yellow-300 focus:bg-white";
  const errorBorder = "border border-red-400 ring-0";

  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-sky-100 uppercase tracking-wide">
        {label}
      </label>

      <div className={isPassword && showTogglePassword ? "relative" : ""}>
        <input
          {...rest}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} ${extraPadding} ${
            error ? errorBorder : normalBorder
          }`}
        />

        {isPassword && showTogglePassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-sky-600 hover:text-yellow-300 transition"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* 👇 ইনপুটের নিচে error message */}
      {error && <p className="text-[11px] text-red-200 mt-0.5 px-1">{error}</p>}
    </div>
  );
};

export default AuthInput;
