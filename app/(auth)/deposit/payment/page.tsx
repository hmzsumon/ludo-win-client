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
    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(5,83,190,0.26) 100%)",
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

  const handleTxnIdChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/\s/g, "");
    setTxnId(upperValue);
  };

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
      txnId: txnId.trim().toUpperCase(),
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
    <div className="min-h-screen lw-main-flow-bg">
      {/* Header */}
      <div
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{
          background:
            "linear-gradient(135deg,rgba(8,99,202,0.94),rgba(0,174,229,0.88))",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition hover:text-white"
          style={{ background: "rgba(255,255,255,0.07)" }}
          onClick={() => router.back()}
          type="button"
        >
          <FaAngleLeft className="text-xs" /> Back
        </button>

        <h1 className="text-base font-extrabold tracking-widest text-white uppercase">
          Payment
        </h1>

        <div className="w-16" />
      </div>

      <div className="space-y-3 px-3 pb-10 pt-4">
        {/* Payment Method Panel */}
        <div className="overflow-hidden rounded-2xl" style={PANEL}>
          {/* Method Header */}
          <div
            className="px-5 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="space-y-2 text-center">
              <div className="overflow-hidden rounded-xl">
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
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
                    style={{ background: "rgba(14,165,233,0.28)" }}
                  >
                    PM
                  </div>
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-white">
                  {getWalletTitle(methodName, methodType)}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-3 p-4">
            {isMethodLoading ? (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading payment method...
              </div>
            ) : !paymentMethod ? (
              <div
                className="rounded-xl p-3 text-sm"
                style={{
                  background: "rgba(255,80,80,0.1)",
                  border: "1px solid rgba(255,255,255,0.28)",
                  color: "#ffaaaa",
                }}
              >
                Payment method not found.
              </div>
            ) : (
              <>
                {/* Account Number */}
                <div>
                  <label className="mb-1.5 ml-1 block text-[10px] uppercase tracking-widest text-white">
                    Account Number
                  </label>

                  <div className="relative flex w-full items-center">
                    <input
                      value={paymentMethod.accountNumber || ""}
                      readOnly
                      className="flex-1 rounded-xl px-4 py-3 text-sm font-bold tracking-widest"
                      style={{
                        ...INPUT_BASE,
                        border: `1.5px solid ${methodColor}40`,
                        background: "rgba(0,0,0,0.35)",
                      }}
                    />

                    <div className="absolute right-2">
                      <CopyToClipboard
                        text={paymentMethod.accountNumber || ""}
                      />
                    </div>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="mb-1.5 ml-1 block text-[10px] uppercase tracking-widest text-white">
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

                {/* Transaction ID */}
                <div>
                  <label className="mb-1.5 ml-1 block text-[10px] uppercase tracking-widest text-white">
                    Transaction ID <span className="text-red-400">*</span>
                  </label>

                  <input
                    value={txnId}
                    onChange={(e) => handleTxnIdChange(e.target.value)}
                    placeholder="e.g., 7AB12C3D45"
                    className="w-full rounded-xl px-4 py-2.5 font-mono text-sm uppercase tracking-wider"
                    style={{
                      ...INPUT_BASE,
                      border: txnId
                        ? "1.5px solid rgba(180,80,255,0.5)"
                        : "1.5px solid rgba(255,255,255,0.09)",
                      textTransform: "uppercase",
                    }}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                    maxLength={10}
                  />

                  <div className="mt-1.5 text-center text-[10px] font-bold text-red-300">
                    Enter the TrxID from your {methodName} transaction history.
                  </div>
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
                  type="button"
                >
                  {isCreating ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
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
