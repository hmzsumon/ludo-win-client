import { CircleX } from "lucide-react";
import { useState } from "react";

const color = (index: number) =>
  index % 3 === 0
    ? "text-[#37b8ff]"
    : index % 3 === 1
      ? "text-[#9b45db]"
      : "text-[#d02bbb]";

/* ────────── Round history strip + expandable panel ────────── */
export default function RoundHistory({ history, emptyMessage = "No completed rounds yet." }: { history: number[]; emptyMessage?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="flex min-h-10 items-center bg-[#0d0e10]">
        <div className="flex min-w-0 flex-1 gap-2 overflow-hidden whitespace-nowrap px-2.5 py-1 text-xs">
          {!history.length && <span className="text-[#aaa]">{emptyMessage}</span>}
          {history.slice(0, 12).map((value, index) => (
            <span key={`${value}-${index}`} className={color(index)}>
              {value.toFixed(2)}x
            </span>
          ))}
        </div>
        <button
          type="button"
          aria-label="Expand round history"
          onClick={() => setOpen(true)}
          className="mr-1.5 h-7 w-10 rounded-full bg-[#303136] text-[15px] tracking-wider text-[#aaa]"
        >
          •••
        </button>
      </div>
      {open && (
        <section className="mx-2 my-1.5 rounded-[20px] bg-[#1b1c1e] px-4 py-3 shadow-[0_4px_0_#111]">
          <div className="flex items-center justify-between text-sm text-[#bbb]">
            Round History
            <button
              type="button"
              aria-label="Close round history"
              onClick={() => setOpen(false)}
            >
              <CircleX className="h-6 w-6" />
            </button>
          </div>
          {!history.length && <p className="mt-3 text-xs text-[#aaa]">{emptyMessage}</p>}
          <div className="mt-4 grid max-h-64 grid-cols-5 gap-3 overflow-y-auto text-xs sm:grid-cols-7">
            {history.map((value, index) => (
              <span key={`${value}-${index}`} className={color(index)}>
                {value.toFixed(2)}x
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
