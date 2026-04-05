const t = 'skyra-discord-components-core';
let e;
let n;
let s = false;
let l = false;
let o = false;
let i = false;
let c = false;
const f = (t, e = '') => {
  {
    return () => {};
  }
};
const r = (t, e) => {
  {
    return () => {};
  }
};
const u = '{visibility:hidden}.hydrated{visibility:inherit}';
const a = 'http://www.w3.org/1999/xlink';
const d = {};
const p = 'http://www.w3.org/2000/svg';
const h = 'http://www.w3.org/1999/xhtml';
const y = (t) => {
  t = typeof t;
  return t === 'object' || t === 'function';
};
function $(t) {
  var e, n, s;
  return (s =
    (n = (e = t.head) === null || e === void 0 ? void 0 : e.querySelector('meta[name="csp-nonce"]')) === null ||
    n === void 0
      ? void 0
      : n.getAttribute('content')) !== null && s !== void 0
    ? s
    : undefined;
}
const m = (t, e, ...n) => {
  let s = null;
  let l = null;
  let o = null;
  let i = false;
  let c = false;
  const f = [];
  const r = (e) => {
    for (let n = 0; n < e.length; n++) {
      s = e[n];
      if (Array.isArray(s)) {
        r(s);
      } else if (s != null && typeof s !== 'boolean') {
        if ((i = typeof t !== 'function' && !y(s))) {
          s = String(s);
        }
        if (i && c) {
          f[f.length - 1].t += s;
        } else {
          f.push(i ? w(null, s) : s);
        }
        c = i;
      }
    }
  };
  r(n);
  if (e) {
    if (e.key) {
      l = e.key;
    }
    if (e.name) {
      o = e.name;
    }
    {
      const t = e.className || e.class;
      if (t) {
        e.class =
          typeof t !== 'object'
            ? t
            : Object.keys(t)
                .filter((e) => t[e])
                .join(' ');
      }
    }
  }
  if (typeof t === 'function') {
    return t(e === null ? {} : e, f, v);
  }
  const u = w(t, null);
  u.l = e;
  if (f.length > 0) {
    u.o = f;
  }
  {
    u.i = l;
  }
  {
    u.u = o;
  }
  return u;
};
const w = (t, e) => {
  const n = { p: 0, h: t, t: e, $: null, o: null };
  {
    n.l = null;
  }
  {
    n.i = null;
  }
  {
    n.u = null;
  }
  return n;
};
const b = {};
const g = (t) => t && t.h === b;
const v = { forEach: (t, e) => t.map(k).forEach(e), map: (t, e) => t.map(k).map(e).map(S) };
const k = (t) => ({ vattrs: t.l, vchildren: t.o, vkey: t.i, vname: t.u, vtag: t.h, vtext: t.t });
const S = (t) => {
  if (typeof t.vtag === 'function') {
    const e = Object.assign({}, t.vattrs);
    if (t.vkey) {
      e.key = t.vkey;
    }
    if (t.vname) {
      e.name = t.vname;
    }
    return m(t.vtag, e, ...(t.vchildren || []));
  }
  const e = w(t.vtag, t.vtext);
  e.l = t.vattrs;
  e.o = t.vchildren;
  e.i = t.vkey;
  e.u = t.vname;
  return e;
};
const j = (t, e) => {
  if (t != null && !y(t)) {
    if (e & 4) {
      return t === 'false' ? false : t === '' || !!t;
    }
    if (e & 2) {
      return parseFloat(t);
    }
    if (e & 1) {
      return String(t);
    }
    return t;
  }
  return t;
};
const O = (t) => wt(t).m;
const C = (t, e, n) => {
  const s = xt.ce(e, n);
  t.dispatchEvent(s);
  return s;
};
const M = new WeakMap();
const x = (t, e, n) => {
  let s = Ot.get(t);
  if (Pt && n) {
    s = s || new CSSStyleSheet();
    if (typeof s === 'string') {
      s = e;
    } else {
      s.replaceSync(e);
    }
  } else {
    s = e;
  }
  Ot.set(t, s);
};
const R = (t, e, n, s) => {
  var l;
  let o = T(e);
  const i = Ot.get(o);
  t = t.nodeType === 11 ? t : Mt;
  if (i) {
    if (typeof i === 'string') {
      t = t.head || t;
      let e = M.get(t);
      let n;
      if (!e) {
        M.set(t, (e = new Set()));
      }
      if (!e.has(o)) {
        {
          {
            n = Mt.createElement('style');
            n.innerHTML = i;
          }
          const e = (l = xt.g) !== null && l !== void 0 ? l : $(Mt);
          if (e != null) {
            n.setAttribute('nonce', e);
          }
          t.insertBefore(n, t.querySelector('link'));
        }
        if (e) {
          e.add(o);
        }
      }
    } else if (!t.adoptedStyleSheets.includes(i)) {
      t.adoptedStyleSheets = [...t.adoptedStyleSheets, i];
    }
  }
  return o;
};
const P = (t) => {
  const e = t.v;
  const n = t.m;
  const s = f('attachStyles', e.k);
  R(n.getRootNode(), e);
  s();
};
const T = (t, e) => 'sc-' + t.k;
const E = (t, e, n, s, l, o) => {
  if (n !== s) {
    let i = vt(t, e);
    let c = e.toLowerCase();
    if (e === 'class') {
      const e = t.classList;
      const l = U(n);
      const o = U(s);
      e.remove(...l.filter((t) => t && !o.includes(t)));
      e.add(...o.filter((t) => t && !l.includes(t)));
    } else if (e === 'style') {
      {
        for (const e in n) {
          if (!s || s[e] == null) {
            if (e.includes('-')) {
              t.style.removeProperty(e);
            } else {
              t.style[e] = '';
            }
          }
        }
      }
      for (const e in s) {
        if (!n || s[e] !== n[e]) {
          if (e.includes('-')) {
            t.style.setProperty(e, s[e]);
          } else {
            t.style[e] = s[e];
          }
        }
      }
    } else if (e === 'key');
    else if (e === 'ref') {
      if (s) {
        s(t);
      }
    } else if (!i && e[0] === 'o' && e[1] === 'n') {
      if (e[2] === '-') {
        e = e.slice(3);
      } else if (vt(Ct, c)) {
        e = c.slice(2);
      } else {
        e = c[2] + e.slice(3);
      }
      if (n) {
        xt.rel(t, e, n, false);
      }
      if (s) {
        xt.ael(t, e, s, false);
      }
    } else {
      const f = y(s);
      if ((i || (f && s !== null)) && !l) {
        try {
          if (!t.tagName.includes('-')) {
            const l = s == null ? '' : s;
            if (e === 'list') {
              i = false;
            } else if (n == null || t[e] != l) {
              t[e] = l;
            }
          } else {
            t[e] = s;
          }
        } catch (t) {}
      }
      let r = false;
      {
        if (c !== (c = c.replace(/^xlink\:?/, ''))) {
          e = c;
          r = true;
        }
      }
      if (s == null || s === false) {
        if (s !== false || t.getAttribute(e) === '') {
          if (r) {
            t.removeAttributeNS(a, e);
          } else {
            t.removeAttribute(e);
          }
        }
      } else if ((!i || o & 4 || l) && !f) {
        s = s === true ? '' : s;
        if (r) {
          t.setAttributeNS(a, e, s);
        } else {
          t.setAttribute(e, s);
        }
      }
    }
  }
};
const N = /\s/;
const U = (t) => (!t ? [] : t.split(N));
const L = (t, e, n, s) => {
  const l = e.$.nodeType === 11 && e.$.host ? e.$.host : e.$;
  const o = (t && t.l) || d;
  const i = e.l || d;
  {
    for (s in o) {
      if (!(s in i)) {
        E(l, s, o[s], undefined, n, e.p);
      }
    }
  }
  for (s in i) {
    E(l, s, o[s], i[s], n, e.p);
  }
};
const W = (t, l, c, f) => {
  const r = l.o[c];
  let u = 0;
  let a;
  let d;
  let y;
  if (!s) {
    o = true;
    if (r.h === 'slot') {
      r.p |= r.o ? 2 : 1;
    }
  }
  if (r.t !== null) {
    a = r.$ = Mt.createTextNode(r.t);
  } else if (r.p & 1) {
    a = r.$ = Mt.createTextNode('');
  } else {
    if (!i) {
      i = r.h === 'svg';
    }
    a = r.$ = Mt.createElementNS(i ? p : h, r.p & 2 ? 'slot-fb' : r.h);
    if (i && r.h === 'foreignObject') {
      i = false;
    }
    {
      L(null, r, i);
    }
    if (r.o) {
      for (u = 0; u < r.o.length; ++u) {
        d = W(t, r, u);
        if (d) {
          a.appendChild(d);
        }
      }
    }
    {
      if (r.h === 'svg') {
        i = false;
      } else if (a.tagName === 'foreignObject') {
        i = true;
      }
    }
  }
  {
    a['s-hn'] = n;
    if (r.p & (2 | 1)) {
      a['s-sr'] = true;
      a['s-cr'] = e;
      a['s-sn'] = r.u || '';
      y = t && t.o && t.o[c];
      if (y && y.h === r.h && t.$) {
        A(t.$, false);
      }
    }
  }
  return a;
};
const A = (t, e) => {
  xt.p |= 1;
  const s = t.childNodes;
  for (let t = s.length - 1; t >= 0; t--) {
    const l = s[t];
    if (l['s-hn'] !== n && l['s-ol']) {
      V(l).insertBefore(l, I(l));
      l['s-ol'].remove();
      l['s-ol'] = undefined;
      o = true;
    }
    if (e) {
      A(l, e);
    }
  }
  xt.p &= ~1;
};
const D = (t, e, n, s, l, o) => {
  let i = (t['s-cr'] && t['s-cr'].parentNode) || t;
  let c;
  for (; l <= o; ++l) {
    if (s[l]) {
      c = W(null, n, l);
      if (c) {
        s[l].$ = c;
        i.insertBefore(c, I(e));
      }
    }
  }
};
const F = (t, e, n) => {
  for (let s = e; s <= n; ++s) {
    const e = t[s];
    if (e) {
      const t = e.$;
      K(e);
      if (t) {
        {
          l = true;
          if (t['s-ol']) {
            t['s-ol'].remove();
          } else {
            A(t, true);
          }
        }
        t.remove();
      }
    }
  }
};
const H = (t, e, n, s) => {
  let l = 0;
  let o = 0;
  let i = 0;
  let c = 0;
  let f = e.length - 1;
  let r = e[0];
  let u = e[f];
  let a = s.length - 1;
  let d = s[0];
  let p = s[a];
  let h;
  let y;
  while (l <= f && o <= a) {
    if (r == null) {
      r = e[++l];
    } else if (u == null) {
      u = e[--f];
    } else if (d == null) {
      d = s[++o];
    } else if (p == null) {
      p = s[--a];
    } else if (q(r, d)) {
      _(r, d);
      r = e[++l];
      d = s[++o];
    } else if (q(u, p)) {
      _(u, p);
      u = e[--f];
      p = s[--a];
    } else if (q(r, p)) {
      if (r.h === 'slot' || p.h === 'slot') {
        A(r.$.parentNode, false);
      }
      _(r, p);
      t.insertBefore(r.$, u.$.nextSibling);
      r = e[++l];
      p = s[--a];
    } else if (q(u, d)) {
      if (r.h === 'slot' || p.h === 'slot') {
        A(u.$.parentNode, false);
      }
      _(u, d);
      t.insertBefore(u.$, r.$);
      u = e[--f];
      d = s[++o];
    } else {
      i = -1;
      {
        for (c = l; c <= f; ++c) {
          if (e[c] && e[c].i !== null && e[c].i === d.i) {
            i = c;
            break;
          }
        }
      }
      if (i >= 0) {
        y = e[i];
        if (y.h !== d.h) {
          h = W(e && e[o], n, i);
        } else {
          _(y, d);
          e[i] = undefined;
          h = y.$;
        }
        d = s[++o];
      } else {
        h = W(e && e[o], n, o);
        d = s[++o];
      }
      if (h) {
        {
          V(r.$).insertBefore(h, I(r.$));
        }
      }
    }
  }
  if (l > f) {
    D(t, s[a + 1] == null ? null : s[a + 1].$, n, s, o, a);
  } else if (o > a) {
    F(e, l, f);
  }
};
const q = (t, e) => {
  if (t.h === e.h) {
    if (t.h === 'slot') {
      return t.u === e.u;
    }
    {
      return t.i === e.i;
    }
  }
  return false;
};
const I = (t) => (t && t['s-ol']) || t;
const V = (t) => (t['s-ol'] ? t['s-ol'] : t).parentNode;
const _ = (t, e) => {
  const n = (e.$ = t.$);
  const s = t.o;
  const l = e.o;
  const o = e.h;
  const c = e.t;
  let f;
  if (c === null) {
    {
      i = o === 'svg' ? true : o === 'foreignObject' ? false : i;
    }
    {
      if (o === 'slot');
      else {
        L(t, e, i);
      }
    }
    if (s !== null && l !== null) {
      H(n, s, e, l);
    } else if (l !== null) {
      if (t.t !== null) {
        n.textContent = '';
      }
      D(n, null, e, l, 0, l.length - 1);
    } else if (s !== null) {
      F(s, 0, s.length - 1);
    }
    if (i && o === 'svg') {
      i = false;
    }
  } else if ((f = n['s-cr'])) {
    f.parentNode.textContent = c;
  } else if (t.t !== c) {
    n.data = c;
  }
};
const z = (t) => {
  const e = t.childNodes;
  let n;
  let s;
  let l;
  let o;
  let i;
  let c;
  for (s = 0, l = e.length; s < l; s++) {
    n = e[s];
    if (n.nodeType === 1) {
      if (n['s-sr']) {
        i = n['s-sn'];
        n.hidden = false;
        for (o = 0; o < l; o++) {
          c = e[o].nodeType;
          if (e[o]['s-hn'] !== n['s-hn'] || i !== '') {
            if (c === 1 && i === e[o].getAttribute('slot')) {
              n.hidden = true;
              break;
            }
          } else {
            if (c === 1 || (c === 3 && e[o].textContent.trim() !== '')) {
              n.hidden = true;
              break;
            }
          }
        }
      }
      z(n);
    }
  }
};
const B = [];
const G = (t) => {
  let e;
  let n;
  let s;
  let o;
  let i;
  let c;
  let f = 0;
  const r = t.childNodes;
  const u = r.length;
  for (; f < u; f++) {
    e = r[f];
    if (e['s-sr'] && (n = e['s-cr']) && n.parentNode) {
      s = n.parentNode.childNodes;
      o = e['s-sn'];
      for (c = s.length - 1; c >= 0; c--) {
        n = s[c];
        if (!n['s-cn'] && !n['s-nr'] && n['s-hn'] !== e['s-hn']) {
          if (J(n, o)) {
            i = B.find((t) => t.S === n);
            l = true;
            n['s-sn'] = n['s-sn'] || o;
            if (i) {
              i.j = e;
            } else {
              B.push({ j: e, S: n });
            }
            if (n['s-sr']) {
              B.map((t) => {
                if (J(t.S, n['s-sn'])) {
                  i = B.find((t) => t.S === n);
                  if (i && !t.j) {
                    t.j = i.j;
                  }
                }
              });
            }
          } else if (!B.some((t) => t.S === n)) {
            B.push({ S: n });
          }
        }
      }
    }
    if (e.nodeType === 1) {
      G(e);
    }
  }
};
const J = (t, e) => {
  if (t.nodeType === 1) {
    if (t.getAttribute('slot') === null && e === '') {
      return true;
    }
    if (t.getAttribute('slot') === e) {
      return true;
    }
    return false;
  }
  if (t['s-sn'] === e) {
    return true;
  }
  return e === '';
};
const K = (t) => {
  {
    t.l && t.l.ref && t.l.ref(null);
    t.o && t.o.map(K);
  }
};
const Q = (t, i) => {
  const c = t.m;
  const f = t.v;
  const r = t.O || w(null, null);
  const u = g(i) ? i : m(null, null, i);
  n = c.tagName;
  if (f.C) {
    u.l = u.l || {};
    f.C.map(([t, e]) => (u.l[e] = c[t]));
  }
  u.h = null;
  u.p |= 4;
  t.O = u;
  u.$ = r.$ = c;
  {
    e = c['s-cr'];
    s = (f.p & 1) !== 0;
    l = false;
  }
  _(r, u);
  {
    xt.p |= 1;
    if (o) {
      G(u.$);
      let t;
      let e;
      let n;
      let s;
      let l;
      let o;
      let i = 0;
      for (; i < B.length; i++) {
        t = B[i];
        e = t.S;
        if (!e['s-ol']) {
          n = Mt.createTextNode('');
          n['s-nr'] = e;
          e.parentNode.insertBefore((e['s-ol'] = n), e);
        }
      }
      for (i = 0; i < B.length; i++) {
        t = B[i];
        e = t.S;
        if (t.j) {
          s = t.j.parentNode;
          l = t.j.nextSibling;
          n = e['s-ol'];
          while ((n = n.previousSibling)) {
            o = n['s-nr'];
            if (o && o['s-sn'] === e['s-sn'] && s === o.parentNode) {
              o = o.nextSibling;
              if (!o || !o['s-nr']) {
                l = o;
                break;
              }
            }
          }
          if ((!l && s !== e.parentNode) || e.nextSibling !== l) {
            if (e !== l) {
              if (!e['s-hn'] && e['s-ol']) {
                e['s-hn'] = e['s-ol'].parentNode.nodeName;
              }
              s.insertBefore(e, l);
            }
          }
        } else {
          if (e.nodeType === 1) {
            e.hidden = true;
          }
        }
      }
    }
    if (l) {
      z(u.$);
    }
    xt.p &= ~1;
    B.length = 0;
  }
};
const X = (t, e) => {
  if (e && !t.M && e['s-p']) {
    e['s-p'].push(new Promise((e) => (t.M = e)));
  }
};
const Y = (t, e) => {
  {
    t.p |= 16;
  }
  if (t.p & 4) {
    t.p |= 512;
    return;
  }
  X(t, t.R);
  const n = () => Z(t, e);
  return At(n);
};
const Z = (t, e) => {
  const n = f('scheduleUpdate', t.v.k);
  const s = t.P;
  let l;
  {
    l = tt(l, () => it(s, 'componentWillRender'));
  }
  n();
  return tt(l, () => nt(t, s, e));
};
const tt = (t, e) => (et(t) ? t.then(e) : e());
const et = (t) => t instanceof Promise || (t && t.then && typeof t.then === 'function');
const nt = async (t, e, n) => {
  var s;
  const l = t.m;
  const o = f('update', t.v.k);
  const i = l['s-rc'];
  if (n) {
    P(t);
  }
  const c = f('render', t.v.k);
  {
    st(t, e);
  }
  if (i) {
    i.map((t) => t());
    l['s-rc'] = undefined;
  }
  c();
  o();
  {
    const e = (s = l['s-p']) !== null && s !== void 0 ? s : [];
    const n = () => lt(t);
    if (e.length === 0) {
      n();
    } else {
      Promise.all(e).then(n);
      t.p |= 4;
      e.length = 0;
    }
  }
};
const st = (t, e, n) => {
  try {
    e = e.render();
    {
      t.p &= ~16;
    }
    {
      t.p |= 2;
    }
    {
      {
        {
          Q(t, e);
        }
      }
    }
  } catch (e) {
    kt(e, t.m);
  }
  return null;
};
const lt = (t) => {
  const e = t.v.k;
  const n = t.m;
  const s = f('postUpdate', e);
  const l = t.P;
  const o = t.R;
  {
    it(l, 'componentDidRender');
  }
  if (!(t.p & 64)) {
    t.p |= 64;
    {
      ct(n);
    }
    {
      it(l, 'componentDidLoad');
    }
    s();
    {
      t.T(n);
      if (!o) {
        ot();
      }
    }
  } else {
    s();
  }
  {
    if (t.M) {
      t.M();
      t.M = undefined;
    }
    if (t.p & 512) {
      Wt(() => Y(t, false));
    }
    t.p &= ~(4 | 512);
  }
};
const ot = (e) => {
  {
    ct(Mt.documentElement);
  }
  Wt(() => C(Ct, 'appload', { detail: { namespace: t } }));
};
const it = (t, e, n) => {
  if (t && t[e]) {
    try {
      return t[e](n);
    } catch (t) {
      kt(t);
    }
  }
  return undefined;
};
const ct = (t) => t.classList.add('hydrated');
const ft = (t, e) => wt(t).N.get(e);
const rt = (t, e, n, s) => {
  const l = wt(t);
  const o = l.m;
  const i = l.N.get(e);
  const c = l.p;
  const f = l.P;
  n = j(n, s.U[e][0]);
  const r = Number.isNaN(i) && Number.isNaN(n);
  const u = n !== i && !r;
  if ((!(c & 8) || i === undefined) && u) {
    l.N.set(e, n);
    if (f) {
      if (s.L && c & 128) {
        const t = s.L[e];
        if (t) {
          t.map((t) => {
            try {
              f[t](n, i, e);
            } catch (t) {
              kt(t, o);
            }
          });
        }
      }
      if ((c & (2 | 16)) === 2) {
        Y(l, false);
      }
    }
  }
};
const ut = (t, e, n) => {
  if (e.U) {
    if (t.watchers) {
      e.L = t.watchers;
    }
    const s = Object.entries(e.U);
    const l = t.prototype;
    s.map(([t, [s]]) => {
      if (s & 31 || (n & 2 && s & 32)) {
        Object.defineProperty(l, t, {
          get() {
            return ft(this, t);
          },
          set(n) {
            rt(this, t, n, e);
          },
          configurable: true,
          enumerable: true,
        });
      }
    });
    if (n & 1) {
      const n = new Map();
      l.attributeChangedCallback = function (t, e, s) {
        xt.jmp(() => {
          const e = n.get(t);
          if (this.hasOwnProperty(e)) {
            s = this[e];
            delete this[e];
          } else if (l.hasOwnProperty(e) && typeof this[e] === 'number' && this[e] == s) {
            return;
          }
          this[e] = s === null && typeof this[e] === 'boolean' ? false : s;
        });
      };
      t.observedAttributes = s
        .filter(([t, e]) => e[0] & 15)
        .map(([t, s]) => {
          const l = s[1] || t;
          n.set(l, t);
          if (s[0] & 512) {
            e.C.push([t, l]);
          }
          return l;
        });
    }
  }
  return t;
};
const at = async (t, e, n, s, l) => {
  if ((e.p & 32) === 0) {
    e.p |= 32;
    {
      l = jt(n);
      if (l.then) {
        const t = r();
        l = await l;
        t();
      }
      if (!l.isProxied) {
        {
          n.L = l.watchers;
        }
        ut(l, n, 2);
        l.isProxied = true;
      }
      const t = f('createInstance', n.k);
      {
        e.p |= 8;
      }
      try {
        new l(e);
      } catch (t) {
        kt(t);
      }
      {
        e.p &= ~8;
      }
      {
        e.p |= 128;
      }
      t();
    }
    if (l.style) {
      let t = l.style;
      const e = T(n);
      if (!Ot.has(e)) {
        const s = f('registerStyles', n.k);
        x(e, t, !!(n.p & 1));
        s();
      }
    }
  }
  const o = e.R;
  const i = () => Y(e, true);
  if (o && o['s-rc']) {
    o['s-rc'].push(i);
  } else {
    i();
  }
};
const dt = (t) => {
  if ((xt.p & 1) === 0) {
    const e = wt(t);
    const n = e.v;
    const s = f('connectedCallback', n.k);
    if (!(e.p & 1)) {
      e.p |= 1;
      {
        if (n.p & (4 | 8)) {
          pt(t);
        }
      }
      {
        let n = t;
        while ((n = n.parentNode || n.host)) {
          if (n['s-p']) {
            X(e, (e.R = n));
            break;
          }
        }
      }
      if (n.U) {
        Object.entries(n.U).map(([e, [n]]) => {
          if (n & 31 && t.hasOwnProperty(e)) {
            const n = t[e];
            delete t[e];
            t[e] = n;
          }
        });
      }
      {
        at(t, e, n);
      }
    }
    s();
  }
};
const pt = (t) => {
  const e = (t['s-cr'] = Mt.createComment(''));
  e['s-cn'] = true;
  t.insertBefore(e, t.firstChild);
};
const ht = (t) => {
  if ((xt.p & 1) === 0) {
    const e = wt(t);
    const n = e.P;
    {
      it(n, 'disconnectedCallback');
    }
  }
};
const yt = (t, e = {}) => {
  var n;
  const s = f();
  const l = [];
  const o = e.exclude || [];
  const i = Ct.customElements;
  const c = Mt.head;
  const r = c.querySelector('meta[charset]');
  const a = Mt.createElement('style');
  const d = [];
  let p;
  let h = true;
  Object.assign(xt, e);
  xt.W = new URL(e.resourcesUrl || './', Mt.baseURI).href;
  t.map((t) => {
    t[1].map((e) => {
      const n = { p: e[0], k: e[1], U: e[2], A: e[3] };
      {
        n.U = e[2];
      }
      {
        n.C = [];
      }
      {
        n.L = {};
      }
      const s = n.k;
      const c = class extends HTMLElement {
        constructor(t) {
          super(t);
          t = this;
          gt(t, n);
        }
        connectedCallback() {
          if (p) {
            clearTimeout(p);
            p = null;
          }
          if (h) {
            d.push(this);
          } else {
            xt.jmp(() => dt(this));
          }
        }
        disconnectedCallback() {
          xt.jmp(() => ht(this));
        }
        componentOnReady() {
          return wt(this).D;
        }
      };
      n.F = t[0];
      if (!o.includes(s) && !i.get(s)) {
        l.push(s);
        i.define(s, ut(c, n, 1));
      }
    });
  });
  {
    a.innerHTML = l + u;
    a.setAttribute('data-styles', '');
    const t = (n = xt.g) !== null && n !== void 0 ? n : $(Mt);
    if (t != null) {
      a.setAttribute('nonce', t);
    }
    c.insertBefore(a, r ? r.nextSibling : c.firstChild);
  }
  h = false;
  if (d.length) {
    d.map((t) => t.connectedCallback());
  } else {
    {
      xt.jmp(() => (p = setTimeout(ot, 30)));
    }
  }
  s();
};
const $t = (t) => (xt.g = t);
const mt = new WeakMap();
const wt = (t) => mt.get(t);
const bt = (t, e) => mt.set((e.P = t), e);
const gt = (t, e) => {
  const n = { p: 0, m: t, v: e, N: new Map() };
  {
    n.D = new Promise((t) => (n.T = t));
    t['s-p'] = [];
    t['s-rc'] = [];
  }
  return mt.set(t, n);
};
const vt = (t, e) => e in t;
const kt = (t, e) => (0, console.error)(t, e);
const St = new Map();
const jt = (t, e, n) => {
  const s = t.k.replace(/-/g, '_');
  const l = t.F;
  const o = St.get(l);
  if (o) {
    return o[s];
  }
  /*!__STENCIL_STATIC_IMPORT_SWITCH__*/ return import(
    /* @vite-ignore */
    `./${l}.entry.js${''}`
  ).then((t) => {
    {
      St.set(l, t);
    }
    return t[s];
  }, kt);
};
const Ot = new Map();
const Ct = typeof window !== 'undefined' ? window : {};
const Mt = Ct.document || { head: {} };
const xt = {
  p: 0,
  W: '',
  jmp: (t) => t(),
  raf: (t) => requestAnimationFrame(t),
  ael: (t, e, n, s) => t.addEventListener(e, n, s),
  rel: (t, e, n, s) => t.removeEventListener(e, n, s),
  ce: (t, e) => new CustomEvent(t, e),
};
const Rt = (t) => Promise.resolve(t);
const Pt = (() => {
  try {
    new CSSStyleSheet();
    return typeof new CSSStyleSheet().replaceSync === 'function';
  } catch (t) {}
  return false;
})();
const Tt = [];
const Et = [];
const Nt = (t, e) => (n) => {
  t.push(n);
  if (!c) {
    c = true;
    if (e && xt.p & 4) {
      Wt(Lt);
    } else {
      xt.raf(Lt);
    }
  }
};
const Ut = (t) => {
  for (let e = 0; e < t.length; e++) {
    try {
      t[e](performance.now());
    } catch (t) {
      kt(t);
    }
  }
  t.length = 0;
};
const Lt = () => {
  Ut(Tt);
  {
    Ut(Et);
    if ((c = Tt.length > 0)) {
      xt.raf(Lt);
    }
  }
};
const Wt = (t) => Rt().then(t);
const At = Nt(Et, true);
export { b as H, yt as b, O as g, m as h, Rt as p, bt as r, $t as s };
//# sourceMappingURL=p-78dab8b1.js.map
