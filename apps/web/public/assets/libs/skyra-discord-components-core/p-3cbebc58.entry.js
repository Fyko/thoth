import { r as e, h as i, H as o, g as r } from './p-78dab8b1.js';
import { p as s, a as d, d as t, b as c, c as a, e as n } from './p-a7299a05.js';

const l = '.discord-action-row{display:flex;flex-wrap:nowrap}';
const m = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i(o, { class: 'discord-action-row' }, i('slot', null));
  }
};
m.style = l;
const h = (e) => {
  const [i, o, r] = e.split('/');
  return `${i.padStart(2, '0')}/${o.padStart(2, '0')}/${r}`;
};

const g = (e) => {
  if (!(e instanceof Date)) return e;
  return h(`${e.getMonth() + 1}/${e.getDate()}/${e.getFullYear()}`);
};

const p = (e, i = false) => {
  if (!(e instanceof Date)) return e;
  if (i) return `${e.getHours()}:${e.getMinutes().toString().padStart(2, '0')}`;
  const o = e.getHours() % 12 || 12;
  const r = e.getHours() < 12 ? 'AM' : 'PM';
  return `${o}:${e.getMinutes().toString().padStart(2, '0')} ${r}`;
};

const f = (e, i = false, o = false) => {
  if (!(e instanceof Date) && typeof e !== 'string') {
    throw new TypeError('Timestamp prop must be a Date object or a string.');
  }

  return i ? p(e, o) : g(e);
};

const u = /\.(bmp|jpe?g|png|gif|webp|tiff)$/i;
const b = (e) => {
  if (!u.test(e)) throw new Error(`The url of an image for discord-attachment should match the regex ${u}`);
};

const x = (e) => {
  let i;
  let o;
  return (o = (i = window.$discordMessage) === null || i === void 0 ? void 0 : i.emojis) === null || o === void 0
    ? void 0
    : o[e];
};

const v =
  '.discord-attachment{color:#dcddde;display:flex;font-size:13px;line-height:150%;margin-bottom:8px;margin-top:8px}.discord-attachment .discord-image-wrapper{display:block;position:relative;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;overflow:hidden;border-radius:3px}';
const w = class {
  constructor(i) {
    e(this, i);
    this.url = undefined;
    this.height = undefined;
    this.width = undefined;
    this.alt = 'discord attachment';
  }

  componentWillRender() {
    b(this.url);
  }

  render() {
    return i(
      o,
      { class: 'discord-attachment' },
      i(
        'div',
        { class: 'discord-image-wrapper', style: { height: `${this.height}px`, width: `${this.width}px` } },
        i('img', { alt: this.alt, src: this.url, height: this.height, width: this.width }),
      ),
    );
  }

  get el() {
    return r(this);
  }
};
w.style = v;
const y =
  '.discord-message .discord-attachments{display:grid;grid-auto-flow:row;grid-row-gap:0.25rem;text-indent:0;min-height:0;min-width:0;padding-top:0.125rem;padding-bottom:0.125rem;position:relative}.discord-message .discord-attachments>*{justify-self:start;-ms-flex-item-align:start;align-self:start}';
const C = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i(o, { class: 'discord-attachments' }, i('slot', null));
  }
};
C.style = y;
const k = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i('strong', null, i('slot', null));
  }
};
function L(e, i) {
  return [...i];
}

function j(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '16', height: '16', viewBox: '0 0 24 24' },
    i('path', {
      fill: 'currentColor',
      d: 'M10 5V3H5.375C4.06519 3 3 4.06519 3 5.375V18.625C3 19.936 4.06519 21 5.375 21H18.625C19.936 21 21 19.936 21 18.625V14H19V19H5V5H10Z',
    }),
    i('path', {
      fill: 'currentColor',
      d: 'M21 2.99902H14V4.99902H17.586L9.29297 13.292L10.707 14.706L19 6.41302V9.99902H21V2.99902Z',
    }),
  );
}

const H =
  '.discord-button{display:flex;justify-content:center;align-items:center;cursor:pointer;margin:4px 8px 4px 0;padding:2px 16px;width:auto;height:32px;min-width:60px;min-height:32px;-webkit-transition:background-color 0.17s ease, color 0.17s ease;transition:background-color 0.17s ease, color 0.17s ease;border-radius:3px;font-size:14px;font-weight:500;line-height:16px;text-decoration:none !important}.discord-button.discord-button-success{color:#fff;background-color:#3ba55d}.discord-button.discord-button-success.discord-button-hoverable:hover{background-color:#2d7d46}.discord-button.discord-button-destructive{color:#fff;background-color:#ed4245}.discord-button.discord-button-destructive.discord-button-hoverable:hover{background-color:#c03537}.discord-button.discord-button-primary{color:#fff;background-color:#5865f2}.discord-button.discord-button-primary.discord-button-hoverable:hover{background-color:#4752c4}.discord-button.discord-button-secondary{color:#fff;background-color:#4f545c}.discord-button.discord-button-secondary.discord-button-hoverable:hover{background-color:#5d6269}.discord-button.discord-button-disabled{cursor:not-allowed;opacity:0.5}.discord-button .discord-button-launch{margin-left:8px}.discord-button .discord-button-emoji{margin-right:4px;object-fit:contain;width:1.375em;height:1.375em;vertical-align:bottom}';
