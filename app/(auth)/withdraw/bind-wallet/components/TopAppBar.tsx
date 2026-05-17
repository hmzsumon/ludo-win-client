"use client";
import React from "react";
import { FaAngleLeft } from "react-icons/fa";

type Props = { title: string; onBack: () => void };

const TopAppBar: React.FC<Props> = ({ title, onBack }) => (
  <div
    className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
    style={{
      background:
        "linear-gradient(180deg,rgba(30,5,50,0.98),rgba(20,4,31,0.95))",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      backdropFilter: "blur(12px)",
    }}
  >
    <button
      onClick={onBack}
      type="button"
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-white/70 transition hover:text-white"
      style={{ background: "rgba(255,255,255,0.07)" }}
    >
      <FaAngleLeft className="text-xs" /> Back
    </button>
    <h1 className="text-base font-extrabold tracking-widest text-white uppercase">
      🔗 {title}
    </h1>
    <div className="w-16" />
  </div>
);

export default TopAppBar;
