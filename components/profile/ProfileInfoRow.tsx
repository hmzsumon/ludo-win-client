"use client";

// ✅ ProfileInfoRow.tsx
// Reusable row component – label + value + optional action button
// Screenshot এর প্রতিটি row এই component দিয়ে তৈরি

interface ProfileInfoRowProps {
  label: string;
  value?: string;
  // "add" | "change" | "link" | "none" – button type
  actionType?: "add" | "change" | "link" | "none";
  onActionClick?: () => void;
  // value না থাকলে muted style দেখাবে
  isEmpty?: boolean;
  // divider দেখাবে কিনা (last row তে false)
  showDivider?: boolean;
  // right side এ শুধু text দেখাবে (button ছাড়া)
  staticValue?: boolean;
}

/* ── Action button label map ── */
const ACTION_LABEL: Record<string, string> = {
  add: "Add",
  change: "Change",
  link: "Link",
};

export default function ProfileInfoRow({
  label,
  value,
  actionType = "none",
  onActionClick,
  isEmpty = false,
  showDivider = true,
  staticValue = false,
}: ProfileInfoRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-1 py-3.5">
        {/* ── Left: Label + Value ── */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-medium text-white/90">{label}</span>
          {value && (
            <span
              className={[
                "text-[12px] mt-0.5",
                isEmpty ? "text-white/30" : "text-white/50",
              ].join(" ")}
            >
              {value}
            </span>
          )}
        </div>

        {/* ── Right: Action or Static Value ── */}
        {staticValue && value ? (
          // শুধু text (যেমন registration date, account number)
          <span className="text-[13px] text-white/60 font-medium shrink-0 ml-4 text-right">
            {value}
          </span>
        ) : actionType !== "none" ? (
          // Action button (Add / Change / Link)
          <button
            onClick={onActionClick}
            className="shrink-0 ml-4 text-[13px] font-semibold text-[#23ffc8] hover:text-[#23ffc8]/80 active:scale-95 transition-all"
          >
            {ACTION_LABEL[actionType] || actionType}
          </button>
        ) : null}
      </div>

      {/* ── Divider ── */}
      {showDivider && (
        <div
          className="h-px w-full"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
      )}
    </div>
  );
}
