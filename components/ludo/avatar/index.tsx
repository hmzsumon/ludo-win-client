"use client";

import defaultAvatar from "@/public/ludo/avatar/default.png";
import Image, { StaticImageData } from "next/image";
import React from "react";

type AvatarProps = {
  photo?: string; // external url বা /ludo/avatar/a.png
  name?: string;
  className?: string;
  size?: number; // px, default 40
};

const Avatar: React.FC<AvatarProps> = ({
  photo = "",
  name = "",
  className = "",
  size = 40,
}) => {
  const [src, setSrc] = React.useState<string | StaticImageData>(
    photo || defaultAvatar
  );

  return (
    <Image
      alt={name || "Avatar"}
      title={name}
      className={className}
      src={src}
      width={size}
      height={size}
      onError={() => setSrc(defaultAvatar)}
    />
  );
};

export default React.memo(Avatar);
