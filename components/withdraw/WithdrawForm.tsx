/* ── Component: WithdrawForm ────────────────────────────────────────────── */
"use client";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

const PROVIDER_LABELS: Record<string, string> = {
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  binance: "Binance",
  crypto: "Crypto",
  cash: "Cash",
};

const getAccountMeta = (provider?: string) => {
  const key = String(provider || "").toLowerCase();

  /* ────────── Provider Wise Account Input Meta ────────── */
  if (key === "binance") {
    return {
      label: "Binance Pay ID / Binance UID",
      placeholder: "Enter your Binance Pay ID or UID",
      error: (value: string) => {
        if (!value) return "Please enter Binance Pay ID / UID";
        if (!/^[A-Za-z0-9_-]{6,32}$/.test(value)) {
          return "Enter a valid Binance Pay ID / UID";
        }
        return "";
      },
      notice:
        "Please use your own Binance account ID. Using a wrong ID may result in a lost payment.",
    };
  }

  if (key === "crypto") {
    return {
      label: "TRC-20 Wallet Address",
      placeholder: "Enter your TRC-20 wallet address",
      error: (value: string) => {
        if (!value) return "Please enter TRC-20 wallet address";
        if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(value)) {
          return "Enter a valid TRC-20 wallet address";
        }
        return "";
      },
      notice:
        "Only use a TRC-20 network wallet address. Using another network address may cause the payment to fail.",
    };
  }

  if (key === "cash") {
    return {
      label: "Cash Agent",
      placeholder: "Select cash agent",
      error: (_value: string) => "",
      notice:
        "Cash withdraw এর জন্য নিচের list থেকে cash type agent select করুন। Request টি selected agent এর কাছে approval এর জন্য যাবে।",
    };
  }

  return {
    label: `${PROVIDER_LABELS[key] || provider || "E-Wallet"} Personal Account Number`,
    placeholder: `Enter your ${PROVIDER_LABELS[key] || provider || "wallet"} number`,
    error: (value: string) => {
      if (!value) return "Please enter account number";
      if (!/^01[3-9]\d{8}$/.test(value)) {
        return "Enter a valid 11-digit mobile number";
      }
      return "";
    },
    notice:
      "Funds are transferred to personal accounts only. Agent or merchant accounts are not supported. Please double-check your number before submitting.",
  };
};

export type CashWithdrawAgentOption = {
  _id: string;
  agentTitle?: string;
  name?: string;
  customerId?: string;
  phone?: string;
};

