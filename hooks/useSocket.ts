"use client";

/* ────────── imports ────────── */
import { useEffect, useMemo, useRef } from "react";
import { io, Socket } from "socket.io-client";
import swal from "sweetalert";

import socketUrl from "@/config/socketUrl";
import type {
  IDataOnline,
  IDataRoom,
  IDataRoomSocket,
  IDataSocket,
  TSocketErrors,
} from "@/interfaces";
import { apiSlice } from "@/redux/features/api/apiSlice";
import {
  useCancelLudoFriendRoomMutation,
  useCancelLudoWagerMutation,
  useReserveLudoWagerMutation,
} from "@/redux/features/ludoWager/ludoWagerApi";
import {
  SOCKET_ERROR_MESSAGES,
  SocketErrors,
  TYPES_ONLINE_GAMEPLAY,
} from "@/utils/constants";
import {
  clearLudoActiveSocketSession,
  saveLudoActiveSocketSession,
} from "@/utils/ludoActiveGame";
import { getDataOnlineGame, updateDataRoomSocket } from "@/utils/sockets";
import { useState } from "react";
import { useDispatch } from "react-redux";
import useShowMessageRedirect from "./useShowMessageRedirect";

/* ────────── token helper ────────── */
const getSocketAccessToken = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    null
  );
};

