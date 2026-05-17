"use client";

import LoginForm from "@/components/auth/LoginForm";
import Icon from "@/components/ludo/icon";
import Logo from "@/components/ludo/logo";
import PageWrapper from "@/components/wrapper/page";
import { IAuthOptions } from "@/interfaces";

interface AuthenticateProps {
  authOptions: IAuthOptions[];
  handlePlayGuest: () => void;
}

const Authenticate = ({ authOptions, handlePlayGuest }: AuthenticateProps) => {
  return (
    <PageWrapper>
      <Logo />

      <div className="flex flex-col items-center gap-4 mt-2 pb-6">
        {/* Login card */}
        <LoginForm />

        {/* 🔹 OR Divider */}
        <div className="w-full max-w-md px-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/50" />
            <span className="text-xs font-semibold text-white/80 tracking-[0.2em] uppercase">
              or
            </span>
            <div className="flex-1 h-px bg-white/50" />
          </div>
        </div>

        {/* Play as guest button */}
        <div className="w-full max-w-md px-4">
          <button
            className="button yellow page-auth-social w-full mt-1 flex items-center justify-center gap-2"
            onClick={handlePlayGuest}
          >
            <Icon type="play" fill="#8b5f00" />
            <span>PLAY AS GUEST</span>
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Authenticate;
