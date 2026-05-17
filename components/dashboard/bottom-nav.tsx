"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TELEGRAM_SUPPORT_URL = "https://t.me/ludo_party";

type NavItem =
  | {
      label: string;
      icon: string;
      href: string;
      type: "link";
    }
  | {
      label: string;
      icon: string;
      href: string;
      type: "external";
    };

const navItems: NavItem[] = [
  {
    label: "Home",
    icon: "/icons/home.png",
    href: "/dashboard",
    type: "link",
  },
  {
    label: "Wallet",
    icon: "/icons/wallet.png",
    href: "/wallet",
    type: "link",
  },
  {
    label: "Support",
    icon: "/icons/support.png",
    href: TELEGRAM_SUPPORT_URL,
    type: "external",
  },
  {
    label: "Referral",
    icon: "/icons/referral.png",
    href: "/invite",
    type: "link",
  },

  {
    label: "Profile",
    icon: "/icons/profile.png",
    href: "/profile",
    type: "link",
  },
];

const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2">
      <div
        className="relative grid w-full grid-cols-5 overflow-hidden"
        style={{
          height: "66px",
          paddingBottom: "env(safe-area-inset-bottom)",
          background:
            "linear-gradient(180deg, #0795f4 0%, #076de0 34%, #0546bb 68%, #042b91 100%)",
          borderTop: "1px solid rgba(124, 225, 255, 0.95)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.45), 0 -5px 18px rgba(0,0,0,0.35)",
        }}
      >
        {/* Top light line like screenshot */}
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-[#58d8ff]" />

        {/* Inner top glow */}
        <div
          className="absolute left-0 right-0 top-[2px] h-[18px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0))",
          }}
        />

        {navItems.map((item, index) => {
          const isActive =
            item.type === "link" &&
            (pathname === item.href || pathname.startsWith(item.href + "/"));

          const content = (
            <>
              {/* Active cyan background */}
              {isActive && (
                <>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, #23d9ff 0%, #0db7fb 38%, #0794ea 72%, #0572d1 100%)",
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(0,31,112,0.55)",
                    }}
                  />

                  {/* Active diagonal shine */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.18) 36%, rgba(255,255,255,0) 37%)",
                    }}
                  />

                  {/* Active bottom darker glow */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-5"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,133,230,0), rgba(0,63,171,0.38))",
                    }}
                  />

                  {/* Active borders */}
                  <div className="absolute left-0 top-0 h-full w-px bg-cyan-100/80" />
                  <div className="absolute right-0 top-0 h-full w-px bg-blue-900/65" />
                </>
              )}

              {/* Normal vertical divider */}
              {!isActive && index !== navItems.length - 1 && (
                <div className="absolute right-0 top-[7px] h-[52px] w-px bg-blue-950/45" />
              )}

              {/* Icon */}
              <div
                className="relative flex h-[35px] w-full items-end justify-center"
                style={{
                  filter:
                    "drop-shadow(0 2px 1px rgba(0,0,0,0.55)) drop-shadow(0 0 2px rgba(255,255,255,0.18))",
                }}
              >
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={34}
                  height={34}
                  priority
                  className="object-contain"
                  style={{
                    width: isActive ? "36px" : "32px",
                    height: isActive ? "36px" : "32px",
                    transform: isActive
                      ? "translateY(-1px) scale(1.04)"
                      : "translateY(0)",
                  }}
                />
              </div>

              {/* Text */}
              <span
                className="relative mt-[2px] text-[11px] font-black leading-none tracking-[-0.2px]"
                style={{
                  color: isActive ? "#fff34a" : "#d7efff",
                  WebkitTextStroke: isActive
                    ? "0.25px rgba(90,70,0,0.55)"
                    : "0.2px rgba(0,40,120,0.55)",
                  textShadow: isActive
                    ? "0 1px 0 #7c5a00, 0 2px 2px rgba(0,0,0,0.6)"
                    : "0 1px 0 #003b9d, 0 2px 2px rgba(0,0,0,0.55)",
                }}
              >
                {item.label}
              </span>
            </>
          );

          const className =
            "relative flex h-full flex-col items-center justify-center overflow-hidden px-1 pt-[4px] transition-transform active:scale-95";

          if (item.type === "external") {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contact support on Telegram"
                title="Contact support"
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
