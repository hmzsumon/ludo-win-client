import { Plane } from "lucide-react";

// Lightweight guide illustrations stay sharp on mobile without extra image assets.
export default function RuleIllustration({ step }: { step: number }) {
  if (step === 0) return <div aria-hidden="true" className="rounded-xl border border-[#34363a] bg-[#1b1c1e] p-3">
    <div className="mx-auto mb-3 flex w-3/4 rounded-full bg-[#111214] text-center text-[10px]"><span className="w-1/2 rounded-full bg-[#303136] py-1">Bet</span><span className="w-1/2 py-1 text-[#777]">Auto</span></div>
    <div className="flex items-center gap-3"><div className="flex-1 text-center text-[#aaa]"><div className="flex justify-between rounded-full bg-[#111214] px-2 py-1"><span>−</span><b className="text-white">1.00</b><span>+</span></div><div className="mt-1 grid grid-cols-2 gap-1 text-[10px]">{["100", "200", "500", "10,000"].map(value => <span key={value} className="rounded-full bg-[#111214] py-1">{value}</span>)}</div></div><div className="w-1/2 rounded-xl border border-[#aff895] bg-[#16ac02] py-3 text-center text-base leading-tight text-white">Bet<br />1.00 BDT</div></div>
  </div>;
  return <div aria-hidden="true" className="relative h-28 overflow-hidden rounded-xl border border-[#34363a] bg-[#101113]">
    <svg viewBox="0 0 320 112" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><defs><linearGradient id={`aviator-guide-${step}`} x1="0" y1="1" x2="1" y2="0"><stop stopColor={step === 1 ? "#e60036" : "#52b91a"} stopOpacity="0" /><stop offset="1" stopColor={step === 1 ? "#e60036" : "#52b91a"} stopOpacity=".6" /></linearGradient></defs><path d="M 0 110 Q 180 110 275 25 L 275 112 Z" fill={`url(#aviator-guide-${step})`} /><path d="M 0 110 Q 180 110 275 25" stroke={step === 1 ? "#f00643" : "#77ce23"} strokeWidth="4" fill="none" /></svg>
    <Plane className="absolute right-[10%] top-2 h-10 w-10 -rotate-12 text-[#ed0640]" />
    <div className="absolute inset-0 flex items-center justify-center">{step === 1 ? <span className="text-4xl font-bold text-white">2.25x</span> : <span className="rounded-full border border-[#65aa1d] bg-[#102500] px-3 py-1 text-xl font-bold text-[#9adc42]">25.35 BDT ✓</span>}</div>
  </div>;
}
