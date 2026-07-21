"use client";

import CountrySelectDrawer, {
  Country,
} from "@/components/profile/CountrySelectDrawer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const Flag = ({ iso }: { iso: string }) => (
  <img
    src={`https://flagcdn.com/24x18/${iso.toLowerCase()}.png`}
    alt=""
    className="h-[18px] w-6 rounded-sm object-cover"
  />
);

export default function CountryPhoneInput({
  country,
  value,
  onCountryChange,
  onChange,
  error,
}: {
  country: Country;
  value: string;
  onCountryChange: (country: Country) => void;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        className={`flex h-[52px] overflow-hidden rounded-xl border bg-white/10 shadow-inner transition ${
          error
            ? "border-red-500"
            : "border-white/15 focus-within:border-cyan-400"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-[120px] items-center gap-2 border-r border-white/15 bg-black/10 px-3 text-white"
        >
          <Flag iso={country.iso} />
          <span className="font-extrabold text-sm">{country.code}</span>
          <ChevronDown className=" text-cyan-300" size={24} />
        </button>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
          placeholder={country.iso === "BD" ? "1710000000" : "Mobile number"}
          className="min-w-0 flex-1 bg-transparent px-4 text-[14px] font-bold text-white outline-none placeholder:text-white/35"
        />
      </div>

      {error ? (
        <p className="mt-1 px-1 text-xs font-bold text-red-400">{error}</p>
      ) : null}

      <CountrySelectDrawer
        open={open}
        selected={country}
        onSelect={onCountryChange}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
