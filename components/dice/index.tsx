"use client";
import { TDicevalues } from "@/interfaces";
import React from "react";

interface DiceProps {
  value: TDicevalues;
  size?: number;
  animate?: boolean;
}

const Dice = ({ value = 1, size = 30, animate = false }: DiceProps) => (
  <div
    style={{ width: size, height: size }}
    className={`game-dice dice-${value} ${animate ? "animate" : ""}`}
  />
);

export default React.memo(Dice);
