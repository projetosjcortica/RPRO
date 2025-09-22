var Wu = Object.defineProperty;
var hi = (e) => {
  throw TypeError(e);
};
var Xu = (e, t, r) => t in e ? Wu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Mr = (e, t, r) => Xu(e, typeof t != "symbol" ? t + "" : t, r), mi = (e, t, r) => t.has(e) || hi("Cannot " + r);
var fe = (e, t, r) => (mi(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Lr = (e, t, r) => t.has(e) ? hi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Vr = (e, t, r, n) => (mi(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import qc, { ipcMain as yt, dialog as Gc, app as sn, BrowserWindow as Kc } from "electron";
import * as ne from "path";
import ve from "node:process";
import oe from "node:path";
import { promisify as Pe, isDeepStrictEqual as Yu } from "node:util";
import Z from "node:fs";
import Fr from "node:crypto";
import Qu from "node:assert";
import ss from "node:os";
import Nt from "fs";
import { fileURLToPath as Zu } from "url";
import { fork as da } from "child_process";
const rr = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Ps = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), xu = new Set("0123456789");
function as(e) {
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
        if (Ps.has(r))
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
          if (Ps.has(r))
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
        if (n === "index" && !xu.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (Ps.has(r))
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
function fa(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Hc(e, t) {
  if (fa(e, t))
    throw new Error("Cannot use string index");
}
function ed(e, t, r) {
  if (!rr(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = as(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (fa(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function pi(e, t, r) {
  if (!rr(e) || typeof t != "string")
    return e;
  const n = e, s = as(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Hc(e, o), a === s.length - 1 ? e[o] = r : rr(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function td(e, t) {
  if (!rr(e) || typeof t != "string")
    return !1;
  const r = as(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Hc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !rr(e))
      return !1;
  }
}
function rd(e, t) {
  if (!rr(e) || typeof t != "string")
    return !1;
  const r = as(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!rr(e) || !(n in e) || fa(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Rt = ss.homedir(), ha = ss.tmpdir(), { env: pr } = ve, nd = (e) => {
  const t = oe.join(Rt, "Library");
  return {
    data: oe.join(t, "Application Support", e),
    config: oe.join(t, "Preferences", e),
    cache: oe.join(t, "Caches", e),
    log: oe.join(t, "Logs", e),
    temp: oe.join(ha, e)
  };
}, sd = (e) => {
  const t = pr.APPDATA || oe.join(Rt, "AppData", "Roaming"), r = pr.LOCALAPPDATA || oe.join(Rt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: oe.join(r, e, "Data"),
    config: oe.join(t, e, "Config"),
    cache: oe.join(r, e, "Cache"),
    log: oe.join(r, e, "Log"),
    temp: oe.join(ha, e)
  };
}, ad = (e) => {
  const t = oe.basename(Rt);
  return {
    data: oe.join(pr.XDG_DATA_HOME || oe.join(Rt, ".local", "share"), e),
    config: oe.join(pr.XDG_CONFIG_HOME || oe.join(Rt, ".config"), e),
    cache: oe.join(pr.XDG_CACHE_HOME || oe.join(Rt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: oe.join(pr.XDG_STATE_HOME || oe.join(Rt, ".local", "state"), e),
    temp: oe.join(ha, t, e)
  };
};
function od(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ve.platform === "darwin" ? nd(e) : ve.platform === "win32" ? sd(e) : ad(e);
}
const gt = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, it = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, id = ve.getuid ? !ve.getuid() : !1, cd = 1e4, Ve = () => {
}, he = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!he.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !id && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!he.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!he.isNodeError(e))
      throw e;
    if (!he.isChangeErrorOk(e))
      throw e;
  }
};
class ld {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = cd, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
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
const ud = new ld(), _t = (e, t) => function(n) {
  return function s(...a) {
    return ud.schedule().then((o) => {
      const l = (d) => (o(), d), c = (d) => {
        if (o(), Date.now() >= n)
          throw d;
        if (t(d)) {
          const u = Math.round(100 * Math.random());
          return new Promise((E) => setTimeout(E, u)).then(() => s.apply(void 0, a));
        }
        throw d;
      };
      return e.apply(void 0, a).then(l, c);
    });
  };
}, vt = (e, t) => function(n) {
  return function s(...a) {
    try {
      return e.apply(void 0, a);
    } catch (o) {
      if (Date.now() > n)
        throw o;
      if (t(o))
        return s.apply(void 0, a);
      throw o;
    }
  };
}, Oe = {
  attempt: {
    /* ASYNC */
    chmod: gt(Pe(Z.chmod), he.onChangeError),
    chown: gt(Pe(Z.chown), he.onChangeError),
    close: gt(Pe(Z.close), Ve),
    fsync: gt(Pe(Z.fsync), Ve),
    mkdir: gt(Pe(Z.mkdir), Ve),
    realpath: gt(Pe(Z.realpath), Ve),
    stat: gt(Pe(Z.stat), Ve),
    unlink: gt(Pe(Z.unlink), Ve),
    /* SYNC */
    chmodSync: it(Z.chmodSync, he.onChangeError),
    chownSync: it(Z.chownSync, he.onChangeError),
    closeSync: it(Z.closeSync, Ve),
    existsSync: it(Z.existsSync, Ve),
    fsyncSync: it(Z.fsync, Ve),
    mkdirSync: it(Z.mkdirSync, Ve),
    realpathSync: it(Z.realpathSync, Ve),
    statSync: it(Z.statSync, Ve),
    unlinkSync: it(Z.unlinkSync, Ve)
  },
  retry: {
    /* ASYNC */
    close: _t(Pe(Z.close), he.isRetriableError),
    fsync: _t(Pe(Z.fsync), he.isRetriableError),
    open: _t(Pe(Z.open), he.isRetriableError),
    readFile: _t(Pe(Z.readFile), he.isRetriableError),
    rename: _t(Pe(Z.rename), he.isRetriableError),
    stat: _t(Pe(Z.stat), he.isRetriableError),
    write: _t(Pe(Z.write), he.isRetriableError),
    writeFile: _t(Pe(Z.writeFile), he.isRetriableError),
    /* SYNC */
    closeSync: vt(Z.closeSync, he.isRetriableError),
    fsyncSync: vt(Z.fsyncSync, he.isRetriableError),
    openSync: vt(Z.openSync, he.isRetriableError),
    readFileSync: vt(Z.readFileSync, he.isRetriableError),
    renameSync: vt(Z.renameSync, he.isRetriableError),
    statSync: vt(Z.statSync, he.isRetriableError),
    writeSync: vt(Z.writeSync, he.isRetriableError),
    writeFileSync: vt(Z.writeFileSync, he.isRetriableError)
  }
}, dd = "utf8", $i = 438, fd = 511, hd = {}, md = ss.userInfo().uid, pd = ss.userInfo().gid, $d = 1e3, yd = !!ve.getuid;
ve.getuid && ve.getuid();
const yi = 128, gd = (e) => e instanceof Error && "code" in e, gi = (e) => typeof e == "string", Ns = (e) => e === void 0, _d = ve.platform === "linux", Jc = ve.platform === "win32", ma = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Jc || ma.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
_d && ma.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class vd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Jc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ve.kill(ve.pid, "SIGTERM") : ve.kill(ve.pid, t));
      }
    }, this.hook = () => {
      ve.once("exit", () => this.exit());
      for (const t of ma)
        try {
          ve.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const wd = new vd(), Ed = wd.register, Ie = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Ie.truncate(t(e));
    return n in Ie.store ? Ie.get(e, t, r) : (Ie.store[n] = r, [n, () => delete Ie.store[n]]);
  },
  purge: (e) => {
    Ie.store[e] && (delete Ie.store[e], Oe.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Ie.store[e] && (delete Ie.store[e], Oe.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Ie.store)
      Ie.purgeSync(e);
  },
  truncate: (e) => {
    const t = oe.basename(e);
    if (t.length <= yi)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - yi;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Ed(Ie.purgeSyncAll);
function Bc(e, t, r = hd) {
  if (gi(r))
    return Bc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? $d) || -1);
  let s = null, a = null, o = null;
  try {
    const l = Oe.attempt.realpathSync(e), c = !!l;
    e = l || e, [a, s] = Ie.get(e, r.tmpCreate || Ie.create, r.tmpPurge !== !1);
    const d = yd && Ns(r.chown), u = Ns(r.mode);
    if (c && (d || u)) {
      const h = Oe.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), u && (r.mode = h.mode));
    }
    if (!c) {
      const h = oe.dirname(e);
      Oe.attempt.mkdirSync(h, {
        mode: fd,
        recursive: !0
      });
    }
    o = Oe.retry.openSync(n)(a, "w", r.mode || $i), r.tmpCreated && r.tmpCreated(a), gi(t) ? Oe.retry.writeSync(n)(o, t, 0, r.encoding || dd) : Ns(t) || Oe.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Oe.retry.fsyncSync(n)(o) : Oe.attempt.fsync(o)), Oe.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== md || r.chown.gid !== pd) && Oe.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== $i && Oe.attempt.chmodSync(a, r.mode);
    try {
      Oe.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!gd(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Oe.retry.renameSync(n)(a, Ie.truncate(e));
    }
    s(), a = null;
  } finally {
    o && Oe.attempt.closeSync(o), a && Ie.purge(a);
  }
}
function Wc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Hs = { exports: {} }, Xc = {}, Ye = {}, wr = {}, cn = {}, X = {}, an = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(w) {
      if (super(), !e.IDENTIFIER.test(w))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = w;
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
    constructor(w) {
      super(), this._items = typeof w == "string" ? [w] : w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const w = this._items[0];
      return w === "" || w === '""';
    }
    get str() {
      var w;
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const N = [m[0]];
    let R = 0;
    for (; R < w.length; )
      l(N, w[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...w) {
    const N = [_(m[0])];
    let R = 0;
    for (; R < w.length; )
      N.push(a), l(N, w[R]), N.push(a, _(m[++R]));
    return c(N), new n(N);
  }
  e.str = o;
  function l(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = l;
  function c(m) {
    let w = 1;
    for (; w < m.length - 1; ) {
      if (m[w] === a) {
        const N = d(m[w - 1], m[w + 1]);
        if (N !== void 0) {
          m.splice(w - 1, 3, N);
          continue;
        }
        m[w++] = "+";
      }
      w++;
    }
  }
  function d(m, w) {
    if (w === '""')
      return m;
    if (m === '""')
      return w;
    if (typeof m == "string")
      return w instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof w != "string" ? `${m.slice(0, -1)}${w}"` : w[0] === '"' ? m.slice(0, -1) + w.slice(1) : void 0;
    if (typeof w == "string" && w[0] === '"' && !(m instanceof r))
      return `"${m}${w.slice(1)}`;
  }
  function u(m, w) {
    return w.emptyStr() ? m : m.emptyStr() ? w : o`${m}${w}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : _(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(_(m));
  }
  e.stringify = E;
  function _(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = _;
  function v(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = v;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function y(m) {
    return new n(m.toString());
  }
  e.regexpCode = y;
})(an);
var Js = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = an;
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
  const o = (0, t._)`\n`;
  class l extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : t.nil };
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
      const E = this.toName(d), { prefix: _ } = E, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[_];
      if (g) {
        const w = g.get(v);
        if (w)
          return w;
      } else
        g = this._values[_] = /* @__PURE__ */ new Map();
      g.set(v, E);
      const y = this._scope[_] || (this._scope[_] = []), m = y.length;
      return y[m] = u.ref, E.setValue(u, { property: _, itemIndex: m }), E;
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
      let _ = t.nil;
      for (const v in d) {
        const g = d[v];
        if (!g)
          continue;
        const y = h[v] = h[v] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let w = u(m);
          if (w) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            _ = (0, t._)`${_}${N} ${m} = ${w};${this.opts._n}`;
          } else if (w = E == null ? void 0 : E(m))
            _ = (0, t._)`${_}${w}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return _;
    }
  }
  e.ValueScope = l;
})(Js);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = an, r = Js;
  var n = an;
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
  var s = Js;
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
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, b) {
      super(), this.varKind = i, this.name = f, this.rhs = b;
    }
    render({ es5: i, _n: f }) {
      const b = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = j(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return ae(i, this.rhs);
    }
  }
  class c extends l {
    constructor(i, f, b, I) {
      super(i, b, I), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = j(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class _ extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, b) => f + b.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const b = i[f].optimizeNodes();
        Array.isArray(b) ? i.splice(f, 1, ...b) : b ? i[f] = b : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: b } = this;
      let I = b.length;
      for (; I--; ) {
        const T = b[I];
        T.optimizeNames(i, f) || (k(i, T.names), b.splice(I, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class v extends _ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends _ {
  }
  class y extends v {
  }
  y.kind = "else";
  class m extends v {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const b = f.optimizeNodes();
        f = this.else = Array.isArray(b) ? new y(b) : b;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(L(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = j(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return ae(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class w extends v {
  }
  w.kind = "for";
  class N extends w {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = j(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends w {
    constructor(i, f, b, I) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: I, to: T } = this;
      return `for(${f} ${b}=${I}; ${b}<${T}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = ae(super.names, this.from);
      return ae(i, this.to);
    }
  }
  class O extends w {
    constructor(i, f, b, I) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = j(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class G extends v {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class W extends _ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  W.kind = "return";
  class de extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, I;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class me extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  me.kind = "catch";
  class ye extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  ye.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new g()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const b = this._extScope.value(i, f);
      return (this._values[b.prefix] || (this._values[b.prefix] = /* @__PURE__ */ new Set())).add(b), b;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, b, I) {
      const T = this._scope.toName(f);
      return b !== void 0 && I && (this._constants[T.str] = b), this._leafNode(new o(i, T, b)), T;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, b) {
      return this._def(r.varKinds.const, i, f, b);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, b) {
      return this._def(r.varKinds.let, i, f, b);
    }
    // `var` declaration with optional assignment
    var(i, f, b) {
      return this._def(r.varKinds.var, i, f, b);
    }
    // assignment code
    assign(i, f, b) {
      return this._leafNode(new l(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new c(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, I] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, b) {
      if (this._blockNode(new m(i)), f && b)
        this.code(f).else().code(b).endIf();
      else if (f)
        this.code(f).endIf();
      else if (b)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new y());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, y);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, I, T = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(T, F, f, b), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, I = r.varKinds.const) {
      const T = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(T, (0, t._)`${F}[${V}]`), b(T);
        });
      }
      return this._for(new O("of", I, T, f), () => b(T));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const T = this._scope.toName(i);
      return this._for(new O("in", I, T, f), () => b(T));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new W();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(W);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new de();
      if (this._blockNode(I), this.code(i), f) {
        const T = this.name("e");
        this._currNode = I.catch = new me(T), f(T);
      }
      return b && (this._currNode = I.finally = new ye(), this.code(b)), this._endBlockNode(me, ye);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const b = this._nodes.length - f;
      if (b < 0 || i !== void 0 && b !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${b} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, b, I) {
      return this._blockNode(new G(i, f, b)), I && this.code(I).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(G);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const b = this._currNode;
      if (b instanceof i || f && b instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function ae($, i) {
    return i instanceof t._CodeOrName ? H($, i.names) : $;
  }
  function j($, i, f) {
    if ($ instanceof t.Name)
      return b($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((T, F) => (F instanceof t.Name && (F = b(F)), F instanceof t._Code ? T.push(...F._items) : T.push(F), T), []));
    function b(T) {
      const F = f[T.str];
      return F === void 0 || i[T.str] !== 1 ? T : (delete i[T.str], F);
    }
    function I(T) {
      return T instanceof t._Code && T._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function k($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) - (i[f] || 0);
  }
  function L($) {
    return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : (0, t._)`!${S($)}`;
  }
  e.not = L;
  const D = p(e.operators.AND);
  function K(...$) {
    return $.reduce(D);
  }
  e.and = K;
  const M = p(e.operators.OR);
  function P(...$) {
    return $.reduce(M);
  }
  e.or = P;
  function p($) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${$} ${S(f)}`;
  }
  function S($) {
    return $ instanceof t.Name ? $ : (0, t._)`(${$})`;
  }
})(X);
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
A.checkStrictMode = A.getErrorPath = A.Type = A.useFunc = A.setEvaluated = A.evaluatedPropsToName = A.mergeEvaluated = A.eachItem = A.unescapeJsonPointer = A.escapeJsonPointer = A.escapeFragment = A.unescapeFragment = A.schemaRefOrVal = A.schemaHasRulesButRef = A.schemaHasRules = A.checkUnknownRules = A.alwaysValidSchema = A.toHash = void 0;
const ie = X, bd = an;
function Sd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
A.toHash = Sd;
function Pd(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Yc(e, t), !Qc(t, e.self.RULES.all));
}
A.alwaysValidSchema = Pd;
function Yc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || el(e, `unknown keyword: "${a}"`);
}
A.checkUnknownRules = Yc;
function Qc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
A.schemaHasRules = Qc;
function Nd(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
A.schemaHasRulesButRef = Nd;
function Rd({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ie._)`${r}`;
  }
  return (0, ie._)`${e}${t}${(0, ie.getProperty)(n)}`;
}
A.schemaRefOrVal = Rd;
function Od(e) {
  return Zc(decodeURIComponent(e));
}
A.unescapeFragment = Od;
function Id(e) {
  return encodeURIComponent(pa(e));
}
A.escapeFragment = Id;
function pa(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
A.escapeJsonPointer = pa;
function Zc(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
A.unescapeJsonPointer = Zc;
function jd(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
A.eachItem = jd;
function _i({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const c = o === void 0 ? a : o instanceof ie.Name ? (a instanceof ie.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ie.Name ? (t(s, o, a), a) : r(a, o);
    return l === ie.Name && !(c instanceof ie.Name) ? n(s, c) : c;
  };
}
A.mergeEvaluated = {
  props: _i({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ie._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ie._)`${r} || {}`).code((0, ie._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ie._)`${r} || {}`), $a(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: xc
  }),
  items: _i({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ie._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ie._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function xc(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ie._)`{}`);
  return t !== void 0 && $a(e, r, t), r;
}
A.evaluatedPropsToName = xc;
function $a(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ie._)`${t}${(0, ie.getProperty)(n)}`, !0));
}
A.setEvaluated = $a;
const vi = {};
function Td(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: vi[t.code] || (vi[t.code] = new bd._Code(t.code))
  });
}
A.useFunc = Td;
var Bs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Bs || (A.Type = Bs = {}));
function kd(e, t, r) {
  if (e instanceof ie.Name) {
    const n = t === Bs.Num;
    return r ? n ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : n ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ie.getProperty)(e).toString() : "/" + pa(e);
}
A.getErrorPath = kd;
function el(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
A.checkStrictMode = el;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
const Ne = X, Ad = {
  // validation function arguments
  data: new Ne.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ne.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ne.Name("instancePath"),
  parentData: new Ne.Name("parentData"),
  parentDataProperty: new Ne.Name("parentDataProperty"),
  rootData: new Ne.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ne.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ne.Name("vErrors"),
  // null or array of validation errors
  errors: new Ne.Name("errors"),
  // counter of validation errors
  this: new Ne.Name("this"),
  // "globals"
  self: new Ne.Name("self"),
  scope: new Ne.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ne.Name("json"),
  jsonPos: new Ne.Name("jsonPos"),
  jsonLen: new Ne.Name("jsonLen"),
  jsonPart: new Ne.Name("jsonPart")
};
ze.default = Ad;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = X, r = A, n = ze;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, N) {
    const { it: R } = y, { gen: O, compositeRule: G, allErrors: W } = R, de = h(y, m, w);
    N ?? (G || W) ? c(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, w) {
    const { it: N } = y, { gen: R, compositeRule: O, allErrors: G } = N, W = h(y, m, w);
    c(R, W), O || G || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function l({ gen: y, keyword: m, schemaValue: w, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const G = y.name("err");
    y.forRange("i", R, n.default.errors, (W) => {
      y.const(G, (0, t._)`${n.default.vErrors}[${W}]`), y.if((0, t._)`${G}.instancePath === undefined`, () => y.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), y.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (y.assign((0, t._)`${G}.schema`, w), y.assign((0, t._)`${G}.data`, N));
    });
  }
  e.extendErrors = l;
  function c(y, m) {
    const w = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: w, validateName: N, schemaEnv: R } = y;
    R.$async ? w.throw((0, t._)`new ${y.ValidationError}(${m})`) : (w.assign((0, t._)`${N}.errors`, m), w.return(!1));
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
  function h(y, m, w) {
    const { createErrors: N } = y.it;
    return N === !1 ? (0, t._)`{}` : E(y, m, w);
  }
  function E(y, m, w = {}) {
    const { gen: N, it: R } = y, O = [
      _(R, w),
      v(y, w)
    ];
    return g(y, m, O), N.object(...O);
  }
  function _({ errorPath: y }, { instancePath: m }) {
    const w = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function v({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${y}`;
    return w && (R = (0, t.str)`${R}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, R];
  }
  function g(y, { params: m, message: w }, N) {
    const { keyword: R, data: O, schemaValue: G, it: W } = y, { opts: de, propertyName: me, topSchemaRef: ye, schemaPath: z } = W;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), de.messages && N.push([u.message, typeof w == "function" ? w(y) : w]), de.verbose && N.push([u.schema, G], [u.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), me && N.push([u.propertyName, me]);
  }
})(cn);
Object.defineProperty(wr, "__esModule", { value: !0 });
wr.boolOrEmptySchema = wr.topBoolOrEmptySchema = void 0;
const Cd = cn, Dd = X, Md = ze, Ld = {
  message: "boolean schema is false"
};
function Vd(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? tl(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Md.default.data) : (t.assign((0, Dd._)`${n}.errors`, null), t.return(!0));
}
wr.topBoolOrEmptySchema = Vd;
function Fd(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), tl(e)) : r.var(t, !0);
}
wr.boolOrEmptySchema = Fd;
function tl(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, Cd.reportError)(s, Ld, void 0, t);
}
var ge = {}, nr = {};
Object.defineProperty(nr, "__esModule", { value: !0 });
nr.getRules = nr.isJSONType = void 0;
const zd = ["string", "number", "integer", "boolean", "null", "object", "array"], Ud = new Set(zd);
function qd(e) {
  return typeof e == "string" && Ud.has(e);
}
nr.isJSONType = qd;
function Gd() {
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
nr.getRules = Gd;
var dt = {};
Object.defineProperty(dt, "__esModule", { value: !0 });
dt.shouldUseRule = dt.shouldUseGroup = dt.schemaHasRulesForType = void 0;
function Kd({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && rl(e, n);
}
dt.schemaHasRulesForType = Kd;
function rl(e, t) {
  return t.rules.some((r) => nl(e, r));
}
dt.shouldUseGroup = rl;
function nl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
dt.shouldUseRule = nl;
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
const Hd = nr, Jd = dt, Bd = cn, Y = X, sl = A;
var $r;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})($r || (ge.DataType = $r = {}));
function Wd(e) {
  const t = al(e.type);
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
ge.getSchemaTypes = Wd;
function al(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Hd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ge.getJSONTypes = al;
function Xd(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Yd(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Jd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = ya(t, n, s.strictNumbers, $r.Wrong);
    r.if(l, () => {
      a.length ? Qd(e, t, a) : ga(e);
    });
  }
  return o;
}
ge.coerceAndCheckDataType = Xd;
const ol = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Yd(e, t) {
  return t ? e.filter((r) => ol.has(r) || t === "array" && r === "array") : [];
}
function Qd(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Y._)`typeof ${s}`), l = n.let("coerced", (0, Y._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Y._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Y._)`${s}[0]`).assign(o, (0, Y._)`typeof ${s}`).if(ya(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Y._)`${l} !== undefined`);
  for (const d of r)
    (ol.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), ga(e), n.endIf(), n.if((0, Y._)`${l} !== undefined`, () => {
    n.assign(s, l), Zd(e, l);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, Y._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, Y._)`"" + ${s}`).elseIf((0, Y._)`${s} === null`).assign(l, (0, Y._)`""`);
        return;
      case "number":
        n.elseIf((0, Y._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(l, (0, Y._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, Y._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(l, (0, Y._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, Y._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(l, !1).elseIf((0, Y._)`${s} === "true" || ${s} === 1`).assign(l, !0);
        return;
      case "null":
        n.elseIf((0, Y._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(l, null);
        return;
      case "array":
        n.elseIf((0, Y._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, Y._)`[${s}]`);
    }
  }
}
function Zd({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Y._)`${t} !== undefined`, () => e.assign((0, Y._)`${t}[${r}]`, n));
}
function Ws(e, t, r, n = $r.Correct) {
  const s = n === $r.Correct ? Y.operators.EQ : Y.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, Y._)`${t} ${s} null`;
    case "array":
      a = (0, Y._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, Y._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, Y._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, Y._)`typeof ${t} ${s} ${e}`;
  }
  return n === $r.Correct ? a : (0, Y.not)(a);
  function o(l = Y.nil) {
    return (0, Y.and)((0, Y._)`typeof ${t} == "number"`, l, r ? (0, Y._)`isFinite(${t})` : Y.nil);
  }
}
ge.checkDataType = Ws;
function ya(e, t, r, n) {
  if (e.length === 1)
    return Ws(e[0], t, r, n);
  let s;
  const a = (0, sl.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Y._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Y._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Y.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Y.and)(s, Ws(o, t, r, n));
  return s;
}
ge.checkDataTypes = ya;
const xd = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Y._)`{type: ${e}}` : (0, Y._)`{type: ${t}}`
};
function ga(e) {
  const t = ef(e);
  (0, Bd.reportError)(t, xd);
}
ge.reportTypeError = ga;
function ef(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, sl.schemaRefOrVal)(e, n, "type");
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
var os = {};
Object.defineProperty(os, "__esModule", { value: !0 });
os.assignDefaults = void 0;
const or = X, tf = A;
function rf(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      wi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => wi(e, a, s.default));
}
os.assignDefaults = rf;
function wi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, or._)`${a}${(0, or.getProperty)(t)}`;
  if (s) {
    (0, tf.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, or._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, or._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, or._)`${l} = ${(0, or.stringify)(r)}`);
}
var nt = {}, ee = {};
Object.defineProperty(ee, "__esModule", { value: !0 });
ee.validateUnion = ee.validateArray = ee.usePattern = ee.callValidateCode = ee.schemaProperties = ee.allSchemaProperties = ee.noPropertyInData = ee.propertyInData = ee.isOwnProperty = ee.hasPropFunc = ee.reportMissingProp = ee.checkMissingProp = ee.checkReportMissingProp = void 0;
const le = X, _a = A, wt = ze, nf = A;
function sf(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(wa(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, le._)`${t}` }, !0), e.error();
  });
}
ee.checkReportMissingProp = sf;
function af({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, le.or)(...n.map((a) => (0, le.and)(wa(e, t, a, r.ownProperties), (0, le._)`${s} = ${a}`)));
}
ee.checkMissingProp = af;
function of(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ee.reportMissingProp = of;
function il(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, le._)`Object.prototype.hasOwnProperty`
  });
}
ee.hasPropFunc = il;
function va(e, t, r) {
  return (0, le._)`${il(e)}.call(${t}, ${r})`;
}
ee.isOwnProperty = va;
function cf(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} !== undefined`;
  return n ? (0, le._)`${s} && ${va(e, t, r)}` : s;
}
ee.propertyInData = cf;
function wa(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} === undefined`;
  return n ? (0, le.or)(s, (0, le.not)(va(e, t, r))) : s;
}
ee.noPropertyInData = wa;
function cl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ee.allSchemaProperties = cl;
function lf(e, t) {
  return cl(t).filter((r) => !(0, _a.alwaysValidSchema)(e, t[r]));
}
ee.schemaProperties = lf;
function uf({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
  const u = d ? (0, le._)`${e}, ${t}, ${n}${s}` : t, h = [
    [wt.default.instancePath, (0, le.strConcat)(wt.default.instancePath, a)],
    [wt.default.parentData, o.parentData],
    [wt.default.parentDataProperty, o.parentDataProperty],
    [wt.default.rootData, wt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([wt.default.dynamicAnchors, wt.default.dynamicAnchors]);
  const E = (0, le._)`${u}, ${r.object(...h)}`;
  return c !== le.nil ? (0, le._)`${l}.call(${c}, ${E})` : (0, le._)`${l}(${E})`;
}
ee.callValidateCode = uf;
const df = (0, le._)`new RegExp`;
function ff({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, le._)`${s.code === "new RegExp" ? df : (0, nf.useFunc)(e, s)}(${r}, ${n})`
  });
}
ee.usePattern = ff;
function hf(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const c = t.const("len", (0, le._)`${r}.length`);
    t.forRange("i", 0, c, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: _a.Type.Num
      }, a), t.if((0, le.not)(a), l);
    });
  }
}
ee.validateArray = hf;
function mf(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, _a.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((c, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, l);
    t.assign(o, (0, le._)`${o} || ${l}`), e.mergeValidEvaluated(u, l) || t.if((0, le.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
ee.validateUnion = mf;
Object.defineProperty(nt, "__esModule", { value: !0 });
nt.validateKeywordUsage = nt.validSchemaType = nt.funcKeywordCode = nt.macroKeywordCode = void 0;
const je = X, Xt = ze, pf = ee, $f = cn;
function yf(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = ll(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: je.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: c,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
nt.macroKeywordCode = yf;
function gf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  vf(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = ll(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      g(), t.modifying && Ei(e), y(() => e.error());
    else {
      const m = t.async ? _() : v();
      t.modifying && Ei(e), y(() => _f(e, m));
    }
  }
  function _() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, je._)`await `), (w) => n.assign(h, !1).if((0, je._)`${w} instanceof ${c.ValidationError}`, () => n.assign(m, (0, je._)`${w}.errors`), () => n.throw(w))), m;
  }
  function v() {
    const m = (0, je._)`${u}.errors`;
    return n.assign(m, null), g(je.nil), m;
  }
  function g(m = t.async ? (0, je._)`await ` : je.nil) {
    const w = c.opts.passContext ? Xt.default.this : Xt.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, je._)`${m}${(0, pf.callValidateCode)(e, u, w, N)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, je.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
nt.funcKeywordCode = gf;
function Ei(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, je._)`${n.parentData}[${n.parentDataProperty}]`));
}
function _f(e, t) {
  const { gen: r } = e;
  r.if((0, je._)`Array.isArray(${t})`, () => {
    r.assign(Xt.default.vErrors, (0, je._)`${Xt.default.vErrors} === null ? ${t} : ${Xt.default.vErrors}.concat(${t})`).assign(Xt.default.errors, (0, je._)`${Xt.default.vErrors}.length`), (0, $f.extendErrors)(e);
  }, () => e.error());
}
function vf({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function ll(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, je.stringify)(r) });
}
function wf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
nt.validSchemaType = wf;
function Ef({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
  }
}
nt.validateKeywordUsage = Ef;
var Tt = {};
Object.defineProperty(Tt, "__esModule", { value: !0 });
Tt.extendSubschemaMode = Tt.extendSubschemaData = Tt.getSubschema = void 0;
const tt = X, ul = A;
function bf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, tt._)`${e.schemaPath}${(0, tt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, tt._)`${e.schemaPath}${(0, tt.getProperty)(t)}${(0, tt.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, ul.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
Tt.getSubschema = bf;
function Sf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, tt._)`${t.data}${(0, tt.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, tt.str)`${d}${(0, ul.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, tt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof tt.Name ? s : l.let("data", s, !0);
    c(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function c(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Tt.extendSubschemaData = Sf;
function Pf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Tt.extendSubschemaMode = Pf;
var be = {}, is = function e(t, r) {
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
      var o = a[s];
      if (!e(t[o], r[o])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, dl = { exports: {} }, It = dl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  An(t, n, s, e, "", e);
};
It.keywords = {
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
It.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
It.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
It.skipKeywords = {
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
function An(e, t, r, n, s, a, o, l, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in It.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            An(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in It.propsKeywords) {
        if (h && typeof h == "object")
          for (var _ in h)
            An(e, t, r, h[_], s + "/" + u + "/" + Nf(_), a, s, u, n, _);
      } else (u in It.keywords || e.allKeys && !(u in It.skipKeywords)) && An(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function Nf(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Rf = dl.exports;
Object.defineProperty(be, "__esModule", { value: !0 });
be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
const Of = A, If = is, jf = Rf, Tf = /* @__PURE__ */ new Set([
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
function kf(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Xs(e) : t ? fl(e) <= t : !1;
}
be.inlineRef = kf;
const Af = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Xs(e) {
  for (const t in e) {
    if (Af.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Xs) || typeof r == "object" && Xs(r))
      return !0;
  }
  return !1;
}
function fl(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Tf.has(r) && (typeof e[r] == "object" && (0, Of.eachItem)(e[r], (n) => t += fl(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function hl(e, t = "", r) {
  r !== !1 && (t = yr(t));
  const n = e.parse(t);
  return ml(e, n);
}
be.getFullPath = hl;
function ml(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
be._getFullPath = ml;
const Cf = /#\/?$/;
function yr(e) {
  return e ? e.replace(Cf, "") : "";
}
be.normalizeId = yr;
function Df(e, t, r) {
  return r = yr(r), e.resolve(t, r);
}
be.resolveUrl = Df;
const Mf = /^[a-z_][-a-z0-9._]*$/i;
function Lf(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = yr(e[r] || t), a = { "": s }, o = hl(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return jf(e, { allKeys: !0 }, (h, E, _, v) => {
    if (v === void 0)
      return;
    const g = o + E;
    let y = a[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[E] = y;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = yr(y ? R(y, N) : N), c.has(N))
        throw u(N);
      c.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== yr(g) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = g), N;
    }
    function w(N) {
      if (typeof N == "string") {
        if (!Mf.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, E, _) {
    if (E !== void 0 && !If(h, E))
      throw u(_);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
be.getSchemaRefs = Lf;
Object.defineProperty(Ye, "__esModule", { value: !0 });
Ye.getData = Ye.KeywordCxt = Ye.validateFunctionCode = void 0;
const pl = wr, bi = ge, Ea = dt, Jn = ge, Vf = os, Wr = nt, Rs = Tt, U = X, J = ze, Ff = be, ft = A, zr = cn;
function zf(e) {
  if (gl(e) && (_l(e), yl(e))) {
    Gf(e);
    return;
  }
  $l(e, () => (0, pl.topBoolOrEmptySchema)(e));
}
Ye.validateFunctionCode = zf;
function $l({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, U._)`${J.default.data}, ${J.default.valCxt}`, n.$async, () => {
    e.code((0, U._)`"use strict"; ${Si(r, s)}`), qf(e, s), e.code(a);
  }) : e.func(t, (0, U._)`${J.default.data}, ${Uf(s)}`, n.$async, () => e.code(Si(r, s)).code(a));
}
function Uf(e) {
  return (0, U._)`{${J.default.instancePath}="", ${J.default.parentData}, ${J.default.parentDataProperty}, ${J.default.rootData}=${J.default.data}${e.dynamicRef ? (0, U._)`, ${J.default.dynamicAnchors}={}` : U.nil}}={}`;
}
function qf(e, t) {
  e.if(J.default.valCxt, () => {
    e.var(J.default.instancePath, (0, U._)`${J.default.valCxt}.${J.default.instancePath}`), e.var(J.default.parentData, (0, U._)`${J.default.valCxt}.${J.default.parentData}`), e.var(J.default.parentDataProperty, (0, U._)`${J.default.valCxt}.${J.default.parentDataProperty}`), e.var(J.default.rootData, (0, U._)`${J.default.valCxt}.${J.default.rootData}`), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, U._)`${J.default.valCxt}.${J.default.dynamicAnchors}`);
  }, () => {
    e.var(J.default.instancePath, (0, U._)`""`), e.var(J.default.parentData, (0, U._)`undefined`), e.var(J.default.parentDataProperty, (0, U._)`undefined`), e.var(J.default.rootData, J.default.data), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, U._)`{}`);
  });
}
function Gf(e) {
  const { schema: t, opts: r, gen: n } = e;
  $l(e, () => {
    r.$comment && t.$comment && wl(e), Wf(e), n.let(J.default.vErrors, null), n.let(J.default.errors, 0), r.unevaluated && Kf(e), vl(e), Qf(e);
  });
}
function Kf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, U._)`${r}.evaluated`), t.if((0, U._)`${e.evaluated}.dynamicProps`, () => t.assign((0, U._)`${e.evaluated}.props`, (0, U._)`undefined`)), t.if((0, U._)`${e.evaluated}.dynamicItems`, () => t.assign((0, U._)`${e.evaluated}.items`, (0, U._)`undefined`));
}
function Si(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, U._)`/*# sourceURL=${r} */` : U.nil;
}
function Hf(e, t) {
  if (gl(e) && (_l(e), yl(e))) {
    Jf(e, t);
    return;
  }
  (0, pl.boolOrEmptySchema)(e, t);
}
function yl({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function gl(e) {
  return typeof e.schema != "boolean";
}
function Jf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && wl(e), Xf(e), Yf(e);
  const a = n.const("_errs", J.default.errors);
  vl(e, a), n.var(t, (0, U._)`${a} === ${J.default.errors}`);
}
function _l(e) {
  (0, ft.checkUnknownRules)(e), Bf(e);
}
function vl(e, t) {
  if (e.opts.jtd)
    return Pi(e, [], !1, t);
  const r = (0, bi.getSchemaTypes)(e.schema), n = (0, bi.coerceAndCheckDataType)(e, r);
  Pi(e, r, !n, t);
}
function Bf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, ft.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Wf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, ft.checkStrictMode)(e, "default is ignored in the schema root");
}
function Xf(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Ff.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Yf(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function wl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, U._)`${J.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, U.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, U._)`${J.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function Qf(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, U._)`${J.default.errors} === 0`, () => t.return(J.default.data), () => t.throw((0, U._)`new ${s}(${J.default.vErrors})`)) : (t.assign((0, U._)`${n}.errors`, J.default.vErrors), a.unevaluated && Zf(e), t.return((0, U._)`${J.default.errors} === 0`));
}
function Zf({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof U.Name && e.assign((0, U._)`${t}.props`, r), n instanceof U.Name && e.assign((0, U._)`${t}.items`, n);
}
function Pi(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: c, self: d } = e, { RULES: u } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, ft.schemaHasRulesButRef)(a, u))) {
    s.block(() => Sl(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || xf(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, Ea.shouldUseGroup)(a, E) && (E.type ? (s.if((0, Jn.checkDataType)(E.type, o, c.strictNumbers)), Ni(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, Jn.reportTypeError)(e)), s.endIf()) : Ni(e, E), l || s.if((0, U._)`${J.default.errors} === ${n || 0}`));
  }
}
function Ni(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Vf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Ea.shouldUseRule)(n, a) && Sl(e, a.keyword, a.definition, t.type);
  });
}
function xf(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (eh(e, t), e.opts.allowUnionTypes || th(e, t), rh(e, e.dataTypes));
}
function eh(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      El(e.dataTypes, r) || ba(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), sh(e, t);
  }
}
function th(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && ba(e, "use allowUnionTypes to allow union type keyword");
}
function rh(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Ea.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => nh(t, o)) && ba(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function nh(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function El(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function sh(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    El(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function ba(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, ft.checkStrictMode)(e, t, e.opts.strictTypes);
}
let bl = class {
  constructor(t, r, n) {
    if ((0, Wr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, ft.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Pl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Wr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", J.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, U.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, U.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, U._)`${r} !== undefined && (${(0, U.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? zr.reportExtraError : zr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, zr.reportError)(this, this.def.$dataError || zr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, zr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = U.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = U.nil, r = U.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, U.or)((0, U._)`${s} === undefined`, r)), t !== U.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== U.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, U.or)(o(), l());
    function o() {
      if (n.length) {
        if (!(r instanceof U.Name))
          throw new Error("ajv implementation error");
        const c = Array.isArray(n) ? n : [n];
        return (0, U._)`${(0, Jn.checkDataTypes)(c, r, a.opts.strictNumbers, Jn.DataType.Wrong)}`;
      }
      return U.nil;
    }
    function l() {
      if (s.validateSchema) {
        const c = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, U._)`!${c}(${r})`;
      }
      return U.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Rs.getSubschema)(this.it, t);
    (0, Rs.extendSubschemaData)(n, this.it, t), (0, Rs.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return Hf(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = ft.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = ft.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, U.Name)), !0;
  }
};
Ye.KeywordCxt = bl;
function Sl(e, t, r, n) {
  const s = new bl(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Wr.funcKeywordCode)(s, r) : "macro" in r ? (0, Wr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Wr.funcKeywordCode)(s, r);
}
const ah = /^\/(?:[^~]|~0|~1)*$/, oh = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Pl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return J.default.rootData;
  if (e[0] === "/") {
    if (!ah.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = J.default.rootData;
  } else {
    const d = oh.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(c("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(c("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const l = s.split("/");
  for (const d of l)
    d && (a = (0, U._)`${a}${(0, U.getProperty)((0, ft.unescapeJsonPointer)(d))}`, o = (0, U._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
Ye.getData = Pl;
var ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
let ih = class extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
};
ln.default = ih;
var Pr = {};
Object.defineProperty(Pr, "__esModule", { value: !0 });
const Os = be;
let ch = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Os.resolveUrl)(t, r, n), this.missingSchema = (0, Os.normalizeId)((0, Os.getFullPath)(t, this.missingRef));
  }
};
Pr.default = ch;
var ke = {};
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.resolveSchema = ke.getCompilingSchema = ke.resolveRef = ke.compileSchema = ke.SchemaEnv = void 0;
const Ke = X, lh = ln, Bt = ze, We = be, Ri = A, uh = Ye;
let cs = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, We.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
ke.SchemaEnv = cs;
function Sa(e) {
  const t = Nl.call(this, e);
  if (t)
    return t;
  const r = (0, We.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Ke.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: lh.default,
    code: (0, Ke._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Bt.default.data,
    parentData: Bt.default.parentData,
    parentDataProperty: Bt.default.parentDataProperty,
    dataNames: [Bt.default.data],
    dataPathArr: [Ke.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ke.stringify)(e.schema) } : { ref: e.schema }),
    validateName: c,
    ValidationError: l,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Ke.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Ke._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, uh.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Bt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const _ = new Function(`${Bt.default.self}`, `${Bt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(c, { ref: _ }), _.errors = null, _.schema = e.schema, _.schemaEnv = e, e.$async && (_.$async = !0), this.opts.code.source === !0 && (_.source = { validateName: c, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: v, items: g } = d;
      _.evaluated = {
        props: v instanceof Ke.Name ? void 0 : v,
        items: g instanceof Ke.Name ? void 0 : g,
        dynamicProps: v instanceof Ke.Name,
        dynamicItems: g instanceof Ke.Name
      }, _.source && (_.source.evaluated = (0, Ke.stringify)(_.evaluated));
    }
    return e.validate = _, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
ke.compileSchema = Sa;
function dh(e, t, r) {
  var n;
  r = (0, We.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = mh.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new cs({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = fh.call(this, a);
}
ke.resolveRef = dh;
function fh(e) {
  return (0, We.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Sa.call(this, e);
}
function Nl(e) {
  for (const t of this._compilations)
    if (hh(t, e))
      return t;
}
ke.getCompilingSchema = Nl;
function hh(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function mh(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || ls.call(this, e, t);
}
function ls(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, We._getFullPath)(this.opts.uriResolver, r);
  let s = (0, We.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Is.call(this, r, e);
  const a = (0, We.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = ls.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : Is.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Sa.call(this, o), a === (0, We.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, We.resolveUrl)(this.opts.uriResolver, s, d)), new cs({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Is.call(this, r, o);
  }
}
ke.resolveSchema = ls;
const ph = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Is(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, Ri.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !ph.has(l) && d && (t = (0, We.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ri.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, We.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ls.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new cs({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const $h = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", yh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", gh = "object", _h = [
  "$data"
], vh = {
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
}, wh = !1, Eh = {
  $id: $h,
  description: yh,
  type: gh,
  required: _h,
  properties: vh,
  additionalProperties: wh
};
var Pa = {}, us = { exports: {} };
const bh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Rl = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Ol(e) {
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
const Sh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function Oi(e) {
  return e.length = 0, !0;
}
function Ph(e, t, r) {
  if (e.length) {
    const n = Ol(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function Nh(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, l = Ph;
  for (let c = 0; c < e.length; c++) {
    const d = e[c];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (o = !0), !l(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        c > 0 && e[c - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!l(s, n, r))
          break;
        l = Oi;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (l === Oi ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(Ol(s))), r.address = n.join(""), r;
}
function Il(e) {
  if (Rh(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = Nh(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function Rh(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function Oh(e) {
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
function Ih(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function jh(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!Rl(r)) {
      const n = Il(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var jl = {
  nonSimpleDomain: Sh,
  recomposeAuthority: jh,
  normalizeComponentEncoding: Ih,
  removeDotSegments: Oh,
  isIPv4: Rl,
  isUUID: bh,
  normalizeIPv6: Il
};
const { isUUID: Th } = jl, kh = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Tl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function kl(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Al(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Ah(e) {
  return e.secure = Tl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Ch(e) {
  if ((e.port === (Tl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Dh(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(kh);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = Na(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function Mh(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = Na(s);
  a && (e = a.serialize(e, t));
  const o = e, l = e.nss;
  return o.path = `${n || t.nid}:${l}`, t.skipEscape = !0, o;
}
function Lh(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Th(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function Vh(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Cl = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: kl,
    serialize: Al
  }
), Fh = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Cl.domainHost,
    parse: kl,
    serialize: Al
  }
), Cn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: Ah,
    serialize: Ch
  }
), zh = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Cn.domainHost,
    parse: Cn.parse,
    serialize: Cn.serialize
  }
), Uh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: Dh,
    serialize: Mh,
    skipNormalize: !0
  }
), qh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: Lh,
    serialize: Vh,
    skipNormalize: !0
  }
), Bn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Cl,
    https: Fh,
    ws: Cn,
    wss: zh,
    urn: Uh,
    "urn:uuid": qh
  }
);
Object.setPrototypeOf(Bn, null);
function Na(e) {
  return e && (Bn[
    /** @type {SchemeName} */
    e
  ] || Bn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var Gh = {
  SCHEMES: Bn,
  getSchemeHandler: Na
};
const { normalizeIPv6: Kh, removeDotSegments: Hr, recomposeAuthority: Hh, normalizeComponentEncoding: pn, isIPv4: Jh, nonSimpleDomain: Bh } = jl, { SCHEMES: Wh, getSchemeHandler: Dl } = Gh;
function Xh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  st(pt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  pt(st(e, t), t)), e;
}
function Yh(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Ml(pt(e, n), pt(t, n), n, !0);
  return n.skipEscape = !0, st(s, n);
}
function Ml(e, t, r, n) {
  const s = {};
  return n || (e = pt(st(e, r), r), t = pt(st(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Hr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Hr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Hr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Hr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function Qh(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = st(pn(pt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = st(pn(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = st(pn(pt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = st(pn(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function st(e, t) {
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
  }, n = Object.assign({}, t), s = [], a = Dl(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Hh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let l = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (l = Hr(l)), o === void 0 && l[0] === "/" && l[1] === "/" && (l = "/%2F" + l.slice(2)), s.push(l);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const Zh = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function pt(e, t) {
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
  const a = e.match(Zh);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (Jh(n.host) === !1) {
        const c = Kh(n.host);
        n.host = c.host.toLowerCase(), s = c.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Dl(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && Bh(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (l) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + l;
      }
    (!o || o && !o.skipNormalize) && (e.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), o && o.parse && o.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const Ra = {
  SCHEMES: Wh,
  normalize: Xh,
  resolve: Yh,
  resolveComponent: Ml,
  equal: Qh,
  serialize: st,
  parse: pt
};
us.exports = Ra;
us.exports.default = Ra;
us.exports.fastUri = Ra;
var Ll = us.exports;
Object.defineProperty(Pa, "__esModule", { value: !0 });
const Vl = Ll;
Vl.code = 'require("ajv/dist/runtime/uri").default';
Pa.default = Vl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Ye;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = X;
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
  const n = ln, s = Pr, a = nr, o = ke, l = X, c = be, d = ge, u = A, h = Eh, E = Pa, _ = (P, p) => new RegExp(P, p);
  _.code = "new RegExp";
  const v = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  ]), y = {
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
  }, w = 200;
  function N(P) {
    var p, S, $, i, f, b, I, T, F, V, re, Le, At, Ct, Dt, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht;
    const Ge = P.strict, Jt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Cr = Jt === !0 || Jt === void 0 ? 1 : Jt || 0, Dr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ss = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : Ge) !== null && b !== void 0 ? b : !0,
      strictNumbers: (T = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ge) !== null && T !== void 0 ? T : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ge) !== null && V !== void 0 ? V : "log",
      strictTuples: (Le = (re = P.strictTuples) !== null && re !== void 0 ? re : Ge) !== null && Le !== void 0 ? Le : "log",
      strictRequired: (Ct = (At = P.strictRequired) !== null && At !== void 0 ? At : Ge) !== null && Ct !== void 0 ? Ct : !1,
      code: P.code ? { ...P.code, optimize: Cr, regExp: Dr } : { optimize: Cr, regExp: Dr },
      loopRequired: (Dt = P.loopRequired) !== null && Dt !== void 0 ? Dt : w,
      loopEnum: (Mt = P.loopEnum) !== null && Mt !== void 0 ? Mt : w,
      meta: (Lt = P.meta) !== null && Lt !== void 0 ? Lt : !0,
      messages: (Vt = P.messages) !== null && Vt !== void 0 ? Vt : !0,
      inlineRefs: (Ft = P.inlineRefs) !== null && Ft !== void 0 ? Ft : !0,
      schemaId: (zt = P.schemaId) !== null && zt !== void 0 ? zt : "$id",
      addUsedSchema: (Ut = P.addUsedSchema) !== null && Ut !== void 0 ? Ut : !0,
      validateSchema: (qt = P.validateSchema) !== null && qt !== void 0 ? qt : !0,
      validateFormats: (Gt = P.validateFormats) !== null && Gt !== void 0 ? Gt : !0,
      unicodeRegExp: (Kt = P.unicodeRegExp) !== null && Kt !== void 0 ? Kt : !0,
      int32range: (Ht = P.int32range) !== null && Ht !== void 0 ? Ht : !0,
      uriResolver: Ss
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, y, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && me.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), W.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: $ } = this.opts;
      let i = h;
      $ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[$], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let $;
      if (typeof p == "string") {
        if ($ = this.getSchema(p), !$)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        $ = this.compile(p);
      const i = $(S);
      return "$async" in $ || (this.errors = $.errors), i;
    }
    compile(p, S) {
      const $ = this._addSchema(p, S);
      return $.validate || this._compileSchemaEnv($);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: $ } = this.opts;
      return i.call(this, p, S);
      async function i(V, re) {
        await f.call(this, V.$schema);
        const Le = this._addSchema(V, re);
        return Le.validate || b.call(this, Le);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function b(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (re) {
          if (!(re instanceof s.default))
            throw re;
          return I.call(this, re), await T.call(this, re.missingSchema), b.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: re }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${re} cannot be resolved`);
      }
      async function T(V) {
        const re = await F.call(this, V);
        this.refs[V] || await f.call(this, re.$schema), this.refs[V] || this.addSchema(re, V, S);
      }
      async function F(V) {
        const re = this._loading[V];
        if (re)
          return re;
        try {
          return await (this._loading[V] = $(V));
        } finally {
          delete this._loading[V];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, $, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, c.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, $ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, $), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let $;
      if ($ = p.$schema, $ !== void 0 && typeof $ != "string")
        throw new Error("$schema must be a string");
      if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate($, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = G.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: $ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: $ });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = G.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let $ = p[this.opts.schemaId];
          return $ && ($ = (0, c.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let $;
      if (typeof p == "string")
        $ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = $);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, $ = S.keyword, Array.isArray($) && !$.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, $, S), !S)
        return (0, u.eachItem)($, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)($, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((b) => k.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const $ of S.rules) {
        const i = $.rules.findIndex((f) => f.keyword === p);
        i >= 0 && $.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: $ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${$}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const $ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const I of f)
          b = b[I];
        for (const I in $) {
          const T = $[I];
          if (typeof T != "object")
            continue;
          const { $data: F } = T.definition, V = b[I];
          F && V && (b[I] = M(V));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const $ in p) {
        const i = p[$];
        (!S || S.test($)) && (typeof i == "string" ? delete p[$] : i && !i.meta && (this._cache.delete(i.schema), delete p[$]));
      }
    }
    _addSchema(p, S, $, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        b = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let T = this._cache.get(p);
      if (T !== void 0)
        return T;
      $ = (0, c.normalizeId)(b || $);
      const F = c.getSchemaRefs.call(this, p, $);
      return T = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(T.schema, T), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = T), i && this.validateSchema(p, !0), T;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, $ = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[$](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function G(P) {
    return P = (0, c.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function W() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function de() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function me(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function ye() {
    const P = { ...this.opts };
    for (const p of v)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const ae = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!ae.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function k(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: T }) => T === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? L.call(this, b, I, p.before) : b.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((T) => this.addKeyword(T));
  }
  function L(P, p, S) {
    const $ = P.rules.findIndex((i) => i.keyword === S);
    $ >= 0 ? P.rules.splice($, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const K = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, K] };
  }
})(Xc);
var Oa = {}, Ia = {}, ja = {};
Object.defineProperty(ja, "__esModule", { value: !0 });
const xh = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ja.default = xh;
var $t = {};
Object.defineProperty($t, "__esModule", { value: !0 });
$t.callRef = $t.getValidate = void 0;
const em = Pr, Ii = ee, Ce = X, ir = ze, ji = ke, $n = A, tm = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = ji.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new em.default(n.opts.uriResolver, s, r);
    if (u instanceof ji.SchemaEnv)
      return E(u);
    return _(u);
    function h() {
      if (a === d)
        return Dn(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return Dn(e, (0, Ce._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = Fl(e, v);
      Dn(e, g, v, v.$async);
    }
    function _(v) {
      const g = t.scopeValue("schema", l.code.source === !0 ? { ref: v, code: (0, Ce.stringify)(v) } : { ref: v }), y = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: Ce.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function Fl(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ce._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
$t.getValidate = Fl;
function Dn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? ir.default.this : Ce.nil;
  n ? u() : h();
  function u() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, Ce._)`await ${(0, Ii.callValidateCode)(e, t, d)}`), _(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, Ce._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), E(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, Ii.callValidateCode)(e, t, d), () => _(t), () => E(t));
  }
  function E(v) {
    const g = (0, Ce._)`${v}.errors`;
    s.assign(ir.default.vErrors, (0, Ce._)`${ir.default.vErrors} === null ? ${g} : ${ir.default.vErrors}.concat(${g})`), s.assign(ir.default.errors, (0, Ce._)`${ir.default.vErrors}.length`);
  }
  function _(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = $n.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, Ce._)`${v}.evaluated.props`);
        a.props = $n.mergeEvaluated.props(s, m, a.props, Ce.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = $n.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Ce._)`${v}.evaluated.items`);
        a.items = $n.mergeEvaluated.items(s, m, a.items, Ce.Name);
      }
  }
}
$t.callRef = Dn;
$t.default = tm;
Object.defineProperty(Ia, "__esModule", { value: !0 });
const rm = ja, nm = $t, sm = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  rm.default,
  nm.default
];
Ia.default = sm;
var Ta = {}, ka = {};
Object.defineProperty(ka, "__esModule", { value: !0 });
const Wn = X, Et = Wn.operators, Xn = {
  maximum: { okStr: "<=", ok: Et.LTE, fail: Et.GT },
  minimum: { okStr: ">=", ok: Et.GTE, fail: Et.LT },
  exclusiveMaximum: { okStr: "<", ok: Et.LT, fail: Et.GTE },
  exclusiveMinimum: { okStr: ">", ok: Et.GT, fail: Et.LTE }
}, am = {
  message: ({ keyword: e, schemaCode: t }) => (0, Wn.str)`must be ${Xn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Wn._)`{comparison: ${Xn[e].okStr}, limit: ${t}}`
}, om = {
  keyword: Object.keys(Xn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: am,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Wn._)`${r} ${Xn[t].fail} ${n} || isNaN(${r})`);
  }
};
ka.default = om;
var Aa = {};
Object.defineProperty(Aa, "__esModule", { value: !0 });
const Xr = X, im = {
  message: ({ schemaCode: e }) => (0, Xr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Xr._)`{multipleOf: ${e}}`
}, cm = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: im,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, Xr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Xr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Xr._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Aa.default = cm;
var Ca = {}, Da = {};
Object.defineProperty(Da, "__esModule", { value: !0 });
function zl(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Da.default = zl;
zl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Yt = X, lm = A, um = Da, dm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Yt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Yt._)`{limit: ${e}}`
}, fm = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: dm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Yt.operators.GT : Yt.operators.LT, o = s.opts.unicode === !1 ? (0, Yt._)`${r}.length` : (0, Yt._)`${(0, lm.useFunc)(e.gen, um.default)}(${r})`;
    e.fail$data((0, Yt._)`${o} ${a} ${n}`);
  }
};
Ca.default = fm;
var Ma = {};
Object.defineProperty(Ma, "__esModule", { value: !0 });
const hm = ee, Yn = X, mm = {
  message: ({ schemaCode: e }) => (0, Yn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Yn._)`{pattern: ${e}}`
}, pm = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: mm,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, Yn._)`(new RegExp(${s}, ${o}))` : (0, hm.usePattern)(e, n);
    e.fail$data((0, Yn._)`!${l}.test(${t})`);
  }
};
Ma.default = pm;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const Yr = X, $m = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Yr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Yr._)`{limit: ${e}}`
}, ym = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: $m,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Yr.operators.GT : Yr.operators.LT;
    e.fail$data((0, Yr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
La.default = ym;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const Ur = ee, Qr = X, gm = A, _m = {
  message: ({ params: { missingProperty: e } }) => (0, Qr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Qr._)`{missingProperty: ${e}}`
}, vm = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: _m,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: l } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= l.loopRequired;
    if (o.allErrors ? d() : u(), l.strictRequired) {
      const _ = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const g of r)
        if ((_ == null ? void 0 : _[g]) === void 0 && !v.has(g)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${y}" (strictRequired)`;
          (0, gm.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(Qr.nil, h);
      else
        for (const _ of r)
          (0, Ur.checkReportMissingProp)(e, _);
    }
    function u() {
      const _ = t.let("missing");
      if (c || a) {
        const v = t.let("valid", !0);
        e.block$data(v, () => E(_, v)), e.ok(v);
      } else
        t.if((0, Ur.checkMissingProp)(e, r, _)), (0, Ur.reportMissingProp)(e, _), t.else();
    }
    function h() {
      t.forOf("prop", n, (_) => {
        e.setParams({ missingProperty: _ }), t.if((0, Ur.noPropertyInData)(t, s, _, l.ownProperties), () => e.error());
      });
    }
    function E(_, v) {
      e.setParams({ missingProperty: _ }), t.forOf(_, n, () => {
        t.assign(v, (0, Ur.propertyInData)(t, s, _, l.ownProperties)), t.if((0, Qr.not)(v), () => {
          e.error(), t.break();
        });
      }, Qr.nil);
    }
  }
};
Va.default = vm;
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Zr = X, wm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Zr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Zr._)`{limit: ${e}}`
}, Em = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: wm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Zr.operators.GT : Zr.operators.LT;
    e.fail$data((0, Zr._)`${r}.length ${s} ${n}`);
  }
};
Fa.default = Em;
var za = {}, un = {};
Object.defineProperty(un, "__esModule", { value: !0 });
const Ul = is;
Ul.code = 'require("ajv/dist/runtime/equal").default';
un.default = Ul;
Object.defineProperty(za, "__esModule", { value: !0 });
const js = ge, we = X, bm = A, Sm = un, Pm = {
  message: ({ params: { i: e, j: t } }) => (0, we.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, we._)`{i: ${e}, j: ${t}}`
}, Nm = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Pm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, js.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, we._)`${o} === false`), e.ok(c);
    function u() {
      const v = t.let("i", (0, we._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(c, !0), t.if((0, we._)`${v} > 1`, () => (h() ? E : _)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function E(v, g) {
      const y = t.name("item"), m = (0, js.checkDataTypes)(d, y, l.opts.strictNumbers, js.DataType.Wrong), w = t.const("indices", (0, we._)`{}`);
      t.for((0, we._)`;${v}--;`, () => {
        t.let(y, (0, we._)`${r}[${v}]`), t.if(m, (0, we._)`continue`), d.length > 1 && t.if((0, we._)`typeof ${y} == "string"`, (0, we._)`${y} += "_"`), t.if((0, we._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(g, (0, we._)`${w}[${y}]`), e.error(), t.assign(c, !1).break();
        }).code((0, we._)`${w}[${y}] = ${v}`);
      });
    }
    function _(v, g) {
      const y = (0, bm.useFunc)(t, Sm.default), m = t.name("outer");
      t.label(m).for((0, we._)`;${v}--;`, () => t.for((0, we._)`${g} = ${v}; ${g}--;`, () => t.if((0, we._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
za.default = Nm;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const Ys = X, Rm = A, Om = un, Im = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Ys._)`{allowedValue: ${e}}`
}, jm = {
  keyword: "const",
  $data: !0,
  error: Im,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Ys._)`!${(0, Rm.useFunc)(t, Om.default)}(${r}, ${s})`) : e.fail((0, Ys._)`${a} !== ${r}`);
  }
};
Ua.default = jm;
var qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const Jr = X, Tm = A, km = un, Am = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Jr._)`{allowedValues: ${e}}`
}, Cm = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Am,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, Tm.useFunc)(t, km.default));
    let u;
    if (l || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const _ = t.const("vSchema", a);
      u = (0, Jr.or)(...s.map((v, g) => E(_, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (_) => t.if((0, Jr._)`${d()}(${r}, ${_})`, () => t.assign(u, !0).break()));
    }
    function E(_, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, Jr._)`${d()}(${r}, ${_}[${v}])` : (0, Jr._)`${r} === ${g}`;
    }
  }
};
qa.default = Cm;
Object.defineProperty(Ta, "__esModule", { value: !0 });
const Dm = ka, Mm = Aa, Lm = Ca, Vm = Ma, Fm = La, zm = Va, Um = Fa, qm = za, Gm = Ua, Km = qa, Hm = [
  // number
  Dm.default,
  Mm.default,
  // string
  Lm.default,
  Vm.default,
  // object
  Fm.default,
  zm.default,
  // array
  Um.default,
  qm.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Gm.default,
  Km.default
];
Ta.default = Hm;
var Ga = {}, Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
Nr.validateAdditionalItems = void 0;
const Qt = X, Qs = A, Jm = {
  message: ({ params: { len: e } }) => (0, Qt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Qt._)`{limit: ${e}}`
}, Bm = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Jm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Qs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    ql(e, n);
  }
};
function ql(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, Qt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Qt._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Qs.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Qt._)`${l} <= ${t.length}`);
    r.if((0, Qt.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, l, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: Qs.Type.Num }, d), o.allErrors || r.if((0, Qt.not)(d), () => r.break());
    });
  }
}
Nr.validateAdditionalItems = ql;
Nr.default = Bm;
var Ka = {}, Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
Rr.validateTuple = void 0;
const Ti = X, Mn = A, Wm = ee, Xm = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Gl(e, "additionalItems", t);
    r.items = !0, !(0, Mn.alwaysValidSchema)(r, t) && e.ok((0, Wm.validateArray)(e));
  }
};
function Gl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = Mn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, Ti._)`${a}.length`);
  r.forEach((h, E) => {
    (0, Mn.alwaysValidSchema)(l, h) || (n.if((0, Ti._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: _ } = l, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (E.strictTuples && !g) {
      const y = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${_}"`;
      (0, Mn.checkStrictMode)(l, y, E.strictTuples);
    }
  }
}
Rr.validateTuple = Gl;
Rr.default = Xm;
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Ym = Rr, Qm = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Ym.validateTuple)(e, "items")
};
Ka.default = Qm;
var Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const ki = X, Zm = A, xm = ee, ep = Nr, tp = {
  message: ({ params: { len: e } }) => (0, ki.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, ki._)`{limit: ${e}}`
}, rp = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: tp,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Zm.alwaysValidSchema)(n, t) && (s ? (0, ep.validateAdditionalItems)(e, s) : e.ok((0, xm.validateArray)(e)));
  }
};
Ha.default = rp;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const Ue = X, yn = A, np = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ue.str)`must contain at least ${e} valid item(s)` : (0, Ue.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ue._)`{minContains: ${e}}` : (0, Ue._)`{minContains: ${e}, maxContains: ${t}}`
}, sp = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: np,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, l = d) : o = 1;
    const u = t.const("len", (0, Ue._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, yn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, yn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, yn.alwaysValidSchema)(a, r)) {
      let g = (0, Ue._)`${u} >= ${o}`;
      l !== void 0 && (g = (0, Ue._)`${g} && ${u} <= ${l}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    l === void 0 && o === 1 ? _(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), l !== void 0 && t.if((0, Ue._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const g = t.name("_valid"), y = t.let("count", 0);
      _(g, () => t.if(g, () => v(y)));
    }
    function _(g, y) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: yn.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function v(g) {
      t.code((0, Ue._)`${g}++`), l === void 0 ? t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ue._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Ja.default = sp;
var ds = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = X, r = A, n = ee;
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
      o(c, d), l(c, u);
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
  function o(c, d = c.schema) {
    const { gen: u, data: h, it: E } = c;
    if (Object.keys(d).length === 0)
      return;
    const _ = u.let("missing");
    for (const v in d) {
      const g = d[v];
      if (g.length === 0)
        continue;
      const y = (0, n.propertyInData)(u, h, v, E.opts.ownProperties);
      c.setParams({
        property: v,
        depsCount: g.length,
        deps: g.join(", ")
      }), E.allErrors ? u.if(y, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(c, m);
      }) : (u.if((0, t._)`${y} && (${(0, n.checkMissingProp)(c, g, _)})`), (0, n.reportMissingProp)(c, _), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function l(c, d = c.schema) {
    const { gen: u, data: h, keyword: E, it: _ } = c, v = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(_, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, _.opts.ownProperties),
        () => {
          const y = c.subschema({ keyword: E, schemaProp: g }, v);
          c.mergeValidEvaluated(y, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), c.ok(v));
  }
  e.validateSchemaDeps = l, e.default = s;
})(ds);
var Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Kl = X, ap = A, op = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Kl._)`{propertyName: ${e.propertyName}}`
}, ip = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: op,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, ap.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Kl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Ba.default = ip;
var fs = {};
Object.defineProperty(fs, "__esModule", { value: !0 });
const gn = ee, Je = X, cp = ze, _n = A, lp = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Je._)`{additionalProperty: ${e.additionalProperty}}`
}, up = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: lp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, _n.alwaysValidSchema)(o, r))
      return;
    const d = (0, gn.allSchemaProperties)(n.properties), u = (0, gn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Je._)`${a} === ${cp.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(E(y), () => v(y));
      });
    }
    function E(y) {
      let m;
      if (d.length > 8) {
        const w = (0, _n.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, gn.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, Je.or)(...d.map((w) => (0, Je._)`${y} === ${w}`)) : m = Je.nil;
      return u.length && (m = (0, Je.or)(m, ...u.map((w) => (0, Je._)`${(0, gn.usePattern)(e, w)}.test(${y})`))), (0, Je.not)(m);
    }
    function _(y) {
      t.code((0, Je._)`delete ${s}[${y}]`);
    }
    function v(y) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        _(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, _n.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        c.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, Je.not)(m), () => {
          e.reset(), _(y);
        })) : (g(y, m), l || t.if((0, Je.not)(m), () => t.break()));
      }
    }
    function g(y, m, w) {
      const N = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: _n.Type.Str
      };
      w === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
