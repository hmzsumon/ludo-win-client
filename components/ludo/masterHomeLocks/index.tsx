import type { IListTokens, IPlayer, TGameMode } from "@/interfaces";
import { EGameMode, SIZE_TILE } from "@/utils/constants";
import { POSITION_ELEMENTS_BOARD } from "@/utils/positions-board";
import React from "react";

interface MasterHomeLocksProps {
  gameMode?: TGameMode;
  players: IPlayer[];
  listTokens: IListTokens[];
}

/* ════════════════════════════════════════════════════════════════
   Master Home Entry Block Sign
   কাজ:
   - Master mode শুরুতে প্রত্যেক active player-এর home lane entry বন্ধ থাকবে।
   - যে player opponent-এর token kill করবে, শুধু তার entry block sign উঠে যাবে।
   - এটা joint/double token sign না; এটা kill-required home-entry block sign।
   - Emoji/font এর উপর depend না করে SVG sign use করা হয়েছে, তাই সব browser/mobile-এ দেখা যাবে।
════════════════════════════════════════════════════════════════ */
const MasterHomeLocks = ({
  gameMode,
  players,
  listTokens,
}: MasterHomeLocksProps) => {
  if (gameMode !== EGameMode.MASTER) return null;

  return (
    <React.Fragment>
      {listTokens.map(({ index, positionGame }) => {
        const player = players[index];
        const hasKilledOpponent = Number(player?.killedTokensCount || 0) > 0;

        // ────────── player না থাকলে / finish হলে / kill করলে sign দেখাবে না ──────────
        if (!player || player.finished || hasKilledOpponent) return null;

        // ────────── home lane-এর entry cell-এ sign বসানো হবে ──────────
        const lockCoordinate =
          POSITION_ELEMENTS_BOARD[positionGame].exitTiles[0]?.coordinate;

        if (!lockCoordinate) return null;

        return (
          <div
            key={`master-home-entry-block-${index}`}
            className="pointer-events-none absolute z-[60] flex items-center justify-center"
            style={{
              left: lockCoordinate.x + SIZE_TILE / 2 - 14,
              top: lockCoordinate.y + SIZE_TILE / 2 - 14,
              width: 28,
              height: 28,
            }}
            title="Master mode: kill required before home entry"
          >
            {/* ────────── Ludo Star style blocked entry sign ────────── */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{
                filter:
                  "drop-shadow(0 2px 1px rgba(0,0,0,0.55)) drop-shadow(0 0 4px rgba(255,220,0,0.65))",
              }}
            >
              <rect
                x="2"
                y="2"
                width="24"
                height="24"
                rx="3"
                fill="rgba(255, 35, 35, 0.96)"
                stroke="#FFE66D"
                strokeWidth="2"
              />
              <circle
                cx="14"
                cy="14"
                r="8"
                fill="#FFEA3A"
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              <path
                d="M9 19L19 9"
                stroke="#E22626"
                strokeWidth="3.4"
                strokeLinecap="round"
              />
              <path
                d="M10 9H18"
                stroke="#E22626"
                strokeWidth="2.3"
                strokeLinecap="round"
                opacity="0.9"
              />
            </svg>
          </div>
        );
      })}
    </React.Fragment>
  );
};

export default React.memo(MasterHomeLocks);
