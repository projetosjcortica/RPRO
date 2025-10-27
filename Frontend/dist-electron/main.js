var Yu = Object.defineProperty;
var pi = (e) => {
  throw TypeError(e);
};
var Qu = (e, t, r) => t in e ? Yu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Lr = (e, t, r) => Qu(e, typeof t != "symbol" ? t + "" : t, r), $i = (e, t, r) => t.has(e) || pi("Cannot " + r);
var fe = (e, t, r) => ($i(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Vr = (e, t, r) => t.has(e) ? pi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Fr = (e, t, r, n) => ($i(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import Kc, { ipcMain as et, dialog as Hc, BrowserWindow as Bc, app as At } from "electron";
import * as oe from "path";
import ve from "node:process";
import ae from "node:path";
import { promisify as Ne, isDeepStrictEqual as Zu } from "node:util";
import x from "node:fs";
import zr from "node:crypto";
import xu from "node:assert";
import as from "node:os";
import nr from "fs";
import { fileURLToPath as ed } from "url";
import { fork as os, spawn as td } from "child_process";
const sr = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Rs = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), rd = new Set("0123456789");
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
        if (n === "index" && !rd.has(a))
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
function ha(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Jc(e, t) {
  if (ha(e, t))
    throw new Error("Cannot use string index");
}
function nd(e, t, r) {
  if (!sr(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = is(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (ha(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function yi(e, t, r) {
  if (!sr(e) || typeof t != "string")
    return e;
  const n = e, s = is(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Jc(e, o), a === s.length - 1 ? e[o] = r : sr(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function sd(e, t) {
  if (!sr(e) || typeof t != "string")
    return !1;
  const r = is(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Jc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !sr(e))
      return !1;
  }
}
function ad(e, t) {
  if (!sr(e) || typeof t != "string")
    return !1;
  const r = is(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!sr(e) || !(n in e) || ha(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Rt = as.homedir(), ma = as.tmpdir(), { env: yr } = ve, od = (e) => {
  const t = ae.join(Rt, "Library");
  return {
    data: ae.join(t, "Application Support", e),
    config: ae.join(t, "Preferences", e),
    cache: ae.join(t, "Caches", e),
    log: ae.join(t, "Logs", e),
    temp: ae.join(ma, e)
  };
}, id = (e) => {
  const t = yr.APPDATA || ae.join(Rt, "AppData", "Roaming"), r = yr.LOCALAPPDATA || ae.join(Rt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ae.join(r, e, "Data"),
    config: ae.join(t, e, "Config"),
    cache: ae.join(r, e, "Cache"),
    log: ae.join(r, e, "Log"),
    temp: ae.join(ma, e)
  };
}, cd = (e) => {
  const t = ae.basename(Rt);
  return {
    data: ae.join(yr.XDG_DATA_HOME || ae.join(Rt, ".local", "share"), e),
    config: ae.join(yr.XDG_CONFIG_HOME || ae.join(Rt, ".config"), e),
    cache: ae.join(yr.XDG_CACHE_HOME || ae.join(Rt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ae.join(yr.XDG_STATE_HOME || ae.join(Rt, ".local", "state"), e),
    temp: ae.join(ma, t, e)
  };
};
function ld(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ve.platform === "darwin" ? od(e) : ve.platform === "win32" ? id(e) : cd(e);
}
const _t = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, ut = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, ud = ve.getuid ? !ve.getuid() : !1, dd = 1e4, Fe = () => {
}, he = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!he.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !ud && (t === "EINVAL" || t === "EPERM");
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
class fd {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = dd, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
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
const hd = new fd(), vt = (e, t) => function(n) {
  return function s(...a) {
    return hd.schedule().then((o) => {
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
}, Ie = {
  attempt: {
    /* ASYNC */
    chmod: _t(Ne(x.chmod), he.onChangeError),
    chown: _t(Ne(x.chown), he.onChangeError),
    close: _t(Ne(x.close), Fe),
    fsync: _t(Ne(x.fsync), Fe),
    mkdir: _t(Ne(x.mkdir), Fe),
    realpath: _t(Ne(x.realpath), Fe),
    stat: _t(Ne(x.stat), Fe),
    unlink: _t(Ne(x.unlink), Fe),
    /* SYNC */
    chmodSync: ut(x.chmodSync, he.onChangeError),
    chownSync: ut(x.chownSync, he.onChangeError),
    closeSync: ut(x.closeSync, Fe),
    existsSync: ut(x.existsSync, Fe),
    fsyncSync: ut(x.fsync, Fe),
    mkdirSync: ut(x.mkdirSync, Fe),
    realpathSync: ut(x.realpathSync, Fe),
    statSync: ut(x.statSync, Fe),
    unlinkSync: ut(x.unlinkSync, Fe)
  },
  retry: {
    /* ASYNC */
    close: vt(Ne(x.close), he.isRetriableError),
    fsync: vt(Ne(x.fsync), he.isRetriableError),
    open: vt(Ne(x.open), he.isRetriableError),
    readFile: vt(Ne(x.readFile), he.isRetriableError),
    rename: vt(Ne(x.rename), he.isRetriableError),
    stat: vt(Ne(x.stat), he.isRetriableError),
    write: vt(Ne(x.write), he.isRetriableError),
    writeFile: vt(Ne(x.writeFile), he.isRetriableError),
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
}, md = "utf8", gi = 438, pd = 511, $d = {}, yd = as.userInfo().uid, gd = as.userInfo().gid, _d = 1e3, vd = !!ve.getuid;
ve.getuid && ve.getuid();
const _i = 128, wd = (e) => e instanceof Error && "code" in e, vi = (e) => typeof e == "string", Os = (e) => e === void 0, Ed = ve.platform === "linux", Wc = ve.platform === "win32", pa = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Wc || pa.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Ed && pa.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class bd {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Wc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ve.kill(ve.pid, "SIGTERM") : ve.kill(ve.pid, t));
      }
    }, this.hook = () => {
      ve.once("exit", () => this.exit());
      for (const t of pa)
        try {
          ve.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Sd = new bd(), Pd = Sd.register, Te = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Te.truncate(t(e));
    return n in Te.store ? Te.get(e, t, r) : (Te.store[n] = r, [n, () => delete Te.store[n]]);
  },
  purge: (e) => {
    Te.store[e] && (delete Te.store[e], Ie.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Te.store[e] && (delete Te.store[e], Ie.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Te.store)
      Te.purgeSync(e);
  },
  truncate: (e) => {
    const t = ae.basename(e);
    if (t.length <= _i)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - _i;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Pd(Te.purgeSyncAll);
function Xc(e, t, r = $d) {
  if (vi(r))
    return Xc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? _d) || -1);
  let s = null, a = null, o = null;
  try {
    const l = Ie.attempt.realpathSync(e), u = !!l;
    e = l || e, [a, s] = Te.get(e, r.tmpCreate || Te.create, r.tmpPurge !== !1);
    const d = vd && Os(r.chown), c = Os(r.mode);
    if (u && (d || c)) {
      const h = Ie.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), c && (r.mode = h.mode));
    }
    if (!u) {
      const h = ae.dirname(e);
      Ie.attempt.mkdirSync(h, {
        mode: pd,
        recursive: !0
      });
    }
    o = Ie.retry.openSync(n)(a, "w", r.mode || gi), r.tmpCreated && r.tmpCreated(a), vi(t) ? Ie.retry.writeSync(n)(o, t, 0, r.encoding || md) : Os(t) || Ie.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Ie.retry.fsyncSync(n)(o) : Ie.attempt.fsync(o)), Ie.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== yd || r.chown.gid !== gd) && Ie.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== gi && Ie.attempt.chmodSync(a, r.mode);
    try {
      Ie.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!wd(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Ie.retry.renameSync(n)(a, Te.truncate(e));
    }
    s(), a = null;
  } finally {
    o && Ie.attempt.closeSync(o), a && Te.purge(a);
  }
}
function Yc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Js = { exports: {} }, Qc = {}, Ze = {}, Er = {}, cn = {}, Y = {}, an = {};
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
var Ws = {};
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
})(Ws);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = an, r = Ws;
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
        const j = E[I];
        j.optimizeNames(i, f) || (k(i, j.names), E.splice(I, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => B(i, f.names), {});
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
      return se(i, this.condition), this.else && B(i, this.else.names), i;
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
      return B(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, E, I) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: I, to: j } = this;
      return `for(${f} ${E}=${I}; ${E}<${j}; ${E}++)` + super.render(i);
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
      return B(super.names, this.iterable.names);
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
      return this.catch && B(i, this.catch.names), this.finally && B(i, this.finally.names), i;
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
      const j = this._scope.toName(f);
      return E !== void 0 && I && (this._constants[j.str] = E), this._leafNode(new o(i, j, E)), j;
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
    forRange(i, f, E, I, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, E), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, I = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(j, (0, t._)`${F}[${V}]`), E(j);
        });
      }
      return this._for(new O("of", I, j, f), () => E(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const j = this._scope.toName(i);
      return this._for(new O("in", I, j, f), () => E(j));
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
        const j = this.name("e");
        this._currNode = I.catch = new me(j), f(j);
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
  function B($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function se($, i) {
    return i instanceof t._CodeOrName ? B($, i.names) : $;
  }
  function T($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((j, F) => (F instanceof t.Name && (F = E(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function E(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function I(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
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
})(Y);
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
A.checkStrictMode = A.getErrorPath = A.Type = A.useFunc = A.setEvaluated = A.evaluatedPropsToName = A.mergeEvaluated = A.eachItem = A.unescapeJsonPointer = A.escapeJsonPointer = A.escapeFragment = A.unescapeFragment = A.schemaRefOrVal = A.schemaHasRulesButRef = A.schemaHasRules = A.checkUnknownRules = A.alwaysValidSchema = A.toHash = void 0;
const ie = Y, Nd = an;
function Rd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
A.toHash = Rd;
function Od(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Zc(e, t), !xc(t, e.self.RULES.all));
}
A.alwaysValidSchema = Od;
function Zc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || rl(e, `unknown keyword: "${a}"`);
}
A.checkUnknownRules = Zc;
function xc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
A.schemaHasRules = xc;
function Id(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
A.schemaHasRulesButRef = Id;
function Td({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ie._)`${r}`;
  }
  return (0, ie._)`${e}${t}${(0, ie.getProperty)(n)}`;
}
A.schemaRefOrVal = Td;
function jd(e) {
  return el(decodeURIComponent(e));
}
A.unescapeFragment = jd;
function kd(e) {
  return encodeURIComponent($a(e));
}
A.escapeFragment = kd;
function $a(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
A.escapeJsonPointer = $a;
function el(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
A.unescapeJsonPointer = el;
function Ad(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
A.eachItem = Ad;
function wi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, l) => {
    const u = o === void 0 ? a : o instanceof ie.Name ? (a instanceof ie.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof ie.Name ? (t(s, o, a), a) : r(a, o);
    return l === ie.Name && !(u instanceof ie.Name) ? n(s, u) : u;
  };
}
A.mergeEvaluated = {
  props: wi({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, ie._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, ie._)`${r} || {}`).code((0, ie._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ie._)`${r} || {}`), ya(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: tl
  }),
  items: wi({
    mergeNames: (e, t, r) => e.if((0, ie._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ie._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ie._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ie._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function tl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ie._)`{}`);
  return t !== void 0 && ya(e, r, t), r;
}
A.evaluatedPropsToName = tl;
function ya(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ie._)`${t}${(0, ie.getProperty)(n)}`, !0));
}
A.setEvaluated = ya;
const Ei = {};
function Cd(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ei[t.code] || (Ei[t.code] = new Nd._Code(t.code))
  });
}
A.useFunc = Cd;
var Xs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Xs || (A.Type = Xs = {}));
function Dd(e, t, r) {
  if (e instanceof ie.Name) {
    const n = t === Xs.Num;
    return r ? n ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : n ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ie.getProperty)(e).toString() : "/" + $a(e);
}
A.getErrorPath = Dd;
function rl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
A.checkStrictMode = rl;
var Ue = {};
Object.defineProperty(Ue, "__esModule", { value: !0 });
const Re = Y, Md = {
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
Ue.default = Md;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = Y, r = A, n = Ue;
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
})(cn);
Object.defineProperty(Er, "__esModule", { value: !0 });
Er.boolOrEmptySchema = Er.topBoolOrEmptySchema = void 0;
const Ld = cn, Vd = Y, Fd = Ue, zd = {
  message: "boolean schema is false"
};
function Ud(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? nl(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Fd.default.data) : (t.assign((0, Vd._)`${n}.errors`, null), t.return(!0));
}
Er.topBoolOrEmptySchema = Ud;
function qd(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), nl(e)) : r.var(t, !0);
}
Er.boolOrEmptySchema = qd;
function nl(e, t) {
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
  (0, Ld.reportError)(s, zd, void 0, t);
}
var ge = {}, ar = {};
Object.defineProperty(ar, "__esModule", { value: !0 });
ar.getRules = ar.isJSONType = void 0;
const Gd = ["string", "number", "integer", "boolean", "null", "object", "array"], Kd = new Set(Gd);
function Hd(e) {
  return typeof e == "string" && Kd.has(e);
}
ar.isJSONType = Hd;
function Bd() {
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
ar.getRules = Bd;
var ht = {};
Object.defineProperty(ht, "__esModule", { value: !0 });
ht.shouldUseRule = ht.shouldUseGroup = ht.schemaHasRulesForType = void 0;
function Jd({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && sl(e, n);
}
ht.schemaHasRulesForType = Jd;
function sl(e, t) {
  return t.rules.some((r) => al(e, r));
}
ht.shouldUseGroup = sl;
function al(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
ht.shouldUseRule = al;
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
const Wd = ar, Xd = ht, Yd = cn, Q = Y, ol = A;
var gr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(gr || (ge.DataType = gr = {}));
function Qd(e) {
  const t = il(e.type);
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
ge.getSchemaTypes = Qd;
function il(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Wd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ge.getJSONTypes = il;
function Zd(e, t) {
  const { gen: r, data: n, opts: s } = e, a = xd(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Xd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = ga(t, n, s.strictNumbers, gr.Wrong);
    r.if(l, () => {
      a.length ? ef(e, t, a) : _a(e);
    });
  }
  return o;
}
ge.coerceAndCheckDataType = Zd;
const cl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function xd(e, t) {
  return t ? e.filter((r) => cl.has(r) || t === "array" && r === "array") : [];
}
function ef(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Q._)`typeof ${s}`), l = n.let("coerced", (0, Q._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Q._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Q._)`${s}[0]`).assign(o, (0, Q._)`typeof ${s}`).if(ga(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Q._)`${l} !== undefined`);
  for (const d of r)
    (cl.has(d) || d === "array" && a.coerceTypes === "array") && u(d);
  n.else(), _a(e), n.endIf(), n.if((0, Q._)`${l} !== undefined`, () => {
    n.assign(s, l), tf(e, l);
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
function tf({ gen: e, parentData: t, parentDataProperty: r }, n) {
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
function ga(e, t, r, n) {
  if (e.length === 1)
    return Ys(e[0], t, r, n);
  let s;
  const a = (0, ol.toHash)(e);
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
ge.checkDataTypes = ga;
const rf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Q._)`{type: ${e}}` : (0, Q._)`{type: ${t}}`
};
function _a(e) {
  const t = nf(e);
  (0, Yd.reportError)(t, rf);
}
ge.reportTypeError = _a;
function nf(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, ol.schemaRefOrVal)(e, n, "type");
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
const cr = Y, sf = A;
function af(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      bi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => bi(e, a, s.default));
}
cs.assignDefaults = af;
function bi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, cr._)`${a}${(0, cr.getProperty)(t)}`;
  if (s) {
    (0, sf.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let u = (0, cr._)`${l} === undefined`;
  o.useDefaults === "empty" && (u = (0, cr._)`${u} || ${l} === null || ${l} === ""`), n.if(u, (0, cr._)`${l} = ${(0, cr.stringify)(r)}`);
}
var ot = {}, te = {};
Object.defineProperty(te, "__esModule", { value: !0 });
te.validateUnion = te.validateArray = te.usePattern = te.callValidateCode = te.schemaProperties = te.allSchemaProperties = te.noPropertyInData = te.propertyInData = te.isOwnProperty = te.hasPropFunc = te.reportMissingProp = te.checkMissingProp = te.checkReportMissingProp = void 0;
const le = Y, va = A, Et = Ue, of = A;
function cf(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Ea(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, le._)`${t}` }, !0), e.error();
  });
}
te.checkReportMissingProp = cf;
function lf({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, le.or)(...n.map((a) => (0, le.and)(Ea(e, t, a, r.ownProperties), (0, le._)`${s} = ${a}`)));
}
te.checkMissingProp = lf;
function uf(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
te.reportMissingProp = uf;
function ll(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, le._)`Object.prototype.hasOwnProperty`
  });
}
te.hasPropFunc = ll;
function wa(e, t, r) {
  return (0, le._)`${ll(e)}.call(${t}, ${r})`;
}
te.isOwnProperty = wa;
function df(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} !== undefined`;
  return n ? (0, le._)`${s} && ${wa(e, t, r)}` : s;
}
te.propertyInData = df;
function Ea(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} === undefined`;
  return n ? (0, le.or)(s, (0, le.not)(wa(e, t, r))) : s;
}
te.noPropertyInData = Ea;
function ul(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
te.allSchemaProperties = ul;
function ff(e, t) {
  return ul(t).filter((r) => !(0, va.alwaysValidSchema)(e, t[r]));
}
te.schemaProperties = ff;
function hf({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, u, d) {
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
te.callValidateCode = hf;
const mf = (0, le._)`new RegExp`;
function pf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, le._)`${s.code === "new RegExp" ? mf : (0, of.useFunc)(e, s)}(${r}, ${n})`
  });
}
te.usePattern = pf;
function $f(e) {
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
        dataPropType: va.Type.Num
      }, a), t.if((0, le.not)(a), l);
    });
  }
}
te.validateArray = $f;
function yf(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((u) => (0, va.alwaysValidSchema)(s, u)) && !s.opts.unevaluated)
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
te.validateUnion = yf;
Object.defineProperty(ot, "__esModule", { value: !0 });
ot.validateKeywordUsage = ot.validSchemaType = ot.funcKeywordCode = ot.macroKeywordCode = void 0;
const je = Y, Yt = Ue, gf = te, _f = cn;
function vf(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), u = dl(r, n, l);
  o.opts.validateSchema !== !1 && o.self.validateSchema(l, !0);
  const d = r.name("valid");
  e.subschema({
    schema: l,
    schemaPath: je.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: u,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
ot.macroKeywordCode = vf;
function wf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: u } = e;
  bf(u, t);
  const d = !l && t.compile ? t.compile.call(u.self, a, o, u) : t.validate, c = dl(n, s, d), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      g(), t.modifying && Si(e), y(() => e.error());
    else {
      const m = t.async ? _() : w();
      t.modifying && Si(e), y(() => Ef(e, m));
    }
  }
  function _() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, je._)`await `), (v) => n.assign(h, !1).if((0, je._)`${v} instanceof ${u.ValidationError}`, () => n.assign(m, (0, je._)`${v}.errors`), () => n.throw(v))), m;
  }
  function w() {
    const m = (0, je._)`${c}.errors`;
    return n.assign(m, null), g(je.nil), m;
  }
  function g(m = t.async ? (0, je._)`await ` : je.nil) {
    const v = u.opts.passContext ? Yt.default.this : Yt.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, je._)`${m}${(0, gf.callValidateCode)(e, c, v, N)}`, t.modifying);
  }
  function y(m) {
    var v;
    n.if((0, je.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
ot.funcKeywordCode = wf;
function Si(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, je._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Ef(e, t) {
  const { gen: r } = e;
  r.if((0, je._)`Array.isArray(${t})`, () => {
    r.assign(Yt.default.vErrors, (0, je._)`${Yt.default.vErrors} === null ? ${t} : ${Yt.default.vErrors}.concat(${t})`).assign(Yt.default.errors, (0, je._)`${Yt.default.vErrors}.length`), (0, _f.extendErrors)(e);
  }, () => e.error());
}
function bf({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function dl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, je.stringify)(r) });
}
function Sf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
ot.validSchemaType = Sf;
function Pf({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
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
ot.validateKeywordUsage = Pf;
var jt = {};
Object.defineProperty(jt, "__esModule", { value: !0 });
jt.extendSubschemaMode = jt.extendSubschemaData = jt.getSubschema = void 0;
const st = Y, fl = A;
function Nf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
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
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, fl.escapeFragment)(r)}`
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
jt.getSubschema = Nf;
function Rf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: c, opts: h } = t, b = l.let("data", (0, st._)`${t.data}${(0, st.getProperty)(r)}`, !0);
    u(b), e.errorPath = (0, st.str)`${d}${(0, fl.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, st._)`${r}`, e.dataPathArr = [...c, e.parentDataProperty];
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
jt.extendSubschemaData = Rf;
function Of(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
jt.extendSubschemaMode = Of;
var Se = {}, ls = function e(t, r) {
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
}, hl = { exports: {} }, It = hl.exports = function(e, t, r) {
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
            Cn(e, t, r, h[_], s + "/" + c + "/" + If(_), a, s, c, n, _);
      } else (c in It.keywords || e.allKeys && !(c in It.skipKeywords)) && Cn(e, t, r, h, s + "/" + c, a, s, c, n);
    }
    r(n, s, a, o, l, u, d);
  }
}
function If(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Tf = hl.exports;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
const jf = A, kf = ls, Af = Tf, Cf = /* @__PURE__ */ new Set([
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
function Df(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Qs(e) : t ? ml(e) <= t : !1;
}
Se.inlineRef = Df;
const Mf = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Qs(e) {
  for (const t in e) {
    if (Mf.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Qs) || typeof r == "object" && Qs(r))
      return !0;
  }
  return !1;
}
function ml(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Cf.has(r) && (typeof e[r] == "object" && (0, jf.eachItem)(e[r], (n) => t += ml(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function pl(e, t = "", r) {
  r !== !1 && (t = _r(t));
  const n = e.parse(t);
  return $l(e, n);
}
Se.getFullPath = pl;
function $l(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Se._getFullPath = $l;
const Lf = /#\/?$/;
function _r(e) {
  return e ? e.replace(Lf, "") : "";
}
Se.normalizeId = _r;
function Vf(e, t, r) {
  return r = _r(r), e.resolve(t, r);
}
Se.resolveUrl = Vf;
const Ff = /^[a-z_][-a-z0-9._]*$/i;
function zf(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = _r(e[r] || t), a = { "": s }, o = pl(n, s, !1), l = {}, u = /* @__PURE__ */ new Set();
  return Af(e, { allKeys: !0 }, (h, b, _, w) => {
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
        if (!Ff.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, b, _) {
    if (b !== void 0 && !kf(h, b))
      throw c(_);
  }
  function c(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Se.getSchemaRefs = zf;
Object.defineProperty(Ze, "__esModule", { value: !0 });
Ze.getData = Ze.KeywordCxt = Ze.validateFunctionCode = void 0;
const yl = Er, Pi = ge, ba = ht, Jn = ge, Uf = cs, Xr = ot, Is = jt, U = Y, J = Ue, qf = Se, mt = A, Ur = cn;
function Gf(e) {
  if (vl(e) && (wl(e), _l(e))) {
    Bf(e);
    return;
  }
  gl(e, () => (0, yl.topBoolOrEmptySchema)(e));
}
Ze.validateFunctionCode = Gf;
function gl({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, U._)`${J.default.data}, ${J.default.valCxt}`, n.$async, () => {
    e.code((0, U._)`"use strict"; ${Ni(r, s)}`), Hf(e, s), e.code(a);
  }) : e.func(t, (0, U._)`${J.default.data}, ${Kf(s)}`, n.$async, () => e.code(Ni(r, s)).code(a));
}
function Kf(e) {
  return (0, U._)`{${J.default.instancePath}="", ${J.default.parentData}, ${J.default.parentDataProperty}, ${J.default.rootData}=${J.default.data}${e.dynamicRef ? (0, U._)`, ${J.default.dynamicAnchors}={}` : U.nil}}={}`;
}
function Hf(e, t) {
  e.if(J.default.valCxt, () => {
    e.var(J.default.instancePath, (0, U._)`${J.default.valCxt}.${J.default.instancePath}`), e.var(J.default.parentData, (0, U._)`${J.default.valCxt}.${J.default.parentData}`), e.var(J.default.parentDataProperty, (0, U._)`${J.default.valCxt}.${J.default.parentDataProperty}`), e.var(J.default.rootData, (0, U._)`${J.default.valCxt}.${J.default.rootData}`), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, U._)`${J.default.valCxt}.${J.default.dynamicAnchors}`);
  }, () => {
    e.var(J.default.instancePath, (0, U._)`""`), e.var(J.default.parentData, (0, U._)`undefined`), e.var(J.default.parentDataProperty, (0, U._)`undefined`), e.var(J.default.rootData, J.default.data), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, U._)`{}`);
  });
}
function Bf(e) {
  const { schema: t, opts: r, gen: n } = e;
  gl(e, () => {
    r.$comment && t.$comment && bl(e), Qf(e), n.let(J.default.vErrors, null), n.let(J.default.errors, 0), r.unevaluated && Jf(e), El(e), eh(e);
  });
}
function Jf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, U._)`${r}.evaluated`), t.if((0, U._)`${e.evaluated}.dynamicProps`, () => t.assign((0, U._)`${e.evaluated}.props`, (0, U._)`undefined`)), t.if((0, U._)`${e.evaluated}.dynamicItems`, () => t.assign((0, U._)`${e.evaluated}.items`, (0, U._)`undefined`));
}
function Ni(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, U._)`/*# sourceURL=${r} */` : U.nil;
}
function Wf(e, t) {
  if (vl(e) && (wl(e), _l(e))) {
    Xf(e, t);
    return;
  }
  (0, yl.boolOrEmptySchema)(e, t);
}
function _l({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function vl(e) {
  return typeof e.schema != "boolean";
}
function Xf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && bl(e), Zf(e), xf(e);
  const a = n.const("_errs", J.default.errors);
  El(e, a), n.var(t, (0, U._)`${a} === ${J.default.errors}`);
}
function wl(e) {
  (0, mt.checkUnknownRules)(e), Yf(e);
}
function El(e, t) {
  if (e.opts.jtd)
    return Ri(e, [], !1, t);
  const r = (0, Pi.getSchemaTypes)(e.schema), n = (0, Pi.coerceAndCheckDataType)(e, r);
  Ri(e, r, !n, t);
}
function Yf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, mt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Qf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, mt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Zf(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, qf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function xf(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function bl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, U._)`${J.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, U.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, U._)`${J.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function eh(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, U._)`${J.default.errors} === 0`, () => t.return(J.default.data), () => t.throw((0, U._)`new ${s}(${J.default.vErrors})`)) : (t.assign((0, U._)`${n}.errors`, J.default.vErrors), a.unevaluated && th(e), t.return((0, U._)`${J.default.errors} === 0`));
}
function th({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof U.Name && e.assign((0, U._)`${t}.props`, r), n instanceof U.Name && e.assign((0, U._)`${t}.items`, n);
}
function Ri(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: u, self: d } = e, { RULES: c } = d;
  if (a.$ref && (u.ignoreKeywordsWithRef || !(0, mt.schemaHasRulesButRef)(a, c))) {
    s.block(() => Nl(e, "$ref", c.all.$ref.definition));
    return;
  }
  u.jtd || rh(e, t), s.block(() => {
    for (const b of c.rules)
      h(b);
    h(c.post);
  });
  function h(b) {
    (0, ba.shouldUseGroup)(a, b) && (b.type ? (s.if((0, Jn.checkDataType)(b.type, o, u.strictNumbers)), Oi(e, b), t.length === 1 && t[0] === b.type && r && (s.else(), (0, Jn.reportTypeError)(e)), s.endIf()) : Oi(e, b), l || s.if((0, U._)`${J.default.errors} === ${n || 0}`));
  }
}
function Oi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Uf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, ba.shouldUseRule)(n, a) && Nl(e, a.keyword, a.definition, t.type);
  });
}
function rh(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (nh(e, t), e.opts.allowUnionTypes || sh(e, t), ah(e, e.dataTypes));
}
function nh(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      Sl(e.dataTypes, r) || Sa(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), ih(e, t);
  }
}
function sh(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Sa(e, "use allowUnionTypes to allow union type keyword");
}
function ah(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, ba.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => oh(t, o)) && Sa(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function oh(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Sl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function ih(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Sl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Sa(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, mt.checkStrictMode)(e, t, e.opts.strictTypes);
}
let Pl = class {
  constructor(t, r, n) {
    if ((0, Xr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, mt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Rl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Xr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
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
    (t ? Ur.reportExtraError : Ur.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Ur.reportError)(this, this.def.$dataError || Ur.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Ur.resetErrorsCount)(this.gen, this.errsCount);
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
        return (0, U._)`${(0, Jn.checkDataTypes)(u, r, a.opts.strictNumbers, Jn.DataType.Wrong)}`;
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
    const n = (0, Is.getSubschema)(this.it, t);
    (0, Is.extendSubschemaData)(n, this.it, t), (0, Is.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return Wf(s, r), s;
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
Ze.KeywordCxt = Pl;
function Nl(e, t, r, n) {
  const s = new Pl(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Xr.funcKeywordCode)(s, r) : "macro" in r ? (0, Xr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Xr.funcKeywordCode)(s, r);
}
const ch = /^\/(?:[^~]|~0|~1)*$/, lh = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Rl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return J.default.rootData;
  if (e[0] === "/") {
    if (!ch.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = J.default.rootData;
  } else {
    const d = lh.exec(e);
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
Ze.getData = Rl;
var pn = {}, Ii;
function Pa() {
  if (Ii) return pn;
  Ii = 1, Object.defineProperty(pn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return pn.default = e, pn;
}
var Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
const Ts = Se;
let uh = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ts.resolveUrl)(t, r, n), this.missingSchema = (0, Ts.normalizeId)((0, Ts.getFullPath)(t, this.missingRef));
  }
};
Nr.default = uh;
var Ae = {};
Object.defineProperty(Ae, "__esModule", { value: !0 });
Ae.resolveSchema = Ae.getCompilingSchema = Ae.resolveRef = Ae.compileSchema = Ae.SchemaEnv = void 0;
const He = Y, dh = Pa(), Wt = Ue, Xe = Se, Ti = A, fh = Ze;
let us = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
Ae.SchemaEnv = us;
function Na(e) {
  const t = Ol.call(this, e);
  if (t)
    return t;
  const r = (0, Xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new He.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: dh.default,
    code: (0, He._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const u = o.scopeName("validate");
  e.validateName = u;
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
    this._compilations.add(e), (0, fh.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    c = `${o.scopeRefs(Wt.default.scope)}return ${h}`, this.opts.code.process && (c = this.opts.code.process(c, e));
    const _ = new Function(`${Wt.default.self}`, `${Wt.default.scope}`, c)(this, this.scope.get());
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
Ae.compileSchema = Na;
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
Ae.resolveRef = hh;
function mh(e) {
  return (0, Xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Na.call(this, e);
}
function Ol(e) {
  for (const t of this._compilations)
    if (ph(t, e))
      return t;
}
Ae.getCompilingSchema = Ol;
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
    return js.call(this, r, e);
  const a = (0, Xe.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const l = ds.call(this, e, o);
    return typeof (l == null ? void 0 : l.schema) != "object" ? void 0 : js.call(this, r, l);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || Na.call(this, o), a === (0, Xe.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: u } = this.opts, d = l[u];
      return d && (s = (0, Xe.resolveUrl)(this.opts.uriResolver, s, d)), new us({ schema: l, schemaId: u, root: e, baseId: s });
    }
    return js.call(this, r, o);
  }
}
Ae.resolveSchema = ds;
const yh = /* @__PURE__ */ new Set([
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
    !yh.has(l) && d && (t = (0, Xe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ti.schemaHasRulesButRef)(r, this.RULES)) {
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
const Ph = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Il = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Tl(e) {
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
    const n = Tl(e);
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
        l = ji;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (l === ji ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(Tl(s))), r.address = n.join(""), r;
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
function Th(e) {
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
function jh(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function kh(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!Il(r)) {
      const n = jl(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var kl = {
  nonSimpleDomain: Nh,
  recomposeAuthority: kh,
  normalizeComponentEncoding: jh,
  removeDotSegments: Th,
  isIPv4: Il,
  isUUID: Ph,
  normalizeIPv6: jl
};
const { isUUID: Ah } = kl, Ch = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Al(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Cl(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Dl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Dh(e) {
  return e.secure = Al(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Mh(e) {
  if ((e.port === (Al(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
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
const Ml = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Cl,
    serialize: Dl
  }
), Uh = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Ml.domainHost,
    parse: Cl,
    serialize: Dl
  }
), Dn = (
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
    domainHost: Dn.domainHost,
    parse: Dn.parse,
    serialize: Dn.serialize
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
    http: Ml,
    https: Uh,
    ws: Dn,
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
const { normalizeIPv6: Bh, removeDotSegments: Br, recomposeAuthority: Jh, normalizeComponentEncoding: $n, isIPv4: Wh, nonSimpleDomain: Xh } = kl, { SCHEMES: Yh, getSchemeHandler: Ll } = Hh;
function Qh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  it(yt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  yt(it(e, t), t)), e;
}
function Zh(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Vl(yt(e, n), yt(t, n), n, !0);
  return n.skipEscape = !0, it(s, n);
}
function Vl(e, t, r, n) {
  const s = {};
  return n || (e = yt(it(e, r), r), t = yt(it(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Br(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Br(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Br(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Br(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function xh(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = it($n(yt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = it($n(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = it($n(yt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = it($n(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
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
  }, n = Object.assign({}, t), s = [], a = Ll(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Jh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let l = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (l = Br(l)), o === void 0 && l[0] === "/" && l[1] === "/" && (l = "/%2F" + l.slice(2)), s.push(l);
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
        const u = Bh(n.host);
        n.host = u.host.toLowerCase(), s = u.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Ll(r.scheme || n.scheme);
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
  resolveComponent: Vl,
  equal: xh,
  serialize: it,
  parse: yt
};
fs.exports = Ia;
fs.exports.default = Ia;
fs.exports.fastUri = Ia;
var Fl = fs.exports;
Object.defineProperty(Ra, "__esModule", { value: !0 });
const zl = Fl;
zl.code = 'require("ajv/dist/runtime/uri").default';
Ra.default = zl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Ze;
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
  const n = Pa(), s = Nr, a = ar, o = Ae, l = Y, u = Se, d = ge, c = A, h = Sh, b = Ra, _ = (P, p) => new RegExp(P, p);
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
    var p, S, $, i, f, E, I, j, F, V, ne, Ve, Ct, Dt, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht, Bt;
    const Ke = P.strict, Jt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Dr = Jt === !0 || Jt === void 0 ? 1 : Jt || 0, Mr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ns = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : Ke) !== null && E !== void 0 ? E : !0,
      strictNumbers: (j = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ke) !== null && j !== void 0 ? j : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ke) !== null && V !== void 0 ? V : "log",
      strictTuples: (Ve = (ne = P.strictTuples) !== null && ne !== void 0 ? ne : Ke) !== null && Ve !== void 0 ? Ve : "log",
      strictRequired: (Dt = (Ct = P.strictRequired) !== null && Ct !== void 0 ? Ct : Ke) !== null && Dt !== void 0 ? Dt : !1,
      code: P.code ? { ...P.code, optimize: Dr, regExp: Mr } : { optimize: Dr, regExp: Mr },
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
      uriResolver: Ns
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = B(p.logger);
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
        const Ve = this._addSchema(V, ne);
        return Ve.validate || E.call(this, Ve);
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
          return I.call(this, ne), await j.call(this, ne.missingSchema), E.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: ne }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${ne} cannot be resolved`);
      }
      async function j(V) {
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
        return (0, c.eachItem)($, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, c.eachItem)($, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((E) => k.call(this, f, i, E))), this;
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
          const j = $[I];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, V = E[I];
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
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      $ = (0, u.normalizeId)(E || $);
      const F = u.getSchemaRefs.call(this, p, $);
      return j = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(j.schema, j), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = j), i && this.validateSchema(p, !0), j;
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
  function B(P) {
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
  function k(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: j }) => j === S);
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
    p.before ? L.call(this, E, I, p.before) : E.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((j) => this.addKeyword(j));
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
})(Qc);
var Ta = {}, ja = {}, ka = {};
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
const rm = Nr, ki = te, De = Y, lr = Ue, Ai = Ae, yn = A, nm = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: u } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const c = Ai.resolveRef.call(u, d, s, r);
    if (c === void 0)
      throw new rm.default(n.opts.uriResolver, s, r);
    if (c instanceof Ai.SchemaEnv)
      return b(c);
    return _(c);
    function h() {
      if (a === d)
        return Mn(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return Mn(e, (0, De._)`${w}.validate`, d, d.$async);
    }
    function b(w) {
      const g = Ul(e, w);
      Mn(e, g, w, w.$async);
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
function Ul(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, De._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
gt.getValidate = Ul;
function Mn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: u } = a, d = u.passContext ? lr.default.this : De.nil;
  n ? c() : h();
  function c() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, De._)`await ${(0, ki.callValidateCode)(e, t, d)}`), _(t), o || s.assign(w, !0);
    }, (g) => {
      s.if((0, De._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), b(g), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, ki.callValidateCode)(e, t, d), () => _(t), () => b(t));
  }
  function b(w) {
    const g = (0, De._)`${w}.errors`;
    s.assign(lr.default.vErrors, (0, De._)`${lr.default.vErrors} === null ? ${g} : ${lr.default.vErrors}.concat(${g})`), s.assign(lr.default.errors, (0, De._)`${lr.default.vErrors}.length`);
  }
  function _(w) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = yn.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, De._)`${w}.evaluated.props`);
        a.props = yn.mergeEvaluated.props(s, m, a.props, De.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = yn.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, De._)`${w}.evaluated.items`);
        a.items = yn.mergeEvaluated.items(s, m, a.items, De.Name);
      }
  }
}
gt.callRef = Mn;
gt.default = nm;
Object.defineProperty(ja, "__esModule", { value: !0 });
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
ja.default = om;
var Aa = {}, Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Xn = Y, bt = Xn.operators, Yn = {
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
const Yr = Y, lm = {
  message: ({ schemaCode: e }) => (0, Yr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Yr._)`{multipleOf: ${e}}`
}, um = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: lm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, Yr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Yr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Yr._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Da.default = um;
var Ma = {}, La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
function ql(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
La.default = ql;
ql.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Qt = Y, dm = A, fm = La, hm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Qt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Qt._)`{limit: ${e}}`
}, mm = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: hm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Qt.operators.GT : Qt.operators.LT, o = s.opts.unicode === !1 ? (0, Qt._)`${r}.length` : (0, Qt._)`${(0, dm.useFunc)(e.gen, fm.default)}(${r})`;
    e.fail$data((0, Qt._)`${o} ${a} ${n}`);
  }
};
Ma.default = mm;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const pm = te, Qn = Y, $m = {
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
const Qr = Y, gm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Qr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Qr._)`{limit: ${e}}`
}, _m = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: gm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Qr.operators.GT : Qr.operators.LT;
    e.fail$data((0, Qr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Fa.default = _m;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const qr = te, Zr = Y, vm = A, wm = {
  message: ({ params: { missingProperty: e } }) => (0, Zr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Zr._)`{missingProperty: ${e}}`
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
    const u = r.length >= l.loopRequired;
    if (o.allErrors ? d() : c(), l.strictRequired) {
      const _ = e.parentSchema.properties, { definedProperties: w } = e.it;
      for (const g of r)
        if ((_ == null ? void 0 : _[g]) === void 0 && !w.has(g)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${y}" (strictRequired)`;
          (0, vm.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (u || a)
        e.block$data(Zr.nil, h);
      else
        for (const _ of r)
          (0, qr.checkReportMissingProp)(e, _);
    }
    function c() {
      const _ = t.let("missing");
      if (u || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => b(_, w)), e.ok(w);
      } else
        t.if((0, qr.checkMissingProp)(e, r, _)), (0, qr.reportMissingProp)(e, _), t.else();
    }
    function h() {
      t.forOf("prop", n, (_) => {
        e.setParams({ missingProperty: _ }), t.if((0, qr.noPropertyInData)(t, s, _, l.ownProperties), () => e.error());
      });
    }
    function b(_, w) {
      e.setParams({ missingProperty: _ }), t.forOf(_, n, () => {
        t.assign(w, (0, qr.propertyInData)(t, s, _, l.ownProperties)), t.if((0, Zr.not)(w), () => {
          e.error(), t.break();
        });
      }, Zr.nil);
    }
  }
};
za.default = Em;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const xr = Y, bm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, xr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, xr._)`{limit: ${e}}`
}, Sm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: bm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? xr.operators.GT : xr.operators.LT;
    e.fail$data((0, xr._)`${r}.length ${s} ${n}`);
  }
};
Ua.default = Sm;
var qa = {}, ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
const Gl = ls;
Gl.code = 'require("ajv/dist/runtime/equal").default';
ln.default = Gl;
Object.defineProperty(qa, "__esModule", { value: !0 });
const ks = ge, we = Y, Pm = A, Nm = ln, Rm = {
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
    const u = t.let("valid"), d = a.items ? (0, ks.getSchemaTypes)(a.items) : [];
    e.block$data(u, c, (0, we._)`${o} === false`), e.ok(u);
    function c() {
      const w = t.let("i", (0, we._)`${r}.length`), g = t.let("j");
      e.setParams({ i: w, j: g }), t.assign(u, !0), t.if((0, we._)`${w} > 1`, () => (h() ? b : _)(w, g));
    }
    function h() {
      return d.length > 0 && !d.some((w) => w === "object" || w === "array");
    }
    function b(w, g) {
      const y = t.name("item"), m = (0, ks.checkDataTypes)(d, y, l.opts.strictNumbers, ks.DataType.Wrong), v = t.const("indices", (0, we._)`{}`);
      t.for((0, we._)`;${w}--;`, () => {
        t.let(y, (0, we._)`${r}[${w}]`), t.if(m, (0, we._)`continue`), d.length > 1 && t.if((0, we._)`typeof ${y} == "string"`, (0, we._)`${y} += "_"`), t.if((0, we._)`typeof ${v}[${y}] == "number"`, () => {
          t.assign(g, (0, we._)`${v}[${y}]`), e.error(), t.assign(u, !1).break();
        }).code((0, we._)`${v}[${y}] = ${w}`);
      });
    }
    function _(w, g) {
      const y = (0, Pm.useFunc)(t, Nm.default), m = t.name("outer");
      t.label(m).for((0, we._)`;${w}--;`, () => t.for((0, we._)`${g} = ${w}; ${g}--;`, () => t.if((0, we._)`${y}(${r}[${w}], ${r}[${g}])`, () => {
        e.error(), t.assign(u, !1).break(m);
      })));
    }
  }
};
qa.default = Om;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Zs = Y, Im = A, Tm = ln, jm = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Zs._)`{allowedValue: ${e}}`
}, km = {
  keyword: "const",
  $data: !0,
  error: jm,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Zs._)`!${(0, Im.useFunc)(t, Tm.default)}(${r}, ${s})`) : e.fail((0, Zs._)`${a} !== ${r}`);
  }
};
Ga.default = km;
var Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Jr = Y, Am = A, Cm = ln, Dm = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Jr._)`{allowedValues: ${e}}`
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
    let u;
    const d = () => u ?? (u = (0, Am.useFunc)(t, Cm.default));
    let c;
    if (l || n)
      c = t.let("valid"), e.block$data(c, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const _ = t.const("vSchema", a);
      c = (0, Jr.or)(...s.map((w, g) => b(_, g)));
    }
    e.pass(c);
    function h() {
      t.assign(c, !1), t.forOf("v", a, (_) => t.if((0, Jr._)`${d()}(${r}, ${_})`, () => t.assign(c, !0).break()));
    }
    function b(_, w) {
      const g = s[w];
      return typeof g == "object" && g !== null ? (0, Jr._)`${d()}(${r}, ${_}[${w}])` : (0, Jr._)`${r} === ${g}`;
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
var Ha = {}, Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
Rr.validateAdditionalItems = void 0;
const Zt = Y, xs = A, Wm = {
  message: ({ params: { len: e } }) => (0, Zt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Zt._)`{limit: ${e}}`
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
    Kl(e, n);
  }
};
function Kl(e, t) {
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
Rr.validateAdditionalItems = Kl;
Rr.default = Xm;
var Ba = {}, Or = {};
Object.defineProperty(Or, "__esModule", { value: !0 });
Or.validateTuple = void 0;
const Ci = Y, Ln = A, Ym = te, Qm = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Hl(e, "additionalItems", t);
    r.items = !0, !(0, Ln.alwaysValidSchema)(r, t) && e.ok((0, Ym.validateArray)(e));
  }
};
function Hl(e, t, r = e.schema) {
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
Or.validateTuple = Hl;
Or.default = Qm;
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Zm = Or, xm = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Zm.validateTuple)(e, "items")
};
Ba.default = xm;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const Di = Y, ep = A, tp = te, rp = Rr, np = {
  message: ({ params: { len: e } }) => (0, Di.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Di._)`{limit: ${e}}`
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
const qe = Y, gn = A, ap = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe.str)`must contain at least ${e} valid item(s)` : (0, qe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe._)`{minContains: ${e}}` : (0, qe._)`{minContains: ${e}, maxContains: ${t}}`
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
    const { minContains: u, maxContains: d } = n;
    a.opts.next ? (o = u === void 0 ? 1 : u, l = d) : o = 1;
    const c = t.const("len", (0, qe._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, gn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, gn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, gn.alwaysValidSchema)(a, r)) {
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
          dataPropType: gn.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function w(g) {
      t.code((0, qe._)`${g}++`), l === void 0 ? t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, qe._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, qe._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Wa.default = op;
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
const Bl = Y, ip = A, cp = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Bl._)`{propertyName: ${e.propertyName}}`
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
      }, a), t.if((0, Bl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Xa.default = lp;
var ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
const _n = te, Je = Y, up = Ue, vn = A, dp = {
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
    const { allErrors: l, opts: u } = o;
    if (o.props = !0, u.removeAdditional !== "all" && (0, vn.alwaysValidSchema)(o, r))
      return;
    const d = (0, _n.allSchemaProperties)(n.properties), c = (0, _n.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Je._)`${a} === ${up.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !c.length ? w(y) : t.if(b(y), () => w(y));
      });
    }
    function b(y) {
      let m;
      if (d.length > 8) {
        const v = (0, vn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, _n.isOwnProperty)(t, v, y);
      } else d.length ? m = (0, Je.or)(...d.map((v) => (0, Je._)`${y} === ${v}`)) : m = Je.nil;
      return c.length && (m = (0, Je.or)(m, ...c.map((v) => (0, Je._)`${(0, _n.usePattern)(e, v)}.test(${y})`))), (0, Je.not)(m);
    }
    function _(y) {
      t.code((0, Je._)`delete ${s}[${y}]`);
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
      if (typeof r == "object" && !(0, vn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        u.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, Je.not)(m), () => {
          e.reset(), _(y);
        })) : (g(y, m), l || t.if((0, Je.not)(m), () => t.break()));
      }
    }
    function g(y, m, v) {
      const N = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: vn.Type.Str
      };
      v === !1 && Object.assign(N, {
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
const hp = Ze, Mi = te, As = A, Li = ms, mp = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Li.default.code(new hp.KeywordCxt(a, Li.default, "additionalProperties"));
    const o = (0, Mi.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = As.mergeEvaluated.props(t, (0, As.toHash)(o), a.props));
    const l = o.filter((h) => !(0, As.alwaysValidSchema)(a, r[h]));
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
Ya.default = mp;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const Vi = te, wn = Y, Fi = A, zi = A, pp = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, Vi.allSchemaProperties)(r), u = l.filter((g) => (0, Fi.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || u.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, c = t.name("valid");
    a.props !== !0 && !(a.props instanceof wn.Name) && (a.props = (0, zi.evaluatedPropsToName)(t, a.props));
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
        t.if((0, wn._)`${(0, Vi.usePattern)(e, g)}.test(${y})`, () => {
          const m = u.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: zi.Type.Str
          }, c), a.opts.unevaluated && h !== !0 ? t.assign((0, wn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, wn.not)(c), () => t.break());
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
const gp = te, _p = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: gp.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
xa.default = _p;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const Vn = Y, vp = A, wp = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Vn._)`{passingSchemas: ${e.passing}}`
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
    const a = r, o = t.let("valid", !1), l = t.let("passing", null), u = t.name("_valid");
    e.setParams({ passing: l }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((c, h) => {
        let b;
        (0, vp.alwaysValidSchema)(s, c) ? t.var(u, !0) : b = e.subschema({
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
const Zn = Y, Jl = A, Pp = {
  message: ({ params: e }) => (0, Zn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Zn._)`{failingKeyword: ${e.ifClause}}`
}, Np = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Pp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Jl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
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
  return r !== void 0 && !(0, Jl.alwaysValidSchema)(e, r);
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
const Ip = Rr, Tp = Ba, jp = Or, kp = Ja, Ap = Wa, Cp = hs, Dp = Xa, Mp = ms, Lp = Ya, Vp = Qa, Fp = Za, zp = xa, Up = eo, qp = to, Gp = ro, Kp = no;
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
  return e ? t.push(Tp.default, kp.default) : t.push(Ip.default, jp.default), t.push(Ap.default), t;
}
Ha.default = Hp;
var so = {}, Ir = {};
Object.defineProperty(Ir, "__esModule", { value: !0 });
Ir.dynamicAnchor = void 0;
const Cs = Y, Bp = Ue, qi = Ae, Jp = gt, Wp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Wl(e, e.schema)
};
function Wl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, Cs._)`${Bp.default.dynamicAnchors}${(0, Cs.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Xp(e);
  r.if((0, Cs._)`!${s}`, () => r.assign(s, a));
}
Ir.dynamicAnchor = Wl;
function Xp(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: l } = t.root, { schemaId: u } = n.opts, d = new qi.SchemaEnv({ schema: r, schemaId: u, root: s, baseId: a, localRefs: o, meta: l });
  return qi.compileSchema.call(n, d), (0, Jp.getValidate)(e, d);
}
Ir.default = Wp;
var Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
Tr.dynamicRef = void 0;
const Gi = Y, Yp = Ue, Ki = gt, Qp = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Xl(e, e.schema)
};
function Xl(e, t) {
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
      const d = r.let("_v", (0, Gi._)`${Yp.default.dynamicAnchors}${(0, Gi.getProperty)(a)}`);
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
Tr.dynamicRef = Xl;
Tr.default = Qp;
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const Zp = Ir, xp = A, e$ = {
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
const n$ = Ir, s$ = Tr, a$ = ao, o$ = oo, i$ = [n$.default, s$.default, a$.default, o$.default];
so.default = i$;
var io = {}, co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const Hi = hs, c$ = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Hi.error,
  code: (e) => (0, Hi.validatePropertyDeps)(e)
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
const Nt = Y, Bi = A, y$ = Ue, g$ = {
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
    l instanceof Nt.Name ? t.if((0, Nt._)`${l} !== true`, () => t.forIn("key", n, (h) => t.if(d(l, h), () => u(h)))) : l !== !0 && t.forIn("key", n, (h) => l === void 0 ? u(h) : t.if(c(l, h), () => u(h))), a.props = !0, e.ok((0, Nt._)`${s} === ${y$.default.errors}`);
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
ho.default = _$;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const xt = Y, Ji = A, v$ = {
  message: ({ params: { len: e } }) => (0, xt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, xt._)`{limit: ${e}}`
}, w$ = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: v$,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, xt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, xt._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Ji.alwaysValidSchema)(s, r)) {
      const u = t.var("valid", (0, xt._)`${o} <= ${a}`);
      t.if((0, xt.not)(u), () => l(u, a)), e.ok(u);
    }
    s.items = !0;
    function l(u, d) {
      t.forRange("i", d, o, (c) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: c, dataPropType: Ji.Type.Num }, u), s.allErrors || t.if((0, xt.not)(u), () => t.break());
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
const pe = Y, P$ = {
  message: ({ schemaCode: e }) => (0, pe.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, pe._)`{format: ${e}}`
}, N$ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: P$,
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
$o.default = N$;
Object.defineProperty(po, "__esModule", { value: !0 });
const R$ = $o, O$ = [R$.default];
po.default = O$;
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
const I$ = ja, T$ = Aa, j$ = Ha, k$ = so, A$ = io, C$ = fo, D$ = po, Wi = br, M$ = [
  k$.default,
  I$.default,
  T$.default,
  (0, j$.default)(!0),
  D$.default,
  Wi.metadataVocabulary,
  Wi.contentVocabulary,
  A$.default,
  C$.default
];
Ta.default = M$;
var yo = {}, ps = {};
Object.defineProperty(ps, "__esModule", { value: !0 });
ps.DiscrError = void 0;
var Xi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Xi || (ps.DiscrError = Xi = {}));
Object.defineProperty(yo, "__esModule", { value: !0 });
const pr = Y, ea = ps, Yi = Ae, L$ = Nr, V$ = A, F$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ea.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, pr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
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
        if (O != null && O.$ref && !(0, V$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const X = O.$ref;
          if (O = Yi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), O instanceof Yi.SchemaEnv && (O = O.schema), O === void 0)
            throw new L$.default(a.opts.uriResolver, a.baseId, X);
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
}, Ty = {
  $schema: Ey,
  $id: by,
  $vocabulary: Sy,
  $dynamicAnchor: Py,
  title: Ny,
  type: Ry,
  properties: Oy,
  $defs: Iy
}, jy = "https://json-schema.org/draft/2020-12/schema", ky = "https://json-schema.org/draft/2020-12/meta/format-annotation", Ay = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Cy = "meta", Dy = "Format vocabulary meta-schema for annotation results", My = [
  "object",
  "boolean"
], Ly = {
  format: {
    type: "string"
  }
}, Vy = {
  $schema: jy,
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
const rg = Y$, ng = ay, sg = hy, ag = wy, og = Ty, ig = Vy, cg = By, lg = tg, ug = ["/properties"];
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
  const r = Qc, n = Ta, s = yo, a = go, o = "https://json-schema.org/draft/2020-12/schema";
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
  var u = Ze;
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
  var c = Pa();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return c.default;
  } });
  var h = Nr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Js, Js.exports);
var fg = Js.exports, ta = { exports: {} }, Yl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(z, B) {
    return { validate: z, compare: B };
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
    const B = n.exec(z);
    if (!B)
      return !1;
    const se = +B[1], T = +B[2], k = +B[3];
    return T >= 1 && T <= 12 && k >= 1 && k <= (T === 2 && r(se) ? 29 : s[T]);
  }
  function o(z, B) {
    if (z && B)
      return z > B ? 1 : z < B ? -1 : 0;
  }
  const l = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function u(z) {
    return function(se) {
      const T = l.exec(se);
      if (!T)
        return !1;
      const k = +T[1], L = +T[2], D = +T[3], K = T[4], M = T[5] === "-" ? -1 : 1, P = +(T[6] || 0), p = +(T[7] || 0);
      if (P > 23 || p > 59 || z && !K)
        return !1;
      if (k <= 23 && L <= 59 && D < 60)
        return !0;
      const S = L - p * M, $ = k - P * M - (S < 0 ? 1 : 0);
      return ($ === 23 || $ === -1) && (S === 59 || S === -1) && D < 61;
    };
  }
  function d(z, B) {
    if (!(z && B))
      return;
    const se = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf(), T = (/* @__PURE__ */ new Date("2020-01-01T" + B)).valueOf();
    if (se && T)
      return se - T;
  }
  function c(z, B) {
    if (!(z && B))
      return;
    const se = l.exec(z), T = l.exec(B);
    if (se && T)
      return z = se[1] + se[2] + se[3], B = T[1] + T[2] + T[3], z > B ? 1 : z < B ? -1 : 0;
  }
  const h = /t|\s/i;
  function b(z) {
    const B = u(z);
    return function(T) {
      const k = T.split(h);
      return k.length === 2 && a(k[0]) && B(k[1]);
    };
  }
  function _(z, B) {
    if (!(z && B))
      return;
    const se = new Date(z).valueOf(), T = new Date(B).valueOf();
    if (se && T)
      return se - T;
  }
  function w(z, B) {
    if (!(z && B))
      return;
    const [se, T] = z.split(h), [k, L] = B.split(h), D = o(se, k);
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
})(Yl);
var Ql = {}, ra = { exports: {} }, Zl = {}, xe = {}, Sr = {}, un = {}, ee = {}, on = {};
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
})(on);
var na = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = on;
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
  const t = on, r = na;
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
        const j = E[I];
        j.optimizeNames(i, f) || (k(i, j.names), E.splice(I, 1));
      }
      return E.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => B(i, f.names), {});
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
      return se(i, this.condition), this.else && B(i, this.else.names), i;
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
      return B(super.names, this.iteration.names);
    }
  }
  class R extends v {
    constructor(i, f, E, I) {
      super(), this.varKind = i, this.name = f, this.from = E, this.to = I;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: E, from: I, to: j } = this;
      return `for(${f} ${E}=${I}; ${E}<${j}; ${E}++)` + super.render(i);
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
      return B(super.names, this.iterable.names);
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
      return this.catch && B(i, this.catch.names), this.finally && B(i, this.finally.names), i;
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
      const j = this._scope.toName(f);
      return E !== void 0 && I && (this._constants[j.str] = E), this._leafNode(new o(i, j, E)), j;
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
    forRange(i, f, E, I, j = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const F = this._scope.toName(i);
      return this._for(new R(j, F, f, E), () => I(F));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, E, I = r.varKinds.const) {
      const j = this._scope.toName(i);
      if (this.opts.es5) {
        const F = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${F}.length`, (V) => {
          this.var(j, (0, t._)`${F}[${V}]`), E(j);
        });
      }
      return this._for(new O("of", I, j, f), () => E(j));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, E, I = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, E);
      const j = this._scope.toName(i);
      return this._for(new O("in", I, j, f), () => E(j));
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
        const j = this.name("e");
        this._currNode = I.catch = new me(j), f(j);
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
  function B($, i) {
    for (const f in i)
      $[f] = ($[f] || 0) + (i[f] || 0);
    return $;
  }
  function se($, i) {
    return i instanceof t._CodeOrName ? B($, i.names) : $;
  }
  function T($, i, f) {
    if ($ instanceof t.Name)
      return E($);
    if (!I($))
      return $;
    return new t._Code($._items.reduce((j, F) => (F instanceof t.Name && (F = E(F)), F instanceof t._Code ? j.push(...F._items) : j.push(F), j), []));
    function E(j) {
      const F = f[j.str];
      return F === void 0 || i[j.str] !== 1 ? j : (delete i[j.str], F);
    }
    function I(j) {
      return j instanceof t._Code && j._items.some((F) => F instanceof t.Name && i[F.str] === 1 && f[F.str] !== void 0);
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
})(ee);
var C = {};
Object.defineProperty(C, "__esModule", { value: !0 });
C.checkStrictMode = C.getErrorPath = C.Type = C.useFunc = C.setEvaluated = C.evaluatedPropsToName = C.mergeEvaluated = C.eachItem = C.unescapeJsonPointer = C.escapeJsonPointer = C.escapeFragment = C.unescapeFragment = C.schemaRefOrVal = C.schemaHasRulesButRef = C.schemaHasRules = C.checkUnknownRules = C.alwaysValidSchema = C.toHash = void 0;
const ce = ee, hg = on;
function mg(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = mg;
function pg(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (xl(e, t), !eu(t, e.self.RULES.all));
}
C.alwaysValidSchema = pg;
function xl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || nu(e, `unknown keyword: "${a}"`);
}
C.checkUnknownRules = xl;
function eu(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
C.schemaHasRules = eu;
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
  return tu(decodeURIComponent(e));
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
function tu(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = tu;
function vg(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = vg;
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
    resultToName: ru
  }),
  items: Qi({
    mergeNames: (e, t, r) => e.if((0, ce._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, ce._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, ce._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, ce._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function ru(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, ce._)`{}`);
  return t !== void 0 && vo(e, r, t), r;
}
C.evaluatedPropsToName = ru;
function vo(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ce._)`${t}${(0, ce.getProperty)(n)}`, !0));
}
C.setEvaluated = vo;
const Zi = {};
function wg(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Zi[t.code] || (Zi[t.code] = new hg._Code(t.code))
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
function nu(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = nu;
var lt = {};
Object.defineProperty(lt, "__esModule", { value: !0 });
const Oe = ee, bg = {
  // validation function arguments
  data: new Oe.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Oe.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Oe.Name("instancePath"),
  parentData: new Oe.Name("parentData"),
  parentDataProperty: new Oe.Name("parentDataProperty"),
  rootData: new Oe.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Oe.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Oe.Name("vErrors"),
  // null or array of validation errors
  errors: new Oe.Name("errors"),
  // counter of validation errors
  this: new Oe.Name("this"),
  // "globals"
  self: new Oe.Name("self"),
  scope: new Oe.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Oe.Name("json"),
  jsonPos: new Oe.Name("jsonPos"),
  jsonLen: new Oe.Name("jsonLen"),
  jsonPart: new Oe.Name("jsonPart")
};
lt.default = bg;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ee, r = C, n = lt;
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
const Sg = un, Pg = ee, Ng = lt, Rg = {
  message: "boolean schema is false"
};
function Og(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? su(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Ng.default.data) : (t.assign((0, Pg._)`${n}.errors`, null), t.return(!0));
}
Sr.topBoolOrEmptySchema = Og;
function Ig(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), su(e)) : r.var(t, !0);
}
Sr.boolOrEmptySchema = Ig;
function su(e, t) {
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
var _e = {}, or = {};
Object.defineProperty(or, "__esModule", { value: !0 });
or.getRules = or.isJSONType = void 0;
const Tg = ["string", "number", "integer", "boolean", "null", "object", "array"], jg = new Set(Tg);
function kg(e) {
  return typeof e == "string" && jg.has(e);
}
or.isJSONType = kg;
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
or.getRules = Ag;
var pt = {};
Object.defineProperty(pt, "__esModule", { value: !0 });
pt.shouldUseRule = pt.shouldUseGroup = pt.schemaHasRulesForType = void 0;
function Cg({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && au(e, n);
}
pt.schemaHasRulesForType = Cg;
function au(e, t) {
  return t.rules.some((r) => ou(e, r));
}
pt.shouldUseGroup = au;
function ou(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
pt.shouldUseRule = ou;
Object.defineProperty(_e, "__esModule", { value: !0 });
_e.reportTypeError = _e.checkDataTypes = _e.checkDataType = _e.coerceAndCheckDataType = _e.getJSONTypes = _e.getSchemaTypes = _e.DataType = void 0;
const Dg = or, Mg = pt, Lg = un, Z = ee, iu = C;
var vr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(vr || (_e.DataType = vr = {}));
function Vg(e) {
  const t = cu(e.type);
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
function cu(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Dg.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
_e.getJSONTypes = cu;
function Fg(e, t) {
  const { gen: r, data: n, opts: s } = e, a = zg(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Mg.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = wo(t, n, s.strictNumbers, vr.Wrong);
    r.if(l, () => {
      a.length ? Ug(e, t, a) : Eo(e);
    });
  }
  return o;
}
_e.coerceAndCheckDataType = Fg;
const lu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function zg(e, t) {
  return t ? e.filter((r) => lu.has(r) || t === "array" && r === "array") : [];
}
function Ug(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Z._)`typeof ${s}`), l = n.let("coerced", (0, Z._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Z._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Z._)`${s}[0]`).assign(o, (0, Z._)`typeof ${s}`).if(wo(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Z._)`${l} !== undefined`);
  for (const d of r)
    (lu.has(d) || d === "array" && a.coerceTypes === "array") && u(d);
  n.else(), Eo(e), n.endIf(), n.if((0, Z._)`${l} !== undefined`, () => {
    n.assign(s, l), qg(e, l);
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
function qg({ gen: e, parentData: t, parentDataProperty: r }, n) {
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
  const a = (0, iu.toHash)(e);
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
const Gg = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Z._)`{type: ${e}}` : (0, Z._)`{type: ${t}}`
};
function Eo(e) {
  const t = Kg(e);
  (0, Lg.reportError)(t, Gg);
}
_e.reportTypeError = Eo;
function Kg(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, iu.schemaRefOrVal)(e, n, "type");
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
const ur = ee, Hg = C;
function Bg(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      xi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => xi(e, a, s.default));
}
$s.assignDefaults = Bg;
function xi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, ur._)`${a}${(0, ur.getProperty)(t)}`;
  if (s) {
    (0, Hg.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let u = (0, ur._)`${l} === undefined`;
  o.useDefaults === "empty" && (u = (0, ur._)`${u} || ${l} === null || ${l} === ""`), n.if(u, (0, ur._)`${l} = ${(0, ur.stringify)(r)}`);
}
var ct = {}, re = {};
Object.defineProperty(re, "__esModule", { value: !0 });
re.validateUnion = re.validateArray = re.usePattern = re.callValidateCode = re.schemaProperties = re.allSchemaProperties = re.noPropertyInData = re.propertyInData = re.isOwnProperty = re.hasPropFunc = re.reportMissingProp = re.checkMissingProp = re.checkReportMissingProp = void 0;
const ue = ee, bo = C, St = lt, Jg = C;
function Wg(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Po(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ue._)`${t}` }, !0), e.error();
  });
}
re.checkReportMissingProp = Wg;
function Xg({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((a) => (0, ue.and)(Po(e, t, a, r.ownProperties), (0, ue._)`${s} = ${a}`)));
}
re.checkMissingProp = Xg;
function Yg(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
re.reportMissingProp = Yg;
function uu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
re.hasPropFunc = uu;
function So(e, t, r) {
  return (0, ue._)`${uu(e)}.call(${t}, ${r})`;
}
re.isOwnProperty = So;
function Qg(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${So(e, t, r)}` : s;
}
re.propertyInData = Qg;
function Po(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(So(e, t, r))) : s;
}
re.noPropertyInData = Po;
function du(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
re.allSchemaProperties = du;
function Zg(e, t) {
  return du(t).filter((r) => !(0, bo.alwaysValidSchema)(e, t[r]));
}
re.schemaProperties = Zg;
function xg({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, u, d) {
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
re.callValidateCode = xg;
const e0 = (0, ue._)`new RegExp`;
function t0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ue._)`${s.code === "new RegExp" ? e0 : (0, Jg.useFunc)(e, s)}(${r}, ${n})`
  });
}
re.usePattern = t0;
function r0(e) {
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
re.validateArray = r0;
function n0(e) {
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
re.validateUnion = n0;
Object.defineProperty(ct, "__esModule", { value: !0 });
ct.validateKeywordUsage = ct.validSchemaType = ct.funcKeywordCode = ct.macroKeywordCode = void 0;
const ke = ee, er = lt, s0 = re, a0 = un;
function o0(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), u = fu(r, n, l);
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
ct.macroKeywordCode = o0;
function i0(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: u } = e;
  l0(u, t);
  const d = !l && t.compile ? t.compile.call(u.self, a, o, u) : t.validate, c = fu(n, s, d), h = n.let("valid");
  e.block$data(h, b), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function b() {
    if (t.errors === !1)
      g(), t.modifying && ec(e), y(() => e.error());
    else {
      const m = t.async ? _() : w();
      t.modifying && ec(e), y(() => c0(e, m));
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
    n.assign(h, (0, ke._)`${m}${(0, s0.callValidateCode)(e, c, v, N)}`, t.modifying);
  }
  function y(m) {
    var v;
    n.if((0, ke.not)((v = t.valid) !== null && v !== void 0 ? v : h), m);
  }
}
ct.funcKeywordCode = i0;
function ec(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, ke._)`${n.parentData}[${n.parentDataProperty}]`));
}
function c0(e, t) {
  const { gen: r } = e;
  r.if((0, ke._)`Array.isArray(${t})`, () => {
    r.assign(er.default.vErrors, (0, ke._)`${er.default.vErrors} === null ? ${t} : ${er.default.vErrors}.concat(${t})`).assign(er.default.errors, (0, ke._)`${er.default.vErrors}.length`), (0, a0.extendErrors)(e);
  }, () => e.error());
}
function l0({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function fu(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, ke.stringify)(r) });
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
    const u = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(u);
    else
      throw new Error(u);
  }
}
ct.validateKeywordUsage = d0;
var kt = {};
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.extendSubschemaMode = kt.extendSubschemaData = kt.getSubschema = void 0;
const at = ee, hu = C;
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
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, hu.escapeFragment)(r)}`
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
kt.getSubschema = f0;
function h0(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: c, opts: h } = t, b = l.let("data", (0, at._)`${t.data}${(0, at.getProperty)(r)}`, !0);
    u(b), e.errorPath = (0, at.str)`${d}${(0, hu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, at._)`${r}`, e.dataPathArr = [...c, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof at.Name ? s : l.let("data", s, !0);
    u(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function u(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
kt.extendSubschemaData = h0;
function m0(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
kt.extendSubschemaMode = m0;
var Pe = {}, mu = { exports: {} }, Tt = mu.exports = function(e, t, r) {
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
            Fn(e, t, r, h[_], s + "/" + c + "/" + p0(_), a, s, c, n, _);
      } else (c in Tt.keywords || e.allKeys && !(c in Tt.skipKeywords)) && Fn(e, t, r, h, s + "/" + c, a, s, c, n);
    }
    r(n, s, a, o, l, u, d);
  }
}
function p0(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var $0 = mu.exports;
Object.defineProperty(Pe, "__esModule", { value: !0 });
Pe.getSchemaRefs = Pe.resolveUrl = Pe.normalizeId = Pe._getFullPath = Pe.getFullPath = Pe.inlineRef = void 0;
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
  return typeof e == "boolean" ? !0 : t === !0 ? !oa(e) : t ? pu(e) <= t : !1;
}
Pe.inlineRef = w0;
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
function pu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !v0.has(r) && (typeof e[r] == "object" && (0, y0.eachItem)(e[r], (n) => t += pu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function $u(e, t = "", r) {
  r !== !1 && (t = wr(t));
  const n = e.parse(t);
  return yu(e, n);
}
Pe.getFullPath = $u;
function yu(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Pe._getFullPath = yu;
const b0 = /#\/?$/;
function wr(e) {
  return e ? e.replace(b0, "") : "";
}
Pe.normalizeId = wr;
function S0(e, t, r) {
  return r = wr(r), e.resolve(t, r);
}
Pe.resolveUrl = S0;
const P0 = /^[a-z_][-a-z0-9._]*$/i;
function N0(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = wr(e[r] || t), a = { "": s }, o = $u(n, s, !1), l = {}, u = /* @__PURE__ */ new Set();
  return _0(e, { allKeys: !0 }, (h, b, _, w) => {
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
        if (!P0.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, b, _) {
    if (b !== void 0 && !g0(h, b))
      throw c(_);
  }
  function c(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Pe.getSchemaRefs = N0;
Object.defineProperty(xe, "__esModule", { value: !0 });
xe.getData = xe.KeywordCxt = xe.validateFunctionCode = void 0;
const gu = Sr, tc = _e, No = pt, xn = _e, R0 = $s, en = ct, Ds = kt, q = ee, W = lt, O0 = Pe, $t = C, Gr = un;
function I0(e) {
  if (wu(e) && (Eu(e), vu(e))) {
    k0(e);
    return;
  }
  _u(e, () => (0, gu.topBoolOrEmptySchema)(e));
}
xe.validateFunctionCode = I0;
function _u({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${W.default.data}, ${W.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${rc(r, s)}`), j0(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${W.default.data}, ${T0(s)}`, n.$async, () => e.code(rc(r, s)).code(a));
}
function T0(e) {
  return (0, q._)`{${W.default.instancePath}="", ${W.default.parentData}, ${W.default.parentDataProperty}, ${W.default.rootData}=${W.default.data}${e.dynamicRef ? (0, q._)`, ${W.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function j0(e, t) {
  e.if(W.default.valCxt, () => {
    e.var(W.default.instancePath, (0, q._)`${W.default.valCxt}.${W.default.instancePath}`), e.var(W.default.parentData, (0, q._)`${W.default.valCxt}.${W.default.parentData}`), e.var(W.default.parentDataProperty, (0, q._)`${W.default.valCxt}.${W.default.parentDataProperty}`), e.var(W.default.rootData, (0, q._)`${W.default.valCxt}.${W.default.rootData}`), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, q._)`${W.default.valCxt}.${W.default.dynamicAnchors}`);
  }, () => {
    e.var(W.default.instancePath, (0, q._)`""`), e.var(W.default.parentData, (0, q._)`undefined`), e.var(W.default.parentDataProperty, (0, q._)`undefined`), e.var(W.default.rootData, W.default.data), t.dynamicRef && e.var(W.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function k0(e) {
  const { schema: t, opts: r, gen: n } = e;
  _u(e, () => {
    r.$comment && t.$comment && Su(e), L0(e), n.let(W.default.vErrors, null), n.let(W.default.errors, 0), r.unevaluated && A0(e), bu(e), z0(e);
  });
}
function A0(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function rc(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function C0(e, t) {
  if (wu(e) && (Eu(e), vu(e))) {
    D0(e, t);
    return;
  }
  (0, gu.boolOrEmptySchema)(e, t);
}
function vu({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function wu(e) {
  return typeof e.schema != "boolean";
}
function D0(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Su(e), V0(e), F0(e);
  const a = n.const("_errs", W.default.errors);
  bu(e, a), n.var(t, (0, q._)`${a} === ${W.default.errors}`);
}
function Eu(e) {
  (0, $t.checkUnknownRules)(e), M0(e);
}
function bu(e, t) {
  if (e.opts.jtd)
    return nc(e, [], !1, t);
  const r = (0, tc.getSchemaTypes)(e.schema), n = (0, tc.coerceAndCheckDataType)(e, r);
  nc(e, r, !n, t);
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
function Su({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${W.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${W.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
function z0(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${W.default.errors} === 0`, () => t.return(W.default.data), () => t.throw((0, q._)`new ${s}(${W.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, W.default.vErrors), a.unevaluated && U0(e), t.return((0, q._)`${W.default.errors} === 0`));
}
function U0({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function nc(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: u, self: d } = e, { RULES: c } = d;
  if (a.$ref && (u.ignoreKeywordsWithRef || !(0, $t.schemaHasRulesButRef)(a, c))) {
    s.block(() => Ru(e, "$ref", c.all.$ref.definition));
    return;
  }
  u.jtd || q0(e, t), s.block(() => {
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
  s && (0, R0.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, No.shouldUseRule)(n, a) && Ru(e, a.keyword, a.definition, t.type);
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
      Pu(e.dataTypes, r) || Ro(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
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
function Pu(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function J0(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Pu(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Ro(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, $t.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Nu {
  constructor(t, r, n) {
    if ((0, en.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, $t.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Ou(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, en.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
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
    (t ? Gr.reportExtraError : Gr.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Gr.reportError)(this, this.def.$dataError || Gr.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Gr.resetErrorsCount)(this.gen, this.errsCount);
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
xe.KeywordCxt = Nu;
function Ru(e, t, r, n) {
  const s = new Nu(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, en.funcKeywordCode)(s, r) : "macro" in r ? (0, en.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, en.funcKeywordCode)(s, r);
}
const W0 = /^\/(?:[^~]|~0|~1)*$/, X0 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Ou(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return W.default.rootData;
  if (e[0] === "/") {
    if (!W0.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = W.default.rootData;
  } else {
    const d = X0.exec(e);
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
xe.getData = Ou;
var dn = {};
Object.defineProperty(dn, "__esModule", { value: !0 });
class Y0 extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
dn.default = Y0;
var jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
const Ms = Pe;
class Q0 extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ms.resolveUrl)(t, r, n), this.missingSchema = (0, Ms.normalizeId)((0, Ms.getFullPath)(t, this.missingRef));
  }
}
jr.default = Q0;
var Le = {};
Object.defineProperty(Le, "__esModule", { value: !0 });
Le.resolveSchema = Le.getCompilingSchema = Le.resolveRef = Le.compileSchema = Le.SchemaEnv = void 0;
const Be = ee, Z0 = dn, Xt = lt, Ye = Pe, ac = C, x0 = xe;
class ys {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Ye.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Le.SchemaEnv = ys;
function Oo(e) {
  const t = Iu.call(this, e);
  if (t)
    return t;
  const r = (0, Ye.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Be.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: Z0.default,
    code: (0, Be._)`require("ajv/dist/runtime/validation_error").default`
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
    dataPathArr: [Be.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Be.stringify)(e.schema) } : { ref: e.schema }),
    validateName: u,
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
  let c;
  try {
    this._compilations.add(e), (0, x0.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    c = `${o.scopeRefs(Xt.default.scope)}return ${h}`, this.opts.code.process && (c = this.opts.code.process(c, e));
    const _ = new Function(`${Xt.default.self}`, `${Xt.default.scope}`, c)(this, this.scope.get());
    if (this.scope.value(u, { ref: _ }), _.errors = null, _.schema = e.schema, _.schemaEnv = e, e.$async && (_.$async = !0), this.opts.code.source === !0 && (_.source = { validateName: u, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: w, items: g } = d;
      _.evaluated = {
        props: w instanceof Be.Name ? void 0 : w,
        items: g instanceof Be.Name ? void 0 : g,
        dynamicProps: w instanceof Be.Name,
        dynamicItems: g instanceof Be.Name
      }, _.source && (_.source.evaluated = (0, Be.stringify)(_.evaluated));
    }
    return e.validate = _, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, c && this.logger.error("Error compiling schema, function code:", c), h;
  } finally {
    this._compilations.delete(e);
  }
}
Le.compileSchema = Oo;
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
Le.resolveRef = e_;
function t_(e) {
  return (0, Ye.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Oo.call(this, e);
}
function Iu(e) {
  for (const t of this._compilations)
    if (r_(t, e))
      return t;
}
Le.getCompilingSchema = Iu;
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
      const { schema: l } = o, { schemaId: u } = this.opts, d = l[u];
      return d && (s = (0, Ye.resolveUrl)(this.opts.uriResolver, s, d)), new ys({ schema: l, schemaId: u, root: e, baseId: s });
    }
    return Ls.call(this, r, o);
  }
}
Le.resolveSchema = gs;
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
    const u = r[(0, ac.unescapeFragment)(l)];
    if (u === void 0)
      return;
    r = u;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !s_.has(l) && d && (t = (0, Ye.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, ac.schemaHasRulesButRef)(r, this.RULES)) {
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
const Tu = Fl;
Tu.code = 'require("ajv/dist/runtime/uri").default';
Io.default = Tu;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = xe;
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
  const n = dn, s = jr, a = or, o = Le, l = ee, u = Pe, d = _e, c = C, h = d_, b = Io, _ = (P, p) => new RegExp(P, p);
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
    var p, S, $, i, f, E, I, j, F, V, ne, Ve, Ct, Dt, Mt, Lt, Vt, Ft, zt, Ut, qt, Gt, Kt, Ht, Bt;
    const Ke = P.strict, Jt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Dr = Jt === !0 || Jt === void 0 ? 1 : Jt || 0, Mr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ns = (i = P.uriResolver) !== null && i !== void 0 ? i : b.default;
    return {
      strictSchema: (E = (f = P.strictSchema) !== null && f !== void 0 ? f : Ke) !== null && E !== void 0 ? E : !0,
      strictNumbers: (j = (I = P.strictNumbers) !== null && I !== void 0 ? I : Ke) !== null && j !== void 0 ? j : !0,
      strictTypes: (V = (F = P.strictTypes) !== null && F !== void 0 ? F : Ke) !== null && V !== void 0 ? V : "log",
      strictTuples: (Ve = (ne = P.strictTuples) !== null && ne !== void 0 ? ne : Ke) !== null && Ve !== void 0 ? Ve : "log",
      strictRequired: (Dt = (Ct = P.strictRequired) !== null && Ct !== void 0 ? Ct : Ke) !== null && Dt !== void 0 ? Dt : !1,
      code: P.code ? { ...P.code, optimize: Dr, regExp: Mr } : { optimize: Dr, regExp: Mr },
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
      uriResolver: Ns
    };
  }
  class R {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...N(p) };
      const { es5: S, lines: $ } = this.opts.code;
      this.scope = new l.ValueScope({ scope: {}, prefixes: g, es5: S, lines: $ }), this.logger = B(p.logger);
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
        const Ve = this._addSchema(V, ne);
        return Ve.validate || E.call(this, Ve);
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
          return I.call(this, ne), await j.call(this, ne.missingSchema), E.call(this, V);
        }
      }
      function I({ missingSchema: V, missingRef: ne }) {
        if (this.refs[V])
          throw new Error(`AnySchema ${V} is loaded but ${ne} cannot be resolved`);
      }
      async function j(V) {
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
        return (0, c.eachItem)($, (f) => k.call(this, f)), this;
      D.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, c.eachItem)($, i.type.length === 0 ? (f) => k.call(this, f, i) : (f) => i.type.forEach((E) => k.call(this, f, i, E))), this;
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
          const j = $[I];
          if (typeof j != "object")
            continue;
          const { $data: F } = j.definition, V = E[I];
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
      let j = this._cache.get(p);
      if (j !== void 0)
        return j;
      $ = (0, u.normalizeId)(E || $);
      const F = u.getSchemaRefs.call(this, p, $);
      return j = new o.SchemaEnv({ schema: p, schemaId: I, meta: S, baseId: $, localRefs: F }), this._cache.set(j.schema, j), f && !$.startsWith("#") && ($ && this._checkUnique($), this.refs[$] = j), i && this.validateSchema(p, !0), j;
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
  function B(P) {
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
  function k(P, p, S) {
    var $;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let E = i ? f.post : f.rules.find(({ type: j }) => j === S);
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
    p.before ? L.call(this, E, I, p.before) : E.rules.push(I), f.all[P] = I, ($ = p.implements) === null || $ === void 0 || $.forEach((j) => this.addKeyword(j));
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
})(Zl);
var To = {}, jo = {}, ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const f_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ko.default = f_;
var ir = {};
Object.defineProperty(ir, "__esModule", { value: !0 });
ir.callRef = ir.getValidate = void 0;
const h_ = jr, oc = re, Me = ee, dr = lt, ic = Le, En = C, m_ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: u } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const c = ic.resolveRef.call(u, d, s, r);
    if (c === void 0)
      throw new h_.default(n.opts.uriResolver, s, r);
    if (c instanceof ic.SchemaEnv)
      return b(c);
    return _(c);
    function h() {
      if (a === d)
        return zn(e, o, a, a.$async);
      const w = t.scopeValue("root", { ref: d });
      return zn(e, (0, Me._)`${w}.validate`, d, d.$async);
    }
    function b(w) {
      const g = ju(e, w);
      zn(e, g, w, w.$async);
    }
    function _(w) {
      const g = t.scopeValue("schema", l.code.source === !0 ? { ref: w, code: (0, Me.stringify)(w) } : { ref: w }), y = t.name("valid"), m = e.subschema({
        schema: w,
        dataTypes: [],
        schemaPath: Me.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function ju(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Me._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
ir.getValidate = ju;
function zn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: u } = a, d = u.passContext ? dr.default.this : Me.nil;
  n ? c() : h();
  function c() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const w = s.let("valid");
    s.try(() => {
      s.code((0, Me._)`await ${(0, oc.callValidateCode)(e, t, d)}`), _(t), o || s.assign(w, !0);
    }, (g) => {
      s.if((0, Me._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), b(g), o || s.assign(w, !1);
    }), e.ok(w);
  }
  function h() {
    e.result((0, oc.callValidateCode)(e, t, d), () => _(t), () => b(t));
  }
  function b(w) {
    const g = (0, Me._)`${w}.errors`;
    s.assign(dr.default.vErrors, (0, Me._)`${dr.default.vErrors} === null ? ${g} : ${dr.default.vErrors}.concat(${g})`), s.assign(dr.default.errors, (0, Me._)`${dr.default.vErrors}.length`);
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
        const m = s.var("props", (0, Me._)`${w}.evaluated.props`);
        a.props = En.mergeEvaluated.props(s, m, a.props, Me.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = En.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Me._)`${w}.evaluated.items`);
        a.items = En.mergeEvaluated.items(s, m, a.items, Me.Name);
      }
  }
}
ir.callRef = zn;
ir.default = m_;
Object.defineProperty(jo, "__esModule", { value: !0 });
const p_ = ko, $_ = ir, y_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  p_.default,
  $_.default
];
jo.default = y_;
var Ao = {}, Co = {};
Object.defineProperty(Co, "__esModule", { value: !0 });
const es = ee, Pt = es.operators, ts = {
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
const tn = ee, v_ = {
  message: ({ schemaCode: e }) => (0, tn.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, tn._)`{multipleOf: ${e}}`
}, w_ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: v_,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, tn._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, tn._)`${o} !== parseInt(${o})`;
    e.fail$data((0, tn._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Do.default = w_;
var Mo = {}, Lo = {};
Object.defineProperty(Lo, "__esModule", { value: !0 });
function ku(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Lo.default = ku;
ku.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Mo, "__esModule", { value: !0 });
const tr = ee, E_ = C, b_ = Lo, S_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, tr.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, tr._)`{limit: ${e}}`
}, P_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: S_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? tr.operators.GT : tr.operators.LT, o = s.opts.unicode === !1 ? (0, tr._)`${r}.length` : (0, tr._)`${(0, E_.useFunc)(e.gen, b_.default)}(${r})`;
    e.fail$data((0, tr._)`${o} ${a} ${n}`);
  }
};
Mo.default = P_;
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const N_ = re, rs = ee, R_ = {
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
const rn = ee, I_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, rn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, rn._)`{limit: ${e}}`
}, T_ = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: I_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? rn.operators.GT : rn.operators.LT;
    e.fail$data((0, rn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Fo.default = T_;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const Kr = re, nn = ee, j_ = C, k_ = {
  message: ({ params: { missingProperty: e } }) => (0, nn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, nn._)`{missingProperty: ${e}}`
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
        e.block$data(nn.nil, h);
      else
        for (const _ of r)
          (0, Kr.checkReportMissingProp)(e, _);
    }
    function c() {
      const _ = t.let("missing");
      if (u || a) {
        const w = t.let("valid", !0);
        e.block$data(w, () => b(_, w)), e.ok(w);
      } else
        t.if((0, Kr.checkMissingProp)(e, r, _)), (0, Kr.reportMissingProp)(e, _), t.else();
    }
    function h() {
      t.forOf("prop", n, (_) => {
        e.setParams({ missingProperty: _ }), t.if((0, Kr.noPropertyInData)(t, s, _, l.ownProperties), () => e.error());
      });
    }
    function b(_, w) {
      e.setParams({ missingProperty: _ }), t.forOf(_, n, () => {
        t.assign(w, (0, Kr.propertyInData)(t, s, _, l.ownProperties)), t.if((0, nn.not)(w), () => {
          e.error(), t.break();
        });
      }, nn.nil);
    }
  }
};
zo.default = A_;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const sn = ee, C_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, sn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, sn._)`{limit: ${e}}`
}, D_ = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: C_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? sn.operators.GT : sn.operators.LT;
    e.fail$data((0, sn._)`${r}.length ${s} ${n}`);
  }
};
Uo.default = D_;
var qo = {}, fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
const Au = ls;
Au.code = 'require("ajv/dist/runtime/equal").default';
fn.default = Au;
Object.defineProperty(qo, "__esModule", { value: !0 });
const Vs = _e, Ee = ee, M_ = C, L_ = fn, V_ = {
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
      const y = (0, M_.useFunc)(t, L_.default), m = t.name("outer");
      t.label(m).for((0, Ee._)`;${w}--;`, () => t.for((0, Ee._)`${g} = ${w}; ${g}--;`, () => t.if((0, Ee._)`${y}(${r}[${w}], ${r}[${g}])`, () => {
        e.error(), t.assign(u, !1).break(m);
      })));
    }
  }
};
qo.default = F_;
var Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const ia = ee, z_ = C, U_ = fn, q_ = {
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
const Wr = ee, K_ = C, H_ = fn, B_ = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Wr._)`{allowedValues: ${e}}`
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
    let u;
    const d = () => u ?? (u = (0, K_.useFunc)(t, H_.default));
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
var Ho = {}, kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.validateAdditionalItems = void 0;
const rr = ee, ca = C, av = {
  message: ({ params: { len: e } }) => (0, rr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, rr._)`{limit: ${e}}`
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
    Cu(e, n);
  }
};
function Cu(e, t) {
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
kr.validateAdditionalItems = Cu;
kr.default = ov;
var Bo = {}, Ar = {};
Object.defineProperty(Ar, "__esModule", { value: !0 });
Ar.validateTuple = void 0;
const cc = ee, Un = C, iv = re, cv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Du(e, "additionalItems", t);
    r.items = !0, !(0, Un.alwaysValidSchema)(r, t) && e.ok((0, iv.validateArray)(e));
  }
};
function Du(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  c(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = Un.mergeEvaluated.items(n, r.length, l.items));
  const u = n.name("valid"), d = n.const("len", (0, cc._)`${a}.length`);
  r.forEach((h, b) => {
    (0, Un.alwaysValidSchema)(l, h) || (n.if((0, cc._)`${d} > ${b}`, () => e.subschema({
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
Ar.validateTuple = Du;
Ar.default = cv;
Object.defineProperty(Bo, "__esModule", { value: !0 });
const lv = Ar, uv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, lv.validateTuple)(e, "items")
};
Bo.default = uv;
var Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const lc = ee, dv = C, fv = re, hv = kr, mv = {
  message: ({ params: { len: e } }) => (0, lc.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, lc._)`{limit: ${e}}`
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
const Ge = ee, bn = C, $v = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge.str)`must contain at least ${e} valid item(s)` : (0, Ge.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge._)`{minContains: ${e}}` : (0, Ge._)`{minContains: ${e}, maxContains: ${t}}`
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
    const { minContains: u, maxContains: d } = n;
    a.opts.next ? (o = u === void 0 ? 1 : u, l = d) : o = 1;
    const c = t.const("len", (0, Ge._)`${s}.length`);
    if (e.setParams({ min: o, max: l }), l === void 0 && o === 0) {
      (0, bn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, bn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, bn.alwaysValidSchema)(a, r)) {
      let g = (0, Ge._)`${c} >= ${o}`;
      l !== void 0 && (g = (0, Ge._)`${g} && ${c} <= ${l}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    l === void 0 && o === 1 ? _(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), l !== void 0 && t.if((0, Ge._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
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
      t.code((0, Ge._)`${g}++`), l === void 0 ? t.if((0, Ge._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ge._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ge._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Wo.default = yv;
var Mu = {};
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
})(Mu);
var Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const Lu = ee, gv = C, _v = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Lu._)`{propertyName: ${e.propertyName}}`
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
      }, a), t.if((0, Lu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Xo.default = vv;
var _s = {};
Object.defineProperty(_s, "__esModule", { value: !0 });
const Sn = re, We = ee, wv = lt, Pn = C, Ev = {
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
    const { allErrors: l, opts: u } = o;
    if (o.props = !0, u.removeAdditional !== "all" && (0, Pn.alwaysValidSchema)(o, r))
      return;
    const d = (0, Sn.allSchemaProperties)(n.properties), c = (0, Sn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, We._)`${a} === ${wv.default.errors}`);
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
_s.default = bv;
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const Sv = xe, uc = re, Fs = C, dc = _s, Pv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && dc.default.code(new Sv.KeywordCxt(a, dc.default, "additionalProperties"));
    const o = (0, uc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Fs.mergeEvaluated.props(t, (0, Fs.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Fs.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const u = t.name("valid");
    for (const h of l)
      d(h) ? c(h) : (t.if((0, uc.propertyInData)(t, s, h, a.opts.ownProperties)), c(h), a.allErrors || t.else().var(u, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(u);
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
Yo.default = Pv;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const fc = re, Nn = ee, hc = C, mc = C, Nv = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, fc.allSchemaProperties)(r), u = l.filter((g) => (0, hc.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || u.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, c = t.name("valid");
    a.props !== !0 && !(a.props instanceof Nn.Name) && (a.props = (0, mc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    b();
    function b() {
      for (const g of l)
        d && _(g), a.allErrors ? w(g) : (t.var(c, !0), w(g), t.if(c));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, hc.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function w(g) {
      t.forIn("key", n, (y) => {
        t.if((0, Nn._)`${(0, fc.usePattern)(e, g)}.test(${y})`, () => {
          const m = u.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: mc.Type.Str
          }, c), a.opts.unevaluated && h !== !0 ? t.assign((0, Nn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, Nn.not)(c), () => t.break());
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
const Iv = re, Tv = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Iv.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
xo.default = Tv;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const qn = ee, jv = C, kv = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, qn._)`{passingSchemas: ${e.passing}}`
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
const ns = ee, Vu = C, Mv = {
  message: ({ params: e }) => (0, ns.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, ns._)`{failingKeyword: ${e.ifClause}}`
}, Lv = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Mv,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Vu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = pc(n, "then"), a = pc(n, "else");
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
function pc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Vu.alwaysValidSchema)(e, r);
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
const zv = kr, Uv = Bo, qv = Ar, Gv = Jo, Kv = Wo, Hv = Mu, Bv = Xo, Jv = _s, Wv = Yo, Xv = Qo, Yv = Zo, Qv = xo, Zv = ei, xv = ti, ew = ri, tw = ni;
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
const $e = ee, nw = {
  message: ({ schemaCode: e }) => (0, $e.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, $e._)`{format: ${e}}`
}, sw = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: nw,
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
ai.default = sw;
Object.defineProperty(si, "__esModule", { value: !0 });
const aw = ai, ow = [aw.default];
si.default = ow;
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
Object.defineProperty(To, "__esModule", { value: !0 });
const iw = jo, cw = Ao, lw = Ho, uw = si, $c = Pr, dw = [
  iw.default,
  cw.default,
  (0, lw.default)(),
  uw.default,
  $c.metadataVocabulary,
  $c.contentVocabulary
];
To.default = dw;
var oi = {}, vs = {};
Object.defineProperty(vs, "__esModule", { value: !0 });
vs.DiscrError = void 0;
var yc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(yc || (vs.DiscrError = yc = {}));
Object.defineProperty(oi, "__esModule", { value: !0 });
const $r = ee, la = vs, gc = Le, fw = jr, hw = C, mw = {
  message: ({ params: { discrError: e, tagName: t } }) => e === la.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, $r._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
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
        if (O != null && O.$ref && !(0, hw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const X = O.$ref;
          if (O = gc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, X), O instanceof gc.SchemaEnv && (O = O.schema), O === void 0)
            throw new fw.default(a.opts.uriResolver, a.baseId, X);
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
  const r = Zl, n = To, s = oi, a = Ew, o = ["/properties"], l = "http://json-schema.org/draft-07/schema";
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
  var d = xe;
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
  var h = dn;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var b = jr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return b.default;
  } });
})(ra, ra.exports);
var bw = ra.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = bw, r = ee, n = r.operators, s = {
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
})(Ql);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Yl, n = Ql, s = ee, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), l = (d, c = { keywords: !0 }) => {
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
var Sw = ta.exports;
const Pw = /* @__PURE__ */ Yc(Sw), Nw = (e, t, r, n) => {
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
${t}`, Tw = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), jw = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), kw = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = Iw.bind(null, n, t.toString());
  Object.defineProperty(s, "name", jw);
  const { writable: a, enumerable: o, configurable: l } = Tw;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: l });
};
function Aw(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Nw(e, t, s, r);
  return Ow(e, t), kw(e, t, n), e;
}
const _c = (e, t = {}) => {
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
  return Aw(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), l && (clearTimeout(l), l = void 0);
  }, d;
};
var ua = { exports: {} };
const Cw = "2.0.0", Fu = 256, Dw = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Mw = 16, Lw = Fu - 6, Vw = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ws = {
  MAX_LENGTH: Fu,
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
var hn = ua.exports;
const zw = Object.freeze({ loose: !0 }), Uw = Object.freeze({}), qw = (e) => e ? typeof e != "object" ? zw : e : Uw;
var ii = qw;
const vc = /^[0-9]+$/, zu = (e, t) => {
  const r = vc.test(e), n = vc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, Gw = (e, t) => zu(t, e);
var Uu = {
  compareIdentifiers: zu,
  rcompareIdentifiers: Gw
};
const Rn = Es, { MAX_LENGTH: wc, MAX_SAFE_INTEGER: On } = ws, { safeRe: In, t: Tn } = hn, Kw = ii, { compareIdentifiers: fr } = Uu;
let Hw = class nt {
  constructor(t, r) {
    if (r = Kw(r), t instanceof nt) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > wc)
      throw new TypeError(
        `version is longer than ${wc} characters`
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
    if (Rn("SemVer.compare", this.version, this.options, t), !(t instanceof nt)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new nt(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof nt || (t = new nt(t, this.options)), fr(this.major, t.major) || fr(this.minor, t.minor) || fr(this.patch, t.patch);
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
    t instanceof nt || (t = new nt(t, this.options));
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
var Ce = Hw;
const Ec = Ce, Bw = (e, t, r = !1) => {
  if (e instanceof Ec)
    return e;
  try {
    return new Ec(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Cr = Bw;
const Jw = Cr, Ww = (e, t) => {
  const r = Jw(e, t);
  return r ? r.version : null;
};
var Xw = Ww;
const Yw = Cr, Qw = (e, t) => {
  const r = Yw(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Zw = Qw;
const bc = Ce, xw = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new bc(
      e instanceof bc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var eE = xw;
const Sc = Cr, tE = (e, t) => {
  const r = Sc(e, null, !0), n = Sc(t, null, !0), s = r.compare(n);
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
var rE = tE;
const nE = Ce, sE = (e, t) => new nE(e, t).major;
var aE = sE;
const oE = Ce, iE = (e, t) => new oE(e, t).minor;
var cE = iE;
const lE = Ce, uE = (e, t) => new lE(e, t).patch;
var dE = uE;
const fE = Cr, hE = (e, t) => {
  const r = fE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var mE = hE;
const Pc = Ce, pE = (e, t, r) => new Pc(e, r).compare(new Pc(t, r));
var tt = pE;
const $E = tt, yE = (e, t, r) => $E(t, e, r);
var gE = yE;
const _E = tt, vE = (e, t) => _E(e, t, !0);
var wE = vE;
const Nc = Ce, EE = (e, t, r) => {
  const n = new Nc(e, r), s = new Nc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var ci = EE;
const bE = ci, SE = (e, t) => e.sort((r, n) => bE(r, n, t));
var PE = SE;
const NE = ci, RE = (e, t) => e.sort((r, n) => NE(n, r, t));
var OE = RE;
const IE = tt, TE = (e, t, r) => IE(e, t, r) > 0;
var bs = TE;
const jE = tt, kE = (e, t, r) => jE(e, t, r) < 0;
var li = kE;
const AE = tt, CE = (e, t, r) => AE(e, t, r) === 0;
var qu = CE;
const DE = tt, ME = (e, t, r) => DE(e, t, r) !== 0;
var Gu = ME;
const LE = tt, VE = (e, t, r) => LE(e, t, r) >= 0;
var ui = VE;
const FE = tt, zE = (e, t, r) => FE(e, t, r) <= 0;
var di = zE;
const UE = qu, qE = Gu, GE = bs, KE = ui, HE = li, BE = di, JE = (e, t, r, n) => {
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
var Ku = JE;
const WE = Ce, XE = Cr, { safeRe: jn, t: kn } = hn, YE = (e, t) => {
  if (e instanceof WE)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? jn[kn.COERCEFULL] : jn[kn.COERCE]);
  else {
    const u = t.includePrerelease ? jn[kn.COERCERTLFULL] : jn[kn.COERCERTL];
    let d;
    for (; (d = u.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), u.lastIndex = d.index + d[1].length + d[2].length;
    u.lastIndex = -1;
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
var xE = ZE, zs, Rc;
function rt() {
  if (Rc) return zs;
  Rc = 1;
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
      const D = ((this.options.includePrerelease && _) | (this.options.loose && w)) + ":" + k, K = n.get(D);
      if (K)
        return K;
      const M = this.options.loose, P = M ? u[d.HYPHENRANGELOOSE] : u[d.HYPHENRANGE];
      k = k.replace(P, B(this.options.includePrerelease)), o("hyphen replace", k), k = k.replace(u[d.COMPARATORTRIM], c), o("comparator trim", k), k = k.replace(u[d.TILDETRIM], h), o("tilde trim", k), k = k.replace(u[d.CARETTRIM], b), o("caret trim", k);
      let p = k.split(" ").map((f) => v(f, this.options)).join(" ").split(/\s+/).map((f) => z(f, this.options));
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
        if (se(this.set[L], k, this.options))
          return !0;
      return !1;
    }
  }
  zs = t;
  const r = xE, n = new r(), s = ii, a = Ss(), o = Es, l = Ce, {
    safeRe: u,
    t: d,
    comparatorTrimReplace: c,
    tildeTrimReplace: h,
    caretTrimReplace: b
  } = hn, { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: w } = ws, g = (T) => T.value === "<0.0.0-0", y = (T) => T.value === "", m = (T, k) => {
    let L = !0;
    const D = T.slice();
    let K = D.pop();
    for (; L && D.length; )
      L = D.every((M) => K.intersects(M, k)), K = D.pop();
    return L;
  }, v = (T, k) => (o("comp", T, k), T = G(T, k), o("caret", T), T = R(T, k), o("tildes", T), T = de(T, k), o("xrange", T), T = ye(T, k), o("stars", T), T), N = (T) => !T || T.toLowerCase() === "x" || T === "*", R = (T, k) => T.trim().split(/\s+/).map((L) => O(L, k)).join(" "), O = (T, k) => {
    const L = k.loose ? u[d.TILDELOOSE] : u[d.TILDE];
    return T.replace(L, (D, K, M, P, p) => {
      o("tilde", T, D, K, M, P, p);
      let S;
      return N(K) ? S = "" : N(M) ? S = `>=${K}.0.0 <${+K + 1}.0.0-0` : N(P) ? S = `>=${K}.${M}.0 <${K}.${+M + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${K}.${M}.${P}-${p} <${K}.${+M + 1}.0-0`) : S = `>=${K}.${M}.${P} <${K}.${+M + 1}.0-0`, o("tilde return", S), S;
    });
  }, G = (T, k) => T.trim().split(/\s+/).map((L) => X(L, k)).join(" "), X = (T, k) => {
    o("caret", T, k);
    const L = k.loose ? u[d.CARETLOOSE] : u[d.CARET], D = k.includePrerelease ? "-0" : "";
    return T.replace(L, (K, M, P, p, S) => {
      o("caret", T, K, M, P, p, S);
      let $;
      return N(M) ? $ = "" : N(P) ? $ = `>=${M}.0.0${D} <${+M + 1}.0.0-0` : N(p) ? M === "0" ? $ = `>=${M}.${P}.0${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.0${D} <${+M + 1}.0.0-0` : S ? (o("replaceCaret pr", S), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}-${S} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}-${S} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p}-${S} <${+M + 1}.0.0-0`) : (o("no pr"), M === "0" ? P === "0" ? $ = `>=${M}.${P}.${p}${D} <${M}.${P}.${+p + 1}-0` : $ = `>=${M}.${P}.${p}${D} <${M}.${+P + 1}.0-0` : $ = `>=${M}.${P}.${p} <${+M + 1}.0.0-0`), o("caret return", $), $;
    });
  }, de = (T, k) => (o("replaceXRanges", T, k), T.split(/\s+/).map((L) => me(L, k)).join(" ")), me = (T, k) => {
    T = T.trim();
    const L = k.loose ? u[d.XRANGELOOSE] : u[d.XRANGE];
    return T.replace(L, (D, K, M, P, p, S) => {
      o("xRange", T, D, K, M, P, p, S);
      const $ = N(M), i = $ || N(P), f = i || N(p), E = f;
      return K === "=" && E && (K = ""), S = k.includePrerelease ? "-0" : "", $ ? K === ">" || K === "<" ? D = "<0.0.0-0" : D = "*" : K && E ? (i && (P = 0), p = 0, K === ">" ? (K = ">=", i ? (M = +M + 1, P = 0, p = 0) : (P = +P + 1, p = 0)) : K === "<=" && (K = "<", i ? M = +M + 1 : P = +P + 1), K === "<" && (S = "-0"), D = `${K + M}.${P}.${p}${S}`) : i ? D = `>=${M}.0.0${S} <${+M + 1}.0.0-0` : f && (D = `>=${M}.${P}.0${S} <${M}.${+P + 1}.0-0`), o("xRange return", D), D;
    });
  }, ye = (T, k) => (o("replaceStars", T, k), T.trim().replace(u[d.STAR], "")), z = (T, k) => (o("replaceGTE0", T, k), T.trim().replace(u[k.includePrerelease ? d.GTE0PRE : d.GTE0], "")), B = (T) => (k, L, D, K, M, P, p, S, $, i, f, E) => (N(D) ? L = "" : N(K) ? L = `>=${D}.0.0${T ? "-0" : ""}` : N(M) ? L = `>=${D}.${K}.0${T ? "-0" : ""}` : P ? L = `>=${L}` : L = `>=${L}${T ? "-0" : ""}`, N($) ? S = "" : N(i) ? S = `<${+$ + 1}.0.0-0` : N(f) ? S = `<${$}.${+i + 1}.0-0` : E ? S = `<=${$}.${i}.${f}-${E}` : T ? S = `<${$}.${i}.${+f + 1}-0` : S = `<=${S}`, `${L} ${S}`.trim()), se = (T, k, L) => {
    for (let D = 0; D < T.length; D++)
      if (!T[D].test(k))
        return !1;
    if (k.prerelease.length && !L.includePrerelease) {
      for (let D = 0; D < T.length; D++)
        if (o(T[D].semver), T[D].semver !== a.ANY && T[D].semver.prerelease.length > 0) {
          const K = T[D].semver;
          if (K.major === k.major && K.minor === k.minor && K.patch === k.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return zs;
}
var Us, Oc;
function Ss() {
  if (Oc) return Us;
  Oc = 1;
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
  const r = ii, { safeRe: n, t: s } = hn, a = Ku, o = Es, l = Ce, u = rt();
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
const ab = Ce, ob = rt(), ib = (e, t, r) => {
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
const lb = Ce, ub = rt(), db = (e, t, r) => {
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
const qs = Ce, hb = rt(), Ic = bs, mb = (e, t) => {
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
          (!a || Ic(l, a)) && (a = l);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || Ic(r, a)) && (r = a);
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
const _b = Ce, Hu = Ss(), { ANY: vb } = Hu, wb = rt(), Eb = Ps, Tc = bs, jc = li, bb = di, Sb = ui, Pb = (e, t, r, n) => {
  e = new _b(e, n), t = new wb(t, n);
  let s, a, o, l, u;
  switch (r) {
    case ">":
      s = Tc, a = bb, o = jc, l = ">", u = ">=";
      break;
    case "<":
      s = jc, a = Sb, o = Tc, l = "<", u = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Eb(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const c = t.set[d];
    let h = null, b = null;
    if (c.forEach((_) => {
      _.semver === vb && (_ = new Hu(">=0.0.0")), h = h || _, b = b || _, s(_.semver, h.semver, n) ? h = _ : o(_.semver, b.semver, n) && (b = _);
    }), h.operator === l || h.operator === u || (!b.operator || b.operator === l) && a(e, b.semver))
      return !1;
    if (b.operator === u && o(e, b.semver))
      return !1;
  }
  return !0;
};
var fi = Pb;
const Nb = fi, Rb = (e, t, r) => Nb(e, t, ">", r);
var Ob = Rb;
const Ib = fi, Tb = (e, t, r) => Ib(e, t, "<", r);
var jb = Tb;
const kc = rt(), kb = (e, t, r) => (e = new kc(e, r), t = new kc(t, r), e.intersects(t, r));
var Ab = kb;
const Cb = Ps, Db = tt;
var Mb = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((c, h) => Db(c, h, r));
  for (const c of o)
    Cb(c, t, r) ? (a = c, s || (s = c)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const l = [];
  for (const [c, h] of n)
    c === h ? l.push(c) : !h && c === o[0] ? l.push("*") : h ? c === o[0] ? l.push(`<=${h}`) : l.push(`${c} - ${h}`) : l.push(`>=${c}`);
  const u = l.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return u.length < d.length ? u : t;
};
const Ac = rt(), hi = Ss(), { ANY: Gs } = hi, Hr = Ps, mi = tt, Lb = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Ac(e, r), t = new Ac(t, r);
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
}, Vb = [new hi(">=0.0.0-0")], Cc = [new hi(">=0.0.0")], Fb = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Gs) {
    if (t.length === 1 && t[0].semver === Gs)
      return !0;
    r.includePrerelease ? e = Vb : e = Cc;
  }
  if (t.length === 1 && t[0].semver === Gs) {
    if (r.includePrerelease)
      return !0;
    t = Cc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const _ of e)
    _.operator === ">" || _.operator === ">=" ? s = Dc(s, _, r) : _.operator === "<" || _.operator === "<=" ? a = Mc(a, _, r) : n.add(_.semver);
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
    if (s && !Hr(_, String(s), r) || a && !Hr(_, String(a), r))
      return null;
    for (const w of t)
      if (!Hr(_, String(w), r))
        return !1;
    return !0;
  }
  let l, u, d, c, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, b = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const _ of t) {
    if (c = c || _.operator === ">" || _.operator === ">=", d = d || _.operator === "<" || _.operator === "<=", s) {
      if (b && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === b.major && _.semver.minor === b.minor && _.semver.patch === b.patch && (b = !1), _.operator === ">" || _.operator === ">=") {
        if (l = Dc(s, _, r), l === _ && l !== s)
          return !1;
      } else if (s.operator === ">=" && !Hr(s.semver, String(_), r))
        return !1;
    }
    if (a) {
      if (h && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === h.major && _.semver.minor === h.minor && _.semver.patch === h.patch && (h = !1), _.operator === "<" || _.operator === "<=") {
        if (u = Mc(a, _, r), u === _ && u !== a)
          return !1;
      } else if (a.operator === "<=" && !Hr(a.semver, String(_), r))
        return !1;
    }
    if (!_.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && c && !s && o !== 0 || b || h);
}, Dc = (e, t, r) => {
  if (!e)
    return t;
  const n = mi(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Mc = (e, t, r) => {
  if (!e)
    return t;
  const n = mi(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var zb = Lb;
const Ks = hn, Lc = ws, Ub = Ce, Vc = Uu, qb = Cr, Gb = Xw, Kb = Zw, Hb = eE, Bb = rE, Jb = aE, Wb = cE, Xb = dE, Yb = mE, Qb = tt, Zb = gE, xb = wE, e1 = ci, t1 = PE, r1 = OE, n1 = bs, s1 = li, a1 = qu, o1 = Gu, i1 = ui, c1 = di, l1 = Ku, u1 = QE, d1 = Ss(), f1 = rt(), h1 = Ps, m1 = sb, p1 = cb, $1 = fb, y1 = pb, g1 = gb, _1 = fi, v1 = Ob, w1 = jb, E1 = Ab, b1 = Mb, S1 = zb;
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
  SEMVER_SPEC_VERSION: Lc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Lc.RELEASE_TYPES,
  compareIdentifiers: Vc.compareIdentifiers,
  rcompareIdentifiers: Vc.rcompareIdentifiers
};
const hr = /* @__PURE__ */ Yc(P1), N1 = Object.prototype.toString, R1 = "[object Uint8Array]", O1 = "[object ArrayBuffer]";
function Bu(e, t, r) {
  return e ? e.constructor === t ? !0 : N1.call(e) === r : !1;
}
function Ju(e) {
  return Bu(e, Uint8Array, R1);
}
function I1(e) {
  return Bu(e, ArrayBuffer, O1);
}
function T1(e) {
  return Ju(e) || I1(e);
}
function j1(e) {
  if (!Ju(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function k1(e) {
  if (!T1(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Fc(e, t) {
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
function zc(e, t = "utf8") {
  return k1(e), An[t] ?? (An[t] = new globalThis.TextDecoder(t)), An[t].decode(e);
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
const D1 = Pw.default, Uc = "aes-256-cbc", mr = () => /* @__PURE__ */ Object.create(null), M1 = (e) => e != null, L1 = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Gn = "__internal__", Bs = `${Gn}.migrations.version`;
var Ot, dt, ze, ft;
class V1 {
  constructor(t = {}) {
    Lr(this, "path");
    Lr(this, "events");
    Vr(this, Ot);
    Vr(this, dt);
    Vr(this, ze);
    Vr(this, ft, {});
    Lr(this, "_deserialize", (t) => JSON.parse(t));
    Lr(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
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
      r.cwd = ld(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (Fr(this, ze, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
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
      Fr(this, Ot, o.compile(l));
      for (const [u, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (fe(this, ft)[u] = d.default);
    }
    r.defaults && Fr(this, ft, {
      ...fe(this, ft),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), Fr(this, dt, r.encryptionKey);
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
      xu.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (fe(this, ze).accessPropertiesByDotNotation)
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
      L1(a, o), fe(this, ze).accessPropertiesByDotNotation ? yi(n, a, o) : n[a] = o;
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
    return fe(this, ze).accessPropertiesByDotNotation ? ad(this.store, t) : t in this.store;
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
    fe(this, ze).accessPropertiesByDotNotation ? sd(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = mr();
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
      const t = x.readFileSync(this.path, fe(this, dt) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(mr(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), mr();
      if (fe(this, ze).clearInvalidConfig && t.name === "SyntaxError")
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
    if (!fe(this, dt))
      return typeof t == "string" ? t : zc(t);
    try {
      const r = t.slice(0, 16), n = zr.pbkdf2Sync(fe(this, dt), r.toString(), 1e4, 32, "sha512"), s = zr.createDecipheriv(Uc, n, r), a = t.slice(17), o = typeof a == "string" ? Hs(a) : a;
      return zc(Fc([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Zu(o, a) || (n = o, r.call(this, o, a));
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
    if (fe(this, dt)) {
      const n = zr.randomBytes(16), s = zr.pbkdf2Sync(fe(this, dt), n.toString(), 1e4, 32, "sha512"), a = zr.createCipheriv(Uc, s, n);
      r = Fc([n, Hs(":"), a.update(Hs(r)), a.final()]);
    }
    if (ve.env.SNAP)
      x.writeFileSync(this.path, r, { mode: fe(this, ze).configFileMode });
    else
      try {
        Xc(this.path, r, { mode: fe(this, ze).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          x.writeFileSync(this.path, r, { mode: fe(this, ze).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), x.existsSync(this.path) || this._write(mr()), ve.platform === "win32" ? x.watch(this.path, { persistent: !1 }, _c(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : x.watchFile(this.path, { persistent: !1 }, _c(() => {
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
    return typeof t == "object" && Object.keys(t)[0] === Gn ? !0 : typeof t != "string" ? !1 : fe(this, ze).accessPropertiesByDotNotation ? !!t.startsWith(`${Gn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return hr.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && hr.satisfies(r, t) ? !1 : hr.satisfies(n, t) : !(hr.lte(t, r) || hr.gt(t, n));
  }
  _get(t, r) {
    return nd(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    yi(n, t, r), this.store = n;
  }
}
Ot = new WeakMap(), dt = new WeakMap(), ze = new WeakMap(), ft = new WeakMap();
const { app: Kn, ipcMain: da, shell: F1 } = Kc;
let qc = !1;
const Gc = () => {
  if (!da || !Kn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Kn.getPath("userData"),
    appVersion: Kn.getVersion()
  };
  return qc || (da.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), qc = !0), e;
};
class z1 extends V1 {
  constructor(t) {
    let r, n;
    if (ve.type === "renderer") {
      const s = Kc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else da && Kn && ({ defaultCwd: r, appVersion: n } = Gc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = ae.isAbsolute(t.cwd) ? t.cwd : ae.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Gc();
  }
  async openInEditor() {
    const t = await F1.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const mn = oe.dirname(ed(import.meta.url));
process.env.APP_ROOT = oe.join(mn, "..");
const fa = process.env.VITE_DEV_SERVER_URL, oS = oe.join(process.env.APP_ROOT, "dist-electron"), Wu = oe.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = fa ? oe.join(process.env.APP_ROOT, "public") : Wu;
let H, Hn = null;
const Qe = /* @__PURE__ */ new Map();
let be = null;
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
  const e = await Hc.showOpenDialog(H, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
et.handle("select-file", async () => {
  const e = await Hc.showOpenDialog(H, {
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
      const r = new Bc({
        width: 800,
        height: 600,
        show: !0,
        webPreferences: {
          preload: oe.join(mn, "preload.mjs"),
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
function U1() {
  return oe.join("backend", "index.js");
}
et.handle(
  "start-fork",
  async (e, { script: t, args: r = [] } = {}) => {
    let n;
    if (t ? n = t : n = U1(), !nr.existsSync(n))
      return console.error("Backend script não encontrado:", n), { ok: !1, reason: "backend-script-not-found" };
    try {
      const s = os(n, r, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: oe.dirname(n),
        silent: !1,
        env: { ...process.env }
      }), a = s.pid;
      if (console.log("Child process forked with PID:", a), typeof a == "number")
        Qe.set(a, s), console.log(
          "Child process added to children map. Total children:",
          Qe.size
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
          console.error("Child process error:", c), typeof s.pid == "number" && Qe.delete(s.pid), clearTimeout(u), l(c);
        }), s.on("exit", (c, h) => {
          console.log(
            `Child process ${s.pid} exited with code ${c} and signal ${h}`
          ), typeof s.pid == "number" && Qe.delete(s.pid), H && !H.isDestroyed() && H.webContents.send("child-exit", {
            pid: s.pid,
            code: c,
            signal: h
          }), clearTimeout(u), l(new Error(`Child process exited with code ${c}`));
        }), s.on("message", (c) => {
          console.log("Message from child:", c), !(c && typeof c == "object" && "type" in c && c.type === "websocket-port") && H && !H.isDestroyed() && H.webContents.send("child-message", { pid: s.pid, msg: c });
        }), s.stdout && s.stdout.on("data", (c) => {
          console.log("Child stdout:", c.toString()), H && !H.isDestroyed() && H.webContents.send("child-stdout", {
            pid: s.pid,
            data: c.toString()
          });
        }), s.stderr && s.stderr.on("data", (c) => {
          console.error("Child stderr:", c.toString()), H && !H.isDestroyed() && H.webContents.send("child-stderr", {
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
et.handle(
  "start-collector-fork",
  async (e, { args: t = [] } = {}) => {
    let r;
    if (At.isPackaged)
      r = oe.join(process.resourcesPath, "backend", "dist", "collector", "runner.js");
    else {
      const n = oe.dirname(oe.dirname(mn));
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
      return typeof s == "number" && (Qe.set(s, n), n.on("message", (a) => {
        H && !H.isDestroyed() && H.webContents.send("child-message", { pid: s, msg: a });
      }), n.stdout && n.stdout.on("data", (a) => {
        H && !H.isDestroyed() && H.webContents.send("child-stdout", { pid: s, data: a.toString() });
      }), n.stderr && n.stderr.on("data", (a) => {
        H && !H.isDestroyed() && H.webContents.send("child-stderr", { pid: s, data: a.toString() });
      })), { ok: !0, pid: s };
    } catch (n) {
      return { ok: !1, reason: String(n) };
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
      if (console.log("Child not found for PID:", t), Hn)
        try {
          const s = oe.dirname(Hn), a = os(Hn, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: s,
            silent: !1,
            env: { ...process.env }
          }), o = a.pid;
          if (typeof o == "number") {
            Qe.set(o, a), H && !H.isDestroyed() && H.webContents.send("child-message", {
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
function q1() {
  if (H = new Bc({
    icon: oe.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: oe.join(mn, "preload.mjs"),
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), H.maximize(), H.setMenu(null), H.webContents.on("did-finish-load", () => {
    H == null || H.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), fa)
    H.loadURL(fa);
  else
    try {
      const e = oe.join(
        process.resourcesPath,
        "dist",
        "index.html"
      );
      if (console.log("[main] loading packaged index from", e), nr.existsSync(e))
        H.loadFile(e);
      else {
        const t = oe.join(Wu, "index.html");
        console.warn(
          "[main] packaged index not found at",
          e,
          "falling back to",
          t
        ), H.loadFile(t);
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
        console.log("[main] attempting alt loadFile", t), H.loadFile(t);
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
At.whenReady().then(() => {
  (async () => {
    if (At.isPackaged) {
      const e = oe.join(
        process.resourcesPath,
        "backend",
        "index.js"
      );
      nr.existsSync(e) && (console.log("[main] spawning backend exe at", e), be = td("node", [e], {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
        cwd: oe.dirname(e),
        env: { ...process.env },
        shell: !1
      }), be.on("error", (t) => {
        console.error("[main] spawned backend error:", t), be = null;
      }), be.on("exit", (t, r) => {
        console.log(
          `[main] spawned backend exited with code ${t} and signal ${r}`
        ), be = null, H && !H.isDestroyed() && H.webContents.send("child-exit", { pid: be == null ? void 0 : be.pid, code: t, signal: r });
      }), be.stdout && (be.stdout.on("data", (t) => {
        console.log("[spawned backend stdout]", t.toString()), H && !H.isDestroyed() && H.webContents.send("child-stdout", {
          pid: be == null ? void 0 : be.pid,
          data: t.toString()
        });
      }), console.log("[main] spawned backend stdout attached")));
    } else
      try {
        const e = await G1();
        if (e)
          console.log("[main] backend is already running, not auto-forking");
        else {
          console.log(
            "[main] backend not responding, will attempt to auto-fork"
          );
          const t = oe.dirname(oe.dirname(mn)), n = [
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
              typeof o == "number" && (Qe.set(o, a), console.log("[main] dev backend forked with PID", o)), a.on("message", (l) => {
                H && !H.isDestroyed() && H.webContents.send("child-message", {
                  pid: a.pid,
                  msg: l
                });
              }), a.stdout && a.stdout.on("data", (l) => {
                console.log("[child stdout]", l.toString()), H && !H.isDestroyed() && H.webContents.send("child-stdout", {
                  pid: a.pid,
                  data: l.toString()
                });
              }), a.stderr && a.stderr.on("data", (l) => {
                console.error("[child stderr]", l.toString()), H && !H.isDestroyed() && H.webContents.send("child-stderr", {
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
      } catch (e) {
        console.warn(
          "[main] failed to auto-fork backend in dev:",
          e.message || e
        );
      }
    q1();
  })();
});
At.on("window-all-closed", () => {
  process.platform !== "darwin" && At.quit();
});
At.on("before-quit", () => {
  try {
    be && !be.killed && (be.kill(), be = null);
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, e] of Qe.entries())
    try {
      e.kill("SIGTERM");
    } catch {
    }
});
const K1 = oe.join(At.getPath("userData"), "error.log"), Xu = nr.createWriteStream(K1, { flags: "a" });
process.on("uncaughtException", (e) => {
  Xu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`
  );
});
process.on("unhandledRejection", (e) => {
  Xu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`
  );
});
et.handle(
  "save-pdf",
  async (e, t) => {
    try {
      const r = At.getPath("temp"), n = oe.join(r, `relatorio-${Date.now()}.pdf`), s = Buffer.from(t, "base64");
      return nr.writeFileSync(n, s), { ok: !0, path: n };
    } catch (r) {
      return console.error("Failed to save pdf from renderer:", r), { ok: !1, error: String(r) };
    }
  }
);
export {
  oS as MAIN_DIST,
  Wu as RENDERER_DIST,
  fa as VITE_DEV_SERVER_URL
};
