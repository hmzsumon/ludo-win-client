import type {
  IActionsMoveToken,
  IActionsTurn,
  IOptionsGame,
  IPredefinedChatMessages,
  ISocketError,
  ISocketListenActions,
  TDicevalues,
} from "../interfaces";

/* ────────── board dimensions ────────── */
export const BASE_HEIGHT = 732;
export const BASE_WIDTH = 412;
export const SIZE_BOARD = BASE_WIDTH - 22;
export const SIZE_TILE = SIZE_BOARD / 15;
export const DIE_SIZE_TOOLTIP = SIZE_TILE + SIZE_TILE * 0.15;

/* ────────── board color presets ────────── */
/**
 * RGYB -> Rojo, verde, amarillo y azul.
 * BRGY -> Azul, Rojom verde y amarillo.
 * YBRG -> Amarillo, azul, rojo y verde
 * GYBR -> Verde, amarillo, azul y rojo...
 */
export enum EBoardColors {
  RGYB = "RGYB",
  BRGY = "BRGY",
  YBRG = "YBRG",
  GYBR = "GYBR",
}

/* ────────── colors ────────── */
export enum EColors {
  RED = "RED",
  BLUE = "BLUE",
  YELLOW = "YELLOW",
  GREEN = "GREEN",
}

/* ────────── color suffix map ────────── */
export enum ESufixColors {
  R = "RED",
  B = "BLUE",
  Y = "YELLOW",
  G = "GREEN",
}

/* ────────── board positions ────────── */
export enum EPositionGame {
  BOTTOM_LEFT = "BOTTOM_LEFT",
  TOP_LEFT = "TOP_LEFT",
  TOP_RIGHT = "TOP_RIGHT",
  BOTTOM_RIGHT = "BOTTOM_RIGHT",
}

export enum EPositionProfiles {
  TOP = "TOP",
  BOTTOM = "BOTTOM",
}

