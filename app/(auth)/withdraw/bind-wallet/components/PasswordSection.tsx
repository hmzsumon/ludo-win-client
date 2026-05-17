"use client";

import React from "react";
import PasswordField from "./PasswordField";

type Props = {
  txPass: string;
  txPass2: string;
  onChangeTxPass: (v: string) => void;
  onChangeTxPass2: (v: string) => void;
  show1: boolean;
  show2: boolean;
  onToggle1: () => void;
  onToggle2: () => void;
  passErr: string;
  matchErr: string;
  hasTnxPassword: boolean;
};

const PasswordSection: React.FC<Props> = ({
  txPass,
  txPass2,
  onChangeTxPass,
  onChangeTxPass2,
  show1,
  show2,
  onToggle1,
  onToggle2,
  passErr,
  matchErr,
  hasTnxPassword,
}) => {
  return (
    <>
      <div
        className="mt-4 rounded-xl p-3 text-[11px] leading-5"
        style={{
          background: "rgba(255,160,80,0.07)",
          border: "1px solid rgba(255,160,80,0.2)",
          color: "rgba(255,200,120,0.8)",
        }}
      >
        ⚠️ Please set up your transaction password. This is a 6-digit PIN used
        to confirm withdrawals.
      </div>

      <PasswordField
        label="* Set transaction password"
        value={txPass}
        onChange={onChangeTxPass}
        show={show1}
        onToggle={onToggle1}
        error={passErr}
      />

      {!hasTnxPassword && (
        <PasswordField
          label="* Confirm password"
          value={txPass2}
          onChange={onChangeTxPass2}
          show={show2}
          onToggle={onToggle2}
          error={matchErr}
        />
      )}
    </>
  );
};

export default PasswordSection;
