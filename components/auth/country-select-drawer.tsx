"use client";

/* ────────── imports ────────── */
import { Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CountryOption } from "./countries";

type Props = {
  open: boolean;
  selectedCountry: CountryOption;
  countries: CountryOption[];
  onClose: () => void;
  onSelect: (country: CountryOption) => void;
};

export default function CountrySelectDrawer({
  open,
  selectedCountry,
  countries,
  onClose,
  onSelect,
}: Props): JSX.Element | null {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    setSearch("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const filteredCountries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return countries;

    const normalizedCode = query.replace(/\s/g, "");
    return countries.filter((country) => {
      return (
        country.name.toLowerCase().includes(query) ||
        country.iso.toLowerCase().includes(query) ||
        country.dialCode.replace(/\s/g, "").includes(normalizedCode)
      );
    });
  }, [countries, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close country selector"
        onClick={onClose}
        className="absolute inset-0 bg-[#020817]/75 backdrop-blur-sm"
      />

      <section className="relative z-10 flex max-h-[82vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[linear-gradient(180deg,#243579_0%,#14265e_100%)] shadow-[0_-18px_70px_rgba(0,0,0,0.45)] sm:max-h-[76vh] sm:rounded-[28px]">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-white/25 sm:hidden" />

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-white">Select Country</h2>
            <p className="mt-1 text-xs text-white/50">Search by country name or dial code</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-300" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Bangladesh or +880"
              className="h-14 w-full rounded-2xl border border-white/15 bg-[#1b2d6c] pl-12 pr-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-cyan-300"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-5">
          {filteredCountries.length ? (
            <div className="space-y-1.5">
              {filteredCountries.map((country) => {
                const selected = country.iso === selectedCountry.iso;
                return (
                  <button
                    key={`${country.iso}-${country.dialCode}`}
                    type="button"
                    onClick={() => onSelect(country)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      selected
                        ? "border-cyan-300/50 bg-cyan-300/10"
                        : "border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl bg-white/8 text-2xl">
                      {country.flag}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-black text-white">{country.name}</span>
                      <span className="mt-0.5 block text-xs font-bold text-cyan-300">{country.dialCode}</span>
                    </span>
                    {selected ? <Check className="h-5 w-5 shrink-0 text-cyan-300" /> : null}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-black text-white">No country found</p>
              <p className="mt-1 text-xs text-white/45">Try another country name or dial code.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
