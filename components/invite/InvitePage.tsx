"use client";

/* ─────────────────────────────────────────────
   Imports
───────────────────────────────────────────── */
import {
  useGetInviteDataQuery,
  useGetMyTeamMembersQuery,
  useGetMyTeamSummaryQuery,
} from "@/redux/features/invite/inviteApi";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RWebShare } from "react-web-share";

/* ─────────────────────────────────────────────
   Bottom Navigation Items
───────────────────────────────────────────── */
const navItems = [
  { label: "Home", icon: "🏠", href: "/dashboard" },
  { label: "Invite", icon: "🎁", href: "/invite" },
  { label: "Wallet", icon: "👛", href: "/wallet" },
  { label: "Profile", icon: "👤", href: "/profile" },
];

/* ─────────────────────────────────────────────
   Reusable Shimmer Loader
───────────────────────────────────────────── */
const Shimmer = ({
  w = "100%",
  h = 20,
  r = 8,
}: {
  w?: string | number;
  h?: number;
  r?: number;
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background:
        "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }}
  />
);

/* ─────────────────────────────────────────────
   Lightweight Toast Hook
───────────────────────────────────────────── */
const useToast = () => {
  const [msg, setMsg] = useState<string | null>(null);

  const show = useCallback((text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(null), 2200);
  }, []);

  return { msg, show };
};

