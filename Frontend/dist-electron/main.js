var Zl = Object.defineProperty;
var Bo = (e) => {
  throw TypeError(e);
};
var xl = (e, t, r) => t in e ? Zl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var br = (e, t, r) => xl(e, typeof t != "symbol" ? t + "" : t, r), Jo = (e, t, r) => t.has(e) || Bo("Cannot " + r);
var ve = (e, t, r) => (Jo(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Sr = (e, t, r) => t.has(e) ? Bo("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Pr = (e, t, r, n) => (Jo(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import wc, { ipcMain as nt, dialog as Ec, BrowserWindow as Js, app as Ct } from "electron";
import * as Z from "path";
import Re from "node:process";
import he from "node:path";
import { promisify as Te, isDeepStrictEqual as eu } from "node:util";
import ne from "node:fs";
import Nr from "node:crypto";
import tu from "node:assert";
import Un from "node:os";
import Be from "fs";
import { fileURLToPath as ru } from "url";
import { fork as qn, spawn as nu } from "child_process";
const Wt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, ls = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), su = new Set("0123456789");
function Kn(e) {
  const t = [];
  let r = "", n = "start", s = !1;
  for (const a of e)
    switch (a) {
      case "\\": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        s && (r += a), n = "property", s = !s;
        break;
      }
      case ".": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (ls.has(r))
          return [];
        t.push(r), r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (s) {
          s = !1, r += a;
          break;
        }
        if (n === "property") {
          if (ls.has(r))
            return [];
          t.push(r), r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          t.push(Number.parseInt(r, 10)), r = "", n = "indexEnd";
          break;
        }
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (n === "index" && !su.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (ls.has(r))
        return [];
      t.push(r);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function Ws(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function bc(e, t) {
  if (Ws(e, t))
    throw new Error("Cannot use string index");
}
function au(e, t, r) {
  if (!Wt(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = Kn(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (Ws(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function Wo(e, t, r) {
  if (!Wt(e) || typeof t != "string")
    return e;
  const n = e, s = Kn(t);
  for (let a = 0; a < s.length; a++) {
    const i = s[a];
    bc(e, i), a === s.length - 1 ? e[i] = r : Wt(e[i]) || (e[i] = typeof s[a + 1] == "number" ? [] : {}), e = e[i];
  }
  return n;
}
function ou(e, t) {
  if (!Wt(e) || typeof t != "string")
    return !1;
  const r = Kn(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (bc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !Wt(e))
      return !1;
  }
}
function iu(e, t) {
  if (!Wt(e) || typeof t != "string")
    return !1;
  const r = Kn(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Wt(e) || !(n in e) || Ws(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const It = Un.homedir(), Xs = Un.tmpdir(), { env: ar } = Re, cu = (e) => {
  const t = he.join(It, "Library");
  return {
    data: he.join(t, "Application Support", e),
    config: he.join(t, "Preferences", e),
    cache: he.join(t, "Caches", e),
    log: he.join(t, "Logs", e),
    temp: he.join(Xs, e)
  };
}, lu = (e) => {
  const t = ar.APPDATA || he.join(It, "AppData", "Roaming"), r = ar.LOCALAPPDATA || he.join(It, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: he.join(r, e, "Data"),
    config: he.join(t, e, "Config"),
    cache: he.join(r, e, "Cache"),
    log: he.join(r, e, "Log"),
    temp: he.join(Xs, e)
  };
}, uu = (e) => {
  const t = he.basename(It);
  return {
    data: he.join(ar.XDG_DATA_HOME || he.join(It, ".local", "share"), e),
    config: he.join(ar.XDG_CONFIG_HOME || he.join(It, ".config"), e),
    cache: he.join(ar.XDG_CACHE_HOME || he.join(It, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: he.join(ar.XDG_STATE_HOME || he.join(It, ".local", "state"), e),
    temp: he.join(Xs, t, e)
  };
};
function du(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), Re.platform === "darwin" ? cu(e) : Re.platform === "win32" ? lu(e) : uu(e);
}
const wt = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, ut = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, fu = Re.getuid ? !Re.getuid() : !1, hu = 1e4, qe = () => {
}, we = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!we.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !fu && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!we.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!we.isNodeError(e))
      throw e;
    if (!we.isChangeErrorOk(e))
      throw e;
  }
};
class mu {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = hu, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
      this.intervalId || (this.intervalId = setInterval(this.tick, this.interval));
    }, this.reset = () => {
      this.intervalId && (clearInterval(this.intervalId), delete this.intervalId);
    }, this.add = (t) => {
      this.queueWaiting.add(t), this.queueActive.size < this.limit / 2 ? this.tick() : this.init();
    }, this.remove = (t) => {
      this.queueWaiting.delete(t), this.queueActive.delete(t);
    }, this.schedule = () => new Promise((t) => {
      const r = () => this.remove(n), n = () => t(r);
      this.add(n);
    }), this.tick = () => {
      if (!(this.queueActive.size >= this.limit)) {
        if (!this.queueWaiting.size)
          return this.reset();
        for (const t of this.queueWaiting) {
          if (this.queueActive.size >= this.limit)
            break;
          this.queueWaiting.delete(t), this.queueActive.add(t), t();
        }
      }
    };
  }
}
const pu = new mu(), Et = (e, t) => function(n) {
  return function s(...a) {
    return pu.schedule().then((i) => {
      const o = (d) => (i(), d), c = (d) => {
        if (i(), Date.now() >= n)
          throw d;
        if (t(d)) {
          const u = Math.round(100 * Math.random());
          return new Promise((E) => setTimeout(E, u)).then(() => s.apply(void 0, a));
        }
        throw d;
      };
      return e.apply(void 0, a).then(o, c);
    });
  };
}, bt = (e, t) => function(n) {
  return function s(...a) {
    try {
      return e.apply(void 0, a);
    } catch (i) {
      if (Date.now() > n)
        throw i;
      if (t(i))
        return s.apply(void 0, a);
      throw i;
    }
  };
}, Ce = {
  attempt: {
    /* ASYNC */
    chmod: wt(Te(ne.chmod), we.onChangeError),
    chown: wt(Te(ne.chown), we.onChangeError),
    close: wt(Te(ne.close), qe),
    fsync: wt(Te(ne.fsync), qe),
    mkdir: wt(Te(ne.mkdir), qe),
    realpath: wt(Te(ne.realpath), qe),
    stat: wt(Te(ne.stat), qe),
    unlink: wt(Te(ne.unlink), qe),
    /* SYNC */
    chmodSync: ut(ne.chmodSync, we.onChangeError),
    chownSync: ut(ne.chownSync, we.onChangeError),
    closeSync: ut(ne.closeSync, qe),
    existsSync: ut(ne.existsSync, qe),
    fsyncSync: ut(ne.fsync, qe),
    mkdirSync: ut(ne.mkdirSync, qe),
    realpathSync: ut(ne.realpathSync, qe),
    statSync: ut(ne.statSync, qe),
    unlinkSync: ut(ne.unlinkSync, qe)
  },
  retry: {
    /* ASYNC */
    close: Et(Te(ne.close), we.isRetriableError),
    fsync: Et(Te(ne.fsync), we.isRetriableError),
    open: Et(Te(ne.open), we.isRetriableError),
    readFile: Et(Te(ne.readFile), we.isRetriableError),
    rename: Et(Te(ne.rename), we.isRetriableError),
    stat: Et(Te(ne.stat), we.isRetriableError),
    write: Et(Te(ne.write), we.isRetriableError),
    writeFile: Et(Te(ne.writeFile), we.isRetriableError),
    /* SYNC */
    closeSync: bt(ne.closeSync, we.isRetriableError),
    fsyncSync: bt(ne.fsyncSync, we.isRetriableError),
    openSync: bt(ne.openSync, we.isRetriableError),
    readFileSync: bt(ne.readFileSync, we.isRetriableError),
    renameSync: bt(ne.renameSync, we.isRetriableError),
    statSync: bt(ne.statSync, we.isRetriableError),
    writeSync: bt(ne.writeSync, we.isRetriableError),
    writeFileSync: bt(ne.writeFileSync, we.isRetriableError)
  }
}, $u = "utf8", Xo = 438, yu = 511, gu = {}, _u = Un.userInfo().uid, vu = Un.userInfo().gid, wu = 1e3, Eu = !!Re.getuid;
Re.getuid && Re.getuid();
const Yo = 128, bu = (e) => e instanceof Error && "code" in e, Qo = (e) => typeof e == "string", us = (e) => e === void 0, Su = Re.platform === "linux", Sc = Re.platform === "win32", Ys = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Sc || Ys.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Su && Ys.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Pu {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Sc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? Re.kill(Re.pid, "SIGTERM") : Re.kill(Re.pid, t));
      }
    }, this.hook = () => {
      Re.once("exit", () => this.exit());
      for (const t of Ys)
        try {
          Re.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Nu = new Pu(), Ru = Nu.register, De = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = De.truncate(t(e));
    return n in De.store ? De.get(e, t, r) : (De.store[n] = r, [n, () => delete De.store[n]]);
  },
  purge: (e) => {
    De.store[e] && (delete De.store[e], Ce.attempt.unlink(e));
  },
  purgeSync: (e) => {
    De.store[e] && (delete De.store[e], Ce.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in De.store)
      De.purgeSync(e);
  },
  truncate: (e) => {
    const t = he.basename(e);
    if (t.length <= Yo)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - Yo;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Ru(De.purgeSyncAll);
function Pc(e, t, r = gu) {
  if (Qo(r))
    return Pc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? wu) || -1);
  let s = null, a = null, i = null;
  try {
    const o = Ce.attempt.realpathSync(e), c = !!o;
    e = o || e, [a, s] = De.get(e, r.tmpCreate || De.create, r.tmpPurge !== !1);
    const d = Eu && us(r.chown), u = us(r.mode);
    if (c && (d || u)) {
      const h = Ce.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), u && (r.mode = h.mode));
    }
    if (!c) {
      const h = he.dirname(e);
      Ce.attempt.mkdirSync(h, {
        mode: yu,
        recursive: !0
      });
    }
    i = Ce.retry.openSync(n)(a, "w", r.mode || Xo), r.tmpCreated && r.tmpCreated(a), Qo(t) ? Ce.retry.writeSync(n)(i, t, 0, r.encoding || $u) : us(t) || Ce.retry.writeSync(n)(i, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Ce.retry.fsyncSync(n)(i) : Ce.attempt.fsync(i)), Ce.retry.closeSync(n)(i), i = null, r.chown && (r.chown.uid !== _u || r.chown.gid !== vu) && Ce.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== Xo && Ce.attempt.chmodSync(a, r.mode);
    try {
      Ce.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!bu(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Ce.retry.renameSync(n)(a, De.truncate(e));
    }
    s(), a = null;
  } finally {
    i && Ce.attempt.closeSync(i), a && De.purge(a);
  }
}
function Nc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Rs = { exports: {} }, Rc = {}, dt = {}, Ft = {}, Br = {}, ee = {}, Gr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(S) {
      if (super(), !e.IDENTIFIER.test(S))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = S;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(S) {
      super(), this._items = typeof S == "string" ? [S] : S;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const S = this._items[0];
      return S === "" || S === '""';
    }
    get str() {
      var S;
      return (S = this._str) !== null && S !== void 0 ? S : this._str = this._items.reduce((R, j) => `${R}${j}`, "");
    }
    get names() {
      var S;
      return (S = this._names) !== null && S !== void 0 ? S : this._names = this._items.reduce((R, j) => (j instanceof r && (R[j.str] = (R[j.str] || 0) + 1), R), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...S) {
    const R = [m[0]];
    let j = 0;
    for (; j < S.length; )
      o(R, S[j]), R.push(m[++j]);
    return new n(R);
  }
  e._ = s;
  const a = new n("+");
  function i(m, ...S) {
    const R = [p(m[0])];
    let j = 0;
    for (; j < S.length; )
      R.push(a), o(R, S[j]), R.push(a, p(m[++j]));
    return c(R), new n(R);
  }
  e.str = i;
  function o(m, S) {
    S instanceof n ? m.push(...S._items) : S instanceof r ? m.push(S) : m.push(h(S));
  }
  e.addCodeArg = o;
  function c(m) {
    let S = 1;
    for (; S < m.length - 1; ) {
      if (m[S] === a) {
        const R = d(m[S - 1], m[S + 1]);
        if (R !== void 0) {
          m.splice(S - 1, 3, R);
          continue;
        }
        m[S++] = "+";
      }
      S++;
    }
  }
  function d(m, S) {
    if (S === '""')
      return m;
    if (m === '""')
      return S;
    if (typeof m == "string")
      return S instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof S != "string" ? `${m.slice(0, -1)}${S}"` : S[0] === '"' ? m.slice(0, -1) + S.slice(1) : void 0;
    if (typeof S == "string" && S[0] === '"' && !(m instanceof r))
      return `"${m}${S.slice(1)}`;
  }
  function u(m, S) {
    return S.emptyStr() ? m : m.emptyStr() ? S : i`${m}${S}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : p(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(p(m));
  }
  e.stringify = E;
  function p(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = p;
  function $(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = $;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function v(m) {
    return new n(m.toString());
  }
  e.regexpCode = v;
})(Gr);
var Os = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Gr;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const i = (0, t._)`\n`;
  class o extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const E = this.toName(d), { prefix: p } = E, $ = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[p];
      if (_) {
        const S = _.get($);
        if (S)
          return S;
      } else
        _ = this._values[p] = /* @__PURE__ */ new Map();
      _.set($, E);
      const v = this._scope[p] || (this._scope[p] = []), m = v.length;
      return v[m] = u.ref, E.setValue(u, { property: p, itemIndex: m }), E;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (E) => {
        if (E.value === void 0)
          throw new Error(`CodeGen: name "${E}" has no value`);
        return E.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, E) {
      let p = t.nil;
      for (const $ in d) {
        const _ = d[$];
        if (!_)
          continue;
        const v = h[$] = h[$] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if (v.has(m))
            return;
          v.set(m, n.Started);
          let S = u(m);
          if (S) {
            const R = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            p = (0, t._)`${p}${R} ${m} = ${S};${this.opts._n}`;
          } else if (S = E == null ? void 0 : E(m))
            p = (0, t._)`${p}${S}${this.opts._n}`;
          else
            throw new r(m);
          v.set(m, n.Completed);
        });
      }
      return p;
    }
  }
  e.ValueScope = o;
})(Os);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Gr, r = Os;
  var n = Gr;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Os;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(l, f) {
      return this;
    }
  }
  class i extends a {
    constructor(l, f, P) {
      super(), this.varKind = l, this.name = f, this.rhs = P;
    }
    render({ es5: l, _n: f }) {
      const P = l ? r.varKinds.var : this.varKind, C = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${P} ${this.name}${C};` + f;
    }
    optimizeNames(l, f) {
      if (l[this.name.str])
        return this.rhs && (this.rhs = A(this.rhs, l, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class o extends a {
    constructor(l, f, P) {
      super(), this.lhs = l, this.rhs = f, this.sideEffects = P;
    }
    render({ _n: l }) {
      return `${this.lhs} = ${this.rhs};` + l;
    }
    optimizeNames(l, f) {
      if (!(this.lhs instanceof t.Name && !l[this.lhs.str] && !this.sideEffects))
        return this.rhs = A(this.rhs, l, f), this;
    }
    get names() {
      const l = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return J(l, this.rhs);
    }
  }
  class c extends o {
    constructor(l, f, P, C) {
      super(l, P, C), this.op = f;
    }
    render({ _n: l }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + l;
    }
  }
  class d extends a {
    constructor(l) {
      super(), this.label = l, this.names = {};
    }
    render({ _n: l }) {
      return `${this.label}:` + l;
    }
  }
  class u extends a {
    constructor(l) {
      super(), this.label = l, this.names = {};
    }
    render({ _n: l }) {
      return `break${this.label ? ` ${this.label}` : ""};` + l;
    }
  }
  class h extends a {
    constructor(l) {
      super(), this.error = l;
    }
    render({ _n: l }) {
      return `throw ${this.error};` + l;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(l) {
      super(), this.code = l;
    }
    render({ _n: l }) {
      return `${this.code};` + l;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(l, f) {
      return this.code = A(this.code, l, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class p extends a {
    constructor(l = []) {
      super(), this.nodes = l;
    }
    render(l) {
      return this.nodes.reduce((f, P) => f + P.render(l), "");
    }
    optimizeNodes() {
      const { nodes: l } = this;
      let f = l.length;
      for (; f--; ) {
        const P = l[f].optimizeNodes();
        Array.isArray(P) ? l.splice(f, 1, ...P) : P ? l[f] = P : l.splice(f, 1);
      }
      return l.length > 0 ? this : void 0;
    }
    optimizeNames(l, f) {
      const { nodes: P } = this;
      let C = P.length;
      for (; C--; ) {
        const M = P[C];
        M.optimizeNames(l, f) || (L(l, M.names), P.splice(C, 1));
      }
      return P.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((l, f) => Y(l, f.names), {});
    }
  }
  class $ extends p {
    render(l) {
      return "{" + l._n + super.render(l) + "}" + l._n;
    }
  }
  class _ extends p {
  }
  class v extends $ {
  }
  v.kind = "else";
  class m extends $ {
    constructor(l, f) {
      super(f), this.condition = l;
    }
    render(l) {
      let f = `if(${this.condition})` + super.render(l);
      return this.else && (f += "else " + this.else.render(l)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const l = this.condition;
      if (l === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const P = f.optimizeNodes();
        f = this.else = Array.isArray(P) ? new v(P) : P;
      }
      if (f)
        return l === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(K(l), f instanceof m ? [f] : f.nodes);
      if (!(l === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(l, f) {
      var P;
      if (this.else = (P = this.else) === null || P === void 0 ? void 0 : P.optimizeNames(l, f), !!(super.optimizeNames(l, f) || this.else))
        return this.condition = A(this.condition, l, f), this;
    }
    get names() {
      const l = super.names;
      return J(l, this.condition), this.else && Y(l, this.else.names), l;
    }
  }
  m.kind = "if";
  class S extends $ {
  }
  S.kind = "for";
  class R extends S {
    constructor(l) {
      super(), this.iteration = l;
    }
    render(l) {
      return `for(${this.iteration})` + super.render(l);
    }
    optimizeNames(l, f) {
      if (super.optimizeNames(l, f))
        return this.iteration = A(this.iteration, l, f), this;
    }
    get names() {
      return Y(super.names, this.iteration.names);
    }
  }
  class j extends S {
    constructor(l, f, P, C) {
      super(), this.varKind = l, this.name = f, this.from = P, this.to = C;
    }
    render(l) {
      const f = l.es5 ? r.varKinds.var : this.varKind, { name: P, from: C, to: M } = this;
      return `for(${f} ${P}=${C}; ${P}<${M}; ${P}++)` + super.render(l);
    }
    get names() {
      const l = J(super.names, this.from);
      return J(l, this.to);
    }
  }
  class T extends S {
    constructor(l, f, P, C) {
      super(), this.loop = l, this.varKind = f, this.name = P, this.iterable = C;
    }
    render(l) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(l);
    }
    optimizeNames(l, f) {
      if (super.optimizeNames(l, f))
        return this.iterable = A(this.iterable, l, f), this;
    }
    get names() {
      return Y(super.names, this.iterable.names);
    }
  }
  class B extends $ {
    constructor(l, f, P) {
      super(), this.name = l, this.args = f, this.async = P;
    }
    render(l) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(l);
    }
  }
  B.kind = "func";
  class X extends p {
    render(l) {
      return "return " + super.render(l);
    }
  }
  X.kind = "return";
  class le extends $ {
    render(l) {
      let f = "try" + super.render(l);
      return this.catch && (f += this.catch.render(l)), this.finally && (f += this.finally.render(l)), f;
    }
    optimizeNodes() {
      var l, f;
      return super.optimizeNodes(), (l = this.catch) === null || l === void 0 || l.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(l, f) {
      var P, C;
      return super.optimizeNames(l, f), (P = this.catch) === null || P === void 0 || P.optimizeNames(l, f), (C = this.finally) === null || C === void 0 || C.optimizeNames(l, f), this;
    }
    get names() {
      const l = super.names;
      return this.catch && Y(l, this.catch.names), this.finally && Y(l, this.finally.names), l;
    }
  }
  class ue extends $ {
    constructor(l) {
      super(), this.error = l;
    }
    render(l) {
      return `catch(${this.error})` + super.render(l);
    }
  }
  ue.kind = "catch";
  class me extends $ {
    render(l) {
      return "finally" + super.render(l);
    }
  }
  me.kind = "finally";
  class U {
    constructor(l, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = l, this._scope = new r.Scope({ parent: l }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(l) {
      return this._scope.name(l);
    }
    // reserves unique name in the external scope
    scopeName(l) {
      return this._extScope.name(l);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(l, f) {
      const P = this._extScope.value(l, f);
      return (this._values[P.prefix] || (this._values[P.prefix] = /* @__PURE__ */ new Set())).add(P), P;
    }
    getScopeValue(l, f) {
      return this._extScope.getValue(l, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(l) {
      return this._extScope.scopeRefs(l, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(l, f, P, C) {
      const M = this._scope.toName(f);
      return P !== void 0 && C && (this._constants[M.str] = P), this._leafNode(new i(l, M, P)), M;
    }
    // `const` declaration (`var` in es5 mode)
    const(l, f, P) {
      return this._def(r.varKinds.const, l, f, P);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(l, f, P) {
      return this._def(r.varKinds.let, l, f, P);
    }
    // `var` declaration with optional assignment
    var(l, f, P) {
      return this._def(r.varKinds.var, l, f, P);
    }
    // assignment code
    assign(l, f, P) {
      return this._leafNode(new o(l, f, P));
    }
    // `+=` code
    add(l, f) {
      return this._leafNode(new c(l, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(l) {
      return typeof l == "function" ? l() : l !== t.nil && this._leafNode(new E(l)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...l) {
      const f = ["{"];
      for (const [P, C] of l)
        f.length > 1 && f.push(","), f.push(P), (P !== C || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, C));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(l, f, P) {
      if (this._blockNode(new m(l)), f && P)
        this.code(f).else().code(P).endIf();
      else if (f)
        this.code(f).endIf();
      else if (P)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(l) {
      return this._elseNode(new m(l));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new v());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, v);
    }
    _for(l, f) {
      return this._blockNode(l), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(l, f) {
      return this._for(new R(l), f);
    }
    // `for` statement for a range of values
    forRange(l, f, P, C, M = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const W = this._scope.toName(l);
      return this._for(new j(M, W, f, P), () => C(W));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(l, f, P, C = r.varKinds.const) {
      const M = this._scope.toName(l);
      if (this.opts.es5) {
        const W = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${W}.length`, (G) => {
          this.var(M, (0, t._)`${W}[${G}]`), P(M);
        });
      }
      return this._for(new T("of", C, M, f), () => P(M));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(l, f, P, C = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(l, (0, t._)`Object.keys(${f})`, P);
      const M = this._scope.toName(l);
      return this._for(new T("in", C, M, f), () => P(M));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(S);
    }
    // `label` statement
    label(l) {
      return this._leafNode(new d(l));
    }
    // `break` statement
    break(l) {
      return this._leafNode(new u(l));
    }
    // `return` statement
    return(l) {
      const f = new X();
      if (this._blockNode(f), this.code(l), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(X);
    }
    // `try` statement
    try(l, f, P) {
      if (!f && !P)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const C = new le();
      if (this._blockNode(C), this.code(l), f) {
        const M = this.name("e");
        this._currNode = C.catch = new ue(M), f(M);
      }
      return P && (this._currNode = C.finally = new me(), this.code(P)), this._endBlockNode(ue, me);
    }
    // `throw` statement
    throw(l) {
      return this._leafNode(new h(l));
    }
    // start self-balancing block
    block(l, f) {
      return this._blockStarts.push(this._nodes.length), l && this.code(l).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(l) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const P = this._nodes.length - f;
      if (P < 0 || l !== void 0 && P !== l)
        throw new Error(`CodeGen: wrong number of nodes: ${P} vs ${l} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(l, f = t.nil, P, C) {
      return this._blockNode(new B(l, f, P)), C && this.code(C).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(B);
    }
    optimize(l = 1) {
      for (; l-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(l) {
      return this._currNode.nodes.push(l), this;
    }
    _blockNode(l) {
      this._currNode.nodes.push(l), this._nodes.push(l);
    }
    _endBlockNode(l, f) {
      const P = this._currNode;
      if (P instanceof l || f && P instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${l.kind}/${f.kind}` : l.kind}"`);
    }
    _elseNode(l) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = l, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const l = this._nodes;
      return l[l.length - 1];
    }
    set _currNode(l) {
      const f = this._nodes;
      f[f.length - 1] = l;
    }
  }
  e.CodeGen = U;
  function Y(w, l) {
    for (const f in l)
      w[f] = (w[f] || 0) + (l[f] || 0);
    return w;
  }
  function J(w, l) {
    return l instanceof t._CodeOrName ? Y(w, l.names) : w;
  }
  function A(w, l, f) {
    if (w instanceof t.Name)
      return P(w);
    if (!C(w))
      return w;
    return new t._Code(w._items.reduce((M, W) => (W instanceof t.Name && (W = P(W)), W instanceof t._Code ? M.push(...W._items) : M.push(W), M), []));
    function P(M) {
      const W = f[M.str];
      return W === void 0 || l[M.str] !== 1 ? M : (delete l[M.str], W);
    }
    function C(M) {
      return M instanceof t._Code && M._items.some((W) => W instanceof t.Name && l[W.str] === 1 && f[W.str] !== void 0);
    }
  }
  function L(w, l) {
    for (const f in l)
      w[f] = (w[f] || 0) - (l[f] || 0);
  }
  function K(w) {
    return typeof w == "boolean" || typeof w == "number" || w === null ? !w : (0, t._)`!${N(w)}`;
  }
  e.not = K;
  const F = g(e.operators.AND);
  function Q(...w) {
    return w.reduce(F);
  }
  e.and = Q;
  const q = g(e.operators.OR);
  function I(...w) {
    return w.reduce(q);
  }
  e.or = I;
  function g(w) {
    return (l, f) => l === t.nil ? f : f === t.nil ? l : (0, t._)`${N(l)} ${w} ${N(f)}`;
  }
  function N(w) {
    return w instanceof t.Name ? w : (0, t._)`(${w})`;
  }
})(ee);
var z = {};
Object.defineProperty(z, "__esModule", { value: !0 });
z.checkStrictMode = z.getErrorPath = z.Type = z.useFunc = z.setEvaluated = z.evaluatedPropsToName = z.mergeEvaluated = z.eachItem = z.unescapeJsonPointer = z.escapeJsonPointer = z.escapeFragment = z.unescapeFragment = z.schemaRefOrVal = z.schemaHasRulesButRef = z.schemaHasRules = z.checkUnknownRules = z.alwaysValidSchema = z.toHash = void 0;
const pe = ee, Ou = Gr;
function Iu(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
z.toHash = Iu;
function ju(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Oc(e, t), !Ic(t, e.self.RULES.all));
}
z.alwaysValidSchema = ju;
function Oc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || Tc(e, `unknown keyword: "${a}"`);
}
z.checkUnknownRules = Oc;
function Ic(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
z.schemaHasRules = Ic;
function ku(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
z.schemaHasRulesButRef = ku;
function Tu({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, pe._)`${r}`;
  }
  return (0, pe._)`${e}${t}${(0, pe.getProperty)(n)}`;
}
z.schemaRefOrVal = Tu;
function Au(e) {
  return jc(decodeURIComponent(e));
}
z.unescapeFragment = Au;
function Cu(e) {
  return encodeURIComponent(Qs(e));
}
z.escapeFragment = Cu;
function Qs(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
z.escapeJsonPointer = Qs;
function jc(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
z.unescapeJsonPointer = jc;
function Du(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
z.eachItem = Du;
function Zo({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, i, o) => {
    const c = i === void 0 ? a : i instanceof pe.Name ? (a instanceof pe.Name ? e(s, a, i) : t(s, a, i), i) : a instanceof pe.Name ? (t(s, i, a), a) : r(a, i);
    return o === pe.Name && !(c instanceof pe.Name) ? n(s, c) : c;
  };
}
z.mergeEvaluated = {
  props: Zo({
    mergeNames: (e, t, r) => e.if((0, pe._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, pe._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, pe._)`${r} || {}`).code((0, pe._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, pe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, pe._)`${r} || {}`), Zs(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: kc
  }),
  items: Zo({
    mergeNames: (e, t, r) => e.if((0, pe._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, pe._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, pe._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, pe._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function kc(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, pe._)`{}`);
  return t !== void 0 && Zs(e, r, t), r;
}
z.evaluatedPropsToName = kc;
function Zs(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, pe._)`${t}${(0, pe.getProperty)(n)}`, !0));
}
z.setEvaluated = Zs;
const xo = {};
function Mu(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: xo[t.code] || (xo[t.code] = new Ou._Code(t.code))
  });
}
z.useFunc = Mu;
var Is;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Is || (z.Type = Is = {}));
function Lu(e, t, r) {
  if (e instanceof pe.Name) {
    const n = t === Is.Num;
    return r ? n ? (0, pe._)`"[" + ${e} + "]"` : (0, pe._)`"['" + ${e} + "']"` : n ? (0, pe._)`"/" + ${e}` : (0, pe._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, pe.getProperty)(e).toString() : "/" + Qs(e);
}
z.getErrorPath = Lu;
function Tc(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
z.checkStrictMode = Tc;
var Zr = {}, ei;
function st() {
  if (ei) return Zr;
  ei = 1, Object.defineProperty(Zr, "__esModule", { value: !0 });
  const e = ee, t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return Zr.default = t, Zr;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ee, r = z, n = st();
  e.keywordError = {
    message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: v, schemaType: m }) => m ? (0, t.str)`"${v}" keyword must be ${m} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
  };
  function s(v, m = e.keywordError, S, R) {
    const { it: j } = v, { gen: T, compositeRule: B, allErrors: X } = j, le = h(v, m, S);
    R ?? (B || X) ? c(T, le) : d(j, (0, t._)`[${le}]`);
  }
  e.reportError = s;
  function a(v, m = e.keywordError, S) {
    const { it: R } = v, { gen: j, compositeRule: T, allErrors: B } = R, X = h(v, m, S);
    c(j, X), T || B || d(R, n.default.vErrors);
  }
  e.reportExtraError = a;
  function i(v, m) {
    v.assign(n.default.errors, m), v.if((0, t._)`${n.default.vErrors} !== null`, () => v.if(m, () => v.assign((0, t._)`${n.default.vErrors}.length`, m), () => v.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = i;
  function o({ gen: v, keyword: m, schemaValue: S, data: R, errsCount: j, it: T }) {
    if (j === void 0)
      throw new Error("ajv implementation error");
    const B = v.name("err");
    v.forRange("i", j, n.default.errors, (X) => {
      v.const(B, (0, t._)`${n.default.vErrors}[${X}]`), v.if((0, t._)`${B}.instancePath === undefined`, () => v.assign((0, t._)`${B}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), v.assign((0, t._)`${B}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && (v.assign((0, t._)`${B}.schema`, S), v.assign((0, t._)`${B}.data`, R));
    });
  }
  e.extendErrors = o;
  function c(v, m) {
    const S = v.const("err", m);
    v.if((0, t._)`${n.default.vErrors} === null`, () => v.assign(n.default.vErrors, (0, t._)`[${S}]`), (0, t._)`${n.default.vErrors}.push(${S})`), v.code((0, t._)`${n.default.errors}++`);
  }
  function d(v, m) {
    const { gen: S, validateName: R, schemaEnv: j } = v;
    j.$async ? S.throw((0, t._)`new ${v.ValidationError}(${m})`) : (S.assign((0, t._)`${R}.errors`, m), S.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(v, m, S) {
    const { createErrors: R } = v.it;
    return R === !1 ? (0, t._)`{}` : E(v, m, S);
  }
  function E(v, m, S = {}) {
    const { gen: R, it: j } = v, T = [
      p(j, S),
      $(v, S)
    ];
    return _(v, m, T), R.object(...T);
  }
  function p({ errorPath: v }, { instancePath: m }) {
    const S = m ? (0, t.str)`${v}${(0, r.getErrorPath)(m, r.Type.Str)}` : v;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, S)];
  }
  function $({ keyword: v, it: { errSchemaPath: m } }, { schemaPath: S, parentSchema: R }) {
    let j = R ? m : (0, t.str)`${m}/${v}`;
    return S && (j = (0, t.str)`${j}${(0, r.getErrorPath)(S, r.Type.Str)}`), [u.schemaPath, j];
  }
  function _(v, { params: m, message: S }, R) {
    const { keyword: j, data: T, schemaValue: B, it: X } = v, { opts: le, propertyName: ue, topSchemaRef: me, schemaPath: U } = X;
    R.push([u.keyword, j], [u.params, typeof m == "function" ? m(v) : m || (0, t._)`{}`]), le.messages && R.push([u.message, typeof S == "function" ? S(v) : S]), le.verbose && R.push([u.schema, B], [u.parentSchema, (0, t._)`${me}${U}`], [n.default.data, T]), ue && R.push([u.propertyName, ue]);
  }
})(Br);
var ti;
function Vu() {
  if (ti) return Ft;
  ti = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.boolOrEmptySchema = Ft.topBoolOrEmptySchema = void 0;
  const e = Br, t = ee, r = st(), n = {
    message: "boolean schema is false"
  };
  function s(o) {
    const { gen: c, schema: d, validateName: u } = o;
    d === !1 ? i(o, !1) : typeof d == "object" && d.$async === !0 ? c.return(r.default.data) : (c.assign((0, t._)`${u}.errors`, null), c.return(!0));
  }
  Ft.topBoolOrEmptySchema = s;
  function a(o, c) {
    const { gen: d, schema: u } = o;
    u === !1 ? (d.var(c, !1), i(o)) : d.var(c, !0);
  }
  Ft.boolOrEmptySchema = a;
  function i(o, c) {
    const { gen: d, data: u } = o, h = {
      gen: d,
      keyword: "false schema",
      data: u,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: o
    };
    (0, e.reportError)(h, n, void 0, c);
  }
  return Ft;
}
var Pe = {}, Xt = {};
Object.defineProperty(Xt, "__esModule", { value: !0 });
Xt.getRules = Xt.isJSONType = void 0;
const Fu = ["string", "number", "integer", "boolean", "null", "object", "array"], zu = new Set(Fu);
function Uu(e) {
  return typeof e == "string" && zu.has(e);
}
Xt.isJSONType = Uu;
function qu() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Xt.getRules = qu;
var yt = {};
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.shouldUseRule = yt.shouldUseGroup = yt.schemaHasRulesForType = void 0;
function Ku({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Ac(e, n);
}
yt.schemaHasRulesForType = Ku;
function Ac(e, t) {
  return t.rules.some((r) => Cc(e, r));
}
yt.shouldUseGroup = Ac;
function Cc(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
yt.shouldUseRule = Cc;
Object.defineProperty(Pe, "__esModule", { value: !0 });
Pe.reportTypeError = Pe.checkDataTypes = Pe.checkDataType = Pe.coerceAndCheckDataType = Pe.getJSONTypes = Pe.getSchemaTypes = Pe.DataType = void 0;
const Gu = Xt, Hu = yt, Bu = Br, te = ee, Dc = z;
var or;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(or || (Pe.DataType = or = {}));
function Ju(e) {
  const t = Mc(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
Pe.getSchemaTypes = Ju;
function Mc(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Gu.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Pe.getJSONTypes = Mc;
function Wu(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Xu(t, s.coerceTypes), i = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Hu.schemaHasRulesForType)(e, t[0]));
  if (i) {
    const o = xs(t, n, s.strictNumbers, or.Wrong);
    r.if(o, () => {
      a.length ? Yu(e, t, a) : ea(e);
    });
  }
  return i;
}
Pe.coerceAndCheckDataType = Wu;
const Lc = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Xu(e, t) {
  return t ? e.filter((r) => Lc.has(r) || t === "array" && r === "array") : [];
}
function Yu(e, t, r) {
  const { gen: n, data: s, opts: a } = e, i = n.let("dataType", (0, te._)`typeof ${s}`), o = n.let("coerced", (0, te._)`undefined`);
  a.coerceTypes === "array" && n.if((0, te._)`${i} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, te._)`${s}[0]`).assign(i, (0, te._)`typeof ${s}`).if(xs(t, s, a.strictNumbers), () => n.assign(o, s))), n.if((0, te._)`${o} !== undefined`);
  for (const d of r)
    (Lc.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), ea(e), n.endIf(), n.if((0, te._)`${o} !== undefined`, () => {
    n.assign(s, o), Qu(e, o);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, te._)`${i} == "number" || ${i} == "boolean"`).assign(o, (0, te._)`"" + ${s}`).elseIf((0, te._)`${s} === null`).assign(o, (0, te._)`""`);
        return;
      case "number":
        n.elseIf((0, te._)`${i} == "boolean" || ${s} === null
              || (${i} == "string" && ${s} && ${s} == +${s})`).assign(o, (0, te._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, te._)`${i} === "boolean" || ${s} === null
              || (${i} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(o, (0, te._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, te._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(o, !1).elseIf((0, te._)`${s} === "true" || ${s} === 1`).assign(o, !0);
        return;
      case "null":
        n.elseIf((0, te._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(o, null);
        return;
      case "array":
        n.elseIf((0, te._)`${i} === "string" || ${i} === "number"
              || ${i} === "boolean" || ${s} === null`).assign(o, (0, te._)`[${s}]`);
    }
  }
}
function Qu({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, te._)`${t} !== undefined`, () => e.assign((0, te._)`${t}[${r}]`, n));
}
function js(e, t, r, n = or.Correct) {
  const s = n === or.Correct ? te.operators.EQ : te.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, te._)`${t} ${s} null`;
    case "array":
      a = (0, te._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, te._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = i((0, te._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = i();
      break;
    default:
      return (0, te._)`typeof ${t} ${s} ${e}`;
  }
  return n === or.Correct ? a : (0, te.not)(a);
  function i(o = te.nil) {
    return (0, te.and)((0, te._)`typeof ${t} == "number"`, o, r ? (0, te._)`isFinite(${t})` : te.nil);
  }
}
Pe.checkDataType = js;
function xs(e, t, r, n) {
  if (e.length === 1)
    return js(e[0], t, r, n);
  let s;
  const a = (0, Dc.toHash)(e);
  if (a.array && a.object) {
    const i = (0, te._)`typeof ${t} != "object"`;
    s = a.null ? i : (0, te._)`!${t} || ${i}`, delete a.null, delete a.array, delete a.object;
  } else
    s = te.nil;
  a.number && delete a.integer;
  for (const i in a)
    s = (0, te.and)(s, js(i, t, r, n));
  return s;
}
Pe.checkDataTypes = xs;
const Zu = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, te._)`{type: ${e}}` : (0, te._)`{type: ${t}}`
};
function ea(e) {
  const t = xu(e);
  (0, Bu.reportError)(t, Zu);
}
Pe.reportTypeError = ea;
function xu(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Dc.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var Rr = {}, ri;
function ed() {
  if (ri) return Rr;
  ri = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.assignDefaults = void 0;
  const e = ee, t = z;
  function r(s, a) {
    const { properties: i, items: o } = s.schema;
    if (a === "object" && i)
      for (const c in i)
        n(s, c, i[c].default);
    else a === "array" && Array.isArray(o) && o.forEach((c, d) => n(s, d, c.default));
  }
  Rr.assignDefaults = r;
  function n(s, a, i) {
    const { gen: o, compositeRule: c, data: d, opts: u } = s;
    if (i === void 0)
      return;
    const h = (0, e._)`${d}${(0, e.getProperty)(a)}`;
    if (c) {
      (0, t.checkStrictMode)(s, `default is ignored for: ${h}`);
      return;
    }
    let E = (0, e._)`${h} === undefined`;
    u.useDefaults === "empty" && (E = (0, e._)`${E} || ${h} === null || ${h} === ""`), o.if(E, (0, e._)`${h} = ${(0, e.stringify)(i)}`);
  }
  return Rr;
}
var We = {}, ae = {};
Object.defineProperty(ae, "__esModule", { value: !0 });
ae.validateUnion = ae.validateArray = ae.usePattern = ae.callValidateCode = ae.schemaProperties = ae.allSchemaProperties = ae.noPropertyInData = ae.propertyInData = ae.isOwnProperty = ae.hasPropFunc = ae.reportMissingProp = ae.checkMissingProp = ae.checkReportMissingProp = void 0;
const ge = ee, ta = z, St = st(), td = z;
function rd(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(na(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ge._)`${t}` }, !0), e.error();
  });
}
ae.checkReportMissingProp = rd;
function nd({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ge.or)(...n.map((a) => (0, ge.and)(na(e, t, a, r.ownProperties), (0, ge._)`${s} = ${a}`)));
}
ae.checkMissingProp = nd;
function sd(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ae.reportMissingProp = sd;
function Vc(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ge._)`Object.prototype.hasOwnProperty`
  });
}
ae.hasPropFunc = Vc;
function ra(e, t, r) {
  return (0, ge._)`${Vc(e)}.call(${t}, ${r})`;
}
ae.isOwnProperty = ra;
function ad(e, t, r, n) {
  const s = (0, ge._)`${t}${(0, ge.getProperty)(r)} !== undefined`;
  return n ? (0, ge._)`${s} && ${ra(e, t, r)}` : s;
}
ae.propertyInData = ad;
function na(e, t, r, n) {
  const s = (0, ge._)`${t}${(0, ge.getProperty)(r)} === undefined`;
  return n ? (0, ge.or)(s, (0, ge.not)(ra(e, t, r))) : s;
}
ae.noPropertyInData = na;
function Fc(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ae.allSchemaProperties = Fc;
function od(e, t) {
  return Fc(t).filter((r) => !(0, ta.alwaysValidSchema)(e, t[r]));
}
ae.schemaProperties = od;
function id({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: i }, o, c, d) {
  const u = d ? (0, ge._)`${e}, ${t}, ${n}${s}` : t, h = [
    [St.default.instancePath, (0, ge.strConcat)(St.default.instancePath, a)],
    [St.default.parentData, i.parentData],
    [St.default.parentDataProperty, i.parentDataProperty],
    [St.default.rootData, St.default.rootData]
  ];
  i.opts.dynamicRef && h.push([St.default.dynamicAnchors, St.default.dynamicAnchors]);
  const E = (0, ge._)`${u}, ${r.object(...h)}`;
  return c !== ge.nil ? (0, ge._)`${o}.call(${c}, ${E})` : (0, ge._)`${o}(${E})`;
}
ae.callValidateCode = id;
const cd = (0, ge._)`new RegExp`;
function ld({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ge._)`${s.code === "new RegExp" ? cd : (0, td.useFunc)(e, s)}(${r}, ${n})`
  });
}
ae.usePattern = ld;
function ud(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const o = t.let("valid", !0);
    return i(() => t.assign(o, !1)), o;
  }
  return t.var(a, !0), i(() => t.break()), a;
  function i(o) {
    const c = t.const("len", (0, ge._)`${r}.length`);
    t.forRange("i", 0, c, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: ta.Type.Num
      }, a), t.if((0, ge.not)(a), o);
    });
  }
}
ae.validateArray = ud;
function dd(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, ta.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const i = t.let("valid", !1), o = t.name("_valid");
  t.block(() => r.forEach((c, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, o);
    t.assign(i, (0, ge._)`${i} || ${o}`), e.mergeValidEvaluated(u, o) || t.if((0, ge.not)(i));
  })), e.result(i, () => e.reset(), () => e.error(!0));
}
ae.validateUnion = dd;
var ni;
function fd() {
  if (ni) return We;
  ni = 1, Object.defineProperty(We, "__esModule", { value: !0 }), We.validateKeywordUsage = We.validSchemaType = We.funcKeywordCode = We.macroKeywordCode = void 0;
  const e = ee, t = st(), r = ae, n = Br;
  function s(E, p) {
    const { gen: $, keyword: _, schema: v, parentSchema: m, it: S } = E, R = p.macro.call(S.self, v, m, S), j = d($, _, R);
    S.opts.validateSchema !== !1 && S.self.validateSchema(R, !0);
    const T = $.name("valid");
    E.subschema({
      schema: R,
      schemaPath: e.nil,
      errSchemaPath: `${S.errSchemaPath}/${_}`,
      topSchemaRef: j,
      compositeRule: !0
    }, T), E.pass(T, () => E.error(!0));
  }
  We.macroKeywordCode = s;
  function a(E, p) {
    var $;
    const { gen: _, keyword: v, schema: m, parentSchema: S, $data: R, it: j } = E;
    c(j, p);
    const T = !R && p.compile ? p.compile.call(j.self, m, S, j) : p.validate, B = d(_, v, T), X = _.let("valid");
    E.block$data(X, le), E.ok(($ = p.valid) !== null && $ !== void 0 ? $ : X);
    function le() {
      if (p.errors === !1)
        U(), p.modifying && i(E), Y(() => E.error());
      else {
        const J = p.async ? ue() : me();
        p.modifying && i(E), Y(() => o(E, J));
      }
    }
    function ue() {
      const J = _.let("ruleErrs", null);
      return _.try(() => U((0, e._)`await `), (A) => _.assign(X, !1).if((0, e._)`${A} instanceof ${j.ValidationError}`, () => _.assign(J, (0, e._)`${A}.errors`), () => _.throw(A))), J;
    }
    function me() {
      const J = (0, e._)`${B}.errors`;
      return _.assign(J, null), U(e.nil), J;
    }
    function U(J = p.async ? (0, e._)`await ` : e.nil) {
      const A = j.opts.passContext ? t.default.this : t.default.self, L = !("compile" in p && !R || p.schema === !1);
      _.assign(X, (0, e._)`${J}${(0, r.callValidateCode)(E, B, A, L)}`, p.modifying);
    }
    function Y(J) {
      var A;
      _.if((0, e.not)((A = p.valid) !== null && A !== void 0 ? A : X), J);
    }
  }
  We.funcKeywordCode = a;
  function i(E) {
    const { gen: p, data: $, it: _ } = E;
    p.if(_.parentData, () => p.assign($, (0, e._)`${_.parentData}[${_.parentDataProperty}]`));
  }
  function o(E, p) {
    const { gen: $ } = E;
    $.if((0, e._)`Array.isArray(${p})`, () => {
      $.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${p} : ${t.default.vErrors}.concat(${p})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(E);
    }, () => E.error());
  }
  function c({ schemaEnv: E }, p) {
    if (p.async && !E.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(E, p, $) {
    if ($ === void 0)
      throw new Error(`keyword "${p}" failed to compile`);
    return E.scopeValue("keyword", typeof $ == "function" ? { ref: $ } : { ref: $, code: (0, e.stringify)($) });
  }
  function u(E, p, $ = !1) {
    return !p.length || p.some((_) => _ === "array" ? Array.isArray(E) : _ === "object" ? E && typeof E == "object" && !Array.isArray(E) : typeof E == _ || $ && typeof E > "u");
  }
  We.validSchemaType = u;
  function h({ schema: E, opts: p, self: $, errSchemaPath: _ }, v, m) {
    if (Array.isArray(v.keyword) ? !v.keyword.includes(m) : v.keyword !== m)
      throw new Error("ajv implementation error");
    const S = v.dependencies;
    if (S != null && S.some((R) => !Object.prototype.hasOwnProperty.call(E, R)))
      throw new Error(`parent schema must have dependencies of ${m}: ${S.join(",")}`);
    if (v.validateSchema && !v.validateSchema(E[m])) {
      const j = `keyword "${m}" value is invalid at path "${_}": ` + $.errorsText(v.validateSchema.errors);
      if (p.validateSchema === "log")
        $.logger.error(j);
      else
        throw new Error(j);
    }
  }
  return We.validateKeywordUsage = h, We;
}
var ft = {}, si;
function hd() {
  if (si) return ft;
  si = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.extendSubschemaMode = ft.extendSubschemaData = ft.getSubschema = void 0;
  const e = ee, t = z;
  function r(a, { keyword: i, schemaProp: o, schema: c, schemaPath: d, errSchemaPath: u, topSchemaRef: h }) {
    if (i !== void 0 && c !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const E = a.schema[i];
      return o === void 0 ? {
        schema: E,
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${a.errSchemaPath}/${i}`
      } : {
        schema: E[o],
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${i}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (c !== void 0) {
      if (d === void 0 || u === void 0 || h === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: c,
        schemaPath: d,
        topSchemaRef: h,
        errSchemaPath: u
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  ft.getSubschema = r;
  function n(a, i, { dataProp: o, dataPropType: c, data: d, dataTypes: u, propertyName: h }) {
    if (d !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: E } = i;
    if (o !== void 0) {
      const { errorPath: $, dataPathArr: _, opts: v } = i, m = E.let("data", (0, e._)`${i.data}${(0, e.getProperty)(o)}`, !0);
      p(m), a.errorPath = (0, e.str)`${$}${(0, t.getErrorPath)(o, c, v.jsPropertySyntax)}`, a.parentDataProperty = (0, e._)`${o}`, a.dataPathArr = [..._, a.parentDataProperty];
    }
    if (d !== void 0) {
      const $ = d instanceof e.Name ? d : E.let("data", d, !0);
      p($), h !== void 0 && (a.propertyName = h);
    }
    u && (a.dataTypes = u);
    function p($) {
      a.data = $, a.dataLevel = i.dataLevel + 1, a.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), a.parentData = i.data, a.dataNames = [...i.dataNames, $];
    }
  }
  ft.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: i, jtdMetadata: o, compositeRule: c, createErrors: d, allErrors: u }) {
    c !== void 0 && (a.compositeRule = c), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = i, a.jtdMetadata = o;
  }
  return ft.extendSubschemaMode = s, ft;
}
var je = {}, Gn = function e(t, r) {
  if (t === r) return !0;
  if (t && r && typeof t == "object" && typeof r == "object") {
    if (t.constructor !== r.constructor) return !1;
    var n, s, a;
    if (Array.isArray(t)) {
      if (n = t.length, n != r.length) return !1;
      for (s = n; s-- !== 0; )
        if (!e(t[s], r[s])) return !1;
      return !0;
    }
    if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
    if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
    if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
    if (a = Object.keys(t), n = a.length, n !== Object.keys(r).length) return !1;
    for (s = n; s-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(r, a[s])) return !1;
    for (s = n; s-- !== 0; ) {
      var i = a[s];
      if (!e(t[i], r[i])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, zc = { exports: {} }, kt = zc.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  _n(t, n, s, e, "", e);
};
kt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
kt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
kt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
kt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function _n(e, t, r, n, s, a, i, o, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, i, o, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in kt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            _n(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in kt.propsKeywords) {
        if (h && typeof h == "object")
          for (var p in h)
            _n(e, t, r, h[p], s + "/" + u + "/" + md(p), a, s, u, n, p);
      } else (u in kt.keywords || e.allKeys && !(u in kt.skipKeywords)) && _n(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, i, o, c, d);
  }
}
function md(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var pd = zc.exports;
Object.defineProperty(je, "__esModule", { value: !0 });
je.getSchemaRefs = je.resolveUrl = je.normalizeId = je._getFullPath = je.getFullPath = je.inlineRef = void 0;
const $d = z, yd = Gn, gd = pd, _d = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function vd(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !ks(e) : t ? Uc(e) <= t : !1;
}
je.inlineRef = vd;
const wd = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function ks(e) {
  for (const t in e) {
    if (wd.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(ks) || typeof r == "object" && ks(r))
      return !0;
  }
  return !1;
}
function Uc(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !_d.has(r) && (typeof e[r] == "object" && (0, $d.eachItem)(e[r], (n) => t += Uc(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function qc(e, t = "", r) {
  r !== !1 && (t = ir(t));
  const n = e.parse(t);
  return Kc(e, n);
}
je.getFullPath = qc;
function Kc(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
je._getFullPath = Kc;
const Ed = /#\/?$/;
function ir(e) {
  return e ? e.replace(Ed, "") : "";
}
je.normalizeId = ir;
function bd(e, t, r) {
  return r = ir(r), e.resolve(t, r);
}
je.resolveUrl = bd;
const Sd = /^[a-z_][-a-z0-9._]*$/i;
function Pd(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = ir(e[r] || t), a = { "": s }, i = qc(n, s, !1), o = {}, c = /* @__PURE__ */ new Set();
  return gd(e, { allKeys: !0 }, (h, E, p, $) => {
    if ($ === void 0)
      return;
    const _ = i + E;
    let v = a[$];
    typeof h[r] == "string" && (v = m.call(this, h[r])), S.call(this, h.$anchor), S.call(this, h.$dynamicAnchor), a[E] = v;
    function m(R) {
      const j = this.opts.uriResolver.resolve;
      if (R = ir(v ? j(v, R) : R), c.has(R))
        throw u(R);
      c.add(R);
      let T = this.refs[R];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, R) : R !== ir(_) && (R[0] === "#" ? (d(h, o[R], R), o[R] = h) : this.refs[R] = _), R;
    }
    function S(R) {
      if (typeof R == "string") {
        if (!Sd.test(R))
          throw new Error(`invalid anchor "${R}"`);
        m.call(this, `#${R}`);
      }
    }
  }), o;
  function d(h, E, p) {
    if (E !== void 0 && !yd(h, E))
      throw u(p);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
je.getSchemaRefs = Pd;
var ai;
function Hn() {
  if (ai) return dt;
  ai = 1, Object.defineProperty(dt, "__esModule", { value: !0 }), dt.getData = dt.KeywordCxt = dt.validateFunctionCode = void 0;
  const e = Vu(), t = Pe, r = yt, n = Pe, s = ed(), a = fd(), i = hd(), o = ee, c = st(), d = je, u = z, h = Br;
  function E(y) {
    if (T(y) && (X(y), j(y))) {
      v(y);
      return;
    }
    p(y, () => (0, e.topBoolOrEmptySchema)(y));
  }
  dt.validateFunctionCode = E;
  function p({ gen: y, validateName: b, schema: O, schemaEnv: k, opts: D }, V) {
    D.code.es5 ? y.func(b, (0, o._)`${c.default.data}, ${c.default.valCxt}`, k.$async, () => {
      y.code((0, o._)`"use strict"; ${S(O, D)}`), _(y, D), y.code(V);
    }) : y.func(b, (0, o._)`${c.default.data}, ${$(D)}`, k.$async, () => y.code(S(O, D)).code(V));
  }
  function $(y) {
    return (0, o._)`{${c.default.instancePath}="", ${c.default.parentData}, ${c.default.parentDataProperty}, ${c.default.rootData}=${c.default.data}${y.dynamicRef ? (0, o._)`, ${c.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function _(y, b) {
    y.if(c.default.valCxt, () => {
      y.var(c.default.instancePath, (0, o._)`${c.default.valCxt}.${c.default.instancePath}`), y.var(c.default.parentData, (0, o._)`${c.default.valCxt}.${c.default.parentData}`), y.var(c.default.parentDataProperty, (0, o._)`${c.default.valCxt}.${c.default.parentDataProperty}`), y.var(c.default.rootData, (0, o._)`${c.default.valCxt}.${c.default.rootData}`), b.dynamicRef && y.var(c.default.dynamicAnchors, (0, o._)`${c.default.valCxt}.${c.default.dynamicAnchors}`);
    }, () => {
      y.var(c.default.instancePath, (0, o._)`""`), y.var(c.default.parentData, (0, o._)`undefined`), y.var(c.default.parentDataProperty, (0, o._)`undefined`), y.var(c.default.rootData, c.default.data), b.dynamicRef && y.var(c.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function v(y) {
    const { schema: b, opts: O, gen: k } = y;
    p(y, () => {
      O.$comment && b.$comment && J(y), me(y), k.let(c.default.vErrors, null), k.let(c.default.errors, 0), O.unevaluated && m(y), le(y), A(y);
    });
  }
  function m(y) {
    const { gen: b, validateName: O } = y;
    y.evaluated = b.const("evaluated", (0, o._)`${O}.evaluated`), b.if((0, o._)`${y.evaluated}.dynamicProps`, () => b.assign((0, o._)`${y.evaluated}.props`, (0, o._)`undefined`)), b.if((0, o._)`${y.evaluated}.dynamicItems`, () => b.assign((0, o._)`${y.evaluated}.items`, (0, o._)`undefined`));
  }
  function S(y, b) {
    const O = typeof y == "object" && y[b.schemaId];
    return O && (b.code.source || b.code.process) ? (0, o._)`/*# sourceURL=${O} */` : o.nil;
  }
  function R(y, b) {
    if (T(y) && (X(y), j(y))) {
      B(y, b);
      return;
    }
    (0, e.boolOrEmptySchema)(y, b);
  }
  function j({ schema: y, self: b }) {
    if (typeof y == "boolean")
      return !y;
    for (const O in y)
      if (b.RULES.all[O])
        return !0;
    return !1;
  }
  function T(y) {
    return typeof y.schema != "boolean";
  }
  function B(y, b) {
    const { schema: O, gen: k, opts: D } = y;
    D.$comment && O.$comment && J(y), U(y), Y(y);
    const V = k.const("_errs", c.default.errors);
    le(y, V), k.var(b, (0, o._)`${V} === ${c.default.errors}`);
  }
  function X(y) {
    (0, u.checkUnknownRules)(y), ue(y);
  }
  function le(y, b) {
    if (y.opts.jtd)
      return K(y, [], !1, b);
    const O = (0, t.getSchemaTypes)(y.schema), k = (0, t.coerceAndCheckDataType)(y, O);
    K(y, O, !k, b);
  }
  function ue(y) {
    const { schema: b, errSchemaPath: O, opts: k, self: D } = y;
    b.$ref && k.ignoreKeywordsWithRef && (0, u.schemaHasRulesButRef)(b, D.RULES) && D.logger.warn(`$ref: keywords ignored in schema at path "${O}"`);
  }
  function me(y) {
    const { schema: b, opts: O } = y;
    b.default !== void 0 && O.useDefaults && O.strictSchema && (0, u.checkStrictMode)(y, "default is ignored in the schema root");
  }
  function U(y) {
    const b = y.schema[y.opts.schemaId];
    b && (y.baseId = (0, d.resolveUrl)(y.opts.uriResolver, y.baseId, b));
  }
  function Y(y) {
    if (y.schema.$async && !y.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function J({ gen: y, schemaEnv: b, schema: O, errSchemaPath: k, opts: D }) {
    const V = O.$comment;
    if (D.$comment === !0)
      y.code((0, o._)`${c.default.self}.logger.log(${V})`);
    else if (typeof D.$comment == "function") {
      const ie = (0, o.str)`${k}/$comment`, Ee = y.scopeValue("root", { ref: b.root });
      y.code((0, o._)`${c.default.self}.opts.$comment(${V}, ${ie}, ${Ee}.schema)`);
    }
  }
  function A(y) {
    const { gen: b, schemaEnv: O, validateName: k, ValidationError: D, opts: V } = y;
    O.$async ? b.if((0, o._)`${c.default.errors} === 0`, () => b.return(c.default.data), () => b.throw((0, o._)`new ${D}(${c.default.vErrors})`)) : (b.assign((0, o._)`${k}.errors`, c.default.vErrors), V.unevaluated && L(y), b.return((0, o._)`${c.default.errors} === 0`));
  }
  function L({ gen: y, evaluated: b, props: O, items: k }) {
    O instanceof o.Name && y.assign((0, o._)`${b}.props`, O), k instanceof o.Name && y.assign((0, o._)`${b}.items`, k);
  }
  function K(y, b, O, k) {
    const { gen: D, schema: V, data: ie, allErrors: Ee, opts: de, self: fe } = y, { RULES: ce } = fe;
    if (V.$ref && (de.ignoreKeywordsWithRef || !(0, u.schemaHasRulesButRef)(V, ce))) {
      D.block(() => C(y, "$ref", ce.all.$ref.definition));
      return;
    }
    de.jtd || Q(y, b), D.block(() => {
      for (const ye of ce.rules)
        Ue(ye);
      Ue(ce.post);
    });
    function Ue(ye) {
      (0, r.shouldUseGroup)(V, ye) && (ye.type ? (D.if((0, n.checkDataType)(ye.type, ie, de.strictNumbers)), F(y, ye), b.length === 1 && b[0] === ye.type && O && (D.else(), (0, n.reportTypeError)(y)), D.endIf()) : F(y, ye), Ee || D.if((0, o._)`${c.default.errors} === ${k || 0}`));
    }
  }
  function F(y, b) {
    const { gen: O, schema: k, opts: { useDefaults: D } } = y;
    D && (0, s.assignDefaults)(y, b.type), O.block(() => {
      for (const V of b.rules)
        (0, r.shouldUseRule)(k, V) && C(y, V.keyword, V.definition, b.type);
    });
  }
  function Q(y, b) {
    y.schemaEnv.meta || !y.opts.strictTypes || (q(y, b), y.opts.allowUnionTypes || I(y, b), g(y, y.dataTypes));
  }
  function q(y, b) {
    if (b.length) {
      if (!y.dataTypes.length) {
        y.dataTypes = b;
        return;
      }
      b.forEach((O) => {
        w(y.dataTypes, O) || f(y, `type "${O}" not allowed by context "${y.dataTypes.join(",")}"`);
      }), l(y, b);
    }
  }
  function I(y, b) {
    b.length > 1 && !(b.length === 2 && b.includes("null")) && f(y, "use allowUnionTypes to allow union type keyword");
  }
  function g(y, b) {
    const O = y.self.RULES.all;
    for (const k in O) {
      const D = O[k];
      if (typeof D == "object" && (0, r.shouldUseRule)(y.schema, D)) {
        const { type: V } = D.definition;
        V.length && !V.some((ie) => N(b, ie)) && f(y, `missing type "${V.join(",")}" for keyword "${k}"`);
      }
    }
  }
  function N(y, b) {
    return y.includes(b) || b === "number" && y.includes("integer");
  }
  function w(y, b) {
    return y.includes(b) || b === "integer" && y.includes("number");
  }
  function l(y, b) {
    const O = [];
    for (const k of y.dataTypes)
      w(b, k) ? O.push(k) : b.includes("integer") && k === "number" && O.push("integer");
    y.dataTypes = O;
  }
  function f(y, b) {
    const O = y.schemaEnv.baseId + y.errSchemaPath;
    b += ` at "${O}" (strictTypes)`, (0, u.checkStrictMode)(y, b, y.opts.strictTypes);
  }
  class P {
    constructor(b, O, k) {
      if ((0, a.validateKeywordUsage)(b, O, k), this.gen = b.gen, this.allErrors = b.allErrors, this.keyword = k, this.data = b.data, this.schema = b.schema[k], this.$data = O.$data && b.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, u.schemaRefOrVal)(b, this.schema, k, this.$data), this.schemaType = O.schemaType, this.parentSchema = b.schema, this.params = {}, this.it = b, this.def = O, this.$data)
        this.schemaCode = b.gen.const("vSchema", G(this.$data, b));
      else if (this.schemaCode = this.schemaValue, !(0, a.validSchemaType)(this.schema, O.schemaType, O.allowUndefined))
        throw new Error(`${k} value must be ${JSON.stringify(O.schemaType)}`);
      ("code" in O ? O.trackErrors : O.errors !== !1) && (this.errsCount = b.gen.const("_errs", c.default.errors));
    }
    result(b, O, k) {
      this.failResult((0, o.not)(b), O, k);
    }
    failResult(b, O, k) {
      this.gen.if(b), k ? k() : this.error(), O ? (this.gen.else(), O(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(b, O) {
      this.failResult((0, o.not)(b), void 0, O);
    }
    fail(b) {
      if (b === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(b), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(b) {
      if (!this.$data)
        return this.fail(b);
      const { schemaCode: O } = this;
      this.fail((0, o._)`${O} !== undefined && (${(0, o.or)(this.invalid$data(), b)})`);
    }
    error(b, O, k) {
      if (O) {
        this.setParams(O), this._error(b, k), this.setParams({});
        return;
      }
      this._error(b, k);
    }
    _error(b, O) {
      (b ? h.reportExtraError : h.reportError)(this, this.def.error, O);
    }
    $dataError() {
      (0, h.reportError)(this, this.def.$dataError || h.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, h.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(b) {
      this.allErrors || this.gen.if(b);
    }
    setParams(b, O) {
      O ? Object.assign(this.params, b) : this.params = b;
    }
    block$data(b, O, k = o.nil) {
      this.gen.block(() => {
        this.check$data(b, k), O();
      });
    }
    check$data(b = o.nil, O = o.nil) {
      if (!this.$data)
        return;
      const { gen: k, schemaCode: D, schemaType: V, def: ie } = this;
      k.if((0, o.or)((0, o._)`${D} === undefined`, O)), b !== o.nil && k.assign(b, !0), (V.length || ie.validateSchema) && (k.elseIf(this.invalid$data()), this.$dataError(), b !== o.nil && k.assign(b, !1)), k.else();
    }
    invalid$data() {
      const { gen: b, schemaCode: O, schemaType: k, def: D, it: V } = this;
      return (0, o.or)(ie(), Ee());
      function ie() {
        if (k.length) {
          if (!(O instanceof o.Name))
            throw new Error("ajv implementation error");
          const de = Array.isArray(k) ? k : [k];
          return (0, o._)`${(0, n.checkDataTypes)(de, O, V.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function Ee() {
        if (D.validateSchema) {
          const de = b.scopeValue("validate$data", { ref: D.validateSchema });
          return (0, o._)`!${de}(${O})`;
        }
        return o.nil;
      }
    }
    subschema(b, O) {
      const k = (0, i.getSubschema)(this.it, b);
      (0, i.extendSubschemaData)(k, this.it, b), (0, i.extendSubschemaMode)(k, b);
      const D = { ...this.it, ...k, items: void 0, props: void 0 };
      return R(D, O), D;
    }
    mergeEvaluated(b, O) {
      const { it: k, gen: D } = this;
      k.opts.unevaluated && (k.props !== !0 && b.props !== void 0 && (k.props = u.mergeEvaluated.props(D, b.props, k.props, O)), k.items !== !0 && b.items !== void 0 && (k.items = u.mergeEvaluated.items(D, b.items, k.items, O)));
    }
    mergeValidEvaluated(b, O) {
      const { it: k, gen: D } = this;
      if (k.opts.unevaluated && (k.props !== !0 || k.items !== !0))
        return D.if(O, () => this.mergeEvaluated(b, o.Name)), !0;
    }
  }
  dt.KeywordCxt = P;
  function C(y, b, O, k) {
    const D = new P(y, O, b);
    "code" in O ? O.code(D, k) : D.$data && O.validate ? (0, a.funcKeywordCode)(D, O) : "macro" in O ? (0, a.macroKeywordCode)(D, O) : (O.compile || O.validate) && (0, a.funcKeywordCode)(D, O);
  }
  const M = /^\/(?:[^~]|~0|~1)*$/, W = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function G(y, { dataLevel: b, dataNames: O, dataPathArr: k }) {
    let D, V;
    if (y === "")
      return c.default.rootData;
    if (y[0] === "/") {
      if (!M.test(y))
        throw new Error(`Invalid JSON-pointer: ${y}`);
      D = y, V = c.default.rootData;
    } else {
      const fe = W.exec(y);
      if (!fe)
        throw new Error(`Invalid JSON-pointer: ${y}`);
      const ce = +fe[1];
      if (D = fe[2], D === "#") {
        if (ce >= b)
          throw new Error(de("property/index", ce));
        return k[b - ce];
      }
      if (ce > b)
        throw new Error(de("data", ce));
      if (V = O[b - ce], !D)
        return V;
    }
    let ie = V;
    const Ee = D.split("/");
    for (const fe of Ee)
      fe && (V = (0, o._)`${V}${(0, o.getProperty)((0, u.unescapeJsonPointer)(fe))}`, ie = (0, o._)`${ie} && ${V}`);
    return ie;
    function de(fe, ce) {
      return `Cannot access ${fe} ${ce} levels up, current level is ${b}`;
    }
  }
  return dt.getData = G, dt;
}
var Jr = {};
Object.defineProperty(Jr, "__esModule", { value: !0 });
class Nd extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
Jr.default = Nd;
var fr = {};
Object.defineProperty(fr, "__esModule", { value: !0 });
const ds = je;
let Rd = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, ds.resolveUrl)(t, r, n), this.missingSchema = (0, ds.normalizeId)((0, ds.getFullPath)(t, this.missingRef));
  }
};
fr.default = Rd;
var Me = {};
Object.defineProperty(Me, "__esModule", { value: !0 });
Me.resolveSchema = Me.getCompilingSchema = Me.resolveRef = Me.compileSchema = Me.SchemaEnv = void 0;
const Xe = ee, Od = Jr, zt = st(), et = je, oi = z, Id = Hn();
let Bn = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, et.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
Me.SchemaEnv = Bn;
function sa(e) {
  const t = Gc.call(this, e);
  if (t)
    return t;
  const r = (0, et.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, i = new Xe.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let o;
  e.$async && (o = i.scopeValue("Error", {
    ref: Od.default,
    code: (0, Xe._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = i.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: i,
    allErrors: this.opts.allErrors,
    data: zt.default.data,
    parentData: zt.default.parentData,
    parentDataProperty: zt.default.parentDataProperty,
    dataNames: [zt.default.data],
    dataPathArr: [Xe.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: i.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Xe.stringify)(e.schema) } : { ref: e.schema }),
    validateName: c,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Xe.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Xe._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, Id.validateFunctionCode)(d), i.optimize(this.opts.code.optimize);
    const h = i.toString();
    u = `${i.scopeRefs(zt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const p = new Function(`${zt.default.self}`, `${zt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(c, { ref: p }), p.errors = null, p.schema = e.schema, p.schemaEnv = e, e.$async && (p.$async = !0), this.opts.code.source === !0 && (p.source = { validateName: c, validateCode: h, scopeValues: i._values }), this.opts.unevaluated) {
      const { props: $, items: _ } = d;
      p.evaluated = {
        props: $ instanceof Xe.Name ? void 0 : $,
        items: _ instanceof Xe.Name ? void 0 : _,
        dynamicProps: $ instanceof Xe.Name,
        dynamicItems: _ instanceof Xe.Name
      }, p.source && (p.source.evaluated = (0, Xe.stringify)(p.evaluated));
    }
    return e.validate = p, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Me.compileSchema = sa;
function jd(e, t, r) {
  var n;
  r = (0, et.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = Ad.call(this, e, r);
  if (a === void 0) {
    const i = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: o } = this.opts;
    i && (a = new Bn({ schema: i, schemaId: o, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = kd.call(this, a);
}
Me.resolveRef = jd;
function kd(e) {
  return (0, et.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : sa.call(this, e);
}
function Gc(e) {
  for (const t of this._compilations)
    if (Td(t, e))
      return t;
}
Me.getCompilingSchema = Gc;
function Td(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Ad(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Jn.call(this, e, t);
}
function Jn(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, et._getFullPath)(this.opts.uriResolver, r);
  let s = (0, et.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return fs.call(this, r, e);
  const a = (0, et.normalizeId)(n), i = this.refs[a] || this.schemas[a];
  if (typeof i == "string") {
    const o = Jn.call(this, e, i);
    return typeof (o == null ? void 0 : o.schema) != "object" ? void 0 : fs.call(this, r, o);
  }
  if (typeof (i == null ? void 0 : i.schema) == "object") {
    if (i.validate || sa.call(this, i), a === (0, et.normalizeId)(t)) {
      const { schema: o } = i, { schemaId: c } = this.opts, d = o[c];
      return d && (s = (0, et.resolveUrl)(this.opts.uriResolver, s, d)), new Bn({ schema: o, schemaId: c, root: e, baseId: s });
    }
    return fs.call(this, r, i);
  }
}
Me.resolveSchema = Jn;
const Cd = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function fs(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const o of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, oi.unescapeFragment)(o)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Cd.has(o) && d && (t = (0, et.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, oi.schemaHasRulesButRef)(r, this.RULES)) {
    const o = (0, et.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = Jn.call(this, n, o);
  }
  const { schemaId: i } = this.opts;
  if (a = a || new Bn({ schema: r, schemaId: i, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Dd = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Md = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Ld = "object", Vd = [
  "$data"
], Fd = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, zd = !1, Ud = {
  $id: Dd,
  description: Md,
  type: Ld,
  required: Vd,
  properties: Fd,
  additionalProperties: zd
};
var aa = {}, Wn = { exports: {} };
const qd = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Hc = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Bc(e) {
  let t = "", r = 0, n = 0;
  for (n = 0; n < e.length; n++)
    if (r = e[n].charCodeAt(0), r !== 48) {
      if (!(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
        return "";
      t += e[n];
      break;
    }
  for (n += 1; n < e.length; n++) {
    if (r = e[n].charCodeAt(0), !(r >= 48 && r <= 57 || r >= 65 && r <= 70 || r >= 97 && r <= 102))
      return "";
    t += e[n];
  }
  return t;
}
const Kd = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function ii(e) {
  return e.length = 0, !0;
}
function Gd(e, t, r) {
  if (e.length) {
    const n = Bc(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function Hd(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, i = !1, o = Gd;
  for (let c = 0; c < e.length; c++) {
    const d = e[c];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (i = !0), !o(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        c > 0 && e[c - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!o(s, n, r))
          break;
        o = ii;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (o === ii ? r.zone = s.join("") : i ? n.push(s.join("")) : n.push(Bc(s))), r.address = n.join(""), r;
}
function Jc(e) {
  if (Bd(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = Hd(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function Bd(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function Jd(e) {
  let t = e;
  const r = [];
  let n = -1, s = 0;
  for (; s = t.length; ) {
    if (s === 1) {
      if (t === ".")
        break;
      if (t === "/") {
        r.push("/");
        break;
      } else {
        r.push(t);
        break;
      }
    } else if (s === 2) {
      if (t[0] === ".") {
        if (t[1] === ".")
          break;
        if (t[1] === "/") {
          t = t.slice(2);
          continue;
        }
      } else if (t[0] === "/" && (t[1] === "." || t[1] === "/")) {
        r.push("/");
        break;
      }
    } else if (s === 3 && t === "/..") {
      r.length !== 0 && r.pop(), r.push("/");
      break;
    }
    if (t[0] === ".") {
      if (t[1] === ".") {
        if (t[2] === "/") {
          t = t.slice(3);
          continue;
        }
      } else if (t[1] === "/") {
        t = t.slice(2);
        continue;
      }
    } else if (t[0] === "/" && t[1] === ".") {
      if (t[2] === "/") {
        t = t.slice(2);
        continue;
      } else if (t[2] === "." && t[3] === "/") {
        t = t.slice(3), r.length !== 0 && r.pop();
        continue;
      }
    }
    if ((n = t.indexOf("/", 1)) === -1) {
      r.push(t);
      break;
    } else
      r.push(t.slice(0, n)), t = t.slice(n);
  }
  return r.join("");
}
function Wd(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function Xd(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!Hc(r)) {
      const n = Jc(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Wc = {
  nonSimpleDomain: Kd,
  recomposeAuthority: Xd,
  normalizeComponentEncoding: Wd,
  removeDotSegments: Jd,
  isIPv4: Hc,
  isUUID: qd,
  normalizeIPv6: Jc
};
const { isUUID: Yd } = Wc, Qd = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Xc(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Yc(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Qc(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Zd(e) {
  return e.secure = Xc(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function xd(e) {
  if ((e.port === (Xc(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function ef(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(Qd);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = oa(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function tf(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = oa(s);
  a && (e = a.serialize(e, t));
  const i = e, o = e.nss;
  return i.path = `${n || t.nid}:${o}`, t.skipEscape = !0, i;
}
function rf(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Yd(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function nf(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Zc = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Yc,
    serialize: Qc
  }
), sf = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Zc.domainHost,
    parse: Yc,
    serialize: Qc
  }
), vn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: Zd,
    serialize: xd
  }
), af = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: vn.domainHost,
    parse: vn.parse,
    serialize: vn.serialize
  }
), of = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: ef,
    serialize: tf,
    skipNormalize: !0
  }
), cf = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: rf,
    serialize: nf,
    skipNormalize: !0
  }
), kn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Zc,
    https: sf,
    ws: vn,
    wss: af,
    urn: of,
    "urn:uuid": cf
  }
);
Object.setPrototypeOf(kn, null);
function oa(e) {
  return e && (kn[
    /** @type {SchemeName} */
    e
  ] || kn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var lf = {
  SCHEMES: kn,
  getSchemeHandler: oa
};
const { normalizeIPv6: uf, removeDotSegments: Tr, recomposeAuthority: df, normalizeComponentEncoding: xr, isIPv4: ff, nonSimpleDomain: hf } = Wc, { SCHEMES: mf, getSchemeHandler: xc } = lf;
function pf(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  ct(_t(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  _t(ct(e, t), t)), e;
}
function $f(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = el(_t(e, n), _t(t, n), n, !0);
  return n.skipEscape = !0, ct(s, n);
}
function el(e, t, r, n) {
  const s = {};
  return n || (e = _t(ct(e, r), r), t = _t(ct(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Tr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Tr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Tr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Tr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function yf(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = ct(xr(_t(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = ct(xr(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = ct(xr(_t(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = ct(xr(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function ct(e, t) {
  const r = {
    host: e.host,
    scheme: e.scheme,
    userinfo: e.userinfo,
    port: e.port,
    path: e.path,
    query: e.query,
    nid: e.nid,
    nss: e.nss,
    uuid: e.uuid,
    fragment: e.fragment,
    reference: e.reference,
    resourceName: e.resourceName,
    secure: e.secure,
    error: ""
  }, n = Object.assign({}, t), s = [], a = xc(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const i = df(r);
  if (i !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(i), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let o = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (o = Tr(o)), i === void 0 && o[0] === "/" && o[1] === "/" && (o = "/%2F" + o.slice(2)), s.push(o);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const gf = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function _t(e, t) {
  const r = Object.assign({}, t), n = {
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
  let s = !1;
  r.reference === "suffix" && (r.scheme ? e = r.scheme + ":" + e : e = "//" + e);
  const a = e.match(gf);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (ff(n.host) === !1) {
        const c = uf(n.host);
        n.host = c.host.toLowerCase(), s = c.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const i = xc(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!i || !i.unicodeSupport) && n.host && (r.domainHost || i && i.domainHost) && s === !1 && hf(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (o) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + o;
      }
    (!i || i && !i.skipNormalize) && (e.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), i && i.parse && i.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const ia = {
  SCHEMES: mf,
  normalize: pf,
  resolve: $f,
  resolveComponent: el,
  equal: yf,
  serialize: ct,
  parse: _t
};
Wn.exports = ia;
Wn.exports.default = ia;
Wn.exports.fastUri = ia;
var tl = Wn.exports;
Object.defineProperty(aa, "__esModule", { value: !0 });
const rl = tl;
rl.code = 'require("ajv/dist/runtime/uri").default';
aa.default = rl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Hn();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = ee;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = Jr, s = fr, a = Xt, i = Me, o = ee, c = je, d = Pe, u = z, h = Ud, E = aa, p = (I, g) => new RegExp(I, g);
  p.code = "new RegExp";
  const $ = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), v = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, S = 200;
  function R(I) {
    var g, N, w, l, f, P, C, M, W, G, y, b, O, k, D, V, ie, Ee, de, fe, ce, Ue, ye, Mt, Lt;
    const Je = I.strict, Vt = (g = I.code) === null || g === void 0 ? void 0 : g.optimize, wr = Vt === !0 || Vt === void 0 ? 1 : Vt || 0, Er = (w = (N = I.code) === null || N === void 0 ? void 0 : N.regExp) !== null && w !== void 0 ? w : p, cs = (l = I.uriResolver) !== null && l !== void 0 ? l : E.default;
    return {
      strictSchema: (P = (f = I.strictSchema) !== null && f !== void 0 ? f : Je) !== null && P !== void 0 ? P : !0,
      strictNumbers: (M = (C = I.strictNumbers) !== null && C !== void 0 ? C : Je) !== null && M !== void 0 ? M : !0,
      strictTypes: (G = (W = I.strictTypes) !== null && W !== void 0 ? W : Je) !== null && G !== void 0 ? G : "log",
      strictTuples: (b = (y = I.strictTuples) !== null && y !== void 0 ? y : Je) !== null && b !== void 0 ? b : "log",
      strictRequired: (k = (O = I.strictRequired) !== null && O !== void 0 ? O : Je) !== null && k !== void 0 ? k : !1,
      code: I.code ? { ...I.code, optimize: wr, regExp: Er } : { optimize: wr, regExp: Er },
      loopRequired: (D = I.loopRequired) !== null && D !== void 0 ? D : S,
      loopEnum: (V = I.loopEnum) !== null && V !== void 0 ? V : S,
      meta: (ie = I.meta) !== null && ie !== void 0 ? ie : !0,
      messages: (Ee = I.messages) !== null && Ee !== void 0 ? Ee : !0,
      inlineRefs: (de = I.inlineRefs) !== null && de !== void 0 ? de : !0,
      schemaId: (fe = I.schemaId) !== null && fe !== void 0 ? fe : "$id",
      addUsedSchema: (ce = I.addUsedSchema) !== null && ce !== void 0 ? ce : !0,
      validateSchema: (Ue = I.validateSchema) !== null && Ue !== void 0 ? Ue : !0,
      validateFormats: (ye = I.validateFormats) !== null && ye !== void 0 ? ye : !0,
      unicodeRegExp: (Mt = I.unicodeRegExp) !== null && Mt !== void 0 ? Mt : !0,
      int32range: (Lt = I.int32range) !== null && Lt !== void 0 ? Lt : !0,
      uriResolver: cs
    };
  }
  class j {
    constructor(g = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), g = this.opts = { ...g, ...R(g) };
      const { es5: N, lines: w } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: _, es5: N, lines: w }), this.logger = Y(g.logger);
      const l = g.validateFormats;
      g.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, v, g, "NOT SUPPORTED"), T.call(this, m, g, "DEPRECATED", "warn"), this._metaOpts = me.call(this), g.formats && le.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), g.keywords && ue.call(this, g.keywords), typeof g.meta == "object" && this.addMetaSchema(g.meta), X.call(this), g.validateFormats = l;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: g, meta: N, schemaId: w } = this.opts;
      let l = h;
      w === "id" && (l = { ...h }, l.id = l.$id, delete l.$id), N && g && this.addMetaSchema(l, l[w], !1);
    }
    defaultMeta() {
      const { meta: g, schemaId: N } = this.opts;
      return this.opts.defaultMeta = typeof g == "object" ? g[N] || g : void 0;
    }
    validate(g, N) {
      let w;
      if (typeof g == "string") {
        if (w = this.getSchema(g), !w)
          throw new Error(`no schema with key or ref "${g}"`);
      } else
        w = this.compile(g);
      const l = w(N);
      return "$async" in w || (this.errors = w.errors), l;
    }
    compile(g, N) {
      const w = this._addSchema(g, N);
      return w.validate || this._compileSchemaEnv(w);
    }
    compileAsync(g, N) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: w } = this.opts;
      return l.call(this, g, N);
      async function l(G, y) {
        await f.call(this, G.$schema);
        const b = this._addSchema(G, y);
        return b.validate || P.call(this, b);
      }
      async function f(G) {
        G && !this.getSchema(G) && await l.call(this, { $ref: G }, !0);
      }
      async function P(G) {
        try {
          return this._compileSchemaEnv(G);
        } catch (y) {
          if (!(y instanceof s.default))
            throw y;
          return C.call(this, y), await M.call(this, y.missingSchema), P.call(this, G);
        }
      }
      function C({ missingSchema: G, missingRef: y }) {
        if (this.refs[G])
          throw new Error(`AnySchema ${G} is loaded but ${y} cannot be resolved`);
      }
      async function M(G) {
        const y = await W.call(this, G);
        this.refs[G] || await f.call(this, y.$schema), this.refs[G] || this.addSchema(y, G, N);
      }
      async function W(G) {
        const y = this._loading[G];
        if (y)
          return y;
        try {
          return await (this._loading[G] = w(G));
        } finally {
          delete this._loading[G];
        }
      }
    }
    // Adds schema to the instance
    addSchema(g, N, w, l = this.opts.validateSchema) {
      if (Array.isArray(g)) {
        for (const P of g)
          this.addSchema(P, void 0, w, l);
        return this;
      }
      let f;
      if (typeof g == "object") {
        const { schemaId: P } = this.opts;
        if (f = g[P], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${P} must be string`);
      }
      return N = (0, c.normalizeId)(N || f), this._checkUnique(N), this.schemas[N] = this._addSchema(g, w, N, l, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(g, N, w = this.opts.validateSchema) {
      return this.addSchema(g, N, !0, w), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(g, N) {
      if (typeof g == "boolean")
        return !0;
      let w;
      if (w = g.$schema, w !== void 0 && typeof w != "string")
        throw new Error("$schema must be a string");
      if (w = w || this.opts.defaultMeta || this.defaultMeta(), !w)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const l = this.validate(w, g);
      if (!l && N) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return l;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(g) {
      let N;
      for (; typeof (N = B.call(this, g)) == "string"; )
        g = N;
      if (N === void 0) {
        const { schemaId: w } = this.opts, l = new i.SchemaEnv({ schema: {}, schemaId: w });
        if (N = i.resolveSchema.call(this, l, g), !N)
          return;
        this.refs[g] = N;
      }
      return N.validate || this._compileSchemaEnv(N);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(g) {
      if (g instanceof RegExp)
        return this._removeAllSchemas(this.schemas, g), this._removeAllSchemas(this.refs, g), this;
      switch (typeof g) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const N = B.call(this, g);
          return typeof N == "object" && this._cache.delete(N.schema), delete this.schemas[g], delete this.refs[g], this;
        }
        case "object": {
          const N = g;
          this._cache.delete(N);
          let w = g[this.opts.schemaId];
          return w && (w = (0, c.normalizeId)(w), delete this.schemas[w], delete this.refs[w]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(g) {
      for (const N of g)
        this.addKeyword(N);
      return this;
    }
    addKeyword(g, N) {
      let w;
      if (typeof g == "string")
        w = g, typeof N == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), N.keyword = w);
      else if (typeof g == "object" && N === void 0) {
        if (N = g, w = N.keyword, Array.isArray(w) && !w.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (A.call(this, w, N), !N)
        return (0, u.eachItem)(w, (f) => L.call(this, f)), this;
      F.call(this, N);
      const l = {
        ...N,
        type: (0, d.getJSONTypes)(N.type),
        schemaType: (0, d.getJSONTypes)(N.schemaType)
      };
      return (0, u.eachItem)(w, l.type.length === 0 ? (f) => L.call(this, f, l) : (f) => l.type.forEach((P) => L.call(this, f, l, P))), this;
    }
    getKeyword(g) {
      const N = this.RULES.all[g];
      return typeof N == "object" ? N.definition : !!N;
    }
    // Remove keyword
    removeKeyword(g) {
      const { RULES: N } = this;
      delete N.keywords[g], delete N.all[g];
      for (const w of N.rules) {
        const l = w.rules.findIndex((f) => f.keyword === g);
        l >= 0 && w.rules.splice(l, 1);
      }
      return this;
    }
    // Add format
    addFormat(g, N) {
      return typeof N == "string" && (N = new RegExp(N)), this.formats[g] = N, this;
    }
    errorsText(g = this.errors, { separator: N = ", ", dataVar: w = "data" } = {}) {
      return !g || g.length === 0 ? "No errors" : g.map((l) => `${w}${l.instancePath} ${l.message}`).reduce((l, f) => l + N + f);
    }
    $dataMetaSchema(g, N) {
      const w = this.RULES.all;
      g = JSON.parse(JSON.stringify(g));
      for (const l of N) {
        const f = l.split("/").slice(1);
        let P = g;
        for (const C of f)
          P = P[C];
        for (const C in w) {
          const M = w[C];
          if (typeof M != "object")
            continue;
          const { $data: W } = M.definition, G = P[C];
          W && G && (P[C] = q(G));
        }
      }
      return g;
    }
    _removeAllSchemas(g, N) {
      for (const w in g) {
        const l = g[w];
        (!N || N.test(w)) && (typeof l == "string" ? delete g[w] : l && !l.meta && (this._cache.delete(l.schema), delete g[w]));
      }
    }
    _addSchema(g, N, w, l = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let P;
      const { schemaId: C } = this.opts;
      if (typeof g == "object")
        P = g[C];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof g != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let M = this._cache.get(g);
      if (M !== void 0)
        return M;
      w = (0, c.normalizeId)(P || w);
      const W = c.getSchemaRefs.call(this, g, w);
      return M = new i.SchemaEnv({ schema: g, schemaId: C, meta: N, baseId: w, localRefs: W }), this._cache.set(M.schema, M), f && !w.startsWith("#") && (w && this._checkUnique(w), this.refs[w] = M), l && this.validateSchema(g, !0), M;
    }
    _checkUnique(g) {
      if (this.schemas[g] || this.refs[g])
        throw new Error(`schema with key or id "${g}" already exists`);
    }
    _compileSchemaEnv(g) {
      if (g.meta ? this._compileMetaSchema(g) : i.compileSchema.call(this, g), !g.validate)
        throw new Error("ajv implementation error");
      return g.validate;
    }
    _compileMetaSchema(g) {
      const N = this.opts;
      this.opts = this._metaOpts;
      try {
        i.compileSchema.call(this, g);
      } finally {
        this.opts = N;
      }
    }
  }
  j.ValidationError = n.default, j.MissingRefError = s.default, e.default = j;
  function T(I, g, N, w = "error") {
    for (const l in I) {
      const f = l;
      f in g && this.logger[w](`${N}: option ${l}. ${I[f]}`);
    }
  }
  function B(I) {
    return I = (0, c.normalizeId)(I), this.schemas[I] || this.refs[I];
  }
  function X() {
    const I = this.opts.schemas;
    if (I)
      if (Array.isArray(I))
        this.addSchema(I);
      else
        for (const g in I)
          this.addSchema(I[g], g);
  }
  function le() {
    for (const I in this.opts.formats) {
      const g = this.opts.formats[I];
      g && this.addFormat(I, g);
    }
  }
  function ue(I) {
    if (Array.isArray(I)) {
      this.addVocabulary(I);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const g in I) {
      const N = I[g];
      N.keyword || (N.keyword = g), this.addKeyword(N);
    }
  }
  function me() {
    const I = { ...this.opts };
    for (const g of $)
      delete I[g];
    return I;
  }
  const U = { log() {
  }, warn() {
  }, error() {
  } };
  function Y(I) {
    if (I === !1)
      return U;
    if (I === void 0)
      return console;
    if (I.log && I.warn && I.error)
      return I;
    throw new Error("logger must implement log, warn and error methods");
  }
  const J = /^[a-z_$][a-z0-9_$:-]*$/i;
  function A(I, g) {
    const { RULES: N } = this;
    if ((0, u.eachItem)(I, (w) => {
      if (N.keywords[w])
        throw new Error(`Keyword ${w} is already defined`);
      if (!J.test(w))
        throw new Error(`Keyword ${w} has invalid name`);
    }), !!g && g.$data && !("code" in g || "validate" in g))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function L(I, g, N) {
    var w;
    const l = g == null ? void 0 : g.post;
    if (N && l)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let P = l ? f.post : f.rules.find(({ type: M }) => M === N);
    if (P || (P = { type: N, rules: [] }, f.rules.push(P)), f.keywords[I] = !0, !g)
      return;
    const C = {
      keyword: I,
      definition: {
        ...g,
        type: (0, d.getJSONTypes)(g.type),
        schemaType: (0, d.getJSONTypes)(g.schemaType)
      }
    };
    g.before ? K.call(this, P, C, g.before) : P.rules.push(C), f.all[I] = C, (w = g.implements) === null || w === void 0 || w.forEach((M) => this.addKeyword(M));
  }
  function K(I, g, N) {
    const w = I.rules.findIndex((l) => l.keyword === N);
    w >= 0 ? I.rules.splice(w, 0, g) : (I.rules.push(g), this.logger.warn(`rule ${N} is not defined`));
  }
  function F(I) {
    let { metaSchema: g } = I;
    g !== void 0 && (I.$data && this.opts.$data && (g = q(g)), I.validateSchema = this.compile(g, !0));
  }
  const Q = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function q(I) {
    return { anyOf: [I, Q] };
  }
})(Rc);
var ca = {}, la = {}, ua = {};
Object.defineProperty(ua, "__esModule", { value: !0 });
const _f = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ua.default = _f;
var vt = {};
Object.defineProperty(vt, "__esModule", { value: !0 });
vt.callRef = vt.getValidate = void 0;
const vf = fr, ci = ae, Ve = ee, Zt = st(), li = Me, en = z, wf = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: i, opts: o, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = li.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new vf.default(n.opts.uriResolver, s, r);
    if (u instanceof li.SchemaEnv)
      return E(u);
    return p(u);
    function h() {
      if (a === d)
        return wn(e, i, a, a.$async);
      const $ = t.scopeValue("root", { ref: d });
      return wn(e, (0, Ve._)`${$}.validate`, d, d.$async);
    }
    function E($) {
      const _ = nl(e, $);
      wn(e, _, $, $.$async);
    }
    function p($) {
      const _ = t.scopeValue("schema", o.code.source === !0 ? { ref: $, code: (0, Ve.stringify)($) } : { ref: $ }), v = t.name("valid"), m = e.subschema({
        schema: $,
        dataTypes: [],
        schemaPath: Ve.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, v);
      e.mergeEvaluated(m), e.ok(v);
    }
  }
};
function nl(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ve._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
vt.getValidate = nl;
function wn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: i, schemaEnv: o, opts: c } = a, d = c.passContext ? Zt.default.this : Ve.nil;
  n ? u() : h();
  function u() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const $ = s.let("valid");
    s.try(() => {
      s.code((0, Ve._)`await ${(0, ci.callValidateCode)(e, t, d)}`), p(t), i || s.assign($, !0);
    }, (_) => {
      s.if((0, Ve._)`!(${_} instanceof ${a.ValidationError})`, () => s.throw(_)), E(_), i || s.assign($, !1);
    }), e.ok($);
  }
  function h() {
    e.result((0, ci.callValidateCode)(e, t, d), () => p(t), () => E(t));
  }
  function E($) {
    const _ = (0, Ve._)`${$}.errors`;
    s.assign(Zt.default.vErrors, (0, Ve._)`${Zt.default.vErrors} === null ? ${_} : ${Zt.default.vErrors}.concat(${_})`), s.assign(Zt.default.errors, (0, Ve._)`${Zt.default.vErrors}.length`);
  }
  function p($) {
    var _;
    if (!a.opts.unevaluated)
      return;
    const v = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (a.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (a.props = en.mergeEvaluated.props(s, v.props, a.props));
      else {
        const m = s.var("props", (0, Ve._)`${$}.evaluated.props`);
        a.props = en.mergeEvaluated.props(s, m, a.props, Ve.Name);
      }
    if (a.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (a.items = en.mergeEvaluated.items(s, v.items, a.items));
      else {
        const m = s.var("items", (0, Ve._)`${$}.evaluated.items`);
        a.items = en.mergeEvaluated.items(s, m, a.items, Ve.Name);
      }
  }
}
vt.callRef = wn;
vt.default = wf;
Object.defineProperty(la, "__esModule", { value: !0 });
const Ef = ua, bf = vt, Sf = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Ef.default,
  bf.default
];
la.default = Sf;
var da = {}, fa = {};
Object.defineProperty(fa, "__esModule", { value: !0 });
const Tn = ee, Pt = Tn.operators, An = {
  maximum: { okStr: "<=", ok: Pt.LTE, fail: Pt.GT },
  minimum: { okStr: ">=", ok: Pt.GTE, fail: Pt.LT },
  exclusiveMaximum: { okStr: "<", ok: Pt.LT, fail: Pt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Pt.GT, fail: Pt.LTE }
}, Pf = {
  message: ({ keyword: e, schemaCode: t }) => (0, Tn.str)`must be ${An[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Tn._)`{comparison: ${An[e].okStr}, limit: ${t}}`
}, Nf = {
  keyword: Object.keys(An),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Pf,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Tn._)`${r} ${An[t].fail} ${n} || isNaN(${r})`);
  }
};
fa.default = Nf;
var ha = {};
Object.defineProperty(ha, "__esModule", { value: !0 });
const Dr = ee, Rf = {
  message: ({ schemaCode: e }) => (0, Dr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Dr._)`{multipleOf: ${e}}`
}, Of = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Rf,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, i = t.let("res"), o = a ? (0, Dr._)`Math.abs(Math.round(${i}) - ${i}) > 1e-${a}` : (0, Dr._)`${i} !== parseInt(${i})`;
    e.fail$data((0, Dr._)`(${n} === 0 || (${i} = ${r}/${n}, ${o}))`);
  }
};
ha.default = Of;
var ma = {}, pa = {};
Object.defineProperty(pa, "__esModule", { value: !0 });
function sl(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
pa.default = sl;
sl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(ma, "__esModule", { value: !0 });
const Kt = ee, If = z, jf = pa, kf = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Kt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Kt._)`{limit: ${e}}`
}, Tf = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: kf,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Kt.operators.GT : Kt.operators.LT, i = s.opts.unicode === !1 ? (0, Kt._)`${r}.length` : (0, Kt._)`${(0, If.useFunc)(e.gen, jf.default)}(${r})`;
    e.fail$data((0, Kt._)`${i} ${a} ${n}`);
  }
};
ma.default = Tf;
var $a = {};
Object.defineProperty($a, "__esModule", { value: !0 });
const Af = ae, Cn = ee, Cf = {
  message: ({ schemaCode: e }) => (0, Cn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Cn._)`{pattern: ${e}}`
}, Df = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Cf,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, i = a.opts.unicodeRegExp ? "u" : "", o = r ? (0, Cn._)`(new RegExp(${s}, ${i}))` : (0, Af.usePattern)(e, n);
    e.fail$data((0, Cn._)`!${o}.test(${t})`);
  }
};
$a.default = Df;
var ya = {};
Object.defineProperty(ya, "__esModule", { value: !0 });
const Mr = ee, Mf = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Mr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Mr._)`{limit: ${e}}`
}, Lf = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Mf,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Mr.operators.GT : Mr.operators.LT;
    e.fail$data((0, Mr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
ya.default = Lf;
var ga = {};
Object.defineProperty(ga, "__esModule", { value: !0 });
const Or = ae, Lr = ee, Vf = z, Ff = {
  message: ({ params: { missingProperty: e } }) => (0, Lr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Lr._)`{missingProperty: ${e}}`
}, zf = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Ff,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: i } = e, { opts: o } = i;
    if (!a && r.length === 0)
      return;
    const c = r.length >= o.loopRequired;
    if (i.allErrors ? d() : u(), o.strictRequired) {
      const p = e.parentSchema.properties, { definedProperties: $ } = e.it;
      for (const _ of r)
        if ((p == null ? void 0 : p[_]) === void 0 && !$.has(_)) {
          const v = i.schemaEnv.baseId + i.errSchemaPath, m = `required property "${_}" is not defined at "${v}" (strictRequired)`;
          (0, Vf.checkStrictMode)(i, m, i.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(Lr.nil, h);
      else
        for (const p of r)
          (0, Or.checkReportMissingProp)(e, p);
    }
    function u() {
      const p = t.let("missing");
      if (c || a) {
        const $ = t.let("valid", !0);
        e.block$data($, () => E(p, $)), e.ok($);
      } else
        t.if((0, Or.checkMissingProp)(e, r, p)), (0, Or.reportMissingProp)(e, p), t.else();
    }
    function h() {
      t.forOf("prop", n, (p) => {
        e.setParams({ missingProperty: p }), t.if((0, Or.noPropertyInData)(t, s, p, o.ownProperties), () => e.error());
      });
    }
    function E(p, $) {
      e.setParams({ missingProperty: p }), t.forOf(p, n, () => {
        t.assign($, (0, Or.propertyInData)(t, s, p, o.ownProperties)), t.if((0, Lr.not)($), () => {
          e.error(), t.break();
        });
      }, Lr.nil);
    }
  }
};
ga.default = zf;
var _a = {};
Object.defineProperty(_a, "__esModule", { value: !0 });
const Vr = ee, Uf = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Vr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Vr._)`{limit: ${e}}`
}, qf = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Uf,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Vr.operators.GT : Vr.operators.LT;
    e.fail$data((0, Vr._)`${r}.length ${s} ${n}`);
  }
};
_a.default = qf;
var va = {}, Wr = {};
Object.defineProperty(Wr, "__esModule", { value: !0 });
const al = Gn;
al.code = 'require("ajv/dist/runtime/equal").default';
Wr.default = al;
Object.defineProperty(va, "__esModule", { value: !0 });
const hs = Pe, Oe = ee, Kf = z, Gf = Wr, Hf = {
  message: ({ params: { i: e, j: t } }) => (0, Oe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Oe._)`{i: ${e}, j: ${t}}`
}, Bf = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Hf,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: i, it: o } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, hs.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, Oe._)`${i} === false`), e.ok(c);
    function u() {
      const $ = t.let("i", (0, Oe._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: $, j: _ }), t.assign(c, !0), t.if((0, Oe._)`${$} > 1`, () => (h() ? E : p)($, _));
    }
    function h() {
      return d.length > 0 && !d.some(($) => $ === "object" || $ === "array");
    }
    function E($, _) {
      const v = t.name("item"), m = (0, hs.checkDataTypes)(d, v, o.opts.strictNumbers, hs.DataType.Wrong), S = t.const("indices", (0, Oe._)`{}`);
      t.for((0, Oe._)`;${$}--;`, () => {
        t.let(v, (0, Oe._)`${r}[${$}]`), t.if(m, (0, Oe._)`continue`), d.length > 1 && t.if((0, Oe._)`typeof ${v} == "string"`, (0, Oe._)`${v} += "_"`), t.if((0, Oe._)`typeof ${S}[${v}] == "number"`, () => {
          t.assign(_, (0, Oe._)`${S}[${v}]`), e.error(), t.assign(c, !1).break();
        }).code((0, Oe._)`${S}[${v}] = ${$}`);
      });
    }
    function p($, _) {
      const v = (0, Kf.useFunc)(t, Gf.default), m = t.name("outer");
      t.label(m).for((0, Oe._)`;${$}--;`, () => t.for((0, Oe._)`${_} = ${$}; ${_}--;`, () => t.if((0, Oe._)`${v}(${r}[${$}], ${r}[${_}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
va.default = Bf;
var wa = {};
Object.defineProperty(wa, "__esModule", { value: !0 });
const Ts = ee, Jf = z, Wf = Wr, Xf = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Ts._)`{allowedValue: ${e}}`
}, Yf = {
  keyword: "const",
  $data: !0,
  error: Xf,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Ts._)`!${(0, Jf.useFunc)(t, Wf.default)}(${r}, ${s})`) : e.fail((0, Ts._)`${a} !== ${r}`);
  }
};
wa.default = Yf;
var Ea = {};
Object.defineProperty(Ea, "__esModule", { value: !0 });
const Ar = ee, Qf = z, Zf = Wr, xf = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Ar._)`{allowedValues: ${e}}`
}, eh = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: xf,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: i } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const o = s.length >= i.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, Qf.useFunc)(t, Zf.default));
    let u;
    if (o || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const p = t.const("vSchema", a);
      u = (0, Ar.or)(...s.map(($, _) => E(p, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (p) => t.if((0, Ar._)`${d()}(${r}, ${p})`, () => t.assign(u, !0).break()));
    }
    function E(p, $) {
      const _ = s[$];
      return typeof _ == "object" && _ !== null ? (0, Ar._)`${d()}(${r}, ${p}[${$}])` : (0, Ar._)`${r} === ${_}`;
    }
  }
};
Ea.default = eh;
Object.defineProperty(da, "__esModule", { value: !0 });
const th = fa, rh = ha, nh = ma, sh = $a, ah = ya, oh = ga, ih = _a, ch = va, lh = wa, uh = Ea, dh = [
  // number
  th.default,
  rh.default,
  // string
  nh.default,
  sh.default,
  // object
  ah.default,
  oh.default,
  // array
  ih.default,
  ch.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  lh.default,
  uh.default
];
da.default = dh;
var ba = {}, hr = {};
Object.defineProperty(hr, "__esModule", { value: !0 });
hr.validateAdditionalItems = void 0;
const Gt = ee, As = z, fh = {
  message: ({ params: { len: e } }) => (0, Gt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Gt._)`{limit: ${e}}`
}, hh = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: fh,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, As.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    ol(e, n);
  }
};
function ol(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: i } = e;
  i.items = !0;
  const o = r.const("len", (0, Gt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Gt._)`${o} <= ${t.length}`);
  else if (typeof n == "object" && !(0, As.alwaysValidSchema)(i, n)) {
    const d = r.var("valid", (0, Gt._)`${o} <= ${t.length}`);
    r.if((0, Gt.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, o, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: As.Type.Num }, d), i.allErrors || r.if((0, Gt.not)(d), () => r.break());
    });
  }
}
hr.validateAdditionalItems = ol;
hr.default = hh;
var Sa = {}, mr = {};
Object.defineProperty(mr, "__esModule", { value: !0 });
mr.validateTuple = void 0;
const ui = ee, En = z, mh = ae, ph = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return il(e, "additionalItems", t);
    r.items = !0, !(0, En.alwaysValidSchema)(r, t) && e.ok((0, mh.validateArray)(e));
  }
};
function il(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: i, it: o } = e;
  u(s), o.opts.unevaluated && r.length && o.items !== !0 && (o.items = En.mergeEvaluated.items(n, r.length, o.items));
  const c = n.name("valid"), d = n.const("len", (0, ui._)`${a}.length`);
  r.forEach((h, E) => {
    (0, En.alwaysValidSchema)(o, h) || (n.if((0, ui._)`${d} > ${E}`, () => e.subschema({
      keyword: i,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: p } = o, $ = r.length, _ = $ === h.minItems && ($ === h.maxItems || h[t] === !1);
    if (E.strictTuples && !_) {
      const v = `"${i}" is ${$}-tuple, but minItems or maxItems/${t} are not specified or different at path "${p}"`;
      (0, En.checkStrictMode)(o, v, E.strictTuples);
    }
  }
}
mr.validateTuple = il;
mr.default = ph;
Object.defineProperty(Sa, "__esModule", { value: !0 });
const $h = mr, yh = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, $h.validateTuple)(e, "items")
};
Sa.default = yh;
var Pa = {};
Object.defineProperty(Pa, "__esModule", { value: !0 });
const di = ee, gh = z, _h = ae, vh = hr, wh = {
  message: ({ params: { len: e } }) => (0, di.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, di._)`{limit: ${e}}`
}, Eh = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: wh,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, gh.alwaysValidSchema)(n, t) && (s ? (0, vh.validateAdditionalItems)(e, s) : e.ok((0, _h.validateArray)(e)));
  }
};
Pa.default = Eh;
var Na = {};
Object.defineProperty(Na, "__esModule", { value: !0 });
const Ge = ee, tn = z, bh = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge.str)`must contain at least ${e} valid item(s)` : (0, Ge.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge._)`{minContains: ${e}}` : (0, Ge._)`{minContains: ${e}, maxContains: ${t}}`
}, Sh = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: bh,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let i, o;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (i = c === void 0 ? 1 : c, o = d) : i = 1;
    const u = t.const("len", (0, Ge._)`${s}.length`);
    if (e.setParams({ min: i, max: o }), o === void 0 && i === 0) {
      (0, tn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && i > o) {
      (0, tn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, tn.alwaysValidSchema)(a, r)) {
      let _ = (0, Ge._)`${u} >= ${i}`;
      o !== void 0 && (_ = (0, Ge._)`${_} && ${u} <= ${o}`), e.pass(_);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    o === void 0 && i === 1 ? p(h, () => t.if(h, () => t.break())) : i === 0 ? (t.let(h, !0), o !== void 0 && t.if((0, Ge._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const _ = t.name("_valid"), v = t.let("count", 0);
      p(_, () => t.if(_, () => $(v)));
    }
    function p(_, v) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: tn.Type.Num,
          compositeRule: !0
        }, _), v();
      });
    }
    function $(_) {
      t.code((0, Ge._)`${_}++`), o === void 0 ? t.if((0, Ge._)`${_} >= ${i}`, () => t.assign(h, !0).break()) : (t.if((0, Ge._)`${_} > ${o}`, () => t.assign(h, !1).break()), i === 1 ? t.assign(h, !0) : t.if((0, Ge._)`${_} >= ${i}`, () => t.assign(h, !0)));
    }
  }
};
Na.default = Sh;
var Xn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ee, r = z, n = ae;
  e.error = {
    message: ({ params: { property: c, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${c},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(c) {
      const [d, u] = a(c);
      i(c, d), o(c, u);
    }
  };
  function a({ schema: c }) {
    const d = {}, u = {};
    for (const h in c) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(c[h]) ? d : u;
      E[h] = c[h];
    }
    return [d, u];
  }
  function i(c, d = c.schema) {
    const { gen: u, data: h, it: E } = c;
    if (Object.keys(d).length === 0)
      return;
    const p = u.let("missing");
    for (const $ in d) {
      const _ = d[$];
      if (_.length === 0)
        continue;
      const v = (0, n.propertyInData)(u, h, $, E.opts.ownProperties);
      c.setParams({
        property: $,
        depsCount: _.length,
        deps: _.join(", ")
      }), E.allErrors ? u.if(v, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(c, m);
      }) : (u.if((0, t._)`${v} && (${(0, n.checkMissingProp)(c, _, p)})`), (0, n.reportMissingProp)(c, p), u.else());
    }
  }
  e.validatePropertyDeps = i;
  function o(c, d = c.schema) {
    const { gen: u, data: h, keyword: E, it: p } = c, $ = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(p, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, p.opts.ownProperties),
        () => {
          const v = c.subschema({ keyword: E, schemaProp: _ }, $);
          c.mergeValidEvaluated(v, $);
        },
        () => u.var($, !0)
        // TODO var
      ), c.ok($));
  }
  e.validateSchemaDeps = o, e.default = s;
})(Xn);
var Ra = {};
Object.defineProperty(Ra, "__esModule", { value: !0 });
const cl = ee, Ph = z, Nh = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, cl._)`{propertyName: ${e.propertyName}}`
}, Rh = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Nh,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Ph.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (i) => {
      e.setParams({ propertyName: i }), e.subschema({
        keyword: "propertyNames",
        data: i,
        dataTypes: ["string"],
        propertyName: i,
        compositeRule: !0
      }, a), t.if((0, cl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Ra.default = Rh;
var Yn = {};
Object.defineProperty(Yn, "__esModule", { value: !0 });
const rn = ae, Ze = ee, Oh = st(), nn = z, Ih = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Ze._)`{additionalProperty: ${e.additionalProperty}}`
}, jh = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Ih,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: i } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: c } = i;
    if (i.props = !0, c.removeAdditional !== "all" && (0, nn.alwaysValidSchema)(i, r))
      return;
    const d = (0, rn.allSchemaProperties)(n.properties), u = (0, rn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Ze._)`${a} === ${Oh.default.errors}`);
    function h() {
      t.forIn("key", s, (v) => {
        !d.length && !u.length ? $(v) : t.if(E(v), () => $(v));
      });
    }
    function E(v) {
      let m;
      if (d.length > 8) {
        const S = (0, nn.schemaRefOrVal)(i, n.properties, "properties");
        m = (0, rn.isOwnProperty)(t, S, v);
      } else d.length ? m = (0, Ze.or)(...d.map((S) => (0, Ze._)`${v} === ${S}`)) : m = Ze.nil;
      return u.length && (m = (0, Ze.or)(m, ...u.map((S) => (0, Ze._)`${(0, rn.usePattern)(e, S)}.test(${v})`))), (0, Ze.not)(m);
    }
    function p(v) {
      t.code((0, Ze._)`delete ${s}[${v}]`);
    }
    function $(v) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        p(v);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: v }), e.error(), o || t.break();
        return;
      }
      if (typeof r == "object" && !(0, nn.alwaysValidSchema)(i, r)) {
        const m = t.name("valid");
        c.removeAdditional === "failing" ? (_(v, m, !1), t.if((0, Ze.not)(m), () => {
          e.reset(), p(v);
        })) : (_(v, m), o || t.if((0, Ze.not)(m), () => t.break()));
      }
    }
    function _(v, m, S) {
      const R = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: nn.Type.Str
      };
      S === !1 && Object.assign(R, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(R, m);
    }
  }
};
Yn.default = jh;
var Oa = {};
Object.defineProperty(Oa, "__esModule", { value: !0 });
const kh = Hn(), fi = ae, ms = z, hi = Yn, Th = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && hi.default.code(new kh.KeywordCxt(a, hi.default, "additionalProperties"));
    const i = (0, fi.allSchemaProperties)(r);
    for (const h of i)
      a.definedProperties.add(h);
    a.opts.unevaluated && i.length && a.props !== !0 && (a.props = ms.mergeEvaluated.props(t, (0, ms.toHash)(i), a.props));
    const o = i.filter((h) => !(0, ms.alwaysValidSchema)(a, r[h]));
    if (o.length === 0)
      return;
    const c = t.name("valid");
    for (const h of o)
      d(h) ? u(h) : (t.if((0, fi.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, c);
    }
  }
};
Oa.default = Th;
var Ia = {};
Object.defineProperty(Ia, "__esModule", { value: !0 });
const mi = ae, sn = ee, pi = z, $i = z, Ah = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: i } = a, o = (0, mi.allSchemaProperties)(r), c = o.filter((_) => (0, pi.alwaysValidSchema)(a, r[_]));
    if (o.length === 0 || c.length === o.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = i.strictSchema && !i.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof sn.Name) && (a.props = (0, $i.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const _ of o)
        d && p(_), a.allErrors ? $(_) : (t.var(u, !0), $(_), t.if(u));
    }
    function p(_) {
      for (const v in d)
        new RegExp(_).test(v) && (0, pi.checkStrictMode)(a, `property ${v} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function $(_) {
      t.forIn("key", n, (v) => {
        t.if((0, sn._)`${(0, mi.usePattern)(e, _)}.test(${v})`, () => {
          const m = c.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: v,
            dataPropType: $i.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, sn._)`${h}[${v}]`, !0) : !m && !a.allErrors && t.if((0, sn.not)(u), () => t.break());
        });
      });
    }
  }
};
Ia.default = Ah;
var ja = {};
Object.defineProperty(ja, "__esModule", { value: !0 });
const Ch = z, Dh = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Ch.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
ja.default = Dh;
var ka = {};
Object.defineProperty(ka, "__esModule", { value: !0 });
const Mh = ae, Lh = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Mh.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
ka.default = Lh;
var Ta = {};
Object.defineProperty(Ta, "__esModule", { value: !0 });
const bn = ee, Vh = z, Fh = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, bn._)`{passingSchemas: ${e.passing}}`
}, zh = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Fh,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, i = t.let("valid", !1), o = t.let("passing", null), c = t.name("_valid");
    e.setParams({ passing: o }), t.block(d), e.result(i, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, Vh.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, bn._)`${c} && ${i}`).assign(i, !1).assign(o, (0, bn._)`[${o}, ${h}]`).else(), t.if(c, () => {
          t.assign(i, !0), t.assign(o, h), E && e.mergeEvaluated(E, bn.Name);
        });
      });
    }
  }
};
Ta.default = zh;
var Aa = {};
Object.defineProperty(Aa, "__esModule", { value: !0 });
const Uh = z, qh = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, i) => {
      if ((0, Uh.alwaysValidSchema)(n, a))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: i }, s);
      e.ok(s), e.mergeEvaluated(o);
    });
  }
};
Aa.default = qh;
var Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Dn = ee, ll = z, Kh = {
  message: ({ params: e }) => (0, Dn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Dn._)`{failingKeyword: ${e.ifClause}}`
}, Gh = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Kh,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, ll.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = yi(n, "then"), a = yi(n, "else");
    if (!s && !a)
      return;
    const i = t.let("valid", !0), o = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(o, d("then", u), d("else", u));
    } else s ? t.if(o, d("then")) : t.if((0, Dn.not)(o), d("else"));
    e.pass(i, () => e.error(!0));
    function c() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, o);
        t.assign(i, o), e.mergeValidEvaluated(E, i), h ? t.assign(h, (0, Dn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function yi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, ll.alwaysValidSchema)(e, r);
}
Ca.default = Gh;
var Da = {};
Object.defineProperty(Da, "__esModule", { value: !0 });
const Hh = z, Bh = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Hh.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Da.default = Bh;
Object.defineProperty(ba, "__esModule", { value: !0 });
const Jh = hr, Wh = Sa, Xh = mr, Yh = Pa, Qh = Na, Zh = Xn, xh = Ra, em = Yn, tm = Oa, rm = Ia, nm = ja, sm = ka, am = Ta, om = Aa, im = Ca, cm = Da;
function lm(e = !1) {
  const t = [
    // any
    nm.default,
    sm.default,
    am.default,
    om.default,
    im.default,
    cm.default,
    // object
    xh.default,
    em.default,
    Zh.default,
    tm.default,
    rm.default
  ];
  return e ? t.push(Wh.default, Yh.default) : t.push(Jh.default, Xh.default), t.push(Qh.default), t;
}
ba.default = lm;
var Ma = {}, pr = {};
Object.defineProperty(pr, "__esModule", { value: !0 });
pr.dynamicAnchor = void 0;
const ps = ee, um = st(), gi = Me, dm = vt, fm = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => ul(e, e.schema)
};
function ul(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, ps._)`${um.default.dynamicAnchors}${(0, ps.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : hm(e);
  r.if((0, ps._)`!${s}`, () => r.assign(s, a));
}
pr.dynamicAnchor = ul;
function hm(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: i, meta: o } = t.root, { schemaId: c } = n.opts, d = new gi.SchemaEnv({ schema: r, schemaId: c, root: s, baseId: a, localRefs: i, meta: o });
  return gi.compileSchema.call(n, d), (0, dm.getValidate)(e, d);
}
pr.default = fm;
var $r = {};
Object.defineProperty($r, "__esModule", { value: !0 });
$r.dynamicRef = void 0;
const _i = ee, mm = st(), vi = vt, pm = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => dl(e, e.schema)
};
function dl(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    i();
  else {
    const c = r.let("valid", !1);
    i(c), e.ok(c);
  }
  function i(c) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, _i._)`${mm.default.dynamicAnchors}${(0, _i.getProperty)(a)}`);
      r.if(d, o(d, c), o(s.validateName, c));
    } else
      o(s.validateName, c)();
  }
  function o(c, d) {
    return d ? () => r.block(() => {
      (0, vi.callRef)(e, c), r.let(d, !0);
    }) : () => (0, vi.callRef)(e, c);
  }
}
$r.dynamicRef = dl;
$r.default = pm;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const $m = pr, ym = z, gm = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, $m.dynamicAnchor)(e, "") : (0, ym.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
La.default = gm;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const _m = $r, vm = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, _m.dynamicRef)(e, e.schema)
};
Va.default = vm;
Object.defineProperty(Ma, "__esModule", { value: !0 });
const wm = pr, Em = $r, bm = La, Sm = Va, Pm = [wm.default, Em.default, bm.default, Sm.default];
Ma.default = Pm;
var Fa = {}, za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const wi = Xn, Nm = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: wi.error,
  code: (e) => (0, wi.validatePropertyDeps)(e)
};
za.default = Nm;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const Rm = Xn, Om = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, Rm.validateSchemaDeps)(e)
};
Ua.default = Om;
var qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const Im = z, jm = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, Im.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
qa.default = jm;
Object.defineProperty(Fa, "__esModule", { value: !0 });
const km = za, Tm = Ua, Am = qa, Cm = [km.default, Tm.default, Am.default];
Fa.default = Cm;
var Ka = {}, Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Ot = ee, Ei = z, Dm = st(), Mm = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Ot._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Lm = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: Mm,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: i, props: o } = a;
    o instanceof Ot.Name ? t.if((0, Ot._)`${o} !== true`, () => t.forIn("key", n, (h) => t.if(d(o, h), () => c(h)))) : o !== !0 && t.forIn("key", n, (h) => o === void 0 ? c(h) : t.if(u(o, h), () => c(h))), a.props = !0, e.ok((0, Ot._)`${s} === ${Dm.default.errors}`);
    function c(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), i || t.break();
        return;
      }
      if (!(0, Ei.alwaysValidSchema)(a, r)) {
        const E = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Ei.Type.Str
        }, E), i || t.if((0, Ot.not)(E), () => t.break());
      }
    }
    function d(h, E) {
      return (0, Ot._)`!${h} || !${h}[${E}]`;
    }
    function u(h, E) {
      const p = [];
      for (const $ in h)
        h[$] === !0 && p.push((0, Ot._)`${E} !== ${$}`);
      return (0, Ot.and)(...p);
    }
  }
};
Ga.default = Lm;
var Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const Ht = ee, bi = z, Vm = {
  message: ({ params: { len: e } }) => (0, Ht.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ht._)`{limit: ${e}}`
}, Fm = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: Vm,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const i = t.const("len", (0, Ht._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, Ht._)`${i} > ${a}`);
    else if (typeof r == "object" && !(0, bi.alwaysValidSchema)(s, r)) {
      const c = t.var("valid", (0, Ht._)`${i} <= ${a}`);
      t.if((0, Ht.not)(c), () => o(c, a)), e.ok(c);
    }
    s.items = !0;
    function o(c, d) {
      t.forRange("i", d, i, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: bi.Type.Num }, c), s.allErrors || t.if((0, Ht.not)(c), () => t.break());
      });
    }
  }
};
Ha.default = Fm;
Object.defineProperty(Ka, "__esModule", { value: !0 });
const zm = Ga, Um = Ha, qm = [zm.default, Um.default];
Ka.default = qm;
var Ba = {}, Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const be = ee, Km = {
  message: ({ schemaCode: e }) => (0, be.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, be._)`{format: ${e}}`
}, Gm = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Km,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: i, it: o } = e, { opts: c, errSchemaPath: d, schemaEnv: u, self: h } = o;
    if (!c.validateFormats)
      return;
    s ? E() : p();
    function E() {
      const $ = r.scopeValue("formats", {
        ref: h.formats,
        code: c.code.formats
      }), _ = r.const("fDef", (0, be._)`${$}[${i}]`), v = r.let("fType"), m = r.let("format");
      r.if((0, be._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign(v, (0, be._)`${_}.type || "string"`).assign(m, (0, be._)`${_}.validate`), () => r.assign(v, (0, be._)`"string"`).assign(m, _)), e.fail$data((0, be.or)(S(), R()));
      function S() {
        return c.strictSchema === !1 ? be.nil : (0, be._)`${i} && !${m}`;
      }
      function R() {
        const j = u.$async ? (0, be._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, be._)`${m}(${n})`, T = (0, be._)`(typeof ${m} == "function" ? ${j} : ${m}.test(${n}))`;
        return (0, be._)`${m} && ${m} !== true && ${v} === ${t} && !${T}`;
      }
    }
    function p() {
      const $ = h.formats[a];
      if (!$) {
        S();
        return;
      }
      if ($ === !0)
        return;
      const [_, v, m] = R($);
      _ === t && e.pass(j());
      function S() {
        if (c.strictSchema === !1) {
          h.logger.warn(T());
          return;
        }
        throw new Error(T());
        function T() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function R(T) {
        const B = T instanceof RegExp ? (0, be.regexpCode)(T) : c.code.formats ? (0, be._)`${c.code.formats}${(0, be.getProperty)(a)}` : void 0, X = r.scopeValue("formats", { key: a, ref: T, code: B });
        return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, be._)`${X}.validate`] : ["string", T, X];
      }
      function j() {
        if (typeof $ == "object" && !($ instanceof RegExp) && $.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, be._)`await ${m}(${n})`;
        }
        return typeof v == "function" ? (0, be._)`${m}(${n})` : (0, be._)`${m}.test(${n})`;
      }
    }
  }
};
Ja.default = Gm;
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Hm = Ja, Bm = [Hm.default];
Ba.default = Bm;
var ur = {};
Object.defineProperty(ur, "__esModule", { value: !0 });
ur.contentVocabulary = ur.metadataVocabulary = void 0;
ur.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
ur.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(ca, "__esModule", { value: !0 });
const Jm = la, Wm = da, Xm = ba, Ym = Ma, Qm = Fa, Zm = Ka, xm = Ba, Si = ur, ep = [
  Ym.default,
  Jm.default,
  Wm.default,
  (0, Xm.default)(!0),
  xm.default,
  Si.metadataVocabulary,
  Si.contentVocabulary,
  Qm.default,
  Zm.default
];
ca.default = ep;
var Wa = {}, Qn = {};
Object.defineProperty(Qn, "__esModule", { value: !0 });
Qn.DiscrError = void 0;
var Pi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Pi || (Qn.DiscrError = Pi = {}));
Object.defineProperty(Wa, "__esModule", { value: !0 });
const nr = ee, Cs = Qn, Ni = Me, tp = fr, rp = z, np = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Cs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, nr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, sp = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: np,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: i } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = n.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!i)
      throw new Error("discriminator: requires oneOf keyword");
    const c = t.let("valid", !1), d = t.const("tag", (0, nr._)`${r}${(0, nr.getProperty)(o)}`);
    t.if((0, nr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Cs.DiscrError.Tag, tag: d, tagName: o })), e.ok(c);
    function u() {
      const p = E();
      t.if(!1);
      for (const $ in p)
        t.elseIf((0, nr._)`${d} === ${$}`), t.assign(c, h(p[$]));
      t.else(), e.error(!1, { discrError: Cs.DiscrError.Mapping, tag: d, tagName: o }), t.endIf();
    }
    function h(p) {
      const $ = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: p }, $);
      return e.mergeEvaluated(_, nr.Name), $;
    }
    function E() {
      var p;
      const $ = {}, _ = m(s);
      let v = !0;
      for (let j = 0; j < i.length; j++) {
        let T = i[j];
        if (T != null && T.$ref && !(0, rp.schemaHasRulesButRef)(T, a.self.RULES)) {
          const X = T.$ref;
          if (T = Ni.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), T instanceof Ni.SchemaEnv && (T = T.schema), T === void 0)
            throw new tp.default(a.opts.uriResolver, a.baseId, X);
        }
        const B = (p = T == null ? void 0 : T.properties) === null || p === void 0 ? void 0 : p[o];
        if (typeof B != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        v = v && (_ || m(T)), S(B, j);
      }
      if (!v)
        throw new Error(`discriminator: "${o}" must be required`);
      return $;
      function m({ required: j }) {
        return Array.isArray(j) && j.includes(o);
      }
      function S(j, T) {
        if (j.const)
          R(j.const, T);
        else if (j.enum)
          for (const B of j.enum)
            R(B, T);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function R(j, T) {
        if (typeof j != "string" || j in $)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        $[j] = T;
      }
    }
  }
};
Wa.default = sp;
var Xa = {};
const ap = "https://json-schema.org/draft/2020-12/schema", op = "https://json-schema.org/draft/2020-12/schema", ip = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, cp = "meta", lp = "Core and Validation specifications meta-schema", up = [
  {
    $ref: "meta/core"
  },
  {
    $ref: "meta/applicator"
  },
  {
    $ref: "meta/unevaluated"
  },
  {
    $ref: "meta/validation"
  },
  {
    $ref: "meta/meta-data"
  },
  {
    $ref: "meta/format-annotation"
  },
  {
    $ref: "meta/content"
  }
], dp = [
  "object",
  "boolean"
], fp = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", hp = {
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: !0,
    default: {}
  },
  dependencies: {
    $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.',
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $dynamicRef: "#meta"
        },
        {
          $ref: "meta/validation#/$defs/stringArray"
        }
      ]
    },
    deprecated: !0,
    default: {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: !0
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: !0
  }
}, mp = {
  $schema: ap,
  $id: op,
  $vocabulary: ip,
  $dynamicAnchor: cp,
  title: lp,
  allOf: up,
  type: dp,
  $comment: fp,
  properties: hp
}, pp = "https://json-schema.org/draft/2020-12/schema", $p = "https://json-schema.org/draft/2020-12/meta/applicator", yp = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, gp = "meta", _p = "Applicator vocabulary meta-schema", vp = [
  "object",
  "boolean"
], wp = {
  prefixItems: {
    $ref: "#/$defs/schemaArray"
  },
  items: {
    $dynamicRef: "#meta"
  },
  contains: {
    $dynamicRef: "#meta"
  },
  additionalProperties: {
    $dynamicRef: "#meta"
  },
  properties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    default: {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  if: {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  else: {
    $dynamicRef: "#meta"
  },
  allOf: {
    $ref: "#/$defs/schemaArray"
  },
  anyOf: {
    $ref: "#/$defs/schemaArray"
  },
  oneOf: {
    $ref: "#/$defs/schemaArray"
  },
  not: {
    $dynamicRef: "#meta"
  }
}, Ep = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, bp = {
  $schema: pp,
  $id: $p,
  $vocabulary: yp,
  $dynamicAnchor: gp,
  title: _p,
  type: vp,
  properties: wp,
  $defs: Ep
}, Sp = "https://json-schema.org/draft/2020-12/schema", Pp = "https://json-schema.org/draft/2020-12/meta/unevaluated", Np = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, Rp = "meta", Op = "Unevaluated applicator vocabulary meta-schema", Ip = [
  "object",
  "boolean"
], jp = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, kp = {
  $schema: Sp,
  $id: Pp,
  $vocabulary: Np,
  $dynamicAnchor: Rp,
  title: Op,
  type: Ip,
  properties: jp
}, Tp = "https://json-schema.org/draft/2020-12/schema", Ap = "https://json-schema.org/draft/2020-12/meta/content", Cp = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, Dp = "meta", Mp = "Content vocabulary meta-schema", Lp = [
  "object",
  "boolean"
], Vp = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Fp = {
  $schema: Tp,
  $id: Ap,
  $vocabulary: Cp,
  $dynamicAnchor: Dp,
  title: Mp,
  type: Lp,
  properties: Vp
}, zp = "https://json-schema.org/draft/2020-12/schema", Up = "https://json-schema.org/draft/2020-12/meta/core", qp = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, Kp = "meta", Gp = "Core vocabulary meta-schema", Hp = [
  "object",
  "boolean"
], Bp = {
  $id: {
    $ref: "#/$defs/uriReferenceString",
    $comment: "Non-empty fragments not allowed.",
    pattern: "^[^#]*#?$"
  },
  $schema: {
    $ref: "#/$defs/uriString"
  },
  $ref: {
    $ref: "#/$defs/uriReferenceString"
  },
  $anchor: {
    $ref: "#/$defs/anchorString"
  },
  $dynamicRef: {
    $ref: "#/$defs/uriReferenceString"
  },
  $dynamicAnchor: {
    $ref: "#/$defs/anchorString"
  },
  $vocabulary: {
    type: "object",
    propertyNames: {
      $ref: "#/$defs/uriString"
    },
    additionalProperties: {
      type: "boolean"
    }
  },
  $comment: {
    type: "string"
  },
  $defs: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    }
  }
}, Jp = {
  anchorString: {
    type: "string",
    pattern: "^[A-Za-z_][-A-Za-z0-9._]*$"
  },
  uriString: {
    type: "string",
    format: "uri"
  },
  uriReferenceString: {
    type: "string",
    format: "uri-reference"
  }
}, Wp = {
  $schema: zp,
  $id: Up,
  $vocabulary: qp,
  $dynamicAnchor: Kp,
  title: Gp,
  type: Hp,
  properties: Bp,
  $defs: Jp
}, Xp = "https://json-schema.org/draft/2020-12/schema", Yp = "https://json-schema.org/draft/2020-12/meta/format-annotation", Qp = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Zp = "meta", xp = "Format vocabulary meta-schema for annotation results", e$ = [
  "object",
  "boolean"
], t$ = {
  format: {
    type: "string"
  }
}, r$ = {
  $schema: Xp,
  $id: Yp,
  $vocabulary: Qp,
  $dynamicAnchor: Zp,
  title: xp,
  type: e$,
  properties: t$
}, n$ = "https://json-schema.org/draft/2020-12/schema", s$ = "https://json-schema.org/draft/2020-12/meta/meta-data", a$ = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, o$ = "meta", i$ = "Meta-data vocabulary meta-schema", c$ = [
  "object",
  "boolean"
], l$ = {
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  deprecated: {
    type: "boolean",
    default: !1
  },
  readOnly: {
    type: "boolean",
    default: !1
  },
  writeOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  }
}, u$ = {
  $schema: n$,
  $id: s$,
  $vocabulary: a$,
  $dynamicAnchor: o$,
  title: i$,
  type: c$,
  properties: l$
}, d$ = "https://json-schema.org/draft/2020-12/schema", f$ = "https://json-schema.org/draft/2020-12/meta/validation", h$ = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, m$ = "meta", p$ = "Validation vocabulary meta-schema", $$ = [
  "object",
  "boolean"
], y$ = {
  type: {
    anyOf: [
      {
        $ref: "#/$defs/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/$defs/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  const: !0,
  enum: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  maxItems: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 1
  },
  maxProperties: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/$defs/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/$defs/stringArray"
  },
  dependentRequired: {
    type: "object",
    additionalProperties: {
      $ref: "#/$defs/stringArray"
    }
  }
}, g$ = {
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    default: 0
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, _$ = {
  $schema: d$,
  $id: f$,
  $vocabulary: h$,
  $dynamicAnchor: m$,
  title: p$,
  type: $$,
  properties: y$,
  $defs: g$
};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const v$ = mp, w$ = bp, E$ = kp, b$ = Fp, S$ = Wp, P$ = r$, N$ = u$, R$ = _$, O$ = ["/properties"];
function I$(e) {
  return [
    v$,
    w$,
    E$,
    b$,
    S$,
    t(this, P$),
    N$,
    t(this, R$)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, O$) : n;
  }
}
Xa.default = I$;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Rc, n = ca, s = Wa, a = Xa, i = "https://json-schema.org/draft/2020-12/schema";
  class o extends r.default {
    constructor(p = {}) {
      super({
        ...p,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((p) => this.addVocabulary(p)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: p, meta: $ } = this.opts;
      $ && (a.default.call(this, p), this.refs["http://json-schema.org/schema"] = i);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(i) ? i : void 0);
    }
  }
  t.Ajv2020 = o, e.exports = t = o, e.exports.Ajv2020 = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
  var c = Hn();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var d = ee;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return d._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return d.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return d.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return d.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return d.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return d.CodeGen;
  } });
  var u = Jr;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = fr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Rs, Rs.exports);
