"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { BetTransport } from "../funEngine";

import type { AviatorSnapshot } from "../types";
import AutoControls from "./AutoControls";
import { useAviatorNotice } from "./AviatorNotice";

/* ────────────────────────────────────────────────────────────────
   🎮 Independent Aviator betting slip
   1) manual bet / cancel / cash-out state handle করে
   2) running round-এ next-round bet queue করে
   3) auto bet ও auto cash-out আলাদাভাবে পরিচালনা করে
──────────────────────────────────────────────────────────────── */
export default function BetPanel({
  slot,
  game,
  socket,
  balance,
  refresh,
}: {
  slot: 1 | 2;
  game: AviatorSnapshot;
  socket: BetTransport | null;
  balance: number;
  refresh: () => void;
}) {
  const notify = useAviatorNotice();
  const [amountInput, setAmountInput] = useState("");
  const [lastPreset, setLastPreset] = useState<number | null>(null);
  const appliedMinimum = useRef<number | null>(null);
  const [mode, setMode] = useState<"Bet" | "Auto">("Bet");
  const [autoAtInput, setAutoAtInput] = useState("1.10");
  const [autoBet, setAutoBet] = useState(false);
  const [autoCash, setAutoCash] = useState(false);
  const [betRound, setBetRound] = useState("");
  const [queued, setQueued] = useState(false);
  const [pending, setPending] = useState(false);
  const minimum = game.minBet;
  const amount = Number(amountInput) || minimum;
  const autoAt = Math.max(1.1, Number(autoAtInput) || 1.1);
  const hasBet = !!betRound && betRound === game.roundId;
  const canCash = hasBet && game.phase === "RUNNING";
  const canBet = !hasBet && game.phase === "WAITING";
  const canQueue = !hasBet && !queued && game.phase !== "WAITING";

  const amountLocked = pending || queued || hasBet;
  const ready = !!game.roundId && !!socket;
  useEffect(() => {
    if (!ready || amountLocked || appliedMinimum.current === minimum) return;
    const previousMinimum = appliedMinimum.current;
    setAmountInput(current => previousMinimum === null || !current || Number(current) === previousMinimum || Number(current) < minimum ? String(minimum) : current);
    setLastPreset(null);
    appliedMinimum.current = minimum;
  }, [ready, minimum, amountLocked]);
  const editAmount = (value: string) => {
    if (amountLocked || !ready) return;
    setLastPreset(null);
    setAmountInput(value);
  };
  const pickPreset = (value: number) => {
    if (amountLocked || !ready) return;
    setAmountInput(current => String(lastPreset === value ? Number(current) + value : value));
    setLastPreset(value);
  };

  /* ────────── Balance এবং admin bet-limit validation ────────── */
  const validateAmount = () => {
    if (!amountInput.trim() || !Number.isFinite(Number(amountInput))) {
      notify({ variant: "warning", title: "Enter a bet amount", message: "Please enter a valid amount." });
      return false;
    }
    if (amount < game.minBet || amount > game.maxBet) {
      notify({
        variant: "warning",
        title: "Bet amount is outside the limit",
        message: `Enter between ${game.minBet.toLocaleString()} and ${game.maxBet.toLocaleString()} BDT.`,
      });
      return false;
    }
    if (amount > balance) {
      notify({
        variant: "warning",
        title: "Insufficient balance",
        message: `Your balance is ${balance.toFixed(2)} BDT. Please lower the bet amount.`,
      });
      return false;
    }
    return true;
  };

  /* ────────── Round transition + automatic bet queue ────────── */
  useEffect(() => {
    if (game.phase === "WAITING" && game.roundId !== betRound) setBetRound("");
  }, [betRound, game.phase, game.roundId]);
  useEffect(() => {
    if (mode === "Auto" && autoBet && !hasBet && !queued && !pending)
      setQueued(true);
  }, [autoBet, hasBet, mode, pending, queued]);
  useEffect(() => {
    if (!queued || !ready || game.phase !== "WAITING" || !socket || pending || hasBet) return;
    if (!validateAmount()) {
      setQueued(false);
      setAutoBet(false);
      return;
    }
    setPending(true);
    socket.emit(
      "AVIATOR_BET",
      {
        slot,
        amount,
        autoCashoutAt: mode === "Auto" && autoCash ? autoAt : null,
      },
      (result: any) => {
        setPending(false);
        if (result?.success) {
          setBetRound(game.roundId);
          setQueued(false);
          refresh();
        } else {
          setQueued(false);
          setAutoBet(false);
          const insufficient = String(result?.message || "")
            .toLowerCase()
            .includes("balance");
          notify({
            variant: insufficient ? "error" : "warning",
            title: "Bet was not placed",
            message: insufficient
              ? "Insufficient balance. Please lower the bet amount."
              : result?.message || "Please try again",
          });
        }
      },
    );
  }, [
    amount,
    autoAt,
    autoCash,
    game.phase,
    game.roundId,
    mode,
    pending,
    queued,
    refresh,
    slot,
    socket,
  ]);

  const finish = (result: any, cash = false) => {
    setPending(false);
    if (result?.success) {
      if (cash) {
        setBetRound("");
        notify({
          variant: "success",
          title: "You have cashed out!",
          message: `${game.multiplier.toFixed(2)}x`,
          label: "Win BDT",
          value: Number(result.payout || 0).toFixed(2),
        });
      } else {
        notify({
          variant: "success",
          title: "Bet accepted",
          message: `${amount.toFixed(2)} BDT`,
        });
      }
      refresh();
    } else {
      const insufficient = String(result?.message || "")
        .toLowerCase()
        .includes("balance");
      notify({
        variant: insufficient ? "error" : "warning",
        title: "Request unsuccessful",
        message: insufficient
          ? "Insufficient balance. Please lower the bet amount."
          : result?.message || "Please try again",
      });
    }
  };

  /* ────────── Independent automatic cash-out ────────── */
  useEffect(() => {
    if (
      mode !== "Auto" ||
      !autoCash ||
      !canCash ||
      game.multiplier < autoAt ||
      !socket ||
      pending
    )
      return;
    setPending(true);
    socket.emit("AVIATOR_CASHOUT", { slot }, (result: any) =>
      finish(result, true),
    );
  }, [autoAt, autoCash, canCash, game.multiplier, mode, pending, slot, socket]);

  /* ────────── Main bet / cancel / cash-out action ────────── */
  const act = () => {
    if (!socket || pending || !ready) return;
    if (queued) {
      setQueued(false);
      setAutoBet(false);
      notify({
        variant: "warning",
        title: "Queued bet cancelled",
        message: "No balance was deducted",
      });
      return;
    }
    if (hasBet && game.phase === "WAITING") {
      setPending(true);
      socket.emit("AVIATOR_CANCEL_BET", { slot }, (result: any) => {
        setPending(false);
        if (result?.success) {
          setBetRound("");
          setAutoBet(false);
          refresh();
          notify({
            variant: "warning",
            title: "Bet cancelled",
            message: `${Number(result.refund || amount).toFixed(2)} BDT returned`,
          });
        } else
          notify({
            variant: "error",
            title: "Cancel failed",
            message: result?.message || "Bet can no longer be cancelled",
          });
      });
      return;
    }
    if (!canCash && !validateAmount()) return;
    setPending(true);
    if (canCash) {
      socket.emit("AVIATOR_CASHOUT", { slot }, (result: any) =>
        finish(result, true),
      );
      return;
    }
    if (canQueue) {
      setPending(false);
      setQueued(true);
      return;
    }
    socket.emit(
      "AVIATOR_BET",
      {
        slot,
        amount,
        autoCashoutAt: mode === "Auto" && autoCash ? autoAt : null,
      },
      (result: any) => {
        if (result?.success) setBetRound(game.roundId);
        finish(result);
      },
    );
  };

  return (
    <section className="mx-1.5 my-1 rounded-[17px] bg-[#1b1c1e] px-2 py-1.5 sm:mx-2 sm:rounded-[22px] sm:px-3">
      {/* ────────── Bet / Auto tabs ────────── */}
      <div className="mx-auto grid h-7 w-[72%] grid-cols-2 rounded-full bg-[#121315] sm:h-9">
        <button
          type="button"
          onClick={() => setMode("Bet")}
          className={`rounded-full text-[12px] sm:text-[13px] ${mode === "Bet" ? "bg-[#303136] text-white" : "text-[#aaa]"}`}
        >
          Bet
        </button>
        <button
          type="button"
          onClick={() => setMode("Auto")}
          className={`rounded-full text-[12px] sm:text-[13px] ${mode === "Auto" ? "bg-[#303136] text-white" : "text-[#aaa]"}`}
        >
          Auto
        </button>
      </div>

      {/* ────────── Amount controls + main action button ──────────
          plus/minus প্রতি click-এ 10 পরিবর্তন করে এবং quick amount
          একই quick amount আবার চাপলে যোগ হয়; অন্য amount চাপলে নতুন করে শুরু হয়। */}
      <div className="mt-1 grid grid-cols-[44%_56%] gap-1.5">
        <div>
          <div className="grid h-8 grid-cols-[32px_1fr_28px_24px] items-center gap-0.5 rounded-full bg-[#111214] px-0.5">
            <button
              type="button"
              disabled={amountLocked || !ready}
              onClick={() => editAmount(String(Math.max(minimum, amount - 10)))}
              aria-label={`Decrease bet ${slot} amount by 10`}
              className="grid h-7 w-7 place-items-center rounded-full bg-[#303236] text-[#aaa] transition-colors hover:text-white"
            >
              <Minus size={15} strokeWidth={2.5} />
            </button>
            <input
              aria-label={`Bet ${slot} amount`}
              inputMode="decimal"
              value={amountInput}
              type="number"
              min={minimum}
              disabled={amountLocked || !ready}
              onChange={(event) => editAmount(event.target.value)}
              onBlur={() => { if (!amountLocked && ready) setAmountInput(String(Math.max(minimum, amount))); }}
              className="min-w-0 appearance-none border-0 bg-transparent p-0 text-center text-sm font-bold text-white outline-none ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              disabled={amountLocked || !ready}
              onClick={() => editAmount(String(amount + 10))}
              aria-label={`Increase bet ${slot} amount by 10`}
              className="grid h-7 w-7 place-items-center rounded-full bg-[#303236] text-[#aaa] transition-colors hover:text-white"
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              disabled={amountLocked || !ready}
              onClick={() => editAmount("")}
              aria-label={`Clear bet ${slot} amount`}
              className="grid h-5 w-5 place-items-center rounded-full bg-[#d91c35] text-white transition-colors hover:bg-[#f02441]"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
          <div className="mt-1 grid grid-cols-2 gap-1">
            {[100, 200, 500, 10000].map((value) => (
              <button
                key={value}
                type="button"
                disabled={amountLocked || !ready}
                onClick={() => pickPreset(value)}
                className="h-6 rounded-full bg-[#111214] text-[11px] text-[#aaa] sm:text-sm"
              >
                {value.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          disabled={
            !ready || pending ||
            (!canBet &&
              !canCash &&
              !canQueue &&
              !queued &&
              !(hasBet && game.phase === "WAITING"))
          }
          onClick={act}
          className={`h-[68px] self-center rounded-[16px] border border-[#8ffb7d] text-[18px] leading-tight text-white disabled:opacity-50 sm:h-[74px] sm:text-[20px] ${canCash || queued || (hasBet && game.phase === "WAITING") ? "bg-[#df0040]" : "bg-[#1daf09]"}`}
        >
          {!ready ? "Loading…" : canCash ? (
            <>
              Cash Out
              <br />
              <span className="text-[14px]">
                {(amount * game.multiplier).toFixed(2)} BDT
              </span>
            </>
          ) : queued ? (
            <>
              Cancel
              <br />
              <span className="text-[11px] font-semibold">
                Waiting for next round
              </span>
            </>
          ) : hasBet && game.phase === "WAITING" ? (
            "Cancel"
          ) : hasBet ? (
            "Waiting…"
          ) : (
            <>
              Bet
              <br />
              <span className="text-[14px]">{amount.toFixed(2)} BDT</span>
            </>
          )}
        </button>
      </div>
      {mode === "Auto" && (
        <AutoControls
          autoBet={autoBet}
          autoCash={autoCash}
          multiplierInput={autoAtInput}
          multiplier={autoAt}
          onAutoBetChange={(value) => {
            if (!value) setQueued(false);
            setAutoBet(value);
          }}
          onAutoCashChange={setAutoCash}
          onMultiplierInputChange={setAutoAtInput}
        />
      )}
    </section>
  );
}
