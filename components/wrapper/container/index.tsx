// components/wrapper/container/index.tsx
"use client";
import useWindowResize from "@/hooks/useWindowResize"; // ← আপনার প্রকল্প অনুযায়ী পাথ
import React, { useRef } from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  const screenRef = useRef<HTMLDivElement>(null);
  useWindowResize(screenRef);

  return (
    <div className="container">
      <div ref={screenRef} className="screen">
        {children}
      </div>
    </div>
  );
};

export default React.memo(Container);
