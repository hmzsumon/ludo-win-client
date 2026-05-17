"use client";

import CopyToClipboard from "@/lib/CopyToClipboard";
import NagadLogo from "@/public/images/deposit/nagad-logo.png";
import {
  useCreateDepositWithBDTMutation,
  useGetMyAgentPaymentMethodByIdQuery,
} from "@/redux/features/deposit/depositApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleLeft } from "react-icons/fa";
import { SlRefresh } from "react-icons/sl";

import PaymentBrandIcon from "./components/BkashIcon";

const MIN_AMOUNT = 100;
const MAX_AMOUNT = 25000;

const getWalletTitle = (methodName?: string, methodType?: string) => {
  const isAgent = methodType === "agent";
  const isPersonal = methodType === "personal";
  if (methodName === "Bkash") {
    if (isAgent) return "bKash Agent Wallet ( Cash Out )";
    if (isPersonal) return "bKash Personal Wallet ( Send Money )";
    return "bKash Wallet";
  }
  if (methodName === "Nagad") {
    if (isAgent) return "Nagad Agent Wallet ( Cash Out )";
    if (isPersonal) return "Nagad Personal Wallet ( Send Money )";
    return "Nagad Wallet";
  }
  return "Wallet";
};

const PANEL = {
  background:
    "linear-gradient(180deg, rgba(67,11,88,0.55) 0%, rgba(20,4,31,0.75) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const INPUT_BASE = {
  background: "rgba(0,0,0,0.3)",
  border: "1.5px solid rgba(255,255,255,0.09)",
  borderRadius: "12px",
  color: "#fff",
  outline: "none",
};

