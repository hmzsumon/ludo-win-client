"use client";

import { Loader2 } from "lucide-react";
import Image, { StaticImageData } from "next/image";

import RecIcon from "@/public/icons/record_icon.png";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaAngleLeft } from "react-icons/fa";

import blockBeeImg from "@/public/images/deposit/beep-20.png";
import BinanceImg from "@/public/images/deposit/binance.png";
import Bkash from "@/public/images/deposit/bkash-logo.png";
import Nagad from "@/public/images/deposit/nagad-logo.png";
import Rocket from "@/public/images/deposit/roket.png";

import PromotionConsent, {
  PromoChoice,
} from "@/components/deposit/PromotionConsent";
import {
  AgentPaymentMethod,
  useGetMyAgentPaymentMethodsQuery,
} from "@/redux/features/deposit/depositApi";
import { useGetDepositPromoInfoQuery } from "@/redux/features/promotion/promotionApi";
import { fetchBaseQueryError } from "@/redux/services/helpers";
import Link from "next/link";
import { useSelector } from "react-redux";

type MethodKey = "Bkash" | "Nagad" | "Rocket" | "BlockBee" | "Binance";

const METHOD_ORDER: MethodKey[] = [
  "BlockBee",
  "Binance",
  "Bkash",
  "Nagad",
  "Rocket",
];

const METHOD_META: Record<
  MethodKey,
  { image: StaticImageData; label: string; color: string; glow: string }
> = {
  Bkash: {
    image: Bkash,
    label: "BKASH VIP",
    color: "#E2136E",
    glow: "rgba(226,19,110,0.35)",
  },
  Nagad: {
    image: Nagad,
    label: "NAGAD VIP",
    color: "#F7941D",
    glow: "rgba(247,148,29,0.35)",
  },
  Rocket: {
    image: Rocket,
    label: "ROCKET VIP",
    color: "#8B2FC9",
    glow: "rgba(139,47,201,0.35)",
  },
  BlockBee: {
    image: blockBeeImg,
    label: "Crypto (USDT)",
    color: "#F5A623",
    glow: "rgba(245,166,35,0.35)",
  },
  Binance: {
    image: BinanceImg,
    label: "Binance Payment",
    color: "#F7941D",
    glow: "rgba(247,148,29,0.35)",
  },
};

/* ════════════════════════════════════════════════════════════════
   currency config
   কাজ:
   ✅ usdt method হলে min 1
   ✅ bdt method হলে min 100
   ✅ icon / preset / placeholder dynamic
════════════════════════════════════════════════════════════════ */
const USDT_METHODS: MethodKey[] = ["BlockBee", "Binance"];
const MAX_AMOUNT = 25000;

const getCurrencyCode = (method: MethodKey | null) => {
  return method && USDT_METHODS.includes(method) ? "USDT" : "BDT";
};

const getMinAmount = (method: MethodKey | null) => {
  return method && USDT_METHODS.includes(method) ? 1 : 100;
};

const getAmountIcon = (method: MethodKey | null) => {
  return method && USDT_METHODS.includes(method) ? "USDT" : "৳";
};

const getPresetAmounts = (method: MethodKey | null) => {
  if (method && USDT_METHODS.includes(method)) {
    return [1, 5, 10, 20, 50, 100, 500, 1000];
  }

  return [100, 200, 500, 1000, 3000, 5000, 15000, 25000];
};

const clampAmountByMethod = (method: MethodKey | null, n: number) => {
  const min = getMinAmount(method);
  return Math.min(MAX_AMOUNT, Math.max(min, n));
};

const DepositMethodCard = ({
  active,
  onClick,
  image,
  title,
  color,
  glow,
}: {
  active: boolean;
  onClick: () => void;
  image: StaticImageData;
  title: string;
  color: string;
  glow: string;
}) => (
  <button
    onClick={onClick}
    className="relative w-full rounded-2xl p-3 text-left transition-all duration-200"
    style={{
      background: active
        ? "linear-gradient(135deg, rgba(67,11,88,0.95) 0%, rgba(34,7,54,0.98) 100%)"
        : "linear-gradient(145deg, rgba(255,255,255,0.20), rgba(5,83,190,0.25))",
      border: active
        ? `1.5px solid ${color}`
        : "1.5px solid rgba(255,255,255,0.08)",
      boxShadow: active
        ? `0 0 18px ${glow}, inset 0 1px 0 rgba(255,255,255,0.08)`
        : "none",
    }}
    type="button"
  >
    {active && (
      <span
        className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ background: color }}
      >
        ✓
      </span>
    )}

    <div className="flex flex-col items-center gap-2 pt-2">
      <Image src={image} alt={title} className="w-12" />
      <div className="text-xs font-extrabold tracking-wide" style={{ color }}>
        {title}
      </div>
    </div>
  </button>
);

