"use client";

import Image from "next/image";

type WinnerPlayer = {
  id: string;
  name: string;
  avatar?: string;
  rank: 1 | 2;
  coin?: number;
  trophy?: number;
  trophyChange?: number;
};

interface WinResultModalProps {
  open: boolean;
  players: WinnerPlayer[];
  onClose: () => void;
  onHelp?: () => void;
}

const formatCoin = (value?: number) => {
  if (!value) return "0";
  if (value >= 1000)
    return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return value.toString();
};

export default function WinResultModal({
  open,
  players,
  onClose,
  onHelp,
}: WinResultModalProps) {
  if (!open) return null;

  const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);

  return (
    <div className="lw-result-overlay">
      <div className="lw-result-modal">
        <button
          type="button"
          className="lw-result-help"
          onClick={onHelp}
          aria-label="Help"
        >
          ?
        </button>

        <button
          type="button"
          className="lw-result-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="lw-result-header">
          <div className="lw-result-wings lw-left-wing" />
          <div className="lw-result-crown">
            <div className="lw-crown-emoji">👑</div>
          </div>
          <div className="lw-result-wings lw-right-wing" />

          <div className="lw-result-ribbon">
            <span>You Win</span>
          </div>
        </div>

        <div className="lw-result-list">
          {sortedPlayers.map((player) => {
            const isWinner = player.rank === 1;

            return (
              <div
                key={player.id}
                className={`lw-result-row ${
                  isWinner ? "lw-result-row-winner" : "lw-result-row-second"
                }`}
              >
                <div className="lw-rank-badge">
                  <span className="lw-rank-crown">{isWinner ? "👑" : "♛"}</span>
                  <span>{player.rank}</span>
                </div>

                <div className="lw-avatar-wrap">
                  {player.avatar ? (
                    <Image
                      src={player.avatar}
                      alt={player.name}
                      width={50}
                      height={50}
                      className="lw-avatar-img"
                      unoptimized
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="lw-avatar-fallback">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="lw-player-info">
                  <p className="lw-player-name">{player.name}</p>

                  <div className="lw-reward-line">
                    {isWinner ? (
                      <>
                        <span className="lw-chip lw-coin-chip">
                          🪙 {formatCoin(player.coin)}
                        </span>
                        <span className="lw-chip lw-trophy-chip">
                          🏆 {player.trophy ?? 0}
                        </span>
                      </>
                    ) : (
                      <span className="lw-chip lw-loss-chip">
                        🏆 {player.trophyChange ?? -1}
                      </span>
                    )}
                  </div>
                </div>

                {!isWinner && (
                  <div className="lw-second-actions">
                    <span>👥</span>
                    <span>👍</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
