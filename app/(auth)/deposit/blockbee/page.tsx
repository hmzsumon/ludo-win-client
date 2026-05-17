"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import { FiCheck, FiCopy } from "react-icons/fi";
import { SquareLoader } from "react-spinners";

import { useSocket } from "@/context/SocketContext";
import { useCreateDepositWithBlockBeeMutation } from "@/redux/features/deposit/depositApi";

import DepositHeader from "@/components/deposit/DepositHeader";
import QRCodeCard from "@/components/deposit/QRCodeCard";
import WalletAddress from "@/components/deposit/WalletAddress";

/* ════════════════════════════════════════════════════════════════
   BlockBee Deposit Page
   ✅ deposit amount query থেকে নেয়
   ✅ promo flag query থেকে নেয়
   ✅ backend এ promotionOptIn পাঠায়
   ✅ hardcoded amount bug remove
════════════════════════════════════════════════════════════════ */
export default function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket } = useSocket();

  const [createDepositRequest, { isLoading }] =
    useCreateDepositWithBlockBeeMutation();
  const [deposit, setDeposit] = useState<any>(null);

  /* ────────── local ui states ────────── */
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  /* ────────── query params ────────── */
  const network = "BEP20";
  const amountFromQuery = Number(searchParams.get("amount") || 0);
  const promoFromQuery = searchParams.get("promo") || "0";

  const promotionOptIn = promoFromQuery === "1";

  /* ════════════════════════════════════════════════════════════════
     create deposit once
     ✅ query amount use করবে
     ✅ promo flag backend এ যাবে
  ════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    (async () => {
      try {
        if (!Number.isFinite(amountFromQuery) || amountFromQuery <= 0) {
          toast.error("Invalid deposit amount");
          router.push("/deposit");
          return;
        }

        const response = await createDepositRequest({
          amount: amountFromQuery,
          chain: "USDT",
          network: "bep20",
          promotionOptIn,
        }).unwrap();

        if (response?.deposit) {
          setDeposit(response.deposit);
        } else {
          toast.error("Failed to create deposit");
        }
      } catch (err: any) {
        toast.error(err?.data?.message || "An unexpected error occurred");
      }
    })();
  }, [createDepositRequest, amountFromQuery, promotionOptIn, router]);

  /* ════════════════════════════════════════════════════════════════
     socket events
     ✅ callback approve হলে realtime update পাবে
  ════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!socket) return;

    socket.on("deposit-update", (data) => {
      toast.success(data.message || "Deposit received!");
      setDeposit(data.deposit);
      router.push("/dashboard");
    });

    socket.on("test-event", () =>
      toast.success("Socket connection test successful!"),
    );

    return () => {
      socket.off("deposit-update");
      socket.off("test-event");
    };
  }, [socket, router]);

  /* ────────── derived ui data ────────── */
  const walletAddress = deposit?.destinationAddress || "Generating address…";
  const qrCodeImage = deposit?.qrCode
    ? `data:image/png;base64,${deposit.qrCode}`
    : null;

  /* ────────── dummy history ui ────────── */
  const depositHistory = useMemo(
    () => [
      {
        id: "1",
        amount: 50,
        status: "Completed",
        date: "2023-06-15 14:30",
        txId: "0x1234567890abcdef1234567890abcdef1234567890abcdef",
      },
      {
        id: "2",
        amount: 100,
        status: "Pending",
        date: "2023-06-14 09:15",
        txId: "0x9876543210fedcba9876543210fedcba9876543210fedcba",
      },
    ],
    [],
  );

  /* ────────── helpers ────────── */
  const handleCopyAddress = () => {
    if (!walletAddress || walletAddress.startsWith("Generating")) return;
    navigator.clipboard.writeText(walletAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 1500);
  };

  const handleCopyTxId = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 1500);
  };

  const formatTxId = (txId: string) => `${txId.slice(0, 6)}…${txId.slice(-4)}`;

  return (
    <div className="min-h-screen bg-neutral-950 px-1 py-4 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* ────────── header ────────── */}
        <DepositHeader
          title={`Deposit USDT (${network})`}
          subtitle={`Secure and fast deposits • Promotion: ${promotionOptIn ? "Opt-in" : "Opt-out"}`}
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/learn/deposit"
                className="rounded-lg border border-emerald-700/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/15"
              >
                Learn more
              </Link>

              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
              >
                <FaArrowLeft className="mr-1 inline" />
                Back
              </button>
            </div>
          }
        />

        {/* ────────── deposit card ────────── */}
        <div className="overflow-hidden rounded-2xl border border-neutral-800 shadow-xl">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm/none opacity-80">
                USDT ({network}) deposit
              </span>

              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
                Amount: {Number.isFinite(amountFromQuery) ? amountFromQuery : 0}{" "}
                USDT
              </span>
            </div>
          </div>

          <div className="space-y-6 bg-neutral-950 p-6">
            {/* ────────── QR code ────────── */}
            <QRCodeCard
              isLoading={isLoading}
              qr={qrCodeImage}
              loadingSlot={
                <div className="flex h-48 w-48 items-center justify-center">
                  <SquareLoader color="#10b981" size={110} />
                </div>
              }
            />

            {/* ────────── wallet address ────────── */}
            <WalletAddress
              network={network}
              address={walletAddress}
              onCopy={handleCopyAddress}
              copied={copiedAddress}
              CopyIcon={copiedAddress ? FiCheck : FiCopy}
              accentClass="text-emerald-400 hover:text-emerald-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
