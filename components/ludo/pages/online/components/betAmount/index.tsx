"use client";

import { useMemo, useState } from "react";

import Logo from "@/components/branding/logo";
import LsButton from "@/components/ui/LsButton";
import PageWrapper from "@/components/wrapper/page";
import { useGetWalletQuery } from "@/redux/features/wallet/walletApi";
import { useSelector } from "react-redux";
import swal from "sweetalert";

const PRESET_AMOUNTS = [50, 100, 500, 1000];

/* ────────── preset button colors ────────── */
const PRESET_STYLES: Record<
  number,
  { start: string; mid: string; end: string }
> = {
  50: {
    start: "#7cf7ff",
    mid: "#28c7f7",
    end: "#1565d8",
  },
  100: {
    start: "#8cffb5",
    mid: "#2ed573",
    end: "#128a49",
  },
  500: {
    start: "#ffd36d",
    mid: "#ff9f43",
    end: "#d35400",
  },
  1000: {
    start: "#ff9cf3",
    mid: "#e056fd",
    end: "#8e44ad",
  },
};

interface BetAmountProps {
  onBack: () => void;
  onConfirm: (amount: number) => void;
}

/* ────────── amount validation helper ────────── */
const isAllowedAmount = (amount: number) => {
  if (!Number.isInteger(amount) || amount < 50) return false;

  /* ────────── 50 to 1000 must be divisible by 50 ────────── */
  if (amount <= 1000) {
    return amount % 50 === 0;
  }

  /* ────────── 1001 to 100000 must be divisible by 100 ────────── */
  if (amount <= 100000) {
    return amount % 100 === 0;
  }

  /* ────────── above 100000 must be divisible by 1000 ────────── */
  return amount % 1000 === 0;
};

/* ────────── validation message helper ────────── */
const getAmountValidationMessage = (rawValue: string) => {
  const trimmedValue = rawValue.trim();

  /* ────────── empty input means no warning ────────── */
  if (!trimmedValue) {
    return "Enter an amount.";
  }

  const amount = Number(trimmedValue);

  /* ────────── invalid number check ────────── */
  if (!Number.isFinite(amount)) {
    return "Enter a valid number.";
  }

  /* ────────── whole number check ────────── */
  if (!Number.isInteger(amount)) {
    return "Only whole numbers are allowed.";
  }

  /* ────────── minimum amount check ────────── */
  if (amount < 50) {
    return "Minimum amount is 50.";
  }

  /* ────────── 50 to 1000 validation rule ────────── */
  if (amount <= 1000 && amount % 50 !== 0) {
    return "Use 50-step amounts up to 1000. Example: 50, 100, 150, 200.";
  }

  /* ────────── 1001 to 100000 validation rule ────────── */
  if (amount > 1000 && amount <= 100000 && amount % 100 !== 0) {
    return "Use 100-step amounts from 1100 to 100000. Example: 1100, 1200, 1300.";
  }

  /* ────────── above 100000 validation rule ────────── */
  if (amount > 100000 && amount % 1000 !== 0) {
    return "Use 1000-step amounts above 100000. Example: 101000, 102000, 103000.";
  }

  return "";
};

