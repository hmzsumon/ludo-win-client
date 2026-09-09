"use client";

import { useState, type RefObject } from "react";
import { AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import type { AviatorSnapshot } from "../types";
import type { MenuPage, PersonalBet } from "./types";
import { useAudioPreferences } from "./useAudioPreferences";
import AviatorDialog from "./AviatorDialog";
import MenuDrawer from "./MenuDrawer";
import MyBetHistory from "./MyBetHistory";
import GameLimits from "./GameLimits";
import HowToPlay from "./HowToPlay";
import GameRules from "./GameRules";

const titles: Record<MenuPage, string> = { menu: "Game menu", history: "My Bet History", limits: "Game Limits", how: "How To Play?", rules: "Game Rules" };

// One overlay at a time: the drawer hands off to independent content components.
export default function AviatorMenu({ frameRef, game, name, avatar, demoBets }: {
  frameRef: RefObject<HTMLIFrameElement>; game: AviatorSnapshot; name: string; avatar?: string; demoBets?: PersonalBet[];
}) {
  const [page, setPage] = useState<MenuPage | null>(null);
  const { preferences, toggle } = useAudioPreferences(frameRef);
  return <>
    <button type="button" aria-label="Open game menu" aria-expanded={page !== null} aria-haspopup="dialog" onClick={() => setPage("menu")} className="flex h-9 w-8 shrink-0 items-center justify-center rounded text-[#92959f] hover:bg-white/10"><Menu size={22} /></button>
    <AnimatePresence mode="wait">
      {page && <AviatorDialog key={page} title={titles[page]} drawer={page === "menu"} amber={page === "how"} onClose={() => setPage(null)}>
        {page === "menu" && <MenuDrawer name={name} avatar={avatar} preferences={preferences} toggle={toggle} navigate={setPage} />}
        {page === "history" && <MyBetHistory demoBets={demoBets} />}
        {page === "limits" && <GameLimits game={game} />}
        {page === "how" && <HowToPlay showRules={() => setPage("rules")} />}
        {page === "rules" && <GameRules />}
      </AviatorDialog>}
    </AnimatePresence>
  </>;
}
