"use client";

import DashboardLayoutShell from "@/components/auth/Layout";
import UserNoticePopup from "@/components/notice/UserNoticePopup";
import { useLoadUserQuery } from "@/redux/features/auth/authApi";
import { logoutUser } from "@/redux/features/auth/authSlice";
import { removeAccessToken } from "@/utils/authToken";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading, isError } = useLoadUserQuery();
  const { user } = useSelector((s: any) => s.auth) || { user: null };
  const dispatch = useDispatch();
  const router = useRouter();

  /* ════════════════════════════════════════════════════════════════
     permanent account close — auto force logout
     কাজ: API থেকে load হওয়া user এ is_permanent_closed=true থাকলে
     বা socket event এ account-closed আসলে force logout হয়
     এই useEffect টা safety net হিসেবে কাজ করে
     ════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (user?.is_permanent_closed === true) {
      /* ────────── token clear + redux state clear ────────── */
      removeAccessToken();
      dispatch(logoutUser());

      /* ────────── login page এ redirect ────────── */
      router.replace("/login");
    }
  }, [user?.is_permanent_closed, dispatch, router]);

  return (
    <DashboardLayoutShell>
      <div>
        {children}
        <UserNoticePopup />
      </div>
    </DashboardLayoutShell>
  );
}
