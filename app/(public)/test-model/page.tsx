"use client";

import WinResultModal from "@/components/result/WinResultModal";
import { useState } from "react";

export default function GamePage() {
  const [showWinModal, setShowWinModal] = useState(true);

  return (
    <main className="min-h-screen bg-[#07111f]">
      <button
        onClick={() => setShowWinModal(true)}
        className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black"
      >
        Show Win Result
      </button>

      <WinResultModal
        open={showWinModal}
        onClose={() => setShowWinModal(false)}
      />
    </main>
  );
}
