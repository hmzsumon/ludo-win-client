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
        "linear-gradient(90deg, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.25) 75%)",
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
  const { user } = useSelector((s: any) => s.auth) as any;
  const referralCode: string = user?.customerId || "LUDO0000";

  const { data: inviteRes, isLoading: loadingInvite } = useGetInviteDataQuery();
  const { data: summaryRes, isLoading: loadingSummary } =
    useGetMyTeamSummaryQuery();
  const { data: membersRes, isLoading: loadingMembers } =
    useGetMyTeamMembersQuery();

  const inviteData = inviteRes?.inviteData;
  const team = summaryRes?.team;
  const members = membersRes?.members ?? [];

  const { msg: toastMsg, show: showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "l1" | "l2" | "l3">("all");

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    showToast("Referral code copied!");
  };

  const referralLink = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/register?referral_code=${referralCode}`;
  }, [referralCode]);

  const filteredMembers =
    activeTab === "all"
      ? members
      : members.filter((m) => m.level === Number(activeTab.replace("l", "")));

  const pathname = "/invite";

  const SPONSOR_RATES = [
    { label: "1 - 100", value: "8%", tag: "Starter" },
    { label: "101 - 300", value: "5%", tag: "Growth" },
    { label: "301 - 500", value: "3%", tag: "Pro" },
    { label: "501+", value: "1%", tag: "Elite" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', sans-serif",
        paddingBottom: 86,
        color: "#172033",
        background:
          "radial-gradient(circle at 50% -10%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 25%, transparent 48%), linear-gradient(180deg, #ff7fb4 0%, #ffc0dc 23%, #ffe8f7 48%, #ffc9e6 74%, #ff7ead 100%)",
      }}
    >
      {/* Background CSS Only */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 16% 8%, rgba(255,255,255,0.95) 0 2px, transparent 4px), radial-gradient(circle at 52% 5%, rgba(255,255,255,0.9) 0 2px, transparent 4px), radial-gradient(circle at 80% 9%, rgba(255,255,255,0.9) 0 3px, transparent 6px), radial-gradient(circle at 78% 31%, rgba(255,255,255,0.85) 0 3px, transparent 7px), radial-gradient(circle at 22% 28%, rgba(255,255,255,0.8) 0 2px, transparent 5px), radial-gradient(circle at 55% 48%, rgba(255,255,255,0.75) 0 2px, transparent 5px), radial-gradient(circle at 12% 69%, rgba(255,255,255,0.8) 0 2px, transparent 5px)",
          opacity: 0.9,
          zIndex: 0,
        }}
      />

      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: -105,
          left: -55,
          right: -55,
          height: 350,
          borderRadius: "0 0 50% 50%",
          background:
            "radial-gradient(circle at 50% 10%, rgba(255,255,255,0.42), rgba(255,255,255,0.08) 48%, transparent 70%)",
          filter: "blur(1px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          top: 82,
          left: 0,
          right: 0,
          height: 155,
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.62) 55%, transparent 100%)",
          filter: "blur(18px)",
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: .45; transform: scale(.9) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.15) rotate(12deg); }
        }

        .ls-float { animation: floatY 3s ease-in-out infinite; }
        .ls-fadein { animation: fadeUp 0.45s ease both; }
        .ls-star { animation: twinkle 2.2s ease-in-out infinite; }
      `}</style>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Top Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 16px 10px",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              width: 38,
              height: 38,
              borderRadius: 15,
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#b91c5c",
              fontSize: 18,
              fontWeight: 900,
              textDecoration: "none",
              flexShrink: 0,
              boxShadow: "0 10px 24px rgba(190,24,93,0.14)",
              backdropFilter: "blur(14px)",
            }}
          >
            ←
          </Link>

          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "1.8px",
                color: "#be185d",
                textTransform: "uppercase",
              }}
            >
              Referral Center
            </p>
            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 950,
                color: "#831843",
                letterSpacing: 0.2,
              }}
            >
              Share & Earn Rewards
            </h1>
          </div>

          <div
            className="ls-star"
            style={{
              width: 38,
              height: 38,
              borderRadius: 15,
              background: "rgba(255,255,255,0.54)",
              border: "1px solid rgba(255,255,255,0.78)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
              boxShadow: "0 10px 24px rgba(190,24,93,0.13)",
            }}
          >
            ✨
          </div>
        </div>

        {/* Hero Banner */}
        <div
          className="ls-fadein"
          style={{
            margin: "12px 14px 0",
            borderRadius: 30,
            padding: "18px 16px",
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.34) 48%, rgba(255,207,232,0.46) 100%)",
            border: "1px solid rgba(255,255,255,0.78)",
            position: "relative",
            overflow: "hidden",
            boxShadow:
              "0 18px 38px rgba(190,24,93,0.18), inset 0 1px 0 rgba(255,255,255,0.75)",
            backdropFilter: "blur(18px)",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -35,
              right: -28,
              width: 130,
              height: 130,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.75), rgba(255,255,255,0.05) 64%, transparent 72%)",
            }}
          />

          <div style={{ flex: 1, position: "relative" }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 950,
                color: "#db2777",
                letterSpacing: "1.4px",
                textTransform: "uppercase",
                margin: "0 0 5px",
              }}
            >
              Bonus Program
            </p>

            <h2
              style={{
                fontSize: 24,
                fontWeight: 950,
                color: "#831843",
                lineHeight: 1.08,
                margin: 0,
              }}
            >
              Grow Your Team
              <br />
              <span
                style={{
                  color: "#0877d7",
                  textShadow: "0 1px 0 rgba(255,255,255,0.5)",
                }}
              >
                Earn More Diamonds
              </span>
            </h2>

            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(131,24,67,0.62)",
                margin: "8px 0 0",
                lineHeight: 1.45,
              }}
            >
              Share your code, build your team, and collect sponsor rewards.
            </p>
          </div>

          <div
            className="ls-float"
            style={{
              width: 78,
              height: 78,
              borderRadius: 24,
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.84), rgba(255,212,233,0.76))",
              border: "1px solid rgba(255,255,255,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              flexShrink: 0,
              boxShadow: "0 15px 30px rgba(190,24,93,0.18)",
            }}
          >
            🎁
          </div>
        </div>

        {/* Deposit Bonus Rates */}
        <div
          style={{
            margin: "12px 14px 0",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 9,
          }}
        >
          {SPONSOR_RATES.map((r) => (
            <div
              key={r.label}
              style={{
                borderRadius: 20,
                padding: "12px 11px",
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.68), rgba(255,255,255,0.32))",
                border: "1px solid rgba(255,255,255,0.78)",
                boxShadow: "0 12px 26px rgba(190,24,93,0.12)",
                backdropFilter: "blur(16px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -18,
                  top: -18,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.65), transparent 70%)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  position: "relative",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 9,
                      fontWeight: 950,
                      color: "#be185d",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    {r.tag}
                  </p>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: 11,
                      fontWeight: 800,
                      color: "rgba(131,24,67,0.62)",
                    }}
                  >
                    Deposit {r.label}
                  </p>
                </div>

                <div
                  style={{
                    minWidth: 48,
                    height: 48,
                    borderRadius: 17,
                    background:
                      "linear-gradient(180deg, #fff4a8 0%, #ffc403 58%, #f59e0b 100%)",
                    border: "1px solid rgba(255,255,255,0.9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#7c2d12",
                    fontSize: 16,
                    fontWeight: 950,
                    boxShadow: "0 9px 20px rgba(245,158,11,0.23)",
                  }}
                >
                  {r.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Row */}
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
              label: "Earned",
              val: loadingInvite
                ? null
                : `💎 ${(inviteData?.totalEarning ?? 0).toFixed(2)}`,
            },
            {
              label: "Members",
              val: loadingInvite
                ? null
                : String(inviteData?.totalTeamMember ?? 0),
            },
            {
              label: "Today",
              val: loadingInvite
                ? null
                : `💎 ${(inviteData?.todayBonus ?? 0).toFixed(2)}`,
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                borderRadius: 18,
                padding: "11px 8px",
                background: "rgba(255,255,255,0.54)",
                border: "1px solid rgba(255,255,255,0.78)",
                textAlign: "center",
                boxShadow: "0 10px 22px rgba(190,24,93,0.1)",
                backdropFilter: "blur(15px)",
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
                      fontWeight: 950,
                      color: "#0877d7",
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      color: "rgba(131,24,67,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Referral Code Card */}
        <div
          style={{
            margin: "12px 14px 0",
            borderRadius: 26,
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,255,255,0.35))",
            border: "1px solid rgba(255,255,255,0.82)",
            padding: 14,
            position: "relative",
            overflow: "hidden",
            boxShadow:
              "0 18px 36px rgba(190,24,93,0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
            backdropFilter: "blur(18px)",
          }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 950,
              color: "#db2777",
              textTransform: "uppercase",
              letterSpacing: "1.3px",
              margin: "0 0 8px",
            }}
          >
            Your Invite Code
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.55)",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.85)",
              padding: "10px 11px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            <div
              style={{
                flex: 1,
                fontSize: 21,
                fontWeight: 950,
                color: "#831843",
                letterSpacing: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {referralCode}
            </div>

            <button
              onClick={copyCode}
              style={{
                background:
                  "linear-gradient(180deg, #62dcff 0%, #168ee9 58%, #0863ca 100%)",
                border: "1px solid rgba(255,255,255,0.8)",
                borderRadius: 14,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 950,
                color: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 9px 18px rgba(8,119,215,0.24)",
              }}
            >
              Copy
            </button>
          </div>

          <div
            style={{
              marginTop: 10,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.75)",
              background: "rgba(255,255,255,0.42)",
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 950,
                color: "#be185d",
                textTransform: "uppercase",
                letterSpacing: "0.9px",
                marginBottom: 5,
              }}
            >
              Invite Link
            </div>

            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(131,24,67,0.66)",
                wordBreak: "break-all",
                lineHeight: 1.45,
              }}
            >
              {referralLink}
            </div>
          </div>

          <RWebShare
            data={{
              title: "Join Ludo Win & Earn!",
              text: `Join Ludo Win using my referral code and start earning rewards.\n\nCode: ${referralCode}`,
              url: referralLink,
            }}
            onClick={() => showToast("Share sheet opened!")}
          >
            <button
              style={{
                width: "100%",
                marginTop: 10,
                borderRadius: 18,
                padding: "12px 0",
                fontSize: 13,
                fontWeight: 950,
                background:
                  "linear-gradient(180deg, #fff4a8 0%, #ffc403 58%, #f59e0b 100%)",
                border: "1px solid rgba(255,255,255,0.9)",
                color: "#7c2d12",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                letterSpacing: "0.3px",
                boxShadow: "0 12px 24px rgba(245,158,11,0.22)",
              }}
            >
              🔗 Share Invite Link
            </button>
          </RWebShare>
        </div>

        {/* How It Works */}
        <p
          style={{
            fontSize: 11,
            fontWeight: 950,
            color: "#be185d",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            textAlign: "center",
            margin: "18px 14px 10px",
          }}
        >
          Reward Rules
        </p>

        <div
          style={{
            margin: "0 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            {
              num: 1,
              icon: "💎",
              title: "Invite a new player",
              desc: "Your friend joins using your invite code.",
              reward: "Step 1",
            },
            {
              num: 2,
              icon: "🎯",
              title: "Friend makes deposit",
              desc: "You receive sponsor bonus from approved direct deposits.",
              reward: "Up to 10%",
            },
          ].map((step) => (
            <div
              key={step.num}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.78)",
                borderRadius: 20,
                padding: "11px 12px",
                boxShadow: "0 10px 22px rgba(190,24,93,0.09)",
                backdropFilter: "blur(14px)",
              }}
            >
              <div
                style={{
                  width: 31,
                  height: 31,
                  borderRadius: 13,
                  background:
                    "linear-gradient(180deg, #fff4a8 0%, #ffc403 58%, #f59e0b 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 950,
                  color: "#7c2d12",
                  flexShrink: 0,
                  boxShadow: "0 8px 16px rgba(245,158,11,0.18)",
                }}
              >
                {step.num}
              </div>

              <div style={{ fontSize: 22, flexShrink: 0 }}>{step.icon}</div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 950,
                    color: "#831843",
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "rgba(131,24,67,0.58)",
                    marginTop: 2,
                    lineHeight: 1.35,
                  }}
                >
                  {step.desc}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(8,119,215,0.1)",
                  border: "1px solid rgba(8,119,215,0.22)",
                  borderRadius: 12,
                  padding: "4px 8px",
                  fontSize: 10,
                  fontWeight: 950,
                  color: "#0877d7",
                  whiteSpace: "nowrap",
                }}
              >
                {step.reward}
              </div>
            </div>
          ))}
        </div>

        {/* Team Members Section */}
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
              style={{
                fontSize: 15,
                fontWeight: 950,
                color: "#831843",
                margin: 0,
              }}
            >
              My Team
            </h3>

            <span
              style={{
                fontSize: 12,
                fontWeight: 950,
                color: "#0877d7",
                background: "rgba(255,255,255,0.58)",
                border: "1px solid rgba(255,255,255,0.8)",
                borderRadius: 999,
                padding: "5px 10px",
              }}
            >
              Total: {members.length}
            </span>
          </div>

          {loadingMembers ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.78)",
                    borderRadius: 18,
                    padding: "10px 12px",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.45)",
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
            <div
              style={{
                textAlign: "center",
                padding: "28px 16px",
                background: "rgba(255,255,255,0.5)",
                border: "1px solid rgba(255,255,255,0.78)",
                borderRadius: 22,
                backdropFilter: "blur(14px)",
                boxShadow: "0 12px 26px rgba(190,24,93,0.1)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>👥</div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 950,
                  color: "#831843",
                  margin: 0,
                }}
              >
                No team members yet
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "rgba(131,24,67,0.56)",
                  marginTop: 4,
                  marginBottom: 0,
                  fontWeight: 700,
                }}
              >
                Share your invite link and start growing your team.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,255,255,0.52)",
                    border: "1px solid rgba(255,255,255,0.8)",
                    borderRadius: 18,
                    padding: "10px 12px",
                    boxShadow: "0 10px 22px rgba(190,24,93,0.09)",
                    backdropFilter: "blur(14px)",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 15,
                      background:
                        "linear-gradient(180deg, #62dcff 0%, #168ee9 58%, #0863ca 100%)",
                      border: "1px solid rgba(255,255,255,0.85)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 17,
                      flexShrink: 0,
                      boxShadow: "0 8px 18px rgba(8,119,215,0.18)",
                    }}
                  >
                    {member.level === 1
                      ? "⭐"
                      : member.level === 2
                        ? "🌟"
                        : "✨"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 950,
                        color: "#831843",
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
                        fontWeight: 800,
                        color: "rgba(131,24,67,0.54)",
                        marginTop: 2,
                      }}
                    >
                      ID: {member.customerId}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 430,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,230,244,0.9))",
            borderTop: "1px solid rgba(255,255,255,0.85)",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            paddingBottom: "env(safe-area-inset-bottom)",
            zIndex: 30,
            boxShadow: "0 -14px 28px rgba(190,24,93,0.14)",
            backdropFilter: "blur(18px)",
          }}
        >
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
                      top: 5,
                      width: 44,
                      height: 44,
                      borderRadius: 17,
                      background:
                        "linear-gradient(180deg, #62dcff 0%, #168ee9 58%, #0863ca 100%)",
                      boxShadow: "0 9px 18px rgba(8,119,215,0.24)",
                    }}
                  />
                )}

                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    position: "relative",
                    zIndex: 1,
                    opacity: isActive ? 1 : 0.58,
                    transform: isActive ? "translateY(-1px)" : "none",
                  }}
                >
                  {item.icon}
                </div>

                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 950,
                    color: isActive ? "#0877d7" : "rgba(131,24,67,0.48)",
                    letterSpacing: "0.3px",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Toast Message */}
        {toastMsg && (
          <div
            style={{
              position: "fixed",
              top: 62,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(255,255,255,0.95)",
              borderRadius: 18,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 950,
              color: "#be185d",
              zIndex: 999,
              boxShadow: "0 10px 30px rgba(190,24,93,0.2)",
              whiteSpace: "nowrap",
              animation: "fadeUp 0.25s ease",
              backdropFilter: "blur(16px)",
            }}
          >
            ✨ {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}