const useSocket = (connectionData: IDataSocket) => {
  const dispatch = useDispatch();
  const setRedirect = useShowMessageRedirect();
  const [reserveWager] = useReserveLudoWagerMutation();
  const [cancelWager] = useCancelLudoWagerMutation();
  const [cancelFriendRoom] = useCancelLudoFriendRoomMutation();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [dataRoomSocket, setDataRoomSocket] = useState<IDataRoomSocket | null>(
    null,
  );
  const [dataOnlineGame, setDataOnlineGame] = useState<IDataOnline | null>(
    null,
  );

  const currentUser = useMemo(() => connectionData.user, [connectionData.user]);

  /* ────────────────────────────────────────────────────────────────
     🔧 BUG FIX #2: connectionData কে ref-এ রাখুন।

     আগের সমস্যা: useEffect-এর dependency array-তে `connectionData`
     ছিল। connectionData যেকোনো কারণে re-render হলে useEffect
     আবার চলত — নতুন reservation তৈরি হত কিন্তু আগেরটা cancel
     হত না। ফলে পরের বার "already have active wager reservation"
     error আসত।

     সমাধান:
     ─ connectionData কে ref-এ রাখুন
     ─ useEffect dependency array-এ শুধু stable value রাখুন
     ─ component unmount হলে সবসময় reservation cancel করুন
  ──────────────────────────────────────────────────────────────── */
  const connectionDataRef = useRef<IDataSocket>(connectionData);
  const reservationIdRef = useRef<string>(connectionData.reservationId || "");
  const matchedRef = useRef(false);
  const socketRef = useRef<Socket | null>(null);
  /* NEW ▸ Prevent callback + socket event from showing cancellation twice. */
  const systemCancellationHandledRef = useRef(false);

  /* ────────────────────────────────────────────────────────────────
     🔧 NETWORK SWITCH FIX: room-scoped rejoin payload.

     Once a match is live, every socket reconnect MUST re-enter the same
     room through JOIN_ROOM instead of re-running matchmaking. Without
     this, a network change (WiFi ↔ mobile data) re-sends the original
     JOIN_EXISTING_ROOM payload; the server rejects it because the
     reservation is already "matched", the player never rejoins the live
     room, and they are left with a stuck "active wager match" that
     blocks every new match until the 45-minute TTL expires.
  ──────────────────────────────────────────────────────────────── */
  const rejoinPayloadRef = useRef<IDataSocket | null>(null);

  /* ────────── connectionData ref সর্বদা latest রাখুন ────────── */
  useEffect(() => {
    connectionDataRef.current = connectionData;
  }, [connectionData]);

  /* ────────── reservation id sync ────────── */
  useEffect(() => {
    if (connectionData.reservationId) {
      reservationIdRef.current = connectionData.reservationId;
    }
  }, [connectionData.reservationId]);

  /* ────────────────────────────────────────────────────────────────
     Main socket effect — শুধু একবার mount-এ চলে।
     
     cancelWager এবং reserveWager stable mutation ref হিসেবে
     রাখা হয়েছে যাতে re-run না হয়।
  ──────────────────────────────────────────────────────────────── */
  const cancelWagerRef = useRef(cancelWager);
  const cancelFriendRoomRef = useRef(cancelFriendRoom);
  const reserveWagerRef = useRef(reserveWager);

  useEffect(() => {
    cancelWagerRef.current = cancelWager;
  }, [cancelWager]);

  useEffect(() => {
    cancelFriendRoomRef.current = cancelFriendRoom;
  }, [cancelFriendRoom]);

  useEffect(() => {
    reserveWagerRef.current = reserveWager;
  }, [reserveWager]);

  useEffect(() => {
    let mounted = true;
    let newSocket: Socket | null = null;
    let detachNetworkListeners: (() => void) | null = null;

    /* ────────────────────────────────────────────────────────────
       🔧 BUG FIX #2 (core): cleanup reservation সবসময় চলবে।

       আগের code-এ matchedRef.current check ছিল — matched হলে
       cancel হত না, কিন্তু player game থেকে বের হয়ে আবার
       search করলে old reservation DB-তে থেকে যেত।

       নতুন logic:
       ─ matched হলে reservationIdRef clear করুন (WAGER_SETTLED তে)
       ─ unmount-এ reservationIdRef-এ যা আছে তা cancel করুন
       ─ এতে: game শেষে cancel হবে না (cleared), কিন্তু
         user বের হয়ে গেলে pending reservation cancel হবে
    ──────────────────────────────────────────────────────────── */
    const cleanupReservation = async () => {
      const data = connectionDataRef.current;

      /* NEW ▸ Cancelling a waiting friend room refunds every participant. */
      if (data.friendMatchType && data.roomName) {
        reservationIdRef.current = "";
        try {
          await cancelFriendRoomRef
            .current({ roomCode: data.roomName })
            .unwrap();
        } catch {
          /* A started/settled room correctly rejects cancellation. */
        }
        return;
      }

      if (
        !reservationIdRef.current ||
        data.type !== TYPES_ONLINE_GAMEPLAY.JOIN_EXISTING_ROOM ||
        !data.betAmount
      ) {
        return;
      }

      const idToCancel = reservationIdRef.current;

      /* cancel করার আগেই clear করুন — double cancel prevent */
      reservationIdRef.current = "";

      try {
        await cancelWagerRef
          .current({
            reservationId: idToCancel,
          })
          .unwrap();

        console.log("✅ Wager reservation cancelled on cleanup:", idToCancel);
      } catch (err: any) {
        /*
         * "Reservation already processed" error ignore করুন
         * কারণ matched/settled reservation cancel করা যায় না।
         * এটা expected behavior।
         */
        if (err?.status !== 200) {
          console.warn(
            "⚠️ Cleanup cancel failed (may be already processed):",
            err?.data?.message || err?.message,
          );
        }
      }
    };

    /* ────────── boot socket flow ────────── */
    const boot = async () => {
      try {
        /* latest connectionData নিন */
        const data = connectionDataRef.current;
        let finalConnectionData = { ...data };

        /* ────────── reserve wager before quick-match socket connect ────────── */
        if (
          data.type === TYPES_ONLINE_GAMEPLAY.JOIN_EXISTING_ROOM &&
          data.totalPlayers === 2 &&
          Number(data.betAmount) > 0
        ) {
          if (data.playAsGuest) {
            swal({
              title: "Login required",
              text: "Wager match is available only for logged-in users",
              icon: "info",
            });
            setRedirect({
              message: {
                title: "Please login to join wager match",
                icon: "info",
                timer: 4000,
              },
            });
            return;
          }

          /* ────────────────────────────────────────────────────────
             🔧 BUG FIX #2 (reservation): আগের reservation থাকলে
             নতুন করে reserve করবেন না।
             
             এটা handle করে: component re-mount হলে
             duplicate reservation তৈরি না হওয়া।
          ──────────────────────────────────────────────────────── */
          if (!reservationIdRef.current) {
            const reserveResponse = await reserveWagerRef
              .current({
                amount: Number(data.betAmount),
                totalPlayers: 2,
              })
              .unwrap();

            reservationIdRef.current = reserveResponse.reservationId;
            console.log(
              "✅ Wager reserved:",
              reservationIdRef.current,
              "amount:",
              data.betAmount,
            );
          }

          finalConnectionData = {
            ...finalConnectionData,
            reservationId: reservationIdRef.current,
          };
        }

        if (!mounted) return;

        /* ────────── resolve access token for socket auth ────────── */
        const accessToken = getSocketAccessToken();

        console.log("/* ────────── game socket debug ────────── */");
        console.log("🌐 game socket url:", socketUrl);
        console.log(
          "🔐 game socket access token:",
          accessToken ? "FOUND" : "MISSING",
        );
        console.log(
          "👤 game socket payload user:",
          finalConnectionData?.user?.id || "NO_USER_ID",
        );

        /* ────────── create socket instance ────────── */
        newSocket = io(socketUrl, {
          withCredentials: true,
          transports: ["websocket", "polling"],
          autoConnect: true,
          reconnection: true,
          /* NEW ▸ Recover fast and indefinitely across WiFi ↔ mobile-data
           * switches so a live match is never abandoned on a brief outage. */
          reconnectionAttempts: Infinity,
          reconnectionDelay: 500,
          reconnectionDelayMax: 4000,
          timeout: 10000,
          auth: {
            token: accessToken,
          },
        });

        socketRef.current = newSocket;

        /* ────────── set socket state ────────── */
        setSocket(newSocket);

        /* ────────── debug listeners ────────── */
        const handleDebugConnect = () => {
          console.log("🟢 game socket connected:", newSocket?.id);
        };

        const handleDebugConnectError = (err: any) => {
          console.error("🔴 game socket connect_error:", err?.message, err);
        };

        const handleDebugDisconnect = (reason: string) => {
          console.warn("🟠 game socket disconnected:", reason);
        };

        /* ────────── socket connected — send NEW_USER payload ────────── */
        const handleConnect = () => {
          /*
           * NEW ▸ After the match is live, a reconnect must rejoin the SAME
           * room via JOIN_ROOM. The first connect (rejoinPayloadRef empty)
           * still runs the original matchmaking request unchanged.
           */
          const emitPayload = rejoinPayloadRef.current || finalConnectionData;

          newSocket?.emit(
            "NEW_USER",
            emitPayload,
            (error?: TSocketErrors | null) => {
              if (!error) return;

              const isAuthError =
                error === SocketErrors.AUTHENTICATED ||
                error === SocketErrors.UNAUTHENTICATED;

              if (isAuthError) {
                return swal({
                  title: "Authentication Error",
                  text: SOCKET_ERROR_MESSAGES[error],
                  icon: "info",
                  closeOnClickOutside: false,
                  closeOnEsc: false,
                  timer: 5000,
                }).then(() => window.location.reload());
              }

              if (error === SocketErrors.MATCH_CANCELLED_REFUNDED) {
                reservationIdRef.current = "";
                matchedRef.current = false;
                rejoinPayloadRef.current = null;
                clearLudoActiveSocketSession();
                dispatch(
                  apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]),
                );

                if (!systemCancellationHandledRef.current) {
                  systemCancellationHandledRef.current = true;
                  swal({
                    title: "Match cancelled",
                    text: SOCKET_ERROR_MESSAGES.MATCH_CANCELLED_REFUNDED,
                    icon: "info",
                    closeOnClickOutside: false,
                    closeOnEsc: false,
                  }).then(() => window.location.assign("/online"));
                }
                return;
              }

              /* ────────── stale room/session হলে local resume cache clear ────────── */
              if (error === SocketErrors.INVALID_ROOM) {
                clearLudoActiveSocketSession();
                if (
                  finalConnectionData.friendMatchType &&
                  finalConnectionData.roomName
                ) {
                  void cancelFriendRoomRef.current({
                    roomCode: finalConnectionData.roomName,
                  });
                }
                reservationIdRef.current = "";
                /*
                 * NEW ▸ The live room is truly gone (server restart, or the
                 * disconnect grace already settled it). Drop the rejoin payload
                 * so the next connect does not loop on a dead room; the stale
                 * reservation is already settled/released, so the lobby is free.
                 */
                rejoinPayloadRef.current = null;
              }

              setRedirect({
                message: {
                  title:
                    SOCKET_ERROR_MESSAGES[error] ??
                    "Unknown socket error occured",
                  icon: "error",
                  timer: 5000,
                },
              });
            },
          );
        };

        /* ────────── update room players and launch game ────────── */
        const handleOpponentUpdate = (dataRoom: IDataRoom) => {
          const newDataRoomSocket = updateDataRoomSocket(dataRoom, currentUser);
          setDataRoomSocket(newDataRoomSocket);

          if (newDataRoomSocket.isFull) {
            /* ────────────────────────────────────────────────────────
               🔧 BUG FIX #2: matched হলে reservationId clear করুন।
               এতে unmount-এ cleanupReservation cancel করবে না
               (কারণ id ইতিমধ্যে clear)। Matched game এর
               reservation server-এ settled হবে নিজে থেকেই।
            ──────────────────────────────────────────────────────── */
            matchedRef.current = true;

            const newDataOnlineGame = getDataOnlineGame(
              newDataRoomSocket,
              dataRoom,
            );

            const activeSession = {
              ...connectionDataRef.current,
              type: TYPES_ONLINE_GAMEPLAY.JOIN_ROOM,
              roomName: dataRoom.roomName,
              totalPlayers: dataRoom.totalPlayers,
              betAmount: dataRoom.betAmount,
              gameMode: dataRoom.gameMode,
              friendMatchType: dataRoom.friendMatchType,
            };

            saveLudoActiveSocketSession(activeSession);

            /*
             * 🔧 NETWORK SWITCH FIX: from now on, any socket reconnect
             * re-enters this exact room (server reconnect path handles the
             * "matched" reservation and clears the disconnect grace timer)
             * instead of firing a fresh matchmaking request.
             */
            rejoinPayloadRef.current = {
              ...activeSession,
              reservationId:
                reservationIdRef.current ||
                connectionDataRef.current.reservationId,
            };

            setDataOnlineGame({
              ...newDataOnlineGame,
              socket: newSocket as Socket,
              betAmount: dataRoom.betAmount,
              friendMatchType: dataRoom.friendMatchType,
            });
          }
        };

        /* ────────── wager settled — clear reservation ref ────────── */
        const handleWagerSettled = () => {
          dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));

          /* settled হলে reservation id clear করুন */
          reservationIdRef.current = "";
          /* NEW ▸ Match is over — stop rejoining this room on reconnect. */
          rejoinPayloadRef.current = null;

          console.log("✅ Wager settled — reservation ref cleared");
        };

        const handleFriendRoomCancelled = (payload: any) => {
          reservationIdRef.current = "";
          clearLudoActiveSocketSession();
          swal({
            title: "Friend room closed",
            text: payload?.message || "The room was cancelled before start",
            icon: "info",
          }).then(() => window.location.reload());
        };

        const handleFriendActionRejected = (payload: any) => {
          const recoverable = payload?.recoverable !== false;
          swal({
            title: recoverable ? "Game synchronized" : "Match paused",
            text: recoverable
              ? `${payload?.message || "A delayed or duplicate action was ignored"}. Your wager is safe and the server state remains active.`
              : payload?.message ||
                "The server paused this match while it restores a safe state",
            icon: recoverable ? "info" : "warning",
            timer: recoverable ? 1800 : undefined,
            buttons: recoverable ? [] : undefined,
          });
        };

        /*
         * NEW ▸ A real server/engine/state failure is different from a normal
         * rejected action. The server has already committed both refunds in a
         * MongoDB transaction before this event is sent, so clear the stale
         * game locally, refresh wallet data and return to the online lobby.
         */
        const handleWagerMatchCancelled = (payload: any) => {
          if (systemCancellationHandledRef.current) return;
          systemCancellationHandledRef.current = true;
          reservationIdRef.current = "";
          matchedRef.current = false;
          rejoinPayloadRef.current = null;
          clearLudoActiveSocketSession();
          dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));

          setDataOnlineGame(null);
          setDataRoomSocket(null);
          newSocket?.disconnect();

          const refundedAmount = Number(payload?.refundedAmount || 0);
          const refundText = refundedAmount
            ? ` ${refundedAmount} was returned to your balance.`
            : " Your wager was returned to your balance.";

          swal({
            title: "Match cancelled & refunded",
            text: `${payload?.message || "The server could not safely continue this match."}${refundText}`,
            icon: "info",
            closeOnClickOutside: false,
            closeOnEsc: false,
          }).then(() => window.location.assign("/online"));
        };

        /* ────────── bind socket listeners ────────── */
        newSocket.on("connect", handleDebugConnect);
        newSocket.on("connect", handleConnect);
        newSocket.on("connect_error", handleDebugConnectError);
        newSocket.on("UPDATE_OPPONENT", handleOpponentUpdate);
        newSocket.on("WAGER_SETTLED", handleWagerSettled);
        newSocket.on("FRIEND_ROOM_CANCELLED", handleFriendRoomCancelled);
        newSocket.on("FRIEND_ACTION_REJECTED", handleFriendActionRejected);
        newSocket.on("WAGER_MATCH_CANCELLED", handleWagerMatchCancelled);
        newSocket.on("disconnect", handleDebugDisconnect);

        /* ────────────────────────────────────────────────────────────
           🔧 NETWORK SWITCH FIX: force an immediate reconnect.

           A WiFi ↔ mobile-data switch never fires page unload, and the
           socket ping-timeout can take ~20s to notice the dead link.
           Reconnecting the moment the device is back online (or the app
           returns to the foreground) gets the player rejoined well
           within the server's disconnect grace window, so the live
           wager match is never abandoned.
        ──────────────────────────────────────────────────────────── */
        const forceReconnectIfNeeded = () => {
          if (!newSocket || newSocket.connected) return;
          if (typeof navigator !== "undefined" && navigator.onLine === false) {
            return;
          }
          newSocket.connect();
        };

        const handleNetworkOnline = () => forceReconnectIfNeeded();
        const handleVisibilityChange = () => {
          if (
            typeof document !== "undefined" &&
            document.visibilityState === "visible"
          ) {
            forceReconnectIfNeeded();
          }
        };

        window.addEventListener("online", handleNetworkOnline);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        detachNetworkListeners = () => {
          window.removeEventListener("online", handleNetworkOnline);
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
          detachNetworkListeners = null;
        };
      } catch (error: any) {
        /* ────────────────────────────────────────────────────────────
           🔧 BUG FIX #2 (error path): reserve fail হলে
           reservationId clear করুন যাতে retry সম্ভব হয়।
           stale local room/session cache-ও clear করুন।
        ──────────────────────────────────────────────────────────── */
        reservationIdRef.current = "";
        clearLudoActiveSocketSession();

        /*
         * BUG FIX ▸ API errorHandler `{ error: message }` পাঠায়। আগে শুধু
         * `data.message` পড়ায় আসল 409 কারণ লুকিয়ে generic message দেখাত।
         */
        const errorMessage =
          error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          "Unable to start wager match";

        console.error("❌ Socket boot error:", {
          status: error?.status,
          message: errorMessage,
          response: error?.data,
        });

        /* একই error modal একবার দেখিয়ে lobby-তে ফেরত পাঠান। */
        setRedirect({
          message: {
            title: errorMessage,
            icon: "error",
            timer: 4000,
          },
        });
      }
    };

    boot();

    /* ────────── cleanup on unmount ────────── */
    return () => {
      mounted = false;

      if (detachNetworkListeners) {
        detachNetworkListeners();
      }

      if (newSocket) {
        newSocket.disconnect();
      }

      socketRef.current = null;
      setSocket(null);
      setDataRoomSocket(null);
      setDataOnlineGame(null);

      /*
       * 🔧 BUG FIX #2: Unconditionally cleanup reservation on unmount.
       * reservationIdRef.current এ id থাকলে cancel করুন।
       * matched/settled হলে id আগেই clear হয়ে গেছে।
       */
      void cleanupReservation();
    };

    /*
     * 🔧 BUG FIX #2: Dependency array থেকে connectionData সরিয়েছি।
     * connectionData ref-এ রাখা হয়েছে তাই এখানে দরকার নেই।
     * এতে re-render-এ duplicate reservation/socket তৈরি হবে না।
     *
     * cancelWager/reserveWager mutation গুলো ref-এ রাখা হয়েছে।
     * currentUser এবং dispatch stable।
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, dispatch, setRedirect]);

  return { socket, dataRoomSocket, dataOnlineGame };
};

export default useSocket;
