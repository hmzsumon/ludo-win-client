import OnlinePage from "@/components/ludo/pages/online";
import { EGameMode } from "@/utils/constants";
import React from "react";

interface OnlineProps {
  searchParams?: {
    mode?: string;
    friends?: string;
  };
}

const Online = ({ searchParams }: OnlineProps) => {
  const gameMode =
    searchParams?.mode === "master" ? EGameMode.MASTER : EGameMode.CLASSIC;

  return (
    <div>
      {/* NEW ▸ Dashboard shortcut opens Friends without an extra lobby click. */}
      <OnlinePage
        gameMode={gameMode}
        initialFriends={searchParams?.friends === "1"}
      />
    </div>
  );
};

export default React.memo(Online);
