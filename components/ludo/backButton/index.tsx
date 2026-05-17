"use client";

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
          isHandlingBackRef.current = true;
          goBack();
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
  }, [goBack, openExitConfirmation, withConfirmation]);

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
      onClick={() => openExitConfirmation(goBack)}
    >
      <Icon type="back" />
    </button>
  );
};

export default BackButton;
