"use client";

import { isAValidRoom, validateLastValueRoomName } from "@/utils/helpers";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import type { IDataPlayWithFriends, TTotalPlayers } from "../interfaces";
import { TYPES_ONLINE_GAMEPLAY } from "../utils/constants";

const useGetRoomURL = (
  isAuth = false,
  cb: (data: IDataPlayWithFriends) => void
) => {
  const searchParams = useSearchParams(); // Read-only
  const router = useRouter();
  const pathname = usePathname();

  // Effect reruns only when the actual query string changes
  const searchParamsStr = searchParams.toString();

  useEffect(() => {
    const roomName = searchParams.get("room") ?? "";
    if (!roomName) return;

    // Remove `room` from the URL (no full reload, no history entry)
    const params = new URLSearchParams(searchParamsStr);
    params.delete("room");
    const newUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname;
    router.replace(newUrl, { scroll: false });

    // Business logic
    if (isAValidRoom(roomName) && isAuth) {
      const { isValid, numPlayers } = validateLastValueRoomName(roomName);
      if (isValid) {
        cb({
          type: TYPES_ONLINE_GAMEPLAY.JOIN_ROOM,
          roomName,
          totalPlayers: numPlayers as TTotalPlayers,
        });
      }
    }
  }, [searchParamsStr, pathname, router, isAuth, cb]);
};

export default useGetRoomURL;
