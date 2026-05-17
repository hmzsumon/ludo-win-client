"use client";

import BackButton from "@/components/ludo/backButton";
import Loading from "@/components/ludo/loading";
import Logo from "@/components/ludo/logo";
import ProfilePicture from "@/components/ludo/profilePicture";
import PageWrapper from "@/components/wrapper/page";

import useSocket from "@/hooks/useSocket";
import type { IDataOnline, IDataSocket } from "@/interfaces";
import { Suspense, lazy } from "react";
import type { Socket } from "socket.io-client";

import { PlayersInfo, RoomInfo } from "./components";

type GameProps = IDataOnline & {
  socket: Socket;
  currentUserId?: string;
};

const Game = lazy<React.ComponentType<GameProps>>(() =>
  import("@/components/ludo/index").then((mod) => ({
    default: mod.default,
  })),
);

const Matchmaking = ({ dataSocket }: { dataSocket: IDataSocket }) => {
  const { socket, dataRoomSocket, dataOnlineGame } = useSocket(dataSocket);

  if (!dataRoomSocket) {
    return <Loading />;
  }

  if (dataOnlineGame && socket) {
    return (
      <Suspense fallback={<Loading />}>
        <Game
          {...dataOnlineGame}
          socket={socket}
          currentUserId={dataSocket.user.id}
        />
      </Suspense>
    );
  }

  return (
    <PageWrapper
      leftOption={<BackButton withConfirmation />}
      rightOption={<ProfilePicture />}
    >
      {dataSocket.roomName ? (
        <RoomInfo roomName={dataSocket.roomName} />
      ) : (
        <Logo />
      )}

      <PlayersInfo dataRoomSocket={dataRoomSocket} />
    </PageWrapper>
  );
};

export default Matchmaking;
