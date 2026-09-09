import type { RefObject } from "react";

/* ────────── Cocos flight canvas frame ────────── */
export default function FlightFrame({
  frameRef,
}: {
  frameRef: RefObject<HTMLIFrameElement>;
}) {
  return (
    <div className="mx-2 mb-1.5 aspect-video overflow-hidden rounded-[16px] border border-[#292b2e] bg-[#020304]">
      <iframe
        ref={frameRef}
        title="Aviator flight"
        src="/games/aviator/index.html"
        allow="autoplay"
        className="block h-full w-full border-0"
      />
    </div>
  );
}
