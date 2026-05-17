"use client";

import BkashLogo from "@/public/images/deposit/bkash-logo.png";
import Image, { StaticImageData } from "next/image";

type PaymentBrandIconProps = {
  title: string;
  logoSrc?: StaticImageData | string;
  alt?: string;
  className?: string;
  imageSize?: number;
  bgClassName?: string;
};

export default function PaymentBrandIcon({
  title,
  logoSrc = BkashLogo,
  alt = "Bkash Logo",
  className = "",
  imageSize = 50,
  bgClassName = "bg-[#DA126B]",
}: PaymentBrandIconProps) {
  return (
    <div
      className={`flex flex-col mmd:flex-row items-center gap-1 rounded-[4px] px-2 py-1 text-white ${bgClassName} ${className}`}
    >
      <Image src={logoSrc} alt={alt} width={imageSize} height={imageSize} />
      <h1 className="text-center text-base font-semibold">{title}</h1>
    </div>
  );
}