export enum EPositionProfile {
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

/* ────────── tile types ────────── */
export enum EtypeTile {
  JAIL = "JAIL",
  NORMAL = "NORMAL",
  EXIT = "EXIT",
  END = "END",
}

/* ────────── board actions ────────── */
export enum EActionsBoardGame {
  ROLL_DICE = "ROLL_DICE",
  SELECT_TOKEN = "SELECT_TOKEN",
  OPPONENT_LEAVE = "OPPONENT_LEAVE",
  CHAT_MESSAGE = "CHAT_MESSAGE",
  START_GAME = "START_GAME",
  DONE_DICE = "DONE_DICE",
  DONE_TOKEN_MOVEMENT = "DONE_TOKEN_MOVEMENT",
}

export enum ENextStepGame {
  ROLL_DICE_AGAIN = "ROLL_DICE_AGAIN",
  MOVE_TOKENS_AGAIN = "MOVE_TOKENS_AGAIN",
  NEXT_TURN = "NEXT_TURN",
}

export enum ETypeGame {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
}

/* ────────── token z-index ────────── */
export const BASE_ZINDEX_TOKEN = 1;
export const ZINDEX_TOKEN_SELECT = 7;

/* ────────── default turn actions ────────── */
export const DEFAULT_VALUE_ACTION_TURN: IActionsTurn = {
  timerActivated: false,
  disabledDice: true,
  diceValue: 0,
  diceList: [],
  diceRollNumber: 0,
  actionsBoardGame: EActionsBoardGame.ROLL_DICE,
  showDice: false,
  isDisabledUI: false,
};

/* ────────── dice rules ────────── */
export const DICE_VALUE_GET_OUT_JAIL: TDicevalues = 6;
export const MAXIMUM_DICE_PER_TURN = 3;
export const MAXIMUM_VISIBLE_TOKENS_PER_CELL = 4;

/* ────────── timings ────────── */
export const TIME_INTERVAL_CHRONOMETER = 100;
export const TOKEN_MOVEMENT_INTERVAL_VALUE = 200;
export const ROLL_TIME_VALUE = 0.6;
export const DELAY_DONE_TOKEN_MOVEMENT_SOCKET = 500;
export const WAIT_SHOW_MODAL_GAME_OVER = 800;

/* ────────── dev socket config ────────── */
export const SOCKET_PORT_DEV = 3000;

/* ────────── token movement state ────────── */
export const INITIAL_ACTIONS_MOVE_TOKEN: IActionsMoveToken = {
  isRunning: false,
  tokenIndex: 0,
  totalCellsMove: 0,
  cellsCounter: 0,
};

/* ────────── ranking helpers ────────── */
export const PREFIX_RANKING = ["st", "nd", "rd", "th"];

/* ────────── room config ────────── */
export const ROOM_RANGE = 5;

/* ────────── backend urls ────────── */
const LUDO_BACKEND_URL =
  process.env.NEXT_PUBLIC_LUDO_BACKEND_URL || "http://localhost:8000";

export const API_URL = `${LUDO_BACKEND_URL}/api/me`;
export const API_LOGIN = `${LUDO_BACKEND_URL}/api/login`;
export const API_REGISTER = `${LUDO_BACKEND_URL}/api/register`;
export const API_LOGOUT = `${LUDO_BACKEND_URL}/api/logout`;

/* ────────── online gameplay types ────────── */
export enum TYPES_ONLINE_GAMEPLAY {
  NONE = "NONE",
  JOIN_EXISTING_ROOM = "JOIN_EXISTING_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
  CREATE_ROOM = "CREATE_ROOM",
}

/* ────────── socket errors ────────── */
export enum SocketErrors {
  INVALID_ROOM = "INVALID_ROOM",
  INVALID_COLOR = "INVALID_COLOR",
  INVALID_USER = "INVALID_USER",
  UNAUTHENTICATED = "UNAUTHENTICATED",
  AUTHENTICATED = "AUTHENTICATED",
}

export const SOCKET_ERROR_MESSAGES: ISocketError = {
  INVALID_ROOM: "The room is not valid",
  INVALID_COLOR: "Invalid token color",
  INVALID_USER: "Invalid user",
  UNAUTHENTICATED: "User is not authenticated",
  AUTHENTICATED: "User already authenticated",
};

/* ────────── chat types ────────── */
export enum TYPES_CHAT_MESSAGES {
  EMOJI = "EMOJI",
  TEXT = "TEXT",
}

/* ────────── initial socket listen state ────────── */
export const INITIAL_SOCKET_LISTEN_ACTIONS: ISocketListenActions = {
  change: false,
  type: EActionsBoardGame.ROLL_DICE,
  data: {
    [EActionsBoardGame.ROLL_DICE]: 1,
    [EActionsBoardGame.SELECT_TOKEN]: {
      diceIndex: -1,
      tokenIndex: -1,
    },
    [EActionsBoardGame.OPPONENT_LEAVE]: "",
    [EActionsBoardGame.CHAT_MESSAGE]: {
      userID: "",
      type: TYPES_CHAT_MESSAGES.EMOJI,
      messageIndex: 0,
    },
    [EActionsBoardGame.DONE_DICE]: false,
    [EActionsBoardGame.DONE_TOKEN_MOVEMENT]: ENextStepGame.NEXT_TURN,
  },
};

/* ────────── predefined chat messages ────────── */
export const PREDEFINED_CHAT_MESSAGES: IPredefinedChatMessages = {
  [TYPES_CHAT_MESSAGES.TEXT]: [
    "Hi",
    "Nice move!",
    "Oh no!",
    "Good game!",
    "Best of luck!",
    "Oops...",
    "Thanks!",
    "Bye bye",
    "Play fast",
    "Sorry!",
    "Catch me if you can!",
    "Please do not kill me",
    "Unlucky",
    "Not again!",
    "You're lucky!",
    "I will eat you",
  ].map((value, index) => ({ index, value })),
  [TYPES_CHAT_MESSAGES.EMOJI]: ["😅", "🤬", "😭", "🤯", "🥺", "😩"].map(
    (value, index) => ({ index, value }),
  ),
};

/* ────────── game options ────────── */
export enum EOptionsGame {
  SOUND = "SOUND",
  MUSIC = "MUSIC",
  CHAT = "CHAT",
}

export enum ESounds {
  ROLL_DICE = "ROLL_DICE",
  TOKEN_MOVE = "TOKEN_MOVE",
  GET_SIX = "GET_SIX",
  SAFE_ZONE = "SAFE_ZONE",
  TOKEN_JAIL = "TOKEN_JAIL",
  CHAT = "CHAT",
  USER_OFFLINE = "USER_OFFLINE",
  USER_ONLINE = "USER_ONLINE",
  GAMER_OVER = "GAMER_OVER",
  CLICK = "CLICK",
}

export const INITIAL_OPTIONS_GAME: IOptionsGame = {
  [EOptionsGame.SOUND]: true,
  [EOptionsGame.MUSIC]: true,
  [EOptionsGame.CHAT]: true,
};

/* ────────── css variables ────────── */
if (typeof document !== "undefined") {
  const root = document.documentElement;
  root.style.setProperty("--base-height", `${BASE_HEIGHT}px`);
  root.style.setProperty("--base-width", `${BASE_WIDTH}px`);
  root.style.setProperty("--size-board", `${SIZE_BOARD}px`);
  root.style.setProperty("--size-tile", `${SIZE_TILE}px`);
}
