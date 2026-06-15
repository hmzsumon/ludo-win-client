"use client";

import { useUserContext } from "@/context/userContext";

import useGetRoomURL from "@/hooks/useGetRoomURL";
import { IDataSocket, TGameMode } from "@/interfaces";
import { TYPES_ONLINE_GAMEPLAY } from "@/utils/constants";
import { guid, randomNumber } from "@/utils/helpers";
import { useCallback, useState } from "react";
import { useSelector } from "react-redux";
import swal from "sweetalert";
import {
  Authenticate,
  BetAmount,
  Matchmaking,
  PlayWithFriends,
  TotalPlayers,
} from "./components";

interface OnlinePageProps {
  gameMode?: TGameMode;
}

const OnlinePage = ({ gameMode = "CLASSIC" }: OnlinePageProps) => {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const { user: reduxUser } = useSelector((state: any) => state.auth);
  const { user, authOptions = [] } = useUserContext();

  /* ────────── play with friends flag ────────── */
  const [playWithFriends, setPlayWithFriends] = useState(false);

  /* ────────── selected bet amount for quick match ────────── */
  const [selectedBetAmount, setSelectedBetAmount] = useState<number | null>(
    null,
  );

  /* ────────── socket payload state ────────── */
  const [dataSocket, setDataSocket] = useState<IDataSocket>({
    type: TYPES_ONLINE_GAMEPLAY.NONE,
    totalPlayers: 0,
    playAsGuest: false,
    roomName: "",
    gameMode,
    user: {
      id: user?.id || guid(),
      name: user?.name || `Player ${randomNumber(1000, 9999)}`,
      email: user?.email || "",
      avatar: reduxUser?.avatar || user?.avatar || user?.photo || "",
      photo: reduxUser?.avatar || user?.avatar || user?.photo || "",
    },
  });

  /* ────────── auto join room from url ────────── */
  useGetRoomURL(
    isAuthenticated,
    useCallback((data) => {
      setDataSocket((current) => ({ ...current, ...data }));
    }, []),
  );

  /* ════════════════════════════════════════════════════════════════
     account inactive block — online game সম্পূর্ণ বন্ধ
     কাজ: admin inactive করলে online game play করতে পারবে না
     offline game চলবে, শুধু online (wager) blocked
     সব hooks এর পরে রাখা হয়েছে — Rules of Hooks মেনে
     ════════════════════════════════════════════════════════════════ */
  const isAccountInactive = isAuthenticated && reduxUser?.is_active === false;

  /* ────────── inactive user কে online game থেকে block ────────── */
  if (isAccountInactive) {
    return (
      <div
        className="min-h-screen flex flex-col px-4"
        style={{ background: "#14041f" }}
      >
        {/* ────────── back button ────────── */}
        <div className="pt-4 pb-2">
          <button
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition hover:text-white"
            style={{ background: "rgba(255,255,255,0.07)" }}
            onClick={() => window.history.back()}
            type="button"
          >
            ← Back
          </button>
        </div>

        {/* ────────── inactive message ────────── */}
        <div className="flex-1 flex items-center justify-center">
          <div
            className="w-full max-w-sm rounded-2xl p-7 flex flex-col items-center gap-4 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(120,10,10,0.75), rgba(60,4,4,0.92))",
              border: "1px solid rgba(255,80,80,0.25)",
            }}
          >
            <div className="text-5xl">🚫</div>
            <h2 className="text-lg font-extrabold text-red-400 tracking-wide">
              Online Play Restricted
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Your account is currently inactive. Online wager games are not
              available. You can still play{" "}
              <span className="text-white/80 font-semibold">Offline</span> mode.
            </p>
            <p className="text-xs text-white/35">
              Contact support to reactivate your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ────────── auth gate ────────── */
  if (!isAuthenticated && !dataSocket.playAsGuest) {
    return (
      <Authenticate
        authOptions={authOptions}
        handlePlayGuest={() => {
          setDataSocket({ ...dataSocket, playAsGuest: true });
        }}
      />
    );
  }

  /* ────────── number of players step ────────── */
  if (dataSocket.totalPlayers === 0 && !playWithFriends) {
    return (
      <TotalPlayers
        playAsGuest={dataSocket.playAsGuest}
        handlePlayWithFriends={() => setPlayWithFriends(true)}
        handleTotalPlayers={(total) => {
          /* ────────── wager flow only for authenticated two-player quick match ────────── */
          if (total === 2) {
            if (!isAuthenticated) {
              swal({
                title: "Login required",
                text: "Wager match is available only for logged-in users",
                icon: "info",
              });
              return;
            }

            setDataSocket({
              ...dataSocket,
              type: TYPES_ONLINE_GAMEPLAY.JOIN_EXISTING_ROOM,
              totalPlayers: total,
            });
            return;
          }

          setDataSocket({
            ...dataSocket,
            type: TYPES_ONLINE_GAMEPLAY.JOIN_EXISTING_ROOM,
            totalPlayers: total,
          });
        }}
      />
    );
  }

  /* ────────── wager amount step for two-player quick match ────────── */
  if (
    dataSocket.totalPlayers === 2 &&
    !playWithFriends &&
    !dataSocket.roomName &&
    selectedBetAmount === null
  ) {
    return (
      <BetAmount
        onBack={() => {
          setSelectedBetAmount(null);
          setDataSocket((current) => ({
            ...current,
            totalPlayers: 0,
            betAmount: undefined,
            reservationId: undefined,
          }));
        }}
        onConfirm={(amount) => {
          setSelectedBetAmount(amount);
          setDataSocket((current) => ({
            ...current,
            type: TYPES_ONLINE_GAMEPLAY.JOIN_EXISTING_ROOM,
            totalPlayers: 2,
            betAmount: amount,
          }));
        }}
      />
    );
  }

  /* ────────── play with friends room step ────────── */
  if (playWithFriends && !dataSocket.roomName) {
    return (
      <PlayWithFriends
        handlePlayWithFriends={(data) =>
          setDataSocket({ ...dataSocket, ...data })
        }
      />
    );
  }

  /* ────────── matchmaking / game screen ────────── */
  return <Matchmaking dataSocket={dataSocket} />;
};

export default OnlinePage;
