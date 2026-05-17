import PageWrapper from "@/components/wrapper/page";
import { TypeIcon } from "../../icon";
import Logo from "../../logo";

export interface ISocialNetworks {
  title: string;
  icon: TypeIcon;
  link: string;
}

const SOCIAL_NETWORKS: ISocialNetworks[] = [
  {
    title: "Twitter",
    icon: "twitter",
    link: "https://twitter.com/ostjh",
  },
  {
    title: "Github",
    icon: "github",
    link: "https://github.com/Jorger",
  },
  {
    title: "Linkedin",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/jorge-rubiano-a8616319",
  },
  {
    title: "Dev.to",
    icon: "devto",
    link: "https://dev.to/jorger",
  },
  {
    title: "bio.link",
    icon: "games",
    link: "https://bio.link/jorgerub",
  },
];

const AboutPage = () => (
  <PageWrapper>
    <div className="about-game-body">
      <Logo />
      <p>
        The origins of{" "}
        <a
          title="Ludo"
          href="https://en.wikipedia.org/wiki/Ludo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Ludo
        </a>{" "}
        can be traced back to ancient India, where it was known as "Pachisi."
        Initially played by royalty, it soon became popular among people from
        all walks of life. As it spread to other regions, including England and
        the United States, it underwent various transformations and adaptations,
        eventually evolving into the beloved game we know today as Ludo.
      </p>
      <p>
        Ludo React is a game developed by{" "}
        <span className="font-bold">Orbit Play</span> using{" "}
        <a
          title="ReactJS"
          href="https://reactjs.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NextJS
        </a>{" "}
        and{" "}
        <a
          title="TypeScript"
          href="https://www.typescriptlang.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          TypeScript
        </a>
        , this digital adaptation stays true to the essence of the original game
        while offering a fresh and engaging experience for modern players.
      </p>
    </div>
  </PageWrapper>
);

export default AboutPage;
