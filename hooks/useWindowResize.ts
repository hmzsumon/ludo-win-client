// hooks/useWindowResize.ts
"use client";
import { useEffect, type RefObject } from "react";
import onWindowResize, { resetScreenStyles } from "../utils/resize-screen";

const useWindowResize = (rootRef?: RefObject<HTMLElement>) => {
  useEffect(() => {
    const handler = () => onWindowResize(rootRef?.current); // element পাস
    window.addEventListener("resize", handler);
    handler();

    return () => {
      window.removeEventListener("resize", handler);
      resetScreenStyles(rootRef?.current);
    };
  }, [rootRef]);
};

export default useWindowResize;
