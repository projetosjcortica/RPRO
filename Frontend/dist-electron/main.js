var Zu = Object.defineProperty;
var $i = (e) => {
  throw TypeError(e);
};
var xu = (e, t, r) => t in e ? Zu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Mr = (e, t, r) => xu(e, typeof t != "symbol" ? t + "" : t, r), yi = (e, t, r) => t.has(e) || $i("Cannot " + r);
var fe = (e, t, r) => (yi(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Lr = (e, t, r) => t.has(e) ? $i("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Vr = (e, t, r, n) => (yi(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import Wc, { ipcMain as xe, dialog as Jc, BrowserWindow as ha, app as ft } from "electron";
import * as oe from "path";
import ve from "node:process";
import ae from "node:path";
import { promisify as Pe, isDeepStrictEqual as ed } from "node:util";
import x from "node:fs";
import Fr from "node:crypto";
import td from "node:assert";
import as from "node:os";
import nr from "fs";
import { fileURLToPath as rd } from "url";
import { fork as os, spawn as nd } from "child_process";
const sr = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Os = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), sd = new Set("0123456789");
function is(e) {
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
        if (Os.has(r))
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
          if (Os.has(r))
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
        if (n === "index" && !sd.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (Os.has(r))
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
function ma(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Xc(e, t) {
  if (ma(e, t))
    throw new Error("Cannot use string index");
}
function ad(e, t, r) {
  if (!sr(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = is(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (ma(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function gi(e, t, r) {
  if (!sr(e) || typeof t != "string")
    return e;
  const n = e, s = is(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Xc(e, o), a === s.length - 1 ? e[o] = r : sr(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function od(e, t) {
  if (!sr(e) || typeof t != "string")
    return !1;
  const r = is(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Xc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !sr(e))
      return !1;
  }
}
function id(e, t) {
  if (!sr(e) || typeof t != "string")
    return !1;
  const r = is(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!sr(e) || !(n in e) || ma(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Rt = as.homedir(), pa = as.tmpdir(), { env: yr } = ve, cd = (e) => {
  const t = ae.join(Rt, "Library");
  return {
    data: ae.join(t, "Application Support", e),
    config: ae.join(t, "Preferences", e),
    cache: ae.join(t, "Caches", e),
    log: ae.join(t, "Logs", e),
    temp: ae.join(pa, e)
  };
}, ld = (e) => {
  const t = yr.APPDATA || ae.join(Rt, "AppData", "Roaming"), r = yr.LOCALAPPDATA || ae.join(Rt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ae.join(r, e, "Data"),
    config: ae.join(t, e, "Config"),
    cache: ae.join(r, e, "Cache"),
    log: ae.join(r, e, "Log"),
    temp: ae.join(pa, e)
  };
}, ud = (e) => {
  const t = ae.basename(Rt);
  return {
    data: ae.join(yr.XDG_DATA_HOME || ae.join(Rt, ".local", "share"), e),
    config: ae.join(yr.XDG_CONFIG_HOME || ae.join(Rt, ".config"), e),
    cache: ae.join(yr.XDG_CACHE_HOME || ae.join(Rt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ae.join(yr.XDG_STATE_HOME || ae.join(Rt, ".local", "state"), e),
    temp: ae.join(pa, t, e)
  };
};
function dd(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ve.platform === "darwin" ? cd(e) : ve.platform === "win32" ? ld(e) : ud(e);
}
const _t = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, lt = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, fd = ve.getuid ? !ve.getuid() : !1, hd = 1e4, Ve = () => {
}, he = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!he.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !fd && (t === "EINVAL" || t === "EPERM");
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
class md {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = hd, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
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
const pd = new md(), vt = (e, t) => function(n) {
  return function s(...a) {
    return pd.schedule().then((o) => {
      const l = (d) => (o(), d), u = (d) => {
        if (o(), Date.now() >= n)
          throw d;
        if (t(d)) {
          const c = Math.round(100 * Math.random());
          return new Promise((b) => setTimeout(b, c)).then(() => s.apply(void 0, a));
        }
        throw d;
      };
      return e.apply(void 0, a).then(l, u);
    });
  };
}, wt = (e, t) => function(n) {
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
    chmod: _t(Pe(x.chmod), he.onChangeError),
    chown: _t(Pe(x.chown), he.onChangeError),
    close: _t(Pe(x.close), Ve),
    fsync: _t(Pe(x.fsync), Ve),
    mkdir: _t(Pe(x.mkdir), Ve),
    realpath: _t(Pe(x.realpath), Ve),
    stat: _t(Pe(x.stat), Ve),
    unlink: _t(Pe(x.unlink), Ve),
    /* SYNC */
    chmodSync: lt(x.chmodSync, he.onChangeError),
    chownSync: lt(x.chownSync, he.onChangeError),
    closeSync: lt(x.closeSync, Ve),
    existsSync: lt(x.existsSync, Ve),
    fsyncSync: lt(x.fsync, Ve),
    mkdirSync: lt(x.mkdirSync, Ve),
    realpathSync: lt(x.realpathSync, Ve),
    statSync: lt(x.statSync, Ve),
    unlinkSync: lt(x.unlinkSync, Ve)
  },
  retry: {
    /* ASYNC */
    close: vt(Pe(x.close), he.isRetriableError),
    fsync: vt(Pe(x.fsync), he.isRetriableError),
    open: vt(Pe(x.open), he.isRetriableError),
    readFile: vt(Pe(x.readFile), he.isRetriableError),
    rename: vt(Pe(x.rename), he.isRetriableError),
    stat: vt(Pe(x.stat), he.isRetriableError),
    write: vt(Pe(x.write), he.isRetriableError),
    writeFile: vt(Pe(x.writeFile), he.isRetriableError),
    /* SYNC */
    closeSync: wt(x.closeSync, he.isRetriableError),
    fsyncSync: wt(x.fsyncSync, he.isRetriableError),
    openSync: wt(x.openSync, he.isRetriableError),
    readFileSync: wt(x.readFileSync, he.isRetriableError),
    renameSync: wt(x.renameSync, he.isRetriableError),
    statSync: wt(x.statSync, he.isRetriableError),
    writeSync: wt(x.writeSync, he.isRetriableError),
    writeFileSync: wt(x.writeFileSync, he.isRetriableError)
  }
}, $d = "utf8", _i = 438, yd = 511, gd = {}, _d = as.userInfo().uid, vd = as.userInfo().gid, wd = 1e3, Ed = !!ve.getuid;
ve.getuid && ve.getuid();
const vi = 128, bd = (e) => e instanceof Error && "code" in e, wi = (e) => typeof e == "string", Is = (e) => e === void 0, Sd = ve.platform === "linux", Yc = ve.platform === "win32", $a = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Yc || $a.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Sd && $a.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Pd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Yc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ve.kill(ve.pid, "SIGTERM") : ve.kill(ve.pid, t));
      }
    }, this.hook = () => {
      ve.once("exit", () => this.exit());
      for (const t of $a)
        try {
          ve.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Nd = new Pd(), Rd = Nd.register, Ie = {
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
    const t = ae.basename(e);
    if (t.length <= vi)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - vi;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Rd(Ie.purgeSyncAll);
function Qc(e, t, r = gd) {
  if (wi(r))
    return Qc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? wd) || -1);
  let s = null, a = null, o = null;
  try {
    const l = Oe.attempt.realpathSync(e), u = !!l;
    e = l || e, [a, s] = Ie.get(e, r.tmpCreate || Ie.create, r.tmpPurge !== !1);
    const d = Ed && Is(r.chown), c = Is(r.mode);
    if (u && (d || c)) {
      const h = Oe.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), c && (r.mode = h.mode));
    }
    if (!u) {
      const h = ae.dirname(e);
      Oe.attempt.mkdirSync(h, {
        mode: yd,
        recursive: !0
      });
    }
    o = Oe.retry.openSync(n)(a, "w", r.mode || _i), r.tmpCreated && r.tmpCreated(a), wi(t) ? Oe.retry.writeSync(n)(o, t, 0, r.encoding || $d) : Is(t) || Oe.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Oe.retry.fsyncSync(n)(o) : Oe.attempt.fsync(o)), Oe.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== _d || r.chown.gid !== vd) && Oe.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== _i && Oe.attempt.chmodSync(a, r.mode);
    try {
      Oe.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!bd(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Oe.retry.renameSync(n)(a, Ie.truncate(e));
    }
    s(), a = null;
  } finally {
    o && Oe.attempt.closeSync(o), a && Ie.purge(a);
  }
}
function Zc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ws = { exports: {} }, xc = {}, Qe = {}, Er = {}, on = {}, Y = {}, sn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
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
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      l(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [_(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), l(N, v[R]), N.push(a, _(m[++R]));
    return u(N), new n(N);
  }
  e.str = o;
  function l(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = l;
  function u(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = d(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function c(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = c;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : _(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(_(m));
  }
  e.stringify = b;
  function _(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = _;
  function w(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = w;
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
})(sn);
var Js = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = sn;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(u) {
    u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: c } = {}) {
      this._names = {}, this._prefixes = d, this._parent = c;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const c = this._names[d] || this._nameGroup(d);
      return `${d}${c.index++}`;
    }
    _nameGroup(d) {
      var c, h;
      if (!((h = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, c) {
      super(c), this.prefix = d;
    }
    setValue(d, { property: c, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${h}]`;
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
    value(d, c) {
      var h;
      if (c.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const b = this.toName(d), { prefix: _ } = b, w = (h = c.key) !== null && h !== void 0 ? h : c.ref;
      let g = this._values[_];
      if (g) {
        const v = g.get(w);
        if (v)
          return v;
      } else
        g = this._values[_] = /* @__PURE__ */ new Map();
      g.set(w, b);
      const y = this._scope[_] || (this._scope[_] = []), m = y.length;
      return y[m] = c.ref, b.setValue(c, { property: _, itemIndex: m }), b;
    }
    getValue(d, c) {
      const h = this._values[d];
      if (h)
        return h.get(c);
    }
    scopeRefs(d, c = this._values) {
      return this._reduceValues(c, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, c, h) {
      return this._reduceValues(d, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, c, h);
    }
    _reduceValues(d, c, h = {}, b) {
      let _ = t.nil;
      for (const w in d) {
        const g = d[w];
        if (!g)
          continue;
        const y = h[w] = h[w] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let v = c(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            _ = (0, t._)`${_}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = b == null ? void 0 : b(m))
            _ = (0, t._)`${_}${v}${this.opts._n}`;
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
  const t = sn, r = Js;
  var n = sn;
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
    constructor(i, f, E) {
      super(), this.varKind = i, this.name = f, this.rhs = E;
    }
    render({ es5: i, _n: f }) {
      const E = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = T(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends a {
    constructor(i, f, E) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = E;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = T(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return se(i, this.rhs);
    }
  }
  class u extends l {
    constructor(i, f, E, I) {
      super(i, E, I), this.op = f;
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
  class c extends a {
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
  class b extends a {
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
      return this.code = T(this.code, i, f), this;
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
      return this.nodes.reduce((f, E) => f + E.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const E = i[f].optimizeNodes();
        Array.isArray(E) ? i.splice(f, 1, ...E) : E ? i[f] = E : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: E } = this;
      let I = E.length;
      for (; I--; ) {
        const k = E[I];
        k.optimizeNames(i, f) || (j(i, k.names), E.splice(I, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class w extends _ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends _ {
  }
  class y extends w {
  }
  y.kind = "else";
  class m extends w {
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
        const E = f.optimizeNodes();
        f = this.else = Array.isArray(E) ? new y(E) : E;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(L(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = T(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return se(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = T(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, E, I) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: I, to: k } = this;
      return `for(${f} ${E}=${I}; ${E}<${k}; ${E}++)` + super.render(i);
    }
    get names() {
      const i = se(super.names, this.from);
      return se(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, E, I) {
      super(), this.loop = i, this.varKind = f, this.name = E, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = T(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class G extends w {
    constructor(i, f, E) {
      super(), this.name = i, this.args = f, this.async = E;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class X extends _ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  X.kind = "return";
  class de extends w {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var E, I;
      return super.optimizeNames(i, f), (E = this.catch) === null || E === void 0 || E.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class me extends w {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  me.kind = "catch";
  class ye extends w {
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
      const E = this._extScope.value(i, f);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
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
    _def(i, f, E, I) {
      const k = this._scope.toName(f);
      return E !== void 0 && I && (this._constants[k.str] = E), this._leafNode(new o(i, k, E)), k;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, E) {
      return this._def(r.varKinds.const, i, f, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, E) {
      return this._def(r.varKinds.let, i, f, E);
    }
    // `var` declaration with optional assignment
    var(i, f, E) {
      return this._def(r.varKinds.var, i, f, E);
    }
    // assignment code
    assign(i, f, E) {
      return this._leafNode(new l(i, f, E));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new u(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new b(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [E, I] of i)
        f.length > 1 && f.push(","), f.push(E), (E !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, E) {
      if (this._blockNode(new m(i)), f && E)
        this.code(f).else().code(E).endIf();
      else if (f)
        this.code(f).endIf();
      else if (E)
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
    forRange(i, f, E, I, k = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(k, F, f, E), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, I = r.varKinds.const) {
      const k = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(k, (0, t._)`${F}[${V}]`), E(k);
        });
      }
      return this._for(new O("of", I, k, f), () => E(k));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const k = this._scope.toName(i);
      return this._for(new O("in", I, k, f), () => E(k));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new c(i));
    }
    // `return` statement
    return(i) {
      const f = new X();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(X);
    }
    // `try` statement
    try(i, f, E) {
      if (!f && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new de();
      if (this._blockNode(I), this.code(i), f) {
        const k = this.name("e");
        this._currNode = I.catch = new me(k), f(k);
      }
      return E && (this._currNode = I.finally = new ye(), this.code(E)), this._endBlockNode(me, ye);
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
      const E = this._nodes.length - f;
      if (E < 0 || i !== void 0 && E !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, E, I) {
      return this._blockNode(new G(i, f, E)), I && this.code(I).endFunc(), this;
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
      const E = this._currNode;
      if (E instanceof i || f && E instanceof f)
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
  function se($, i) {
    return i instanceof t._CodeOrName ? H($, i.names) : $;
  }
  function T($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((k, F) => (F instanceof t.Name && (F = E(F)), F instanceof t._Code ? k.push(...F._items) : k.push(F), k), []));
    function E(k) {
      const F = f[k.str];
      return F === void 0 || i[k.str] !== 1 ? k : (delete i[k.str], F);
    }
    function I(k) {
      return k instanceof t._Code && k._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function j($, i) {
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
})(Y);
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
A.checkStrictMode = A.getErrorPath = A.Type = A.useFunc = A.setEvaluated = A.evaluatedPropsToName = A.mergeEvaluated = A.eachItem = A.unescapeJsonPointer = A.escapeJsonPointer = A.escapeFragment = A.unescapeFragment = A.schemaRefOrVal = A.schemaHasRulesButRef = A.schemaHasRules = A.checkUnknownRules = A.alwaysValidSchema = A.toHash = void 0;
const ie = Y, Od = sn;
function Id(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
A.toHash = Id;
function Td(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (el(e, t), !tl(t, e.self.RULES.all));
}
A.alwaysValidSchema = Td;
function el(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || sl(e, `unknown keyword: "${a}"`);
}
A.checkUnknownRules = el;
function tl(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
A.schemaHasRules = tl;
function kd(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
A.schemaHasRulesButRef = kd;
function jd({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ie._)`${r}`;
  }
  return (0, ie._)`${e}${t}${(0, ie.getProperty)(n)}`;
}
A.schemaRefOrVal = jd;
function Ad(e) {
  return rl(decodeURIComponent(e));
}
A.unescapeFragment = Ad;
function Cd(e) {
  return encodeURIComponent(ya(e));
}
A.escapeFragment = Cd;
function ya(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
A.escapeJsonPointer = ya;
function rl(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
A.unescapeJsonPointer = rl;
function Dd(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
A.eachItem = Dd;
function Ei({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const u = o === void 0 ? a : o instanceof ie.Name ? (a instanceof ie.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ie.Name ? (t(s, o, a), a) : r(a, o);
    return l === ie.Name && !(u instanceof ie.Name) ? n(s, u) : u;
  };
}
A.mergeEvaluated = {
  props: Ei({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ie._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ie._)`${r} || {}`).code((0, ie._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ie._)`${r} || {}`), ga(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: nl
  }),
  items: Ei({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ie._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ie._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function nl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ie._)`{}`);
  return t !== void 0 && ga(e, r, t), r;
}
A.evaluatedPropsToName = nl;
function ga(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ie._)`${t}${(0, ie.getProperty)(n)}`, !0));
}
A.setEvaluated = ga;
const bi = {};
function Md(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: bi[t.code] || (bi[t.code] = new Od._Code(t.code))
  });
}
A.useFunc = Md;
var Xs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Xs || (A.Type = Xs = {}));
function Ld(e, t, r) {
  if (e instanceof ie.Name) {
    const n = t === Xs.Num;
    return r ? n ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : n ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ie.getProperty)(e).toString() : "/" + ya(e);
}
A.getErrorPath = Ld;
function sl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
A.checkStrictMode = sl;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
const Ne = Y, Vd = {
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
ze.default = Vd;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = Y, r = A, n = ze;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, v, N) {
    const { it: R } = y, { gen: O, compositeRule: G, allErrors: X } = R, de = h(y, m, v);
    N ?? (G || X) ? u(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, v) {
    const { it: N } = y, { gen: R, compositeRule: O, allErrors: G } = N, X = h(y, m, v);
    u(R, X), O || G || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function l({ gen: y, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const G = y.name("err");
    y.forRange("i", R, n.default.errors, (X) => {
      y.const(G, (0, t._)`${n.default.vErrors}[${X}]`), y.if((0, t._)`${G}.instancePath === undefined`, () => y.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), y.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (y.assign((0, t._)`${G}.schema`, v), y.assign((0, t._)`${G}.data`, N));
    });
  }
  e.extendErrors = l;
  function u(y, m) {
    const v = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: v, validateName: N, schemaEnv: R } = y;
    R.$async ? v.throw((0, t._)`new ${y.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const c = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(y, m, v) {
    const { createErrors: N } = y.it;
    return N === !1 ? (0, t._)`{}` : b(y, m, v);
  }
  function b(y, m, v = {}) {
    const { gen: N, it: R } = y, O = [
      _(R, v),
      w(y, v)
    ];
    return g(y, m, O), N.object(...O);
  }
  function _({ errorPath: y }, { instancePath: m }) {
    const v = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${y}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [c.schemaPath, R];
  }
  function g(y, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: G, it: X } = y, { opts: de, propertyName: me, topSchemaRef: ye, schemaPath: z } = X;
    N.push([c.keyword, R], [c.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), de.messages && N.push([c.message, typeof v == "function" ? v(y) : v]), de.verbose && N.push([c.schema, G], [c.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), me && N.push([c.propertyName, me]);
  }
})(on);
Object.defineProperty(Er, "__esModule", { value: !0 });
Er.boolOrEmptySchema = Er.topBoolOrEmptySchema = void 0;
const Fd = on, zd = Y, Ud = ze, qd = {
  message: "boolean schema is false"
};
function Gd(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? al(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Ud.default.data) : (t.assign((0, zd._)`${n}.errors`, null), t.return(!0));
}
Er.topBoolOrEmptySchema = Gd;
function Kd(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), al(e)) : r.var(t, !0);
}
Er.boolOrEmptySchema = Kd;
function al(e, t) {
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
  (0, Fd.reportError)(s, qd, void 0, t);
}
var ge = {}, ar = {};
Object.defineProperty(ar, "__esModule", { value: !0 });
ar.getRules = ar.isJSONType = void 0;
const Hd = ["string", "number", "integer", "boolean", "null", "object", "array"], Bd = new Set(Hd);
function Wd(e) {
  return typeof e == "string" && Bd.has(e);
}
ar.isJSONType = Wd;
function Jd() {
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
ar.getRules = Jd;
var ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
ht.shouldUseRule = ht.shouldUseGroup = ht.schemaHasRulesForType = void 0;
function Xd({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && ol(e, n);
}
ht.schemaHasRulesForType = Xd;
function ol(e, t) {
  return t.rules.some((r) => il(e, r));
}
ht.shouldUseGroup = ol;
function il(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
ht.shouldUseRule = il;
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
const Yd = ar, Qd = ht, Zd = on, Q = Y, cl = A;
var gr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(gr || (ge.DataType = gr = {}));
function xd(e) {
  const t = ll(e.type);
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
ge.getSchemaTypes = xd;
function ll(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Yd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ge.getJSONTypes = ll;
function ef(e, t) {
  const { gen: r, data: n, opts: s } = e, a = tf(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Qd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = _a(t, n, s.strictNumbers, gr.Wrong);
    r.if(l, () => {
      a.length ? rf(e, t, a) : va(e);
    });
  }
  return o;
}
ge.coerceAndCheckDataType = ef;
const ul = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function tf(e, t) {
  return t ? e.filter((r) => ul.has(r) || t === "array" && r === "array") : [];
}
function rf(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Q._)`typeof ${s}`), l = n.let("coerced", (0, Q._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Q._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Q._)`${s}[0]`).assign(o, (0, Q._)`typeof ${s}`).if(_a(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Q._)`${l} !== undefined`);
  for (const d of r)
    (ul.has(d) || d === "array" && a.coerceTypes === "array") && u(d);
  n.else(), va(e), n.endIf(), n.if((0, Q._)`${l} !== undefined`, () => {
    n.assign(s, l), nf(e, l);
  });
  function u(d) {
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
function nf({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Q._)`${t} !== undefined`, () => e.assign((0, Q._)`${t}[${r}]`, n));
}
function Ys(e, t, r, n = gr.Correct) {
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
ge.checkDataType = Ys;
function _a(e, t, r, n) {
  if (e.length === 1)
    return Ys(e[0], t, r, n);
  let s;
  const a = (0, cl.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Q._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Q._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Q.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Q.and)(s, Ys(o, t, r, n));
  return s;
}
ge.checkDataTypes = _a;
const sf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Q._)`{type: ${e}}` : (0, Q._)`{type: ${t}}`
};
function va(e) {
  const t = af(e);
  (0, Zd.reportError)(t, sf);
}
ge.reportTypeError = va;
function af(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, cl.schemaRefOrVal)(e, n, "type");
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
var cs = {};
Object.defineProperty(cs, "__esModule", { value: !0 });
cs.assignDefaults = void 0;
const cr = Y, of = A;
function cf(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      Si(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => Si(e, a, s.default));
}
cs.assignDefaults = cf;
function Si(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, cr._)`${a}${(0, cr.getProperty)(t)}`;
  if (s) {
    (0, of.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let u = (0, cr._)`${l} === undefined`;
  o.useDefaults === "empty" && (u = (0, cr._)`${u} || ${l} === null || ${l} === ""`), n.if(u, (0, cr._)`${l} = ${(0, cr.stringify)(r)}`);
}
var at = {}, te = {};
Object.defineProperty(te, "__esModule", { value: !0 });
te.validateUnion = te.validateArray = te.usePattern = te.callValidateCode = te.schemaProperties = te.allSchemaProperties = te.noPropertyInData = te.propertyInData = te.isOwnProperty = te.hasPropFunc = te.reportMissingProp = te.checkMissingProp = te.checkReportMissingProp = void 0;
const le = Y, wa = A, Et = ze, lf = A;
function uf(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ba(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, le._)`${t}` }, !0), e.error();
  });
}
te.checkReportMissingProp = uf;
function df({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, le.or)(...n.map((a) => (0, le.and)(ba(e, t, a, r.ownProperties), (0, le._)`${s} = ${a}`)));
}
te.checkMissingProp = df;
function ff(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
te.reportMissingProp = ff;
function dl(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, le._)`Object.prototype.hasOwnProperty`
  });
}
te.hasPropFunc = dl;
function Ea(e, t, r) {
  return (0, le._)`${dl(e)}.call(${t}, ${r})`;
}
te.isOwnProperty = Ea;
function hf(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} !== undefined`;
  return n ? (0, le._)`${s} && ${Ea(e, t, r)}` : s;
}
te.propertyInData = hf;
function ba(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} === undefined`;
  return n ? (0, le.or)(s, (0, le.not)(Ea(e, t, r))) : s;
}
te.noPropertyInData = ba;
function fl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
te.allSchemaProperties = fl;
function mf(e, t) {
  return fl(t).filter((r) => !(0, wa.alwaysValidSchema)(e, t[r]));
}
te.schemaProperties = mf;
function pf({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, u, d) {
  const c = d ? (0, le._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Et.default.instancePath, (0, le.strConcat)(Et.default.instancePath, a)],
    [Et.default.parentData, o.parentData],
    [Et.default.parentDataProperty, o.parentDataProperty],
    [Et.default.rootData, Et.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Et.default.dynamicAnchors, Et.default.dynamicAnchors]);
  const b = (0, le._)`${c}, ${r.object(...h)}`;
  return u !== le.nil ? (0, le._)`${l}.call(${u}, ${b})` : (0, le._)`${l}(${b})`;
}
te.callValidateCode = pf;
const $f = (0, le._)`new RegExp`;
function yf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, le._)`${s.code === "new RegExp" ? $f : (0, lf.useFunc)(e, s)}(${r}, ${n})`
  });
}
te.usePattern = yf;
function gf(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const u = t.const("len", (0, le._)`${r}.length`);
    t.forRange("i", 0, u, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: wa.Type.Num
      }, a), t.if((0, le.not)(a), l);
    });
  }
}
te.validateArray = gf;
function _f(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((u) => (0, wa.alwaysValidSchema)(s, u)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((u, d) => {
    const c = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, l);
    t.assign(o, (0, le._)`${o} || ${l}`), e.mergeValidEvaluated(c, l) || t.if((0, le.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
te.validateUnion = _f;
Object.defineProperty(at, "__esModule", { value: !0 });
at.validateKeywordUsage = at.validSchemaType = at.funcKeywordCode = at.macroKeywordCode = void 0;
const Te = Y, Yt = ze, vf = te, wf = on;
function Ef(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), u = hl(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: Te.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: u,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
at.macroKeywordCode = Ef;
function bf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: u } = e;
  Pf(u, t);
  const d = !l && t.compile ? t.compile.call(u.self, a, o, u) : t.validate, c = hl(n, s, d), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      g(), t.modifying && Pi(e), y(() => e.error());
    else {
      const m = t.async ? _() : w();
      t.modifying && Pi(e), y(() => Sf(e, m));
    }
  }
  function _() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, Te._)`await `), (v) => n.assign(h, !1).if((0, Te._)`${v} instanceof ${u.ValidationError}`, () => n.assign(m, (0, Te._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, Te._)`${c}.errors`;
    return n.assign(m, null), g(Te.nil), m;
  }
  function g(m = t.async ? (0, Te._)`await ` : Te.nil) {
    const v = u.opts.passContext ? Yt.default.this : Yt.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, Te._)`${m}${(0, vf.callValidateCode)(e, c, v, N)}`, t.modifying);
  }
  function y(m) {
    var v;
    n.if((0, Te.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
at.funcKeywordCode = bf;
function Pi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Te._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Sf(e, t) {
  const { gen: r } = e;
  r.if((0, Te._)`Array.isArray(${t})`, () => {
    r.assign(Yt.default.vErrors, (0, Te._)`${Yt.default.vErrors} === null ? ${t} : ${Yt.default.vErrors}.concat(${t})`).assign(Yt.default.errors, (0, Te._)`${Yt.default.vErrors}.length`), (0, wf.extendErrors)(e);
  }, () => e.error());
}
function Pf({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function hl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Te.stringify)(r) });
}
function Nf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
at.validSchemaType = Nf;
function Rf({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const u = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(u);
    else
      throw new Error(u);
  }
}
at.validateKeywordUsage = Rf;
var jt = {};
Object.defineProperty(jt, "__esModule", { value: !0 });
jt.extendSubschemaMode = jt.extendSubschemaData = jt.getSubschema = void 0;
const nt = Y, ml = A;
function Of(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, nt._)`${e.schemaPath}${(0, nt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, nt._)`${e.schemaPath}${(0, nt.getProperty)(t)}${(0, nt.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, ml.escapeFragment)(r)}`
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
jt.getSubschema = Of;
function If(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: c, opts: h } = t, b = l.let("data", (0, nt._)`${t.data}${(0, nt.getProperty)(r)}`, !0);
    u(b), e.errorPath = (0, nt.str)`${d}${(0, ml.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, nt._)`${r}`, e.dataPathArr = [...c, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof nt.Name ? s : l.let("data", s, !0);
    u(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function u(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
jt.extendSubschemaData = If;
function Tf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
jt.extendSubschemaMode = Tf;
var be = {}, ls = function e(t, r) {
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
}, pl = { exports: {} }, It = pl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Cn(t, n, s, e, "", e);
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
function Cn(e, t, r, n, s, a, o, l, u, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, u, d);
    for (var c in n) {
      var h = n[c];
      if (Array.isArray(h)) {
        if (c in It.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            Cn(e, t, r, h[b], s + "/" + c + "/" + b, a, s, c, n, b);
      } else if (c in It.propsKeywords) {
        if (h && typeof h == "object")
          for (var _ in h)
            Cn(e, t, r, h[_], s + "/" + c + "/" + kf(_), a, s, c, n, _);
      } else (c in It.keywords || e.allKeys && !(c in It.skipKeywords)) && Cn(e, t, r, h, s + "/" + c, a, s, c, n);
    }
    r(n, s, a, o, l, u, d);
  }
}
function kf(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var jf = pl.exports;
Object.defineProperty(be, "__esModule", { value: !0 });
be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
const Af = A, Cf = ls, Df = jf, Mf = /* @__PURE__ */ new Set([
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
function Lf(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Qs(e) : t ? $l(e) <= t : !1;
}
be.inlineRef = Lf;
const Vf = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Qs(e) {
  for (const t in e) {
    if (Vf.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Qs) || typeof r == "object" && Qs(r))
      return !0;
  }
  return !1;
}
function $l(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Mf.has(r) && (typeof e[r] == "object" && (0, Af.eachItem)(e[r], (n) => t += $l(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function yl(e, t = "", r) {
  r !== !1 && (t = _r(t));
  const n = e.parse(t);
  return gl(e, n);
}
be.getFullPath = yl;
function gl(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
be._getFullPath = gl;
const Ff = /#\/?$/;
function _r(e) {
  return e ? e.replace(Ff, "") : "";
}
be.normalizeId = _r;
function zf(e, t, r) {
  return r = _r(r), e.resolve(t, r);
}
be.resolveUrl = zf;
const Uf = /^[a-z_][-a-z0-9._]*$/i;
function qf(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = _r(e[r] || t), a = { "": s }, o = yl(n, s, !1), l = {}, u = /* @__PURE__ */ new Set();
  return Df(e, { allKeys: !0 }, (h, b, _, w) => {
    if (w === void 0)
      return;
    const g = o + b;
    let y = a[w];
    typeof h[r] == "string" && (y = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[b] = y;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = _r(y ? R(y, N) : N), u.has(N))
        throw c(N);
      u.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== _r(g) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = g), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!Uf.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, b, _) {
    if (b !== void 0 && !Cf(h, b))
      throw c(_);
  }
  function c(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
be.getSchemaRefs = qf;
Object.defineProperty(Qe, "__esModule", { value: !0 });
Qe.getData = Qe.KeywordCxt = Qe.validateFunctionCode = void 0;
const _l = Er, Ni = ge, Sa = ht, Wn = ge, Gf = cs, Jr = at, Ts = jt, U = Y, B = ze, Kf = be, mt = A, zr = on;
function Hf(e) {
  if (El(e) && (bl(e), wl(e))) {
    Jf(e);
    return;
  }
  vl(e, () => (0, _l.topBoolOrEmptySchema)(e));
}
Qe.validateFunctionCode = Hf;
function vl({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, U._)`${B.default.data}, ${B.default.valCxt}`, n.$async, () => {
    e.code((0, U._)`"use strict"; ${Ri(r, s)}`), Wf(e, s), e.code(a);
  }) : e.func(t, (0, U._)`${B.default.data}, ${Bf(s)}`, n.$async, () => e.code(Ri(r, s)).code(a));
}
function Bf(e) {
  return (0, U._)`{${B.default.instancePath}="", ${B.default.parentData}, ${B.default.parentDataProperty}, ${B.default.rootData}=${B.default.data}${e.dynamicRef ? (0, U._)`, ${B.default.dynamicAnchors}={}` : U.nil}}={}`;
}
function Wf(e, t) {
  e.if(B.default.valCxt, () => {
    e.var(B.default.instancePath, (0, U._)`${B.default.valCxt}.${B.default.instancePath}`), e.var(B.default.parentData, (0, U._)`${B.default.valCxt}.${B.default.parentData}`), e.var(B.default.parentDataProperty, (0, U._)`${B.default.valCxt}.${B.default.parentDataProperty}`), e.var(B.default.rootData, (0, U._)`${B.default.valCxt}.${B.default.rootData}`), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, U._)`${B.default.valCxt}.${B.default.dynamicAnchors}`);
  }, () => {
    e.var(B.default.instancePath, (0, U._)`""`), e.var(B.default.parentData, (0, U._)`undefined`), e.var(B.default.parentDataProperty, (0, U._)`undefined`), e.var(B.default.rootData, B.default.data), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, U._)`{}`);
  });
}
function Jf(e) {
  const { schema: t, opts: r, gen: n } = e;
  vl(e, () => {
    r.$comment && t.$comment && Pl(e), xf(e), n.let(B.default.vErrors, null), n.let(B.default.errors, 0), r.unevaluated && Xf(e), Sl(e), rh(e);
  });
}
function Xf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, U._)`${r}.evaluated`), t.if((0, U._)`${e.evaluated}.dynamicProps`, () => t.assign((0, U._)`${e.evaluated}.props`, (0, U._)`undefined`)), t.if((0, U._)`${e.evaluated}.dynamicItems`, () => t.assign((0, U._)`${e.evaluated}.items`, (0, U._)`undefined`));
}
function Ri(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, U._)`/*# sourceURL=${r} */` : U.nil;
}
function Yf(e, t) {
  if (El(e) && (bl(e), wl(e))) {
    Qf(e, t);
    return;
  }
  (0, _l.boolOrEmptySchema)(e, t);
}
function wl({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function El(e) {
  return typeof e.schema != "boolean";
}
function Qf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Pl(e), eh(e), th(e);
  const a = n.const("_errs", B.default.errors);
  Sl(e, a), n.var(t, (0, U._)`${a} === ${B.default.errors}`);
}
function bl(e) {
  (0, mt.checkUnknownRules)(e), Zf(e);
}
function Sl(e, t) {
  if (e.opts.jtd)
    return Oi(e, [], !1, t);
  const r = (0, Ni.getSchemaTypes)(e.schema), n = (0, Ni.coerceAndCheckDataType)(e, r);
  Oi(e, r, !n, t);
}
function Zf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, mt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function xf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, mt.checkStrictMode)(e, "default is ignored in the schema root");
}
function eh(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Kf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function th(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Pl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, U._)`${B.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, U.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, U._)`${B.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function rh(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, U._)`${B.default.errors} === 0`, () => t.return(B.default.data), () => t.throw((0, U._)`new ${s}(${B.default.vErrors})`)) : (t.assign((0, U._)`${n}.errors`, B.default.vErrors), a.unevaluated && nh(e), t.return((0, U._)`${B.default.errors} === 0`));
}
function nh({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof U.Name && e.assign((0, U._)`${t}.props`, r), n instanceof U.Name && e.assign((0, U._)`${t}.items`, n);
}
function Oi(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: u, self: d } = e, { RULES: c } = d;
  if (a.$ref && (u.ignoreKeywordsWithRef || !(0, mt.schemaHasRulesButRef)(a, c))) {
    s.block(() => Ol(e, "$ref", c.all.$ref.definition));
    return;
  }
  u.jtd || sh(e, t), s.block(() => {
    for (const b of c.rules)
      h(b);
    h(c.post);
  });
  function h(b) {
    (0, Sa.shouldUseGroup)(a, b) && (b.type ? (s.if((0, Wn.checkDataType)(b.type, o, u.strictNumbers)), Ii(e, b), t.length === 1 && t[0] === b.type && r && (s.else(), (0, Wn.reportTypeError)(e)), s.endIf()) : Ii(e, b), l || s.if((0, U._)`${B.default.errors} === ${n || 0}`));
  }
}
function Ii(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Gf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Sa.shouldUseRule)(n, a) && Ol(e, a.keyword, a.definition, t.type);
  });
}
function sh(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (ah(e, t), e.opts.allowUnionTypes || oh(e, t), ih(e, e.dataTypes));
}
function ah(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Nl(e.dataTypes, r) || Pa(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), lh(e, t);
  }
}
function oh(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Pa(e, "use allowUnionTypes to allow union type keyword");
}
function ih(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Sa.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => ch(t, o)) && Pa(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function ch(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Nl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function lh(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Nl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Pa(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, mt.checkStrictMode)(e, t, e.opts.strictTypes);
}
let Rl = class {
  constructor(t, r, n) {
    if ((0, Jr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, mt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Il(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Jr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", B.default.errors));
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
        const u = Array.isArray(n) ? n : [n];
        return (0, U._)`${(0, Wn.checkDataTypes)(u, r, a.opts.strictNumbers, Wn.DataType.Wrong)}`;
      }
      return U.nil;
    }
    function l() {
      if (s.validateSchema) {
        const u = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, U._)`!${u}(${r})`;
      }
      return U.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Ts.getSubschema)(this.it, t);
    (0, Ts.extendSubschemaData)(n, this.it, t), (0, Ts.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return Yf(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = mt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = mt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, U.Name)), !0;
  }
};
Qe.KeywordCxt = Rl;
function Ol(e, t, r, n) {
  const s = new Rl(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Jr.funcKeywordCode)(s, r) : "macro" in r ? (0, Jr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Jr.funcKeywordCode)(s, r);
}
const uh = /^\/(?:[^~]|~0|~1)*$/, dh = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Il(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return B.default.rootData;
  if (e[0] === "/") {
    if (!uh.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = B.default.rootData;
  } else {
    const d = dh.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const c = +d[1];
    if (s = d[2], s === "#") {
      if (c >= t)
        throw new Error(u("property/index", c));
      return n[t - c];
    }
    if (c > t)
      throw new Error(u("data", c));
    if (a = r[t - c], !s)
      return a;
  }
  let o = a;
  const l = s.split("/");
  for (const d of l)
    d && (a = (0, U._)`${a}${(0, U.getProperty)((0, mt.unescapeJsonPointer)(d))}`, o = (0, U._)`${o} && ${a}`);
  return o;
  function u(d, c) {
    return `Cannot access ${d} ${c} levels up, current level is ${t}`;
  }
}
Qe.getData = Il;
var cn = {};
Object.defineProperty(cn, "__esModule", { value: !0 });
class fh extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
cn.default = fh;
var Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
const ks = be;
class hh extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, ks.resolveUrl)(t, r, n), this.missingSchema = (0, ks.normalizeId)((0, ks.getFullPath)(t, this.missingRef));
  }
}
Nr.default = hh;
var je = {};
Object.defineProperty(je, "__esModule", { value: !0 });
je.resolveSchema = je.getCompilingSchema = je.resolveRef = je.compileSchema = je.SchemaEnv = void 0;
const Ke = Y, mh = cn, Jt = ze, Je = be, Ti = A, ph = Qe;
let us = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Je.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
je.SchemaEnv = us;
function Na(e) {
  const t = Tl.call(this, e);
  if (t)
    return t;
  const r = (0, Je.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Ke.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: mh.default,
    code: (0, Ke._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const u = o.scopeName("validate");
  e.validateName = u;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Jt.default.data,
    parentData: Jt.default.parentData,
    parentDataProperty: Jt.default.parentDataProperty,
    dataNames: [Jt.default.data],
    dataPathArr: [Ke.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ke.stringify)(e.schema) } : { ref: e.schema }),
    validateName: u,
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
  let c;
  try {
    this._compilations.add(e), (0, ph.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    c = `${o.scopeRefs(Jt.default.scope)}return ${h}`, this.opts.code.process && (c = this.opts.code.process(c, e));
    const _ = new Function(`${Jt.default.self}`, `${Jt.default.scope}`, c)(this, this.scope.get());
    if (this.scope.value(u, { ref: _ }), _.errors = null, _.schema = e.schema, _.schemaEnv = e, e.$async && (_.$async = !0), this.opts.code.source === !0 && (_.source = { validateName: u, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: g } = d;
      _.evaluated = {
        props: w instanceof Ke.Name ? void 0 : w,
        items: g instanceof Ke.Name ? void 0 : g,
        dynamicProps: w instanceof Ke.Name,
        dynamicItems: g instanceof Ke.Name
      }, _.source && (_.source.evaluated = (0, Ke.stringify)(_.evaluated));
    }
    return e.validate = _, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, c && this.logger.error("Error compiling schema, function code:", c), h;
  } finally {
    this._compilations.delete(e);
  }
}
je.compileSchema = Na;
function $h(e, t, r) {
  var n;
  r = (0, Je.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = _h.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new us({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = yh.call(this, a);
}
je.resolveRef = $h;
function yh(e) {
  return (0, Je.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Na.call(this, e);
}
function Tl(e) {
  for (const t of this._compilations)
    if (gh(t, e))
      return t;
}
je.getCompilingSchema = Tl;
function gh(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function _h(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || ds.call(this, e, t);
}
function ds(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Je._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Je.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return js.call(this, r, e);
  const a = (0, Je.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = ds.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : js.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Na.call(this, o), a === (0, Je.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: u } = this.opts, d = l[u];
      return d && (s = (0, Je.resolveUrl)(this.opts.uriResolver, s, d)), new us({ schema: l, schemaId: u, root: e, baseId: s });
    }
    return js.call(this, r, o);
  }
}
je.resolveSchema = ds;
const vh = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function js(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const u = r[(0, Ti.unescapeFragment)(l)];
    if (u === void 0)
      return;
    r = u;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !vh.has(l) && d && (t = (0, Je.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ti.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Je.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ds.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new us({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const wh = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Eh = "Meta-schema for $data reference (JSON AnySchema extension proposal)", bh = "object", Sh = [
  "$data"
], Ph = {
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
}, Nh = !1, Rh = {
  $id: wh,
  description: Eh,
  type: bh,
  required: Sh,
  properties: Ph,
  additionalProperties: Nh
};
var Ra = {}, fs = { exports: {} };
const Oh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), kl = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function jl(e) {
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
const Ih = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function ki(e) {
  return e.length = 0, !0;
}
function Th(e, t, r) {
  if (e.length) {
    const n = jl(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function kh(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, l = Th;
  for (let u = 0; u < e.length; u++) {
    const d = e[u];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (o = !0), !l(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        u > 0 && e[u - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!l(s, n, r))
          break;
        l = ki;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (l === ki ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(jl(s))), r.address = n.join(""), r;
}
function Al(e) {
  if (jh(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = kh(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function jh(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function Ah(e) {
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
function Ch(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function Dh(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!kl(r)) {
      const n = Al(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Cl = {
  nonSimpleDomain: Ih,
  recomposeAuthority: Dh,
  normalizeComponentEncoding: Ch,
  removeDotSegments: Ah,
  isIPv4: kl,
  isUUID: Oh,
  normalizeIPv6: Al
};
const { isUUID: Mh } = Cl, Lh = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Dl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Ml(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Ll(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Vh(e) {
  return e.secure = Dl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Fh(e) {
  if ((e.port === (Dl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function zh(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(Lh);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = Oa(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function Uh(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = Oa(s);
  a && (e = a.serialize(e, t));
  const o = e, l = e.nss;
  return o.path = `${n || t.nid}:${l}`, t.skipEscape = !0, o;
}
function qh(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Mh(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function Gh(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Vl = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Ml,
    serialize: Ll
  }
), Kh = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Vl.domainHost,
    parse: Ml,
    serialize: Ll
  }
), Dn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: Vh,
    serialize: Fh
  }
), Hh = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Dn.domainHost,
    parse: Dn.parse,
    serialize: Dn.serialize
  }
), Bh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: zh,
    serialize: Uh,
    skipNormalize: !0
  }
), Wh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: qh,
    serialize: Gh,
    skipNormalize: !0
  }
), Jn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Vl,
    https: Kh,
    ws: Dn,
    wss: Hh,
    urn: Bh,
    "urn:uuid": Wh
  }
);
Object.setPrototypeOf(Jn, null);
function Oa(e) {
  return e && (Jn[
    /** @type {SchemeName} */
    e
  ] || Jn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var Jh = {
  SCHEMES: Jn,
  getSchemeHandler: Oa
};
const { normalizeIPv6: Xh, removeDotSegments: Hr, recomposeAuthority: Yh, normalizeComponentEncoding: mn, isIPv4: Qh, nonSimpleDomain: Zh } = Cl, { SCHEMES: xh, getSchemeHandler: Fl } = Jh;
function em(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  ot(yt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  yt(ot(e, t), t)), e;
}
function tm(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = zl(yt(e, n), yt(t, n), n, !0);
  return n.skipEscape = !0, ot(s, n);
}
function zl(e, t, r, n) {
  const s = {};
  return n || (e = yt(ot(e, r), r), t = yt(ot(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Hr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Hr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Hr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Hr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function rm(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = ot(mn(yt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = ot(mn(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = ot(mn(yt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = ot(mn(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function ot(e, t) {
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
  }, n = Object.assign({}, t), s = [], a = Fl(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Yh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let l = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (l = Hr(l)), o === void 0 && l[0] === "/" && l[1] === "/" && (l = "/%2F" + l.slice(2)), s.push(l);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const nm = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function yt(e, t) {
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
  const a = e.match(nm);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (Qh(n.host) === !1) {
        const u = Xh(n.host);
        n.host = u.host.toLowerCase(), s = u.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Fl(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && Zh(n.host))
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
const Ia = {
  SCHEMES: xh,
  normalize: em,
  resolve: tm,
  resolveComponent: zl,
  equal: rm,
  serialize: ot,
  parse: yt
};
fs.exports = Ia;
fs.exports.default = Ia;
fs.exports.fastUri = Ia;
var Ul = fs.exports;
Object.defineProperty(Ra, "__esModule", { value: !0 });
const ql = Ul;
ql.code = 'require("ajv/dist/runtime/uri").default';
Ra.default = ql;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Qe;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = Y;
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
  const n = cn, s = Nr, a = ar, o = je, l = Y, u = be, d = ge, c = A, h = Rh, b = Ra, _ = (P, p) => new RegExp(P, p);
  _.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  }, v = 200;
  function N(P) {
    var p, S, $, i, f, E, I, k, F, V, ne, Le, Ct, Dt, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht, Bt;
    const Ge = P.strict, Wt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Cr = Wt === !0 || Wt === void 0 ? 1 : Wt || 0, Dr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Rs = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : Ge) !== null && E !== void 0 ? E : !0,
      strictNumbers: (k = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ge) !== null && k !== void 0 ? k : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ge) !== null && V !== void 0 ? V : "log",
      strictTuples: (Le = (ne = P.strictTuples) !== null && ne !== void 0 ? ne : Ge) !== null && Le !== void 0 ? Le : "log",
      strictRequired: (Dt = (Ct = P.strictRequired) !== null && Ct !== void 0 ? Ct : Ge) !== null && Dt !== void 0 ? Dt : !1,
      code: P.code ? { ...P.code, optimize: Cr, regExp: Dr } : { optimize: Cr, regExp: Dr },
      loopRequired: (Mt = P.loopRequired) !== null && Mt !== void 0 ? Mt : v,
      loopEnum: (Lt = P.loopEnum) !== null && Lt !== void 0 ? Lt : v,
      meta: (Vt = P.meta) !== null && Vt !== void 0 ? Vt : !0,
      messages: (Ft = P.messages) !== null && Ft !== void 0 ? Ft : !0,
      inlineRefs: (zt = P.inlineRefs) !== null && zt !== void 0 ? zt : !0,
      schemaId: (Ut = P.schemaId) !== null && Ut !== void 0 ? Ut : "$id",
      addUsedSchema: (qt = P.addUsedSchema) !== null && qt !== void 0 ? qt : !0,
      validateSchema: (Gt = P.validateSchema) !== null && Gt !== void 0 ? Gt : !0,
      validateFormats: (Kt = P.validateFormats) !== null && Kt !== void 0 ? Kt : !0,
      unicodeRegExp: (Ht = P.unicodeRegExp) !== null && Ht !== void 0 ? Ht : !0,
      int32range: (Bt = P.int32range) !== null && Bt !== void 0 ? Bt : !0,
      uriResolver: Rs
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, y, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && me.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), X.call(this), p.validateFormats = i;
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
      async function i(V, ne) {
        await f.call(this, V.$schema);
        const Le = this._addSchema(V, ne);
        return Le.validate || E.call(this, Le);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function E(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (ne) {
          if (!(ne instanceof s.default))
            throw ne;
          return I.call(this, ne), await k.call(this, ne.missingSchema), E.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: ne }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${ne} cannot be resolved`);
      }
      async function k(V) {
        const ne = await F.call(this, V);
        this.refs[V] || await f.call(this, ne.$schema), this.refs[V] || this.addSchema(ne, V, S);
      }
      async function F(V) {
        const ne = this._loading[V];
        if (ne)
          return ne;
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
        for (const E of p)
          this.addSchema(E, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: E } = this.opts;
        if (f = p[E], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, u.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
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
          return $ && ($ = (0, u.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
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
      if (T.call(this, $, S), !S)
        return (0, c.eachItem)($, (f) => j.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, c.eachItem)($, i.type.length === 0 ? (f) => j.call(this, f, i) : (f) => i.type.forEach((E) => j.call(this, f, i, E))), this;
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
        let E = p;
        for (const I of f)
          E = E[I];
        for (const I in $) {
          const k = $[I];
          if (typeof k != "object")
            continue;
          const { $data: F } = k.definition, V = E[I];
          F && V && (E[I] = M(V));
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
      let E;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        E = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let k = this._cache.get(p);
      if (k !== void 0)
        return k;
      $ = (0, u.normalizeId)(E || $);
      const F = u.getSchemaRefs.call(this, p, $);
      return k = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(k.schema, k), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = k), i && this.validateSchema(p, !0), k;
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
    return P = (0, u.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function X() {
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
    for (const p of w)
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
  const se = /^[a-z_$][a-z0-9_$:-]*$/i;
  function T(P, p) {
    const { RULES: S } = this;
    if ((0, c.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!se.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function j(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: k }) => k === S);
    if (E || (E = { type: S, rules: [] }, f.rules.push(E)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? L.call(this, E, I, p.before) : E.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((k) => this.addKeyword(k));
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
})(xc);
var Ta = {}, ka = {}, ja = {};
Object.defineProperty(ja, "__esModule", { value: !0 });
const sm = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ja.default = sm;
var gt = {};
Object.defineProperty(gt, "__esModule", { value: !0 });
gt.callRef = gt.getValidate = void 0;
const am = Nr, ji = te, Ce = Y, lr = ze, Ai = je, pn = A, om = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: u } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const c = Ai.resolveRef.call(u, d, s, r);
    if (c === void 0)
      throw new am.default(n.opts.uriResolver, s, r);
    if (c instanceof Ai.SchemaEnv)
      return b(c);
    return _(c);
    function h() {
      if (a === d)
        return Mn(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return Mn(e, (0, Ce._)`${w}.validate`, d, d.$async);
    }
    function b(w) {
      const g = Gl(e, w);
      Mn(e, g, w, w.$async);
    }
    function _(w) {
      const g = t.scopeValue("schema", l.code.source === !0 ? { ref: w, code: (0, Ce.stringify)(w) } : { ref: w }), y = t.name("valid"), m = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Ce.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function Gl(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ce._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
gt.getValidate = Gl;
function Mn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: u } = a, d = u.passContext ? lr.default.this : Ce.nil;
  n ? c() : h();
  function c() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Ce._)`await ${(0, ji.callValidateCode)(e, t, d)}`), _(t), o || s.assign(w, !0);
    }, (g) => {
      s.if((0, Ce._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), b(g), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, ji.callValidateCode)(e, t, d), () => _(t), () => b(t));
  }
  function b(w) {
    const g = (0, Ce._)`${w}.errors`;
    s.assign(lr.default.vErrors, (0, Ce._)`${lr.default.vErrors} === null ? ${g} : ${lr.default.vErrors}.concat(${g})`), s.assign(lr.default.errors, (0, Ce._)`${lr.default.vErrors}.length`);
  }
  function _(w) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = pn.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, Ce._)`${w}.evaluated.props`);
        a.props = pn.mergeEvaluated.props(s, m, a.props, Ce.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = pn.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Ce._)`${w}.evaluated.items`);
        a.items = pn.mergeEvaluated.items(s, m, a.items, Ce.Name);
      }
  }
}
gt.callRef = Mn;
gt.default = om;
Object.defineProperty(ka, "__esModule", { value: !0 });
const im = ja, cm = gt, lm = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  im.default,
  cm.default
];
ka.default = lm;
var Aa = {}, Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Xn = Y, bt = Xn.operators, Yn = {
  maximum: { okStr: "<=", ok: bt.LTE, fail: bt.GT },
  minimum: { okStr: ">=", ok: bt.GTE, fail: bt.LT },
  exclusiveMaximum: { okStr: "<", ok: bt.LT, fail: bt.GTE },
  exclusiveMinimum: { okStr: ">", ok: bt.GT, fail: bt.LTE }
}, um = {
  message: ({ keyword: e, schemaCode: t }) => (0, Xn.str)`must be ${Yn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Xn._)`{comparison: ${Yn[e].okStr}, limit: ${t}}`
}, dm = {
  keyword: Object.keys(Yn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: um,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Xn._)`${r} ${Yn[t].fail} ${n} || isNaN(${r})`);
  }
};
Ca.default = dm;
var Da = {};
Object.defineProperty(Da, "__esModule", { value: !0 });
const Xr = Y, fm = {
  message: ({ schemaCode: e }) => (0, Xr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Xr._)`{multipleOf: ${e}}`
}, hm = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: fm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, Xr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Xr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Xr._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Da.default = hm;
var Ma = {}, La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
function Kl(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
La.default = Kl;
Kl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Qt = Y, mm = A, pm = La, $m = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Qt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Qt._)`{limit: ${e}}`
}, ym = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: $m,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Qt.operators.GT : Qt.operators.LT, o = s.opts.unicode === !1 ? (0, Qt._)`${r}.length` : (0, Qt._)`${(0, mm.useFunc)(e.gen, pm.default)}(${r})`;
    e.fail$data((0, Qt._)`${o} ${a} ${n}`);
  }
};
Ma.default = ym;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const gm = te, Qn = Y, _m = {
  message: ({ schemaCode: e }) => (0, Qn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Qn._)`{pattern: ${e}}`
}, vm = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: _m,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, Qn._)`(new RegExp(${s}, ${o}))` : (0, gm.usePattern)(e, n);
    e.fail$data((0, Qn._)`!${l}.test(${t})`);
  }
};
Va.default = vm;
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Yr = Y, wm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Yr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Yr._)`{limit: ${e}}`
}, Em = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: wm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Yr.operators.GT : Yr.operators.LT;
    e.fail$data((0, Yr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Fa.default = Em;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const Ur = te, Qr = Y, bm = A, Sm = {
  message: ({ params: { missingProperty: e } }) => (0, Qr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Qr._)`{missingProperty: ${e}}`
}, Pm = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Sm,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: l } = o;
    if (!a && r.length === 0)
      return;
    const u = r.length >= l.loopRequired;
    if (o.allErrors ? d() : c(), l.strictRequired) {
      const _ = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const g of r)
        if ((_ == null ? void 0 : _[g]) === void 0 && !w.has(g)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${y}" (strictRequired)`;
          (0, bm.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (u || a)
        e.block$data(Qr.nil, h);
      else
        for (const _ of r)
          (0, Ur.checkReportMissingProp)(e, _);
    }
    function c() {
      const _ = t.let("missing");
      if (u || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => b(_, w)), e.ok(w);
      } else
        t.if((0, Ur.checkMissingProp)(e, r, _)), (0, Ur.reportMissingProp)(e, _), t.else();
    }
    function h() {
      t.forOf("prop", n, (_) => {
        e.setParams({ missingProperty: _ }), t.if((0, Ur.noPropertyInData)(t, s, _, l.ownProperties), () => e.error());
      });
    }
    function b(_, w) {
      e.setParams({ missingProperty: _ }), t.forOf(_, n, () => {
        t.assign(w, (0, Ur.propertyInData)(t, s, _, l.ownProperties)), t.if((0, Qr.not)(w), () => {
          e.error(), t.break();
        });
      }, Qr.nil);
    }
  }
};
za.default = Pm;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const Zr = Y, Nm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Zr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Zr._)`{limit: ${e}}`
}, Rm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Nm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Zr.operators.GT : Zr.operators.LT;
    e.fail$data((0, Zr._)`${r}.length ${s} ${n}`);
  }
};
Ua.default = Rm;
var qa = {}, ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
const Hl = ls;
Hl.code = 'require("ajv/dist/runtime/equal").default';
ln.default = Hl;
Object.defineProperty(qa, "__esModule", { value: !0 });
const As = ge, we = Y, Om = A, Im = ln, Tm = {
  message: ({ params: { i: e, j: t } }) => (0, we.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, we._)`{i: ${e}, j: ${t}}`
}, km = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Tm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const u = t.let("valid"), d = a.items ? (0, As.getSchemaTypes)(a.items) : [];
    e.block$data(u, c, (0, we._)`${o} === false`), e.ok(u);
    function c() {
      const w = t.let("i", (0, we._)`${r}.length`), g = t.let("j");
      e.setParams({ i: w, j: g }), t.assign(u, !0), t.if((0, we._)`${w} > 1`, () => (h() ? b : _)(w, g));
    }
    function h() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function b(w, g) {
      const y = t.name("item"), m = (0, As.checkDataTypes)(d, y, l.opts.strictNumbers, As.DataType.Wrong), v = t.const("indices", (0, we._)`{}`);
      t.for((0, we._)`;${w}--;`, () => {
        t.let(y, (0, we._)`${r}[${w}]`), t.if(m, (0, we._)`continue`), d.length > 1 && t.if((0, we._)`typeof ${y} == "string"`, (0, we._)`${y} += "_"`), t.if((0, we._)`typeof ${v}[${y}] == "number"`, () => {
          t.assign(g, (0, we._)`${v}[${y}]`), e.error(), t.assign(u, !1).break();
        }).code((0, we._)`${v}[${y}] = ${w}`);
      });
    }
    function _(w, g) {
      const y = (0, Om.useFunc)(t, Im.default), m = t.name("outer");
      t.label(m).for((0, we._)`;${w}--;`, () => t.for((0, we._)`${g} = ${w}; ${g}--;`, () => t.if((0, we._)`${y}(${r}[${w}], ${r}[${g}])`, () => {
        e.error(), t.assign(u, !1).break(m);
      })));
    }
  }
};
qa.default = km;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Zs = Y, jm = A, Am = ln, Cm = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Zs._)`{allowedValue: ${e}}`
}, Dm = {
  keyword: "const",
  $data: !0,
  error: Cm,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Zs._)`!${(0, jm.useFunc)(t, Am.default)}(${r}, ${s})`) : e.fail((0, Zs._)`${a} !== ${r}`);
  }
};
Ga.default = Dm;
var Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Br = Y, Mm = A, Lm = ln, Vm = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Br._)`{allowedValues: ${e}}`
}, Fm = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Vm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let u;
    const d = () => u ?? (u = (0, Mm.useFunc)(t, Lm.default));
    let c;
    if (l || n)
      c = t.let("valid"), e.block$data(c, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const _ = t.const("vSchema", a);
      c = (0, Br.or)(...s.map((w, g) => b(_, g)));
    }
    e.pass(c);
    function h() {
      t.assign(c, !1), t.forOf("v", a, (_) => t.if((0, Br._)`${d()}(${r}, ${_})`, () => t.assign(c, !0).break()));
    }
    function b(_, w) {
      const g = s[w];
      return typeof g == "object" && g !== null ? (0, Br._)`${d()}(${r}, ${_}[${w}])` : (0, Br._)`${r} === ${g}`;
    }
  }
};
Ka.default = Fm;
Object.defineProperty(Aa, "__esModule", { value: !0 });
const zm = Ca, Um = Da, qm = Ma, Gm = Va, Km = Fa, Hm = za, Bm = Ua, Wm = qa, Jm = Ga, Xm = Ka, Ym = [
  // number
  zm.default,
  Um.default,
  // string
  qm.default,
  Gm.default,
  // object
  Km.default,
  Hm.default,
  // array
  Bm.default,
  Wm.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Jm.default,
  Xm.default
];
Aa.default = Ym;
var Ha = {}, Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
Rr.validateAdditionalItems = void 0;
const Zt = Y, xs = A, Qm = {
  message: ({ params: { len: e } }) => (0, Zt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Zt._)`{limit: ${e}}`
}, Zm = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Qm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, xs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Bl(e, n);
  }
};
function Bl(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, Zt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Zt._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, xs.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Zt._)`${l} <= ${t.length}`);
    r.if((0, Zt.not)(d), () => u(d)), e.ok(d);
  }
  function u(d) {
    r.forRange("i", t.length, l, (c) => {
      e.subschema({ keyword: a, dataProp: c, dataPropType: xs.Type.Num }, d), o.allErrors || r.if((0, Zt.not)(d), () => r.break());
    });
  }
}
Rr.validateAdditionalItems = Bl;
Rr.default = Zm;
var Ba = {}, Or = {};
Object.defineProperty(Or, "__esModule", { value: !0 });
Or.validateTuple = void 0;
const Ci = Y, Ln = A, xm = te, ep = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Wl(e, "additionalItems", t);
    r.items = !0, !(0, Ln.alwaysValidSchema)(r, t) && e.ok((0, xm.validateArray)(e));
  }
};
function Wl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  c(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = Ln.mergeEvaluated.items(n, r.length, l.items));
  const u = n.name("valid"), d = n.const("len", (0, Ci._)`${a}.length`);
  r.forEach((h, b) => {
    (0, Ln.alwaysValidSchema)(l, h) || (n.if((0, Ci._)`${d} > ${b}`, () => e.subschema({
      keyword: o,
      schemaProp: b,
      dataProp: b
    }, u)), e.ok(u));
  });
  function c(h) {
    const { opts: b, errSchemaPath: _ } = l, w = r.length, g = w === h.minItems && (w === h.maxItems || h[t] === !1);
    if (b.strictTuples && !g) {
      const y = `"${o}" is ${w}-tuple, but minItems or maxItems/${t} are not specified or different at path "${_}"`;
      (0, Ln.checkStrictMode)(l, y, b.strictTuples);
    }
  }
}
Or.validateTuple = Wl;
Or.default = ep;
Object.defineProperty(Ba, "__esModule", { value: !0 });
const tp = Or, rp = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, tp.validateTuple)(e, "items")
};
Ba.default = rp;
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const Di = Y, np = A, sp = te, ap = Rr, op = {
  message: ({ params: { len: e } }) => (0, Di.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Di._)`{limit: ${e}}`
}, ip = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: op,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, np.alwaysValidSchema)(n, t) && (s ? (0, ap.validateAdditionalItems)(e, s) : e.ok((0, sp.validateArray)(e)));
  }
};
Wa.default = ip;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const Ue = Y, $n = A, cp = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ue.str)`must contain at least ${e} valid item(s)` : (0, Ue.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ue._)`{minContains: ${e}}` : (0, Ue._)`{minContains: ${e}, maxContains: ${t}}`
}, lp = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: cp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: u, maxContains: d } = n;
    a.opts.next ? (o = u === void 0 ? 1 : u, l = d) : o = 1;
    const c = t.const("len", (0, Ue._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, $n.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, $n.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, $n.alwaysValidSchema)(a, r)) {
      let g = (0, Ue._)`${c} >= ${o}`;
      l !== void 0 && (g = (0, Ue._)`${g} && ${c} <= ${l}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    l === void 0 && o === 1 ? _(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), l !== void 0 && t.if((0, Ue._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const g = t.name("_valid"), y = t.let("count", 0);
      _(g, () => t.if(g, () => w(y)));
    }
    function _(g, y) {
      t.forRange("i", 0, c, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: $n.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function w(g) {
      t.code((0, Ue._)`${g}++`), l === void 0 ? t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ue._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Ja.default = lp;
var hs = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = Y, r = A, n = te;
  e.error = {
    message: ({ params: { property: u, depsCount: d, deps: c } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${c} when property ${u} is present`;
    },
    params: ({ params: { property: u, depsCount: d, deps: c, missingProperty: h } }) => (0, t._)`{property: ${u},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${c}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(u) {
      const [d, c] = a(u);
      o(u, d), l(u, c);
    }
  };
  function a({ schema: u }) {
    const d = {}, c = {};
    for (const h in u) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(u[h]) ? d : c;
      b[h] = u[h];
    }
    return [d, c];
  }
  function o(u, d = u.schema) {
    const { gen: c, data: h, it: b } = u;
    if (Object.keys(d).length === 0)
      return;
    const _ = c.let("missing");
    for (const w in d) {
      const g = d[w];
      if (g.length === 0)
        continue;
      const y = (0, n.propertyInData)(c, h, w, b.opts.ownProperties);
      u.setParams({
        property: w,
        depsCount: g.length,
        deps: g.join(", ")
      }), b.allErrors ? c.if(y, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(u, m);
      }) : (c.if((0, t._)`${y} && (${(0, n.checkMissingProp)(u, g, _)})`), (0, n.reportMissingProp)(u, _), c.else());
    }
  }
  e.validatePropertyDeps = o;
  function l(u, d = u.schema) {
    const { gen: c, data: h, keyword: b, it: _ } = u, w = c.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(_, d[g]) || (c.if(
        (0, n.propertyInData)(c, h, g, _.opts.ownProperties),
        () => {
          const y = u.subschema({ keyword: b, schemaProp: g }, w);
          u.mergeValidEvaluated(y, w);
        },
        () => c.var(w, !0)
        // TODO var
      ), u.ok(w));
  }
  e.validateSchemaDeps = l, e.default = s;
})(hs);
var Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const Jl = Y, up = A, dp = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Jl._)`{propertyName: ${e.propertyName}}`
}, fp = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: dp,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, up.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Jl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Xa.default = fp;
var ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
const yn = te, Be = Y, hp = ze, gn = A, mp = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Be._)`{additionalProperty: ${e.additionalProperty}}`
}, pp = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: mp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: u } = o;
    if (o.props = !0, u.removeAdditional !== "all" && (0, gn.alwaysValidSchema)(o, r))
      return;
    const d = (0, yn.allSchemaProperties)(n.properties), c = (0, yn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Be._)`${a} === ${hp.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !c.length ? w(y) : t.if(b(y), () => w(y));
      });
    }
    function b(y) {
      let m;
      if (d.length > 8) {
        const v = (0, gn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, yn.isOwnProperty)(t, v, y);
      } else d.length ? m = (0, Be.or)(...d.map((v) => (0, Be._)`${y} === ${v}`)) : m = Be.nil;
      return c.length && (m = (0, Be.or)(m, ...c.map((v) => (0, Be._)`${(0, yn.usePattern)(e, v)}.test(${y})`))), (0, Be.not)(m);
    }
    function _(y) {
      t.code((0, Be._)`delete ${s}[${y}]`);
    }
    function w(y) {
      if (u.removeAdditional === "all" || u.removeAdditional && r === !1) {
        _(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, gn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        u.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, Be.not)(m), () => {
          e.reset(), _(y);
        })) : (g(y, m), l || t.if((0, Be.not)(m), () => t.break()));
      }
    }
    function g(y, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: gn.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
ms.default = pp;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const $p = Qe, Mi = te, Cs = A, Li = ms, yp = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Li.default.code(new $p.KeywordCxt(a, Li.default, "additionalProperties"));
    const o = (0, Mi.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Cs.mergeEvaluated.props(t, (0, Cs.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Cs.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const u = t.name("valid");
    for (const h of l)
      d(h) ? c(h) : (t.if((0, Mi.propertyInData)(t, s, h, a.opts.ownProperties)), c(h), a.allErrors || t.else().var(u, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(u);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function c(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, u);
    }
  }
};
Ya.default = yp;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const Vi = te, _n = Y, Fi = A, zi = A, gp = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, Vi.allSchemaProperties)(r), u = l.filter((g) => (0, Fi.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || u.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, c = t.name("valid");
    a.props !== !0 && !(a.props instanceof _n.Name) && (a.props = (0, zi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    b();
    function b() {
      for (const g of l)
        d && _(g), a.allErrors ? w(g) : (t.var(c, !0), w(g), t.if(c));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, Fi.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function w(g) {
      t.forIn("key", n, (y) => {
        t.if((0, _n._)`${(0, Vi.usePattern)(e, g)}.test(${y})`, () => {
          const m = u.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: zi.Type.Str
          }, c), a.opts.unevaluated && h !== !0 ? t.assign((0, _n._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, _n.not)(c), () => t.break());
        });
      });
    }
  }
};
Qa.default = gp;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const _p = A, vp = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, _p.alwaysValidSchema)(n, r)) {
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
Za.default = vp;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const wp = te, Ep = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: wp.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
xa.default = Ep;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const Vn = Y, bp = A, Sp = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Vn._)`{passingSchemas: ${e.passing}}`
}, Pp = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Sp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), u = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((c, h) => {
        let b;
        (0, bp.alwaysValidSchema)(s, c) ? t.var(u, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, u), h > 0 && t.if((0, Vn._)`${u} && ${o}`).assign(o, !1).assign(l, (0, Vn._)`[${l}, ${h}]`).else(), t.if(u, () => {
          t.assign(o, !0), t.assign(l, h), b && e.mergeEvaluated(b, Vn.Name);
        });
      });
    }
  }
};
eo.default = Pp;
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const Np = A, Rp = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Np.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
to.default = Rp;
var ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
const Zn = Y, Xl = A, Op = {
  message: ({ params: e }) => (0, Zn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Zn._)`{failingKeyword: ${e.ifClause}}`
}, Ip = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Op,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Xl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Ui(n, "then"), a = Ui(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (u(), e.reset(), s && a) {
      const c = t.let("ifClause");
      e.setParams({ ifClause: c }), t.if(l, d("then", c), d("else", c));
    } else s ? t.if(l, d("then")) : t.if((0, Zn.not)(l), d("else"));
    e.pass(o, () => e.error(!0));
    function u() {
      const c = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(c);
    }
    function d(c, h) {
      return () => {
        const b = e.subschema({ keyword: c }, l);
        t.assign(o, l), e.mergeValidEvaluated(b, o), h ? t.assign(h, (0, Zn._)`${c}`) : e.setParams({ ifClause: c });
      };
    }
  }
};
function Ui(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Xl.alwaysValidSchema)(e, r);
}
ro.default = Ip;
var no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const Tp = A, kp = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Tp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
no.default = kp;
Object.defineProperty(Ha, "__esModule", { value: !0 });
const jp = Rr, Ap = Ba, Cp = Or, Dp = Wa, Mp = Ja, Lp = hs, Vp = Xa, Fp = ms, zp = Ya, Up = Qa, qp = Za, Gp = xa, Kp = eo, Hp = to, Bp = ro, Wp = no;
function Jp(e = !1) {
  const t = [
    // any
    qp.default,
    Gp.default,
    Kp.default,
    Hp.default,
    Bp.default,
    Wp.default,
    // object
    Vp.default,
    Fp.default,
    Lp.default,
    zp.default,
    Up.default
  ];
  return e ? t.push(Ap.default, Dp.default) : t.push(jp.default, Cp.default), t.push(Mp.default), t;
}
Ha.default = Jp;
var so = {}, Ir = {};
Object.defineProperty(Ir, "__esModule", { value: !0 });
Ir.dynamicAnchor = void 0;
const Ds = Y, Xp = ze, qi = je, Yp = gt, Qp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Yl(e, e.schema)
};
function Yl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, Ds._)`${Xp.default.dynamicAnchors}${(0, Ds.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Zp(e);
  r.if((0, Ds._)`!${s}`, () => r.assign(s, a));
}
Ir.dynamicAnchor = Yl;
function Zp(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: l } = t.root, { schemaId: u } = n.opts, d = new qi.SchemaEnv({ schema: r, schemaId: u, root: s, baseId: a, localRefs: o, meta: l });
  return qi.compileSchema.call(n, d), (0, Yp.getValidate)(e, d);
}
Ir.default = Qp;
var Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
Tr.dynamicRef = void 0;
const Gi = Y, xp = ze, Ki = gt, e$ = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Ql(e, e.schema)
};
function Ql(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const u = r.let("valid", !1);
    o(u), e.ok(u);
  }
  function o(u) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, Gi._)`${xp.default.dynamicAnchors}${(0, Gi.getProperty)(a)}`);
      r.if(d, l(d, u), l(s.validateName, u));
    } else
      l(s.validateName, u)();
  }
  function l(u, d) {
    return d ? () => r.block(() => {
      (0, Ki.callRef)(e, u), r.let(d, !0);
    }) : () => (0, Ki.callRef)(e, u);
  }
}
Tr.dynamicRef = Ql;
Tr.default = e$;
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const t$ = Ir, r$ = A, n$ = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, t$.dynamicAnchor)(e, "") : (0, r$.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
ao.default = n$;
var oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const s$ = Tr, a$ = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, s$.dynamicRef)(e, e.schema)
};
oo.default = a$;
Object.defineProperty(so, "__esModule", { value: !0 });
const o$ = Ir, i$ = Tr, c$ = ao, l$ = oo, u$ = [o$.default, i$.default, c$.default, l$.default];
so.default = u$;
var io = {}, co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const Hi = hs, d$ = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Hi.error,
  code: (e) => (0, Hi.validatePropertyDeps)(e)
};
co.default = d$;
var lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
const f$ = hs, h$ = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, f$.validateSchemaDeps)(e)
};
lo.default = h$;
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const m$ = A, p$ = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, m$.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
uo.default = p$;
Object.defineProperty(io, "__esModule", { value: !0 });
const $$ = co, y$ = lo, g$ = uo, _$ = [$$.default, y$.default, g$.default];
io.default = _$;
var fo = {}, ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const Nt = Y, Bi = A, v$ = ze, w$ = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Nt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, E$ = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: w$,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: l } = a;
    l instanceof Nt.Name ? t.if((0, Nt._)`${l} !== true`, () => t.forIn("key", n, (h) => t.if(d(l, h), () => u(h)))) : l !== !0 && t.forIn("key", n, (h) => l === void 0 ? u(h) : t.if(c(l, h), () => u(h))), a.props = !0, e.ok((0, Nt._)`${s} === ${v$.default.errors}`);
    function u(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, Bi.alwaysValidSchema)(a, r)) {
        const b = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Bi.Type.Str
        }, b), o || t.if((0, Nt.not)(b), () => t.break());
      }
    }
    function d(h, b) {
      return (0, Nt._)`!${h} || !${h}[${b}]`;
    }
    function c(h, b) {
      const _ = [];
      for (const w in h)
        h[w] === !0 && _.push((0, Nt._)`${b} !== ${w}`);
      return (0, Nt.and)(..._);
    }
  }
};
ho.default = E$;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const xt = Y, Wi = A, b$ = {
  message: ({ params: { len: e } }) => (0, xt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, xt._)`{limit: ${e}}`
}, S$ = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: b$,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, xt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, xt._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Wi.alwaysValidSchema)(s, r)) {
      const u = t.var("valid", (0, xt._)`${o} <= ${a}`);
      t.if((0, xt.not)(u), () => l(u, a)), e.ok(u);
    }
    s.items = !0;
    function l(u, d) {
      t.forRange("i", d, o, (c) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: c, dataPropType: Wi.Type.Num }, u), s.allErrors || t.if((0, xt.not)(u), () => t.break());
      });
    }
  }
};
mo.default = S$;
Object.defineProperty(fo, "__esModule", { value: !0 });
const P$ = ho, N$ = mo, R$ = [P$.default, N$.default];
fo.default = R$;
var po = {}, $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
const pe = Y, O$ = {
  message: ({ schemaCode: e }) => (0, pe.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, pe._)`{format: ${e}}`
}, I$ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: O$,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: l } = e, { opts: u, errSchemaPath: d, schemaEnv: c, self: h } = l;
    if (!u.validateFormats)
      return;
    s ? b() : _();
    function b() {
      const w = r.scopeValue("formats", {
        ref: h.formats,
        code: u.code.formats
      }), g = r.const("fDef", (0, pe._)`${w}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, pe._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(y, (0, pe._)`${g}.type || "string"`).assign(m, (0, pe._)`${g}.validate`), () => r.assign(y, (0, pe._)`"string"`).assign(m, g)), e.fail$data((0, pe.or)(v(), N()));
      function v() {
        return u.strictSchema === !1 ? pe.nil : (0, pe._)`${o} && !${m}`;
      }
      function N() {
        const R = c.$async ? (0, pe._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, pe._)`${m}(${n})`, O = (0, pe._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, pe._)`${m} && ${m} !== true && ${y} === ${t} && !${O}`;
      }
    }
    function _() {
      const w = h.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [g, y, m] = N(w);
      g === t && e.pass(R());
      function v() {
        if (u.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const G = O instanceof RegExp ? (0, pe.regexpCode)(O) : u.code.formats ? (0, pe._)`${u.code.formats}${(0, pe.getProperty)(a)}` : void 0, X = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, pe._)`${X}.validate`] : ["string", O, X];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!c.$async)
            throw new Error("async format in sync schema");
          return (0, pe._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, pe._)`${m}(${n})` : (0, pe._)`${m}.test(${n})`;
      }
    }
  }
};
$o.default = I$;
Object.defineProperty(po, "__esModule", { value: !0 });
const T$ = $o, k$ = [T$.default];
po.default = k$;
var br = {};
Object.defineProperty(br, "__esModule", { value: !0 });
br.contentVocabulary = br.metadataVocabulary = void 0;
br.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
br.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(Ta, "__esModule", { value: !0 });
const j$ = ka, A$ = Aa, C$ = Ha, D$ = so, M$ = io, L$ = fo, V$ = po, Ji = br, F$ = [
  D$.default,
  j$.default,
  A$.default,
  (0, C$.default)(!0),
  V$.default,
  Ji.metadataVocabulary,
  Ji.contentVocabulary,
  M$.default,
  L$.default
];
Ta.default = F$;
var yo = {}, ps = {};
Object.defineProperty(ps, "__esModule", { value: !0 });
ps.DiscrError = void 0;
var Xi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Xi || (ps.DiscrError = Xi = {}));
Object.defineProperty(yo, "__esModule", { value: !0 });
const pr = Y, ea = ps, Yi = je, z$ = Nr, U$ = A, q$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ea.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, pr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, G$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: q$,
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
    const u = t.let("valid", !1), d = t.const("tag", (0, pr._)`${r}${(0, pr.getProperty)(l)}`);
    t.if((0, pr._)`typeof ${d} == "string"`, () => c(), () => e.error(!1, { discrError: ea.DiscrError.Tag, tag: d, tagName: l })), e.ok(u);
    function c() {
      const _ = b();
      t.if(!1);
      for (const w in _)
        t.elseIf((0, pr._)`${d} === ${w}`), t.assign(u, h(_[w]));
      t.else(), e.error(!1, { discrError: ea.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(_) {
      const w = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: _ }, w);
      return e.mergeEvaluated(g, pr.Name), w;
    }
    function b() {
      var _;
      const w = {}, g = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, U$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const X = O.$ref;
          if (O = Yi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), O instanceof Yi.SchemaEnv && (O = O.schema), O === void 0)
            throw new z$.default(a.opts.uriResolver, a.baseId, X);
        }
        const G = (_ = O == null ? void 0 : O.properties) === null || _ === void 0 ? void 0 : _[l];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        y = y && (g || m(O)), v(G, R);
      }
      if (!y)
        throw new Error(`discriminator: "${l}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(l);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const G of R.enum)
            N(G, O);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        w[R] = O;
      }
    }
  }
};
yo.default = G$;
var go = {};
const K$ = "https://json-schema.org/draft/2020-12/schema", H$ = "https://json-schema.org/draft/2020-12/schema", B$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, W$ = "meta", J$ = "Core and Validation specifications meta-schema", X$ = [
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
], Y$ = [
  "object",
  "boolean"
], Q$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Z$ = {
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
}, x$ = {
  $schema: K$,
  $id: H$,
  $vocabulary: B$,
  $dynamicAnchor: W$,
  title: J$,
  allOf: X$,
  type: Y$,
  $comment: Q$,
  properties: Z$
}, ey = "https://json-schema.org/draft/2020-12/schema", ty = "https://json-schema.org/draft/2020-12/meta/applicator", ry = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, ny = "meta", sy = "Applicator vocabulary meta-schema", ay = [
  "object",
  "boolean"
], oy = {
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
}, iy = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, cy = {
  $schema: ey,
  $id: ty,
  $vocabulary: ry,
  $dynamicAnchor: ny,
  title: sy,
  type: ay,
  properties: oy,
  $defs: iy
}, ly = "https://json-schema.org/draft/2020-12/schema", uy = "https://json-schema.org/draft/2020-12/meta/unevaluated", dy = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, fy = "meta", hy = "Unevaluated applicator vocabulary meta-schema", my = [
  "object",
  "boolean"
], py = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, $y = {
  $schema: ly,
  $id: uy,
  $vocabulary: dy,
  $dynamicAnchor: fy,
  title: hy,
  type: my,
  properties: py
}, yy = "https://json-schema.org/draft/2020-12/schema", gy = "https://json-schema.org/draft/2020-12/meta/content", _y = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, vy = "meta", wy = "Content vocabulary meta-schema", Ey = [
  "object",
  "boolean"
], by = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Sy = {
  $schema: yy,
  $id: gy,
  $vocabulary: _y,
  $dynamicAnchor: vy,
  title: wy,
  type: Ey,
  properties: by
}, Py = "https://json-schema.org/draft/2020-12/schema", Ny = "https://json-schema.org/draft/2020-12/meta/core", Ry = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, Oy = "meta", Iy = "Core vocabulary meta-schema", Ty = [
  "object",
  "boolean"
], ky = {
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
}, jy = {
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
}, Ay = {
  $schema: Py,
  $id: Ny,
  $vocabulary: Ry,
  $dynamicAnchor: Oy,
  title: Iy,
  type: Ty,
  properties: ky,
  $defs: jy
}, Cy = "https://json-schema.org/draft/2020-12/schema", Dy = "https://json-schema.org/draft/2020-12/meta/format-annotation", My = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Ly = "meta", Vy = "Format vocabulary meta-schema for annotation results", Fy = [
  "object",
  "boolean"
], zy = {
  format: {
    type: "string"
  }
}, Uy = {
  $schema: Cy,
  $id: Dy,
  $vocabulary: My,
  $dynamicAnchor: Ly,
  title: Vy,
  type: Fy,
  properties: zy
}, qy = "https://json-schema.org/draft/2020-12/schema", Gy = "https://json-schema.org/draft/2020-12/meta/meta-data", Ky = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, Hy = "meta", By = "Meta-data vocabulary meta-schema", Wy = [
  "object",
  "boolean"
], Jy = {
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
}, Xy = {
  $schema: qy,
  $id: Gy,
  $vocabulary: Ky,
  $dynamicAnchor: Hy,
  title: By,
  type: Wy,
  properties: Jy
}, Yy = "https://json-schema.org/draft/2020-12/schema", Qy = "https://json-schema.org/draft/2020-12/meta/validation", Zy = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, xy = "meta", eg = "Validation vocabulary meta-schema", tg = [
  "object",
  "boolean"
], rg = {
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
}, ng = {
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
}, sg = {
  $schema: Yy,
  $id: Qy,
  $vocabulary: Zy,
  $dynamicAnchor: xy,
  title: eg,
  type: tg,
  properties: rg,
  $defs: ng
};
Object.defineProperty(go, "__esModule", { value: !0 });
const ag = x$, og = cy, ig = $y, cg = Sy, lg = Ay, ug = Uy, dg = Xy, fg = sg, hg = ["/properties"];
function mg(e) {
  return [
    ag,
    og,
    ig,
    cg,
    lg,
    t(this, ug),
    dg,
    t(this, fg)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, hg) : n;
  }
}
go.default = mg;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = xc, n = Ta, s = yo, a = go, o = "https://json-schema.org/draft/2020-12/schema";
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
      const { $data: _, meta: w } = this.opts;
      w && (a.default.call(this, _), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = l, e.exports = t = l, e.exports.Ajv2020 = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var u = Qe;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return u.KeywordCxt;
  } });
  var d = Y;
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
  var c = cn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return c.default;
  } });
  var h = Nr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Ws, Ws.exports);
var pg = Ws.exports, ta = { exports: {} }, Zl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(z, H) {
    return { validate: z, compare: H };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(u(!0), d),
    "date-time": t(b(!0), _),
    "iso-time": t(u(), c),
    "iso-date-time": t(b(), w),
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
    int64: { type: "number", validate: X },
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
    "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, c),
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, w),
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
    const se = +H[1], T = +H[2], j = +H[3];
    return T >= 1 && T <= 12 && j >= 1 && j <= (T === 2 && r(se) ? 29 : s[T]);
  }
  function o(z, H) {
    if (z && H)
      return z > H ? 1 : z < H ? -1 : 0;
  }
  const l = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function u(z) {
    return function(se) {
      const T = l.exec(se);
      if (!T)
        return !1;
      const j = +T[1], L = +T[2], D = +T[3], K = T[4], M = T[5] === "-" ? -1 : 1, P = +(T[6] || 0), p = +(T[7] || 0);
      if (P > 23 || p > 59 || z && !K)
        return !1;
      if (j <= 23 && L <= 59 && D < 60)
        return !0;
      const S = L - p * M, $ = j - P * M - (S < 0 ? 1 : 0);
      return ($ === 23 || $ === -1) && (S === 59 || S === -1) && D < 61;
    };
  }
  function d(z, H) {
    if (!(z && H))
      return;
    const se = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf(), T = (/* @__PURE__ */ new Date("2020-01-01T" + H)).valueOf();
    if (se && T)
      return se - T;
  }
  function c(z, H) {
    if (!(z && H))
      return;
    const se = l.exec(z), T = l.exec(H);
    if (se && T)
      return z = se[1] + se[2] + se[3], H = T[1] + T[2] + T[3], z > H ? 1 : z < H ? -1 : 0;
  }
  const h = /t|\s/i;
  function b(z) {
    const H = u(z);
    return function(T) {
      const j = T.split(h);
      return j.length === 2 && a(j[0]) && H(j[1]);
    };
  }
  function _(z, H) {
    if (!(z && H))
      return;
    const se = new Date(z).valueOf(), T = new Date(H).valueOf();
    if (se && T)
      return se - T;
  }
  function w(z, H) {
    if (!(z && H))
      return;
    const [se, T] = z.split(h), [j, L] = H.split(h), D = o(se, j);
    if (D !== void 0)
      return D || d(T, L);
  }
  const g = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(z) {
    return g.test(z) && y.test(z);
  }
  const v = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function N(z) {
    return v.lastIndex = 0, v.test(z);
  }
  const R = -2147483648, O = 2 ** 31 - 1;
  function G(z) {
    return Number.isInteger(z) && z <= O && z >= R;
  }
  function X(z) {
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
})(Zl);
var xl = {}, ra = { exports: {} }, eu = {}, Ze = {}, Sr = {}, un = {}, ee = {}, an = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(v) {
      if (super(), !e.IDENTIFIER.test(v))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = v;
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
    constructor(v) {
      super(), this._items = typeof v == "string" ? [v] : v;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const v = this._items[0];
      return v === "" || v === '""';
    }
    get str() {
      var v;
      return (v = this._str) !== null && v !== void 0 ? v : this._str = this._items.reduce((N, R) => `${N}${R}`, "");
    }
    get names() {
      var v;
      return (v = this._names) !== null && v !== void 0 ? v : this._names = this._items.reduce((N, R) => (R instanceof r && (N[R.str] = (N[R.str] || 0) + 1), N), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...v) {
    const N = [m[0]];
    let R = 0;
    for (; R < v.length; )
      l(N, v[R]), N.push(m[++R]);
    return new n(N);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...v) {
    const N = [_(m[0])];
    let R = 0;
    for (; R < v.length; )
      N.push(a), l(N, v[R]), N.push(a, _(m[++R]));
    return u(N), new n(N);
  }
  e.str = o;
  function l(m, v) {
    v instanceof n ? m.push(...v._items) : v instanceof r ? m.push(v) : m.push(h(v));
  }
  e.addCodeArg = l;
  function u(m) {
    let v = 1;
    for (; v < m.length - 1; ) {
      if (m[v] === a) {
        const N = d(m[v - 1], m[v + 1]);
        if (N !== void 0) {
          m.splice(v - 1, 3, N);
          continue;
        }
        m[v++] = "+";
      }
      v++;
    }
  }
  function d(m, v) {
    if (v === '""')
      return m;
    if (m === '""')
      return v;
    if (typeof m == "string")
      return v instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof v != "string" ? `${m.slice(0, -1)}${v}"` : v[0] === '"' ? m.slice(0, -1) + v.slice(1) : void 0;
    if (typeof v == "string" && v[0] === '"' && !(m instanceof r))
      return `"${m}${v.slice(1)}`;
  }
  function c(m, v) {
    return v.emptyStr() ? m : m.emptyStr() ? v : o`${m}${v}`;
  }
  e.strConcat = c;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : _(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(_(m));
  }
  e.stringify = b;
  function _(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = _;
  function w(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = w;
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
var na = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = an;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(u) {
    u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
  })(n || (e.UsedValueState = n = {})), e.varKinds = {
    const: new t.Name("const"),
    let: new t.Name("let"),
    var: new t.Name("var")
  };
  class s {
    constructor({ prefixes: d, parent: c } = {}) {
      this._names = {}, this._prefixes = d, this._parent = c;
    }
    toName(d) {
      return d instanceof t.Name ? d : this.name(d);
    }
    name(d) {
      return new t.Name(this._newName(d));
    }
    _newName(d) {
      const c = this._names[d] || this._nameGroup(d);
      return `${d}${c.index++}`;
    }
    _nameGroup(d) {
      var c, h;
      if (!((h = (c = this._parent) === null || c === void 0 ? void 0 : c._prefixes) === null || h === void 0) && h.has(d) || this._prefixes && !this._prefixes.has(d))
        throw new Error(`CodeGen: prefix "${d}" is not allowed in this scope`);
      return this._names[d] = { prefix: d, index: 0 };
    }
  }
  e.Scope = s;
  class a extends t.Name {
    constructor(d, c) {
      super(c), this.prefix = d;
    }
    setValue(d, { property: c, itemIndex: h }) {
      this.value = d, this.scopePath = (0, t._)`.${new t.Name(c)}[${h}]`;
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
    value(d, c) {
      var h;
      if (c.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const b = this.toName(d), { prefix: _ } = b, w = (h = c.key) !== null && h !== void 0 ? h : c.ref;
      let g = this._values[_];
      if (g) {
        const v = g.get(w);
        if (v)
          return v;
      } else
        g = this._values[_] = /* @__PURE__ */ new Map();
      g.set(w, b);
      const y = this._scope[_] || (this._scope[_] = []), m = y.length;
      return y[m] = c.ref, b.setValue(c, { property: _, itemIndex: m }), b;
    }
    getValue(d, c) {
      const h = this._values[d];
      if (h)
        return h.get(c);
    }
    scopeRefs(d, c = this._values) {
      return this._reduceValues(c, (h) => {
        if (h.scopePath === void 0)
          throw new Error(`CodeGen: name "${h}" has no value`);
        return (0, t._)`${d}${h.scopePath}`;
      });
    }
    scopeCode(d = this._values, c, h) {
      return this._reduceValues(d, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, c, h);
    }
    _reduceValues(d, c, h = {}, b) {
      let _ = t.nil;
      for (const w in d) {
        const g = d[w];
        if (!g)
          continue;
        const y = h[w] = h[w] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (y.has(m))
            return;
          y.set(m, n.Started);
          let v = c(m);
          if (v) {
            const N = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            _ = (0, t._)`${_}${N} ${m} = ${v};${this.opts._n}`;
          } else if (v = b == null ? void 0 : b(m))
            _ = (0, t._)`${_}${v}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return _;
    }
  }
  e.ValueScope = l;
})(na);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = an, r = na;
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
  var s = na;
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
    constructor(i, f, E) {
      super(), this.varKind = i, this.name = f, this.rhs = E;
    }
    render({ es5: i, _n: f }) {
      const E = i ? r.varKinds.var : this.varKind, I = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${E} ${this.name}${I};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = T(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class l extends a {
    constructor(i, f, E) {
      super(), this.lhs = i, this.rhs = f, this.sideEffects = E;
    }
    render({ _n: i }) {
      return `${this.lhs} = ${this.rhs};` + i;
    }
    optimizeNames(i, f) {
      if (!(this.lhs instanceof t.Name && !i[this.lhs.str] && !this.sideEffects))
        return this.rhs = T(this.rhs, i, f), this;
    }
    get names() {
      const i = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
      return se(i, this.rhs);
    }
  }
  class u extends l {
    constructor(i, f, E, I) {
      super(i, E, I), this.op = f;
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
  class c extends a {
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
  class b extends a {
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
      return this.code = T(this.code, i, f), this;
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
      return this.nodes.reduce((f, E) => f + E.render(i), "");
    }
    optimizeNodes() {
      const { nodes: i } = this;
      let f = i.length;
      for (; f--; ) {
        const E = i[f].optimizeNodes();
        Array.isArray(E) ? i.splice(f, 1, ...E) : E ? i[f] = E : i.splice(f, 1);
      }
      return i.length > 0 ? this : void 0;
    }
    optimizeNames(i, f) {
      const { nodes: E } = this;
      let I = E.length;
      for (; I--; ) {
        const k = E[I];
        k.optimizeNames(i, f) || (j(i, k.names), E.splice(I, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => H(i, f.names), {});
    }
  }
  class w extends _ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends _ {
  }
  class y extends w {
  }
  y.kind = "else";
  class m extends w {
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
        const E = f.optimizeNodes();
        f = this.else = Array.isArray(E) ? new y(E) : E;
      }
      if (f)
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(L(i), f instanceof m ? [f] : f.nodes);
      if (!(i === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(i, f) {
      var E;
      if (this.else = (E = this.else) === null || E === void 0 ? void 0 : E.optimizeNames(i, f), !!(super.optimizeNames(i, f) || this.else))
        return this.condition = T(this.condition, i, f), this;
    }
    get names() {
      const i = super.names;
      return se(i, this.condition), this.else && H(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class v extends w {
  }
  v.kind = "for";
  class N extends v {
    constructor(i) {
      super(), this.iteration = i;
    }
    render(i) {
      return `for(${this.iteration})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iteration = T(this.iteration, i, f), this;
    }
    get names() {
      return H(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, E, I) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: I, to: k } = this;
      return `for(${f} ${E}=${I}; ${E}<${k}; ${E}++)` + super.render(i);
    }
    get names() {
      const i = se(super.names, this.from);
      return se(i, this.to);
    }
  }
  class O extends v {
    constructor(i, f, E, I) {
      super(), this.loop = i, this.varKind = f, this.name = E, this.iterable = I;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = T(this.iterable, i, f), this;
    }
    get names() {
      return H(super.names, this.iterable.names);
    }
  }
  class G extends w {
    constructor(i, f, E) {
      super(), this.name = i, this.args = f, this.async = E;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  G.kind = "func";
  class X extends _ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  X.kind = "return";
  class de extends w {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var E, I;
      return super.optimizeNames(i, f), (E = this.catch) === null || E === void 0 || E.optimizeNames(i, f), (I = this.finally) === null || I === void 0 || I.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && H(i, this.catch.names), this.finally && H(i, this.finally.names), i;
    }
  }
  class me extends w {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  me.kind = "catch";
  class ye extends w {
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
      const E = this._extScope.value(i, f);
      return (this._values[E.prefix] || (this._values[E.prefix] = /* @__PURE__ */ new Set())).add(E), E;
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
    _def(i, f, E, I) {
      const k = this._scope.toName(f);
      return E !== void 0 && I && (this._constants[k.str] = E), this._leafNode(new o(i, k, E)), k;
    }
    // `const` declaration (`var` in es5 mode)
    const(i, f, E) {
      return this._def(r.varKinds.const, i, f, E);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(i, f, E) {
      return this._def(r.varKinds.let, i, f, E);
    }
    // `var` declaration with optional assignment
    var(i, f, E) {
      return this._def(r.varKinds.var, i, f, E);
    }
    // assignment code
    assign(i, f, E) {
      return this._leafNode(new l(i, f, E));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new u(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new b(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [E, I] of i)
        f.length > 1 && f.push(","), f.push(E), (E !== I || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, I));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(i, f, E) {
      if (this._blockNode(new m(i)), f && E)
        this.code(f).else().code(E).endIf();
      else if (f)
        this.code(f).endIf();
      else if (E)
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
    forRange(i, f, E, I, k = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(k, F, f, E), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, I = r.varKinds.const) {
      const k = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(k, (0, t._)`${F}[${V}]`), E(k);
        });
      }
      return this._for(new O("of", I, k, f), () => E(k));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const k = this._scope.toName(i);
      return this._for(new O("in", I, k, f), () => E(k));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(v);
    }
    // `label` statement
    label(i) {
      return this._leafNode(new d(i));
    }
    // `break` statement
    break(i) {
      return this._leafNode(new c(i));
    }
    // `return` statement
    return(i) {
      const f = new X();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(X);
    }
    // `try` statement
    try(i, f, E) {
      if (!f && !E)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const I = new de();
      if (this._blockNode(I), this.code(i), f) {
        const k = this.name("e");
        this._currNode = I.catch = new me(k), f(k);
      }
      return E && (this._currNode = I.finally = new ye(), this.code(E)), this._endBlockNode(me, ye);
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
      const E = this._nodes.length - f;
      if (E < 0 || i !== void 0 && E !== i)
        throw new Error(`CodeGen: wrong number of nodes: ${E} vs ${i} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(i, f = t.nil, E, I) {
      return this._blockNode(new G(i, f, E)), I && this.code(I).endFunc(), this;
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
      const E = this._currNode;
      if (E instanceof i || f && E instanceof f)
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
  function se($, i) {
    return i instanceof t._CodeOrName ? H($, i.names) : $;
  }
  function T($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((k, F) => (F instanceof t.Name && (F = E(F)), F instanceof t._Code ? k.push(...F._items) : k.push(F), k), []));
    function E(k) {
      const F = f[k.str];
      return F === void 0 || i[k.str] !== 1 ? k : (delete i[k.str], F);
    }
    function I(k) {
      return k instanceof t._Code && k._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
    }
  }
  function j($, i) {
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
})(ee);
var C = {};
Object.defineProperty(C, "__esModule", { value: !0 });
C.checkStrictMode = C.getErrorPath = C.Type = C.useFunc = C.setEvaluated = C.evaluatedPropsToName = C.mergeEvaluated = C.eachItem = C.unescapeJsonPointer = C.escapeJsonPointer = C.escapeFragment = C.unescapeFragment = C.schemaRefOrVal = C.schemaHasRulesButRef = C.schemaHasRules = C.checkUnknownRules = C.alwaysValidSchema = C.toHash = void 0;
const ce = ee, $g = an;
function yg(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = yg;
function gg(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (tu(e, t), !ru(t, e.self.RULES.all));
}
C.alwaysValidSchema = gg;
function tu(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || au(e, `unknown keyword: "${a}"`);
}
C.checkUnknownRules = tu;
function ru(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
C.schemaHasRules = ru;
function _g(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
C.schemaHasRulesButRef = _g;
function vg({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ce._)`${r}`;
  }
  return (0, ce._)`${e}${t}${(0, ce.getProperty)(n)}`;
}
C.schemaRefOrVal = vg;
function wg(e) {
  return nu(decodeURIComponent(e));
}
C.unescapeFragment = wg;
function Eg(e) {
  return encodeURIComponent(_o(e));
}
C.escapeFragment = Eg;
function _o(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
C.escapeJsonPointer = _o;
function nu(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = nu;
function bg(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = bg;
function Qi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const u = o === void 0 ? a : o instanceof ce.Name ? (a instanceof ce.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ce.Name ? (t(s, o, a), a) : r(a, o);
    return l === ce.Name && !(u instanceof ce.Name) ? n(s, u) : u;
  };
}
C.mergeEvaluated = {
  props: Qi({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ce._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ce._)`${r} || {}`).code((0, ce._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ce._)`${r} || {}`), vo(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: su
  }),
  items: Qi({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ce._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ce._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function su(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ce._)`{}`);
  return t !== void 0 && vo(e, r, t), r;
}
C.evaluatedPropsToName = su;
function vo(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ce._)`${t}${(0, ce.getProperty)(n)}`, !0));
}
C.setEvaluated = vo;
const Zi = {};
function Sg(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Zi[t.code] || (Zi[t.code] = new $g._Code(t.code))
  });
}
C.useFunc = Sg;
var sa;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(sa || (C.Type = sa = {}));
function Pg(e, t, r) {
  if (e instanceof ce.Name) {
    const n = t === sa.Num;
    return r ? n ? (0, ce._)`"[" + ${e} + "]"` : (0, ce._)`"['" + ${e} + "']"` : n ? (0, ce._)`"/" + ${e}` : (0, ce._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ce.getProperty)(e).toString() : "/" + _o(e);
}
C.getErrorPath = Pg;
function au(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = au;
var ct = {};
Object.defineProperty(ct, "__esModule", { value: !0 });
const Re = ee, Ng = {
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
ct.default = Ng;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ee, r = C, n = ct;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, v, N) {
    const { it: R } = y, { gen: O, compositeRule: G, allErrors: X } = R, de = h(y, m, v);
    N ?? (G || X) ? u(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, v) {
    const { it: N } = y, { gen: R, compositeRule: O, allErrors: G } = N, X = h(y, m, v);
    u(R, X), O || G || d(N, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function l({ gen: y, keyword: m, schemaValue: v, data: N, errsCount: R, it: O }) {
    if (R === void 0)
      throw new Error("ajv implementation error");
    const G = y.name("err");
    y.forRange("i", R, n.default.errors, (X) => {
      y.const(G, (0, t._)`${n.default.vErrors}[${X}]`), y.if((0, t._)`${G}.instancePath === undefined`, () => y.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), y.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (y.assign((0, t._)`${G}.schema`, v), y.assign((0, t._)`${G}.data`, N));
    });
  }
  e.extendErrors = l;
  function u(y, m) {
    const v = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${v}]`), (0, t._)`${n.default.vErrors}.push(${v})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: v, validateName: N, schemaEnv: R } = y;
    R.$async ? v.throw((0, t._)`new ${y.ValidationError}(${m})`) : (v.assign((0, t._)`${N}.errors`, m), v.return(!1));
  }
  const c = {
    keyword: new t.Name("keyword"),
    schemaPath: new t.Name("schemaPath"),
    // also used in JTD errors
    params: new t.Name("params"),
    propertyName: new t.Name("propertyName"),
    message: new t.Name("message"),
    schema: new t.Name("schema"),
    parentSchema: new t.Name("parentSchema")
  };
  function h(y, m, v) {
    const { createErrors: N } = y.it;
    return N === !1 ? (0, t._)`{}` : b(y, m, v);
  }
  function b(y, m, v = {}) {
    const { gen: N, it: R } = y, O = [
      _(R, v),
      w(y, v)
    ];
    return g(y, m, O), N.object(...O);
  }
  function _({ errorPath: y }, { instancePath: m }) {
    const v = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, v)];
  }
  function w({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: v, parentSchema: N }) {
    let R = N ? m : (0, t.str)`${m}/${y}`;
    return v && (R = (0, t.str)`${R}${(0, r.getErrorPath)(v, r.Type.Str)}`), [c.schemaPath, R];
  }
  function g(y, { params: m, message: v }, N) {
    const { keyword: R, data: O, schemaValue: G, it: X } = y, { opts: de, propertyName: me, topSchemaRef: ye, schemaPath: z } = X;
    N.push([c.keyword, R], [c.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), de.messages && N.push([c.message, typeof v == "function" ? v(y) : v]), de.verbose && N.push([c.schema, G], [c.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), me && N.push([c.propertyName, me]);
  }
})(un);
Object.defineProperty(Sr, "__esModule", { value: !0 });
Sr.boolOrEmptySchema = Sr.topBoolOrEmptySchema = void 0;
const Rg = un, Og = ee, Ig = ct, Tg = {
  message: "boolean schema is false"
};
function kg(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? ou(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Ig.default.data) : (t.assign((0, Og._)`${n}.errors`, null), t.return(!0));
}
Sr.topBoolOrEmptySchema = kg;
function jg(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), ou(e)) : r.var(t, !0);
}
Sr.boolOrEmptySchema = jg;
function ou(e, t) {
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
  (0, Rg.reportError)(s, Tg, void 0, t);
}
var _e = {}, or = {};
Object.defineProperty(or, "__esModule", { value: !0 });
or.getRules = or.isJSONType = void 0;
const Ag = ["string", "number", "integer", "boolean", "null", "object", "array"], Cg = new Set(Ag);
function Dg(e) {
  return typeof e == "string" && Cg.has(e);
}
or.isJSONType = Dg;
function Mg() {
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
or.getRules = Mg;
var pt = {};
Object.defineProperty(pt, "__esModule", { value: !0 });
pt.shouldUseRule = pt.shouldUseGroup = pt.schemaHasRulesForType = void 0;
function Lg({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && iu(e, n);
}
pt.schemaHasRulesForType = Lg;
function iu(e, t) {
  return t.rules.some((r) => cu(e, r));
}
pt.shouldUseGroup = iu;
function cu(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
pt.shouldUseRule = cu;
Object.defineProperty(_e, "__esModule", { value: !0 });
_e.reportTypeError = _e.checkDataTypes = _e.checkDataType = _e.coerceAndCheckDataType = _e.getJSONTypes = _e.getSchemaTypes = _e.DataType = void 0;
const Vg = or, Fg = pt, zg = un, Z = ee, lu = C;
var vr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(vr || (_e.DataType = vr = {}));
function Ug(e) {
  const t = uu(e.type);
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
_e.getSchemaTypes = Ug;
function uu(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Vg.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
_e.getJSONTypes = uu;
function qg(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Gg(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Fg.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = wo(t, n, s.strictNumbers, vr.Wrong);
    r.if(l, () => {
      a.length ? Kg(e, t, a) : Eo(e);
    });
  }
  return o;
}
_e.coerceAndCheckDataType = qg;
const du = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Gg(e, t) {
  return t ? e.filter((r) => du.has(r) || t === "array" && r === "array") : [];
}
function Kg(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Z._)`typeof ${s}`), l = n.let("coerced", (0, Z._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Z._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Z._)`${s}[0]`).assign(o, (0, Z._)`typeof ${s}`).if(wo(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Z._)`${l} !== undefined`);
  for (const d of r)
    (du.has(d) || d === "array" && a.coerceTypes === "array") && u(d);
  n.else(), Eo(e), n.endIf(), n.if((0, Z._)`${l} !== undefined`, () => {
    n.assign(s, l), Hg(e, l);
  });
  function u(d) {
    switch (d) {
      case "string":
        n.elseIf((0, Z._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, Z._)`"" + ${s}`).elseIf((0, Z._)`${s} === null`).assign(l, (0, Z._)`""`);
        return;
      case "number":
        n.elseIf((0, Z._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(l, (0, Z._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, Z._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(l, (0, Z._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, Z._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(l, !1).elseIf((0, Z._)`${s} === "true" || ${s} === 1`).assign(l, !0);
        return;
      case "null":
        n.elseIf((0, Z._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(l, null);
        return;
      case "array":
        n.elseIf((0, Z._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, Z._)`[${s}]`);
    }
  }
}
function Hg({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Z._)`${t} !== undefined`, () => e.assign((0, Z._)`${t}[${r}]`, n));
}
function aa(e, t, r, n = vr.Correct) {
  const s = n === vr.Correct ? Z.operators.EQ : Z.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, Z._)`${t} ${s} null`;
    case "array":
      a = (0, Z._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, Z._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, Z._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, Z._)`typeof ${t} ${s} ${e}`;
  }
  return n === vr.Correct ? a : (0, Z.not)(a);
  function o(l = Z.nil) {
    return (0, Z.and)((0, Z._)`typeof ${t} == "number"`, l, r ? (0, Z._)`isFinite(${t})` : Z.nil);
  }
}
_e.checkDataType = aa;
function wo(e, t, r, n) {
  if (e.length === 1)
    return aa(e[0], t, r, n);
  let s;
  const a = (0, lu.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Z._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Z._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Z.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Z.and)(s, aa(o, t, r, n));
  return s;
}
_e.checkDataTypes = wo;
const Bg = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Z._)`{type: ${e}}` : (0, Z._)`{type: ${t}}`
};
function Eo(e) {
  const t = Wg(e);
  (0, zg.reportError)(t, Bg);
}
_e.reportTypeError = Eo;
function Wg(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, lu.schemaRefOrVal)(e, n, "type");
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
var $s = {};
Object.defineProperty($s, "__esModule", { value: !0 });
$s.assignDefaults = void 0;
const ur = ee, Jg = C;
function Xg(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      xi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => xi(e, a, s.default));
}
$s.assignDefaults = Xg;
function xi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, ur._)`${a}${(0, ur.getProperty)(t)}`;
  if (s) {
    (0, Jg.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let u = (0, ur._)`${l} === undefined`;
  o.useDefaults === "empty" && (u = (0, ur._)`${u} || ${l} === null || ${l} === ""`), n.if(u, (0, ur._)`${l} = ${(0, ur.stringify)(r)}`);
}
var it = {}, re = {};
Object.defineProperty(re, "__esModule", { value: !0 });
re.validateUnion = re.validateArray = re.usePattern = re.callValidateCode = re.schemaProperties = re.allSchemaProperties = re.noPropertyInData = re.propertyInData = re.isOwnProperty = re.hasPropFunc = re.reportMissingProp = re.checkMissingProp = re.checkReportMissingProp = void 0;
const ue = ee, bo = C, St = ct, Yg = C;
function Qg(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Po(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ue._)`${t}` }, !0), e.error();
  });
}
re.checkReportMissingProp = Qg;
function Zg({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((a) => (0, ue.and)(Po(e, t, a, r.ownProperties), (0, ue._)`${s} = ${a}`)));
}
re.checkMissingProp = Zg;
function xg(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
re.reportMissingProp = xg;
function fu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
re.hasPropFunc = fu;
function So(e, t, r) {
  return (0, ue._)`${fu(e)}.call(${t}, ${r})`;
}
re.isOwnProperty = So;
function e0(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${So(e, t, r)}` : s;
}
re.propertyInData = e0;
function Po(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(So(e, t, r))) : s;
}
re.noPropertyInData = Po;
function hu(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
re.allSchemaProperties = hu;
function t0(e, t) {
  return hu(t).filter((r) => !(0, bo.alwaysValidSchema)(e, t[r]));
}
re.schemaProperties = t0;
function r0({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, u, d) {
  const c = d ? (0, ue._)`${e}, ${t}, ${n}${s}` : t, h = [
    [St.default.instancePath, (0, ue.strConcat)(St.default.instancePath, a)],
    [St.default.parentData, o.parentData],
    [St.default.parentDataProperty, o.parentDataProperty],
    [St.default.rootData, St.default.rootData]
  ];
  o.opts.dynamicRef && h.push([St.default.dynamicAnchors, St.default.dynamicAnchors]);
  const b = (0, ue._)`${c}, ${r.object(...h)}`;
  return u !== ue.nil ? (0, ue._)`${l}.call(${u}, ${b})` : (0, ue._)`${l}(${b})`;
}
re.callValidateCode = r0;
const n0 = (0, ue._)`new RegExp`;
function s0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ue._)`${s.code === "new RegExp" ? n0 : (0, Yg.useFunc)(e, s)}(${r}, ${n})`
  });
}
re.usePattern = s0;
function a0(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const u = t.const("len", (0, ue._)`${r}.length`);
    t.forRange("i", 0, u, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: bo.Type.Num
      }, a), t.if((0, ue.not)(a), l);
    });
  }
}
re.validateArray = a0;
function o0(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((u) => (0, bo.alwaysValidSchema)(s, u)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), l = t.name("_valid");
  t.block(() => r.forEach((u, d) => {
    const c = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, l);
    t.assign(o, (0, ue._)`${o} || ${l}`), e.mergeValidEvaluated(c, l) || t.if((0, ue.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
re.validateUnion = o0;
Object.defineProperty(it, "__esModule", { value: !0 });
it.validateKeywordUsage = it.validSchemaType = it.funcKeywordCode = it.macroKeywordCode = void 0;
const ke = ee, er = ct, i0 = re, c0 = un;
function l0(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), u = mu(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: ke.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: u,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
it.macroKeywordCode = l0;
function u0(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: u } = e;
  f0(u, t);
  const d = !l && t.compile ? t.compile.call(u.self, a, o, u) : t.validate, c = mu(n, s, d), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      g(), t.modifying && ec(e), y(() => e.error());
    else {
      const m = t.async ? _() : w();
      t.modifying && ec(e), y(() => d0(e, m));
    }
  }
  function _() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, ke._)`await `), (v) => n.assign(h, !1).if((0, ke._)`${v} instanceof ${u.ValidationError}`, () => n.assign(m, (0, ke._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, ke._)`${c}.errors`;
    return n.assign(m, null), g(ke.nil), m;
  }
  function g(m = t.async ? (0, ke._)`await ` : ke.nil) {
    const v = u.opts.passContext ? er.default.this : er.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, ke._)`${m}${(0, i0.callValidateCode)(e, c, v, N)}`, t.modifying);
  }
  function y(m) {
    var v;
    n.if((0, ke.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
it.funcKeywordCode = u0;
function ec(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, ke._)`${n.parentData}[${n.parentDataProperty}]`));
}
function d0(e, t) {
  const { gen: r } = e;
  r.if((0, ke._)`Array.isArray(${t})`, () => {
    r.assign(er.default.vErrors, (0, ke._)`${er.default.vErrors} === null ? ${t} : ${er.default.vErrors}.concat(${t})`).assign(er.default.errors, (0, ke._)`${er.default.vErrors}.length`), (0, c0.extendErrors)(e);
  }, () => e.error());
}
function f0({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function mu(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, ke.stringify)(r) });
}
function h0(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
it.validSchemaType = h0;
function m0({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const u = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(u);
    else
      throw new Error(u);
  }
}
it.validateKeywordUsage = m0;
var At = {};
Object.defineProperty(At, "__esModule", { value: !0 });
At.extendSubschemaMode = At.extendSubschemaData = At.getSubschema = void 0;
const st = ee, pu = C;
function p0(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, st._)`${e.schemaPath}${(0, st.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, st._)`${e.schemaPath}${(0, st.getProperty)(t)}${(0, st.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, pu.escapeFragment)(r)}`
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
At.getSubschema = p0;
function $0(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: c, opts: h } = t, b = l.let("data", (0, st._)`${t.data}${(0, st.getProperty)(r)}`, !0);
    u(b), e.errorPath = (0, st.str)`${d}${(0, pu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, st._)`${r}`, e.dataPathArr = [...c, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof st.Name ? s : l.let("data", s, !0);
    u(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function u(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
At.extendSubschemaData = $0;
function y0(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
At.extendSubschemaMode = y0;
var Se = {}, $u = { exports: {} }, Tt = $u.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Fn(t, n, s, e, "", e);
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
function Fn(e, t, r, n, s, a, o, l, u, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, u, d);
    for (var c in n) {
      var h = n[c];
      if (Array.isArray(h)) {
        if (c in Tt.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            Fn(e, t, r, h[b], s + "/" + c + "/" + b, a, s, c, n, b);
      } else if (c in Tt.propsKeywords) {
        if (h && typeof h == "object")
          for (var _ in h)
            Fn(e, t, r, h[_], s + "/" + c + "/" + g0(_), a, s, c, n, _);
      } else (c in Tt.keywords || e.allKeys && !(c in Tt.skipKeywords)) && Fn(e, t, r, h, s + "/" + c, a, s, c, n);
    }
    r(n, s, a, o, l, u, d);
  }
}
function g0(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var _0 = $u.exports;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
const v0 = C, w0 = ls, E0 = _0, b0 = /* @__PURE__ */ new Set([
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
function S0(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !oa(e) : t ? yu(e) <= t : !1;
}
Se.inlineRef = S0;
const P0 = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function oa(e) {
  for (const t in e) {
    if (P0.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(oa) || typeof r == "object" && oa(r))
      return !0;
  }
  return !1;
}
function yu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !b0.has(r) && (typeof e[r] == "object" && (0, v0.eachItem)(e[r], (n) => t += yu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function gu(e, t = "", r) {
  r !== !1 && (t = wr(t));
  const n = e.parse(t);
  return _u(e, n);
}
Se.getFullPath = gu;
function _u(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Se._getFullPath = _u;
const N0 = /#\/?$/;
function wr(e) {
  return e ? e.replace(N0, "") : "";
}
Se.normalizeId = wr;
function R0(e, t, r) {
  return r = wr(r), e.resolve(t, r);
}
Se.resolveUrl = R0;
const O0 = /^[a-z_][-a-z0-9._]*$/i;
function I0(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = wr(e[r] || t), a = { "": s }, o = gu(n, s, !1), l = {}, u = /* @__PURE__ */ new Set();
  return E0(e, { allKeys: !0 }, (h, b, _, w) => {
    if (w === void 0)
      return;
    const g = o + b;
    let y = a[w];
    typeof h[r] == "string" && (y = m.call(this, h[r])), v.call(this, h.$anchor), v.call(this, h.$dynamicAnchor), a[b] = y;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = wr(y ? R(y, N) : N), u.has(N))
        throw c(N);
      u.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== wr(g) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = g), N;
    }
    function v(N) {
      if (typeof N == "string") {
        if (!O0.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, b, _) {
    if (b !== void 0 && !w0(h, b))
      throw c(_);
  }
  function c(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Se.getSchemaRefs = I0;
Object.defineProperty(Ze, "__esModule", { value: !0 });
Ze.getData = Ze.KeywordCxt = Ze.validateFunctionCode = void 0;
const vu = Sr, tc = _e, No = pt, xn = _e, T0 = $s, xr = it, Ms = At, q = ee, W = ct, k0 = Se, $t = C, qr = un;
function j0(e) {
  if (bu(e) && (Su(e), Eu(e))) {
    D0(e);
    return;
  }
  wu(e, () => (0, vu.topBoolOrEmptySchema)(e));
}
Ze.validateFunctionCode = j0;
function wu({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${W.default.data}, ${W.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${rc(r, s)}`), C0(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${W.default.data}, ${A0(s)}`, n.$async, () => e.code(rc(r, s)).code(a));
}
function A0(e) {
  return (0, q._)`{${W.default.instancePath}="", ${W.default.parentData}, ${W.default.parentDataProperty}, ${W.default.rootData}=${W.default.data}${e.dynamicRef ? (0, q._)`, ${W.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function C0(e, t) {
  e.if(W.default.valCxt, () => {
    e.var(W.default.instancePath, (0, q._)`${W.default.valCxt}.${W.default.instancePath}`), e.var(W.default.parentData, (0, q._)`${W.default.valCxt}.${W.default.parentData}`), e.var(W.default.parentDataProperty, (0, q._)`${W.default.valCxt}.${W.default.parentDataProperty}`), e.var(W.default.rootData, (0, q._)`${W.default.valCxt}.${W.default.rootData}`), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, q._)`${W.default.valCxt}.${W.default.dynamicAnchors}`);
  }, () => {
    e.var(W.default.instancePath, (0, q._)`""`), e.var(W.default.parentData, (0, q._)`undefined`), e.var(W.default.parentDataProperty, (0, q._)`undefined`), e.var(W.default.rootData, W.default.data), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function D0(e) {
  const { schema: t, opts: r, gen: n } = e;
  wu(e, () => {
    r.$comment && t.$comment && Nu(e), z0(e), n.let(W.default.vErrors, null), n.let(W.default.errors, 0), r.unevaluated && M0(e), Pu(e), G0(e);
  });
}
function M0(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function rc(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function L0(e, t) {
  if (bu(e) && (Su(e), Eu(e))) {
    V0(e, t);
    return;
  }
  (0, vu.boolOrEmptySchema)(e, t);
}
function Eu({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function bu(e) {
  return typeof e.schema != "boolean";
}
function V0(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Nu(e), U0(e), q0(e);
  const a = n.const("_errs", W.default.errors);
  Pu(e, a), n.var(t, (0, q._)`${a} === ${W.default.errors}`);
}
function Su(e) {
  (0, $t.checkUnknownRules)(e), F0(e);
}
function Pu(e, t) {
  if (e.opts.jtd)
    return nc(e, [], !1, t);
  const r = (0, tc.getSchemaTypes)(e.schema), n = (0, tc.coerceAndCheckDataType)(e, r);
  nc(e, r, !n, t);
}
function F0(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, $t.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function z0(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, $t.checkStrictMode)(e, "default is ignored in the schema root");
}
function U0(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, k0.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function q0(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Nu({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${W.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${W.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function G0(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${W.default.errors} === 0`, () => t.return(W.default.data), () => t.throw((0, q._)`new ${s}(${W.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, W.default.vErrors), a.unevaluated && K0(e), t.return((0, q._)`${W.default.errors} === 0`));
}
function K0({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function nc(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: u, self: d } = e, { RULES: c } = d;
  if (a.$ref && (u.ignoreKeywordsWithRef || !(0, $t.schemaHasRulesButRef)(a, c))) {
    s.block(() => Iu(e, "$ref", c.all.$ref.definition));
    return;
  }
  u.jtd || H0(e, t), s.block(() => {
    for (const b of c.rules)
      h(b);
    h(c.post);
  });
  function h(b) {
    (0, No.shouldUseGroup)(a, b) && (b.type ? (s.if((0, xn.checkDataType)(b.type, o, u.strictNumbers)), sc(e, b), t.length === 1 && t[0] === b.type && r && (s.else(), (0, xn.reportTypeError)(e)), s.endIf()) : sc(e, b), l || s.if((0, q._)`${W.default.errors} === ${n || 0}`));
  }
}
function sc(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, T0.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, No.shouldUseRule)(n, a) && Iu(e, a.keyword, a.definition, t.type);
  });
}
function H0(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (B0(e, t), e.opts.allowUnionTypes || W0(e, t), J0(e, e.dataTypes));
}
function B0(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Ru(e.dataTypes, r) || Ro(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Y0(e, t);
  }
}
function W0(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Ro(e, "use allowUnionTypes to allow union type keyword");
}
function J0(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, No.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => X0(t, o)) && Ro(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function X0(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Ru(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Y0(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Ru(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Ro(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, $t.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Ou {
  constructor(t, r, n) {
    if ((0, xr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, $t.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Tu(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, xr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", W.default.errors));
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
        const u = Array.isArray(n) ? n : [n];
        return (0, q._)`${(0, xn.checkDataTypes)(u, r, a.opts.strictNumbers, xn.DataType.Wrong)}`;
      }
      return q.nil;
    }
    function l() {
      if (s.validateSchema) {
        const u = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, q._)`!${u}(${r})`;
      }
      return q.nil;
    }
  }
  subschema(t, r) {
    const n = (0, Ms.getSubschema)(this.it, t);
    (0, Ms.extendSubschemaData)(n, this.it, t), (0, Ms.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return L0(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = $t.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = $t.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, q.Name)), !0;
  }
}
Ze.KeywordCxt = Ou;
function Iu(e, t, r, n) {
  const s = new Ou(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, xr.funcKeywordCode)(s, r) : "macro" in r ? (0, xr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, xr.funcKeywordCode)(s, r);
}
const Q0 = /^\/(?:[^~]|~0|~1)*$/, Z0 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Tu(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return W.default.rootData;
  if (e[0] === "/") {
    if (!Q0.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = W.default.rootData;
  } else {
    const d = Z0.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const c = +d[1];
    if (s = d[2], s === "#") {
      if (c >= t)
        throw new Error(u("property/index", c));
      return n[t - c];
    }
    if (c > t)
      throw new Error(u("data", c));
    if (a = r[t - c], !s)
      return a;
  }
  let o = a;
  const l = s.split("/");
  for (const d of l)
    d && (a = (0, q._)`${a}${(0, q.getProperty)((0, $t.unescapeJsonPointer)(d))}`, o = (0, q._)`${o} && ${a}`);
  return o;
  function u(d, c) {
    return `Cannot access ${d} ${c} levels up, current level is ${t}`;
  }
}
Ze.getData = Tu;
var vn = {}, ac;
function Oo() {
  if (ac) return vn;
  ac = 1, Object.defineProperty(vn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return vn.default = e, vn;
}
var wn = {}, oc;
function ys() {
  if (oc) return wn;
  oc = 1, Object.defineProperty(wn, "__esModule", { value: !0 });
  const e = Se;
  class t extends Error {
    constructor(n, s, a, o) {
      super(o || `can't resolve reference ${a} from id ${s}`), this.missingRef = (0, e.resolveUrl)(n, s, a), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return wn.default = t, wn;
}
var Me = {};
Object.defineProperty(Me, "__esModule", { value: !0 });
Me.resolveSchema = Me.getCompilingSchema = Me.resolveRef = Me.compileSchema = Me.SchemaEnv = void 0;
const He = ee, x0 = Oo(), Xt = ct, Xe = Se, ic = C, e_ = Ze;
class gs {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Me.SchemaEnv = gs;
function Io(e) {
  const t = ku.call(this, e);
  if (t)
    return t;
  const r = (0, Xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new He.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: x0.default,
    code: (0, He._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const u = o.scopeName("validate");
  e.validateName = u;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Xt.default.data,
    parentData: Xt.default.parentData,
    parentDataProperty: Xt.default.parentDataProperty,
    dataNames: [Xt.default.data],
    dataPathArr: [He.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, He.stringify)(e.schema) } : { ref: e.schema }),
    validateName: u,
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
  let c;
  try {
    this._compilations.add(e), (0, e_.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    c = `${o.scopeRefs(Xt.default.scope)}return ${h}`, this.opts.code.process && (c = this.opts.code.process(c, e));
    const _ = new Function(`${Xt.default.self}`, `${Xt.default.scope}`, c)(this, this.scope.get());
    if (this.scope.value(u, { ref: _ }), _.errors = null, _.schema = e.schema, _.schemaEnv = e, e.$async && (_.$async = !0), this.opts.code.source === !0 && (_.source = { validateName: u, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: g } = d;
      _.evaluated = {
        props: w instanceof He.Name ? void 0 : w,
        items: g instanceof He.Name ? void 0 : g,
        dynamicProps: w instanceof He.Name,
        dynamicItems: g instanceof He.Name
      }, _.source && (_.source.evaluated = (0, He.stringify)(_.evaluated));
    }
    return e.validate = _, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, c && this.logger.error("Error compiling schema, function code:", c), h;
  } finally {
    this._compilations.delete(e);
  }
}
Me.compileSchema = Io;
function t_(e, t, r) {
  var n;
  r = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = s_.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new gs({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = r_.call(this, a);
}
Me.resolveRef = t_;
function r_(e) {
  return (0, Xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Io.call(this, e);
}
function ku(e) {
  for (const t of this._compilations)
    if (n_(t, e))
      return t;
}
Me.getCompilingSchema = ku;
function n_(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function s_(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || _s.call(this, e, t);
}
function _s(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Xe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Xe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ls.call(this, r, e);
  const a = (0, Xe.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = _s.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : Ls.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Io.call(this, o), a === (0, Xe.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: u } = this.opts, d = l[u];
      return d && (s = (0, Xe.resolveUrl)(this.opts.uriResolver, s, d)), new gs({ schema: l, schemaId: u, root: e, baseId: s });
    }
    return Ls.call(this, r, o);
  }
}
Me.resolveSchema = _s;
const a_ = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Ls(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const u = r[(0, ic.unescapeFragment)(l)];
    if (u === void 0)
      return;
    r = u;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !a_.has(l) && d && (t = (0, Xe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, ic.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = _s.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new gs({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const o_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", i_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", c_ = "object", l_ = [
  "$data"
], u_ = {
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
}, d_ = !1, f_ = {
  $id: o_,
  description: i_,
  type: c_,
  required: l_,
  properties: u_,
  additionalProperties: d_
};
var To = {};
Object.defineProperty(To, "__esModule", { value: !0 });
const ju = Ul;
ju.code = 'require("ajv/dist/runtime/uri").default';
To.default = ju;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Ze;
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
  const n = Oo(), s = ys(), a = or, o = Me, l = ee, u = Se, d = _e, c = C, h = f_, b = To, _ = (P, p) => new RegExp(P, p);
  _.code = "new RegExp";
  const w = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  }, v = 200;
  function N(P) {
    var p, S, $, i, f, E, I, k, F, V, ne, Le, Ct, Dt, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht, Bt;
    const Ge = P.strict, Wt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Cr = Wt === !0 || Wt === void 0 ? 1 : Wt || 0, Dr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Rs = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : Ge) !== null && E !== void 0 ? E : !0,
      strictNumbers: (k = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ge) !== null && k !== void 0 ? k : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ge) !== null && V !== void 0 ? V : "log",
      strictTuples: (Le = (ne = P.strictTuples) !== null && ne !== void 0 ? ne : Ge) !== null && Le !== void 0 ? Le : "log",
      strictRequired: (Dt = (Ct = P.strictRequired) !== null && Ct !== void 0 ? Ct : Ge) !== null && Dt !== void 0 ? Dt : !1,
      code: P.code ? { ...P.code, optimize: Cr, regExp: Dr } : { optimize: Cr, regExp: Dr },
      loopRequired: (Mt = P.loopRequired) !== null && Mt !== void 0 ? Mt : v,
      loopEnum: (Lt = P.loopEnum) !== null && Lt !== void 0 ? Lt : v,
      meta: (Vt = P.meta) !== null && Vt !== void 0 ? Vt : !0,
      messages: (Ft = P.messages) !== null && Ft !== void 0 ? Ft : !0,
      inlineRefs: (zt = P.inlineRefs) !== null && zt !== void 0 ? zt : !0,
      schemaId: (Ut = P.schemaId) !== null && Ut !== void 0 ? Ut : "$id",
      addUsedSchema: (qt = P.addUsedSchema) !== null && qt !== void 0 ? qt : !0,
      validateSchema: (Gt = P.validateSchema) !== null && Gt !== void 0 ? Gt : !0,
      validateFormats: (Kt = P.validateFormats) !== null && Kt !== void 0 ? Kt : !0,
      unicodeRegExp: (Ht = P.unicodeRegExp) !== null && Ht !== void 0 ? Ht : !0,
      int32range: (Bt = P.int32range) !== null && Bt !== void 0 ? Bt : !0,
      uriResolver: Rs
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, y, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && me.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), X.call(this), p.validateFormats = i;
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
      async function i(V, ne) {
        await f.call(this, V.$schema);
        const Le = this._addSchema(V, ne);
        return Le.validate || E.call(this, Le);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function E(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (ne) {
          if (!(ne instanceof s.default))
            throw ne;
          return I.call(this, ne), await k.call(this, ne.missingSchema), E.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: ne }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${ne} cannot be resolved`);
      }
      async function k(V) {
        const ne = await F.call(this, V);
        this.refs[V] || await f.call(this, ne.$schema), this.refs[V] || this.addSchema(ne, V, S);
      }
      async function F(V) {
        const ne = this._loading[V];
        if (ne)
          return ne;
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
        for (const E of p)
          this.addSchema(E, void 0, $, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: E } = this.opts;
        if (f = p[E], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${E} must be string`);
      }
      return S = (0, u.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, $, S, i, !0), this;
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
          return $ && ($ = (0, u.normalizeId)($), delete this.schemas[$], delete this.refs[$]), this;
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
      if (T.call(this, $, S), !S)
        return (0, c.eachItem)($, (f) => j.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, c.eachItem)($, i.type.length === 0 ? (f) => j.call(this, f, i) : (f) => i.type.forEach((E) => j.call(this, f, i, E))), this;
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
        let E = p;
        for (const I of f)
          E = E[I];
        for (const I in $) {
          const k = $[I];
          if (typeof k != "object")
            continue;
          const { $data: F } = k.definition, V = E[I];
          F && V && (E[I] = M(V));
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
      let E;
      const { schemaId: I } = this.opts;
      if (typeof p == "object")
        E = p[I];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let k = this._cache.get(p);
      if (k !== void 0)
        return k;
      $ = (0, u.normalizeId)(E || $);
      const F = u.getSchemaRefs.call(this, p, $);
      return k = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(k.schema, k), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = k), i && this.validateSchema(p, !0), k;
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
    return P = (0, u.normalizeId)(P), this.schemas[P] || this.refs[P];
  }
  function X() {
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
    for (const p of w)
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
  const se = /^[a-z_$][a-z0-9_$:-]*$/i;
  function T(P, p) {
    const { RULES: S } = this;
    if ((0, c.eachItem)(P, ($) => {
      if (S.keywords[$])
        throw new Error(`Keyword ${$} is already defined`);
      if (!se.test($))
        throw new Error(`Keyword ${$} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function j(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: k }) => k === S);
    if (E || (E = { type: S, rules: [] }, f.rules.push(E)), f.keywords[P] = !0, !p)
      return;
    const I = {
      keyword: P,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? L.call(this, E, I, p.before) : E.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((k) => this.addKeyword(k));
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
})(eu);
var ko = {}, jo = {}, Ao = {};
Object.defineProperty(Ao, "__esModule", { value: !0 });
const h_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Ao.default = h_;
var ir = {};
Object.defineProperty(ir, "__esModule", { value: !0 });
ir.callRef = ir.getValidate = void 0;
const m_ = ys(), cc = re, De = ee, dr = ct, lc = Me, En = C, p_ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: u } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const c = lc.resolveRef.call(u, d, s, r);
    if (c === void 0)
      throw new m_.default(n.opts.uriResolver, s, r);
    if (c instanceof lc.SchemaEnv)
      return b(c);
    return _(c);
    function h() {
      if (a === d)
        return zn(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return zn(e, (0, De._)`${w}.validate`, d, d.$async);
    }
    function b(w) {
      const g = Au(e, w);
      zn(e, g, w, w.$async);
    }
    function _(w) {
      const g = t.scopeValue("schema", l.code.source === !0 ? { ref: w, code: (0, De.stringify)(w) } : { ref: w }), y = t.name("valid"), m = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: De.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function Au(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, De._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
ir.getValidate = Au;
function zn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: u } = a, d = u.passContext ? dr.default.this : De.nil;
  n ? c() : h();
  function c() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, De._)`await ${(0, cc.callValidateCode)(e, t, d)}`), _(t), o || s.assign(w, !0);
    }, (g) => {
      s.if((0, De._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), b(g), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, cc.callValidateCode)(e, t, d), () => _(t), () => b(t));
  }
  function b(w) {
    const g = (0, De._)`${w}.errors`;
    s.assign(dr.default.vErrors, (0, De._)`${dr.default.vErrors} === null ? ${g} : ${dr.default.vErrors}.concat(${g})`), s.assign(dr.default.errors, (0, De._)`${dr.default.vErrors}.length`);
  }
  function _(w) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = En.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, De._)`${w}.evaluated.props`);
        a.props = En.mergeEvaluated.props(s, m, a.props, De.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = En.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, De._)`${w}.evaluated.items`);
        a.items = En.mergeEvaluated.items(s, m, a.items, De.Name);
      }
  }
}
ir.callRef = zn;
ir.default = p_;
Object.defineProperty(jo, "__esModule", { value: !0 });
const $_ = Ao, y_ = ir, g_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  $_.default,
  y_.default
];
jo.default = g_;
var Co = {}, Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
const es = ee, Pt = es.operators, ts = {
  maximum: { okStr: "<=", ok: Pt.LTE, fail: Pt.GT },
  minimum: { okStr: ">=", ok: Pt.GTE, fail: Pt.LT },
  exclusiveMaximum: { okStr: "<", ok: Pt.LT, fail: Pt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Pt.GT, fail: Pt.LTE }
}, __ = {
  message: ({ keyword: e, schemaCode: t }) => (0, es.str)`must be ${ts[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, es._)`{comparison: ${ts[e].okStr}, limit: ${t}}`
}, v_ = {
  keyword: Object.keys(ts),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: __,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, es._)`${r} ${ts[t].fail} ${n} || isNaN(${r})`);
  }
};
Do.default = v_;
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const en = ee, w_ = {
  message: ({ schemaCode: e }) => (0, en.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, en._)`{multipleOf: ${e}}`
}, E_ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: w_,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, en._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, en._)`${o} !== parseInt(${o})`;
    e.fail$data((0, en._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Mo.default = E_;
var Lo = {}, Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
function Cu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Vo.default = Cu;
Cu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Lo, "__esModule", { value: !0 });
const tr = ee, b_ = C, S_ = Vo, P_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, tr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, tr._)`{limit: ${e}}`
}, N_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: P_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? tr.operators.GT : tr.operators.LT, o = s.opts.unicode === !1 ? (0, tr._)`${r}.length` : (0, tr._)`${(0, b_.useFunc)(e.gen, S_.default)}(${r})`;
    e.fail$data((0, tr._)`${o} ${a} ${n}`);
  }
};
Lo.default = N_;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const R_ = re, rs = ee, O_ = {
  message: ({ schemaCode: e }) => (0, rs.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, rs._)`{pattern: ${e}}`
}, I_ = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: O_,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, rs._)`(new RegExp(${s}, ${o}))` : (0, R_.usePattern)(e, n);
    e.fail$data((0, rs._)`!${l}.test(${t})`);
  }
};
Fo.default = I_;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const tn = ee, T_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, tn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, tn._)`{limit: ${e}}`
}, k_ = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: T_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? tn.operators.GT : tn.operators.LT;
    e.fail$data((0, tn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
zo.default = k_;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const Gr = re, rn = ee, j_ = C, A_ = {
  message: ({ params: { missingProperty: e } }) => (0, rn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, rn._)`{missingProperty: ${e}}`
}, C_ = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: A_,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: l } = o;
    if (!a && r.length === 0)
      return;
    const u = r.length >= l.loopRequired;
    if (o.allErrors ? d() : c(), l.strictRequired) {
      const _ = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const g of r)
        if ((_ == null ? void 0 : _[g]) === void 0 && !w.has(g)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${y}" (strictRequired)`;
          (0, j_.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (u || a)
        e.block$data(rn.nil, h);
      else
        for (const _ of r)
          (0, Gr.checkReportMissingProp)(e, _);
    }
    function c() {
      const _ = t.let("missing");
      if (u || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => b(_, w)), e.ok(w);
      } else
        t.if((0, Gr.checkMissingProp)(e, r, _)), (0, Gr.reportMissingProp)(e, _), t.else();
    }
    function h() {
      t.forOf("prop", n, (_) => {
        e.setParams({ missingProperty: _ }), t.if((0, Gr.noPropertyInData)(t, s, _, l.ownProperties), () => e.error());
      });
    }
    function b(_, w) {
      e.setParams({ missingProperty: _ }), t.forOf(_, n, () => {
        t.assign(w, (0, Gr.propertyInData)(t, s, _, l.ownProperties)), t.if((0, rn.not)(w), () => {
          e.error(), t.break();
        });
      }, rn.nil);
    }
  }
};
Uo.default = C_;
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const nn = ee, D_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, nn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, nn._)`{limit: ${e}}`
}, M_ = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: D_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? nn.operators.GT : nn.operators.LT;
    e.fail$data((0, nn._)`${r}.length ${s} ${n}`);
  }
};
qo.default = M_;
var Go = {}, dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
const Du = ls;
Du.code = 'require("ajv/dist/runtime/equal").default';
dn.default = Du;
Object.defineProperty(Go, "__esModule", { value: !0 });
const Vs = _e, Ee = ee, L_ = C, V_ = dn, F_ = {
  message: ({ params: { i: e, j: t } }) => (0, Ee.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Ee._)`{i: ${e}, j: ${t}}`
}, z_ = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: F_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const u = t.let("valid"), d = a.items ? (0, Vs.getSchemaTypes)(a.items) : [];
    e.block$data(u, c, (0, Ee._)`${o} === false`), e.ok(u);
    function c() {
      const w = t.let("i", (0, Ee._)`${r}.length`), g = t.let("j");
      e.setParams({ i: w, j: g }), t.assign(u, !0), t.if((0, Ee._)`${w} > 1`, () => (h() ? b : _)(w, g));
    }
    function h() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function b(w, g) {
      const y = t.name("item"), m = (0, Vs.checkDataTypes)(d, y, l.opts.strictNumbers, Vs.DataType.Wrong), v = t.const("indices", (0, Ee._)`{}`);
      t.for((0, Ee._)`;${w}--;`, () => {
        t.let(y, (0, Ee._)`${r}[${w}]`), t.if(m, (0, Ee._)`continue`), d.length > 1 && t.if((0, Ee._)`typeof ${y} == "string"`, (0, Ee._)`${y} += "_"`), t.if((0, Ee._)`typeof ${v}[${y}] == "number"`, () => {
          t.assign(g, (0, Ee._)`${v}[${y}]`), e.error(), t.assign(u, !1).break();
        }).code((0, Ee._)`${v}[${y}] = ${w}`);
      });
    }
    function _(w, g) {
      const y = (0, L_.useFunc)(t, V_.default), m = t.name("outer");
      t.label(m).for((0, Ee._)`;${w}--;`, () => t.for((0, Ee._)`${g} = ${w}; ${g}--;`, () => t.if((0, Ee._)`${y}(${r}[${w}], ${r}[${g}])`, () => {
        e.error(), t.assign(u, !1).break(m);
      })));
    }
  }
};
Go.default = z_;
var Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const ia = ee, U_ = C, q_ = dn, G_ = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ia._)`{allowedValue: ${e}}`
}, K_ = {
  keyword: "const",
  $data: !0,
  error: G_,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, ia._)`!${(0, U_.useFunc)(t, q_.default)}(${r}, ${s})`) : e.fail((0, ia._)`${a} !== ${r}`);
  }
};
Ko.default = K_;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const Wr = ee, H_ = C, B_ = dn, W_ = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Wr._)`{allowedValues: ${e}}`
}, J_ = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: W_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let u;
    const d = () => u ?? (u = (0, H_.useFunc)(t, B_.default));
    let c;
    if (l || n)
      c = t.let("valid"), e.block$data(c, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const _ = t.const("vSchema", a);
      c = (0, Wr.or)(...s.map((w, g) => b(_, g)));
    }
    e.pass(c);
    function h() {
      t.assign(c, !1), t.forOf("v", a, (_) => t.if((0, Wr._)`${d()}(${r}, ${_})`, () => t.assign(c, !0).break()));
    }
    function b(_, w) {
      const g = s[w];
      return typeof g == "object" && g !== null ? (0, Wr._)`${d()}(${r}, ${_}[${w}])` : (0, Wr._)`${r} === ${g}`;
    }
  }
};
Ho.default = J_;
Object.defineProperty(Co, "__esModule", { value: !0 });
const X_ = Do, Y_ = Mo, Q_ = Lo, Z_ = Fo, x_ = zo, ev = Uo, tv = qo, rv = Go, nv = Ko, sv = Ho, av = [
  // number
  X_.default,
  Y_.default,
  // string
  Q_.default,
  Z_.default,
  // object
  x_.default,
  ev.default,
  // array
  tv.default,
  rv.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  nv.default,
  sv.default
];
Co.default = av;
var Bo = {}, kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.validateAdditionalItems = void 0;
const rr = ee, ca = C, ov = {
  message: ({ params: { len: e } }) => (0, rr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, rr._)`{limit: ${e}}`
}, iv = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: ov,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, ca.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Mu(e, n);
  }
};
function Mu(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, rr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, rr._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, ca.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, rr._)`${l} <= ${t.length}`);
    r.if((0, rr.not)(d), () => u(d)), e.ok(d);
  }
  function u(d) {
    r.forRange("i", t.length, l, (c) => {
      e.subschema({ keyword: a, dataProp: c, dataPropType: ca.Type.Num }, d), o.allErrors || r.if((0, rr.not)(d), () => r.break());
    });
  }
}
kr.validateAdditionalItems = Mu;
kr.default = iv;
var Wo = {}, jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.validateTuple = void 0;
const uc = ee, Un = C, cv = re, lv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Lu(e, "additionalItems", t);
    r.items = !0, !(0, Un.alwaysValidSchema)(r, t) && e.ok((0, cv.validateArray)(e));
  }
};
function Lu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  c(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = Un.mergeEvaluated.items(n, r.length, l.items));
  const u = n.name("valid"), d = n.const("len", (0, uc._)`${a}.length`);
  r.forEach((h, b) => {
    (0, Un.alwaysValidSchema)(l, h) || (n.if((0, uc._)`${d} > ${b}`, () => e.subschema({
      keyword: o,
      schemaProp: b,
      dataProp: b
    }, u)), e.ok(u));
  });
  function c(h) {
    const { opts: b, errSchemaPath: _ } = l, w = r.length, g = w === h.minItems && (w === h.maxItems || h[t] === !1);
    if (b.strictTuples && !g) {
      const y = `"${o}" is ${w}-tuple, but minItems or maxItems/${t} are not specified or different at path "${_}"`;
      (0, Un.checkStrictMode)(l, y, b.strictTuples);
    }
  }
}
jr.validateTuple = Lu;
jr.default = lv;
Object.defineProperty(Wo, "__esModule", { value: !0 });
const uv = jr, dv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, uv.validateTuple)(e, "items")
};
Wo.default = dv;
var Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const dc = ee, fv = C, hv = re, mv = kr, pv = {
  message: ({ params: { len: e } }) => (0, dc.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, dc._)`{limit: ${e}}`
}, $v = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: pv,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, fv.alwaysValidSchema)(n, t) && (s ? (0, mv.validateAdditionalItems)(e, s) : e.ok((0, hv.validateArray)(e)));
  }
};
Jo.default = $v;
var Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const qe = ee, bn = C, yv = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe.str)`must contain at least ${e} valid item(s)` : (0, qe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe._)`{minContains: ${e}}` : (0, qe._)`{minContains: ${e}, maxContains: ${t}}`
}, gv = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: yv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: u, maxContains: d } = n;
    a.opts.next ? (o = u === void 0 ? 1 : u, l = d) : o = 1;
    const c = t.const("len", (0, qe._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, bn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, bn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, bn.alwaysValidSchema)(a, r)) {
      let g = (0, qe._)`${c} >= ${o}`;
      l !== void 0 && (g = (0, qe._)`${g} && ${c} <= ${l}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    l === void 0 && o === 1 ? _(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), l !== void 0 && t.if((0, qe._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const g = t.name("_valid"), y = t.let("count", 0);
      _(g, () => t.if(g, () => w(y)));
    }
    function _(g, y) {
      t.forRange("i", 0, c, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: bn.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function w(g) {
      t.code((0, qe._)`${g}++`), l === void 0 ? t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, qe._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Xo.default = gv;
var Vu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ee, r = C, n = re;
  e.error = {
    message: ({ params: { property: u, depsCount: d, deps: c } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${c} when property ${u} is present`;
    },
    params: ({ params: { property: u, depsCount: d, deps: c, missingProperty: h } }) => (0, t._)`{property: ${u},
    missingProperty: ${h},
    depsCount: ${d},
    deps: ${c}}`
    // TODO change to reference
  };
  const s = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: e.error,
    code(u) {
      const [d, c] = a(u);
      o(u, d), l(u, c);
    }
  };
  function a({ schema: u }) {
    const d = {}, c = {};
    for (const h in u) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(u[h]) ? d : c;
      b[h] = u[h];
    }
    return [d, c];
  }
  function o(u, d = u.schema) {
    const { gen: c, data: h, it: b } = u;
    if (Object.keys(d).length === 0)
      return;
    const _ = c.let("missing");
    for (const w in d) {
      const g = d[w];
      if (g.length === 0)
        continue;
      const y = (0, n.propertyInData)(c, h, w, b.opts.ownProperties);
      u.setParams({
        property: w,
        depsCount: g.length,
        deps: g.join(", ")
      }), b.allErrors ? c.if(y, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(u, m);
      }) : (c.if((0, t._)`${y} && (${(0, n.checkMissingProp)(u, g, _)})`), (0, n.reportMissingProp)(u, _), c.else());
    }
  }
  e.validatePropertyDeps = o;
  function l(u, d = u.schema) {
    const { gen: c, data: h, keyword: b, it: _ } = u, w = c.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(_, d[g]) || (c.if(
        (0, n.propertyInData)(c, h, g, _.opts.ownProperties),
        () => {
          const y = u.subschema({ keyword: b, schemaProp: g }, w);
          u.mergeValidEvaluated(y, w);
        },
        () => c.var(w, !0)
        // TODO var
      ), u.ok(w));
  }
  e.validateSchemaDeps = l, e.default = s;
})(Vu);
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const Fu = ee, _v = C, vv = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Fu._)`{propertyName: ${e.propertyName}}`
}, wv = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: vv,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, _v.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Fu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Yo.default = wv;
var vs = {};
Object.defineProperty(vs, "__esModule", { value: !0 });
const Sn = re, We = ee, Ev = ct, Pn = C, bv = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, We._)`{additionalProperty: ${e.additionalProperty}}`
}, Sv = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: bv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: u } = o;
    if (o.props = !0, u.removeAdditional !== "all" && (0, Pn.alwaysValidSchema)(o, r))
      return;
    const d = (0, Sn.allSchemaProperties)(n.properties), c = (0, Sn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, We._)`${a} === ${Ev.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !c.length ? w(y) : t.if(b(y), () => w(y));
      });
    }
    function b(y) {
      let m;
      if (d.length > 8) {
        const v = (0, Pn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, Sn.isOwnProperty)(t, v, y);
      } else d.length ? m = (0, We.or)(...d.map((v) => (0, We._)`${y} === ${v}`)) : m = We.nil;
      return c.length && (m = (0, We.or)(m, ...c.map((v) => (0, We._)`${(0, Sn.usePattern)(e, v)}.test(${y})`))), (0, We.not)(m);
    }
    function _(y) {
      t.code((0, We._)`delete ${s}[${y}]`);
    }
    function w(y) {
      if (u.removeAdditional === "all" || u.removeAdditional && r === !1) {
        _(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), l || t.break();
        return;
      }
      if (typeof r == "object" && !(0, Pn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        u.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, We.not)(m), () => {
          e.reset(), _(y);
        })) : (g(y, m), l || t.if((0, We.not)(m), () => t.break()));
      }
    }
    function g(y, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: Pn.Type.Str
      };
      v === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
vs.default = Sv;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const Pv = Ze, fc = re, Fs = C, hc = vs, Nv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && hc.default.code(new Pv.KeywordCxt(a, hc.default, "additionalProperties"));
    const o = (0, fc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Fs.mergeEvaluated.props(t, (0, Fs.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Fs.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const u = t.name("valid");
    for (const h of l)
      d(h) ? c(h) : (t.if((0, fc.propertyInData)(t, s, h, a.opts.ownProperties)), c(h), a.allErrors || t.else().var(u, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(u);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function c(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, u);
    }
  }
};
Qo.default = Nv;
var Zo = {};
Object.defineProperty(Zo, "__esModule", { value: !0 });
const mc = re, Nn = ee, pc = C, $c = C, Rv = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, mc.allSchemaProperties)(r), u = l.filter((g) => (0, pc.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || u.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, c = t.name("valid");
    a.props !== !0 && !(a.props instanceof Nn.Name) && (a.props = (0, $c.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    b();
    function b() {
      for (const g of l)
        d && _(g), a.allErrors ? w(g) : (t.var(c, !0), w(g), t.if(c));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, pc.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function w(g) {
      t.forIn("key", n, (y) => {
        t.if((0, Nn._)`${(0, mc.usePattern)(e, g)}.test(${y})`, () => {
          const m = u.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: $c.Type.Str
          }, c), a.opts.unevaluated && h !== !0 ? t.assign((0, Nn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, Nn.not)(c), () => t.break());
        });
      });
    }
  }
};
Zo.default = Rv;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const Ov = C, Iv = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Ov.alwaysValidSchema)(n, r)) {
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
xo.default = Iv;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const Tv = re, kv = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Tv.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
ei.default = kv;
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
const qn = ee, jv = C, Av = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, qn._)`{passingSchemas: ${e.passing}}`
}, Cv = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Av,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), u = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((c, h) => {
        let b;
        (0, jv.alwaysValidSchema)(s, c) ? t.var(u, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, u), h > 0 && t.if((0, qn._)`${u} && ${o}`).assign(o, !1).assign(l, (0, qn._)`[${l}, ${h}]`).else(), t.if(u, () => {
          t.assign(o, !0), t.assign(l, h), b && e.mergeEvaluated(b, qn.Name);
        });
      });
    }
  }
};
ti.default = Cv;
var ri = {};
Object.defineProperty(ri, "__esModule", { value: !0 });
const Dv = C, Mv = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Dv.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
ri.default = Mv;
var ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 });
const ns = ee, zu = C, Lv = {
  message: ({ params: e }) => (0, ns.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, ns._)`{failingKeyword: ${e.ifClause}}`
}, Vv = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Lv,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, zu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = yc(n, "then"), a = yc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (u(), e.reset(), s && a) {
      const c = t.let("ifClause");
      e.setParams({ ifClause: c }), t.if(l, d("then", c), d("else", c));
    } else s ? t.if(l, d("then")) : t.if((0, ns.not)(l), d("else"));
    e.pass(o, () => e.error(!0));
    function u() {
      const c = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, l);
      e.mergeEvaluated(c);
    }
    function d(c, h) {
      return () => {
        const b = e.subschema({ keyword: c }, l);
        t.assign(o, l), e.mergeValidEvaluated(b, o), h ? t.assign(h, (0, ns._)`${c}`) : e.setParams({ ifClause: c });
      };
    }
  }
};
function yc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, zu.alwaysValidSchema)(e, r);
}
ni.default = Vv;
var si = {};
Object.defineProperty(si, "__esModule", { value: !0 });
const Fv = C, zv = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Fv.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
si.default = zv;
Object.defineProperty(Bo, "__esModule", { value: !0 });
const Uv = kr, qv = Wo, Gv = jr, Kv = Jo, Hv = Xo, Bv = Vu, Wv = Yo, Jv = vs, Xv = Qo, Yv = Zo, Qv = xo, Zv = ei, xv = ti, ew = ri, tw = ni, rw = si;
function nw(e = !1) {
  const t = [
    // any
    Qv.default,
    Zv.default,
    xv.default,
    ew.default,
    tw.default,
    rw.default,
    // object
    Wv.default,
    Jv.default,
    Bv.default,
    Xv.default,
    Yv.default
  ];
  return e ? t.push(qv.default, Kv.default) : t.push(Uv.default, Gv.default), t.push(Hv.default), t;
}
Bo.default = nw;
var ai = {}, oi = {};
Object.defineProperty(oi, "__esModule", { value: !0 });
const $e = ee, sw = {
  message: ({ schemaCode: e }) => (0, $e.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, $e._)`{format: ${e}}`
}, aw = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: sw,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: l } = e, { opts: u, errSchemaPath: d, schemaEnv: c, self: h } = l;
    if (!u.validateFormats)
      return;
    s ? b() : _();
    function b() {
      const w = r.scopeValue("formats", {
        ref: h.formats,
        code: u.code.formats
      }), g = r.const("fDef", (0, $e._)`${w}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, $e._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(y, (0, $e._)`${g}.type || "string"`).assign(m, (0, $e._)`${g}.validate`), () => r.assign(y, (0, $e._)`"string"`).assign(m, g)), e.fail$data((0, $e.or)(v(), N()));
      function v() {
        return u.strictSchema === !1 ? $e.nil : (0, $e._)`${o} && !${m}`;
      }
      function N() {
        const R = c.$async ? (0, $e._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, $e._)`${m}(${n})`, O = (0, $e._)`(typeof ${m} == "function" ? ${R} : ${m}.test(${n}))`;
        return (0, $e._)`${m} && ${m} !== true && ${y} === ${t} && !${O}`;
      }
    }
    function _() {
      const w = h.formats[a];
      if (!w) {
        v();
        return;
      }
      if (w === !0)
        return;
      const [g, y, m] = N(w);
      g === t && e.pass(R());
      function v() {
        if (u.strictSchema === !1) {
          h.logger.warn(O());
          return;
        }
        throw new Error(O());
        function O() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function N(O) {
        const G = O instanceof RegExp ? (0, $e.regexpCode)(O) : u.code.formats ? (0, $e._)`${u.code.formats}${(0, $e.getProperty)(a)}` : void 0, X = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, $e._)`${X}.validate`] : ["string", O, X];
      }
      function R() {
        if (typeof w == "object" && !(w instanceof RegExp) && w.async) {
          if (!c.$async)
            throw new Error("async format in sync schema");
          return (0, $e._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, $e._)`${m}(${n})` : (0, $e._)`${m}.test(${n})`;
      }
    }
  }
};
oi.default = aw;
Object.defineProperty(ai, "__esModule", { value: !0 });
const ow = oi, iw = [ow.default];
ai.default = iw;
var Pr = {};
Object.defineProperty(Pr, "__esModule", { value: !0 });
Pr.contentVocabulary = Pr.metadataVocabulary = void 0;
Pr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Pr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(ko, "__esModule", { value: !0 });
const cw = jo, lw = Co, uw = Bo, dw = ai, gc = Pr, fw = [
  cw.default,
  lw.default,
  (0, uw.default)(),
  dw.default,
  gc.metadataVocabulary,
  gc.contentVocabulary
];
ko.default = fw;
var ii = {}, ws = {};
Object.defineProperty(ws, "__esModule", { value: !0 });
ws.DiscrError = void 0;
var _c;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(_c || (ws.DiscrError = _c = {}));
Object.defineProperty(ii, "__esModule", { value: !0 });
const $r = ee, la = ws, vc = Me, hw = ys(), mw = C, pw = {
  message: ({ params: { discrError: e, tagName: t } }) => e === la.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, $r._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, $w = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: pw,
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
    const u = t.let("valid", !1), d = t.const("tag", (0, $r._)`${r}${(0, $r.getProperty)(l)}`);
    t.if((0, $r._)`typeof ${d} == "string"`, () => c(), () => e.error(!1, { discrError: la.DiscrError.Tag, tag: d, tagName: l })), e.ok(u);
    function c() {
      const _ = b();
      t.if(!1);
      for (const w in _)
        t.elseIf((0, $r._)`${d} === ${w}`), t.assign(u, h(_[w]));
      t.else(), e.error(!1, { discrError: la.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(_) {
      const w = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: _ }, w);
      return e.mergeEvaluated(g, $r.Name), w;
    }
    function b() {
      var _;
      const w = {}, g = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, mw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const X = O.$ref;
          if (O = vc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), O instanceof vc.SchemaEnv && (O = O.schema), O === void 0)
            throw new hw.default(a.opts.uriResolver, a.baseId, X);
        }
        const G = (_ = O == null ? void 0 : O.properties) === null || _ === void 0 ? void 0 : _[l];
        if (typeof G != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${l}"`);
        y = y && (g || m(O)), v(G, R);
      }
      if (!y)
        throw new Error(`discriminator: "${l}" must be required`);
      return w;
      function m({ required: R }) {
        return Array.isArray(R) && R.includes(l);
      }
      function v(R, O) {
        if (R.const)
          N(R.const, O);
        else if (R.enum)
          for (const G of R.enum)
            N(G, O);
        else
          throw new Error(`discriminator: "properties/${l}" must have "const" or "enum"`);
      }
      function N(R, O) {
        if (typeof R != "string" || R in w)
          throw new Error(`discriminator: "${l}" values must be unique strings`);
        w[R] = O;
      }
    }
  }
};
ii.default = $w;
const yw = "http://json-schema.org/draft-07/schema#", gw = "http://json-schema.org/draft-07/schema#", _w = "Core schema meta-schema", vw = {
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
}, ww = [
  "object",
  "boolean"
], Ew = {
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
}, bw = {
  $schema: yw,
  $id: gw,
  title: _w,
  definitions: vw,
  type: ww,
  properties: Ew,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = eu, n = ko, s = ii, a = bw, o = ["/properties"], l = "http://json-schema.org/draft-07/schema";
  class u extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((w) => this.addVocabulary(w)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const w = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(w, l, !1), this.refs["http://json-schema.org/schema"] = l;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(l) ? l : void 0);
    }
  }
  t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
  var d = Ze;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var c = ee;
  Object.defineProperty(t, "_", { enumerable: !0, get: function() {
    return c._;
  } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
    return c.str;
  } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
    return c.stringify;
  } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
    return c.nil;
  } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
    return c.Name;
  } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
    return c.CodeGen;
  } });
  var h = Oo();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var b = ys();
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return b.default;
  } });
})(ra, ra.exports);
var Sw = ra.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = Sw, r = ee, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: l, schemaCode: u }) => (0, r.str)`should be ${s[l].okStr} ${u}`,
    params: ({ keyword: l, schemaCode: u }) => (0, r._)`{comparison: ${s[l].okStr}, limit: ${u}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(l) {
      const { gen: u, data: d, schemaCode: c, keyword: h, it: b } = l, { opts: _, self: w } = b;
      if (!_.validateFormats)
        return;
      const g = new t.KeywordCxt(b, w.RULES.all.format.definition, "format");
      g.$data ? y() : m();
      function y() {
        const N = u.scopeValue("formats", {
          ref: w.formats,
          code: _.code.formats
        }), R = u.const("fmt", (0, r._)`${N}[${g.schemaCode}]`);
        l.fail$data((0, r.or)((0, r._)`typeof ${R} != "object"`, (0, r._)`${R} instanceof RegExp`, (0, r._)`typeof ${R}.compare != "function"`, v(R)));
      }
      function m() {
        const N = g.schema, R = w.formats[N];
        if (!R || R === !0)
          return;
        if (typeof R != "object" || R instanceof RegExp || typeof R.compare != "function")
          throw new Error(`"${h}": format "${N}" does not define "compare" function`);
        const O = u.scopeValue("formats", {
          key: N,
          ref: R,
          code: _.code.formats ? (0, r._)`${_.code.formats}${(0, r.getProperty)(N)}` : void 0
        });
        l.fail$data(v(O));
      }
      function v(N) {
        return (0, r._)`${N}.compare(${d}, ${c}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (l) => (l.addKeyword(e.formatLimitDefinition), l);
  e.default = o;
})(xl);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Zl, n = xl, s = ee, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), l = (d, c = { keywords: !0 }) => {
    if (Array.isArray(c))
      return u(d, c, r.fullFormats, a), d;
    const [h, b] = c.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], _ = c.formats || r.formatNames;
    return u(d, _, h, b), c.keywords && (0, n.default)(d), d;
  };
  l.get = (d, c = "full") => {
    const b = (c === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!b)
      throw new Error(`Unknown format "${d}"`);
    return b;
  };
  function u(d, c, h, b) {
    var _, w;
    (_ = (w = d.opts.code).formats) !== null && _ !== void 0 || (w.formats = (0, s._)`require("ajv-formats/dist/formats").${b}`);
    for (const g of c)
      d.addFormat(g, h[g]);
  }
  e.exports = t = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
})(ta, ta.exports);
var Pw = ta.exports;
const Nw = /* @__PURE__ */ Zc(Pw), Rw = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !Ow(s, a) && n || Object.defineProperty(e, r, a);
}, Ow = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Iw = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, Tw = (e, t) => `/* Wrapped ${e}*/
${t}`, kw = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), jw = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Aw = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = Tw.bind(null, n, t.toString());
  Object.defineProperty(s, "name", jw);
  const { writable: a, enumerable: o, configurable: l } = kw;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: l });
};
function Cw(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Rw(e, t, s, r);
  return Iw(e, t), Aw(e, t, n), e;
}
const wc = (e, t = {}) => {
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
  let o, l, u;
  const d = function(...c) {
    const h = this, b = () => {
      o = void 0, l && (clearTimeout(l), l = void 0), a && (u = e.apply(h, c));
    }, _ = () => {
      l = void 0, o && (clearTimeout(o), o = void 0), a && (u = e.apply(h, c));
    }, w = s && !o;
    return clearTimeout(o), o = setTimeout(b, r), n > 0 && n !== Number.POSITIVE_INFINITY && !l && (l = setTimeout(_, n)), w && (u = e.apply(h, c)), u;
  };
  return Cw(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), l && (clearTimeout(l), l = void 0);
  }, d;
};
var ua = { exports: {} };
const Dw = "2.0.0", Uu = 256, Mw = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Lw = 16, Vw = Uu - 6, Fw = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var Es = {
  MAX_LENGTH: Uu,
  MAX_SAFE_COMPONENT_LENGTH: Lw,
  MAX_SAFE_BUILD_LENGTH: Vw,
  MAX_SAFE_INTEGER: Mw,
  RELEASE_TYPES: Fw,
  SEMVER_SPEC_VERSION: Dw,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const zw = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var bs = zw;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = Es, a = bs;
  t = e.exports = {};
  const o = t.re = [], l = t.safeRe = [], u = t.src = [], d = t.safeSrc = [], c = t.t = {};
  let h = 0;
  const b = "[a-zA-Z0-9-]", _ = [
    ["\\s", 1],
    ["\\d", s],
    [b, n]
  ], w = (y) => {
    for (const [m, v] of _)
      y = y.split(`${m}*`).join(`${m}{0,${v}}`).split(`${m}+`).join(`${m}{1,${v}}`);
    return y;
  }, g = (y, m, v) => {
    const N = w(m), R = h++;
    a(y, R, m), c[y] = R, u[R] = m, d[R] = N, o[R] = new RegExp(m, v ? "g" : void 0), l[R] = new RegExp(N, v ? "g" : void 0);
  };
  g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${b}*`), g("MAINVERSION", `(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})\\.(${u[c.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})\\.(${u[c.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${u[c.NONNUMERICIDENTIFIER]}|${u[c.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${u[c.NONNUMERICIDENTIFIER]}|${u[c.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${u[c.PRERELEASEIDENTIFIER]}(?:\\.${u[c.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${u[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[c.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${b}+`), g("BUILD", `(?:\\+(${u[c.BUILDIDENTIFIER]}(?:\\.${u[c.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${u[c.MAINVERSION]}${u[c.PRERELEASE]}?${u[c.BUILD]}?`), g("FULL", `^${u[c.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${u[c.MAINVERSIONLOOSE]}${u[c.PRERELEASELOOSE]}?${u[c.BUILD]}?`), g("LOOSE", `^${u[c.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${u[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${u[c.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:\\.(${u[c.XRANGEIDENTIFIER]})(?:${u[c.PRERELEASE]})?${u[c.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[c.XRANGEIDENTIFIERLOOSE]})(?:${u[c.PRERELEASELOOSE]})?${u[c.BUILD]}?)?)?`), g("XRANGE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${u[c.GTLT]}\\s*${u[c.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), g("COERCE", `${u[c.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", u[c.COERCEPLAIN] + `(?:${u[c.PRERELEASE]})?(?:${u[c.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", u[c.COERCE], !0), g("COERCERTLFULL", u[c.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${u[c.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", g("TILDE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${u[c.LONETILDE]}${u[c.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${u[c.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", g("CARET", `^${u[c.LONECARET]}${u[c.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${u[c.LONECARET]}${u[c.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${u[c.GTLT]}\\s*(${u[c.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${u[c.GTLT]}\\s*(${u[c.LOOSEPLAIN]}|${u[c.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${u[c.XRANGEPLAIN]})\\s+-\\s+(${u[c.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${u[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[c.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(ua, ua.exports);
var fn = ua.exports;
const Uw = Object.freeze({ loose: !0 }), qw = Object.freeze({}), Gw = (e) => e ? typeof e != "object" ? Uw : e : qw;
var ci = Gw;
const Ec = /^[0-9]+$/, qu = (e, t) => {
  const r = Ec.test(e), n = Ec.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, Kw = (e, t) => qu(t, e);
var Gu = {
  compareIdentifiers: qu,
  rcompareIdentifiers: Kw
};
const Rn = bs, { MAX_LENGTH: bc, MAX_SAFE_INTEGER: On } = Es, { safeRe: In, t: Tn } = fn, Hw = ci, { compareIdentifiers: fr } = Gu;
let Bw = class rt {
  constructor(t, r) {
    if (r = Hw(r), t instanceof rt) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > bc)
      throw new TypeError(
        `version is longer than ${bc} characters`
      );
    Rn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? In[Tn.LOOSE] : In[Tn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > On || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > On || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > On || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < On)
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
    if (Rn("SemVer.compare", this.version, this.options, t), !(t instanceof rt)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new rt(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof rt || (t = new rt(t, this.options)), fr(this.major, t.major) || fr(this.minor, t.minor) || fr(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof rt || (t = new rt(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (Rn("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return fr(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof rt || (t = new rt(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (Rn("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return fr(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? In[Tn.PRERELEASELOOSE] : In[Tn.PRERELEASE]);
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
          n === !1 && (a = [r]), fr(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ae = Bw;
const Sc = Ae, Ww = (e, t, r = !1) => {
  if (e instanceof Sc)
    return e;
  try {
    return new Sc(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Ar = Ww;
const Jw = Ar, Xw = (e, t) => {
  const r = Jw(e, t);
  return r ? r.version : null;
};
var Yw = Xw;
const Qw = Ar, Zw = (e, t) => {
  const r = Qw(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var xw = Zw;
const Pc = Ae, eE = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new Pc(
      e instanceof Pc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var tE = eE;
const Nc = Ar, rE = (e, t) => {
  const r = Nc(e, null, !0), n = Nc(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, l = a ? n : r, u = !!o.prerelease.length;
  if (!!l.prerelease.length && !u) {
    if (!l.patch && !l.minor)
      return "major";
    if (l.compareMain(o) === 0)
      return l.minor && !l.patch ? "minor" : "patch";
  }
  const c = u ? "pre" : "";
  return r.major !== n.major ? c + "major" : r.minor !== n.minor ? c + "minor" : r.patch !== n.patch ? c + "patch" : "prerelease";
};
var nE = rE;
const sE = Ae, aE = (e, t) => new sE(e, t).major;
var oE = aE;
const iE = Ae, cE = (e, t) => new iE(e, t).minor;
var lE = cE;
const uE = Ae, dE = (e, t) => new uE(e, t).patch;
var fE = dE;
const hE = Ar, mE = (e, t) => {
  const r = hE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var pE = mE;
const Rc = Ae, $E = (e, t, r) => new Rc(e, r).compare(new Rc(t, r));
var et = $E;
const yE = et, gE = (e, t, r) => yE(t, e, r);
var _E = gE;
const vE = et, wE = (e, t) => vE(e, t, !0);
var EE = wE;
const Oc = Ae, bE = (e, t, r) => {
  const n = new Oc(e, r), s = new Oc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var li = bE;
const SE = li, PE = (e, t) => e.sort((r, n) => SE(r, n, t));
var NE = PE;
const RE = li, OE = (e, t) => e.sort((r, n) => RE(n, r, t));
var IE = OE;
const TE = et, kE = (e, t, r) => TE(e, t, r) > 0;
var Ss = kE;
const jE = et, AE = (e, t, r) => jE(e, t, r) < 0;
var ui = AE;
const CE = et, DE = (e, t, r) => CE(e, t, r) === 0;
var Ku = DE;
const ME = et, LE = (e, t, r) => ME(e, t, r) !== 0;
var Hu = LE;
const VE = et, FE = (e, t, r) => VE(e, t, r) >= 0;
var di = FE;
const zE = et, UE = (e, t, r) => zE(e, t, r) <= 0;
var fi = UE;
const qE = Ku, GE = Hu, KE = Ss, HE = di, BE = ui, WE = fi, JE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return qE(e, r, n);
    case "!=":
      return GE(e, r, n);
    case ">":
      return KE(e, r, n);
    case ">=":
      return HE(e, r, n);
    case "<":
      return BE(e, r, n);
    case "<=":
      return WE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Bu = JE;
const XE = Ae, YE = Ar, { safeRe: kn, t: jn } = fn, QE = (e, t) => {
  if (e instanceof XE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? kn[jn.COERCEFULL] : kn[jn.COERCE]);
  else {
    const u = t.includePrerelease ? kn[jn.COERCERTLFULL] : kn[jn.COERCERTL];
    let d;
    for (; (d = u.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), u.lastIndex = d.index + d[1].length + d[2].length;
    u.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", l = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return YE(`${n}.${s}.${a}${o}${l}`, t);
};
var ZE = QE;
class xE {
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
var eb = xE, zs, Ic;
function tt() {
  if (Ic) return zs;
  Ic = 1;
  const e = /\s+/g;
  class t {
    constructor(j, L) {
      if (L = s(L), j instanceof t)
        return j.loose === !!L.loose && j.includePrerelease === !!L.includePrerelease ? j : new t(j.raw, L);
      if (j instanceof a)
        return this.raw = j.value, this.set = [[j]], this.formatted = void 0, this;
      if (this.options = L, this.loose = !!L.loose, this.includePrerelease = !!L.includePrerelease, this.raw = j.trim().replace(e, " "), this.set = this.raw.split("||").map((D) => this.parseRange(D.trim())).filter((D) => D.length), !this.set.length)
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
        for (let j = 0; j < this.set.length; j++) {
          j > 0 && (this.formatted += "||");
          const L = this.set[j];
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
    parseRange(j) {
      const D = ((this.options.includePrerelease && _) | (this.options.loose && w)) + ":" + j, K = n.get(D);
      if (K)
        return K;
      const M = this.options.loose, P = M ? u[d.HYPHENRANGELOOSE] : u[d.HYPHENRANGE];
      j = j.replace(P, H(this.options.includePrerelease)), o("hyphen replace", j), j = j.replace(u[d.COMPARATORTRIM], c), o("comparator trim", j), j = j.replace(u[d.TILDETRIM], h), o("tilde trim", j), j = j.replace(u[d.CARETTRIM], b), o("caret trim", j);
      let p = j.split(" ").map((f) => v(f, this.options)).join(" ").split(/\s+/).map((f) => z(f, this.options));
      M && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(u[d.COMPARATORLOOSE])))), o("range list", p);
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
    intersects(j, L) {
      if (!(j instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((D) => m(D, L) && j.set.some((K) => m(K, L) && D.every((M) => K.every((P) => M.intersects(P, L)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(j) {
      if (!j)
        return !1;
      if (typeof j == "string")
        try {
          j = new l(j, this.options);
        } catch {
          return !1;
        }
      for (let L = 0; L < this.set.length; L++)
        if (se(this.set[L], j, this.options))
          return !0;
      return !1;
    }
  }
  zs = t;
  const r = eb, n = new r(), s = ci, a = Ps(), o = bs, l = Ae, {
    safeRe: u,
    t: d,
    comparatorTrimReplace: c,
    tildeTrimReplace: h,
    caretTrimReplace: b
  } = fn, { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: w } = Es, g = (T) => T.value === "<0.0.0-0", y = (T) => T.value === "", m = (T, j) => {
    let L = !0;
    const D = T.slice();
    let K = D.pop();
    for (; L && D.length; )
      L = D.every((M) => K.intersects(M, j)), K = D.pop();
    return L;
  }, v = (T, j) => (o("comp", T, j), T = G(T, j), o("caret", T), T = R(T, j), o("tildes", T), T = de(T, j), o("xrange", T), T = ye(T, j), o("stars", T), T), N = (T) => !T || T.toLowerCase() === "x" || T === "*", R = (T, j) => T.trim().split(/\s+/).map((L) => O(L, j)).join(" "), O = (T, j) => {
    const L = j.loose ? u[d.TILDELOOSE] : u[d.TILDE];
    return T.replace(L, (D, K, M, P, p) => {
      o("tilde", T, D, K, M, P, p);
      let S;
      return N(K) ? S = "" : N(M) ? S = `>=${K}.0.0 <${+K + 1}.0.0-0` : N(P) ? S = `>=${K}.${M}.0 <${K}.${+M + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${K}.${M}.${P}-${p} <${K}.${+M + 1}.0-0`) : S = `>=${K}.${M}.${P} <${K}.${+M + 1}.0-0`, o("tilde return", S), S;
    });
  }, G = (T, j) => T.trim().split(/\s+/).map((L) => X(L, j)).join(" "), X = (T, j) => {
    o("caret", T, j);
    const L = j.loose ? u[d.CARETLOOSE] : u[d.CARET], D = j.includePrerelease ? "-0" : "";
    return T.replace(L, (K, M, P, p, S) => {
      o("caret", T, K, M, P, p, S);
      let $;
      return N(M) ? $ = "" : N(P) ? $ = `>=${M}.0.0${D} <${+M + 1}.0.0-0` : N(p) ? M === "0" ? $ = `>=${M}.${P}.0${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.0${D} <${+M + 1}.0.0-0` : S ? (o("replaceCaret pr", S), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}-${S} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}-${S} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p}-${S} <${+M + 1}.0.0-0`) : (o("no pr"), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}${D} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p} <${+M + 1}.0.0-0`), o("caret return", $), $;
    });
  }, de = (T, j) => (o("replaceXRanges", T, j), T.split(/\s+/).map((L) => me(L, j)).join(" ")), me = (T, j) => {
    T = T.trim();
    const L = j.loose ? u[d.XRANGELOOSE] : u[d.XRANGE];
    return T.replace(L, (D, K, M, P, p, S) => {
      o("xRange", T, D, K, M, P, p, S);
      const $ = N(M), i = $ || N(P), f = i || N(p), E = f;
      return K === "=" && E && (K = ""), S = j.includePrerelease ? "-0" : "", $ ? K === ">" || K === "<" ? D = "<0.0.0-0" : D = "*" : K && E ? (i && (P = 0), p = 0, K === ">" ? (K = ">=", i ? (M = +M + 1, P = 0, p = 0) : (P = +P + 1, p = 0)) : K === "<=" && (K = "<", i ? M = +M + 1 : P = +P + 1), K === "<" && (S = "-0"), D = `${K + M}.${P}.${p}${S}`) : i ? D = `>=${M}.0.0${S} <${+M + 1}.0.0-0` : f && (D = `>=${M}.${P}.0${S} <${M}.${+P + 1}.0-0`), o("xRange return", D), D;
    });
  }, ye = (T, j) => (o("replaceStars", T, j), T.trim().replace(u[d.STAR], "")), z = (T, j) => (o("replaceGTE0", T, j), T.trim().replace(u[j.includePrerelease ? d.GTE0PRE : d.GTE0], "")), H = (T) => (j, L, D, K, M, P, p, S, $, i, f, E) => (N(D) ? L = "" : N(K) ? L = `>=${D}.0.0${T ? "-0" : ""}` : N(M) ? L = `>=${D}.${K}.0${T ? "-0" : ""}` : P ? L = `>=${L}` : L = `>=${L}${T ? "-0" : ""}`, N($) ? S = "" : N(i) ? S = `<${+$ + 1}.0.0-0` : N(f) ? S = `<${$}.${+i + 1}.0-0` : E ? S = `<=${$}.${i}.${f}-${E}` : T ? S = `<${$}.${i}.${+f + 1}-0` : S = `<=${S}`, `${L} ${S}`.trim()), se = (T, j, L) => {
    for (let D = 0; D < T.length; D++)
      if (!T[D].test(j))
        return !1;
    if (j.prerelease.length && !L.includePrerelease) {
      for (let D = 0; D < T.length; D++)
        if (o(T[D].semver), T[D].semver !== a.ANY && T[D].semver.prerelease.length > 0) {
          const K = T[D].semver;
          if (K.major === j.major && K.minor === j.minor && K.patch === j.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return zs;
}
var Us, Tc;
function Ps() {
  if (Tc) return Us;
  Tc = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(c, h) {
      if (h = r(h), c instanceof t) {
        if (c.loose === !!h.loose)
          return c;
        c = c.value;
      }
      c = c.trim().split(/\s+/).join(" "), o("comparator", c, h), this.options = h, this.loose = !!h.loose, this.parse(c), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, o("comp", this);
    }
    parse(c) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], b = c.match(h);
      if (!b)
        throw new TypeError(`Invalid comparator: ${c}`);
      this.operator = b[1] !== void 0 ? b[1] : "", this.operator === "=" && (this.operator = ""), b[2] ? this.semver = new l(b[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(c) {
      if (o("Comparator.test", c, this.options.loose), this.semver === e || c === e)
        return !0;
      if (typeof c == "string")
        try {
          c = new l(c, this.options);
        } catch {
          return !1;
        }
      return a(c, this.operator, this.semver, this.options);
    }
    intersects(c, h) {
      if (!(c instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(c.value, h).test(this.value) : c.operator === "" ? c.value === "" ? !0 : new u(this.value, h).test(c.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || c.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || c.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && c.operator.startsWith(">") || this.operator.startsWith("<") && c.operator.startsWith("<") || this.semver.version === c.semver.version && this.operator.includes("=") && c.operator.includes("=") || a(this.semver, "<", c.semver, h) && this.operator.startsWith(">") && c.operator.startsWith("<") || a(this.semver, ">", c.semver, h) && this.operator.startsWith("<") && c.operator.startsWith(">")));
    }
  }
  Us = t;
  const r = ci, { safeRe: n, t: s } = fn, a = Bu, o = bs, l = Ae, u = tt();
  return Us;
}
const tb = tt(), rb = (e, t, r) => {
  try {
    t = new tb(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var Ns = rb;
const nb = tt(), sb = (e, t) => new nb(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var ab = sb;
const ob = Ae, ib = tt(), cb = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new ib(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new ob(n, r));
  }), n;
};
var lb = cb;
const ub = Ae, db = tt(), fb = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new db(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new ub(n, r));
  }), n;
};
var hb = fb;
const qs = Ae, mb = tt(), kc = Ss, pb = (e, t) => {
  e = new mb(e, t);
  let r = new qs("0.0.0");
  if (e.test(r) || (r = new qs("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const l = new qs(o.semver.version);
      switch (o.operator) {
        case ">":
          l.prerelease.length === 0 ? l.patch++ : l.prerelease.push(0), l.raw = l.format();
        case "":
        case ">=":
          (!a || kc(l, a)) && (a = l);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || kc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var $b = pb;
const yb = tt(), gb = (e, t) => {
  try {
    return new yb(e, t).range || "*";
  } catch {
    return null;
  }
};
var _b = gb;
const vb = Ae, Wu = Ps(), { ANY: wb } = Wu, Eb = tt(), bb = Ns, jc = Ss, Ac = ui, Sb = fi, Pb = di, Nb = (e, t, r, n) => {
  e = new vb(e, n), t = new Eb(t, n);
  let s, a, o, l, u;
  switch (r) {
    case ">":
      s = jc, a = Sb, o = Ac, l = ">", u = ">=";
      break;
    case "<":
      s = Ac, a = Pb, o = jc, l = "<", u = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (bb(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const c = t.set[d];
    let h = null, b = null;
    if (c.forEach((_) => {
      _.semver === wb && (_ = new Wu(">=0.0.0")), h = h || _, b = b || _, s(_.semver, h.semver, n) ? h = _ : o(_.semver, b.semver, n) && (b = _);
    }), h.operator === l || h.operator === u || (!b.operator || b.operator === l) && a(e, b.semver))
      return !1;
    if (b.operator === u && o(e, b.semver))
      return !1;
  }
  return !0;
};
var hi = Nb;
const Rb = hi, Ob = (e, t, r) => Rb(e, t, ">", r);
var Ib = Ob;
const Tb = hi, kb = (e, t, r) => Tb(e, t, "<", r);
var jb = kb;
const Cc = tt(), Ab = (e, t, r) => (e = new Cc(e, r), t = new Cc(t, r), e.intersects(t, r));
var Cb = Ab;
const Db = Ns, Mb = et;
var Lb = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((c, h) => Mb(c, h, r));
  for (const c of o)
    Db(c, t, r) ? (a = c, s || (s = c)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const l = [];
  for (const [c, h] of n)
    c === h ? l.push(c) : !h && c === o[0] ? l.push("*") : h ? c === o[0] ? l.push(`<=${h}`) : l.push(`${c} - ${h}`) : l.push(`>=${c}`);
  const u = l.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return u.length < d.length ? u : t;
};
const Dc = tt(), mi = Ps(), { ANY: Gs } = mi, Kr = Ns, pi = et, Vb = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Dc(e, r), t = new Dc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = zb(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, Fb = [new mi(">=0.0.0-0")], Mc = [new mi(">=0.0.0")], zb = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Gs) {
    if (t.length === 1 && t[0].semver === Gs)
      return !0;
    r.includePrerelease ? e = Fb : e = Mc;
  }
  if (t.length === 1 && t[0].semver === Gs) {
    if (r.includePrerelease)
      return !0;
    t = Mc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const _ of e)
    _.operator === ">" || _.operator === ">=" ? s = Lc(s, _, r) : _.operator === "<" || _.operator === "<=" ? a = Vc(a, _, r) : n.add(_.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = pi(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const _ of n) {
    if (s && !Kr(_, String(s), r) || a && !Kr(_, String(a), r))
      return null;
    for (const w of t)
      if (!Kr(_, String(w), r))
        return !1;
    return !0;
  }
  let l, u, d, c, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, b = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const _ of t) {
    if (c = c || _.operator === ">" || _.operator === ">=", d = d || _.operator === "<" || _.operator === "<=", s) {
      if (b && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === b.major && _.semver.minor === b.minor && _.semver.patch === b.patch && (b = !1), _.operator === ">" || _.operator === ">=") {
        if (l = Lc(s, _, r), l === _ && l !== s)
          return !1;
      } else if (s.operator === ">=" && !Kr(s.semver, String(_), r))
        return !1;
    }
    if (a) {
      if (h && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === h.major && _.semver.minor === h.minor && _.semver.patch === h.patch && (h = !1), _.operator === "<" || _.operator === "<=") {
        if (u = Vc(a, _, r), u === _ && u !== a)
          return !1;
      } else if (a.operator === "<=" && !Kr(a.semver, String(_), r))
        return !1;
    }
    if (!_.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && c && !s && o !== 0 || b || h);
}, Lc = (e, t, r) => {
  if (!e)
    return t;
  const n = pi(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Vc = (e, t, r) => {
  if (!e)
    return t;
  const n = pi(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var Ub = Vb;
const Ks = fn, Fc = Es, qb = Ae, zc = Gu, Gb = Ar, Kb = Yw, Hb = xw, Bb = tE, Wb = nE, Jb = oE, Xb = lE, Yb = fE, Qb = pE, Zb = et, xb = _E, e1 = EE, t1 = li, r1 = NE, n1 = IE, s1 = Ss, a1 = ui, o1 = Ku, i1 = Hu, c1 = di, l1 = fi, u1 = Bu, d1 = ZE, f1 = Ps(), h1 = tt(), m1 = Ns, p1 = ab, $1 = lb, y1 = hb, g1 = $b, _1 = _b, v1 = hi, w1 = Ib, E1 = jb, b1 = Cb, S1 = Lb, P1 = Ub;
var N1 = {
  parse: Gb,
  valid: Kb,
  clean: Hb,
  inc: Bb,
  diff: Wb,
  major: Jb,
  minor: Xb,
  patch: Yb,
  prerelease: Qb,
  compare: Zb,
  rcompare: xb,
  compareLoose: e1,
  compareBuild: t1,
  sort: r1,
  rsort: n1,
  gt: s1,
  lt: a1,
  eq: o1,
  neq: i1,
  gte: c1,
  lte: l1,
  cmp: u1,
  coerce: d1,
  Comparator: f1,
  Range: h1,
  satisfies: m1,
  toComparators: p1,
  maxSatisfying: $1,
  minSatisfying: y1,
  minVersion: g1,
  validRange: _1,
  outside: v1,
  gtr: w1,
  ltr: E1,
  intersects: b1,
  simplifyRange: S1,
  subset: P1,
  SemVer: qb,
  re: Ks.re,
  src: Ks.src,
  tokens: Ks.t,
  SEMVER_SPEC_VERSION: Fc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Fc.RELEASE_TYPES,
  compareIdentifiers: zc.compareIdentifiers,
  rcompareIdentifiers: zc.rcompareIdentifiers
};
const hr = /* @__PURE__ */ Zc(N1), R1 = Object.prototype.toString, O1 = "[object Uint8Array]", I1 = "[object ArrayBuffer]";
function Ju(e, t, r) {
  return e ? e.constructor === t ? !0 : R1.call(e) === r : !1;
}
function Xu(e) {
  return Ju(e, Uint8Array, O1);
}
function T1(e) {
  return Ju(e, ArrayBuffer, I1);
}
function k1(e) {
  return Xu(e) || T1(e);
}
function j1(e) {
  if (!Xu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function A1(e) {
  if (!k1(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Uc(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    j1(s), r.set(s, n), n += s.length;
  return r;
}
const An = {
  utf8: new globalThis.TextDecoder("utf8")
};
function qc(e, t = "utf8") {
  return A1(e), An[t] ?? (An[t] = new globalThis.TextDecoder(t)), An[t].decode(e);
}
function C1(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const D1 = new globalThis.TextEncoder();
function Hs(e) {
  return C1(e), D1.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const M1 = Nw.default, Gc = "aes-256-cbc", mr = () => /* @__PURE__ */ Object.create(null), L1 = (e) => e != null, V1 = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Gn = "__internal__", Bs = `${Gn}.migrations.version`;
var Ot, ut, Fe, dt;
class F1 {
  constructor(t = {}) {
    Mr(this, "path");
    Mr(this, "events");
    Lr(this, Ot);
    Lr(this, ut);
    Lr(this, Fe);
    Lr(this, dt, {});
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
      r.cwd = dd(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (Vr(this, Fe, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new pg.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      M1(o);
      const l = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      Vr(this, Ot, o.compile(l));
      for (const [u, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (fe(this, dt)[u] = d.default);
    }
    r.defaults && Vr(this, dt, {
      ...fe(this, dt),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), Vr(this, ut, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = ae.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(mr(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      td.deepEqual(s, a);
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
      throw new TypeError(`Please don't use the ${Gn} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      V1(a, o), fe(this, Fe).accessPropertiesByDotNotation ? gi(n, a, o) : n[a] = o;
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
    return fe(this, Fe).accessPropertiesByDotNotation ? id(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      L1(fe(this, dt)[r]) && this.set(r, fe(this, dt)[r]);
  }
  delete(t) {
    const { store: r } = this;
    fe(this, Fe).accessPropertiesByDotNotation ? od(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = mr();
    for (const t of Object.keys(fe(this, dt)))
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
      const t = x.readFileSync(this.path, fe(this, ut) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(mr(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), mr();
      if (fe(this, Fe).clearInvalidConfig && t.name === "SyntaxError")
        return mr();
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
    if (!fe(this, ut))
      return typeof t == "string" ? t : qc(t);
    try {
      const r = t.slice(0, 16), n = Fr.pbkdf2Sync(fe(this, ut), r.toString(), 1e4, 32, "sha512"), s = Fr.createDecipheriv(Gc, n, r), a = t.slice(17), o = typeof a == "string" ? Hs(a) : a;
      return qc(Uc([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      ed(o, a) || (n = o, r.call(this, o, a));
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
    x.mkdirSync(ae.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (fe(this, ut)) {
      const n = Fr.randomBytes(16), s = Fr.pbkdf2Sync(fe(this, ut), n.toString(), 1e4, 32, "sha512"), a = Fr.createCipheriv(Gc, s, n);
      r = Uc([n, Hs(":"), a.update(Hs(r)), a.final()]);
    }
    if (ve.env.SNAP)
      x.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
    else
      try {
        Qc(this.path, r, { mode: fe(this, Fe).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          x.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), x.existsSync(this.path) || this._write(mr()), ve.platform === "win32" ? x.watch(this.path, { persistent: !1 }, wc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : x.watchFile(this.path, { persistent: !1 }, wc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(Bs, "0.0.0");
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
        const u = t[l];
        u == null || u(this), this._set(Bs, l), s = l, o = { ...this.store };
      } catch (u) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(s) || !hr.eq(s, r)) && this._set(Bs, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === Gn ? !0 : typeof t != "string" ? !1 : fe(this, Fe).accessPropertiesByDotNotation ? !!t.startsWith(`${Gn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return hr.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && hr.satisfies(r, t) ? !1 : hr.satisfies(n, t) : !(hr.lte(t, r) || hr.gt(t, n));
  }
  _get(t, r) {
    return ad(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    gi(n, t, r), this.store = n;
  }
}
Ot = new WeakMap(), ut = new WeakMap(), Fe = new WeakMap(), dt = new WeakMap();
const { app: Kn, ipcMain: da, shell: z1 } = Wc;
let Kc = !1;
const Hc = () => {
  if (!da || !Kn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Kn.getPath("userData"),
    appVersion: Kn.getVersion()
  };
  return Kc || (da.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Kc = !0), e;
};
class U1 extends F1 {
  constructor(t) {
    let r, n;
    if (ve.type === "renderer") {
      const s = Wc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else da && Kn && ({ defaultCwd: r, appVersion: n } = Hc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = ae.isAbsolute(t.cwd) ? t.cwd : ae.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Hc();
  }
  async openInEditor() {
    const t = await z1.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const hn = oe.dirname(rd(import.meta.url));
process.env.APP_ROOT = oe.join(hn, "..");
const fa = process.env.VITE_DEV_SERVER_URL, aS = oe.join(process.env.APP_ROOT, "dist-electron"), Yu = oe.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = fa ? oe.join(process.env.APP_ROOT, "public") : Yu;
let J, Hn = null;
const Ye = /* @__PURE__ */ new Map();
let kt = null;
const ss = {
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
}, Bn = new U1({
  defaults: {
    formData: ss
  },
  name: "app-config"
});
xe.handle(
  "save-data",
  async (e, t, r) => {
    try {
      if (t === "all")
        Bn.set("formData", r);
      else {
        const s = { ...Bn.get("formData", ss), ...r };
        Bn.set("formData", s);
      }
      return console.log("Dados salvos com sucesso para a chave:", t), !0;
    } catch (n) {
      return console.error("Erro ao salvar dados:", n), !1;
    }
  }
);
xe.handle("load-data", async () => {
  try {
    return Bn.get("formData", ss);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), ss;
  }
});
xe.handle("select-folder", async () => {
  const e = await Jc.showOpenDialog(J, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
xe.handle("select-file", async () => {
  const e = await Jc.showOpenDialog(J, {
    properties: ["openFile"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhum arquivo selecionado"), null;
  const t = e.filePaths[0];
  return console.log("Arquivo selecionado:", t), t;
});
xe.handle("clean-db", async () => (console.log("Limpando banco de dados..."), new Promise((e) => {
  setTimeout(() => {
    console.log("Banco de dados limpo com sucesso"), e(!0);
  }, 1e3);
})));
xe.handle(
  "print-pdf",
  async (e, t) => {
    try {
      const r = new ha({
        width: 800,
        height: 600,
        show: !0,
        webPreferences: {
          preload: oe.join(hn, "preload.mjs"),
          nodeIntegration: !0,
          contextIsolation: !1
        }
      });
      return await r.loadFile(t), r.setMenu(null), r.webContents.on("did-finish-load", () => {
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
function q1() {
  return oe.join("backend", "index.js");
}
xe.handle(
  "start-fork",
  async (e, { script: t, args: r = [] } = {}) => {
    let n;
    if (t ? n = t : n = q1(), !nr.existsSync(n))
      return console.error("Backend script não encontrado:", n), { ok: !1, reason: "backend-script-not-found" };
    try {
      const s = os(n, r, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: oe.dirname(n),
        silent: !1,
        env: { ...process.env }
      }), a = s.pid;
      if (console.log("Child process forked with PID:", a), typeof a == "number")
        Ye.set(a, s), console.log(
          "Child process added to children map. Total children:",
          Ye.size
        );
      else
        return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
      return new Promise((o, l) => {
        const u = setTimeout(() => {
          l(new Error("Timeout waiting for WebSocket port from backend"));
        }, 1e4), d = (c) => {
          c && c.type === "websocket-port" && typeof c.port == "number" && (clearTimeout(u), s.off("message", d), o({ ok: !0, port: c.port, pid: a }));
        };
        s.on("message", d), s.on("error", (c) => {
          console.error("Child process error:", c), typeof s.pid == "number" && Ye.delete(s.pid), clearTimeout(u), l(c);
        }), s.on("exit", (c, h) => {
          console.log(
            `Child process ${s.pid} exited with code ${c} and signal ${h}`
          ), typeof s.pid == "number" && Ye.delete(s.pid), J && !J.isDestroyed() && J.webContents.send("child-exit", {
            pid: s.pid,
            code: c,
            signal: h
          }), clearTimeout(u), l(new Error(`Child process exited with code ${c}`));
        }), s.on("message", (c) => {
          console.log("Message from child:", c), !(c && typeof c == "object" && "type" in c && c.type === "websocket-port") && J && !J.isDestroyed() && J.webContents.send("child-message", { pid: s.pid, msg: c });
        }), s.stdout && s.stdout.on("data", (c) => {
          console.log("Child stdout:", c.toString()), J && !J.isDestroyed() && J.webContents.send("child-stdout", {
            pid: s.pid,
            data: c.toString()
          });
        }), s.stderr && s.stderr.on("data", (c) => {
          console.error("Child stderr:", c.toString()), J && !J.isDestroyed() && J.webContents.send("child-stderr", {
            pid: s.pid,
            data: c.toString()
          });
        });
      });
    } catch (s) {
      return console.error("Failed to fork child process:", s), { ok: !1, reason: `fork-error: ${s}` };
    }
  }
);
xe.handle(
  "start-collector-fork",
  async (e, { args: t = [] } = {}) => {
    let r;
    if (ft.isPackaged)
      r = oe.join(process.resourcesPath, "backend", "dist", "collector", "runner.js");
    else {
      const n = oe.dirname(oe.dirname(hn));
      r = oe.join(n, "back-end", "dist", "collector", "runner.js");
    }
    if (!nr.existsSync(r))
      return { ok: !1, reason: "collector-not-found", attempted: [r] };
    try {
      const n = os(r, t, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: oe.dirname(r),
        env: { ...process.env }
      }), s = n.pid;
      return typeof s == "number" && (Ye.set(s, n), n.on("message", (a) => {
        J && !J.isDestroyed() && J.webContents.send("child-message", { pid: s, msg: a });
      }), n.stdout && n.stdout.on("data", (a) => {
        J && !J.isDestroyed() && J.webContents.send("child-stdout", { pid: s, data: a.toString() });
      }), n.stderr && n.stderr.on("data", (a) => {
        J && !J.isDestroyed() && J.webContents.send("child-stderr", { pid: s, data: a.toString() });
      })), { ok: !0, pid: s };
    } catch (n) {
      return { ok: !1, reason: String(n) };
    }
  }
);
xe.handle(
  "send-to-child",
  async (e, { pid: t, msg: r } = {}) => {
    if (console.log(
      "send-to-child called with PID:",
      t,
      "Message type:",
      r == null ? void 0 : r.type
    ), console.log("Available children PIDs:", Array.from(Ye.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const n = Ye.get(t);
    if (!n) {
      if (console.log("Child not found for PID:", t), Hn)
        try {
          const s = oe.dirname(Hn), a = os(Hn, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: s,
            silent: !1,
            env: { ...process.env }
          }), o = a.pid;
          if (typeof o == "number") {
            Ye.set(o, a), J && !J.isDestroyed() && J.webContents.send("child-message", {
              pid: o,
              msg: {
                type: "event",
                event: "reforked",
                payload: { oldPid: t, newPid: o }
              }
            });
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
  }
);
xe.handle(
  "stop-child",
  async (e, { pid: t } = {}) => {
    if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const r = Ye.get(t);
    if (!r) return { ok: !1, reason: "not-found" };
    try {
      return r.kill("SIGTERM"), { ok: !0 };
    } catch (n) {
      return { ok: !1, reason: String(n) };
    }
  }
);
function Bc() {
  if (J = new ha({
    icon: oe.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: oe.join(hn, "preload.mjs"),
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), J.maximize(), J.webContents.on("did-finish-load", () => {
    J == null || J.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), fa)
    J.loadURL(fa);
  else
    try {
      const e = oe.join(
        process.resourcesPath,
        "dist",
        "index.html"
      );
      if (console.log("[main] loading packaged index from", e), nr.existsSync(e))
        J.loadFile(e);
      else {
        const t = oe.join(Yu, "index.html");
        console.warn(
          "[main] packaged index not found at",
          e,
          "falling back to",
          t
        ), J.loadFile(t);
      }
    } catch (e) {
      console.error("[main] failed to load packaged index.html", e);
      try {
        const t = oe.join(
          process.resourcesPath,
          "app.asar",
          "dist",
          "index.html"
        );
        console.log("[main] attempting alt loadFile", t), J.loadFile(t);
      } catch (t) {
        console.error("[main] all index.html load attempts failed", t);
      }
    }
}
async function G1() {
  try {
    const e = await fetch("http://localhost:3000/api/ping");
    return e && e.ok ? (console.log("[main] backend is alive"), !0) : (console.log("[main] backend is not responding"), !1);
  } catch {
    return console.log("[main] backend ping failed"), !1;
  }
}
ft.whenReady().then(() => {
  (async () => {
    if (ft.isPackaged)
      try {
        const e = oe.join(
          process.resourcesPath,
          "backend",
          "backend.exe"
        );
        nr.existsSync(e) ? (console.log("[main] Spawning packaged backend exe at", e), kt = nd(e, [], {
          env: {
            ...process.env,
            FRONTEND_API_PORT: process.env.FRONTEND_API_PORT || "3000"
          },
          cwd: process.resourcesPath
        }), kt.stdout.on(
          "data",
          (t) => console.log("[backend exe stdout]", t.toString())
        ), kt.stderr.on(
          "data",
          (t) => console.error("[backend exe stderr]", t.toString())
        ), kt.on(
          "exit",
          (t) => console.log("[backend exe] exited", t)
        )) : console.warn("[main] packaged backend exe not found at", e);
      } catch (e) {
        console.error("[main] failed to spawn packaged backend exe", e);
      }
    else
      try {
        const e = await G1();
        if (e)
          console.log("[main] backend is already running, not auto-forking");
        else {
          console.log(
            "[main] backend not responding, will attempt to auto-fork"
          );
          const t = oe.dirname(oe.dirname(hn)), n = [
            oe.join(t, "back-end", "dist", "index.js"),
            oe.join(t, "back-end", "dist", "src", "index.js"),
            oe.join(t, "back-end", "src", "index.ts")
          ].find((s) => nr.existsSync(s));
          if (n && !e)
            try {
              console.log("[main] dev auto-forking backend at", n), Hn = n;
              const s = oe.dirname(n), a = os(n, [], {
                stdio: ["pipe", "pipe", "ipc"],
                cwd: s,
                env: { ...process.env }
              }), o = a.pid;
              typeof o == "number" && (Ye.set(o, a), console.log("[main] dev backend forked with PID", o)), a.on("message", (l) => {
                J && !J.isDestroyed() && J.webContents.send("child-message", {
                  pid: a.pid,
                  msg: l
                });
              }), a.stdout && a.stdout.on("data", (l) => {
                console.log("[child stdout]", l.toString()), J && !J.isDestroyed() && J.webContents.send("child-stdout", {
                  pid: a.pid,
                  data: l.toString()
                });
              }), a.stderr && a.stderr.on("data", (l) => {
                console.error("[child stderr]", l.toString()), J && !J.isDestroyed() && J.webContents.send("child-stderr", {
                  pid: a.pid,
                  data: l.toString()
                });
              });
            } catch (s) {
              console.warn(
                "[main] failed to auto-fork backend in dev:",
                s
              );
            }
          else
            console.log(
              "[main] running in development mode, backend fork will be started by renderer when needed (no backend script found)"
            );
        }
      } finally {
        console.log(
          "[main] running in development mode, backend fork will be started by renderer when needed (no backend script found)"
        );
      }
    Bc();
  })(), ft.on("activate", () => {
    ha.getAllWindows().length === 0 && Bc();
  });
});
ft.on("window-all-closed", () => {
  process.platform !== "darwin" && ft.quit();
});
ft.on("before-quit", () => {
  try {
    kt && !kt.killed && (kt.kill(), kt = null);
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, e] of Ye.entries())
    try {
      e.kill("SIGTERM");
    } catch {
    }
});
const K1 = oe.join(ft.getPath("userData"), "error.log"), Qu = nr.createWriteStream(K1, { flags: "a" });
process.on("uncaughtException", (e) => {
  Qu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`
  );
});
process.on("unhandledRejection", (e) => {
  Qu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`
  );
});
xe.handle(
  "save-pdf",
  async (e, t) => {
    try {
      const r = ft.getPath("temp"), n = oe.join(r, `relatorio-${Date.now()}.pdf`), s = Buffer.from(t, "base64");
      return nr.writeFileSync(n, s), { ok: !0, path: n };
    } catch (r) {
      return console.error("Failed to save pdf from renderer:", r), { ok: !1, error: String(r) };
    }
  }
);
export {
  aS as MAIN_DIST,
  Yu as RENDERER_DIST,
  fa as VITE_DEV_SERVER_URL
};
