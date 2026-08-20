"use client";

/* ────────── IdentityDocumentModal.tsx ──────────
   NID / Passport / Driving Licence type এবং number একসঙ্গে save করবে।
────────────────────────────────────────────────── */

import { X } from "lucide-react";
import { useEffect, useState } from "react";

export type IdentityDocumentType =
  | "NID"
  | "PASSPORT"
  | "DRIVING_LICENSE";

interface IdentityDocumentModalProps {
  open: boolean;
  initialType?: IdentityDocumentType | "";
  initialNumber?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (value: {
    identityDocumentType: IdentityDocumentType;
    identityDocumentNumber: string;
  }) => void;
}

const DOCUMENT_OPTIONS: Array<{
  value: IdentityDocumentType;
  label: string;
}> = [
  { value: "NID", label: "NID" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving Licence" },
];

export default function IdentityDocumentModal({
  open,
  initialType = "",
  initialNumber = "",
  loading = false,
  onClose,
  onConfirm,
}: IdentityDocumentModalProps) {
  const [type, setType] = useState<IdentityDocumentType | "">(initialType);
  const [number, setNumber] = useState(initialNumber);

  /* ────────── Modal open হলে saved value restore ────────── */
  useEffect(() => {
    if (!open) return;
    setType(initialType);
    setNumber(initialNumber);
  }, [open, initialType, initialNumber]);

  if (!open) return null;

  const canSubmit = Boolean(type && number.trim() && !loading);

  return (
    <>
      {/* ────────── Section: Modal backdrop ────────── */}
      <button
        type="button"
        aria-label="Close identity document form"
        onClick={onClose}
        className="fixed inset-0 z-50 cursor-default bg-black/70 backdrop-blur-sm"
      />

      {/* ────────── Section: Identity form card ────────── */}
      <section className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-cyan-300/15 bg-[linear-gradient(145deg,rgba(29,8,65,0.99),rgba(14,3,38,0.99))] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.72)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-white">
              Identity Document
            </h3>
            <p className="mt-0.5 text-[11px] font-semibold text-white/40">
              Add one official document number
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/55 hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Document type selector */}
        <label className="mb-2 mt-5 block text-[11px] font-black uppercase tracking-wider text-white/50">
          Document Type
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DOCUMENT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={`rounded-xl border px-2 py-2.5 text-[11px] font-black transition ${type === option.value ? "border-[#23ffc8] bg-[#23ffc8]/15 text-[#23ffc8]" : "border-white/10 bg-white/5 text-white/55 hover:bg-white/10"}`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Document number input */}
        <label className="mb-2 mt-4 block text-[11px] font-black uppercase tracking-wider text-white/50">
          Document Number
        </label>
        <input
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          placeholder="Enter document number"
          className="w-full rounded-xl border border-[#23ffc8]/20 bg-white/5 px-3.5 py-3 text-sm font-bold text-white outline-none placeholder:text-white/25 focus:border-[#23ffc8]/60"
        />

        <p className="mt-3 text-[11px] font-semibold leading-5 text-white/38">
          Make sure the full name in your profile matches this document.
        </p>

        {/* Action buttons */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-xs font-black text-white/55"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => {
              if (!type || !number.trim()) return;
              onConfirm({
                identityDocumentType: type,
                identityDocumentNumber: number.trim(),
              });
            }}
            className="flex-1 rounded-xl bg-[#23ffc8] py-2.5 text-xs font-black text-[#0d1822] disabled:cursor-not-allowed disabled:opacity-35"
          >
            {loading ? "Saving..." : "Save Document"}
          </button>
        </div>
      </section>
    </>
  );
}