export default function InvitePage() {
  /* ───────────────────────────────────────────
     User / Auth Data
  ─────────────────────────────────────────── */
  const { user } = useSelector((s: any) => s.auth) as any;
  const referralCode: string = user?.customerId || "LUDO0000";

  /* ───────────────────────────────────────────
     API Queries
  ─────────────────────────────────────────── */
  const { data: inviteRes, isLoading: loadingInvite } = useGetInviteDataQuery();
  const { data: summaryRes, isLoading: loadingSummary } =
    useGetMyTeamSummaryQuery();
  const { data: membersRes, isLoading: loadingMembers } =
    useGetMyTeamMembersQuery();

  /* ───────────────────────────────────────────
     Normalized Data
  ─────────────────────────────────────────── */
  const inviteData = inviteRes?.inviteData;
  const team = summaryRes?.team;
  const members = membersRes?.members ?? [];

  /* ───────────────────────────────────────────
     UI State
  ─────────────────────────────────────────── */
  const { msg: toastMsg, show: showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "l1" | "l2" | "l3">("all");

  /* ───────────────────────────────────────────
     Copy Referral Code
  ─────────────────────────────────────────── */
  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    showToast("Referral code copied!");
  };

  /* ───────────────────────────────────────────
     Shared Referral Link
     Single source of truth for registration URL
  ─────────────────────────────────────────── */
  const referralLink = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/register?referral_code=${referralCode}`;
  }, [referralCode]);

  /* ───────────────────────────────────────────
     Filter Members By Active Tab
  ─────────────────────────────────────────── */
  const filteredMembers =
    activeTab === "all"
      ? members
      : members.filter((m) => m.level === Number(activeTab.replace("l", "")));

  /* ───────────────────────────────────────────
     Static Page Helpers
  ─────────────────────────────────────────── */
  const pathname = "/invite";

  const SPONSOR_RATES = [
    { label: "1-50", value: "10%" },
    { label: "51-150", value: "5%" },
    { label: "151-300", value: "2%" },
    { label: "301-UL", value: "1%" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d0221 0%, #1a0533 100%)",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        fontFamily: "'Segoe UI', sans-serif",
        paddingBottom: 80,
      }}
    >
      {/* ─────────────────────────────────────────
         Page Animations
      ───────────────────────────────────────── */}
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .ls-float { animation: floatY 3s ease-in-out infinite; }
        .ls-fadein { animation: fadeUp 0.45s ease both; }
      `}</style>

      {/* ─────────────────────────────────────────
         Top Bar
      ───────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px 10px",
          borderBottom: "1px solid rgba(255,215,0,0.12)",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 16,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          ←
        </Link>

        <h1
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 0.3,
          }}
        >
          Refer &amp; Earn
        </h1>

        <div style={{ fontSize: 22 }}>🎁</div>
      </div>

      {/* ─────────────────────────────────────────
         Hero Banner
      ───────────────────────────────────────── */}
      <div
        className="ls-fadein"
        style={{
          margin: "14px 14px 0",
          borderRadius: 22,
          padding: "18px 16px",
          background: "linear-gradient(135deg, #4a1a8a 0%, #1a0533 100%)",
          border: "1px solid rgba(255,215,0,0.22)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)",
          }}
        />

        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,215,0,0.75)",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Special Offer
          </p>

          <h2
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Invite Friends &amp;
            <br />
            <span style={{ color: "#ffd700" }}>Win Together!</span>
          </h2>

          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.5)",
              marginTop: 6,
            }}
          >
            Earn sponsor bonus on direct referral deposits
          </p>

          <div
            style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}
          >
            {SPONSOR_RATES.map((r) => (
              <span
                key={r.label}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  background: "rgba(255,215,0,0.14)",
                  border: "1px solid rgba(255,215,0,0.28)",
                  borderRadius: 20,
                  padding: "3px 9px",
                  color: "#ffd700",
                }}
              >
                Deposit {r.label}: {r.value}
              </span>
            ))}
          </div>
        </div>

        <div
          className="ls-float"
          style={{
            width: 76,
            height: 76,
            borderRadius: 18,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 38,
            flexShrink: 0,
          }}
        >
          👨‍👩‍👧
        </div>
      </div>

      {/* ─────────────────────────────────────────
         Stats Row
      ───────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          margin: "12px 14px 0",
        }}
      >
        {[
          {
            label: "Total Earned",
            val: loadingInvite
              ? null
              : `💎 ${(inviteData?.totalEarning ?? 0).toFixed(2)}`,
          },
          {
            label: "Total Members",
            val: loadingInvite
              ? null
              : String(inviteData?.totalTeamMember ?? 0),
          },
          {
            label: "Today's Bonus",
            val: loadingInvite
              ? null
              : `💎 ${(inviteData?.todayBonus ?? 0).toFixed(2)}`,
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              borderRadius: 14,
              padding: "10px 8px",
              background:
                "linear-gradient(135deg, rgba(53,10,110,0.8) 0%, rgba(29,5,70,0.8) 100%)",
              border: "1px solid rgba(255,215,0,0.15)",
              textAlign: "center",
            }}
          >
            {s.val === null ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Shimmer w="70%" h={16} />
                <Shimmer w="50%" h={10} />
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#ffd700",
                    lineHeight: 1,
                  }}
                >
                  {s.val}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    marginTop: 3,
                  }}
                >
                  {s.label}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────
         Referral Code Card
      ───────────────────────────────────────── */}
      <div
        style={{
          margin: "12px 14px 0",
          borderRadius: 18,
          background:
            "linear-gradient(135deg, rgba(29,5,70,0.95) 0%, rgba(53,10,110,0.95) 100%)",
          border: "1px solid rgba(255,215,0,0.2)",
          padding: "14px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.4), transparent)",
          }}
        />

        {/* Code Label */}
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,215,0,0.7)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: 8,
          }}
        >
          Your Referral Code
        </p>

        {/* Code Box + Copy Action */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0,0,0,0.3)",
            borderRadius: 12,
            border: "1px solid rgba(255,215,0,0.25)",
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              flex: 1,
              fontSize: 21,
              fontWeight: 900,
              color: "#ffd700",
              letterSpacing: 3,
            }}
          >
            {referralCode}
          </div>

          <button
            onClick={copyCode}
            style={{
              background: "linear-gradient(135deg, #ffd700, #c89a0a)",
              border: "none",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 800,
              color: "#1a0533",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Copy
          </button>
        </div>

        {/* Shared Referral URL Preview */}
        <div
          style={{
            marginTop: 10,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(0,0,0,0.22)",
            padding: "10px 12px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "rgba(255,215,0,0.65)",
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              marginBottom: 5,
            }}
          >
            Referral Link
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "rgba(255,255,255,0.72)",
              wordBreak: "break-all",
              lineHeight: 1.45,
            }}
          >
            {referralLink}
          </div>
        </div>

        {/* Native Share Button Under Referral Code */}
        <RWebShare
          data={{
            title: "Join Ludo Party & Win!",
            text: `Join Ludo Party using my referral code and get a 50 diamond bonus.\n\nCode: ${referralCode}`,
            url: referralLink,
          }}
          onClick={() => showToast("Share sheet opened!")}
        >
          <button
            style={{
              width: "100%",
              marginTop: 10,
              borderRadius: 12,
              padding: "11px 0",
              fontSize: 13,
              fontWeight: 800,
              background: "linear-gradient(135deg, #ffd700 0%, #e6a800 100%)",
              border: "none",
              color: "#1a0533",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: "0.3px",
              boxShadow: "0 4px 18px rgba(255,215,0,0.22)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1a0533"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Invite Now — Share Link
          </button>
        </RWebShare>
      </div>

      {/* ─────────────────────────────────────────
         How It Works
      ───────────────────────────────────────── */}
      <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,215,0,0.7)",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          textAlign: "center",
          margin: "18px 14px 10px",
        }}
      >
        How It Works
      </p>

      <div
        style={{
          margin: "0 14px",
          display: "flex",
          flexDirection: "column",
          gap: 7,
        }}
      >
        {[
          {
            num: 1,
            icon: "🎲",
            title: "Friend makes a deposit",
            desc: "You earn sponsor bonus on every approved direct deposit",
            reward: "Up to 10%",
          },
        ].map((step) => (
          <div
            key={step.num}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(53,10,110,0.45)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #ffd700, #c89a0a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: "#1a0533",
                flexShrink: 0,
              }}
            >
              {step.num}
            </div>

            <div style={{ fontSize: 20, flexShrink: 0 }}>{step.icon}</div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {step.title}
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 1,
                }}
              >
                {step.desc}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,215,0,0.15)",
                border: "1px solid rgba(255,215,0,0.3)",
                borderRadius: 8,
                padding: "3px 8px",
                fontSize: 10,
                fontWeight: 800,
                color: "#ffd700",
                whiteSpace: "nowrap",
              }}
            >
              {step.reward}
            </div>
          </div>
        ))}
      </div>

      {/* ─────────────────────────────────────────
         Team Summary Cards
      ───────────────────────────────────────── */}
      {/* <p
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "rgba(255,215,0,0.7)",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          textAlign: "center",
          margin: "18px 14px 10px",
        }}
      >
        Team Overview
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          margin: "0 14px",
        }}
      >
        {[
          {
            label: "This Month's Commission",
            val: `💎 ${(team?.thisMonthCommission ?? 0).toFixed(2)}`,
            icon: "📅",
          },
          {
            label: "Total Team Commission",
            val: `💎 ${(team?.totalTeamCommission ?? 0).toFixed(2)}`,
            icon: "💰",
          },
          {
            label: "Active Members",
            val: String(team?.teamActiveMember ?? 0),
            icon: "✅",
          },
          {
            label: "Level-1 Active",
            val: String(team?.level_1?.activeUsers ?? 0),
            icon: "⭐",
          },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              borderRadius: 14,
              padding: "12px",
              background:
                "linear-gradient(135deg, rgba(53,10,110,0.7) 0%, rgba(29,5,70,0.7) 100%)",
              border: "1px solid rgba(255,215,0,0.12)",
            }}
          >
            {loadingSummary ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <Shimmer w="60%" h={18} />
                <Shimmer w="80%" h={10} />
              </div>
            ) : (
              <>
                <div style={{ fontSize: 14 }}>{c.icon}</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#ffd700",
                    marginTop: 4,
                  }}
                >
                  {c.val}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.45)",
                    marginTop: 2,
                  }}
                >
                  {c.label}
                </div>
              </>
            )}
          </div>
        ))}
      </div> */}

      {/* ─────────────────────────────────────────
         Team Members Section
      ───────────────────────────────────────── */}
      <div style={{ margin: "18px 14px 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <h3
            style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0 }}
          >
            Team Members
          </h3>

          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,215,0,0.7)",
            }}
          >
            Total: {members.length}
          </span>
        </div>

        {/* Member Filter Tabs */}
        {/* <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {(["all", "l1", "l2", "l3"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                borderRadius: 10,
                padding: "6px 4px",
                fontSize: 11,
                fontWeight: 800,
                border: "1px solid",
                cursor: "pointer",
                background:
                  activeTab === tab
                    ? "rgba(255,215,0,0.18)"
                    : "rgba(255,255,255,0.04)",
                borderColor:
                  activeTab === tab
                    ? "rgba(255,215,0,0.4)"
                    : "rgba(255,255,255,0.1)",
                color: activeTab === tab ? "#ffd700" : "rgba(255,255,255,0.45)",
              }}
            >
              {tab === "all" ? "All" : `Level ${tab.replace("l", "")}`}
            </button>
          ))}
        </div> */}

        {/* Member Loading State */}
        {loadingMembers ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(53,10,110,0.4)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 13,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.06)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                  }}
                >
                  <Shimmer w="55%" h={12} />
                  <Shimmer w="40%" h={9} />
                </div>
                <Shimmer w={50} h={22} r={8} />
              </div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          /* Empty Members State */
          <div
            style={{
              textAlign: "center",
              padding: "28px 16px",
              background: "rgba(53,10,110,0.3)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              No members yet
            </p>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                marginTop: 4,
              }}
            >
              Invite friends and start earning commission.
            </p>
          </div>
        ) : (
          /* Members List */
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(53,10,110,0.4)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 13,
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(74,26,138,0.7)",
                    border: "2px solid rgba(255,215,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {member.level === 1 ? "⭐" : member.level === 2 ? "🌟" : "✨"}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.4)",
                      marginTop: 1,
                    }}
                  >
                    ID: {member.customerId}
                  </div>
                </div>

                {/* <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 3,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 8,
                      background:
                        member.status === "active"
                          ? "rgba(46,204,113,0.15)"
                          : "rgba(255,215,0,0.12)",
                      border: `1px solid ${
                        member.status === "active"
                          ? "rgba(46,204,113,0.3)"
                          : "rgba(255,215,0,0.25)"
                      }`,
                      color: member.status === "active" ? "#2ecc71" : "#ffd700",
                    }}
                  >
                    {member.status === "active" ? "Active" : "Inactive"}
                  </div>

                  {member.commission > 0 && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#ffd700",
                      }}
                    >
                      +💎{member.commission.toFixed(2)}
                    </div>
                  )}
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────
         Bottom Navigation
      ───────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: "linear-gradient(180deg, #1a0533 0%, #0d0221 100%)",
          borderTop: "1px solid rgba(255,215,0,0.18)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          paddingBottom: "env(safe-area-inset-bottom)",
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent)",
          }}
        />

        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: "8px 2px 10px",
                textDecoration: "none",
                position: "relative",
              }}
            >
              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(ellipse at center top, rgba(255,215,0,0.12) 0%, transparent 70%)",
                  }}
                />
              )}

              {isActive && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 28,
                    height: 2,
                    borderRadius: "0 0 4px 4px",
                    background: "linear-gradient(90deg, #ffd700, #ffec6e)",
                  }}
                />
              )}

              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  ...(isActive
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.08) 100%)",
                        border: "1px solid rgba(255,215,0,0.3)",
                      }
                    : { opacity: 0.45 }),
                }}
              >
                {item.icon}
              </div>

              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: isActive ? "#ffd700" : "rgba(255,255,255,0.4)",
                  letterSpacing: "0.3px",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ─────────────────────────────────────────
         Toast Message
      ───────────────────────────────────────── */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            background: "linear-gradient(135deg, #4a1a8a, #1a0533)",
            border: "1px solid rgba(255,215,0,0.4)",
            borderRadius: 14,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            color: "#ffd700",
            zIndex: 999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            whiteSpace: "nowrap",
            animation: "fadeUp 0.25s ease",
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
