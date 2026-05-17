import { Socket } from "socket.io-client";
import {
  EActionsBoardGame,
  EBoardColors,
  EColors,
  ENextStepGame,
  EOptionsGame,
  EPositionGame,
  EPositionProfile,
  EPositionProfiles,
  ESounds,
  ESufixColors,
  ETypeGame,
  EtypeTile,
  SocketErrors,
  TYPES_CHAT_MESSAGES,
  TYPES_ONLINE_GAMEPLAY,
} from "../utils/constants";

/* ────────── base types ────────── */
export type TBoardColors = keyof typeof EBoardColors;
export type TColors = keyof typeof EColors;
export type TSufixColors = keyof typeof ESufixColors;
export type TDicevalues = 1 | 2 | 3 | 4 | 5 | 6;
export type TPositionGame = keyof typeof EPositionGame;
export type TtypeTile = keyof typeof EtypeTile;
export type TPositionProfiles = keyof typeof EPositionProfiles;
export type TPositionProfile = keyof typeof EPositionProfile;
export type TActionsBoardGame = keyof typeof EActionsBoardGame;
export type TTypeGame = keyof typeof ETypeGame;
export type TOfflineBotMode = "EASY" | "ASSIST";
export type TTotalPlayers = 2 | 3 | 4;
export type TTypesOnlineGameplay = keyof typeof TYPES_ONLINE_GAMEPLAY;
export type TSocketErrors = keyof typeof SocketErrors;
export type ISocketError = Record<TSocketErrors, string>;
export type ITypeChatMessage = keyof typeof TYPES_CHAT_MESSAGES;
export type IEOptionsGame = keyof typeof EOptionsGame;
export type IESounds = keyof typeof ESounds;
export type IENextStepGame = keyof typeof ENextStepGame;

/* ────────── misc shared types ────────── */
export type IPredefinedChatMessages = Record<
  ITypeChatMessage,
  { index: number; value: string }[]
>;

export interface ICoordinate {
  x: number;
  y: number;
}

export interface IPositionsItems {
  index: number;
  coordinate: ICoordinate;
}

export interface IPoint {
  x: number;
  y: number;
  increaseX: number;
  increaseY: number;
  total: number;
  indexBase: number;
}

export type TFinalPositionsValues = Record<TPositionGame, IPositionsItems[]>;
export type TExitTilesValues = Record<TPositionGame, IPoint>;

export interface IPositionGame {
  exitTileIndex: number;
  exitTiles: IPositionsItems[];
  finalPositions: IPositionsItems[];
  startPositions: IPositionsItems[];
  startTileIndex: number;
}

export type TLocationBoardElements = Record<TPositionGame, IPositionGame>;

/* ────────── profile handlers ────────── */
export type ThandleTimer = (ends: boolean, playerIndex?: number) => void;
export type ThandleSelectDice = (
  diceValue?: TDicevalues,
  isActionSocket?: boolean,
) => void;
export type ThandleMuteChat = (playerIndex: number) => void;
export type ThandleDoneDice = (isActionSocket?: boolean) => void;

export interface IProfileHandlers {
  handleTimer: ThandleTimer;
  handleSelectDice: ThandleSelectDice;
  handleDoneDice: ThandleDoneDice;
  handleMuteChat: ThandleMuteChat;
}

/* ────────── users ────────── */
export interface IUser {
  id: string;
  name: string;
  email: string;
  isBot?: boolean;
  isOnline?: boolean;
  photo?: string;
  socketID?: string;
  color?: TColors;
  mobile?: string;
}

export interface IPlayer extends IUser {
  isOffline: boolean;
  index: number;
  finished: boolean;
  ranking: number;
  color: TColors;
  isMuted?: boolean;
  chatMessage?: string;
  typeMessage?: ITypeChatMessage;
  counterMessage: number;
}

/* ────────── dice and token types ────────── */
export interface IDiceList {
  key: number;
  value: TDicevalues;
}

export interface IToken {
  color: TColors;
  coordinate: ICoordinate;
  typeTile: TtypeTile;
  positionTile: number;
  index: number;
  diceAvailable: IDiceList[];
  canSelectToken: boolean;
  totalTokens: number;
  position: number;
  enableTooltip: boolean;
  isMoving: boolean;
  animated: boolean;
}

export interface IListTokens {
  index: number;
  positionGame: TPositionGame;
  tokens: IToken[];
}

/* ────────── turn state ────────── */
export interface IActionsTurn {
  timerActivated: boolean;
  disabledDice: boolean;
  showDice: boolean;
  diceValue: 0 | TDicevalues;
  diceList: IDiceList[];
  diceRollNumber: number;
  isDisabledUI: boolean;
  actionsBoardGame?: TActionsBoardGame;
}

