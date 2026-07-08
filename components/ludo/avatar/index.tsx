"use client";

import defaultAvatar from "@/public/ludo/avatar/default.png";
import Image, { StaticImageData } from "next/image";
import React from "react";

type AvatarProps = {
  avatar?: string;
  photo?: string;
  name?: string;
  className?: string;
  size?: number;
};

/* ────────── safe dynamic avatar helper ────────── */
const getSafeAvatarSrc = (value?: string): string | StaticImageData => {
  const src = value?.trim();

  if (!src || src === "null" || src === "undefined") {
    return defaultAvatar;
  }

  return src;
};

const Avatar: React.FC<AvatarProps> = ({
  avatar = "",
  photo = "",
  name = "",
  className = "",
  size = 40,
}) => {
  const resolvedSrc = getSafeAvatarSrc(avatar || photo);

  const [src, setSrc] = React.useState<string | StaticImageData>(resolvedSrc);

  React.useEffect(() => {
    setSrc(resolvedSrc);
  }, [resolvedSrc]);

  return (
    <Image
      alt={name || "Avatar"}
      title={name}
      className={className}
      src={src}
      width={size}
      height={size}
      unoptimized={typeof src === "string"}
      onError={() => setSrc(defaultAvatar)}
    />
  );
};

export default React.memo(Avatar);
