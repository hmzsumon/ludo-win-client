import type {
  IActionsTurn,
  IPlayer,
  IProfileHandlers,
  TPositionProfile,
  TPositionProfiles,
  TTotalPlayers,
} from "@/interfaces";
import { DEFAULT_VALUE_ACTION_TURN } from "@/utils/constants";
import { Profile } from "./components";

type TPositionPlayerIndex = Record<TPositionProfile, number>;
type TPositionBoard = Record<TPositionProfiles, Partial<TPositionPlayerIndex>>;
type TPositionTotalPlayers = Record<TTotalPlayers, Partial<TPositionBoard>>;

export interface ProfileSectionProps {
  basePosition: TPositionProfiles;
  currentTurn: number;
  players: IPlayer[];
  totalPlayers: TTotalPlayers;
  profileHandlers: IProfileHandlers;
  actionsTurn: IActionsTurn;
  currentUserId?: string;
}

/**
 * La distribución de los profiles en relación al número de jugadores, la posición en la board (TOP, BOTTOM)
 * y la posición de izquierda o derecha...
 */
const DISTRIBUTION_PROFILES: TPositionTotalPlayers = {
  2: {
    BOTTOM: {
      LEFT: 1,
    },
    TOP: {
      RIGHT: 2,
    },
  },
  3: {
    BOTTOM: {
      LEFT: 1,
    },
    TOP: {
      LEFT: 2,
      RIGHT: 3,
    },
  },
  4: {
    BOTTOM: {
      LEFT: 1,
      RIGHT: 4,
    },
    TOP: {
      LEFT: 2,
      RIGHT: 3,
    },
  },
};

/**
 * Función que determina si el compontente de profile se renderiza,
 * dependiendo de los props que se reciben...
 * La idea es que sirva como una función que valida los props de los demás
 * componentes...
 * @param props
 * @param position
 * @returns
 */
const getResolvedProfileIndex = ({
  basePosition,
  currentUserId,
  players,
  position,
  totalPlayers,
}: Pick<
  ProfileSectionProps,
  "basePosition" | "currentUserId" | "players" | "totalPlayers"
> & {
  position: TPositionProfile;
}) => {
  const defaultIndex =
    DISTRIBUTION_PROFILES[totalPlayers]?.[basePosition]?.[position] || 0;

  const isTwoPlayerHumanVsHuman =
    totalPlayers === 2 &&
    Boolean(currentUserId) &&
    players.length >= 2 &&
    players.every((player) => !player.isBot);

  if (!isTwoPlayerHumanVsHuman) {
    return defaultIndex;
  }

  const currentUserIndex = players.findIndex(
    (player) => player.id === currentUserId,
  );

  if (currentUserIndex < 0) {
    return defaultIndex;
  }

  const opponentIndex = players.findIndex(
    (player, index) => index !== currentUserIndex,
  );

  if (opponentIndex < 0) {
    return defaultIndex;
  }

  if (basePosition === "BOTTOM" && position === "LEFT") {
    return currentUserIndex + 1;
  }

  if (basePosition === "TOP" && position === "RIGHT") {
    return opponentIndex + 1;
  }

  return 0;
};

export const renderProfileComponent = (
  props: ProfileSectionProps,
  position: TPositionProfile,
) => {
  const {
    basePosition,
    currentTurn,
    players,
    totalPlayers,
    profileHandlers,
    actionsTurn,
    currentUserId,
  } = props;

  const indexProfile = getResolvedProfileIndex({
    basePosition,
    currentUserId,
    players,
    position,
    totalPlayers,
  });

  if (indexProfile !== 0) {
    const hasTurn = currentTurn === indexProfile - 1;
    const newActionsTurn = hasTurn ? actionsTurn : DEFAULT_VALUE_ACTION_TURN;

    const extProps = {
      basePosition,
      position,
      hasTurn,
      actionsTurn: newActionsTurn,
      ...profileHandlers,
    };

    return <Profile {...extProps} player={players[indexProfile - 1]} />;
  }

  return null;
};
