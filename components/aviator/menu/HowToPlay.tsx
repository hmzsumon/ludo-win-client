import { Banknote, Plane, Wallet } from "lucide-react";

export const PLAY_STEPS = [
  { Icon: Banknote, text: "Place one or two bets while the next round is waiting to start." },
  { Icon: Plane, text: "Watch the multiplier rise. Your possible payout is your bet multiplied by the cashout multiplier." },
  { Icon: Wallet, text: "Cash out before the plane flies away to receive your payout. If it crashes first, you lose the bet." },
];

export default function HowToPlay({ showRules }: { showRules: () => void }) {
  return <><ol className="space-y-5 px-4 py-7">{PLAY_STEPS.map(({ Icon, text }, index) => <li key={text} className="flex items-start gap-3"><span className="pt-2 text-xl font-bold">0{index + 1}</span><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9003e] text-white"><Icon size={25} /></span><p className="text-sm leading-relaxed sm:text-base">{text}</p></li>)}</ol><button type="button" onClick={showRules} className="min-h-12 w-full bg-[#e89500] text-base hover:bg-[#de8b00]">Detailed rules</button></>;
}
