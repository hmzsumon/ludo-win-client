"use client";

// ✅ CountrySelectDrawer.tsx
// Dark purple gaming theme | flagcdn.com real flags | 200+ countries | no undefined bug

import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/* ────────── Country Data (200+ countries) ────────── */
// ⚠️ flag field সম্পূর্ণ বাদ — DB তে শুধু name, code, iso সেভ হবে
export const COUNTRY_LIST: Country[] = [
  { code: "+880", name: "Bangladesh", iso: "BD" },
  { code: "+93", name: "Afghanistan", iso: "AF" },
  { code: "+355", name: "Albania", iso: "AL" },
  { code: "+213", name: "Algeria", iso: "DZ" },
  { code: "+1684", name: "American Samoa", iso: "AS" },
  { code: "+376", name: "Andorra", iso: "AD" },
  { code: "+244", name: "Angola", iso: "AO" },
  { code: "+1264", name: "Anguilla", iso: "AI" },
  { code: "+1268", name: "Antigua and Barbuda", iso: "AG" },
  { code: "+54", name: "Argentina", iso: "AR" },
  { code: "+374", name: "Armenia", iso: "AM" },
  { code: "+297", name: "Aruba", iso: "AW" },
  { code: "+61", name: "Australia", iso: "AU" },
  { code: "+43", name: "Austria", iso: "AT" },
  { code: "+994", name: "Azerbaijan", iso: "AZ" },
  { code: "+1242", name: "Bahamas", iso: "BS" },
  { code: "+973", name: "Bahrain", iso: "BH" },
  { code: "+375", name: "Belarus", iso: "BY" },
  { code: "+32", name: "Belgium", iso: "BE" },
  { code: "+501", name: "Belize", iso: "BZ" },
  { code: "+229", name: "Benin", iso: "BJ" },
  { code: "+1441", name: "Bermuda", iso: "BM" },
  { code: "+975", name: "Bhutan", iso: "BT" },
  { code: "+591", name: "Bolivia", iso: "BO" },
  { code: "+387", name: "Bosnia and Herzegovina", iso: "BA" },
  { code: "+267", name: "Botswana", iso: "BW" },
  { code: "+55", name: "Brazil", iso: "BR" },
  { code: "+673", name: "Brunei", iso: "BN" },
  { code: "+359", name: "Bulgaria", iso: "BG" },
  { code: "+226", name: "Burkina Faso", iso: "BF" },
  { code: "+257", name: "Burundi", iso: "BI" },
  { code: "+855", name: "Cambodia", iso: "KH" },
  { code: "+237", name: "Cameroon", iso: "CM" },
  { code: "+1", name: "Canada", iso: "CA" },
  { code: "+238", name: "Cape Verde", iso: "CV" },
  { code: "+1345", name: "Cayman Islands", iso: "KY" },
  { code: "+236", name: "Central African Republic", iso: "CF" },
  { code: "+235", name: "Chad", iso: "TD" },
  { code: "+56", name: "Chile", iso: "CL" },
  { code: "+86", name: "China", iso: "CN" },
  { code: "+57", name: "Colombia", iso: "CO" },
  { code: "+269", name: "Comoros", iso: "KM" },
  { code: "+242", name: "Congo", iso: "CG" },
  { code: "+243", name: "Congo (DRC)", iso: "CD" },
  { code: "+682", name: "Cook Islands", iso: "CK" },
  { code: "+506", name: "Costa Rica", iso: "CR" },
  { code: "+385", name: "Croatia", iso: "HR" },
  { code: "+53", name: "Cuba", iso: "CU" },
  { code: "+357", name: "Cyprus", iso: "CY" },
  { code: "+420", name: "Czech Republic", iso: "CZ" },
  { code: "+45", name: "Denmark", iso: "DK" },
  { code: "+253", name: "Djibouti", iso: "DJ" },
  { code: "+1767", name: "Dominica", iso: "DM" },
  { code: "+1809", name: "Dominican Republic", iso: "DO" },
  { code: "+593", name: "Ecuador", iso: "EC" },
  { code: "+20", name: "Egypt", iso: "EG" },
  { code: "+503", name: "El Salvador", iso: "SV" },
  { code: "+240", name: "Equatorial Guinea", iso: "GQ" },
  { code: "+291", name: "Eritrea", iso: "ER" },
  { code: "+372", name: "Estonia", iso: "EE" },
  { code: "+251", name: "Ethiopia", iso: "ET" },
  { code: "+679", name: "Fiji", iso: "FJ" },
  { code: "+358", name: "Finland", iso: "FI" },
  { code: "+33", name: "France", iso: "FR" },
  { code: "+594", name: "French Guiana", iso: "GF" },
  { code: "+689", name: "French Polynesia", iso: "PF" },
  { code: "+241", name: "Gabon", iso: "GA" },
  { code: "+220", name: "Gambia", iso: "GM" },
  { code: "+995", name: "Georgia", iso: "GE" },
  { code: "+49", name: "Germany", iso: "DE" },
  { code: "+233", name: "Ghana", iso: "GH" },
  { code: "+350", name: "Gibraltar", iso: "GI" },
  { code: "+30", name: "Greece", iso: "GR" },
  { code: "+299", name: "Greenland", iso: "GL" },
  { code: "+1473", name: "Grenada", iso: "GD" },
  { code: "+1671", name: "Guam", iso: "GU" },
  { code: "+502", name: "Guatemala", iso: "GT" },
  { code: "+224", name: "Guinea", iso: "GN" },
  { code: "+245", name: "Guinea-Bissau", iso: "GW" },
  { code: "+592", name: "Guyana", iso: "GY" },
  { code: "+509", name: "Haiti", iso: "HT" },
  { code: "+504", name: "Honduras", iso: "HN" },
  { code: "+852", name: "Hong Kong", iso: "HK" },
  { code: "+36", name: "Hungary", iso: "HU" },
  { code: "+354", name: "Iceland", iso: "IS" },
  { code: "+91", name: "India", iso: "IN" },
  { code: "+62", name: "Indonesia", iso: "ID" },
  { code: "+98", name: "Iran", iso: "IR" },
  { code: "+964", name: "Iraq", iso: "IQ" },
  { code: "+353", name: "Ireland", iso: "IE" },
  { code: "+972", name: "Israel", iso: "IL" },
  { code: "+39", name: "Italy", iso: "IT" },
  { code: "+1876", name: "Jamaica", iso: "JM" },
  { code: "+81", name: "Japan", iso: "JP" },
  { code: "+962", name: "Jordan", iso: "JO" },
  { code: "+7", name: "Kazakhstan", iso: "KZ" },
  { code: "+254", name: "Kenya", iso: "KE" },
  { code: "+686", name: "Kiribati", iso: "KI" },
  { code: "+383", name: "Kosovo", iso: "XK" },
  { code: "+965", name: "Kuwait", iso: "KW" },
  { code: "+996", name: "Kyrgyzstan", iso: "KG" },
  { code: "+856", name: "Laos", iso: "LA" },
  { code: "+371", name: "Latvia", iso: "LV" },
  { code: "+961", name: "Lebanon", iso: "LB" },
  { code: "+266", name: "Lesotho", iso: "LS" },
  { code: "+231", name: "Liberia", iso: "LR" },
  { code: "+218", name: "Libya", iso: "LY" },
  { code: "+423", name: "Liechtenstein", iso: "LI" },
  { code: "+370", name: "Lithuania", iso: "LT" },
  { code: "+352", name: "Luxembourg", iso: "LU" },
  { code: "+853", name: "Macau", iso: "MO" },
  { code: "+389", name: "Macedonia", iso: "MK" },
  { code: "+261", name: "Madagascar", iso: "MG" },
  { code: "+265", name: "Malawi", iso: "MW" },
  { code: "+60", name: "Malaysia", iso: "MY" },
  { code: "+960", name: "Maldives", iso: "MV" },
  { code: "+223", name: "Mali", iso: "ML" },
  { code: "+356", name: "Malta", iso: "MT" },
  { code: "+692", name: "Marshall Islands", iso: "MH" },
  { code: "+222", name: "Mauritania", iso: "MR" },
  { code: "+230", name: "Mauritius", iso: "MU" },
  { code: "+52", name: "Mexico", iso: "MX" },
  { code: "+691", name: "Micronesia", iso: "FM" },
  { code: "+373", name: "Moldova", iso: "MD" },
  { code: "+377", name: "Monaco", iso: "MC" },
  { code: "+976", name: "Mongolia", iso: "MN" },
  { code: "+382", name: "Montenegro", iso: "ME" },
  { code: "+212", name: "Morocco", iso: "MA" },
  { code: "+258", name: "Mozambique", iso: "MZ" },
  { code: "+95", name: "Myanmar", iso: "MM" },
  { code: "+264", name: "Namibia", iso: "NA" },
  { code: "+674", name: "Nauru", iso: "NR" },
  { code: "+977", name: "Nepal", iso: "NP" },
  { code: "+31", name: "Netherlands", iso: "NL" },
  { code: "+687", name: "New Caledonia", iso: "NC" },
  { code: "+64", name: "New Zealand", iso: "NZ" },
  { code: "+505", name: "Nicaragua", iso: "NI" },
  { code: "+227", name: "Niger", iso: "NE" },
  { code: "+234", name: "Nigeria", iso: "NG" },
  { code: "+850", name: "North Korea", iso: "KP" },
  { code: "+47", name: "Norway", iso: "NO" },
  { code: "+968", name: "Oman", iso: "OM" },
  { code: "+92", name: "Pakistan", iso: "PK" },
  { code: "+680", name: "Palau", iso: "PW" },
  { code: "+970", name: "Palestine", iso: "PS" },
  { code: "+507", name: "Panama", iso: "PA" },
  { code: "+675", name: "Papua New Guinea", iso: "PG" },
  { code: "+595", name: "Paraguay", iso: "PY" },
  { code: "+51", name: "Peru", iso: "PE" },
  { code: "+63", name: "Philippines", iso: "PH" },
  { code: "+48", name: "Poland", iso: "PL" },
  { code: "+351", name: "Portugal", iso: "PT" },
  { code: "+1787", name: "Puerto Rico", iso: "PR" },
  { code: "+974", name: "Qatar", iso: "QA" },
  { code: "+40", name: "Romania", iso: "RO" },
  { code: "+7", name: "Russia", iso: "RU" },
  { code: "+250", name: "Rwanda", iso: "RW" },
  { code: "+1869", name: "Saint Kitts and Nevis", iso: "KN" },
  { code: "+1758", name: "Saint Lucia", iso: "LC" },
  { code: "+1784", name: "Saint Vincent", iso: "VC" },
  { code: "+685", name: "Samoa", iso: "WS" },
  { code: "+378", name: "San Marino", iso: "SM" },
  { code: "+966", name: "Saudi Arabia", iso: "SA" },
  { code: "+221", name: "Senegal", iso: "SN" },
  { code: "+381", name: "Serbia", iso: "RS" },
  { code: "+248", name: "Seychelles", iso: "SC" },
  { code: "+232", name: "Sierra Leone", iso: "SL" },
  { code: "+65", name: "Singapore", iso: "SG" },
  { code: "+421", name: "Slovakia", iso: "SK" },
  { code: "+386", name: "Slovenia", iso: "SI" },
  { code: "+677", name: "Solomon Islands", iso: "SB" },
  { code: "+252", name: "Somalia", iso: "SO" },
  { code: "+27", name: "South Africa", iso: "ZA" },
  { code: "+82", name: "South Korea", iso: "KR" },
  { code: "+211", name: "South Sudan", iso: "SS" },
  { code: "+34", name: "Spain", iso: "ES" },
  { code: "+94", name: "Sri Lanka", iso: "LK" },
  { code: "+249", name: "Sudan", iso: "SD" },
  { code: "+597", name: "Suriname", iso: "SR" },
  { code: "+268", name: "Swaziland", iso: "SZ" },
  { code: "+46", name: "Sweden", iso: "SE" },
  { code: "+41", name: "Switzerland", iso: "CH" },
  { code: "+963", name: "Syria", iso: "SY" },
  { code: "+886", name: "Taiwan", iso: "TW" },
  { code: "+992", name: "Tajikistan", iso: "TJ" },
  { code: "+255", name: "Tanzania", iso: "TZ" },
  { code: "+66", name: "Thailand", iso: "TH" },
  { code: "+670", name: "Timor-Leste", iso: "TL" },
  { code: "+228", name: "Togo", iso: "TG" },
  { code: "+676", name: "Tonga", iso: "TO" },
  { code: "+1868", name: "Trinidad and Tobago", iso: "TT" },
  { code: "+216", name: "Tunisia", iso: "TN" },
  { code: "+90", name: "Turkey", iso: "TR" },
  { code: "+993", name: "Turkmenistan", iso: "TM" },
  { code: "+688", name: "Tuvalu", iso: "TV" },
  { code: "+256", name: "Uganda", iso: "UG" },
  { code: "+380", name: "Ukraine", iso: "UA" },
  { code: "+971", name: "UAE", iso: "AE" },
  { code: "+44", name: "United Kingdom", iso: "GB" },
  { code: "+1", name: "United States", iso: "US" },
  { code: "+598", name: "Uruguay", iso: "UY" },
  { code: "+998", name: "Uzbekistan", iso: "UZ" },
  { code: "+678", name: "Vanuatu", iso: "VU" },
  { code: "+58", name: "Venezuela", iso: "VE" },
  { code: "+84", name: "Vietnam", iso: "VN" },
  { code: "+967", name: "Yemen", iso: "YE" },
  { code: "+260", name: "Zambia", iso: "ZM" },
  { code: "+263", name: "Zimbabwe", iso: "ZW" },
];

