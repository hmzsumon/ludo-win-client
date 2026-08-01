"use client";

import BackButton from "@/components/ludo/backButton";
import Icon from "@/components/ludo/icon";
import Logo from "@/components/ludo/logo";
import ProfilePicture from "@/components/ludo/profilePicture";
import SelectTokenColor from "@/components/ludo/selectTokenColor";
import PageWrapper from "@/components/wrapper/page";
import type {
  IDataPlayWithFriends,
  ILudoFriendRoomPreview,
  TColors,
  TGameMode,
} from "@/interfaces";
import {
  useCreateLudoFriendRoomMutation,
  useJoinLudoFriendRoomMutation,
  useLazyPreviewLudoFriendRoomQuery,
} from "@/redux/features/ludoWager/ludoWagerApi";
import { useGetWalletQuery } from "@/redux/features/wallet/walletApi";
import { EColors, ROOM_RANGE, TYPES_ONLINE_GAMEPLAY } from "@/utils/constants";
import { getValueFromCache, savePropierties } from "@/utils/storage";
import { useEffect, useMemo, useState } from "react";
import swal from "sweetalert";
import WagerAmountPicker, {
  getWagerAmountValidationMessage,
  isAllowedWagerAmount,
} from "../wagerAmountPicker";

interface PlayWithFriendsProps {
  handlePlayWithFriends: (data: IDataPlayWithFriends) => void;
  initialRoomCode?: string;
  gameMode?: TGameMode;
  freeEnabled?: boolean;
  wagerEnabled?: boolean;
}

const getErrorMessage = (error: any) =>
  error?.data?.message || error?.message || "Unable to prepare friend match";

const toSocketData = (
  room: ILudoFriendRoomPreview,
  type:
    | typeof TYPES_ONLINE_GAMEPLAY.CREATE_ROOM
    | typeof TYPES_ONLINE_GAMEPLAY.JOIN_ROOM,
): IDataPlayWithFriends => ({
  type,
  roomName: room.roomCode,
  totalPlayers: 2,
  initialColor: room.initialColor,
  friendMatchType: room.matchType,
  gameMode: room.gameMode,
  betAmount: room.matchType === "wager" ? room.betAmount : undefined,
  reservationId: room.reservationId,
});

