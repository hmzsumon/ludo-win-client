"use client";

import NagadLogo from "@/public/images/deposit/nagad-logo.png";
import Image from "next/image";
const NagadIcon = ({ title }: { title: string }) => {
  return (
    <div className="flex items-center gap-3 bg-[#E51B23] rounded-lg   px-4 py-3">
      <Image src={NagadLogo} alt="Nagad Logo" width={50} height={50} />
      <h1 className="text-center text-xl font-semibold">{title}</h1>
    </div>
  );
};

export default NagadIcon;
