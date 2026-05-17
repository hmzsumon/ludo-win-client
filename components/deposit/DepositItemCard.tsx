import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";

interface DepositItemCardProps {
  image: StaticImageData;
  name: string;
  minimum: number;
  fee: number | string;
  isActive: boolean;
  link: string;
}

const DepositItemCard: React.FC<DepositItemCardProps> = ({
  image,
  name,
  minimum,
  fee,
  isActive,
  link,
}) => {
  return (
    <button
      className="w-full flex items-center justify-between bg-[rgb(1,36,29)] border border-[rgb(0,73,59)] rounded p-4 hover:bg-[rgb(0,73,59)] transition-all duration-300 ease-in-out cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      disabled={!isActive}
    >
      {isActive ? (
        <Link href={link} className="flex items-center justify-between w-full">
          <span className="w-14 p-2  bg-white rounded ">
            <Image
              src={image}
              alt={`${name} Payment Method`}
              className="w-10 h-auto rounded-lg"
            />
          </span>
          <div>
            <p className="text-sm text-gray-100 font-semibold">{name}</p>
            <p className="text-xs text-gray-300">
              Minimum: 💎 {minimum}, Fee: {fee}%
            </p>
          </div>
        </Link>
      ) : (
        <div className="flex items-center justify-between w-full">
          <span className="w-14 p-2  bg-white rounded ">
            <Image
              src={image}
              alt={`${name} Payment Method`}
              className="w-10 h-auto rounded-lg opacity-50"
            />
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-400">{name}</p>
            <p className="text-xs text-gray-500">
              Minimum: 💎 {minimum}, Fee: {fee}%
            </p>
          </div>
        </div>
      )}
    </button>
  );
};

export default DepositItemCard;
