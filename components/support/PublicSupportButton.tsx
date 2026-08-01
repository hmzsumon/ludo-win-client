"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { openSupportChat } from "./tawk-chat";

/* NEW ▸ Only pages without the authenticated bottom navigation use this. */
const PUBLIC_SUPPORT_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/verify-phone",
]);

export default function PublicSupportButton() {
  const pathname = usePathname();

  if (!PUBLIC_SUPPORT_ROUTES.has(pathname)) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-1/2 top-0 z-[70] h-16 w-full max-w-md -translate-x-1/2">
      <button
        type="button"
        onClick={openSupportChat}
        aria-label="Open Ludo Win support chat"
        title="Support"
        className="pointer-events-auto absolute right-3 top-[calc(env(safe-area-inset-top)+12px)] flex h-9 w-9 items-center justify-center overflow-hidden rounded-full p-0 transition-transform active:scale-90"
      >
        {/* NEW ▸ Small circular support icon without background, border or shadow. */}
        <Image
          src="/icons/support.png"
          alt="Support"
          width={32}
          height={32}
          priority
          className="h-8 w-8 rounded-full object-contain"
        />
      </button>
    </div>
  );
}