const z = class {
  constructor(i) {
    e(this, i);
    this.emoji = undefined;
    this.emojiName = 'emoji';
    this.url = undefined;
    this.disabled = false;
    this.type = 'secondary';
  }

  handleType(e) {
    if (typeof e !== 'string') {
      throw new TypeError('DiscordButton `type` prop must be a string.');
    } else if (!['primary', 'secondary', 'success', 'destructive'].includes(e)) {
      throw new RangeError(
        "DiscordButton `type` prop must be one of: 'primary', 'secondary', 'success', 'destructive'",
      );
    }
  }

  render() {
    const e = this.el.parentElement;
    if (e.tagName.toLowerCase() !== 'discord-action-row') {
      throw new Error('All <discord-button> components must be direct children of <discord-action-row>.');
    }

    const r = i(
      L,
      null,
      this.emoji && i('img', { src: this.emoji, alt: this.emojiName, draggable: false, class: 'discord-button-emoji' }),
      i('span', null, i('slot', null)),
      this.url && i(j, { class: 'discord-button-launch' }),
    );
    return this.url && !this.disabled
      ? i(
          'a',
          {
            class: 'discord-button discord-button-secondary',
            href: this.url,
            target: '_blank',
            rel: 'noopener noreferrer',
          },
          r,
        )
      : i(
          o,
          {
            class: `discord-button discord-button-${this.type} discord-button-${
              this.disabled ? 'disabled' : 'hoverable'
            }`,
          },
          r,
        );
  }

  get el() {
    return r(this);
  }

  static get watchers() {
    return { type: ['handleType'] };
  }
};
z.style = H;
function M(e) {
  return i(
    'svg',
    { ...e, width: '6', height: '10', viewBox: '0 0 6 10', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
    i('path', { d: 'M4.61241 0L6 0.845294L1.38759 10L0 9.15471L4.61241 0Z', fill: 'currentColor' }),
  );
}

const V =
  ".discord-replied-message.discord-executed-command .discord-command-name{color:#00aff4;font-weight:500}.discord-replied-message.discord-executed-command .discord-command-name:hover{color:#00aff4;text-decoration:underline}.discord-replied-message.discord-executed-command .discord-replied-message-username{margin-right:0}.discord-replied-message{color:#b9bbbe;display:flex;font-size:0.875rem;font-family:Whitney, 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n\t\tsans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';padding-top:2px;margin-left:56px;margin-bottom:4px;align-items:center;line-height:1.125rem;position:relative;white-space:pre;user-select:none}.discord-light-theme .discord-replied-message{color:#4f5660}.discord-compact-mode .discord-replied-message{margin-left:62px;margin-bottom:0}.discord-replied-message:before{content:'';display:block;position:absolute;top:50%;right:100%;bottom:0;left:-36px;margin-right:4px;margin-top:-1px;margin-left:-1px;margin-bottom:-2px;border-left:2px solid #4f545c;border-bottom:0 solid #4f545c;border-right:0 solid #4f545c;border-top:2px solid #4f545c;border-top-left-radius:6px}.discord-light-theme .discord-replied-message:before{border-color:#747f8d}.discord-replied-message .discord-replied-message-avatar,.discord-replied-message .discord-reply-badge{-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;width:16px;height:16px;border-radius:50%;user-select:none;margin-right:0.25rem}.discord-replied-message .discord-reply-badge{display:flex;align-items:center;justify-content:center;color:#b9bbbe;background:#202225}.discord-light-theme .discord-replied-message .discord-reply-badge{color:#4f5660;background:#e3e5e8}.discord-replied-message .discord-application-tag{background-color:hsl(235, 85.6%, 64.7%);color:#fff;font-size:0.625rem;margin-right:0.25rem;line-height:100%;text-transform:uppercase;display:flex;align-items:center;height:0.9375rem;padding:0 0.275rem;margin-top:0.075em;border-radius:0.1875rem}.discord-replied-message .discord-application-tag .discord-application-tag-verified{width:0.9375rem;height:0.9375rem;margin-left:-0.1rem}.discord-replied-message .discord-application-tag.discord-application-tag-op{background-color:#c9cdfb;color:#4752c4;border-radius:0.4rem}.discord-replied-message .discord-replied-message-username{flex-shrink:0;font-size:inherit;line-height:inherit;margin-right:0.25rem;opacity:0.64;font-weight:500;color:#fff}.discord-replied-message .discord-replied-message-content{color:inherit;font-size:inherit;line-height:inherit;white-space:pre;text-overflow:ellipsis;user-select:none;cursor:pointer}.discord-replied-message .discord-replied-message-content:hover{color:#fff}.discord-light-theme .discord-replied-message .discord-replied-message-content:hover{color:#000}.discord-replied-message .discord-replied-message-content .discord-message-edited{margin-left:0.25rem}.discord-replied-message .discord-replied-message-content-icon{-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;width:20px;height:20px;margin-left:4px}.discord-message .discord-author-info{display:inline-flex;align-items:center;font-size:16px;margin-right:0.25rem}.discord-compact-mode .discord-message .discord-author-info{margin-right:0}.discord-message .discord-author-info .discord-author-username{color:#fff;font-size:1em;font-weight:500}.discord-light-theme .discord-message .discord-author-info .discord-author-username{color:#23262a}.discord-message .discord-author-info .discord-application-tag{background-color:#5865f2;color:#fff;font-size:0.625em;margin-left:4px;border-radius:3px;line-height:100%;text-transform:uppercase;display:flex;align-items:center;height:0.9375rem;padding:0 0.275rem;margin-top:0.075em;border-radius:0.1875rem}.discord-message .discord-author-info .discord-application-tag.discord-application-tag-op{background-color:#c9cdfb;color:#4752c4;border-radius:0.4rem}.discord-message .discord-author-info .discord-application-tag-verified{display:inline-block;width:0.9375rem;height:0.9375rem;margin-left:-0.25rem}.discord-message .discord-author-info .discord-author-role-icon{margin-left:0.25rem;vertical-align:top;height:calc(1rem + 4px);width:calc(1rem + 4px)}.discord-compact-mode .discord-message .discord-author-info .discord-author-username{margin-left:8px;margin-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag{margin-left:0;margin-left:5px;margin-right:5px;padding-left:10px;padding-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag-verified{margin-right:0.7em;margin-left:-0.7em}";
const S = class {
  constructor(i) {
    e(this, i);
    this.profile = undefined;
    this.author = 'User';
    this.avatar = undefined;
    this.roleColor = undefined;
    this.command = undefined;
  }

  render() {
    let e;
    let r;
    let t;
    const c = this.el.parentElement;
    if (c.tagName.toLowerCase() !== 'discord-message') {
      throw new Error('All <discord-command> components must be direct children of <discord-message>.');
    }

    const a = (e) => {
      let i;
      let o;
      return (o = (i = d[e]) !== null && i !== void 0 ? i : e) !== null && o !== void 0 ? o : d.default;
    };

    const n = { author: this.author, bot: false, verified: false, server: false, roleColor: this.roleColor };
    const l = (e = Reflect.get(s, this.profile)) !== null && e !== void 0 ? e : {};
    const m = { ...n, ...l, avatar: a((r = l.avatar) !== null && r !== void 0 ? r : this.avatar) };
    const h = c.parentElement;
    return i(
      o,
      { class: 'discord-replied-message discord-executed-command' },
      h.compactMode
        ? i('div', { class: 'discord-reply-badge' }, i(M, null))
        : i('img', { class: 'discord-replied-message-avatar', src: m.avatar, alt: m.author }),
      i(
        'span',
        {
          class: 'discord-replied-message-username',
          style: { color: (t = m.roleColor) !== null && t !== void 0 ? t : '' },
        },
        m.author,
      ),
      ' used ',
      i('div', { class: 'discord-replied-message-content discord-command-name' }, this.command),
    );
  }

  get el() {
    return r(this);
  }
};
S.style = V;
const _ =
  '.discord-custom-emoji{display:inline-block;cursor:pointer}.discord-custom-emoji .discord-custom-emoji-image{object-fit:contain;width:1.375rem;height:1.375rem;vertical-align:bottom}.discord-embed-custom-emoji{display:inline-block}.discord-embed-custom-emoji .discord-embed-custom-emoji-image{width:18px;height:18px;vertical-align:bottom}';
const B = class {
  constructor(i) {
    e(this, i);
    this.name = undefined;
    this.url = undefined;
    this.embedEmoji = undefined;
  }

  componentWillRender() {
    let e;
    let i;
    let o;
    let r;
    if (!this.url && Boolean(this.name)) {
      const s = x(this.name);
      if (s) {
        (e = this.url) !== null && e !== void 0 ? e : (this.url = (i = s.url) !== null && i !== void 0 ? i : '');
        (o = this.embedEmoji) !== null && o !== void 0
          ? o
          : (this.embedEmoji = (r = s.embedEmoji) !== null && r !== void 0 ? r : false);
      }
    }
  }

  render() {
    const e = `:${this.name}:`;
    const o = this.embedEmoji ? 'discord-embed-custom-emoji' : 'discord-custom-emoji';
    const r = this.embedEmoji ? 'discord-embed-custom-emoji-image' : 'discord-custom-emoji-image';
    return i('span', { class: o }, i('img', { 'aria-label': e, src: this.url, alt: e, draggable: false, class: r }));
  }

  get el() {
    return r(this);
  }
};
B.style = _;
function O(e) {
  let i;
  let o;
  let r = '';
  if (typeof e === 'string' || typeof e === 'number') r += e;
  else if (typeof e === 'object')
    if (Array.isArray(e)) for (i = 0; i < e.length; i++) e[i] && (o = O(e[i])) && (r && (r += ' '), (r += o));
    else for (i in e) e[i] && (r && (r += ' '), (r += i));
  return r;
}

function Z() {
  for (var e, i, o = 0, r = ''; o < arguments.length; )
    (e = arguments[o++]) && (i = O(e)) && (r && (r += ' '), (r += i));
  return r;
}

const E =
  '.discord-embed{color:#dcddde;display:flex;font-size:13px;line-height:150%;margin-bottom:8px;margin-top:8px}.discord-light-theme .discord-embed{color:#2e3338}.discord-embed .discord-left-border{background-color:#202225;border-radius:4px 0 0 4px;flex-shrink:0;width:4px}.discord-light-theme .discord-embed .discord-left-border{background-color:#e3e5e8}.discord-embed .discord-embed-root{display:grid;grid-auto-flow:row;grid-row-gap:0.25rem;min-height:0;min-width:0;text-indent:0}.discord-embed .discord-embed-wrapper{background-color:#2f3136;max-width:520px;border:1px solid rgba(46, 48, 54, 0.6);border-radius:0 4px 4px 0;justify-self:start;align-self:start;display:grid;box-sizing:border-box}.discord-light-theme .discord-embed .discord-embed-wrapper{background-color:rgba(249, 249, 249, 0.3);border-color:rgba(205, 205, 205, 0.3)}.discord-embed .discord-embed-wrapper .discord-embed-grid{display:inline-grid;grid-template-columns:auto -webkit-min-content;grid-template-columns:auto min-content;grid-template-columns:auto;grid-template-rows:auto;padding:0.5rem 1rem 1rem 0.75rem}.discord-embed .discord-embed-thumbnail{border-radius:4px;flex-shrink:0;grid-column:2/2;grid-row:1/8;justify-self:end;margin-left:16px;margin-top:8px;max-height:80px;max-width:80px;object-fit:contain;object-position:top center}.discord-embed .discord-embed-author{-webkit-box-align:center;align-items:center;color:#fff;font-size:14px;display:flex;font-weight:600;grid-column:1 / 1;margin-top:8px;min-width:0}.discord-light-theme .discord-embed .discord-embed-author{color:#4f545c}.discord-embed .discord-embed-author a{color:#fff;font-weight:600}.discord-light-theme .discord-embed .discord-embed-author a{color:#4f545c}.discord-embed .discord-embed-author .discord-author-image{border-radius:50%;height:24px;margin-right:8px;width:24px}.discord-embed .discord-embed-provider{font-size:0.75rem;line-height:1rem;font-weight:400;grid-column:1/1;margin-top:8px;unicode-bidi:plaintext;text-align:left}.discord-light-theme .discord-embed .discord-embed-provider{color:#4f545c}.discord-embed .discord-embed-title{-webkit-box-align:center;align-items:center;color:#fff;display:inline-block;font-size:1rem;font-weight:600;grid-column:1 / 1;margin-top:8px;min-width:0}.discord-embed .discord-embed-title a{color:#00aff4;font-weight:600}.discord-embed .discord-embed-image{border-radius:4px;max-width:100%}.discord-embed .discord-embed-media{border-radius:4px;contain:paint;display:block;grid-column:1/1;margin-top:16px}.discord-embed .discord-embed-media.discord-embed-media-video{height:225px}.discord-embed .discord-embed.media .discord-embed-image{overflow:hidden;position:relative;user-select:text}.discord-embed .discord-embed-media .discord-embed-video{-webkit-box-align:center;-webkit-box-pack:center;align-items:center;border-radius:0;cursor:pointer;display:flex;height:100%;justify-content:center;max-height:100%;width:100%;width:400px;height:225px;left:0px;top:0px}.discord-embed-custom-emoji{display:inline-block}.discord-embed-custom-emoji .discord-embed-custom-emoji-image{width:18px;height:18px;vertical-align:bottom}';
const A = class {
  constructor(i) {
    e(this, i);
    this.hasPerformedRerenderChecks = 'pristine';
    this.color = undefined;
    this.authorName = undefined;
    this.authorImage = undefined;
    this.authorUrl = undefined;
    this.embedTitle = undefined;
    this.url = undefined;
    this.thumbnail = undefined;
    this.image = undefined;
    this.video = undefined;
    this.provider = undefined;
    this.hasProvidedDescriptionSlot = true;
  }

  componentDidRender() {
    if (this.hasPerformedRerenderChecks === 'pristine') {
      try {
        const e = this.el.querySelector('.discord-embed-description');
        this.hasProvidedDescriptionSlot = Boolean(e === null || e === void 0 ? void 0 : e.innerHTML.trim());
      } finally {
        this.hasPerformedRerenderChecks = 'dirty';
      }
    }
  }

  render() {
    const e = this.parseTitle(this.authorName);
    const o = this.parseTitle(this.embedTitle);
    return i(
      'div',
      { class: 'discord-embed' },
      i('div', { style: { 'background-color': this.color }, class: 'discord-left-border' }),
      i(
        'div',
        { class: 'discord-embed-root' },
        i(
          'div',
          { class: 'discord-embed-wrapper' },
          i(
            'div',
            { class: 'discord-embed-grid' },
            this.provider && i('div', { class: 'discord-embed-provider' }, i(L, null, this.provider)),
            e &&
              i(
                'div',
                { class: 'discord-embed-author' },
                this.authorImage ? i('img', { src: this.authorImage, alt: '', class: 'discord-author-image' }) : '',
                this.authorUrl
                  ? i('a', { href: this.authorUrl, target: '_blank', rel: 'noopener noreferrer' }, ...e)
                  : i(L, null, ...e),
              ),
            o &&
              i(
                'div',
                { class: 'discord-embed-title' },
                this.url
                  ? i('a', { href: this.url, target: '_blank', rel: 'noopener noreferrer' }, ...o)
                  : i(L, null, ...o),
              ),
            this.hasProvidedDescriptionSlot && i('slot', { name: 'description' }),
            i('slot', { name: 'fields' }),
            this.image || this.video
              ? i(
                  'div',
                  { class: Z('discord-embed-media', { 'discord-embed-media-video': Boolean(this.video) }) },
                  this.renderMedia(),
                )
              : null,
            this.thumbnail ? i('img', { src: this.thumbnail, alt: '', class: 'discord-embed-thumbnail' }) : '',
            i('slot', { name: 'footer' }),
          ),
        ),
      ),
    );
  }

  renderMedia() {
    if (this.video) {
      return i(
        'video',
        {
          controls: true,
          muted: true,
          preload: 'none',
          poster: this.image,
          src: this.video,
          height: '225',
          width: '400',
          class: 'discord-embed-video',
        },
        i('img', { src: this.image, alt: 'Discord embed media', class: 'discord-embed-image' }),
      );
    } else if (this.image) {
      return i('img', { src: this.image, alt: 'Discord embed media', class: 'discord-embed-image' });
    }

    return null;
  }

  parseTitle(e) {
    if (!e) return null;
    const o = e.split(' ');
    return o.map((e, r) => {
      let s;
      const d = (s = x(e)) !== null && s !== void 0 ? s : {};
      let t = '';
      if (d.name) {
        t = i(
          'span',
          { class: 'discord-embed-custom-emoji' },
          i('img', { src: d.url, alt: d.name, class: 'discord-embed-custom-emoji-image' }),
          i('span', null, ' '),
        );
      } else {
        t = r < o.length - 1 ? `${e} ` : e;
      }

      return t;
    });
  }

  get el() {
    return r(this);
  }
};
A.style = E;
const I =
  ".discord-embed .discord-embed-description{font-size:0.875rem;font-weight:400;grid-column:1/1;line-height:1.125rem;margin-top:8px;min-width:0;white-space:pre-line}.discord-embed .discord-embed-description code{background-color:#202225;padding:2.5px;border-radius:3px}.discord-light-theme .discord-embed-description code{background-color:#e3e5e8}.discord-embed .discord-embed-description code.multiline{display:block;padding:7px;border-radius:4px;white-space:break-spaces}.discord-embed .discord-embed-description pre{margin:0;margin-top:6px}.discord-embed .discord-embed-description img.emoji{width:22px;height:22px}.discord-embed .discord-embed-description blockquote{position:relative;padding:0 8px 0 12px;margin:0}.discord-embed .discord-embed-description blockquote::before{content:'';display:block;position:absolute;left:0;height:100%;width:4px;border-radius:4px;background-color:#4f545c}.discord-light-theme .discord-embed-description blockquote::before{background-color:#c7ccd1}.discord-embed .discord-embed-description .spoiler{background-color:#202225;color:transparent;cursor:pointer}.discord-light-theme .discord-embed .discord-embed-description .spoiler{background-color:#b9bbbe}.discord-embed .discord-embed-description .spoiler:hover{background-color:rgba(32, 34, 37, 0.8)}.discord-light-theme .discord-embed .discord-embed-description .spoiler:hover{background-color:rgba(185, 187, 190, 0.8)}.discord-embed .discord-embed-description .spoiler:active{color:inherit;background-color:hsla(0, 0%, 100%, 0.1)}.discord-light-theme .discord-embed .discord-embed-description .spoiler:active{background-color:rgba(0, 0, 0, 0.1)}";
const $ = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    const e = this.el.parentElement;
    if (e.tagName.toLowerCase() !== 'div') {
      throw new Error('All <discord-embed-description> components must be direct children of <discord-embed>.');
    }

    return i(o, { class: 'discord-embed-description' }, i('slot', null));
  }

  get el() {
    return r(this);
  }
};
$.style = I;
const R =
  '.discord-embed .discord-embed-field{font-size:0.875rem;line-height:1.125rem;min-width:0;font-weight:400;grid-column:1/13}.discord-embed .discord-embed-field .discord-field-title{color:#ffffff;font-weight:600;font-size:0.875rem;line-height:1.125rem;min-width:0;margin-bottom:2px}.discord-embed .discord-embed-field.discord-inline-field{flex-grow:1;flex-basis:auto;min-width:150px}.discord-light-theme .discord-embed .discord-embed-field .discord-field-title{color:#747f8d}.discord-embed-inline-field-3{grid-column:9/13 !important}.discord-embed-inline-field-2{grid-column:5/9 !important}.discord-embed-inline-field-1{grid-column:1/5 !important}';
