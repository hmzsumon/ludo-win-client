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

const Avatar: React.FC<AvatarProps> = ({
  avatar = "",
  photo = "",
  name = "",
  className = "",
  size = 40,
}) => {
  const resolvedSrc = avatar || photo || defaultAvatar;

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
      onError={() => setSrc(defaultAvatar)}
    />
  );
};

export default React.memo(Avatar);