/* ────────── Types ────────── */
export interface Country {
  code: string;
  name: string;
  iso: string;
  // ⚠️ flag field নেই — DB তে শুধু name, code, iso সেভ হবে
}

interface CountrySelectDrawerProps {
  open: boolean;
  selected: Country | null;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

/* ── Theme ── */
const T = {
  drawerBg: "#150d2e",
  border: "rgba(139,92,246,0.18)",
  accent: "#00e5cc",
  accentDim: "rgba(0,229,204,0.1)",
  textPrimary: "#f0eeff",
  textSecondary: "#a78bfa",
  textMuted: "#5b4d7e",
  inputBg: "rgba(255,255,255,0.05)",
  rowHover: "rgba(139,92,246,0.09)",
  handle: "rgba(139,92,246,0.35)",
};

/* ────────── Flag Image ────────── */
function FlagImage({ iso, name }: { iso: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!iso || err) {
    return (
      <div
        style={{
          width: 32,
          height: 22,
          borderRadius: 4,
          background: "rgba(139,92,246,0.15)",
          border: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          color: T.textSecondary,
          flexShrink: 0,
        }}
      >
        {iso || "?"}
      </div>
    );
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
      srcSet={`https://flagcdn.com/w80/${iso.toLowerCase()}.png 2x`}
      alt={name}
      onError={() => setErr(true)}
      loading="lazy"
      style={{
        width: 32,
        height: 22,
        objectFit: "cover",
        borderRadius: 4,
        flexShrink: 0,
        boxShadow: "0 1px 6px rgba(0,0,0,0.5)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    />
  );
}

/* ────────── Main Component ────────── */
export default function CountrySelectDrawer({
  open,
  selected,
  onSelect,
  onClose,
}: CountrySelectDrawerProps) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return COUNTRY_LIST;
    return COUNTRY_LIST.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.replace("+", "").includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [search]);

  const recommended = COUNTRY_LIST.find((c) => c.iso === "BD")!;
  const others = filtered.filter((c) => c.iso !== "BD");
  const showRecommended =
    !search ||
    recommended.name.toLowerCase().includes(search.toLowerCase()) ||
    recommended.code.includes(search);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(5,2,18,0.88)",
          backdropFilter: "blur(8px)",
          transition: "opacity 0.3s",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          background: T.drawerBg,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.32s cubic-bezier(0.32,0.72,0,1)",
          boxShadow:
            "0 -8px 48px rgba(0,0,0,0.7), 0 -1px 0 rgba(139,92,246,0.25)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 4px",
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 99,
              background: T.handle,
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px 14px",
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: T.textPrimary,
            }}
          >
            Select Country Code
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: "50%",
              background: "rgba(139,92,246,0.12)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              color: T.textSecondary,
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: T.inputBg,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "10px 14px",
            }}
          >
            <Search size={15} style={{ color: T.textMuted, flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search country, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 14,
                color: T.textPrimary,
                caretColor: T.accent,
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: T.textMuted,
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 40px" }}>
          {/* Manual entry */}
          {!search && (
            <button
              onClick={() => {
                onSelect({ code: "", name: "Manual Entry", iso: "" });
                onClose();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "12px 4px",
                background: "none",
                border: "none",
                borderBottom: `1px solid ${T.border}`,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 22,
                  borderRadius: 4,
                  background: T.inputBg,
                  border: `1px solid ${T.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                }}
              >
                ⌨️
              </div>
              <span
                style={{
                  fontSize: 14,
                  color: T.textSecondary,
                  fontWeight: 500,
                }}
              >
                Enter code manually
              </span>
            </button>
          )}

          {/* Recommended */}
          {showRecommended && !search && (
            <>
              <SectionLabel text="Recommended" />
              <CountryRow
                country={recommended}
                selected={selected}
                onSelect={(c) => {
                  onSelect(c);
                  onClose();
                }}
              />
            </>
          )}

          {/* Countries */}
          {others.length > 0 && (
            <>
              {!search && <SectionLabel text="All Countries" />}
              {others.map((country) => (
                <CountryRow
                  key={`${country.iso}-${country.code}`}
                  country={country}
                  selected={selected}
                  onSelect={(c) => {
                    onSelect(c);
                    onClose();
                  }}
                />
              ))}
            </>
          )}

          {filtered.length === 0 && (
            <div
              style={{
                padding: "48px 0",
                textAlign: "center",
                color: T.textMuted,
                fontSize: 14,
              }}
            >
              No country found for "{search}"
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Section Label ── */
function SectionLabel({ text }: { text: string }) {
  return (
    <p
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: T.accent,
        margin: "14px 0 6px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {text}
    </p>
  );
}

/* ── Country Row ── */
function CountryRow({
  country,
  selected,
  onSelect,
}: {
  country: Country;
  selected: Country | null;
  onSelect: (c: Country) => void;
}) {
  const isSelected =
    selected?.iso === country.iso && selected?.code === country.code;
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onSelect(country)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "11px 6px",
        background: isSelected
          ? T.accentDim
          : hovered
            ? T.rowHover
            : "transparent",
        border: "none",
        borderBottom: `1px solid ${T.border}`,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
        borderRadius: 6,
      }}
    >
      <FlagImage iso={country.iso} name={country.name} />

      <span
        style={{
          flex: 1,
          fontSize: 14,
          fontWeight: isSelected ? 600 : 400,
          color: isSelected ? T.accent : T.textPrimary,
        }}
      >
        {/* ✅ undefined fix: code আর name আলাদাভাবে রেন্ডার, flag নেই */}
        <span style={{ color: T.textSecondary, marginRight: 6 }}>
          {country.code}
        </span>
        {country.name}
      </span>

      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `2px solid ${isSelected ? T.accent : T.textMuted}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "border-color 0.2s",
        }}
      >
        {isSelected && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: T.accent,
            }}
          />
        )}
      </div>
    </button>
  );
}