const T = class {
  constructor(i) {
    e(this, i);
    this.validInlineIndices = new Set([1, 2, 3]);
    this.fieldTitle = undefined;
    this.inline = false;
    this.inlineIndex = 1;
  }

  checkInlineIndex(e) {
    if (!this.validInlineIndices.has(Number(e)))
      throw new RangeError('DiscordEmbedField `inlineIndex` prop must be one of: 1, 2, or 3');
  }

  componentWillRender() {
    this.checkInlineIndex(this.inlineIndex);
  }

  render() {
    const e = this.el.parentElement;
    if (e.tagName.toLowerCase() !== 'discord-embed-fields') {
      throw new SyntaxError('All <discord-embed-field> components must be direct children of <discord-embed-fields>.');
    }

    const r = this.parseTitle(this.fieldTitle);
    return i(
      o,
      {
        class: Z(
          {
            'discord-embed-inline-field': this.inline,
            'discord-embed-inline-field-1': this.inline && this.inlineIndex === 1,
            'discord-embed-inline-field-2': this.inline && this.inlineIndex === 2,
            'discord-embed-inline-field-3': this.inline && this.inlineIndex === 3,
          },
          'discord-embed-field',
        ),
      },
      r && i('div', { class: 'discord-field-title' }, [...r]),
      i('slot', null),
    );
  }

  parseTitle(e) {
    if (!e) return null;
    const o = e.split(' ');
    return o.map((e, r) => {
      let s;
      const d = (s = x(e)) !== null && s !== void 0 ? s : {};
      let t = '';
      if (d.name) {
        t = i(
          'span',
          { class: 'discord-embed-custom-emoji' },
          i('img', { src: d.url, alt: d.name, class: 'discord-embed-custom-emoji-image' }),
          i('span', null, ' '),
        );
      } else {
        t = r < o.length - 1 ? `${e} ` : e;
      }

      return t;
    });
  }

  get el() {
    return r(this);
  }

  static get watchers() {
    return { inlineIndex: ['checkInlineIndex'] };
  }
};
T.style = R;
const D = '.discord-embed .discord-embed-fields{display:grid;grid-column:1/1;margin-top:8px;grid-gap:8px}';
const N = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i(o, { class: 'discord-embed-fields' }, i('slot', null));
  }
};
N.style = D;
const U =
  '.discord-embed-footer{-webkit-box-align:center;align-items:center;color:#dcddde;display:flex;font-size:12px;line-height:16px;font-weight:500;grid-column:1/3;grid-row:auto/auto;margin-top:8px}.discord-embed-footer .discord-footer-image{border-radius:50%;flex-shrink:0;height:20px;margin-right:8px;width:20px}.discord-embed-footer .discord-footer-separator{color:#dcddde;font-weight:500;display:inline-block;margin:0 4px}.discord-light-theme .discord-embed-footer .discord-footer-separator{color:#e4e4e4}';
const W = class {
  constructor(i) {
    e(this, i);
    this.footerImage = undefined;
    this.timestamp = undefined;
  }

  updateTimestamp(e) {
    if (!e || isNaN(new Date(e).getTime())) return null;
    return f(new Date(e));
  }

  componentWillRender() {
    this.timestamp = this.updateTimestamp(this.timestamp);
  }

  render() {
    const e = this.el.parentElement;
    if (e.tagName.toLowerCase() !== 'div') {
      throw new Error('All <discord-embed-footer> components must be direct children of <discord-embed>.');
    }

    return i(
      o,
      { class: 'discord-embed-footer' },
      this.footerImage ? i('img', { src: this.footerImage, alt: '', class: 'discord-footer-image' }) : '',
      i(
        L,
        null,
        i('slot', null),
        this.timestamp ? i('span', { class: 'discord-footer-separator' }, '•') : '',
        this.timestamp ? i(L, null, this.timestamp) : '',
      ),
    );
  }

  get el() {
    return r(this);
  }

  static get watchers() {
    return { timestamp: ['updateTimestamp'] };
  }
};
W.style = U;
const q = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i('code', null, i('slot', null));
  }
};
function P(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '16', height: '16', viewBox: '0 0 16 15.2' },
    i('path', {
      fill: 'currentColor',
      'fill-rule': 'evenodd',
      d: 'm16 7.6c0 .79-1.28 1.38-1.52 2.09s.44 2 0 2.59-1.84.35-2.46.8-.79 1.84-1.54 2.09-1.67-.8-2.47-.8-1.75 1-2.47.8-.92-1.64-1.54-2.09-2-.18-2.46-.8.23-1.84 0-2.59-1.54-1.3-1.54-2.09 1.28-1.38 1.52-2.09-.44-2 0-2.59 1.85-.35 2.48-.8.78-1.84 1.53-2.12 1.67.83 2.47.83 1.75-1 2.47-.8.91 1.64 1.53 2.09 2 .18 2.46.8-.23 1.84 0 2.59 1.54 1.3 1.54 2.09z',
    }),
  );
}

const F = () =>
  i(
    'svg',
    { 'aria-hidden': 'false', width: '16', height: '16', viewBox: '0 0 16 16' },
    i('path', {
      d: 'M10.5906 6.39993L9.19223 7.29993C8.99246 7.39993 8.89258 7.39993 8.69281 7.29993C8.59293 7.19993 8.39317 7.09993 8.29328 6.99993C7.89375 6.89993 7.5941 6.99993 7.29445 7.19993L6.79504 7.49993L4.29797 9.19993C3.69867 9.49993 2.99949 9.39993 2.69984 8.79993C2.30031 8.29993 2.50008 7.59993 2.99949 7.19993L5.99598 5.19993C6.79504 4.69993 7.79387 4.49993 8.69281 4.69993C9.49188 4.89993 10.0912 5.29993 10.5906 5.89993C10.7904 6.09993 10.6905 6.29993 10.5906 6.39993Z',
      fill: 'currentColor',
    }),
    i('path', {
      d: 'M13.4871 7.79985C13.4871 8.19985 13.2874 8.59985 12.9877 8.79985L9.89135 10.7999C9.29206 11.1999 8.69276 11.3999 7.99358 11.3999C7.69393 11.3999 7.49417 11.3999 7.19452 11.2999C6.39545 11.0999 5.79616 10.6999 5.29674 10.0999C5.19686 9.89985 5.29674 9.69985 5.39663 9.59985L6.79499 8.69985C6.89487 8.59985 7.09463 8.59985 7.19452 8.69985C7.39428 8.79985 7.59405 8.89985 7.69393 8.99985C8.09346 8.99985 8.39311 8.99985 8.69276 8.79985L9.39194 8.39985L11.3896 6.99985L11.6892 6.79985C12.1887 6.49985 12.9877 6.59985 13.2874 7.09985C13.4871 7.39985 13.4871 7.59985 13.4871 7.79985Z',
      fill: 'currentColor',
    }),
  );
const J = () =>
  i(
    'svg',
    { 'aria-hidden': 'false', width: '16', height: '16', viewBox: '0 0 16 15.2' },
    i('path', { d: 'M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z', fill: 'currentColor' }),
  );
const Y =
  ".discord-invite{background-color:#2f3136;border-radius:4px;padding:16px;width:432px}.discord-light-theme .discord-invite{background-color:#f2f3f5}.discord-invite .discord-invite-header{font-weight:700;font-size:12px;line-height:16px;margin-bottom:12px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;text-transform:uppercase;color:#b9bbbe}.discord-light-theme .discord-invite .discord-invite-header{color:#4f5660}.discord-invite .discord-invite-root{display:flex;flex-flow:row nowrap}.discord-invite .discord-invite-icon{background-color:#36393f;border-radius:15px;margin-right:16px;-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;width:50px;height:50px}.discord-light-theme .discord-invite .discord-invite-icon{background-color:#fff}.discord-invite .discord-invite-info{font-family:Whitney, 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n\t\tsans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';display:flex;flex:1 1 auto;flex-direction:column;flex-wrap:nowrap;align-items:stretch;justify-content:center}.discord-invite .discord-invite-title{white-space:nowrap;text-overflow:ellipsis;overflow:hidden;margin-bottom:2px;color:white;font-size:16px;line-height:20px;font-weight:700;display:flex;flex-direction:row}.discord-light-theme .discord-invite .discord-invite-title{color:#060607}.discord-invite .discord-invite-name{flex:1 1 auto;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.discord-invite .discord-invite-counts{display:flex;align-items:center;font-size:14px;font-weight:600;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;color:#b9bbbe;line-height:16px}.discord-invite .discord-invite-status{display:block;margin-right:4px;width:8px;height:8px;border-radius:50%;background-color:#747f8d}.discord-invite .discord-invite-status-online{background-color:#3ba55d}.discord-invite .discord-invite-count{-webkit-box-flex:0;-ms-flex:0 1 auto;flex:0 1 auto;margin-right:8px;color:#b9bbbe;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.discord-invite .discord-invite-join{display:flex;justify-content:center;align-items:center;height:40px;padding:0 20px;align-self:center;margin-left:10px;-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;line-height:20px;border-radius:3px;font-size:14px;font-weight:600;color:white !important;background-color:#3ba55d;-webkit-transition:background-color 0.17s ease;transition:background-color 0.17s ease}.discord-invite .discord-invite-join:hover{background-color:#2d7d46;text-decoration:none}.discord-invite .discord-invite-badge{-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;margin-right:8px;width:16px;height:16px;align-self:center;position:relative}.discord-invite .discord-invite-badge-verified{color:#3ba55d}.discord-invite .discord-invite-badge-partnered{color:#5865f2}.discord-invite .discord-invite-badge-container{position:absolute;top:-0.05px;left:0.05px;right:0;bottom:0;display:flex;align-items:center;justify-content:center;pointer-events:none;color:white}.discord-light-theme .discord-invite .discord-invite-counts,.discord-light-theme .discord-invite .discord-invite-count{color:#4f5660}";
const G = class {
  constructor(i) {
    e(this, i);
    this.icon = t.blue;
    this.name = 'Discord Server';
    this.url = undefined;
    this.online = 0;
    this.members = 0;
    this.verified = false;
    this.partnered = false;
    this.inviteTitle = "You've been invited to join a server";
    this.joinBtn = 'Join';
  }

  render() {
    return i(
      'div',
      { class: 'discord-invite' },
      i('div', { class: 'discord-invite-header' }, this.inviteTitle),
      i(
        'div',
        { class: 'discord-invite-root' },
        i('img', { class: 'discord-invite-icon', src: this.icon, alt: this.name }),
        i(
          'div',
          { class: 'discord-invite-info' },
          i(
            'div',
            { class: 'discord-invite-title' },
            ((this.verified && !this.partnered) || (!this.verified && this.partnered)) &&
              i(
                'div',
                { class: 'discord-invite-badge' },
                i(P, {
                  'aria-label': this.partnered ? 'Discord Partner' : 'Verified',
                  class: `discord-invite-badge-${this.partnered ? 'partnered' : 'verified'}`,
                }),
                i('div', { class: 'discord-invite-badge-container' }, this.partnered ? i(F, null) : i(J, null)),
              ),
            i('span', { class: 'discord-invite-name' }, this.name),
          ),
          i(
            'div',
            { class: 'discord-invite-counts' },
            i('i', { class: 'discord-invite-status discord-invite-status-online' }),
            i('span', { class: 'discord-invite-count' }, this.online.toLocaleString(), ' Online'),
            i('i', { class: 'discord-invite-status' }),
            i('span', { class: 'discord-invite-count' }, this.members.toLocaleString(), ' Members'),
          ),
        ),
        i(
          'a',
          { class: 'discord-invite-join', href: this.url, target: '_blank', rel: 'noopener noreferrer' },
          this.joinBtn,
        ),
      ),
    );
  }

  get el() {
    return r(this);
  }
};
G.style = Y;
const K = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i('em', null, i('slot', null));
  }
};
const Q = function e(i) {
  return i.charAt(0) === '#' ? i.slice(1) : i;
};

