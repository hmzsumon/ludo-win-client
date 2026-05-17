"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleLeft } from "react-icons/fa";

import BinanceImg from "@/public/images/deposit/binance.png";
import {
  useConfirmBinanceDepositMutation,
  useDepositWithBinanceMutation,
} from "@/redux/features/deposit/depositApi";

export default function BinancePaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const amountFromQuery = searchParams.get("amount") || "";
  const promoFromQuery = searchParams.get("promo") || "0";

  const amountNumber = useMemo(
    () => Number(amountFromQuery),
    [amountFromQuery],
  );

  const promotionOptIn = promoFromQuery === "1";

  const [orderId, setOrderId] = useState("");
  const [confirmOrderId, setConfirmOrderId] = useState("");
  const [pendingDepositId, setPendingDepositId] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [depositWithBinance, { isLoading }] = useDepositWithBinanceMutation();
  const [confirmBinanceDeposit, { isLoading: isConfirming }] =
    useConfirmBinanceDepositMutation();

  /* ════════════════════════════════════════════════════════════════
     submit payment request
     কাজ:
     ✅ pending deposit create করবে
     ✅ সাথে সাথে auto approval check করবে
     ✅ pending হলে confirm modal open করবে
  ════════════════════════════════════════════════════════════════ */
  const handleSubmit = async () => {
    try {
      if (!amountFromQuery || !orderId.trim()) {
        return toast.error("Amount and Order ID are required");
      }

      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        return toast.error("Invalid amount");
      }

      const res = await depositWithBinance({
        amount: amountNumber,
        orderId: orderId.trim(),
        promotionOptIn,
      }).unwrap();

      /* ────────── already approved instantly ────────── */
      if (res?.autoApproved) {
        toast.success(res?.message || "Deposit approved successfully");
        router.push("/deposit/deposit-record");
        return;
      }

      /* ────────── pending হলে confirm modal open ────────── */
      setPendingDepositId(res?.deposit?._id || "");
      setConfirmOrderId(orderId.trim());
      setIsConfirmModalOpen(true);

      toast.success(
        res?.message || "Deposit request created. Please confirm payment.",
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.data?.error || "Submit failed");
    }
  };

  /* ════════════════════════════════════════════════════════════════
     confirm payment
     কাজ:
     ✅ modal থেকে same orderId confirm করবে
     ✅ backend আবার history check করবে
     ✅ match পেলে deposit approve হবে
  ════════════════════════════════════════════════════════════════ */
  const handleConfirmPayment = async () => {
    try {
      if (!pendingDepositId) {
        return toast.error("Pending deposit not found");
      }

      if (!confirmOrderId.trim()) {
        return toast.error("Order ID is required");
      }

      if (confirmOrderId.trim() !== orderId.trim()) {
        return toast.error("Order ID does not match");
      }

      const res = await confirmBinanceDeposit({
        depositId: pendingDepositId,
        orderId: confirmOrderId.trim(),
      }).unwrap();

      toast.success(res?.message || "Deposit approved successfully");
      setIsConfirmModalOpen(false);
      router.push("/deposit/deposit-record");
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.data?.error || "Confirmation failed",
      );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1a2332] text-white">
      {/* background pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#1a2332",
          backgroundImage: `
            linear-gradient(45deg, rgba(240,185,11,0.05) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(240,185,11,0.05) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(240,185,11,0.03) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(240,185,11,0.03) 75%)
          `,
          backgroundSize: "26px 26px",
          backgroundPosition: "0 0, 0 13px, 13px -13px, -13px 0px",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,16,28,0.15) 0%, rgba(10,16,28,0.38) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-4">
        {/* header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          >
            <FaAngleLeft className="text-sm" />
          </button>

          <div className="w-10" />
        </div>

        {/* top logo */}
        <div className="mt-5 flex items-center justify-center">
          <Image
            src={BinanceImg}
            alt="Binance"
            className="h-auto w-[60px] object-contain"
            priority
          />
          <span className=" text-lg font-semibold uppercase tracking-[0.14em] text-[#F1B80A]">
            Binance
          </span>
        </div>

        {/* qr card */}
        <div className="mt-6 rounded-[24px] border border-[#39465b] bg-[#1d2635]/95 px-5 py-8 shadow-[0_10px_40px_rgba(0,0,0,0.30)]">
          <h1 className="text-center text-sm font-medium text-white/95">
            Scan with Binance App to pay
          </h1>

          <div className="mt-7 flex justify-center">
            <div className="rounded-[8px] bg-white p-3">
              <img
                src="/images/deposit/binance-qr.png"
                alt="Binance QR"
                className="h-[225px] w-[225px] object-contain sm:h-[250px] sm:w-[250px]"
              />
            </div>
          </div>

          <div className="mt-10 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                Amount
              </label>
              <input
                value={amountFromQuery}
                readOnly
                placeholder="Amount"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-white/85 outline-none"
              />
              <p className="mt-2 text-[11px] text-white/40">
                Exact amount only
              </p>
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                Binance Order ID
              </label>
              <input
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Paste Binance Order ID"
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            <div className="rounded-2xl border border-[#f0b90b]/20 bg-[#f0b90b]/10 px-4 py-3 text-xs leading-5 text-white/80">
              <span className="font-semibold text-[#f0b90b]">Note:</span> Pay
              the exact amount by scanning the QR code in your Binance app, then
              submit your Binance Order ID.
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <span className="text-xs uppercase tracking-[0.16em] text-white/45">
                Promotion
              </span>
              <span className="text-sm font-semibold text-white/85">
                {promotionOptIn ? "Opt-in" : "Opt-out"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center rounded-2xl bg-[#f0b90b] px-4 py-3.5 text-sm font-extrabold uppercase tracking-[0.14em] text-black transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Payment"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          confirm payment modal
      ════════════════════════════════════════════════════════════════ */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-[24px] border border-white/10 bg-[#1d2635] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            {/* title */}
            <h2 className="text-center text-base font-extrabold uppercase tracking-[0.12em] text-[#f0b90b]">
              Confirm Payment
            </h2>

            {/* subtitle */}
            <p className="mt-3 text-center text-sm leading-6 text-white/75">
              Your deposit request has been created. Please confirm your Binance
              payment by entering the same Order ID again.
            </p>

            {/* confirm order id */}
            <div className="mt-5">
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-white/50">
                Confirm Binance Order ID
              </label>
              <input
                value={confirmOrderId}
                onChange={(e) => setConfirmOrderId(e.target.value)}
                placeholder="Enter Binance Order ID again"
                className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/25"
              />
            </div>

            {/* actions */}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/80"
              >
                Later
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isConfirming}
                className="flex-1 rounded-2xl bg-[#f0b90b] px-4 py-3 text-sm font-extrabold uppercase tracking-[0.12em] text-black disabled:opacity-60"
              >
                {isConfirming ? "Confirming..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
