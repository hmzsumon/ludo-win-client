"use client";

import Image from "next/image";
import Link from "next/link";

type ModeCardProps = {
  title: string;
  href: string;
  variant: "classic" | "power" | "tournament" | "friend" | "team";
  size: "large" | "small";
  image?: string;
};

const modes: ModeCardProps[] = [
  {
    title: "Classic",
    href: "/online",
    variant: "classic",
    size: "large",
    image: "/images/dashboard/classic.png",
  },
  {
    title: "Master",
    href: "/master",
    variant: "power",
    size: "large",
    image: "/images/dashboard/master.png",
  },
  {
    title: "Play Online",
    href: "/online",
    variant: "tournament",
    size: "small",
    image: "/images/dashboard/globe.png",
  },
  {
    title: "2 Players",
    href: "/online",
    variant: "friend",
    size: "small",
    image: "/images/dashboard/two-players.png",
  },
  {
    title: " Play Offline",
    href: "/offline",
    variant: "team",
    size: "small",
    image: "/images/dashboard/no-wifi.png",
  },
];

function ModeImageFallback({
  variant,
}: {
  variant: ModeCardProps["variant"];
  size: ModeCardProps["size"];
}) {
  if (variant === "classic") {
    return <span className="text-[64px]">🎲</span>;
  }

  if (variant === "power") {
    return <span className="text-[64px]">🚀</span>;
  }

  if (variant === "tournament") {
    return <span className="text-[64px]">🌐</span>;
  }

  if (variant === "friend") {
    return <span className="text-[64px]">🎲</span>;
  }

  return <span className="text-[64px]">🎲</span>;
}

function getCardClass(
  variant: ModeCardProps["variant"],
  size: ModeCardProps["size"],
) {
  const base =
    "relative block overflow-hidden transition active:translate-y-[4px]";

  const shadow =
    "shadow-[0_8px_0_rgba(0,0,0,0.55),0_14px_20px_rgba(0,0,0,0.35)]";

  const largeSize = "h-[140px] rounded-[22px]";
  const smallSize = "h-[100px] rounded-[16px]";

  const variants = {
    classic:
      "bg-[linear-gradient(180deg,#ffe924_0%,#ffc116_35%,#ff9410_70%,#f66b00_100%)]",
    power:
      "bg-[linear-gradient(180deg,#ff916f_0%,#ff7659_35%,#ff5747_70%,#e94433_100%)]",
    tournament:
      "bg-[linear-gradient(180deg,#24e8ff_0%,#16c9ff_45%,#0d88d9_100%)]",
    friend: "bg-[linear-gradient(180deg,#c89cff_0%,#9d5eff_45%,#7f20df_100%)]",
    team: "bg-[linear-gradient(180deg,#263bff_0%,#1274e8_45%,#063b8f_100%)]",
  };

  return `${base} ${shadow} ${
    size === "large" ? largeSize : smallSize
  } ${variants[variant]}`;
}

function ModeCard({ title, href, variant, size, image }: ModeCardProps) {
  const isLarge = size === "large";
  const radiusClass = isLarge ? "rounded-[22px]" : "rounded-[16px]";

  return (
    <div>
      <Link href={href} className={getCardClass(variant, size)}>
        {/* Image পুরো card জুড়ে */}
        <div className={`absolute inset-0 overflow-hidden ${radiusClass}`}>
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              sizes={isLarge ? "220px" : "100px"}
              className={isLarge ? "object-cover" : "object-contain p-2"}
              priority={isLarge}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ModeImageFallback variant={variant} size={size} />
            </div>
          )}
        </div>

        {/* Top glossy shine */}
        <div
          className={`
          pointer-events-none absolute left-0 right-0 top-0
          ${isLarge ? "h-[58px] rounded-t-[22px]" : "h-[42px] rounded-t-[16px]"}
          bg-[linear-gradient(180deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.08)_55%,rgba(255,255,255,0)_100%)]
        `}
        />

        {/* Bottom title overlay */}
      </Link>

      {/* Title */}
      <h3
        className={`
            z-10 text-center font-black leading-none text-white
          drop-shadow-[0_3px_0_rgba(122,57,0,0.95)]
          [-webkit-text-stroke:1px_rgba(120,45,0,0.7)]
          ${isLarge ? "mt-2 text-[22px]" : "text-sm mt-3"}
        `}
      >
        {title}
      </h3>
    </div>
  );
}

export default function GameModeGrid() {
  const largeModes = modes.filter((mode) => mode.size === "large");
  const smallModes = modes.filter((mode) => mode.size === "small");

  return (
    <section className="w-full space-y-2 ">
      <div className="grid grid-cols-2 gap-2">
        {largeModes.map((mode) => (
          <ModeCard key={mode.title} {...mode} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {smallModes.map((mode) => (
          <ModeCard key={mode.title} {...mode} />
        ))}
      </div>
    </section>
  );
}
