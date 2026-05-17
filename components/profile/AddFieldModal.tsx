"use client";

// ✅ AddFieldModal.tsx
// Generic add/update modal
// username / city / phone link ইত্যাদির জন্য reusable

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddFieldModalProps {
  open: boolean;
  title: string;
  fieldLabel: string;
  placeholder: string;
  inputType?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
  loading?: boolean;
  note?: string;
  prefix?: string;
  initialValue?: string;
}

export default function AddFieldModal({
  open,
  title,
  fieldLabel,
  placeholder,
  inputType = "text",
  onConfirm,
  onClose,
  loading = false,
  note,
  prefix,
  initialValue = "",
}: AddFieldModalProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Modal open হলে default value set + focus
  useEffect(() => {
    if (open) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, initialValue]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  if (!open) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* ── Modal Card ── */}
      <div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[360px] rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(145deg, rgba(29,8,65,0.98) 0%, rgba(14,3,38,0.99) 100%)",
          border: "1px solid rgba(35,255,200,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* ── Input field ── */}
        <label className="block mb-2 text-[12px] font-semibold text-white/50 uppercase tracking-wider">
          {fieldLabel}
        </label>

        <div
          className="flex items-center rounded-xl overflow-hidden mb-4"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(35,255,200,0.2)",
          }}
        >
          {prefix && (
            <span className="px-3 text-[14px] text-white/60 border-r border-white/10 py-3 shrink-0">
              {prefix}
            </span>
          )}

          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 bg-transparent px-3 py-3 text-[14px] text-white placeholder:text-white/25 outline-none"
          />
        </div>

        {note && (
          <p className="text-[11px] text-white/40 mb-4 leading-relaxed">
            {note}
          </p>
        )}

        {/* ── Action buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!value.trim() || loading}
            className={[
              "flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all",
              value.trim() && !loading
                ? "text-black bg-[#23ffc8] hover:bg-[#23ffc8]/90 active:scale-95"
                : "text-white/30 bg-white/10 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
        </div>
      </div>
    </>
  );
}
