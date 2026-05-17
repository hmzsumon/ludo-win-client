"use client";
import { openUserSidebar } from "@/redux/features/ui/sidebarSlice";
import React from "react";
import { FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

const UserOption = () => {
  const dispatch = useDispatch();
  const { isMobileSidebarOpen, isUserSidebarOpen } = useSelector(
    (state: any) => state.sidebar,
  );

  return (
    <button
      className="button blue game-options-button"
      onClick={() => dispatch(openUserSidebar())}
    >
      {isUserSidebarOpen ? <span>❌ </span> : <FaUser className="text-xl" />}
    </button>
  );
};

export default React.memo(UserOption);
