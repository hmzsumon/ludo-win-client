import type {
  IActionsMoveToken,
  IActionsTurn,
  IDataSocket,
  IGameOver,
  IListTokens,
  IPlayer,
  TShowTotalTokens,
} from "@/interfaces";
import { TYPES_ONLINE_GAMEPLAY } from "@/utils/constants";

/* ────────── active online game storage keys ────────── */
export const LUDO_ACTIVE_GAME_KEY = "ludo:active-online-game:v1";
export const LUDO_ACTIVE_GAME_STATE_KEY = "ludo:active-online-game-state:v1";

export const LUDO_RECONNECT_COOLDOWN_KEY = "ludo:reconnect-cooldown:v1";
export const LUDO_MANUAL_LEAVE_KEY = "ludo:manual-leave:v1";
export const LUDO_RECONNECT_GRACE_MS = 30_000;

/* ────────── save accidental refresh cooldown ────────── */
export const saveLudoReconnectCooldown = (roomName?: string) => {
  if (!canUseStorage()) return;

  writeJson(LUDO_RECONNECT_COOLDOWN_KEY, {
    roomName: roomName || "",
    expiresAt: Date.now() + LUDO_RECONNECT_GRACE_MS,
  });
};

/* ────────── read accidental refresh cooldown remaining ms ────────── */
export const getLudoReconnectCooldownRemaining = () => {
  const cooldown = readJson<{ roomName?: string; expiresAt: number }>(
    LUDO_RECONNECT_COOLDOWN_KEY,
  );

  if (!cooldown?.expiresAt) return 0;

  const remaining = cooldown.expiresAt - Date.now();
  if (remaining <= 0) {
    clearLudoReconnectCooldown();
    return 0;
  }

  return remaining;
};

/* ────────── clear accidental refresh cooldown ────────── */
export const clearLudoReconnectCooldown = () => {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(LUDO_RECONNECT_COOLDOWN_KEY);
};

/* ────────── manual leave marker ────────── */
export const markLudoManualLeaveIntent = () => {
  if (!canUseStorage()) return;

  window.sessionStorage.setItem(LUDO_MANUAL_LEAVE_KEY, String(Date.now()));
  clearLudoReconnectCooldown();
};

/* ────────── consume manual leave marker ────────── */
export const consumeLudoManualLeaveIntent = () => {
  if (!canUseStorage()) return false;

  const value = window.sessionStorage.getItem(LUDO_MANUAL_LEAVE_KEY);
  if (!value) return false;

  window.sessionStorage.removeItem(LUDO_MANUAL_LEAVE_KEY);
  return Date.now() - Number(value) < 10_000;
};

/* ────────── active game expiry guard ────────── */
const ACTIVE_GAME_MAX_AGE_MS = 2 * 60 * 60 * 1000;

/* ────────── active socket session shape ────────── */
export type LudoActiveSocketSession = IDataSocket & {
  savedAt: number;
};

/* ────────── active board state shape ────────── */
export interface LudoActiveGameState {
  roomName: string;
  currentUserId: string;
  savedAt: number;
  players: IPlayer[];
  listTokens: IListTokens[];
  actionsTurn: IActionsTurn;
  currentTurn: number;
  actionsMoveToken: IActionsMoveToken;
  totalTokens: TShowTotalTokens;
  isGameOver: IGameOver;
}

/* ────────── browser storage guard ────────── */
const canUseStorage = () => typeof window !== "undefined";

/* ────────── safe json reader ────────── */
const readJson = <T>(key: string): T | null => {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

/* ────────── safe json writer ────────── */
const writeJson = (key: string, value: unknown) => {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore storage full/private mode errors */
  }
};

/* ────────── save active socket session ────────── */
export const saveLudoActiveSocketSession = (payload: IDataSocket) => {
  if (!payload.roomName || !payload.totalPlayers) return;

  writeJson(LUDO_ACTIVE_GAME_KEY, {
    ...payload,
    type: TYPES_ONLINE_GAMEPLAY.JOIN_ROOM,
    savedAt: Date.now(),
  });
};

/* ────────── read active socket session ────────── */
export const readLudoActiveSocketSession = () => {
  const session = readJson<LudoActiveSocketSession>(LUDO_ACTIVE_GAME_KEY);

  if (!session) return null;
  if (
    !session.savedAt ||
    Date.now() - session.savedAt > ACTIVE_GAME_MAX_AGE_MS
  ) {
    clearLudoActiveSocketSession();
    return null;
  }

  return session;
};

/* ────────── clear active socket session ────────── */
export const clearLudoActiveSocketSession = () => {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(LUDO_ACTIVE_GAME_KEY);
  window.localStorage.removeItem(LUDO_ACTIVE_GAME_STATE_KEY);
};

/* ────────── save active board state ────────── */
export const saveLudoActiveGameState = (payload: LudoActiveGameState) => {
  if (!payload.roomName || payload.isGameOver?.gameOver) return;

  writeJson(LUDO_ACTIVE_GAME_STATE_KEY, {
    ...payload,
    savedAt: Date.now(),
  });
};

/* ────────── read active board state ────────── */
export const readLudoActiveGameState = ({
  roomName,
  currentUserId,
}: {
  roomName: string;
  currentUserId: string;
}) => {
  const state = readJson<LudoActiveGameState>(LUDO_ACTIVE_GAME_STATE_KEY);

  if (!state) return null;
  if (!state.savedAt || Date.now() - state.savedAt > ACTIVE_GAME_MAX_AGE_MS) {
    clearLudoActiveSocketSession();
    return null;
  }
  if (state.roomName !== roomName) return null;
  if (state.currentUserId !== currentUserId) return null;
  if (state.isGameOver?.gameOver) return null;

  return state;
};

/* ────────── clear only stored board state ────────── */
export const clearLudoActiveGameState = () => {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(LUDO_ACTIVE_GAME_STATE_KEY);
};
