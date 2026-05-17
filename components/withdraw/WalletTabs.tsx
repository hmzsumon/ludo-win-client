"use client";

import { StaticImageData } from "next/image";
import PaymentBrandIcon from "../branding/PaymentBrandIcon";

export type WalletProvider = string;

export type WalletProviderConfig = {
  id: string;
  title: string;
  logoSrc?: StaticImageData | string;
  bgClassName?: string;
  imageSize?: number;
  active?: boolean;
};

type WalletTabsProps = {
  value: WalletProvider;
  onChange: (providerId: WalletProvider) => void;
  providers: WalletProviderConfig[];
  counts?: Record<string, number>;
};

export default function WalletTabs({
  value,
  onChange,
  providers,
  counts,
}: WalletTabsProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <p
        className="mb-2 text-[10px] font-bold uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.4)" }}
      >
        Select E-wallet
      </p>

      <div className="grid w-full grid-cols-3 gap-3 ">
        {providers.map((provider) => {
          const isSelected = value === provider.id;
          const isEnabled = provider.active !== false;

          return (
            <button
              key={provider.id}
              type="button"
              disabled={!isEnabled}
              onClick={() => {
                if (isEnabled) onChange(provider.id);
              }}
              className={`
                rounded-[10px] transition-all duration-300 ease-out
                ${isEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-40 grayscale"}
                ${
                  isSelected
                    ? "scale-[1.04]"
                    : "scale-100 opacity-90 hover:scale-[1.02] hover:opacity-100"
                }
              `}
            >
              <div
                className={`
                  rounded-[10px] p-[2px] transition-all duration-300
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-pink-500"
                      : "bg-transparent"
                  }
                `}
                style={
                  isSelected
                    ? {
                        boxShadow:
                          "0 0 8px 2px rgba(168,85,247,0.6), 0 0 16px 4px rgba(168,85,247,0.3)",
                      }
                    : undefined
                }
              >
                <PaymentBrandIcon
                  title={provider.title}
                  logoSrc={provider.logoSrc}
                  alt={provider.title}
                  imageSize={provider.imageSize ?? 28}
                  bgClassName={provider.bgClassName ?? "bg-[#DA126B]"}
                  className="px-3 py-2 rounded-[10px]"
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