const BetAmount = ({ onBack, onConfirm }: BetAmountProps) => {
  const { data } = useGetWalletQuery();
  const { user } = useSelector((state: any) => state.auth) || {};

  /* ────────── input value state ────────── */
  const [amountInput, setAmountInput] = useState<string>("50");

  /* ────────── derived wallet balance ────────── */
  const walletBalance = useMemo(() => Number(data?.balance || 0), [data, user]);

  /* ────────── selected preset detector ────────── */
  const selectedPresetAmount = useMemo(() => {
    const numericAmount = Number(amountInput || 0);
    return PRESET_AMOUNTS.includes(numericAmount) ? numericAmount : null;
  }, [amountInput]);

  /* ────────── parsed amount ────────── */
  const finalAmount = useMemo(() => {
    return Number(amountInput || 0);
  }, [amountInput]);

  /* ────────── validation message ────────── */
  const validationMessage = useMemo(() => {
    return getAmountValidationMessage(amountInput);
  }, [amountInput]);

  /* ────────── final validity state ────────── */
  const isFinalAmountValid = useMemo(() => {
    return validationMessage === "" && isAllowedAmount(finalAmount);
  }, [validationMessage, finalAmount]);

  /* ────────── button disabled state ────────── */
  const isConfirmDisabled = useMemo(() => {
    if (!isFinalAmountValid) return true;
    if (finalAmount <= 0) return true;
    if (walletBalance < finalAmount) return true;
    return false;
  }, [finalAmount, isFinalAmountValid, walletBalance]);

  /* ────────── confirm selected amount ────────── */
  const handleConfirm = () => {
    const normalizedAmount = Number(amountInput || 0);

    /* ────────── strict validity check before submit ────────── */
    if (!isAllowedAmount(normalizedAmount)) {
      swal({
        title: "Invalid amount",
        text: "Please enter an allowed wager amount.",
        icon: "error",
      });
      return;
    }

    /* ────────── wallet balance check ────────── */
    if (walletBalance < normalizedAmount) {
      swal({
        title: "Insufficient balance",
        text: "Your wallet balance is lower than the wager amount.",
        icon: "error",
      });
      return;
    }

    onConfirm(normalizedAmount);
  };

  return (
    <PageWrapper>
      {/* ────────── mobile safe screen wrapper ────────── */}
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-start overflow-y-auto pb-[max(24px,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
        <Logo />

        {/* ────────── main container ────────── */}
        <div className="mx-auto flex w-full max-w-[430px] flex-[0_0_auto] flex-col items-center gap-[18px] px-4 pb-5 pt-2">
          {/* ────────── heading card ────────── */}
          <div className="w-full rounded-[20px] border border-white/15 bg-gradient-to-b from-[#08214d]/70 to-[#061430]/50 px-4 py-3.5 text-center shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
            <h2 className="m-0 text-sm font-black uppercase leading-[1.1] tracking-[0.04em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.28)]">
              Choose Wager Amount
            </h2>

            <div className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-gradient-to-b from-white/15 to-white/10 px-4 py-2.5">
              <span className="text-[15px] font-bold text-[#dff7ff]">
                Available Balance:
              </span>
              <span className="text-lg font-black text-[#ffe36e] drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                {walletBalance}
              </span>
            </div>
          </div>

          {/* ────────── preset amount grid ────────── */}
          <div className="grid w-full grid-cols-2 gap-3.5">
            {PRESET_AMOUNTS.map((amount) => {
              const active = selectedPresetAmount === amount;
              const colors = PRESET_STYLES[amount];

              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    /* ────────── show selected preset inside input ────────── */
                    setAmountInput(String(amount));
                  }}
                  className={[
                    "relative w-full cursor-pointer rounded-[22px] border-none bg-transparent p-0 transition-all duration-200",
                    active
                      ? "-translate-y-0.5 scale-[1.02] "
                      : "shadow-[0_8px_18px_rgba(0,0,0,0.14)]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "absolute left-2 top-4 z-[2] transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  >
                    <div className="rounded-full bg-[#ffe066] px-2 py-2 text-[10px] font-black  shadow-[0_4px_10px_rgba(0,0,0,0.18)]">
                      ✔️
                    </div>
                  </div>

                  <LsButton
                    variant={
                      amount === 50
                        ? "logo-blue"
                        : amount === 100
                          ? "logo-green"
                          : amount === 500
                            ? "logo-orange"
                            : "logo-purple"
                    }
                    size="lg"
                    fullWidth
                  >
                    {amount}
                  </LsButton>
                </button>
              );
            })}
          </div>

          {/* ────────── smart custom amount input ────────── */}
          <div className="w-full">
            <div className="w-full rounded-[22px] border border-white/15 bg-gradient-to-b from-[#09224a]/70 to-[#040f23]/50 px-3.5 pb-3 pt-3.5 shadow-[0_12px_24px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <label
                htmlFor="custom-wager-amount"
                className="mb-2.5 block text-center text-xs font-extrabold text-white drop-shadow-[0_1px_6px_rgba(0,0,0,0.2)]"
              >
                Enter Amount
              </label>

              <div
                className={[
                  "flex items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                  validationMessage
                    ? "border border-red-400/70"
                    : "border border-yellow-300/50",
                ].join(" ")}
              >
                <span className="min-w-5 text-lg font-black text-[#ffe36e]">
                  💎
                </span>

                <input
                  id="custom-wager-amount"
                  type="number"
                  min={50}
                  step={1}
                  inputMode="numeric"
                  placeholder="Type amount"
                  value={amountInput}
                  onChange={(event) => setAmountInput(event.target.value)}
                  className="h-[52px] w-full border-none bg-transparent text-left text-lg font-bold text-white outline-none placeholder:text-white/35"
                />
              </div>

              {/* ────────── inline amount warning and suggestion ────────── */}
              {validationMessage ? (
                <p className="mb-0 mt-2.5 pl-1 text-left text-xs font-bold leading-[1.45] text-[#ffb3b3]">
                  {validationMessage}
                </p>
              ) : (
                <p className="mb-0 mt-2.5 pl-1 text-left text-xs font-bold leading-[1.45] text-[#9fffb0]">
                  Valid amount. You can continue.
                </p>
              )}

              <p className="mb-0 mt-2.5 text-center text-sm font-bold text-[#dff7ff]/90">
                Selected Amount:{" "}
                <span className="font-black text-[#ffe36e]">{finalAmount}</span>
              </p>

              {/* ────────── low balance helper ────────── */}
              {isFinalAmountValid && walletBalance < finalAmount && (
                <p className="mb-0 mt-2 text-center text-xs font-bold text-[#ffb3b3]">
                  Insufficient balance for this wager amount.
                </p>
              )}
            </div>
          </div>

          {/* ────────── action buttons ────────── */}
          <div className="mt-1 flex w-full items-center justify-center">
            <div
              className={[
                "w-full transition-all duration-200",
                isConfirmDisabled
                  ? "pointer-events-none opacity-65 grayscale-[0.35]"
                  : "pointer-events-auto opacity-100 grayscale-0",
              ].join(" ")}
            >
              <LsButton
                onClick={handleConfirm}
                variant="logo-blue"
                size="lg"
                fullWidth
                disabled={isConfirmDisabled}
              >
                Search Same Amount Player
              </LsButton>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default BetAmount;
