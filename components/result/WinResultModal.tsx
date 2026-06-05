"use client";

import Image from "next/image";

type ResultPlayer = {
  id: string;
  name: string;
  avatar: string;
  coinText: string;
  trophyText?: string;
  isWinner?: boolean;
};

type WinResultModalProps = {
  open: boolean;
  onClose: () => void;
  players?: ResultPlayer[];
};

const defaultPlayers: ResultPlayer[] = [
  {
    id: "1",
    name: "HM Zakaria",
    avatar: "/images/ludo/result/avatar-boy.png",
    coinText: "1.90K",
    trophyText: "3",
    isWinner: true,
  },
  {
    id: "2",
    name: "Rahat Ibni Sayeb",
    avatar: "/images/ludo/result/avatar-girl.png",
    coinText: "-1",
  },
];

export default function WinResultModal({
  open,
  onClose,
  players = defaultPlayers,
}: WinResultModalProps) {
  if (!open) return null;

  const winner = players[0];
  const second = players[1];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-3">
      <div className="relative h-[525px] w-full max-w-[345px] overflow-hidden rounded-[14px] bg-[#071522] shadow-[0_20px_70px_rgba(0,0,0,0.75)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#143b35_0%,#071522_45%,#030816_100%)]" />
        <div className="absolute inset-0 bg-black/25" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-[17px] top-[20px] z-30 flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#148cff] text-[25px] font-black leading-none text-white shadow-[0_3px_0_#0754ad]"
        >
          ×
        </button>

        <div className="relative z-10 pt-[58px]">
          {/* Crown + Wings */}
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

            <Image
              src="/images/ludo/result/you-win-ribbon.png"
              alt="You Win"
              width={360}
              height={120}
              priority
              className="absolute left-1/2 top-[83px] z-20 w-[310px] -translate-x-1/2 object-contain drop-shadow-[0_8px_8px_rgba(0,0,0,0.45)]"
            />
          </div>

          <div className="mt-[4px] px-[22px]">
            {/* Winner Row */}
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
                    src={winner.avatar}
                    alt={winner.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="ml-[8px] min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {winner.name}
                  </p>

                  <div className="mt-[4px] flex items-center gap-[6px]">
                    <div className="flex h-[21px] items-center rounded-full bg-[#e68b00]/70 px-[7px]">
                      <span className="mr-[3px] text-[14px]">🪙</span>
                      <span className="text-[12px] font-black text-white">
                        {winner.coinText}
                      </span>
                    </div>

                    {winner.trophyText ? (
                      <div className="flex h-[21px] items-center rounded-full bg-[#e68b00]/70 px-[7px]">
                        <span className="mr-[3px] text-[14px]">🏆</span>
                        <span className="text-[12px] font-black text-white">
                          {winner.trophyText}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row */}
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
                    src={second.avatar}
                    alt={second.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div className="ml-[8px] min-w-0 flex-1">
                  <p className="truncate text-[13px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                    {second.name}
                  </p>

                  <div className="mt-[4px] inline-flex h-[21px] items-center rounded-full bg-[#3f77ba]/70 px-[7px]">
                    <span className="mr-[3px] text-[14px]">🏆</span>
                    <span className="text-[12px] font-black text-white">
                      {second.coinText}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[22px] h-[94px] rounded-[12px] bg-[#180829]/45 opacity-45" />
          </div>
        </div>
      </div>
    </div>
  );
}
