"use client";

import { useOptionsContext } from "@/context/optionContext";
import { ESounds } from "@/utils/constants";
import { useCallback } from "react";

const useClickSound = () => {
  const { playSound } = useOptionsContext();

  return useCallback(() => {
    playSound(ESounds.CLICK);
  }, [playSound]);
};

export default useClickSound;
