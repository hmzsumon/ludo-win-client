"use client";

import Link from "next/link";
import React, { useMemo } from "react";

import Share from "@/components/ludo/share";
import { API_LOGOUT } from "@/utils/constants";
import Icon from "../../../../icon/index";

const Toolbar = ({ isAuth = false }: { isAuth: boolean }) => {
  const dataShare: ShareData = useMemo(
    () => ({
      title: "Ludo React 🎲",
      text: "Let's play Ludo React together. Developed by Jorge Rubiano @ostjh",
      url: typeof window !== "undefined" ? window.location.href : "",
    }),
    []
  );

  return (
    <div className="lobby-options-toolbar">
      <Link href="/about" className="button blue" title="About">
        <Icon type="info" />
      </Link>

      <Share data={dataShare}>
        <button className="button blue" title="Share">
          <Icon type="share" />
        </button>
      </Share>

      {isAuth && (
        <a href={API_LOGOUT} className="button blue" title="Logout">
          <Icon type="logout" />
        </a>
      )}
    </div>
  );
};

export default React.memo(Toolbar);
