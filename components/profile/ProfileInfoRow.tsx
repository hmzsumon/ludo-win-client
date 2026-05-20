"use client";

// ✅ ProfileInfoRow.tsx
// Smart reusable row component
// - label + value + optional action button
// - used by AccountSection and PersonalInfoSection

interface ProfileInfoRowProps {
  label: string;
  value?: string;
  // "add" | "change" | "link" | "none" – action button type
  actionType?: "add" | "change" | "link" | "none";
  onActionClick?: () => void;
  // value না থাকলে muted style দেখাবে
  isEmpty?: boolean;
  // divider দেখাবে কিনা (last row তে false)
  showDivider?: boolean;
  // right side এ শুধু text দেখাবে (button ছাড়া)
  staticValue?: boolean;
}

/* ────────── Action button label map ────────── */
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
      {/* ────────── Section: Row content ────────── */}
      <div className="flex items-center justify-between gap-3 px-2 py-3.5">
        {/* Row left side: label and value */}
        <div className="min-w-0 flex-1">
          <span className="block text-[14px] font-black text-slate-900">
            {label}
          </span>

          {!staticValue && value && (
            <span
              className={[
                "mt-0.5 block truncate text-[12px] font-semibold",
                isEmpty ? "text-slate-400" : "text-slate-500",
              ].join(" ")}
            >
              {value}
            </span>
          )}
        </div>

        {/* Row right side: static value or action button */}
        {staticValue && value ? (
          <span className="ml-3 max-w-[58%] shrink-0 truncate rounded-full border border-white/65 bg-white/52 px-3 py-1.5 text-right text-[12px] font-black text-slate-700 shadow-sm backdrop-blur-xl">
            {value}
          </span>
        ) : actionType !== "none" ? (
          <button
            onClick={onActionClick}
            className="ml-3 shrink-0 rounded-full border border-sky-200/75 bg-[linear-gradient(145deg,#ffffff_0%,#e7f9ff_100%)] px-3 py-1.5 text-[12px] font-black text-[#0877d7] shadow-sm transition hover:scale-105 hover:bg-white active:scale-95"
            type="button"
          >
            {ACTION_LABEL[actionType] || actionType}
          </button>
        ) : null}
      </div>

      {/* ────────── Section: Row divider ────────── */}
      {showDivider && (
        <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(8,119,215,0.16),transparent)]" />
      )}
    </div>
  );
}
