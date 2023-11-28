import { DiscordCommand, DiscordMessage, DiscordMessages } from '@skyra/discord-components-react';
import { type PropsWithChildren } from 'react';
import './command.css';

export type CommandProps = PropsWithChildren<{
  /**
   * Optional arguments for the command
   */
  readonly args?: { description: string; name: string }[];
  /**
   * the description of the command
   */
  readonly description: string;
  /**
   * if the command is "featured"
   */
  readonly featured?: boolean;

  /**
   * use 1i8n white-line: pre-space whatever shit
   */
  readonly i18n?: boolean;
  /**
   * the name of the command without the leading slash
   */
  readonly name: string;
}>;

export default function Command({
  name,
  description,
  featured = false,
  args = [],
  i18n = true,
  children,
}: CommandProps) {
  return (
    <section>
      <div id={name} className={`section-title ${featured ? 'featured' : ''}`}>
        <h2 className={`section-title ${featured ? 'featured' : ''}`}>/{name}</h2>
        {featured ? '(✨ featured)' : ''}
      </div>
      <div className={`content ${i18n ? 'i18n-newline' : ''}`}>
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
          ''
        )}
        <DiscordMessages className="content" no-background style={{ border: 'none' }}>
          <DiscordMessage profile="thoth">
            <DiscordCommand slot="reply" profile="fyko" command={`/${name}`} />
            {children}
          </DiscordMessage>
        </DiscordMessages>
      </div>
    </section>
  );
}