const X = function e(i) {
  const o = i.length === 3 || i.length === 4;
  const r = o ? ''.concat(i.slice(0, 1)).concat(i.slice(0, 1)) : i.slice(0, 2);
  const s = o ? ''.concat(i.slice(1, 2)).concat(i.slice(1, 2)) : i.slice(2, 4);
  const d = o ? ''.concat(i.slice(2, 3)).concat(i.slice(2, 3)) : i.slice(4, 6);
  const t = (o ? ''.concat(i.slice(3, 4)).concat(i.slice(3, 4)) : i.slice(6, 8)) || 'ff';
  return { r, g: s, b: d, a: t };
};

const ee = function e(i) {
  return Number.parseInt(i, 16);
};

const ie = function e(i) {
  const o = i.r;
  const r = i.g;
  const s = i.b;
  const d = i.a;
  return { r: ee(o), g: ee(r), b: ee(s), a: Number((ee(d) / 255).toFixed(2)) };
};

const oe = function e(i) {
  return !isNaN(Number.parseFloat(i)) && isFinite(i);
};

const re = function e(i, o) {
  const r = i.r;
  const s = i.g;
  const d = i.b;
  const t = i.a;
  const c = oe(o) ? o : t;
  return 'rgba('.concat(r, ', ').concat(s, ', ').concat(d, ', ').concat(c, ')');
};

const se = function e(i, o) {
  const r = Q(i);
  const s = X(r);
  const d = ie(s);
  return re(d, o);
};

const de = se;
function te(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 20 20', fill: 'none' },
    i('path', {
      fill: 'currentColor',
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd',
      d: 'M6.56929 14.6869H2.34375C1.97079 14.6869 1.61311 14.5387 1.34938 14.275C1.08566 14.0113 0.9375 13.6536 0.9375 13.2806V8.12437C0.9375 6.38389 1.6289 4.7147 2.85961 3.484C4.09032 2.25329 5.75951 1.56189 7.49999 1.56189C9.24047 1.56189 10.9097 2.25329 12.1404 3.484C12.6953 4.03895 13.1406 4.68307 13.4623 5.38267C14.9101 5.5973 16.2513 6.29124 17.2655 7.36251C18.4194 8.58133 19.0625 10.1959 19.0625 11.8744V17.0306C19.0625 17.4036 18.9144 17.7613 18.6506 18.025C18.3869 18.2887 18.0292 18.4369 17.6563 18.4369H12.5C11.1428 18.4369 9.81899 18.0162 8.71072 17.2328C7.7871 16.58 7.05103 15.7019 6.56929 14.6869ZM4.18544 4.80982C5.06451 3.93075 6.25679 3.43689 7.49999 3.43689C8.74319 3.43689 9.93549 3.93075 10.8146 4.80983C11.6936 5.6889 12.1875 6.88119 12.1875 8.12439C12.1875 9.36759 11.6936 10.5599 10.8146 11.439C9.93549 12.318 8.74321 12.8119 7.50001 12.8119H7.20268C7.19767 12.8118 7.19266 12.8118 7.18764 12.8119H2.8125V8.12438C2.8125 6.88118 3.30636 5.6889 4.18544 4.80982ZM8.672 14.5814C8.97763 15.0132 9.35591 15.3928 9.79299 15.7017C10.5847 16.2614 11.5305 16.5619 12.5 16.5619H17.1875V11.8744C17.1875 10.6755 16.7281 9.52219 15.9039 8.65159C15.3804 8.09865 14.735 7.68644 14.027 7.44246C14.0506 7.66798 14.0625 7.89557 14.0625 8.12439C14.0625 9.86487 13.3711 11.5341 12.1404 12.7648C11.1896 13.7156 9.97697 14.3445 8.672 14.5814Z',
    }),
  );
}

function ce(e) {
  return i(
    'svg',
    { ...e, width: '24', height: '24', viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' },
    i('path', {
      fill: 'currentColor',
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd',
      d: 'M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z',
    }),
  );
}

function ae(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 24 24' },
    i('path', {
      fill: 'currentColor',
      d: 'M5.43309 21C5.35842 21 5.30189 20.9325 5.31494 20.859L5.99991 17H2.14274C2.06819 17 2.01168 16.9327 2.02453 16.8593L2.33253 15.0993C2.34258 15.0419 2.39244 15 2.45074 15H6.34991L7.40991 9H3.55274C3.47819 9 3.42168 8.93274 3.43453 8.85931L3.74253 7.09931C3.75258 7.04189 3.80244 7 3.86074 7H7.75991L8.45234 3.09903C8.46251 3.04174 8.51231 3 8.57049 3H10.3267C10.4014 3 10.4579 3.06746 10.4449 3.14097L9.75991 7H15.7599L16.4523 3.09903C16.4625 3.04174 16.5123 3 16.5705 3H18.3267C18.4014 3 18.4579 3.06746 18.4449 3.14097L17.7599 7H21.6171C21.6916 7 21.7481 7.06725 21.7353 7.14069L21.4273 8.90069C21.4172 8.95811 21.3674 9 21.3091 9H17.4099L17.0495 11.04H15.05L15.4104 9H9.41035L8.35035 15H10.5599V17H7.99991L7.30749 20.901C7.29732 20.9583 7.24752 21 7.18934 21H5.43309Z',
    }),
    i('path', {
      fill: 'currentColor',
      d: 'M13.4399 12.96C12.9097 12.96 12.4799 13.3898 12.4799 13.92V20.2213C12.4799 20.7515 12.9097 21.1813 13.4399 21.1813H14.3999C14.5325 21.1813 14.6399 21.2887 14.6399 21.4213V23.4597C14.6399 23.6677 14.8865 23.7773 15.0408 23.6378L17.4858 21.4289C17.6622 21.2695 17.8916 21.1813 18.1294 21.1813H22.5599C23.0901 21.1813 23.5199 20.7515 23.5199 20.2213V13.92C23.5199 13.3898 23.0901 12.96 22.5599 12.96H13.4399Z',
    }),
  );
}

function ne(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 24 24' },
    i('path', {
      fill: 'currentColor',
      d: 'M17 11V7C17 4.243 14.756 2 12 2C9.242 2 7 4.243 7 7V11C5.897 11 5 11.896 5 13V20C5 21.103 5.897 22 7 22H17C18.103 22 19 21.103 19 20V13C19 11.896 18.103 11 17 11ZM12 18C11.172 18 10.5 17.328 10.5 16.5C10.5 15.672 11.172 15 12 15C12.828 15 13.5 15.672 13.5 16.5C13.5 17.328 12.828 18 12 18ZM15 11H9V7C9 5.346 10.346 4 12 4C13.654 4 15 5.346 15 7V11Z',
      'aria-hidden': 'true',
    }),
  );
}

function le(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 24 24' },
    i('path', {
      fill: 'currentColor',
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd',
      d: 'M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z',
      'aria-hidden': 'true',
    }),
  );
}

const me =
  '.discord-message .discord-mention{color:#e3e7f8;background-color:hsla(235, 85.6%, 64.7%, 0.3);font-weight:500;padding:0 2px;border-radius:3px;unicode-bidi:-moz-plaintext;unicode-bidi:plaintext;-webkit-transition:background-color 50ms ease-out, color 50ms ease-out;transition:background-color 50ms ease-out, color 50ms ease-out;cursor:pointer}.discord-message .discord-mention:hover{color:#fff;background-color:hsl(235, 85.6%, 64.7%)}.discord-message .discord-mention.discord-channel-mention{padding-left:1.2rem !important;position:relative}.discord-message .discord-mention.discord-voice-mention,.discord-message .discord-mention.discord-locked-mention,.discord-message .discord-mention.discord-thread-mention,.discord-message .discord-mention.discord-forum-mention{padding-left:1.25rem !important;position:relative}.discord-light-theme .discord-message .discord-mention{color:#687dc6;background-color:hsla(235, 85.6%, 64.7%, 0.15)}.discord-light-theme .discord-message .discord-mention:hover{color:#ffffff;background-color:hsl(235, 85.6%, 64.7%)}.discord-message .discord-mention .discord-mention-icon{width:1rem;height:1rem;object-fit:contain;position:absolute;left:0.125rem;top:0.125rem}';
const he = class {
  constructor(i) {
    e(this, i);
    this.highlight = false;
    this.color = undefined;
    this.type = 'user';
  }

  handleType(e) {
    if (typeof e !== 'string') {
      throw new TypeError('DiscordMention `type` prop must be a string.');
    } else if (!['user', 'channel', 'role', 'voice', 'locked', 'thread', 'forum', 'slash'].includes(e)) {
      throw new RangeError(
        "DiscordMention `type` prop must be one of: 'user', 'channel', 'role', 'voice', 'locked', 'thread', 'forum', 'slash'",
      );
    }
  }

  componentWillRender() {
    this.handleType(this.type);
  }

  componentDidLoad() {
    if (this.color && this.type === 'role') {
      this.el.addEventListener('mouseover', this.setHoverColor.bind(this));
      this.el.addEventListener('mouseout', this.resetHoverColor.bind(this));
    }
  }

  disconnectedCallback() {
    if (this.color && this.type === 'role') {
      this.el.removeEventListener('mouseover', this.setHoverColor.bind(this));
      this.el.removeEventListener('mouseout', this.resetHoverColor.bind(this));
    }
  }

  setHoverColor() {
    this.el.style.backgroundColor = de(this.color, 0.3);
  }

  resetHoverColor() {
    this.el.style.backgroundColor = de(this.color, 0.1);
  }

  render() {
    const { color: e, type: r } = this;
    const s = !e || r !== 'role' ? {} : { color: e, 'background-color': de(e, 0.1) };
    let d = '';
    switch (this.type) {
      case 'channel':
        d = i(ce, { class: 'discord-mention-icon' });
        break;
      case 'user':
      case 'role':
        d = '@';
        break;
      case 'voice':
        d = i(le, { class: 'discord-mention-icon' });
        break;
      case 'locked':
        d = i(ne, { class: 'discord-mention-icon' });
        break;
      case 'thread':
        d = i(ae, { class: 'discord-mention-icon' });
        break;
      case 'forum':
        d = i(te, { class: 'discord-mention-icon' });
        break;
      case 'slash':
        d = '/';
        break;
    }

    return i(o, { style: s, class: `discord-mention discord-${r}-mention` }, d, i('slot', null));
  }

  get el() {
    return r(this);
  }

  static get watchers() {
    return { type: ['handleType'] };
  }
};
he.style = me;
const ge = () =>
  i(
    'svg',
    {
      class: 'discord-application-tag-verified',
      'aria-label': 'Verified Bot',
      'aria-hidden': 'false',
      width: '16',
      height: '16',
      viewBox: '0 0 16 15.2',
    },
    i('path', { d: 'M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z', fill: 'currentColor' }),
  );
const pe = ({ author: e, bot: o, server: r, op: s, roleColor: d, roleIcon: t, roleName: c, verified: a, compact: n }) =>
  i(
    'span',
    { class: 'discord-author-info' },
    !n &&
      i(
        L,
        null,
        i('span', { class: 'discord-author-username', style: { color: d } }, e),
        t &&
          i('img', { class: 'discord-author-role-icon', src: t, height: '20', width: '20', alt: c, draggable: false }),
      ),
    i(
      L,
      null,
      o && !r && i('span', { class: 'discord-application-tag' }, a && i(ge, null), 'Bot'),
      r && !o && i('span', { class: 'discord-application-tag' }, 'Server'),
      s && i('span', { class: 'discord-application-tag discord-application-tag-op' }, 'OP'),
    ),
    n && i('span', { class: 'discord-author-username', style: { color: d } }, e),
  );
function fe(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '16', height: '16', viewBox: '0 0 24 24' },
    i('path', {
      fill: 'currentColor',
      d: 'M12 5C5.648 5 1 12 1 12C1 12 5.648 19 12 19C18.352 19 23 12 23 12C23 12 18.352 5 12 5ZM12 16C9.791 16 8 14.21 8 12C8 9.79 9.791 8 12 8C14.209 8 16 9.79 16 12C16 14.21 14.209 16 12 16Z',
    }),
    i('path', {
      fill: 'currentColor',
      d: 'M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z',
    }),
  );
}

