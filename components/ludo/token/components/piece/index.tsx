import { TColors } from "@/interfaces";
import { SIZE_TILE } from "@/utils/constants";
import React from "react";
import "./styles.css";

interface PieceProps {
  color: TColors;
  style?: React.CSSProperties;
  index?: number;
  debug?: boolean;
}

const tokenImages: Record<string, string> = {
  red: "/images/ludo/tokens/red-token.png",
  blue: "/images/ludo/tokens/blue-token.png",
  green: "/images/ludo/tokens/green-token.png",
  yellow: "/images/ludo/tokens/yellow-token.png",
};

const Piece = ({ color, style = {}, index = 0, debug = false }: PieceProps) => {
  const tokenColor = color.toLowerCase();
  const imageSrc = tokenImages[tokenColor];

  return (
    <div
      className={`game-token-piece ${tokenColor}`}
      style={{ width: SIZE_TILE, height: SIZE_TILE, ...style }}
    >
      <img
        src={imageSrc}
        alt={`${tokenColor} token`}
        className="game-token-piece-image"
        draggable={false}
      />

      {debug && (
        <span style={{ width: SIZE_TILE, height: SIZE_TILE }}>{index}</span>
      )}
    </div>
  );
};

export default React.memo(Piece);
