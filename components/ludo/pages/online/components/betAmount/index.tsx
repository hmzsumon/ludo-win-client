"use client";

import { useEffect, useMemo, useState } from "react";

import Logo from "@/components/branding/logo";
import LsButton from "@/components/ui/LsButton";
import PageWrapper from "@/components/wrapper/page";
import { useGetWalletQuery } from "@/redux/features/wallet/walletApi";
import { getLudoReconnectCooldownRemaining } from "@/utils/ludoActiveGame";
import { useSelector } from "react-redux";
import swal from "sweetalert";
import WagerAmountPicker, {
  getWagerAmountValidationMessage,
  isAllowedWagerAmount,
} from "../wagerAmountPicker";

interface BetAmountProps {
  onBack: () => void;
  onConfirm: (amount: number) => void;
}

const BetAmount = ({ onBack, onConfirm }: BetAmountProps) => {
  const { data } = useGetWalletQuery();
  const { user } = useSelector((state: any) => state.auth) || {};

  const [amountInput, setAmountInput] = useState("50");
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);

  useEffect(() => {
    const updateCooldown = () => {
      setCooldownRemainingMs(getLudoReconnectCooldownRemaining());
    };

    updateCooldown();
    const interval = window.setInterval(updateCooldown, 1_000);

    return () => window.clearInterval(interval);
  }, []);

  const walletBalance = useMemo(() => Number(data?.balance || 0), [data, user]);
  const finalAmount = useMemo(() => Number(amountInput || 0), [amountInput]);
  const validationMessage = useMemo(
    () => getWagerAmountValidationMessage(amountInput),
    [amountInput],
  );
  const isFinalAmountValid =
    validationMessage === "" && isAllowedWagerAmount(finalAmount);
  const isConfirmDisabled =
    cooldownRemainingMs > 0 ||
    !isFinalAmountValid ||
    finalAmount <= 0 ||
    walletBalance < finalAmount;
  const cooldownRemainingSeconds = Math.max(
    1,
    Math.ceil(cooldownRemainingMs / 1000),
  );

  const handleConfirm = () => {
    const normalizedAmount = Number(amountInput || 0);

    if (cooldownRemainingMs > 0) {
      swal({
        title: "Match reconnect in progress",
        text: `Your previous game is still protected for reconnect. Please try again after ${cooldownRemainingSeconds} seconds.`,
        icon: "info",
      });
      return;
    }

    /* NEW ▸ Quick Match and Friends Wager use the same strict rule helper. */
    if (!isAllowedWagerAmount(normalizedAmount)) {
      swal({
        title: "Invalid amount",
        text: getWagerAmountValidationMessage(amountInput),
        icon: "error",
      });
      return;
    }

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
      <div className="flex min-h-[100dvh] w-full flex-col items-center justify-start overflow-y-auto pb-[max(24px,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
        <Logo />

        <div className="mx-auto flex w-full max-w-[430px] flex-[0_0_auto] flex-col items-center gap-[18px] px-4 pb-5 pt-2">
          {/* NEW ▸ The same reusable selector also powers Friends Wager. */}
          <WagerAmountPicker
            amountInput={amountInput}
            onAmountInputChange={setAmountInput}
            walletBalance={walletBalance}
            inputId="quick-wager-amount"
            cooldownRemainingMs={cooldownRemainingMs}
          />

          <div className="mt-1 flex w-full items-center justify-center gap-3">
            <div className="w-[34%]">
              <LsButton onClick={onBack} variant="logo-red" size="lg" fullWidth>
                Back
              </LsButton>
            </div>

            <div
              className={`w-[66%] transition-all duration-200 ${
                isConfirmDisabled
                  ? "pointer-events-none opacity-65 grayscale-[0.35]"
                  : "pointer-events-auto opacity-100 grayscale-0"
              }`}
            >
              <LsButton
                onClick={handleConfirm}
                variant="logo-blue"
                size="lg"
                fullWidth
                disabled={isConfirmDisabled}
              >
                {cooldownRemainingMs > 0
                  ? `Try Again in ${cooldownRemainingSeconds}s`
                  : "Search Player"}
              </LsButton>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default BetAmount;
