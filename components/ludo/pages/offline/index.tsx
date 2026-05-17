"use client";

import { Suspense, lazy, useState } from "react";

import PageWrapper from "@/components/wrapper/page";
import type { DataOfflineGame } from "@/interfaces";
import Loading from "../../loading";
import Logo from "../../logo";
import ConfigGame from "./configGame";

const Game = lazy(() => import("../../index"));

const OfflinePage = () => {
  const [dataGame, setDataGame] = useState<DataOfflineGame | null>(null);

  /**
   * Si se ha seleccionado la información de jugar offline, se renderiza
   * el componente de Game, el cual se hace de forma Lazy.
   */
  if (dataGame) {
    return (
      <Suspense fallback={<Loading />}>
        <Game {...dataGame} />
      </Suspense>
    );
  }

  /**
   * Por defecto carga el UI de configuración para jugar Offline...
   */
  return (
    <PageWrapper>
      <Logo />
      <ConfigGame handlePlay={(data) => setDataGame(data)} />
    </PageWrapper>
  );
};

export default OfflinePage;
