import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Socket } from "socket.io-client";

import { useOptionsContext } from "@/context/optionContext";
import useInterval from "@/hooks/useInterval";
import useWait from "@/hooks/useWait";
import { useLazyGetWalletQuery } from "@/redux/features/wallet/walletApi";
import {
  clearLudoActiveSocketSession,
  consumeLudoManualLeaveIntent,
  markLudoManualLeaveIntent,
  readLudoActiveGameState,
  saveLudoActiveGameState,
  saveLudoReconnectCooldown,
} from "@/utils/ludoActiveGame";
import type {
  IActionsMoveToken,
  IActionsTurn,
  IGameOver,
  IListTokens,
  IPlayer,
  ISelectTokenValues,
  IUser,
  TBoardColors,
  TColors,
  TDicevalues,
  TGameMode,
  TOfflineBotMode,
  TShowTotalTokens,
  TTotalPlayers,
  TTypeGame,
} from "../../interfaces";
import {
  EActionsBoardGame,
  EBoardColors,
  EGameMode,
  EPositionProfiles,
  ESounds,
  ETypeGame,
  INITIAL_ACTIONS_MOVE_TOKEN,
  TOKEN_MOVEMENT_INTERVAL_VALUE,
  WAIT_SHOW_MODAL_GAME_OVER,
} from "../../utils/constants";

import PageWrapper from "../wrapper/page";
import BackButton from "./backButton";
import Board from "./board";
import BoardWrapper from "./boardWrapper";

import Debug from "./debug";
import Gameover from "./gameover";
import {
  getInitialActionsTurnValue,
  getInitialDataPlayers,
  getInitialPositionTokens,
  getOfflineControlledTokenSelection,
  getOfflineWeightedDice,
  getRandomValueDice,
  validateDicesForTokens,
  validateMovementToken,
  validateSelectToken,
  validateSelectTokenRandomly,
} from "./helpers";
import MasterHomeLocks from "./masterHomeLocks";
import ProfileSection from "./profileSection";
import ShowTotalTokens from "./showTotalTokens";
import Tokens from "./tokens";

const OPPOSITE_COLOR_MAP: Record<TColors, TColors> = {
  RED: "YELLOW",
  YELLOW: "RED",
  GREEN: "BLUE",
  BLUE: "GREEN",
};

const LOCAL_BOARD_COLOR_MAP: Record<TColors, TBoardColors> = {
  RED: EBoardColors.RGYB,
  GREEN: EBoardColors.GYBR,
  BLUE: EBoardColors.BRGY,
  YELLOW: EBoardColors.YBRG,
};

const getResolvedTwoPlayerView = ({
  boardColor,
  currentUserId,
  totalPlayers,
  typeGame,
  users,
}: {
  boardColor: TBoardColors;
  currentUserId?: string;
  totalPlayers: TTotalPlayers;
  typeGame: TTypeGame;
  users: IUser[];
}) => {
  const isTwoPlayerHumanVsHuman =
    typeGame === ETypeGame.ONLINE &&
    totalPlayers === 2 &&
    Boolean(currentUserId) &&
    users.length >= 2 &&
    users.every((user) => !user.isBot);

  if (!isTwoPlayerHumanVsHuman) {
    return {
      resolvedBoardColor: boardColor,
      forcePlayerColors: undefined as (TColors | undefined)[] | undefined,
    };
  }

  const currentUserIndex = users.findIndex((user) => user.id === currentUserId);

  if (currentUserIndex < 0) {
    return {
      resolvedBoardColor: boardColor,
      forcePlayerColors: undefined as (TColors | undefined)[] | undefined,
    };
  }

  const defaultTwoPlayerColors =
    boardColor === EBoardColors.BRGY
      ? (["BLUE", "GREEN"] as TColors[])
      : boardColor === EBoardColors.YBRG
        ? (["YELLOW", "RED"] as TColors[])
        : boardColor === EBoardColors.GYBR
          ? (["GREEN", "BLUE"] as TColors[])
          : (["RED", "YELLOW"] as TColors[]);

  const currentUserColor =
    (users[currentUserIndex]?.color as TColors | undefined) ||
    defaultTwoPlayerColors[currentUserIndex];

  if (!currentUserColor) {
    return {
      resolvedBoardColor: boardColor,
      forcePlayerColors: undefined as (TColors | undefined)[] | undefined,
    };
  }

  const opponentIndex = currentUserIndex === 0 ? 1 : 0;
  const opponentColor = OPPOSITE_COLOR_MAP[currentUserColor];
  const forcePlayerColors: (TColors | undefined)[] = [];

  forcePlayerColors[currentUserIndex] = currentUserColor;
  forcePlayerColors[opponentIndex] = opponentColor;

  return {
    resolvedBoardColor: LOCAL_BOARD_COLOR_MAP[currentUserColor],
    forcePlayerColors,
  };
};

