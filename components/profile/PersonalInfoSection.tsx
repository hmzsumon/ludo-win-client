"use client";

// ✅ PersonalInfoSection.tsx
// Personal information section
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
  const [showCountryDrawer, setShowCountryDrawer] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    profile.countryName
      ? {
          code: profile.countryCode || "",
          name: profile.countryName,
          iso: profile.countryCode || "",
        }
      : null,
  );

  /* ── Country handler ── */
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

  /* ── City handler ── */
  const handleCityUpdate = async (city: string) => {
    try {
      await onUpdateProfile({ city });
      setShowCityModal(false);
      toast.success("City updated!");
    } catch {
      toast.error("Failed to update city.");
    }
  };

  const countryDisplay = selectedCountry
    ? `${selectedCountry.code} ${selectedCountry.name}`.trim()
    : profile.countryName || "";

  return (
    <>
      {/* ── Section Card ── */}
      <div
        className="rounded-2xl overflow-hidden px-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* ── Full name: read only ── */}
        <ProfileInfoRow
          label="Full Name"
          value={profile.fullName || undefined}
          staticValue
          showDivider
        />

        {/* ── Country ── */}
        <ProfileInfoRow
          label="Country"
          value={countryDisplay || undefined}
          actionType={countryDisplay ? "change" : "add"}
          onActionClick={() => setShowCountryDrawer(true)}
          showDivider
        />

        {/* ── City ── */}
        <ProfileInfoRow
          label="City"
          value={profile.city || undefined}
          actionType={profile.city ? "change" : "add"}
          onActionClick={() => setShowCityModal(true)}
          showDivider={false}
        />
      </div>

      {/* ── City modal ── */}
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

      {/* ── Country drawer ── */}
      <CountrySelectDrawer
        open={showCountryDrawer}
        selected={selectedCountry}
        onSelect={handleCountrySelect}
        onClose={() => setShowCountryDrawer(false)}
      />
    </>
  );
}
