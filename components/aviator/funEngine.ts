import { EMPTY_AVIATOR_GAME, type AviatorBet, type AviatorSnapshot } from "./types";

type DemoBet = AviatorBet & { slot?: number; autoAt?: number };
export type FunRecord = { roundId: string; time: string; crashPoint: number; bets: DemoBet[] };
export type FunSave = { balance: number; records: FunRecord[] };
export type BetTransport = { emit: (event: string, payload: any, reply: (result: any) => void) => void };
const money = (value: number) => Math.round(value * 100) / 100;

// This engine has no network or real-wallet dependency. A browser tab owns its demo wallet.
export class FunEngine implements BetTransport {
  balance = 50000;
  records: FunRecord[] = [];
  game: AviatorSnapshot = { ...EMPTY_AVIATOR_GAME, bets: [] };
  private bets: DemoBet[] = [];
  private crashAt = 1;
  private flightAt = 0;
  private nextAt = 0;
  constructor(private changed: () => void, saved?: FunSave, private random = Math.random) {
    if (saved && Number.isFinite(saved.balance) && saved.balance >= 0 && Array.isArray(saved.records)) {
      this.balance = saved.balance;
      this.records = saved.records.slice(0, 100);
    }
    this.start(Date.now());
  }
  private start(now: number) {
    this.bets = Array.from({ length: 18 }, (_, i) => ({
      id: `demo-${now}-${i}`, player: `Demo ${String(i + 1).padStart(3, "0")}`,
      amount: [10, 100, 200, 500][i % 4], status: "PLACED", payout: 0,
      isBot: true, autoAt: money(1.1 + this.random() * 6),
    }));
    this.crashAt = Math.min(50, Math.max(1, money(0.97 / Math.max(0.001, 1 - this.random()))));
    this.game = { ...EMPTY_AVIATOR_GAME, roundId: `FUN-${now}`, startsAt: now + 6000, bets: this.bets };
  }
  tick(now = Date.now()) {
    if (this.game.phase === "WAITING" && now >= this.game.startsAt) {
      this.flightAt = this.game.startsAt;
      this.game.phase = "RUNNING";
    }
    if (this.game.phase === "RUNNING") {
      const next = money(Math.exp((now - this.flightAt) / 9000));
      for (const bet of this.bets) {
        if (bet.status === "PLACED" && bet.autoAt && bet.autoAt < this.crashAt && bet.autoAt <= next)
          this.cash(bet, bet.autoAt);
      }
      this.game.multiplier = Math.min(next, this.crashAt);
      if (next >= this.crashAt) {
        this.game.phase = "CRASHED";
        this.bets.forEach(bet => { if (bet.status === "PLACED") bet.status = "LOST"; });
        this.records = [{ roundId: this.game.roundId, time: new Date(now).toISOString(), crashPoint: this.crashAt, bets: this.bets.map(b => ({ ...b })) }, ...this.records].slice(0, 100);
        this.nextAt = now + 3000;
      }
    } else if (this.game.phase === "CRASHED" && now >= this.nextAt) this.start(now);
    this.publish();
  }
  private cash(bet: DemoBet, multiplier: number) {
    bet.status = "CASHED_OUT";
    bet.cashoutMultiplier = multiplier;
    bet.payout = money(bet.amount * multiplier);
    if (!bet.isBot) this.balance = money(this.balance + bet.payout);
  }
  private publish() {
    this.game = { ...this.game, bets: this.bets.map(b => ({ ...b })), totalWin: this.bets.reduce((n, b) => n + b.payout, 0) };
    this.changed();
  }
  save(): FunSave {
    // Leaving mid-round refunds unsettled demo stakes so a reload cannot lose them silently.
    const unfinished = this.game.phase !== "CRASHED" && this.bets.some(b => !b.isBot);
    const records = unfinished ? [{
      roundId: this.game.roundId,
      time: new Date(this.game.startsAt - 6000).toISOString(),
      crashPoint: 0,
      bets: this.bets.map(b => ({ ...b, status: b.status === "PLACED" ? "CANCELLED" : b.status })),
    }, ...this.records].slice(0, 100) : this.records;
    return { balance: money(this.balance + this.bets.filter(b => !b.isBot && b.status === "PLACED").reduce((n, b) => n + b.amount, 0)), records };
  }
  emit(event: string, payload: any, reply: (result: any) => void) {
    this.tick();
    const fail = (message: string) => reply({ success: false, message });
    if (![1, 2].includes(payload.slot)) return fail("Invalid bet slot");
    const bet = this.bets.find(b => b.slot === payload.slot && b.status === "PLACED");
    if (event === "AVIATOR_BET") {
      const amount = money(Number(payload.amount));
      if (this.game.phase !== "WAITING" || bet) return fail("Betting is closed or a bet already exists");
      if (!Number.isFinite(amount) || amount < this.game.minBet || amount > this.game.maxBet) return fail("Invalid amount");
      if (amount > this.balance) return fail("Insufficient fun balance");
      this.balance = money(this.balance - amount);
      this.bets.push({ id: `${this.game.roundId}-${payload.slot}-${this.bets.length}`, player: "You (Demo)", slot: payload.slot, amount, status: "PLACED", payout: 0 });
    } else if (event === "AVIATOR_CANCEL_BET") {
      if (!bet || this.game.phase !== "WAITING") return fail("Bet cannot be cancelled");
      bet.status = "CANCELLED";
      this.balance = money(this.balance + bet.amount);
    } else if (event === "AVIATOR_CASHOUT") {
      if (!bet || this.game.phase !== "RUNNING") return fail("No active bet to cash out");
      this.cash(bet, this.game.multiplier);
    } else return fail("Unknown demo action");
    this.publish();
    reply({ success: true, payout: bet?.payout || 0, refund: bet?.amount || 0 });
  }
}
