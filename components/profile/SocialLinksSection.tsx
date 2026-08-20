"use client";

/* ────────────────────────────────────────────────────────────────
   SocialLinksSection.tsx
   WhatsApp, Telegram ও Facebook optional contact fields।
──────────────────────────────────────────────────────────────── */

import { IPersonalProfile } from "@/redux/features/profile/personalProfileApi";
import { useState } from "react";
import { toast } from "react-hot-toast";
import AddFieldModal from "./AddFieldModal";
import ProfileInfoRow from "./ProfileInfoRow";

type SocialField = "whatsapp" | "telegram" | "facebook";

interface SocialLinksSectionProps {
  profile: IPersonalProfile;
  onUpdateProfile: (payload: Partial<Record<SocialField, string>>) => Promise<unknown>;
  isUpdating: boolean;
}

const SOCIAL_CONFIG: Record<
  SocialField,
  { label: string; placeholder: string; note: string }
> = {
  whatsapp: {
    label: "WhatsApp",
    placeholder: "Number or WhatsApp link",
    note: "Optional — enter your WhatsApp number or link.",
  },
  telegram: {
    label: "Telegram",
    placeholder: "Telegram username or link",
    note: "Optional — enter your username or profile link.",
  },
  facebook: {
    label: "Facebook",
    placeholder: "Facebook profile link",
    note: "Optional — enter your Facebook profile link.",
  },
};

export default function SocialLinksSection({
  profile,
  onUpdateProfile,
  isUpdating,
}: SocialLinksSectionProps) {
  const [activeField, setActiveField] = useState<SocialField | null>(null);

  /* ────────── Handler: selected social field save ────────── */
  const handleSave = async (value: string) => {
    if (!activeField) return;

    try {
      await onUpdateProfile({ [activeField]: value });
      toast.success(`${SOCIAL_CONFIG[activeField].label} updated!`);
      setActiveField(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update social profile");
    }
  };

  const activeConfig = activeField ? SOCIAL_CONFIG[activeField] : null;

  return (
    <>
      {/* ────────── Section: Optional social links card ────────── */}
      <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white/42 px-2 shadow-[0_16px_38px_rgba(43,133,203,0.14)] backdrop-blur-xl">
        {(["whatsapp", "telegram", "facebook"] as SocialField[]).map(
          (field, index) => (
            <ProfileInfoRow
              key={field}
              label={SOCIAL_CONFIG[field].label}
              value={profile[field] || undefined}
              actionType={profile[field] ? "change" : "add"}
              onActionClick={() => setActiveField(field)}
              showDivider={index < 2}
            />
          ),
        )}
      </div>

      {/* ────────── Section: Social field add/change modal ────────── */}
      {activeField && activeConfig ? (
        <AddFieldModal
          open
          title={`${profile[activeField] ? "Update" : "Add"} ${activeConfig.label}`}
          fieldLabel={activeConfig.label}
          placeholder={activeConfig.placeholder}
          initialValue={profile[activeField] || ""}
          note={activeConfig.note}
          onConfirm={handleSave}
          onClose={() => setActiveField(null)}
          loading={isUpdating}
        />
      ) : null}
    </>
  );
}
