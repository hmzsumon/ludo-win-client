import OfflinePage from "@/components/ludo/pages/offline";
import { EGameMode } from "@/utils/constants";
import React from "react";

interface OfflineProps {
  searchParams?: {
    mode?: string;
  };
}

const Offline = ({ searchParams }: OfflineProps) => {
  const gameMode =
    searchParams?.mode === "master" ? EGameMode.MASTER : EGameMode.CLASSIC;

  return (
    <div>
      <OfflinePage gameMode={gameMode} />
    </div>
  );
};

export default React.memo(Offline);