/* ────────── Payment Channel Card ────────── */
/* কাজ:
   ✅ inline css বাদ দিয়ে pure TailwindCSS
   ✅ active হলে purple glass highlight
   ✅ inactive হলে dark glass button style
   ✅ payment channel title show করবে
*/
const ChannelCard = ({
  active,
  onClick,
  title,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  code?: string;
}) => (
  <button
    onClick={onClick}
    type="button"
    className={[
      "relative w-full rounded-xl px-3 py-2 text-center text-[.70rem] transition-all duration-150",
      active
        ? "border-[1.5px] border-purple-400/60 bg-gradient-to-br from-purple-400/25 to-purple-900/35 text-purple-100 shadow-[0_0_10px_rgba(150,50,255,0.2)]"
        : "border-[1.5px] border-white/10 bg-white/[0.05] text-white shadow-none",
    ].join(" ")}
  >
    {title}
  </button>
);

/* ────────── Amount Preset Chip ────────── */
/* কাজ:
   ✅ inline css বাদ দিয়ে pure TailwindCSS
   ✅ active হলে purple gradient highlight
   ✅ inactive হলে glass dark button style
   ✅ BDT / USDT currency format dynamic
*/
const AmountChip = ({
  value,
  active,
  onClick,
  currency,
}: {
  value: number;
  active: boolean;
  onClick: () => void;
  currency: "BDT" | "USDT";
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "rounded-xl py-2 text-center text-xs font-bold transition-all duration-150",
      active
        ? "border-[1.5px] border-purple-400/70 bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]"
        : "border-[1.5px] border-white/10 bg-white/[0.06] text-white shadow-none",
    ].join(" ")}
  >
    {currency === "USDT" ? `${value} USDT` : `৳${value.toLocaleString()}`}
  </button>
);

const NotFoundChannels = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
    <div
      className="flex h-28 w-28 items-center justify-center rounded-full text-5xl"
      style={{ background: "rgba(255,255,255,0.05)" }}
    >
      💳
    </div>
    <div className="mt-4 text-lg font-semibold text-white/70">
      No deposit methods available
    </div>
    <button className="mt-2 text-sm font-semibold text-purple-400 underline">
      Customer Support
    </button>
    <div className="mt-4 flex gap-3">
      <button
        className="rounded-2xl px-4 py-2 text-sm font-semibold text-purple-300"
        style={{ border: "1px solid rgba(147,51,234,0.5)" }}
        onClick={() => toast.success("Copied")}
        type="button"
      >
        Copy &amp; Report
      </button>
      <button
        className="rounded-2xl px-4 py-2 text-sm font-semibold text-purple-300"
        style={{ border: "1px solid rgba(147,51,234,0.5)" }}
        onClick={onRefresh}
        type="button"
      >
        Refresh
      </button>
    </div>
  </div>
);

const codeFromTitle = (title?: string) => {
  if (!title) return undefined;
  const m = title.match(/(\d{2})$/);
  if (!m) return undefined;
  return m[1];
};

