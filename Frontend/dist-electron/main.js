var Su = Object.defineProperty;
var ni = (e) => {
  throw TypeError(e);
};
var Pu = (e, t, r) => t in e ? Su(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Ir = (e, t, r) => Pu(e, typeof t != "symbol" ? t + "" : t, r), si = (e, t, r) => t.has(e) || ni("Cannot " + r);
var $e = (e, t, r) => (si(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Tr = (e, t, r) => t.has(e) ? ni("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), jr = (e, t, r, n) => (si(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import kc, { ipcMain as ot, dialog as Ac, BrowserWindow as Cc, app as Lt } from "electron";
import * as ue from "path";
import Pe from "node:process";
import le from "node:path";
import { promisify as Ce, isDeepStrictEqual as Nu } from "node:util";
import se from "node:fs";
import kr from "node:crypto";
import Ru from "node:assert";
import Yn from "node:os";
import Qt from "fs";
import { fileURLToPath as Ou } from "url";
import { fork as Qn, spawn as Iu } from "child_process";
const Zt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, gs = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), Tu = new Set("0123456789");
function Zn(e) {
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
        if (gs.has(r))
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
          if (gs.has(r))
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
        if (n === "index" && !Tu.has(a))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), s && (s = !1, r += "\\"), r += a;
      }
    }
  switch (s && (r += "\\"), n) {
    case "property": {
      if (gs.has(r))
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
function na(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Dc(e, t) {
  if (na(e, t))
    throw new Error("Cannot use string index");
}
function ju(e, t, r) {
  if (!Zt(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = Zn(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (na(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function ai(e, t, r) {
  if (!Zt(e) || typeof t != "string")
    return e;
  const n = e, s = Zn(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Dc(e, o), a === s.length - 1 ? e[o] = r : Zt(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function ku(e, t) {
  if (!Zt(e) || typeof t != "string")
    return !1;
  const r = Zn(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Dc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !Zt(e))
      return !1;
  }
}
function Au(e, t) {
  if (!Zt(e) || typeof t != "string")
    return !1;
  const r = Zn(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Zt(e) || !(n in e) || na(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const kt = Yn.homedir(), sa = Yn.tmpdir(), { env: ur } = Pe, Cu = (e) => {
  const t = le.join(kt, "Library");
  return {
    data: le.join(t, "Application Support", e),
    config: le.join(t, "Preferences", e),
    cache: le.join(t, "Caches", e),
    log: le.join(t, "Logs", e),
    temp: le.join(sa, e)
  };
}, Du = (e) => {
  const t = ur.APPDATA || le.join(kt, "AppData", "Roaming"), r = ur.LOCALAPPDATA || le.join(kt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: le.join(r, e, "Data"),
    config: le.join(t, e, "Config"),
    cache: le.join(r, e, "Cache"),
    log: le.join(r, e, "Log"),
    temp: le.join(sa, e)
  };
}, Mu = (e) => {
  const t = le.basename(kt);
  return {
    data: le.join(ur.XDG_DATA_HOME || le.join(kt, ".local", "share"), e),
    config: le.join(ur.XDG_CONFIG_HOME || le.join(kt, ".config"), e),
    cache: le.join(ur.XDG_CACHE_HOME || le.join(kt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: le.join(ur.XDG_STATE_HOME || le.join(kt, ".local", "state"), e),
    temp: le.join(sa, t, e)
  };
};
function Lu(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), Pe.platform === "darwin" ? Cu(e) : Pe.platform === "win32" ? Du(e) : Mu(e);
}
const St = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, mt = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, Vu = Pe.getuid ? !Pe.getuid() : !1, Fu = 1e4, He = () => {
}, ye = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!ye.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !Vu && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!ye.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!ye.isNodeError(e))
      throw e;
    if (!ye.isChangeErrorOk(e))
      throw e;
  }
};
class zu {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = Fu, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
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
const Uu = new zu(), Pt = (e, t) => function(n) {
  return function s(...a) {
    return Uu.schedule().then((o) => {
      const c = (d) => (o(), d), l = (d) => {
        if (o(), Date.now() >= n)
          throw d;
        if (t(d)) {
          const u = Math.round(100 * Math.random());
          return new Promise((E) => setTimeout(E, u)).then(() => s.apply(void 0, a));
        }
        throw d;
      };
      return e.apply(void 0, a).then(c, l);
    });
  };
}, Nt = (e, t) => function(n) {
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
}, Me = {
  attempt: {
    /* ASYNC */
    chmod: St(Ce(se.chmod), ye.onChangeError),
    chown: St(Ce(se.chown), ye.onChangeError),
    close: St(Ce(se.close), He),
    fsync: St(Ce(se.fsync), He),
    mkdir: St(Ce(se.mkdir), He),
    realpath: St(Ce(se.realpath), He),
    stat: St(Ce(se.stat), He),
    unlink: St(Ce(se.unlink), He),
    /* SYNC */
    chmodSync: mt(se.chmodSync, ye.onChangeError),
    chownSync: mt(se.chownSync, ye.onChangeError),
    closeSync: mt(se.closeSync, He),
    existsSync: mt(se.existsSync, He),
    fsyncSync: mt(se.fsync, He),
    mkdirSync: mt(se.mkdirSync, He),
    realpathSync: mt(se.realpathSync, He),
    statSync: mt(se.statSync, He),
    unlinkSync: mt(se.unlinkSync, He)
  },
  retry: {
    /* ASYNC */
    close: Pt(Ce(se.close), ye.isRetriableError),
    fsync: Pt(Ce(se.fsync), ye.isRetriableError),
    open: Pt(Ce(se.open), ye.isRetriableError),
    readFile: Pt(Ce(se.readFile), ye.isRetriableError),
    rename: Pt(Ce(se.rename), ye.isRetriableError),
    stat: Pt(Ce(se.stat), ye.isRetriableError),
    write: Pt(Ce(se.write), ye.isRetriableError),
    writeFile: Pt(Ce(se.writeFile), ye.isRetriableError),
    /* SYNC */
    closeSync: Nt(se.closeSync, ye.isRetriableError),
    fsyncSync: Nt(se.fsyncSync, ye.isRetriableError),
    openSync: Nt(se.openSync, ye.isRetriableError),
    readFileSync: Nt(se.readFileSync, ye.isRetriableError),
    renameSync: Nt(se.renameSync, ye.isRetriableError),
    statSync: Nt(se.statSync, ye.isRetriableError),
    writeSync: Nt(se.writeSync, ye.isRetriableError),
    writeFileSync: Nt(se.writeFileSync, ye.isRetriableError)
  }
}, qu = "utf8", oi = 438, Gu = 511, Ku = {}, Hu = Yn.userInfo().uid, Bu = Yn.userInfo().gid, Ju = 1e3, Wu = !!Pe.getuid;
Pe.getuid && Pe.getuid();
const ii = 128, Xu = (e) => e instanceof Error && "code" in e, ci = (e) => typeof e == "string", _s = (e) => e === void 0, Yu = Pe.platform === "linux", Mc = Pe.platform === "win32", aa = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Mc || aa.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Yu && aa.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Qu {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Mc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? Pe.kill(Pe.pid, "SIGTERM") : Pe.kill(Pe.pid, t));
      }
    }, this.hook = () => {
      Pe.once("exit", () => this.exit());
      for (const t of aa)
        try {
          Pe.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Zu = new Qu(), xu = Zu.register, Le = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Le.truncate(t(e));
    return n in Le.store ? Le.get(e, t, r) : (Le.store[n] = r, [n, () => delete Le.store[n]]);
  },
  purge: (e) => {
    Le.store[e] && (delete Le.store[e], Me.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Le.store[e] && (delete Le.store[e], Me.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Le.store)
      Le.purgeSync(e);
  },
  truncate: (e) => {
    const t = le.basename(e);
    if (t.length <= ii)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - ii;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
xu(Le.purgeSyncAll);
function Lc(e, t, r = Ku) {
  if (ci(r))
    return Lc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? Ju) || -1);
  let s = null, a = null, o = null;
  try {
    const c = Me.attempt.realpathSync(e), l = !!c;
    e = c || e, [a, s] = Le.get(e, r.tmpCreate || Le.create, r.tmpPurge !== !1);
    const d = Wu && _s(r.chown), u = _s(r.mode);
    if (l && (d || u)) {
      const h = Me.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), u && (r.mode = h.mode));
    }
    if (!l) {
      const h = le.dirname(e);
      Me.attempt.mkdirSync(h, {
        mode: Gu,
        recursive: !0
      });
    }
    o = Me.retry.openSync(n)(a, "w", r.mode || oi), r.tmpCreated && r.tmpCreated(a), ci(t) ? Me.retry.writeSync(n)(o, t, 0, r.encoding || qu) : _s(t) || Me.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Me.retry.fsyncSync(n)(o) : Me.attempt.fsync(o)), Me.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== Hu || r.chown.gid !== Bu) && Me.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== oi && Me.attempt.chmodSync(a, r.mode);
    try {
      Me.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!Xu(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Me.retry.renameSync(n)(a, Le.truncate(e));
    }
    s(), a = null;
  } finally {
    o && Me.attempt.closeSync(o), a && Le.purge(a);
  }
}
function Vc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ls = { exports: {} }, Fc = {}, at = {}, pr = {}, Zr = {}, te = {}, Yr = {};
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
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((P, O) => `${P}${O}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((P, O) => (O instanceof r && (P[O.str] = (P[O.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const P = [m[0]];
    let O = 0;
    for (; O < w.length; )
      c(P, w[O]), P.push(m[++O]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...w) {
    const P = [$(m[0])];
    let O = 0;
    for (; O < w.length; )
      P.push(a), c(P, w[O]), P.push(a, $(m[++O]));
    return l(P), new n(P);
  }
  e.str = o;
  function c(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = c;
  function l(m) {
    let w = 1;
    for (; w < m.length - 1; ) {
      if (m[w] === a) {
        const P = d(m[w - 1], m[w + 1]);
        if (P !== void 0) {
          m.splice(w - 1, 3, P);
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
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : $(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n($(m));
  }
  e.stringify = E;
  function $(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = $;
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
})(Yr);
var Vs = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Yr;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
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
  class c extends s {
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
      const E = this.toName(d), { prefix: $ } = E, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[$];
      if (g) {
        const w = g.get(v);
        if (w)
          return w;
      } else
        g = this._values[$] = /* @__PURE__ */ new Map();
      g.set(v, E);
      const y = this._scope[$] || (this._scope[$] = []), m = y.length;
      return y[m] = u.ref, E.setValue(u, { property: $, itemIndex: m }), E;
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
      let $ = t.nil;
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
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            $ = (0, t._)`${$}${P} ${m} = ${w};${this.opts._n}`;
          } else if (w = E == null ? void 0 : E(m))
            $ = (0, t._)`${$}${w}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return $;
    }
  }
  e.ValueScope = c;
})(Vs);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Yr, r = Vs;
  var n = Yr;
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
  var s = Vs;
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
      const b = i ? r.varKinds.var : this.varKind, k = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${k};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends a {
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
      return Z(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, b, k) {
      super(i, b, k), this.op = f;
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
  class $ extends a {
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
      let k = b.length;
      for (; k--; ) {
        const A = b[k];
        A.optimizeNames(i, f) || (D(i, A.names), b.splice(k, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => X(i, f.names), {});
    }
  }
  class v extends $ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends $ {
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
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(U(i), f instanceof m ? [f] : f.nodes);
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
      return Z(i, this.condition), this.else && X(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class w extends v {
  }
  w.kind = "for";
  class P extends w {
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
      return X(super.names, this.iteration.names);
    }
  }
  class O extends w {
    constructor(i, f, b, k) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = k;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: k, to: A } = this;
      return `for(${f} ${b}=${k}; ${b}<${A}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = Z(super.names, this.from);
      return Z(i, this.to);
    }
  }
  class T extends w {
    constructor(i, f, b, k) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = k;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = j(this.iterable, i, f), this;
    }
    get names() {
      return X(super.names, this.iterable.names);
    }
  }
  class K extends v {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  K.kind = "func";
  class Y extends $ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
  class ce extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, k;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (k = this.finally) === null || k === void 0 || k.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && X(i, this.catch.names), this.finally && X(i, this.finally.names), i;
    }
  }
  class he extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class ge extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  ge.kind = "finally";
  class G {
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
    _def(i, f, b, k) {
      const A = this._scope.toName(f);
      return b !== void 0 && k && (this._constants[A.str] = b), this._leafNode(new o(i, A, b)), A;
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
      return this._leafNode(new c(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, k] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== k || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, k));
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
      return this._for(new P(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, k, A = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const H = this._scope.toName(i);
      return this._for(new O(A, H, f, b), () => k(H));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, k = r.varKinds.const) {
      const A = this._scope.toName(i);
      if (this.opts.es5) {
        const H = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${H}.length`, (q) => {
          this.var(A, (0, t._)`${H}[${q}]`), b(A);
        });
      }
      return this._for(new T("of", k, A, f), () => b(A));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, k = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const A = this._scope.toName(i);
      return this._for(new T("in", k, A, f), () => b(A));
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
      const k = new ce();
      if (this._blockNode(k), this.code(i), f) {
        const A = this.name("e");
        this._currNode = k.catch = new he(A), f(A);
      }
      return b && (this._currNode = k.finally = new ge(), this.code(b)), this._endBlockNode(he, ge);
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
    func(i, f = t.nil, b, k) {
      return this._blockNode(new K(i, f, b)), k && this.code(k).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(K);
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
  e.CodeGen = G;
  function X(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) + (i[f] || 0);
    return _;
  }
  function Z(_, i) {
    return i instanceof t._CodeOrName ? X(_, i.names) : _;
  }
  function j(_, i, f) {
    if (_ instanceof t.Name)
      return b(_);
    if (!k(_))
      return _;
    return new t._Code(_._items.reduce((A, H) => (H instanceof t.Name && (H = b(H)), H instanceof t._Code ? A.push(...H._items) : A.push(H), A), []));
    function b(A) {
      const H = f[A.str];
      return H === void 0 || i[A.str] !== 1 ? A : (delete i[A.str], H);
    }
    function k(A) {
      return A instanceof t._Code && A._items.some((H) => H instanceof t.Name && i[H.str] === 1 && f[H.str] !== void 0);
    }
  }
  function D(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) - (i[f] || 0);
  }
  function U(_) {
    return typeof _ == "boolean" || typeof _ == "number" || _ === null ? !_ : (0, t._)`!${S(_)}`;
  }
  e.not = U;
  const V = p(e.operators.AND);
  function J(..._) {
    return _.reduce(V);
  }
  e.and = J;
  const z = p(e.operators.OR);
  function N(..._) {
    return _.reduce(z);
  }
  e.or = N;
  function p(_) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${_} ${S(f)}`;
  }
  function S(_) {
    return _ instanceof t.Name ? _ : (0, t._)`(${_})`;
  }
})(te);
var L = {};
Object.defineProperty(L, "__esModule", { value: !0 });
L.checkStrictMode = L.getErrorPath = L.Type = L.useFunc = L.setEvaluated = L.evaluatedPropsToName = L.mergeEvaluated = L.eachItem = L.unescapeJsonPointer = L.escapeJsonPointer = L.escapeFragment = L.unescapeFragment = L.schemaRefOrVal = L.schemaHasRulesButRef = L.schemaHasRules = L.checkUnknownRules = L.alwaysValidSchema = L.toHash = void 0;
const de = te, ed = Yr;
function td(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
L.toHash = td;
function rd(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (zc(e, t), !Uc(t, e.self.RULES.all));
}
L.alwaysValidSchema = rd;
function zc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || Kc(e, `unknown keyword: "${a}"`);
}
L.checkUnknownRules = zc;
function Uc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
L.schemaHasRules = Uc;
function nd(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
L.schemaHasRulesButRef = nd;
function sd({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, de._)`${r}`;
  }
  return (0, de._)`${e}${t}${(0, de.getProperty)(n)}`;
}
L.schemaRefOrVal = sd;
function ad(e) {
  return qc(decodeURIComponent(e));
}
L.unescapeFragment = ad;
function od(e) {
  return encodeURIComponent(oa(e));
}
L.escapeFragment = od;
function oa(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
L.escapeJsonPointer = oa;
function qc(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
L.unescapeJsonPointer = qc;
function id(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
L.eachItem = id;
function li({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof de.Name ? (a instanceof de.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof de.Name ? (t(s, o, a), a) : r(a, o);
    return c === de.Name && !(l instanceof de.Name) ? n(s, l) : l;
  };
}
L.mergeEvaluated = {
  props: li({
    mergeNames: (e, t, r) => e.if((0, de._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, de._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, de._)`${r} || {}`).code((0, de._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, de._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, de._)`${r} || {}`), ia(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Gc
  }),
  items: li({
    mergeNames: (e, t, r) => e.if((0, de._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, de._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, de._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, de._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Gc(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, de._)`{}`);
  return t !== void 0 && ia(e, r, t), r;
}
L.evaluatedPropsToName = Gc;
function ia(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, de._)`${t}${(0, de.getProperty)(n)}`, !0));
}
L.setEvaluated = ia;
const ui = {};
function cd(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: ui[t.code] || (ui[t.code] = new ed._Code(t.code))
  });
}
L.useFunc = cd;
var Fs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Fs || (L.Type = Fs = {}));
function ld(e, t, r) {
  if (e instanceof de.Name) {
    const n = t === Fs.Num;
    return r ? n ? (0, de._)`"[" + ${e} + "]"` : (0, de._)`"['" + ${e} + "']"` : n ? (0, de._)`"/" + ${e}` : (0, de._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, de.getProperty)(e).toString() : "/" + oa(e);
}
L.getErrorPath = ld;
function Kc(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
L.checkStrictMode = Kc;
var Je = {};
Object.defineProperty(Je, "__esModule", { value: !0 });
const De = te, ud = {
  // validation function arguments
  data: new De.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new De.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new De.Name("instancePath"),
  parentData: new De.Name("parentData"),
  parentDataProperty: new De.Name("parentDataProperty"),
  rootData: new De.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new De.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new De.Name("vErrors"),
  // null or array of validation errors
  errors: new De.Name("errors"),
  // counter of validation errors
  this: new De.Name("this"),
  // "globals"
  self: new De.Name("self"),
  scope: new De.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new De.Name("json"),
  jsonPos: new De.Name("jsonPos"),
  jsonLen: new De.Name("jsonLen"),
  jsonPart: new De.Name("jsonPart")
};
Je.default = ud;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = te, r = L, n = Je;
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, P) {
    const { it: O } = y, { gen: T, compositeRule: K, allErrors: Y } = O, ce = h(y, m, w);
    P ?? (K || Y) ? l(T, ce) : d(O, (0, t._)`[${ce}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, w) {
    const { it: P } = y, { gen: O, compositeRule: T, allErrors: K } = P, Y = h(y, m, w);
    l(O, Y), T || K || d(P, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: y, keyword: m, schemaValue: w, data: P, errsCount: O, it: T }) {
    if (O === void 0)
      throw new Error("ajv implementation error");
    const K = y.name("err");
    y.forRange("i", O, n.default.errors, (Y) => {
      y.const(K, (0, t._)`${n.default.vErrors}[${Y}]`), y.if((0, t._)`${K}.instancePath === undefined`, () => y.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), y.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && (y.assign((0, t._)`${K}.schema`, w), y.assign((0, t._)`${K}.data`, P));
    });
  }
  e.extendErrors = c;
  function l(y, m) {
    const w = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: w, validateName: P, schemaEnv: O } = y;
    O.$async ? w.throw((0, t._)`new ${y.ValidationError}(${m})`) : (w.assign((0, t._)`${P}.errors`, m), w.return(!1));
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
    const { createErrors: P } = y.it;
    return P === !1 ? (0, t._)`{}` : E(y, m, w);
  }
  function E(y, m, w = {}) {
    const { gen: P, it: O } = y, T = [
      $(O, w),
      v(y, w)
    ];
    return g(y, m, T), P.object(...T);
  }
  function $({ errorPath: y }, { instancePath: m }) {
    const w = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function v({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: P }) {
    let O = P ? m : (0, t.str)`${m}/${y}`;
    return w && (O = (0, t.str)`${O}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, O];
  }
  function g(y, { params: m, message: w }, P) {
    const { keyword: O, data: T, schemaValue: K, it: Y } = y, { opts: ce, propertyName: he, topSchemaRef: ge, schemaPath: G } = Y;
    P.push([u.keyword, O], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), ce.messages && P.push([u.message, typeof w == "function" ? w(y) : w]), ce.verbose && P.push([u.schema, K], [u.parentSchema, (0, t._)`${ge}${G}`], [n.default.data, T]), he && P.push([u.propertyName, he]);
  }
})(Zr);
Object.defineProperty(pr, "__esModule", { value: !0 });
pr.boolOrEmptySchema = pr.topBoolOrEmptySchema = void 0;
const dd = Zr, fd = te, hd = Je, md = {
  message: "boolean schema is false"
};
function pd(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? Hc(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(hd.default.data) : (t.assign((0, fd._)`${n}.errors`, null), t.return(!0));
}
pr.topBoolOrEmptySchema = pd;
function $d(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), Hc(e)) : r.var(t, !0);
}
pr.boolOrEmptySchema = $d;
function Hc(e, t) {
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
  (0, dd.reportError)(s, md, void 0, t);
}
var be = {}, xt = {};
Object.defineProperty(xt, "__esModule", { value: !0 });
xt.getRules = xt.isJSONType = void 0;
const yd = ["string", "number", "integer", "boolean", "null", "object", "array"], gd = new Set(yd);
function _d(e) {
  return typeof e == "string" && gd.has(e);
}
xt.isJSONType = _d;
function vd() {
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
xt.getRules = vd;
var _t = {};
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.shouldUseRule = _t.shouldUseGroup = _t.schemaHasRulesForType = void 0;
function wd({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Bc(e, n);
}
_t.schemaHasRulesForType = wd;
function Bc(e, t) {
  return t.rules.some((r) => Jc(e, r));
}
_t.shouldUseGroup = Bc;
function Jc(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
_t.shouldUseRule = Jc;
Object.defineProperty(be, "__esModule", { value: !0 });
be.reportTypeError = be.checkDataTypes = be.checkDataType = be.coerceAndCheckDataType = be.getJSONTypes = be.getSchemaTypes = be.DataType = void 0;
const Ed = xt, bd = _t, Sd = Zr, re = te, Wc = L;
var dr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(dr || (be.DataType = dr = {}));
function Pd(e) {
  const t = Xc(e.type);
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
be.getSchemaTypes = Pd;
function Xc(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Ed.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
be.getJSONTypes = Xc;
function Nd(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Rd(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, bd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = ca(t, n, s.strictNumbers, dr.Wrong);
    r.if(c, () => {
      a.length ? Od(e, t, a) : la(e);
    });
  }
  return o;
}
be.coerceAndCheckDataType = Nd;
const Yc = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Rd(e, t) {
  return t ? e.filter((r) => Yc.has(r) || t === "array" && r === "array") : [];
}
function Od(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, re._)`typeof ${s}`), c = n.let("coerced", (0, re._)`undefined`);
  a.coerceTypes === "array" && n.if((0, re._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, re._)`${s}[0]`).assign(o, (0, re._)`typeof ${s}`).if(ca(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, re._)`${c} !== undefined`);
  for (const d of r)
    (Yc.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), la(e), n.endIf(), n.if((0, re._)`${c} !== undefined`, () => {
    n.assign(s, c), Id(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, re._)`${o} == "number" || ${o} == "boolean"`).assign(c, (0, re._)`"" + ${s}`).elseIf((0, re._)`${s} === null`).assign(c, (0, re._)`""`);
        return;
      case "number":
        n.elseIf((0, re._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, re._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, re._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, re._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, re._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, re._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, re._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, re._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(c, (0, re._)`[${s}]`);
    }
  }
}
function Id({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, re._)`${t} !== undefined`, () => e.assign((0, re._)`${t}[${r}]`, n));
}
function zs(e, t, r, n = dr.Correct) {
  const s = n === dr.Correct ? re.operators.EQ : re.operators.NEQ;
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
      a = o((0, re._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, re._)`typeof ${t} ${s} ${e}`;
  }
  return n === dr.Correct ? a : (0, re.not)(a);
  function o(c = re.nil) {
    return (0, re.and)((0, re._)`typeof ${t} == "number"`, c, r ? (0, re._)`isFinite(${t})` : re.nil);
  }
}
be.checkDataType = zs;
function ca(e, t, r, n) {
  if (e.length === 1)
    return zs(e[0], t, r, n);
  let s;
  const a = (0, Wc.toHash)(e);
  if (a.array && a.object) {
    const o = (0, re._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, re._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = re.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, re.and)(s, zs(o, t, r, n));
  return s;
}
be.checkDataTypes = ca;
const Td = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, re._)`{type: ${e}}` : (0, re._)`{type: ${t}}`
};
function la(e) {
  const t = jd(e);
  (0, Sd.reportError)(t, Td);
}
be.reportTypeError = la;
function jd(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Wc.schemaRefOrVal)(e, n, "type");
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
var xn = {};
Object.defineProperty(xn, "__esModule", { value: !0 });
xn.assignDefaults = void 0;
const rr = te, kd = L;
function Ad(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      di(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => di(e, a, s.default));
}
xn.assignDefaults = Ad;
function di(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const c = (0, rr._)`${a}${(0, rr.getProperty)(t)}`;
  if (s) {
    (0, kd.checkStrictMode)(e, `default is ignored for: ${c}`);
    return;
  }
  let l = (0, rr._)`${c} === undefined`;
  o.useDefaults === "empty" && (l = (0, rr._)`${l} || ${c} === null || ${c} === ""`), n.if(l, (0, rr._)`${c} = ${(0, rr.stringify)(r)}`);
}
var ft = {}, oe = {};
Object.defineProperty(oe, "__esModule", { value: !0 });
oe.validateUnion = oe.validateArray = oe.usePattern = oe.callValidateCode = oe.schemaProperties = oe.allSchemaProperties = oe.noPropertyInData = oe.propertyInData = oe.isOwnProperty = oe.hasPropFunc = oe.reportMissingProp = oe.checkMissingProp = oe.checkReportMissingProp = void 0;
const me = te, ua = L, Rt = Je, Cd = L;
function Dd(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(fa(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, me._)`${t}` }, !0), e.error();
  });
}
oe.checkReportMissingProp = Dd;
function Md({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, me.or)(...n.map((a) => (0, me.and)(fa(e, t, a, r.ownProperties), (0, me._)`${s} = ${a}`)));
}
oe.checkMissingProp = Md;
function Ld(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
oe.reportMissingProp = Ld;
function Qc(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, me._)`Object.prototype.hasOwnProperty`
  });
}
oe.hasPropFunc = Qc;
function da(e, t, r) {
  return (0, me._)`${Qc(e)}.call(${t}, ${r})`;
}
oe.isOwnProperty = da;
function Vd(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} !== undefined`;
  return n ? (0, me._)`${s} && ${da(e, t, r)}` : s;
}
oe.propertyInData = Vd;
function fa(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} === undefined`;
  return n ? (0, me.or)(s, (0, me.not)(da(e, t, r))) : s;
}
oe.noPropertyInData = fa;
function Zc(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
oe.allSchemaProperties = Zc;
function Fd(e, t) {
  return Zc(t).filter((r) => !(0, ua.alwaysValidSchema)(e, t[r]));
}
oe.schemaProperties = Fd;
function zd({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, me._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Rt.default.instancePath, (0, me.strConcat)(Rt.default.instancePath, a)],
    [Rt.default.parentData, o.parentData],
    [Rt.default.parentDataProperty, o.parentDataProperty],
    [Rt.default.rootData, Rt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Rt.default.dynamicAnchors, Rt.default.dynamicAnchors]);
  const E = (0, me._)`${u}, ${r.object(...h)}`;
  return l !== me.nil ? (0, me._)`${c}.call(${l}, ${E})` : (0, me._)`${c}(${E})`;
}
oe.callValidateCode = zd;
const Ud = (0, me._)`new RegExp`;
function qd({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, me._)`${s.code === "new RegExp" ? Ud : (0, Cd.useFunc)(e, s)}(${r}, ${n})`
  });
}
oe.usePattern = qd;
function Gd(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return o(() => t.assign(c, !1)), c;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(c) {
    const l = t.const("len", (0, me._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: ua.Type.Num
      }, a), t.if((0, me.not)(a), c);
    });
  }
}
oe.validateArray = Gd;
function Kd(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, ua.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(o, (0, me._)`${o} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, me.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
oe.validateUnion = Kd;
Object.defineProperty(ft, "__esModule", { value: !0 });
ft.validateKeywordUsage = ft.validSchemaType = ft.funcKeywordCode = ft.macroKeywordCode = void 0;
const Fe = te, Ht = Je, Hd = oe, Bd = Zr;
function Jd(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, c = t.macro.call(o.self, s, a, o), l = xc(r, n, c);
  o.opts.validateSchema !== !1 && o.self.validateSchema(c, !0);
  const d = r.name("valid");
  e.subschema({
    schema: c,
    schemaPath: Fe.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
ft.macroKeywordCode = Jd;
function Wd(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: c, it: l } = e;
  Yd(l, t);
  const d = !c && t.compile ? t.compile.call(l.self, a, o, l) : t.validate, u = xc(n, s, d), h = n.let("valid");
  e.block$data(h, E), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function E() {
    if (t.errors === !1)
      g(), t.modifying && fi(e), y(() => e.error());
    else {
      const m = t.async ? $() : v();
      t.modifying && fi(e), y(() => Xd(e, m));
    }
  }
  function $() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, Fe._)`await `), (w) => n.assign(h, !1).if((0, Fe._)`${w} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Fe._)`${w}.errors`), () => n.throw(w))), m;
  }
  function v() {
    const m = (0, Fe._)`${u}.errors`;
    return n.assign(m, null), g(Fe.nil), m;
  }
  function g(m = t.async ? (0, Fe._)`await ` : Fe.nil) {
    const w = l.opts.passContext ? Ht.default.this : Ht.default.self, P = !("compile" in t && !c || t.schema === !1);
    n.assign(h, (0, Fe._)`${m}${(0, Hd.callValidateCode)(e, u, w, P)}`, t.modifying);
  }
  function y(m) {
    var w;
    n.if((0, Fe.not)((w = t.valid) !== null && w !== void 0 ? w : h), m);
  }
}
ft.funcKeywordCode = Wd;
function fi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Fe._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Xd(e, t) {
  const { gen: r } = e;
  r.if((0, Fe._)`Array.isArray(${t})`, () => {
    r.assign(Ht.default.vErrors, (0, Fe._)`${Ht.default.vErrors} === null ? ${t} : ${Ht.default.vErrors}.concat(${t})`).assign(Ht.default.errors, (0, Fe._)`${Ht.default.vErrors}.length`), (0, Bd.extendErrors)(e);
  }, () => e.error());
}
function Yd({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function xc(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Fe.stringify)(r) });
}
function Qd(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
ft.validSchemaType = Qd;
function Zd({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
  if (Array.isArray(s.keyword) ? !s.keyword.includes(a) : s.keyword !== a)
    throw new Error("ajv implementation error");
  const o = s.dependencies;
  if (o != null && o.some((c) => !Object.prototype.hasOwnProperty.call(e, c)))
    throw new Error(`parent schema must have dependencies of ${a}: ${o.join(",")}`);
  if (s.validateSchema && !s.validateSchema(e[a])) {
    const l = `keyword "${a}" value is invalid at path "${n}": ` + r.errorsText(s.validateSchema.errors);
    if (t.validateSchema === "log")
      r.logger.error(l);
    else
      throw new Error(l);
  }
}
ft.validateKeywordUsage = Zd;
var Mt = {};
Object.defineProperty(Mt, "__esModule", { value: !0 });
Mt.extendSubschemaMode = Mt.extendSubschemaData = Mt.getSubschema = void 0;
const dt = te, el = L;
function xd(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const c = e.schema[t];
    return r === void 0 ? {
      schema: c,
      schemaPath: (0, dt._)`${e.schemaPath}${(0, dt.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: c[r],
      schemaPath: (0, dt._)`${e.schemaPath}${(0, dt.getProperty)(t)}${(0, dt.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, el.escapeFragment)(r)}`
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
Mt.getSubschema = xd;
function ef(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: c } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, E = c.let("data", (0, dt._)`${t.data}${(0, dt.getProperty)(r)}`, !0);
    l(E), e.errorPath = (0, dt.str)`${d}${(0, el.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, dt._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof dt.Name ? s : c.let("data", s, !0);
    l(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function l(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Mt.extendSubschemaData = ef;
function tf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Mt.extendSubschemaMode = tf;
var je = {}, es = function e(t, r) {
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
}, tl = { exports: {} }, Ct = tl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  Nn(t, n, s, e, "", e);
};
Ct.keywords = {
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
Ct.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Ct.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Ct.skipKeywords = {
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
function Nn(e, t, r, n, s, a, o, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Ct.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            Nn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in Ct.propsKeywords) {
        if (h && typeof h == "object")
          for (var $ in h)
            Nn(e, t, r, h[$], s + "/" + u + "/" + rf($), a, s, u, n, $);
      } else (u in Ct.keywords || e.allKeys && !(u in Ct.skipKeywords)) && Nn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function rf(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var nf = tl.exports;
Object.defineProperty(je, "__esModule", { value: !0 });
je.getSchemaRefs = je.resolveUrl = je.normalizeId = je._getFullPath = je.getFullPath = je.inlineRef = void 0;
const sf = L, af = es, of = nf, cf = /* @__PURE__ */ new Set([
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
function lf(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Us(e) : t ? rl(e) <= t : !1;
}
je.inlineRef = lf;
const uf = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Us(e) {
  for (const t in e) {
    if (uf.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Us) || typeof r == "object" && Us(r))
      return !0;
  }
  return !1;
}
function rl(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !cf.has(r) && (typeof e[r] == "object" && (0, sf.eachItem)(e[r], (n) => t += rl(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function nl(e, t = "", r) {
  r !== !1 && (t = fr(t));
  const n = e.parse(t);
  return sl(e, n);
}
je.getFullPath = nl;
function sl(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
je._getFullPath = sl;
const df = /#\/?$/;
function fr(e) {
  return e ? e.replace(df, "") : "";
}
je.normalizeId = fr;
function ff(e, t, r) {
  return r = fr(r), e.resolve(t, r);
}
je.resolveUrl = ff;
const hf = /^[a-z_][-a-z0-9._]*$/i;
function mf(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = fr(e[r] || t), a = { "": s }, o = nl(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return of(e, { allKeys: !0 }, (h, E, $, v) => {
    if (v === void 0)
      return;
    const g = o + E;
    let y = a[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[E] = y;
    function m(P) {
      const O = this.opts.uriResolver.resolve;
      if (P = fr(y ? O(y, P) : P), l.has(P))
        throw u(P);
      l.add(P);
      let T = this.refs[P];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, P) : P !== fr(g) && (P[0] === "#" ? (d(h, c[P], P), c[P] = h) : this.refs[P] = g), P;
    }
    function w(P) {
      if (typeof P == "string") {
        if (!hf.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), c;
  function d(h, E, $) {
    if (E !== void 0 && !af(h, E))
      throw u($);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
je.getSchemaRefs = mf;
Object.defineProperty(at, "__esModule", { value: !0 });
at.getData = at.KeywordCxt = at.validateFunctionCode = void 0;
const al = pr, hi = be, ha = _t, Fn = be, pf = xn, Ur = ft, vs = Mt, W = te, x = Je, $f = je, vt = L, Ar = Zr;
function yf(e) {
  if (cl(e) && (ll(e), il(e))) {
    vf(e);
    return;
  }
  ol(e, () => (0, al.topBoolOrEmptySchema)(e));
}
at.validateFunctionCode = yf;
function ol({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, W._)`${x.default.data}, ${x.default.valCxt}`, n.$async, () => {
    e.code((0, W._)`"use strict"; ${mi(r, s)}`), _f(e, s), e.code(a);
  }) : e.func(t, (0, W._)`${x.default.data}, ${gf(s)}`, n.$async, () => e.code(mi(r, s)).code(a));
}
function gf(e) {
  return (0, W._)`{${x.default.instancePath}="", ${x.default.parentData}, ${x.default.parentDataProperty}, ${x.default.rootData}=${x.default.data}${e.dynamicRef ? (0, W._)`, ${x.default.dynamicAnchors}={}` : W.nil}}={}`;
}
function _f(e, t) {
  e.if(x.default.valCxt, () => {
    e.var(x.default.instancePath, (0, W._)`${x.default.valCxt}.${x.default.instancePath}`), e.var(x.default.parentData, (0, W._)`${x.default.valCxt}.${x.default.parentData}`), e.var(x.default.parentDataProperty, (0, W._)`${x.default.valCxt}.${x.default.parentDataProperty}`), e.var(x.default.rootData, (0, W._)`${x.default.valCxt}.${x.default.rootData}`), t.dynamicRef && e.var(x.default.dynamicAnchors, (0, W._)`${x.default.valCxt}.${x.default.dynamicAnchors}`);
  }, () => {
    e.var(x.default.instancePath, (0, W._)`""`), e.var(x.default.parentData, (0, W._)`undefined`), e.var(x.default.parentDataProperty, (0, W._)`undefined`), e.var(x.default.rootData, x.default.data), t.dynamicRef && e.var(x.default.dynamicAnchors, (0, W._)`{}`);
  });
}
function vf(e) {
  const { schema: t, opts: r, gen: n } = e;
  ol(e, () => {
    r.$comment && t.$comment && dl(e), Pf(e), n.let(x.default.vErrors, null), n.let(x.default.errors, 0), r.unevaluated && wf(e), ul(e), Of(e);
  });
}
function wf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, W._)`${r}.evaluated`), t.if((0, W._)`${e.evaluated}.dynamicProps`, () => t.assign((0, W._)`${e.evaluated}.props`, (0, W._)`undefined`)), t.if((0, W._)`${e.evaluated}.dynamicItems`, () => t.assign((0, W._)`${e.evaluated}.items`, (0, W._)`undefined`));
}
function mi(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, W._)`/*# sourceURL=${r} */` : W.nil;
}
function Ef(e, t) {
  if (cl(e) && (ll(e), il(e))) {
    bf(e, t);
    return;
  }
  (0, al.boolOrEmptySchema)(e, t);
}
function il({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function cl(e) {
  return typeof e.schema != "boolean";
}
function bf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && dl(e), Nf(e), Rf(e);
  const a = n.const("_errs", x.default.errors);
  ul(e, a), n.var(t, (0, W._)`${a} === ${x.default.errors}`);
}
function ll(e) {
  (0, vt.checkUnknownRules)(e), Sf(e);
}
function ul(e, t) {
  if (e.opts.jtd)
    return pi(e, [], !1, t);
  const r = (0, hi.getSchemaTypes)(e.schema), n = (0, hi.coerceAndCheckDataType)(e, r);
  pi(e, r, !n, t);
}
function Sf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, vt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Pf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, vt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Nf(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, $f.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function Rf(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function dl({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, W._)`${x.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, W.str)`${n}/$comment`, c = e.scopeValue("root", { ref: t.root });
    e.code((0, W._)`${x.default.self}.opts.$comment(${a}, ${o}, ${c}.schema)`);
  }
}
function Of(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, W._)`${x.default.errors} === 0`, () => t.return(x.default.data), () => t.throw((0, W._)`new ${s}(${x.default.vErrors})`)) : (t.assign((0, W._)`${n}.errors`, x.default.vErrors), a.unevaluated && If(e), t.return((0, W._)`${x.default.errors} === 0`));
}
function If({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof W.Name && e.assign((0, W._)`${t}.props`, r), n instanceof W.Name && e.assign((0, W._)`${t}.items`, n);
}
function pi(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: c, opts: l, self: d } = e, { RULES: u } = d;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, vt.schemaHasRulesButRef)(a, u))) {
    s.block(() => ml(e, "$ref", u.all.$ref.definition));
    return;
  }
  l.jtd || Tf(e, t), s.block(() => {
    for (const E of u.rules)
      h(E);
    h(u.post);
  });
  function h(E) {
    (0, ha.shouldUseGroup)(a, E) && (E.type ? (s.if((0, Fn.checkDataType)(E.type, o, l.strictNumbers)), $i(e, E), t.length === 1 && t[0] === E.type && r && (s.else(), (0, Fn.reportTypeError)(e)), s.endIf()) : $i(e, E), c || s.if((0, W._)`${x.default.errors} === ${n || 0}`));
  }
}
function $i(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, pf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, ha.shouldUseRule)(n, a) && ml(e, a.keyword, a.definition, t.type);
  });
}
function Tf(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (jf(e, t), e.opts.allowUnionTypes || kf(e, t), Af(e, e.dataTypes));
}
function jf(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      fl(e.dataTypes, r) || ma(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Df(e, t);
  }
}
function kf(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && ma(e, "use allowUnionTypes to allow union type keyword");
}
function Af(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, ha.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Cf(t, o)) && ma(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Cf(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function fl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Df(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    fl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function ma(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, vt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class hl {
  constructor(t, r, n) {
    if ((0, Ur.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, vt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", pl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Ur.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", x.default.errors));
  }
  result(t, r, n) {
    this.failResult((0, W.not)(t), r, n);
  }
  failResult(t, r, n) {
    this.gen.if(t), n ? n() : this.error(), r ? (this.gen.else(), r(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
  }
  pass(t, r) {
    this.failResult((0, W.not)(t), void 0, r);
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
    this.fail((0, W._)`${r} !== undefined && (${(0, W.or)(this.invalid$data(), t)})`);
  }
  error(t, r, n) {
    if (r) {
      this.setParams(r), this._error(t, n), this.setParams({});
      return;
    }
    this._error(t, n);
  }
  _error(t, r) {
    (t ? Ar.reportExtraError : Ar.reportError)(this, this.def.error, r);
  }
  $dataError() {
    (0, Ar.reportError)(this, this.def.$dataError || Ar.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, Ar.resetErrorsCount)(this.gen, this.errsCount);
  }
  ok(t) {
    this.allErrors || this.gen.if(t);
  }
  setParams(t, r) {
    r ? Object.assign(this.params, t) : this.params = t;
  }
  block$data(t, r, n = W.nil) {
    this.gen.block(() => {
      this.check$data(t, n), r();
    });
  }
  check$data(t = W.nil, r = W.nil) {
    if (!this.$data)
      return;
    const { gen: n, schemaCode: s, schemaType: a, def: o } = this;
    n.if((0, W.or)((0, W._)`${s} === undefined`, r)), t !== W.nil && n.assign(t, !0), (a.length || o.validateSchema) && (n.elseIf(this.invalid$data()), this.$dataError(), t !== W.nil && n.assign(t, !1)), n.else();
  }
  invalid$data() {
    const { gen: t, schemaCode: r, schemaType: n, def: s, it: a } = this;
    return (0, W.or)(o(), c());
    function o() {
      if (n.length) {
        if (!(r instanceof W.Name))
          throw new Error("ajv implementation error");
        const l = Array.isArray(n) ? n : [n];
        return (0, W._)`${(0, Fn.checkDataTypes)(l, r, a.opts.strictNumbers, Fn.DataType.Wrong)}`;
      }
      return W.nil;
    }
    function c() {
      if (s.validateSchema) {
        const l = t.scopeValue("validate$data", { ref: s.validateSchema });
        return (0, W._)`!${l}(${r})`;
      }
      return W.nil;
    }
  }
  subschema(t, r) {
    const n = (0, vs.getSubschema)(this.it, t);
    (0, vs.extendSubschemaData)(n, this.it, t), (0, vs.extendSubschemaMode)(n, t);
    const s = { ...this.it, ...n, items: void 0, props: void 0 };
    return Ef(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = vt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = vt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, W.Name)), !0;
  }
}
at.KeywordCxt = hl;
function ml(e, t, r, n) {
  const s = new hl(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Ur.funcKeywordCode)(s, r) : "macro" in r ? (0, Ur.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Ur.funcKeywordCode)(s, r);
}
const Mf = /^\/(?:[^~]|~0|~1)*$/, Lf = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function pl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return x.default.rootData;
  if (e[0] === "/") {
    if (!Mf.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = x.default.rootData;
  } else {
    const d = Lf.exec(e);
    if (!d)
      throw new Error(`Invalid JSON-pointer: ${e}`);
    const u = +d[1];
    if (s = d[2], s === "#") {
      if (u >= t)
        throw new Error(l("property/index", u));
      return n[t - u];
    }
    if (u > t)
      throw new Error(l("data", u));
    if (a = r[t - u], !s)
      return a;
  }
  let o = a;
  const c = s.split("/");
  for (const d of c)
    d && (a = (0, W._)`${a}${(0, W.getProperty)((0, vt.unescapeJsonPointer)(d))}`, o = (0, W._)`${o} && ${a}`);
  return o;
  function l(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
at.getData = pl;
var xr = {};
Object.defineProperty(xr, "__esModule", { value: !0 });
class Vf extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
xr.default = Vf;
var gr = {};
Object.defineProperty(gr, "__esModule", { value: !0 });
const ws = je;
let Ff = class extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, ws.resolveUrl)(t, r, n), this.missingSchema = (0, ws.normalizeId)((0, ws.getFullPath)(t, this.missingRef));
  }
};
gr.default = Ff;
var ze = {};
Object.defineProperty(ze, "__esModule", { value: !0 });
ze.resolveSchema = ze.getCompilingSchema = ze.resolveRef = ze.compileSchema = ze.SchemaEnv = void 0;
const Qe = te, zf = xr, qt = Je, rt = je, yi = L, Uf = at;
let ts = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, rt.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
ze.SchemaEnv = ts;
function pa(e) {
  const t = $l.call(this, e);
  if (t)
    return t;
  const r = (0, rt.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Qe.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: zf.default,
    code: (0, Qe._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: o,
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
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Qe.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
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
    this._compilations.add(e), (0, Uf.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(qt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const $ = new Function(`${qt.default.self}`, `${qt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: $ }), $.errors = null, $.schema = e.schema, $.schemaEnv = e, e.$async && ($.$async = !0), this.opts.code.source === !0 && ($.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: v, items: g } = d;
      $.evaluated = {
        props: v instanceof Qe.Name ? void 0 : v,
        items: g instanceof Qe.Name ? void 0 : g,
        dynamicProps: v instanceof Qe.Name,
        dynamicItems: g instanceof Qe.Name
      }, $.source && ($.source.evaluated = (0, Qe.stringify)($.evaluated));
    }
    return e.validate = $, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
ze.compileSchema = pa;
function qf(e, t, r) {
  var n;
  r = (0, rt.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = Hf.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new ts({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = Gf.call(this, a);
}
ze.resolveRef = qf;
function Gf(e) {
  return (0, rt.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : pa.call(this, e);
}
function $l(e) {
  for (const t of this._compilations)
    if (Kf(t, e))
      return t;
}
ze.getCompilingSchema = $l;
function Kf(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Hf(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || rs.call(this, e, t);
}
function rs(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, rt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, rt.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Es.call(this, r, e);
  const a = (0, rt.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = rs.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Es.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || pa.call(this, o), a === (0, rt.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, rt.resolveUrl)(this.opts.uriResolver, s, d)), new ts({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Es.call(this, r, o);
  }
}
ze.resolveSchema = rs;
const Bf = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Es(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, yi.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Bf.has(c) && d && (t = (0, rt.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, yi.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, rt.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = rs.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new ts({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Jf = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Wf = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Xf = "object", Yf = [
  "$data"
], Qf = {
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
}, Zf = !1, xf = {
  $id: Jf,
  description: Wf,
  type: Xf,
  required: Yf,
  properties: Qf,
  additionalProperties: Zf
};
var $a = {}, ns = { exports: {} };
const eh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), yl = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function gl(e) {
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
const th = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function gi(e) {
  return e.length = 0, !0;
}
function rh(e, t, r) {
  if (e.length) {
    const n = gl(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function nh(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, c = rh;
  for (let l = 0; l < e.length; l++) {
    const d = e[l];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (o = !0), !c(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        l > 0 && e[l - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!c(s, n, r))
          break;
        c = gi;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (c === gi ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(gl(s))), r.address = n.join(""), r;
}
function _l(e) {
  if (sh(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = nh(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function sh(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function ah(e) {
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
function oh(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function ih(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!yl(r)) {
      const n = _l(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var vl = {
  nonSimpleDomain: th,
  recomposeAuthority: ih,
  normalizeComponentEncoding: oh,
  removeDotSegments: ah,
  isIPv4: yl,
  isUUID: eh,
  normalizeIPv6: _l
};
const { isUUID: ch } = vl, lh = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function wl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function El(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function bl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function uh(e) {
  return e.secure = wl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function dh(e) {
  if ((e.port === (wl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function fh(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(lh);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = ya(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function hh(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = ya(s);
  a && (e = a.serialize(e, t));
  const o = e, c = e.nss;
  return o.path = `${n || t.nid}:${c}`, t.skipEscape = !0, o;
}
function mh(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !ch(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function ph(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Sl = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: El,
    serialize: bl
  }
), $h = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Sl.domainHost,
    parse: El,
    serialize: bl
  }
), Rn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: uh,
    serialize: dh
  }
), yh = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Rn.domainHost,
    parse: Rn.parse,
    serialize: Rn.serialize
  }
), gh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: fh,
    serialize: hh,
    skipNormalize: !0
  }
), _h = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: mh,
    serialize: ph,
    skipNormalize: !0
  }
), zn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Sl,
    https: $h,
    ws: Rn,
    wss: yh,
    urn: gh,
    "urn:uuid": _h
  }
);
Object.setPrototypeOf(zn, null);
function ya(e) {
  return e && (zn[
    /** @type {SchemeName} */
    e
  ] || zn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var vh = {
  SCHEMES: zn,
  getSchemeHandler: ya
};
const { normalizeIPv6: wh, removeDotSegments: Vr, recomposeAuthority: Eh, normalizeComponentEncoding: an, isIPv4: bh, nonSimpleDomain: Sh } = vl, { SCHEMES: Ph, getSchemeHandler: Pl } = vh;
function Nh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  ht(Et(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  Et(ht(e, t), t)), e;
}
function Rh(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Nl(Et(e, n), Et(t, n), n, !0);
  return n.skipEscape = !0, ht(s, n);
}
function Nl(e, t, r, n) {
  const s = {};
  return n || (e = Et(ht(e, r), r), t = Et(ht(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Vr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Vr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Vr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Vr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function Oh(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = ht(an(Et(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = ht(an(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = ht(an(Et(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = ht(an(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function ht(e, t) {
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
  }, n = Object.assign({}, t), s = [], a = Pl(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Eh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let c = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (c = Vr(c)), o === void 0 && c[0] === "/" && c[1] === "/" && (c = "/%2F" + c.slice(2)), s.push(c);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const Ih = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function Et(e, t) {
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
  const a = e.match(Ih);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (bh(n.host) === !1) {
        const l = wh(n.host);
        n.host = l.host.toLowerCase(), s = l.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Pl(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && Sh(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (c) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + c;
      }
    (!o || o && !o.skipNormalize) && (e.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), o && o.parse && o.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const ga = {
  SCHEMES: Ph,
  normalize: Nh,
  resolve: Rh,
  resolveComponent: Nl,
  equal: Oh,
  serialize: ht,
  parse: Et
};
ns.exports = ga;
ns.exports.default = ga;
ns.exports.fastUri = ga;
var Rl = ns.exports;
Object.defineProperty($a, "__esModule", { value: !0 });
const Ol = Rl;
Ol.code = 'require("ajv/dist/runtime/uri").default';
$a.default = Ol;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = at;
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
  const n = xr, s = gr, a = xt, o = ze, c = te, l = je, d = be, u = L, h = xf, E = $a, $ = (N, p) => new RegExp(N, p);
  $.code = "new RegExp";
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
  function P(N) {
    var p, S, _, i, f, b, k, A, H, q, R, I, C, M, B, ee, _e, Ve, Ne, Re, ve, lt, Ae, Ft, zt;
    const Ye = N.strict, Ut = (p = N.code) === null || p === void 0 ? void 0 : p.optimize, Rr = Ut === !0 || Ut === void 0 ? 1 : Ut || 0, Or = (_ = (S = N.code) === null || S === void 0 ? void 0 : S.regExp) !== null && _ !== void 0 ? _ : $, ys = (i = N.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = N.strictSchema) !== null && f !== void 0 ? f : Ye) !== null && b !== void 0 ? b : !0,
      strictNumbers: (A = (k = N.strictNumbers) !== null && k !== void 0 ? k : Ye) !== null && A !== void 0 ? A : !0,
      strictTypes: (q = (H = N.strictTypes) !== null && H !== void 0 ? H : Ye) !== null && q !== void 0 ? q : "log",
      strictTuples: (I = (R = N.strictTuples) !== null && R !== void 0 ? R : Ye) !== null && I !== void 0 ? I : "log",
      strictRequired: (M = (C = N.strictRequired) !== null && C !== void 0 ? C : Ye) !== null && M !== void 0 ? M : !1,
      code: N.code ? { ...N.code, optimize: Rr, regExp: Or } : { optimize: Rr, regExp: Or },
      loopRequired: (B = N.loopRequired) !== null && B !== void 0 ? B : w,
      loopEnum: (ee = N.loopEnum) !== null && ee !== void 0 ? ee : w,
      meta: (_e = N.meta) !== null && _e !== void 0 ? _e : !0,
      messages: (Ve = N.messages) !== null && Ve !== void 0 ? Ve : !0,
      inlineRefs: (Ne = N.inlineRefs) !== null && Ne !== void 0 ? Ne : !0,
      schemaId: (Re = N.schemaId) !== null && Re !== void 0 ? Re : "$id",
      addUsedSchema: (ve = N.addUsedSchema) !== null && ve !== void 0 ? ve : !0,
      validateSchema: (lt = N.validateSchema) !== null && lt !== void 0 ? lt : !0,
      validateFormats: (Ae = N.validateFormats) !== null && Ae !== void 0 ? Ae : !0,
      unicodeRegExp: (Ft = N.unicodeRegExp) !== null && Ft !== void 0 ? Ft : !0,
      int32range: (zt = N.int32range) !== null && zt !== void 0 ? zt : !0,
      uriResolver: ys
    };
  }
  class O {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...P(p) };
      const { es5: S, lines: _ } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: g, es5: S, lines: _ }), this.logger = X(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, y, p, "NOT SUPPORTED"), T.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ge.call(this), p.formats && ce.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: _ } = this.opts;
      let i = h;
      _ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[_], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let _;
      if (typeof p == "string") {
        if (_ = this.getSchema(p), !_)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        _ = this.compile(p);
      const i = _(S);
      return "$async" in _ || (this.errors = _.errors), i;
    }
    compile(p, S) {
      const _ = this._addSchema(p, S);
      return _.validate || this._compileSchemaEnv(_);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: _ } = this.opts;
      return i.call(this, p, S);
      async function i(q, R) {
        await f.call(this, q.$schema);
        const I = this._addSchema(q, R);
        return I.validate || b.call(this, I);
      }
      async function f(q) {
        q && !this.getSchema(q) && await i.call(this, { $ref: q }, !0);
      }
      async function b(q) {
        try {
          return this._compileSchemaEnv(q);
        } catch (R) {
          if (!(R instanceof s.default))
            throw R;
          return k.call(this, R), await A.call(this, R.missingSchema), b.call(this, q);
        }
      }
      function k({ missingSchema: q, missingRef: R }) {
        if (this.refs[q])
          throw new Error(`AnySchema ${q} is loaded but ${R} cannot be resolved`);
      }
      async function A(q) {
        const R = await H.call(this, q);
        this.refs[q] || await f.call(this, R.$schema), this.refs[q] || this.addSchema(R, q, S);
      }
      async function H(q) {
        const R = this._loading[q];
        if (R)
          return R;
        try {
          return await (this._loading[q] = _(q));
        } finally {
          delete this._loading[q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, _, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, _, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, _, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, _ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, _), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let _;
      if (_ = p.$schema, _ !== void 0 && typeof _ != "string")
        throw new Error("$schema must be a string");
      if (_ = _ || this.opts.defaultMeta || this.defaultMeta(), !_)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(_, p);
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
      for (; typeof (S = K.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: _ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: _ });
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
          const S = K.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let _ = p[this.opts.schemaId];
          return _ && (_ = (0, l.normalizeId)(_), delete this.schemas[_], delete this.refs[_]), this;
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
      let _;
      if (typeof p == "string")
        _ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = _);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, _ = S.keyword, Array.isArray(_) && !_.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, _, S), !S)
        return (0, u.eachItem)(_, (f) => D.call(this, f)), this;
      V.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(_, i.type.length === 0 ? (f) => D.call(this, f, i) : (f) => i.type.forEach((b) => D.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const _ of S.rules) {
        const i = _.rules.findIndex((f) => f.keyword === p);
        i >= 0 && _.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: _ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${_}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const _ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const k of f)
          b = b[k];
        for (const k in _) {
          const A = _[k];
          if (typeof A != "object")
            continue;
          const { $data: H } = A.definition, q = b[k];
          H && q && (b[k] = z(q));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const _ in p) {
        const i = p[_];
        (!S || S.test(_)) && (typeof i == "string" ? delete p[_] : i && !i.meta && (this._cache.delete(i.schema), delete p[_]));
      }
    }
    _addSchema(p, S, _, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: k } = this.opts;
      if (typeof p == "object")
        b = p[k];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let A = this._cache.get(p);
      if (A !== void 0)
        return A;
      _ = (0, l.normalizeId)(b || _);
      const H = l.getSchemaRefs.call(this, p, _);
      return A = new o.SchemaEnv({ schema: p, schemaId: k, meta: S, baseId: _, localRefs: H }), this._cache.set(A.schema, A), f && !_.startsWith("#") && (_ && this._checkUnique(_), this.refs[_] = A), i && this.validateSchema(p, !0), A;
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
  O.ValidationError = n.default, O.MissingRefError = s.default, e.default = O;
  function T(N, p, S, _ = "error") {
    for (const i in N) {
      const f = i;
      f in p && this.logger[_](`${S}: option ${i}. ${N[f]}`);
    }
  }
  function K(N) {
    return N = (0, l.normalizeId)(N), this.schemas[N] || this.refs[N];
  }
  function Y() {
    const N = this.opts.schemas;
    if (N)
      if (Array.isArray(N))
        this.addSchema(N);
      else
        for (const p in N)
          this.addSchema(N[p], p);
  }
  function ce() {
    for (const N in this.opts.formats) {
      const p = this.opts.formats[N];
      p && this.addFormat(N, p);
    }
  }
  function he(N) {
    if (Array.isArray(N)) {
      this.addVocabulary(N);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in N) {
      const S = N[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function ge() {
    const N = { ...this.opts };
    for (const p of v)
      delete N[p];
    return N;
  }
  const G = { log() {
  }, warn() {
  }, error() {
  } };
  function X(N) {
    if (N === !1)
      return G;
    if (N === void 0)
      return console;
    if (N.log && N.warn && N.error)
      return N;
    throw new Error("logger must implement log, warn and error methods");
  }
  const Z = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(N, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(N, (_) => {
      if (S.keywords[_])
        throw new Error(`Keyword ${_} is already defined`);
      if (!Z.test(_))
        throw new Error(`Keyword ${_} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function D(N, p, S) {
    var _;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: A }) => A === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[N] = !0, !p)
      return;
    const k = {
      keyword: N,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? U.call(this, b, k, p.before) : b.rules.push(k), f.all[N] = k, (_ = p.implements) === null || _ === void 0 || _.forEach((A) => this.addKeyword(A));
  }
  function U(N, p, S) {
    const _ = N.rules.findIndex((i) => i.keyword === S);
    _ >= 0 ? N.rules.splice(_, 0, p) : (N.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function V(N) {
    let { metaSchema: p } = N;
    p !== void 0 && (N.$data && this.opts.$data && (p = z(p)), N.validateSchema = this.compile(p, !0));
  }
  const J = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function z(N) {
    return { anyOf: [N, J] };
  }
})(Fc);
var _a = {}, va = {}, wa = {};
Object.defineProperty(wa, "__esModule", { value: !0 });
const Th = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
wa.default = Th;
var bt = {};
Object.defineProperty(bt, "__esModule", { value: !0 });
bt.callRef = bt.getValidate = void 0;
const jh = gr, _i = oe, qe = te, nr = Je, vi = ze, on = L, kh = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = vi.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new jh.default(n.opts.uriResolver, s, r);
    if (u instanceof vi.SchemaEnv)
      return E(u);
    return $(u);
    function h() {
      if (a === d)
        return On(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return On(e, (0, qe._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = Il(e, v);
      On(e, g, v, v.$async);
    }
    function $(v) {
      const g = t.scopeValue("schema", c.code.source === !0 ? { ref: v, code: (0, qe.stringify)(v) } : { ref: v }), y = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: qe.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function Il(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, qe._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
bt.getValidate = Il;
function On(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? nr.default.this : qe.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, qe._)`await ${(0, _i.callValidateCode)(e, t, d)}`), $(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, qe._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), E(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, _i.callValidateCode)(e, t, d), () => $(t), () => E(t));
  }
  function E(v) {
    const g = (0, qe._)`${v}.errors`;
    s.assign(nr.default.vErrors, (0, qe._)`${nr.default.vErrors} === null ? ${g} : ${nr.default.vErrors}.concat(${g})`), s.assign(nr.default.errors, (0, qe._)`${nr.default.vErrors}.length`);
  }
  function $(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = on.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, qe._)`${v}.evaluated.props`);
        a.props = on.mergeEvaluated.props(s, m, a.props, qe.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = on.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, qe._)`${v}.evaluated.items`);
        a.items = on.mergeEvaluated.items(s, m, a.items, qe.Name);
      }
  }
}
bt.callRef = On;
bt.default = kh;
Object.defineProperty(va, "__esModule", { value: !0 });
const Ah = wa, Ch = bt, Dh = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Ah.default,
  Ch.default
];
va.default = Dh;
var Ea = {}, ba = {};
Object.defineProperty(ba, "__esModule", { value: !0 });
const Un = te, Ot = Un.operators, qn = {
  maximum: { okStr: "<=", ok: Ot.LTE, fail: Ot.GT },
  minimum: { okStr: ">=", ok: Ot.GTE, fail: Ot.LT },
  exclusiveMaximum: { okStr: "<", ok: Ot.LT, fail: Ot.GTE },
  exclusiveMinimum: { okStr: ">", ok: Ot.GT, fail: Ot.LTE }
}, Mh = {
  message: ({ keyword: e, schemaCode: t }) => (0, Un.str)`must be ${qn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Un._)`{comparison: ${qn[e].okStr}, limit: ${t}}`
}, Lh = {
  keyword: Object.keys(qn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Mh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Un._)`${r} ${qn[t].fail} ${n} || isNaN(${r})`);
  }
};
ba.default = Lh;
var Sa = {};
Object.defineProperty(Sa, "__esModule", { value: !0 });
const qr = te, Vh = {
  message: ({ schemaCode: e }) => (0, qr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, qr._)`{multipleOf: ${e}}`
}, Fh = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Vh,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, qr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, qr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, qr._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
Sa.default = Fh;
var Pa = {}, Na = {};
Object.defineProperty(Na, "__esModule", { value: !0 });
function Tl(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Na.default = Tl;
Tl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Pa, "__esModule", { value: !0 });
const Bt = te, zh = L, Uh = Na, qh = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Bt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Bt._)`{limit: ${e}}`
}, Gh = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: qh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Bt.operators.GT : Bt.operators.LT, o = s.opts.unicode === !1 ? (0, Bt._)`${r}.length` : (0, Bt._)`${(0, zh.useFunc)(e.gen, Uh.default)}(${r})`;
    e.fail$data((0, Bt._)`${o} ${a} ${n}`);
  }
};
Pa.default = Gh;
var Ra = {};
Object.defineProperty(Ra, "__esModule", { value: !0 });
const Kh = oe, Gn = te, Hh = {
  message: ({ schemaCode: e }) => (0, Gn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Gn._)`{pattern: ${e}}`
}, Bh = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Hh,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", c = r ? (0, Gn._)`(new RegExp(${s}, ${o}))` : (0, Kh.usePattern)(e, n);
    e.fail$data((0, Gn._)`!${c}.test(${t})`);
  }
};
Ra.default = Bh;
var Oa = {};
Object.defineProperty(Oa, "__esModule", { value: !0 });
const Gr = te, Jh = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Gr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Gr._)`{limit: ${e}}`
}, Wh = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Jh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Gr.operators.GT : Gr.operators.LT;
    e.fail$data((0, Gr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Oa.default = Wh;
var Ia = {};
Object.defineProperty(Ia, "__esModule", { value: !0 });
const Cr = oe, Kr = te, Xh = L, Yh = {
  message: ({ params: { missingProperty: e } }) => (0, Kr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Kr._)`{missingProperty: ${e}}`
}, Qh = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Yh,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const $ = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const g of r)
        if (($ == null ? void 0 : $[g]) === void 0 && !v.has(g)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${y}" (strictRequired)`;
          (0, Xh.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (l || a)
        e.block$data(Kr.nil, h);
      else
        for (const $ of r)
          (0, Cr.checkReportMissingProp)(e, $);
    }
    function u() {
      const $ = t.let("missing");
      if (l || a) {
        const v = t.let("valid", !0);
        e.block$data(v, () => E($, v)), e.ok(v);
      } else
        t.if((0, Cr.checkMissingProp)(e, r, $)), (0, Cr.reportMissingProp)(e, $), t.else();
    }
    function h() {
      t.forOf("prop", n, ($) => {
        e.setParams({ missingProperty: $ }), t.if((0, Cr.noPropertyInData)(t, s, $, c.ownProperties), () => e.error());
      });
    }
    function E($, v) {
      e.setParams({ missingProperty: $ }), t.forOf($, n, () => {
        t.assign(v, (0, Cr.propertyInData)(t, s, $, c.ownProperties)), t.if((0, Kr.not)(v), () => {
          e.error(), t.break();
        });
      }, Kr.nil);
    }
  }
};
Ia.default = Qh;
var Ta = {};
Object.defineProperty(Ta, "__esModule", { value: !0 });
const Hr = te, Zh = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Hr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Hr._)`{limit: ${e}}`
}, xh = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Zh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Hr.operators.GT : Hr.operators.LT;
    e.fail$data((0, Hr._)`${r}.length ${s} ${n}`);
  }
};
Ta.default = xh;
var ja = {}, en = {};
Object.defineProperty(en, "__esModule", { value: !0 });
const jl = es;
jl.code = 'require("ajv/dist/runtime/equal").default';
en.default = jl;
Object.defineProperty(ja, "__esModule", { value: !0 });
const bs = be, Oe = te, em = L, tm = en, rm = {
  message: ({ params: { i: e, j: t } }) => (0, Oe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Oe._)`{i: ${e}, j: ${t}}`
}, nm = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: rm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, bs.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, Oe._)`${o} === false`), e.ok(l);
    function u() {
      const v = t.let("i", (0, Oe._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(l, !0), t.if((0, Oe._)`${v} > 1`, () => (h() ? E : $)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function E(v, g) {
      const y = t.name("item"), m = (0, bs.checkDataTypes)(d, y, c.opts.strictNumbers, bs.DataType.Wrong), w = t.const("indices", (0, Oe._)`{}`);
      t.for((0, Oe._)`;${v}--;`, () => {
        t.let(y, (0, Oe._)`${r}[${v}]`), t.if(m, (0, Oe._)`continue`), d.length > 1 && t.if((0, Oe._)`typeof ${y} == "string"`, (0, Oe._)`${y} += "_"`), t.if((0, Oe._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(g, (0, Oe._)`${w}[${y}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Oe._)`${w}[${y}] = ${v}`);
      });
    }
    function $(v, g) {
      const y = (0, em.useFunc)(t, tm.default), m = t.name("outer");
      t.label(m).for((0, Oe._)`;${v}--;`, () => t.for((0, Oe._)`${g} = ${v}; ${g}--;`, () => t.if((0, Oe._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
ja.default = nm;
var ka = {};
Object.defineProperty(ka, "__esModule", { value: !0 });
const qs = te, sm = L, am = en, om = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, qs._)`{allowedValue: ${e}}`
}, im = {
  keyword: "const",
  $data: !0,
  error: om,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, qs._)`!${(0, sm.useFunc)(t, am.default)}(${r}, ${s})`) : e.fail((0, qs._)`${a} !== ${r}`);
  }
};
ka.default = im;
var Aa = {};
Object.defineProperty(Aa, "__esModule", { value: !0 });
const Fr = te, cm = L, lm = en, um = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Fr._)`{allowedValues: ${e}}`
}, dm = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: um,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, cm.useFunc)(t, lm.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const $ = t.const("vSchema", a);
      u = (0, Fr.or)(...s.map((v, g) => E($, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, ($) => t.if((0, Fr._)`${d()}(${r}, ${$})`, () => t.assign(u, !0).break()));
    }
    function E($, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, Fr._)`${d()}(${r}, ${$}[${v}])` : (0, Fr._)`${r} === ${g}`;
    }
  }
};
Aa.default = dm;
Object.defineProperty(Ea, "__esModule", { value: !0 });
const fm = ba, hm = Sa, mm = Pa, pm = Ra, $m = Oa, ym = Ia, gm = Ta, _m = ja, vm = ka, wm = Aa, Em = [
  // number
  fm.default,
  hm.default,
  // string
  mm.default,
  pm.default,
  // object
  $m.default,
  ym.default,
  // array
  gm.default,
  _m.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  vm.default,
  wm.default
];
Ea.default = Em;
var Ca = {}, _r = {};
Object.defineProperty(_r, "__esModule", { value: !0 });
_r.validateAdditionalItems = void 0;
const Jt = te, Gs = L, bm = {
  message: ({ params: { len: e } }) => (0, Jt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Jt._)`{limit: ${e}}`
}, Sm = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: bm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Gs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    kl(e, n);
  }
};
function kl(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, Jt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Jt._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Gs.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Jt._)`${c} <= ${t.length}`);
    r.if((0, Jt.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: Gs.Type.Num }, d), o.allErrors || r.if((0, Jt.not)(d), () => r.break());
    });
  }
}
_r.validateAdditionalItems = kl;
_r.default = Sm;
var Da = {}, vr = {};
Object.defineProperty(vr, "__esModule", { value: !0 });
vr.validateTuple = void 0;
const wi = te, In = L, Pm = oe, Nm = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Al(e, "additionalItems", t);
    r.items = !0, !(0, In.alwaysValidSchema)(r, t) && e.ok((0, Pm.validateArray)(e));
  }
};
function Al(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = In.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, wi._)`${a}.length`);
  r.forEach((h, E) => {
    (0, In.alwaysValidSchema)(c, h) || (n.if((0, wi._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: E, errSchemaPath: $ } = c, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (E.strictTuples && !g) {
      const y = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${$}"`;
      (0, In.checkStrictMode)(c, y, E.strictTuples);
    }
  }
}
vr.validateTuple = Al;
vr.default = Nm;
Object.defineProperty(Da, "__esModule", { value: !0 });
const Rm = vr, Om = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Rm.validateTuple)(e, "items")
};
Da.default = Om;
var Ma = {};
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Ei = te, Im = L, Tm = oe, jm = _r, km = {
  message: ({ params: { len: e } }) => (0, Ei.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ei._)`{limit: ${e}}`
}, Am = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: km,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, Im.alwaysValidSchema)(n, t) && (s ? (0, jm.validateAdditionalItems)(e, s) : e.ok((0, Tm.validateArray)(e)));
  }
};
Ma.default = Am;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const We = te, cn = L, Cm = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, We.str)`must contain at least ${e} valid item(s)` : (0, We.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, We._)`{minContains: ${e}}` : (0, We._)`{minContains: ${e}, maxContains: ${t}}`
}, Dm = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Cm,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, c;
    const { minContains: l, maxContains: d } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, c = d) : o = 1;
    const u = t.const("len", (0, We._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, cn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, cn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, cn.alwaysValidSchema)(a, r)) {
      let g = (0, We._)`${u} >= ${o}`;
      c !== void 0 && (g = (0, We._)`${g} && ${u} <= ${c}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? $(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, We._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const g = t.name("_valid"), y = t.let("count", 0);
      $(g, () => t.if(g, () => v(y)));
    }
    function $(g, y) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: cn.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function v(g) {
      t.code((0, We._)`${g}++`), c === void 0 ? t.if((0, We._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, We._)`${g} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, We._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
La.default = Dm;
var ss = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = te, r = L, n = oe;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
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
    code(l) {
      const [d, u] = a(l);
      o(l, d), c(l, u);
    }
  };
  function a({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(l[h]) ? d : u;
      E[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: E } = l;
    if (Object.keys(d).length === 0)
      return;
    const $ = u.let("missing");
    for (const v in d) {
      const g = d[v];
      if (g.length === 0)
        continue;
      const y = (0, n.propertyInData)(u, h, v, E.opts.ownProperties);
      l.setParams({
        property: v,
        depsCount: g.length,
        deps: g.join(", ")
      }), E.allErrors ? u.if(y, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${y} && (${(0, n.checkMissingProp)(l, g, $)})`), (0, n.reportMissingProp)(l, $), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: E, it: $ } = l, v = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)($, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, $.opts.ownProperties),
        () => {
          const y = l.subschema({ keyword: E, schemaProp: g }, v);
          l.mergeValidEvaluated(y, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), l.ok(v));
  }
  e.validateSchemaDeps = c, e.default = s;
})(ss);
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const Cl = te, Mm = L, Lm = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Cl._)`{propertyName: ${e.propertyName}}`
}, Vm = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Lm,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Mm.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Cl.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Va.default = Vm;
var as = {};
Object.defineProperty(as, "__esModule", { value: !0 });
const ln = oe, et = te, Fm = Je, un = L, zm = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, et._)`{additionalProperty: ${e.additionalProperty}}`
}, Um = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: zm,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, un.alwaysValidSchema)(o, r))
      return;
    const d = (0, ln.allSchemaProperties)(n.properties), u = (0, ln.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, et._)`${a} === ${Fm.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(E(y), () => v(y));
      });
    }
    function E(y) {
      let m;
      if (d.length > 8) {
        const w = (0, un.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, ln.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, et.or)(...d.map((w) => (0, et._)`${y} === ${w}`)) : m = et.nil;
      return u.length && (m = (0, et.or)(m, ...u.map((w) => (0, et._)`${(0, ln.usePattern)(e, w)}.test(${y})`))), (0, et.not)(m);
    }
    function $(y) {
      t.code((0, et._)`delete ${s}[${y}]`);
    }
    function v(y) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        $(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, un.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, et.not)(m), () => {
          e.reset(), $(y);
        })) : (g(y, m), c || t.if((0, et.not)(m), () => t.break()));
      }
    }
    function g(y, m, w) {
      const P = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: un.Type.Str
      };
      w === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
