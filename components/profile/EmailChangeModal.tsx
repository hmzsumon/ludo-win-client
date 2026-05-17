"use client";

// ✅ EmailChangeModal.tsx
// Screenshot ৩ এর মতো হুবহু – "Attention" popup
// Email change করতে customer support contact করতে বলে

interface EmailChangeModalProps {
  open: boolean;
  onClose: () => void;
  // Customer support page এ navigate করার callback
  onContactSupport: () => void;
}

export default function EmailChangeModal({
  open,
  onClose,
  onContactSupport,
}: EmailChangeModalProps) {
  if (!open) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* ── Modal ── */}
      <div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[340px] rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.97)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Content */}
        <div className="px-6 pt-6 pb-2 text-center">
          <h3 className="text-[18px] font-bold text-gray-900 mb-2">
            Attention
          </h3>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            To change your email address, please contact our support team
          </p>
        </div>

        {/* Buttons */}
        <div className="p-4 flex flex-col gap-2">
          <button
            onClick={() => {
              onClose();
              onContactSupport();
            }}
            className="w-full py-3 rounded-xl text-[14px] font-semibold text-[#0173e5] bg-[#0173e5]/10 hover:bg-[#0173e5]/20 active:scale-[0.98] transition-all"
          >
            Customer support
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-[14px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