export default function WithdrawForm({
  min = 500,
  max = 25000,
  available,
  disabled,
  provider,
  cashAgents = [],
  cashAgentsLoading = false,
  onSubmit,
}: {
  min?: number;
  max?: number;
  available: number;
  disabled?: boolean;
  provider?: string;
  cashAgents?: CashWithdrawAgentOption[];
  cashAgentsLoading?: boolean;
  onSubmit: (
    amount: number,
    txPass: string,
    accountNumber: string,
    cashAgentId?: string,
  ) => void;
}) {
  const [amount, setAmount] = useState<string>("");
  const [pass, setPass] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [cashAgentId, setCashAgentId] = useState("");
  const [cashAgentSearch, setCashAgentSearch] = useState("");
  const [cashDropdownOpen, setCashDropdownOpen] = useState(false);
  const [show, setShow] = useState(false);

  const providerKey = String(provider || "").toLowerCase();

  const accountMeta = getAccountMeta(providerKey);

  /* ────────── Dynamic Amount Placeholder ────────── */
  const amountPlaceholder = useMemo(() => {
    const minText = min.toLocaleString();
    const maxText = Number.isFinite(max) ? max.toLocaleString() : "Unlimited";
    return `${minText} - ${maxText}`;
  }, [min, max]);

  const n = Number(amount || 0);
  const amountErr = !amount
    ? "Please enter an amount"
    : n < min
      ? `Minimum withdrawal amount is 💎${min.toLocaleString()}`
      : Number.isFinite(max) && n > max
        ? `Maximum withdrawal amount is 💎${max.toLocaleString()}`
        : n > available
          ? "Insufficient balance"
          : "";

  const isCashProvider = providerKey === "cash";

  /* ────────── smart cash agent search list ──────────
     agentTitle unique, তাই dropdown/search এ title first দেখাচ্ছি।
  ────────── */
  const selectedCashAgent = useMemo(
    () => cashAgents.find((agent) => String(agent._id) === String(cashAgentId)),
    [cashAgents, cashAgentId],
  );

  const filteredCashAgents = useMemo(() => {
    const q = cashAgentSearch.trim().toLowerCase();

    if (!q) return cashAgents;

    return cashAgents.filter((agent) => {
      const haystack = [
        agent.agentTitle,
        agent.name,
        agent.customerId,
        agent.phone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [cashAgents, cashAgentSearch]);

  const accountErr = isCashProvider ? "" : accountMeta.error(accountNumber);
  const cashAgentErr =
    isCashProvider && !cashAgentId ? "Please select a cash agent" : "";

  const isValid = useMemo(
    () => !amountErr && !accountErr && !cashAgentErr && pass.length >= 6,
    [amountErr, accountErr, cashAgentErr, pass],
  );

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/80 outline-none transition focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20";

  const labelClass =
    "mb-1.5 block ml-1 text-xs font-semibold uppercase tracking-widest text-white";

  return (
    <div className="space-y-4 p-4">
      {/* ── Notice ── */}
      <div
        className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
        style={{
          background: "rgba(234,179,8,0.08)",
          border: "1px solid rgba(234,179,8,0.2)",
        }}
      >
        <span className="mt-0.5 text-base">⚠️</span>
        <p className="text-xs leading-relaxed text-yellow-300/80">
          {accountMeta.notice}
        </p>
      </div>

      {/* ── Account Number / Cash Agent ── */}
      <div>
        <label className={labelClass}>{accountMeta.label}</label>

        {isCashProvider ? (
          <div className="relative">
            {/* ────────── smart searchable cash agent dropdown ────────── */}
            <button
              type="button"
              disabled={cashAgentsLoading}
              onClick={() => setCashDropdownOpen((v) => !v)}
              className={`${inputClass} flex items-center justify-between text-left`}
            >
              <span
                className={selectedCashAgent ? "text-white" : "text-white/35"}
              >
                {cashAgentsLoading
                  ? "Loading cash agents..."
                  : selectedCashAgent
                    ? `${selectedCashAgent.agentTitle || selectedCashAgent.name || "Cash Agent"} `
                    : "Select cash agent"}
              </span>
              <span className="text-white/35">
                <ChevronDown size={16} />
              </span>
            </button>

            {cashDropdownOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-white/10 bg-[#12091d] shadow-2xl">
                <div className="border-b border-white/10 p-2">
                  <input
                    autoFocus
                    value={cashAgentSearch}
                    onChange={(e) => setCashAgentSearch(e.target.value)}
                    placeholder="Search by agent title, name, ID, phone"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white outline-none placeholder-white/30 focus:border-violet-500/60"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto p-1.5">
                  {filteredCashAgents.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-white/40">
                      No cash agent found
                    </div>
                  ) : (
                    filteredCashAgents.map((agent) => (
                      <button
                        key={agent._id}
                        type="button"
                        onClick={() => {
                          setCashAgentId(agent._id);
                          setCashDropdownOpen(false);
                          setCashAgentSearch("");
                        }}
                        className="mb-1 w-full rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white">
                            {agent.agentTitle || agent.name || "Cash Agent"}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <input
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.trim())}
            inputMode="text"
            placeholder={accountMeta.placeholder}
            className={inputClass}
          />
        )}

        {!isCashProvider && accountNumber && accountErr && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
            <span>⚠</span> {accountErr}
          </p>
        )}

        {isCashProvider && cashAgentErr && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
            <span>⚠</span> {cashAgentErr}
          </p>
        )}
      </div>

      {/* ── Amount ── */}
      <div>
        <label className={labelClass}>Withdrawal Amount</label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-base font-bold">
            💎
          </span>
          <input
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^\d]/g, "").slice(0, 7))
            }
            inputMode="numeric"
            placeholder={amountPlaceholder}
            className={`${inputClass} pl-8`}
          />
        </div>

        {amount && amountErr && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
            <span>⚠</span> {amountErr}
          </p>
        )}

        {!amountErr && amount && (
          <p className="mt-1.5 text-xs text-emerald-400/70">
            ✓ Amount looks good
          </p>
        )}
      </div>

      {/* ── Transaction Password ── */}
      <div>
        <label className={labelClass}>Your Password</label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Enter your password"
            className={`${inputClass} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-white/40 transition hover:text-white/70"
            aria-label="Toggle password visibility"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              {show ? (
                <path d="M12 4.5C4.73 4.5 1 12 1 12s3.73 7.5 11 7.5S23 12 23 12 19.27 4.5 12 4.5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
              ) : (
                <path d="M12 6c3.86 0 7.16 2.23 8.82 5.5-.46.92-1.08 1.76-1.82 2.5l1.41 1.41C22.09 13.88 23 12 23 12S19.27 4.5 12 4.5c-1.08 0-2.1.14-3.06.41l1.64 1.64C11.08 6.18 11.53 6 12 6zM2.1 2.1L.69 3.51 4.2 7.02C2.69 8.12 1.5 9.46 1 10.5c0 0 3.73 7.5 11 7.5 1.56 0 3.03-.28 4.37-.79l2.62 2.62 1.41-1.41L2.1 2.1z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="button"
        disabled={!isValid || disabled}
        onClick={() =>
          onSubmit(Number(amount), pass, accountNumber, cashAgentId)
        }
        className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-widest transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
        style={
          isValid && !disabled
            ? {
                background:
                  "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)",
                boxShadow: "0 0 20px rgba(168,85,247,0.4)",
                color: "#fff",
              }
            : {
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.3)",
              }
        }
      >
        Submit Withdrawal
      </button>
    </div>
  );
}
