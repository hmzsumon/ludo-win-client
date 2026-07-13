import Logo from "@/components/branding/logo";
import Icon from "@/components/ludo/icon";
import PageWrapper from "@/components/wrapper/page";
import type { TTotalPlayers } from "@/interfaces";

interface TotalPlayersProps {
  playAsGuest: boolean;
  handlePlayWithFriends: () => void;
  handleTotalPlayers: (total: TTotalPlayers) => void;
}

/* ────────── player distribution list ────────── */
const DISTRIBUTION_PLAYERS: {
  total: TTotalPlayers;
  label: string;
  disabled?: boolean;
}[] = [
  {
    total: 2,
    label: "Two Players",
  },
  {
    total: 4,
    label: "Four Players",
    disabled: true,
  },
];

const TotalPlayers = ({
  playAsGuest = false,
  handlePlayWithFriends,
  handleTotalPlayers,
}: TotalPlayersProps) => {
  return (
    <PageWrapper>
      <Logo />

      {/* ────────── total players buttons ────────── */}
      <div className="page-total-players-section">
        <h2>Number of players</h2>

        {DISTRIBUTION_PLAYERS.map(({ total, label, disabled = false }) => {
          return (
            <button
              key={total}
              type="button"
              disabled={disabled}
              aria-disabled={disabled}
              className="button blue page-total-players-button"
              onClick={() => {
                if (disabled) return;
                handleTotalPlayers(total);
              }}
              style={
                disabled
                  ? {
                      opacity: 0.5,
                      cursor: "not-allowed",
                      pointerEvents: "none",
                    }
                  : undefined
              }
            >
              <span>{total}</span>
              {label}
            </button>
          );
        })}
      </div>

      {/* ────────── play with friends section ────────── */}
      {!playAsGuest && (
        <div className="page-total-players-section">
          <h2>OR</h2>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="button yellow page-total-players-friends"
            title="This feature is temporarily unavailable"
            style={{
              opacity: 0.8,
              cursor: "not-allowed",
              pointerEvents: "none",
              filter: "grayscale(0.7)",
            }}
          >
            <Icon type="play" fill="#8b5f00" />
            <span>Play with Friends</span>
          </button>
        </div>
      )}
    </PageWrapper>
  );
};

export default TotalPlayers;
