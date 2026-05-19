import Avatar from "@/components/ludo/avatar";

interface PlayerProfileProps {
  avatar?: string;
  photo?: string;
  name: string;
}

const PlayerProfile = ({
  avatar = "",
  photo = "",
  name = "",
}: PlayerProfileProps) => {
  const searching = !name;

  return (
    <div className="mm-player-card">
      <div className="mm-banner">
        <div className="mm-avatar-circle">
          {searching ? (
            <div className="mm-search-state">
              <div className="mm-question-avatar">?</div>

              <div className="mm-search-spinner" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : (
            <Avatar
              avatar={avatar}
              photo={photo}
              name={name}
              size={68}
              className="mm-banner-avatar"
            />
          )}
        </div>

        <div className="mm-player-name">{searching ? "Matching" : name}</div>
      </div>
    </div>
  );
};

export default PlayerProfile;
