"use client";

import usePortal from "@/hooks/usePortal";
import { ButtonOptions, ModalOptions } from "./components";

import React, { useState } from "react";
import { useSelector } from "react-redux";
import UserOption from "./components/user/UserOption";

/**
 * Componente que renderiza el botón para mostrar las opciones
 * además del modal, en este caso dentro de un portal...
 * @returns
 */
const Options = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [showOptions, setShowOptions] = useState(false);

  /**
   * Crear un portal personalizado para renderizar el menú de opciones...
   */
  const renderOptions = usePortal({
    container: ".screen",
    id: "overlay-options",
  });

  return (
    <React.Fragment>
      <div className="flex gap-2">
        <ButtonOptions onClick={() => setShowOptions(true)} />
        {isAuthenticated && <UserOption />}
      </div>
      {renderOptions(
        showOptions && (
          <ModalOptions handleClose={() => setShowOptions(false)} />
        ),
      )}
    </React.Fragment>
  );
};

export default React.memo(Options);
