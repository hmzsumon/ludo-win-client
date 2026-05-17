"use client";
import React from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  leftIcon?: "user";
  helperText?: string;
  error?: string;
};

const TextField: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
  leftIcon,
  helperText,
  error,
}) => (
  <div className="mt-4">
    <label
      className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest"
      style={{ color: "rgba(255,255,255,0.4)" }}
    >
      {label}
    </label>
    <div className="relative">
      {leftIcon === "user" && (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
          </svg>
        </span>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl py-2.5 text-sm outline-none"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: value
            ? "1.5px solid rgba(180,80,255,0.45)"
            : "1.5px solid rgba(255,255,255,0.09)",
          color: "#fff",
          paddingLeft: leftIcon ? "36px" : "16px",
          paddingRight: "16px",
        }}
      />
    </div>
    {helperText && (
      <p
        className="mt-2 text-[11px] leading-5"
        style={{ color: "rgba(255,160,80,0.8)" }}
      >
        {helperText}
      </p>
    )}
    {error && (
      <p className="mt-1 text-[11px]" style={{ color: "#f87171" }}>
        {error}
      </p>
    )}
  </div>
);

export default TextField;
