var Yu = Object.defineProperty;
var pi = (e) => {
  throw TypeError(e);
};
var Qu = (e, t, r) => t in e ? Yu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Mr = (e, t, r) => Qu(e, typeof t != "symbol" ? t + "" : t, r), $i = (e, t, r) => t.has(e) || pi("Cannot " + r);
var fe = (e, t, r) => ($i(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Lr = (e, t, r) => t.has(e) ? pi("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), Vr = (e, t, r, n) => ($i(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import Hc, { ipcMain as ot, dialog as Bc, BrowserWindow as da, app as sn } from "electron";
import * as ne from "path";
import ve from "node:process";
import oe from "node:path";
import { promisify as Pe, isDeepStrictEqual as Zu } from "node:util";
import Z from "node:fs";
import Fr from "node:crypto";
import xu from "node:assert";
import ss from "node:os";
import Nt from "fs";
import { fileURLToPath as ed } from "url";
import { fork as fa } from "child_process";
const rr = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, Ps = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), td = new Set("0123456789");
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
        if (n === "index" && !td.has(a))
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
function rd(e, t, r) {
  if (!rr(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = as(t);
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
  if (!rr(e) || typeof t != "string")
    return e;
  const n = e, s = as(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Jc(e, o), a === s.length - 1 ? e[o] = r : rr(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function nd(e, t) {
  if (!rr(e) || typeof t != "string")
    return !1;
  const r = as(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Jc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !rr(e))
      return !1;
  }
}
function sd(e, t) {
  if (!rr(e) || typeof t != "string")
    return !1;
  const r = as(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!rr(e) || !(n in e) || ha(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Rt = ss.homedir(), ma = ss.tmpdir(), { env: pr } = ve, ad = (e) => {
  const t = oe.join(Rt, "Library");
  return {
    data: oe.join(t, "Application Support", e),
    config: oe.join(t, "Preferences", e),
    cache: oe.join(t, "Caches", e),
    log: oe.join(t, "Logs", e),
    temp: oe.join(ma, e)
  };
}, od = (e) => {
  const t = pr.APPDATA || oe.join(Rt, "AppData", "Roaming"), r = pr.LOCALAPPDATA || oe.join(Rt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: oe.join(r, e, "Data"),
    config: oe.join(t, e, "Config"),
    cache: oe.join(r, e, "Cache"),
    log: oe.join(r, e, "Log"),
    temp: oe.join(ma, e)
  };
}, id = (e) => {
  const t = oe.basename(Rt);
  return {
    data: oe.join(pr.XDG_DATA_HOME || oe.join(Rt, ".local", "share"), e),
    config: oe.join(pr.XDG_CONFIG_HOME || oe.join(Rt, ".config"), e),
    cache: oe.join(pr.XDG_CACHE_HOME || oe.join(Rt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: oe.join(pr.XDG_STATE_HOME || oe.join(Rt, ".local", "state"), e),
    temp: oe.join(ma, t, e)
  };
};
function cd(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ve.platform === "darwin" ? ad(e) : ve.platform === "win32" ? od(e) : id(e);
}
const gt = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, ct = (e, t) => function(...n) {
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
const fd = new dd(), _t = (e, t) => function(n) {
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
    chmodSync: ct(Z.chmodSync, he.onChangeError),
    chownSync: ct(Z.chownSync, he.onChangeError),
    closeSync: ct(Z.closeSync, Ve),
    existsSync: ct(Z.existsSync, Ve),
    fsyncSync: ct(Z.fsync, Ve),
    mkdirSync: ct(Z.mkdirSync, Ve),
    realpathSync: ct(Z.realpathSync, Ve),
    statSync: ct(Z.statSync, Ve),
    unlinkSync: ct(Z.unlinkSync, Ve)
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
}, hd = "utf8", gi = 438, md = 511, pd = {}, $d = ss.userInfo().uid, yd = ss.userInfo().gid, gd = 1e3, _d = !!ve.getuid;
ve.getuid && ve.getuid();
const _i = 128, vd = (e) => e instanceof Error && "code" in e, vi = (e) => typeof e == "string", Ns = (e) => e === void 0, wd = ve.platform === "linux", Wc = ve.platform === "win32", pa = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Wc || pa.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
wd && pa.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Ed {
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
function Xc(e, t, r = pd) {
  if (vi(r))
    return Xc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? gd) || -1);
  let s = null, a = null, o = null;
  try {
    const l = Oe.attempt.realpathSync(e), c = !!l;
    e = l || e, [a, s] = Ie.get(e, r.tmpCreate || Ie.create, r.tmpPurge !== !1);
    const d = _d && Ns(r.chown), u = Ns(r.mode);
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
    o = Oe.retry.openSync(n)(a, "w", r.mode || gi), r.tmpCreated && r.tmpCreated(a), vi(t) ? Oe.retry.writeSync(n)(o, t, 0, r.encoding || hd) : Ns(t) || Oe.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Oe.retry.fsyncSync(n)(o) : Oe.attempt.fsync(o)), Oe.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== $d || r.chown.gid !== yd) && Oe.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== gi && Oe.attempt.chmodSync(a, r.mode);
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
function Yc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Hs = { exports: {} }, Qc = {}, Ye = {}, wr = {}, cn = {}, X = {}, an = {};
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
var Bs = {};
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
})(Bs);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = an, r = Bs;
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
  var s = Bs;
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
<<<<<<< HEAD
})(X);
var A = {};
Object.defineProperty(A, "__esModule", { value: !0 });
A.checkStrictMode = A.getErrorPath = A.Type = A.useFunc = A.setEvaluated = A.evaluatedPropsToName = A.mergeEvaluated = A.eachItem = A.unescapeJsonPointer = A.escapeJsonPointer = A.escapeFragment = A.unescapeFragment = A.schemaRefOrVal = A.schemaHasRulesButRef = A.schemaHasRules = A.checkUnknownRules = A.alwaysValidSchema = A.toHash = void 0;
const ie = X, Pd = an;
function Nd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
=======
})(codegen$1);
var util$1 = {};
Object.defineProperty(util$1, "__esModule", { value: true });
util$1.checkStrictMode = util$1.getErrorPath = util$1.Type = util$1.useFunc = util$1.setEvaluated = util$1.evaluatedPropsToName = util$1.mergeEvaluated = util$1.eachItem = util$1.unescapeJsonPointer = util$1.escapeJsonPointer = util$1.escapeFragment = util$1.unescapeFragment = util$1.schemaRefOrVal = util$1.schemaHasRulesButRef = util$1.schemaHasRules = util$1.checkUnknownRules = util$1.alwaysValidSchema = util$1.toHash = void 0;
<<<<<<< HEAD
const codegen_1$Y = codegen$1;
const code_1$k = code$3;
=======
const codegen_1$13 = codegen$1;
const code_1$l = code$3;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
function toHash$1(arr) {
  const hash = {};
  for (const item of arr)
    hash[item] = true;
  return hash;
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
A.toHash = Nd;
function Rd(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Zc(e, t), !xc(t, e.self.RULES.all));
}
A.alwaysValidSchema = Rd;
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
  return el(decodeURIComponent(e));
}
A.unescapeFragment = jd;
function Td(e) {
  return encodeURIComponent($a(e));
}
<<<<<<< HEAD
A.escapeFragment = Td;
function $a(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
=======
util$1.schemaHasRulesButRef = schemaHasRulesButRef$1;
function schemaRefOrVal$1({ topSchemaRef, schemaPath }, schema, keyword2, $data) {
  if (!$data) {
    if (typeof schema == "number" || typeof schema == "boolean")
      return schema;
    if (typeof schema == "string")
<<<<<<< HEAD
      return (0, codegen_1$Y._)`${schema}`;
  }
  return (0, codegen_1$Y._)`${topSchemaRef}${schemaPath}${(0, codegen_1$Y.getProperty)(keyword2)}`;
=======
      return (0, codegen_1$13._)`${schema}`;
  }
  return (0, codegen_1$13._)`${topSchemaRef}${schemaPath}${(0, codegen_1$13.getProperty)(keyword2)}`;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
A.escapeJsonPointer = $a;
function el(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
A.unescapeJsonPointer = el;
function kd(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
<<<<<<< HEAD
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
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ie._)`${r} || {}`), ya(e, r, t));
=======
util$1.escapeFragment = escapeFragment$1;
function escapeJsonPointer$1(str) {
  if (typeof str == "number")
    return `${str}`;
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
util$1.escapeJsonPointer = escapeJsonPointer$1;
function unescapeJsonPointer$1(str) {
  return str.replace(/~1/g, "/").replace(/~0/g, "~");
}
util$1.unescapeJsonPointer = unescapeJsonPointer$1;
function eachItem$1(xs, f) {
  if (Array.isArray(xs)) {
    for (const x of xs)
      f(x);
  } else {
    f(xs);
  }
}
util$1.eachItem = eachItem$1;
function makeMergeEvaluated$1({ mergeNames, mergeToName, mergeValues, resultToName }) {
  return (gen, from, to, toName) => {
<<<<<<< HEAD
    const res = to === void 0 ? from : to instanceof codegen_1$Y.Name ? (from instanceof codegen_1$Y.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1$Y.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
    return toName === codegen_1$Y.Name && !(res instanceof codegen_1$Y.Name) ? resultToName(gen, res) : res;
=======
    const res = to === void 0 ? from : to instanceof codegen_1$13.Name ? (from instanceof codegen_1$13.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1$13.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
    return toName === codegen_1$13.Name && !(res instanceof codegen_1$13.Name) ? resultToName(gen, res) : res;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  };
}
util$1.mergeEvaluated = {
  props: makeMergeEvaluated$1({
<<<<<<< HEAD
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$Y._)`${to} !== true && ${from} !== undefined`, () => {
      gen.if((0, codegen_1$Y._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1$Y._)`${to} || {}`).code((0, codegen_1$Y._)`Object.assign(${to}, ${from})`));
    }),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$Y._)`${to} !== true`, () => {
      if (from === true) {
        gen.assign(to, true);
      } else {
        gen.assign(to, (0, codegen_1$Y._)`${to} || {}`);
=======
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true && ${from} !== undefined`, () => {
      gen.if((0, codegen_1$13._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1$13._)`${to} || {}`).code((0, codegen_1$13._)`Object.assign(${to}, ${from})`));
    }),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true`, () => {
      if (from === true) {
        gen.assign(to, true);
      } else {
        gen.assign(to, (0, codegen_1$13._)`${to} || {}`);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
        setEvaluated$1(gen, to, from);
      }
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: tl
  }),
<<<<<<< HEAD
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
=======
  items: makeMergeEvaluated$1({
<<<<<<< HEAD
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$Y._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1$Y._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$Y._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1$Y._)`${to} > ${from} ? ${to} : ${from}`)),
=======
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1$13._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1$13._)`${to} > ${from} ? ${to} : ${from}`)),
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
    mergeValues: (from, to) => from === true ? true : Math.max(from, to),
    resultToName: (gen, items2) => gen.var("items", items2)
  })
};
function evaluatedPropsToName$1(gen, ps) {
  if (ps === true)
    return gen.var("props", true);
<<<<<<< HEAD
  const props = gen.var("props", (0, codegen_1$Y._)`{}`);
=======
  const props = gen.var("props", (0, codegen_1$13._)`{}`);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  if (ps !== void 0)
    setEvaluated$1(gen, props, ps);
  return props;
}
util$1.evaluatedPropsToName = evaluatedPropsToName$1;
function setEvaluated$1(gen, props, ps) {
<<<<<<< HEAD
  Object.keys(ps).forEach((p) => gen.assign((0, codegen_1$Y._)`${props}${(0, codegen_1$Y.getProperty)(p)}`, true));
=======
  Object.keys(ps).forEach((p) => gen.assign((0, codegen_1$13._)`${props}${(0, codegen_1$13.getProperty)(p)}`, true));
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
A.setEvaluated = ya;
const Ei = {};
function Ad(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ei[t.code] || (Ei[t.code] = new Pd._Code(t.code))
  });
}
<<<<<<< HEAD
A.useFunc = Ad;
var Js;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Js || (A.Type = Js = {}));
function Cd(e, t, r) {
  if (e instanceof ie.Name) {
    const n = t === Js.Num;
    return r ? n ? (0, ie._)`"[" + ${e} + "]"` : (0, ie._)`"['" + ${e} + "']"` : n ? (0, ie._)`"/" + ${e}` : (0, ie._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ie.getProperty)(e).toString() : "/" + $a(e);
=======
util$1.useFunc = useFunc$1;
var Type$1;
(function(Type2) {
  Type2[Type2["Num"] = 0] = "Num";
  Type2[Type2["Str"] = 1] = "Str";
})(Type$1 || (util$1.Type = Type$1 = {}));
function getErrorPath$1(dataProp, dataPropType, jsPropertySyntax) {
<<<<<<< HEAD
  if (dataProp instanceof codegen_1$Y.Name) {
    const isNumber = dataPropType === Type$1.Num;
    return jsPropertySyntax ? isNumber ? (0, codegen_1$Y._)`"[" + ${dataProp} + "]"` : (0, codegen_1$Y._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1$Y._)`"/" + ${dataProp}` : (0, codegen_1$Y._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return jsPropertySyntax ? (0, codegen_1$Y.getProperty)(dataProp).toString() : "/" + escapeJsonPointer$1(dataProp);
=======
  if (dataProp instanceof codegen_1$13.Name) {
    const isNumber = dataPropType === Type$1.Num;
    return jsPropertySyntax ? isNumber ? (0, codegen_1$13._)`"[" + ${dataProp} + "]"` : (0, codegen_1$13._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1$13._)`"/" + ${dataProp}` : (0, codegen_1$13._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return jsPropertySyntax ? (0, codegen_1$13.getProperty)(dataProp).toString() : "/" + escapeJsonPointer$1(dataProp);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
A.getErrorPath = Cd;
function rl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
<<<<<<< HEAD
A.checkStrictMode = rl;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
const Ne = X, Dd = {
=======
util$1.checkStrictMode = checkStrictMode$1;
<<<<<<< HEAD
var names$2 = {};
var hasRequiredNames;
function requireNames() {
  if (hasRequiredNames) return names$2;
  hasRequiredNames = 1;
  Object.defineProperty(names$2, "__esModule", { value: true });
  const codegen_12 = codegen$1;
  const names2 = {
    // validation function arguments
    data: new codegen_12.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new codegen_12.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new codegen_12.Name("instancePath"),
    parentData: new codegen_12.Name("parentData"),
    parentDataProperty: new codegen_12.Name("parentDataProperty"),
    rootData: new codegen_12.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new codegen_12.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new codegen_12.Name("vErrors"),
    // null or array of validation errors
    errors: new codegen_12.Name("errors"),
    // counter of validation errors
    this: new codegen_12.Name("this"),
    // "globals"
    self: new codegen_12.Name("self"),
    scope: new codegen_12.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new codegen_12.Name("json"),
    jsonPos: new codegen_12.Name("jsonPos"),
    jsonLen: new codegen_12.Name("jsonLen"),
    jsonPart: new codegen_12.Name("jsonPart")
  };
  names$2.default = names2;
  return names$2;
}
=======
var names$3 = {};
Object.defineProperty(names$3, "__esModule", { value: true });
const codegen_1$12 = codegen$1;
const names$2 = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
<<<<<<< HEAD
ze.default = Dd;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = X, r = A, n = ze;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
=======
names$3.default = names$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
  const codegen_12 = codegen$1;
  const util_12 = util$1;
<<<<<<< HEAD
  const names_12 = requireNames();
=======
  const names_12 = names$3;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  exports.keywordError = {
    message: ({ keyword: keyword2 }) => (0, codegen_12.str)`must pass "${keyword2}" keyword validation`
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
<<<<<<< HEAD
})(cn);
Object.defineProperty(wr, "__esModule", { value: !0 });
wr.boolOrEmptySchema = wr.topBoolOrEmptySchema = void 0;
const Md = cn, Ld = X, Vd = ze, Fd = {
=======
})(errors$1);
<<<<<<< HEAD
var hasRequiredBoolSchema;
function requireBoolSchema() {
  if (hasRequiredBoolSchema) return boolSchema$1;
  hasRequiredBoolSchema = 1;
  Object.defineProperty(boolSchema$1, "__esModule", { value: true });
  boolSchema$1.boolOrEmptySchema = boolSchema$1.topBoolOrEmptySchema = void 0;
  const errors_12 = errors$1;
  const codegen_12 = codegen$1;
  const names_12 = requireNames();
  const boolError2 = {
    message: "boolean schema is false"
  };
  function topBoolOrEmptySchema2(it) {
    const { gen, schema, validateName } = it;
    if (schema === false) {
      falseSchemaError2(it, false);
    } else if (typeof schema == "object" && schema.$async === true) {
      gen.return(names_12.default.data);
    } else {
      gen.assign((0, codegen_12._)`${validateName}.errors`, null);
      gen.return(true);
    }
  }
  boolSchema$1.topBoolOrEmptySchema = topBoolOrEmptySchema2;
  function boolOrEmptySchema2(it, valid2) {
    const { gen, schema } = it;
    if (schema === false) {
      gen.var(valid2, false);
      falseSchemaError2(it);
    } else {
      gen.var(valid2, true);
    }
  }
  boolSchema$1.boolOrEmptySchema = boolOrEmptySchema2;
  function falseSchemaError2(it, overrideAllErrors) {
    const { gen, data } = it;
    const cxt = {
      gen,
      keyword: "false schema",
      data,
      schema: false,
      schemaCode: false,
      schemaValue: false,
      params: {},
      it
    };
    (0, errors_12.reportError)(cxt, boolError2, void 0, overrideAllErrors);
  }
  return boolSchema$1;
=======
Object.defineProperty(boolSchema$1, "__esModule", { value: true });
boolSchema$1.boolOrEmptySchema = boolSchema$1.topBoolOrEmptySchema = void 0;
const errors_1$7 = errors$1;
const codegen_1$11 = codegen$1;
const names_1$g = names$3;
const boolError$1 = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  message: "boolean schema is false"
};
function zd(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? nl(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(Vd.default.data) : (t.assign((0, Ld._)`${n}.errors`, null), t.return(!0));
}
wr.topBoolOrEmptySchema = zd;
function Ud(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), nl(e)) : r.var(t, !0);
}
wr.boolOrEmptySchema = Ud;
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
<<<<<<< HEAD
  (0, Md.reportError)(s, Fd, void 0, t);
=======
  (0, errors_1$7.reportError)(cxt, boolError$1, void 0, overrideAllErrors);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
var ge = {}, nr = {};
Object.defineProperty(nr, "__esModule", { value: !0 });
nr.getRules = nr.isJSONType = void 0;
const qd = ["string", "number", "integer", "boolean", "null", "object", "array"], Gd = new Set(qd);
function Kd(e) {
  return typeof e == "string" && Gd.has(e);
}
nr.isJSONType = Kd;
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
nr.getRules = Hd;
var ft = {};
Object.defineProperty(ft, "__esModule", { value: !0 });
ft.shouldUseRule = ft.shouldUseGroup = ft.schemaHasRulesForType = void 0;
function Bd({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && sl(e, n);
}
ft.schemaHasRulesForType = Bd;
function sl(e, t) {
  return t.rules.some((r) => al(e, r));
}
ft.shouldUseGroup = sl;
function al(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
<<<<<<< HEAD
ft.shouldUseRule = al;
Object.defineProperty(ge, "__esModule", { value: !0 });
ge.reportTypeError = ge.checkDataTypes = ge.checkDataType = ge.coerceAndCheckDataType = ge.getJSONTypes = ge.getSchemaTypes = ge.DataType = void 0;
const Jd = nr, Wd = ft, Xd = cn, Y = X, ol = A;
var $r;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})($r || (ge.DataType = $r = {}));
function Yd(e) {
  const t = il(e.type);
  if (t.includes("null")) {
    if (e.nullable === !1)
=======
applicability$1.shouldUseRule = shouldUseRule$1;
Object.defineProperty(dataType$1, "__esModule", { value: true });
dataType$1.reportTypeError = dataType$1.checkDataTypes = dataType$1.checkDataType = dataType$1.coerceAndCheckDataType = dataType$1.getJSONTypes = dataType$1.getSchemaTypes = dataType$1.DataType = void 0;
const rules_1$1 = rules$1;
<<<<<<< HEAD
const applicability_1$2 = applicability$1;
const errors_1$4 = errors$1;
const codegen_1$X = codegen$1;
const util_1$R = util$1;
=======
const applicability_1$3 = applicability$1;
const errors_1$6 = errors$1;
const codegen_1$10 = codegen$1;
const util_1$V = util$1;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
var DataType$1;
(function(DataType2) {
  DataType2[DataType2["Correct"] = 0] = "Correct";
  DataType2[DataType2["Wrong"] = 1] = "Wrong";
})(DataType$1 || (dataType$1.DataType = DataType$1 = {}));
function getSchemaTypes$1(schema) {
  const types2 = getJSONTypes$1(schema.type);
  const hasNull = types2.includes("null");
  if (hasNull) {
    if (schema.nullable === false)
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!t.length && e.nullable !== void 0)
      throw new Error('"nullable" cannot be used without "type"');
    e.nullable === !0 && t.push("null");
  }
  return t;
}
ge.getSchemaTypes = Yd;
function il(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Jd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
ge.getJSONTypes = il;
function Qd(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Zd(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Wd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = ga(t, n, s.strictNumbers, $r.Wrong);
    r.if(l, () => {
      a.length ? xd(e, t, a) : _a(e);
    });
  }
  return o;
}
ge.coerceAndCheckDataType = Qd;
const cl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Zd(e, t) {
  return t ? e.filter((r) => cl.has(r) || t === "array" && r === "array") : [];
}
<<<<<<< HEAD
function xd(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Y._)`typeof ${s}`), l = n.let("coerced", (0, Y._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Y._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Y._)`${s}[0]`).assign(o, (0, Y._)`typeof ${s}`).if(ga(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Y._)`${l} !== undefined`);
  for (const d of r)
    (cl.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), _a(e), n.endIf(), n.if((0, Y._)`${l} !== undefined`, () => {
    n.assign(s, l), ef(e, l);
=======
function coerceData$1(it, types2, coerceTo) {
  const { gen, data, opts } = it;
<<<<<<< HEAD
  const dataType2 = gen.let("dataType", (0, codegen_1$X._)`typeof ${data}`);
  const coerced = gen.let("coerced", (0, codegen_1$X._)`undefined`);
  if (opts.coerceTypes === "array") {
    gen.if((0, codegen_1$X._)`${dataType2} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1$X._)`${data}[0]`).assign(dataType2, (0, codegen_1$X._)`typeof ${data}`).if(checkDataTypes$1(types2, data, opts.strictNumbers), () => gen.assign(coerced, data)));
  }
  gen.if((0, codegen_1$X._)`${coerced} !== undefined`);
=======
  const dataType2 = gen.let("dataType", (0, codegen_1$10._)`typeof ${data}`);
  const coerced = gen.let("coerced", (0, codegen_1$10._)`undefined`);
  if (opts.coerceTypes === "array") {
    gen.if((0, codegen_1$10._)`${dataType2} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1$10._)`${data}[0]`).assign(dataType2, (0, codegen_1$10._)`typeof ${data}`).if(checkDataTypes$1(types2, data, opts.strictNumbers), () => gen.assign(coerced, data)));
  }
  gen.if((0, codegen_1$10._)`${coerced} !== undefined`);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  for (const t2 of coerceTo) {
    if (COERCIBLE$1.has(t2) || t2 === "array" && opts.coerceTypes === "array") {
      coerceSpecificType(t2);
    }
  }
  gen.else();
  reportTypeError$1(it);
  gen.endIf();
<<<<<<< HEAD
  gen.if((0, codegen_1$X._)`${coerced} !== undefined`, () => {
=======
  gen.if((0, codegen_1$10._)`${coerced} !== undefined`, () => {
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
    gen.assign(data, coerced);
    assignParentData$1(it, coerced);
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  });
  function c(d) {
    switch (d) {
      case "string":
<<<<<<< HEAD
        n.elseIf((0, Y._)`${o} == "number" || ${o} == "boolean"`).assign(l, (0, Y._)`"" + ${s}`).elseIf((0, Y._)`${s} === null`).assign(l, (0, Y._)`""`);
=======
<<<<<<< HEAD
        gen.elseIf((0, codegen_1$X._)`${dataType2} == "number" || ${dataType2} == "boolean"`).assign(coerced, (0, codegen_1$X._)`"" + ${data}`).elseIf((0, codegen_1$X._)`${data} === null`).assign(coerced, (0, codegen_1$X._)`""`);
        return;
      case "number":
        gen.elseIf((0, codegen_1$X._)`${dataType2} == "boolean" || ${data} === null
              || (${dataType2} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1$X._)`+${data}`);
        return;
      case "integer":
        gen.elseIf((0, codegen_1$X._)`${dataType2} === "boolean" || ${data} === null
              || (${dataType2} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1$X._)`+${data}`);
        return;
      case "boolean":
        gen.elseIf((0, codegen_1$X._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1$X._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
        return;
      case "null":
        gen.elseIf((0, codegen_1$X._)`${data} === "" || ${data} === 0 || ${data} === false`);
        gen.assign(coerced, null);
        return;
      case "array":
        gen.elseIf((0, codegen_1$X._)`${dataType2} === "string" || ${dataType2} === "number"
              || ${dataType2} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1$X._)`[${data}]`);
=======
        gen.elseIf((0, codegen_1$10._)`${dataType2} == "number" || ${dataType2} == "boolean"`).assign(coerced, (0, codegen_1$10._)`"" + ${data}`).elseIf((0, codegen_1$10._)`${data} === null`).assign(coerced, (0, codegen_1$10._)`""`);
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
<<<<<<< HEAD
        n.elseIf((0, Y._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(l, (0, Y._)`[${s}]`);
    }
  }
}
function ef({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, Y._)`${t} !== undefined`, () => e.assign((0, Y._)`${t}[${r}]`, n));
=======
        gen.elseIf((0, codegen_1$10._)`${dataType2} === "string" || ${dataType2} === "number"
              || ${dataType2} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1$10._)`[${data}]`);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
    }
  }
}
function assignParentData$1({ gen, parentData, parentDataProperty }, expr) {
<<<<<<< HEAD
  gen.if((0, codegen_1$X._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1$X._)`${parentData}[${parentDataProperty}]`, expr));
}
function checkDataType$1(dataType2, data, strictNums, correct = DataType$1.Correct) {
  const EQ = correct === DataType$1.Correct ? codegen_1$X.operators.EQ : codegen_1$X.operators.NEQ;
  let cond;
  switch (dataType2) {
    case "null":
      return (0, codegen_1$X._)`${data} ${EQ} null`;
    case "array":
      cond = (0, codegen_1$X._)`Array.isArray(${data})`;
      break;
    case "object":
      cond = (0, codegen_1$X._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
      break;
    case "integer":
      cond = numCond((0, codegen_1$X._)`!(${data} % 1) && !isNaN(${data})`);
=======
  gen.if((0, codegen_1$10._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1$10._)`${parentData}[${parentDataProperty}]`, expr));
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
<<<<<<< HEAD
      a = o((0, Y._)`!(${t} % 1) && !isNaN(${t})`);
=======
      cond = numCond((0, codegen_1$10._)`!(${data} % 1) && !isNaN(${data})`);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
      break;
    case "number":
      a = o();
      break;
    default:
<<<<<<< HEAD
      return (0, Y._)`typeof ${t} ${s} ${e}`;
  }
  return n === $r.Correct ? a : (0, Y.not)(a);
  function o(l = Y.nil) {
    return (0, Y.and)((0, Y._)`typeof ${t} == "number"`, l, r ? (0, Y._)`isFinite(${t})` : Y.nil);
  }
}
ge.checkDataType = Ws;
function ga(e, t, r, n) {
  if (e.length === 1)
    return Ws(e[0], t, r, n);
  let s;
  const a = (0, ol.toHash)(e);
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
ge.checkDataTypes = ga;
const tf = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Y._)`{type: ${e}}` : (0, Y._)`{type: ${t}}`
};
function _a(e) {
  const t = rf(e);
  (0, Xd.reportError)(t, tf);
}
ge.reportTypeError = _a;
function rf(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, ol.schemaRefOrVal)(e, n, "type");
=======
<<<<<<< HEAD
      return (0, codegen_1$X._)`typeof ${data} ${EQ} ${dataType2}`;
  }
  return correct === DataType$1.Correct ? cond : (0, codegen_1$X.not)(cond);
  function numCond(_cond = codegen_1$X.nil) {
    return (0, codegen_1$X.and)((0, codegen_1$X._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1$X._)`isFinite(${data})` : codegen_1$X.nil);
=======
      return (0, codegen_1$10._)`typeof ${data} ${EQ} ${dataType2}`;
  }
  return correct === DataType$1.Correct ? cond : (0, codegen_1$10.not)(cond);
  function numCond(_cond = codegen_1$10.nil) {
    return (0, codegen_1$10.and)((0, codegen_1$10._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1$10._)`isFinite(${data})` : codegen_1$10.nil);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  }
}
dataType$1.checkDataType = checkDataType$1;
function checkDataTypes$1(dataTypes, data, strictNums, correct) {
  if (dataTypes.length === 1) {
    return checkDataType$1(dataTypes[0], data, strictNums, correct);
  }
  let cond;
<<<<<<< HEAD
  const types2 = (0, util_1$R.toHash)(dataTypes);
  if (types2.array && types2.object) {
    const notObj = (0, codegen_1$X._)`typeof ${data} != "object"`;
    cond = types2.null ? notObj : (0, codegen_1$X._)`!${data} || ${notObj}`;
=======
  const types2 = (0, util_1$V.toHash)(dataTypes);
  if (types2.array && types2.object) {
    const notObj = (0, codegen_1$10._)`typeof ${data} != "object"`;
    cond = types2.null ? notObj : (0, codegen_1$10._)`!${data} || ${notObj}`;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
    delete types2.null;
    delete types2.array;
    delete types2.object;
  } else {
<<<<<<< HEAD
    cond = codegen_1$X.nil;
=======
    cond = codegen_1$10.nil;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  }
  if (types2.number)
    delete types2.integer;
  for (const t2 in types2)
<<<<<<< HEAD
    cond = (0, codegen_1$X.and)(cond, checkDataType$1(t2, data, strictNums, correct));
=======
    cond = (0, codegen_1$10.and)(cond, checkDataType$1(t2, data, strictNums, correct));
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  return cond;
}
dataType$1.checkDataTypes = checkDataTypes$1;
const typeError$1 = {
  message: ({ schema }) => `must be ${schema}`,
<<<<<<< HEAD
  params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1$X._)`{type: ${schema}}` : (0, codegen_1$X._)`{type: ${schemaValue}}`
};
function reportTypeError$1(it) {
  const cxt = getTypeErrorContext$1(it);
  (0, errors_1$4.reportError)(cxt, typeError$1);
=======
  params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1$10._)`{type: ${schema}}` : (0, codegen_1$10._)`{type: ${schemaValue}}`
};
function reportTypeError$1(it) {
  const cxt = getTypeErrorContext$1(it);
  (0, errors_1$6.reportError)(cxt, typeError$1);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
}
dataType$1.reportTypeError = reportTypeError$1;
function getTypeErrorContext$1(it) {
  const { gen, data, schema } = it;
<<<<<<< HEAD
  const schemaCode = (0, util_1$R.schemaRefOrVal)(it, schema, "type");
=======
  const schemaCode = (0, util_1$V.schemaRefOrVal)(it, schema, "type");
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
<<<<<<< HEAD
var os = {};
Object.defineProperty(os, "__esModule", { value: !0 });
os.assignDefaults = void 0;
const or = X, nf = A;
function sf(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      bi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => bi(e, a, s.default));
=======
var defaults$1 = {};
<<<<<<< HEAD
var hasRequiredDefaults;
function requireDefaults() {
  if (hasRequiredDefaults) return defaults$1;
  hasRequiredDefaults = 1;
  Object.defineProperty(defaults$1, "__esModule", { value: true });
  defaults$1.assignDefaults = void 0;
  const codegen_12 = codegen$1;
  const util_12 = util$1;
  function assignDefaults2(it, ty) {
    const { properties: properties2, items: items2 } = it.schema;
    if (ty === "object" && properties2) {
      for (const key in properties2) {
        assignDefault2(it, key, properties2[key].default);
      }
    } else if (ty === "array" && Array.isArray(items2)) {
      items2.forEach((sch, i) => assignDefault2(it, i, sch.default));
    }
  }
  defaults$1.assignDefaults = assignDefaults2;
  function assignDefault2(it, prop, defaultValue) {
    const { gen, compositeRule, data, opts } = it;
    if (defaultValue === void 0)
      return;
    const childData = (0, codegen_12._)`${data}${(0, codegen_12.getProperty)(prop)}`;
    if (compositeRule) {
      (0, util_12.checkStrictMode)(it, `default is ignored for: ${childData}`);
      return;
    }
    let condition = (0, codegen_12._)`${childData} === undefined`;
    if (opts.useDefaults === "empty") {
      condition = (0, codegen_12._)`${condition} || ${childData} === null || ${childData} === ""`;
    }
    gen.if(condition, (0, codegen_12._)`${childData} = ${(0, codegen_12.stringify)(defaultValue)}`);
  }
  return defaults$1;
}
var keyword$1 = {};
var code$2 = {};
var hasRequiredCode;
function requireCode() {
  if (hasRequiredCode) return code$2;
  hasRequiredCode = 1;
  Object.defineProperty(code$2, "__esModule", { value: true });
  code$2.validateUnion = code$2.validateArray = code$2.usePattern = code$2.callValidateCode = code$2.schemaProperties = code$2.allSchemaProperties = code$2.noPropertyInData = code$2.propertyInData = code$2.isOwnProperty = code$2.hasPropFunc = code$2.reportMissingProp = code$2.checkMissingProp = code$2.checkReportMissingProp = void 0;
  const codegen_12 = codegen$1;
  const util_12 = util$1;
  const names_12 = requireNames();
  const util_22 = util$1;
  function checkReportMissingProp2(cxt, prop) {
    const { gen, data, it } = cxt;
    gen.if(noPropertyInData2(gen, data, prop, it.opts.ownProperties), () => {
      cxt.setParams({ missingProperty: (0, codegen_12._)`${prop}` }, true);
      cxt.error();
=======
Object.defineProperty(defaults$1, "__esModule", { value: true });
defaults$1.assignDefaults = void 0;
const codegen_1$$ = codegen$1;
const util_1$U = util$1;
function assignDefaults$1(it, ty) {
  const { properties: properties2, items: items2 } = it.schema;
  if (ty === "object" && properties2) {
    for (const key in properties2) {
      assignDefault$1(it, key, properties2[key].default);
    }
  } else if (ty === "array" && Array.isArray(items2)) {
    items2.forEach((sch, i) => assignDefault$1(it, i, sch.default));
  }
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
os.assignDefaults = sf;
function bi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, or._)`${a}${(0, or.getProperty)(t)}`;
  if (s) {
    (0, nf.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, or._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, or._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, or._)`${l} = ${(0, or.stringify)(r)}`);
}
var nt = {}, ee = {};
Object.defineProperty(ee, "__esModule", { value: !0 });
ee.validateUnion = ee.validateArray = ee.usePattern = ee.callValidateCode = ee.schemaProperties = ee.allSchemaProperties = ee.noPropertyInData = ee.propertyInData = ee.isOwnProperty = ee.hasPropFunc = ee.reportMissingProp = ee.checkMissingProp = ee.checkReportMissingProp = void 0;
const le = X, va = A, wt = ze, af = A;
function of(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Ea(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, le._)`${t}` }, !0), e.error();
  });
}
ee.checkReportMissingProp = of;
function cf({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, le.or)(...n.map((a) => (0, le.and)(Ea(e, t, a, r.ownProperties), (0, le._)`${s} = ${a}`)));
}
ee.checkMissingProp = cf;
function lf(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ee.reportMissingProp = lf;
function ll(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, le._)`Object.prototype.hasOwnProperty`
  });
}
ee.hasPropFunc = ll;
function wa(e, t, r) {
  return (0, le._)`${ll(e)}.call(${t}, ${r})`;
}
ee.isOwnProperty = wa;
function uf(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} !== undefined`;
  return n ? (0, le._)`${s} && ${wa(e, t, r)}` : s;
}
ee.propertyInData = uf;
function Ea(e, t, r, n) {
  const s = (0, le._)`${t}${(0, le.getProperty)(r)} === undefined`;
  return n ? (0, le.or)(s, (0, le.not)(wa(e, t, r))) : s;
}
ee.noPropertyInData = Ea;
function ul(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ee.allSchemaProperties = ul;
function df(e, t) {
  return ul(t).filter((r) => !(0, va.alwaysValidSchema)(e, t[r]));
}
ee.schemaProperties = df;
function ff({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
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
ee.callValidateCode = ff;
const hf = (0, le._)`new RegExp`;
function mf({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, le._)`${s.code === "new RegExp" ? hf : (0, af.useFunc)(e, s)}(${r}, ${n})`
  });
}
ee.usePattern = mf;
function pf(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const l = t.let("valid", !0);
    return o(() => t.assign(l, !1)), l;
  }
<<<<<<< HEAD
  return t.var(a, !0), o(() => t.break()), a;
  function o(l) {
    const c = t.const("len", (0, le._)`${r}.length`);
    t.forRange("i", 0, c, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: va.Type.Num
      }, a), t.if((0, le.not)(a), l);
=======
  gen.var(valid2, true);
  validateItems(() => gen.break());
  return valid2;
  function validateItems(notValid) {
    const len = gen.const("len", (0, codegen_1$_._)`${data}.length`);
    gen.forRange("i", 0, len, (i) => {
      cxt.subschema({
        keyword: keyword2,
        dataProp: i,
        dataPropType: util_1$T.Type.Num
      }, valid2);
      gen.if((0, codegen_1$_.not)(valid2), notValid);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
    });
  }
  code$2.checkReportMissingProp = checkReportMissingProp2;
  function checkMissingProp2({ gen, data, it: { opts } }, properties2, missing) {
    return (0, codegen_12.or)(...properties2.map((prop) => (0, codegen_12.and)(noPropertyInData2(gen, data, prop, opts.ownProperties), (0, codegen_12._)`${missing} = ${prop}`)));
  }
  code$2.checkMissingProp = checkMissingProp2;
  function reportMissingProp2(cxt, missing) {
    cxt.setParams({ missingProperty: missing }, true);
    cxt.error();
  }
  code$2.reportMissingProp = reportMissingProp2;
  function hasPropFunc2(gen) {
    return gen.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, codegen_12._)`Object.prototype.hasOwnProperty`
    });
  }
  code$2.hasPropFunc = hasPropFunc2;
  function isOwnProperty2(gen, data, property) {
    return (0, codegen_12._)`${hasPropFunc2(gen)}.call(${data}, ${property})`;
  }
  code$2.isOwnProperty = isOwnProperty2;
  function propertyInData2(gen, data, property, ownProperties) {
    const cond = (0, codegen_12._)`${data}${(0, codegen_12.getProperty)(property)} !== undefined`;
    return ownProperties ? (0, codegen_12._)`${cond} && ${isOwnProperty2(gen, data, property)}` : cond;
  }
  code$2.propertyInData = propertyInData2;
  function noPropertyInData2(gen, data, property, ownProperties) {
    const cond = (0, codegen_12._)`${data}${(0, codegen_12.getProperty)(property)} === undefined`;
    return ownProperties ? (0, codegen_12.or)(cond, (0, codegen_12.not)(isOwnProperty2(gen, data, property))) : cond;
  }
  code$2.noPropertyInData = noPropertyInData2;
  function allSchemaProperties2(schemaMap) {
    return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
  }
  code$2.allSchemaProperties = allSchemaProperties2;
  function schemaProperties2(it, schemaMap) {
    return allSchemaProperties2(schemaMap).filter((p) => !(0, util_12.alwaysValidSchema)(it, schemaMap[p]));
  }
  code$2.schemaProperties = schemaProperties2;
  function callValidateCode2({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
    const dataAndSchema = passSchema ? (0, codegen_12._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
    const valCxt = [
      [names_12.default.instancePath, (0, codegen_12.strConcat)(names_12.default.instancePath, errorPath)],
      [names_12.default.parentData, it.parentData],
      [names_12.default.parentDataProperty, it.parentDataProperty],
      [names_12.default.rootData, names_12.default.rootData]
    ];
    if (it.opts.dynamicRef)
      valCxt.push([names_12.default.dynamicAnchors, names_12.default.dynamicAnchors]);
    const args = (0, codegen_12._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
    return context !== codegen_12.nil ? (0, codegen_12._)`${func}.call(${context}, ${args})` : (0, codegen_12._)`${func}(${args})`;
  }
  code$2.callValidateCode = callValidateCode2;
  const newRegExp2 = (0, codegen_12._)`new RegExp`;
  function usePattern2({ gen, it: { opts } }, pattern2) {
    const u = opts.unicodeRegExp ? "u" : "";
    const { regExp } = opts.code;
    const rx = regExp(pattern2, u);
    return gen.scopeValue("pattern", {
      key: rx.toString(),
      ref: rx,
      code: (0, codegen_12._)`${regExp.code === "new RegExp" ? newRegExp2 : (0, util_22.useFunc)(gen, regExp)}(${pattern2}, ${u})`
    });
  }
  code$2.usePattern = usePattern2;
  function validateArray2(cxt) {
    const { gen, data, keyword: keyword2, it } = cxt;
    const valid2 = gen.name("valid");
    if (it.allErrors) {
      const validArr = gen.let("valid", true);
      validateItems(() => gen.assign(validArr, false));
      return validArr;
    }
    gen.var(valid2, true);
    validateItems(() => gen.break());
    return valid2;
    function validateItems(notValid) {
      const len = gen.const("len", (0, codegen_12._)`${data}.length`);
      gen.forRange("i", 0, len, (i) => {
        cxt.subschema({
          keyword: keyword2,
          dataProp: i,
          dataPropType: util_12.Type.Num
        }, valid2);
        gen.if((0, codegen_12.not)(valid2), notValid);
      });
    }
  }
  code$2.validateArray = validateArray2;
  function validateUnion2(cxt) {
    const { gen, schema, keyword: keyword2, it } = cxt;
    if (!Array.isArray(schema))
      throw new Error("ajv implementation error");
    const alwaysValid = schema.some((sch) => (0, util_12.alwaysValidSchema)(it, sch));
    if (alwaysValid && !it.opts.unevaluated)
      return;
    const valid2 = gen.let("valid", false);
    const schValid = gen.name("_valid");
    gen.block(() => schema.forEach((_sch, i) => {
      const schCxt = cxt.subschema({
        keyword: keyword2,
        schemaProp: i,
        compositeRule: true
      }, schValid);
      gen.assign(valid2, (0, codegen_12._)`${valid2} || ${schValid}`);
      const merged = cxt.mergeValidEvaluated(schCxt, schValid);
      if (!merged)
        gen.if((0, codegen_12.not)(valid2));
    }));
    cxt.result(valid2, () => cxt.reset(), () => cxt.error(true));
  }
  code$2.validateUnion = validateUnion2;
  return code$2;
}
<<<<<<< HEAD
ee.validateArray = pf;
function $f(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
=======
<<<<<<< HEAD
var hasRequiredKeyword;
function requireKeyword() {
  if (hasRequiredKeyword) return keyword$1;
  hasRequiredKeyword = 1;
  Object.defineProperty(keyword$1, "__esModule", { value: true });
  keyword$1.validateKeywordUsage = keyword$1.validSchemaType = keyword$1.funcKeywordCode = keyword$1.macroKeywordCode = void 0;
  const codegen_12 = codegen$1;
  const names_12 = requireNames();
  const code_12 = requireCode();
  const errors_12 = errors$1;
  function macroKeywordCode2(cxt, def2) {
    const { gen, keyword: keyword2, schema, parentSchema, it } = cxt;
    const macroSchema = def2.macro.call(it.self, schema, parentSchema, it);
    const schemaRef = useKeyword2(gen, keyword2, macroSchema);
    if (it.opts.validateSchema !== false)
      it.self.validateSchema(macroSchema, true);
    const valid2 = gen.name("valid");
    cxt.subschema({
      schema: macroSchema,
      schemaPath: codegen_12.nil,
      errSchemaPath: `${it.errSchemaPath}/${keyword2}`,
      topSchemaRef: schemaRef,
      compositeRule: true
    }, valid2);
    cxt.pass(valid2, () => cxt.error(true));
  }
  keyword$1.macroKeywordCode = macroKeywordCode2;
  function funcKeywordCode2(cxt, def2) {
    var _a;
    const { gen, keyword: keyword2, schema, parentSchema, $data, it } = cxt;
    checkAsyncKeyword2(it, def2);
    const validate2 = !$data && def2.compile ? def2.compile.call(it.self, schema, parentSchema, it) : def2.validate;
    const validateRef = useKeyword2(gen, keyword2, validate2);
    const valid2 = gen.let("valid");
    cxt.block$data(valid2, validateKeyword);
    cxt.ok((_a = def2.valid) !== null && _a !== void 0 ? _a : valid2);
    function validateKeyword() {
      if (def2.errors === false) {
        assignValid();
        if (def2.modifying)
          modifyData2(cxt);
        reportErrs(() => cxt.error());
      } else {
        const ruleErrs = def2.async ? validateAsync() : validateSync();
        if (def2.modifying)
          modifyData2(cxt);
        reportErrs(() => addErrs2(cxt, ruleErrs));
      }
    }
    function validateAsync() {
      const ruleErrs = gen.let("ruleErrs", null);
      gen.try(() => assignValid((0, codegen_12._)`await `), (e) => gen.assign(valid2, false).if((0, codegen_12._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_12._)`${e}.errors`), () => gen.throw(e)));
      return ruleErrs;
    }
    function validateSync() {
      const validateErrs = (0, codegen_12._)`${validateRef}.errors`;
      gen.assign(validateErrs, null);
      assignValid(codegen_12.nil);
      return validateErrs;
    }
    function assignValid(_await = def2.async ? (0, codegen_12._)`await ` : codegen_12.nil) {
      const passCxt = it.opts.passContext ? names_12.default.this : names_12.default.self;
      const passSchema = !("compile" in def2 && !$data || def2.schema === false);
      gen.assign(valid2, (0, codegen_12._)`${_await}${(0, code_12.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def2.modifying);
    }
    function reportErrs(errors2) {
      var _a2;
      gen.if((0, codegen_12.not)((_a2 = def2.valid) !== null && _a2 !== void 0 ? _a2 : valid2), errors2);
    }
  }
  keyword$1.funcKeywordCode = funcKeywordCode2;
  function modifyData2(cxt) {
    const { gen, data, it } = cxt;
    gen.if(it.parentData, () => gen.assign(data, (0, codegen_12._)`${it.parentData}[${it.parentDataProperty}]`));
  }
  function addErrs2(cxt, errs) {
    const { gen } = cxt;
    gen.if((0, codegen_12._)`Array.isArray(${errs})`, () => {
      gen.assign(names_12.default.vErrors, (0, codegen_12._)`${names_12.default.vErrors} === null ? ${errs} : ${names_12.default.vErrors}.concat(${errs})`).assign(names_12.default.errors, (0, codegen_12._)`${names_12.default.vErrors}.length`);
      (0, errors_12.extendErrors)(cxt);
    }, () => cxt.error());
  }
  function checkAsyncKeyword2({ schemaEnv }, def2) {
    if (def2.async && !schemaEnv.$async)
      throw new Error("async keyword in sync schema");
  }
  function useKeyword2(gen, keyword2, result) {
    if (result === void 0)
      throw new Error(`keyword "${keyword2}" failed to compile`);
    return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_12.stringify)(result) });
  }
  function validSchemaType2(schema, schemaType, allowUndefined = false) {
    return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
  }
  keyword$1.validSchemaType = validSchemaType2;
  function validateKeywordUsage2({ schema, opts, self, errSchemaPath }, def2, keyword2) {
    if (Array.isArray(def2.keyword) ? !def2.keyword.includes(keyword2) : def2.keyword !== keyword2) {
      throw new Error("ajv implementation error");
    }
    const deps = def2.dependencies;
    if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
      throw new Error(`parent schema must have dependencies of ${keyword2}: ${deps.join(",")}`);
    }
    if (def2.validateSchema) {
      const valid2 = def2.validateSchema(schema[keyword2]);
      if (!valid2) {
        const msg = `keyword "${keyword2}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def2.validateSchema.errors);
        if (opts.validateSchema === "log")
          self.logger.error(msg);
        else
          throw new Error(msg);
      }
=======
code$2.validateArray = validateArray$1;
function validateUnion$1(cxt) {
  const { gen, schema, keyword: keyword2, it } = cxt;
  if (!Array.isArray(schema))
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, va.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
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
ee.validateUnion = $f;
Object.defineProperty(nt, "__esModule", { value: !0 });
nt.validateKeywordUsage = nt.validSchemaType = nt.funcKeywordCode = nt.macroKeywordCode = void 0;
const je = X, Xt = ze, yf = ee, gf = cn;
function _f(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = dl(r, n, l);
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
nt.macroKeywordCode = _f;
function vf(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  Ef(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = dl(n, s, d), h = n.let("valid");
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
    const w = c.opts.passContext ? Xt.default.this : Xt.default.self, N = !("compile" in t && !l || t.schema === !1);
    n.assign(h, (0, je._)`${m}${(0, yf.callValidateCode)(e, u, w, N)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, je.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
nt.funcKeywordCode = vf;
function Si(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, je._)`${n.parentData}[${n.parentDataProperty}]`));
}
function wf(e, t) {
  const { gen: r } = e;
  r.if((0, je._)`Array.isArray(${t})`, () => {
    r.assign(Xt.default.vErrors, (0, je._)`${Xt.default.vErrors} === null ? ${t} : ${Xt.default.vErrors}.concat(${t})`).assign(Xt.default.errors, (0, je._)`${Xt.default.vErrors}.length`), (0, gf.extendErrors)(e);
  }, () => e.error());
}
function Ef({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function dl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, je.stringify)(r) });
}
function bf(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
nt.validSchemaType = bf;
function Sf({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
<<<<<<< HEAD
  const o = s.dependencies;
  if (o != null && o.some((l) => !Object.prototype.hasOwnProperty.call(e, l)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const c = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(c);
    else
      throw new Error(c);
=======
  }
  const deps = def2.dependencies;
  if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
    throw new Error(`parent schema must have dependencies of ${keyword2}: ${deps.join(",")}`);
  }
  if (def2.validateSchema) {
    const valid2 = def2.validateSchema(schema[keyword2]);
    if (!valid2) {
      const msg = `keyword "${keyword2}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def2.validateSchema.errors);
      if (opts.validateSchema === "log")
        self.logger.error(msg);
      else
        throw new Error(msg);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
    }
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  }
  keyword$1.validateKeywordUsage = validateKeywordUsage2;
  return keyword$1;
}
<<<<<<< HEAD
nt.validateKeywordUsage = Sf;
var Tt = {};
Object.defineProperty(Tt, "__esModule", { value: !0 });
Tt.extendSubschemaMode = Tt.extendSubschemaData = Tt.getSubschema = void 0;
const tt = X, fl = A;
function Pf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
=======
<<<<<<< HEAD
var subschema$1 = {};
var hasRequiredSubschema;
function requireSubschema() {
  if (hasRequiredSubschema) return subschema$1;
  hasRequiredSubschema = 1;
  Object.defineProperty(subschema$1, "__esModule", { value: true });
  subschema$1.extendSubschemaMode = subschema$1.extendSubschemaData = subschema$1.getSubschema = void 0;
  const codegen_12 = codegen$1;
  const util_12 = util$1;
  function getSubschema2(it, { keyword: keyword2, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
    if (keyword2 !== void 0 && schema !== void 0) {
      throw new Error('both "keyword" and "schema" passed, only one allowed');
=======
keyword$1.validateKeywordUsage = validateKeywordUsage$1;
var subschema$1 = {};
Object.defineProperty(subschema$1, "__esModule", { value: true });
subschema$1.extendSubschemaMode = subschema$1.extendSubschemaData = subschema$1.getSubschema = void 0;
const codegen_1$Y = codegen$1;
const util_1$S = util$1;
function getSubschema$1(it, { keyword: keyword2, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
  if (keyword2 !== void 0 && schema !== void 0) {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, fl.escapeFragment)(r)}`
    };
  }
  if (n !== void 0) {
    if (s === void 0 || a === void 0 || o === void 0)
      throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
<<<<<<< HEAD
    return {
      schema: n,
      schemaPath: s,
      topSchemaRef: o,
      errSchemaPath: a
    };
=======
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
    }
    if (keyword2 !== void 0) {
      const sch = it.schema[keyword2];
      return schemaProp === void 0 ? {
        schema: sch,
        schemaPath: (0, codegen_12._)`${it.schemaPath}${(0, codegen_12.getProperty)(keyword2)}`,
        errSchemaPath: `${it.errSchemaPath}/${keyword2}`
      } : {
        schema: sch[schemaProp],
        schemaPath: (0, codegen_12._)`${it.schemaPath}${(0, codegen_12.getProperty)(keyword2)}${(0, codegen_12.getProperty)(schemaProp)}`,
        errSchemaPath: `${it.errSchemaPath}/${keyword2}/${(0, util_12.escapeFragment)(schemaProp)}`
      };
    }
    if (schema !== void 0) {
      if (schemaPath === void 0 || errSchemaPath === void 0 || topSchemaRef === void 0) {
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      }
      return {
        schema,
        schemaPath,
        topSchemaRef,
        errSchemaPath
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  }
  subschema$1.getSubschema = getSubschema2;
  function extendSubschemaData2(subschema2, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
    if (data !== void 0 && dataProp !== void 0) {
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    }
    const { gen } = it;
    if (dataProp !== void 0) {
      const { errorPath, dataPathArr, opts } = it;
      const nextData = gen.let("data", (0, codegen_12._)`${it.data}${(0, codegen_12.getProperty)(dataProp)}`, true);
      dataContextProps(nextData);
      subschema2.errorPath = (0, codegen_12.str)`${errorPath}${(0, util_12.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
      subschema2.parentDataProperty = (0, codegen_12._)`${dataProp}`;
      subschema2.dataPathArr = [...dataPathArr, subschema2.parentDataProperty];
    }
    if (data !== void 0) {
      const nextData = data instanceof codegen_12.Name ? data : gen.let("data", data, true);
      dataContextProps(nextData);
      if (propertyName !== void 0)
        subschema2.propertyName = propertyName;
    }
    if (dataTypes)
      subschema2.dataTypes = dataTypes;
    function dataContextProps(_nextData) {
      subschema2.data = _nextData;
      subschema2.dataLevel = it.dataLevel + 1;
      subschema2.dataTypes = [];
      it.definedProperties = /* @__PURE__ */ new Set();
      subschema2.parentData = it.data;
      subschema2.dataNames = [...it.dataNames, _nextData];
    }
  }
  subschema$1.extendSubschemaData = extendSubschemaData2;
  function extendSubschemaMode2(subschema2, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
    if (compositeRule !== void 0)
      subschema2.compositeRule = compositeRule;
    if (createErrors !== void 0)
      subschema2.createErrors = createErrors;
    if (allErrors !== void 0)
      subschema2.allErrors = allErrors;
    subschema2.jtdDiscriminator = jtdDiscriminator;
    subschema2.jtdMetadata = jtdMetadata;
  }
  subschema$1.extendSubschemaMode = extendSubschemaMode2;
  return subschema$1;
}
<<<<<<< HEAD
Tt.getSubschema = Pf;
function Nf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
=======
<<<<<<< HEAD
=======
subschema$1.getSubschema = getSubschema$1;
function extendSubschemaData$1(subschema2, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
  if (data !== void 0 && dataProp !== void 0) {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, tt._)`${t.data}${(0, tt.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, tt.str)`${d}${(0, fl.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, tt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
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
Tt.extendSubschemaData = Nf;
function Rf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
<<<<<<< HEAD
Tt.extendSubschemaMode = Rf;
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
=======
subschema$1.extendSubschemaMode = extendSubschemaMode$1;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
var resolve$4 = {};
var fastDeepEqual = function equal(a, b) {
  if (a === b) return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    if (a.constructor !== b.constructor) return false;
    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0; )
        if (!equal(a[i], b[i])) return false;
      return true;
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
            An(e, t, r, h[_], s + "/" + u + "/" + Of(_), a, s, u, n, _);
      } else (u in It.keywords || e.allKeys && !(u in It.skipKeywords)) && An(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function Of(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
<<<<<<< HEAD
var If = hl.exports;
Object.defineProperty(be, "__esModule", { value: !0 });
be.getSchemaRefs = be.resolveUrl = be.normalizeId = be._getFullPath = be.getFullPath = be.inlineRef = void 0;
const jf = A, Tf = is, kf = If, Af = /* @__PURE__ */ new Set([
=======
var jsonSchemaTraverseExports$1 = jsonSchemaTraverse$1.exports;
Object.defineProperty(resolve$4, "__esModule", { value: true });
resolve$4.getSchemaRefs = resolve$4.resolveUrl = resolve$4.normalizeId = resolve$4._getFullPath = resolve$4.getFullPath = resolve$4.inlineRef = void 0;
<<<<<<< HEAD
const util_1$Q = util$1;
=======
const util_1$R = util$1;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const equal$6 = fastDeepEqual;
const traverse$2 = jsonSchemaTraverseExports$1;
const SIMPLE_INLINED$1 = /* @__PURE__ */ new Set([
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
  return typeof e == "boolean" ? !0 : t === !0 ? !Xs(e) : t ? ml(e) <= t : !1;
}
be.inlineRef = Cf;
const Df = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Xs(e) {
  for (const t in e) {
    if (Df.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Xs) || typeof r == "object" && Xs(r))
      return !0;
  }
  return !1;
}
<<<<<<< HEAD
function ml(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Af.has(r) && (typeof e[r] == "object" && (0, jf.eachItem)(e[r], (n) => t += ml(n)), t === 1 / 0))
      return 1 / 0;
=======
function countKeys$1(schema) {
  let count = 0;
  for (const key in schema) {
    if (key === "$ref")
      return Infinity;
    count++;
    if (SIMPLE_INLINED$1.has(key))
      continue;
    if (typeof schema[key] == "object") {
<<<<<<< HEAD
      (0, util_1$Q.eachItem)(schema[key], (sch) => count += countKeys$1(sch));
=======
      (0, util_1$R.eachItem)(schema[key], (sch) => count += countKeys$1(sch));
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
    }
    if (count === Infinity)
      return Infinity;
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  }
  return t;
}
function pl(e, t = "", r) {
  r !== !1 && (t = yr(t));
  const n = e.parse(t);
  return $l(e, n);
}
be.getFullPath = pl;
function $l(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
be._getFullPath = $l;
const Mf = /#\/?$/;
function yr(e) {
  return e ? e.replace(Mf, "") : "";
}
be.normalizeId = yr;
function Lf(e, t, r) {
  return r = yr(r), e.resolve(t, r);
}
be.resolveUrl = Lf;
const Vf = /^[a-z_][-a-z0-9._]*$/i;
function Ff(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = yr(e[r] || t), a = { "": s }, o = pl(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return kf(e, { allKeys: !0 }, (h, E, _, v) => {
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
<<<<<<< HEAD
be.getSchemaRefs = Ff;
Object.defineProperty(Ye, "__esModule", { value: !0 });
Ye.getData = Ye.KeywordCxt = Ye.validateFunctionCode = void 0;
const yl = wr, Pi = ge, ba = ft, Bn = ge, zf = os, Wr = nt, Rs = Tt, U = X, B = ze, Uf = be, ht = A, zr = cn;
function qf(e) {
  if (vl(e) && (wl(e), _l(e))) {
    Hf(e);
    return;
=======
resolve$4.getSchemaRefs = getSchemaRefs$1;
<<<<<<< HEAD
var hasRequiredValidate;
function requireValidate() {
  if (hasRequiredValidate) return validate$1;
  hasRequiredValidate = 1;
  Object.defineProperty(validate$1, "__esModule", { value: true });
  validate$1.getData = validate$1.KeywordCxt = validate$1.validateFunctionCode = void 0;
  const boolSchema_12 = requireBoolSchema();
  const dataType_12 = dataType$1;
  const applicability_12 = applicability$1;
  const dataType_22 = dataType$1;
  const defaults_12 = requireDefaults();
  const keyword_12 = requireKeyword();
  const subschema_12 = requireSubschema();
  const codegen_12 = codegen$1;
  const names_12 = requireNames();
  const resolve_12 = resolve$4;
  const util_12 = util$1;
  const errors_12 = errors$1;
  function validateFunctionCode2(it) {
    if (isSchemaObj2(it)) {
      checkKeywords2(it);
      if (schemaCxtHasRules2(it)) {
        topSchemaObjCode2(it);
        return;
      }
    }
    validateFunction2(it, () => (0, boolSchema_12.topBoolOrEmptySchema)(it));
  }
  validate$1.validateFunctionCode = validateFunctionCode2;
  function validateFunction2({ gen, validateName, schema, schemaEnv, opts }, body) {
    if (opts.code.es5) {
      gen.func(validateName, (0, codegen_12._)`${names_12.default.data}, ${names_12.default.valCxt}`, schemaEnv.$async, () => {
        gen.code((0, codegen_12._)`"use strict"; ${funcSourceUrl2(schema, opts)}`);
        destructureValCxtES52(gen, opts);
        gen.code(body);
      });
    } else {
      gen.func(validateName, (0, codegen_12._)`${names_12.default.data}, ${destructureValCxt2(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl2(schema, opts)).code(body));
    }
  }
  function destructureValCxt2(opts) {
    return (0, codegen_12._)`{${names_12.default.instancePath}="", ${names_12.default.parentData}, ${names_12.default.parentDataProperty}, ${names_12.default.rootData}=${names_12.default.data}${opts.dynamicRef ? (0, codegen_12._)`, ${names_12.default.dynamicAnchors}={}` : codegen_12.nil}}={}`;
  }
  function destructureValCxtES52(gen, opts) {
    gen.if(names_12.default.valCxt, () => {
      gen.var(names_12.default.instancePath, (0, codegen_12._)`${names_12.default.valCxt}.${names_12.default.instancePath}`);
      gen.var(names_12.default.parentData, (0, codegen_12._)`${names_12.default.valCxt}.${names_12.default.parentData}`);
      gen.var(names_12.default.parentDataProperty, (0, codegen_12._)`${names_12.default.valCxt}.${names_12.default.parentDataProperty}`);
      gen.var(names_12.default.rootData, (0, codegen_12._)`${names_12.default.valCxt}.${names_12.default.rootData}`);
      if (opts.dynamicRef)
        gen.var(names_12.default.dynamicAnchors, (0, codegen_12._)`${names_12.default.valCxt}.${names_12.default.dynamicAnchors}`);
    }, () => {
      gen.var(names_12.default.instancePath, (0, codegen_12._)`""`);
      gen.var(names_12.default.parentData, (0, codegen_12._)`undefined`);
      gen.var(names_12.default.parentDataProperty, (0, codegen_12._)`undefined`);
      gen.var(names_12.default.rootData, names_12.default.data);
      if (opts.dynamicRef)
        gen.var(names_12.default.dynamicAnchors, (0, codegen_12._)`{}`);
    });
  }
  function topSchemaObjCode2(it) {
    const { schema, opts, gen } = it;
    validateFunction2(it, () => {
      if (opts.$comment && schema.$comment)
        commentKeyword2(it);
      checkNoDefault2(it);
      gen.let(names_12.default.vErrors, null);
      gen.let(names_12.default.errors, 0);
      if (opts.unevaluated)
        resetEvaluated2(it);
      typeAndKeywords2(it);
      returnResults2(it);
    });
    return;
  }
  function resetEvaluated2(it) {
    const { gen, validateName } = it;
    it.evaluated = gen.const("evaluated", (0, codegen_12._)`${validateName}.evaluated`);
    gen.if((0, codegen_12._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_12._)`${it.evaluated}.props`, (0, codegen_12._)`undefined`));
    gen.if((0, codegen_12._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_12._)`${it.evaluated}.items`, (0, codegen_12._)`undefined`));
  }
  function funcSourceUrl2(schema, opts) {
    const schId = typeof schema == "object" && schema[opts.schemaId];
    return schId && (opts.code.source || opts.code.process) ? (0, codegen_12._)`/*# sourceURL=${schId} */` : codegen_12.nil;
  }
  function subschemaCode2(it, valid2) {
    if (isSchemaObj2(it)) {
      checkKeywords2(it);
      if (schemaCxtHasRules2(it)) {
        subSchemaObjCode2(it, valid2);
        return;
      }
    }
    (0, boolSchema_12.boolOrEmptySchema)(it, valid2);
  }
  function schemaCxtHasRules2({ schema, self }) {
    if (typeof schema == "boolean")
      return !schema;
    for (const key in schema)
      if (self.RULES.all[key])
        return true;
    return false;
  }
  function isSchemaObj2(it) {
    return typeof it.schema != "boolean";
  }
  function subSchemaObjCode2(it, valid2) {
    const { schema, gen, opts } = it;
    if (opts.$comment && schema.$comment)
      commentKeyword2(it);
    updateContext2(it);
    checkAsyncSchema2(it);
    const errsCount = gen.const("_errs", names_12.default.errors);
    typeAndKeywords2(it, errsCount);
    gen.var(valid2, (0, codegen_12._)`${errsCount} === ${names_12.default.errors}`);
  }
  function checkKeywords2(it) {
    (0, util_12.checkUnknownRules)(it);
    checkRefsAndKeywords2(it);
  }
  function typeAndKeywords2(it, errsCount) {
    if (it.opts.jtd)
      return schemaKeywords2(it, [], false, errsCount);
    const types2 = (0, dataType_12.getSchemaTypes)(it.schema);
    const checkedTypes = (0, dataType_12.coerceAndCheckDataType)(it, types2);
    schemaKeywords2(it, types2, !checkedTypes, errsCount);
  }
  function checkRefsAndKeywords2(it) {
    const { schema, errSchemaPath, opts, self } = it;
    if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_12.schemaHasRulesButRef)(schema, self.RULES)) {
      self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
    }
  }
  function checkNoDefault2(it) {
    const { schema, opts } = it;
    if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
      (0, util_12.checkStrictMode)(it, "default is ignored in the schema root");
    }
  }
  function updateContext2(it) {
    const schId = it.schema[it.opts.schemaId];
    if (schId)
      it.baseId = (0, resolve_12.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
  }
  function checkAsyncSchema2(it) {
    if (it.schema.$async && !it.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function commentKeyword2({ gen, schemaEnv, schema, errSchemaPath, opts }) {
    const msg = schema.$comment;
    if (opts.$comment === true) {
      gen.code((0, codegen_12._)`${names_12.default.self}.logger.log(${msg})`);
    } else if (typeof opts.$comment == "function") {
      const schemaPath = (0, codegen_12.str)`${errSchemaPath}/$comment`;
      const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
      gen.code((0, codegen_12._)`${names_12.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
    }
  }
  function returnResults2(it) {
    const { gen, schemaEnv, validateName, ValidationError: ValidationError3, opts } = it;
    if (schemaEnv.$async) {
      gen.if((0, codegen_12._)`${names_12.default.errors} === 0`, () => gen.return(names_12.default.data), () => gen.throw((0, codegen_12._)`new ${ValidationError3}(${names_12.default.vErrors})`));
    } else {
      gen.assign((0, codegen_12._)`${validateName}.errors`, names_12.default.vErrors);
      if (opts.unevaluated)
        assignEvaluated2(it);
      gen.return((0, codegen_12._)`${names_12.default.errors} === 0`);
    }
  }
  function assignEvaluated2({ gen, evaluated, props, items: items2 }) {
    if (props instanceof codegen_12.Name)
      gen.assign((0, codegen_12._)`${evaluated}.props`, props);
    if (items2 instanceof codegen_12.Name)
      gen.assign((0, codegen_12._)`${evaluated}.items`, items2);
  }
  function schemaKeywords2(it, types2, typeErrors, errsCount) {
    const { gen, schema, data, allErrors, opts, self } = it;
    const { RULES } = self;
    if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_12.schemaHasRulesButRef)(schema, RULES))) {
      gen.block(() => keywordCode2(it, "$ref", RULES.all.$ref.definition));
=======
Object.defineProperty(validate$1, "__esModule", { value: true });
validate$1.getData = validate$1.KeywordCxt = validate$1.validateFunctionCode = void 0;
const boolSchema_1$1 = boolSchema$1;
const dataType_1$3 = dataType$1;
const applicability_1$2 = applicability$1;
const dataType_2$1 = dataType$1;
const defaults_1$1 = defaults$1;
const keyword_1$1 = keyword$1;
const subschema_1$1 = subschema$1;
const codegen_1$X = codegen$1;
const names_1$d = names$3;
const resolve_1$5 = resolve$4;
const util_1$Q = util$1;
const errors_1$4 = errors$1;
function validateFunctionCode$1(it) {
  if (isSchemaObj$1(it)) {
    checkKeywords$1(it);
    if (schemaCxtHasRules$1(it)) {
      topSchemaObjCode$1(it);
      return;
    }
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  }
  gl(e, () => (0, yl.topBoolOrEmptySchema)(e));
}
Ye.validateFunctionCode = qf;
function gl({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
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
  gl(e, () => {
    r.$comment && t.$comment && bl(e), Yf(e), n.let(B.default.vErrors, null), n.let(B.default.errors, 0), r.unevaluated && Bf(e), El(e), xf(e);
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
<<<<<<< HEAD
function Jf(e, t) {
  if (vl(e) && (wl(e), _l(e))) {
    Wf(e, t);
    return;
  }
  (0, yl.boolOrEmptySchema)(e, t);
=======
function subschemaCode$1(it, valid2) {
  if (isSchemaObj$1(it)) {
    checkKeywords$1(it);
    if (schemaCxtHasRules$1(it)) {
      subSchemaObjCode$1(it, valid2);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
      return;
    }
    if (!opts.jtd)
      checkStrictTypes2(it, types2);
    gen.block(() => {
      for (const group of RULES.rules)
        groupKeywords(group);
      groupKeywords(RULES.post);
    });
    function groupKeywords(group) {
      if (!(0, applicability_12.shouldUseGroup)(schema, group))
        return;
      if (group.type) {
        gen.if((0, dataType_22.checkDataType)(group.type, data, opts.strictNumbers));
        iterateKeywords2(it, group);
        if (types2.length === 1 && types2[0] === group.type && typeErrors) {
          gen.else();
          (0, dataType_22.reportTypeError)(it);
        }
        gen.endIf();
      } else {
        iterateKeywords2(it, group);
      }
      if (!allErrors)
        gen.if((0, codegen_12._)`${names_12.default.errors} === ${errsCount || 0}`);
    }
  }
<<<<<<< HEAD
  function iterateKeywords2(it, group) {
    const { gen, schema, opts: { useDefaults } } = it;
    if (useDefaults)
      (0, defaults_12.assignDefaults)(it, group.type);
    gen.block(() => {
      for (const rule of group.rules) {
        if ((0, applicability_12.shouldUseRule)(schema, rule)) {
          keywordCode2(it, rule.keyword, rule.definition, group.type);
        }
      }
    });
  }
  function checkStrictTypes2(it, types2) {
    if (it.schemaEnv.meta || !it.opts.strictTypes)
      return;
    checkContextTypes2(it, types2);
    if (!it.opts.allowUnionTypes)
      checkMultipleTypes2(it, types2);
    checkKeywordTypes2(it, it.dataTypes);
  }
  function checkContextTypes2(it, types2) {
    if (!types2.length)
      return;
    if (!it.dataTypes.length) {
      it.dataTypes = types2;
      return;
    }
    types2.forEach((t2) => {
      if (!includesType2(it.dataTypes, t2)) {
        strictTypesError2(it, `type "${t2}" not allowed by context "${it.dataTypes.join(",")}"`);
      }
    });
    narrowSchemaTypes2(it, types2);
  }
  function checkMultipleTypes2(it, ts) {
    if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
      strictTypesError2(it, "use allowUnionTypes to allow union type keyword");
    }
  }
  function checkKeywordTypes2(it, ts) {
    const rules2 = it.self.RULES.all;
    for (const keyword2 in rules2) {
      const rule = rules2[keyword2];
      if (typeof rule == "object" && (0, applicability_12.shouldUseRule)(it.schema, rule)) {
        const { type: type2 } = rule.definition;
        if (type2.length && !type2.some((t2) => hasApplicableType2(ts, t2))) {
          strictTypesError2(it, `missing type "${type2.join(",")}" for keyword "${keyword2}"`);
        }
      }
    }
  }
  function hasApplicableType2(schTs, kwdT) {
    return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
  }
  function includesType2(ts, t2) {
    return ts.includes(t2) || t2 === "integer" && ts.includes("number");
  }
  function narrowSchemaTypes2(it, withTypes) {
    const ts = [];
    for (const t2 of it.dataTypes) {
      if (includesType2(withTypes, t2))
        ts.push(t2);
      else if (withTypes.includes("integer") && t2 === "number")
        ts.push("integer");
    }
    it.dataTypes = ts;
  }
  function strictTypesError2(it, msg) {
    const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
    msg += ` at "${schemaPath}" (strictTypes)`;
    (0, util_12.checkStrictMode)(it, msg, it.opts.strictTypes);
  }
  class KeywordCxt2 {
    constructor(it, def2, keyword2) {
      (0, keyword_12.validateKeywordUsage)(it, def2, keyword2);
      this.gen = it.gen;
      this.allErrors = it.allErrors;
      this.keyword = keyword2;
      this.data = it.data;
      this.schema = it.schema[keyword2];
      this.$data = def2.$data && it.opts.$data && this.schema && this.schema.$data;
      this.schemaValue = (0, util_12.schemaRefOrVal)(it, this.schema, keyword2, this.$data);
      this.schemaType = def2.schemaType;
      this.parentSchema = it.schema;
      this.params = {};
      this.it = it;
      this.def = def2;
      if (this.$data) {
        this.schemaCode = it.gen.const("vSchema", getData2(this.$data, it));
      } else {
        this.schemaCode = this.schemaValue;
        if (!(0, keyword_12.validSchemaType)(this.schema, def2.schemaType, def2.allowUndefined)) {
          throw new Error(`${keyword2} value must be ${JSON.stringify(def2.schemaType)}`);
        }
      }
      if ("code" in def2 ? def2.trackErrors : def2.errors !== false) {
        this.errsCount = it.gen.const("_errs", names_12.default.errors);
      }
    }
    result(condition, successAction, failAction) {
      this.failResult((0, codegen_12.not)(condition), successAction, failAction);
    }
    failResult(condition, successAction, failAction) {
      this.gen.if(condition);
      if (failAction)
        failAction();
      else
        this.error();
      if (successAction) {
        this.gen.else();
        successAction();
        if (this.allErrors)
          this.gen.endIf();
      } else {
        if (this.allErrors)
          this.gen.endIf();
        else
          this.gen.else();
      }
    }
    pass(condition, failAction) {
      this.failResult((0, codegen_12.not)(condition), void 0, failAction);
    }
    fail(condition) {
      if (condition === void 0) {
        this.error();
        if (!this.allErrors)
          this.gen.if(false);
        return;
      }
      this.gen.if(condition);
=======
  (0, boolSchema_1$1.boolOrEmptySchema)(it, valid2);
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
function Wf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && bl(e), Qf(e), Zf(e);
  const a = n.const("_errs", B.default.errors);
  El(e, a), n.var(t, (0, U._)`${a} === ${B.default.errors}`);
}
function wl(e) {
  (0, ht.checkUnknownRules)(e), Xf(e);
}
function El(e, t) {
  if (e.opts.jtd)
    return Ri(e, [], !1, t);
  const r = (0, Pi.getSchemaTypes)(e.schema), n = (0, Pi.coerceAndCheckDataType)(e, r);
  Ri(e, r, !n, t);
}
function Xf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, ht.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Yf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, ht.checkStrictMode)(e, "default is ignored in the schema root");
}
function Qf(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Uf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Zf(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function bl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
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
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, ht.schemaHasRulesButRef)(a, u))) {
    s.block(() => Nl(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || th(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, ba.shouldUseGroup)(a, E) && (E.type ? (s.if((0, Bn.checkDataType)(E.type, o, c.strictNumbers)), Oi(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, Bn.reportTypeError)(e)), s.endIf()) : Oi(e, E), l || s.if((0, U._)`${B.default.errors} === ${n || 0}`));
  }
}
function Oi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, zf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, ba.shouldUseRule)(n, a) && Nl(e, a.keyword, a.definition, t.type);
  });
}
function th(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (rh(e, t), e.opts.allowUnionTypes || nh(e, t), sh(e, e.dataTypes));
}
<<<<<<< HEAD
function rh(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
=======
function checkContextTypes$1(it, types2) {
  if (!types2.length)
    return;
  if (!it.dataTypes.length) {
    it.dataTypes = types2;
    return;
  }
  types2.forEach((t2) => {
    if (!includesType$1(it.dataTypes, t2)) {
      strictTypesError$1(it, `type "${t2}" not allowed by context "${it.dataTypes.join(",")}"`);
    }
  });
  narrowSchemaTypes$1(it, types2);
}
function checkMultipleTypes$1(it, ts) {
  if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
    strictTypesError$1(it, "use allowUnionTypes to allow union type keyword");
  }
}
function checkKeywordTypes$1(it, ts) {
  const rules2 = it.self.RULES.all;
  for (const keyword2 in rules2) {
    const rule = rules2[keyword2];
    if (typeof rule == "object" && (0, applicability_1$2.shouldUseRule)(it.schema, rule)) {
      const { type: type2 } = rule.definition;
      if (type2.length && !type2.some((t2) => hasApplicableType$1(ts, t2))) {
        strictTypesError$1(it, `missing type "${type2.join(",")}" for keyword "${keyword2}"`);
      }
    }
  }
}
function hasApplicableType$1(schTs, kwdT) {
  return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
}
function includesType$1(ts, t2) {
  return ts.includes(t2) || t2 === "integer" && ts.includes("number");
}
function narrowSchemaTypes$1(it, withTypes) {
  const ts = [];
  for (const t2 of it.dataTypes) {
    if (includesType$1(withTypes, t2))
      ts.push(t2);
    else if (withTypes.includes("integer") && t2 === "number")
      ts.push("integer");
  }
  it.dataTypes = ts;
}
function strictTypesError$1(it, msg) {
  const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
  msg += ` at "${schemaPath}" (strictTypes)`;
  (0, util_1$Q.checkStrictMode)(it, msg, it.opts.strictTypes);
}
let KeywordCxt$1 = class KeywordCxt {
  constructor(it, def2, keyword2) {
    (0, keyword_1$1.validateKeywordUsage)(it, def2, keyword2);
    this.gen = it.gen;
    this.allErrors = it.allErrors;
    this.keyword = keyword2;
    this.data = it.data;
    this.schema = it.schema[keyword2];
    this.$data = def2.$data && it.opts.$data && this.schema && this.schema.$data;
    this.schemaValue = (0, util_1$Q.schemaRefOrVal)(it, this.schema, keyword2, this.$data);
    this.schemaType = def2.schemaType;
    this.parentSchema = it.schema;
    this.params = {};
    this.it = it;
    this.def = def2;
    if (this.$data) {
      this.schemaCode = it.gen.const("vSchema", getData$1(this.$data, it));
    } else {
      this.schemaCode = this.schemaValue;
      if (!(0, keyword_1$1.validSchemaType)(this.schema, def2.schemaType, def2.allowUndefined)) {
        throw new Error(`${keyword2} value must be ${JSON.stringify(def2.schemaType)}`);
      }
    }
    if ("code" in def2 ? def2.trackErrors : def2.errors !== false) {
      this.errsCount = it.gen.const("_errs", names_1$d.default.errors);
    }
  }
  result(condition, successAction, failAction) {
    this.failResult((0, codegen_1$X.not)(condition), successAction, failAction);
  }
  failResult(condition, successAction, failAction) {
    this.gen.if(condition);
    if (failAction)
      failAction();
    else
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
      this.error();
      if (this.allErrors)
        this.gen.endIf();
      else
        this.gen.else();
    }
<<<<<<< HEAD
    fail$data(condition) {
      if (!this.$data)
        return this.fail(condition);
      const { schemaCode } = this;
      this.fail((0, codegen_12._)`${schemaCode} !== undefined && (${(0, codegen_12.or)(this.invalid$data(), condition)})`);
    }
    error(append, errorParams, errorPaths) {
      if (errorParams) {
        this.setParams(errorParams);
        this._error(append, errorPaths);
        this.setParams({});
        return;
      }
=======
  }
  pass(condition, failAction) {
    this.failResult((0, codegen_1$X.not)(condition), void 0, failAction);
  }
  fail(condition) {
    if (condition === void 0) {
      this.error();
      if (!this.allErrors)
        this.gen.if(false);
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
      return;
    }
    t.forEach((r) => {
      Sl(e.dataTypes, r) || Sa(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), oh(e, t);
  }
}
function nh(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && Sa(e, "use allowUnionTypes to allow union type keyword");
}
function sh(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, ba.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => ah(t, o)) && Sa(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function ah(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Sl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function oh(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Sl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function Sa(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, ht.checkStrictMode)(e, t, e.opts.strictTypes);
}
let Pl = class {
  constructor(t, r, n) {
    if ((0, Wr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, ht.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Rl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Wr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
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
<<<<<<< HEAD
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
=======
  error(append, errorParams, errorPaths) {
    if (errorParams) {
      this.setParams(errorParams);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
      this._error(append, errorPaths);
    }
<<<<<<< HEAD
    _error(append, errorPaths) {
      (append ? errors_12.reportExtraError : errors_12.reportError)(this, this.def.error, errorPaths);
    }
    $dataError() {
      (0, errors_12.reportError)(this, this.def.$dataError || errors_12.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, errors_12.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(cond) {
      if (!this.allErrors)
        this.gen.if(cond);
    }
    setParams(obj, assign) {
      if (assign)
        Object.assign(this.params, obj);
      else
        this.params = obj;
    }
    block$data(valid2, codeBlock, $dataValid = codegen_12.nil) {
      this.gen.block(() => {
        this.check$data(valid2, $dataValid);
        codeBlock();
      });
    }
    check$data(valid2 = codegen_12.nil, $dataValid = codegen_12.nil) {
      if (!this.$data)
        return;
      const { gen, schemaCode, schemaType, def: def2 } = this;
      gen.if((0, codegen_12.or)((0, codegen_12._)`${schemaCode} === undefined`, $dataValid));
      if (valid2 !== codegen_12.nil)
        gen.assign(valid2, true);
      if (schemaType.length || def2.validateSchema) {
        gen.elseIf(this.invalid$data());
        this.$dataError();
        if (valid2 !== codegen_12.nil)
          gen.assign(valid2, false);
      }
      gen.else();
    }
    invalid$data() {
      const { gen, schemaCode, schemaType, def: def2, it } = this;
      return (0, codegen_12.or)(wrong$DataType(), invalid$DataSchema());
      function wrong$DataType() {
        if (schemaType.length) {
          if (!(schemaCode instanceof codegen_12.Name))
            throw new Error("ajv implementation error");
          const st = Array.isArray(schemaType) ? schemaType : [schemaType];
          return (0, codegen_12._)`${(0, dataType_22.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_22.DataType.Wrong)}`;
        }
        return codegen_12.nil;
      }
      function invalid$DataSchema() {
        if (def2.validateSchema) {
          const validateSchemaRef = gen.scopeValue("validate$data", { ref: def2.validateSchema });
          return (0, codegen_12._)`!${validateSchemaRef}(${schemaCode})`;
        }
        return codegen_12.nil;
      }
    }
    subschema(appl, valid2) {
      const subschema2 = (0, subschema_12.getSubschema)(this.it, appl);
      (0, subschema_12.extendSubschemaData)(subschema2, this.it, appl);
      (0, subschema_12.extendSubschemaMode)(subschema2, appl);
      const nextContext = { ...this.it, ...subschema2, items: void 0, props: void 0 };
      subschemaCode2(nextContext, valid2);
      return nextContext;
    }
    mergeEvaluated(schemaCxt, toName) {
      const { it, gen } = this;
      if (!it.opts.unevaluated)
        return;
      if (it.props !== true && schemaCxt.props !== void 0) {
        it.props = util_12.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
      }
      if (it.items !== true && schemaCxt.items !== void 0) {
        it.items = util_12.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
      }
    }
    mergeValidEvaluated(schemaCxt, valid2) {
      const { it, gen } = this;
      if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
        gen.if(valid2, () => this.mergeEvaluated(schemaCxt, codegen_12.Name));
        return true;
      }
    }
  }
  validate$1.KeywordCxt = KeywordCxt2;
  function keywordCode2(it, keyword2, def2, ruleType) {
    const cxt = new KeywordCxt2(it, def2, keyword2);
    if ("code" in def2) {
      def2.code(cxt, ruleType);
    } else if (cxt.$data && def2.validate) {
      (0, keyword_12.funcKeywordCode)(cxt, def2);
    } else if ("macro" in def2) {
      (0, keyword_12.macroKeywordCode)(cxt, def2);
    } else if (def2.compile || def2.validate) {
      (0, keyword_12.funcKeywordCode)(cxt, def2);
    }
  }
  const JSON_POINTER2 = /^\/(?:[^~]|~0|~1)*$/;
  const RELATIVE_JSON_POINTER2 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function getData2($data, { dataLevel, dataNames, dataPathArr }) {
    let jsonPointer;
    let data;
    if ($data === "")
      return names_12.default.rootData;
    if ($data[0] === "/") {
      if (!JSON_POINTER2.test($data))
        throw new Error(`Invalid JSON-pointer: ${$data}`);
      jsonPointer = $data;
      data = names_12.default.rootData;
    } else {
      const matches = RELATIVE_JSON_POINTER2.exec($data);
      if (!matches)
        throw new Error(`Invalid JSON-pointer: ${$data}`);
      const up = +matches[1];
      jsonPointer = matches[2];
      if (jsonPointer === "#") {
        if (up >= dataLevel)
          throw new Error(errorMsg("property/index", up));
        return dataPathArr[dataLevel - up];
      }
      if (up > dataLevel)
        throw new Error(errorMsg("data", up));
      data = dataNames[dataLevel - up];
      if (!jsonPointer)
        return data;
    }
    let expr = data;
    const segments = jsonPointer.split("/");
    for (const segment of segments) {
      if (segment) {
        data = (0, codegen_12._)`${data}${(0, codegen_12.getProperty)((0, util_12.unescapeJsonPointer)(segment))}`;
        expr = (0, codegen_12._)`${expr} && ${data}`;
      }
    }
    return expr;
    function errorMsg(pointerType, up) {
      return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
    }
  }
  validate$1.getData = getData2;
  return validate$1;
}
=======
    this._error(append, errorPaths);
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
        return (0, U._)`${(0, Bn.checkDataTypes)(c, r, a.opts.strictNumbers, Bn.DataType.Wrong)}`;
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
    return Jf(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = ht.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = ht.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, U.Name)), !0;
  }
};
Ye.KeywordCxt = Pl;
function Nl(e, t, r, n) {
  const s = new Pl(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Wr.funcKeywordCode)(s, r) : "macro" in r ? (0, Wr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Wr.funcKeywordCode)(s, r);
}
const ih = /^\/(?:[^~]|~0|~1)*$/, ch = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Rl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
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
    d && (a = (0, U._)`${a}${(0, U.getProperty)((0, ht.unescapeJsonPointer)(d))}`, o = (0, U._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
<<<<<<< HEAD
Ye.getData = Rl;
var ln = {};
Object.defineProperty(ln, "__esModule", { value: !0 });
class lh extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
ln.default = lh;
var Pr = {};
Object.defineProperty(Pr, "__esModule", { value: !0 });
const Os = be;
let uh = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Os.resolveUrl)(t, r, n), this.missingSchema = (0, Os.normalizeId)((0, Os.getFullPath)(t, this.missingRef));
  }
};
Pr.default = uh;
var ke = {};
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.resolveSchema = ke.getCompilingSchema = ke.resolveRef = ke.compileSchema = ke.SchemaEnv = void 0;
const Ke = X, dh = ln, Jt = ze, We = be, Ii = A, fh = Ye;
let cs = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, We.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
=======
validate$1.getData = getData$1;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
var validation_error$1 = {};
Object.defineProperty(validation_error$1, "__esModule", { value: true });
let ValidationError$1 = class ValidationError extends Error {
  constructor(errors2) {
    super("validation failed");
    this.errors = errors2;
    this.ajv = this.validation = true;
  }
};
validation_error$1.default = ValidationError$1;
var ref_error$1 = {};
Object.defineProperty(ref_error$1, "__esModule", { value: true });
const resolve_1$4 = resolve$4;
let MissingRefError$1 = class MissingRefError extends Error {
  constructor(resolver, baseId, ref2, msg) {
    super(msg || `can't resolve reference ${ref2} from id ${baseId}`);
    this.missingRef = (0, resolve_1$4.resolveUrl)(resolver, baseId, ref2);
    this.missingSchema = (0, resolve_1$4.normalizeId)((0, resolve_1$4.getFullPath)(resolver, this.missingRef));
  }
};
ref_error$1.default = MissingRefError$1;
var compile$1 = {};
Object.defineProperty(compile$1, "__esModule", { value: true });
compile$1.resolveSchema = compile$1.getCompilingSchema = compile$1.resolveRef = compile$1.compileSchema = compile$1.SchemaEnv = void 0;
const codegen_1$W = codegen$1;
const validation_error_1$1 = validation_error$1;
<<<<<<< HEAD
const names_1$c = requireNames();
const resolve_1$3 = resolve$4;
const util_1$P = util$1;
const validate_1$3 = requireValidate();
=======
const names_1$c = names$3;
const resolve_1$3 = resolve$4;
const util_1$P = util$1;
const validate_1$3 = validate$1;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
let SchemaEnv$1 = class SchemaEnv {
  constructor(env2) {
    var _a;
    this.refs = {};
    this.dynamicAnchors = {};
    let schema;
    if (typeof env2.schema == "object")
      schema = env2.schema;
    this.schema = env2.schema;
    this.schemaId = env2.schemaId;
    this.root = env2.root || this;
    this.baseId = (_a = env2.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1$3.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env2.schemaId || "$id"]);
    this.schemaPath = env2.schemaPath;
    this.localRefs = env2.localRefs;
    this.meta = env2.meta;
    this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
    this.refs = {};
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  }
};
ke.SchemaEnv = cs;
function Pa(e) {
  const t = Ol.call(this, e);
  if (t)
    return t;
  const r = (0, We.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Ke.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: dh.default,
    code: (0, Ke._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
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
    this._compilations.add(e), (0, fh.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Jt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const _ = new Function(`${Jt.default.self}`, `${Jt.default.scope}`, u)(this, this.scope.get());
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
ke.compileSchema = Pa;
function hh(e, t, r) {
  var n;
  r = (0, We.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = $h.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new cs({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = mh.call(this, a);
}
ke.resolveRef = hh;
function mh(e) {
  return (0, We.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Pa.call(this, e);
}
function Ol(e) {
  for (const t of this._compilations)
    if (ph(t, e))
      return t;
}
ke.getCompilingSchema = Ol;
function ph(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function $h(e, t) {
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
    if (o.validate || Pa.call(this, o), a === (0, We.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, We.resolveUrl)(this.opts.uriResolver, s, d)), new cs({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Is.call(this, r, o);
  }
}
ke.resolveSchema = ls;
const yh = /* @__PURE__ */ new Set([
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
    const c = r[(0, Ii.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !yh.has(l) && d && (t = (0, We.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ii.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, We.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ls.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new cs({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
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
var Na = {}, us = { exports: {} };
const Ph = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Il = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
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
const Nh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function ji(e) {
  return e.length = 0, !0;
}
function Rh(e, t, r) {
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
  return s.length && (l === ji ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(jl(s))), r.address = n.join(""), r;
}
function Tl(e) {
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
    if (!Il(r)) {
      const n = Tl(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var kl = {
  nonSimpleDomain: Nh,
  recomposeAuthority: kh,
  normalizeComponentEncoding: Th,
  removeDotSegments: jh,
  isIPv4: Il,
  isUUID: Ph,
  normalizeIPv6: Tl
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
    const s = `${n}:${t.nid || e.nid}`, a = Ra(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function Vh(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = Ra(s);
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
), Cn = (
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
    domainHost: Cn.domainHost,
    parse: Cn.parse,
    serialize: Cn.serialize
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
), Jn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Ml,
    https: Uh,
    ws: Cn,
    wss: qh,
    urn: Gh,
    "urn:uuid": Kh
  }
);
Object.setPrototypeOf(Jn, null);
function Ra(e) {
  return e && (Jn[
    /** @type {SchemeName} */
    e
  ] || Jn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var Hh = {
  SCHEMES: Jn,
  getSchemeHandler: Ra
};
const { normalizeIPv6: Bh, removeDotSegments: Hr, recomposeAuthority: Jh, normalizeComponentEncoding: mn, isIPv4: Wh, nonSimpleDomain: Xh } = kl, { SCHEMES: Yh, getSchemeHandler: Ll } = Hh;
function Qh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  st($t(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  $t(st(e, t), t)), e;
}
function Zh(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Vl($t(e, n), $t(t, n), n, !0);
  return n.skipEscape = !0, st(s, n);
}
function Vl(e, t, r, n) {
  const s = {};
  return n || (e = $t(st(e, r), r), t = $t(st(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Hr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Hr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Hr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Hr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function xh(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = st(mn($t(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = st(mn(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = st(mn($t(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = st(mn(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
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
  }, n = Object.assign({}, t), s = [], a = Ll(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Jh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let l = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (l = Hr(l)), o === void 0 && l[0] === "/" && l[1] === "/" && (l = "/%2F" + l.slice(2)), s.push(l);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const em = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function $t(e, t) {
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
const Oa = {
  SCHEMES: Yh,
  normalize: Qh,
  resolve: Zh,
  resolveComponent: Vl,
  equal: xh,
  serialize: st,
  parse: $t
};
<<<<<<< HEAD
us.exports = Oa;
us.exports.default = Oa;
us.exports.fastUri = Oa;
var Fl = us.exports;
Object.defineProperty(Na, "__esModule", { value: !0 });
const zl = Fl;
zl.code = 'require("ajv/dist/runtime/uri").default';
Na.default = zl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Ye;
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
=======
fastUri$1.exports = fastUri;
fastUri$1.exports.default = fastUri;
fastUri$1.exports.fastUri = fastUri;
var fastUriExports = fastUri$1.exports;
Object.defineProperty(uri$3, "__esModule", { value: true });
const uri$2 = fastUriExports;
uri$2.code = 'require("ajv/dist/runtime/uri").default';
uri$3.default = uri$2;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
  var validate_12 = requireValidate();
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
  const n = ln, s = Pr, a = nr, o = ke, l = X, c = be, d = ge, u = A, h = Sh, E = Na, _ = (P, p) => new RegExp(P, p);
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
    const Ge = P.strict, Bt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Cr = Bt === !0 || Bt === void 0 ? 1 : Bt || 0, Dr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ss = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
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
})(Qc);
var Ia = {}, ja = {}, Ta = {};
Object.defineProperty(Ta, "__esModule", { value: !0 });
const tm = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
<<<<<<< HEAD
Ta.default = tm;
var yt = {};
Object.defineProperty(yt, "__esModule", { value: !0 });
yt.callRef = yt.getValidate = void 0;
const rm = Pr, Ti = ee, Ce = X, ir = ze, ki = ke, pn = A, nm = {
=======
id$1.default = def$12;
var ref$1 = {};
Object.defineProperty(ref$1, "__esModule", { value: true });
ref$1.callRef = ref$1.getValidate = void 0;
const ref_error_1$3 = ref_error$1;
<<<<<<< HEAD
const code_1$j = requireCode();
const codegen_1$V = codegen$1;
const names_1$b = requireNames();
=======
const code_1$j = code$2;
const codegen_1$V = codegen$1;
const names_1$b = names$3;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const compile_1$4 = compile$1;
const util_1$O = util$1;
const def$11 = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
        return Dn(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return Dn(e, (0, Ce._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = Ul(e, v);
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
function Ul(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ce._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
yt.getValidate = Ul;
function Dn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? ir.default.this : Ce.nil;
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
    s.assign(ir.default.vErrors, (0, Ce._)`${ir.default.vErrors} === null ? ${g} : ${ir.default.vErrors}.concat(${g})`), s.assign(ir.default.errors, (0, Ce._)`${ir.default.vErrors}.length`);
  }
  function _(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = pn.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, Ce._)`${v}.evaluated.props`);
        a.props = pn.mergeEvaluated.props(s, m, a.props, Ce.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = pn.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Ce._)`${v}.evaluated.items`);
        a.items = pn.mergeEvaluated.items(s, m, a.items, Ce.Name);
      }
  }
}
yt.callRef = Dn;
yt.default = nm;
Object.defineProperty(ja, "__esModule", { value: !0 });
const sm = Ta, am = yt, om = [
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
var ka = {}, Aa = {};
Object.defineProperty(Aa, "__esModule", { value: !0 });
const Wn = X, Et = Wn.operators, Xn = {
  maximum: { okStr: "<=", ok: Et.LTE, fail: Et.GT },
  minimum: { okStr: ">=", ok: Et.GTE, fail: Et.LT },
  exclusiveMaximum: { okStr: "<", ok: Et.LT, fail: Et.GTE },
  exclusiveMinimum: { okStr: ">", ok: Et.GT, fail: Et.LTE }
}, im = {
  message: ({ keyword: e, schemaCode: t }) => (0, Wn.str)`must be ${Xn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Wn._)`{comparison: ${Xn[e].okStr}, limit: ${t}}`
}, cm = {
  keyword: Object.keys(Xn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: im,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Wn._)`${r} ${Xn[t].fail} ${n} || isNaN(${r})`);
  }
};
Aa.default = cm;
var Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Xr = X, lm = {
  message: ({ schemaCode: e }) => (0, Xr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Xr._)`{multipleOf: ${e}}`
}, um = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: lm,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, Xr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Xr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Xr._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Ca.default = um;
var Da = {}, Ma = {};
Object.defineProperty(Ma, "__esModule", { value: !0 });
function ql(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Ma.default = ql;
ql.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Da, "__esModule", { value: !0 });
const Yt = X, dm = A, fm = Ma, hm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Yt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Yt._)`{limit: ${e}}`
}, mm = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: hm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Yt.operators.GT : Yt.operators.LT, o = s.opts.unicode === !1 ? (0, Yt._)`${r}.length` : (0, Yt._)`${(0, dm.useFunc)(e.gen, fm.default)}(${r})`;
    e.fail$data((0, Yt._)`${o} ${a} ${n}`);
  }
};
<<<<<<< HEAD
Da.default = mm;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const pm = ee, Yn = X, $m = {
  message: ({ schemaCode: e }) => (0, Yn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Yn._)`{pattern: ${e}}`
}, ym = {
=======
limitLength$1.default = def$_;
var pattern$1 = {};
Object.defineProperty(pattern$1, "__esModule", { value: true });
<<<<<<< HEAD
const code_1$i = requireCode();
=======
const code_1$i = code$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const codegen_1$R = codegen$1;
const error$A = {
  message: ({ schemaCode }) => (0, codegen_1$R.str)`must match pattern "${schemaCode}"`,
  params: ({ schemaCode }) => (0, codegen_1$R._)`{pattern: ${schemaCode}}`
};
const def$Z = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: $m,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, Yn._)`(new RegExp(${s}, ${o}))` : (0, pm.usePattern)(e, n);
    e.fail$data((0, Yn._)`!${l}.test(${t})`);
  }
};
La.default = ym;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const Yr = X, gm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Yr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Yr._)`{limit: ${e}}`
}, _m = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: gm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Yr.operators.GT : Yr.operators.LT;
    e.fail$data((0, Yr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
<<<<<<< HEAD
Va.default = _m;
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Ur = ee, Qr = X, vm = A, wm = {
  message: ({ params: { missingProperty: e } }) => (0, Qr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Qr._)`{missingProperty: ${e}}`
}, Em = {
=======
limitProperties$1.default = def$Y;
var required$2 = {};
Object.defineProperty(required$2, "__esModule", { value: true });
<<<<<<< HEAD
const code_1$h = requireCode();
=======
const code_1$h = code$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const codegen_1$P = codegen$1;
const util_1$M = util$1;
const error$y = {
  message: ({ params: { missingProperty } }) => (0, codegen_1$P.str)`must have required property '${missingProperty}'`,
  params: ({ params: { missingProperty } }) => (0, codegen_1$P._)`{missingProperty: ${missingProperty}}`
};
const def$X = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
Fa.default = Em;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const Zr = X, bm = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Zr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Zr._)`{limit: ${e}}`
}, Sm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: bm,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Zr.operators.GT : Zr.operators.LT;
    e.fail$data((0, Zr._)`${r}.length ${s} ${n}`);
  }
};
za.default = Sm;
var Ua = {}, un = {};
Object.defineProperty(un, "__esModule", { value: !0 });
const Gl = is;
Gl.code = 'require("ajv/dist/runtime/equal").default';
un.default = Gl;
Object.defineProperty(Ua, "__esModule", { value: !0 });
const js = ge, we = X, Pm = A, Nm = un, Rm = {
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
      const y = (0, Pm.useFunc)(t, Nm.default), m = t.name("outer");
      t.label(m).for((0, we._)`;${v}--;`, () => t.for((0, we._)`${g} = ${v}; ${g}--;`, () => t.if((0, we._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
Ua.default = Om;
var qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const Ys = X, Im = A, jm = un, Tm = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Ys._)`{allowedValue: ${e}}`
}, km = {
  keyword: "const",
  $data: !0,
  error: Tm,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Ys._)`!${(0, Im.useFunc)(t, jm.default)}(${r}, ${s})`) : e.fail((0, Ys._)`${a} !== ${r}`);
  }
};
qa.default = km;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Br = X, Am = A, Cm = un, Dm = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Br._)`{allowedValues: ${e}}`
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
Ga.default = Mm;
Object.defineProperty(ka, "__esModule", { value: !0 });
const Lm = Aa, Vm = Ca, Fm = Da, zm = La, Um = Va, qm = Fa, Gm = za, Km = Ua, Hm = qa, Bm = Ga, Jm = [
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
ka.default = Jm;
var Ka = {}, Nr = {};
Object.defineProperty(Nr, "__esModule", { value: !0 });
Nr.validateAdditionalItems = void 0;
const Qt = X, Qs = A, Wm = {
  message: ({ params: { len: e } }) => (0, Qt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Qt._)`{limit: ${e}}`
}, Xm = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Wm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Qs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Kl(e, n);
  }
};
function Kl(e, t) {
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
<<<<<<< HEAD
Nr.validateAdditionalItems = Kl;
Nr.default = Xm;
var Ha = {}, Rr = {};
Object.defineProperty(Rr, "__esModule", { value: !0 });
Rr.validateTuple = void 0;
const Ai = X, Mn = A, Ym = ee, Qm = {
=======
additionalItems$1.validateAdditionalItems = validateAdditionalItems$1;
additionalItems$1.default = def$S;
var prefixItems$1 = {};
var items$1 = {};
Object.defineProperty(items$1, "__esModule", { value: true });
items$1.validateTuple = void 0;
const codegen_1$J = codegen$1;
const util_1$H = util$1;
<<<<<<< HEAD
const code_1$g = requireCode();
=======
const code_1$g = code$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const def$R = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Hl(e, "additionalItems", t);
    r.items = !0, !(0, Mn.alwaysValidSchema)(r, t) && e.ok((0, Ym.validateArray)(e));
  }
};
function Hl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = Mn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, Ai._)`${a}.length`);
  r.forEach((h, E) => {
    (0, Mn.alwaysValidSchema)(l, h) || (n.if((0, Ai._)`${d} > ${E}`, () => e.subschema({
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
Rr.validateTuple = Hl;
Rr.default = Qm;
Object.defineProperty(Ha, "__esModule", { value: !0 });
const Zm = Rr, xm = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Zm.validateTuple)(e, "items")
};
<<<<<<< HEAD
Ha.default = xm;
var Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Ci = X, ep = A, tp = ee, rp = Nr, np = {
  message: ({ params: { len: e } }) => (0, Ci.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ci._)`{limit: ${e}}`
}, sp = {
=======
prefixItems$1.default = def$Q;
var items2020$1 = {};
Object.defineProperty(items2020$1, "__esModule", { value: true });
const codegen_1$I = codegen$1;
const util_1$G = util$1;
<<<<<<< HEAD
const code_1$f = requireCode();
=======
const code_1$f = code$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const additionalItems_1$3 = additionalItems$1;
const error$s = {
  message: ({ params: { len } }) => (0, codegen_1$I.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$I._)`{limit: ${len}}`
};
const def$P = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
Ba.default = sp;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const Ue = X, $n = A, ap = {
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
      (0, $n.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (l !== void 0 && o > l) {
      (0, $n.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, $n.alwaysValidSchema)(a, r)) {
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
          dataPropType: $n.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function v(g) {
      t.code((0, Ue._)`${g}++`), l === void 0 ? t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Ue._)`${g} > ${l}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Ue._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
<<<<<<< HEAD
Ja.default = op;
var ds = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = X, r = A, n = ee;
  e.error = {
    message: ({ params: { property: c, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${c} is present`;
=======
contains$1.default = def$O;
var dependencies$1 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
  const codegen_12 = codegen$1;
  const util_12 = util$1;
  const code_12 = requireCode();
  exports.error = {
    message: ({ params: { property, depsCount, deps } }) => {
      const property_ies = depsCount === 1 ? "property" : "properties";
      return (0, codegen_12.str)`must have ${property_ies} ${deps} when property ${property} is present`;
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const Bl = X, ip = A, cp = {
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
<<<<<<< HEAD
Wa.default = lp;
var fs = {};
Object.defineProperty(fs, "__esModule", { value: !0 });
const yn = ee, Be = X, up = ze, gn = A, dp = {
=======
propertyNames$1.default = def$N;
var additionalProperties$2 = {};
Object.defineProperty(additionalProperties$2, "__esModule", { value: true });
<<<<<<< HEAD
const code_1$e = requireCode();
const codegen_1$F = codegen$1;
const names_1$a = requireNames();
=======
const code_1$e = code$2;
const codegen_1$F = codegen$1;
const names_1$a = names$3;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const util_1$D = util$1;
const error$p = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Be._)`{additionalProperty: ${e.additionalProperty}}`
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
    if (o.props = !0, c.removeAdditional !== "all" && (0, gn.alwaysValidSchema)(o, r))
      return;
    const d = (0, yn.allSchemaProperties)(n.properties), u = (0, yn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Be._)`${a} === ${up.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(E(y), () => v(y));
      });
    }
    function E(y) {
      let m;
      if (d.length > 8) {
        const w = (0, gn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, yn.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, Be.or)(...d.map((w) => (0, Be._)`${y} === ${w}`)) : m = Be.nil;
      return u.length && (m = (0, Be.or)(m, ...u.map((w) => (0, Be._)`${(0, yn.usePattern)(e, w)}.test(${y})`))), (0, Be.not)(m);
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
      if (typeof r == "object" && !(0, gn.alwaysValidSchema)(o, r)) {
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
        dataPropType: gn.Type.Str
      };
      w === !1 && Object.assign(N, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(N, m);
    }
  }
};
<<<<<<< HEAD
fs.default = fp;
var Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const hp = Ye, Di = ee, Ts = A, Mi = fs, mp = {
=======
additionalProperties$2.default = def$M;
var properties$b = {};
Object.defineProperty(properties$b, "__esModule", { value: true });
<<<<<<< HEAD
const validate_1$2 = requireValidate();
const code_1$d = requireCode();
=======
const validate_1$2 = validate$1;
const code_1$d = code$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const util_1$C = util$1;
const additionalProperties_1$3 = additionalProperties$2;
const def$L = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Mi.default.code(new hp.KeywordCxt(a, Mi.default, "additionalProperties"));
    const o = (0, Di.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ts.mergeEvaluated.props(t, (0, Ts.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Ts.alwaysValidSchema)(a, r[h]));
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
<<<<<<< HEAD
Xa.default = mp;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const Li = ee, _n = X, Vi = A, Fi = A, pp = {
=======
properties$b.default = def$L;
var patternProperties$1 = {};
Object.defineProperty(patternProperties$1, "__esModule", { value: true });
<<<<<<< HEAD
const code_1$c = requireCode();
=======
const code_1$c = code$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const codegen_1$E = codegen$1;
const util_1$B = util$1;
const util_2$2 = util$1;
const def$K = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, Li.allSchemaProperties)(r), c = l.filter((g) => (0, Vi.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof _n.Name) && (a.props = (0, Fi.evaluatedPropsToName)(t, a.props));
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
        t.if((0, _n._)`${(0, Li.usePattern)(e, g)}.test(${y})`, () => {
          const m = c.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: Fi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, _n._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, _n.not)(u), () => t.break());
        });
      });
    }
  }
};
Ya.default = pp;
var Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
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
<<<<<<< HEAD
Qa.default = yp;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const gp = ee, _p = {
=======
not$1.default = def$J;
var anyOf$1 = {};
Object.defineProperty(anyOf$1, "__esModule", { value: true });
<<<<<<< HEAD
const code_1$b = requireCode();
=======
const code_1$b = code$2;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const def$I = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: gp.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Za.default = _p;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const Ln = X, vp = A, wp = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Ln._)`{passingSchemas: ${e.passing}}`
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
        }, c), h > 0 && t.if((0, Ln._)`${c} && ${o}`).assign(o, !1).assign(l, (0, Ln._)`[${l}, ${h}]`).else(), t.if(c, () => {
          t.assign(o, !0), t.assign(l, h), E && e.mergeEvaluated(E, Ln.Name);
        });
      });
    }
  }
};
xa.default = Ep;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
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
eo.default = Sp;
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const Qn = X, Jl = A, Pp = {
  message: ({ params: e }) => (0, Qn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Qn._)`{failingKeyword: ${e.ifClause}}`
}, Np = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Pp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Jl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = zi(n, "then"), a = zi(n, "else");
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
function zi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Jl.alwaysValidSchema)(e, r);
}
to.default = Np;
var ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
const Rp = A, Op = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Rp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
ro.default = Op;
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Ip = Nr, jp = Ha, Tp = Rr, kp = Ba, Ap = Ja, Cp = ds, Dp = Wa, Mp = fs, Lp = Xa, Vp = Ya, Fp = Qa, zp = Za, Up = xa, qp = eo, Gp = to, Kp = ro;
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
<<<<<<< HEAD
Ka.default = Hp;
var no = {}, Or = {};
Object.defineProperty(Or, "__esModule", { value: !0 });
Or.dynamicAnchor = void 0;
const ks = X, Bp = ze, Ui = ke, Jp = yt, Wp = {
=======
applicator$2.default = getApplicator$1;
var dynamic$1 = {};
var dynamicAnchor$1 = {};
Object.defineProperty(dynamicAnchor$1, "__esModule", { value: true });
dynamicAnchor$1.dynamicAnchor = void 0;
const codegen_1$B = codegen$1;
<<<<<<< HEAD
const names_1$9 = requireNames();
=======
const names_1$9 = names$3;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const compile_1$3 = compile$1;
const ref_1$2 = ref$1;
const def$D = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Wl(e, e.schema)
};
function Wl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, ks._)`${Bp.default.dynamicAnchors}${(0, ks.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Xp(e);
  r.if((0, ks._)`!${s}`, () => r.assign(s, a));
}
Or.dynamicAnchor = Wl;
function Xp(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: l } = t.root, { schemaId: c } = n.opts, d = new Ui.SchemaEnv({ schema: r, schemaId: c, root: s, baseId: a, localRefs: o, meta: l });
  return Ui.compileSchema.call(n, d), (0, Jp.getValidate)(e, d);
}
<<<<<<< HEAD
Or.default = Wp;
var Ir = {};
Object.defineProperty(Ir, "__esModule", { value: !0 });
Ir.dynamicRef = void 0;
const qi = X, Yp = ze, Gi = yt, Qp = {
=======
dynamicAnchor$1.default = def$D;
var dynamicRef$1 = {};
Object.defineProperty(dynamicRef$1, "__esModule", { value: true });
dynamicRef$1.dynamicRef = void 0;
const codegen_1$A = codegen$1;
<<<<<<< HEAD
const names_1$8 = requireNames();
=======
const names_1$8 = names$3;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const ref_1$1 = ref$1;
const def$C = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
Ir.dynamicRef = Xl;
Ir.default = Qp;
var so = {};
Object.defineProperty(so, "__esModule", { value: !0 });
const Zp = Or, xp = A, e$ = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Zp.dynamicAnchor)(e, "") : (0, xp.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
so.default = e$;
var ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const t$ = Ir, r$ = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, t$.dynamicRef)(e, e.schema)
};
ao.default = r$;
Object.defineProperty(no, "__esModule", { value: !0 });
const n$ = Or, s$ = Ir, a$ = so, o$ = ao, i$ = [n$.default, s$.default, a$.default, o$.default];
no.default = i$;
var oo = {}, io = {};
Object.defineProperty(io, "__esModule", { value: !0 });
const Ki = ds, c$ = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Ki.error,
  code: (e) => (0, Ki.validatePropertyDeps)(e)
};
io.default = c$;
var co = {};
Object.defineProperty(co, "__esModule", { value: !0 });
const l$ = ds, u$ = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, l$.validateSchemaDeps)(e)
};
co.default = u$;
var lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
const d$ = A, f$ = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, d$.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
<<<<<<< HEAD
lo.default = f$;
Object.defineProperty(oo, "__esModule", { value: !0 });
const h$ = io, m$ = co, p$ = lo, $$ = [h$.default, m$.default, p$.default];
oo.default = $$;
var uo = {}, fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const Pt = X, Hi = A, y$ = ze, g$ = {
=======
limitContains.default = def$x;
Object.defineProperty(next$1, "__esModule", { value: true });
const dependentRequired_1 = dependentRequired;
const dependentSchemas_1 = dependentSchemas;
const limitContains_1 = limitContains;
const next = [dependentRequired_1.default, dependentSchemas_1.default, limitContains_1.default];
next$1.default = next;
var unevaluated$2 = {};
var unevaluatedProperties = {};
Object.defineProperty(unevaluatedProperties, "__esModule", { value: true });
const codegen_1$z = codegen$1;
const util_1$t = util$1;
<<<<<<< HEAD
const names_1$7 = requireNames();
=======
const names_1$7 = names$3;
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const error$m = {
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Pt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
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
    l instanceof Pt.Name ? t.if((0, Pt._)`${l} !== true`, () => t.forIn("key", n, (h) => t.if(d(l, h), () => c(h)))) : l !== !0 && t.forIn("key", n, (h) => l === void 0 ? c(h) : t.if(u(l, h), () => c(h))), a.props = !0, e.ok((0, Pt._)`${s} === ${y$.default.errors}`);
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
fo.default = _$;
var ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const Zt = X, Bi = A, v$ = {
  message: ({ params: { len: e } }) => (0, Zt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Zt._)`{limit: ${e}}`
}, w$ = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: v$,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, Zt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, Zt._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Bi.alwaysValidSchema)(s, r)) {
      const c = t.var("valid", (0, Zt._)`${o} <= ${a}`);
      t.if((0, Zt.not)(c), () => l(c, a)), e.ok(c);
    }
    s.items = !0;
    function l(c, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: Bi.Type.Num }, c), s.allErrors || t.if((0, Zt.not)(c), () => t.break());
      });
    }
  }
};
ho.default = w$;
Object.defineProperty(uo, "__esModule", { value: !0 });
const E$ = fo, b$ = ho, S$ = [E$.default, b$.default];
uo.default = S$;
var mo = {}, po = {};
Object.defineProperty(po, "__esModule", { value: !0 });
const pe = X, P$ = {
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
po.default = N$;
Object.defineProperty(mo, "__esModule", { value: !0 });
const R$ = po, O$ = [R$.default];
mo.default = O$;
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
Object.defineProperty(Ia, "__esModule", { value: !0 });
const I$ = ja, j$ = ka, T$ = Ka, k$ = no, A$ = oo, C$ = uo, D$ = mo, Ji = Er, M$ = [
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
Ia.default = M$;
var $o = {}, hs = {};
Object.defineProperty(hs, "__esModule", { value: !0 });
hs.DiscrError = void 0;
var Wi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Wi || (hs.DiscrError = Wi = {}));
Object.defineProperty($o, "__esModule", { value: !0 });
const hr = X, Zs = hs, Xi = ke, L$ = Pr, V$ = A, F$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Zs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, hr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
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
        if (O != null && O.$ref && !(0, V$.schemaHasRulesButRef)(O, a.self.RULES)) {
          const W = O.$ref;
          if (O = Xi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, W), O instanceof Xi.SchemaEnv && (O = O.schema), O === void 0)
            throw new L$.default(a.opts.uriResolver, a.baseId, W);
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
$o.default = z$;
var yo = {};
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
}, e0 = {
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
}, t0 = {
  $schema: Jy,
  $id: Wy,
  $vocabulary: Xy,
  $dynamicAnchor: Yy,
  title: Qy,
  type: Zy,
  properties: xy,
  $defs: e0
};
Object.defineProperty(yo, "__esModule", { value: !0 });
const r0 = Y$, n0 = ay, s0 = hy, a0 = wy, o0 = jy, i0 = Vy, c0 = By, l0 = t0, u0 = ["/properties"];
function d0(e) {
  return [
    r0,
    n0,
    s0,
    a0,
    o0,
    t(this, i0),
    c0,
    t(this, l0)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, u0) : n;
  }
}
yo.default = d0;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Qc, n = Ia, s = $o, a = yo, o = "https://json-schema.org/draft/2020-12/schema";
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
<<<<<<< HEAD
  t.Ajv2020 = l, e.exports = t = l, e.exports.Ajv2020 = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var c = Ye;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return c.KeywordCxt;
=======
  exports.Ajv2020 = Ajv2020;
  module.exports = exports = Ajv2020;
  module.exports.Ajv2020 = Ajv2020;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = Ajv2020;
  var validate_12 = requireValidate();
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
var f0 = Hs.exports, xs = { exports: {} }, Yl = {};
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
})(Yl);
var Ql = {}, ea = { exports: {} }, Zl = {}, Qe = {}, br = {}, dn = {}, x = {}, on = {};
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
const ce = x, h0 = on;
function m0(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
C.toHash = m0;
function p0(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (xl(e, t), !eu(t, e.self.RULES.all));
}
C.alwaysValidSchema = p0;
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
function $0(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
C.schemaHasRulesButRef = $0;
function y0({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, ce._)`${r}`;
  }
  return (0, ce._)`${e}${t}${(0, ce.getProperty)(n)}`;
}
C.schemaRefOrVal = y0;
function g0(e) {
  return tu(decodeURIComponent(e));
}
C.unescapeFragment = g0;
function _0(e) {
  return encodeURIComponent(go(e));
}
C.escapeFragment = _0;
function go(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
C.escapeJsonPointer = go;
function tu(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
C.unescapeJsonPointer = tu;
function v0(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
C.eachItem = v0;
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
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, ce._)`${r} || {}`), _o(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: ru
  }),
  items: Yi({
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
  return t !== void 0 && _o(e, r, t), r;
}
C.evaluatedPropsToName = ru;
function _o(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, ce._)`${t}${(0, ce.getProperty)(n)}`, !0));
}
C.setEvaluated = _o;
const Qi = {};
function w0(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Qi[t.code] || (Qi[t.code] = new h0._Code(t.code))
  });
}
C.useFunc = w0;
var ra;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(ra || (C.Type = ra = {}));
function E0(e, t, r) {
  if (e instanceof ce.Name) {
    const n = t === ra.Num;
    return r ? n ? (0, ce._)`"[" + ${e} + "]"` : (0, ce._)`"['" + ${e} + "']"` : n ? (0, ce._)`"/" + ${e}` : (0, ce._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, ce.getProperty)(e).toString() : "/" + go(e);
}
C.getErrorPath = E0;
function nu(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
C.checkStrictMode = nu;
var it = {};
Object.defineProperty(it, "__esModule", { value: !0 });
const Re = x, b0 = {
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
it.default = b0;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = x, r = C, n = it;
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
const S0 = dn, P0 = x, N0 = it, R0 = {
  message: "boolean schema is false"
};
function O0(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? su(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(N0.default.data) : (t.assign((0, P0._)`${n}.errors`, null), t.return(!0));
}
br.topBoolOrEmptySchema = O0;
function I0(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), su(e)) : r.var(t, !0);
}
br.boolOrEmptySchema = I0;
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
  (0, S0.reportError)(s, R0, void 0, t);
}
var _e = {}, sr = {};
Object.defineProperty(sr, "__esModule", { value: !0 });
sr.getRules = sr.isJSONType = void 0;
const j0 = ["string", "number", "integer", "boolean", "null", "object", "array"], T0 = new Set(j0);
function k0(e) {
  return typeof e == "string" && T0.has(e);
}
sr.isJSONType = k0;
function A0() {
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
sr.getRules = A0;
var mt = {};
Object.defineProperty(mt, "__esModule", { value: !0 });
mt.shouldUseRule = mt.shouldUseGroup = mt.schemaHasRulesForType = void 0;
function C0({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && au(e, n);
}
mt.schemaHasRulesForType = C0;
function au(e, t) {
  return t.rules.some((r) => ou(e, r));
}
mt.shouldUseGroup = au;
function ou(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
mt.shouldUseRule = ou;
Object.defineProperty(_e, "__esModule", { value: !0 });
_e.reportTypeError = _e.checkDataTypes = _e.checkDataType = _e.coerceAndCheckDataType = _e.getJSONTypes = _e.getSchemaTypes = _e.DataType = void 0;
const D0 = sr, M0 = mt, L0 = dn, Q = x, iu = C;
var gr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(gr || (_e.DataType = gr = {}));
function V0(e) {
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
_e.getSchemaTypes = V0;
function cu(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(D0.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
_e.getJSONTypes = cu;
function F0(e, t) {
  const { gen: r, data: n, opts: s } = e, a = z0(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, M0.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const l = vo(t, n, s.strictNumbers, gr.Wrong);
    r.if(l, () => {
      a.length ? U0(e, t, a) : wo(e);
    });
  }
  return o;
}
_e.coerceAndCheckDataType = F0;
const lu = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function z0(e, t) {
  return t ? e.filter((r) => lu.has(r) || t === "array" && r === "array") : [];
}
function U0(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, Q._)`typeof ${s}`), l = n.let("coerced", (0, Q._)`undefined`);
  a.coerceTypes === "array" && n.if((0, Q._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, Q._)`${s}[0]`).assign(o, (0, Q._)`typeof ${s}`).if(vo(t, s, a.strictNumbers), () => n.assign(l, s))), n.if((0, Q._)`${l} !== undefined`);
  for (const d of r)
    (lu.has(d) || d === "array" && a.coerceTypes === "array") && c(d);
  n.else(), wo(e), n.endIf(), n.if((0, Q._)`${l} !== undefined`, () => {
    n.assign(s, l), q0(e, l);
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
function q0({ gen: e, parentData: t, parentDataProperty: r }, n) {
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
function vo(e, t, r, n) {
  if (e.length === 1)
    return na(e[0], t, r, n);
  let s;
  const a = (0, iu.toHash)(e);
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
_e.checkDataTypes = vo;
const G0 = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, Q._)`{type: ${e}}` : (0, Q._)`{type: ${t}}`
};
function wo(e) {
  const t = K0(e);
  (0, L0.reportError)(t, G0);
}
_e.reportTypeError = wo;
function K0(e) {
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
var ms = {};
Object.defineProperty(ms, "__esModule", { value: !0 });
ms.assignDefaults = void 0;
const cr = x, H0 = C;
function B0(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      Zi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => Zi(e, a, s.default));
}
ms.assignDefaults = B0;
function Zi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const l = (0, cr._)`${a}${(0, cr.getProperty)(t)}`;
  if (s) {
    (0, H0.checkStrictMode)(e, `default is ignored for: ${l}`);
    return;
  }
  let c = (0, cr._)`${l} === undefined`;
  o.useDefaults === "empty" && (c = (0, cr._)`${c} || ${l} === null || ${l} === ""`), n.if(c, (0, cr._)`${l} = ${(0, cr.stringify)(r)}`);
}
var at = {}, te = {};
Object.defineProperty(te, "__esModule", { value: !0 });
te.validateUnion = te.validateArray = te.usePattern = te.callValidateCode = te.schemaProperties = te.allSchemaProperties = te.noPropertyInData = te.propertyInData = te.isOwnProperty = te.hasPropFunc = te.reportMissingProp = te.checkMissingProp = te.checkReportMissingProp = void 0;
const ue = x, Eo = C, bt = it, J0 = C;
function W0(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(So(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ue._)`${t}` }, !0), e.error();
  });
}
te.checkReportMissingProp = W0;
function X0({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ue.or)(...n.map((a) => (0, ue.and)(So(e, t, a, r.ownProperties), (0, ue._)`${s} = ${a}`)));
}
te.checkMissingProp = X0;
function Y0(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
te.reportMissingProp = Y0;
function uu(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ue._)`Object.prototype.hasOwnProperty`
  });
}
te.hasPropFunc = uu;
function bo(e, t, r) {
  return (0, ue._)`${uu(e)}.call(${t}, ${r})`;
}
te.isOwnProperty = bo;
function Q0(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} !== undefined`;
  return n ? (0, ue._)`${s} && ${bo(e, t, r)}` : s;
}
te.propertyInData = Q0;
function So(e, t, r, n) {
  const s = (0, ue._)`${t}${(0, ue.getProperty)(r)} === undefined`;
  return n ? (0, ue.or)(s, (0, ue.not)(bo(e, t, r))) : s;
}
te.noPropertyInData = So;
function du(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
te.allSchemaProperties = du;
function Z0(e, t) {
  return du(t).filter((r) => !(0, Eo.alwaysValidSchema)(e, t[r]));
}
te.schemaProperties = Z0;
function x0({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, l, c, d) {
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
te.callValidateCode = x0;
const eg = (0, ue._)`new RegExp`;
function tg({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ue._)`${s.code === "new RegExp" ? eg : (0, J0.useFunc)(e, s)}(${r}, ${n})`
  });
}
te.usePattern = tg;
function rg(e) {
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
        dataPropType: Eo.Type.Num
      }, a), t.if((0, ue.not)(a), l);
    });
  }
}
te.validateArray = rg;
function ng(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((c) => (0, Eo.alwaysValidSchema)(s, c)) && !s.opts.unevaluated)
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
te.validateUnion = ng;
Object.defineProperty(at, "__esModule", { value: !0 });
at.validateKeywordUsage = at.validSchemaType = at.funcKeywordCode = at.macroKeywordCode = void 0;
const Te = x, xt = it, sg = te, ag = dn;
function og(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, l = t.macro.call(o.self, s, a, o), c = fu(r, n, l);
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
at.macroKeywordCode = og;
function ig(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: l, it: c } = e;
  lg(c, t);
  const d = !l && t.compile ? t.compile.call(c.self, a, o, c) : t.validate, u = fu(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      g(), t.modifying && xi(e), y(() => e.error());
    else {
      const m = t.async ? _() : v();
      t.modifying && xi(e), y(() => cg(e, m));
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
    n.assign(h, (0, Te._)`${m}${(0, sg.callValidateCode)(e, u, w, N)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, Te.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
at.funcKeywordCode = ig;
function xi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Te._)`${n.parentData}[${n.parentDataProperty}]`));
}
function cg(e, t) {
  const { gen: r } = e;
  r.if((0, Te._)`Array.isArray(${t})`, () => {
    r.assign(xt.default.vErrors, (0, Te._)`${xt.default.vErrors} === null ? ${t} : ${xt.default.vErrors}.concat(${t})`).assign(xt.default.errors, (0, Te._)`${xt.default.vErrors}.length`), (0, ag.extendErrors)(e);
  }, () => e.error());
}
function lg({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function fu(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Te.stringify)(r) });
}
function ug(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
at.validSchemaType = ug;
function dg({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
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
at.validateKeywordUsage = dg;
var kt = {};
Object.defineProperty(kt, "__esModule", { value: !0 });
kt.extendSubschemaMode = kt.extendSubschemaData = kt.getSubschema = void 0;
const rt = x, hu = C;
function fg(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
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
kt.getSubschema = fg;
function hg(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: l } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = l.let("data", (0, rt._)`${t.data}${(0, rt.getProperty)(r)}`, !0);
    c(E), e.errorPath = (0, rt.str)`${d}${(0, hu.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, rt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
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
kt.extendSubschemaData = hg;
function mg(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
kt.extendSubschemaMode = mg;
var Se = {}, mu = { exports: {} }, jt = mu.exports = function(e, t, r) {
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
            Vn(e, t, r, h[_], s + "/" + u + "/" + pg(_), a, s, u, n, _);
      } else (u in jt.keywords || e.allKeys && !(u in jt.skipKeywords)) && Vn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, l, c, d);
  }
}
function pg(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var $g = mu.exports;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.getSchemaRefs = Se.resolveUrl = Se.normalizeId = Se._getFullPath = Se.getFullPath = Se.inlineRef = void 0;
const yg = C, gg = is, _g = $g, vg = /* @__PURE__ */ new Set([
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
function wg(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !sa(e) : t ? pu(e) <= t : !1;
}
Se.inlineRef = wg;
const Eg = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function sa(e) {
  for (const t in e) {
    if (Eg.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(sa) || typeof r == "object" && sa(r))
      return !0;
  }
  return !1;
}
function pu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !vg.has(r) && (typeof e[r] == "object" && (0, yg.eachItem)(e[r], (n) => t += pu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function $u(e, t = "", r) {
  r !== !1 && (t = _r(t));
  const n = e.parse(t);
  return yu(e, n);
}
Se.getFullPath = $u;
function yu(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Se._getFullPath = yu;
const bg = /#\/?$/;
function _r(e) {
  return e ? e.replace(bg, "") : "";
}
Se.normalizeId = _r;
function Sg(e, t, r) {
  return r = _r(r), e.resolve(t, r);
}
Se.resolveUrl = Sg;
const Pg = /^[a-z_][-a-z0-9._]*$/i;
function Ng(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = _r(e[r] || t), a = { "": s }, o = $u(n, s, !1), l = {}, c = /* @__PURE__ */ new Set();
  return _g(e, { allKeys: !0 }, (h, E, _, v) => {
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
        if (!Pg.test(N))
          throw new Error(`invalid anchor "${N}"`);
        m.call(this, `#${N}`);
      }
    }
  }), l;
  function d(h, E, _) {
    if (E !== void 0 && !gg(h, E))
      throw u(_);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Se.getSchemaRefs = Ng;
Object.defineProperty(Qe, "__esModule", { value: !0 });
Qe.getData = Qe.KeywordCxt = Qe.validateFunctionCode = void 0;
const gu = br, ec = _e, Po = mt, Zn = _e, Rg = ms, xr = at, As = kt, q = x, J = it, Og = Se, pt = C, qr = dn;
function Ig(e) {
  if (wu(e) && (Eu(e), vu(e))) {
    kg(e);
    return;
  }
  _u(e, () => (0, gu.topBoolOrEmptySchema)(e));
}
Qe.validateFunctionCode = Ig;
function _u({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, q._)`${J.default.data}, ${J.default.valCxt}`, n.$async, () => {
    e.code((0, q._)`"use strict"; ${tc(r, s)}`), Tg(e, s), e.code(a);
  }) : e.func(t, (0, q._)`${J.default.data}, ${jg(s)}`, n.$async, () => e.code(tc(r, s)).code(a));
}
function jg(e) {
  return (0, q._)`{${J.default.instancePath}="", ${J.default.parentData}, ${J.default.parentDataProperty}, ${J.default.rootData}=${J.default.data}${e.dynamicRef ? (0, q._)`, ${J.default.dynamicAnchors}={}` : q.nil}}={}`;
}
function Tg(e, t) {
  e.if(J.default.valCxt, () => {
    e.var(J.default.instancePath, (0, q._)`${J.default.valCxt}.${J.default.instancePath}`), e.var(J.default.parentData, (0, q._)`${J.default.valCxt}.${J.default.parentData}`), e.var(J.default.parentDataProperty, (0, q._)`${J.default.valCxt}.${J.default.parentDataProperty}`), e.var(J.default.rootData, (0, q._)`${J.default.valCxt}.${J.default.rootData}`), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, q._)`${J.default.valCxt}.${J.default.dynamicAnchors}`);
  }, () => {
    e.var(J.default.instancePath, (0, q._)`""`), e.var(J.default.parentData, (0, q._)`undefined`), e.var(J.default.parentDataProperty, (0, q._)`undefined`), e.var(J.default.rootData, J.default.data), t.dynamicRef && e.var(J.default.dynamicAnchors, (0, q._)`{}`);
  });
}
function kg(e) {
  const { schema: t, opts: r, gen: n } = e;
  _u(e, () => {
    r.$comment && t.$comment && Su(e), Lg(e), n.let(J.default.vErrors, null), n.let(J.default.errors, 0), r.unevaluated && Ag(e), bu(e), zg(e);
  });
}
function Ag(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, q._)`${r}.evaluated`), t.if((0, q._)`${e.evaluated}.dynamicProps`, () => t.assign((0, q._)`${e.evaluated}.props`, (0, q._)`undefined`)), t.if((0, q._)`${e.evaluated}.dynamicItems`, () => t.assign((0, q._)`${e.evaluated}.items`, (0, q._)`undefined`));
}
function tc(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, q._)`/*# sourceURL=${r} */` : q.nil;
}
function Cg(e, t) {
  if (wu(e) && (Eu(e), vu(e))) {
    Dg(e, t);
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
function Dg(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && Su(e), Vg(e), Fg(e);
  const a = n.const("_errs", J.default.errors);
  bu(e, a), n.var(t, (0, q._)`${a} === ${J.default.errors}`);
}
function Eu(e) {
  (0, pt.checkUnknownRules)(e), Mg(e);
}
function bu(e, t) {
  if (e.opts.jtd)
    return rc(e, [], !1, t);
  const r = (0, ec.getSchemaTypes)(e.schema), n = (0, ec.coerceAndCheckDataType)(e, r);
  rc(e, r, !n, t);
}
function Mg(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, pt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Lg(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, pt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Vg(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, Og.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Fg(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function Su({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, q._)`${J.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, q.str)`${n}/$comment`, l = e.scopeValue("root", { ref: t.root });
    e.code((0, q._)`${J.default.self}.opts.$comment(${a}, ${o}, ${l}.schema)`);
  }
}
<<<<<<< HEAD
function zg(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, q._)`${J.default.errors} === 0`, () => t.return(J.default.data), () => t.throw((0, q._)`new ${s}(${J.default.vErrors})`)) : (t.assign((0, q._)`${n}.errors`, J.default.vErrors), a.unevaluated && Ug(e), t.return((0, q._)`${J.default.errors} === 0`));
=======
function returnResults(it) {
<<<<<<< HEAD
  const { gen, schemaEnv, validateName, ValidationError: ValidationError3, opts } = it;
  if (schemaEnv.$async) {
    gen.if((0, codegen_1$n._)`${names_1$3.default.errors} === 0`, () => gen.return(names_1$3.default.data), () => gen.throw((0, codegen_1$n._)`new ${ValidationError3}(${names_1$3.default.vErrors})`));
=======
  const { gen, schemaEnv, validateName, ValidationError: ValidationError2, opts } = it;
  if (schemaEnv.$async) {
    gen.if((0, codegen_1$n._)`${names_1$3.default.errors} === 0`, () => gen.return(names_1$3.default.data), () => gen.throw((0, codegen_1$n._)`new ${ValidationError2}(${names_1$3.default.vErrors})`));
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  } else {
    gen.assign((0, codegen_1$n._)`${validateName}.errors`, names_1$3.default.vErrors);
    if (opts.unevaluated)
      assignEvaluated(it);
    gen.return((0, codegen_1$n._)`${names_1$3.default.errors} === 0`);
  }
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
function Ug({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof q.Name && e.assign((0, q._)`${t}.props`, r), n instanceof q.Name && e.assign((0, q._)`${t}.items`, n);
}
function rc(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: l, opts: c, self: d } = e, { RULES: u } = d;
  if (a.$ref && (c.ignoreKeywordsWithRef || !(0, pt.schemaHasRulesButRef)(a, u))) {
    s.block(() => Ru(e, "$ref", u.all.$ref.definition));
    return;
  }
  c.jtd || qg(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, Po.shouldUseGroup)(a, E) && (E.type ? (s.if((0, Zn.checkDataType)(E.type, o, c.strictNumbers)), nc(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, Zn.reportTypeError)(e)), s.endIf()) : nc(e, E), l || s.if((0, q._)`${J.default.errors} === ${n || 0}`));
  }
}
function nc(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, Rg.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, Po.shouldUseRule)(n, a) && Ru(e, a.keyword, a.definition, t.type);
  });
}
function qg(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Gg(e, t), e.opts.allowUnionTypes || Kg(e, t), Hg(e, e.dataTypes));
}
<<<<<<< HEAD
function Gg(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
=======
function checkContextTypes(it, types2) {
  if (!types2.length)
    return;
  if (!it.dataTypes.length) {
    it.dataTypes = types2;
    return;
  }
  types2.forEach((t2) => {
    if (!includesType(it.dataTypes, t2)) {
      strictTypesError(it, `type "${t2}" not allowed by context "${it.dataTypes.join(",")}"`);
    }
  });
  narrowSchemaTypes(it, types2);
}
function checkMultipleTypes(it, ts) {
  if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
    strictTypesError(it, "use allowUnionTypes to allow union type keyword");
  }
}
function checkKeywordTypes(it, ts) {
  const rules2 = it.self.RULES.all;
  for (const keyword2 in rules2) {
    const rule = rules2[keyword2];
    if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
      const { type: type2 } = rule.definition;
      if (type2.length && !type2.some((t2) => hasApplicableType(ts, t2))) {
        strictTypesError(it, `missing type "${type2.join(",")}" for keyword "${keyword2}"`);
      }
    }
  }
}
function hasApplicableType(schTs, kwdT) {
  return schTs.includes(kwdT) || kwdT === "number" && schTs.includes("integer");
}
function includesType(ts, t2) {
  return ts.includes(t2) || t2 === "integer" && ts.includes("number");
}
function narrowSchemaTypes(it, withTypes) {
  const ts = [];
  for (const t2 of it.dataTypes) {
    if (includesType(withTypes, t2))
      ts.push(t2);
    else if (withTypes.includes("integer") && t2 === "number")
      ts.push("integer");
  }
  it.dataTypes = ts;
}
function strictTypesError(it, msg) {
  const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
  msg += ` at "${schemaPath}" (strictTypes)`;
  (0, util_1$l.checkStrictMode)(it, msg, it.opts.strictTypes);
}
<<<<<<< HEAD
class KeywordCxt {
=======
class KeywordCxt2 {
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  constructor(it, def2, keyword2) {
    (0, keyword_1.validateKeywordUsage)(it, def2, keyword2);
    this.gen = it.gen;
    this.allErrors = it.allErrors;
    this.keyword = keyword2;
    this.data = it.data;
    this.schema = it.schema[keyword2];
    this.$data = def2.$data && it.opts.$data && this.schema && this.schema.$data;
    this.schemaValue = (0, util_1$l.schemaRefOrVal)(it, this.schema, keyword2, this.$data);
    this.schemaType = def2.schemaType;
    this.parentSchema = it.schema;
    this.params = {};
    this.it = it;
    this.def = def2;
    if (this.$data) {
      this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
    } else {
      this.schemaCode = this.schemaValue;
      if (!(0, keyword_1.validSchemaType)(this.schema, def2.schemaType, def2.allowUndefined)) {
        throw new Error(`${keyword2} value must be ${JSON.stringify(def2.schemaType)}`);
      }
    }
    if ("code" in def2 ? def2.trackErrors : def2.errors !== false) {
      this.errsCount = it.gen.const("_errs", names_1$3.default.errors);
    }
  }
  result(condition, successAction, failAction) {
    this.failResult((0, codegen_1$n.not)(condition), successAction, failAction);
  }
  failResult(condition, successAction, failAction) {
    this.gen.if(condition);
    if (failAction)
      failAction();
    else
      this.error();
    if (successAction) {
      this.gen.else();
      successAction();
      if (this.allErrors)
        this.gen.endIf();
    } else {
      if (this.allErrors)
        this.gen.endIf();
      else
        this.gen.else();
    }
  }
  pass(condition, failAction) {
    this.failResult((0, codegen_1$n.not)(condition), void 0, failAction);
  }
  fail(condition) {
    if (condition === void 0) {
      this.error();
      if (!this.allErrors)
        this.gen.if(false);
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
      return;
    }
    t.forEach((r) => {
      Pu(e.dataTypes, r) || No(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Jg(e, t);
  }
}
function Kg(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && No(e, "use allowUnionTypes to allow union type keyword");
}
function Hg(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, Po.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Bg(t, o)) && No(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Bg(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function Pu(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Jg(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    Pu(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function No(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, pt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class Nu {
  constructor(t, r, n) {
    if ((0, xr.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, pt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", Ou(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, xr.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
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
    return Cg(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = pt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = pt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, q.Name)), !0;
  }
}
<<<<<<< HEAD
Qe.KeywordCxt = Nu;
function Ru(e, t, r, n) {
  const s = new Nu(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, xr.funcKeywordCode)(s, r) : "macro" in r ? (0, xr.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, xr.funcKeywordCode)(s, r);
=======
<<<<<<< HEAD
validate.KeywordCxt = KeywordCxt;
function keywordCode(it, keyword2, def2, ruleType) {
  const cxt = new KeywordCxt(it, def2, keyword2);
=======
validate.KeywordCxt = KeywordCxt2;
function keywordCode(it, keyword2, def2, ruleType) {
  const cxt = new KeywordCxt2(it, def2, keyword2);
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  if ("code" in def2) {
    def2.code(cxt, ruleType);
  } else if (cxt.$data && def2.validate) {
    (0, keyword_1.funcKeywordCode)(cxt, def2);
  } else if ("macro" in def2) {
    (0, keyword_1.macroKeywordCode)(cxt, def2);
  } else if (def2.compile || def2.validate) {
    (0, keyword_1.funcKeywordCode)(cxt, def2);
  }
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
}
const Wg = /^\/(?:[^~]|~0|~1)*$/, Xg = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function Ou(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return J.default.rootData;
  if (e[0] === "/") {
    if (!Wg.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = J.default.rootData;
  } else {
    const d = Xg.exec(e);
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
    d && (a = (0, q._)`${a}${(0, q.getProperty)((0, pt.unescapeJsonPointer)(d))}`, o = (0, q._)`${o} && ${a}`);
  return o;
  function c(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
Qe.getData = Ou;
var vn = {}, sc;
function Ro() {
  if (sc) return vn;
  sc = 1, Object.defineProperty(vn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return vn.default = e, vn;
}
var jr = {};
Object.defineProperty(jr, "__esModule", { value: !0 });
const Cs = Se;
class Yg extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Cs.resolveUrl)(t, r, n), this.missingSchema = (0, Cs.normalizeId)((0, Cs.getFullPath)(t, this.missingRef));
  }
}
<<<<<<< HEAD
jr.default = Yg;
var Me = {};
Object.defineProperty(Me, "__esModule", { value: !0 });
Me.resolveSchema = Me.getCompilingSchema = Me.resolveRef = Me.compileSchema = Me.SchemaEnv = void 0;
const He = x, Qg = Ro(), Wt = it, Xe = Se, ac = C, Zg = Qe;
class ps {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, Xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Me.SchemaEnv = ps;
function Oo(e) {
  const t = Iu.call(this, e);
  if (t)
    return t;
  const r = (0, Xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new He.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let l;
  e.$async && (l = o.scopeValue("Error", {
    ref: Qg.default,
    code: (0, He._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const c = o.scopeName("validate");
  e.validateName = c;
  const d = {
    gen: o,
=======
validate.getData = getData;
var validation_error = {};
Object.defineProperty(validation_error, "__esModule", { value: true });
class ValidationError2 extends Error {
  constructor(errors2) {
    super("validation failed");
    this.errors = errors2;
    this.ajv = this.validation = true;
  }
}
validation_error.default = ValidationError2;
var ref_error = {};
Object.defineProperty(ref_error, "__esModule", { value: true });
const resolve_1$1 = resolve$1;
class MissingRefError2 extends Error {
  constructor(resolver, baseId, ref2, msg) {
    super(msg || `can't resolve reference ${ref2} from id ${baseId}`);
    this.missingRef = (0, resolve_1$1.resolveUrl)(resolver, baseId, ref2);
    this.missingSchema = (0, resolve_1$1.normalizeId)((0, resolve_1$1.getFullPath)(resolver, this.missingRef));
  }
}
ref_error.default = MissingRefError2;
var compile = {};
Object.defineProperty(compile, "__esModule", { value: true });
compile.resolveSchema = compile.getCompilingSchema = compile.resolveRef = compile.compileSchema = compile.SchemaEnv = void 0;
const codegen_1$m = codegen;
<<<<<<< HEAD
const validation_error_1 = validation_error;
=======
const validation_error_1 = requireValidation_error();
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
const names_1$2 = names$1;
const resolve_1 = resolve$1;
const util_1$k = util;
const validate_1$1 = validate;
class SchemaEnv2 {
  constructor(env2) {
    var _a;
    this.refs = {};
    this.dynamicAnchors = {};
    let schema;
    if (typeof env2.schema == "object")
      schema = env2.schema;
    this.schema = env2.schema;
    this.schemaId = env2.schemaId;
    this.root = env2.root || this;
    this.baseId = (_a = env2.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env2.schemaId || "$id"]);
    this.schemaPath = env2.schemaPath;
    this.localRefs = env2.localRefs;
    this.meta = env2.meta;
    this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
    this.refs = {};
  }
}
compile.SchemaEnv = SchemaEnv2;
function compileSchema(sch) {
  const _sch = getCompilingSchema.call(this, sch);
  if (_sch)
    return _sch;
  const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId);
  const { es5, lines } = this.opts.code;
  const { ownProperties } = this.opts;
  const gen = new codegen_1$m.CodeGen(this.scope, { es5, lines, ownProperties });
  let _ValidationError;
  if (sch.$async) {
    _ValidationError = gen.scopeValue("Error", {
      ref: validation_error_1.default,
      code: (0, codegen_1$m._)`require("ajv/dist/runtime/validation_error").default`
    });
  }
  const validateName = gen.scopeName("validate");
  sch.validateName = validateName;
  const schemaCxt = {
    gen,
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
    this._compilations.add(e), (0, Zg.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
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
Me.compileSchema = Oo;
function xg(e, t, r) {
  var n;
  r = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = r_.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: l } = this.opts;
    o && (a = new ps({ schema: o, schemaId: l, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = e_.call(this, a);
}
Me.resolveRef = xg;
function e_(e) {
  return (0, Xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : Oo.call(this, e);
}
function Iu(e) {
  for (const t of this._compilations)
    if (t_(t, e))
      return t;
}
Me.getCompilingSchema = Iu;
function t_(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function r_(e, t) {
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
    if (o.validate || Oo.call(this, o), a === (0, Xe.normalizeId)(t)) {
      const { schema: l } = o, { schemaId: c } = this.opts, d = l[c];
      return d && (s = (0, Xe.resolveUrl)(this.opts.uriResolver, s, d)), new ps({ schema: l, schemaId: c, root: e, baseId: s });
    }
    return Ds.call(this, r, o);
  }
}
Me.resolveSchema = $s;
const n_ = /* @__PURE__ */ new Set([
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
    const c = r[(0, ac.unescapeFragment)(l)];
    if (c === void 0)
      return;
    r = c;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !n_.has(l) && d && (t = (0, Xe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, ac.schemaHasRulesButRef)(r, this.RULES)) {
    const l = (0, Xe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = $s.call(this, n, l);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new ps({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const s_ = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", a_ = "Meta-schema for $data reference (JSON AnySchema extension proposal)", o_ = "object", i_ = [
  "$data"
], c_ = {
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
}, l_ = !1, u_ = {
  $id: s_,
  description: a_,
  type: o_,
  required: i_,
  properties: c_,
  additionalProperties: l_
};
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const ju = Fl;
ju.code = 'require("ajv/dist/runtime/uri").default';
Io.default = ju;
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
<<<<<<< HEAD
  const n = Ro(), s = jr, a = sr, o = Me, l = x, c = Se, d = _e, u = C, h = u_, E = Io, _ = (P, p) => new RegExp(P, p);
  _.code = "new RegExp";
  const v = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
=======
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return codegen_12.str;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return codegen_12.stringify;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return codegen_12.nil;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return codegen_12.Name;
  } });
  Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
    return codegen_12.CodeGen;
  } });
<<<<<<< HEAD
  const validation_error_12 = validation_error;
=======
  const validation_error_12 = requireValidation_error();
>>>>>>> 4eb554abb94543c7650eb667149d8f3d54f5ef9f
  const ref_error_12 = ref_error;
  const rules_12 = rules;
  const compile_12 = compile;
  const codegen_2 = codegen;
  const resolve_12 = resolve$1;
  const dataType_12 = dataType;
  const util_12 = util;
  const $dataRefSchema = require$$9;
  const uri_1 = uri$1;
  const defaultRegExp = (str, flags) => new RegExp(str, flags);
  defaultRegExp.code = "new RegExp";
  const META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
  const EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
    const Ge = P.strict, Bt = (p = P.code) === null || p === void 0 ? void 0 : p.optimize, Cr = Bt === !0 || Bt === void 0 ? 1 : Bt || 0, Dr = ($ = (S = P.code) === null || S === void 0 ? void 0 : S.regExp) !== null && $ !== void 0 ? $ : _, Ss = (i = P.uriResolver) !== null && i !== void 0 ? i : E.default;
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
})(Zl);
var jo = {}, To = {}, ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const d_ = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
ko.default = d_;
var ar = {};
Object.defineProperty(ar, "__esModule", { value: !0 });
ar.callRef = ar.getValidate = void 0;
const f_ = jr, oc = te, De = x, lr = it, ic = Me, wn = C, h_ = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: l, self: c } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = ic.resolveRef.call(c, d, s, r);
    if (u === void 0)
      throw new f_.default(n.opts.uriResolver, s, r);
    if (u instanceof ic.SchemaEnv)
      return E(u);
    return _(u);
    function h() {
      if (a === d)
        return Fn(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return Fn(e, (0, De._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = Tu(e, v);
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
function Tu(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, De._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
ar.getValidate = Tu;
function Fn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: l, opts: c } = a, d = c.passContext ? lr.default.this : De.nil;
  n ? u() : h();
  function u() {
    if (!l.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, De._)`await ${(0, oc.callValidateCode)(e, t, d)}`), _(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, De._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), E(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, oc.callValidateCode)(e, t, d), () => _(t), () => E(t));
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
ar.default = h_;
Object.defineProperty(To, "__esModule", { value: !0 });
const m_ = ko, p_ = ar, $_ = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  m_.default,
  p_.default
];
To.default = $_;
var Ao = {}, Co = {};
Object.defineProperty(Co, "__esModule", { value: !0 });
const xn = x, St = xn.operators, es = {
  maximum: { okStr: "<=", ok: St.LTE, fail: St.GT },
  minimum: { okStr: ">=", ok: St.GTE, fail: St.LT },
  exclusiveMaximum: { okStr: "<", ok: St.LT, fail: St.GTE },
  exclusiveMinimum: { okStr: ">", ok: St.GT, fail: St.LTE }
}, y_ = {
  message: ({ keyword: e, schemaCode: t }) => (0, xn.str)`must be ${es[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, xn._)`{comparison: ${es[e].okStr}, limit: ${t}}`
}, g_ = {
  keyword: Object.keys(es),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: y_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, xn._)`${r} ${es[t].fail} ${n} || isNaN(${r})`);
  }
};
Co.default = g_;
var Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
const en = x, __ = {
  message: ({ schemaCode: e }) => (0, en.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, en._)`{multipleOf: ${e}}`
}, v_ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: __,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), l = a ? (0, en._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, en._)`${o} !== parseInt(${o})`;
    e.fail$data((0, en._)`(${n} === 0 || (${o} = ${r}/${n}, ${l}))`);
  }
};
Do.default = v_;
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
const er = x, w_ = C, E_ = Lo, b_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, er.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, er._)`{limit: ${e}}`
}, S_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: b_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? er.operators.GT : er.operators.LT, o = s.opts.unicode === !1 ? (0, er._)`${r}.length` : (0, er._)`${(0, w_.useFunc)(e.gen, E_.default)}(${r})`;
    e.fail$data((0, er._)`${o} ${a} ${n}`);
  }
};
Mo.default = S_;
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const P_ = te, ts = x, N_ = {
  message: ({ schemaCode: e }) => (0, ts.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, ts._)`{pattern: ${e}}`
}, R_ = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: N_,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", l = r ? (0, ts._)`(new RegExp(${s}, ${o}))` : (0, P_.usePattern)(e, n);
    e.fail$data((0, ts._)`!${l}.test(${t})`);
  }
};
Vo.default = R_;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const tn = x, O_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, tn.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, tn._)`{limit: ${e}}`
}, I_ = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: O_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? tn.operators.GT : tn.operators.LT;
    e.fail$data((0, tn._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Fo.default = I_;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const Gr = te, rn = x, j_ = C, T_ = {
  message: ({ params: { missingProperty: e } }) => (0, rn.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, rn._)`{missingProperty: ${e}}`
}, k_ = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: T_,
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
          (0, j_.checkStrictMode)(o, m, o.opts.strictRequired);
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
zo.default = k_;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const nn = x, A_ = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, nn.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, nn._)`{limit: ${e}}`
}, C_ = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: A_,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? nn.operators.GT : nn.operators.LT;
    e.fail$data((0, nn._)`${r}.length ${s} ${n}`);
  }
};
Uo.default = C_;
var qo = {}, fn = {};
Object.defineProperty(fn, "__esModule", { value: !0 });
const Au = is;
Au.code = 'require("ajv/dist/runtime/equal").default';
fn.default = Au;
Object.defineProperty(qo, "__esModule", { value: !0 });
const Ms = _e, Ee = x, D_ = C, M_ = fn, L_ = {
  message: ({ params: { i: e, j: t } }) => (0, Ee.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Ee._)`{i: ${e}, j: ${t}}`
}, V_ = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: L_,
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
      const y = (0, D_.useFunc)(t, M_.default), m = t.name("outer");
      t.label(m).for((0, Ee._)`;${v}--;`, () => t.for((0, Ee._)`${g} = ${v}; ${g}--;`, () => t.if((0, Ee._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(c, !1).break(m);
      })));
    }
  }
};
qo.default = V_;
var Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const aa = x, F_ = C, z_ = fn, U_ = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, aa._)`{allowedValue: ${e}}`
}, q_ = {
  keyword: "const",
  $data: !0,
  error: U_,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, aa._)`!${(0, F_.useFunc)(t, z_.default)}(${r}, ${s})`) : e.fail((0, aa._)`${a} !== ${r}`);
  }
};
Go.default = q_;
var Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const Jr = x, G_ = C, K_ = fn, H_ = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Jr._)`{allowedValues: ${e}}`
}, B_ = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: H_,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const l = s.length >= o.opts.loopEnum;
    let c;
    const d = () => c ?? (c = (0, G_.useFunc)(t, K_.default));
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
Ko.default = B_;
Object.defineProperty(Ao, "__esModule", { value: !0 });
const J_ = Co, W_ = Do, X_ = Mo, Y_ = Vo, Q_ = Fo, Z_ = zo, x_ = Uo, ev = qo, tv = Go, rv = Ko, nv = [
  // number
  J_.default,
  W_.default,
  // string
  X_.default,
  Y_.default,
  // object
  Q_.default,
  Z_.default,
  // array
  x_.default,
  ev.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  tv.default,
  rv.default
];
Ao.default = nv;
var Ho = {}, Tr = {};
Object.defineProperty(Tr, "__esModule", { value: !0 });
Tr.validateAdditionalItems = void 0;
const tr = x, oa = C, sv = {
  message: ({ params: { len: e } }) => (0, tr.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, tr._)`{limit: ${e}}`
}, av = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: sv,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, oa.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Cu(e, n);
  }
};
function Cu(e, t) {
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
Tr.validateAdditionalItems = Cu;
Tr.default = av;
var Bo = {}, kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.validateTuple = void 0;
const cc = x, zn = C, ov = te, iv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Du(e, "additionalItems", t);
    r.items = !0, !(0, zn.alwaysValidSchema)(r, t) && e.ok((0, ov.validateArray)(e));
  }
};
function Du(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: l } = e;
  u(s), l.opts.unevaluated && r.length && l.items !== !0 && (l.items = zn.mergeEvaluated.items(n, r.length, l.items));
  const c = n.name("valid"), d = n.const("len", (0, cc._)`${a}.length`);
  r.forEach((h, E) => {
    (0, zn.alwaysValidSchema)(l, h) || (n.if((0, cc._)`${d} > ${E}`, () => e.subschema({
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
kr.validateTuple = Du;
kr.default = iv;
Object.defineProperty(Bo, "__esModule", { value: !0 });
const cv = kr, lv = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, cv.validateTuple)(e, "items")
};
Bo.default = lv;
var Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const lc = x, uv = C, dv = te, fv = Tr, hv = {
  message: ({ params: { len: e } }) => (0, lc.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, lc._)`{limit: ${e}}`
}, mv = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: hv,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, uv.alwaysValidSchema)(n, t) && (s ? (0, fv.validateAdditionalItems)(e, s) : e.ok((0, dv.validateArray)(e)));
  }
};
Jo.default = mv;
var Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
const qe = x, En = C, pv = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe.str)`must contain at least ${e} valid item(s)` : (0, qe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, qe._)`{minContains: ${e}}` : (0, qe._)`{minContains: ${e}, maxContains: ${t}}`
}, $v = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: pv,
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
Wo.default = $v;
var Mu = {};
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
})(Mu);
var Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
const Lu = x, yv = C, gv = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Lu._)`{propertyName: ${e.propertyName}}`
}, _v = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: gv,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, yv.alwaysValidSchema)(s, r))
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
Xo.default = _v;
var ys = {};
Object.defineProperty(ys, "__esModule", { value: !0 });
const bn = te, Je = x, vv = it, Sn = C, wv = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Je._)`{additionalProperty: ${e.additionalProperty}}`
}, Ev = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: wv,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: l, opts: c } = o;
    if (o.props = !0, c.removeAdditional !== "all" && (0, Sn.alwaysValidSchema)(o, r))
      return;
    const d = (0, bn.allSchemaProperties)(n.properties), u = (0, bn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Je._)`${a} === ${vv.default.errors}`);
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
      } else d.length ? m = (0, Je.or)(...d.map((w) => (0, Je._)`${y} === ${w}`)) : m = Je.nil;
      return u.length && (m = (0, Je.or)(m, ...u.map((w) => (0, Je._)`${(0, bn.usePattern)(e, w)}.test(${y})`))), (0, Je.not)(m);
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
      if (typeof r == "object" && !(0, Sn.alwaysValidSchema)(o, r)) {
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
ys.default = Ev;
var Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
const bv = Qe, uc = te, Ls = C, dc = ys, Sv = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && dc.default.code(new bv.KeywordCxt(a, dc.default, "additionalProperties"));
    const o = (0, uc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ls.mergeEvaluated.props(t, (0, Ls.toHash)(o), a.props));
    const l = o.filter((h) => !(0, Ls.alwaysValidSchema)(a, r[h]));
    if (l.length === 0)
      return;
    const c = t.name("valid");
    for (const h of l)
      d(h) ? u(h) : (t.if((0, uc.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(c, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(c);
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
Yo.default = Sv;
var Qo = {};
Object.defineProperty(Qo, "__esModule", { value: !0 });
const fc = te, Pn = x, hc = C, mc = C, Pv = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, l = (0, fc.allSchemaProperties)(r), c = l.filter((g) => (0, hc.alwaysValidSchema)(a, r[g]));
    if (l.length === 0 || c.length === l.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof Pn.Name) && (a.props = (0, mc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const g of l)
        d && _(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function _(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, hc.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, (y) => {
        t.if((0, Pn._)`${(0, fc.usePattern)(e, g)}.test(${y})`, () => {
          const m = c.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: mc.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, Pn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, Pn.not)(u), () => t.break());
        });
      });
    }
  }
};
Qo.default = Pv;
var Zo = {};
Object.defineProperty(Zo, "__esModule", { value: !0 });
const Nv = C, Rv = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Nv.alwaysValidSchema)(n, r)) {
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
Zo.default = Rv;
var xo = {};
Object.defineProperty(xo, "__esModule", { value: !0 });
const Ov = te, Iv = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Ov.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
xo.default = Iv;
var ei = {};
Object.defineProperty(ei, "__esModule", { value: !0 });
const Un = x, jv = C, Tv = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Un._)`{passingSchemas: ${e.passing}}`
}, kv = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Tv,
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
        (0, jv.alwaysValidSchema)(s, u) ? t.var(c, !0) : E = e.subschema({
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
ei.default = kv;
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
const Av = C, Cv = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Av.alwaysValidSchema)(n, a))
        return;
      const l = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(l);
    });
  }
};
ti.default = Cv;
var ri = {};
Object.defineProperty(ri, "__esModule", { value: !0 });
const rs = x, Vu = C, Dv = {
  message: ({ params: e }) => (0, rs.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, rs._)`{failingKeyword: ${e.ifClause}}`
}, Mv = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Dv,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Vu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = pc(n, "then"), a = pc(n, "else");
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
function pc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Vu.alwaysValidSchema)(e, r);
}
ri.default = Mv;
var ni = {};
Object.defineProperty(ni, "__esModule", { value: !0 });
const Lv = C, Vv = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, Lv.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
ni.default = Vv;
Object.defineProperty(Ho, "__esModule", { value: !0 });
const Fv = Tr, zv = Bo, Uv = kr, qv = Jo, Gv = Wo, Kv = Mu, Hv = Xo, Bv = ys, Jv = Yo, Wv = Qo, Xv = Zo, Yv = xo, Qv = ei, Zv = ti, xv = ri, ew = ni;
function tw(e = !1) {
  const t = [
    // any
    Xv.default,
    Yv.default,
    Qv.default,
    Zv.default,
    xv.default,
    ew.default,
    // object
    Hv.default,
    Bv.default,
    Kv.default,
    Jv.default,
    Wv.default
  ];
  return e ? t.push(zv.default, qv.default) : t.push(Fv.default, Uv.default), t.push(Gv.default), t;
}
Ho.default = tw;
var si = {}, ai = {};
Object.defineProperty(ai, "__esModule", { value: !0 });
const $e = x, rw = {
  message: ({ schemaCode: e }) => (0, $e.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, $e._)`{format: ${e}}`
}, nw = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: rw,
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
ai.default = nw;
Object.defineProperty(si, "__esModule", { value: !0 });
const sw = ai, aw = [sw.default];
si.default = aw;
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
Object.defineProperty(jo, "__esModule", { value: !0 });
const ow = To, iw = Ao, cw = Ho, lw = si, $c = Sr, uw = [
  ow.default,
  iw.default,
  (0, cw.default)(),
  lw.default,
  $c.metadataVocabulary,
  $c.contentVocabulary
];
jo.default = uw;
var oi = {}, gs = {};
Object.defineProperty(gs, "__esModule", { value: !0 });
gs.DiscrError = void 0;
var yc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(yc || (gs.DiscrError = yc = {}));
Object.defineProperty(oi, "__esModule", { value: !0 });
const mr = x, ia = gs, gc = Me, dw = jr, fw = C, hw = {
  message: ({ params: { discrError: e, tagName: t } }) => e === ia.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, mr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, mw = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: hw,
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
        if (O != null && O.$ref && !(0, fw.schemaHasRulesButRef)(O, a.self.RULES)) {
          const W = O.$ref;
          if (O = gc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, W), O instanceof gc.SchemaEnv && (O = O.schema), O === void 0)
            throw new dw.default(a.opts.uriResolver, a.baseId, W);
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
oi.default = mw;
const pw = "http://json-schema.org/draft-07/schema#", $w = "http://json-schema.org/draft-07/schema#", yw = "Core schema meta-schema", gw = {
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
}, _w = [
  "object",
  "boolean"
], vw = {
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
}, ww = {
  $schema: pw,
  $id: $w,
  title: yw,
  definitions: gw,
  type: _w,
  properties: vw,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = Zl, n = jo, s = oi, a = ww, o = ["/properties"], l = "http://json-schema.org/draft-07/schema";
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
  var h = Ro();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var E = jr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
<<<<<<< HEAD
})(ea, ea.exports);
var Ew = ea.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = Ew, r = x, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: l, schemaCode: c }) => (0, r.str)`should be ${s[l].okStr} ${c}`,
    params: ({ keyword: l, schemaCode: c }) => (0, r._)`{comparison: ${s[l].okStr}, limit: ${c}}`
=======
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return codegen_12.nil;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return codegen_12.Name;
  } });
  Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
    return codegen_12.CodeGen;
  } });
  var validation_error_12 = validation_error;
  Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
    return validation_error_12.default;
  } });
  var ref_error_12 = ref_error;
  Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
    return ref_error_12.default;
  } });
})(ajv, ajv.exports);
var ajvExports = ajv.exports;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.formatLimitDefinition = void 0;
  const ajv_1 = ajvExports;
  const codegen_12 = codegen;
  const ops2 = codegen_12.operators;
  const KWDs2 = {
    formatMaximum: { okStr: "<=", ok: ops2.LTE, fail: ops2.GT },
    formatMinimum: { okStr: ">=", ok: ops2.GTE, fail: ops2.LT },
    formatExclusiveMaximum: { okStr: "<", ok: ops2.LT, fail: ops2.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: ops2.GT, fail: ops2.LTE }
>>>>>>> ee7793ab6655d81cc965f800b5aef3a331ff0aa3
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
})(Ql);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Yl, n = Ql, s = x, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), l = (d, u = { keywords: !0 }) => {
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
var bw = xs.exports;
const Sw = /* @__PURE__ */ Yc(bw), Pw = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !Nw(s, a) && n || Object.defineProperty(e, r, a);
}, Nw = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Rw = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, Ow = (e, t) => `/* Wrapped ${e}*/
${t}`, Iw = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), jw = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Tw = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = Ow.bind(null, n, t.toString());
  Object.defineProperty(s, "name", jw);
  const { writable: a, enumerable: o, configurable: l } = Iw;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: l });
};
function kw(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Pw(e, t, s, r);
  return Rw(e, t), Tw(e, t, n), e;
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
  let o, l, c;
  const d = function(...u) {
    const h = this, E = () => {
      o = void 0, l && (clearTimeout(l), l = void 0), a && (c = e.apply(h, u));
    }, _ = () => {
      l = void 0, o && (clearTimeout(o), o = void 0), a && (c = e.apply(h, u));
    }, v = s && !o;
    return clearTimeout(o), o = setTimeout(E, r), n > 0 && n !== Number.POSITIVE_INFINITY && !l && (l = setTimeout(_, n)), v && (c = e.apply(h, u)), c;
  };
  return kw(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), l && (clearTimeout(l), l = void 0);
  }, d;
};
var ca = { exports: {} };
const Aw = "2.0.0", Fu = 256, Cw = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Dw = 16, Mw = Fu - 6, Lw = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var _s = {
  MAX_LENGTH: Fu,
  MAX_SAFE_COMPONENT_LENGTH: Dw,
  MAX_SAFE_BUILD_LENGTH: Mw,
  MAX_SAFE_INTEGER: Cw,
  RELEASE_TYPES: Lw,
  SEMVER_SPEC_VERSION: Aw,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Vw = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var vs = Vw;
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
var hn = ca.exports;
const Fw = Object.freeze({ loose: !0 }), zw = Object.freeze({}), Uw = (e) => e ? typeof e != "object" ? Fw : e : zw;
var ii = Uw;
const vc = /^[0-9]+$/, zu = (e, t) => {
  const r = vc.test(e), n = vc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, qw = (e, t) => zu(t, e);
var Uu = {
  compareIdentifiers: zu,
  rcompareIdentifiers: qw
};
const Nn = vs, { MAX_LENGTH: wc, MAX_SAFE_INTEGER: Rn } = _s, { safeRe: On, t: In } = hn, Gw = ii, { compareIdentifiers: ur } = Uu;
let Kw = class et {
  constructor(t, r) {
    if (r = Gw(r), t instanceof et) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > wc)
      throw new TypeError(
        `version is longer than ${wc} characters`
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
var Ae = Kw;
const Ec = Ae, Hw = (e, t, r = !1) => {
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
var Ar = Hw;
const Bw = Ar, Jw = (e, t) => {
  const r = Bw(e, t);
  return r ? r.version : null;
};
var Ww = Jw;
const Xw = Ar, Yw = (e, t) => {
  const r = Xw(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Qw = Yw;
const bc = Ae, Zw = (e, t, r, n, s) => {
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
var xw = Zw;
const Sc = Ar, eE = (e, t) => {
  const r = Sc(e, null, !0), n = Sc(t, null, !0), s = r.compare(n);
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
var tE = eE;
const rE = Ae, nE = (e, t) => new rE(e, t).major;
var sE = nE;
const aE = Ae, oE = (e, t) => new aE(e, t).minor;
var iE = oE;
const cE = Ae, lE = (e, t) => new cE(e, t).patch;
var uE = lE;
const dE = Ar, fE = (e, t) => {
  const r = dE(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var hE = fE;
const Pc = Ae, mE = (e, t, r) => new Pc(e, r).compare(new Pc(t, r));
var Ze = mE;
const pE = Ze, $E = (e, t, r) => pE(t, e, r);
var yE = $E;
const gE = Ze, _E = (e, t) => gE(e, t, !0);
var vE = _E;
const Nc = Ae, wE = (e, t, r) => {
  const n = new Nc(e, r), s = new Nc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var ci = wE;
const EE = ci, bE = (e, t) => e.sort((r, n) => EE(r, n, t));
var SE = bE;
const PE = ci, NE = (e, t) => e.sort((r, n) => PE(n, r, t));
var RE = NE;
const OE = Ze, IE = (e, t, r) => OE(e, t, r) > 0;
var ws = IE;
const jE = Ze, TE = (e, t, r) => jE(e, t, r) < 0;
var li = TE;
const kE = Ze, AE = (e, t, r) => kE(e, t, r) === 0;
var qu = AE;
const CE = Ze, DE = (e, t, r) => CE(e, t, r) !== 0;
var Gu = DE;
const ME = Ze, LE = (e, t, r) => ME(e, t, r) >= 0;
var ui = LE;
const VE = Ze, FE = (e, t, r) => VE(e, t, r) <= 0;
var di = FE;
const zE = qu, UE = Gu, qE = ws, GE = ui, KE = li, HE = di, BE = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return zE(e, r, n);
    case "!=":
      return UE(e, r, n);
    case ">":
      return qE(e, r, n);
    case ">=":
      return GE(e, r, n);
    case "<":
      return KE(e, r, n);
    case "<=":
      return HE(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Ku = BE;
const JE = Ae, WE = Ar, { safeRe: jn, t: Tn } = hn, XE = (e, t) => {
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
  return WE(`${n}.${s}.${a}${o}${l}`, t);
};
var YE = XE;
class QE {
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
var ZE = QE, Vs, Rc;
function xe() {
  if (Rc) return Vs;
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
  const r = ZE, n = new r(), s = ii, a = Es(), o = vs, l = Ae, {
    safeRe: c,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: E
  } = hn, { FLAG_INCLUDE_PRERELEASE: _, FLAG_LOOSE: v } = _s, g = (j) => j.value === "<0.0.0-0", y = (j) => j.value === "", m = (j, k) => {
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
var Fs, Oc;
function Es() {
  if (Oc) return Fs;
  Oc = 1;
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
  const r = ii, { safeRe: n, t: s } = hn, a = Ku, o = vs, l = Ae, c = xe();
  return Fs;
}
const xE = xe(), eb = (e, t, r) => {
  try {
    t = new xE(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var bs = eb;
const tb = xe(), rb = (e, t) => new tb(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var nb = rb;
const sb = Ae, ab = xe(), ob = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new ab(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new sb(n, r));
  }), n;
};
var ib = ob;
const cb = Ae, lb = xe(), ub = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new lb(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new cb(n, r));
  }), n;
};
var db = ub;
const zs = Ae, fb = xe(), Ic = ws, hb = (e, t) => {
  e = new fb(e, t);
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
var mb = hb;
const pb = xe(), $b = (e, t) => {
  try {
    return new pb(e, t).range || "*";
  } catch {
    return null;
  }
};
var yb = $b;
const gb = Ae, Hu = Es(), { ANY: _b } = Hu, vb = xe(), wb = bs, jc = ws, Tc = li, Eb = di, bb = ui, Sb = (e, t, r, n) => {
  e = new gb(e, n), t = new vb(t, n);
  let s, a, o, l, c;
  switch (r) {
    case ">":
      s = jc, a = Eb, o = Tc, l = ">", c = ">=";
      break;
    case "<":
      s = Tc, a = bb, o = jc, l = "<", c = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (wb(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, E = null;
    if (u.forEach((_) => {
      _.semver === _b && (_ = new Hu(">=0.0.0")), h = h || _, E = E || _, s(_.semver, h.semver, n) ? h = _ : o(_.semver, E.semver, n) && (E = _);
    }), h.operator === l || h.operator === c || (!E.operator || E.operator === l) && a(e, E.semver))
      return !1;
    if (E.operator === c && o(e, E.semver))
      return !1;
  }
  return !0;
};
var fi = Sb;
const Pb = fi, Nb = (e, t, r) => Pb(e, t, ">", r);
var Rb = Nb;
const Ob = fi, Ib = (e, t, r) => Ob(e, t, "<", r);
var jb = Ib;
const kc = xe(), Tb = (e, t, r) => (e = new kc(e, r), t = new kc(t, r), e.intersects(t, r));
var kb = Tb;
const Ab = bs, Cb = Ze;
var Db = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((u, h) => Cb(u, h, r));
  for (const u of o)
    Ab(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const l = [];
  for (const [u, h] of n)
    u === h ? l.push(u) : !h && u === o[0] ? l.push("*") : h ? u === o[0] ? l.push(`<=${h}`) : l.push(`${u} - ${h}`) : l.push(`>=${u}`);
  const c = l.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return c.length < d.length ? c : t;
};
const Ac = xe(), hi = Es(), { ANY: Us } = hi, Kr = bs, mi = Ze, Mb = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Ac(e, r), t = new Ac(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = Vb(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, Lb = [new hi(">=0.0.0-0")], Cc = [new hi(">=0.0.0")], Vb = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === Us) {
    if (t.length === 1 && t[0].semver === Us)
      return !0;
    r.includePrerelease ? e = Lb : e = Cc;
  }
  if (t.length === 1 && t[0].semver === Us) {
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
        if (l = Dc(s, _, r), l === _ && l !== s)
          return !1;
      } else if (s.operator === ">=" && !Kr(s.semver, String(_), r))
        return !1;
    }
    if (a) {
      if (h && _.semver.prerelease && _.semver.prerelease.length && _.semver.major === h.major && _.semver.minor === h.minor && _.semver.patch === h.patch && (h = !1), _.operator === "<" || _.operator === "<=") {
        if (c = Mc(a, _, r), c === _ && c !== a)
          return !1;
      } else if (a.operator === "<=" && !Kr(a.semver, String(_), r))
        return !1;
    }
    if (!_.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || E || h);
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
var Fb = Mb;
const qs = hn, Lc = _s, zb = Ae, Vc = Uu, Ub = Ar, qb = Ww, Gb = Qw, Kb = xw, Hb = tE, Bb = sE, Jb = iE, Wb = uE, Xb = hE, Yb = Ze, Qb = yE, Zb = vE, xb = ci, e1 = SE, t1 = RE, r1 = ws, n1 = li, s1 = qu, a1 = Gu, o1 = ui, i1 = di, c1 = Ku, l1 = YE, u1 = Es(), d1 = xe(), f1 = bs, h1 = nb, m1 = ib, p1 = db, $1 = mb, y1 = yb, g1 = fi, _1 = Rb, v1 = jb, w1 = kb, E1 = Db, b1 = Fb;
var S1 = {
  parse: Ub,
  valid: qb,
  clean: Gb,
  inc: Kb,
  diff: Hb,
  major: Bb,
  minor: Jb,
  patch: Wb,
  prerelease: Xb,
  compare: Yb,
  rcompare: Qb,
  compareLoose: Zb,
  compareBuild: xb,
  sort: e1,
  rsort: t1,
  gt: r1,
  lt: n1,
  eq: s1,
  neq: a1,
  gte: o1,
  lte: i1,
  cmp: c1,
  coerce: l1,
  Comparator: u1,
  Range: d1,
  satisfies: f1,
  toComparators: h1,
  maxSatisfying: m1,
  minSatisfying: p1,
  minVersion: $1,
  validRange: y1,
  outside: g1,
  gtr: _1,
  ltr: v1,
  intersects: w1,
  simplifyRange: E1,
  subset: b1,
  SemVer: zb,
  re: qs.re,
  src: qs.src,
  tokens: qs.t,
  SEMVER_SPEC_VERSION: Lc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Lc.RELEASE_TYPES,
  compareIdentifiers: Vc.compareIdentifiers,
  rcompareIdentifiers: Vc.rcompareIdentifiers
};
const dr = /* @__PURE__ */ Yc(S1), P1 = Object.prototype.toString, N1 = "[object Uint8Array]", R1 = "[object ArrayBuffer]";
function Bu(e, t, r) {
  return e ? e.constructor === t ? !0 : P1.call(e) === r : !1;
}
function Ju(e) {
  return Bu(e, Uint8Array, N1);
}
function O1(e) {
  return Bu(e, ArrayBuffer, R1);
}
function I1(e) {
  return Ju(e) || O1(e);
}
function j1(e) {
  if (!Ju(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function T1(e) {
  if (!I1(e))
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
const kn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function zc(e, t = "utf8") {
  return T1(e), kn[t] ?? (kn[t] = new globalThis.TextDecoder(t)), kn[t].decode(e);
}
function k1(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const A1 = new globalThis.TextEncoder();
function Gs(e) {
  return k1(e), A1.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const C1 = Sw.default, Uc = "aes-256-cbc", fr = () => /* @__PURE__ */ Object.create(null), D1 = (e) => e != null, M1 = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, qn = "__internal__", Ks = `${qn}.migrations.version`;
var Ot, lt, Fe, ut;
class L1 {
  constructor(t = {}) {
    Mr(this, "path");
    Mr(this, "events");
    Lr(this, Ot);
    Lr(this, lt);
    Lr(this, Fe);
    Lr(this, ut, {});
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
      r.cwd = cd(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (Vr(this, Fe, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new f0.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      C1(o);
      const l = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      Vr(this, Ot, o.compile(l));
      for (const [c, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (fe(this, ut)[c] = d.default);
    }
    r.defaults && Vr(this, ut, {
      ...fe(this, ut),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), Vr(this, lt, r.encryptionKey);
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
      xu.deepEqual(s, a);
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
      M1(a, o), fe(this, Fe).accessPropertiesByDotNotation ? yi(n, a, o) : n[a] = o;
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
      D1(fe(this, ut)[r]) && this.set(r, fe(this, ut)[r]);
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
    this.store = fr();
    for (const t of Object.keys(fe(this, ut)))
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
      const t = Z.readFileSync(this.path, fe(this, lt) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
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
    if (!fe(this, lt))
      return typeof t == "string" ? t : zc(t);
    try {
      const r = t.slice(0, 16), n = Fr.pbkdf2Sync(fe(this, lt), r.toString(), 1e4, 32, "sha512"), s = Fr.createDecipheriv(Uc, n, r), a = t.slice(17), o = typeof a == "string" ? Gs(a) : a;
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
    Z.mkdirSync(oe.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (fe(this, lt)) {
      const n = Fr.randomBytes(16), s = Fr.pbkdf2Sync(fe(this, lt), n.toString(), 1e4, 32, "sha512"), a = Fr.createCipheriv(Uc, s, n);
      r = Fc([n, Gs(":"), a.update(Gs(r)), a.final()]);
    }
    if (ve.env.SNAP)
      Z.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
    else
      try {
        Xc(this.path, r, { mode: fe(this, Fe).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          Z.writeFileSync(this.path, r, { mode: fe(this, Fe).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), Z.existsSync(this.path) || this._write(fr()), ve.platform === "win32" ? Z.watch(this.path, { persistent: !1 }, _c(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : Z.watchFile(this.path, { persistent: !1 }, _c(() => {
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
    return rd(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    yi(n, t, r), this.store = n;
  }
}
Ot = new WeakMap(), lt = new WeakMap(), Fe = new WeakMap(), ut = new WeakMap();
const { app: Gn, ipcMain: la, shell: V1 } = Hc;
let qc = !1;
const Gc = () => {
  if (!la || !Gn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Gn.getPath("userData"),
    appVersion: Gn.getVersion()
  };
  return qc || (la.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), qc = !0), e;
};
class F1 extends L1 {
  constructor(t) {
    let r, n;
    if (ve.type === "renderer") {
      const s = Hc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else la && Gn && ({ defaultCwd: r, appVersion: n } = Gc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = oe.isAbsolute(t.cwd) ? t.cwd : oe.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Gc();
  }
  async openInEditor() {
    const t = await V1.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const vr = ne.dirname(ed(import.meta.url));
process.env.APP_ROOT = ne.join(vr, "..");
const ua = process.env.VITE_DEV_SERVER_URL, rS = ne.join(process.env.APP_ROOT, "dist-electron"), Wu = ne.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = ua ? ne.join(process.env.APP_ROOT, "public") : Wu;
let se, Kn = null;
const dt = /* @__PURE__ */ new Map(), ns = {
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
}, Hn = new F1({
  defaults: {
    formData: ns
  },
  name: "app-config"
});
ot.handle("save-data", async (e, t, r) => {
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
ot.handle("load-data", async () => {
  try {
    return Hn.get("formData", ns);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), ns;
  }
});
ot.handle("select-folder", async () => {
  const e = await Bc.showOpenDialog(se, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
ot.handle("select-file", async () => {
  const e = await Bc.showOpenDialog(se, {
    properties: ["openFile"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhum arquivo selecionado"), null;
  const t = e.filePaths[0];
  return console.log("Arquivo selecionado:", t), t;
});
ot.handle("clean-db", async () => (console.log("Limpando banco de dados..."), new Promise((e) => {
  setTimeout(() => {
    console.log("Banco de dados limpo com sucesso"), e(!0);
  }, 1e3);
})));
ot.handle("print-pdf", async (e, t) => {
  try {
    const r = new da({
      width: 800,
      height: 600,
      show: !0,
      webPreferences: {
        plugins: !0,
        nodeIntegration: !1,
        contextIsolation: !0
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
});
ot.handle("start-fork", async (e, { script: t, args: r = [] } = {}) => {
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
    const c = fa(s, r, {
      stdio: ["pipe", "pipe", "ipc"],
      cwd: o,
      silent: !1,
      env: { ...process.env }
    }), d = c.pid;
    if (console.log("Child process forked with PID:", d), typeof d == "number")
      dt.set(d, c), console.log("Child process added to children map. Total children:", dt.size);
    else
      return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
    return new Promise((u, h) => {
      const E = setTimeout(() => {
        h(new Error("Timeout waiting for WebSocket port from backend"));
      }, 1e4), _ = (v) => {
        v && v.type === "websocket-port" && typeof v.port == "number" && (clearTimeout(E), c.off("message", _), u({ ok: !0, port: v.port, pid: d }));
      };
      c.on("message", _), c.on("error", (v) => {
        console.error("Child process error:", v), typeof c.pid == "number" && dt.delete(c.pid), clearTimeout(E), h(v);
      }), c.on("exit", (v, g) => {
        console.log(`Child process ${c.pid} exited with code ${v} and signal ${g}`), typeof c.pid == "number" && dt.delete(c.pid), se && !se.isDestroyed() && se.webContents.send("child-exit", { pid: c.pid, code: v, signal: g }), clearTimeout(E), h(new Error(`Child process exited with code ${v}`));
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
ot.handle("start-collector-fork", async (e, { args: t = [] } = {}) => {
  const r = ne.dirname(ne.dirname(vr)), n = [
    ne.join(r, "back-end", "dist", "src", "collector", "runner.js"),
    ne.join(r, "back-end", "dist", "collector", "runner.js"),
    ne.join(r, "back-end", "src", "collector", "runner.ts")
  ], s = n.find((a) => Nt.existsSync(a)) || n[0];
  if (!Nt.existsSync(s)) return { ok: !1, reason: "collector-not-found", attempted: n };
  try {
    const a = fa(s, t, { stdio: ["pipe", "pipe", "ipc"], cwd: ne.dirname(s), env: { ...process.env } }), o = a.pid;
    return typeof o == "number" && (dt.set(o, a), a.on("message", (l) => {
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
ot.handle("send-to-child", async (e, { pid: t, msg: r } = {}) => {
  if (console.log("send-to-child called with PID:", t, "Message type:", r == null ? void 0 : r.type), console.log("Available children PIDs:", Array.from(dt.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
  const n = dt.get(t);
  if (!n) {
    if (console.log("Child not found for PID:", t), Kn)
      try {
        const s = ne.dirname(Kn), a = fa(Kn, [], { stdio: ["pipe", "pipe", "ipc"], cwd: s, silent: !1, env: { ...process.env } }), o = a.pid;
        if (typeof o == "number") {
          dt.set(o, a), se && !se.isDestroyed() && se.webContents.send("child-message", { pid: o, msg: { type: "event", event: "reforked", payload: { oldPid: t, newPid: o } } });
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
ot.handle("stop-child", async (e, { pid: t } = {}) => {
  if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
  const r = dt.get(t);
  if (!r) return { ok: !1, reason: "not-found" };
  try {
    return r.kill("SIGTERM"), { ok: !0 };
  } catch (n) {
    return { ok: !1, reason: String(n) };
  }
});
function Kc() {
  se = new da({
    icon: ne.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: ne.join(vr, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), se.maximize(), se.webContents.on("did-finish-load", () => {
    se == null || se.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ua ? se.loadURL(ua) : se.loadFile(ne.join(Wu, "index.html"));
}
sn.whenReady().then(() => {
  Kc(), sn.on("activate", () => {
    da.getAllWindows().length === 0 && Kc();
  });
});
sn.on("window-all-closed", () => {
  process.platform !== "darwin" && sn.quit();
});
const z1 = ne.join(sn.getPath("userData"), "error.log"), Xu = Nt.createWriteStream(z1, { flags: "a" });
process.on("uncaughtException", (e) => {
  Xu.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`);
});
process.on("unhandledRejection", (e) => {
  Xu.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`);
});
export {
  rS as MAIN_DIST,
  Wu as RENDERER_DIST,
  ua as VITE_DEV_SERVER_URL
};
