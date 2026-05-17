"use client";

import {
  useCancelMyWithdrawRequestMutation,
  useGetMyWithdrawsQuery,
  WithdrawStatus,
} from "@/redux/features/withdraw/withdrawApi";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleLeft } from "react-icons/fa";

/* ────────── Utils ────────── */
const pad2 = (n: number) => String(n).padStart(2, "0");
const toYMD = (d: Date) => {
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `${y}-${m}-${day}`;
};
const toMMDD = (d: Date) =>
  `${pad2(d.getUTCMonth() + 1)}/${pad2(d.getUTCDate())}`;
const addDaysUTC = (d: Date, n: number) => {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
};
const formatDT = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

const statusLabel = (s?: string) => {
  switch (s) {
    case "approved":
      return { t: "Approved", color: "#4ade80", bg: "rgba(74,222,128,0.1)" };
    case "pending":
      return { t: "Pending", color: "#fb923c", bg: "rgba(251,146,60,0.1)" };
    case "confirmed":
      return { t: "New", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" };
    case "rejected":
      return { t: "Rejected", color: "#f87171", bg: "rgba(248,113,113,0.1)" };
    case "failed":
      return { t: "Failed", color: "#f87171", bg: "rgba(248,113,113,0.1)" };
    case "cancelled":
      return { t: "Cancelled", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
    default:
      return { t: "All", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" };
  }
};

function Tabs({
  active,
  onChange,
}: {
  active: "today" | "yesterday" | "7days";
  onChange: (v: "today" | "yesterday" | "7days") => void;
}) {
  const tabs = [
    ["today", "Today"],
    ["yesterday", "Yesterday"],
    ["7days", "7-Days"],
  ] as const;
  return (
    <div
      className="flex"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      {tabs.map(([k, label]) => {
        const is = active === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className="flex-1 py-3 text-center text-sm font-semibold transition-all"
            style={{
              color: is ? "#c084fc" : "rgba(255,255,255,0.4)",
              borderBottom: is ? "2px solid #c084fc" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TypesModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (v: string) => void;
}) {
  if (!open) return null;
  const items = [
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "New", value: "confirmed" },
    { label: "Rejected", value: "rejected" },
    { label: "Failed", value: "failed" },
    { label: "Cancelled", value: "cancelled" },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="w-full rounded-t-3xl overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(55,8,80,0.99) 0%, rgba(20,4,31,1) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="text-sm font-bold text-white/60 uppercase tracking-widest">
            Filter Types
          </div>
          <button
            onClick={onClose}
            className="text-white/40 text-2xl hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-3">
          {items.map((it) => {
            const st = statusLabel(it.value);
            return (
              <button
                key={it.value}
                onClick={() => {
                  onPick(it.value);
                  onClose();
                }}
                className="w-full text-left py-3.5 text-sm flex items-center gap-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: st.color }}
                />
                <span style={{ color: st.color }}>{it.label}</span>
              </button>
            );
          })}
        </div>
        <div className="pb-8" />
      </div>
    </div>
  );
}

function DateRangeModal({
  open,
  from,
  to,
  onClose,
  onApply,
}: {
  open: boolean;
  from: string;
  to: string;
  onClose: () => void;
  onApply: (f: string, t: string) => void;
}) {
  const [f, setF] = useState(from);
  const [t, setT] = useState(to);
  if (!open) return null;
  const inputStyle = {
    background: "rgba(0,0,0,0.4)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#fff",
    padding: "10px 14px",
    width: "100%",
    outline: "none",
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ background: "rgba(0,0,0,0.7)" }}
    >
      <div
        className="w-full rounded-t-3xl overflow-hidden pb-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(55,8,80,0.99) 0%, rgba(20,4,31,1) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="text-sm font-bold text-white/60 uppercase tracking-widest">
            Date Range
          </div>
          <button
            onClick={onClose}
            className="text-white/40 text-2xl hover:text-white"
          >
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-widest text-white/35 mb-1.5 block">
                From
              </label>
              <input
                type="date"
                value={f}
                onChange={(e) => setF(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] uppercase tracking-widest text-white/35 mb-1.5 block">
                To
              </label>
              <input
                type="date"
                value={t}
                onChange={(e) => setT(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => {
                const ymd = toYMD(new Date());
                setF(ymd);
                setT(ymd);
              }}
              className="flex-1 rounded-xl py-3 text-sm font-semibold text-white/50"
              style={{ border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Clear
            </button>
            <button
              onClick={() => {
                if (!f || !t) {
                  toast.error("Please select from/to date");
                  return;
                }
                onApply(f, t);
                onClose();
              }}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#9333ea,#7c3aed)" }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CancelWithdrawModal({
  open,
  withdraw,
  cancelling,
  onClose,
  onConfirm,
}: {
  open: boolean;
  withdraw: any | null;
  cancelling: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open || !withdraw) return null;

  const amount = Number(withdraw?.amount || 0).toFixed(2);
  const netAmount = Number(
    withdraw?.netAmount || withdraw?.amount || 0,
  ).toFixed(2);
  const methodName = String(
    withdraw?.methodName || withdraw?.method?.name || "WITHDRAW",
  ).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.78)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-[360px] overflow-hidden rounded-[28px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(58,9,80,0.98) 0%, rgba(20,4,31,1) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.55)",
        }}
      >
        {/* Cancel confirmation modal - smart UI */}
        <div className="relative px-5 pt-5 pb-4 text-center">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            ×
          </button>

          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-3xl"
            style={{
              background:
                "linear-gradient(135deg,rgba(239,68,68,0.22),rgba(192,38,211,0.22))",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            ⚠️
          </div>

          <h3 className="mt-4 text-lg font-black text-white">
            Cancel Withdraw?
          </h3>
          <p className="mx-auto mt-1 max-w-[270px] text-xs leading-5 text-white/55">
            This pending withdraw request will be cancelled and the amount will
            return to your wallet.
          </p>
        </div>

        <div
          className="mx-5 rounded-2xl bg-black/20 p-3"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
              Method
            </span>
            <span className="text-xs font-extrabold text-white/75">
              {methodName}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
              Request
            </span>
            <span className="text-sm font-black text-red-300">
              BDT {amount}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/35">
              Net Return
            </span>
            <span className="text-sm font-black text-purple-300">
              BDT {netAmount}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pb-5 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={cancelling}
            className="rounded-2xl py-3 text-sm font-extrabold text-white/70 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Keep
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={cancelling}
            className="rounded-2xl py-3 text-sm font-extrabold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg,#ef4444,#be123c)",
              boxShadow: "0 12px 26px rgba(190,18,60,0.28)",
            }}
          >
            {cancelling ? "Cancelling..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WithdrawCard({
  w,
  onCancel,
  cancelling,
}: {
  w: any;
  onCancel: (w: any) => void;
  cancelling: boolean;
}) {
  const methodName = String(
    w?.methodName || w?.method?.name || "WITHDRAW",
  ).toUpperCase();
  const accountNo = String(w?.accountNumber || w?.method?.accountNumber || "-");
  const createdAt = formatDT(w?.createdAt);
  const processedAt = formatDT(w?.processedAt || w?.approvedAt || w?.updatedAt);
  const amount = Number(w?.amount || 0).toFixed(2);
  const charge = Number(w?.charge || w?.handlingFee || 0).toFixed(2);
  const netAmount = Number(w?.netAmount || w?.amount || 0).toFixed(2);
  const ref = String(w?.withdrawCode || w?.orderId || w?.ref || w?._id || "-");
  const st = statusLabel(w?.status);
  const canCancel = String(w?.status || "") === "pending" && Boolean(w?._id);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(ref);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      className="mx-3 mb-3 rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(55,8,75,0.5) 0%, rgba(20,4,31,0.7) 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Card Top */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          <div className="text-xs font-bold text-white">
            {methodName}{" "}
            <span className="text-white/40 font-normal">({accountNo})</span>
          </div>
          <div className="text-[10px] text-white/35 mt-0.5">{createdAt}</div>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold"
          style={{
            color: st.color,
            background: st.bg,
            border: `1px solid ${st.color}30`,
          }}
        >
          {st.t}
        </span>
      </div>

      {/* Ref row */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <div className="text-[10px] text-white/40 uppercase tracking-widest">
          Withdraw Code
        </div>
        <div className="text-xs font-mono text-white/70 flex-1 truncate">
          {ref}
        </div>
        <button
          onClick={copyRef}
          className="text-white/40 hover:text-purple-300 transition text-sm"
        >
          ⧉
        </button>
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-2">
        {[
          { label: "Processed time", val: processedAt },
          { label: "Handling fee", val: charge },
          { label: "Net amount", val: `BDT ${netAmount}` },
          { label: "Remarks", val: w?.rejected_reason || "-" },
        ].map(({ label, val }) => (
          <div key={label} className="flex items-start gap-2">
            <div className="text-[10px] text-white/35 min-w-[110px]">
              {label}
            </div>
            <div className="text-[11px] text-white/60 flex-1">{val}</div>
          </div>
        ))}
      </div>

      {canCancel ? (
        <div
          className="px-4 pb-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          {/* User চাইলে pending withdraw নিজে cancel করতে পারবে */}
          <button
            type="button"
            disabled={cancelling}
            onClick={() => onCancel(w)}
            className="mt-3 w-full rounded-xl py-2.5 text-xs font-extrabold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg,#ef4444,#be123c)",
              boxShadow: "0 10px 22px rgba(0,0,0,0.22)",
            }}
          >
            {cancelling ? "Cancelling..." : "Cancel Withdraw"}
          </button>
        </div>
      ) : null}

      {/* Amounts footer */}
      <div
        className="grid grid-cols-3 gap-2 px-4 py-3"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.1)",
        }}
      >
        <div>
          <div className="text-[10px] text-white/35">Request</div>
          <div className="text-sm font-bold" style={{ color: "#f87171" }}>
            BDT {amount}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-white/35">Net</div>
          <div className="text-sm font-bold text-white/80">BDT {netAmount}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/35">Status</div>
          <div className="text-sm font-bold" style={{ color: st.color }}>
            {st.t}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WithdrawRecordPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"today" | "yesterday" | "7days">("today");
  const [typesOpen, setTypesOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [status, setStatus] = useState<WithdrawStatus>("all");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [cancelMyWithdrawRequest] = useCancelMyWithdrawRequestMutation();

  const { from, to, label } = useMemo(() => {
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    if (tab === "today") {
      const ymd = toYMD(todayUTC);
      return {
        from: ymd,
        to: ymd,
        label: `${toMMDD(todayUTC)}-${toMMDD(todayUTC)}`,
      };
    }
    if (tab === "yesterday") {
      const y = addDaysUTC(todayUTC, -1);
      const ymd = toYMD(y);
      return { from: ymd, to: ymd, label: `${toMMDD(y)}-${toMMDD(y)}` };
    }
    const start = addDaysUTC(todayUTC, -6);
    const end = todayUTC;
    return {
      from: toYMD(start),
      to: toYMD(end),
      label: `${toMMDD(start)}-${toMMDD(end)}`,
    };
  }, [tab]);

  const { data, isLoading, isError } = useGetMyWithdrawsQuery({
    from,
    to,
    status,
  });
  const withdraws = data?.withdraws || [];
  const totalAmount = Number(data?.totalAmount || 0).toFixed(2);
  const st = statusLabel(status);

  const openCancelModal = (withdraw: any) => {
    if (!withdraw?._id || cancellingId) return;
    setCancelTarget(withdraw);
  };

  const closeCancelModal = () => {
    if (cancellingId) return;
    setCancelTarget(null);
  };

  const handleCancelWithdraw = async () => {
    const id = String(cancelTarget?._id || "");
    if (!id || cancellingId) return;

    try {
      setCancellingId(id);
      await cancelMyWithdrawRequest(id).unwrap();
      toast.success("Withdraw cancelled successfully");
      setCancelTarget(null);
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Withdraw cancel failed",
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: "#14041f" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{
          background:
            "linear-gradient(180deg,rgba(30,5,50,0.98),rgba(20,4,31,0.95))",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition hover:text-white"
          style={{ background: "rgba(255,255,255,0.07)" }}
          onClick={() => router.back()}
          type="button"
        >
          <FaAngleLeft className="text-xs" /> Back
        </button>
        <h1 className="text-base font-extrabold tracking-widest text-white uppercase">
          📋 Withdraw Record
        </h1>
        <div className="w-16" />
      </div>

      {/* Tabs */}
      <Tabs active={tab} onChange={setTab} />

      {/* Filters */}
      <div
        className="px-3 py-3 flex items-center gap-2"
        style={{
          background: "rgba(0,0,0,0.2)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={() => setStatus("all")}
          className="rounded-full px-4 py-1.5 text-xs font-semibold transition"
          style={{
            background:
              status === "all"
                ? "linear-gradient(135deg,#9333ea,#7c3aed)"
                : "rgba(255,255,255,0.07)",
            color: status === "all" ? "#fff" : "rgba(255,255,255,0.5)",
            border:
              status === "all" ? "none" : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          All
        </button>

        <button
          onClick={() => setTypesOpen(true)}
          className="rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition"
          style={{
            background: status !== "all" ? st.bg : "rgba(255,255,255,0.07)",
            color: status !== "all" ? st.color : "rgba(255,255,255,0.5)",
            border:
              status !== "all"
                ? `1px solid ${st.color}40`
                : "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {status !== "all" && (
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: st.color }}
            />
          )}
          {status !== "all" ? st.t : "Types"}
        </button>

        <button
          onClick={() => setDateOpen(true)}
          className="ml-auto rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
          style={{
            background: "rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          📅 {label}
        </button>
      </div>

      {/* Body */}
      <div className="pt-3">
        {isLoading ? (
          <div className="p-10 text-center text-white/30">
            <div
              className="inline-block h-6 w-6 animate-spin rounded-full"
              style={{
                border: "2px solid #9333ea",
                borderTopColor: "transparent",
              }}
            />
            <div className="mt-2 text-sm">Loading...</div>
          </div>
        ) : isError ? (
          <div className="p-10 text-center text-red-400 text-sm">
            Failed to load withdraw records
          </div>
        ) : withdraws.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3 opacity-30">📦</div>
            <div className="text-white/30 text-sm">No records found</div>
          </div>
        ) : (
          <>
            {withdraws.map((w: any) => (
              <WithdrawCard
                key={String(w?._id)}
                w={w}
                onCancel={openCancelModal}
                cancelling={cancellingId === String(w?._id)}
              />
            ))}
            <div
              className="mx-3 rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{
                background: "rgba(147,51,234,0.1)",
                border: "1px solid rgba(147,51,234,0.2)",
              }}
            >
              <span className="text-xs text-white/50 uppercase tracking-widest">
                Total Amount
              </span>
              <span
                className="text-sm font-extrabold"
                style={{ color: "#c084fc" }}
              >
                BDT {totalAmount}
              </span>
            </div>
          </>
        )}
      </div>

      <TypesModal
        open={typesOpen}
        onClose={() => setTypesOpen(false)}
        onPick={(v) => setStatus(v as WithdrawStatus)}
      />
      <DateRangeModal
        open={dateOpen}
        from={from}
        to={to}
        onClose={() => setDateOpen(false)}
        onApply={(f, t) => toast.success(`Date set: ${f} → ${t}`)}
      />

      <CancelWithdrawModal
        open={Boolean(cancelTarget)}
        withdraw={cancelTarget}
        cancelling={Boolean(cancellingId)}
        onClose={closeCancelModal}
        onConfirm={handleCancelWithdraw}
      />
    </div>
  );
}
