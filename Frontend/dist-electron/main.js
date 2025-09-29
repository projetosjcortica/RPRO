var Xu = Object.defineProperty;
var pi = (e) => {
  throw TypeError(e);
};
var Yu = (e, t, r) => t in e ? Xu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Vr = (e, t, r) => Yu(e, typeof t != "symbol" ? t + "" : t, r), $i = (e, t, r) => t.has(e) || pi("Cannot " + r);
var fe = (e, t, r) => ($i(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Fr = (e, t, r) => t.has(e) ? pi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), zr = (e, t, r, n) => ($i(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import Kc, { ipcMain as et, dialog as Hc, BrowserWindow as ha, app as kt } from "electron";
import * as W from "path";
import ve from "node:process";
import oe from "node:path";
import { promisify as Pe, isDeepStrictEqual as Qu } from "node:util";
import ee from "node:fs";
import Ur from "node:crypto";
import Zu from "node:assert";
import as from "node:os";
import Ge from "fs";
import { fileURLToPath as xu } from "url";
import { fork as os, spawn as ed } from "child_process";
const ar = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Rs = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), td = new Set("0123456789");
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
        if (Rs.has(r))
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
          if (Rs.has(r))
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
        if (n === "index" && !td.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (Rs.has(r))
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
function Bc(e, t) {
  if (ma(e, t))
    throw new Error("Cannot use string index");
}
function rd(e, t, r) {
  if (!ar(e) || typeof t != "string")
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
function yi(e, t, r) {
  if (!ar(e) || typeof t != "string")
    return e;
  const n = e, s = is(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Bc(e, o), a === s.length - 1 ? e[o] = r : ar(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function nd(e, t) {
  if (!ar(e) || typeof t != "string")
    return !1;
  const r = is(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Bc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !ar(e))
      return !1;
  }
}
function sd(e, t) {
  if (!ar(e) || typeof t != "string")
    return !1;
  const r = is(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!ar(e) || !(n in e) || ma(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Rt = as.homedir(), pa = as.tmpdir(), { env: gr } = ve, ad = (e) => {
  const t = oe.join(Rt, "Library");
  return {
    data: oe.join(t, "Application Support", e),
    config: oe.join(t, "Preferences", e),
    cache: oe.join(t, "Caches", e),
    log: oe.join(t, "Logs", e),
    temp: oe.join(pa, e)
  };
}, od = (e) => {
  const t = gr.APPDATA || oe.join(Rt, "AppData", "Roaming"), r = gr.LOCALAPPDATA || oe.join(Rt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: oe.join(r, e, "Data"),
    config: oe.join(t, e, "Config"),
    cache: oe.join(r, e, "Cache"),
    log: oe.join(r, e, "Log"),
    temp: oe.join(pa, e)
  };
}, id = (e) => {
  const t = oe.basename(Rt);
  return {
    data: oe.join(gr.XDG_DATA_HOME || oe.join(Rt, ".local", "share"), e),
    config: oe.join(gr.XDG_CONFIG_HOME || oe.join(Rt, ".config"), e),
    cache: oe.join(gr.XDG_CACHE_HOME || oe.join(Rt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: oe.join(gr.XDG_STATE_HOME || oe.join(Rt, ".local", "state"), e),
    temp: oe.join(pa, t, e)
  };
};
function cd(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ve.platform === "darwin" ? ad(e) : ve.platform === "win32" ? od(e) : id(e);
}
const _t = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, ut = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, ld = ve.getuid ? !ve.getuid() : !1, ud = 1e4, Ve = () => {
}, he = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!he.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !ld && (t === "EINVAL" || t === "EPERM");
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
class dd {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = ud, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
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
const fd = new dd(), vt = (e, t) => function(n) {
  return function s(...a) {
    return fd.schedule().then((o) => {
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
    chmod: _t(Pe(ee.chmod), he.onChangeError),
    chown: _t(Pe(ee.chown), he.onChangeError),
    close: _t(Pe(ee.close), Ve),
    fsync: _t(Pe(ee.fsync), Ve),
    mkdir: _t(Pe(ee.mkdir), Ve),
    realpath: _t(Pe(ee.realpath), Ve),
    stat: _t(Pe(ee.stat), Ve),
    unlink: _t(Pe(ee.unlink), Ve),
    /* SYNC */
    chmodSync: ut(ee.chmodSync, he.onChangeError),
    chownSync: ut(ee.chownSync, he.onChangeError),
    closeSync: ut(ee.closeSync, Ve),
    existsSync: ut(ee.existsSync, Ve),
    fsyncSync: ut(ee.fsync, Ve),
    mkdirSync: ut(ee.mkdirSync, Ve),
    realpathSync: ut(ee.realpathSync, Ve),
    statSync: ut(ee.statSync, Ve),
    unlinkSync: ut(ee.unlinkSync, Ve)
  },
  retry: {
    /* ASYNC */
    close: vt(Pe(ee.close), he.isRetriableError),
    fsync: vt(Pe(ee.fsync), he.isRetriableError),
    open: vt(Pe(ee.open), he.isRetriableError),
    readFile: vt(Pe(ee.readFile), he.isRetriableError),
    rename: vt(Pe(ee.rename), he.isRetriableError),
    stat: vt(Pe(ee.stat), he.isRetriableError),
    write: vt(Pe(ee.write), he.isRetriableError),
    writeFile: vt(Pe(ee.writeFile), he.isRetriableError),
    /* SYNC */
    closeSync: wt(ee.closeSync, he.isRetriableError),
    fsyncSync: wt(ee.fsyncSync, he.isRetriableError),
    openSync: wt(ee.openSync, he.isRetriableError),
    readFileSync: wt(ee.readFileSync, he.isRetriableError),
    renameSync: wt(ee.renameSync, he.isRetriableError),
    statSync: wt(ee.statSync, he.isRetriableError),
    writeSync: wt(ee.writeSync, he.isRetriableError),
    writeFileSync: wt(ee.writeFileSync, he.isRetriableError)
  }
}, hd = "utf8", gi = 438, md = 511, pd = {}, $d = as.userInfo().uid, yd = as.userInfo().gid, gd = 1e3, _d = !!ve.getuid;
ve.getuid && ve.getuid();
const _i = 128, vd = (e) => e instanceof Error && "code" in e, vi = (e) => typeof e == "string", Os = (e) => e === void 0, wd = ve.platform === "linux", Jc = ve.platform === "win32", $a = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Jc || $a.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
wd && $a.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Ed {
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
const bd = new Ed(), Sd = bd.register, Ie = {
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
    if (t.length <= _i)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - _i;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Sd(Ie.purgeSyncAll);
function Wc(e, t, r = pd) {
  if (vi(r))
    return Wc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? gd) || -1);
  let s = null, a = null, o = null;
  try {
    const l = Oe.attempt.realpathSync(e), c = !!l;
    e = l || e, [a, s] = Ie.get(e, r.tmpCreate || Ie.create, r.tmpPurge !== !1);
    const d = _d && Os(r.chown), u = Os(r.mode);
    if (c && (d || u)) {
      const h = Oe.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), u && (r.mode = h.mode));
    }
    if (!c) {
      const h = oe.dirname(e);
      Oe.attempt.mkdirSync(h, {
        mode: md,
        recursive: !0
      });
    }
    o = Oe.retry.openSync(n)(a, "w", r.mode || gi), r.tmpCreated && r.tmpCreated(a), vi(t) ? Oe.retry.writeSync(n)(o, t, 0, r.encoding || hd) : Os(t) || Oe.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Oe.retry.fsyncSync(n)(o) : Oe.attempt.fsync(o)), Oe.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== $d || r.chown.gid !== yd) && Oe.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== gi && Oe.attempt.chmodSync(a, r.mode);
    try {
      Oe.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!vd(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Oe.retry.renameSync(n)(a, Ie.truncate(e));
    }
    s(), a = null;
  } finally {
    o && Oe.attempt.closeSync(o), a && Ie.purge(a);
  }
}
function Xc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Js = { exports: {} }, Yc = {}, Ze = {}, br = {}, un = {}, Q = {}, cn = {};
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
})(cn);
var Ws = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = cn;
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
})(Ws);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = cn, r = Ws;
  var n = cn;
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
  var s = Ws;
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
  class Y extends _ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
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
      const f = new Y();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Y);
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
})(Q);
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
A.checkStrictMode = A.getErrorPath = A.Type = A.useFunc = A.setEvaluated = A.evaluatedPropsToName = A.mergeEvaluated = A.eachItem = A.unescapeJsonPointer = A.escapeJsonPointer = A.escapeFragment = A.unescapeFragment = A.schemaRefOrVal = A.schemaHasRulesButRef = A.schemaHasRules = A.checkUnknownRules = A.alwaysValidSchema = A.toHash = void 0;
const ie = Q, Pd = cn;
function Nd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
A.toHash = Nd;
function Rd(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Qc(e, t), !Zc(t, e.self.RULES.all));
}
A.alwaysValidSchema = Rd;
function Qc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || tl(e, `unknown keyword: "${a}"`);
}
A.checkUnknownRules = Qc;
function Zc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
A.schemaHasRules = Zc;
function Od(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
A.schemaHasRulesButRef = Od;
function Id({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ie._)`${r}`;
  }
  return (0, ie._)`${e}${t}${(0, ie.getProperty)(n)}`;
}
A.schemaRefOrVal = Id;
function jd(e) {
  return xc(decodeURIComponent(e));
}
A.unescapeFragment = jd;
function Td(e) {
  return encodeURIComponent(ya(e));
}
A.escapeFragment = Td;
function ya(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
A.escapeJsonPointer = ya;
function xc(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
A.unescapeJsonPointer = xc;
function kd(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
A.eachItem = kd;
function wi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const c = o === void 0 ? a : o instanceof ie.Name ? (a instanceof ie.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ie.Name ? (t(s, o, a), a) : r(a, o);
    return l === ie.Name && !(c instanceof ie.Name) ? n(s, c) : c;
  };
}
A.mergeEvaluated = {
  props: wi({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ie._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ie._)`${r} || {}`).code((0, ie._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ie._)`${r} || {}`), ga(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: el
  }),
  items: wi({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ie._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ie._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function el(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ie._)`{}`);
  return t !== void 0 && ga(e, r, t), r;
}
A.evaluatedPropsToName = el;
function ga(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ie._)`${t}${(0, ie.getProperty)(n)}`, !0));
}
A.setEvaluated = ga;
const Ei = {};
function Ad(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ei[t.code] || (Ei[t.code] = new Pd._Code(t.code))
  });
}
A.useFunc = Ad;
var Xs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Xs || (A.Type = Xs = {}));
function Cd(e, t, r) {
  if (e instanceof ie.Name) {
    const n = t === Xs.Num;
    return r ? n ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : n ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ie.getProperty)(e).toString() : "/" + ya(e);
}
A.getErrorPath = Cd;
function tl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
A.checkStrictMode = tl;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
const Ne = Q, Dd = {
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
ze.default = Dd;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = Q, r = A, n = ze;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, N) {
    const { it: R } = y, { gen: O, compositeRule: G, allErrors: Y } = R, de = h(y, m, w);
    N ?? (G || Y) ? c(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, w) {
    const { it: N } = y, { gen: R, compositeRule: O, allErrors: G } = N, Y = h(y, m, w);
    c(R, Y), O || G || d(N, n.default.vErrors);
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
    y.forRange("i", R, n.default.errors, (Y) => {
      y.const(G, (0, t._)`${n.default.vErrors}[${Y}]`), y.if((0, t._)`${G}.instancePath === undefined`, () => y.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), y.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (y.assign((0, t._)`${G}.schema`, w), y.assign((0, t._)`${G}.data`, N));
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
    const { keyword: R, data: O, schemaValue: G, it: Y } = y, { opts: de, propertyName: me, topSchemaRef: ye, schemaPath: z } = Y;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), de.messages && N.push([u.message, typeof w == "function" ? w(y) : w]), de.verbose && N.push([u.schema, G], [u.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), me && N.push([u.propertyName, me]);
  }
})(un);
Object.defineProperty(br, "__esModule", { value: !0 });
br.boolOrEmptySchema = br.topBoolOrEmptySchema = void 0;
const Md = un, Ld = Q, Vd = ze, Fd = {
  message: "boolean schema is false"
};
function zd(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? rl(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Vd.default.data) : (t.assign((0, Ld._)`${n}.errors`, null), t.return(!0));
}
br.topBoolOrEmptySchema = zd;
function Ud(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), rl(e)) : r.var(t, !0);
}
br.boolOrEmptySchema = Ud;
function rl(e, t) {
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
  (0, Md.reportError)(s, Fd, void 0, t);
}
var ge = {}, or = {};
Object.defineProperty(or, "__esModule", { value: !0 });
or.getRules = or.isJSONType = void 0;
const qd = ["string", "number", "integer", "boolean", "null", "object", "array"], Gd = new Set(qd);
function Kd(e) {
  return typeof e == "string" && Gd.has(e);
}
or.isJSONType = Kd;
function Hd() {
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
or.getRules = Hd;
var ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
ht.shouldUseRule = ht.shouldUseGroup = ht.schemaHasRulesForType = void 0;
function Bd({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && nl(e, n);
}
ht.schemaHasRulesForType = Bd;
function nl(e, t) {
  return t.rules.some((r) => sl(e, r));
}
ht.shouldUseGroup = nl;
function sl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
ht.shouldUseRule = sl;
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
const Jd = or, Wd = ht, Xd = un, Z = Q, al = A;
var _r;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(_r || (ge.DataType = _r = {}));
function Yd(e) {
  const t = ol(e.type);
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
ge.getSchemaTypes = Yd;
function ol(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Jd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ge.getJSONTypes = ol;
function Qd(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Zd(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Wd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = _a(t, n, s.strictNumbers, _r.Wrong);
    r.if(l, () => {
      a.length ? xd(e, t, a) : va(e);
    });
  }
  return o;
}
ge.coerceAndCheckDataType = Qd;
const il = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Zd(e, t) {
  return t ? e.filter((r) => il.has(r) || t === "array" && r === "array") : [];
}
function xd(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Z._)`typeof ${s}`), l = n.let("coerced", (0, Z._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Z._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Z._)`${s}[0]`).assign(o, (0, Z._)`typeof ${s}`).if(_a(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Z._)`${l} !== undefined`);
  for (const d of r)
    (il.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), va(e), n.endIf(), n.if((0, Z._)`${l} !== undefined`, () => {
    n.assign(s, l), ef(e, l);
  });
  function c(d) {
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
function ef({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Z._)`${t} !== undefined`, () => e.assign((0, Z._)`${t}[${r}]`, n));
}
function Ys(e, t, r, n = _r.Correct) {
  const s = n === _r.Correct ? Z.operators.EQ : Z.operators.NEQ;
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
  return n === _r.Correct ? a : (0, Z.not)(a);
  function o(l = Z.nil) {
    return (0, Z.and)((0, Z._)`typeof ${t} == "number"`, l, r ? (0, Z._)`isFinite(${t})` : Z.nil);
  }
}
ge.checkDataType = Ys;
function _a(e, t, r, n) {
  if (e.length === 1)
    return Ys(e[0], t, r, n);
  let s;
  const a = (0, al.toHash)(e);
  if (a.array && a.object) {
    const o = (0, Z._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, Z._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = Z.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, Z.and)(s, Ys(o, t, r, n));
  return s;
}
ge.checkDataTypes = _a;
const tf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Z._)`{type: ${e}}` : (0, Z._)`{type: ${t}}`
};
function va(e) {
  const t = rf(e);
  (0, Xd.reportError)(t, tf);
}
ge.reportTypeError = va;
function rf(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, al.schemaRefOrVal)(e, n, "type");
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
const lr = Q, nf = A;
function sf(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      bi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => bi(e, a, s.default));
}
cs.assignDefaults = sf;
function bi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, lr._)`${a}${(0, lr.getProperty)(t)}`;
  if (s) {
    (0, nf.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, lr._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, lr._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, lr._)`${l} = ${(0, lr.stringify)(r)}`);
}
var ot = {}, re = {};
Object.defineProperty(re, "__esModule", { value: !0 });
re.validateUnion = re.validateArray = re.usePattern = re.callValidateCode = re.schemaProperties = re.allSchemaProperties = re.noPropertyInData = re.propertyInData = re.isOwnProperty = re.hasPropFunc = re.reportMissingProp = re.checkMissingProp = re.checkReportMissingProp = void 0;
const le = Q, wa = A, Et = ze, af = A;
function of(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ba(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, le._)`${t}` }, !0), e.error();
  });
}
re.checkReportMissingProp = of;
function cf({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, le.or)(...n.map((a) => (0, le.and)(ba(e, t, a, r.ownProperties), (0, le._)`${s} = ${a}`)));
}
re.checkMissingProp = cf;
function lf(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
re.reportMissingProp = lf;
function cl(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, le._)`Object.prototype.hasOwnProperty`
  });
}
re.hasPropFunc = cl;
function Ea(e, t, r) {
  return (0, le._)`${cl(e)}.call(${t}, ${r})`;
}
re.isOwnProperty = Ea;
function uf(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} !== undefined`;
  return n ? (0, le._)`${s} && ${Ea(e, t, r)}` : s;
}
re.propertyInData = uf;
function ba(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} === undefined`;
  return n ? (0, le.or)(s, (0, le.not)(Ea(e, t, r))) : s;
}
re.noPropertyInData = ba;
function ll(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
re.allSchemaProperties = ll;
function df(e, t) {
  return ll(t).filter((r) => !(0, wa.alwaysValidSchema)(e, t[r]));
}
re.schemaProperties = df;
function ff({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
  const u = d ? (0, le._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Et.default.instancePath, (0, le.strConcat)(Et.default.instancePath, a)],
    [Et.default.parentData, o.parentData],
    [Et.default.parentDataProperty, o.parentDataProperty],
    [Et.default.rootData, Et.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Et.default.dynamicAnchors, Et.default.dynamicAnchors]);
  const E = (0, le._)`${u}, ${r.object(...h)}`;
  return c !== le.nil ? (0, le._)`${l}.call(${c}, ${E})` : (0, le._)`${l}(${E})`;
}
re.callValidateCode = ff;
const hf = (0, le._)`new RegExp`;
function mf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, le._)`${s.code === "new RegExp" ? hf : (0, af.useFunc)(e, s)}(${r}, ${n})`
  });
}
re.usePattern = mf;
function pf(e) {
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
        dataPropType: wa.Type.Num
      }, a), t.if((0, le.not)(a), l);
    });
  }
}
re.validateArray = pf;
function $f(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, wa.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
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
re.validateUnion = $f;
Object.defineProperty(ot, "__esModule", { value: !0 });
ot.validateKeywordUsage = ot.validSchemaType = ot.funcKeywordCode = ot.macroKeywordCode = void 0;
const je = Q, Zt = ze, yf = re, gf = un;
function _f(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = ul(r, n, l);
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
ot.macroKeywordCode = _f;
function vf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  Ef(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = ul(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      g(), t.modifying && Si(e), y(() => e.error());
    else {
      const m = t.async ? _() : v();
      t.modifying && Si(e), y(() => wf(e, m));
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
    const w = c.opts.passContext ? Zt.default.this : Zt.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, je._)`${m}${(0, yf.callValidateCode)(e, u, w, N)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, je.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
ot.funcKeywordCode = vf;
function Si(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, je._)`${n.parentData}[${n.parentDataProperty}]`));
}
function wf(e, t) {
  const { gen: r } = e;
  r.if((0, je._)`Array.isArray(${t})`, () => {
    r.assign(Zt.default.vErrors, (0, je._)`${Zt.default.vErrors} === null ? ${t} : ${Zt.default.vErrors}.concat(${t})`).assign(Zt.default.errors, (0, je._)`${Zt.default.vErrors}.length`), (0, gf.extendErrors)(e);
  }, () => e.error());
}
function Ef({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function ul(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, je.stringify)(r) });
}
function bf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
ot.validSchemaType = bf;
function Sf({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
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
ot.validateKeywordUsage = Sf;
var At = {};
Object.defineProperty(At, "__esModule", { value: !0 });
At.extendSubschemaMode = At.extendSubschemaData = At.getSubschema = void 0;
const st = Q, dl = A;
function Pf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
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
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, dl.escapeFragment)(r)}`
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
At.getSubschema = Pf;
function Nf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, st._)`${t.data}${(0, st.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, st.str)`${d}${(0, dl.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, st._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof st.Name ? s : l.let("data", s, !0);
    c(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function c(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
At.extendSubschemaData = Nf;
function Rf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
At.extendSubschemaMode = Rf;
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
}, fl = { exports: {} }, It = fl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Dn(t, n, s, e, "", e);
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
function Dn(e, t, r, n, s, a, o, l, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in It.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            Dn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in It.propsKeywords) {
        if (h && typeof h == "object")
          for (var _ in h)
            Dn(e, t, r, h[_], s + "/" + u + "/" + Of(_), a, s, u, n, _);
      } else (u in It.keywords || e.allKeys && !(u in It.skipKeywords)) && Dn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function Of(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var If = fl.exports;
Object.defineProperty(be, "__esModule", { value: !0 });
be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
const jf = A, Tf = ls, kf = If, Af = /* @__PURE__ */ new Set([
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
function Cf(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Qs(e) : t ? hl(e) <= t : !1;
}
be.inlineRef = Cf;
const Df = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Qs(e) {
  for (const t in e) {
    if (Df.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Qs) || typeof r == "object" && Qs(r))
      return !0;
  }
  return !1;
}
function hl(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Af.has(r) && (typeof e[r] == "object" && (0, jf.eachItem)(e[r], (n) => t += hl(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function ml(e, t = "", r) {
  r !== !1 && (t = vr(t));
  const n = e.parse(t);
  return pl(e, n);
}
be.getFullPath = ml;
function pl(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
be._getFullPath = pl;
const Mf = /#\/?$/;
function vr(e) {
  return e ? e.replace(Mf, "") : "";
}
be.normalizeId = vr;
function Lf(e, t, r) {
  return r = vr(r), e.resolve(t, r);
}
be.resolveUrl = Lf;
const Vf = /^[a-z_][-a-z0-9._]*$/i;
function Ff(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = vr(e[r] || t), a = { "": s }, o = ml(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return kf(e, { allKeys: !0 }, (h, E, _, v) => {
    if (v === void 0)
      return;
    const g = o + E;
    let y = a[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[E] = y;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = vr(y ? R(y, N) : N), c.has(N))
        throw u(N);
      c.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== vr(g) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = g), N;
    }
    function w(N) {
      if (typeof N == "string") {
        if (!Vf.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, E, _) {
    if (E !== void 0 && !Tf(h, E))
      throw u(_);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
be.getSchemaRefs = Ff;
Object.defineProperty(Ze, "__esModule", { value: !0 });
Ze.getData = Ze.KeywordCxt = Ze.validateFunctionCode = void 0;
const $l = br, Pi = ge, Sa = ht, Jn = ge, zf = cs, Yr = ot, Is = At, U = Q, B = ze, Uf = be, mt = A, qr = un;
function qf(e) {
  if (_l(e) && (vl(e), gl(e))) {
    Hf(e);
    return;
  }
  yl(e, () => (0, $l.topBoolOrEmptySchema)(e));
}
Ze.validateFunctionCode = qf;
function yl({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, U._)`${B.default.data}, ${B.default.valCxt}`, n.$async, () => {
    e.code((0, U._)`"use strict"; ${Ni(r, s)}`), Kf(e, s), e.code(a);
  }) : e.func(t, (0, U._)`${B.default.data}, ${Gf(s)}`, n.$async, () => e.code(Ni(r, s)).code(a));
}
function Gf(e) {
  return (0, U._)`{${B.default.instancePath}="", ${B.default.parentData}, ${B.default.parentDataProperty}, ${B.default.rootData}=${B.default.data}${e.dynamicRef ? (0, U._)`, ${B.default.dynamicAnchors}={}` : U.nil}}={}`;
}
function Kf(e, t) {
  e.if(B.default.valCxt, () => {
    e.var(B.default.instancePath, (0, U._)`${B.default.valCxt}.${B.default.instancePath}`), e.var(B.default.parentData, (0, U._)`${B.default.valCxt}.${B.default.parentData}`), e.var(B.default.parentDataProperty, (0, U._)`${B.default.valCxt}.${B.default.parentDataProperty}`), e.var(B.default.rootData, (0, U._)`${B.default.valCxt}.${B.default.rootData}`), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, U._)`${B.default.valCxt}.${B.default.dynamicAnchors}`);
  }, () => {
    e.var(B.default.instancePath, (0, U._)`""`), e.var(B.default.parentData, (0, U._)`undefined`), e.var(B.default.parentDataProperty, (0, U._)`undefined`), e.var(B.default.rootData, B.default.data), t.dynamicRef && e.var(B.default.dynamicAnchors, (0, U._)`{}`);
  });
}
function Hf(e) {
  const { schema: t, opts: r, gen: n } = e;
  yl(e, () => {
    r.$comment && t.$comment && El(e), Yf(e), n.let(B.default.vErrors, null), n.let(B.default.errors, 0), r.unevaluated && Bf(e), wl(e), xf(e);
  });
}
function Bf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, U._)`${r}.evaluated`), t.if((0, U._)`${e.evaluated}.dynamicProps`, () => t.assign((0, U._)`${e.evaluated}.props`, (0, U._)`undefined`)), t.if((0, U._)`${e.evaluated}.dynamicItems`, () => t.assign((0, U._)`${e.evaluated}.items`, (0, U._)`undefined`));
}
function Ni(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, U._)`/*# sourceURL=${r} */` : U.nil;
}
function Jf(e, t) {
  if (_l(e) && (vl(e), gl(e))) {
    Wf(e, t);
    return;
  }
  (0, $l.boolOrEmptySchema)(e, t);
}
function gl({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function _l(e) {
  return typeof e.schema != "boolean";
}
function Wf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && El(e), Qf(e), Zf(e);
  const a = n.const("_errs", B.default.errors);
  wl(e, a), n.var(t, (0, U._)`${a} === ${B.default.errors}`);
}
function vl(e) {
  (0, mt.checkUnknownRules)(e), Xf(e);
}
function wl(e, t) {
  if (e.opts.jtd)
    return Ri(e, [], !1, t);
  const r = (0, Pi.getSchemaTypes)(e.schema), n = (0, Pi.coerceAndCheckDataType)(e, r);
  Ri(e, r, !n, t);
}
function Xf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, mt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Yf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, mt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Qf(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Uf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Zf(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function El({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, U._)`${B.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, U.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, U._)`${B.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function xf(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, U._)`${B.default.errors} === 0`, () => t.return(B.default.data), () => t.throw((0, U._)`new ${s}(${B.default.vErrors})`)) : (t.assign((0, U._)`${n}.errors`, B.default.vErrors), a.unevaluated && eh(e), t.return((0, U._)`${B.default.errors} === 0`));
}
function eh({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof U.Name && e.assign((0, U._)`${t}.props`, r), n instanceof U.Name && e.assign((0, U._)`${t}.items`, n);
}
function Ri(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: c, self: d } = e, { RULES: u } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, mt.schemaHasRulesButRef)(a, u))) {
    s.block(() => Pl(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || th(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, Sa.shouldUseGroup)(a, E) && (E.type ? (s.if((0, Jn.checkDataType)(E.type, o, c.strictNumbers)), Oi(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, Jn.reportTypeError)(e)), s.endIf()) : Oi(e, E), l || s.if((0, U._)`${B.default.errors} === ${n || 0}`));
  }
}
function Oi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, zf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Sa.shouldUseRule)(n, a) && Pl(e, a.keyword, a.definition, t.type);
  });
}
function th(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (rh(e, t), e.opts.allowUnionTypes || nh(e, t), sh(e, e.dataTypes));
}
function rh(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      bl(e.dataTypes, r) || Pa(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), oh(e, t);
  }
}
function nh(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Pa(e, "use allowUnionTypes to allow union type keyword");
}
function sh(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Sa.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => ah(t, o)) && Pa(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function ah(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function bl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function oh(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    bl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Pa(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, mt.checkStrictMode)(e, t, e.opts.strictTypes);
}
let Sl = class {
  constructor(t, r, n) {
    if ((0, Yr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, mt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Nl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Yr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
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
    const n = (0, Is.getSubschema)(this.it, t);
    (0, Is.extendSubschemaData)(n, this.it, t), (0, Is.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return Jf(s, r), s;
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
Ze.KeywordCxt = Sl;
function Pl(e, t, r, n) {
  const s = new Sl(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Yr.funcKeywordCode)(s, r) : "macro" in r ? (0, Yr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Yr.funcKeywordCode)(s, r);
}
const ih = /^\/(?:[^~]|~0|~1)*$/, ch = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Nl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return B.default.rootData;
  if (e[0] === "/") {
    if (!ih.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = B.default.rootData;
  } else {
    const d = ch.exec(e);
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
    d && (a = (0, U._)`${a}${(0, U.getProperty)((0, mt.unescapeJsonPointer)(d))}`, o = (0, U._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
Ze.getData = Nl;
var dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
let lh = class extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
};
dn.default = lh;
var Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
const js = be;
let uh = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, js.resolveUrl)(t, r, n), this.missingSchema = (0, js.normalizeId)((0, js.getFullPath)(t, this.missingRef));
  }
};
Rr.default = uh;
var ke = {};
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.resolveSchema = ke.getCompilingSchema = ke.resolveRef = ke.compileSchema = ke.SchemaEnv = void 0;
const He = Q, dh = dn, Yt = ze, Xe = be, Ii = A, fh = Ze;
let us = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
ke.SchemaEnv = us;
function Na(e) {
  const t = Rl.call(this, e);
  if (t)
    return t;
  const r = (0, Xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new He.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: dh.default,
    code: (0, He._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Yt.default.data,
    parentData: Yt.default.parentData,
    parentDataProperty: Yt.default.parentDataProperty,
    dataNames: [Yt.default.data],
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
    this._compilations.add(e), (0, fh.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Yt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const _ = new Function(`${Yt.default.self}`, `${Yt.default.scope}`, u)(this, this.scope.get());
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
ke.compileSchema = Na;
function hh(e, t, r) {
  var n;
  r = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = $h.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new us({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = mh.call(this, a);
}
ke.resolveRef = hh;
function mh(e) {
  return (0, Xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Na.call(this, e);
}
function Rl(e) {
  for (const t of this._compilations)
    if (ph(t, e))
      return t;
}
ke.getCompilingSchema = Rl;
function ph(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function $h(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || ds.call(this, e, t);
}
function ds(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Xe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Xe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ts.call(this, r, e);
  const a = (0, Xe.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = ds.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : Ts.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Na.call(this, o), a === (0, Xe.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, Xe.resolveUrl)(this.opts.uriResolver, s, d)), new us({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Ts.call(this, r, o);
  }
}
ke.resolveSchema = ds;
const yh = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Ts(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const l of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const c = r[(0, Ii.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !yh.has(l) && d && (t = (0, Xe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ii.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ds.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new us({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const gh = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", _h = "Meta-schema for $data reference (JSON AnySchema extension proposal)", vh = "object", wh = [
  "$data"
], Eh = {
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
}, bh = !1, Sh = {
  $id: gh,
  description: _h,
  type: vh,
  required: wh,
  properties: Eh,
  additionalProperties: bh
};
var Ra = {}, fs = { exports: {} };
const Ph = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Ol = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Il(e) {
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
const Nh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function ji(e) {
  return e.length = 0, !0;
}
function Rh(e, t, r) {
  if (e.length) {
    const n = Il(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function Oh(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, l = Rh;
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
        l = ji;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (l === ji ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(Il(s))), r.address = n.join(""), r;
}
function jl(e) {
  if (Ih(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = Oh(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function Ih(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function jh(e) {
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
function Th(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function kh(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!Ol(r)) {
      const n = jl(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Tl = {
  nonSimpleDomain: Nh,
  recomposeAuthority: kh,
  normalizeComponentEncoding: Th,
  removeDotSegments: jh,
  isIPv4: Ol,
  isUUID: Ph,
  normalizeIPv6: jl
};
const { isUUID: Ah } = Tl, Ch = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function kl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Al(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Cl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Dh(e) {
  return e.secure = kl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Mh(e) {
  if ((e.port === (kl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Lh(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(Ch);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = Oa(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function Vh(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = Oa(s);
  a && (e = a.serialize(e, t));
  const o = e, l = e.nss;
  return o.path = `${n || t.nid}:${l}`, t.skipEscape = !0, o;
}
function Fh(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Ah(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function zh(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Dl = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Al,
    serialize: Cl
  }
), Uh = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Dl.domainHost,
    parse: Al,
    serialize: Cl
  }
), Mn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: Dh,
    serialize: Mh
  }
), qh = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Mn.domainHost,
    parse: Mn.parse,
    serialize: Mn.serialize
  }
), Gh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: Lh,
    serialize: Vh,
    skipNormalize: !0
  }
), Kh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: Fh,
    serialize: zh,
    skipNormalize: !0
  }
), Wn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Dl,
    https: Uh,
    ws: Mn,
    wss: qh,
    urn: Gh,
    "urn:uuid": Kh
  }
);
Object.setPrototypeOf(Wn, null);
function Oa(e) {
  return e && (Wn[
    /** @type {SchemeName} */
    e
  ] || Wn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var Hh = {
  SCHEMES: Wn,
  getSchemeHandler: Oa
};
const { normalizeIPv6: Bh, removeDotSegments: Jr, recomposeAuthority: Jh, normalizeComponentEncoding: yn, isIPv4: Wh, nonSimpleDomain: Xh } = Tl, { SCHEMES: Yh, getSchemeHandler: Ml } = Hh;
function Qh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  it(yt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  yt(it(e, t), t)), e;
}
function Zh(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Ll(yt(e, n), yt(t, n), n, !0);
  return n.skipEscape = !0, it(s, n);
}
function Ll(e, t, r, n) {
  const s = {};
  return n || (e = yt(it(e, r), r), t = yt(it(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Jr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Jr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Jr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Jr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function xh(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = it(yn(yt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = it(yn(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = it(yn(yt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = it(yn(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function it(e, t) {
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
  }, n = Object.assign({}, t), s = [], a = Ml(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Jh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let l = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (l = Jr(l)), o === void 0 && l[0] === "/" && l[1] === "/" && (l = "/%2F" + l.slice(2)), s.push(l);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const em = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
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
  const a = e.match(em);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (Wh(n.host) === !1) {
        const c = Bh(n.host);
        n.host = c.host.toLowerCase(), s = c.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Ml(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && Xh(n.host))
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
  SCHEMES: Yh,
  normalize: Qh,
  resolve: Zh,
  resolveComponent: Ll,
  equal: xh,
  serialize: it,
  parse: yt
};
fs.exports = Ia;
fs.exports.default = Ia;
fs.exports.fastUri = Ia;
var Vl = fs.exports;
Object.defineProperty(Ra, "__esModule", { value: !0 });
const Fl = Vl;
Fl.code = 'require("ajv/dist/runtime/uri").default';
Ra.default = Fl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Ze;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = Q;
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
  const n = dn, s = Rr, a = or, o = ke, l = Q, c = be, d = ge, u = A, h = Sh, E = Ra, _ = (P, p) => new RegExp(P, p);
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
    var p, S, $, i, f, b, I, T, F, V, se, Le, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht, Bt, Jt, Wt;
    const Ke = P.strict, Xt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Mr = Xt === !0 || Xt === void 0 ? 1 : Xt || 0, Lr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ns = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : Ke) !== null && b !== void 0 ? b : !0,
      strictNumbers: (T = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ke) !== null && T !== void 0 ? T : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ke) !== null && V !== void 0 ? V : "log",
      strictTuples: (Le = (se = P.strictTuples) !== null && se !== void 0 ? se : Ke) !== null && Le !== void 0 ? Le : "log",
      strictRequired: (Lt = (Mt = P.strictRequired) !== null && Mt !== void 0 ? Mt : Ke) !== null && Lt !== void 0 ? Lt : !1,
      code: P.code ? { ...P.code, optimize: Mr, regExp: Lr } : { optimize: Mr, regExp: Lr },
      loopRequired: (Vt = P.loopRequired) !== null && Vt !== void 0 ? Vt : w,
      loopEnum: (Ft = P.loopEnum) !== null && Ft !== void 0 ? Ft : w,
      meta: (zt = P.meta) !== null && zt !== void 0 ? zt : !0,
      messages: (Ut = P.messages) !== null && Ut !== void 0 ? Ut : !0,
      inlineRefs: (qt = P.inlineRefs) !== null && qt !== void 0 ? qt : !0,
      schemaId: (Gt = P.schemaId) !== null && Gt !== void 0 ? Gt : "$id",
      addUsedSchema: (Kt = P.addUsedSchema) !== null && Kt !== void 0 ? Kt : !0,
      validateSchema: (Ht = P.validateSchema) !== null && Ht !== void 0 ? Ht : !0,
      validateFormats: (Bt = P.validateFormats) !== null && Bt !== void 0 ? Bt : !0,
      unicodeRegExp: (Jt = P.unicodeRegExp) !== null && Jt !== void 0 ? Jt : !0,
      int32range: (Wt = P.int32range) !== null && Wt !== void 0 ? Wt : !0,
      uriResolver: Ns
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, y, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && me.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
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
      async function i(V, se) {
        await f.call(this, V.$schema);
        const Le = this._addSchema(V, se);
        return Le.validate || b.call(this, Le);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function b(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (se) {
          if (!(se instanceof s.default))
            throw se;
          return I.call(this, se), await T.call(this, se.missingSchema), b.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: se }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${se} cannot be resolved`);
      }
      async function T(V) {
        const se = await F.call(this, V);
        this.refs[V] || await f.call(this, se.$schema), this.refs[V] || this.addSchema(se, V, S);
      }
      async function F(V) {
        const se = this._loading[V];
        if (se)
          return se;
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
  function Y() {
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
})(Yc);
var ja = {}, Ta = {}, ka = {};
Object.defineProperty(ka, "__esModule", { value: !0 });
const tm = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ka.default = tm;
var gt = {};
Object.defineProperty(gt, "__esModule", { value: !0 });
gt.callRef = gt.getValidate = void 0;
const rm = Rr, Ti = re, Ce = Q, ur = ze, ki = ke, gn = A, nm = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = ki.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new rm.default(n.opts.uriResolver, s, r);
    if (u instanceof ki.SchemaEnv)
      return E(u);
    return _(u);
    function h() {
      if (a === d)
        return Ln(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return Ln(e, (0, Ce._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = zl(e, v);
      Ln(e, g, v, v.$async);
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
function zl(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ce._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
gt.getValidate = zl;
function Ln(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? ur.default.this : Ce.nil;
  n ? u() : h();
  function u() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, Ce._)`await ${(0, Ti.callValidateCode)(e, t, d)}`), _(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, Ce._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), E(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, Ti.callValidateCode)(e, t, d), () => _(t), () => E(t));
  }
  function E(v) {
    const g = (0, Ce._)`${v}.errors`;
    s.assign(ur.default.vErrors, (0, Ce._)`${ur.default.vErrors} === null ? ${g} : ${ur.default.vErrors}.concat(${g})`), s.assign(ur.default.errors, (0, Ce._)`${ur.default.vErrors}.length`);
  }
  function _(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = gn.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, Ce._)`${v}.evaluated.props`);
        a.props = gn.mergeEvaluated.props(s, m, a.props, Ce.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = gn.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Ce._)`${v}.evaluated.items`);
        a.items = gn.mergeEvaluated.items(s, m, a.items, Ce.Name);
      }
  }
}
gt.callRef = Ln;
gt.default = nm;
Object.defineProperty(Ta, "__esModule", { value: !0 });
const sm = ka, am = gt, om = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  sm.default,
  am.default
];
Ta.default = om;
var Aa = {}, Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Xn = Q, bt = Xn.operators, Yn = {
  maximum: { okStr: "<=", ok: bt.LTE, fail: bt.GT },
  minimum: { okStr: ">=", ok: bt.GTE, fail: bt.LT },
  exclusiveMaximum: { okStr: "<", ok: bt.LT, fail: bt.GTE },
  exclusiveMinimum: { okStr: ">", ok: bt.GT, fail: bt.LTE }
}, im = {
  message: ({ keyword: e, schemaCode: t }) => (0, Xn.str)`must be ${Yn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Xn._)`{comparison: ${Yn[e].okStr}, limit: ${t}}`
}, cm = {
  keyword: Object.keys(Yn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: im,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Xn._)`${r} ${Yn[t].fail} ${n} || isNaN(${r})`);
  }
};
Ca.default = cm;
var Da = {};
Object.defineProperty(Da, "__esModule", { value: !0 });
const Qr = Q, lm = {
  message: ({ schemaCode: e }) => (0, Qr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Qr._)`{multipleOf: ${e}}`
}, um = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: lm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, Qr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Qr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Qr._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Da.default = um;
var Ma = {}, La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
function Ul(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
La.default = Ul;
Ul.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ma, "__esModule", { value: !0 });
const xt = Q, dm = A, fm = La, hm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, xt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, xt._)`{limit: ${e}}`
}, mm = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: hm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? xt.operators.GT : xt.operators.LT, o = s.opts.unicode === !1 ? (0, xt._)`${r}.length` : (0, xt._)`${(0, dm.useFunc)(e.gen, fm.default)}(${r})`;
    e.fail$data((0, xt._)`${o} ${a} ${n}`);
  }
};
Ma.default = mm;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const pm = re, Qn = Q, $m = {
  message: ({ schemaCode: e }) => (0, Qn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Qn._)`{pattern: ${e}}`
}, ym = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: $m,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, Qn._)`(new RegExp(${s}, ${o}))` : (0, pm.usePattern)(e, n);
    e.fail$data((0, Qn._)`!${l}.test(${t})`);
  }
};
Va.default = ym;
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Zr = Q, gm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Zr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Zr._)`{limit: ${e}}`
}, _m = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: gm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Zr.operators.GT : Zr.operators.LT;
    e.fail$data((0, Zr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Fa.default = _m;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const Gr = re, xr = Q, vm = A, wm = {
  message: ({ params: { missingProperty: e } }) => (0, xr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, xr._)`{missingProperty: ${e}}`
}, Em = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: wm,
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
          (0, vm.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(xr.nil, h);
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
        t.assign(v, (0, Gr.propertyInData)(t, s, _, l.ownProperties)), t.if((0, xr.not)(v), () => {
          e.error(), t.break();
        });
      }, xr.nil);
    }
  }
};
za.default = Em;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const en = Q, bm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, en.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, en._)`{limit: ${e}}`
}, Sm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: bm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? en.operators.GT : en.operators.LT;
    e.fail$data((0, en._)`${r}.length ${s} ${n}`);
  }
};
Ua.default = Sm;
var qa = {}, fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
const ql = ls;
ql.code = 'require("ajv/dist/runtime/equal").default';
fn.default = ql;
Object.defineProperty(qa, "__esModule", { value: !0 });
const ks = ge, we = Q, Pm = A, Nm = fn, Rm = {
  message: ({ params: { i: e, j: t } }) => (0, we.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, we._)`{i: ${e}, j: ${t}}`
}, Om = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Rm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, ks.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, we._)`${o} === false`), e.ok(c);
    function u() {
      const v = t.let("i", (0, we._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(c, !0), t.if((0, we._)`${v} > 1`, () => (h() ? E : _)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function E(v, g) {
      const y = t.name("item"), m = (0, ks.checkDataTypes)(d, y, l.opts.strictNumbers, ks.DataType.Wrong), w = t.const("indices", (0, we._)`{}`);
      t.for((0, we._)`;${v}--;`, () => {
        t.let(y, (0, we._)`${r}[${v}]`), t.if(m, (0, we._)`continue`), d.length > 1 && t.if((0, we._)`typeof ${y} == "string"`, (0, we._)`${y} += "_"`), t.if((0, we._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(g, (0, we._)`${w}[${y}]`), e.error(), t.assign(c, !1).break();
        }).code((0, we._)`${w}[${y}] = ${v}`);
      });
    }
    function _(v, g) {
      const y = (0, Pm.useFunc)(t, Nm.default), m = t.name("outer");
      t.label(m).for((0, we._)`;${v}--;`, () => t.for((0, we._)`${g} = ${v}; ${g}--;`, () => t.if((0, we._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
qa.default = Om;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Zs = Q, Im = A, jm = fn, Tm = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Zs._)`{allowedValue: ${e}}`
}, km = {
  keyword: "const",
  $data: !0,
  error: Tm,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Zs._)`!${(0, Im.useFunc)(t, jm.default)}(${r}, ${s})`) : e.fail((0, Zs._)`${a} !== ${r}`);
  }
};
Ga.default = km;
var Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Wr = Q, Am = A, Cm = fn, Dm = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Wr._)`{allowedValues: ${e}}`
}, Mm = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Dm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, Am.useFunc)(t, Cm.default));
    let u;
    if (l || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const _ = t.const("vSchema", a);
      u = (0, Wr.or)(...s.map((v, g) => E(_, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (_) => t.if((0, Wr._)`${d()}(${r}, ${_})`, () => t.assign(u, !0).break()));
    }
    function E(_, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, Wr._)`${d()}(${r}, ${_}[${v}])` : (0, Wr._)`${r} === ${g}`;
    }
  }
};
Ka.default = Mm;
Object.defineProperty(Aa, "__esModule", { value: !0 });
const Lm = Ca, Vm = Da, Fm = Ma, zm = Va, Um = Fa, qm = za, Gm = Ua, Km = qa, Hm = Ga, Bm = Ka, Jm = [
  // number
  Lm.default,
  Vm.default,
  // string
  Fm.default,
  zm.default,
  // object
  Um.default,
  qm.default,
  // array
  Gm.default,
  Km.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Hm.default,
  Bm.default
];
Aa.default = Jm;
var Ha = {}, Or = {};
Object.defineProperty(Or, "__esModule", { value: !0 });
Or.validateAdditionalItems = void 0;
const er = Q, xs = A, Wm = {
  message: ({ params: { len: e } }) => (0, er.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, er._)`{limit: ${e}}`
}, Xm = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Wm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, xs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Gl(e, n);
  }
};
function Gl(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, er._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, er._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, xs.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, er._)`${l} <= ${t.length}`);
    r.if((0, er.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, l, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: xs.Type.Num }, d), o.allErrors || r.if((0, er.not)(d), () => r.break());
    });
  }
}
Or.validateAdditionalItems = Gl;
Or.default = Xm;
var Ba = {}, Ir = {};
Object.defineProperty(Ir, "__esModule", { value: !0 });
Ir.validateTuple = void 0;
const Ai = Q, Vn = A, Ym = re, Qm = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Kl(e, "additionalItems", t);
    r.items = !0, !(0, Vn.alwaysValidSchema)(r, t) && e.ok((0, Ym.validateArray)(e));
  }
};
function Kl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = Vn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, Ai._)`${a}.length`);
  r.forEach((h, E) => {
    (0, Vn.alwaysValidSchema)(l, h) || (n.if((0, Ai._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: _ } = l, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (E.strictTuples && !g) {
      const y = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${_}"`;
      (0, Vn.checkStrictMode)(l, y, E.strictTuples);
    }
  }
}
Ir.validateTuple = Kl;
Ir.default = Qm;
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Zm = Ir, xm = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Zm.validateTuple)(e, "items")
};
Ba.default = xm;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const Ci = Q, ep = A, tp = re, rp = Or, np = {
  message: ({ params: { len: e } }) => (0, Ci.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ci._)`{limit: ${e}}`
}, sp = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: np,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, ep.alwaysValidSchema)(n, t) && (s ? (0, rp.validateAdditionalItems)(e, s) : e.ok((0, tp.validateArray)(e)));
  }
};
Ja.default = sp;
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const Ue = Q, _n = A, ap = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ue.str)`must contain at least ${e} valid item(s)` : (0, Ue.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ue._)`{minContains: ${e}}` : (0, Ue._)`{minContains: ${e}, maxContains: ${t}}`
}, op = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: ap,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, l = d) : o = 1;
    const u = t.const("len", (0, Ue._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, _n.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, _n.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, _n.alwaysValidSchema)(a, r)) {
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
          dataPropType: _n.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function v(g) {
      t.code((0, Ue._)`${g}++`), l === void 0 ? t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ue._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Wa.default = op;
var hs = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = Q, r = A, n = re;
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
})(hs);
var Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const Hl = Q, ip = A, cp = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Hl._)`{propertyName: ${e.propertyName}}`
}, lp = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: cp,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, ip.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Hl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Xa.default = lp;
var ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
const vn = re, Je = Q, up = ze, wn = A, dp = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Je._)`{additionalProperty: ${e.additionalProperty}}`
}, fp = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: dp,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, wn.alwaysValidSchema)(o, r))
      return;
    const d = (0, vn.allSchemaProperties)(n.properties), u = (0, vn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Je._)`${a} === ${up.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(E(y), () => v(y));
      });
    }
    function E(y) {
      let m;
      if (d.length > 8) {
        const w = (0, wn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, vn.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, Je.or)(...d.map((w) => (0, Je._)`${y} === ${w}`)) : m = Je.nil;
      return u.length && (m = (0, Je.or)(m, ...u.map((w) => (0, Je._)`${(0, vn.usePattern)(e, w)}.test(${y})`))), (0, Je.not)(m);
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
      if (typeof r == "object" && !(0, wn.alwaysValidSchema)(o, r)) {
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
        dataPropType: wn.Type.Str
      };
      w === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
ms.default = fp;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const hp = Ze, Di = re, As = A, Mi = ms, mp = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Mi.default.code(new hp.KeywordCxt(a, Mi.default, "additionalProperties"));
    const o = (0, Di.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = As.mergeEvaluated.props(t, (0, As.toHash)(o), a.props));
    const l = o.filter((h) => !(0, As.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const c = t.name("valid");
    for (const h of l)
      d(h) ? u(h) : (t.if((0, Di.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
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
Ya.default = mp;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const Li = re, En = Q, Vi = A, Fi = A, pp = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, Li.allSchemaProperties)(r), c = l.filter((g) => (0, Vi.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof En.Name) && (a.props = (0, Fi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const g of l)
        d && _(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, Vi.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, (y) => {
        t.if((0, En._)`${(0, Li.usePattern)(e, g)}.test(${y})`, () => {
          const m = c.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: Fi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, En._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, En.not)(u), () => t.break());
        });
      });
    }
  }
};
Qa.default = pp;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const $p = A, yp = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, $p.alwaysValidSchema)(n, r)) {
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
Za.default = yp;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const gp = re, _p = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: gp.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
xa.default = _p;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const Fn = Q, vp = A, wp = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Fn._)`{passingSchemas: ${e.passing}}`
}, Ep = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: wp,
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
        (0, vp.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, Fn._)`${c} && ${o}`).assign(o, !1).assign(l, (0, Fn._)`[${l}, ${h}]`).else(), t.if(c, () => {
          t.assign(o, !0), t.assign(l, h), E && e.mergeEvaluated(E, Fn.Name);
        });
      });
    }
  }
};
eo.default = Ep;
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const bp = A, Sp = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, bp.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
to.default = Sp;
var ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
const Zn = Q, Bl = A, Pp = {
  message: ({ params: e }) => (0, Zn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Zn._)`{failingKeyword: ${e.ifClause}}`
}, Np = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Pp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Bl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = zi(n, "then"), a = zi(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(l, d("then", u), d("else", u));
    } else s ? t.if(l, d("then")) : t.if((0, Zn.not)(l), d("else"));
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
        t.assign(o, l), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, Zn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function zi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Bl.alwaysValidSchema)(e, r);
}
ro.default = Np;
var no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const Rp = A, Op = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Rp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
no.default = Op;
Object.defineProperty(Ha, "__esModule", { value: !0 });
const Ip = Or, jp = Ba, Tp = Ir, kp = Ja, Ap = Wa, Cp = hs, Dp = Xa, Mp = ms, Lp = Ya, Vp = Qa, Fp = Za, zp = xa, Up = eo, qp = to, Gp = ro, Kp = no;
function Hp(e = !1) {
  const t = [
    // any
    Fp.default,
    zp.default,
    Up.default,
    qp.default,
    Gp.default,
    Kp.default,
    // object
    Dp.default,
    Mp.default,
    Cp.default,
    Lp.default,
    Vp.default
  ];
  return e ? t.push(jp.default, kp.default) : t.push(Ip.default, Tp.default), t.push(Ap.default), t;
}
Ha.default = Hp;
var so = {}, jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
jr.dynamicAnchor = void 0;
const Cs = Q, Bp = ze, Ui = ke, Jp = gt, Wp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Jl(e, e.schema)
};
function Jl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, Cs._)`${Bp.default.dynamicAnchors}${(0, Cs.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Xp(e);
  r.if((0, Cs._)`!${s}`, () => r.assign(s, a));
}
jr.dynamicAnchor = Jl;
function Xp(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: l } = t.root, { schemaId: c } = n.opts, d = new Ui.SchemaEnv({ schema: r, schemaId: c, root: s, baseId: a, localRefs: o, meta: l });
  return Ui.compileSchema.call(n, d), (0, Jp.getValidate)(e, d);
}
jr.default = Wp;
var Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
Tr.dynamicRef = void 0;
const qi = Q, Yp = ze, Gi = gt, Qp = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Wl(e, e.schema)
};
function Wl(e, t) {
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
      const d = r.let("_v", (0, qi._)`${Yp.default.dynamicAnchors}${(0, qi.getProperty)(a)}`);
      r.if(d, l(d, c), l(s.validateName, c));
    } else
      l(s.validateName, c)();
  }
  function l(c, d) {
    return d ? () => r.block(() => {
      (0, Gi.callRef)(e, c), r.let(d, !0);
    }) : () => (0, Gi.callRef)(e, c);
  }
}
Tr.dynamicRef = Wl;
Tr.default = Qp;
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const Zp = jr, xp = A, e$ = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Zp.dynamicAnchor)(e, "") : (0, xp.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
ao.default = e$;
var oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const t$ = Tr, r$ = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, t$.dynamicRef)(e, e.schema)
};
oo.default = r$;
Object.defineProperty(so, "__esModule", { value: !0 });
const n$ = jr, s$ = Tr, a$ = ao, o$ = oo, i$ = [n$.default, s$.default, a$.default, o$.default];
so.default = i$;
var io = {}, co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const Ki = hs, c$ = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Ki.error,
  code: (e) => (0, Ki.validatePropertyDeps)(e)
};
co.default = c$;
var lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
const l$ = hs, u$ = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, l$.validateSchemaDeps)(e)
};
lo.default = u$;
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const d$ = A, f$ = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, d$.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
uo.default = f$;
Object.defineProperty(io, "__esModule", { value: !0 });
const h$ = co, m$ = lo, p$ = uo, $$ = [h$.default, m$.default, p$.default];
io.default = $$;
var fo = {}, ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const Nt = Q, Hi = A, y$ = ze, g$ = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Nt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, _$ = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: g$,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: l } = a;
    l instanceof Nt.Name ? t.if((0, Nt._)`${l} !== true`, () => t.forIn("key", n, (h) => t.if(d(l, h), () => c(h)))) : l !== !0 && t.forIn("key", n, (h) => l === void 0 ? c(h) : t.if(u(l, h), () => c(h))), a.props = !0, e.ok((0, Nt._)`${s} === ${y$.default.errors}`);
    function c(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, Hi.alwaysValidSchema)(a, r)) {
        const E = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Hi.Type.Str
        }, E), o || t.if((0, Nt.not)(E), () => t.break());
      }
    }
    function d(h, E) {
      return (0, Nt._)`!${h} || !${h}[${E}]`;
    }
    function u(h, E) {
      const _ = [];
      for (const v in h)
        h[v] === !0 && _.push((0, Nt._)`${E} !== ${v}`);
      return (0, Nt.and)(..._);
    }
  }
};
ho.default = _$;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const tr = Q, Bi = A, v$ = {
  message: ({ params: { len: e } }) => (0, tr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, tr._)`{limit: ${e}}`
}, w$ = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: v$,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, tr._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, tr._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Bi.alwaysValidSchema)(s, r)) {
      const c = t.var("valid", (0, tr._)`${o} <= ${a}`);
      t.if((0, tr.not)(c), () => l(c, a)), e.ok(c);
    }
    s.items = !0;
    function l(c, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: Bi.Type.Num }, c), s.allErrors || t.if((0, tr.not)(c), () => t.break());
      });
    }
  }
};
mo.default = w$;
Object.defineProperty(fo, "__esModule", { value: !0 });
const E$ = ho, b$ = mo, S$ = [E$.default, b$.default];
fo.default = S$;
var po = {}, $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
const pe = Q, P$ = {
  message: ({ schemaCode: e }) => (0, pe.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, pe._)`{format: ${e}}`
}, N$ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: P$,
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
        const G = O instanceof RegExp ? (0, pe.regexpCode)(O) : c.code.formats ? (0, pe._)`${c.code.formats}${(0, pe.getProperty)(a)}` : void 0, Y = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, pe._)`${Y}.validate`] : ["string", O, Y];
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
$o.default = N$;
Object.defineProperty(po, "__esModule", { value: !0 });
const R$ = $o, O$ = [R$.default];
po.default = O$;
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
Object.defineProperty(ja, "__esModule", { value: !0 });
const I$ = Ta, j$ = Aa, T$ = Ha, k$ = so, A$ = io, C$ = fo, D$ = po, Ji = Sr, M$ = [
  k$.default,
  I$.default,
  j$.default,
  (0, T$.default)(!0),
  D$.default,
  Ji.metadataVocabulary,
  Ji.contentVocabulary,
  A$.default,
  C$.default
];
ja.default = M$;
var yo = {}, ps = {};
Object.defineProperty(ps, "__esModule", { value: !0 });
ps.DiscrError = void 0;
var Wi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Wi || (ps.DiscrError = Wi = {}));
Object.defineProperty(yo, "__esModule", { value: !0 });
const $r = Q, ea = ps, Xi = ke, L$ = Rr, V$ = A, F$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ea.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, $r._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, z$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: F$,
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
    const c = t.let("valid", !1), d = t.const("tag", (0, $r._)`${r}${(0, $r.getProperty)(l)}`);
    t.if((0, $r._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: ea.DiscrError.Tag, tag: d, tagName: l })), e.ok(c);
    function u() {
      const _ = E();
      t.if(!1);
      for (const v in _)
        t.elseIf((0, $r._)`${d} === ${v}`), t.assign(c, h(_[v]));
      t.else(), e.error(!1, { discrError: ea.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(_) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: _ }, v);
      return e.mergeEvaluated(g, $r.Name), v;
    }
    function E() {
      var _;
      const v = {}, g = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, V$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const Y = O.$ref;
          if (O = Xi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), O instanceof Xi.SchemaEnv && (O = O.schema), O === void 0)
            throw new L$.default(a.opts.uriResolver, a.baseId, Y);
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
yo.default = z$;
var go = {};
const U$ = "https://json-schema.org/draft/2020-12/schema", q$ = "https://json-schema.org/draft/2020-12/schema", G$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, K$ = "meta", H$ = "Core and Validation specifications meta-schema", B$ = [
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
], J$ = [
  "object",
  "boolean"
], W$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", X$ = {
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
}, Y$ = {
  $schema: U$,
  $id: q$,
  $vocabulary: G$,
  $dynamicAnchor: K$,
  title: H$,
  allOf: B$,
  type: J$,
  $comment: W$,
  properties: X$
}, Q$ = "https://json-schema.org/draft/2020-12/schema", Z$ = "https://json-schema.org/draft/2020-12/meta/applicator", x$ = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, ey = "meta", ty = "Applicator vocabulary meta-schema", ry = [
  "object",
  "boolean"
], ny = {
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
}, sy = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, ay = {
  $schema: Q$,
  $id: Z$,
  $vocabulary: x$,
  $dynamicAnchor: ey,
  title: ty,
  type: ry,
  properties: ny,
  $defs: sy
}, oy = "https://json-schema.org/draft/2020-12/schema", iy = "https://json-schema.org/draft/2020-12/meta/unevaluated", cy = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, ly = "meta", uy = "Unevaluated applicator vocabulary meta-schema", dy = [
  "object",
  "boolean"
], fy = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, hy = {
  $schema: oy,
  $id: iy,
  $vocabulary: cy,
  $dynamicAnchor: ly,
  title: uy,
  type: dy,
  properties: fy
}, my = "https://json-schema.org/draft/2020-12/schema", py = "https://json-schema.org/draft/2020-12/meta/content", $y = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, yy = "meta", gy = "Content vocabulary meta-schema", _y = [
  "object",
  "boolean"
], vy = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, wy = {
  $schema: my,
  $id: py,
  $vocabulary: $y,
  $dynamicAnchor: yy,
  title: gy,
  type: _y,
  properties: vy
}, Ey = "https://json-schema.org/draft/2020-12/schema", by = "https://json-schema.org/draft/2020-12/meta/core", Sy = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, Py = "meta", Ny = "Core vocabulary meta-schema", Ry = [
  "object",
  "boolean"
], Oy = {
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
}, Iy = {
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
}, jy = {
  $schema: Ey,
  $id: by,
  $vocabulary: Sy,
  $dynamicAnchor: Py,
  title: Ny,
  type: Ry,
  properties: Oy,
  $defs: Iy
}, Ty = "https://json-schema.org/draft/2020-12/schema", ky = "https://json-schema.org/draft/2020-12/meta/format-annotation", Ay = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Cy = "meta", Dy = "Format vocabulary meta-schema for annotation results", My = [
  "object",
  "boolean"
], Ly = {
  format: {
    type: "string"
  }
}, Vy = {
  $schema: Ty,
  $id: ky,
  $vocabulary: Ay,
  $dynamicAnchor: Cy,
  title: Dy,
  type: My,
  properties: Ly
}, Fy = "https://json-schema.org/draft/2020-12/schema", zy = "https://json-schema.org/draft/2020-12/meta/meta-data", Uy = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, qy = "meta", Gy = "Meta-data vocabulary meta-schema", Ky = [
  "object",
  "boolean"
], Hy = {
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
}, By = {
  $schema: Fy,
  $id: zy,
  $vocabulary: Uy,
  $dynamicAnchor: qy,
  title: Gy,
  type: Ky,
  properties: Hy
}, Jy = "https://json-schema.org/draft/2020-12/schema", Wy = "https://json-schema.org/draft/2020-12/meta/validation", Xy = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Yy = "meta", Qy = "Validation vocabulary meta-schema", Zy = [
  "object",
  "boolean"
], xy = {
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
}, eg = {
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
}, tg = {
  $schema: Jy,
  $id: Wy,
  $vocabulary: Xy,
  $dynamicAnchor: Yy,
  title: Qy,
  type: Zy,
  properties: xy,
  $defs: eg
};
Object.defineProperty(go, "__esModule", { value: !0 });
const rg = Y$, ng = ay, sg = hy, ag = wy, og = jy, ig = Vy, cg = By, lg = tg, ug = ["/properties"];
function dg(e) {
  return [
    rg,
    ng,
    sg,
    ag,
    og,
    t(this, ig),
    cg,
    t(this, lg)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, ug) : n;
  }
}
go.default = dg;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Yc, n = ja, s = yo, a = go, o = "https://json-schema.org/draft/2020-12/schema";
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
  var c = Ze;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
  } });
  var d = Q;
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
  var u = dn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = Rr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Js, Js.exports);
