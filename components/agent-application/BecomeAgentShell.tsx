"use client";

/* ────────────────────────────────────────────────────────────────
   BecomeAgentShell.tsx

   ✅ Download PDF (আসল agent policy document)
   ✅ e-wallet vs cash এজেন্ট তুলনা (নীতিমালার real সংখ্যা থেকে)
   ✅ Application form — status অনুযায়ী form বা status card দেখায়
   ✅ WhatsApp/Telegram এর অন্তত একটা বাধ্যতামূলক (ব্যাকএন্ড validate করে,
      এখানে UX-এর জন্য client-side ও চেক করা হয়)
   ────────────────────────────────────────────────────────────── */

import {
  useGetMyAgentApplicationStatusQuery,
  useSubmitAgentApplicationMutation,
} from "@/redux/features/agentApplication/agentApplicationApi";
import { useState } from "react";
import toast from "react-hot-toast";

type AgentType = "e-wallet" | "cash";

const BecomeAgentShell = () => {
  const { data, isLoading, refetch } = useGetMyAgentApplicationStatusQuery();
  const [submitApplication, { isLoading: submitting }] =
    useSubmitAgentApplicationMutation();

  const application = data?.data;
  const showForm = !isLoading && (!application || application.status === "rejected");

  const [agentType, setAgentType] = useState<AgentType>("e-wallet");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim()) {
      toast.error("Full name and phone number are required");
      return;
    }
    if (!whatsapp.trim() && !telegram.trim()) {
      toast.error("Please provide WhatsApp or Telegram");
      return;
    }

    try {
      await submitApplication({
        agentType,
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        telegram: telegram.trim(),
        address: address.trim(),
        note: note.trim(),
      }).unwrap();

      toast.success("Application submitted! We'll review it shortly.");
      await refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit application");
    }
  };

  return (
    <main className="min-h-screen w-full text-white ls-stars-bg">
      <div className="relative min-h-screen w-full pb-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #23ffc8 0%, transparent 70%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[430px] px-4 pt-5">
          {/* ── Hero header ── */}
          <div className="mb-5 text-center">
            <span className="text-4xl ls-pulse">🤝</span>
            <h1 className="mt-2 text-[22px] font-black text-white">
              Become a LudoWin Agent
            </h1>
            <p className="mx-auto mt-1.5 max-w-[320px] text-[13px] font-semibold text-white/50">
              Earn commission every day by helping players deposit &amp;
              withdraw — no office, work from your phone.
            </p>
          </div>

          {/* ── Download PDF ── */}
          <a
            href="/docs/LudoWin_Agent_Policy.pdf"
            download
            className="mb-4 flex w-full items-center justify-center gap-2 ls-btn ls-btn-blue ls-shine-effect py-3 text-[14px] font-black"
          >
            📄 Download Full Agent Policy (PDF)
          </a>

          {/* ── Agent type comparison ── */}
          <section
            className="mb-5 overflow-hidden rounded-[20px] p-4"
            style={{
              background:
                "linear-gradient(145deg, rgba(45,15,80,0.85) 0%, rgba(15,3,35,0.92) 100%)",
              border: "1px solid rgba(255,215,0,0.18)",
            }}
          >
            <h2 className="mb-3 text-[15px] font-black text-white">
              Which Agent Type Fits You?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <AgentTypeCard
                emoji="📱"
                title="E-Wallet Agent"
                rows={[
                  ["Initial top-up", "2,000 USDT"],
                  ["Deposit commission", "2%"],
                  ["Withdraw commission", "2%"],
                ]}
                accent="#3cb4ff"
              />
              <AgentTypeCard
                emoji="💵"
                title="Cash Agent"
                rows={[
                  ["Initial top-up", "Free"],
                  ["Deposit commission", "4%"],
                  ["Withdraw commission", "2%"],
                ]}
                accent="#23ffc8"
              />
            </div>
            <p className="mt-3 text-[11px] font-semibold text-white/40">
              Full terms, responsibilities and rules are in the policy PDF
              above.
            </p>
          </section>

          {/* ── Status or Form ── */}
          {isLoading ? (
            <div className="animate-pulse rounded-[20px] h-40 bg-white/5" />
          ) : showForm ? (
            <>
              {application?.status === "rejected" && (
                <div
                  className="mb-4 rounded-2xl p-4"
                  style={{
                    background: "rgba(255,92,92,0.1)",
                    border: "1px solid rgba(255,92,92,0.25)",
                  }}
                >
                  <p className="text-[13px] font-black text-[#ff8080]">
                    Your previous application wasn&apos;t approved
                  </p>
                  {application.adminNote && (
                    <p className="mt-1 text-[12px] text-white/60">
                      Reason: {application.adminNote}
                    </p>
                  )}
                  <p className="mt-1 text-[12px] text-white/40">
                    You can apply again below.
                  </p>
                </div>
              )}

              <ApplicationForm
                agentType={agentType}
                setAgentType={setAgentType}
                fullName={fullName}
                setFullName={setFullName}
                phone={phone}
                setPhone={setPhone}
                whatsapp={whatsapp}
                setWhatsapp={setWhatsapp}
                telegram={telegram}
                setTelegram={setTelegram}
                address={address}
                setAddress={setAddress}
                note={note}
                setNote={setNote}
                submitting={submitting}
                onSubmit={handleSubmit}
              />
            </>
          ) : (
            <StatusCard
              status={application!.status}
              agentType={application!.agentType}
              adminNote={application!.adminNote}
              createdAt={application!.createdAt}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default BecomeAgentShell;

/* ════════════════════════════════════════════════════════════════
   SUB COMPONENTS
   ════════════════════════════════════════════════════════════════ */

function AgentTypeCard({
  emoji,
  title,
  rows,
  accent,
}: {
  emoji: string;
  title: string;
  rows: [string, string][];
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl p-3"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <p className="text-[13px] font-black text-white">
        {emoji} {title}
      </p>
      <div className="mt-2 space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white/40">
              {label}
            </span>
            <span
              className="text-[11px] font-black"
              style={{ color: accent }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusCard({
  status,
  agentType,
  adminNote,
  createdAt,
}: {
  status: "pending" | "approved" | "rejected";
  agentType: string;
  adminNote: string;
  createdAt: string;
}) {
  const isApproved = status === "approved";
  return (
    <section
      className="rounded-[22px] p-5 text-center"
      style={{
        background: isApproved
          ? "linear-gradient(145deg, rgba(16,185,129,0.16) 0%, rgba(15,3,35,0.92) 100%)"
          : "linear-gradient(145deg, rgba(255,196,3,0.14) 0%, rgba(15,3,35,0.92) 100%)",
        border: isApproved
          ? "1px solid rgba(16,185,129,0.4)"
          : "1px solid rgba(255,196,3,0.35)",
      }}
    >
      <span className="text-4xl">{isApproved ? "🎉" : "⏳"}</span>
      <h2 className="mt-2 text-[17px] font-black text-white">
        {isApproved ? "Application Approved!" : "Application Pending"}
      </h2>
      <p className="mt-1 text-[13px] font-semibold text-white/60">
        {isApproved
          ? "Our team will contact you shortly to complete onboarding."
          : "We're reviewing your application. This usually takes 1-2 days."}
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <span
          className="rounded-full px-3 py-1 text-[11px] font-black uppercase"
          style={{
            background: isApproved
              ? "rgba(16,185,129,0.2)"
              : "rgba(255,196,3,0.2)",
            color: isApproved ? "#34d399" : "#ffc403",
          }}
        >
          {agentType} agent
        </span>
        <span className="text-[11px] font-semibold text-white/40">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      {adminNote && (
        <p className="mt-3 text-[12px] text-white/50">Note: {adminNote}</p>
      )}
    </section>
  );
}

function ApplicationForm({
  agentType,
  setAgentType,
  fullName,
  setFullName,
  phone,
  setPhone,
  whatsapp,
  setWhatsapp,
  telegram,
  setTelegram,
  address,
  setAddress,
  note,
  setNote,
  submitting,
  onSubmit,
}: {
  agentType: AgentType;
  setAgentType: (v: AgentType) => void;
  fullName: string;
  setFullName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  telegram: string;
  setTelegram: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const inputClass =
    "w-full rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-white outline-none placeholder:text-white/25";
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[22px] p-4 space-y-3.5"
      style={{
        background:
          "linear-gradient(145deg, rgba(45,15,80,0.85) 0%, rgba(15,3,35,0.92) 100%)",
        border: "1px solid rgba(255,215,0,0.18)",
      }}
    >
      <h2 className="text-[15px] font-black text-white">Agent Application</h2>

      {/* Agent type toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(["e-wallet", "cash"] as AgentType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setAgentType(type)}
            className="rounded-xl py-2.5 text-[12px] font-black capitalize transition-colors"
            style={{
              background:
                agentType === type
                  ? "rgba(255,196,3,0.22)"
                  : "rgba(255,255,255,0.05)",
              border:
                agentType === type
                  ? "1px solid rgba(255,196,3,0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
              color: agentType === type ? "#ffc403" : "rgba(255,255,255,0.6)",
            }}
          >
            {type === "e-wallet" ? "📱 E-Wallet" : "💵 Cash"}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold text-white/40">
          Full Name *
        </label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your full name"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold text-white/40">
          Phone Number *
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/40">
            WhatsApp
          </label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="01XXXXXXXXX"
            className={inputClass}
            style={inputStyle}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-white/40">
            Telegram
          </label>
          <input
            value={telegram}
            onChange={(e) => setTelegram(e.target.value)}
            placeholder="@username"
            className={inputClass}
            style={inputStyle}
          />
        </div>
      </div>
      <p className="-mt-2 text-[10px] font-semibold text-white/30">
        * At least one of WhatsApp / Telegram is required
      </p>

      <div>
        <label className="mb-1 block text-[11px] font-semibold text-white/40">
          Address
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="District, area (optional)"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <div>
        <label className="mb-1 block text-[11px] font-semibold text-white/40">
          Message to Admin
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Tell us why you'd be a great agent (optional)"
          rows={3}
          className={inputClass}
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="ls-btn ls-btn-green ls-shine-effect w-full py-3 text-[14px] font-black disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