fs.default = up;
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const dp = Ye, Ai = ee, Ts = A, Ci = fs, fp = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Ci.default.code(new dp.KeywordCxt(a, Ci.default, "additionalProperties"));
    const o = (0, Ai.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ts.mergeEvaluated.props(t, (0, Ts.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Ts.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const c = t.name("valid");
    for (const h of l)
      d(h) ? u(h) : (t.if((0, Ai.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
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
Wa.default = fp;
var Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const Di = ee, vn = X, Mi = A, Li = A, hp = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, Di.allSchemaProperties)(r), c = l.filter((g) => (0, Mi.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof vn.Name) && (a.props = (0, Li.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const g of l)
        d && _(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, Mi.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, (y) => {
        t.if((0, vn._)`${(0, Di.usePattern)(e, g)}.test(${y})`, () => {
          const m = c.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: Li.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, vn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, vn.not)(u), () => t.break());
        });
      });
    }
  }
};
Xa.default = hp;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const mp = A, pp = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, mp.alwaysValidSchema)(n, r)) {
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
Ya.default = pp;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const $p = ee, yp = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: $p.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Qa.default = yp;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const Ln = X, gp = A, _p = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Ln._)`{passingSchemas: ${e.passing}}`
}, vp = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: _p,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), c = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, gp.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, Ln._)`${c} && ${o}`).assign(o, !1).assign(l, (0, Ln._)`[${l}, ${h}]`).else(), t.if(c, () => {
          t.assign(o, !0), t.assign(l, h), E && e.mergeEvaluated(E, Ln.Name);
        });
      });
    }
  }
};
Za.default = vp;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const wp = A, Ep = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, wp.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
xa.default = Ep;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const Qn = X, Hl = A, bp = {
  message: ({ params: e }) => (0, Qn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Qn._)`{failingKeyword: ${e.ifClause}}`
}, Sp = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: bp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Hl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Vi(n, "then"), a = Vi(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(l, d("then", u), d("else", u));
    } else s ? t.if(l, d("then")) : t.if((0, Qn.not)(l), d("else"));
    e.pass(o, () => e.error(!0));
    function c() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, l);
        t.assign(o, l), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, Qn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Vi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Hl.alwaysValidSchema)(e, r);
}
eo.default = Sp;
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const Pp = A, Np = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Pp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
to.default = Np;
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Rp = Nr, Op = Ka, Ip = Rr, jp = Ha, Tp = Ja, kp = ds, Ap = Ba, Cp = fs, Dp = Wa, Mp = Xa, Lp = Ya, Vp = Qa, Fp = Za, zp = xa, Up = eo, qp = to;
function Gp(e = !1) {
  const t = [
    // any
    Lp.default,
    Vp.default,
    Fp.default,
    zp.default,
    Up.default,
    qp.default,
    // object
    Ap.default,
    Cp.default,
    kp.default,
    Dp.default,
    Mp.default
  ];
  return e ? t.push(Op.default, jp.default) : t.push(Rp.default, Ip.default), t.push(Tp.default), t;
}
Ga.default = Gp;
var ro = {}, Or = {};
Object.defineProperty(Or, "__esModule", { value: !0 });
Or.dynamicAnchor = void 0;
const ks = X, Kp = ze, Fi = ke, Hp = $t, Jp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Jl(e, e.schema)
};
function Jl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, ks._)`${Kp.default.dynamicAnchors}${(0, ks.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Bp(e);
  r.if((0, ks._)`!${s}`, () => r.assign(s, a));
}
Or.dynamicAnchor = Jl;
function Bp(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: l } = t.root, { schemaId: c } = n.opts, d = new Fi.SchemaEnv({ schema: r, schemaId: c, root: s, baseId: a, localRefs: o, meta: l });
  return Fi.compileSchema.call(n, d), (0, Hp.getValidate)(e, d);
}
Or.default = Jp;
var Ir = {};
Object.defineProperty(Ir, "__esModule", { value: !0 });
Ir.dynamicRef = void 0;
const zi = X, Wp = ze, Ui = $t, Xp = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Bl(e, e.schema)
};
function Bl(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const c = r.let("valid", !1);
    o(c), e.ok(c);
  }
  function o(c) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, zi._)`${Wp.default.dynamicAnchors}${(0, zi.getProperty)(a)}`);
      r.if(d, l(d, c), l(s.validateName, c));
    } else
      l(s.validateName, c)();
  }
  function l(c, d) {
    return d ? () => r.block(() => {
      (0, Ui.callRef)(e, c), r.let(d, !0);
    }) : () => (0, Ui.callRef)(e, c);
  }
}
Ir.dynamicRef = Bl;
Ir.default = Xp;
var no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const Yp = Or, Qp = A, Zp = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Yp.dynamicAnchor)(e, "") : (0, Qp.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
no.default = Zp;
var so = {};
Object.defineProperty(so, "__esModule", { value: !0 });
const xp = Ir, e$ = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, xp.dynamicRef)(e, e.schema)
};
so.default = e$;
Object.defineProperty(ro, "__esModule", { value: !0 });
const t$ = Or, r$ = Ir, n$ = no, s$ = so, a$ = [t$.default, r$.default, n$.default, s$.default];
ro.default = a$;
var ao = {}, oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const qi = ds, o$ = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: qi.error,
  code: (e) => (0, qi.validatePropertyDeps)(e)
};
oo.default = o$;
var io = {};
Object.defineProperty(io, "__esModule", { value: !0 });
const i$ = ds, c$ = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, i$.validateSchemaDeps)(e)
};
io.default = c$;
var co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const l$ = A, u$ = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, l$.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
co.default = u$;
Object.defineProperty(ao, "__esModule", { value: !0 });
const d$ = oo, f$ = io, h$ = co, m$ = [d$.default, f$.default, h$.default];
ao.default = m$;
var lo = {}, uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const Pt = X, Gi = A, p$ = ze, $$ = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Pt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, y$ = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: $$,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: l } = a;
    l instanceof Pt.Name ? t.if((0, Pt._)`${l} !== true`, () => t.forIn("key", n, (h) => t.if(d(l, h), () => c(h)))) : l !== !0 && t.forIn("key", n, (h) => l === void 0 ? c(h) : t.if(u(l, h), () => c(h))), a.props = !0, e.ok((0, Pt._)`${s} === ${p$.default.errors}`);
    function c(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, Gi.alwaysValidSchema)(a, r)) {
        const E = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Gi.Type.Str
        }, E), o || t.if((0, Pt.not)(E), () => t.break());
      }
    }
    function d(h, E) {
      return (0, Pt._)`!${h} || !${h}[${E}]`;
    }
    function u(h, E) {
      const _ = [];
      for (const v in h)
        h[v] === !0 && _.push((0, Pt._)`${E} !== ${v}`);
      return (0, Pt.and)(..._);
    }
  }
};
uo.default = y$;
var fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const Zt = X, Ki = A, g$ = {
  message: ({ params: { len: e } }) => (0, Zt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Zt._)`{limit: ${e}}`
}, _$ = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: g$,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, Zt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, Zt._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Ki.alwaysValidSchema)(s, r)) {
      const c = t.var("valid", (0, Zt._)`${o} <= ${a}`);
      t.if((0, Zt.not)(c), () => l(c, a)), e.ok(c);
    }
    s.items = !0;
    function l(c, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: Ki.Type.Num }, c), s.allErrors || t.if((0, Zt.not)(c), () => t.break());
      });
    }
  }
};
fo.default = _$;
Object.defineProperty(lo, "__esModule", { value: !0 });
const v$ = uo, w$ = fo, E$ = [v$.default, w$.default];
lo.default = E$;
var ho = {}, mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const pe = X, b$ = {
  message: ({ schemaCode: e }) => (0, pe.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, pe._)`{format: ${e}}`
}, S$ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: b$,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: l } = e, { opts: c, errSchemaPath: d, schemaEnv: u, self: h } = l;
    if (!c.validateFormats)
      return;
    s ? E() : _();
    function E() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: c.code.formats
      }), g = r.const("fDef", (0, pe._)`${v}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, pe._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(y, (0, pe._)`${g}.type || "string"`).assign(m, (0, pe._)`${g}.validate`), () => r.assign(y, (0, pe._)`"string"`).assign(m, g)), e.fail$data((0, pe.or)(w(), N()));
      function w() {
        return c.strictSchema === !1 ? pe.nil : (0, pe._)`${o} && !${m}`;
      }
      function N() {
        const R = u.$async ? (0, pe._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, pe._)`${m}(${n})`, O = (0, pe._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, pe._)`${m} && ${m} !== true && ${y} === ${t} && !${O}`;
      }
    }
    function _() {
      const v = h.formats[a];
      if (!v) {
        w();
        return;
      }
      if (v === !0)
        return;
      const [g, y, m] = N(v);
      g === t && e.pass(R());
      function w() {
        if (c.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const G = O instanceof RegExp ? (0, pe.regexpCode)(O) : c.code.formats ? (0, pe._)`${c.code.formats}${(0, pe.getProperty)(a)}` : void 0, W = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, pe._)`${W}.validate`] : ["string", O, W];
      }
      function R() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, pe._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, pe._)`${m}(${n})` : (0, pe._)`${m}.test(${n})`;
      }
    }
  }
};
mo.default = S$;
Object.defineProperty(ho, "__esModule", { value: !0 });
const P$ = mo, N$ = [P$.default];
ho.default = N$;
var Er = {};
Object.defineProperty(Er, "__esModule", { value: !0 });
Er.contentVocabulary = Er.metadataVocabulary = void 0;
Er.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Er.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Oa, "__esModule", { value: !0 });
const R$ = Ia, O$ = Ta, I$ = Ga, j$ = ro, T$ = ao, k$ = lo, A$ = ho, Hi = Er, C$ = [
  j$.default,
  R$.default,
  O$.default,
  (0, I$.default)(!0),
  A$.default,
  Hi.metadataVocabulary,
  Hi.contentVocabulary,
  T$.default,
  k$.default
];
Oa.default = C$;
var po = {}, hs = {};
Object.defineProperty(hs, "__esModule", { value: !0 });
hs.DiscrError = void 0;
var Ji;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Ji || (hs.DiscrError = Ji = {}));
Object.defineProperty(po, "__esModule", { value: !0 });
const hr = X, Zs = hs, Bi = ke, D$ = Pr, M$ = A, L$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Zs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, hr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, V$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: L$,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const l = n.propertyName;
    if (typeof l != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = t.let("valid", !1), d = t.const("tag", (0, hr._)`${r}${(0, hr.getProperty)(l)}`);
    t.if((0, hr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Zs.DiscrError.Tag, tag: d, tagName: l })), e.ok(c);
    function u() {
      const _ = E();
      t.if(!1);
      for (const v in _)
        t.elseIf((0, hr._)`${d} === ${v}`), t.assign(c, h(_[v]));
      t.else(), e.error(!1, { discrError: Zs.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(_) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: _ }, v);
      return e.mergeEvaluated(g, hr.Name), v;
    }
    function E() {
      var _;
      const v = {}, g = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, M$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const W = O.$ref;
          if (O = Bi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, W), O instanceof Bi.SchemaEnv && (O = O.schema), O === void 0)
            throw new D$.default(a.opts.uriResolver, a.baseId, W);
        }
        const G = (_ = O == null ? void 0 : O.properties) === null || _ === void 0 ? void 0 : _[l];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        y = y && (g || m(O)), w(G, R);
      }
      if (!y)
        throw new Error(`discriminator: "${l}" must be required`);
      return v;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(l);
      }
      function w(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const G of R.enum)
            N(G, O);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in v)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        v[R] = O;
      }
    }
  }
};
po.default = V$;
var $o = {};
const F$ = "https://json-schema.org/draft/2020-12/schema", z$ = "https://json-schema.org/draft/2020-12/schema", U$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, q$ = "meta", G$ = "Core and Validation specifications meta-schema", K$ = [
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
], H$ = [
  "object",
  "boolean"
], J$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", B$ = {
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
}, W$ = {
  $schema: F$,
  $id: z$,
  $vocabulary: U$,
  $dynamicAnchor: q$,
  title: G$,
  allOf: K$,
  type: H$,
  $comment: J$,
  properties: B$
}, X$ = "https://json-schema.org/draft/2020-12/schema", Y$ = "https://json-schema.org/draft/2020-12/meta/applicator", Q$ = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, Z$ = "meta", x$ = "Applicator vocabulary meta-schema", ey = [
  "object",
  "boolean"
], ty = {
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
}, ry = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, ny = {
  $schema: X$,
  $id: Y$,
  $vocabulary: Q$,
  $dynamicAnchor: Z$,
  title: x$,
  type: ey,
  properties: ty,
  $defs: ry
}, sy = "https://json-schema.org/draft/2020-12/schema", ay = "https://json-schema.org/draft/2020-12/meta/unevaluated", oy = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, iy = "meta", cy = "Unevaluated applicator vocabulary meta-schema", ly = [
  "object",
  "boolean"
], uy = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, dy = {
  $schema: sy,
  $id: ay,
  $vocabulary: oy,
  $dynamicAnchor: iy,
  title: cy,
  type: ly,
  properties: uy
}, fy = "https://json-schema.org/draft/2020-12/schema", hy = "https://json-schema.org/draft/2020-12/meta/content", my = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, py = "meta", $y = "Content vocabulary meta-schema", yy = [
  "object",
  "boolean"
], gy = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, _y = {
  $schema: fy,
  $id: hy,
  $vocabulary: my,
  $dynamicAnchor: py,
  title: $y,
  type: yy,
  properties: gy
}, vy = "https://json-schema.org/draft/2020-12/schema", wy = "https://json-schema.org/draft/2020-12/meta/core", Ey = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, by = "meta", Sy = "Core vocabulary meta-schema", Py = [
  "object",
  "boolean"
], Ny = {
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
}, Ry = {
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
}, Oy = {
  $schema: vy,
  $id: wy,
  $vocabulary: Ey,
  $dynamicAnchor: by,
  title: Sy,
  type: Py,
  properties: Ny,
  $defs: Ry
}, Iy = "https://json-schema.org/draft/2020-12/schema", jy = "https://json-schema.org/draft/2020-12/meta/format-annotation", Ty = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, ky = "meta", Ay = "Format vocabulary meta-schema for annotation results", Cy = [
  "object",
  "boolean"
], Dy = {
  format: {
    type: "string"
  }
}, My = {
  $schema: Iy,
  $id: jy,
  $vocabulary: Ty,
  $dynamicAnchor: ky,
  title: Ay,
  type: Cy,
  properties: Dy
}, Ly = "https://json-schema.org/draft/2020-12/schema", Vy = "https://json-schema.org/draft/2020-12/meta/meta-data", Fy = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, zy = "meta", Uy = "Meta-data vocabulary meta-schema", qy = [
  "object",
  "boolean"
], Gy = {
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
}, Ky = {
  $schema: Ly,
  $id: Vy,
  $vocabulary: Fy,
  $dynamicAnchor: zy,
  title: Uy,
  type: qy,
  properties: Gy
}, Hy = "https://json-schema.org/draft/2020-12/schema", Jy = "https://json-schema.org/draft/2020-12/meta/validation", By = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Wy = "meta", Xy = "Validation vocabulary meta-schema", Yy = [
  "object",
  "boolean"
], Qy = {
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
}, Zy = {
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
}, xy = {
  $schema: Hy,
  $id: Jy,
  $vocabulary: By,
  $dynamicAnchor: Wy,
  title: Xy,
  type: Yy,
  properties: Qy,
  $defs: Zy
};
Object.defineProperty($o, "__esModule", { value: !0 });
const e0 = W$, t0 = ny, r0 = dy, n0 = _y, s0 = Oy, a0 = My, o0 = Ky, i0 = xy, c0 = ["/properties"];
function l0(e) {
  return [
    e0,
    t0,
    r0,
    n0,
    s0,
    t(this, a0),
    o0,
    t(this, i0)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, c0) : n;
  }
}
$o.default = l0;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Xc, n = Oa, s = po, a = $o, o = "https://json-schema.org/draft/2020-12/schema";
  class l extends r.default {
    constructor(_ = {}) {
      super({
        ..._,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((_) => this.addVocabulary(_)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: _, meta: v } = this.opts;
      v && (a.default.call(this, _), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = l, e.exports = t = l, e.exports.Ajv2020 = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var c = Ye;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var d = X;
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
  var u = ln;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = Pr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Hs, Hs.exports);
var u0 = Hs.exports, xs = { exports: {} }, Wl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(z, H) {
    return { validate: z, compare: H };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(c(!0), d),
    "date-time": t(E(!0), _),
    "iso-time": t(c(), u),
    "iso-date-time": t(E(), v),
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
    regex: ye,
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
    byte: N,
    // signed 32 bit integer
    int32: { type: "number", validate: G },
    // signed 64 bit integer
    int64: { type: "number", validate: W },
    // C-type float
    float: { type: "number", validate: de },
    // C-type double
    double: { type: "number", validate: de },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, _),
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, u),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, v),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  }, e.formatNames = Object.keys(e.fullFormats);
  function r(z) {
    return z % 4 === 0 && (z % 100 !== 0 || z % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(z) {
    const H = n.exec(z);
    if (!H)
      return !1;
    const ae = +H[1], j = +H[2], k = +H[3];
    return j >= 1 && j <= 12 && k >= 1 && k <= (j === 2 && r(ae) ? 29 : s[j]);
  }
  function o(z, H) {
    if (z && H)
      return z > H ? 1 : z < H ? -1 : 0;
  }
  const l = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function c(z) {
    return function(ae) {
      const j = l.exec(ae);
      if (!j)
        return !1;
      const k = +j[1], L = +j[2], D = +j[3], K = j[4], M = j[5] === "-" ? -1 : 1, P = +(j[6] || 0), p = +(j[7] || 0);
      if (P > 23 || p > 59 || z && !K)
        return !1;
      if (k <= 23 && L <= 59 && D < 60)
        return !0;
      const S = L - p * M, $ = k - P * M - (S < 0 ? 1 : 0);
      return ($ === 23 || $ === -1) && (S === 59 || S === -1) && D < 61;
    };
  }
  function d(z, H) {
    if (!(z && H))
      return;
    const ae = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf(), j = (/* @__PURE__ */ new Date("2020-01-01T" + H)).valueOf();
    if (ae && j)
      return ae - j;
  }
  function u(z, H) {
    if (!(z && H))
      return;
    const ae = l.exec(z), j = l.exec(H);
    if (ae && j)
      return z = ae[1] + ae[2] + ae[3], H = j[1] + j[2] + j[3], z > H ? 1 : z < H ? -1 : 0;
  }
  const h = /t|\s/i;
  function E(z) {
    const H = c(z);
    return function(j) {
      const k = j.split(h);
      return k.length === 2 && a(k[0]) && H(k[1]);
    };
  }
  function _(z, H) {
    if (!(z && H))
      return;
    const ae = new Date(z).valueOf(), j = new Date(H).valueOf();
    if (ae && j)
      return ae - j;
  }
  function v(z, H) {
    if (!(z && H))
      return;
    const [ae, j] = z.split(h), [k, L] = H.split(h), D = o(ae, k);
    if (D !== void 0)
      return D || d(j, L);
  }
  const g = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(z) {
    return g.test(z) && y.test(z);
  }
  const w = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function N(z) {
    return w.lastIndex = 0, w.test(z);
  }
  const R = -2147483648, O = 2 ** 31 - 1;
  function G(z) {
    return Number.isInteger(z) && z <= O && z >= R;
  }
  function W(z) {
    return Number.isInteger(z);
  }
  function de() {
    return !0;
  }
  const me = /[^\\]\\Z/;
  function ye(z) {
    if (me.test(z))
      return !1;
    try {
      return new RegExp(z), !0;
    } catch {
      return !1;
    }
  }
})(Wl);
var Xl = {}, ea = { exports: {} }, Yl = {}, Qe = {}, br = {}, dn = {}, x = {}, on = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(w) {
      if (super(), !e.IDENTIFIER.test(w))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = w;
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
    constructor(w) {
      super(), this._items = typeof w == "string" ? [w] : w;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const w = this._items[0];
      return w === "" || w === '""';
    }
    get str() {
      var w;
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const N = [m[0]];
    let R = 0;
    for (; R < w.length; )
      l(N, w[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...w) {
    const N = [_(m[0])];
    let R = 0;
    for (; R < w.length; )
      N.push(a), l(N, w[R]), N.push(a, _(m[++R]));
    return c(N), new n(N);
  }
  e.str = o;
  function l(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = l;
  function c(m) {
    let w = 1;
    for (; w < m.length - 1; ) {
      if (m[w] === a) {
        const N = d(m[w - 1], m[w + 1]);
        if (N !== void 0) {
          m.splice(w - 1, 3, N);
          continue;
        }
        m[w++] = "+";
      }
      w++;
    }
  }
  function d(m, w) {
    if (w === '""')
      return m;
    if (m === '""')
      return w;
    if (typeof m == "string")
      return w instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof w != "string" ? `${m.slice(0, -1)}${w}"` : w[0] === '"' ? m.slice(0, -1) + w.slice(1) : void 0;
    if (typeof w == "string" && w[0] === '"' && !(m instanceof r))
      return `"${m}${w.slice(1)}`;
  }
  function u(m, w) {
    return w.emptyStr() ? m : m.emptyStr() ? w : o`${m}${w}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : _(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n(_(m));
  }
  e.stringify = E;
  function _(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = _;
  function v(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = v;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function y(m) {
    return new n(m.toString());
  }
  e.regexpCode = y;
})(on);
var ta = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = on;
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
  const o = (0, t._)`\n`;
  class l extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? o : t.nil };
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
      const E = this.toName(d), { prefix: _ } = E, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[_];
      if (g) {
        const w = g.get(v);
        if (w)
          return w;
      } else
        g = this._values[_] = /* @__PURE__ */ new Map();
      g.set(v, E);
      const y = this._scope[_] || (this._scope[_] = []), m = y.length;
      return y[m] = u.ref, E.setValue(u, { property: _, itemIndex: m }), E;
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
      let _ = t.nil;
      for (const v in d) {
        const g = d[v];
        if (!g)
          continue;
        const y = h[v] = h[v] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let w = u(m);
          if (w) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            _ = (0, t._)`${_}${N} ${m} = ${w};${this.opts._n}`;
          } else if (w = E == null ? void 0 : E(m))
            _ = (0, t._)`${_}${w}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return _;
    }
  }
  e.ValueScope = l;
})(ta);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = on, r = ta;
  var n = on;
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
  var s = ta;
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
    optimizeNames(i, f) {
      return this;
    }
  }
  class o extends a {
    constructor(i, f, b) {
      super(), this.varKind = i, this.name = f, this.rhs = b;
    }
    render({ es5: i, _n: f }) {
      const b = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends a {
    constructor(i, f, b) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = b;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = j(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return ae(i, this.rhs);
    }
  }
  class c extends l {
    constructor(i, f, b, I) {
      super(i, b, I), this.op = f;
    }
    render({ _n: i }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + i;
    }
  }
  class d extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `${this.label}:` + i;
    }
  }
  class u extends a {
    constructor(i) {
      super(), this.label = i, this.names = {};
    }
    render({ _n: i }) {
      return `break${this.label ? ` ${this.label}` : ""};` + i;
    }
  }
  class h extends a {
    constructor(i) {
      super(), this.error = i;
    }
    render({ _n: i }) {
      return `throw ${this.error};` + i;
    }
    get names() {
      return this.error.names;
    }
  }
  class E extends a {
    constructor(i) {
      super(), this.code = i;
    }
    render({ _n: i }) {
      return `${this.code};` + i;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(i, f) {
      return this.code = j(this.code, i, f), this;
    }
    get names() {
      return this.code instanceof t._CodeOrName ? this.code.names : {};
    }
  }
  class _ extends a {
    constructor(i = []) {
      super(), this.nodes = i;
    }
    render(i) {
      return this.nodes.reduce((f, b) => f + b.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const b = i[f].optimizeNodes();
        Array.isArray(b) ? i.splice(f, 1, ...b) : b ? i[f] = b : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: b } = this;
      let I = b.length;
      for (; I--; ) {
        const T = b[I];
        T.optimizeNames(i, f) || (k(i, T.names), b.splice(I, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class v extends _ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends _ {
  }
  class y extends v {
  }
  y.kind = "else";
  class m extends v {
    constructor(i, f) {
      super(f), this.condition = i;
    }
    render(i) {
      let f = `if(${this.condition})` + super.render(i);
      return this.else && (f += "else " + this.else.render(i)), f;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const i = this.condition;
      if (i === !0)
        return this.nodes;
      let f = this.else;
      if (f) {
        const b = f.optimizeNodes();
        f = this.else = Array.isArray(b) ? new y(b) : b;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(L(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var b;
      if (this.else = (b = this.else) === null || b === void 0 ? void 0 : b.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = j(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return ae(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class w extends v {
  }
  w.kind = "for";
  class N extends w {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = j(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends w {
    constructor(i, f, b, I) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: I, to: T } = this;
      return `for(${f} ${b}=${I}; ${b}<${T}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = ae(super.names, this.from);
      return ae(i, this.to);
    }
  }
  class O extends w {
    constructor(i, f, b, I) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = j(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class G extends v {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class W extends _ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  W.kind = "return";
  class de extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, I;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class me extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  me.kind = "catch";
  class ye extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  ye.kind = "finally";
  class z {
    constructor(i, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = i, this._scope = new r.Scope({ parent: i }), this._nodes = [new g()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(i) {
      return this._scope.name(i);
    }
    // reserves unique name in the external scope
    scopeName(i) {
      return this._extScope.name(i);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(i, f) {
      const b = this._extScope.value(i, f);
      return (this._values[b.prefix] || (this._values[b.prefix] = /* @__PURE__ */ new Set())).add(b), b;
    }
    getScopeValue(i, f) {
      return this._extScope.getValue(i, f);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(i) {
      return this._extScope.scopeRefs(i, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(i, f, b, I) {
      const T = this._scope.toName(f);
      return b !== void 0 && I && (this._constants[T.str] = b), this._leafNode(new o(i, T, b)), T;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, b) {
      return this._def(r.varKinds.const, i, f, b);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, b) {
      return this._def(r.varKinds.let, i, f, b);
    }
    // `var` declaration with optional assignment
    var(i, f, b) {
      return this._def(r.varKinds.var, i, f, b);
    }
    // assignment code
    assign(i, f, b) {
      return this._leafNode(new l(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new c(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, I] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, b) {
      if (this._blockNode(new m(i)), f && b)
        this.code(f).else().code(b).endIf();
      else if (f)
        this.code(f).endIf();
      else if (b)
        throw new Error('CodeGen: "else" body without "then" body');
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(i) {
      return this._elseNode(new m(i));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new y());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, y);
    }
    _for(i, f) {
      return this._blockNode(i), f && this.code(f).endFor(), this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(i, f) {
      return this._for(new N(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, I, T = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(T, F, f, b), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, I = r.varKinds.const) {
      const T = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(T, (0, t._)`${F}[${V}]`), b(T);
        });
      }
      return this._for(new O("of", I, T, f), () => b(T));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const T = this._scope.toName(i);
      return this._for(new O("in", I, T, f), () => b(T));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new u(i));
    }
    // `return` statement
    return(i) {
      const f = new W();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(W);
    }
    // `try` statement
    try(i, f, b) {
      if (!f && !b)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new de();
      if (this._blockNode(I), this.code(i), f) {
        const T = this.name("e");
        this._currNode = I.catch = new me(T), f(T);
      }
      return b && (this._currNode = I.finally = new ye(), this.code(b)), this._endBlockNode(me, ye);
    }
    // `throw` statement
    throw(i) {
      return this._leafNode(new h(i));
    }
    // start self-balancing block
    block(i, f) {
      return this._blockStarts.push(this._nodes.length), i && this.code(i).endBlock(f), this;
    }
    // end the current self-balancing block
    endBlock(i) {
      const f = this._blockStarts.pop();
      if (f === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const b = this._nodes.length - f;
      if (b < 0 || i !== void 0 && b !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${b} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, b, I) {
      return this._blockNode(new G(i, f, b)), I && this.code(I).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(G);
    }
    optimize(i = 1) {
      for (; i-- > 0; )
        this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
    }
    _leafNode(i) {
      return this._currNode.nodes.push(i), this;
    }
    _blockNode(i) {
      this._currNode.nodes.push(i), this._nodes.push(i);
    }
    _endBlockNode(i, f) {
      const b = this._currNode;
      if (b instanceof i || f && b instanceof f)
        return this._nodes.pop(), this;
      throw new Error(`CodeGen: not in block "${f ? `${i.kind}/${f.kind}` : i.kind}"`);
    }
    _elseNode(i) {
      const f = this._currNode;
      if (!(f instanceof m))
        throw new Error('CodeGen: "else" without "if"');
      return this._currNode = f.else = i, this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const i = this._nodes;
      return i[i.length - 1];
    }
    set _currNode(i) {
      const f = this._nodes;
      f[f.length - 1] = i;
    }
  }
  e.CodeGen = z;
  function H($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function ae($, i) {
    return i instanceof t._CodeOrName ? H($, i.names) : $;
  }
  function j($, i, f) {
    if ($ instanceof t.Name)
      return b($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((T, F) => (F instanceof t.Name && (F = b(F)), F instanceof t._Code ? T.push(...F._items) : T.push(F), T), []));
    function b(T) {
      const F = f[T.str];
      return F === void 0 || i[T.str] !== 1 ? T : (delete i[T.str], F);
    }
    function I(T) {
      return T instanceof t._Code && T._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function k($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) - (i[f] || 0);
  }
  function L($) {
    return typeof $ == "boolean" || typeof $ == "number" || $ === null ? !$ : (0, t._)`!${S($)}`;
  }
  e.not = L;
  const D = p(e.operators.AND);
  function K(...$) {
    return $.reduce(D);
  }
  e.and = K;
  const M = p(e.operators.OR);
  function P(...$) {
    return $.reduce(M);
  }
  e.or = P;
  function p($) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${$} ${S(f)}`;
  }
  function S($) {
    return $ instanceof t.Name ? $ : (0, t._)`(${$})`;
  }
})(x);
var C = {};
Object.defineProperty(C, "__esModule", { value: !0 });
C.checkStrictMode = C.getErrorPath = C.Type = C.useFunc = C.setEvaluated = C.evaluatedPropsToName = C.mergeEvaluated = C.eachItem = C.unescapeJsonPointer = C.escapeJsonPointer = C.escapeFragment = C.unescapeFragment = C.schemaRefOrVal = C.schemaHasRulesButRef = C.schemaHasRules = C.checkUnknownRules = C.alwaysValidSchema = C.toHash = void 0;
const ce = x, d0 = on;
function f0(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = f0;
function h0(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Ql(e, t), !Zl(t, e.self.RULES.all));
}
C.alwaysValidSchema = h0;
function Ql(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || tu(e, `unknown keyword: "${a}"`);
}
C.checkUnknownRules = Ql;
function Zl(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
C.schemaHasRules = Zl;
function m0(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
C.schemaHasRulesButRef = m0;
function p0({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ce._)`${r}`;
  }
  return (0, ce._)`${e}${t}${(0, ce.getProperty)(n)}`;
}
C.schemaRefOrVal = p0;
function $0(e) {
  return xl(decodeURIComponent(e));
}
C.unescapeFragment = $0;
function y0(e) {
  return encodeURIComponent(yo(e));
}
C.escapeFragment = y0;
function yo(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
C.escapeJsonPointer = yo;
function xl(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = xl;
function g0(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = g0;
function Wi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const c = o === void 0 ? a : o instanceof ce.Name ? (a instanceof ce.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ce.Name ? (t(s, o, a), a) : r(a, o);
    return l === ce.Name && !(c instanceof ce.Name) ? n(s, c) : c;
  };
}
C.mergeEvaluated = {
  props: Wi({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ce._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ce._)`${r} || {}`).code((0, ce._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ce._)`${r} || {}`), go(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: eu
  }),
  items: Wi({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ce._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ce._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function eu(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ce._)`{}`);
  return t !== void 0 && go(e, r, t), r;
}
C.evaluatedPropsToName = eu;
function go(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ce._)`${t}${(0, ce.getProperty)(n)}`, !0));
}
C.setEvaluated = go;
const Xi = {};
function _0(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Xi[t.code] || (Xi[t.code] = new d0._Code(t.code))
  });
}
C.useFunc = _0;
var ra;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(ra || (C.Type = ra = {}));
function v0(e, t, r) {
  if (e instanceof ce.Name) {
    const n = t === ra.Num;
    return r ? n ? (0, ce._)`"[" + ${e} + "]"` : (0, ce._)`"['" + ${e} + "']"` : n ? (0, ce._)`"/" + ${e}` : (0, ce._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ce.getProperty)(e).toString() : "/" + yo(e);
}
C.getErrorPath = v0;
function tu(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = tu;
var ot = {};
Object.defineProperty(ot, "__esModule", { value: !0 });
const Re = x, w0 = {
  // validation function arguments
  data: new Re.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Re.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Re.Name("instancePath"),
  parentData: new Re.Name("parentData"),
  parentDataProperty: new Re.Name("parentDataProperty"),
  rootData: new Re.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Re.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Re.Name("vErrors"),
  // null or array of validation errors
  errors: new Re.Name("errors"),
  // counter of validation errors
  this: new Re.Name("this"),
  // "globals"
  self: new Re.Name("self"),
  scope: new Re.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Re.Name("json"),
  jsonPos: new Re.Name("jsonPos"),
  jsonLen: new Re.Name("jsonLen"),
  jsonPart: new Re.Name("jsonPart")
};
ot.default = w0;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = x, r = C, n = ot;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, N) {
    const { it: R } = y, { gen: O, compositeRule: G, allErrors: W } = R, de = h(y, m, w);
    N ?? (G || W) ? c(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, w) {
    const { it: N } = y, { gen: R, compositeRule: O, allErrors: G } = N, W = h(y, m, w);
    c(R, W), O || G || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function l({ gen: y, keyword: m, schemaValue: w, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const G = y.name("err");
    y.forRange("i", R, n.default.errors, (W) => {
      y.const(G, (0, t._)`${n.default.vErrors}[${W}]`), y.if((0, t._)`${G}.instancePath === undefined`, () => y.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), y.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (y.assign((0, t._)`${G}.schema`, w), y.assign((0, t._)`${G}.data`, N));
    });
  }
  e.extendErrors = l;
  function c(y, m) {
    const w = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: w, validateName: N, schemaEnv: R } = y;
    R.$async ? w.throw((0, t._)`new ${y.ValidationError}(${m})`) : (w.assign((0, t._)`${N}.errors`, m), w.return(!1));
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
  function h(y, m, w) {
    const { createErrors: N } = y.it;
    return N === !1 ? (0, t._)`{}` : E(y, m, w);
  }
  function E(y, m, w = {}) {
    const { gen: N, it: R } = y, O = [
      _(R, w),
      v(y, w)
    ];
    return g(y, m, O), N.object(...O);
  }
  function _({ errorPath: y }, { instancePath: m }) {
    const w = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function v({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${y}`;
    return w && (R = (0, t.str)`${R}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, R];
  }
  function g(y, { params: m, message: w }, N) {
    const { keyword: R, data: O, schemaValue: G, it: W } = y, { opts: de, propertyName: me, topSchemaRef: ye, schemaPath: z } = W;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), de.messages && N.push([u.message, typeof w == "function" ? w(y) : w]), de.verbose && N.push([u.schema, G], [u.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), me && N.push([u.propertyName, me]);
  }
})(dn);
Object.defineProperty(br, "__esModule", { value: !0 });
br.boolOrEmptySchema = br.topBoolOrEmptySchema = void 0;
const E0 = dn, b0 = x, S0 = ot, P0 = {
  message: "boolean schema is false"
};
function N0(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? ru(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(S0.default.data) : (t.assign((0, b0._)`${n}.errors`, null), t.return(!0));
}
br.topBoolOrEmptySchema = N0;
function R0(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), ru(e)) : r.var(t, !0);
}
br.boolOrEmptySchema = R0;
function ru(e, t) {
  const { gen: r, data: n } = e, s = {
    gen: r,
    keyword: "false schema",
    data: n,
    schema: !1,
    schemaCode: !1,
    schemaValue: !1,
    params: {},
    it: e
  };
  (0, E0.reportError)(s, P0, void 0, t);
}
var _e = {}, sr = {};
Object.defineProperty(sr, "__esModule", { value: !0 });
sr.getRules = sr.isJSONType = void 0;
const O0 = ["string", "number", "integer", "boolean", "null", "object", "array"], I0 = new Set(O0);
function j0(e) {
  return typeof e == "string" && I0.has(e);
}
sr.isJSONType = j0;
function T0() {
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
sr.getRules = T0;
var ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
ht.shouldUseRule = ht.shouldUseGroup = ht.schemaHasRulesForType = void 0;
function k0({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && nu(e, n);
}
ht.schemaHasRulesForType = k0;
function nu(e, t) {
  return t.rules.some((r) => su(e, r));
}
ht.shouldUseGroup = nu;
function su(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
ht.shouldUseRule = su;
Object.defineProperty(_e, "__esModule", { value: !0 });
_e.reportTypeError = _e.checkDataTypes = _e.checkDataType = _e.coerceAndCheckDataType = _e.getJSONTypes = _e.getSchemaTypes = _e.DataType = void 0;
const A0 = sr, C0 = ht, D0 = dn, Q = x, au = C;
var gr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(gr || (_e.DataType = gr = {}));
function M0(e) {
  const t = ou(e.type);
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
_e.getSchemaTypes = M0;
function ou(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(A0.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
_e.getJSONTypes = ou;
function L0(e, t) {
  const { gen: r, data: n, opts: s } = e, a = V0(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, C0.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = _o(t, n, s.strictNumbers, gr.Wrong);
    r.if(l, () => {
      a.length ? F0(e, t, a) : vo(e);
    });
  }
  return o;
}
_e.coerceAndCheckDataType = L0;
const iu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function V0(e, t) {
  return t ? e.filter((r) => iu.has(r) || t === "array" && r === "array") : [];
}
function F0(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Q._)`typeof ${s}`), l = n.let("coerced", (0, Q._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Q._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Q._)`${s}[0]`).assign(o, (0, Q._)`typeof ${s}`).if(_o(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Q._)`${l} !== undefined`);
  for (const d of r)
    (iu.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), vo(e), n.endIf(), n.if((0, Q._)`${l} !== undefined`, () => {
    n.assign(s, l), z0(e, l);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, Q._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, Q._)`"" + ${s}`).elseIf((0, Q._)`${s} === null`).assign(l, (0, Q._)`""`);
        return;
      case "number":
        n.elseIf((0, Q._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(l, (0, Q._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, Q._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(l, (0, Q._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, Q._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(l, !1).elseIf((0, Q._)`${s} === "true" || ${s} === 1`).assign(l, !0);
        return;
      case "null":
        n.elseIf((0, Q._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(l, null);
        return;
      case "array":
        n.elseIf((0, Q._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, Q._)`[${s}]`);
    }
  }
}
function z0({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Q._)`${t} !== undefined`, () => e.assign((0, Q._)`${t}[${r}]`, n));
}
function na(e, t, r, n = gr.Correct) {
  const s = n === gr.Correct ? Q.operators.EQ : Q.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, Q._)`${t} ${s} null`;
    case "array":
      a = (0, Q._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, Q._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, Q._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, Q._)`typeof ${t} ${s} ${e}`;
  }
  return n === gr.Correct ? a : (0, Q.not)(a);
  function o(l = Q.nil) {
    return (0, Q.and)((0, Q._)`typeof ${t} == "number"`, l, r ? (0, Q._)`isFinite(${t})` : Q.nil);
  }
}
_e.checkDataType = na;
function _o(e, t, r, n) {
  if (e.length === 1)
    return na(e[0], t, r, n);
  let s;
  const a = (0, au.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Q._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Q._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Q.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Q.and)(s, na(o, t, r, n));
  return s;
}
_e.checkDataTypes = _o;
const U0 = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Q._)`{type: ${e}}` : (0, Q._)`{type: ${t}}`
};
function vo(e) {
  const t = q0(e);
  (0, D0.reportError)(t, U0);
}
_e.reportTypeError = vo;
function q0(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, au.schemaRefOrVal)(e, n, "type");
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
var ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
ms.assignDefaults = void 0;
const cr = x, G0 = C;
function K0(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      Yi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => Yi(e, a, s.default));
}
ms.assignDefaults = K0;
function Yi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, cr._)`${a}${(0, cr.getProperty)(t)}`;
  if (s) {
    (0, G0.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, cr._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, cr._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, cr._)`${l} = ${(0, cr.stringify)(r)}`);
}
var at = {}, te = {};
Object.defineProperty(te, "__esModule", { value: !0 });
te.validateUnion = te.validateArray = te.usePattern = te.callValidateCode = te.schemaProperties = te.allSchemaProperties = te.noPropertyInData = te.propertyInData = te.isOwnProperty = te.hasPropFunc = te.reportMissingProp = te.checkMissingProp = te.checkReportMissingProp = void 0;
const ue = x, wo = C, bt = ot, H0 = C;
function J0(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(bo(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ue._)`${t}` }, !0), e.error();
  });
}
te.checkReportMissingProp = J0;
function B0({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((a) => (0, ue.and)(bo(e, t, a, r.ownProperties), (0, ue._)`${s} = ${a}`)));
}
te.checkMissingProp = B0;
function W0(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
te.reportMissingProp = W0;
function cu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
te.hasPropFunc = cu;
function Eo(e, t, r) {
  return (0, ue._)`${cu(e)}.call(${t}, ${r})`;
}
te.isOwnProperty = Eo;
function X0(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${Eo(e, t, r)}` : s;
}
te.propertyInData = X0;
function bo(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(Eo(e, t, r))) : s;
}
te.noPropertyInData = bo;
function lu(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
te.allSchemaProperties = lu;
function Y0(e, t) {
  return lu(t).filter((r) => !(0, wo.alwaysValidSchema)(e, t[r]));
}
te.schemaProperties = Y0;
function Q0({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
  const u = d ? (0, ue._)`${e}, ${t}, ${n}${s}` : t, h = [
    [bt.default.instancePath, (0, ue.strConcat)(bt.default.instancePath, a)],
    [bt.default.parentData, o.parentData],
    [bt.default.parentDataProperty, o.parentDataProperty],
    [bt.default.rootData, bt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([bt.default.dynamicAnchors, bt.default.dynamicAnchors]);
  const E = (0, ue._)`${u}, ${r.object(...h)}`;
  return c !== ue.nil ? (0, ue._)`${l}.call(${c}, ${E})` : (0, ue._)`${l}(${E})`;
}
te.callValidateCode = Q0;
const Z0 = (0, ue._)`new RegExp`;
function x0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ue._)`${s.code === "new RegExp" ? Z0 : (0, H0.useFunc)(e, s)}(${r}, ${n})`
  });
}
te.usePattern = x0;
function eg(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const c = t.const("len", (0, ue._)`${r}.length`);
    t.forRange("i", 0, c, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: wo.Type.Num
      }, a), t.if((0, ue.not)(a), l);
    });
  }
}
te.validateArray = eg;
function tg(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, wo.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((c, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, l);
    t.assign(o, (0, ue._)`${o} || ${l}`), e.mergeValidEvaluated(u, l) || t.if((0, ue.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
te.validateUnion = tg;
Object.defineProperty(at, "__esModule", { value: !0 });
at.validateKeywordUsage = at.validSchemaType = at.funcKeywordCode = at.macroKeywordCode = void 0;
const Te = x, xt = ot, rg = te, ng = dn;
function sg(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = uu(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: Te.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: c,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
at.macroKeywordCode = sg;
function ag(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  ig(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = uu(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      g(), t.modifying && Qi(e), y(() => e.error());
    else {
      const m = t.async ? _() : v();
      t.modifying && Qi(e), y(() => og(e, m));
    }
  }
  function _() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, Te._)`await `), (w) => n.assign(h, !1).if((0, Te._)`${w} instanceof ${c.ValidationError}`, () => n.assign(m, (0, Te._)`${w}.errors`), () => n.throw(w))), m;
  }
  function v() {
    const m = (0, Te._)`${u}.errors`;
    return n.assign(m, null), g(Te.nil), m;
  }
  function g(m = t.async ? (0, Te._)`await ` : Te.nil) {
    const w = c.opts.passContext ? xt.default.this : xt.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, Te._)`${m}${(0, rg.callValidateCode)(e, u, w, N)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, Te.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
at.funcKeywordCode = ag;
function Qi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Te._)`${n.parentData}[${n.parentDataProperty}]`));
}
function og(e, t) {
  const { gen: r } = e;
  r.if((0, Te._)`Array.isArray(${t})`, () => {
    r.assign(xt.default.vErrors, (0, Te._)`${xt.default.vErrors} === null ? ${t} : ${xt.default.vErrors}.concat(${t})`).assign(xt.default.errors, (0, Te._)`${xt.default.vErrors}.length`), (0, ng.extendErrors)(e);
  }, () => e.error());
}
function ig({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function uu(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Te.stringify)(r) });
}
function cg(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
at.validSchemaType = cg;
function lg({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
  }
}
at.validateKeywordUsage = lg;
var kt = {};
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.extendSubschemaMode = kt.extendSubschemaData = kt.getSubschema = void 0;
const rt = x, du = C;
function ug(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, rt._)`${e.schemaPath}${(0, rt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, rt._)`${e.schemaPath}${(0, rt.getProperty)(t)}${(0, rt.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, du.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
kt.getSubschema = ug;
function dg(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, rt._)`${t.data}${(0, rt.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, rt.str)`${d}${(0, du.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, rt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof rt.Name ? s : l.let("data", s, !0);
    c(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function c(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
kt.extendSubschemaData = dg;
function fg(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
kt.extendSubschemaMode = fg;
var Se = {}, fu = { exports: {} }, jt = fu.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Vn(t, n, s, e, "", e);
};
jt.keywords = {
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
jt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
jt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
jt.skipKeywords = {
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
function Vn(e, t, r, n, s, a, o, l, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in jt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            Vn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in jt.propsKeywords) {
        if (h && typeof h == "object")
          for (var _ in h)
            Vn(e, t, r, h[_], s + "/" + u + "/" + hg(_), a, s, u, n, _);
      } else (u in jt.keywords || e.allKeys && !(u in jt.skipKeywords)) && Vn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function hg(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var mg = fu.exports;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
const pg = C, $g = is, yg = mg, gg = /* @__PURE__ */ new Set([
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
function _g(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !sa(e) : t ? hu(e) <= t : !1;
}
Se.inlineRef = _g;
const vg = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function sa(e) {
  for (const t in e) {
    if (vg.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(sa) || typeof r == "object" && sa(r))
      return !0;
  }
  return !1;
}
function hu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !gg.has(r) && (typeof e[r] == "object" && (0, pg.eachItem)(e[r], (n) => t += hu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function mu(e, t = "", r) {
  r !== !1 && (t = _r(t));
  const n = e.parse(t);
  return pu(e, n);
}
Se.getFullPath = mu;
function pu(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Se._getFullPath = pu;
const wg = /#\/?$/;
function _r(e) {
  return e ? e.replace(wg, "") : "";
}
Se.normalizeId = _r;
function Eg(e, t, r) {
  return r = _r(r), e.resolve(t, r);
}
Se.resolveUrl = Eg;
const bg = /^[a-z_][-a-z0-9._]*$/i;
function Sg(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = _r(e[r] || t), a = { "": s }, o = mu(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return yg(e, { allKeys: !0 }, (h, E, _, v) => {
    if (v === void 0)
      return;
    const g = o + E;
    let y = a[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[E] = y;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = _r(y ? R(y, N) : N), c.has(N))
        throw u(N);
      c.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== _r(g) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = g), N;
    }
    function w(N) {
      if (typeof N == "string") {
        if (!bg.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, E, _) {
    if (E !== void 0 && !$g(h, E))
      throw u(_);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Se.getSchemaRefs = Sg;
Object.defineProperty(Qe, "__esModule", { value: !0 });
Qe.getData = Qe.KeywordCxt = Qe.validateFunctionCode = void 0;
const $u = br, Zi = _e, So = ht, Zn = _e, Pg = ms, xr = at, As = kt, q = x, B = ot, Ng = Se, mt = C, qr = dn;
function Rg(e) {
  if (_u(e) && (vu(e), gu(e))) {
    jg(e);
    return;
  }
  yu(e, () => (0, $u.topBoolOrEmptySchema)(e));
}
Qe.validateFunctionCode = Rg;
function yu({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${B.default.data}, ${B.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${xi(r, s)}`), Ig(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${B.default.data}, ${Og(s)}`, n.$async, () => e.code(xi(r, s)).code(a));
}
function Og(e) {
  return (0, q._)`{${B.default.instancePath}="", ${B.default.parentData}, ${B.default.parentDataProperty}, ${B.default.rootData}=${B.default.data}${e.dynamicRef ? (0, q._)`, ${B.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function Ig(e, t) {
  e.if(B.default.valCxt, () => {
    e.var(B.default.instancePath, (0, q._)`${B.default.valCxt}.${B.default.instancePath}`), e.var(B.default.parentData, (0, q._)`${B.default.valCxt}.${B.default.parentData}`), e.var(B.default.parentDataProperty, (0, q._)`${B.default.valCxt}.${B.default.parentDataProperty}`), e.var(B.default.rootData, (0, q._)`${B.default.valCxt}.${B.default.rootData}`), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, q._)`${B.default.valCxt}.${B.default.dynamicAnchors}`);
  }, () => {
    e.var(B.default.instancePath, (0, q._)`""`), e.var(B.default.parentData, (0, q._)`undefined`), e.var(B.default.parentDataProperty, (0, q._)`undefined`), e.var(B.default.rootData, B.default.data), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function jg(e) {
  const { schema: t, opts: r, gen: n } = e;
  yu(e, () => {
    r.$comment && t.$comment && Eu(e), Dg(e), n.let(B.default.vErrors, null), n.let(B.default.errors, 0), r.unevaluated && Tg(e), wu(e), Vg(e);
  });
}
function Tg(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function xi(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function kg(e, t) {
  if (_u(e) && (vu(e), gu(e))) {
    Ag(e, t);
    return;
  }
  (0, $u.boolOrEmptySchema)(e, t);
}
function gu({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function _u(e) {
  return typeof e.schema != "boolean";
}
function Ag(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Eu(e), Mg(e), Lg(e);
  const a = n.const("_errs", B.default.errors);
  wu(e, a), n.var(t, (0, q._)`${a} === ${B.default.errors}`);
}
function vu(e) {
  (0, mt.checkUnknownRules)(e), Cg(e);
}
function wu(e, t) {
  if (e.opts.jtd)
    return ec(e, [], !1, t);
  const r = (0, Zi.getSchemaTypes)(e.schema), n = (0, Zi.coerceAndCheckDataType)(e, r);
  ec(e, r, !n, t);
}
function Cg(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, mt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Dg(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, mt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Mg(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Ng.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Lg(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Eu({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${B.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${B.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function Vg(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${B.default.errors} === 0`, () => t.return(B.default.data), () => t.throw((0, q._)`new ${s}(${B.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, B.default.vErrors), a.unevaluated && Fg(e), t.return((0, q._)`${B.default.errors} === 0`));
}
function Fg({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function ec(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: c, self: d } = e, { RULES: u } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, mt.schemaHasRulesButRef)(a, u))) {
    s.block(() => Pu(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || zg(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, So.shouldUseGroup)(a, E) && (E.type ? (s.if((0, Zn.checkDataType)(E.type, o, c.strictNumbers)), tc(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, Zn.reportTypeError)(e)), s.endIf()) : tc(e, E), l || s.if((0, q._)`${B.default.errors} === ${n || 0}`));
  }
}
function tc(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Pg.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, So.shouldUseRule)(n, a) && Pu(e, a.keyword, a.definition, t.type);
  });
}
function zg(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Ug(e, t), e.opts.allowUnionTypes || qg(e, t), Gg(e, e.dataTypes));
}
function Ug(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      bu(e.dataTypes, r) || Po(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Hg(e, t);
  }
}
function qg(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Po(e, "use allowUnionTypes to allow union type keyword");
}
function Gg(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, So.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Kg(t, o)) && Po(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Kg(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function bu(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Hg(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    bu(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Po(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, mt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Su {
  constructor(t, r, n) {
    if ((0, xr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, mt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Nu(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, xr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", B.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, q.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, q.not)(t), void 0, r);
  }
  fail(t) {
    if (t === void 0) {
      this.error(), this.allErrors || this.gen.if(!1);
      return;
    }
    this.gen.if(t), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  fail$data(t) {
    if (!this.$data)
      return this.fail(t);
    const { schemaCode: r } = this;
    this.fail((0, q._)`${r} !== undefined && (${(0, q.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? qr.reportExtraError : qr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, qr.reportError)(this, this.def.$dataError || qr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, qr.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = q.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = q.nil, r = q.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, q.or)((0, q._)`${s} === undefined`, r)), t !== q.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== q.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, q.or)(o(), l());
    function o() {
      if (n.length) {
        if (!(r instanceof q.Name))
          throw new Error("ajv implementation error");
        const c = Array.isArray(n) ? n : [n];
        return (0, q._)`${(0, Zn.checkDataTypes)(c, r, a.opts.strictNumbers, Zn.DataType.Wrong)}`;
      }
      return q.nil;
    }
    function l() {
      if (s.validateSchema) {
        const c = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, q._)`!${c}(${r})`;
      }
      return q.nil;
    }
  }
  subschema(t, r) {
    const n = (0, As.getSubschema)(this.it, t);
    (0, As.extendSubschemaData)(n, this.it, t), (0, As.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return kg(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = mt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = mt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, q.Name)), !0;
  }
}
Qe.KeywordCxt = Su;
function Pu(e, t, r, n) {
  const s = new Su(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, xr.funcKeywordCode)(s, r) : "macro" in r ? (0, xr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, xr.funcKeywordCode)(s, r);
}
const Jg = /^\/(?:[^~]|~0|~1)*$/, Bg = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Nu(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return B.default.rootData;
  if (e[0] === "/") {
    if (!Jg.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = B.default.rootData;
  } else {
    const d = Bg.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(c("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(c("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const l = s.split("/");
  for (const d of l)
    d && (a = (0, q._)`${a}${(0, q.getProperty)((0, mt.unescapeJsonPointer)(d))}`, o = (0, q._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
Qe.getData = Nu;
var fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
class Wg extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
fn.default = Wg;
var jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
const Cs = Se;
class Xg extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Cs.resolveUrl)(t, r, n), this.missingSchema = (0, Cs.normalizeId)((0, Cs.getFullPath)(t, this.missingRef));
  }
}
jr.default = Xg;
var Me = {};
Object.defineProperty(Me, "__esModule", { value: !0 });
Me.resolveSchema = Me.getCompilingSchema = Me.resolveRef = Me.compileSchema = Me.SchemaEnv = void 0;
const He = x, Yg = fn, Wt = ot, Xe = Se, rc = C, Qg = Qe;
class ps {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Me.SchemaEnv = ps;
function No(e) {
  const t = Ru.call(this, e);
  if (t)
    return t;
  const r = (0, Xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new He.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: Yg.default,
    code: (0, He._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Wt.default.data,
    parentData: Wt.default.parentData,
    parentDataProperty: Wt.default.parentDataProperty,
    dataNames: [Wt.default.data],
    dataPathArr: [He.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, He.stringify)(e.schema) } : { ref: e.schema }),
    validateName: c,
    ValidationError: l,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: He.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, He._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, Qg.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Wt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const _ = new Function(`${Wt.default.self}`, `${Wt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(c, { ref: _ }), _.errors = null, _.schema = e.schema, _.schemaEnv = e, e.$async && (_.$async = !0), this.opts.code.source === !0 && (_.source = { validateName: c, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: v, items: g } = d;
      _.evaluated = {
        props: v instanceof He.Name ? void 0 : v,
        items: g instanceof He.Name ? void 0 : g,
        dynamicProps: v instanceof He.Name,
        dynamicItems: g instanceof He.Name
      }, _.source && (_.source.evaluated = (0, He.stringify)(_.evaluated));
    }
    return e.validate = _, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Me.compileSchema = No;
function Zg(e, t, r) {
  var n;
  r = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = t_.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new ps({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = xg.call(this, a);
}
Me.resolveRef = Zg;
function xg(e) {
  return (0, Xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : No.call(this, e);
}
function Ru(e) {
  for (const t of this._compilations)
    if (e_(t, e))
      return t;
}
Me.getCompilingSchema = Ru;
function e_(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function t_(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || $s.call(this, e, t);
}
function $s(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Xe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Xe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ds.call(this, r, e);
  const a = (0, Xe.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = $s.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : Ds.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || No.call(this, o), a === (0, Xe.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, Xe.resolveUrl)(this.opts.uriResolver, s, d)), new ps({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Ds.call(this, r, o);
  }
}
Me.resolveSchema = $s;
const r_ = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Ds(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, rc.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !r_.has(l) && d && (t = (0, Xe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, rc.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = $s.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new ps({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const n_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", s_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", a_ = "object", o_ = [
  "$data"
], i_ = {
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
}, c_ = !1, l_ = {
  $id: n_,
  description: s_,
  type: a_,
  required: o_,
  properties: i_,
  additionalProperties: c_
};
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const Ou = Ll;
Ou.code = 'require("ajv/dist/runtime/uri").default';
Ro.default = Ou;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Qe;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = x;
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
  const n = fn, s = jr, a = sr, o = Me, l = x, c = Se, d = _e, u = C, h = l_, E = Ro, _ = (P, p) => new RegExp(P, p);
  _.code = "new RegExp";
  const v = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  ]), y = {
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
  }, w = 200;
  function N(P) {
    var p, S, $, i, f, b, I, T, F, V, re, Le, At, Ct, Dt, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht;
    const Ge = P.strict, Jt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Cr = Jt === !0 || Jt === void 0 ? 1 : Jt || 0, Dr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ss = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : Ge) !== null && b !== void 0 ? b : !0,
      strictNumbers: (T = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ge) !== null && T !== void 0 ? T : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ge) !== null && V !== void 0 ? V : "log",
      strictTuples: (Le = (re = P.strictTuples) !== null && re !== void 0 ? re : Ge) !== null && Le !== void 0 ? Le : "log",
      strictRequired: (Ct = (At = P.strictRequired) !== null && At !== void 0 ? At : Ge) !== null && Ct !== void 0 ? Ct : !1,
      code: P.code ? { ...P.code, optimize: Cr, regExp: Dr } : { optimize: Cr, regExp: Dr },
      loopRequired: (Dt = P.loopRequired) !== null && Dt !== void 0 ? Dt : w,
      loopEnum: (Mt = P.loopEnum) !== null && Mt !== void 0 ? Mt : w,
      meta: (Lt = P.meta) !== null && Lt !== void 0 ? Lt : !0,
      messages: (Vt = P.messages) !== null && Vt !== void 0 ? Vt : !0,
      inlineRefs: (Ft = P.inlineRefs) !== null && Ft !== void 0 ? Ft : !0,
      schemaId: (zt = P.schemaId) !== null && zt !== void 0 ? zt : "$id",
      addUsedSchema: (Ut = P.addUsedSchema) !== null && Ut !== void 0 ? Ut : !0,
      validateSchema: (qt = P.validateSchema) !== null && qt !== void 0 ? qt : !0,
      validateFormats: (Gt = P.validateFormats) !== null && Gt !== void 0 ? Gt : !0,
      unicodeRegExp: (Kt = P.unicodeRegExp) !== null && Kt !== void 0 ? Kt : !0,
      int32range: (Ht = P.int32range) !== null && Ht !== void 0 ? Ht : !0,
      uriResolver: Ss
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, y, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && me.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), W.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: $ } = this.opts;
      let i = h;
      $ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[$], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let $;
      if (typeof p == "string") {
        if ($ = this.getSchema(p), !$)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        $ = this.compile(p);
      const i = $(S);
      return "$async" in $ || (this.errors = $.errors), i;
    }
    compile(p, S) {
      const $ = this._addSchema(p, S);
      return $.validate || this._compileSchemaEnv($);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: $ } = this.opts;
      return i.call(this, p, S);
      async function i(V, re) {
        await f.call(this, V.$schema);
        const Le = this._addSchema(V, re);
        return Le.validate || b.call(this, Le);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function b(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (re) {
          if (!(re instanceof s.default))
            throw re;
          return I.call(this, re), await T.call(this, re.missingSchema), b.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: re }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${re} cannot be resolved`);
      }
      async function T(V) {
        const re = await F.call(this, V);
        this.refs[V] || await f.call(this, re.$schema), this.refs[V] || this.addSchema(re, V, S);
      }
      async function F(V) {
        const re = this._loading[V];
        if (re)
          return re;
        try {
          return await (this._loading[V] = $(V));
        } finally {
          delete this._loading[V];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, $, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, c.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, $ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, $), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let $;
      if ($ = p.$schema, $ !== void 0 && typeof $ != "string")
        throw new Error("$schema must be a string");
      if ($ = $ || this.opts.defaultMeta || this.defaultMeta(), !$)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate($, p);
      if (!i && S) {
        const f = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(f);
        else
          throw new Error(f);
      }
      return i;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(p) {
      let S;
      for (; typeof (S = G.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: $ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: $ });
        if (S = o.resolveSchema.call(this, i, p), !S)
          return;
        this.refs[p] = S;
      }
      return S.validate || this._compileSchemaEnv(S);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(p) {
      if (p instanceof RegExp)
        return this._removeAllSchemas(this.schemas, p), this._removeAllSchemas(this.refs, p), this;
      switch (typeof p) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const S = G.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let $ = p[this.opts.schemaId];
          return $ && ($ = (0, c.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(p) {
      for (const S of p)
        this.addKeyword(S);
      return this;
    }
    addKeyword(p, S) {
      let $;
      if (typeof p == "string")
        $ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = $);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, $ = S.keyword, Array.isArray($) && !$.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, $, S), !S)
        return (0, u.eachItem)($, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)($, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((b) => k.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const $ of S.rules) {
        const i = $.rules.findIndex((f) => f.keyword === p);
        i >= 0 && $.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: $ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${$}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const $ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const I of f)
          b = b[I];
        for (const I in $) {
          const T = $[I];
          if (typeof T != "object")
            continue;
          const { $data: F } = T.definition, V = b[I];
          F && V && (b[I] = M(V));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const $ in p) {
        const i = p[$];
        (!S || S.test($)) && (typeof i == "string" ? delete p[$] : i && !i.meta && (this._cache.delete(i.schema), delete p[$]));
      }
    }
    _addSchema(p, S, $, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        b = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let T = this._cache.get(p);
      if (T !== void 0)
        return T;
      $ = (0, c.normalizeId)(b || $);
      const F = c.getSchemaRefs.call(this, p, $);
      return T = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(T.schema, T), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = T), i && this.validateSchema(p, !0), T;
    }
    _checkUnique(p) {
      if (this.schemas[p] || this.refs[p])
        throw new Error(`schema with key or id "${p}" already exists`);
    }
    _compileSchemaEnv(p) {
      if (p.meta ? this._compileMetaSchema(p) : o.compileSchema.call(this, p), !p.validate)
        throw new Error("ajv implementation error");
      return p.validate;
    }
    _compileMetaSchema(p) {
      const S = this.opts;
      this.opts = this._metaOpts;
      try {
        o.compileSchema.call(this, p);
      } finally {
        this.opts = S;
      }
    }
  }
  R.ValidationError = n.default, R.MissingRefError = s.default, e.default = R;
  function O(P, p, S, $ = "error") {
    for (const i in P) {
      const f = i;
      f in p && this.logger[$](`${S}: option ${i}. ${P[f]}`);
    }
  }
  function G(P) {
    return P = (0, c.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function W() {
    const P = this.opts.schemas;
    if (P)
      if (Array.isArray(P))
        this.addSchema(P);
      else
        for (const p in P)
          this.addSchema(P[p], p);
  }
  function de() {
    for (const P in this.opts.formats) {
      const p = this.opts.formats[P];
      p && this.addFormat(P, p);
    }
  }
  function me(P) {
    if (Array.isArray(P)) {
      this.addVocabulary(P);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in P) {
      const S = P[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function ye() {
    const P = { ...this.opts };
    for (const p of v)
      delete P[p];
    return P;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function H(P) {
    if (P === !1)
      return z;
    if (P === void 0)
      return console;
    if (P.log && P.warn && P.error)
      return P;
    throw new Error("logger must implement log, warn and error methods");
  }
  const ae = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(P, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!ae.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function k(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: T }) => T === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? L.call(this, b, I, p.before) : b.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((T) => this.addKeyword(T));
  }
  function L(P, p, S) {
    const $ = P.rules.findIndex((i) => i.keyword === S);
    $ >= 0 ? P.rules.splice($, 0, p) : (P.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function D(P) {
    let { metaSchema: p } = P;
    p !== void 0 && (P.$data && this.opts.$data && (p = M(p)), P.validateSchema = this.compile(p, !0));
  }
  const K = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function M(P) {
    return { anyOf: [P, K] };
  }
})(Yl);
var Oo = {}, Io = {}, jo = {};
Object.defineProperty(jo, "__esModule", { value: !0 });
const u_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
jo.default = u_;
var ar = {};
Object.defineProperty(ar, "__esModule", { value: !0 });
ar.callRef = ar.getValidate = void 0;
const d_ = jr, nc = te, De = x, lr = ot, sc = Me, wn = C, f_ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = sc.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new d_.default(n.opts.uriResolver, s, r);
    if (u instanceof sc.SchemaEnv)
      return E(u);
    return _(u);
    function h() {
      if (a === d)
        return Fn(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return Fn(e, (0, De._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = Iu(e, v);
      Fn(e, g, v, v.$async);
    }
    function _(v) {
      const g = t.scopeValue("schema", l.code.source === !0 ? { ref: v, code: (0, De.stringify)(v) } : { ref: v }), y = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: De.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function Iu(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, De._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
ar.getValidate = Iu;
function Fn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? lr.default.this : De.nil;
  n ? u() : h();
  function u() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, De._)`await ${(0, nc.callValidateCode)(e, t, d)}`), _(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, De._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), E(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, nc.callValidateCode)(e, t, d), () => _(t), () => E(t));
  }
  function E(v) {
    const g = (0, De._)`${v}.errors`;
    s.assign(lr.default.vErrors, (0, De._)`${lr.default.vErrors} === null ? ${g} : ${lr.default.vErrors}.concat(${g})`), s.assign(lr.default.errors, (0, De._)`${lr.default.vErrors}.length`);
  }
  function _(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = wn.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, De._)`${v}.evaluated.props`);
        a.props = wn.mergeEvaluated.props(s, m, a.props, De.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = wn.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, De._)`${v}.evaluated.items`);
        a.items = wn.mergeEvaluated.items(s, m, a.items, De.Name);
      }
  }
}
ar.callRef = Fn;
ar.default = f_;
Object.defineProperty(Io, "__esModule", { value: !0 });
const h_ = jo, m_ = ar, p_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  h_.default,
  m_.default
];
Io.default = p_;
var To = {}, ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const xn = x, St = xn.operators, es = {
  maximum: { okStr: "<=", ok: St.LTE, fail: St.GT },
  minimum: { okStr: ">=", ok: St.GTE, fail: St.LT },
  exclusiveMaximum: { okStr: "<", ok: St.LT, fail: St.GTE },
  exclusiveMinimum: { okStr: ">", ok: St.GT, fail: St.LTE }
}, $_ = {
  message: ({ keyword: e, schemaCode: t }) => (0, xn.str)`must be ${es[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, xn._)`{comparison: ${es[e].okStr}, limit: ${t}}`
}, y_ = {
  keyword: Object.keys(es),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: $_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, xn._)`${r} ${es[t].fail} ${n} || isNaN(${r})`);
  }
};
ko.default = y_;
var Ao = {};
Object.defineProperty(Ao, "__esModule", { value: !0 });
const en = x, g_ = {
  message: ({ schemaCode: e }) => (0, en.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, en._)`{multipleOf: ${e}}`
}, __ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: g_,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, en._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, en._)`${o} !== parseInt(${o})`;
    e.fail$data((0, en._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Ao.default = __;
var Co = {}, Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
function ju(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Do.default = ju;
ju.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Co, "__esModule", { value: !0 });
const er = x, v_ = C, w_ = Do, E_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, er.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, er._)`{limit: ${e}}`
}, b_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: E_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? er.operators.GT : er.operators.LT, o = s.opts.unicode === !1 ? (0, er._)`${r}.length` : (0, er._)`${(0, v_.useFunc)(e.gen, w_.default)}(${r})`;
    e.fail$data((0, er._)`${o} ${a} ${n}`);
  }
};
Co.default = b_;
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const S_ = te, ts = x, P_ = {
  message: ({ schemaCode: e }) => (0, ts.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, ts._)`{pattern: ${e}}`
}, N_ = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: P_,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, ts._)`(new RegExp(${s}, ${o}))` : (0, S_.usePattern)(e, n);
    e.fail$data((0, ts._)`!${l}.test(${t})`);
  }
};
Mo.default = N_;
var Lo = {};
Object.defineProperty(Lo, "__esModule", { value: !0 });
const tn = x, R_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, tn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, tn._)`{limit: ${e}}`
}, O_ = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: R_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? tn.operators.GT : tn.operators.LT;
    e.fail$data((0, tn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Lo.default = O_;
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const Gr = te, rn = x, I_ = C, j_ = {
  message: ({ params: { missingProperty: e } }) => (0, rn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, rn._)`{missingProperty: ${e}}`
}, T_ = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: j_,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: l } = o;
    if (!a && r.length === 0)
      return;
    const c = r.length >= l.loopRequired;
    if (o.allErrors ? d() : u(), l.strictRequired) {
      const _ = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const g of r)
        if ((_ == null ? void 0 : _[g]) === void 0 && !v.has(g)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${y}" (strictRequired)`;
          (0, I_.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(rn.nil, h);
      else
        for (const _ of r)
          (0, Gr.checkReportMissingProp)(e, _);
    }
    function u() {
      const _ = t.let("missing");
      if (c || a) {
        const v = t.let("valid", !0);
        e.block$data(v, () => E(_, v)), e.ok(v);
      } else
        t.if((0, Gr.checkMissingProp)(e, r, _)), (0, Gr.reportMissingProp)(e, _), t.else();
    }
    function h() {
      t.forOf("prop", n, (_) => {
        e.setParams({ missingProperty: _ }), t.if((0, Gr.noPropertyInData)(t, s, _, l.ownProperties), () => e.error());
      });
    }
    function E(_, v) {
      e.setParams({ missingProperty: _ }), t.forOf(_, n, () => {
        t.assign(v, (0, Gr.propertyInData)(t, s, _, l.ownProperties)), t.if((0, rn.not)(v), () => {
          e.error(), t.break();
        });
      }, rn.nil);
    }
  }
};
Vo.default = T_;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const nn = x, k_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, nn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, nn._)`{limit: ${e}}`
}, A_ = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: k_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? nn.operators.GT : nn.operators.LT;
    e.fail$data((0, nn._)`${r}.length ${s} ${n}`);
  }
};
Fo.default = A_;
var zo = {}, hn = {};
Object.defineProperty(hn, "__esModule", { value: !0 });
const Tu = is;
Tu.code = 'require("ajv/dist/runtime/equal").default';
hn.default = Tu;
Object.defineProperty(zo, "__esModule", { value: !0 });
const Ms = _e, Ee = x, C_ = C, D_ = hn, M_ = {
  message: ({ params: { i: e, j: t } }) => (0, Ee.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Ee._)`{i: ${e}, j: ${t}}`
}, L_ = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: M_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, Ms.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, Ee._)`${o} === false`), e.ok(c);
    function u() {
      const v = t.let("i", (0, Ee._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(c, !0), t.if((0, Ee._)`${v} > 1`, () => (h() ? E : _)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function E(v, g) {
      const y = t.name("item"), m = (0, Ms.checkDataTypes)(d, y, l.opts.strictNumbers, Ms.DataType.Wrong), w = t.const("indices", (0, Ee._)`{}`);
      t.for((0, Ee._)`;${v}--;`, () => {
        t.let(y, (0, Ee._)`${r}[${v}]`), t.if(m, (0, Ee._)`continue`), d.length > 1 && t.if((0, Ee._)`typeof ${y} == "string"`, (0, Ee._)`${y} += "_"`), t.if((0, Ee._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(g, (0, Ee._)`${w}[${y}]`), e.error(), t.assign(c, !1).break();
        }).code((0, Ee._)`${w}[${y}] = ${v}`);
      });
    }
    function _(v, g) {
      const y = (0, C_.useFunc)(t, D_.default), m = t.name("outer");
      t.label(m).for((0, Ee._)`;${v}--;`, () => t.for((0, Ee._)`${g} = ${v}; ${g}--;`, () => t.if((0, Ee._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
zo.default = L_;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const aa = x, V_ = C, F_ = hn, z_ = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, aa._)`{allowedValue: ${e}}`
}, U_ = {
  keyword: "const",
  $data: !0,
  error: z_,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, aa._)`!${(0, V_.useFunc)(t, F_.default)}(${r}, ${s})`) : e.fail((0, aa._)`${a} !== ${r}`);
  }
};
Uo.default = U_;
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const Br = x, q_ = C, G_ = hn, K_ = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Br._)`{allowedValues: ${e}}`
}, H_ = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: K_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, q_.useFunc)(t, G_.default));
    let u;
    if (l || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const _ = t.const("vSchema", a);
      u = (0, Br.or)(...s.map((v, g) => E(_, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (_) => t.if((0, Br._)`${d()}(${r}, ${_})`, () => t.assign(u, !0).break()));
    }
    function E(_, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, Br._)`${d()}(${r}, ${_}[${v}])` : (0, Br._)`${r} === ${g}`;
    }
  }
};
qo.default = H_;
Object.defineProperty(To, "__esModule", { value: !0 });
const J_ = ko, B_ = Ao, W_ = Co, X_ = Mo, Y_ = Lo, Q_ = Vo, Z_ = Fo, x_ = zo, ev = Uo, tv = qo, rv = [
  // number
  J_.default,
  B_.default,
  // string
  W_.default,
  X_.default,
  // object
  Y_.default,
  Q_.default,
  // array
  Z_.default,
  x_.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  ev.default,
  tv.default
];
To.default = rv;
var Go = {}, Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
Tr.validateAdditionalItems = void 0;
const tr = x, oa = C, nv = {
  message: ({ params: { len: e } }) => (0, tr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, tr._)`{limit: ${e}}`
}, sv = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: nv,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, oa.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    ku(e, n);
  }
};
function ku(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, tr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, tr._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, oa.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, tr._)`${l} <= ${t.length}`);
    r.if((0, tr.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, l, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: oa.Type.Num }, d), o.allErrors || r.if((0, tr.not)(d), () => r.break());
    });
  }
}
Tr.validateAdditionalItems = ku;
Tr.default = sv;
var Ko = {}, kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.validateTuple = void 0;
const ac = x, zn = C, av = te, ov = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Au(e, "additionalItems", t);
    r.items = !0, !(0, zn.alwaysValidSchema)(r, t) && e.ok((0, av.validateArray)(e));
  }
};
function Au(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = zn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, ac._)`${a}.length`);
  r.forEach((h, E) => {
    (0, zn.alwaysValidSchema)(l, h) || (n.if((0, ac._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: _ } = l, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (E.strictTuples && !g) {
      const y = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${_}"`;
      (0, zn.checkStrictMode)(l, y, E.strictTuples);
    }
  }
}
kr.validateTuple = Au;
kr.default = ov;
Object.defineProperty(Ko, "__esModule", { value: !0 });
const iv = kr, cv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, iv.validateTuple)(e, "items")
};
Ko.default = cv;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const oc = x, lv = C, uv = te, dv = Tr, fv = {
  message: ({ params: { len: e } }) => (0, oc.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, oc._)`{limit: ${e}}`
}, hv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: fv,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, lv.alwaysValidSchema)(n, t) && (s ? (0, dv.validateAdditionalItems)(e, s) : e.ok((0, uv.validateArray)(e)));
  }
};
Ho.default = hv;
var Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const qe = x, En = C, mv = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe.str)`must contain at least ${e} valid item(s)` : (0, qe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe._)`{minContains: ${e}}` : (0, qe._)`{minContains: ${e}, maxContains: ${t}}`
}, pv = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: mv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, l = d) : o = 1;
    const u = t.const("len", (0, qe._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, En.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, En.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, En.alwaysValidSchema)(a, r)) {
      let g = (0, qe._)`${u} >= ${o}`;
      l !== void 0 && (g = (0, qe._)`${g} && ${u} <= ${l}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    l === void 0 && o === 1 ? _(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), l !== void 0 && t.if((0, qe._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const g = t.name("_valid"), y = t.let("count", 0);
      _(g, () => t.if(g, () => v(y)));
    }
    function _(g, y) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: En.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function v(g) {
      t.code((0, qe._)`${g}++`), l === void 0 ? t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, qe._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Jo.default = pv;
var Cu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = x, r = C, n = te;
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
      o(c, d), l(c, u);
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
  function o(c, d = c.schema) {
    const { gen: u, data: h, it: E } = c;
    if (Object.keys(d).length === 0)
      return;
    const _ = u.let("missing");
    for (const v in d) {
      const g = d[v];
      if (g.length === 0)
        continue;
      const y = (0, n.propertyInData)(u, h, v, E.opts.ownProperties);
      c.setParams({
        property: v,
        depsCount: g.length,
        deps: g.join(", ")
      }), E.allErrors ? u.if(y, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(c, m);
      }) : (u.if((0, t._)`${y} && (${(0, n.checkMissingProp)(c, g, _)})`), (0, n.reportMissingProp)(c, _), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function l(c, d = c.schema) {
    const { gen: u, data: h, keyword: E, it: _ } = c, v = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(_, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, _.opts.ownProperties),
        () => {
          const y = c.subschema({ keyword: E, schemaProp: g }, v);
          c.mergeValidEvaluated(y, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), c.ok(v));
  }
  e.validateSchemaDeps = l, e.default = s;
})(Cu);
var Bo = {};
Object.defineProperty(Bo, "__esModule", { value: !0 });
const Du = x, $v = C, yv = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Du._)`{propertyName: ${e.propertyName}}`
}, gv = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: yv,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, $v.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Du.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Bo.default = gv;
var ys = {};
Object.defineProperty(ys, "__esModule", { value: !0 });
const bn = te, Be = x, _v = ot, Sn = C, vv = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Be._)`{additionalProperty: ${e.additionalProperty}}`
}, wv = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: vv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, Sn.alwaysValidSchema)(o, r))
      return;
    const d = (0, bn.allSchemaProperties)(n.properties), u = (0, bn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Be._)`${a} === ${_v.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(E(y), () => v(y));
      });
    }
    function E(y) {
      let m;
      if (d.length > 8) {
        const w = (0, Sn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, bn.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, Be.or)(...d.map((w) => (0, Be._)`${y} === ${w}`)) : m = Be.nil;
      return u.length && (m = (0, Be.or)(m, ...u.map((w) => (0, Be._)`${(0, bn.usePattern)(e, w)}.test(${y})`))), (0, Be.not)(m);
    }
    function _(y) {
      t.code((0, Be._)`delete ${s}[${y}]`);
    }
    function v(y) {
      if (c.removeAdditional === "all" || c.removeAdditional && r === !1) {
        _(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, Sn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        c.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, Be.not)(m), () => {
          e.reset(), _(y);
        })) : (g(y, m), l || t.if((0, Be.not)(m), () => t.break()));
      }
    }
    function g(y, m, w) {
      const N = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: Sn.Type.Str
      };
      w === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
ys.default = wv;
var Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
const Ev = Qe, ic = te, Ls = C, cc = ys, bv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && cc.default.code(new Ev.KeywordCxt(a, cc.default, "additionalProperties"));
    const o = (0, ic.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ls.mergeEvaluated.props(t, (0, Ls.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Ls.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const c = t.name("valid");
    for (const h of l)
      d(h) ? u(h) : (t.if((0, ic.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
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
Wo.default = bv;
var Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const lc = te, Pn = x, uc = C, dc = C, Sv = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, lc.allSchemaProperties)(r), c = l.filter((g) => (0, uc.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof Pn.Name) && (a.props = (0, dc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const g of l)
        d && _(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, uc.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, (y) => {
        t.if((0, Pn._)`${(0, lc.usePattern)(e, g)}.test(${y})`, () => {
          const m = c.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: dc.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, Pn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, Pn.not)(u), () => t.break());
        });
      });
    }
  }
};
Xo.default = Sv;
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const Pv = C, Nv = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Pv.alwaysValidSchema)(n, r)) {
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
Yo.default = Nv;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const Rv = te, Ov = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Rv.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Qo.default = Ov;
var Zo = {};
Object.defineProperty(Zo, "__esModule", { value: !0 });
const Un = x, Iv = C, jv = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Un._)`{passingSchemas: ${e.passing}}`
}, Tv = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: jv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), c = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, Iv.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, Un._)`${c} && ${o}`).assign(o, !1).assign(l, (0, Un._)`[${l}, ${h}]`).else(), t.if(c, () => {
          t.assign(o, !0), t.assign(l, h), E && e.mergeEvaluated(E, Un.Name);
        });
      });
    }
  }
};
Zo.default = Tv;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const kv = C, Av = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, kv.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
xo.default = Av;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const rs = x, Mu = C, Cv = {
  message: ({ params: e }) => (0, rs.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, rs._)`{failingKeyword: ${e.ifClause}}`
}, Dv = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Cv,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Mu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = fc(n, "then"), a = fc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(l, d("then", u), d("else", u));
    } else s ? t.if(l, d("then")) : t.if((0, rs.not)(l), d("else"));
    e.pass(o, () => e.error(!0));
    function c() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, l);
        t.assign(o, l), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, rs._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function fc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Mu.alwaysValidSchema)(e, r);
}
ei.default = Dv;
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
const Mv = C, Lv = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Mv.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
ti.default = Lv;
Object.defineProperty(Go, "__esModule", { value: !0 });
const Vv = Tr, Fv = Ko, zv = kr, Uv = Ho, qv = Jo, Gv = Cu, Kv = Bo, Hv = ys, Jv = Wo, Bv = Xo, Wv = Yo, Xv = Qo, Yv = Zo, Qv = xo, Zv = ei, xv = ti;
function ew(e = !1) {
  const t = [
    // any
    Wv.default,
    Xv.default,
    Yv.default,
    Qv.default,
    Zv.default,
    xv.default,
    // object
    Kv.default,
    Hv.default,
    Gv.default,
    Jv.default,
    Bv.default
  ];
  return e ? t.push(Fv.default, Uv.default) : t.push(Vv.default, zv.default), t.push(qv.default), t;
}
Go.default = ew;
var ri = {}, ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 });
const $e = x, tw = {
  message: ({ schemaCode: e }) => (0, $e.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, $e._)`{format: ${e}}`
}, rw = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: tw,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: l } = e, { opts: c, errSchemaPath: d, schemaEnv: u, self: h } = l;
    if (!c.validateFormats)
      return;
    s ? E() : _();
    function E() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: c.code.formats
      }), g = r.const("fDef", (0, $e._)`${v}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, $e._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(y, (0, $e._)`${g}.type || "string"`).assign(m, (0, $e._)`${g}.validate`), () => r.assign(y, (0, $e._)`"string"`).assign(m, g)), e.fail$data((0, $e.or)(w(), N()));
      function w() {
        return c.strictSchema === !1 ? $e.nil : (0, $e._)`${o} && !${m}`;
      }
      function N() {
        const R = u.$async ? (0, $e._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, $e._)`${m}(${n})`, O = (0, $e._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, $e._)`${m} && ${m} !== true && ${y} === ${t} && !${O}`;
      }
    }
    function _() {
      const v = h.formats[a];
      if (!v) {
        w();
        return;
      }
      if (v === !0)
        return;
      const [g, y, m] = N(v);
      g === t && e.pass(R());
      function w() {
        if (c.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const G = O instanceof RegExp ? (0, $e.regexpCode)(O) : c.code.formats ? (0, $e._)`${c.code.formats}${(0, $e.getProperty)(a)}` : void 0, W = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, $e._)`${W}.validate`] : ["string", O, W];
      }
      function R() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, $e._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, $e._)`${m}(${n})` : (0, $e._)`${m}.test(${n})`;
      }
    }
  }
};
ni.default = rw;
Object.defineProperty(ri, "__esModule", { value: !0 });
const nw = ni, sw = [nw.default];
ri.default = sw;
var Sr = {};
Object.defineProperty(Sr, "__esModule", { value: !0 });
Sr.contentVocabulary = Sr.metadataVocabulary = void 0;
Sr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Sr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Oo, "__esModule", { value: !0 });
const aw = Io, ow = To, iw = Go, cw = ri, hc = Sr, lw = [
  aw.default,
  ow.default,
  (0, iw.default)(),
  cw.default,
  hc.metadataVocabulary,
  hc.contentVocabulary
];
Oo.default = lw;
var si = {}, gs = {};
Object.defineProperty(gs, "__esModule", { value: !0 });
gs.DiscrError = void 0;
var mc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(mc || (gs.DiscrError = mc = {}));
Object.defineProperty(si, "__esModule", { value: !0 });
const mr = x, ia = gs, pc = Me, uw = jr, dw = C, fw = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ia.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, mr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, hw = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: fw,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const l = n.propertyName;
    if (typeof l != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const c = t.let("valid", !1), d = t.const("tag", (0, mr._)`${r}${(0, mr.getProperty)(l)}`);
    t.if((0, mr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: ia.DiscrError.Tag, tag: d, tagName: l })), e.ok(c);
    function u() {
      const _ = E();
      t.if(!1);
      for (const v in _)
        t.elseIf((0, mr._)`${d} === ${v}`), t.assign(c, h(_[v]));
      t.else(), e.error(!1, { discrError: ia.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(_) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: _ }, v);
      return e.mergeEvaluated(g, mr.Name), v;
    }
    function E() {
      var _;
      const v = {}, g = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, dw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const W = O.$ref;
          if (O = pc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, W), O instanceof pc.SchemaEnv && (O = O.schema), O === void 0)
            throw new uw.default(a.opts.uriResolver, a.baseId, W);
        }
        const G = (_ = O == null ? void 0 : O.properties) === null || _ === void 0 ? void 0 : _[l];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        y = y && (g || m(O)), w(G, R);
      }
      if (!y)
        throw new Error(`discriminator: "${l}" must be required`);
      return v;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(l);
      }
      function w(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const G of R.enum)
            N(G, O);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in v)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        v[R] = O;
      }
    }
  }
};
si.default = hw;
const mw = "http://json-schema.org/draft-07/schema#", pw = "http://json-schema.org/draft-07/schema#", $w = "Core schema meta-schema", yw = {
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
}, gw = [
  "object",
  "boolean"
], _w = {
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
}, vw = {
  $schema: mw,
  $id: pw,
  title: $w,
  definitions: yw,
  type: gw,
  properties: _w,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = Yl, n = Oo, s = si, a = vw, o = ["/properties"], l = "http://json-schema.org/draft-07/schema";
  class c extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((v) => this.addVocabulary(v)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const v = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(v, l, !1), this.refs["http://json-schema.org/schema"] = l;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
    }
  }
  t.Ajv = c, e.exports = t = c, e.exports.Ajv = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var d = Qe;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = x;
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
  var h = fn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var E = jr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
})(ea, ea.exports);
var ww = ea.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = ww, r = x, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: l, schemaCode: c }) => (0, r.str)`should be ${s[l].okStr} ${c}`,
    params: ({ keyword: l, schemaCode: c }) => (0, r._)`{comparison: ${s[l].okStr}, limit: ${c}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(l) {
      const { gen: c, data: d, schemaCode: u, keyword: h, it: E } = l, { opts: _, self: v } = E;
      if (!_.validateFormats)
        return;
      const g = new t.KeywordCxt(E, v.RULES.all.format.definition, "format");
      g.$data ? y() : m();
      function y() {
        const N = c.scopeValue("formats", {
          ref: v.formats,
          code: _.code.formats
        }), R = c.const("fmt", (0, r._)`${N}[${g.schemaCode}]`);
        l.fail$data((0, r.or)((0, r._)`typeof ${R} != "object"`, (0, r._)`${R} instanceof RegExp`, (0, r._)`typeof ${R}.compare != "function"`, w(R)));
      }
      function m() {
        const N = g.schema, R = v.formats[N];
        if (!R || R === !0)
          return;
        if (typeof R != "object" || R instanceof RegExp || typeof R.compare != "function")
          throw new Error(`"${h}": format "${N}" does not define "compare" function`);
        const O = c.scopeValue("formats", {
          key: N,
          ref: R,
          code: _.code.formats ? (0, r._)`${_.code.formats}${(0, r.getProperty)(N)}` : void 0
        });
        l.fail$data(w(O));
      }
      function w(N) {
        return (0, r._)`${N}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (l) => (l.addKeyword(e.formatLimitDefinition), l);
  e.default = o;
})(Xl);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Wl, n = Xl, s = x, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), l = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return c(d, u, r.fullFormats, a), d;
    const [h, E] = u.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], _ = u.formats || r.formatNames;
    return c(d, _, h, E), u.keywords && (0, n.default)(d), d;
  };
  l.get = (d, u = "full") => {
    const E = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!E)
      throw new Error(`Unknown format "${d}"`);
    return E;
  };
  function c(d, u, h, E) {
    var _, v;
    (_ = (v = d.opts.code).formats) !== null && _ !== void 0 || (v.formats = (0, s._)`require("ajv-formats/dist/formats").${E}`);
    for (const g of u)
      d.addFormat(g, h[g]);
  }
  e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
})(xs, xs.exports);
var Ew = xs.exports;
const bw = /* @__PURE__ */ Wc(Ew), Sw = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !Pw(s, a) && n || Object.defineProperty(e, r, a);
}, Pw = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Nw = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, Rw = (e, t) => `/* Wrapped ${e}*/
${t}`, Ow = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Iw = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), jw = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = Rw.bind(null, n, t.toString());
  Object.defineProperty(s, "name", Iw);
  const { writable: a, enumerable: o, configurable: l } = Ow;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: l });
};
function Tw(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Sw(e, t, s, r);
  return Nw(e, t), jw(e, t, n), e;
}
const $c = (e, t = {}) => {
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
  let o, l, c;
  const d = function(...u) {
    const h = this, E = () => {
      o = void 0, l && (clearTimeout(l), l = void 0), a && (c = e.apply(h, u));
    }, _ = () => {
      l = void 0, o && (clearTimeout(o), o = void 0), a && (c = e.apply(h, u));
    }, v = s && !o;
    return clearTimeout(o), o = setTimeout(E, r), n > 0 && n !== Number.POSITIVE_INFINITY && !l && (l = setTimeout(_, n)), v && (c = e.apply(h, u)), c;
  };
  return Tw(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), l && (clearTimeout(l), l = void 0);
  }, d;
};
var ca = { exports: {} };
const kw = "2.0.0", Lu = 256, Aw = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Cw = 16, Dw = Lu - 6, Mw = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var _s = {
  MAX_LENGTH: Lu,
  MAX_SAFE_COMPONENT_LENGTH: Cw,
  MAX_SAFE_BUILD_LENGTH: Dw,
  MAX_SAFE_INTEGER: Aw,
  RELEASE_TYPES: Mw,
  SEMVER_SPEC_VERSION: kw,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Lw = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var vs = Lw;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = _s, a = vs;
  t = e.exports = {};
  const o = t.re = [], l = t.safeRe = [], c = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const E = "[a-zA-Z0-9-]", _ = [
    ["\\s", 1],
    ["\\d", s],
    [E, n]
  ], v = (y) => {
    for (const [m, w] of _)
      y = y.split(`${m}*`).join(`${m}{0,${w}}`).split(`${m}+`).join(`${m}{1,${w}}`);
    return y;
  }, g = (y, m, w) => {
    const N = v(m), R = h++;
    a(y, R, m), u[y] = R, c[R] = m, d[R] = N, o[R] = new RegExp(m, w ? "g" : void 0), l[R] = new RegExp(N, w ? "g" : void 0);
  };
  g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${E}*`), g("MAINVERSION", `(${c[u.NUMERICIDENTIFIER]})\\.(${c[u.NUMERICIDENTIFIER]})\\.(${c[u.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${c[u.NUMERICIDENTIFIERLOOSE]})\\.(${c[u.NUMERICIDENTIFIERLOOSE]})\\.(${c[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${c[u.NONNUMERICIDENTIFIER]}|${c[u.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${c[u.NONNUMERICIDENTIFIER]}|${c[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${c[u.PRERELEASEIDENTIFIER]}(?:\\.${c[u.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${c[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${c[u.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${E}+`), g("BUILD", `(?:\\+(${c[u.BUILDIDENTIFIER]}(?:\\.${c[u.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${c[u.MAINVERSION]}${c[u.PRERELEASE]}?${c[u.BUILD]}?`), g("FULL", `^${c[u.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${c[u.MAINVERSIONLOOSE]}${c[u.PRERELEASELOOSE]}?${c[u.BUILD]}?`), g("LOOSE", `^${c[u.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${c[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${c[u.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${c[u.XRANGEIDENTIFIER]})(?:\\.(${c[u.XRANGEIDENTIFIER]})(?:\\.(${c[u.XRANGEIDENTIFIER]})(?:${c[u.PRERELEASE]})?${c[u.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${c[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${c[u.XRANGEIDENTIFIERLOOSE]})(?:${c[u.PRERELEASELOOSE]})?${c[u.BUILD]}?)?)?`), g("XRANGE", `^${c[u.GTLT]}\\s*${c[u.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${c[u.GTLT]}\\s*${c[u.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), g("COERCE", `${c[u.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", c[u.COERCEPLAIN] + `(?:${c[u.PRERELEASE]})?(?:${c[u.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", c[u.COERCE], !0), g("COERCERTLFULL", c[u.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${c[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", g("TILDE", `^${c[u.LONETILDE]}${c[u.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${c[u.LONETILDE]}${c[u.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${c[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", g("CARET", `^${c[u.LONECARET]}${c[u.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${c[u.LONECARET]}${c[u.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${c[u.GTLT]}\\s*(${c[u.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${c[u.GTLT]}\\s*(${c[u.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${c[u.GTLT]}\\s*(${c[u.LOOSEPLAIN]}|${c[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${c[u.XRANGEPLAIN]})\\s+-\\s+(${c[u.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${c[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${c[u.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(ca, ca.exports);
var mn = ca.exports;
const Vw = Object.freeze({ loose: !0 }), Fw = Object.freeze({}), zw = (e) => e ? typeof e != "object" ? Vw : e : Fw;
var ai = zw;
const yc = /^[0-9]+$/, Vu = (e, t) => {
  const r = yc.test(e), n = yc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, Uw = (e, t) => Vu(t, e);
var Fu = {
  compareIdentifiers: Vu,
  rcompareIdentifiers: Uw
};
const Nn = vs, { MAX_LENGTH: gc, MAX_SAFE_INTEGER: Rn } = _s, { safeRe: On, t: In } = mn, qw = ai, { compareIdentifiers: ur } = Fu;
let Gw = class et {
  constructor(t, r) {
    if (r = qw(r), t instanceof et) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > gc)
      throw new TypeError(
        `version is longer than ${gc} characters`
      );
    Nn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? On[In.LOOSE] : On[In.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > Rn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > Rn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > Rn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < Rn)
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
    if (Nn("SemVer.compare", this.version, this.options, t), !(t instanceof et)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new et(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof et || (t = new et(t, this.options)), ur(this.major, t.major) || ur(this.minor, t.minor) || ur(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof et || (t = new et(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (Nn("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return ur(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof et || (t = new et(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (Nn("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return ur(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? On[In.PRERELEASELOOSE] : On[In.PRERELEASE]);
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
          n === !1 && (a = [r]), ur(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ae = Gw;
const _c = Ae, Kw = (e, t, r = !1) => {
  if (e instanceof _c)
    return e;
  try {
    return new _c(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Ar = Kw;
const Hw = Ar, Jw = (e, t) => {
  const r = Hw(e, t);
  return r ? r.version : null;
};
var Bw = Jw;
const Ww = Ar, Xw = (e, t) => {
  const r = Ww(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Yw = Xw;
const vc = Ae, Qw = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new vc(
      e instanceof vc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var Zw = Qw;
const wc = Ar, xw = (e, t) => {
  const r = wc(e, null, !0), n = wc(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, l = a ? n : r, c = !!o.prerelease.length;
  if (!!l.prerelease.length && !c) {
    if (!l.patch && !l.minor)
      return "major";
    if (l.compareMain(o) === 0)
      return l.minor && !l.patch ? "minor" : "patch";
  }
  const u = c ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var eE = xw;
const tE = Ae, rE = (e, t) => new tE(e, t).major;
var nE = rE;
const sE = Ae, aE = (e, t) => new sE(e, t).minor;
var oE = aE;
const iE = Ae, cE = (e, t) => new iE(e, t).patch;
var lE = cE;
const uE = Ar, dE = (e, t) => {
  const r = uE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var fE = dE;
const Ec = Ae, hE = (e, t, r) => new Ec(e, r).compare(new Ec(t, r));
var Ze = hE;
const mE = Ze, pE = (e, t, r) => mE(t, e, r);
var $E = pE;
const yE = Ze, gE = (e, t) => yE(e, t, !0);
var _E = gE;
const bc = Ae, vE = (e, t, r) => {
  const n = new bc(e, r), s = new bc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var oi = vE;
const wE = oi, EE = (e, t) => e.sort((r, n) => wE(r, n, t));
var bE = EE;
const SE = oi, PE = (e, t) => e.sort((r, n) => SE(n, r, t));
var NE = PE;
const RE = Ze, OE = (e, t, r) => RE(e, t, r) > 0;
var ws = OE;
const IE = Ze, jE = (e, t, r) => IE(e, t, r) < 0;
var ii = jE;
const TE = Ze, kE = (e, t, r) => TE(e, t, r) === 0;
var zu = kE;
const AE = Ze, CE = (e, t, r) => AE(e, t, r) !== 0;
var Uu = CE;
const DE = Ze, ME = (e, t, r) => DE(e, t, r) >= 0;
var ci = ME;
const LE = Ze, VE = (e, t, r) => LE(e, t, r) <= 0;
var li = VE;
const FE = zu, zE = Uu, UE = ws, qE = ci, GE = ii, KE = li, HE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return FE(e, r, n);
    case "!=":
      return zE(e, r, n);
    case ">":
      return UE(e, r, n);
    case ">=":
      return qE(e, r, n);
    case "<":
      return GE(e, r, n);
    case "<=":
      return KE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var qu = HE;
const JE = Ae, BE = Ar, { safeRe: jn, t: Tn } = mn, WE = (e, t) => {
  if (e instanceof JE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? jn[Tn.COERCEFULL] : jn[Tn.COERCE]);
  else {
    const c = t.includePrerelease ? jn[Tn.COERCERTLFULL] : jn[Tn.COERCERTL];
    let d;
    for (; (d = c.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), c.lastIndex = d.index + d[1].length + d[2].length;
    c.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", l = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return BE(`${n}.${s}.${a}${o}${l}`, t);
};
var XE = WE;
class YE {
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
var QE = YE, Vs, Sc;
function xe() {
  if (Sc) return Vs;
  Sc = 1;
  const e = /\s+/g;
  class t {
    constructor(k, L) {
      if (L = s(L), k instanceof t)
        return k.loose === !!L.loose && k.includePrerelease === !!L.includePrerelease ? k : new t(k.raw, L);
      if (k instanceof a)
        return this.raw = k.value, this.set = [[k]], this.formatted = void 0, this;
      if (this.options = L, this.loose = !!L.loose, this.includePrerelease = !!L.includePrerelease, this.raw = k.trim().replace(e, " "), this.set = this.raw.split("||").map((D) => this.parseRange(D.trim())).filter((D) => D.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const D = this.set[0];
        if (this.set = this.set.filter((K) => !g(K[0])), this.set.length === 0)
          this.set = [D];
        else if (this.set.length > 1) {
          for (const K of this.set)
            if (K.length === 1 && y(K[0])) {
              this.set = [K];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let k = 0; k < this.set.length; k++) {
          k > 0 && (this.formatted += "||");
          const L = this.set[k];
          for (let D = 0; D < L.length; D++)
            D > 0 && (this.formatted += " "), this.formatted += L[D].toString().trim();
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
    parseRange(k) {
      const D = ((this.options.includePrerelease && _) | (this.options.loose && v)) + ":" + k, K = n.get(D);
      if (K)
        return K;
      const M = this.options.loose, P = M ? c[d.HYPHENRANGELOOSE] : c[d.HYPHENRANGE];
      k = k.replace(P, H(this.options.includePrerelease)), o("hyphen replace", k), k = k.replace(c[d.COMPARATORTRIM], u), o("comparator trim", k), k = k.replace(c[d.TILDETRIM], h), o("tilde trim", k), k = k.replace(c[d.CARETTRIM], E), o("caret trim", k);
      let p = k.split(" ").map((f) => w(f, this.options)).join(" ").split(/\s+/).map((f) => z(f, this.options));
      M && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(c[d.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), $ = p.map((f) => new a(f, this.options));
      for (const f of $) {
        if (g(f))
          return [f];
        S.set(f.value, f);
      }
      S.size > 1 && S.has("") && S.delete("");
      const i = [...S.values()];
      return n.set(D, i), i;
    }
    intersects(k, L) {
      if (!(k instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((D) => m(D, L) && k.set.some((K) => m(K, L) && D.every((M) => K.every((P) => M.intersects(P, L)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(k) {
      if (!k)
        return !1;
      if (typeof k == "string")
        try {
          k = new l(k, this.options);
        } catch {
          return !1;
        }
      for (let L = 0; L < this.set.length; L++)
        if (ae(this.set[L], k, this.options))
          return !0;
      return !1;
    }
  }
  Vs = t;
  const r = QE, n = new r(), s = ai, a = Es(), o = vs, l = Ae, {
    safeRe: c,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: E
  } = mn, { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: v } = _s, g = (j) => j.value === "<0.0.0-0", y = (j) => j.value === "", m = (j, k) => {
    let L = !0;
    const D = j.slice();
    let K = D.pop();
    for (; L && D.length; )
      L = D.every((M) => K.intersects(M, k)), K = D.pop();
    return L;
  }, w = (j, k) => (o("comp", j, k), j = G(j, k), o("caret", j), j = R(j, k), o("tildes", j), j = de(j, k), o("xrange", j), j = ye(j, k), o("stars", j), j), N = (j) => !j || j.toLowerCase() === "x" || j === "*", R = (j, k) => j.trim().split(/\s+/).map((L) => O(L, k)).join(" "), O = (j, k) => {
    const L = k.loose ? c[d.TILDELOOSE] : c[d.TILDE];
    return j.replace(L, (D, K, M, P, p) => {
      o("tilde", j, D, K, M, P, p);
      let S;
      return N(K) ? S = "" : N(M) ? S = `>=${K}.0.0 <${+K + 1}.0.0-0` : N(P) ? S = `>=${K}.${M}.0 <${K}.${+M + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${K}.${M}.${P}-${p} <${K}.${+M + 1}.0-0`) : S = `>=${K}.${M}.${P} <${K}.${+M + 1}.0-0`, o("tilde return", S), S;
    });
  }, G = (j, k) => j.trim().split(/\s+/).map((L) => W(L, k)).join(" "), W = (j, k) => {
    o("caret", j, k);
    const L = k.loose ? c[d.CARETLOOSE] : c[d.CARET], D = k.includePrerelease ? "-0" : "";
    return j.replace(L, (K, M, P, p, S) => {
      o("caret", j, K, M, P, p, S);
      let $;
      return N(M) ? $ = "" : N(P) ? $ = `>=${M}.0.0${D} <${+M + 1}.0.0-0` : N(p) ? M === "0" ? $ = `>=${M}.${P}.0${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.0${D} <${+M + 1}.0.0-0` : S ? (o("replaceCaret pr", S), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}-${S} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}-${S} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p}-${S} <${+M + 1}.0.0-0`) : (o("no pr"), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}${D} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p} <${+M + 1}.0.0-0`), o("caret return", $), $;
    });
  }, de = (j, k) => (o("replaceXRanges", j, k), j.split(/\s+/).map((L) => me(L, k)).join(" ")), me = (j, k) => {
    j = j.trim();
    const L = k.loose ? c[d.XRANGELOOSE] : c[d.XRANGE];
    return j.replace(L, (D, K, M, P, p, S) => {
      o("xRange", j, D, K, M, P, p, S);
      const $ = N(M), i = $ || N(P), f = i || N(p), b = f;
      return K === "=" && b && (K = ""), S = k.includePrerelease ? "-0" : "", $ ? K === ">" || K === "<" ? D = "<0.0.0-0" : D = "*" : K && b ? (i && (P = 0), p = 0, K === ">" ? (K = ">=", i ? (M = +M + 1, P = 0, p = 0) : (P = +P + 1, p = 0)) : K === "<=" && (K = "<", i ? M = +M + 1 : P = +P + 1), K === "<" && (S = "-0"), D = `${K + M}.${P}.${p}${S}`) : i ? D = `>=${M}.0.0${S} <${+M + 1}.0.0-0` : f && (D = `>=${M}.${P}.0${S} <${M}.${+P + 1}.0-0`), o("xRange return", D), D;
    });
  }, ye = (j, k) => (o("replaceStars", j, k), j.trim().replace(c[d.STAR], "")), z = (j, k) => (o("replaceGTE0", j, k), j.trim().replace(c[k.includePrerelease ? d.GTE0PRE : d.GTE0], "")), H = (j) => (k, L, D, K, M, P, p, S, $, i, f, b) => (N(D) ? L = "" : N(K) ? L = `>=${D}.0.0${j ? "-0" : ""}` : N(M) ? L = `>=${D}.${K}.0${j ? "-0" : ""}` : P ? L = `>=${L}` : L = `>=${L}${j ? "-0" : ""}`, N($) ? S = "" : N(i) ? S = `<${+$ + 1}.0.0-0` : N(f) ? S = `<${$}.${+i + 1}.0-0` : b ? S = `<=${$}.${i}.${f}-${b}` : j ? S = `<${$}.${i}.${+f + 1}-0` : S = `<=${S}`, `${L} ${S}`.trim()), ae = (j, k, L) => {
    for (let D = 0; D < j.length; D++)
      if (!j[D].test(k))
        return !1;
    if (k.prerelease.length && !L.includePrerelease) {
      for (let D = 0; D < j.length; D++)
        if (o(j[D].semver), j[D].semver !== a.ANY && j[D].semver.prerelease.length > 0) {
          const K = j[D].semver;
          if (K.major === k.major && K.minor === k.minor && K.patch === k.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Vs;
}
var Fs, Pc;
function Es() {
  if (Pc) return Fs;
  Pc = 1;
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
      u = u.trim().split(/\s+/).join(" "), o("comparator", u, h), this.options = h, this.loose = !!h.loose, this.parse(u), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(u) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], E = u.match(h);
      if (!E)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = E[1] !== void 0 ? E[1] : "", this.operator === "=" && (this.operator = ""), E[2] ? this.semver = new l(E[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (o("Comparator.test", u, this.options.loose), this.semver === e || u === e)
        return !0;
      if (typeof u == "string")
        try {
          u = new l(u, this.options);
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
  Fs = t;
  const r = ai, { safeRe: n, t: s } = mn, a = qu, o = vs, l = Ae, c = xe();
  return Fs;
}
const ZE = xe(), xE = (e, t, r) => {
  try {
    t = new ZE(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var bs = xE;
const eb = xe(), tb = (e, t) => new eb(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var rb = tb;
const nb = Ae, sb = xe(), ab = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new sb(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new nb(n, r));
  }), n;
};
var ob = ab;
const ib = Ae, cb = xe(), lb = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new cb(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new ib(n, r));
  }), n;
};
var ub = lb;
const zs = Ae, db = xe(), Nc = ws, fb = (e, t) => {
  e = new db(e, t);
  let r = new zs("0.0.0");
  if (e.test(r) || (r = new zs("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const l = new zs(o.semver.version);
      switch (o.operator) {
        case ">":
          l.prerelease.length === 0 ? l.patch++ : l.prerelease.push(0), l.raw = l.format();
        case "":
        case ">=":
          (!a || Nc(l, a)) && (a = l);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || Nc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var hb = fb;
const mb = xe(), pb = (e, t) => {
  try {
    return new mb(e, t).range || "*";
  } catch {
    return null;
  }
};
var $b = pb;
const yb = Ae, Gu = Es(), { ANY: gb } = Gu, _b = xe(), vb = bs, Rc = ws, Oc = ii, wb = li, Eb = ci, bb = (e, t, r, n) => {
  e = new yb(e, n), t = new _b(t, n);
  let s, a, o, l, c;
  switch (r) {
    case ">":
      s = Rc, a = wb, o = Oc, l = ">", c = ">=";
      break;
    case "<":
      s = Oc, a = Eb, o = Rc, l = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (vb(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, E = null;
    if (u.forEach((_) => {
      _.semver === gb && (_ = new Gu(">=0.0.0")), h = h || _, E = E || _, s(_.semver, h.semver, n) ? h = _ : o(_.semver, E.semver, n) && (E = _);
    }), h.operator === l || h.operator === c || (!E.operator || E.operator === l) && a(e, E.semver))
      return !1;
    if (E.operator === c && o(e, E.semver))
      return !1;
  }
  return !0;
};
var ui = bb;
const Sb = ui, Pb = (e, t, r) => Sb(e, t, ">", r);
var Nb = Pb;
const Rb = ui, Ob = (e, t, r) => Rb(e, t, "<", r);
var Ib = Ob;
const Ic = xe(), jb = (e, t, r) => (e = new Ic(e, r), t = new Ic(t, r), e.intersects(t, r));
var Tb = jb;
const kb = bs, Ab = Ze;
var Cb = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((u, h) => Ab(u, h, r));
  for (const u of o)
    kb(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const l = [];
  for (const [u, h] of n)
    u === h ? l.push(u) : !h && u === o[0] ? l.push("*") : h ? u === o[0] ? l.push(`<=${h}`) : l.push(`${u} - ${h}`) : l.push(`>=${u}`);
  const c = l.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return c.length < d.length ? c : t;
};
const jc = xe(), di = Es(), { ANY: Us } = di, Kr = bs, fi = Ze, Db = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new jc(e, r), t = new jc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = Lb(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, Mb = [new di(">=0.0.0-0")], Tc = [new di(">=0.0.0")], Lb = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Us) {
    if (t.length === 1 && t[0].semver === Us)
      return !0;
    r.includePrerelease ? e = Mb : e = Tc;
  }
  if (t.length === 1 && t[0].semver === Us) {
    if (r.includePrerelease)
      return !0;
    t = Tc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const _ of e)
    _.operator === ">" || _.operator === ">=" ? s = kc(s, _, r) : _.operator === "<" || _.operator === "<=" ? a = Ac(a, _, r) : n.add(_.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = fi(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const _ of n) {
    if (s && !Kr(_, String(s), r) || a && !Kr(_, String(a), r))
      return null;
    for (const v of t)
      if (!Kr(_, String(v), r))
        return !1;
    return !0;
  }
  let l, c, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, E = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const _ of t) {
    if (u = u || _.operator === ">" || _.operator === ">=", d = d || _.operator === "<" || _.operator === "<=", s) {
      if (E && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === E.major && _.semver.minor === E.minor && _.semver.patch === E.patch && (E = !1), _.operator === ">" || _.operator === ">=") {
        if (l = kc(s, _, r), l === _ && l !== s)
          return !1;
      } else if (s.operator === ">=" && !Kr(s.semver, String(_), r))
        return !1;
    }
    if (a) {
      if (h && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === h.major && _.semver.minor === h.minor && _.semver.patch === h.patch && (h = !1), _.operator === "<" || _.operator === "<=") {
        if (c = Ac(a, _, r), c === _ && c !== a)
          return !1;
      } else if (a.operator === "<=" && !Kr(a.semver, String(_), r))
        return !1;
    }
    if (!_.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || E || h);
}, kc = (e, t, r) => {
  if (!e)
    return t;
  const n = fi(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Ac = (e, t, r) => {
  if (!e)
    return t;
  const n = fi(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var Vb = Db;
const qs = mn, Cc = _s, Fb = Ae, Dc = Fu, zb = Ar, Ub = Bw, qb = Yw, Gb = Zw, Kb = eE, Hb = nE, Jb = oE, Bb = lE, Wb = fE, Xb = Ze, Yb = $E, Qb = _E, Zb = oi, xb = bE, e1 = NE, t1 = ws, r1 = ii, n1 = zu, s1 = Uu, a1 = ci, o1 = li, i1 = qu, c1 = XE, l1 = Es(), u1 = xe(), d1 = bs, f1 = rb, h1 = ob, m1 = ub, p1 = hb, $1 = $b, y1 = ui, g1 = Nb, _1 = Ib, v1 = Tb, w1 = Cb, E1 = Vb;
var b1 = {
  parse: zb,
  valid: Ub,
  clean: qb,
  inc: Gb,
  diff: Kb,
  major: Hb,
  minor: Jb,
  patch: Bb,
  prerelease: Wb,
  compare: Xb,
  rcompare: Yb,
  compareLoose: Qb,
  compareBuild: Zb,
  sort: xb,
  rsort: e1,
  gt: t1,
  lt: r1,
  eq: n1,
  neq: s1,
  gte: a1,
  lte: o1,
  cmp: i1,
  coerce: c1,
  Comparator: l1,
  Range: u1,
  satisfies: d1,
  toComparators: f1,
  maxSatisfying: h1,
  minSatisfying: m1,
  minVersion: p1,
  validRange: $1,
  outside: y1,
  gtr: g1,
  ltr: _1,
  intersects: v1,
  simplifyRange: w1,
  subset: E1,
  SemVer: Fb,
  re: qs.re,
  src: qs.src,
  tokens: qs.t,
  SEMVER_SPEC_VERSION: Cc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Cc.RELEASE_TYPES,
  compareIdentifiers: Dc.compareIdentifiers,
  rcompareIdentifiers: Dc.rcompareIdentifiers
};
const dr = /* @__PURE__ */ Wc(b1), S1 = Object.prototype.toString, P1 = "[object Uint8Array]", N1 = "[object ArrayBuffer]";
function Ku(e, t, r) {
  return e ? e.constructor === t ? !0 : S1.call(e) === r : !1;
}
function Hu(e) {
  return Ku(e, Uint8Array, P1);
}
function R1(e) {
  return Ku(e, ArrayBuffer, N1);
}
function O1(e) {
  return Hu(e) || R1(e);
}
function I1(e) {
  if (!Hu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function j1(e) {
  if (!O1(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Mc(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    I1(s), r.set(s, n), n += s.length;
  return r;
}
const kn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Lc(e, t = "utf8") {
  return j1(e), kn[t] ?? (kn[t] = new globalThis.TextDecoder(t)), kn[t].decode(e);
}
function T1(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const k1 = new globalThis.TextEncoder();
function Gs(e) {
  return T1(e), k1.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const A1 = bw.default, Vc = "aes-256-cbc", fr = () => /* @__PURE__ */ Object.create(null), C1 = (e) => e != null, D1 = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, qn = "__internal__", Ks = `${qn}.migrations.version`;
var Ot, ct, Fe, lt;
class M1 {
  constructor(t = {}) {
    Mr(this, "path");
    Mr(this, "events");
    Lr(this, Ot);
    Lr(this, ct);
    Lr(this, Fe);
    Lr(this, lt, {});
    Mr(this, "_deserialize", (t) => JSON.parse(t));
    Mr(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
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
      r.cwd = od(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (Vr(this, Fe, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new u0.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      A1(o);
      const l = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      Vr(this, Ot, o.compile(l));
      for (const [c, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (fe(this, lt)[c] = d.default);
    }
    r.defaults && Vr(this, lt, {
      ...fe(this, lt),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), Vr(this, ct, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = oe.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(fr(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      Qu.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (fe(this, Fe).accessPropertiesByDotNotation)
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
      throw new TypeError(`Please don't use the ${qn} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      D1(a, o), fe(this, Fe).accessPropertiesByDotNotation ? pi(n, a, o) : n[a] = o;
    };
    if (typeof t == "object") {
      const a = t;
      for (const [o, l] of Object.entries(a))
        s(o, l);
    } else
      s(t, r);
    this.store = n;
  }
  has(t) {
    return fe(this, Fe).accessPropertiesByDotNotation ? rd(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      C1(fe(this, lt)[r]) && this.set(r, fe(this, lt)[r]);
  }
  delete(t) {
    const { store: r } = this;
    fe(this, Fe).accessPropertiesByDotNotation ? td(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = fr();
    for (const t of Object.keys(fe(this, lt)))
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
      const t = Z.readFileSync(this.path, fe(this, ct) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(fr(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), fr();
      if (fe(this, Fe).clearInvalidConfig && t.name === "SyntaxError")
        return fr();
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
    if (!fe(this, ct))
      return typeof t == "string" ? t : Lc(t);
    try {
      const r = t.slice(0, 16), n = Fr.pbkdf2Sync(fe(this, ct), r.toString(), 1e4, 32, "sha512"), s = Fr.createDecipheriv(Vc, n, r), a = t.slice(17), o = typeof a == "string" ? Gs(a) : a;
      return Lc(Mc([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Yu(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!fe(this, Ot) || fe(this, Ot).call(this, t) || !fe(this, Ot).errors)
      return;
    const n = fe(this, Ot).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Z.mkdirSync(oe.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (fe(this, ct)) {
      const n = Fr.randomBytes(16), s = Fr.pbkdf2Sync(fe(this, ct), n.toString(), 1e4, 32, "sha512"), a = Fr.createCipheriv(Vc, s, n);
      r = Mc([n, Gs(":"), a.update(Gs(r)), a.final()]);
    }
    if (ve.env.SNAP)
      Z.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
    else
      try {
        Bc(this.path, r, { mode: fe(this, Fe).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          Z.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), Z.existsSync(this.path) || this._write(fr()), ve.platform === "win32" ? Z.watch(this.path, { persistent: !1 }, $c(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : Z.watchFile(this.path, { persistent: !1 }, $c(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(Ks, "0.0.0");
    const a = Object.keys(t).filter((l) => this._shouldPerformMigration(l, s, r));
    let o = { ...this.store };
    for (const l of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: l,
          finalVersion: r,
          versions: a
        });
        const c = t[l];
        c == null || c(this), this._set(Ks, l), s = l, o = { ...this.store };
      } catch (c) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${c}`);
      }
    (this._isVersionInRangeFormat(s) || !dr.eq(s, r)) && this._set(Ks, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === qn ? !0 : typeof t != "string" ? !1 : fe(this, Fe).accessPropertiesByDotNotation ? !!t.startsWith(`${qn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return dr.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && dr.satisfies(r, t) ? !1 : dr.satisfies(n, t) : !(dr.lte(t, r) || dr.gt(t, n));
  }
  _get(t, r) {
    return ed(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    pi(n, t, r), this.store = n;
  }
}
Ot = new WeakMap(), ct = new WeakMap(), Fe = new WeakMap(), lt = new WeakMap();
const { app: Gn, ipcMain: la, shell: L1 } = qc;
let Fc = !1;
const zc = () => {
  if (!la || !Gn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Gn.getPath("userData"),
    appVersion: Gn.getVersion()
  };
  return Fc || (la.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Fc = !0), e;
};
class V1 extends M1 {
  constructor(t) {
    let r, n;
    if (ve.type === "renderer") {
      const s = qc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else la && Gn && ({ defaultCwd: r, appVersion: n } = zc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = oe.isAbsolute(t.cwd) ? t.cwd : oe.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    zc();
  }
  async openInEditor() {
    const t = await L1.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const vr = ne.dirname(Zu(import.meta.url));
process.env.APP_ROOT = ne.join(vr, "..");
const ua = process.env.VITE_DEV_SERVER_URL, rS = ne.join(process.env.APP_ROOT, "dist-electron"), Ju = ne.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = ua ? ne.join(process.env.APP_ROOT, "public") : Ju;
let se, Kn = null;
const ut = /* @__PURE__ */ new Map(), ns = {
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
}, Hn = new V1({
  defaults: {
    formData: ns
  },
  name: "app-config"
});
yt.handle("save-data", async (e, t, r) => {
  try {
    if (t === "all")
      Hn.set("formData", r);
    else {
      const s = { ...Hn.get("formData", ns), ...r };
      Hn.set("formData", s);
    }
    return console.log("Dados salvos com sucesso para a chave:", t), !0;
  } catch (n) {
    return console.error("Erro ao salvar dados:", n), !1;
  }
});
yt.handle("load-data", async () => {
  try {
    return Hn.get("formData", ns);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), ns;
  }
});
yt.handle("select-folder", async () => {
  const e = await Gc.showOpenDialog(se, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
yt.handle("select-file", async () => {
  const e = await Gc.showOpenDialog(se, {
    properties: ["openFile"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhum arquivo selecionado"), null;
  const t = e.filePaths[0];
  return console.log("Arquivo selecionado:", t), t;
});
yt.handle("clean-db", async () => (console.log("Limpando banco de dados..."), new Promise((e) => {
  setTimeout(() => {
    console.log("Banco de dados limpo com sucesso"), e(!0);
  }, 1e3);
})));
yt.handle("start-fork", async (e, { script: t, args: r = [] } = {}) => {
  const n = ne.dirname(ne.dirname(vr));
  t || (t = "../back-end/dist/src/index.js");
  let s;
  if (ne.isAbsolute(t))
    s = t;
  else {
    const a = [
      // Prefer IPC-only CJS build
      ne.join(n, "back-end", "dist", "index.js"),
      // Fallback to full build structure if present
      ne.join(n, "back-end", "dist", "src", "index.js"),
      // TypeScript source (will use ts-node)
      ne.join(n, "back-end", "src", "index.ts"),
      // Original provided script path fallbacks
      ne.join(vr, t),
      ne.join(process.env.APP_ROOT || "", t),
      ne.join(ne.dirname(vr), t),
      ne.join(n, t),
      ne.resolve(t)
    ];
    console.log("Trying paths:", a), s = a.find((o) => {
      try {
        const l = Nt.existsSync(o);
        return console.log(`Path ${o} exists: ${l}`), l;
      } catch {
        return !1;
      }
    }) || a[0];
  }
  console.log("Attempting to fork script at:", s), console.log("Script exists:", Nt.existsSync(s));
  try {
    const a = ne.join(n, "Frontend", "backend");
    if (s.startsWith(a)) {
      const l = [
        ne.join(n, "back-end", "dist", "index.js"),
        ne.join(n, "back-end", "dist", "src", "index.js"),
        ne.join(n, "back-end", "src", "index.ts"),
        ne.join(n, "back-end", "src", "index.js")
      ].find((c) => Nt.existsSync(c));
      l ? (console.log("Replacing frontend shim script with real backend entry:", l), s = l) : console.log("No real backend entry found, will attempt to fork provided script (may fail if AMD-wrapped)");
    }
  } catch {
  }
  try {
    const a = ne.dirname(s);
    let o = a, l = !1;
    for (; o && o !== ne.dirname(o); ) {
      const u = ne.join(o, "package.json");
      if (Nt.existsSync(u))
        try {
          if (JSON.parse(Nt.readFileSync(u, "utf8")).name === "backend") {
            l = !0;
            break;
          }
        } catch {
        }
      o = ne.dirname(o);
    }
    l || (o = a), console.log("Setting child process cwd to:", o), Kn = s;
    const c = da(s, r, {
      stdio: ["pipe", "pipe", "ipc"],
      cwd: o,
      silent: !1,
      env: { ...process.env }
    }), d = c.pid;
    if (console.log("Child process forked with PID:", d), typeof d == "number")
      ut.set(d, c), console.log("Child process added to children map. Total children:", ut.size);
    else
      return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
    return new Promise((u, h) => {
      const E = setTimeout(() => {
        h(new Error("Timeout waiting for WebSocket port from backend"));
      }, 1e4), _ = (v) => {
        v && v.type === "websocket-port" && typeof v.port == "number" && (clearTimeout(E), c.off("message", _), u({ ok: !0, port: v.port, pid: d }));
      };
      c.on("message", _), c.on("error", (v) => {
        console.error("Child process error:", v), typeof c.pid == "number" && ut.delete(c.pid), clearTimeout(E), h(v);
      }), c.on("exit", (v, g) => {
        console.log(`Child process ${c.pid} exited with code ${v} and signal ${g}`), typeof c.pid == "number" && ut.delete(c.pid), se && !se.isDestroyed() && se.webContents.send("child-exit", { pid: c.pid, code: v, signal: g }), clearTimeout(E), h(new Error(`Child process exited with code ${v}`));
      }), c.on("message", (v) => {
        console.log("Message from child:", v), !(v && typeof v == "object" && "type" in v && v.type === "websocket-port") && se && !se.isDestroyed() && se.webContents.send("child-message", { pid: c.pid, msg: v });
      }), c.stdout && c.stdout.on("data", (v) => {
        console.log("Child stdout:", v.toString()), se && !se.isDestroyed() && se.webContents.send("child-stdout", { pid: c.pid, data: v.toString() });
      }), c.stderr && c.stderr.on("data", (v) => {
        console.error("Child stderr:", v.toString()), se && !se.isDestroyed() && se.webContents.send("child-stderr", { pid: c.pid, data: v.toString() });
      });
    });
  } catch (a) {
    return console.error("Failed to fork child process:", a), { ok: !1, reason: `fork-error: ${a}` };
  }
});
yt.handle("start-collector-fork", async (e, { args: t = [] } = {}) => {
  const r = ne.dirname(ne.dirname(vr)), n = [
    ne.join(r, "back-end", "dist", "src", "collector", "runner.js"),
    ne.join(r, "back-end", "dist", "collector", "runner.js"),
    ne.join(r, "back-end", "src", "collector", "runner.ts")
  ], s = n.find((a) => Nt.existsSync(a)) || n[0];
  if (!Nt.existsSync(s)) return { ok: !1, reason: "collector-not-found", attempted: n };
  try {
    const a = da(s, t, { stdio: ["pipe", "pipe", "ipc"], cwd: ne.dirname(s), env: { ...process.env } }), o = a.pid;
    return typeof o == "number" && (ut.set(o, a), a.on("message", (l) => {
      se && !se.isDestroyed() && se.webContents.send("child-message", { pid: o, msg: l });
    }), a.stdout && a.stdout.on("data", (l) => {
      se && !se.isDestroyed() && se.webContents.send("child-stdout", { pid: o, data: l.toString() });
    }), a.stderr && a.stderr.on("data", (l) => {
      se && !se.isDestroyed() && se.webContents.send("child-stderr", { pid: o, data: l.toString() });
    })), { ok: !0, pid: o };
  } catch (a) {
    return { ok: !1, reason: String(a) };
  }
});
yt.handle("send-to-child", async (e, { pid: t, msg: r } = {}) => {
  if (console.log("send-to-child called with PID:", t, "Message type:", r == null ? void 0 : r.type), console.log("Available children PIDs:", Array.from(ut.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
  const n = ut.get(t);
  if (!n) {
    if (console.log("Child not found for PID:", t), Kn)
      try {
        const s = ne.dirname(Kn), a = da(Kn, [], { stdio: ["pipe", "pipe", "ipc"], cwd: s, silent: !1, env: { ...process.env } }), o = a.pid;
        if (typeof o == "number") {
          ut.set(o, a), se && !se.isDestroyed() && se.webContents.send("child-message", { pid: o, msg: { type: "event", event: "reforked", payload: { oldPid: t, newPid: o } } });
          try {
            return a.send(r), { ok: !0 };
          } catch (l) {
            return console.error("Error sending message after refork:", l), { ok: !1, reason: String(l) };
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
});
yt.handle("stop-child", async (e, { pid: t } = {}) => {
  if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
  const r = ut.get(t);
  if (!r) return { ok: !1, reason: "not-found" };
  try {
    return r.kill("SIGTERM"), { ok: !0 };
  } catch (n) {
    return { ok: !1, reason: String(n) };
  }
});
function Uc() {
  se = new Kc({
    icon: ne.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: ne.join(vr, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), se.maximize(), se.webContents.on("did-finish-load", () => {
    se == null || se.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ua ? se.loadURL(ua) : se.loadFile(ne.join(Ju, "index.html"));
}
sn.whenReady().then(() => {
  Uc(), sn.on("activate", () => {
    Kc.getAllWindows().length === 0 && Uc();
  });
});
sn.on("window-all-closed", () => {
  process.platform !== "darwin" && sn.quit();
});
const F1 = ne.join(sn.getPath("userData"), "error.log"), Bu = Nt.createWriteStream(F1, { flags: "a" });
process.on("uncaughtException", (e) => {
  Bu.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`);
});
process.on("unhandledRejection", (e) => {
  Bu.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`);
});
export {
  rS as MAIN_DIST,
  Ju as RENDERER_DIST,
  ua as VITE_DEV_SERVER_URL
};
