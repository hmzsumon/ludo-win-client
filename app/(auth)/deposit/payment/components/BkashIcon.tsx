"use client";

import BkashLogo from "@/public/images/deposit/bkash-logo.png";
import Image, { StaticImageData } from "next/image";

type PaymentBrandIconProps = {
  title: string;

  /** না দিলে BkashLogo ডিফল্ট হবে */
  logoSrc?: StaticImageData | string;

  alt?: string;
  className?: string;
  imageSize?: number; // default 50
  bgClassName?: string; // default bkash pink
};

export default function PaymentBrandIcon({
  title,
  logoSrc = BkashLogo, // ✅ default
  alt = "Bkash Logo",
  className = "",
  imageSize = 50,
  bgClassName = "bg-[#DA126B]", // ✅ default
}: PaymentBrandIconProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-white ${bgClassName} ${className}`}
    >
      <Image src={logoSrc} alt={alt} width={imageSize} height={imageSize} />
      <h1 className="text-center text-base font-semibold">{title}</h1>
    </div>
  );
}
