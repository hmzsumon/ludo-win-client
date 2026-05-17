import Avatar from "@/components/ludo/avatar";

interface PlayerProfileProps {
  photo?: string;
  name: string;
}

const PlayerProfile = ({ photo = "", name = "" }: PlayerProfileProps) => {
  const searching = !name;

  return (
    <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
      {/* ── Avatar box ── */}
      <div className="relative w-16 h-16">
        {searching ? (
          /* Searching placeholder */
          <div className="mm-search-box">
            <div className="mm-search-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="2"
                />
                <path
                  d="M16.5 16.5L21 21"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* 3 bounce dots */}
            <div className="mm-pulse-dots">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : (
          /* Found player */
          <div className="relative w-16 h-16">
            <Avatar
              photo={photo}
              name={name}
              size={64}
              className="mm-avatar-img"
            />
            {/* green glow ring */}
            <div className="mm-found-ring" />
          </div>
        )}
      </div>

      {/* ── Name label ── */}
      <span
        className="
        text-sm font-bold text-white text-center
        w-[90px] truncate block
        drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]
      "
      >
        {searching ? (
          <span className="text-white/60 font-medium text-[12px] inline-flex items-baseline gap-px">
            Searching
            <span className="inline-flex gap-px ml-0.5">
              <span className="mm-dot-fade">.</span>
              <span className="mm-dot-fade">.</span>
              <span className="mm-dot-fade">.</span>
            </span>
          </span>
        ) : (
          name
        )}
      </span>
    </div>
  );
};

export default PlayerProfile;