const ue =
  ".discord-message{color:#dcddde;display:flex;flex-direction:column;font-size:0.9em;font-family:Whitney, 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n\t\tsans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';padding:0px 1em;position:relative;word-wrap:break-word;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;padding-right:0;min-height:1.375rem;padding-right:48px !important;margin-top:1.0625rem}.discord-message .discord-message-inner{display:flex;position:relative;-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto}.discord-message.discord-highlight-mention,.discord-message.discord-highlight-ephemeral{padding-right:5px;position:relative}.discord-message.discord-highlight-mention::before,.discord-message.discord-highlight-ephemeral::before{content:'';position:absolute;display:block;top:0;left:0;bottom:0;pointer-events:none;width:2px}.discord-message.discord-highlight-mention{background-color:rgba(250, 166, 26, 0.1)}.discord-light-theme .discord-message.discord-highlight-mention{background-color:rgba(250, 166, 26, 0.1)}.discord-message.discord-highlight-mention:hover{background-color:rgba(250, 166, 26, 0.08)}.discord-light-theme .discord-message.discord-highlight-mention:hover{background-color:rgba(250, 166, 26, 0.2)}.discord-message.discord-highlight-mention::before{background-color:#faa61a}.discord-message.discord-highlight-ephemeral{background-color:rgba(88, 101, 242, 0.05)}.discord-light-theme .discord-message.discord-highlight-ephemeral{background-color:rgba(250, 166, 26, 0.1)}.discord-message.discord-highlight-ephemeral:hover{background-color:rgba(88, 101, 242, 0.1)}.discord-message.discord-highlight-ephemeral::before{background-color:#5865f2}.discord-light-theme .discord-message{color:#2e3338;border-color:#eceeef}.discord-message a{color:#00aff4;font-weight:normal;text-decoration:none}.discord-message a:hover{text-decoration:underline}.discord-light-theme .discord-message a{color:#00b0f4}.discord-message a:hover{text-decoration:underline}.discord-message .discord-author-avatar{margin-right:16px;margin-top:5px;min-width:40px;z-index:1}.discord-message .discord-author-avatar img{width:40px;height:40px;border-radius:50%}.discord-message .discord-message-timestamp{color:#72767d;font-size:12px;margin-left:3px}.discord-light-theme .discord-message .discord-message-timestamp{color:#747f8d}.discord-message .discord-message-edited{color:#72767d;font-size:10px}.discord-light-theme .discord-message .discord-message-edited{color:#99aab5}.discord-message .discord-message-content{width:100%;line-height:160%;font-weight:normal;padding-top:2px}.discord-message .discord-message-body{font-size:1rem;font-weight:400;word-break:break-word;position:relative}.discord-message .discord-message-body strong{font-weight:700}.discord-message .discord-message-body em{font-style:italic}.discord-message .discord-message-body u{text-decoration-color:rgb(220, 221, 222);text-decoration-line:underline;text-decoration-style:solid;text-decoration-thickness:auto}.discord-message .discord-message-body pre{border:1px solid #202225;border-radius:4px}.discord-message .discord-message-body code{background:#2f3136;white-space:break-spaces;font-family:Consolas, Andale Mono WT, Andale Mono, Lucida Console, Lucida Sans Typewriter, DejaVu Sans Mono, Bitstream Vera Sans Mono,\n\t\tLiberation Mono, Nimbus Mono L, Monaco, Courier New, Courier, monospace}.discord-light-theme .discord-message .discord-message-timestamp,.discord-compact-mode .discord-message:hover .discord-message-timestamp,.discord-compact-mode.discord-light-theme .discord-message:hover .discord-message-timestamp{color:#99aab5}.discord-compact-mode.discord-light-theme .discord-message .discord-message-timestamp{color:#d1d9de}.discord-compact-mode .discord-message .discord-message-timestamp{display:inline-block;width:3.1rem;text-align:right;font-size:0.6875rem;line-height:1.375rem;margin-right:0.25rem;margin-left:0;text-indent:0}.discord-compact-mode .discord-message{margin-top:unset}.discord-compact-mode .discord-message .discord-message-body{line-height:1.375rem;padding-left:10px;text-indent:-6px}.discord-compact-mode .discord-message .discord-message-compact-indent{padding-left:10px}.discord-message:first-child{margin-top:0.5rem}.discord-message:last-child{margin-bottom:0.5rem;border-bottom-width:0}.discord-message .discord-message-markup{font-size:1rem;line-height:1.375rem;word-wrap:break-word;user-select:text;font-weight:400}.discord-compact-mode .discord-author-avatar{display:none}.discord-message:hover{background-color:rgba(4, 4, 5, 0.07)}.discord-light-theme .discord-message:hover{background-color:rgba(6, 6, 7, 0.02)}.discord-message.discord-message-has-thread:after{width:2rem;left:2.2rem;top:1.75rem;border-left:2px solid #4f545c;border-bottom:2px solid #4f545c;border-bottom-left-radius:8px;bottom:29px;content:'';position:absolute}.discord-light-theme .discord-message.discord-message-has-thread:after{border-color:#747f8d}.discord-message-ephemeral{color:#72767d;margin-top:4px;font-size:12px;font-weight:400;color:#72767d}.discord-light-theme .discord-message-ephemeral{color:#747f8d}.discord-message-ephemeral .discord-message-ephemeral-link{color:#00aff4;font-weight:500;cursor:pointer}.discord-message-ephemeral .discord-message-ephemeral-link:hover{text-decoration:underline}.discord-message-ephemeral .discord-message-ephemeral-icon{margin-right:4px;vertical-align:text-bottom}.discord-message .discord-author-info{display:inline-flex;align-items:center;font-size:16px;margin-right:0.25rem}.discord-compact-mode .discord-message .discord-author-info{margin-right:0}.discord-message .discord-author-info .discord-author-username{color:#fff;font-size:1em;font-weight:500}.discord-light-theme .discord-message .discord-author-info .discord-author-username{color:#23262a}.discord-message .discord-author-info .discord-application-tag{background-color:#5865f2;color:#fff;font-size:0.625em;margin-left:4px;border-radius:3px;line-height:100%;text-transform:uppercase;display:flex;align-items:center;height:0.9375rem;padding:0 0.275rem;margin-top:0.075em;border-radius:0.1875rem}.discord-message .discord-author-info .discord-application-tag.discord-application-tag-op{background-color:#c9cdfb;color:#4752c4;border-radius:0.4rem}.discord-message .discord-author-info .discord-application-tag-verified{display:inline-block;width:0.9375rem;height:0.9375rem;margin-left:-0.25rem}.discord-message .discord-author-info .discord-author-role-icon{margin-left:0.25rem;vertical-align:top;height:calc(1rem + 4px);width:calc(1rem + 4px)}.discord-compact-mode .discord-message .discord-author-info .discord-author-username{margin-left:8px;margin-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag{margin-left:0;margin-left:5px;margin-right:5px;padding-left:10px;padding-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag-verified{margin-right:0.7em;margin-left:-0.7em}";
const be = class {
  constructor(i) {
    e(this, i);
    this.profile = undefined;
    this.author = 'User';
    this.avatar = undefined;
    this.bot = false;
    this.server = false;
    this.verified = false;
    this.op = false;
    this.edited = false;
    this.roleColor = undefined;
    this.roleIcon = undefined;
    this.roleName = undefined;
    this.highlight = false;
    this.ephemeral = false;
    this.timestamp = new Date();
    this.twentyFour = false;
  }

  updateTimestamp(e) {
    const i = this.el.parentElement;
    return f(e, i.compactMode, this.twentyFour);
  }

  componentWillRender() {
    const e = this.el.parentElement;
    this.timestamp = f(this.timestamp, e.compactMode, this.twentyFour);
  }

  render() {
    let a;
    let b;
    let c;
    let e;
    let f;
    let g;
    let h;
    let l;
    let m;
    let n;
    let p;
    let r;
    let t;
    let u;
    let v;
    let w;
    let x;
    let y;
    const C = this.el.parentElement;
    if (C.tagName.toLowerCase() !== 'discord-messages') {
      throw new Error('All <discord-message> components must be direct children of <discord-messages>.');
    }

    const k = (e) => {
      let i;
      let o;
      return (o = (i = d[e]) !== null && i !== void 0 ? i : e) !== null && o !== void 0 ? o : d.default;
    };

    const j = {
      author: this.author,
      bot: this.bot,
      verified: this.verified,
      server: this.server,
      op: this.op,
      roleColor: this.roleColor,
      roleIcon: this.roleIcon,
      roleName: this.roleName,
    };
    const H = (e = Reflect.get(s, this.profile)) !== null && e !== void 0 ? e : {};
    const z = { ...j, ...H, avatar: k((r = H.avatar) !== null && r !== void 0 ? r : this.avatar) };
    const M =
      Array.from(this.el.children).some(
        (e) => e.tagName.toLowerCase() === 'discord-mention' && e.highlight && ['user', 'role'].includes(e.type),
      ) || this.highlight;
    const V = Array.from(this.el.children).some((e) => e.tagName.toLowerCase() === 'discord-thread');
    return i(
      o,
      {
        class: Z('discord-message', {
          'discord-highlight-mention': M,
          'discord-message-has-thread': V,
          'discord-highlight-ephemeral': this.ephemeral,
        }),
      },
      i('slot', { name: 'reply' }),
      i(
        'div',
        { class: 'discord-message-inner' },
        C.compactMode && i('span', { class: 'discord-message-timestamp' }, this.timestamp),
        i('div', { class: 'discord-author-avatar' }, i('img', { src: z.avatar, alt: z.author })),
        i(
          'div',
          { class: 'discord-message-content' },
          !C.compactMode &&
            i(
              L,
              null,
              i(pe, {
                author: (t = z.author) !== null && t !== void 0 ? t : '',
                bot: (c = z.bot) !== null && c !== void 0 ? c : false,
                server: (a = z.server) !== null && a !== void 0 ? a : false,
                verified: (n = z.verified) !== null && n !== void 0 ? n : false,
                op: (l = z.op) !== null && l !== void 0 ? l : false,
                roleColor: (m = z.roleColor) !== null && m !== void 0 ? m : '',
                roleIcon: (h = z.roleIcon) !== null && h !== void 0 ? h : '',
                roleName: (g = z.roleName) !== null && g !== void 0 ? g : '',
                compact: C.compactMode,
              }),
              i('span', { class: 'discord-message-timestamp' }, this.timestamp),
            ),
          i(
            'div',
            { class: 'discord-message-body' },
            C.compactMode &&
              i(pe, {
                author: (p = z.author) !== null && p !== void 0 ? p : '',
                bot: (f = z.bot) !== null && f !== void 0 ? f : false,
                server: (u = z.server) !== null && u !== void 0 ? u : false,
                verified: (b = z.verified) !== null && b !== void 0 ? b : false,
                op: (x = z.op) !== null && x !== void 0 ? x : false,
                roleColor: (v = z.roleColor) !== null && v !== void 0 ? v : '',
                roleIcon: (w = z.roleIcon) !== null && w !== void 0 ? w : '',
                roleName: (y = z.roleName) !== null && y !== void 0 ? y : '',
                compact: C.compactMode,
              }),
            i('span', { class: 'discord-message-markup' }, i('slot', null)),
            this.edited ? i('span', { class: 'discord-message-edited' }, '(edited)') : '',
          ),
          i(
            'div',
            { class: 'discord-message-compact-indent' },
            i('slot', { name: 'embeds' }),
            i('slot', { name: 'attachments' }),
            i('slot', { name: 'components' }),
            i('slot', { name: 'reactions' }),
            i('slot', { name: 'thread' }),
            this.ephemeral &&
              i(
                'div',
                { class: 'discord-message-ephemeral' },
                i(fe, { class: 'discord-message-ephemeral-icon' }),
                'Only you can see this • ',
                i('span', { class: 'discord-message-ephemeral-link' }, 'Dismiss message'),
              ),
          ),
        ),
      ),
    );
  }

  get el() {
    return r(this);
  }

  static get watchers() {
    return { timestamp: ['updateTimestamp'] };
  }
};
be.style = ue;
const xe =
  "@import url('https://fonts.bunny.net/css?family=roboto:400,500,700');@font-face{font-family:'Whitney';src:url('/assets/fonts/whitney/Book.woff') format('woff');font-weight:400}@font-face{font-family:'Whitney';src:url('/assets/fonts/whitney/Medium.woff') format('woff');font-weight:500}@font-face{font-family:'Whitney';src:url('/assets/fonts/whitney/Semibold.woff') format('woff');font-weight:600}@font-face{font-family:'Whitney';src:url('/assets/fonts/whitney/Bold.woff') format('woff');font-weight:700}.discord-messages{color:#fff;background-color:#36393e;display:block;font-size:16px;font-family:Whitney, 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n\t\tsans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';line-height:170%;border:1px solid rgba(255, 255, 255, 0.05)}.discord-messages.discord-light-theme{color:#747f8d;background-color:#fff;border-color:#dedede}.discord-messages.discord-no-background{background-color:unset}";
