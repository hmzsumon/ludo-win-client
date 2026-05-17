"use client";

import { useSelector } from "react-redux";
import Logo from "../branding/logo";

const WalletTopbar = () => {
  const { user } = useSelector((s: any) => s.auth) as any;

  return (
    <div className="  flex w-full items-center justify-between">
      {/* ────────── Logo Block ────────── */}
      <div>
        <Logo sizeClass="w-[40px] sm:w-[140px] md:w-[180px]" />
      </div>
    </div>
  );
};

export default WalletTopbar;
