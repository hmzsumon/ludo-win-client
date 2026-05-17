"use client";

import { useEffect } from "react";

const DisableZoom = () => {
  useEffect(() => {
    const preventGesture = (event: Event) => {
      event.preventDefault();
    };

    const preventCtrlZoom = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    let lastTouchEnd = 0;

    const preventDoubleTapZoom = (event: TouchEvent) => {
      const now = Date.now();

      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }

      lastTouchEnd = now;
    };

    document.addEventListener("gesturestart", preventGesture, {
      passive: false,
    } as EventListenerOptions);
    document.addEventListener("gesturechange", preventGesture, {
      passive: false,
    } as EventListenerOptions);
    document.addEventListener("gestureend", preventGesture, {
      passive: false,
    } as EventListenerOptions);
    document.addEventListener("wheel", preventCtrlZoom, { passive: false });
    document.addEventListener("touchend", preventDoubleTapZoom, {
      passive: false,
    });

    return () => {
      document.removeEventListener("gesturestart", preventGesture as EventListener);
      document.removeEventListener("gesturechange", preventGesture as EventListener);
      document.removeEventListener("gestureend", preventGesture as EventListener);
      document.removeEventListener("wheel", preventCtrlZoom);
      document.removeEventListener("touchend", preventDoubleTapZoom);
    };
  }, []);

  return null;
};

export default DisableZoom;
