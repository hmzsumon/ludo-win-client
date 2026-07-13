import { MdOutlineSupportAgent } from "react-icons/md";

const TELEGRAM_SUPPORT_URL = "https://t.me/ludowin365";

export default function SupportFloatingButton() {
  return (
    <a
      href={TELEGRAM_SUPPORT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact support on Telegram"
      title="Contact support"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+4rem)] right-4 z-[9999] flex h-10 w-10 items-center justify-center rounded-full bg-[#229ED9] text-white shadow-[0_12px_28px_rgba(0,0,0,0.35)] ring-2 ring-white/25 transition hover:scale-105 active:scale-95"
    >
      <MdOutlineSupportAgent className="h-7 w-7" aria-hidden="true" />
      <span className="sr-only">Contact support</span>
    </a>
  );
}
