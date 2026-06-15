import OnlinePage from "@/components/ludo/pages/online";
import { EGameMode } from "@/utils/constants";
import React from "react";

interface OnlineProps {
  searchParams?: {
    mode?: string;
  };
}

const Online = ({ searchParams }: OnlineProps) => {
  const gameMode =
    searchParams?.mode === "master" ? EGameMode.MASTER : EGameMode.CLASSIC;

  return (
    <div>
      <OnlinePage gameMode={gameMode} />
    </div>
  );
};

export default React.memo(Online);
