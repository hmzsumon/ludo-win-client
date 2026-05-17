"use client";

import React from "react";

type GameActionButtonProps = {
  label?: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  colors?: {
    start: string;
    mid: string;
    end: string;
  };
  textColor?: string;
  ringColor?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

const SIZES = {
  sm: {
    h: "h-8",
    px: "px-3",
    text: "text-[13px]",
    gap: "gap-1.5",
    icon: "text-[14px]",
  },
  md: {
    h: "h-10",
    px: "px-5",
    text: "text-[16px]",
    gap: "gap-2",
    icon: "text-[16px]",
  },
  lg: {
    h: "h-12",
    px: "px-6",
    text: "text-[18px]",
    gap: "gap-2.5",
    icon: "text-[18px]",
  },
};

const GameActionButton: React.FC<GameActionButtonProps> = ({
  label = "Button",
  onClick,
  size = "md",
  className = "",
  colors = { start: "#59d8ff", mid: "#1ca7ec", end: "#0b63ce" },
  textColor = "#ffffff",
  ringColor,
  disabled = false,
  icon,
  iconPosition = "left",
}) => {
  const s = SIZES[size];

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  const style: React.CSSProperties = {
    background: `linear-gradient(180deg, ${colors.start} 0%, ${colors.mid} 54%, ${colors.end} 100%)`,
    color: textColor,
    ...(ringColor
      ? ({ ["--tw-ring-color"]: ringColor } as React.CSSProperties)
      : {}),
  };

  const iconNode = icon ? (
    <span
      className={[
        "relative z-10 inline-flex items-center justify-center shrink-0",
        s.icon,
      ].join(" ")}
    >
      {icon}
    </span>
  ) : null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      disabled={disabled}
      aria-disabled={disabled}
      className={[
        "relative inline-flex items-center justify-center",
        s.h,
        s.px,
        s.text,
        s.gap,
        "rounded-full font-extrabold tracking-wide",
        "ring-1 focus:outline-none focus:ring-2",
        "[box-shadow:0_8px_16px_rgba(0,0,0,.35)]",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:brightness-110 active:translate-y-[1px]",
        className,
      ].join(" ")}
      style={style}
    >
      <span
        className="pointer-events-none absolute inset-x-1 top-1 h-[58%] rounded-full
                   bg-[linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,255,255,0))]
                   opacity-90"
      />

      <span
        className="pointer-events-none absolute inset-[3px] rounded-full
                   [box-shadow:inset_0_0_0_1px_rgba(255,255,255,.45),inset_0_-10px_14px_rgba(0,0,0,.25)]"
      />

      <span className="relative z-10 inline-flex items-center justify-center">
        {iconPosition === "left" && iconNode}
        <span className="relative drop-shadow-[0_2px_2px_rgba(0,0,0,.35)]">
          {label}
        </span>
        {iconPosition === "right" && iconNode}
      </span>
    </button>
  );
};

export default GameActionButton;
