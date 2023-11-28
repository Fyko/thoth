import {
  DiscordCommand,
  DiscordCustomEmoji,
  DiscordMessage,
  DiscordMessages,
  DiscordQuote,
} from '@skyra/discord-components-react';

export default function InnerDefinition() {
  return (
    <DiscordMessages
      className="content"
      style={{
        border: 'none',
        borderRadius: '15px',
        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }}
    >
      <DiscordMessage profile="thoth">
        <DiscordCommand slot="reply" profile="fyko" command={`/definition`} />
        <DiscordCustomEmoji name="merriamWebster" /> <a>ostentatious</a> (adjective) • (os•ten•ta•tious) • (
        <a>ˌä-stən-ˈtā-shəs</a>)<p>Stems: ostentatious, ostentatiously, ostentatiousness, ostentatiousnesses</p>
        <br />
        <u>Definitions</u>
        <br />
        <br />
        <b>:</b> attracting or seeking to attract attention, admiration, or envy often by gaudiness or obviousness{' '}
        <b>:</b>
        overly elaborate or conspicuous <b>:</b>
        characterized by, fond of, or evincing <a>ostentation</a>
        <DiscordQuote>
          <p>
            "an <i>ostentatious</i> display of wealth/knowledge"
          </p>
        </DiscordQuote>
      </DiscordMessage>
    </DiscordMessages>
  );
}