var fg = Js.exports, ta = { exports: {} }, Xl = {};
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
    int64: { type: "number", validate: Y },
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
  function Y(z) {
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
})(Xl);
var Yl = {}, ra = { exports: {} }, Ql = {}, xe = {}, Pr = {}, hn = {}, te = {}, ln = {};
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
})(ln);
var na = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = ln;
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
})(na);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = ln, r = na;
  var n = ln;
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
  class Y extends _ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
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
      const f = new Y();
      if (this._blockNode(f), this.code(i), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Y);
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
})(te);
var C = {};
Object.defineProperty(C, "__esModule", { value: !0 });
C.checkStrictMode = C.getErrorPath = C.Type = C.useFunc = C.setEvaluated = C.evaluatedPropsToName = C.mergeEvaluated = C.eachItem = C.unescapeJsonPointer = C.escapeJsonPointer = C.escapeFragment = C.unescapeFragment = C.schemaRefOrVal = C.schemaHasRulesButRef = C.schemaHasRules = C.checkUnknownRules = C.alwaysValidSchema = C.toHash = void 0;
const ce = te, hg = ln;
function mg(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = mg;
function pg(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Zl(e, t), !xl(t, e.self.RULES.all));
}
C.alwaysValidSchema = pg;
function Zl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || ru(e, `unknown keyword: "${a}"`);
}
C.checkUnknownRules = Zl;
function xl(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
C.schemaHasRules = xl;
function $g(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
C.schemaHasRulesButRef = $g;
function yg({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ce._)`${r}`;
  }
  return (0, ce._)`${e}${t}${(0, ce.getProperty)(n)}`;
}
C.schemaRefOrVal = yg;
function gg(e) {
  return eu(decodeURIComponent(e));
}
C.unescapeFragment = gg;
function _g(e) {
  return encodeURIComponent(_o(e));
}
C.escapeFragment = _g;
function _o(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
C.escapeJsonPointer = _o;
function eu(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = eu;
function vg(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = vg;
function Yi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const c = o === void 0 ? a : o instanceof ce.Name ? (a instanceof ce.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ce.Name ? (t(s, o, a), a) : r(a, o);
    return l === ce.Name && !(c instanceof ce.Name) ? n(s, c) : c;
  };
}
C.mergeEvaluated = {
  props: Yi({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ce._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ce._)`${r} || {}`).code((0, ce._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ce._)`${r} || {}`), vo(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: tu
  }),
  items: Yi({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ce._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ce._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function tu(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ce._)`{}`);
  return t !== void 0 && vo(e, r, t), r;
}
C.evaluatedPropsToName = tu;
function vo(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ce._)`${t}${(0, ce.getProperty)(n)}`, !0));
}
C.setEvaluated = vo;
const Qi = {};
function wg(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Qi[t.code] || (Qi[t.code] = new hg._Code(t.code))
  });
}
C.useFunc = wg;
var sa;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(sa || (C.Type = sa = {}));
function Eg(e, t, r) {
  if (e instanceof ce.Name) {
    const n = t === sa.Num;
    return r ? n ? (0, ce._)`"[" + ${e} + "]"` : (0, ce._)`"['" + ${e} + "']"` : n ? (0, ce._)`"/" + ${e}` : (0, ce._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ce.getProperty)(e).toString() : "/" + _o(e);
}
C.getErrorPath = Eg;
function ru(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = ru;
var lt = {};
Object.defineProperty(lt, "__esModule", { value: !0 });
const Re = te, bg = {
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
lt.default = bg;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = te, r = C, n = lt;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, N) {
    const { it: R } = y, { gen: O, compositeRule: G, allErrors: Y } = R, de = h(y, m, w);
    N ?? (G || Y) ? c(O, de) : d(R, (0, t._)`[${de}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, w) {
    const { it: N } = y, { gen: R, compositeRule: O, allErrors: G } = N, Y = h(y, m, w);
    c(R, Y), O || G || d(N, n.default.vErrors);
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
    y.forRange("i", R, n.default.errors, (Y) => {
      y.const(G, (0, t._)`${n.default.vErrors}[${Y}]`), y.if((0, t._)`${G}.instancePath === undefined`, () => y.assign((0, t._)`${G}.instancePath`, (0, t.strConcat)(n.default.instancePath, O.errorPath))), y.assign((0, t._)`${G}.schemaPath`, (0, t.str)`${O.errSchemaPath}/${m}`), O.opts.verbose && (y.assign((0, t._)`${G}.schema`, w), y.assign((0, t._)`${G}.data`, N));
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
    const { keyword: R, data: O, schemaValue: G, it: Y } = y, { opts: de, propertyName: me, topSchemaRef: ye, schemaPath: z } = Y;
    N.push([u.keyword, R], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), de.messages && N.push([u.message, typeof w == "function" ? w(y) : w]), de.verbose && N.push([u.schema, G], [u.parentSchema, (0, t._)`${ye}${z}`], [n.default.data, O]), me && N.push([u.propertyName, me]);
  }
})(hn);
Object.defineProperty(Pr, "__esModule", { value: !0 });
Pr.boolOrEmptySchema = Pr.topBoolOrEmptySchema = void 0;
const Sg = hn, Pg = te, Ng = lt, Rg = {
  message: "boolean schema is false"
};
function Og(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? nu(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Ng.default.data) : (t.assign((0, Pg._)`${n}.errors`, null), t.return(!0));
}
Pr.topBoolOrEmptySchema = Og;
function Ig(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), nu(e)) : r.var(t, !0);
}
Pr.boolOrEmptySchema = Ig;
function nu(e, t) {
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
  (0, Sg.reportError)(s, Rg, void 0, t);
}
var _e = {}, ir = {};
Object.defineProperty(ir, "__esModule", { value: !0 });
ir.getRules = ir.isJSONType = void 0;
const jg = ["string", "number", "integer", "boolean", "null", "object", "array"], Tg = new Set(jg);
function kg(e) {
  return typeof e == "string" && Tg.has(e);
}
ir.isJSONType = kg;
function Ag() {
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
ir.getRules = Ag;
var pt = {};
Object.defineProperty(pt, "__esModule", { value: !0 });
pt.shouldUseRule = pt.shouldUseGroup = pt.schemaHasRulesForType = void 0;
function Cg({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && su(e, n);
}
pt.schemaHasRulesForType = Cg;
function su(e, t) {
  return t.rules.some((r) => au(e, r));
}
pt.shouldUseGroup = su;
function au(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
pt.shouldUseRule = au;
Object.defineProperty(_e, "__esModule", { value: !0 });
_e.reportTypeError = _e.checkDataTypes = _e.checkDataType = _e.coerceAndCheckDataType = _e.getJSONTypes = _e.getSchemaTypes = _e.DataType = void 0;
const Dg = ir, Mg = pt, Lg = hn, x = te, ou = C;
var wr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(wr || (_e.DataType = wr = {}));
function Vg(e) {
  const t = iu(e.type);
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
_e.getSchemaTypes = Vg;
function iu(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Dg.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
_e.getJSONTypes = iu;
function Fg(e, t) {
  const { gen: r, data: n, opts: s } = e, a = zg(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Mg.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = wo(t, n, s.strictNumbers, wr.Wrong);
    r.if(l, () => {
      a.length ? Ug(e, t, a) : Eo(e);
    });
  }
  return o;
}
_e.coerceAndCheckDataType = Fg;
const cu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function zg(e, t) {
  return t ? e.filter((r) => cu.has(r) || t === "array" && r === "array") : [];
}
function Ug(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, x._)`typeof ${s}`), l = n.let("coerced", (0, x._)`undefined`);
  a.coerceTypes === "array" && n.if((0, x._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, x._)`${s}[0]`).assign(o, (0, x._)`typeof ${s}`).if(wo(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, x._)`${l} !== undefined`);
  for (const d of r)
    (cu.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), Eo(e), n.endIf(), n.if((0, x._)`${l} !== undefined`, () => {
    n.assign(s, l), qg(e, l);
  });
  function c(d) {
    switch (d) {
      case "string":
        n.elseIf((0, x._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, x._)`"" + ${s}`).elseIf((0, x._)`${s} === null`).assign(l, (0, x._)`""`);
        return;
      case "number":
        n.elseIf((0, x._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(l, (0, x._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, x._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(l, (0, x._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, x._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(l, !1).elseIf((0, x._)`${s} === "true" || ${s} === 1`).assign(l, !0);
        return;
      case "null":
        n.elseIf((0, x._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(l, null);
        return;
      case "array":
        n.elseIf((0, x._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, x._)`[${s}]`);
    }
  }
}
function qg({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, x._)`${t} !== undefined`, () => e.assign((0, x._)`${t}[${r}]`, n));
}
function aa(e, t, r, n = wr.Correct) {
  const s = n === wr.Correct ? x.operators.EQ : x.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, x._)`${t} ${s} null`;
    case "array":
      a = (0, x._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, x._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, x._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, x._)`typeof ${t} ${s} ${e}`;
  }
  return n === wr.Correct ? a : (0, x.not)(a);
  function o(l = x.nil) {
    return (0, x.and)((0, x._)`typeof ${t} == "number"`, l, r ? (0, x._)`isFinite(${t})` : x.nil);
  }
}
_e.checkDataType = aa;
function wo(e, t, r, n) {
  if (e.length === 1)
    return aa(e[0], t, r, n);
  let s;
  const a = (0, ou.toHash)(e);
  if (a.array && a.object) {
    const o = (0, x._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, x._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = x.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, x.and)(s, aa(o, t, r, n));
  return s;
}
_e.checkDataTypes = wo;
const Gg = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, x._)`{type: ${e}}` : (0, x._)`{type: ${t}}`
};
function Eo(e) {
  const t = Kg(e);
  (0, Lg.reportError)(t, Gg);
}
_e.reportTypeError = Eo;
function Kg(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, ou.schemaRefOrVal)(e, n, "type");
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
const dr = te, Hg = C;
function Bg(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      Zi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => Zi(e, a, s.default));
}
$s.assignDefaults = Bg;
function Zi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, dr._)`${a}${(0, dr.getProperty)(t)}`;
  if (s) {
    (0, Hg.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, dr._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, dr._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, dr._)`${l} = ${(0, dr.stringify)(r)}`);
}
var ct = {}, ne = {};
Object.defineProperty(ne, "__esModule", { value: !0 });
ne.validateUnion = ne.validateArray = ne.usePattern = ne.callValidateCode = ne.schemaProperties = ne.allSchemaProperties = ne.noPropertyInData = ne.propertyInData = ne.isOwnProperty = ne.hasPropFunc = ne.reportMissingProp = ne.checkMissingProp = ne.checkReportMissingProp = void 0;
const ue = te, bo = C, St = lt, Jg = C;
function Wg(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Po(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ue._)`${t}` }, !0), e.error();
  });
}
ne.checkReportMissingProp = Wg;
function Xg({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((a) => (0, ue.and)(Po(e, t, a, r.ownProperties), (0, ue._)`${s} = ${a}`)));
}
ne.checkMissingProp = Xg;
function Yg(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ne.reportMissingProp = Yg;
function lu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
ne.hasPropFunc = lu;
function So(e, t, r) {
  return (0, ue._)`${lu(e)}.call(${t}, ${r})`;
}
ne.isOwnProperty = So;
function Qg(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${So(e, t, r)}` : s;
}
ne.propertyInData = Qg;
function Po(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(So(e, t, r))) : s;
}
ne.noPropertyInData = Po;
function uu(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ne.allSchemaProperties = uu;
function Zg(e, t) {
  return uu(t).filter((r) => !(0, bo.alwaysValidSchema)(e, t[r]));
}
ne.schemaProperties = Zg;
function xg({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
  const u = d ? (0, ue._)`${e}, ${t}, ${n}${s}` : t, h = [
    [St.default.instancePath, (0, ue.strConcat)(St.default.instancePath, a)],
    [St.default.parentData, o.parentData],
    [St.default.parentDataProperty, o.parentDataProperty],
    [St.default.rootData, St.default.rootData]
  ];
  o.opts.dynamicRef && h.push([St.default.dynamicAnchors, St.default.dynamicAnchors]);
  const E = (0, ue._)`${u}, ${r.object(...h)}`;
  return c !== ue.nil ? (0, ue._)`${l}.call(${c}, ${E})` : (0, ue._)`${l}(${E})`;
}
ne.callValidateCode = xg;
const e0 = (0, ue._)`new RegExp`;
function t0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ue._)`${s.code === "new RegExp" ? e0 : (0, Jg.useFunc)(e, s)}(${r}, ${n})`
  });
}
ne.usePattern = t0;
function r0(e) {
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
        dataPropType: bo.Type.Num
      }, a), t.if((0, ue.not)(a), l);
    });
  }
}
ne.validateArray = r0;
function n0(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, bo.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
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
ne.validateUnion = n0;
Object.defineProperty(ct, "__esModule", { value: !0 });
ct.validateKeywordUsage = ct.validSchemaType = ct.funcKeywordCode = ct.macroKeywordCode = void 0;
const Te = te, rr = lt, s0 = ne, a0 = hn;
function o0(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = du(r, n, l);
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
ct.macroKeywordCode = o0;
function i0(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  l0(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = du(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      g(), t.modifying && xi(e), y(() => e.error());
    else {
      const m = t.async ? _() : v();
      t.modifying && xi(e), y(() => c0(e, m));
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
    const w = c.opts.passContext ? rr.default.this : rr.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, Te._)`${m}${(0, s0.callValidateCode)(e, u, w, N)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, Te.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
ct.funcKeywordCode = i0;
function xi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Te._)`${n.parentData}[${n.parentDataProperty}]`));
}
function c0(e, t) {
  const { gen: r } = e;
  r.if((0, Te._)`Array.isArray(${t})`, () => {
    r.assign(rr.default.vErrors, (0, Te._)`${rr.default.vErrors} === null ? ${t} : ${rr.default.vErrors}.concat(${t})`).assign(rr.default.errors, (0, Te._)`${rr.default.vErrors}.length`), (0, a0.extendErrors)(e);
  }, () => e.error());
}
function l0({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function du(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Te.stringify)(r) });
}
function u0(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
ct.validSchemaType = u0;
function d0({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
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
ct.validateKeywordUsage = d0;
var Ct = {};
Object.defineProperty(Ct, "__esModule", { value: !0 });
Ct.extendSubschemaMode = Ct.extendSubschemaData = Ct.getSubschema = void 0;
const at = te, fu = C;
function f0(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const l = e.schema[t];
    return r === void 0 ? {
      schema: l,
      schemaPath: (0, at._)`${e.schemaPath}${(0, at.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: l[r],
      schemaPath: (0, at._)`${e.schemaPath}${(0, at.getProperty)(t)}${(0, at.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, fu.escapeFragment)(r)}`
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
Ct.getSubschema = f0;
function h0(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, at._)`${t.data}${(0, at.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, at.str)`${d}${(0, fu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, at._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof at.Name ? s : l.let("data", s, !0);
    c(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function c(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Ct.extendSubschemaData = h0;
function m0(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Ct.extendSubschemaMode = m0;
var Se = {}, hu = { exports: {} }, jt = hu.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  zn(t, n, s, e, "", e);
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
function zn(e, t, r, n, s, a, o, l, c, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, l, c, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in jt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            zn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in jt.propsKeywords) {
        if (h && typeof h == "object")
          for (var _ in h)
            zn(e, t, r, h[_], s + "/" + u + "/" + p0(_), a, s, u, n, _);
      } else (u in jt.keywords || e.allKeys && !(u in jt.skipKeywords)) && zn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function p0(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var $0 = hu.exports;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
const y0 = C, g0 = ls, _0 = $0, v0 = /* @__PURE__ */ new Set([
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
function w0(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !oa(e) : t ? mu(e) <= t : !1;
}
Se.inlineRef = w0;
const E0 = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function oa(e) {
  for (const t in e) {
    if (E0.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(oa) || typeof r == "object" && oa(r))
      return !0;
  }
  return !1;
}
function mu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !v0.has(r) && (typeof e[r] == "object" && (0, y0.eachItem)(e[r], (n) => t += mu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function pu(e, t = "", r) {
  r !== !1 && (t = Er(t));
  const n = e.parse(t);
  return $u(e, n);
}
Se.getFullPath = pu;
function $u(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Se._getFullPath = $u;
const b0 = /#\/?$/;
function Er(e) {
  return e ? e.replace(b0, "") : "";
}
Se.normalizeId = Er;
function S0(e, t, r) {
  return r = Er(r), e.resolve(t, r);
}
Se.resolveUrl = S0;
const P0 = /^[a-z_][-a-z0-9._]*$/i;
function N0(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = Er(e[r] || t), a = { "": s }, o = pu(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return _0(e, { allKeys: !0 }, (h, E, _, v) => {
    if (v === void 0)
      return;
    const g = o + E;
    let y = a[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[E] = y;
    function m(N) {
      const R = this.opts.uriResolver.resolve;
      if (N = Er(y ? R(y, N) : N), c.has(N))
        throw u(N);
      c.add(N);
      let O = this.refs[N];
      return typeof O == "string" && (O = this.refs[O]), typeof O == "object" ? d(h, O.schema, N) : N !== Er(g) && (N[0] === "#" ? (d(h, l[N], N), l[N] = h) : this.refs[N] = g), N;
    }
    function w(N) {
      if (typeof N == "string") {
        if (!P0.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, E, _) {
    if (E !== void 0 && !g0(h, E))
      throw u(_);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Se.getSchemaRefs = N0;
Object.defineProperty(xe, "__esModule", { value: !0 });
xe.getData = xe.KeywordCxt = xe.validateFunctionCode = void 0;
const yu = Pr, ec = _e, No = pt, xn = _e, R0 = $s, tn = ct, Ds = Ct, q = te, J = lt, O0 = Se, $t = C, Kr = hn;
function I0(e) {
  if (vu(e) && (wu(e), _u(e))) {
    k0(e);
    return;
  }
  gu(e, () => (0, yu.topBoolOrEmptySchema)(e));
}
xe.validateFunctionCode = I0;
function gu({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${J.default.data}, ${J.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${tc(r, s)}`), T0(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${J.default.data}, ${j0(s)}`, n.$async, () => e.code(tc(r, s)).code(a));
}
function j0(e) {
  return (0, q._)`{${J.default.instancePath}="", ${J.default.parentData}, ${J.default.parentDataProperty}, ${J.default.rootData}=${J.default.data}${e.dynamicRef ? (0, q._)`, ${J.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function T0(e, t) {
  e.if(J.default.valCxt, () => {
    e.var(J.default.instancePath, (0, q._)`${J.default.valCxt}.${J.default.instancePath}`), e.var(J.default.parentData, (0, q._)`${J.default.valCxt}.${J.default.parentData}`), e.var(J.default.parentDataProperty, (0, q._)`${J.default.valCxt}.${J.default.parentDataProperty}`), e.var(J.default.rootData, (0, q._)`${J.default.valCxt}.${J.default.rootData}`), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, q._)`${J.default.valCxt}.${J.default.dynamicAnchors}`);
  }, () => {
    e.var(J.default.instancePath, (0, q._)`""`), e.var(J.default.parentData, (0, q._)`undefined`), e.var(J.default.parentDataProperty, (0, q._)`undefined`), e.var(J.default.rootData, J.default.data), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function k0(e) {
  const { schema: t, opts: r, gen: n } = e;
  gu(e, () => {
    r.$comment && t.$comment && bu(e), L0(e), n.let(J.default.vErrors, null), n.let(J.default.errors, 0), r.unevaluated && A0(e), Eu(e), z0(e);
  });
}
function A0(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function tc(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function C0(e, t) {
  if (vu(e) && (wu(e), _u(e))) {
    D0(e, t);
    return;
  }
  (0, yu.boolOrEmptySchema)(e, t);
}
function _u({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function vu(e) {
  return typeof e.schema != "boolean";
}
function D0(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && bu(e), V0(e), F0(e);
  const a = n.const("_errs", J.default.errors);
  Eu(e, a), n.var(t, (0, q._)`${a} === ${J.default.errors}`);
}
function wu(e) {
  (0, $t.checkUnknownRules)(e), M0(e);
}
function Eu(e, t) {
  if (e.opts.jtd)
    return rc(e, [], !1, t);
  const r = (0, ec.getSchemaTypes)(e.schema), n = (0, ec.coerceAndCheckDataType)(e, r);
  rc(e, r, !n, t);
}
function M0(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, $t.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function L0(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, $t.checkStrictMode)(e, "default is ignored in the schema root");
}
function V0(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, O0.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function F0(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function bu({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${J.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${J.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function z0(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${J.default.errors} === 0`, () => t.return(J.default.data), () => t.throw((0, q._)`new ${s}(${J.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, J.default.vErrors), a.unevaluated && U0(e), t.return((0, q._)`${J.default.errors} === 0`));
}
function U0({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function rc(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: c, self: d } = e, { RULES: u } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, $t.schemaHasRulesButRef)(a, u))) {
    s.block(() => Nu(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || q0(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, No.shouldUseGroup)(a, E) && (E.type ? (s.if((0, xn.checkDataType)(E.type, o, c.strictNumbers)), nc(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, xn.reportTypeError)(e)), s.endIf()) : nc(e, E), l || s.if((0, q._)`${J.default.errors} === ${n || 0}`));
  }
}
function nc(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, R0.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, No.shouldUseRule)(n, a) && Nu(e, a.keyword, a.definition, t.type);
  });
}
function q0(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (G0(e, t), e.opts.allowUnionTypes || K0(e, t), H0(e, e.dataTypes));
}
function G0(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Su(e.dataTypes, r) || Ro(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), J0(e, t);
  }
}
function K0(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Ro(e, "use allowUnionTypes to allow union type keyword");
}
function H0(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, No.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => B0(t, o)) && Ro(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function B0(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Su(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function J0(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Su(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Ro(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, $t.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Pu {
  constructor(t, r, n) {
    if ((0, tn.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, $t.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Ru(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, tn.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", J.default.errors));
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
    (t ? Kr.reportExtraError : Kr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Kr.reportError)(this, this.def.$dataError || Kr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Kr.resetErrorsCount)(this.gen, this.errsCount);
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
        return (0, q._)`${(0, xn.checkDataTypes)(c, r, a.opts.strictNumbers, xn.DataType.Wrong)}`;
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
    const n = (0, Ds.getSubschema)(this.it, t);
    (0, Ds.extendSubschemaData)(n, this.it, t), (0, Ds.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return C0(s, r), s;
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
xe.KeywordCxt = Pu;
function Nu(e, t, r, n) {
  const s = new Pu(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, tn.funcKeywordCode)(s, r) : "macro" in r ? (0, tn.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, tn.funcKeywordCode)(s, r);
}
const W0 = /^\/(?:[^~]|~0|~1)*$/, X0 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Ru(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return J.default.rootData;
  if (e[0] === "/") {
    if (!W0.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = J.default.rootData;
  } else {
    const d = X0.exec(e);
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
    d && (a = (0, q._)`${a}${(0, q.getProperty)((0, $t.unescapeJsonPointer)(d))}`, o = (0, q._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
xe.getData = Ru;
var mn = {};
Object.defineProperty(mn, "__esModule", { value: !0 });
class Y0 extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
mn.default = Y0;
var kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
const Ms = Se;
class Q0 extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ms.resolveUrl)(t, r, n), this.missingSchema = (0, Ms.normalizeId)((0, Ms.getFullPath)(t, this.missingRef));
  }
}
kr.default = Q0;
var Me = {};
Object.defineProperty(Me, "__esModule", { value: !0 });
Me.resolveSchema = Me.getCompilingSchema = Me.resolveRef = Me.compileSchema = Me.SchemaEnv = void 0;
const Be = te, Z0 = mn, Qt = lt, Ye = Se, sc = C, x0 = xe;
class ys {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Ye.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Me.SchemaEnv = ys;
function Oo(e) {
  const t = Ou.call(this, e);
  if (t)
    return t;
  const r = (0, Ye.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Be.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: Z0.default,
    code: (0, Be._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Qt.default.data,
    parentData: Qt.default.parentData,
    parentDataProperty: Qt.default.parentDataProperty,
    dataNames: [Qt.default.data],
    dataPathArr: [Be.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Be.stringify)(e.schema) } : { ref: e.schema }),
    validateName: c,
    ValidationError: l,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Be.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Be._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, x0.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Qt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const _ = new Function(`${Qt.default.self}`, `${Qt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(c, { ref: _ }), _.errors = null, _.schema = e.schema, _.schemaEnv = e, e.$async && (_.$async = !0), this.opts.code.source === !0 && (_.source = { validateName: c, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: v, items: g } = d;
      _.evaluated = {
        props: v instanceof Be.Name ? void 0 : v,
        items: g instanceof Be.Name ? void 0 : g,
        dynamicProps: v instanceof Be.Name,
        dynamicItems: g instanceof Be.Name
      }, _.source && (_.source.evaluated = (0, Be.stringify)(_.evaluated));
    }
    return e.validate = _, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Me.compileSchema = Oo;
function e_(e, t, r) {
  var n;
  r = (0, Ye.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = n_.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new ys({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = t_.call(this, a);
}
Me.resolveRef = e_;
function t_(e) {
  return (0, Ye.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Oo.call(this, e);
}
function Ou(e) {
  for (const t of this._compilations)
    if (r_(t, e))
      return t;
}
Me.getCompilingSchema = Ou;
function r_(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function n_(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || gs.call(this, e, t);
}
function gs(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, Ye._getFullPath)(this.opts.uriResolver, r);
  let s = (0, Ye.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ls.call(this, r, e);
  const a = (0, Ye.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = gs.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : Ls.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Oo.call(this, o), a === (0, Ye.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, Ye.resolveUrl)(this.opts.uriResolver, s, d)), new ys({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Ls.call(this, r, o);
  }
}
Me.resolveSchema = gs;
const s_ = /* @__PURE__ */ new Set([
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
    const c = r[(0, sc.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !s_.has(l) && d && (t = (0, Ye.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, sc.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Ye.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = gs.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new ys({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const a_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", o_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", i_ = "object", c_ = [
  "$data"
], l_ = {
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
}, u_ = !1, d_ = {
  $id: a_,
  description: o_,
  type: i_,
  required: c_,
  properties: l_,
  additionalProperties: u_
};
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const Iu = Vl;
Iu.code = 'require("ajv/dist/runtime/uri").default';
Io.default = Iu;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = xe;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = te;
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
  const n = mn, s = kr, a = ir, o = Me, l = te, c = Se, d = _e, u = C, h = d_, E = Io, _ = (P, p) => new RegExp(P, p);
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
    var p, S, $, i, f, b, I, T, F, V, se, Le, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht, Bt, Jt, Wt;
    const Ke = P.strict, Xt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Mr = Xt === !0 || Xt === void 0 ? 1 : Xt || 0, Lr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ns = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = P.strictSchema) !== null && f !== void 0 ? f : Ke) !== null && b !== void 0 ? b : !0,
      strictNumbers: (T = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ke) !== null && T !== void 0 ? T : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ke) !== null && V !== void 0 ? V : "log",
      strictTuples: (Le = (se = P.strictTuples) !== null && se !== void 0 ? se : Ke) !== null && Le !== void 0 ? Le : "log",
      strictRequired: (Lt = (Mt = P.strictRequired) !== null && Mt !== void 0 ? Mt : Ke) !== null && Lt !== void 0 ? Lt : !1,
      code: P.code ? { ...P.code, optimize: Mr, regExp: Lr } : { optimize: Mr, regExp: Lr },
      loopRequired: (Vt = P.loopRequired) !== null && Vt !== void 0 ? Vt : w,
      loopEnum: (Ft = P.loopEnum) !== null && Ft !== void 0 ? Ft : w,
      meta: (zt = P.meta) !== null && zt !== void 0 ? zt : !0,
      messages: (Ut = P.messages) !== null && Ut !== void 0 ? Ut : !0,
      inlineRefs: (qt = P.inlineRefs) !== null && qt !== void 0 ? qt : !0,
      schemaId: (Gt = P.schemaId) !== null && Gt !== void 0 ? Gt : "$id",
      addUsedSchema: (Kt = P.addUsedSchema) !== null && Kt !== void 0 ? Kt : !0,
      validateSchema: (Ht = P.validateSchema) !== null && Ht !== void 0 ? Ht : !0,
      validateFormats: (Bt = P.validateFormats) !== null && Bt !== void 0 ? Bt : !0,
      unicodeRegExp: (Jt = P.unicodeRegExp) !== null && Jt !== void 0 ? Jt : !0,
      int32range: (Wt = P.int32range) !== null && Wt !== void 0 ? Wt : !0,
      uriResolver: Ns
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = H(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), O.call(this, y, p, "NOT SUPPORTED"), O.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ye.call(this), p.formats && de.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && me.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
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
      async function i(V, se) {
        await f.call(this, V.$schema);
        const Le = this._addSchema(V, se);
        return Le.validate || b.call(this, Le);
      }
      async function f(V) {
        V && !this.getSchema(V) && await i.call(this, { $ref: V }, !0);
      }
      async function b(V) {
        try {
          return this._compileSchemaEnv(V);
        } catch (se) {
          if (!(se instanceof s.default))
            throw se;
          return I.call(this, se), await T.call(this, se.missingSchema), b.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: se }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${se} cannot be resolved`);
      }
      async function T(V) {
        const se = await F.call(this, V);
        this.refs[V] || await f.call(this, se.$schema), this.refs[V] || this.addSchema(se, V, S);
      }
      async function F(V) {
        const se = this._loading[V];
        if (se)
          return se;
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
  function Y() {
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
})(Ql);
var jo = {}, To = {}, ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const f_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ko.default = f_;
var cr = {};
Object.defineProperty(cr, "__esModule", { value: !0 });
cr.callRef = cr.getValidate = void 0;
const h_ = kr, ac = ne, De = te, fr = lt, oc = Me, bn = C, m_ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = oc.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new h_.default(n.opts.uriResolver, s, r);
    if (u instanceof oc.SchemaEnv)
      return E(u);
    return _(u);
    function h() {
      if (a === d)
        return Un(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return Un(e, (0, De._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = ju(e, v);
      Un(e, g, v, v.$async);
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
function ju(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, De._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
cr.getValidate = ju;
function Un(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? fr.default.this : De.nil;
  n ? u() : h();
  function u() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, De._)`await ${(0, ac.callValidateCode)(e, t, d)}`), _(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, De._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), E(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, ac.callValidateCode)(e, t, d), () => _(t), () => E(t));
  }
  function E(v) {
    const g = (0, De._)`${v}.errors`;
    s.assign(fr.default.vErrors, (0, De._)`${fr.default.vErrors} === null ? ${g} : ${fr.default.vErrors}.concat(${g})`), s.assign(fr.default.errors, (0, De._)`${fr.default.vErrors}.length`);
  }
  function _(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = bn.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, De._)`${v}.evaluated.props`);
        a.props = bn.mergeEvaluated.props(s, m, a.props, De.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = bn.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, De._)`${v}.evaluated.items`);
        a.items = bn.mergeEvaluated.items(s, m, a.items, De.Name);
      }
  }
}
cr.callRef = Un;
cr.default = m_;
Object.defineProperty(To, "__esModule", { value: !0 });
const p_ = ko, $_ = cr, y_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  p_.default,
  $_.default
];
To.default = y_;
var Ao = {}, Co = {};
Object.defineProperty(Co, "__esModule", { value: !0 });
const es = te, Pt = es.operators, ts = {
  maximum: { okStr: "<=", ok: Pt.LTE, fail: Pt.GT },
  minimum: { okStr: ">=", ok: Pt.GTE, fail: Pt.LT },
  exclusiveMaximum: { okStr: "<", ok: Pt.LT, fail: Pt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Pt.GT, fail: Pt.LTE }
}, g_ = {
  message: ({ keyword: e, schemaCode: t }) => (0, es.str)`must be ${ts[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, es._)`{comparison: ${ts[e].okStr}, limit: ${t}}`
}, __ = {
  keyword: Object.keys(ts),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: g_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, es._)`${r} ${ts[t].fail} ${n} || isNaN(${r})`);
  }
};
Co.default = __;
var Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
const rn = te, v_ = {
  message: ({ schemaCode: e }) => (0, rn.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, rn._)`{multipleOf: ${e}}`
}, w_ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: v_,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, rn._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, rn._)`${o} !== parseInt(${o})`;
    e.fail$data((0, rn._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Do.default = w_;
var Mo = {}, Lo = {};
Object.defineProperty(Lo, "__esModule", { value: !0 });
function Tu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Lo.default = Tu;
Tu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Mo, "__esModule", { value: !0 });
const nr = te, E_ = C, b_ = Lo, S_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, nr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, nr._)`{limit: ${e}}`
}, P_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: S_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? nr.operators.GT : nr.operators.LT, o = s.opts.unicode === !1 ? (0, nr._)`${r}.length` : (0, nr._)`${(0, E_.useFunc)(e.gen, b_.default)}(${r})`;
    e.fail$data((0, nr._)`${o} ${a} ${n}`);
  }
};
Mo.default = P_;
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const N_ = ne, rs = te, R_ = {
  message: ({ schemaCode: e }) => (0, rs.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, rs._)`{pattern: ${e}}`
}, O_ = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: R_,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, rs._)`(new RegExp(${s}, ${o}))` : (0, N_.usePattern)(e, n);
    e.fail$data((0, rs._)`!${l}.test(${t})`);
  }
};
Vo.default = O_;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const nn = te, I_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, nn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, nn._)`{limit: ${e}}`
}, j_ = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: I_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? nn.operators.GT : nn.operators.LT;
    e.fail$data((0, nn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Fo.default = j_;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const Hr = ne, sn = te, T_ = C, k_ = {
  message: ({ params: { missingProperty: e } }) => (0, sn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, sn._)`{missingProperty: ${e}}`
}, A_ = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: k_,
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
          (0, T_.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (c || a)
        e.block$data(sn.nil, h);
      else
        for (const _ of r)
          (0, Hr.checkReportMissingProp)(e, _);
    }
    function u() {
      const _ = t.let("missing");
      if (c || a) {
        const v = t.let("valid", !0);
        e.block$data(v, () => E(_, v)), e.ok(v);
      } else
        t.if((0, Hr.checkMissingProp)(e, r, _)), (0, Hr.reportMissingProp)(e, _), t.else();
    }
    function h() {
      t.forOf("prop", n, (_) => {
        e.setParams({ missingProperty: _ }), t.if((0, Hr.noPropertyInData)(t, s, _, l.ownProperties), () => e.error());
      });
    }
    function E(_, v) {
      e.setParams({ missingProperty: _ }), t.forOf(_, n, () => {
        t.assign(v, (0, Hr.propertyInData)(t, s, _, l.ownProperties)), t.if((0, sn.not)(v), () => {
          e.error(), t.break();
        });
      }, sn.nil);
    }
  }
};
zo.default = A_;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const an = te, C_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, an.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, an._)`{limit: ${e}}`
}, D_ = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: C_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? an.operators.GT : an.operators.LT;
    e.fail$data((0, an._)`${r}.length ${s} ${n}`);
  }
};
Uo.default = D_;
var qo = {}, pn = {};
Object.defineProperty(pn, "__esModule", { value: !0 });
const ku = ls;
ku.code = 'require("ajv/dist/runtime/equal").default';
pn.default = ku;
Object.defineProperty(qo, "__esModule", { value: !0 });
const Vs = _e, Ee = te, M_ = C, L_ = pn, V_ = {
  message: ({ params: { i: e, j: t } }) => (0, Ee.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Ee._)`{i: ${e}, j: ${t}}`
}, F_ = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: V_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: l } = e;
    if (!n && !s)
      return;
    const c = t.let("valid"), d = a.items ? (0, Vs.getSchemaTypes)(a.items) : [];
    e.block$data(c, u, (0, Ee._)`${o} === false`), e.ok(c);
    function u() {
      const v = t.let("i", (0, Ee._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(c, !0), t.if((0, Ee._)`${v} > 1`, () => (h() ? E : _)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function E(v, g) {
      const y = t.name("item"), m = (0, Vs.checkDataTypes)(d, y, l.opts.strictNumbers, Vs.DataType.Wrong), w = t.const("indices", (0, Ee._)`{}`);
      t.for((0, Ee._)`;${v}--;`, () => {
        t.let(y, (0, Ee._)`${r}[${v}]`), t.if(m, (0, Ee._)`continue`), d.length > 1 && t.if((0, Ee._)`typeof ${y} == "string"`, (0, Ee._)`${y} += "_"`), t.if((0, Ee._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(g, (0, Ee._)`${w}[${y}]`), e.error(), t.assign(c, !1).break();
        }).code((0, Ee._)`${w}[${y}] = ${v}`);
      });
    }
    function _(v, g) {
      const y = (0, M_.useFunc)(t, L_.default), m = t.name("outer");
      t.label(m).for((0, Ee._)`;${v}--;`, () => t.for((0, Ee._)`${g} = ${v}; ${g}--;`, () => t.if((0, Ee._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
qo.default = F_;
var Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const ia = te, z_ = C, U_ = pn, q_ = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ia._)`{allowedValue: ${e}}`
}, G_ = {
  keyword: "const",
  $data: !0,
  error: q_,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, ia._)`!${(0, z_.useFunc)(t, U_.default)}(${r}, ${s})`) : e.fail((0, ia._)`${a} !== ${r}`);
  }
};
Go.default = G_;
var Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const Xr = te, K_ = C, H_ = pn, B_ = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Xr._)`{allowedValues: ${e}}`
}, J_ = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: B_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, K_.useFunc)(t, H_.default));
    let u;
    if (l || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const _ = t.const("vSchema", a);
      u = (0, Xr.or)(...s.map((v, g) => E(_, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (_) => t.if((0, Xr._)`${d()}(${r}, ${_})`, () => t.assign(u, !0).break()));
    }
    function E(_, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, Xr._)`${d()}(${r}, ${_}[${v}])` : (0, Xr._)`${r} === ${g}`;
    }
  }
};
Ko.default = J_;
Object.defineProperty(Ao, "__esModule", { value: !0 });
const W_ = Co, X_ = Do, Y_ = Mo, Q_ = Vo, Z_ = Fo, x_ = zo, ev = Uo, tv = qo, rv = Go, nv = Ko, sv = [
  // number
  W_.default,
  X_.default,
  // string
  Y_.default,
  Q_.default,
  // object
  Z_.default,
  x_.default,
  // array
  ev.default,
  tv.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  rv.default,
  nv.default
];
Ao.default = sv;
var Ho = {}, Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 });
Ar.validateAdditionalItems = void 0;
const sr = te, ca = C, av = {
  message: ({ params: { len: e } }) => (0, sr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, sr._)`{limit: ${e}}`
}, ov = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: av,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, ca.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Au(e, n);
  }
};
function Au(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const l = r.const("len", (0, sr._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, sr._)`${l} <= ${t.length}`);
  else if (typeof n == "object" && !(0, ca.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, sr._)`${l} <= ${t.length}`);
    r.if((0, sr.not)(d), () => c(d)), e.ok(d);
  }
  function c(d) {
    r.forRange("i", t.length, l, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: ca.Type.Num }, d), o.allErrors || r.if((0, sr.not)(d), () => r.break());
    });
  }
}
Ar.validateAdditionalItems = Au;
Ar.default = ov;
var Bo = {}, Cr = {};
Object.defineProperty(Cr, "__esModule", { value: !0 });
Cr.validateTuple = void 0;
const ic = te, qn = C, iv = ne, cv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Cu(e, "additionalItems", t);
    r.items = !0, !(0, qn.alwaysValidSchema)(r, t) && e.ok((0, iv.validateArray)(e));
  }
};
function Cu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = qn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, ic._)`${a}.length`);
  r.forEach((h, E) => {
    (0, qn.alwaysValidSchema)(l, h) || (n.if((0, ic._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, c)), e.ok(c));
  });
  function u(h) {
    const { opts: E, errSchemaPath: _ } = l, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (E.strictTuples && !g) {
      const y = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${_}"`;
      (0, qn.checkStrictMode)(l, y, E.strictTuples);
    }
  }
}
Cr.validateTuple = Cu;
Cr.default = cv;
Object.defineProperty(Bo, "__esModule", { value: !0 });
const lv = Cr, uv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, lv.validateTuple)(e, "items")
};
Bo.default = uv;
var Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const cc = te, dv = C, fv = ne, hv = Ar, mv = {
  message: ({ params: { len: e } }) => (0, cc.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, cc._)`{limit: ${e}}`
}, pv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: mv,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, dv.alwaysValidSchema)(n, t) && (s ? (0, hv.validateAdditionalItems)(e, s) : e.ok((0, fv.validateArray)(e)));
  }
};
Jo.default = pv;
var Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
const qe = te, Sn = C, $v = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe.str)`must contain at least ${e} valid item(s)` : (0, qe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe._)`{minContains: ${e}}` : (0, qe._)`{minContains: ${e}, maxContains: ${t}}`
}, yv = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: $v,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, l;
    const { minContains: c, maxContains: d } = n;
    a.opts.next ? (o = c === void 0 ? 1 : c, l = d) : o = 1;
    const u = t.const("len", (0, qe._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, Sn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, Sn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Sn.alwaysValidSchema)(a, r)) {
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
          dataPropType: Sn.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function v(g) {
      t.code((0, qe._)`${g}++`), l === void 0 ? t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, qe._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Wo.default = yv;
var Du = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = te, r = C, n = ne;
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
})(Du);
var Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const Mu = te, gv = C, _v = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Mu._)`{propertyName: ${e.propertyName}}`
}, vv = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: _v,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, gv.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Mu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Xo.default = vv;
var _s = {};
Object.defineProperty(_s, "__esModule", { value: !0 });
const Pn = ne, We = te, wv = lt, Nn = C, Ev = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, We._)`{additionalProperty: ${e.additionalProperty}}`
}, bv = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: Ev,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, Nn.alwaysValidSchema)(o, r))
      return;
    const d = (0, Pn.allSchemaProperties)(n.properties), u = (0, Pn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, We._)`${a} === ${wv.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(E(y), () => v(y));
      });
    }
    function E(y) {
      let m;
      if (d.length > 8) {
        const w = (0, Nn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, Pn.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, We.or)(...d.map((w) => (0, We._)`${y} === ${w}`)) : m = We.nil;
      return u.length && (m = (0, We.or)(m, ...u.map((w) => (0, We._)`${(0, Pn.usePattern)(e, w)}.test(${y})`))), (0, We.not)(m);
    }
    function _(y) {
      t.code((0, We._)`delete ${s}[${y}]`);
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
      if (typeof r == "object" && !(0, Nn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        c.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, We.not)(m), () => {
          e.reset(), _(y);
        })) : (g(y, m), l || t.if((0, We.not)(m), () => t.break()));
      }
    }
    function g(y, m, w) {
      const N = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: Nn.Type.Str
      };
      w === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
_s.default = bv;
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const Sv = xe, lc = ne, Fs = C, uc = _s, Pv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && uc.default.code(new Sv.KeywordCxt(a, uc.default, "additionalProperties"));
    const o = (0, lc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Fs.mergeEvaluated.props(t, (0, Fs.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Fs.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const c = t.name("valid");
    for (const h of l)
      d(h) ? u(h) : (t.if((0, lc.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
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
Yo.default = Pv;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const dc = ne, Rn = te, fc = C, hc = C, Nv = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, dc.allSchemaProperties)(r), c = l.filter((g) => (0, fc.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof Rn.Name) && (a.props = (0, hc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const g of l)
        d && _(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, fc.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, (y) => {
        t.if((0, Rn._)`${(0, dc.usePattern)(e, g)}.test(${y})`, () => {
          const m = c.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: hc.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, Rn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, Rn.not)(u), () => t.break());
        });
      });
    }
  }
};
Qo.default = Nv;
var Zo = {};
Object.defineProperty(Zo, "__esModule", { value: !0 });
const Rv = C, Ov = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Rv.alwaysValidSchema)(n, r)) {
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
Zo.default = Ov;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const Iv = ne, jv = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Iv.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
xo.default = jv;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const Gn = te, Tv = C, kv = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Gn._)`{passingSchemas: ${e.passing}}`
}, Av = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: kv,
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
        (0, Tv.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, c), h > 0 && t.if((0, Gn._)`${c} && ${o}`).assign(o, !1).assign(l, (0, Gn._)`[${l}, ${h}]`).else(), t.if(c, () => {
          t.assign(o, !0), t.assign(l, h), E && e.mergeEvaluated(E, Gn.Name);
        });
      });
    }
  }
};
ei.default = Av;
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
const Cv = C, Dv = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Cv.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
ti.default = Dv;
var ri = {};
Object.defineProperty(ri, "__esModule", { value: !0 });
const ns = te, Lu = C, Mv = {
  message: ({ params: e }) => (0, ns.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, ns._)`{failingKeyword: ${e.ifClause}}`
}, Lv = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Mv,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Lu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = mc(n, "then"), a = mc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), l = t.name("_valid");
    if (c(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(l, d("then", u), d("else", u));
    } else s ? t.if(l, d("then")) : t.if((0, ns.not)(l), d("else"));
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
        t.assign(o, l), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, ns._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function mc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Lu.alwaysValidSchema)(e, r);
}
ri.default = Lv;
var ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 });
const Vv = C, Fv = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Vv.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
ni.default = Fv;
Object.defineProperty(Ho, "__esModule", { value: !0 });
const zv = Ar, Uv = Bo, qv = Cr, Gv = Jo, Kv = Wo, Hv = Du, Bv = Xo, Jv = _s, Wv = Yo, Xv = Qo, Yv = Zo, Qv = xo, Zv = ei, xv = ti, ew = ri, tw = ni;
function rw(e = !1) {
  const t = [
    // any
    Yv.default,
    Qv.default,
    Zv.default,
    xv.default,
    ew.default,
    tw.default,
    // object
    Bv.default,
    Jv.default,
    Hv.default,
    Wv.default,
    Xv.default
  ];
  return e ? t.push(Uv.default, Gv.default) : t.push(zv.default, qv.default), t.push(Kv.default), t;
}
Ho.default = rw;
var si = {}, ai = {};
Object.defineProperty(ai, "__esModule", { value: !0 });
const $e = te, nw = {
  message: ({ schemaCode: e }) => (0, $e.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, $e._)`{format: ${e}}`
}, sw = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: nw,
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
        const G = O instanceof RegExp ? (0, $e.regexpCode)(O) : c.code.formats ? (0, $e._)`${c.code.formats}${(0, $e.getProperty)(a)}` : void 0, Y = r.scopeValue("formats", { key: a, ref: O, code: G });
        return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, $e._)`${Y}.validate`] : ["string", O, Y];
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
ai.default = sw;
Object.defineProperty(si, "__esModule", { value: !0 });
const aw = ai, ow = [aw.default];
si.default = ow;
var Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
Nr.contentVocabulary = Nr.metadataVocabulary = void 0;
Nr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
Nr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(jo, "__esModule", { value: !0 });
const iw = To, cw = Ao, lw = Ho, uw = si, pc = Nr, dw = [
  iw.default,
  cw.default,
  (0, lw.default)(),
  uw.default,
  pc.metadataVocabulary,
  pc.contentVocabulary
];
jo.default = dw;
var oi = {}, vs = {};
Object.defineProperty(vs, "__esModule", { value: !0 });
vs.DiscrError = void 0;
var $c;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})($c || (vs.DiscrError = $c = {}));
Object.defineProperty(oi, "__esModule", { value: !0 });
const yr = te, la = vs, yc = Me, fw = kr, hw = C, mw = {
  message: ({ params: { discrError: e, tagName: t } }) => e === la.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, yr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, pw = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: mw,
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
    const c = t.let("valid", !1), d = t.const("tag", (0, yr._)`${r}${(0, yr.getProperty)(l)}`);
    t.if((0, yr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: la.DiscrError.Tag, tag: d, tagName: l })), e.ok(c);
    function u() {
      const _ = E();
      t.if(!1);
      for (const v in _)
        t.elseIf((0, yr._)`${d} === ${v}`), t.assign(c, h(_[v]));
      t.else(), e.error(!1, { discrError: la.DiscrError.Mapping, tag: d, tagName: l }), t.endIf();
    }
    function h(_) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: _ }, v);
      return e.mergeEvaluated(g, yr.Name), v;
    }
    function E() {
      var _;
      const v = {}, g = m(s);
      let y = !0;
      for (let R = 0; R < o.length; R++) {
        let O = o[R];
        if (O != null && O.$ref && !(0, hw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const Y = O.$ref;
          if (O = yc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), O instanceof yc.SchemaEnv && (O = O.schema), O === void 0)
            throw new fw.default(a.opts.uriResolver, a.baseId, Y);
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
oi.default = pw;
const $w = "http://json-schema.org/draft-07/schema#", yw = "http://json-schema.org/draft-07/schema#", gw = "Core schema meta-schema", _w = {
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
}, vw = [
  "object",
  "boolean"
], ww = {
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
}, Ew = {
  $schema: $w,
  $id: yw,
  title: gw,
  definitions: _w,
  type: vw,
  properties: ww,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = Ql, n = jo, s = oi, a = Ew, o = ["/properties"], l = "http://json-schema.org/draft-07/schema";
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
  var d = xe;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = te;
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
  var h = mn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var E = kr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
})(ra, ra.exports);
var bw = ra.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = bw, r = te, n = r.operators, s = {
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
})(Yl);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Xl, n = Yl, s = te, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), l = (d, u = { keywords: !0 }) => {
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
})(ta, ta.exports);
var Sw = ta.exports;
const Pw = /* @__PURE__ */ Xc(Sw), Nw = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !Rw(s, a) && n || Object.defineProperty(e, r, a);
}, Rw = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Ow = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, Iw = (e, t) => `/* Wrapped ${e}*/
${t}`, jw = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Tw = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), kw = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = Iw.bind(null, n, t.toString());
  Object.defineProperty(s, "name", Tw);
  const { writable: a, enumerable: o, configurable: l } = jw;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: l });
};
function Aw(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Nw(e, t, s, r);
  return Ow(e, t), kw(e, t, n), e;
}
const gc = (e, t = {}) => {
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
  return Aw(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), l && (clearTimeout(l), l = void 0);
  }, d;
};
var ua = { exports: {} };
const Cw = "2.0.0", Vu = 256, Dw = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Mw = 16, Lw = Vu - 6, Vw = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ws = {
  MAX_LENGTH: Vu,
  MAX_SAFE_COMPONENT_LENGTH: Mw,
  MAX_SAFE_BUILD_LENGTH: Lw,
  MAX_SAFE_INTEGER: Dw,
  RELEASE_TYPES: Vw,
  SEMVER_SPEC_VERSION: Cw,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Fw = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var Es = Fw;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = ws, a = Es;
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
})(ua, ua.exports);
var $n = ua.exports;
const zw = Object.freeze({ loose: !0 }), Uw = Object.freeze({}), qw = (e) => e ? typeof e != "object" ? zw : e : Uw;
var ii = qw;
const _c = /^[0-9]+$/, Fu = (e, t) => {
  const r = _c.test(e), n = _c.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, Gw = (e, t) => Fu(t, e);
var zu = {
  compareIdentifiers: Fu,
  rcompareIdentifiers: Gw
};
const On = Es, { MAX_LENGTH: vc, MAX_SAFE_INTEGER: In } = ws, { safeRe: jn, t: Tn } = $n, Kw = ii, { compareIdentifiers: hr } = zu;
let Hw = class nt {
  constructor(t, r) {
    if (r = Kw(r), t instanceof nt) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > vc)
      throw new TypeError(
        `version is longer than ${vc} characters`
      );
    On("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? jn[Tn.LOOSE] : jn[Tn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > In || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > In || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > In || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < In)
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
    if (On("SemVer.compare", this.version, this.options, t), !(t instanceof nt)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new nt(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof nt || (t = new nt(t, this.options)), hr(this.major, t.major) || hr(this.minor, t.minor) || hr(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof nt || (t = new nt(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (On("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return hr(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof nt || (t = new nt(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (On("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return hr(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? jn[Tn.PRERELEASELOOSE] : jn[Tn.PRERELEASE]);
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
          n === !1 && (a = [r]), hr(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ae = Hw;
const wc = Ae, Bw = (e, t, r = !1) => {
  if (e instanceof wc)
    return e;
  try {
    return new wc(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Dr = Bw;
const Jw = Dr, Ww = (e, t) => {
  const r = Jw(e, t);
  return r ? r.version : null;
};
var Xw = Ww;
const Yw = Dr, Qw = (e, t) => {
  const r = Yw(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Zw = Qw;
const Ec = Ae, xw = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new Ec(
      e instanceof Ec ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var eE = xw;
const bc = Dr, tE = (e, t) => {
  const r = bc(e, null, !0), n = bc(t, null, !0), s = r.compare(n);
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
var rE = tE;
const nE = Ae, sE = (e, t) => new nE(e, t).major;
var aE = sE;
const oE = Ae, iE = (e, t) => new oE(e, t).minor;
var cE = iE;
const lE = Ae, uE = (e, t) => new lE(e, t).patch;
var dE = uE;
const fE = Dr, hE = (e, t) => {
  const r = fE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var mE = hE;
const Sc = Ae, pE = (e, t, r) => new Sc(e, r).compare(new Sc(t, r));
var tt = pE;
const $E = tt, yE = (e, t, r) => $E(t, e, r);
var gE = yE;
const _E = tt, vE = (e, t) => _E(e, t, !0);
var wE = vE;
const Pc = Ae, EE = (e, t, r) => {
  const n = new Pc(e, r), s = new Pc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var ci = EE;
const bE = ci, SE = (e, t) => e.sort((r, n) => bE(r, n, t));
var PE = SE;
const NE = ci, RE = (e, t) => e.sort((r, n) => NE(n, r, t));
var OE = RE;
const IE = tt, jE = (e, t, r) => IE(e, t, r) > 0;
var bs = jE;
const TE = tt, kE = (e, t, r) => TE(e, t, r) < 0;
var li = kE;
const AE = tt, CE = (e, t, r) => AE(e, t, r) === 0;
var Uu = CE;
const DE = tt, ME = (e, t, r) => DE(e, t, r) !== 0;
var qu = ME;
const LE = tt, VE = (e, t, r) => LE(e, t, r) >= 0;
var ui = VE;
const FE = tt, zE = (e, t, r) => FE(e, t, r) <= 0;
var di = zE;
const UE = Uu, qE = qu, GE = bs, KE = ui, HE = li, BE = di, JE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return UE(e, r, n);
    case "!=":
      return qE(e, r, n);
    case ">":
      return GE(e, r, n);
    case ">=":
      return KE(e, r, n);
    case "<":
      return HE(e, r, n);
    case "<=":
      return BE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Gu = JE;
const WE = Ae, XE = Dr, { safeRe: kn, t: An } = $n, YE = (e, t) => {
  if (e instanceof WE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? kn[An.COERCEFULL] : kn[An.COERCE]);
  else {
    const c = t.includePrerelease ? kn[An.COERCERTLFULL] : kn[An.COERCERTL];
    let d;
    for (; (d = c.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), c.lastIndex = d.index + d[1].length + d[2].length;
    c.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", l = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return XE(`${n}.${s}.${a}${o}${l}`, t);
};
var QE = YE;
class ZE {
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
var xE = ZE, zs, Nc;
function rt() {
  if (Nc) return zs;
  Nc = 1;
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
  zs = t;
  const r = xE, n = new r(), s = ii, a = Ss(), o = Es, l = Ae, {
    safeRe: c,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: E
  } = $n, { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: v } = ws, g = (j) => j.value === "<0.0.0-0", y = (j) => j.value === "", m = (j, k) => {
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
  }, G = (j, k) => j.trim().split(/\s+/).map((L) => Y(L, k)).join(" "), Y = (j, k) => {
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
  return zs;
}
var Us, Rc;
function Ss() {
  if (Rc) return Us;
  Rc = 1;
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
  Us = t;
  const r = ii, { safeRe: n, t: s } = $n, a = Gu, o = Es, l = Ae, c = rt();
  return Us;
}
const eb = rt(), tb = (e, t, r) => {
  try {
    t = new eb(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var Ps = tb;
const rb = rt(), nb = (e, t) => new rb(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var sb = nb;
const ab = Ae, ob = rt(), ib = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new ob(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new ab(n, r));
  }), n;
};
var cb = ib;
const lb = Ae, ub = rt(), db = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new ub(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new lb(n, r));
  }), n;
};
var fb = db;
const qs = Ae, hb = rt(), Oc = bs, mb = (e, t) => {
  e = new hb(e, t);
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
          (!a || Oc(l, a)) && (a = l);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || Oc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var pb = mb;
const $b = rt(), yb = (e, t) => {
  try {
    return new $b(e, t).range || "*";
  } catch {
    return null;
  }
};
var gb = yb;
const _b = Ae, Ku = Ss(), { ANY: vb } = Ku, wb = rt(), Eb = Ps, Ic = bs, jc = li, bb = di, Sb = ui, Pb = (e, t, r, n) => {
  e = new _b(e, n), t = new wb(t, n);
  let s, a, o, l, c;
  switch (r) {
    case ">":
      s = Ic, a = bb, o = jc, l = ">", c = ">=";
      break;
    case "<":
      s = jc, a = Sb, o = Ic, l = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Eb(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, E = null;
    if (u.forEach((_) => {
      _.semver === vb && (_ = new Ku(">=0.0.0")), h = h || _, E = E || _, s(_.semver, h.semver, n) ? h = _ : o(_.semver, E.semver, n) && (E = _);
    }), h.operator === l || h.operator === c || (!E.operator || E.operator === l) && a(e, E.semver))
      return !1;
    if (E.operator === c && o(e, E.semver))
      return !1;
  }
  return !0;
};
var fi = Pb;
const Nb = fi, Rb = (e, t, r) => Nb(e, t, ">", r);
var Ob = Rb;
const Ib = fi, jb = (e, t, r) => Ib(e, t, "<", r);
var Tb = jb;
const Tc = rt(), kb = (e, t, r) => (e = new Tc(e, r), t = new Tc(t, r), e.intersects(t, r));
var Ab = kb;
const Cb = Ps, Db = tt;
var Mb = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((u, h) => Db(u, h, r));
  for (const u of o)
    Cb(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const l = [];
  for (const [u, h] of n)
    u === h ? l.push(u) : !h && u === o[0] ? l.push("*") : h ? u === o[0] ? l.push(`<=${h}`) : l.push(`${u} - ${h}`) : l.push(`>=${u}`);
  const c = l.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return c.length < d.length ? c : t;
};
const kc = rt(), hi = Ss(), { ANY: Gs } = hi, Br = Ps, mi = tt, Lb = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new kc(e, r), t = new kc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = Fb(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, Vb = [new hi(">=0.0.0-0")], Ac = [new hi(">=0.0.0")], Fb = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Gs) {
    if (t.length === 1 && t[0].semver === Gs)
      return !0;
    r.includePrerelease ? e = Vb : e = Ac;
  }
  if (t.length === 1 && t[0].semver === Gs) {
    if (r.includePrerelease)
      return !0;
    t = Ac;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const _ of e)
    _.operator === ">" || _.operator === ">=" ? s = Cc(s, _, r) : _.operator === "<" || _.operator === "<=" ? a = Dc(a, _, r) : n.add(_.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = mi(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const _ of n) {
    if (s && !Br(_, String(s), r) || a && !Br(_, String(a), r))
      return null;
    for (const v of t)
      if (!Br(_, String(v), r))
        return !1;
    return !0;
  }
  let l, c, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, E = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const _ of t) {
    if (u = u || _.operator === ">" || _.operator === ">=", d = d || _.operator === "<" || _.operator === "<=", s) {
      if (E && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === E.major && _.semver.minor === E.minor && _.semver.patch === E.patch && (E = !1), _.operator === ">" || _.operator === ">=") {
        if (l = Cc(s, _, r), l === _ && l !== s)
          return !1;
      } else if (s.operator === ">=" && !Br(s.semver, String(_), r))
        return !1;
    }
    if (a) {
      if (h && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === h.major && _.semver.minor === h.minor && _.semver.patch === h.patch && (h = !1), _.operator === "<" || _.operator === "<=") {
        if (c = Dc(a, _, r), c === _ && c !== a)
          return !1;
      } else if (a.operator === "<=" && !Br(a.semver, String(_), r))
        return !1;
    }
    if (!_.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || E || h);
}, Cc = (e, t, r) => {
  if (!e)
    return t;
  const n = mi(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Dc = (e, t, r) => {
  if (!e)
    return t;
  const n = mi(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var zb = Lb;
const Ks = $n, Mc = ws, Ub = Ae, Lc = zu, qb = Dr, Gb = Xw, Kb = Zw, Hb = eE, Bb = rE, Jb = aE, Wb = cE, Xb = dE, Yb = mE, Qb = tt, Zb = gE, xb = wE, e1 = ci, t1 = PE, r1 = OE, n1 = bs, s1 = li, a1 = Uu, o1 = qu, i1 = ui, c1 = di, l1 = Gu, u1 = QE, d1 = Ss(), f1 = rt(), h1 = Ps, m1 = sb, p1 = cb, $1 = fb, y1 = pb, g1 = gb, _1 = fi, v1 = Ob, w1 = Tb, E1 = Ab, b1 = Mb, S1 = zb;
var P1 = {
  parse: qb,
  valid: Gb,
  clean: Kb,
  inc: Hb,
  diff: Bb,
  major: Jb,
  minor: Wb,
  patch: Xb,
  prerelease: Yb,
  compare: Qb,
  rcompare: Zb,
  compareLoose: xb,
  compareBuild: e1,
  sort: t1,
  rsort: r1,
  gt: n1,
  lt: s1,
  eq: a1,
  neq: o1,
  gte: i1,
  lte: c1,
  cmp: l1,
  coerce: u1,
  Comparator: d1,
  Range: f1,
  satisfies: h1,
  toComparators: m1,
  maxSatisfying: p1,
  minSatisfying: $1,
  minVersion: y1,
  validRange: g1,
  outside: _1,
  gtr: v1,
  ltr: w1,
  intersects: E1,
  simplifyRange: b1,
  subset: S1,
  SemVer: Ub,
  re: Ks.re,
  src: Ks.src,
  tokens: Ks.t,
  SEMVER_SPEC_VERSION: Mc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Mc.RELEASE_TYPES,
  compareIdentifiers: Lc.compareIdentifiers,
  rcompareIdentifiers: Lc.rcompareIdentifiers
};
const mr = /* @__PURE__ */ Xc(P1), N1 = Object.prototype.toString, R1 = "[object Uint8Array]", O1 = "[object ArrayBuffer]";
function Hu(e, t, r) {
  return e ? e.constructor === t ? !0 : N1.call(e) === r : !1;
}
function Bu(e) {
  return Hu(e, Uint8Array, R1);
}
function I1(e) {
  return Hu(e, ArrayBuffer, O1);
}
function j1(e) {
  return Bu(e) || I1(e);
}
function T1(e) {
  if (!Bu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function k1(e) {
  if (!j1(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Vc(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    T1(s), r.set(s, n), n += s.length;
  return r;
}
const Cn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Fc(e, t = "utf8") {
  return k1(e), Cn[t] ?? (Cn[t] = new globalThis.TextDecoder(t)), Cn[t].decode(e);
}
function A1(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const C1 = new globalThis.TextEncoder();
function Hs(e) {
  return A1(e), C1.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const D1 = Pw.default, zc = "aes-256-cbc", pr = () => /* @__PURE__ */ Object.create(null), M1 = (e) => e != null, L1 = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Kn = "__internal__", Bs = `${Kn}.migrations.version`;
var Ot, dt, Fe, ft;
class V1 {
  constructor(t = {}) {
    Vr(this, "path");
    Vr(this, "events");
    Fr(this, Ot);
    Fr(this, dt);
    Fr(this, Fe);
    Fr(this, ft, {});
    Vr(this, "_deserialize", (t) => JSON.parse(t));
    Vr(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
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
      r.cwd = cd(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (zr(this, Fe, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new fg.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      D1(o);
      const l = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      zr(this, Ot, o.compile(l));
      for (const [c, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (fe(this, ft)[c] = d.default);
    }
    r.defaults && zr(this, ft, {
      ...fe(this, ft),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), zr(this, dt, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = oe.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(pr(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      Zu.deepEqual(s, a);
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
      throw new TypeError(`Please don't use the ${Kn} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      L1(a, o), fe(this, Fe).accessPropertiesByDotNotation ? yi(n, a, o) : n[a] = o;
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
    return fe(this, Fe).accessPropertiesByDotNotation ? sd(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      M1(fe(this, ft)[r]) && this.set(r, fe(this, ft)[r]);
  }
  delete(t) {
    const { store: r } = this;
    fe(this, Fe).accessPropertiesByDotNotation ? nd(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = pr();
    for (const t of Object.keys(fe(this, ft)))
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
      const t = ee.readFileSync(this.path, fe(this, dt) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(pr(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), pr();
      if (fe(this, Fe).clearInvalidConfig && t.name === "SyntaxError")
        return pr();
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
    if (!fe(this, dt))
      return typeof t == "string" ? t : Fc(t);
    try {
      const r = t.slice(0, 16), n = Ur.pbkdf2Sync(fe(this, dt), r.toString(), 1e4, 32, "sha512"), s = Ur.createDecipheriv(zc, n, r), a = t.slice(17), o = typeof a == "string" ? Hs(a) : a;
      return Fc(Vc([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Qu(o, a) || (n = o, r.call(this, o, a));
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
    ee.mkdirSync(oe.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (fe(this, dt)) {
      const n = Ur.randomBytes(16), s = Ur.pbkdf2Sync(fe(this, dt), n.toString(), 1e4, 32, "sha512"), a = Ur.createCipheriv(zc, s, n);
      r = Vc([n, Hs(":"), a.update(Hs(r)), a.final()]);
    }
    if (ve.env.SNAP)
      ee.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
    else
      try {
        Wc(this.path, r, { mode: fe(this, Fe).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          ee.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), ee.existsSync(this.path) || this._write(pr()), ve.platform === "win32" ? ee.watch(this.path, { persistent: !1 }, gc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : ee.watchFile(this.path, { persistent: !1 }, gc(() => {
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
        const c = t[l];
        c == null || c(this), this._set(Bs, l), s = l, o = { ...this.store };
      } catch (c) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${c}`);
      }
    (this._isVersionInRangeFormat(s) || !mr.eq(s, r)) && this._set(Bs, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === Kn ? !0 : typeof t != "string" ? !1 : fe(this, Fe).accessPropertiesByDotNotation ? !!t.startsWith(`${Kn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return mr.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && mr.satisfies(r, t) ? !1 : mr.satisfies(n, t) : !(mr.lte(t, r) || mr.gt(t, n));
  }
  _get(t, r) {
    return rd(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    yi(n, t, r), this.store = n;
  }
}
Ot = new WeakMap(), dt = new WeakMap(), Fe = new WeakMap(), ft = new WeakMap();
const { app: Hn, ipcMain: da, shell: F1 } = Kc;
let Uc = !1;
const qc = () => {
  if (!da || !Hn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Hn.getPath("userData"),
    appVersion: Hn.getVersion()
  };
  return Uc || (da.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Uc = !0), e;
};
class z1 extends V1 {
  constructor(t) {
    let r, n;
    if (ve.type === "renderer") {
      const s = Kc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else da && Hn && ({ defaultCwd: r, appVersion: n } = qc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = oe.isAbsolute(t.cwd) ? t.cwd : oe.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    qc();
  }
  async openInEditor() {
    const t = await F1.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const Dt = W.dirname(xu(import.meta.url));
process.env.APP_ROOT = W.join(Dt, "..");
const fa = process.env.VITE_DEV_SERVER_URL, sS = W.join(process.env.APP_ROOT, "dist-electron"), Ju = W.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = fa ? W.join(process.env.APP_ROOT, "public") : Ju;
let X, on = null;
const Qe = /* @__PURE__ */ new Map();
let Tt = null;
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
}, Bn = new z1({
  defaults: {
    formData: ss
  },
  name: "app-config"
});
et.handle(
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
et.handle("load-data", async () => {
  try {
    return Bn.get("formData", ss);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), ss;
  }
});
et.handle("select-folder", async () => {
  const e = await Hc.showOpenDialog(X, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
et.handle("select-file", async () => {
  const e = await Hc.showOpenDialog(X, {
    properties: ["openFile"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhum arquivo selecionado"), null;
  const t = e.filePaths[0];
  return console.log("Arquivo selecionado:", t), t;
});
et.handle("clean-db", async () => (console.log("Limpando banco de dados..."), new Promise((e) => {
  setTimeout(() => {
    console.log("Banco de dados limpo com sucesso"), e(!0);
  }, 1e3);
})));
et.handle(
  "print-pdf",
  async (e, t) => {
    try {
      const r = new ha({
        width: 800,
        height: 600,
        show: !0,
        webPreferences: {
          preload: W.join(Dt, "preload.mjs"),
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
et.handle(
  "start-fork",
  async (e, { script: t, args: r = [] } = {}) => {
    const n = W.dirname(W.dirname(Dt));
    t || (t = "./backend/index.js");
    let s;
    if (W.isAbsolute(t))
      s = t;
    else {
      const a = [
        // Prefer IPC-only CJS build
        W.join("backend", "index.js"),
        // Original provided script path fallbacks
        W.join(Dt, t),
        W.join(process.env.APP_ROOT || "", t),
        W.join(W.dirname(Dt), t),
        W.join(n, t),
        W.resolve(t)
      ];
      console.log("Trying paths:", a), s = a.find((o) => {
        try {
          const l = Ge.existsSync(o);
          return console.log(`Path ${o} exists: ${l}`), l;
        } catch {
          return !1;
        }
      }) || a[0];
    }
    console.log("Attempting to fork script at:", s), console.log("Script exists:", Ge.existsSync(s));
    try {
      const a = W.join(n, "Frontend", "backend");
      if (s.startsWith(a)) {
        const l = [
          W.join(n, "back-end", "dist", "index.js"),
          W.join(n, "back-end", "dist", "src", "index.js"),
          W.join(n, "back-end", "src", "index.ts"),
          W.join(n, "back-end", "src", "index.js")
        ].find((c) => Ge.existsSync(c));
        l ? (console.log(
          "Replacing frontend shim script with real backend entry:",
          l
        ), s = l) : console.log(
          "No real backend entry found, will attempt to fork provided script (may fail if AMD-wrapped)"
        );
      }
    } catch {
    }
    try {
      const a = W.dirname(s);
      let o = a, l = !1;
      for (; o && o !== W.dirname(o); ) {
        const u = W.join(o, "package.json");
        if (Ge.existsSync(u))
          try {
            if (JSON.parse(
              Ge.readFileSync(u, "utf8")
            ).name === "backend") {
              l = !0;
              break;
            }
          } catch {
          }
        o = W.dirname(o);
      }
      l || (o = a), console.log("Setting child process cwd to:", o), on = s;
      const c = os(s, r, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: o,
        silent: !1,
        env: { ...process.env }
      }), d = c.pid;
      if (console.log("Child process forked with PID:", d), typeof d == "number")
        Qe.set(d, c), console.log(
          "Child process added to children map. Total children:",
          Qe.size
        );
      else
        return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
      return new Promise((u, h) => {
        const E = setTimeout(() => {
          h(new Error("Timeout waiting for WebSocket port from backend"));
        }, 1e4), _ = (v) => {
          v && v.type === "websocket-port" && typeof v.port == "number" && (clearTimeout(E), c.off("message", _), u({ ok: !0, port: v.port, pid: d }));
        };
        c.on("message", _), c.on("error", (v) => {
          console.error("Child process error:", v), typeof c.pid == "number" && Qe.delete(c.pid), clearTimeout(E), h(v);
        }), c.on("exit", (v, g) => {
          console.log(
            `Child process ${c.pid} exited with code ${v} and signal ${g}`
          ), typeof c.pid == "number" && Qe.delete(c.pid), X && !X.isDestroyed() && X.webContents.send("child-exit", {
            pid: c.pid,
            code: v,
            signal: g
          }), clearTimeout(E), h(new Error(`Child process exited with code ${v}`));
        }), c.on("message", (v) => {
          console.log("Message from child:", v), !(v && typeof v == "object" && "type" in v && v.type === "websocket-port") && X && !X.isDestroyed() && X.webContents.send("child-message", { pid: c.pid, msg: v });
        }), c.stdout && c.stdout.on("data", (v) => {
          console.log("Child stdout:", v.toString()), X && !X.isDestroyed() && X.webContents.send("child-stdout", {
            pid: c.pid,
            data: v.toString()
          });
        }), c.stderr && c.stderr.on("data", (v) => {
          console.error("Child stderr:", v.toString()), X && !X.isDestroyed() && X.webContents.send("child-stderr", {
            pid: c.pid,
            data: v.toString()
          });
        });
      });
    } catch (a) {
      return console.error("Failed to fork child process:", a), { ok: !1, reason: `fork-error: ${a}` };
    }
  }
);
et.handle(
  "start-collector-fork",
  async (e, { args: t = [] } = {}) => {
    const r = W.dirname(W.dirname(Dt)), n = [
      W.join(
        r,
        "back-end",
        "dist",
        "src",
        "collector",
        "runner.js"
      ),
      W.join(r, "back-end", "dist", "collector", "runner.js"),
      W.join(r, "back-end", "src", "collector", "runner.ts")
    ], s = n.find((a) => Ge.existsSync(a)) || n[0];
    if (!Ge.existsSync(s))
      return { ok: !1, reason: "collector-not-found", attempted: n };
    try {
      const a = os(s, t, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: W.dirname(s),
        env: { ...process.env }
      }), o = a.pid;
      return typeof o == "number" && (Qe.set(o, a), a.on("message", (l) => {
        X && !X.isDestroyed() && X.webContents.send("child-message", { pid: o, msg: l });
      }), a.stdout && a.stdout.on("data", (l) => {
        X && !X.isDestroyed() && X.webContents.send("child-stdout", { pid: o, data: l.toString() });
      }), a.stderr && a.stderr.on("data", (l) => {
        X && !X.isDestroyed() && X.webContents.send("child-stderr", { pid: o, data: l.toString() });
      })), { ok: !0, pid: o };
    } catch (a) {
      return { ok: !1, reason: String(a) };
    }
  }
);
et.handle(
  "send-to-child",
  async (e, { pid: t, msg: r } = {}) => {
    if (console.log(
      "send-to-child called with PID:",
      t,
      "Message type:",
      r == null ? void 0 : r.type
    ), console.log("Available children PIDs:", Array.from(Qe.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const n = Qe.get(t);
    if (!n) {
      if (console.log("Child not found for PID:", t), on)
        try {
          const s = W.dirname(on), a = os(on, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: s,
            silent: !1,
            env: { ...process.env }
          }), o = a.pid;
          if (typeof o == "number") {
            Qe.set(o, a), X && !X.isDestroyed() && X.webContents.send("child-message", {
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
et.handle(
  "stop-child",
  async (e, { pid: t } = {}) => {
    if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const r = Qe.get(t);
    if (!r) return { ok: !1, reason: "not-found" };
    try {
      return r.kill("SIGTERM"), { ok: !0 };
    } catch (n) {
      return { ok: !1, reason: String(n) };
    }
  }
);
function Gc() {
  if (X = new ha({
    icon: W.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: W.join(Dt, "preload.mjs"),
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), X.maximize(), X.webContents.on("did-finish-load", () => {
    X == null || X.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), fa)
    X.loadURL(fa);
  else
    try {
      const e = W.join(process.resourcesPath, "dist", "index.html");
      if (console.log("[main] loading packaged index from", e), Ge.existsSync(e))
        X.loadFile(e);
      else {
        const t = W.join(Ju, "index.html");
        console.warn(
          "[main] packaged index not found at",
          e,
          "falling back to",
          t
        ), X.loadFile(t);
      }
    } catch (e) {
      console.error("[main] failed to load packaged index.html", e);
      try {
        const t = W.join(
          process.resourcesPath,
          "app.asar",
          "dist",
          "index.html"
        );
        console.log("[main] attempting alt loadFile", t), X.loadFile(t);
      } catch (t) {
        console.error("[main] all index.html load attempts failed", t);
      }
    }
}
kt.whenReady().then(() => {
  (async () => {
    if (kt.isPackaged)
      try {
        const e = W.join(
          process.resourcesPath,
          "backend",
          "backend.exe"
        );
        Ge.existsSync(e) ? (console.log("[main] Spawning packaged backend exe at", e), Tt = ed(e, [], {
          env: {
            ...process.env,
            FRONTEND_API_PORT: process.env.FRONTEND_API_PORT || "3000"
          },
          cwd: process.resourcesPath
        }), Tt.stdout.on(
          "data",
          (t) => console.log("[backend exe stdout]", t.toString())
        ), Tt.stderr.on(
          "data",
          (t) => console.error("[backend exe stderr]", t.toString())
        ), Tt.on(
          "exit",
          (t) => console.log("[backend exe] exited", t)
        )) : console.warn("[main] packaged backend exe not found at", e);
      } catch (e) {
        console.error("[main] failed to spawn packaged backend exe", e);
      }
    else
      try {
        const e = W.dirname(W.dirname(Dt)), r = [
          W.join(e, "back-end", "dist", "index.js"),
          W.join(e, "back-end", "dist", "src", "index.js"),
          W.join(e, "back-end", "src", "index.ts")
        ].find((n) => Ge.existsSync(n));
        if (r)
          try {
            console.log("[main] dev auto-forking backend at", r), on = r;
            const n = W.dirname(r), s = os(r, [], {
              stdio: ["pipe", "pipe", "ipc"],
              cwd: n,
              env: { ...process.env }
            }), a = s.pid;
            typeof a == "number" && (Qe.set(a, s), console.log("[main] dev backend forked with PID", a)), s.on("message", (o) => {
              X && !X.isDestroyed() && X.webContents.send("child-message", { pid: s.pid, msg: o });
            }), s.stdout && s.stdout.on("data", (o) => {
              console.log("[child stdout]", o.toString()), X && !X.isDestroyed() && X.webContents.send("child-stdout", {
                pid: s.pid,
                data: o.toString()
              });
            }), s.stderr && s.stderr.on("data", (o) => {
              console.error("[child stderr]", o.toString()), X && !X.isDestroyed() && X.webContents.send("child-stderr", {
                pid: s.pid,
                data: o.toString()
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
    Gc();
  })(), kt.on("activate", () => {
    ha.getAllWindows().length === 0 && Gc();
  });
});
kt.on("window-all-closed", () => {
  process.platform !== "darwin" && kt.quit();
});
kt.on("before-quit", () => {
  try {
    Tt && !Tt.killed && (Tt.kill(), Tt = null);
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, e] of Qe.entries())
    try {
      e.kill("SIGTERM");
    } catch {
    }
});
const U1 = W.join(kt.getPath("userData"), "error.log"), Wu = Ge.createWriteStream(U1, { flags: "a" });
process.on("uncaughtException", (e) => {
  Wu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`
  );
});
process.on("unhandledRejection", (e) => {
  Wu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`
  );
});
et.handle(
  "save-pdf",
  async (e, t) => {
    try {
      const r = kt.getPath("temp"), n = W.join(r, `relatorio-${Date.now()}.pdf`), s = Buffer.from(t, "base64");
      return Ge.writeFileSync(n, s), { ok: !0, path: n };
    } catch (r) {
      return console.error("Failed to save pdf from renderer:", r), { ok: !1, error: String(r) };
    }
  }
);
export {
  sS as MAIN_DIST,
  Ju as RENDERER_DIST,
  fa as VITE_DEV_SERVER_URL
};
