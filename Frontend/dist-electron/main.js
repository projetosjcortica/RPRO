var Nu = Object.defineProperty;
var si = (e) => {
  throw TypeError(e);
};
var Ru = (e, t, r) => t in e ? Nu(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var Ir = (e, t, r) => Ru(e, typeof t != "symbol" ? t + "" : t, r), ai = (e, t, r) => t.has(e) || si("Cannot " + r);
var $e = (e, t, r) => (ai(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Tr = (e, t, r) => t.has(e) ? si("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), jr = (e, t, r, n) => (ai(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import Mc, { ipcMain as ft, dialog as Lc, BrowserWindow as ra, app as Qt } from "electron";
import * as ae from "path";
import Pe from "node:process";
import ue from "node:path";
import { promisify as Ae, isDeepStrictEqual as Ou } from "node:util";
import ne from "node:fs";
import kr from "node:crypto";
import Iu from "node:assert";
import Yn from "node:os";
import _t from "fs";
import { fileURLToPath as Tu } from "url";
import { fork as na, spawn as ju } from "child_process";
const Zt = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, gs = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), ku = new Set("0123456789");
function Qn(e) {
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
        if (n === "index" && !ku.has(a))
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
function sa(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Vc(e, t) {
  if (sa(e, t))
    throw new Error("Cannot use string index");
}
function Au(e, t, r) {
  if (!Zt(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = Qn(t);
  if (n.length === 0)
    return r;
  for (let s = 0; s < n.length; s++) {
    const a = n[s];
    if (sa(e, a) ? e = s === n.length - 1 ? void 0 : null : e = e[a], e == null) {
      if (s !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function oi(e, t, r) {
  if (!Zt(e) || typeof t != "string")
    return e;
  const n = e, s = Qn(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Vc(e, o), a === s.length - 1 ? e[o] = r : Zt(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
  }
  return n;
}
function Cu(e, t) {
  if (!Zt(e) || typeof t != "string")
    return !1;
  const r = Qn(t);
  for (let n = 0; n < r.length; n++) {
    const s = r[n];
    if (Vc(e, s), n === r.length - 1)
      return delete e[s], !0;
    if (e = e[s], !Zt(e))
      return !1;
  }
}
function Du(e, t) {
  if (!Zt(e) || typeof t != "string")
    return !1;
  const r = Qn(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!Zt(e) || !(n in e) || sa(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const kt = Yn.homedir(), aa = Yn.tmpdir(), { env: ur } = Pe, Mu = (e) => {
  const t = ue.join(kt, "Library");
  return {
    data: ue.join(t, "Application Support", e),
    config: ue.join(t, "Preferences", e),
    cache: ue.join(t, "Caches", e),
    log: ue.join(t, "Logs", e),
    temp: ue.join(aa, e)
  };
}, Lu = (e) => {
  const t = ur.APPDATA || ue.join(kt, "AppData", "Roaming"), r = ur.LOCALAPPDATA || ue.join(kt, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: ue.join(r, e, "Data"),
    config: ue.join(t, e, "Config"),
    cache: ue.join(r, e, "Cache"),
    log: ue.join(r, e, "Log"),
    temp: ue.join(aa, e)
  };
}, Vu = (e) => {
  const t = ue.basename(kt);
  return {
    data: ue.join(ur.XDG_DATA_HOME || ue.join(kt, ".local", "share"), e),
    config: ue.join(ur.XDG_CONFIG_HOME || ue.join(kt, ".config"), e),
    cache: ue.join(ur.XDG_CACHE_HOME || ue.join(kt, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: ue.join(ur.XDG_STATE_HOME || ue.join(kt, ".local", "state"), e),
    temp: ue.join(aa, t, e)
  };
};
function Fu(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), Pe.platform === "darwin" ? Mu(e) : Pe.platform === "win32" ? Lu(e) : Vu(e);
}
const St = (e, t) => function(...n) {
  return e.apply(void 0, n).catch(t);
}, ht = (e, t) => function(...n) {
  try {
    return e.apply(void 0, n);
  } catch (s) {
    return t(s);
  }
}, zu = Pe.getuid ? !Pe.getuid() : !1, Uu = 1e4, Ke = () => {
}, ye = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!ye.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !zu && (t === "EINVAL" || t === "EPERM");
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
class qu {
  constructor() {
    this.interval = 25, this.intervalId = void 0, this.limit = Uu, this.queueActive = /* @__PURE__ */ new Set(), this.queueWaiting = /* @__PURE__ */ new Set(), this.init = () => {
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
const Gu = new qu(), Pt = (e, t) => function(n) {
  return function s(...a) {
    return Gu.schedule().then((o) => {
      const c = (d) => (o(), d), l = (d) => {
        if (o(), Date.now() >= n)
          throw d;
        if (t(d)) {
          const u = Math.round(100 * Math.random());
          return new Promise((w) => setTimeout(w, u)).then(() => s.apply(void 0, a));
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
}, De = {
  attempt: {
    /* ASYNC */
    chmod: St(Ae(ne.chmod), ye.onChangeError),
    chown: St(Ae(ne.chown), ye.onChangeError),
    close: St(Ae(ne.close), Ke),
    fsync: St(Ae(ne.fsync), Ke),
    mkdir: St(Ae(ne.mkdir), Ke),
    realpath: St(Ae(ne.realpath), Ke),
    stat: St(Ae(ne.stat), Ke),
    unlink: St(Ae(ne.unlink), Ke),
    /* SYNC */
    chmodSync: ht(ne.chmodSync, ye.onChangeError),
    chownSync: ht(ne.chownSync, ye.onChangeError),
    closeSync: ht(ne.closeSync, Ke),
    existsSync: ht(ne.existsSync, Ke),
    fsyncSync: ht(ne.fsync, Ke),
    mkdirSync: ht(ne.mkdirSync, Ke),
    realpathSync: ht(ne.realpathSync, Ke),
    statSync: ht(ne.statSync, Ke),
    unlinkSync: ht(ne.unlinkSync, Ke)
  },
  retry: {
    /* ASYNC */
    close: Pt(Ae(ne.close), ye.isRetriableError),
    fsync: Pt(Ae(ne.fsync), ye.isRetriableError),
    open: Pt(Ae(ne.open), ye.isRetriableError),
    readFile: Pt(Ae(ne.readFile), ye.isRetriableError),
    rename: Pt(Ae(ne.rename), ye.isRetriableError),
    stat: Pt(Ae(ne.stat), ye.isRetriableError),
    write: Pt(Ae(ne.write), ye.isRetriableError),
    writeFile: Pt(Ae(ne.writeFile), ye.isRetriableError),
    /* SYNC */
    closeSync: Nt(ne.closeSync, ye.isRetriableError),
    fsyncSync: Nt(ne.fsyncSync, ye.isRetriableError),
    openSync: Nt(ne.openSync, ye.isRetriableError),
    readFileSync: Nt(ne.readFileSync, ye.isRetriableError),
    renameSync: Nt(ne.renameSync, ye.isRetriableError),
    statSync: Nt(ne.statSync, ye.isRetriableError),
    writeSync: Nt(ne.writeSync, ye.isRetriableError),
    writeFileSync: Nt(ne.writeFileSync, ye.isRetriableError)
  }
}, Ku = "utf8", ii = 438, Hu = 511, Bu = {}, Ju = Yn.userInfo().uid, Wu = Yn.userInfo().gid, Xu = 1e3, Yu = !!Pe.getuid;
Pe.getuid && Pe.getuid();
const ci = 128, Qu = (e) => e instanceof Error && "code" in e, li = (e) => typeof e == "string", _s = (e) => e === void 0, Zu = Pe.platform === "linux", Fc = Pe.platform === "win32", oa = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
Fc || oa.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Zu && oa.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
class xu {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Fc && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? Pe.kill(Pe.pid, "SIGTERM") : Pe.kill(Pe.pid, t));
      }
    }, this.hook = () => {
      Pe.once("exit", () => this.exit());
      for (const t of oa)
        try {
          Pe.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const ed = new xu(), td = ed.register, Me = {
  /* VARIABLES */
  store: {},
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), s = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${s}`;
  },
  get: (e, t, r = !0) => {
    const n = Me.truncate(t(e));
    return n in Me.store ? Me.get(e, t, r) : (Me.store[n] = r, [n, () => delete Me.store[n]]);
  },
  purge: (e) => {
    Me.store[e] && (delete Me.store[e], De.attempt.unlink(e));
  },
  purgeSync: (e) => {
    Me.store[e] && (delete Me.store[e], De.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in Me.store)
      Me.purgeSync(e);
  },
  truncate: (e) => {
    const t = ue.basename(e);
    if (t.length <= ci)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - ci;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
td(Me.purgeSyncAll);
function zc(e, t, r = Bu) {
  if (li(r))
    return zc(e, t, { encoding: r });
  const n = Date.now() + ((r.timeout ?? Xu) || -1);
  let s = null, a = null, o = null;
  try {
    const c = De.attempt.realpathSync(e), l = !!c;
    e = c || e, [a, s] = Me.get(e, r.tmpCreate || Me.create, r.tmpPurge !== !1);
    const d = Yu && _s(r.chown), u = _s(r.mode);
    if (l && (d || u)) {
      const h = De.attempt.statSync(e);
      h && (r = { ...r }, d && (r.chown = { uid: h.uid, gid: h.gid }), u && (r.mode = h.mode));
    }
    if (!l) {
      const h = ue.dirname(e);
      De.attempt.mkdirSync(h, {
        mode: Hu,
        recursive: !0
      });
    }
    o = De.retry.openSync(n)(a, "w", r.mode || ii), r.tmpCreated && r.tmpCreated(a), li(t) ? De.retry.writeSync(n)(o, t, 0, r.encoding || Ku) : _s(t) || De.retry.writeSync(n)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? De.retry.fsyncSync(n)(o) : De.attempt.fsync(o)), De.retry.closeSync(n)(o), o = null, r.chown && (r.chown.uid !== Ju || r.chown.gid !== Wu) && De.attempt.chownSync(a, r.chown.uid, r.chown.gid), r.mode && r.mode !== ii && De.attempt.chmodSync(a, r.mode);
    try {
      De.retry.renameSync(n)(a, e);
    } catch (h) {
      if (!Qu(h) || h.code !== "ENAMETOOLONG")
        throw h;
      De.retry.renameSync(n)(a, Me.truncate(e));
    }
    s(), a = null;
  } finally {
    o && De.attempt.closeSync(o), a && Me.purge(a);
  }
}
function Uc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ms = { exports: {} }, qc = {}, nt = {}, $r = {}, Zr = {}, ee = {}, Yr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(E) {
      if (super(), !e.IDENTIFIER.test(E))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = E;
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
    constructor(E) {
      super(), this._items = typeof E == "string" ? [E] : E;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const E = this._items[0];
      return E === "" || E === '""';
    }
    get str() {
      var E;
      return (E = this._str) !== null && E !== void 0 ? E : this._str = this._items.reduce((P, O) => `${P}${O}`, "");
    }
    get names() {
      var E;
      return (E = this._names) !== null && E !== void 0 ? E : this._names = this._items.reduce((P, O) => (O instanceof r && (P[O.str] = (P[O.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...E) {
    const P = [m[0]];
    let O = 0;
    for (; O < E.length; )
      c(P, E[O]), P.push(m[++O]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...E) {
    const P = [$(m[0])];
    let O = 0;
    for (; O < E.length; )
      P.push(a), c(P, E[O]), P.push(a, $(m[++O]));
    return l(P), new n(P);
  }
  e.str = o;
  function c(m, E) {
    E instanceof n ? m.push(...E._items) : E instanceof r ? m.push(E) : m.push(h(E));
  }
  e.addCodeArg = c;
  function l(m) {
    let E = 1;
    for (; E < m.length - 1; ) {
      if (m[E] === a) {
        const P = d(m[E - 1], m[E + 1]);
        if (P !== void 0) {
          m.splice(E - 1, 3, P);
          continue;
        }
        m[E++] = "+";
      }
      E++;
    }
  }
  function d(m, E) {
    if (E === '""')
      return m;
    if (m === '""')
      return E;
    if (typeof m == "string")
      return E instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof E != "string" ? `${m.slice(0, -1)}${E}"` : E[0] === '"' ? m.slice(0, -1) + E.slice(1) : void 0;
    if (typeof E == "string" && E[0] === '"' && !(m instanceof r))
      return `"${m}${E.slice(1)}`;
  }
  function u(m, E) {
    return E.emptyStr() ? m : m.emptyStr() ? E : o`${m}${E}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : $(Array.isArray(m) ? m.join(",") : m);
  }
  function w(m) {
    return new n($(m));
  }
  e.stringify = w;
  function $(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = $;
  function y(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = y;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function _(m) {
    return new n(m.toString());
  }
  e.regexpCode = _;
})(Yr);
var Ls = {};
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
      const w = this.toName(d), { prefix: $ } = w, y = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[$];
      if (g) {
        const E = g.get(y);
        if (E)
          return E;
      } else
        g = this._values[$] = /* @__PURE__ */ new Map();
      g.set(y, w);
      const _ = this._scope[$] || (this._scope[$] = []), m = _.length;
      return _[m] = u.ref, w.setValue(u, { property: $, itemIndex: m }), w;
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
      return this._reduceValues(d, (w) => {
        if (w.value === void 0)
          throw new Error(`CodeGen: name "${w}" has no value`);
        return w.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, w) {
      let $ = t.nil;
      for (const y in d) {
        const g = d[y];
        if (!g)
          continue;
        const _ = h[y] = h[y] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (_.has(m))
            return;
          _.set(m, n.Started);
          let E = u(m);
          if (E) {
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            $ = (0, t._)`${$}${P} ${m} = ${E};${this.opts._n}`;
          } else if (E = w == null ? void 0 : w(m))
            $ = (0, t._)`${$}${E}${this.opts._n}`;
          else
            throw new r(m);
          _.set(m, n.Completed);
        });
      }
      return $;
    }
  }
  e.ValueScope = c;
})(Ls);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Yr, r = Ls;
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
      return Q(i, this.rhs);
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
  class w extends a {
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
  class y extends $ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends $ {
  }
  class _ extends y {
  }
  _.kind = "else";
  class m extends y {
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
        f = this.else = Array.isArray(b) ? new _(b) : b;
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
      return Q(i, this.condition), this.else && X(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class E extends y {
  }
  E.kind = "for";
  class P extends E {
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
  class O extends E {
    constructor(i, f, b, k) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = k;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: k, to: A } = this;
      return `for(${f} ${b}=${k}; ${b}<${A}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = Q(super.names, this.from);
      return Q(i, this.to);
    }
  }
  class T extends E {
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
  class K extends y {
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
  class le extends y {
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
  class he extends y {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class ge extends y {
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
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new w(i)), this;
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
      return this._elseNode(new _());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, _);
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
      return this._endBlockNode(E);
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
      const k = new le();
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
  function X(v, i) {
    for (const f in i)
      v[f] = (v[f] || 0) + (i[f] || 0);
    return v;
  }
  function Q(v, i) {
    return i instanceof t._CodeOrName ? X(v, i.names) : v;
  }
  function j(v, i, f) {
    if (v instanceof t.Name)
      return b(v);
    if (!k(v))
      return v;
    return new t._Code(v._items.reduce((A, H) => (H instanceof t.Name && (H = b(H)), H instanceof t._Code ? A.push(...H._items) : A.push(H), A), []));
    function b(A) {
      const H = f[A.str];
      return H === void 0 || i[A.str] !== 1 ? A : (delete i[A.str], H);
    }
    function k(A) {
      return A instanceof t._Code && A._items.some((H) => H instanceof t.Name && i[H.str] === 1 && f[H.str] !== void 0);
    }
  }
  function D(v, i) {
    for (const f in i)
      v[f] = (v[f] || 0) - (i[f] || 0);
  }
  function U(v) {
    return typeof v == "boolean" || typeof v == "number" || v === null ? !v : (0, t._)`!${S(v)}`;
  }
  e.not = U;
  const V = p(e.operators.AND);
  function J(...v) {
    return v.reduce(V);
  }
  e.and = J;
  const z = p(e.operators.OR);
  function N(...v) {
    return v.reduce(z);
  }
  e.or = N;
  function p(v) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${v} ${S(f)}`;
  }
  function S(v) {
    return v instanceof t.Name ? v : (0, t._)`(${v})`;
  }
})(ee);
var L = {};
Object.defineProperty(L, "__esModule", { value: !0 });
L.checkStrictMode = L.getErrorPath = L.Type = L.useFunc = L.setEvaluated = L.evaluatedPropsToName = L.mergeEvaluated = L.eachItem = L.unescapeJsonPointer = L.escapeJsonPointer = L.escapeFragment = L.unescapeFragment = L.schemaRefOrVal = L.schemaHasRulesButRef = L.schemaHasRules = L.checkUnknownRules = L.alwaysValidSchema = L.toHash = void 0;
const de = ee, rd = Yr;
function nd(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
L.toHash = nd;
function sd(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Gc(e, t), !Kc(t, e.self.RULES.all));
}
L.alwaysValidSchema = sd;
function Gc(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || Jc(e, `unknown keyword: "${a}"`);
}
L.checkUnknownRules = Gc;
function Kc(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
L.schemaHasRules = Kc;
function ad(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
L.schemaHasRulesButRef = ad;
function od({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, de._)`${r}`;
  }
  return (0, de._)`${e}${t}${(0, de.getProperty)(n)}`;
}
L.schemaRefOrVal = od;
function id(e) {
  return Hc(decodeURIComponent(e));
}
L.unescapeFragment = id;
function cd(e) {
  return encodeURIComponent(ia(e));
}
L.escapeFragment = cd;
function ia(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
L.escapeJsonPointer = ia;
function Hc(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
L.unescapeJsonPointer = Hc;
function ld(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
L.eachItem = ld;
function ui({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof de.Name ? (a instanceof de.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof de.Name ? (t(s, o, a), a) : r(a, o);
    return c === de.Name && !(l instanceof de.Name) ? n(s, l) : l;
  };
}
L.mergeEvaluated = {
  props: ui({
    mergeNames: (e, t, r) => e.if((0, de._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, de._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, de._)`${r} || {}`).code((0, de._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, de._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, de._)`${r} || {}`), ca(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Bc
  }),
  items: ui({
    mergeNames: (e, t, r) => e.if((0, de._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, de._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, de._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, de._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Bc(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, de._)`{}`);
  return t !== void 0 && ca(e, r, t), r;
}
L.evaluatedPropsToName = Bc;
function ca(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, de._)`${t}${(0, de.getProperty)(n)}`, !0));
}
L.setEvaluated = ca;
const di = {};
function ud(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: di[t.code] || (di[t.code] = new rd._Code(t.code))
  });
}
L.useFunc = ud;
var Vs;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Vs || (L.Type = Vs = {}));
function dd(e, t, r) {
  if (e instanceof de.Name) {
    const n = t === Vs.Num;
    return r ? n ? (0, de._)`"[" + ${e} + "]"` : (0, de._)`"['" + ${e} + "']"` : n ? (0, de._)`"/" + ${e}` : (0, de._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, de.getProperty)(e).toString() : "/" + ia(e);
}
L.getErrorPath = dd;
function Jc(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
L.checkStrictMode = Jc;
var Be = {};
Object.defineProperty(Be, "__esModule", { value: !0 });
const Ce = ee, fd = {
  // validation function arguments
  data: new Ce.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new Ce.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new Ce.Name("instancePath"),
  parentData: new Ce.Name("parentData"),
  parentDataProperty: new Ce.Name("parentDataProperty"),
  rootData: new Ce.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new Ce.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new Ce.Name("vErrors"),
  // null or array of validation errors
  errors: new Ce.Name("errors"),
  // counter of validation errors
  this: new Ce.Name("this"),
  // "globals"
  self: new Ce.Name("self"),
  scope: new Ce.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new Ce.Name("json"),
  jsonPos: new Ce.Name("jsonPos"),
  jsonLen: new Ce.Name("jsonLen"),
  jsonPart: new Ce.Name("jsonPart")
};
Be.default = fd;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = ee, r = L, n = Be;
  e.keywordError = {
    message: ({ keyword: _ }) => (0, t.str)`must pass "${_}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: _, schemaType: m }) => m ? (0, t.str)`"${_}" keyword must be ${m} ($data)` : (0, t.str)`"${_}" keyword is invalid ($data)`
  };
  function s(_, m = e.keywordError, E, P) {
    const { it: O } = _, { gen: T, compositeRule: K, allErrors: Y } = O, le = h(_, m, E);
    P ?? (K || Y) ? l(T, le) : d(O, (0, t._)`[${le}]`);
  }
  e.reportError = s;
  function a(_, m = e.keywordError, E) {
    const { it: P } = _, { gen: O, compositeRule: T, allErrors: K } = P, Y = h(_, m, E);
    l(O, Y), T || K || d(P, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(_, m) {
    _.assign(n.default.errors, m), _.if((0, t._)`${n.default.vErrors} !== null`, () => _.if(m, () => _.assign((0, t._)`${n.default.vErrors}.length`, m), () => _.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: _, keyword: m, schemaValue: E, data: P, errsCount: O, it: T }) {
    if (O === void 0)
      throw new Error("ajv implementation error");
    const K = _.name("err");
    _.forRange("i", O, n.default.errors, (Y) => {
      _.const(K, (0, t._)`${n.default.vErrors}[${Y}]`), _.if((0, t._)`${K}.instancePath === undefined`, () => _.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), _.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && (_.assign((0, t._)`${K}.schema`, E), _.assign((0, t._)`${K}.data`, P));
    });
  }
  e.extendErrors = c;
  function l(_, m) {
    const E = _.const("err", m);
    _.if((0, t._)`${n.default.vErrors} === null`, () => _.assign(n.default.vErrors, (0, t._)`[${E}]`), (0, t._)`${n.default.vErrors}.push(${E})`), _.code((0, t._)`${n.default.errors}++`);
  }
  function d(_, m) {
    const { gen: E, validateName: P, schemaEnv: O } = _;
    O.$async ? E.throw((0, t._)`new ${_.ValidationError}(${m})`) : (E.assign((0, t._)`${P}.errors`, m), E.return(!1));
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
  function h(_, m, E) {
    const { createErrors: P } = _.it;
    return P === !1 ? (0, t._)`{}` : w(_, m, E);
  }
  function w(_, m, E = {}) {
    const { gen: P, it: O } = _, T = [
      $(O, E),
      y(_, E)
    ];
    return g(_, m, T), P.object(...T);
  }
  function $({ errorPath: _ }, { instancePath: m }) {
    const E = m ? (0, t.str)`${_}${(0, r.getErrorPath)(m, r.Type.Str)}` : _;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, E)];
  }
  function y({ keyword: _, it: { errSchemaPath: m } }, { schemaPath: E, parentSchema: P }) {
    let O = P ? m : (0, t.str)`${m}/${_}`;
    return E && (O = (0, t.str)`${O}${(0, r.getErrorPath)(E, r.Type.Str)}`), [u.schemaPath, O];
  }
  function g(_, { params: m, message: E }, P) {
    const { keyword: O, data: T, schemaValue: K, it: Y } = _, { opts: le, propertyName: he, topSchemaRef: ge, schemaPath: G } = Y;
    P.push([u.keyword, O], [u.params, typeof m == "function" ? m(_) : m || (0, t._)`{}`]), le.messages && P.push([u.message, typeof E == "function" ? E(_) : E]), le.verbose && P.push([u.schema, K], [u.parentSchema, (0, t._)`${ge}${G}`], [n.default.data, T]), he && P.push([u.propertyName, he]);
  }
})(Zr);
Object.defineProperty($r, "__esModule", { value: !0 });
$r.boolOrEmptySchema = $r.topBoolOrEmptySchema = void 0;
const hd = Zr, md = ee, pd = Be, $d = {
  message: "boolean schema is false"
};
function yd(e) {
  const { gen: t, schema: r, validateName: n } = e;
  r === !1 ? Wc(e, !1) : typeof r == "object" && r.$async === !0 ? t.return(pd.default.data) : (t.assign((0, md._)`${n}.errors`, null), t.return(!0));
}
$r.topBoolOrEmptySchema = yd;
function gd(e, t) {
  const { gen: r, schema: n } = e;
  n === !1 ? (r.var(t, !1), Wc(e)) : r.var(t, !0);
}
$r.boolOrEmptySchema = gd;
function Wc(e, t) {
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
  (0, hd.reportError)(s, $d, void 0, t);
}
var be = {}, xt = {};
Object.defineProperty(xt, "__esModule", { value: !0 });
xt.getRules = xt.isJSONType = void 0;
const _d = ["string", "number", "integer", "boolean", "null", "object", "array"], vd = new Set(_d);
function wd(e) {
  return typeof e == "string" && vd.has(e);
}
xt.isJSONType = wd;
function Ed() {
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
xt.getRules = Ed;
var vt = {};
Object.defineProperty(vt, "__esModule", { value: !0 });
vt.shouldUseRule = vt.shouldUseGroup = vt.schemaHasRulesForType = void 0;
function bd({ schema: e, self: t }, r) {
  const n = t.RULES.types[r];
  return n && n !== !0 && Xc(e, n);
}
vt.schemaHasRulesForType = bd;
function Xc(e, t) {
  return t.rules.some((r) => Yc(e, r));
}
vt.shouldUseGroup = Xc;
function Yc(e, t) {
  var r;
  return e[t.keyword] !== void 0 || ((r = t.definition.implements) === null || r === void 0 ? void 0 : r.some((n) => e[n] !== void 0));
}
vt.shouldUseRule = Yc;
Object.defineProperty(be, "__esModule", { value: !0 });
be.reportTypeError = be.checkDataTypes = be.checkDataType = be.coerceAndCheckDataType = be.getJSONTypes = be.getSchemaTypes = be.DataType = void 0;
const Sd = xt, Pd = vt, Nd = Zr, te = ee, Qc = L;
var dr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(dr || (be.DataType = dr = {}));
function Rd(e) {
  const t = Zc(e.type);
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
be.getSchemaTypes = Rd;
function Zc(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(Sd.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
be.getJSONTypes = Zc;
function Od(e, t) {
  const { gen: r, data: n, opts: s } = e, a = Id(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, Pd.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = la(t, n, s.strictNumbers, dr.Wrong);
    r.if(c, () => {
      a.length ? Td(e, t, a) : ua(e);
    });
  }
  return o;
}
be.coerceAndCheckDataType = Od;
const xc = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function Id(e, t) {
  return t ? e.filter((r) => xc.has(r) || t === "array" && r === "array") : [];
}
function Td(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, te._)`typeof ${s}`), c = n.let("coerced", (0, te._)`undefined`);
  a.coerceTypes === "array" && n.if((0, te._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, te._)`${s}[0]`).assign(o, (0, te._)`typeof ${s}`).if(la(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, te._)`${c} !== undefined`);
  for (const d of r)
    (xc.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), ua(e), n.endIf(), n.if((0, te._)`${c} !== undefined`, () => {
    n.assign(s, c), jd(e, c);
  });
  function l(d) {
    switch (d) {
      case "string":
        n.elseIf((0, te._)`${o} == "number" || ${o} == "boolean"`).assign(c, (0, te._)`"" + ${s}`).elseIf((0, te._)`${s} === null`).assign(c, (0, te._)`""`);
        return;
      case "number":
        n.elseIf((0, te._)`${o} == "boolean" || ${s} === null
              || (${o} == "string" && ${s} && ${s} == +${s})`).assign(c, (0, te._)`+${s}`);
        return;
      case "integer":
        n.elseIf((0, te._)`${o} === "boolean" || ${s} === null
              || (${o} === "string" && ${s} && ${s} == +${s} && !(${s} % 1))`).assign(c, (0, te._)`+${s}`);
        return;
      case "boolean":
        n.elseIf((0, te._)`${s} === "false" || ${s} === 0 || ${s} === null`).assign(c, !1).elseIf((0, te._)`${s} === "true" || ${s} === 1`).assign(c, !0);
        return;
      case "null":
        n.elseIf((0, te._)`${s} === "" || ${s} === 0 || ${s} === false`), n.assign(c, null);
        return;
      case "array":
        n.elseIf((0, te._)`${o} === "string" || ${o} === "number"
              || ${o} === "boolean" || ${s} === null`).assign(c, (0, te._)`[${s}]`);
    }
  }
}
function jd({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, te._)`${t} !== undefined`, () => e.assign((0, te._)`${t}[${r}]`, n));
}
function Fs(e, t, r, n = dr.Correct) {
  const s = n === dr.Correct ? te.operators.EQ : te.operators.NEQ;
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
      a = o((0, te._)`!(${t} % 1) && !isNaN(${t})`);
      break;
    case "number":
      a = o();
      break;
    default:
      return (0, te._)`typeof ${t} ${s} ${e}`;
  }
  return n === dr.Correct ? a : (0, te.not)(a);
  function o(c = te.nil) {
    return (0, te.and)((0, te._)`typeof ${t} == "number"`, c, r ? (0, te._)`isFinite(${t})` : te.nil);
  }
}
be.checkDataType = Fs;
function la(e, t, r, n) {
  if (e.length === 1)
    return Fs(e[0], t, r, n);
  let s;
  const a = (0, Qc.toHash)(e);
  if (a.array && a.object) {
    const o = (0, te._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, te._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = te.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, te.and)(s, Fs(o, t, r, n));
  return s;
}
be.checkDataTypes = la;
const kd = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, te._)`{type: ${e}}` : (0, te._)`{type: ${t}}`
};
function ua(e) {
  const t = Ad(e);
  (0, Nd.reportError)(t, kd);
}
be.reportTypeError = ua;
function Ad(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Qc.schemaRefOrVal)(e, n, "type");
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
var Zn = {};
Object.defineProperty(Zn, "__esModule", { value: !0 });
Zn.assignDefaults = void 0;
const rr = ee, Cd = L;
function Dd(e, t) {
  const { properties: r, items: n } = e.schema;
  if (t === "object" && r)
    for (const s in r)
      fi(e, s, r[s].default);
  else t === "array" && Array.isArray(n) && n.forEach((s, a) => fi(e, a, s.default));
}
Zn.assignDefaults = Dd;
function fi(e, t, r) {
  const { gen: n, compositeRule: s, data: a, opts: o } = e;
  if (r === void 0)
    return;
  const c = (0, rr._)`${a}${(0, rr.getProperty)(t)}`;
  if (s) {
    (0, Cd.checkStrictMode)(e, `default is ignored for: ${c}`);
    return;
  }
  let l = (0, rr._)`${c} === undefined`;
  o.useDefaults === "empty" && (l = (0, rr._)`${l} || ${c} === null || ${c} === ""`), n.if(l, (0, rr._)`${c} = ${(0, rr.stringify)(r)}`);
}
var lt = {}, oe = {};
Object.defineProperty(oe, "__esModule", { value: !0 });
oe.validateUnion = oe.validateArray = oe.usePattern = oe.callValidateCode = oe.schemaProperties = oe.allSchemaProperties = oe.noPropertyInData = oe.propertyInData = oe.isOwnProperty = oe.hasPropFunc = oe.reportMissingProp = oe.checkMissingProp = oe.checkReportMissingProp = void 0;
const me = ee, da = L, Rt = Be, Md = L;
function Ld(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(ha(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, me._)`${t}` }, !0), e.error();
  });
}
oe.checkReportMissingProp = Ld;
function Vd({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, me.or)(...n.map((a) => (0, me.and)(ha(e, t, a, r.ownProperties), (0, me._)`${s} = ${a}`)));
}
oe.checkMissingProp = Vd;
function Fd(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
oe.reportMissingProp = Fd;
function el(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, me._)`Object.prototype.hasOwnProperty`
  });
}
oe.hasPropFunc = el;
function fa(e, t, r) {
  return (0, me._)`${el(e)}.call(${t}, ${r})`;
}
oe.isOwnProperty = fa;
function zd(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} !== undefined`;
  return n ? (0, me._)`${s} && ${fa(e, t, r)}` : s;
}
oe.propertyInData = zd;
function ha(e, t, r, n) {
  const s = (0, me._)`${t}${(0, me.getProperty)(r)} === undefined`;
  return n ? (0, me.or)(s, (0, me.not)(fa(e, t, r))) : s;
}
oe.noPropertyInData = ha;
function tl(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
oe.allSchemaProperties = tl;
function Ud(e, t) {
  return tl(t).filter((r) => !(0, da.alwaysValidSchema)(e, t[r]));
}
oe.schemaProperties = Ud;
function qd({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, me._)`${e}, ${t}, ${n}${s}` : t, h = [
    [Rt.default.instancePath, (0, me.strConcat)(Rt.default.instancePath, a)],
    [Rt.default.parentData, o.parentData],
    [Rt.default.parentDataProperty, o.parentDataProperty],
    [Rt.default.rootData, Rt.default.rootData]
  ];
  o.opts.dynamicRef && h.push([Rt.default.dynamicAnchors, Rt.default.dynamicAnchors]);
  const w = (0, me._)`${u}, ${r.object(...h)}`;
  return l !== me.nil ? (0, me._)`${c}.call(${l}, ${w})` : (0, me._)`${c}(${w})`;
}
oe.callValidateCode = qd;
const Gd = (0, me._)`new RegExp`;
function Kd({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, me._)`${s.code === "new RegExp" ? Gd : (0, Md.useFunc)(e, s)}(${r}, ${n})`
  });
}
oe.usePattern = Kd;
function Hd(e) {
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
        dataPropType: da.Type.Num
      }, a), t.if((0, me.not)(a), c);
    });
  }
}
oe.validateArray = Hd;
function Bd(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, da.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
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
oe.validateUnion = Bd;
Object.defineProperty(lt, "__esModule", { value: !0 });
lt.validateKeywordUsage = lt.validSchemaType = lt.funcKeywordCode = lt.macroKeywordCode = void 0;
const Ve = ee, Ht = Be, Jd = oe, Wd = Zr;
function Xd(e, t) {
  const { gen: r, keyword: n, schema: s, parentSchema: a, it: o } = e, c = t.macro.call(o.self, s, a, o), l = rl(r, n, c);
  o.opts.validateSchema !== !1 && o.self.validateSchema(c, !0);
  const d = r.name("valid");
  e.subschema({
    schema: c,
    schemaPath: Ve.nil,
    errSchemaPath: `${o.errSchemaPath}/${n}`,
    topSchemaRef: l,
    compositeRule: !0
  }, d), e.pass(d, () => e.error(!0));
}
lt.macroKeywordCode = Xd;
function Yd(e, t) {
  var r;
  const { gen: n, keyword: s, schema: a, parentSchema: o, $data: c, it: l } = e;
  Zd(l, t);
  const d = !c && t.compile ? t.compile.call(l.self, a, o, l) : t.validate, u = rl(n, s, d), h = n.let("valid");
  e.block$data(h, w), e.ok((r = t.valid) !== null && r !== void 0 ? r : h);
  function w() {
    if (t.errors === !1)
      g(), t.modifying && hi(e), _(() => e.error());
    else {
      const m = t.async ? $() : y();
      t.modifying && hi(e), _(() => Qd(e, m));
    }
  }
  function $() {
    const m = n.let("ruleErrs", null);
    return n.try(() => g((0, Ve._)`await `), (E) => n.assign(h, !1).if((0, Ve._)`${E} instanceof ${l.ValidationError}`, () => n.assign(m, (0, Ve._)`${E}.errors`), () => n.throw(E))), m;
  }
  function y() {
    const m = (0, Ve._)`${u}.errors`;
    return n.assign(m, null), g(Ve.nil), m;
  }
  function g(m = t.async ? (0, Ve._)`await ` : Ve.nil) {
    const E = l.opts.passContext ? Ht.default.this : Ht.default.self, P = !("compile" in t && !c || t.schema === !1);
    n.assign(h, (0, Ve._)`${m}${(0, Jd.callValidateCode)(e, u, E, P)}`, t.modifying);
  }
  function _(m) {
    var E;
    n.if((0, Ve.not)((E = t.valid) !== null && E !== void 0 ? E : h), m);
  }
}
lt.funcKeywordCode = Yd;
function hi(e) {
  const { gen: t, data: r, it: n } = e;
  t.if(n.parentData, () => t.assign(r, (0, Ve._)`${n.parentData}[${n.parentDataProperty}]`));
}
function Qd(e, t) {
  const { gen: r } = e;
  r.if((0, Ve._)`Array.isArray(${t})`, () => {
    r.assign(Ht.default.vErrors, (0, Ve._)`${Ht.default.vErrors} === null ? ${t} : ${Ht.default.vErrors}.concat(${t})`).assign(Ht.default.errors, (0, Ve._)`${Ht.default.vErrors}.length`), (0, Wd.extendErrors)(e);
  }, () => e.error());
}
function Zd({ schemaEnv: e }, t) {
  if (t.async && !e.$async)
    throw new Error("async keyword in sync schema");
}
function rl(e, t, r) {
  if (r === void 0)
    throw new Error(`keyword "${t}" failed to compile`);
  return e.scopeValue("keyword", typeof r == "function" ? { ref: r } : { ref: r, code: (0, Ve.stringify)(r) });
}
function xd(e, t, r = !1) {
  return !t.length || t.some((n) => n === "array" ? Array.isArray(e) : n === "object" ? e && typeof e == "object" && !Array.isArray(e) : typeof e == n || r && typeof e > "u");
}
lt.validSchemaType = xd;
function ef({ schema: e, opts: t, self: r, errSchemaPath: n }, s, a) {
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
lt.validateKeywordUsage = ef;
var Lt = {};
Object.defineProperty(Lt, "__esModule", { value: !0 });
Lt.extendSubschemaMode = Lt.extendSubschemaData = Lt.getSubschema = void 0;
const ct = ee, nl = L;
function tf(e, { keyword: t, schemaProp: r, schema: n, schemaPath: s, errSchemaPath: a, topSchemaRef: o }) {
  if (t !== void 0 && n !== void 0)
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  if (t !== void 0) {
    const c = e.schema[t];
    return r === void 0 ? {
      schema: c,
      schemaPath: (0, ct._)`${e.schemaPath}${(0, ct.getProperty)(t)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}`
    } : {
      schema: c[r],
      schemaPath: (0, ct._)`${e.schemaPath}${(0, ct.getProperty)(t)}${(0, ct.getProperty)(r)}`,
      errSchemaPath: `${e.errSchemaPath}/${t}/${(0, nl.escapeFragment)(r)}`
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
Lt.getSubschema = tf;
function rf(e, t, { dataProp: r, dataPropType: n, data: s, dataTypes: a, propertyName: o }) {
  if (s !== void 0 && r !== void 0)
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  const { gen: c } = t;
  if (r !== void 0) {
    const { errorPath: d, dataPathArr: u, opts: h } = t, w = c.let("data", (0, ct._)`${t.data}${(0, ct.getProperty)(r)}`, !0);
    l(w), e.errorPath = (0, ct.str)`${d}${(0, nl.getErrorPath)(r, n, h.jsPropertySyntax)}`, e.parentDataProperty = (0, ct._)`${r}`, e.dataPathArr = [...u, e.parentDataProperty];
  }
  if (s !== void 0) {
    const d = s instanceof ct.Name ? s : c.let("data", s, !0);
    l(d), o !== void 0 && (e.propertyName = o);
  }
  a && (e.dataTypes = a);
  function l(d) {
    e.data = d, e.dataLevel = t.dataLevel + 1, e.dataTypes = [], t.definedProperties = /* @__PURE__ */ new Set(), e.parentData = t.data, e.dataNames = [...t.dataNames, d];
  }
}
Lt.extendSubschemaData = rf;
function nf(e, { jtdDiscriminator: t, jtdMetadata: r, compositeRule: n, createErrors: s, allErrors: a }) {
  n !== void 0 && (e.compositeRule = n), s !== void 0 && (e.createErrors = s), a !== void 0 && (e.allErrors = a), e.jtdDiscriminator = t, e.jtdMetadata = r;
}
Lt.extendSubschemaMode = nf;
var Te = {}, xn = function e(t, r) {
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
}, sl = { exports: {} }, Ct = sl.exports = function(e, t, r) {
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
          for (var w = 0; w < h.length; w++)
            Nn(e, t, r, h[w], s + "/" + u + "/" + w, a, s, u, n, w);
      } else if (u in Ct.propsKeywords) {
        if (h && typeof h == "object")
          for (var $ in h)
            Nn(e, t, r, h[$], s + "/" + u + "/" + sf($), a, s, u, n, $);
      } else (u in Ct.keywords || e.allKeys && !(u in Ct.skipKeywords)) && Nn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function sf(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var af = sl.exports;
Object.defineProperty(Te, "__esModule", { value: !0 });
Te.getSchemaRefs = Te.resolveUrl = Te.normalizeId = Te._getFullPath = Te.getFullPath = Te.inlineRef = void 0;
const of = L, cf = xn, lf = af, uf = /* @__PURE__ */ new Set([
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
function df(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !zs(e) : t ? al(e) <= t : !1;
}
Te.inlineRef = df;
const ff = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function zs(e) {
  for (const t in e) {
    if (ff.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(zs) || typeof r == "object" && zs(r))
      return !0;
  }
  return !1;
}
function al(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !uf.has(r) && (typeof e[r] == "object" && (0, of.eachItem)(e[r], (n) => t += al(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function ol(e, t = "", r) {
  r !== !1 && (t = fr(t));
  const n = e.parse(t);
  return il(e, n);
}
Te.getFullPath = ol;
function il(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
Te._getFullPath = il;
const hf = /#\/?$/;
function fr(e) {
  return e ? e.replace(hf, "") : "";
}
Te.normalizeId = fr;
function mf(e, t, r) {
  return r = fr(r), e.resolve(t, r);
}
Te.resolveUrl = mf;
const pf = /^[a-z_][-a-z0-9._]*$/i;
function $f(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = fr(e[r] || t), a = { "": s }, o = ol(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return lf(e, { allKeys: !0 }, (h, w, $, y) => {
    if (y === void 0)
      return;
    const g = o + w;
    let _ = a[y];
    typeof h[r] == "string" && (_ = m.call(this, h[r])), E.call(this, h.$anchor), E.call(this, h.$dynamicAnchor), a[w] = _;
    function m(P) {
      const O = this.opts.uriResolver.resolve;
      if (P = fr(_ ? O(_, P) : P), l.has(P))
        throw u(P);
      l.add(P);
      let T = this.refs[P];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, P) : P !== fr(g) && (P[0] === "#" ? (d(h, c[P], P), c[P] = h) : this.refs[P] = g), P;
    }
    function E(P) {
      if (typeof P == "string") {
        if (!pf.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), c;
  function d(h, w, $) {
    if (w !== void 0 && !cf(h, w))
      throw u($);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
Te.getSchemaRefs = $f;
Object.defineProperty(nt, "__esModule", { value: !0 });
nt.getData = nt.KeywordCxt = nt.validateFunctionCode = void 0;
const cl = $r, mi = be, ma = vt, Fn = be, yf = Zn, Ur = lt, vs = Lt, W = ee, Z = Be, gf = Te, wt = L, Ar = Zr;
function _f(e) {
  if (dl(e) && (fl(e), ul(e))) {
    Ef(e);
    return;
  }
  ll(e, () => (0, cl.topBoolOrEmptySchema)(e));
}
nt.validateFunctionCode = _f;
function ll({ gen: e, validateName: t, schema: r, schemaEnv: n, opts: s }, a) {
  s.code.es5 ? e.func(t, (0, W._)`${Z.default.data}, ${Z.default.valCxt}`, n.$async, () => {
    e.code((0, W._)`"use strict"; ${pi(r, s)}`), wf(e, s), e.code(a);
  }) : e.func(t, (0, W._)`${Z.default.data}, ${vf(s)}`, n.$async, () => e.code(pi(r, s)).code(a));
}
function vf(e) {
  return (0, W._)`{${Z.default.instancePath}="", ${Z.default.parentData}, ${Z.default.parentDataProperty}, ${Z.default.rootData}=${Z.default.data}${e.dynamicRef ? (0, W._)`, ${Z.default.dynamicAnchors}={}` : W.nil}}={}`;
}
function wf(e, t) {
  e.if(Z.default.valCxt, () => {
    e.var(Z.default.instancePath, (0, W._)`${Z.default.valCxt}.${Z.default.instancePath}`), e.var(Z.default.parentData, (0, W._)`${Z.default.valCxt}.${Z.default.parentData}`), e.var(Z.default.parentDataProperty, (0, W._)`${Z.default.valCxt}.${Z.default.parentDataProperty}`), e.var(Z.default.rootData, (0, W._)`${Z.default.valCxt}.${Z.default.rootData}`), t.dynamicRef && e.var(Z.default.dynamicAnchors, (0, W._)`${Z.default.valCxt}.${Z.default.dynamicAnchors}`);
  }, () => {
    e.var(Z.default.instancePath, (0, W._)`""`), e.var(Z.default.parentData, (0, W._)`undefined`), e.var(Z.default.parentDataProperty, (0, W._)`undefined`), e.var(Z.default.rootData, Z.default.data), t.dynamicRef && e.var(Z.default.dynamicAnchors, (0, W._)`{}`);
  });
}
function Ef(e) {
  const { schema: t, opts: r, gen: n } = e;
  ll(e, () => {
    r.$comment && t.$comment && ml(e), Rf(e), n.let(Z.default.vErrors, null), n.let(Z.default.errors, 0), r.unevaluated && bf(e), hl(e), Tf(e);
  });
}
function bf(e) {
  const { gen: t, validateName: r } = e;
  e.evaluated = t.const("evaluated", (0, W._)`${r}.evaluated`), t.if((0, W._)`${e.evaluated}.dynamicProps`, () => t.assign((0, W._)`${e.evaluated}.props`, (0, W._)`undefined`)), t.if((0, W._)`${e.evaluated}.dynamicItems`, () => t.assign((0, W._)`${e.evaluated}.items`, (0, W._)`undefined`));
}
function pi(e, t) {
  const r = typeof e == "object" && e[t.schemaId];
  return r && (t.code.source || t.code.process) ? (0, W._)`/*# sourceURL=${r} */` : W.nil;
}
function Sf(e, t) {
  if (dl(e) && (fl(e), ul(e))) {
    Pf(e, t);
    return;
  }
  (0, cl.boolOrEmptySchema)(e, t);
}
function ul({ schema: e, self: t }) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t.RULES.all[r])
      return !0;
  return !1;
}
function dl(e) {
  return typeof e.schema != "boolean";
}
function Pf(e, t) {
  const { schema: r, gen: n, opts: s } = e;
  s.$comment && r.$comment && ml(e), Of(e), If(e);
  const a = n.const("_errs", Z.default.errors);
  hl(e, a), n.var(t, (0, W._)`${a} === ${Z.default.errors}`);
}
function fl(e) {
  (0, wt.checkUnknownRules)(e), Nf(e);
}
function hl(e, t) {
  if (e.opts.jtd)
    return $i(e, [], !1, t);
  const r = (0, mi.getSchemaTypes)(e.schema), n = (0, mi.coerceAndCheckDataType)(e, r);
  $i(e, r, !n, t);
}
function Nf(e) {
  const { schema: t, errSchemaPath: r, opts: n, self: s } = e;
  t.$ref && n.ignoreKeywordsWithRef && (0, wt.schemaHasRulesButRef)(t, s.RULES) && s.logger.warn(`$ref: keywords ignored in schema at path "${r}"`);
}
function Rf(e) {
  const { schema: t, opts: r } = e;
  t.default !== void 0 && r.useDefaults && r.strictSchema && (0, wt.checkStrictMode)(e, "default is ignored in the schema root");
}
function Of(e) {
  const t = e.schema[e.opts.schemaId];
  t && (e.baseId = (0, gf.resolveUrl)(e.opts.uriResolver, e.baseId, t));
}
function If(e) {
  if (e.schema.$async && !e.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function ml({ gen: e, schemaEnv: t, schema: r, errSchemaPath: n, opts: s }) {
  const a = r.$comment;
  if (s.$comment === !0)
    e.code((0, W._)`${Z.default.self}.logger.log(${a})`);
  else if (typeof s.$comment == "function") {
    const o = (0, W.str)`${n}/$comment`, c = e.scopeValue("root", { ref: t.root });
    e.code((0, W._)`${Z.default.self}.opts.$comment(${a}, ${o}, ${c}.schema)`);
  }
}
function Tf(e) {
  const { gen: t, schemaEnv: r, validateName: n, ValidationError: s, opts: a } = e;
  r.$async ? t.if((0, W._)`${Z.default.errors} === 0`, () => t.return(Z.default.data), () => t.throw((0, W._)`new ${s}(${Z.default.vErrors})`)) : (t.assign((0, W._)`${n}.errors`, Z.default.vErrors), a.unevaluated && jf(e), t.return((0, W._)`${Z.default.errors} === 0`));
}
function jf({ gen: e, evaluated: t, props: r, items: n }) {
  r instanceof W.Name && e.assign((0, W._)`${t}.props`, r), n instanceof W.Name && e.assign((0, W._)`${t}.items`, n);
}
function $i(e, t, r, n) {
  const { gen: s, schema: a, data: o, allErrors: c, opts: l, self: d } = e, { RULES: u } = d;
  if (a.$ref && (l.ignoreKeywordsWithRef || !(0, wt.schemaHasRulesButRef)(a, u))) {
    s.block(() => yl(e, "$ref", u.all.$ref.definition));
    return;
  }
  l.jtd || kf(e, t), s.block(() => {
    for (const w of u.rules)
      h(w);
    h(u.post);
  });
  function h(w) {
    (0, ma.shouldUseGroup)(a, w) && (w.type ? (s.if((0, Fn.checkDataType)(w.type, o, l.strictNumbers)), yi(e, w), t.length === 1 && t[0] === w.type && r && (s.else(), (0, Fn.reportTypeError)(e)), s.endIf()) : yi(e, w), c || s.if((0, W._)`${Z.default.errors} === ${n || 0}`));
  }
}
function yi(e, t) {
  const { gen: r, schema: n, opts: { useDefaults: s } } = e;
  s && (0, yf.assignDefaults)(e, t.type), r.block(() => {
    for (const a of t.rules)
      (0, ma.shouldUseRule)(n, a) && yl(e, a.keyword, a.definition, t.type);
  });
}
function kf(e, t) {
  e.schemaEnv.meta || !e.opts.strictTypes || (Af(e, t), e.opts.allowUnionTypes || Cf(e, t), Df(e, e.dataTypes));
}
function Af(e, t) {
  if (t.length) {
    if (!e.dataTypes.length) {
      e.dataTypes = t;
      return;
    }
    t.forEach((r) => {
      pl(e.dataTypes, r) || pa(e, `type "${r}" not allowed by context "${e.dataTypes.join(",")}"`);
    }), Lf(e, t);
  }
}
function Cf(e, t) {
  t.length > 1 && !(t.length === 2 && t.includes("null")) && pa(e, "use allowUnionTypes to allow union type keyword");
}
function Df(e, t) {
  const r = e.self.RULES.all;
  for (const n in r) {
    const s = r[n];
    if (typeof s == "object" && (0, ma.shouldUseRule)(e.schema, s)) {
      const { type: a } = s.definition;
      a.length && !a.some((o) => Mf(t, o)) && pa(e, `missing type "${a.join(",")}" for keyword "${n}"`);
    }
  }
}
function Mf(e, t) {
  return e.includes(t) || t === "number" && e.includes("integer");
}
function pl(e, t) {
  return e.includes(t) || t === "integer" && e.includes("number");
}
function Lf(e, t) {
  const r = [];
  for (const n of e.dataTypes)
    pl(t, n) ? r.push(n) : t.includes("integer") && n === "number" && r.push("integer");
  e.dataTypes = r;
}
function pa(e, t) {
  const r = e.schemaEnv.baseId + e.errSchemaPath;
  t += ` at "${r}" (strictTypes)`, (0, wt.checkStrictMode)(e, t, e.opts.strictTypes);
}
class $l {
  constructor(t, r, n) {
    if ((0, Ur.validateKeywordUsage)(t, r, n), this.gen = t.gen, this.allErrors = t.allErrors, this.keyword = n, this.data = t.data, this.schema = t.schema[n], this.$data = r.$data && t.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, wt.schemaRefOrVal)(t, this.schema, n, this.$data), this.schemaType = r.schemaType, this.parentSchema = t.schema, this.params = {}, this.it = t, this.def = r, this.$data)
      this.schemaCode = t.gen.const("vSchema", gl(this.$data, t));
    else if (this.schemaCode = this.schemaValue, !(0, Ur.validSchemaType)(this.schema, r.schemaType, r.allowUndefined))
      throw new Error(`${n} value must be ${JSON.stringify(r.schemaType)}`);
    ("code" in r ? r.trackErrors : r.errors !== !1) && (this.errsCount = t.gen.const("_errs", Z.default.errors));
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
    return Sf(s, r), s;
  }
  mergeEvaluated(t, r) {
    const { it: n, gen: s } = this;
    n.opts.unevaluated && (n.props !== !0 && t.props !== void 0 && (n.props = wt.mergeEvaluated.props(s, t.props, n.props, r)), n.items !== !0 && t.items !== void 0 && (n.items = wt.mergeEvaluated.items(s, t.items, n.items, r)));
  }
  mergeValidEvaluated(t, r) {
    const { it: n, gen: s } = this;
    if (n.opts.unevaluated && (n.props !== !0 || n.items !== !0))
      return s.if(r, () => this.mergeEvaluated(t, W.Name)), !0;
  }
}
nt.KeywordCxt = $l;
function yl(e, t, r, n) {
  const s = new $l(e, r, t);
  "code" in r ? r.code(s, n) : s.$data && r.validate ? (0, Ur.funcKeywordCode)(s, r) : "macro" in r ? (0, Ur.macroKeywordCode)(s, r) : (r.compile || r.validate) && (0, Ur.funcKeywordCode)(s, r);
}
const Vf = /^\/(?:[^~]|~0|~1)*$/, Ff = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function gl(e, { dataLevel: t, dataNames: r, dataPathArr: n }) {
  let s, a;
  if (e === "")
    return Z.default.rootData;
  if (e[0] === "/") {
    if (!Vf.test(e))
      throw new Error(`Invalid JSON-pointer: ${e}`);
    s = e, a = Z.default.rootData;
  } else {
    const d = Ff.exec(e);
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
    d && (a = (0, W._)`${a}${(0, W.getProperty)((0, wt.unescapeJsonPointer)(d))}`, o = (0, W._)`${o} && ${a}`);
  return o;
  function l(d, u) {
    return `Cannot access ${d} ${u} levels up, current level is ${t}`;
  }
}
nt.getData = gl;
var xr = {};
Object.defineProperty(xr, "__esModule", { value: !0 });
class zf extends Error {
  constructor(t) {
    super("validation failed"), this.errors = t, this.ajv = this.validation = !0;
  }
}
xr.default = zf;
var _r = {};
Object.defineProperty(_r, "__esModule", { value: !0 });
const ws = Te;
class Uf extends Error {
  constructor(t, r, n, s) {
    super(s || `can't resolve reference ${n} from id ${r}`), this.missingRef = (0, ws.resolveUrl)(t, r, n), this.missingSchema = (0, ws.normalizeId)((0, ws.getFullPath)(t, this.missingRef));
  }
}
_r.default = Uf;
var Fe = {};
Object.defineProperty(Fe, "__esModule", { value: !0 });
Fe.resolveSchema = Fe.getCompilingSchema = Fe.resolveRef = Fe.compileSchema = Fe.SchemaEnv = void 0;
const Ye = ee, qf = xr, qt = Be, tt = Te, gi = L, Gf = nt;
let es = class {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, tt.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
};
Fe.SchemaEnv = es;
function $a(e) {
  const t = _l.call(this, e);
  if (t)
    return t;
  const r = (0, tt.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Ye.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: qf.default,
    code: (0, Ye._)`require("ajv/dist/runtime/validation_error").default`
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
    dataPathArr: [Ye.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ye.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
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
    this._compilations.add(e), (0, Gf.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(qt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const $ = new Function(`${qt.default.self}`, `${qt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: $ }), $.errors = null, $.schema = e.schema, $.schemaEnv = e, e.$async && ($.$async = !0), this.opts.code.source === !0 && ($.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: y, items: g } = d;
      $.evaluated = {
        props: y instanceof Ye.Name ? void 0 : y,
        items: g instanceof Ye.Name ? void 0 : g,
        dynamicProps: y instanceof Ye.Name,
        dynamicItems: g instanceof Ye.Name
      }, $.source && ($.source.evaluated = (0, Ye.stringify)($.evaluated));
    }
    return e.validate = $, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Fe.compileSchema = $a;
function Kf(e, t, r) {
  var n;
  r = (0, tt.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = Jf.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new es({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = Hf.call(this, a);
}
Fe.resolveRef = Kf;
function Hf(e) {
  return (0, tt.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : $a.call(this, e);
}
function _l(e) {
  for (const t of this._compilations)
    if (Bf(t, e))
      return t;
}
Fe.getCompilingSchema = _l;
function Bf(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function Jf(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || ts.call(this, e, t);
}
function ts(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, tt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, tt.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Es.call(this, r, e);
  const a = (0, tt.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = ts.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Es.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || $a.call(this, o), a === (0, tt.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, tt.resolveUrl)(this.opts.uriResolver, s, d)), new es({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Es.call(this, r, o);
  }
}
Fe.resolveSchema = ts;
const Wf = /* @__PURE__ */ new Set([
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
    const l = r[(0, gi.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Wf.has(c) && d && (t = (0, tt.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, gi.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, tt.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ts.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new es({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const Xf = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Yf = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Qf = "object", Zf = [
  "$data"
], xf = {
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
}, eh = !1, th = {
  $id: Xf,
  description: Yf,
  type: Qf,
  required: Zf,
  properties: xf,
  additionalProperties: eh
};
var ya = {}, rs = { exports: {} };
const rh = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), vl = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function wl(e) {
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
const nh = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function _i(e) {
  return e.length = 0, !0;
}
function sh(e, t, r) {
  if (e.length) {
    const n = wl(e);
    if (n !== "")
      t.push(n);
    else
      return r.error = !0, !1;
    e.length = 0;
  }
  return !0;
}
function ah(e) {
  let t = 0;
  const r = { error: !1, address: "", zone: "" }, n = [], s = [];
  let a = !1, o = !1, c = sh;
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
        c = _i;
      } else {
        s.push(d);
        continue;
      }
  }
  return s.length && (c === _i ? r.zone = s.join("") : o ? n.push(s.join("")) : n.push(wl(s))), r.address = n.join(""), r;
}
function El(e) {
  if (oh(e, ":") < 2)
    return { host: e, isIPV6: !1 };
  const t = ah(e);
  if (t.error)
    return { host: e, isIPV6: !1 };
  {
    let r = t.address, n = t.address;
    return t.zone && (r += "%" + t.zone, n += "%25" + t.zone), { host: r, isIPV6: !0, escapedHost: n };
  }
}
function oh(e, t) {
  let r = 0;
  for (let n = 0; n < e.length; n++)
    e[n] === t && r++;
  return r;
}
function ih(e) {
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
function ch(e, t) {
  const r = t !== !0 ? escape : unescape;
  return e.scheme !== void 0 && (e.scheme = r(e.scheme)), e.userinfo !== void 0 && (e.userinfo = r(e.userinfo)), e.host !== void 0 && (e.host = r(e.host)), e.path !== void 0 && (e.path = r(e.path)), e.query !== void 0 && (e.query = r(e.query)), e.fragment !== void 0 && (e.fragment = r(e.fragment)), e;
}
function lh(e) {
  const t = [];
  if (e.userinfo !== void 0 && (t.push(e.userinfo), t.push("@")), e.host !== void 0) {
    let r = unescape(e.host);
    if (!vl(r)) {
      const n = El(r);
      n.isIPV6 === !0 ? r = `[${n.escapedHost}]` : r = e.host;
    }
    t.push(r);
  }
  return (typeof e.port == "number" || typeof e.port == "string") && (t.push(":"), t.push(String(e.port))), t.length ? t.join("") : void 0;
}
var bl = {
  nonSimpleDomain: nh,
  recomposeAuthority: lh,
  normalizeComponentEncoding: ch,
  removeDotSegments: ih,
  isIPv4: vl,
  isUUID: rh,
  normalizeIPv6: El
};
const { isUUID: uh } = bl, dh = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function Sl(e) {
  return e.secure === !0 ? !0 : e.secure === !1 ? !1 : e.scheme ? e.scheme.length === 3 && (e.scheme[0] === "w" || e.scheme[0] === "W") && (e.scheme[1] === "s" || e.scheme[1] === "S") && (e.scheme[2] === "s" || e.scheme[2] === "S") : !1;
}
function Pl(e) {
  return e.host || (e.error = e.error || "HTTP URIs must have a host."), e;
}
function Nl(e) {
  const t = String(e.scheme).toLowerCase() === "https";
  return (e.port === (t ? 443 : 80) || e.port === "") && (e.port = void 0), e.path || (e.path = "/"), e;
}
function fh(e) {
  return e.secure = Sl(e), e.resourceName = (e.path || "/") + (e.query ? "?" + e.query : ""), e.path = void 0, e.query = void 0, e;
}
function hh(e) {
  if ((e.port === (Sl(e) ? 443 : 80) || e.port === "") && (e.port = void 0), typeof e.secure == "boolean" && (e.scheme = e.secure ? "wss" : "ws", e.secure = void 0), e.resourceName) {
    const [t, r] = e.resourceName.split("?");
    e.path = t && t !== "/" ? t : void 0, e.query = r, e.resourceName = void 0;
  }
  return e.fragment = void 0, e;
}
function mh(e, t) {
  if (!e.path)
    return e.error = "URN can not be parsed", e;
  const r = e.path.match(dh);
  if (r) {
    const n = t.scheme || e.scheme || "urn";
    e.nid = r[1].toLowerCase(), e.nss = r[2];
    const s = `${n}:${t.nid || e.nid}`, a = ga(s);
    e.path = void 0, a && (e = a.parse(e, t));
  } else
    e.error = e.error || "URN can not be parsed.";
  return e;
}
function ph(e, t) {
  if (e.nid === void 0)
    throw new Error("URN without nid cannot be serialized");
  const r = t.scheme || e.scheme || "urn", n = e.nid.toLowerCase(), s = `${r}:${t.nid || n}`, a = ga(s);
  a && (e = a.serialize(e, t));
  const o = e, c = e.nss;
  return o.path = `${n || t.nid}:${c}`, t.skipEscape = !0, o;
}
function $h(e, t) {
  const r = e;
  return r.uuid = r.nss, r.nss = void 0, !t.tolerant && (!r.uuid || !uh(r.uuid)) && (r.error = r.error || "UUID is not valid."), r;
}
function yh(e) {
  const t = e;
  return t.nss = (e.uuid || "").toLowerCase(), t;
}
const Rl = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: !0,
    parse: Pl,
    serialize: Nl
  }
), gh = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: Rl.domainHost,
    parse: Pl,
    serialize: Nl
  }
), Rn = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
    domainHost: !0,
    parse: fh,
    serialize: hh
  }
), _h = (
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: Rn.domainHost,
    parse: Rn.parse,
    serialize: Rn.serialize
  }
), vh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: mh,
    serialize: ph,
    skipNormalize: !0
  }
), wh = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: $h,
    serialize: yh,
    skipNormalize: !0
  }
), zn = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http: Rl,
    https: gh,
    ws: Rn,
    wss: _h,
    urn: vh,
    "urn:uuid": wh
  }
);
Object.setPrototypeOf(zn, null);
function ga(e) {
  return e && (zn[
    /** @type {SchemeName} */
    e
  ] || zn[
    /** @type {SchemeName} */
    e.toLowerCase()
  ]) || void 0;
}
var Eh = {
  SCHEMES: zn,
  getSchemeHandler: ga
};
const { normalizeIPv6: bh, removeDotSegments: Vr, recomposeAuthority: Sh, normalizeComponentEncoding: sn, isIPv4: Ph, nonSimpleDomain: Nh } = bl, { SCHEMES: Rh, getSchemeHandler: Ol } = Eh;
function Oh(e, t) {
  return typeof e == "string" ? e = /** @type {T} */
  ut(Et(e, t), t) : typeof e == "object" && (e = /** @type {T} */
  Et(ut(e, t), t)), e;
}
function Ih(e, t, r) {
  const n = r ? Object.assign({ scheme: "null" }, r) : { scheme: "null" }, s = Il(Et(e, n), Et(t, n), n, !0);
  return n.skipEscape = !0, ut(s, n);
}
function Il(e, t, r, n) {
  const s = {};
  return n || (e = Et(ut(e, r), r), t = Et(ut(t, r), r)), r = r || {}, !r.tolerant && t.scheme ? (s.scheme = t.scheme, s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Vr(t.path || ""), s.query = t.query) : (t.userinfo !== void 0 || t.host !== void 0 || t.port !== void 0 ? (s.userinfo = t.userinfo, s.host = t.host, s.port = t.port, s.path = Vr(t.path || ""), s.query = t.query) : (t.path ? (t.path[0] === "/" ? s.path = Vr(t.path) : ((e.userinfo !== void 0 || e.host !== void 0 || e.port !== void 0) && !e.path ? s.path = "/" + t.path : e.path ? s.path = e.path.slice(0, e.path.lastIndexOf("/") + 1) + t.path : s.path = t.path, s.path = Vr(s.path)), s.query = t.query) : (s.path = e.path, t.query !== void 0 ? s.query = t.query : s.query = e.query), s.userinfo = e.userinfo, s.host = e.host, s.port = e.port), s.scheme = e.scheme), s.fragment = t.fragment, s;
}
function Th(e, t, r) {
  return typeof e == "string" ? (e = unescape(e), e = ut(sn(Et(e, r), !0), { ...r, skipEscape: !0 })) : typeof e == "object" && (e = ut(sn(e, !0), { ...r, skipEscape: !0 })), typeof t == "string" ? (t = unescape(t), t = ut(sn(Et(t, r), !0), { ...r, skipEscape: !0 })) : typeof t == "object" && (t = ut(sn(t, !0), { ...r, skipEscape: !0 })), e.toLowerCase() === t.toLowerCase();
}
function ut(e, t) {
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
  }, n = Object.assign({}, t), s = [], a = Ol(n.scheme || r.scheme);
  a && a.serialize && a.serialize(r, n), r.path !== void 0 && (n.skipEscape ? r.path = unescape(r.path) : (r.path = escape(r.path), r.scheme !== void 0 && (r.path = r.path.split("%3A").join(":")))), n.reference !== "suffix" && r.scheme && s.push(r.scheme, ":");
  const o = Sh(r);
  if (o !== void 0 && (n.reference !== "suffix" && s.push("//"), s.push(o), r.path && r.path[0] !== "/" && s.push("/")), r.path !== void 0) {
    let c = r.path;
    !n.absolutePath && (!a || !a.absolutePath) && (c = Vr(c)), o === void 0 && c[0] === "/" && c[1] === "/" && (c = "/%2F" + c.slice(2)), s.push(c);
  }
  return r.query !== void 0 && s.push("?", r.query), r.fragment !== void 0 && s.push("#", r.fragment), s.join("");
}
const jh = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
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
  const a = e.match(jh);
  if (a) {
    if (n.scheme = a[1], n.userinfo = a[3], n.host = a[4], n.port = parseInt(a[5], 10), n.path = a[6] || "", n.query = a[7], n.fragment = a[8], isNaN(n.port) && (n.port = a[5]), n.host)
      if (Ph(n.host) === !1) {
        const l = bh(n.host);
        n.host = l.host.toLowerCase(), s = l.isIPV6;
      } else
        s = !0;
    n.scheme === void 0 && n.userinfo === void 0 && n.host === void 0 && n.port === void 0 && n.query === void 0 && !n.path ? n.reference = "same-document" : n.scheme === void 0 ? n.reference = "relative" : n.fragment === void 0 ? n.reference = "absolute" : n.reference = "uri", r.reference && r.reference !== "suffix" && r.reference !== n.reference && (n.error = n.error || "URI is not a " + r.reference + " reference.");
    const o = Ol(r.scheme || n.scheme);
    if (!r.unicodeSupport && (!o || !o.unicodeSupport) && n.host && (r.domainHost || o && o.domainHost) && s === !1 && Nh(n.host))
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
const _a = {
  SCHEMES: Rh,
  normalize: Oh,
  resolve: Ih,
  resolveComponent: Il,
  equal: Th,
  serialize: ut,
  parse: Et
};
rs.exports = _a;
rs.exports.default = _a;
rs.exports.fastUri = _a;
var Tl = rs.exports;
Object.defineProperty(ya, "__esModule", { value: !0 });
const jl = Tl;
jl.code = 'require("ajv/dist/runtime/uri").default';
ya.default = jl;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = nt;
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
  const n = xr, s = _r, a = xt, o = Fe, c = ee, l = Te, d = be, u = L, h = th, w = ya, $ = (N, p) => new RegExp(N, p);
  $.code = "new RegExp";
  const y = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  ]), _ = {
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
  }, E = 200;
  function P(N) {
    var p, S, v, i, f, b, k, A, H, q, R, I, C, M, B, x, _e, Le, Ne, Re, ve, ot, ke, Ft, zt;
    const Xe = N.strict, Ut = (p = N.code) === null || p === void 0 ? void 0 : p.optimize, Rr = Ut === !0 || Ut === void 0 ? 1 : Ut || 0, Or = (v = (S = N.code) === null || S === void 0 ? void 0 : S.regExp) !== null && v !== void 0 ? v : $, ys = (i = N.uriResolver) !== null && i !== void 0 ? i : w.default;
    return {
      strictSchema: (b = (f = N.strictSchema) !== null && f !== void 0 ? f : Xe) !== null && b !== void 0 ? b : !0,
      strictNumbers: (A = (k = N.strictNumbers) !== null && k !== void 0 ? k : Xe) !== null && A !== void 0 ? A : !0,
      strictTypes: (q = (H = N.strictTypes) !== null && H !== void 0 ? H : Xe) !== null && q !== void 0 ? q : "log",
      strictTuples: (I = (R = N.strictTuples) !== null && R !== void 0 ? R : Xe) !== null && I !== void 0 ? I : "log",
      strictRequired: (M = (C = N.strictRequired) !== null && C !== void 0 ? C : Xe) !== null && M !== void 0 ? M : !1,
      code: N.code ? { ...N.code, optimize: Rr, regExp: Or } : { optimize: Rr, regExp: Or },
      loopRequired: (B = N.loopRequired) !== null && B !== void 0 ? B : E,
      loopEnum: (x = N.loopEnum) !== null && x !== void 0 ? x : E,
      meta: (_e = N.meta) !== null && _e !== void 0 ? _e : !0,
      messages: (Le = N.messages) !== null && Le !== void 0 ? Le : !0,
      inlineRefs: (Ne = N.inlineRefs) !== null && Ne !== void 0 ? Ne : !0,
      schemaId: (Re = N.schemaId) !== null && Re !== void 0 ? Re : "$id",
      addUsedSchema: (ve = N.addUsedSchema) !== null && ve !== void 0 ? ve : !0,
      validateSchema: (ot = N.validateSchema) !== null && ot !== void 0 ? ot : !0,
      validateFormats: (ke = N.validateFormats) !== null && ke !== void 0 ? ke : !0,
      unicodeRegExp: (Ft = N.unicodeRegExp) !== null && Ft !== void 0 ? Ft : !0,
      int32range: (zt = N.int32range) !== null && zt !== void 0 ? zt : !0,
      uriResolver: ys
    };
  }
  class O {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...P(p) };
      const { es5: S, lines: v } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: g, es5: S, lines: v }), this.logger = X(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, _, p, "NOT SUPPORTED"), T.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ge.call(this), p.formats && le.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: v } = this.opts;
      let i = h;
      v === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[v], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let v;
      if (typeof p == "string") {
        if (v = this.getSchema(p), !v)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        v = this.compile(p);
      const i = v(S);
      return "$async" in v || (this.errors = v.errors), i;
    }
    compile(p, S) {
      const v = this._addSchema(p, S);
      return v.validate || this._compileSchemaEnv(v);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: v } = this.opts;
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
          return await (this._loading[q] = v(q));
        } finally {
          delete this._loading[q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, v, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, v, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, v, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, v = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, v), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let v;
      if (v = p.$schema, v !== void 0 && typeof v != "string")
        throw new Error("$schema must be a string");
      if (v = v || this.opts.defaultMeta || this.defaultMeta(), !v)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(v, p);
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
        const { schemaId: v } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: v });
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
          let v = p[this.opts.schemaId];
          return v && (v = (0, l.normalizeId)(v), delete this.schemas[v], delete this.refs[v]), this;
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
      let v;
      if (typeof p == "string")
        v = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = v);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, v = S.keyword, Array.isArray(v) && !v.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, v, S), !S)
        return (0, u.eachItem)(v, (f) => D.call(this, f)), this;
      V.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(v, i.type.length === 0 ? (f) => D.call(this, f, i) : (f) => i.type.forEach((b) => D.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const v of S.rules) {
        const i = v.rules.findIndex((f) => f.keyword === p);
        i >= 0 && v.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: v = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${v}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const v = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const k of f)
          b = b[k];
        for (const k in v) {
          const A = v[k];
          if (typeof A != "object")
            continue;
          const { $data: H } = A.definition, q = b[k];
          H && q && (b[k] = z(q));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const v in p) {
        const i = p[v];
        (!S || S.test(v)) && (typeof i == "string" ? delete p[v] : i && !i.meta && (this._cache.delete(i.schema), delete p[v]));
      }
    }
    _addSchema(p, S, v, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
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
      v = (0, l.normalizeId)(b || v);
      const H = l.getSchemaRefs.call(this, p, v);
      return A = new o.SchemaEnv({ schema: p, schemaId: k, meta: S, baseId: v, localRefs: H }), this._cache.set(A.schema, A), f && !v.startsWith("#") && (v && this._checkUnique(v), this.refs[v] = A), i && this.validateSchema(p, !0), A;
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
  function T(N, p, S, v = "error") {
    for (const i in N) {
      const f = i;
      f in p && this.logger[v](`${S}: option ${i}. ${N[f]}`);
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
  function le() {
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
    for (const p of y)
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
  const Q = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(N, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(N, (v) => {
      if (S.keywords[v])
        throw new Error(`Keyword ${v} is already defined`);
      if (!Q.test(v))
        throw new Error(`Keyword ${v} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function D(N, p, S) {
    var v;
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
    p.before ? U.call(this, b, k, p.before) : b.rules.push(k), f.all[N] = k, (v = p.implements) === null || v === void 0 || v.forEach((A) => this.addKeyword(A));
  }
  function U(N, p, S) {
    const v = N.rules.findIndex((i) => i.keyword === S);
    v >= 0 ? N.rules.splice(v, 0, p) : (N.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
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
})(qc);
var va = {}, wa = {}, Ea = {};
Object.defineProperty(Ea, "__esModule", { value: !0 });
const kh = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
Ea.default = kh;
var bt = {};
Object.defineProperty(bt, "__esModule", { value: !0 });
bt.callRef = bt.getValidate = void 0;
const Ah = _r, vi = oe, Ue = ee, nr = Be, wi = Fe, an = L, Ch = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = wi.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new Ah.default(n.opts.uriResolver, s, r);
    if (u instanceof wi.SchemaEnv)
      return w(u);
    return $(u);
    function h() {
      if (a === d)
        return On(e, o, a, a.$async);
      const y = t.scopeValue("root", { ref: d });
      return On(e, (0, Ue._)`${y}.validate`, d, d.$async);
    }
    function w(y) {
      const g = kl(e, y);
      On(e, g, y, y.$async);
    }
    function $(y) {
      const g = t.scopeValue("schema", c.code.source === !0 ? { ref: y, code: (0, Ue.stringify)(y) } : { ref: y }), _ = t.name("valid"), m = e.subschema({
        schema: y,
        dataTypes: [],
        schemaPath: Ue.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, _);
      e.mergeEvaluated(m), e.ok(_);
    }
  }
};
function kl(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, Ue._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
bt.getValidate = kl;
function On(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? nr.default.this : Ue.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const y = s.let("valid");
    s.try(() => {
      s.code((0, Ue._)`await ${(0, vi.callValidateCode)(e, t, d)}`), $(t), o || s.assign(y, !0);
    }, (g) => {
      s.if((0, Ue._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), w(g), o || s.assign(y, !1);
    }), e.ok(y);
  }
  function h() {
    e.result((0, vi.callValidateCode)(e, t, d), () => $(t), () => w(t));
  }
  function w(y) {
    const g = (0, Ue._)`${y}.errors`;
    s.assign(nr.default.vErrors, (0, Ue._)`${nr.default.vErrors} === null ? ${g} : ${nr.default.vErrors}.concat(${g})`), s.assign(nr.default.errors, (0, Ue._)`${nr.default.vErrors}.length`);
  }
  function $(y) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const _ = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (_ && !_.dynamicProps)
        _.props !== void 0 && (a.props = an.mergeEvaluated.props(s, _.props, a.props));
      else {
        const m = s.var("props", (0, Ue._)`${y}.evaluated.props`);
        a.props = an.mergeEvaluated.props(s, m, a.props, Ue.Name);
      }
    if (a.items !== !0)
      if (_ && !_.dynamicItems)
        _.items !== void 0 && (a.items = an.mergeEvaluated.items(s, _.items, a.items));
      else {
        const m = s.var("items", (0, Ue._)`${y}.evaluated.items`);
        a.items = an.mergeEvaluated.items(s, m, a.items, Ue.Name);
      }
  }
}
bt.callRef = On;
bt.default = Ch;
Object.defineProperty(wa, "__esModule", { value: !0 });
const Dh = Ea, Mh = bt, Lh = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  Dh.default,
  Mh.default
];
wa.default = Lh;
var ba = {}, Sa = {};
Object.defineProperty(Sa, "__esModule", { value: !0 });
const Un = ee, Ot = Un.operators, qn = {
  maximum: { okStr: "<=", ok: Ot.LTE, fail: Ot.GT },
  minimum: { okStr: ">=", ok: Ot.GTE, fail: Ot.LT },
  exclusiveMaximum: { okStr: "<", ok: Ot.LT, fail: Ot.GTE },
  exclusiveMinimum: { okStr: ">", ok: Ot.GT, fail: Ot.LTE }
}, Vh = {
  message: ({ keyword: e, schemaCode: t }) => (0, Un.str)`must be ${qn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Un._)`{comparison: ${qn[e].okStr}, limit: ${t}}`
}, Fh = {
  keyword: Object.keys(qn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: Vh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Un._)`${r} ${qn[t].fail} ${n} || isNaN(${r})`);
  }
};
Sa.default = Fh;
var Pa = {};
Object.defineProperty(Pa, "__esModule", { value: !0 });
const qr = ee, zh = {
  message: ({ schemaCode: e }) => (0, qr.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, qr._)`{multipleOf: ${e}}`
}, Uh = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: zh,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, qr._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, qr._)`${o} !== parseInt(${o})`;
    e.fail$data((0, qr._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
Pa.default = Uh;
var Na = {}, Ra = {};
Object.defineProperty(Ra, "__esModule", { value: !0 });
function Al(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
Ra.default = Al;
Al.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Na, "__esModule", { value: !0 });
const Bt = ee, qh = L, Gh = Ra, Kh = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Bt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Bt._)`{limit: ${e}}`
}, Hh = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: Kh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Bt.operators.GT : Bt.operators.LT, o = s.opts.unicode === !1 ? (0, Bt._)`${r}.length` : (0, Bt._)`${(0, qh.useFunc)(e.gen, Gh.default)}(${r})`;
    e.fail$data((0, Bt._)`${o} ${a} ${n}`);
  }
};
Na.default = Hh;
var Oa = {};
Object.defineProperty(Oa, "__esModule", { value: !0 });
const Bh = oe, Gn = ee, Jh = {
  message: ({ schemaCode: e }) => (0, Gn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Gn._)`{pattern: ${e}}`
}, Wh = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: Jh,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", c = r ? (0, Gn._)`(new RegExp(${s}, ${o}))` : (0, Bh.usePattern)(e, n);
    e.fail$data((0, Gn._)`!${c}.test(${t})`);
  }
};
Oa.default = Wh;
var Ia = {};
Object.defineProperty(Ia, "__esModule", { value: !0 });
const Gr = ee, Xh = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Gr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Gr._)`{limit: ${e}}`
}, Yh = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: Xh,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Gr.operators.GT : Gr.operators.LT;
    e.fail$data((0, Gr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Ia.default = Yh;
var Ta = {};
Object.defineProperty(Ta, "__esModule", { value: !0 });
const Cr = oe, Kr = ee, Qh = L, Zh = {
  message: ({ params: { missingProperty: e } }) => (0, Kr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Kr._)`{missingProperty: ${e}}`
}, xh = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: Zh,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const $ = e.parentSchema.properties, { definedProperties: y } = e.it;
      for (const g of r)
        if (($ == null ? void 0 : $[g]) === void 0 && !y.has(g)) {
          const _ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${_}" (strictRequired)`;
          (0, Qh.checkStrictMode)(o, m, o.opts.strictRequired);
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
        const y = t.let("valid", !0);
        e.block$data(y, () => w($, y)), e.ok(y);
      } else
        t.if((0, Cr.checkMissingProp)(e, r, $)), (0, Cr.reportMissingProp)(e, $), t.else();
    }
    function h() {
      t.forOf("prop", n, ($) => {
        e.setParams({ missingProperty: $ }), t.if((0, Cr.noPropertyInData)(t, s, $, c.ownProperties), () => e.error());
      });
    }
    function w($, y) {
      e.setParams({ missingProperty: $ }), t.forOf($, n, () => {
        t.assign(y, (0, Cr.propertyInData)(t, s, $, c.ownProperties)), t.if((0, Kr.not)(y), () => {
          e.error(), t.break();
        });
      }, Kr.nil);
    }
  }
};
Ta.default = xh;
var ja = {};
Object.defineProperty(ja, "__esModule", { value: !0 });
const Hr = ee, em = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Hr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Hr._)`{limit: ${e}}`
}, tm = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: em,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Hr.operators.GT : Hr.operators.LT;
    e.fail$data((0, Hr._)`${r}.length ${s} ${n}`);
  }
};
ja.default = tm;
var ka = {}, en = {};
Object.defineProperty(en, "__esModule", { value: !0 });
const Cl = xn;
Cl.code = 'require("ajv/dist/runtime/equal").default';
en.default = Cl;
Object.defineProperty(ka, "__esModule", { value: !0 });
const bs = be, Oe = ee, rm = L, nm = en, sm = {
  message: ({ params: { i: e, j: t } }) => (0, Oe.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Oe._)`{i: ${e}, j: ${t}}`
}, am = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: sm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, bs.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, Oe._)`${o} === false`), e.ok(l);
    function u() {
      const y = t.let("i", (0, Oe._)`${r}.length`), g = t.let("j");
      e.setParams({ i: y, j: g }), t.assign(l, !0), t.if((0, Oe._)`${y} > 1`, () => (h() ? w : $)(y, g));
    }
    function h() {
      return d.length > 0 && !d.some((y) => y === "object" || y === "array");
    }
    function w(y, g) {
      const _ = t.name("item"), m = (0, bs.checkDataTypes)(d, _, c.opts.strictNumbers, bs.DataType.Wrong), E = t.const("indices", (0, Oe._)`{}`);
      t.for((0, Oe._)`;${y}--;`, () => {
        t.let(_, (0, Oe._)`${r}[${y}]`), t.if(m, (0, Oe._)`continue`), d.length > 1 && t.if((0, Oe._)`typeof ${_} == "string"`, (0, Oe._)`${_} += "_"`), t.if((0, Oe._)`typeof ${E}[${_}] == "number"`, () => {
          t.assign(g, (0, Oe._)`${E}[${_}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Oe._)`${E}[${_}] = ${y}`);
      });
    }
    function $(y, g) {
      const _ = (0, rm.useFunc)(t, nm.default), m = t.name("outer");
      t.label(m).for((0, Oe._)`;${y}--;`, () => t.for((0, Oe._)`${g} = ${y}; ${g}--;`, () => t.if((0, Oe._)`${_}(${r}[${y}], ${r}[${g}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
ka.default = am;
var Aa = {};
Object.defineProperty(Aa, "__esModule", { value: !0 });
const Us = ee, om = L, im = en, cm = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Us._)`{allowedValue: ${e}}`
}, lm = {
  keyword: "const",
  $data: !0,
  error: cm,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Us._)`!${(0, om.useFunc)(t, im.default)}(${r}, ${s})`) : e.fail((0, Us._)`${a} !== ${r}`);
  }
};
Aa.default = lm;
var Ca = {};
Object.defineProperty(Ca, "__esModule", { value: !0 });
const Fr = ee, um = L, dm = en, fm = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, Fr._)`{allowedValues: ${e}}`
}, hm = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: fm,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, um.useFunc)(t, dm.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const $ = t.const("vSchema", a);
      u = (0, Fr.or)(...s.map((y, g) => w($, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, ($) => t.if((0, Fr._)`${d()}(${r}, ${$})`, () => t.assign(u, !0).break()));
    }
    function w($, y) {
      const g = s[y];
      return typeof g == "object" && g !== null ? (0, Fr._)`${d()}(${r}, ${$}[${y}])` : (0, Fr._)`${r} === ${g}`;
    }
  }
};
Ca.default = hm;
Object.defineProperty(ba, "__esModule", { value: !0 });
const mm = Sa, pm = Pa, $m = Na, ym = Oa, gm = Ia, _m = Ta, vm = ja, wm = ka, Em = Aa, bm = Ca, Sm = [
  // number
  mm.default,
  pm.default,
  // string
  $m.default,
  ym.default,
  // object
  gm.default,
  _m.default,
  // array
  vm.default,
  wm.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Em.default,
  bm.default
];
ba.default = Sm;
var Da = {}, vr = {};
Object.defineProperty(vr, "__esModule", { value: !0 });
vr.validateAdditionalItems = void 0;
const Jt = ee, qs = L, Pm = {
  message: ({ params: { len: e } }) => (0, Jt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Jt._)`{limit: ${e}}`
}, Nm = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Pm,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, qs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    Dl(e, n);
  }
};
function Dl(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, Jt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Jt._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, qs.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Jt._)`${c} <= ${t.length}`);
    r.if((0, Jt.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: qs.Type.Num }, d), o.allErrors || r.if((0, Jt.not)(d), () => r.break());
    });
  }
}
vr.validateAdditionalItems = Dl;
vr.default = Nm;
var Ma = {}, wr = {};
Object.defineProperty(wr, "__esModule", { value: !0 });
wr.validateTuple = void 0;
const Ei = ee, In = L, Rm = oe, Om = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return Ml(e, "additionalItems", t);
    r.items = !0, !(0, In.alwaysValidSchema)(r, t) && e.ok((0, Rm.validateArray)(e));
  }
};
function Ml(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = In.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, Ei._)`${a}.length`);
  r.forEach((h, w) => {
    (0, In.alwaysValidSchema)(c, h) || (n.if((0, Ei._)`${d} > ${w}`, () => e.subschema({
      keyword: o,
      schemaProp: w,
      dataProp: w
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: w, errSchemaPath: $ } = c, y = r.length, g = y === h.minItems && (y === h.maxItems || h[t] === !1);
    if (w.strictTuples && !g) {
      const _ = `"${o}" is ${y}-tuple, but minItems or maxItems/${t} are not specified or different at path "${$}"`;
      (0, In.checkStrictMode)(c, _, w.strictTuples);
    }
  }
}
wr.validateTuple = Ml;
wr.default = Om;
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Im = wr, Tm = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Im.validateTuple)(e, "items")
};
Ma.default = Tm;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const bi = ee, jm = L, km = oe, Am = vr, Cm = {
  message: ({ params: { len: e } }) => (0, bi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, bi._)`{limit: ${e}}`
}, Dm = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  error: Cm,
  code(e) {
    const { schema: t, parentSchema: r, it: n } = e, { prefixItems: s } = r;
    n.items = !0, !(0, jm.alwaysValidSchema)(n, t) && (s ? (0, Am.validateAdditionalItems)(e, s) : e.ok((0, km.validateArray)(e)));
  }
};
La.default = Dm;
var Va = {};
Object.defineProperty(Va, "__esModule", { value: !0 });
const Je = ee, on = L, Mm = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Je.str)`must contain at least ${e} valid item(s)` : (0, Je.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, Je._)`{minContains: ${e}}` : (0, Je._)`{minContains: ${e}, maxContains: ${t}}`
}, Lm = {
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
  trackErrors: !0,
  error: Mm,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    let o, c;
    const { minContains: l, maxContains: d } = n;
    a.opts.next ? (o = l === void 0 ? 1 : l, c = d) : o = 1;
    const u = t.const("len", (0, Je._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, on.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, on.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, on.alwaysValidSchema)(a, r)) {
      let g = (0, Je._)`${u} >= ${o}`;
      c !== void 0 && (g = (0, Je._)`${g} && ${u} <= ${c}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? $(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, Je._)`${s}.length > 0`, w)) : (t.let(h, !1), w()), e.result(h, () => e.reset());
    function w() {
      const g = t.name("_valid"), _ = t.let("count", 0);
      $(g, () => t.if(g, () => y(_)));
    }
    function $(g, _) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: on.Type.Num,
          compositeRule: !0
        }, g), _();
      });
    }
    function y(g) {
      t.code((0, Je._)`${g}++`), c === void 0 ? t.if((0, Je._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, Je._)`${g} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, Je._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Va.default = Lm;
var ns = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = ee, r = L, n = oe;
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
      const w = Array.isArray(l[h]) ? d : u;
      w[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: w } = l;
    if (Object.keys(d).length === 0)
      return;
    const $ = u.let("missing");
    for (const y in d) {
      const g = d[y];
      if (g.length === 0)
        continue;
      const _ = (0, n.propertyInData)(u, h, y, w.opts.ownProperties);
      l.setParams({
        property: y,
        depsCount: g.length,
        deps: g.join(", ")
      }), w.allErrors ? u.if(_, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${_} && (${(0, n.checkMissingProp)(l, g, $)})`), (0, n.reportMissingProp)(l, $), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: w, it: $ } = l, y = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)($, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, $.opts.ownProperties),
        () => {
          const _ = l.subschema({ keyword: w, schemaProp: g }, y);
          l.mergeValidEvaluated(_, y);
        },
        () => u.var(y, !0)
        // TODO var
      ), l.ok(y));
  }
  e.validateSchemaDeps = c, e.default = s;
})(ns);
var Fa = {};
Object.defineProperty(Fa, "__esModule", { value: !0 });
const Ll = ee, Vm = L, Fm = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, Ll._)`{propertyName: ${e.propertyName}}`
}, zm = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: Fm,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e;
    if ((0, Vm.alwaysValidSchema)(s, r))
      return;
    const a = t.name("valid");
    t.forIn("key", n, (o) => {
      e.setParams({ propertyName: o }), e.subschema({
        keyword: "propertyNames",
        data: o,
        dataTypes: ["string"],
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Ll.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Fa.default = zm;
var ss = {};
Object.defineProperty(ss, "__esModule", { value: !0 });
const cn = oe, xe = ee, Um = Be, ln = L, qm = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, xe._)`{additionalProperty: ${e.additionalProperty}}`
}, Gm = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: !0,
  trackErrors: !0,
  error: qm,
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, errsCount: a, it: o } = e;
    if (!a)
      throw new Error("ajv implementation error");
    const { allErrors: c, opts: l } = o;
    if (o.props = !0, l.removeAdditional !== "all" && (0, ln.alwaysValidSchema)(o, r))
      return;
    const d = (0, cn.allSchemaProperties)(n.properties), u = (0, cn.allSchemaProperties)(n.patternProperties);
    h(), e.ok((0, xe._)`${a} === ${Um.default.errors}`);
    function h() {
      t.forIn("key", s, (_) => {
        !d.length && !u.length ? y(_) : t.if(w(_), () => y(_));
      });
    }
    function w(_) {
      let m;
      if (d.length > 8) {
        const E = (0, ln.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, cn.isOwnProperty)(t, E, _);
      } else d.length ? m = (0, xe.or)(...d.map((E) => (0, xe._)`${_} === ${E}`)) : m = xe.nil;
      return u.length && (m = (0, xe.or)(m, ...u.map((E) => (0, xe._)`${(0, cn.usePattern)(e, E)}.test(${_})`))), (0, xe.not)(m);
    }
    function $(_) {
      t.code((0, xe._)`delete ${s}[${_}]`);
    }
    function y(_) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        $(_);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: _ }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, ln.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g(_, m, !1), t.if((0, xe.not)(m), () => {
          e.reset(), $(_);
        })) : (g(_, m), c || t.if((0, xe.not)(m), () => t.break()));
      }
    }
    function g(_, m, E) {
      const P = {
        keyword: "additionalProperties",
        dataProp: _,
        dataPropType: ln.Type.Str
      };
      E === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
ss.default = Gm;
var za = {};
Object.defineProperty(za, "__esModule", { value: !0 });
const Km = nt, Si = oe, Ss = L, Pi = ss, Hm = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && Pi.default.code(new Km.KeywordCxt(a, Pi.default, "additionalProperties"));
    const o = (0, Si.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Ss.mergeEvaluated.props(t, (0, Ss.toHash)(o), a.props));
    const c = o.filter((h) => !(0, Ss.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, Si.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
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
za.default = Hm;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const Ni = oe, un = ee, Ri = L, Oi = L, Bm = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, Ni.allSchemaProperties)(r), l = c.filter((g) => (0, Ri.alwaysValidSchema)(a, r[g]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof un.Name) && (a.props = (0, Oi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    w();
    function w() {
      for (const g of c)
        d && $(g), a.allErrors ? y(g) : (t.var(u, !0), y(g), t.if(u));
    }
    function $(g) {
      for (const _ in d)
        new RegExp(g).test(_) && (0, Ri.checkStrictMode)(a, `property ${_} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function y(g) {
      t.forIn("key", n, (_) => {
        t.if((0, un._)`${(0, Ni.usePattern)(e, g)}.test(${_})`, () => {
          const m = l.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: _,
            dataPropType: Oi.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, un._)`${h}[${_}]`, !0) : !m && !a.allErrors && t.if((0, un.not)(u), () => t.break());
        });
      });
    }
  }
};
Ua.default = Bm;
var qa = {};
Object.defineProperty(qa, "__esModule", { value: !0 });
const Jm = L, Wm = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if ((0, Jm.alwaysValidSchema)(n, r)) {
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
qa.default = Wm;
var Ga = {};
Object.defineProperty(Ga, "__esModule", { value: !0 });
const Xm = oe, Ym = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: Xm.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
Ga.default = Ym;
var Ka = {};
Object.defineProperty(Ka, "__esModule", { value: !0 });
const Tn = ee, Qm = L, Zm = {
  message: "must match exactly one schema in oneOf",
  params: ({ params: e }) => (0, Tn._)`{passingSchemas: ${e.passing}}`
}, xm = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: !0,
  error: Zm,
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
        let w;
        (0, Qm.alwaysValidSchema)(s, u) ? t.var(l, !0) : w = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Tn._)`${l} && ${o}`).assign(o, !1).assign(c, (0, Tn._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), w && e.mergeEvaluated(w, Tn.Name);
        });
      });
    }
  }
};
Ka.default = xm;
var Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const ep = L, tp = {
  keyword: "allOf",
  schemaType: "array",
  code(e) {
    const { gen: t, schema: r, it: n } = e;
    if (!Array.isArray(r))
      throw new Error("ajv implementation error");
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, ep.alwaysValidSchema)(n, a))
        return;
      const c = e.subschema({ keyword: "allOf", schemaProp: o }, s);
      e.ok(s), e.mergeEvaluated(c);
    });
  }
};
Ha.default = tp;
var Ba = {};
Object.defineProperty(Ba, "__esModule", { value: !0 });
const Kn = ee, Vl = L, rp = {
  message: ({ params: e }) => (0, Kn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Kn._)`{failingKeyword: ${e.ifClause}}`
}, np = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: rp,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, Vl.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = Ii(n, "then"), a = Ii(n, "else");
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
        const w = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(w, o), h ? t.assign(h, (0, Kn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function Ii(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, Vl.alwaysValidSchema)(e, r);
}
Ba.default = np;
var Ja = {};
Object.defineProperty(Ja, "__esModule", { value: !0 });
const sp = L, ap = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, sp.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Ja.default = ap;
Object.defineProperty(Da, "__esModule", { value: !0 });
const op = vr, ip = Ma, cp = wr, lp = La, up = Va, dp = ns, fp = Fa, hp = ss, mp = za, pp = Ua, $p = qa, yp = Ga, gp = Ka, _p = Ha, vp = Ba, wp = Ja;
function Ep(e = !1) {
  const t = [
    // any
    $p.default,
    yp.default,
    gp.default,
    _p.default,
    vp.default,
    wp.default,
    // object
    fp.default,
    hp.default,
    dp.default,
    mp.default,
    pp.default
  ];
  return e ? t.push(ip.default, lp.default) : t.push(op.default, cp.default), t.push(up.default), t;
}
Da.default = Ep;
var Wa = {}, Er = {};
Object.defineProperty(Er, "__esModule", { value: !0 });
Er.dynamicAnchor = void 0;
const Ps = ee, bp = Be, Ti = Fe, Sp = bt, Pp = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (e) => Fl(e, e.schema)
};
function Fl(e, t) {
  const { gen: r, it: n } = e;
  n.schemaEnv.root.dynamicAnchors[t] = !0;
  const s = (0, Ps._)`${bp.default.dynamicAnchors}${(0, Ps.getProperty)(t)}`, a = n.errSchemaPath === "#" ? n.validateName : Np(e);
  r.if((0, Ps._)`!${s}`, () => r.assign(s, a));
}
Er.dynamicAnchor = Fl;
function Np(e) {
  const { schemaEnv: t, schema: r, self: n } = e.it, { root: s, baseId: a, localRefs: o, meta: c } = t.root, { schemaId: l } = n.opts, d = new Ti.SchemaEnv({ schema: r, schemaId: l, root: s, baseId: a, localRefs: o, meta: c });
  return Ti.compileSchema.call(n, d), (0, Sp.getValidate)(e, d);
}
Er.default = Pp;
var br = {};
Object.defineProperty(br, "__esModule", { value: !0 });
br.dynamicRef = void 0;
const ji = ee, Rp = Be, ki = bt, Op = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (e) => zl(e, e.schema)
};
function zl(e, t) {
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
      const d = r.let("_v", (0, ji._)`${Rp.default.dynamicAnchors}${(0, ji.getProperty)(a)}`);
      r.if(d, c(d, l), c(s.validateName, l));
    } else
      c(s.validateName, l)();
  }
  function c(l, d) {
    return d ? () => r.block(() => {
      (0, ki.callRef)(e, l), r.let(d, !0);
    }) : () => (0, ki.callRef)(e, l);
  }
}
br.dynamicRef = zl;
br.default = Op;
var Xa = {};
Object.defineProperty(Xa, "__esModule", { value: !0 });
const Ip = Er, Tp = L, jp = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(e) {
    e.schema ? (0, Ip.dynamicAnchor)(e, "") : (0, Tp.checkStrictMode)(e.it, "$recursiveAnchor: false is ignored");
  }
};
Xa.default = jp;
var Ya = {};
Object.defineProperty(Ya, "__esModule", { value: !0 });
const kp = br, Ap = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (e) => (0, kp.dynamicRef)(e, e.schema)
};
Ya.default = Ap;
Object.defineProperty(Wa, "__esModule", { value: !0 });
const Cp = Er, Dp = br, Mp = Xa, Lp = Ya, Vp = [Cp.default, Dp.default, Mp.default, Lp.default];
Wa.default = Vp;
var Qa = {}, Za = {};
Object.defineProperty(Za, "__esModule", { value: !0 });
const Ai = ns, Fp = {
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: Ai.error,
  code: (e) => (0, Ai.validatePropertyDeps)(e)
};
Za.default = Fp;
var xa = {};
Object.defineProperty(xa, "__esModule", { value: !0 });
const zp = ns, Up = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (e) => (0, zp.validateSchemaDeps)(e)
};
xa.default = Up;
var eo = {};
Object.defineProperty(eo, "__esModule", { value: !0 });
const qp = L, Gp = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: e, parentSchema: t, it: r }) {
    t.contains === void 0 && (0, qp.checkStrictMode)(r, `"${e}" without "contains" is ignored`);
  }
};
eo.default = Gp;
Object.defineProperty(Qa, "__esModule", { value: !0 });
const Kp = Za, Hp = xa, Bp = eo, Jp = [Kp.default, Hp.default, Bp.default];
Qa.default = Jp;
var to = {}, ro = {};
Object.defineProperty(ro, "__esModule", { value: !0 });
const jt = ee, Ci = L, Wp = Be, Xp = {
  message: "must NOT have unevaluated properties",
  params: ({ params: e }) => (0, jt._)`{unevaluatedProperty: ${e.unevaluatedProperty}}`
}, Yp = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: !0,
  error: Xp,
  code(e) {
    const { gen: t, schema: r, data: n, errsCount: s, it: a } = e;
    if (!s)
      throw new Error("ajv implementation error");
    const { allErrors: o, props: c } = a;
    c instanceof jt.Name ? t.if((0, jt._)`${c} !== true`, () => t.forIn("key", n, (h) => t.if(d(c, h), () => l(h)))) : c !== !0 && t.forIn("key", n, (h) => c === void 0 ? l(h) : t.if(u(c, h), () => l(h))), a.props = !0, e.ok((0, jt._)`${s} === ${Wp.default.errors}`);
    function l(h) {
      if (r === !1) {
        e.setParams({ unevaluatedProperty: h }), e.error(), o || t.break();
        return;
      }
      if (!(0, Ci.alwaysValidSchema)(a, r)) {
        const w = t.name("valid");
        e.subschema({
          keyword: "unevaluatedProperties",
          dataProp: h,
          dataPropType: Ci.Type.Str
        }, w), o || t.if((0, jt.not)(w), () => t.break());
      }
    }
    function d(h, w) {
      return (0, jt._)`!${h} || !${h}[${w}]`;
    }
    function u(h, w) {
      const $ = [];
      for (const y in h)
        h[y] === !0 && $.push((0, jt._)`${w} !== ${y}`);
      return (0, jt.and)(...$);
    }
  }
};
ro.default = Yp;
var no = {};
Object.defineProperty(no, "__esModule", { value: !0 });
const Wt = ee, Di = L, Qp = {
  message: ({ params: { len: e } }) => (0, Wt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Wt._)`{limit: ${e}}`
}, Zp = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: Qp,
  code(e) {
    const { gen: t, schema: r, data: n, it: s } = e, a = s.items || 0;
    if (a === !0)
      return;
    const o = t.const("len", (0, Wt._)`${n}.length`);
    if (r === !1)
      e.setParams({ len: a }), e.fail((0, Wt._)`${o} > ${a}`);
    else if (typeof r == "object" && !(0, Di.alwaysValidSchema)(s, r)) {
      const l = t.var("valid", (0, Wt._)`${o} <= ${a}`);
      t.if((0, Wt.not)(l), () => c(l, a)), e.ok(l);
    }
    s.items = !0;
    function c(l, d) {
      t.forRange("i", d, o, (u) => {
        e.subschema({ keyword: "unevaluatedItems", dataProp: u, dataPropType: Di.Type.Num }, l), s.allErrors || t.if((0, Wt.not)(l), () => t.break());
      });
    }
  }
};
no.default = Zp;
Object.defineProperty(to, "__esModule", { value: !0 });
const xp = ro, e$ = no, t$ = [xp.default, e$.default];
to.default = t$;
var so = {}, ao = {};
Object.defineProperty(ao, "__esModule", { value: !0 });
const we = ee, r$ = {
  message: ({ schemaCode: e }) => (0, we.str)`must match format "${e}"`,
  params: ({ schemaCode: e }) => (0, we._)`{format: ${e}}`
}, n$ = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: !0,
  error: r$,
  code(e, t) {
    const { gen: r, data: n, $data: s, schema: a, schemaCode: o, it: c } = e, { opts: l, errSchemaPath: d, schemaEnv: u, self: h } = c;
    if (!l.validateFormats)
      return;
    s ? w() : $();
    function w() {
      const y = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), g = r.const("fDef", (0, we._)`${y}[${o}]`), _ = r.let("fType"), m = r.let("format");
      r.if((0, we._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(_, (0, we._)`${g}.type || "string"`).assign(m, (0, we._)`${g}.validate`), () => r.assign(_, (0, we._)`"string"`).assign(m, g)), e.fail$data((0, we.or)(E(), P()));
      function E() {
        return l.strictSchema === !1 ? we.nil : (0, we._)`${o} && !${m}`;
      }
      function P() {
        const O = u.$async ? (0, we._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, we._)`${m}(${n})`, T = (0, we._)`(typeof ${m} == "function" ? ${O} : ${m}.test(${n}))`;
        return (0, we._)`${m} && ${m} !== true && ${_} === ${t} && !${T}`;
      }
    }
    function $() {
      const y = h.formats[a];
      if (!y) {
        E();
        return;
      }
      if (y === !0)
        return;
      const [g, _, m] = P(y);
      g === t && e.pass(O());
      function E() {
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
        if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, we._)`await ${m}(${n})`;
        }
        return typeof _ == "function" ? (0, we._)`${m}(${n})` : (0, we._)`${m}.test(${n})`;
      }
    }
  }
};
ao.default = n$;
Object.defineProperty(so, "__esModule", { value: !0 });
const s$ = ao, a$ = [s$.default];
so.default = a$;
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
Object.defineProperty(va, "__esModule", { value: !0 });
const o$ = wa, i$ = ba, c$ = Da, l$ = Wa, u$ = Qa, d$ = to, f$ = so, Mi = yr, h$ = [
  l$.default,
  o$.default,
  i$.default,
  (0, c$.default)(!0),
  f$.default,
  Mi.metadataVocabulary,
  Mi.contentVocabulary,
  u$.default,
  d$.default
];
va.default = h$;
var oo = {}, as = {};
Object.defineProperty(as, "__esModule", { value: !0 });
as.DiscrError = void 0;
var Li;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(Li || (as.DiscrError = Li = {}));
Object.defineProperty(oo, "__esModule", { value: !0 });
const cr = ee, Gs = as, Vi = Fe, m$ = _r, p$ = L, $$ = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Gs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
  params: ({ params: { discrError: e, tag: t, tagName: r } }) => (0, cr._)`{error: ${e}, tag: ${r}, tagValue: ${t}}`
}, y$ = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: $$,
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
    t.if((0, cr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Gs.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const $ = w();
      t.if(!1);
      for (const y in $)
        t.elseIf((0, cr._)`${d} === ${y}`), t.assign(l, h($[y]));
      t.else(), e.error(!1, { discrError: Gs.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h($) {
      const y = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: $ }, y);
      return e.mergeEvaluated(g, cr.Name), y;
    }
    function w() {
      var $;
      const y = {}, g = m(s);
      let _ = !0;
      for (let O = 0; O < o.length; O++) {
        let T = o[O];
        if (T != null && T.$ref && !(0, p$.schemaHasRulesButRef)(T, a.self.RULES)) {
          const Y = T.$ref;
          if (T = Vi.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), T instanceof Vi.SchemaEnv && (T = T.schema), T === void 0)
            throw new m$.default(a.opts.uriResolver, a.baseId, Y);
        }
        const K = ($ = T == null ? void 0 : T.properties) === null || $ === void 0 ? void 0 : $[c];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        _ = _ && (g || m(T)), E(K, O);
      }
      if (!_)
        throw new Error(`discriminator: "${c}" must be required`);
      return y;
      function m({ required: O }) {
        return Array.isArray(O) && O.includes(c);
      }
      function E(O, T) {
        if (O.const)
          P(O.const, T);
        else if (O.enum)
          for (const K of O.enum)
            P(K, T);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function P(O, T) {
        if (typeof O != "string" || O in y)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        y[O] = T;
      }
    }
  }
};
oo.default = y$;
var io = {};
const g$ = "https://json-schema.org/draft/2020-12/schema", _$ = "https://json-schema.org/draft/2020-12/schema", v$ = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0,
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0,
  "https://json-schema.org/draft/2020-12/vocab/validation": !0,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0,
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, w$ = "meta", E$ = "Core and Validation specifications meta-schema", b$ = [
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
], S$ = [
  "object",
  "boolean"
], P$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", N$ = {
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
}, R$ = {
  $schema: g$,
  $id: _$,
  $vocabulary: v$,
  $dynamicAnchor: w$,
  title: E$,
  allOf: b$,
  type: S$,
  $comment: P$,
  properties: N$
}, O$ = "https://json-schema.org/draft/2020-12/schema", I$ = "https://json-schema.org/draft/2020-12/meta/applicator", T$ = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": !0
}, j$ = "meta", k$ = "Applicator vocabulary meta-schema", A$ = [
  "object",
  "boolean"
], C$ = {
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
}, D$ = {
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
}, M$ = {
  $schema: O$,
  $id: I$,
  $vocabulary: T$,
  $dynamicAnchor: j$,
  title: k$,
  type: A$,
  properties: C$,
  $defs: D$
}, L$ = "https://json-schema.org/draft/2020-12/schema", V$ = "https://json-schema.org/draft/2020-12/meta/unevaluated", F$ = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0
}, z$ = "meta", U$ = "Unevaluated applicator vocabulary meta-schema", q$ = [
  "object",
  "boolean"
], G$ = {
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
}, K$ = {
  $schema: L$,
  $id: V$,
  $vocabulary: F$,
  $dynamicAnchor: z$,
  title: U$,
  type: q$,
  properties: G$
}, H$ = "https://json-schema.org/draft/2020-12/schema", B$ = "https://json-schema.org/draft/2020-12/meta/content", J$ = {
  "https://json-schema.org/draft/2020-12/vocab/content": !0
}, W$ = "meta", X$ = "Content vocabulary meta-schema", Y$ = [
  "object",
  "boolean"
], Q$ = {
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
}, Z$ = {
  $schema: H$,
  $id: B$,
  $vocabulary: J$,
  $dynamicAnchor: W$,
  title: X$,
  type: Y$,
  properties: Q$
}, x$ = "https://json-schema.org/draft/2020-12/schema", ey = "https://json-schema.org/draft/2020-12/meta/core", ty = {
  "https://json-schema.org/draft/2020-12/vocab/core": !0
}, ry = "meta", ny = "Core vocabulary meta-schema", sy = [
  "object",
  "boolean"
], ay = {
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
}, oy = {
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
}, iy = {
  $schema: x$,
  $id: ey,
  $vocabulary: ty,
  $dynamicAnchor: ry,
  title: ny,
  type: sy,
  properties: ay,
  $defs: oy
}, cy = "https://json-schema.org/draft/2020-12/schema", ly = "https://json-schema.org/draft/2020-12/meta/format-annotation", uy = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0
}, dy = "meta", fy = "Format vocabulary meta-schema for annotation results", hy = [
  "object",
  "boolean"
], my = {
  format: {
    type: "string"
  }
}, py = {
  $schema: cy,
  $id: ly,
  $vocabulary: uy,
  $dynamicAnchor: dy,
  title: fy,
  type: hy,
  properties: my
}, $y = "https://json-schema.org/draft/2020-12/schema", yy = "https://json-schema.org/draft/2020-12/meta/meta-data", gy = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": !0
}, _y = "meta", vy = "Meta-data vocabulary meta-schema", wy = [
  "object",
  "boolean"
], Ey = {
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
}, by = {
  $schema: $y,
  $id: yy,
  $vocabulary: gy,
  $dynamicAnchor: _y,
  title: vy,
  type: wy,
  properties: Ey
}, Sy = "https://json-schema.org/draft/2020-12/schema", Py = "https://json-schema.org/draft/2020-12/meta/validation", Ny = {
  "https://json-schema.org/draft/2020-12/vocab/validation": !0
}, Ry = "meta", Oy = "Validation vocabulary meta-schema", Iy = [
  "object",
  "boolean"
], Ty = {
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
}, jy = {
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
}, ky = {
  $schema: Sy,
  $id: Py,
  $vocabulary: Ny,
  $dynamicAnchor: Ry,
  title: Oy,
  type: Iy,
  properties: Ty,
  $defs: jy
};
Object.defineProperty(io, "__esModule", { value: !0 });
const Ay = R$, Cy = M$, Dy = K$, My = Z$, Ly = iy, Vy = py, Fy = by, zy = ky, Uy = ["/properties"];
function qy(e) {
  return [
    Ay,
    Cy,
    Dy,
    My,
    Ly,
    t(this, Vy),
    Fy,
    t(this, zy)
  ].forEach((r) => this.addMetaSchema(r, void 0, !1)), this;
  function t(r, n) {
    return e ? r.$dataMetaSchema(n, Uy) : n;
  }
}
io.default = qy;
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
  const r = qc, n = va, s = oo, a = io, o = "https://json-schema.org/draft/2020-12/schema";
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
      const { $data: $, meta: y } = this.opts;
      y && (a.default.call(this, $), this.refs["http://json-schema.org/schema"] = o);
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
    }
  }
  t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var l = nt;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
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
  var u = xr;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
  } });
  var h = _r;
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return h.default;
  } });
})(Ms, Ms.exports);
var Gy = Ms.exports, Ks = { exports: {} }, Ul = {};
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
    "date-time": t(w(!0), $),
    "iso-time": t(l(), u),
    "iso-date-time": t(w(), y),
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
    float: { type: "number", validate: le },
    // C-type double
    double: { type: "number", validate: le },
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
    "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, y),
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
    const Q = +X[1], j = +X[2], D = +X[3];
    return j >= 1 && j <= 12 && D >= 1 && D <= (j === 2 && r(Q) ? 29 : s[j]);
  }
  function o(G, X) {
    if (G && X)
      return G > X ? 1 : G < X ? -1 : 0;
  }
  const c = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function l(G) {
    return function(Q) {
      const j = c.exec(Q);
      if (!j)
        return !1;
      const D = +j[1], U = +j[2], V = +j[3], J = j[4], z = j[5] === "-" ? -1 : 1, N = +(j[6] || 0), p = +(j[7] || 0);
      if (N > 23 || p > 59 || G && !J)
        return !1;
      if (D <= 23 && U <= 59 && V < 60)
        return !0;
      const S = U - p * z, v = D - N * z - (S < 0 ? 1 : 0);
      return (v === 23 || v === -1) && (S === 59 || S === -1) && V < 61;
    };
  }
  function d(G, X) {
    if (!(G && X))
      return;
    const Q = (/* @__PURE__ */ new Date("2020-01-01T" + G)).valueOf(), j = (/* @__PURE__ */ new Date("2020-01-01T" + X)).valueOf();
    if (Q && j)
      return Q - j;
  }
  function u(G, X) {
    if (!(G && X))
      return;
    const Q = c.exec(G), j = c.exec(X);
    if (Q && j)
      return G = Q[1] + Q[2] + Q[3], X = j[1] + j[2] + j[3], G > X ? 1 : G < X ? -1 : 0;
  }
  const h = /t|\s/i;
  function w(G) {
    const X = l(G);
    return function(j) {
      const D = j.split(h);
      return D.length === 2 && a(D[0]) && X(D[1]);
    };
  }
  function $(G, X) {
    if (!(G && X))
      return;
    const Q = new Date(G).valueOf(), j = new Date(X).valueOf();
    if (Q && j)
      return Q - j;
  }
  function y(G, X) {
    if (!(G && X))
      return;
    const [Q, j] = G.split(h), [D, U] = X.split(h), V = o(Q, D);
    if (V !== void 0)
      return V || d(j, U);
  }
  const g = /\/|:/, _ = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function m(G) {
    return g.test(G) && _.test(G);
  }
  const E = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function P(G) {
    return E.lastIndex = 0, E.test(G);
  }
  const O = -2147483648, T = 2 ** 31 - 1;
  function K(G) {
    return Number.isInteger(G) && G <= T && G >= O;
  }
  function Y(G) {
    return Number.isInteger(G);
  }
  function le() {
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
})(Ul);
var ql = {}, Hs = { exports: {} }, Gl = {}, mt = {}, Gt = {}, tn = {}, se = {}, Qr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
  }
  e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class r extends t {
    constructor(E) {
      if (super(), !e.IDENTIFIER.test(E))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = E;
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
    constructor(E) {
      super(), this._items = typeof E == "string" ? [E] : E;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return !1;
      const E = this._items[0];
      return E === "" || E === '""';
    }
    get str() {
      var E;
      return (E = this._str) !== null && E !== void 0 ? E : this._str = this._items.reduce((P, O) => `${P}${O}`, "");
    }
    get names() {
      var E;
      return (E = this._names) !== null && E !== void 0 ? E : this._names = this._items.reduce((P, O) => (O instanceof r && (P[O.str] = (P[O.str] || 0) + 1), P), {});
    }
  }
  e._Code = n, e.nil = new n("");
  function s(m, ...E) {
    const P = [m[0]];
    let O = 0;
    for (; O < E.length; )
      c(P, E[O]), P.push(m[++O]);
    return new n(P);
  }
  e._ = s;
  const a = new n("+");
  function o(m, ...E) {
    const P = [$(m[0])];
    let O = 0;
    for (; O < E.length; )
      P.push(a), c(P, E[O]), P.push(a, $(m[++O]));
    return l(P), new n(P);
  }
  e.str = o;
  function c(m, E) {
    E instanceof n ? m.push(...E._items) : E instanceof r ? m.push(E) : m.push(h(E));
  }
  e.addCodeArg = c;
  function l(m) {
    let E = 1;
    for (; E < m.length - 1; ) {
      if (m[E] === a) {
        const P = d(m[E - 1], m[E + 1]);
        if (P !== void 0) {
          m.splice(E - 1, 3, P);
          continue;
        }
        m[E++] = "+";
      }
      E++;
    }
  }
  function d(m, E) {
    if (E === '""')
      return m;
    if (m === '""')
      return E;
    if (typeof m == "string")
      return E instanceof r || m[m.length - 1] !== '"' ? void 0 : typeof E != "string" ? `${m.slice(0, -1)}${E}"` : E[0] === '"' ? m.slice(0, -1) + E.slice(1) : void 0;
    if (typeof E == "string" && E[0] === '"' && !(m instanceof r))
      return `"${m}${E.slice(1)}`;
  }
  function u(m, E) {
    return E.emptyStr() ? m : m.emptyStr() ? E : o`${m}${E}`;
  }
  e.strConcat = u;
  function h(m) {
    return typeof m == "number" || typeof m == "boolean" || m === null ? m : $(Array.isArray(m) ? m.join(",") : m);
  }
  function w(m) {
    return new n($(m));
  }
  e.stringify = w;
  function $(m) {
    return JSON.stringify(m).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  e.safeStringify = $;
  function y(m) {
    return typeof m == "string" && e.IDENTIFIER.test(m) ? new n(`.${m}`) : s`[${m}]`;
  }
  e.getProperty = y;
  function g(m) {
    if (typeof m == "string" && e.IDENTIFIER.test(m))
      return new n(`${m}`);
    throw new Error(`CodeGen: invalid export name: ${m}, use explicit $id name mapping`);
  }
  e.getEsmExportName = g;
  function _(m) {
    return new n(m.toString());
  }
  e.regexpCode = _;
})(Qr);
var Bs = {};
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
      const w = this.toName(d), { prefix: $ } = w, y = (h = u.key) !== null && h !== void 0 ? h : u.ref;
      let g = this._values[$];
      if (g) {
        const E = g.get(y);
        if (E)
          return E;
      } else
        g = this._values[$] = /* @__PURE__ */ new Map();
      g.set(y, w);
      const _ = this._scope[$] || (this._scope[$] = []), m = _.length;
      return _[m] = u.ref, w.setValue(u, { property: $, itemIndex: m }), w;
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
      return this._reduceValues(d, (w) => {
        if (w.value === void 0)
          throw new Error(`CodeGen: name "${w}" has no value`);
        return w.value.code;
      }, u, h);
    }
    _reduceValues(d, u, h = {}, w) {
      let $ = t.nil;
      for (const y in d) {
        const g = d[y];
        if (!g)
          continue;
        const _ = h[y] = h[y] || /* @__PURE__ */ new Map();
        g.forEach((m) => {
          if (_.has(m))
            return;
          _.set(m, n.Started);
          let E = u(m);
          if (E) {
            const P = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
            $ = (0, t._)`${$}${P} ${m} = ${E};${this.opts._n}`;
          } else if (E = w == null ? void 0 : w(m))
            $ = (0, t._)`${$}${E}${this.opts._n}`;
          else
            throw new r(m);
          _.set(m, n.Completed);
        });
      }
      return $;
    }
  }
  e.ValueScope = c;
})(Bs);
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
  const t = Qr, r = Bs;
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
      return Q(i, this.rhs);
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
  class w extends a {
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
  class y extends $ {
    render(i) {
      return "{" + i._n + super.render(i) + "}" + i._n;
    }
  }
  class g extends $ {
  }
  class _ extends y {
  }
  _.kind = "else";
  class m extends y {
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
        f = this.else = Array.isArray(b) ? new _(b) : b;
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
      return Q(i, this.condition), this.else && X(i, this.else.names), i;
    }
  }
  m.kind = "if";
  class E extends y {
  }
  E.kind = "for";
  class P extends E {
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
  class O extends E {
    constructor(i, f, b, k) {
      super(), this.varKind = i, this.name = f, this.from = b, this.to = k;
    }
    render(i) {
      const f = i.es5 ? r.varKinds.var : this.varKind, { name: b, from: k, to: A } = this;
      return `for(${f} ${b}=${k}; ${b}<${A}; ${b}++)` + super.render(i);
    }
    get names() {
      const i = Q(super.names, this.from);
      return Q(i, this.to);
    }
  }
  class T extends E {
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
  class K extends y {
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
  class le extends y {
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
  class he extends y {
    constructor(i) {
      super(), this.error = i;
    }
    render(i) {
      return `catch(${this.error})` + super.render(i);
    }
  }
  he.kind = "catch";
  class ge extends y {
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
      return typeof i == "function" ? i() : i !== t.nil && this._leafNode(new w(i)), this;
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
      return this._elseNode(new _());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(m, _);
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
      return this._endBlockNode(E);
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
      const k = new le();
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
  function X(v, i) {
    for (const f in i)
      v[f] = (v[f] || 0) + (i[f] || 0);
    return v;
  }
  function Q(v, i) {
    return i instanceof t._CodeOrName ? X(v, i.names) : v;
  }
  function j(v, i, f) {
    if (v instanceof t.Name)
      return b(v);
    if (!k(v))
      return v;
    return new t._Code(v._items.reduce((A, H) => (H instanceof t.Name && (H = b(H)), H instanceof t._Code ? A.push(...H._items) : A.push(H), A), []));
    function b(A) {
      const H = f[A.str];
      return H === void 0 || i[A.str] !== 1 ? A : (delete i[A.str], H);
    }
    function k(A) {
      return A instanceof t._Code && A._items.some((H) => H instanceof t.Name && i[H.str] === 1 && f[H.str] !== void 0);
    }
  }
  function D(v, i) {
    for (const f in i)
      v[f] = (v[f] || 0) - (i[f] || 0);
  }
  function U(v) {
    return typeof v == "boolean" || typeof v == "number" || v === null ? !v : (0, t._)`!${S(v)}`;
  }
  e.not = U;
  const V = p(e.operators.AND);
  function J(...v) {
    return v.reduce(V);
  }
  e.and = J;
  const z = p(e.operators.OR);
  function N(...v) {
    return v.reduce(z);
  }
  e.or = N;
  function p(v) {
    return (i, f) => i === t.nil ? f : f === t.nil ? i : (0, t._)`${S(i)} ${v} ${S(f)}`;
  }
  function S(v) {
    return v instanceof t.Name ? v : (0, t._)`(${v})`;
  }
})(se);
var F = {};
Object.defineProperty(F, "__esModule", { value: !0 });
F.checkStrictMode = F.getErrorPath = F.Type = F.useFunc = F.setEvaluated = F.evaluatedPropsToName = F.mergeEvaluated = F.eachItem = F.unescapeJsonPointer = F.escapeJsonPointer = F.escapeFragment = F.unescapeFragment = F.schemaRefOrVal = F.schemaHasRulesButRef = F.schemaHasRules = F.checkUnknownRules = F.alwaysValidSchema = F.toHash = void 0;
const fe = se, Ky = Qr;
function Hy(e) {
  const t = {};
  for (const r of e)
    t[r] = !0;
  return t;
}
F.toHash = Hy;
function By(e, t) {
  return typeof t == "boolean" ? t : Object.keys(t).length === 0 ? !0 : (Kl(e, t), !Hl(t, e.self.RULES.all));
}
F.alwaysValidSchema = By;
function Kl(e, t = e.schema) {
  const { opts: r, self: n } = e;
  if (!r.strictSchema || typeof t == "boolean")
    return;
  const s = n.RULES.keywords;
  for (const a in t)
    s[a] || Wl(e, `unknown keyword: "${a}"`);
}
F.checkUnknownRules = Kl;
function Hl(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (t[r])
      return !0;
  return !1;
}
F.schemaHasRules = Hl;
function Jy(e, t) {
  if (typeof e == "boolean")
    return !e;
  for (const r in e)
    if (r !== "$ref" && t.all[r])
      return !0;
  return !1;
}
F.schemaHasRulesButRef = Jy;
function Wy({ topSchemaRef: e, schemaPath: t }, r, n, s) {
  if (!s) {
    if (typeof r == "number" || typeof r == "boolean")
      return r;
    if (typeof r == "string")
      return (0, fe._)`${r}`;
  }
  return (0, fe._)`${e}${t}${(0, fe.getProperty)(n)}`;
}
F.schemaRefOrVal = Wy;
function Xy(e) {
  return Bl(decodeURIComponent(e));
}
F.unescapeFragment = Xy;
function Yy(e) {
  return encodeURIComponent(co(e));
}
F.escapeFragment = Yy;
function co(e) {
  return typeof e == "number" ? `${e}` : e.replace(/~/g, "~0").replace(/\//g, "~1");
}
F.escapeJsonPointer = co;
function Bl(e) {
  return e.replace(/~1/g, "/").replace(/~0/g, "~");
}
F.unescapeJsonPointer = Bl;
function Qy(e, t) {
  if (Array.isArray(e))
    for (const r of e)
      t(r);
  else
    t(e);
}
F.eachItem = Qy;
function Fi({ mergeNames: e, mergeToName: t, mergeValues: r, resultToName: n }) {
  return (s, a, o, c) => {
    const l = o === void 0 ? a : o instanceof fe.Name ? (a instanceof fe.Name ? e(s, a, o) : t(s, a, o), o) : a instanceof fe.Name ? (t(s, o, a), a) : r(a, o);
    return c === fe.Name && !(l instanceof fe.Name) ? n(s, l) : l;
  };
}
F.mergeEvaluated = {
  props: Fi({
    mergeNames: (e, t, r) => e.if((0, fe._)`${r} !== true && ${t} !== undefined`, () => {
      e.if((0, fe._)`${t} === true`, () => e.assign(r, !0), () => e.assign(r, (0, fe._)`${r} || {}`).code((0, fe._)`Object.assign(${r}, ${t})`));
    }),
    mergeToName: (e, t, r) => e.if((0, fe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, fe._)`${r} || {}`), lo(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Jl
  }),
  items: Fi({
    mergeNames: (e, t, r) => e.if((0, fe._)`${r} !== true && ${t} !== undefined`, () => e.assign(r, (0, fe._)`${t} === true ? true : ${r} > ${t} ? ${r} : ${t}`)),
    mergeToName: (e, t, r) => e.if((0, fe._)`${r} !== true`, () => e.assign(r, t === !0 ? !0 : (0, fe._)`${r} > ${t} ? ${r} : ${t}`)),
    mergeValues: (e, t) => e === !0 ? !0 : Math.max(e, t),
    resultToName: (e, t) => e.var("items", t)
  })
};
function Jl(e, t) {
  if (t === !0)
    return e.var("props", !0);
  const r = e.var("props", (0, fe._)`{}`);
  return t !== void 0 && lo(e, r, t), r;
}
F.evaluatedPropsToName = Jl;
function lo(e, t, r) {
  Object.keys(r).forEach((n) => e.assign((0, fe._)`${t}${(0, fe.getProperty)(n)}`, !0));
}
F.setEvaluated = lo;
const zi = {};
function Zy(e, t) {
  return e.scopeValue("func", {
    ref: t,
    code: zi[t.code] || (zi[t.code] = new Ky._Code(t.code))
  });
}
F.useFunc = Zy;
var Js;
(function(e) {
  e[e.Num = 0] = "Num", e[e.Str = 1] = "Str";
})(Js || (F.Type = Js = {}));
function xy(e, t, r) {
  if (e instanceof fe.Name) {
    const n = t === Js.Num;
    return r ? n ? (0, fe._)`"[" + ${e} + "]"` : (0, fe._)`"['" + ${e} + "']"` : n ? (0, fe._)`"/" + ${e}` : (0, fe._)`"/" + ${e}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return r ? (0, fe.getProperty)(e).toString() : "/" + co(e);
}
F.getErrorPath = xy;
function Wl(e, t, r = e.opts.strictSchema) {
  if (r) {
    if (t = `strict mode: ${t}`, r === !0)
      throw new Error(t);
    e.self.logger.warn(t);
  }
}
F.checkStrictMode = Wl;
var dn = {}, Ui;
function Vt() {
  if (Ui) return dn;
  Ui = 1, Object.defineProperty(dn, "__esModule", { value: !0 });
  const e = se, t = {
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
  return dn.default = t, dn;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
  const t = se, r = F, n = Vt();
  e.keywordError = {
    message: ({ keyword: _ }) => (0, t.str)`must pass "${_}" keyword validation`
  }, e.keyword$DataError = {
    message: ({ keyword: _, schemaType: m }) => m ? (0, t.str)`"${_}" keyword must be ${m} ($data)` : (0, t.str)`"${_}" keyword is invalid ($data)`
  };
  function s(_, m = e.keywordError, E, P) {
    const { it: O } = _, { gen: T, compositeRule: K, allErrors: Y } = O, le = h(_, m, E);
    P ?? (K || Y) ? l(T, le) : d(O, (0, t._)`[${le}]`);
  }
  e.reportError = s;
  function a(_, m = e.keywordError, E) {
    const { it: P } = _, { gen: O, compositeRule: T, allErrors: K } = P, Y = h(_, m, E);
    l(O, Y), T || K || d(P, n.default.vErrors);
  }
  e.reportExtraError = a;
  function o(_, m) {
    _.assign(n.default.errors, m), _.if((0, t._)`${n.default.vErrors} !== null`, () => _.if(m, () => _.assign((0, t._)`${n.default.vErrors}.length`, m), () => _.assign(n.default.vErrors, null)));
  }
  e.resetErrorsCount = o;
  function c({ gen: _, keyword: m, schemaValue: E, data: P, errsCount: O, it: T }) {
    if (O === void 0)
      throw new Error("ajv implementation error");
    const K = _.name("err");
    _.forRange("i", O, n.default.errors, (Y) => {
      _.const(K, (0, t._)`${n.default.vErrors}[${Y}]`), _.if((0, t._)`${K}.instancePath === undefined`, () => _.assign((0, t._)`${K}.instancePath`, (0, t.strConcat)(n.default.instancePath, T.errorPath))), _.assign((0, t._)`${K}.schemaPath`, (0, t.str)`${T.errSchemaPath}/${m}`), T.opts.verbose && (_.assign((0, t._)`${K}.schema`, E), _.assign((0, t._)`${K}.data`, P));
    });
  }
  e.extendErrors = c;
  function l(_, m) {
    const E = _.const("err", m);
    _.if((0, t._)`${n.default.vErrors} === null`, () => _.assign(n.default.vErrors, (0, t._)`[${E}]`), (0, t._)`${n.default.vErrors}.push(${E})`), _.code((0, t._)`${n.default.errors}++`);
  }
  function d(_, m) {
    const { gen: E, validateName: P, schemaEnv: O } = _;
    O.$async ? E.throw((0, t._)`new ${_.ValidationError}(${m})`) : (E.assign((0, t._)`${P}.errors`, m), E.return(!1));
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
  function h(_, m, E) {
    const { createErrors: P } = _.it;
    return P === !1 ? (0, t._)`{}` : w(_, m, E);
  }
  function w(_, m, E = {}) {
    const { gen: P, it: O } = _, T = [
      $(O, E),
      y(_, E)
    ];
    return g(_, m, T), P.object(...T);
  }
  function $({ errorPath: _ }, { instancePath: m }) {
    const E = m ? (0, t.str)`${_}${(0, r.getErrorPath)(m, r.Type.Str)}` : _;
    return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, E)];
  }
  function y({ keyword: _, it: { errSchemaPath: m } }, { schemaPath: E, parentSchema: P }) {
    let O = P ? m : (0, t.str)`${m}/${_}`;
    return E && (O = (0, t.str)`${O}${(0, r.getErrorPath)(E, r.Type.Str)}`), [u.schemaPath, O];
  }
  function g(_, { params: m, message: E }, P) {
    const { keyword: O, data: T, schemaValue: K, it: Y } = _, { opts: le, propertyName: he, topSchemaRef: ge, schemaPath: G } = Y;
    P.push([u.keyword, O], [u.params, typeof m == "function" ? m(_) : m || (0, t._)`{}`]), le.messages && P.push([u.message, typeof E == "function" ? E(_) : E]), le.verbose && P.push([u.schema, K], [u.parentSchema, (0, t._)`${ge}${G}`], [n.default.data, T]), he && P.push([u.propertyName, he]);
  }
})(tn);
var qi;
function e0() {
  if (qi) return Gt;
  qi = 1, Object.defineProperty(Gt, "__esModule", { value: !0 }), Gt.boolOrEmptySchema = Gt.topBoolOrEmptySchema = void 0;
  const e = tn, t = se, r = Vt(), n = {
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
const t0 = ["string", "number", "integer", "boolean", "null", "object", "array"], r0 = new Set(t0);
function n0(e) {
  return typeof e == "string" && r0.has(e);
}
er.isJSONType = n0;
function s0() {
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
er.getRules = s0;
var pt = {}, Gi;
function Xl() {
  if (Gi) return pt;
  Gi = 1, Object.defineProperty(pt, "__esModule", { value: !0 }), pt.shouldUseRule = pt.shouldUseGroup = pt.schemaHasRulesForType = void 0;
  function e({ schema: n, self: s }, a) {
    const o = s.RULES.types[a];
    return o && o !== !0 && t(n, o);
  }
  pt.schemaHasRulesForType = e;
  function t(n, s) {
    return s.rules.some((a) => r(n, a));
  }
  pt.shouldUseGroup = t;
  function r(n, s) {
    var a;
    return n[s.keyword] !== void 0 || ((a = s.definition.implements) === null || a === void 0 ? void 0 : a.some((o) => n[o] !== void 0));
  }
  return pt.shouldUseRule = r, pt;
}
Object.defineProperty(Se, "__esModule", { value: !0 });
Se.reportTypeError = Se.checkDataTypes = Se.checkDataType = Se.coerceAndCheckDataType = Se.getJSONTypes = Se.getSchemaTypes = Se.DataType = void 0;
const a0 = er, o0 = Xl(), i0 = tn, re = se, Yl = F;
var hr;
(function(e) {
  e[e.Correct = 0] = "Correct", e[e.Wrong = 1] = "Wrong";
})(hr || (Se.DataType = hr = {}));
function c0(e) {
  const t = Ql(e.type);
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
Se.getSchemaTypes = c0;
function Ql(e) {
  const t = Array.isArray(e) ? e : e ? [e] : [];
  if (t.every(a0.isJSONType))
    return t;
  throw new Error("type must be JSONType or JSONType[]: " + t.join(","));
}
Se.getJSONTypes = Ql;
function l0(e, t) {
  const { gen: r, data: n, opts: s } = e, a = u0(t, s.coerceTypes), o = t.length > 0 && !(a.length === 0 && t.length === 1 && (0, o0.schemaHasRulesForType)(e, t[0]));
  if (o) {
    const c = uo(t, n, s.strictNumbers, hr.Wrong);
    r.if(c, () => {
      a.length ? d0(e, t, a) : fo(e);
    });
  }
  return o;
}
Se.coerceAndCheckDataType = l0;
const Zl = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function u0(e, t) {
  return t ? e.filter((r) => Zl.has(r) || t === "array" && r === "array") : [];
}
function d0(e, t, r) {
  const { gen: n, data: s, opts: a } = e, o = n.let("dataType", (0, re._)`typeof ${s}`), c = n.let("coerced", (0, re._)`undefined`);
  a.coerceTypes === "array" && n.if((0, re._)`${o} == 'object' && Array.isArray(${s}) && ${s}.length == 1`, () => n.assign(s, (0, re._)`${s}[0]`).assign(o, (0, re._)`typeof ${s}`).if(uo(t, s, a.strictNumbers), () => n.assign(c, s))), n.if((0, re._)`${c} !== undefined`);
  for (const d of r)
    (Zl.has(d) || d === "array" && a.coerceTypes === "array") && l(d);
  n.else(), fo(e), n.endIf(), n.if((0, re._)`${c} !== undefined`, () => {
    n.assign(s, c), f0(e, c);
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
function f0({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, re._)`${t} !== undefined`, () => e.assign((0, re._)`${t}[${r}]`, n));
}
function Ws(e, t, r, n = hr.Correct) {
  const s = n === hr.Correct ? re.operators.EQ : re.operators.NEQ;
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
  return n === hr.Correct ? a : (0, re.not)(a);
  function o(c = re.nil) {
    return (0, re.and)((0, re._)`typeof ${t} == "number"`, c, r ? (0, re._)`isFinite(${t})` : re.nil);
  }
}
Se.checkDataType = Ws;
function uo(e, t, r, n) {
  if (e.length === 1)
    return Ws(e[0], t, r, n);
  let s;
  const a = (0, Yl.toHash)(e);
  if (a.array && a.object) {
    const o = (0, re._)`typeof ${t} != "object"`;
    s = a.null ? o : (0, re._)`!${t} || ${o}`, delete a.null, delete a.array, delete a.object;
  } else
    s = re.nil;
  a.number && delete a.integer;
  for (const o in a)
    s = (0, re.and)(s, Ws(o, t, r, n));
  return s;
}
Se.checkDataTypes = uo;
const h0 = {
  message: ({ schema: e }) => `must be ${e}`,
  params: ({ schema: e, schemaValue: t }) => typeof e == "string" ? (0, re._)`{type: ${e}}` : (0, re._)`{type: ${t}}`
};
function fo(e) {
  const t = m0(e);
  (0, i0.reportError)(t, h0);
}
Se.reportTypeError = fo;
function m0(e) {
  const { gen: t, data: r, schema: n } = e, s = (0, Yl.schemaRefOrVal)(e, n, "type");
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
var Dr = {}, Ki;
function p0() {
  if (Ki) return Dr;
  Ki = 1, Object.defineProperty(Dr, "__esModule", { value: !0 }), Dr.assignDefaults = void 0;
  const e = se, t = F;
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
    let w = (0, e._)`${h} === undefined`;
    u.useDefaults === "empty" && (w = (0, e._)`${w} || ${h} === null || ${h} === ""`), c.if(w, (0, e._)`${h} = ${(0, e.stringify)(o)}`);
  }
  return Dr;
}
var Qe = {}, ie = {};
Object.defineProperty(ie, "__esModule", { value: !0 });
ie.validateUnion = ie.validateArray = ie.usePattern = ie.callValidateCode = ie.schemaProperties = ie.allSchemaProperties = ie.noPropertyInData = ie.propertyInData = ie.isOwnProperty = ie.hasPropFunc = ie.reportMissingProp = ie.checkMissingProp = ie.checkReportMissingProp = void 0;
const pe = se, ho = F, It = Vt(), $0 = F;
function y0(e, t) {
  const { gen: r, data: n, it: s } = e;
  r.if(po(r, n, t, s.opts.ownProperties), () => {
    e.setParams({ missingProperty: (0, pe._)`${t}` }, !0), e.error();
  });
}
ie.checkReportMissingProp = y0;
function g0({ gen: e, data: t, it: { opts: r } }, n, s) {
  return (0, pe.or)(...n.map((a) => (0, pe.and)(po(e, t, a, r.ownProperties), (0, pe._)`${s} = ${a}`)));
}
ie.checkMissingProp = g0;
function _0(e, t) {
  e.setParams({ missingProperty: t }, !0), e.error();
}
ie.reportMissingProp = _0;
function xl(e) {
  return e.scopeValue("func", {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, pe._)`Object.prototype.hasOwnProperty`
  });
}
ie.hasPropFunc = xl;
function mo(e, t, r) {
  return (0, pe._)`${xl(e)}.call(${t}, ${r})`;
}
ie.isOwnProperty = mo;
function v0(e, t, r, n) {
  const s = (0, pe._)`${t}${(0, pe.getProperty)(r)} !== undefined`;
  return n ? (0, pe._)`${s} && ${mo(e, t, r)}` : s;
}
ie.propertyInData = v0;
function po(e, t, r, n) {
  const s = (0, pe._)`${t}${(0, pe.getProperty)(r)} === undefined`;
  return n ? (0, pe.or)(s, (0, pe.not)(mo(e, t, r))) : s;
}
ie.noPropertyInData = po;
function eu(e) {
  return e ? Object.keys(e).filter((t) => t !== "__proto__") : [];
}
ie.allSchemaProperties = eu;
function w0(e, t) {
  return eu(t).filter((r) => !(0, ho.alwaysValidSchema)(e, t[r]));
}
ie.schemaProperties = w0;
function E0({ schemaCode: e, data: t, it: { gen: r, topSchemaRef: n, schemaPath: s, errorPath: a }, it: o }, c, l, d) {
  const u = d ? (0, pe._)`${e}, ${t}, ${n}${s}` : t, h = [
    [It.default.instancePath, (0, pe.strConcat)(It.default.instancePath, a)],
    [It.default.parentData, o.parentData],
    [It.default.parentDataProperty, o.parentDataProperty],
    [It.default.rootData, It.default.rootData]
  ];
  o.opts.dynamicRef && h.push([It.default.dynamicAnchors, It.default.dynamicAnchors]);
  const w = (0, pe._)`${u}, ${r.object(...h)}`;
  return l !== pe.nil ? (0, pe._)`${c}.call(${l}, ${w})` : (0, pe._)`${c}(${w})`;
}
ie.callValidateCode = E0;
const b0 = (0, pe._)`new RegExp`;
function S0({ gen: e, it: { opts: t } }, r) {
  const n = t.unicodeRegExp ? "u" : "", { regExp: s } = t.code, a = s(r, n);
  return e.scopeValue("pattern", {
    key: a.toString(),
    ref: a,
    code: (0, pe._)`${s.code === "new RegExp" ? b0 : (0, $0.useFunc)(e, s)}(${r}, ${n})`
  });
}
ie.usePattern = S0;
function P0(e) {
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
        dataPropType: ho.Type.Num
      }, a), t.if((0, pe.not)(a), c);
    });
  }
}
ie.validateArray = P0;
function N0(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
    throw new Error("ajv implementation error");
  if (r.some((l) => (0, ho.alwaysValidSchema)(s, l)) && !s.opts.unevaluated)
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
ie.validateUnion = N0;
var Hi;
function R0() {
  if (Hi) return Qe;
  Hi = 1, Object.defineProperty(Qe, "__esModule", { value: !0 }), Qe.validateKeywordUsage = Qe.validSchemaType = Qe.funcKeywordCode = Qe.macroKeywordCode = void 0;
  const e = se, t = Vt(), r = ie, n = tn;
  function s(w, $) {
    const { gen: y, keyword: g, schema: _, parentSchema: m, it: E } = w, P = $.macro.call(E.self, _, m, E), O = d(y, g, P);
    E.opts.validateSchema !== !1 && E.self.validateSchema(P, !0);
    const T = y.name("valid");
    w.subschema({
      schema: P,
      schemaPath: e.nil,
      errSchemaPath: `${E.errSchemaPath}/${g}`,
      topSchemaRef: O,
      compositeRule: !0
    }, T), w.pass(T, () => w.error(!0));
  }
  Qe.macroKeywordCode = s;
  function a(w, $) {
    var y;
    const { gen: g, keyword: _, schema: m, parentSchema: E, $data: P, it: O } = w;
    l(O, $);
    const T = !P && $.compile ? $.compile.call(O.self, m, E, O) : $.validate, K = d(g, _, T), Y = g.let("valid");
    w.block$data(Y, le), w.ok((y = $.valid) !== null && y !== void 0 ? y : Y);
    function le() {
      if ($.errors === !1)
        G(), $.modifying && o(w), X(() => w.error());
      else {
        const Q = $.async ? he() : ge();
        $.modifying && o(w), X(() => c(w, Q));
      }
    }
    function he() {
      const Q = g.let("ruleErrs", null);
      return g.try(() => G((0, e._)`await `), (j) => g.assign(Y, !1).if((0, e._)`${j} instanceof ${O.ValidationError}`, () => g.assign(Q, (0, e._)`${j}.errors`), () => g.throw(j))), Q;
    }
    function ge() {
      const Q = (0, e._)`${K}.errors`;
      return g.assign(Q, null), G(e.nil), Q;
    }
    function G(Q = $.async ? (0, e._)`await ` : e.nil) {
      const j = O.opts.passContext ? t.default.this : t.default.self, D = !("compile" in $ && !P || $.schema === !1);
      g.assign(Y, (0, e._)`${Q}${(0, r.callValidateCode)(w, K, j, D)}`, $.modifying);
    }
    function X(Q) {
      var j;
      g.if((0, e.not)((j = $.valid) !== null && j !== void 0 ? j : Y), Q);
    }
  }
  Qe.funcKeywordCode = a;
  function o(w) {
    const { gen: $, data: y, it: g } = w;
    $.if(g.parentData, () => $.assign(y, (0, e._)`${g.parentData}[${g.parentDataProperty}]`));
  }
  function c(w, $) {
    const { gen: y } = w;
    y.if((0, e._)`Array.isArray(${$})`, () => {
      y.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${$} : ${t.default.vErrors}.concat(${$})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(w);
    }, () => w.error());
  }
  function l({ schemaEnv: w }, $) {
    if ($.async && !w.$async)
      throw new Error("async keyword in sync schema");
  }
  function d(w, $, y) {
    if (y === void 0)
      throw new Error(`keyword "${$}" failed to compile`);
    return w.scopeValue("keyword", typeof y == "function" ? { ref: y } : { ref: y, code: (0, e.stringify)(y) });
  }
  function u(w, $, y = !1) {
    return !$.length || $.some((g) => g === "array" ? Array.isArray(w) : g === "object" ? w && typeof w == "object" && !Array.isArray(w) : typeof w == g || y && typeof w > "u");
  }
  Qe.validSchemaType = u;
  function h({ schema: w, opts: $, self: y, errSchemaPath: g }, _, m) {
    if (Array.isArray(_.keyword) ? !_.keyword.includes(m) : _.keyword !== m)
      throw new Error("ajv implementation error");
    const E = _.dependencies;
    if (E != null && E.some((P) => !Object.prototype.hasOwnProperty.call(w, P)))
      throw new Error(`parent schema must have dependencies of ${m}: ${E.join(",")}`);
    if (_.validateSchema && !_.validateSchema(w[m])) {
      const O = `keyword "${m}" value is invalid at path "${g}": ` + y.errorsText(_.validateSchema.errors);
      if ($.validateSchema === "log")
        y.logger.error(O);
      else
        throw new Error(O);
    }
  }
  return Qe.validateKeywordUsage = h, Qe;
}
var $t = {}, Bi;
function O0() {
  if (Bi) return $t;
  Bi = 1, Object.defineProperty($t, "__esModule", { value: !0 }), $t.extendSubschemaMode = $t.extendSubschemaData = $t.getSubschema = void 0;
  const e = se, t = F;
  function r(a, { keyword: o, schemaProp: c, schema: l, schemaPath: d, errSchemaPath: u, topSchemaRef: h }) {
    if (o !== void 0 && l !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (o !== void 0) {
      const w = a.schema[o];
      return c === void 0 ? {
        schema: w,
        schemaPath: (0, e._)`${a.schemaPath}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${a.errSchemaPath}/${o}`
      } : {
        schema: w[c],
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
    const { gen: w } = o;
    if (c !== void 0) {
      const { errorPath: y, dataPathArr: g, opts: _ } = o, m = w.let("data", (0, e._)`${o.data}${(0, e.getProperty)(c)}`, !0);
      $(m), a.errorPath = (0, e.str)`${y}${(0, t.getErrorPath)(c, l, _.jsPropertySyntax)}`, a.parentDataProperty = (0, e._)`${c}`, a.dataPathArr = [...g, a.parentDataProperty];
    }
    if (d !== void 0) {
      const y = d instanceof e.Name ? d : w.let("data", d, !0);
      $(y), h !== void 0 && (a.propertyName = h);
    }
    u && (a.dataTypes = u);
    function $(y) {
      a.data = y, a.dataLevel = o.dataLevel + 1, a.dataTypes = [], o.definedProperties = /* @__PURE__ */ new Set(), a.parentData = o.data, a.dataNames = [...o.dataNames, y];
    }
  }
  $t.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: o, jtdMetadata: c, compositeRule: l, createErrors: d, allErrors: u }) {
    l !== void 0 && (a.compositeRule = l), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = o, a.jtdMetadata = c;
  }
  return $t.extendSubschemaMode = s, $t;
}
var je = {}, tu = { exports: {} }, Dt = tu.exports = function(e, t, r) {
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
          for (var w = 0; w < h.length; w++)
            jn(e, t, r, h[w], s + "/" + u + "/" + w, a, s, u, n, w);
      } else if (u in Dt.propsKeywords) {
        if (h && typeof h == "object")
          for (var $ in h)
            jn(e, t, r, h[$], s + "/" + u + "/" + I0($), a, s, u, n, $);
      } else (u in Dt.keywords || e.allKeys && !(u in Dt.skipKeywords)) && jn(e, t, r, h, s + "/" + u, a, s, u, n);
    }
    r(n, s, a, o, c, l, d);
  }
}
function I0(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var T0 = tu.exports;
Object.defineProperty(je, "__esModule", { value: !0 });
je.getSchemaRefs = je.resolveUrl = je.normalizeId = je._getFullPath = je.getFullPath = je.inlineRef = void 0;
const j0 = F, k0 = xn, A0 = T0, C0 = /* @__PURE__ */ new Set([
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
function D0(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Xs(e) : t ? ru(e) <= t : !1;
}
je.inlineRef = D0;
const M0 = /* @__PURE__ */ new Set([
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
function Xs(e) {
  for (const t in e) {
    if (M0.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Xs) || typeof r == "object" && Xs(r))
      return !0;
  }
  return !1;
}
function ru(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !C0.has(r) && (typeof e[r] == "object" && (0, j0.eachItem)(e[r], (n) => t += ru(n)), t === 1 / 0))
      return 1 / 0;
  }
  return t;
}
function nu(e, t = "", r) {
  r !== !1 && (t = mr(t));
  const n = e.parse(t);
  return su(e, n);
}
je.getFullPath = nu;
function su(e, t) {
  return e.serialize(t).split("#")[0] + "#";
}
je._getFullPath = su;
const L0 = /#\/?$/;
function mr(e) {
  return e ? e.replace(L0, "") : "";
}
je.normalizeId = mr;
function V0(e, t, r) {
  return r = mr(r), e.resolve(t, r);
}
je.resolveUrl = V0;
const F0 = /^[a-z_][-a-z0-9._]*$/i;
function z0(e, t) {
  if (typeof e == "boolean")
    return {};
  const { schemaId: r, uriResolver: n } = this.opts, s = mr(e[r] || t), a = { "": s }, o = nu(n, s, !1), c = {}, l = /* @__PURE__ */ new Set();
  return A0(e, { allKeys: !0 }, (h, w, $, y) => {
    if (y === void 0)
      return;
    const g = o + w;
    let _ = a[y];
    typeof h[r] == "string" && (_ = m.call(this, h[r])), E.call(this, h.$anchor), E.call(this, h.$dynamicAnchor), a[w] = _;
    function m(P) {
      const O = this.opts.uriResolver.resolve;
      if (P = mr(_ ? O(_, P) : P), l.has(P))
        throw u(P);
      l.add(P);
      let T = this.refs[P];
      return typeof T == "string" && (T = this.refs[T]), typeof T == "object" ? d(h, T.schema, P) : P !== mr(g) && (P[0] === "#" ? (d(h, c[P], P), c[P] = h) : this.refs[P] = g), P;
    }
    function E(P) {
      if (typeof P == "string") {
        if (!F0.test(P))
          throw new Error(`invalid anchor "${P}"`);
        m.call(this, `#${P}`);
      }
    }
  }), c;
  function d(h, w, $) {
    if (w !== void 0 && !k0(h, w))
      throw u($);
  }
  function u(h) {
    return new Error(`reference "${h}" resolves to more than one schema`);
  }
}
je.getSchemaRefs = z0;
var Ji;
function os() {
  if (Ji) return mt;
  Ji = 1, Object.defineProperty(mt, "__esModule", { value: !0 }), mt.getData = mt.KeywordCxt = mt.validateFunctionCode = void 0;
  const e = e0(), t = Se, r = Xl(), n = Se, s = p0(), a = R0(), o = O0(), c = se, l = Vt(), d = je, u = F, h = tn;
  function w(R) {
    if (T(R) && (Y(R), O(R))) {
      _(R);
      return;
    }
    $(R, () => (0, e.topBoolOrEmptySchema)(R));
  }
  mt.validateFunctionCode = w;
  function $({ gen: R, validateName: I, schema: C, schemaEnv: M, opts: B }, x) {
    B.code.es5 ? R.func(I, (0, c._)`${l.default.data}, ${l.default.valCxt}`, M.$async, () => {
      R.code((0, c._)`"use strict"; ${E(C, B)}`), g(R, B), R.code(x);
    }) : R.func(I, (0, c._)`${l.default.data}, ${y(B)}`, M.$async, () => R.code(E(C, B)).code(x));
  }
  function y(R) {
    return (0, c._)`{${l.default.instancePath}="", ${l.default.parentData}, ${l.default.parentDataProperty}, ${l.default.rootData}=${l.default.data}${R.dynamicRef ? (0, c._)`, ${l.default.dynamicAnchors}={}` : c.nil}}={}`;
  }
  function g(R, I) {
    R.if(l.default.valCxt, () => {
      R.var(l.default.instancePath, (0, c._)`${l.default.valCxt}.${l.default.instancePath}`), R.var(l.default.parentData, (0, c._)`${l.default.valCxt}.${l.default.parentData}`), R.var(l.default.parentDataProperty, (0, c._)`${l.default.valCxt}.${l.default.parentDataProperty}`), R.var(l.default.rootData, (0, c._)`${l.default.valCxt}.${l.default.rootData}`), I.dynamicRef && R.var(l.default.dynamicAnchors, (0, c._)`${l.default.valCxt}.${l.default.dynamicAnchors}`);
    }, () => {
      R.var(l.default.instancePath, (0, c._)`""`), R.var(l.default.parentData, (0, c._)`undefined`), R.var(l.default.parentDataProperty, (0, c._)`undefined`), R.var(l.default.rootData, l.default.data), I.dynamicRef && R.var(l.default.dynamicAnchors, (0, c._)`{}`);
    });
  }
  function _(R) {
    const { schema: I, opts: C, gen: M } = R;
    $(R, () => {
      C.$comment && I.$comment && Q(R), ge(R), M.let(l.default.vErrors, null), M.let(l.default.errors, 0), C.unevaluated && m(R), le(R), j(R);
    });
  }
  function m(R) {
    const { gen: I, validateName: C } = R;
    R.evaluated = I.const("evaluated", (0, c._)`${C}.evaluated`), I.if((0, c._)`${R.evaluated}.dynamicProps`, () => I.assign((0, c._)`${R.evaluated}.props`, (0, c._)`undefined`)), I.if((0, c._)`${R.evaluated}.dynamicItems`, () => I.assign((0, c._)`${R.evaluated}.items`, (0, c._)`undefined`));
  }
  function E(R, I) {
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
    B.$comment && C.$comment && Q(R), G(R), X(R);
    const x = M.const("_errs", l.default.errors);
    le(R, x), M.var(I, (0, c._)`${x} === ${l.default.errors}`);
  }
  function Y(R) {
    (0, u.checkUnknownRules)(R), he(R);
  }
  function le(R, I) {
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
  function Q({ gen: R, schemaEnv: I, schema: C, errSchemaPath: M, opts: B }) {
    const x = C.$comment;
    if (B.$comment === !0)
      R.code((0, c._)`${l.default.self}.logger.log(${x})`);
    else if (typeof B.$comment == "function") {
      const _e = (0, c.str)`${M}/$comment`, Le = R.scopeValue("root", { ref: I.root });
      R.code((0, c._)`${l.default.self}.opts.$comment(${x}, ${_e}, ${Le}.schema)`);
    }
  }
  function j(R) {
    const { gen: I, schemaEnv: C, validateName: M, ValidationError: B, opts: x } = R;
    C.$async ? I.if((0, c._)`${l.default.errors} === 0`, () => I.return(l.default.data), () => I.throw((0, c._)`new ${B}(${l.default.vErrors})`)) : (I.assign((0, c._)`${M}.errors`, l.default.vErrors), x.unevaluated && D(R), I.return((0, c._)`${l.default.errors} === 0`));
  }
  function D({ gen: R, evaluated: I, props: C, items: M }) {
    C instanceof c.Name && R.assign((0, c._)`${I}.props`, C), M instanceof c.Name && R.assign((0, c._)`${I}.items`, M);
  }
  function U(R, I, C, M) {
    const { gen: B, schema: x, data: _e, allErrors: Le, opts: Ne, self: Re } = R, { RULES: ve } = Re;
    if (x.$ref && (Ne.ignoreKeywordsWithRef || !(0, u.schemaHasRulesButRef)(x, ve))) {
      B.block(() => k(R, "$ref", ve.all.$ref.definition));
      return;
    }
    Ne.jtd || J(R, I), B.block(() => {
      for (const ke of ve.rules)
        ot(ke);
      ot(ve.post);
    });
    function ot(ke) {
      (0, r.shouldUseGroup)(x, ke) && (ke.type ? (B.if((0, n.checkDataType)(ke.type, _e, Ne.strictNumbers)), V(R, ke), I.length === 1 && I[0] === ke.type && C && (B.else(), (0, n.reportTypeError)(R)), B.endIf()) : V(R, ke), Le || B.if((0, c._)`${l.default.errors} === ${M || 0}`));
    }
  }
  function V(R, I) {
    const { gen: C, schema: M, opts: { useDefaults: B } } = R;
    B && (0, s.assignDefaults)(R, I.type), C.block(() => {
      for (const x of I.rules)
        (0, r.shouldUseRule)(M, x) && k(R, x.keyword, x.definition, I.type);
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
        v(R.dataTypes, C) || f(R, `type "${C}" not allowed by context "${R.dataTypes.join(",")}"`);
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
        const { type: x } = B.definition;
        x.length && !x.some((_e) => S(I, _e)) && f(R, `missing type "${x.join(",")}" for keyword "${M}"`);
      }
    }
  }
  function S(R, I) {
    return R.includes(I) || I === "number" && R.includes("integer");
  }
  function v(R, I) {
    return R.includes(I) || I === "integer" && R.includes("number");
  }
  function i(R, I) {
    const C = [];
    for (const M of R.dataTypes)
      v(I, M) ? C.push(M) : I.includes("integer") && M === "number" && C.push("integer");
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
      const { gen: M, schemaCode: B, schemaType: x, def: _e } = this;
      M.if((0, c.or)((0, c._)`${B} === undefined`, C)), I !== c.nil && M.assign(I, !0), (x.length || _e.validateSchema) && (M.elseIf(this.invalid$data()), this.$dataError(), I !== c.nil && M.assign(I, !1)), M.else();
    }
    invalid$data() {
      const { gen: I, schemaCode: C, schemaType: M, def: B, it: x } = this;
      return (0, c.or)(_e(), Le());
      function _e() {
        if (M.length) {
          if (!(C instanceof c.Name))
            throw new Error("ajv implementation error");
          const Ne = Array.isArray(M) ? M : [M];
          return (0, c._)`${(0, n.checkDataTypes)(Ne, C, x.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return c.nil;
      }
      function Le() {
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
  mt.KeywordCxt = b;
  function k(R, I, C, M) {
    const B = new b(R, C, I);
    "code" in C ? C.code(B, M) : B.$data && C.validate ? (0, a.funcKeywordCode)(B, C) : "macro" in C ? (0, a.macroKeywordCode)(B, C) : (C.compile || C.validate) && (0, a.funcKeywordCode)(B, C);
  }
  const A = /^\/(?:[^~]|~0|~1)*$/, H = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function q(R, { dataLevel: I, dataNames: C, dataPathArr: M }) {
    let B, x;
    if (R === "")
      return l.default.rootData;
    if (R[0] === "/") {
      if (!A.test(R))
        throw new Error(`Invalid JSON-pointer: ${R}`);
      B = R, x = l.default.rootData;
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
      if (x = C[I - ve], !B)
        return x;
    }
    let _e = x;
    const Le = B.split("/");
    for (const Re of Le)
      Re && (x = (0, c._)`${x}${(0, c.getProperty)((0, u.unescapeJsonPointer)(Re))}`, _e = (0, c._)`${_e} && ${x}`);
    return _e;
    function Ne(Re, ve) {
      return `Cannot access ${Re} ${ve} levels up, current level is ${I}`;
    }
  }
  return mt.getData = q, mt;
}
var fn = {}, Wi;
function $o() {
  if (Wi) return fn;
  Wi = 1, Object.defineProperty(fn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return fn.default = e, fn;
}
var hn = {}, Xi;
function is() {
  if (Xi) return hn;
  Xi = 1, Object.defineProperty(hn, "__esModule", { value: !0 });
  const e = je;
  class t extends Error {
    constructor(n, s, a, o) {
      super(o || `can't resolve reference ${a} from id ${s}`), this.missingRef = (0, e.resolveUrl)(n, s, a), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return hn.default = t, hn;
}
var Ge = {};
Object.defineProperty(Ge, "__esModule", { value: !0 });
Ge.resolveSchema = Ge.getCompilingSchema = Ge.resolveRef = Ge.compileSchema = Ge.SchemaEnv = void 0;
const Ze = se, U0 = $o(), Kt = Vt(), rt = je, Yi = F, q0 = os();
class cs {
  constructor(t) {
    var r;
    this.refs = {}, this.dynamicAnchors = {};
    let n;
    typeof t.schema == "object" && (n = t.schema), this.schema = t.schema, this.schemaId = t.schemaId, this.root = t.root || this, this.baseId = (r = t.baseId) !== null && r !== void 0 ? r : (0, rt.normalizeId)(n == null ? void 0 : n[t.schemaId || "$id"]), this.schemaPath = t.schemaPath, this.localRefs = t.localRefs, this.meta = t.meta, this.$async = n == null ? void 0 : n.$async, this.refs = {};
  }
}
Ge.SchemaEnv = cs;
function yo(e) {
  const t = au.call(this, e);
  if (t)
    return t;
  const r = (0, rt.getFullPath)(this.opts.uriResolver, e.root.baseId), { es5: n, lines: s } = this.opts.code, { ownProperties: a } = this.opts, o = new Ze.CodeGen(this.scope, { es5: n, lines: s, ownProperties: a });
  let c;
  e.$async && (c = o.scopeValue("Error", {
    ref: U0.default,
    code: (0, Ze._)`require("ajv/dist/runtime/validation_error").default`
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
    dataPathArr: [Ze.nil],
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: o.scopeValue("schema", this.opts.code.source === !0 ? { ref: e.schema, code: (0, Ze.stringify)(e.schema) } : { ref: e.schema }),
    validateName: l,
    ValidationError: c,
    schema: e.schema,
    schemaEnv: e,
    rootId: r,
    baseId: e.baseId || r,
    schemaPath: Ze.nil,
    errSchemaPath: e.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, Ze._)`""`,
    opts: this.opts,
    self: this
  };
  let u;
  try {
    this._compilations.add(e), (0, q0.validateFunctionCode)(d), o.optimize(this.opts.code.optimize);
    const h = o.toString();
    u = `${o.scopeRefs(Kt.default.scope)}return ${h}`, this.opts.code.process && (u = this.opts.code.process(u, e));
    const $ = new Function(`${Kt.default.self}`, `${Kt.default.scope}`, u)(this, this.scope.get());
    if (this.scope.value(l, { ref: $ }), $.errors = null, $.schema = e.schema, $.schemaEnv = e, e.$async && ($.$async = !0), this.opts.code.source === !0 && ($.source = { validateName: l, validateCode: h, scopeValues: o._values }), this.opts.unevaluated) {
      const { props: y, items: g } = d;
      $.evaluated = {
        props: y instanceof Ze.Name ? void 0 : y,
        items: g instanceof Ze.Name ? void 0 : g,
        dynamicProps: y instanceof Ze.Name,
        dynamicItems: g instanceof Ze.Name
      }, $.source && ($.source.evaluated = (0, Ze.stringify)($.evaluated));
    }
    return e.validate = $, e;
  } catch (h) {
    throw delete e.validate, delete e.validateName, u && this.logger.error("Error compiling schema, function code:", u), h;
  } finally {
    this._compilations.delete(e);
  }
}
Ge.compileSchema = yo;
function G0(e, t, r) {
  var n;
  r = (0, rt.resolveUrl)(this.opts.uriResolver, t, r);
  const s = e.refs[r];
  if (s)
    return s;
  let a = B0.call(this, e, r);
  if (a === void 0) {
    const o = (n = e.localRefs) === null || n === void 0 ? void 0 : n[r], { schemaId: c } = this.opts;
    o && (a = new cs({ schema: o, schemaId: c, root: e, baseId: t }));
  }
  if (a !== void 0)
    return e.refs[r] = K0.call(this, a);
}
Ge.resolveRef = G0;
function K0(e) {
  return (0, rt.inlineRef)(e.schema, this.opts.inlineRefs) ? e.schema : e.validate ? e : yo.call(this, e);
}
function au(e) {
  for (const t of this._compilations)
    if (H0(t, e))
      return t;
}
Ge.getCompilingSchema = au;
function H0(e, t) {
  return e.schema === t.schema && e.root === t.root && e.baseId === t.baseId;
}
function B0(e, t) {
  let r;
  for (; typeof (r = this.refs[t]) == "string"; )
    t = r;
  return r || this.schemas[t] || ls.call(this, e, t);
}
function ls(e, t) {
  const r = this.opts.uriResolver.parse(t), n = (0, rt._getFullPath)(this.opts.uriResolver, r);
  let s = (0, rt.getFullPath)(this.opts.uriResolver, e.baseId, void 0);
  if (Object.keys(e.schema).length > 0 && n === s)
    return Ns.call(this, r, e);
  const a = (0, rt.normalizeId)(n), o = this.refs[a] || this.schemas[a];
  if (typeof o == "string") {
    const c = ls.call(this, e, o);
    return typeof (c == null ? void 0 : c.schema) != "object" ? void 0 : Ns.call(this, r, c);
  }
  if (typeof (o == null ? void 0 : o.schema) == "object") {
    if (o.validate || yo.call(this, o), a === (0, rt.normalizeId)(t)) {
      const { schema: c } = o, { schemaId: l } = this.opts, d = c[l];
      return d && (s = (0, rt.resolveUrl)(this.opts.uriResolver, s, d)), new cs({ schema: c, schemaId: l, root: e, baseId: s });
    }
    return Ns.call(this, r, o);
  }
}
Ge.resolveSchema = ls;
const J0 = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function Ns(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
    return;
  for (const c of e.fragment.slice(1).split("/")) {
    if (typeof r == "boolean")
      return;
    const l = r[(0, Yi.unescapeFragment)(c)];
    if (l === void 0)
      return;
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !J0.has(c) && d && (t = (0, rt.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, Yi.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, rt.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ls.call(this, n, c);
  }
  const { schemaId: o } = this.opts;
  if (a = a || new cs({ schema: r, schemaId: o, root: n, baseId: t }), a.schema !== a.root.schema)
    return a;
}
const W0 = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", X0 = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Y0 = "object", Q0 = [
  "$data"
], Z0 = {
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
}, x0 = !1, eg = {
  $id: W0,
  description: X0,
  type: Y0,
  required: Q0,
  properties: Z0,
  additionalProperties: x0
};
var go = {};
Object.defineProperty(go, "__esModule", { value: !0 });
const ou = Tl;
ou.code = 'require("ajv/dist/runtime/uri").default';
go.default = ou;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
  var t = os();
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
  const n = $o(), s = is(), a = er, o = Ge, c = se, l = je, d = Se, u = F, h = eg, w = go, $ = (N, p) => new RegExp(N, p);
  $.code = "new RegExp";
  const y = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
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
  ]), _ = {
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
  }, E = 200;
  function P(N) {
    var p, S, v, i, f, b, k, A, H, q, R, I, C, M, B, x, _e, Le, Ne, Re, ve, ot, ke, Ft, zt;
    const Xe = N.strict, Ut = (p = N.code) === null || p === void 0 ? void 0 : p.optimize, Rr = Ut === !0 || Ut === void 0 ? 1 : Ut || 0, Or = (v = (S = N.code) === null || S === void 0 ? void 0 : S.regExp) !== null && v !== void 0 ? v : $, ys = (i = N.uriResolver) !== null && i !== void 0 ? i : w.default;
    return {
      strictSchema: (b = (f = N.strictSchema) !== null && f !== void 0 ? f : Xe) !== null && b !== void 0 ? b : !0,
      strictNumbers: (A = (k = N.strictNumbers) !== null && k !== void 0 ? k : Xe) !== null && A !== void 0 ? A : !0,
      strictTypes: (q = (H = N.strictTypes) !== null && H !== void 0 ? H : Xe) !== null && q !== void 0 ? q : "log",
      strictTuples: (I = (R = N.strictTuples) !== null && R !== void 0 ? R : Xe) !== null && I !== void 0 ? I : "log",
      strictRequired: (M = (C = N.strictRequired) !== null && C !== void 0 ? C : Xe) !== null && M !== void 0 ? M : !1,
      code: N.code ? { ...N.code, optimize: Rr, regExp: Or } : { optimize: Rr, regExp: Or },
      loopRequired: (B = N.loopRequired) !== null && B !== void 0 ? B : E,
      loopEnum: (x = N.loopEnum) !== null && x !== void 0 ? x : E,
      meta: (_e = N.meta) !== null && _e !== void 0 ? _e : !0,
      messages: (Le = N.messages) !== null && Le !== void 0 ? Le : !0,
      inlineRefs: (Ne = N.inlineRefs) !== null && Ne !== void 0 ? Ne : !0,
      schemaId: (Re = N.schemaId) !== null && Re !== void 0 ? Re : "$id",
      addUsedSchema: (ve = N.addUsedSchema) !== null && ve !== void 0 ? ve : !0,
      validateSchema: (ot = N.validateSchema) !== null && ot !== void 0 ? ot : !0,
      validateFormats: (ke = N.validateFormats) !== null && ke !== void 0 ? ke : !0,
      unicodeRegExp: (Ft = N.unicodeRegExp) !== null && Ft !== void 0 ? Ft : !0,
      int32range: (zt = N.int32range) !== null && zt !== void 0 ? zt : !0,
      uriResolver: ys
    };
  }
  class O {
    constructor(p = {}) {
      this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), p = this.opts = { ...p, ...P(p) };
      const { es5: S, lines: v } = this.opts.code;
      this.scope = new c.ValueScope({ scope: {}, prefixes: g, es5: S, lines: v }), this.logger = X(p.logger);
      const i = p.validateFormats;
      p.validateFormats = !1, this.RULES = (0, a.getRules)(), T.call(this, _, p, "NOT SUPPORTED"), T.call(this, m, p, "DEPRECATED", "warn"), this._metaOpts = ge.call(this), p.formats && le.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), p.keywords && he.call(this, p.keywords), typeof p.meta == "object" && this.addMetaSchema(p.meta), Y.call(this), p.validateFormats = i;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data: p, meta: S, schemaId: v } = this.opts;
      let i = h;
      v === "id" && (i = { ...h }, i.id = i.$id, delete i.$id), S && p && this.addMetaSchema(i, i[v], !1);
    }
    defaultMeta() {
      const { meta: p, schemaId: S } = this.opts;
      return this.opts.defaultMeta = typeof p == "object" ? p[S] || p : void 0;
    }
    validate(p, S) {
      let v;
      if (typeof p == "string") {
        if (v = this.getSchema(p), !v)
          throw new Error(`no schema with key or ref "${p}"`);
      } else
        v = this.compile(p);
      const i = v(S);
      return "$async" in v || (this.errors = v.errors), i;
    }
    compile(p, S) {
      const v = this._addSchema(p, S);
      return v.validate || this._compileSchemaEnv(v);
    }
    compileAsync(p, S) {
      if (typeof this.opts.loadSchema != "function")
        throw new Error("options.loadSchema should be a function");
      const { loadSchema: v } = this.opts;
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
          return await (this._loading[q] = v(q));
        } finally {
          delete this._loading[q];
        }
      }
    }
    // Adds schema to the instance
    addSchema(p, S, v, i = this.opts.validateSchema) {
      if (Array.isArray(p)) {
        for (const b of p)
          this.addSchema(b, void 0, v, i);
        return this;
      }
      let f;
      if (typeof p == "object") {
        const { schemaId: b } = this.opts;
        if (f = p[b], f !== void 0 && typeof f != "string")
          throw new Error(`schema ${b} must be string`);
      }
      return S = (0, l.normalizeId)(S || f), this._checkUnique(S), this.schemas[S] = this._addSchema(p, v, S, i, !0), this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(p, S, v = this.opts.validateSchema) {
      return this.addSchema(p, S, !0, v), this;
    }
    //  Validate schema against its meta-schema
    validateSchema(p, S) {
      if (typeof p == "boolean")
        return !0;
      let v;
      if (v = p.$schema, v !== void 0 && typeof v != "string")
        throw new Error("$schema must be a string");
      if (v = v || this.opts.defaultMeta || this.defaultMeta(), !v)
        return this.logger.warn("meta-schema not available"), this.errors = null, !0;
      const i = this.validate(v, p);
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
        const { schemaId: v } = this.opts, i = new o.SchemaEnv({ schema: {}, schemaId: v });
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
          let v = p[this.opts.schemaId];
          return v && (v = (0, l.normalizeId)(v), delete this.schemas[v], delete this.refs[v]), this;
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
      let v;
      if (typeof p == "string")
        v = p, typeof S == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), S.keyword = v);
      else if (typeof p == "object" && S === void 0) {
        if (S = p, v = S.keyword, Array.isArray(v) && !v.length)
          throw new Error("addKeywords: keyword must be string or non-empty array");
      } else
        throw new Error("invalid addKeywords parameters");
      if (j.call(this, v, S), !S)
        return (0, u.eachItem)(v, (f) => D.call(this, f)), this;
      V.call(this, S);
      const i = {
        ...S,
        type: (0, d.getJSONTypes)(S.type),
        schemaType: (0, d.getJSONTypes)(S.schemaType)
      };
      return (0, u.eachItem)(v, i.type.length === 0 ? (f) => D.call(this, f, i) : (f) => i.type.forEach((b) => D.call(this, f, i, b))), this;
    }
    getKeyword(p) {
      const S = this.RULES.all[p];
      return typeof S == "object" ? S.definition : !!S;
    }
    // Remove keyword
    removeKeyword(p) {
      const { RULES: S } = this;
      delete S.keywords[p], delete S.all[p];
      for (const v of S.rules) {
        const i = v.rules.findIndex((f) => f.keyword === p);
        i >= 0 && v.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(p, S) {
      return typeof S == "string" && (S = new RegExp(S)), this.formats[p] = S, this;
    }
    errorsText(p = this.errors, { separator: S = ", ", dataVar: v = "data" } = {}) {
      return !p || p.length === 0 ? "No errors" : p.map((i) => `${v}${i.instancePath} ${i.message}`).reduce((i, f) => i + S + f);
    }
    $dataMetaSchema(p, S) {
      const v = this.RULES.all;
      p = JSON.parse(JSON.stringify(p));
      for (const i of S) {
        const f = i.split("/").slice(1);
        let b = p;
        for (const k of f)
          b = b[k];
        for (const k in v) {
          const A = v[k];
          if (typeof A != "object")
            continue;
          const { $data: H } = A.definition, q = b[k];
          H && q && (b[k] = z(q));
        }
      }
      return p;
    }
    _removeAllSchemas(p, S) {
      for (const v in p) {
        const i = p[v];
        (!S || S.test(v)) && (typeof i == "string" ? delete p[v] : i && !i.meta && (this._cache.delete(i.schema), delete p[v]));
      }
    }
    _addSchema(p, S, v, i = this.opts.validateSchema, f = this.opts.addUsedSchema) {
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
      v = (0, l.normalizeId)(b || v);
      const H = l.getSchemaRefs.call(this, p, v);
      return A = new o.SchemaEnv({ schema: p, schemaId: k, meta: S, baseId: v, localRefs: H }), this._cache.set(A.schema, A), f && !v.startsWith("#") && (v && this._checkUnique(v), this.refs[v] = A), i && this.validateSchema(p, !0), A;
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
  function T(N, p, S, v = "error") {
    for (const i in N) {
      const f = i;
      f in p && this.logger[v](`${S}: option ${i}. ${N[f]}`);
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
  function le() {
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
    for (const p of y)
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
  const Q = /^[a-z_$][a-z0-9_$:-]*$/i;
  function j(N, p) {
    const { RULES: S } = this;
    if ((0, u.eachItem)(N, (v) => {
      if (S.keywords[v])
        throw new Error(`Keyword ${v} is already defined`);
      if (!Q.test(v))
        throw new Error(`Keyword ${v} has invalid name`);
    }), !!p && p.$data && !("code" in p || "validate" in p))
      throw new Error('$data keyword must have "code" or "validate" function');
  }
  function D(N, p, S) {
    var v;
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
    p.before ? U.call(this, b, k, p.before) : b.rules.push(k), f.all[N] = k, (v = p.implements) === null || v === void 0 || v.forEach((A) => this.addKeyword(A));
  }
  function U(N, p, S) {
    const v = N.rules.findIndex((i) => i.keyword === S);
    v >= 0 ? N.rules.splice(v, 0, p) : (N.rules.push(p), this.logger.warn(`rule ${S} is not defined`));
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
})(Gl);
var _o = {}, vo = {}, wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const tg = {
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
wo.default = tg;
var tr = {};
Object.defineProperty(tr, "__esModule", { value: !0 });
tr.callRef = tr.getValidate = void 0;
const rg = is(), Qi = ie, qe = se, sr = Vt(), Zi = Ge, mn = F, ng = {
  keyword: "$ref",
  schemaType: "string",
  code(e) {
    const { gen: t, schema: r, it: n } = e, { baseId: s, schemaEnv: a, validateName: o, opts: c, self: l } = n, { root: d } = a;
    if ((r === "#" || r === "#/") && s === d.baseId)
      return h();
    const u = Zi.resolveRef.call(l, d, s, r);
    if (u === void 0)
      throw new rg.default(n.opts.uriResolver, s, r);
    if (u instanceof Zi.SchemaEnv)
      return w(u);
    return $(u);
    function h() {
      if (a === d)
        return kn(e, o, a, a.$async);
      const y = t.scopeValue("root", { ref: d });
      return kn(e, (0, qe._)`${y}.validate`, d, d.$async);
    }
    function w(y) {
      const g = iu(e, y);
      kn(e, g, y, y.$async);
    }
    function $(y) {
      const g = t.scopeValue("schema", c.code.source === !0 ? { ref: y, code: (0, qe.stringify)(y) } : { ref: y }), _ = t.name("valid"), m = e.subschema({
        schema: y,
        dataTypes: [],
        schemaPath: qe.nil,
        topSchemaRef: g,
        errSchemaPath: r
      }, _);
      e.mergeEvaluated(m), e.ok(_);
    }
  }
};
function iu(e, t) {
  const { gen: r } = e;
  return t.validate ? r.scopeValue("validate", { ref: t.validate }) : (0, qe._)`${r.scopeValue("wrapper", { ref: t })}.validate`;
}
tr.getValidate = iu;
function kn(e, t, r, n) {
  const { gen: s, it: a } = e, { allErrors: o, schemaEnv: c, opts: l } = a, d = l.passContext ? sr.default.this : qe.nil;
  n ? u() : h();
  function u() {
    if (!c.$async)
      throw new Error("async schema referenced by sync schema");
    const y = s.let("valid");
    s.try(() => {
      s.code((0, qe._)`await ${(0, Qi.callValidateCode)(e, t, d)}`), $(t), o || s.assign(y, !0);
    }, (g) => {
      s.if((0, qe._)`!(${g} instanceof ${a.ValidationError})`, () => s.throw(g)), w(g), o || s.assign(y, !1);
    }), e.ok(y);
  }
  function h() {
    e.result((0, Qi.callValidateCode)(e, t, d), () => $(t), () => w(t));
  }
  function w(y) {
    const g = (0, qe._)`${y}.errors`;
    s.assign(sr.default.vErrors, (0, qe._)`${sr.default.vErrors} === null ? ${g} : ${sr.default.vErrors}.concat(${g})`), s.assign(sr.default.errors, (0, qe._)`${sr.default.vErrors}.length`);
  }
  function $(y) {
    var g;
    if (!a.opts.unevaluated)
      return;
    const _ = (g = r == null ? void 0 : r.validate) === null || g === void 0 ? void 0 : g.evaluated;
    if (a.props !== !0)
      if (_ && !_.dynamicProps)
        _.props !== void 0 && (a.props = mn.mergeEvaluated.props(s, _.props, a.props));
      else {
        const m = s.var("props", (0, qe._)`${y}.evaluated.props`);
        a.props = mn.mergeEvaluated.props(s, m, a.props, qe.Name);
      }
    if (a.items !== !0)
      if (_ && !_.dynamicItems)
        _.items !== void 0 && (a.items = mn.mergeEvaluated.items(s, _.items, a.items));
      else {
        const m = s.var("items", (0, qe._)`${y}.evaluated.items`);
        a.items = mn.mergeEvaluated.items(s, m, a.items, qe.Name);
      }
  }
}
tr.callRef = kn;
tr.default = ng;
Object.defineProperty(vo, "__esModule", { value: !0 });
const sg = wo, ag = tr, og = [
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
  sg.default,
  ag.default
];
vo.default = og;
var Eo = {}, bo = {};
Object.defineProperty(bo, "__esModule", { value: !0 });
const Hn = se, Tt = Hn.operators, Bn = {
  maximum: { okStr: "<=", ok: Tt.LTE, fail: Tt.GT },
  minimum: { okStr: ">=", ok: Tt.GTE, fail: Tt.LT },
  exclusiveMaximum: { okStr: "<", ok: Tt.LT, fail: Tt.GTE },
  exclusiveMinimum: { okStr: ">", ok: Tt.GT, fail: Tt.LTE }
}, ig = {
  message: ({ keyword: e, schemaCode: t }) => (0, Hn.str)`must be ${Bn[e].okStr} ${t}`,
  params: ({ keyword: e, schemaCode: t }) => (0, Hn._)`{comparison: ${Bn[e].okStr}, limit: ${t}}`
}, cg = {
  keyword: Object.keys(Bn),
  type: "number",
  schemaType: "number",
  $data: !0,
  error: ig,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e;
    e.fail$data((0, Hn._)`${r} ${Bn[t].fail} ${n} || isNaN(${r})`);
  }
};
bo.default = cg;
var So = {};
Object.defineProperty(So, "__esModule", { value: !0 });
const Br = se, lg = {
  message: ({ schemaCode: e }) => (0, Br.str)`must be multiple of ${e}`,
  params: ({ schemaCode: e }) => (0, Br._)`{multipleOf: ${e}}`
}, ug = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: !0,
  error: lg,
  code(e) {
    const { gen: t, data: r, schemaCode: n, it: s } = e, a = s.opts.multipleOfPrecision, o = t.let("res"), c = a ? (0, Br._)`Math.abs(Math.round(${o}) - ${o}) > 1e-${a}` : (0, Br._)`${o} !== parseInt(${o})`;
    e.fail$data((0, Br._)`(${n} === 0 || (${o} = ${r}/${n}, ${c}))`);
  }
};
So.default = ug;
var Po = {}, No = {};
Object.defineProperty(No, "__esModule", { value: !0 });
function cu(e) {
  const t = e.length;
  let r = 0, n = 0, s;
  for (; n < t; )
    r++, s = e.charCodeAt(n++), s >= 55296 && s <= 56319 && n < t && (s = e.charCodeAt(n), (s & 64512) === 56320 && n++);
  return r;
}
No.default = cu;
cu.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(Po, "__esModule", { value: !0 });
const Xt = se, dg = F, fg = No, hg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxLength" ? "more" : "fewer";
    return (0, Xt.str)`must NOT have ${r} than ${t} characters`;
  },
  params: ({ schemaCode: e }) => (0, Xt._)`{limit: ${e}}`
}, mg = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: !0,
  error: hg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n, it: s } = e, a = t === "maxLength" ? Xt.operators.GT : Xt.operators.LT, o = s.opts.unicode === !1 ? (0, Xt._)`${r}.length` : (0, Xt._)`${(0, dg.useFunc)(e.gen, fg.default)}(${r})`;
    e.fail$data((0, Xt._)`${o} ${a} ${n}`);
  }
};
Po.default = mg;
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
const pg = ie, Jn = se, $g = {
  message: ({ schemaCode: e }) => (0, Jn.str)`must match pattern "${e}"`,
  params: ({ schemaCode: e }) => (0, Jn._)`{pattern: ${e}}`
}, yg = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: !0,
  error: $g,
  code(e) {
    const { data: t, $data: r, schema: n, schemaCode: s, it: a } = e, o = a.opts.unicodeRegExp ? "u" : "", c = r ? (0, Jn._)`(new RegExp(${s}, ${o}))` : (0, pg.usePattern)(e, n);
    e.fail$data((0, Jn._)`!${c}.test(${t})`);
  }
};
Ro.default = yg;
var Oo = {};
Object.defineProperty(Oo, "__esModule", { value: !0 });
const Jr = se, gg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxProperties" ? "more" : "fewer";
    return (0, Jr.str)`must NOT have ${r} than ${t} properties`;
  },
  params: ({ schemaCode: e }) => (0, Jr._)`{limit: ${e}}`
}, _g = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: !0,
  error: gg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxProperties" ? Jr.operators.GT : Jr.operators.LT;
    e.fail$data((0, Jr._)`Object.keys(${r}).length ${s} ${n}`);
  }
};
Oo.default = _g;
var Io = {};
Object.defineProperty(Io, "__esModule", { value: !0 });
const Mr = ie, Wr = se, vg = F, wg = {
  message: ({ params: { missingProperty: e } }) => (0, Wr.str)`must have required property '${e}'`,
  params: ({ params: { missingProperty: e } }) => (0, Wr._)`{missingProperty: ${e}}`
}, Eg = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: !0,
  error: wg,
  code(e) {
    const { gen: t, schema: r, schemaCode: n, data: s, $data: a, it: o } = e, { opts: c } = o;
    if (!a && r.length === 0)
      return;
    const l = r.length >= c.loopRequired;
    if (o.allErrors ? d() : u(), c.strictRequired) {
      const $ = e.parentSchema.properties, { definedProperties: y } = e.it;
      for (const g of r)
        if (($ == null ? void 0 : $[g]) === void 0 && !y.has(g)) {
          const _ = o.schemaEnv.baseId + o.errSchemaPath, m = `required property "${g}" is not defined at "${_}" (strictRequired)`;
          (0, vg.checkStrictMode)(o, m, o.opts.strictRequired);
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
        const y = t.let("valid", !0);
        e.block$data(y, () => w($, y)), e.ok(y);
      } else
        t.if((0, Mr.checkMissingProp)(e, r, $)), (0, Mr.reportMissingProp)(e, $), t.else();
    }
    function h() {
      t.forOf("prop", n, ($) => {
        e.setParams({ missingProperty: $ }), t.if((0, Mr.noPropertyInData)(t, s, $, c.ownProperties), () => e.error());
      });
    }
    function w($, y) {
      e.setParams({ missingProperty: $ }), t.forOf($, n, () => {
        t.assign(y, (0, Mr.propertyInData)(t, s, $, c.ownProperties)), t.if((0, Wr.not)(y), () => {
          e.error(), t.break();
        });
      }, Wr.nil);
    }
  }
};
Io.default = Eg;
var To = {};
Object.defineProperty(To, "__esModule", { value: !0 });
const Xr = se, bg = {
  message({ keyword: e, schemaCode: t }) {
    const r = e === "maxItems" ? "more" : "fewer";
    return (0, Xr.str)`must NOT have ${r} than ${t} items`;
  },
  params: ({ schemaCode: e }) => (0, Xr._)`{limit: ${e}}`
}, Sg = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: !0,
  error: bg,
  code(e) {
    const { keyword: t, data: r, schemaCode: n } = e, s = t === "maxItems" ? Xr.operators.GT : Xr.operators.LT;
    e.fail$data((0, Xr._)`${r}.length ${s} ${n}`);
  }
};
To.default = Sg;
var jo = {}, rn = {};
Object.defineProperty(rn, "__esModule", { value: !0 });
const lu = xn;
lu.code = 'require("ajv/dist/runtime/equal").default';
rn.default = lu;
Object.defineProperty(jo, "__esModule", { value: !0 });
const Rs = Se, Ie = se, Pg = F, Ng = rn, Rg = {
  message: ({ params: { i: e, j: t } }) => (0, Ie.str)`must NOT have duplicate items (items ## ${t} and ${e} are identical)`,
  params: ({ params: { i: e, j: t } }) => (0, Ie._)`{i: ${e}, j: ${t}}`
}, Og = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: !0,
  error: Rg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, parentSchema: a, schemaCode: o, it: c } = e;
    if (!n && !s)
      return;
    const l = t.let("valid"), d = a.items ? (0, Rs.getSchemaTypes)(a.items) : [];
    e.block$data(l, u, (0, Ie._)`${o} === false`), e.ok(l);
    function u() {
      const y = t.let("i", (0, Ie._)`${r}.length`), g = t.let("j");
      e.setParams({ i: y, j: g }), t.assign(l, !0), t.if((0, Ie._)`${y} > 1`, () => (h() ? w : $)(y, g));
    }
    function h() {
      return d.length > 0 && !d.some((y) => y === "object" || y === "array");
    }
    function w(y, g) {
      const _ = t.name("item"), m = (0, Rs.checkDataTypes)(d, _, c.opts.strictNumbers, Rs.DataType.Wrong), E = t.const("indices", (0, Ie._)`{}`);
      t.for((0, Ie._)`;${y}--;`, () => {
        t.let(_, (0, Ie._)`${r}[${y}]`), t.if(m, (0, Ie._)`continue`), d.length > 1 && t.if((0, Ie._)`typeof ${_} == "string"`, (0, Ie._)`${_} += "_"`), t.if((0, Ie._)`typeof ${E}[${_}] == "number"`, () => {
          t.assign(g, (0, Ie._)`${E}[${_}]`), e.error(), t.assign(l, !1).break();
        }).code((0, Ie._)`${E}[${_}] = ${y}`);
      });
    }
    function $(y, g) {
      const _ = (0, Pg.useFunc)(t, Ng.default), m = t.name("outer");
      t.label(m).for((0, Ie._)`;${y}--;`, () => t.for((0, Ie._)`${g} = ${y}; ${g}--;`, () => t.if((0, Ie._)`${_}(${r}[${y}], ${r}[${g}])`, () => {
        e.error(), t.assign(l, !1).break(m);
      })));
    }
  }
};
jo.default = Og;
var ko = {};
Object.defineProperty(ko, "__esModule", { value: !0 });
const Ys = se, Ig = F, Tg = rn, jg = {
  message: "must be equal to constant",
  params: ({ schemaCode: e }) => (0, Ys._)`{allowedValue: ${e}}`
}, kg = {
  keyword: "const",
  $data: !0,
  error: jg,
  code(e) {
    const { gen: t, data: r, $data: n, schemaCode: s, schema: a } = e;
    n || a && typeof a == "object" ? e.fail$data((0, Ys._)`!${(0, Ig.useFunc)(t, Tg.default)}(${r}, ${s})`) : e.fail((0, Ys._)`${a} !== ${r}`);
  }
};
ko.default = kg;
var Ao = {};
Object.defineProperty(Ao, "__esModule", { value: !0 });
const zr = se, Ag = F, Cg = rn, Dg = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode: e }) => (0, zr._)`{allowedValues: ${e}}`
}, Mg = {
  keyword: "enum",
  schemaType: "array",
  $data: !0,
  error: Dg,
  code(e) {
    const { gen: t, data: r, $data: n, schema: s, schemaCode: a, it: o } = e;
    if (!n && s.length === 0)
      throw new Error("enum must have non-empty array");
    const c = s.length >= o.opts.loopEnum;
    let l;
    const d = () => l ?? (l = (0, Ag.useFunc)(t, Cg.default));
    let u;
    if (c || n)
      u = t.let("valid"), e.block$data(u, h);
    else {
      if (!Array.isArray(s))
        throw new Error("ajv implementation error");
      const $ = t.const("vSchema", a);
      u = (0, zr.or)(...s.map((y, g) => w($, g)));
    }
    e.pass(u);
    function h() {
      t.assign(u, !1), t.forOf("v", a, ($) => t.if((0, zr._)`${d()}(${r}, ${$})`, () => t.assign(u, !0).break()));
    }
    function w($, y) {
      const g = s[y];
      return typeof g == "object" && g !== null ? (0, zr._)`${d()}(${r}, ${$}[${y}])` : (0, zr._)`${r} === ${g}`;
    }
  }
};
Ao.default = Mg;
Object.defineProperty(Eo, "__esModule", { value: !0 });
const Lg = bo, Vg = So, Fg = Po, zg = Ro, Ug = Oo, qg = Io, Gg = To, Kg = jo, Hg = ko, Bg = Ao, Jg = [
  // number
  Lg.default,
  Vg.default,
  // string
  Fg.default,
  zg.default,
  // object
  Ug.default,
  qg.default,
  // array
  Gg.default,
  Kg.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  Hg.default,
  Bg.default
];
Eo.default = Jg;
var Co = {}, Sr = {};
Object.defineProperty(Sr, "__esModule", { value: !0 });
Sr.validateAdditionalItems = void 0;
const Yt = se, Qs = F, Wg = {
  message: ({ params: { len: e } }) => (0, Yt.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, Yt._)`{limit: ${e}}`
}, Xg = {
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
  error: Wg,
  code(e) {
    const { parentSchema: t, it: r } = e, { items: n } = t;
    if (!Array.isArray(n)) {
      (0, Qs.checkStrictMode)(r, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    uu(e, n);
  }
};
function uu(e, t) {
  const { gen: r, schema: n, data: s, keyword: a, it: o } = e;
  o.items = !0;
  const c = r.const("len", (0, Yt._)`${s}.length`);
  if (n === !1)
    e.setParams({ len: t.length }), e.pass((0, Yt._)`${c} <= ${t.length}`);
  else if (typeof n == "object" && !(0, Qs.alwaysValidSchema)(o, n)) {
    const d = r.var("valid", (0, Yt._)`${c} <= ${t.length}`);
    r.if((0, Yt.not)(d), () => l(d)), e.ok(d);
  }
  function l(d) {
    r.forRange("i", t.length, c, (u) => {
      e.subschema({ keyword: a, dataProp: u, dataPropType: Qs.Type.Num }, d), o.allErrors || r.if((0, Yt.not)(d), () => r.break());
    });
  }
}
Sr.validateAdditionalItems = uu;
Sr.default = Xg;
var Do = {}, Pr = {};
Object.defineProperty(Pr, "__esModule", { value: !0 });
Pr.validateTuple = void 0;
const xi = se, An = F, Yg = ie, Qg = {
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
  code(e) {
    const { schema: t, it: r } = e;
    if (Array.isArray(t))
      return du(e, "additionalItems", t);
    r.items = !0, !(0, An.alwaysValidSchema)(r, t) && e.ok((0, Yg.validateArray)(e));
  }
};
function du(e, t, r = e.schema) {
  const { gen: n, parentSchema: s, data: a, keyword: o, it: c } = e;
  u(s), c.opts.unevaluated && r.length && c.items !== !0 && (c.items = An.mergeEvaluated.items(n, r.length, c.items));
  const l = n.name("valid"), d = n.const("len", (0, xi._)`${a}.length`);
  r.forEach((h, w) => {
    (0, An.alwaysValidSchema)(c, h) || (n.if((0, xi._)`${d} > ${w}`, () => e.subschema({
      keyword: o,
      schemaProp: w,
      dataProp: w
    }, l)), e.ok(l));
  });
  function u(h) {
    const { opts: w, errSchemaPath: $ } = c, y = r.length, g = y === h.minItems && (y === h.maxItems || h[t] === !1);
    if (w.strictTuples && !g) {
      const _ = `"${o}" is ${y}-tuple, but minItems or maxItems/${t} are not specified or different at path "${$}"`;
      (0, An.checkStrictMode)(c, _, w.strictTuples);
    }
  }
}
Pr.validateTuple = du;
Pr.default = Qg;
Object.defineProperty(Do, "__esModule", { value: !0 });
const Zg = Pr, xg = {
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
  code: (e) => (0, Zg.validateTuple)(e, "items")
};
Do.default = xg;
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const ec = se, e_ = F, t_ = ie, r_ = Sr, n_ = {
  message: ({ params: { len: e } }) => (0, ec.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, ec._)`{limit: ${e}}`
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
Mo.default = s_;
var Lo = {};
Object.defineProperty(Lo, "__esModule", { value: !0 });
const We = se, pn = F, a_ = {
  message: ({ params: { min: e, max: t } }) => t === void 0 ? (0, We.str)`must contain at least ${e} valid item(s)` : (0, We.str)`must contain at least ${e} and no more than ${t} valid item(s)`,
  params: ({ params: { min: e, max: t } }) => t === void 0 ? (0, We._)`{minContains: ${e}}` : (0, We._)`{minContains: ${e}, maxContains: ${t}}`
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
    const u = t.const("len", (0, We._)`${s}.length`);
    if (e.setParams({ min: o, max: c }), c === void 0 && o === 0) {
      (0, pn.checkStrictMode)(a, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
      return;
    }
    if (c !== void 0 && o > c) {
      (0, pn.checkStrictMode)(a, '"minContains" > "maxContains" is always invalid'), e.fail();
      return;
    }
    if ((0, pn.alwaysValidSchema)(a, r)) {
      let g = (0, We._)`${u} >= ${o}`;
      c !== void 0 && (g = (0, We._)`${g} && ${u} <= ${c}`), e.pass(g);
      return;
    }
    a.items = !0;
    const h = t.name("valid");
    c === void 0 && o === 1 ? $(h, () => t.if(h, () => t.break())) : o === 0 ? (t.let(h, !0), c !== void 0 && t.if((0, We._)`${s}.length > 0`, w)) : (t.let(h, !1), w()), e.result(h, () => e.reset());
    function w() {
      const g = t.name("_valid"), _ = t.let("count", 0);
      $(g, () => t.if(g, () => y(_)));
    }
    function $(g, _) {
      t.forRange("i", 0, u, (m) => {
        e.subschema({
          keyword: "contains",
          dataProp: m,
          dataPropType: pn.Type.Num,
          compositeRule: !0
        }, g), _();
      });
    }
    function y(g) {
      t.code((0, We._)`${g}++`), c === void 0 ? t.if((0, We._)`${g} >= ${o}`, () => t.assign(h, !0).break()) : (t.if((0, We._)`${g} > ${c}`, () => t.assign(h, !1).break()), o === 1 ? t.assign(h, !0) : t.if((0, We._)`${g} >= ${o}`, () => t.assign(h, !0)));
    }
  }
};
Lo.default = o_;
var fu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
  const t = se, r = F, n = ie;
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
      const w = Array.isArray(l[h]) ? d : u;
      w[h] = l[h];
    }
    return [d, u];
  }
  function o(l, d = l.schema) {
    const { gen: u, data: h, it: w } = l;
    if (Object.keys(d).length === 0)
      return;
    const $ = u.let("missing");
    for (const y in d) {
      const g = d[y];
      if (g.length === 0)
        continue;
      const _ = (0, n.propertyInData)(u, h, y, w.opts.ownProperties);
      l.setParams({
        property: y,
        depsCount: g.length,
        deps: g.join(", ")
      }), w.allErrors ? u.if(_, () => {
        for (const m of g)
          (0, n.checkReportMissingProp)(l, m);
      }) : (u.if((0, t._)`${_} && (${(0, n.checkMissingProp)(l, g, $)})`), (0, n.reportMissingProp)(l, $), u.else());
    }
  }
  e.validatePropertyDeps = o;
  function c(l, d = l.schema) {
    const { gen: u, data: h, keyword: w, it: $ } = l, y = u.name("valid");
    for (const g in d)
      (0, r.alwaysValidSchema)($, d[g]) || (u.if(
        (0, n.propertyInData)(u, h, g, $.opts.ownProperties),
        () => {
          const _ = l.subschema({ keyword: w, schemaProp: g }, y);
          l.mergeValidEvaluated(_, y);
        },
        () => u.var(y, !0)
        // TODO var
      ), l.ok(y));
  }
  e.validateSchemaDeps = c, e.default = s;
})(fu);
var Vo = {};
Object.defineProperty(Vo, "__esModule", { value: !0 });
const hu = se, i_ = F, c_ = {
  message: "property name must be valid",
  params: ({ params: e }) => (0, hu._)`{propertyName: ${e.propertyName}}`
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
      }, a), t.if((0, hu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
      });
    }), e.ok(a);
  }
};
Vo.default = l_;
var us = {};
Object.defineProperty(us, "__esModule", { value: !0 });
const $n = ie, et = se, u_ = Vt(), yn = F, d_ = {
  message: "must NOT have additional properties",
  params: ({ params: e }) => (0, et._)`{additionalProperty: ${e.additionalProperty}}`
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
    h(), e.ok((0, et._)`${a} === ${u_.default.errors}`);
    function h() {
      t.forIn("key", s, (_) => {
        !d.length && !u.length ? y(_) : t.if(w(_), () => y(_));
      });
    }
    function w(_) {
      let m;
      if (d.length > 8) {
        const E = (0, yn.schemaRefOrVal)(o, n.properties, "properties");
        m = (0, $n.isOwnProperty)(t, E, _);
      } else d.length ? m = (0, et.or)(...d.map((E) => (0, et._)`${_} === ${E}`)) : m = et.nil;
      return u.length && (m = (0, et.or)(m, ...u.map((E) => (0, et._)`${(0, $n.usePattern)(e, E)}.test(${_})`))), (0, et.not)(m);
    }
    function $(_) {
      t.code((0, et._)`delete ${s}[${_}]`);
    }
    function y(_) {
      if (l.removeAdditional === "all" || l.removeAdditional && r === !1) {
        $(_);
        return;
      }
      if (r === !1) {
        e.setParams({ additionalProperty: _ }), e.error(), c || t.break();
        return;
      }
      if (typeof r == "object" && !(0, yn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g(_, m, !1), t.if((0, et.not)(m), () => {
          e.reset(), $(_);
        })) : (g(_, m), c || t.if((0, et.not)(m), () => t.break()));
      }
    }
    function g(_, m, E) {
      const P = {
        keyword: "additionalProperties",
        dataProp: _,
        dataPropType: yn.Type.Str
      };
      E === !1 && Object.assign(P, {
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }), e.subschema(P, m);
    }
  }
};
us.default = f_;
var Fo = {};
Object.defineProperty(Fo, "__esModule", { value: !0 });
const h_ = os(), tc = ie, Os = F, rc = us, m_ = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, parentSchema: n, data: s, it: a } = e;
    a.opts.removeAdditional === "all" && n.additionalProperties === void 0 && rc.default.code(new h_.KeywordCxt(a, rc.default, "additionalProperties"));
    const o = (0, tc.allSchemaProperties)(r);
    for (const h of o)
      a.definedProperties.add(h);
    a.opts.unevaluated && o.length && a.props !== !0 && (a.props = Os.mergeEvaluated.props(t, (0, Os.toHash)(o), a.props));
    const c = o.filter((h) => !(0, Os.alwaysValidSchema)(a, r[h]));
    if (c.length === 0)
      return;
    const l = t.name("valid");
    for (const h of c)
      d(h) ? u(h) : (t.if((0, tc.propertyInData)(t, s, h, a.opts.ownProperties)), u(h), a.allErrors || t.else().var(l, !0), t.endIf()), e.it.definedProperties.add(h), e.ok(l);
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
Fo.default = m_;
var zo = {};
Object.defineProperty(zo, "__esModule", { value: !0 });
const nc = ie, gn = se, sc = F, ac = F, p_ = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(e) {
    const { gen: t, schema: r, data: n, parentSchema: s, it: a } = e, { opts: o } = a, c = (0, nc.allSchemaProperties)(r), l = c.filter((g) => (0, sc.alwaysValidSchema)(a, r[g]));
    if (c.length === 0 || l.length === c.length && (!a.opts.unevaluated || a.props === !0))
      return;
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof gn.Name) && (a.props = (0, ac.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    w();
    function w() {
      for (const g of c)
        d && $(g), a.allErrors ? y(g) : (t.var(u, !0), y(g), t.if(u));
    }
    function $(g) {
      for (const _ in d)
        new RegExp(g).test(_) && (0, sc.checkStrictMode)(a, `property ${_} matches pattern ${g} (use allowMatchingProperties)`);
    }
    function y(g) {
      t.forIn("key", n, (_) => {
        t.if((0, gn._)`${(0, nc.usePattern)(e, g)}.test(${_})`, () => {
          const m = l.includes(g);
          m || e.subschema({
            keyword: "patternProperties",
            schemaProp: g,
            dataProp: _,
            dataPropType: ac.Type.Str
          }, u), a.opts.unevaluated && h !== !0 ? t.assign((0, gn._)`${h}[${_}]`, !0) : !m && !a.allErrors && t.if((0, gn.not)(u), () => t.break());
        });
      });
    }
  }
};
zo.default = p_;
var Uo = {};
Object.defineProperty(Uo, "__esModule", { value: !0 });
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
Uo.default = y_;
var qo = {};
Object.defineProperty(qo, "__esModule", { value: !0 });
const g_ = ie, __ = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: !0,
  code: g_.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
