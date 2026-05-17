"use client";

import { useSelector } from "react-redux";
import Logo from "../branding/logo";

const DashboardHeader = () => {
  const { user } = useSelector((s: any) => s.auth) as any;

  const shortName =
    user?.name?.length > 8
      ? user?.name.slice(0, 8) + "..."
      : user?.name || "User";

  return (
    <div className="relative w-full mt-4">
      {/* ── Top Row: Profile + Notification ── */}

      {/* ── Logo ── */}
      <div className="scale-90 sm:scale-100 ls-float">
        <Logo />
      </div>
    </div>
  );
};

export default DashboardHeader;
