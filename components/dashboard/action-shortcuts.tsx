const actions = [
  { label: "Refer & Earn", icon: "👨‍👩‍👧" },
  { label: "LeaderBoard", icon: "👑" },
  { label: "Deposit", icon: "👛" },
  { label: "Invite Friends", icon: "🎁" },
];

const ActionShortcuts = () => {
  return (
    <section className="grid grid-cols-4 divide-x divide-white/10 overflow-hidden rounded-[28px] bg-[rgba(10,20,64,0.92)] shadow-[0_12px_28px_rgba(0,0,0,0.34)] ring-1 ring-white/10">
      {/* ────────── Shortcut Items ────────── */}
      {actions.map((item) => (
        <button
          key={item.label}
          className="flex min-h-[118px] flex-col items-center justify-center px-2 py-4 text-center"
        >
          <span className="text-[42px]">{item.icon}</span>
          <span className="mt-2 text-[14px] font-extrabold tracking-tight text-white">
            {item.label}
          </span>
        </button>
      ))}
    </section>
  );
};

export default ActionShortcuts;
