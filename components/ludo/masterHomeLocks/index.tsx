import type { IListTokens, IPlayer, TGameMode } from "@/interfaces";
import { EGameMode, SIZE_TILE } from "@/utils/constants";
import { POSITION_ELEMENTS_BOARD } from "@/utils/positions-board";
import React from "react";
import { MdBlockFlipped } from "react-icons/md";

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
   - react-icons দিয়ে red block sign দেখানো হচ্ছে, তাই clear দেখাবে।
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
            {/* ────────── Ludo Star style red block sign ────────── */}
            <MdBlockFlipped
              size={30}
              color="#ff0000"
              aria-hidden="true"
              style={{
                filter:
                  "drop-shadow(0 2px 1px rgba(0,0,0,0.65)) drop-shadow(0 0 4px rgba(255,255,255,0.9))",
              }}
            />
          </div>
        );
      })}
    </React.Fragment>
  );
};

export default React.memo(MasterHomeLocks);