const ve = class {
  constructor(i) {
    e(this, i);
    this.lightTheme = undefined;
    this.noBackground = undefined;
    this.compactMode = undefined;
  }

  componentWillRender() {
    if (this.lightTheme || (c === 'light' && this.lightTheme)) {
      this.lightTheme = true;
    }

    if (this.compactMode || (a === 'compact' && this.compactMode)) {
      this.compactMode = true;
    }

    if (this.noBackground || (n === 'none' && this.noBackground)) {
      this.noBackground = true;
    }
  }

  render() {
    return i(
      o,
      {
        class: Z(
          {
            'discord-light-theme': this.lightTheme,
            'discord-compact-mode': this.compactMode,
            'discord-no-background': this.noBackground,
          },
          'discord-messages',
        ),
      },
      i('slot', null),
    );
  }
};
ve.style = xe;
const we =
  '.discord-message .discord-message-body .discord-quote-container{display:flex}.discord-message .discord-message-body .discord-quote-container>.discord-quote-divider{background-color:#4f545c;border-radius:4px;font-size:0.9em;font-style:normal;font-weight:400;margin:0;padding:0;width:4px}.discord-message .discord-message-body blockquote{margin-block-end:unset;margin-block-start:unset;margin-inline-end:unset;margin-inline-start:unset;padding:0 8px 0 12px}';
const ye = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i(
      o,
      { class: 'discord-quote-container' },
      i('div', { class: 'discord-quote-divider' }),
      i('blockquote', null, i('slot', null)),
    );
  }
};
ye.style = we;
const Ce =
  '.discord-reaction{border-radius:0.5rem;cursor:pointer;flex-shrink:0;margin-right:0.25rem;margin-bottom:0.25rem;user-select:none;transition:none 0.1s ease;transition-property:background-color, border-color;background-color:#2f3136;border:1px solid transparent}.discord-light-theme .discord-reaction{background-color:#f2f3f5}.discord-reaction:hover{background-color:#36393f;border-color:#fff2}.discord-light-theme .discord-reaction:not(.discord-reaction-reacted):hover{background-color:white;border-color:#0003}.discord-reaction.discord-reaction-reacted{background-color:rgba(88, 101, 242, 0.15);border-color:#5865f2}.discord-light-theme .discord-reaction.discord-reaction-reacted{background-color:#e7e9fd}.discord-reaction .discord-reaction-inner{display:flex;align-items:center;padding:0.125rem 0.375rem}.discord-reaction img{width:1rem;height:1rem;margin:0.125rem 0;min-width:auto;min-height:auto;object-fit:contain;vertical-align:bottom}.discord-reaction .discord-reaction-count{font-size:0.875rem;font-weight:500;margin-left:0.375rem;text-align:center;color:#b9bbbe}.discord-light-theme .discord-reaction .discord-reaction-count{color:#4f5660}.discord-reaction.discord-reaction-reacted .discord-reaction-count{color:#dee0fc}.discord-light-theme .discord-reaction.discord-reaction-reacted .discord-reaction-count{color:#5865f2}';
const ke = class {
  constructor(i) {
    e(this, i);
    this.emoji = undefined;
    this.name = ':emoji:';
    this.count = 1;
    this.reacted = false;
    this.interactive = false;
  }

  render() {
    return i(
      'div',
      {
        class: Z('discord-reaction', { 'discord-reaction-reacted': this.reacted }),
        onClick: this.handleReactionClick.bind(this),
      },
      i(
        'div',
        { class: 'discord-reaction-inner' },
        i('img', { src: this.emoji, alt: this.name, draggable: false }),
        i('span', { class: 'discord-reaction-count' }, this.count),
      ),
    );
  }

  handleReactionClick(e) {
    if (this.interactive) {
      if (e.shiftKey) {
        this.count--;
      } else {
        this.count++;
      }

      if (this.count <= 0) {
        this.count = 1;
      }
    }
  }

  get el() {
    return r(this);
  }
};
ke.style = Ce;
const Le =
  '.discord-message .discord-reactions,.discord-system-message .discord-reactions{display:flex;-webkit-box-flex:1;-ms-flex:1 0 auto;flex:1 0 auto;align-items:center;flex-wrap:wrap}';
const je = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i(o, { class: 'discord-reactions' }, i('slot', null));
  }
};
je.style = Le;
function He(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '64', height: '64', viewBox: '0 0 64 64' },
    i('path', {
      fill: 'currentColor',
      d: 'M56 50.6667V13.3333C56 10.4 53.6 8 50.6667 8H13.3333C10.4 8 8 10.4 8 13.3333V50.6667C8 53.6 10.4 56 13.3333 56H50.6667C53.6 56 56 53.6 56 50.6667ZM22.6667 36L29.3333 44.0267L38.6667 32L50.6667 48H13.3333L22.6667 36Z',
    }),
  );
}

function ze(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 24 24' },
    i('path', {
      fill: 'currentColor',
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd',
      d: 'M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5ZM16.8995 8.41419L15.4853 6.99998L7 15.4853L8.41421 16.8995L16.8995 8.41419Z',
    }),
  );
}

function Me(e) {
  return i(
    'svg',
    { ...e, width: '12', height: '8', viewBox: '0 0 12 8' },
    i('path', {
      d: 'M0.809739 3.59646L5.12565 0.468433C5.17446 0.431163 5.23323 0.408043 5.2951 0.401763C5.35698 0.395482 5.41943 0.406298 5.4752 0.432954C5.53096 0.45961 5.57776 0.50101 5.61013 0.552343C5.64251 0.603676 5.65914 0.662833 5.6581 0.722939V2.3707C10.3624 2.3707 11.2539 5.52482 11.3991 7.21174C11.4028 7.27916 11.3848 7.34603 11.3474 7.40312C11.3101 7.46021 11.2554 7.50471 11.1908 7.53049C11.1262 7.55626 11.0549 7.56204 10.9868 7.54703C10.9187 7.53201 10.857 7.49695 10.8104 7.44666C8.72224 5.08977 5.6581 5.63359 5.6581 5.63359V7.28135C5.65831 7.34051 5.64141 7.39856 5.60931 7.44894C5.5772 7.49932 5.53117 7.54004 5.4764 7.5665C5.42163 7.59296 5.3603 7.60411 5.29932 7.59869C5.23834 7.59328 5.18014 7.57151 5.13128 7.53585L0.809739 4.40892C0.744492 4.3616 0.691538 4.30026 0.655067 4.22975C0.618596 4.15925 0.599609 4.08151 0.599609 4.00269C0.599609 3.92386 0.618596 3.84612 0.655067 3.77562C0.691538 3.70511 0.744492 3.64377 0.809739 3.59646Z',
      fill: 'currentColor',
    }),
  );
}

const Ve =
  ".discord-replied-message{color:#b9bbbe;display:flex;font-size:0.875rem;font-family:Whitney, 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n\t\tsans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';padding-top:2px;margin-left:56px;margin-bottom:4px;align-items:center;line-height:1.125rem;position:relative;white-space:pre;user-select:none}.discord-light-theme .discord-replied-message{color:#4f5660}.discord-compact-mode .discord-replied-message{margin-left:62px;margin-bottom:0}.discord-replied-message:before{content:'';display:block;position:absolute;top:50%;right:100%;bottom:0;left:-36px;margin-right:4px;margin-top:-1px;margin-left:-1px;margin-bottom:-2px;border-left:2px solid #4f545c;border-bottom:0 solid #4f545c;border-right:0 solid #4f545c;border-top:2px solid #4f545c;border-top-left-radius:6px}.discord-light-theme .discord-replied-message:before{border-color:#747f8d}.discord-replied-message .discord-replied-message-avatar,.discord-replied-message .discord-reply-badge{-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;width:16px;height:16px;border-radius:50%;user-select:none;margin-right:0.25rem}.discord-replied-message .discord-reply-badge{display:flex;align-items:center;justify-content:center;color:#b9bbbe;background:#202225}.discord-light-theme .discord-replied-message .discord-reply-badge{color:#4f5660;background:#e3e5e8}.discord-replied-message .discord-application-tag{background-color:hsl(235, 85.6%, 64.7%);color:#fff;font-size:0.625rem;margin-right:0.25rem;line-height:100%;text-transform:uppercase;display:flex;align-items:center;height:0.9375rem;padding:0 0.275rem;margin-top:0.075em;border-radius:0.1875rem}.discord-replied-message .discord-application-tag .discord-application-tag-verified{width:0.9375rem;height:0.9375rem;margin-left:-0.1rem}.discord-replied-message .discord-application-tag.discord-application-tag-op{background-color:#c9cdfb;color:#4752c4;border-radius:0.4rem}.discord-replied-message .discord-replied-message-username{flex-shrink:0;font-size:inherit;line-height:inherit;margin-right:0.25rem;opacity:0.64;font-weight:500;color:#fff}.discord-replied-message .discord-replied-message-content{color:inherit;font-size:inherit;line-height:inherit;white-space:pre;text-overflow:ellipsis;user-select:none;cursor:pointer}.discord-replied-message .discord-replied-message-content:hover{color:#fff}.discord-light-theme .discord-replied-message .discord-replied-message-content:hover{color:#000}.discord-replied-message .discord-replied-message-content .discord-message-edited{margin-left:0.25rem}.discord-replied-message .discord-replied-message-content-icon{-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;width:20px;height:20px;margin-left:4px}.discord-message .discord-author-info{display:inline-flex;align-items:center;font-size:16px;margin-right:0.25rem}.discord-compact-mode .discord-message .discord-author-info{margin-right:0}.discord-message .discord-author-info .discord-author-username{color:#fff;font-size:1em;font-weight:500}.discord-light-theme .discord-message .discord-author-info .discord-author-username{color:#23262a}.discord-message .discord-author-info .discord-application-tag{background-color:#5865f2;color:#fff;font-size:0.625em;margin-left:4px;border-radius:3px;line-height:100%;text-transform:uppercase;display:flex;align-items:center;height:0.9375rem;padding:0 0.275rem;margin-top:0.075em;border-radius:0.1875rem}.discord-message .discord-author-info .discord-application-tag.discord-application-tag-op{background-color:#c9cdfb;color:#4752c4;border-radius:0.4rem}.discord-message .discord-author-info .discord-application-tag-verified{display:inline-block;width:0.9375rem;height:0.9375rem;margin-left:-0.25rem}.discord-message .discord-author-info .discord-author-role-icon{margin-left:0.25rem;vertical-align:top;height:calc(1rem + 4px);width:calc(1rem + 4px)}.discord-compact-mode .discord-message .discord-author-info .discord-author-username{margin-left:8px;margin-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag{margin-left:0;margin-left:5px;margin-right:5px;padding-left:10px;padding-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag-verified{margin-right:0.7em;margin-left:-0.7em}";
