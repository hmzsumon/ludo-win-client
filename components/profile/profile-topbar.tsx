"use client";

import { useSelector } from "react-redux";
import LudoPartyLogo from "../branding/LudoPartyLogo";

const ProfileTopbar = () => {
  const { user } = useSelector((s: any) => s.auth) as any;

  return (
    <div className="relative w-full">
      {/* ────────── Logo Block ────────── */}
      <div>
        <LudoPartyLogo />
      </div>
    </div>
  );
};

export default ProfileTopbar;
