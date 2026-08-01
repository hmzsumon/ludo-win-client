"use client";

import { ROOM_RANGE } from "@/utils/constants";
import { isAValidRoom } from "@/utils/helpers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const useGetRoomURL = (isAuth = false, cb: (roomCode: string) => void) => {
  const searchParams = useSearchParams(); // Read-only
  const router = useRouter();
  const pathname = usePathname();

  // Effect reruns only when the actual query string changes
  const searchParamsStr = searchParams.toString();

  useEffect(() => {
    const roomName = searchParams.get("room") ?? "";
    if (!roomName) return;

    /* FIX ▸ Keep invite URL until login; otherwise the room code was lost. */
    if (!isAuth || !isAValidRoom(roomName) || roomName.length !== ROOM_RANGE)
      return;

    // Remove `room` only after the authenticated user captured it.
    const params = new URLSearchParams(searchParamsStr);
    params.delete("room");
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl, { scroll: false });

    /* NEW ▸ Preview screen decides Free/Wager before any reservation. */
    cb(roomName);
  }, [searchParamsStr, pathname, router, isAuth, cb]);
};

export default useGetRoomURL;
