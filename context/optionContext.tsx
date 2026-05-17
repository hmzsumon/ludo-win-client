// context/optionContext.tsx
"use client";

import { EOptionsGame, ESounds, INITIAL_OPTIONS_GAME } from "@/utils/constants";
import { getValueFromCache, savePropierties } from "@/utils/storage";
import { Howl } from "howler";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  IEOptionsGame,
  IESounds,
  IOptionsContext,
  IOptionsGame,
} from "../interfaces";

let ambientInstance: Howl | null = null;
let fxInstance: Howl | null = null;

function getAmbient(enabled: boolean) {
  if (!ambientInstance) {
    ambientInstance = new Howl({
      src: ["/ludo/sounds/background.mp3"],
      autoplay: enabled,
      loop: true,
      volume: 0.5,
    });
  }
  return ambientInstance;
}

function getFX() {
  if (!fxInstance) {
    fxInstance = new Howl({
      src: ["/ludo/sounds/soundsSource.mp3"],
      sprite: {
        CLICK: [0, 180],
        ROLL_DICE: [180, 1000],
        TOKEN_MOVE: [1100, 200],
        SAFE_ZONE: [1200, 360],
        TOKEN_JAIL: [1600, 450],
        GET_SIX: [2000, 600],
        CHAT: [2500, 500],
        USER_ONLINE: [2900, 690],
        USER_OFFLINE: [3500, 240],
        GAMER_OVER: [3900, 6000],
      },
    });
  }
  return fxInstance;
}

const OptionsContext = createContext<IOptionsContext | undefined>(undefined);

export const OptionProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [optionsGame, setOptionsGame] = useState<IOptionsGame>(() =>
    getValueFromCache("options", INITIAL_OPTIONS_GAME),
  );

  // MUSIC টগল করলে ambient play/stop
  const toogleOptions = (type: IEOptionsGame) => {
    const next = { ...optionsGame, [type]: !optionsGame[type] };
    setOptionsGame(next);
    if (type === EOptionsGame.MUSIC) {
      const ambient = getAmbient(next.MUSIC);
      next.MUSIC ? ambient.play() : ambient.stop();
    }
    savePropierties("options", next);
  };

  const playSound = useCallback(
    (type: IESounds) => {
      if (optionsGame.SOUND) getFX().play(type);
    },
    [optionsGame.SOUND],
  );

  useEffect(() => {
    // মাউন্টে মিউজিক স্টেট অনুযায়ী ambient sync
    const ambient = getAmbient(optionsGame.MUSIC);
    if (optionsGame.MUSIC) ambient.play();
    else ambient.stop();

    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t && ["a", "button", "input"].includes(t.tagName.toLowerCase())) {
        playSound(ESounds.CLICK);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [optionsGame.MUSIC, playSound]);

  return (
    <OptionsContext.Provider value={{ optionsGame, toogleOptions, playSound }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptionsContext = (): IOptionsContext => {
  const ctx = useContext(OptionsContext);
  if (!ctx)
    throw new Error("useOptionsContext must be used within a OptionProvider");
  return ctx;
};
