"use client";

// ✅ PersonalInfoSection.tsx
// Smart personal information card
// - Email verified হলে Full Name editable
// - NID / Passport / Driving Licence number editable
// - Country editable
// - City add / change editable

import { IPersonalProfile } from "@/redux/features/profile/personalProfileApi";
import { useState } from "react";
import { toast } from "react-hot-toast";
import AddFieldModal from "./AddFieldModal";
import CountrySelectDrawer, { Country } from "./CountrySelectDrawer";
import IdentityDocumentModal from "./IdentityDocumentModal";
import ProfileInfoRow from "./ProfileInfoRow";

interface PersonalInfoSectionProps {
  profile: IPersonalProfile;
  onUpdateProfile: (payload: {
    fullName?: string;
    countryCode?: string;
    countryName?: string;
    city?: string;
    identityDocumentType?: "NID" | "PASSPORT" | "DRIVING_LICENSE" | "";
    identityDocumentNumber?: string;
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
  const [showNameModal, setShowNameModal] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);

  /* ────────── Selected country local state ────────── */
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(
    profile.countryName
      ? {
          code: profile.countryCode || "",
          name: profile.countryName,
          iso: profile.countryIso || "",
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

  /* ────────── Handler: verified user official full name update ────────── */
  const handleNameUpdate = async (fullName: string) => {
    try {
      await onUpdateProfile({ fullName });
      setShowNameModal(false);
      toast.success("Full name updated!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update full name.");
    }
  };

  /* ────────── Handler: identity document type + number update ────────── */
  const handleIdentityUpdate = async (payload: {
    identityDocumentType: "NID" | "PASSPORT" | "DRIVING_LICENSE";
    identityDocumentNumber: string;
  }) => {
    try {
      await onUpdateProfile(payload);
      setShowIdentityModal(false);
      toast.success("Identity document updated!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update document.");
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
        {/* Full name row: email verified হলে change করা যাবে */}
        <ProfileInfoRow
          label="Full Name"
          value={profile.fullName || undefined}
          staticValue={!profile.emailVerified}
          actionType={profile.emailVerified ? "change" : "none"}
          onActionClick={() => setShowNameModal(true)}
          showDivider
        />

        {/* Identity document row */}
        <ProfileInfoRow
          label={
            profile.identityDocumentType
              ? `${profile.identityDocumentType.replace("_", " ")} Number`
              : "NID / Passport / Driving Licence"
          }
          value={profile.identityDocumentNumber || undefined}
          actionType={profile.identityDocumentNumber ? "change" : "add"}
          onActionClick={() => setShowIdentityModal(true)}
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

        {/* Official name guidance */}
        <div className="mx-2 mb-3 mt-1 rounded-2xl border border-sky-200/65 bg-sky-50/55 px-3 py-2.5 text-[10px] font-bold leading-4 text-slate-500">
          Full name must match your Passport, NID or Driving Licence.
          {!profile.emailVerified
            ? " Verify your email first to change the name."
            : ""}
        </div>
      </div>

      {/* ────────── Section: Official full name modal ────────── */}
      <AddFieldModal
        open={showNameModal}
        title="Update Full Name"
        fieldLabel="Official Full Name"
        placeholder="Enter name as shown on your document"
        initialValue={profile.fullName || ""}
        note="Use the exact name shown on your Passport, NID or Driving Licence."
        onConfirm={handleNameUpdate}
        onClose={() => setShowNameModal(false)}
        loading={isUpdating}
      />

      {/* ────────── Section: Identity document modal ────────── */}
      <IdentityDocumentModal
        open={showIdentityModal}
        initialType={profile.identityDocumentType}
        initialNumber={profile.identityDocumentNumber}
        onConfirm={handleIdentityUpdate}
        onClose={() => setShowIdentityModal(false)}
        loading={isUpdating}
      />

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