interface GameProps {
  totalPlayers: TTotalPlayers;
  initialTurn: number;
  users: IUser[];
  typeGame?: TTypeGame;
  boardColor?: TBoardColors;
  debug?: boolean;
  roomName?: string;
  socket?: Socket;
  currentUserId?: string;
  betAmount?: number;
  botMode?: TOfflineBotMode;
  gameMode?: TGameMode;
}

const Game = ({
  totalPlayers = 2,
  initialTurn = 0,
  users = [],
  typeGame = ETypeGame.OFFLINE,
  boardColor = EBoardColors.RGYB,
  debug = false,
  roomName = "",
  socket,
  currentUserId = "",
  betAmount = 0,
  botMode = "EASY",
  gameMode = EGameMode.CLASSIC,
}: GameProps) => {
  const { playSound } = useOptionsContext();
  const [refreshWallet] = useLazyGetWalletQuery();
  const didEmitMatchResultRef = useRef(false);

  /* ────────── restore local board state after refresh/TWA reload ────────── */
  const restoredGameState = useMemo(
    () =>
      typeGame === ETypeGame.ONLINE
        ? readLudoActiveGameState({ roomName, currentUserId })
        : null,
    [currentUserId, roomName, typeGame],
  );

  const { resolvedBoardColor, forcePlayerColors } = useMemo(
    () =>
      getResolvedTwoPlayerView({
        boardColor,
        currentUserId,
        totalPlayers,
        typeGame,
        users,
      }),
    [boardColor, currentUserId, totalPlayers, typeGame, users],
  );

  /* ────────── initial players data ────────── */
  const initialPlayers = useMemo(
    () =>
      getInitialDataPlayers(
        users,
        resolvedBoardColor,
        totalPlayers,
        forcePlayerColors,
      ),
    [users, resolvedBoardColor, totalPlayers, forcePlayerColors],
  );

  /* ────────── players state init ────────── */
  const [players, setPlayers] = useState<IPlayer[]>(
    () => restoredGameState?.players || initialPlayers,
  );

  /* ────────── tokens state init ────────── */
  const [listTokens, setListTokens] = useState<IListTokens[]>(
    () =>
      restoredGameState?.listTokens ||
      getInitialPositionTokens(
        resolvedBoardColor,
        totalPlayers,
        initialPlayers,
        currentUserId,
      ),
  );

  /* ────────── settlement state init ────────── */
  const [settlementResult, setSettlementResult] = useState<{
    winnerUserId?: string;
    payoutAmount?: number;
    feeAmount?: number;
  } | null>(null);

  /* ────────── turn init ────────── */
  const [actionsTurn, setActionsTurn] = useState<IActionsTurn>(
    () =>
      restoredGameState?.actionsTurn ||
      getInitialActionsTurnValue(initialTurn, initialPlayers, currentUserId),
  );

  const [currentTurn, setCurrentTurn] = useState(
    () => restoredGameState?.currentTurn ?? initialTurn,
  );

  const [actionsMoveToken, setActionsMoveToken] = useState<IActionsMoveToken>(
    () => restoredGameState?.actionsMoveToken || INITIAL_ACTIONS_MOVE_TOKEN,
  );

  const [totalTokens, setTotalTokens] = useState<TShowTotalTokens>(
    () => restoredGameState?.totalTokens || {},
  );

  const [isGameOver, setIsGameOver] = useState<IGameOver>(
    () =>
      restoredGameState?.isGameOver || {
        showModal: false,
        gameOver: false,
      },
  );

  const offlineBotRollCountRef = useRef<Record<number, number>>({});
  const assistOpeningDelayRef = useRef<number>(
    Math.floor(Math.random() * 3) + 2,
  );

  /* ────────── online mode flags ────────── */
  const isOnlineGame = useMemo(
    () => typeGame === ETypeGame.ONLINE && Boolean(socket) && Boolean(roomName),
    [roomName, socket, typeGame],
  );

  /* ────────── local player index ────────── */
  const currentPlayerIndex = useMemo(() => {
    if (!currentUserId) return -1;
    return players.findIndex((player) => player.id === currentUserId);
  }, [currentUserId, players]);

  /* ────────── turn ownership ────────── */
  const isCurrentTurnBot = Boolean(players[currentTurn]?.isBot);

  const onlineBotIndex = useMemo(
    () => players.findIndex((player) => player.isBot),
    [players],
  );

  const onlineBotMode = useMemo<TOfflineBotMode>(
    () => (botMode === "ASSIST" ? "ASSIST" : "EASY"),
    [botMode],
  );

  const hasOnlineBotControl = useMemo(
    () => isOnlineGame && totalPlayers === 2 && onlineBotIndex >= 0,
    [isOnlineGame, onlineBotIndex, totalPlayers],
  );

  const isMyOnlineTurn =
    isOnlineGame &&
    currentPlayerIndex >= 0 &&
    currentTurn === currentPlayerIndex;

  const canControlCurrentTurn = isMyOnlineTurn || isCurrentTurnBot;

  /* ────────── room action emit ────────── */
  const emitRoomAction = useCallback(
    (payload: Record<string, unknown>) => {
      if (!socket || !roomName) return;
      socket.emit("ACTIONS", payload);
    },
    [roomName, socket],
  );

  /* ────────── handle opponent leave result ────────── */
  const handleOpponentLeaveResult = useCallback(
    (leftUserId: string) => {
      setPlayers((prevPlayers) => {
        const copyPlayers = prevPlayers.map((player) => ({ ...player }));
        const leftPlayerIndex = copyPlayers.findIndex(
          (player) => player.id === leftUserId,
        );

        if (leftPlayerIndex >= 0) {
          copyPlayers[leftPlayerIndex].isOffline = true;
          copyPlayers[leftPlayerIndex].finished = true;
          copyPlayers[leftPlayerIndex].ranking = copyPlayers.length;
        }

        const remainingPlayers = copyPlayers.filter(
          (player) => player.id !== leftUserId && !player.isOffline,
        );

        remainingPlayers.sort((a, b) => {
          if (a.id === currentUserId) return -1;
          if (b.id === currentUserId) return 1;
          return a.index - b.index;
        });

        remainingPlayers.forEach((player, index) => {
          copyPlayers[player.index].finished = true;
          copyPlayers[player.index].ranking = index + 1;
        });

        return copyPlayers;
      });

      setActionsMoveToken(INITIAL_ACTIONS_MOVE_TOKEN);
      setActionsTurn((prev) => ({
        ...prev,
        timerActivated: false,
        disabledDice: true,
        showDice: false,
        isDisabledUI: true,
      }));

      playSound(ESounds.GAMER_OVER);
      setIsGameOver({ showModal: false, gameOver: true });
    },
    [currentUserId, playSound],
  );

  /* ────────── token selection handler ────────── */
  const handleSelectedToken = useCallback(
    ({ diceIndex, tokenIndex }: ISelectTokenValues, isActionSocket = false) => {
      if (isOnlineGame && !isActionSocket) {
        if (!canControlCurrentTurn) return;

        if (isCurrentTurnBot) {
          validateSelectToken({
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
          });
          return;
        }

        emitRoomAction({
          type: EActionsBoardGame.SELECT_TOKEN,
          roomName,
          [EActionsBoardGame.SELECT_TOKEN]: {
            diceIndex,
            tokenIndex,
          },
        });
        return;
      }

      validateSelectToken({
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
      });
    },
    [
      actionsTurn,
      canControlCurrentTurn,
      currentTurn,
      emitRoomAction,
      gameMode,
      isCurrentTurnBot,
      isOnlineGame,
      listTokens,
      roomName,
      totalTokens,
    ],
  );

  /* ────────── timer handler ────────── */
  const handleTimer = useCallback(
    (ends = false) => {
      const currentPlayer = players[currentTurn];
      if (!currentPlayer) return;

      const { isBot } = currentPlayer;

      if (isOnlineGame && !canControlCurrentTurn) {
        return;
      }

      const makeAutomaticMovement = ends || isBot;

      if (makeAutomaticMovement) {
        if (actionsTurn.actionsBoardGame === EActionsBoardGame.ROLL_DICE) {
          handleSelectDice();
        }

        if (actionsTurn.actionsBoardGame === EActionsBoardGame.SELECT_TOKEN) {
          const { diceIndex, tokenIndex } =
            hasOnlineBotControl && isCurrentTurnBot
              ? getOfflineControlledTokenSelection(
                  currentTurn,
                  listTokens,
                  actionsTurn.diceList,
                  onlineBotIndex,
                  onlineBotMode,
                )
              : validateSelectTokenRandomly(
                  currentTurn,
                  listTokens,
                  actionsTurn.diceList,
                );

          handleSelectedToken({ diceIndex, tokenIndex });
        }
      }
    },
    [
      actionsTurn.actionsBoardGame,
      actionsTurn.diceList,
      canControlCurrentTurn,
      currentTurn,
      handleSelectedToken,
      hasOnlineBotControl,
      isCurrentTurnBot,
      isOnlineGame,
      listTokens,
      onlineBotIndex,
      onlineBotMode,
      players,
    ],
  );

  /* ────────── dice select handler ────────── */
  const handleSelectDice = useCallback(
    (diceValue?: TDicevalues, isActionSocket = false) => {
      if (isOnlineGame && !isActionSocket) {
        if (!canControlCurrentTurn) return;

        if (isCurrentTurnBot) {
          const currentRollCount =
            offlineBotRollCountRef.current[currentTurn] || 0;

          const resolvedDiceValue =
            onlineBotMode === "ASSIST" && onlineBotIndex >= 0
              ? getOfflineWeightedDice({
                  actionsTurn,
                  currentTurn,
                  listTokens,
                  players,
                  favoredBotIndex: onlineBotIndex,
                  gameMode,
                  currentRollCount,
                  assistOpeningDelay: assistOpeningDelayRef.current,
                })
              : diceValue;

          offlineBotRollCountRef.current[currentTurn] = currentRollCount + 1;

          setActionsTurn((current) =>
            getRandomValueDice(current, resolvedDiceValue),
          );

          playSound(ESounds.ROLL_DICE);
          return;
        }

        const value =
          diceValue || ((Math.floor(Math.random() * 6) + 1) as TDicevalues);

        emitRoomAction({
          type: EActionsBoardGame.ROLL_DICE,
          roomName,
          [EActionsBoardGame.ROLL_DICE]: value,
        });
        return;
      }

      const currentRollCount = offlineBotRollCountRef.current[currentTurn] || 0;
      offlineBotRollCountRef.current[currentTurn] = currentRollCount + 1;

      setActionsTurn((current) => getRandomValueDice(current, diceValue));
      playSound(ESounds.ROLL_DICE);
    },
    [
      actionsTurn,
      canControlCurrentTurn,
      currentTurn,
      emitRoomAction,
      gameMode,
      isCurrentTurnBot,
      isOnlineGame,
      listTokens,
      onlineBotIndex,
      onlineBotMode,
      players,
      playSound,
      roomName,
    ],
  );

  /* ────────── dice done handler ────────── */
  const handleDoneDice = useCallback(
    (isActionSocket = false) => {
      if (isOnlineGame && !isActionSocket) {
        if (!canControlCurrentTurn) return;

        if (isCurrentTurnBot) {
          validateDicesForTokens({
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
          });
          return;
        }

        emitRoomAction({
          type: EActionsBoardGame.DONE_DICE,
          roomName,
          [EActionsBoardGame.DONE_DICE]: true,
        });
        return;
      }

      validateDicesForTokens({
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
      });
    },
    [
      actionsTurn,
      canControlCurrentTurn,
      currentTurn,
      currentUserId,
      emitRoomAction,
      gameMode,
      isCurrentTurnBot,
      isOnlineGame,
      listTokens,
      players,
      playSound,
      roomName,
      totalTokens,
    ],
  );

  /* ────────── mute chat handler ────────── */
  const handleMuteChat = useCallback((playerIndex: number) => {
    console.log("handleMuteChat: ", { playerIndex });
  }, []);

  /* ────────── persist live online board for refresh/TWA reload ────────── */
  useEffect(() => {
    if (!isOnlineGame || !roomName || !currentUserId) return;

    saveLudoActiveGameState({
      roomName,
      currentUserId,
      players,
      listTokens,
      actionsTurn,
      currentTurn,
      actionsMoveToken,
      totalTokens,
      isGameOver,
      savedAt: Date.now(),
    });
  }, [
    actionsMoveToken,
    actionsTurn,
    currentTurn,
    currentUserId,
    isGameOver,
    isOnlineGame,
    listTokens,
    players,
    roomName,
    totalTokens,
  ]);

  /* ────────── clear active session after match end ────────── */
  useEffect(() => {
    if (!isOnlineGame || !isGameOver.gameOver) return;
    clearLudoActiveSocketSession();
  }, [isGameOver.gameOver, isOnlineGame]);

  /* ────────── settle wager when game over ────────── */
  useEffect(() => {
    if (
      !isOnlineGame ||
      !socket ||
      !roomName ||
      !betAmount ||
      didEmitMatchResultRef.current
    ) {
      return;
    }

    const sortedPlayers = [...players]
      .filter((player) => player.ranking > 0)
      .sort((a, b) => a.ranking - b.ranking);

    const winner = sortedPlayers[0];
    if (!winner || !isGameOver.gameOver) return;

    didEmitMatchResultRef.current = true;

    socket.emit("MATCH_RESULT", {
      roomName,
      winnerUserId: winner.id,
    });

    refreshWallet();
  }, [
    betAmount,
    isGameOver.gameOver,
    isOnlineGame,
    players,
    refreshWallet,
    roomName,
    socket,
  ]);

  /* ────────── socket listeners ────────── */
  useEffect(() => {
    if (!isOnlineGame || !socket) return;

    const onRollDice = (payload: any) => {
      const value = payload?.[EActionsBoardGame.ROLL_DICE] as TDicevalues;
      if (!value) return;
      handleSelectDice(value, true);
    };

    const onSelectToken = (payload: any) => {
      const data = payload?.[EActionsBoardGame.SELECT_TOKEN] as
        | ISelectTokenValues
        | undefined;

      if (!data) return;
      handleSelectedToken(data, true);
    };

    const onDoneDice = () => {
      handleDoneDice(true);
    };

    const onOpponentLeave = (payload: any) => {
      const leftUserId =
        payload?.[EActionsBoardGame.OPPONENT_LEAVE] ||
        payload?.OPPONENT_LEAVE ||
        "";

      if (!leftUserId) return;

      handleOpponentLeaveResult(leftUserId);
    };

    const onWagerSettled = (payload: any) => {
      setSettlementResult({
        winnerUserId: payload?.winnerUserId,
        payoutAmount: Number(payload?.payoutAmount || 0),
        feeAmount: Number(payload?.feeAmount || 0),
      });

      refreshWallet();
    };

    socket.on(EActionsBoardGame.ROLL_DICE, onRollDice);
    socket.on(EActionsBoardGame.SELECT_TOKEN, onSelectToken);
    socket.on(EActionsBoardGame.DONE_DICE, onDoneDice);
    socket.on(EActionsBoardGame.OPPONENT_LEAVE, onOpponentLeave);
    socket.on("WAGER_SETTLED", onWagerSettled);

    return () => {
      socket.off(EActionsBoardGame.ROLL_DICE, onRollDice);
      socket.off(EActionsBoardGame.SELECT_TOKEN, onSelectToken);
      socket.off(EActionsBoardGame.DONE_DICE, onDoneDice);
      socket.off(EActionsBoardGame.OPPONENT_LEAVE, onOpponentLeave);
      socket.off("WAGER_SETTLED", onWagerSettled);
    };
  }, [
    handleDoneDice,
    handleOpponentLeaveResult,
    handleSelectDice,
    handleSelectedToken,
    isOnlineGame,
    refreshWallet,
    socket,
  ]);

  /* ────────── token movement interval ────────── */
  useInterval(
    () => {
      validateMovementToken({
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
      });
    },
    actionsMoveToken.isRunning ? TOKEN_MOVEMENT_INTERVAL_VALUE : null,
  );

  /* ────────── game over wait ────────── */
  useWait(
    isGameOver.gameOver,
    WAIT_SHOW_MODAL_GAME_OVER,
    useCallback(() => setIsGameOver({ showModal: true, gameOver: true }), []),
  );

  /* ────────── expose manual leave bridge for back button ────────── */
  useEffect(() => {
    if (!isOnlineGame || isGameOver.gameOver || !socket) return;

    (window as any).__ludoManualLeave = () => {
      markLudoManualLeaveIntent();
      socket.emit("LEAVE_ROOM");
    };

    return () => {
      if ((window as any).__ludoManualLeave) {
        delete (window as any).__ludoManualLeave;
      }
    };
  }, [isGameOver.gameOver, isOnlineGame, socket]);

  /* ────────── ask confirmation before manual refresh/close while game live ────────── */
  useEffect(() => {
    if (!isOnlineGame || isGameOver.gameOver || !roomName) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const isManualLeave = consumeLudoManualLeaveIntent();

      if (!isManualLeave) {
        saveLudoReconnectCooldown(roomName);
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomName, isGameOver.gameOver, isOnlineGame]);

  /* ────────── profile props ────────── */
  const profileHandlers = {
    handleTimer,
    handleSelectDice,
    handleDoneDice,
    handleMuteChat,
  };

  const profileProps = {
    players,
    totalPlayers,
    currentTurn,
    actionsTurn,
    currentUserId,
  };

  return (
    <PageWrapper leftOption={<BackButton withConfirmation />}>
      {isGameOver.showModal && (
        <Gameover
          players={players}
          currentUserId={currentUserId}
          betAmount={betAmount}
          winnerUserId={settlementResult?.winnerUserId}
          payoutAmount={settlementResult?.payoutAmount}
          feeAmount={settlementResult?.feeAmount}
          onClose={() => setIsGameOver({ showModal: false, gameOver: true })}
        />
      )}

      <BoardWrapper>
        <ProfileSection
          basePosition={EPositionProfiles.TOP}
          profileHandlers={profileHandlers}
          {...profileProps}
        />

        <Board boardColor={resolvedBoardColor}>
          {debug && <Debug.Tiles />}

          <MasterHomeLocks
            gameMode={gameMode}
            players={players}
            listTokens={listTokens}
          />

          <Tokens
            debug={debug}
            isDisabledUI={actionsTurn.isDisabledUI}
            listTokens={listTokens}
            diceList={actionsTurn.diceList}
            handleSelectedToken={handleSelectedToken}
          />

          <ShowTotalTokens totalTokens={totalTokens} />
        </Board>

        <ProfileSection
          basePosition={EPositionProfiles.BOTTOM}
          profileHandlers={profileHandlers}
          {...profileProps}
        />
      </BoardWrapper>

      {debug && (
        <Debug.Tokens
          typeGame={typeGame}
          players={players}
          listTokens={listTokens}
          actionsTurn={actionsTurn}
          setListTokens={setListTokens}
          handleSelectDice={handleSelectDice}
        />
      )}
    </PageWrapper>
  );
};

export default React.memo(Game);
