"use client";

import type { IPlayer } from "@/interfaces";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

type GameOverProps = {
  players: IPlayer[];
  currentUserId?: string;
  betAmount?: number;
  payoutAmount?: number;
  feeAmount?: number;
  winnerUserId?: string;
  onClose?: () => void;
};

const FALLBACK_AVATAR_1 = "/images/ludo/result/avatar-boy.png";
const FALLBACK_AVATAR_2 = "/images/ludo/result/avatar-girl.png";

function formatAmount(value: number) {
  const amount = Number(value || 0);

  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}M`;
  }

  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K`;
  }

  return `${amount}`;
}

function getPlayerAvatar(player?: IPlayer, fallback = FALLBACK_AVATAR_1) {
  return player?.avatar || player?.photo || fallback;
}

const GameOver = ({
  players = [],
  currentUserId = "",
  betAmount = 0,
  payoutAmount = 0,
  winnerUserId = "",
  onClose,
}: GameOverProps) => {
  const router = useRouter();

  const { winner, second, isCurrentUserWinner, winAmount, loseAmount } =
    useMemo(() => {
      const rankedPlayers = [...players]
        .filter((player) => Number(player.ranking) > 0)
        .sort((a, b) => Number(a.ranking) - Number(b.ranking));

      const fallbackSortedPlayers = [...players].sort(
        (a, b) => Number(a.ranking || 999) - Number(b.ranking || 999),
      );

      const finalPlayers =
        rankedPlayers.length > 0 ? rankedPlayers : fallbackSortedPlayers;

      const finalWinner =
        finalPlayers.find((player) => player.id === winnerUserId) ||
        finalPlayers[0];

      const finalSecond =
        finalPlayers.find((player) => player.id !== finalWinner?.id) ||
        finalPlayers[1];

      const userIsWinner =
        Boolean(currentUserId) &&
        String(finalWinner?.id) === String(currentUserId);

      const finalPayoutAmount =
        Number(payoutAmount || 0) > 0
          ? Number(payoutAmount)
          : Number(betAmount || 0) * 2;

      return {
        winner: finalWinner,
        second: finalSecond,
        isCurrentUserWinner: userIsWinner,
        winAmount: finalPayoutAmount,
        loseAmount: Number(betAmount || 0),
      };
    }, [players, winnerUserId, currentUserId, payoutAmount, betAmount]);

  const handleClose = () => {
    onClose?.();
    router.push("/dashboard");
  };

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-3">
      <div className="relative h-[525px] w-full max-w-[345px] overflow-hidden rounded-[14px] bg-[#071522] shadow-[0_20px_70px_rgba(0,0,0,0.75)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#143b35_0%,#071522_45%,#030816_100%)]" />
        <div className="absolute inset-0 bg-black/25" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute right-[17px] top-[20px] z-30 flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#148cff] text-[25px] font-black leading-none text-white shadow-[0_3px_0_#0754ad]"
        >
          ×
        </button>

        <div className="relative z-10 pt-[58px]">
          <div className="relative mx-auto h-[185px] w-[330px]">
            <Image
              src="/images/ludo/result/wing-left.png"
              alt=""
              width={160}
              height={130}
              className="absolute left-[32px] top-[30px] z-0 w-[80px] -rotate-[2deg] object-contain"
            />

            <Image
              src="/images/ludo/result/wing-right.png"
              alt=""
              width={160}
              height={130}
              className="absolute right-[30px] top-[30px] z-0 w-[80px] rotate-[2deg] object-contain"
            />

            <Image
              src="/images/ludo/result/crown.png"
              alt="Crown"
              width={210}
              height={150}
              priority
              className="absolute left-1/2 top-[-10px] z-10 w-[130px] -translate-x-1/2 object-contain drop-shadow-[0_0_18px_rgba(255,205,51,0.65)]"
            />

            {isCurrentUserWinner ? (
              <Image
                src="/images/ludo/result/you-win-ribbon.png"
                alt="You Win"
                width={360}
                height={120}
                priority
                className="absolute left-1/2 top-[83px] z-20 w-[310px] -translate-x-1/2 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.45)]"
              />
            ) : (
              <div className="absolute left-1/2 top-[92px] z-20 flex h-[58px] w-[260px] -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-[#ffb4b4] bg-gradient-to-b from-[#ff4545] to-[#9b0000] text-[31px] font-black uppercase tracking-wide text-white shadow-[0_8px_8px_rgba(0,0,0,0.45)]">
                You Lose
              </div>
            )}
          </div>

          <div className="mt-[4px] px-[22px]">
            <div className="relative h-[69px] w-full overflow-hidden rounded-[10px]">
              <Image
                src="/images/ludo/result/winner-card-bg.png"
                alt=""
                fill
                className="object-fill"
              />

              <div className="relative z-10 flex h-full items-center px-[12px]">
                <Image
                  src="/images/ludo/result/rank-1.png"
                  alt="Rank 1"
                  width={45}
                  height={45}
                  className="w-[43px] shrink-0 object-contain"
                />

                <div className="relative ml-[7px] h-[50px] w-[50px] shrink-0">
                  <Image
                    src={getPlayerAvatar(winner, FALLBACK_AVATAR_1)}
                    alt={winner.name || "Winner"}
                    fill
                    sizes="50px"
                    className="rounded-full object-cover"
                    unoptimized
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_AVATAR_1;
                    }}
                  />
                </div>

                <div className="ml-[8px] min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {winner.name || "Winner"}
                  </p>

                  <div className="mt-[4px] flex items-center gap-[6px]">
                    <div className="flex h-[21px] items-center rounded-full bg-[#e68b00]/70 px-[7px]">
                      <Image
                        src="/images/ludo/result/coin.png"
                        alt=""
                        width={16}
                        height={16}
                        className="mr-[3px] h-[15px] w-[15px] object-contain"
                      />
                      <span className="text-[12px] font-black text-white">
                        +{formatAmount(winAmount)}
                      </span>
                    </div>

                    <div className="flex h-[21px] items-center rounded-full bg-[#e68b00]/70 px-[7px]">
                      <Image
                        src="/images/ludo/result/trophy.png"
                        alt=""
                        width={16}
                        height={16}
                        className="mr-[3px] h-[15px] w-[15px] object-contain"
                      />
                      <span className="text-[12px] font-black text-white">
                        1
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {second ? (
              <div className="relative mt-[9px] h-[68px] w-full overflow-hidden rounded-[9px]">
                <Image
                  src="/images/ludo/result/second-card-bg.png"
                  alt=""
                  fill
                  className="object-fill"
                />

                <div className="relative z-10 flex h-full items-center px-[12px]">
                  <Image
                    src="/images/ludo/result/rank-2.png"
                    alt="Rank 2"
                    width={45}
                    height={45}
                    className="w-[43px] shrink-0 object-contain"
                  />

                  <div className="relative ml-[7px] h-[50px] w-[50px] shrink-0">
                    <Image
                      src={getPlayerAvatar(second, FALLBACK_AVATAR_2)}
                      alt={second.name || "Player"}
                      fill
                      sizes="50px"
                      className="rounded-full object-cover"
                      unoptimized
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_AVATAR_2;
                      }}
                    />
                  </div>

                  <div className="ml-[8px] min-w-0 flex-1">
                    <p className="truncate text-[13px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                      {second.name || "Player"}
                    </p>

                    <div className="mt-[4px] inline-flex h-[21px] items-center rounded-full bg-[#3f77ba]/70 px-[7px]">
                      <Image
                        src="/images/ludo/result/coin.png"
                        alt=""
                        width={16}
                        height={16}
                        className="mr-[3px] h-[15px] w-[15px] object-contain"
                      />
                      <span className="text-[12px] font-black text-white">
                        -{formatAmount(loseAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-[22px] flex h-[94px] items-center justify-center rounded-[12px] bg-[#180829]/45 px-5">
              <button
                type="button"
                onClick={handleClose}
                className="h-[44px] w-full rounded-full bg-gradient-to-b from-[#ffe66d] to-[#f39c12] text-[15px] font-black uppercase text-[#5a2200] shadow-[0_5px_0_#9b4b00]"
              >
                Back To Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GameOver);
