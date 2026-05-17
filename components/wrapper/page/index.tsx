"use client";
import UserSidebar from "@/components/auth/UserSidebar";
import BackButton from "@/components/ludo/backButton";
import Options from "@/components/ludo/options";

import React, { ReactNode } from "react";

interface PageWrapperProps {
  children: JSX.Element | JSX.Element[] | ReactNode;
  leftOption?: JSX.Element | null;
  rightOption?: JSX.Element | null;
}

const PageWrapper = ({
  children,
  leftOption = <BackButton />,
  rightOption = <Options />,
}: PageWrapperProps) => (
  <div className="page-wrapper">
    {(leftOption || rightOption) && (
      <div className="page-wrapper-options">
        <div>{leftOption}</div>
        <div>{rightOption}</div>
      </div>
    )}
    {children}
    <UserSidebar />
  </div>
);

export default React.memo(PageWrapper);
