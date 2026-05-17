"use client";

import Loading from "@/components/ludo/loading";
import { useLoadUserQuery } from "@/redux/features/auth/authApi";
import React, { useContext } from "react";
import type { IAuth } from "../interfaces";

const UserContext = React.createContext<IAuth | null>(null);

const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, isError } = useLoadUserQuery();

  if (isLoading) return <Loading />;

  let value: IAuth;

  if (!isError && data) {
    const d: any = data;

    if (d.success && d.user) {
      const u = d.user;
      value = {
        isAuth: true,
        authOptions: [], // এখন গুগল auth নাই, তাই খালি
        user: {
          id: u._id ?? u.id,
          name: u.name,
          email: u.email,
          mobile: u.phone ?? u.mobile,
        },
        email: u.email,
        serviceError: false,
      };
    } else {
      // success=false বা user নাই → logged out ধরা হবে
      value = {
        isAuth: false,
        authOptions: [],
        user: null,
        email: "",
        serviceError: false,
      };
    }
  } else {
    // API error হলে
    value = {
      isAuth: false,
      authOptions: [],
      user: null,
      email: "",
      serviceError: true,
    };
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUserContext = (): IAuth => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }

  return context;
};

export { UserProvider, useUserContext };