export default function PaymentPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const channelId = sp.get("channelId") || "";
  const amountFromQuery = sp.get("amount") || "";
  const promoFromQuery = sp.get("promo");
  const promotionOptIn = promoFromQuery === "1";

  const [amountInput, setAmountInput] = useState<string>(amountFromQuery);
  const [txnId, setTxnId] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");

  const {
    data: methodRes,
    isLoading: isMethodLoading,
    isError: isMethodError,
    error: methodError,
    refetch,
  } = useGetMyAgentPaymentMethodByIdQuery(channelId, { skip: !channelId });

  const paymentMethod = methodRes?.data;

  const [
    createDepositWithBDT,
    {
      isLoading: isCreating,
      isError: isCreateError,
      isSuccess: isCreateSuccess,
      error: createError,
    },
  ] = useCreateDepositWithBDTMutation();

  useEffect(() => {
    setAmountInput(amountFromQuery || "");
  }, [amountFromQuery]);

  useEffect(() => {
    if (isMethodError) {
      const msg =
        (methodError as fetchBaseQueryError)?.data?.message ||
        (methodError as fetchBaseQueryError)?.data?.error ||
        "Payment channel not found";
      toast.error(msg);
    }
  }, [isMethodError, methodError]);

  useEffect(() => {
    if (isCreateError) {
      toast.error(
        (createError as fetchBaseQueryError)?.data?.message ||
          (createError as fetchBaseQueryError)?.data?.error ||
          "Deposit failed",
      );
    }
    if (isCreateSuccess) {
      toast.success("Deposit created successfully!");
      router.push("/deposit/deposit-record");
    }
  }, [isCreateError, isCreateSuccess, createError, router]);

  const amountNum = amountInput ? Number(amountInput) : NaN;
  const isValidAmount =
    Number.isFinite(amountNum) &&
    amountNum >= MIN_AMOUNT &&
    amountNum <= MAX_AMOUNT;

  const isValid = useMemo(() => {
    if (!channelId) return false;
    if (!paymentMethod?._id) return false;
    if (!isValidAmount) return false;
    if (!txnId.trim()) return false;
    return true;
  }, [channelId, paymentMethod?._id, isValidAmount, txnId]);

  const handleSubmit = async () => {
    if (!isValid) {
      toast.error("Please fill all required fields correctly");
      return;
    }
    createDepositWithBDT({
      amount: Number(amountInput),
      customerNumber,
      txnId,
      methodId: paymentMethod?._id,
      promotionOptIn,
    });
  };

  const methodName = paymentMethod?.methodName;
  const methodType = paymentMethod?.methodType;

  const methodColor =
    methodName === "Bkash"
      ? "#E2136E"
      : methodName === "Nagad"
        ? "#F7941D"
        : "#9333ea";

  return (
    <div className="min-h-screen" style={{ background: "#14041f" }}>
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
          💳 Payment
        </h1>
        <div className="w-16" />
      </div>

      <div className="mx-auto max-w-md px-3 pb-10 pt-4 space-y-3">
        {/* Top Notice */}
        <div
          className="rounded-2xl p-4"
          style={{
            background:
              "linear-gradient(135deg,rgba(30,80,180,0.25),rgba(20,50,140,0.3))",
            border: "1px solid rgba(80,120,255,0.25)",
          }}
        >
          <p className="text-[12px] leading-5 text-blue-200">
            <b className="text-white">⏱ Request making a request,</b> — use the
            payment details below within{" "}
            <b className="text-yellow-300">10 minutes </b> ।
          </p>
        </div>

        {/* Payment Method Panel */}
        <div className="rounded-2xl overflow-hidden" style={PANEL}>
          {/* Method Header */}
          <div
            className="px-4 pt-4 pb-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl overflow-hidden">
                {methodName === "Bkash" ? (
                  <PaymentBrandIcon title="BKash Deposit" />
                ) : methodName === "Nagad" ? (
                  <PaymentBrandIcon
                    title="Nagad Deposit"
                    logoSrc={NagadLogo}
                    alt="Nagad Logo"
                    bgClassName="bg-[#E51B23]"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
                    style={{ background: "rgba(147,51,234,0.3)" }}
                  >
                    PM
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  {getWalletTitle(methodName, methodType)}
                </div>
                <div
                  className="text-[10px] text-white/40 mt-0.5"
                  style={{ color: methodColor }}
                >
                  ● Active
                </div>
              </div>
            </div>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white transition"
              style={{ background: "rgba(255,255,255,0.07)" }}
              type="button"
              onClick={() => refetch()}
            >
              <SlRefresh className="text-xs" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {isMethodLoading ? (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading payment
                method...
              </div>
            ) : !paymentMethod ? (
              <div
                className="rounded-xl p-3 text-sm"
                style={{
                  background: "rgba(255,80,80,0.1)",
                  border: "1px solid rgba(255,80,80,0.25)",
                  color: "#ffaaaa",
                }}
              >
                Payment method not found.
              </div>
            ) : (
              <>
                {/* Account Number */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
                    Account Number
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      value={paymentMethod.accountNumber || ""}
                      readOnly
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold tracking-widest"
                      style={{
                        ...INPUT_BASE,
                        border: `1.5px solid ${methodColor}40`,
                        background: "rgba(0,0,0,0.35)",
                      }}
                    />
                    <div style={{ flexShrink: 0 }}>
                      <CopyToClipboard
                        text={paymentMethod.accountNumber || ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
                    Amount
                  </label>
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                    style={{
                      ...INPUT_BASE,
                      border: isValidAmount
                        ? "1.5px solid rgba(80,200,120,0.5)"
                        : "1.5px solid rgba(255,255,255,0.09)",
                      boxShadow: isValidAmount
                        ? "0 0 8px rgba(80,200,120,0.1)"
                        : undefined,
                    }}
                  >
                    <span className="text-base">💎</span>
                    <input
                      inputMode="numeric"
                      value={amountInput}
                      readOnly
                      className="w-full bg-transparent text-sm font-extrabold text-white outline-none"
                    />
                  </div>
                </div>

                {/* TrxID */}
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-white/40 mb-1.5 block">
                    Transaction ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    placeholder="e.g., 7AB12C3D45"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-mono"
                    style={{
                      ...INPUT_BASE,
                      border: txnId
                        ? "1.5px solid rgba(180,80,255,0.5)"
                        : "1.5px solid rgba(255,255,255,0.09)",
                    }}
                    maxLength={10}
                  />
                  <div className="mt-1.5 text-[10px] text-white/30">
                    Enter the TrxID from your {methodName} transaction history.
                  </div>
                </div>

                {/* Warning */}
                <div
                  className="rounded-xl p-3 text-[11px] leading-5"
                  style={{
                    background: "rgba(255,200,0,0.07)",
                    border: "1px solid rgba(255,200,0,0.2)",
                    color: "#fde68a",
                  }}
                >
                  ⚠️ Please recheck all information. Wrong
                  TxID/TrxID/UTR/Reference can delay verification.
                </div>

                {/* Confirm Button */}
                <button
                  disabled={!isValid || isCreating}
                  onClick={handleSubmit}
                  className="w-full rounded-xl py-3.5 text-sm font-extrabold uppercase tracking-widest transition-all duration-200"
                  style={{
                    background:
                      !isValid || isCreating
                        ? "rgba(255,255,255,0.06)"
                        : "linear-gradient(135deg, #9333ea, #7c3aed)",
                    color:
                      !isValid || isCreating ? "rgba(255,255,255,0.3)" : "#fff",
                    boxShadow:
                      !isValid || isCreating
                        ? "none"
                        : "0 4px 20px rgba(147,51,234,0.5)",
                    border:
                      !isValid || isCreating
                        ? "1px solid rgba(255,255,255,0.06)"
                        : "none",
                    cursor: !isValid || isCreating ? "not-allowed" : "pointer",
                  }}
                >
                  {isCreating ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    "CONFIRM DEPOSIT"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