export type TTokenByPositionType = Record<TtypeTile, IToken[]>;

export interface IActionsMoveToken {
  isRunning: boolean;
  tokenIndex: number;
  totalCellsMove: number;
  cellsCounter: number;
}

export type TShowTotalTokens = Record<number, number>;

export interface IGameOver {
  showModal: boolean;
  gameOver: boolean;
}

/* ────────── game data ────────── */
export interface DataOfflineGame {
  initialTurn: number;
  users: IUser[];
  totalPlayers: TTotalPlayers;
  boardColor: TBoardColors;
}

export interface IAuthOptions {
  socialName: string;
  routerURL: string;
}

export interface IAuth {
  isAuth: boolean;
  authOptions: IAuthOptions[];
  user?: IUser | null;
  serviceError?: boolean;
  email: string;
}

export interface IDataPlayWithFriends {
  type: TTypesOnlineGameplay;
  roomName: string;
  totalPlayers: TTotalPlayers;
  initialColor?: TColors;
}

/* ────────── socket auth payload ────────── */
export interface IDataSocketUser {
  id: string;
  name: string;
  email: string;
}

export interface IDataSocket {
  type: TTypesOnlineGameplay;
  totalPlayers: TTotalPlayers | 0;
  roomName: string;
  initialColor?: TColors;
  playAsGuest: boolean;
  user: IDataSocketUser;
  betAmount?: number;
  reservationId?: string;
}

/* ────────── socket room users ────────── */
export interface IUserSocket {
  id: string;
  name: string;
  photo?: string;
  socketID: string;
  color: TColors;
  isBot?: boolean;
  isOnline?: boolean;
}

/* ────────── socket room data ────────── */
export interface IDataRoom {
  initialTurnUserID: string;
  isFull: boolean;
  roomName: string;
  users: IUserSocket[];
  totalPlayers: TTotalPlayers;
  betAmount?: number;
  feePercent?: number;
  botMode?: TOfflineBotMode;
}

/* ────────── online game props ────────── */
export interface IDataOnline {
  totalPlayers: TTotalPlayers;
  initialTurn: number;
  users: IUser[];
  boardColor: TBoardColors;
  roomName: string;
  typeGame: TTypeGame;
  socket: Socket;
  currentUserId?: string;
  betAmount?: number;
  botMode?: TOfflineBotMode;
}

/* ────────── ui room ordering ────────── */
export type TDataRoomUserOrder = Record<number, IUserSocket>;

export interface IDataRoomSocket {
  isFull: boolean;
  boardColor: TBoardColors;
  totalPlayers: TTotalPlayers;
  orderPlayers: TDataRoomUserOrder;
}

export interface ISelectTokenValues {
  diceIndex: number;
  tokenIndex: number;
}

/* ────────── socket actions ────────── */
export interface ISocketListenChatMessage {
  userID: string;
  type: ITypeChatMessage;
  messageIndex: number;
}

export interface ISocketListenData {
  [EActionsBoardGame.ROLL_DICE]: TDicevalues;
  [EActionsBoardGame.SELECT_TOKEN]: ISelectTokenValues;
  [EActionsBoardGame.OPPONENT_LEAVE]: string;
  [EActionsBoardGame.CHAT_MESSAGE]: ISocketListenChatMessage;
  [EActionsBoardGame.DONE_DICE]: boolean;
  [EActionsBoardGame.DONE_TOKEN_MOVEMENT]: IENextStepGame;
}

export interface ISocketListenActions {
  change: boolean;
  type: TActionsBoardGame;
  data: ISocketListenData;
}

export interface ISocketActions {
  type: TActionsBoardGame;
  roomName: string;
  [EActionsBoardGame.ROLL_DICE]: TDicevalues;
  [EActionsBoardGame.SELECT_TOKEN]: ISelectTokenValues;
  [EActionsBoardGame.OPPONENT_LEAVE]: string;
  [EActionsBoardGame.CHAT_MESSAGE]: ISocketListenChatMessage;
  [EActionsBoardGame.DONE_DICE]: boolean;
  [EActionsBoardGame.DONE_TOKEN_MOVEMENT]: IENextStepGame;
}

/* ────────── options context ────────── */
export type IOptionsGame = Record<IEOptionsGame, boolean>;

export interface IOptionsContext {
  optionsGame: IOptionsGame;
  toogleOptions: (type: IEOptionsGame) => void;
  playSound: (type: IESounds) => void;
}

/* ────────── service worker ────────── */
export interface IServiceWorker {
  serviceWorkerInitialized?: boolean;
  serviceWorkerUpdated?: boolean;
  serviceWorkerRegistration?: ServiceWorkerRegistration;
}
