// app/providers.tsx
"use client";

import { OptionProvider } from "@/context/optionContext";
import { UserProvider } from "@/context/userContext";
import React from "react";
import { Toaster } from "react-hot-toast";
import StoreProvider from "./StoreProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <OptionProvider>
        <UserProvider>
          {children}
          <Toaster position="top-center" />
        </UserProvider>
      </OptionProvider>
    </StoreProvider>
  );
}
