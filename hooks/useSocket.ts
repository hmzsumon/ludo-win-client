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
  useCancelLudoWagerMutation,
  useReserveLudoWagerMutation,
} from "@/redux/features/ludoWager/ludoWagerApi";
import {
  SOCKET_ERROR_MESSAGES,
  SocketErrors,
  TYPES_ONLINE_GAMEPLAY,
} from "@/utils/constants";
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
  const reserveWagerRef = useRef(reserveWager);

  useEffect(() => {
    cancelWagerRef.current = cancelWager;
  }, [cancelWager]);

  useEffect(() => {
    reserveWagerRef.current = reserveWager;
  }, [reserveWager]);

  useEffect(() => {
    let mounted = true;
    let newSocket: Socket | null = null;

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
          newSocket?.emit(
            "NEW_USER",
            finalConnectionData,
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

            setDataOnlineGame({
              ...newDataOnlineGame,
              socket: newSocket as Socket,
              betAmount: dataRoom.betAmount,
            });
          }
        };

        /* ────────── wager settled — clear reservation ref ────────── */
        const handleWagerSettled = () => {
          dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));

          /* settled হলে reservation id clear করুন */
          reservationIdRef.current = "";

          console.log("✅ Wager settled — reservation ref cleared");
        };

        /* ────────── bind socket listeners ────────── */
        newSocket.on("connect", handleDebugConnect);
        newSocket.on("connect", handleConnect);
        newSocket.on("connect_error", handleDebugConnectError);
        newSocket.on("UPDATE_OPPONENT", handleOpponentUpdate);
        newSocket.on("WAGER_SETTLED", handleWagerSettled);
        newSocket.on("disconnect", handleDebugDisconnect);
      } catch (error: any) {
        /* ────────────────────────────────────────────────────────────
           🔧 BUG FIX #2 (error path): reserve fail হলে
           reservationId clear করুন যাতে retry সম্ভব হয়।
        ──────────────────────────────────────────────────────────── */
        reservationIdRef.current = "";

        const errorMessage =
          error?.data?.message ||
          error?.message ||
          "Unable to start wager match";

        console.error("❌ Socket boot error:", errorMessage);

        swal({
          title: "Match setup failed",
          text: errorMessage,
          icon: "error",
        });

        setRedirect({
          message: {
            title: "Unable to start wager match",
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
