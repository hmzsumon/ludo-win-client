import cloneDeep from "lodash.clonedeep";
import { delay, randomNumber } from "../../utils/helpers";

import type {
  IActionsMoveToken,
  IActionsTurn,
  IDiceList,
  IENextStepGame,
  IESounds,
  IGameOver,
  IListTokens,
  IPlayer,
  IToken,
  IUser,
  TBoardColors,
  TColors,
  TDicevalues,
  TGameMode,
  TOfflineBotMode,
  TPositionGame,
  TShowTotalTokens,
  TSufixColors,
  TTokenByPositionType,
  TTotalPlayers,
  TtypeTile,
} from "../../interfaces";
import {
  DICE_VALUE_GET_OUT_JAIL,
  EActionsBoardGame,
  EGameMode,
  ENextStepGame,
  EPositionGame,
  ESounds,
  ESufixColors,
  EtypeTile,
  MAXIMUM_DICE_PER_TURN,
  MAXIMUM_VISIBLE_TOKENS_PER_CELL,
} from "../../utils/constants";
import {
  POSITION_ELEMENTS_BOARD,
  POSITION_TILES,
  SAFE_AREAS,
  TOTAL_EXIT_TILES,
  TOTAL_TILES,
} from "../../utils/positions-board";
import { getDiceIndexSelected } from "./token/helpers";

/* ────────── helpers color resolve ────────── */
const getUserColor = (user?: Partial<IUser> & { color?: TColors }) =>
  user?.color as TColors | undefined;

/* ────────── board slot colors by current board preset ────────── */
const getBoardColorSlots = (boardColor: TBoardColors) => {
  const splitColor = boardColor.split("");
  const colors = splitColor.map((value) => ESufixColors[value as TSufixColors]);

  return {
    bottomLeft: colors[0] as TColors,
    topLeft: colors[1] as TColors,
    topRight: colors[2] as TColors,
    bottomRight: colors[3] as TColors,
  };
};

/**
 * Dependiendo del total de jugadores se duvuelen los colores que corresponde a las
 * posiciones donde quedará cada jugador...
 * @param boardColor
 * @param totalPlayers
 * @returns
 */
const getPlayersColors = (
  boardColor: TBoardColors,
  totalPlayers: TTotalPlayers,
) => {
  const splitColor = boardColor.split("");
  const colors = splitColor.map((v) => ESufixColors[v as TSufixColors]);

  if (totalPlayers === 2) {
    return [colors[0], colors[2]];
  }

  if (totalPlayers === 3) {
    return [colors[0], colors[1], colors[2]];
  }

  return colors;
};

/* ────────── resolve players colors ────────── */
const getPlayersColorsResolved = (
  users: IUser[],
  boardColor: TBoardColors,
  totalPlayers: TTotalPlayers,
): TColors[] => {
  const fallbackColors = getPlayersColors(boardColor, totalPlayers);

  return Array.from({ length: totalPlayers }, (_, index) => {
    const fixedColor = getUserColor(users[index]);
    return fixedColor || fallbackColors[index];
  });
};

/* ────────── fixed board position by color ────────── */
const getPositionGameByColor = (
  color: TColors,
  boardColor: TBoardColors,
  fallbackPosition: TPositionGame,
): TPositionGame => {
  const { bottomLeft, topLeft, topRight, bottomRight } =
    getBoardColorSlots(boardColor);

  if (color === bottomLeft) return EPositionGame.BOTTOM_LEFT;
  if (color === topLeft) return EPositionGame.TOP_LEFT;
  if (color === topRight) return EPositionGame.TOP_RIGHT;
  if (color === bottomRight) return EPositionGame.BOTTOM_RIGHT;

  return fallbackPosition;
};

/**
 * Dependiendo del número de jugadores, devuelve los valores de posiciones
 * para cada token...
 * @param totalPlayers
 */
const getTokensPositionsOnBoard = (totalPlayers: TTotalPlayers) => {
  if (totalPlayers === 2) {
    return [EPositionGame.BOTTOM_LEFT, EPositionGame.TOP_RIGHT];
  }

  if (totalPlayers === 3) {
    return [
      EPositionGame.BOTTOM_LEFT,
      EPositionGame.TOP_LEFT,
      EPositionGame.TOP_RIGHT,
    ];
  }

  return [
    EPositionGame.BOTTOM_LEFT,
    EPositionGame.TOP_LEFT,
    EPositionGame.TOP_RIGHT,
    EPositionGame.BOTTOM_RIGHT,
  ];
};

/**
 * Devuelve el listado de coordendas, dependiendo del tipo de celda
 * además de la posición en el board
 * @param tileType
 * @param positionGame
 * @param index
 * @returns
 */
const getCoordinatesByTileType = (
  tileType: TtypeTile,
  positionGame: TPositionGame,
  index: number,
) => {
  if (tileType === EtypeTile.JAIL) {
    return POSITION_ELEMENTS_BOARD[positionGame].startPositions[index]
      .coordinate;
  }

  if (tileType === EtypeTile.NORMAL) {
    return POSITION_TILES[index].coordinate;
  }

  if (tileType === EtypeTile.EXIT) {
    return POSITION_ELEMENTS_BOARD[positionGame].exitTiles[index].coordinate;
  }

  return POSITION_ELEMENTS_BOARD[positionGame].finalPositions[index].coordinate;
};

/**
 * Función que genera la data para ubicar los tokens en la cárcel...
 * @param positionGame
 * @param color
 * @param canSelectToken
 */
const getTokensInJail = (
  positionGame: TPositionGame,
  color: TColors,
  canSelectToken: boolean,
) => {
  const tokens: IToken[] = [];

  for (let i = 0; i < 4; i++) {
    const coordinate = getCoordinatesByTileType(
      EtypeTile.JAIL,
      positionGame,
      i,
    );

    tokens.push({
      color,
      coordinate,
      typeTile: EtypeTile.JAIL,
      positionTile: i,
      index: i,
      diceAvailable: [],
      totalTokens: 1,
      position: 1,
      enableTooltip: false,
      isMoving: false,
      animated: false,
      canSelectToken,
    });
  }

  return tokens;
};

/* ────────── validate dice ownership ────────── */
const validateDisabledDice = (
  indexTurn: number,
  players: IPlayer[],
  currentUserId?: string,
) => {
  const currentPlayer = players[indexTurn];

  if (!currentPlayer) return true;

  const { isOnline, isBot, id } = currentPlayer;

  if (isBot) return true;

  if (!isOnline) return false;

  return !(currentUserId && id === currentUserId);
};

/**
 * Función que valida si existen tres dados con el mismo valor,
 * cuando sucede esto, el usuario pierde el turno...
 * @param diceList
 * @returns
 */
const validateThreeConsecutiveRolls = (sixRollStreak = 0) => {
  /* ────────── 3 Six Rule ──────────
     শুধু লাগাতার ৩ বার ৬ উঠলে turn cancel হবে।
     ৬, ৬, ৩ হলে streak reset হবে; এরপর আবার ৬, ৬, ১ হলে move করা যাবে।
     diceList দিয়ে validate করলে kill/extra chance-এর আগের unused dice mix হয়ে যায়,
     তাই আলাদা sixRollStreak রাখা হয়েছে।
  ───────────────────────────────── */
  return sixRollStreak >= MAXIMUM_DICE_PER_TURN;
};

