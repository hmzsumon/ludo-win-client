import React, { useRef, useState } from "react";

import type { TColors } from "@/interfaces";

import useOnClickOutside from "@/hooks/useOnClickOutside";
import Piece from "../token/components/piece";
import TooltipColor from "./tooltip";

interface SelectColorProps {
  disabled: boolean;
  color: TColors;
  handleColor: (color: TColors) => void;
}

/**
 * Componente que permite la selección de color para un token...
 * @param param0
 * @returns
 */
const SelectColor = ({ disabled, color, handleColor }: SelectColorProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  /**
   * Cuando se hace click por fuera del tooltip, se indica que se cierre el Tooltip...
   */
  useOnClickOutside(tooltipRef, () => setShowTooltip(false));

  const handleSelectColor = (color: TColors) => {
    setShowTooltip(false);
    handleColor(color);
  };

  return (
    <div className="game-offline-token-wrapper">
      <button
        disabled={disabled}
        type="button"
        className="game-offline-token-color"
        onClick={() => setShowTooltip(true)}
      >
        <Piece color={color} />
      </button>
      {showTooltip && (
        <TooltipColor
          color={color}
          ref={tooltipRef}
          handleColor={handleSelectColor}
        />
      )}
    </div>
  );
};

export default React.memo(SelectColor);
