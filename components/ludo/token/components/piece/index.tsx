import { TColors } from "@/interfaces";
import { SIZE_TILE } from "@/utils/constants";
import React from "react";

interface PieceProps {
  color: TColors;
  style?: React.CSSProperties;
  index?: number;
  debug?: boolean;
}

const Piece = ({ color, style = {}, index = 0, debug = false }: PieceProps) => {
  const className = `game-token-piece ${color.toLowerCase()}`;

  return (
    <div
      className={className}
      style={{ width: SIZE_TILE, height: SIZE_TILE, ...style }}
    >
      {debug && (
        <span style={{ width: SIZE_TILE, height: SIZE_TILE }}>{index}</span>
      )}
    </div>
  );
};

export default React.memo(Piece);
