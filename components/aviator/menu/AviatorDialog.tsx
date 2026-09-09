"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

// Native modal provides focus trapping, Escape handling and background isolation.
export default function AviatorDialog({ title, drawer, amber, onClose, children }: {
  title: string; drawer?: boolean; amber?: boolean; onClose: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  return (
    <motion.dialog ref={ref} aria-label={title} onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.2 }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-y-auto overscroll-contain border-0 bg-black/65 p-2 pt-12 text-[#eee] backdrop:bg-transparent">
      <motion.section initial={drawer ? { x: "-110%" } : { y: -12, opacity: 0 }} animate={{ x: 0, y: 0, opacity: 1 }}
        exit={drawer ? { x: "-110%" } : { y: -12, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={`${drawer ? "mr-auto w-[min(90vw,360px)]" : "mx-auto w-full max-w-lg"} overflow-clip rounded-[10px] shadow-2xl ${amber ? "bg-[#f8a71b] text-[#64400d]" : "bg-[#1b1b1b]"}`}>
        <header className={`sticky top-0 z-10 flex min-h-11 items-center justify-between gap-2 px-3 ${amber ? "bg-[#e89500]" : "bg-[#2b2c30]"}`}>
          <h2 className="text-base font-medium uppercase">{title}</h2>
          <button type="button" autoFocus aria-label={`Close ${title}`} onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-[#8a9298] hover:bg-black/15"><X size={24} /></button>
        </header>
        {children}
      </motion.section>
    </motion.dialog>
  );
}