const PANEL_STYLE = {
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(5,83,190,0.26) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const NOTICE_STYLE = {
  background: "rgba(255,100,100,0.08)",
  border: "1px solid rgba(255,80,80,0.2)",
};

export default function DepositPage() {
  const router = useRouter();

  /* ────────── account inactive check for deposit block ────────── */
  /* is_active=false হলে deposit বন্ধ, admin থেকে inactive করলে apply হয় */
  const { user } = useSelector((s: any) => s.auth) || { user: null };
  const isAccountInactive = user?.is_active === false;

  const [promoChoice, setPromoChoice] = useState<PromoChoice>("opt_in");
  const { data: promoRes } = useGetDepositPromoInfoQuery();
  const promo = promoRes?.data;

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetMyAgentPaymentMethodsQuery();
  const allMethods: AgentPaymentMethod[] = data?.data || [];

  useEffect(() => {
    if (!isError) return;
    const msg =
      (error as fetchBaseQueryError)?.data?.message ||
      (error as fetchBaseQueryError)?.data?.error ||
      "Failed to load deposit methods";
    toast.error(msg);
  }, [isError, error]);

  const grouped = useMemo(() => {
    const map: Partial<Record<MethodKey, AgentPaymentMethod[]>> = {};
    for (const pm of allMethods) {
      const key = pm.methodName as MethodKey;
      if (!key || !METHOD_META[key]) continue;
      if (!map[key]) map[key] = [];
      map[key]!.push(pm);
    }
    (Object.keys(map) as MethodKey[]).forEach((k) => {
      map[k] = (map[k] || []).slice().sort((a, b) => {
        const ad = a.isDefault ? 1 : 0;
        const bd = b.isDefault ? 1 : 0;
        if (bd !== ad) return bd - ad;
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });
    });
    return map;
  }, [allMethods]);

  const availableMethods = useMemo(() => {
    const dynamicMethods = (Object.keys(grouped) as MethodKey[]).filter(
      (k) =>
        !["BlockBee", "Binance"].includes(k) && (grouped[k]?.length || 0) > 0,
    );

    const methods = new Set<MethodKey>([
      "BlockBee",
      "Binance",
      ...dynamicMethods,
    ]);

    return METHOD_ORDER.filter((k) => methods.has(k));
  }, [grouped]);

  const [selectedMethod, setSelectedMethod] = useState<MethodKey | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null,
  );
  const [amountInput, setAmountInput] = useState<string>("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedMethod && availableMethods.length > 0) {
      setSelectedMethod(
        availableMethods.includes("BlockBee")
          ? "BlockBee"
          : availableMethods[0],
      );
    }
  }, [availableMethods, selectedMethod]);

  const channels = selectedMethod ? grouped[selectedMethod] || [] : [];

  useEffect(() => {
    if (selectedMethod === "BlockBee") {
      setSelectedChannelId("blockbee-default");
      return;
    }

    if (selectedMethod === "Binance") {
      setSelectedChannelId("binance-default");
      return;
    }

    if (!selectedChannelId && channels.length > 0) {
      const def = channels.find((c) => !!c.isDefault) || channels[0];
      setSelectedChannelId(def._id);
    }
  }, [channels, selectedChannelId, selectedMethod]);

  /* ════════════════════════════════════════════════════════════════
     dynamic amount config by method
  ════════════════════════════════════════════════════════════════ */
  const currencyCode = getCurrencyCode(selectedMethod);
  const minAmount = getMinAmount(selectedMethod);
  const amountIcon = getAmountIcon(selectedMethod);
  const presetAmounts = getPresetAmounts(selectedMethod);

  if (!isLoading && availableMethods.length === 0) {
    return <NotFoundChannels onRefresh={() => refetch()} />;
  }

  /* ════════════════════════════════════════════════════════════════
     account inactive block — deposit সম্পূর্ণ বন্ধ
     কাজ: admin inactive করলে deposit page এ এই screen দেখাবে
  ════════════════════════════════════════════════════════════════ */
  if (isAccountInactive) {
    return (
      <div className="min-h-screen lw-main-flow-bg flex flex-col">
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
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition hover:text-white"
            style={{ background: "rgba(255,255,255,0.07)" }}
            onClick={() => router.back()}
            type="button"
          >
            ← Back
          </button>
          <h1 className="text-base font-extrabold tracking-widest text-white uppercase">
            💎 Deposit
          </h1>
          <div className="w-16" />
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div
            className="w-full max-w-md rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.20), rgba(255,255,255,0.10))",
              border: "1px solid rgba(255,255,255,0.28)",
            }}
          >
            <div className="text-5xl">🔐</div>
            <h2 className="text-lg font-extrabold text-red-400 tracking-wide">
              Account Inactive
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Your account has been deactivated by admin. Deposits are not
              available while your account is inactive.
            </p>
            <p className="text-xs text-white/35 mt-1">
              Please contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const amountNumber = amountInput ? Number(amountInput) : NaN;
  const isValidAmount =
    Number.isFinite(amountNumber) &&
    amountNumber >= minAmount &&
    amountNumber <= MAX_AMOUNT;

  const canNext =
    !!selectedMethod &&
    isValidAmount &&
    (selectedMethod === "BlockBee" ||
      selectedMethod === "Binance" ||
      !!selectedChannelId);

  const setAmountFromPreset = (v: number) => {
    setSelectedPreset(v);
    setAmountInput(String(v));
  };

  const onAmountChange = (raw: string) => {
    setAmountInput(raw.replace(/[^\d]/g, ""));
    setSelectedPreset(null);
  };

  const onAmountBlur = () => {
    if (!amountInput) return;
    const n = Number(amountInput);
    if (!Number.isFinite(n)) {
      setAmountInput("");
      return;
    }
    if (n < minAmount || n > MAX_AMOUNT) {
      setAmountInput(String(clampAmountByMethod(selectedMethod, n)));
      toast.error(`Amount must be between ${minAmount} and ${MAX_AMOUNT}`);
    }
  };

  /* ════════════════════════════════════════════════════════════════
     deposit/page.tsx
     ✅ amount + promo flag payment route এ পাঠায়
     ✅ BDT / Binance / BlockBee — সব route consistent
  ════════════════════════════════════════════════════════════════ */
  const onNext = () => {
    if (!canNext) {
      toast.error(`Amount must be between ${minAmount} and ${MAX_AMOUNT}`);
      return;
    }

    if (!promoChoice && promo?.showPromo) {
      toast.error("Please choose a promotion option");
      return;
    }

    /* ────────── promo flag normalize ──────────
       opt_in  -> "1"
       opt_out -> "0"
    */
    const promoFlag = promoChoice === "opt_in" ? "1" : "0";

    /* ────────── BlockBee ──────────
       amount + promo দুইটাই যাবে
    */
    if (selectedMethod === "BlockBee") {
      router.push(
        `/deposit/blockbee?amount=${encodeURIComponent(amountInput)}&promo=${encodeURIComponent(promoFlag)}`,
      );
      return;
    }

    /* ────────── Binance ────────── */
    if (selectedMethod === "Binance") {
      router.push(
        `/deposit/binance-payment?amount=${encodeURIComponent(amountInput)}&promo=${encodeURIComponent(promoFlag)}`,
      );
      return;
    }

    /* ────────── BDT payment page ────────── */
    router.push(
      `/deposit/payment?amount=${encodeURIComponent(amountInput)}&channelId=${encodeURIComponent(selectedChannelId!)}&promo=${encodeURIComponent(promoFlag)}`,
    );
  };

  return (
    <div className="min-h-screen lw-main-flow-bg">
      <div className="mx-auto max-w-xl pb-10">
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
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white/70 transition hover:text-white"
            style={{ background: "rgba(255,255,255,0.07)" }}
            onClick={() => router.back()}
            type="button"
          >
            <FaAngleLeft className="text-xs" /> Back
          </button>
          <h1 className="text-base font-extrabold tracking-widest text-white uppercase">
            💎 Deposit
          </h1>
          <Link href="/deposit/deposit-record">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <Image src={RecIcon} alt="History" className="h-5 w-5" />
            </div>
          </Link>
        </div>

        <div className="space-y-3 px-3 pt-4">
          <div className="rounded-2xl p-4" style={PANEL_STYLE}>
            <div className="mb-3 flex items-center gap-2">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#ff9500" }}
              />
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                Deposit Method
              </span>
            </div>

            {isLoading ? (
              <div className="flex gap-3">
                <div
                  className="h-24 w-1/2 animate-pulse rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div
                  className="h-24 w-1/2 animate-pulse rounded-2xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableMethods.map((k) => (
                  <DepositMethodCard
                    key={k}
                    image={METHOD_META[k].image}
                    title={METHOD_META[k].label}
                    color={METHOD_META[k].color}
                    glow={METHOD_META[k].glow}
                    active={selectedMethod === k}
                    onClick={() => {
                      setSelectedMethod(k);
                      setSelectedChannelId(null);
                      setAmountInput("");
                      setSelectedPreset(null);
                    }}
                  />
                ))}
              </div>
            )}

            <div
              className="mt-3 rounded-xl p-3 text-[11px] leading-5"
              style={NOTICE_STYLE}
            >
              <span className="font-bold" style={{ color: "#ffaaaa" }}>
                ⚠️ NOTE:
              </span>
              <span style={{ color: "#ffaaaa" }}>
                {" "}
                Please submit your Trx-ID after making a deposit. Your balance
                will be updated quickly.
              </span>
            </div>
          </div>

          {selectedMethod !== "BlockBee" && selectedMethod !== "Binance" && (
            <div className="rounded-2xl p-4" style={PANEL_STYLE}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                  Payment Channels
                </span>
                {isFetching && (
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-white/30">
                    <Loader2 className="h-3 w-3 animate-spin" /> loading
                  </span>
                )}
              </div>

              {channels.length === 0 ? (
                <NotFoundChannels onRefresh={() => refetch()} />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {channels.map((pm) => (
                      <ChannelCard
                        key={pm._id}
                        active={selectedChannelId === pm._id}
                        onClick={() => setSelectedChannelId(pm._id)}
                        title={pm.title || METHOD_META[selectedMethod!].label}
                        code={codeFromTitle(pm.title)}
                      />
                    ))}
                  </div>

                  <div
                    className="mt-3 rounded-xl p-3 text-[11px] leading-5"
                    style={NOTICE_STYLE}
                  >
                    <span className="font-bold" style={{ color: "#ffaaaa" }}>
                      !
                    </span>
                    <span style={{ color: "#ffaaaa" }}>
                      {" "}
                      Beware of scammers pretending to be from Telegram or
                      Facebook! All official deposits happen only through this
                      platform. ⚠️
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {(selectedMethod === "BlockBee" ||
            selectedMethod === "Binance" ||
            channels.length > 0) && (
            <div className="rounded-2xl p-4" style={PANEL_STYLE}>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-white">
                  Deposit Amount
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {presetAmounts.map((v) => (
                  <AmountChip
                    key={v}
                    value={v}
                    currency={currencyCode}
                    active={selectedPreset === v}
                    onClick={() => setAmountFromPreset(v)}
                  />
                ))}
              </div>

              <div
                className="mt-3 flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border:
                    amountInput.length === 0
                      ? "1.5px solid rgba(255,255,255,0.08)"
                      : isValidAmount
                        ? "1.5px solid rgba(80,200,120,0.6)"
                        : "1.5px solid rgba(255,80,80,0.6)",
                  boxShadow:
                    amountInput.length > 0 && isValidAmount
                      ? "0 0 10px rgba(80,200,120,0.1)"
                      : undefined,
                }}
              >
                <span className="min-w-[42px] text-sm font-extrabold text-white/80">
                  {amountIcon}
                </span>

                <input
                  className="w-full bg-transparent text-sm font-extrabold text-white outline-none placeholder:text-white/25"
                  placeholder={
                    currencyCode === "USDT"
                      ? `${minAmount} - ${MAX_AMOUNT} USDT`
                      : `৳${minAmount.toLocaleString()} - ৳${MAX_AMOUNT.toLocaleString()}`
                  }
                  value={amountInput}
                  onChange={(e) => onAmountChange(e.target.value)}
                  onBlur={onAmountBlur}
                  inputMode="numeric"
                />
              </div>

              <div className="mt-2 text-[11px] text-white/35">
                Minimum Deposit:{" "}
                <span className="font-semibold text-white/70">
                  {currencyCode === "USDT"
                    ? `${minAmount} USDT`
                    : `৳${minAmount.toLocaleString()}`}
                </span>
              </div>

              {promo?.showPromo && (
                <PromotionConsent
                  value={promoChoice}
                  onChange={setPromoChoice}
                  tiers={promo?.tiers || []}
                  nextBonusDepositNumber={promo?.nextBonusDepositNumber}
                  nextBonusPercent={promo?.nextBonusPercent}
                  nextBonusMaxAmount={promo?.nextBonusMaxAmount}
                  turnoverMultiplier={promo?.turnoverMultiplier}
                  amount={amountNumber}
                />
              )}

              <div className="mt-2 text-[11px] text-white/30">
                Deposit Info: 24/24
              </div>

              <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                className="mt-5 w-full rounded-xl py-3.5 text-sm font-extrabold uppercase tracking-widest transition-all duration-200"
                style={{
                  background: canNext
                    ? "linear-gradient(135deg, #9333ea, #7c3aed)"
                    : "rgba(255,255,255,0.06)",
                  color: canNext ? "#fff" : "rgba(255,255,255,0.3)",
                  boxShadow: canNext
                    ? "0 4px 20px rgba(147,51,234,0.5)"
                    : "none",
                  border: canNext ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {canNext ? "Next →" : "Select channel & amount"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
