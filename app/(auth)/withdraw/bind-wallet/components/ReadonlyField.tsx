"use client";

import React from "react";

type Props = {
  label: string;
  value: string;
};

const ReadonlyField: React.FC<Props> = ({ label, value }) => {
  return (
    <div className="mt-3">
      <label className="mb-2 block text-[12px] font-medium text-white/70">
        {label}
      </label>

      <div
        className="w-full rounded-xl px-4 py-3 text-sm text-white/90"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {value}
      </div>
    </div>
  );
};

export default ReadonlyField;
