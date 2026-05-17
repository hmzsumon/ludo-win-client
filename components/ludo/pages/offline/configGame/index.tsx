import { sanizateTags } from "@/utils/helpers";
import {
  PlayersOffline,
  TProperty,
  changeColorPlayers,
  changeDataPlayers,
  changeTotalPlayers,
  getGameData,
  getInitialColorsBoard,
  getInitialDataPlayers,
  getInitialTotalPlayers,
} from "./helpers";

import React, { useState } from "react";

import InputText from "@/components/ludo/inputText";
import SelectNumberPlayers from "@/components/ludo/selectNumberPlayers";
import SelectTokenColor from "@/components/ludo/selectTokenColor";
import type {
  DataOfflineGame,
  TBoardColors,
  TColors,
  TTotalPlayers,
} from "@/interfaces";
import Switch from "react-switch";
import Icon from "../../../icon/index";

interface PlayerProps extends PlayersOffline {
  handleIsBot: (nextChecked: boolean) => void;
  handleChangeName: (name: string) => void;
  handleColor: (color: TColors) => void;
}

/**
 * Función que renderiza el UI para cada jugador...
 * @param param0
 * @returns
 */
const Player = ({
  name = "",
  color,
  isBot,
  disabled = false,
  handleIsBot,
  handleChangeName,
  handleColor,
}: PlayerProps) => (
  <div className="game-offline-player">
    <SelectTokenColor
      disabled={disabled}
      color={color}
      handleColor={handleColor}
    />
    <InputText
      disabled={disabled}
      value={name}
      onChange={(value) => handleChangeName(sanizateTags(value))}
    />
    <Switch
      disabled={disabled}
      onChange={handleIsBot}
      checked={isBot}
      checkedHandleIcon={<div className="game-offline-player-bot">🤖</div>}
    />
  </div>
);

interface ConfigGameProps {
  handlePlay: (data: DataOfflineGame) => void;
}

/**
 * Componente que carga el formulario para la configuración de la jugabilidad Offline.
 * @param param0
 * @returns
 */
const ConfigGame = ({ handlePlay }: ConfigGameProps) => {
  /**
   * Guarda la totalidad de jugadores de 2 a 4...
   */
  const [totalPlayers, setTotalPlayers] = useState<TTotalPlayers>(() =>
    getInitialTotalPlayers()
  );

  /**
   * Guardar la información de los jugadores para la jugabilidad offline...
   */
  const [players, setPlayers] = useState<PlayersOffline[]>(() =>
    getInitialDataPlayers(totalPlayers)
  );

  /**
   * Estado que guarda la distrubución de colores del board...
   */
  const [boardColor, setboardColor] = useState<TBoardColors>(() =>
    getInitialColorsBoard()
  );

  /**
   * Función que maneja el cambio de jugadores...
   * @param value
   */
  const handleTotalPlayers = (value: TTotalPlayers) => {
    changeTotalPlayers({
      totalPlayers: value,
      players,
      setTotalPlayers,
      setPlayers,
      setboardColor,
    });
  };

  /**
   * Función que maneja el cambio de información del name y isBot para los players...
   * @param index
   * @param property
   * @param value
   */
  const handleChangedata = (
    index: number,
    property: TProperty,
    value: never
  ) => {
    changeDataPlayers({
      index,
      players,
      property,
      value,
      setPlayers,
    });
  };

  /**
   * Función que maneja el cambio de color de un token, la ditrubución de colores para los demás tokens,
   * diferente al que s ele hizo el cambio, además del cambio de la ditribución de colores del board...
   * @param index
   * @param color
   */
  const handleColorDistribution = (index: number, color: TColors) => {
    changeColorPlayers({
      color,
      index,
      players,
      totalPlayers,
      setPlayers,
      setboardColor,
    });
  };

  /**
   * Maneja el envío de información para iniciar el juego...
   * @param event
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    /**
     * Función que sube la data generada para iniciar el juego...
     */
    handlePlay(getGameData(totalPlayers, players, boardColor));
  };

  return (
    <form onSubmit={handleSubmit} className="game-offline glass-effect">
      <SelectNumberPlayers
        value={totalPlayers}
        handleSelectTotal={handleTotalPlayers}
      />
      <div className="game-offline-players">
        {players.map((player) => {
          return (
            <Player
              {...player}
              key={player.index}
              handleChangeName={(name) =>
                handleChangedata(player.index, "name", name as never)
              }
              handleIsBot={(value) =>
                handleChangedata(player.index, "isBot", value as never)
              }
              handleColor={(color) =>
                handleColorDistribution(player.index, color)
              }
            />
          );
        })}
      </div>
      <button className="button yellow game-offline-play" type="submit">
        <span>
          <Icon type="play" fill="#8b5f00" />
        </span>
        Play
      </button>
    </form>
  );
};

export default React.memo(ConfigGame);
