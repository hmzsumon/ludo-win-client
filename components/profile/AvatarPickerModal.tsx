"use client";

import { AVATAR_LIST } from "@/constants/avatar-list";
import Image from "next/image";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedAvatar: string;
  onSelect: (avatar: string) => void;
  onSave: () => void;
  saving?: boolean;
};

export default function AvatarPickerModal({
  open,
  onClose,
  selectedAvatar,
  onSelect,
  onSave,
  saving = false,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#34104f] p-4 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Choose Avatar</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 max-h-[380px] overflow-y-auto">
          {AVATAR_LIST.map((avatar) => {
            const isActive = selectedAvatar === avatar;

            return (
              <button
                key={avatar}
                type="button"
                onClick={() => onSelect(avatar)}
                className={`rounded-2xl p-1 border-2 transition ${
                  isActive
                    ? "border-yellow-400 scale-105"
                    : "border-transparent"
                }`}
              >
                <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full">
                  <Image
                    src={avatar}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!selectedAvatar || saving}
          className="mt-5 w-full rounded-xl bg-yellow-400 py-3 font-bold text-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Avatar"}
        </button>
      </div>
    </div>
  );
}
