import React from "react";
import Icon from "../../../../icon";

const ModalShareHeader = ({
  label = "Share...",
  onCloseModal,
}: {
  label?: string;
  onCloseModal: (isShare?: boolean) => void;
}) => {
  return (
    <div className="modal-share-header">
      <h4>{label}</h4>
      <button onClick={() => onCloseModal()}>
        <Icon type="close" fill="black" />
      </button>
    </div>
  );
};

export default React.memo(ModalShareHeader);
