"use client";

// ✅ AccountSection.tsx
// Smart account information card
// - email change => support modal
// - phone change => support modal
// - phone not exists => link modal
// - password change => password modal

import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { IPersonalProfile } from "@/redux/features/profile/personalProfileApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import AddFieldModal from "./AddFieldModal";
import EmailChangeModal from "./EmailChangeModal";
import PasswordChangeModal from "./PasswordChangeModal";
import PhoneChangeModal from "./PhoneChangeModal";
import ProfileInfoRow from "./ProfileInfoRow";

interface AccountSectionProps {
  profile: IPersonalProfile;
  onLinkPhone: (phone: string) => Promise<unknown>;
  isLinkingPhone: boolean;
}

export default function AccountSection({
  profile,
  onLinkPhone,
  isLinkingPhone,
}: AccountSectionProps) {
  const router = useRouter();

  /* ────────── Modal states for account actions ────────── */
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPhoneSupportModal, setShowPhoneSupportModal] = useState(false);
  const [showPhoneLinkModal, setShowPhoneLinkModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  /* ────────── Password API mutation hook ────────── */
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  /* ────────── Registration date format ────────── */
  const formattedDate = profile.registrationDate
    ? new Date(profile.registrationDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  /* ────────── Handler: link phone number ────────── */
  const handlePhoneConfirm = async (phone: string) => {
    try {
      await onLinkPhone(phone);
      setShowPhoneLinkModal(false);
      toast.success("Phone linked successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to link phone. Try again.");
    }
  };

  /* ────────── Handler: change password ────────── */
  const handlePasswordChange = async (payload: {
    oldPassword: string;
    newPassword: string;
  }) => {
    try {
      const result = await changePassword(payload).unwrap();
      toast.success(result?.message || "Password changed successfully");
      setShowPasswordModal(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
      throw error;
    }
  };

  return (
    <>
      {/* ────────── Section: Smart glass account card ────────── */}
      <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/42 px-2 shadow-[0_16px_38px_rgba(43,133,203,0.14)] backdrop-blur-xl">
        {/* Account number row */}
        <ProfileInfoRow
          label="Account number"
          value={`id: ${profile.accountNumber}`}
          staticValue
          showDivider
        />

        {/* Email row */}
        <ProfileInfoRow
          label="Email"
          value={profile.email || undefined}
          actionType="change"
          onActionClick={() => setShowEmailModal(true)}
          showDivider
        />

        {/* Phone number row */}
        <ProfileInfoRow
          label="Phone number"
          value={profile.phone || undefined}
          actionType={profile.phone ? "change" : "link"}
          onActionClick={() => {
            if (profile.phone) {
              setShowPhoneSupportModal(true);
              return;
            }
            setShowPhoneLinkModal(true);
          }}
          showDivider
        />

        {/* Password row */}
        <ProfileInfoRow
          label="Password"
          value={`Days since last change: ${profile.daysSincePasswordChange}`}
          actionType="change"
          onActionClick={() => setShowPasswordModal(true)}
          showDivider
        />

        {/* Registration date row */}
        <ProfileInfoRow
          label="Registration date"
          value={formattedDate}
          staticValue
          showDivider={false}
        />
      </div>

      {/* ────────── Section: Email change support modal ────────── */}
      <EmailChangeModal
        open={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onContactSupport={() => router.push("/support")}
      />

      {/* ────────── Section: Phone change support modal ────────── */}
      <PhoneChangeModal
        open={showPhoneSupportModal}
        onClose={() => setShowPhoneSupportModal(false)}
        onContactSupport={() => router.push("/support")}
      />

      {/* ────────── Section: Link phone modal ────────── */}
      <AddFieldModal
        open={showPhoneLinkModal}
        title="Link Phone Number"
        fieldLabel="Phone Number"
        placeholder="01XXXXXXXXX"
        inputType="tel"
        note="An SMS with an activation code will be sent to your phone."
        onConfirm={handlePhoneConfirm}
        onClose={() => setShowPhoneLinkModal(false)}
        loading={isLinkingPhone}
      />

      {/* ────────── Section: Password change modal ────────── */}
      <PasswordChangeModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
        loading={isChangingPassword}
        daysSincePasswordChange={profile.daysSincePasswordChange}
      />
    </>
  );
}
