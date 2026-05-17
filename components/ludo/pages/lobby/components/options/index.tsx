"use client";

import GameActionButton from "@/components/game-ui/GameActionButton";

import Link from "next/link";
import { CiWifiOff, CiWifiOn } from "react-icons/ci";
interface OptionsProps {
  serviceError: boolean;
}

/**
 * Next.js version of Lobby Options
 * - আর react-router-dom নাই
 * - ROUTES import বাদ
 * - /ludo/online এবং /ludo/offline পাথ সরাসরি use করছি
 */
const Options = ({ serviceError = false }: OptionsProps) => (
  <div className=" flex h-full w-full flex-col items-center justify-center gap-6">
    {!serviceError && (
      <Link href="/online" className=" ">
        <GameActionButton
          label="Play online"
          size="lg"
          colors={{
            start: "#59d8ff",
            mid: "#1ca7ec",
            end: "#0b63ce",
          }}
          icon={<CiWifiOn className="text-xl text-white mr-1" />}
        />
      </Link>
    )}
    <Link href="/offline" className="">
      <GameActionButton
        label="Play offline"
        size="lg"
        colors={{
          start: "#7ce7ff",
          mid: "#27c2d8",
          end: "#0d8aa8",
        }}
        icon={<CiWifiOff className="text-xl font-bold text-white mr-1" />}
      />
    </Link>
  </div>
);

export default Options;
