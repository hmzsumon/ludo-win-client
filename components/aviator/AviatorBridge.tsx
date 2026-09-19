"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import socketUrl from "@/config/socketUrl";
import { useLoadUserQuery } from "@/redux/features/auth/authApi";
import AviatorMenu from "./menu/AviatorMenu";
import { scheduleParticipantReveal } from "./participantReveal";
import { mergeRoundHistory, type CompletedRound } from "./roundHistory";
import AviatorHeader from "./sections/AviatorHeader";
import AviatorNoticeProvider from "./sections/AviatorNotice";
import BetPanel from "./sections/BetPanel";
import BetsTable from "./sections/BetsTable";
import FlightFrame from "./sections/FlightFrame";
import RoundHistory from "./sections/RoundHistory";
import {
  EMPTY_AVIATOR_GAME,
  type AviatorBet,
  type AviatorBetTab,
  type AviatorSnapshot,
} from "./types";

/* ────────── Socket access-token resolver ────────── */
const getSocketToken = () =>
  localStorage.getItem("accessToken") ||
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  undefined;

/* ────────────────────────────────────────────────────────────────
   ✈️ Aviator page orchestrator
   1) Ludo Win socket connection পরিচালনা করে
   2) Cocos iframe-এ live round data bridge করে
   3) আলাদা UI section component-এ প্রয়োজনীয় state পাঠায়
──────────────────────────────────────────────────────────────── */
export default function AviatorBridge() {
  const router = useRouter();
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<AviatorSnapshot>(EMPTY_AVIATOR_GAME);
  const [history, setHistory] = useState<CompletedRound[]>([]);
  const [historyStatus, setHistoryStatus] = useState("Loading round history…");
  const [tab, setTab] = useState<AviatorBetTab>("All Bets");
  const [previousBets, setPreviousBets] = useState<AviatorBet[]>([]);
  const [revealedBotCount, setRevealedBotCount] = useState(0);
  const { data, refetch } = useLoadUserQuery();
  const refreshWallet = useCallback(() => void refetch(), [refetch]);

  /* ────────── Parent page → Cocos game bridge ────────── */
  const sendToGame = useCallback(
    (type: string, payload: unknown) =>
      frameRef.current?.contentWindow?.postMessage(
        { source: "AVIATOR_NEXT", type, payload },
        window.location.origin,
      ),
    [],
  );

  /* ────────── Aviator live socket lifecycle ────────── */
  useEffect(() => {
    const client = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: { token: getSocketToken() },
    });
    setSocket(client);

    client.on("connect", () => client.emit("AVIATOR_JOIN"));
    client.on("AVIATOR_HISTORY", (payload) => {
      if (!payload?.success || !Array.isArray(payload.rounds)) {
        setHistoryStatus("History unavailable. Reconnect to retry.");
        return;
      }
      setHistory((current) => mergeRoundHistory(current, payload.rounds));
      setHistoryStatus("No completed rounds yet.");
    });
    client.on("AVIATOR_SNAPSHOT", (next: AviatorSnapshot) => {
      setGame((current) => {
        if (current.roundId && current.roundId !== next.roundId) {
          setPreviousBets(current.bets || []);
        }
        return next;
      });
      sendToGame("ROUND_STATE", {
        phase: next.phase,
        roundId: next.roundId,
        roundNumber: next.roundId,
        multiplier: next.multiplier,
        bettingEndsAt: next.startsAt,
      });
    });
    client.on("AVIATOR_TICK", (payload) => {
      setGame((current) => ({ ...current, multiplier: payload.multiplier }));
      sendToGame("ROUND_TICK", payload);
    });
    client.on("AVIATOR_CRASHED", (payload) => {
      setHistory((current) => mergeRoundHistory(current, [payload]));
      sendToGame("ROUND_CRASHED", {
        ...payload,
        roundNumber: payload.roundId,
      });
    });

    return () => {
      client.disconnect();
      setSocket(null);
    };
  }, [sendToGame]);

  /* ────────── Bot participant একে একে live counter-এ যোগ হয় ────────── */
  useEffect(() => {
    // Mid-flight join/reconnect shows the received roster immediately, without
    // starting a waiting animation. Only a new round resets the reveal count.
    setRevealedBotCount(
      game.phase === "WAITING" && Date.now() < game.startsAt
        ? 0
        : game.bets.filter((bet) => bet.isBot).length,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.roundId]);
  const botCount = useMemo(
    () => game.bets.filter((bet) => bet.isBot).length,
    [game.bets],
  );
  useEffect(() => {
    return scheduleParticipantReveal(
      game.phase,
      game.startsAt,
      revealedBotCount,
      botCount,
      () => setRevealedBotCount((count) => Math.min(botCount, count + 1)),
    );
  }, [botCount, revealedBotCount, game.phase, game.startsAt, game.roundId]);
  const liveDisplayBets = useMemo(() => {
    let visibleBots = 0;
    return game.bets.filter(
      (bet) => !bet.isBot || ++visibleBots <= revealedBotCount,
    );
  }, [game.bets, revealedBotCount]);
  useEffect(() => {
    sendToGame(
      "LIVE_BETS",
      liveDisplayBets.map((bet) => ({
        betId: bet.id,
        userId: bet.id,
        name: bet.player,
        stake: bet.amount,
        status: bet.status === "PLACED" ? "PENDING" : bet.status,
        cashoutMultiplier: bet.cashoutMultiplier || null,
        payout: bet.payout || null,
        avatarUrl: bet.avatarUrl || "/ludo/avatar/default.png",
      })),
    );
  }, [liveDisplayBets, sendToGame]);

  /* ────────── Selected bets table data ────────── */
  const visibleBets = useMemo(
    () =>
      tab === "Previous"
        ? previousBets
        : tab === "Top"
          ? [...liveDisplayBets].sort(
              (left, right) => right.payout - left.payout,
            )
          : liveDisplayBets,
    [liveDisplayBets, previousBets, tab],
  );
  const balance = Number(data?.user?.m_balance ?? data?.data?.m_balance ?? 0);
  const visibleHistory = history.map((round) => round.crashPoint);

  return (
    <main className="fixed inset-0 z-[2147483647] overflow-y-auto bg-[#090a0b] font-sans text-[#ddd] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
      <AviatorNoticeProvider>
        <div className="min-h-dvh w-full bg-[#0b0c0d]">
          <AviatorHeader
            balance={balance}
            menu={
              <AviatorMenu
                frameRef={frameRef}
                game={game}
                name={data?.user?.customerId || data?.user?.name || "Player"}
                avatar={data?.user?.avatar}
              />
            }
            onClose={() => router.push("/dashboard")}
          />
          <RoundHistory history={visibleHistory} emptyMessage={historyStatus} />
          <FlightFrame frameRef={frameRef} />
          <BetPanel
            slot={1}
            game={game}
            socket={socket}
            balance={balance}
            refresh={refreshWallet}
          />
          <BetPanel
            slot={2}
            game={game}
            socket={socket}
            balance={balance}
            refresh={refreshWallet}
          />
          <BetsTable rows={visibleBets} tab={tab} onTabChange={setTab} />
        </div>
      </AviatorNoticeProvider>
    </main>
  );
}
