// Reveal participants only before the waiting deadline, even if a socket phase
// update or a browser timer arrives late. Existing payout updates remain live.
export function scheduleParticipantReveal(
  phase: string, startsAt: number, revealed: number, total: number, reveal: () => void,
) {
  if (phase !== "WAITING" || Date.now() >= startsAt || revealed >= total) return;
  const timer = setTimeout(() => {
    if (Date.now() < startsAt) reveal();
  }, 60 + Math.floor(Math.random() * 81));
  return () => clearTimeout(timer);
}
