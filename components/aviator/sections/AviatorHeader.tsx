import { CircleX } from "lucide-react";
import Image from "next/image";

/* ────────── Aviator top header ────────── */
export default function AviatorHeader({
  balance,
  onClose,
  funMode = false,
}: {
  balance: number;
  onClose: () => void;
  funMode?: boolean;
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
      <div className="ml-auto text-[16px] font-bold text-[#29bc12]">
        {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
        <span className="font-normal text-[#aaa]">{funMode ? "Fun BDT" : "BDT"}</span>
      </div>
      <button type="button" aria-label="Back to home" onClick={onClose}>
        <CircleX className="h-6 w-6" />
      </button>
    </header>
  );
}