const Se = class {
  constructor(i) {
    e(this, i);
    this.profile = undefined;
    this.author = 'User';
    this.avatar = undefined;
    this.bot = false;
    this.server = false;
    this.op = false;
    this.verified = false;
    this.edited = false;
    this.roleColor = undefined;
    this.command = false;
    this.attachment = false;
    this.mentions = false;
  }

  render() {
    let e;
    let r;
    let t;
    const c = this.el.parentElement;
    if (c.tagName.toLowerCase() !== 'discord-message') {
      throw new Error('All <discord-reply> components must be direct children of <discord-message>.');
    }

    const a = (e) => {
      let i;
      let o;
      return (o = (i = d[e]) !== null && i !== void 0 ? i : e) !== null && o !== void 0 ? o : d.default;
    };

    const n = {
      author: this.author,
      bot: this.bot,
      verified: this.verified,
      op: this.op,
      server: this.server,
      roleColor: this.roleColor,
    };
    const l = (e = Reflect.get(s, this.profile)) !== null && e !== void 0 ? e : {};
    const m = { ...n, ...l, avatar: a((r = l.avatar) !== null && r !== void 0 ? r : this.avatar) };
    const h = c.parentElement;
    return i(
      o,
      { class: 'discord-replied-message' },
      h.compactMode
        ? i('div', { class: 'discord-reply-badge' }, i(Me, null))
        : i('img', { class: 'discord-replied-message-avatar', src: m.avatar, alt: m.author }),
      i(
        L,
        null,
        m.bot && !m.server && i('span', { class: 'discord-application-tag' }, m.verified && i(ge, null), 'Bot'),
        m.server && !m.bot && i('span', { class: 'discord-application-tag' }, 'Server'),
        m.op && i('span', { class: 'discord-application-tag discord-application-tag-op' }, 'OP'),
      ),
      i(
        'span',
        {
          class: 'discord-replied-message-username',
          style: { color: (t = m.roleColor) !== null && t !== void 0 ? t : '' },
        },
        this.mentions && '@',
        m.author,
      ),
      i(
        'div',
        { class: 'discord-replied-message-content' },
        i('slot', null),
        this.edited ? i('span', { class: 'discord-message-edited' }, '(edited)') : '',
      ),
      this.command
        ? i(ze, { class: 'discord-replied-message-content-icon' })
        : this.attachment && i(He, { class: 'discord-replied-message-content-icon' }),
    );
  }

  get el() {
    return r(this);
  }
};
Se.style = Ve;
const _e =
  '.discord-message .discord-message-body .discord-spoiler{background-color:#202225;color:transparent;cursor:pointer}.discord-light-theme .discord-message .discord-message-body .discord-spoiler{background-color:#b9bbbe}.discord-message .discord-message-body .discord-spoiler:hover{background-color:rgba(32, 34, 37, 0.8)}.discord-light-theme .discord-message .discord-message-body .discord-spoiler:hover{background-color:rgba(185, 187, 190, 0.8)}.discord-message .discord-message-body .discord-spoiler:active{color:inherit;background-color:hsla(0, 0%, 100%, 0.1)}.discord-light-theme .discord-message .discord-message-body .discord-spoiler:active{background-color:rgba(0, 0, 0, 0.1)}';
const Be = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i(o, { class: 'discord-spoiler' }, i('slot', null));
  }
};
Be.style = _e;
function Oe(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 8 12' },
    i('path', { d: 'M4 0L0 4V8L4 12L8 8V4L4 0ZM7 7.59L4 10.59L1 7.59V4.41L4 1.41L7 4.41V7.59Z', fill: 'currentColor' }),
    i('path', { d: 'M2 4.83V7.17L4 9.17L6 7.17V4.83L4 2.83L2 4.83Z', fill: 'currentColor' }),
  );
}

function Ze(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '18', height: '18', viewBox: '0 0 18 18' },
    i('path', {
      fill: '#3ba55c',
      'fill-rule': 'evenodd',
      d: 'M17.7163041 15.36645368c-.0190957.02699568-1.9039523 2.6680735-2.9957762 2.63320406-3.0676659-.09785935-6.6733809-3.07188394-9.15694343-5.548738C3.08002193 9.9740657.09772497 6.3791404 0 3.3061316v-.024746C0 2.2060575 2.61386252.3152347 2.64082114.2972376c.7110335-.4971705 1.4917101-.3149497 1.80959713.1372281.19320342.2744561 2.19712724 3.2811005 2.42290565 3.6489167.09884826.1608492.14714912.3554431.14714912.5702838 0 .2744561-.07975258.5770327-.23701117.8751101-.1527655.2902036-.65262318 1.1664385-.89862055 1.594995.2673396.3768148.94804468 1.26429792 2.351016 2.66357424 1.39173858 1.39027775 2.28923588 2.07641807 2.67002628 2.34187563.4302146-.2452108 1.3086162-.74238132 1.5972981-.89423205.5447887-.28682915 1.0907006-.31944893 1.4568885-.08661115.3459689.2182151 3.3383754 2.21027167 3.6225641 2.41611376.2695862.19234426.4144887.5399137.4144887.91672846 0 .2969525-.089862.61190215-.2808189.88523346',
    }),
  );
}

function Ee(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '18', height: '18', viewBox: '0 0 18 18' },
    i(
      'g',
      { fill: 'none', 'fill-rule': 'evenodd' },
      i('path', {
        fill: '#99AAB5',
        d: 'M0 14.25V18h3.75L14.81 6.94l-3.75-3.75L0 14.25zM17.71 4.04c.39-.39.39-1.02 0-1.41L15.37.29c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
      }),
      i('path', { d: 'M0 0h18v18H0' }),
    ),
  );
}

function Ae(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '18', height: '18', viewBox: '0 0 18 18' },
    i(
      'g',
      { fill: 'none', 'fill-rule': 'evenodd' },
      i('path', { d: 'M0 0h18v18H0z' }),
      i('path', {
        fill: '#99AAB5',
        d: 'M3.2765961.00034226C6.344262.0982016 9.949977 3.0722262 12.43353953 5.54908026c2.48356254 2.47685405 5.4658595 6.07177934 5.56358447 9.14478814 0 1.1000741-2.61386252 2.9908969-2.64082114 3.008894-.7110335.4971705-1.4917101.3149497-1.80959713-.1372281-.19320342-.2744561-2.19712724-3.2811005-2.42290565-3.6489167-.09884826-.1608492-.14714912-.3554431-.14714912-.5702838 0-.2744561.07975258-.5770327.23701117-.8751101.1527655-.2902036.65262318-1.1664385.89862055-1.594995-.2673396-.3768148-.94804468-1.26429792-2.351016-2.66357424C8.3695281 6.8223767 7.4720308 6.1362364 7.0912404 5.87077883c-.4302146.2452108-1.3086162.74238132-1.5972981.89423205-.5447887.28682915-1.0907006.31944893-1.4568885.08661115C3.6910849 6.63340693.6986784 4.64135036.4144897 4.43550827.1449035 4.243164.000001 3.89559457.000001 3.5187798c0-.29695252.089862-.61190217.2808189-.88523348.0190957-.02699568 1.9039523-2.6680735 2.9957762-2.63320406z',
      }),
    ),
  );
}

function Ie(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', height: '18', viewBox: '0 0 18 18', width: '18' },
    i('path', {
      d: 'm16.908 8.39684-8.29587-8.295827-1.18584 1.184157 1.18584 1.18584-4.14834 4.1475v.00167l-1.18583-1.18583-1.185 1.18583 3.55583 3.55502-4.740831 4.74 1.185001 1.185 4.74083-4.74 3.55581 3.555 1.185-1.185-1.185-1.185 4.1475-4.14836h.0009l1.185 1.185z',
      fill: '#b9bbbe',
    }),
  );
}

function $e(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '20', height: '20', viewBox: '0 0 20 20' },
    i('path', {
      d: 'M10 0C4.486 0 0 4.486 0 10C0 15.515 4.486 20 10 20C15.514 20 20 15.515 20 10C20 4.486 15.514 0 10 0ZM9 4H11V11H9V4ZM10 15.25C9.31 15.25 8.75 14.691 8.75 14C8.75 13.31 9.31 12.75 10 12.75C10.69 12.75 11.25 13.31 11.25 14C11.25 14.691 10.69 15.25 10 15.25Z',
      'fill-rule': 'evenodd',
      'clip-rule': 'evenodd',
      fill: 'currentColor',
    }),
  );
}

function Re(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 24 24' },
    i('path', {
      xmlns: 'http://www.w3.org/2000/svg',
      d: 'M18.4 4L12 10.4L5.6 4L4 5.6L10.4 12L4 18.4L5.6 20L12 13.6L18.4 20L20 18.4L13.6 12L20 5.6L18.4 4Z',
      fill: '#ed4245',
    }),
  );
}

function Te(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '24', height: '24', viewBox: '0 0 24 24' },
    i('path', {
      fill: 'currentColor',
      d: 'M5.43309 21C5.35842 21 5.30189 20.9325 5.31494 20.859L5.99991 17H2.14274C2.06819 17 2.01168 16.9327 2.02453 16.8593L2.33253 15.0993C2.34258 15.0419 2.39244 15 2.45074 15H6.34991L7.40991 9H3.55274C3.47819 9 3.42168 8.93274 3.43453 8.85931L3.74253 7.09931C3.75258 7.04189 3.80244 7 3.86074 7H7.75991L8.45234 3.09903C8.46251 3.04174 8.51231 3 8.57049 3H10.3267C10.4014 3 10.4579 3.06746 10.4449 3.14097L9.75991 7H15.7599L16.4523 3.09903C16.4625 3.04174 16.5123 3 16.5705 3H18.3267C18.4014 3 18.4579 3.06746 18.4449 3.14097L17.7599 7H21.6171C21.6916 7 21.7481 7.06725 21.7353 7.14069L21.4273 8.90069C21.4172 8.95811 21.3674 9 21.3091 9H17.4099L17.0495 11.04H15.05L15.4104 9H9.41035L8.35035 15H10.5599V17H7.99991L7.30749 20.901C7.29732 20.9583 7.24752 21 7.18934 21H5.43309Z',
    }),
    i('path', {
      fill: 'currentColor',
      d: 'M13.4399 12.96C12.9097 12.96 12.4799 13.3898 12.4799 13.92V20.2213C12.4799 20.7515 12.9097 21.1813 13.4399 21.1813H14.3999C14.5325 21.1813 14.6399 21.2887 14.6399 21.4213V23.4597C14.6399 23.6677 14.8865 23.7773 15.0408 23.6378L17.4858 21.4289C17.6622 21.2695 17.8916 21.1813 18.1294 21.1813H22.5599C23.0901 21.1813 23.5199 20.7515 23.5199 20.2213V13.92C23.5199 13.3898 23.0901 12.96 22.5599 12.96H13.4399Z',
    }),
  );
}

function De(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '18', height: '18', viewBox: '0 0 18 18' },
    i(
      'g',
      { fill: 'none', 'fill-rule': 'evenodd' },
      i('path', { d: 'M18 0H0v18h18z' }),
      i('path', { fill: '#3ba55c', d: 'M0 8h14.2l-3.6-3.6L12 3l6 6-6 6-1.4-1.4 3.6-3.6H0' }),
    ),
  );
}

function Ne(e) {
  return i(
    'svg',
    { ...e, 'aria-hidden': 'false', width: '18', height: '18', viewBox: '0 0 18 18' },
    i(
      'g',
      { fill: 'none', 'fill-rule': 'evenodd', stroke: 'none', 'stroke-width': '1' },
      i('path', { d: 'M18 0H0v18h18z' }),
      i('path', { fill: '#ed4245', d: 'M3.8 8l3.6-3.6L6 3 0 9l6 6 1.4-1.4L3.8 10H18V8' }),
    ),
  );
}

