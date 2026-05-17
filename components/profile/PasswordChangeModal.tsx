"use client";

// ✅ PasswordChangeModal.tsx
// Password change modal
// Features:
// - old password
// - new password
// - confirm password
// - show/hide password
// - submit button
// - কতদিন আগে password change হয়েছে তা দেখাবে

import { Eye, EyeOff, X } from "lucide-react";
import { useEffect, useState } from "react";

interface PasswordChangeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    oldPassword: string;
    newPassword: string;
  }) => Promise<unknown>;
  loading?: boolean;
  daysSincePasswordChange: number;
}

export default function PasswordChangeModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  daysSincePasswordChange,
}: PasswordChangeModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setShowOld(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const trimmedOld = oldPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedOld || !trimmedNew || !trimmedConfirm) {
      setError("All password fields are required");
      return;
    }

    if (trimmedNew.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (trimmedOld === trimmedNew) {
      setError("New password must be different from old password");
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setError("Confirm password does not match");
      return;
    }

    setError("");
    await onSubmit({
      oldPassword: trimmedOld,
      newPassword: trimmedNew,
    });
  };

  if (!open) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />

      {/* ── Modal ── */}
      <div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[380px] rounded-2xl p-5"
        style={{
          background:
            "linear-gradient(145deg, rgba(29,8,65,0.98) 0%, rgba(14,3,38,0.99) 100%)",
          border: "1px solid rgba(35,255,200,0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[16px] font-bold text-white">Change Password</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* ── Password age info ── */}
        <p className="text-[12px] text-white/50 mb-4">
          Days since last change: {daysSincePasswordChange}
        </p>

        {/* ── Fields ── */}
        <PasswordField
          label="Old Password"
          value={oldPassword}
          onChange={setOldPassword}
          show={showOld}
          onToggle={() => setShowOld((prev) => !prev)}
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggle={() => setShowNew((prev) => !prev)}
        />

        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggle={() => setShowConfirm((prev) => !prev)}
        />

        {/* ── Error message ── */}
        {error && <p className="text-[12px] text-red-400 mb-3">{error}</p>}

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={[
              "flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all",
              loading
                ? "text-white/30 bg-white/10 cursor-not-allowed"
                : "text-black bg-[#23ffc8] hover:bg-[#23ffc8]/90 active:scale-95",
            ].join(" ")}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   🔐 Single password field helper
───────────────────────────────────────────── */
function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-3">
      <label className="block mb-2 text-[12px] font-semibold text-white/50 uppercase tracking-wider">
        {label}
      </label>

      <div
        className="flex items-center rounded-xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(35,255,200,0.2)",
        }}
      >
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="flex-1 bg-transparent px-3 py-3 text-[14px] text-white placeholder:text-white/25 outline-none"
        />

        <button
          type="button"
          onClick={onToggle}
          className="px-3 text-white/55 hover:text-white transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
