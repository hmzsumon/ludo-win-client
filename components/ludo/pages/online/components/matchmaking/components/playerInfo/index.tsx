import type { IDataRoomSocket } from "@/interfaces";
import React from "react";

import PlayerProfile from "../playerProfile";
import { getPositionPlayers } from "./helpers";

interface PlayersProps {
  players: { name: string; photo: string }[];
}

/* ── "Vs" badge — CSS gradient text ── */
const TextVersus = () => <div className="page-matchmaking-vs">Vs</div>;

/* ── 2 Player layout ── */
const TwoPlayers = ({ players }: PlayersProps) => (
  <div className="page-matchmaking-two-players">
    <PlayerProfile {...players[0]} />
    <TextVersus />
    <PlayerProfile {...players[1]} />
  </div>
);

/* ── 4 Player layout ── */
const FourPlayers = ({ players }: PlayersProps) => (
  <div className="page-matchmaking-four-players">
    <div className="page-matchmaking-four-players-section">
      <PlayerProfile {...players[1]} />
      <PlayerProfile {...players[2]} />
    </div>
    <TextVersus />
    <div className="page-matchmaking-four-players-section border-t border-white/10">
      <PlayerProfile {...players[0]} />
      <PlayerProfile {...players[3]} />
    </div>
  </div>
);

interface PlayerInfoProps {
  dataRoomSocket: IDataRoomSocket;
}

const PlayersInfo = ({ dataRoomSocket }: PlayerInfoProps) => {
  const RenderPlayers =
    dataRoomSocket.totalPlayers === 2 ? TwoPlayers : FourPlayers;

  const players = getPositionPlayers(
    dataRoomSocket.orderPlayers,
    dataRoomSocket.totalPlayers,
  );

  return (
    <div className="page-matchmaking-players-info">
      <RenderPlayers players={players} />
    </div>
  );
};

export default React.memo(PlayersInfo);
