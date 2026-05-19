"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type LsButtonVariant =
  | "gold"
  | "green"
  | "blue"
  | "red"
  | "purple"
  | "yellow"
  | "pink"
  | "logo-red"
  | "logo-orange"
  | "logo-gold"
  | "logo-green"
  | "logo-blue"
  | "logo-purple"
  | "logo-pink";

type LsButtonSize = "sm" | "md" | "lg";

interface LsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: LsButtonVariant;
  size?: LsButtonSize;
  fullWidth?: boolean;
  shine?: boolean;
}

const variantClassMap: Record<LsButtonVariant, string> = {
  gold: "ls-btn-gold",
  green: "ls-btn-green",
  blue: "ls-btn-blue",
  red: "ls-btn-red",
  purple: "ls-btn-purple",
  yellow: "ls-btn-yellow",
  pink: "ls-btn-pink",

  "logo-red": "ls-btn-logo-red",
  "logo-orange": "ls-btn-logo-orange",
  "logo-gold": "ls-btn-logo-gold",
  "logo-green": "ls-btn-logo-green",
  "logo-blue": "ls-btn-logo-blue",
  "logo-purple": "ls-btn-logo-purple",
  "logo-pink": "ls-btn-logo-pink",
};

const sizeClassMap: Record<LsButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-[15px]",
  lg: "px-6 py-4 text-[16px]",
};

/* ────────── Ludo Style Reusable Button ────────── */
/* কাজ:
   ✅ আপনার global .ls-btn class system ব্যবহার করবে
   ✅ gold / green / blue / red / purple / pink variant support করবে
   ✅ logo gradient button variant support করবে
   ✅ disabled / fullWidth / shine effect support করবে
*/
const LsButton = ({
  children,
  variant = "logo-green",
  size = "lg",
  fullWidth = false,
  shine = true,
  className = "",
  type = "button",
  disabled,
  ...props
}: LsButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        "flex items-center justify-center font-black",
        "disabled:cursor-not-allowed disabled:opacity-70",
        "disabled:pointer-events-none",
        "ls-btn",
        variantClassMap[variant],
        shine ? "ls-shine-effect" : "",
        sizeClassMap[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
};

export default LsButton;
