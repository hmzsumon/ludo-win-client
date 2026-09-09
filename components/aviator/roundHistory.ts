export type CompletedRound = { roundId: string; crashPoint: number };

// Merge by identity, not multiplier: different rounds may have the same result.
export function mergeRoundHistory(current: CompletedRound[], incoming: CompletedRound[]): CompletedRound[] {
  const rounds = new Map<string, CompletedRound>();
  for (const round of [...current, ...incoming]) {
    if (typeof round?.roundId === "string" && round.roundId && Number.isFinite(round.crashPoint) && round.crashPoint >= 1)
      rounds.set(round.roundId, round);
  }
  return Array.from(rounds.values()).sort((a, b) => b.roundId.localeCompare(a.roundId, "en", { numeric: true })).slice(0, 100);
}
