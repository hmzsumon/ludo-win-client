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
   Master Home Lock Signs
   কাজ:
   - Master mode শুরুতে প্রত্যেক player-এর home lane lock থাকবে।
   - যে player opponent-এর token kill করবে, শুধু তার lock sign উঠে যাবে।
   - এটা joint/double token icon না; এটা kill-required home-entry lock sign।
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

        if (!player || player.finished || hasKilledOpponent) return null;

        const lockCoordinate =
          POSITION_ELEMENTS_BOARD[positionGame].exitTiles[0]?.coordinate;

        if (!lockCoordinate) return null;

        return (
          <div
            key={`master-home-lock-${index}`}
            className="pointer-events-none absolute z-[28] flex items-center justify-center rounded-[4px] border-[2px] border-yellow-300 bg-red-600/95 text-[15px] font-black leading-none text-white shadow-[0_2px_0_rgba(0,0,0,0.45),0_0_8px_rgba(255,235,59,0.65)]"
            style={{
              left: lockCoordinate.x + SIZE_TILE / 2 - 11,
              top: lockCoordinate.y + SIZE_TILE / 2 - 11,
              width: 22,
              height: 22,
            }}
            title="Master mode: kill required before home entry"
          >
            ⛔
          </div>
        );
      })}
    </React.Fragment>
  );
};

export default React.memo(MasterHomeLocks);
