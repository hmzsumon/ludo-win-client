"use client";

import Icon from "@/components/ludo/icon";
import Share from "@/components/ludo/share";
import React from "react";

interface RoomInfoProps {
  roomName: string;
}

const RoomInfo = ({ roomName }: RoomInfoProps) => {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/online?room=${roomName}`
      : "";

  const dataShare: ShareData = {
    title: "Ludo React 🎲",
    text: `Let's play Ludo React together. Room code ${roomName}, Tap on link below to join match`,
    url: shareUrl,
  };

  return (
    <div className="page-matchmaking-room-info">
      <h3>Room Code</h3>
      <div className="page-matchmaking-room-info-detail">
        <code>{roomName}</code>
        <Share data={dataShare}>
          <button className="button yellow">
            <span>Share</span>
            <Icon type="share" fill="#8b5f00" />
          </button>
        </Share>
      </div>
    </div>
  );
};

export default React.memo(RoomInfo);
