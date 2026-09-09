import { PLAY_STEPS } from "./HowToPlay";
import RuleIllustration from "./RuleIllustration";

const sections = [
  { title: "Bet & Cash Out", lines: ["Select an amount and press Bet before the round starts. Use the + and − buttons, a preset amount, or type an amount.", "The two bet panels work independently. You can place up to two bets per round.", "Cancel an accepted bet only while betting is open. The stake is returned to your balance.", "During flight, press Cash Out. Payout equals stake × the multiplier accepted by the game server. If the round crashes first, the bet is lost.", "Pressing Bet during flight queues a request for the next round. The request still needs server acceptance and enough balance."] },
  { title: "Auto Bet & Auto Cash Out", lines: ["Open the Auto tab in a bet panel. Auto bet requests another bet each round while enabled and while you have sufficient balance.", "Auto Cash Out sends a cashout request when the displayed multiplier reaches your selected value. It runs in your browser and requires an active connection; it is not guaranteed if the connection is interrupted or the round crashes before the server accepts it.", "Turn off automatic controls when you no longer want to use them. Closing the page stops browser automation, but does not cancel an accepted bet."] },
  { title: "Live Bets & History", lines: ["All Bets shows the current participants; Previous shows the previous round and Top sorts displayed bets by payout.", "Entries marked BOT are simulated display participants and do not affect your wallet.", "Open My Bet History to see your own bets. Successful cashouts appear in green. Load more shows older entries. Dates use Bangladesh time (Asia/Dhaka)."] },
  { title: "Round Results", lines: ["The multiplier starts at 1.00x. The round may crash immediately, so every bet can lose.", "The server generates each round result using its random seed and the round settings. Previous results do not predict the next result.", "A seed hash is published before the round and the seed is revealed after settlement. A maximum multiplier applies to each round."] },
  { title: "Game Menu", lines: ["Sound controls game effects and engine sounds. Music controls background and waiting music. These choices are saved on this browser when storage is available.", "Game Limits shows the round’s minimum and maximum stake and maximum possible payout for one bet.", "How To Play provides a quick guide. The close button returns you to the game."] },
  { title: "Connection & Balance", lines: ["Only server-confirmed bets and cashouts affect the real balance. A delayed or missing response is not proof that a bet was cancelled.", "After a connection interruption, check My Bet History and your balance before placing another bet. Contact support about an unresolved transaction.", "Fun mode uses a separate demo balance and browser-tab history. Fun funds cannot be withdrawn."] },
];

// Only describe features this game implements; reference-only options are omitted.
export default function GameRules() {
  return <article className="space-y-6 p-4 text-xs leading-relaxed text-[#bfc0c5] sm:text-sm">
    <p>Aviator is a multiplier game. Place a bet before takeoff and cash out before the round crashes. A payout is never guaranteed.</p>
    <section><h3 className="mb-3 font-bold text-white">HOW TO PLAY</h3><div className="space-y-4">{PLAY_STEPS.map(({ Icon, text }, index) => <div key={text}><h4 className="mb-1 text-lg font-bold text-white">0{index + 1}</h4><RuleIllustration step={index} /><p className="mt-2 flex gap-2"><Icon size={18} className="shrink-0 text-[#f00643]" />{text}</p></div>)}</div></section>
    {sections.map(section => <section key={section.title}><h3 className="mb-2 font-semibold uppercase text-white">{section.title}</h3><ul className="space-y-2">{section.lines.map(line => <li key={line} className="flex gap-2"><span className="font-bold text-[#f00643]">›</span><span>{line}</span></li>)}</ul></section>)}
  </article>;
}