qo.default = __;
var Go = {};
Object.defineProperty(Go, "__esModule", { value: !0 });
const Cn = se, v_ = F, w_ = {
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
        let w;
        (0, v_.alwaysValidSchema)(s, u) ? t.var(l, !0) : w = e.subschema({
          keyword: "oneOf",
          schemaProp: h,
          compositeRule: !0
        }, l), h > 0 && t.if((0, Cn._)`${l} && ${o}`).assign(o, !1).assign(c, (0, Cn._)`[${c}, ${h}]`).else(), t.if(l, () => {
          t.assign(o, !0), t.assign(c, h), w && e.mergeEvaluated(w, Cn.Name);
        });
      });
    }
  }
};
Go.default = E_;
var Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
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
Ko.default = S_;
var Ho = {};
Object.defineProperty(Ho, "__esModule", { value: !0 });
const Wn = se, mu = F, P_ = {
  message: ({ params: e }) => (0, Wn.str)`must match "${e.ifClause}" schema`,
  params: ({ params: e }) => (0, Wn._)`{failingKeyword: ${e.ifClause}}`
}, N_ = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: !0,
  error: P_,
  code(e) {
    const { gen: t, parentSchema: r, it: n } = e;
    r.then === void 0 && r.else === void 0 && (0, mu.checkStrictMode)(n, '"if" without "then" and "else" is ignored');
    const s = oc(n, "then"), a = oc(n, "else");
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
        const w = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(w, o), h ? t.assign(h, (0, Wn._)`${u}`) : e.setParams({ ifClause: u });
      };
    }
  }
};
function oc(e, t) {
  const r = e.schema[t];
  return r !== void 0 && !(0, mu.alwaysValidSchema)(e, r);
}
Ho.default = N_;
var Bo = {};
Object.defineProperty(Bo, "__esModule", { value: !0 });
const R_ = F, O_ = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: e, parentSchema: t, it: r }) {
    t.if === void 0 && (0, R_.checkStrictMode)(r, `"${e}" without "if" is ignored`);
  }
};
Bo.default = O_;
Object.defineProperty(Co, "__esModule", { value: !0 });
const I_ = Sr, T_ = Do, j_ = Pr, k_ = Mo, A_ = Lo, C_ = fu, D_ = Vo, M_ = us, L_ = Fo, V_ = zo, F_ = Uo, z_ = qo, U_ = Go, q_ = Ko, G_ = Ho, K_ = Bo;
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
Co.default = H_;
var Jo = {}, Wo = {};
Object.defineProperty(Wo, "__esModule", { value: !0 });
const Ee = se, B_ = {
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
    s ? w() : $();
    function w() {
      const y = r.scopeValue("formats", {
        ref: h.formats,
        code: l.code.formats
      }), g = r.const("fDef", (0, Ee._)`${y}[${o}]`), _ = r.let("fType"), m = r.let("format");
      r.if((0, Ee._)`typeof ${g} == "object" && !(${g} instanceof RegExp)`, () => r.assign(_, (0, Ee._)`${g}.type || "string"`).assign(m, (0, Ee._)`${g}.validate`), () => r.assign(_, (0, Ee._)`"string"`).assign(m, g)), e.fail$data((0, Ee.or)(E(), P()));
      function E() {
        return l.strictSchema === !1 ? Ee.nil : (0, Ee._)`${o} && !${m}`;
      }
      function P() {
        const O = u.$async ? (0, Ee._)`(${g}.async ? await ${m}(${n}) : ${m}(${n}))` : (0, Ee._)`${m}(${n})`, T = (0, Ee._)`(typeof ${m} == "function" ? ${O} : ${m}.test(${n}))`;
        return (0, Ee._)`${m} && ${m} !== true && ${_} === ${t} && !${T}`;
      }
    }
    function $() {
      const y = h.formats[a];
      if (!y) {
        E();
        return;
      }
      if (y === !0)
        return;
      const [g, _, m] = P(y);
      g === t && e.pass(O());
      function E() {
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
        if (typeof y == "object" && !(y instanceof RegExp) && y.async) {
          if (!u.$async)
            throw new Error("async format in sync schema");
          return (0, Ee._)`await ${m}(${n})`;
        }
        return typeof _ == "function" ? (0, Ee._)`${m}(${n})` : (0, Ee._)`${m}.test(${n})`;
      }
    }
  }
};
Wo.default = J_;
Object.defineProperty(Jo, "__esModule", { value: !0 });
const W_ = Wo, X_ = [W_.default];
Jo.default = X_;
var gr = {};
Object.defineProperty(gr, "__esModule", { value: !0 });
gr.contentVocabulary = gr.metadataVocabulary = void 0;
gr.metadataVocabulary = [
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
gr.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
Object.defineProperty(_o, "__esModule", { value: !0 });
const Y_ = vo, Q_ = Eo, Z_ = Co, x_ = Jo, ic = gr, ev = [
  Y_.default,
  Q_.default,
  (0, Z_.default)(),
  x_.default,
  ic.metadataVocabulary,
  ic.contentVocabulary
];
_o.default = ev;
var Xo = {}, ds = {};
Object.defineProperty(ds, "__esModule", { value: !0 });
ds.DiscrError = void 0;
var cc;
(function(e) {
  e.Tag = "tag", e.Mapping = "mapping";
})(cc || (ds.DiscrError = cc = {}));
Object.defineProperty(Xo, "__esModule", { value: !0 });
const lr = se, Zs = ds, lc = Ge, tv = is(), rv = F, nv = {
  message: ({ params: { discrError: e, tagName: t } }) => e === Zs.DiscrError.Tag ? `tag "${t}" must be string` : `value of tag "${t}" must be in oneOf`,
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
    t.if((0, lr._)`typeof ${d} == "string"`, () => u(), () => e.error(!1, { discrError: Zs.DiscrError.Tag, tag: d, tagName: c })), e.ok(l);
    function u() {
      const $ = w();
      t.if(!1);
      for (const y in $)
        t.elseIf((0, lr._)`${d} === ${y}`), t.assign(l, h($[y]));
      t.else(), e.error(!1, { discrError: Zs.DiscrError.Mapping, tag: d, tagName: c }), t.endIf();
    }
    function h($) {
      const y = t.name("valid"), g = e.subschema({ keyword: "oneOf", schemaProp: $ }, y);
      return e.mergeEvaluated(g, lr.Name), y;
    }
    function w() {
      var $;
      const y = {}, g = m(s);
      let _ = !0;
      for (let O = 0; O < o.length; O++) {
        let T = o[O];
        if (T != null && T.$ref && !(0, rv.schemaHasRulesButRef)(T, a.self.RULES)) {
          const Y = T.$ref;
          if (T = lc.resolveRef.call(a.self, a.schemaEnv.root, a.baseId, Y), T instanceof lc.SchemaEnv && (T = T.schema), T === void 0)
            throw new tv.default(a.opts.uriResolver, a.baseId, Y);
        }
        const K = ($ = T == null ? void 0 : T.properties) === null || $ === void 0 ? void 0 : $[c];
        if (typeof K != "object")
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${c}"`);
        _ = _ && (g || m(T)), E(K, O);
      }
      if (!_)
        throw new Error(`discriminator: "${c}" must be required`);
      return y;
      function m({ required: O }) {
        return Array.isArray(O) && O.includes(c);
      }
      function E(O, T) {
        if (O.const)
          P(O.const, T);
        else if (O.enum)
          for (const K of O.enum)
            P(K, T);
        else
          throw new Error(`discriminator: "properties/${c}" must have "const" or "enum"`);
      }
      function P(O, T) {
        if (typeof O != "string" || O in y)
          throw new Error(`discriminator: "${c}" values must be unique strings`);
        y[O] = T;
      }
    }
  }
};
Xo.default = sv;
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
  const r = Gl, n = _o, s = Xo, a = dv, o = ["/properties"], c = "http://json-schema.org/draft-07/schema";
  class l extends r.default {
    _addVocabularies() {
      super._addVocabularies(), n.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(s.default);
    }
    _addDefaultMetaSchema() {
      if (super._addDefaultMetaSchema(), !this.opts.meta)
        return;
      const y = this.opts.$data ? this.$dataMetaSchema(a, o) : a;
      this.addMetaSchema(y, c, !1), this.refs["http://json-schema.org/schema"] = c;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
    }
  }
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var d = os();
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
  var h = $o();
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return h.default;
  } });
  var w = is();
  Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
    return w.default;
  } });
})(Hs, Hs.exports);
var fv = Hs.exports;
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
  const t = fv, r = se, n = r.operators, s = {
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
      const { gen: l, data: d, schemaCode: u, keyword: h, it: w } = c, { opts: $, self: y } = w;
      if (!$.validateFormats)
        return;
      const g = new t.KeywordCxt(w, y.RULES.all.format.definition, "format");
      g.$data ? _() : m();
      function _() {
        const P = l.scopeValue("formats", {
          ref: y.formats,
          code: $.code.formats
        }), O = l.const("fmt", (0, r._)`${P}[${g.schemaCode}]`);
        c.fail$data((0, r.or)((0, r._)`typeof ${O} != "object"`, (0, r._)`${O} instanceof RegExp`, (0, r._)`typeof ${O}.compare != "function"`, E(O)));
      }
      function m() {
        const P = g.schema, O = y.formats[P];
        if (!O || O === !0)
          return;
        if (typeof O != "object" || O instanceof RegExp || typeof O.compare != "function")
          throw new Error(`"${h}": format "${P}" does not define "compare" function`);
        const T = l.scopeValue("formats", {
          key: P,
          ref: O,
          code: $.code.formats ? (0, r._)`${$.code.formats}${(0, r.getProperty)(P)}` : void 0
        });
        c.fail$data(E(T));
      }
      function E(P) {
        return (0, r._)`${P}.compare(${d}, ${u}) ${s[h].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
  const o = (c) => (c.addKeyword(e.formatLimitDefinition), c);
  e.default = o;
})(ql);
(function(e, t) {
  Object.defineProperty(t, "__esModule", { value: !0 });
  const r = Ul, n = ql, s = se, a = new s.Name("fullFormats"), o = new s.Name("fastFormats"), c = (d, u = { keywords: !0 }) => {
    if (Array.isArray(u))
      return l(d, u, r.fullFormats, a), d;
    const [h, w] = u.mode === "fast" ? [r.fastFormats, o] : [r.fullFormats, a], $ = u.formats || r.formatNames;
    return l(d, $, h, w), u.keywords && (0, n.default)(d), d;
  };
  c.get = (d, u = "full") => {
    const w = (u === "fast" ? r.fastFormats : r.fullFormats)[d];
    if (!w)
      throw new Error(`Unknown format "${d}"`);
    return w;
  };
  function l(d, u, h, w) {
    var $, y;
    ($ = (y = d.opts.code).formats) !== null && $ !== void 0 || (y.formats = (0, s._)`require("ajv-formats/dist/formats").${w}`);
    for (const g of u)
      d.addFormat(g, h[g]);
  }
  e.exports = t = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
})(Ks, Ks.exports);
var hv = Ks.exports;
const mv = /* @__PURE__ */ Uc(hv), pv = (e, t, r, n) => {
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
const uc = (e, t = {}) => {
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
    const h = this, w = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), a && (l = e.apply(h, u));
    }, $ = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), a && (l = e.apply(h, u));
    }, y = s && !o;
    return clearTimeout(o), o = setTimeout(w, r), n > 0 && n !== Number.POSITIVE_INFINITY && !c && (c = setTimeout($, n)), y && (l = e.apply(h, u)), l;
  };
  return Ev(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), c && (clearTimeout(c), c = void 0);
  }, d;
};
var xs = { exports: {} };
const bv = "2.0.0", pu = 256, Sv = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Pv = 16, Nv = pu - 6, Rv = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var fs = {
  MAX_LENGTH: pu,
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
  const w = "[a-zA-Z0-9-]", $ = [
    ["\\s", 1],
    ["\\d", s],
    [w, n]
  ], y = (_) => {
    for (const [m, E] of $)
      _ = _.split(`${m}*`).join(`${m}{0,${E}}`).split(`${m}+`).join(`${m}{1,${E}}`);
    return _;
  }, g = (_, m, E) => {
    const P = y(m), O = h++;
    a(_, O, m), u[_] = O, l[O] = m, d[O] = P, o[O] = new RegExp(m, E ? "g" : void 0), c[O] = new RegExp(P, E ? "g" : void 0);
  };
  g("NUMERICIDENTIFIER", "0|[1-9]\\d*"), g("NUMERICIDENTIFIERLOOSE", "\\d+"), g("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${w}*`), g("MAINVERSION", `(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})\\.(${l[u.NUMERICIDENTIFIER]})`), g("MAINVERSIONLOOSE", `(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})\\.(${l[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASEIDENTIFIER", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIER]})`), g("PRERELEASEIDENTIFIERLOOSE", `(?:${l[u.NONNUMERICIDENTIFIER]}|${l[u.NUMERICIDENTIFIERLOOSE]})`), g("PRERELEASE", `(?:-(${l[u.PRERELEASEIDENTIFIER]}(?:\\.${l[u.PRERELEASEIDENTIFIER]})*))`), g("PRERELEASELOOSE", `(?:-?(${l[u.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[u.PRERELEASEIDENTIFIERLOOSE]})*))`), g("BUILDIDENTIFIER", `${w}+`), g("BUILD", `(?:\\+(${l[u.BUILDIDENTIFIER]}(?:\\.${l[u.BUILDIDENTIFIER]})*))`), g("FULLPLAIN", `v?${l[u.MAINVERSION]}${l[u.PRERELEASE]}?${l[u.BUILD]}?`), g("FULL", `^${l[u.FULLPLAIN]}$`), g("LOOSEPLAIN", `[v=\\s]*${l[u.MAINVERSIONLOOSE]}${l[u.PRERELEASELOOSE]}?${l[u.BUILD]}?`), g("LOOSE", `^${l[u.LOOSEPLAIN]}$`), g("GTLT", "((?:<|>)?=?)"), g("XRANGEIDENTIFIERLOOSE", `${l[u.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), g("XRANGEIDENTIFIER", `${l[u.NUMERICIDENTIFIER]}|x|X|\\*`), g("XRANGEPLAIN", `[v=\\s]*(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:\\.(${l[u.XRANGEIDENTIFIER]})(?:${l[u.PRERELEASE]})?${l[u.BUILD]}?)?)?`), g("XRANGEPLAINLOOSE", `[v=\\s]*(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[u.XRANGEIDENTIFIERLOOSE]})(?:${l[u.PRERELEASELOOSE]})?${l[u.BUILD]}?)?)?`), g("XRANGE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAIN]}$`), g("XRANGELOOSE", `^${l[u.GTLT]}\\s*${l[u.XRANGEPLAINLOOSE]}$`), g("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), g("COERCE", `${l[u.COERCEPLAIN]}(?:$|[^\\d])`), g("COERCEFULL", l[u.COERCEPLAIN] + `(?:${l[u.PRERELEASE]})?(?:${l[u.BUILD]})?(?:$|[^\\d])`), g("COERCERTL", l[u.COERCE], !0), g("COERCERTLFULL", l[u.COERCEFULL], !0), g("LONETILDE", "(?:~>?)"), g("TILDETRIM", `(\\s*)${l[u.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", g("TILDE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAIN]}$`), g("TILDELOOSE", `^${l[u.LONETILDE]}${l[u.XRANGEPLAINLOOSE]}$`), g("LONECARET", "(?:\\^)"), g("CARETTRIM", `(\\s*)${l[u.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", g("CARET", `^${l[u.LONECARET]}${l[u.XRANGEPLAIN]}$`), g("CARETLOOSE", `^${l[u.LONECARET]}${l[u.XRANGEPLAINLOOSE]}$`), g("COMPARATORLOOSE", `^${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]})$|^$`), g("COMPARATOR", `^${l[u.GTLT]}\\s*(${l[u.FULLPLAIN]})$|^$`), g("COMPARATORTRIM", `(\\s*)${l[u.GTLT]}\\s*(${l[u.LOOSEPLAIN]}|${l[u.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", g("HYPHENRANGE", `^\\s*(${l[u.XRANGEPLAIN]})\\s+-\\s+(${l[u.XRANGEPLAIN]})\\s*$`), g("HYPHENRANGELOOSE", `^\\s*(${l[u.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[u.XRANGEPLAINLOOSE]})\\s*$`), g("STAR", "(<|>)?=?\\s*\\*"), g("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), g("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(xs, xs.exports);
var nn = xs.exports;
const Iv = Object.freeze({ loose: !0 }), Tv = Object.freeze({}), jv = (e) => e ? typeof e != "object" ? Iv : e : Tv;
var Yo = jv;
const dc = /^[0-9]+$/, $u = (e, t) => {
  const r = dc.test(e), n = dc.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, kv = (e, t) => $u(t, e);
var yu = {
  compareIdentifiers: $u,
  rcompareIdentifiers: kv
};
const _n = hs, { MAX_LENGTH: fc, MAX_SAFE_INTEGER: vn } = fs, { safeRe: wn, t: En } = nn, Av = Yo, { compareIdentifiers: ar } = yu;
let Cv = class it {
  constructor(t, r) {
    if (r = Av(r), t instanceof it) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > fc)
      throw new TypeError(
        `version is longer than ${fc} characters`
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
    if (_n("SemVer.compare", this.version, this.options, t), !(t instanceof it)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new it(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof it || (t = new it(t, this.options)), ar(this.major, t.major) || ar(this.minor, t.minor) || ar(this.patch, t.patch);
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
    t instanceof it || (t = new it(t, this.options));
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
var ze = Cv;
const hc = ze, Dv = (e, t, r = !1) => {
  if (e instanceof hc)
    return e;
  try {
    return new hc(e, t);
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
const mc = ze, qv = (e, t, r, n, s) => {
  typeof r == "string" && (s = n, n = r, r = void 0);
  try {
    return new mc(
      e instanceof mc ? e.version : e,
      r
    ).inc(t, n, s).version;
  } catch {
    return null;
  }
};
var Gv = qv;
const pc = Nr, Kv = (e, t) => {
  const r = pc(e, null, !0), n = pc(t, null, !0), s = r.compare(n);
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
const Bv = ze, Jv = (e, t) => new Bv(e, t).major;
var Wv = Jv;
const Xv = ze, Yv = (e, t) => new Xv(e, t).minor;
var Qv = Yv;
const Zv = ze, xv = (e, t) => new Zv(e, t).patch;
var ew = xv;
const tw = Nr, rw = (e, t) => {
  const r = tw(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var nw = rw;
const $c = ze, sw = (e, t, r) => new $c(e, r).compare(new $c(t, r));
var st = sw;
const aw = st, ow = (e, t, r) => aw(t, e, r);
var iw = ow;
const cw = st, lw = (e, t) => cw(e, t, !0);
var uw = lw;
const yc = ze, dw = (e, t, r) => {
  const n = new yc(e, r), s = new yc(t, r);
  return n.compare(s) || n.compareBuild(s);
};
var Qo = dw;
const fw = Qo, hw = (e, t) => e.sort((r, n) => fw(r, n, t));
var mw = hw;
const pw = Qo, $w = (e, t) => e.sort((r, n) => pw(n, r, t));
var yw = $w;
const gw = st, _w = (e, t, r) => gw(e, t, r) > 0;
var ms = _w;
const vw = st, ww = (e, t, r) => vw(e, t, r) < 0;
var Zo = ww;
const Ew = st, bw = (e, t, r) => Ew(e, t, r) === 0;
var gu = bw;
const Sw = st, Pw = (e, t, r) => Sw(e, t, r) !== 0;
var _u = Pw;
const Nw = st, Rw = (e, t, r) => Nw(e, t, r) >= 0;
var xo = Rw;
const Ow = st, Iw = (e, t, r) => Ow(e, t, r) <= 0;
var ei = Iw;
const Tw = gu, jw = _u, kw = ms, Aw = xo, Cw = Zo, Dw = ei, Mw = (e, t, r, n) => {
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
var vu = Mw;
const Lw = ze, Vw = Nr, { safeRe: bn, t: Sn } = nn, Fw = (e, t) => {
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
var qw = Uw, Is, gc;
function at() {
  if (gc) return Is;
  gc = 1;
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
            if (J.length === 1 && _(J[0])) {
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
      const V = ((this.options.includePrerelease && $) | (this.options.loose && y)) + ":" + D, J = n.get(V);
      if (J)
        return J;
      const z = this.options.loose, N = z ? l[d.HYPHENRANGELOOSE] : l[d.HYPHENRANGE];
      D = D.replace(N, X(this.options.includePrerelease)), o("hyphen replace", D), D = D.replace(l[d.COMPARATORTRIM], u), o("comparator trim", D), D = D.replace(l[d.TILDETRIM], h), o("tilde trim", D), D = D.replace(l[d.CARETTRIM], w), o("caret trim", D);
      let p = D.split(" ").map((f) => E(f, this.options)).join(" ").split(/\s+/).map((f) => G(f, this.options));
      z && (p = p.filter((f) => (o("loose invalid filter", f, this.options), !!f.match(l[d.COMPARATORLOOSE])))), o("range list", p);
      const S = /* @__PURE__ */ new Map(), v = p.map((f) => new a(f, this.options));
      for (const f of v) {
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
        if (Q(this.set[U], D, this.options))
          return !0;
      return !1;
    }
  }
  Is = t;
  const r = qw, n = new r(), s = Yo, a = ps(), o = hs, c = ze, {
    safeRe: l,
    t: d,
    comparatorTrimReplace: u,
    tildeTrimReplace: h,
    caretTrimReplace: w
  } = nn, { FLAG_INCLUDE_PRERELEASE: $, FLAG_LOOSE: y } = fs, g = (j) => j.value === "<0.0.0-0", _ = (j) => j.value === "", m = (j, D) => {
    let U = !0;
    const V = j.slice();
    let J = V.pop();
    for (; U && V.length; )
      U = V.every((z) => J.intersects(z, D)), J = V.pop();
    return U;
  }, E = (j, D) => (o("comp", j, D), j = K(j, D), o("caret", j), j = O(j, D), o("tildes", j), j = le(j, D), o("xrange", j), j = ge(j, D), o("stars", j), j), P = (j) => !j || j.toLowerCase() === "x" || j === "*", O = (j, D) => j.trim().split(/\s+/).map((U) => T(U, D)).join(" "), T = (j, D) => {
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
      let v;
      return P(z) ? v = "" : P(N) ? v = `>=${z}.0.0${V} <${+z + 1}.0.0-0` : P(p) ? z === "0" ? v = `>=${z}.${N}.0${V} <${z}.${+N + 1}.0-0` : v = `>=${z}.${N}.0${V} <${+z + 1}.0.0-0` : S ? (o("replaceCaret pr", S), z === "0" ? N === "0" ? v = `>=${z}.${N}.${p}-${S} <${z}.${N}.${+p + 1}-0` : v = `>=${z}.${N}.${p}-${S} <${z}.${+N + 1}.0-0` : v = `>=${z}.${N}.${p}-${S} <${+z + 1}.0.0-0`) : (o("no pr"), z === "0" ? N === "0" ? v = `>=${z}.${N}.${p}${V} <${z}.${N}.${+p + 1}-0` : v = `>=${z}.${N}.${p}${V} <${z}.${+N + 1}.0-0` : v = `>=${z}.${N}.${p} <${+z + 1}.0.0-0`), o("caret return", v), v;
    });
  }, le = (j, D) => (o("replaceXRanges", j, D), j.split(/\s+/).map((U) => he(U, D)).join(" ")), he = (j, D) => {
    j = j.trim();
    const U = D.loose ? l[d.XRANGELOOSE] : l[d.XRANGE];
    return j.replace(U, (V, J, z, N, p, S) => {
      o("xRange", j, V, J, z, N, p, S);
      const v = P(z), i = v || P(N), f = i || P(p), b = f;
      return J === "=" && b && (J = ""), S = D.includePrerelease ? "-0" : "", v ? J === ">" || J === "<" ? V = "<0.0.0-0" : V = "*" : J && b ? (i && (N = 0), p = 0, J === ">" ? (J = ">=", i ? (z = +z + 1, N = 0, p = 0) : (N = +N + 1, p = 0)) : J === "<=" && (J = "<", i ? z = +z + 1 : N = +N + 1), J === "<" && (S = "-0"), V = `${J + z}.${N}.${p}${S}`) : i ? V = `>=${z}.0.0${S} <${+z + 1}.0.0-0` : f && (V = `>=${z}.${N}.0${S} <${z}.${+N + 1}.0-0`), o("xRange return", V), V;
    });
  }, ge = (j, D) => (o("replaceStars", j, D), j.trim().replace(l[d.STAR], "")), G = (j, D) => (o("replaceGTE0", j, D), j.trim().replace(l[D.includePrerelease ? d.GTE0PRE : d.GTE0], "")), X = (j) => (D, U, V, J, z, N, p, S, v, i, f, b) => (P(V) ? U = "" : P(J) ? U = `>=${V}.0.0${j ? "-0" : ""}` : P(z) ? U = `>=${V}.${J}.0${j ? "-0" : ""}` : N ? U = `>=${U}` : U = `>=${U}${j ? "-0" : ""}`, P(v) ? S = "" : P(i) ? S = `<${+v + 1}.0.0-0` : P(f) ? S = `<${v}.${+i + 1}.0-0` : b ? S = `<=${v}.${i}.${f}-${b}` : j ? S = `<${v}.${i}.${+f + 1}-0` : S = `<=${S}`, `${U} ${S}`.trim()), Q = (j, D, U) => {
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
  return Is;
}
var Ts, _c;
function ps() {
  if (_c) return Ts;
  _c = 1;
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
      const h = this.options.loose ? n[s.COMPARATORLOOSE] : n[s.COMPARATOR], w = u.match(h);
      if (!w)
        throw new TypeError(`Invalid comparator: ${u}`);
      this.operator = w[1] !== void 0 ? w[1] : "", this.operator === "=" && (this.operator = ""), w[2] ? this.semver = new c(w[2], this.options.loose) : this.semver = e;
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
  Ts = t;
  const r = Yo, { safeRe: n, t: s } = nn, a = vu, o = hs, c = ze, l = at();
  return Ts;
}
const Gw = at(), Kw = (e, t, r) => {
  try {
    t = new Gw(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var $s = Kw;
const Hw = at(), Bw = (e, t) => new Hw(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var Jw = Bw;
const Ww = ze, Xw = at(), Yw = (e, t, r) => {
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
const Zw = ze, xw = at(), eE = (e, t, r) => {
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
const js = ze, rE = at(), vc = ms, nE = (e, t) => {
  e = new rE(e, t);
  let r = new js("0.0.0");
  if (e.test(r) || (r = new js("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const s = e.set[n];
    let a = null;
    s.forEach((o) => {
      const c = new js(o.semver.version);
      switch (o.operator) {
        case ">":
          c.prerelease.length === 0 ? c.patch++ : c.prerelease.push(0), c.raw = c.format();
        case "":
        case ">=":
          (!a || vc(c, a)) && (a = c);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${o.operator}`);
      }
    }), a && (!r || vc(r, a)) && (r = a);
  }
  return r && e.test(r) ? r : null;
};
var sE = nE;
const aE = at(), oE = (e, t) => {
  try {
    return new aE(e, t).range || "*";
  } catch {
    return null;
  }
};
var iE = oE;
const cE = ze, wu = ps(), { ANY: lE } = wu, uE = at(), dE = $s, wc = ms, Ec = Zo, fE = ei, hE = xo, mE = (e, t, r, n) => {
  e = new cE(e, n), t = new uE(t, n);
  let s, a, o, c, l;
  switch (r) {
    case ">":
      s = wc, a = fE, o = Ec, c = ">", l = ">=";
      break;
    case "<":
      s = Ec, a = hE, o = wc, c = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (dE(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const u = t.set[d];
    let h = null, w = null;
    if (u.forEach(($) => {
      $.semver === lE && ($ = new wu(">=0.0.0")), h = h || $, w = w || $, s($.semver, h.semver, n) ? h = $ : o($.semver, w.semver, n) && (w = $);
    }), h.operator === c || h.operator === l || (!w.operator || w.operator === c) && a(e, w.semver))
      return !1;
    if (w.operator === l && o(e, w.semver))
      return !1;
  }
  return !0;
};
var ti = mE;
const pE = ti, $E = (e, t, r) => pE(e, t, ">", r);
var yE = $E;
const gE = ti, _E = (e, t, r) => gE(e, t, "<", r);
var vE = _E;
const bc = at(), wE = (e, t, r) => (e = new bc(e, r), t = new bc(t, r), e.intersects(t, r));
var EE = wE;
const bE = $s, SE = st;
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
const Sc = at(), ri = ps(), { ANY: ks } = ri, Lr = $s, ni = st, NE = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Sc(e, r), t = new Sc(t, r);
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
}, RE = [new ri(">=0.0.0-0")], Pc = [new ri(">=0.0.0")], OE = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === ks) {
    if (t.length === 1 && t[0].semver === ks)
      return !0;
    r.includePrerelease ? e = RE : e = Pc;
  }
  if (t.length === 1 && t[0].semver === ks) {
    if (r.includePrerelease)
      return !0;
    t = Pc;
  }
  const n = /* @__PURE__ */ new Set();
  let s, a;
  for (const $ of e)
    $.operator === ">" || $.operator === ">=" ? s = Nc(s, $, r) : $.operator === "<" || $.operator === "<=" ? a = Rc(a, $, r) : n.add($.semver);
  if (n.size > 1)
    return null;
  let o;
  if (s && a) {
    if (o = ni(s.semver, a.semver, r), o > 0)
      return null;
    if (o === 0 && (s.operator !== ">=" || a.operator !== "<="))
      return null;
  }
  for (const $ of n) {
    if (s && !Lr($, String(s), r) || a && !Lr($, String(a), r))
      return null;
    for (const y of t)
      if (!Lr($, String(y), r))
        return !1;
    return !0;
  }
  let c, l, d, u, h = a && !r.includePrerelease && a.semver.prerelease.length ? a.semver : !1, w = s && !r.includePrerelease && s.semver.prerelease.length ? s.semver : !1;
  h && h.prerelease.length === 1 && a.operator === "<" && h.prerelease[0] === 0 && (h = !1);
  for (const $ of t) {
    if (u = u || $.operator === ">" || $.operator === ">=", d = d || $.operator === "<" || $.operator === "<=", s) {
      if (w && $.semver.prerelease && $.semver.prerelease.length && $.semver.major === w.major && $.semver.minor === w.minor && $.semver.patch === w.patch && (w = !1), $.operator === ">" || $.operator === ">=") {
        if (c = Nc(s, $, r), c === $ && c !== s)
          return !1;
      } else if (s.operator === ">=" && !Lr(s.semver, String($), r))
        return !1;
    }
    if (a) {
      if (h && $.semver.prerelease && $.semver.prerelease.length && $.semver.major === h.major && $.semver.minor === h.minor && $.semver.patch === h.patch && (h = !1), $.operator === "<" || $.operator === "<=") {
        if (l = Rc(a, $, r), l === $ && l !== a)
          return !1;
      } else if (a.operator === "<=" && !Lr(a.semver, String($), r))
        return !1;
    }
    if (!$.operator && (a || s) && o !== 0)
      return !1;
  }
  return !(s && d && !a && o !== 0 || a && u && !s && o !== 0 || w || h);
}, Nc = (e, t, r) => {
  if (!e)
    return t;
  const n = ni(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, Rc = (e, t, r) => {
  if (!e)
    return t;
  const n = ni(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var IE = NE;
const As = nn, Oc = fs, TE = ze, Ic = yu, jE = Nr, kE = Vv, AE = Uv, CE = Gv, DE = Hv, ME = Wv, LE = Qv, VE = ew, FE = nw, zE = st, UE = iw, qE = uw, GE = Qo, KE = mw, HE = yw, BE = ms, JE = Zo, WE = gu, XE = _u, YE = xo, QE = ei, ZE = vu, xE = zw, eb = ps(), tb = at(), rb = $s, nb = Jw, sb = Qw, ab = tE, ob = sE, ib = iE, cb = ti, lb = yE, ub = vE, db = EE, fb = PE, hb = IE;
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
  re: As.re,
  src: As.src,
  tokens: As.t,
  SEMVER_SPEC_VERSION: Oc.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Oc.RELEASE_TYPES,
  compareIdentifiers: Ic.compareIdentifiers,
  rcompareIdentifiers: Ic.rcompareIdentifiers
};
const or = /* @__PURE__ */ Uc(mb), pb = Object.prototype.toString, $b = "[object Uint8Array]", yb = "[object ArrayBuffer]";
function Eu(e, t, r) {
  return e ? e.constructor === t ? !0 : pb.call(e) === r : !1;
}
function bu(e) {
  return Eu(e, Uint8Array, $b);
}
function gb(e) {
  return Eu(e, ArrayBuffer, yb);
}
function _b(e) {
  return bu(e) || gb(e);
}
function vb(e) {
  if (!bu(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function wb(e) {
  if (!_b(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Tc(e, t) {
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
function jc(e, t = "utf8") {
  return wb(e), Pn[t] ?? (Pn[t] = new globalThis.TextDecoder(t)), Pn[t].decode(e);
}
function Eb(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const bb = new globalThis.TextEncoder();
function Cs(e) {
  return Eb(e), bb.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const Sb = mv.default, kc = "aes-256-cbc", ir = () => /* @__PURE__ */ Object.create(null), Pb = (e) => e != null, Nb = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, Dn = "__internal__", Ds = `${Dn}.migrations.version`;
var At, yt, He, gt;
class Rb {
  constructor(t = {}) {
    Ir(this, "path");
    Ir(this, "events");
    Tr(this, At);
    Tr(this, yt);
    Tr(this, He);
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
      r.cwd = Fu(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (jr(this, He, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const o = new Gy.Ajv2020({
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
    this.path = ue.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const s = this.store, a = Object.assign(ir(), r.defaults, s);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(a);
    try {
      Iu.deepEqual(s, a);
    } catch {
      this.store = a;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if ($e(this, He).accessPropertiesByDotNotation)
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
      Nb(a, o), $e(this, He).accessPropertiesByDotNotation ? oi(n, a, o) : n[a] = o;
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
    return $e(this, He).accessPropertiesByDotNotation ? Du(this.store, t) : t in this.store;
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
    $e(this, He).accessPropertiesByDotNotation ? Cu(r, t) : delete r[t], this.store = r;
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
      const t = ne.readFileSync(this.path, $e(this, yt) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(ir(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), ir();
      if ($e(this, He).clearInvalidConfig && t.name === "SyntaxError")
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
      return typeof t == "string" ? t : jc(t);
    try {
      const r = t.slice(0, 16), n = kr.pbkdf2Sync($e(this, yt), r.toString(), 1e4, 32, "sha512"), s = kr.createDecipheriv(kc, n, r), a = t.slice(17), o = typeof a == "string" ? Cs(a) : a;
      return jc(Tc([s.update(o), s.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Ou(o, a) || (n = o, r.call(this, o, a));
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
    ne.mkdirSync(ue.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if ($e(this, yt)) {
      const n = kr.randomBytes(16), s = kr.pbkdf2Sync($e(this, yt), n.toString(), 1e4, 32, "sha512"), a = kr.createCipheriv(kc, s, n);
      r = Tc([n, Cs(":"), a.update(Cs(r)), a.final()]);
    }
    if (Pe.env.SNAP)
      ne.writeFileSync(this.path, r, { mode: $e(this, He).configFileMode });
    else
      try {
        zc(this.path, r, { mode: $e(this, He).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          ne.writeFileSync(this.path, r, { mode: $e(this, He).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), ne.existsSync(this.path) || this._write(ir()), Pe.platform === "win32" ? ne.watch(this.path, { persistent: !1 }, uc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : ne.watchFile(this.path, { persistent: !1 }, uc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let s = this._get(Ds, "0.0.0");
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
        l == null || l(this), this._set(Ds, c), s = c, o = { ...this.store };
      } catch (l) {
        throw this.store = o, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${l}`);
      }
    (this._isVersionInRangeFormat(s) || !or.eq(s, r)) && this._set(Ds, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === Dn ? !0 : typeof t != "string" ? !1 : $e(this, He).accessPropertiesByDotNotation ? !!t.startsWith(`${Dn}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return or.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && or.satisfies(r, t) ? !1 : or.satisfies(n, t) : !(or.lte(t, r) || or.gt(t, n));
  }
  _get(t, r) {
    return Au(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    oi(n, t, r), this.store = n;
  }
}
At = new WeakMap(), yt = new WeakMap(), He = new WeakMap(), gt = new WeakMap();
const { app: Mn, ipcMain: ea, shell: Ob } = Mc;
let Ac = !1;
const Cc = () => {
  if (!ea || !Mn)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: Mn.getPath("userData"),
    appVersion: Mn.getVersion()
  };
  return Ac || (ea.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Ac = !0), e;
};
class Ib extends Rb {
  constructor(t) {
    let r, n;
    if (Pe.type === "renderer") {
      const s = Mc.ipcRenderer.sendSync("electron-store-get-data");
      if (!s)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = s);
    } else ea && Mn && ({ defaultCwd: r, appVersion: n } = Cc());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = ue.isAbsolute(t.cwd) ? t.cwd : ue.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    Cc();
  }
  async openInEditor() {
    const t = await Ob.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const pr = ae.dirname(Tu(import.meta.url));
process.env.APP_ROOT = ae.join(pr, "..");
const ta = process.env.VITE_DEV_SERVER_URL, Kb = ae.join(process.env.APP_ROOT, "dist-electron"), Su = ae.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = ta ? ae.join(process.env.APP_ROOT, "public") : Su;
let ce, Ln = null;
const dt = /* @__PURE__ */ new Map();
let Mt = null;
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
ft.handle("save-data", async (e, t, r) => {
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
});
ft.handle("load-data", async () => {
  try {
    return Vn.get("formData", Xn);
  } catch (e) {
    return console.error("Erro ao carregar dados:", e), Xn;
  }
});
ft.handle("select-folder", async () => {
  const e = await Lc.showOpenDialog(ce, {
    properties: ["openDirectory"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhuma pasta selecionada"), null;
  const t = e.filePaths[0];
  return console.log("Pasta selecionada:", t), t;
});
ft.handle("select-file", async () => {
  const e = await Lc.showOpenDialog(ce, {
    properties: ["openFile"]
  });
  if (e.canceled || e.filePaths.length === 0)
    return console.log("Nenhum arquivo selecionado"), null;
  const t = e.filePaths[0];
  return console.log("Arquivo selecionado:", t), t;
});
ft.handle("clean-db", async () => (console.log("Limpando banco de dados..."), new Promise((e) => {
  setTimeout(() => {
    console.log("Banco de dados limpo com sucesso"), e(!0);
  }, 1e3);
})));
ft.handle("print-pdf", async (e, t) => {
  try {
    const r = new ra({
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
ft.handle("start-fork", async (e, { script: t, args: r = [] } = {}) => {
  const n = ae.dirname(ae.dirname(pr));
  t || (t = "../back-end/dist/src/index.js");
  let s;
  if (ae.isAbsolute(t))
    s = t;
  else {
    const a = [
      // Prefer IPC-only CJS build
      ae.join(n, "back-end", "dist", "index.js"),
      // Fallback to full build structure if present
      ae.join(n, "back-end", "dist", "src", "index.js"),
      // TypeScript source (will use ts-node)
      ae.join(n, "back-end", "src", "index.ts"),
      // Original provided script path fallbacks
      ae.join(pr, t),
      ae.join(process.env.APP_ROOT || "", t),
      ae.join(ae.dirname(pr), t),
      ae.join(n, t),
      ae.resolve(t)
    ];
    console.log("Trying paths:", a), s = a.find((o) => {
      try {
        const c = _t.existsSync(o);
        return console.log(`Path ${o} exists: ${c}`), c;
      } catch {
        return !1;
      }
    }) || a[0];
  }
  console.log("Attempting to fork script at:", s), console.log("Script exists:", _t.existsSync(s));
  try {
    const a = ae.join(n, "Frontend", "backend");
    if (s.startsWith(a)) {
      const c = [
        ae.join(n, "back-end", "dist", "index.js"),
        ae.join(n, "back-end", "dist", "src", "index.js"),
        ae.join(n, "back-end", "src", "index.ts"),
        ae.join(n, "back-end", "src", "index.js")
      ].find((l) => _t.existsSync(l));
      c ? (console.log("Replacing frontend shim script with real backend entry:", c), s = c) : console.log("No real backend entry found, will attempt to fork provided script (may fail if AMD-wrapped)");
    }
  } catch {
  }
  try {
    const a = ae.dirname(s);
    let o = a, c = !1;
    for (; o && o !== ae.dirname(o); ) {
      const u = ae.join(o, "package.json");
      if (_t.existsSync(u))
        try {
          if (JSON.parse(_t.readFileSync(u, "utf8")).name === "backend") {
            c = !0;
            break;
          }
        } catch {
        }
      o = ae.dirname(o);
    }
    c || (o = a), console.log("Setting child process cwd to:", o), Ln = s;
    const l = na(s, r, {
      stdio: ["pipe", "pipe", "ipc"],
      cwd: o,
      silent: !1,
      env: { ...process.env }
    }), d = l.pid;
    if (console.log("Child process forked with PID:", d), typeof d == "number")
      dt.set(d, l), console.log("Child process added to children map. Total children:", dt.size);
    else
      return console.error("Child process PID is undefined"), { ok: !1, reason: "fork-failed-no-pid" };
    return new Promise((u, h) => {
      const w = setTimeout(() => {
        h(new Error("Timeout waiting for WebSocket port from backend"));
      }, 1e4), $ = (y) => {
        y && y.type === "websocket-port" && typeof y.port == "number" && (clearTimeout(w), l.off("message", $), u({ ok: !0, port: y.port, pid: d }));
      };
      l.on("message", $), l.on("error", (y) => {
        console.error("Child process error:", y), typeof l.pid == "number" && dt.delete(l.pid), clearTimeout(w), h(y);
      }), l.on("exit", (y, g) => {
        console.log(`Child process ${l.pid} exited with code ${y} and signal ${g}`), typeof l.pid == "number" && dt.delete(l.pid), ce && !ce.isDestroyed() && ce.webContents.send("child-exit", { pid: l.pid, code: y, signal: g }), clearTimeout(w), h(new Error(`Child process exited with code ${y}`));
      }), l.on("message", (y) => {
        console.log("Message from child:", y), !(y && typeof y == "object" && "type" in y && y.type === "websocket-port") && ce && !ce.isDestroyed() && ce.webContents.send("child-message", { pid: l.pid, msg: y });
      }), l.stdout && l.stdout.on("data", (y) => {
        console.log("Child stdout:", y.toString()), ce && !ce.isDestroyed() && ce.webContents.send("child-stdout", { pid: l.pid, data: y.toString() });
      }), l.stderr && l.stderr.on("data", (y) => {
        console.error("Child stderr:", y.toString()), ce && !ce.isDestroyed() && ce.webContents.send("child-stderr", { pid: l.pid, data: y.toString() });
      });
    });
  } catch (a) {
    return console.error("Failed to fork child process:", a), { ok: !1, reason: `fork-error: ${a}` };
  }
});
ft.handle("start-collector-fork", async (e, { args: t = [] } = {}) => {
  const r = ae.dirname(ae.dirname(pr)), n = [
    ae.join(r, "back-end", "dist", "src", "collector", "runner.js"),
    ae.join(r, "back-end", "dist", "collector", "runner.js"),
    ae.join(r, "back-end", "src", "collector", "runner.ts")
  ], s = n.find((a) => _t.existsSync(a)) || n[0];
  if (!_t.existsSync(s)) return { ok: !1, reason: "collector-not-found", attempted: n };
  try {
    const a = na(s, t, { stdio: ["pipe", "pipe", "ipc"], cwd: ae.dirname(s), env: { ...process.env } }), o = a.pid;
    return typeof o == "number" && (dt.set(o, a), a.on("message", (c) => {
      ce && !ce.isDestroyed() && ce.webContents.send("child-message", { pid: o, msg: c });
    }), a.stdout && a.stdout.on("data", (c) => {
      ce && !ce.isDestroyed() && ce.webContents.send("child-stdout", { pid: o, data: c.toString() });
    }), a.stderr && a.stderr.on("data", (c) => {
      ce && !ce.isDestroyed() && ce.webContents.send("child-stderr", { pid: o, data: c.toString() });
    })), { ok: !0, pid: o };
  } catch (a) {
    return { ok: !1, reason: String(a) };
  }
});
ft.handle("send-to-child", async (e, { pid: t, msg: r } = {}) => {
  if (console.log("send-to-child called with PID:", t, "Message type:", r == null ? void 0 : r.type), console.log("Available children PIDs:", Array.from(dt.keys())), typeof t != "number") return { ok: !1, reason: "invalid-pid" };
  const n = dt.get(t);
  if (!n) {
    if (console.log("Child not found for PID:", t), Ln)
      try {
        const s = ae.dirname(Ln), a = na(Ln, [], { stdio: ["pipe", "pipe", "ipc"], cwd: s, silent: !1, env: { ...process.env } }), o = a.pid;
        if (typeof o == "number") {
          dt.set(o, a), ce && !ce.isDestroyed() && ce.webContents.send("child-message", { pid: o, msg: { type: "event", event: "reforked", payload: { oldPid: t, newPid: o } } });
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
});
ft.handle("stop-child", async (e, { pid: t } = {}) => {
  if (typeof t != "number") return { ok: !1, reason: "invalid-pid" };
  const r = dt.get(t);
  if (!r) return { ok: !1, reason: "not-found" };
  try {
    return r.kill("SIGTERM"), { ok: !0 };
  } catch (n) {
    return { ok: !1, reason: String(n) };
  }
});
function Dc() {
  ce = new ra({
    icon: ae.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: ae.join(pr, "preload.mjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), ce.maximize(), ce.webContents.on("did-finish-load", () => {
    ce == null || ce.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), ta ? ce.loadURL(ta) : ce.loadFile(ae.join(Su, "index.html"));
}
Qt.whenReady().then(() => {
  (async () => {
    if (Qt.isPackaged)
      try {
        const e = ae.join(process.resourcesPath, "backend", "backend.exe");
        _t.existsSync(e) ? (console.log("[main] Spawning packaged backend exe at", e), Mt = ju(e, [], { env: { ...process.env, FRONTEND_API_PORT: process.env.FRONTEND_API_PORT || "3000" }, cwd: process.resourcesPath }), Mt.stdout.on("data", (t) => console.log("[backend exe stdout]", t.toString())), Mt.stderr.on("data", (t) => console.error("[backend exe stderr]", t.toString())), Mt.on("exit", (t) => console.log("[backend exe] exited", t))) : console.warn("[main] packaged backend exe not found at", e);
      } catch (e) {
        console.error("[main] failed to spawn packaged backend exe", e);
      }
    else
      try {
        console.log("[main] running in development mode, backend fork will be started by renderer when needed");
      } catch (e) {
        console.warn("[main] dev auto-start failed", e);
      }
    Dc();
  })(), Qt.on("activate", () => {
    ra.getAllWindows().length === 0 && Dc();
  });
});
Qt.on("window-all-closed", () => {
  process.platform !== "darwin" && Qt.quit();
});
Qt.on("before-quit", () => {
  try {
    Mt && !Mt.killed && (Mt.kill(), Mt = null);
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, e] of dt.entries())
    try {
      e.kill("SIGTERM");
    } catch {
    }
});
const Tb = ae.join(Qt.getPath("userData"), "error.log"), Pu = _t.createWriteStream(Tb, { flags: "a" });
process.on("uncaughtException", (e) => {
  Pu.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${e.stack}
`);
});
process.on("unhandledRejection", (e) => {
  Pu.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${e}
`);
});
export {
  Kb as MAIN_DIST,
  Su as RENDERER_DIST,
  ta as VITE_DEV_SERVER_URL
};
