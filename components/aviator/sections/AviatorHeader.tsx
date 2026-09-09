import { CircleX } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

/* ────────── Aviator top header ────────── */
export default function AviatorHeader({
  balance,
  onClose,
  funMode = false,
  menu,
}: {
  balance: number;
  onClose: () => void;
  funMode?: boolean;
  menu?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 flex h-10 items-center gap-2 bg-[#1b1c1e] px-2">
      <Image
        src="/images/aviator/logo-aviator.png"
        alt="Aviator"
        width={143}
        height={41}
        priority
        className="h-auto w-[86px] object-contain"
      />
      <div className="ml-auto min-w-0 truncate text-[14px] font-bold text-[#29bc12] sm:text-[16px]">
        {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
        <span className="font-normal text-[#aaa]">{funMode ? "Fun BDT" : "BDT"}</span>
      </div>
      {menu}
      <button type="button" aria-label="Back to home" onClick={onClose}>
        <CircleX className="h-6 w-6" />
      </button>
    </header>
  );
}