as.default = Um;
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const qm = at, bi = oe, Ss = L, Si = as, Gm = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Si.default.code(new qm.KeywordCxt(a, Si.default, "additionalProperties"));
    const o = (0, bi.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ss.mergeEvaluated.props(t, (0, Ss.toHash)(o), a.props));
    const c = o.filter((h) => !(0, Ss.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, bi.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
Fa.default = Gm;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const Pi = oe, dn = te, Ni = L, Ri = L, Km = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, Pi.allSchemaProperties)(r), l = c.filter((g) => (0, Ni.alwaysValidSchema)(a, r[g]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof dn.Name) && (a.props = (0, Ri.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const g of c)
        d && $(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function $(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, Ni.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, (y) => {
        t.if((0, dn._)`${(0, Pi.usePattern)(e, g)}.test(${y})`, () => {
          const m = l.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: Ri.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, dn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, dn.not)(u), () => t.break());
        });
      });
    }
  }
};
za.default = Km;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const Hm = L, Bm = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Hm.alwaysValidSchema)(n, r)) {
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
Ua.default = Bm;
var qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const Jm = oe, Wm = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Jm.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
qa.default = Wm;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Tn = te, Xm = L, Ym = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Tn._)`{passingSchemas: ${e.passing}}`
}, Qm = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Ym,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, Xm.alwaysValidSchema)(s, u) ? t.var(l, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Tn._)`${l} && ${o}`).assign(o, !1).assign(c, (0, Tn._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), E && e.mergeEvaluated(E, Tn.Name);
        });
      });
    }
  }
};
Ga.default = Qm;
var Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Zm = L, xm = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, Zm.alwaysValidSchema)(n, a))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
Ka.default = xm;
var Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const Kn = te, Dl = L, ep = {
  message: ({ params: e }) => (0, Kn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Kn._)`{failingKeyword: ${e.ifClause}}`
}, tp = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: ep,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Dl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Oi(n, "then"), a = Oi(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, Kn.not)(c), d("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, Kn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Oi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Dl.alwaysValidSchema)(e, r);
}
Ha.default = tp;
var Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
const rp = L, np = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, rp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Ba.default = np;
Object.defineProperty(Ca, "__esModule", { value: !0 });
const sp = _r, ap = Da, op = vr, ip = Ma, cp = La, lp = ss, up = Va, dp = as, fp = Fa, hp = za, mp = Ua, pp = qa, $p = Ga, yp = Ka, gp = Ha, _p = Ba;
function vp(e = !1) {
  const t = [
    // any
    mp.default,
    pp.default,
    $p.default,
    yp.default,
    gp.default,
    _p.default,
    // object
    up.default,
    dp.default,
    lp.default,
    fp.default,
    hp.default
  ];
  return e ? t.push(ap.default, ip.default) : t.push(sp.default, op.default), t.push(cp.default), t;
}
Ca.default = vp;
var Ja = {}, wr = {};
Object.defineProperty(wr, "__esModule", { value: !0 });
wr.dynamicAnchor = void 0;
const Ps = te, wp = Je, Ii = ze, Ep = bt, bp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Ml(e, e.schema)
};
function Ml(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, Ps._)`${wp.default.dynamicAnchors}${(0, Ps.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Sp(e);
  r.if((0, Ps._)`!${s}`, () => r.assign(s, a));
}
wr.dynamicAnchor = Ml;
function Sp(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: c } = t.root, { schemaId: l } = n.opts, d = new Ii.SchemaEnv({ schema: r, schemaId: l, root: s, baseId: a, localRefs: o, meta: c });
  return Ii.compileSchema.call(n, d), (0, Ep.getValidate)(e, d);
}
wr.default = bp;
var Er = {};
Object.defineProperty(Er, "__esModule", { value: !0 });
Er.dynamicRef = void 0;
const Ti = te, Pp = Je, ji = bt, Np = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => Ll(e, e.schema)
};
function Ll(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    o();
  else {
    const l = r.let("valid", !1);
    o(l), e.ok(l);
  }
  function o(l) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, Ti._)`${Pp.default.dynamicAnchors}${(0, Ti.getProperty)(a)}`);
      r.if(d, c(d, l), c(s.validateName, l));
    } else
      c(s.validateName, l)();
  }
  function c(l, d) {
    return d ? () => r.block(() => {
      (0, ji.callRef)(e, l), r.let(d, !0);
    }) : () => (0, ji.callRef)(e, l);
  }
}
Er.dynamicRef = Ll;
Er.default = Np;
var Wa = {};
Object.defineProperty(Wa, "__esModule", { value: !0 });
const Rp = wr, Op = L, Ip = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Rp.dynamicAnchor)(e, "") : (0, Op.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
Wa.default = Ip;
var Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const Tp = Er, jp = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, Tp.dynamicRef)(e, e.schema)
};
Xa.default = jp;
Object.defineProperty(Ja, "__esModule", { value: !0 });
const kp = wr, Ap = Er, Cp = Wa, Dp = Xa, Mp = [kp.default, Ap.default, Cp.default, Dp.default];
Ja.default = Mp;
var Ya = {}, Qa = {};
Object.defineProperty(Qa, "__esModule", { value: !0 });
const ki = ss, Lp = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: ki.error,
  code: (e) => (0, ki.validatePropertyDeps)(e)
};
Qa.default = Lp;
var Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const Vp = ss, Fp = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, Vp.validateSchemaDeps)(e)
};
Za.default = Fp;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const zp = L, Up = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, zp.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
xa.default = Up;
Object.defineProperty(Ya, "__esModule", { value: !0 });
const qp = Qa, Gp = Za, Kp = xa, Hp = [qp.default, Gp.default, Kp.default];
Ya.default = Hp;
var eo = {}, to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const jt = te, Ai = L, Bp = Je, Jp = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, jt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Wp = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: Jp,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: c } = a;
    c instanceof jt.Name ? t.if((0, jt._)`${c} !== true`, () => t.forIn("key", n, (h) => t.if(d(c, h), () => l(h)))) : c !== !0 && t.forIn("key", n, (h) => c === void 0 ? l(h) : t.if(u(c, h), () => l(h))), a.props = !0, e.ok((0, jt._)`${s} === ${Bp.default.errors}`);
    function l(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, Ai.alwaysValidSchema)(a, r)) {
        const E = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Ai.Type.Str
        }, E), o || t.if((0, jt.not)(E), () => t.break());
      }
    }
    function d(h, E) {
      return (0, jt._)`!${h} || !${h}[${E}]`;
    }
    function u(h, E) {
      const $ = [];
      for (const v in h)
        h[v] === !0 && $.push((0, jt._)`${E} !== ${v}`);
      return (0, jt.and)(...$);
    }
  }
};
to.default = Wp;
var ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
const Wt = te, Ci = L, Xp = {
  message: ({ params: { len: e } }) => (0, Wt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Wt._)`{limit: ${e}}`
}, Yp = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: Xp,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, Wt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, Wt._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Ci.alwaysValidSchema)(s, r)) {
      const l = t.var("valid", (0, Wt._)`${o} <= ${a}`);
      t.if((0, Wt.not)(l), () => c(l, a)), e.ok(l);
    }
    s.items = !0;
    function c(l, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: Ci.Type.Num }, l), s.allErrors || t.if((0, Wt.not)(l), () => t.break());
      });
    }
  }
};
ro.default = Yp;
Object.defineProperty(eo, "__esModule", { value: !0 });
const Qp = to, Zp = ro, xp = [Qp.default, Zp.default];
eo.default = xp;
var no = {}, so = {};
Object.defineProperty(so, "__esModule", { value: !0 });
const we = te, e$ = {
  message: ({ schemaCode: e }) => (0, we.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, we._)`{format: ${e}}`
}, t$ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: e$,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? E() : $();
    function E() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), g = r.const("fDef", (0, we._)`${v}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, we._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(y, (0, we._)`${g}.type || "string"`).assign(m, (0, we._)`${g}.validate`), () => r.assign(y, (0, we._)`"string"`).assign(m, g)), e.fail$data((0, we.or)(w(), P()));
      function w() {
        return l.strictSchema === !1 ? we.nil : (0, we._)`${o} && !${m}`;
      }
      function P() {
        const O = u.$async ? (0, we._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, we._)`${m}(${n})`, T = (0, we._)`(typeof ${m} == "function" ? ${O} : ${m}.test(${n}))`;
        return (0, we._)`${m} && ${m} !== true && ${y} === ${t} && !${T}`;
      }
    }
    function $() {
      const v = h.formats[a];
      if (!v) {
        w();
        return;
      }
      if (v === !0)
        return;
      const [g, y, m] = P(v);
      g === t && e.pass(O());
      function w() {
        if (l.strictSchema === !1) {
          h.logger.warn(T());
          return;
        }
        throw new Error(T());
        function T() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(T) {
        const K = T instanceof RegExp ? (0, we.regexpCode)(T) : l.code.formats ? (0, we._)`${l.code.formats}${(0, we.getProperty)(a)}` : void 0, Y = r.scopeValue("formats", { key: a, ref: T, code: K });
        return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, we._)`${Y}.validate`] : ["string", T, Y];
      }
      function O() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, we._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, we._)`${m}(${n})` : (0, we._)`${m}.test(${n})`;
      }
    }
  }
};
so.default = t$;
Object.defineProperty(no, "__esModule", { value: !0 });
const r$ = so, n$ = [r$.default];
no.default = n$;
var $r = {};
Object.defineProperty($r, "__esModule", { value: !0 });
$r.contentVocabulary = $r.metadataVocabulary = void 0;
$r.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
$r.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(_a, "__esModule", { value: !0 });
const s$ = va, a$ = Ea, o$ = Ca, i$ = Ja, c$ = Ya, l$ = eo, u$ = no, Di = $r, d$ = [
  i$.default,
  s$.default,
  a$.default,
  (0, o$.default)(!0),
  u$.default,
  Di.metadataVocabulary,
  Di.contentVocabulary,
  c$.default,
  l$.default
];
_a.default = d$;
var ao = {}, os = {};
Object.defineProperty(os, "__esModule", { value: !0 });
os.DiscrError = void 0;
var Mi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Mi || (os.DiscrError = Mi = {}));
Object.defineProperty(ao, "__esModule", { value: !0 });
const cr = te, Ks = os, Li = ze, f$ = gr, h$ = L, m$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Ks.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, cr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, p$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: m$,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, cr._)`${r}${(0, cr.getProperty)(c)}`);
    t.if((0, cr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Ks.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const $ = E();
      t.if(!1);
      for (const v in $)
        t.elseIf((0, cr._)`${d} === ${v}`), t.assign(l, h($[v]));
      t.else(), e.error(!1, { discrError: Ks.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h($) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: $ }, v);
      return e.mergeEvaluated(g, cr.Name), v;
    }
    function E() {
      var $;
      const v = {}, g = m(s);
      let y = !0;
      for (let O = 0; O < o.length; O++) {
        let T = o[O];
        if (T != null && T.$ref && !(0, h$.schemaHasRulesButRef)(T, a.self.RULES)) {
          const Y = T.$ref;
          if (T = Li.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), T instanceof Li.SchemaEnv && (T = T.schema), T === void 0)
            throw new f$.default(a.opts.uriResolver, a.baseId, Y);
        }
        const K = ($ = T == null ? void 0 : T.properties) === null || $ === void 0 ? void 0 : $[c];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        y = y && (g || m(T)), w(K, O);
      }
      if (!y)
        throw new Error(`discriminator: "${c}" must be required`);
      return v;
      function m({ required: O }) {
        return Array.isArray(O) && O.includes(c);
      }
      function w(O, T) {
        if (O.const)
          P(O.const, T);
        else if (O.enum)
          for (const K of O.enum)
            P(K, T);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function P(O, T) {
        if (typeof O != "string" || O in v)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        v[O] = T;
      }
    }
  }
};
ao.default = p$;
var oo = {};
const $$ = "https://json-schema.org/draft/2020-12/schema", y$ = "https://json-schema.org/draft/2020-12/schema", g$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, _$ = "meta", v$ = "Core and Validation specifications meta-schema", w$ = [
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
], E$ = [
  "object",
  "boolean"
], b$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", S$ = {
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
}, P$ = {
  $schema: $$,
  $id: y$,
  $vocabulary: g$,
  $dynamicAnchor: _$,
  title: v$,
  allOf: w$,
  type: E$,
  $comment: b$,
  properties: S$
}, N$ = "https://json-schema.org/draft/2020-12/schema", R$ = "https://json-schema.org/draft/2020-12/meta/applicator", O$ = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, I$ = "meta", T$ = "Applicator vocabulary meta-schema", j$ = [
  "object",
  "boolean"
], k$ = {
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
}, A$ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, C$ = {
  $schema: N$,
  $id: R$,
  $vocabulary: O$,
  $dynamicAnchor: I$,
  title: T$,
  type: j$,
  properties: k$,
  $defs: A$
}, D$ = "https://json-schema.org/draft/2020-12/schema", M$ = "https://json-schema.org/draft/2020-12/meta/unevaluated", L$ = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, V$ = "meta", F$ = "Unevaluated applicator vocabulary meta-schema", z$ = [
  "object",
  "boolean"
], U$ = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, q$ = {
  $schema: D$,
  $id: M$,
  $vocabulary: L$,
  $dynamicAnchor: V$,
  title: F$,
  type: z$,
  properties: U$
}, G$ = "https://json-schema.org/draft/2020-12/schema", K$ = "https://json-schema.org/draft/2020-12/meta/content", H$ = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, B$ = "meta", J$ = "Content vocabulary meta-schema", W$ = [
  "object",
  "boolean"
], X$ = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Y$ = {
  $schema: G$,
  $id: K$,
  $vocabulary: H$,
  $dynamicAnchor: B$,
  title: J$,
  type: W$,
  properties: X$
}, Q$ = "https://json-schema.org/draft/2020-12/schema", Z$ = "https://json-schema.org/draft/2020-12/meta/core", x$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, ey = "meta", ty = "Core vocabulary meta-schema", ry = [
  "object",
  "boolean"
], ny = {
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
}, sy = {
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
}, ay = {
  $schema: Q$,
  $id: Z$,
  $vocabulary: x$,
  $dynamicAnchor: ey,
  title: ty,
  type: ry,
  properties: ny,
  $defs: sy
}, oy = "https://json-schema.org/draft/2020-12/schema", iy = "https://json-schema.org/draft/2020-12/meta/format-annotation", cy = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, ly = "meta", uy = "Format vocabulary meta-schema for annotation results", dy = [
  "object",
  "boolean"
], fy = {
  format: {
    type: "string"
  }
}, hy = {
  $schema: oy,
  $id: iy,
  $vocabulary: cy,
  $dynamicAnchor: ly,
  title: uy,
  type: dy,
  properties: fy
}, my = "https://json-schema.org/draft/2020-12/schema", py = "https://json-schema.org/draft/2020-12/meta/meta-data", $y = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, yy = "meta", gy = "Meta-data vocabulary meta-schema", _y = [
  "object",
  "boolean"
], vy = {
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
}, wy = {
  $schema: my,
  $id: py,
  $vocabulary: $y,
  $dynamicAnchor: yy,
  title: gy,
  type: _y,
  properties: vy
}, Ey = "https://json-schema.org/draft/2020-12/schema", by = "https://json-schema.org/draft/2020-12/meta/validation", Sy = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Py = "meta", Ny = "Validation vocabulary meta-schema", Ry = [
  "object",
  "boolean"
], Oy = {
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
}, Iy = {
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
}, Ty = {
  $schema: Ey,
  $id: by,
  $vocabulary: Sy,
  $dynamicAnchor: Py,
  title: Ny,
  type: Ry,
  properties: Oy,
  $defs: Iy
};
Object.defineProperty(oo, "__esModule", { value: !0 });
const jy = P$, ky = C$, Ay = q$, Cy = Y$, Dy = ay, My = hy, Ly = wy, Vy = Ty, Fy = ["/properties"];
function zy(e) {
  return [
    jy,
    ky,
    Ay,
    Cy,
    Dy,
    t(this, My),
    Ly,
    t(this, Vy)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, Fy) : n;
  }
}
oo.default = zy;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Fc, n = _a, s = ao, a = oo, o = "https://json-schema.org/draft/2020-12/schema";
  class c extends r.default {
    constructor($ = {}) {
      super({
        ...$,
        dynamicRef: !0,
        next: !0,
        unevaluated: !0
      });
    }
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach(($) => this.addVocabulary($)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data: $, meta: v } = this.opts;
      v && (a.default.call(this, $), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var l = at;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
  } });
  var d = te;
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
  var u = xr;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = gr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Ls, Ls.exports);