/* ────────── validate next turn params ────────── */
interface ValidateNextTurn {
  currentTurn: number;
  players: IPlayer[];
  currentUserId?: string;
  addLastDice?: boolean;
  addDelayNextTurn?: boolean;
  setActionsTurn: React.Dispatch<React.SetStateAction<IActionsTurn>>;
  setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Función que valida la acción para pasar al siguiente turno...
 * No debe llegar a está función si ya se ha terminado el juego...
 * @param param0
 */
const validateNextTurn = async ({
  currentTurn,
  players,
  currentUserId,
  addLastDice = false,
  addDelayNextTurn = false,
  setActionsTurn,
  setCurrentTurn,
}: ValidateNextTurn) => {
  if (addLastDice) {
    setActionsTurn((data) => {
      const newData = cloneDeep(data);
      const value = newData.diceValue as TDicevalues;

      newData.diceList.push({ key: Math.random(), value });
      newData.disabledDice = true;
      newData.timerActivated = false;

      return newData;
    });
  }

  if (addDelayNextTurn) {
    await delay(250);
  }

  let nextTurn = currentTurn;

  do {
    nextTurn = nextTurn + 1 < players.length ? nextTurn + 1 : 0;

    if (nextTurn === currentTurn) {
      console.log(
        "Romper el ciclo infinito, el siguiente turno no debería ser igual al turno actual",
      );
      break;
    }

    const { finished, isOffline } = players[nextTurn];

    if (!finished && !isOffline) {
      setActionsTurn(
        getInitialActionsTurnValue(nextTurn, players, currentUserId),
      );
      setCurrentTurn(nextTurn);
      break;
    }
  } while (1);
};

/**
 * Dado el listado de tokens y el tipo los filtra con ese valor
 * @param listTokens
 * @param type
 * @returns
 */
const getTokenByCellType = (listTokens: IListTokens, type: TtypeTile) =>
  listTokens.tokens.filter((token) => token.typeTile === type);

/**
 * Dado los tokens del turno actual, se obtiene el tipo de ubicación de cada
 * uno de los tokens (JAIL, NORMAL, EXIT, END)
 * @param listTokens
 * @returns
 */
const getTokensValueByCellType = (listTokens: IListTokens) =>
  Object.keys(EtypeTile)
    .map((type) => {
      const typeTile = type as TtypeTile;

      return { [typeTile]: getTokenByCellType(listTokens, typeTile) };
    })
    .reduce((a, s) => ({ ...a, ...s }), {}) as TTokenByPositionType;

/**
 * Dado los tokens, se devuleve un objeto de la forma:
 * 1: Token, 1 representa la posición
 * @param tokens
 * @returns
 */
const getUniquePositionTokenCell = (tokens: IToken[]) => {
  const positionAndToken: Record<number, number> = {};

  for (let i = 0; i < tokens.length; i++) {
    const { positionTile } = tokens[i];
    const existValue = (positionAndToken[positionTile] ?? -1) >= 0;

    if (!existValue) {
      positionAndToken[positionTile] = tokens[i].index;
    }
  }

  return positionAndToken;
};

/**
 * Función que valida el incremento de celdas
 * @param positionTile
 */
const validateIncrementTokenMovement = (positionTile: number) => {
  let newPosition = positionTile + 1;

  if (newPosition >= TOTAL_TILES) {
    newPosition = 0;
  }

  return newPosition;
};

/**
 * Retorna la cantidad y los tokens que se encuentran en una celda
 * @param positionTile
 * @param tokens
 * @returns
 */
const getTotalTokensInCell = (positionTile: number, tokens: IToken[]) => {
  const tokensByPosition = tokens
    .filter((v) => v.positionTile === positionTile)
    .map((v) => v.index);

  const total = tokensByPosition.length;

  return { total, tokensByPosition };
};

/**
 * Dada la posición de una celda y el listado de tokens
 * @param positionTile
 * @param listTokens
 */
const getTotalTokensInNormalCell = (
  positionTile: number,
  listTokens: IListTokens[],
) => {
  let total = 0;
  const distribution: Record<number, number[]> = {};

  for (let i = 0; i < listTokens.length; i++) {
    const tokensInNormalCell = listTokens[i].tokens.filter(
      (v) => v.typeTile === EtypeTile.NORMAL,
    );

    const { total: newTotal, tokensByPosition } = getTotalTokensInCell(
      positionTile,
      tokensInNormalCell,
    );

    if (newTotal !== 0) {
      total += newTotal;
      distribution[i] = tokensByPosition;
    }
  }

  return { total, distribution };
};

/**
 * Válida si el número de celda es un ára segura...
 * @param positionTile
 * @returns
 */
const validateSafeArea = (positionTile: number) =>
  SAFE_AREAS.includes(positionTile);

/* ════════════════════════════════════════════════════════════════
   Master mode helpers
   কাজ:
   - Ludo STAR style kill-required home entry
   - kill না করা পর্যন্ত home lane locked থাকবে, token normal path ধরে আবার ঘুরবে
   - দুই token এক ঘরে থাকলে joint/double token wall হবে
   - joint token শুধু even dice দিয়ে dice/2 ঘর move করবে
   - safe/star cell-এ joint wall হিসেবে কাজ করবে না
   - joint wall-এর উপর নিজের/opponent কোনো single token বসবে না
════════════════════════════════════════════════════════════════ */
const isMasterMode = (gameMode?: TGameMode) => gameMode === EGameMode.MASTER;

const getPlayerKillCount = (players: IPlayer[], playerIndex: number) =>
  Number(players[playerIndex]?.killedTokensCount || 0);

const getSamePlayerTokensOnNormalCell = (
  listTokens: IListTokens[],
  playerIndex: number,
  positionTile: number,
) =>
  listTokens[playerIndex].tokens.filter(
    (token) =>
      token.typeTile === EtypeTile.NORMAL &&
      token.positionTile === positionTile,
  );

const getJointTokenIndexesAtCell = (
  listTokens: IListTokens[],
  playerIndex: number,
  positionTile: number,
): number[] => {
  if (validateSafeArea(positionTile)) return [];

  const sameCellTokens = getSamePlayerTokensOnNormalCell(
    listTokens,
    playerIndex,
    positionTile,
  );

  return sameCellTokens.length >= 2
    ? sameCellTokens.slice(0, 2).map((token) => token.index)
    : [];
};

const isTokenInJoint = (
  listTokens: IListTokens[],
  playerIndex: number,
  token: IToken,
) =>
  token.typeTile === EtypeTile.NORMAL &&
  getJointTokenIndexesAtCell(
    listTokens,
    playerIndex,
    token.positionTile,
  ).includes(token.index);

const getJointWallOnCell = (
  listTokens: IListTokens[],
  positionTile: number,
): { playerIndex: number; tokenIndexes: number[] } | null => {
  if (validateSafeArea(positionTile)) return null;

  for (let playerIndex = 0; playerIndex < listTokens.length; playerIndex++) {
    const tokenIndexes = getJointTokenIndexesAtCell(
      listTokens,
      playerIndex,
      positionTile,
    );

    if (tokenIndexes.length >= 2) {
      return { playerIndex, tokenIndexes };
    }
  }

  return null;
};

const getTokensCountByPlayerOnNormalCell = (
  listTokens: IListTokens[],
  positionTile: number,
): Record<number, number[]> => {
  const result: Record<number, number[]> = {};

  listTokens.forEach((playerTokens, playerIndex) => {
    playerTokens.tokens.forEach((token) => {
      if (token.typeTile !== EtypeTile.NORMAL) return;
      if (token.positionTile !== positionTile) return;

      result[playerIndex] = result[playerIndex] || [];
      result[playerIndex].push(token.index);
    });
  });

  return result;
};

const validateMasterTargetCell = ({
  currentTurn,
  isJointMove,
  listTokens,
  targetPositionTile,
}: {
  currentTurn: number;
  isJointMove: boolean;
  listTokens: IListTokens[];
  targetPositionTile: number;
}) => {
  if (validateSafeArea(targetPositionTile)) return true;

  const wall = getJointWallOnCell(listTokens, targetPositionTile);

  if (wall) {
    return Boolean(isJointMove && wall.playerIndex !== currentTurn);
  }

  const tokensByPlayer = getTokensCountByPlayerOnNormalCell(
    listTokens,
    targetPositionTile,
  );
  const ownTokens = tokensByPlayer[currentTurn] || [];
  const totalTokens = Object.values(tokensByPlayer).reduce(
    (total, tokenIndexes) => total + tokenIndexes.length,
    0,
  );

  if (totalTokens === 0) return true;

  /* ────────── Master no-three-token rule ──────────
     joint token নিজের/opponent single-এর উপর বসে ৩ token করতে পারবে না।
     নিজের single থাকলে joint move invalid হবে।
     opponent single থাকলে joint final cell-এ kill করবে, তাই ৩ token থাকবে না।
  ───────────────────────────────────────────────── */
  if (isJointMove) {
    if (ownTokens.length > 0) return false;
    return totalTokens === 1;
  }

  // single token নিজের ১টা token-এর সাথে joint হতে পারবে, কিন্তু ৩টা হবে না
  if (ownTokens.length === 1 && totalTokens === 1) return true;

  // single token opponent single kill করতে পারবে
  if (ownTokens.length === 0 && totalTokens === 1) return true;

  return false;
};

const getMasterMoveDistance = ({
  diceValue,
  isJointMove,
}: {
  diceValue: TDicevalues;
  isJointMove: boolean;
}): number => {
  if (!isJointMove) return diceValue;

  if (diceValue % 2 !== 0) return 0;

  return Math.floor(diceValue / 2) as 1 | 2 | 3;
};

const normalizeTokenCellDistribution = (listTokens: IListTokens[]) => {
  const copyListTokens = cloneDeep(listTokens);
  const nextTotalTokens: TShowTotalTokens = {};
  const normalCells: Record<
    number,
    Array<{ playerIndex: number; tokenIndex: number }>
  > = {};

  for (
    let playerIndex = 0;
    playerIndex < copyListTokens.length;
    playerIndex++
  ) {
    for (const token of copyListTokens[playerIndex].tokens) {
      token.totalTokens = 1;
      token.position = 1;
      token.isJointToken = false;

      if (token.typeTile === EtypeTile.NORMAL) {
        normalCells[token.positionTile] = normalCells[token.positionTile] || [];
        normalCells[token.positionTile].push({
          playerIndex,
          tokenIndex: token.index,
        });
      }
    }
  }

  Object.entries(normalCells).forEach(([positionTile, entries]) => {
    if (entries.length <= 1) return;

    entries.forEach((entry, index) => {
      copyListTokens[entry.playerIndex].tokens[entry.tokenIndex].totalTokens =
        entries.length;
      copyListTokens[entry.playerIndex].tokens[entry.tokenIndex].position =
        index + 1;
    });

    /* ────────── Master joint token mark ──────────
       একই player/color-এর ২টা token একই normal cell-এ থাকলে
       এগুলোকে joint/double হিসেবে mark করা হচ্ছে।
       Note: block/lock sign token-এর উপর না, home lane-এ দেখানো হয়।
    ─────────────────────────────────────────────── */
    const numericPositionTile = Number(positionTile);

    if (!validateSafeArea(numericPositionTile)) {
      const entriesByPlayer = entries.reduce<Record<number, number[]>>(
        (acc, entry) => {
          acc[entry.playerIndex] = acc[entry.playerIndex] || [];
          acc[entry.playerIndex].push(entry.tokenIndex);
          return acc;
        },
        {},
      );

      Object.entries(entriesByPlayer).forEach(([playerIndex, tokenIndexes]) => {
        if (tokenIndexes.length < 2) return;

        tokenIndexes.slice(0, 2).forEach((tokenIndex) => {
          copyListTokens[Number(playerIndex)].tokens[tokenIndex].isJointToken =
            true;
        });
      });
    }

    if (entries.length > MAXIMUM_VISIBLE_TOKENS_PER_CELL) {
      nextTotalTokens[Number(positionTile)] = entries.length;
    }
  });

  for (
    let playerIndex = 0;
    playerIndex < copyListTokens.length;
    playerIndex++
  ) {
    const exitCells: Record<number, number[]> = {};

    for (const token of copyListTokens[playerIndex].tokens) {
      if (token.typeTile !== EtypeTile.EXIT) continue;
      exitCells[token.positionTile] = exitCells[token.positionTile] || [];
      exitCells[token.positionTile].push(token.index);
    }

    Object.values(exitCells).forEach((tokenIndexes) => {
      if (tokenIndexes.length <= 1) return;

      tokenIndexes.forEach((tokenIndex, index) => {
        copyListTokens[playerIndex].tokens[tokenIndex].totalTokens =
          tokenIndexes.length;
        copyListTokens[playerIndex].tokens[tokenIndex].position = index + 1;
      });
    });
  }

  return { copyListTokens, nextTotalTokens };
};

const predictMasterNormalMove = ({
  currentTurn,
  diceValue,
  gameMode,
  isJointMove,
  listTokens,
  players,
  positionGame,
  positionTile,
}: {
  currentTurn: number;
  diceValue: TDicevalues;
  gameMode?: TGameMode;
  isJointMove: boolean;
  listTokens: IListTokens[];
  players: IPlayer[];
  positionGame: TPositionGame;
  positionTile: number;
}) => {
  const moveDistance = getMasterMoveDistance({ diceValue, isJointMove });

  if (moveDistance <= 0) {
    return {
      isValid: false,
      targetTypeTile: EtypeTile.NORMAL,
      targetPositionTile: positionTile,
    };
  }

  const { exitTileIndex } = POSITION_ELEMENTS_BOARD[positionGame];
  let newPositionTile = positionTile;
  let targetTypeTile: TtypeTile = EtypeTile.NORMAL;

  for (let i = 0; i < moveDistance; i++) {
    if (newPositionTile !== exitTileIndex) {
      newPositionTile = validateIncrementTokenMovement(newPositionTile);
      const wall = getJointWallOnCell(listTokens, newPositionTile);
      const isOwnMovingJointStart =
        wall?.playerIndex === currentTurn &&
        wall.tokenIndexes.every((tokenIndex) =>
          getJointTokenIndexesAtCell(
            listTokens,
            currentTurn,
            positionTile,
          ).includes(tokenIndex),
        );

      if (wall && !isOwnMovingJointStart) {
        const isFinalStep = i === moveDistance - 1;
        const canJointKillJoint =
          isMasterMode(gameMode) &&
          isJointMove &&
          isFinalStep &&
          wall.playerIndex !== currentTurn;

        if (!canJointKillJoint) {
          return {
            isValid: false,
            targetTypeTile: EtypeTile.NORMAL,
            targetPositionTile: newPositionTile,
          };
        }
      }

      continue;
    }

    /* ────────── Master locked home entry rule ──────────
       kill না হলে token home lane-এ ঢুকবে না।
       কিন্তু token থেমে থাকবে না; normal path ধরে আবার board ঘুরবে।
    ───────────────────────────────────────────────────── */
    if (
      isMasterMode(gameMode) &&
      getPlayerKillCount(players, currentTurn) <= 0
    ) {
      newPositionTile = validateIncrementTokenMovement(newPositionTile);

      const wall = getJointWallOnCell(listTokens, newPositionTile);

      if (wall) {
        return {
          isValid: false,
          targetTypeTile: EtypeTile.NORMAL,
          targetPositionTile: newPositionTile,
        };
      }

      continue;
    }

    const remainingCells = moveDistance - i;

    if (remainingCells <= 0 || remainingCells > TOTAL_EXIT_TILES) {
      return {
        isValid: false,
        targetTypeTile: EtypeTile.EXIT,
        targetPositionTile: 0,
      };
    }

    targetTypeTile = EtypeTile.EXIT;
    newPositionTile = remainingCells - 1;
    break;
  }

  if (
    isMasterMode(gameMode) &&
    targetTypeTile === EtypeTile.NORMAL &&
    !validateMasterTargetCell({
      currentTurn,
      isJointMove,
      listTokens,
      targetPositionTile: newPositionTile,
    })
  ) {
    return {
      isValid: false,
      targetTypeTile,
      targetPositionTile: newPositionTile,
    };
  }

  return { isValid: true, targetTypeTile, targetPositionTile: newPositionTile };
};

interface ValidateMovementTokenWithValueDice {
  currentTurn: number;
  diceValue: TDicevalues;
  gameMode?: TGameMode;
  isJointMove?: boolean;
  listTokens: IListTokens[];
  players: IPlayer[];
  positionGame: TPositionGame;
  positionTile: number;
}

/**
 * Función que valida si el valor de un dado para un token se puede usar
 * @param param0
 * @returns
 */
const validateMovementTokenWithValueDice = ({
  currentTurn,
  diceValue,
  gameMode,
  isJointMove = false,
  listTokens,
  players,
  positionGame,
  positionTile,
}: ValidateMovementTokenWithValueDice) => {
  const predictedMove = predictMasterNormalMove({
    currentTurn,
    diceValue,
    gameMode,
    isJointMove,
    listTokens,
    players,
    positionGame,
    positionTile,
  });

  if (!predictedMove.isValid) return false;

  if (predictedMove.targetTypeTile === EtypeTile.EXIT) return true;

  const targetPositionTile = predictedMove.targetPositionTile;
  const totalTokensInCell = getTotalTokensInNormalCell(
    targetPositionTile,
    listTokens,
  );

  if (
    isMasterMode(gameMode) &&
    predictedMove.targetTypeTile === EtypeTile.NORMAL
  ) {
    return validateMasterTargetCell({
      currentTurn,
      isJointMove,
      listTokens,
      targetPositionTile,
    });
  }

  if (totalTokensInCell.total >= 2 && !validateSafeArea(targetPositionTile)) {
    const tokensSameTurn = totalTokensInCell.distribution[currentTurn] ?? [];

    if (tokensSameTurn.length === 0 && !isJointMove) {
      return false;
    }
  }

  return true;
};

interface ValidateDiceForTokenMovement {
  currentTurn: number;
  listTokens: IListTokens[];
  diceList: IDiceList[];
  players: IPlayer[];
  gameMode?: TGameMode;
}

/**
 * Función que determina si con los valores de los dados
 * se podrá mover los tokens que se tienen disponibles
 * @param param0
 * @returns
 */
const validateDiceForTokenMovement = ({
  currentTurn,
  listTokens,
  diceList,
  players,
  gameMode,
}: ValidateDiceForTokenMovement) => {
  const copyListTokens = cloneDeep(listTokens);
  const { positionGame } = copyListTokens[currentTurn];
  const { JAIL, NORMAL, EXIT } = getTokensValueByCellType(
    copyListTokens[currentTurn],
  );

  const indexSixAvailable = diceList.findIndex(
    (v) => v.value === DICE_VALUE_GET_OUT_JAIL,
  );

  if (JAIL.length !== 0 && indexSixAvailable >= 0) {
    for (let i = 0; i < JAIL.length; i++) {
      const indexToken = JAIL[i].index;

      copyListTokens[currentTurn].tokens[indexToken].diceAvailable = [
        diceList[indexSixAvailable],
      ];
    }
  }

  [NORMAL, EXIT].forEach((tokensEvaluate, evaluatedIndex) => {
    if (tokensEvaluate.length !== 0) {
      const positionAndToken = getUniquePositionTokenCell(tokensEvaluate);

      for (let positionTile in positionAndToken) {
        const diceEvaluated: { diceValue: TDicevalues; isValid: boolean }[] =
          [];

        const diceAvailable: IDiceList[] = [];

        for (let i = 0; i < diceList.length; i++) {
          const { value: diceValue } = diceList[i];

          const evaluated = diceEvaluated.find(
            (v) => v.diceValue === diceValue,
          );

          let isValid = evaluated?.isValid ?? false;

          if (!evaluated) {
            if (evaluatedIndex === 0) {
              const tokenIndex = positionAndToken[positionTile];
              const token = copyListTokens[currentTurn].tokens[tokenIndex];
              const isJointMove =
                isMasterMode(gameMode) &&
                isTokenInJoint(copyListTokens, currentTurn, token);

              isValid = validateMovementTokenWithValueDice({
                currentTurn,
                diceValue,
                gameMode,
                isJointMove,
                listTokens,
                players,
                positionGame,
                positionTile: +positionTile,
              });
            } else {
              const remainingCells = TOTAL_EXIT_TILES - +positionTile - 1;
              isValid = diceValue <= remainingCells;

              if (
                isMasterMode(gameMode) &&
                getPlayerKillCount(players, currentTurn) <= 0
              ) {
                isValid = false;
              }
            }

            diceEvaluated.push({ diceValue, isValid });
          }

          if (isValid) {
            diceAvailable.push(diceList[i]);
          }
        }

        if (diceAvailable.length !== 0) {
          let finalDiceAvailable = diceAvailable;

          if (finalDiceAvailable.length >= 2) {
            const firstDice = finalDiceAvailable[0];

            const isSameDice = finalDiceAvailable.every(
              (v) => v.value === firstDice.value,
            );

            if (isSameDice) {
              finalDiceAvailable = [firstDice];
            }
          }

          const indexToken = positionAndToken[positionTile];
          const token = copyListTokens[currentTurn].tokens[indexToken];

          if (
            isMasterMode(gameMode) &&
            isTokenInJoint(copyListTokens, currentTurn, token)
          ) {
            finalDiceAvailable = finalDiceAvailable.filter(
              (dice) => dice.value % 2 === 0,
            );
          }

          if (finalDiceAvailable.length !== 0) {
            copyListTokens[currentTurn].tokens[indexToken].diceAvailable =
              finalDiceAvailable;
          }
        }
      }
    }
  });

  const totalTokensCanMove = copyListTokens[currentTurn].tokens.filter(
    (v) => v.diceAvailable.length !== 0,
  );

  let moveAutomatically = false;
  let tokenIndex = 0;
  let diceIndex = 0;
  const canMoveTokens = totalTokensCanMove.length !== 0;

  if (totalTokensCanMove.length === 1) {
    const token = totalTokensCanMove[0];
    const diceAvailable = token.diceAvailable;

    tokenIndex = token.index;

    if (diceAvailable.length === 1) {
      moveAutomatically = true;
      diceIndex = getDiceIndexSelected(diceList, diceAvailable[0].key);
    }

    if (diceAvailable.length >= 2) {
      copyListTokens[currentTurn].tokens[tokenIndex].enableTooltip = true;
    }
  }

  return {
    canMoveTokens,
    moveAutomatically,
    tokenIndex,
    diceIndex,
    copyListTokens,
  };
};

interface ValidateTokenDistributionCell {
  token: IToken;
  listTokens: IListTokens[];
  currentTurn: number;
  totalTokens: TShowTotalTokens;
  removeTokenFromCell: boolean;
  setTotalTokens: React.Dispatch<React.SetStateAction<TShowTotalTokens>>;
}

/**
 * Función que valida la distribución de los tokens
 * @param param0
 * @returns
 */
const validateTokenDistributionCell = ({
  token,
  listTokens,
  currentTurn,
  totalTokens,
  removeTokenFromCell = true,
  setTotalTokens,
}: ValidateTokenDistributionCell) => {
  const copyListTokens = cloneDeep(listTokens);
  const positionTile = token.positionTile || 0;
  const totalTokensRemove = removeTokenFromCell ? 1 : 0;

  if (token.typeTile === EtypeTile.NORMAL) {
    const totalTokensInCell = getTotalTokensInNormalCell(
      positionTile,
      copyListTokens,
    );

    if (totalTokensInCell.total >= 2) {
      const totalTokensRemain = totalTokensInCell.total - totalTokensRemove;
      let position = 1;

      for (let playerIndex in totalTokensInCell.distribution) {
        for (let index of totalTokensInCell.distribution[playerIndex]) {
          const evaluateIndex = removeTokenFromCell
            ? +playerIndex === currentTurn
              ? index !== token.index
              : true
            : true;

          if (evaluateIndex) {
            copyListTokens[playerIndex].tokens[index].totalTokens =
              totalTokensRemain;
            copyListTokens[playerIndex].tokens[index].position = position;
            position++;
          }
        }
      }

      if (totalTokensInCell.total > MAXIMUM_VISIBLE_TOKENS_PER_CELL) {
        const copyTotalTokens = cloneDeep(totalTokens);

        if (totalTokensRemain > MAXIMUM_VISIBLE_TOKENS_PER_CELL) {
          copyTotalTokens[positionTile] = totalTokensRemain;
        } else if (copyTotalTokens[positionTile]) {
          delete copyTotalTokens[positionTile];
        }

        setTotalTokens(copyTotalTokens);
      }
    }
  }

  if (token.typeTile === EtypeTile.EXIT) {
    const { EXIT } = getTokensValueByCellType(copyListTokens[currentTurn]);
    const totalTokensInCell = getTotalTokensInCell(positionTile, EXIT);

    if (totalTokensInCell.total >= 2) {
      const totalTokensRemain = totalTokensInCell.total - totalTokensRemove;
      let position = 1;

      for (let index of totalTokensInCell.tokensByPosition) {
        if (index !== token.index || !removeTokenFromCell) {
          copyListTokens[currentTurn].tokens[index].totalTokens =
            totalTokensRemain;
          copyListTokens[currentTurn].tokens[index].position = position;
          position++;
        }
      }
    }
  }

  return copyListTokens;
};

interface ValidatePlayerRankingGameOver {
  players: IPlayer[];
  ranking: number;
  playSound: (type: IESounds) => void;
  setIsGameOver: React.Dispatch<React.SetStateAction<IGameOver>>;
}

/**
 * Valida la posición del ranking de los jugadores que quedan...
 * @param param0
 */
const validatePlayerRankingGameOver = ({
  players,
  ranking,
  playSound,
  setIsGameOver,
}: ValidatePlayerRankingGameOver) => {
  const copyPlayers = cloneDeep(players);

  setIsGameOver({ showModal: false, gameOver: true });
  playSound(ESounds.GAMER_OVER);

  const onlinePlayersNotFinished = copyPlayers.filter(
    (v) => !v.isOffline && !v.finished,
  );

  const offlinePlayers = copyPlayers.filter((v) => v.isOffline && !v.finished);
  const playersLeftRanking = [...onlinePlayersNotFinished, ...offlinePlayers];

  for (let player of playersLeftRanking) {
    ranking++;
    copyPlayers[player.index].finished = true;
    copyPlayers[player.index].ranking = ranking;
  }

  return copyPlayers;
};

interface NextStepGame {
  type: IENextStepGame;
  actionsTurn: IActionsTurn;
  currentTurn: number;
  players: IPlayer[];
  currentUserId?: string;
  setActionsTurn: React.Dispatch<React.SetStateAction<IActionsTurn>>;
  setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Función que valida el siguiente paso a seguir en el juego...
 */
export const nextStepGame = ({
  type,
  actionsTurn,
  currentTurn,
  players,
  currentUserId,
  setActionsTurn,
  setCurrentTurn,
}: NextStepGame) => {
  const rollDiceAgain = type === ENextStepGame.ROLL_DICE_AGAIN;
  const moveTokensAgain = type === ENextStepGame.MOVE_TOKENS_AGAIN;
  const goNextTurn = type === ENextStepGame.NEXT_TURN;

  if (rollDiceAgain || moveTokensAgain) {
    const copyActionsTurn = cloneDeep(actionsTurn);

    copyActionsTurn.disabledDice = rollDiceAgain
      ? validateDisabledDice(currentTurn, players, currentUserId)
      : true;

    copyActionsTurn.showDice = rollDiceAgain;
    copyActionsTurn.timerActivated = true;
    copyActionsTurn.isDisabledUI = false;
    copyActionsTurn.actionsBoardGame =
      EActionsBoardGame[rollDiceAgain ? "ROLL_DICE" : "SELECT_TOKEN"];

    setActionsTurn(copyActionsTurn);
  } else {
    if (goNextTurn) {
      validateNextTurn({
        currentTurn,
        players,
        currentUserId,
        setActionsTurn,
        setCurrentTurn,
      });
    }
  }
};

/* ────────── fixed player data init ────────── */
export const getInitialDataPlayers = (
  users: IUser[],
  boardColor: TBoardColors,
  totalPlayers: TTotalPlayers,
  forcePlayerColors?: (TColors | undefined)[],
) => {
  const players: IPlayer[] = [];
  const playersColors = getPlayersColorsResolved(
    users,
    boardColor,
    totalPlayers,
  );

  for (let i = 0; i < totalPlayers; i++) {
    players.push({
      ...(users[i] || {}),
      index: i,
      color: (forcePlayerColors?.[i] || playersColors[i]) as TColors,
      finished: false,
      isOffline: false,
      isMuted: false,
      chatMessage: "",
      counterMessage: 0,
      killedTokensCount: 0,
      ranking: 0,
    } as IPlayer);
  }

  return players;
};

/* ────────── initial turn state ────────── */
export const getInitialActionsTurnValue = (
  indexTurn: number,
  players: IPlayer[],
  currentUserId?: string,
): IActionsTurn => ({
  timerActivated: true,
  disabledDice: validateDisabledDice(indexTurn, players, currentUserId),
  showDice: true,
  diceValue: 0,
  diceList: [],
  diceRollNumber: 0,
  sixRollStreak: 0,
  isDisabledUI: false,
  actionsBoardGame: EActionsBoardGame.ROLL_DICE,
});

/**
 * Función que devuelve el valor aleatorio de un dado...
 * @returns
 */
export const randomValueDice = () => randomNumber(1, 6) as TDicevalues;

const getTokenProgressScore = (token: IToken) => {
  if (token.typeTile === EtypeTile.END) {
    return 1000 + token.index;
  }

  if (token.typeTile === EtypeTile.EXIT) {
    return 500 + token.positionTile;
  }

  if (token.typeTile === EtypeTile.NORMAL) {
    return 100 + token.positionTile;
  }

  return 0;
};

const incrementBoardPosition = (positionTile: number) => {
  const newPosition = positionTile + 1;

  if (newPosition >= TOTAL_TILES) {
    return 0;
  }

  return newPosition;
};

const getPredictedTokenState = (
  token: IToken,
  diceValue: TDicevalues,
  positionGame: TPositionGame,
) => {
  const { exitTileIndex, startTileIndex } =
    POSITION_ELEMENTS_BOARD[positionGame];
  let { typeTile, positionTile } = token;
  const valid = true;

  if (typeTile === EtypeTile.JAIL) {
    if (diceValue !== DICE_VALUE_GET_OUT_JAIL) {
      return {
        valid: false,
        typeTile,
        positionTile,
        progress: getTokenProgressScore(token),
      };
    }

    typeTile = EtypeTile.NORMAL;
    positionTile = startTileIndex;

    return {
      valid: true,
      typeTile,
      positionTile,
      progress: 100 + positionTile,
    };
  }

  if (typeTile === EtypeTile.EXIT) {
    const remainingCells = TOTAL_EXIT_TILES - positionTile - 1;

    if (diceValue > remainingCells) {
      return {
        valid: false,
        typeTile,
        positionTile,
        progress: getTokenProgressScore(token),
      };
    }
  }

  for (let i = 0; i < diceValue; i++) {
    if (typeTile === EtypeTile.NORMAL) {
      if (positionTile !== exitTileIndex) {
        positionTile = incrementBoardPosition(positionTile);
      } else {
        typeTile = EtypeTile.EXIT;
        positionTile = 0;
      }
      continue;
    }

    if (typeTile === EtypeTile.EXIT) {
      positionTile = positionTile + 1;

      if (positionTile === TOTAL_EXIT_TILES - 1) {
        typeTile = EtypeTile.END;
        positionTile = token.index;
        break;
      }
    }
  }

  return {
    valid,
    typeTile,
    positionTile,
    progress:
      typeTile === EtypeTile.END
        ? 1000 + token.index
        : typeTile === EtypeTile.EXIT
          ? 500 + positionTile
          : 100 + positionTile,
  };
};

const getOpponentTokensOnTile = (
  currentTurn: number,
  listTokens: IListTokens[],
  positionTile: number,
) =>
  listTokens
    .filter((_, index) => index !== currentTurn)
    .flatMap((player) => player.tokens)
    .filter(
      (token) =>
        token.typeTile === EtypeTile.NORMAL &&
        token.positionTile === positionTile,
    );

const getBoardDistance = (from: number, to: number) => {
  if (to >= from) return to - from;
  return TOTAL_TILES - from + to;
};

const getCaptureThreatCount = (
  currentTurn: number,
  listTokens: IListTokens[],
  positionTile: number,
) => {
  if (validateSafeArea(positionTile)) return 0;

  return listTokens
    .filter((_, index) => index !== currentTurn)
    .flatMap((player) => player.tokens)
    .filter((token) => token.typeTile === EtypeTile.NORMAL)
    .reduce((total, token) => {
      const distance = getBoardDistance(token.positionTile, positionTile);
      return distance >= 1 && distance <= 6 ? total + 1 : total;
    }, 0);
};

const getUnsafeTokens = (currentTurn: number, listTokens: IListTokens[]) =>
  listTokens[currentTurn].tokens.filter(
    (token) =>
      token.typeTile === EtypeTile.NORMAL &&
      !validateSafeArea(token.positionTile) &&
      getCaptureThreatCount(currentTurn, listTokens, token.positionTile) > 0,
  );

const weightedPick = <T>(
  items: Array<{ item: T; weight: number }>,
  fallback: T,
): T => {
  const totalWeight = items.reduce(
    (sum, entry) => sum + Math.max(0, entry.weight),
    0,
  );

  if (totalWeight <= 0) {
    return fallback;
  }

  let target = Math.random() * totalWeight;

  for (const entry of items) {
    target -= Math.max(0, entry.weight);
    if (target <= 0) {
      return entry.item;
    }
  }

  return items[items.length - 1]?.item ?? fallback;
};

const getBestControlledMove = (
  currentTurn: number,
  listTokens: IListTokens[],
  diceList: IDiceList[],
  favoredBotIndex: number,
  mode: TOfflineBotMode = "EASY",
) => {
  const playerTokens = listTokens[currentTurn];
  const tokensCanMove = playerTokens.tokens.filter(
    (token) => token.diceAvailable.length !== 0,
  );

  if (tokensCanMove.length === 0) {
    return null;
  }

  const isFavoredBot = currentTurn === favoredBotIndex;
  const { positionGame } = playerTokens;
  const rankedMoves: Array<{
    tokenIndex: number;
    diceKey: number;
    score: number;
  }> = [];
  const unsafeTokens = getUnsafeTokens(currentTurn, listTokens);

  for (const token of tokensCanMove) {
    for (const dice of token.diceAvailable) {
      const predicted = getPredictedTokenState(token, dice.value, positionGame);

      if (!predicted.valid) continue;

      let score = predicted.progress;
      const currentThreat =
        token.typeTile === EtypeTile.NORMAL &&
        !validateSafeArea(token.positionTile)
          ? getCaptureThreatCount(currentTurn, listTokens, token.positionTile)
          : 0;
      const nextThreat =
        predicted.typeTile === EtypeTile.NORMAL &&
        !validateSafeArea(predicted.positionTile)
          ? getCaptureThreatCount(
              currentTurn,
              listTokens,
              predicted.positionTile,
            )
          : 0;
      const opponentsOnLanding =
        predicted.typeTile === EtypeTile.NORMAL
          ? getOpponentTokensOnTile(
              currentTurn,
              listTokens,
              predicted.positionTile,
            )
          : [];
      const captureChance =
        predicted.typeTile === EtypeTile.NORMAL &&
        !validateSafeArea(predicted.positionTile) &&
        opponentsOnLanding.length > 0;
      const movesUnsafeToken = unsafeTokens.some(
        (unsafeToken) => unsafeToken.index === token.index,
      );
      const reachesSafeArea =
        predicted.typeTile === EtypeTile.NORMAL &&
        validateSafeArea(predicted.positionTile);
      const reducesThreat = currentThreat > 0 && nextThreat < currentThreat;

      if (
        token.typeTile === EtypeTile.JAIL &&
        dice.value === DICE_VALUE_GET_OUT_JAIL
      ) {
        score += isFavoredBot ? 180 : 80;
      }

      if (predicted.typeTile === EtypeTile.END) {
        score += 1500;
      }

      if (predicted.typeTile === EtypeTile.EXIT) {
        score += 350;
      }

      if (mode === "EASY") {
        if (reachesSafeArea) {
          score += movesUnsafeToken ? 2050 : 260;
        }

        if (reducesThreat) {
          score += 980 + (currentThreat - nextThreat) * 180;
        }

        if (captureChance) {
          score += 1320 + opponentsOnLanding.length * 120;
        }

        if (
          movesUnsafeToken &&
          !captureChance &&
          !reachesSafeArea &&
          nextThreat > 0
        ) {
          score -= 320 + nextThreat * 90;
        }
      } else {
        if (captureChance) {
          score += 1600 + opponentsOnLanding.length * 120;
        }

        if (reachesSafeArea) {
          score += movesUnsafeToken ? 1150 : 180;
        }

        if (reducesThreat) {
          score += 520 + (currentThreat - nextThreat) * 140;
        }

        if (
          movesUnsafeToken &&
          !captureChance &&
          !reachesSafeArea &&
          nextThreat > 0
        ) {
          score -= 260 + nextThreat * 80;
        }
      }

      if (
        predicted.typeTile === EtypeTile.NORMAL &&
        validateSafeArea(predicted.positionTile)
      ) {
        score += 80;
      }

      if (
        predicted.typeTile === EtypeTile.NORMAL &&
        !captureChance &&
        nextThreat > 0
      ) {
        score -= nextThreat * (mode === "ASSIST" && isFavoredBot ? 35 : 55);
      }

      if (unsafeTokens.length > 0 && !movesUnsafeToken && !captureChance) {
        score -= mode === "EASY" ? 360 : 180;
      }

      if (mode === "ASSIST" && isFavoredBot) {
        score += dice.value * 18;
      } else {
        score += dice.value * 8;
      }

      rankedMoves.push({ tokenIndex: token.index, diceKey: dice.key, score });
    }
  }

  if (rankedMoves.length === 0) {
    return null;
  }

  rankedMoves.sort((a, b) => b.score - a.score);

  if (mode === "ASSIST") {
    if (isFavoredBot) {
      const topMoves = rankedMoves.slice(0, Math.min(3, rankedMoves.length));
      return weightedPick(
        topMoves.map((move) => ({
          item: move,
          weight: Math.max(
            1,
            move.score - topMoves[topMoves.length - 1].score + 1,
          ),
        })),
        rankedMoves[0],
      );
    }

    const saferMoves = rankedMoves.slice(0, Math.min(2, rankedMoves.length));
    return weightedPick(
      saferMoves.map((move, index) => ({
        item: move,
        weight: index === 0 ? 3 : 1,
      })),
      rankedMoves[0],
    );
  }

  return rankedMoves[0];
};

export const getOfflineWeightedDice = ({
  actionsTurn,
  currentTurn,
  listTokens,
  players,
  favoredBotIndex,
  gameMode,
  currentRollCount = 0,
  assistOpeningDelay = 2,
}: {
  actionsTurn: IActionsTurn;
  currentTurn: number;
  listTokens: IListTokens[];
  players: IPlayer[];
  favoredBotIndex: number;
  gameMode?: TGameMode;
  currentRollCount?: number;
  assistOpeningDelay?: number;
}): TDicevalues => {
  // console.log("actionsTurn", actionsTurn);
  const currentTokens = listTokens[currentTurn];
  const usedValues = actionsTurn.diceList.map((dice) => dice.value);
  const sixesInRow = usedValues.every(
    (value) => value === DICE_VALUE_GET_OUT_JAIL,
  )
    ? usedValues.length
    : 0;
  const isFavoredBot = currentTurn === favoredBotIndex;
  const candidateValues: TDicevalues[] = [1, 2, 3, 4, 5, 6];
  const allTokensInJail = currentTokens.tokens.every(
    (token) => token.typeTile === EtypeTile.JAIL,
  );
  const holdOpeningSix =
    isFavoredBot &&
    allTokensInJail &&
    currentRollCount < Math.max(1, assistOpeningDelay - 1);
  const safeCandidates = candidateValues.filter((value) => {
    if (value === DICE_VALUE_GET_OUT_JAIL && sixesInRow >= 2) {
      return false;
    }

    if (holdOpeningSix && value === DICE_VALUE_GET_OUT_JAIL) {
      return false;
    }

    return true;
  });

  const weightedCandidates = safeCandidates.map((value) => {
    const diceList = [{ key: Number(value), value }];
    const evaluated = validateDiceForTokenMovement({
      currentTurn,
      listTokens,
      diceList,
      players,
      gameMode,
    });

    if (!evaluated.canMoveTokens) {
      return { item: value, weight: isFavoredBot ? 0.25 : 0.15 };
    }

    const bestMove = getBestControlledMove(
      currentTurn,
      evaluated.copyListTokens,
      diceList,
      favoredBotIndex,
      "ASSIST",
    );

    let weight = 1;

    if (bestMove) {
      weight += Math.max(0, bestMove.score) / (isFavoredBot ? 55 : 110);
    }

    if (
      currentTokens.tokens.some(
        (token) => token.typeTile === EtypeTile.JAIL && value === 6,
      )
    ) {
      const isDelayedOpeningTrigger =
        isFavoredBot &&
        allTokensInJail &&
        currentRollCount === Math.max(1, assistOpeningDelay - 1);

      weight += isFavoredBot ? 2.4 : 0.8;

      if (isDelayedOpeningTrigger) {
        weight += 7;
      }
    }

    if (!isFavoredBot) {
      weight *= value >= 5 ? 0.65 : 1;
    }

    const repeatedCount = usedValues.filter((used) => used === value).length;
    if (repeatedCount > 0) {
      weight *= 1 / (repeatedCount + 0.35);
    }

    return { item: value, weight };
  });

  const fallback = isFavoredBot ? 4 : (randomNumber(1, 6) as TDicevalues);
  return weightedPick(weightedCandidates, fallback);
};

/* ────────── smart balance dice ────────── */
const getPlayerProgressScore = (tokens: IToken[]) =>
  tokens.reduce((total, token) => {
    if (token.typeTile === EtypeTile.JAIL) return total;
    if (token.typeTile === EtypeTile.END) return total + 65;
    return total + Math.max(1, token.position + 1);
  }, 0);

export const getSmartBalancedDice = ({
  actionsTurn,
  currentTurn,
  listTokens,
  players,
  botIndex,
  gameMode,
}: {
  actionsTurn: IActionsTurn;
  currentTurn: number;
  listTokens: IListTokens[];
  players: IPlayer[];
  botIndex: number;
  gameMode?: TGameMode;
}): TDicevalues => {
  const usedValues = actionsTurn.diceList.map((dice) => dice.value);
  const consecutiveSixes = usedValues.every((value) => value === 6)
    ? usedValues.length
    : 0;
  const humanIndex = players.findIndex(
    (player, index) => !player.isBot && index !== botIndex,
  );
  const isBotTurn = currentTurn === botIndex;
  const botProgress = getPlayerProgressScore(
    listTokens[botIndex]?.tokens || [],
  );
  const humanProgress = getPlayerProgressScore(
    listTokens[humanIndex]?.tokens || [],
  );
  const lead = botProgress - humanProgress;
  const currentTokens = listTokens[currentTurn]?.tokens || [];
  const allInJail = currentTokens.every(
    (token) => token.typeTile === EtypeTile.JAIL,
  );
  const candidates: TDicevalues[] = [1, 2, 3, 4, 5, 6];

  const weighted = candidates
    .filter((value) => !(value === 6 && consecutiveSixes >= 2))
    .map((value) => {
      let weight = 1;
      const diceList = [{ key: Number(value), value }];
      const evaluated = validateDiceForTokenMovement({
        currentTurn,
        listTokens,
        diceList,
        players,
        gameMode,
      });

      if (!evaluated.canMoveTokens) weight *= 0.55;
      if (allInJail && value === 6) weight += 0.9;

      if (isBotTurn) {
        /* Bot এগিয়ে থাকলে dice পুরোপুরি natural-এর কাছাকাছি থাকে। */
        if (lead > 35) weight *= value >= 5 ? 0.7 : 1.08;
        if (lead > 70) weight *= value === 6 ? 0.45 : 1.05;

        const bestMove = getBestControlledMove(
          currentTurn,
          evaluated.copyListTokens,
          diceList,
          botIndex,
          "ASSIST",
        );
        if (bestMove && lead < 35) {
          weight += Math.min(1.25, Math.max(0, bestMove.score) / 180);
        }
      } else {
        /* Human অনেক পিছিয়ে গেলে guaranteed result নয়, শুধু soft catch-up chance। */
        if (lead > 25) weight *= value >= 5 ? 1.25 : 0.95;
        if (lead > 55 && value === 6) weight += 1.15;
        if (lead < -35) weight *= value === 6 ? 0.75 : 1.05;
      }

      const repeatedCount = usedValues.filter((used) => used === value).length;
      if (repeatedCount > 0) weight *= 1 / (1 + repeatedCount * 0.45);

      return { item: value, weight: Math.max(0.05, weight) };
    });

  return weightedPick(weighted, randomNumber(1, 6) as TDicevalues);
};

export const getOfflineControlledTokenSelection = (
  currentTurn: number,
  listTokens: IListTokens[],
  diceList: IDiceList[],
  favoredBotIndex: number,
  mode: TOfflineBotMode = "EASY",
) => {
  const bestMove = getBestControlledMove(
    currentTurn,
    listTokens,
    diceList,
    favoredBotIndex,
    mode === "SMART" ? "ASSIST" : mode,
  );

  if (!bestMove) {
    return validateSelectTokenRandomly(currentTurn, listTokens, diceList);
  }

  return {
    tokenIndex: bestMove.tokenIndex,
    diceIndex: getDiceIndexSelected(diceList, bestMove.diceKey),
  };
};

/**
 * Obtiene un valor aleatorio del dado
 * @param actionsTurn
 * @param diceValue
 * @returns
 */
export const getRandomValueDice = (
  actionsTurn: IActionsTurn,
  diceValue?: TDicevalues,
) => {
  const copyActionsTurn = cloneDeep(actionsTurn);

  copyActionsTurn.diceValue = diceValue || randomValueDice();
  copyActionsTurn.timerActivated = false;
  copyActionsTurn.disabledDice = true;

  const diceRollNumber = copyActionsTurn.diceRollNumber;
  const newDiceRollNumber = diceRollNumber + 1 >= 10 ? 1 : diceRollNumber + 1;
  copyActionsTurn.diceRollNumber = newDiceRollNumber;

  return copyActionsTurn;
};

/* ────────── fixed token init ────────── */
export const getInitialPositionTokens = (
  boardColor: TBoardColors,
  totalPlayers: TTotalPlayers,
  players: IPlayer[],
  currentUserId?: string,
) => {
  const fallbackColors = getPlayersColors(boardColor, totalPlayers);
  const fallbackPositions = getTokensPositionsOnBoard(totalPlayers);
  const listTokens: IListTokens[] = [];

  for (let i = 0; i < totalPlayers; i++) {
    const { isBot = false, isOnline = false, id } = players[i];
    const isCurrentOnlineUser = !!currentUserId && id === currentUserId;
    const canSelectToken = isOnline ? isCurrentOnlineUser : !isBot;

    const color = (players[i].color || fallbackColors[i]) as TColors;
    const positionGame = getPositionGameByColor(
      color,
      boardColor,
      fallbackPositions[i],
    );

    const tokens: IToken[] = getTokensInJail(
      positionGame,
      color,
      canSelectToken,
    );

    listTokens.push({ index: i, positionGame, tokens });
  }

  return listTokens;
};

interface ValidateDicesForTokens {
  actionsTurn: IActionsTurn;
  currentTurn: number;
  gameMode?: TGameMode;
  listTokens: IListTokens[];
  players: IPlayer[];
  totalTokens: TShowTotalTokens;
  currentUserId?: string;
  playSound: (type: IESounds) => void;
  setActionsMoveToken: React.Dispatch<React.SetStateAction<IActionsMoveToken>>;
  setActionsTurn: React.Dispatch<React.SetStateAction<IActionsTurn>>;
  setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
  setListTokens: React.Dispatch<React.SetStateAction<IListTokens[]>>;
  setTotalTokens: React.Dispatch<React.SetStateAction<TShowTotalTokens>>;
}

/**
 * Validar el valor de los dados para los tokens del jugador que tenga el turno
 * @param param0
 * @returns
 */
export const validateDicesForTokens = ({
  actionsTurn,
  currentTurn,
  gameMode,
  listTokens,
  players,
  totalTokens,
  currentUserId,
  playSound,
  setActionsMoveToken,
  setActionsTurn,
  setCurrentTurn,
  setListTokens,
  setTotalTokens,
}: ValidateDicesForTokens) => {
  const copyActionsTurn = cloneDeep(actionsTurn);
  const diceValue = copyActionsTurn.diceValue as TDicevalues;

  copyActionsTurn.diceList.push({
    key: Math.random(),
    value: diceValue,
  });

  const newTotalDicesAvailable = copyActionsTurn.diceList.length;

  /* ────────── consecutive six count ──────────
     diceList-এ kill/extra chance-এর আগের unused dice থাকতে পারে।
     তাই শুধু real roll sequence ধরে six streak count করা হচ্ছে।
  ───────────────────────────────────────────── */
  copyActionsTurn.sixRollStreak =
    diceValue === DICE_VALUE_GET_OUT_JAIL
      ? Number(copyActionsTurn.sixRollStreak || 0) + 1
      : 0;

  const isThreeRolls = validateThreeConsecutiveRolls(
    copyActionsTurn.sixRollStreak,
  );

  if (diceValue === DICE_VALUE_GET_OUT_JAIL) {
    playSound(ESounds.GET_SIX);
  }

  if (isThreeRolls) {
    /* ────────── 3 Six Cancel Rule ──────────
       লাগাতার ৩টা ৬ হলে শুধু এই শেষের ৩টা ৬ cancel হবে।
       আগের valid dice যেমন ৬, ৬, ২ থেকে থাকা ৬, ৬ নষ্ট হবে না।
       যদি আগের dice বাকি থাকে তাহলে turn যাবে না, আগে ওই dice দিয়ে move করতে পারবে।
    ───────────────────────────────────────── */
    copyActionsTurn.diceList = copyActionsTurn.diceList.slice(0, -3);
    copyActionsTurn.sixRollStreak = 0;

    if (copyActionsTurn.diceList.length !== 0) {
      const {
        canMoveTokens,
        copyListTokens,
        moveAutomatically,
        tokenIndex,
        diceIndex,
      } = validateDiceForTokenMovement({
        currentTurn,
        listTokens,
        diceList: copyActionsTurn.diceList,
        players,
        gameMode,
      });

      if (moveAutomatically) {
        return validateSelectToken({
          actionsTurn: copyActionsTurn,
          currentTurn,
          diceIndex,
          gameMode,
          listTokens: copyListTokens,
          tokenIndex,
          totalTokens,
          setActionsMoveToken,
          setActionsTurn,
          setTotalTokens,
          setListTokens,
        });
      }

      if (canMoveTokens) {
        copyActionsTurn.timerActivated = true;
        copyActionsTurn.disabledDice = true;
        copyActionsTurn.showDice = false;
        copyActionsTurn.actionsBoardGame = EActionsBoardGame.SELECT_TOKEN;

        setActionsTurn(copyActionsTurn);
        return setListTokens(copyListTokens);
      }
    }

    return validateNextTurn({
      currentTurn,
      players,
      currentUserId,
      addDelayNextTurn: true,
      setActionsTurn,
      setCurrentTurn,
    });
  }

  const { JAIL, NORMAL } = getTokensValueByCellType(listTokens[currentTurn]);
  const totalTokensNormalJailCells = JAIL.length + NORMAL.length;

  if (
    diceValue === DICE_VALUE_GET_OUT_JAIL &&
    totalTokensNormalJailCells > 0 &&
    newTotalDicesAvailable < MAXIMUM_DICE_PER_TURN
  ) {
    copyActionsTurn.timerActivated = true;
    copyActionsTurn.disabledDice = validateDisabledDice(
      currentTurn,
      players,
      currentUserId,
    );
    copyActionsTurn.actionsBoardGame = EActionsBoardGame.ROLL_DICE;
    return setActionsTurn(copyActionsTurn);
  }

  const {
    canMoveTokens,
    copyListTokens,
    moveAutomatically,
    tokenIndex,
    diceIndex,
  } = validateDiceForTokenMovement({
    currentTurn,
    listTokens,
    diceList: copyActionsTurn.diceList,
    players,
    gameMode,
  });

  if (moveAutomatically) {
    return validateSelectToken({
      actionsTurn: copyActionsTurn,
      currentTurn,
      diceIndex,
      gameMode,
      listTokens: copyListTokens,
      tokenIndex,
      totalTokens,
      setActionsMoveToken,
      setActionsTurn,
      setTotalTokens,
      setListTokens,
    });
  }

  if (canMoveTokens) {
    copyActionsTurn.timerActivated = true;
    copyActionsTurn.disabledDice = true;
    copyActionsTurn.showDice = false;
    copyActionsTurn.actionsBoardGame = EActionsBoardGame.SELECT_TOKEN;
    setActionsTurn(copyActionsTurn);

    return setListTokens(copyListTokens);
  }

  validateNextTurn({
    currentTurn,
    players,
    currentUserId,
    addDelayNextTurn: true,
    setActionsTurn,
    setCurrentTurn,
  });
};

interface ValidateSelectToken {
  actionsTurn: IActionsTurn;
  currentTurn: number;
  diceIndex: number;
  gameMode?: TGameMode;
  listTokens: IListTokens[];
  tokenIndex: number;
  totalTokens: TShowTotalTokens;
  setActionsMoveToken: React.Dispatch<React.SetStateAction<IActionsMoveToken>>;
  setActionsTurn: React.Dispatch<React.SetStateAction<IActionsTurn>>;
  setTotalTokens: React.Dispatch<React.SetStateAction<TShowTotalTokens>>;
  setListTokens: React.Dispatch<React.SetStateAction<IListTokens[]>>;
}

/**
 * Función que valida la selección de un token...
 * @param param0
 */
export const validateSelectToken = ({
  actionsTurn,
  currentTurn,
  diceIndex,
  gameMode,
  listTokens,
  tokenIndex,
  totalTokens,
  setActionsMoveToken,
  setActionsTurn,
  setTotalTokens,
  setListTokens,
}: ValidateSelectToken) => {
  const copyActionsTurn = cloneDeep(actionsTurn);
  let totalCellsMove: number = copyActionsTurn.diceList[diceIndex].value;

  copyActionsTurn.diceList.splice(diceIndex, 1);
  copyActionsTurn.disabledDice = true;
  copyActionsTurn.showDice = false;
  copyActionsTurn.timerActivated = false;

  setActionsTurn(copyActionsTurn);

  let copyListTokens = cloneDeep(listTokens);
  const tokenSelected = copyListTokens[currentTurn].tokens[tokenIndex];

  /* ────────── Master joint token selection ──────────
     একই ঘরে নিজের ২টা token থাকলে এটাকে joint/double ধরা হচ্ছে।
     even dice হলে dice/2 ঘর দুই token একসাথে move করবে।
  ─────────────────────────────────────────────────── */
  const jointTokenIndexes = isMasterMode(gameMode)
    ? getJointTokenIndexesAtCell(
        copyListTokens,
        currentTurn,
        tokenSelected.positionTile,
      )
    : [];
  const isJointMove =
    tokenSelected.typeTile === EtypeTile.NORMAL &&
    jointTokenIndexes.includes(tokenIndex);
  const movingTokenIndexes = isJointMove ? jointTokenIndexes : [tokenIndex];

  for (let i = 0; i < copyListTokens[currentTurn].tokens.length; i++) {
    if (copyListTokens[currentTurn].tokens[i].diceAvailable.length !== 0) {
      copyListTokens[currentTurn].tokens[i].diceAvailable = [];
      copyListTokens[currentTurn].tokens[i].enableTooltip = false;
      copyListTokens[currentTurn].tokens[i].animated = false;
      copyListTokens[currentTurn].tokens[i].isMoving = false;
    }
  }

  movingTokenIndexes.forEach((movingTokenIndex) => {
    copyListTokens[currentTurn].tokens[movingTokenIndex].isMoving = true;
    copyListTokens[currentTurn].tokens[movingTokenIndex].totalTokens = 1;
    copyListTokens[currentTurn].tokens[movingTokenIndex].position = 1;
  });

  if (tokenSelected.typeTile === EtypeTile.JAIL) {
    totalCellsMove = 1;
  }

  if (isJointMove) {
    totalCellsMove = getMasterMoveDistance({
      diceValue: totalCellsMove as TDicevalues,
      isJointMove: true,
    });
  }

  if (
    [EtypeTile.NORMAL, EtypeTile.EXIT].includes(
      tokenSelected.typeTile as EtypeTile,
    )
  ) {
    const normalized = normalizeTokenCellDistribution(copyListTokens);
    copyListTokens = normalized.copyListTokens;
    setTotalTokens(normalized.nextTotalTokens);
  }

  setListTokens(copyListTokens);

  setActionsMoveToken({
    isRunning: true,
    tokenIndex,
    tokenIndexes: movingTokenIndexes,
    isJointMove,
    totalCellsMove,
    cellsCounter: 0,
  });
};

interface ValidateMovementToken {
  actionsMoveToken: IActionsMoveToken;
  actionsTurn: IActionsTurn;
  currentTurn: number;
  gameMode?: TGameMode;
  listTokens: IListTokens[];
  players: IPlayer[];
  totalTokens: TShowTotalTokens;
  currentUserId?: string;
  playSound: (type: IESounds) => void;
  setActionsMoveToken: React.Dispatch<React.SetStateAction<IActionsMoveToken>>;
  setActionsTurn: React.Dispatch<React.SetStateAction<IActionsTurn>>;
  setCurrentTurn: React.Dispatch<React.SetStateAction<number>>;
  setIsGameOver: React.Dispatch<React.SetStateAction<IGameOver>>;
  setListTokens: React.Dispatch<React.SetStateAction<IListTokens[]>>;
  setPlayers: React.Dispatch<React.SetStateAction<IPlayer[]>>;
  setTotalTokens: React.Dispatch<React.SetStateAction<TShowTotalTokens>>;
}

/**
 * Función que realiza el proceso de mover el token
 * @param param0
 * @returns
 */
export const validateMovementToken = ({
  actionsMoveToken,
  actionsTurn,
  currentTurn,
  gameMode,
  listTokens,
  players,
  totalTokens,
  currentUserId,
  playSound,
  setActionsMoveToken,
  setActionsTurn,
  setCurrentTurn,
  setIsGameOver,
  setListTokens,
  setPlayers,
  setTotalTokens,
}: ValidateMovementToken) => {
  playSound(ESounds.TOKEN_MOVE);

  const copyActionsMoveToken = cloneDeep(actionsMoveToken);
  let copyListTokens = cloneDeep(listTokens);
  const { positionGame } = copyListTokens[currentTurn];

  const { startTileIndex, exitTileIndex } =
    POSITION_ELEMENTS_BOARD[positionGame];

  const { tokenIndex } = copyActionsMoveToken;
  const movingTokenIndexes =
    copyActionsMoveToken.tokenIndexes &&
    copyActionsMoveToken.tokenIndexes.length
      ? copyActionsMoveToken.tokenIndexes
      : [tokenIndex];
  const tokenMove = copyListTokens[currentTurn].tokens[tokenIndex];
  let positionTile = 0;
  let targetTypeTile = tokenMove.typeTile;
  let goNextTurn = false;

  if (tokenMove.typeTile === EtypeTile.EXIT) {
    positionTile = tokenMove.positionTile + 1;

    if (positionTile === TOTAL_EXIT_TILES - 1) {
      targetTypeTile = EtypeTile.END;
    }
  }

  if (tokenMove.typeTile === EtypeTile.NORMAL) {
    if (tokenMove.positionTile !== exitTileIndex) {
      positionTile = validateIncrementTokenMovement(tokenMove.positionTile);
      targetTypeTile = EtypeTile.NORMAL;
    } else {
      /* ────────── Master locked home entry movement ──────────
         kill না থাকলে entry block থাকবে, কিন্তু token আটকে থাকবে না।
         home lane বাদ দিয়ে normal path ধরে আবার ঘুরবে।
      ─────────────────────────────────────────────────────── */
      const isHomeEntryLocked =
        isMasterMode(gameMode) && getPlayerKillCount(players, currentTurn) <= 0;

      positionTile = isHomeEntryLocked
        ? validateIncrementTokenMovement(tokenMove.positionTile)
        : 0;
      targetTypeTile = isHomeEntryLocked ? EtypeTile.NORMAL : EtypeTile.EXIT;
    }
  }

  if (tokenMove.typeTile === EtypeTile.JAIL) {
    positionTile = startTileIndex;
    targetTypeTile = EtypeTile.NORMAL;
  }

  movingTokenIndexes.forEach((movingTokenIndex) => {
    const finalPositionTile =
      targetTypeTile === EtypeTile.END ? movingTokenIndex : positionTile;

    copyListTokens[currentTurn].tokens[movingTokenIndex].animated =
      tokenMove.typeTile === EtypeTile.JAIL ||
      copyListTokens[currentTurn].tokens[movingTokenIndex].animated;
    copyListTokens[currentTurn].tokens[movingTokenIndex].typeTile =
      targetTypeTile;
    copyListTokens[currentTurn].tokens[movingTokenIndex].positionTile =
      finalPositionTile;
    copyListTokens[currentTurn].tokens[movingTokenIndex].coordinate =
      getCoordinatesByTileType(targetTypeTile, positionGame, finalPositionTile);
  });

  copyActionsMoveToken.cellsCounter++;

  let typeNextStep: ENextStepGame | null = null;
  let isGameOver = false;
  let updatedPlayersAfterKill: IPlayer[] | null = null;

  if (
    copyActionsMoveToken.cellsCounter === copyActionsMoveToken.totalCellsMove
  ) {
    let rollDiceAgain = false;
    let moveTokensAgain = false;

    copyActionsMoveToken.isRunning = false;
    movingTokenIndexes.forEach((movingTokenIndex) => {
      copyListTokens[currentTurn].tokens[movingTokenIndex].isMoving = false;
    });

    const { END } = getTokensValueByCellType(copyListTokens[currentTurn]);

    if (tokenMove.typeTile === EtypeTile.END) {
      for (let tokenEnd of END) {
        const tokenIndexEndPosition = tokenEnd.index;

        copyListTokens[currentTurn].tokens[tokenIndexEndPosition].positionTile =
          tokenIndexEndPosition;

        copyListTokens[currentTurn].tokens[tokenIndexEndPosition].coordinate =
          getCoordinatesByTileType(
            EtypeTile.END,
            positionGame,
            tokenIndexEndPosition,
          );
      }

      const finished = END.length === 4;
      rollDiceAgain = !finished;

      if (finished) {
        let copyPlayers = updatedPlayersAfterKill || cloneDeep(players);

        const totalPlayers = copyPlayers.filter(
          (v) => !v.isOffline || v.finished,
        ).length;

        const totalPlayersEnd = copyPlayers.filter((v) => v.finished).length;
        let ranking = totalPlayersEnd + 1;

        isGameOver = ranking === totalPlayers - 1;

        copyPlayers[currentTurn].finished = true;
        copyPlayers[currentTurn].ranking = ranking;

        if (isGameOver) {
          copyPlayers = validatePlayerRankingGameOver({
            players: copyPlayers,
            playSound,
            ranking,
            setIsGameOver,
          });
        }

        setPlayers(copyPlayers);
      }
    }

    if (
      [EtypeTile.NORMAL, EtypeTile.EXIT].includes(
        tokenMove.typeTile as EtypeTile,
      )
    ) {
      let distributeTokensCell = tokenMove.typeTile === EtypeTile.EXIT;

      if (tokenMove.typeTile === EtypeTile.NORMAL) {
        const isSafeArea = validateSafeArea(positionTile);

        if (isSafeArea) {
          playSound(ESounds.SAFE_ZONE);
        }

        const totalTokensInCell = getTotalTokensInNormalCell(
          positionTile,
          copyListTokens,
        );

        if (totalTokensInCell.total >= 2) {
          const isSameTokens =
            (totalTokensInCell.distribution[currentTurn] ?? []).length ===
            totalTokensInCell.total;

          distributeTokensCell = isSameTokens || isSafeArea;

          if (!distributeTokensCell) {
            const playerIndexToJail = Object.keys(
              totalTokensInCell.distribution,
            )
              .map((v) => +v)
              .filter((v) => v !== currentTurn)[0];

            const opponentTokenIndexes =
              totalTokensInCell.distribution[playerIndexToJail] || [];
            const opponentJointIndexes = getJointTokenIndexesAtCell(
              copyListTokens,
              playerIndexToJail,
              positionTile,
            );

            /* ────────── Master kill rule ──────────
               single token joint/double কাটতে পারবে না।
               joint token opponent joint কাটলে দুই token-ই jail যাবে।
            ─────────────────────────────────────── */
            const tokensToJail =
              isMasterMode(gameMode) && opponentJointIndexes.length >= 2
                ? copyActionsMoveToken.isJointMove
                  ? opponentJointIndexes
                  : []
                : [opponentTokenIndexes[0]].filter(
                    (value): value is number => typeof value === "number",
                  );

            if (tokensToJail.length !== 0) {
              const { positionGame: positionGameToJail } =
                copyListTokens[playerIndexToJail];

              tokensToJail.forEach((tokenIndexToJail) => {
                copyListTokens[playerIndexToJail].tokens[
                  tokenIndexToJail
                ].animated = true;

                copyListTokens[playerIndexToJail].tokens[
                  tokenIndexToJail
                ].typeTile = EtypeTile.JAIL;

                copyListTokens[playerIndexToJail].tokens[
                  tokenIndexToJail
                ].positionTile = tokenIndexToJail;

                copyListTokens[playerIndexToJail].tokens[
                  tokenIndexToJail
                ].coordinate = getCoordinatesByTileType(
                  EtypeTile.JAIL,
                  positionGameToJail,
                  tokenIndexToJail,
                );
              });

              updatedPlayersAfterKill = cloneDeep(
                updatedPlayersAfterKill || players,
              );
              updatedPlayersAfterKill[currentTurn].killedTokensCount =
                getPlayerKillCount(updatedPlayersAfterKill, currentTurn) +
                tokensToJail.length;

              rollDiceAgain = true;
              playSound(ESounds.TOKEN_JAIL);
            }
          }
        }
      }

      if (distributeTokensCell || isMasterMode(gameMode)) {
        const normalized = normalizeTokenCellDistribution(copyListTokens);
        copyListTokens = normalized.copyListTokens;
        setTotalTokens(normalized.nextTotalTokens);
      }
    }

    goNextTurn = actionsTurn.diceList.length === 0;

    if (actionsTurn.diceList.length !== 0 && !rollDiceAgain) {
      const {
        canMoveTokens,
        copyListTokens: newListTokens,
        moveAutomatically,
        tokenIndex: newTokenIndex,
        diceIndex: newDiceIndex,
      } = validateDiceForTokenMovement({
        currentTurn,
        listTokens: copyListTokens,
        diceList: actionsTurn.diceList,
        players,
        gameMode,
      });

      if (moveAutomatically) {
        return validateSelectToken({
          actionsTurn,
          currentTurn,
          diceIndex: newDiceIndex,
          gameMode,
          listTokens: copyListTokens,
          tokenIndex: newTokenIndex,
          totalTokens,
          setActionsMoveToken,
          setActionsTurn,
          setTotalTokens,
          setListTokens,
        });
      } else {
        goNextTurn = !canMoveTokens;

        if (canMoveTokens) {
          copyListTokens = newListTokens;
          moveTokensAgain = true;
        }
      }
    }

    typeNextStep = rollDiceAgain
      ? ENextStepGame.ROLL_DICE_AGAIN
      : moveTokensAgain
        ? ENextStepGame.MOVE_TOKENS_AGAIN
        : goNextTurn
          ? ENextStepGame.NEXT_TURN
          : null;

    if (!isGameOver && typeNextStep) {
      nextStepGame({
        type: typeNextStep,
        actionsTurn,
        currentTurn,
        players,
        currentUserId,
        setActionsTurn,
        setCurrentTurn,
      });
    }
  }

  if (updatedPlayersAfterKill && !isGameOver) {
    setPlayers(updatedPlayersAfterKill);
  }

  setListTokens(copyListTokens);
  setActionsMoveToken(copyActionsMoveToken);
};

/**
 * Función que devuleve de forma aleatoria un token
 * @param currentTurn
 * @param listTokens
 * @param diceList
 * @returns
 */
export const validateSelectTokenRandomly = (
  currentTurn: number,
  listTokens: IListTokens[],
  diceList: IDiceList[],
) => {
  const tokensCanMoved = listTokens[currentTurn].tokens.filter(
    (v) => v.diceAvailable.length !== 0,
  );

  const randomIndexToken = randomNumber(0, tokensCanMoved.length - 1);
  const token = tokensCanMoved[randomIndexToken];
  const tokenIndex = token.index;
  const diceAvailable = token.diceAvailable;
  const diceIndexInTokenSelected = randomNumber(0, diceAvailable.length - 1);

  const diceIndex = getDiceIndexSelected(
    diceList,
    diceAvailable[diceIndexInTokenSelected].key,
  );

  return { diceIndex, tokenIndex };
};
