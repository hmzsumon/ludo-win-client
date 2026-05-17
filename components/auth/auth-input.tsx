"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useMemo, useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

const AuthInput = forwardRef<HTMLInputElement, Props>(function AuthInput(
  { error, className = "", type = "text", ...props },
  ref,
): JSX.Element {
  const [showPassword, setShowPassword] = useState(false);

  /* ────────── Password Toggle State ────────── */
  const isPasswordField = type === "password";

  /* ────────── Input Type Resolver ────────── */
  const inputType = useMemo(() => {
    if (!isPasswordField) return type;
    return showPassword ? "text" : "password";
  }, [isPasswordField, showPassword, type]);

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={ref}
          {...props}
          type={inputType}
          className={`w-full rounded-[14px] border px-6 py-3 pr-16 text-sm font-semibold outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_18px_rgba(0,0,0,0.35)] transition ${
            error
              ? "border-red-500 bg-[linear-gradient(180deg,rgba(65,18,18,0.96),rgba(48,10,10,0.96))] text-red-100 placeholder:text-red-300 focus:border-red-500 focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_2px_rgba(239,68,68,0.18),0_8px_18px_rgba(0,0,0,0.35)]"
              : "border-[#7789ff38] bg-[linear-gradient(180deg,rgba(41,54,120,0.92),rgba(32,43,96,0.94))] text-white placeholder:text-white/80 focus:border-sky-300/50 focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_2px_rgba(88,145,255,0.22),0_8px_18px_rgba(0,0,0,0.35)]"
          } ${className}`}
        />

        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition ${
              error
                ? "text-red-200 hover:bg-red-500/10 hover:text-red-100"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1.5 pl-1 text-xs font-semibold text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export default AuthInput;