var Uy = Ls.exports, Hs = { exports: {} }, Vl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(G, X) {
    return { validate: G, compare: X };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, o),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(l(!0), d),
    "date-time": t(E(!0), $),
    "iso-time": t(l(), u),
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
    regex: ge,
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
    byte: P,
    // signed 32 bit integer
    int32: { type: "number", validate: K },
    // signed 64 bit integer
    int64: { type: "number", validate: Y },
    // C-type float
    float: { type: "number", validate: ce },
    // C-type double
    double: { type: "number", validate: ce },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
    time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, d),
    "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, $),
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
  function r(G) {
    return G % 4 === 0 && (G % 100 !== 0 || G % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(G) {
    const X = n.exec(G);
    if (!X)
      return !1;
    const Z = +X[1], j = +X[2], D = +X[3];
    return j >= 1 && j <= 12 && D >= 1 && D <= (j === 2 && r(Z) ? 29 : s[j]);
  }
  function o(G, X) {
    if (G && X)
      return G > X ? 1 : G < X ? -1 : 0;
  }
  const c = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(G) {
    return function(Z) {
      const j = c.exec(Z);
      if (!j)
        return !1;
      const D = +j[1], U = +j[2], V = +j[3], J = j[4], z = j[5] === "-" ? -1 : 1, N = +(j[6] || 0), p = +(j[7] || 0);
      if (N > 23 || p > 59 || G && !J)
        return !1;
      if (D <= 23 && U <= 59 && V < 60)
        return !0;
      const S = U - p * z, _ = D - N * z - (S < 0 ? 1 : 0);
      return (_ === 23 || _ === -1) && (S === 59 || S === -1) && V < 61;
    };
  }
  function d(G, X) {
    if (!(G && X))
      return;
    const Z = (/* @__PURE__ */ new Date("2020-01-01T" + G)).valueOf(), j = (/* @__PURE__ */ new Date("2020-01-01T" + X)).valueOf();
    if (Z && j)
      return Z - j;
  }
  function u(G, X) {
    if (!(G && X))
      return;
    const Z = c.exec(G), j = c.exec(X);
    if (Z && j)
      return G = Z[1] + Z[2] + Z[3], X = j[1] + j[2] + j[3], G > X ? 1 : G < X ? -1 : 0;
  }
  const h = /t|\s/i;
  function E(G) {
    const X = l(G);
    return function(j) {
      const D = j.split(h);
      return D.length === 2 && a(D[0]) && X(D[1]);
    };
  }
  function $(G, X) {
    if (!(G && X))
      return;
    const Z = new Date(G).valueOf(), j = new Date(X).valueOf();
    if (Z && j)
      return Z - j;
  }
  function v(G, X) {
    if (!(G && X))
      return;
    const [Z, j] = G.split(h), [D, U] = X.split(h), V = o(Z, D);
    if (V !== void 0)
      return V || d(j, U);
  }
  const g = /\/|:/, y = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(G) {
    return g.test(G) && y.test(G);
  }
  const w = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function P(G) {
    return w.lastIndex = 0, w.test(G);
  }
  const O = -2147483648, T = 2 ** 31 - 1;
  function K(G) {
    return Number.isInteger(G) && G <= T && G >= O;
  }
  function Y(G) {
    return Number.isInteger(G);
  }
  function ce() {
    return !0;
  }
  const he = /[^\\]\\Z/;
  function ge(G) {
    if (he.test(G))
      return !1;
    try {
      return new RegExp(G), !0;
    } catch {
      return !1;
    }
  }
})(Vl);
var Fl = {}, Bs = { exports: {} }, zl = {}, pt = {}, Gt = {}, tn = {}, ae = {}, Qr = {};
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
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((P, O) => `${P}${O}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((P, O) => (O instanceof r && (P[O.str] = (P[O.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const P = [m[0]];
    let O = 0;
    for (; O < w.length; )
      c(P, w[O]), P.push(m[++O]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...w) {
    const P = [$(m[0])];
    let O = 0;
    for (; O < w.length; )
      P.push(a), c(P, w[O]), P.push(a, $(m[++O]));
    return l(P), new n(P);
  }
  e.str = o;
  function c(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = c;
  function l(m) {
    let w = 1;
    for (; w < m.length - 1; ) {
      if (m[w] === a) {
        const P = d(m[w - 1], m[w + 1]);
        if (P !== void 0) {
          m.splice(w - 1, 3, P);
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
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : $(Array.isArray(m) ? m.join(",") : m);
  }
  function E(m) {
    return new n($(m));
  }
  e.stringify = E;
  function $(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = $;
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
})(Qr);
var Js = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Qr;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(l) {
    l[l.Started = 0] = "Started", l[l.Completed = 1] = "Completed";
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
  class c extends s {
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
      const E = this.toName(d), { prefix: $ } = E, v = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[$];
      if (g) {
        const w = g.get(v);
        if (w)
          return w;
      } else
        g = this._values[$] = /* @__PURE__ */ new Map();
      g.set(v, E);
      const y = this._scope[$] || (this._scope[$] = []), m = y.length;
      return y[m] = u.ref, E.setValue(u, { property: $, itemIndex: m }), E;
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
      let $ = t.nil;
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
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            $ = (0, t._)`${$}${P} ${m} = ${w};${this.opts._n}`;
          } else if (w = E == null ? void 0 : E(m))
            $ = (0, t._)`${$}${w}${this.opts._n}`;
          else
            throw new r(m);
          y.set(m, n.Completed);
        });
      }
      return $;
    }
  }
  e.ValueScope = c;
})(Js);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Qr, r = Js;
  var n = Qr;
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
      const b = i ? r.varKinds.var : this.varKind, k = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${b} ${this.name}${k};` + f;
    }
    optimizeNames(i, f) {
      if (i[this.name.str])
        return this.rhs && (this.rhs = j(this.rhs, i, f)), this;
    }
    get names() {
      return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
    }
  }
  class c extends a {
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
      return Z(i, this.rhs);
    }
  }
  class l extends c {
    constructor(i, f, b, k) {
      super(i, b, k), this.op = f;
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
  class $ extends a {
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
      let k = b.length;
      for (; k--; ) {
        const A = b[k];
        A.optimizeNames(i, f) || (D(i, A.names), b.splice(k, 1));
      }
      return b.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((i, f) => X(i, f.names), {});
    }
  }
  class v extends $ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends $ {
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
        return i === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(U(i), f instanceof m ? [f] : f.nodes);
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
      return Z(i, this.condition), this.else && X(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class w extends v {
  }
  w.kind = "for";
  class P extends w {
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
      return X(super.names, this.iteration.names);
    }
  }
  class O extends w {
    constructor(i, f, b, k) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = k;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: k, to: A } = this;
      return `for(${f} ${b}=${k}; ${b}<${A}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = Z(super.names, this.from);
      return Z(i, this.to);
    }
  }
  class T extends w {
    constructor(i, f, b, k) {
      super(), this.loop = i, this.varKind = f, this.name = b, this.iterable = k;
    }
    render(i) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(i);
    }
    optimizeNames(i, f) {
      if (super.optimizeNames(i, f))
        return this.iterable = j(this.iterable, i, f), this;
    }
    get names() {
      return X(super.names, this.iterable.names);
    }
  }
  class K extends v {
    constructor(i, f, b) {
      super(), this.name = i, this.args = f, this.async = b;
    }
    render(i) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(i);
    }
  }
  K.kind = "func";
  class Y extends $ {
    render(i) {
      return "return " + super.render(i);
    }
  }
  Y.kind = "return";
  class ce extends v {
    render(i) {
      let f = "try" + super.render(i);
      return this.catch && (f += this.catch.render(i)), this.finally && (f += this.finally.render(i)), f;
    }
    optimizeNodes() {
      var i, f;
      return super.optimizeNodes(), (i = this.catch) === null || i === void 0 || i.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(i, f) {
      var b, k;
      return super.optimizeNames(i, f), (b = this.catch) === null || b === void 0 || b.optimizeNames(i, f), (k = this.finally) === null || k === void 0 || k.optimizeNames(i, f), this;
    }
    get names() {
      const i = super.names;
      return this.catch && X(i, this.catch.names), this.finally && X(i, this.finally.names), i;
    }
  }
  class he extends v {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class ge extends v {
    render(i) {
      return "finally" + super.render(i);
    }
  }
  ge.kind = "finally";
  class G {
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
    _def(i, f, b, k) {
      const A = this._scope.toName(f);
      return b !== void 0 && k && (this._constants[A.str] = b), this._leafNode(new o(i, A, b)), A;
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
      return this._leafNode(new c(i, f, b));
    }
    // `+=` code
    add(i, f) {
      return this._leafNode(new l(i, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(i) {
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new E(i)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...i) {
      const f = ["{"];
      for (const [b, k] of i)
        f.length > 1 && f.push(","), f.push(b), (b !== k || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, k));
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
      return this._for(new P(i), f);
    }
    // `for` statement for a range of values
    forRange(i, f, b, k, A = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const H = this._scope.toName(i);
      return this._for(new O(A, H, f, b), () => k(H));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(i, f, b, k = r.varKinds.const) {
      const A = this._scope.toName(i);
      if (this.opts.es5) {
        const H = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${H}.length`, (q) => {
          this.var(A, (0, t._)`${H}[${q}]`), b(A);
        });
      }
      return this._for(new T("of", k, A, f), () => b(A));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(i, f, b, k = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(i, (0, t._)`Object.keys(${f})`, b);
      const A = this._scope.toName(i);
      return this._for(new T("in", k, A, f), () => b(A));
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
      const k = new ce();
      if (this._blockNode(k), this.code(i), f) {
        const A = this.name("e");
        this._currNode = k.catch = new he(A), f(A);
      }
      return b && (this._currNode = k.finally = new ge(), this.code(b)), this._endBlockNode(he, ge);
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
    func(i, f = t.nil, b, k) {
      return this._blockNode(new K(i, f, b)), k && this.code(k).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(K);
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
  e.CodeGen = G;
  function X(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) + (i[f] || 0);
    return _;
  }
  function Z(_, i) {
    return i instanceof t._CodeOrName ? X(_, i.names) : _;
  }
  function j(_, i, f) {
    if (_ instanceof t.Name)
      return b(_);
    if (!k(_))
      return _;
    return new t._Code(_._items.reduce((A, H) => (H instanceof t.Name && (H = b(H)), H instanceof t._Code ? A.push(...H._items) : A.push(H), A), []));
    function b(A) {
      const H = f[A.str];
      return H === void 0 || i[A.str] !== 1 ? A : (delete i[A.str], H);
    }
    function k(A) {
      return A instanceof t._Code && A._items.some((H) => H instanceof t.Name && i[H.str] === 1 && f[H.str] !== void 0);
    }
  }
  function D(_, i) {
    for (const f in i)
      _[f] = (_[f] || 0) - (i[f] || 0);
  }
  function U(_) {
    return typeof _ == "boolean" || typeof _ == "number" || _ === null ? !_ : (0, t._)`!${S(_)}`;
  }
  e.not = U;
  const V = p(e.operators.AND);
  function J(..._) {
    return _.reduce(V);
  }
  e.and = J;
  const z = p(e.operators.OR);
  function N(..._) {
    return _.reduce(z);
  }
  e.or = N;
  function p(_) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${_} ${S(f)}`;
  }
  function S(_) {
    return _ instanceof t.Name ? _ : (0, t._)`(${_})`;
  }
})(ae);
var F = {};
Object.defineProperty(F, "__esModule", { value: !0 });
F.checkStrictMode = F.getErrorPath = F.Type = F.useFunc = F.setEvaluated = F.evaluatedPropsToName = F.mergeEvaluated = F.eachItem = F.unescapeJsonPointer = F.escapeJsonPointer = F.escapeFragment = F.unescapeFragment = F.schemaRefOrVal = F.schemaHasRulesButRef = F.schemaHasRules = F.checkUnknownRules = F.alwaysValidSchema = F.toHash = void 0;
const fe = ae, qy = Qr;
function Gy(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
F.toHash = Gy;
function Ky(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Ul(e, t), !ql(t, e.self.RULES.all));
}
F.alwaysValidSchema = Ky;
function Ul(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || Hl(e, `unknown keyword: "${a}"`);
}
F.checkUnknownRules = Ul;
function ql(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
F.schemaHasRules = ql;
function Hy(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
F.schemaHasRulesButRef = Hy;
function By({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, fe._)`${r}`;
  }
  return (0, fe._)`${e}${t}${(0, fe.getProperty)(n)}`;
}
F.schemaRefOrVal = By;
function Jy(e) {
  return Gl(decodeURIComponent(e));
}
F.unescapeFragment = Jy;
function Wy(e) {
  return encodeURIComponent(io(e));
}
F.escapeFragment = Wy;
function io(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
F.escapeJsonPointer = io;
function Gl(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
F.unescapeJsonPointer = Gl;
function Xy(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
F.eachItem = Xy;
function Vi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof fe.Name ? (a instanceof fe.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof fe.Name ? (t(s, o, a), a) : r(a, o);
    return c === fe.Name && !(l instanceof fe.Name) ? n(s, l) : l;
  };
}
F.mergeEvaluated = {
  props: Vi({
    mergeNames: (e, t, r) => e.if((0, fe._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, fe._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, fe._)`${r} || {}`).code((0, fe._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, fe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, fe._)`${r} || {}`), co(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Kl
  }),
  items: Vi({
    mergeNames: (e, t, r) => e.if((0, fe._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, fe._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, fe._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, fe._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Kl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, fe._)`{}`);
  return t !== void 0 && co(e, r, t), r;
}
F.evaluatedPropsToName = Kl;
function co(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, fe._)`${t}${(0, fe.getProperty)(n)}`, !0));
}
F.setEvaluated = co;
const Fi = {};
function Yy(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Fi[t.code] || (Fi[t.code] = new qy._Code(t.code))
  });
}
F.useFunc = Yy;
var Ws;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Ws || (F.Type = Ws = {}));
function Qy(e, t, r) {
  if (e instanceof fe.Name) {
    const n = t === Ws.Num;
    return r ? n ? (0, fe._)`"[" + ${e} + "]"` : (0, fe._)`"['" + ${e} + "']"` : n ? (0, fe._)`"/" + ${e}` : (0, fe._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, fe.getProperty)(e).toString() : "/" + io(e);
}
F.getErrorPath = Qy;
function Hl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
F.checkStrictMode = Hl;
var fn = {}, zi;
function Vt() {
  if (zi) return fn;
  zi = 1, Object.defineProperty(fn, "__esModule", { value: !0 });
  const e = ae, t = {
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
  return fn.default = t, fn;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ae, r = F, n = Vt();
  e.keywordError = {
    message: ({ keyword: y }) => (0, t.str)`must pass "${y}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: y, schemaType: m }) => m ? (0, t.str)`"${y}" keyword must be ${m} ($data)` : (0, t.str)`"${y}" keyword is invalid ($data)`
  };
  function s(y, m = e.keywordError, w, P) {
    const { it: O } = y, { gen: T, compositeRule: K, allErrors: Y } = O, ce = h(y, m, w);
    P ?? (K || Y) ? l(T, ce) : d(O, (0, t._)`[${ce}]`);
  }
  e.reportError = s;
  function a(y, m = e.keywordError, w) {
    const { it: P } = y, { gen: O, compositeRule: T, allErrors: K } = P, Y = h(y, m, w);
    l(O, Y), T || K || d(P, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(y, m) {
    y.assign(n.default.errors, m), y.if((0, t._)`${n.default.vErrors} !== null`, () => y.if(m, () => y.assign((0, t._)`${n.default.vErrors}.length`, m), () => y.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: y, keyword: m, schemaValue: w, data: P, errsCount: O, it: T }) {
    if (O === void 0)
      throw new Error("ajv implementation error");
    const K = y.name("err");
    y.forRange("i", O, n.default.errors, (Y) => {
      y.const(K, (0, t._)`${n.default.vErrors}[${Y}]`), y.if((0, t._)`${K}.instancePath === undefined`, () => y.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), y.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && (y.assign((0, t._)`${K}.schema`, w), y.assign((0, t._)`${K}.data`, P));
    });
  }
  e.extendErrors = c;
  function l(y, m) {
    const w = y.const("err", m);
    y.if((0, t._)`${n.default.vErrors} === null`, () => y.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), y.code((0, t._)`${n.default.errors}++`);
  }
  function d(y, m) {
    const { gen: w, validateName: P, schemaEnv: O } = y;
    O.$async ? w.throw((0, t._)`new ${y.ValidationError}(${m})`) : (w.assign((0, t._)`${P}.errors`, m), w.return(!1));
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
    const { createErrors: P } = y.it;
    return P === !1 ? (0, t._)`{}` : E(y, m, w);
  }
  function E(y, m, w = {}) {
    const { gen: P, it: O } = y, T = [
      $(O, w),
      v(y, w)
    ];
    return g(y, m, T), P.object(...T);
  }
  function $({ errorPath: y }, { instancePath: m }) {
    const w = m ? (0, t.str)`${y}${(0, r.getErrorPath)(m, r.Type.Str)}` : y;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function v({ keyword: y, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: P }) {
    let O = P ? m : (0, t.str)`${m}/${y}`;
    return w && (O = (0, t.str)`${O}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, O];
  }
  function g(y, { params: m, message: w }, P) {
    const { keyword: O, data: T, schemaValue: K, it: Y } = y, { opts: ce, propertyName: he, topSchemaRef: ge, schemaPath: G } = Y;
    P.push([u.keyword, O], [u.params, typeof m == "function" ? m(y) : m || (0, t._)`{}`]), ce.messages && P.push([u.message, typeof w == "function" ? w(y) : w]), ce.verbose && P.push([u.schema, K], [u.parentSchema, (0, t._)`${ge}${G}`], [n.default.data, T]), he && P.push([u.propertyName, he]);
  }
})(tn);
var Ui;
function Zy() {
  if (Ui) return Gt;
  Ui = 1, Object.defineProperty(Gt, "__esModule", { value: !0 }), Gt.boolOrEmptySchema = Gt.topBoolOrEmptySchema = void 0;
  const e = tn, t = ae, r = Vt(), n = {
    message: "boolean schema is false"
  };
  function s(c) {
    const { gen: l, schema: d, validateName: u } = c;
    d === !1 ? o(c, !1) : typeof d == "object" && d.$async === !0 ? l.return(r.default.data) : (l.assign((0, t._)`${u}.errors`, null), l.return(!0));
  }
  Gt.topBoolOrEmptySchema = s;
  function a(c, l) {
    const { gen: d, schema: u } = c;
    u === !1 ? (d.var(l, !1), o(c)) : d.var(l, !0);
  }
  Gt.boolOrEmptySchema = a;
  function o(c, l) {
    const { gen: d, data: u } = c, h = {
      gen: d,
      keyword: "false schema",
      data: u,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: c
    };
    (0, e.reportError)(h, n, void 0, l);
  }
  return Gt;
}
var Se = {}, er = {};
Object.defineProperty(er, "__esModule", { value: !0 });
er.getRules = er.isJSONType = void 0;
const xy = ["string", "number", "integer", "boolean", "null", "object", "array"], eg = new Set(xy);
function tg(e) {
  return typeof e == "string" && eg.has(e);
}
er.isJSONType = tg;
function rg() {
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
er.getRules = rg;
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
wt.shouldUseRule = wt.shouldUseGroup = wt.schemaHasRulesForType = void 0;
function ng({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Bl(e, n);
}
wt.schemaHasRulesForType = ng;
function Bl(e, t) {
  return t.rules.some((r) => Jl(e, r));
}
wt.shouldUseGroup = Bl;
function Jl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
wt.shouldUseRule = Jl;
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.reportTypeError = Se.checkDataTypes = Se.checkDataType = Se.coerceAndCheckDataType = Se.getJSONTypes = Se.getSchemaTypes = Se.DataType = void 0;
const sg = er, ag = wt, og = tn, ne = ae, Wl = F;
var hr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(hr || (Se.DataType = hr = {}));
function ig(e) {
  const t = Xl(e.type);
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
Se.getSchemaTypes = ig;
function Xl(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(sg.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Se.getJSONTypes = Xl;
function cg(e, t) {
  const { gen: r, data: n, opts: s } = e, a = lg(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, ag.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = lo(t, n, s.strictNumbers, hr.Wrong);
    r.if(c, () => {
      a.length ? ug(e, t, a) : uo(e);
    });
  }
  return o;
}
Se.coerceAndCheckDataType = cg;
const Yl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function lg(e, t) {
  return t ? e.filter((r) => Yl.has(r) || t === "array" && r === "array") : [];
}
function ug(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, ne._)`typeof ${s}`), c = n.let("coerced", (0, ne._)`undefined`);
  a.coerceTypes === "array" && n.if((0, ne._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, ne._)`${s}[0]`).assign(o, (0, ne._)`typeof ${s}`).if(lo(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, ne._)`${c} !== undefined`);
  for (const d of r)
    (Yl.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), uo(e), n.endIf(), n.if((0, ne._)`${c} !== undefined`, () => {
    n.assign(s, c), dg(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, ne._)`${o} == "number" || ${o} == "boolean"`).assign(c, (0, ne._)`"" + ${s}`).elseIf((0, ne._)`${s} === null`).assign(c, (0, ne._)`""`);
        return;
      case "number":
        n.elseIf((0, ne._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, ne._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, ne._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, ne._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, ne._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, ne._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, ne._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, ne._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(c, (0, ne._)`[${s}]`);
    }
  }
}
function dg({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, ne._)`${t} !== undefined`, () => e.assign((0, ne._)`${t}[${r}]`, n));
}
function Xs(e, t, r, n = hr.Correct) {
  const s = n === hr.Correct ? ne.operators.EQ : ne.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, ne._)`${t} ${s} null`;
    case "array":
      a = (0, ne._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, ne._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = o((0, ne._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, ne._)`typeof ${t} ${s} ${e}`;
  }
  return n === hr.Correct ? a : (0, ne.not)(a);
  function o(c = ne.nil) {
    return (0, ne.and)((0, ne._)`typeof ${t} == "number"`, c, r ? (0, ne._)`isFinite(${t})` : ne.nil);
  }
}
Se.checkDataType = Xs;
function lo(e, t, r, n) {
  if (e.length === 1)
    return Xs(e[0], t, r, n);
  let s;
  const a = (0, Wl.toHash)(e);
  if (a.array && a.object) {
    const o = (0, ne._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, ne._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = ne.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, ne.and)(s, Xs(o, t, r, n));
  return s;
}
Se.checkDataTypes = lo;
const fg = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, ne._)`{type: ${e}}` : (0, ne._)`{type: ${t}}`
};
function uo(e) {
  const t = hg(e);
  (0, og.reportError)(t, fg);
}
Se.reportTypeError = uo;
function hg(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Wl.schemaRefOrVal)(e, n, "type");
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
var Dr = {}, qi;
function mg() {
  if (qi) return Dr;
  qi = 1, Object.defineProperty(Dr, "__esModule", { value: !0 }), Dr.assignDefaults = void 0;
  const e = ae, t = F;
  function r(s, a) {
    const { properties: o, items: c } = s.schema;
    if (a === "object" && o)
      for (const l in o)
        n(s, l, o[l].default);
    else a === "array" && Array.isArray(c) && c.forEach((l, d) => n(s, d, l.default));
  }
  Dr.assignDefaults = r;
  function n(s, a, o) {
    const { gen: c, compositeRule: l, data: d, opts: u } = s;
    if (o === void 0)
      return;
    const h = (0, e._)`${d}${(0, e.getProperty)(a)}`;
    if (l) {
      (0, t.checkStrictMode)(s, `default is ignored for: ${h}`);
      return;
    }
    let E = (0, e._)`${h} === undefined`;
    u.useDefaults === "empty" && (E = (0, e._)`${E} || ${h} === null || ${h} === ""`), c.if(E, (0, e._)`${h} = ${(0, e.stringify)(o)}`);
  }
  return Dr;
}
var Ze = {}, ie = {};
Object.defineProperty(ie, "__esModule", { value: !0 });
ie.validateUnion = ie.validateArray = ie.usePattern = ie.callValidateCode = ie.schemaProperties = ie.allSchemaProperties = ie.noPropertyInData = ie.propertyInData = ie.isOwnProperty = ie.hasPropFunc = ie.reportMissingProp = ie.checkMissingProp = ie.checkReportMissingProp = void 0;
const pe = ae, fo = F, It = Vt(), pg = F;
function $g(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(mo(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, pe._)`${t}` }, !0), e.error();
  });
}
ie.checkReportMissingProp = $g;
function yg({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, pe.or)(...n.map((a) => (0, pe.and)(mo(e, t, a, r.ownProperties), (0, pe._)`${s} = ${a}`)));
}
ie.checkMissingProp = yg;
function gg(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ie.reportMissingProp = gg;
function Ql(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, pe._)`Object.prototype.hasOwnProperty`
  });
}
ie.hasPropFunc = Ql;
function ho(e, t, r) {
  return (0, pe._)`${Ql(e)}.call(${t}, ${r})`;
}
ie.isOwnProperty = ho;
function _g(e, t, r, n) {
  const s = (0, pe._)`${t}${(0, pe.getProperty)(r)} !== undefined`;
  return n ? (0, pe._)`${s} && ${ho(e, t, r)}` : s;
}
ie.propertyInData = _g;
function mo(e, t, r, n) {
  const s = (0, pe._)`${t}${(0, pe.getProperty)(r)} === undefined`;
  return n ? (0, pe.or)(s, (0, pe.not)(ho(e, t, r))) : s;
}
ie.noPropertyInData = mo;
function Zl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ie.allSchemaProperties = Zl;
function vg(e, t) {
  return Zl(t).filter((r) => !(0, fo.alwaysValidSchema)(e, t[r]));
}
ie.schemaProperties = vg;
function wg({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, pe._)`${e}, ${t}, ${n}${s}` : t, h = [
    [It.default.instancePath, (0, pe.strConcat)(It.default.instancePath, a)],
    [It.default.parentData, o.parentData],
    [It.default.parentDataProperty, o.parentDataProperty],
    [It.default.rootData, It.default.rootData]
  ];
  o.opts.dynamicRef && h.push([It.default.dynamicAnchors, It.default.dynamicAnchors]);
  const E = (0, pe._)`${u}, ${r.object(...h)}`;
  return l !== pe.nil ? (0, pe._)`${c}.call(${l}, ${E})` : (0, pe._)`${c}(${E})`;
}
ie.callValidateCode = wg;
const Eg = (0, pe._)`new RegExp`;
function bg({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, pe._)`${s.code === "new RegExp" ? Eg : (0, pg.useFunc)(e, s)}(${r}, ${n})`
  });
}
ie.usePattern = bg;
function Sg(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const c = t.let("valid", !0);
    return o(() => t.assign(c, !1)), c;
  }
  return t.var(a, !0), o(() => t.break()), a;
  function o(c) {
    const l = t.const("len", (0, pe._)`${r}.length`);
    t.forRange("i", 0, l, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: fo.Type.Num
      }, a), t.if((0, pe.not)(a), c);
    });
  }
}
ie.validateArray = Sg;
function Pg(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, fo.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
    return;
  const o = t.let("valid", !1), c = t.name("_valid");
  t.block(() => r.forEach((l, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, c);
    t.assign(o, (0, pe._)`${o} || ${c}`), e.mergeValidEvaluated(u, c) || t.if((0, pe.not)(o));
  })), e.result(o, () => e.reset(), () => e.error(!0));
}
ie.validateUnion = Pg;
var Gi;
function Ng() {
  if (Gi) return Ze;
  Gi = 1, Object.defineProperty(Ze, "__esModule", { value: !0 }), Ze.validateKeywordUsage = Ze.validSchemaType = Ze.funcKeywordCode = Ze.macroKeywordCode = void 0;
  const e = ae, t = Vt(), r = ie, n = tn;
  function s(E, $) {
    const { gen: v, keyword: g, schema: y, parentSchema: m, it: w } = E, P = $.macro.call(w.self, y, m, w), O = d(v, g, P);
    w.opts.validateSchema !== !1 && w.self.validateSchema(P, !0);
    const T = v.name("valid");
    E.subschema({
      schema: P,
      schemaPath: e.nil,
      errSchemaPath: `${w.errSchemaPath}/${g}`,
      topSchemaRef: O,
      compositeRule: !0
    }, T), E.pass(T, () => E.error(!0));
  }
  Ze.macroKeywordCode = s;
  function a(E, $) {
    var v;
    const { gen: g, keyword: y, schema: m, parentSchema: w, $data: P, it: O } = E;
    l(O, $);
    const T = !P && $.compile ? $.compile.call(O.self, m, w, O) : $.validate, K = d(g, y, T), Y = g.let("valid");
    E.block$data(Y, ce), E.ok((v = $.valid) !== null && v !== void 0 ? v : Y);
    function ce() {
      if ($.errors === !1)
        G(), $.modifying && o(E), X(() => E.error());
      else {
        const Z = $.async ? he() : ge();
        $.modifying && o(E), X(() => c(E, Z));
      }
    }
    function he() {
      const Z = g.let("ruleErrs", null);
      return g.try(() => G((0, e._)`await `), (j) => g.assign(Y, !1).if((0, e._)`${j} instanceof ${O.ValidationError}`, () => g.assign(Z, (0, e._)`${j}.errors`), () => g.throw(j))), Z;
    }
    function ge() {
      const Z = (0, e._)`${K}.errors`;
      return g.assign(Z, null), G(e.nil), Z;
    }
    function G(Z = $.async ? (0, e._)`await ` : e.nil) {
      const j = O.opts.passContext ? t.default.this : t.default.self, D = !("compile" in $ && !P || $.schema === !1);
      g.assign(Y, (0, e._)`${Z}${(0, r.callValidateCode)(E, K, j, D)}`, $.modifying);
    }
    function X(Z) {
      var j;
      g.if((0, e.not)((j = $.valid) !== null && j !== void 0 ? j : Y), Z);
    }
  }
  Ze.funcKeywordCode = a;
  function o(E) {
    const { gen: $, data: v, it: g } = E;
    $.if(g.parentData, () => $.assign(v, (0, e._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function c(E, $) {
    const { gen: v } = E;
    v.if((0, e._)`Array.isArray(${$})`, () => {
      v.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${$} : ${t.default.vErrors}.concat(${$})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(E);
    }, () => E.error());
  }
  function l({ schemaEnv: E }, $) {
    if ($.async && !E.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(E, $, v) {
    if (v === void 0)
      throw new Error(`keyword "${$}" failed to compile`);
    return E.scopeValue("keyword", typeof v == "function" ? { ref: v } : { ref: v, code: (0, e.stringify)(v) });
  }
  function u(E, $, v = !1) {
    return !$.length || $.some((g) => g === "array" ? Array.isArray(E) : g === "object" ? E && typeof E == "object" && !Array.isArray(E) : typeof E == g || v && typeof E > "u");
  }
  Ze.validSchemaType = u;
  function h({ schema: E, opts: $, self: v, errSchemaPath: g }, y, m) {
    if (Array.isArray(y.keyword) ? !y.keyword.includes(m) : y.keyword !== m)
      throw new Error("ajv implementation error");
    const w = y.dependencies;
    if (w != null && w.some((P) => !Object.prototype.hasOwnProperty.call(E, P)))
      throw new Error(`parent schema must have dependencies of ${m}: ${w.join(",")}`);
    if (y.validateSchema && !y.validateSchema(E[m])) {
      const O = `keyword "${m}" value is invalid at path "${g}": ` + v.errorsText(y.validateSchema.errors);
      if ($.validateSchema === "log")
        v.logger.error(O);
      else
        throw new Error(O);
    }
  }
  return Ze.validateKeywordUsage = h, Ze;
}
var $t = {}, Ki;
function Rg() {
  if (Ki) return $t;
  Ki = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.extendSubschemaMode = $t.extendSubschemaData = $t.getSubschema = void 0;
  const e = ae, t = F;
  function r(a, { keyword: o, schemaProp: c, schema: l, schemaPath: d, errSchemaPath: u, topSchemaRef: h }) {
    if (o !== void 0 && l !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const E = a.schema[o];
      return c === void 0 ? {
        schema: E,
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${o}`
      } : {
        schema: E[c],
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(o)}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${a.errSchemaPath}/${o}/${(0, t.escapeFragment)(c)}`
      };
    }
    if (l !== void 0) {
      if (d === void 0 || u === void 0 || h === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: l,
        schemaPath: d,
        topSchemaRef: h,
        errSchemaPath: u
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  $t.getSubschema = r;
  function n(a, o, { dataProp: c, dataPropType: l, data: d, dataTypes: u, propertyName: h }) {
    if (d !== void 0 && c !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: E } = o;
    if (c !== void 0) {
      const { errorPath: v, dataPathArr: g, opts: y } = o, m = E.let("data", (0, e._)`${o.data}${(0, e.getProperty)(c)}`, !0);
      $(m), a.errorPath = (0, e.str)`${v}${(0, t.getErrorPath)(c, l, y.jsPropertySyntax)}`, a.parentDataProperty = (0, e._)`${c}`, a.dataPathArr = [...g, a.parentDataProperty];
    }
    if (d !== void 0) {
      const v = d instanceof e.Name ? d : E.let("data", d, !0);
      $(v), h !== void 0 && (a.propertyName = h);
    }
    u && (a.dataTypes = u);
    function $(v) {
      a.data = v, a.dataLevel = o.dataLevel + 1, a.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), a.parentData = o.data, a.dataNames = [...o.dataNames, v];
    }
  }
  $t.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: o, jtdMetadata: c, compositeRule: l, createErrors: d, allErrors: u }) {
    l !== void 0 && (a.compositeRule = l), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = o, a.jtdMetadata = c;
  }
  return $t.extendSubschemaMode = s, $t;
}
var ke = {}, xl = { exports: {} }, Dt = xl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  jn(t, n, s, e, "", e);
};
Dt.keywords = {
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
Dt.arrayKeywords = {
  items: !0,
  allOf: !0,
  anyOf: !0,
  oneOf: !0
};
Dt.propsKeywords = {
  $defs: !0,
  definitions: !0,
  properties: !0,
  patternProperties: !0,
  dependencies: !0
};
Dt.skipKeywords = {
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
function jn(e, t, r, n, s, a, o, c, l, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, o, c, l, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Dt.arrayKeywords)
          for (var E = 0; E < h.length; E++)
            jn(e, t, r, h[E], s + "/" + u + "/" + E, a, s, u, n, E);
      } else if (u in Dt.propsKeywords) {
        if (h && typeof h == "object")
          for (var $ in h)
            jn(e, t, r, h[$], s + "/" + u + "/" + Og($), a, s, u, n, $);
      } else (u in Dt.keywords || e.allKeys && !(u in Dt.skipKeywords)) && jn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function Og(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var Ig = xl.exports;
Object.defineProperty(ke, "__esModule", { value: !0 });
ke.getSchemaRefs = ke.resolveUrl = ke.normalizeId = ke._getFullPath = ke.getFullPath = ke.inlineRef = void 0;
const Tg = F, jg = es, kg = Ig, Ag = /* @__PURE__ */ new Set([
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
function Cg(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Ys(e) : t ? eu(e) <= t : !1;
}
ke.inlineRef = Cg;
const Dg = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Ys(e) {
  for (const t in e) {
    if (Dg.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Ys) || typeof r == "object" && Ys(r))
      return !0;
  }
  return !1;
}
function eu(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !Ag.has(r) && (typeof e[r] == "object" && (0, Tg.eachItem)(e[r], (n) => t += eu(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function tu(e, t = "", r) {
  r !== !1 && (t = mr(t));
  const n = e.parse(t);
  return ru(e, n);
}
ke.getFullPath = tu;
function ru(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
ke._getFullPath = ru;
const Mg = /#\/?$/;
function mr(e) {
  return e ? e.replace(Mg, "") : "";
}
ke.normalizeId = mr;
function Lg(e, t, r) {
  return r = mr(r), e.resolve(t, r);
}
ke.resolveUrl = Lg;
const Vg = /^[a-z_][-a-z0-9._]*$/i;
function Fg(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = mr(e[r] || t), a = { "": s }, o = tu(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return kg(e, { allKeys: !0 }, (h, E, $, v) => {
    if (v === void 0)
      return;
    const g = o + E;
    let y = a[v];
    typeof h[r] == "string" && (y = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[E] = y;
    function m(P) {
      const O = this.opts.uriResolver.resolve;
      if (P = mr(y ? O(y, P) : P), l.has(P))
        throw u(P);
      l.add(P);
      let T = this.refs[P];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, P) : P !== mr(g) && (P[0] === "#" ? (d(h, c[P], P), c[P] = h) : this.refs[P] = g), P;
    }
    function w(P) {
      if (typeof P == "string") {
        if (!Vg.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), c;
  function d(h, E, $) {
    if (E !== void 0 && !jg(h, E))
      throw u($);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
ke.getSchemaRefs = Fg;
var Hi;
function is() {
  if (Hi) return pt;
  Hi = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.getData = pt.KeywordCxt = pt.validateFunctionCode = void 0;
  const e = Zy(), t = Se, r = wt, n = Se, s = mg(), a = Ng(), o = Rg(), c = ae, l = Vt(), d = ke, u = F, h = tn;
  function E(R) {
    if (T(R) && (Y(R), O(R))) {
      y(R);
      return;
    }
    $(R, () => (0, e.topBoolOrEmptySchema)(R));
  }
  pt.validateFunctionCode = E;
  function $({ gen: R, validateName: I, schema: C, schemaEnv: M, opts: B }, ee) {
    B.code.es5 ? R.func(I, (0, c._)`${l.default.data}, ${l.default.valCxt}`, M.$async, () => {
      R.code((0, c._)`"use strict"; ${w(C, B)}`), g(R, B), R.code(ee);
    }) : R.func(I, (0, c._)`${l.default.data}, ${v(B)}`, M.$async, () => R.code(w(C, B)).code(ee));
  }
  function v(R) {
    return (0, c._)`{${l.default.instancePath}="", ${l.default.parentData}, ${l.default.parentDataProperty}, ${l.default.rootData}=${l.default.data}${R.dynamicRef ? (0, c._)`, ${l.default.dynamicAnchors}={}` : c.nil}}={}`;
  }
  function g(R, I) {
    R.if(l.default.valCxt, () => {
      R.var(l.default.instancePath, (0, c._)`${l.default.valCxt}.${l.default.instancePath}`), R.var(l.default.parentData, (0, c._)`${l.default.valCxt}.${l.default.parentData}`), R.var(l.default.parentDataProperty, (0, c._)`${l.default.valCxt}.${l.default.parentDataProperty}`), R.var(l.default.rootData, (0, c._)`${l.default.valCxt}.${l.default.rootData}`), I.dynamicRef && R.var(l.default.dynamicAnchors, (0, c._)`${l.default.valCxt}.${l.default.dynamicAnchors}`);
    }, () => {
      R.var(l.default.instancePath, (0, c._)`""`), R.var(l.default.parentData, (0, c._)`undefined`), R.var(l.default.parentDataProperty, (0, c._)`undefined`), R.var(l.default.rootData, l.default.data), I.dynamicRef && R.var(l.default.dynamicAnchors, (0, c._)`{}`);
    });
  }
  function y(R) {
    const { schema: I, opts: C, gen: M } = R;
    $(R, () => {
      C.$comment && I.$comment && Z(R), ge(R), M.let(l.default.vErrors, null), M.let(l.default.errors, 0), C.unevaluated && m(R), ce(R), j(R);
    });
  }
  function m(R) {
    const { gen: I, validateName: C } = R;
    R.evaluated = I.const("evaluated", (0, c._)`${C}.evaluated`), I.if((0, c._)`${R.evaluated}.dynamicProps`, () => I.assign((0, c._)`${R.evaluated}.props`, (0, c._)`undefined`)), I.if((0, c._)`${R.evaluated}.dynamicItems`, () => I.assign((0, c._)`${R.evaluated}.items`, (0, c._)`undefined`));
  }
  function w(R, I) {
    const C = typeof R == "object" && R[I.schemaId];
    return C && (I.code.source || I.code.process) ? (0, c._)`/*# sourceURL=${C} */` : c.nil;
  }
  function P(R, I) {
    if (T(R) && (Y(R), O(R))) {
      K(R, I);
      return;
    }
    (0, e.boolOrEmptySchema)(R, I);
  }
  function O({ schema: R, self: I }) {
    if (typeof R == "boolean")
      return !R;
    for (const C in R)
      if (I.RULES.all[C])
        return !0;
    return !1;
  }
  function T(R) {
    return typeof R.schema != "boolean";
  }
  function K(R, I) {
    const { schema: C, gen: M, opts: B } = R;
    B.$comment && C.$comment && Z(R), G(R), X(R);
    const ee = M.const("_errs", l.default.errors);
    ce(R, ee), M.var(I, (0, c._)`${ee} === ${l.default.errors}`);
  }
  function Y(R) {
    (0, u.checkUnknownRules)(R), he(R);
  }
  function ce(R, I) {
    if (R.opts.jtd)
      return U(R, [], !1, I);
    const C = (0, t.getSchemaTypes)(R.schema), M = (0, t.coerceAndCheckDataType)(R, C);
    U(R, C, !M, I);
  }
  function he(R) {
    const { schema: I, errSchemaPath: C, opts: M, self: B } = R;
    I.$ref && M.ignoreKeywordsWithRef && (0, u.schemaHasRulesButRef)(I, B.RULES) && B.logger.warn(`$ref: keywords ignored in schema at path "${C}"`);
  }
  function ge(R) {
    const { schema: I, opts: C } = R;
    I.default !== void 0 && C.useDefaults && C.strictSchema && (0, u.checkStrictMode)(R, "default is ignored in the schema root");
  }
  function G(R) {
    const I = R.schema[R.opts.schemaId];
    I && (R.baseId = (0, d.resolveUrl)(R.opts.uriResolver, R.baseId, I));
  }
  function X(R) {
    if (R.schema.$async && !R.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function Z({ gen: R, schemaEnv: I, schema: C, errSchemaPath: M, opts: B }) {
    const ee = C.$comment;
    if (B.$comment === !0)
      R.code((0, c._)`${l.default.self}.logger.log(${ee})`);
    else if (typeof B.$comment == "function") {
      const _e = (0, c.str)`${M}/$comment`, Ve = R.scopeValue("root", { ref: I.root });
      R.code((0, c._)`${l.default.self}.opts.$comment(${ee}, ${_e}, ${Ve}.schema)`);
    }
  }
  function j(R) {
    const { gen: I, schemaEnv: C, validateName: M, ValidationError: B, opts: ee } = R;
    C.$async ? I.if((0, c._)`${l.default.errors} === 0`, () => I.return(l.default.data), () => I.throw((0, c._)`new ${B}(${l.default.vErrors})`)) : (I.assign((0, c._)`${M}.errors`, l.default.vErrors), ee.unevaluated && D(R), I.return((0, c._)`${l.default.errors} === 0`));
  }
  function D({ gen: R, evaluated: I, props: C, items: M }) {
    C instanceof c.Name && R.assign((0, c._)`${I}.props`, C), M instanceof c.Name && R.assign((0, c._)`${I}.items`, M);
  }
  function U(R, I, C, M) {
    const { gen: B, schema: ee, data: _e, allErrors: Ve, opts: Ne, self: Re } = R, { RULES: ve } = Re;
    if (ee.$ref && (Ne.ignoreKeywordsWithRef || !(0, u.schemaHasRulesButRef)(ee, ve))) {
      B.block(() => k(R, "$ref", ve.all.$ref.definition));
      return;
    }
    Ne.jtd || J(R, I), B.block(() => {
      for (const Ae of ve.rules)
        lt(Ae);
      lt(ve.post);
    });
    function lt(Ae) {
      (0, r.shouldUseGroup)(ee, Ae) && (Ae.type ? (B.if((0, n.checkDataType)(Ae.type, _e, Ne.strictNumbers)), V(R, Ae), I.length === 1 && I[0] === Ae.type && C && (B.else(), (0, n.reportTypeError)(R)), B.endIf()) : V(R, Ae), Ve || B.if((0, c._)`${l.default.errors} === ${M || 0}`));
    }
  }
  function V(R, I) {
    const { gen: C, schema: M, opts: { useDefaults: B } } = R;
    B && (0, s.assignDefaults)(R, I.type), C.block(() => {
      for (const ee of I.rules)
        (0, r.shouldUseRule)(M, ee) && k(R, ee.keyword, ee.definition, I.type);
    });
  }
  function J(R, I) {
    R.schemaEnv.meta || !R.opts.strictTypes || (z(R, I), R.opts.allowUnionTypes || N(R, I), p(R, R.dataTypes));
  }
  function z(R, I) {
    if (I.length) {
      if (!R.dataTypes.length) {
        R.dataTypes = I;
        return;
      }
      I.forEach((C) => {
        _(R.dataTypes, C) || f(R, `type "${C}" not allowed by context "${R.dataTypes.join(",")}"`);
      }), i(R, I);
    }
  }
  function N(R, I) {
    I.length > 1 && !(I.length === 2 && I.includes("null")) && f(R, "use allowUnionTypes to allow union type keyword");
  }
  function p(R, I) {
    const C = R.self.RULES.all;
    for (const M in C) {
      const B = C[M];
      if (typeof B == "object" && (0, r.shouldUseRule)(R.schema, B)) {
        const { type: ee } = B.definition;
        ee.length && !ee.some((_e) => S(I, _e)) && f(R, `missing type "${ee.join(",")}" for keyword "${M}"`);
      }
    }
  }
  function S(R, I) {
    return R.includes(I) || I === "number" && R.includes("integer");
  }
  function _(R, I) {
    return R.includes(I) || I === "integer" && R.includes("number");
  }
  function i(R, I) {
    const C = [];
    for (const M of R.dataTypes)
      _(I, M) ? C.push(M) : I.includes("integer") && M === "number" && C.push("integer");
    R.dataTypes = C;
  }
  function f(R, I) {
    const C = R.schemaEnv.baseId + R.errSchemaPath;
    I += ` at "${C}" (strictTypes)`, (0, u.checkStrictMode)(R, I, R.opts.strictTypes);
  }
  class b {
    constructor(I, C, M) {
      if ((0, a.validateKeywordUsage)(I, C, M), this.gen = I.gen, this.allErrors = I.allErrors, this.keyword = M, this.data = I.data, this.schema = I.schema[M], this.$data = C.$data && I.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, u.schemaRefOrVal)(I, this.schema, M, this.$data), this.schemaType = C.schemaType, this.parentSchema = I.schema, this.params = {}, this.it = I, this.def = C, this.$data)
        this.schemaCode = I.gen.const("vSchema", q(this.$data, I));
      else if (this.schemaCode = this.schemaValue, !(0, a.validSchemaType)(this.schema, C.schemaType, C.allowUndefined))
        throw new Error(`${M} value must be ${JSON.stringify(C.schemaType)}`);
      ("code" in C ? C.trackErrors : C.errors !== !1) && (this.errsCount = I.gen.const("_errs", l.default.errors));
    }
    result(I, C, M) {
      this.failResult((0, c.not)(I), C, M);
    }
    failResult(I, C, M) {
      this.gen.if(I), M ? M() : this.error(), C ? (this.gen.else(), C(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(I, C) {
      this.failResult((0, c.not)(I), void 0, C);
    }
    fail(I) {
      if (I === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(I), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(I) {
      if (!this.$data)
        return this.fail(I);
      const { schemaCode: C } = this;
      this.fail((0, c._)`${C} !== undefined && (${(0, c.or)(this.invalid$data(), I)})`);
    }
    error(I, C, M) {
      if (C) {
        this.setParams(C), this._error(I, M), this.setParams({});
        return;
      }
      this._error(I, M);
    }
    _error(I, C) {
      (I ? h.reportExtraError : h.reportError)(this, this.def.error, C);
    }
    $dataError() {
      (0, h.reportError)(this, this.def.$dataError || h.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, h.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(I) {
      this.allErrors || this.gen.if(I);
    }
    setParams(I, C) {
      C ? Object.assign(this.params, I) : this.params = I;
    }
    block$data(I, C, M = c.nil) {
      this.gen.block(() => {
        this.check$data(I, M), C();
      });
    }
    check$data(I = c.nil, C = c.nil) {
      if (!this.$data)
        return;
      const { gen: M, schemaCode: B, schemaType: ee, def: _e } = this;
      M.if((0, c.or)((0, c._)`${B} === undefined`, C)), I !== c.nil && M.assign(I, !0), (ee.length || _e.validateSchema) && (M.elseIf(this.invalid$data()), this.$dataError(), I !== c.nil && M.assign(I, !1)), M.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: C, schemaType: M, def: B, it: ee } = this;
      return (0, c.or)(_e(), Ve());
      function _e() {
        if (M.length) {
          if (!(C instanceof c.Name))
            throw new Error("ajv implementation error");
          const Ne = Array.isArray(M) ? M : [M];
          return (0, c._)`${(0, n.checkDataTypes)(Ne, C, ee.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return c.nil;
      }
      function Ve() {
        if (B.validateSchema) {
          const Ne = I.scopeValue("validate$data", { ref: B.validateSchema });
          return (0, c._)`!${Ne}(${C})`;
        }
        return c.nil;
      }
    }
    subschema(I, C) {
      const M = (0, o.getSubschema)(this.it, I);
      (0, o.extendSubschemaData)(M, this.it, I), (0, o.extendSubschemaMode)(M, I);
      const B = { ...this.it, ...M, items: void 0, props: void 0 };
      return P(B, C), B;
    }
    mergeEvaluated(I, C) {
      const { it: M, gen: B } = this;
      M.opts.unevaluated && (M.props !== !0 && I.props !== void 0 && (M.props = u.mergeEvaluated.props(B, I.props, M.props, C)), M.items !== !0 && I.items !== void 0 && (M.items = u.mergeEvaluated.items(B, I.items, M.items, C)));
    }
    mergeValidEvaluated(I, C) {
      const { it: M, gen: B } = this;
      if (M.opts.unevaluated && (M.props !== !0 || M.items !== !0))
        return B.if(C, () => this.mergeEvaluated(I, c.Name)), !0;
    }
  }
  pt.KeywordCxt = b;
  function k(R, I, C, M) {
    const B = new b(R, C, I);
    "code" in C ? C.code(B, M) : B.$data && C.validate ? (0, a.funcKeywordCode)(B, C) : "macro" in C ? (0, a.macroKeywordCode)(B, C) : (C.compile || C.validate) && (0, a.funcKeywordCode)(B, C);
  }
  const A = /^\/(?:[^~]|~0|~1)*$/, H = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function q(R, { dataLevel: I, dataNames: C, dataPathArr: M }) {
    let B, ee;
    if (R === "")
      return l.default.rootData;
    if (R[0] === "/") {
      if (!A.test(R))
        throw new Error(`Invalid JSON-pointer: ${R}`);
      B = R, ee = l.default.rootData;
    } else {
      const Re = H.exec(R);
      if (!Re)
        throw new Error(`Invalid JSON-pointer: ${R}`);
      const ve = +Re[1];
      if (B = Re[2], B === "#") {
        if (ve >= I)
          throw new Error(Ne("property/index", ve));
        return M[I - ve];
      }
      if (ve > I)
        throw new Error(Ne("data", ve));
      if (ee = C[I - ve], !B)
        return ee;
    }
    let _e = ee;
    const Ve = B.split("/");
    for (const Re of Ve)
      Re && (ee = (0, c._)`${ee}${(0, c.getProperty)((0, u.unescapeJsonPointer)(Re))}`, _e = (0, c._)`${_e} && ${ee}`);
    return _e;
    function Ne(Re, ve) {
      return `Cannot access ${Re} ${ve} levels up, current level is ${I}`;
    }
  }
  return pt.getData = q, pt;
}
var hn = {}, Bi;
function po() {
  if (Bi) return hn;
  Bi = 1, Object.defineProperty(hn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return hn.default = e, hn;
}
var br = {};
Object.defineProperty(br, "__esModule", { value: !0 });
const Ns = ke;
class zg extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, Ns.resolveUrl)(t, r, n), this.missingSchema = (0, Ns.normalizeId)((0, Ns.getFullPath)(t, this.missingRef));
  }
}
br.default = zg;
var Ke = {};
Object.defineProperty(Ke, "__esModule", { value: !0 });
Ke.resolveSchema = Ke.getCompilingSchema = Ke.resolveRef = Ke.compileSchema = Ke.SchemaEnv = void 0;
const xe = ae, Ug = po(), Kt = Vt(), nt = ke, Ji = F, qg = is();
class cs {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, nt.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Ke.SchemaEnv = cs;
function $o(e) {
  const t = nu.call(this, e);
  if (t)
    return t;
  const r = (0, nt.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new xe.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: Ug.default,
    code: (0, xe._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const l = o.scopeName("validate");
  e.validateName = l;
  const d = {
    gen: o,
    allErrors: this.opts.allErrors,
    data: Kt.default.data,
    parentData: Kt.default.parentData,
    parentDataProperty: Kt.default.parentDataProperty,
    dataNames: [Kt.default.data],
    dataPathArr: [xe.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, xe.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: xe.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, xe._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, qg.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Kt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const $ = new Function(`${Kt.default.self}`, `${Kt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: $ }), $.errors = null, $.schema = e.schema, $.schemaEnv = e, e.$async && ($.$async = !0), this.opts.code.source === !0 && ($.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: v, items: g } = d;
      $.evaluated = {
        props: v instanceof xe.Name ? void 0 : v,
        items: g instanceof xe.Name ? void 0 : g,
        dynamicProps: v instanceof xe.Name,
        dynamicItems: g instanceof xe.Name
      }, $.source && ($.source.evaluated = (0, xe.stringify)($.evaluated));
    }
    return e.validate = $, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Ke.compileSchema = $o;
function Gg(e, t, r) {
  var n;
  r = (0, nt.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = Bg.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new cs({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = Kg.call(this, a);
}
Ke.resolveRef = Gg;
function Kg(e) {
  return (0, nt.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : $o.call(this, e);
}
function nu(e) {
  for (const t of this._compilations)
    if (Hg(t, e))
      return t;
}
Ke.getCompilingSchema = nu;
function Hg(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Bg(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || ls.call(this, e, t);
}
function ls(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, nt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, nt.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Rs.call(this, r, e);
  const a = (0, nt.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = ls.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Rs.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || $o.call(this, o), a === (0, nt.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, nt.resolveUrl)(this.opts.uriResolver, s, d)), new cs({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Rs.call(this, r, o);
  }
}
Ke.resolveSchema = ls;
const Jg = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Rs(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, Ji.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Jg.has(c) && d && (t = (0, nt.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Ji.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, nt.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ls.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new cs({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Wg = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Xg = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Yg = "object", Qg = [
  "$data"
], Zg = {
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
}, xg = !1, e0 = {
  $id: Wg,
  description: Xg,
  type: Yg,
  required: Qg,
  properties: Zg,
  additionalProperties: xg
};
var yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const su = Rl;
su.code = 'require("ajv/dist/runtime/uri").default';
yo.default = su;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = is();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = ae;
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
  const n = po(), s = br, a = er, o = Ke, c = ae, l = ke, d = Se, u = F, h = e0, E = yo, $ = (N, p) => new RegExp(N, p);
  $.code = "new RegExp";
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
  function P(N) {
    var p, S, _, i, f, b, k, A, H, q, R, I, C, M, B, ee, _e, Ve, Ne, Re, ve, lt, Ae, Ft, zt;
    const Ye = N.strict, Ut = (p = N.code) === null || p === void 0 ? void 0 : p.optimize, Rr = Ut === !0 || Ut === void 0 ? 1 : Ut || 0, Or = (_ = (S = N.code) === null || S === void 0 ? void 0 : S.regExp) !== null && _ !== void 0 ? _ : $, ys = (i = N.uriResolver) !== null && i !== void 0 ? i : E.default;
    return {
      strictSchema: (b = (f = N.strictSchema) !== null && f !== void 0 ? f : Ye) !== null && b !== void 0 ? b : !0,
      strictNumbers: (A = (k = N.strictNumbers) !== null && k !== void 0 ? k : Ye) !== null && A !== void 0 ? A : !0,
      strictTypes: (q = (H = N.strictTypes) !== null && H !== void 0 ? H : Ye) !== null && q !== void 0 ? q : "log",
      strictTuples: (I = (R = N.strictTuples) !== null && R !== void 0 ? R : Ye) !== null && I !== void 0 ? I : "log",
      strictRequired: (M = (C = N.strictRequired) !== null && C !== void 0 ? C : Ye) !== null && M !== void 0 ? M : !1,
      code: N.code ? { ...N.code, optimize: Rr, regExp: Or } : { optimize: Rr, regExp: Or },
      loopRequired: (B = N.loopRequired) !== null && B !== void 0 ? B : w,
      loopEnum: (ee = N.loopEnum) !== null && ee !== void 0 ? ee : w,
      meta: (_e = N.meta) !== null && _e !== void 0 ? _e : !0,
      messages: (Ve = N.messages) !== null && Ve !== void 0 ? Ve : !0,
      inlineRefs: (Ne = N.inlineRefs) !== null && Ne !== void 0 ? Ne : !0,
      schemaId: (Re = N.schemaId) !== null && Re !== void 0 ? Re : "$id",
      addUsedSchema: (ve = N.addUsedSchema) !== null && ve !== void 0 ? ve : !0,
      validateSchema: (lt = N.validateSchema) !== null && lt !== void 0 ? lt : !0,
      validateFormats: (Ae = N.validateFormats) !== null && Ae !== void 0 ? Ae : !0,
      unicodeRegExp: (Ft = N.unicodeRegExp) !== null && Ft !== void 0 ? Ft : !0,
      int32range: (zt = N.int32range) !== null && zt !== void 0 ? zt : !0,
      uriResolver: ys
    };
  }
  class O {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...P(p) };
      const { es5: S, lines: _ } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: g, es5: S, lines: _ }), this.logger = X(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, y, p, "NOT SUPPORTED"), T.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ge.call(this), p.formats && ce.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: _ } = this.opts;
      let i = h;
      _ === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[_], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let _;
      if (typeof p == "string") {
        if (_ = this.getSchema(p), !_)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        _ = this.compile(p);
      const i = _(S);
      return "$async" in _ || (this.errors = _.errors), i;
    }
    compile(p, S) {
      const _ = this._addSchema(p, S);
      return _.validate || this._compileSchemaEnv(_);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: _ } = this.opts;
      return i.call(this, p, S);
      async function i(q, R) {
        await f.call(this, q.$schema);
        const I = this._addSchema(q, R);
        return I.validate || b.call(this, I);
      }
      async function f(q) {
        q && !this.getSchema(q) && await i.call(this, { $ref: q }, !0);
      }
      async function b(q) {
        try {
          return this._compileSchemaEnv(q);
        } catch (R) {
          if (!(R instanceof s.default))
            throw R;
          return k.call(this, R), await A.call(this, R.missingSchema), b.call(this, q);
        }
      }
      function k({ missingSchema: q, missingRef: R }) {
        if (this.refs[q])
          throw new Error(`AnySchema ${q} is loaded but ${R} cannot be resolved`);
      }
      async function A(q) {
        const R = await H.call(this, q);
        this.refs[q] || await f.call(this, R.$schema), this.refs[q] || this.addSchema(R, q, S);
      }
      async function H(q) {
        const R = this._loading[q];
        if (R)
          return R;
        try {
          return await (this._loading[q] = _(q));
        } finally {
          delete this._loading[q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, _, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, _, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, _, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, _ = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, _), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let _;
      if (_ = p.$schema, _ !== void 0 && typeof _ != "string")
        throw new Error("$schema must be a string");
      if (_ = _ || this.opts.defaultMeta || this.defaultMeta(), !_)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(_, p);
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
      for (; typeof (S = K.call(this, p)) == "string"; )
        p = S;
      if (S === void 0) {
        const { schemaId: _ } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: _ });
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
          const S = K.call(this, p);
          return typeof S == "object" && this._cache.delete(S.schema), delete this.schemas[p], delete this.refs[p], this;
        }
        case "object": {
          const S = p;
          this._cache.delete(S);
          let _ = p[this.opts.schemaId];
          return _ && (_ = (0, l.normalizeId)(_), delete this.schemas[_], delete this.refs[_]), this;
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
      let _;
      if (typeof p == "string")
        _ = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = _);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, _ = S.keyword, Array.isArray(_) && !_.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, _, S), !S)
        return (0, u.eachItem)(_, (f) => D.call(this, f)), this;
      V.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(_, i.type.length === 0 ? (f) => D.call(this, f, i) : (f) => i.type.forEach((b) => D.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const _ of S.rules) {
        const i = _.rules.findIndex((f) => f.keyword === p);
        i >= 0 && _.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: _ = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${_}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const _ = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const k of f)
          b = b[k];
        for (const k in _) {
          const A = _[k];
          if (typeof A != "object")
            continue;
          const { $data: H } = A.definition, q = b[k];
          H && q && (b[k] = z(q));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const _ in p) {
        const i = p[_];
        (!S || S.test(_)) && (typeof i == "string" ? delete p[_] : i && !i.meta && (this._cache.delete(i.schema), delete p[_]));
      }
    }
    _addSchema(p, S, _, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let b;
      const { schemaId: k } = this.opts;
      if (typeof p == "object")
        b = p[k];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof p != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let A = this._cache.get(p);
      if (A !== void 0)
        return A;
      _ = (0, l.normalizeId)(b || _);
      const H = l.getSchemaRefs.call(this, p, _);
      return A = new o.SchemaEnv({ schema: p, schemaId: k, meta: S, baseId: _, localRefs: H }), this._cache.set(A.schema, A), f && !_.startsWith("#") && (_ && this._checkUnique(_), this.refs[_] = A), i && this.validateSchema(p, !0), A;
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
  O.ValidationError = n.default, O.MissingRefError = s.default, e.default = O;
  function T(N, p, S, _ = "error") {
    for (const i in N) {
      const f = i;
      f in p && this.logger[_](`${S}: option ${i}. ${N[f]}`);
    }
  }
  function K(N) {
    return N = (0, l.normalizeId)(N), this.schemas[N] || this.refs[N];
  }
  function Y() {
    const N = this.opts.schemas;
    if (N)
      if (Array.isArray(N))
        this.addSchema(N);
      else
        for (const p in N)
          this.addSchema(N[p], p);
  }
  function ce() {
    for (const N in this.opts.formats) {
      const p = this.opts.formats[N];
      p && this.addFormat(N, p);
    }
  }
  function he(N) {
    if (Array.isArray(N)) {
      this.addVocabulary(N);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const p in N) {
      const S = N[p];
      S.keyword || (S.keyword = p), this.addKeyword(S);
    }
  }
  function ge() {
    const N = { ...this.opts };
    for (const p of v)
      delete N[p];
    return N;
  }
  const G = { log() {
  }, warn() {
  }, error() {
  } };
  function X(N) {
    if (N === !1)
      return G;
    if (N === void 0)
      return console;
    if (N.log && N.warn && N.error)
      return N;
    throw new Error("logger must implement log, warn and error methods");
  }
  const Z = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(N, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(N, (_) => {
      if (S.keywords[_])
        throw new Error(`Keyword ${_} is already defined`);
      if (!Z.test(_))
        throw new Error(`Keyword ${_} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function D(N, p, S) {
    var _;
    const i = p == null ? void 0 : p.post;
    if (S && i)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let b = i ? f.post : f.rules.find(({ type: A }) => A === S);
    if (b || (b = { type: S, rules: [] }, f.rules.push(b)), f.keywords[N] = !0, !p)
      return;
    const k = {
      keyword: N,
      definition: {
        ...p,
        type: (0, d.getJSONTypes)(p.type),
        schemaType: (0, d.getJSONTypes)(p.schemaType)
      }
    };
    p.before ? U.call(this, b, k, p.before) : b.rules.push(k), f.all[N] = k, (_ = p.implements) === null || _ === void 0 || _.forEach((A) => this.addKeyword(A));
  }
  function U(N, p, S) {
    const _ = N.rules.findIndex((i) => i.keyword === S);
    _ >= 0 ? N.rules.splice(_, 0, p) : (N.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
  }
  function V(N) {
    let { metaSchema: p } = N;
    p !== void 0 && (N.$data && this.opts.$data && (p = z(p)), N.validateSchema = this.compile(p, !0));
  }
  const J = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function z(N) {
    return { anyOf: [N, J] };
  }
})(zl);
var go = {}, _o = {}, vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
const t0 = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
vo.default = t0;
var tr = {};
Object.defineProperty(tr, "__esModule", { value: !0 });
tr.callRef = tr.getValidate = void 0;
const r0 = br, Wi = ie, Ge = ae, sr = Vt(), Xi = Ke, mn = F, n0 = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Xi.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new r0.default(n.opts.uriResolver, s, r);
    if (u instanceof Xi.SchemaEnv)
      return E(u);
    return $(u);
    function h() {
      if (a === d)
        return kn(e, o, a, a.$async);
      const v = t.scopeValue("root", { ref: d });
      return kn(e, (0, Ge._)`${v}.validate`, d, d.$async);
    }
    function E(v) {
      const g = au(e, v);
      kn(e, g, v, v.$async);
    }
    function $(v) {
      const g = t.scopeValue("schema", c.code.source === !0 ? { ref: v, code: (0, Ge.stringify)(v) } : { ref: v }), y = t.name("valid"), m = e.subschema({
        schema: v,
        dataTypes: [],
        schemaPath: Ge.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, y);
      e.mergeEvaluated(m), e.ok(y);
    }
  }
};
function au(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ge._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
tr.getValidate = au;
function kn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? sr.default.this : Ge.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const v = s.let("valid");
    s.try(() => {
      s.code((0, Ge._)`await ${(0, Wi.callValidateCode)(e, t, d)}`), $(t), o || s.assign(v, !0);
    }, (g) => {
      s.if((0, Ge._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), E(g), o || s.assign(v, !1);
    }), e.ok(v);
  }
  function h() {
    e.result((0, Wi.callValidateCode)(e, t, d), () => $(t), () => E(t));
  }
  function E(v) {
    const g = (0, Ge._)`${v}.errors`;
    s.assign(sr.default.vErrors, (0, Ge._)`${sr.default.vErrors} === null ? ${g} : ${sr.default.vErrors}.concat(${g})`), s.assign(sr.default.errors, (0, Ge._)`${sr.default.vErrors}.length`);
  }
  function $(v) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const y = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (y && !y.dynamicProps)
        y.props !== void 0 && (a.props = mn.mergeEvaluated.props(s, y.props, a.props));
      else {
        const m = s.var("props", (0, Ge._)`${v}.evaluated.props`);
        a.props = mn.mergeEvaluated.props(s, m, a.props, Ge.Name);
      }
    if (a.items !== !0)
      if (y && !y.dynamicItems)
        y.items !== void 0 && (a.items = mn.mergeEvaluated.items(s, y.items, a.items));
      else {
        const m = s.var("items", (0, Ge._)`${v}.evaluated.items`);
        a.items = mn.mergeEvaluated.items(s, m, a.items, Ge.Name);
      }
  }
}
tr.callRef = kn;
tr.default = n0;
Object.defineProperty(_o, "__esModule", { value: !0 });
const s0 = vo, a0 = tr, o0 = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  s0.default,
  a0.default
];
_o.default = o0;
var wo = {}, Eo = {};
Object.defineProperty(Eo, "__esModule", { value: !0 });
const Hn = ae, Tt = Hn.operators, Bn = {
  maximum: { okStr: "<=", ok: Tt.LTE, fail: Tt.GT },
  minimum: { okStr: ">=", ok: Tt.GTE, fail: Tt.LT },
  exclusiveMaximum: { okStr: "<", ok: Tt.LT, fail: Tt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Tt.GT, fail: Tt.LTE }
}, i0 = {
  message: ({ keyword: e, schemaCode: t }) => (0, Hn.str)`must be ${Bn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Hn._)`{comparison: ${Bn[e].okStr}, limit: ${t}}`
}, c0 = {
  keyword: Object.keys(Bn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: i0,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Hn._)`${r} ${Bn[t].fail} ${n} || isNaN(${r})`);
  }
};
Eo.default = c0;
var bo = {};
Object.defineProperty(bo, "__esModule", { value: !0 });
const Br = ae, l0 = {
  message: ({ schemaCode: e }) => (0, Br.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Br._)`{multipleOf: ${e}}`
}, u0 = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: l0,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, Br._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Br._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Br._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
bo.default = u0;
var So = {}, Po = {};
Object.defineProperty(Po, "__esModule", { value: !0 });
function ou(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Po.default = ou;
ou.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(So, "__esModule", { value: !0 });
const Xt = ae, d0 = F, f0 = Po, h0 = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Xt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Xt._)`{limit: ${e}}`
}, m0 = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: h0,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Xt.operators.GT : Xt.operators.LT, o = s.opts.unicode === !1 ? (0, Xt._)`${r}.length` : (0, Xt._)`${(0, d0.useFunc)(e.gen, f0.default)}(${r})`;
    e.fail$data((0, Xt._)`${o} ${a} ${n}`);
  }
};
So.default = m0;
var No = {};
Object.defineProperty(No, "__esModule", { value: !0 });
const p0 = ie, Jn = ae, $0 = {
  message: ({ schemaCode: e }) => (0, Jn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Jn._)`{pattern: ${e}}`
}, y0 = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: $0,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", c = r ? (0, Jn._)`(new RegExp(${s}, ${o}))` : (0, p0.usePattern)(e, n);
    e.fail$data((0, Jn._)`!${c}.test(${t})`);
  }
};
No.default = y0;
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const Jr = ae, g0 = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Jr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Jr._)`{limit: ${e}}`
}, _0 = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: g0,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Jr.operators.GT : Jr.operators.LT;
    e.fail$data((0, Jr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Ro.default = _0;
var Oo = {};
Object.defineProperty(Oo, "__esModule", { value: !0 });
const Mr = ie, Wr = ae, v0 = F, w0 = {
  message: ({ params: { missingProperty: e } }) => (0, Wr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Wr._)`{missingProperty: ${e}}`
}, E0 = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: w0,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const $ = e.parentSchema.properties, { definedProperties: v } = e.it;
      for (const g of r)
        if (($ == null ? void 0 : $[g]) === void 0 && !v.has(g)) {
          const y = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${y}" (strictRequired)`;
          (0, v0.checkStrictMode)(o, m, o.opts.strictRequired);
        }
    }
    function d() {
      if (l || a)
        e.block$data(Wr.nil, h);
      else
        for (const $ of r)
          (0, Mr.checkReportMissingProp)(e, $);
    }
    function u() {
      const $ = t.let("missing");
      if (l || a) {
        const v = t.let("valid", !0);
        e.block$data(v, () => E($, v)), e.ok(v);
      } else
        t.if((0, Mr.checkMissingProp)(e, r, $)), (0, Mr.reportMissingProp)(e, $), t.else();
    }
    function h() {
      t.forOf("prop", n, ($) => {
        e.setParams({ missingProperty: $ }), t.if((0, Mr.noPropertyInData)(t, s, $, c.ownProperties), () => e.error());
      });
    }
    function E($, v) {
      e.setParams({ missingProperty: $ }), t.forOf($, n, () => {
        t.assign(v, (0, Mr.propertyInData)(t, s, $, c.ownProperties)), t.if((0, Wr.not)(v), () => {
          e.error(), t.break();
        });
      }, Wr.nil);
    }
  }
};
Oo.default = E0;
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const Xr = ae, b0 = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Xr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Xr._)`{limit: ${e}}`
}, S0 = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: b0,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Xr.operators.GT : Xr.operators.LT;
    e.fail$data((0, Xr._)`${r}.length ${s} ${n}`);
  }
};
Io.default = S0;
var To = {}, rn = {};
Object.defineProperty(rn, "__esModule", { value: !0 });
const iu = es;
iu.code = 'require("ajv/dist/runtime/equal").default';
rn.default = iu;
Object.defineProperty(To, "__esModule", { value: !0 });
const Os = Se, Ie = ae, P0 = F, N0 = rn, R0 = {
  message: ({ params: { i: e, j: t } }) => (0, Ie.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Ie._)`{i: ${e}, j: ${t}}`
}, O0 = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: R0,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, Os.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, Ie._)`${o} === false`), e.ok(l);
    function u() {
      const v = t.let("i", (0, Ie._)`${r}.length`), g = t.let("j");
      e.setParams({ i: v, j: g }), t.assign(l, !0), t.if((0, Ie._)`${v} > 1`, () => (h() ? E : $)(v, g));
    }
    function h() {
      return d.length > 0 && !d.some((v) => v === "object" || v === "array");
    }
    function E(v, g) {
      const y = t.name("item"), m = (0, Os.checkDataTypes)(d, y, c.opts.strictNumbers, Os.DataType.Wrong), w = t.const("indices", (0, Ie._)`{}`);
      t.for((0, Ie._)`;${v}--;`, () => {
        t.let(y, (0, Ie._)`${r}[${v}]`), t.if(m, (0, Ie._)`continue`), d.length > 1 && t.if((0, Ie._)`typeof ${y} == "string"`, (0, Ie._)`${y} += "_"`), t.if((0, Ie._)`typeof ${w}[${y}] == "number"`, () => {
          t.assign(g, (0, Ie._)`${w}[${y}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Ie._)`${w}[${y}] = ${v}`);
      });
    }
    function $(v, g) {
      const y = (0, P0.useFunc)(t, N0.default), m = t.name("outer");
      t.label(m).for((0, Ie._)`;${v}--;`, () => t.for((0, Ie._)`${g} = ${v}; ${g}--;`, () => t.if((0, Ie._)`${y}(${r}[${v}], ${r}[${g}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
To.default = O0;
var jo = {};
Object.defineProperty(jo, "__esModule", { value: !0 });
const Qs = ae, I0 = F, T0 = rn, j0 = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Qs._)`{allowedValue: ${e}}`
}, k0 = {
  keyword: "const",
  $data: !0,
  error: j0,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Qs._)`!${(0, I0.useFunc)(t, T0.default)}(${r}, ${s})`) : e.fail((0, Qs._)`${a} !== ${r}`);
  }
};
jo.default = k0;
var ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const zr = ae, A0 = F, C0 = rn, D0 = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, zr._)`{allowedValues: ${e}}`
}, M0 = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: D0,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, A0.useFunc)(t, C0.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const $ = t.const("vSchema", a);
      u = (0, zr.or)(...s.map((v, g) => E($, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, ($) => t.if((0, zr._)`${d()}(${r}, ${$})`, () => t.assign(u, !0).break()));
    }
    function E($, v) {
      const g = s[v];
      return typeof g == "object" && g !== null ? (0, zr._)`${d()}(${r}, ${$}[${v}])` : (0, zr._)`${r} === ${g}`;
    }
  }
};
ko.default = M0;
Object.defineProperty(wo, "__esModule", { value: !0 });
const L0 = Eo, V0 = bo, F0 = So, z0 = No, U0 = Ro, q0 = Oo, G0 = Io, K0 = To, H0 = jo, B0 = ko, J0 = [
  // number
  L0.default,
  V0.default,
  // string
  F0.default,
  z0.default,
  // object
  U0.default,
  q0.default,
  // array
  G0.default,
  K0.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  H0.default,
  B0.default
];
wo.default = J0;
var Ao = {}, Sr = {};
Object.defineProperty(Sr, "__esModule", { value: !0 });
Sr.validateAdditionalItems = void 0;
const Yt = ae, Zs = F, W0 = {
  message: ({ params: { len: e } }) => (0, Yt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Yt._)`{limit: ${e}}`
}, X0 = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: W0,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Zs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    cu(e, n);
  }
};
function cu(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, Yt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Yt._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Zs.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Yt._)`${c} <= ${t.length}`);
    r.if((0, Yt.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: Zs.Type.Num }, d), o.allErrors || r.if((0, Yt.not)(d), () => r.break());
    });
  }
}
Sr.validateAdditionalItems = cu;
Sr.default = X0;
var Co = {}, Pr = {};
Object.defineProperty(Pr, "__esModule", { value: !0 });
Pr.validateTuple = void 0;
const Yi = ae, An = F, Y0 = ie, Q0 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return lu(e, "additionalItems", t);
    r.items = !0, !(0, An.alwaysValidSchema)(r, t) && e.ok((0, Y0.validateArray)(e));
  }
};
function lu(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = An.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, Yi._)`${a}.length`);
  r.forEach((h, E) => {
    (0, An.alwaysValidSchema)(c, h) || (n.if((0, Yi._)`${d} > ${E}`, () => e.subschema({
      keyword: o,
      schemaProp: E,
      dataProp: E
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: E, errSchemaPath: $ } = c, v = r.length, g = v === h.minItems && (v === h.maxItems || h[t] === !1);
    if (E.strictTuples && !g) {
      const y = `"${o}" is ${v}-tuple, but minItems or maxItems/${t} are not specified or different at path "${$}"`;
      (0, An.checkStrictMode)(c, y, E.strictTuples);
    }
  }
}
Pr.validateTuple = lu;
Pr.default = Q0;
Object.defineProperty(Co, "__esModule", { value: !0 });
const Z0 = Pr, x0 = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Z0.validateTuple)(e, "items")
};
Co.default = x0;
var Do = {};
Object.defineProperty(Do, "__esModule", { value: !0 });
const Qi = ae, e_ = F, t_ = ie, r_ = Sr, n_ = {
  message: ({ params: { len: e } }) => (0, Qi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Qi._)`{limit: ${e}}`
}, s_ = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: n_,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, e_.alwaysValidSchema)(n, t) && (s ? (0, r_.validateAdditionalItems)(e, s) : e.ok((0, t_.validateArray)(e)));
  }
};
Do.default = s_;
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const Xe = ae, pn = F, a_ = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Xe.str)`must contain at least ${e} valid item(s)` : (0, Xe.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Xe._)`{minContains: ${e}}` : (0, Xe._)`{minContains: ${e}, maxContains: ${t}}`
}, o_ = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: a_,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, c;
    const { minContains: l, maxContains: d } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, c = d) : o = 1;
    const u = t.const("len", (0, Xe._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, pn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, pn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, pn.alwaysValidSchema)(a, r)) {
      let g = (0, Xe._)`${u} >= ${o}`;
      c !== void 0 && (g = (0, Xe._)`${g} && ${u} <= ${c}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? $(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, Xe._)`${s}.length > 0`, E)) : (t.let(h, !1), E()), e.result(h, () => e.reset());
    function E() {
      const g = t.name("_valid"), y = t.let("count", 0);
      $(g, () => t.if(g, () => v(y)));
    }
    function $(g, y) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: pn.Type.Num,
          compositeRule: !0
        }, g), y();
      });
    }
    function v(g) {
      t.code((0, Xe._)`${g}++`), c === void 0 ? t.if((0, Xe._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Xe._)`${g} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Xe._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Mo.default = o_;
var uu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ae, r = F, n = ie;
  e.error = {
    message: ({ params: { property: l, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${l} is present`;
    },
    params: ({ params: { property: l, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${l},
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
    code(l) {
      const [d, u] = a(l);
      o(l, d), c(l, u);
    }
  };
  function a({ schema: l }) {
    const d = {}, u = {};
    for (const h in l) {
      if (h === "__proto__")
        continue;
      const E = Array.isArray(l[h]) ? d : u;
      E[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: E } = l;
    if (Object.keys(d).length === 0)
      return;
    const $ = u.let("missing");
    for (const v in d) {
      const g = d[v];
      if (g.length === 0)
        continue;
      const y = (0, n.propertyInData)(u, h, v, E.opts.ownProperties);
      l.setParams({
        property: v,
        depsCount: g.length,
        deps: g.join(", ")
      }), E.allErrors ? u.if(y, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${y} && (${(0, n.checkMissingProp)(l, g, $)})`), (0, n.reportMissingProp)(l, $), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: E, it: $ } = l, v = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)($, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, $.opts.ownProperties),
        () => {
          const y = l.subschema({ keyword: E, schemaProp: g }, v);
          l.mergeValidEvaluated(y, v);
        },
        () => u.var(v, !0)
        // TODO var
      ), l.ok(v));
  }
  e.validateSchemaDeps = c, e.default = s;
})(uu);
var Lo = {};
Object.defineProperty(Lo, "__esModule", { value: !0 });
const du = ae, i_ = F, c_ = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, du._)`{propertyName: ${e.propertyName}}`
}, l_ = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: c_,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, i_.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, du.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Lo.default = l_;
var us = {};
Object.defineProperty(us, "__esModule", { value: !0 });
const $n = ie, tt = ae, u_ = Vt(), yn = F, d_ = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, tt._)`{additionalProperty: ${e.additionalProperty}}`
}, f_ = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: d_,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, yn.alwaysValidSchema)(o, r))
      return;
    const d = (0, $n.allSchemaProperties)(n.properties), u = (0, $n.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, tt._)`${a} === ${u_.default.errors}`);
    function h() {
      t.forIn("key", s, (y) => {
        !d.length && !u.length ? v(y) : t.if(E(y), () => v(y));
      });
    }
    function E(y) {
      let m;
      if (d.length > 8) {
        const w = (0, yn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, $n.isOwnProperty)(t, w, y);
      } else d.length ? m = (0, tt.or)(...d.map((w) => (0, tt._)`${y} === ${w}`)) : m = tt.nil;
      return u.length && (m = (0, tt.or)(m, ...u.map((w) => (0, tt._)`${(0, $n.usePattern)(e, w)}.test(${y})`))), (0, tt.not)(m);
    }
    function $(y) {
      t.code((0, tt._)`delete ${s}[${y}]`);
    }
    function v(y) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        $(y);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: y }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, yn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g(y, m, !1), t.if((0, tt.not)(m), () => {
          e.reset(), $(y);
        })) : (g(y, m), c || t.if((0, tt.not)(m), () => t.break()));
      }
    }
    function g(y, m, w) {
      const P = {
        keyword: "additionalProperties",
        dataProp: y,
        dataPropType: yn.Type.Str
      };
      w === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
us.default = f_;
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const h_ = is(), Zi = ie, Is = F, xi = us, m_ = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && xi.default.code(new h_.KeywordCxt(a, xi.default, "additionalProperties"));
    const o = (0, Zi.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Is.mergeEvaluated.props(t, (0, Is.toHash)(o), a.props));
    const c = o.filter((h) => !(0, Is.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, Zi.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, l);
    }
  }
};
Vo.default = m_;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const ec = ie, gn = ae, tc = F, rc = F, p_ = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, ec.allSchemaProperties)(r), l = c.filter((g) => (0, tc.alwaysValidSchema)(a, r[g]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof gn.Name) && (a.props = (0, rc.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    E();
    function E() {
      for (const g of c)
        d && $(g), a.allErrors ? v(g) : (t.var(u, !0), v(g), t.if(u));
    }
    function $(g) {
      for (const y in d)
        new RegExp(g).test(y) && (0, tc.checkStrictMode)(a, `property ${y} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function v(g) {
      t.forIn("key", n, (y) => {
        t.if((0, gn._)`${(0, ec.usePattern)(e, g)}.test(${y})`, () => {
          const m = l.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: y,
            dataPropType: rc.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, gn._)`${h}[${y}]`, !0) : !m && !a.allErrors && t.if((0, gn.not)(u), () => t.break());
        });
      });
    }
  }
};
Fo.default = p_;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const $_ = F, y_ = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, $_.alwaysValidSchema)(n, r)) {
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
zo.default = y_;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
const g_ = ie, __ = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: g_.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Uo.default = __;
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const Cn = ae, v_ = F, w_ = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Cn._)`{passingSchemas: ${e.passing}}`
}, E_ = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: w_,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, o = t.let("valid", !1), c = t.let("passing", null), l = t.name("_valid");
    e.setParams({ passing: c }), t.block(d), e.result(o, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let E;
        (0, v_.alwaysValidSchema)(s, u) ? t.var(l, !0) : E = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Cn._)`${l} && ${o}`).assign(o, !1).assign(c, (0, Cn._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), E && e.mergeEvaluated(E, Cn.Name);
        });
      });
    }
  }
};
qo.default = E_;
var Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const b_ = F, S_ = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, b_.alwaysValidSchema)(n, a))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
Go.default = S_;
var Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const Wn = ae, fu = F, P_ = {
  message: ({ params: e }) => (0, Wn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Wn._)`{failingKeyword: ${e.ifClause}}`
}, N_ = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: P_,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, fu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = nc(n, "then"), a = nc(n, "else");
    if (!s && !a)
      return;
    const o = t.let("valid", !0), c = t.name("_valid");
    if (l(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(c, d("then", u), d("else", u));
    } else s ? t.if(c, d("then")) : t.if((0, Wn.not)(c), d("else"));
    e.pass(o, () => e.error(!0));
    function l() {
      const u = e.subschema({
        keyword: "if",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c);
      e.mergeEvaluated(u);
    }
    function d(u, h) {
      return () => {
        const E = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(E, o), h ? t.assign(h, (0, Wn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function nc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, fu.alwaysValidSchema)(e, r);
}
Ko.default = N_;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const R_ = F, O_ = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, R_.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Ho.default = O_;
Object.defineProperty(Ao, "__esModule", { value: !0 });
const I_ = Sr, T_ = Co, j_ = Pr, k_ = Do, A_ = Mo, C_ = uu, D_ = Lo, M_ = us, L_ = Vo, V_ = Fo, F_ = zo, z_ = Uo, U_ = qo, q_ = Go, G_ = Ko, K_ = Ho;
function H_(e = !1) {
  const t = [
    // any
    F_.default,
    z_.default,
    U_.default,
    q_.default,
    G_.default,
    K_.default,
    // object
    D_.default,
    M_.default,
    C_.default,
    L_.default,
    V_.default
  ];
  return e ? t.push(T_.default, k_.default) : t.push(I_.default, j_.default), t.push(A_.default), t;
}
Ao.default = H_;
var Bo = {}, Jo = {};
Object.defineProperty(Jo, "__esModule", { value: !0 });
const Ee = ae, B_ = {
  message: ({ schemaCode: e }) => (0, Ee.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, Ee._)`{format: ${e}}`
}, J_ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: B_,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? E() : $();
    function E() {
      const v = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), g = r.const("fDef", (0, Ee._)`${v}[${o}]`), y = r.let("fType"), m = r.let("format");
      r.if((0, Ee._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(y, (0, Ee._)`${g}.type || "string"`).assign(m, (0, Ee._)`${g}.validate`), () => r.assign(y, (0, Ee._)`"string"`).assign(m, g)), e.fail$data((0, Ee.or)(w(), P()));
      function w() {
        return l.strictSchema === !1 ? Ee.nil : (0, Ee._)`${o} && !${m}`;
      }
      function P() {
        const O = u.$async ? (0, Ee._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, Ee._)`${m}(${n})`, T = (0, Ee._)`(typeof ${m} == "function" ? ${O} : ${m}.test(${n}))`;
        return (0, Ee._)`${m} && ${m} !== true && ${y} === ${t} && !${T}`;
      }
    }
    function $() {
      const v = h.formats[a];
      if (!v) {
        w();
        return;
      }
      if (v === !0)
        return;
      const [g, y, m] = P(v);
      g === t && e.pass(O());
      function w() {
        if (l.strictSchema === !1) {
          h.logger.warn(T());
          return;
        }
        throw new Error(T());
        function T() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(T) {
        const K = T instanceof RegExp ? (0, Ee.regexpCode)(T) : l.code.formats ? (0, Ee._)`${l.code.formats}${(0, Ee.getProperty)(a)}` : void 0, Y = r.scopeValue("formats", { key: a, ref: T, code: K });
        return typeof T == "object" && !(T instanceof RegExp) ? [T.type || "string", T.validate, (0, Ee._)`${Y}.validate`] : ["string", T, Y];
      }
      function O() {
        if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, Ee._)`await ${m}(${n})`;
        }
        return typeof y == "function" ? (0, Ee._)`${m}(${n})` : (0, Ee._)`${m}.test(${n})`;
      }
    }
  }
};
Jo.default = J_;
Object.defineProperty(Bo, "__esModule", { value: !0 });
const W_ = Jo, X_ = [W_.default];
Bo.default = X_;
var yr = {};
Object.defineProperty(yr, "__esModule", { value: !0 });
yr.contentVocabulary = yr.metadataVocabulary = void 0;
yr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
yr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(go, "__esModule", { value: !0 });
const Y_ = _o, Q_ = wo, Z_ = Ao, x_ = Bo, sc = yr, ev = [
  Y_.default,
  Q_.default,
  (0, Z_.default)(),
  x_.default,
  sc.metadataVocabulary,
  sc.contentVocabulary
];
go.default = ev;
var Wo = {}, ds = {};
Object.defineProperty(ds, "__esModule", { value: !0 });
ds.DiscrError = void 0;
var ac;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(ac || (ds.DiscrError = ac = {}));
Object.defineProperty(Wo, "__esModule", { value: !0 });
const lr = ae, xs = ds, oc = Ke, tv = br, rv = F, nv = {
  message: ({ params: { discrError: e, tagName: t } }) => e === xs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, lr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, sv = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: nv,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: o } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const c = n.propertyName;
    if (typeof c != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!o)
      throw new Error("discriminator: requires oneOf keyword");
    const l = t.let("valid", !1), d = t.const("tag", (0, lr._)`${r}${(0, lr.getProperty)(c)}`);
    t.if((0, lr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: xs.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const $ = E();
      t.if(!1);
      for (const v in $)
        t.elseIf((0, lr._)`${d} === ${v}`), t.assign(l, h($[v]));
      t.else(), e.error(!1, { discrError: xs.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h($) {
      const v = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: $ }, v);
      return e.mergeEvaluated(g, lr.Name), v;
    }
    function E() {
      var $;
      const v = {}, g = m(s);
      let y = !0;
      for (let O = 0; O < o.length; O++) {
        let T = o[O];
        if (T != null && T.$ref && !(0, rv.schemaHasRulesButRef)(T, a.self.RULES)) {
          const Y = T.$ref;
          if (T = oc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), T instanceof oc.SchemaEnv && (T = T.schema), T === void 0)
            throw new tv.default(a.opts.uriResolver, a.baseId, Y);
        }
        const K = ($ = T == null ? void 0 : T.properties) === null || $ === void 0 ? void 0 : $[c];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        y = y && (g || m(T)), w(K, O);
      }
      if (!y)
        throw new Error(`discriminator: "${c}" must be required`);
      return v;
      function m({ required: O }) {
        return Array.isArray(O) && O.includes(c);
      }
      function w(O, T) {
        if (O.const)
          P(O.const, T);
        else if (O.enum)
          for (const K of O.enum)
            P(K, T);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function P(O, T) {
        if (typeof O != "string" || O in v)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        v[O] = T;
      }
    }
  }
};
Wo.default = sv;
const av = "http://json-schema.org/draft-07/schema#", ov = "http://json-schema.org/draft-07/schema#", iv = "Core schema meta-schema", cv = {
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
}, lv = [
  "object",
  "boolean"
], uv = {
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
}, dv = {
  $schema: av,
  $id: ov,
  title: iv,
  definitions: cv,
  type: lv,
  properties: uv,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = zl, n = go, s = Wo, a = dv, o = ["/properties"], c = "http://json-schema.org/draft-07/schema";
  class l extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((v) => this.addVocabulary(v)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const v = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(v, c, !1), this.refs["http://json-schema.org/schema"] = c;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var d = is();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = ae;
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
  var h = po();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var E = br;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return E.default;
  } });
})(Bs, Bs.exports);
var fv = Bs.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = fv, r = ae, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: c, schemaCode: l }) => (0, r.str)`should be ${s[c].okStr} ${l}`,
    params: ({ keyword: c, schemaCode: l }) => (0, r._)`{comparison: ${s[c].okStr}, limit: ${l}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(c) {
      const { gen: l, data: d, schemaCode: u, keyword: h, it: E } = c, { opts: $, self: v } = E;
      if (!$.validateFormats)
        return;
      const g = new t.KeywordCxt(E, v.RULES.all.format.definition, "format");
      g.$data ? y() : m();
      function y() {
        const P = l.scopeValue("formats", {
          ref: v.formats,
          code: $.code.formats
        }), O = l.const("fmt", (0, r._)`${P}[${g.schemaCode}]`);
        c.fail$data((0, r.or)((0, r._)`typeof ${O} != "object"`, (0, r._)`${O} instanceof RegExp`, (0, r._)`typeof ${O}.compare != "function"`, w(O)));
      }
      function m() {
        const P = g.schema, O = v.formats[P];
        if (!O || O === !0)
          return;
        if (typeof O != "object" || O instanceof RegExp || typeof O.compare != "function")
          throw new Error(`"${h}": format "${P}" does not define "compare" function`);
        const T = l.scopeValue("formats", {
          key: P,
          ref: O,
          code: $.code.formats ? (0, r._)`${$.code.formats}${(0, r.getProperty)(P)}` : void 0
        });
        c.fail$data(w(T));
      }
      function w(P) {
        return (0, r._)`${P}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (c) => (c.addKeyword(e.formatLimitDefinition), c);
  e.default = o;
})(Fl);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Vl, n = Fl, s = ae, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), c = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return l(d, u, r.fullFormats, a), d;
    const [h, E] = u.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], $ = u.formats || r.formatNames;
    return l(d, $, h, E), u.keywords && (0, n.default)(d), d;
  };
  c.get = (d, u = "full") => {
    const E = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!E)
      throw new Error(`Unknown format "${d}"`);
    return E;
  };
  function l(d, u, h, E) {
    var $, v;
    ($ = (v = d.opts.code).formats) !== null && $ !== void 0 || (v.formats = (0, s._)`require("ajv-formats/dist/formats").${E}`);
    for (const g of u)
      d.addFormat(g, h[g]);
  }
  e.exports = t = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
})(Hs, Hs.exports);
var hv = Hs.exports;
const mv = /* @__PURE__ */ Vc(hv), pv = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !$v(s, a) && n || Object.defineProperty(e, r, a);
}, $v = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, yv = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, gv = (e, t) => `/* Wrapped ${e}*/
${t}`, _v = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), vv = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), wv = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = gv.bind(null, n, t.toString());
  Object.defineProperty(s, "name", vv);
  const { writable: a, enumerable: o, configurable: c } = _v;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: o, configurable: c });
};
function Ev(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    pv(e, t, s, r);
  return yv(e, t), wv(e, t, n), e;
}
const ic = (e, t = {}) => {
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
  let o, c, l;
  const d = function(...u) {
    const h = this, E = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), a && (l = e.apply(h, u));
    }, $ = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), a && (l = e.apply(h, u));
    }, v = s && !o;
    return clearTimeout(o), o = setTimeout(E, r), n > 0 && n !== Number.POSITIVE_INFINITY && !c && (c = setTimeout($, n)), v && (l = e.apply(h, u)), l;
  };
  return Ev(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), c && (clearTimeout(c), c = void 0);
  }, d;
};
var ea = { exports: {} };
const bv = "2.0.0", hu = 256, Sv = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Pv = 16, Nv = hu - 6, Rv = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var fs = {
  MAX_LENGTH: hu,
  MAX_SAFE_COMPONENT_LENGTH: Pv,
  MAX_SAFE_BUILD_LENGTH: Nv,
  MAX_SAFE_INTEGER: Sv,
  RELEASE_TYPES: Rv,
  SEMVER_SPEC_VERSION: bv,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const Ov = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var hs = Ov;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = fs, a = hs;
  t = e.exports = {};
  const o = t.re = [], c = t.safeRe = [], l = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const E = "[a-zA-Z0-9-]", $ = [
    ["\\s", 1],
    ["\\d", s],
    [E, n]
  ], v = (y) => {
    for (const [m, w] of $)
      y = y.split(`${m}*`).join(`${m}{0,${w}}`).split(`${m}+`).join(`${m}{1,${w}}`);
    return y;
  }, g = (y, m, w) => {
    const P = v(m), O = h++;
    a(y, O, m), u[y] = O, l[O] = m, d[O] = P, o[O] = new RegExp(m, w ? "g" : void 0), c[O] = new RegExp(P, w ? "g" : void 0);
  };
  g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${E}*`), g("MAINVERSION", `(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${l[u.PRERELEASEIDENTIFIER]}(?:\\.${l[u.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${l[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[u.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${E}+`), g("BUILD", `(?:\\+(${l[u.BUILDIDENTIFIER]}(?:\\.${l[u.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${l[u.MAINVERSION]}${l[u.PRERELEASE]}?${l[u.BUILD]}?`), g("FULL", `^${l[u.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${l[u.MAINVERSIONLOOSE]}${l[u.PRERELEASELOOSE]}?${l[u.BUILD]}?`), g("LOOSE", `^${l[u.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${l[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${l[u.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:${l[u.PRERELEASE]})?${l[u.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:${l[u.PRERELEASELOOSE]})?${l[u.BUILD]}?)?)?`), g("XRANGE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), g("COERCE", `${l[u.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", l[u.COERCEPLAIN] + `(?:${l[u.PRERELEASE]})?(?:${l[u.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", l[u.COERCE], !0), g("COERCERTLFULL", l[u.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${l[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", g("TILDE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${l[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", g("CARET", `^${l[u.LONECARET]}${l[u.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${l[u.LONECARET]}${l[u.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${l[u.GTLT]}\\s*(${l[u.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]}|${l[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${l[u.XRANGEPLAIN]})\\s+-\\s+(${l[u.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${l[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[u.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(ea, ea.exports);
var nn = ea.exports;
const Iv = Object.freeze({ loose: !0 }), Tv = Object.freeze({}), jv = (e) => e ? typeof e != "object" ? Iv : e : Tv;
var Xo = jv;
const cc = /^[0-9]+$/, mu = (e, t) => {
  const r = cc.test(e), n = cc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, kv = (e, t) => mu(t, e);
var pu = {
  compareIdentifiers: mu,
  rcompareIdentifiers: kv
};
const _n = hs, { MAX_LENGTH: lc, MAX_SAFE_INTEGER: vn } = fs, { safeRe: wn, t: En } = nn, Av = Xo, { compareIdentifiers: ar } = pu;
let Cv = class ut {
  constructor(t, r) {
    if (r = Av(r), t instanceof ut) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > lc)
      throw new TypeError(
        `version is longer than ${lc} characters`
      );
    _n("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? wn[En.LOOSE] : wn[En.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > vn || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > vn || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > vn || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < vn)
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
    if (_n("SemVer.compare", this.version, this.options, t), !(t instanceof ut)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new ut(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof ut || (t = new ut(t, this.options)), ar(this.major, t.major) || ar(this.minor, t.minor) || ar(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof ut || (t = new ut(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], s = t.prerelease[r];
      if (_n("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return ar(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof ut || (t = new ut(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (_n("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return ar(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? wn[En.PRERELEASELOOSE] : wn[En.PRERELEASE]);
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
          n === !1 && (a = [r]), ar(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ue = Cv;
const uc = Ue, Dv = (e, t, r = !1) => {
  if (e instanceof uc)
    return e;
  try {
    return new uc(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var Nr = Dv;
const Mv = Nr, Lv = (e, t) => {
  const r = Mv(e, t);
  return r ? r.version : null;
};
var Vv = Lv;
const Fv = Nr, zv = (e, t) => {
  const r = Fv(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var Uv = zv;
const dc = Ue, qv = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new dc(
      e instanceof dc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var Gv = qv;
const fc = Nr, Kv = (e, t) => {
  const r = fc(e, null, !0), n = fc(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, o = a ? r : n, c = a ? n : r, l = !!o.prerelease.length;
  if (!!c.prerelease.length && !l) {
    if (!c.patch && !c.minor)
      return "major";
    if (c.compareMain(o) === 0)
      return c.minor && !c.patch ? "minor" : "patch";
  }
  const u = l ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var Hv = Kv;
const Bv = Ue, Jv = (e, t) => new Bv(e, t).major;
var Wv = Jv;
const Xv = Ue, Yv = (e, t) => new Xv(e, t).minor;
var Qv = Yv;
const Zv = Ue, xv = (e, t) => new Zv(e, t).patch;
var ew = xv;
const tw = Nr, rw = (e, t) => {
  const r = tw(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var nw = rw;
const hc = Ue, sw = (e, t, r) => new hc(e, r).compare(new hc(t, r));
var it = sw;
const aw = it, ow = (e, t, r) => aw(t, e, r);
var iw = ow;
const cw = it, lw = (e, t) => cw(e, t, !0);
var uw = lw;
const mc = Ue, dw = (e, t, r) => {
  const n = new mc(e, r), s = new mc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var Yo = dw;
const fw = Yo, hw = (e, t) => e.sort((r, n) => fw(r, n, t));
var mw = hw;
const pw = Yo, $w = (e, t) => e.sort((r, n) => pw(n, r, t));
var yw = $w;
const gw = it, _w = (e, t, r) => gw(e, t, r) > 0;
var ms = _w;
const vw = it, ww = (e, t, r) => vw(e, t, r) < 0;
var Qo = ww;
const Ew = it, bw = (e, t, r) => Ew(e, t, r) === 0;
var $u = bw;
const Sw = it, Pw = (e, t, r) => Sw(e, t, r) !== 0;
var yu = Pw;
const Nw = it, Rw = (e, t, r) => Nw(e, t, r) >= 0;
var Zo = Rw;
const Ow = it, Iw = (e, t, r) => Ow(e, t, r) <= 0;
var xo = Iw;
const Tw = $u, jw = yu, kw = ms, Aw = Zo, Cw = Qo, Dw = xo, Mw = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return Tw(e, r, n);
    case "!=":
      return jw(e, r, n);
    case ">":
      return kw(e, r, n);
    case ">=":
      return Aw(e, r, n);
    case "<":
      return Cw(e, r, n);
    case "<=":
      return Dw(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var gu = Mw;
const Lw = Ue, Vw = Nr, { safeRe: bn, t: Sn } = nn, Fw = (e, t) => {
  if (e instanceof Lw)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? bn[Sn.COERCEFULL] : bn[Sn.COERCE]);
  else {
    const l = t.includePrerelease ? bn[Sn.COERCERTLFULL] : bn[Sn.COERCERTL];
    let d;
    for (; (d = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), l.lastIndex = d.index + d[1].length + d[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", o = t.includePrerelease && r[5] ? `-${r[5]}` : "", c = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return Vw(`${n}.${s}.${a}${o}${c}`, t);
};
var zw = Fw;
class Uw {
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
var qw = Uw, Ts, pc;
function ct() {
  if (pc) return Ts;
  pc = 1;
  const e = /\s+/g;
  class t {
    constructor(D, U) {
      if (U = s(U), D instanceof t)
        return D.loose === !!U.loose && D.includePrerelease === !!U.includePrerelease ? D : new t(D.raw, U);
      if (D instanceof a)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = U, this.loose = !!U.loose, this.includePrerelease = !!U.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((V) => this.parseRange(V.trim())).filter((V) => V.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const V = this.set[0];
        if (this.set = this.set.filter((J) => !g(J[0])), this.set.length === 0)
          this.set = [V];
        else if (this.set.length > 1) {
          for (const J of this.set)
            if (J.length === 1 && y(J[0])) {
              this.set = [J];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const U = this.set[D];
          for (let V = 0; V < U.length; V++)
            V > 0 && (this.formatted += " "), this.formatted += U[V].toString().trim();
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
    parseRange(D) {
      const V = ((this.options.includePrerelease && $) | (this.options.loose && v)) + ":" + D, J = n.get(V);
      if (J)
        return J;
      const z = this.options.loose, N = z ? l[d.HYPHENRANGELOOSE] : l[d.HYPHENRANGE];
      D = D.replace(N, X(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(l[d.COMPARATORTRIM], u), o("comparator trim", D), D = D.replace(l[d.TILDETRIM], h), o("tilde trim", D), D = D.replace(l[d.CARETTRIM], E), o("caret trim", D);
      let p = D.split(" ").map((f) => w(f, this.options)).join(" ").split(/\s+/).map((f) => G(f, this.options));
      z && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(l[d.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), _ = p.map((f) => new a(f, this.options));
      for (const f of _) {
        if (g(f))
          return [f];
        S.set(f.value, f);
      }
      S.size > 1 && S.has("") && S.delete("");
      const i = [...S.values()];
      return n.set(V, i), i;
    }
    intersects(D, U) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((V) => m(V, U) && D.set.some((J) => m(J, U) && V.every((z) => J.every((N) => z.intersects(N, U)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new c(D, this.options);
        } catch {
          return !1;
        }
      for (let U = 0; U < this.set.length; U++)
        if (Z(this.set[U], D, this.options))
          return !0;
      return !1;
    }
  }
  Ts = t;
  const r = qw, n = new r(), s = Xo, a = ps(), o = hs, c = Ue, {
    safeRe: l,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: E
  } = nn, { FLAG_INCLUDE_PRERELEASE: $, FLAG_LOOSE: v } = fs, g = (j) => j.value === "<0.0.0-0", y = (j) => j.value === "", m = (j, D) => {
    let U = !0;
    const V = j.slice();
    let J = V.pop();
    for (; U && V.length; )
      U = V.every((z) => J.intersects(z, D)), J = V.pop();
    return U;
  }, w = (j, D) => (o("comp", j, D), j = K(j, D), o("caret", j), j = O(j, D), o("tildes", j), j = ce(j, D), o("xrange", j), j = ge(j, D), o("stars", j), j), P = (j) => !j || j.toLowerCase() === "x" || j === "*", O = (j, D) => j.trim().split(/\s+/).map((U) => T(U, D)).join(" "), T = (j, D) => {
    const U = D.loose ? l[d.TILDELOOSE] : l[d.TILDE];
    return j.replace(U, (V, J, z, N, p) => {
      o("tilde", j, V, J, z, N, p);
      let S;
      return P(J) ? S = "" : P(z) ? S = `>=${J}.0.0 <${+J + 1}.0.0-0` : P(N) ? S = `>=${J}.${z}.0 <${J}.${+z + 1}.0-0` : p ? (o("replaceTilde pr", p), S = `>=${J}.${z}.${N}-${p} <${J}.${+z + 1}.0-0`) : S = `>=${J}.${z}.${N} <${J}.${+z + 1}.0-0`, o("tilde return", S), S;
    });
  }, K = (j, D) => j.trim().split(/\s+/).map((U) => Y(U, D)).join(" "), Y = (j, D) => {
    o("caret", j, D);
    const U = D.loose ? l[d.CARETLOOSE] : l[d.CARET], V = D.includePrerelease ? "-0" : "";
    return j.replace(U, (J, z, N, p, S) => {
      o("caret", j, J, z, N, p, S);
      let _;
      return P(z) ? _ = "" : P(N) ? _ = `>=${z}.0.0${V} <${+z + 1}.0.0-0` : P(p) ? z === "0" ? _ = `>=${z}.${N}.0${V} <${z}.${+N + 1}.0-0` : _ = `>=${z}.${N}.0${V} <${+z + 1}.0.0-0` : S ? (o("replaceCaret pr", S), z === "0" ? N === "0" ? _ = `>=${z}.${N}.${p}-${S} <${z}.${N}.${+p + 1}-0` : _ = `>=${z}.${N}.${p}-${S} <${z}.${+N + 1}.0-0` : _ = `>=${z}.${N}.${p}-${S} <${+z + 1}.0.0-0`) : (o("no pr"), z === "0" ? N === "0" ? _ = `>=${z}.${N}.${p}${V} <${z}.${N}.${+p + 1}-0` : _ = `>=${z}.${N}.${p}${V} <${z}.${+N + 1}.0-0` : _ = `>=${z}.${N}.${p} <${+z + 1}.0.0-0`), o("caret return", _), _;
    });
  }, ce = (j, D) => (o("replaceXRanges", j, D), j.split(/\s+/).map((U) => he(U, D)).join(" ")), he = (j, D) => {
    j = j.trim();
    const U = D.loose ? l[d.XRANGELOOSE] : l[d.XRANGE];
    return j.replace(U, (V, J, z, N, p, S) => {
      o("xRange", j, V, J, z, N, p, S);
      const _ = P(z), i = _ || P(N), f = i || P(p), b = f;
      return J === "=" && b && (J = ""), S = D.includePrerelease ? "-0" : "", _ ? J === ">" || J === "<" ? V = "<0.0.0-0" : V = "*" : J && b ? (i && (N = 0), p = 0, J === ">" ? (J = ">=", i ? (z = +z + 1, N = 0, p = 0) : (N = +N + 1, p = 0)) : J === "<=" && (J = "<", i ? z = +z + 1 : N = +N + 1), J === "<" && (S = "-0"), V = `${J + z}.${N}.${p}${S}`) : i ? V = `>=${z}.0.0${S} <${+z + 1}.0.0-0` : f && (V = `>=${z}.${N}.0${S} <${z}.${+N + 1}.0-0`), o("xRange return", V), V;
    });
  }, ge = (j, D) => (o("replaceStars", j, D), j.trim().replace(l[d.STAR], "")), G = (j, D) => (o("replaceGTE0", j, D), j.trim().replace(l[D.includePrerelease ? d.GTE0PRE : d.GTE0], "")), X = (j) => (D, U, V, J, z, N, p, S, _, i, f, b) => (P(V) ? U = "" : P(J) ? U = `>=${V}.0.0${j ? "-0" : ""}` : P(z) ? U = `>=${V}.${J}.0${j ? "-0" : ""}` : N ? U = `>=${U}` : U = `>=${U}${j ? "-0" : ""}`, P(_) ? S = "" : P(i) ? S = `<${+_ + 1}.0.0-0` : P(f) ? S = `<${_}.${+i + 1}.0-0` : b ? S = `<=${_}.${i}.${f}-${b}` : j ? S = `<${_}.${i}.${+f + 1}-0` : S = `<=${S}`, `${U} ${S}`.trim()), Z = (j, D, U) => {
    for (let V = 0; V < j.length; V++)
      if (!j[V].test(D))
        return !1;
    if (D.prerelease.length && !U.includePrerelease) {
      for (let V = 0; V < j.length; V++)
        if (o(j[V].semver), j[V].semver !== a.ANY && j[V].semver.prerelease.length > 0) {
          const J = j[V].semver;
          if (J.major === D.major && J.minor === D.minor && J.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return Ts;
}
var js, $c;
function ps() {
  if ($c) return js;
  $c = 1;
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
      this.operator = E[1] !== void 0 ? E[1] : "", this.operator === "=" && (this.operator = ""), E[2] ? this.semver = new c(E[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (o("Comparator.test", u, this.options.loose), this.semver === e || u === e)
        return !0;
      if (typeof u == "string")
        try {
          u = new c(u, this.options);
        } catch {
          return !1;
        }
      return a(u, this.operator, this.semver, this.options);
    }
    intersects(u, h) {
      if (!(u instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(u.value, h).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new l(this.value, h).test(u.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || a(this.semver, "<", u.semver, h) && this.operator.startsWith(">") && u.operator.startsWith("<") || a(this.semver, ">", u.semver, h) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  js = t;
  const r = Xo, { safeRe: n, t: s } = nn, a = gu, o = hs, c = Ue, l = ct();
  return js;
}
const Gw = ct(), Kw = (e, t, r) => {
  try {
    t = new Gw(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var $s = Kw;
const Hw = ct(), Bw = (e, t) => new Hw(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var Jw = Bw;
const Ww = Ue, Xw = ct(), Yw = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Xw(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === -1) && (n = o, s = new Ww(n, r));
  }), n;
};
var Qw = Yw;
const Zw = Ue, xw = ct(), eE = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new xw(t, r);
  } catch {
    return null;
  }
  return e.forEach((o) => {
    a.test(o) && (!n || s.compare(o) === 1) && (n = o, s = new Zw(n, r));
  }), n;
};
var tE = eE;
const ks = Ue, rE = ct(), yc = ms, nE = (e, t) => {
  e = new rE(e, t);
  let r = new ks("0.0.0");
  if (e.test(r) || (r = new ks("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const c = new ks(o.semver.version);
      switch (o.operator) {
        case ">":
          c.prerelease.length === 0 ? c.patch++ : c.prerelease.push(0), c.raw = c.format();
        case "":
        case ">=":
          (!a || yc(c, a)) && (a = c);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || yc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var sE = nE;
const aE = ct(), oE = (e, t) => {
  try {
    return new aE(e, t).range || "*";
  } catch {
    return null;
  }
};
var iE = oE;
const cE = Ue, _u = ps(), { ANY: lE } = _u, uE = ct(), dE = $s, gc = ms, _c = Qo, fE = xo, hE = Zo, mE = (e, t, r, n) => {
  e = new cE(e, n), t = new uE(t, n);
  let s, a, o, c, l;
  switch (r) {
    case ">":
      s = gc, a = fE, o = _c, c = ">", l = ">=";
      break;
    case "<":
      s = _c, a = hE, o = gc, c = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (dE(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, E = null;
    if (u.forEach(($) => {
      $.semver === lE && ($ = new _u(">=0.0.0")), h = h || $, E = E || $, s($.semver, h.semver, n) ? h = $ : o($.semver, E.semver, n) && (E = $);
    }), h.operator === c || h.operator === l || (!E.operator || E.operator === c) && a(e, E.semver))
      return !1;
    if (E.operator === l && o(e, E.semver))
      return !1;
  }
  return !0;
};
var ei = mE;
const pE = ei, $E = (e, t, r) => pE(e, t, ">", r);
var yE = $E;
const gE = ei, _E = (e, t, r) => gE(e, t, "<", r);
var vE = _E;
const vc = ct(), wE = (e, t, r) => (e = new vc(e, r), t = new vc(t, r), e.intersects(t, r));
var EE = wE;
const bE = $s, SE = it;
var PE = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const o = e.sort((u, h) => SE(u, h, r));
  for (const u of o)
    bE(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const c = [];
  for (const [u, h] of n)
    u === h ? c.push(u) : !h && u === o[0] ? c.push("*") : h ? u === o[0] ? c.push(`<=${h}`) : c.push(`${u} - ${h}`) : c.push(`>=${u}`);
  const l = c.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < d.length ? l : t;
};
const wc = ct(), ti = ps(), { ANY: As } = ti, Lr = $s, ri = it, NE = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new wc(e, r), t = new wc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const o = OE(s, a, r);
      if (n = n || o !== null, o)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, RE = [new ti(">=0.0.0-0")], Ec = [new ti(">=0.0.0")], OE = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === As) {
    if (t.length === 1 && t[0].semver === As)
      return !0;
    r.includePrerelease ? e = RE : e = Ec;
  }
  if (t.length === 1 && t[0].semver === As) {
    if (r.includePrerelease)
      return !0;
    t = Ec;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const $ of e)
    $.operator === ">" || $.operator === ">=" ? s = bc(s, $, r) : $.operator === "<" || $.operator === "<=" ? a = Sc(a, $, r) : n.add($.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = ri(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const $ of n) {
    if (s && !Lr($, String(s), r) || a && !Lr($, String(a), r))
      return null;
    for (const v of t)
      if (!Lr($, String(v), r))
        return !1;
    return !0;
  }
  let c, l, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, E = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const $ of t) {
    if (u = u || $.operator === ">" || $.operator === ">=", d = d || $.operator === "<" || $.operator === "<=", s) {
      if (E && $.semver.prerelease && $.semver.prerelease.length && $.semver.major === E.major && $.semver.minor === E.minor && $.semver.patch === E.patch && (E = !1), $.operator === ">" || $.operator === ">=") {
        if (c = bc(s, $, r), c === $ && c !== s)
          return !1;
      } else if (s.operator === ">=" && !Lr(s.semver, String($), r))
        return !1;
    }
    if (a) {
      if (h && $.semver.prerelease && $.semver.prerelease.length && $.semver.major === h.major && $.semver.minor === h.minor && $.semver.patch === h.patch && (h = !1), $.operator === "<" || $.operator === "<=") {
        if (l = Sc(a, $, r), l === $ && l !== a)
          return !1;
      } else if (a.operator === "<=" && !Lr(a.semver, String($), r))
        return !1;
    }
    if (!$.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || E || h);
}, bc = (e, t, r) => {
  if (!e)
    return t;
  const n = ri(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Sc = (e, t, r) => {
  if (!e)
    return t;
  const n = ri(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var IE = NE;
const Cs = nn, Pc = fs, TE = Ue, Nc = pu, jE = Nr, kE = Vv, AE = Uv, CE = Gv, DE = Hv, ME = Wv, LE = Qv, VE = ew, FE = nw, zE = it, UE = iw, qE = uw, GE = Yo, KE = mw, HE = yw, BE = ms, JE = Qo, WE = $u, XE = yu, YE = Zo, QE = xo, ZE = gu, xE = zw, eb = ps(), tb = ct(), rb = $s, nb = Jw, sb = Qw, ab = tE, ob = sE, ib = iE, cb = ei, lb = yE, ub = vE, db = EE, fb = PE, hb = IE;
var mb = {
  parse: jE,
  valid: kE,
  clean: AE,
  inc: CE,
  diff: DE,
  major: ME,
  minor: LE,
  patch: VE,
  prerelease: FE,
  compare: zE,
  rcompare: UE,
  compareLoose: qE,
  compareBuild: GE,
  sort: KE,
  rsort: HE,
  gt: BE,
  lt: JE,
  eq: WE,
  neq: XE,
  gte: YE,
  lte: QE,
  cmp: ZE,
  coerce: xE,
  Comparator: eb,
  Range: tb,
  satisfies: rb,
  toComparators: nb,
  maxSatisfying: sb,
  minSatisfying: ab,
  minVersion: ob,
  validRange: ib,
  outside: cb,
  gtr: lb,
  ltr: ub,
  intersects: db,
  simplifyRange: fb,
  subset: hb,
  SemVer: TE,
  re: Cs.re,
  src: Cs.src,
  tokens: Cs.t,
  SEMVER_SPEC_VERSION: Pc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Pc.RELEASE_TYPES,
  compareIdentifiers: Nc.compareIdentifiers,
  rcompareIdentifiers: Nc.rcompareIdentifiers
};
const or = /* @__PURE__ */ Vc(mb), pb = Object.prototype.toString, $b = "[object Uint8Array]", yb = "[object ArrayBuffer]";
function vu(e, t, r) {
  return e ? e.constructor === t ? !0 : pb.call(e) === r : !1;
}
function wu(e) {
  return vu(e, Uint8Array, $b);
}
function gb(e) {
  return vu(e, ArrayBuffer, yb);
}
function _b(e) {
  return wu(e) || gb(e);
}
function vb(e) {
  if (!wu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function wb(e) {
  if (!_b(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Rc(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    vb(s), r.set(s, n), n += s.length;
  return r;
}
const Pn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Oc(e, t = "utf8") {
  return wb(e), Pn[t] ?? (Pn[t] = new globalThis.TextDecoder(t)), Pn[t].decode(e);
}
function Eb(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const bb = new globalThis.TextEncoder();
function Ds(e) {
  return Eb(e), bb.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Sb = mv.default, Ic = "aes-256-cbc", ir = () => /* @__PURE__ */ Object.create(null), Pb = (e) => e != null, Nb = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Dn = "__internal__", Ms = `${Dn}.migrations.version`;
var At, yt, Be, gt;
class Rb {
  constructor(t = {}) {
    Ir(this, "path");
    Ir(this, "events");
    Tr(this, At);
    Tr(this, yt);
    Tr(this, Be);
    Tr(this, gt, {});
    Ir(this, "_deserialize", (t) => JSON.parse(t));
    Ir(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
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
      r.cwd = Lu(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (jr(this, Be, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new Uy.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      Sb(o);
      const c = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      jr(this, At, o.compile(c));
      for (const [l, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && ($e(this, gt)[l] = d.default);
    }
    r.defaults && jr(this, gt, {
      ...$e(this, gt),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), jr(this, yt, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = le.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(ir(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      Ru.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if ($e(this, Be).accessPropertiesByDotNotation)
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
      throw new TypeError(`Please don't use the ${Dn} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      Nb(a, o), $e(this, Be).accessPropertiesByDotNotation ? ai(n, a, o) : n[a] = o;
    };
    if (typeof t == "object") {
      const a = t;
      for (const [o, c] of Object.entries(a))
        s(o, c);
    } else
      s(t, r);
    this.store = n;
  }
  has(t) {
    return $e(this, Be).accessPropertiesByDotNotation ? Au(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      Pb($e(this, gt)[r]) && this.set(r, $e(this, gt)[r]);
  }
  delete(t) {
    const { store: r } = this;
    $e(this, Be).accessPropertiesByDotNotation ? ku(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = ir();
    for (const t of Object.keys($e(this, gt)))
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
      const t = se.readFileSync(this.path, $e(this, yt) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(ir(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), ir();
      if ($e(this, Be).clearInvalidConfig && t.name === "SyntaxError")
        return ir();
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
    if (!$e(this, yt))
      return typeof t == "string" ? t : Oc(t);
    try {
      const r = t.slice(0, 16), n = kr.pbkdf2Sync($e(this, yt), r.toString(), 1e4, 32, "sha512"), s = kr.createDecipheriv(Ic, n, r), a = t.slice(17), o = typeof a == "string" ? Ds(a) : a;
      return Oc(Rc([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Nu(o, a) || (n = o, r.call(this, o, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!$e(this, At) || $e(this, At).call(this, t) || !$e(this, At).errors)
      return;
    const n = $e(this, At).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    se.mkdirSync(le.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if ($e(this, yt)) {
      const n = kr.randomBytes(16), s = kr.pbkdf2Sync($e(this, yt), n.toString(), 1e4, 32, "sha512"), a = kr.createCipheriv(Ic, s, n);
      r = Rc([n, Ds(":"), a.update(Ds(r)), a.final()]);
    }
    if (Pe.env.SNAP)
      se.writeFileSync(this.path, r, { mode: $e(this, Be).configFileMode });
    else
      try {
        Lc(this.path, r, { mode: $e(this, Be).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          se.writeFileSync(this.path, r, { mode: $e(this, Be).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), se.existsSync(this.path) || this._write(ir()), Pe.platform === "win32" ? se.watch(this.path, { persistent: !1 }, ic(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : se.watchFile(this.path, { persistent: !1 }, ic(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(Ms, "0.0.0");
    const a = Object.keys(t).filter((c) => this._shouldPerformMigration(c, s, r));
    let o = { ...this.store };
    for (const c of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: c,
          finalVersion: r,
          versions: a
        });
        const l = t[c];
        l == null || l(this), this._set(Ms, c), s = c, o = { ...this.store };
      } catch (l) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${l}`);
      }
    (this._isVersionInRangeFormat(s) || !or.eq(s, r)) && this._set(Ms, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === Dn ? !0 : typeof t != "string" ? !1 : $e(this, Be).accessPropertiesByDotNotation ? !!t.startsWith(`${Dn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return or.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && or.satisfies(r, t) ? !1 : or.satisfies(n, t) : !(or.lte(t, r) || or.gt(t, n));
  }
  _get(t, r) {
    return ju(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    ai(n, t, r), this.store = n;
  }
}
At = new WeakMap(), yt = new WeakMap(), Be = new WeakMap(), gt = new WeakMap();
const { app: Mn, ipcMain: ta, shell: Ob } = kc;
let Tc = !1;
const jc = () => {
  if (!ta || !Mn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Mn.getPath("userData"),
    appVersion: Mn.getVersion()
  };
  return Tc || (ta.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Tc = !0), e;
};
class Ib extends Rb {
  constructor(t) {
    let r, n;
    if (Pe.type === "renderer") {
      const s = kc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else ta && Mn && ({ defaultCwd: r, appVersion: n } = jc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = le.isAbsolute(t.cwd) ? t.cwd : le.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    jc();
  }
  async openInEditor() {
    const t = await Ob.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const sn = ue.dirname(Ou(import.meta.url));
process.env.APP_ROOT = ue.join(sn, "..");
const ra = process.env.VITE_DEV_SERVER_URL, Wb = ue.join(process.env.APP_ROOT, "dist-electron"), Eu = ue.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = ra ? ue.join(process.env.APP_ROOT, "public") : Eu;
let Q, Ln = null;
const st = /* @__PURE__ */ new Map();
let Te = null;
const Xn = {
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
}, Vn = new Ib({
  defaults: {
    formData: Xn
  },
  name: "app-config"
});
ot.handle(
  "save-data",
  async (e, t, r) => {
    try {
      if (t === "all")
        Vn.set("formData", r);
      else {
        const s = { ...Vn.get("formData", Xn), ...r };
        Vn.set("formData", s);
      }
      return console.log("Dados salvos com sucesso para a chave:", t), !0;
    } catch (n) {
      return console.error("Erro ao salvar dados:", n), !1;
    }
  }
);
ot.handle("load-data", async () => {
  try {
    return Vn.get("formData", Xn);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), Xn;
  }
});
ot.handle("select-folder", async () => {
  const e = await Ac.showOpenDialog(Q, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
ot.handle("select-file", async () => {
  const e = await Ac.showOpenDialog(Q, {
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
ot.handle(
  "print-pdf",
  async (e, t) => {
    try {
      const r = new Cc({
        width: 800,
        height: 600,
        show: !0,
        webPreferences: {
          preload: ue.join(sn, "preload.mjs"),
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
function Tb() {
  return ue.join("backend", "index.js");
}
ot.handle(
  "start-fork",
  async (e, { script: t, args: r = [] } = {}) => {
    let n;
    if (t ? n = t : n = Tb(), !Qt.existsSync(n))
      return console.error("Backend script não encontrado:", n), { ok: !1, reason: "backend-script-not-found" };
    try {
      const s = Qn(n, r, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: ue.dirname(n),
        silent: !1,
        env: { ...process.env }
      }), a = s.pid;
      if (console.log("Child process forked with PID:", a), typeof a == "number")
        st.set(a, s), console.log(
          "Child process added to children map. Total children:",
          st.size
        );
      else
        return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
      return new Promise((o, c) => {
        const l = setTimeout(() => {
          c(new Error("Timeout waiting for WebSocket port from backend"));
        }, 1e4), d = (u) => {
          u && u.type === "websocket-port" && typeof u.port == "number" && (clearTimeout(l), s.off("message", d), o({ ok: !0, port: u.port, pid: a }));
        };
        s.on("message", d), s.on("error", (u) => {
          console.error("Child process error:", u), typeof s.pid == "number" && st.delete(s.pid), clearTimeout(l), c(u);
        }), s.on("exit", (u, h) => {
          console.log(
            `Child process ${s.pid} exited with code ${u} and signal ${h}`
          ), typeof s.pid == "number" && st.delete(s.pid), Q && !Q.isDestroyed() && Q.webContents.send("child-exit", {
            pid: s.pid,
            code: u,
            signal: h
          }), clearTimeout(l), c(new Error(`Child process exited with code ${u}`));
        }), s.on("message", (u) => {
          console.log("Message from child:", u), !(u && typeof u == "object" && "type" in u && u.type === "websocket-port") && Q && !Q.isDestroyed() && Q.webContents.send("child-message", { pid: s.pid, msg: u });
        }), s.stdout && s.stdout.on("data", (u) => {
          console.log("Child stdout:", u.toString()), Q && !Q.isDestroyed() && Q.webContents.send("child-stdout", {
            pid: s.pid,
            data: u.toString()
          });
        }), s.stderr && s.stderr.on("data", (u) => {
          console.error("Child stderr:", u.toString()), Q && !Q.isDestroyed() && Q.webContents.send("child-stderr", {
            pid: s.pid,
            data: u.toString()
          });
        });
      });
    } catch (s) {
      return console.error("Failed to fork child process:", s), { ok: !1, reason: `fork-error: ${s}` };
    }
  }
);
ot.handle(
  "start-collector-fork",
  async (e, { args: t = [] } = {}) => {
    let r;
    if (Lt.isPackaged)
      r = ue.join(process.resourcesPath, "backend", "dist", "collector", "runner.js");
    else {
      const n = ue.dirname(ue.dirname(sn));
      r = ue.join(n, "back-end", "dist", "collector", "runner.js");
    }
    if (!Qt.existsSync(r))
      return { ok: !1, reason: "collector-not-found", attempted: [r] };
    try {
      const n = Qn(r, t, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: ue.dirname(r),
        env: { ...process.env }
      }), s = n.pid;
      return typeof s == "number" && (st.set(s, n), n.on("message", (a) => {
        Q && !Q.isDestroyed() && Q.webContents.send("child-message", { pid: s, msg: a });
      }), n.stdout && n.stdout.on("data", (a) => {
        Q && !Q.isDestroyed() && Q.webContents.send("child-stdout", { pid: s, data: a.toString() });
      }), n.stderr && n.stderr.on("data", (a) => {
        Q && !Q.isDestroyed() && Q.webContents.send("child-stderr", { pid: s, data: a.toString() });
      })), { ok: !0, pid: s };
    } catch (n) {
      return { ok: !1, reason: String(n) };
    }
  }
);
ot.handle(
  "send-to-child",
  async (e, { pid: t, msg: r } = {}) => {
    if (console.log(
      "send-to-child called with PID:",
      t,
      "Message type:",
      r == null ? void 0 : r.type
    ), console.log("Available children PIDs:", Array.from(st.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const n = st.get(t);
    if (!n) {
      if (console.log("Child not found for PID:", t), Ln)
        try {
          const s = ue.dirname(Ln), a = Qn(Ln, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: s,
            silent: !1,
            env: { ...process.env }
          }), o = a.pid;
          if (typeof o == "number") {
            st.set(o, a), Q && !Q.isDestroyed() && Q.webContents.send("child-message", {
              pid: o,
              msg: {
                type: "event",
                event: "reforked",
                payload: { oldPid: t, newPid: o }
              }
            });
            try {
              return a.send(r), { ok: !0 };
            } catch (c) {
              return console.error("Error sending message after refork:", c), { ok: !1, reason: String(c) };
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
ot.handle(
  "stop-child",
  async (e, { pid: t } = {}) => {
    if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const r = st.get(t);
    if (!r) return { ok: !1, reason: "not-found" };
    try {
      return r.kill("SIGTERM"), { ok: !0 };
    } catch (n) {
      return { ok: !1, reason: String(n) };
    }
  }
);
function jb() {
  if (Q = new Cc({
    icon: ue.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: ue.join(sn, "preload.mjs"),
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), Q.maximize(), Q.webContents.on("did-finish-load", () => {
    Q == null || Q.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ra)
    Q.loadURL(ra);
  else
    try {
      const e = ue.join(
        process.resourcesPath,
        "dist",
        "index.html"
      );
      if (console.log("[main] loading packaged index from", e), Qt.existsSync(e))
        Q.loadFile(e);
      else {
        const t = ue.join(Eu, "index.html");
        console.warn(
          "[main] packaged index not found at",
          e,
          "falling back to",
          t
        ), Q.loadFile(t);
      }
    } catch (e) {
      console.error("[main] failed to load packaged index.html", e);
      try {
        const t = ue.join(
          process.resourcesPath,
          "app.asar",
          "dist",
          "index.html"
        );
        console.log("[main] attempting alt loadFile", t), Q.loadFile(t);
      } catch (t) {
        console.error("[main] all index.html load attempts failed", t);
      }
    }
}
async function kb() {
  try {
    const e = await fetch("http://localhost:3000/api/ping");
    return e && e.ok ? (console.log("[main] backend is alive"), !0) : (console.log("[main] backend is not responding"), !1);
  } catch {
    return console.log("[main] backend ping failed"), !1;
  }
}
Lt.whenReady().then(() => {
  (async () => {
    if (Lt.isPackaged) {
      const e = ue.join(
        process.resourcesPath,
        "backend",
        "index.js"
      );
      Qt.existsSync(e) && (console.log("[main] spawning backend exe at", e), Te = Iu("node", [e], {
        stdio: ["pipe", "pipe", "pipe", "ipc"],
        cwd: ue.dirname(e),
        env: { ...process.env },
        shell: !1
      }), Te.on("error", (t) => {
        console.error("[main] spawned backend error:", t), Te = null;
      }), Te.on("exit", (t, r) => {
        console.log(
          `[main] spawned backend exited with code ${t} and signal ${r}`
        ), Te = null, Q && !Q.isDestroyed() && Q.webContents.send("child-exit", { pid: Te == null ? void 0 : Te.pid, code: t, signal: r });
      }), Te.stdout && (Te.stdout.on("data", (t) => {
        console.log("[spawned backend stdout]", t.toString()), Q && !Q.isDestroyed() && Q.webContents.send("child-stdout", {
          pid: Te == null ? void 0 : Te.pid,
          data: t.toString()
        });
      }), console.log("[main] spawned backend stdout attached")));
    } else
      try {
        const e = await kb();
        if (e)
          console.log("[main] backend is already running, not auto-forking");
        else {
          console.log(
            "[main] backend not responding, will attempt to auto-fork"
          );
          const t = ue.dirname(ue.dirname(sn)), n = [
            ue.join(t, "back-end", "dist", "index.js"),
            ue.join(t, "back-end", "dist", "src", "index.js"),
            ue.join(t, "back-end", "src", "index.ts")
          ].find((s) => Qt.existsSync(s));
          if (n && !e)
            try {
              console.log("[main] dev auto-forking backend at", n), Ln = n;
              const s = ue.dirname(n), a = Qn(n, [], {
                stdio: ["pipe", "pipe", "ipc"],
                cwd: s,
                env: { ...process.env }
              }), o = a.pid;
              typeof o == "number" && (st.set(o, a), console.log("[main] dev backend forked with PID", o)), a.on("message", (c) => {
                Q && !Q.isDestroyed() && Q.webContents.send("child-message", {
                  pid: a.pid,
                  msg: c
                });
              }), a.stdout && a.stdout.on("data", (c) => {
                console.log("[child stdout]", c.toString()), Q && !Q.isDestroyed() && Q.webContents.send("child-stdout", {
                  pid: a.pid,
                  data: c.toString()
                });
              }), a.stderr && a.stderr.on("data", (c) => {
                console.error("[child stderr]", c.toString()), Q && !Q.isDestroyed() && Q.webContents.send("child-stderr", {
                  pid: a.pid,
                  data: c.toString()
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
    jb();
  })();
});
Lt.on("window-all-closed", () => {
  process.platform !== "darwin" && Lt.quit();
});
Lt.on("before-quit", () => {
  try {
    Te && !Te.killed && (Te.kill(), Te = null);
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, e] of st.entries())
    try {
      e.kill("SIGTERM");
    } catch {
    }
});
const Ab = ue.join(Lt.getPath("userData"), "error.log"), bu = Qt.createWriteStream(Ab, { flags: "a" });
process.on("uncaughtException", (e) => {
  bu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`
  );
});
process.on("unhandledRejection", (e) => {
  bu.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`
  );
});
ot.handle(
  "save-pdf",
  async (e, t) => {
    try {
      const r = Lt.getPath("temp"), n = ue.join(r, `relatorio-${Date.now()}.pdf`), s = Buffer.from(t, "base64");
      return Qt.writeFileSync(n, s), { ok: !0, path: n };
    } catch (r) {
      return console.error("Failed to save pdf from renderer:", r), { ok: !1, error: String(r) };
    }
  }
);
export {
  Wb as MAIN_DIST,
  Eu as RENDERER_DIST,
  ra as VITE_DEV_SERVER_URL
};
