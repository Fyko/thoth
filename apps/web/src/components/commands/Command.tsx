import "./command.css";
import {
  DiscordCommand,
  DiscordMessage,
  DiscordMessages,
} from "@skyra/discord-components-react";

export type CommandProps = {
  /**
   * Optional arguments for the command
   */
  readonly args?: { description: string; name: string }[];
  /**
   * Inner content
   */
  readonly children?: React.ReactNode;
  /**
   * the description of the command
   */
  readonly description: string;
  /**
   * if the command is "featured"
   */
  readonly featured?: boolean;

  /**
   * the name of the command without the leading slash
   */
  readonly name: string;
};

export const Command = ({
  name,
  description,
  featured = false,
  args = [],
  children,
}: CommandProps) => {
  function setDiscordTheme(dark: boolean) {
    for (const discordMessages of document.querySelectorAll(
      "discord-messages",
    )) {
      discordMessages.setAttribute("light-theme", (!dark).toString());
    }
  }

  if (typeof document !== "undefined") {
    const initialIsDark =
      document.documentElement.classList.contains("theme-dark");

    setDiscordTheme(initialIsDark);

    document.addEventListener("themeSet", (event) =>
      // @ts-expect-error this is a custom event
      setDiscordTheme(event.detail.dark),
    );
  }

  return (
    <section id={name}>
      <div className={`section-title ${featured ? "featured" : ""}`}>
        <h2 className={`section-title ${featured ? "featured" : ""}`}>
          /{name}
        </h2>
        {featured ? "(✨ featured)" : ""}
      </div>
      <div className="content">
        <p>{description}</p>
        {args?.length ? (
          <div className="arguments">
            <h4>Arguments</h4>
            <ul>
              {args.map((arg) => (
                <li>
                  <code>{arg.name}</code> - {arg.description}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          ""
        )}
        <DiscordMessages className="content" no-background>
          <DiscordMessage profile="thoth">
            <DiscordCommand slot="reply" profile="fyko" command={`/${name}`} />
            {children}
          </DiscordMessage>
        </DiscordMessages>
      </div>
    </section>
  );
};