const PlayWithFriends = ({
  handlePlayWithFriends,
  initialRoomCode = "",
  gameMode = "CLASSIC",
  freeEnabled = true,
  wagerEnabled = true,
}: PlayWithFriendsProps) => {
  const [matchType, setMatchType] = useState<"free" | "wager">(
    freeEnabled ? "free" : "wager",
  );
  /* NEW ▸ Keep raw text so manual entry can be empty while the user is typing. */
  const [betAmountInput, setBetAmountInput] = useState("50");
  const [roomNumber, setRoomNumber] = useState(initialRoomCode);
  const [preview, setPreview] = useState<ILudoFriendRoomPreview | null>(null);
  const [initialColor, setInitialColor] = useState<TColors>(
    () => getValueFromCache("colorNewRoom", EColors.RED) as TColors,
  );

  const [createRoom, { isLoading: isCreating }] =
    useCreateLudoFriendRoomMutation();
  const [previewRoom, { isFetching: isPreviewing }] =
    useLazyPreviewLudoFriendRoomQuery();
  const [joinRoom, { isLoading: isJoining }] = useJoinLudoFriendRoomMutation();
  const { data: walletData } = useGetWalletQuery();

  /* NEW ▸ Friends Wager uses the exact Quick Match validation and balance rule. */
  const walletBalance = useMemo(
    () => Number(walletData?.balance || 0),
    [walletData],
  );
  const betAmount = useMemo(
    () => Number(betAmountInput || 0),
    [betAmountInput],
  );
  const wagerValidationMessage = useMemo(
    () => getWagerAmountValidationMessage(betAmountInput),
    [betAmountInput],
  );
  const isWagerAmountReady =
    wagerValidationMessage === "" &&
    isAllowedWagerAmount(betAmount) &&
    walletBalance >= betAmount;

  const inspectRoom = async (code: string) => {
    try {
      const response = await previewRoom(code).unwrap();
      setPreview(response.room);
      return response.room;
    } catch (error) {
      setPreview(null);
      await swal({
        title: "Room unavailable",
        text: getErrorMessage(error),
        icon: "error",
      });
      return null;
    }
  };

  /* NEW ▸ Shared URL opens a price/type preview; it never auto-debits balance. */
  useEffect(() => {
    if (initialRoomCode.length === ROOM_RANGE)
      void inspectRoom(initialRoomCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRoomCode]);

  /* NEW ▸ Keep the selected tab on an Admin-enabled Friends type. */
  useEffect(() => {
    if (matchType === "free" && !freeEnabled && wagerEnabled) {
      setMatchType("wager");
    }
    if (matchType === "wager" && !wagerEnabled && freeEnabled) {
      setMatchType("free");
    }
  }, [freeEnabled, matchType, wagerEnabled]);

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (roomNumber.length !== ROOM_RANGE) return;

    const selectedRoom =
      preview?.roomCode === roomNumber
        ? preview
        : await inspectRoom(roomNumber);
    if (!selectedRoom) return;

    if (selectedRoom.matchType === "wager") {
      const confirmed = await swal({
        title: "Join wager match?",
        text: `${selectedRoom.betAmount} will be reserved. Winner receives the pot after the game fee.`,
        icon: "warning",
        buttons: ["Cancel", "Reserve & Join"],
      });
      if (!confirmed) return;
    }

    try {
      const response = await joinRoom({
        roomCode: selectedRoom.roomCode,
      }).unwrap();
      handlePlayWithFriends(
        toSocketData(response.room, TYPES_ONLINE_GAMEPLAY.JOIN_ROOM),
      );
    } catch (error) {
      await swal({
        title: "Unable to join",
        text: getErrorMessage(error),
        icon: "error",
      });
    }
  };

  const handleCreate = async () => {
    /* NEW ▸ Paid Friends now uses the same authoritative Classic/Master engine. */
    const resolvedMode = gameMode;
    if (matchType === "wager") {
      if (!isAllowedWagerAmount(betAmount)) {
        await swal({
          title: "Invalid amount",
          text: getWagerAmountValidationMessage(betAmountInput),
          icon: "error",
        });
        return;
      }

      if (walletBalance < betAmount) {
        await swal({
          title: "Insufficient balance",
          text: "Your wallet balance is lower than the wager amount.",
          icon: "error",
        });
        return;
      }

      const confirmed = await swal({
        title: "Create wager room?",
        text: `${betAmount} will be reserved until a friend joins or the room is cancelled.`,
        icon: "warning",
        buttons: ["Cancel", "Reserve & Create"],
      });
      if (!confirmed) return;
    }

    try {
      const response = await createRoom({
        matchType,
        totalPlayers: 2,
        gameMode: resolvedMode,
        initialColor,
        betAmount: matchType === "wager" ? betAmount : undefined,
      }).unwrap();
      handlePlayWithFriends(
        toSocketData(response.room, TYPES_ONLINE_GAMEPLAY.CREATE_ROOM),
      );
    } catch (error) {
      await swal({
        title: "Unable to create room",
        text: getErrorMessage(error),
        icon: "error",
      });
    }
  };

  const busy = isCreating || isJoining || isPreviewing;
  const createDisabled = busy || (matchType === "wager" && !isWagerAmountReady);

  return (
    <PageWrapper leftOption={<BackButton />} rightOption={<ProfilePicture />}>
      <div className="page-with-friends-scroll">
        <Logo />

        <div className="page-with-friends-section">
          <h2>Play With Friends</h2>
          <div
            className="page-with-friends-new-room glass-effect"
            style={{ padding: 15 }}
          >
            {/* NEW ▸ Free and Wager are visibly separate before room creation. */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 14,
              }}
            >
              {(["free", "wager"] as const)
                .filter((value) =>
                  value === "free" ? freeEnabled : wagerEnabled,
                )
                .map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={`button ${matchType === value ? "yellow" : "blue"}`}
                    onClick={() => setMatchType(value)}
                    style={{
                      padding: 10,
                      textTransform: "uppercase",
                      fontWeight: 800,
                    }}
                  >
                    {value === "free" ? "Free" : "Wager"}
                  </button>
                ))}
            </div>

            <p
              style={{
                color: "white",
                textAlign: "center",
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              2 players ·{" "}
              {matchType === "wager"
                ? `${gameMode} · Server verified`
                : `${gameMode} · No stake`}
            </p>

            {matchType === "wager" && (
              <div className="mb-4 w-full">
                {/* NEW ▸ Presets, visible manual input and rules match Quick Wager. */}
                <WagerAmountPicker
                  amountInput={betAmountInput}
                  onAmountInputChange={setBetAmountInput}
                  walletBalance={walletBalance}
                  inputId="friends-wager-amount"
                  showHeader={false}
                />
              </div>
            )}

            <div className="page-with-friends-new-config">
              <SelectTokenColor
                disabled={false}
                color={initialColor}
                handleColor={(color) => {
                  setInitialColor(color);
                  savePropierties("colorNewRoom", color);
                }}
              />
              <button
                type="button"
                disabled={createDisabled}
                className="button yellow page-with-friends-create"
                onClick={handleCreate}
              >
                <Icon type="play" fill="#8b5f00" />
                <span>{isCreating ? "Creating..." : "New room"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="page-with-friends-section">
          <h2>Join a room</h2>
          <form
            onSubmit={handleJoin}
            className="page-with-friends-form glass-effect"
          >
            <input
              className="page-with-friends-code"
              type="tel"
              inputMode="numeric"
              maxLength={ROOM_RANGE}
              placeholder="5-digit code"
              required
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, ROOM_RANGE);
                setRoomNumber(value);
                setPreview(null);
              }}
              value={roomNumber}
            />
            <button
              disabled={busy || roomNumber.length !== ROOM_RANGE}
              /*
               * FIX ▸ Tailwind-only: JOIN button now fills the input row height.
               * Existing global CSS remains untouched.
               */
              className="button blue page-with-friends-join !inline-flex !min-h-[48px] !self-stretch !items-center !justify-center !rounded-l-none !rounded-r-[10px] !px-3 !text-lg !font-black"
              type="submit"
            >
              {isJoining ? "..." : "Join"}
            </button>
          </form>

          {preview && (
            <div
              className="glass-effect"
              style={{
                color: "white",
                marginTop: 10,
                padding: 10,
                textAlign: "center",
                width: "100%",
              }}
            >
              {preview.matchType === "wager"
                ? `Wager · ${preview.betAmount} per player · Classic`
                : `Free · ${preview.gameMode}`}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default PlayWithFriends;
