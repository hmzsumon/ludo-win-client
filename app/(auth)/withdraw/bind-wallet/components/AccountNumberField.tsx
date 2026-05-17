"use client";
import React from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
};

const AccountNumberField: React.FC<Props> = ({
  label,
  value,
  onChange,
  placeholder,
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
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 1H7C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 18H7V5h10v14z" />
        </svg>
      </span>
      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, 11))
        }
        inputMode="numeric"
        placeholder={placeholder}
        className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
        style={{
          background: "rgba(0,0,0,0.3)",
          border:
            value.length === 11
              ? "1.5px solid rgba(80,200,120,0.5)"
              : value.length > 0
                ? "1.5px solid rgba(180,80,255,0.45)"
                : "1.5px solid rgba(255,255,255,0.09)",
          color: "#fff",
        }}
      />
    </div>
    {error && (
      <p className="mt-1 text-[11px]" style={{ color: "#f87171" }}>
        {error}
      </p>
    )}
  </div>
);

export default AccountNumberField;