var j$ = Rs.exports, Ds = { exports: {} }, fl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(U, Y) {
    return { validate: U, compare: Y };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, i),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(c(!0), d),
    "date-time": t(E(!0), p),
    "iso-time": t(c(), u),
    "iso-date-time": t(E(), $),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: m,
    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
    // uri-template: https://tools.ietf.org/html/rfc6570
    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
    // For the source: https://gist.github.com/dperini/729294
    // For test cases: https://mathiasbynens.be/demo/url-regex
    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
    regex: me,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
    // byte: https://github.com/miguelmota/is-base64
    byte: R,
    // signed 32 bit integer
    int32: { type: "number", validate: B },
    // signed 64 bit integer
    int64: { type: "number", validate: X },
    // C-type float
    float: { type: "number", validate: le },
    // C-type double
    double: { type: "number", validate: le },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, i),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, p),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, $),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(U) {
    return U % 4 === 0 && (U % 100 !== 0 || U % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(U) {
    const Y = n.exec(U);
    if (!Y)
      return !1;
    const J = +Y[1], A = +Y[2], L = +Y[3];
    return A >= 1 && A <= 12 && L >= 1 && L <= (A === 2 && r(J) ? 29 : s[A]);
  }
  function i(U, Y) {
    if (U && Y)
      return U > Y ? 1 : U < Y ? -1 : 0;
  }
  const o = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function c(U) {
    return function(J) {
      const A = o.exec(J);
      if (!A)
        return !1;
      const L = +A[1], K = +A[2], F = +A[3], Q = A[4], q = A[5] === "-" ? -1 : 1, I = +(A[6] || 0), g = +(A[7] || 0);
      if (I > 23 || g > 59 || U && !Q)
        return !1;
      if (L <= 23 && K <= 59 && F < 60)
        return !0;
      const N = K - g * q, w = L - I * q - (N < 0 ? 1 : 0);
      return (w === 23 || w === -1) && (N === 59 || N === -1) && F < 61;
    };
  }
  function d(U, Y) {
    if (!(U && Y))
      return;
    const J = (/* @__PURE__ */ new Date("2020-01-01T" + U)).valueOf(), A = (/* @__PURE__ */ new Date("2020-01-01T" + Y)).valueOf();
    if (J && A)
      return J - A;
  }
  function u(U, Y) {
    if (!(U && Y))
      return;
    const J = o.exec(U), A = o.exec(Y);
    if (J && A)
      return U = J[1] + J[2] + J[3], Y = A[1] + A[2] + A[3], U > Y ? 1 : U < Y ? -1 : 0;
  }
  const h = /t|\s/i;
  function E(U) {
    const Y = c(U);
    return function(A) {
      const L = A.split(h);
      return L.length === 2 && a(L[0]) && Y(L[1]);
    };
  }
  function p(U, Y) {
    if (!(U && Y))
      return;
    const J = new Date(U).valueOf(), A = new Date(Y).valueOf();
    if (J && A)
      return J - A;
  }
  function $(U, Y) {
    if (!(U && Y))
      return;
    const [J, A] = U.split(h), [L, K] = Y.split(h), F = i(J, L);
    if (F !== void 0)
      return F || d(A, K);
  }
  const _ = /\/|:/, v = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(U) {
    return _.test(U) && v.test(U);
  }
  const S = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function R(U) {
    return S.lastIndex = 0, S.test(U);
  }
  const j = -2147483648, T = 2 ** 31 - 1;
  function B(U) {
    return Number.isInteger(U) && U <= T && U >= j;
  }
  function X(U) {
    return Number.isInteger(U);
  }
  function le() {
    return !0;
  }
  const ue = /[^\\]\\Z/;
  function me(U) {
    if (ue.test(U))
      return !1;
    try {
      return new RegExp(U), !0;
    } catch {
      return !1;
    }
  }
})(fl);
var hl = {}, Ms = { exports: {} }, ml = {}, ht = {}, Ut = {}, Xr = {}, se = {}, Hr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(S) {
      if (super(), !e.IDENTIFIER.test(S))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = S;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return !1;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  e.Name = r;
  class n extends t {
    constructor(S) {
      super(), this._items = typeof S == "string" ? [S] : S;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const S = this._items[0];
      return S === "" || S === '""';
    }
    get str() {
      var S;
      return (S = this._str) !== null && S !== void 0 ? S : this._str = this._items.reduce((R, j) => `${R}${j}`, "");
    }
    get names() {
      var S;
      return (S = this._names) !== null && S !== void 0 ? S : this._names = this._items.reduce((R, j) => (j instanceof r && (R[j.str] = (R[j.str] || 0) + 1), R), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...S) {
    const R = [m[0]];
    let j = 0;
    for (; j < S.length; )
      o(R, S[j]), R.push(m[++j]);
    return new n(R);
  }
  e._ = s;
  const a = new n("+");
  function i(m, ...S) {
    const R = [p(m[0])];
    let j = 0;
    for (; j < S.length; )
      R.push(a), o(R, S[j]), R.push(a, p(m[++j]));
    return c(R), new n(R);
  }
  e.str = i;
  function o(m, S) {
    S instanceof n ? m.push(...S._items) : S instanceof r ? m.push(S) : m.push(h(S));
  }
  e.addCodeArg = o;
  function c(m) {
    let S = 1;
    for (; S < m.length - 1; ) {
      if (m[S] === a) {
        const R = d(m[S - 1], m[S + 1]);
        if (R !== void 0) {
          m.splice(S - 1, 3, R);
          continue;
        }
        m[S++] = "+";
      }
      S++;
    }
  }
  function d(m, S) {
    if (S === '""')
      return m;
    if (m === '""')
      return S;
    if (typeof m == "string")
      return S instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof S != "string" ? `${m.slice(0, -1)}${S}"` : S[0] === '"' ? m.slice(0, -1) + S.slice(1) : void 0;
    if (typeof S == "string" && S[0] === '"' && !(m instanceof r))
      return `"${m}${S.slice(1)}`;
  }
  function u(m, S) {
    return S.emptyStr() ? m : m.emptyStr() ? S : i`${m}${S}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : p(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(p(m));
  }
  e.stringify = E;
  function p(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = p;
  function $(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = $;
  function _(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = _;
  function v(m) {
    return new n(m.toString());
  }
  e.regexpCode = v;
})(Hr);
var Ls = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Hr;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(c) {
    c[c.Started = 0] = "Started", c[c.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: u } = {}) {
      this._names = {}, this._prefixes = d, this._parent = u;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const u = this._names[d] || this._nameGroup(d);
      return `${d}${u.index++}`;
    }
    _nameGroup(d) {
      var u, h;
      if (!((h = (u = this._parent) === null || u === void 0 ? void 0 : u._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, u) {
      super(u), this.prefix = d;
    }
    setValue(d, { property: u, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(u)}[${h}]`;
    }
  }
  e.ValueScopeName = a;
  const i = (0, t._)`\n`;
  class o extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? i : t.nil };
    }
    get() {
      return this._scope;
    }
    name(d) {
      return new a(d, this._newName(d));
    }
    value(d, u) {
      var h;
      if (u.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const E = this.toName(d), { prefix: p } = E, $ = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let _ = this._values[p];
      if (_) {
        const S = _.get($);
        if (S)
          return S;
      } else
        _ = this._values[p] = /* @__PURE__ */ new Map();
      _.set($, E);
      const v = this._scope[p] || (this._scope[p] = []), m = v.length;
      return v[m] = u.ref, E.setValue(u, { property: p, itemIndex: m }), E;
    }
    getValue(d, u) {
      const h = this._values[d];
      if (h)
        return h.get(u);
    }
    scopeRefs(d, u = this._values) {
      return this._reduceValues(u, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, u, h) {
      return this._reduceValues(d, (E) => {
        if (E.value === void 0)
          throw new Error(`CodeGen: name "${E}" has no value`);
        return E.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, E) {
      let p = t.nil;
      for (const $ in d) {
        const _ = d[$];
        if (!_)
          continue;
        const v = h[$] = h[$] || /* @__PURE__ */ new Map();
        _.forEach((m) => {
          if (v.has(m))
            return;
          v.set(m, n.Started);
          let S = u(m);
          if (S) {
            const R = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            p = (0, t._)`${p}${R} ${m} = ${S};${this.opts._n}`;
          } else if (S = E == null ? void 0 : E(m))
            p = (0, t._)`${p}${S}${this.opts._n}`;
          else
            throw new r(m);
          v.set(m, n.Completed);
        });
      }
      return p;
    }
  }
  e.ValueScope = o;
})(Ls);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Hr, r = Ls;
  var n = Hr;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return n._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return n.str;
  } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
    return n.strConcat;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return n.nil;
  } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
    return n.getProperty;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return n.stringify;
  } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
    return n.regexpCode;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return n.Name;
  } });
  var s = Ls;
  Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
    return s.Scope;
  } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
    return s.ValueScope;
  } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
    return s.ValueScopeName;
  } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
    return s.varKinds;
  } }), e.operators = {
    GT: new t._Code(">"),
    GTE: new t._Code(">="),
    LT: new t._Code("<"),
    LTE: new t._Code("<="),
    EQ: new t._Code("==="),
    NEQ: new t._Code("!=="),
    NOT: new t._Code("!"),
    OR: new t._Code("||"),
    AND: new t._Code("&&"),
    ADD: new t._Code("+")
  };
  class a {
    optimizeNodes() {
      return this;
    }
    optimizeNames(l, f) {
      return this;
    }
  }
  class i extends a {
    constructor(l, f, P) {
      super(), this.varKind = l, this.name = f, this.rhs = P;
    }
    render({ es5: l, _n: f }) {
      const P = l ? r.varKinds.var : this.varKind, C = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${P} ${this.name}${C};` + f;
    }
    optimizeNames(l, f) {
      if (l[this.name.str])
        return this.rhs && (this.rhs = A(this.rhs, l, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class o extends a {
    constructor(l, f, P) {
      super(), this.lhs = l, this.rhs = f, this.sideEffects = P;
    }
    render({ _n: l }) {
      return `${this.lhs} = ${this.rhs};` + l;
    }
    optimizeNames(l, f) {
      if (!(this.lhs instanceof t.Name && !l[this.lhs.str] && !this.sideEffects))
        return this.rhs = A(this.rhs, l, f), this;
    }
    get names() {
      const l = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return J(l, this.rhs);
    }
  }
  class c extends o {
    constructor(l, f, P, C) {
      super(l, P, C), this.op = f;
    }
    render({ _n: l }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + l;
    }
  }
  class d extends a {
    constructor(l) {
      super(), this.label = l, this.names = {};
    }
    render({ _n: l }) {
      return `${this.label}:` + l;
    }
  }
  class u extends a {
    constructor(l) {
      super(), this.label = l, this.names = {};
    }
    render({ _n: l }) {
      return `break${this.label ? ` ${this.label}` : ""};` + l;
    }
  }
  class h extends a {
    constructor(l) {
      super(), this.error = l;
    }
    render({ _n: l }) {
      return `throw ${this.error};` + l;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(l) {
      super(), this.code = l;
    }
    render({ _n: l }) {
      return `${this.code};` + l;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(l, f) {
      return this.code = A(this.code, l, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class p extends a {
    constructor(l = []) {
      super(), this.nodes = l;
    }
    render(l) {
      return this.nodes.reduce((f, P) => f + P.render(l), "");
    }
    optimizeNodes() {
      const { nodes: l } = this;
      let f = l.length;
      for (; f--; ) {
        const P = l[f].optimizeNodes();
        Array.isArray(P) ? l.splice(f, 1, ...P) : P ? l[f] = P : l.splice(f, 1);
      }
      return l.length > 0 ? this : void 0;
    }
    optimizeNames(l, f) {
      const { nodes: P } = this;
      let C = P.length;
      for (; C--; ) {
        const M = P[C];
        M.optimizeNames(l, f) || (L(l, M.names), P.splice(C, 1));
      }
      return P.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((l, f) => Y(l, f.names), {});
    }
  }
  class $ extends p {
    render(l) {
      return "{" + l._n + super.render(l) + "}" + l._n;
    }
  }
  class _ extends p {
  }
  class v extends $ {
  }
  v.kind = "else";
  class m extends $ {
    constructor(l, f) {
      super(f), this.condition = l;
    }
    render(l) {
      let f = `if(${this.condition})` + super.render(l);
      return this.else && (f += "else " + this.else.render(l)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const l = this.condition;
      if (l === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const P = f.optimizeNodes();
        f = this.else = Array.isArray(P) ? new v(P) : P;
      }
      if (f)
        return l === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(K(l), f instanceof m ? [f] : f.nodes);
      if (!(l === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(l, f) {
      var P;
      if (this.else = (P = this.else) === null || P === void 0 ? void 0 : P.optimizeNames(l, f), !!(super.optimizeNames(l, f) || this.else))
        return this.condition = A(this.condition, l, f), this;
    }
    get names() {
      const l = super.names;
      return J(l, this.condition), this.else && Y(l, this.else.names), l;
    }
  }
  m.kind = "if";
  class S extends $ {
  }
  S.kind = "for";
  class R extends S {
    constructor(l) {
      super(), this.iteration = l;
    }
    render(l) {
      return `for(${this.iteration})` + super.render(l);
    }
    optimizeNames(l, f) {
      if (super.optimizeNames(l, f))
        return this.iteration = A(this.iteration, l, f), this;
    }
    get names() {
      return Y(super.names, this.iteration.names);
    }
  }
  class j extends S {
    constructor(l, f, P, C) {
      super(), this.varKind = l, this.name = f, this.from = P, this.to = C;
    }
    render(l) {
      const f = l.es5 ? r.varKinds.var : this.varKind, { name: P, from: C, to: M } = this;
      return `for(${f} ${P}=${C}; ${P}<${M}; ${P}++)` + super.render(l);
    }
    get names() {
      const l = J(super.names, this.from);
      return J(l, this.to);
    }
  }
  class T extends S {
    constructor(l, f, P, C) {
      super(), this.loop = l, this.varKind = f, this.name = P, this.iterable = C;
    }
    render(l) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(l);
    }
    optimizeNames(l, f) {
      if (super.optimizeNames(l, f))
        return this.iterable = A(this.iterable, l, f), this;
    }
    get names() {
      return Y(super.names, this.iterable.names);
    }
  }
  class B extends $ {
    constructor(l, f, P) {
      super(), this.name = l, this.args = f, this.async = P;
    }
    render(l) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(l);
    }
  }
  B.kind = "func";
  class X extends p {
    render(l) {
      return "return " + super.render(l);
    }
  }
  X.kind = "return";
  class le extends $ {
    render(l) {
      let f = "try" + super.render(l);
      return this.catch && (f += this.catch.render(l)), this.finally && (f += this.finally.render(l)), f;
    }
    optimizeNodes() {
      var l, f;
      return super.optimizeNodes(), (l = this.catch) === null || l === void 0 || l.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(l, f) {
      var P, C;
      return super.optimizeNames(l, f), (P = this.catch) === null || P === void 0 || P.optimizeNames(l, f), (C = this.finally) === null || C === void 0 || C.optimizeNames(l, f), this;
    }
    get names() {
      const l = super.names;
      return this.catch && Y(l, this.catch.names), this.finally && Y(l, this.finally.names), l;
    }
  }
  class ue extends $ {
    constructor(l) {
      super(), this.error = l;
    }
    render(l) {
      return `catch(${this.error})` + super.render(l);
    }
  }
  ue.kind = "catch";
  class me extends $ {
    render(l) {
      return "finally" + super.render(l);
    }
  }
  me.kind = "finally";
  class U {
    constructor(l, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = l, this._scope = new r.Scope({ parent: l }), this._nodes = [new _()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(l) {
      return this._scope.name(l);
    }
    // reserves unique name in the external scope
    scopeName(l) {
      return this._extScope.name(l);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(l, f) {
      const P = this._extScope.value(l, f);
      return (this._values[P.prefix] || (this._values[P.prefix] = /* @__PURE__ */ new Set())).add(P), P;
    }
    getScopeValue(l, f) {
      return this._extScope.getValue(l, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(l) {
      return this._extScope.scopeRefs(l, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(l, f, P, C) {
      const M = this._scope.toName(f);
      return P !== void 0 && C && (this._constants[M.str] = P), this._leafNode(new i(l, M, P)), M;
    }
    // `const` declaration (`var` in es5 mode)
    const(l, f, P) {
      return this._def(r.varKinds.const, l, f, P);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(l, f, P) {
      return this._def(r.varKinds.let, l, f, P);
    }
    // `var` declaration with optional assignment
    var(l, f, P) {
      return this._def(r.varKinds.var, l, f, P);
    }
    // assignment code
    assign(l, f, P) {
      return this._leafNode(new o(l, f, P));
    }
    // `+=` code
    add(l, f) {
      return this._leafNode(new c(l, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(l) {
      return typeof l == "function" ? l() : l !== t.nil && this._leafNode(new E(l)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...l) {
      const f = ["{"];
      for (const [P, C] of l)
        f.length > 1 && f.push(","), f.push(P), (P !== C || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, C));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(l, f, P) {
      if (this._blockNode(new m(l)), f && P)
        this.code(f).else().code(P).endIf();
      else if (f)
        this.code(f).endIf();
      else if (P)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(l) {
      return this._elseNode(new m(l));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new v());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, v);
    }
    _for(l, f) {
      return this._blockNode(l), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(l, f) {
      return this._for(new R(l), f);
    }
    // `for` statement for a range of values
    forRange(l, f, P, C, M = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const W = this._scope.toName(l);
      return this._for(new j(M, W, f, P), () => C(W));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(l, f, P, C = r.varKinds.const) {
      const M = this._scope.toName(l);
      if (this.opts.es5) {
        const W = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${W}.length`, (G) => {
          this.var(M, (0, t._)`${W}[${G}]`), P(M);
        });
      }
      return this._for(new T("of", C, M, f), () => P(M));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(l, f, P, C = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(l, (0, t._)`Object.keys(${f})`, P);
      const M = this._scope.toName(l);
      return this._for(new T("in", C, M, f), () => P(M));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(S);
    }
    // `label` statement
    label(l) {
      return this._leafNode(new d(l));
    }
    // `break` statement
    break(l) {
      return this._leafNode(new u(l));
    }
    // `return` statement
    return(l) {
      const f = new X();
      if (this._blockNode(f), this.code(l), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(X);
    }
    // `try` statement
    try(l, f, P) {
      if (!f && !P)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const C = new le();
      if (this._blockNode(C), this.code(l), f) {
        const M = this.name("e");
        this._currNode = C.catch = new ue(M), f(M);
      }
      return P && (this._currNode = C.finally = new me(), this.code(P)), this._endBlockNode(ue, me);
    }
    // `throw` statement
    throw(l) {
      return this._leafNode(new h(l));
    }
    // start self-balancing block
    block(l, f) {
      return this._blockStarts.push(this._nodes.length), l && this.code(l).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(l) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const P = this._nodes.length - f;
      if (P < 0 || l !== void 0 && P !== l)
        throw new Error(`CodeGen: wrong number of nodes: ${P} vs ${l} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(l, f = t.nil, P, C) {
      return this._blockNode(new B(l, f, P)), C && this.code(C).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(B);
    }
    optimize(l = 1) {
      for (; l-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(l) {
      return this._currNode.nodes.push(l), this;
    }
    _blockNode(l) {
      this._currNode.nodes.push(l), this._nodes.push(l);
    }
    _endBlockNode(l, f) {
      const P = this._currNode;
      if (P instanceof l || f && P instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${l.kind}/${f.kind}` : l.kind}"`);
    }
    _elseNode(l) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = l, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const l = this._nodes;
      return l[l.length - 1];
    }
    set _currNode(l) {
      const f = this._nodes;
      f[f.length - 1] = l;
    }
  }
  e.CodeGen = U;
  function Y(w, l) {
    for (const f in l)
      w[f] = (w[f] || 0) + (l[f] || 0);
    return w;
  }
  function J(w, l) {
    return l instanceof t._CodeOrName ? Y(w, l.names) : w;
  }
  function A(w, l, f) {
    if (w instanceof t.Name)
      return P(w);
    if (!C(w))
      return w;
    return new t._Code(w._items.reduce((M, W) => (W instanceof t.Name && (W = P(W)), W instanceof t._Code ? M.push(...W._items) : M.push(W), M), []));
    function P(M) {
      const W = f[M.str];
      return W === void 0 || l[M.str] !== 1 ? M : (delete l[M.str], W);
    }
    function C(M) {
      return M instanceof t._Code && M._items.some((W) => W instanceof t.Name && l[W.str] === 1 && f[W.str] !== void 0);
    }
  }
  function L(w, l) {
    for (const f in l)
      w[f] = (w[f] || 0) - (l[f] || 0);
  }
  function K(w) {
    return typeof w == "boolean" || typeof w == "number" || w === null ? !w : (0, t._)`!${N(w)}`;
  }
  e.not = K;
  const F = g(e.operators.AND);
  function Q(...w) {
    return w.reduce(F);
  }
  e.and = Q;
  const q = g(e.operators.OR);
  function I(...w) {
    return w.reduce(q);
  }
  e.or = I;
  function g(w) {
    return (l, f) => l === t.nil ? f : f === t.nil ? l : (0, t._)`${N(l)} ${w} ${N(f)}`;
  }
  function N(w) {
    return w instanceof t.Name ? w : (0, t._)`(${w})`;
  }
})(se);
var H = {};
Object.defineProperty(H, "__esModule", { value: !0 });
H.checkStrictMode = H.getErrorPath = H.Type = H.useFunc = H.setEvaluated = H.evaluatedPropsToName = H.mergeEvaluated = H.eachItem = H.unescapeJsonPointer = H.escapeJsonPointer = H.escapeFragment = H.unescapeFragment = H.schemaRefOrVal = H.schemaHasRulesButRef = H.schemaHasRules = H.checkUnknownRules = H.alwaysValidSchema = H.toHash = void 0;
const $e = se, k$ = Hr;
function T$(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
H.toHash = T$;
function A$(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (pl(e, t), !$l(t, e.self.RULES.all));
}
H.alwaysValidSchema = A$;
function pl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || _l(e, `unknown keyword: "${a}"`);
}
H.checkUnknownRules = pl;
function $l(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
H.schemaHasRules = $l;
function C$(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
H.schemaHasRulesButRef = C$;
function D$({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, $e._)`${r}`;
  }
  return (0, $e._)`${e}${t}${(0, $e.getProperty)(n)}`;
}
H.schemaRefOrVal = D$;
function M$(e) {
  return yl(decodeURIComponent(e));
}
H.unescapeFragment = M$;
function L$(e) {
  return encodeURIComponent(Ya(e));
}
H.escapeFragment = L$;
function Ya(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
H.escapeJsonPointer = Ya;
function yl(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
H.unescapeJsonPointer = yl;
function V$(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
H.eachItem = V$;
function Ri({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, i, o) => {
    const c = i === void 0 ? a : i instanceof $e.Name ? (a instanceof $e.Name ? e(s, a, i) : t(s, a, i), i) : a instanceof $e.Name ? (t(s, i, a), a) : r(a, i);
    return o === $e.Name && !(c instanceof $e.Name) ? n(s, c) : c;
  };
}
H.mergeEvaluated = {
  props: Ri({
    mergeNames: (e, t, r) => e.if((0, $e._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, $e._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, $e._)`${r} || {}`).code((0, $e._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, $e._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, $e._)`${r} || {}`), Qa(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: gl
  }),
  items: Ri({
    mergeNames: (e, t, r) => e.if((0, $e._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, $e._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, $e._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, $e._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function gl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, $e._)`{}`);
  return t !== void 0 && Qa(e, r, t), r;
}
H.evaluatedPropsToName = gl;
function Qa(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, $e._)`${t}${(0, $e.getProperty)(n)}`, !0));
}
H.setEvaluated = Qa;
const Oi = {};
function F$(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Oi[t.code] || (Oi[t.code] = new k$._Code(t.code))
  });
}
H.useFunc = F$;
var Vs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Vs || (H.Type = Vs = {}));
function z$(e, t, r) {
  if (e instanceof $e.Name) {
    const n = t === Vs.Num;
    return r ? n ? (0, $e._)`"[" + ${e} + "]"` : (0, $e._)`"['" + ${e} + "']"` : n ? (0, $e._)`"/" + ${e}` : (0, $e._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, $e.getProperty)(e).toString() : "/" + Ya(e);
}
H.getErrorPath = z$;
function _l(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
H.checkStrictMode = _l;
var lt = {};
Object.defineProperty(lt, "__esModule", { value: !0 });
const Ae = se, U$ = {
  // validation function arguments
  data: new Ae.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ae.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ae.Name("instancePath"),
  parentData: new Ae.Name("parentData"),
  parentDataProperty: new Ae.Name("parentDataProperty"),
  rootData: new Ae.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ae.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ae.Name("vErrors"),
  // null or array of validation errors
  errors: new Ae.Name("errors"),
  // counter of validation errors
  this: new Ae.Name("this"),
  // "globals"
  self: new Ae.Name("self"),
  scope: new Ae.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ae.Name("json"),
  jsonPos: new Ae.Name("jsonPos"),
  jsonLen: new Ae.Name("jsonLen"),
  jsonPart: new Ae.Name("jsonPart")
};
lt.default = U$;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = se, r = H, n = lt;
  e.keywordError = {
    message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: v, schemaType: m }) => m ? (0, t.str)`"${v}" keyword must be ${m} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
  };
  function s(v, m = e.keywordError, S, R) {
    const { it: j } = v, { gen: T, compositeRule: B, allErrors: X } = j, le = h(v, m, S);
    R ?? (B || X) ? c(T, le) : d(j, (0, t._)`[${le}]`);
  }
  e.reportError = s;
  function a(v, m = e.keywordError, S) {
    const { it: R } = v, { gen: j, compositeRule: T, allErrors: B } = R, X = h(v, m, S);
    c(j, X), T || B || d(R, n.default.vErrors);
  }
  e.reportExtraError = a;
  function i(v, m) {
    v.assign(n.default.errors, m), v.if((0, t._)`${n.default.vErrors} !== null`, () => v.if(m, () => v.assign((0, t._)`${n.default.vErrors}.length`, m), () => v.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = i;
  function o({ gen: v, keyword: m, schemaValue: S, data: R, errsCount: j, it: T }) {
    if (j === void 0)
      throw new Error("ajv implementation error");
    const B = v.name("err");
    v.forRange("i", j, n.default.errors, (X) => {
      v.const(B, (0, t._)`${n.default.vErrors}[${X}]`), v.if((0, t._)`${B}.instancePath === undefined`, () => v.assign((0, t._)`${B}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), v.assign((0, t._)`${B}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && (v.assign((0, t._)`${B}.schema`, S), v.assign((0, t._)`${B}.data`, R));
    });
  }
  e.extendErrors = o;
  function c(v, m) {
    const S = v.const("err", m);
    v.if((0, t._)`${n.default.vErrors} === null`, () => v.assign(n.default.vErrors, (0, t._)`[${S}]`), (0, t._)`${n.default.vErrors}.push(${S})`), v.code((0, t._)`${n.default.errors}++`);
  }
  function d(v, m) {
    const { gen: S, validateName: R, schemaEnv: j } = v;
    j.$async ? S.throw((0, t._)`new ${v.ValidationError}(${m})`) : (S.assign((0, t._)`${R}.errors`, m), S.return(!1));
  }
  const u = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(v, m, S) {
    const { createErrors: R } = v.it;
    return R === !1 ? (0, t._)`{}` : E(v, m, S);
  }
  function E(v, m, S = {}) {
    const { gen: R, it: j } = v, T = [
      p(j, S),
      $(v, S)
    ];
    return _(v, m, T), R.object(...T);
  }
  function p({ errorPath: v }, { instancePath: m }) {
    const S = m ? (0, t.str)`${v}${(0, r.getErrorPath)(m, r.Type.Str)}` : v;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, S)];
  }
  function $({ keyword: v, it: { errSchemaPath: m } }, { schemaPath: S, parentSchema: R }) {
    let j = R ? m : (0, t.str)`${m}/${v}`;
    return S && (j = (0, t.str)`${j}${(0, r.getErrorPath)(S, r.Type.Str)}`), [u.schemaPath, j];
  }
  function _(v, { params: m, message: S }, R) {
    const { keyword: j, data: T, schemaValue: B, it: X } = v, { opts: le, propertyName: ue, topSchemaRef: me, schemaPath: U } = X;
    R.push([u.keyword, j], [u.params, typeof m == "function" ? m(v) : m || (0, t._)`{}`]), le.messages && R.push([u.message, typeof S == "function" ? S(v) : S]), le.verbose && R.push([u.schema, B], [u.parentSchema, (0, t._)`${me}${U}`], [n.default.data, T]), ue && R.push([u.propertyName, ue]);
  }
})(Xr);
var Ii;
function q$() {
  if (Ii) return Ut;
  Ii = 1, Object.defineProperty(Ut, "__esModule", { value: !0 }), Ut.boolOrEmptySchema = Ut.topBoolOrEmptySchema = void 0;
  const e = Xr, t = se, r = lt, n = {
    message: "boolean schema is false"
  };
  function s(o) {
    const { gen: c, schema: d, validateName: u } = o;
    d === !1 ? i(o, !1) : typeof d == "object" && d.$async === !0 ? c.return(r.default.data) : (c.assign((0, t._)`${u}.errors`, null), c.return(!0));
  }
  Ut.topBoolOrEmptySchema = s;
  function a(o, c) {
    const { gen: d, schema: u } = o;
    u === !1 ? (d.var(c, !1), i(o)) : d.var(c, !0);
  }
  Ut.boolOrEmptySchema = a;
  function i(o, c) {
    const { gen: d, data: u } = o, h = {
      gen: d,
      keyword: "false schema",
      data: u,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: o
    };
    (0, e.reportError)(h, n, void 0, c);
  }
  return Ut;
}
var Ne = {}, Yt = {};
Object.defineProperty(Yt, "__esModule", { value: !0 });
Yt.getRules = Yt.isJSONType = void 0;
const K$ = ["string", "number", "integer", "boolean", "null", "object", "array"], G$ = new Set(K$);
function H$(e) {
  return typeof e == "string" && G$.has(e);
}
Yt.isJSONType = H$;
function B$() {
  const e = {
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...e, integer: !0, boolean: !0, null: !0 },
    rules: [{ rules: [] }, e.number, e.string, e.array, e.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
Yt.getRules = B$;
var gt = {};
Object.defineProperty(gt, "__esModule", { value: !0 });
gt.shouldUseRule = gt.shouldUseGroup = gt.schemaHasRulesForType = void 0;
function J$({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && vl(e, n);
}
gt.schemaHasRulesForType = J$;
function vl(e, t) {
  return t.rules.some((r) => wl(e, r));
}
gt.shouldUseGroup = vl;
function wl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
gt.shouldUseRule = wl;
Object.defineProperty(Ne, "__esModule", { value: !0 });
Ne.reportTypeError = Ne.checkDataTypes = Ne.checkDataType = Ne.coerceAndCheckDataType = Ne.getJSONTypes = Ne.getSchemaTypes = Ne.DataType = void 0;
const W$ = Yt, X$ = gt, Y$ = Xr, re = se, El = H;
var cr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(cr || (Ne.DataType = cr = {}));
function Q$(e) {
  const t = bl(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
Ne.getSchemaTypes = Q$;
function bl(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(W$.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Ne.getJSONTypes = bl;
function Z$(e, t) {
  const { gen: r, data: n, opts: s } = e, a = x$(t, s.coerceTypes), i = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, X$.schemaHasRulesForType)(e, t[0]));
  if (i) {
    const o = Za(t, n, s.strictNumbers, cr.Wrong);
    r.if(o, () => {
      a.length ? ey(e, t, a) : xa(e);
    });
  }
  return i;
}
Ne.coerceAndCheckDataType = Z$;
const Sl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function x$(e, t) {
  return t ? e.filter((r) => Sl.has(r) || t === "array" && r === "array") : [];
}
function ey(e, t, r) {
  const { gen: n, data: s, opts: a } = e, i = n.let("dataType", (0, re._)`typeof ${s}`), o = n.let("coerced", (0, re._)`undefined`);
  a.coerceTypes === "array" && n.if((0, re._)`${i} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, re._)`${s}[0]`).assign(i, (0, re._)`typeof ${s}`).if(Za(t, s, a.strictNumbers), () => n.assign(o, s))), n.if((0, re._)`${o} !== undefined`);
  for (const d of r)
    (Sl.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), xa(e), n.endIf(), n.if((0, re._)`${o} !== undefined`, () => {
    n.assign(s, o), ty(e, o);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, re._)`${i} == "number" || ${i} == "boolean"`).assign(o, (0, re._)`"" + ${s}`).elseIf((0, re._)`${s} === null`).assign(o, (0, re._)`""`);
        return;
      case "number":
        n.elseIf((0, re._)`${i} == "boolean" || ${s} === null
              || (${i} == "string" && ${s} && ${s} == +${s})`).assign(o, (0, re._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, re._)`${i} === "boolean" || ${s} === null
              || (${i} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(o, (0, re._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, re._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(o, !1).elseIf((0, re._)`${s} === "true" || ${s} === 1`).assign(o, !0);
        return;
      case "null":
        n.elseIf((0, re._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(o, null);
        return;
      case "array":
        n.elseIf((0, re._)`${i} === "string" || ${i} === "number"
              || ${i} === "boolean" || ${s} === null`).assign(o, (0, re._)`[${s}]`);
    }
  }
}
function ty({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, re._)`${t} !== undefined`, () => e.assign((0, re._)`${t}[${r}]`, n));
}
function Fs(e, t, r, n = cr.Correct) {
  const s = n === cr.Correct ? re.operators.EQ : re.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, re._)`${t} ${s} null`;
    case "array":
      a = (0, re._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, re._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = i((0, re._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = i();
      break;
    default:
      return (0, re._)`typeof ${t} ${s} ${e}`;
  }
  return n === cr.Correct ? a : (0, re.not)(a);
  function i(o = re.nil) {
    return (0, re.and)((0, re._)`typeof ${t} == "number"`, o, r ? (0, re._)`isFinite(${t})` : re.nil);
  }
}
Ne.checkDataType = Fs;
function Za(e, t, r, n) {
  if (e.length === 1)
    return Fs(e[0], t, r, n);
  let s;
  const a = (0, El.toHash)(e);
  if (a.array && a.object) {
    const i = (0, re._)`typeof ${t} != "object"`;
    s = a.null ? i : (0, re._)`!${t} || ${i}`, delete a.null, delete a.array, delete a.object;
  } else
    s = re.nil;
  a.number && delete a.integer;
  for (const i in a)
    s = (0, re.and)(s, Fs(i, t, r, n));
  return s;
}
Ne.checkDataTypes = Za;
const ry = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, re._)`{type: ${e}}` : (0, re._)`{type: ${t}}`
};
function xa(e) {
  const t = ny(e);
  (0, Y$.reportError)(t, ry);
}
Ne.reportTypeError = xa;
function ny(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, El.schemaRefOrVal)(e, n, "type");
  return {
    gen: t,
    keyword: "type",
    data: r,
    schema: n.type,
    schemaCode: s,
    schemaValue: s,
    parentSchema: n,
    params: {},
    it: e
  };
}
var Ir = {}, ji;
function sy() {
  if (ji) return Ir;
  ji = 1, Object.defineProperty(Ir, "__esModule", { value: !0 }), Ir.assignDefaults = void 0;
  const e = se, t = H;
  function r(s, a) {
    const { properties: i, items: o } = s.schema;
    if (a === "object" && i)
      for (const c in i)
        n(s, c, i[c].default);
    else a === "array" && Array.isArray(o) && o.forEach((c, d) => n(s, d, c.default));
  }
  Ir.assignDefaults = r;
  function n(s, a, i) {
    const { gen: o, compositeRule: c, data: d, opts: u } = s;
    if (i === void 0)
      return;
    const h = (0, e._)`${d}${(0, e.getProperty)(a)}`;
    if (c) {
      (0, t.checkStrictMode)(s, `default is ignored for: ${h}`);
      return;
    }
    let E = (0, e._)`${h} === undefined`;
    u.useDefaults === "empty" && (E = (0, e._)`${E} || ${h} === null || ${h} === ""`), o.if(E, (0, e._)`${h} = ${(0, e.stringify)(i)}`);
  }
  return Ir;
}
var Ye = {}, oe = {};
Object.defineProperty(oe, "__esModule", { value: !0 });
oe.validateUnion = oe.validateArray = oe.usePattern = oe.callValidateCode = oe.schemaProperties = oe.allSchemaProperties = oe.noPropertyInData = oe.propertyInData = oe.isOwnProperty = oe.hasPropFunc = oe.reportMissingProp = oe.checkMissingProp = oe.checkReportMissingProp = void 0;
const _e = se, eo = H, Nt = lt, ay = H;
function oy(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ro(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, _e._)`${t}` }, !0), e.error();
  });
}
oe.checkReportMissingProp = oy;
function iy({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, _e.or)(...n.map((a) => (0, _e.and)(ro(e, t, a, r.ownProperties), (0, _e._)`${s} = ${a}`)));
}
oe.checkMissingProp = iy;
function cy(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
oe.reportMissingProp = cy;
function Pl(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, _e._)`Object.prototype.hasOwnProperty`
  });
}
oe.hasPropFunc = Pl;
function to(e, t, r) {
  return (0, _e._)`${Pl(e)}.call(${t}, ${r})`;
}
oe.isOwnProperty = to;
function ly(e, t, r, n) {
  const s = (0, _e._)`${t}${(0, _e.getProperty)(r)} !== undefined`;
  return n ? (0, _e._)`${s} && ${to(e, t, r)}` : s;
}
oe.propertyInData = ly;
function ro(e, t, r, n) {
  const s = (0, _e._)`${t}${(0, _e.getProperty)(r)} === undefined`;
  return n ? (0, _e.or)(s, (0, _e.not)(to(e, t, r))) : s;
}
oe.noPropertyInData = ro;
function Nl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
oe.allSchemaProperties = Nl;
function uy(e, t) {
  return Nl(t).filter((r) => !(0, eo.alwaysValidSchema)(e, t[r]));
}
oe.schemaProperties = uy;
function dy({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: i }, o, c, d) {
  const u = d ? (0, _e._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Nt.default.instancePath, (0, _e.strConcat)(Nt.default.instancePath, a)],
    [Nt.default.parentData, i.parentData],
    [Nt.default.parentDataProperty, i.parentDataProperty],
    [Nt.default.rootData, Nt.default.rootData]
  ];
  i.opts.dynamicRef && h.push([Nt.default.dynamicAnchors, Nt.default.dynamicAnchors]);
  const E = (0, _e._)`${u}, ${r.object(...h)}`;
  return c !== _e.nil ? (0, _e._)`${o}.call(${c}, ${E})` : (0, _e._)`${o}(${E})`;
}
oe.callValidateCode = dy;
const fy = (0, _e._)`new RegExp`;
function hy({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, _e._)`${s.code === "new RegExp" ? fy : (0, ay.useFunc)(e, s)}(${r}, ${n})`
  });
}
oe.usePattern = hy;
function my(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const o = t.let("valid", !0);
    return i(() => t.assign(o, !1)), o;
  }
  return t.var(a, !0), i(() => t.break()), a;
  function i(o) {
    const c = t.const("len", (0, _e._)`${r}.length`);
    t.forRange("i", 0, c, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: eo.Type.Num
      }, a), t.if((0, _e.not)(a), o);
    });
  }
}
oe.validateArray = my;
function py(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, eo.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const i = t.let("valid", !1), o = t.name("_valid");
  t.block(() => r.forEach((c, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, o);
    t.assign(i, (0, _e._)`${i} || ${o}`), e.mergeValidEvaluated(u, o) || t.if((0, _e.not)(i));
  })), e.result(i, () => e.reset(), () => e.error(!0));
}
oe.validateUnion = py;
var ki;
function $y() {
  if (ki) return Ye;
  ki = 1, Object.defineProperty(Ye, "__esModule", { value: !0 }), Ye.validateKeywordUsage = Ye.validSchemaType = Ye.funcKeywordCode = Ye.macroKeywordCode = void 0;
  const e = se, t = lt, r = oe, n = Xr;
  function s(E, p) {
    const { gen: $, keyword: _, schema: v, parentSchema: m, it: S } = E, R = p.macro.call(S.self, v, m, S), j = d($, _, R);
    S.opts.validateSchema !== !1 && S.self.validateSchema(R, !0);
    const T = $.name("valid");
    E.subschema({
      schema: R,
      schemaPath: e.nil,
      errSchemaPath: `${S.errSchemaPath}/${_}`,
      topSchemaRef: j,
      compositeRule: !0
    }, T), E.pass(T, () => E.error(!0));
  }
  Ye.macroKeywordCode = s;
  function a(E, p) {
    var $;
    const { gen: _, keyword: v, schema: m, parentSchema: S, $data: R, it: j } = E;
    c(j, p);
    const T = !R && p.compile ? p.compile.call(j.self, m, S, j) : p.validate, B = d(_, v, T), X = _.let("valid");
    E.block$data(X, le), E.ok(($ = p.valid) !== null && $ !== void 0 ? $ : X);
    function le() {
      if (p.errors === !1)
        U(), p.modifying && i(E), Y(() => E.error());
      else {
        const J = p.async ? ue() : me();
        p.modifying && i(E), Y(() => o(E, J));
      }
    }
    function ue() {
      const J = _.let("ruleErrs", null);
      return _.try(() => U((0, e._)`await `), (A) => _.assign(X, !1).if((0, e._)`${A} instanceof ${j.ValidationError}`, () => _.assign(J, (0, e._)`${A}.errors`), () => _.throw(A))), J;
    }
    function me() {
      const J = (0, e._)`${B}.errors`;
      return _.assign(J, null), U(e.nil), J;
    }
    function U(J = p.async ? (0, e._)`await ` : e.nil) {
      const A = j.opts.passContext ? t.default.this : t.default.self, L = !("compile" in p && !R || p.schema === !1);
      _.assign(X, (0, e._)`${J}${(0, r.callValidateCode)(E, B, A, L)}`, p.modifying);
    }
    function Y(J) {
      var A;
      _.if((0, e.not)((A = p.valid) !== null && A !== void 0 ? A : X), J);
    }
  }
  Ye.funcKeywordCode = a;
  function i(E) {
    const { gen: p, data: $, it: _ } = E;
    p.if(_.parentData, () => p.assign($, (0, e._)`${_.parentData}[${_.parentDataProperty}]`));
  }
  function o(E, p) {
    const { gen: $ } = E;
    $.if((0, e._)`Array.isArray(${p})`, () => {
      $.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${p} : ${t.default.vErrors}.concat(${p})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(E);
    }, () => E.error());
  }
  function c({ schemaEnv: E }, p) {
    if (p.async && !E.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(E, p, $) {
    if ($ === void 0)
      throw new Error(`keyword "${p}" failed to compile`);
    return E.scopeValue("keyword", typeof $ == "function" ? { ref: $ } : { ref: $, code: (0, e.stringify)($) });
  }
  function u(E, p, $ = !1) {
    return !p.length || p.some((_) => _ === "array" ? Array.isArray(E) : _ === "object" ? E && typeof E == "object" && !Array.isArray(E) : typeof E == _ || $ && typeof E > "u");
  }
  Ye.validSchemaType = u;
  function h({ schema: E, opts: p, self: $, errSchemaPath: _ }, v, m) {
    if (Array.isArray(v.keyword) ? !v.keyword.includes(m) : v.keyword !== m)
      throw new Error("ajv implementation error");
    const S = v.dependencies;
    if (S != null && S.some((R) => !Object.prototype.hasOwnProperty.call(E, R)))
      throw new Error(`parent schema must have dependencies of ${m}: ${S.join(",")}`);
    if (v.validateSchema && !v.validateSchema(E[m])) {
      const j = `keyword "${m}" value is invalid at path "${_}": ` + $.errorsText(v.validateSchema.errors);
      if (p.validateSchema === "log")
        $.logger.error(j);
      else
        throw new Error(j);
    }
  }
  return Ye.validateKeywordUsage = h, Ye;
}
var mt = {}, Ti;
function yy() {
  if (Ti) return mt;
  Ti = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.extendSubschemaMode = mt.extendSubschemaData = mt.getSubschema = void 0;
  const e = se, t = H;
  function r(a, { keyword: i, schemaProp: o, schema: c, schemaPath: d, errSchemaPath: u, topSchemaRef: h }) {
    if (i !== void 0 && c !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (i !== void 0) {
      const E = a.schema[i];
      return o === void 0 ? {
        schema: E,
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(i)}`,
        errSchemaPath: `${a.errSchemaPath}/${i}`
      } : {
        schema: E[o],
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(i)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${i}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (c !== void 0) {
      if (d === void 0 || u === void 0 || h === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: c,
        schemaPath: d,
        topSchemaRef: h,
        errSchemaPath: u
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  mt.getSubschema = r;
  function n(a, i, { dataProp: o, dataPropType: c, data: d, dataTypes: u, propertyName: h }) {
    if (d !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: E } = i;
    if (o !== void 0) {
      const { errorPath: $, dataPathArr: _, opts: v } = i, m = E.let("data", (0, e._)`${i.data}${(0, e.getProperty)(o)}`, !0);
      p(m), a.errorPath = (0, e.str)`${$}${(0, t.getErrorPath)(o, c, v.jsPropertySyntax)}`, a.parentDataProperty = (0, e._)`${o}`, a.dataPathArr = [..._, a.parentDataProperty];
    }
    if (d !== void 0) {
      const $ = d instanceof e.Name ? d : E.let("data", d, !0);
      p($), h !== void 0 && (a.propertyName = h);
    }
    u && (a.dataTypes = u);
    function p($) {
      a.data = $, a.dataLevel = i.dataLevel + 1, a.dataTypes = [], i.definedProperties = /* @__PURE__ */ new Set(), a.parentData = i.data, a.dataNames = [...i.dataNames, $];
    }
  }
  mt.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: i, jtdMetadata: o, compositeRule: c, createErrors: d, allErrors: u }) {
    c !== void 0 && (a.compositeRule = c), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = i, a.jtdMetadata = o;
  }
  return mt.extendSubschemaMode = s, mt;
}
var ke = {}, Rl = { exports: {} }, Tt = Rl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Sn(t, n, s, e, "", e);
};
Tt.keywords = {
  additionalItems: !0,
  items: !0,
  contains: !0,
  additionalProperties: !0,
  propertyNames: !0,
  not: !0,
  if: !0,
  then: !0,
  else: !0
};
Tt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Tt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Tt.skipKeywords = {
  default: !0,
  enum: !0,
  const: !0,
  required: !0,
  maximum: !0,
  minimum: !0,
  exclusiveMaximum: !0,
  exclusiveMinimum: !0,
  multipleOf: !0,
  maxLength: !0,
  minLength: !0,
  pattern: !0,
  format: !0,
  maxItems: !0,
  minItems: !0,
  uniqueItems: !0,
  maxProperties: !0,
  minProperties: !0
};
function Sn(e, t, r, n, s, a, i, o, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, i, o, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Tt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            Sn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in Tt.propsKeywords) {
        if (h && typeof h == "object")
          for (var p in h)
            Sn(e, t, r, h[p], s + "/" + u + "/" + gy(p), a, s, u, n, p);
      } else (u in Tt.keywords || e.allKeys && !(u in Tt.skipKeywords)) && Sn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, i, o, c, d);
  }
}
function gy(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var _y = Rl.exports;
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.getSchemaRefs = ke.resolveUrl = ke.normalizeId = ke._getFullPath = ke.getFullPath = ke.inlineRef = void 0;
const vy = H, wy = Gn, Ey = _y, by = /* @__PURE__ */ new Set([
  "type",
  "format",
  "pattern",
  "maxLength",
  "minLength",
  "maxProperties",
  "minProperties",
  "maxItems",
  "minItems",
  "maximum",
  "minimum",
  "uniqueItems",
  "multipleOf",
  "required",
  "enum",
  "const"
]);
function Sy(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !zs(e) : t ? Ol(e) <= t : !1;
}
ke.inlineRef = Sy;
const Py = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function zs(e) {
  for (const t in e) {
    if (Py.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(zs) || typeof r == "object" && zs(r))
      return !0;
  }
  return !1;
}
function Ol(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !by.has(r) && (typeof e[r] == "object" && (0, vy.eachItem)(e[r], (n) => t += Ol(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Il(e, t = "", r) {
  r !== !1 && (t = lr(t));
  const n = e.parse(t);
  return jl(e, n);
}
ke.getFullPath = Il;
function jl(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
ke._getFullPath = jl;
const Ny = /#\/?$/;
function lr(e) {
  return e ? e.replace(Ny, "") : "";
}
ke.normalizeId = lr;
function Ry(e, t, r) {
  return r = lr(r), e.resolve(t, r);
}
ke.resolveUrl = Ry;
const Oy = /^[a-z_][-a-z0-9._]*$/i;
function Iy(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = lr(e[r] || t), a = { "": s }, i = Il(n, s, !1), o = {}, c = /* @__PURE__ */ new Set();
  return Ey(e, { allKeys: !0 }, (h, E, p, $) => {
    if ($ === void 0)
      return;
    const _ = i + E;
    let v = a[$];
    typeof h[r] == "string" && (v = m.call(this, h[r])), S.call(this, h.$anchor), S.call(this, h.$dynamicAnchor), a[E] = v;
    function m(R) {
      const j = this.opts.uriResolver.resolve;
      if (R = lr(v ? j(v, R) : R), c.has(R))
        throw u(R);
      c.add(R);
      let T = this.refs[R];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, R) : R !== lr(_) && (R[0] === "#" ? (d(h, o[R], R), o[R] = h) : this.refs[R] = _), R;
    }
    function S(R) {
      if (typeof R == "string") {
        if (!Oy.test(R))
          throw new Error(`invalid anchor "${R}"`);
        m.call(this, `#${R}`);
      }
    }
  }), o;
  function d(h, E, p) {
    if (E !== void 0 && !wy(h, E))
      throw u(p);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
ke.getSchemaRefs = Iy;
var Ai;
function Zn() {
  if (Ai) return ht;
  Ai = 1, Object.defineProperty(ht, "__esModule", { value: !0 }), ht.getData = ht.KeywordCxt = ht.validateFunctionCode = void 0;
  const e = q$(), t = Ne, r = gt, n = Ne, s = sy(), a = $y(), i = yy(), o = se, c = lt, d = ke, u = H, h = Xr;
  function E(y) {
    if (T(y) && (X(y), j(y))) {
      v(y);
      return;
    }
    p(y, () => (0, e.topBoolOrEmptySchema)(y));
  }
  ht.validateFunctionCode = E;
  function p({ gen: y, validateName: b, schema: O, schemaEnv: k, opts: D }, V) {
    D.code.es5 ? y.func(b, (0, o._)`${c.default.data}, ${c.default.valCxt}`, k.$async, () => {
      y.code((0, o._)`"use strict"; ${S(O, D)}`), _(y, D), y.code(V);
    }) : y.func(b, (0, o._)`${c.default.data}, ${$(D)}`, k.$async, () => y.code(S(O, D)).code(V));
  }
  function $(y) {
    return (0, o._)`{${c.default.instancePath}="", ${c.default.parentData}, ${c.default.parentDataProperty}, ${c.default.rootData}=${c.default.data}${y.dynamicRef ? (0, o._)`, ${c.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function _(y, b) {
    y.if(c.default.valCxt, () => {
      y.var(c.default.instancePath, (0, o._)`${c.default.valCxt}.${c.default.instancePath}`), y.var(c.default.parentData, (0, o._)`${c.default.valCxt}.${c.default.parentData}`), y.var(c.default.parentDataProperty, (0, o._)`${c.default.valCxt}.${c.default.parentDataProperty}`), y.var(c.default.rootData, (0, o._)`${c.default.valCxt}.${c.default.rootData}`), b.dynamicRef && y.var(c.default.dynamicAnchors, (0, o._)`${c.default.valCxt}.${c.default.dynamicAnchors}`);
    }, () => {
      y.var(c.default.instancePath, (0, o._)`""`), y.var(c.default.parentData, (0, o._)`undefined`), y.var(c.default.parentDataProperty, (0, o._)`undefined`), y.var(c.default.rootData, c.default.data), b.dynamicRef && y.var(c.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function v(y) {
    const { schema: b, opts: O, gen: k } = y;
    p(y, () => {
      O.$comment && b.$comment && J(y), me(y), k.let(c.default.vErrors, null), k.let(c.default.errors, 0), O.unevaluated && m(y), le(y), A(y);
    });
  }
  function m(y) {
    const { gen: b, validateName: O } = y;
    y.evaluated = b.const("evaluated", (0, o._)`${O}.evaluated`), b.if((0, o._)`${y.evaluated}.dynamicProps`, () => b.assign((0, o._)`${y.evaluated}.props`, (0, o._)`undefined`)), b.if((0, o._)`${y.evaluated}.dynamicItems`, () => b.assign((0, o._)`${y.evaluated}.items`, (0, o._)`undefined`));
  }
  function S(y, b) {
    const O = typeof y == "object" && y[b.schemaId];
    return O && (b.code.source || b.code.process) ? (0, o._)`/*# sourceURL=${O} */` : o.nil;
  }
  function R(y, b) {
    if (T(y) && (X(y), j(y))) {
      B(y, b);
      return;
    }
    (0, e.boolOrEmptySchema)(y, b);
  }
  function j({ schema: y, self: b }) {
    if (typeof y == "boolean")
      return !y;
    for (const O in y)
      if (b.RULES.all[O])
        return !0;
    return !1;
  }
  function T(y) {
    return typeof y.schema != "boolean";
  }
  function B(y, b) {
    const { schema: O, gen: k, opts: D } = y;
    D.$comment && O.$comment && J(y), U(y), Y(y);
    const V = k.const("_errs", c.default.errors);
    le(y, V), k.var(b, (0, o._)`${V} === ${c.default.errors}`);
  }
  function X(y) {
    (0, u.checkUnknownRules)(y), ue(y);
  }
  function le(y, b) {
    if (y.opts.jtd)
      return K(y, [], !1, b);
    const O = (0, t.getSchemaTypes)(y.schema), k = (0, t.coerceAndCheckDataType)(y, O);
    K(y, O, !k, b);
  }
  function ue(y) {
    const { schema: b, errSchemaPath: O, opts: k, self: D } = y;
    b.$ref && k.ignoreKeywordsWithRef && (0, u.schemaHasRulesButRef)(b, D.RULES) && D.logger.warn(`$ref: keywords ignored in schema at path "${O}"`);
  }
  function me(y) {
    const { schema: b, opts: O } = y;
    b.default !== void 0 && O.useDefaults && O.strictSchema && (0, u.checkStrictMode)(y, "default is ignored in the schema root");
  }
  function U(y) {
    const b = y.schema[y.opts.schemaId];
    b && (y.baseId = (0, d.resolveUrl)(y.opts.uriResolver, y.baseId, b));
  }
  function Y(y) {
    if (y.schema.$async && !y.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function J({ gen: y, schemaEnv: b, schema: O, errSchemaPath: k, opts: D }) {
    const V = O.$comment;
    if (D.$comment === !0)
      y.code((0, o._)`${c.default.self}.logger.log(${V})`);
    else if (typeof D.$comment == "function") {
      const ie = (0, o.str)`${k}/$comment`, Ee = y.scopeValue("root", { ref: b.root });
      y.code((0, o._)`${c.default.self}.opts.$comment(${V}, ${ie}, ${Ee}.schema)`);
    }
  }
  function A(y) {
    const { gen: b, schemaEnv: O, validateName: k, ValidationError: D, opts: V } = y;
    O.$async ? b.if((0, o._)`${c.default.errors} === 0`, () => b.return(c.default.data), () => b.throw((0, o._)`new ${D}(${c.default.vErrors})`)) : (b.assign((0, o._)`${k}.errors`, c.default.vErrors), V.unevaluated && L(y), b.return((0, o._)`${c.default.errors} === 0`));
  }
  function L({ gen: y, evaluated: b, props: O, items: k }) {
    O instanceof o.Name && y.assign((0, o._)`${b}.props`, O), k instanceof o.Name && y.assign((0, o._)`${b}.items`, k);
  }
  function K(y, b, O, k) {
    const { gen: D, schema: V, data: ie, allErrors: Ee, opts: de, self: fe } = y, { RULES: ce } = fe;
    if (V.$ref && (de.ignoreKeywordsWithRef || !(0, u.schemaHasRulesButRef)(V, ce))) {
      D.block(() => C(y, "$ref", ce.all.$ref.definition));
      return;
    }
    de.jtd || Q(y, b), D.block(() => {
      for (const ye of ce.rules)
        Ue(ye);
      Ue(ce.post);
    });
    function Ue(ye) {
      (0, r.shouldUseGroup)(V, ye) && (ye.type ? (D.if((0, n.checkDataType)(ye.type, ie, de.strictNumbers)), F(y, ye), b.length === 1 && b[0] === ye.type && O && (D.else(), (0, n.reportTypeError)(y)), D.endIf()) : F(y, ye), Ee || D.if((0, o._)`${c.default.errors} === ${k || 0}`));
    }
  }
  function F(y, b) {
    const { gen: O, schema: k, opts: { useDefaults: D } } = y;
    D && (0, s.assignDefaults)(y, b.type), O.block(() => {
      for (const V of b.rules)
        (0, r.shouldUseRule)(k, V) && C(y, V.keyword, V.definition, b.type);
    });
  }
  function Q(y, b) {
    y.schemaEnv.meta || !y.opts.strictTypes || (q(y, b), y.opts.allowUnionTypes || I(y, b), g(y, y.dataTypes));
  }
  function q(y, b) {
    if (b.length) {
      if (!y.dataTypes.length) {
        y.dataTypes = b;
        return;
      }
      b.forEach((O) => {
        w(y.dataTypes, O) || f(y, `type "${O}" not allowed by context "${y.dataTypes.join(",")}"`);
      }), l(y, b);
    }
  }
  function I(y, b) {
    b.length > 1 && !(b.length === 2 && b.includes("null")) && f(y, "use allowUnionTypes to allow union type keyword");
  }
  function g(y, b) {
    const O = y.self.RULES.all;
    for (const k in O) {
      const D = O[k];
      if (typeof D == "object" && (0, r.shouldUseRule)(y.schema, D)) {
        const { type: V } = D.definition;
        V.length && !V.some((ie) => N(b, ie)) && f(y, `missing type "${V.join(",")}" for keyword "${k}"`);
      }
    }
  }
  function N(y, b) {
    return y.includes(b) || b === "number" && y.includes("integer");
  }
  function w(y, b) {
    return y.includes(b) || b === "integer" && y.includes("number");
  }
  function l(y, b) {
    const O = [];
    for (const k of y.dataTypes)
      w(b, k) ? O.push(k) : b.includes("integer") && k === "number" && O.push("integer");
    y.dataTypes = O;
  }
  function f(y, b) {
    const O = y.schemaEnv.baseId + y.errSchemaPath;
    b += ` at "${O}" (strictTypes)`, (0, u.checkStrictMode)(y, b, y.opts.strictTypes);
  }
  class P {
    constructor(b, O, k) {
      if ((0, a.validateKeywordUsage)(b, O, k), this.gen = b.gen, this.allErrors = b.allErrors, this.keyword = k, this.data = b.data, this.schema = b.schema[k], this.$data = O.$data && b.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, u.schemaRefOrVal)(b, this.schema, k, this.$data), this.schemaType = O.schemaType, this.parentSchema = b.schema, this.params = {}, this.it = b, this.def = O, this.$data)
        this.schemaCode = b.gen.const("vSchema", G(this.$data, b));
      else if (this.schemaCode = this.schemaValue, !(0, a.validSchemaType)(this.schema, O.schemaType, O.allowUndefined))
        throw new Error(`${k} value must be ${JSON.stringify(O.schemaType)}`);
      ("code" in O ? O.trackErrors : O.errors !== !1) && (this.errsCount = b.gen.const("_errs", c.default.errors));
    }
    result(b, O, k) {
      this.failResult((0, o.not)(b), O, k);
    }
    failResult(b, O, k) {
      this.gen.if(b), k ? k() : this.error(), O ? (this.gen.else(), O(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(b, O) {
      this.failResult((0, o.not)(b), void 0, O);
    }
    fail(b) {
      if (b === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(b), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(b) {
      if (!this.$data)
        return this.fail(b);
      const { schemaCode: O } = this;
      this.fail((0, o._)`${O} !== undefined && (${(0, o.or)(this.invalid$data(), b)})`);
    }
    error(b, O, k) {
      if (O) {
        this.setParams(O), this._error(b, k), this.setParams({});
        return;
      }
      this._error(b, k);
    }
    _error(b, O) {
      (b ? h.reportExtraError : h.reportError)(this, this.def.error, O);
    }
    $dataError() {
      (0, h.reportError)(this, this.def.$dataError || h.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, h.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(b) {
      this.allErrors || this.gen.if(b);
    }
    setParams(b, O) {
      O ? Object.assign(this.params, b) : this.params = b;
    }
    block$data(b, O, k = o.nil) {
      this.gen.block(() => {
        this.check$data(b, k), O();
      });
    }
    check$data(b = o.nil, O = o.nil) {
      if (!this.$data)
        return;
      const { gen: k, schemaCode: D, schemaType: V, def: ie } = this;
      k.if((0, o.or)((0, o._)`${D} === undefined`, O)), b !== o.nil && k.assign(b, !0), (V.length || ie.validateSchema) && (k.elseIf(this.invalid$data()), this.$dataError(), b !== o.nil && k.assign(b, !1)), k.else();
    }
    invalid$data() {
      const { gen: b, schemaCode: O, schemaType: k, def: D, it: V } = this;
      return (0, o.or)(ie(), Ee());
      function ie() {
        if (k.length) {
          if (!(O instanceof o.Name))
            throw new Error("ajv implementation error");
          const de = Array.isArray(k) ? k : [k];
          return (0, o._)`${(0, n.checkDataTypes)(de, O, V.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function Ee() {
        if (D.validateSchema) {
          const de = b.scopeValue("validate$data", { ref: D.validateSchema });
          return (0, o._)`!${de}(${O})`;
        }
        return o.nil;
      }
    }
    subschema(b, O) {
      const k = (0, i.getSubschema)(this.it, b);
      (0, i.extendSubschemaData)(k, this.it, b), (0, i.extendSubschemaMode)(k, b);
      const D = { ...this.it, ...k, items: void 0, props: void 0 };
      return R(D, O), D;
    }
    mergeEvaluated(b, O) {
      const { it: k, gen: D } = this;
      k.opts.unevaluated && (k.props !== !0 && b.props !== void 0 && (k.props = u.mergeEvaluated.props(D, b.props, k.props, O)), k.items !== !0 && b.items !== void 0 && (k.items = u.mergeEvaluated.items(D, b.items, k.items, O)));
    }
    mergeValidEvaluated(b, O) {
      const { it: k, gen: D } = this;
      if (k.opts.unevaluated && (k.props !== !0 || k.items !== !0))
        return D.if(O, () => this.mergeEvaluated(b, o.Name)), !0;
    }
  }
  ht.KeywordCxt = P;
  function C(y, b, O, k) {
    const D = new P(y, O, b);
    "code" in O ? O.code(D, k) : D.$data && O.validate ? (0, a.funcKeywordCode)(D, O) : "macro" in O ? (0, a.macroKeywordCode)(D, O) : (O.compile || O.validate) && (0, a.funcKeywordCode)(D, O);
  }
  const M = /^\/(?:[^~]|~0|~1)*$/, W = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function G(y, { dataLevel: b, dataNames: O, dataPathArr: k }) {
    let D, V;
    if (y === "")
      return c.default.rootData;
    if (y[0] === "/") {
      if (!M.test(y))
        throw new Error(`Invalid JSON-pointer: ${y}`);
      D = y, V = c.default.rootData;
    } else {
      const fe = W.exec(y);
      if (!fe)
        throw new Error(`Invalid JSON-pointer: ${y}`);
      const ce = +fe[1];
      if (D = fe[2], D === "#") {
        if (ce >= b)
          throw new Error(de("property/index", ce));
        return k[b - ce];
      }
      if (ce > b)
        throw new Error(de("data", ce));
      if (V = O[b - ce], !D)
        return V;
    }
    let ie = V;
    const Ee = D.split("/");
    for (const fe of Ee)
      fe && (V = (0, o._)`${V}${(0, o.getProperty)((0, u.unescapeJsonPointer)(fe))}`, ie = (0, o._)`${ie} && ${V}`);
    return ie;
    function de(fe, ce) {
      return `Cannot access ${fe} ${ce} levels up, current level is ${b}`;
    }
  }
  return ht.getData = G, ht;
}
var an = {}, Ci;
function no() {
  if (Ci) return an;
  Ci = 1, Object.defineProperty(an, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return an.default = e, an;
}
var yr = {};
Object.defineProperty(yr, "__esModule", { value: !0 });
const $s = ke;
class jy extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, $s.resolveUrl)(t, r, n), this.missingSchema = (0, $s.normalizeId)((0, $s.getFullPath)(t, this.missingRef));
  }
}
yr.default = jy;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
ze.resolveSchema = ze.getCompilingSchema = ze.resolveRef = ze.compileSchema = ze.SchemaEnv = void 0;
const Qe = se, ky = no(), qt = lt, tt = ke, Di = H, Ty = Zn();
class xn {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, tt.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
ze.SchemaEnv = xn;
function so(e) {
  const t = kl.call(this, e);
  if (t)
    return t;
  const r = (0, tt.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, i = new Qe.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let o;
  e.$async && (o = i.scopeValue("Error", {
    ref: ky.default,
    code: (0, Qe._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = i.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: i,
    allErrors: this.opts.allErrors,
    data: qt.default.data,
    parentData: qt.default.parentData,
    parentDataProperty: qt.default.parentDataProperty,
    dataNames: [qt.default.data],
    dataPathArr: [Qe.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: i.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Qe.stringify)(e.schema) } : { ref: e.schema }),
    validateName: c,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Qe.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Qe._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, Ty.validateFunctionCode)(d), i.optimize(this.opts.code.optimize);
    const h = i.toString();
    u = `${i.scopeRefs(qt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const p = new Function(`${qt.default.self}`, `${qt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(c, { ref: p }), p.errors = null, p.schema = e.schema, p.schemaEnv = e, e.$async && (p.$async = !0), this.opts.code.source === !0 && (p.source = { validateName: c, validateCode: h, scopeValues: i._values }), this.opts.unevaluated) {
      const { props: $, items: _ } = d;
      p.evaluated = {
        props: $ instanceof Qe.Name ? void 0 : $,
        items: _ instanceof Qe.Name ? void 0 : _,
        dynamicProps: $ instanceof Qe.Name,
        dynamicItems: _ instanceof Qe.Name
      }, p.source && (p.source.evaluated = (0, Qe.stringify)(p.evaluated));
    }
    return e.validate = p, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
ze.compileSchema = so;
function Ay(e, t, r) {
  var n;
  r = (0, tt.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = My.call(this, e, r);
  if (a === void 0) {
    const i = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: o } = this.opts;
    i && (a = new xn({ schema: i, schemaId: o, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = Cy.call(this, a);
}
ze.resolveRef = Ay;
function Cy(e) {
  return (0, tt.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : so.call(this, e);
}
function kl(e) {
  for (const t of this._compilations)
    if (Dy(t, e))
      return t;
}
ze.getCompilingSchema = kl;
function Dy(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function My(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || es.call(this, e, t);
}
function es(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, tt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, tt.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return ys.call(this, r, e);
  const a = (0, tt.normalizeId)(n), i = this.refs[a] || this.schemas[a];
  if (typeof i == "string") {
    const o = es.call(this, e, i);
    return typeof (o == null ? void 0 : o.schema) != "object" ? void 0 : ys.call(this, r, o);
  }
  if (typeof (i == null ? void 0 : i.schema) == "object") {
    if (i.validate || so.call(this, i), a === (0, tt.normalizeId)(t)) {
      const { schema: o } = i, { schemaId: c } = this.opts, d = o[c];
      return d && (s = (0, tt.resolveUrl)(this.opts.uriResolver, s, d)), new xn({ schema: o, schemaId: c, root: e, baseId: s });
    }
    return ys.call(this, r, i);
  }
}
ze.resolveSchema = es;
const Ly = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function ys(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const o of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, Di.unescapeFragment)(o)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Ly.has(o) && d && (t = (0, tt.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Di.schemaHasRulesButRef)(r, this.RULES)) {
    const o = (0, tt.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = es.call(this, n, o);
  }
  const { schemaId: i } = this.opts;
  if (a = a || new xn({ schema: r, schemaId: i, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Vy = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Fy = "Meta-schema for $data reference (JSON AnySchema extension proposal)", zy = "object", Uy = [
  "$data"
], qy = {
  $data: {
    type: "string",
    anyOf: [
      {
        format: "relative-json-pointer"
      },
      {
        format: "json-pointer"
      }
    ]
  }
}, Ky = !1, Gy = {
  $id: Vy,
  description: Fy,
  type: zy,
  required: Uy,
  properties: qy,
  additionalProperties: Ky
};
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const Tl = tl;
Tl.code = 'require("ajv/dist/runtime/uri").default';
ao.default = Tl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Zn();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = se;
  Object.defineProperty(e, "_", { enumerable: !0, get: function() {
    return r._;
  } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
    return r.str;
  } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
    return r.stringify;
  } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
    return r.nil;
  } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
    return r.Name;
  } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
    return r.CodeGen;
  } });
  const n = no(), s = yr, a = Yt, i = ze, o = se, c = ke, d = Ne, u = H, h = Gy, E = ao, p = (I, g) => new RegExp(I, g);
  p.code = "new RegExp";
  const $ = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
    "validate",
    "serialize",
    "parse",
    "wrapper",
    "root",
    "schema",
    "keyword",
    "pattern",
    "formats",
    "validate$data",
    "func",
    "obj",
    "Error"
  ]), v = {
    errorDataPath: "",
    format: "`validateFormats: false` can be used instead.",
    nullable: '"nullable" keyword is supported by default.',
    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
    sourceCode: "Use option `code: {source: true}`",
    strictDefaults: "It is default now, see option `strict`.",
    strictKeywords: "It is default now, see option `strict`.",
    uniqueItems: '"uniqueItems" keyword is always validated.',
    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
    cache: "Map is used as cache, schema object as key.",
    serialize: "Map is used as cache, schema object as key.",
    ajvErrors: "It is default now."
  }, m = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
  }, S = 200;
  function R(I) {
    var g, N, w, l, f, P, C, M, W, G, y, b, O, k, D, V, ie, Ee, de, fe, ce, Ue, ye, Mt, Lt;
    const Je = I.strict, Vt = (g = I.code) === null || g === void 0 ? void 0 : g.optimize, wr = Vt === !0 || Vt === void 0 ? 1 : Vt || 0, Er = (w = (N = I.code) === null || N === void 0 ? void 0 : N.regExp) !== null && w !== void 0 ? w : p, cs = (l = I.uriResolver) !== null && l !== void 0 ? l : E.default;
    return {
      strictSchema: (P = (f = I.strictSchema) !== null && f !== void 0 ? f : Je) !== null && P !== void 0 ? P : !0,
      strictNumbers: (M = (C = I.strictNumbers) !== null && C !== void 0 ? C : Je) !== null && M !== void 0 ? M : !0,
      strictTypes: (G = (W = I.strictTypes) !== null && W !== void 0 ? W : Je) !== null && G !== void 0 ? G : "log",
      strictTuples: (b = (y = I.strictTuples) !== null && y !== void 0 ? y : Je) !== null && b !== void 0 ? b : "log",
      strictRequired: (k = (O = I.strictRequired) !== null && O !== void 0 ? O : Je) !== null && k !== void 0 ? k : !1,
      code: I.code ? { ...I.code, optimize: wr, regExp: Er } : { optimize: wr, regExp: Er },
      loopRequired: (D = I.loopRequired) !== null && D !== void 0 ? D : S,
      loopEnum: (V = I.loopEnum) !== null && V !== void 0 ? V : S,
      meta: (ie = I.meta) !== null && ie !== void 0 ? ie : !0,
      messages: (Ee = I.messages) !== null && Ee !== void 0 ? Ee : !0,
      inlineRefs: (de = I.inlineRefs) !== null && de !== void 0 ? de : !0,
      schemaId: (fe = I.schemaId) !== null && fe !== void 0 ? fe : "$id",
      addUsedSchema: (ce = I.addUsedSchema) !== null && ce !== void 0 ? ce : !0,
      validateSchema: (Ue = I.validateSchema) !== null && Ue !== void 0 ? Ue : !0,
      validateFormats: (ye = I.validateFormats) !== null && ye !== void 0 ? ye : !0,
      unicodeRegExp: (Mt = I.unicodeRegExp) !== null && Mt !== void 0 ? Mt : !0,
      int32range: (Lt = I.int32range) !== null && Lt !== void 0 ? Lt : !0,
      uriResolver: cs
    };
  }
  class j {
    constructor(g = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), g = this.opts = { ...g, ...R(g) };
      const { es5: N, lines: w } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: _, es5: N, lines: w }), this.logger = Y(g.logger);
      const l = g.validateFormats;
      g.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, v, g, "NOT SUPPORTED"), T.call(this, m, g, "DEPRECATED", "warn"), this._metaOpts = me.call(this), g.formats && le.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), g.keywords && ue.call(this, g.keywords), typeof g.meta == "object" && this.addMetaSchema(g.meta), X.call(this), g.validateFormats = l;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: g, meta: N, schemaId: w } = this.opts;
      let l = h;
      w === "id" && (l = { ...h }, l.id = l.$id, delete l.$id), N && g && this.addMetaSchema(l, l[w], !1);
    }
    defaultMeta() {
      const { meta: g, schemaId: N } = this.opts;
      return this.opts.defaultMeta = typeof g == "object" ? g[N] || g : void 0;
    }
    validate(g, N) {
      let w;
      if (typeof g == "string") {
        if (w = this.getSchema(g), !w)
          throw new Error(`no schema with key or ref "${g}"`);
      } else
        w = this.compile(g);
      const l = w(N);
      return "$async" in w || (this.errors = w.errors), l;
    }
    compile(g, N) {
      const w = this._addSchema(g, N);
      return w.validate || this._compileSchemaEnv(w);
    }
    compileAsync(g, N) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: w } = this.opts;
      return l.call(this, g, N);
      async function l(G, y) {
        await f.call(this, G.$schema);
        const b = this._addSchema(G, y);
        return b.validate || P.call(this, b);
      }
      async function f(G) {
        G && !this.getSchema(G) && await l.call(this, { $ref: G }, !0);
      }
      async function P(G) {
        try {
          return this._compileSchemaEnv(G);
        } catch (y) {
          if (!(y instanceof s.default))
            throw y;
          return C.call(this, y), await M.call(this, y.missingSchema), P.call(this, G);
        }
      }
      function C({ missingSchema: G, missingRef: y }) {
        if (this.refs[G])
          throw new Error(`AnySchema ${G} is loaded but ${y} cannot be resolved`);
      }
      async function M(G) {
        const y = await W.call(this, G);
        this.refs[G] || await f.call(this, y.$schema), this.refs[G] || this.addSchema(y, G, N);
      }
      async function W(G) {
        const y = this._loading[G];
        if (y)
          return y;
        try {
          return await (this._loading[G] = w(G));
        } finally {
          delete this._loading[G];
        }
      }
    }
    // Adds schema to the instance
    addSchema(g, N, w, l = this.opts.validateSchema) {
      if (Array.isArray(g)) {
        for (const P of g)
          this.addSchema(P, void 0, w, l);
        return this;
      }
      let f;
      if (typeof g == "object") {
        const { schemaId: P } = this.opts;
        if (f = g[P], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${P} must be string`);
      }
      return N = (0, c.normalizeId)(N || f), this._checkUnique(N), this.schemas[N] = this._addSchema(g, w, N, l, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(g, N, w = this.opts.validateSchema) {
      return this.addSchema(g, N, !0, w), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(g, N) {
      if (typeof g == "boolean")
        return !0;
      let w;
      if (w = g.$schema, w !== void 0 && typeof w != "string")
        throw new Error("$schema must be a string");
      if (w = w || this.opts.defaultMeta || this.defaultMeta(), !w)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const l = this.validate(w, g);
      if (!l && N) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return l;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(g) {
      let N;
      for (; typeof (N = B.call(this, g)) == "string"; )
        g = N;
      if (N === void 0) {
        const { schemaId: w } = this.opts, l = new i.SchemaEnv({ schema: {}, schemaId: w });
        if (N = i.resolveSchema.call(this, l, g), !N)
          return;
        this.refs[g] = N;
      }
      return N.validate || this._compileSchemaEnv(N);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(g) {
      if (g instanceof RegExp)
        return this._removeAllSchemas(this.schemas, g), this._removeAllSchemas(this.refs, g), this;
      switch (typeof g) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const N = B.call(this, g);
          return typeof N == "object" && this._cache.delete(N.schema), delete this.schemas[g], delete this.refs[g], this;
        }
        case "object": {
          const N = g;
          this._cache.delete(N);
          let w = g[this.opts.schemaId];
          return w && (w = (0, c.normalizeId)(w), delete this.schemas[w], delete this.refs[w]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(g) {
      for (const N of g)
        this.addKeyword(N);
      return this;
    }
    addKeyword(g, N) {
      let w;
      if (typeof g == "string")
        w = g, typeof N == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), N.keyword = w);
      else if (typeof g == "object" && N === void 0) {
        if (N = g, w = N.keyword, Array.isArray(w) && !w.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (A.call(this, w, N), !N)
        return (0, u.eachItem)(w, (f) => L.call(this, f)), this;
      F.call(this, N);
      const l = {
        ...N,
        type: (0, d.getJSONTypes)(N.type),
        schemaType: (0, d.getJSONTypes)(N.schemaType)
      };
      return (0, u.eachItem)(w, l.type.length === 0 ? (f) => L.call(this, f, l) : (f) => l.type.forEach((P) => L.call(this, f, l, P))), this;
    }
    getKeyword(g) {
      const N = this.RULES.all[g];
      return typeof N == "object" ? N.definition : !!N;
    }
    // Remove keyword
    removeKeyword(g) {
      const { RULES: N } = this;
      delete N.keywords[g], delete N.all[g];
      for (const w of N.rules) {
        const l = w.rules.findIndex((f) => f.keyword === g);
        l >= 0 && w.rules.splice(l, 1);
      }
      return this;
    }
    // Add format
    addFormat(g, N) {
      return typeof N == "string" && (N = new RegExp(N)), this.formats[g] = N, this;
    }
    errorsText(g = this.errors, { separator: N = ", ", dataVar: w = "data" } = {}) {
      return !g || g.length === 0 ? "No errors" : g.map((l) => `${w}${l.instancePath} ${l.message}`).reduce((l, f) => l + N + f);
    }
    $dataMetaSchema(g, N) {
      const w = this.RULES.all;
      g = JSON.parse(JSON.stringify(g));
      for (const l of N) {
        const f = l.split("/").slice(1);
        let P = g;
        for (const C of f)
          P = P[C];
        for (const C in w) {
          const M = w[C];
          if (typeof M != "object")
            continue;
          const { $data: W } = M.definition, G = P[C];
          W && G && (P[C] = q(G));
        }
      }
      return g;
    }
    _removeAllSchemas(g, N) {
      for (const w in g) {
        const l = g[w];
        (!N || N.test(w)) && (typeof l == "string" ? delete g[w] : l && !l.meta && (this._cache.delete(l.schema), delete g[w]));
      }
    }
    _addSchema(g, N, w, l = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let P;
      const { schemaId: C } = this.opts;
      if (typeof g == "object")
        P = g[C];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof g != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let M = this._cache.get(g);
      if (M !== void 0)
        return M;
      w = (0, c.normalizeId)(P || w);
      const W = c.getSchemaRefs.call(this, g, w);
      return M = new i.SchemaEnv({ schema: g, schemaId: C, meta: N, baseId: w, localRefs: W }), this._cache.set(M.schema, M), f && !w.startsWith("#") && (w && this._checkUnique(w), this.refs[w] = M), l && this.validateSchema(g, !0), M;
    }
    _checkUnique(g) {
      if (this.schemas[g] || this.refs[g])
        throw new Error(`schema with key or id "${g}" already exists`);
    }
    _compileSchemaEnv(g) {
      if (g.meta ? this._compileMetaSchema(g) : i.compileSchema.call(this, g), !g.validate)
        throw new Error("ajv implementation error");
      return g.validate;
    }
    _compileMetaSchema(g) {
      const N = this.opts;
      this.opts = this._metaOpts;
      try {
        i.compileSchema.call(this, g);
      } finally {
        this.opts = N;
      }
    }
  }
  j.ValidationError = n.default, j.MissingRefError = s.default, e.default = j;
  function T(I, g, N, w = "error") {
    for (const l in I) {
      const f = l;
      f in g && this.logger[w](`${N}: option ${l}. ${I[f]}`);
    }
  }
  function B(I) {
    return I = (0, c.normalizeId)(I), this.schemas[I] || this.refs[I];
  }
  function X() {
    const I = this.opts.schemas;
    if (I)
      if (Array.isArray(I))
        this.addSchema(I);
      else
        for (const g in I)
          this.addSchema(I[g], g);
  }
  function le() {
    for (const I in this.opts.formats) {
      const g = this.opts.formats[I];
      g && this.addFormat(I, g);
    }
  }
  function ue(I) {
    if (Array.isArray(I)) {
      this.addVocabulary(I);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const g in I) {
      const N = I[g];
      N.keyword || (N.keyword = g), this.addKeyword(N);
    }
  }
  function me() {
    const I = { ...this.opts };
    for (const g of $)
      delete I[g];
    return I;
  }
  const U = { log() {
  }, warn() {
  }, error() {
  } };
  function Y(I) {
    if (I === !1)
      return U;
    if (I === void 0)
      return console;
    if (I.log && I.warn && I.error)
      return I;
    throw new Error("logger must implement log, warn and error methods");
  }
  const J = /^[a-z_$][a-z0-9_$:-]*$/i;
  function A(I, g) {
    const { RULES: N } = this;
    if ((0, u.eachItem)(I, (w) => {
      if (N.keywords[w])
        throw new Error(`Keyword ${w} is already defined`);
      if (!J.test(w))
        throw new Error(`Keyword ${w} has invalid name`);
    }), !!g && g.$data && !("code" in g || "validate" in g))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function L(I, g, N) {
    var w;
    const l = g == null ? void 0 : g.post;
    if (N && l)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let P = l ? f.post : f.rules.find(({ type: M }) => M === N);
    if (P || (P = { type: N, rules: [] }, f.rules.push(P)), f.keywords[I] = !0, !g)
      return;
    const C = {
      keyword: I,
      definition: {
        ...g,
        type: (0, d.getJSONTypes)(g.type),
        schemaType: (0, d.getJSONTypes)(g.schemaType)
      }
    };
    g.before ? K.call(this, P, C, g.before) : P.rules.push(C), f.all[I] = C, (w = g.implements) === null || w === void 0 || w.forEach((M) => this.addKeyword(M));
  }
  function K(I, g, N) {
    const w = I.rules.findIndex((l) => l.keyword === N);
    w >= 0 ? I.rules.splice(w, 0, g) : (I.rules.push(g), this.logger.warn(`rule ${N} is not defined`));
  }
  function F(I) {
    let { metaSchema: g } = I;
    g !== void 0 && (I.$data && this.opts.$data && (g = q(g)), I.validateSchema = this.compile(g, !0));
  }
  const Q = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function q(I) {
    return { anyOf: [I, Q] };
  }
})(ml);
var oo = {}, io = {}, co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const Hy = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
co.default = Hy;
var Qt = {};
Object.defineProperty(Qt, "__esModule", { value: !0 });
Qt.callRef = Qt.getValidate = void 0;
const By = yr, Mi = oe, Fe = se, xt = lt, Li = ze, on = H, Jy = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: i, opts: o, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Li.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new By.default(n.opts.uriResolver, s, r);
    if (u instanceof Li.SchemaEnv)
      return E(u);
    return p(u);
    function h() {
      if (a === d)
        return Pn(e, i, a, a.$async);
      const $ = t.scopeValue("root", { ref: d });
      return Pn(e, (0, Fe._)`${$}.validate`, d, d.$async);
    }
    function E($) {
      const _ = Al(e, $);
      Pn(e, _, $, $.$async);
    }
    function p($) {
      const _ = t.scopeValue("schema", o.code.source === !0 ? { ref: $, code: (0, Fe.stringify)($) } : { ref: $ }), v = t.name("valid"), m = e.subschema({
        schema: $,
        dataTypes: [],
        schemaPath: Fe.nil,
        topSchemaRef: _,
        errSchemaPath: r
      }, v);
      e.mergeEvaluated(m), e.ok(v);
    }
  }
};
function Al(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Fe._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
Qt.getValidate = Al;
function Pn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: i, schemaEnv: o, opts: c } = a, d = c.passContext ? xt.default.this : Fe.nil;
  n ? u() : h();
  function u() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const $ = s.let("valid");
    s.try(() => {
      s.code((0, Fe._)`await ${(0, Mi.callValidateCode)(e, t, d)}`), p(t), i || s.assign($, !0);
    }, (_) => {
      s.if((0, Fe._)`!(${_} instanceof ${a.ValidationError})`, () => s.throw(_)), E(_), i || s.assign($, !1);
    }), e.ok($);
  }
  function h() {
    e.result((0, Mi.callValidateCode)(e, t, d), () => p(t), () => E(t));
  }
  function E($) {
    const _ = (0, Fe._)`${$}.errors`;
    s.assign(xt.default.vErrors, (0, Fe._)`${xt.default.vErrors} === null ? ${_} : ${xt.default.vErrors}.concat(${_})`), s.assign(xt.default.errors, (0, Fe._)`${xt.default.vErrors}.length`);
  }
  function p($) {
    var _;
    if (!a.opts.unevaluated)
      return;
    const v = (_ = r == null ? void 0 : r.validate) === null || _ === void 0 ? void 0 : _.evaluated;
    if (a.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (a.props = on.mergeEvaluated.props(s, v.props, a.props));
      else {
        const m = s.var("props", (0, Fe._)`${$}.evaluated.props`);
        a.props = on.mergeEvaluated.props(s, m, a.props, Fe.Name);
      }
    if (a.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (a.items = on.mergeEvaluated.items(s, v.items, a.items));
      else {
        const m = s.var("items", (0, Fe._)`${$}.evaluated.items`);
        a.items = on.mergeEvaluated.items(s, m, a.items, Fe.Name);
      }
  }
}
Qt.callRef = Pn;
Qt.default = Jy;
Object.defineProperty(io, "__esModule", { value: !0 });
const Wy = co, Xy = Qt, Yy = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Wy.default,
  Xy.default
];
io.default = Yy;
var lo = {}, uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const Mn = se, Rt = Mn.operators, Ln = {
  maximum: { okStr: "<=", ok: Rt.LTE, fail: Rt.GT },
  minimum: { okStr: ">=", ok: Rt.GTE, fail: Rt.LT },
  exclusiveMaximum: { okStr: "<", ok: Rt.LT, fail: Rt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Rt.GT, fail: Rt.LTE }
}, Qy = {
  message: ({ keyword: e, schemaCode: t }) => (0, Mn.str)`must be ${Ln[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Mn._)`{comparison: ${Ln[e].okStr}, limit: ${t}}`
}, Zy = {
  keyword: Object.keys(Ln),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Qy,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Mn._)`${r} ${Ln[t].fail} ${n} || isNaN(${r})`);
  }
};
uo.default = Zy;
var fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const Fr = se, xy = {
  message: ({ schemaCode: e }) => (0, Fr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Fr._)`{multipleOf: ${e}}`
}, eg = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: xy,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, i = t.let("res"), o = a ? (0, Fr._)`Math.abs(Math.round(${i}) - ${i}) > 1e-${a}` : (0, Fr._)`${i} !== parseInt(${i})`;
    e.fail$data((0, Fr._)`(${n} === 0 || (${i} = ${r}/${n}, ${o}))`);
  }
};
fo.default = eg;
var ho = {}, mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
function Cl(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
mo.default = Cl;
Cl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(ho, "__esModule", { value: !0 });
const Bt = se, tg = H, rg = mo, ng = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Bt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Bt._)`{limit: ${e}}`
}, sg = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: ng,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Bt.operators.GT : Bt.operators.LT, i = s.opts.unicode === !1 ? (0, Bt._)`${r}.length` : (0, Bt._)`${(0, tg.useFunc)(e.gen, rg.default)}(${r})`;
    e.fail$data((0, Bt._)`${i} ${a} ${n}`);
  }
};
ho.default = sg;
var po = {};
Object.defineProperty(po, "__esModule", { value: !0 });
const ag = oe, Vn = se, og = {
  message: ({ schemaCode: e }) => (0, Vn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Vn._)`{pattern: ${e}}`
}, ig = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: og,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, i = a.opts.unicodeRegExp ? "u" : "", o = r ? (0, Vn._)`(new RegExp(${s}, ${i}))` : (0, ag.usePattern)(e, n);
    e.fail$data((0, Vn._)`!${o}.test(${t})`);
  }
};
po.default = ig;
var $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
const zr = se, cg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, zr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, zr._)`{limit: ${e}}`
}, lg = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: cg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? zr.operators.GT : zr.operators.LT;
    e.fail$data((0, zr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
$o.default = lg;
var yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const jr = oe, Ur = se, ug = H, dg = {
  message: ({ params: { missingProperty: e } }) => (0, Ur.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Ur._)`{missingProperty: ${e}}`
}, fg = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: dg,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: i } = e, { opts: o } = i;
    if (!a && r.length === 0)
      return;
    const c = r.length >= o.loopRequired;
    if (i.allErrors ? d() : u(), o.strictRequired) {
      const p = e.parentSchema.properties, { definedProperties: $ } = e.it;
      for (const _ of r)
        if ((p == null ? void 0 : p[_]) === void 0 && !$.has(_)) {
          const v = i.schemaEnv.baseId + i.errSchemaPath, m = `required property "${_}" is not defined at "${v}" (strictRequired)`;
          (0, ug.checkStrictMode)(i, m, i.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(Ur.nil, h);
      else
        for (const p of r)
          (0, jr.checkReportMissingProp)(e, p);
    }
    function u() {
      const p = t.let("missing");
      if (c || a) {
        const $ = t.let("valid", !0);
        e.block$data($, () => E(p, $)), e.ok($);
      } else
        t.if((0, jr.checkMissingProp)(e, r, p)), (0, jr.reportMissingProp)(e, p), t.else();
    }
    function h() {
      t.forOf("prop", n, (p) => {
        e.setParams({ missingProperty: p }), t.if((0, jr.noPropertyInData)(t, s, p, o.ownProperties), () => e.error());
      });
    }
    function E(p, $) {
      e.setParams({ missingProperty: p }), t.forOf(p, n, () => {
        t.assign($, (0, jr.propertyInData)(t, s, p, o.ownProperties)), t.if((0, Ur.not)($), () => {
          e.error(), t.break();
        });
      }, Ur.nil);
    }
  }
};
yo.default = fg;
var go = {};
Object.defineProperty(go, "__esModule", { value: !0 });
const qr = se, hg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, qr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, qr._)`{limit: ${e}}`
}, mg = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: hg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? qr.operators.GT : qr.operators.LT;
    e.fail$data((0, qr._)`${r}.length ${s} ${n}`);
  }
};
go.default = mg;
var _o = {}, Yr = {};
Object.defineProperty(Yr, "__esModule", { value: !0 });
const Dl = Gn;
Dl.code = 'require("ajv/dist/runtime/equal").default';
Yr.default = Dl;
Object.defineProperty(_o, "__esModule", { value: !0 });
const gs = Ne, Ie = se, pg = H, $g = Yr, yg = {
  message: ({ params: { i: e, j: t } }) => (0, Ie.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Ie._)`{i: ${e}, j: ${t}}`
}, gg = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: yg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: i, it: o } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, gs.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, Ie._)`${i} === false`), e.ok(c);
    function u() {
      const $ = t.let("i", (0, Ie._)`${r}.length`), _ = t.let("j");
      e.setParams({ i: $, j: _ }), t.assign(c, !0), t.if((0, Ie._)`${$} > 1`, () => (h() ? E : p)($, _));
    }
    function h() {
      return d.length > 0 && !d.some(($) => $ === "object" || $ === "array");
    }
    function E($, _) {
      const v = t.name("item"), m = (0, gs.checkDataTypes)(d, v, o.opts.strictNumbers, gs.DataType.Wrong), S = t.const("indices", (0, Ie._)`{}`);
      t.for((0, Ie._)`;${$}--;`, () => {
        t.let(v, (0, Ie._)`${r}[${$}]`), t.if(m, (0, Ie._)`continue`), d.length > 1 && t.if((0, Ie._)`typeof ${v} == "string"`, (0, Ie._)`${v} += "_"`), t.if((0, Ie._)`typeof ${S}[${v}] == "number"`, () => {
          t.assign(_, (0, Ie._)`${S}[${v}]`), e.error(), t.assign(c, !1).break();
        }).code((0, Ie._)`${S}[${v}] = ${$}`);
      });
    }
    function p($, _) {
      const v = (0, pg.useFunc)(t, $g.default), m = t.name("outer");
      t.label(m).for((0, Ie._)`;${$}--;`, () => t.for((0, Ie._)`${_} = ${$}; ${_}--;`, () => t.if((0, Ie._)`${v}(${r}[${$}], ${r}[${_}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
_o.default = gg;
var vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
const Us = se, _g = H, vg = Yr, wg = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Us._)`{allowedValue: ${e}}`
}, Eg = {
  keyword: "const",
  $data: !0,
  error: wg,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Us._)`!${(0, _g.useFunc)(t, vg.default)}(${r}, ${s})`) : e.fail((0, Us._)`${a} !== ${r}`);
  }
};
vo.default = Eg;
var wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const Cr = se, bg = H, Sg = Yr, Pg = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Cr._)`{allowedValues: ${e}}`
}, Ng = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Pg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: i } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const o = s.length >= i.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, bg.useFunc)(t, Sg.default));
    let u;
    if (o || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const p = t.const("vSchema", a);
      u = (0, Cr.or)(...s.map(($, _) => E(p, _)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (p) => t.if((0, Cr._)`${d()}(${r}, ${p})`, () => t.assign(u, !0).break()));
    }
    function E(p, $) {
      const _ = s[$];
      return typeof _ == "object" && _ !== null ? (0, Cr._)`${d()}(${r}, ${p}[${$}])` : (0, Cr._)`${r} === ${_}`;
    }
  }
};
wo.default = Ng;
Object.defineProperty(lo, "__esModule", { value: !0 });
const Rg = uo, Og = fo, Ig = ho, jg = po, kg = $o, Tg = yo, Ag = go, Cg = _o, Dg = vo, Mg = wo, Lg = [
  // number
  Rg.default,
  Og.default,
  // string
  Ig.default,
  jg.default,
  // object
  kg.default,
  Tg.default,
  // array
  Ag.default,
  Cg.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Dg.default,
  Mg.default
];
lo.default = Lg;
var Eo = {}, gr = {};
Object.defineProperty(gr, "__esModule", { value: !0 });
gr.validateAdditionalItems = void 0;
const Jt = se, qs = H, Vg = {
  message: ({ params: { len: e } }) => (0, Jt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Jt._)`{limit: ${e}}`
}, Fg = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Vg,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, qs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Ml(e, n);
  }
};
function Ml(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: i } = e;
  i.items = !0;
  const o = r.const("len", (0, Jt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Jt._)`${o} <= ${t.length}`);
  else if (typeof n == "object" && !(0, qs.alwaysValidSchema)(i, n)) {
    const d = r.var("valid", (0, Jt._)`${o} <= ${t.length}`);
    r.if((0, Jt.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, o, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: qs.Type.Num }, d), i.allErrors || r.if((0, Jt.not)(d), () => r.break());
    });
  }
}
gr.validateAdditionalItems = Ml;
gr.default = Fg;
var bo = {}, _r = {};
Object.defineProperty(_r, "__esModule", { value: !0 });
_r.validateTuple = void 0;
const Vi = se, Nn = H, zg = oe, Ug = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Ll(e, "additionalItems", t);
    r.items = !0, !(0, Nn.alwaysValidSchema)(r, t) && e.ok((0, zg.validateArray)(e));
  }
};
function Ll(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: i, it: o } = e;
  u(s), o.opts.unevaluated && r.length && o.items !== !0 && (o.items = Nn.mergeEvaluated.items(n, r.length, o.items));
  const c = n.name("valid"), d = n.const("len", (0, Vi._)`${a}.length`);
  r.forEach((h, E) => {
    (0, Nn.alwaysValidSchema)(o, h) || (n.if((0, Vi._)`${d} > ${E}`, () => e.subschema({
      keyword: i,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: p } = o, $ = r.length, _ = $ === h.minItems && ($ === h.maxItems || h[t] === !1);
    if (E.strictTuples && !_) {
      const v = `"${i}" is ${$}-tuple, but minItems or maxItems/${t} are not specified or different at path "${p}"`;
      (0, Nn.checkStrictMode)(o, v, E.strictTuples);
    }
  }
}
_r.validateTuple = Ll;
_r.default = Ug;
Object.defineProperty(bo, "__esModule", { value: !0 });
const qg = _r, Kg = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, qg.validateTuple)(e, "items")
};
bo.default = Kg;
var So = {};
Object.defineProperty(So, "__esModule", { value: !0 });
const Fi = se, Gg = H, Hg = oe, Bg = gr, Jg = {
  message: ({ params: { len: e } }) => (0, Fi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Fi._)`{limit: ${e}}`
}, Wg = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Jg,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Gg.alwaysValidSchema)(n, t) && (s ? (0, Bg.validateAdditionalItems)(e, s) : e.ok((0, Hg.validateArray)(e)));
  }
};
So.default = Wg;
var Po = {};
Object.defineProperty(Po, "__esModule", { value: !0 });
const He = se, cn = H, Xg = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, He.str)`must contain at least ${e} valid item(s)` : (0, He.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, He._)`{minContains: ${e}}` : (0, He._)`{minContains: ${e}, maxContains: ${t}}`
}, Yg = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Xg,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let i, o;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (i = c === void 0 ? 1 : c, o = d) : i = 1;
    const u = t.const("len", (0, He._)`${s}.length`);
    if (e.setParams({ min: i, max: o }), o === void 0 && i === 0) {
      (0, cn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && i > o) {
      (0, cn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, cn.alwaysValidSchema)(a, r)) {
      let _ = (0, He._)`${u} >= ${i}`;
      o !== void 0 && (_ = (0, He._)`${_} && ${u} <= ${o}`), e.pass(_);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    o === void 0 && i === 1 ? p(h, () => t.if(h, () => t.break())) : i === 0 ? (t.let(h, !0), o !== void 0 && t.if((0, He._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const _ = t.name("_valid"), v = t.let("count", 0);
      p(_, () => t.if(_, () => $(v)));
    }
    function p(_, v) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: cn.Type.Num,
          compositeRule: !0
        }, _), v();
      });
    }
    function $(_) {
      t.code((0, He._)`${_}++`), o === void 0 ? t.if((0, He._)`${_} >= ${i}`, () => t.assign(h, !0).break()) : (t.if((0, He._)`${_} > ${o}`, () => t.assign(h, !1).break()), i === 1 ? t.assign(h, !0) : t.if((0, He._)`${_} >= ${i}`, () => t.assign(h, !0)));
    }
  }
};
Po.default = Yg;
var Vl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = se, r = H, n = oe;
  e.error = {
    message: ({ params: { property: c, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${c} is present`;
    },
    params: ({ params: { property: c, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${c},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${u}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(c) {
      const [d, u] = a(c);
      i(c, d), o(c, u);
    }
  };
  function a({ schema: c }) {
    const d = {}, u = {};
    for (const h in c) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(c[h]) ? d : u;
      E[h] = c[h];
    }
    return [d, u];
  }
  function i(c, d = c.schema) {
    const { gen: u, data: h, it: E } = c;
    if (Object.keys(d).length === 0)
      return;
    const p = u.let("missing");
    for (const $ in d) {
      const _ = d[$];
      if (_.length === 0)
        continue;
      const v = (0, n.propertyInData)(u, h, $, E.opts.ownProperties);
      c.setParams({
        property: $,
        depsCount: _.length,
        deps: _.join(", ")
      }), E.allErrors ? u.if(v, () => {
        for (const m of _)
          (0, n.checkReportMissingProp)(c, m);
      }) : (u.if((0, t._)`${v} && (${(0, n.checkMissingProp)(c, _, p)})`), (0, n.reportMissingProp)(c, p), u.else());
    }
  }
  e.validatePropertyDeps = i;
  function o(c, d = c.schema) {
    const { gen: u, data: h, keyword: E, it: p } = c, $ = u.name("valid");
    for (const _ in d)
      (0, r.alwaysValidSchema)(p, d[_]) || (u.if(
        (0, n.propertyInData)(u, h, _, p.opts.ownProperties),
        () => {
          const v = c.subschema({ keyword: E, schemaProp: _ }, $);
          c.mergeValidEvaluated(v, $);
        },
        () => u.var($, !0)
        // TODO var
      ), c.ok($));
  }
  e.validateSchemaDeps = o, e.default = s;
})(Vl);
var No = {};
Object.defineProperty(No, "__esModule", { value: !0 });
const Fl = se, Qg = H, Zg = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Fl._)`{propertyName: ${e.propertyName}}`
}, xg = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Zg,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Qg.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (i) => {
      e.setParams({ propertyName: i }), e.subschema({
        keyword: "propertyNames",
        data: i,
        dataTypes: ["string"],
        propertyName: i,
        compositeRule: !0
      }, a), t.if((0, Fl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
No.default = xg;
var ts = {};
Object.defineProperty(ts, "__esModule", { value: !0 });
const ln = oe, xe = se, e0 = lt, un = H, t0 = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, xe._)`{additionalProperty: ${e.additionalProperty}}`
}, r0 = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: t0,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: i } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: c } = i;
    if (i.props = !0, c.removeAdditional !== "all" && (0, un.alwaysValidSchema)(i, r))
      return;
    const d = (0, ln.allSchemaProperties)(n.properties), u = (0, ln.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, xe._)`${a} === ${e0.default.errors}`);
    function h() {
      t.forIn("key", s, (v) => {
        !d.length && !u.length ? $(v) : t.if(E(v), () => $(v));
      });
    }
    function E(v) {
      let m;
      if (d.length > 8) {
        const S = (0, un.schemaRefOrVal)(i, n.properties, "properties");
        m = (0, ln.isOwnProperty)(t, S, v);
      } else d.length ? m = (0, xe.or)(...d.map((S) => (0, xe._)`${v} === ${S}`)) : m = xe.nil;
      return u.length && (m = (0, xe.or)(m, ...u.map((S) => (0, xe._)`${(0, ln.usePattern)(e, S)}.test(${v})`))), (0, xe.not)(m);
    }
    function p(v) {
      t.code((0, xe._)`delete ${s}[${v}]`);
    }
    function $(v) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        p(v);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: v }), e.error(), o || t.break();
        return;
      }
      if (typeof r == "object" && !(0, un.alwaysValidSchema)(i, r)) {
        const m = t.name("valid");
        c.removeAdditional === "failing" ? (_(v, m, !1), t.if((0, xe.not)(m), () => {
          e.reset(), p(v);
        })) : (_(v, m), o || t.if((0, xe.not)(m), () => t.break()));
      }
    }
    function _(v, m, S) {
      const R = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: un.Type.Str
      };
      S === !1 && Object.assign(R, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(R, m);
    }
  }
};
ts.default = r0;
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const n0 = Zn(), zi = oe, _s = H, Ui = ts, s0 = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Ui.default.code(new n0.KeywordCxt(a, Ui.default, "additionalProperties"));
    const i = (0, zi.allSchemaProperties)(r);
    for (const h of i)
      a.definedProperties.add(h);
    a.opts.unevaluated && i.length && a.props !== !0 && (a.props = _s.mergeEvaluated.props(t, (0, _s.toHash)(i), a.props));
    const o = i.filter((h) => !(0, _s.alwaysValidSchema)(a, r[h]));
    if (o.length === 0)
      return;
    const c = t.name("valid");
    for (const h of o)
      d(h) ? u(h) : (t.if((0, zi.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, c);
    }
  }
};
Ro.default = s0;
var Oo = {};
Object.defineProperty(Oo, "__esModule", { value: !0 });
const qi = oe, dn = se, Ki = H, Gi = H, a0 = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: i } = a, o = (0, qi.allSchemaProperties)(r), c = o.filter((_) => (0, Ki.alwaysValidSchema)(a, r[_]));
    if (o.length === 0 || c.length === o.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = i.strictSchema && !i.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof dn.Name) && (a.props = (0, Gi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const _ of o)
        d && p(_), a.allErrors ? $(_) : (t.var(u, !0), $(_), t.if(u));
    }
    function p(_) {
      for (const v in d)
        new RegExp(_).test(v) && (0, Ki.checkStrictMode)(a, `property ${v} matches pattern ${_} (use allowMatchingProperties)`);
    }
    function $(_) {
      t.forIn("key", n, (v) => {
        t.if((0, dn._)`${(0, qi.usePattern)(e, _)}.test(${v})`, () => {
          const m = c.includes(_);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: _,
            dataProp: v,
            dataPropType: Gi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, dn._)`${h}[${v}]`, !0) : !m && !a.allErrors && t.if((0, dn.not)(u), () => t.break());
        });
      });
    }
  }
};
Oo.default = a0;
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const o0 = H, i0 = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, o0.alwaysValidSchema)(n, r)) {
      e.fail();
      return;
    }
    const s = t.name("valid");
    e.subschema({
      keyword: "not",
      compositeRule: !0,
      createErrors: !1,
      allErrors: !1
    }, s), e.failResult(s, () => e.reset(), () => e.error());
  },
  error: { message: "must NOT be valid" }
};
Io.default = i0;
var jo = {};
Object.defineProperty(jo, "__esModule", { value: !0 });
const c0 = oe, l0 = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: c0.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
jo.default = l0;
var ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const Rn = se, u0 = H, d0 = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Rn._)`{passingSchemas: ${e.passing}}`
}, f0 = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: d0,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, i = t.let("valid", !1), o = t.let("passing", null), c = t.name("_valid");
    e.setParams({ passing: o }), t.block(d), e.result(i, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, u0.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, Rn._)`${c} && ${i}`).assign(i, !1).assign(o, (0, Rn._)`[${o}, ${h}]`).else(), t.if(c, () => {
          t.assign(i, !0), t.assign(o, h), E && e.mergeEvaluated(E, Rn.Name);
        });
      });
    }
  }
};
ko.default = f0;
var To = {};
Object.defineProperty(To, "__esModule", { value: !0 });
const h0 = H, m0 = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, i) => {
      if ((0, h0.alwaysValidSchema)(n, a))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: i }, s);
      e.ok(s), e.mergeEvaluated(o);
    });
  }
};
To.default = m0;
var Ao = {};
Object.defineProperty(Ao, "__esModule", { value: !0 });
const Fn = se, zl = H, p0 = {
  message: ({ params: e }) => (0, Fn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Fn._)`{failingKeyword: ${e.ifClause}}`
}, $0 = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: p0,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, zl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Hi(n, "then"), a = Hi(n, "else");
    if (!s && !a)
      return;
    const i = t.let("valid", !0), o = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(o, d("then", u), d("else", u));
    } else s ? t.if(o, d("then")) : t.if((0, Fn.not)(o), d("else"));
    e.pass(i, () => e.error(!0));
    function c() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, o);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, o);
        t.assign(i, o), e.mergeValidEvaluated(E, i), h ? t.assign(h, (0, Fn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Hi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, zl.alwaysValidSchema)(e, r);
}
Ao.default = $0;
var Co = {};
Object.defineProperty(Co, "__esModule", { value: !0 });
const y0 = H, g0 = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, y0.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Co.default = g0;
Object.defineProperty(Eo, "__esModule", { value: !0 });
const _0 = gr, v0 = bo, w0 = _r, E0 = So, b0 = Po, S0 = Vl, P0 = No, N0 = ts, R0 = Ro, O0 = Oo, I0 = Io, j0 = jo, k0 = ko, T0 = To, A0 = Ao, C0 = Co;
function D0(e = !1) {
  const t = [
    // any
    I0.default,
    j0.default,
    k0.default,
    T0.default,
    A0.default,
    C0.default,
    // object
    P0.default,
    N0.default,
    S0.default,
    R0.default,
    O0.default
  ];
  return e ? t.push(v0.default, E0.default) : t.push(_0.default, w0.default), t.push(b0.default), t;
}
Eo.default = D0;
var Do = {}, Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const Se = se, M0 = {
  message: ({ schemaCode: e }) => (0, Se.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, Se._)`{format: ${e}}`
}, L0 = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: M0,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: i, it: o } = e, { opts: c, errSchemaPath: d, schemaEnv: u, self: h } = o;
    if (!c.validateFormats)
      return;
    s ? E() : p();
    function E() {
      const $ = r.scopeValue("formats", {
        ref: h.formats,
        code: c.code.formats
      }), _ = r.const("fDef", (0, Se._)`${$}[${i}]`), v = r.let("fType"), m = r.let("format");
      r.if((0, Se._)`typeof ${_} == "object" && !(${_} instanceof RegExp)`, () => r.assign(v, (0, Se._)`${_}.type || "string"`).assign(m, (0, Se._)`${_}.validate`), () => r.assign(v, (0, Se._)`"string"`).assign(m, _)), e.fail$data((0, Se.or)(S(), R()));
      function S() {
        return c.strictSchema === !1 ? Se.nil : (0, Se._)`${i} && !${m}`;
      }
      function R() {
        const j = u.$async ? (0, Se._)`(${_}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, Se._)`${m}(${n})`, T = (0, Se._)`(typeof ${m} == "function" ? ${j} : ${m}.test(${n}))`;
        return (0, Se._)`${m} && ${m} !== true && ${v} === ${t} && !${T}`;
      }
    }
    function p() {
      const $ = h.formats[a];
      if (!$) {
        S();
        return;
      }
      if ($ === !0)
        return;
      const [_, v, m] = R($);
      _ === t && e.pass(j());
      function S() {
        if (c.strictSchema === !1) {
          h.logger.warn(T());
          return;
        }
        throw new Error(T());
        function T() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function R(T) {
        const B = T instanceof RegExp ? (0, Se.regexpCode)(T) : c.code.formats ? (0, Se._)`${c.code.formats}${(0, Se.getProperty)(a)}` : void 0, X = r.scopeValue("formats", { key: a, ref: T, code: B });
        return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, Se._)`${X}.validate`] : ["string", T, X];
      }
      function j() {
        if (typeof $ == "object" && !($ instanceof RegExp) && $.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, Se._)`await ${m}(${n})`;
        }
        return typeof v == "function" ? (0, Se._)`${m}(${n})` : (0, Se._)`${m}.test(${n})`;
      }
    }
  }
};
Mo.default = L0;
Object.defineProperty(Do, "__esModule", { value: !0 });
const V0 = Mo, F0 = [V0.default];
Do.default = F0;
var dr = {};
Object.defineProperty(dr, "__esModule", { value: !0 });
dr.contentVocabulary = dr.metadataVocabulary = void 0;
dr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
dr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(oo, "__esModule", { value: !0 });
const z0 = io, U0 = lo, q0 = Eo, K0 = Do, Bi = dr, G0 = [
  z0.default,
  U0.default,
  (0, q0.default)(),
  K0.default,
  Bi.metadataVocabulary,
  Bi.contentVocabulary
];
oo.default = G0;
var Lo = {}, rs = {};
Object.defineProperty(rs, "__esModule", { value: !0 });
rs.DiscrError = void 0;
var Ji;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Ji || (rs.DiscrError = Ji = {}));
Object.defineProperty(Lo, "__esModule", { value: !0 });
const sr = se, Ks = rs, Wi = ze, H0 = yr, B0 = H, J0 = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Ks.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, sr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, W0 = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: J0,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: i } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = n.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!i)
      throw new Error("discriminator: requires oneOf keyword");
    const c = t.let("valid", !1), d = t.const("tag", (0, sr._)`${r}${(0, sr.getProperty)(o)}`);
    t.if((0, sr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Ks.DiscrError.Tag, tag: d, tagName: o })), e.ok(c);
    function u() {
      const p = E();
      t.if(!1);
      for (const $ in p)
        t.elseIf((0, sr._)`${d} === ${$}`), t.assign(c, h(p[$]));
      t.else(), e.error(!1, { discrError: Ks.DiscrError.Mapping, tag: d, tagName: o }), t.endIf();
    }
    function h(p) {
      const $ = t.name("valid"), _ = e.subschema({ keyword: "oneOf", schemaProp: p }, $);
      return e.mergeEvaluated(_, sr.Name), $;
    }
    function E() {
      var p;
      const $ = {}, _ = m(s);
      let v = !0;
      for (let j = 0; j < i.length; j++) {
        let T = i[j];
        if (T != null && T.$ref && !(0, B0.schemaHasRulesButRef)(T, a.self.RULES)) {
          const X = T.$ref;
          if (T = Wi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), T instanceof Wi.SchemaEnv && (T = T.schema), T === void 0)
            throw new H0.default(a.opts.uriResolver, a.baseId, X);
        }
        const B = (p = T == null ? void 0 : T.properties) === null || p === void 0 ? void 0 : p[o];
        if (typeof B != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        v = v && (_ || m(T)), S(B, j);
      }
      if (!v)
        throw new Error(`discriminator: "${o}" must be required`);
      return $;
      function m({ required: j }) {
        return Array.isArray(j) && j.includes(o);
      }
      function S(j, T) {
        if (j.const)
          R(j.const, T);
        else if (j.enum)
          for (const B of j.enum)
            R(B, T);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function R(j, T) {
        if (typeof j != "string" || j in $)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        $[j] = T;
      }
    }
  }
};
Lo.default = W0;
const X0 = "http://json-schema.org/draft-07/schema#", Y0 = "http://json-schema.org/draft-07/schema#", Q0 = "Core schema meta-schema", Z0 = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $ref: "#"
    }
  },
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    allOf: [
      {
        $ref: "#/definitions/nonNegativeInteger"
      },
      {
        default: 0
      }
    ]
  },
  simpleTypes: {
    enum: [
      "array",
      "boolean",
      "integer",
      "null",
      "number",
      "object",
      "string"
    ]
  },
  stringArray: {
    type: "array",
    items: {
      type: "string"
    },
    uniqueItems: !0,
    default: []
  }
}, x0 = [
  "object",
  "boolean"
], e_ = {
  $id: {
    type: "string",
    format: "uri-reference"
  },
  $schema: {
    type: "string",
    format: "uri"
  },
  $ref: {
    type: "string",
    format: "uri-reference"
  },
  $comment: {
    type: "string"
  },
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  default: !0,
  readOnly: {
    type: "boolean",
    default: !1
  },
  examples: {
    type: "array",
    items: !0
  },
  multipleOf: {
    type: "number",
    exclusiveMinimum: 0
  },
  maximum: {
    type: "number"
  },
  exclusiveMaximum: {
    type: "number"
  },
  minimum: {
    type: "number"
  },
  exclusiveMinimum: {
    type: "number"
  },
  maxLength: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minLength: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  pattern: {
    type: "string",
    format: "regex"
  },
  additionalItems: {
    $ref: "#"
  },
  items: {
    anyOf: [
      {
        $ref: "#"
      },
      {
        $ref: "#/definitions/schemaArray"
      }
    ],
    default: !0
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    default: !1
  },
  contains: {
    $ref: "#"
  },
  maxProperties: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minProperties: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  required: {
    $ref: "#/definitions/stringArray"
  },
  additionalProperties: {
    $ref: "#"
  },
  definitions: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    default: {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    default: {}
  },
  dependencies: {
    type: "object",
    additionalProperties: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/stringArray"
        }
      ]
    }
  },
  propertyNames: {
    $ref: "#"
  },
  const: !0,
  enum: {
    type: "array",
    items: !0,
    minItems: 1,
    uniqueItems: !0
  },
  type: {
    anyOf: [
      {
        $ref: "#/definitions/simpleTypes"
      },
      {
        type: "array",
        items: {
          $ref: "#/definitions/simpleTypes"
        },
        minItems: 1,
        uniqueItems: !0
      }
    ]
  },
  format: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentEncoding: {
    type: "string"
  },
  if: {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  else: {
    $ref: "#"
  },
  allOf: {
    $ref: "#/definitions/schemaArray"
  },
  anyOf: {
    $ref: "#/definitions/schemaArray"
  },
  oneOf: {
    $ref: "#/definitions/schemaArray"
  },
  not: {
    $ref: "#"
  }
}, t_ = {
  $schema: X0,
  $id: Y0,
  title: Q0,
  definitions: Z0,
  type: x0,
  properties: e_,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = ml, n = oo, s = Lo, a = t_, i = ["/properties"], o = "http://json-schema.org/draft-07/schema";
  class c extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach(($) => this.addVocabulary($)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const $ = this.opts.$data ? this.$dataMetaSchema(a, i) : a;
      this.addMetaSchema($, o, !1), this.refs["http://json-schema.org/schema"] = o;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv = c, e.exports = t = c, e.exports.Ajv = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var d = Zn();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = se;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return u._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return u.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return u.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return u.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return u.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return u.CodeGen;
  } });
  var h = no();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var E = yr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
})(Ms, Ms.exports);
var r_ = Ms.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = r_, r = se, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: o, schemaCode: c }) => (0, r.str)`should be ${s[o].okStr} ${c}`,
    params: ({ keyword: o, schemaCode: c }) => (0, r._)`{comparison: ${s[o].okStr}, limit: ${c}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(o) {
      const { gen: c, data: d, schemaCode: u, keyword: h, it: E } = o, { opts: p, self: $ } = E;
      if (!p.validateFormats)
        return;
      const _ = new t.KeywordCxt(E, $.RULES.all.format.definition, "format");
      _.$data ? v() : m();
      function v() {
        const R = c.scopeValue("formats", {
          ref: $.formats,
          code: p.code.formats
        }), j = c.const("fmt", (0, r._)`${R}[${_.schemaCode}]`);
        o.fail$data((0, r.or)((0, r._)`typeof ${j} != "object"`, (0, r._)`${j} instanceof RegExp`, (0, r._)`typeof ${j}.compare != "function"`, S(j)));
      }
      function m() {
        const R = _.schema, j = $.formats[R];
        if (!j || j === !0)
          return;
        if (typeof j != "object" || j instanceof RegExp || typeof j.compare != "function")
          throw new Error(`"${h}": format "${R}" does not define "compare" function`);
        const T = c.scopeValue("formats", {
          key: R,
          ref: j,
          code: p.code.formats ? (0, r._)`${p.code.formats}${(0, r.getProperty)(R)}` : void 0
        });
        o.fail$data(S(T));
      }
      function S(R) {
        return (0, r._)`${R}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const i = (o) => (o.addKeyword(e.formatLimitDefinition), o);
  e.default = i;
})(hl);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = fl, n = hl, s = se, a = new s.Name("fullFormats"), i = new s.Name("fastFormats"), o = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return c(d, u, r.fullFormats, a), d;
    const [h, E] = u.mode === "fast" ? [r.fastFormats, i] : [r.fullFormats, a], p = u.formats || r.formatNames;
    return c(d, p, h, E), u.keywords && (0, n.default)(d), d;
  };
  o.get = (d, u = "full") => {
    const E = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!E)
      throw new Error(`Unknown format "${d}"`);
    return E;
  };
  function c(d, u, h, E) {
    var p, $;
    (p = ($ = d.opts.code).formats) !== null && p !== void 0 || ($.formats = (0, s._)`require("ajv-formats/dist/formats").${E}`);
    for (const _ of u)
      d.addFormat(_, h[_]);
  }
  e.exports = t = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
})(Ds, Ds.exports);
var n_ = Ds.exports;
const s_ = /* @__PURE__ */ Nc(n_), a_ = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !o_(s, a) && n || Object.defineProperty(e, r, a);
}, o_ = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, i_ = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, c_ = (e, t) => `/* Wrapped ${e}*/
${t}`, l_ = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), u_ = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), d_ = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = c_.bind(null, n, t.toString());
  Object.defineProperty(s, "name", u_);
  const { writable: a, enumerable: i, configurable: o } = l_;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: i, configurable: o });
};
function f_(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    a_(e, t, s, r);
  return i_(e, t), d_(e, t, n), e;
}
const Xi = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: s = !1,
    after: a = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!s && !a)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let i, o, c;
  const d = function(...u) {
    const h = this, E = () => {
      i = void 0, o && (clearTimeout(o), o = void 0), a && (c = e.apply(h, u));
    }, p = () => {
      o = void 0, i && (clearTimeout(i), i = void 0), a && (c = e.apply(h, u));
    }, $ = s && !i;
    return clearTimeout(i), i = setTimeout(E, r), n > 0 && n !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(p, n)), $ && (c = e.apply(h, u)), c;
  };
  return f_(d, e), d.cancel = () => {
    i && (clearTimeout(i), i = void 0), o && (clearTimeout(o), o = void 0);
  }, d;
};
var Gs = { exports: {} };
const h_ = "2.0.0", Ul = 256, m_ = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, p_ = 16, $_ = Ul - 6, y_ = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ns = {
  MAX_LENGTH: Ul,
  MAX_SAFE_COMPONENT_LENGTH: p_,
  MAX_SAFE_BUILD_LENGTH: $_,
  MAX_SAFE_INTEGER: m_,
  RELEASE_TYPES: y_,
  SEMVER_SPEC_VERSION: h_,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const g_ = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ss = g_;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = ns, a = ss;
  t = e.exports = {};
  const i = t.re = [], o = t.safeRe = [], c = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const E = "[a-zA-Z0-9-]", p = [
    ["\\s", 1],
    ["\\d", s],
    [E, n]
  ], $ = (v) => {
    for (const [m, S] of p)
      v = v.split(`${m}*`).join(`${m}{0,${S}}`).split(`${m}+`).join(`${m}{1,${S}}`);
    return v;
  }, _ = (v, m, S) => {
    const R = $(m), j = h++;
    a(v, j, m), u[v] = j, c[j] = m, d[j] = R, i[j] = new RegExp(m, S ? "g" : void 0), o[j] = new RegExp(R, S ? "g" : void 0);
  };
  _("NUMERICIDENTIFIER", "0|[1-9]\\d*"), _("NUMERICIDENTIFIERLOOSE", "\\d+"), _("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${E}*`), _("MAINVERSION", `(${c[u.NUMERICIDENTIFIER]})\\.(${c[u.NUMERICIDENTIFIER]})\\.(${c[u.NUMERICIDENTIFIER]})`), _("MAINVERSIONLOOSE", `(${c[u.NUMERICIDENTIFIERLOOSE]})\\.(${c[u.NUMERICIDENTIFIERLOOSE]})\\.(${c[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASEIDENTIFIER", `(?:${c[u.NONNUMERICIDENTIFIER]}|${c[u.NUMERICIDENTIFIER]})`), _("PRERELEASEIDENTIFIERLOOSE", `(?:${c[u.NONNUMERICIDENTIFIER]}|${c[u.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASE", `(?:-(${c[u.PRERELEASEIDENTIFIER]}(?:\\.${c[u.PRERELEASEIDENTIFIER]})*))`), _("PRERELEASELOOSE", `(?:-?(${c[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[u.PRERELEASEIDENTIFIERLOOSE]})*))`), _("BUILDIDENTIFIER", `${E}+`), _("BUILD", `(?:\\+(${c[u.BUILDIDENTIFIER]}(?:\\.${c[u.BUILDIDENTIFIER]})*))`), _("FULLPLAIN", `v?${c[u.MAINVERSION]}${c[u.PRERELEASE]}?${c[u.BUILD]}?`), _("FULL", `^${c[u.FULLPLAIN]}$`), _("LOOSEPLAIN", `[v=\\s]*${c[u.MAINVERSIONLOOSE]}${c[u.PRERELEASELOOSE]}?${c[u.BUILD]}?`), _("LOOSE", `^${c[u.LOOSEPLAIN]}$`), _("GTLT", "((?:<|>)?=?)"), _("XRANGEIDENTIFIERLOOSE", `${c[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), _("XRANGEIDENTIFIER", `${c[u.NUMERICIDENTIFIER]}|x|X|\\*`), _("XRANGEPLAIN", `[v=\\s]*(${c[u.XRANGEIDENTIFIER]})(?:\\.(${c[u.XRANGEIDENTIFIER]})(?:\\.(${c[u.XRANGEIDENTIFIER]})(?:${c[u.PRERELEASE]})?${c[u.BUILD]}?)?)?`), _("XRANGEPLAINLOOSE", `[v=\\s]*(${c[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[u.XRANGEIDENTIFIERLOOSE]})(?:${c[u.PRERELEASELOOSE]})?${c[u.BUILD]}?)?)?`), _("XRANGE", `^${c[u.GTLT]}\\s*${c[u.XRANGEPLAIN]}$`), _("XRANGELOOSE", `^${c[u.GTLT]}\\s*${c[u.XRANGEPLAINLOOSE]}$`), _("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), _("COERCE", `${c[u.COERCEPLAIN]}(?:$|[^\\d])`), _("COERCEFULL", c[u.COERCEPLAIN] + `(?:${c[u.PRERELEASE]})?(?:${c[u.BUILD]})?(?:$|[^\\d])`), _("COERCERTL", c[u.COERCE], !0), _("COERCERTLFULL", c[u.COERCEFULL], !0), _("LONETILDE", "(?:~>?)"), _("TILDETRIM", `(\\s*)${c[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", _("TILDE", `^${c[u.LONETILDE]}${c[u.XRANGEPLAIN]}$`), _("TILDELOOSE", `^${c[u.LONETILDE]}${c[u.XRANGEPLAINLOOSE]}$`), _("LONECARET", "(?:\\^)"), _("CARETTRIM", `(\\s*)${c[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", _("CARET", `^${c[u.LONECARET]}${c[u.XRANGEPLAIN]}$`), _("CARETLOOSE", `^${c[u.LONECARET]}${c[u.XRANGEPLAINLOOSE]}$`), _("COMPARATORLOOSE", `^${c[u.GTLT]}\\s*(${c[u.LOOSEPLAIN]})$|^$`), _("COMPARATOR", `^${c[u.GTLT]}\\s*(${c[u.FULLPLAIN]})$|^$`), _("COMPARATORTRIM", `(\\s*)${c[u.GTLT]}\\s*(${c[u.LOOSEPLAIN]}|${c[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", _("HYPHENRANGE", `^\\s*(${c[u.XRANGEPLAIN]})\\s+-\\s+(${c[u.XRANGEPLAIN]})\\s*$`), _("HYPHENRANGELOOSE", `^\\s*(${c[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[u.XRANGEPLAINLOOSE]})\\s*$`), _("STAR", "(<|>)?=?\\s*\\*"), _("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), _("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Gs, Gs.exports);
var Qr = Gs.exports;
const __ = Object.freeze({ loose: !0 }), v_ = Object.freeze({}), w_ = (e) => e ? typeof e != "object" ? __ : e : v_;
var Vo = w_;
const Yi = /^[0-9]+$/, ql = (e, t) => {
  const r = Yi.test(e), n = Yi.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, E_ = (e, t) => ql(t, e);
var Kl = {
  compareIdentifiers: ql,
  rcompareIdentifiers: E_
};
const fn = ss, { MAX_LENGTH: Qi, MAX_SAFE_INTEGER: hn } = ns, { safeRe: mn, t: pn } = Qr, b_ = Vo, { compareIdentifiers: er } = Kl;
let S_ = class it {
  constructor(t, r) {
    if (r = b_(r), t instanceof it) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > Qi)
      throw new TypeError(
        `version is longer than ${Qi} characters`
      );
    fn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? mn[pn.LOOSE] : mn[pn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > hn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > hn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > hn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < hn)
          return a;
      }
      return s;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (fn("SemVer.compare", this.version, this.options, t), !(t instanceof it)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new it(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof it || (t = new it(t, this.options)), er(this.major, t.major) || er(this.minor, t.minor) || er(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof it || (t = new it(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (fn("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return er(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof it || (t = new it(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (fn("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return er(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? mn[pn.PRERELEASELOOSE] : mn[pn.PRERELEASE]);
        if (!s || s[1] !== r)
          throw new Error(`invalid identifier: ${r}`);
      }
    }
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "release":
        if (this.prerelease.length === 0)
          throw new Error(`version ${this.raw} is not a prerelease`);
        this.prerelease.length = 0;
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const s = Number(n) ? 1 : 0;
        if (this.prerelease.length === 0)
          this.prerelease = [s];
        else {
          let a = this.prerelease.length;
          for (; --a >= 0; )
            typeof this.prerelease[a] == "number" && (this.prerelease[a]++, a = -2);
          if (a === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(s);
          }
        }
        if (r) {
          let a = [r, s];
          n === !1 && (a = [r]), er(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Le = S_;
const Zi = Le, P_ = (e, t, r = !1) => {
  if (e instanceof Zi)
    return e;
  try {
    return new Zi(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var vr = P_;
const N_ = vr, R_ = (e, t) => {
  const r = N_(e, t);
  return r ? r.version : null;
};
var O_ = R_;
const I_ = vr, j_ = (e, t) => {
  const r = I_(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var k_ = j_;
const xi = Le, T_ = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new xi(
      e instanceof xi ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var A_ = T_;
const ec = vr, C_ = (e, t) => {
  const r = ec(e, null, !0), n = ec(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, i = a ? r : n, o = a ? n : r, c = !!i.prerelease.length;
  if (!!o.prerelease.length && !c) {
    if (!o.patch && !o.minor)
      return "major";
    if (o.compareMain(i) === 0)
      return o.minor && !o.patch ? "minor" : "patch";
  }
  const u = c ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var D_ = C_;
const M_ = Le, L_ = (e, t) => new M_(e, t).major;
var V_ = L_;
const F_ = Le, z_ = (e, t) => new F_(e, t).minor;
var U_ = z_;
const q_ = Le, K_ = (e, t) => new q_(e, t).patch;
var G_ = K_;
const H_ = vr, B_ = (e, t) => {
  const r = H_(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var J_ = B_;
const tc = Le, W_ = (e, t, r) => new tc(e, r).compare(new tc(t, r));
var at = W_;
const X_ = at, Y_ = (e, t, r) => X_(t, e, r);
var Q_ = Y_;
const Z_ = at, x_ = (e, t) => Z_(e, t, !0);
var ev = x_;
const rc = Le, tv = (e, t, r) => {
  const n = new rc(e, r), s = new rc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var Fo = tv;
const rv = Fo, nv = (e, t) => e.sort((r, n) => rv(r, n, t));
var sv = nv;
const av = Fo, ov = (e, t) => e.sort((r, n) => av(n, r, t));
var iv = ov;
const cv = at, lv = (e, t, r) => cv(e, t, r) > 0;
var as = lv;
const uv = at, dv = (e, t, r) => uv(e, t, r) < 0;
var zo = dv;
const fv = at, hv = (e, t, r) => fv(e, t, r) === 0;
var Gl = hv;
const mv = at, pv = (e, t, r) => mv(e, t, r) !== 0;
var Hl = pv;
const $v = at, yv = (e, t, r) => $v(e, t, r) >= 0;
var Uo = yv;
const gv = at, _v = (e, t, r) => gv(e, t, r) <= 0;
var qo = _v;
const vv = Gl, wv = Hl, Ev = as, bv = Uo, Sv = zo, Pv = qo, Nv = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return vv(e, r, n);
    case "!=":
      return wv(e, r, n);
    case ">":
      return Ev(e, r, n);
    case ">=":
      return bv(e, r, n);
    case "<":
      return Sv(e, r, n);
    case "<=":
      return Pv(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Bl = Nv;
const Rv = Le, Ov = vr, { safeRe: $n, t: yn } = Qr, Iv = (e, t) => {
  if (e instanceof Rv)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? $n[yn.COERCEFULL] : $n[yn.COERCE]);
  else {
    const c = t.includePrerelease ? $n[yn.COERCERTLFULL] : $n[yn.COERCERTL];
    let d;
    for (; (d = c.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), c.lastIndex = d.index + d[1].length + d[2].length;
    c.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", i = t.includePrerelease && r[5] ? `-${r[5]}` : "", o = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return Ov(`${n}.${s}.${a}${i}${o}`, t);
};
var jv = Iv;
class kv {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const s = this.map.keys().next().value;
        this.delete(s);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var Tv = kv, vs, nc;
function ot() {
  if (nc) return vs;
  nc = 1;
  const e = /\s+/g;
  class t {
    constructor(L, K) {
      if (K = s(K), L instanceof t)
        return L.loose === !!K.loose && L.includePrerelease === !!K.includePrerelease ? L : new t(L.raw, K);
      if (L instanceof a)
        return this.raw = L.value, this.set = [[L]], this.formatted = void 0, this;
      if (this.options = K, this.loose = !!K.loose, this.includePrerelease = !!K.includePrerelease, this.raw = L.trim().replace(e, " "), this.set = this.raw.split("||").map((F) => this.parseRange(F.trim())).filter((F) => F.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const F = this.set[0];
        if (this.set = this.set.filter((Q) => !_(Q[0])), this.set.length === 0)
          this.set = [F];
        else if (this.set.length > 1) {
          for (const Q of this.set)
            if (Q.length === 1 && v(Q[0])) {
              this.set = [Q];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let L = 0; L < this.set.length; L++) {
          L > 0 && (this.formatted += "||");
          const K = this.set[L];
          for (let F = 0; F < K.length; F++)
            F > 0 && (this.formatted += " "), this.formatted += K[F].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(L) {
      const F = ((this.options.includePrerelease && p) | (this.options.loose && $)) + ":" + L, Q = n.get(F);
      if (Q)
        return Q;
      const q = this.options.loose, I = q ? c[d.HYPHENRANGELOOSE] : c[d.HYPHENRANGE];
      L = L.replace(I, Y(this.options.includePrerelease)), i("hyphen replace", L), L = L.replace(c[d.COMPARATORTRIM], u), i("comparator trim", L), L = L.replace(c[d.TILDETRIM], h), i("tilde trim", L), L = L.replace(c[d.CARETTRIM], E), i("caret trim", L);
      let g = L.split(" ").map((f) => S(f, this.options)).join(" ").split(/\s+/).map((f) => U(f, this.options));
      q && (g = g.filter((f) => (i("loose invalid filter", f, this.options), !!f.match(c[d.COMPARATORLOOSE])))), i("range list", g);
      const N = /* @__PURE__ */ new Map(), w = g.map((f) => new a(f, this.options));
      for (const f of w) {
        if (_(f))
          return [f];
        N.set(f.value, f);
      }
      N.size > 1 && N.has("") && N.delete("");
      const l = [...N.values()];
      return n.set(F, l), l;
    }
    intersects(L, K) {
      if (!(L instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((F) => m(F, K) && L.set.some((Q) => m(Q, K) && F.every((q) => Q.every((I) => q.intersects(I, K)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(L) {
      if (!L)
        return !1;
      if (typeof L == "string")
        try {
          L = new o(L, this.options);
        } catch {
          return !1;
        }
      for (let K = 0; K < this.set.length; K++)
        if (J(this.set[K], L, this.options))
          return !0;
      return !1;
    }
  }
  vs = t;
  const r = Tv, n = new r(), s = Vo, a = os(), i = ss, o = Le, {
    safeRe: c,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: E
  } = Qr, { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: $ } = ns, _ = (A) => A.value === "<0.0.0-0", v = (A) => A.value === "", m = (A, L) => {
    let K = !0;
    const F = A.slice();
    let Q = F.pop();
    for (; K && F.length; )
      K = F.every((q) => Q.intersects(q, L)), Q = F.pop();
    return K;
  }, S = (A, L) => (i("comp", A, L), A = B(A, L), i("caret", A), A = j(A, L), i("tildes", A), A = le(A, L), i("xrange", A), A = me(A, L), i("stars", A), A), R = (A) => !A || A.toLowerCase() === "x" || A === "*", j = (A, L) => A.trim().split(/\s+/).map((K) => T(K, L)).join(" "), T = (A, L) => {
    const K = L.loose ? c[d.TILDELOOSE] : c[d.TILDE];
    return A.replace(K, (F, Q, q, I, g) => {
      i("tilde", A, F, Q, q, I, g);
      let N;
      return R(Q) ? N = "" : R(q) ? N = `>=${Q}.0.0 <${+Q + 1}.0.0-0` : R(I) ? N = `>=${Q}.${q}.0 <${Q}.${+q + 1}.0-0` : g ? (i("replaceTilde pr", g), N = `>=${Q}.${q}.${I}-${g} <${Q}.${+q + 1}.0-0`) : N = `>=${Q}.${q}.${I} <${Q}.${+q + 1}.0-0`, i("tilde return", N), N;
    });
  }, B = (A, L) => A.trim().split(/\s+/).map((K) => X(K, L)).join(" "), X = (A, L) => {
    i("caret", A, L);
    const K = L.loose ? c[d.CARETLOOSE] : c[d.CARET], F = L.includePrerelease ? "-0" : "";
    return A.replace(K, (Q, q, I, g, N) => {
      i("caret", A, Q, q, I, g, N);
      let w;
      return R(q) ? w = "" : R(I) ? w = `>=${q}.0.0${F} <${+q + 1}.0.0-0` : R(g) ? q === "0" ? w = `>=${q}.${I}.0${F} <${q}.${+I + 1}.0-0` : w = `>=${q}.${I}.0${F} <${+q + 1}.0.0-0` : N ? (i("replaceCaret pr", N), q === "0" ? I === "0" ? w = `>=${q}.${I}.${g}-${N} <${q}.${I}.${+g + 1}-0` : w = `>=${q}.${I}.${g}-${N} <${q}.${+I + 1}.0-0` : w = `>=${q}.${I}.${g}-${N} <${+q + 1}.0.0-0`) : (i("no pr"), q === "0" ? I === "0" ? w = `>=${q}.${I}.${g}${F} <${q}.${I}.${+g + 1}-0` : w = `>=${q}.${I}.${g}${F} <${q}.${+I + 1}.0-0` : w = `>=${q}.${I}.${g} <${+q + 1}.0.0-0`), i("caret return", w), w;
    });
  }, le = (A, L) => (i("replaceXRanges", A, L), A.split(/\s+/).map((K) => ue(K, L)).join(" ")), ue = (A, L) => {
    A = A.trim();
    const K = L.loose ? c[d.XRANGELOOSE] : c[d.XRANGE];
    return A.replace(K, (F, Q, q, I, g, N) => {
      i("xRange", A, F, Q, q, I, g, N);
      const w = R(q), l = w || R(I), f = l || R(g), P = f;
      return Q === "=" && P && (Q = ""), N = L.includePrerelease ? "-0" : "", w ? Q === ">" || Q === "<" ? F = "<0.0.0-0" : F = "*" : Q && P ? (l && (I = 0), g = 0, Q === ">" ? (Q = ">=", l ? (q = +q + 1, I = 0, g = 0) : (I = +I + 1, g = 0)) : Q === "<=" && (Q = "<", l ? q = +q + 1 : I = +I + 1), Q === "<" && (N = "-0"), F = `${Q + q}.${I}.${g}${N}`) : l ? F = `>=${q}.0.0${N} <${+q + 1}.0.0-0` : f && (F = `>=${q}.${I}.0${N} <${q}.${+I + 1}.0-0`), i("xRange return", F), F;
    });
  }, me = (A, L) => (i("replaceStars", A, L), A.trim().replace(c[d.STAR], "")), U = (A, L) => (i("replaceGTE0", A, L), A.trim().replace(c[L.includePrerelease ? d.GTE0PRE : d.GTE0], "")), Y = (A) => (L, K, F, Q, q, I, g, N, w, l, f, P) => (R(F) ? K = "" : R(Q) ? K = `>=${F}.0.0${A ? "-0" : ""}` : R(q) ? K = `>=${F}.${Q}.0${A ? "-0" : ""}` : I ? K = `>=${K}` : K = `>=${K}${A ? "-0" : ""}`, R(w) ? N = "" : R(l) ? N = `<${+w + 1}.0.0-0` : R(f) ? N = `<${w}.${+l + 1}.0-0` : P ? N = `<=${w}.${l}.${f}-${P}` : A ? N = `<${w}.${l}.${+f + 1}-0` : N = `<=${N}`, `${K} ${N}`.trim()), J = (A, L, K) => {
    for (let F = 0; F < A.length; F++)
      if (!A[F].test(L))
        return !1;
    if (L.prerelease.length && !K.includePrerelease) {
      for (let F = 0; F < A.length; F++)
        if (i(A[F].semver), A[F].semver !== a.ANY && A[F].semver.prerelease.length > 0) {
          const Q = A[F].semver;
          if (Q.major === L.major && Q.minor === L.minor && Q.patch === L.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return vs;
}
var ws, sc;
function os() {
  if (sc) return ws;
  sc = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(u, h) {
      if (h = r(h), u instanceof t) {
        if (u.loose === !!h.loose)
          return u;
        u = u.value;
      }
      u = u.trim().split(/\s+/).join(" "), i("comparator", u, h), this.options = h, this.loose = !!h.loose, this.parse(u), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, i("comp", this);
    }
    parse(u) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], E = u.match(h);
      if (!E)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = E[1] !== void 0 ? E[1] : "", this.operator === "=" && (this.operator = ""), E[2] ? this.semver = new o(E[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (i("Comparator.test", u, this.options.loose), this.semver === e || u === e)
        return !0;
      if (typeof u == "string")
        try {
          u = new o(u, this.options);
        } catch {
          return !1;
        }
      return a(u, this.operator, this.semver, this.options);
    }
    intersects(u, h) {
      if (!(u instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new c(u.value, h).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new c(this.value, h).test(u.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || a(this.semver, "<", u.semver, h) && this.operator.startsWith(">") && u.operator.startsWith("<") || a(this.semver, ">", u.semver, h) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  ws = t;
  const r = Vo, { safeRe: n, t: s } = Qr, a = Bl, i = ss, o = Le, c = ot();
  return ws;
}
const Av = ot(), Cv = (e, t, r) => {
  try {
    t = new Av(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var is = Cv;
const Dv = ot(), Mv = (e, t) => new Dv(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var Lv = Mv;
const Vv = Le, Fv = ot(), zv = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Fv(t, r);
  } catch {
    return null;
  }
  return e.forEach((i) => {
    a.test(i) && (!n || s.compare(i) === -1) && (n = i, s = new Vv(n, r));
  }), n;
};
var Uv = zv;
const qv = Le, Kv = ot(), Gv = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Kv(t, r);
  } catch {
    return null;
  }
  return e.forEach((i) => {
    a.test(i) && (!n || s.compare(i) === 1) && (n = i, s = new qv(n, r));
  }), n;
};
var Hv = Gv;
const Es = Le, Bv = ot(), ac = as, Jv = (e, t) => {
  e = new Bv(e, t);
  let r = new Es("0.0.0");
  if (e.test(r) || (r = new Es("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((i) => {
      const o = new Es(i.semver.version);
      switch (i.operator) {
        case ">":
          o.prerelease.length === 0 ? o.patch++ : o.prerelease.push(0), o.raw = o.format();
        case "":
        case ">=":
          (!a || ac(o, a)) && (a = o);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${i.operator}`);
      }
    }), a && (!r || ac(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var Wv = Jv;
const Xv = ot(), Yv = (e, t) => {
  try {
    return new Xv(e, t).range || "*";
  } catch {
    return null;
  }
};
var Qv = Yv;
const Zv = Le, Jl = os(), { ANY: xv } = Jl, ew = ot(), tw = is, oc = as, ic = zo, rw = qo, nw = Uo, sw = (e, t, r, n) => {
  e = new Zv(e, n), t = new ew(t, n);
  let s, a, i, o, c;
  switch (r) {
    case ">":
      s = oc, a = rw, i = ic, o = ">", c = ">=";
      break;
    case "<":
      s = ic, a = nw, i = oc, o = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (tw(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, E = null;
    if (u.forEach((p) => {
      p.semver === xv && (p = new Jl(">=0.0.0")), h = h || p, E = E || p, s(p.semver, h.semver, n) ? h = p : i(p.semver, E.semver, n) && (E = p);
    }), h.operator === o || h.operator === c || (!E.operator || E.operator === o) && a(e, E.semver))
      return !1;
    if (E.operator === c && i(e, E.semver))
      return !1;
  }
  return !0;
};
var Ko = sw;
const aw = Ko, ow = (e, t, r) => aw(e, t, ">", r);
var iw = ow;
const cw = Ko, lw = (e, t, r) => cw(e, t, "<", r);
var uw = lw;
const cc = ot(), dw = (e, t, r) => (e = new cc(e, r), t = new cc(t, r), e.intersects(t, r));
var fw = dw;
const hw = is, mw = at;
var pw = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const i = e.sort((u, h) => mw(u, h, r));
  for (const u of i)
    hw(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const o = [];
  for (const [u, h] of n)
    u === h ? o.push(u) : !h && u === i[0] ? o.push("*") : h ? u === i[0] ? o.push(`<=${h}`) : o.push(`${u} - ${h}`) : o.push(`>=${u}`);
  const c = o.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return c.length < d.length ? c : t;
};
const lc = ot(), Go = os(), { ANY: bs } = Go, kr = is, Ho = at, $w = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new lc(e, r), t = new lc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const i = gw(s, a, r);
      if (n = n || i !== null, i)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, yw = [new Go(">=0.0.0-0")], uc = [new Go(">=0.0.0")], gw = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === bs) {
    if (t.length === 1 && t[0].semver === bs)
      return !0;
    r.includePrerelease ? e = yw : e = uc;
  }
  if (t.length === 1 && t[0].semver === bs) {
    if (r.includePrerelease)
      return !0;
    t = uc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const p of e)
    p.operator === ">" || p.operator === ">=" ? s = dc(s, p, r) : p.operator === "<" || p.operator === "<=" ? a = fc(a, p, r) : n.add(p.semver);
  if (n.size > 1)
    return null;
  let i;
  if (s && a) {
    if (i = Ho(s.semver, a.semver, r), i > 0)
      return null;
    if (i === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const p of n) {
    if (s && !kr(p, String(s), r) || a && !kr(p, String(a), r))
      return null;
    for (const $ of t)
      if (!kr(p, String($), r))
        return !1;
    return !0;
  }
  let o, c, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, E = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const p of t) {
    if (u = u || p.operator === ">" || p.operator === ">=", d = d || p.operator === "<" || p.operator === "<=", s) {
      if (E && p.semver.prerelease && p.semver.prerelease.length && p.semver.major === E.major && p.semver.minor === E.minor && p.semver.patch === E.patch && (E = !1), p.operator === ">" || p.operator === ">=") {
        if (o = dc(s, p, r), o === p && o !== s)
          return !1;
      } else if (s.operator === ">=" && !kr(s.semver, String(p), r))
        return !1;
    }
    if (a) {
      if (h && p.semver.prerelease && p.semver.prerelease.length && p.semver.major === h.major && p.semver.minor === h.minor && p.semver.patch === h.patch && (h = !1), p.operator === "<" || p.operator === "<=") {
        if (c = fc(a, p, r), c === p && c !== a)
          return !1;
      } else if (a.operator === "<=" && !kr(a.semver, String(p), r))
        return !1;
    }
    if (!p.operator && (a || s) && i !== 0)
      return !1;
  }
  return !(s && d && !a && i !== 0 || a && u && !s && i !== 0 || E || h);
}, dc = (e, t, r) => {
  if (!e)
    return t;
  const n = Ho(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, fc = (e, t, r) => {
  if (!e)
    return t;
  const n = Ho(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var _w = $w;
const Ss = Qr, hc = ns, vw = Le, mc = Kl, ww = vr, Ew = O_, bw = k_, Sw = A_, Pw = D_, Nw = V_, Rw = U_, Ow = G_, Iw = J_, jw = at, kw = Q_, Tw = ev, Aw = Fo, Cw = sv, Dw = iv, Mw = as, Lw = zo, Vw = Gl, Fw = Hl, zw = Uo, Uw = qo, qw = Bl, Kw = jv, Gw = os(), Hw = ot(), Bw = is, Jw = Lv, Ww = Uv, Xw = Hv, Yw = Wv, Qw = Qv, Zw = Ko, xw = iw, eE = uw, tE = fw, rE = pw, nE = _w;
var sE = {
  parse: ww,
  valid: Ew,
  clean: bw,
  inc: Sw,
  diff: Pw,
  major: Nw,
  minor: Rw,
  patch: Ow,
  prerelease: Iw,
  compare: jw,
  rcompare: kw,
  compareLoose: Tw,
  compareBuild: Aw,
  sort: Cw,
  rsort: Dw,
  gt: Mw,
  lt: Lw,
  eq: Vw,
  neq: Fw,
  gte: zw,
  lte: Uw,
  cmp: qw,
  coerce: Kw,
  Comparator: Gw,
  Range: Hw,
  satisfies: Bw,
  toComparators: Jw,
  maxSatisfying: Ww,
  minSatisfying: Xw,
  minVersion: Yw,
  validRange: Qw,
  outside: Zw,
  gtr: xw,
  ltr: eE,
  intersects: tE,
  simplifyRange: rE,
  subset: nE,
  SemVer: vw,
  re: Ss.re,
  src: Ss.src,
  tokens: Ss.t,
  SEMVER_SPEC_VERSION: hc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: hc.RELEASE_TYPES,
  compareIdentifiers: mc.compareIdentifiers,
  rcompareIdentifiers: mc.rcompareIdentifiers
};
const tr = /* @__PURE__ */ Nc(sE), aE = Object.prototype.toString, oE = "[object Uint8Array]", iE = "[object ArrayBuffer]";
function Wl(e, t, r) {
  return e ? e.constructor === t ? !0 : aE.call(e) === r : !1;
}
function Xl(e) {
  return Wl(e, Uint8Array, oE);
}
function cE(e) {
  return Wl(e, ArrayBuffer, iE);
}
function lE(e) {
  return Xl(e) || cE(e);
}
function uE(e) {
  if (!Xl(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function dE(e) {
  if (!lE(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function pc(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    uE(s), r.set(s, n), n += s.length;
  return r;
}
const gn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function $c(e, t = "utf8") {
  return dE(e), gn[t] ?? (gn[t] = new globalThis.TextDecoder(t)), gn[t].decode(e);
}
function fE(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const hE = new globalThis.TextEncoder();
function Ps(e) {
  return fE(e), hE.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const mE = s_.default, yc = "aes-256-cbc", rr = () => /* @__PURE__ */ Object.create(null), pE = (e) => e != null, $E = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, On = "__internal__", Ns = `${On}.migrations.version`;
var jt, pt, Ke, $t;
class yE {
  constructor(t = {}) {
    br(this, "path");
    br(this, "events");
    Sr(this, jt);
    Sr(this, pt);
    Sr(this, Ke);
    Sr(this, $t, {});
    br(this, "_deserialize", (t) => JSON.parse(t));
    br(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = du(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (Pr(this, Ke, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const i = new j$.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      mE(i);
      const o = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      Pr(this, jt, i.compile(o));
      for (const [c, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (ve(this, $t)[c] = d.default);
    }
    r.defaults && Pr(this, $t, {
      ...ve(this, $t),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), Pr(this, pt, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = he.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(rr(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      tu.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (ve(this, Ke).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${On} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, i) => {
      $E(a, i), ve(this, Ke).accessPropertiesByDotNotation ? Wo(n, a, i) : n[a] = i;
    };
    if (typeof t == "object") {
      const a = t;
      for (const [i, o] of Object.entries(a))
        s(i, o);
    } else
      s(t, r);
    this.store = n;
  }
  has(t) {
    return ve(this, Ke).accessPropertiesByDotNotation ? iu(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      pE(ve(this, $t)[r]) && this.set(r, ve(this, $t)[r]);
  }
  delete(t) {
    const { store: r } = this;
    ve(this, Ke).accessPropertiesByDotNotation ? ou(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = rr();
    for (const t of Object.keys(ve(this, $t)))
      this.reset(t);
  }
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleChange(() => this.store, t);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const t = ne.readFileSync(this.path, ve(this, pt) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(rr(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), rr();
      if (ve(this, Ke).clearInvalidConfig && t.name === "SyntaxError")
        return rr();
      throw t;
    }
  }
  set store(t) {
    this._ensureDirectory(), this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      yield [t, r];
  }
  _encryptData(t) {
    if (!ve(this, pt))
      return typeof t == "string" ? t : $c(t);
    try {
      const r = t.slice(0, 16), n = Nr.pbkdf2Sync(ve(this, pt), r.toString(), 1e4, 32, "sha512"), s = Nr.createDecipheriv(yc, n, r), a = t.slice(17), i = typeof a == "string" ? Ps(a) : a;
      return $c(pc([s.update(i), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, i = t();
      eu(i, a) || (n = i, r.call(this, i, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!ve(this, jt) || ve(this, jt).call(this, t) || !ve(this, jt).errors)
      return;
    const n = ve(this, jt).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    ne.mkdirSync(he.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (ve(this, pt)) {
      const n = Nr.randomBytes(16), s = Nr.pbkdf2Sync(ve(this, pt), n.toString(), 1e4, 32, "sha512"), a = Nr.createCipheriv(yc, s, n);
      r = pc([n, Ps(":"), a.update(Ps(r)), a.final()]);
    }
    if (Re.env.SNAP)
      ne.writeFileSync(this.path, r, { mode: ve(this, Ke).configFileMode });
    else
      try {
        Pc(this.path, r, { mode: ve(this, Ke).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          ne.writeFileSync(this.path, r, { mode: ve(this, Ke).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), ne.existsSync(this.path) || this._write(rr()), Re.platform === "win32" ? ne.watch(this.path, { persistent: !1 }, Xi(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : ne.watchFile(this.path, { persistent: !1 }, Xi(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(Ns, "0.0.0");
    const a = Object.keys(t).filter((o) => this._shouldPerformMigration(o, s, r));
    let i = { ...this.store };
    for (const o of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: o,
          finalVersion: r,
          versions: a
        });
        const c = t[o];
        c == null || c(this), this._set(Ns, o), s = o, i = { ...this.store };
      } catch (c) {
        throw this.store = i, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${c}`);
      }
    (this._isVersionInRangeFormat(s) || !tr.eq(s, r)) && this._set(Ns, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === On ? !0 : typeof t != "string" ? !1 : ve(this, Ke).accessPropertiesByDotNotation ? !!t.startsWith(`${On}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return tr.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && tr.satisfies(r, t) ? !1 : tr.satisfies(n, t) : !(tr.lte(t, r) || tr.gt(t, n));
  }
  _get(t, r) {
    return au(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    Wo(n, t, r), this.store = n;
  }
}
jt = new WeakMap(), pt = new WeakMap(), Ke = new WeakMap(), $t = new WeakMap();
const { app: In, ipcMain: Hs, shell: gE } = wc;
let gc = !1;
const _c = () => {
  if (!Hs || !In)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: In.getPath("userData"),
    appVersion: In.getVersion()
  };
  return gc || (Hs.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), gc = !0), e;
};
class _E extends yE {
  constructor(t) {
    let r, n;
    if (Re.type === "renderer") {
      const s = wc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else Hs && In && ({ defaultCwd: r, appVersion: n } = _c());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = he.isAbsolute(t.cwd) ? t.cwd : he.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    _c();
  }
  async openInEditor() {
    const t = await gE.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Dt = Z.dirname(ru(import.meta.url));
process.env.APP_ROOT = Z.join(Dt, "..");
const Bs = process.env.VITE_DEV_SERVER_URL, DE = Z.join(process.env.APP_ROOT, "dist-electron"), Yl = Z.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Bs ? Z.join(process.env.APP_ROOT, "public") : Yl;
let x, Kr = null;
const rt = /* @__PURE__ */ new Map();
let At = null;
const zn = {
  nomeCliente: "",
  ip: "",
  user: "",
  password: "",
  localCSV: "",
  metodoCSV: "",
  // '1' ou '2'
  habilitarCSV: !1,
  serverDB: "",
  database: "",
  userDB: "",
  passwordDB: "",
  mySqlDir: "",
  dumpDir: "",
  batchDumpDir: ""
}, jn = new _E({
  defaults: {
    formData: zn
  },
  name: "app-config"
});
nt.handle(
  "save-data",
  async (e, t, r) => {
    try {
      if (t === "all")
        jn.set("formData", r);
      else {
        const s = { ...jn.get("formData", zn), ...r };
        jn.set("formData", s);
      }
      return console.log("Dados salvos com sucesso para a chave:", t), !0;
    } catch (n) {
      return console.error("Erro ao salvar dados:", n), !1;
    }
  }
);
nt.handle("load-data", async () => {
  try {
    return jn.get("formData", zn);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), zn;
  }
});
nt.handle("select-folder", async () => {
  const e = await Ec.showOpenDialog(x, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
nt.handle("select-file", async () => {
  const e = await Ec.showOpenDialog(x, {
    properties: ["openFile"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhum arquivo selecionado"), null;
  const t = e.filePaths[0];
  return console.log("Arquivo selecionado:", t), t;
});
nt.handle("clean-db", async () => (console.log("Limpando banco de dados..."), new Promise((e) => {
  setTimeout(() => {
    console.log("Banco de dados limpo com sucesso"), e(!0);
  }, 1e3);
})));
nt.handle(
  "print-pdf",
  async (e, t) => {
    try {
      const r = new Js({
        width: 800,
        height: 600,
        show: !0,
        webPreferences: {
          preload: Z.join(Dt, "preload.mjs"),
          nodeIntegration: !0,
          contextIsolation: !1
        }
      });
      return await r.loadFile(t), r.webContents.on("did-finish-load", () => {
        r.webContents.print({
          silent: !1,
          // false para mostrar diálogo de impressão
          printBackground: !0
        });
      }), { ok: !0 };
    } catch (r) {
      return console.error("Erro ao imprimir PDF:", r), { ok: !1, error: r };
    }
  }
);
nt.handle(
  "start-fork",
  async (e, { script: t, args: r = [] } = {}) => {
    const n = Z.dirname(Z.dirname(Dt));
    t || (t = "../back-end/dist/src/index.js");
    let s;
    if (Z.isAbsolute(t))
      s = t;
    else {
      const a = [
        // Prefer IPC-only CJS build
        Z.join(n, "back-end", "dist", "index.js"),
        // Fallback to full build structure if present
        Z.join(n, "back-end", "dist", "src", "index.js"),
        // TypeScript source (will use ts-node)
        Z.join(n, "back-end", "src", "index.ts"),
        // Original provided script path fallbacks
        Z.join(Dt, t),
        Z.join(process.env.APP_ROOT || "", t),
        Z.join(Z.dirname(Dt), t),
        Z.join(n, t),
        Z.resolve(t)
      ];
      console.log("Trying paths:", a), s = a.find((i) => {
        try {
          const o = Be.existsSync(i);
          return console.log(`Path ${i} exists: ${o}`), o;
        } catch {
          return !1;
        }
      }) || a[0];
    }
    console.log("Attempting to fork script at:", s), console.log("Script exists:", Be.existsSync(s));
    try {
      const a = Z.join(n, "Frontend", "backend");
      if (s.startsWith(a)) {
        const o = [
          Z.join(n, "back-end", "dist", "index.js"),
          Z.join(n, "back-end", "dist", "src", "index.js"),
          Z.join(n, "back-end", "src", "index.ts"),
          Z.join(n, "back-end", "src", "index.js")
        ].find((c) => Be.existsSync(c));
        o ? (console.log(
          "Replacing frontend shim script with real backend entry:",
          o
        ), s = o) : console.log(
          "No real backend entry found, will attempt to fork provided script (may fail if AMD-wrapped)"
        );
      }
    } catch {
    }
    try {
      const a = Z.dirname(s);
      let i = a, o = !1;
      for (; i && i !== Z.dirname(i); ) {
        const u = Z.join(i, "package.json");
        if (Be.existsSync(u))
          try {
            if (JSON.parse(
              Be.readFileSync(u, "utf8")
            ).name === "backend") {
              o = !0;
              break;
            }
          } catch {
          }
        i = Z.dirname(i);
      }
      o || (i = a), console.log("Setting child process cwd to:", i), Kr = s;
      const c = qn(s, r, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: i,
        silent: !1,
        env: { ...process.env }
      }), d = c.pid;
      if (console.log("Child process forked with PID:", d), typeof d == "number")
        rt.set(d, c), console.log(
          "Child process added to children map. Total children:",
          rt.size
        );
      else
        return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
      return new Promise((u, h) => {
        const E = setTimeout(() => {
          h(new Error("Timeout waiting for WebSocket port from backend"));
        }, 1e4), p = ($) => {
          $ && $.type === "websocket-port" && typeof $.port == "number" && (clearTimeout(E), c.off("message", p), u({ ok: !0, port: $.port, pid: d }));
        };
        c.on("message", p), c.on("error", ($) => {
          console.error("Child process error:", $), typeof c.pid == "number" && rt.delete(c.pid), clearTimeout(E), h($);
        }), c.on("exit", ($, _) => {
          console.log(
            `Child process ${c.pid} exited with code ${$} and signal ${_}`
          ), typeof c.pid == "number" && rt.delete(c.pid), x && !x.isDestroyed() && x.webContents.send("child-exit", {
            pid: c.pid,
            code: $,
            signal: _
          }), clearTimeout(E), h(new Error(`Child process exited with code ${$}`));
        }), c.on("message", ($) => {
          console.log("Message from child:", $), !($ && typeof $ == "object" && "type" in $ && $.type === "websocket-port") && x && !x.isDestroyed() && x.webContents.send("child-message", { pid: c.pid, msg: $ });
        }), c.stdout && c.stdout.on("data", ($) => {
          console.log("Child stdout:", $.toString()), x && !x.isDestroyed() && x.webContents.send("child-stdout", {
            pid: c.pid,
            data: $.toString()
          });
        }), c.stderr && c.stderr.on("data", ($) => {
          console.error("Child stderr:", $.toString()), x && !x.isDestroyed() && x.webContents.send("child-stderr", {
            pid: c.pid,
            data: $.toString()
          });
        });
      });
    } catch (a) {
      return console.error("Failed to fork child process:", a), { ok: !1, reason: `fork-error: ${a}` };
    }
  }
);
nt.handle(
  "start-collector-fork",
  async (e, { args: t = [] } = {}) => {
    const r = Z.dirname(Z.dirname(Dt)), n = [
      Z.join(
        r,
        "back-end",
        "dist",
        "src",
        "collector",
        "runner.js"
      ),
      Z.join(r, "back-end", "dist", "collector", "runner.js"),
      Z.join(r, "back-end", "src", "collector", "runner.ts")
    ], s = n.find((a) => Be.existsSync(a)) || n[0];
    if (!Be.existsSync(s))
      return { ok: !1, reason: "collector-not-found", attempted: n };
    try {
      const a = qn(s, t, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: Z.dirname(s),
        env: { ...process.env }
      }), i = a.pid;
      return typeof i == "number" && (rt.set(i, a), a.on("message", (o) => {
        x && !x.isDestroyed() && x.webContents.send("child-message", { pid: i, msg: o });
      }), a.stdout && a.stdout.on("data", (o) => {
        x && !x.isDestroyed() && x.webContents.send("child-stdout", { pid: i, data: o.toString() });
      }), a.stderr && a.stderr.on("data", (o) => {
        x && !x.isDestroyed() && x.webContents.send("child-stderr", { pid: i, data: o.toString() });
      })), { ok: !0, pid: i };
    } catch (a) {
      return { ok: !1, reason: String(a) };
    }
  }
);
nt.handle(
  "send-to-child",
  async (e, { pid: t, msg: r } = {}) => {
    if (console.log(
      "send-to-child called with PID:",
      t,
      "Message type:",
      r == null ? void 0 : r.type
    ), console.log("Available children PIDs:", Array.from(rt.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const n = rt.get(t);
    if (!n) {
      if (console.log("Child not found for PID:", t), Kr)
        try {
          const s = Z.dirname(Kr), a = qn(Kr, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: s,
            silent: !1,
            env: { ...process.env }
          }), i = a.pid;
          if (typeof i == "number") {
            rt.set(i, a), x && !x.isDestroyed() && x.webContents.send("child-message", {
              pid: i,
              msg: {
                type: "event",
                event: "reforked",
                payload: { oldPid: t, newPid: i }
              }
            });
            try {
              return a.send(r), { ok: !0 };
            } catch (o) {
              return console.error("Error sending message after refork:", o), { ok: !1, reason: String(o) };
            }
          }
        } catch (s) {
          console.error("Auto-refork failed:", s);
        }
      return { ok: !1, reason: "not-found" };
    }
    try {
      return console.log("Sending message to child:", r), n.send(r), { ok: !0 };
    } catch (s) {
      return console.error("Error sending message to child:", s), { ok: !1, reason: String(s) };
    }
  }
);
nt.handle(
  "stop-child",
  async (e, { pid: t } = {}) => {
    if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const r = rt.get(t);
    if (!r) return { ok: !1, reason: "not-found" };
    try {
      return r.kill("SIGTERM"), { ok: !0 };
    } catch (n) {
      return { ok: !1, reason: String(n) };
    }
  }
);
function vc() {
  if (x = new Js({
    icon: Z.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: Z.join(Dt, "preload.mjs"),
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), x.maximize(), x.webContents.on("did-finish-load", () => {
    x == null || x.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Bs)
    x.loadURL(Bs);
  else
    try {
      const e = Z.join(process.resourcesPath, "dist", "index.html");
      if (console.log("[main] loading packaged index from", e), Be.existsSync(e))
        x.loadFile(e);
      else {
        const t = Z.join(Yl, "index.html");
        console.warn(
          "[main] packaged index not found at",
          e,
          "falling back to",
          t
        ), x.loadFile(t);
      }
    } catch (e) {
      console.error("[main] failed to load packaged index.html", e);
      try {
        const t = Z.join(
          process.resourcesPath,
          "app.asar",
          "dist",
          "index.html"
        );
        console.log("[main] attempting alt loadFile", t), x.loadFile(t);
      } catch (t) {
        console.error("[main] all index.html load attempts failed", t);
      }
    }
}
Ct.whenReady().then(() => {
  (async () => {
    if (Ct.isPackaged)
      try {
        const e = Z.join(
          process.resourcesPath,
          "backend",
          "backend.exe"
        );
        Be.existsSync(e) ? (console.log("[main] Spawning packaged backend exe at", e), At = nu(e, [], {
          env: {
            ...process.env,
            FRONTEND_API_PORT: process.env.FRONTEND_API_PORT || "3000"
          },
          cwd: process.resourcesPath
        }), At.stdout.on(
          "data",
          (t) => console.log("[backend exe stdout]", t.toString())
        ), At.stderr.on(
          "data",
          (t) => console.error("[backend exe stderr]", t.toString())
        ), At.on(
          "exit",
          (t) => console.log("[backend exe] exited", t)
        )) : console.warn("[main] packaged backend exe not found at", e);
      } catch (e) {
        console.error("[main] failed to spawn packaged backend exe", e);
      }
    else
      try {
        const e = Z.dirname(Z.dirname(Dt)), r = [
          Z.join(e, "back-end", "dist", "index.js"),
          Z.join(e, "back-end", "dist", "src", "index.js"),
          Z.join(e, "back-end", "src", "index.ts")
        ].find((n) => Be.existsSync(n));
        if (r)
          try {
            console.log("[main] dev auto-forking backend at", r), Kr = r;
            const n = Z.dirname(r), s = qn(r, [], {
              stdio: ["pipe", "pipe", "ipc"],
              cwd: n,
              env: { ...process.env }
            }), a = s.pid;
            typeof a == "number" && (rt.set(a, s), console.log("[main] dev backend forked with PID", a)), s.on("message", (i) => {
              x && !x.isDestroyed() && x.webContents.send("child-message", { pid: s.pid, msg: i });
            }), s.stdout && s.stdout.on("data", (i) => {
              console.log("[child stdout]", i.toString()), x && !x.isDestroyed() && x.webContents.send("child-stdout", {
                pid: s.pid,
                data: i.toString()
              });
            }), s.stderr && s.stderr.on("data", (i) => {
              console.error("[child stderr]", i.toString()), x && !x.isDestroyed() && x.webContents.send("child-stderr", {
                pid: s.pid,
                data: i.toString()
              });
            });
          } catch (n) {
            console.warn("[main] failed to auto-fork backend in dev:", n);
          }
        else
          console.log(
            "[main] running in development mode, backend fork will be started by renderer when needed (no backend script found)"
          );
      } catch (e) {
        console.warn("[main] dev auto-start failed", e);
      }
    vc();
  })(), Ct.on("activate", () => {
    Js.getAllWindows().length === 0 && vc();
  });
});
Ct.on("window-all-closed", () => {
  process.platform !== "darwin" && Ct.quit();
});
Ct.on("before-quit", () => {
  try {
    At && !At.killed && (At.kill(), At = null);
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, e] of rt.entries())
    try {
      e.kill("SIGTERM");
    } catch {
    }
});
const vE = Z.join(Ct.getPath("userData"), "error.log"), Ql = Be.createWriteStream(vE, { flags: "a" });
process.on("uncaughtException", (e) => {
  Ql.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`
  );
});
process.on("unhandledRejection", (e) => {
  Ql.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`
  );
});
nt.handle(
  "save-pdf",
  async (e, t) => {
    try {
      const r = Ct.getPath("temp"), n = Z.join(r, `relatorio-${Date.now()}.pdf`), s = Buffer.from(t, "base64");
      return Be.writeFileSync(n, s), { ok: !0, path: n };
    } catch (r) {
      return console.error("Failed to save pdf from renderer:", r), { ok: !1, error: String(r) };
    }
  }
);
export {
  DE as MAIN_DIST,
  Yl as RENDERER_DIST,
  Bs as VITE_DEV_SERVER_URL
};
