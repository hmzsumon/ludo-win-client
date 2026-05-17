import type {
  IDataRoom,
  IDataRoomSocket,
  IDataSocketUser,
  IUser,
  IUserSocket,
  TBoardColors,
  TColors,
  TDataRoomUserOrder,
  TTotalPlayers,
} from "../interfaces";
import { ETypeGame } from "./constants";

/* ────────── color suffix map ────────── */
const COLOR_SUFFIX_MAP: Record<TColors, string> = {
  GREEN: "G",
  YELLOW: "Y",
  BLUE: "B",
  RED: "R",
};

const ALL_COLORS: TColors[] = ["GREEN", "YELLOW", "BLUE", "RED"];

/* ────────── current user finder ────────── */
export const getCurrentUser = (
  currentUser: IDataSocketUser,
  users: IUserSocket[],
) => users.find((user) => user.id === currentUser.id);

/* ────────── keep backend order ────────── */
const buildOrderPlayers = (
  users: IUserSocket[],
  totalPlayers: TTotalPlayers,
): TDataRoomUserOrder => {
  const orderPlayers: TDataRoomUserOrder = {};

  for (let i = 0; i < totalPlayers; i++) {
    if (!users[i]) continue;
    orderPlayers[i + 1] = users[i];
  }

  return orderPlayers;
};

/* ────────── build board color from users ────────── */
/*
  2 player mode এ player1 -> slot 0
  player2 -> slot 2
  যাতে board diagonal naturally থাকে।
*/
const buildBoardColorFromUsers = (
  users: IUserSocket[],
  totalPlayers: TTotalPlayers,
): TBoardColors => {
  const playerColors = users
    .slice(0, totalPlayers)
    .map((user) => user.color)
    .filter(Boolean) as TColors[];

  const remainingColors = ALL_COLORS.filter(
    (color) => !playerColors.includes(color),
  );

  let orderedBoardColors: TColors[] = [];

  if (totalPlayers === 2) {
    orderedBoardColors = [
      playerColors[0] || "RED",
      remainingColors[0] || "GREEN",
      playerColors[1] || "YELLOW",
      remainingColors[1] || "BLUE",
    ];
  } else if (totalPlayers === 3) {
    orderedBoardColors = [
      playerColors[0] || "RED",
      playerColors[1] || "GREEN",
      playerColors[2] || "YELLOW",
      remainingColors[0] || "BLUE",
    ];
  } else {
    orderedBoardColors = [
      playerColors[0] || "RED",
      playerColors[1] || "GREEN",
      playerColors[2] || "YELLOW",
      playerColors[3] || "BLUE",
    ];
  }

  return orderedBoardColors
    .map((color) => COLOR_SUFFIX_MAP[color])
    .join("") as TBoardColors;
};

/* ────────── game users formatter ────────── */
const getUsersPlay = (
  orderPlayers: TDataRoomUserOrder,
  totalPlayers: TTotalPlayers,
) => {
  const users: IUser[] = [];

  for (let i = 1; i <= totalPlayers; i++) {
    const player = orderPlayers[i];

    if (!player) {
      console.warn(
        "⚠️ Missing player in orderPlayers at index",
        i,
        orderPlayers,
      );
      continue;
    }

    const { id, name, photo, socketID, color, isBot, isOnline } = player;

    users.push({
      id,
      name,
      email: "",
      photo,
      socketID,
      color,
      isBot: Boolean(isBot),
      isOnline: typeof isOnline === "boolean" ? isOnline : !isBot,
    });
  }

  return users;
};

/* ────────── update room socket data ────────── */
export const updateDataRoomSocket = (
  dataRoom: IDataRoom,
  user: IDataSocketUser,
): IDataRoomSocket => {
  const { isFull, totalPlayers, users } = dataRoom;

  const currentUser = getCurrentUser(user, users);

  if (!currentUser) {
    console.warn("⚠️ Current user not found in socket room users", {
      currentUserId: user?.id,
      roomUsers: users,
    });
  }

  const orderPlayers = buildOrderPlayers(users, totalPlayers);
  const boardColor = buildBoardColorFromUsers(users, totalPlayers);

  return {
    isFull,
    boardColor,
    totalPlayers,
    orderPlayers,
  };
};

/* ────────── online game data builder ────────── */
export const getDataOnlineGame = (
  dataRoomSocket: IDataRoomSocket,
  dataRoom: IDataRoom,
) => {
  const { totalPlayers, orderPlayers, boardColor } = dataRoomSocket;
  const { initialTurnUserID, roomName, botMode } = dataRoom;

  console.log("dataRoom", dataRoom);

  const users = getUsersPlay(orderPlayers, totalPlayers);
  const initialTurn = users.findIndex((v) => v.id === initialTurnUserID);

  return {
    totalPlayers,
    initialTurn,
    users,
    boardColor,
    roomName,
    typeGame: ETypeGame.ONLINE,
    botMode,
  };
};
