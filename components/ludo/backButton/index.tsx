"use client";

import { markLudoManualLeaveIntent } from "@/utils/ludoActiveGame";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import Icon from "../icon";
import { handleBack } from "./helpers";

interface BackButtonProps {
  to?: string;
  withConfirmation?: boolean;
}

const HISTORY_GUARD_KEY = "__gameExitGuard";

const BackButton = ({
  to = "/",
  withConfirmation = false,
}: BackButtonProps) => {
  const router = useRouter();
  const isHandlingBackRef = useRef(false);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(to);
  }, [router, to]);

  /* NEW ▸ Skip the artificial history guard after one confirmed click. */
  const leaveGame = useCallback(
    (guardIsStillActive: boolean) => {
      isHandlingBackRef.current = true;
      markLudoManualLeaveIntent();
      (window as any).__ludoManualLeave?.();

      const startingUrl = window.location.href;
      const historySteps = guardIsStillActive ? -2 : -1;

      window.setTimeout(() => {
        window.history.go(historySteps);

        /* NEW ▸ Direct-opened games may have no earlier history entry. */
        window.setTimeout(() => {
          if (window.location.href === startingUrl) {
            router.replace(to);
          }
        }, 300);
      }, 120);
    },
    [router, to],
  );

  const openExitConfirmation = useCallback(
    (onConfirm?: () => void, onCancel?: () => void) => {
      handleBack((action) => {
        if (action) {
          onConfirm?.();
          return;
        }

        onCancel?.();
      });
    },
    [],
  );

  useEffect(() => {
    if (!withConfirmation) {
      return;
    }

    const pushGuardState = () => {
      window.history.pushState(
        {
          ...(window.history.state || {}),
          [HISTORY_GUARD_KEY]: true,
        },
        "",
        window.location.href,
      );
    };

    const currentState = window.history.state || {};

    if (!currentState?.[HISTORY_GUARD_KEY]) {
      pushGuardState();
    }

    const handlePopState = () => {
      if (isHandlingBackRef.current) {
        return;
      }

      openExitConfirmation(
        () => {
          /* Guard was already popped by the browser-back action. */
          leaveGame(false);
        },
        () => {
          pushGuardState();
        },
      );
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [leaveGame, openExitConfirmation, withConfirmation]);

  if (!withConfirmation) {
    return (
      <button className="button blue game-back-button" onClick={goBack}>
        <Icon type="back" />
      </button>
    );
  }

  return (
    <button
      className="button blue game-back-button"
      onClick={() =>
        openExitConfirmation(() => {
          /* Header click still has the guard, so leave it and the game entry. */
          leaveGame(true);
        })
      }
    >
      <Icon type="back" />
    </button>
  );
};

export default BackButton;