const Ue =
  ".discord-system-message{color:#8e9297;display:flex;font-weight:400;font-size:1rem;font-family:Whitney, 'Source Sans Pro', ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial,\n\t\tsans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';padding:0px 1em;position:relative;word-wrap:break-word;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;-webkit-box-flex:0;-ms-flex:0 0 auto;flex:0 0 auto;padding-right:0;min-height:1.375rem;padding-right:48px !important;margin-top:1.0625rem}.discord-light-theme .discord-system-message{color:#2e3338;border-color:#eceeef}.discord-system-message.discord-channel-name-change{color:#fff}.discord-light-theme .discord-system-message.discord-channel-name-change{color:#060607}.discord-system-message.discord-boost-system-message svg{color:#ff73fa}.discord-system-message.discord-alert-system-message svg{color:#faa81a}.discord-system-message.discord-error-system-message svg{color:#faa81a}.discord-system-message:first-child{margin-top:0.5rem}.discord-system-message:last-child{margin-bottom:0.5rem;border-bottom-width:0}.discord-system-message .discord-message-icon{margin-right:16px;margin-top:5px;min-width:40px;display:flex;align-items:flex-start;justify-content:center}.discord-system-message .discord-message-icon svg{width:16px;height:16px}.discord-system-message .discord-message-timestamp{color:#72767d;font-size:12px;margin-left:3px}.discord-light-theme .discord-system-message .discord-message-timestamp{color:#747f8d}.discord-system-message .discord-message-system-edited{color:#72767d;font-size:10px}.discord-light-theme .discord-system-message .discord-message-edited{color:#99aab5}.discord-system-message .discord-message-content{width:100%;line-height:160%;font-weight:normal;padding-top:2px;display:flex;flex-direction:column}.discord-system-message .discord-message-content i{font-style:normal;cursor:pointer;color:white;font-weight:500}.discord-light-theme .discord-system-message .discord-message-content i{color:#060607}.discord-system-message .discord-message-content i:hover{text-decoration:underline}.discord-system-message:hover{background-color:rgba(4, 4, 5, 0.07)}.discord-light-theme .discord-system-message:hover{background-color:rgba(6, 6, 7, 0.02)}.discord-system-message.discord-system-message-has-thread:after{width:2rem;left:2.2rem;top:1.75rem;border-left:2px solid #4f545c;border-bottom:2px solid #4f545c;border-bottom-left-radius:8px;bottom:29px;content:'';position:absolute}.discord-light-theme .discord-system-message.discord-system-message-has-thread:after{border-color:#747f8d}.discord-message .discord-author-info{display:inline-flex;align-items:center;font-size:16px;margin-right:0.25rem}.discord-compact-mode .discord-message .discord-author-info{margin-right:0}.discord-message .discord-author-info .discord-author-username{color:#fff;font-size:1em;font-weight:500}.discord-light-theme .discord-message .discord-author-info .discord-author-username{color:#23262a}.discord-message .discord-author-info .discord-application-tag{background-color:#5865f2;color:#fff;font-size:0.625em;margin-left:4px;border-radius:3px;line-height:100%;text-transform:uppercase;display:flex;align-items:center;height:0.9375rem;padding:0 0.275rem;margin-top:0.075em;border-radius:0.1875rem}.discord-message .discord-author-info .discord-application-tag.discord-application-tag-op{background-color:#c9cdfb;color:#4752c4;border-radius:0.4rem}.discord-message .discord-author-info .discord-application-tag-verified{display:inline-block;width:0.9375rem;height:0.9375rem;margin-left:-0.25rem}.discord-message .discord-author-info .discord-author-role-icon{margin-left:0.25rem;vertical-align:top;height:calc(1rem + 4px);width:calc(1rem + 4px)}.discord-compact-mode .discord-message .discord-author-info .discord-author-username{margin-left:8px;margin-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag{margin-left:0;margin-left:5px;margin-right:5px;padding-left:10px;padding-right:4px}.discord-compact-mode .discord-message .discord-author-info .discord-application-tag-verified{margin-right:0.7em;margin-left:-0.7em}";
const We = class {
  constructor(i) {
    e(this, i);
    this.timestamp = new Date();
    this.type = 'join';
    this.channelName = false;
  }

  handleType(e) {
    if (typeof e !== 'string') {
      throw new TypeError('DiscordSystemMessage `type` prop must be a string.');
    } else if (
      !['join', 'leave', 'call', 'missed-call', 'boost', 'edit', 'thread', 'pin', 'alert', 'error'].includes(e)
    ) {
      throw new RangeError(
        "DiscordSystemMessage `type` prop must be one of: 'join', 'leave', 'call', 'missed-call', 'boost', 'edit', 'pin', 'thread' 'alert', 'error'",
      );
    }
  }

  updateTimestamp(e) {
    return f(e);
  }

  componentWillRender() {
    this.timestamp = f(this.timestamp);
  }

  render() {
    const e = this.el.parentElement;
    if (e.tagName.toLowerCase() !== 'discord-messages') {
      throw new Error('All <discord-system-message> components must be direct children of <discord-messages>.');
    }

    let r = '';
    switch (this.type) {
      case 'join':
        r = i(De, null);
        break;
      case 'leave':
        r = i(Ne, null);
        break;
      case 'call':
        r = i(Ze, null);
        break;
      case 'missed-call':
        r = i(Ae, null);
        break;
      case 'edit':
        r = i(Ee, null);
        break;
      case 'boost':
        r = i(Oe, null);
        break;
      case 'thread':
        r = i(Te, null);
        break;
      case 'alert':
        r = i($e, null);
        break;
      case 'error':
        r = i(Re, null);
        break;
      case 'pin':
        r = i(Ie, null);
        break;
    }

    const s = Array.from(this.el.children).some((e) => e.tagName.toLowerCase() === 'discord-thread');
    return i(
      o,
      {
        class: Z('discord-system-message', `discord-${this.type}-system-message`, {
          'discord-system-message-has-thread': s,
          'discord-channel-name-change': this.channelName,
        }),
      },
      i('div', { class: 'discord-message-icon' }, r),
      i(
        'div',
        { class: 'discord-message-content' },
        i('span', null, i('slot', null), i('span', { class: 'discord-message-timestamp' }, this.timestamp)),
        i('slot', { name: 'reactions' }),
        i('slot', { name: 'thread' }),
      ),
    );
  }

  get el() {
    return r(this);
  }

  static get watchers() {
    return { type: ['handleType'], timestamp: ['updateTimestamp'] };
  }
};
We.style = Ue;
const qe =
  '.discord-tenor-video{color:#dcddde;display:flex;font-size:13px;line-height:150%;margin-bottom:8px;margin-top:8px}.discord-tenor-video .discord-tenor-video-wrapper{display:block;position:relative;-webkit-user-select:text;-moz-user-select:text;-ms-user-select:text;user-select:text;overflow:hidden;border-radius:4px}.discord-tenor-video .discord-tenor-video-wrapper video{-webkit-box-align:center;-webkit-box-pack:center;align-items:center;border-radius:0;cursor:pointer;display:flex;height:100%;justify-content:center;max-height:100%;width:100%;left:0px;top:0px}';
const Pe = class {
  constructor(i) {
    e(this, i);
    this.url = undefined;
    this.height = undefined;
    this.width = undefined;
  }

  render() {
    return i(
      o,
      { class: 'discord-tenor-video' },
      i(
        'div',
        { class: 'discord-tenor-video-wrapper', style: { height: `${this.height}px`, width: `${this.width}px` } },
        i('video', {
          muted: true,
          preload: 'auto',
          autoplay: true,
          loop: true,
          src: this.url,
          height: this.height,
          width: this.width,
        }),
      ),
    );
  }

  get el() {
    return r(this);
  }
};
Pe.style = qe;
const Fe =
  '.discord-thread{background-color:#2f3136;border-radius:4px;cursor:pointer;margin-top:8px;max-width:480px;min-width:0;padding:8px;display:inline-flex;width:fit-content;flex-direction:column}.discord-light-theme .discord-thread{background-color:#f2f3f5}.discord-thread .discord-thread-top{display:flex}.discord-thread .discord-thread-bottom{font-size:0.875rem;line-height:1.125rem;align-items:center;color:#b9bbbe;display:flex;margin-top:2px;white-space:nowrap}.discord-light-theme .discord-thread-bottom{color:#4f5660}.discord-thread .discord-thread-name{font-size:0.875rem;font-weight:600;line-height:1.125rem;color:white;margin-right:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.discord-light-theme .discord-thread-name{color:#060607}.discord-thread .discord-thread-cta{color:#00aff4;flex-shrink:0;font-size:0.875rem;font-weight:600;line-height:1.125rem}.discord-thread:hover .discord-thread-cta{text-decoration:underline}';
const Je = class {
  constructor(i) {
    e(this, i);
    this.name = 'Thread';
    this.cta = 'See Thread';
  }

  render() {
    return i(
      o,
      { class: 'discord-thread' },
      i(
        'div',
        { class: 'discord-thread-top' },
        i('span', { class: 'discord-thread-name' }, this.name),
        i('span', { class: 'discord-thread-cta', 'aria-hidden': 'true' }, this.cta, ' ›'),
      ),
      i('span', { class: 'discord-thread-bottom' }, i('slot', null)),
    );
  }

  get el() {
    return r(this);
  }
};
Je.style = Fe;
const Ye =
  '.discord-thread-message{height:18px;min-width:0;display:flex;align-items:center;font-size:0.875rem;line-height:1.125rem}.discord-thread-message .discord-thread-message-avatar{margin-right:8px;flex:0 0 auto;width:16px;height:16px;border-radius:50%;user-select:none}.discord-thread-message .discord-thread-message-username{flex-shrink:0;font-size:inherit;line-height:inherit;margin-right:0.25rem;opacity:0.64;color:white;display:inline;vertical-align:baseline;position:relative;overflow:hidden}.discord-light-theme .discord-thread-message .discord-thread-message-username{color:#060607}.discord-thread-message .discord-application-tag{background-color:#5865f2;color:#fff;font-size:0.65em;margin-right:5px;border-radius:3px;line-height:100%;text-transform:uppercase;display:flex;align-items:center;height:0.9375rem;padding:0 0.275rem;margin-top:0.075em;border-radius:0.1875rem}.discord-thread-message .discord-application-tag-verified{display:inline-block;width:0.9375rem;height:0.9375rem;margin-left:-0.25rem}.discord-thread-message .discord-thread-message-content{display:flex;align-items:baseline}.discord-thread-message .discord-message-edited{color:#72767d;font-size:10px;margin-left:5px}.discord-thread-message .discord-thread-message-timestamp{color:#72767d;flex-shrink:0;margin-left:8px;font-size:0.875rem;line-height:1.125rem}.discord-light-theme .discord-thread-message .discord-thread-message-timestamp,.discord-light-theme .discord-thread-message .discord-message-edited{color:#747f8d}';
const Ge = class {
  constructor(i) {
    e(this, i);
    this.profile = undefined;
    this.author = 'User';
    this.avatar = undefined;
    this.bot = false;
    this.server = false;
    this.verified = false;
    this.edited = false;
    this.roleColor = undefined;
    this.relativeTimestamp = '1m ago';
  }

  render() {
    let e;
    let r;
    const t = (e) => {
      let i;
      let o;
      return (o = (i = d[e]) !== null && i !== void 0 ? i : e) !== null && o !== void 0 ? o : d.default;
    };

    const c = {
      author: this.author,
      bot: this.bot,
      verified: this.verified,
      server: this.server,
      roleColor: this.roleColor,
    };
    const a = (e = Reflect.get(s, this.profile)) !== null && e !== void 0 ? e : {};
    const n = { ...c, ...a, avatar: t((r = a.avatar) !== null && r !== void 0 ? r : this.avatar) };
    return i(
      o,
      { class: 'discord-thread-message' },
      i('img', { src: n.avatar, class: 'discord-thread-message-avatar', alt: n.author }),
      i(
        L,
        null,
        n.bot && !n.server && i('span', { class: 'discord-application-tag' }, n.verified && i(ge, null), 'Bot'),
        n.server && !n.bot && i('span', { class: 'discord-application-tag' }, 'Server'),
      ),
      i('span', { class: 'discord-thread-message-username', style: { color: n.roleColor } }, n.author),
      i(
        'div',
        { class: 'discord-thread-message-content' },
        i('slot', null),
        this.edited ? i('span', { class: 'discord-message-edited' }, '(edited)') : '',
      ),
      i('span', { class: 'discord-thread-message-timestamp' }, this.relativeTimestamp),
    );
  }

  get el() {
    return r(this);
  }
};
Ge.style = Ye;
const Ke = '.discord-time{background-color:#ffffff0f;border-radius:3px;padding:0 2px}';
const Qe = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i(o, { class: 'discord-time' }, i('slot', null));
  }
};
Qe.style = Ke;
const Xe = class {
  constructor(i) {
    e(this, i);
  }

  render() {
    return i('u', null, i('slot', null));
  }
};
export {
  m as discord_action_row,
  w as discord_attachment,
  C as discord_attachments,
  k as discord_bold,
  z as discord_button,
  S as discord_command,
  B as discord_custom_emoji,
  A as discord_embed,
  $ as discord_embed_description,
  T as discord_embed_field,
  N as discord_embed_fields,
  W as discord_embed_footer,
  q as discord_inline_code,
  G as discord_invite,
  K as discord_italic,
  he as discord_mention,
  be as discord_message,
  ve as discord_messages,
  ye as discord_quote,
  ke as discord_reaction,
  je as discord_reactions,
  Se as discord_reply,
  Be as discord_spoiler,
  We as discord_system_message,
  Pe as discord_tenor_video,
  Je as discord_thread,
  Ge as discord_thread_message,
  Qe as discord_time,
  Xe as discord_underlined,
};
// # sourceMappingURL=p-3cbebc58.entry.js.map
