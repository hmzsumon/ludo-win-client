"use client";

import Image from "next/image";
import React from "react";

type Variant = "icon" | "wordmark" | "full";

export interface CapitaliseLogoProps {
  variant?: Variant;
  size?: number;
  color?: string;
  className?: string;
  wordmarkClassName?: string;
  iconClassName?: string;
  gradient?: boolean;
  ariaLabel?: string;
}

const LudoPartyLogo: React.FC<CapitaliseLogoProps> = ({
  variant = "full",
  size = 34,
  className = "",
  ariaLabel = "Ludo Party",
}) => {
  const width = variant === "icon" ? size : Math.max(size * 3.2, 120);
  const height = Math.max(size * 1.4, 44);

  return (
    <span className={`inline-flex items-center ${className}`} style={{ verticalAlign: "middle" }}>
      <Image
        src="/branding-logo_1.png"
        alt={ariaLabel}
        width={width}
        height={height}
        priority
        className="h-auto w-auto max-w-[180px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
      />
    </span>
  );
};

export default LudoPartyLogo;
