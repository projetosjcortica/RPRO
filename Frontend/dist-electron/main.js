var Xl = Object.defineProperty;
var Uo = (e) => {
  throw TypeError(e);
};
var Yl = (e, t, r) => t in e ? Xl(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var wr = (e, t, r) => Yl(e, typeof t != "symbol" ? t + "" : t, r), Ko = (e, t, r) => t.has(e) || Uo("Cannot " + r);
var _e = (e, t, r) => (Ko(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Er = (e, t, r) => t.has(e) ? Uo("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), br = (e, t, r, n) => (Ko(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import vc, { ipcMain as rt, dialog as wc, BrowserWindow as Ec, app as Bt } from "electron";
import * as Z from "path";
import Ne from "node:process";
import me from "node:path";
import { promisify as Te, isDeepStrictEqual as Ql } from "node:util";
import ae from "node:fs";
import Sr from "node:crypto";
import Zl from "node:assert";
import Fn from "node:os";
import Ke from "fs";
import { fileURLToPath as xl } from "url";
import { fork as zn, spawn as eu } from "child_process";
const Jt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, ls = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), tu = new Set("0123456789");
function qn(e) {
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
        if (n === "index" && !tu.has(a))
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
function Js(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function bc(e, t) {
  if (Js(e, t))
    throw new Error("Cannot use string index");
}
function ru(e, t, r) {
  if (!Jt(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = qn(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (Js(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function Go(e, t, r) {
  if (!Jt(e) || typeof t != "string")
    return e;
  const n = e, s = qn(t);
  for (let a = 0; a < s.length; a++) {
    const c = s[a];
    bc(e, c), a === s.length - 1 ? e[c] = r : Jt(e[c]) || (e[c] = typeof s[a + 1] == "number" ? [] : {}), e = e[c];
  }
  return n;
}
function nu(e, t) {
  if (!Jt(e) || typeof t != "string")
    return !1;
  const r = qn(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (bc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !Jt(e))
      return !1;
  }
}
function su(e, t) {
  if (!Jt(e) || typeof t != "string")
    return !1;
  const r = qn(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Jt(e) || !(n in e) || Js(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const It = Fn.homedir(), Ws = Fn.tmpdir(), { env: sr } = Ne, au = (e) => {
  const t = me.join(It, "Library");
  return {
    data: me.join(t, "Application Support", e),
    config: me.join(t, "Preferences", e),
    cache: me.join(t, "Caches", e),
    log: me.join(t, "Logs", e),
    temp: me.join(Ws, e)
  };
}, ou = (e) => {
  const t = sr.APPDATA || me.join(It, "AppData", "Roaming"), r = sr.LOCALAPPDATA || me.join(It, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: me.join(r, e, "Data"),
    config: me.join(t, e, "Config"),
    cache: me.join(r, e, "Cache"),
    log: me.join(r, e, "Log"),
    temp: me.join(Ws, e)
  };
}, iu = (e) => {
  const t = me.basename(It);
  return {
    data: me.join(sr.XDG_DATA_HOME || me.join(It, ".local", "share"), e),
    config: me.join(sr.XDG_CONFIG_HOME || me.join(It, ".config"), e),
    cache: me.join(sr.XDG_CACHE_HOME || me.join(It, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: me.join(sr.XDG_STATE_HOME || me.join(It, ".local", "state"), e),
    temp: me.join(Ws, t, e)
  };
};
function cu(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), Ne.platform === "darwin" ? au(e) : Ne.platform === "win32" ? ou(e) : iu(e);
}
const Et = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, ut = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, lu = Ne.getuid ? !Ne.getuid() : !1, uu = 1e4, qe = () => {
}, ve = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!ve.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !lu && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!ve.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!ve.isNodeError(e))
      throw e;
    if (!ve.isChangeErrorOk(e))
      throw e;
  }
};
class du {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = uu, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
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
const fu = new du(), bt = (e, t) => function(n) {
  return function s(...a) {
    return fu.schedule().then((c) => {
      const o = (d) => (c(), d), i = (d) => {
        if (c(), Date.now() >= n)
          throw d;
        if (t(d)) {
          const u = Math.round(100 * Math.random());
          return new Promise((b) => setTimeout(b, u)).then(() => s.apply(void 0, a));
        }
        throw d;
      };
      return e.apply(void 0, a).then(o, i);
    });
  };
}, St = (e, t) => function(n) {
  return function s(...a) {
    try {
      return e.apply(void 0, a);
    } catch (c) {
      if (Date.now() > n)
        throw c;
      if (t(c))
        return s.apply(void 0, a);
      throw c;
    }
  };
}, Ae = {
  attempt: {
    /* ASYNC */
    chmod: Et(Te(ae.chmod), ve.onChangeError),
    chown: Et(Te(ae.chown), ve.onChangeError),
    close: Et(Te(ae.close), qe),
    fsync: Et(Te(ae.fsync), qe),
    mkdir: Et(Te(ae.mkdir), qe),
    realpath: Et(Te(ae.realpath), qe),
    stat: Et(Te(ae.stat), qe),
    unlink: Et(Te(ae.unlink), qe),
    /* SYNC */
    chmodSync: ut(ae.chmodSync, ve.onChangeError),
    chownSync: ut(ae.chownSync, ve.onChangeError),
    closeSync: ut(ae.closeSync, qe),
    existsSync: ut(ae.existsSync, qe),
    fsyncSync: ut(ae.fsync, qe),
    mkdirSync: ut(ae.mkdirSync, qe),
    realpathSync: ut(ae.realpathSync, qe),
    statSync: ut(ae.statSync, qe),
    unlinkSync: ut(ae.unlinkSync, qe)
  },
  retry: {
    /* ASYNC */
    close: bt(Te(ae.close), ve.isRetriableError),
    fsync: bt(Te(ae.fsync), ve.isRetriableError),
    open: bt(Te(ae.open), ve.isRetriableError),
    readFile: bt(Te(ae.readFile), ve.isRetriableError),
    rename: bt(Te(ae.rename), ve.isRetriableError),
    stat: bt(Te(ae.stat), ve.isRetriableError),
    write: bt(Te(ae.write), ve.isRetriableError),
    writeFile: bt(Te(ae.writeFile), ve.isRetriableError),
    /* SYNC */
    closeSync: St(ae.closeSync, ve.isRetriableError),
    fsyncSync: St(ae.fsyncSync, ve.isRetriableError),
    openSync: St(ae.openSync, ve.isRetriableError),
    readFileSync: St(ae.readFileSync, ve.isRetriableError),
    renameSync: St(ae.renameSync, ve.isRetriableError),
    statSync: St(ae.statSync, ve.isRetriableError),
    writeSync: St(ae.writeSync, ve.isRetriableError),
    writeFileSync: St(ae.writeFileSync, ve.isRetriableError)
  }
}, hu = "utf8", Ho = 438, mu = 511, pu = {}, $u = Fn.userInfo().uid, yu = Fn.userInfo().gid, gu = 1e3, _u = !!Ne.getuid;
Ne.getuid && Ne.getuid();
const Bo = 128, vu = (e) => e instanceof Error && "code" in e, Jo = (e) => typeof e == "string", us = (e) => e === void 0, wu = Ne.platform === "linux", Sc = Ne.platform === "win32", Xs = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Sc || Xs.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
wu && Xs.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class Eu {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Sc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? Ne.kill(Ne.pid, "SIGTERM") : Ne.kill(Ne.pid, t));
      }
    }, this.hook = () => {
      Ne.once("exit", () => this.exit());
      for (const t of Xs)
        try {
          Ne.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const bu = new Eu(), Su = bu.register, Ce = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Ce.truncate(t(e));
    return n in Ce.store ? Ce.get(e, t, r) : (Ce.store[n] = r, [n, () => delete Ce.store[n]]);
  },
  purge: (e) => {
    Ce.store[e] && (delete Ce.store[e], Ae.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Ce.store[e] && (delete Ce.store[e], Ae.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Ce.store)
      Ce.purgeSync(e);
  },
  truncate: (e) => {
    const t = me.basename(e);
    if (t.length <= Bo)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - Bo;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Su(Ce.purgeSyncAll);
function Pc(e, t, r = pu) {
  if (Jo(r))
    return Pc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? gu) || -1);
  let s = null, a = null, c = null;
  try {
    const o = Ae.attempt.realpathSync(e), i = !!o;
    e = o || e, [a, s] = Ce.get(e, r.tmpCreate || Ce.create, r.tmpPurge !== !1);
    const d = _u && us(r.chown), u = us(r.mode);
    if (i && (d || u)) {
      const h = Ae.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), u && (r.mode = h.mode));
    }
    if (!i) {
      const h = me.dirname(e);
      Ae.attempt.mkdirSync(h, {
        mode: mu,
        recursive: !0
      });
    }
    c = Ae.retry.openSync(n)(a, "w", r.mode || Ho), r.tmpCreated && r.tmpCreated(a), Jo(t) ? Ae.retry.writeSync(n)(c, t, 0, r.encoding || hu) : us(t) || Ae.retry.writeSync(n)(c, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? Ae.retry.fsyncSync(n)(c) : Ae.attempt.fsync(c)), Ae.retry.closeSync(n)(c), c = null, r.chown && (r.chown.uid !== $u || r.chown.gid !== yu) && Ae.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== Ho && Ae.attempt.chmodSync(a, r.mode);
    try {
      Ae.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!vu(h) || h.code !== "ENAMETOOLONG")
        throw h;
      Ae.retry.renameSync(n)(a, Ce.truncate(e));
    }
    s(), a = null;
  } finally {
    c && Ae.attempt.closeSync(c), a && Ce.purge(a);
  }
}
function Nc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Rs = { exports: {} }, Rc = {}, dt = {}, Lt = {}, Kr = {}, te = {}, qr = {};
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
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((P, j) => `${P}${j}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((P, j) => (j instanceof r && (P[j.str] = (P[j.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const P = [m[0]];
    let j = 0;
    for (; j < w.length; )
      o(P, w[j]), P.push(m[++j]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function c(m, ...w) {
    const P = [p(m[0])];
    let j = 0;
    for (; j < w.length; )
      P.push(a), o(P, w[j]), P.push(a, p(m[++j]));
    return i(P), new n(P);
  }
  e.str = c;
  function o(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = o;
  function i(m) {
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
    return w.emptyStr() ? m : m.emptyStr() ? w : c`${m}${w}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : p(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(p(m));
  }
  e.stringify = b;
  function p(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = p;
  function $(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = $;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function v(m) {
    return new n(m.toString());
  }
  e.regexpCode = v;
})(qr);
var Os = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = qr;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(i) {
    i[i.Started = 0] = "Started", i[i.Completed = 1] = "Completed";
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
  const c = (0, t._)`\n`;
  class o extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? c : t.nil };
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
      const b = this.toName(d), { prefix: p } = b, $ = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[p];
      if (g) {
        const w = g.get($);
        if (w)
          return w;
      } else
        g = this._values[p] = /* @__PURE__ */ new Map();
      g.set($, b);
      const v = this._scope[p] || (this._scope[p] = []), m = v.length;
      return v[m] = u.ref, b.setValue(u, { property: p, itemIndex: m }), b;
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
      return this._reduceValues(d, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, b) {
      let p = t.nil;
      for (const $ in d) {
        const g = d[$];
        if (!g)
          continue;
        const v = h[$] = h[$] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (v.has(m))
            return;
          v.set(m, n.Started);
          let w = u(m);
          if (w) {
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            p = (0, t._)`${p}${P} ${m} = ${w};${this.opts._n}`;
          } else if (w = b == null ? void 0 : b(m))
            p = (0, t._)`${p}${w}${this.opts._n}`;
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
  const t = qr, r = Os;
  var n = qr;
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
  class c extends a {
    constructor(l, f, N) {
      super(), this.varKind = l, this.name = f, this.rhs = N;
    }
    render({ es5: l, _n: f }) {
      const N = l ? r.varKinds.var : this.varKind, C = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${N} ${this.name}${C};` + f;
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
    constructor(l, f, N) {
      super(), this.lhs = l, this.rhs = f, this.sideEffects = N;
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
      return W(l, this.rhs);
    }
  }
  class i extends o {
    constructor(l, f, N, C) {
      super(l, N, C), this.op = f;
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
  class b extends a {
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
      return this.nodes.reduce((f, N) => f + N.render(l), "");
    }
    optimizeNodes() {
      const { nodes: l } = this;
      let f = l.length;
      for (; f--; ) {
        const N = l[f].optimizeNodes();
        Array.isArray(N) ? l.splice(f, 1, ...N) : N ? l[f] = N : l.splice(f, 1);
      }
      return l.length > 0 ? this : void 0;
    }
    optimizeNames(l, f) {
      const { nodes: N } = this;
      let C = N.length;
      for (; C--; ) {
        const M = N[C];
        M.optimizeNames(l, f) || (L(l, M.names), N.splice(C, 1));
      }
      return N.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((l, f) => X(l, f.names), {});
    }
  }
  class $ extends p {
    render(l) {
      return "{" + l._n + super.render(l) + "}" + l._n;
    }
  }
  class g extends p {
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
        const N = f.optimizeNodes();
        f = this.else = Array.isArray(N) ? new v(N) : N;
      }
      if (f)
        return l === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(H(l), f instanceof m ? [f] : f.nodes);
      if (!(l === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(l, f) {
      var N;
      if (this.else = (N = this.else) === null || N === void 0 ? void 0 : N.optimizeNames(l, f), !!(super.optimizeNames(l, f) || this.else))
        return this.condition = A(this.condition, l, f), this;
    }
    get names() {
      const l = super.names;
      return W(l, this.condition), this.else && X(l, this.else.names), l;
    }
  }
  m.kind = "if";
  class w extends $ {
  }
  w.kind = "for";
  class P extends w {
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
      return X(super.names, this.iteration.names);
    }
  }
  class j extends w {
    constructor(l, f, N, C) {
      super(), this.varKind = l, this.name = f, this.from = N, this.to = C;
    }
    render(l) {
      const f = l.es5 ? r.varKinds.var : this.varKind, { name: N, from: C, to: M } = this;
      return `for(${f} ${N}=${C}; ${N}<${M}; ${N}++)` + super.render(l);
    }
    get names() {
      const l = W(super.names, this.from);
      return W(l, this.to);
    }
  }
  class k extends w {
    constructor(l, f, N, C) {
      super(), this.loop = l, this.varKind = f, this.name = N, this.iterable = C;
    }
    render(l) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(l);
    }
    optimizeNames(l, f) {
      if (super.optimizeNames(l, f))
        return this.iterable = A(this.iterable, l, f), this;
    }
    get names() {
      return X(super.names, this.iterable.names);
    }
  }
  class V extends $ {
    constructor(l, f, N) {
      super(), this.name = l, this.args = f, this.async = N;
    }
    render(l) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(l);
    }
  }
  V.kind = "func";
  class q extends p {
    render(l) {
      return "return " + super.render(l);
    }
  }
  q.kind = "return";
  class x extends $ {
    render(l) {
      let f = "try" + super.render(l);
      return this.catch && (f += this.catch.render(l)), this.finally && (f += this.finally.render(l)), f;
    }
    optimizeNodes() {
      var l, f;
      return super.optimizeNodes(), (l = this.catch) === null || l === void 0 || l.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(l, f) {
      var N, C;
      return super.optimizeNames(l, f), (N = this.catch) === null || N === void 0 || N.optimizeNames(l, f), (C = this.finally) === null || C === void 0 || C.optimizeNames(l, f), this;
    }
    get names() {
      const l = super.names;
      return this.catch && X(l, this.catch.names), this.finally && X(l, this.finally.names), l;
    }
  }
  class re extends $ {
    constructor(l) {
      super(), this.error = l;
    }
    render(l) {
      return `catch(${this.error})` + super.render(l);
    }
  }
  re.kind = "catch";
  class ce extends $ {
    render(l) {
      return "finally" + super.render(l);
    }
  }
  ce.kind = "finally";
  class z {
    constructor(l, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = l, this._scope = new r.Scope({ parent: l }), this._nodes = [new g()];
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
      const N = this._extScope.value(l, f);
      return (this._values[N.prefix] || (this._values[N.prefix] = /* @__PURE__ */ new Set())).add(N), N;
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
    _def(l, f, N, C) {
      const M = this._scope.toName(f);
      return N !== void 0 && C && (this._constants[M.str] = N), this._leafNode(new c(l, M, N)), M;
    }
    // `const` declaration (`var` in es5 mode)
    const(l, f, N) {
      return this._def(r.varKinds.const, l, f, N);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(l, f, N) {
      return this._def(r.varKinds.let, l, f, N);
    }
    // `var` declaration with optional assignment
    var(l, f, N) {
      return this._def(r.varKinds.var, l, f, N);
    }
    // assignment code
    assign(l, f, N) {
      return this._leafNode(new o(l, f, N));
    }
    // `+=` code
    add(l, f) {
      return this._leafNode(new i(l, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(l) {
      return typeof l == "function" ? l() : l !== t.nil && this._leafNode(new b(l)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...l) {
      const f = ["{"];
      for (const [N, C] of l)
        f.length > 1 && f.push(","), f.push(N), (N !== C || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, C));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(l, f, N) {
      if (this._blockNode(new m(l)), f && N)
        this.code(f).else().code(N).endIf();
      else if (f)
        this.code(f).endIf();
      else if (N)
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
      return this._for(new P(l), f);
    }
    // `for` statement for a range of values
    forRange(l, f, N, C, M = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const Y = this._scope.toName(l);
      return this._for(new j(M, Y, f, N), () => C(Y));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(l, f, N, C = r.varKinds.const) {
      const M = this._scope.toName(l);
      if (this.opts.es5) {
        const Y = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${Y}.length`, (B) => {
          this.var(M, (0, t._)`${Y}[${B}]`), N(M);
        });
      }
      return this._for(new k("of", C, M, f), () => N(M));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(l, f, N, C = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(l, (0, t._)`Object.keys(${f})`, N);
      const M = this._scope.toName(l);
      return this._for(new k("in", C, M, f), () => N(M));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
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
      const f = new q();
      if (this._blockNode(f), this.code(l), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(q);
    }
    // `try` statement
    try(l, f, N) {
      if (!f && !N)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const C = new x();
      if (this._blockNode(C), this.code(l), f) {
        const M = this.name("e");
        this._currNode = C.catch = new re(M), f(M);
      }
      return N && (this._currNode = C.finally = new ce(), this.code(N)), this._endBlockNode(re, ce);
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
      const N = this._nodes.length - f;
      if (N < 0 || l !== void 0 && N !== l)
        throw new Error(`CodeGen: wrong number of nodes: ${N} vs ${l} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(l, f = t.nil, N, C) {
      return this._blockNode(new V(l, f, N)), C && this.code(C).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(V);
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
      const N = this._currNode;
      if (N instanceof l || f && N instanceof f)
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
  e.CodeGen = z;
  function X(E, l) {
    for (const f in l)
      E[f] = (E[f] || 0) + (l[f] || 0);
    return E;
  }
  function W(E, l) {
    return l instanceof t._CodeOrName ? X(E, l.names) : E;
  }
  function A(E, l, f) {
    if (E instanceof t.Name)
      return N(E);
    if (!C(E))
      return E;
    return new t._Code(E._items.reduce((M, Y) => (Y instanceof t.Name && (Y = N(Y)), Y instanceof t._Code ? M.push(...Y._items) : M.push(Y), M), []));
    function N(M) {
      const Y = f[M.str];
      return Y === void 0 || l[M.str] !== 1 ? M : (delete l[M.str], Y);
    }
    function C(M) {
      return M instanceof t._Code && M._items.some((Y) => Y instanceof t.Name && l[Y.str] === 1 && f[Y.str] !== void 0);
    }
  }
  function L(E, l) {
    for (const f in l)
      E[f] = (E[f] || 0) - (l[f] || 0);
  }
  function H(E) {
    return typeof E == "boolean" || typeof E == "number" || E === null ? !E : (0, t._)`!${R(E)}`;
  }
  e.not = H;
  const U = _(e.operators.AND);
  function Q(...E) {
    return E.reduce(U);
  }
  e.and = Q;
  const G = _(e.operators.OR);
  function I(...E) {
    return E.reduce(G);
  }
  e.or = I;
  function _(E) {
    return (l, f) => l === t.nil ? f : f === t.nil ? l : (0, t._)`${R(l)} ${E} ${R(f)}`;
  }
  function R(E) {
    return E instanceof t.Name ? E : (0, t._)`(${E})`;
  }
})(te);
var K = {};
Object.defineProperty(K, "__esModule", { value: !0 });
K.checkStrictMode = K.getErrorPath = K.Type = K.useFunc = K.setEvaluated = K.evaluatedPropsToName = K.mergeEvaluated = K.eachItem = K.unescapeJsonPointer = K.escapeJsonPointer = K.escapeFragment = K.unescapeFragment = K.schemaRefOrVal = K.schemaHasRulesButRef = K.schemaHasRules = K.checkUnknownRules = K.alwaysValidSchema = K.toHash = void 0;
const pe = te, Pu = qr;
function Nu(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
K.toHash = Nu;
function Ru(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Oc(e, t), !Ic(t, e.self.RULES.all));
}
K.alwaysValidSchema = Ru;
function Oc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || kc(e, `unknown keyword: "${a}"`);
}
K.checkUnknownRules = Oc;
function Ic(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
K.schemaHasRules = Ic;
function Ou(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
K.schemaHasRulesButRef = Ou;
function Iu({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, pe._)`${r}`;
  }
  return (0, pe._)`${e}${t}${(0, pe.getProperty)(n)}`;
}
K.schemaRefOrVal = Iu;
function ju(e) {
  return jc(decodeURIComponent(e));
}
K.unescapeFragment = ju;
function Tu(e) {
  return encodeURIComponent(Ys(e));
}
K.escapeFragment = Tu;
function Ys(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
K.escapeJsonPointer = Ys;
function jc(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
K.unescapeJsonPointer = jc;
function ku(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
K.eachItem = ku;
function Wo({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, c, o) => {
    const i = c === void 0 ? a : c instanceof pe.Name ? (a instanceof pe.Name ? e(s, a, c) : t(s, a, c), c) : a instanceof pe.Name ? (t(s, c, a), a) : r(a, c);
    return o === pe.Name && !(i instanceof pe.Name) ? n(s, i) : i;
  };
}
K.mergeEvaluated = {
  props: Wo({
    mergeNames: (e, t, r) => e.if((0, pe._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, pe._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, pe._)`${r} || {}`).code((0, pe._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, pe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, pe._)`${r} || {}`), Qs(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Tc
  }),
  items: Wo({
    mergeNames: (e, t, r) => e.if((0, pe._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, pe._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, pe._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, pe._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Tc(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, pe._)`{}`);
  return t !== void 0 && Qs(e, r, t), r;
}
K.evaluatedPropsToName = Tc;
function Qs(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, pe._)`${t}${(0, pe.getProperty)(n)}`, !0));
}
K.setEvaluated = Qs;
const Xo = {};
function Au(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Xo[t.code] || (Xo[t.code] = new Pu._Code(t.code))
  });
}
K.useFunc = Au;
var Is;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Is || (K.Type = Is = {}));
function Cu(e, t, r) {
  if (e instanceof pe.Name) {
    const n = t === Is.Num;
    return r ? n ? (0, pe._)`"[" + ${e} + "]"` : (0, pe._)`"['" + ${e} + "']"` : n ? (0, pe._)`"/" + ${e}` : (0, pe._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, pe.getProperty)(e).toString() : "/" + Ys(e);
}
K.getErrorPath = Cu;
function kc(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
K.checkStrictMode = kc;
var Wr = {}, Yo;
function nt() {
  if (Yo) return Wr;
  Yo = 1, Object.defineProperty(Wr, "__esModule", { value: !0 });
  const e = te, t = {
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
  return Wr.default = t, Wr;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = te, r = K, n = nt();
  e.keywordError = {
    message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: v, schemaType: m }) => m ? (0, t.str)`"${v}" keyword must be ${m} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
  };
  function s(v, m = e.keywordError, w, P) {
    const { it: j } = v, { gen: k, compositeRule: V, allErrors: q } = j, x = h(v, m, w);
    P ?? (V || q) ? i(k, x) : d(j, (0, t._)`[${x}]`);
  }
  e.reportError = s;
  function a(v, m = e.keywordError, w) {
    const { it: P } = v, { gen: j, compositeRule: k, allErrors: V } = P, q = h(v, m, w);
    i(j, q), k || V || d(P, n.default.vErrors);
  }
  e.reportExtraError = a;
  function c(v, m) {
    v.assign(n.default.errors, m), v.if((0, t._)`${n.default.vErrors} !== null`, () => v.if(m, () => v.assign((0, t._)`${n.default.vErrors}.length`, m), () => v.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = c;
  function o({ gen: v, keyword: m, schemaValue: w, data: P, errsCount: j, it: k }) {
    if (j === void 0)
      throw new Error("ajv implementation error");
    const V = v.name("err");
    v.forRange("i", j, n.default.errors, (q) => {
      v.const(V, (0, t._)`${n.default.vErrors}[${q}]`), v.if((0, t._)`${V}.instancePath === undefined`, () => v.assign((0, t._)`${V}.instancePath`, (0, t.strConcat)(n.default.instancePath, k.errorPath))), v.assign((0, t._)`${V}.schemaPath`, (0, t.str)`${k.errSchemaPath}/${m}`), k.opts.verbose && (v.assign((0, t._)`${V}.schema`, w), v.assign((0, t._)`${V}.data`, P));
    });
  }
  e.extendErrors = o;
  function i(v, m) {
    const w = v.const("err", m);
    v.if((0, t._)`${n.default.vErrors} === null`, () => v.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), v.code((0, t._)`${n.default.errors}++`);
  }
  function d(v, m) {
    const { gen: w, validateName: P, schemaEnv: j } = v;
    j.$async ? w.throw((0, t._)`new ${v.ValidationError}(${m})`) : (w.assign((0, t._)`${P}.errors`, m), w.return(!1));
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
  function h(v, m, w) {
    const { createErrors: P } = v.it;
    return P === !1 ? (0, t._)`{}` : b(v, m, w);
  }
  function b(v, m, w = {}) {
    const { gen: P, it: j } = v, k = [
      p(j, w),
      $(v, w)
    ];
    return g(v, m, k), P.object(...k);
  }
  function p({ errorPath: v }, { instancePath: m }) {
    const w = m ? (0, t.str)`${v}${(0, r.getErrorPath)(m, r.Type.Str)}` : v;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
  }
  function $({ keyword: v, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: P }) {
    let j = P ? m : (0, t.str)`${m}/${v}`;
    return w && (j = (0, t.str)`${j}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, j];
  }
  function g(v, { params: m, message: w }, P) {
    const { keyword: j, data: k, schemaValue: V, it: q } = v, { opts: x, propertyName: re, topSchemaRef: ce, schemaPath: z } = q;
    P.push([u.keyword, j], [u.params, typeof m == "function" ? m(v) : m || (0, t._)`{}`]), x.messages && P.push([u.message, typeof w == "function" ? w(v) : w]), x.verbose && P.push([u.schema, V], [u.parentSchema, (0, t._)`${ce}${z}`], [n.default.data, k]), re && P.push([u.propertyName, re]);
  }
})(Kr);
var Qo;
function Du() {
  if (Qo) return Lt;
  Qo = 1, Object.defineProperty(Lt, "__esModule", { value: !0 }), Lt.boolOrEmptySchema = Lt.topBoolOrEmptySchema = void 0;
  const e = Kr, t = te, r = nt(), n = {
    message: "boolean schema is false"
  };
  function s(o) {
    const { gen: i, schema: d, validateName: u } = o;
    d === !1 ? c(o, !1) : typeof d == "object" && d.$async === !0 ? i.return(r.default.data) : (i.assign((0, t._)`${u}.errors`, null), i.return(!0));
  }
  Lt.topBoolOrEmptySchema = s;
  function a(o, i) {
    const { gen: d, schema: u } = o;
    u === !1 ? (d.var(i, !1), c(o)) : d.var(i, !0);
  }
  Lt.boolOrEmptySchema = a;
  function c(o, i) {
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
    (0, e.reportError)(h, n, void 0, i);
  }
  return Lt;
}
var Se = {}, Wt = {};
Object.defineProperty(Wt, "__esModule", { value: !0 });
Wt.getRules = Wt.isJSONType = void 0;
const Mu = ["string", "number", "integer", "boolean", "null", "object", "array"], Lu = new Set(Mu);
function Vu(e) {
  return typeof e == "string" && Lu.has(e);
}
Wt.isJSONType = Vu;
function Fu() {
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
Wt.getRules = Fu;
var ft = {}, Zo;
function Ac() {
  if (Zo) return ft;
  Zo = 1, Object.defineProperty(ft, "__esModule", { value: !0 }), ft.shouldUseRule = ft.shouldUseGroup = ft.schemaHasRulesForType = void 0;
  function e({ schema: n, self: s }, a) {
    const c = s.RULES.types[a];
    return c && c !== !0 && t(n, c);
  }
  ft.schemaHasRulesForType = e;
  function t(n, s) {
    return s.rules.some((a) => r(n, a));
  }
  ft.shouldUseGroup = t;
  function r(n, s) {
    var a;
    return n[s.keyword] !== void 0 || ((a = s.definition.implements) === null || a === void 0 ? void 0 : a.some((c) => n[c] !== void 0));
  }
  return ft.shouldUseRule = r, ft;
}
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.reportTypeError = Se.checkDataTypes = Se.checkDataType = Se.coerceAndCheckDataType = Se.getJSONTypes = Se.getSchemaTypes = Se.DataType = void 0;
const zu = Wt, qu = Ac(), Uu = Kr, ne = te, Cc = K;
var ar;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(ar || (Se.DataType = ar = {}));
function Ku(e) {
  const t = Dc(e.type);
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
Se.getSchemaTypes = Ku;
function Dc(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(zu.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Se.getJSONTypes = Dc;
function Gu(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Hu(t, s.coerceTypes), c = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, qu.schemaHasRulesForType)(e, t[0]));
  if (c) {
    const o = Zs(t, n, s.strictNumbers, ar.Wrong);
    r.if(o, () => {
      a.length ? Bu(e, t, a) : xs(e);
    });
  }
  return c;
}
Se.coerceAndCheckDataType = Gu;
const Mc = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Hu(e, t) {
  return t ? e.filter((r) => Mc.has(r) || t === "array" && r === "array") : [];
}
function Bu(e, t, r) {
  const { gen: n, data: s, opts: a } = e, c = n.let("dataType", (0, ne._)`typeof ${s}`), o = n.let("coerced", (0, ne._)`undefined`);
  a.coerceTypes === "array" && n.if((0, ne._)`${c} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, ne._)`${s}[0]`).assign(c, (0, ne._)`typeof ${s}`).if(Zs(t, s, a.strictNumbers), () => n.assign(o, s))), n.if((0, ne._)`${o} !== undefined`);
  for (const d of r)
    (Mc.has(d) || d === "array" && a.coerceTypes === "array") && i(d);
  n.else(), xs(e), n.endIf(), n.if((0, ne._)`${o} !== undefined`, () => {
    n.assign(s, o), Ju(e, o);
  });
  function i(d) {
    switch (d) {
      case "string":
        n.elseIf((0, ne._)`${c} == "number" || ${c} == "boolean"`).assign(o, (0, ne._)`"" + ${s}`).elseIf((0, ne._)`${s} === null`).assign(o, (0, ne._)`""`);
        return;
      case "number":
        n.elseIf((0, ne._)`${c} == "boolean" || ${s} === null
              || (${c} == "string" && ${s} && ${s} == +${s})`).assign(o, (0, ne._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, ne._)`${c} === "boolean" || ${s} === null
              || (${c} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(o, (0, ne._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, ne._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(o, !1).elseIf((0, ne._)`${s} === "true" || ${s} === 1`).assign(o, !0);
        return;
      case "null":
        n.elseIf((0, ne._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(o, null);
        return;
      case "array":
        n.elseIf((0, ne._)`${c} === "string" || ${c} === "number"
              || ${c} === "boolean" || ${s} === null`).assign(o, (0, ne._)`[${s}]`);
    }
  }
}
function Ju({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, ne._)`${t} !== undefined`, () => e.assign((0, ne._)`${t}[${r}]`, n));
}
function js(e, t, r, n = ar.Correct) {
  const s = n === ar.Correct ? ne.operators.EQ : ne.operators.NEQ;
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
      a = c((0, ne._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = c();
      break;
    default:
      return (0, ne._)`typeof ${t} ${s} ${e}`;
  }
  return n === ar.Correct ? a : (0, ne.not)(a);
  function c(o = ne.nil) {
    return (0, ne.and)((0, ne._)`typeof ${t} == "number"`, o, r ? (0, ne._)`isFinite(${t})` : ne.nil);
  }
}
Se.checkDataType = js;
function Zs(e, t, r, n) {
  if (e.length === 1)
    return js(e[0], t, r, n);
  let s;
  const a = (0, Cc.toHash)(e);
  if (a.array && a.object) {
    const c = (0, ne._)`typeof ${t} != "object"`;
    s = a.null ? c : (0, ne._)`!${t} || ${c}`, delete a.null, delete a.array, delete a.object;
  } else
    s = ne.nil;
  a.number && delete a.integer;
  for (const c in a)
    s = (0, ne.and)(s, js(c, t, r, n));
  return s;
}
Se.checkDataTypes = Zs;
const Wu = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, ne._)`{type: ${e}}` : (0, ne._)`{type: ${t}}`
};
function xs(e) {
  const t = Xu(e);
  (0, Uu.reportError)(t, Wu);
}
Se.reportTypeError = xs;
function Xu(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Cc.schemaRefOrVal)(e, n, "type");
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
var Pr = {}, xo;
function Yu() {
  if (xo) return Pr;
  xo = 1, Object.defineProperty(Pr, "__esModule", { value: !0 }), Pr.assignDefaults = void 0;
  const e = te, t = K;
  function r(s, a) {
    const { properties: c, items: o } = s.schema;
    if (a === "object" && c)
      for (const i in c)
        n(s, i, c[i].default);
    else a === "array" && Array.isArray(o) && o.forEach((i, d) => n(s, d, i.default));
  }
  Pr.assignDefaults = r;
  function n(s, a, c) {
    const { gen: o, compositeRule: i, data: d, opts: u } = s;
    if (c === void 0)
      return;
    const h = (0, e._)`${d}${(0, e.getProperty)(a)}`;
    if (i) {
      (0, t.checkStrictMode)(s, `default is ignored for: ${h}`);
      return;
    }
    let b = (0, e._)`${h} === undefined`;
    u.useDefaults === "empty" && (b = (0, e._)`${b} || ${h} === null || ${h} === ""`), o.if(b, (0, e._)`${h} = ${(0, e.stringify)(c)}`);
  }
  return Pr;
}
var Je = {}, he = {}, ei;
function st() {
  if (ei) return he;
  ei = 1, Object.defineProperty(he, "__esModule", { value: !0 }), he.validateUnion = he.validateArray = he.usePattern = he.callValidateCode = he.schemaProperties = he.allSchemaProperties = he.noPropertyInData = he.propertyInData = he.isOwnProperty = he.hasPropFunc = he.reportMissingProp = he.checkMissingProp = he.checkReportMissingProp = void 0;
  const e = te, t = K, r = nt(), n = K;
  function s(w, P) {
    const { gen: j, data: k, it: V } = w;
    j.if(u(j, k, P, V.opts.ownProperties), () => {
      w.setParams({ missingProperty: (0, e._)`${P}` }, !0), w.error();
    });
  }
  he.checkReportMissingProp = s;
  function a({ gen: w, data: P, it: { opts: j } }, k, V) {
    return (0, e.or)(...k.map((q) => (0, e.and)(u(w, P, q, j.ownProperties), (0, e._)`${V} = ${q}`)));
  }
  he.checkMissingProp = a;
  function c(w, P) {
    w.setParams({ missingProperty: P }, !0), w.error();
  }
  he.reportMissingProp = c;
  function o(w) {
    return w.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  he.hasPropFunc = o;
  function i(w, P, j) {
    return (0, e._)`${o(w)}.call(${P}, ${j})`;
  }
  he.isOwnProperty = i;
  function d(w, P, j, k) {
    const V = (0, e._)`${P}${(0, e.getProperty)(j)} !== undefined`;
    return k ? (0, e._)`${V} && ${i(w, P, j)}` : V;
  }
  he.propertyInData = d;
  function u(w, P, j, k) {
    const V = (0, e._)`${P}${(0, e.getProperty)(j)} === undefined`;
    return k ? (0, e.or)(V, (0, e.not)(i(w, P, j))) : V;
  }
  he.noPropertyInData = u;
  function h(w) {
    return w ? Object.keys(w).filter((P) => P !== "__proto__") : [];
  }
  he.allSchemaProperties = h;
  function b(w, P) {
    return h(P).filter((j) => !(0, t.alwaysValidSchema)(w, P[j]));
  }
  he.schemaProperties = b;
  function p({ schemaCode: w, data: P, it: { gen: j, topSchemaRef: k, schemaPath: V, errorPath: q }, it: x }, re, ce, z) {
    const X = z ? (0, e._)`${w}, ${P}, ${k}${V}` : P, W = [
      [r.default.instancePath, (0, e.strConcat)(r.default.instancePath, q)],
      [r.default.parentData, x.parentData],
      [r.default.parentDataProperty, x.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    x.opts.dynamicRef && W.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const A = (0, e._)`${X}, ${j.object(...W)}`;
    return ce !== e.nil ? (0, e._)`${re}.call(${ce}, ${A})` : (0, e._)`${re}(${A})`;
  }
  he.callValidateCode = p;
  const $ = (0, e._)`new RegExp`;
  function g({ gen: w, it: { opts: P } }, j) {
    const k = P.unicodeRegExp ? "u" : "", { regExp: V } = P.code, q = V(j, k);
    return w.scopeValue("pattern", {
      key: q.toString(),
      ref: q,
      code: (0, e._)`${V.code === "new RegExp" ? $ : (0, n.useFunc)(w, V)}(${j}, ${k})`
    });
  }
  he.usePattern = g;
  function v(w) {
    const { gen: P, data: j, keyword: k, it: V } = w, q = P.name("valid");
    if (V.allErrors) {
      const re = P.let("valid", !0);
      return x(() => P.assign(re, !1)), re;
    }
    return P.var(q, !0), x(() => P.break()), q;
    function x(re) {
      const ce = P.const("len", (0, e._)`${j}.length`);
      P.forRange("i", 0, ce, (z) => {
        w.subschema({
          keyword: k,
          dataProp: z,
          dataPropType: t.Type.Num
        }, q), P.if((0, e.not)(q), re);
      });
    }
  }
  he.validateArray = v;
  function m(w) {
    const { gen: P, schema: j, keyword: k, it: V } = w;
    if (!Array.isArray(j))
      throw new Error("ajv implementation error");
    if (j.some((ce) => (0, t.alwaysValidSchema)(V, ce)) && !V.opts.unevaluated)
      return;
    const x = P.let("valid", !1), re = P.name("_valid");
    P.block(() => j.forEach((ce, z) => {
      const X = w.subschema({
        keyword: k,
        schemaProp: z,
        compositeRule: !0
      }, re);
      P.assign(x, (0, e._)`${x} || ${re}`), w.mergeValidEvaluated(X, re) || P.if((0, e.not)(x));
    })), w.result(x, () => w.reset(), () => w.error(!0));
  }
  return he.validateUnion = m, he;
}
var ti;
function Qu() {
  if (ti) return Je;
  ti = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.validateKeywordUsage = Je.validSchemaType = Je.funcKeywordCode = Je.macroKeywordCode = void 0;
  const e = te, t = nt(), r = st(), n = Kr;
  function s(b, p) {
    const { gen: $, keyword: g, schema: v, parentSchema: m, it: w } = b, P = p.macro.call(w.self, v, m, w), j = d($, g, P);
    w.opts.validateSchema !== !1 && w.self.validateSchema(P, !0);
    const k = $.name("valid");
    b.subschema({
      schema: P,
      schemaPath: e.nil,
      errSchemaPath: `${w.errSchemaPath}/${g}`,
      topSchemaRef: j,
      compositeRule: !0
    }, k), b.pass(k, () => b.error(!0));
  }
  Je.macroKeywordCode = s;
  function a(b, p) {
    var $;
    const { gen: g, keyword: v, schema: m, parentSchema: w, $data: P, it: j } = b;
    i(j, p);
    const k = !P && p.compile ? p.compile.call(j.self, m, w, j) : p.validate, V = d(g, v, k), q = g.let("valid");
    b.block$data(q, x), b.ok(($ = p.valid) !== null && $ !== void 0 ? $ : q);
    function x() {
      if (p.errors === !1)
        z(), p.modifying && c(b), X(() => b.error());
      else {
        const W = p.async ? re() : ce();
        p.modifying && c(b), X(() => o(b, W));
      }
    }
    function re() {
      const W = g.let("ruleErrs", null);
      return g.try(() => z((0, e._)`await `), (A) => g.assign(q, !1).if((0, e._)`${A} instanceof ${j.ValidationError}`, () => g.assign(W, (0, e._)`${A}.errors`), () => g.throw(A))), W;
    }
    function ce() {
      const W = (0, e._)`${V}.errors`;
      return g.assign(W, null), z(e.nil), W;
    }
    function z(W = p.async ? (0, e._)`await ` : e.nil) {
      const A = j.opts.passContext ? t.default.this : t.default.self, L = !("compile" in p && !P || p.schema === !1);
      g.assign(q, (0, e._)`${W}${(0, r.callValidateCode)(b, V, A, L)}`, p.modifying);
    }
    function X(W) {
      var A;
      g.if((0, e.not)((A = p.valid) !== null && A !== void 0 ? A : q), W);
    }
  }
  Je.funcKeywordCode = a;
  function c(b) {
    const { gen: p, data: $, it: g } = b;
    p.if(g.parentData, () => p.assign($, (0, e._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function o(b, p) {
    const { gen: $ } = b;
    $.if((0, e._)`Array.isArray(${p})`, () => {
      $.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${p} : ${t.default.vErrors}.concat(${p})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(b);
    }, () => b.error());
  }
  function i({ schemaEnv: b }, p) {
    if (p.async && !b.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(b, p, $) {
    if ($ === void 0)
      throw new Error(`keyword "${p}" failed to compile`);
    return b.scopeValue("keyword", typeof $ == "function" ? { ref: $ } : { ref: $, code: (0, e.stringify)($) });
  }
  function u(b, p, $ = !1) {
    return !p.length || p.some((g) => g === "array" ? Array.isArray(b) : g === "object" ? b && typeof b == "object" && !Array.isArray(b) : typeof b == g || $ && typeof b > "u");
  }
  Je.validSchemaType = u;
  function h({ schema: b, opts: p, self: $, errSchemaPath: g }, v, m) {
    if (Array.isArray(v.keyword) ? !v.keyword.includes(m) : v.keyword !== m)
      throw new Error("ajv implementation error");
    const w = v.dependencies;
    if (w != null && w.some((P) => !Object.prototype.hasOwnProperty.call(b, P)))
      throw new Error(`parent schema must have dependencies of ${m}: ${w.join(",")}`);
    if (v.validateSchema && !v.validateSchema(b[m])) {
      const j = `keyword "${m}" value is invalid at path "${g}": ` + $.errorsText(v.validateSchema.errors);
      if (p.validateSchema === "log")
        $.logger.error(j);
      else
        throw new Error(j);
    }
  }
  return Je.validateKeywordUsage = h, Je;
}
var ht = {}, ri;
function Zu() {
  if (ri) return ht;
  ri = 1, Object.defineProperty(ht, "__esModule", { value: !0 }), ht.extendSubschemaMode = ht.extendSubschemaData = ht.getSubschema = void 0;
  const e = te, t = K;
  function r(a, { keyword: c, schemaProp: o, schema: i, schemaPath: d, errSchemaPath: u, topSchemaRef: h }) {
    if (c !== void 0 && i !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (c !== void 0) {
      const b = a.schema[c];
      return o === void 0 ? {
        schema: b,
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${a.errSchemaPath}/${c}`
      } : {
        schema: b[o],
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(c)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${c}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (i !== void 0) {
      if (d === void 0 || u === void 0 || h === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: i,
        schemaPath: d,
        topSchemaRef: h,
        errSchemaPath: u
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  ht.getSubschema = r;
  function n(a, c, { dataProp: o, dataPropType: i, data: d, dataTypes: u, propertyName: h }) {
    if (d !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: b } = c;
    if (o !== void 0) {
      const { errorPath: $, dataPathArr: g, opts: v } = c, m = b.let("data", (0, e._)`${c.data}${(0, e.getProperty)(o)}`, !0);
      p(m), a.errorPath = (0, e.str)`${$}${(0, t.getErrorPath)(o, i, v.jsPropertySyntax)}`, a.parentDataProperty = (0, e._)`${o}`, a.dataPathArr = [...g, a.parentDataProperty];
    }
    if (d !== void 0) {
      const $ = d instanceof e.Name ? d : b.let("data", d, !0);
      p($), h !== void 0 && (a.propertyName = h);
    }
    u && (a.dataTypes = u);
    function p($) {
      a.data = $, a.dataLevel = c.dataLevel + 1, a.dataTypes = [], c.definedProperties = /* @__PURE__ */ new Set(), a.parentData = c.data, a.dataNames = [...c.dataNames, $];
    }
  }
  ht.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: c, jtdMetadata: o, compositeRule: i, createErrors: d, allErrors: u }) {
    i !== void 0 && (a.compositeRule = i), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = c, a.jtdMetadata = o;
  }
  return ht.extendSubschemaMode = s, ht;
}
var Ie = {}, Un = function e(t, r) {
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
      var c = a[s];
      if (!e(t[c], r[c])) return !1;
    }
    return !0;
  }
  return t !== t && r !== r;
}, Lc = { exports: {} }, Tt = Lc.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  $n(t, n, s, e, "", e);
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
function $n(e, t, r, n, s, a, c, o, i, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, c, o, i, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in Tt.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            $n(e, t, r, h[b], s + "/" + u + "/" + b, a, s, u, n, b);
      } else if (u in Tt.propsKeywords) {
        if (h && typeof h == "object")
          for (var p in h)
            $n(e, t, r, h[p], s + "/" + u + "/" + xu(p), a, s, u, n, p);
      } else (u in Tt.keywords || e.allKeys && !(u in Tt.skipKeywords)) && $n(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, c, o, i, d);
  }
}
function xu(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var ed = Lc.exports;
Object.defineProperty(Ie, "__esModule", { value: !0 });
Ie.getSchemaRefs = Ie.resolveUrl = Ie.normalizeId = Ie._getFullPath = Ie.getFullPath = Ie.inlineRef = void 0;
const td = K, rd = Un, nd = ed, sd = /* @__PURE__ */ new Set([
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
function ad(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Ts(e) : t ? Vc(e) <= t : !1;
}
Ie.inlineRef = ad;
const od = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Ts(e) {
  for (const t in e) {
    if (od.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Ts) || typeof r == "object" && Ts(r))
      return !0;
  }
  return !1;
}
function Vc(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !sd.has(r) && (typeof e[r] == "object" && (0, td.eachItem)(e[r], (n) => t += Vc(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Fc(e, t = "", r) {
  r !== !1 && (t = or(t));
  const n = e.parse(t);
  return zc(e, n);
}
Ie.getFullPath = Fc;
function zc(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Ie._getFullPath = zc;
const id = /#\/?$/;
function or(e) {
  return e ? e.replace(id, "") : "";
}
Ie.normalizeId = or;
function cd(e, t, r) {
  return r = or(r), e.resolve(t, r);
}
Ie.resolveUrl = cd;
const ld = /^[a-z_][-a-z0-9._]*$/i;
function ud(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = or(e[r] || t), a = { "": s }, c = Fc(n, s, !1), o = {}, i = /* @__PURE__ */ new Set();
  return nd(e, { allKeys: !0 }, (h, b, p, $) => {
    if ($ === void 0)
      return;
    const g = c + b;
    let v = a[$];
    typeof h[r] == "string" && (v = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[b] = v;
    function m(P) {
      const j = this.opts.uriResolver.resolve;
      if (P = or(v ? j(v, P) : P), i.has(P))
        throw u(P);
      i.add(P);
      let k = this.refs[P];
      return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? d(h, k.schema, P) : P !== or(g) && (P[0] === "#" ? (d(h, o[P], P), o[P] = h) : this.refs[P] = g), P;
    }
    function w(P) {
      if (typeof P == "string") {
        if (!ld.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), o;
  function d(h, b, p) {
    if (b !== void 0 && !rd(h, b))
      throw u(p);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Ie.getSchemaRefs = ud;
var ni;
function Kn() {
  if (ni) return dt;
  ni = 1, Object.defineProperty(dt, "__esModule", { value: !0 }), dt.getData = dt.KeywordCxt = dt.validateFunctionCode = void 0;
  const e = Du(), t = Se, r = Ac(), n = Se, s = Yu(), a = Qu(), c = Zu(), o = te, i = nt(), d = Ie, u = K, h = Kr;
  function b(y) {
    if (k(y) && (q(y), j(y))) {
      v(y);
      return;
    }
    p(y, () => (0, e.topBoolOrEmptySchema)(y));
  }
  dt.validateFunctionCode = b;
  function p({ gen: y, validateName: S, schema: O, schemaEnv: T, opts: D }, F) {
    D.code.es5 ? y.func(S, (0, o._)`${i.default.data}, ${i.default.valCxt}`, T.$async, () => {
      y.code((0, o._)`"use strict"; ${w(O, D)}`), g(y, D), y.code(F);
    }) : y.func(S, (0, o._)`${i.default.data}, ${$(D)}`, T.$async, () => y.code(w(O, D)).code(F));
  }
  function $(y) {
    return (0, o._)`{${i.default.instancePath}="", ${i.default.parentData}, ${i.default.parentDataProperty}, ${i.default.rootData}=${i.default.data}${y.dynamicRef ? (0, o._)`, ${i.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function g(y, S) {
    y.if(i.default.valCxt, () => {
      y.var(i.default.instancePath, (0, o._)`${i.default.valCxt}.${i.default.instancePath}`), y.var(i.default.parentData, (0, o._)`${i.default.valCxt}.${i.default.parentData}`), y.var(i.default.parentDataProperty, (0, o._)`${i.default.valCxt}.${i.default.parentDataProperty}`), y.var(i.default.rootData, (0, o._)`${i.default.valCxt}.${i.default.rootData}`), S.dynamicRef && y.var(i.default.dynamicAnchors, (0, o._)`${i.default.valCxt}.${i.default.dynamicAnchors}`);
    }, () => {
      y.var(i.default.instancePath, (0, o._)`""`), y.var(i.default.parentData, (0, o._)`undefined`), y.var(i.default.parentDataProperty, (0, o._)`undefined`), y.var(i.default.rootData, i.default.data), S.dynamicRef && y.var(i.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function v(y) {
    const { schema: S, opts: O, gen: T } = y;
    p(y, () => {
      O.$comment && S.$comment && W(y), ce(y), T.let(i.default.vErrors, null), T.let(i.default.errors, 0), O.unevaluated && m(y), x(y), A(y);
    });
  }
  function m(y) {
    const { gen: S, validateName: O } = y;
    y.evaluated = S.const("evaluated", (0, o._)`${O}.evaluated`), S.if((0, o._)`${y.evaluated}.dynamicProps`, () => S.assign((0, o._)`${y.evaluated}.props`, (0, o._)`undefined`)), S.if((0, o._)`${y.evaluated}.dynamicItems`, () => S.assign((0, o._)`${y.evaluated}.items`, (0, o._)`undefined`));
  }
  function w(y, S) {
    const O = typeof y == "object" && y[S.schemaId];
    return O && (S.code.source || S.code.process) ? (0, o._)`/*# sourceURL=${O} */` : o.nil;
  }
  function P(y, S) {
    if (k(y) && (q(y), j(y))) {
      V(y, S);
      return;
    }
    (0, e.boolOrEmptySchema)(y, S);
  }
  function j({ schema: y, self: S }) {
    if (typeof y == "boolean")
      return !y;
    for (const O in y)
      if (S.RULES.all[O])
        return !0;
    return !1;
  }
  function k(y) {
    return typeof y.schema != "boolean";
  }
  function V(y, S) {
    const { schema: O, gen: T, opts: D } = y;
    D.$comment && O.$comment && W(y), z(y), X(y);
    const F = T.const("_errs", i.default.errors);
    x(y, F), T.var(S, (0, o._)`${F} === ${i.default.errors}`);
  }
  function q(y) {
    (0, u.checkUnknownRules)(y), re(y);
  }
  function x(y, S) {
    if (y.opts.jtd)
      return H(y, [], !1, S);
    const O = (0, t.getSchemaTypes)(y.schema), T = (0, t.coerceAndCheckDataType)(y, O);
    H(y, O, !T, S);
  }
  function re(y) {
    const { schema: S, errSchemaPath: O, opts: T, self: D } = y;
    S.$ref && T.ignoreKeywordsWithRef && (0, u.schemaHasRulesButRef)(S, D.RULES) && D.logger.warn(`$ref: keywords ignored in schema at path "${O}"`);
  }
  function ce(y) {
    const { schema: S, opts: O } = y;
    S.default !== void 0 && O.useDefaults && O.strictSchema && (0, u.checkStrictMode)(y, "default is ignored in the schema root");
  }
  function z(y) {
    const S = y.schema[y.opts.schemaId];
    S && (y.baseId = (0, d.resolveUrl)(y.opts.uriResolver, y.baseId, S));
  }
  function X(y) {
    if (y.schema.$async && !y.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function W({ gen: y, schemaEnv: S, schema: O, errSchemaPath: T, opts: D }) {
    const F = O.$comment;
    if (D.$comment === !0)
      y.code((0, o._)`${i.default.self}.logger.log(${F})`);
    else if (typeof D.$comment == "function") {
      const le = (0, o.str)`${T}/$comment`, we = y.scopeValue("root", { ref: S.root });
      y.code((0, o._)`${i.default.self}.opts.$comment(${F}, ${le}, ${we}.schema)`);
    }
  }
  function A(y) {
    const { gen: S, schemaEnv: O, validateName: T, ValidationError: D, opts: F } = y;
    O.$async ? S.if((0, o._)`${i.default.errors} === 0`, () => S.return(i.default.data), () => S.throw((0, o._)`new ${D}(${i.default.vErrors})`)) : (S.assign((0, o._)`${T}.errors`, i.default.vErrors), F.unevaluated && L(y), S.return((0, o._)`${i.default.errors} === 0`));
  }
  function L({ gen: y, evaluated: S, props: O, items: T }) {
    O instanceof o.Name && y.assign((0, o._)`${S}.props`, O), T instanceof o.Name && y.assign((0, o._)`${S}.items`, T);
  }
  function H(y, S, O, T) {
    const { gen: D, schema: F, data: le, allErrors: we, opts: de, self: fe } = y, { RULES: ue } = fe;
    if (F.$ref && (de.ignoreKeywordsWithRef || !(0, u.schemaHasRulesButRef)(F, ue))) {
      D.block(() => C(y, "$ref", ue.all.$ref.definition));
      return;
    }
    de.jtd || Q(y, S), D.block(() => {
      for (const ye of ue.rules)
        ze(ye);
      ze(ue.post);
    });
    function ze(ye) {
      (0, r.shouldUseGroup)(F, ye) && (ye.type ? (D.if((0, n.checkDataType)(ye.type, le, de.strictNumbers)), U(y, ye), S.length === 1 && S[0] === ye.type && O && (D.else(), (0, n.reportTypeError)(y)), D.endIf()) : U(y, ye), we || D.if((0, o._)`${i.default.errors} === ${T || 0}`));
    }
  }
  function U(y, S) {
    const { gen: O, schema: T, opts: { useDefaults: D } } = y;
    D && (0, s.assignDefaults)(y, S.type), O.block(() => {
      for (const F of S.rules)
        (0, r.shouldUseRule)(T, F) && C(y, F.keyword, F.definition, S.type);
    });
  }
  function Q(y, S) {
    y.schemaEnv.meta || !y.opts.strictTypes || (G(y, S), y.opts.allowUnionTypes || I(y, S), _(y, y.dataTypes));
  }
  function G(y, S) {
    if (S.length) {
      if (!y.dataTypes.length) {
        y.dataTypes = S;
        return;
      }
      S.forEach((O) => {
        E(y.dataTypes, O) || f(y, `type "${O}" not allowed by context "${y.dataTypes.join(",")}"`);
      }), l(y, S);
    }
  }
  function I(y, S) {
    S.length > 1 && !(S.length === 2 && S.includes("null")) && f(y, "use allowUnionTypes to allow union type keyword");
  }
  function _(y, S) {
    const O = y.self.RULES.all;
    for (const T in O) {
      const D = O[T];
      if (typeof D == "object" && (0, r.shouldUseRule)(y.schema, D)) {
        const { type: F } = D.definition;
        F.length && !F.some((le) => R(S, le)) && f(y, `missing type "${F.join(",")}" for keyword "${T}"`);
      }
    }
  }
  function R(y, S) {
    return y.includes(S) || S === "number" && y.includes("integer");
  }
  function E(y, S) {
    return y.includes(S) || S === "integer" && y.includes("number");
  }
  function l(y, S) {
    const O = [];
    for (const T of y.dataTypes)
      E(S, T) ? O.push(T) : S.includes("integer") && T === "number" && O.push("integer");
    y.dataTypes = O;
  }
  function f(y, S) {
    const O = y.schemaEnv.baseId + y.errSchemaPath;
    S += ` at "${O}" (strictTypes)`, (0, u.checkStrictMode)(y, S, y.opts.strictTypes);
  }
  class N {
    constructor(S, O, T) {
      if ((0, a.validateKeywordUsage)(S, O, T), this.gen = S.gen, this.allErrors = S.allErrors, this.keyword = T, this.data = S.data, this.schema = S.schema[T], this.$data = O.$data && S.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, u.schemaRefOrVal)(S, this.schema, T, this.$data), this.schemaType = O.schemaType, this.parentSchema = S.schema, this.params = {}, this.it = S, this.def = O, this.$data)
        this.schemaCode = S.gen.const("vSchema", B(this.$data, S));
      else if (this.schemaCode = this.schemaValue, !(0, a.validSchemaType)(this.schema, O.schemaType, O.allowUndefined))
        throw new Error(`${T} value must be ${JSON.stringify(O.schemaType)}`);
      ("code" in O ? O.trackErrors : O.errors !== !1) && (this.errsCount = S.gen.const("_errs", i.default.errors));
    }
    result(S, O, T) {
      this.failResult((0, o.not)(S), O, T);
    }
    failResult(S, O, T) {
      this.gen.if(S), T ? T() : this.error(), O ? (this.gen.else(), O(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(S, O) {
      this.failResult((0, o.not)(S), void 0, O);
    }
    fail(S) {
      if (S === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(S), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(S) {
      if (!this.$data)
        return this.fail(S);
      const { schemaCode: O } = this;
      this.fail((0, o._)`${O} !== undefined && (${(0, o.or)(this.invalid$data(), S)})`);
    }
    error(S, O, T) {
      if (O) {
        this.setParams(O), this._error(S, T), this.setParams({});
        return;
      }
      this._error(S, T);
    }
    _error(S, O) {
      (S ? h.reportExtraError : h.reportError)(this, this.def.error, O);
    }
    $dataError() {
      (0, h.reportError)(this, this.def.$dataError || h.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, h.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(S) {
      this.allErrors || this.gen.if(S);
    }
    setParams(S, O) {
      O ? Object.assign(this.params, S) : this.params = S;
    }
    block$data(S, O, T = o.nil) {
      this.gen.block(() => {
        this.check$data(S, T), O();
      });
    }
    check$data(S = o.nil, O = o.nil) {
      if (!this.$data)
        return;
      const { gen: T, schemaCode: D, schemaType: F, def: le } = this;
      T.if((0, o.or)((0, o._)`${D} === undefined`, O)), S !== o.nil && T.assign(S, !0), (F.length || le.validateSchema) && (T.elseIf(this.invalid$data()), this.$dataError(), S !== o.nil && T.assign(S, !1)), T.else();
    }
    invalid$data() {
      const { gen: S, schemaCode: O, schemaType: T, def: D, it: F } = this;
      return (0, o.or)(le(), we());
      function le() {
        if (T.length) {
          if (!(O instanceof o.Name))
            throw new Error("ajv implementation error");
          const de = Array.isArray(T) ? T : [T];
          return (0, o._)`${(0, n.checkDataTypes)(de, O, F.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function we() {
        if (D.validateSchema) {
          const de = S.scopeValue("validate$data", { ref: D.validateSchema });
          return (0, o._)`!${de}(${O})`;
        }
        return o.nil;
      }
    }
    subschema(S, O) {
      const T = (0, c.getSubschema)(this.it, S);
      (0, c.extendSubschemaData)(T, this.it, S), (0, c.extendSubschemaMode)(T, S);
      const D = { ...this.it, ...T, items: void 0, props: void 0 };
      return P(D, O), D;
    }
    mergeEvaluated(S, O) {
      const { it: T, gen: D } = this;
      T.opts.unevaluated && (T.props !== !0 && S.props !== void 0 && (T.props = u.mergeEvaluated.props(D, S.props, T.props, O)), T.items !== !0 && S.items !== void 0 && (T.items = u.mergeEvaluated.items(D, S.items, T.items, O)));
    }
    mergeValidEvaluated(S, O) {
      const { it: T, gen: D } = this;
      if (T.opts.unevaluated && (T.props !== !0 || T.items !== !0))
        return D.if(O, () => this.mergeEvaluated(S, o.Name)), !0;
    }
  }
  dt.KeywordCxt = N;
  function C(y, S, O, T) {
    const D = new N(y, O, S);
    "code" in O ? O.code(D, T) : D.$data && O.validate ? (0, a.funcKeywordCode)(D, O) : "macro" in O ? (0, a.macroKeywordCode)(D, O) : (O.compile || O.validate) && (0, a.funcKeywordCode)(D, O);
  }
  const M = /^\/(?:[^~]|~0|~1)*$/, Y = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function B(y, { dataLevel: S, dataNames: O, dataPathArr: T }) {
    let D, F;
    if (y === "")
      return i.default.rootData;
    if (y[0] === "/") {
      if (!M.test(y))
        throw new Error(`Invalid JSON-pointer: ${y}`);
      D = y, F = i.default.rootData;
    } else {
      const fe = Y.exec(y);
      if (!fe)
        throw new Error(`Invalid JSON-pointer: ${y}`);
      const ue = +fe[1];
      if (D = fe[2], D === "#") {
        if (ue >= S)
          throw new Error(de("property/index", ue));
        return T[S - ue];
      }
      if (ue > S)
        throw new Error(de("data", ue));
      if (F = O[S - ue], !D)
        return F;
    }
    let le = F;
    const we = D.split("/");
    for (const fe of we)
      fe && (F = (0, o._)`${F}${(0, o.getProperty)((0, u.unescapeJsonPointer)(fe))}`, le = (0, o._)`${le} && ${F}`);
    return le;
    function de(fe, ue) {
      return `Cannot access ${fe} ${ue} levels up, current level is ${S}`;
    }
  }
  return dt.getData = B, dt;
}
var Gr = {};
Object.defineProperty(Gr, "__esModule", { value: !0 });
class dd extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
Gr.default = dd;
var dr = {};
Object.defineProperty(dr, "__esModule", { value: !0 });
const ds = Ie;
class fd extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, ds.resolveUrl)(t, r, n), this.missingSchema = (0, ds.normalizeId)((0, ds.getFullPath)(t, this.missingRef));
  }
}
dr.default = fd;
var De = {};
Object.defineProperty(De, "__esModule", { value: !0 });
De.resolveSchema = De.getCompilingSchema = De.resolveRef = De.compileSchema = De.SchemaEnv = void 0;
const We = te, hd = Gr, Vt = nt(), xe = Ie, si = K, md = Kn();
let Gn = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, xe.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
De.SchemaEnv = Gn;
function ea(e) {
  const t = qc.call(this, e);
  if (t)
    return t;
  const r = (0, xe.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, c = new We.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let o;
  e.$async && (o = c.scopeValue("Error", {
    ref: hd.default,
    code: (0, We._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const i = c.scopeName("validate");
  e.validateName = i;
  const d = {
    gen: c,
    allErrors: this.opts.allErrors,
    data: Vt.default.data,
    parentData: Vt.default.parentData,
    parentDataProperty: Vt.default.parentDataProperty,
    dataNames: [Vt.default.data],
    dataPathArr: [We.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: c.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, We.stringify)(e.schema) } : { ref: e.schema }),
    validateName: i,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: We.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, We._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, md.validateFunctionCode)(d), c.optimize(this.opts.code.optimize);
    const h = c.toString();
    u = `${c.scopeRefs(Vt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const p = new Function(`${Vt.default.self}`, `${Vt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(i, { ref: p }), p.errors = null, p.schema = e.schema, p.schemaEnv = e, e.$async && (p.$async = !0), this.opts.code.source === !0 && (p.source = { validateName: i, validateCode: h, scopeValues: c._values }), this.opts.unevaluated) {
      const { props: $, items: g } = d;
      p.evaluated = {
        props: $ instanceof We.Name ? void 0 : $,
        items: g instanceof We.Name ? void 0 : g,
        dynamicProps: $ instanceof We.Name,
        dynamicItems: g instanceof We.Name
      }, p.source && (p.source.evaluated = (0, We.stringify)(p.evaluated));
    }
    return e.validate = p, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
De.compileSchema = ea;
function pd(e, t, r) {
  var n;
  r = (0, xe.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = gd.call(this, e, r);
  if (a === void 0) {
    const c = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: o } = this.opts;
    c && (a = new Gn({ schema: c, schemaId: o, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = $d.call(this, a);
}
De.resolveRef = pd;
function $d(e) {
  return (0, xe.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : ea.call(this, e);
}
function qc(e) {
  for (const t of this._compilations)
    if (yd(t, e))
      return t;
}
De.getCompilingSchema = qc;
function yd(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function gd(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || Hn.call(this, e, t);
}
function Hn(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, xe._getFullPath)(this.opts.uriResolver, r);
  let s = (0, xe.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return fs.call(this, r, e);
  const a = (0, xe.normalizeId)(n), c = this.refs[a] || this.schemas[a];
  if (typeof c == "string") {
    const o = Hn.call(this, e, c);
    return typeof (o == null ? void 0 : o.schema) != "object" ? void 0 : fs.call(this, r, o);
  }
  if (typeof (c == null ? void 0 : c.schema) == "object") {
    if (c.validate || ea.call(this, c), a === (0, xe.normalizeId)(t)) {
      const { schema: o } = c, { schemaId: i } = this.opts, d = o[i];
      return d && (s = (0, xe.resolveUrl)(this.opts.uriResolver, s, d)), new Gn({ schema: o, schemaId: i, root: e, baseId: s });
    }
    return fs.call(this, r, c);
  }
}
De.resolveSchema = Hn;
const _d = /* @__PURE__ */ new Set([
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
    const i = r[(0, si.unescapeFragment)(o)];
    if (i === void 0)
      return;
    r = i;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !_d.has(o) && d && (t = (0, xe.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, si.schemaHasRulesButRef)(r, this.RULES)) {
    const o = (0, xe.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = Hn.call(this, n, o);
  }
  const { schemaId: c } = this.opts;
  if (a = a || new Gn({ schema: r, schemaId: c, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const vd = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", wd = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Ed = "object", bd = [
  "$data"
], Sd = {
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
}, Pd = !1, Nd = {
  $id: vd,
  description: wd,
  type: Ed,
  required: bd,
  properties: Sd,
  additionalProperties: Pd
};
var ta = {}, Bn = { exports: {} };
const Rd = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), Uc = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function Kc(e) {
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
const Od = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function ai(e) {
  return e.length = 0, !0;
}
function Id(e, t, r) {
  if (e.length) {
    const n = Kc(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function jd(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, c = !1, o = Id;
  for (let i = 0; i < e.length; i++) {
    const d = e[i];
    if (!(d === "[" || d === "]"))
      if (d === ":") {
        if (a === !0 && (c = !0), !o(s, n, r))
          break;
        if (++t > 7) {
          r.error = !0;
          break;
        }
        i > 0 && e[i - 1] === ":" && (a = !0), n.push(":");
        continue;
      } else if (d === "%") {
        if (!o(s, n, r))
          break;
        o = ai;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (o === ai ? r.zone = s.join("") : c ? n.push(s.join("")) : n.push(Kc(s))), r.address = n.join(""), r;
}
function Gc(e) {
  if (Td(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = jd(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function Td(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function kd(e) {
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
function Ad(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function Cd(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!Uc(r)) {
      const n = Gc(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var Hc = {
  nonSimpleDomain: Od,
  recomposeAuthority: Cd,
  normalizeComponentEncoding: Ad,
  removeDotSegments: kd,
  isIPv4: Uc,
  isUUID: Rd,
  normalizeIPv6: Gc
};
const { isUUID: Dd } = Hc, Md = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Bc(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Jc(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Wc(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function Ld(e) {
  return e.secure = Bc(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function Vd(e) {
  if ((e.port === (Bc(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function Fd(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(Md);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = ra(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function zd(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = ra(s);
  a && (e = a.serialize(e, t));
  const c = e, o = e.nss;
  return c.path = `${n || t.nid}:${o}`, t.skipEscape = !0, c;
}
function qd(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !Dd(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function Ud(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Xc = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Jc,
    serialize: Wc
  }
), Kd = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Xc.domainHost,
    parse: Jc,
    serialize: Wc
  }
), yn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: Ld,
    serialize: Vd
  }
), Gd = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: yn.domainHost,
    parse: yn.parse,
    serialize: yn.serialize
  }
), Hd = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: Fd,
    serialize: zd,
    skipNormalize: !0
  }
), Bd = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: qd,
    serialize: Ud,
    skipNormalize: !0
  }
), In = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Xc,
    https: Kd,
    ws: yn,
    wss: Gd,
    urn: Hd,
    "urn:uuid": Bd
  }
);
Object.setPrototypeOf(In, null);
function ra(e) {
  return e && (In[
    /** @type {SchemeName} */
    e
  ] || In[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var Jd = {
  SCHEMES: In,
  getSchemeHandler: ra
};
const { normalizeIPv6: Wd, removeDotSegments: jr, recomposeAuthority: Xd, normalizeComponentEncoding: Xr, isIPv4: Yd, nonSimpleDomain: Qd } = Hc, { SCHEMES: Zd, getSchemeHandler: Yc } = Jd;
function xd(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  ct(vt(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  vt(ct(e, t), t)), e;
}
function ef(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Qc(vt(e, n), vt(t, n), n, !0);
  return n.skipEscape = !0, ct(s, n);
}
function Qc(e, t, r, n) {
  const s = {};
  return n || (e = vt(ct(e, r), r), t = vt(ct(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = jr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = jr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = jr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = jr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function tf(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = ct(Xr(vt(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = ct(Xr(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = ct(Xr(vt(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = ct(Xr(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
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
  }, n = Object.assign({}, t), s = [], a = Yc(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const c = Xd(r);
  if (c !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(c), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let o = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (o = jr(o)), c === void 0 && o[0] === "/" && o[1] === "/" && (o = "/%2F" + o.slice(2)), s.push(o);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const rf = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function vt(e, t) {
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
  const a = e.match(rf);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (Yd(n.host) === !1) {
        const i = Wd(n.host);
        n.host = i.host.toLowerCase(), s = i.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const c = Yc(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!c || !c.unicodeSupport) && n.host && (r.domainHost || c && c.domainHost) && s === !1 && Qd(n.host))
      try {
        n.host = URL.domainToASCII(n.host.toLowerCase());
      } catch (o) {
        n.error = n.error || "Host's domain name can not be converted to ASCII: " + o;
      }
    (!c || c && !c.skipNormalize) && (e.indexOf("%") !== -1 && (n.scheme !== void 0 && (n.scheme = unescape(n.scheme)), n.host !== void 0 && (n.host = unescape(n.host))), n.path && (n.path = escape(unescape(n.path))), n.fragment && (n.fragment = encodeURI(decodeURIComponent(n.fragment)))), c && c.parse && c.parse(n, r);
  } else
    n.error = n.error || "URI can not be parsed.";
  return n;
}
const na = {
  SCHEMES: Zd,
  normalize: xd,
  resolve: ef,
  resolveComponent: Qc,
  equal: tf,
  serialize: ct,
  parse: vt
};
Bn.exports = na;
Bn.exports.default = na;
Bn.exports.fastUri = na;
var Zc = Bn.exports;
Object.defineProperty(ta, "__esModule", { value: !0 });
const xc = Zc;
xc.code = 'require("ajv/dist/runtime/uri").default';
ta.default = xc;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Kn();
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
  const n = Gr, s = dr, a = Wt, c = De, o = te, i = Ie, d = Se, u = K, h = Nd, b = ta, p = (I, _) => new RegExp(I, _);
  p.code = "new RegExp";
  const $ = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  }, w = 200;
  function P(I) {
    var _, R, E, l, f, N, C, M, Y, B, y, S, O, T, D, F, le, we, de, fe, ue, ze, ye, Ct, Dt;
    const Be = I.strict, Mt = (_ = I.code) === null || _ === void 0 ? void 0 : _.optimize, _r = Mt === !0 || Mt === void 0 ? 1 : Mt || 0, vr = (E = (R = I.code) === null || R === void 0 ? void 0 : R.regExp) !== null && E !== void 0 ? E : p, cs = (l = I.uriResolver) !== null && l !== void 0 ? l : b.default;
    return {
      strictSchema: (N = (f = I.strictSchema) !== null && f !== void 0 ? f : Be) !== null && N !== void 0 ? N : !0,
      strictNumbers: (M = (C = I.strictNumbers) !== null && C !== void 0 ? C : Be) !== null && M !== void 0 ? M : !0,
      strictTypes: (B = (Y = I.strictTypes) !== null && Y !== void 0 ? Y : Be) !== null && B !== void 0 ? B : "log",
      strictTuples: (S = (y = I.strictTuples) !== null && y !== void 0 ? y : Be) !== null && S !== void 0 ? S : "log",
      strictRequired: (T = (O = I.strictRequired) !== null && O !== void 0 ? O : Be) !== null && T !== void 0 ? T : !1,
      code: I.code ? { ...I.code, optimize: _r, regExp: vr } : { optimize: _r, regExp: vr },
      loopRequired: (D = I.loopRequired) !== null && D !== void 0 ? D : w,
      loopEnum: (F = I.loopEnum) !== null && F !== void 0 ? F : w,
      meta: (le = I.meta) !== null && le !== void 0 ? le : !0,
      messages: (we = I.messages) !== null && we !== void 0 ? we : !0,
      inlineRefs: (de = I.inlineRefs) !== null && de !== void 0 ? de : !0,
      schemaId: (fe = I.schemaId) !== null && fe !== void 0 ? fe : "$id",
      addUsedSchema: (ue = I.addUsedSchema) !== null && ue !== void 0 ? ue : !0,
      validateSchema: (ze = I.validateSchema) !== null && ze !== void 0 ? ze : !0,
      validateFormats: (ye = I.validateFormats) !== null && ye !== void 0 ? ye : !0,
      unicodeRegExp: (Ct = I.unicodeRegExp) !== null && Ct !== void 0 ? Ct : !0,
      int32range: (Dt = I.int32range) !== null && Dt !== void 0 ? Dt : !0,
      uriResolver: cs
    };
  }
  class j {
    constructor(_ = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), _ = this.opts = { ..._, ...P(_) };
      const { es5: R, lines: E } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: g, es5: R, lines: E }), this.logger = X(_.logger);
      const l = _.validateFormats;
      _.validateFormats = !1, this.RULES = (0, a.getRules)(), k.call(this, v, _, "NOT SUPPORTED"), k.call(this, m, _, "DEPRECATED", "warn"), this._metaOpts = ce.call(this), _.formats && x.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), _.keywords && re.call(this, _.keywords), typeof _.meta == "object" && this.addMetaSchema(_.meta), q.call(this), _.validateFormats = l;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: _, meta: R, schemaId: E } = this.opts;
      let l = h;
      E === "id" && (l = { ...h }, l.id = l.$id, delete l.$id), R && _ && this.addMetaSchema(l, l[E], !1);
    }
    defaultMeta() {
      const { meta: _, schemaId: R } = this.opts;
      return this.opts.defaultMeta = typeof _ == "object" ? _[R] || _ : void 0;
    }
    validate(_, R) {
      let E;
      if (typeof _ == "string") {
        if (E = this.getSchema(_), !E)
          throw new Error(`no schema with key or ref "${_}"`);
      } else
        E = this.compile(_);
      const l = E(R);
      return "$async" in E || (this.errors = E.errors), l;
    }
    compile(_, R) {
      const E = this._addSchema(_, R);
      return E.validate || this._compileSchemaEnv(E);
    }
    compileAsync(_, R) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: E } = this.opts;
      return l.call(this, _, R);
      async function l(B, y) {
        await f.call(this, B.$schema);
        const S = this._addSchema(B, y);
        return S.validate || N.call(this, S);
      }
      async function f(B) {
        B && !this.getSchema(B) && await l.call(this, { $ref: B }, !0);
      }
      async function N(B) {
        try {
          return this._compileSchemaEnv(B);
        } catch (y) {
          if (!(y instanceof s.default))
            throw y;
          return C.call(this, y), await M.call(this, y.missingSchema), N.call(this, B);
        }
      }
      function C({ missingSchema: B, missingRef: y }) {
        if (this.refs[B])
          throw new Error(`AnySchema ${B} is loaded but ${y} cannot be resolved`);
      }
      async function M(B) {
        const y = await Y.call(this, B);
        this.refs[B] || await f.call(this, y.$schema), this.refs[B] || this.addSchema(y, B, R);
      }
      async function Y(B) {
        const y = this._loading[B];
        if (y)
          return y;
        try {
          return await (this._loading[B] = E(B));
        } finally {
          delete this._loading[B];
        }
      }
    }
    // Adds schema to the instance
    addSchema(_, R, E, l = this.opts.validateSchema) {
      if (Array.isArray(_)) {
        for (const N of _)
          this.addSchema(N, void 0, E, l);
        return this;
      }
      let f;
      if (typeof _ == "object") {
        const { schemaId: N } = this.opts;
        if (f = _[N], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${N} must be string`);
      }
      return R = (0, i.normalizeId)(R || f), this._checkUnique(R), this.schemas[R] = this._addSchema(_, E, R, l, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(_, R, E = this.opts.validateSchema) {
      return this.addSchema(_, R, !0, E), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(_, R) {
      if (typeof _ == "boolean")
        return !0;
      let E;
      if (E = _.$schema, E !== void 0 && typeof E != "string")
        throw new Error("$schema must be a string");
      if (E = E || this.opts.defaultMeta || this.defaultMeta(), !E)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const l = this.validate(E, _);
      if (!l && R) {
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
    getSchema(_) {
      let R;
      for (; typeof (R = V.call(this, _)) == "string"; )
        _ = R;
      if (R === void 0) {
        const { schemaId: E } = this.opts, l = new c.SchemaEnv({ schema: {}, schemaId: E });
        if (R = c.resolveSchema.call(this, l, _), !R)
          return;
        this.refs[_] = R;
      }
      return R.validate || this._compileSchemaEnv(R);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(_) {
      if (_ instanceof RegExp)
        return this._removeAllSchemas(this.schemas, _), this._removeAllSchemas(this.refs, _), this;
      switch (typeof _) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const R = V.call(this, _);
          return typeof R == "object" && this._cache.delete(R.schema), delete this.schemas[_], delete this.refs[_], this;
        }
        case "object": {
          const R = _;
          this._cache.delete(R);
          let E = _[this.opts.schemaId];
          return E && (E = (0, i.normalizeId)(E), delete this.schemas[E], delete this.refs[E]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(_) {
      for (const R of _)
        this.addKeyword(R);
      return this;
    }
    addKeyword(_, R) {
      let E;
      if (typeof _ == "string")
        E = _, typeof R == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), R.keyword = E);
      else if (typeof _ == "object" && R === void 0) {
        if (R = _, E = R.keyword, Array.isArray(E) && !E.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (A.call(this, E, R), !R)
        return (0, u.eachItem)(E, (f) => L.call(this, f)), this;
      U.call(this, R);
      const l = {
        ...R,
        type: (0, d.getJSONTypes)(R.type),
        schemaType: (0, d.getJSONTypes)(R.schemaType)
      };
      return (0, u.eachItem)(E, l.type.length === 0 ? (f) => L.call(this, f, l) : (f) => l.type.forEach((N) => L.call(this, f, l, N))), this;
    }
    getKeyword(_) {
      const R = this.RULES.all[_];
      return typeof R == "object" ? R.definition : !!R;
    }
    // Remove keyword
    removeKeyword(_) {
      const { RULES: R } = this;
      delete R.keywords[_], delete R.all[_];
      for (const E of R.rules) {
        const l = E.rules.findIndex((f) => f.keyword === _);
        l >= 0 && E.rules.splice(l, 1);
      }
      return this;
    }
    // Add format
    addFormat(_, R) {
      return typeof R == "string" && (R = new RegExp(R)), this.formats[_] = R, this;
    }
    errorsText(_ = this.errors, { separator: R = ", ", dataVar: E = "data" } = {}) {
      return !_ || _.length === 0 ? "No errors" : _.map((l) => `${E}${l.instancePath} ${l.message}`).reduce((l, f) => l + R + f);
    }
    $dataMetaSchema(_, R) {
      const E = this.RULES.all;
      _ = JSON.parse(JSON.stringify(_));
      for (const l of R) {
        const f = l.split("/").slice(1);
        let N = _;
        for (const C of f)
          N = N[C];
        for (const C in E) {
          const M = E[C];
          if (typeof M != "object")
            continue;
          const { $data: Y } = M.definition, B = N[C];
          Y && B && (N[C] = G(B));
        }
      }
      return _;
    }
    _removeAllSchemas(_, R) {
      for (const E in _) {
        const l = _[E];
        (!R || R.test(E)) && (typeof l == "string" ? delete _[E] : l && !l.meta && (this._cache.delete(l.schema), delete _[E]));
      }
    }
    _addSchema(_, R, E, l = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let N;
      const { schemaId: C } = this.opts;
      if (typeof _ == "object")
        N = _[C];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof _ != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let M = this._cache.get(_);
      if (M !== void 0)
        return M;
      E = (0, i.normalizeId)(N || E);
      const Y = i.getSchemaRefs.call(this, _, E);
      return M = new c.SchemaEnv({ schema: _, schemaId: C, meta: R, baseId: E, localRefs: Y }), this._cache.set(M.schema, M), f && !E.startsWith("#") && (E && this._checkUnique(E), this.refs[E] = M), l && this.validateSchema(_, !0), M;
    }
    _checkUnique(_) {
      if (this.schemas[_] || this.refs[_])
        throw new Error(`schema with key or id "${_}" already exists`);
    }
    _compileSchemaEnv(_) {
      if (_.meta ? this._compileMetaSchema(_) : c.compileSchema.call(this, _), !_.validate)
        throw new Error("ajv implementation error");
      return _.validate;
    }
    _compileMetaSchema(_) {
      const R = this.opts;
      this.opts = this._metaOpts;
      try {
        c.compileSchema.call(this, _);
      } finally {
        this.opts = R;
      }
    }
  }
  j.ValidationError = n.default, j.MissingRefError = s.default, e.default = j;
  function k(I, _, R, E = "error") {
    for (const l in I) {
      const f = l;
      f in _ && this.logger[E](`${R}: option ${l}. ${I[f]}`);
    }
  }
  function V(I) {
    return I = (0, i.normalizeId)(I), this.schemas[I] || this.refs[I];
  }
  function q() {
    const I = this.opts.schemas;
    if (I)
      if (Array.isArray(I))
        this.addSchema(I);
      else
        for (const _ in I)
          this.addSchema(I[_], _);
  }
  function x() {
    for (const I in this.opts.formats) {
      const _ = this.opts.formats[I];
      _ && this.addFormat(I, _);
    }
  }
  function re(I) {
    if (Array.isArray(I)) {
      this.addVocabulary(I);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const _ in I) {
      const R = I[_];
      R.keyword || (R.keyword = _), this.addKeyword(R);
    }
  }
  function ce() {
    const I = { ...this.opts };
    for (const _ of $)
      delete I[_];
    return I;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function X(I) {
    if (I === !1)
      return z;
    if (I === void 0)
      return console;
    if (I.log && I.warn && I.error)
      return I;
    throw new Error("logger must implement log, warn and error methods");
  }
  const W = /^[a-z_$][a-z0-9_$:-]*$/i;
  function A(I, _) {
    const { RULES: R } = this;
    if ((0, u.eachItem)(I, (E) => {
      if (R.keywords[E])
        throw new Error(`Keyword ${E} is already defined`);
      if (!W.test(E))
        throw new Error(`Keyword ${E} has invalid name`);
    }), !!_ && _.$data && !("code" in _ || "validate" in _))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function L(I, _, R) {
    var E;
    const l = _ == null ? void 0 : _.post;
    if (R && l)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let N = l ? f.post : f.rules.find(({ type: M }) => M === R);
    if (N || (N = { type: R, rules: [] }, f.rules.push(N)), f.keywords[I] = !0, !_)
      return;
    const C = {
      keyword: I,
      definition: {
        ..._,
        type: (0, d.getJSONTypes)(_.type),
        schemaType: (0, d.getJSONTypes)(_.schemaType)
      }
    };
    _.before ? H.call(this, N, C, _.before) : N.rules.push(C), f.all[I] = C, (E = _.implements) === null || E === void 0 || E.forEach((M) => this.addKeyword(M));
  }
  function H(I, _, R) {
    const E = I.rules.findIndex((l) => l.keyword === R);
    E >= 0 ? I.rules.splice(E, 0, _) : (I.rules.push(_), this.logger.warn(`rule ${R} is not defined`));
  }
  function U(I) {
    let { metaSchema: _ } = I;
    _ !== void 0 && (I.$data && this.opts.$data && (_ = G(_)), I.validateSchema = this.compile(_, !0));
  }
  const Q = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function G(I) {
    return { anyOf: [I, Q] };
  }
})(Rc);
var sa = {}, aa = {}, oa = {};
Object.defineProperty(oa, "__esModule", { value: !0 });
const nf = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
oa.default = nf;
var wt = {};
Object.defineProperty(wt, "__esModule", { value: !0 });
wt.callRef = wt.getValidate = void 0;
const sf = dr, oi = st(), Le = te, Qt = nt(), ii = De, Yr = K, af = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: c, opts: o, self: i } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = ii.resolveRef.call(i, d, s, r);
    if (u === void 0)
      throw new sf.default(n.opts.uriResolver, s, r);
    if (u instanceof ii.SchemaEnv)
      return b(u);
    return p(u);
    function h() {
      if (a === d)
        return gn(e, c, a, a.$async);
      const $ = t.scopeValue("root", { ref: d });
      return gn(e, (0, Le._)`${$}.validate`, d, d.$async);
    }
    function b($) {
      const g = el(e, $);
      gn(e, g, $, $.$async);
    }
    function p($) {
      const g = t.scopeValue("schema", o.code.source === !0 ? { ref: $, code: (0, Le.stringify)($) } : { ref: $ }), v = t.name("valid"), m = e.subschema({
        schema: $,
        dataTypes: [],
        schemaPath: Le.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, v);
      e.mergeEvaluated(m), e.ok(v);
    }
  }
};
function el(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Le._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
wt.getValidate = el;
function gn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: c, schemaEnv: o, opts: i } = a, d = i.passContext ? Qt.default.this : Le.nil;
  n ? u() : h();
  function u() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const $ = s.let("valid");
    s.try(() => {
      s.code((0, Le._)`await ${(0, oi.callValidateCode)(e, t, d)}`), p(t), c || s.assign($, !0);
    }, (g) => {
      s.if((0, Le._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), b(g), c || s.assign($, !1);
    }), e.ok($);
  }
  function h() {
    e.result((0, oi.callValidateCode)(e, t, d), () => p(t), () => b(t));
  }
  function b($) {
    const g = (0, Le._)`${$}.errors`;
    s.assign(Qt.default.vErrors, (0, Le._)`${Qt.default.vErrors} === null ? ${g} : ${Qt.default.vErrors}.concat(${g})`), s.assign(Qt.default.errors, (0, Le._)`${Qt.default.vErrors}.length`);
  }
  function p($) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const v = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (a.props = Yr.mergeEvaluated.props(s, v.props, a.props));
      else {
        const m = s.var("props", (0, Le._)`${$}.evaluated.props`);
        a.props = Yr.mergeEvaluated.props(s, m, a.props, Le.Name);
      }
    if (a.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (a.items = Yr.mergeEvaluated.items(s, v.items, a.items));
      else {
        const m = s.var("items", (0, Le._)`${$}.evaluated.items`);
        a.items = Yr.mergeEvaluated.items(s, m, a.items, Le.Name);
      }
  }
}
wt.callRef = gn;
wt.default = af;
Object.defineProperty(aa, "__esModule", { value: !0 });
const of = oa, cf = wt, lf = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  of.default,
  cf.default
];
aa.default = lf;
var ia = {}, ca = {};
Object.defineProperty(ca, "__esModule", { value: !0 });
const jn = te, Pt = jn.operators, Tn = {
  maximum: { okStr: "<=", ok: Pt.LTE, fail: Pt.GT },
  minimum: { okStr: ">=", ok: Pt.GTE, fail: Pt.LT },
  exclusiveMaximum: { okStr: "<", ok: Pt.LT, fail: Pt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Pt.GT, fail: Pt.LTE }
}, uf = {
  message: ({ keyword: e, schemaCode: t }) => (0, jn.str)`must be ${Tn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, jn._)`{comparison: ${Tn[e].okStr}, limit: ${t}}`
}, df = {
  keyword: Object.keys(Tn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: uf,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, jn._)`${r} ${Tn[t].fail} ${n} || isNaN(${r})`);
  }
};
ca.default = df;
var la = {};
Object.defineProperty(la, "__esModule", { value: !0 });
const Ar = te, ff = {
  message: ({ schemaCode: e }) => (0, Ar.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Ar._)`{multipleOf: ${e}}`
}, hf = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: ff,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, c = t.let("res"), o = a ? (0, Ar._)`Math.abs(Math.round(${c}) - ${c}) > 1e-${a}` : (0, Ar._)`${c} !== parseInt(${c})`;
    e.fail$data((0, Ar._)`(${n} === 0 || (${c} = ${r}/${n}, ${o}))`);
  }
};
la.default = hf;
var ua = {}, da = {};
Object.defineProperty(da, "__esModule", { value: !0 });
function tl(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
da.default = tl;
tl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(ua, "__esModule", { value: !0 });
const qt = te, mf = K, pf = da, $f = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, qt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, qt._)`{limit: ${e}}`
}, yf = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: $f,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? qt.operators.GT : qt.operators.LT, c = s.opts.unicode === !1 ? (0, qt._)`${r}.length` : (0, qt._)`${(0, mf.useFunc)(e.gen, pf.default)}(${r})`;
    e.fail$data((0, qt._)`${c} ${a} ${n}`);
  }
};
ua.default = yf;
var fa = {};
Object.defineProperty(fa, "__esModule", { value: !0 });
const gf = st(), kn = te, _f = {
  message: ({ schemaCode: e }) => (0, kn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, kn._)`{pattern: ${e}}`
}, vf = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: _f,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, c = a.opts.unicodeRegExp ? "u" : "", o = r ? (0, kn._)`(new RegExp(${s}, ${c}))` : (0, gf.usePattern)(e, n);
    e.fail$data((0, kn._)`!${o}.test(${t})`);
  }
};
fa.default = vf;
var ha = {};
Object.defineProperty(ha, "__esModule", { value: !0 });
const Cr = te, wf = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Cr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Cr._)`{limit: ${e}}`
}, Ef = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: wf,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Cr.operators.GT : Cr.operators.LT;
    e.fail$data((0, Cr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
ha.default = Ef;
var ma = {};
Object.defineProperty(ma, "__esModule", { value: !0 });
const Nr = st(), Dr = te, bf = K, Sf = {
  message: ({ params: { missingProperty: e } }) => (0, Dr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Dr._)`{missingProperty: ${e}}`
}, Pf = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Sf,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: c } = e, { opts: o } = c;
    if (!a && r.length === 0)
      return;
    const i = r.length >= o.loopRequired;
    if (c.allErrors ? d() : u(), o.strictRequired) {
      const p = e.parentSchema.properties, { definedProperties: $ } = e.it;
      for (const g of r)
        if ((p == null ? void 0 : p[g]) === void 0 && !$.has(g)) {
          const v = c.schemaEnv.baseId + c.errSchemaPath, m = `required property "${g}" is not defined at "${v}" (strictRequired)`;
          (0, bf.checkStrictMode)(c, m, c.opts.strictRequired);
        }
    }
    function d() {
      if (i || a)
        e.block$data(Dr.nil, h);
      else
        for (const p of r)
          (0, Nr.checkReportMissingProp)(e, p);
    }
    function u() {
      const p = t.let("missing");
      if (i || a) {
        const $ = t.let("valid", !0);
        e.block$data($, () => b(p, $)), e.ok($);
      } else
        t.if((0, Nr.checkMissingProp)(e, r, p)), (0, Nr.reportMissingProp)(e, p), t.else();
    }
    function h() {
      t.forOf("prop", n, (p) => {
        e.setParams({ missingProperty: p }), t.if((0, Nr.noPropertyInData)(t, s, p, o.ownProperties), () => e.error());
      });
    }
    function b(p, $) {
      e.setParams({ missingProperty: p }), t.forOf(p, n, () => {
        t.assign($, (0, Nr.propertyInData)(t, s, p, o.ownProperties)), t.if((0, Dr.not)($), () => {
          e.error(), t.break();
        });
      }, Dr.nil);
    }
  }
};
ma.default = Pf;
var pa = {};
Object.defineProperty(pa, "__esModule", { value: !0 });
const Mr = te, Nf = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Mr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Mr._)`{limit: ${e}}`
}, Rf = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Nf,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Mr.operators.GT : Mr.operators.LT;
    e.fail$data((0, Mr._)`${r}.length ${s} ${n}`);
  }
};
pa.default = Rf;
var $a = {}, Hr = {};
Object.defineProperty(Hr, "__esModule", { value: !0 });
const rl = Un;
rl.code = 'require("ajv/dist/runtime/equal").default';
Hr.default = rl;
Object.defineProperty($a, "__esModule", { value: !0 });
const hs = Se, Re = te, Of = K, If = Hr, jf = {
  message: ({ params: { i: e, j: t } }) => (0, Re.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Re._)`{i: ${e}, j: ${t}}`
}, Tf = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: jf,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: c, it: o } = e;
    if (!n && !s)
      return;
    const i = t.let("valid"), d = a.items ? (0, hs.getSchemaTypes)(a.items) : [];
    e.block$data(i, u, (0, Re._)`${c} === false`), e.ok(i);
    function u() {
      const $ = t.let("i", (0, Re._)`${r}.length`), g = t.let("j");
      e.setParams({ i: $, j: g }), t.assign(i, !0), t.if((0, Re._)`${$} > 1`, () => (h() ? b : p)($, g));
    }
    function h() {
      return d.length > 0 && !d.some(($) => $ === "object" || $ === "array");
    }
    function b($, g) {
      const v = t.name("item"), m = (0, hs.checkDataTypes)(d, v, o.opts.strictNumbers, hs.DataType.Wrong), w = t.const("indices", (0, Re._)`{}`);
      t.for((0, Re._)`;${$}--;`, () => {
        t.let(v, (0, Re._)`${r}[${$}]`), t.if(m, (0, Re._)`continue`), d.length > 1 && t.if((0, Re._)`typeof ${v} == "string"`, (0, Re._)`${v} += "_"`), t.if((0, Re._)`typeof ${w}[${v}] == "number"`, () => {
          t.assign(g, (0, Re._)`${w}[${v}]`), e.error(), t.assign(i, !1).break();
        }).code((0, Re._)`${w}[${v}] = ${$}`);
      });
    }
    function p($, g) {
      const v = (0, Of.useFunc)(t, If.default), m = t.name("outer");
      t.label(m).for((0, Re._)`;${$}--;`, () => t.for((0, Re._)`${g} = ${$}; ${g}--;`, () => t.if((0, Re._)`${v}(${r}[${$}], ${r}[${g}])`, () => {
        e.error(), t.assign(i, !1).break(m);
      })));
    }
  }
};
$a.default = Tf;
var ya = {};
Object.defineProperty(ya, "__esModule", { value: !0 });
const ks = te, kf = K, Af = Hr, Cf = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, ks._)`{allowedValue: ${e}}`
}, Df = {
  keyword: "const",
  $data: !0,
  error: Cf,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, ks._)`!${(0, kf.useFunc)(t, Af.default)}(${r}, ${s})`) : e.fail((0, ks._)`${a} !== ${r}`);
  }
};
ya.default = Df;
var ga = {};
Object.defineProperty(ga, "__esModule", { value: !0 });
const Tr = te, Mf = K, Lf = Hr, Vf = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Tr._)`{allowedValues: ${e}}`
}, Ff = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Vf,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: c } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const o = s.length >= c.opts.loopEnum;
    let i;
    const d = () => i ?? (i = (0, Mf.useFunc)(t, Lf.default));
    let u;
    if (o || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const p = t.const("vSchema", a);
      u = (0, Tr.or)(...s.map(($, g) => b(p, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (p) => t.if((0, Tr._)`${d()}(${r}, ${p})`, () => t.assign(u, !0).break()));
    }
    function b(p, $) {
      const g = s[$];
      return typeof g == "object" && g !== null ? (0, Tr._)`${d()}(${r}, ${p}[${$}])` : (0, Tr._)`${r} === ${g}`;
    }
  }
};
ga.default = Ff;
Object.defineProperty(ia, "__esModule", { value: !0 });
const zf = ca, qf = la, Uf = ua, Kf = fa, Gf = ha, Hf = ma, Bf = pa, Jf = $a, Wf = ya, Xf = ga, Yf = [
  // number
  zf.default,
  qf.default,
  // string
  Uf.default,
  Kf.default,
  // object
  Gf.default,
  Hf.default,
  // array
  Bf.default,
  Jf.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Wf.default,
  Xf.default
];
ia.default = Yf;
var _a = {}, fr = {};
Object.defineProperty(fr, "__esModule", { value: !0 });
fr.validateAdditionalItems = void 0;
const Ut = te, As = K, Qf = {
  message: ({ params: { len: e } }) => (0, Ut.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ut._)`{limit: ${e}}`
}, Zf = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Qf,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, As.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    nl(e, n);
  }
};
function nl(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: c } = e;
  c.items = !0;
  const o = r.const("len", (0, Ut._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Ut._)`${o} <= ${t.length}`);
  else if (typeof n == "object" && !(0, As.alwaysValidSchema)(c, n)) {
    const d = r.var("valid", (0, Ut._)`${o} <= ${t.length}`);
    r.if((0, Ut.not)(d), () => i(d)), e.ok(d);
  }
  function i(d) {
    r.forRange("i", t.length, o, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: As.Type.Num }, d), c.allErrors || r.if((0, Ut.not)(d), () => r.break());
    });
  }
}
fr.validateAdditionalItems = nl;
fr.default = Zf;
var va = {}, hr = {};
Object.defineProperty(hr, "__esModule", { value: !0 });
hr.validateTuple = void 0;
const ci = te, _n = K, xf = st(), eh = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return sl(e, "additionalItems", t);
    r.items = !0, !(0, _n.alwaysValidSchema)(r, t) && e.ok((0, xf.validateArray)(e));
  }
};
function sl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: c, it: o } = e;
  u(s), o.opts.unevaluated && r.length && o.items !== !0 && (o.items = _n.mergeEvaluated.items(n, r.length, o.items));
  const i = n.name("valid"), d = n.const("len", (0, ci._)`${a}.length`);
  r.forEach((h, b) => {
    (0, _n.alwaysValidSchema)(o, h) || (n.if((0, ci._)`${d} > ${b}`, () => e.subschema({
      keyword: c,
      schemaProp: b,
      dataProp: b
    }, i)), e.ok(i));
  });
  function u(h) {
    const { opts: b, errSchemaPath: p } = o, $ = r.length, g = $ === h.minItems && ($ === h.maxItems || h[t] === !1);
    if (b.strictTuples && !g) {
      const v = `"${c}" is ${$}-tuple, but minItems or maxItems/${t} are not specified or different at path "${p}"`;
      (0, _n.checkStrictMode)(o, v, b.strictTuples);
    }
  }
}
hr.validateTuple = sl;
hr.default = eh;
Object.defineProperty(va, "__esModule", { value: !0 });
const th = hr, rh = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, th.validateTuple)(e, "items")
};
va.default = rh;
var wa = {};
Object.defineProperty(wa, "__esModule", { value: !0 });
const li = te, nh = K, sh = st(), ah = fr, oh = {
  message: ({ params: { len: e } }) => (0, li.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, li._)`{limit: ${e}}`
}, ih = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: oh,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, nh.alwaysValidSchema)(n, t) && (s ? (0, ah.validateAdditionalItems)(e, s) : e.ok((0, sh.validateArray)(e)));
  }
};
wa.default = ih;
var Ea = {};
Object.defineProperty(Ea, "__esModule", { value: !0 });
const Ge = te, Qr = K, ch = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge.str)`must contain at least ${e} valid item(s)` : (0, Ge.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Ge._)`{minContains: ${e}}` : (0, Ge._)`{minContains: ${e}, maxContains: ${t}}`
}, lh = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: ch,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let c, o;
    const { minContains: i, maxContains: d } = n;
    a.opts.next ? (c = i === void 0 ? 1 : i, o = d) : c = 1;
    const u = t.const("len", (0, Ge._)`${s}.length`);
    if (e.setParams({ min: c, max: o }), o === void 0 && c === 0) {
      (0, Qr.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && c > o) {
      (0, Qr.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, Qr.alwaysValidSchema)(a, r)) {
      let g = (0, Ge._)`${u} >= ${c}`;
      o !== void 0 && (g = (0, Ge._)`${g} && ${u} <= ${o}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    o === void 0 && c === 1 ? p(h, () => t.if(h, () => t.break())) : c === 0 ? (t.let(h, !0), o !== void 0 && t.if((0, Ge._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const g = t.name("_valid"), v = t.let("count", 0);
      p(g, () => t.if(g, () => $(v)));
    }
    function p(g, v) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: Qr.Type.Num,
          compositeRule: !0
        }, g), v();
      });
    }
    function $(g) {
      t.code((0, Ge._)`${g}++`), o === void 0 ? t.if((0, Ge._)`${g} >= ${c}`, () => t.assign(h, !0).break()) : (t.if((0, Ge._)`${g} > ${o}`, () => t.assign(h, !1).break()), c === 1 ? t.assign(h, !0) : t.if((0, Ge._)`${g} >= ${c}`, () => t.assign(h, !0)));
    }
  }
};
Ea.default = lh;
var Jn = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = te, r = K, n = st();
  e.error = {
    message: ({ params: { property: i, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${i} is present`;
    },
    params: ({ params: { property: i, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${i},
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
    code(i) {
      const [d, u] = a(i);
      c(i, d), o(i, u);
    }
  };
  function a({ schema: i }) {
    const d = {}, u = {};
    for (const h in i) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(i[h]) ? d : u;
      b[h] = i[h];
    }
    return [d, u];
  }
  function c(i, d = i.schema) {
    const { gen: u, data: h, it: b } = i;
    if (Object.keys(d).length === 0)
      return;
    const p = u.let("missing");
    for (const $ in d) {
      const g = d[$];
      if (g.length === 0)
        continue;
      const v = (0, n.propertyInData)(u, h, $, b.opts.ownProperties);
      i.setParams({
        property: $,
        depsCount: g.length,
        deps: g.join(", ")
      }), b.allErrors ? u.if(v, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(i, m);
      }) : (u.if((0, t._)`${v} && (${(0, n.checkMissingProp)(i, g, p)})`), (0, n.reportMissingProp)(i, p), u.else());
    }
  }
  e.validatePropertyDeps = c;
  function o(i, d = i.schema) {
    const { gen: u, data: h, keyword: b, it: p } = i, $ = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(p, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, p.opts.ownProperties),
        () => {
          const v = i.subschema({ keyword: b, schemaProp: g }, $);
          i.mergeValidEvaluated(v, $);
        },
        () => u.var($, !0)
        // TODO var
      ), i.ok($));
  }
  e.validateSchemaDeps = o, e.default = s;
})(Jn);
var ba = {};
Object.defineProperty(ba, "__esModule", { value: !0 });
const al = te, uh = K, dh = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, al._)`{propertyName: ${e.propertyName}}`
}, fh = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: dh,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, uh.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (c) => {
      e.setParams({ propertyName: c }), e.subschema({
        keyword: "propertyNames",
        data: c,
        dataTypes: ["string"],
        propertyName: c,
        compositeRule: !0
      }, a), t.if((0, al.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
ba.default = fh;
var Wn = {};
Object.defineProperty(Wn, "__esModule", { value: !0 });
const Zr = st(), Qe = te, hh = nt(), xr = K, mh = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Qe._)`{additionalProperty: ${e.additionalProperty}}`
}, ph = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: mh,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: c } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: i } = c;
    if (c.props = !0, i.removeAdditional !== "all" && (0, xr.alwaysValidSchema)(c, r))
      return;
    const d = (0, Zr.allSchemaProperties)(n.properties), u = (0, Zr.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Qe._)`${a} === ${hh.default.errors}`);
    function h() {
      t.forIn("key", s, (v) => {
        !d.length && !u.length ? $(v) : t.if(b(v), () => $(v));
      });
    }
    function b(v) {
      let m;
      if (d.length > 8) {
        const w = (0, xr.schemaRefOrVal)(c, n.properties, "properties");
        m = (0, Zr.isOwnProperty)(t, w, v);
      } else d.length ? m = (0, Qe.or)(...d.map((w) => (0, Qe._)`${v} === ${w}`)) : m = Qe.nil;
      return u.length && (m = (0, Qe.or)(m, ...u.map((w) => (0, Qe._)`${(0, Zr.usePattern)(e, w)}.test(${v})`))), (0, Qe.not)(m);
    }
    function p(v) {
      t.code((0, Qe._)`delete ${s}[${v}]`);
    }
    function $(v) {
      if (i.removeAdditional === "all" || i.removeAdditional && r === !1) {
        p(v);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: v }), e.error(), o || t.break();
        return;
      }
      if (typeof r == "object" && !(0, xr.alwaysValidSchema)(c, r)) {
        const m = t.name("valid");
        i.removeAdditional === "failing" ? (g(v, m, !1), t.if((0, Qe.not)(m), () => {
          e.reset(), p(v);
        })) : (g(v, m), o || t.if((0, Qe.not)(m), () => t.break()));
      }
    }
    function g(v, m, w) {
      const P = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: xr.Type.Str
      };
      w === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
Wn.default = ph;
var Sa = {};
Object.defineProperty(Sa, "__esModule", { value: !0 });
const $h = Kn(), ui = st(), ms = K, di = Wn, yh = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && di.default.code(new $h.KeywordCxt(a, di.default, "additionalProperties"));
    const c = (0, ui.allSchemaProperties)(r);
    for (const h of c)
      a.definedProperties.add(h);
    a.opts.unevaluated && c.length && a.props !== !0 && (a.props = ms.mergeEvaluated.props(t, (0, ms.toHash)(c), a.props));
    const o = c.filter((h) => !(0, ms.alwaysValidSchema)(a, r[h]));
    if (o.length === 0)
      return;
    const i = t.name("valid");
    for (const h of o)
      d(h) ? u(h) : (t.if((0, ui.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(i, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(i);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, i);
    }
  }
};
Sa.default = yh;
var Pa = {};
Object.defineProperty(Pa, "__esModule", { value: !0 });
const fi = st(), en = te, hi = K, mi = K, gh = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: c } = a, o = (0, fi.allSchemaProperties)(r), i = o.filter((g) => (0, hi.alwaysValidSchema)(a, r[g]));
    if (o.length === 0 || i.length === o.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = c.strictSchema && !c.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof en.Name) && (a.props = (0, mi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    b();
    function b() {
      for (const g of o)
        d && p(g), a.allErrors ? $(g) : (t.var(u, !0), $(g), t.if(u));
    }
    function p(g) {
      for (const v in d)
        new RegExp(g).test(v) && (0, hi.checkStrictMode)(a, `property ${v} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function $(g) {
      t.forIn("key", n, (v) => {
        t.if((0, en._)`${(0, fi.usePattern)(e, g)}.test(${v})`, () => {
          const m = i.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: v,
            dataPropType: mi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, en._)`${h}[${v}]`, !0) : !m && !a.allErrors && t.if((0, en.not)(u), () => t.break());
        });
      });
    }
  }
};
Pa.default = gh;
var Na = {};
Object.defineProperty(Na, "__esModule", { value: !0 });
const _h = K, vh = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, _h.alwaysValidSchema)(n, r)) {
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
Na.default = vh;
var Ra = {};
Object.defineProperty(Ra, "__esModule", { value: !0 });
const wh = st(), Eh = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: wh.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Ra.default = Eh;
var Oa = {};
Object.defineProperty(Oa, "__esModule", { value: !0 });
const vn = te, bh = K, Sh = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, vn._)`{passingSchemas: ${e.passing}}`
}, Ph = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Sh,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, c = t.let("valid", !1), o = t.let("passing", null), i = t.name("_valid");
    e.setParams({ passing: o }), t.block(d), e.result(c, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let b;
        (0, bh.alwaysValidSchema)(s, u) ? t.var(i, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, i), h > 0 && t.if((0, vn._)`${i} && ${c}`).assign(c, !1).assign(o, (0, vn._)`[${o}, ${h}]`).else(), t.if(i, () => {
          t.assign(c, !0), t.assign(o, h), b && e.mergeEvaluated(b, vn.Name);
        });
      });
    }
  }
};
Oa.default = Ph;
var Ia = {};
Object.defineProperty(Ia, "__esModule", { value: !0 });
const Nh = K, Rh = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, c) => {
      if ((0, Nh.alwaysValidSchema)(n, a))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: c }, s);
      e.ok(s), e.mergeEvaluated(o);
    });
  }
};
Ia.default = Rh;
var ja = {};
Object.defineProperty(ja, "__esModule", { value: !0 });
const An = te, ol = K, Oh = {
  message: ({ params: e }) => (0, An.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, An._)`{failingKeyword: ${e.ifClause}}`
}, Ih = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: Oh,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, ol.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = pi(n, "then"), a = pi(n, "else");
    if (!s && !a)
      return;
    const c = t.let("valid", !0), o = t.name("_valid");
    if (i(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(o, d("then", u), d("else", u));
    } else s ? t.if(o, d("then")) : t.if((0, An.not)(o), d("else"));
    e.pass(c, () => e.error(!0));
    function i() {
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
        const b = e.subschema({ keyword: u }, o);
        t.assign(c, o), e.mergeValidEvaluated(b, c), h ? t.assign(h, (0, An._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function pi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, ol.alwaysValidSchema)(e, r);
}
ja.default = Ih;
var Ta = {};
Object.defineProperty(Ta, "__esModule", { value: !0 });
const jh = K, Th = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, jh.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Ta.default = Th;
Object.defineProperty(_a, "__esModule", { value: !0 });
const kh = fr, Ah = va, Ch = hr, Dh = wa, Mh = Ea, Lh = Jn, Vh = ba, Fh = Wn, zh = Sa, qh = Pa, Uh = Na, Kh = Ra, Gh = Oa, Hh = Ia, Bh = ja, Jh = Ta;
function Wh(e = !1) {
  const t = [
    // any
    Uh.default,
    Kh.default,
    Gh.default,
    Hh.default,
    Bh.default,
    Jh.default,
    // object
    Vh.default,
    Fh.default,
    Lh.default,
    zh.default,
    qh.default
  ];
  return e ? t.push(Ah.default, Dh.default) : t.push(kh.default, Ch.default), t.push(Mh.default), t;
}
_a.default = Wh;
var ka = {}, mr = {};
Object.defineProperty(mr, "__esModule", { value: !0 });
mr.dynamicAnchor = void 0;
const ps = te, Xh = nt(), $i = De, Yh = wt, Qh = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => il(e, e.schema)
};
function il(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, ps._)`${Xh.default.dynamicAnchors}${(0, ps.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Zh(e);
  r.if((0, ps._)`!${s}`, () => r.assign(s, a));
}
mr.dynamicAnchor = il;
function Zh(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: c, meta: o } = t.root, { schemaId: i } = n.opts, d = new $i.SchemaEnv({ schema: r, schemaId: i, root: s, baseId: a, localRefs: c, meta: o });
  return $i.compileSchema.call(n, d), (0, Yh.getValidate)(e, d);
}
mr.default = Qh;
var pr = {};
Object.defineProperty(pr, "__esModule", { value: !0 });
pr.dynamicRef = void 0;
const yi = te, xh = nt(), gi = wt, em = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => cl(e, e.schema)
};
function cl(e, t) {
  const { gen: r, keyword: n, it: s } = e;
  if (t[0] !== "#")
    throw new Error(`"${n}" only supports hash fragment reference`);
  const a = t.slice(1);
  if (s.allErrors)
    c();
  else {
    const i = r.let("valid", !1);
    c(i), e.ok(i);
  }
  function c(i) {
    if (s.schemaEnv.root.dynamicAnchors[a]) {
      const d = r.let("_v", (0, yi._)`${xh.default.dynamicAnchors}${(0, yi.getProperty)(a)}`);
      r.if(d, o(d, i), o(s.validateName, i));
    } else
      o(s.validateName, i)();
  }
  function o(i, d) {
    return d ? () => r.block(() => {
      (0, gi.callRef)(e, i), r.let(d, !0);
    }) : () => (0, gi.callRef)(e, i);
  }
}
pr.dynamicRef = cl;
pr.default = em;
var Aa = {};
Object.defineProperty(Aa, "__esModule", { value: !0 });
const tm = mr, rm = K, nm = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, tm.dynamicAnchor)(e, "") : (0, rm.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
Aa.default = nm;
var Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const sm = pr, am = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, sm.dynamicRef)(e, e.schema)
};
Ca.default = am;
Object.defineProperty(ka, "__esModule", { value: !0 });
const om = mr, im = pr, cm = Aa, lm = Ca, um = [om.default, im.default, cm.default, lm.default];
ka.default = um;
var Da = {}, Ma = {};
Object.defineProperty(Ma, "__esModule", { value: !0 });
const _i = Jn, dm = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: _i.error,
  code: (e) => (0, _i.validatePropertyDeps)(e)
};
Ma.default = dm;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const fm = Jn, hm = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, fm.validateSchemaDeps)(e)
};
La.default = hm;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const mm = K, pm = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, mm.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
Va.default = pm;
Object.defineProperty(Da, "__esModule", { value: !0 });
const $m = Ma, ym = La, gm = Va, _m = [$m.default, ym.default, gm.default];
Da.default = _m;
var Fa = {}, za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const Ot = te, vi = K, vm = nt(), wm = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, Ot._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Em = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: wm,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: c, props: o } = a;
    o instanceof Ot.Name ? t.if((0, Ot._)`${o} !== true`, () => t.forIn("key", n, (h) => t.if(d(o, h), () => i(h)))) : o !== !0 && t.forIn("key", n, (h) => o === void 0 ? i(h) : t.if(u(o, h), () => i(h))), a.props = !0, e.ok((0, Ot._)`${s} === ${vm.default.errors}`);
    function i(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), c || t.break();
        return;
      }
      if (!(0, vi.alwaysValidSchema)(a, r)) {
        const b = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: vi.Type.Str
        }, b), c || t.if((0, Ot.not)(b), () => t.break());
      }
    }
    function d(h, b) {
      return (0, Ot._)`!${h} || !${h}[${b}]`;
    }
    function u(h, b) {
      const p = [];
      for (const $ in h)
        h[$] === !0 && p.push((0, Ot._)`${b} !== ${$}`);
      return (0, Ot.and)(...p);
    }
  }
};
za.default = Em;
var qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const Kt = te, wi = K, bm = {
  message: ({ params: { len: e } }) => (0, Kt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Kt._)`{limit: ${e}}`
}, Sm = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: bm,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const c = t.const("len", (0, Kt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, Kt._)`${c} > ${a}`);
    else if (typeof r == "object" && !(0, wi.alwaysValidSchema)(s, r)) {
      const i = t.var("valid", (0, Kt._)`${c} <= ${a}`);
      t.if((0, Kt.not)(i), () => o(i, a)), e.ok(i);
    }
    s.items = !0;
    function o(i, d) {
      t.forRange("i", d, c, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: wi.Type.Num }, i), s.allErrors || t.if((0, Kt.not)(i), () => t.break());
      });
    }
  }
};
qa.default = Sm;
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Pm = za, Nm = qa, Rm = [Pm.default, Nm.default];
Fa.default = Rm;
var Ua = {}, Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Ee = te, Om = {
  message: ({ schemaCode: e }) => (0, Ee.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, Ee._)`{format: ${e}}`
}, Im = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: Om,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: c, it: o } = e, { opts: i, errSchemaPath: d, schemaEnv: u, self: h } = o;
    if (!i.validateFormats)
      return;
    s ? b() : p();
    function b() {
      const $ = r.scopeValue("formats", {
        ref: h.formats,
        code: i.code.formats
      }), g = r.const("fDef", (0, Ee._)`${$}[${c}]`), v = r.let("fType"), m = r.let("format");
      r.if((0, Ee._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(v, (0, Ee._)`${g}.type || "string"`).assign(m, (0, Ee._)`${g}.validate`), () => r.assign(v, (0, Ee._)`"string"`).assign(m, g)), e.fail$data((0, Ee.or)(w(), P()));
      function w() {
        return i.strictSchema === !1 ? Ee.nil : (0, Ee._)`${c} && !${m}`;
      }
      function P() {
        const j = u.$async ? (0, Ee._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, Ee._)`${m}(${n})`, k = (0, Ee._)`(typeof ${m} == "function" ? ${j} : ${m}.test(${n}))`;
        return (0, Ee._)`${m} && ${m} !== true && ${v} === ${t} && !${k}`;
      }
    }
    function p() {
      const $ = h.formats[a];
      if (!$) {
        w();
        return;
      }
      if ($ === !0)
        return;
      const [g, v, m] = P($);
      g === t && e.pass(j());
      function w() {
        if (i.strictSchema === !1) {
          h.logger.warn(k());
          return;
        }
        throw new Error(k());
        function k() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(k) {
        const V = k instanceof RegExp ? (0, Ee.regexpCode)(k) : i.code.formats ? (0, Ee._)`${i.code.formats}${(0, Ee.getProperty)(a)}` : void 0, q = r.scopeValue("formats", { key: a, ref: k, code: V });
        return typeof k == "object" && !(k instanceof RegExp) ? [k.type || "string", k.validate, (0, Ee._)`${q}.validate`] : ["string", k, q];
      }
      function j() {
        if (typeof $ == "object" && !($ instanceof RegExp) && $.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, Ee._)`await ${m}(${n})`;
        }
        return typeof v == "function" ? (0, Ee._)`${m}(${n})` : (0, Ee._)`${m}.test(${n})`;
      }
    }
  }
};
Ka.default = Im;
Object.defineProperty(Ua, "__esModule", { value: !0 });
const jm = Ka, Tm = [jm.default];
Ua.default = Tm;
var lr = {};
Object.defineProperty(lr, "__esModule", { value: !0 });
lr.contentVocabulary = lr.metadataVocabulary = void 0;
lr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
lr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(sa, "__esModule", { value: !0 });
const km = aa, Am = ia, Cm = _a, Dm = ka, Mm = Da, Lm = Fa, Vm = Ua, Ei = lr, Fm = [
  Dm.default,
  km.default,
  Am.default,
  (0, Cm.default)(!0),
  Vm.default,
  Ei.metadataVocabulary,
  Ei.contentVocabulary,
  Mm.default,
  Lm.default
];
sa.default = Fm;
var Ga = {}, Xn = {};
Object.defineProperty(Xn, "__esModule", { value: !0 });
Xn.DiscrError = void 0;
var bi;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(bi || (Xn.DiscrError = bi = {}));
Object.defineProperty(Ga, "__esModule", { value: !0 });
const rr = te, Cs = Xn, Si = De, zm = dr, qm = K, Um = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Cs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, rr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, Km = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Um,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: c } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = n.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!c)
      throw new Error("discriminator: requires oneOf keyword");
    const i = t.let("valid", !1), d = t.const("tag", (0, rr._)`${r}${(0, rr.getProperty)(o)}`);
    t.if((0, rr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Cs.DiscrError.Tag, tag: d, tagName: o })), e.ok(i);
    function u() {
      const p = b();
      t.if(!1);
      for (const $ in p)
        t.elseIf((0, rr._)`${d} === ${$}`), t.assign(i, h(p[$]));
      t.else(), e.error(!1, { discrError: Cs.DiscrError.Mapping, tag: d, tagName: o }), t.endIf();
    }
    function h(p) {
      const $ = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: p }, $);
      return e.mergeEvaluated(g, rr.Name), $;
    }
    function b() {
      var p;
      const $ = {}, g = m(s);
      let v = !0;
      for (let j = 0; j < c.length; j++) {
        let k = c[j];
        if (k != null && k.$ref && !(0, qm.schemaHasRulesButRef)(k, a.self.RULES)) {
          const q = k.$ref;
          if (k = Si.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, q), k instanceof Si.SchemaEnv && (k = k.schema), k === void 0)
            throw new zm.default(a.opts.uriResolver, a.baseId, q);
        }
        const V = (p = k == null ? void 0 : k.properties) === null || p === void 0 ? void 0 : p[o];
        if (typeof V != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        v = v && (g || m(k)), w(V, j);
      }
      if (!v)
        throw new Error(`discriminator: "${o}" must be required`);
      return $;
      function m({ required: j }) {
        return Array.isArray(j) && j.includes(o);
      }
      function w(j, k) {
        if (j.const)
          P(j.const, k);
        else if (j.enum)
          for (const V of j.enum)
            P(V, k);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function P(j, k) {
        if (typeof j != "string" || j in $)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        $[j] = k;
      }
    }
  }
};
Ga.default = Km;
var Ha = {};
const Gm = "https://json-schema.org/draft/2020-12/schema", Hm = "https://json-schema.org/draft/2020-12/schema", Bm = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, Jm = "meta", Wm = "Core and Validation specifications meta-schema", Xm = [
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
], Ym = [
  "object",
  "boolean"
], Qm = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Zm = {
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
}, xm = {
  $schema: Gm,
  $id: Hm,
  $vocabulary: Bm,
  $dynamicAnchor: Jm,
  title: Wm,
  allOf: Xm,
  type: Ym,
  $comment: Qm,
  properties: Zm
}, ep = "https://json-schema.org/draft/2020-12/schema", tp = "https://json-schema.org/draft/2020-12/meta/applicator", rp = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, np = "meta", sp = "Applicator vocabulary meta-schema", ap = [
  "object",
  "boolean"
], op = {
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
}, ip = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, cp = {
  $schema: ep,
  $id: tp,
  $vocabulary: rp,
  $dynamicAnchor: np,
  title: sp,
  type: ap,
  properties: op,
  $defs: ip
}, lp = "https://json-schema.org/draft/2020-12/schema", up = "https://json-schema.org/draft/2020-12/meta/unevaluated", dp = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, fp = "meta", hp = "Unevaluated applicator vocabulary meta-schema", mp = [
  "object",
  "boolean"
], pp = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, $p = {
  $schema: lp,
  $id: up,
  $vocabulary: dp,
  $dynamicAnchor: fp,
  title: hp,
  type: mp,
  properties: pp
}, yp = "https://json-schema.org/draft/2020-12/schema", gp = "https://json-schema.org/draft/2020-12/meta/content", _p = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, vp = "meta", wp = "Content vocabulary meta-schema", Ep = [
  "object",
  "boolean"
], bp = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Sp = {
  $schema: yp,
  $id: gp,
  $vocabulary: _p,
  $dynamicAnchor: vp,
  title: wp,
  type: Ep,
  properties: bp
}, Pp = "https://json-schema.org/draft/2020-12/schema", Np = "https://json-schema.org/draft/2020-12/meta/core", Rp = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, Op = "meta", Ip = "Core vocabulary meta-schema", jp = [
  "object",
  "boolean"
], Tp = {
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
}, kp = {
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
}, Ap = {
  $schema: Pp,
  $id: Np,
  $vocabulary: Rp,
  $dynamicAnchor: Op,
  title: Ip,
  type: jp,
  properties: Tp,
  $defs: kp
}, Cp = "https://json-schema.org/draft/2020-12/schema", Dp = "https://json-schema.org/draft/2020-12/meta/format-annotation", Mp = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, Lp = "meta", Vp = "Format vocabulary meta-schema for annotation results", Fp = [
  "object",
  "boolean"
], zp = {
  format: {
    type: "string"
  }
}, qp = {
  $schema: Cp,
  $id: Dp,
  $vocabulary: Mp,
  $dynamicAnchor: Lp,
  title: Vp,
  type: Fp,
  properties: zp
}, Up = "https://json-schema.org/draft/2020-12/schema", Kp = "https://json-schema.org/draft/2020-12/meta/meta-data", Gp = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, Hp = "meta", Bp = "Meta-data vocabulary meta-schema", Jp = [
  "object",
  "boolean"
], Wp = {
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
}, Xp = {
  $schema: Up,
  $id: Kp,
  $vocabulary: Gp,
  $dynamicAnchor: Hp,
  title: Bp,
  type: Jp,
  properties: Wp
}, Yp = "https://json-schema.org/draft/2020-12/schema", Qp = "https://json-schema.org/draft/2020-12/meta/validation", Zp = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, xp = "meta", e$ = "Validation vocabulary meta-schema", t$ = [
  "object",
  "boolean"
], r$ = {
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
}, n$ = {
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
}, s$ = {
  $schema: Yp,
  $id: Qp,
  $vocabulary: Zp,
  $dynamicAnchor: xp,
  title: e$,
  type: t$,
  properties: r$,
  $defs: n$
};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const a$ = xm, o$ = cp, i$ = $p, c$ = Sp, l$ = Ap, u$ = qp, d$ = Xp, f$ = s$, h$ = ["/properties"];
function m$(e) {
  return [
    a$,
    o$,
    i$,
    c$,
    l$,
    t(this, u$),
    d$,
    t(this, f$)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, h$) : n;
  }
}
Ha.default = m$;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = Rc, n = sa, s = Ga, a = Ha, c = "https://json-schema.org/draft/2020-12/schema";
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
      $ && (a.default.call(this, p), this.refs["http://json-schema.org/schema"] = c);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
    }
  }
  t.Ajv2020 = o, e.exports = t = o, e.exports.Ajv2020 = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
  var i = Kn();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return i.KeywordCxt;
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
  var u = Gr;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = dr;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Rs, Rs.exports);
var p$ = Rs.exports, Ds = { exports: {} }, ll = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(z, X) {
    return { validate: z, compare: X };
  }
  e.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: t(a, c),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: t(i(!0), d),
    "date-time": t(b(!0), p),
    "iso-time": t(i(), u),
    "iso-date-time": t(b(), $),
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
    regex: ce,
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
    int32: { type: "number", validate: V },
    // signed 64 bit integer
    int64: { type: "number", validate: q },
    // C-type float
    float: { type: "number", validate: x },
    // C-type double
    double: { type: "number", validate: x },
    // hint to the UI to hide input strings
    password: !0,
    // unchecked string payload
    binary: !0
  }, e.fastFormats = {
    ...e.fullFormats,
    date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, c),
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
  function r(z) {
    return z % 4 === 0 && (z % 100 !== 0 || z % 400 === 0);
  }
  const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, s = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function a(z) {
    const X = n.exec(z);
    if (!X)
      return !1;
    const W = +X[1], A = +X[2], L = +X[3];
    return A >= 1 && A <= 12 && L >= 1 && L <= (A === 2 && r(W) ? 29 : s[A]);
  }
  function c(z, X) {
    if (z && X)
      return z > X ? 1 : z < X ? -1 : 0;
  }
  const o = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function i(z) {
    return function(W) {
      const A = o.exec(W);
      if (!A)
        return !1;
      const L = +A[1], H = +A[2], U = +A[3], Q = A[4], G = A[5] === "-" ? -1 : 1, I = +(A[6] || 0), _ = +(A[7] || 0);
      if (I > 23 || _ > 59 || z && !Q)
        return !1;
      if (L <= 23 && H <= 59 && U < 60)
        return !0;
      const R = H - _ * G, E = L - I * G - (R < 0 ? 1 : 0);
      return (E === 23 || E === -1) && (R === 59 || R === -1) && U < 61;
    };
  }
  function d(z, X) {
    if (!(z && X))
      return;
    const W = (/* @__PURE__ */ new Date("2020-01-01T" + z)).valueOf(), A = (/* @__PURE__ */ new Date("2020-01-01T" + X)).valueOf();
    if (W && A)
      return W - A;
  }
  function u(z, X) {
    if (!(z && X))
      return;
    const W = o.exec(z), A = o.exec(X);
    if (W && A)
      return z = W[1] + W[2] + W[3], X = A[1] + A[2] + A[3], z > X ? 1 : z < X ? -1 : 0;
  }
  const h = /t|\s/i;
  function b(z) {
    const X = i(z);
    return function(A) {
      const L = A.split(h);
      return L.length === 2 && a(L[0]) && X(L[1]);
    };
  }
  function p(z, X) {
    if (!(z && X))
      return;
    const W = new Date(z).valueOf(), A = new Date(X).valueOf();
    if (W && A)
      return W - A;
  }
  function $(z, X) {
    if (!(z && X))
      return;
    const [W, A] = z.split(h), [L, H] = X.split(h), U = c(W, L);
    if (U !== void 0)
      return U || d(A, H);
  }
  const g = /\/|:/, v = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(z) {
    return g.test(z) && v.test(z);
  }
  const w = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function P(z) {
    return w.lastIndex = 0, w.test(z);
  }
  const j = -2147483648, k = 2 ** 31 - 1;
  function V(z) {
    return Number.isInteger(z) && z <= k && z >= j;
  }
  function q(z) {
    return Number.isInteger(z);
  }
  function x() {
    return !0;
  }
  const re = /[^\\]\\Z/;
  function ce(z) {
    if (re.test(z))
      return !1;
    try {
      return new RegExp(z), !0;
    } catch {
      return !1;
    }
  }
})(ll);
var ul = {}, Ms = { exports: {} }, dl = {}, mt = {}, Ft = {}, $s = {}, oe = {}, Ur = {};
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
      return (w = this._str) !== null && w !== void 0 ? w : this._str = this._items.reduce((P, j) => `${P}${j}`, "");
    }
    get names() {
      var w;
      return (w = this._names) !== null && w !== void 0 ? w : this._names = this._items.reduce((P, j) => (j instanceof r && (P[j.str] = (P[j.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...w) {
    const P = [m[0]];
    let j = 0;
    for (; j < w.length; )
      o(P, w[j]), P.push(m[++j]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function c(m, ...w) {
    const P = [p(m[0])];
    let j = 0;
    for (; j < w.length; )
      P.push(a), o(P, w[j]), P.push(a, p(m[++j]));
    return i(P), new n(P);
  }
  e.str = c;
  function o(m, w) {
    w instanceof n ? m.push(...w._items) : w instanceof r ? m.push(w) : m.push(h(w));
  }
  e.addCodeArg = o;
  function i(m) {
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
    return w.emptyStr() ? m : m.emptyStr() ? w : c`${m}${w}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : p(Array.isArray(m) ? m.join(",") : m);
  }
  function b(m) {
    return new n(p(m));
  }
  e.stringify = b;
  function p(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = p;
  function $(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = $;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function v(m) {
    return new n(m.toString());
  }
  e.regexpCode = v;
})(Ur);
var Ls = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Ur;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
    }
  }
  var n;
  (function(i) {
    i[i.Started = 0] = "Started", i[i.Completed = 1] = "Completed";
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
  const c = (0, t._)`\n`;
  class o extends s {
    constructor(d) {
      super(d), this._values = {}, this._scope = d.scope, this.opts = { ...d, _n: d.lines ? c : t.nil };
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
      const b = this.toName(d), { prefix: p } = b, $ = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[p];
      if (g) {
        const w = g.get($);
        if (w)
          return w;
      } else
        g = this._values[p] = /* @__PURE__ */ new Map();
      g.set($, b);
      const v = this._scope[p] || (this._scope[p] = []), m = v.length;
      return v[m] = u.ref, b.setValue(u, { property: p, itemIndex: m }), b;
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
      return this._reduceValues(d, (b) => {
        if (b.value === void 0)
          throw new Error(`CodeGen: name "${b}" has no value`);
        return b.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, b) {
      let p = t.nil;
      for (const $ in d) {
        const g = d[$];
        if (!g)
          continue;
        const v = h[$] = h[$] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (v.has(m))
            return;
          v.set(m, n.Started);
          let w = u(m);
          if (w) {
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            p = (0, t._)`${p}${P} ${m} = ${w};${this.opts._n}`;
          } else if (w = b == null ? void 0 : b(m))
            p = (0, t._)`${p}${w}${this.opts._n}`;
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
  const t = Ur, r = Ls;
  var n = Ur;
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
  class c extends a {
    constructor(l, f, N) {
      super(), this.varKind = l, this.name = f, this.rhs = N;
    }
    render({ es5: l, _n: f }) {
      const N = l ? r.varKinds.var : this.varKind, C = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${N} ${this.name}${C};` + f;
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
    constructor(l, f, N) {
      super(), this.lhs = l, this.rhs = f, this.sideEffects = N;
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
      return W(l, this.rhs);
    }
  }
  class i extends o {
    constructor(l, f, N, C) {
      super(l, N, C), this.op = f;
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
  class b extends a {
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
      return this.nodes.reduce((f, N) => f + N.render(l), "");
    }
    optimizeNodes() {
      const { nodes: l } = this;
      let f = l.length;
      for (; f--; ) {
        const N = l[f].optimizeNodes();
        Array.isArray(N) ? l.splice(f, 1, ...N) : N ? l[f] = N : l.splice(f, 1);
      }
      return l.length > 0 ? this : void 0;
    }
    optimizeNames(l, f) {
      const { nodes: N } = this;
      let C = N.length;
      for (; C--; ) {
        const M = N[C];
        M.optimizeNames(l, f) || (L(l, M.names), N.splice(C, 1));
      }
      return N.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((l, f) => X(l, f.names), {});
    }
  }
  class $ extends p {
    render(l) {
      return "{" + l._n + super.render(l) + "}" + l._n;
    }
  }
  class g extends p {
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
        const N = f.optimizeNodes();
        f = this.else = Array.isArray(N) ? new v(N) : N;
      }
      if (f)
        return l === !1 ? f instanceof m ? f : f.nodes : this.nodes.length ? this : new m(H(l), f instanceof m ? [f] : f.nodes);
      if (!(l === !1 || !this.nodes.length))
        return this;
    }
    optimizeNames(l, f) {
      var N;
      if (this.else = (N = this.else) === null || N === void 0 ? void 0 : N.optimizeNames(l, f), !!(super.optimizeNames(l, f) || this.else))
        return this.condition = A(this.condition, l, f), this;
    }
    get names() {
      const l = super.names;
      return W(l, this.condition), this.else && X(l, this.else.names), l;
    }
  }
  m.kind = "if";
  class w extends $ {
  }
  w.kind = "for";
  class P extends w {
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
      return X(super.names, this.iteration.names);
    }
  }
  class j extends w {
    constructor(l, f, N, C) {
      super(), this.varKind = l, this.name = f, this.from = N, this.to = C;
    }
    render(l) {
      const f = l.es5 ? r.varKinds.var : this.varKind, { name: N, from: C, to: M } = this;
      return `for(${f} ${N}=${C}; ${N}<${M}; ${N}++)` + super.render(l);
    }
    get names() {
      const l = W(super.names, this.from);
      return W(l, this.to);
    }
  }
  class k extends w {
    constructor(l, f, N, C) {
      super(), this.loop = l, this.varKind = f, this.name = N, this.iterable = C;
    }
    render(l) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(l);
    }
    optimizeNames(l, f) {
      if (super.optimizeNames(l, f))
        return this.iterable = A(this.iterable, l, f), this;
    }
    get names() {
      return X(super.names, this.iterable.names);
    }
  }
  class V extends $ {
    constructor(l, f, N) {
      super(), this.name = l, this.args = f, this.async = N;
    }
    render(l) {
      return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(l);
    }
  }
  V.kind = "func";
  class q extends p {
    render(l) {
      return "return " + super.render(l);
    }
  }
  q.kind = "return";
  class x extends $ {
    render(l) {
      let f = "try" + super.render(l);
      return this.catch && (f += this.catch.render(l)), this.finally && (f += this.finally.render(l)), f;
    }
    optimizeNodes() {
      var l, f;
      return super.optimizeNodes(), (l = this.catch) === null || l === void 0 || l.optimizeNodes(), (f = this.finally) === null || f === void 0 || f.optimizeNodes(), this;
    }
    optimizeNames(l, f) {
      var N, C;
      return super.optimizeNames(l, f), (N = this.catch) === null || N === void 0 || N.optimizeNames(l, f), (C = this.finally) === null || C === void 0 || C.optimizeNames(l, f), this;
    }
    get names() {
      const l = super.names;
      return this.catch && X(l, this.catch.names), this.finally && X(l, this.finally.names), l;
    }
  }
  class re extends $ {
    constructor(l) {
      super(), this.error = l;
    }
    render(l) {
      return `catch(${this.error})` + super.render(l);
    }
  }
  re.kind = "catch";
  class ce extends $ {
    render(l) {
      return "finally" + super.render(l);
    }
  }
  ce.kind = "finally";
  class z {
    constructor(l, f = {}) {
      this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...f, _n: f.lines ? `
` : "" }, this._extScope = l, this._scope = new r.Scope({ parent: l }), this._nodes = [new g()];
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
      const N = this._extScope.value(l, f);
      return (this._values[N.prefix] || (this._values[N.prefix] = /* @__PURE__ */ new Set())).add(N), N;
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
    _def(l, f, N, C) {
      const M = this._scope.toName(f);
      return N !== void 0 && C && (this._constants[M.str] = N), this._leafNode(new c(l, M, N)), M;
    }
    // `const` declaration (`var` in es5 mode)
    const(l, f, N) {
      return this._def(r.varKinds.const, l, f, N);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(l, f, N) {
      return this._def(r.varKinds.let, l, f, N);
    }
    // `var` declaration with optional assignment
    var(l, f, N) {
      return this._def(r.varKinds.var, l, f, N);
    }
    // assignment code
    assign(l, f, N) {
      return this._leafNode(new o(l, f, N));
    }
    // `+=` code
    add(l, f) {
      return this._leafNode(new i(l, e.operators.ADD, f));
    }
    // appends passed SafeExpr to code or executes Block
    code(l) {
      return typeof l == "function" ? l() : l !== t.nil && this._leafNode(new b(l)), this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...l) {
      const f = ["{"];
      for (const [N, C] of l)
        f.length > 1 && f.push(","), f.push(N), (N !== C || this.opts.es5) && (f.push(":"), (0, t.addCodeArg)(f, C));
      return f.push("}"), new t._Code(f);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(l, f, N) {
      if (this._blockNode(new m(l)), f && N)
        this.code(f).else().code(N).endIf();
      else if (f)
        this.code(f).endIf();
      else if (N)
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
      return this._for(new P(l), f);
    }
    // `for` statement for a range of values
    forRange(l, f, N, C, M = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
      const Y = this._scope.toName(l);
      return this._for(new j(M, Y, f, N), () => C(Y));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(l, f, N, C = r.varKinds.const) {
      const M = this._scope.toName(l);
      if (this.opts.es5) {
        const Y = f instanceof t.Name ? f : this.var("_arr", f);
        return this.forRange("_i", 0, (0, t._)`${Y}.length`, (B) => {
          this.var(M, (0, t._)`${Y}[${B}]`), N(M);
        });
      }
      return this._for(new k("of", C, M, f), () => N(M));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(l, f, N, C = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
      if (this.opts.ownProperties)
        return this.forOf(l, (0, t._)`Object.keys(${f})`, N);
      const M = this._scope.toName(l);
      return this._for(new k("in", C, M, f), () => N(M));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(w);
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
      const f = new q();
      if (this._blockNode(f), this.code(l), f.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(q);
    }
    // `try` statement
    try(l, f, N) {
      if (!f && !N)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const C = new x();
      if (this._blockNode(C), this.code(l), f) {
        const M = this.name("e");
        this._currNode = C.catch = new re(M), f(M);
      }
      return N && (this._currNode = C.finally = new ce(), this.code(N)), this._endBlockNode(re, ce);
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
      const N = this._nodes.length - f;
      if (N < 0 || l !== void 0 && N !== l)
        throw new Error(`CodeGen: wrong number of nodes: ${N} vs ${l} expected`);
      return this._nodes.length = f, this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(l, f = t.nil, N, C) {
      return this._blockNode(new V(l, f, N)), C && this.code(C).endFunc(), this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(V);
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
      const N = this._currNode;
      if (N instanceof l || f && N instanceof f)
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
  e.CodeGen = z;
  function X(E, l) {
    for (const f in l)
      E[f] = (E[f] || 0) + (l[f] || 0);
    return E;
  }
  function W(E, l) {
    return l instanceof t._CodeOrName ? X(E, l.names) : E;
  }
  function A(E, l, f) {
    if (E instanceof t.Name)
      return N(E);
    if (!C(E))
      return E;
    return new t._Code(E._items.reduce((M, Y) => (Y instanceof t.Name && (Y = N(Y)), Y instanceof t._Code ? M.push(...Y._items) : M.push(Y), M), []));
    function N(M) {
      const Y = f[M.str];
      return Y === void 0 || l[M.str] !== 1 ? M : (delete l[M.str], Y);
    }
    function C(M) {
      return M instanceof t._Code && M._items.some((Y) => Y instanceof t.Name && l[Y.str] === 1 && f[Y.str] !== void 0);
    }
  }
  function L(E, l) {
    for (const f in l)
      E[f] = (E[f] || 0) - (l[f] || 0);
  }
  function H(E) {
    return typeof E == "boolean" || typeof E == "number" || E === null ? !E : (0, t._)`!${R(E)}`;
  }
  e.not = H;
  const U = _(e.operators.AND);
  function Q(...E) {
    return E.reduce(U);
  }
  e.and = Q;
  const G = _(e.operators.OR);
  function I(...E) {
    return E.reduce(G);
  }
  e.or = I;
  function _(E) {
    return (l, f) => l === t.nil ? f : f === t.nil ? l : (0, t._)`${R(l)} ${E} ${R(f)}`;
  }
  function R(E) {
    return E instanceof t.Name ? E : (0, t._)`(${E})`;
  }
})(oe);
var J = {};
Object.defineProperty(J, "__esModule", { value: !0 });
J.checkStrictMode = J.getErrorPath = J.Type = J.useFunc = J.setEvaluated = J.evaluatedPropsToName = J.mergeEvaluated = J.eachItem = J.unescapeJsonPointer = J.escapeJsonPointer = J.escapeFragment = J.unescapeFragment = J.schemaRefOrVal = J.schemaHasRulesButRef = J.schemaHasRules = J.checkUnknownRules = J.alwaysValidSchema = J.toHash = void 0;
const $e = oe, $$ = Ur;
function y$(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
J.toHash = y$;
function g$(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (fl(e, t), !hl(t, e.self.RULES.all));
}
J.alwaysValidSchema = g$;
function fl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || $l(e, `unknown keyword: "${a}"`);
}
J.checkUnknownRules = fl;
function hl(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
J.schemaHasRules = hl;
function _$(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
J.schemaHasRulesButRef = _$;
function v$({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, $e._)`${r}`;
  }
  return (0, $e._)`${e}${t}${(0, $e.getProperty)(n)}`;
}
J.schemaRefOrVal = v$;
function w$(e) {
  return ml(decodeURIComponent(e));
}
J.unescapeFragment = w$;
function E$(e) {
  return encodeURIComponent(Ba(e));
}
J.escapeFragment = E$;
function Ba(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
J.escapeJsonPointer = Ba;
function ml(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
J.unescapeJsonPointer = ml;
function b$(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
J.eachItem = b$;
function Pi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, c, o) => {
    const i = c === void 0 ? a : c instanceof $e.Name ? (a instanceof $e.Name ? e(s, a, c) : t(s, a, c), c) : a instanceof $e.Name ? (t(s, c, a), a) : r(a, c);
    return o === $e.Name && !(i instanceof $e.Name) ? n(s, i) : i;
  };
}
J.mergeEvaluated = {
  props: Pi({
    mergeNames: (e, t, r) => e.if((0, $e._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, $e._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, $e._)`${r} || {}`).code((0, $e._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, $e._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, $e._)`${r} || {}`), Ja(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: pl
  }),
  items: Pi({
    mergeNames: (e, t, r) => e.if((0, $e._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, $e._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, $e._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, $e._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function pl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, $e._)`{}`);
  return t !== void 0 && Ja(e, r, t), r;
}
J.evaluatedPropsToName = pl;
function Ja(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, $e._)`${t}${(0, $e.getProperty)(n)}`, !0));
}
J.setEvaluated = Ja;
const Ni = {};
function S$(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: Ni[t.code] || (Ni[t.code] = new $$._Code(t.code))
  });
}
J.useFunc = S$;
var Vs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Vs || (J.Type = Vs = {}));
function P$(e, t, r) {
  if (e instanceof $e.Name) {
    const n = t === Vs.Num;
    return r ? n ? (0, $e._)`"[" + ${e} + "]"` : (0, $e._)`"['" + ${e} + "']"` : n ? (0, $e._)`"/" + ${e}` : (0, $e._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, $e.getProperty)(e).toString() : "/" + Ba(e);
}
J.getErrorPath = P$;
function $l(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
J.checkStrictMode = $l;
var lt = {};
Object.defineProperty(lt, "__esModule", { value: !0 });
const ke = oe, N$ = {
  // validation function arguments
  data: new ke.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new ke.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new ke.Name("instancePath"),
  parentData: new ke.Name("parentData"),
  parentDataProperty: new ke.Name("parentDataProperty"),
  rootData: new ke.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new ke.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new ke.Name("vErrors"),
  // null or array of validation errors
  errors: new ke.Name("errors"),
  // counter of validation errors
  this: new ke.Name("this"),
  // "globals"
  self: new ke.Name("self"),
  scope: new ke.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new ke.Name("json"),
  jsonPos: new ke.Name("jsonPos"),
  jsonLen: new ke.Name("jsonLen"),
  jsonPart: new ke.Name("jsonPart")
};
lt.default = N$;
var Ri;
function Yn() {
  return Ri || (Ri = 1, function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = oe, r = J, n = lt;
    e.keywordError = {
      message: ({ keyword: v }) => (0, t.str)`must pass "${v}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: v, schemaType: m }) => m ? (0, t.str)`"${v}" keyword must be ${m} ($data)` : (0, t.str)`"${v}" keyword is invalid ($data)`
    };
    function s(v, m = e.keywordError, w, P) {
      const { it: j } = v, { gen: k, compositeRule: V, allErrors: q } = j, x = h(v, m, w);
      P ?? (V || q) ? i(k, x) : d(j, (0, t._)`[${x}]`);
    }
    e.reportError = s;
    function a(v, m = e.keywordError, w) {
      const { it: P } = v, { gen: j, compositeRule: k, allErrors: V } = P, q = h(v, m, w);
      i(j, q), k || V || d(P, n.default.vErrors);
    }
    e.reportExtraError = a;
    function c(v, m) {
      v.assign(n.default.errors, m), v.if((0, t._)`${n.default.vErrors} !== null`, () => v.if(m, () => v.assign((0, t._)`${n.default.vErrors}.length`, m), () => v.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = c;
    function o({ gen: v, keyword: m, schemaValue: w, data: P, errsCount: j, it: k }) {
      if (j === void 0)
        throw new Error("ajv implementation error");
      const V = v.name("err");
      v.forRange("i", j, n.default.errors, (q) => {
        v.const(V, (0, t._)`${n.default.vErrors}[${q}]`), v.if((0, t._)`${V}.instancePath === undefined`, () => v.assign((0, t._)`${V}.instancePath`, (0, t.strConcat)(n.default.instancePath, k.errorPath))), v.assign((0, t._)`${V}.schemaPath`, (0, t.str)`${k.errSchemaPath}/${m}`), k.opts.verbose && (v.assign((0, t._)`${V}.schema`, w), v.assign((0, t._)`${V}.data`, P));
      });
    }
    e.extendErrors = o;
    function i(v, m) {
      const w = v.const("err", m);
      v.if((0, t._)`${n.default.vErrors} === null`, () => v.assign(n.default.vErrors, (0, t._)`[${w}]`), (0, t._)`${n.default.vErrors}.push(${w})`), v.code((0, t._)`${n.default.errors}++`);
    }
    function d(v, m) {
      const { gen: w, validateName: P, schemaEnv: j } = v;
      j.$async ? w.throw((0, t._)`new ${v.ValidationError}(${m})`) : (w.assign((0, t._)`${P}.errors`, m), w.return(!1));
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
    function h(v, m, w) {
      const { createErrors: P } = v.it;
      return P === !1 ? (0, t._)`{}` : b(v, m, w);
    }
    function b(v, m, w = {}) {
      const { gen: P, it: j } = v, k = [
        p(j, w),
        $(v, w)
      ];
      return g(v, m, k), P.object(...k);
    }
    function p({ errorPath: v }, { instancePath: m }) {
      const w = m ? (0, t.str)`${v}${(0, r.getErrorPath)(m, r.Type.Str)}` : v;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, w)];
    }
    function $({ keyword: v, it: { errSchemaPath: m } }, { schemaPath: w, parentSchema: P }) {
      let j = P ? m : (0, t.str)`${m}/${v}`;
      return w && (j = (0, t.str)`${j}${(0, r.getErrorPath)(w, r.Type.Str)}`), [u.schemaPath, j];
    }
    function g(v, { params: m, message: w }, P) {
      const { keyword: j, data: k, schemaValue: V, it: q } = v, { opts: x, propertyName: re, topSchemaRef: ce, schemaPath: z } = q;
      P.push([u.keyword, j], [u.params, typeof m == "function" ? m(v) : m || (0, t._)`{}`]), x.messages && P.push([u.message, typeof w == "function" ? w(v) : w]), x.verbose && P.push([u.schema, V], [u.parentSchema, (0, t._)`${ce}${z}`], [n.default.data, k]), re && P.push([u.propertyName, re]);
    }
  }($s)), $s;
}
var Oi;
function R$() {
  if (Oi) return Ft;
  Oi = 1, Object.defineProperty(Ft, "__esModule", { value: !0 }), Ft.boolOrEmptySchema = Ft.topBoolOrEmptySchema = void 0;
  const e = Yn(), t = oe, r = lt, n = {
    message: "boolean schema is false"
  };
  function s(o) {
    const { gen: i, schema: d, validateName: u } = o;
    d === !1 ? c(o, !1) : typeof d == "object" && d.$async === !0 ? i.return(r.default.data) : (i.assign((0, t._)`${u}.errors`, null), i.return(!0));
  }
  Ft.topBoolOrEmptySchema = s;
  function a(o, i) {
    const { gen: d, schema: u } = o;
    u === !1 ? (d.var(i, !1), c(o)) : d.var(i, !0);
  }
  Ft.boolOrEmptySchema = a;
  function c(o, i) {
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
    (0, e.reportError)(h, n, void 0, i);
  }
  return Ft;
}
var Pe = {}, Xt = {};
Object.defineProperty(Xt, "__esModule", { value: !0 });
Xt.getRules = Xt.isJSONType = void 0;
const O$ = ["string", "number", "integer", "boolean", "null", "object", "array"], I$ = new Set(O$);
function j$(e) {
  return typeof e == "string" && I$.has(e);
}
Xt.isJSONType = j$;
function T$() {
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
Xt.getRules = T$;
var _t = {};
Object.defineProperty(_t, "__esModule", { value: !0 });
_t.shouldUseRule = _t.shouldUseGroup = _t.schemaHasRulesForType = void 0;
function k$({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && yl(e, n);
}
_t.schemaHasRulesForType = k$;
function yl(e, t) {
  return t.rules.some((r) => gl(e, r));
}
_t.shouldUseGroup = yl;
function gl(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
_t.shouldUseRule = gl;
Object.defineProperty(Pe, "__esModule", { value: !0 });
Pe.reportTypeError = Pe.checkDataTypes = Pe.checkDataType = Pe.coerceAndCheckDataType = Pe.getJSONTypes = Pe.getSchemaTypes = Pe.DataType = void 0;
const A$ = Xt, C$ = _t, D$ = Yn(), se = oe, _l = J;
var ir;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(ir || (Pe.DataType = ir = {}));
function M$(e) {
  const t = vl(e.type);
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
Pe.getSchemaTypes = M$;
function vl(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(A$.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Pe.getJSONTypes = vl;
function L$(e, t) {
  const { gen: r, data: n, opts: s } = e, a = V$(t, s.coerceTypes), c = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, C$.schemaHasRulesForType)(e, t[0]));
  if (c) {
    const o = Wa(t, n, s.strictNumbers, ir.Wrong);
    r.if(o, () => {
      a.length ? F$(e, t, a) : Xa(e);
    });
  }
  return c;
}
Pe.coerceAndCheckDataType = L$;
const wl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function V$(e, t) {
  return t ? e.filter((r) => wl.has(r) || t === "array" && r === "array") : [];
}
function F$(e, t, r) {
  const { gen: n, data: s, opts: a } = e, c = n.let("dataType", (0, se._)`typeof ${s}`), o = n.let("coerced", (0, se._)`undefined`);
  a.coerceTypes === "array" && n.if((0, se._)`${c} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, se._)`${s}[0]`).assign(c, (0, se._)`typeof ${s}`).if(Wa(t, s, a.strictNumbers), () => n.assign(o, s))), n.if((0, se._)`${o} !== undefined`);
  for (const d of r)
    (wl.has(d) || d === "array" && a.coerceTypes === "array") && i(d);
  n.else(), Xa(e), n.endIf(), n.if((0, se._)`${o} !== undefined`, () => {
    n.assign(s, o), z$(e, o);
  });
  function i(d) {
    switch (d) {
      case "string":
        n.elseIf((0, se._)`${c} == "number" || ${c} == "boolean"`).assign(o, (0, se._)`"" + ${s}`).elseIf((0, se._)`${s} === null`).assign(o, (0, se._)`""`);
        return;
      case "number":
        n.elseIf((0, se._)`${c} == "boolean" || ${s} === null
              || (${c} == "string" && ${s} && ${s} == +${s})`).assign(o, (0, se._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, se._)`${c} === "boolean" || ${s} === null
              || (${c} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(o, (0, se._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, se._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(o, !1).elseIf((0, se._)`${s} === "true" || ${s} === 1`).assign(o, !0);
        return;
      case "null":
        n.elseIf((0, se._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(o, null);
        return;
      case "array":
        n.elseIf((0, se._)`${c} === "string" || ${c} === "number"
              || ${c} === "boolean" || ${s} === null`).assign(o, (0, se._)`[${s}]`);
    }
  }
}
function z$({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, se._)`${t} !== undefined`, () => e.assign((0, se._)`${t}[${r}]`, n));
}
function Fs(e, t, r, n = ir.Correct) {
  const s = n === ir.Correct ? se.operators.EQ : se.operators.NEQ;
  let a;
  switch (e) {
    case "null":
      return (0, se._)`${t} ${s} null`;
    case "array":
      a = (0, se._)`Array.isArray(${t})`;
      break;
    case "object":
      a = (0, se._)`${t} && typeof ${t} == "object" && !Array.isArray(${t})`;
      break;
    case "integer":
      a = c((0, se._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = c();
      break;
    default:
      return (0, se._)`typeof ${t} ${s} ${e}`;
  }
  return n === ir.Correct ? a : (0, se.not)(a);
  function c(o = se.nil) {
    return (0, se.and)((0, se._)`typeof ${t} == "number"`, o, r ? (0, se._)`isFinite(${t})` : se.nil);
  }
}
Pe.checkDataType = Fs;
function Wa(e, t, r, n) {
  if (e.length === 1)
    return Fs(e[0], t, r, n);
  let s;
  const a = (0, _l.toHash)(e);
  if (a.array && a.object) {
    const c = (0, se._)`typeof ${t} != "object"`;
    s = a.null ? c : (0, se._)`!${t} || ${c}`, delete a.null, delete a.array, delete a.object;
  } else
    s = se.nil;
  a.number && delete a.integer;
  for (const c in a)
    s = (0, se.and)(s, Fs(c, t, r, n));
  return s;
}
Pe.checkDataTypes = Wa;
const q$ = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, se._)`{type: ${e}}` : (0, se._)`{type: ${t}}`
};
function Xa(e) {
  const t = U$(e);
  (0, D$.reportError)(t, q$);
}
Pe.reportTypeError = Xa;
function U$(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, _l.schemaRefOrVal)(e, n, "type");
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
var Rr = {}, Ii;
function K$() {
  if (Ii) return Rr;
  Ii = 1, Object.defineProperty(Rr, "__esModule", { value: !0 }), Rr.assignDefaults = void 0;
  const e = oe, t = J;
  function r(s, a) {
    const { properties: c, items: o } = s.schema;
    if (a === "object" && c)
      for (const i in c)
        n(s, i, c[i].default);
    else a === "array" && Array.isArray(o) && o.forEach((i, d) => n(s, d, i.default));
  }
  Rr.assignDefaults = r;
  function n(s, a, c) {
    const { gen: o, compositeRule: i, data: d, opts: u } = s;
    if (c === void 0)
      return;
    const h = (0, e._)`${d}${(0, e.getProperty)(a)}`;
    if (i) {
      (0, t.checkStrictMode)(s, `default is ignored for: ${h}`);
      return;
    }
    let b = (0, e._)`${h} === undefined`;
    u.useDefaults === "empty" && (b = (0, e._)`${b} || ${h} === null || ${h} === ""`), o.if(b, (0, e._)`${h} = ${(0, e.stringify)(c)}`);
  }
  return Rr;
}
var Xe = {}, ie = {};
Object.defineProperty(ie, "__esModule", { value: !0 });
ie.validateUnion = ie.validateArray = ie.usePattern = ie.callValidateCode = ie.schemaProperties = ie.allSchemaProperties = ie.noPropertyInData = ie.propertyInData = ie.isOwnProperty = ie.hasPropFunc = ie.reportMissingProp = ie.checkMissingProp = ie.checkReportMissingProp = void 0;
const ge = oe, Ya = J, Nt = lt, G$ = J;
function H$(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(Za(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, ge._)`${t}` }, !0), e.error();
  });
}
ie.checkReportMissingProp = H$;
function B$({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, ge.or)(...n.map((a) => (0, ge.and)(Za(e, t, a, r.ownProperties), (0, ge._)`${s} = ${a}`)));
}
ie.checkMissingProp = B$;
function J$(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ie.reportMissingProp = J$;
function El(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, ge._)`Object.prototype.hasOwnProperty`
  });
}
ie.hasPropFunc = El;
function Qa(e, t, r) {
  return (0, ge._)`${El(e)}.call(${t}, ${r})`;
}
ie.isOwnProperty = Qa;
function W$(e, t, r, n) {
  const s = (0, ge._)`${t}${(0, ge.getProperty)(r)} !== undefined`;
  return n ? (0, ge._)`${s} && ${Qa(e, t, r)}` : s;
}
ie.propertyInData = W$;
function Za(e, t, r, n) {
  const s = (0, ge._)`${t}${(0, ge.getProperty)(r)} === undefined`;
  return n ? (0, ge.or)(s, (0, ge.not)(Qa(e, t, r))) : s;
}
ie.noPropertyInData = Za;
function bl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ie.allSchemaProperties = bl;
function X$(e, t) {
  return bl(t).filter((r) => !(0, Ya.alwaysValidSchema)(e, t[r]));
}
ie.schemaProperties = X$;
function Y$({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: c }, o, i, d) {
  const u = d ? (0, ge._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Nt.default.instancePath, (0, ge.strConcat)(Nt.default.instancePath, a)],
    [Nt.default.parentData, c.parentData],
    [Nt.default.parentDataProperty, c.parentDataProperty],
    [Nt.default.rootData, Nt.default.rootData]
  ];
  c.opts.dynamicRef && h.push([Nt.default.dynamicAnchors, Nt.default.dynamicAnchors]);
  const b = (0, ge._)`${u}, ${r.object(...h)}`;
  return i !== ge.nil ? (0, ge._)`${o}.call(${i}, ${b})` : (0, ge._)`${o}(${b})`;
}
ie.callValidateCode = Y$;
const Q$ = (0, ge._)`new RegExp`;
function Z$({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, ge._)`${s.code === "new RegExp" ? Q$ : (0, G$.useFunc)(e, s)}(${r}, ${n})`
  });
}
ie.usePattern = Z$;
function x$(e) {
  const { gen: t, data: r, keyword: n, it: s } = e, a = t.name("valid");
  if (s.allErrors) {
    const o = t.let("valid", !0);
    return c(() => t.assign(o, !1)), o;
  }
  return t.var(a, !0), c(() => t.break()), a;
  function c(o) {
    const i = t.const("len", (0, ge._)`${r}.length`);
    t.forRange("i", 0, i, (d) => {
      e.subschema({
        keyword: n,
        dataProp: d,
        dataPropType: Ya.Type.Num
      }, a), t.if((0, ge.not)(a), o);
    });
  }
}
ie.validateArray = x$;
function ey(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((i) => (0, Ya.alwaysValidSchema)(s, i)) && !s.opts.unevaluated)
    return;
  const c = t.let("valid", !1), o = t.name("_valid");
  t.block(() => r.forEach((i, d) => {
    const u = e.subschema({
      keyword: n,
      schemaProp: d,
      compositeRule: !0
    }, o);
    t.assign(c, (0, ge._)`${c} || ${o}`), e.mergeValidEvaluated(u, o) || t.if((0, ge.not)(c));
  })), e.result(c, () => e.reset(), () => e.error(!0));
}
ie.validateUnion = ey;
var ji;
function ty() {
  if (ji) return Xe;
  ji = 1, Object.defineProperty(Xe, "__esModule", { value: !0 }), Xe.validateKeywordUsage = Xe.validSchemaType = Xe.funcKeywordCode = Xe.macroKeywordCode = void 0;
  const e = oe, t = lt, r = ie, n = Yn();
  function s(b, p) {
    const { gen: $, keyword: g, schema: v, parentSchema: m, it: w } = b, P = p.macro.call(w.self, v, m, w), j = d($, g, P);
    w.opts.validateSchema !== !1 && w.self.validateSchema(P, !0);
    const k = $.name("valid");
    b.subschema({
      schema: P,
      schemaPath: e.nil,
      errSchemaPath: `${w.errSchemaPath}/${g}`,
      topSchemaRef: j,
      compositeRule: !0
    }, k), b.pass(k, () => b.error(!0));
  }
  Xe.macroKeywordCode = s;
  function a(b, p) {
    var $;
    const { gen: g, keyword: v, schema: m, parentSchema: w, $data: P, it: j } = b;
    i(j, p);
    const k = !P && p.compile ? p.compile.call(j.self, m, w, j) : p.validate, V = d(g, v, k), q = g.let("valid");
    b.block$data(q, x), b.ok(($ = p.valid) !== null && $ !== void 0 ? $ : q);
    function x() {
      if (p.errors === !1)
        z(), p.modifying && c(b), X(() => b.error());
      else {
        const W = p.async ? re() : ce();
        p.modifying && c(b), X(() => o(b, W));
      }
    }
    function re() {
      const W = g.let("ruleErrs", null);
      return g.try(() => z((0, e._)`await `), (A) => g.assign(q, !1).if((0, e._)`${A} instanceof ${j.ValidationError}`, () => g.assign(W, (0, e._)`${A}.errors`), () => g.throw(A))), W;
    }
    function ce() {
      const W = (0, e._)`${V}.errors`;
      return g.assign(W, null), z(e.nil), W;
    }
    function z(W = p.async ? (0, e._)`await ` : e.nil) {
      const A = j.opts.passContext ? t.default.this : t.default.self, L = !("compile" in p && !P || p.schema === !1);
      g.assign(q, (0, e._)`${W}${(0, r.callValidateCode)(b, V, A, L)}`, p.modifying);
    }
    function X(W) {
      var A;
      g.if((0, e.not)((A = p.valid) !== null && A !== void 0 ? A : q), W);
    }
  }
  Xe.funcKeywordCode = a;
  function c(b) {
    const { gen: p, data: $, it: g } = b;
    p.if(g.parentData, () => p.assign($, (0, e._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function o(b, p) {
    const { gen: $ } = b;
    $.if((0, e._)`Array.isArray(${p})`, () => {
      $.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${p} : ${t.default.vErrors}.concat(${p})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(b);
    }, () => b.error());
  }
  function i({ schemaEnv: b }, p) {
    if (p.async && !b.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(b, p, $) {
    if ($ === void 0)
      throw new Error(`keyword "${p}" failed to compile`);
    return b.scopeValue("keyword", typeof $ == "function" ? { ref: $ } : { ref: $, code: (0, e.stringify)($) });
  }
  function u(b, p, $ = !1) {
    return !p.length || p.some((g) => g === "array" ? Array.isArray(b) : g === "object" ? b && typeof b == "object" && !Array.isArray(b) : typeof b == g || $ && typeof b > "u");
  }
  Xe.validSchemaType = u;
  function h({ schema: b, opts: p, self: $, errSchemaPath: g }, v, m) {
    if (Array.isArray(v.keyword) ? !v.keyword.includes(m) : v.keyword !== m)
      throw new Error("ajv implementation error");
    const w = v.dependencies;
    if (w != null && w.some((P) => !Object.prototype.hasOwnProperty.call(b, P)))
      throw new Error(`parent schema must have dependencies of ${m}: ${w.join(",")}`);
    if (v.validateSchema && !v.validateSchema(b[m])) {
      const j = `keyword "${m}" value is invalid at path "${g}": ` + $.errorsText(v.validateSchema.errors);
      if (p.validateSchema === "log")
        $.logger.error(j);
      else
        throw new Error(j);
    }
  }
  return Xe.validateKeywordUsage = h, Xe;
}
var pt = {}, Ti;
function ry() {
  if (Ti) return pt;
  Ti = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.extendSubschemaMode = pt.extendSubschemaData = pt.getSubschema = void 0;
  const e = oe, t = J;
  function r(a, { keyword: c, schemaProp: o, schema: i, schemaPath: d, errSchemaPath: u, topSchemaRef: h }) {
    if (c !== void 0 && i !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (c !== void 0) {
      const b = a.schema[c];
      return o === void 0 ? {
        schema: b,
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${a.errSchemaPath}/${c}`
      } : {
        schema: b[o],
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(c)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${c}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (i !== void 0) {
      if (d === void 0 || u === void 0 || h === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: i,
        schemaPath: d,
        topSchemaRef: h,
        errSchemaPath: u
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  pt.getSubschema = r;
  function n(a, c, { dataProp: o, dataPropType: i, data: d, dataTypes: u, propertyName: h }) {
    if (d !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: b } = c;
    if (o !== void 0) {
      const { errorPath: $, dataPathArr: g, opts: v } = c, m = b.let("data", (0, e._)`${c.data}${(0, e.getProperty)(o)}`, !0);
      p(m), a.errorPath = (0, e.str)`${$}${(0, t.getErrorPath)(o, i, v.jsPropertySyntax)}`, a.parentDataProperty = (0, e._)`${o}`, a.dataPathArr = [...g, a.parentDataProperty];
    }
    if (d !== void 0) {
      const $ = d instanceof e.Name ? d : b.let("data", d, !0);
      p($), h !== void 0 && (a.propertyName = h);
    }
    u && (a.dataTypes = u);
    function p($) {
      a.data = $, a.dataLevel = c.dataLevel + 1, a.dataTypes = [], c.definedProperties = /* @__PURE__ */ new Set(), a.parentData = c.data, a.dataNames = [...c.dataNames, $];
    }
  }
  pt.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: c, jtdMetadata: o, compositeRule: i, createErrors: d, allErrors: u }) {
    i !== void 0 && (a.compositeRule = i), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = c, a.jtdMetadata = o;
  }
  return pt.extendSubschemaMode = s, pt;
}
var je = {}, Sl = { exports: {} }, kt = Sl.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
  };
  wn(t, n, s, e, "", e);
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
function wn(e, t, r, n, s, a, c, o, i, d) {
  if (n && typeof n == "object" && !Array.isArray(n)) {
    t(n, s, a, c, o, i, d);
    for (var u in n) {
      var h = n[u];
      if (Array.isArray(h)) {
        if (u in kt.arrayKeywords)
          for (var b = 0; b < h.length; b++)
            wn(e, t, r, h[b], s + "/" + u + "/" + b, a, s, u, n, b);
      } else if (u in kt.propsKeywords) {
        if (h && typeof h == "object")
          for (var p in h)
            wn(e, t, r, h[p], s + "/" + u + "/" + ny(p), a, s, u, n, p);
      } else (u in kt.keywords || e.allKeys && !(u in kt.skipKeywords)) && wn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, c, o, i, d);
  }
}
function ny(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var sy = Sl.exports;
Object.defineProperty(je, "__esModule", { value: !0 });
je.getSchemaRefs = je.resolveUrl = je.normalizeId = je._getFullPath = je.getFullPath = je.inlineRef = void 0;
const ay = J, oy = Un, iy = sy, cy = /* @__PURE__ */ new Set([
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
function ly(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !zs(e) : t ? Pl(e) <= t : !1;
}
je.inlineRef = ly;
const uy = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function zs(e) {
  for (const t in e) {
    if (uy.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(zs) || typeof r == "object" && zs(r))
      return !0;
  }
  return !1;
}
function Pl(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !cy.has(r) && (typeof e[r] == "object" && (0, ay.eachItem)(e[r], (n) => t += Pl(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function Nl(e, t = "", r) {
  r !== !1 && (t = cr(t));
  const n = e.parse(t);
  return Rl(e, n);
}
je.getFullPath = Nl;
function Rl(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
je._getFullPath = Rl;
const dy = /#\/?$/;
function cr(e) {
  return e ? e.replace(dy, "") : "";
}
je.normalizeId = cr;
function fy(e, t, r) {
  return r = cr(r), e.resolve(t, r);
}
je.resolveUrl = fy;
const hy = /^[a-z_][-a-z0-9._]*$/i;
function my(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = cr(e[r] || t), a = { "": s }, c = Nl(n, s, !1), o = {}, i = /* @__PURE__ */ new Set();
  return iy(e, { allKeys: !0 }, (h, b, p, $) => {
    if ($ === void 0)
      return;
    const g = c + b;
    let v = a[$];
    typeof h[r] == "string" && (v = m.call(this, h[r])), w.call(this, h.$anchor), w.call(this, h.$dynamicAnchor), a[b] = v;
    function m(P) {
      const j = this.opts.uriResolver.resolve;
      if (P = cr(v ? j(v, P) : P), i.has(P))
        throw u(P);
      i.add(P);
      let k = this.refs[P];
      return typeof k == "string" && (k = this.refs[k]), typeof k == "object" ? d(h, k.schema, P) : P !== cr(g) && (P[0] === "#" ? (d(h, o[P], P), o[P] = h) : this.refs[P] = g), P;
    }
    function w(P) {
      if (typeof P == "string") {
        if (!hy.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), o;
  function d(h, b, p) {
    if (b !== void 0 && !oy(h, b))
      throw u(p);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
je.getSchemaRefs = my;
var ki;
function Qn() {
  if (ki) return mt;
  ki = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.getData = mt.KeywordCxt = mt.validateFunctionCode = void 0;
  const e = R$(), t = Pe, r = _t, n = Pe, s = K$(), a = ty(), c = ry(), o = oe, i = lt, d = je, u = J, h = Yn();
  function b(y) {
    if (k(y) && (q(y), j(y))) {
      v(y);
      return;
    }
    p(y, () => (0, e.topBoolOrEmptySchema)(y));
  }
  mt.validateFunctionCode = b;
  function p({ gen: y, validateName: S, schema: O, schemaEnv: T, opts: D }, F) {
    D.code.es5 ? y.func(S, (0, o._)`${i.default.data}, ${i.default.valCxt}`, T.$async, () => {
      y.code((0, o._)`"use strict"; ${w(O, D)}`), g(y, D), y.code(F);
    }) : y.func(S, (0, o._)`${i.default.data}, ${$(D)}`, T.$async, () => y.code(w(O, D)).code(F));
  }
  function $(y) {
    return (0, o._)`{${i.default.instancePath}="", ${i.default.parentData}, ${i.default.parentDataProperty}, ${i.default.rootData}=${i.default.data}${y.dynamicRef ? (0, o._)`, ${i.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function g(y, S) {
    y.if(i.default.valCxt, () => {
      y.var(i.default.instancePath, (0, o._)`${i.default.valCxt}.${i.default.instancePath}`), y.var(i.default.parentData, (0, o._)`${i.default.valCxt}.${i.default.parentData}`), y.var(i.default.parentDataProperty, (0, o._)`${i.default.valCxt}.${i.default.parentDataProperty}`), y.var(i.default.rootData, (0, o._)`${i.default.valCxt}.${i.default.rootData}`), S.dynamicRef && y.var(i.default.dynamicAnchors, (0, o._)`${i.default.valCxt}.${i.default.dynamicAnchors}`);
    }, () => {
      y.var(i.default.instancePath, (0, o._)`""`), y.var(i.default.parentData, (0, o._)`undefined`), y.var(i.default.parentDataProperty, (0, o._)`undefined`), y.var(i.default.rootData, i.default.data), S.dynamicRef && y.var(i.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function v(y) {
    const { schema: S, opts: O, gen: T } = y;
    p(y, () => {
      O.$comment && S.$comment && W(y), ce(y), T.let(i.default.vErrors, null), T.let(i.default.errors, 0), O.unevaluated && m(y), x(y), A(y);
    });
  }
  function m(y) {
    const { gen: S, validateName: O } = y;
    y.evaluated = S.const("evaluated", (0, o._)`${O}.evaluated`), S.if((0, o._)`${y.evaluated}.dynamicProps`, () => S.assign((0, o._)`${y.evaluated}.props`, (0, o._)`undefined`)), S.if((0, o._)`${y.evaluated}.dynamicItems`, () => S.assign((0, o._)`${y.evaluated}.items`, (0, o._)`undefined`));
  }
  function w(y, S) {
    const O = typeof y == "object" && y[S.schemaId];
    return O && (S.code.source || S.code.process) ? (0, o._)`/*# sourceURL=${O} */` : o.nil;
  }
  function P(y, S) {
    if (k(y) && (q(y), j(y))) {
      V(y, S);
      return;
    }
    (0, e.boolOrEmptySchema)(y, S);
  }
  function j({ schema: y, self: S }) {
    if (typeof y == "boolean")
      return !y;
    for (const O in y)
      if (S.RULES.all[O])
        return !0;
    return !1;
  }
  function k(y) {
    return typeof y.schema != "boolean";
  }
  function V(y, S) {
    const { schema: O, gen: T, opts: D } = y;
    D.$comment && O.$comment && W(y), z(y), X(y);
    const F = T.const("_errs", i.default.errors);
    x(y, F), T.var(S, (0, o._)`${F} === ${i.default.errors}`);
  }
  function q(y) {
    (0, u.checkUnknownRules)(y), re(y);
  }
  function x(y, S) {
    if (y.opts.jtd)
      return H(y, [], !1, S);
    const O = (0, t.getSchemaTypes)(y.schema), T = (0, t.coerceAndCheckDataType)(y, O);
    H(y, O, !T, S);
  }
  function re(y) {
    const { schema: S, errSchemaPath: O, opts: T, self: D } = y;
    S.$ref && T.ignoreKeywordsWithRef && (0, u.schemaHasRulesButRef)(S, D.RULES) && D.logger.warn(`$ref: keywords ignored in schema at path "${O}"`);
  }
  function ce(y) {
    const { schema: S, opts: O } = y;
    S.default !== void 0 && O.useDefaults && O.strictSchema && (0, u.checkStrictMode)(y, "default is ignored in the schema root");
  }
  function z(y) {
    const S = y.schema[y.opts.schemaId];
    S && (y.baseId = (0, d.resolveUrl)(y.opts.uriResolver, y.baseId, S));
  }
  function X(y) {
    if (y.schema.$async && !y.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function W({ gen: y, schemaEnv: S, schema: O, errSchemaPath: T, opts: D }) {
    const F = O.$comment;
    if (D.$comment === !0)
      y.code((0, o._)`${i.default.self}.logger.log(${F})`);
    else if (typeof D.$comment == "function") {
      const le = (0, o.str)`${T}/$comment`, we = y.scopeValue("root", { ref: S.root });
      y.code((0, o._)`${i.default.self}.opts.$comment(${F}, ${le}, ${we}.schema)`);
    }
  }
  function A(y) {
    const { gen: S, schemaEnv: O, validateName: T, ValidationError: D, opts: F } = y;
    O.$async ? S.if((0, o._)`${i.default.errors} === 0`, () => S.return(i.default.data), () => S.throw((0, o._)`new ${D}(${i.default.vErrors})`)) : (S.assign((0, o._)`${T}.errors`, i.default.vErrors), F.unevaluated && L(y), S.return((0, o._)`${i.default.errors} === 0`));
  }
  function L({ gen: y, evaluated: S, props: O, items: T }) {
    O instanceof o.Name && y.assign((0, o._)`${S}.props`, O), T instanceof o.Name && y.assign((0, o._)`${S}.items`, T);
  }
  function H(y, S, O, T) {
    const { gen: D, schema: F, data: le, allErrors: we, opts: de, self: fe } = y, { RULES: ue } = fe;
    if (F.$ref && (de.ignoreKeywordsWithRef || !(0, u.schemaHasRulesButRef)(F, ue))) {
      D.block(() => C(y, "$ref", ue.all.$ref.definition));
      return;
    }
    de.jtd || Q(y, S), D.block(() => {
      for (const ye of ue.rules)
        ze(ye);
      ze(ue.post);
    });
    function ze(ye) {
      (0, r.shouldUseGroup)(F, ye) && (ye.type ? (D.if((0, n.checkDataType)(ye.type, le, de.strictNumbers)), U(y, ye), S.length === 1 && S[0] === ye.type && O && (D.else(), (0, n.reportTypeError)(y)), D.endIf()) : U(y, ye), we || D.if((0, o._)`${i.default.errors} === ${T || 0}`));
    }
  }
  function U(y, S) {
    const { gen: O, schema: T, opts: { useDefaults: D } } = y;
    D && (0, s.assignDefaults)(y, S.type), O.block(() => {
      for (const F of S.rules)
        (0, r.shouldUseRule)(T, F) && C(y, F.keyword, F.definition, S.type);
    });
  }
  function Q(y, S) {
    y.schemaEnv.meta || !y.opts.strictTypes || (G(y, S), y.opts.allowUnionTypes || I(y, S), _(y, y.dataTypes));
  }
  function G(y, S) {
    if (S.length) {
      if (!y.dataTypes.length) {
        y.dataTypes = S;
        return;
      }
      S.forEach((O) => {
        E(y.dataTypes, O) || f(y, `type "${O}" not allowed by context "${y.dataTypes.join(",")}"`);
      }), l(y, S);
    }
  }
  function I(y, S) {
    S.length > 1 && !(S.length === 2 && S.includes("null")) && f(y, "use allowUnionTypes to allow union type keyword");
  }
  function _(y, S) {
    const O = y.self.RULES.all;
    for (const T in O) {
      const D = O[T];
      if (typeof D == "object" && (0, r.shouldUseRule)(y.schema, D)) {
        const { type: F } = D.definition;
        F.length && !F.some((le) => R(S, le)) && f(y, `missing type "${F.join(",")}" for keyword "${T}"`);
      }
    }
  }
  function R(y, S) {
    return y.includes(S) || S === "number" && y.includes("integer");
  }
  function E(y, S) {
    return y.includes(S) || S === "integer" && y.includes("number");
  }
  function l(y, S) {
    const O = [];
    for (const T of y.dataTypes)
      E(S, T) ? O.push(T) : S.includes("integer") && T === "number" && O.push("integer");
    y.dataTypes = O;
  }
  function f(y, S) {
    const O = y.schemaEnv.baseId + y.errSchemaPath;
    S += ` at "${O}" (strictTypes)`, (0, u.checkStrictMode)(y, S, y.opts.strictTypes);
  }
  class N {
    constructor(S, O, T) {
      if ((0, a.validateKeywordUsage)(S, O, T), this.gen = S.gen, this.allErrors = S.allErrors, this.keyword = T, this.data = S.data, this.schema = S.schema[T], this.$data = O.$data && S.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, u.schemaRefOrVal)(S, this.schema, T, this.$data), this.schemaType = O.schemaType, this.parentSchema = S.schema, this.params = {}, this.it = S, this.def = O, this.$data)
        this.schemaCode = S.gen.const("vSchema", B(this.$data, S));
      else if (this.schemaCode = this.schemaValue, !(0, a.validSchemaType)(this.schema, O.schemaType, O.allowUndefined))
        throw new Error(`${T} value must be ${JSON.stringify(O.schemaType)}`);
      ("code" in O ? O.trackErrors : O.errors !== !1) && (this.errsCount = S.gen.const("_errs", i.default.errors));
    }
    result(S, O, T) {
      this.failResult((0, o.not)(S), O, T);
    }
    failResult(S, O, T) {
      this.gen.if(S), T ? T() : this.error(), O ? (this.gen.else(), O(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(S, O) {
      this.failResult((0, o.not)(S), void 0, O);
    }
    fail(S) {
      if (S === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(S), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(S) {
      if (!this.$data)
        return this.fail(S);
      const { schemaCode: O } = this;
      this.fail((0, o._)`${O} !== undefined && (${(0, o.or)(this.invalid$data(), S)})`);
    }
    error(S, O, T) {
      if (O) {
        this.setParams(O), this._error(S, T), this.setParams({});
        return;
      }
      this._error(S, T);
    }
    _error(S, O) {
      (S ? h.reportExtraError : h.reportError)(this, this.def.error, O);
    }
    $dataError() {
      (0, h.reportError)(this, this.def.$dataError || h.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, h.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(S) {
      this.allErrors || this.gen.if(S);
    }
    setParams(S, O) {
      O ? Object.assign(this.params, S) : this.params = S;
    }
    block$data(S, O, T = o.nil) {
      this.gen.block(() => {
        this.check$data(S, T), O();
      });
    }
    check$data(S = o.nil, O = o.nil) {
      if (!this.$data)
        return;
      const { gen: T, schemaCode: D, schemaType: F, def: le } = this;
      T.if((0, o.or)((0, o._)`${D} === undefined`, O)), S !== o.nil && T.assign(S, !0), (F.length || le.validateSchema) && (T.elseIf(this.invalid$data()), this.$dataError(), S !== o.nil && T.assign(S, !1)), T.else();
    }
    invalid$data() {
      const { gen: S, schemaCode: O, schemaType: T, def: D, it: F } = this;
      return (0, o.or)(le(), we());
      function le() {
        if (T.length) {
          if (!(O instanceof o.Name))
            throw new Error("ajv implementation error");
          const de = Array.isArray(T) ? T : [T];
          return (0, o._)`${(0, n.checkDataTypes)(de, O, F.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function we() {
        if (D.validateSchema) {
          const de = S.scopeValue("validate$data", { ref: D.validateSchema });
          return (0, o._)`!${de}(${O})`;
        }
        return o.nil;
      }
    }
    subschema(S, O) {
      const T = (0, c.getSubschema)(this.it, S);
      (0, c.extendSubschemaData)(T, this.it, S), (0, c.extendSubschemaMode)(T, S);
      const D = { ...this.it, ...T, items: void 0, props: void 0 };
      return P(D, O), D;
    }
    mergeEvaluated(S, O) {
      const { it: T, gen: D } = this;
      T.opts.unevaluated && (T.props !== !0 && S.props !== void 0 && (T.props = u.mergeEvaluated.props(D, S.props, T.props, O)), T.items !== !0 && S.items !== void 0 && (T.items = u.mergeEvaluated.items(D, S.items, T.items, O)));
    }
    mergeValidEvaluated(S, O) {
      const { it: T, gen: D } = this;
      if (T.opts.unevaluated && (T.props !== !0 || T.items !== !0))
        return D.if(O, () => this.mergeEvaluated(S, o.Name)), !0;
    }
  }
  mt.KeywordCxt = N;
  function C(y, S, O, T) {
    const D = new N(y, O, S);
    "code" in O ? O.code(D, T) : D.$data && O.validate ? (0, a.funcKeywordCode)(D, O) : "macro" in O ? (0, a.macroKeywordCode)(D, O) : (O.compile || O.validate) && (0, a.funcKeywordCode)(D, O);
  }
  const M = /^\/(?:[^~]|~0|~1)*$/, Y = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function B(y, { dataLevel: S, dataNames: O, dataPathArr: T }) {
    let D, F;
    if (y === "")
      return i.default.rootData;
    if (y[0] === "/") {
      if (!M.test(y))
        throw new Error(`Invalid JSON-pointer: ${y}`);
      D = y, F = i.default.rootData;
    } else {
      const fe = Y.exec(y);
      if (!fe)
        throw new Error(`Invalid JSON-pointer: ${y}`);
      const ue = +fe[1];
      if (D = fe[2], D === "#") {
        if (ue >= S)
          throw new Error(de("property/index", ue));
        return T[S - ue];
      }
      if (ue > S)
        throw new Error(de("data", ue));
      if (F = O[S - ue], !D)
        return F;
    }
    let le = F;
    const we = D.split("/");
    for (const fe of we)
      fe && (F = (0, o._)`${F}${(0, o.getProperty)((0, u.unescapeJsonPointer)(fe))}`, le = (0, o._)`${le} && ${F}`);
    return le;
    function de(fe, ue) {
      return `Cannot access ${fe} ${ue} levels up, current level is ${S}`;
    }
  }
  return mt.getData = B, mt;
}
var tn = {}, Ai;
function xa() {
  if (Ai) return tn;
  Ai = 1, Object.defineProperty(tn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return tn.default = e, tn;
}
var rn = {}, Ci;
function Zn() {
  if (Ci) return rn;
  Ci = 1, Object.defineProperty(rn, "__esModule", { value: !0 });
  const e = je;
  class t extends Error {
    constructor(n, s, a, c) {
      super(c || `can't resolve reference ${a} from id ${s}`), this.missingRef = (0, e.resolveUrl)(n, s, a), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return rn.default = t, rn;
}
var Fe = {};
Object.defineProperty(Fe, "__esModule", { value: !0 });
Fe.resolveSchema = Fe.getCompilingSchema = Fe.resolveRef = Fe.compileSchema = Fe.SchemaEnv = void 0;
const Ye = oe, py = xa(), zt = lt, et = je, Di = J, $y = Qn();
class xn {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, et.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Fe.SchemaEnv = xn;
function eo(e) {
  const t = Ol.call(this, e);
  if (t)
    return t;
  const r = (0, et.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, c = new Ye.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let o;
  e.$async && (o = c.scopeValue("Error", {
    ref: py.default,
    code: (0, Ye._)`require("ajv/dist/runtime/validation_error").default`
  }));
  const i = c.scopeName("validate");
  e.validateName = i;
  const d = {
    gen: c,
    allErrors: this.opts.allErrors,
    data: zt.default.data,
    parentData: zt.default.parentData,
    parentDataProperty: zt.default.parentDataProperty,
    dataNames: [zt.default.data],
    dataPathArr: [Ye.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: c.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ye.stringify)(e.schema) } : { ref: e.schema }),
    validateName: i,
    ValidationError: o,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Ye.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Ye._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, $y.validateFunctionCode)(d), c.optimize(this.opts.code.optimize);
    const h = c.toString();
    u = `${c.scopeRefs(zt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const p = new Function(`${zt.default.self}`, `${zt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(i, { ref: p }), p.errors = null, p.schema = e.schema, p.schemaEnv = e, e.$async && (p.$async = !0), this.opts.code.source === !0 && (p.source = { validateName: i, validateCode: h, scopeValues: c._values }), this.opts.unevaluated) {
      const { props: $, items: g } = d;
      p.evaluated = {
        props: $ instanceof Ye.Name ? void 0 : $,
        items: g instanceof Ye.Name ? void 0 : g,
        dynamicProps: $ instanceof Ye.Name,
        dynamicItems: g instanceof Ye.Name
      }, p.source && (p.source.evaluated = (0, Ye.stringify)(p.evaluated));
    }
    return e.validate = p, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Fe.compileSchema = eo;
function yy(e, t, r) {
  var n;
  r = (0, et.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = vy.call(this, e, r);
  if (a === void 0) {
    const c = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: o } = this.opts;
    c && (a = new xn({ schema: c, schemaId: o, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = gy.call(this, a);
}
Fe.resolveRef = yy;
function gy(e) {
  return (0, et.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : eo.call(this, e);
}
function Ol(e) {
  for (const t of this._compilations)
    if (_y(t, e))
      return t;
}
Fe.getCompilingSchema = Ol;
function _y(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function vy(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || es.call(this, e, t);
}
function es(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, et._getFullPath)(this.opts.uriResolver, r);
  let s = (0, et.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return ys.call(this, r, e);
  const a = (0, et.normalizeId)(n), c = this.refs[a] || this.schemas[a];
  if (typeof c == "string") {
    const o = es.call(this, e, c);
    return typeof (o == null ? void 0 : o.schema) != "object" ? void 0 : ys.call(this, r, o);
  }
  if (typeof (c == null ? void 0 : c.schema) == "object") {
    if (c.validate || eo.call(this, c), a === (0, et.normalizeId)(t)) {
      const { schema: o } = c, { schemaId: i } = this.opts, d = o[i];
      return d && (s = (0, et.resolveUrl)(this.opts.uriResolver, s, d)), new xn({ schema: o, schemaId: i, root: e, baseId: s });
    }
    return ys.call(this, r, c);
  }
}
Fe.resolveSchema = es;
const wy = /* @__PURE__ */ new Set([
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
    const i = r[(0, Di.unescapeFragment)(o)];
    if (i === void 0)
      return;
    r = i;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !wy.has(o) && d && (t = (0, et.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Di.schemaHasRulesButRef)(r, this.RULES)) {
    const o = (0, et.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = es.call(this, n, o);
  }
  const { schemaId: c } = this.opts;
  if (a = a || new xn({ schema: r, schemaId: c, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Ey = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", by = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Sy = "object", Py = [
  "$data"
], Ny = {
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
}, Ry = !1, Oy = {
  $id: Ey,
  description: by,
  type: Sy,
  required: Py,
  properties: Ny,
  additionalProperties: Ry
};
var to = {};
Object.defineProperty(to, "__esModule", { value: !0 });
const Il = Zc;
Il.code = 'require("ajv/dist/runtime/uri").default';
to.default = Il;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = Qn();
  Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
    return t.KeywordCxt;
  } });
  var r = oe;
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
  const n = xa(), s = Zn(), a = Xt, c = Fe, o = oe, i = je, d = Pe, u = J, h = Oy, b = to, p = (I, _) => new RegExp(I, _);
  p.code = "new RegExp";
  const $ = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  }, w = 200;
  function P(I) {
    var _, R, E, l, f, N, C, M, Y, B, y, S, O, T, D, F, le, we, de, fe, ue, ze, ye, Ct, Dt;
    const Be = I.strict, Mt = (_ = I.code) === null || _ === void 0 ? void 0 : _.optimize, _r = Mt === !0 || Mt === void 0 ? 1 : Mt || 0, vr = (E = (R = I.code) === null || R === void 0 ? void 0 : R.regExp) !== null && E !== void 0 ? E : p, cs = (l = I.uriResolver) !== null && l !== void 0 ? l : b.default;
    return {
      strictSchema: (N = (f = I.strictSchema) !== null && f !== void 0 ? f : Be) !== null && N !== void 0 ? N : !0,
      strictNumbers: (M = (C = I.strictNumbers) !== null && C !== void 0 ? C : Be) !== null && M !== void 0 ? M : !0,
      strictTypes: (B = (Y = I.strictTypes) !== null && Y !== void 0 ? Y : Be) !== null && B !== void 0 ? B : "log",
      strictTuples: (S = (y = I.strictTuples) !== null && y !== void 0 ? y : Be) !== null && S !== void 0 ? S : "log",
      strictRequired: (T = (O = I.strictRequired) !== null && O !== void 0 ? O : Be) !== null && T !== void 0 ? T : !1,
      code: I.code ? { ...I.code, optimize: _r, regExp: vr } : { optimize: _r, regExp: vr },
      loopRequired: (D = I.loopRequired) !== null && D !== void 0 ? D : w,
      loopEnum: (F = I.loopEnum) !== null && F !== void 0 ? F : w,
      meta: (le = I.meta) !== null && le !== void 0 ? le : !0,
      messages: (we = I.messages) !== null && we !== void 0 ? we : !0,
      inlineRefs: (de = I.inlineRefs) !== null && de !== void 0 ? de : !0,
      schemaId: (fe = I.schemaId) !== null && fe !== void 0 ? fe : "$id",
      addUsedSchema: (ue = I.addUsedSchema) !== null && ue !== void 0 ? ue : !0,
      validateSchema: (ze = I.validateSchema) !== null && ze !== void 0 ? ze : !0,
      validateFormats: (ye = I.validateFormats) !== null && ye !== void 0 ? ye : !0,
      unicodeRegExp: (Ct = I.unicodeRegExp) !== null && Ct !== void 0 ? Ct : !0,
      int32range: (Dt = I.int32range) !== null && Dt !== void 0 ? Dt : !0,
      uriResolver: cs
    };
  }
  class j {
    constructor(_ = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), _ = this.opts = { ..._, ...P(_) };
      const { es5: R, lines: E } = this.opts.code;
      this.scope = new o.ValueScope({ scope: {}, prefixes: g, es5: R, lines: E }), this.logger = X(_.logger);
      const l = _.validateFormats;
      _.validateFormats = !1, this.RULES = (0, a.getRules)(), k.call(this, v, _, "NOT SUPPORTED"), k.call(this, m, _, "DEPRECATED", "warn"), this._metaOpts = ce.call(this), _.formats && x.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), _.keywords && re.call(this, _.keywords), typeof _.meta == "object" && this.addMetaSchema(_.meta), q.call(this), _.validateFormats = l;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: _, meta: R, schemaId: E } = this.opts;
      let l = h;
      E === "id" && (l = { ...h }, l.id = l.$id, delete l.$id), R && _ && this.addMetaSchema(l, l[E], !1);
    }
    defaultMeta() {
      const { meta: _, schemaId: R } = this.opts;
      return this.opts.defaultMeta = typeof _ == "object" ? _[R] || _ : void 0;
    }
    validate(_, R) {
      let E;
      if (typeof _ == "string") {
        if (E = this.getSchema(_), !E)
          throw new Error(`no schema with key or ref "${_}"`);
      } else
        E = this.compile(_);
      const l = E(R);
      return "$async" in E || (this.errors = E.errors), l;
    }
    compile(_, R) {
      const E = this._addSchema(_, R);
      return E.validate || this._compileSchemaEnv(E);
    }
    compileAsync(_, R) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: E } = this.opts;
      return l.call(this, _, R);
      async function l(B, y) {
        await f.call(this, B.$schema);
        const S = this._addSchema(B, y);
        return S.validate || N.call(this, S);
      }
      async function f(B) {
        B && !this.getSchema(B) && await l.call(this, { $ref: B }, !0);
      }
      async function N(B) {
        try {
          return this._compileSchemaEnv(B);
        } catch (y) {
          if (!(y instanceof s.default))
            throw y;
          return C.call(this, y), await M.call(this, y.missingSchema), N.call(this, B);
        }
      }
      function C({ missingSchema: B, missingRef: y }) {
        if (this.refs[B])
          throw new Error(`AnySchema ${B} is loaded but ${y} cannot be resolved`);
      }
      async function M(B) {
        const y = await Y.call(this, B);
        this.refs[B] || await f.call(this, y.$schema), this.refs[B] || this.addSchema(y, B, R);
      }
      async function Y(B) {
        const y = this._loading[B];
        if (y)
          return y;
        try {
          return await (this._loading[B] = E(B));
        } finally {
          delete this._loading[B];
        }
      }
    }
    // Adds schema to the instance
    addSchema(_, R, E, l = this.opts.validateSchema) {
      if (Array.isArray(_)) {
        for (const N of _)
          this.addSchema(N, void 0, E, l);
        return this;
      }
      let f;
      if (typeof _ == "object") {
        const { schemaId: N } = this.opts;
        if (f = _[N], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${N} must be string`);
      }
      return R = (0, i.normalizeId)(R || f), this._checkUnique(R), this.schemas[R] = this._addSchema(_, E, R, l, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(_, R, E = this.opts.validateSchema) {
      return this.addSchema(_, R, !0, E), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(_, R) {
      if (typeof _ == "boolean")
        return !0;
      let E;
      if (E = _.$schema, E !== void 0 && typeof E != "string")
        throw new Error("$schema must be a string");
      if (E = E || this.opts.defaultMeta || this.defaultMeta(), !E)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const l = this.validate(E, _);
      if (!l && R) {
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
    getSchema(_) {
      let R;
      for (; typeof (R = V.call(this, _)) == "string"; )
        _ = R;
      if (R === void 0) {
        const { schemaId: E } = this.opts, l = new c.SchemaEnv({ schema: {}, schemaId: E });
        if (R = c.resolveSchema.call(this, l, _), !R)
          return;
        this.refs[_] = R;
      }
      return R.validate || this._compileSchemaEnv(R);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(_) {
      if (_ instanceof RegExp)
        return this._removeAllSchemas(this.schemas, _), this._removeAllSchemas(this.refs, _), this;
      switch (typeof _) {
        case "undefined":
          return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
        case "string": {
          const R = V.call(this, _);
          return typeof R == "object" && this._cache.delete(R.schema), delete this.schemas[_], delete this.refs[_], this;
        }
        case "object": {
          const R = _;
          this._cache.delete(R);
          let E = _[this.opts.schemaId];
          return E && (E = (0, i.normalizeId)(E), delete this.schemas[E], delete this.refs[E]), this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(_) {
      for (const R of _)
        this.addKeyword(R);
      return this;
    }
    addKeyword(_, R) {
      let E;
      if (typeof _ == "string")
        E = _, typeof R == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), R.keyword = E);
      else if (typeof _ == "object" && R === void 0) {
        if (R = _, E = R.keyword, Array.isArray(E) && !E.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (A.call(this, E, R), !R)
        return (0, u.eachItem)(E, (f) => L.call(this, f)), this;
      U.call(this, R);
      const l = {
        ...R,
        type: (0, d.getJSONTypes)(R.type),
        schemaType: (0, d.getJSONTypes)(R.schemaType)
      };
      return (0, u.eachItem)(E, l.type.length === 0 ? (f) => L.call(this, f, l) : (f) => l.type.forEach((N) => L.call(this, f, l, N))), this;
    }
    getKeyword(_) {
      const R = this.RULES.all[_];
      return typeof R == "object" ? R.definition : !!R;
    }
    // Remove keyword
    removeKeyword(_) {
      const { RULES: R } = this;
      delete R.keywords[_], delete R.all[_];
      for (const E of R.rules) {
        const l = E.rules.findIndex((f) => f.keyword === _);
        l >= 0 && E.rules.splice(l, 1);
      }
      return this;
    }
    // Add format
    addFormat(_, R) {
      return typeof R == "string" && (R = new RegExp(R)), this.formats[_] = R, this;
    }
    errorsText(_ = this.errors, { separator: R = ", ", dataVar: E = "data" } = {}) {
      return !_ || _.length === 0 ? "No errors" : _.map((l) => `${E}${l.instancePath} ${l.message}`).reduce((l, f) => l + R + f);
    }
    $dataMetaSchema(_, R) {
      const E = this.RULES.all;
      _ = JSON.parse(JSON.stringify(_));
      for (const l of R) {
        const f = l.split("/").slice(1);
        let N = _;
        for (const C of f)
          N = N[C];
        for (const C in E) {
          const M = E[C];
          if (typeof M != "object")
            continue;
          const { $data: Y } = M.definition, B = N[C];
          Y && B && (N[C] = G(B));
        }
      }
      return _;
    }
    _removeAllSchemas(_, R) {
      for (const E in _) {
        const l = _[E];
        (!R || R.test(E)) && (typeof l == "string" ? delete _[E] : l && !l.meta && (this._cache.delete(l.schema), delete _[E]));
      }
    }
    _addSchema(_, R, E, l = this.opts.validateSchema, f = this.opts.addUsedSchema) {
      let N;
      const { schemaId: C } = this.opts;
      if (typeof _ == "object")
        N = _[C];
      else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        if (typeof _ != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let M = this._cache.get(_);
      if (M !== void 0)
        return M;
      E = (0, i.normalizeId)(N || E);
      const Y = i.getSchemaRefs.call(this, _, E);
      return M = new c.SchemaEnv({ schema: _, schemaId: C, meta: R, baseId: E, localRefs: Y }), this._cache.set(M.schema, M), f && !E.startsWith("#") && (E && this._checkUnique(E), this.refs[E] = M), l && this.validateSchema(_, !0), M;
    }
    _checkUnique(_) {
      if (this.schemas[_] || this.refs[_])
        throw new Error(`schema with key or id "${_}" already exists`);
    }
    _compileSchemaEnv(_) {
      if (_.meta ? this._compileMetaSchema(_) : c.compileSchema.call(this, _), !_.validate)
        throw new Error("ajv implementation error");
      return _.validate;
    }
    _compileMetaSchema(_) {
      const R = this.opts;
      this.opts = this._metaOpts;
      try {
        c.compileSchema.call(this, _);
      } finally {
        this.opts = R;
      }
    }
  }
  j.ValidationError = n.default, j.MissingRefError = s.default, e.default = j;
  function k(I, _, R, E = "error") {
    for (const l in I) {
      const f = l;
      f in _ && this.logger[E](`${R}: option ${l}. ${I[f]}`);
    }
  }
  function V(I) {
    return I = (0, i.normalizeId)(I), this.schemas[I] || this.refs[I];
  }
  function q() {
    const I = this.opts.schemas;
    if (I)
      if (Array.isArray(I))
        this.addSchema(I);
      else
        for (const _ in I)
          this.addSchema(I[_], _);
  }
  function x() {
    for (const I in this.opts.formats) {
      const _ = this.opts.formats[I];
      _ && this.addFormat(I, _);
    }
  }
  function re(I) {
    if (Array.isArray(I)) {
      this.addVocabulary(I);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const _ in I) {
      const R = I[_];
      R.keyword || (R.keyword = _), this.addKeyword(R);
    }
  }
  function ce() {
    const I = { ...this.opts };
    for (const _ of $)
      delete I[_];
    return I;
  }
  const z = { log() {
  }, warn() {
  }, error() {
  } };
  function X(I) {
    if (I === !1)
      return z;
    if (I === void 0)
      return console;
    if (I.log && I.warn && I.error)
      return I;
    throw new Error("logger must implement log, warn and error methods");
  }
  const W = /^[a-z_$][a-z0-9_$:-]*$/i;
  function A(I, _) {
    const { RULES: R } = this;
    if ((0, u.eachItem)(I, (E) => {
      if (R.keywords[E])
        throw new Error(`Keyword ${E} is already defined`);
      if (!W.test(E))
        throw new Error(`Keyword ${E} has invalid name`);
    }), !!_ && _.$data && !("code" in _ || "validate" in _))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function L(I, _, R) {
    var E;
    const l = _ == null ? void 0 : _.post;
    if (R && l)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES: f } = this;
    let N = l ? f.post : f.rules.find(({ type: M }) => M === R);
    if (N || (N = { type: R, rules: [] }, f.rules.push(N)), f.keywords[I] = !0, !_)
      return;
    const C = {
      keyword: I,
      definition: {
        ..._,
        type: (0, d.getJSONTypes)(_.type),
        schemaType: (0, d.getJSONTypes)(_.schemaType)
      }
    };
    _.before ? H.call(this, N, C, _.before) : N.rules.push(C), f.all[I] = C, (E = _.implements) === null || E === void 0 || E.forEach((M) => this.addKeyword(M));
  }
  function H(I, _, R) {
    const E = I.rules.findIndex((l) => l.keyword === R);
    E >= 0 ? I.rules.splice(E, 0, _) : (I.rules.push(_), this.logger.warn(`rule ${R} is not defined`));
  }
  function U(I) {
    let { metaSchema: _ } = I;
    _ !== void 0 && (I.$data && this.opts.$data && (_ = G(_)), I.validateSchema = this.compile(_, !0));
  }
  const Q = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function G(I) {
    return { anyOf: [I, Q] };
  }
})(dl);
var ro = {}, no = {}, so = {};
Object.defineProperty(so, "__esModule", { value: !0 });
const Iy = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
so.default = Iy;
var Yt = {};
Object.defineProperty(Yt, "__esModule", { value: !0 });
Yt.callRef = Yt.getValidate = void 0;
const jy = Zn(), Mi = ie, Ve = oe, Zt = lt, Li = Fe, nn = J, Ty = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: c, opts: o, self: i } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Li.resolveRef.call(i, d, s, r);
    if (u === void 0)
      throw new jy.default(n.opts.uriResolver, s, r);
    if (u instanceof Li.SchemaEnv)
      return b(u);
    return p(u);
    function h() {
      if (a === d)
        return En(e, c, a, a.$async);
      const $ = t.scopeValue("root", { ref: d });
      return En(e, (0, Ve._)`${$}.validate`, d, d.$async);
    }
    function b($) {
      const g = jl(e, $);
      En(e, g, $, $.$async);
    }
    function p($) {
      const g = t.scopeValue("schema", o.code.source === !0 ? { ref: $, code: (0, Ve.stringify)($) } : { ref: $ }), v = t.name("valid"), m = e.subschema({
        schema: $,
        dataTypes: [],
        schemaPath: Ve.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, v);
      e.mergeEvaluated(m), e.ok(v);
    }
  }
};
function jl(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ve._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
Yt.getValidate = jl;
function En(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: c, schemaEnv: o, opts: i } = a, d = i.passContext ? Zt.default.this : Ve.nil;
  n ? u() : h();
  function u() {
    if (!o.$async)
      throw new Error("async schema referenced by sync schema");
    const $ = s.let("valid");
    s.try(() => {
      s.code((0, Ve._)`await ${(0, Mi.callValidateCode)(e, t, d)}`), p(t), c || s.assign($, !0);
    }, (g) => {
      s.if((0, Ve._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), b(g), c || s.assign($, !1);
    }), e.ok($);
  }
  function h() {
    e.result((0, Mi.callValidateCode)(e, t, d), () => p(t), () => b(t));
  }
  function b($) {
    const g = (0, Ve._)`${$}.errors`;
    s.assign(Zt.default.vErrors, (0, Ve._)`${Zt.default.vErrors} === null ? ${g} : ${Zt.default.vErrors}.concat(${g})`), s.assign(Zt.default.errors, (0, Ve._)`${Zt.default.vErrors}.length`);
  }
  function p($) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const v = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (v && !v.dynamicProps)
        v.props !== void 0 && (a.props = nn.mergeEvaluated.props(s, v.props, a.props));
      else {
        const m = s.var("props", (0, Ve._)`${$}.evaluated.props`);
        a.props = nn.mergeEvaluated.props(s, m, a.props, Ve.Name);
      }
    if (a.items !== !0)
      if (v && !v.dynamicItems)
        v.items !== void 0 && (a.items = nn.mergeEvaluated.items(s, v.items, a.items));
      else {
        const m = s.var("items", (0, Ve._)`${$}.evaluated.items`);
        a.items = nn.mergeEvaluated.items(s, m, a.items, Ve.Name);
      }
  }
}
Yt.callRef = En;
Yt.default = Ty;
Object.defineProperty(no, "__esModule", { value: !0 });
const ky = so, Ay = Yt, Cy = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  ky.default,
  Ay.default
];
no.default = Cy;
var ao = {}, oo = {};
Object.defineProperty(oo, "__esModule", { value: !0 });
const Cn = oe, Rt = Cn.operators, Dn = {
  maximum: { okStr: "<=", ok: Rt.LTE, fail: Rt.GT },
  minimum: { okStr: ">=", ok: Rt.GTE, fail: Rt.LT },
  exclusiveMaximum: { okStr: "<", ok: Rt.LT, fail: Rt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Rt.GT, fail: Rt.LTE }
}, Dy = {
  message: ({ keyword: e, schemaCode: t }) => (0, Cn.str)`must be ${Dn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Cn._)`{comparison: ${Dn[e].okStr}, limit: ${t}}`
}, My = {
  keyword: Object.keys(Dn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Dy,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Cn._)`${r} ${Dn[t].fail} ${n} || isNaN(${r})`);
  }
};
oo.default = My;
var io = {};
Object.defineProperty(io, "__esModule", { value: !0 });
const Lr = oe, Ly = {
  message: ({ schemaCode: e }) => (0, Lr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Lr._)`{multipleOf: ${e}}`
}, Vy = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Ly,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, c = t.let("res"), o = a ? (0, Lr._)`Math.abs(Math.round(${c}) - ${c}) > 1e-${a}` : (0, Lr._)`${c} !== parseInt(${c})`;
    e.fail$data((0, Lr._)`(${n} === 0 || (${c} = ${r}/${n}, ${o}))`);
  }
};
io.default = Vy;
var co = {}, lo = {};
Object.defineProperty(lo, "__esModule", { value: !0 });
function Tl(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
lo.default = Tl;
Tl.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(co, "__esModule", { value: !0 });
const Gt = oe, Fy = J, zy = lo, qy = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Gt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Gt._)`{limit: ${e}}`
}, Uy = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: qy,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Gt.operators.GT : Gt.operators.LT, c = s.opts.unicode === !1 ? (0, Gt._)`${r}.length` : (0, Gt._)`${(0, Fy.useFunc)(e.gen, zy.default)}(${r})`;
    e.fail$data((0, Gt._)`${c} ${a} ${n}`);
  }
};
co.default = Uy;
var uo = {};
Object.defineProperty(uo, "__esModule", { value: !0 });
const Ky = ie, Mn = oe, Gy = {
  message: ({ schemaCode: e }) => (0, Mn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Mn._)`{pattern: ${e}}`
}, Hy = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Gy,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, c = a.opts.unicodeRegExp ? "u" : "", o = r ? (0, Mn._)`(new RegExp(${s}, ${c}))` : (0, Ky.usePattern)(e, n);
    e.fail$data((0, Mn._)`!${o}.test(${t})`);
  }
};
uo.default = Hy;
var fo = {};
Object.defineProperty(fo, "__esModule", { value: !0 });
const Vr = oe, By = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Vr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Vr._)`{limit: ${e}}`
}, Jy = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: By,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Vr.operators.GT : Vr.operators.LT;
    e.fail$data((0, Vr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
fo.default = Jy;
var ho = {};
Object.defineProperty(ho, "__esModule", { value: !0 });
const Or = ie, Fr = oe, Wy = J, Xy = {
  message: ({ params: { missingProperty: e } }) => (0, Fr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Fr._)`{missingProperty: ${e}}`
}, Yy = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Xy,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: c } = e, { opts: o } = c;
    if (!a && r.length === 0)
      return;
    const i = r.length >= o.loopRequired;
    if (c.allErrors ? d() : u(), o.strictRequired) {
      const p = e.parentSchema.properties, { definedProperties: $ } = e.it;
      for (const g of r)
        if ((p == null ? void 0 : p[g]) === void 0 && !$.has(g)) {
          const v = c.schemaEnv.baseId + c.errSchemaPath, m = `required property "${g}" is not defined at "${v}" (strictRequired)`;
          (0, Wy.checkStrictMode)(c, m, c.opts.strictRequired);
        }
    }
    function d() {
      if (i || a)
        e.block$data(Fr.nil, h);
      else
        for (const p of r)
          (0, Or.checkReportMissingProp)(e, p);
    }
    function u() {
      const p = t.let("missing");
      if (i || a) {
        const $ = t.let("valid", !0);
        e.block$data($, () => b(p, $)), e.ok($);
      } else
        t.if((0, Or.checkMissingProp)(e, r, p)), (0, Or.reportMissingProp)(e, p), t.else();
    }
    function h() {
      t.forOf("prop", n, (p) => {
        e.setParams({ missingProperty: p }), t.if((0, Or.noPropertyInData)(t, s, p, o.ownProperties), () => e.error());
      });
    }
    function b(p, $) {
      e.setParams({ missingProperty: p }), t.forOf(p, n, () => {
        t.assign($, (0, Or.propertyInData)(t, s, p, o.ownProperties)), t.if((0, Fr.not)($), () => {
          e.error(), t.break();
        });
      }, Fr.nil);
    }
  }
};
ho.default = Yy;
var mo = {};
Object.defineProperty(mo, "__esModule", { value: !0 });
const zr = oe, Qy = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, zr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, zr._)`{limit: ${e}}`
}, Zy = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: Qy,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? zr.operators.GT : zr.operators.LT;
    e.fail$data((0, zr._)`${r}.length ${s} ${n}`);
  }
};
mo.default = Zy;
var po = {}, Br = {};
Object.defineProperty(Br, "__esModule", { value: !0 });
const kl = Un;
kl.code = 'require("ajv/dist/runtime/equal").default';
Br.default = kl;
Object.defineProperty(po, "__esModule", { value: !0 });
const gs = Pe, Oe = oe, xy = J, e0 = Br, t0 = {
  message: ({ params: { i: e, j: t } }) => (0, Oe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Oe._)`{i: ${e}, j: ${t}}`
}, r0 = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: t0,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: c, it: o } = e;
    if (!n && !s)
      return;
    const i = t.let("valid"), d = a.items ? (0, gs.getSchemaTypes)(a.items) : [];
    e.block$data(i, u, (0, Oe._)`${c} === false`), e.ok(i);
    function u() {
      const $ = t.let("i", (0, Oe._)`${r}.length`), g = t.let("j");
      e.setParams({ i: $, j: g }), t.assign(i, !0), t.if((0, Oe._)`${$} > 1`, () => (h() ? b : p)($, g));
    }
    function h() {
      return d.length > 0 && !d.some(($) => $ === "object" || $ === "array");
    }
    function b($, g) {
      const v = t.name("item"), m = (0, gs.checkDataTypes)(d, v, o.opts.strictNumbers, gs.DataType.Wrong), w = t.const("indices", (0, Oe._)`{}`);
      t.for((0, Oe._)`;${$}--;`, () => {
        t.let(v, (0, Oe._)`${r}[${$}]`), t.if(m, (0, Oe._)`continue`), d.length > 1 && t.if((0, Oe._)`typeof ${v} == "string"`, (0, Oe._)`${v} += "_"`), t.if((0, Oe._)`typeof ${w}[${v}] == "number"`, () => {
          t.assign(g, (0, Oe._)`${w}[${v}]`), e.error(), t.assign(i, !1).break();
        }).code((0, Oe._)`${w}[${v}] = ${$}`);
      });
    }
    function p($, g) {
      const v = (0, xy.useFunc)(t, e0.default), m = t.name("outer");
      t.label(m).for((0, Oe._)`;${$}--;`, () => t.for((0, Oe._)`${g} = ${$}; ${g}--;`, () => t.if((0, Oe._)`${v}(${r}[${$}], ${r}[${g}])`, () => {
        e.error(), t.assign(i, !1).break(m);
      })));
    }
  }
};
po.default = r0;
var $o = {};
Object.defineProperty($o, "__esModule", { value: !0 });
const qs = oe, n0 = J, s0 = Br, a0 = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, qs._)`{allowedValue: ${e}}`
}, o0 = {
  keyword: "const",
  $data: !0,
  error: a0,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, qs._)`!${(0, n0.useFunc)(t, s0.default)}(${r}, ${s})`) : e.fail((0, qs._)`${a} !== ${r}`);
  }
};
$o.default = o0;
var yo = {};
Object.defineProperty(yo, "__esModule", { value: !0 });
const kr = oe, i0 = J, c0 = Br, l0 = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, kr._)`{allowedValues: ${e}}`
}, u0 = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: l0,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: c } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const o = s.length >= c.opts.loopEnum;
    let i;
    const d = () => i ?? (i = (0, i0.useFunc)(t, c0.default));
    let u;
    if (o || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const p = t.const("vSchema", a);
      u = (0, kr.or)(...s.map(($, g) => b(p, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, (p) => t.if((0, kr._)`${d()}(${r}, ${p})`, () => t.assign(u, !0).break()));
    }
    function b(p, $) {
      const g = s[$];
      return typeof g == "object" && g !== null ? (0, kr._)`${d()}(${r}, ${p}[${$}])` : (0, kr._)`${r} === ${g}`;
    }
  }
};
yo.default = u0;
Object.defineProperty(ao, "__esModule", { value: !0 });
const d0 = oo, f0 = io, h0 = co, m0 = uo, p0 = fo, $0 = ho, y0 = mo, g0 = po, _0 = $o, v0 = yo, w0 = [
  // number
  d0.default,
  f0.default,
  // string
  h0.default,
  m0.default,
  // object
  p0.default,
  $0.default,
  // array
  y0.default,
  g0.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  _0.default,
  v0.default
];
ao.default = w0;
var go = {}, $r = {};
Object.defineProperty($r, "__esModule", { value: !0 });
$r.validateAdditionalItems = void 0;
const Ht = oe, Us = J, E0 = {
  message: ({ params: { len: e } }) => (0, Ht.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Ht._)`{limit: ${e}}`
}, b0 = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: E0,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Us.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Al(e, n);
  }
};
function Al(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: c } = e;
  c.items = !0;
  const o = r.const("len", (0, Ht._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Ht._)`${o} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Us.alwaysValidSchema)(c, n)) {
    const d = r.var("valid", (0, Ht._)`${o} <= ${t.length}`);
    r.if((0, Ht.not)(d), () => i(d)), e.ok(d);
  }
  function i(d) {
    r.forRange("i", t.length, o, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: Us.Type.Num }, d), c.allErrors || r.if((0, Ht.not)(d), () => r.break());
    });
  }
}
$r.validateAdditionalItems = Al;
$r.default = b0;
var _o = {}, yr = {};
Object.defineProperty(yr, "__esModule", { value: !0 });
yr.validateTuple = void 0;
const Vi = oe, bn = J, S0 = ie, P0 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Cl(e, "additionalItems", t);
    r.items = !0, !(0, bn.alwaysValidSchema)(r, t) && e.ok((0, S0.validateArray)(e));
  }
};
function Cl(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: c, it: o } = e;
  u(s), o.opts.unevaluated && r.length && o.items !== !0 && (o.items = bn.mergeEvaluated.items(n, r.length, o.items));
  const i = n.name("valid"), d = n.const("len", (0, Vi._)`${a}.length`);
  r.forEach((h, b) => {
    (0, bn.alwaysValidSchema)(o, h) || (n.if((0, Vi._)`${d} > ${b}`, () => e.subschema({
      keyword: c,
      schemaProp: b,
      dataProp: b
    }, i)), e.ok(i));
  });
  function u(h) {
    const { opts: b, errSchemaPath: p } = o, $ = r.length, g = $ === h.minItems && ($ === h.maxItems || h[t] === !1);
    if (b.strictTuples && !g) {
      const v = `"${c}" is ${$}-tuple, but minItems or maxItems/${t} are not specified or different at path "${p}"`;
      (0, bn.checkStrictMode)(o, v, b.strictTuples);
    }
  }
}
yr.validateTuple = Cl;
yr.default = P0;
Object.defineProperty(_o, "__esModule", { value: !0 });
const N0 = yr, R0 = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, N0.validateTuple)(e, "items")
};
_o.default = R0;
var vo = {};
Object.defineProperty(vo, "__esModule", { value: !0 });
const Fi = oe, O0 = J, I0 = ie, j0 = $r, T0 = {
  message: ({ params: { len: e } }) => (0, Fi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Fi._)`{limit: ${e}}`
}, k0 = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: T0,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, O0.alwaysValidSchema)(n, t) && (s ? (0, j0.validateAdditionalItems)(e, s) : e.ok((0, I0.validateArray)(e)));
  }
};
vo.default = k0;
var wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const He = oe, sn = J, A0 = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, He.str)`must contain at least ${e} valid item(s)` : (0, He.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, He._)`{minContains: ${e}}` : (0, He._)`{minContains: ${e}, maxContains: ${t}}`
}, C0 = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: A0,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let c, o;
    const { minContains: i, maxContains: d } = n;
    a.opts.next ? (c = i === void 0 ? 1 : i, o = d) : c = 1;
    const u = t.const("len", (0, He._)`${s}.length`);
    if (e.setParams({ min: c, max: o }), o === void 0 && c === 0) {
      (0, sn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (o !== void 0 && c > o) {
      (0, sn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, sn.alwaysValidSchema)(a, r)) {
      let g = (0, He._)`${u} >= ${c}`;
      o !== void 0 && (g = (0, He._)`${g} && ${u} <= ${o}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    o === void 0 && c === 1 ? p(h, () => t.if(h, () => t.break())) : c === 0 ? (t.let(h, !0), o !== void 0 && t.if((0, He._)`${s}.length > 0`, b)) : (t.let(h, !1), b()), e.result(h, () => e.reset());
    function b() {
      const g = t.name("_valid"), v = t.let("count", 0);
      p(g, () => t.if(g, () => $(v)));
    }
    function p(g, v) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: sn.Type.Num,
          compositeRule: !0
        }, g), v();
      });
    }
    function $(g) {
      t.code((0, He._)`${g}++`), o === void 0 ? t.if((0, He._)`${g} >= ${c}`, () => t.assign(h, !0).break()) : (t.if((0, He._)`${g} > ${o}`, () => t.assign(h, !1).break()), c === 1 ? t.assign(h, !0) : t.if((0, He._)`${g} >= ${c}`, () => t.assign(h, !0)));
    }
  }
};
wo.default = C0;
var Dl = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = oe, r = J, n = ie;
  e.error = {
    message: ({ params: { property: i, depsCount: d, deps: u } }) => {
      const h = d === 1 ? "property" : "properties";
      return (0, t.str)`must have ${h} ${u} when property ${i} is present`;
    },
    params: ({ params: { property: i, depsCount: d, deps: u, missingProperty: h } }) => (0, t._)`{property: ${i},
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
    code(i) {
      const [d, u] = a(i);
      c(i, d), o(i, u);
    }
  };
  function a({ schema: i }) {
    const d = {}, u = {};
    for (const h in i) {
      if (h === "__proto__")
        continue;
      const b = Array.isArray(i[h]) ? d : u;
      b[h] = i[h];
    }
    return [d, u];
  }
  function c(i, d = i.schema) {
    const { gen: u, data: h, it: b } = i;
    if (Object.keys(d).length === 0)
      return;
    const p = u.let("missing");
    for (const $ in d) {
      const g = d[$];
      if (g.length === 0)
        continue;
      const v = (0, n.propertyInData)(u, h, $, b.opts.ownProperties);
      i.setParams({
        property: $,
        depsCount: g.length,
        deps: g.join(", ")
      }), b.allErrors ? u.if(v, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(i, m);
      }) : (u.if((0, t._)`${v} && (${(0, n.checkMissingProp)(i, g, p)})`), (0, n.reportMissingProp)(i, p), u.else());
    }
  }
  e.validatePropertyDeps = c;
  function o(i, d = i.schema) {
    const { gen: u, data: h, keyword: b, it: p } = i, $ = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)(p, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, p.opts.ownProperties),
        () => {
          const v = i.subschema({ keyword: b, schemaProp: g }, $);
          i.mergeValidEvaluated(v, $);
        },
        () => u.var($, !0)
        // TODO var
      ), i.ok($));
  }
  e.validateSchemaDeps = o, e.default = s;
})(Dl);
var Eo = {};
Object.defineProperty(Eo, "__esModule", { value: !0 });
const Ml = oe, D0 = J, M0 = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Ml._)`{propertyName: ${e.propertyName}}`
}, L0 = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: M0,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, D0.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (c) => {
      e.setParams({ propertyName: c }), e.subschema({
        keyword: "propertyNames",
        data: c,
        dataTypes: ["string"],
        propertyName: c,
        compositeRule: !0
      }, a), t.if((0, Ml.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Eo.default = L0;
var ts = {};
Object.defineProperty(ts, "__esModule", { value: !0 });
const an = ie, Ze = oe, V0 = lt, on = J, F0 = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, Ze._)`{additionalProperty: ${e.additionalProperty}}`
}, z0 = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: F0,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: c } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: o, opts: i } = c;
    if (c.props = !0, i.removeAdditional !== "all" && (0, on.alwaysValidSchema)(c, r))
      return;
    const d = (0, an.allSchemaProperties)(n.properties), u = (0, an.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, Ze._)`${a} === ${V0.default.errors}`);
    function h() {
      t.forIn("key", s, (v) => {
        !d.length && !u.length ? $(v) : t.if(b(v), () => $(v));
      });
    }
    function b(v) {
      let m;
      if (d.length > 8) {
        const w = (0, on.schemaRefOrVal)(c, n.properties, "properties");
        m = (0, an.isOwnProperty)(t, w, v);
      } else d.length ? m = (0, Ze.or)(...d.map((w) => (0, Ze._)`${v} === ${w}`)) : m = Ze.nil;
      return u.length && (m = (0, Ze.or)(m, ...u.map((w) => (0, Ze._)`${(0, an.usePattern)(e, w)}.test(${v})`))), (0, Ze.not)(m);
    }
    function p(v) {
      t.code((0, Ze._)`delete ${s}[${v}]`);
    }
    function $(v) {
      if (i.removeAdditional === "all" || i.removeAdditional && r === !1) {
        p(v);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: v }), e.error(), o || t.break();
        return;
      }
      if (typeof r == "object" && !(0, on.alwaysValidSchema)(c, r)) {
        const m = t.name("valid");
        i.removeAdditional === "failing" ? (g(v, m, !1), t.if((0, Ze.not)(m), () => {
          e.reset(), p(v);
        })) : (g(v, m), o || t.if((0, Ze.not)(m), () => t.break()));
      }
    }
    function g(v, m, w) {
      const P = {
        keyword: "additionalProperties",
        dataProp: v,
        dataPropType: on.Type.Str
      };
      w === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
ts.default = z0;
var bo = {};
Object.defineProperty(bo, "__esModule", { value: !0 });
const q0 = Qn(), zi = ie, _s = J, qi = ts, U0 = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && qi.default.code(new q0.KeywordCxt(a, qi.default, "additionalProperties"));
    const c = (0, zi.allSchemaProperties)(r);
    for (const h of c)
      a.definedProperties.add(h);
    a.opts.unevaluated && c.length && a.props !== !0 && (a.props = _s.mergeEvaluated.props(t, (0, _s.toHash)(c), a.props));
    const o = c.filter((h) => !(0, _s.alwaysValidSchema)(a, r[h]));
    if (o.length === 0)
      return;
    const i = t.name("valid");
    for (const h of o)
      d(h) ? u(h) : (t.if((0, zi.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(i, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(i);
    function d(h) {
      return a.opts.useDefaults && !a.compositeRule && r[h].default !== void 0;
    }
    function u(h) {
      e.subschema({
        keyword: "properties",
        schemaProp: h,
        dataProp: h
      }, i);
    }
  }
};
bo.default = U0;
var So = {};
Object.defineProperty(So, "__esModule", { value: !0 });
const Ui = ie, cn = oe, Ki = J, Gi = J, K0 = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: c } = a, o = (0, Ui.allSchemaProperties)(r), i = o.filter((g) => (0, Ki.alwaysValidSchema)(a, r[g]));
    if (o.length === 0 || i.length === o.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = c.strictSchema && !c.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof cn.Name) && (a.props = (0, Gi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    b();
    function b() {
      for (const g of o)
        d && p(g), a.allErrors ? $(g) : (t.var(u, !0), $(g), t.if(u));
    }
    function p(g) {
      for (const v in d)
        new RegExp(g).test(v) && (0, Ki.checkStrictMode)(a, `property ${v} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function $(g) {
      t.forIn("key", n, (v) => {
        t.if((0, cn._)`${(0, Ui.usePattern)(e, g)}.test(${v})`, () => {
          const m = i.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: v,
            dataPropType: Gi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, cn._)`${h}[${v}]`, !0) : !m && !a.allErrors && t.if((0, cn.not)(u), () => t.break());
        });
      });
    }
  }
};
So.default = K0;
var Po = {};
Object.defineProperty(Po, "__esModule", { value: !0 });
const G0 = J, H0 = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, G0.alwaysValidSchema)(n, r)) {
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
Po.default = H0;
var No = {};
Object.defineProperty(No, "__esModule", { value: !0 });
const B0 = ie, J0 = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: B0.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
No.default = J0;
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const Sn = oe, W0 = J, X0 = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Sn._)`{passingSchemas: ${e.passing}}`
}, Y0 = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: X0,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, it: s } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    if (s.opts.discriminator && n.discriminator)
      return;
    const a = r, c = t.let("valid", !1), o = t.let("passing", null), i = t.name("_valid");
    e.setParams({ passing: o }), t.block(d), e.result(c, () => e.reset(), () => e.error(!0));
    function d() {
      a.forEach((u, h) => {
        let b;
        (0, W0.alwaysValidSchema)(s, u) ? t.var(i, !0) : b = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, i), h > 0 && t.if((0, Sn._)`${i} && ${c}`).assign(c, !1).assign(o, (0, Sn._)`[${o}, ${h}]`).else(), t.if(i, () => {
          t.assign(c, !0), t.assign(o, h), b && e.mergeEvaluated(b, Sn.Name);
        });
      });
    }
  }
};
Ro.default = Y0;
var Oo = {};
Object.defineProperty(Oo, "__esModule", { value: !0 });
const Q0 = J, Z0 = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, c) => {
      if ((0, Q0.alwaysValidSchema)(n, a))
        return;
      const o = e.subschema({ keyword: "allOf", schemaProp: c }, s);
      e.ok(s), e.mergeEvaluated(o);
    });
  }
};
Oo.default = Z0;
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const Ln = oe, Ll = J, x0 = {
  message: ({ params: e }) => (0, Ln.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Ln._)`{failingKeyword: ${e.ifClause}}`
}, eg = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: x0,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Ll.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Hi(n, "then"), a = Hi(n, "else");
    if (!s && !a)
      return;
    const c = t.let("valid", !0), o = t.name("_valid");
    if (i(), e.reset(), s && a) {
      const u = t.let("ifClause");
      e.setParams({ ifClause: u }), t.if(o, d("then", u), d("else", u));
    } else s ? t.if(o, d("then")) : t.if((0, Ln.not)(o), d("else"));
    e.pass(c, () => e.error(!0));
    function i() {
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
        const b = e.subschema({ keyword: u }, o);
        t.assign(c, o), e.mergeValidEvaluated(b, c), h ? t.assign(h, (0, Ln._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Hi(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Ll.alwaysValidSchema)(e, r);
}
Io.default = eg;
var jo = {};
Object.defineProperty(jo, "__esModule", { value: !0 });
const tg = J, rg = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, tg.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
jo.default = rg;
Object.defineProperty(go, "__esModule", { value: !0 });
const ng = $r, sg = _o, ag = yr, og = vo, ig = wo, cg = Dl, lg = Eo, ug = ts, dg = bo, fg = So, hg = Po, mg = No, pg = Ro, $g = Oo, yg = Io, gg = jo;
function _g(e = !1) {
  const t = [
    // any
    hg.default,
    mg.default,
    pg.default,
    $g.default,
    yg.default,
    gg.default,
    // object
    lg.default,
    ug.default,
    cg.default,
    dg.default,
    fg.default
  ];
  return e ? t.push(sg.default, og.default) : t.push(ng.default, ag.default), t.push(ig.default), t;
}
go.default = _g;
var To = {}, ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const be = oe, vg = {
  message: ({ schemaCode: e }) => (0, be.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, be._)`{format: ${e}}`
}, wg = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: vg,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: c, it: o } = e, { opts: i, errSchemaPath: d, schemaEnv: u, self: h } = o;
    if (!i.validateFormats)
      return;
    s ? b() : p();
    function b() {
      const $ = r.scopeValue("formats", {
        ref: h.formats,
        code: i.code.formats
      }), g = r.const("fDef", (0, be._)`${$}[${c}]`), v = r.let("fType"), m = r.let("format");
      r.if((0, be._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(v, (0, be._)`${g}.type || "string"`).assign(m, (0, be._)`${g}.validate`), () => r.assign(v, (0, be._)`"string"`).assign(m, g)), e.fail$data((0, be.or)(w(), P()));
      function w() {
        return i.strictSchema === !1 ? be.nil : (0, be._)`${c} && !${m}`;
      }
      function P() {
        const j = u.$async ? (0, be._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, be._)`${m}(${n})`, k = (0, be._)`(typeof ${m} == "function" ? ${j} : ${m}.test(${n}))`;
        return (0, be._)`${m} && ${m} !== true && ${v} === ${t} && !${k}`;
      }
    }
    function p() {
      const $ = h.formats[a];
      if (!$) {
        w();
        return;
      }
      if ($ === !0)
        return;
      const [g, v, m] = P($);
      g === t && e.pass(j());
      function w() {
        if (i.strictSchema === !1) {
          h.logger.warn(k());
          return;
        }
        throw new Error(k());
        function k() {
          return `unknown format "${a}" ignored in schema at path "${d}"`;
        }
      }
      function P(k) {
        const V = k instanceof RegExp ? (0, be.regexpCode)(k) : i.code.formats ? (0, be._)`${i.code.formats}${(0, be.getProperty)(a)}` : void 0, q = r.scopeValue("formats", { key: a, ref: k, code: V });
        return typeof k == "object" && !(k instanceof RegExp) ? [k.type || "string", k.validate, (0, be._)`${q}.validate`] : ["string", k, q];
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
ko.default = wg;
Object.defineProperty(To, "__esModule", { value: !0 });
const Eg = ko, bg = [Eg.default];
To.default = bg;
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
Object.defineProperty(ro, "__esModule", { value: !0 });
const Sg = no, Pg = ao, Ng = go, Rg = To, Bi = ur, Og = [
  Sg.default,
  Pg.default,
  (0, Ng.default)(),
  Rg.default,
  Bi.metadataVocabulary,
  Bi.contentVocabulary
];
ro.default = Og;
var Ao = {}, rs = {};
Object.defineProperty(rs, "__esModule", { value: !0 });
rs.DiscrError = void 0;
var Ji;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Ji || (rs.DiscrError = Ji = {}));
Object.defineProperty(Ao, "__esModule", { value: !0 });
const nr = oe, Ks = rs, Wi = Fe, Ig = Zn(), jg = J, Tg = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Ks.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, nr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, kg = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: Tg,
  code(e) {
    const { gen: t, data: r, schema: n, parentSchema: s, it: a } = e, { oneOf: c } = s;
    if (!a.opts.discriminator)
      throw new Error("discriminator: requires discriminator option");
    const o = n.propertyName;
    if (typeof o != "string")
      throw new Error("discriminator: requires propertyName");
    if (n.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!c)
      throw new Error("discriminator: requires oneOf keyword");
    const i = t.let("valid", !1), d = t.const("tag", (0, nr._)`${r}${(0, nr.getProperty)(o)}`);
    t.if((0, nr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Ks.DiscrError.Tag, tag: d, tagName: o })), e.ok(i);
    function u() {
      const p = b();
      t.if(!1);
      for (const $ in p)
        t.elseIf((0, nr._)`${d} === ${$}`), t.assign(i, h(p[$]));
      t.else(), e.error(!1, { discrError: Ks.DiscrError.Mapping, tag: d, tagName: o }), t.endIf();
    }
    function h(p) {
      const $ = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: p }, $);
      return e.mergeEvaluated(g, nr.Name), $;
    }
    function b() {
      var p;
      const $ = {}, g = m(s);
      let v = !0;
      for (let j = 0; j < c.length; j++) {
        let k = c[j];
        if (k != null && k.$ref && !(0, jg.schemaHasRulesButRef)(k, a.self.RULES)) {
          const q = k.$ref;
          if (k = Wi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, q), k instanceof Wi.SchemaEnv && (k = k.schema), k === void 0)
            throw new Ig.default(a.opts.uriResolver, a.baseId, q);
        }
        const V = (p = k == null ? void 0 : k.properties) === null || p === void 0 ? void 0 : p[o];
        if (typeof V != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${o}"`);
        v = v && (g || m(k)), w(V, j);
      }
      if (!v)
        throw new Error(`discriminator: "${o}" must be required`);
      return $;
      function m({ required: j }) {
        return Array.isArray(j) && j.includes(o);
      }
      function w(j, k) {
        if (j.const)
          P(j.const, k);
        else if (j.enum)
          for (const V of j.enum)
            P(V, k);
        else
          throw new Error(`discriminator: "properties/${o}" must have "const" or "enum"`);
      }
      function P(j, k) {
        if (typeof j != "string" || j in $)
          throw new Error(`discriminator: "${o}" values must be unique strings`);
        $[j] = k;
      }
    }
  }
};
Ao.default = kg;
const Ag = "http://json-schema.org/draft-07/schema#", Cg = "http://json-schema.org/draft-07/schema#", Dg = "Core schema meta-schema", Mg = {
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
}, Lg = [
  "object",
  "boolean"
], Vg = {
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
}, Fg = {
  $schema: Ag,
  $id: Cg,
  title: Dg,
  definitions: Mg,
  type: Lg,
  properties: Vg,
  default: !0
};
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
  const r = dl, n = ro, s = Ao, a = Fg, c = ["/properties"], o = "http://json-schema.org/draft-07/schema";
  class i extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach(($) => this.addVocabulary($)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const $ = this.opts.$data ? this.$dataMetaSchema(a, c) : a;
      this.addMetaSchema($, o, !1), this.refs["http://json-schema.org/schema"] = o;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv = i, e.exports = t = i, e.exports.Ajv = i, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = i;
  var d = Qn();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
  } });
  var u = oe;
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
  var h = xa();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var b = Zn();
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return b.default;
  } });
})(Ms, Ms.exports);
var zg = Ms.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = zg, r = oe, n = r.operators, s = {
    formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
    formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
    formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
    formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
  }, a = {
    message: ({ keyword: o, schemaCode: i }) => (0, r.str)`should be ${s[o].okStr} ${i}`,
    params: ({ keyword: o, schemaCode: i }) => (0, r._)`{comparison: ${s[o].okStr}, limit: ${i}}`
  };
  e.formatLimitDefinition = {
    keyword: Object.keys(s),
    type: "string",
    schemaType: "string",
    $data: !0,
    error: a,
    code(o) {
      const { gen: i, data: d, schemaCode: u, keyword: h, it: b } = o, { opts: p, self: $ } = b;
      if (!p.validateFormats)
        return;
      const g = new t.KeywordCxt(b, $.RULES.all.format.definition, "format");
      g.$data ? v() : m();
      function v() {
        const P = i.scopeValue("formats", {
          ref: $.formats,
          code: p.code.formats
        }), j = i.const("fmt", (0, r._)`${P}[${g.schemaCode}]`);
        o.fail$data((0, r.or)((0, r._)`typeof ${j} != "object"`, (0, r._)`${j} instanceof RegExp`, (0, r._)`typeof ${j}.compare != "function"`, w(j)));
      }
      function m() {
        const P = g.schema, j = $.formats[P];
        if (!j || j === !0)
          return;
        if (typeof j != "object" || j instanceof RegExp || typeof j.compare != "function")
          throw new Error(`"${h}": format "${P}" does not define "compare" function`);
        const k = i.scopeValue("formats", {
          key: P,
          ref: j,
          code: p.code.formats ? (0, r._)`${p.code.formats}${(0, r.getProperty)(P)}` : void 0
        });
        o.fail$data(w(k));
      }
      function w(P) {
        return (0, r._)`${P}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const c = (o) => (o.addKeyword(e.formatLimitDefinition), o);
  e.default = c;
})(ul);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = ll, n = ul, s = oe, a = new s.Name("fullFormats"), c = new s.Name("fastFormats"), o = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return i(d, u, r.fullFormats, a), d;
    const [h, b] = u.mode === "fast" ? [r.fastFormats, c] : [r.fullFormats, a], p = u.formats || r.formatNames;
    return i(d, p, h, b), u.keywords && (0, n.default)(d), d;
  };
  o.get = (d, u = "full") => {
    const b = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!b)
      throw new Error(`Unknown format "${d}"`);
    return b;
  };
  function i(d, u, h, b) {
    var p, $;
    (p = ($ = d.opts.code).formats) !== null && p !== void 0 || ($.formats = (0, s._)`require("ajv-formats/dist/formats").${b}`);
    for (const g of u)
      d.addFormat(g, h[g]);
  }
  e.exports = t = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
})(Ds, Ds.exports);
var qg = Ds.exports;
const Ug = /* @__PURE__ */ Nc(qg), Kg = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const s = Object.getOwnPropertyDescriptor(e, r), a = Object.getOwnPropertyDescriptor(t, r);
  !Gg(s, a) && n || Object.defineProperty(e, r, a);
}, Gg = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, Hg = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, Bg = (e, t) => `/* Wrapped ${e}*/
${t}`, Jg = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), Wg = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Xg = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, s = Bg.bind(null, n, t.toString());
  Object.defineProperty(s, "name", Wg);
  const { writable: a, enumerable: c, configurable: o } = Jg;
  Object.defineProperty(e, "toString", { value: s, writable: a, enumerable: c, configurable: o });
};
function Yg(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const s of Reflect.ownKeys(t))
    Kg(e, t, s, r);
  return Hg(e, t), Xg(e, t, n), e;
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
  let c, o, i;
  const d = function(...u) {
    const h = this, b = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), a && (i = e.apply(h, u));
    }, p = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), a && (i = e.apply(h, u));
    }, $ = s && !c;
    return clearTimeout(c), c = setTimeout(b, r), n > 0 && n !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(p, n)), $ && (i = e.apply(h, u)), i;
  };
  return Yg(d, e), d.cancel = () => {
    c && (clearTimeout(c), c = void 0), o && (clearTimeout(o), o = void 0);
  }, d;
};
var Gs = { exports: {} };
const Qg = "2.0.0", Vl = 256, Zg = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, xg = 16, e_ = Vl - 6, t_ = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ns = {
  MAX_LENGTH: Vl,
  MAX_SAFE_COMPONENT_LENGTH: xg,
  MAX_SAFE_BUILD_LENGTH: e_,
  MAX_SAFE_INTEGER: Zg,
  RELEASE_TYPES: t_,
  SEMVER_SPEC_VERSION: Qg,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const r_ = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ss = r_;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: s
  } = ns, a = ss;
  t = e.exports = {};
  const c = t.re = [], o = t.safeRe = [], i = t.src = [], d = t.safeSrc = [], u = t.t = {};
  let h = 0;
  const b = "[a-zA-Z0-9-]", p = [
    ["\\s", 1],
    ["\\d", s],
    [b, n]
  ], $ = (v) => {
    for (const [m, w] of p)
      v = v.split(`${m}*`).join(`${m}{0,${w}}`).split(`${m}+`).join(`${m}{1,${w}}`);
    return v;
  }, g = (v, m, w) => {
    const P = $(m), j = h++;
    a(v, j, m), u[v] = j, i[j] = m, d[j] = P, c[j] = new RegExp(m, w ? "g" : void 0), o[j] = new RegExp(P, w ? "g" : void 0);
  };
  g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${b}*`), g("MAINVERSION", `(${i[u.NUMERICIDENTIFIER]})\\.(${i[u.NUMERICIDENTIFIER]})\\.(${i[u.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${i[u.NUMERICIDENTIFIERLOOSE]})\\.(${i[u.NUMERICIDENTIFIERLOOSE]})\\.(${i[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${i[u.NONNUMERICIDENTIFIER]}|${i[u.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${i[u.NONNUMERICIDENTIFIER]}|${i[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${i[u.PRERELEASEIDENTIFIER]}(?:\\.${i[u.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${i[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${i[u.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${b}+`), g("BUILD", `(?:\\+(${i[u.BUILDIDENTIFIER]}(?:\\.${i[u.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${i[u.MAINVERSION]}${i[u.PRERELEASE]}?${i[u.BUILD]}?`), g("FULL", `^${i[u.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${i[u.MAINVERSIONLOOSE]}${i[u.PRERELEASELOOSE]}?${i[u.BUILD]}?`), g("LOOSE", `^${i[u.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${i[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${i[u.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${i[u.XRANGEIDENTIFIER]})(?:\\.(${i[u.XRANGEIDENTIFIER]})(?:\\.(${i[u.XRANGEIDENTIFIER]})(?:${i[u.PRERELEASE]})?${i[u.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${i[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${i[u.XRANGEIDENTIFIERLOOSE]})(?:${i[u.PRERELEASELOOSE]})?${i[u.BUILD]}?)?)?`), g("XRANGE", `^${i[u.GTLT]}\\s*${i[u.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${i[u.GTLT]}\\s*${i[u.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), g("COERCE", `${i[u.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", i[u.COERCEPLAIN] + `(?:${i[u.PRERELEASE]})?(?:${i[u.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", i[u.COERCE], !0), g("COERCERTLFULL", i[u.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${i[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", g("TILDE", `^${i[u.LONETILDE]}${i[u.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${i[u.LONETILDE]}${i[u.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${i[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", g("CARET", `^${i[u.LONECARET]}${i[u.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${i[u.LONECARET]}${i[u.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${i[u.GTLT]}\\s*(${i[u.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${i[u.GTLT]}\\s*(${i[u.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${i[u.GTLT]}\\s*(${i[u.LOOSEPLAIN]}|${i[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${i[u.XRANGEPLAIN]})\\s+-\\s+(${i[u.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${i[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${i[u.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(Gs, Gs.exports);
var Jr = Gs.exports;
const n_ = Object.freeze({ loose: !0 }), s_ = Object.freeze({}), a_ = (e) => e ? typeof e != "object" ? n_ : e : s_;
var Co = a_;
const Yi = /^[0-9]+$/, Fl = (e, t) => {
  const r = Yi.test(e), n = Yi.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, o_ = (e, t) => Fl(t, e);
var zl = {
  compareIdentifiers: Fl,
  rcompareIdentifiers: o_
};
const ln = ss, { MAX_LENGTH: Qi, MAX_SAFE_INTEGER: un } = ns, { safeRe: dn, t: fn } = Jr, i_ = Co, { compareIdentifiers: xt } = zl;
let c_ = class it {
  constructor(t, r) {
    if (r = i_(r), t instanceof it) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > Qi)
      throw new TypeError(
        `version is longer than ${Qi} characters`
      );
    ln("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? dn[fn.LOOSE] : dn[fn.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > un || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > un || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > un || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((s) => {
      if (/^[0-9]+$/.test(s)) {
        const a = +s;
        if (a >= 0 && a < un)
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
    if (ln("SemVer.compare", this.version, this.options, t), !(t instanceof it)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new it(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof it || (t = new it(t, this.options)), xt(this.major, t.major) || xt(this.minor, t.minor) || xt(this.patch, t.patch);
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
      if (ln("prerelease compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return xt(n, s);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof it || (t = new it(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], s = t.build[r];
      if (ln("build compare", r, n, s), n === void 0 && s === void 0)
        return 0;
      if (s === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === s)
        continue;
      return xt(n, s);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    if (t.startsWith("pre")) {
      if (!r && n === !1)
        throw new Error("invalid increment argument: identifier is empty");
      if (r) {
        const s = `-${r}`.match(this.options.loose ? dn[fn.PRERELEASELOOSE] : dn[fn.PRERELEASE]);
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
          n === !1 && (a = [r]), xt(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = a) : this.prerelease = a;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Me = c_;
const Zi = Me, l_ = (e, t, r = !1) => {
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
var gr = l_;
const u_ = gr, d_ = (e, t) => {
  const r = u_(e, t);
  return r ? r.version : null;
};
var f_ = d_;
const h_ = gr, m_ = (e, t) => {
  const r = h_(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var p_ = m_;
const xi = Me, $_ = (e, t, r, n, s) => {
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
var y_ = $_;
const ec = gr, g_ = (e, t) => {
  const r = ec(e, null, !0), n = ec(t, null, !0), s = r.compare(n);
  if (s === 0)
    return null;
  const a = s > 0, c = a ? r : n, o = a ? n : r, i = !!c.prerelease.length;
  if (!!o.prerelease.length && !i) {
    if (!o.patch && !o.minor)
      return "major";
    if (o.compareMain(c) === 0)
      return o.minor && !o.patch ? "minor" : "patch";
  }
  const u = i ? "pre" : "";
  return r.major !== n.major ? u + "major" : r.minor !== n.minor ? u + "minor" : r.patch !== n.patch ? u + "patch" : "prerelease";
};
var __ = g_;
const v_ = Me, w_ = (e, t) => new v_(e, t).major;
var E_ = w_;
const b_ = Me, S_ = (e, t) => new b_(e, t).minor;
var P_ = S_;
const N_ = Me, R_ = (e, t) => new N_(e, t).patch;
var O_ = R_;
const I_ = gr, j_ = (e, t) => {
  const r = I_(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var T_ = j_;
const tc = Me, k_ = (e, t, r) => new tc(e, r).compare(new tc(t, r));
var at = k_;
const A_ = at, C_ = (e, t, r) => A_(t, e, r);
var D_ = C_;
const M_ = at, L_ = (e, t) => M_(e, t, !0);
var V_ = L_;
const rc = Me, F_ = (e, t, r) => {
  const n = new rc(e, r), s = new rc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var Do = F_;
const z_ = Do, q_ = (e, t) => e.sort((r, n) => z_(r, n, t));
var U_ = q_;
const K_ = Do, G_ = (e, t) => e.sort((r, n) => K_(n, r, t));
var H_ = G_;
const B_ = at, J_ = (e, t, r) => B_(e, t, r) > 0;
var as = J_;
const W_ = at, X_ = (e, t, r) => W_(e, t, r) < 0;
var Mo = X_;
const Y_ = at, Q_ = (e, t, r) => Y_(e, t, r) === 0;
var ql = Q_;
const Z_ = at, x_ = (e, t, r) => Z_(e, t, r) !== 0;
var Ul = x_;
const ev = at, tv = (e, t, r) => ev(e, t, r) >= 0;
var Lo = tv;
const rv = at, nv = (e, t, r) => rv(e, t, r) <= 0;
var Vo = nv;
const sv = ql, av = Ul, ov = as, iv = Lo, cv = Mo, lv = Vo, uv = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return sv(e, r, n);
    case "!=":
      return av(e, r, n);
    case ">":
      return ov(e, r, n);
    case ">=":
      return iv(e, r, n);
    case "<":
      return cv(e, r, n);
    case "<=":
      return lv(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var Kl = uv;
const dv = Me, fv = gr, { safeRe: hn, t: mn } = Jr, hv = (e, t) => {
  if (e instanceof dv)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? hn[mn.COERCEFULL] : hn[mn.COERCE]);
  else {
    const i = t.includePrerelease ? hn[mn.COERCERTLFULL] : hn[mn.COERCERTL];
    let d;
    for (; (d = i.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), i.lastIndex = d.index + d[1].length + d[2].length;
    i.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], s = r[3] || "0", a = r[4] || "0", c = t.includePrerelease && r[5] ? `-${r[5]}` : "", o = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return fv(`${n}.${s}.${a}${c}${o}`, t);
};
var mv = hv;
class pv {
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
var $v = pv, vs, nc;
function ot() {
  if (nc) return vs;
  nc = 1;
  const e = /\s+/g;
  class t {
    constructor(L, H) {
      if (H = s(H), L instanceof t)
        return L.loose === !!H.loose && L.includePrerelease === !!H.includePrerelease ? L : new t(L.raw, H);
      if (L instanceof a)
        return this.raw = L.value, this.set = [[L]], this.formatted = void 0, this;
      if (this.options = H, this.loose = !!H.loose, this.includePrerelease = !!H.includePrerelease, this.raw = L.trim().replace(e, " "), this.set = this.raw.split("||").map((U) => this.parseRange(U.trim())).filter((U) => U.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const U = this.set[0];
        if (this.set = this.set.filter((Q) => !g(Q[0])), this.set.length === 0)
          this.set = [U];
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
          const H = this.set[L];
          for (let U = 0; U < H.length; U++)
            U > 0 && (this.formatted += " "), this.formatted += H[U].toString().trim();
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
      const U = ((this.options.includePrerelease && p) | (this.options.loose && $)) + ":" + L, Q = n.get(U);
      if (Q)
        return Q;
      const G = this.options.loose, I = G ? i[d.HYPHENRANGELOOSE] : i[d.HYPHENRANGE];
      L = L.replace(I, X(this.options.includePrerelease)), c("hyphen replace", L), L = L.replace(i[d.COMPARATORTRIM], u), c("comparator trim", L), L = L.replace(i[d.TILDETRIM], h), c("tilde trim", L), L = L.replace(i[d.CARETTRIM], b), c("caret trim", L);
      let _ = L.split(" ").map((f) => w(f, this.options)).join(" ").split(/\s+/).map((f) => z(f, this.options));
      G && (_ = _.filter((f) => (c("loose invalid filter", f, this.options), !!f.match(i[d.COMPARATORLOOSE])))), c("range list", _);
      const R = /* @__PURE__ */ new Map(), E = _.map((f) => new a(f, this.options));
      for (const f of E) {
        if (g(f))
          return [f];
        R.set(f.value, f);
      }
      R.size > 1 && R.has("") && R.delete("");
      const l = [...R.values()];
      return n.set(U, l), l;
    }
    intersects(L, H) {
      if (!(L instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((U) => m(U, H) && L.set.some((Q) => m(Q, H) && U.every((G) => Q.every((I) => G.intersects(I, H)))));
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
      for (let H = 0; H < this.set.length; H++)
        if (W(this.set[H], L, this.options))
          return !0;
      return !1;
    }
  }
  vs = t;
  const r = $v, n = new r(), s = Co, a = os(), c = ss, o = Me, {
    safeRe: i,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: b
  } = Jr, { FLAG_INCLUDE_PRERELEASE: p, FLAG_LOOSE: $ } = ns, g = (A) => A.value === "<0.0.0-0", v = (A) => A.value === "", m = (A, L) => {
    let H = !0;
    const U = A.slice();
    let Q = U.pop();
    for (; H && U.length; )
      H = U.every((G) => Q.intersects(G, L)), Q = U.pop();
    return H;
  }, w = (A, L) => (c("comp", A, L), A = V(A, L), c("caret", A), A = j(A, L), c("tildes", A), A = x(A, L), c("xrange", A), A = ce(A, L), c("stars", A), A), P = (A) => !A || A.toLowerCase() === "x" || A === "*", j = (A, L) => A.trim().split(/\s+/).map((H) => k(H, L)).join(" "), k = (A, L) => {
    const H = L.loose ? i[d.TILDELOOSE] : i[d.TILDE];
    return A.replace(H, (U, Q, G, I, _) => {
      c("tilde", A, U, Q, G, I, _);
      let R;
      return P(Q) ? R = "" : P(G) ? R = `>=${Q}.0.0 <${+Q + 1}.0.0-0` : P(I) ? R = `>=${Q}.${G}.0 <${Q}.${+G + 1}.0-0` : _ ? (c("replaceTilde pr", _), R = `>=${Q}.${G}.${I}-${_} <${Q}.${+G + 1}.0-0`) : R = `>=${Q}.${G}.${I} <${Q}.${+G + 1}.0-0`, c("tilde return", R), R;
    });
  }, V = (A, L) => A.trim().split(/\s+/).map((H) => q(H, L)).join(" "), q = (A, L) => {
    c("caret", A, L);
    const H = L.loose ? i[d.CARETLOOSE] : i[d.CARET], U = L.includePrerelease ? "-0" : "";
    return A.replace(H, (Q, G, I, _, R) => {
      c("caret", A, Q, G, I, _, R);
      let E;
      return P(G) ? E = "" : P(I) ? E = `>=${G}.0.0${U} <${+G + 1}.0.0-0` : P(_) ? G === "0" ? E = `>=${G}.${I}.0${U} <${G}.${+I + 1}.0-0` : E = `>=${G}.${I}.0${U} <${+G + 1}.0.0-0` : R ? (c("replaceCaret pr", R), G === "0" ? I === "0" ? E = `>=${G}.${I}.${_}-${R} <${G}.${I}.${+_ + 1}-0` : E = `>=${G}.${I}.${_}-${R} <${G}.${+I + 1}.0-0` : E = `>=${G}.${I}.${_}-${R} <${+G + 1}.0.0-0`) : (c("no pr"), G === "0" ? I === "0" ? E = `>=${G}.${I}.${_}${U} <${G}.${I}.${+_ + 1}-0` : E = `>=${G}.${I}.${_}${U} <${G}.${+I + 1}.0-0` : E = `>=${G}.${I}.${_} <${+G + 1}.0.0-0`), c("caret return", E), E;
    });
  }, x = (A, L) => (c("replaceXRanges", A, L), A.split(/\s+/).map((H) => re(H, L)).join(" ")), re = (A, L) => {
    A = A.trim();
    const H = L.loose ? i[d.XRANGELOOSE] : i[d.XRANGE];
    return A.replace(H, (U, Q, G, I, _, R) => {
      c("xRange", A, U, Q, G, I, _, R);
      const E = P(G), l = E || P(I), f = l || P(_), N = f;
      return Q === "=" && N && (Q = ""), R = L.includePrerelease ? "-0" : "", E ? Q === ">" || Q === "<" ? U = "<0.0.0-0" : U = "*" : Q && N ? (l && (I = 0), _ = 0, Q === ">" ? (Q = ">=", l ? (G = +G + 1, I = 0, _ = 0) : (I = +I + 1, _ = 0)) : Q === "<=" && (Q = "<", l ? G = +G + 1 : I = +I + 1), Q === "<" && (R = "-0"), U = `${Q + G}.${I}.${_}${R}`) : l ? U = `>=${G}.0.0${R} <${+G + 1}.0.0-0` : f && (U = `>=${G}.${I}.0${R} <${G}.${+I + 1}.0-0`), c("xRange return", U), U;
    });
  }, ce = (A, L) => (c("replaceStars", A, L), A.trim().replace(i[d.STAR], "")), z = (A, L) => (c("replaceGTE0", A, L), A.trim().replace(i[L.includePrerelease ? d.GTE0PRE : d.GTE0], "")), X = (A) => (L, H, U, Q, G, I, _, R, E, l, f, N) => (P(U) ? H = "" : P(Q) ? H = `>=${U}.0.0${A ? "-0" : ""}` : P(G) ? H = `>=${U}.${Q}.0${A ? "-0" : ""}` : I ? H = `>=${H}` : H = `>=${H}${A ? "-0" : ""}`, P(E) ? R = "" : P(l) ? R = `<${+E + 1}.0.0-0` : P(f) ? R = `<${E}.${+l + 1}.0-0` : N ? R = `<=${E}.${l}.${f}-${N}` : A ? R = `<${E}.${l}.${+f + 1}-0` : R = `<=${R}`, `${H} ${R}`.trim()), W = (A, L, H) => {
    for (let U = 0; U < A.length; U++)
      if (!A[U].test(L))
        return !1;
    if (L.prerelease.length && !H.includePrerelease) {
      for (let U = 0; U < A.length; U++)
        if (c(A[U].semver), A[U].semver !== a.ANY && A[U].semver.prerelease.length > 0) {
          const Q = A[U].semver;
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
      u = u.trim().split(/\s+/).join(" "), c("comparator", u, h), this.options = h, this.loose = !!h.loose, this.parse(u), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, c("comp", this);
    }
    parse(u) {
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], b = u.match(h);
      if (!b)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = b[1] !== void 0 ? b[1] : "", this.operator === "=" && (this.operator = ""), b[2] ? this.semver = new o(b[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(u) {
      if (c("Comparator.test", u, this.options.loose), this.semver === e || u === e)
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
      return this.operator === "" ? this.value === "" ? !0 : new i(u.value, h).test(this.value) : u.operator === "" ? u.value === "" ? !0 : new i(this.value, h).test(u.semver) : (h = r(h), h.includePrerelease && (this.value === "<0.0.0-0" || u.value === "<0.0.0-0") || !h.includePrerelease && (this.value.startsWith("<0.0.0") || u.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && u.operator.startsWith(">") || this.operator.startsWith("<") && u.operator.startsWith("<") || this.semver.version === u.semver.version && this.operator.includes("=") && u.operator.includes("=") || a(this.semver, "<", u.semver, h) && this.operator.startsWith(">") && u.operator.startsWith("<") || a(this.semver, ">", u.semver, h) && this.operator.startsWith("<") && u.operator.startsWith(">")));
    }
  }
  ws = t;
  const r = Co, { safeRe: n, t: s } = Jr, a = Kl, c = ss, o = Me, i = ot();
  return ws;
}
const yv = ot(), gv = (e, t, r) => {
  try {
    t = new yv(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var is = gv;
const _v = ot(), vv = (e, t) => new _v(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var wv = vv;
const Ev = Me, bv = ot(), Sv = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new bv(t, r);
  } catch {
    return null;
  }
  return e.forEach((c) => {
    a.test(c) && (!n || s.compare(c) === -1) && (n = c, s = new Ev(n, r));
  }), n;
};
var Pv = Sv;
const Nv = Me, Rv = ot(), Ov = (e, t, r) => {
  let n = null, s = null, a = null;
  try {
    a = new Rv(t, r);
  } catch {
    return null;
  }
  return e.forEach((c) => {
    a.test(c) && (!n || s.compare(c) === 1) && (n = c, s = new Nv(n, r));
  }), n;
};
var Iv = Ov;
const Es = Me, jv = ot(), ac = as, Tv = (e, t) => {
  e = new jv(e, t);
  let r = new Es("0.0.0");
  if (e.test(r) || (r = new Es("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((c) => {
      const o = new Es(c.semver.version);
      switch (c.operator) {
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
          throw new Error(`Unexpected operation: ${c.operator}`);
      }
    }), a && (!r || ac(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var kv = Tv;
const Av = ot(), Cv = (e, t) => {
  try {
    return new Av(e, t).range || "*";
  } catch {
    return null;
  }
};
var Dv = Cv;
const Mv = Me, Gl = os(), { ANY: Lv } = Gl, Vv = ot(), Fv = is, oc = as, ic = Mo, zv = Vo, qv = Lo, Uv = (e, t, r, n) => {
  e = new Mv(e, n), t = new Vv(t, n);
  let s, a, c, o, i;
  switch (r) {
    case ">":
      s = oc, a = zv, c = ic, o = ">", i = ">=";
      break;
    case "<":
      s = ic, a = qv, c = oc, o = "<", i = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Fv(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, b = null;
    if (u.forEach((p) => {
      p.semver === Lv && (p = new Gl(">=0.0.0")), h = h || p, b = b || p, s(p.semver, h.semver, n) ? h = p : c(p.semver, b.semver, n) && (b = p);
    }), h.operator === o || h.operator === i || (!b.operator || b.operator === o) && a(e, b.semver))
      return !1;
    if (b.operator === i && c(e, b.semver))
      return !1;
  }
  return !0;
};
var Fo = Uv;
const Kv = Fo, Gv = (e, t, r) => Kv(e, t, ">", r);
var Hv = Gv;
const Bv = Fo, Jv = (e, t, r) => Bv(e, t, "<", r);
var Wv = Jv;
const cc = ot(), Xv = (e, t, r) => (e = new cc(e, r), t = new cc(t, r), e.intersects(t, r));
var Yv = Xv;
const Qv = is, Zv = at;
var xv = (e, t, r) => {
  const n = [];
  let s = null, a = null;
  const c = e.sort((u, h) => Zv(u, h, r));
  for (const u of c)
    Qv(u, t, r) ? (a = u, s || (s = u)) : (a && n.push([s, a]), a = null, s = null);
  s && n.push([s, null]);
  const o = [];
  for (const [u, h] of n)
    u === h ? o.push(u) : !h && u === c[0] ? o.push("*") : h ? u === c[0] ? o.push(`<=${h}`) : o.push(`${u} - ${h}`) : o.push(`>=${u}`);
  const i = o.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return i.length < d.length ? i : t;
};
const lc = ot(), zo = os(), { ANY: bs } = zo, Ir = is, qo = at, ew = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new lc(e, r), t = new lc(t, r);
  let n = !1;
  e: for (const s of e.set) {
    for (const a of t.set) {
      const c = rw(s, a, r);
      if (n = n || c !== null, c)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, tw = [new zo(">=0.0.0-0")], uc = [new zo(">=0.0.0")], rw = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === bs) {
    if (t.length === 1 && t[0].semver === bs)
      return !0;
    r.includePrerelease ? e = tw : e = uc;
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
  let c;
  if (s && a) {
    if (c = qo(s.semver, a.semver, r), c > 0)
      return null;
    if (c === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const p of n) {
    if (s && !Ir(p, String(s), r) || a && !Ir(p, String(a), r))
      return null;
    for (const $ of t)
      if (!Ir(p, String($), r))
        return !1;
    return !0;
  }
  let o, i, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, b = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const p of t) {
    if (u = u || p.operator === ">" || p.operator === ">=", d = d || p.operator === "<" || p.operator === "<=", s) {
      if (b && p.semver.prerelease && p.semver.prerelease.length && p.semver.major === b.major && p.semver.minor === b.minor && p.semver.patch === b.patch && (b = !1), p.operator === ">" || p.operator === ">=") {
        if (o = dc(s, p, r), o === p && o !== s)
          return !1;
      } else if (s.operator === ">=" && !Ir(s.semver, String(p), r))
        return !1;
    }
    if (a) {
      if (h && p.semver.prerelease && p.semver.prerelease.length && p.semver.major === h.major && p.semver.minor === h.minor && p.semver.patch === h.patch && (h = !1), p.operator === "<" || p.operator === "<=") {
        if (i = fc(a, p, r), i === p && i !== a)
          return !1;
      } else if (a.operator === "<=" && !Ir(a.semver, String(p), r))
        return !1;
    }
    if (!p.operator && (a || s) && c !== 0)
      return !1;
  }
  return !(s && d && !a && c !== 0 || a && u && !s && c !== 0 || b || h);
}, dc = (e, t, r) => {
  if (!e)
    return t;
  const n = qo(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, fc = (e, t, r) => {
  if (!e)
    return t;
  const n = qo(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var nw = ew;
const Ss = Jr, hc = ns, sw = Me, mc = zl, aw = gr, ow = f_, iw = p_, cw = y_, lw = __, uw = E_, dw = P_, fw = O_, hw = T_, mw = at, pw = D_, $w = V_, yw = Do, gw = U_, _w = H_, vw = as, ww = Mo, Ew = ql, bw = Ul, Sw = Lo, Pw = Vo, Nw = Kl, Rw = mv, Ow = os(), Iw = ot(), jw = is, Tw = wv, kw = Pv, Aw = Iv, Cw = kv, Dw = Dv, Mw = Fo, Lw = Hv, Vw = Wv, Fw = Yv, zw = xv, qw = nw;
var Uw = {
  parse: aw,
  valid: ow,
  clean: iw,
  inc: cw,
  diff: lw,
  major: uw,
  minor: dw,
  patch: fw,
  prerelease: hw,
  compare: mw,
  rcompare: pw,
  compareLoose: $w,
  compareBuild: yw,
  sort: gw,
  rsort: _w,
  gt: vw,
  lt: ww,
  eq: Ew,
  neq: bw,
  gte: Sw,
  lte: Pw,
  cmp: Nw,
  coerce: Rw,
  Comparator: Ow,
  Range: Iw,
  satisfies: jw,
  toComparators: Tw,
  maxSatisfying: kw,
  minSatisfying: Aw,
  minVersion: Cw,
  validRange: Dw,
  outside: Mw,
  gtr: Lw,
  ltr: Vw,
  intersects: Fw,
  simplifyRange: zw,
  subset: qw,
  SemVer: sw,
  re: Ss.re,
  src: Ss.src,
  tokens: Ss.t,
  SEMVER_SPEC_VERSION: hc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: hc.RELEASE_TYPES,
  compareIdentifiers: mc.compareIdentifiers,
  rcompareIdentifiers: mc.rcompareIdentifiers
};
const er = /* @__PURE__ */ Nc(Uw), Kw = Object.prototype.toString, Gw = "[object Uint8Array]", Hw = "[object ArrayBuffer]";
function Hl(e, t, r) {
  return e ? e.constructor === t ? !0 : Kw.call(e) === r : !1;
}
function Bl(e) {
  return Hl(e, Uint8Array, Gw);
}
function Bw(e) {
  return Hl(e, ArrayBuffer, Hw);
}
function Jw(e) {
  return Bl(e) || Bw(e);
}
function Ww(e) {
  if (!Bl(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function Xw(e) {
  if (!Jw(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function pc(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((s, a) => s + a.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const s of e)
    Ww(s), r.set(s, n), n += s.length;
  return r;
}
const pn = {
  utf8: new globalThis.TextDecoder("utf8")
};
function $c(e, t = "utf8") {
  return Xw(e), pn[t] ?? (pn[t] = new globalThis.TextDecoder(t)), pn[t].decode(e);
}
function Yw(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const Qw = new globalThis.TextEncoder();
function Ps(e) {
  return Yw(e), Qw.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Zw = Ug.default, yc = "aes-256-cbc", tr = () => /* @__PURE__ */ Object.create(null), xw = (e) => e != null, eE = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Pn = "__internal__", Ns = `${Pn}.migrations.version`;
var jt, $t, Ue, yt;
class tE {
  constructor(t = {}) {
    wr(this, "path");
    wr(this, "events");
    Er(this, jt);
    Er(this, $t);
    Er(this, Ue);
    Er(this, yt, {});
    wr(this, "_deserialize", (t) => JSON.parse(t));
    wr(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
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
      r.cwd = cu(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (br(this, Ue, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const c = new p$.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      Zw(c);
      const o = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      br(this, jt, c.compile(o));
      for (const [i, d] of Object.entries(r.schema ?? {}))
        d != null && d.default && (_e(this, yt)[i] = d.default);
    }
    r.defaults && br(this, yt, {
      ..._e(this, yt),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), br(this, $t, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = me.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(tr(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      Zl.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (_e(this, Ue).accessPropertiesByDotNotation)
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
      throw new TypeError(`Please don't use the ${Pn} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, c) => {
      eE(a, c), _e(this, Ue).accessPropertiesByDotNotation ? Go(n, a, c) : n[a] = c;
    };
    if (typeof t == "object") {
      const a = t;
      for (const [c, o] of Object.entries(a))
        s(c, o);
    } else
      s(t, r);
    this.store = n;
  }
  has(t) {
    return _e(this, Ue).accessPropertiesByDotNotation ? su(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      xw(_e(this, yt)[r]) && this.set(r, _e(this, yt)[r]);
  }
  delete(t) {
    const { store: r } = this;
    _e(this, Ue).accessPropertiesByDotNotation ? nu(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = tr();
    for (const t of Object.keys(_e(this, yt)))
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
      const t = ae.readFileSync(this.path, _e(this, $t) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(tr(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), tr();
      if (_e(this, Ue).clearInvalidConfig && t.name === "SyntaxError")
        return tr();
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
    if (!_e(this, $t))
      return typeof t == "string" ? t : $c(t);
    try {
      const r = t.slice(0, 16), n = Sr.pbkdf2Sync(_e(this, $t), r.toString(), 1e4, 32, "sha512"), s = Sr.createDecipheriv(yc, n, r), a = t.slice(17), c = typeof a == "string" ? Ps(a) : a;
      return $c(pc([s.update(c), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, c = t();
      Ql(c, a) || (n = c, r.call(this, c, a));
    };
    return this.events.addEventListener("change", s), () => {
      this.events.removeEventListener("change", s);
    };
  }
  _validate(t) {
    if (!_e(this, jt) || _e(this, jt).call(this, t) || !_e(this, jt).errors)
      return;
    const n = _e(this, jt).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    ae.mkdirSync(me.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (_e(this, $t)) {
      const n = Sr.randomBytes(16), s = Sr.pbkdf2Sync(_e(this, $t), n.toString(), 1e4, 32, "sha512"), a = Sr.createCipheriv(yc, s, n);
      r = pc([n, Ps(":"), a.update(Ps(r)), a.final()]);
    }
    if (Ne.env.SNAP)
      ae.writeFileSync(this.path, r, { mode: _e(this, Ue).configFileMode });
    else
      try {
        Pc(this.path, r, { mode: _e(this, Ue).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          ae.writeFileSync(this.path, r, { mode: _e(this, Ue).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), ae.existsSync(this.path) || this._write(tr()), Ne.platform === "win32" ? ae.watch(this.path, { persistent: !1 }, Xi(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : ae.watchFile(this.path, { persistent: !1 }, Xi(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(Ns, "0.0.0");
    const a = Object.keys(t).filter((o) => this._shouldPerformMigration(o, s, r));
    let c = { ...this.store };
    for (const o of a)
      try {
        n && n(this, {
          fromVersion: s,
          toVersion: o,
          finalVersion: r,
          versions: a
        });
        const i = t[o];
        i == null || i(this), this._set(Ns, o), s = o, c = { ...this.store };
      } catch (i) {
        throw this.store = c, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${i}`);
      }
    (this._isVersionInRangeFormat(s) || !er.eq(s, r)) && this._set(Ns, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === Pn ? !0 : typeof t != "string" ? !1 : _e(this, Ue).accessPropertiesByDotNotation ? !!t.startsWith(`${Pn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return er.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && er.satisfies(r, t) ? !1 : er.satisfies(n, t) : !(er.lte(t, r) || er.gt(t, n));
  }
  _get(t, r) {
    return ru(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    Go(n, t, r), this.store = n;
  }
}
jt = new WeakMap(), $t = new WeakMap(), Ue = new WeakMap(), yt = new WeakMap();
const { app: Nn, ipcMain: Hs, shell: rE } = vc;
let gc = !1;
const _c = () => {
  if (!Hs || !Nn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Nn.getPath("userData"),
    appVersion: Nn.getVersion()
  };
  return gc || (Hs.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), gc = !0), e;
};
class nE extends tE {
  constructor(t) {
    let r, n;
    if (Ne.type === "renderer") {
      const s = vc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else Hs && Nn && ({ defaultCwd: r, appVersion: n } = _c());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = me.isAbsolute(t.cwd) ? t.cwd : me.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    _c();
  }
  async openInEditor() {
    const t = await rE.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const At = Z.dirname(xl(import.meta.url));
process.env.APP_ROOT = Z.join(At, "..");
const Bs = process.env.VITE_DEV_SERVER_URL, _E = Z.join(process.env.APP_ROOT, "dist-electron"), Jl = Z.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = Bs ? Z.join(process.env.APP_ROOT, "public") : Jl;
let ee, Rn = null;
const tt = /* @__PURE__ */ new Map();
let gt = null;
const Vn = {
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
}, On = new nE({
  defaults: {
    formData: Vn
  },
  name: "app-config"
});
rt.handle(
  "save-data",
  async (e, t, r) => {
    try {
      if (t === "all")
        On.set("formData", r);
      else {
        const s = { ...On.get("formData", Vn), ...r };
        On.set("formData", s);
      }
      return console.log("Dados salvos com sucesso para a chave:", t), !0;
    } catch (n) {
      return console.error("Erro ao salvar dados:", n), !1;
    }
  }
);
rt.handle("load-data", async () => {
  try {
    return On.get("formData", Vn);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), Vn;
  }
});
rt.handle("select-folder", async () => {
  const e = await wc.showOpenDialog(ee, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
rt.handle("select-file", async () => {
  const e = await wc.showOpenDialog(ee, {
    properties: ["openFile"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhum arquivo selecionado"), null;
  const t = e.filePaths[0];
  return console.log("Arquivo selecionado:", t), t;
});
rt.handle("clean-db", async () => (console.log("Limpando banco de dados..."), new Promise((e) => {
  setTimeout(() => {
    console.log("Banco de dados limpo com sucesso"), e(!0);
  }, 1e3);
})));
rt.handle(
  "print-pdf",
  async (e, t) => {
    try {
      const r = new Ec({
        width: 800,
        height: 600,
        show: !0,
        webPreferences: {
          preload: Z.join(At, "preload.mjs"),
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
rt.handle(
  "start-fork",
  async (e, { script: t, args: r = [] } = {}) => {
    const n = Z.dirname(Z.dirname(At));
    t || (t = "../back-end/dist/src/index.js");
    let s;
    if (Z.isAbsolute(t))
      s = t;
    else {
      const a = [
        // Prefer IPC-only CJS build
        Z.join(n, "backend", "dist", "index.js"),
        // Fallback to full build structure if present
        Z.join(n, "backend", "dist", "src", "index.js"),
        // TypeScript source (will use ts-node)
        Z.join(n, "backend", "src", "index.ts"),
        // Original provided script path fallbacks
        Z.join(At, t),
        Z.join(process.env.APP_ROOT || "", t),
        Z.join(Z.dirname(At), t),
        Z.join(n, t),
        Z.resolve(t)
      ];
      console.log("Trying paths:", a), s = a.find((c) => {
        try {
          const o = Ke.existsSync(c);
          return console.log(`Path ${c} exists: ${o}`), o;
        } catch {
          return !1;
        }
      }) || a[0];
    }
    console.log("Attempting to fork script at:", s), console.log("Script exists:", Ke.existsSync(s));
    try {
      const a = Z.join(n, "Frontend", "backend");
      if (s.startsWith(a)) {
        const o = [
          Z.join(n, "backend", "dist", "index.js"),
          Z.join(n, "backend", "dist", "src", "index.js"),
          Z.join(n, "backend", "src", "index.ts"),
          Z.join(n, "backend", "src", "index.js")
        ].find((i) => Ke.existsSync(i));
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
      let c = a, o = !1;
      for (; c && c !== Z.dirname(c); ) {
        const u = Z.join(c, "package.json");
        if (Ke.existsSync(u))
          try {
            if (JSON.parse(
              Ke.readFileSync(u, "utf8")
            ).name === "backend") {
              o = !0;
              break;
            }
          } catch {
          }
        c = Z.dirname(c);
      }
      o || (c = a), console.log("Setting child process cwd to:", c), Rn = s;
      const i = zn(s, r, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: c,
        silent: !1,
        env: { ...process.env }
      }), d = i.pid;
      if (console.log("Child process forked with PID:", d), typeof d == "number")
        tt.set(d, i), console.log(
          "Child process added to children map. Total children:",
          tt.size
        );
      else
        return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
      return new Promise((u, h) => {
        const b = setTimeout(() => {
          h(new Error("Timeout waiting for WebSocket port from backend"));
        }, 1e4), p = ($) => {
          $ && $.type === "websocket-port" && typeof $.port == "number" && (clearTimeout(b), i.off("message", p), u({ ok: !0, port: $.port, pid: d }));
        };
        i.on("message", p), i.on("error", ($) => {
          console.error("Child process error:", $), typeof i.pid == "number" && tt.delete(i.pid), clearTimeout(b), h($);
        }), i.on("exit", ($, g) => {
          console.log(
            `Child process ${i.pid} exited with code ${$} and signal ${g}`
          ), typeof i.pid == "number" && tt.delete(i.pid), ee && !ee.isDestroyed() && ee.webContents.send("child-exit", {
            pid: i.pid,
            code: $,
            signal: g
          }), clearTimeout(b), h(new Error(`Child process exited with code ${$}`));
        }), i.on("message", ($) => {
          console.log("Message from child:", $), !($ && typeof $ == "object" && "type" in $ && $.type === "websocket-port") && ee && !ee.isDestroyed() && ee.webContents.send("child-message", { pid: i.pid, msg: $ });
        }), i.stdout && i.stdout.on("data", ($) => {
          console.log("Child stdout:", $.toString()), ee && !ee.isDestroyed() && ee.webContents.send("child-stdout", {
            pid: i.pid,
            data: $.toString()
          });
        }), i.stderr && i.stderr.on("data", ($) => {
          console.error("Child stderr:", $.toString()), ee && !ee.isDestroyed() && ee.webContents.send("child-stderr", {
            pid: i.pid,
            data: $.toString()
          });
        });
      });
    } catch (a) {
      return console.error("Failed to fork child process:", a), { ok: !1, reason: `fork-error: ${a}` };
    }
  }
);
rt.handle(
  "start-collector-fork",
  async (e, { args: t = [] } = {}) => {
    const r = Z.dirname(Z.dirname(At)), n = [
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
    ], s = n.find((a) => Ke.existsSync(a)) || n[0];
    if (!Ke.existsSync(s))
      return { ok: !1, reason: "collector-not-found", attempted: n };
    try {
      const a = zn(s, t, {
        stdio: ["pipe", "pipe", "ipc"],
        cwd: Z.dirname(s),
        env: { ...process.env }
      }), c = a.pid;
      return typeof c == "number" && (tt.set(c, a), a.on("message", (o) => {
        ee && !ee.isDestroyed() && ee.webContents.send("child-message", { pid: c, msg: o });
      }), a.stdout && a.stdout.on("data", (o) => {
        ee && !ee.isDestroyed() && ee.webContents.send("child-stdout", { pid: c, data: o.toString() });
      }), a.stderr && a.stderr.on("data", (o) => {
        ee && !ee.isDestroyed() && ee.webContents.send("child-stderr", { pid: c, data: o.toString() });
      })), { ok: !0, pid: c };
    } catch (a) {
      return { ok: !1, reason: String(a) };
    }
  }
);
rt.handle(
  "send-to-child",
  async (e, { pid: t, msg: r } = {}) => {
    if (console.log(
      "send-to-child called with PID:",
      t,
      "Message type:",
      r == null ? void 0 : r.type
    ), console.log("Available children PIDs:", Array.from(tt.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const n = tt.get(t);
    if (!n) {
      if (console.log("Child not found for PID:", t), Rn)
        try {
          const s = Z.dirname(Rn), a = zn(Rn, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: s,
            silent: !1,
            env: { ...process.env }
          }), c = a.pid;
          if (typeof c == "number") {
            tt.set(c, a), ee && !ee.isDestroyed() && ee.webContents.send("child-message", {
              pid: c,
              msg: {
                type: "event",
                event: "reforked",
                payload: { oldPid: t, newPid: c }
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
rt.handle(
  "stop-child",
  async (e, { pid: t } = {}) => {
    if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
    const r = tt.get(t);
    if (!r) return { ok: !1, reason: "not-found" };
    try {
      return r.kill("SIGTERM"), { ok: !0 };
    } catch (n) {
      return { ok: !1, reason: String(n) };
    }
  }
);
function sE() {
  if (ee = new Ec({
    icon: Z.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: Z.join(At, "preload.mjs"),
      nodeIntegration: !0,
      contextIsolation: !1
    }
  }), ee.maximize(), ee.webContents.on("did-finish-load", () => {
    ee == null || ee.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), Bs)
    ee.loadURL(Bs);
  else
    try {
      const e = Z.join(process.resourcesPath, "dist", "index.html");
      if (console.log("[main] loading packaged index from", e), Ke.existsSync(e))
        ee.loadFile(e);
      else {
        const t = Z.join(Jl, "index.html");
        console.warn(
          "[main] packaged index not found at",
          e,
          "falling back to",
          t
        ), ee.loadFile(t);
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
        console.log("[main] attempting alt loadFile", t), ee.loadFile(t);
      } catch (t) {
        console.error("[main] all index.html load attempts failed", t);
      }
    }
}
Bt.whenReady().then(() => {
  (async () => {
    if (Bt.isPackaged)
      try {
        const e = Z.join(process.resourcesPath, "backend", "index.js");
        console.log("[main] Procurando backend em:", e), console.log("[main] Arquivo existe:", Ke.existsSync(e)), Ke.existsSync(e) ? (console.log("[main] Iniciando backend com Node.js..."), gt = eu(process.execPath, [e], {
          env: {
            ...process.env,
            FRONTEND_API_PORT: process.env.FRONTEND_API_PORT || "3000"
          },
          cwd: Z.dirname(e)
        }), gt.stdout.on("data", (t) => {
          console.log("[backend]", t.toString());
        }), gt.stderr.on("data", (t) => {
          console.error("[backend error]", t.toString());
        }), gt.on("error", (t) => {
          console.error("[backend error]", t);
        }), gt.on("exit", (t) => {
          console.log("[backend] encerrado com código:", t);
        }), console.log("[main] Backend iniciado com Node.js!")) : console.error("[main] Backend não encontrado em:", e);
      } catch (e) {
        console.error("[main] Erro ao iniciar backend:", e);
      }
    else
      try {
        const e = Z.dirname(Z.dirname(At)), r = [
          Z.join(e, "back-end", "dist", "index.js"),
          Z.join(e, "back-end", "dist", "src", "index.js"),
          Z.join(e, "back-end", "src", "index.ts")
        ].find((n) => Ke.existsSync(n));
        if (r) {
          console.log("[main] Iniciando backend em desenvolvimento...");
          const n = zn(r, [], {
            stdio: ["pipe", "pipe", "ipc"],
            cwd: Z.dirname(r),
            env: { ...process.env }
          }), s = n.pid;
          typeof s == "number" && tt.set(s, n), n.on("message", (a) => {
            ee && !ee.isDestroyed() && ee.webContents.send("child-message", { pid: n.pid, msg: a });
          }), n.stdout && n.stdout.on("data", (a) => {
            console.log("[child]", a.toString()), ee && !ee.isDestroyed() && ee.webContents.send("child-stdout", { pid: n.pid, data: a.toString() });
          }), n.stderr && n.stderr.on("data", (a) => {
            console.error("[child error]", a.toString()), ee && !ee.isDestroyed() && ee.webContents.send("child-stderr", { pid: n.pid, data: a.toString() });
          });
        }
      } catch (e) {
        console.warn("[main] Erro ao iniciar backend em desenvolvimento:", e);
      }
    ee || sE();
  })();
});
Bt.on("window-all-closed", () => {
  process.platform !== "darwin" && Bt.quit();
});
Bt.on("before-quit", () => {
  try {
    gt && !gt.killed && (gt.kill(), gt = null);
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, e] of tt.entries())
    try {
      e.kill("SIGTERM");
    } catch {
    }
});
const aE = Z.join(Bt.getPath("userData"), "error.log"), Wl = Ke.createWriteStream(aE, { flags: "a" });
process.on("uncaughtException", (e) => {
  Wl.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`
  );
});
process.on("unhandledRejection", (e) => {
  Wl.write(
    `[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`
  );
});
rt.handle(
  "save-pdf",
  async (e, t) => {
    try {
      const r = Bt.getPath("temp"), n = Z.join(r, `relatorio-${Date.now()}.pdf`), s = Buffer.from(t, "base64");
      return Ke.writeFileSync(n, s), { ok: !0, path: n };
    } catch (r) {
      return console.error("Failed to save pdf from renderer:", r), { ok: !1, error: String(r) };
    }
  }
);
export {
  _E as MAIN_DIST,
  Jl as RENDERER_DIST,
  Bs as VITE_DEV_SERVER_URL
};
