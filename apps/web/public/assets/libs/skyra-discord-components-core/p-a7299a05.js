var d, o, n, a, c, s, t, i, p;
const e = {
  blue: 'https://cdn.discordapp.com/embed/avatars/0.png',
  gray: 'https://cdn.discordapp.com/embed/avatars/1.png',
  green: 'https://cdn.discordapp.com/embed/avatars/2.png',
  orange: 'https://cdn.discordapp.com/embed/avatars/3.png',
  red: 'https://cdn.discordapp.com/embed/avatars/4.png',
  pink: 'https://cdn.discordapp.com/embed/avatars/5.png',
};
const l =
  (o = (d = window.$discordMessage) === null || d === void 0 ? void 0 : d.avatars) !== null && o !== void 0 ? o : {};
const v = Object.assign(e, l, {
  default: (a = (n = e[l.default]) !== null && n !== void 0 ? n : l.default) !== null && a !== void 0 ? a : e.blue,
});
const r =
  (s = (c = window.$discordMessage) === null || c === void 0 ? void 0 : c.profiles) !== null && s !== void 0 ? s : {};
const m =
  ((t = window.$discordMessage) === null || t === void 0 ? void 0 : t.defaultTheme) === 'light' ? 'light' : 'dark';
const g =
  ((i = window.$discordMessage) === null || i === void 0 ? void 0 : i.defaultMode) === 'compact' ? 'compact' : 'cozy';
const u =
  ((p = window.$discordMessage) === null || p === void 0 ? void 0 : p.defaultBackground) === 'none'
    ? 'none'
    : 'discord';
export { v as a, m as b, g as c, e as d, u as e, r as p };
//# sourceMappingURL=p-a7299a05.js.map
