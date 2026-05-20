"use client";

// ✅ PersonalInfoSection.tsx
// Smart personal information card
// - Full Name read only
// - Country editable
// - City add / change editable

import { IPersonalProfile } from "@/redux/features/profile/personalProfileApi";
import { useState } from "react";
import { toast } from "react-hot-toast";
import AddFieldModal from "./AddFieldModal";
import CountrySelectDrawer, { Country } from "./CountrySelectDrawer";
import ProfileInfoRow from "./ProfileInfoRow";

interface PersonalInfoSectionProps {
  profile: IPersonalProfile;
  onUpdateProfile: (payload: {
    countryCode?: string;
    countryName?: string;
    city?: string;
  }) => Promise<unknown>;
  isUpdating: boolean;
}

export default function PersonalInfoSection({
  profile,
  onUpdateProfile,
  isUpdating,
}: PersonalInfoSectionProps) {
  /* ────────── Drawer/modal states for editable personal fields ────────── */
  const [showCountryDrawer, setShowCountryDrawer] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  /* ────────── Selected country local state ────────── */
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    profile.countryName
      ? {
          code: profile.countryCode || "",
          name: profile.countryName,
          iso: profile.countryCode || "",
        }
      : null,
  );

  /* ────────── Handler: country select/update ────────── */
  const handleCountrySelect = async (country: Country) => {
    setSelectedCountry(country);

    try {
      await onUpdateProfile({
        countryCode: country.code,
        countryName: country.name,
      });
      toast.success("Country updated!");
    } catch {
      toast.error("Failed to update country.");
    }
  };

  /* ────────── Handler: city add/update ────────── */
  const handleCityUpdate = async (city: string) => {
    try {
      await onUpdateProfile({ city });
      setShowCityModal(false);
      toast.success("City updated!");
    } catch {
      toast.error("Failed to update city.");
    }
  };

  /* ────────── Display helper: country label ────────── */
  const countryDisplay = selectedCountry
    ? `${selectedCountry.code} ${selectedCountry.name}`.trim()
    : profile.countryName || "";

  return (
    <>
      {/* ────────── Section: Smart glass personal info card ────────── */}
      <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/42 px-2 shadow-[0_16px_38px_rgba(43,133,203,0.14)] backdrop-blur-xl">
        {/* Full name row */}
        <ProfileInfoRow
          label="Full Name"
          value={profile.fullName || undefined}
          staticValue
          showDivider
        />

        {/* Country row */}
        <ProfileInfoRow
          label="Country"
          value={countryDisplay || undefined}
          actionType={countryDisplay ? "change" : "add"}
          onActionClick={() => setShowCountryDrawer(true)}
          showDivider
        />

        {/* City row */}
        <ProfileInfoRow
          label="City"
          value={profile.city || undefined}
          actionType={profile.city ? "change" : "add"}
          onActionClick={() => setShowCityModal(true)}
          showDivider={false}
        />
      </div>

      {/* ────────── Section: City add/update modal ────────── */}
      <AddFieldModal
        open={showCityModal}
        title={profile.city ? "Update City" : "Add City"}
        fieldLabel="City"
        placeholder="Enter your city"
        initialValue={profile.city || ""}
        onConfirm={handleCityUpdate}
        onClose={() => setShowCityModal(false)}
        loading={isUpdating}
      />

      {/* ────────── Section: Country select drawer ────────── */}
      <CountrySelectDrawer
        open={showCountryDrawer}
        selected={selectedCountry}
        onSelect={handleCountrySelect}
        onClose={() => setShowCountryDrawer(false)}
      />
    </>
  );
}
