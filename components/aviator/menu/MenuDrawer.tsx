import { Banknote, CircleHelp, History, Music2, ScrollText, Volume2, UserRound } from "lucide-react";
import type { AudioPreferences, MenuPage } from "./types";

export default function MenuDrawer({ name, avatar, preferences, toggle, navigate }: {
  name: string; avatar?: string; preferences: AudioPreferences;
  toggle: (key: keyof AudioPreferences) => void; navigate: (page: MenuPage) => void;
}) {
  return <div>
    <div className="flex items-center gap-3 bg-[#2b2c30] px-4 pb-4">
      {avatar ? <img src={avatar} alt="" className="h-11 w-11 rounded-full object-cover" onError={event => { event.currentTarget.src = "/ludo/avatar/default.png"; }} /> : <UserRound className="h-11 w-11 rounded-full bg-black/20 p-2 text-[#aaa]" />}
      <span className="min-w-0 break-words text-lg font-bold">{name}</span>
    </div>
    {([{ key: "sound", label: "Sound", Icon: Volume2 }, { key: "music", label: "Music", Icon: Music2 }] as const).map(({ key, label, Icon }) =>
      <button key={key} type="button" role="switch" aria-label={label} aria-checked={preferences[key]} onClick={() => toggle(key)} className="flex min-h-[52px] w-full items-center gap-3 border-b border-white/10 px-4 text-left text-base hover:bg-white/5">
        <Icon size={21} className="text-[#81858f]" />{label}
        <span className={`relative ml-auto h-6 w-10 rounded-full transition-colors ${preferences[key] ? "bg-[#269b16]" : "bg-[#111214]"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-[#bbb] transition-transform ${preferences[key] ? "translate-x-5" : "translate-x-1"}`} /></span>
      </button>)}
    <div className="h-4 bg-[#2b2c30]" />
    {([{ page: "history", label: "My Bet History", Icon: History }, { page: "limits", label: "Game Limits", Icon: Banknote }, { page: "how", label: "How To Play", Icon: CircleHelp }, { page: "rules", label: "Game Rules", Icon: ScrollText }] as const).map(({ page, label, Icon }) =>
      <button key={page} type="button" onClick={() => navigate(page)} className="flex min-h-[52px] w-full items-center gap-3 border-b border-white/10 px-4 text-left text-base hover:bg-white/5"><Icon size={21} className="text-[#81858f]" />{label}</button>)}
    <div className="h-3 bg-[#2b2c30]" />
  </div>;
}
