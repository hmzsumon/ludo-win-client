"use client";

/* ────────── imports ────────── */
import socketUrl from "@/config/socketUrl";
import { apiSlice } from "@/redux/features/api/apiSlice";
import { logoutUser, updateUserStatus } from "@/redux/features/auth/authSlice";
import { SocketUser } from "@/types";
import { removeAccessToken } from "@/utils/authToken";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

/* ────────── types ────────── */
interface iSocketContextType {
  socket: Socket | null;
  isSocketConnected: boolean;
  onlineUsers: SocketUser[];
}

/* ────────── context ────────── */
export const SocketContext = createContext<iSocketContextType | null>(null);

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

/* ────────── provider ────────── */
export const SocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: any) => state.auth);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([]);

  /* ────────── sound ────────── */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/ball.mp3");

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  /* ────────── connect notification socket ────────── */
  useEffect(() => {
    if (!user?._id) return;

    /* ────────── resolve access token for socket auth ────────── */
    const accessToken = getSocketAccessToken();

    /* ────────── socket connect debug ────────── */
    console.log("/* ────────── notification socket debug ────────── */");
    console.log("🌐 notification socket url:", socketUrl);
    console.log(
      "🔐 notification socket access token:",
      accessToken ? "FOUND" : "MISSING",
    );
    console.log("👤 notification user:", String(user._id));

    /* ────────── create socket instance ────────── */
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token: accessToken,
      },
    });

    /* ────────── socket connected debug ────────── */
    const handleConnectDebug = () => {
      console.log("🟢 notification socket connected:", newSocket.id);
    };

    /* ────────── socket connect error debug ────────── */
    const handleConnectErrorDebug = (err: any) => {
      console.error("🔴 notification socket connect_error:", err?.message, err);
    };

    /* ────────── socket disconnect debug ────────── */
    const handleDisconnectDebug = (reason: string) => {
      console.warn("🟠 notification socket disconnected:", reason);
    };

    /* ────────── join personal and role rooms ────────── */
    const handleConnect = () => {
      newSocket.emit("join-room", String(user._id));

      if (user?.role === "admin") {
        newSocket.emit("join-admin-room");
      }

      if (user?.role === "agent") {
        newSocket.emit("join-agent-room");
      }

      setSocket(newSocket);
      setIsSocketConnected(true);
    };

    /* ────────── handle disconnected state ────────── */
    const handleDisconnectState = () => {
      setIsSocketConnected(false);
    };

    /* ────────── bind socket listeners ────────── */
    newSocket.on("connect", handleConnectDebug);
    newSocket.on("connect", handleConnect);
    newSocket.on("connect_error", handleConnectErrorDebug);
    newSocket.on("disconnect", handleDisconnectDebug);
    newSocket.on("disconnect", handleDisconnectState);

    /* ────────── cleanup ────────── */
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsSocketConnected(false);
    };
  }, [user?._id, user?.role]);

  /* ────────── socket listeners ────────── */
  useEffect(() => {
    if (!socket) return;

    /* ────────── get online users ────────── */
    const onGetUsers = (users: SocketUser[]) => {
      setOnlineUsers(users);
    };

    /* ────────── user notification ────────── */
    const onUserNotification = (payload: any) => {
      const n = payload?.notification;
      if (!n?._id) return;

      toast.success(payload?.message || n?.title || "New notification");

      dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));
      dispatch(apiSlice.util.invalidateTags(["Deposits"]));

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    /* ────────── admin notification ────────── */
    const onAdminNotification = (payload: any) => {
      const n = payload?.notification;
      if (!n?._id) return;

      toast.success(payload?.message || n?.title || "Admin notification");

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    /* ════════════════════════════════════════════════════════════════
       admin triggered account events — real-time restriction apply
       ════════════════════════════════════════════════════════════════ */

    /* ────────── account closed → সব device থেকে force logout ────────── */
    /* admin "close account" করলে এই event আসবে */
    /* user কে logout করে /login এ redirect করা হবে */
    const onAccountClosed = () => {
      toast.error("⛔ Your account has been permanently closed.", {
        duration: 5000,
      });

      /* ────────── token clear + redux logout ────────── */
      removeAccessToken();
      dispatch(logoutUser());

      /* ────────── login page এ redirect ────────── */
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    };

    /* ────────── account inactive → withdraw/deposit/online game block ────────── */
    /* admin "inactive" করলে এই event আসবে */
    /* user কে page reload ছাড়াই restrict করা হয় */
    const onAccountInactive = (payload: any) => {
      toast.error("🚫 Your account has been deactivated by admin.", {
        duration: 5000,
      });

      /* ────────── redux store এ is_active false করা হয় ────────── */
      dispatch(updateUserStatus({ is_active: false }));

      /* ────────── fresh user data load করা হয় API থেকে ────────── */
      dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));
    };

    /* ────────── account active → restriction তুলে নেওয়া হয় ────────── */
    /* admin "active" করলে এই event আসবে */
    const onAccountActive = (payload: any) => {
      toast.success("✅ Your account has been activated.", {
        duration: 4000,
      });

      /* ────────── redux store এ is_active true করা হয় ────────── */
      dispatch(updateUserStatus({ is_active: true }));
      dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));
    };

    /* ────────── withdraw blocked → withdraw page এ message দেখাবে ────────── */
    /* admin "block withdraw" করলে এই event আসবে */
    const onWithdrawBlocked = (payload: any) => {
      toast.error("🔒 Your withdrawal access has been blocked.", {
        duration: 5000,
      });

      /* ────────── redux store এ is_withdraw_block true করা হয় ────────── */
      dispatch(updateUserStatus({ is_withdraw_block: true }));
      dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));
    };

    /* ────────── withdraw unblocked → withdraw page আবার চালু হয় ────────── */
    const onWithdrawUnblocked = (payload: any) => {
      toast.success("🔓 Your withdrawal access has been restored.", {
        duration: 4000,
      });

      /* ────────── redux store এ is_withdraw_block false করা হয় ────────── */
      dispatch(updateUserStatus({ is_withdraw_block: false }));
      dispatch(apiSlice.util.invalidateTags([{ type: "User", id: "ME" }]));
    };

    /* ────────── bind listeners ────────── */
    socket.on("getUsers", onGetUsers);
    socket.on("user-notification", onUserNotification);
    socket.on("admin-notification", onAdminNotification);

    /* ────────── admin status event listeners ────────── */
    socket.on("account-closed", onAccountClosed);
    socket.on("account-inactive", onAccountInactive);
    socket.on("account-active", onAccountActive);
    socket.on("withdraw-blocked", onWithdrawBlocked);
    socket.on("withdraw-unblocked", onWithdrawUnblocked);

    /* ────────── cleanup listeners ────────── */
    return () => {
      socket.off("getUsers", onGetUsers);
      socket.off("user-notification", onUserNotification);
      socket.off("admin-notification", onAdminNotification);

      /* ────────── admin status event cleanup ────────── */
      socket.off("account-closed", onAccountClosed);
      socket.off("account-inactive", onAccountInactive);
      socket.off("account-active", onAccountActive);
      socket.off("withdraw-blocked", onWithdrawBlocked);
      socket.off("withdraw-unblocked", onWithdrawUnblocked);
    };
  }, [socket, dispatch]);

  return (
    <SocketContext.Provider value={{ socket, isSocketConnected, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

/* ────────── custom hook ────────── */
export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }

  return context;
};
