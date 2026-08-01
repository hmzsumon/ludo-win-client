import Logo from "@/components/branding/logo";
import Icon from "@/components/ludo/icon";
import SelectTokenColor from "@/components/ludo/selectTokenColor";
import PageWrapper from "@/components/wrapper/page";
import type { TColors, TTotalPlayers } from "@/interfaces";

interface TotalPlayersProps {
  playAsGuest: boolean;
  handlePlayWithFriends: () => void;
  handleTotalPlayers: (total: TTotalPlayers) => void;
  playWithFriendsEnabled: boolean;
  selectedColor: TColors;
  handleColor: (color: TColors) => void;
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
  playWithFriendsEnabled,
  selectedColor,
  handleColor,
}: TotalPlayersProps) => {
  return (
    <PageWrapper>
      <Logo />

      {/* NEW ▸ Quick online colour preference; server prevents duplicates. */}
      <div className="page-total-players-section">
        <h2>Choose Token Color</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SelectTokenColor
            disabled={false}
            color={selectedColor}
            handleColor={handleColor}
          />
        </div>
      </div>

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
      {!playAsGuest && playWithFriendsEnabled && (
        <div className="page-total-players-section">
          <h2>OR</h2>
          <button
            type="button"
            className="button yellow page-total-players-friends"
            onClick={handlePlayWithFriends}
            title="Create or join a Free/Wager friend room"
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
