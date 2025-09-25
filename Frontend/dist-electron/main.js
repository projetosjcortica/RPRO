<<<<<<< HEAD
var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _validator, _encryptionKey, _options, _defaultValues;
import electron, { ipcMain as ipcMain$1, dialog, BrowserWindow, app as app$1 } from "electron";
import * as path from "path";
import process$1 from "node:process";
import path$1 from "node:path";
import { promisify, isDeepStrictEqual } from "node:util";
import fs from "node:fs";
import crypto from "node:crypto";
import assert from "node:assert";
import os from "node:os";
import fs$1 from "fs";
import { fileURLToPath } from "url";
import { fork, spawn } from "child_process";
const isObject = (value) => {
  const type2 = typeof value;
  return value !== null && (type2 === "object" || type2 === "function");
};
const disallowedKeys = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]);
const digits = new Set("0123456789");
function getPathSegments(path2) {
  const parts = [];
  let currentSegment = "";
  let currentPart = "start";
  let isIgnoring = false;
  for (const character of path2) {
    switch (character) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      case "\\": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (isIgnoring) {
          currentSegment += character;
        }
        currentPart = "property";
        isIgnoring = !isIgnoring;
        break;
      }
      case ".": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "property";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
<<<<<<< HEAD
        if (disallowedKeys.has(currentSegment)) {
=======
        if (gs.has(r))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
          return [];
        }
        parts.push(currentSegment);
        currentSegment = "";
        currentPart = "property";
        break;
      }
      case "[": {
        if (currentPart === "index") {
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          currentPart = "index";
          break;
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += character;
          break;
        }
<<<<<<< HEAD
        if (currentPart === "property") {
          if (disallowedKeys.has(currentSegment)) {
=======
        if (n === "property") {
          if (gs.has(r))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
            return [];
          }
          parts.push(currentSegment);
          currentSegment = "";
        }
        currentPart = "index";
        break;
      }
      case "]": {
        if (currentPart === "index") {
          parts.push(Number.parseInt(currentSegment, 10));
          currentSegment = "";
          currentPart = "indexEnd";
          break;
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
      }
      default: {
<<<<<<< HEAD
        if (currentPart === "index" && !digits.has(character)) {
=======
        if (n === "index" && !ku.has(a))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
          throw new Error("Invalid character in an index");
        }
        if (currentPart === "indexEnd") {
          throw new Error("Invalid character after an index");
        }
        if (currentPart === "start") {
          currentPart = "property";
        }
        if (isIgnoring) {
          isIgnoring = false;
          currentSegment += "\\";
        }
        currentSegment += character;
      }
    }
  }
  if (isIgnoring) {
    currentSegment += "\\";
  }
  switch (currentPart) {
    case "property": {
<<<<<<< HEAD
      if (disallowedKeys.has(currentSegment)) {
=======
      if (gs.has(r))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        return [];
      }
      parts.push(currentSegment);
      break;
    }
    case "index": {
      throw new Error("Index was not closed");
    }
    case "start": {
      parts.push("");
      break;
    }
  }
  return parts;
}
function isStringIndex(object, key) {
  if (typeof key !== "number" && Array.isArray(object)) {
    const index = Number.parseInt(key, 10);
    return Number.isInteger(index) && object[index] === object[key];
  }
  return false;
}
<<<<<<< HEAD
function assertNotStringIndex(object, key) {
  if (isStringIndex(object, key)) {
=======
function Vc(e, t) {
  if (sa(e, t))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    throw new Error("Cannot use string index");
  }
}
<<<<<<< HEAD
function getProperty(object, path2, value) {
  if (!isObject(object) || typeof path2 !== "string") {
    return value === void 0 ? object : value;
  }
  const pathArray = getPathSegments(path2);
  if (pathArray.length === 0) {
    return value;
  }
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    if (isStringIndex(object, key)) {
      object = index === pathArray.length - 1 ? void 0 : null;
    } else {
      object = object[key];
    }
    if (object === void 0 || object === null) {
      if (index !== pathArray.length - 1) {
        return value;
      }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      break;
    }
  }
  return object === void 0 ? value : object;
}
<<<<<<< HEAD
function setProperty(object, path2, value) {
  if (!isObject(object) || typeof path2 !== "string") {
    return object;
=======
function oi(e, t, r) {
  if (!Zt(e) || typeof t != "string")
    return e;
  const n = e, s = Qn(t);
  for (let a = 0; a < s.length; a++) {
    const o = s[a];
    Vc(e, o), a === s.length - 1 ? e[o] = r : Zt(e[o]) || (e[o] = typeof s[a + 1] == "number" ? [] : {}), e = e[o];
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  const root = object;
  const pathArray = getPathSegments(path2);
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      object[key] = value;
    } else if (!isObject(object[key])) {
      object[key] = typeof pathArray[index + 1] === "number" ? [] : {};
    }
    object = object[key];
  }
  return root;
}
<<<<<<< HEAD
function deleteProperty(object, path2) {
  if (!isObject(object) || typeof path2 !== "string") {
    return false;
  }
  const pathArray = getPathSegments(path2);
  for (let index = 0; index < pathArray.length; index++) {
    const key = pathArray[index];
    assertNotStringIndex(object, key);
    if (index === pathArray.length - 1) {
      delete object[key];
      return true;
    }
    object = object[key];
    if (!isObject(object)) {
      return false;
    }
  }
}
function hasProperty(object, path2) {
  if (!isObject(object) || typeof path2 !== "string") {
    return false;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  const pathArray = getPathSegments(path2);
  if (pathArray.length === 0) {
    return false;
  }
  for (const key of pathArray) {
    if (!isObject(object) || !(key in object) || isStringIndex(object, key)) {
      return false;
    }
    object = object[key];
  }
  return true;
}
<<<<<<< HEAD
const homedir = os.homedir();
const tmpdir = os.tmpdir();
const { env } = process$1;
const macos = (name) => {
  const library = path$1.join(homedir, "Library");
=======
const kt = Yn.homedir(), aa = Yn.tmpdir(), { env: ur } = Pe, Mu = (e) => {
  const t = ue.join(kt, "Library");
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  return {
    data: path$1.join(library, "Application Support", name),
    config: path$1.join(library, "Preferences", name),
    cache: path$1.join(library, "Caches", name),
    log: path$1.join(library, "Logs", name),
    temp: path$1.join(tmpdir, name)
  };
<<<<<<< HEAD
};
const windows = (name) => {
  const appData = env.APPDATA || path$1.join(homedir, "AppData", "Roaming");
  const localAppData = env.LOCALAPPDATA || path$1.join(homedir, "AppData", "Local");
=======
}, Lu = (e) => {
  const t = ur.APPDATA || ue.join(kt, "AppData", "Roaming"), r = ur.LOCALAPPDATA || ue.join(kt, "AppData", "Local");
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: path$1.join(localAppData, name, "Data"),
    config: path$1.join(appData, name, "Config"),
    cache: path$1.join(localAppData, name, "Cache"),
    log: path$1.join(localAppData, name, "Log"),
    temp: path$1.join(tmpdir, name)
  };
<<<<<<< HEAD
};
const linux = (name) => {
  const username = path$1.basename(homedir);
  return {
    data: path$1.join(env.XDG_DATA_HOME || path$1.join(homedir, ".local", "share"), name),
    config: path$1.join(env.XDG_CONFIG_HOME || path$1.join(homedir, ".config"), name),
    cache: path$1.join(env.XDG_CACHE_HOME || path$1.join(homedir, ".cache"), name),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: path$1.join(env.XDG_STATE_HOME || path$1.join(homedir, ".local", "state"), name),
    temp: path$1.join(tmpdir, username, name)
  };
};
function envPaths(name, { suffix = "nodejs" } = {}) {
  if (typeof name !== "string") {
    throw new TypeError(`Expected a string, got ${typeof name}`);
  }
  if (suffix) {
    name += `-${suffix}`;
  }
  if (process$1.platform === "darwin") {
    return macos(name);
  }
  if (process$1.platform === "win32") {
    return windows(name);
  }
  return linux(name);
}
const attemptifyAsync = (fn, onError) => {
  return function attemptified(...args) {
    return fn.apply(void 0, args).catch(onError);
  };
};
const attemptifySync = (fn, onError) => {
  return function attemptified(...args) {
    try {
      return fn.apply(void 0, args);
    } catch (error2) {
      return onError(error2);
    }
  };
};
const IS_USER_ROOT = process$1.getuid ? !process$1.getuid() : false;
const LIMIT_FILES_DESCRIPTORS = 1e4;
const NOOP = () => void 0;
const Handlers = {
  /* API */
  isChangeErrorOk: (error2) => {
    if (!Handlers.isNodeError(error2))
      return false;
    const { code: code2 } = error2;
    if (code2 === "ENOSYS")
      return true;
    if (!IS_USER_ROOT && (code2 === "EINVAL" || code2 === "EPERM"))
      return true;
    return false;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  },
  isNodeError: (error2) => {
    return error2 instanceof Error;
  },
  isRetriableError: (error2) => {
    if (!Handlers.isNodeError(error2))
      return false;
    const { code: code2 } = error2;
    if (code2 === "EMFILE" || code2 === "ENFILE" || code2 === "EAGAIN" || code2 === "EBUSY" || code2 === "EACCESS" || code2 === "EACCES" || code2 === "EACCS" || code2 === "EPERM")
      return true;
    return false;
  },
  onChangeError: (error2) => {
    if (!Handlers.isNodeError(error2))
      throw error2;
    if (Handlers.isChangeErrorOk(error2))
      return;
    throw error2;
  }
};
<<<<<<< HEAD
class RetryfyQueue {
  constructor() {
    this.interval = 25;
    this.intervalId = void 0;
    this.limit = LIMIT_FILES_DESCRIPTORS;
    this.queueActive = /* @__PURE__ */ new Set();
    this.queueWaiting = /* @__PURE__ */ new Set();
    this.init = () => {
      if (this.intervalId)
        return;
      this.intervalId = setInterval(this.tick, this.interval);
    };
    this.reset = () => {
      if (!this.intervalId)
        return;
      clearInterval(this.intervalId);
      delete this.intervalId;
    };
    this.add = (fn) => {
      this.queueWaiting.add(fn);
      if (this.queueActive.size < this.limit / 2) {
        this.tick();
      } else {
        this.init();
      }
    };
    this.remove = (fn) => {
      this.queueWaiting.delete(fn);
      this.queueActive.delete(fn);
    };
    this.schedule = () => {
      return new Promise((resolve2) => {
        const cleanup = () => this.remove(resolver);
        const resolver = () => resolve2(cleanup);
        this.add(resolver);
      });
    };
    this.tick = () => {
      if (this.queueActive.size >= this.limit)
        return;
      if (!this.queueWaiting.size)
        return this.reset();
      for (const fn of this.queueWaiting) {
        if (this.queueActive.size >= this.limit)
          break;
        this.queueWaiting.delete(fn);
        this.queueActive.add(fn);
        fn();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
    };
  }
}
<<<<<<< HEAD
const RetryfyQueue$1 = new RetryfyQueue();
const retryifyAsync = (fn, isRetriableError) => {
  return function retrified(timestamp) {
    return function attempt(...args) {
      return RetryfyQueue$1.schedule().then((cleanup) => {
        const onResolve = (result) => {
          cleanup();
          return result;
        };
        const onReject = (error2) => {
          cleanup();
          if (Date.now() >= timestamp)
            throw error2;
          if (isRetriableError(error2)) {
            const delay = Math.round(100 * Math.random());
            const delayPromise = new Promise((resolve2) => setTimeout(resolve2, delay));
            return delayPromise.then(() => attempt.apply(void 0, args));
          }
          throw error2;
        };
        return fn.apply(void 0, args).then(onResolve, onReject);
      });
    };
  };
};
const retryifySync = (fn, isRetriableError) => {
  return function retrified(timestamp) {
    return function attempt(...args) {
      try {
        return fn.apply(void 0, args);
      } catch (error2) {
        if (Date.now() > timestamp)
          throw error2;
        if (isRetriableError(error2))
          return attempt.apply(void 0, args);
        throw error2;
      }
    };
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  };
};
const FS = {
  attempt: {
    /* ASYNC */
<<<<<<< HEAD
    chmod: attemptifyAsync(promisify(fs.chmod), Handlers.onChangeError),
    chown: attemptifyAsync(promisify(fs.chown), Handlers.onChangeError),
    close: attemptifyAsync(promisify(fs.close), NOOP),
    fsync: attemptifyAsync(promisify(fs.fsync), NOOP),
    mkdir: attemptifyAsync(promisify(fs.mkdir), NOOP),
    realpath: attemptifyAsync(promisify(fs.realpath), NOOP),
    stat: attemptifyAsync(promisify(fs.stat), NOOP),
    unlink: attemptifyAsync(promisify(fs.unlink), NOOP),
    /* SYNC */
    chmodSync: attemptifySync(fs.chmodSync, Handlers.onChangeError),
    chownSync: attemptifySync(fs.chownSync, Handlers.onChangeError),
    closeSync: attemptifySync(fs.closeSync, NOOP),
    existsSync: attemptifySync(fs.existsSync, NOOP),
    fsyncSync: attemptifySync(fs.fsync, NOOP),
    mkdirSync: attemptifySync(fs.mkdirSync, NOOP),
    realpathSync: attemptifySync(fs.realpathSync, NOOP),
    statSync: attemptifySync(fs.statSync, NOOP),
    unlinkSync: attemptifySync(fs.unlinkSync, NOOP)
  },
  retry: {
    /* ASYNC */
    close: retryifyAsync(promisify(fs.close), Handlers.isRetriableError),
    fsync: retryifyAsync(promisify(fs.fsync), Handlers.isRetriableError),
    open: retryifyAsync(promisify(fs.open), Handlers.isRetriableError),
    readFile: retryifyAsync(promisify(fs.readFile), Handlers.isRetriableError),
    rename: retryifyAsync(promisify(fs.rename), Handlers.isRetriableError),
    stat: retryifyAsync(promisify(fs.stat), Handlers.isRetriableError),
    write: retryifyAsync(promisify(fs.write), Handlers.isRetriableError),
    writeFile: retryifyAsync(promisify(fs.writeFile), Handlers.isRetriableError),
    /* SYNC */
    closeSync: retryifySync(fs.closeSync, Handlers.isRetriableError),
    fsyncSync: retryifySync(fs.fsyncSync, Handlers.isRetriableError),
    openSync: retryifySync(fs.openSync, Handlers.isRetriableError),
    readFileSync: retryifySync(fs.readFileSync, Handlers.isRetriableError),
    renameSync: retryifySync(fs.renameSync, Handlers.isRetriableError),
    statSync: retryifySync(fs.statSync, Handlers.isRetriableError),
    writeSync: retryifySync(fs.writeSync, Handlers.isRetriableError),
    writeFileSync: retryifySync(fs.writeFileSync, Handlers.isRetriableError)
  }
};
const DEFAULT_ENCODING = "utf8";
const DEFAULT_FILE_MODE = 438;
const DEFAULT_FOLDER_MODE = 511;
const DEFAULT_WRITE_OPTIONS = {};
const DEFAULT_USER_UID = os.userInfo().uid;
const DEFAULT_USER_GID = os.userInfo().gid;
const DEFAULT_TIMEOUT_SYNC = 1e3;
const IS_POSIX = !!process$1.getuid;
process$1.getuid ? !process$1.getuid() : false;
const LIMIT_BASENAME_LENGTH = 128;
const isException = (value) => {
  return value instanceof Error && "code" in value;
};
const isString = (value) => {
  return typeof value === "string";
};
const isUndefined = (value) => {
  return value === void 0;
};
const IS_LINUX = process$1.platform === "linux";
const IS_WINDOWS = process$1.platform === "win32";
const Signals = ["SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM"];
if (!IS_WINDOWS) {
  Signals.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
}
if (IS_LINUX) {
  Signals.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
}
class Interceptor {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set();
    this.exited = false;
    this.exit = (signal) => {
      if (this.exited)
        return;
      this.exited = true;
      for (const callback of this.callbacks) {
        callback();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
      if (signal) {
        if (IS_WINDOWS && (signal !== "SIGINT" && signal !== "SIGTERM" && signal !== "SIGKILL")) {
          process$1.kill(process$1.pid, "SIGTERM");
        } else {
          process$1.kill(process$1.pid, signal);
        }
      }
    };
    this.hook = () => {
      process$1.once("exit", () => this.exit());
      for (const signal of Signals) {
        try {
          process$1.once(signal, () => this.exit(signal));
        } catch {
        }
      }
    };
    this.register = (callback) => {
      this.callbacks.add(callback);
      return () => {
        this.callbacks.delete(callback);
      };
    };
    this.hook();
  }
}
<<<<<<< HEAD
const Interceptor$1 = new Interceptor();
const whenExit = Interceptor$1.register;
const Temp = {
=======
const ed = new xu(), td = ed.register, Me = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  /* VARIABLES */
  store: {},
  /* API */
  create: (filePath) => {
    const randomness = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6);
    const timestamp = Date.now().toString().slice(-10);
    const prefix = "tmp-";
    const suffix = `.${prefix}${timestamp}${randomness}`;
    const tempPath = `${filePath}${suffix}`;
    return tempPath;
  },
  get: (filePath, creator, purge = true) => {
    const tempPath = Temp.truncate(creator(filePath));
    if (tempPath in Temp.store)
      return Temp.get(filePath, creator, purge);
    Temp.store[tempPath] = purge;
    const disposer = () => delete Temp.store[tempPath];
    return [tempPath, disposer];
  },
  purge: (filePath) => {
    if (!Temp.store[filePath])
      return;
    delete Temp.store[filePath];
    FS.attempt.unlink(filePath);
  },
  purgeSync: (filePath) => {
    if (!Temp.store[filePath])
      return;
    delete Temp.store[filePath];
    FS.attempt.unlinkSync(filePath);
  },
  purgeSyncAll: () => {
    for (const filePath in Temp.store) {
      Temp.purgeSync(filePath);
    }
  },
<<<<<<< HEAD
  truncate: (filePath) => {
    const basename = path$1.basename(filePath);
    if (basename.length <= LIMIT_BASENAME_LENGTH)
      return filePath;
    const truncable = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(basename);
    if (!truncable)
      return filePath;
    const truncationLength = basename.length - LIMIT_BASENAME_LENGTH;
    return `${filePath.slice(0, -basename.length)}${truncable[1]}${truncable[2].slice(0, -truncationLength)}${truncable[3]}`;
  }
};
whenExit(Temp.purgeSyncAll);
function writeFileSync(filePath, data, options = DEFAULT_WRITE_OPTIONS) {
  if (isString(options))
    return writeFileSync(filePath, data, { encoding: options });
  const timeout = Date.now() + ((options.timeout ?? DEFAULT_TIMEOUT_SYNC) || -1);
  let tempDisposer = null;
  let tempPath = null;
  let fd = null;
  try {
    const filePathReal = FS.attempt.realpathSync(filePath);
    const filePathExists = !!filePathReal;
    filePath = filePathReal || filePath;
    [tempPath, tempDisposer] = Temp.get(filePath, options.tmpCreate || Temp.create, !(options.tmpPurge === false));
    const useStatChown = IS_POSIX && isUndefined(options.chown);
    const useStatMode = isUndefined(options.mode);
    if (filePathExists && (useStatChown || useStatMode)) {
      const stats = FS.attempt.statSync(filePath);
      if (stats) {
        options = { ...options };
        if (useStatChown) {
          options.chown = { uid: stats.uid, gid: stats.gid };
        }
        if (useStatMode) {
          options.mode = stats.mode;
        }
      }
    }
    if (!filePathExists) {
      const parentPath = path$1.dirname(filePath);
      FS.attempt.mkdirSync(parentPath, {
        mode: DEFAULT_FOLDER_MODE,
        recursive: true
      });
    }
    fd = FS.retry.openSync(timeout)(tempPath, "w", options.mode || DEFAULT_FILE_MODE);
    if (options.tmpCreated) {
      options.tmpCreated(tempPath);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    if (isString(data)) {
      FS.retry.writeSync(timeout)(fd, data, 0, options.encoding || DEFAULT_ENCODING);
    } else if (!isUndefined(data)) {
      FS.retry.writeSync(timeout)(fd, data, 0, data.length, 0);
    }
    if (options.fsync !== false) {
      if (options.fsyncWait !== false) {
        FS.retry.fsyncSync(timeout)(fd);
      } else {
        FS.attempt.fsync(fd);
      }
    }
    FS.retry.closeSync(timeout)(fd);
    fd = null;
    if (options.chown && (options.chown.uid !== DEFAULT_USER_UID || options.chown.gid !== DEFAULT_USER_GID)) {
      FS.attempt.chownSync(tempPath, options.chown.uid, options.chown.gid);
    }
    if (options.mode && options.mode !== DEFAULT_FILE_MODE) {
      FS.attempt.chmodSync(tempPath, options.mode);
    }
    try {
      FS.retry.renameSync(timeout)(tempPath, filePath);
    } catch (error2) {
      if (!isException(error2))
        throw error2;
      if (error2.code !== "ENAMETOOLONG")
        throw error2;
      FS.retry.renameSync(timeout)(tempPath, Temp.truncate(filePath));
    }
    tempDisposer();
    tempPath = null;
  } finally {
    if (fd)
      FS.attempt.closeSync(fd);
    if (tempPath)
      Temp.purge(tempPath);
  }
}
<<<<<<< HEAD
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var _2020 = { exports: {} };
var core$6 = {};
var validate$1 = {};
var boolSchema$1 = {};
var errors$1 = {};
var codegen$1 = {};
var code$3 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
  class _CodeOrName {
=======
function Uc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var Ms = { exports: {} }, qc = {}, nt = {}, $r = {}, Zr = {}, ee = {}, Yr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  exports._CodeOrName = _CodeOrName;
  exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class Name extends _CodeOrName {
    constructor(s) {
      super();
      if (!exports.IDENTIFIER.test(s))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = s;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return false;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  exports.Name = Name;
  class _Code extends _CodeOrName {
    constructor(code2) {
      super();
      this._items = typeof code2 === "string" ? [code2] : code2;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return false;
      const item = this._items[0];
      return item === "" || item === '""';
    }
    get str() {
      var _a;
      return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
    }
    get names() {
      var _a;
      return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names2, c) => {
        if (c instanceof Name)
          names2[c.str] = (names2[c.str] || 0) + 1;
        return names2;
      }, {});
    }
  }
  exports._Code = _Code;
  exports.nil = new _Code("");
  function _(strs, ...args) {
    const code2 = [strs[0]];
    let i = 0;
    while (i < args.length) {
      addCodeArg(code2, args[i]);
      code2.push(strs[++i]);
    }
    return new _Code(code2);
  }
  exports._ = _;
  const plus = new _Code("+");
  function str(strs, ...args) {
    const expr = [safeStringify(strs[0])];
    let i = 0;
    while (i < args.length) {
      expr.push(plus);
      addCodeArg(expr, args[i]);
      expr.push(plus, safeStringify(strs[++i]));
    }
    optimize(expr);
    return new _Code(expr);
  }
  exports.str = str;
  function addCodeArg(code2, arg) {
    if (arg instanceof _Code)
      code2.push(...arg._items);
    else if (arg instanceof Name)
      code2.push(arg);
    else
      code2.push(interpolate(arg));
  }
  exports.addCodeArg = addCodeArg;
  function optimize(expr) {
    let i = 1;
    while (i < expr.length - 1) {
      if (expr[i] === plus) {
        const res = mergeExprItems(expr[i - 1], expr[i + 1]);
        if (res !== void 0) {
          expr.splice(i - 1, 3, res);
          continue;
        }
        expr[i++] = "+";
      }
      i++;
    }
  }
  function mergeExprItems(a, b) {
    if (b === '""')
      return a;
    if (a === '""')
      return b;
    if (typeof a == "string") {
      if (b instanceof Name || a[a.length - 1] !== '"')
        return;
      if (typeof b != "string")
        return `${a.slice(0, -1)}${b}"`;
      if (b[0] === '"')
        return a.slice(0, -1) + b.slice(1);
      return;
    }
    if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
      return `"${a}${b.slice(1)}`;
    return;
  }
  function strConcat(c1, c2) {
    return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
  }
  exports.strConcat = strConcat;
  function interpolate(x) {
    return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
  }
  function stringify(x) {
    return new _Code(safeStringify(x));
  }
  exports.stringify = stringify;
  function safeStringify(x) {
    return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  exports.safeStringify = safeStringify;
  function getProperty2(key) {
    return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
  }
  exports.getProperty = getProperty2;
  function getEsmExportName(key) {
    if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
      return new _Code(`${key}`);
    }
    throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
  }
  exports.getEsmExportName = getEsmExportName;
  function regexpCode(rx) {
    return new _Code(rx.toString());
  }
<<<<<<< HEAD
  exports.regexpCode = regexpCode;
})(code$3);
var scope$1 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
  const code_12 = code$3;
  class ValueError extends Error {
    constructor(name) {
      super(`CodeGen: "code" for ${name} not defined`);
      this.value = name.value;
=======
  e.regexpCode = _;
})(Yr);
var Ls = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Yr;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
  }
  var UsedValueState;
  (function(UsedValueState2) {
    UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
    UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
  })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
  exports.varKinds = {
    const: new code_12.Name("const"),
    let: new code_12.Name("let"),
    var: new code_12.Name("var")
  };
  class Scope {
    constructor({ prefixes, parent } = {}) {
      this._names = {};
      this._prefixes = prefixes;
      this._parent = parent;
    }
    toName(nameOrPrefix) {
      return nameOrPrefix instanceof code_12.Name ? nameOrPrefix : this.name(nameOrPrefix);
    }
    name(prefix) {
      return new code_12.Name(this._newName(prefix));
    }
    _newName(prefix) {
      const ng = this._names[prefix] || this._nameGroup(prefix);
      return `${prefix}${ng.index++}`;
    }
    _nameGroup(prefix) {
      var _a, _b;
      if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
        throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
      }
      return this._names[prefix] = { prefix, index: 0 };
    }
  }
  exports.Scope = Scope;
  class ValueScopeName extends code_12.Name {
    constructor(prefix, nameStr) {
      super(nameStr);
      this.prefix = prefix;
    }
    setValue(value, { property, itemIndex }) {
      this.value = value;
      this.scopePath = (0, code_12._)`.${new code_12.Name(property)}[${itemIndex}]`;
    }
  }
  exports.ValueScopeName = ValueScopeName;
  const line = (0, code_12._)`\n`;
  class ValueScope extends Scope {
    constructor(opts) {
      super(opts);
      this._values = {};
      this._scope = opts.scope;
      this.opts = { ...opts, _n: opts.lines ? line : code_12.nil };
    }
    get() {
      return this._scope;
    }
    name(prefix) {
      return new ValueScopeName(prefix, this._newName(prefix));
    }
    value(nameOrPrefix, value) {
      var _a;
      if (value.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const name = this.toName(nameOrPrefix);
      const { prefix } = name;
      const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
      let vs = this._values[prefix];
      if (vs) {
        const _name = vs.get(valueKey);
        if (_name)
          return _name;
      } else {
        vs = this._values[prefix] = /* @__PURE__ */ new Map();
      }
      vs.set(valueKey, name);
      const s = this._scope[prefix] || (this._scope[prefix] = []);
      const itemIndex = s.length;
      s[itemIndex] = value.ref;
      name.setValue(value, { property: prefix, itemIndex });
      return name;
    }
    getValue(prefix, keyOrRef) {
      const vs = this._values[prefix];
      if (!vs)
        return;
      return vs.get(keyOrRef);
    }
    scopeRefs(scopeName, values = this._values) {
      return this._reduceValues(values, (name) => {
        if (name.scopePath === void 0)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return (0, code_12._)`${scopeName}${name.scopePath}`;
      });
    }
    scopeCode(values = this._values, usedValues, getCode) {
      return this._reduceValues(values, (name) => {
        if (name.value === void 0)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return name.value.code;
      }, usedValues, getCode);
    }
    _reduceValues(values, valueCode, usedValues = {}, getCode) {
      let code2 = code_12.nil;
      for (const prefix in values) {
        const vs = values[prefix];
        if (!vs)
          continue;
        const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
        vs.forEach((name) => {
          if (nameSet.has(name))
            return;
          nameSet.set(name, UsedValueState.Started);
          let c = valueCode(name);
          if (c) {
            const def2 = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
            code2 = (0, code_12._)`${code2}${def2} ${name} = ${c};${this.opts._n}`;
          } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
            code2 = (0, code_12._)`${code2}${c}${this.opts._n}`;
          } else {
            throw new ValueError(name);
          }
          nameSet.set(name, UsedValueState.Completed);
        });
      }
      return code2;
    }
  }
<<<<<<< HEAD
  exports.ValueScope = ValueScope;
})(scope$1);
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
  const code_12 = code$3;
  const scope_1 = scope$1;
  var code_2 = code$3;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return code_2._;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return code_2.str;
  } });
  Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
    return code_2.strConcat;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return code_2.nil;
  } });
  Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
    return code_2.getProperty;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return code_2.stringify;
  } });
  Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
    return code_2.regexpCode;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return code_2.Name;
  } });
  var scope_2 = scope$1;
  Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
    return scope_2.Scope;
  } });
  Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
    return scope_2.ValueScope;
  } });
  Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
    return scope_2.ValueScopeName;
  } });
  Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
    return scope_2.varKinds;
  } });
  exports.operators = {
    GT: new code_12._Code(">"),
    GTE: new code_12._Code(">="),
    LT: new code_12._Code("<"),
    LTE: new code_12._Code("<="),
    EQ: new code_12._Code("==="),
    NEQ: new code_12._Code("!=="),
    NOT: new code_12._Code("!"),
    OR: new code_12._Code("||"),
    AND: new code_12._Code("&&"),
    ADD: new code_12._Code("+")
  };
  class Node {
    optimizeNodes() {
      return this;
    }
    optimizeNames(_names, _constants) {
      return this;
    }
  }
  class Def extends Node {
    constructor(varKind, name, rhs) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.rhs = rhs;
    }
    render({ es5, _n }) {
      const varKind = es5 ? scope_1.varKinds.var : this.varKind;
      const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${varKind} ${this.name}${rhs};` + _n;
    }
    optimizeNames(names2, constants2) {
      if (!names2[this.name.str])
        return;
      if (this.rhs)
        this.rhs = optimizeExpr(this.rhs, names2, constants2);
      return this;
    }
    get names() {
      return this.rhs instanceof code_12._CodeOrName ? this.rhs.names : {};
    }
  }
  class Assign extends Node {
    constructor(lhs, rhs, sideEffects) {
      super();
      this.lhs = lhs;
      this.rhs = rhs;
      this.sideEffects = sideEffects;
    }
    render({ _n }) {
      return `${this.lhs} = ${this.rhs};` + _n;
    }
    optimizeNames(names2, constants2) {
      if (this.lhs instanceof code_12.Name && !names2[this.lhs.str] && !this.sideEffects)
        return;
      this.rhs = optimizeExpr(this.rhs, names2, constants2);
      return this;
    }
    get names() {
      const names2 = this.lhs instanceof code_12.Name ? {} : { ...this.lhs.names };
      return addExprNames(names2, this.rhs);
    }
  }
  class AssignOp extends Assign {
    constructor(lhs, op, rhs, sideEffects) {
      super(lhs, rhs, sideEffects);
      this.op = op;
    }
    render({ _n }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
    }
  }
  class Label extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      return `${this.label}:` + _n;
    }
  }
  class Break extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      const label = this.label ? ` ${this.label}` : "";
      return `break${label};` + _n;
    }
  }
  class Throw extends Node {
    constructor(error2) {
      super();
      this.error = error2;
    }
    render({ _n }) {
      return `throw ${this.error};` + _n;
    }
    get names() {
      return this.error.names;
    }
  }
  class AnyCode extends Node {
    constructor(code2) {
      super();
      this.code = code2;
    }
    render({ _n }) {
      return `${this.code};` + _n;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(names2, constants2) {
      this.code = optimizeExpr(this.code, names2, constants2);
      return this;
    }
    get names() {
      return this.code instanceof code_12._CodeOrName ? this.code.names : {};
    }
  }
  class ParentNode extends Node {
    constructor(nodes = []) {
      super();
      this.nodes = nodes;
    }
    render(opts) {
      return this.nodes.reduce((code2, n) => code2 + n.render(opts), "");
    }
    optimizeNodes() {
      const { nodes } = this;
      let i = nodes.length;
      while (i--) {
        const n = nodes[i].optimizeNodes();
        if (Array.isArray(n))
          nodes.splice(i, 1, ...n);
        else if (n)
          nodes[i] = n;
        else
          nodes.splice(i, 1);
      }
      return nodes.length > 0 ? this : void 0;
    }
    optimizeNames(names2, constants2) {
      const { nodes } = this;
      let i = nodes.length;
      while (i--) {
        const n = nodes[i];
        if (n.optimizeNames(names2, constants2))
          continue;
        subtractNames(names2, n.names);
        nodes.splice(i, 1);
      }
      return nodes.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((names2, n) => addNames(names2, n.names), {});
    }
  }
  class BlockNode extends ParentNode {
    render(opts) {
      return "{" + opts._n + super.render(opts) + "}" + opts._n;
    }
  }
  class Root extends ParentNode {
  }
  class Else extends BlockNode {
  }
  Else.kind = "else";
  class If extends BlockNode {
    constructor(condition, nodes) {
      super(nodes);
      this.condition = condition;
    }
    render(opts) {
      let code2 = `if(${this.condition})` + super.render(opts);
      if (this.else)
        code2 += "else " + this.else.render(opts);
      return code2;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const cond = this.condition;
      if (cond === true)
        return this.nodes;
      let e = this.else;
      if (e) {
        const ns = e.optimizeNodes();
        e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
      }
      if (e) {
        if (cond === false)
          return e instanceof If ? e : e.nodes;
        if (this.nodes.length)
          return this;
        return new If(not2(cond), e instanceof If ? [e] : e.nodes);
      }
      if (cond === false || !this.nodes.length)
        return void 0;
      return this;
    }
    optimizeNames(names2, constants2) {
      var _a;
      this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names2, constants2);
      if (!(super.optimizeNames(names2, constants2) || this.else))
        return;
      this.condition = optimizeExpr(this.condition, names2, constants2);
      return this;
    }
    get names() {
      const names2 = super.names;
      addExprNames(names2, this.condition);
      if (this.else)
        addNames(names2, this.else.names);
      return names2;
    }
  }
  If.kind = "if";
  class For extends BlockNode {
  }
  For.kind = "for";
  class ForLoop extends For {
    constructor(iteration) {
      super();
      this.iteration = iteration;
    }
    render(opts) {
      return `for(${this.iteration})` + super.render(opts);
    }
    optimizeNames(names2, constants2) {
      if (!super.optimizeNames(names2, constants2))
        return;
      this.iteration = optimizeExpr(this.iteration, names2, constants2);
      return this;
    }
    get names() {
      return addNames(super.names, this.iteration.names);
    }
  }
  class ForRange extends For {
    constructor(varKind, name, from, to) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.from = from;
      this.to = to;
    }
    render(opts) {
      const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
      const { name, from, to } = this;
      return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
    }
    get names() {
      const names2 = addExprNames(super.names, this.from);
      return addExprNames(names2, this.to);
    }
  }
  class ForIter extends For {
    constructor(loop, varKind, name, iterable) {
      super();
      this.loop = loop;
      this.varKind = varKind;
      this.name = name;
      this.iterable = iterable;
    }
    render(opts) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
    }
    optimizeNames(names2, constants2) {
      if (!super.optimizeNames(names2, constants2))
        return;
      this.iterable = optimizeExpr(this.iterable, names2, constants2);
      return this;
    }
    get names() {
      return addNames(super.names, this.iterable.names);
    }
  }
  class Func extends BlockNode {
    constructor(name, args, async) {
      super();
      this.name = name;
      this.args = args;
      this.async = async;
    }
    render(opts) {
      const _async = this.async ? "async " : "";
      return `${_async}function ${this.name}(${this.args})` + super.render(opts);
    }
  }
  Func.kind = "func";
  class Return extends ParentNode {
    render(opts) {
      return "return " + super.render(opts);
    }
  }
  Return.kind = "return";
  class Try extends BlockNode {
    render(opts) {
      let code2 = "try" + super.render(opts);
      if (this.catch)
        code2 += this.catch.render(opts);
      if (this.finally)
        code2 += this.finally.render(opts);
      return code2;
    }
    optimizeNodes() {
      var _a, _b;
      super.optimizeNodes();
      (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
      (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
      return this;
    }
    optimizeNames(names2, constants2) {
      var _a, _b;
      super.optimizeNames(names2, constants2);
      (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names2, constants2);
      (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names2, constants2);
      return this;
    }
    get names() {
      const names2 = super.names;
      if (this.catch)
        addNames(names2, this.catch.names);
      if (this.finally)
        addNames(names2, this.finally.names);
      return names2;
    }
  }
  class Catch extends BlockNode {
    constructor(error2) {
      super();
      this.error = error2;
    }
    render(opts) {
      return `catch(${this.error})` + super.render(opts);
    }
  }
  Catch.kind = "catch";
  class Finally extends BlockNode {
    render(opts) {
      return "finally" + super.render(opts);
    }
  }
  Finally.kind = "finally";
  class CodeGen {
    constructor(extScope, opts = {}) {
      this._values = {};
      this._blockStarts = [];
      this._constants = {};
      this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
      this._extScope = extScope;
      this._scope = new scope_1.Scope({ parent: extScope });
      this._nodes = [new Root()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(prefix) {
      return this._scope.name(prefix);
    }
    // reserves unique name in the external scope
    scopeName(prefix) {
      return this._extScope.name(prefix);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(prefixOrName, value) {
      const name = this._extScope.value(prefixOrName, value);
      const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
      vs.add(name);
      return name;
    }
    getScopeValue(prefix, keyOrRef) {
      return this._extScope.getValue(prefix, keyOrRef);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(scopeName) {
      return this._extScope.scopeRefs(scopeName, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(varKind, nameOrPrefix, rhs, constant) {
      const name = this._scope.toName(nameOrPrefix);
      if (rhs !== void 0 && constant)
        this._constants[name.str] = rhs;
      this._leafNode(new Def(varKind, name, rhs));
      return name;
    }
    // `const` declaration (`var` in es5 mode)
    const(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
    }
    // `var` declaration with optional assignment
    var(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
    }
    // assignment code
    assign(lhs, rhs, sideEffects) {
      return this._leafNode(new Assign(lhs, rhs, sideEffects));
    }
    // `+=` code
    add(lhs, rhs) {
      return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
    }
    // appends passed SafeExpr to code or executes Block
    code(c) {
      if (typeof c == "function")
        c();
      else if (c !== code_12.nil)
        this._leafNode(new AnyCode(c));
      return this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...keyValues) {
      const code2 = ["{"];
      for (const [key, value] of keyValues) {
        if (code2.length > 1)
          code2.push(",");
        code2.push(key);
        if (key !== value || this.opts.es5) {
          code2.push(":");
          (0, code_12.addCodeArg)(code2, value);
        }
      }
      code2.push("}");
      return new code_12._Code(code2);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(condition, thenBody, elseBody) {
      this._blockNode(new If(condition));
      if (thenBody && elseBody) {
        this.code(thenBody).else().code(elseBody).endIf();
      } else if (thenBody) {
        this.code(thenBody).endIf();
      } else if (elseBody) {
        throw new Error('CodeGen: "else" body without "then" body');
      }
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(condition) {
      return this._elseNode(new If(condition));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new Else());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(If, Else);
    }
    _for(node, forBody) {
      this._blockNode(node);
      if (forBody)
        this.code(forBody).endFor();
      return this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(iteration, forBody) {
      return this._for(new ForLoop(iteration), forBody);
    }
    // `for` statement for a range of values
    forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
      const name = this._scope.toName(nameOrPrefix);
      if (this.opts.es5) {
        const arr = iterable instanceof code_12.Name ? iterable : this.var("_arr", iterable);
        return this.forRange("_i", 0, (0, code_12._)`${arr}.length`, (i) => {
          this.var(name, (0, code_12._)`${arr}[${i}]`);
          forBody(name);
        });
      }
      return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
      if (this.opts.ownProperties) {
        return this.forOf(nameOrPrefix, (0, code_12._)`Object.keys(${obj})`, forBody);
      }
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(For);
    }
    // `label` statement
    label(label) {
      return this._leafNode(new Label(label));
    }
    // `break` statement
    break(label) {
      return this._leafNode(new Break(label));
    }
    // `return` statement
    return(value) {
      const node = new Return();
      this._blockNode(node);
      this.code(value);
      if (node.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Return);
    }
    // `try` statement
    try(tryBody, catchCode, finallyCode) {
      if (!catchCode && !finallyCode)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const node = new Try();
      this._blockNode(node);
      this.code(tryBody);
      if (catchCode) {
        const error2 = this.name("e");
        this._currNode = node.catch = new Catch(error2);
        catchCode(error2);
      }
      if (finallyCode) {
        this._currNode = node.finally = new Finally();
        this.code(finallyCode);
      }
      return this._endBlockNode(Catch, Finally);
    }
    // `throw` statement
    throw(error2) {
      return this._leafNode(new Throw(error2));
    }
    // start self-balancing block
    block(body, nodeCount) {
      this._blockStarts.push(this._nodes.length);
      if (body)
        this.code(body).endBlock(nodeCount);
      return this;
    }
    // end the current self-balancing block
    endBlock(nodeCount) {
      const len = this._blockStarts.pop();
      if (len === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const toClose = this._nodes.length - len;
      if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
        throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
      }
      this._nodes.length = len;
      return this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(name, args = code_12.nil, async, funcBody) {
      this._blockNode(new Func(name, args, async));
      if (funcBody)
        this.code(funcBody).endFunc();
      return this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(Func);
    }
    optimize(n = 1) {
      while (n-- > 0) {
        this._root.optimizeNodes();
        this._root.optimizeNames(this._root.names, this._constants);
      }
    }
    _leafNode(node) {
      this._currNode.nodes.push(node);
      return this;
    }
    _blockNode(node) {
      this._currNode.nodes.push(node);
      this._nodes.push(node);
    }
    _endBlockNode(N1, N2) {
      const n = this._currNode;
      if (n instanceof N1 || N2 && n instanceof N2) {
        this._nodes.pop();
        return this;
      }
      throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
    }
    _elseNode(node) {
      const n = this._currNode;
      if (!(n instanceof If)) {
        throw new Error('CodeGen: "else" without "if"');
      }
      this._currNode = n.else = node;
      return this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const ns = this._nodes;
      return ns[ns.length - 1];
    }
    set _currNode(node) {
      const ns = this._nodes;
      ns[ns.length - 1] = node;
    }
  }
  exports.CodeGen = CodeGen;
  function addNames(names2, from) {
    for (const n in from)
      names2[n] = (names2[n] || 0) + (from[n] || 0);
    return names2;
  }
  function addExprNames(names2, from) {
    return from instanceof code_12._CodeOrName ? addNames(names2, from.names) : names2;
  }
  function optimizeExpr(expr, names2, constants2) {
    if (expr instanceof code_12.Name)
      return replaceName(expr);
    if (!canOptimize(expr))
      return expr;
    return new code_12._Code(expr._items.reduce((items2, c) => {
      if (c instanceof code_12.Name)
        c = replaceName(c);
      if (c instanceof code_12._Code)
        items2.push(...c._items);
      else
        items2.push(c);
      return items2;
    }, []));
    function replaceName(n) {
      const c = constants2[n.str];
      if (c === void 0 || names2[n.str] !== 1)
        return n;
      delete names2[n.str];
      return c;
    }
    function canOptimize(e) {
      return e instanceof code_12._Code && e._items.some((c) => c instanceof code_12.Name && names2[c.str] === 1 && constants2[c.str] !== void 0);
    }
  }
  function subtractNames(names2, from) {
    for (const n in from)
      names2[n] = (names2[n] || 0) - (from[n] || 0);
  }
  function not2(x) {
    return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_12._)`!${par(x)}`;
  }
  exports.not = not2;
  const andCode = mappend(exports.operators.AND);
  function and(...args) {
    return args.reduce(andCode);
  }
  exports.and = and;
  const orCode = mappend(exports.operators.OR);
  function or(...args) {
    return args.reduce(orCode);
  }
  exports.or = or;
  function mappend(op) {
    return (x, y) => x === code_12.nil ? y : y === code_12.nil ? x : (0, code_12._)`${par(x)} ${op} ${par(y)}`;
  }
  function par(x) {
    return x instanceof code_12.Name ? x : (0, code_12._)`(${x})`;
  }
<<<<<<< HEAD
})(codegen$1);
var util$1 = {};
Object.defineProperty(util$1, "__esModule", { value: true });
util$1.checkStrictMode = util$1.getErrorPath = util$1.Type = util$1.useFunc = util$1.setEvaluated = util$1.evaluatedPropsToName = util$1.mergeEvaluated = util$1.eachItem = util$1.unescapeJsonPointer = util$1.escapeJsonPointer = util$1.escapeFragment = util$1.unescapeFragment = util$1.schemaRefOrVal = util$1.schemaHasRulesButRef = util$1.schemaHasRules = util$1.checkUnknownRules = util$1.alwaysValidSchema = util$1.toHash = void 0;
const codegen_1$13 = codegen$1;
const code_1$l = code$3;
function toHash$1(arr) {
  const hash = {};
  for (const item of arr)
    hash[item] = true;
  return hash;
}
util$1.toHash = toHash$1;
function alwaysValidSchema$1(it, schema) {
  if (typeof schema == "boolean")
    return schema;
  if (Object.keys(schema).length === 0)
    return true;
  checkUnknownRules$1(it, schema);
  return !schemaHasRules$1(schema, it.self.RULES.all);
}
util$1.alwaysValidSchema = alwaysValidSchema$1;
function checkUnknownRules$1(it, schema = it.schema) {
  const { opts, self } = it;
  if (!opts.strictSchema)
    return;
  if (typeof schema === "boolean")
    return;
  const rules2 = self.RULES.keywords;
  for (const key in schema) {
    if (!rules2[key])
      checkStrictMode$1(it, `unknown keyword: "${key}"`);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
}
<<<<<<< HEAD
util$1.checkUnknownRules = checkUnknownRules$1;
function schemaHasRules$1(schema, rules2) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (rules2[key])
      return true;
  return false;
}
util$1.schemaHasRules = schemaHasRules$1;
function schemaHasRulesButRef$1(schema, RULES) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (key !== "$ref" && RULES.all[key])
      return true;
  return false;
}
util$1.schemaHasRulesButRef = schemaHasRulesButRef$1;
function schemaRefOrVal$1({ topSchemaRef, schemaPath }, schema, keyword2, $data) {
  if (!$data) {
    if (typeof schema == "number" || typeof schema == "boolean")
      return schema;
    if (typeof schema == "string")
      return (0, codegen_1$13._)`${schema}`;
  }
  return (0, codegen_1$13._)`${topSchemaRef}${schemaPath}${(0, codegen_1$13.getProperty)(keyword2)}`;
}
util$1.schemaRefOrVal = schemaRefOrVal$1;
function unescapeFragment$1(str) {
  return unescapeJsonPointer$1(decodeURIComponent(str));
}
util$1.unescapeFragment = unescapeFragment$1;
function escapeFragment$1(str) {
  return encodeURIComponent(escapeJsonPointer$1(str));
}
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
    const res = to === void 0 ? from : to instanceof codegen_1$13.Name ? (from instanceof codegen_1$13.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1$13.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
    return toName === codegen_1$13.Name && !(res instanceof codegen_1$13.Name) ? resultToName(gen, res) : res;
  };
}
util$1.mergeEvaluated = {
  props: makeMergeEvaluated$1({
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true && ${from} !== undefined`, () => {
      gen.if((0, codegen_1$13._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1$13._)`${to} || {}`).code((0, codegen_1$13._)`Object.assign(${to}, ${from})`));
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true`, () => {
      if (from === true) {
        gen.assign(to, true);
      } else {
        gen.assign(to, (0, codegen_1$13._)`${to} || {}`);
        setEvaluated$1(gen, to, from);
      }
    }),
<<<<<<< HEAD
    mergeValues: (from, to) => from === true ? true : { ...from, ...to },
    resultToName: evaluatedPropsToName$1
  }),
  items: makeMergeEvaluated$1({
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1$13._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$13._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1$13._)`${to} > ${from} ? ${to} : ${from}`)),
    mergeValues: (from, to) => from === true ? true : Math.max(from, to),
    resultToName: (gen, items2) => gen.var("items", items2)
  })
};
function evaluatedPropsToName$1(gen, ps) {
  if (ps === true)
    return gen.var("props", true);
  const props = gen.var("props", (0, codegen_1$13._)`{}`);
  if (ps !== void 0)
    setEvaluated$1(gen, props, ps);
  return props;
}
util$1.evaluatedPropsToName = evaluatedPropsToName$1;
function setEvaluated$1(gen, props, ps) {
  Object.keys(ps).forEach((p) => gen.assign((0, codegen_1$13._)`${props}${(0, codegen_1$13.getProperty)(p)}`, true));
}
util$1.setEvaluated = setEvaluated$1;
const snippets$1 = {};
function useFunc$1(gen, f) {
  return gen.scopeValue("func", {
    ref: f,
    code: snippets$1[f.code] || (snippets$1[f.code] = new code_1$l._Code(f.code))
  });
}
util$1.useFunc = useFunc$1;
var Type$1;
(function(Type2) {
  Type2[Type2["Num"] = 0] = "Num";
  Type2[Type2["Str"] = 1] = "Str";
})(Type$1 || (util$1.Type = Type$1 = {}));
function getErrorPath$1(dataProp, dataPropType, jsPropertySyntax) {
  if (dataProp instanceof codegen_1$13.Name) {
    const isNumber = dataPropType === Type$1.Num;
    return jsPropertySyntax ? isNumber ? (0, codegen_1$13._)`"[" + ${dataProp} + "]"` : (0, codegen_1$13._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1$13._)`"/" + ${dataProp}` : (0, codegen_1$13._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return jsPropertySyntax ? (0, codegen_1$13.getProperty)(dataProp).toString() : "/" + escapeJsonPointer$1(dataProp);
}
<<<<<<< HEAD
util$1.getErrorPath = getErrorPath$1;
function checkStrictMode$1(it, msg, mode = it.opts.strictSchema) {
  if (!mode)
    return;
  msg = `strict mode: ${msg}`;
  if (mode === true)
    throw new Error(msg);
  it.self.logger.warn(msg);
}
util$1.checkStrictMode = checkStrictMode$1;
var names$3 = {};
Object.defineProperty(names$3, "__esModule", { value: true });
const codegen_1$12 = codegen$1;
const names$2 = {
  // validation function arguments
  data: new codegen_1$12.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new codegen_1$12.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new codegen_1$12.Name("instancePath"),
  parentData: new codegen_1$12.Name("parentData"),
  parentDataProperty: new codegen_1$12.Name("parentDataProperty"),
  rootData: new codegen_1$12.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new codegen_1$12.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new codegen_1$12.Name("vErrors"),
  // null or array of validation errors
  errors: new codegen_1$12.Name("errors"),
  // counter of validation errors
  this: new codegen_1$12.Name("this"),
  // "globals"
  self: new codegen_1$12.Name("self"),
  scope: new codegen_1$12.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new codegen_1$12.Name("json"),
  jsonPos: new codegen_1$12.Name("jsonPos"),
  jsonLen: new codegen_1$12.Name("jsonLen"),
  jsonPart: new codegen_1$12.Name("jsonPart")
};
names$3.default = names$2;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
  const codegen_12 = codegen$1;
  const util_12 = util$1;
  const names_12 = names$3;
  exports.keywordError = {
    message: ({ keyword: keyword2 }) => (0, codegen_12.str)`must pass "${keyword2}" keyword validation`
  };
  exports.keyword$DataError = {
    message: ({ keyword: keyword2, schemaType }) => schemaType ? (0, codegen_12.str)`"${keyword2}" keyword must be ${schemaType} ($data)` : (0, codegen_12.str)`"${keyword2}" keyword is invalid ($data)`
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  };
  function reportError(cxt, error2 = exports.keywordError, errorPaths, overrideAllErrors) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error2, errorPaths);
    if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
      addError(gen, errObj);
    } else {
      returnErrors(it, (0, codegen_12._)`[${errObj}]`);
    }
  }
  exports.reportError = reportError;
  function reportExtraError(cxt, error2 = exports.keywordError, errorPaths) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error2, errorPaths);
    addError(gen, errObj);
    if (!(compositeRule || allErrors)) {
      returnErrors(it, names_12.default.vErrors);
    }
  }
  exports.reportExtraError = reportExtraError;
  function resetErrorsCount(gen, errsCount) {
    gen.assign(names_12.default.errors, errsCount);
    gen.if((0, codegen_12._)`${names_12.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_12._)`${names_12.default.vErrors}.length`, errsCount), () => gen.assign(names_12.default.vErrors, null)));
  }
  exports.resetErrorsCount = resetErrorsCount;
  function extendErrors({ gen, keyword: keyword2, schemaValue, data, errsCount, it }) {
    if (errsCount === void 0)
      throw new Error("ajv implementation error");
    const err = gen.name("err");
    gen.forRange("i", errsCount, names_12.default.errors, (i) => {
      gen.const(err, (0, codegen_12._)`${names_12.default.vErrors}[${i}]`);
      gen.if((0, codegen_12._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_12._)`${err}.instancePath`, (0, codegen_12.strConcat)(names_12.default.instancePath, it.errorPath)));
      gen.assign((0, codegen_12._)`${err}.schemaPath`, (0, codegen_12.str)`${it.errSchemaPath}/${keyword2}`);
      if (it.opts.verbose) {
        gen.assign((0, codegen_12._)`${err}.schema`, schemaValue);
        gen.assign((0, codegen_12._)`${err}.data`, data);
      }
    });
  }
  exports.extendErrors = extendErrors;
  function addError(gen, errObj) {
    const err = gen.const("err", errObj);
    gen.if((0, codegen_12._)`${names_12.default.vErrors} === null`, () => gen.assign(names_12.default.vErrors, (0, codegen_12._)`[${err}]`), (0, codegen_12._)`${names_12.default.vErrors}.push(${err})`);
    gen.code((0, codegen_12._)`${names_12.default.errors}++`);
  }
  function returnErrors(it, errs) {
    const { gen, validateName, schemaEnv } = it;
    if (schemaEnv.$async) {
      gen.throw((0, codegen_12._)`new ${it.ValidationError}(${errs})`);
    } else {
      gen.assign((0, codegen_12._)`${validateName}.errors`, errs);
      gen.return(false);
    }
  }
  const E = {
    keyword: new codegen_12.Name("keyword"),
    schemaPath: new codegen_12.Name("schemaPath"),
    // also used in JTD errors
    params: new codegen_12.Name("params"),
    propertyName: new codegen_12.Name("propertyName"),
    message: new codegen_12.Name("message"),
    schema: new codegen_12.Name("schema"),
    parentSchema: new codegen_12.Name("parentSchema")
  };
  function errorObjectCode(cxt, error2, errorPaths) {
    const { createErrors } = cxt.it;
    if (createErrors === false)
      return (0, codegen_12._)`{}`;
    return errorObject(cxt, error2, errorPaths);
  }
  function errorObject(cxt, error2, errorPaths = {}) {
    const { gen, it } = cxt;
    const keyValues = [
      errorInstancePath(it, errorPaths),
      errorSchemaPath(cxt, errorPaths)
    ];
    extraErrorProps(cxt, error2, keyValues);
    return gen.object(...keyValues);
  }
  function errorInstancePath({ errorPath }, { instancePath }) {
    const instPath = instancePath ? (0, codegen_12.str)`${errorPath}${(0, util_12.getErrorPath)(instancePath, util_12.Type.Str)}` : errorPath;
    return [names_12.default.instancePath, (0, codegen_12.strConcat)(names_12.default.instancePath, instPath)];
  }
  function errorSchemaPath({ keyword: keyword2, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
    let schPath = parentSchema ? errSchemaPath : (0, codegen_12.str)`${errSchemaPath}/${keyword2}`;
    if (schemaPath) {
      schPath = (0, codegen_12.str)`${schPath}${(0, util_12.getErrorPath)(schemaPath, util_12.Type.Str)}`;
    }
    return [E.schemaPath, schPath];
  }
  function extraErrorProps(cxt, { params, message }, keyValues) {
    const { keyword: keyword2, data, schemaValue, it } = cxt;
    const { opts, propertyName, topSchemaRef, schemaPath } = it;
    keyValues.push([E.keyword, keyword2], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_12._)`{}`]);
    if (opts.messages) {
      keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
    }
    if (opts.verbose) {
      keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_12._)`${topSchemaRef}${schemaPath}`], [names_12.default.data, data]);
    }
    if (propertyName)
      keyValues.push([E.propertyName, propertyName]);
  }
<<<<<<< HEAD
})(errors$1);
Object.defineProperty(boolSchema$1, "__esModule", { value: true });
boolSchema$1.boolOrEmptySchema = boolSchema$1.topBoolOrEmptySchema = void 0;
const errors_1$7 = errors$1;
const codegen_1$11 = codegen$1;
const names_1$g = names$3;
const boolError$1 = {
  message: "boolean schema is false"
};
function topBoolOrEmptySchema$1(it) {
  const { gen, schema, validateName } = it;
  if (schema === false) {
    falseSchemaError$1(it, false);
  } else if (typeof schema == "object" && schema.$async === true) {
    gen.return(names_1$g.default.data);
  } else {
    gen.assign((0, codegen_1$11._)`${validateName}.errors`, null);
    gen.return(true);
  }
}
boolSchema$1.topBoolOrEmptySchema = topBoolOrEmptySchema$1;
function boolOrEmptySchema$1(it, valid2) {
  const { gen, schema } = it;
  if (schema === false) {
    gen.var(valid2, false);
    falseSchemaError$1(it);
  } else {
    gen.var(valid2, true);
  }
}
boolSchema$1.boolOrEmptySchema = boolOrEmptySchema$1;
function falseSchemaError$1(it, overrideAllErrors) {
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
  (0, errors_1$7.reportError)(cxt, boolError$1, void 0, overrideAllErrors);
}
var dataType$1 = {};
var rules$1 = {};
Object.defineProperty(rules$1, "__esModule", { value: true });
rules$1.getRules = rules$1.isJSONType = void 0;
const _jsonTypes$1 = ["string", "number", "integer", "boolean", "null", "object", "array"];
const jsonTypes$1 = new Set(_jsonTypes$1);
function isJSONType$1(x) {
  return typeof x == "string" && jsonTypes$1.has(x);
}
rules$1.isJSONType = isJSONType$1;
function getRules$1() {
  const groups = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...groups, integer: true, boolean: true, null: true },
    rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
<<<<<<< HEAD
rules$1.getRules = getRules$1;
var applicability$1 = {};
Object.defineProperty(applicability$1, "__esModule", { value: true });
applicability$1.shouldUseRule = applicability$1.shouldUseGroup = applicability$1.schemaHasRulesForType = void 0;
function schemaHasRulesForType$1({ schema, self }, type2) {
  const group = self.RULES.types[type2];
  return group && group !== true && shouldUseGroup$1(schema, group);
}
applicability$1.schemaHasRulesForType = schemaHasRulesForType$1;
function shouldUseGroup$1(schema, group) {
  return group.rules.some((rule) => shouldUseRule$1(schema, rule));
}
applicability$1.shouldUseGroup = shouldUseGroup$1;
function shouldUseRule$1(schema, rule) {
  var _a;
  return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
}
applicability$1.shouldUseRule = shouldUseRule$1;
Object.defineProperty(dataType$1, "__esModule", { value: true });
dataType$1.reportTypeError = dataType$1.checkDataTypes = dataType$1.checkDataType = dataType$1.coerceAndCheckDataType = dataType$1.getJSONTypes = dataType$1.getSchemaTypes = dataType$1.DataType = void 0;
const rules_1$1 = rules$1;
const applicability_1$3 = applicability$1;
const errors_1$6 = errors$1;
const codegen_1$10 = codegen$1;
const util_1$V = util$1;
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
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!types2.length && schema.nullable !== void 0) {
      throw new Error('"nullable" cannot be used without "type"');
    }
    if (schema.nullable === true)
      types2.push("null");
  }
  return types2;
}
<<<<<<< HEAD
dataType$1.getSchemaTypes = getSchemaTypes$1;
function getJSONTypes$1(ts) {
  const types2 = Array.isArray(ts) ? ts : ts ? [ts] : [];
  if (types2.every(rules_1$1.isJSONType))
    return types2;
  throw new Error("type must be JSONType or JSONType[]: " + types2.join(","));
}
dataType$1.getJSONTypes = getJSONTypes$1;
function coerceAndCheckDataType$1(it, types2) {
  const { gen, data, opts } = it;
  const coerceTo = coerceToTypes$1(types2, opts.coerceTypes);
  const checkTypes = types2.length > 0 && !(coerceTo.length === 0 && types2.length === 1 && (0, applicability_1$3.schemaHasRulesForType)(it, types2[0]));
  if (checkTypes) {
    const wrongType = checkDataTypes$1(types2, data, opts.strictNumbers, DataType$1.Wrong);
    gen.if(wrongType, () => {
      if (coerceTo.length)
        coerceData$1(it, types2, coerceTo);
      else
        reportTypeError$1(it);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    });
  }
  return checkTypes;
}
<<<<<<< HEAD
dataType$1.coerceAndCheckDataType = coerceAndCheckDataType$1;
const COERCIBLE$1 = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function coerceToTypes$1(types2, coerceTypes) {
  return coerceTypes ? types2.filter((t2) => COERCIBLE$1.has(t2) || coerceTypes === "array" && t2 === "array") : [];
}
function coerceData$1(it, types2, coerceTo) {
  const { gen, data, opts } = it;
  const dataType2 = gen.let("dataType", (0, codegen_1$10._)`typeof ${data}`);
  const coerced = gen.let("coerced", (0, codegen_1$10._)`undefined`);
  if (opts.coerceTypes === "array") {
    gen.if((0, codegen_1$10._)`${dataType2} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1$10._)`${data}[0]`).assign(dataType2, (0, codegen_1$10._)`typeof ${data}`).if(checkDataTypes$1(types2, data, opts.strictNumbers), () => gen.assign(coerced, data)));
  }
  gen.if((0, codegen_1$10._)`${coerced} !== undefined`);
  for (const t2 of coerceTo) {
    if (COERCIBLE$1.has(t2) || t2 === "array" && opts.coerceTypes === "array") {
      coerceSpecificType(t2);
    }
  }
  gen.else();
  reportTypeError$1(it);
  gen.endIf();
  gen.if((0, codegen_1$10._)`${coerced} !== undefined`, () => {
    gen.assign(data, coerced);
    assignParentData$1(it, coerced);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  });
  function coerceSpecificType(t2) {
    switch (t2) {
      case "string":
        gen.elseIf((0, codegen_1$10._)`${dataType2} == "number" || ${dataType2} == "boolean"`).assign(coerced, (0, codegen_1$10._)`"" + ${data}`).elseIf((0, codegen_1$10._)`${data} === null`).assign(coerced, (0, codegen_1$10._)`""`);
        return;
      case "number":
        gen.elseIf((0, codegen_1$10._)`${dataType2} == "boolean" || ${data} === null
              || (${dataType2} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1$10._)`+${data}`);
        return;
      case "integer":
        gen.elseIf((0, codegen_1$10._)`${dataType2} === "boolean" || ${data} === null
              || (${dataType2} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1$10._)`+${data}`);
        return;
      case "boolean":
        gen.elseIf((0, codegen_1$10._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1$10._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
        return;
      case "null":
        gen.elseIf((0, codegen_1$10._)`${data} === "" || ${data} === 0 || ${data} === false`);
        gen.assign(coerced, null);
        return;
      case "array":
        gen.elseIf((0, codegen_1$10._)`${dataType2} === "string" || ${dataType2} === "number"
              || ${dataType2} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1$10._)`[${data}]`);
    }
  }
}
<<<<<<< HEAD
function assignParentData$1({ gen, parentData, parentDataProperty }, expr) {
  gen.if((0, codegen_1$10._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1$10._)`${parentData}[${parentDataProperty}]`, expr));
=======
function jd({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, te._)`${t} !== undefined`, () => e.assign((0, te._)`${t}[${r}]`, n));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
}
function checkDataType$1(dataType2, data, strictNums, correct = DataType$1.Correct) {
  const EQ = correct === DataType$1.Correct ? codegen_1$10.operators.EQ : codegen_1$10.operators.NEQ;
  let cond;
  switch (dataType2) {
    case "null":
      return (0, codegen_1$10._)`${data} ${EQ} null`;
    case "array":
      cond = (0, codegen_1$10._)`Array.isArray(${data})`;
      break;
    case "object":
      cond = (0, codegen_1$10._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
      break;
    case "integer":
      cond = numCond((0, codegen_1$10._)`!(${data} % 1) && !isNaN(${data})`);
      break;
    case "number":
      cond = numCond();
      break;
    default:
      return (0, codegen_1$10._)`typeof ${data} ${EQ} ${dataType2}`;
  }
  return correct === DataType$1.Correct ? cond : (0, codegen_1$10.not)(cond);
  function numCond(_cond = codegen_1$10.nil) {
    return (0, codegen_1$10.and)((0, codegen_1$10._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1$10._)`isFinite(${data})` : codegen_1$10.nil);
  }
}
<<<<<<< HEAD
dataType$1.checkDataType = checkDataType$1;
function checkDataTypes$1(dataTypes, data, strictNums, correct) {
  if (dataTypes.length === 1) {
    return checkDataType$1(dataTypes[0], data, strictNums, correct);
  }
  let cond;
  const types2 = (0, util_1$V.toHash)(dataTypes);
  if (types2.array && types2.object) {
    const notObj = (0, codegen_1$10._)`typeof ${data} != "object"`;
    cond = types2.null ? notObj : (0, codegen_1$10._)`!${data} || ${notObj}`;
    delete types2.null;
    delete types2.array;
    delete types2.object;
  } else {
    cond = codegen_1$10.nil;
  }
  if (types2.number)
    delete types2.integer;
  for (const t2 in types2)
    cond = (0, codegen_1$10.and)(cond, checkDataType$1(t2, data, strictNums, correct));
  return cond;
}
dataType$1.checkDataTypes = checkDataTypes$1;
const typeError$1 = {
  message: ({ schema }) => `must be ${schema}`,
  params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1$10._)`{type: ${schema}}` : (0, codegen_1$10._)`{type: ${schemaValue}}`
};
function reportTypeError$1(it) {
  const cxt = getTypeErrorContext$1(it);
  (0, errors_1$6.reportError)(cxt, typeError$1);
}
dataType$1.reportTypeError = reportTypeError$1;
function getTypeErrorContext$1(it) {
  const { gen, data, schema } = it;
  const schemaCode = (0, util_1$V.schemaRefOrVal)(it, schema, "type");
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  return {
    gen,
    keyword: "type",
    data,
    schema: schema.type,
    schemaCode,
    schemaValue: schemaCode,
    parentSchema: schema,
    params: {},
    it
  };
}
<<<<<<< HEAD
var defaults$1 = {};
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
}
defaults$1.assignDefaults = assignDefaults$1;
function assignDefault$1(it, prop, defaultValue) {
  const { gen, compositeRule, data, opts } = it;
  if (defaultValue === void 0)
    return;
  const childData = (0, codegen_1$$._)`${data}${(0, codegen_1$$.getProperty)(prop)}`;
  if (compositeRule) {
    (0, util_1$U.checkStrictMode)(it, `default is ignored for: ${childData}`);
    return;
  }
  let condition = (0, codegen_1$$._)`${childData} === undefined`;
  if (opts.useDefaults === "empty") {
    condition = (0, codegen_1$$._)`${condition} || ${childData} === null || ${childData} === ""`;
  }
  gen.if(condition, (0, codegen_1$$._)`${childData} = ${(0, codegen_1$$.stringify)(defaultValue)}`);
}
var keyword$1 = {};
var code$2 = {};
Object.defineProperty(code$2, "__esModule", { value: true });
code$2.validateUnion = code$2.validateArray = code$2.usePattern = code$2.callValidateCode = code$2.schemaProperties = code$2.allSchemaProperties = code$2.noPropertyInData = code$2.propertyInData = code$2.isOwnProperty = code$2.hasPropFunc = code$2.reportMissingProp = code$2.checkMissingProp = code$2.checkReportMissingProp = void 0;
const codegen_1$_ = codegen$1;
const util_1$T = util$1;
const names_1$f = names$3;
const util_2$3 = util$1;
function checkReportMissingProp$1(cxt, prop) {
  const { gen, data, it } = cxt;
  gen.if(noPropertyInData$1(gen, data, prop, it.opts.ownProperties), () => {
    cxt.setParams({ missingProperty: (0, codegen_1$_._)`${prop}` }, true);
    cxt.error();
  });
}
code$2.checkReportMissingProp = checkReportMissingProp$1;
function checkMissingProp$1({ gen, data, it: { opts } }, properties2, missing) {
  return (0, codegen_1$_.or)(...properties2.map((prop) => (0, codegen_1$_.and)(noPropertyInData$1(gen, data, prop, opts.ownProperties), (0, codegen_1$_._)`${missing} = ${prop}`)));
}
code$2.checkMissingProp = checkMissingProp$1;
function reportMissingProp$1(cxt, missing) {
  cxt.setParams({ missingProperty: missing }, true);
  cxt.error();
}
code$2.reportMissingProp = reportMissingProp$1;
function hasPropFunc$1(gen) {
  return gen.scopeValue("func", {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, codegen_1$_._)`Object.prototype.hasOwnProperty`
  });
}
<<<<<<< HEAD
code$2.hasPropFunc = hasPropFunc$1;
function isOwnProperty$1(gen, data, property) {
  return (0, codegen_1$_._)`${hasPropFunc$1(gen)}.call(${data}, ${property})`;
}
code$2.isOwnProperty = isOwnProperty$1;
function propertyInData$1(gen, data, property, ownProperties) {
  const cond = (0, codegen_1$_._)`${data}${(0, codegen_1$_.getProperty)(property)} !== undefined`;
  return ownProperties ? (0, codegen_1$_._)`${cond} && ${isOwnProperty$1(gen, data, property)}` : cond;
}
code$2.propertyInData = propertyInData$1;
function noPropertyInData$1(gen, data, property, ownProperties) {
  const cond = (0, codegen_1$_._)`${data}${(0, codegen_1$_.getProperty)(property)} === undefined`;
  return ownProperties ? (0, codegen_1$_.or)(cond, (0, codegen_1$_.not)(isOwnProperty$1(gen, data, property))) : cond;
}
code$2.noPropertyInData = noPropertyInData$1;
function allSchemaProperties$1(schemaMap) {
  return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
}
code$2.allSchemaProperties = allSchemaProperties$1;
function schemaProperties$1(it, schemaMap) {
  return allSchemaProperties$1(schemaMap).filter((p) => !(0, util_1$T.alwaysValidSchema)(it, schemaMap[p]));
}
code$2.schemaProperties = schemaProperties$1;
function callValidateCode$1({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
  const dataAndSchema = passSchema ? (0, codegen_1$_._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
  const valCxt = [
    [names_1$f.default.instancePath, (0, codegen_1$_.strConcat)(names_1$f.default.instancePath, errorPath)],
    [names_1$f.default.parentData, it.parentData],
    [names_1$f.default.parentDataProperty, it.parentDataProperty],
    [names_1$f.default.rootData, names_1$f.default.rootData]
  ];
  if (it.opts.dynamicRef)
    valCxt.push([names_1$f.default.dynamicAnchors, names_1$f.default.dynamicAnchors]);
  const args = (0, codegen_1$_._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
  return context !== codegen_1$_.nil ? (0, codegen_1$_._)`${func}.call(${context}, ${args})` : (0, codegen_1$_._)`${func}(${args})`;
}
code$2.callValidateCode = callValidateCode$1;
const newRegExp$1 = (0, codegen_1$_._)`new RegExp`;
function usePattern$1({ gen, it: { opts } }, pattern2) {
  const u = opts.unicodeRegExp ? "u" : "";
  const { regExp } = opts.code;
  const rx = regExp(pattern2, u);
  return gen.scopeValue("pattern", {
    key: rx.toString(),
    ref: rx,
    code: (0, codegen_1$_._)`${regExp.code === "new RegExp" ? newRegExp$1 : (0, util_2$3.useFunc)(gen, regExp)}(${pattern2}, ${u})`
  });
}
code$2.usePattern = usePattern$1;
function validateArray$1(cxt) {
  const { gen, data, keyword: keyword2, it } = cxt;
  const valid2 = gen.name("valid");
  if (it.allErrors) {
    const validArr = gen.let("valid", true);
    validateItems(() => gen.assign(validArr, false));
    return validArr;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
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
    });
  }
}
<<<<<<< HEAD
code$2.validateArray = validateArray$1;
function validateUnion$1(cxt) {
  const { gen, schema, keyword: keyword2, it } = cxt;
  if (!Array.isArray(schema))
=======
oe.validateArray = Hd;
function Bd(e) {
  const { gen: t, schema: r, keyword: n, it: s } = e;
  if (!Array.isArray(r))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    throw new Error("ajv implementation error");
  const alwaysValid = schema.some((sch) => (0, util_1$T.alwaysValidSchema)(it, sch));
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
    gen.assign(valid2, (0, codegen_1$_._)`${valid2} || ${schValid}`);
    const merged = cxt.mergeValidEvaluated(schCxt, schValid);
    if (!merged)
      gen.if((0, codegen_1$_.not)(valid2));
  }));
  cxt.result(valid2, () => cxt.reset(), () => cxt.error(true));
}
<<<<<<< HEAD
code$2.validateUnion = validateUnion$1;
Object.defineProperty(keyword$1, "__esModule", { value: true });
keyword$1.validateKeywordUsage = keyword$1.validSchemaType = keyword$1.funcKeywordCode = keyword$1.macroKeywordCode = void 0;
const codegen_1$Z = codegen$1;
const names_1$e = names$3;
const code_1$k = code$2;
const errors_1$5 = errors$1;
function macroKeywordCode$1(cxt, def2) {
  const { gen, keyword: keyword2, schema, parentSchema, it } = cxt;
  const macroSchema = def2.macro.call(it.self, schema, parentSchema, it);
  const schemaRef = useKeyword$1(gen, keyword2, macroSchema);
  if (it.opts.validateSchema !== false)
    it.self.validateSchema(macroSchema, true);
  const valid2 = gen.name("valid");
  cxt.subschema({
    schema: macroSchema,
    schemaPath: codegen_1$Z.nil,
    errSchemaPath: `${it.errSchemaPath}/${keyword2}`,
    topSchemaRef: schemaRef,
    compositeRule: true
  }, valid2);
  cxt.pass(valid2, () => cxt.error(true));
}
keyword$1.macroKeywordCode = macroKeywordCode$1;
function funcKeywordCode$1(cxt, def2) {
  var _a;
  const { gen, keyword: keyword2, schema, parentSchema, $data, it } = cxt;
  checkAsyncKeyword$1(it, def2);
  const validate2 = !$data && def2.compile ? def2.compile.call(it.self, schema, parentSchema, it) : def2.validate;
  const validateRef = useKeyword$1(gen, keyword2, validate2);
  const valid2 = gen.let("valid");
  cxt.block$data(valid2, validateKeyword);
  cxt.ok((_a = def2.valid) !== null && _a !== void 0 ? _a : valid2);
  function validateKeyword() {
    if (def2.errors === false) {
      assignValid();
      if (def2.modifying)
        modifyData$1(cxt);
      reportErrs(() => cxt.error());
    } else {
      const ruleErrs = def2.async ? validateAsync() : validateSync();
      if (def2.modifying)
        modifyData$1(cxt);
      reportErrs(() => addErrs$1(cxt, ruleErrs));
    }
  }
  function validateAsync() {
    const ruleErrs = gen.let("ruleErrs", null);
    gen.try(() => assignValid((0, codegen_1$Z._)`await `), (e) => gen.assign(valid2, false).if((0, codegen_1$Z._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1$Z._)`${e}.errors`), () => gen.throw(e)));
    return ruleErrs;
  }
  function validateSync() {
    const validateErrs = (0, codegen_1$Z._)`${validateRef}.errors`;
    gen.assign(validateErrs, null);
    assignValid(codegen_1$Z.nil);
    return validateErrs;
  }
  function assignValid(_await = def2.async ? (0, codegen_1$Z._)`await ` : codegen_1$Z.nil) {
    const passCxt = it.opts.passContext ? names_1$e.default.this : names_1$e.default.self;
    const passSchema = !("compile" in def2 && !$data || def2.schema === false);
    gen.assign(valid2, (0, codegen_1$Z._)`${_await}${(0, code_1$k.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def2.modifying);
  }
  function reportErrs(errors2) {
    var _a2;
    gen.if((0, codegen_1$Z.not)((_a2 = def2.valid) !== null && _a2 !== void 0 ? _a2 : valid2), errors2);
  }
}
keyword$1.funcKeywordCode = funcKeywordCode$1;
function modifyData$1(cxt) {
  const { gen, data, it } = cxt;
  gen.if(it.parentData, () => gen.assign(data, (0, codegen_1$Z._)`${it.parentData}[${it.parentDataProperty}]`));
}
function addErrs$1(cxt, errs) {
  const { gen } = cxt;
  gen.if((0, codegen_1$Z._)`Array.isArray(${errs})`, () => {
    gen.assign(names_1$e.default.vErrors, (0, codegen_1$Z._)`${names_1$e.default.vErrors} === null ? ${errs} : ${names_1$e.default.vErrors}.concat(${errs})`).assign(names_1$e.default.errors, (0, codegen_1$Z._)`${names_1$e.default.vErrors}.length`);
    (0, errors_1$5.extendErrors)(cxt);
  }, () => cxt.error());
}
function checkAsyncKeyword$1({ schemaEnv }, def2) {
  if (def2.async && !schemaEnv.$async)
    throw new Error("async keyword in sync schema");
}
function useKeyword$1(gen, keyword2, result) {
  if (result === void 0)
    throw new Error(`keyword "${keyword2}" failed to compile`);
  return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1$Z.stringify)(result) });
}
function validSchemaType$1(schema, schemaType, allowUndefined = false) {
  return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
}
keyword$1.validSchemaType = validSchemaType$1;
function validateKeywordUsage$1({ schema, opts, self, errSchemaPath }, def2, keyword2) {
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
  }
}
keyword$1.validateKeywordUsage = validateKeywordUsage$1;
var subschema$1 = {};
Object.defineProperty(subschema$1, "__esModule", { value: true });
subschema$1.extendSubschemaMode = subschema$1.extendSubschemaData = subschema$1.getSubschema = void 0;
const codegen_1$Y = codegen$1;
const util_1$S = util$1;
function getSubschema$1(it, { keyword: keyword2, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
  if (keyword2 !== void 0 && schema !== void 0) {
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  }
  if (keyword2 !== void 0) {
    const sch = it.schema[keyword2];
    return schemaProp === void 0 ? {
      schema: sch,
      schemaPath: (0, codegen_1$Y._)`${it.schemaPath}${(0, codegen_1$Y.getProperty)(keyword2)}`,
      errSchemaPath: `${it.errSchemaPath}/${keyword2}`
    } : {
      schema: sch[schemaProp],
      schemaPath: (0, codegen_1$Y._)`${it.schemaPath}${(0, codegen_1$Y.getProperty)(keyword2)}${(0, codegen_1$Y.getProperty)(schemaProp)}`,
      errSchemaPath: `${it.errSchemaPath}/${keyword2}/${(0, util_1$S.escapeFragment)(schemaProp)}`
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
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    };
  }
  throw new Error('either "keyword" or "schema" must be passed');
}
<<<<<<< HEAD
subschema$1.getSubschema = getSubschema$1;
function extendSubschemaData$1(subschema2, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
  if (data !== void 0 && dataProp !== void 0) {
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  }
  const { gen } = it;
  if (dataProp !== void 0) {
    const { errorPath, dataPathArr, opts } = it;
    const nextData = gen.let("data", (0, codegen_1$Y._)`${it.data}${(0, codegen_1$Y.getProperty)(dataProp)}`, true);
    dataContextProps(nextData);
    subschema2.errorPath = (0, codegen_1$Y.str)`${errorPath}${(0, util_1$S.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
    subschema2.parentDataProperty = (0, codegen_1$Y._)`${dataProp}`;
    subschema2.dataPathArr = [...dataPathArr, subschema2.parentDataProperty];
  }
  if (data !== void 0) {
    const nextData = data instanceof codegen_1$Y.Name ? data : gen.let("data", data, true);
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
subschema$1.extendSubschemaData = extendSubschemaData$1;
function extendSubschemaMode$1(subschema2, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
  if (compositeRule !== void 0)
    subschema2.compositeRule = compositeRule;
  if (createErrors !== void 0)
    subschema2.createErrors = createErrors;
  if (allErrors !== void 0)
    subschema2.allErrors = allErrors;
  subschema2.jtdDiscriminator = jtdDiscriminator;
  subschema2.jtdMetadata = jtdMetadata;
}
subschema$1.extendSubschemaMode = extendSubschemaMode$1;
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
    }
    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;
    for (i = length; i-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
    for (i = length; i-- !== 0; ) {
      var key = keys[i];
      if (!equal(a[key], b[key])) return false;
    }
    return true;
  }
  return a !== a && b !== b;
};
var jsonSchemaTraverse$1 = { exports: {} };
var traverse$3 = jsonSchemaTraverse$1.exports = function(schema, opts, cb) {
  if (typeof opts == "function") {
    cb = opts;
    opts = {};
  }
  cb = opts.cb || cb;
  var pre = typeof cb == "function" ? cb : cb.pre || function() {
  };
  var post = cb.post || function() {
  };
  _traverse$1(opts, pre, post, schema, "", schema);
};
traverse$3.keywords = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true,
  if: true,
  then: true,
  else: true
};
traverse$3.arrayKeywords = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true
};
traverse$3.propsKeywords = {
  $defs: true,
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true
};
traverse$3.skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true
};
function _traverse$1(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
  if (schema && typeof schema == "object" && !Array.isArray(schema)) {
    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    for (var key in schema) {
      var sch = schema[key];
      if (Array.isArray(sch)) {
        if (key in traverse$3.arrayKeywords) {
          for (var i = 0; i < sch.length; i++)
            _traverse$1(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
        }
      } else if (key in traverse$3.propsKeywords) {
        if (sch && typeof sch == "object") {
          for (var prop in sch)
            _traverse$1(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr$1(prop), rootSchema, jsonPtr, key, schema, prop);
        }
      } else if (key in traverse$3.keywords || opts.allKeys && !(key in traverse$3.skipKeywords)) {
        _traverse$1(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
      }
    }
    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
  }
}
function escapeJsonPtr$1(str) {
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
var jsonSchemaTraverseExports$1 = jsonSchemaTraverse$1.exports;
Object.defineProperty(resolve$4, "__esModule", { value: true });
resolve$4.getSchemaRefs = resolve$4.resolveUrl = resolve$4.normalizeId = resolve$4._getFullPath = resolve$4.getFullPath = resolve$4.inlineRef = void 0;
const util_1$R = util$1;
const equal$6 = fastDeepEqual;
const traverse$2 = jsonSchemaTraverseExports$1;
const SIMPLE_INLINED$1 = /* @__PURE__ */ new Set([
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
function inlineRef$1(schema, limit2 = true) {
  if (typeof schema == "boolean")
    return true;
  if (limit2 === true)
    return !hasRef$1(schema);
  if (!limit2)
    return false;
  return countKeys$1(schema) <= limit2;
}
resolve$4.inlineRef = inlineRef$1;
const REF_KEYWORDS$1 = /* @__PURE__ */ new Set([
=======
function df(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !zs(e) : t ? al(e) <= t : !1;
}
Te.inlineRef = df;
const ff = /* @__PURE__ */ new Set([
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
<<<<<<< HEAD
function hasRef$1(schema) {
  for (const key in schema) {
    if (REF_KEYWORDS$1.has(key))
      return true;
    const sch = schema[key];
    if (Array.isArray(sch) && sch.some(hasRef$1))
      return true;
    if (typeof sch == "object" && hasRef$1(sch))
      return true;
=======
function zs(e) {
  for (const t in e) {
    if (ff.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(zs) || typeof r == "object" && zs(r))
      return !0;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return false;
}
<<<<<<< HEAD
function countKeys$1(schema) {
  let count = 0;
  for (const key in schema) {
    if (key === "$ref")
      return Infinity;
    count++;
    if (SIMPLE_INLINED$1.has(key))
      continue;
    if (typeof schema[key] == "object") {
      (0, util_1$R.eachItem)(schema[key], (sch) => count += countKeys$1(sch));
    }
    if (count === Infinity)
      return Infinity;
=======
function al(e) {
  let t = 0;
  for (const r in e) {
    if (r === "$ref")
      return 1 / 0;
    if (t++, !uf.has(r) && (typeof e[r] == "object" && (0, of.eachItem)(e[r], (n) => t += al(n)), t === 1 / 0))
      return 1 / 0;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return count;
}
<<<<<<< HEAD
function getFullPath$1(resolver, id2 = "", normalize2) {
  if (normalize2 !== false)
    id2 = normalizeId$1(id2);
  const p = resolver.parse(id2);
  return _getFullPath$1(resolver, p);
}
resolve$4.getFullPath = getFullPath$1;
function _getFullPath$1(resolver, p) {
  const serialized = resolver.serialize(p);
  return serialized.split("#")[0] + "#";
}
resolve$4._getFullPath = _getFullPath$1;
const TRAILING_SLASH_HASH$1 = /#\/?$/;
function normalizeId$1(id2) {
  return id2 ? id2.replace(TRAILING_SLASH_HASH$1, "") : "";
}
resolve$4.normalizeId = normalizeId$1;
function resolveUrl$1(resolver, baseId, id2) {
  id2 = normalizeId$1(id2);
  return resolver.resolve(baseId, id2);
}
resolve$4.resolveUrl = resolveUrl$1;
const ANCHOR$1 = /^[a-z_][-a-z0-9._]*$/i;
function getSchemaRefs$1(schema, baseId) {
  if (typeof schema == "boolean")
    return {};
  const { schemaId, uriResolver } = this.opts;
  const schId = normalizeId$1(schema[schemaId] || baseId);
  const baseIds = { "": schId };
  const pathPrefix = getFullPath$1(uriResolver, schId, false);
  const localRefs = {};
  const schemaRefs = /* @__PURE__ */ new Set();
  traverse$2(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
    if (parentJsonPtr === void 0)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    const fullPath = pathPrefix + jsonPtr;
    let innerBaseId = baseIds[parentJsonPtr];
    if (typeof sch[schemaId] == "string")
      innerBaseId = addRef.call(this, sch[schemaId]);
    addAnchor.call(this, sch.$anchor);
    addAnchor.call(this, sch.$dynamicAnchor);
    baseIds[jsonPtr] = innerBaseId;
    function addRef(ref2) {
      const _resolve = this.opts.uriResolver.resolve;
      ref2 = normalizeId$1(innerBaseId ? _resolve(innerBaseId, ref2) : ref2);
      if (schemaRefs.has(ref2))
        throw ambiguos(ref2);
      schemaRefs.add(ref2);
      let schOrRef = this.refs[ref2];
      if (typeof schOrRef == "string")
        schOrRef = this.refs[schOrRef];
      if (typeof schOrRef == "object") {
        checkAmbiguosRef(sch, schOrRef.schema, ref2);
      } else if (ref2 !== normalizeId$1(fullPath)) {
        if (ref2[0] === "#") {
          checkAmbiguosRef(sch, localRefs[ref2], ref2);
          localRefs[ref2] = sch;
        } else {
          this.refs[ref2] = fullPath;
        }
      }
      return ref2;
    }
<<<<<<< HEAD
    function addAnchor(anchor) {
      if (typeof anchor == "string") {
        if (!ANCHOR$1.test(anchor))
          throw new Error(`invalid anchor "${anchor}"`);
        addRef.call(this, `#${anchor}`);
      }
    }
  });
  return localRefs;
  function checkAmbiguosRef(sch1, sch2, ref2) {
    if (sch2 !== void 0 && !equal$6(sch1, sch2))
      throw ambiguos(ref2);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  function ambiguos(ref2) {
    return new Error(`reference "${ref2}" resolves to more than one schema`);
  }
}
<<<<<<< HEAD
resolve$4.getSchemaRefs = getSchemaRefs$1;
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
  }
  validateFunction$1(it, () => (0, boolSchema_1$1.topBoolOrEmptySchema)(it));
}
validate$1.validateFunctionCode = validateFunctionCode$1;
function validateFunction$1({ gen, validateName, schema, schemaEnv, opts }, body) {
  if (opts.code.es5) {
    gen.func(validateName, (0, codegen_1$X._)`${names_1$d.default.data}, ${names_1$d.default.valCxt}`, schemaEnv.$async, () => {
      gen.code((0, codegen_1$X._)`"use strict"; ${funcSourceUrl$1(schema, opts)}`);
      destructureValCxtES5$1(gen, opts);
      gen.code(body);
    });
  } else {
    gen.func(validateName, (0, codegen_1$X._)`${names_1$d.default.data}, ${destructureValCxt$1(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl$1(schema, opts)).code(body));
  }
}
function destructureValCxt$1(opts) {
  return (0, codegen_1$X._)`{${names_1$d.default.instancePath}="", ${names_1$d.default.parentData}, ${names_1$d.default.parentDataProperty}, ${names_1$d.default.rootData}=${names_1$d.default.data}${opts.dynamicRef ? (0, codegen_1$X._)`, ${names_1$d.default.dynamicAnchors}={}` : codegen_1$X.nil}}={}`;
}
function destructureValCxtES5$1(gen, opts) {
  gen.if(names_1$d.default.valCxt, () => {
    gen.var(names_1$d.default.instancePath, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.instancePath}`);
    gen.var(names_1$d.default.parentData, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.parentData}`);
    gen.var(names_1$d.default.parentDataProperty, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.parentDataProperty}`);
    gen.var(names_1$d.default.rootData, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.rootData}`);
    if (opts.dynamicRef)
      gen.var(names_1$d.default.dynamicAnchors, (0, codegen_1$X._)`${names_1$d.default.valCxt}.${names_1$d.default.dynamicAnchors}`);
  }, () => {
    gen.var(names_1$d.default.instancePath, (0, codegen_1$X._)`""`);
    gen.var(names_1$d.default.parentData, (0, codegen_1$X._)`undefined`);
    gen.var(names_1$d.default.parentDataProperty, (0, codegen_1$X._)`undefined`);
    gen.var(names_1$d.default.rootData, names_1$d.default.data);
    if (opts.dynamicRef)
      gen.var(names_1$d.default.dynamicAnchors, (0, codegen_1$X._)`{}`);
  });
}
function topSchemaObjCode$1(it) {
  const { schema, opts, gen } = it;
  validateFunction$1(it, () => {
    if (opts.$comment && schema.$comment)
      commentKeyword$1(it);
    checkNoDefault$1(it);
    gen.let(names_1$d.default.vErrors, null);
    gen.let(names_1$d.default.errors, 0);
    if (opts.unevaluated)
      resetEvaluated$1(it);
    typeAndKeywords$1(it);
    returnResults$1(it);
  });
  return;
}
function resetEvaluated$1(it) {
  const { gen, validateName } = it;
  it.evaluated = gen.const("evaluated", (0, codegen_1$X._)`${validateName}.evaluated`);
  gen.if((0, codegen_1$X._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1$X._)`${it.evaluated}.props`, (0, codegen_1$X._)`undefined`));
  gen.if((0, codegen_1$X._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1$X._)`${it.evaluated}.items`, (0, codegen_1$X._)`undefined`));
}
function funcSourceUrl$1(schema, opts) {
  const schId = typeof schema == "object" && schema[opts.schemaId];
  return schId && (opts.code.source || opts.code.process) ? (0, codegen_1$X._)`/*# sourceURL=${schId} */` : codegen_1$X.nil;
}
function subschemaCode$1(it, valid2) {
  if (isSchemaObj$1(it)) {
    checkKeywords$1(it);
    if (schemaCxtHasRules$1(it)) {
      subSchemaObjCode$1(it, valid2);
      return;
    }
  }
  (0, boolSchema_1$1.boolOrEmptySchema)(it, valid2);
}
function schemaCxtHasRules$1({ schema, self }) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (self.RULES.all[key])
      return true;
  return false;
}
function isSchemaObj$1(it) {
  return typeof it.schema != "boolean";
}
function subSchemaObjCode$1(it, valid2) {
  const { schema, gen, opts } = it;
  if (opts.$comment && schema.$comment)
    commentKeyword$1(it);
  updateContext$1(it);
  checkAsyncSchema$1(it);
  const errsCount = gen.const("_errs", names_1$d.default.errors);
  typeAndKeywords$1(it, errsCount);
  gen.var(valid2, (0, codegen_1$X._)`${errsCount} === ${names_1$d.default.errors}`);
}
function checkKeywords$1(it) {
  (0, util_1$Q.checkUnknownRules)(it);
  checkRefsAndKeywords$1(it);
}
function typeAndKeywords$1(it, errsCount) {
  if (it.opts.jtd)
    return schemaKeywords$1(it, [], false, errsCount);
  const types2 = (0, dataType_1$3.getSchemaTypes)(it.schema);
  const checkedTypes = (0, dataType_1$3.coerceAndCheckDataType)(it, types2);
  schemaKeywords$1(it, types2, !checkedTypes, errsCount);
}
function checkRefsAndKeywords$1(it) {
  const { schema, errSchemaPath, opts, self } = it;
  if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1$Q.schemaHasRulesButRef)(schema, self.RULES)) {
    self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
  }
}
function checkNoDefault$1(it) {
  const { schema, opts } = it;
  if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
    (0, util_1$Q.checkStrictMode)(it, "default is ignored in the schema root");
  }
}
function updateContext$1(it) {
  const schId = it.schema[it.opts.schemaId];
  if (schId)
    it.baseId = (0, resolve_1$5.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
}
function checkAsyncSchema$1(it) {
  if (it.schema.$async && !it.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function commentKeyword$1({ gen, schemaEnv, schema, errSchemaPath, opts }) {
  const msg = schema.$comment;
  if (opts.$comment === true) {
    gen.code((0, codegen_1$X._)`${names_1$d.default.self}.logger.log(${msg})`);
  } else if (typeof opts.$comment == "function") {
    const schemaPath = (0, codegen_1$X.str)`${errSchemaPath}/$comment`;
    const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
    gen.code((0, codegen_1$X._)`${names_1$d.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
  }
}
function returnResults$1(it) {
  const { gen, schemaEnv, validateName, ValidationError: ValidationError3, opts } = it;
  if (schemaEnv.$async) {
    gen.if((0, codegen_1$X._)`${names_1$d.default.errors} === 0`, () => gen.return(names_1$d.default.data), () => gen.throw((0, codegen_1$X._)`new ${ValidationError3}(${names_1$d.default.vErrors})`));
  } else {
    gen.assign((0, codegen_1$X._)`${validateName}.errors`, names_1$d.default.vErrors);
    if (opts.unevaluated)
      assignEvaluated$1(it);
    gen.return((0, codegen_1$X._)`${names_1$d.default.errors} === 0`);
  }
}
function assignEvaluated$1({ gen, evaluated, props, items: items2 }) {
  if (props instanceof codegen_1$X.Name)
    gen.assign((0, codegen_1$X._)`${evaluated}.props`, props);
  if (items2 instanceof codegen_1$X.Name)
    gen.assign((0, codegen_1$X._)`${evaluated}.items`, items2);
}
function schemaKeywords$1(it, types2, typeErrors, errsCount) {
  const { gen, schema, data, allErrors, opts, self } = it;
  const { RULES } = self;
  if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1$Q.schemaHasRulesButRef)(schema, RULES))) {
    gen.block(() => keywordCode$1(it, "$ref", RULES.all.$ref.definition));
    return;
  }
  if (!opts.jtd)
    checkStrictTypes$1(it, types2);
  gen.block(() => {
    for (const group of RULES.rules)
      groupKeywords(group);
    groupKeywords(RULES.post);
  });
  function groupKeywords(group) {
    if (!(0, applicability_1$2.shouldUseGroup)(schema, group))
      return;
    if (group.type) {
      gen.if((0, dataType_2$1.checkDataType)(group.type, data, opts.strictNumbers));
      iterateKeywords$1(it, group);
      if (types2.length === 1 && types2[0] === group.type && typeErrors) {
        gen.else();
        (0, dataType_2$1.reportTypeError)(it);
      }
      gen.endIf();
    } else {
      iterateKeywords$1(it, group);
    }
    if (!allErrors)
      gen.if((0, codegen_1$X._)`${names_1$d.default.errors} === ${errsCount || 0}`);
  }
}
function iterateKeywords$1(it, group) {
  const { gen, schema, opts: { useDefaults } } = it;
  if (useDefaults)
    (0, defaults_1$1.assignDefaults)(it, group.type);
  gen.block(() => {
    for (const rule of group.rules) {
      if ((0, applicability_1$2.shouldUseRule)(schema, rule)) {
        keywordCode$1(it, rule.keyword, rule.definition, group.type);
      }
    }
  });
}
function checkStrictTypes$1(it, types2) {
  if (it.schemaEnv.meta || !it.opts.strictTypes)
    return;
  checkContextTypes$1(it, types2);
  if (!it.opts.allowUnionTypes)
    checkMultipleTypes$1(it, types2);
  checkKeywordTypes$1(it, it.dataTypes);
}
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
    this.failResult((0, codegen_1$X.not)(condition), void 0, failAction);
  }
  fail(condition) {
    if (condition === void 0) {
      this.error();
      if (!this.allErrors)
        this.gen.if(false);
      return;
    }
    this.gen.if(condition);
    this.error();
    if (this.allErrors)
      this.gen.endIf();
    else
      this.gen.else();
  }
  fail$data(condition) {
    if (!this.$data)
      return this.fail(condition);
    const { schemaCode } = this;
    this.fail((0, codegen_1$X._)`${schemaCode} !== undefined && (${(0, codegen_1$X.or)(this.invalid$data(), condition)})`);
  }
  error(append, errorParams, errorPaths) {
    if (errorParams) {
      this.setParams(errorParams);
      this._error(append, errorPaths);
      this.setParams({});
      return;
    }
    this._error(append, errorPaths);
  }
  _error(append, errorPaths) {
    (append ? errors_1$4.reportExtraError : errors_1$4.reportError)(this, this.def.error, errorPaths);
  }
  $dataError() {
    (0, errors_1$4.reportError)(this, this.def.$dataError || errors_1$4.keyword$DataError);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
<<<<<<< HEAD
    (0, errors_1$4.resetErrorsCount)(this.gen, this.errsCount);
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
  block$data(valid2, codeBlock, $dataValid = codegen_1$X.nil) {
    this.gen.block(() => {
      this.check$data(valid2, $dataValid);
      codeBlock();
    });
  }
  check$data(valid2 = codegen_1$X.nil, $dataValid = codegen_1$X.nil) {
    if (!this.$data)
      return;
    const { gen, schemaCode, schemaType, def: def2 } = this;
    gen.if((0, codegen_1$X.or)((0, codegen_1$X._)`${schemaCode} === undefined`, $dataValid));
    if (valid2 !== codegen_1$X.nil)
      gen.assign(valid2, true);
    if (schemaType.length || def2.validateSchema) {
      gen.elseIf(this.invalid$data());
      this.$dataError();
      if (valid2 !== codegen_1$X.nil)
        gen.assign(valid2, false);
    }
    gen.else();
  }
  invalid$data() {
    const { gen, schemaCode, schemaType, def: def2, it } = this;
    return (0, codegen_1$X.or)(wrong$DataType(), invalid$DataSchema());
    function wrong$DataType() {
      if (schemaType.length) {
        if (!(schemaCode instanceof codegen_1$X.Name))
          throw new Error("ajv implementation error");
        const st = Array.isArray(schemaType) ? schemaType : [schemaType];
        return (0, codegen_1$X._)`${(0, dataType_2$1.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2$1.DataType.Wrong)}`;
      }
      return codegen_1$X.nil;
    }
    function invalid$DataSchema() {
      if (def2.validateSchema) {
        const validateSchemaRef = gen.scopeValue("validate$data", { ref: def2.validateSchema });
        return (0, codegen_1$X._)`!${validateSchemaRef}(${schemaCode})`;
      }
      return codegen_1$X.nil;
    }
  }
  subschema(appl, valid2) {
    const subschema2 = (0, subschema_1$1.getSubschema)(this.it, appl);
    (0, subschema_1$1.extendSubschemaData)(subschema2, this.it, appl);
    (0, subschema_1$1.extendSubschemaMode)(subschema2, appl);
    const nextContext = { ...this.it, ...subschema2, items: void 0, props: void 0 };
    subschemaCode$1(nextContext, valid2);
    return nextContext;
  }
  mergeEvaluated(schemaCxt, toName) {
    const { it, gen } = this;
    if (!it.opts.unevaluated)
      return;
    if (it.props !== true && schemaCxt.props !== void 0) {
      it.props = util_1$Q.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
    }
    if (it.items !== true && schemaCxt.items !== void 0) {
      it.items = util_1$Q.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
    }
  }
  mergeValidEvaluated(schemaCxt, valid2) {
    const { it, gen } = this;
    if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
      gen.if(valid2, () => this.mergeEvaluated(schemaCxt, codegen_1$X.Name));
      return true;
    }
  }
};
validate$1.KeywordCxt = KeywordCxt$1;
function keywordCode$1(it, keyword2, def2, ruleType) {
  const cxt = new KeywordCxt$1(it, def2, keyword2);
  if ("code" in def2) {
    def2.code(cxt, ruleType);
  } else if (cxt.$data && def2.validate) {
    (0, keyword_1$1.funcKeywordCode)(cxt, def2);
  } else if ("macro" in def2) {
    (0, keyword_1$1.macroKeywordCode)(cxt, def2);
  } else if (def2.compile || def2.validate) {
    (0, keyword_1$1.funcKeywordCode)(cxt, def2);
  }
}
const JSON_POINTER$1 = /^\/(?:[^~]|~0|~1)*$/;
const RELATIVE_JSON_POINTER$1 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData$1($data, { dataLevel, dataNames, dataPathArr }) {
  let jsonPointer;
  let data;
  if ($data === "")
    return names_1$d.default.rootData;
  if ($data[0] === "/") {
    if (!JSON_POINTER$1.test($data))
      throw new Error(`Invalid JSON-pointer: ${$data}`);
    jsonPointer = $data;
    data = names_1$d.default.rootData;
  } else {
    const matches = RELATIVE_JSON_POINTER$1.exec($data);
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
      data = (0, codegen_1$X._)`${data}${(0, codegen_1$X.getProperty)((0, util_1$Q.unescapeJsonPointer)(segment))}`;
      expr = (0, codegen_1$X._)`${expr} && ${data}`;
    }
  }
  return expr;
  function errorMsg(pointerType, up) {
    return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
  }
}
validate$1.getData = getData$1;
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
const names_1$c = names$3;
const resolve_1$3 = resolve$4;
const util_1$P = util$1;
const validate_1$3 = validate$1;
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
  }
};
compile$1.SchemaEnv = SchemaEnv$1;
function compileSchema$1(sch) {
  const _sch = getCompilingSchema$1.call(this, sch);
  if (_sch)
    return _sch;
  const rootId = (0, resolve_1$3.getFullPath)(this.opts.uriResolver, sch.root.baseId);
  const { es5, lines } = this.opts.code;
  const { ownProperties } = this.opts;
  const gen = new codegen_1$W.CodeGen(this.scope, { es5, lines, ownProperties });
  let _ValidationError;
  if (sch.$async) {
    _ValidationError = gen.scopeValue("Error", {
      ref: validation_error_1$1.default,
      code: (0, codegen_1$W._)`require("ajv/dist/runtime/validation_error").default`
    });
  }
  const validateName = gen.scopeName("validate");
  sch.validateName = validateName;
  const schemaCxt = {
    gen,
    allErrors: this.opts.allErrors,
    data: names_1$c.default.data,
    parentData: names_1$c.default.parentData,
    parentDataProperty: names_1$c.default.parentDataProperty,
    dataNames: [names_1$c.default.data],
    dataPathArr: [codegen_1$W.nil],
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
    topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1$W.stringify)(sch.schema) } : { ref: sch.schema }),
    validateName,
    ValidationError: _ValidationError,
    schema: sch.schema,
    schemaEnv: sch,
    rootId,
    baseId: sch.baseId || rootId,
    schemaPath: codegen_1$W.nil,
    errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, codegen_1$W._)`""`,
    opts: this.opts,
    self: this
  };
  let sourceCode;
  try {
<<<<<<< HEAD
    this._compilations.add(sch);
    (0, validate_1$3.validateFunctionCode)(schemaCxt);
    gen.optimize(this.opts.code.optimize);
    const validateCode = gen.toString();
    sourceCode = `${gen.scopeRefs(names_1$c.default.scope)}return ${validateCode}`;
    if (this.opts.code.process)
      sourceCode = this.opts.code.process(sourceCode, sch);
    const makeValidate = new Function(`${names_1$c.default.self}`, `${names_1$c.default.scope}`, sourceCode);
    const validate2 = makeValidate(this, this.scope.get());
    this.scope.value(validateName, { ref: validate2 });
    validate2.errors = null;
    validate2.schema = sch.schema;
    validate2.schemaEnv = sch;
    if (sch.$async)
      validate2.$async = true;
    if (this.opts.code.source === true) {
      validate2.source = { validateName, validateCode, scopeValues: gen._values };
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    if (this.opts.unevaluated) {
      const { props, items: items2 } = schemaCxt;
      validate2.evaluated = {
        props: props instanceof codegen_1$W.Name ? void 0 : props,
        items: items2 instanceof codegen_1$W.Name ? void 0 : items2,
        dynamicProps: props instanceof codegen_1$W.Name,
        dynamicItems: items2 instanceof codegen_1$W.Name
      };
      if (validate2.source)
        validate2.source.evaluated = (0, codegen_1$W.stringify)(validate2.evaluated);
    }
    sch.validate = validate2;
    return sch;
  } catch (e) {
    delete sch.validate;
    delete sch.validateName;
    if (sourceCode)
      this.logger.error("Error compiling schema, function code:", sourceCode);
    throw e;
  } finally {
    this._compilations.delete(sch);
  }
}
<<<<<<< HEAD
compile$1.compileSchema = compileSchema$1;
function resolveRef$1(root, baseId, ref2) {
  var _a;
  ref2 = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, baseId, ref2);
  const schOrFunc = root.refs[ref2];
  if (schOrFunc)
    return schOrFunc;
  let _sch = resolve$3.call(this, root, ref2);
  if (_sch === void 0) {
    const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref2];
    const { schemaId } = this.opts;
    if (schema)
      _sch = new SchemaEnv$1({ schema, schemaId, root, baseId });
  }
  if (_sch === void 0)
    return;
  return root.refs[ref2] = inlineOrCompile$1.call(this, _sch);
}
compile$1.resolveRef = resolveRef$1;
function inlineOrCompile$1(sch) {
  if ((0, resolve_1$3.inlineRef)(sch.schema, this.opts.inlineRefs))
    return sch.schema;
  return sch.validate ? sch : compileSchema$1.call(this, sch);
}
function getCompilingSchema$1(schEnv) {
  for (const sch of this._compilations) {
    if (sameSchemaEnv$1(sch, schEnv))
      return sch;
  }
}
compile$1.getCompilingSchema = getCompilingSchema$1;
function sameSchemaEnv$1(s1, s2) {
  return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
}
function resolve$3(root, ref2) {
  let sch;
  while (typeof (sch = this.refs[ref2]) == "string")
    ref2 = sch;
  return sch || this.schemas[ref2] || resolveSchema$1.call(this, root, ref2);
}
function resolveSchema$1(root, ref2) {
  const p = this.opts.uriResolver.parse(ref2);
  const refPath = (0, resolve_1$3._getFullPath)(this.opts.uriResolver, p);
  let baseId = (0, resolve_1$3.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
  if (Object.keys(root.schema).length > 0 && refPath === baseId) {
    return getJsonPointer$1.call(this, p, root);
  }
  const id2 = (0, resolve_1$3.normalizeId)(refPath);
  const schOrRef = this.refs[id2] || this.schemas[id2];
  if (typeof schOrRef == "string") {
    const sch = resolveSchema$1.call(this, root, schOrRef);
    if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
      return;
    return getJsonPointer$1.call(this, p, sch);
  }
  if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
    return;
  if (!schOrRef.validate)
    compileSchema$1.call(this, schOrRef);
  if (id2 === (0, resolve_1$3.normalizeId)(ref2)) {
    const { schema } = schOrRef;
    const { schemaId } = this.opts;
    const schId = schema[schemaId];
    if (schId)
      baseId = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, baseId, schId);
    return new SchemaEnv$1({ schema, schemaId, root, baseId });
  }
  return getJsonPointer$1.call(this, p, schOrRef);
}
compile$1.resolveSchema = resolveSchema$1;
const PREVENT_SCOPE_CHANGE$1 = /* @__PURE__ */ new Set([
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
<<<<<<< HEAD
function getJsonPointer$1(parsedRef, { baseId, schema, root }) {
  var _a;
  if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
=======
function Es(e, { baseId: t, schema: r, root: n }) {
  var s;
  if (((s = e.fragment) === null || s === void 0 ? void 0 : s[0]) !== "/")
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    return;
  for (const part of parsedRef.fragment.slice(1).split("/")) {
    if (typeof schema === "boolean")
      return;
    const partSchema = schema[(0, util_1$P.unescapeFragment)(part)];
    if (partSchema === void 0)
      return;
<<<<<<< HEAD
    schema = partSchema;
    const schId = typeof schema === "object" && schema[this.opts.schemaId];
    if (!PREVENT_SCOPE_CHANGE$1.has(part) && schId) {
      baseId = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, baseId, schId);
    }
  }
  let env2;
  if (typeof schema != "boolean" && schema.$ref && !(0, util_1$P.schemaHasRulesButRef)(schema, this.RULES)) {
    const $ref = (0, resolve_1$3.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
    env2 = resolveSchema$1.call(this, root, $ref);
=======
    r = l;
    const d = typeof r == "object" && r[this.opts.schemaId];
    !Wf.has(c) && d && (t = (0, tt.resolveUrl)(this.opts.uriResolver, t, d));
  }
  let a;
  if (typeof r != "boolean" && r.$ref && !(0, gi.schemaHasRulesButRef)(r, this.RULES)) {
    const c = (0, tt.resolveUrl)(this.opts.uriResolver, t, r.$ref);
    a = ts.call(this, n, c);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  const { schemaId } = this.opts;
  env2 = env2 || new SchemaEnv$1({ schema, schemaId, root, baseId });
  if (env2.schema !== env2.root.schema)
    return env2;
  return void 0;
}
<<<<<<< HEAD
const $id$a = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#";
const description$1 = "Meta-schema for $data reference (JSON AnySchema extension proposal)";
const type$a = "object";
const required$3 = [
  "$data"
];
const properties$c = {
=======
const Xf = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Yf = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Qf = "object", Zf = [
  "$data"
], xf = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
};
const additionalProperties$3 = false;
const require$$9$1 = {
  $id: $id$a,
  description: description$1,
  type: type$a,
  required: required$3,
  properties: properties$c,
  additionalProperties: additionalProperties$3
};
var uri$3 = {};
var fastUri$1 = { exports: {} };
const isUUID$1 = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);
const isIPv4$1 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
function stringArrayToHexStripped(input) {
  let acc = "";
  let code2 = 0;
  let i = 0;
  for (i = 0; i < input.length; i++) {
    code2 = input[i].charCodeAt(0);
    if (code2 === 48) {
      continue;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    if (!(code2 >= 48 && code2 <= 57 || code2 >= 65 && code2 <= 70 || code2 >= 97 && code2 <= 102)) {
      return "";
    }
    acc += input[i];
    break;
  }
<<<<<<< HEAD
  for (i += 1; i < input.length; i++) {
    code2 = input[i].charCodeAt(0);
    if (!(code2 >= 48 && code2 <= 57 || code2 >= 65 && code2 <= 70 || code2 >= 97 && code2 <= 102)) {
      return "";
    }
    acc += input[i];
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return acc;
}
<<<<<<< HEAD
const nonSimpleDomain$1 = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
function consumeIsZone(buffer) {
  buffer.length = 0;
  return true;
}
function consumeHextets(buffer, address, output) {
  if (buffer.length) {
    const hex = stringArrayToHexStripped(buffer);
    if (hex !== "") {
      address.push(hex);
    } else {
      output.error = true;
      return false;
    }
    buffer.length = 0;
  }
  return true;
}
function getIPV6(input) {
  let tokenCount = 0;
  const output = { error: false, address: "", zone: "" };
  const address = [];
  const buffer = [];
  let endipv6Encountered = false;
  let endIpv6 = false;
  let consume = consumeHextets;
  for (let i = 0; i < input.length; i++) {
    const cursor = input[i];
    if (cursor === "[" || cursor === "]") {
      continue;
    }
    if (cursor === ":") {
      if (endipv6Encountered === true) {
        endIpv6 = true;
      }
      if (!consume(buffer, address, output)) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        break;
      }
      if (++tokenCount > 7) {
        output.error = true;
        break;
      }
      if (i > 0 && input[i - 1] === ":") {
        endipv6Encountered = true;
      }
      address.push(":");
      continue;
    } else if (cursor === "%") {
      if (!consume(buffer, address, output)) {
        break;
      }
      consume = consumeIsZone;
    } else {
      buffer.push(cursor);
      continue;
    }
  }
  if (buffer.length) {
    if (consume === consumeIsZone) {
      output.zone = buffer.join("");
    } else if (endIpv6) {
      address.push(buffer.join(""));
    } else {
      address.push(stringArrayToHexStripped(buffer));
    }
  }
  output.address = address.join("");
  return output;
}
function normalizeIPv6$1(host) {
  if (findToken(host, ":") < 2) {
    return { host, isIPV6: false };
  }
  const ipv6 = getIPV6(host);
  if (!ipv6.error) {
    let newHost = ipv6.address;
    let escapedHost = ipv6.address;
    if (ipv6.zone) {
      newHost += "%" + ipv6.zone;
      escapedHost += "%25" + ipv6.zone;
    }
    return { host: newHost, isIPV6: true, escapedHost };
  } else {
    return { host, isIPV6: false };
  }
}
function findToken(str, token) {
  let ind = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === token) ind++;
  }
  return ind;
}
function removeDotSegments$1(path2) {
  let input = path2;
  const output = [];
  let nextSlash = -1;
  let len = 0;
  while (len = input.length) {
    if (len === 1) {
      if (input === ".") {
        break;
      } else if (input === "/") {
        output.push("/");
        break;
      } else {
        output.push(input);
        break;
      }
    } else if (len === 2) {
      if (input[0] === ".") {
        if (input[1] === ".") {
          break;
        } else if (input[1] === "/") {
          input = input.slice(2);
          continue;
        }
      } else if (input[0] === "/") {
        if (input[1] === "." || input[1] === "/") {
          output.push("/");
          break;
        }
      }
    } else if (len === 3) {
      if (input === "/..") {
        if (output.length !== 0) {
          output.pop();
        }
        output.push("/");
        break;
      }
    }
    if (input[0] === ".") {
      if (input[1] === ".") {
        if (input[2] === "/") {
          input = input.slice(3);
          continue;
        }
      } else if (input[1] === "/") {
        input = input.slice(2);
        continue;
      }
    } else if (input[0] === "/") {
      if (input[1] === ".") {
        if (input[2] === "/") {
          input = input.slice(2);
          continue;
        } else if (input[2] === ".") {
          if (input[3] === "/") {
            input = input.slice(3);
            if (output.length !== 0) {
              output.pop();
            }
            continue;
          }
        }
      }
    }
    if ((nextSlash = input.indexOf("/", 1)) === -1) {
      output.push(input);
      break;
<<<<<<< HEAD
    } else {
      output.push(input.slice(0, nextSlash));
      input = input.slice(nextSlash);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
  }
  return output.join("");
}
<<<<<<< HEAD
function normalizeComponentEncoding$1(component, esc) {
  const func = esc !== true ? escape : unescape;
  if (component.scheme !== void 0) {
    component.scheme = func(component.scheme);
  }
  if (component.userinfo !== void 0) {
    component.userinfo = func(component.userinfo);
  }
  if (component.host !== void 0) {
    component.host = func(component.host);
  }
  if (component.path !== void 0) {
    component.path = func(component.path);
  }
  if (component.query !== void 0) {
    component.query = func(component.query);
  }
  if (component.fragment !== void 0) {
    component.fragment = func(component.fragment);
  }
  return component;
}
function recomposeAuthority$1(component) {
  const uriTokens = [];
  if (component.userinfo !== void 0) {
    uriTokens.push(component.userinfo);
    uriTokens.push("@");
  }
  if (component.host !== void 0) {
    let host = unescape(component.host);
    if (!isIPv4$1(host)) {
      const ipV6res = normalizeIPv6$1(host);
      if (ipV6res.isIPV6 === true) {
        host = `[${ipV6res.escapedHost}]`;
      } else {
        host = component.host;
      }
    }
    uriTokens.push(host);
  }
  if (typeof component.port === "number" || typeof component.port === "string") {
    uriTokens.push(":");
    uriTokens.push(String(component.port));
  }
  return uriTokens.length ? uriTokens.join("") : void 0;
}
var utils = {
  nonSimpleDomain: nonSimpleDomain$1,
  recomposeAuthority: recomposeAuthority$1,
  normalizeComponentEncoding: normalizeComponentEncoding$1,
  removeDotSegments: removeDotSegments$1,
  isIPv4: isIPv4$1,
  isUUID: isUUID$1,
  normalizeIPv6: normalizeIPv6$1
};
const { isUUID } = utils;
const URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;
function wsIsSecure(wsComponent) {
  if (wsComponent.secure === true) {
    return true;
  } else if (wsComponent.secure === false) {
    return false;
  } else if (wsComponent.scheme) {
    return wsComponent.scheme.length === 3 && (wsComponent.scheme[0] === "w" || wsComponent.scheme[0] === "W") && (wsComponent.scheme[1] === "s" || wsComponent.scheme[1] === "S") && (wsComponent.scheme[2] === "s" || wsComponent.scheme[2] === "S");
  } else {
    return false;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
}
<<<<<<< HEAD
function httpParse(component) {
  if (!component.host) {
    component.error = component.error || "HTTP URIs must have a host.";
  }
  return component;
}
function httpSerialize(component) {
  const secure = String(component.scheme).toLowerCase() === "https";
  if (component.port === (secure ? 443 : 80) || component.port === "") {
    component.port = void 0;
  }
  if (!component.path) {
    component.path = "/";
  }
  return component;
}
function wsParse(wsComponent) {
  wsComponent.secure = wsIsSecure(wsComponent);
  wsComponent.resourceName = (wsComponent.path || "/") + (wsComponent.query ? "?" + wsComponent.query : "");
  wsComponent.path = void 0;
  wsComponent.query = void 0;
  return wsComponent;
}
function wsSerialize(wsComponent) {
  if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === "") {
    wsComponent.port = void 0;
  }
  if (typeof wsComponent.secure === "boolean") {
    wsComponent.scheme = wsComponent.secure ? "wss" : "ws";
    wsComponent.secure = void 0;
  }
  if (wsComponent.resourceName) {
    const [path2, query] = wsComponent.resourceName.split("?");
    wsComponent.path = path2 && path2 !== "/" ? path2 : void 0;
    wsComponent.query = query;
    wsComponent.resourceName = void 0;
  }
  wsComponent.fragment = void 0;
  return wsComponent;
}
function urnParse(urnComponent, options) {
  if (!urnComponent.path) {
    urnComponent.error = "URN can not be parsed";
    return urnComponent;
  }
  const matches = urnComponent.path.match(URN_REG);
  if (matches) {
    const scheme = options.scheme || urnComponent.scheme || "urn";
    urnComponent.nid = matches[1].toLowerCase();
    urnComponent.nss = matches[2];
    const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
    const schemeHandler = getSchemeHandler$1(urnScheme);
    urnComponent.path = void 0;
    if (schemeHandler) {
      urnComponent = schemeHandler.parse(urnComponent, options);
    }
  } else {
    urnComponent.error = urnComponent.error || "URN can not be parsed.";
  }
  return urnComponent;
}
function urnSerialize(urnComponent, options) {
  if (urnComponent.nid === void 0) {
    throw new Error("URN without nid cannot be serialized");
  }
  const scheme = options.scheme || urnComponent.scheme || "urn";
  const nid = urnComponent.nid.toLowerCase();
  const urnScheme = `${scheme}:${options.nid || nid}`;
  const schemeHandler = getSchemeHandler$1(urnScheme);
  if (schemeHandler) {
    urnComponent = schemeHandler.serialize(urnComponent, options);
  }
  const uriComponent = urnComponent;
  const nss = urnComponent.nss;
  uriComponent.path = `${nid || options.nid}:${nss}`;
  options.skipEscape = true;
  return uriComponent;
}
function urnuuidParse(urnComponent, options) {
  const uuidComponent = urnComponent;
  uuidComponent.uuid = uuidComponent.nss;
  uuidComponent.nss = void 0;
  if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
    uuidComponent.error = uuidComponent.error || "UUID is not valid.";
  }
  return uuidComponent;
}
function urnuuidSerialize(uuidComponent) {
  const urnComponent = uuidComponent;
  urnComponent.nss = (uuidComponent.uuid || "").toLowerCase();
  return urnComponent;
}
const http = (
  /** @type {SchemeHandler} */
  {
    scheme: "http",
    domainHost: true,
    parse: httpParse,
    serialize: httpSerialize
  }
);
const https = (
  /** @type {SchemeHandler} */
  {
    scheme: "https",
    domainHost: http.domainHost,
    parse: httpParse,
    serialize: httpSerialize
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
);
const ws = (
  /** @type {SchemeHandler} */
  {
    scheme: "ws",
<<<<<<< HEAD
    domainHost: true,
    parse: wsParse,
    serialize: wsSerialize
  }
);
const wss = (
=======
    domainHost: !0,
    parse: fh,
    serialize: hh
  }
), _h = (
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  /** @type {SchemeHandler} */
  {
    scheme: "wss",
    domainHost: ws.domainHost,
    parse: ws.parse,
    serialize: ws.serialize
  }
<<<<<<< HEAD
);
const urn = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn",
    parse: urnParse,
    serialize: urnSerialize,
    skipNormalize: true
  }
);
const urnuuid = (
  /** @type {SchemeHandler} */
  {
    scheme: "urn:uuid",
    parse: urnuuidParse,
    serialize: urnuuidSerialize,
    skipNormalize: true
  }
);
const SCHEMES$1 = (
  /** @type {Record<SchemeName, SchemeHandler>} */
  {
    http,
    https,
    ws,
    wss,
    urn,
    "urn:uuid": urnuuid
  }
);
Object.setPrototypeOf(SCHEMES$1, null);
function getSchemeHandler$1(scheme) {
  return scheme && (SCHEMES$1[
    /** @type {SchemeName} */
    scheme
  ] || SCHEMES$1[
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    /** @type {SchemeName} */
    scheme.toLowerCase()
  ]) || void 0;
}
<<<<<<< HEAD
var schemes = {
  SCHEMES: SCHEMES$1,
  getSchemeHandler: getSchemeHandler$1
};
const { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizeComponentEncoding, isIPv4, nonSimpleDomain } = utils;
const { SCHEMES, getSchemeHandler } = schemes;
function normalize(uri2, options) {
  if (typeof uri2 === "string") {
    uri2 = /** @type {T} */
    serialize(parse$7(uri2, options), options);
  } else if (typeof uri2 === "object") {
    uri2 = /** @type {T} */
    parse$7(serialize(uri2, options), options);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return uri2;
}
<<<<<<< HEAD
function resolve$2(baseURI, relativeURI, options) {
  const schemelessOptions = options ? Object.assign({ scheme: "null" }, options) : { scheme: "null" };
  const resolved = resolveComponent(parse$7(baseURI, schemelessOptions), parse$7(relativeURI, schemelessOptions), schemelessOptions, true);
  schemelessOptions.skipEscape = true;
  return serialize(resolved, schemelessOptions);
}
function resolveComponent(base, relative, options, skipNormalization) {
  const target = {};
  if (!skipNormalization) {
    base = parse$7(serialize(base, options), options);
    relative = parse$7(serialize(relative, options), options);
  }
  options = options || {};
  if (!options.tolerant && relative.scheme) {
    target.scheme = relative.scheme;
    target.userinfo = relative.userinfo;
    target.host = relative.host;
    target.port = relative.port;
    target.path = removeDotSegments(relative.path || "");
    target.query = relative.query;
  } else {
    if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
      target.userinfo = relative.userinfo;
      target.host = relative.host;
      target.port = relative.port;
      target.path = removeDotSegments(relative.path || "");
      target.query = relative.query;
    } else {
      if (!relative.path) {
        target.path = base.path;
        if (relative.query !== void 0) {
          target.query = relative.query;
        } else {
          target.query = base.query;
        }
      } else {
        if (relative.path[0] === "/") {
          target.path = removeDotSegments(relative.path);
        } else {
          if ((base.userinfo !== void 0 || base.host !== void 0 || base.port !== void 0) && !base.path) {
            target.path = "/" + relative.path;
          } else if (!base.path) {
            target.path = relative.path;
          } else {
            target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
          }
          target.path = removeDotSegments(target.path);
        }
        target.query = relative.query;
      }
      target.userinfo = base.userinfo;
      target.host = base.host;
      target.port = base.port;
    }
    target.scheme = base.scheme;
  }
  target.fragment = relative.fragment;
  return target;
}
function equal$5(uriA, uriB, options) {
  if (typeof uriA === "string") {
    uriA = unescape(uriA);
    uriA = serialize(normalizeComponentEncoding(parse$7(uriA, options), true), { ...options, skipEscape: true });
  } else if (typeof uriA === "object") {
    uriA = serialize(normalizeComponentEncoding(uriA, true), { ...options, skipEscape: true });
  }
  if (typeof uriB === "string") {
    uriB = unescape(uriB);
    uriB = serialize(normalizeComponentEncoding(parse$7(uriB, options), true), { ...options, skipEscape: true });
  } else if (typeof uriB === "object") {
    uriB = serialize(normalizeComponentEncoding(uriB, true), { ...options, skipEscape: true });
  }
  return uriA.toLowerCase() === uriB.toLowerCase();
}
function serialize(cmpts, opts) {
  const component = {
    host: cmpts.host,
    scheme: cmpts.scheme,
    userinfo: cmpts.userinfo,
    port: cmpts.port,
    path: cmpts.path,
    query: cmpts.query,
    nid: cmpts.nid,
    nss: cmpts.nss,
    uuid: cmpts.uuid,
    fragment: cmpts.fragment,
    reference: cmpts.reference,
    resourceName: cmpts.resourceName,
    secure: cmpts.secure,
    error: ""
  };
  const options = Object.assign({}, opts);
  const uriTokens = [];
  const schemeHandler = getSchemeHandler(options.scheme || component.scheme);
  if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);
  if (component.path !== void 0) {
    if (!options.skipEscape) {
      component.path = escape(component.path);
      if (component.scheme !== void 0) {
        component.path = component.path.split("%3A").join(":");
      }
    } else {
      component.path = unescape(component.path);
    }
  }
  if (options.reference !== "suffix" && component.scheme) {
    uriTokens.push(component.scheme, ":");
  }
  const authority = recomposeAuthority(component);
  if (authority !== void 0) {
    if (options.reference !== "suffix") {
      uriTokens.push("//");
    }
    uriTokens.push(authority);
    if (component.path && component.path[0] !== "/") {
      uriTokens.push("/");
    }
  }
  if (component.path !== void 0) {
    let s = component.path;
    if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
      s = removeDotSegments(s);
    }
    if (authority === void 0 && s[0] === "/" && s[1] === "/") {
      s = "/%2F" + s.slice(2);
    }
    uriTokens.push(s);
  }
  if (component.query !== void 0) {
    uriTokens.push("?", component.query);
  }
  if (component.fragment !== void 0) {
    uriTokens.push("#", component.fragment);
  }
  return uriTokens.join("");
}
const URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function parse$7(uri2, opts) {
  const options = Object.assign({}, opts);
  const parsed = {
=======
const jh = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
function Et(e, t) {
  const r = Object.assign({}, t), n = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    scheme: void 0,
    userinfo: void 0,
    host: "",
    port: void 0,
    path: "",
    query: void 0,
    fragment: void 0
  };
<<<<<<< HEAD
  let isIP = false;
  if (options.reference === "suffix") {
    if (options.scheme) {
      uri2 = options.scheme + ":" + uri2;
    } else {
      uri2 = "//" + uri2;
    }
  }
  const matches = uri2.match(URI_PARSE);
  if (matches) {
    parsed.scheme = matches[1];
    parsed.userinfo = matches[3];
    parsed.host = matches[4];
    parsed.port = parseInt(matches[5], 10);
    parsed.path = matches[6] || "";
    parsed.query = matches[7];
    parsed.fragment = matches[8];
    if (isNaN(parsed.port)) {
      parsed.port = matches[5];
    }
    if (parsed.host) {
      const ipv4result = isIPv4(parsed.host);
      if (ipv4result === false) {
        const ipv6result = normalizeIPv6(parsed.host);
        parsed.host = ipv6result.host.toLowerCase();
        isIP = ipv6result.isIPV6;
      } else {
        isIP = true;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
    }
    if (parsed.scheme === void 0 && parsed.userinfo === void 0 && parsed.host === void 0 && parsed.port === void 0 && parsed.query === void 0 && !parsed.path) {
      parsed.reference = "same-document";
    } else if (parsed.scheme === void 0) {
      parsed.reference = "relative";
    } else if (parsed.fragment === void 0) {
      parsed.reference = "absolute";
    } else {
      parsed.reference = "uri";
    }
    if (options.reference && options.reference !== "suffix" && options.reference !== parsed.reference) {
      parsed.error = parsed.error || "URI is not a " + options.reference + " reference.";
    }
    const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);
    if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
      if (parsed.host && (options.domainHost || schemeHandler && schemeHandler.domainHost) && isIP === false && nonSimpleDomain(parsed.host)) {
        try {
          parsed.host = URL.domainToASCII(parsed.host.toLowerCase());
        } catch (e) {
          parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
        }
      }
    }
    if (!schemeHandler || schemeHandler && !schemeHandler.skipNormalize) {
      if (uri2.indexOf("%") !== -1) {
        if (parsed.scheme !== void 0) {
          parsed.scheme = unescape(parsed.scheme);
        }
        if (parsed.host !== void 0) {
          parsed.host = unescape(parsed.host);
        }
      }
      if (parsed.path) {
        parsed.path = escape(unescape(parsed.path));
      }
      if (parsed.fragment) {
        parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
      }
    }
    if (schemeHandler && schemeHandler.parse) {
      schemeHandler.parse(parsed, options);
    }
  } else {
    parsed.error = parsed.error || "URI can not be parsed.";
  }
  return parsed;
}
<<<<<<< HEAD
const fastUri = {
  SCHEMES,
  normalize,
  resolve: resolve$2,
  resolveComponent,
  equal: equal$5,
  serialize,
  parse: parse$7
};
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
  var validate_12 = validate$1;
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } });
  var codegen_12 = codegen$1;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_12._;
  } });
<<<<<<< HEAD
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
  const validation_error_12 = validation_error$1;
  const ref_error_12 = ref_error$1;
  const rules_12 = rules$1;
  const compile_12 = compile$1;
  const codegen_2 = codegen$1;
  const resolve_12 = resolve$4;
  const dataType_12 = dataType$1;
  const util_12 = util$1;
  const $dataRefSchema = require$$9$1;
  const uri_1 = uri$3;
  const defaultRegExp = (str, flags) => new RegExp(str, flags);
  defaultRegExp.code = "new RegExp";
  const META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
  const EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
=======
  const n = xr, s = _r, a = xt, o = Fe, c = ee, l = Te, d = be, u = L, h = th, w = ya, $ = (N, p) => new RegExp(N, p);
  $.code = "new RegExp";
  const y = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
  ]);
  const removedOptions = {
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
  };
  const deprecatedOptions = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
<<<<<<< HEAD
  };
  const MAX_EXPRESSION = 200;
  function requiredOptions(o) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    const s = o.strict;
    const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
    const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
    const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
    const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
    return {
      strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
      strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
      strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
      strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
      strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
      code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
      loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
      loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
      meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
      messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
      inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
      schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
      addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
      validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
      validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
      unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
      int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
      uriResolver
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    };
  }
  class Ajv {
    constructor(opts = {}) {
      this.schemas = {};
      this.refs = {};
      this.formats = {};
      this._compilations = /* @__PURE__ */ new Set();
      this._loading = {};
      this._cache = /* @__PURE__ */ new Map();
      opts = this.opts = { ...opts, ...requiredOptions(opts) };
      const { es5, lines } = this.opts.code;
      this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
      this.logger = getLogger(opts.logger);
      const formatOpt = opts.validateFormats;
      opts.validateFormats = false;
      this.RULES = (0, rules_12.getRules)();
      checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
      checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
      this._metaOpts = getMetaSchemaOptions.call(this);
      if (opts.formats)
        addInitialFormats.call(this);
      this._addVocabularies();
      this._addDefaultMetaSchema();
      if (opts.keywords)
        addInitialKeywords.call(this, opts.keywords);
      if (typeof opts.meta == "object")
        this.addMetaSchema(opts.meta);
      addInitialSchemas.call(this);
      opts.validateFormats = formatOpt;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data, meta, schemaId } = this.opts;
      let _dataRefSchema = $dataRefSchema;
      if (schemaId === "id") {
        _dataRefSchema = { ...$dataRefSchema };
        _dataRefSchema.id = _dataRefSchema.$id;
        delete _dataRefSchema.$id;
      }
      if (meta && $data)
        this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
    }
    defaultMeta() {
      const { meta, schemaId } = this.opts;
      return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
    }
    validate(schemaKeyRef, data) {
      let v;
      if (typeof schemaKeyRef == "string") {
        v = this.getSchema(schemaKeyRef);
        if (!v)
          throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
      } else {
        v = this.compile(schemaKeyRef);
      }
      const valid2 = v(data);
      if (!("$async" in v))
        this.errors = v.errors;
      return valid2;
    }
    compile(schema, _meta) {
      const sch = this._addSchema(schema, _meta);
      return sch.validate || this._compileSchemaEnv(sch);
    }
    compileAsync(schema, meta) {
      if (typeof this.opts.loadSchema != "function") {
        throw new Error("options.loadSchema should be a function");
      }
      const { loadSchema } = this.opts;
      return runCompileAsync.call(this, schema, meta);
      async function runCompileAsync(_schema, _meta) {
        await loadMetaSchema.call(this, _schema.$schema);
        const sch = this._addSchema(_schema, _meta);
        return sch.validate || _compileAsync.call(this, sch);
      }
      async function loadMetaSchema($ref) {
        if ($ref && !this.getSchema($ref)) {
          await runCompileAsync.call(this, { $ref }, true);
        }
      }
      async function _compileAsync(sch) {
        try {
          return this._compileSchemaEnv(sch);
        } catch (e) {
          if (!(e instanceof ref_error_12.default))
            throw e;
          checkLoaded.call(this, e);
          await loadMissingSchema.call(this, e.missingSchema);
          return _compileAsync.call(this, sch);
        }
      }
      function checkLoaded({ missingSchema: ref2, missingRef }) {
        if (this.refs[ref2]) {
          throw new Error(`AnySchema ${ref2} is loaded but ${missingRef} cannot be resolved`);
        }
      }
      async function loadMissingSchema(ref2) {
        const _schema = await _loadSchema.call(this, ref2);
        if (!this.refs[ref2])
          await loadMetaSchema.call(this, _schema.$schema);
        if (!this.refs[ref2])
          this.addSchema(_schema, ref2, meta);
      }
      async function _loadSchema(ref2) {
        const p = this._loading[ref2];
        if (p)
          return p;
        try {
          return await (this._loading[ref2] = loadSchema(ref2));
        } finally {
          delete this._loading[ref2];
        }
      }
    }
    // Adds schema to the instance
    addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
      if (Array.isArray(schema)) {
        for (const sch of schema)
          this.addSchema(sch, void 0, _meta, _validateSchema);
        return this;
      }
      let id2;
      if (typeof schema === "object") {
        const { schemaId } = this.opts;
        id2 = schema[schemaId];
        if (id2 !== void 0 && typeof id2 != "string") {
          throw new Error(`schema ${schemaId} must be string`);
        }
      }
      key = (0, resolve_12.normalizeId)(key || id2);
      this._checkUnique(key);
      this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
      return this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
      this.addSchema(schema, key, true, _validateSchema);
      return this;
    }
    //  Validate schema against its meta-schema
    validateSchema(schema, throwOrLogError) {
      if (typeof schema == "boolean")
        return true;
      let $schema2;
      $schema2 = schema.$schema;
      if ($schema2 !== void 0 && typeof $schema2 != "string") {
        throw new Error("$schema must be a string");
      }
      $schema2 = $schema2 || this.opts.defaultMeta || this.defaultMeta();
      if (!$schema2) {
        this.logger.warn("meta-schema not available");
        this.errors = null;
        return true;
      }
      const valid2 = this.validate($schema2, schema);
      if (!valid2 && throwOrLogError) {
        const message = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(message);
        else
          throw new Error(message);
      }
      return valid2;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(keyRef) {
      let sch;
      while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
        keyRef = sch;
      if (sch === void 0) {
        const { schemaId } = this.opts;
        const root = new compile_12.SchemaEnv({ schema: {}, schemaId });
        sch = compile_12.resolveSchema.call(this, root, keyRef);
        if (!sch)
          return;
        this.refs[keyRef] = sch;
      }
      return sch.validate || this._compileSchemaEnv(sch);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(schemaKeyRef) {
      if (schemaKeyRef instanceof RegExp) {
        this._removeAllSchemas(this.schemas, schemaKeyRef);
        this._removeAllSchemas(this.refs, schemaKeyRef);
        return this;
      }
      switch (typeof schemaKeyRef) {
        case "undefined":
          this._removeAllSchemas(this.schemas);
          this._removeAllSchemas(this.refs);
          this._cache.clear();
          return this;
        case "string": {
          const sch = getSchEnv.call(this, schemaKeyRef);
          if (typeof sch == "object")
            this._cache.delete(sch.schema);
          delete this.schemas[schemaKeyRef];
          delete this.refs[schemaKeyRef];
          return this;
        }
        case "object": {
          const cacheKey = schemaKeyRef;
          this._cache.delete(cacheKey);
          let id2 = schemaKeyRef[this.opts.schemaId];
          if (id2) {
            id2 = (0, resolve_12.normalizeId)(id2);
            delete this.schemas[id2];
            delete this.refs[id2];
          }
          return this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(definitions2) {
      for (const def2 of definitions2)
        this.addKeyword(def2);
      return this;
    }
    addKeyword(kwdOrDef, def2) {
      let keyword2;
      if (typeof kwdOrDef == "string") {
        keyword2 = kwdOrDef;
        if (typeof def2 == "object") {
          this.logger.warn("these parameters are deprecated, see docs for addKeyword");
          def2.keyword = keyword2;
        }
      } else if (typeof kwdOrDef == "object" && def2 === void 0) {
        def2 = kwdOrDef;
        keyword2 = def2.keyword;
        if (Array.isArray(keyword2) && !keyword2.length) {
          throw new Error("addKeywords: keyword must be string or non-empty array");
        }
      } else {
        throw new Error("invalid addKeywords parameters");
      }
      checkKeyword.call(this, keyword2, def2);
      if (!def2) {
        (0, util_12.eachItem)(keyword2, (kwd) => addRule.call(this, kwd));
        return this;
      }
      keywordMetaschema.call(this, def2);
      const definition = {
        ...def2,
        type: (0, dataType_12.getJSONTypes)(def2.type),
        schemaType: (0, dataType_12.getJSONTypes)(def2.schemaType)
      };
      (0, util_12.eachItem)(keyword2, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t2) => addRule.call(this, k, definition, t2)));
      return this;
    }
    getKeyword(keyword2) {
      const rule = this.RULES.all[keyword2];
      return typeof rule == "object" ? rule.definition : !!rule;
    }
    // Remove keyword
    removeKeyword(keyword2) {
      const { RULES } = this;
      delete RULES.keywords[keyword2];
      delete RULES.all[keyword2];
      for (const group of RULES.rules) {
        const i = group.rules.findIndex((rule) => rule.keyword === keyword2);
        if (i >= 0)
          group.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(name, format2) {
      if (typeof format2 == "string")
        format2 = new RegExp(format2);
      this.formats[name] = format2;
      return this;
    }
    errorsText(errors2 = this.errors, { separator = ", ", dataVar = "data" } = {}) {
      if (!errors2 || errors2.length === 0)
        return "No errors";
      return errors2.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
    }
    $dataMetaSchema(metaSchema2, keywordsJsonPointers) {
      const rules2 = this.RULES.all;
      metaSchema2 = JSON.parse(JSON.stringify(metaSchema2));
      for (const jsonPointer of keywordsJsonPointers) {
        const segments = jsonPointer.split("/").slice(1);
        let keywords = metaSchema2;
        for (const seg of segments)
          keywords = keywords[seg];
        for (const key in rules2) {
          const rule = rules2[key];
          if (typeof rule != "object")
            continue;
          const { $data } = rule.definition;
          const schema = keywords[key];
          if ($data && schema)
            keywords[key] = schemaOrData(schema);
        }
      }
      return metaSchema2;
    }
    _removeAllSchemas(schemas, regex) {
      for (const keyRef in schemas) {
        const sch = schemas[keyRef];
        if (!regex || regex.test(keyRef)) {
          if (typeof sch == "string") {
            delete schemas[keyRef];
          } else if (sch && !sch.meta) {
            this._cache.delete(sch.schema);
            delete schemas[keyRef];
          }
        }
      }
    }
    _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
      let id2;
      const { schemaId } = this.opts;
      if (typeof schema == "object") {
        id2 = schema[schemaId];
      } else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        else if (typeof schema != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let sch = this._cache.get(schema);
      if (sch !== void 0)
        return sch;
      baseId = (0, resolve_12.normalizeId)(id2 || baseId);
      const localRefs = resolve_12.getSchemaRefs.call(this, schema, baseId);
      sch = new compile_12.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
      this._cache.set(sch.schema, sch);
      if (addSchema && !baseId.startsWith("#")) {
        if (baseId)
          this._checkUnique(baseId);
        this.refs[baseId] = sch;
      }
      if (validateSchema)
        this.validateSchema(schema, true);
      return sch;
    }
    _checkUnique(id2) {
      if (this.schemas[id2] || this.refs[id2]) {
        throw new Error(`schema with key or id "${id2}" already exists`);
      }
    }
    _compileSchemaEnv(sch) {
      if (sch.meta)
        this._compileMetaSchema(sch);
      else
        compile_12.compileSchema.call(this, sch);
      if (!sch.validate)
        throw new Error("ajv implementation error");
      return sch.validate;
    }
    _compileMetaSchema(sch) {
      const currentOpts = this.opts;
      this.opts = this._metaOpts;
      try {
        compile_12.compileSchema.call(this, sch);
      } finally {
        this.opts = currentOpts;
      }
    }
  }
  Ajv.ValidationError = validation_error_12.default;
  Ajv.MissingRefError = ref_error_12.default;
  exports.default = Ajv;
  function checkOptions(checkOpts, options, msg, log = "error") {
    for (const key in checkOpts) {
      const opt = key;
      if (opt in options)
        this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
    }
  }
  function getSchEnv(keyRef) {
    keyRef = (0, resolve_12.normalizeId)(keyRef);
    return this.schemas[keyRef] || this.refs[keyRef];
  }
  function addInitialSchemas() {
    const optsSchemas = this.opts.schemas;
    if (!optsSchemas)
      return;
    if (Array.isArray(optsSchemas))
      this.addSchema(optsSchemas);
    else
      for (const key in optsSchemas)
        this.addSchema(optsSchemas[key], key);
  }
  function addInitialFormats() {
    for (const name in this.opts.formats) {
      const format2 = this.opts.formats[name];
      if (format2)
        this.addFormat(name, format2);
    }
  }
  function addInitialKeywords(defs) {
    if (Array.isArray(defs)) {
      this.addVocabulary(defs);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const keyword2 in defs) {
      const def2 = defs[keyword2];
      if (!def2.keyword)
        def2.keyword = keyword2;
      this.addKeyword(def2);
    }
  }
  function getMetaSchemaOptions() {
    const metaOpts = { ...this.opts };
    for (const opt of META_IGNORE_OPTIONS)
      delete metaOpts[opt];
    return metaOpts;
  }
  const noLogs = { log() {
  }, warn() {
  }, error() {
  } };
  function getLogger(logger) {
    if (logger === false)
      return noLogs;
    if (logger === void 0)
      return console;
    if (logger.log && logger.warn && logger.error)
      return logger;
    throw new Error("logger must implement log, warn and error methods");
  }
  const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
  function checkKeyword(keyword2, def2) {
    const { RULES } = this;
    (0, util_12.eachItem)(keyword2, (kwd) => {
      if (RULES.keywords[kwd])
        throw new Error(`Keyword ${kwd} is already defined`);
      if (!KEYWORD_NAME.test(kwd))
        throw new Error(`Keyword ${kwd} has invalid name`);
    });
    if (!def2)
      return;
    if (def2.$data && !("code" in def2 || "validate" in def2)) {
      throw new Error('$data keyword must have "code" or "validate" function');
    }
  }
  function addRule(keyword2, definition, dataType2) {
    var _a;
    const post = definition === null || definition === void 0 ? void 0 : definition.post;
    if (dataType2 && post)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES } = this;
    let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t2 }) => t2 === dataType2);
    if (!ruleGroup) {
      ruleGroup = { type: dataType2, rules: [] };
      RULES.rules.push(ruleGroup);
    }
    RULES.keywords[keyword2] = true;
    if (!definition)
      return;
    const rule = {
      keyword: keyword2,
      definition: {
        ...definition,
        type: (0, dataType_12.getJSONTypes)(definition.type),
        schemaType: (0, dataType_12.getJSONTypes)(definition.schemaType)
      }
    };
    if (definition.before)
      addBeforeRule.call(this, ruleGroup, rule, definition.before);
    else
      ruleGroup.rules.push(rule);
    RULES.all[keyword2] = rule;
    (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
  }
  function addBeforeRule(ruleGroup, rule, before) {
    const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
    if (i >= 0) {
      ruleGroup.rules.splice(i, 0, rule);
    } else {
      ruleGroup.rules.push(rule);
      this.logger.warn(`rule ${before} is not defined`);
    }
  }
  function keywordMetaschema(def2) {
    let { metaSchema: metaSchema2 } = def2;
    if (metaSchema2 === void 0)
      return;
    if (def2.$data && this.opts.$data)
      metaSchema2 = schemaOrData(metaSchema2);
    def2.validateSchema = this.compile(metaSchema2, true);
  }
  const $dataRef = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function schemaOrData(schema) {
    return { anyOf: [schema, $dataRef] };
  }
<<<<<<< HEAD
})(core$6);
var draft2020 = {};
var core$5 = {};
var id$1 = {};
Object.defineProperty(id$1, "__esModule", { value: true });
const def$12 = {
=======
})(qc);
var va = {}, wa = {}, Ea = {};
Object.defineProperty(Ea, "__esModule", { value: !0 });
const kh = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
<<<<<<< HEAD
id$1.default = def$12;
var ref$1 = {};
Object.defineProperty(ref$1, "__esModule", { value: true });
ref$1.callRef = ref$1.getValidate = void 0;
const ref_error_1$3 = ref_error$1;
const code_1$j = code$2;
const codegen_1$V = codegen$1;
const names_1$b = names$3;
const compile_1$4 = compile$1;
const util_1$O = util$1;
const def$11 = {
  keyword: "$ref",
  schemaType: "string",
  code(cxt) {
    const { gen, schema: $ref, it } = cxt;
    const { baseId, schemaEnv: env2, validateName, opts, self } = it;
    const { root } = env2;
    if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
      return callRootRef();
    const schOrEnv = compile_1$4.resolveRef.call(self, root, baseId, $ref);
    if (schOrEnv === void 0)
      throw new ref_error_1$3.default(it.opts.uriResolver, baseId, $ref);
    if (schOrEnv instanceof compile_1$4.SchemaEnv)
      return callValidate(schOrEnv);
    return inlineRefSchema(schOrEnv);
    function callRootRef() {
      if (env2 === root)
        return callRef$1(cxt, validateName, env2, env2.$async);
      const rootName = gen.scopeValue("root", { ref: root });
      return callRef$1(cxt, (0, codegen_1$V._)`${rootName}.validate`, root, root.$async);
    }
    function callValidate(sch) {
      const v = getValidate$1(cxt, sch);
      callRef$1(cxt, v, sch, sch.$async);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    function inlineRefSchema(sch) {
      const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1$V.stringify)(sch) } : { ref: sch });
      const valid2 = gen.name("valid");
      const schCxt = cxt.subschema({
        schema: sch,
        dataTypes: [],
        schemaPath: codegen_1$V.nil,
        topSchemaRef: schName,
        errSchemaPath: $ref
      }, valid2);
      cxt.mergeEvaluated(schCxt);
      cxt.ok(valid2);
    }
  }
};
<<<<<<< HEAD
function getValidate$1(cxt, sch) {
  const { gen } = cxt;
  return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1$V._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
}
ref$1.getValidate = getValidate$1;
function callRef$1(cxt, v, sch, $async) {
  const { gen, it } = cxt;
  const { allErrors, schemaEnv: env2, opts } = it;
  const passCxt = opts.passContext ? names_1$b.default.this : codegen_1$V.nil;
  if ($async)
    callAsyncRef();
  else
    callSyncRef();
  function callAsyncRef() {
    if (!env2.$async)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("async schema referenced by sync schema");
    const valid2 = gen.let("valid");
    gen.try(() => {
      gen.code((0, codegen_1$V._)`await ${(0, code_1$j.callValidateCode)(cxt, v, passCxt)}`);
      addEvaluatedFrom(v);
      if (!allErrors)
        gen.assign(valid2, true);
    }, (e) => {
      gen.if((0, codegen_1$V._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
      addErrorsFrom(e);
      if (!allErrors)
        gen.assign(valid2, false);
    });
    cxt.ok(valid2);
  }
  function callSyncRef() {
    cxt.result((0, code_1$j.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
  }
<<<<<<< HEAD
  function addErrorsFrom(source) {
    const errs = (0, codegen_1$V._)`${source}.errors`;
    gen.assign(names_1$b.default.vErrors, (0, codegen_1$V._)`${names_1$b.default.vErrors} === null ? ${errs} : ${names_1$b.default.vErrors}.concat(${errs})`);
    gen.assign(names_1$b.default.errors, (0, codegen_1$V._)`${names_1$b.default.vErrors}.length`);
=======
  function w(y) {
    const g = (0, Ue._)`${y}.errors`;
    s.assign(nr.default.vErrors, (0, Ue._)`${nr.default.vErrors} === null ? ${g} : ${nr.default.vErrors}.concat(${g})`), s.assign(nr.default.errors, (0, Ue._)`${nr.default.vErrors}.length`);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  function addEvaluatedFrom(source) {
    var _a;
    if (!it.opts.unevaluated)
      return;
<<<<<<< HEAD
    const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
    if (it.props !== true) {
      if (schEvaluated && !schEvaluated.dynamicProps) {
        if (schEvaluated.props !== void 0) {
          it.props = util_1$O.mergeEvaluated.props(gen, schEvaluated.props, it.props);
        }
      } else {
        const props = gen.var("props", (0, codegen_1$V._)`${source}.evaluated.props`);
        it.props = util_1$O.mergeEvaluated.props(gen, props, it.props, codegen_1$V.Name);
      }
    }
    if (it.items !== true) {
      if (schEvaluated && !schEvaluated.dynamicItems) {
        if (schEvaluated.items !== void 0) {
          it.items = util_1$O.mergeEvaluated.items(gen, schEvaluated.items, it.items);
        }
      } else {
        const items2 = gen.var("items", (0, codegen_1$V._)`${source}.evaluated.items`);
        it.items = util_1$O.mergeEvaluated.items(gen, items2, it.items, codegen_1$V.Name);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
    }
  }
}
<<<<<<< HEAD
ref$1.callRef = callRef$1;
ref$1.default = def$11;
Object.defineProperty(core$5, "__esModule", { value: true });
const id_1$1 = id$1;
const ref_1$3 = ref$1;
const core$4 = [
=======
bt.callRef = On;
bt.default = Ch;
Object.defineProperty(wa, "__esModule", { value: !0 });
const Dh = Ea, Mh = bt, Lh = [
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
<<<<<<< HEAD
  id_1$1.default,
  ref_1$3.default
];
core$5.default = core$4;
var validation$4 = {};
var limitNumber$1 = {};
Object.defineProperty(limitNumber$1, "__esModule", { value: true });
const codegen_1$U = codegen$1;
const ops$1 = codegen_1$U.operators;
const KWDs$1 = {
  maximum: { okStr: "<=", ok: ops$1.LTE, fail: ops$1.GT },
  minimum: { okStr: ">=", ok: ops$1.GTE, fail: ops$1.LT },
  exclusiveMaximum: { okStr: "<", ok: ops$1.LT, fail: ops$1.GTE },
  exclusiveMinimum: { okStr: ">", ok: ops$1.GT, fail: ops$1.LTE }
};
const error$D = {
  message: ({ keyword: keyword2, schemaCode }) => (0, codegen_1$U.str)`must be ${KWDs$1[keyword2].okStr} ${schemaCode}`,
  params: ({ keyword: keyword2, schemaCode }) => (0, codegen_1$U._)`{comparison: ${KWDs$1[keyword2].okStr}, limit: ${schemaCode}}`
};
const def$10 = {
  keyword: Object.keys(KWDs$1),
  type: "number",
  schemaType: "number",
  $data: true,
  error: error$D,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    cxt.fail$data((0, codegen_1$U._)`${data} ${KWDs$1[keyword2].fail} ${schemaCode} || isNaN(${data})`);
  }
};
limitNumber$1.default = def$10;
var multipleOf$1 = {};
Object.defineProperty(multipleOf$1, "__esModule", { value: true });
const codegen_1$T = codegen$1;
const error$C = {
  message: ({ schemaCode }) => (0, codegen_1$T.str)`must be multiple of ${schemaCode}`,
  params: ({ schemaCode }) => (0, codegen_1$T._)`{multipleOf: ${schemaCode}}`
};
const def$$ = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: true,
  error: error$C,
  code(cxt) {
    const { gen, data, schemaCode, it } = cxt;
    const prec = it.opts.multipleOfPrecision;
    const res = gen.let("res");
    const invalid = prec ? (0, codegen_1$T._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1$T._)`${res} !== parseInt(${res})`;
    cxt.fail$data((0, codegen_1$T._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
  }
};
multipleOf$1.default = def$$;
var limitLength$1 = {};
var ucs2length$3 = {};
Object.defineProperty(ucs2length$3, "__esModule", { value: true });
function ucs2length$2(str) {
  const len = str.length;
  let length = 0;
  let pos = 0;
  let value;
  while (pos < len) {
    length++;
    value = str.charCodeAt(pos++);
    if (value >= 55296 && value <= 56319 && pos < len) {
      value = str.charCodeAt(pos);
      if ((value & 64512) === 56320)
        pos++;
    }
  }
  return length;
}
ucs2length$3.default = ucs2length$2;
ucs2length$2.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(limitLength$1, "__esModule", { value: true });
const codegen_1$S = codegen$1;
const util_1$N = util$1;
const ucs2length_1$1 = ucs2length$3;
const error$B = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxLength" ? "more" : "fewer";
    return (0, codegen_1$S.str)`must NOT have ${comp} than ${schemaCode} characters`;
  },
  params: ({ schemaCode }) => (0, codegen_1$S._)`{limit: ${schemaCode}}`
};
const def$_ = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: true,
  error: error$B,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode, it } = cxt;
    const op = keyword2 === "maxLength" ? codegen_1$S.operators.GT : codegen_1$S.operators.LT;
    const len = it.opts.unicode === false ? (0, codegen_1$S._)`${data}.length` : (0, codegen_1$S._)`${(0, util_1$N.useFunc)(cxt.gen, ucs2length_1$1.default)}(${data})`;
    cxt.fail$data((0, codegen_1$S._)`${len} ${op} ${schemaCode}`);
  }
};
limitLength$1.default = def$_;
var pattern$1 = {};
Object.defineProperty(pattern$1, "__esModule", { value: true });
const code_1$i = code$2;
const codegen_1$R = codegen$1;
const error$A = {
  message: ({ schemaCode }) => (0, codegen_1$R.str)`must match pattern "${schemaCode}"`,
  params: ({ schemaCode }) => (0, codegen_1$R._)`{pattern: ${schemaCode}}`
};
const def$Z = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: true,
  error: error$A,
  code(cxt) {
    const { data, $data, schema, schemaCode, it } = cxt;
    const u = it.opts.unicodeRegExp ? "u" : "";
    const regExp = $data ? (0, codegen_1$R._)`(new RegExp(${schemaCode}, ${u}))` : (0, code_1$i.usePattern)(cxt, schema);
    cxt.fail$data((0, codegen_1$R._)`!${regExp}.test(${data})`);
  }
};
pattern$1.default = def$Z;
var limitProperties$1 = {};
Object.defineProperty(limitProperties$1, "__esModule", { value: true });
const codegen_1$Q = codegen$1;
const error$z = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxProperties" ? "more" : "fewer";
    return (0, codegen_1$Q.str)`must NOT have ${comp} than ${schemaCode} properties`;
  },
  params: ({ schemaCode }) => (0, codegen_1$Q._)`{limit: ${schemaCode}}`
};
const def$Y = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: true,
  error: error$z,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    const op = keyword2 === "maxProperties" ? codegen_1$Q.operators.GT : codegen_1$Q.operators.LT;
    cxt.fail$data((0, codegen_1$Q._)`Object.keys(${data}).length ${op} ${schemaCode}`);
  }
};
limitProperties$1.default = def$Y;
var required$2 = {};
Object.defineProperty(required$2, "__esModule", { value: true });
const code_1$h = code$2;
const codegen_1$P = codegen$1;
const util_1$M = util$1;
const error$y = {
  message: ({ params: { missingProperty } }) => (0, codegen_1$P.str)`must have required property '${missingProperty}'`,
  params: ({ params: { missingProperty } }) => (0, codegen_1$P._)`{missingProperty: ${missingProperty}}`
};
const def$X = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: true,
  error: error$y,
  code(cxt) {
    const { gen, schema, schemaCode, data, $data, it } = cxt;
    const { opts } = it;
    if (!$data && schema.length === 0)
      return;
    const useLoop = schema.length >= opts.loopRequired;
    if (it.allErrors)
      allErrorsMode();
    else
      exitOnErrorMode();
    if (opts.strictRequired) {
      const props = cxt.parentSchema.properties;
      const { definedProperties } = cxt.it;
      for (const requiredKey of schema) {
        if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
          const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
          const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
          (0, util_1$M.checkStrictMode)(it, msg, it.opts.strictRequired);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        }
      }
    }
<<<<<<< HEAD
    function allErrorsMode() {
      if (useLoop || $data) {
        cxt.block$data(codegen_1$P.nil, loopAllRequired);
      } else {
        for (const prop of schema) {
          (0, code_1$h.checkReportMissingProp)(cxt, prop);
        }
      }
    }
    function exitOnErrorMode() {
      const missing = gen.let("missing");
      if (useLoop || $data) {
        const valid2 = gen.let("valid", true);
        cxt.block$data(valid2, () => loopUntilMissing(missing, valid2));
        cxt.ok(valid2);
      } else {
        gen.if((0, code_1$h.checkMissingProp)(cxt, schema, missing));
        (0, code_1$h.reportMissingProp)(cxt, missing);
        gen.else();
      }
    }
    function loopAllRequired() {
      gen.forOf("prop", schemaCode, (prop) => {
        cxt.setParams({ missingProperty: prop });
        gen.if((0, code_1$h.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
      });
    }
    function loopUntilMissing(missing, valid2) {
      cxt.setParams({ missingProperty: missing });
      gen.forOf(missing, schemaCode, () => {
        gen.assign(valid2, (0, code_1$h.propertyInData)(gen, data, missing, opts.ownProperties));
        gen.if((0, codegen_1$P.not)(valid2), () => {
          cxt.error();
          gen.break();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        });
      }, codegen_1$P.nil);
    }
  }
};
<<<<<<< HEAD
required$2.default = def$X;
var limitItems$1 = {};
Object.defineProperty(limitItems$1, "__esModule", { value: true });
const codegen_1$O = codegen$1;
const error$x = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxItems" ? "more" : "fewer";
    return (0, codegen_1$O.str)`must NOT have ${comp} than ${schemaCode} items`;
  },
  params: ({ schemaCode }) => (0, codegen_1$O._)`{limit: ${schemaCode}}`
};
const def$W = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: true,
  error: error$x,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    const op = keyword2 === "maxItems" ? codegen_1$O.operators.GT : codegen_1$O.operators.LT;
    cxt.fail$data((0, codegen_1$O._)`${data}.length ${op} ${schemaCode}`);
  }
};
limitItems$1.default = def$W;
var uniqueItems$1 = {};
var equal$4 = {};
Object.defineProperty(equal$4, "__esModule", { value: true });
const equal$3 = fastDeepEqual;
equal$3.code = 'require("ajv/dist/runtime/equal").default';
equal$4.default = equal$3;
Object.defineProperty(uniqueItems$1, "__esModule", { value: true });
const dataType_1$2 = dataType$1;
const codegen_1$N = codegen$1;
const util_1$L = util$1;
const equal_1$5 = equal$4;
const error$w = {
  message: ({ params: { i, j } }) => (0, codegen_1$N.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
  params: ({ params: { i, j } }) => (0, codegen_1$N._)`{i: ${i}, j: ${j}}`
};
const def$V = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: true,
  error: error$w,
  code(cxt) {
    const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
    if (!$data && !schema)
      return;
    const valid2 = gen.let("valid");
    const itemTypes = parentSchema.items ? (0, dataType_1$2.getSchemaTypes)(parentSchema.items) : [];
    cxt.block$data(valid2, validateUniqueItems, (0, codegen_1$N._)`${schemaCode} === false`);
    cxt.ok(valid2);
    function validateUniqueItems() {
      const i = gen.let("i", (0, codegen_1$N._)`${data}.length`);
      const j = gen.let("j");
      cxt.setParams({ i, j });
      gen.assign(valid2, true);
      gen.if((0, codegen_1$N._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    function canOptimize() {
      return itemTypes.length > 0 && !itemTypes.some((t2) => t2 === "object" || t2 === "array");
    }
<<<<<<< HEAD
    function loopN(i, j) {
      const item = gen.name("item");
      const wrongType = (0, dataType_1$2.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1$2.DataType.Wrong);
      const indices = gen.const("indices", (0, codegen_1$N._)`{}`);
      gen.for((0, codegen_1$N._)`;${i}--;`, () => {
        gen.let(item, (0, codegen_1$N._)`${data}[${i}]`);
        gen.if(wrongType, (0, codegen_1$N._)`continue`);
        if (itemTypes.length > 1)
          gen.if((0, codegen_1$N._)`typeof ${item} == "string"`, (0, codegen_1$N._)`${item} += "_"`);
        gen.if((0, codegen_1$N._)`typeof ${indices}[${item}] == "number"`, () => {
          gen.assign(j, (0, codegen_1$N._)`${indices}[${item}]`);
          cxt.error();
          gen.assign(valid2, false).break();
        }).code((0, codegen_1$N._)`${indices}[${item}] = ${i}`);
      });
    }
    function loopN2(i, j) {
      const eql = (0, util_1$L.useFunc)(gen, equal_1$5.default);
      const outer = gen.name("outer");
      gen.label(outer).for((0, codegen_1$N._)`;${i}--;`, () => gen.for((0, codegen_1$N._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1$N._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
        cxt.error();
        gen.assign(valid2, false).break(outer);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      })));
    }
  }
};
<<<<<<< HEAD
uniqueItems$1.default = def$V;
var _const$1 = {};
Object.defineProperty(_const$1, "__esModule", { value: true });
const codegen_1$M = codegen$1;
const util_1$K = util$1;
const equal_1$4 = equal$4;
const error$v = {
  message: "must be equal to constant",
  params: ({ schemaCode }) => (0, codegen_1$M._)`{allowedValue: ${schemaCode}}`
};
const def$U = {
  keyword: "const",
  $data: true,
  error: error$v,
  code(cxt) {
    const { gen, data, $data, schemaCode, schema } = cxt;
    if ($data || schema && typeof schema == "object") {
      cxt.fail$data((0, codegen_1$M._)`!${(0, util_1$K.useFunc)(gen, equal_1$4.default)}(${data}, ${schemaCode})`);
    } else {
      cxt.fail((0, codegen_1$M._)`${schema} !== ${data}`);
    }
  }
};
_const$1.default = def$U;
var _enum$1 = {};
Object.defineProperty(_enum$1, "__esModule", { value: true });
const codegen_1$L = codegen$1;
const util_1$J = util$1;
const equal_1$3 = equal$4;
const error$u = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode }) => (0, codegen_1$L._)`{allowedValues: ${schemaCode}}`
};
const def$T = {
  keyword: "enum",
  schemaType: "array",
  $data: true,
  error: error$u,
  code(cxt) {
    const { gen, data, $data, schema, schemaCode, it } = cxt;
    if (!$data && schema.length === 0)
      throw new Error("enum must have non-empty array");
    const useLoop = schema.length >= it.opts.loopEnum;
    let eql;
    const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1$J.useFunc)(gen, equal_1$3.default);
    let valid2;
    if (useLoop || $data) {
      valid2 = gen.let("valid");
      cxt.block$data(valid2, loopEnum);
    } else {
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const vSchema = gen.const("vSchema", schemaCode);
      valid2 = (0, codegen_1$L.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
    }
    cxt.pass(valid2);
    function loopEnum() {
      gen.assign(valid2, false);
      gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1$L._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid2, true).break()));
    }
    function equalCode(vSchema, i) {
      const sch = schema[i];
      return typeof sch === "object" && sch !== null ? (0, codegen_1$L._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1$L._)`${data} === ${sch}`;
    }
  }
};
_enum$1.default = def$T;
Object.defineProperty(validation$4, "__esModule", { value: true });
const limitNumber_1$1 = limitNumber$1;
const multipleOf_1$1 = multipleOf$1;
const limitLength_1$1 = limitLength$1;
const pattern_1$1 = pattern$1;
const limitProperties_1$1 = limitProperties$1;
const required_1$1 = required$2;
const limitItems_1$1 = limitItems$1;
const uniqueItems_1$1 = uniqueItems$1;
const const_1$1 = _const$1;
const enum_1$1 = _enum$1;
const validation$3 = [
  // number
  limitNumber_1$1.default,
  multipleOf_1$1.default,
  // string
  limitLength_1$1.default,
  pattern_1$1.default,
  // object
  limitProperties_1$1.default,
  required_1$1.default,
  // array
  limitItems_1$1.default,
  uniqueItems_1$1.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  const_1$1.default,
  enum_1$1.default
];
validation$4.default = validation$3;
var applicator$2 = {};
var additionalItems$1 = {};
Object.defineProperty(additionalItems$1, "__esModule", { value: true });
additionalItems$1.validateAdditionalItems = void 0;
const codegen_1$K = codegen$1;
const util_1$I = util$1;
const error$t = {
  message: ({ params: { len } }) => (0, codegen_1$K.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$K._)`{limit: ${len}}`
};
const def$S = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
<<<<<<< HEAD
  error: error$t,
  code(cxt) {
    const { parentSchema, it } = cxt;
    const { items: items2 } = parentSchema;
    if (!Array.isArray(items2)) {
      (0, util_1$I.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    validateAdditionalItems$1(cxt, items2);
  }
};
function validateAdditionalItems$1(cxt, items2) {
  const { gen, schema, data, keyword: keyword2, it } = cxt;
  it.items = true;
  const len = gen.const("len", (0, codegen_1$K._)`${data}.length`);
  if (schema === false) {
    cxt.setParams({ len: items2.length });
    cxt.pass((0, codegen_1$K._)`${len} <= ${items2.length}`);
  } else if (typeof schema == "object" && !(0, util_1$I.alwaysValidSchema)(it, schema)) {
    const valid2 = gen.var("valid", (0, codegen_1$K._)`${len} <= ${items2.length}`);
    gen.if((0, codegen_1$K.not)(valid2), () => validateItems(valid2));
    cxt.ok(valid2);
  }
  function validateItems(valid2) {
    gen.forRange("i", items2.length, len, (i) => {
      cxt.subschema({ keyword: keyword2, dataProp: i, dataPropType: util_1$I.Type.Num }, valid2);
      if (!it.allErrors)
        gen.if((0, codegen_1$K.not)(valid2), () => gen.break());
    });
  }
}
additionalItems$1.validateAdditionalItems = validateAdditionalItems$1;
additionalItems$1.default = def$S;
var prefixItems$1 = {};
var items$1 = {};
Object.defineProperty(items$1, "__esModule", { value: true });
items$1.validateTuple = void 0;
const codegen_1$J = codegen$1;
const util_1$H = util$1;
const code_1$g = code$2;
const def$R = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
<<<<<<< HEAD
  code(cxt) {
    const { schema, it } = cxt;
    if (Array.isArray(schema))
      return validateTuple$1(cxt, "additionalItems", schema);
    it.items = true;
    if ((0, util_1$H.alwaysValidSchema)(it, schema))
      return;
    cxt.ok((0, code_1$g.validateArray)(cxt));
  }
};
function validateTuple$1(cxt, extraItems, schArr = cxt.schema) {
  const { gen, parentSchema, data, keyword: keyword2, it } = cxt;
  checkStrictTuple(parentSchema);
  if (it.opts.unevaluated && schArr.length && it.items !== true) {
    it.items = util_1$H.mergeEvaluated.items(gen, schArr.length, it.items);
  }
  const valid2 = gen.name("valid");
  const len = gen.const("len", (0, codegen_1$J._)`${data}.length`);
  schArr.forEach((sch, i) => {
    if ((0, util_1$H.alwaysValidSchema)(it, sch))
      return;
    gen.if((0, codegen_1$J._)`${len} > ${i}`, () => cxt.subschema({
      keyword: keyword2,
      schemaProp: i,
      dataProp: i
    }, valid2));
    cxt.ok(valid2);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  });
  function checkStrictTuple(sch) {
    const { opts, errSchemaPath } = it;
    const l = schArr.length;
    const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
    if (opts.strictTuples && !fullTuple) {
      const msg = `"${keyword2}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
      (0, util_1$H.checkStrictMode)(it, msg, opts.strictTuples);
    }
  }
}
<<<<<<< HEAD
items$1.validateTuple = validateTuple$1;
items$1.default = def$R;
Object.defineProperty(prefixItems$1, "__esModule", { value: true });
const items_1$3 = items$1;
const def$Q = {
=======
wr.validateTuple = Ml;
wr.default = Om;
Object.defineProperty(Ma, "__esModule", { value: !0 });
const Im = wr, Tm = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
<<<<<<< HEAD
  code: (cxt) => (0, items_1$3.validateTuple)(cxt, "items")
};
prefixItems$1.default = def$Q;
var items2020$1 = {};
Object.defineProperty(items2020$1, "__esModule", { value: true });
const codegen_1$I = codegen$1;
const util_1$G = util$1;
const code_1$f = code$2;
const additionalItems_1$3 = additionalItems$1;
const error$s = {
  message: ({ params: { len } }) => (0, codegen_1$I.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$I._)`{limit: ${len}}`
};
const def$P = {
=======
  code: (e) => (0, Im.validateTuple)(e, "items")
};
Ma.default = Tm;
var La = {};
Object.defineProperty(La, "__esModule", { value: !0 });
const bi = ee, jm = L, km = oe, Am = vr, Cm = {
  message: ({ params: { len: e } }) => (0, bi.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, bi._)`{limit: ${e}}`
}, Dm = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
<<<<<<< HEAD
  error: error$s,
  code(cxt) {
    const { schema, parentSchema, it } = cxt;
    const { prefixItems: prefixItems2 } = parentSchema;
    it.items = true;
    if ((0, util_1$G.alwaysValidSchema)(it, schema))
      return;
    if (prefixItems2)
      (0, additionalItems_1$3.validateAdditionalItems)(cxt, prefixItems2);
    else
      cxt.ok((0, code_1$f.validateArray)(cxt));
  }
};
items2020$1.default = def$P;
var contains$1 = {};
Object.defineProperty(contains$1, "__esModule", { value: true });
const codegen_1$H = codegen$1;
const util_1$F = util$1;
const error$r = {
  message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$H.str)`must contain at least ${min} valid item(s)` : (0, codegen_1$H.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
  params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$H._)`{minContains: ${min}}` : (0, codegen_1$H._)`{minContains: ${min}, maxContains: ${max}}`
};
const def$O = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
<<<<<<< HEAD
  trackErrors: true,
  error: error$r,
  code(cxt) {
    const { gen, schema, parentSchema, data, it } = cxt;
    let min;
    let max;
    const { minContains, maxContains } = parentSchema;
    if (it.opts.next) {
      min = minContains === void 0 ? 1 : minContains;
      max = maxContains;
    } else {
      min = 1;
    }
    const len = gen.const("len", (0, codegen_1$H._)`${data}.length`);
    cxt.setParams({ min, max });
    if (max === void 0 && min === 0) {
      (0, util_1$F.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
      return;
    }
    if (max !== void 0 && min > max) {
      (0, util_1$F.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
      cxt.fail();
      return;
    }
    if ((0, util_1$F.alwaysValidSchema)(it, schema)) {
      let cond = (0, codegen_1$H._)`${len} >= ${min}`;
      if (max !== void 0)
        cond = (0, codegen_1$H._)`${cond} && ${len} <= ${max}`;
      cxt.pass(cond);
      return;
    }
    it.items = true;
    const valid2 = gen.name("valid");
    if (max === void 0 && min === 1) {
      validateItems(valid2, () => gen.if(valid2, () => gen.break()));
    } else if (min === 0) {
      gen.let(valid2, true);
      if (max !== void 0)
        gen.if((0, codegen_1$H._)`${data}.length > 0`, validateItemsWithCount);
    } else {
      gen.let(valid2, false);
      validateItemsWithCount();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    cxt.result(valid2, () => cxt.reset());
    function validateItemsWithCount() {
      const schValid = gen.name("_valid");
      const count = gen.let("count", 0);
      validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
    }
    function validateItems(_valid, block) {
      gen.forRange("i", 0, len, (i) => {
        cxt.subschema({
          keyword: "contains",
<<<<<<< HEAD
          dataProp: i,
          dataPropType: util_1$F.Type.Num,
          compositeRule: true
        }, _valid);
        block();
      });
    }
    function checkLimits(count) {
      gen.code((0, codegen_1$H._)`${count}++`);
      if (max === void 0) {
        gen.if((0, codegen_1$H._)`${count} >= ${min}`, () => gen.assign(valid2, true).break());
      } else {
        gen.if((0, codegen_1$H._)`${count} > ${max}`, () => gen.assign(valid2, false).break());
        if (min === 1)
          gen.assign(valid2, true);
        else
          gen.if((0, codegen_1$H._)`${count} >= ${min}`, () => gen.assign(valid2, true));
      }
    }
  }
};
contains$1.default = def$O;
var dependencies$1 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
  const codegen_12 = codegen$1;
  const util_12 = util$1;
  const code_12 = code$2;
  exports.error = {
    message: ({ params: { property, depsCount, deps } }) => {
      const property_ies = depsCount === 1 ? "property" : "properties";
      return (0, codegen_12.str)`must have ${property_ies} ${deps} when property ${property} is present`;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    },
    params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_12._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
    // TODO change to reference
  };
  const def2 = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: exports.error,
    code(cxt) {
      const [propDeps, schDeps] = splitDependencies(cxt);
      validatePropertyDeps(cxt, propDeps);
      validateSchemaDeps(cxt, schDeps);
    }
  };
  function splitDependencies({ schema }) {
    const propertyDeps = {};
    const schemaDeps = {};
    for (const key in schema) {
      if (key === "__proto__")
        continue;
      const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
      deps[key] = schema[key];
    }
    return [propertyDeps, schemaDeps];
  }
  function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
    const { gen, data, it } = cxt;
    if (Object.keys(propertyDeps).length === 0)
      return;
    const missing = gen.let("missing");
    for (const prop in propertyDeps) {
      const deps = propertyDeps[prop];
      if (deps.length === 0)
        continue;
      const hasProperty2 = (0, code_12.propertyInData)(gen, data, prop, it.opts.ownProperties);
      cxt.setParams({
        property: prop,
        depsCount: deps.length,
        deps: deps.join(", ")
      });
      if (it.allErrors) {
        gen.if(hasProperty2, () => {
          for (const depProp of deps) {
            (0, code_12.checkReportMissingProp)(cxt, depProp);
          }
        });
      } else {
        gen.if((0, codegen_12._)`${hasProperty2} && (${(0, code_12.checkMissingProp)(cxt, deps, missing)})`);
        (0, code_12.reportMissingProp)(cxt, missing);
        gen.else();
      }
    }
  }
  exports.validatePropertyDeps = validatePropertyDeps;
  function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
    const { gen, data, keyword: keyword2, it } = cxt;
    const valid2 = gen.name("valid");
    for (const prop in schemaDeps) {
      if ((0, util_12.alwaysValidSchema)(it, schemaDeps[prop]))
        continue;
      gen.if(
        (0, code_12.propertyInData)(gen, data, prop, it.opts.ownProperties),
        () => {
          const schCxt = cxt.subschema({ keyword: keyword2, schemaProp: prop }, valid2);
          cxt.mergeValidEvaluated(schCxt, valid2);
        },
        () => gen.var(valid2, true)
        // TODO var
      );
      cxt.ok(valid2);
    }
  }
<<<<<<< HEAD
  exports.validateSchemaDeps = validateSchemaDeps;
  exports.default = def2;
})(dependencies$1);
var propertyNames$1 = {};
Object.defineProperty(propertyNames$1, "__esModule", { value: true });
const codegen_1$G = codegen$1;
const util_1$E = util$1;
const error$q = {
  message: "property name must be valid",
  params: ({ params }) => (0, codegen_1$G._)`{propertyName: ${params.propertyName}}`
};
const def$N = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: error$q,
  code(cxt) {
    const { gen, schema, data, it } = cxt;
    if ((0, util_1$E.alwaysValidSchema)(it, schema))
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    const valid2 = gen.name("valid");
    gen.forIn("key", data, (key) => {
      cxt.setParams({ propertyName: key });
      cxt.subschema({
        keyword: "propertyNames",
        data: key,
        dataTypes: ["string"],
<<<<<<< HEAD
        propertyName: key,
        compositeRule: true
      }, valid2);
      gen.if((0, codegen_1$G.not)(valid2), () => {
        cxt.error(true);
        if (!it.allErrors)
          gen.break();
=======
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, Ll.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      });
    });
    cxt.ok(valid2);
  }
};
<<<<<<< HEAD
propertyNames$1.default = def$N;
var additionalProperties$2 = {};
Object.defineProperty(additionalProperties$2, "__esModule", { value: true });
const code_1$e = code$2;
const codegen_1$F = codegen$1;
const names_1$a = names$3;
const util_1$D = util$1;
const error$p = {
  message: "must NOT have additional properties",
  params: ({ params }) => (0, codegen_1$F._)`{additionalProperty: ${params.additionalProperty}}`
};
const def$M = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: true,
  trackErrors: true,
  error: error$p,
  code(cxt) {
    const { gen, schema, parentSchema, data, errsCount, it } = cxt;
    if (!errsCount)
      throw new Error("ajv implementation error");
    const { allErrors, opts } = it;
    it.props = true;
    if (opts.removeAdditional !== "all" && (0, util_1$D.alwaysValidSchema)(it, schema))
      return;
    const props = (0, code_1$e.allSchemaProperties)(parentSchema.properties);
    const patProps = (0, code_1$e.allSchemaProperties)(parentSchema.patternProperties);
    checkAdditionalProperties();
    cxt.ok((0, codegen_1$F._)`${errsCount} === ${names_1$a.default.errors}`);
    function checkAdditionalProperties() {
      gen.forIn("key", data, (key) => {
        if (!props.length && !patProps.length)
          additionalPropertyCode(key);
        else
          gen.if(isAdditional(key), () => additionalPropertyCode(key));
      });
    }
    function isAdditional(key) {
      let definedProp;
      if (props.length > 8) {
        const propsSchema = (0, util_1$D.schemaRefOrVal)(it, parentSchema.properties, "properties");
        definedProp = (0, code_1$e.isOwnProperty)(gen, propsSchema, key);
      } else if (props.length) {
        definedProp = (0, codegen_1$F.or)(...props.map((p) => (0, codegen_1$F._)`${key} === ${p}`));
      } else {
        definedProp = codegen_1$F.nil;
      }
      if (patProps.length) {
        definedProp = (0, codegen_1$F.or)(definedProp, ...patProps.map((p) => (0, codegen_1$F._)`${(0, code_1$e.usePattern)(cxt, p)}.test(${key})`));
      }
      return (0, codegen_1$F.not)(definedProp);
    }
    function deleteAdditional(key) {
      gen.code((0, codegen_1$F._)`delete ${data}[${key}]`);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    function additionalPropertyCode(key) {
      if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
        deleteAdditional(key);
        return;
      }
      if (schema === false) {
        cxt.setParams({ additionalProperty: key });
        cxt.error();
        if (!allErrors)
          gen.break();
        return;
      }
<<<<<<< HEAD
      if (typeof schema == "object" && !(0, util_1$D.alwaysValidSchema)(it, schema)) {
        const valid2 = gen.name("valid");
        if (opts.removeAdditional === "failing") {
          applyAdditionalSchema(key, valid2, false);
          gen.if((0, codegen_1$F.not)(valid2), () => {
            cxt.reset();
            deleteAdditional(key);
          });
        } else {
          applyAdditionalSchema(key, valid2);
          if (!allErrors)
            gen.if((0, codegen_1$F.not)(valid2), () => gen.break());
        }
=======
      if (typeof r == "object" && !(0, ln.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g(_, m, !1), t.if((0, xe.not)(m), () => {
          e.reset(), $(_);
        })) : (g(_, m), c || t.if((0, xe.not)(m), () => t.break()));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
    }
    function applyAdditionalSchema(key, valid2, errors2) {
      const subschema2 = {
        keyword: "additionalProperties",
<<<<<<< HEAD
        dataProp: key,
        dataPropType: util_1$D.Type.Str
=======
        dataProp: _,
        dataPropType: ln.Type.Str
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      };
      if (errors2 === false) {
        Object.assign(subschema2, {
          compositeRule: true,
          createErrors: false,
          allErrors: false
        });
      }
      cxt.subschema(subschema2, valid2);
    }
  }
};
<<<<<<< HEAD
additionalProperties$2.default = def$M;
var properties$b = {};
Object.defineProperty(properties$b, "__esModule", { value: true });
const validate_1$2 = validate$1;
const code_1$d = code$2;
const util_1$C = util$1;
const additionalProperties_1$3 = additionalProperties$2;
const def$L = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(cxt) {
    const { gen, schema, parentSchema, data, it } = cxt;
    if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
      additionalProperties_1$3.default.code(new validate_1$2.KeywordCxt(it, additionalProperties_1$3.default, "additionalProperties"));
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    const allProps = (0, code_1$d.allSchemaProperties)(schema);
    for (const prop of allProps) {
      it.definedProperties.add(prop);
    }
    if (it.opts.unevaluated && allProps.length && it.props !== true) {
      it.props = util_1$C.mergeEvaluated.props(gen, (0, util_1$C.toHash)(allProps), it.props);
    }
    const properties2 = allProps.filter((p) => !(0, util_1$C.alwaysValidSchema)(it, schema[p]));
    if (properties2.length === 0)
      return;
    const valid2 = gen.name("valid");
    for (const prop of properties2) {
      if (hasDefault(prop)) {
        applyPropertySchema(prop);
      } else {
        gen.if((0, code_1$d.propertyInData)(gen, data, prop, it.opts.ownProperties));
        applyPropertySchema(prop);
        if (!it.allErrors)
          gen.else().var(valid2, true);
        gen.endIf();
      }
      cxt.it.definedProperties.add(prop);
      cxt.ok(valid2);
    }
    function hasDefault(prop) {
      return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
    }
    function applyPropertySchema(prop) {
      cxt.subschema({
        keyword: "properties",
        schemaProp: prop,
        dataProp: prop
      }, valid2);
    }
  }
};
<<<<<<< HEAD
properties$b.default = def$L;
var patternProperties$1 = {};
Object.defineProperty(patternProperties$1, "__esModule", { value: true });
const code_1$c = code$2;
const codegen_1$E = codegen$1;
const util_1$B = util$1;
const util_2$2 = util$1;
const def$K = {
=======
za.default = Hm;
var Ua = {};
Object.defineProperty(Ua, "__esModule", { value: !0 });
const Ni = oe, un = ee, Ri = L, Oi = L, Bm = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(cxt) {
    const { gen, schema, data, parentSchema, it } = cxt;
    const { opts } = it;
    const patterns = (0, code_1$c.allSchemaProperties)(schema);
    const alwaysValidPatterns = patterns.filter((p) => (0, util_1$B.alwaysValidSchema)(it, schema[p]));
    if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
      return;
<<<<<<< HEAD
=======
    const d = o.strictSchema && !o.allowMatchingProperties && s.properties, u = t.name("valid");
    a.props !== !0 && !(a.props instanceof un.Name) && (a.props = (0, Oi.evaluatedPropsToName)(t, a.props));
    const { props: h } = a;
    w();
    function w() {
      for (const g of c)
        d && $(g), a.allErrors ? y(g) : (t.var(u, !0), y(g), t.if(u));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
    const valid2 = gen.name("valid");
    if (it.props !== true && !(it.props instanceof codegen_1$E.Name)) {
      it.props = (0, util_2$2.evaluatedPropsToName)(gen, it.props);
    }
<<<<<<< HEAD
    const { props } = it;
    validatePatternProperties();
    function validatePatternProperties() {
      for (const pat of patterns) {
        if (checkProperties)
          checkMatchingProperties(pat);
        if (it.allErrors) {
          validateProperties(pat);
        } else {
          gen.var(valid2, true);
          validateProperties(pat);
          gen.if(valid2);
        }
      }
    }
    function checkMatchingProperties(pat) {
      for (const prop in checkProperties) {
        if (new RegExp(pat).test(prop)) {
          (0, util_1$B.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
        }
      }
    }
    function validateProperties(pat) {
      gen.forIn("key", data, (key) => {
        gen.if((0, codegen_1$E._)`${(0, code_1$c.usePattern)(cxt, pat)}.test(${key})`, () => {
          const alwaysValid = alwaysValidPatterns.includes(pat);
          if (!alwaysValid) {
            cxt.subschema({
              keyword: "patternProperties",
              schemaProp: pat,
              dataProp: key,
              dataPropType: util_2$2.Type.Str
            }, valid2);
          }
          if (it.opts.unevaluated && props !== true) {
            gen.assign((0, codegen_1$E._)`${props}[${key}]`, true);
          } else if (!alwaysValid && !it.allErrors) {
            gen.if((0, codegen_1$E.not)(valid2), () => gen.break());
          }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        });
      });
    }
  }
};
<<<<<<< HEAD
patternProperties$1.default = def$K;
var not$1 = {};
Object.defineProperty(not$1, "__esModule", { value: true });
const util_1$A = util$1;
const def$J = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: true,
  code(cxt) {
    const { gen, schema, it } = cxt;
    if ((0, util_1$A.alwaysValidSchema)(it, schema)) {
      cxt.fail();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    }
    const valid2 = gen.name("valid");
    cxt.subschema({
      keyword: "not",
      compositeRule: true,
      createErrors: false,
      allErrors: false
    }, valid2);
    cxt.failResult(valid2, () => cxt.reset(), () => cxt.error());
  },
  error: { message: "must NOT be valid" }
};
<<<<<<< HEAD
not$1.default = def$J;
var anyOf$1 = {};
Object.defineProperty(anyOf$1, "__esModule", { value: true });
const code_1$b = code$2;
const def$I = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: true,
  code: code_1$b.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
anyOf$1.default = def$I;
var oneOf$1 = {};
Object.defineProperty(oneOf$1, "__esModule", { value: true });
const codegen_1$D = codegen$1;
const util_1$z = util$1;
const error$o = {
  message: "must match exactly one schema in oneOf",
  params: ({ params }) => (0, codegen_1$D._)`{passingSchemas: ${params.passing}}`
};
const def$H = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: true,
  error: error$o,
  code(cxt) {
    const { gen, schema, parentSchema, it } = cxt;
    if (!Array.isArray(schema))
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("ajv implementation error");
    if (it.opts.discriminator && parentSchema.discriminator)
      return;
<<<<<<< HEAD
    const schArr = schema;
    const valid2 = gen.let("valid", false);
    const passing = gen.let("passing", null);
    const schValid = gen.name("_valid");
    cxt.setParams({ passing });
    gen.block(validateOneOf);
    cxt.result(valid2, () => cxt.reset(), () => cxt.error(true));
    function validateOneOf() {
      schArr.forEach((sch, i) => {
        let schCxt;
        if ((0, util_1$z.alwaysValidSchema)(it, sch)) {
          gen.var(schValid, true);
        } else {
          schCxt = cxt.subschema({
            keyword: "oneOf",
            schemaProp: i,
            compositeRule: true
          }, schValid);
        }
        if (i > 0) {
          gen.if((0, codegen_1$D._)`${schValid} && ${valid2}`).assign(valid2, false).assign(passing, (0, codegen_1$D._)`[${passing}, ${i}]`).else();
        }
        gen.if(schValid, () => {
          gen.assign(valid2, true);
          gen.assign(passing, i);
          if (schCxt)
            cxt.mergeEvaluated(schCxt, codegen_1$D.Name);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        });
      });
    }
  }
};
<<<<<<< HEAD
oneOf$1.default = def$H;
var allOf$2 = {};
Object.defineProperty(allOf$2, "__esModule", { value: true });
const util_1$y = util$1;
const def$G = {
=======
Ka.default = xm;
var Ha = {};
Object.defineProperty(Ha, "__esModule", { value: !0 });
const ep = L, tp = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "allOf",
  schemaType: "array",
  code(cxt) {
    const { gen, schema, it } = cxt;
    if (!Array.isArray(schema))
      throw new Error("ajv implementation error");
<<<<<<< HEAD
    const valid2 = gen.name("valid");
    schema.forEach((sch, i) => {
      if ((0, util_1$y.alwaysValidSchema)(it, sch))
=======
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, ep.alwaysValidSchema)(n, a))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        return;
      const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid2);
      cxt.ok(valid2);
      cxt.mergeEvaluated(schCxt);
    });
  }
};
<<<<<<< HEAD
allOf$2.default = def$G;
var _if$1 = {};
Object.defineProperty(_if$1, "__esModule", { value: true });
const codegen_1$C = codegen$1;
const util_1$x = util$1;
const error$n = {
  message: ({ params }) => (0, codegen_1$C.str)`must match "${params.ifClause}" schema`,
  params: ({ params }) => (0, codegen_1$C._)`{failingKeyword: ${params.ifClause}}`
};
const def$F = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: true,
  error: error$n,
  code(cxt) {
    const { gen, parentSchema, it } = cxt;
    if (parentSchema.then === void 0 && parentSchema.else === void 0) {
      (0, util_1$x.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    const hasThen = hasSchema$1(it, "then");
    const hasElse = hasSchema$1(it, "else");
    if (!hasThen && !hasElse)
      return;
    const valid2 = gen.let("valid", true);
    const schValid = gen.name("_valid");
    validateIf();
    cxt.reset();
    if (hasThen && hasElse) {
      const ifClause = gen.let("ifClause");
      cxt.setParams({ ifClause });
      gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
    } else if (hasThen) {
      gen.if(schValid, validateClause("then"));
    } else {
      gen.if((0, codegen_1$C.not)(schValid), validateClause("else"));
    }
    cxt.pass(valid2, () => cxt.error(true));
    function validateIf() {
      const schCxt = cxt.subschema({
        keyword: "if",
        compositeRule: true,
        createErrors: false,
        allErrors: false
      }, schValid);
      cxt.mergeEvaluated(schCxt);
    }
    function validateClause(keyword2, ifClause) {
      return () => {
<<<<<<< HEAD
        const schCxt = cxt.subschema({ keyword: keyword2 }, schValid);
        gen.assign(valid2, schValid);
        cxt.mergeValidEvaluated(schCxt, valid2);
        if (ifClause)
          gen.assign(ifClause, (0, codegen_1$C._)`${keyword2}`);
        else
          cxt.setParams({ ifClause: keyword2 });
=======
        const w = e.subschema({ keyword: u }, c);
        t.assign(o, c), e.mergeValidEvaluated(w, o), h ? t.assign(h, (0, Kn._)`${u}`) : e.setParams({ ifClause: u });
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      };
    }
  }
};
<<<<<<< HEAD
function hasSchema$1(it, keyword2) {
  const schema = it.schema[keyword2];
  return schema !== void 0 && !(0, util_1$x.alwaysValidSchema)(it, schema);
}
_if$1.default = def$F;
var thenElse$1 = {};
Object.defineProperty(thenElse$1, "__esModule", { value: true });
const util_1$w = util$1;
const def$E = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: keyword2, parentSchema, it }) {
    if (parentSchema.if === void 0)
      (0, util_1$w.checkStrictMode)(it, `"${keyword2}" without "if" is ignored`);
  }
};
thenElse$1.default = def$E;
Object.defineProperty(applicator$2, "__esModule", { value: true });
const additionalItems_1$2 = additionalItems$1;
const prefixItems_1$1 = prefixItems$1;
const items_1$2 = items$1;
const items2020_1$1 = items2020$1;
const contains_1$1 = contains$1;
const dependencies_1$3 = dependencies$1;
const propertyNames_1$1 = propertyNames$1;
const additionalProperties_1$2 = additionalProperties$2;
const properties_1$1 = properties$b;
const patternProperties_1$1 = patternProperties$1;
const not_1$1 = not$1;
const anyOf_1$1 = anyOf$1;
const oneOf_1$1 = oneOf$1;
const allOf_1$1 = allOf$2;
const if_1$1 = _if$1;
const thenElse_1$1 = thenElse$1;
function getApplicator$1(draft20202 = false) {
  const applicator2 = [
    // any
    not_1$1.default,
    anyOf_1$1.default,
    oneOf_1$1.default,
    allOf_1$1.default,
    if_1$1.default,
    thenElse_1$1.default,
    // object
    propertyNames_1$1.default,
    additionalProperties_1$2.default,
    dependencies_1$3.default,
    properties_1$1.default,
    patternProperties_1$1.default
  ];
  if (draft20202)
    applicator2.push(prefixItems_1$1.default, items2020_1$1.default);
  else
    applicator2.push(additionalItems_1$2.default, items_1$2.default);
  applicator2.push(contains_1$1.default);
  return applicator2;
}
applicator$2.default = getApplicator$1;
var dynamic$1 = {};
var dynamicAnchor$1 = {};
Object.defineProperty(dynamicAnchor$1, "__esModule", { value: true });
dynamicAnchor$1.dynamicAnchor = void 0;
const codegen_1$B = codegen$1;
const names_1$9 = names$3;
const compile_1$3 = compile$1;
const ref_1$2 = ref$1;
const def$D = {
  keyword: "$dynamicAnchor",
  schemaType: "string",
  code: (cxt) => dynamicAnchor(cxt, cxt.schema)
};
function dynamicAnchor(cxt, anchor) {
  const { gen, it } = cxt;
  it.schemaEnv.root.dynamicAnchors[anchor] = true;
  const v = (0, codegen_1$B._)`${names_1$9.default.dynamicAnchors}${(0, codegen_1$B.getProperty)(anchor)}`;
  const validate2 = it.errSchemaPath === "#" ? it.validateName : _getValidate(cxt);
  gen.if((0, codegen_1$B._)`!${v}`, () => gen.assign(v, validate2));
}
dynamicAnchor$1.dynamicAnchor = dynamicAnchor;
function _getValidate(cxt) {
  const { schemaEnv, schema, self } = cxt.it;
  const { root, baseId, localRefs, meta } = schemaEnv.root;
  const { schemaId } = self.opts;
  const sch = new compile_1$3.SchemaEnv({ schema, schemaId, root, baseId, localRefs, meta });
  compile_1$3.compileSchema.call(self, sch);
  return (0, ref_1$2.getValidate)(cxt, sch);
}
dynamicAnchor$1.default = def$D;
var dynamicRef$1 = {};
Object.defineProperty(dynamicRef$1, "__esModule", { value: true });
dynamicRef$1.dynamicRef = void 0;
const codegen_1$A = codegen$1;
const names_1$8 = names$3;
const ref_1$1 = ref$1;
const def$C = {
  keyword: "$dynamicRef",
  schemaType: "string",
  code: (cxt) => dynamicRef(cxt, cxt.schema)
};
function dynamicRef(cxt, ref2) {
  const { gen, keyword: keyword2, it } = cxt;
  if (ref2[0] !== "#")
    throw new Error(`"${keyword2}" only supports hash fragment reference`);
  const anchor = ref2.slice(1);
  if (it.allErrors) {
    _dynamicRef();
  } else {
    const valid2 = gen.let("valid", false);
    _dynamicRef(valid2);
    cxt.ok(valid2);
  }
  function _dynamicRef(valid2) {
    if (it.schemaEnv.root.dynamicAnchors[anchor]) {
      const v = gen.let("_v", (0, codegen_1$A._)`${names_1$8.default.dynamicAnchors}${(0, codegen_1$A.getProperty)(anchor)}`);
      gen.if(v, _callRef(v, valid2), _callRef(it.validateName, valid2));
    } else {
      _callRef(it.validateName, valid2)();
    }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  function _callRef(validate2, valid2) {
    return valid2 ? () => gen.block(() => {
      (0, ref_1$1.callRef)(cxt, validate2);
      gen.let(valid2, true);
    }) : () => (0, ref_1$1.callRef)(cxt, validate2);
  }
}
<<<<<<< HEAD
dynamicRef$1.dynamicRef = dynamicRef;
dynamicRef$1.default = def$C;
var recursiveAnchor = {};
Object.defineProperty(recursiveAnchor, "__esModule", { value: true });
const dynamicAnchor_1$1 = dynamicAnchor$1;
const util_1$v = util$1;
const def$B = {
  keyword: "$recursiveAnchor",
  schemaType: "boolean",
  code(cxt) {
    if (cxt.schema)
      (0, dynamicAnchor_1$1.dynamicAnchor)(cxt, "");
    else
      (0, util_1$v.checkStrictMode)(cxt.it, "$recursiveAnchor: false is ignored");
  }
};
recursiveAnchor.default = def$B;
var recursiveRef = {};
Object.defineProperty(recursiveRef, "__esModule", { value: true });
const dynamicRef_1$1 = dynamicRef$1;
const def$A = {
  keyword: "$recursiveRef",
  schemaType: "string",
  code: (cxt) => (0, dynamicRef_1$1.dynamicRef)(cxt, cxt.schema)
};
recursiveRef.default = def$A;
Object.defineProperty(dynamic$1, "__esModule", { value: true });
const dynamicAnchor_1 = dynamicAnchor$1;
const dynamicRef_1 = dynamicRef$1;
const recursiveAnchor_1 = recursiveAnchor;
const recursiveRef_1 = recursiveRef;
const dynamic = [dynamicAnchor_1.default, dynamicRef_1.default, recursiveAnchor_1.default, recursiveRef_1.default];
dynamic$1.default = dynamic;
var next$1 = {};
var dependentRequired = {};
Object.defineProperty(dependentRequired, "__esModule", { value: true });
const dependencies_1$2 = dependencies$1;
const def$z = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "dependentRequired",
  type: "object",
  schemaType: "object",
  error: dependencies_1$2.error,
  code: (cxt) => (0, dependencies_1$2.validatePropertyDeps)(cxt)
};
<<<<<<< HEAD
dependentRequired.default = def$z;
var dependentSchemas = {};
Object.defineProperty(dependentSchemas, "__esModule", { value: true });
const dependencies_1$1 = dependencies$1;
const def$y = {
  keyword: "dependentSchemas",
  type: "object",
  schemaType: "object",
  code: (cxt) => (0, dependencies_1$1.validateSchemaDeps)(cxt)
};
dependentSchemas.default = def$y;
var limitContains = {};
Object.defineProperty(limitContains, "__esModule", { value: true });
const util_1$u = util$1;
const def$x = {
  keyword: ["maxContains", "minContains"],
  type: "array",
  schemaType: "number",
  code({ keyword: keyword2, parentSchema, it }) {
    if (parentSchema.contains === void 0) {
      (0, util_1$u.checkStrictMode)(it, `"${keyword2}" without "contains" is ignored`);
    }
  }
};
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
const names_1$7 = names$3;
const error$m = {
  message: "must NOT have unevaluated properties",
  params: ({ params }) => (0, codegen_1$z._)`{unevaluatedProperty: ${params.unevaluatedProperty}}`
};
const def$w = {
  keyword: "unevaluatedProperties",
  type: "object",
  schemaType: ["boolean", "object"],
  trackErrors: true,
  error: error$m,
  code(cxt) {
    const { gen, schema, data, errsCount, it } = cxt;
    if (!errsCount)
      throw new Error("ajv implementation error");
    const { allErrors, props } = it;
    if (props instanceof codegen_1$z.Name) {
      gen.if((0, codegen_1$z._)`${props} !== true`, () => gen.forIn("key", data, (key) => gen.if(unevaluatedDynamic(props, key), () => unevaluatedPropCode(key))));
    } else if (props !== true) {
      gen.forIn("key", data, (key) => props === void 0 ? unevaluatedPropCode(key) : gen.if(unevaluatedStatic(props, key), () => unevaluatedPropCode(key)));
    }
    it.props = true;
    cxt.ok((0, codegen_1$z._)`${errsCount} === ${names_1$7.default.errors}`);
    function unevaluatedPropCode(key) {
      if (schema === false) {
        cxt.setParams({ unevaluatedProperty: key });
        cxt.error();
        if (!allErrors)
          gen.break();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        return;
      }
      if (!(0, util_1$t.alwaysValidSchema)(it, schema)) {
        const valid2 = gen.name("valid");
        cxt.subschema({
          keyword: "unevaluatedProperties",
<<<<<<< HEAD
          dataProp: key,
          dataPropType: util_1$t.Type.Str
        }, valid2);
        if (!allErrors)
          gen.if((0, codegen_1$z.not)(valid2), () => gen.break());
      }
    }
    function unevaluatedDynamic(evaluatedProps, key) {
      return (0, codegen_1$z._)`!${evaluatedProps} || !${evaluatedProps}[${key}]`;
    }
    function unevaluatedStatic(evaluatedProps, key) {
      const ps = [];
      for (const p in evaluatedProps) {
        if (evaluatedProps[p] === true)
          ps.push((0, codegen_1$z._)`${key} !== ${p}`);
      }
      return (0, codegen_1$z.and)(...ps);
    }
  }
};
unevaluatedProperties.default = def$w;
var unevaluatedItems = {};
Object.defineProperty(unevaluatedItems, "__esModule", { value: true });
const codegen_1$y = codegen$1;
const util_1$s = util$1;
const error$l = {
  message: ({ params: { len } }) => (0, codegen_1$y.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$y._)`{limit: ${len}}`
};
const def$v = {
  keyword: "unevaluatedItems",
  type: "array",
  schemaType: ["boolean", "object"],
  error: error$l,
  code(cxt) {
    const { gen, schema, data, it } = cxt;
    const items2 = it.items || 0;
    if (items2 === true)
      return;
    const len = gen.const("len", (0, codegen_1$y._)`${data}.length`);
    if (schema === false) {
      cxt.setParams({ len: items2 });
      cxt.fail((0, codegen_1$y._)`${len} > ${items2}`);
    } else if (typeof schema == "object" && !(0, util_1$s.alwaysValidSchema)(it, schema)) {
      const valid2 = gen.var("valid", (0, codegen_1$y._)`${len} <= ${items2}`);
      gen.if((0, codegen_1$y.not)(valid2), () => validateItems(valid2, items2));
      cxt.ok(valid2);
    }
    it.items = true;
    function validateItems(valid2, from) {
      gen.forRange("i", from, len, (i) => {
        cxt.subschema({ keyword: "unevaluatedItems", dataProp: i, dataPropType: util_1$s.Type.Num }, valid2);
        if (!it.allErrors)
          gen.if((0, codegen_1$y.not)(valid2), () => gen.break());
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      });
    }
  }
};
<<<<<<< HEAD
unevaluatedItems.default = def$v;
Object.defineProperty(unevaluated$2, "__esModule", { value: true });
const unevaluatedProperties_1 = unevaluatedProperties;
const unevaluatedItems_1 = unevaluatedItems;
const unevaluated$1 = [unevaluatedProperties_1.default, unevaluatedItems_1.default];
unevaluated$2.default = unevaluated$1;
var format$6 = {};
var format$5 = {};
Object.defineProperty(format$5, "__esModule", { value: true });
const codegen_1$x = codegen$1;
const error$k = {
  message: ({ schemaCode }) => (0, codegen_1$x.str)`must match format "${schemaCode}"`,
  params: ({ schemaCode }) => (0, codegen_1$x._)`{format: ${schemaCode}}`
};
const def$u = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: true,
  error: error$k,
  code(cxt, ruleType) {
    const { gen, data, $data, schema, schemaCode, it } = cxt;
    const { opts, errSchemaPath, schemaEnv, self } = it;
    if (!opts.validateFormats)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    if ($data)
      validate$DataFormat();
    else
      validateFormat();
    function validate$DataFormat() {
      const fmts = gen.scopeValue("formats", {
        ref: self.formats,
        code: opts.code.formats
      });
      const fDef = gen.const("fDef", (0, codegen_1$x._)`${fmts}[${schemaCode}]`);
      const fType = gen.let("fType");
      const format2 = gen.let("format");
      gen.if((0, codegen_1$x._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1$x._)`${fDef}.type || "string"`).assign(format2, (0, codegen_1$x._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1$x._)`"string"`).assign(format2, fDef));
      cxt.fail$data((0, codegen_1$x.or)(unknownFmt(), invalidFmt()));
      function unknownFmt() {
        if (opts.strictSchema === false)
          return codegen_1$x.nil;
        return (0, codegen_1$x._)`${schemaCode} && !${format2}`;
      }
      function invalidFmt() {
        const callFormat = schemaEnv.$async ? (0, codegen_1$x._)`(${fDef}.async ? await ${format2}(${data}) : ${format2}(${data}))` : (0, codegen_1$x._)`${format2}(${data})`;
        const validData = (0, codegen_1$x._)`(typeof ${format2} == "function" ? ${callFormat} : ${format2}.test(${data}))`;
        return (0, codegen_1$x._)`${format2} && ${format2} !== true && ${fType} === ${ruleType} && !${validData}`;
      }
    }
    function validateFormat() {
      const formatDef = self.formats[schema];
      if (!formatDef) {
        unknownFormat();
        return;
      }
      if (formatDef === true)
        return;
      const [fmtType, format2, fmtRef] = getFormat(formatDef);
      if (fmtType === ruleType)
        cxt.pass(validCondition());
      function unknownFormat() {
        if (opts.strictSchema === false) {
          self.logger.warn(unknownMsg());
          return;
        }
        throw new Error(unknownMsg());
        function unknownMsg() {
          return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
        }
      }
      function getFormat(fmtDef) {
        const code2 = fmtDef instanceof RegExp ? (0, codegen_1$x.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1$x._)`${opts.code.formats}${(0, codegen_1$x.getProperty)(schema)}` : void 0;
        const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code: code2 });
        if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
          return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1$x._)`${fmt}.validate`];
        }
        return ["string", fmtDef, fmt];
      }
      function validCondition() {
        if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
          if (!schemaEnv.$async)
            throw new Error("async format in sync schema");
          return (0, codegen_1$x._)`await ${fmtRef}(${data})`;
        }
        return typeof format2 == "function" ? (0, codegen_1$x._)`${fmtRef}(${data})` : (0, codegen_1$x._)`${fmtRef}.test(${data})`;
      }
    }
  }
};
<<<<<<< HEAD
format$5.default = def$u;
Object.defineProperty(format$6, "__esModule", { value: true });
const format_1$3 = format$5;
const format$4 = [format_1$3.default];
format$6.default = format$4;
var metadata$2 = {};
Object.defineProperty(metadata$2, "__esModule", { value: true });
metadata$2.contentVocabulary = metadata$2.metadataVocabulary = void 0;
metadata$2.metadataVocabulary = [
=======
ao.default = n$;
Object.defineProperty(so, "__esModule", { value: !0 });
const s$ = ao, a$ = [s$.default];
so.default = a$;
var yr = {};
Object.defineProperty(yr, "__esModule", { value: !0 });
yr.contentVocabulary = yr.metadataVocabulary = void 0;
yr.metadataVocabulary = [
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
<<<<<<< HEAD
metadata$2.contentVocabulary = [
=======
yr.contentVocabulary = [
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
<<<<<<< HEAD
Object.defineProperty(draft2020, "__esModule", { value: true });
const core_1$1 = core$5;
const validation_1$1 = validation$4;
const applicator_1$1 = applicator$2;
const dynamic_1 = dynamic$1;
const next_1 = next$1;
const unevaluated_1 = unevaluated$2;
const format_1$2 = format$6;
const metadata_1$1 = metadata$2;
const draft2020Vocabularies = [
  dynamic_1.default,
  core_1$1.default,
  validation_1$1.default,
  (0, applicator_1$1.default)(true),
  format_1$2.default,
  metadata_1$1.metadataVocabulary,
  metadata_1$1.contentVocabulary,
  next_1.default,
  unevaluated_1.default
];
draft2020.default = draft2020Vocabularies;
var discriminator$1 = {};
var types$1 = {};
Object.defineProperty(types$1, "__esModule", { value: true });
types$1.DiscrError = void 0;
var DiscrError$1;
(function(DiscrError2) {
  DiscrError2["Tag"] = "tag";
  DiscrError2["Mapping"] = "mapping";
})(DiscrError$1 || (types$1.DiscrError = DiscrError$1 = {}));
Object.defineProperty(discriminator$1, "__esModule", { value: true });
const codegen_1$w = codegen$1;
const types_1$1 = types$1;
const compile_1$2 = compile$1;
const ref_error_1$2 = ref_error$1;
const util_1$r = util$1;
const error$j = {
  message: ({ params: { discrError, tagName } }) => discrError === types_1$1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
  params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1$w._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
};
const def$t = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error: error$j,
  code(cxt) {
    const { gen, data, schema, parentSchema, it } = cxt;
    const { oneOf: oneOf2 } = parentSchema;
    if (!it.opts.discriminator) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("discriminator: requires discriminator option");
    }
    const tagName = schema.propertyName;
    if (typeof tagName != "string")
      throw new Error("discriminator: requires propertyName");
    if (schema.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!oneOf2)
      throw new Error("discriminator: requires oneOf keyword");
    const valid2 = gen.let("valid", false);
    const tag = gen.const("tag", (0, codegen_1$w._)`${data}${(0, codegen_1$w.getProperty)(tagName)}`);
    gen.if((0, codegen_1$w._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1$1.DiscrError.Tag, tag, tagName }));
    cxt.ok(valid2);
    function validateMapping() {
      const mapping = getMapping();
      gen.if(false);
      for (const tagValue in mapping) {
        gen.elseIf((0, codegen_1$w._)`${tag} === ${tagValue}`);
        gen.assign(valid2, applyTagSchema(mapping[tagValue]));
      }
      gen.else();
      cxt.error(false, { discrError: types_1$1.DiscrError.Mapping, tag, tagName });
      gen.endIf();
    }
    function applyTagSchema(schemaProp) {
      const _valid = gen.name("valid");
      const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
      cxt.mergeEvaluated(schCxt, codegen_1$w.Name);
      return _valid;
    }
<<<<<<< HEAD
    function getMapping() {
      var _a;
      const oneOfMapping = {};
      const topRequired = hasRequired(parentSchema);
      let tagRequired = true;
      for (let i = 0; i < oneOf2.length; i++) {
        let sch = oneOf2[i];
        if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1$r.schemaHasRulesButRef)(sch, it.self.RULES)) {
          const ref2 = sch.$ref;
          sch = compile_1$2.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref2);
          if (sch instanceof compile_1$2.SchemaEnv)
            sch = sch.schema;
          if (sch === void 0)
            throw new ref_error_1$2.default(it.opts.uriResolver, it.baseId, ref2);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        }
        const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
        if (typeof propSch != "object") {
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
        }
        tagRequired = tagRequired && (topRequired || hasRequired(sch));
        addMappings(propSch, i);
      }
      if (!tagRequired)
        throw new Error(`discriminator: "${tagName}" must be required`);
      return oneOfMapping;
      function hasRequired({ required: required2 }) {
        return Array.isArray(required2) && required2.includes(tagName);
      }
      function addMappings(sch, i) {
        if (sch.const) {
          addMapping(sch.const, i);
        } else if (sch.enum) {
          for (const tagValue of sch.enum) {
            addMapping(tagValue, i);
          }
        } else {
          throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
        }
      }
      function addMapping(tagValue, i) {
        if (typeof tagValue != "string" || tagValue in oneOfMapping) {
          throw new Error(`discriminator: "${tagName}" values must be unique strings`);
        }
        oneOfMapping[tagValue] = i;
      }
    }
  }
};
<<<<<<< HEAD
discriminator$1.default = def$t;
var jsonSchema202012 = {};
const $schema$8 = "https://json-schema.org/draft/2020-12/schema";
const $id$9 = "https://json-schema.org/draft/2020-12/schema";
const $vocabulary$7 = {
  "https://json-schema.org/draft/2020-12/vocab/core": true,
  "https://json-schema.org/draft/2020-12/vocab/applicator": true,
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": true,
  "https://json-schema.org/draft/2020-12/vocab/validation": true,
  "https://json-schema.org/draft/2020-12/vocab/meta-data": true,
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": true,
  "https://json-schema.org/draft/2020-12/vocab/content": true
};
const $dynamicAnchor$7 = "meta";
const title$8 = "Core and Validation specifications meta-schema";
const allOf$1 = [
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
];
const type$9 = [
  "object",
  "boolean"
];
const $comment = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.";
const properties$a = {
=======
], S$ = [
  "object",
  "boolean"
], P$ = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", N$ = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  definitions: {
    $comment: '"definitions" has been replaced by "$defs".',
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    deprecated: true,
    "default": {}
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
    deprecated: true,
    "default": {}
  },
  $recursiveAnchor: {
    $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".',
    $ref: "meta/core#/$defs/anchorString",
    deprecated: true
  },
  $recursiveRef: {
    $comment: '"$recursiveRef" has been replaced by "$dynamicRef".',
    $ref: "meta/core#/$defs/uriReferenceString",
    deprecated: true
  }
<<<<<<< HEAD
};
const require$$0 = {
  $schema: $schema$8,
  $id: $id$9,
  $vocabulary: $vocabulary$7,
  $dynamicAnchor: $dynamicAnchor$7,
  title: title$8,
  allOf: allOf$1,
  type: type$9,
  $comment,
  properties: properties$a
};
const $schema$7 = "https://json-schema.org/draft/2020-12/schema";
const $id$8 = "https://json-schema.org/draft/2020-12/meta/applicator";
const $vocabulary$6 = {
  "https://json-schema.org/draft/2020-12/vocab/applicator": true
};
const $dynamicAnchor$6 = "meta";
const title$7 = "Applicator vocabulary meta-schema";
const type$8 = [
  "object",
  "boolean"
];
const properties$9 = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
    "default": {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    propertyNames: {
      format: "regex"
    },
    "default": {}
  },
  dependentSchemas: {
    type: "object",
    additionalProperties: {
      $dynamicRef: "#meta"
    },
    "default": {}
  },
  propertyNames: {
    $dynamicRef: "#meta"
  },
  "if": {
    $dynamicRef: "#meta"
  },
  then: {
    $dynamicRef: "#meta"
  },
  "else": {
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
<<<<<<< HEAD
};
const $defs$2 = {
=======
}, D$ = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  schemaArray: {
    type: "array",
    minItems: 1,
    items: {
      $dynamicRef: "#meta"
    }
  }
<<<<<<< HEAD
};
const require$$1 = {
  $schema: $schema$7,
  $id: $id$8,
  $vocabulary: $vocabulary$6,
  $dynamicAnchor: $dynamicAnchor$6,
  title: title$7,
  type: type$8,
  properties: properties$9,
  $defs: $defs$2
};
const $schema$6 = "https://json-schema.org/draft/2020-12/schema";
const $id$7 = "https://json-schema.org/draft/2020-12/meta/unevaluated";
const $vocabulary$5 = {
  "https://json-schema.org/draft/2020-12/vocab/unevaluated": true
};
const $dynamicAnchor$5 = "meta";
const title$6 = "Unevaluated applicator vocabulary meta-schema";
const type$7 = [
  "object",
  "boolean"
];
const properties$8 = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  unevaluatedItems: {
    $dynamicRef: "#meta"
  },
  unevaluatedProperties: {
    $dynamicRef: "#meta"
  }
<<<<<<< HEAD
};
const require$$2 = {
  $schema: $schema$6,
  $id: $id$7,
  $vocabulary: $vocabulary$5,
  $dynamicAnchor: $dynamicAnchor$5,
  title: title$6,
  type: type$7,
  properties: properties$8
};
const $schema$5 = "https://json-schema.org/draft/2020-12/schema";
const $id$6 = "https://json-schema.org/draft/2020-12/meta/content";
const $vocabulary$4 = {
  "https://json-schema.org/draft/2020-12/vocab/content": true
};
const $dynamicAnchor$4 = "meta";
const title$5 = "Content vocabulary meta-schema";
const type$6 = [
  "object",
  "boolean"
];
const properties$7 = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  contentEncoding: {
    type: "string"
  },
  contentMediaType: {
    type: "string"
  },
  contentSchema: {
    $dynamicRef: "#meta"
  }
<<<<<<< HEAD
};
const require$$3$1 = {
  $schema: $schema$5,
  $id: $id$6,
  $vocabulary: $vocabulary$4,
  $dynamicAnchor: $dynamicAnchor$4,
  title: title$5,
  type: type$6,
  properties: properties$7
};
const $schema$4 = "https://json-schema.org/draft/2020-12/schema";
const $id$5 = "https://json-schema.org/draft/2020-12/meta/core";
const $vocabulary$3 = {
  "https://json-schema.org/draft/2020-12/vocab/core": true
};
const $dynamicAnchor$3 = "meta";
const title$4 = "Core vocabulary meta-schema";
const type$5 = [
  "object",
  "boolean"
];
const properties$6 = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
};
const $defs$1 = {
=======
}, oy = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
};
const require$$4 = {
  $schema: $schema$4,
  $id: $id$5,
  $vocabulary: $vocabulary$3,
  $dynamicAnchor: $dynamicAnchor$3,
  title: title$4,
  type: type$5,
  properties: properties$6,
  $defs: $defs$1
};
const $schema$3 = "https://json-schema.org/draft/2020-12/schema";
const $id$4 = "https://json-schema.org/draft/2020-12/meta/format-annotation";
const $vocabulary$2 = {
  "https://json-schema.org/draft/2020-12/vocab/format-annotation": true
};
const $dynamicAnchor$2 = "meta";
const title$3 = "Format vocabulary meta-schema for annotation results";
const type$4 = [
  "object",
  "boolean"
];
const properties$5 = {
  format: {
    type: "string"
  }
};
const require$$5 = {
  $schema: $schema$3,
  $id: $id$4,
  $vocabulary: $vocabulary$2,
  $dynamicAnchor: $dynamicAnchor$2,
  title: title$3,
  type: type$4,
  properties: properties$5
};
const $schema$2 = "https://json-schema.org/draft/2020-12/schema";
const $id$3 = "https://json-schema.org/draft/2020-12/meta/meta-data";
const $vocabulary$1 = {
  "https://json-schema.org/draft/2020-12/vocab/meta-data": true
};
const $dynamicAnchor$1 = "meta";
const title$2 = "Meta-data vocabulary meta-schema";
const type$3 = [
  "object",
  "boolean"
];
const properties$4 = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  title: {
    type: "string"
  },
  description: {
    type: "string"
  },
  "default": true,
  deprecated: {
    type: "boolean",
    "default": false
  },
  readOnly: {
    type: "boolean",
    "default": false
  },
  writeOnly: {
    type: "boolean",
    "default": false
  },
  examples: {
    type: "array",
    items: true
  }
<<<<<<< HEAD
};
const require$$6 = {
  $schema: $schema$2,
  $id: $id$3,
  $vocabulary: $vocabulary$1,
  $dynamicAnchor: $dynamicAnchor$1,
  title: title$2,
  type: type$3,
  properties: properties$4
};
const $schema$1 = "https://json-schema.org/draft/2020-12/schema";
const $id$2 = "https://json-schema.org/draft/2020-12/meta/validation";
const $vocabulary = {
  "https://json-schema.org/draft/2020-12/vocab/validation": true
};
const $dynamicAnchor = "meta";
const title$1 = "Validation vocabulary meta-schema";
const type$2 = [
  "object",
  "boolean"
];
const properties$3 = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
        uniqueItems: true
      }
    ]
  },
  "const": true,
  "enum": {
    type: "array",
    items: true
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
    "default": false
  },
  maxContains: {
    $ref: "#/$defs/nonNegativeInteger"
  },
  minContains: {
    $ref: "#/$defs/nonNegativeInteger",
    "default": 1
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
<<<<<<< HEAD
};
const $defs = {
=======
}, jy = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  nonNegativeInteger: {
    type: "integer",
    minimum: 0
  },
  nonNegativeIntegerDefault0: {
    $ref: "#/$defs/nonNegativeInteger",
    "default": 0
  },
  simpleTypes: {
    "enum": [
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
    uniqueItems: true,
    "default": []
  }
<<<<<<< HEAD
};
const require$$7 = {
  $schema: $schema$1,
  $id: $id$2,
  $vocabulary,
  $dynamicAnchor,
  title: title$1,
  type: type$2,
  properties: properties$3,
  $defs
};
Object.defineProperty(jsonSchema202012, "__esModule", { value: true });
const metaSchema = require$$0;
const applicator$1 = require$$1;
const unevaluated = require$$2;
const content = require$$3$1;
const core$3 = require$$4;
const format$3 = require$$5;
const metadata$1 = require$$6;
const validation$2 = require$$7;
const META_SUPPORT_DATA = ["/properties"];
function addMetaSchema2020($data) {
  [
    metaSchema,
    applicator$1,
    unevaluated,
    content,
    core$3,
    with$data(this, format$3),
    metadata$1,
    with$data(this, validation$2)
  ].forEach((sch) => this.addMetaSchema(sch, void 0, false));
  return this;
  function with$data(ajv2, sch) {
    return $data ? ajv2.$dataMetaSchema(sch, META_SUPPORT_DATA) : sch;
  }
}
jsonSchema202012.default = addMetaSchema2020;
(function(module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
  const core_12 = core$6;
  const draft2020_1 = draft2020;
  const discriminator_1 = discriminator$1;
  const json_schema_2020_12_1 = jsonSchema202012;
  const META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema";
  class Ajv2020 extends core_12.default {
    constructor(opts = {}) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      super({
        ...opts,
        dynamicRef: true,
        next: true,
        unevaluated: true
      });
    }
    _addVocabularies() {
      super._addVocabularies();
      draft2020_1.default.forEach((v) => this.addVocabulary(v));
      if (this.opts.discriminator)
        this.addKeyword(discriminator_1.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      const { $data, meta } = this.opts;
      if (!meta)
        return;
      json_schema_2020_12_1.default.call(this, $data);
      this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
    }
  }
<<<<<<< HEAD
  exports.Ajv2020 = Ajv2020;
  module.exports = exports = Ajv2020;
  module.exports.Ajv2020 = Ajv2020;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = Ajv2020;
  var validate_12 = validate$1;
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
=======
  t.Ajv2020 = c, e.exports = t = c, e.exports.Ajv2020 = c, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = c;
  var l = nt;
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return l.KeywordCxt;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } });
  var codegen_12 = codegen$1;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_12._;
  } });
<<<<<<< HEAD
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return codegen_12.str;
=======
  var u = xr;
  Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
    return u.default;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return codegen_12.stringify;
  } });
<<<<<<< HEAD
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return codegen_12.nil;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return codegen_12.Name;
  } });
  Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
    return codegen_12.CodeGen;
  } });
  var validation_error_12 = validation_error$1;
  Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
    return validation_error_12.default;
  } });
  var ref_error_12 = ref_error$1;
  Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
    return ref_error_12.default;
  } });
})(_2020, _2020.exports);
var _2020Exports = _2020.exports;
var dist = { exports: {} };
var formats = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
  function fmtDef(validate2, compare2) {
    return { validate: validate2, compare: compare2 };
=======
})(Ms, Ms.exports);
var Gy = Ms.exports, Ks = { exports: {} }, Ul = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
  function t(G, X) {
    return { validate: G, compare: X };
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  exports.fullFormats = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: fmtDef(date, compareDate),
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: fmtDef(getTime(true), compareTime),
    "date-time": fmtDef(getDateTime(true), compareDateTime),
    "iso-time": fmtDef(getTime(), compareIsoTime),
    "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
    uri: uri2,
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
    regex,
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
    byte,
    // signed 32 bit integer
    int32: { type: "number", validate: validateInt32 },
    // signed 64 bit integer
    int64: { type: "number", validate: validateInt64 },
    // C-type float
    float: { type: "number", validate: validateNumber },
    // C-type double
    double: { type: "number", validate: validateNumber },
    // hint to the UI to hide input strings
    password: true,
    // unchecked string payload
    binary: true
  };
  exports.fastFormats = {
    ...exports.fullFormats,
    date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
    time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
    "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
    "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
    "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
  };
  exports.formatNames = Object.keys(exports.fullFormats);
  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
  const DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function date(str) {
    const matches = DATE.exec(str);
    if (!matches)
      return false;
    const year = +matches[1];
    const month = +matches[2];
    const day = +matches[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
  }
  function compareDate(d1, d2) {
    if (!(d1 && d2))
      return void 0;
    if (d1 > d2)
      return 1;
    if (d1 < d2)
      return -1;
    return 0;
  }
  const TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
  function getTime(strictTimeZone) {
    return function time(str) {
      const matches = TIME.exec(str);
      if (!matches)
        return false;
      const hr = +matches[1];
      const min = +matches[2];
      const sec = +matches[3];
      const tz = matches[4];
      const tzSign = matches[5] === "-" ? -1 : 1;
      const tzH = +(matches[6] || 0);
      const tzM = +(matches[7] || 0);
      if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
        return false;
      if (hr <= 23 && min <= 59 && sec < 60)
        return true;
      const utcMin = min - tzM * tzSign;
      const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
      return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
    };
  }
  function compareTime(s1, s2) {
    if (!(s1 && s2))
      return void 0;
    const t1 = (/* @__PURE__ */ new Date("2020-01-01T" + s1)).valueOf();
    const t2 = (/* @__PURE__ */ new Date("2020-01-01T" + s2)).valueOf();
    if (!(t1 && t2))
      return void 0;
    return t1 - t2;
  }
  function compareIsoTime(t1, t2) {
    if (!(t1 && t2))
      return void 0;
    const a1 = TIME.exec(t1);
    const a2 = TIME.exec(t2);
    if (!(a1 && a2))
      return void 0;
    t1 = a1[1] + a1[2] + a1[3];
    t2 = a2[1] + a2[2] + a2[3];
    if (t1 > t2)
      return 1;
    if (t1 < t2)
      return -1;
    return 0;
  }
  const DATE_TIME_SEPARATOR = /t|\s/i;
  function getDateTime(strictTimeZone) {
    const time = getTime(strictTimeZone);
    return function date_time(str) {
      const dateTime = str.split(DATE_TIME_SEPARATOR);
      return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
    };
  }
  function compareDateTime(dt1, dt2) {
    if (!(dt1 && dt2))
      return void 0;
    const d1 = new Date(dt1).valueOf();
    const d2 = new Date(dt2).valueOf();
    if (!(d1 && d2))
      return void 0;
    return d1 - d2;
  }
  function compareIsoDateTime(dt1, dt2) {
    if (!(dt1 && dt2))
      return void 0;
    const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
    const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
    const res = compareDate(d1, d2);
    if (res === void 0)
      return void 0;
    return res || compareTime(t1, t2);
  }
  const NOT_URI_FRAGMENT = /\/|:/;
  const URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  function uri2(str) {
    return NOT_URI_FRAGMENT.test(str) && URI.test(str);
  }
  const BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
  function byte(str) {
    BYTE.lastIndex = 0;
    return BYTE.test(str);
  }
  const MIN_INT32 = -2147483648;
  const MAX_INT32 = 2 ** 31 - 1;
  function validateInt32(value) {
    return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
  }
  function validateInt64(value) {
    return Number.isInteger(value);
  }
  function validateNumber() {
    return true;
  }
  const Z_ANCHOR = /[^\\]\\Z/;
  function regex(str) {
    if (Z_ANCHOR.test(str))
      return false;
    try {
      new RegExp(str);
      return true;
    } catch (e) {
      return false;
    }
  }
<<<<<<< HEAD
})(formats);
var limit = {};
var ajv = { exports: {} };
var core$2 = {};
var validate = {};
var boolSchema = {};
var errors = {};
var codegen = {};
var code$1 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
  class _CodeOrName {
=======
})(Ul);
var ql = {}, Hs = { exports: {} }, Gl = {}, mt = {}, Gt = {}, tn = {}, se = {}, Qr = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
  class t {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  exports._CodeOrName = _CodeOrName;
  exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
  class Name extends _CodeOrName {
    constructor(s) {
      super();
      if (!exports.IDENTIFIER.test(s))
        throw new Error("CodeGen: name must be a valid identifier");
      this.str = s;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      return false;
    }
    get names() {
      return { [this.str]: 1 };
    }
  }
  exports.Name = Name;
  class _Code extends _CodeOrName {
    constructor(code2) {
      super();
      this._items = typeof code2 === "string" ? [code2] : code2;
    }
    toString() {
      return this.str;
    }
    emptyStr() {
      if (this._items.length > 1)
        return false;
      const item = this._items[0];
      return item === "" || item === '""';
    }
    get str() {
      var _a;
      return (_a = this._str) !== null && _a !== void 0 ? _a : this._str = this._items.reduce((s, c) => `${s}${c}`, "");
    }
    get names() {
      var _a;
      return (_a = this._names) !== null && _a !== void 0 ? _a : this._names = this._items.reduce((names2, c) => {
        if (c instanceof Name)
          names2[c.str] = (names2[c.str] || 0) + 1;
        return names2;
      }, {});
    }
  }
  exports._Code = _Code;
  exports.nil = new _Code("");
  function _(strs, ...args) {
    const code2 = [strs[0]];
    let i = 0;
    while (i < args.length) {
      addCodeArg(code2, args[i]);
      code2.push(strs[++i]);
    }
    return new _Code(code2);
  }
  exports._ = _;
  const plus = new _Code("+");
  function str(strs, ...args) {
    const expr = [safeStringify(strs[0])];
    let i = 0;
    while (i < args.length) {
      expr.push(plus);
      addCodeArg(expr, args[i]);
      expr.push(plus, safeStringify(strs[++i]));
    }
    optimize(expr);
    return new _Code(expr);
  }
  exports.str = str;
  function addCodeArg(code2, arg) {
    if (arg instanceof _Code)
      code2.push(...arg._items);
    else if (arg instanceof Name)
      code2.push(arg);
    else
      code2.push(interpolate(arg));
  }
  exports.addCodeArg = addCodeArg;
  function optimize(expr) {
    let i = 1;
    while (i < expr.length - 1) {
      if (expr[i] === plus) {
        const res = mergeExprItems(expr[i - 1], expr[i + 1]);
        if (res !== void 0) {
          expr.splice(i - 1, 3, res);
          continue;
        }
        expr[i++] = "+";
      }
      i++;
    }
  }
  function mergeExprItems(a, b) {
    if (b === '""')
      return a;
    if (a === '""')
      return b;
    if (typeof a == "string") {
      if (b instanceof Name || a[a.length - 1] !== '"')
        return;
      if (typeof b != "string")
        return `${a.slice(0, -1)}${b}"`;
      if (b[0] === '"')
        return a.slice(0, -1) + b.slice(1);
      return;
    }
    if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
      return `"${a}${b.slice(1)}`;
    return;
  }
  function strConcat(c1, c2) {
    return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
  }
  exports.strConcat = strConcat;
  function interpolate(x) {
    return typeof x == "number" || typeof x == "boolean" || x === null ? x : safeStringify(Array.isArray(x) ? x.join(",") : x);
  }
  function stringify(x) {
    return new _Code(safeStringify(x));
  }
  exports.stringify = stringify;
  function safeStringify(x) {
    return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }
  exports.safeStringify = safeStringify;
  function getProperty2(key) {
    return typeof key == "string" && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
  }
  exports.getProperty = getProperty2;
  function getEsmExportName(key) {
    if (typeof key == "string" && exports.IDENTIFIER.test(key)) {
      return new _Code(`${key}`);
    }
    throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
  }
  exports.getEsmExportName = getEsmExportName;
  function regexpCode(rx) {
    return new _Code(rx.toString());
  }
<<<<<<< HEAD
  exports.regexpCode = regexpCode;
})(code$1);
var scope = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
  const code_12 = code$1;
  class ValueError extends Error {
    constructor(name) {
      super(`CodeGen: "code" for ${name} not defined`);
      this.value = name.value;
=======
  e.regexpCode = _;
})(Qr);
var Bs = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
  const t = Qr;
  class r extends Error {
    constructor(d) {
      super(`CodeGen: "code" for ${d} not defined`), this.value = d.value;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
  }
  var UsedValueState;
  (function(UsedValueState2) {
    UsedValueState2[UsedValueState2["Started"] = 0] = "Started";
    UsedValueState2[UsedValueState2["Completed"] = 1] = "Completed";
  })(UsedValueState || (exports.UsedValueState = UsedValueState = {}));
  exports.varKinds = {
    const: new code_12.Name("const"),
    let: new code_12.Name("let"),
    var: new code_12.Name("var")
  };
  class Scope {
    constructor({ prefixes, parent } = {}) {
      this._names = {};
      this._prefixes = prefixes;
      this._parent = parent;
    }
    toName(nameOrPrefix) {
      return nameOrPrefix instanceof code_12.Name ? nameOrPrefix : this.name(nameOrPrefix);
    }
    name(prefix) {
      return new code_12.Name(this._newName(prefix));
    }
    _newName(prefix) {
      const ng = this._names[prefix] || this._nameGroup(prefix);
      return `${prefix}${ng.index++}`;
    }
    _nameGroup(prefix) {
      var _a, _b;
      if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) {
        throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
      }
      return this._names[prefix] = { prefix, index: 0 };
    }
  }
  exports.Scope = Scope;
  class ValueScopeName extends code_12.Name {
    constructor(prefix, nameStr) {
      super(nameStr);
      this.prefix = prefix;
    }
    setValue(value, { property, itemIndex }) {
      this.value = value;
      this.scopePath = (0, code_12._)`.${new code_12.Name(property)}[${itemIndex}]`;
    }
  }
  exports.ValueScopeName = ValueScopeName;
  const line = (0, code_12._)`\n`;
  class ValueScope extends Scope {
    constructor(opts) {
      super(opts);
      this._values = {};
      this._scope = opts.scope;
      this.opts = { ...opts, _n: opts.lines ? line : code_12.nil };
    }
    get() {
      return this._scope;
    }
    name(prefix) {
      return new ValueScopeName(prefix, this._newName(prefix));
    }
    value(nameOrPrefix, value) {
      var _a;
      if (value.ref === void 0)
        throw new Error("CodeGen: ref must be passed in value");
      const name = this.toName(nameOrPrefix);
      const { prefix } = name;
      const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
      let vs = this._values[prefix];
      if (vs) {
        const _name = vs.get(valueKey);
        if (_name)
          return _name;
      } else {
        vs = this._values[prefix] = /* @__PURE__ */ new Map();
      }
      vs.set(valueKey, name);
      const s = this._scope[prefix] || (this._scope[prefix] = []);
      const itemIndex = s.length;
      s[itemIndex] = value.ref;
      name.setValue(value, { property: prefix, itemIndex });
      return name;
    }
    getValue(prefix, keyOrRef) {
      const vs = this._values[prefix];
      if (!vs)
        return;
      return vs.get(keyOrRef);
    }
    scopeRefs(scopeName, values = this._values) {
      return this._reduceValues(values, (name) => {
        if (name.scopePath === void 0)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return (0, code_12._)`${scopeName}${name.scopePath}`;
      });
    }
    scopeCode(values = this._values, usedValues, getCode) {
      return this._reduceValues(values, (name) => {
        if (name.value === void 0)
          throw new Error(`CodeGen: name "${name}" has no value`);
        return name.value.code;
      }, usedValues, getCode);
    }
    _reduceValues(values, valueCode, usedValues = {}, getCode) {
      let code2 = code_12.nil;
      for (const prefix in values) {
        const vs = values[prefix];
        if (!vs)
          continue;
        const nameSet = usedValues[prefix] = usedValues[prefix] || /* @__PURE__ */ new Map();
        vs.forEach((name) => {
          if (nameSet.has(name))
            return;
          nameSet.set(name, UsedValueState.Started);
          let c = valueCode(name);
          if (c) {
            const def2 = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
            code2 = (0, code_12._)`${code2}${def2} ${name} = ${c};${this.opts._n}`;
          } else if (c = getCode === null || getCode === void 0 ? void 0 : getCode(name)) {
            code2 = (0, code_12._)`${code2}${c}${this.opts._n}`;
          } else {
            throw new ValueError(name);
          }
          nameSet.set(name, UsedValueState.Completed);
        });
      }
      return code2;
    }
  }
<<<<<<< HEAD
  exports.ValueScope = ValueScope;
})(scope);
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
  const code_12 = code$1;
  const scope_1 = scope;
  var code_2 = code$1;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return code_2._;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } });
  Object.defineProperty(exports, "str", { enumerable: true, get: function() {
    return code_2.str;
  } });
  Object.defineProperty(exports, "strConcat", { enumerable: true, get: function() {
    return code_2.strConcat;
  } });
  Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
    return code_2.nil;
  } });
  Object.defineProperty(exports, "getProperty", { enumerable: true, get: function() {
    return code_2.getProperty;
  } });
  Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
    return code_2.stringify;
  } });
  Object.defineProperty(exports, "regexpCode", { enumerable: true, get: function() {
    return code_2.regexpCode;
  } });
  Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
    return code_2.Name;
  } });
  var scope_2 = scope;
  Object.defineProperty(exports, "Scope", { enumerable: true, get: function() {
    return scope_2.Scope;
  } });
  Object.defineProperty(exports, "ValueScope", { enumerable: true, get: function() {
    return scope_2.ValueScope;
  } });
  Object.defineProperty(exports, "ValueScopeName", { enumerable: true, get: function() {
    return scope_2.ValueScopeName;
  } });
  Object.defineProperty(exports, "varKinds", { enumerable: true, get: function() {
    return scope_2.varKinds;
  } });
  exports.operators = {
    GT: new code_12._Code(">"),
    GTE: new code_12._Code(">="),
    LT: new code_12._Code("<"),
    LTE: new code_12._Code("<="),
    EQ: new code_12._Code("==="),
    NEQ: new code_12._Code("!=="),
    NOT: new code_12._Code("!"),
    OR: new code_12._Code("||"),
    AND: new code_12._Code("&&"),
    ADD: new code_12._Code("+")
  };
  class Node {
    optimizeNodes() {
      return this;
    }
    optimizeNames(_names, _constants) {
      return this;
    }
  }
  class Def extends Node {
    constructor(varKind, name, rhs) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.rhs = rhs;
    }
    render({ es5, _n }) {
      const varKind = es5 ? scope_1.varKinds.var : this.varKind;
      const rhs = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
      return `${varKind} ${this.name}${rhs};` + _n;
    }
    optimizeNames(names2, constants2) {
      if (!names2[this.name.str])
        return;
      if (this.rhs)
        this.rhs = optimizeExpr(this.rhs, names2, constants2);
      return this;
    }
    get names() {
      return this.rhs instanceof code_12._CodeOrName ? this.rhs.names : {};
    }
  }
  class Assign extends Node {
    constructor(lhs, rhs, sideEffects) {
      super();
      this.lhs = lhs;
      this.rhs = rhs;
      this.sideEffects = sideEffects;
    }
    render({ _n }) {
      return `${this.lhs} = ${this.rhs};` + _n;
    }
    optimizeNames(names2, constants2) {
      if (this.lhs instanceof code_12.Name && !names2[this.lhs.str] && !this.sideEffects)
        return;
      this.rhs = optimizeExpr(this.rhs, names2, constants2);
      return this;
    }
    get names() {
      const names2 = this.lhs instanceof code_12.Name ? {} : { ...this.lhs.names };
      return addExprNames(names2, this.rhs);
    }
  }
  class AssignOp extends Assign {
    constructor(lhs, op, rhs, sideEffects) {
      super(lhs, rhs, sideEffects);
      this.op = op;
    }
    render({ _n }) {
      return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
    }
  }
  class Label extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      return `${this.label}:` + _n;
    }
  }
  class Break extends Node {
    constructor(label) {
      super();
      this.label = label;
      this.names = {};
    }
    render({ _n }) {
      const label = this.label ? ` ${this.label}` : "";
      return `break${label};` + _n;
    }
  }
  class Throw extends Node {
    constructor(error2) {
      super();
      this.error = error2;
    }
    render({ _n }) {
      return `throw ${this.error};` + _n;
    }
    get names() {
      return this.error.names;
    }
  }
  class AnyCode extends Node {
    constructor(code2) {
      super();
      this.code = code2;
    }
    render({ _n }) {
      return `${this.code};` + _n;
    }
    optimizeNodes() {
      return `${this.code}` ? this : void 0;
    }
    optimizeNames(names2, constants2) {
      this.code = optimizeExpr(this.code, names2, constants2);
      return this;
    }
    get names() {
      return this.code instanceof code_12._CodeOrName ? this.code.names : {};
    }
  }
  class ParentNode extends Node {
    constructor(nodes = []) {
      super();
      this.nodes = nodes;
    }
    render(opts) {
      return this.nodes.reduce((code2, n) => code2 + n.render(opts), "");
    }
    optimizeNodes() {
      const { nodes } = this;
      let i = nodes.length;
      while (i--) {
        const n = nodes[i].optimizeNodes();
        if (Array.isArray(n))
          nodes.splice(i, 1, ...n);
        else if (n)
          nodes[i] = n;
        else
          nodes.splice(i, 1);
      }
      return nodes.length > 0 ? this : void 0;
    }
    optimizeNames(names2, constants2) {
      const { nodes } = this;
      let i = nodes.length;
      while (i--) {
        const n = nodes[i];
        if (n.optimizeNames(names2, constants2))
          continue;
        subtractNames(names2, n.names);
        nodes.splice(i, 1);
      }
      return nodes.length > 0 ? this : void 0;
    }
    get names() {
      return this.nodes.reduce((names2, n) => addNames(names2, n.names), {});
    }
  }
  class BlockNode extends ParentNode {
    render(opts) {
      return "{" + opts._n + super.render(opts) + "}" + opts._n;
    }
  }
  class Root extends ParentNode {
  }
  class Else extends BlockNode {
  }
  Else.kind = "else";
  class If extends BlockNode {
    constructor(condition, nodes) {
      super(nodes);
      this.condition = condition;
    }
    render(opts) {
      let code2 = `if(${this.condition})` + super.render(opts);
      if (this.else)
        code2 += "else " + this.else.render(opts);
      return code2;
    }
    optimizeNodes() {
      super.optimizeNodes();
      const cond = this.condition;
      if (cond === true)
        return this.nodes;
      let e = this.else;
      if (e) {
        const ns = e.optimizeNodes();
        e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
      }
      if (e) {
        if (cond === false)
          return e instanceof If ? e : e.nodes;
        if (this.nodes.length)
          return this;
        return new If(not2(cond), e instanceof If ? [e] : e.nodes);
      }
      if (cond === false || !this.nodes.length)
        return void 0;
      return this;
    }
    optimizeNames(names2, constants2) {
      var _a;
      this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names2, constants2);
      if (!(super.optimizeNames(names2, constants2) || this.else))
        return;
      this.condition = optimizeExpr(this.condition, names2, constants2);
      return this;
    }
    get names() {
      const names2 = super.names;
      addExprNames(names2, this.condition);
      if (this.else)
        addNames(names2, this.else.names);
      return names2;
    }
  }
  If.kind = "if";
  class For extends BlockNode {
  }
  For.kind = "for";
  class ForLoop extends For {
    constructor(iteration) {
      super();
      this.iteration = iteration;
    }
    render(opts) {
      return `for(${this.iteration})` + super.render(opts);
    }
    optimizeNames(names2, constants2) {
      if (!super.optimizeNames(names2, constants2))
        return;
      this.iteration = optimizeExpr(this.iteration, names2, constants2);
      return this;
    }
    get names() {
      return addNames(super.names, this.iteration.names);
    }
  }
  class ForRange extends For {
    constructor(varKind, name, from, to) {
      super();
      this.varKind = varKind;
      this.name = name;
      this.from = from;
      this.to = to;
    }
    render(opts) {
      const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
      const { name, from, to } = this;
      return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
    }
    get names() {
      const names2 = addExprNames(super.names, this.from);
      return addExprNames(names2, this.to);
    }
  }
  class ForIter extends For {
    constructor(loop, varKind, name, iterable) {
      super();
      this.loop = loop;
      this.varKind = varKind;
      this.name = name;
      this.iterable = iterable;
    }
    render(opts) {
      return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
    }
    optimizeNames(names2, constants2) {
      if (!super.optimizeNames(names2, constants2))
        return;
      this.iterable = optimizeExpr(this.iterable, names2, constants2);
      return this;
    }
    get names() {
      return addNames(super.names, this.iterable.names);
    }
  }
  class Func extends BlockNode {
    constructor(name, args, async) {
      super();
      this.name = name;
      this.args = args;
      this.async = async;
    }
    render(opts) {
      const _async = this.async ? "async " : "";
      return `${_async}function ${this.name}(${this.args})` + super.render(opts);
    }
  }
  Func.kind = "func";
  class Return extends ParentNode {
    render(opts) {
      return "return " + super.render(opts);
    }
  }
  Return.kind = "return";
  class Try extends BlockNode {
    render(opts) {
      let code2 = "try" + super.render(opts);
      if (this.catch)
        code2 += this.catch.render(opts);
      if (this.finally)
        code2 += this.finally.render(opts);
      return code2;
    }
    optimizeNodes() {
      var _a, _b;
      super.optimizeNodes();
      (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
      (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
      return this;
    }
    optimizeNames(names2, constants2) {
      var _a, _b;
      super.optimizeNames(names2, constants2);
      (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names2, constants2);
      (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names2, constants2);
      return this;
    }
    get names() {
      const names2 = super.names;
      if (this.catch)
        addNames(names2, this.catch.names);
      if (this.finally)
        addNames(names2, this.finally.names);
      return names2;
    }
  }
  class Catch extends BlockNode {
    constructor(error2) {
      super();
      this.error = error2;
    }
    render(opts) {
      return `catch(${this.error})` + super.render(opts);
    }
  }
  Catch.kind = "catch";
  class Finally extends BlockNode {
    render(opts) {
      return "finally" + super.render(opts);
    }
  }
  Finally.kind = "finally";
  class CodeGen {
    constructor(extScope, opts = {}) {
      this._values = {};
      this._blockStarts = [];
      this._constants = {};
      this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
      this._extScope = extScope;
      this._scope = new scope_1.Scope({ parent: extScope });
      this._nodes = [new Root()];
    }
    toString() {
      return this._root.render(this.opts);
    }
    // returns unique name in the internal scope
    name(prefix) {
      return this._scope.name(prefix);
    }
    // reserves unique name in the external scope
    scopeName(prefix) {
      return this._extScope.name(prefix);
    }
    // reserves unique name in the external scope and assigns value to it
    scopeValue(prefixOrName, value) {
      const name = this._extScope.value(prefixOrName, value);
      const vs = this._values[name.prefix] || (this._values[name.prefix] = /* @__PURE__ */ new Set());
      vs.add(name);
      return name;
    }
    getScopeValue(prefix, keyOrRef) {
      return this._extScope.getValue(prefix, keyOrRef);
    }
    // return code that assigns values in the external scope to the names that are used internally
    // (same names that were returned by gen.scopeName or gen.scopeValue)
    scopeRefs(scopeName) {
      return this._extScope.scopeRefs(scopeName, this._values);
    }
    scopeCode() {
      return this._extScope.scopeCode(this._values);
    }
    _def(varKind, nameOrPrefix, rhs, constant) {
      const name = this._scope.toName(nameOrPrefix);
      if (rhs !== void 0 && constant)
        this._constants[name.str] = rhs;
      this._leafNode(new Def(varKind, name, rhs));
      return name;
    }
    // `const` declaration (`var` in es5 mode)
    const(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
    }
    // `let` declaration with optional assignment (`var` in es5 mode)
    let(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
    }
    // `var` declaration with optional assignment
    var(nameOrPrefix, rhs, _constant) {
      return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
    }
    // assignment code
    assign(lhs, rhs, sideEffects) {
      return this._leafNode(new Assign(lhs, rhs, sideEffects));
    }
    // `+=` code
    add(lhs, rhs) {
      return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
    }
    // appends passed SafeExpr to code or executes Block
    code(c) {
      if (typeof c == "function")
        c();
      else if (c !== code_12.nil)
        this._leafNode(new AnyCode(c));
      return this;
    }
    // returns code for object literal for the passed argument list of key-value pairs
    object(...keyValues) {
      const code2 = ["{"];
      for (const [key, value] of keyValues) {
        if (code2.length > 1)
          code2.push(",");
        code2.push(key);
        if (key !== value || this.opts.es5) {
          code2.push(":");
          (0, code_12.addCodeArg)(code2, value);
        }
      }
      code2.push("}");
      return new code_12._Code(code2);
    }
    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
    if(condition, thenBody, elseBody) {
      this._blockNode(new If(condition));
      if (thenBody && elseBody) {
        this.code(thenBody).else().code(elseBody).endIf();
      } else if (thenBody) {
        this.code(thenBody).endIf();
      } else if (elseBody) {
        throw new Error('CodeGen: "else" body without "then" body');
      }
      return this;
    }
    // `else if` clause - invalid without `if` or after `else` clauses
    elseIf(condition) {
      return this._elseNode(new If(condition));
    }
    // `else` clause - only valid after `if` or `else if` clauses
    else() {
      return this._elseNode(new Else());
    }
    // end `if` statement (needed if gen.if was used only with condition)
    endIf() {
      return this._endBlockNode(If, Else);
    }
    _for(node, forBody) {
      this._blockNode(node);
      if (forBody)
        this.code(forBody).endFor();
      return this;
    }
    // a generic `for` clause (or statement if `forBody` is passed)
    for(iteration, forBody) {
      return this._for(new ForLoop(iteration), forBody);
    }
    // `for` statement for a range of values
    forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
    }
    // `for-of` statement (in es5 mode replace with a normal for loop)
    forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
      const name = this._scope.toName(nameOrPrefix);
      if (this.opts.es5) {
        const arr = iterable instanceof code_12.Name ? iterable : this.var("_arr", iterable);
        return this.forRange("_i", 0, (0, code_12._)`${arr}.length`, (i) => {
          this.var(name, (0, code_12._)`${arr}[${i}]`);
          forBody(name);
        });
      }
      return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
    }
    // `for-in` statement.
    // With option `ownProperties` replaced with a `for-of` loop for object keys
    forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
      if (this.opts.ownProperties) {
        return this.forOf(nameOrPrefix, (0, code_12._)`Object.keys(${obj})`, forBody);
      }
      const name = this._scope.toName(nameOrPrefix);
      return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
    }
    // end `for` loop
    endFor() {
      return this._endBlockNode(For);
    }
    // `label` statement
    label(label) {
      return this._leafNode(new Label(label));
    }
    // `break` statement
    break(label) {
      return this._leafNode(new Break(label));
    }
    // `return` statement
    return(value) {
      const node = new Return();
      this._blockNode(node);
      this.code(value);
      if (node.nodes.length !== 1)
        throw new Error('CodeGen: "return" should have one node');
      return this._endBlockNode(Return);
    }
    // `try` statement
    try(tryBody, catchCode, finallyCode) {
      if (!catchCode && !finallyCode)
        throw new Error('CodeGen: "try" without "catch" and "finally"');
      const node = new Try();
      this._blockNode(node);
      this.code(tryBody);
      if (catchCode) {
        const error2 = this.name("e");
        this._currNode = node.catch = new Catch(error2);
        catchCode(error2);
      }
      if (finallyCode) {
        this._currNode = node.finally = new Finally();
        this.code(finallyCode);
      }
      return this._endBlockNode(Catch, Finally);
    }
    // `throw` statement
    throw(error2) {
      return this._leafNode(new Throw(error2));
    }
    // start self-balancing block
    block(body, nodeCount) {
      this._blockStarts.push(this._nodes.length);
      if (body)
        this.code(body).endBlock(nodeCount);
      return this;
    }
    // end the current self-balancing block
    endBlock(nodeCount) {
      const len = this._blockStarts.pop();
      if (len === void 0)
        throw new Error("CodeGen: not in self-balancing block");
      const toClose = this._nodes.length - len;
      if (toClose < 0 || nodeCount !== void 0 && toClose !== nodeCount) {
        throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
      }
      this._nodes.length = len;
      return this;
    }
    // `function` heading (or definition if funcBody is passed)
    func(name, args = code_12.nil, async, funcBody) {
      this._blockNode(new Func(name, args, async));
      if (funcBody)
        this.code(funcBody).endFunc();
      return this;
    }
    // end function definition
    endFunc() {
      return this._endBlockNode(Func);
    }
    optimize(n = 1) {
      while (n-- > 0) {
        this._root.optimizeNodes();
        this._root.optimizeNames(this._root.names, this._constants);
      }
    }
    _leafNode(node) {
      this._currNode.nodes.push(node);
      return this;
    }
    _blockNode(node) {
      this._currNode.nodes.push(node);
      this._nodes.push(node);
    }
    _endBlockNode(N1, N2) {
      const n = this._currNode;
      if (n instanceof N1 || N2 && n instanceof N2) {
        this._nodes.pop();
        return this;
      }
      throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
    }
    _elseNode(node) {
      const n = this._currNode;
      if (!(n instanceof If)) {
        throw new Error('CodeGen: "else" without "if"');
      }
      this._currNode = n.else = node;
      return this;
    }
    get _root() {
      return this._nodes[0];
    }
    get _currNode() {
      const ns = this._nodes;
      return ns[ns.length - 1];
    }
    set _currNode(node) {
      const ns = this._nodes;
      ns[ns.length - 1] = node;
    }
  }
  exports.CodeGen = CodeGen;
  function addNames(names2, from) {
    for (const n in from)
      names2[n] = (names2[n] || 0) + (from[n] || 0);
    return names2;
  }
  function addExprNames(names2, from) {
    return from instanceof code_12._CodeOrName ? addNames(names2, from.names) : names2;
  }
  function optimizeExpr(expr, names2, constants2) {
    if (expr instanceof code_12.Name)
      return replaceName(expr);
    if (!canOptimize(expr))
      return expr;
    return new code_12._Code(expr._items.reduce((items2, c) => {
      if (c instanceof code_12.Name)
        c = replaceName(c);
      if (c instanceof code_12._Code)
        items2.push(...c._items);
      else
        items2.push(c);
      return items2;
    }, []));
    function replaceName(n) {
      const c = constants2[n.str];
      if (c === void 0 || names2[n.str] !== 1)
        return n;
      delete names2[n.str];
      return c;
    }
    function canOptimize(e) {
      return e instanceof code_12._Code && e._items.some((c) => c instanceof code_12.Name && names2[c.str] === 1 && constants2[c.str] !== void 0);
    }
  }
  function subtractNames(names2, from) {
    for (const n in from)
      names2[n] = (names2[n] || 0) - (from[n] || 0);
  }
  function not2(x) {
    return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_12._)`!${par(x)}`;
  }
  exports.not = not2;
  const andCode = mappend(exports.operators.AND);
  function and(...args) {
    return args.reduce(andCode);
  }
  exports.and = and;
  const orCode = mappend(exports.operators.OR);
  function or(...args) {
    return args.reduce(orCode);
  }
  exports.or = or;
  function mappend(op) {
    return (x, y) => x === code_12.nil ? y : y === code_12.nil ? x : (0, code_12._)`${par(x)} ${op} ${par(y)}`;
  }
  function par(x) {
    return x instanceof code_12.Name ? x : (0, code_12._)`(${x})`;
  }
<<<<<<< HEAD
})(codegen);
var util = {};
Object.defineProperty(util, "__esModule", { value: true });
util.checkStrictMode = util.getErrorPath = util.Type = util.useFunc = util.setEvaluated = util.evaluatedPropsToName = util.mergeEvaluated = util.eachItem = util.unescapeJsonPointer = util.escapeJsonPointer = util.escapeFragment = util.unescapeFragment = util.schemaRefOrVal = util.schemaHasRulesButRef = util.schemaHasRules = util.checkUnknownRules = util.alwaysValidSchema = util.toHash = void 0;
const codegen_1$v = codegen;
const code_1$a = code$1;
function toHash(arr) {
  const hash = {};
  for (const item of arr)
    hash[item] = true;
  return hash;
}
util.toHash = toHash;
function alwaysValidSchema(it, schema) {
  if (typeof schema == "boolean")
    return schema;
  if (Object.keys(schema).length === 0)
    return true;
  checkUnknownRules(it, schema);
  return !schemaHasRules(schema, it.self.RULES.all);
}
util.alwaysValidSchema = alwaysValidSchema;
function checkUnknownRules(it, schema = it.schema) {
  const { opts, self } = it;
  if (!opts.strictSchema)
    return;
  if (typeof schema === "boolean")
    return;
  const rules2 = self.RULES.keywords;
  for (const key in schema) {
    if (!rules2[key])
      checkStrictMode(it, `unknown keyword: "${key}"`);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
}
<<<<<<< HEAD
util.checkUnknownRules = checkUnknownRules;
function schemaHasRules(schema, rules2) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (rules2[key])
      return true;
  return false;
}
util.schemaHasRules = schemaHasRules;
function schemaHasRulesButRef(schema, RULES) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (key !== "$ref" && RULES.all[key])
      return true;
  return false;
}
util.schemaHasRulesButRef = schemaHasRulesButRef;
function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword2, $data) {
  if (!$data) {
    if (typeof schema == "number" || typeof schema == "boolean")
      return schema;
    if (typeof schema == "string")
      return (0, codegen_1$v._)`${schema}`;
  }
  return (0, codegen_1$v._)`${topSchemaRef}${schemaPath}${(0, codegen_1$v.getProperty)(keyword2)}`;
}
util.schemaRefOrVal = schemaRefOrVal;
function unescapeFragment(str) {
  return unescapeJsonPointer(decodeURIComponent(str));
}
util.unescapeFragment = unescapeFragment;
function escapeFragment(str) {
  return encodeURIComponent(escapeJsonPointer(str));
}
util.escapeFragment = escapeFragment;
function escapeJsonPointer(str) {
  if (typeof str == "number")
    return `${str}`;
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
util.escapeJsonPointer = escapeJsonPointer;
function unescapeJsonPointer(str) {
  return str.replace(/~1/g, "/").replace(/~0/g, "~");
}
util.unescapeJsonPointer = unescapeJsonPointer;
function eachItem(xs, f) {
  if (Array.isArray(xs)) {
    for (const x of xs)
      f(x);
  } else {
    f(xs);
  }
}
util.eachItem = eachItem;
function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName }) {
  return (gen, from, to, toName) => {
    const res = to === void 0 ? from : to instanceof codegen_1$v.Name ? (from instanceof codegen_1$v.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to) : from instanceof codegen_1$v.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
    return toName === codegen_1$v.Name && !(res instanceof codegen_1$v.Name) ? resultToName(gen, res) : res;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  };
}
util.mergeEvaluated = {
  props: makeMergeEvaluated({
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$v._)`${to} !== true && ${from} !== undefined`, () => {
      gen.if((0, codegen_1$v._)`${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1$v._)`${to} || {}`).code((0, codegen_1$v._)`Object.assign(${to}, ${from})`));
    }),
<<<<<<< HEAD
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$v._)`${to} !== true`, () => {
      if (from === true) {
        gen.assign(to, true);
      } else {
        gen.assign(to, (0, codegen_1$v._)`${to} || {}`);
        setEvaluated(gen, to, from);
      }
    }),
    mergeValues: (from, to) => from === true ? true : { ...from, ...to },
    resultToName: evaluatedPropsToName
=======
    mergeToName: (e, t, r) => e.if((0, fe._)`${r} !== true`, () => {
      t === !0 ? e.assign(r, !0) : (e.assign(r, (0, fe._)`${r} || {}`), lo(e, r, t));
    }),
    mergeValues: (e, t) => e === !0 ? !0 : { ...e, ...t },
    resultToName: Jl
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }),
  items: makeMergeEvaluated({
    mergeNames: (gen, from, to) => gen.if((0, codegen_1$v._)`${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1$v._)`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
    mergeToName: (gen, from, to) => gen.if((0, codegen_1$v._)`${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1$v._)`${to} > ${from} ? ${to} : ${from}`)),
    mergeValues: (from, to) => from === true ? true : Math.max(from, to),
    resultToName: (gen, items2) => gen.var("items", items2)
  })
};
<<<<<<< HEAD
function evaluatedPropsToName(gen, ps) {
  if (ps === true)
    return gen.var("props", true);
  const props = gen.var("props", (0, codegen_1$v._)`{}`);
  if (ps !== void 0)
    setEvaluated(gen, props, ps);
  return props;
}
util.evaluatedPropsToName = evaluatedPropsToName;
function setEvaluated(gen, props, ps) {
  Object.keys(ps).forEach((p) => gen.assign((0, codegen_1$v._)`${props}${(0, codegen_1$v.getProperty)(p)}`, true));
}
util.setEvaluated = setEvaluated;
const snippets = {};
function useFunc(gen, f) {
  return gen.scopeValue("func", {
    ref: f,
    code: snippets[f.code] || (snippets[f.code] = new code_1$a._Code(f.code))
  });
}
util.useFunc = useFunc;
var Type;
(function(Type2) {
  Type2[Type2["Num"] = 0] = "Num";
  Type2[Type2["Str"] = 1] = "Str";
})(Type || (util.Type = Type = {}));
function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
  if (dataProp instanceof codegen_1$v.Name) {
    const isNumber = dataPropType === Type.Num;
    return jsPropertySyntax ? isNumber ? (0, codegen_1$v._)`"[" + ${dataProp} + "]"` : (0, codegen_1$v._)`"['" + ${dataProp} + "']"` : isNumber ? (0, codegen_1$v._)`"/" + ${dataProp}` : (0, codegen_1$v._)`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
  }
  return jsPropertySyntax ? (0, codegen_1$v.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
}
util.getErrorPath = getErrorPath;
function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
  if (!mode)
    return;
  msg = `strict mode: ${msg}`;
  if (mode === true)
    throw new Error(msg);
  it.self.logger.warn(msg);
}
util.checkStrictMode = checkStrictMode;
var names$1 = {};
Object.defineProperty(names$1, "__esModule", { value: true });
const codegen_1$u = codegen;
const names = {
  // validation function arguments
  data: new codegen_1$u.Name("data"),
  // data passed to validation function
  // args passed from referencing schema
  valCxt: new codegen_1$u.Name("valCxt"),
  // validation/data context - should not be used directly, it is destructured to the names below
  instancePath: new codegen_1$u.Name("instancePath"),
  parentData: new codegen_1$u.Name("parentData"),
  parentDataProperty: new codegen_1$u.Name("parentDataProperty"),
  rootData: new codegen_1$u.Name("rootData"),
  // root data - same as the data passed to the first/top validation function
  dynamicAnchors: new codegen_1$u.Name("dynamicAnchors"),
  // used to support recursiveRef and dynamicRef
  // function scoped variables
  vErrors: new codegen_1$u.Name("vErrors"),
  // null or array of validation errors
  errors: new codegen_1$u.Name("errors"),
  // counter of validation errors
  this: new codegen_1$u.Name("this"),
  // "globals"
  self: new codegen_1$u.Name("self"),
  scope: new codegen_1$u.Name("scope"),
  // JTD serialize/parse name for JSON string and position
  json: new codegen_1$u.Name("json"),
  jsonPos: new codegen_1$u.Name("jsonPos"),
  jsonLen: new codegen_1$u.Name("jsonLen"),
  jsonPart: new codegen_1$u.Name("jsonPart")
};
names$1.default = names;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
  const codegen_12 = codegen;
  const util_12 = util;
  const names_12 = names$1;
  exports.keywordError = {
    message: ({ keyword: keyword2 }) => (0, codegen_12.str)`must pass "${keyword2}" keyword validation`
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  };
  exports.keyword$DataError = {
    message: ({ keyword: keyword2, schemaType }) => schemaType ? (0, codegen_12.str)`"${keyword2}" keyword must be ${schemaType} ($data)` : (0, codegen_12.str)`"${keyword2}" keyword is invalid ($data)`
  };
  function reportError(cxt, error2 = exports.keywordError, errorPaths, overrideAllErrors) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error2, errorPaths);
    if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : compositeRule || allErrors) {
      addError(gen, errObj);
    } else {
      returnErrors(it, (0, codegen_12._)`[${errObj}]`);
    }
  }
  exports.reportError = reportError;
  function reportExtraError(cxt, error2 = exports.keywordError, errorPaths) {
    const { it } = cxt;
    const { gen, compositeRule, allErrors } = it;
    const errObj = errorObjectCode(cxt, error2, errorPaths);
    addError(gen, errObj);
    if (!(compositeRule || allErrors)) {
      returnErrors(it, names_12.default.vErrors);
    }
  }
  exports.reportExtraError = reportExtraError;
  function resetErrorsCount(gen, errsCount) {
    gen.assign(names_12.default.errors, errsCount);
    gen.if((0, codegen_12._)`${names_12.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_12._)`${names_12.default.vErrors}.length`, errsCount), () => gen.assign(names_12.default.vErrors, null)));
  }
  exports.resetErrorsCount = resetErrorsCount;
  function extendErrors({ gen, keyword: keyword2, schemaValue, data, errsCount, it }) {
    if (errsCount === void 0)
      throw new Error("ajv implementation error");
    const err = gen.name("err");
    gen.forRange("i", errsCount, names_12.default.errors, (i) => {
      gen.const(err, (0, codegen_12._)`${names_12.default.vErrors}[${i}]`);
      gen.if((0, codegen_12._)`${err}.instancePath === undefined`, () => gen.assign((0, codegen_12._)`${err}.instancePath`, (0, codegen_12.strConcat)(names_12.default.instancePath, it.errorPath)));
      gen.assign((0, codegen_12._)`${err}.schemaPath`, (0, codegen_12.str)`${it.errSchemaPath}/${keyword2}`);
      if (it.opts.verbose) {
        gen.assign((0, codegen_12._)`${err}.schema`, schemaValue);
        gen.assign((0, codegen_12._)`${err}.data`, data);
      }
    });
  }
  exports.extendErrors = extendErrors;
  function addError(gen, errObj) {
    const err = gen.const("err", errObj);
    gen.if((0, codegen_12._)`${names_12.default.vErrors} === null`, () => gen.assign(names_12.default.vErrors, (0, codegen_12._)`[${err}]`), (0, codegen_12._)`${names_12.default.vErrors}.push(${err})`);
    gen.code((0, codegen_12._)`${names_12.default.errors}++`);
  }
  function returnErrors(it, errs) {
    const { gen, validateName, schemaEnv } = it;
    if (schemaEnv.$async) {
      gen.throw((0, codegen_12._)`new ${it.ValidationError}(${errs})`);
    } else {
      gen.assign((0, codegen_12._)`${validateName}.errors`, errs);
      gen.return(false);
    }
  }
  const E = {
    keyword: new codegen_12.Name("keyword"),
    schemaPath: new codegen_12.Name("schemaPath"),
    // also used in JTD errors
    params: new codegen_12.Name("params"),
    propertyName: new codegen_12.Name("propertyName"),
    message: new codegen_12.Name("message"),
    schema: new codegen_12.Name("schema"),
    parentSchema: new codegen_12.Name("parentSchema")
  };
  function errorObjectCode(cxt, error2, errorPaths) {
    const { createErrors } = cxt.it;
    if (createErrors === false)
      return (0, codegen_12._)`{}`;
    return errorObject(cxt, error2, errorPaths);
  }
  function errorObject(cxt, error2, errorPaths = {}) {
    const { gen, it } = cxt;
    const keyValues = [
      errorInstancePath(it, errorPaths),
      errorSchemaPath(cxt, errorPaths)
    ];
    extraErrorProps(cxt, error2, keyValues);
    return gen.object(...keyValues);
  }
  function errorInstancePath({ errorPath }, { instancePath }) {
    const instPath = instancePath ? (0, codegen_12.str)`${errorPath}${(0, util_12.getErrorPath)(instancePath, util_12.Type.Str)}` : errorPath;
    return [names_12.default.instancePath, (0, codegen_12.strConcat)(names_12.default.instancePath, instPath)];
  }
  function errorSchemaPath({ keyword: keyword2, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
    let schPath = parentSchema ? errSchemaPath : (0, codegen_12.str)`${errSchemaPath}/${keyword2}`;
    if (schemaPath) {
      schPath = (0, codegen_12.str)`${schPath}${(0, util_12.getErrorPath)(schemaPath, util_12.Type.Str)}`;
    }
    return [E.schemaPath, schPath];
  }
  function extraErrorProps(cxt, { params, message }, keyValues) {
    const { keyword: keyword2, data, schemaValue, it } = cxt;
    const { opts, propertyName, topSchemaRef, schemaPath } = it;
    keyValues.push([E.keyword, keyword2], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_12._)`{}`]);
    if (opts.messages) {
      keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
    }
    if (opts.verbose) {
      keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_12._)`${topSchemaRef}${schemaPath}`], [names_12.default.data, data]);
    }
    if (propertyName)
      keyValues.push([E.propertyName, propertyName]);
  }
<<<<<<< HEAD
})(errors);
Object.defineProperty(boolSchema, "__esModule", { value: true });
boolSchema.boolOrEmptySchema = boolSchema.topBoolOrEmptySchema = void 0;
const errors_1$3 = errors;
const codegen_1$t = codegen;
const names_1$6 = names$1;
const boolError = {
  message: "boolean schema is false"
};
function topBoolOrEmptySchema(it) {
  const { gen, schema, validateName } = it;
  if (schema === false) {
    falseSchemaError(it, false);
  } else if (typeof schema == "object" && schema.$async === true) {
    gen.return(names_1$6.default.data);
  } else {
    gen.assign((0, codegen_1$t._)`${validateName}.errors`, null);
    gen.return(true);
  }
}
boolSchema.topBoolOrEmptySchema = topBoolOrEmptySchema;
function boolOrEmptySchema(it, valid2) {
  const { gen, schema } = it;
  if (schema === false) {
    gen.var(valid2, false);
    falseSchemaError(it);
  } else {
    gen.var(valid2, true);
  }
}
boolSchema.boolOrEmptySchema = boolOrEmptySchema;
function falseSchemaError(it, overrideAllErrors) {
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
  (0, errors_1$3.reportError)(cxt, boolError, void 0, overrideAllErrors);
}
var dataType = {};
var rules = {};
Object.defineProperty(rules, "__esModule", { value: true });
rules.getRules = rules.isJSONType = void 0;
const _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
const jsonTypes = new Set(_jsonTypes);
function isJSONType(x) {
  return typeof x == "string" && jsonTypes.has(x);
}
rules.isJSONType = isJSONType;
function getRules() {
  const groups = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    number: { type: "number", rules: [] },
    string: { type: "string", rules: [] },
    array: { type: "array", rules: [] },
    object: { type: "object", rules: [] }
  };
  return {
    types: { ...groups, integer: true, boolean: true, null: true },
    rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
    post: { rules: [] },
    all: {},
    keywords: {}
  };
}
<<<<<<< HEAD
rules.getRules = getRules;
var applicability = {};
Object.defineProperty(applicability, "__esModule", { value: true });
applicability.shouldUseRule = applicability.shouldUseGroup = applicability.schemaHasRulesForType = void 0;
function schemaHasRulesForType({ schema, self }, type2) {
  const group = self.RULES.types[type2];
  return group && group !== true && shouldUseGroup(schema, group);
}
applicability.schemaHasRulesForType = schemaHasRulesForType;
function shouldUseGroup(schema, group) {
  return group.rules.some((rule) => shouldUseRule(schema, rule));
}
applicability.shouldUseGroup = shouldUseGroup;
function shouldUseRule(schema, rule) {
  var _a;
  return schema[rule.keyword] !== void 0 || ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== void 0));
}
applicability.shouldUseRule = shouldUseRule;
Object.defineProperty(dataType, "__esModule", { value: true });
dataType.reportTypeError = dataType.checkDataTypes = dataType.checkDataType = dataType.coerceAndCheckDataType = dataType.getJSONTypes = dataType.getSchemaTypes = dataType.DataType = void 0;
const rules_1 = rules;
const applicability_1$1 = applicability;
const errors_1$2 = errors;
const codegen_1$s = codegen;
const util_1$q = util;
var DataType;
(function(DataType2) {
  DataType2[DataType2["Correct"] = 0] = "Correct";
  DataType2[DataType2["Wrong"] = 1] = "Wrong";
})(DataType || (dataType.DataType = DataType = {}));
function getSchemaTypes(schema) {
  const types2 = getJSONTypes(schema.type);
  const hasNull = types2.includes("null");
  if (hasNull) {
    if (schema.nullable === false)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("type: null contradicts nullable: false");
  } else {
    if (!types2.length && schema.nullable !== void 0) {
      throw new Error('"nullable" cannot be used without "type"');
    }
    if (schema.nullable === true)
      types2.push("null");
  }
  return types2;
}
<<<<<<< HEAD
dataType.getSchemaTypes = getSchemaTypes;
function getJSONTypes(ts) {
  const types2 = Array.isArray(ts) ? ts : ts ? [ts] : [];
  if (types2.every(rules_1.isJSONType))
    return types2;
  throw new Error("type must be JSONType or JSONType[]: " + types2.join(","));
}
dataType.getJSONTypes = getJSONTypes;
function coerceAndCheckDataType(it, types2) {
  const { gen, data, opts } = it;
  const coerceTo = coerceToTypes(types2, opts.coerceTypes);
  const checkTypes = types2.length > 0 && !(coerceTo.length === 0 && types2.length === 1 && (0, applicability_1$1.schemaHasRulesForType)(it, types2[0]));
  if (checkTypes) {
    const wrongType = checkDataTypes(types2, data, opts.strictNumbers, DataType.Wrong);
    gen.if(wrongType, () => {
      if (coerceTo.length)
        coerceData(it, types2, coerceTo);
      else
        reportTypeError(it);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    });
  }
  return checkTypes;
}
<<<<<<< HEAD
dataType.coerceAndCheckDataType = coerceAndCheckDataType;
const COERCIBLE = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
function coerceToTypes(types2, coerceTypes) {
  return coerceTypes ? types2.filter((t2) => COERCIBLE.has(t2) || coerceTypes === "array" && t2 === "array") : [];
}
function coerceData(it, types2, coerceTo) {
  const { gen, data, opts } = it;
  const dataType2 = gen.let("dataType", (0, codegen_1$s._)`typeof ${data}`);
  const coerced = gen.let("coerced", (0, codegen_1$s._)`undefined`);
  if (opts.coerceTypes === "array") {
    gen.if((0, codegen_1$s._)`${dataType2} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen.assign(data, (0, codegen_1$s._)`${data}[0]`).assign(dataType2, (0, codegen_1$s._)`typeof ${data}`).if(checkDataTypes(types2, data, opts.strictNumbers), () => gen.assign(coerced, data)));
  }
  gen.if((0, codegen_1$s._)`${coerced} !== undefined`);
  for (const t2 of coerceTo) {
    if (COERCIBLE.has(t2) || t2 === "array" && opts.coerceTypes === "array") {
      coerceSpecificType(t2);
    }
  }
  gen.else();
  reportTypeError(it);
  gen.endIf();
  gen.if((0, codegen_1$s._)`${coerced} !== undefined`, () => {
    gen.assign(data, coerced);
    assignParentData(it, coerced);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  });
  function coerceSpecificType(t2) {
    switch (t2) {
      case "string":
        gen.elseIf((0, codegen_1$s._)`${dataType2} == "number" || ${dataType2} == "boolean"`).assign(coerced, (0, codegen_1$s._)`"" + ${data}`).elseIf((0, codegen_1$s._)`${data} === null`).assign(coerced, (0, codegen_1$s._)`""`);
        return;
      case "number":
        gen.elseIf((0, codegen_1$s._)`${dataType2} == "boolean" || ${data} === null
              || (${dataType2} == "string" && ${data} && ${data} == +${data})`).assign(coerced, (0, codegen_1$s._)`+${data}`);
        return;
      case "integer":
        gen.elseIf((0, codegen_1$s._)`${dataType2} === "boolean" || ${data} === null
              || (${dataType2} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, (0, codegen_1$s._)`+${data}`);
        return;
      case "boolean":
        gen.elseIf((0, codegen_1$s._)`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, false).elseIf((0, codegen_1$s._)`${data} === "true" || ${data} === 1`).assign(coerced, true);
        return;
      case "null":
        gen.elseIf((0, codegen_1$s._)`${data} === "" || ${data} === 0 || ${data} === false`);
        gen.assign(coerced, null);
        return;
      case "array":
        gen.elseIf((0, codegen_1$s._)`${dataType2} === "string" || ${dataType2} === "number"
              || ${dataType2} === "boolean" || ${data} === null`).assign(coerced, (0, codegen_1$s._)`[${data}]`);
    }
  }
}
<<<<<<< HEAD
function assignParentData({ gen, parentData, parentDataProperty }, expr) {
  gen.if((0, codegen_1$s._)`${parentData} !== undefined`, () => gen.assign((0, codegen_1$s._)`${parentData}[${parentDataProperty}]`, expr));
=======
function f0({ gen: e, parentData: t, parentDataProperty: r }, n) {
  e.if((0, re._)`${t} !== undefined`, () => e.assign((0, re._)`${t}[${r}]`, n));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
}
function checkDataType(dataType2, data, strictNums, correct = DataType.Correct) {
  const EQ = correct === DataType.Correct ? codegen_1$s.operators.EQ : codegen_1$s.operators.NEQ;
  let cond;
  switch (dataType2) {
    case "null":
      return (0, codegen_1$s._)`${data} ${EQ} null`;
    case "array":
      cond = (0, codegen_1$s._)`Array.isArray(${data})`;
      break;
    case "object":
      cond = (0, codegen_1$s._)`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
      break;
    case "integer":
      cond = numCond((0, codegen_1$s._)`!(${data} % 1) && !isNaN(${data})`);
      break;
    case "number":
      cond = numCond();
      break;
    default:
      return (0, codegen_1$s._)`typeof ${data} ${EQ} ${dataType2}`;
  }
  return correct === DataType.Correct ? cond : (0, codegen_1$s.not)(cond);
  function numCond(_cond = codegen_1$s.nil) {
    return (0, codegen_1$s.and)((0, codegen_1$s._)`typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1$s._)`isFinite(${data})` : codegen_1$s.nil);
  }
}
<<<<<<< HEAD
dataType.checkDataType = checkDataType;
function checkDataTypes(dataTypes, data, strictNums, correct) {
  if (dataTypes.length === 1) {
    return checkDataType(dataTypes[0], data, strictNums, correct);
  }
  let cond;
  const types2 = (0, util_1$q.toHash)(dataTypes);
  if (types2.array && types2.object) {
    const notObj = (0, codegen_1$s._)`typeof ${data} != "object"`;
    cond = types2.null ? notObj : (0, codegen_1$s._)`!${data} || ${notObj}`;
    delete types2.null;
    delete types2.array;
    delete types2.object;
  } else {
    cond = codegen_1$s.nil;
  }
  if (types2.number)
    delete types2.integer;
  for (const t2 in types2)
    cond = (0, codegen_1$s.and)(cond, checkDataType(t2, data, strictNums, correct));
  return cond;
}
dataType.checkDataTypes = checkDataTypes;
const typeError = {
  message: ({ schema }) => `must be ${schema}`,
  params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1$s._)`{type: ${schema}}` : (0, codegen_1$s._)`{type: ${schemaValue}}`
};
function reportTypeError(it) {
  const cxt = getTypeErrorContext(it);
  (0, errors_1$2.reportError)(cxt, typeError);
}
dataType.reportTypeError = reportTypeError;
function getTypeErrorContext(it) {
  const { gen, data, schema } = it;
  const schemaCode = (0, util_1$q.schemaRefOrVal)(it, schema, "type");
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  return {
    gen,
    keyword: "type",
    data,
    schema: schema.type,
    schemaCode,
    schemaValue: schemaCode,
    parentSchema: schema,
    params: {},
    it
  };
}
<<<<<<< HEAD
var defaults = {};
Object.defineProperty(defaults, "__esModule", { value: true });
defaults.assignDefaults = void 0;
const codegen_1$r = codegen;
const util_1$p = util;
function assignDefaults(it, ty) {
  const { properties: properties2, items: items2 } = it.schema;
  if (ty === "object" && properties2) {
    for (const key in properties2) {
      assignDefault(it, key, properties2[key].default);
    }
  } else if (ty === "array" && Array.isArray(items2)) {
    items2.forEach((sch, i) => assignDefault(it, i, sch.default));
  }
}
defaults.assignDefaults = assignDefaults;
function assignDefault(it, prop, defaultValue) {
  const { gen, compositeRule, data, opts } = it;
  if (defaultValue === void 0)
    return;
  const childData = (0, codegen_1$r._)`${data}${(0, codegen_1$r.getProperty)(prop)}`;
  if (compositeRule) {
    (0, util_1$p.checkStrictMode)(it, `default is ignored for: ${childData}`);
    return;
  }
  let condition = (0, codegen_1$r._)`${childData} === undefined`;
  if (opts.useDefaults === "empty") {
    condition = (0, codegen_1$r._)`${condition} || ${childData} === null || ${childData} === ""`;
  }
  gen.if(condition, (0, codegen_1$r._)`${childData} = ${(0, codegen_1$r.stringify)(defaultValue)}`);
}
var keyword = {};
var code = {};
Object.defineProperty(code, "__esModule", { value: true });
code.validateUnion = code.validateArray = code.usePattern = code.callValidateCode = code.schemaProperties = code.allSchemaProperties = code.noPropertyInData = code.propertyInData = code.isOwnProperty = code.hasPropFunc = code.reportMissingProp = code.checkMissingProp = code.checkReportMissingProp = void 0;
const codegen_1$q = codegen;
const util_1$o = util;
const names_1$5 = names$1;
const util_2$1 = util;
function checkReportMissingProp(cxt, prop) {
  const { gen, data, it } = cxt;
  gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
    cxt.setParams({ missingProperty: (0, codegen_1$q._)`${prop}` }, true);
    cxt.error();
  });
}
code.checkReportMissingProp = checkReportMissingProp;
function checkMissingProp({ gen, data, it: { opts } }, properties2, missing) {
  return (0, codegen_1$q.or)(...properties2.map((prop) => (0, codegen_1$q.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1$q._)`${missing} = ${prop}`)));
}
code.checkMissingProp = checkMissingProp;
function reportMissingProp(cxt, missing) {
  cxt.setParams({ missingProperty: missing }, true);
  cxt.error();
}
code.reportMissingProp = reportMissingProp;
function hasPropFunc(gen) {
  return gen.scopeValue("func", {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ref: Object.prototype.hasOwnProperty,
    code: (0, codegen_1$q._)`Object.prototype.hasOwnProperty`
  });
}
<<<<<<< HEAD
code.hasPropFunc = hasPropFunc;
function isOwnProperty(gen, data, property) {
  return (0, codegen_1$q._)`${hasPropFunc(gen)}.call(${data}, ${property})`;
}
code.isOwnProperty = isOwnProperty;
function propertyInData(gen, data, property, ownProperties) {
  const cond = (0, codegen_1$q._)`${data}${(0, codegen_1$q.getProperty)(property)} !== undefined`;
  return ownProperties ? (0, codegen_1$q._)`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
}
code.propertyInData = propertyInData;
function noPropertyInData(gen, data, property, ownProperties) {
  const cond = (0, codegen_1$q._)`${data}${(0, codegen_1$q.getProperty)(property)} === undefined`;
  return ownProperties ? (0, codegen_1$q.or)(cond, (0, codegen_1$q.not)(isOwnProperty(gen, data, property))) : cond;
}
code.noPropertyInData = noPropertyInData;
function allSchemaProperties(schemaMap) {
  return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
}
code.allSchemaProperties = allSchemaProperties;
function schemaProperties(it, schemaMap) {
  return allSchemaProperties(schemaMap).filter((p) => !(0, util_1$o.alwaysValidSchema)(it, schemaMap[p]));
}
code.schemaProperties = schemaProperties;
function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
  const dataAndSchema = passSchema ? (0, codegen_1$q._)`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
  const valCxt = [
    [names_1$5.default.instancePath, (0, codegen_1$q.strConcat)(names_1$5.default.instancePath, errorPath)],
    [names_1$5.default.parentData, it.parentData],
    [names_1$5.default.parentDataProperty, it.parentDataProperty],
    [names_1$5.default.rootData, names_1$5.default.rootData]
  ];
  if (it.opts.dynamicRef)
    valCxt.push([names_1$5.default.dynamicAnchors, names_1$5.default.dynamicAnchors]);
  const args = (0, codegen_1$q._)`${dataAndSchema}, ${gen.object(...valCxt)}`;
  return context !== codegen_1$q.nil ? (0, codegen_1$q._)`${func}.call(${context}, ${args})` : (0, codegen_1$q._)`${func}(${args})`;
}
code.callValidateCode = callValidateCode;
const newRegExp = (0, codegen_1$q._)`new RegExp`;
function usePattern({ gen, it: { opts } }, pattern2) {
  const u = opts.unicodeRegExp ? "u" : "";
  const { regExp } = opts.code;
  const rx = regExp(pattern2, u);
  return gen.scopeValue("pattern", {
    key: rx.toString(),
    ref: rx,
    code: (0, codegen_1$q._)`${regExp.code === "new RegExp" ? newRegExp : (0, util_2$1.useFunc)(gen, regExp)}(${pattern2}, ${u})`
  });
}
code.usePattern = usePattern;
function validateArray(cxt) {
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
    const len = gen.const("len", (0, codegen_1$q._)`${data}.length`);
    gen.forRange("i", 0, len, (i) => {
      cxt.subschema({
        keyword: keyword2,
        dataProp: i,
        dataPropType: util_1$o.Type.Num
      }, valid2);
      gen.if((0, codegen_1$q.not)(valid2), notValid);
    });
  }
}
code.validateArray = validateArray;
function validateUnion(cxt) {
  const { gen, schema, keyword: keyword2, it } = cxt;
  if (!Array.isArray(schema))
    throw new Error("ajv implementation error");
  const alwaysValid = schema.some((sch) => (0, util_1$o.alwaysValidSchema)(it, sch));
  if (alwaysValid && !it.opts.unevaluated)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    return;
  const valid2 = gen.let("valid", false);
  const schValid = gen.name("_valid");
  gen.block(() => schema.forEach((_sch, i) => {
    const schCxt = cxt.subschema({
      keyword: keyword2,
      schemaProp: i,
      compositeRule: true
    }, schValid);
    gen.assign(valid2, (0, codegen_1$q._)`${valid2} || ${schValid}`);
    const merged = cxt.mergeValidEvaluated(schCxt, schValid);
    if (!merged)
      gen.if((0, codegen_1$q.not)(valid2));
  }));
  cxt.result(valid2, () => cxt.reset(), () => cxt.error(true));
}
<<<<<<< HEAD
code.validateUnion = validateUnion;
Object.defineProperty(keyword, "__esModule", { value: true });
keyword.validateKeywordUsage = keyword.validSchemaType = keyword.funcKeywordCode = keyword.macroKeywordCode = void 0;
const codegen_1$p = codegen;
const names_1$4 = names$1;
const code_1$9 = code;
const errors_1$1 = errors;
function macroKeywordCode(cxt, def2) {
  const { gen, keyword: keyword2, schema, parentSchema, it } = cxt;
  const macroSchema = def2.macro.call(it.self, schema, parentSchema, it);
  const schemaRef = useKeyword(gen, keyword2, macroSchema);
  if (it.opts.validateSchema !== false)
    it.self.validateSchema(macroSchema, true);
  const valid2 = gen.name("valid");
  cxt.subschema({
    schema: macroSchema,
    schemaPath: codegen_1$p.nil,
    errSchemaPath: `${it.errSchemaPath}/${keyword2}`,
    topSchemaRef: schemaRef,
    compositeRule: true
  }, valid2);
  cxt.pass(valid2, () => cxt.error(true));
}
keyword.macroKeywordCode = macroKeywordCode;
function funcKeywordCode(cxt, def2) {
  var _a;
  const { gen, keyword: keyword2, schema, parentSchema, $data, it } = cxt;
  checkAsyncKeyword(it, def2);
  const validate2 = !$data && def2.compile ? def2.compile.call(it.self, schema, parentSchema, it) : def2.validate;
  const validateRef = useKeyword(gen, keyword2, validate2);
  const valid2 = gen.let("valid");
  cxt.block$data(valid2, validateKeyword);
  cxt.ok((_a = def2.valid) !== null && _a !== void 0 ? _a : valid2);
  function validateKeyword() {
    if (def2.errors === false) {
      assignValid();
      if (def2.modifying)
        modifyData(cxt);
      reportErrs(() => cxt.error());
    } else {
      const ruleErrs = def2.async ? validateAsync() : validateSync();
      if (def2.modifying)
        modifyData(cxt);
      reportErrs(() => addErrs(cxt, ruleErrs));
    }
  }
  function validateAsync() {
    const ruleErrs = gen.let("ruleErrs", null);
    gen.try(() => assignValid((0, codegen_1$p._)`await `), (e) => gen.assign(valid2, false).if((0, codegen_1$p._)`${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1$p._)`${e}.errors`), () => gen.throw(e)));
    return ruleErrs;
  }
  function validateSync() {
    const validateErrs = (0, codegen_1$p._)`${validateRef}.errors`;
    gen.assign(validateErrs, null);
    assignValid(codegen_1$p.nil);
    return validateErrs;
  }
  function assignValid(_await = def2.async ? (0, codegen_1$p._)`await ` : codegen_1$p.nil) {
    const passCxt = it.opts.passContext ? names_1$4.default.this : names_1$4.default.self;
    const passSchema = !("compile" in def2 && !$data || def2.schema === false);
    gen.assign(valid2, (0, codegen_1$p._)`${_await}${(0, code_1$9.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def2.modifying);
  }
  function reportErrs(errors2) {
    var _a2;
    gen.if((0, codegen_1$p.not)((_a2 = def2.valid) !== null && _a2 !== void 0 ? _a2 : valid2), errors2);
  }
}
keyword.funcKeywordCode = funcKeywordCode;
function modifyData(cxt) {
  const { gen, data, it } = cxt;
  gen.if(it.parentData, () => gen.assign(data, (0, codegen_1$p._)`${it.parentData}[${it.parentDataProperty}]`));
}
function addErrs(cxt, errs) {
  const { gen } = cxt;
  gen.if((0, codegen_1$p._)`Array.isArray(${errs})`, () => {
    gen.assign(names_1$4.default.vErrors, (0, codegen_1$p._)`${names_1$4.default.vErrors} === null ? ${errs} : ${names_1$4.default.vErrors}.concat(${errs})`).assign(names_1$4.default.errors, (0, codegen_1$p._)`${names_1$4.default.vErrors}.length`);
    (0, errors_1$1.extendErrors)(cxt);
  }, () => cxt.error());
}
function checkAsyncKeyword({ schemaEnv }, def2) {
  if (def2.async && !schemaEnv.$async)
    throw new Error("async keyword in sync schema");
}
function useKeyword(gen, keyword2, result) {
  if (result === void 0)
    throw new Error(`keyword "${keyword2}" failed to compile`);
  return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1$p.stringify)(result) });
}
function validSchemaType(schema, schemaType, allowUndefined = false) {
  return !schemaType.length || schemaType.some((st) => st === "array" ? Array.isArray(schema) : st === "object" ? schema && typeof schema == "object" && !Array.isArray(schema) : typeof schema == st || allowUndefined && typeof schema == "undefined");
}
keyword.validSchemaType = validSchemaType;
function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def2, keyword2) {
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
keyword.validateKeywordUsage = validateKeywordUsage;
var subschema = {};
Object.defineProperty(subschema, "__esModule", { value: true });
subschema.extendSubschemaMode = subschema.extendSubschemaData = subschema.getSubschema = void 0;
const codegen_1$o = codegen;
const util_1$n = util;
function getSubschema(it, { keyword: keyword2, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
  if (keyword2 !== void 0 && schema !== void 0) {
    throw new Error('both "keyword" and "schema" passed, only one allowed');
  }
  if (keyword2 !== void 0) {
    const sch = it.schema[keyword2];
    return schemaProp === void 0 ? {
      schema: sch,
      schemaPath: (0, codegen_1$o._)`${it.schemaPath}${(0, codegen_1$o.getProperty)(keyword2)}`,
      errSchemaPath: `${it.errSchemaPath}/${keyword2}`
    } : {
      schema: sch[schemaProp],
      schemaPath: (0, codegen_1$o._)`${it.schemaPath}${(0, codegen_1$o.getProperty)(keyword2)}${(0, codegen_1$o.getProperty)(schemaProp)}`,
      errSchemaPath: `${it.errSchemaPath}/${keyword2}/${(0, util_1$n.escapeFragment)(schemaProp)}`
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
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  $t.extendSubschemaData = n;
  function s(a, { jtdDiscriminator: o, jtdMetadata: c, compositeRule: l, createErrors: d, allErrors: u }) {
    l !== void 0 && (a.compositeRule = l), d !== void 0 && (a.createErrors = d), u !== void 0 && (a.allErrors = u), a.jtdDiscriminator = o, a.jtdMetadata = c;
  }
  return $t.extendSubschemaMode = s, $t;
}
<<<<<<< HEAD
subschema.getSubschema = getSubschema;
function extendSubschemaData(subschema2, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
  if (data !== void 0 && dataProp !== void 0) {
    throw new Error('both "data" and "dataProp" passed, only one allowed');
  }
  const { gen } = it;
  if (dataProp !== void 0) {
    const { errorPath, dataPathArr, opts } = it;
    const nextData = gen.let("data", (0, codegen_1$o._)`${it.data}${(0, codegen_1$o.getProperty)(dataProp)}`, true);
    dataContextProps(nextData);
    subschema2.errorPath = (0, codegen_1$o.str)`${errorPath}${(0, util_1$n.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
    subschema2.parentDataProperty = (0, codegen_1$o._)`${dataProp}`;
    subschema2.dataPathArr = [...dataPathArr, subschema2.parentDataProperty];
  }
  if (data !== void 0) {
    const nextData = data instanceof codegen_1$o.Name ? data : gen.let("data", data, true);
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
subschema.extendSubschemaData = extendSubschemaData;
function extendSubschemaMode(subschema2, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
  if (compositeRule !== void 0)
    subschema2.compositeRule = compositeRule;
  if (createErrors !== void 0)
    subschema2.createErrors = createErrors;
  if (allErrors !== void 0)
    subschema2.allErrors = allErrors;
  subschema2.jtdDiscriminator = jtdDiscriminator;
  subschema2.jtdMetadata = jtdMetadata;
}
subschema.extendSubschemaMode = extendSubschemaMode;
var resolve$1 = {};
var jsonSchemaTraverse = { exports: {} };
var traverse$1 = jsonSchemaTraverse.exports = function(schema, opts, cb) {
  if (typeof opts == "function") {
    cb = opts;
    opts = {};
  }
  cb = opts.cb || cb;
  var pre = typeof cb == "function" ? cb : cb.pre || function() {
=======
var je = {}, tu = { exports: {} }, Dt = tu.exports = function(e, t, r) {
  typeof t == "function" && (r = t, t = {}), r = t.cb || r;
  var n = typeof r == "function" ? r : r.pre || function() {
  }, s = r.post || function() {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  };
  var post = cb.post || function() {
  };
  _traverse(opts, pre, post, schema, "", schema);
};
<<<<<<< HEAD
traverse$1.keywords = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true,
  if: true,
  then: true,
  else: true
};
traverse$1.arrayKeywords = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true
};
traverse$1.propsKeywords = {
  $defs: true,
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true
};
traverse$1.skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true
};
function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
  if (schema && typeof schema == "object" && !Array.isArray(schema)) {
    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    for (var key in schema) {
      var sch = schema[key];
      if (Array.isArray(sch)) {
        if (key in traverse$1.arrayKeywords) {
          for (var i = 0; i < sch.length; i++)
            _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
        }
      } else if (key in traverse$1.propsKeywords) {
        if (sch && typeof sch == "object") {
          for (var prop in sch)
            _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
        }
      } else if (key in traverse$1.keywords || opts.allKeys && !(key in traverse$1.skipKeywords)) {
        _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
      }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
  }
}
<<<<<<< HEAD
function escapeJsonPtr(str) {
  return str.replace(/~/g, "~0").replace(/\//g, "~1");
}
var jsonSchemaTraverseExports = jsonSchemaTraverse.exports;
Object.defineProperty(resolve$1, "__esModule", { value: true });
resolve$1.getSchemaRefs = resolve$1.resolveUrl = resolve$1.normalizeId = resolve$1._getFullPath = resolve$1.getFullPath = resolve$1.inlineRef = void 0;
const util_1$m = util;
const equal$2 = fastDeepEqual;
const traverse = jsonSchemaTraverseExports;
const SIMPLE_INLINED = /* @__PURE__ */ new Set([
=======
function I0(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
var T0 = tu.exports;
Object.defineProperty(je, "__esModule", { value: !0 });
je.getSchemaRefs = je.resolveUrl = je.normalizeId = je._getFullPath = je.getFullPath = je.inlineRef = void 0;
const j0 = F, k0 = xn, A0 = T0, C0 = /* @__PURE__ */ new Set([
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
function inlineRef(schema, limit2 = true) {
  if (typeof schema == "boolean")
    return true;
  if (limit2 === true)
    return !hasRef(schema);
  if (!limit2)
    return false;
  return countKeys(schema) <= limit2;
}
resolve$1.inlineRef = inlineRef;
const REF_KEYWORDS = /* @__PURE__ */ new Set([
=======
function D0(e, t = !0) {
  return typeof e == "boolean" ? !0 : t === !0 ? !Xs(e) : t ? ru(e) <= t : !1;
}
je.inlineRef = D0;
const M0 = /* @__PURE__ */ new Set([
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "$ref",
  "$recursiveRef",
  "$recursiveAnchor",
  "$dynamicRef",
  "$dynamicAnchor"
]);
<<<<<<< HEAD
function hasRef(schema) {
  for (const key in schema) {
    if (REF_KEYWORDS.has(key))
      return true;
    const sch = schema[key];
    if (Array.isArray(sch) && sch.some(hasRef))
      return true;
    if (typeof sch == "object" && hasRef(sch))
      return true;
=======
function Xs(e) {
  for (const t in e) {
    if (M0.has(t))
      return !0;
    const r = e[t];
    if (Array.isArray(r) && r.some(Xs) || typeof r == "object" && Xs(r))
      return !0;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return false;
}
<<<<<<< HEAD
function countKeys(schema) {
  let count = 0;
  for (const key in schema) {
    if (key === "$ref")
      return Infinity;
    count++;
    if (SIMPLE_INLINED.has(key))
      continue;
    if (typeof schema[key] == "object") {
      (0, util_1$m.eachItem)(schema[key], (sch) => count += countKeys(sch));
    }
    if (count === Infinity)
      return Infinity;
  }
  return count;
}
function getFullPath(resolver, id2 = "", normalize2) {
  if (normalize2 !== false)
    id2 = normalizeId(id2);
  const p = resolver.parse(id2);
  return _getFullPath(resolver, p);
}
resolve$1.getFullPath = getFullPath;
function _getFullPath(resolver, p) {
  const serialized = resolver.serialize(p);
  return serialized.split("#")[0] + "#";
}
resolve$1._getFullPath = _getFullPath;
const TRAILING_SLASH_HASH = /#\/?$/;
function normalizeId(id2) {
  return id2 ? id2.replace(TRAILING_SLASH_HASH, "") : "";
}
resolve$1.normalizeId = normalizeId;
function resolveUrl(resolver, baseId, id2) {
  id2 = normalizeId(id2);
  return resolver.resolve(baseId, id2);
}
resolve$1.resolveUrl = resolveUrl;
const ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
function getSchemaRefs(schema, baseId) {
  if (typeof schema == "boolean")
    return {};
  const { schemaId, uriResolver } = this.opts;
  const schId = normalizeId(schema[schemaId] || baseId);
  const baseIds = { "": schId };
  const pathPrefix = getFullPath(uriResolver, schId, false);
  const localRefs = {};
  const schemaRefs = /* @__PURE__ */ new Set();
  traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
    if (parentJsonPtr === void 0)
      return;
    const fullPath = pathPrefix + jsonPtr;
    let innerBaseId = baseIds[parentJsonPtr];
    if (typeof sch[schemaId] == "string")
      innerBaseId = addRef.call(this, sch[schemaId]);
    addAnchor.call(this, sch.$anchor);
    addAnchor.call(this, sch.$dynamicAnchor);
    baseIds[jsonPtr] = innerBaseId;
    function addRef(ref2) {
      const _resolve = this.opts.uriResolver.resolve;
      ref2 = normalizeId(innerBaseId ? _resolve(innerBaseId, ref2) : ref2);
      if (schemaRefs.has(ref2))
        throw ambiguos(ref2);
      schemaRefs.add(ref2);
      let schOrRef = this.refs[ref2];
      if (typeof schOrRef == "string")
        schOrRef = this.refs[schOrRef];
      if (typeof schOrRef == "object") {
        checkAmbiguosRef(sch, schOrRef.schema, ref2);
      } else if (ref2 !== normalizeId(fullPath)) {
        if (ref2[0] === "#") {
          checkAmbiguosRef(sch, localRefs[ref2], ref2);
          localRefs[ref2] = sch;
        } else {
          this.refs[ref2] = fullPath;
        }
      }
      return ref2;
    }
    function addAnchor(anchor) {
      if (typeof anchor == "string") {
        if (!ANCHOR.test(anchor))
          throw new Error(`invalid anchor "${anchor}"`);
        addRef.call(this, `#${anchor}`);
      }
    }
  });
  return localRefs;
  function checkAmbiguosRef(sch1, sch2, ref2) {
    if (sch2 !== void 0 && !equal$2(sch1, sch2))
      throw ambiguos(ref2);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  function ambiguos(ref2) {
    return new Error(`reference "${ref2}" resolves to more than one schema`);
  }
}
<<<<<<< HEAD
resolve$1.getSchemaRefs = getSchemaRefs;
Object.defineProperty(validate, "__esModule", { value: true });
validate.getData = validate.KeywordCxt = validate.validateFunctionCode = void 0;
const boolSchema_1 = boolSchema;
const dataType_1$1 = dataType;
const applicability_1 = applicability;
const dataType_2 = dataType;
const defaults_1 = defaults;
const keyword_1 = keyword;
const subschema_1 = subschema;
const codegen_1$n = codegen;
const names_1$3 = names$1;
const resolve_1$2 = resolve$1;
const util_1$l = util;
const errors_1 = errors;
function validateFunctionCode(it) {
  if (isSchemaObj(it)) {
    checkKeywords(it);
    if (schemaCxtHasRules(it)) {
      topSchemaObjCode(it);
      return;
    }
  }
  validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
}
validate.validateFunctionCode = validateFunctionCode;
function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
  if (opts.code.es5) {
    gen.func(validateName, (0, codegen_1$n._)`${names_1$3.default.data}, ${names_1$3.default.valCxt}`, schemaEnv.$async, () => {
      gen.code((0, codegen_1$n._)`"use strict"; ${funcSourceUrl(schema, opts)}`);
      destructureValCxtES5(gen, opts);
      gen.code(body);
    });
  } else {
    gen.func(validateName, (0, codegen_1$n._)`${names_1$3.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
  }
}
function destructureValCxt(opts) {
  return (0, codegen_1$n._)`{${names_1$3.default.instancePath}="", ${names_1$3.default.parentData}, ${names_1$3.default.parentDataProperty}, ${names_1$3.default.rootData}=${names_1$3.default.data}${opts.dynamicRef ? (0, codegen_1$n._)`, ${names_1$3.default.dynamicAnchors}={}` : codegen_1$n.nil}}={}`;
}
function destructureValCxtES5(gen, opts) {
  gen.if(names_1$3.default.valCxt, () => {
    gen.var(names_1$3.default.instancePath, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.instancePath}`);
    gen.var(names_1$3.default.parentData, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.parentData}`);
    gen.var(names_1$3.default.parentDataProperty, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.parentDataProperty}`);
    gen.var(names_1$3.default.rootData, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.rootData}`);
    if (opts.dynamicRef)
      gen.var(names_1$3.default.dynamicAnchors, (0, codegen_1$n._)`${names_1$3.default.valCxt}.${names_1$3.default.dynamicAnchors}`);
  }, () => {
    gen.var(names_1$3.default.instancePath, (0, codegen_1$n._)`""`);
    gen.var(names_1$3.default.parentData, (0, codegen_1$n._)`undefined`);
    gen.var(names_1$3.default.parentDataProperty, (0, codegen_1$n._)`undefined`);
    gen.var(names_1$3.default.rootData, names_1$3.default.data);
    if (opts.dynamicRef)
      gen.var(names_1$3.default.dynamicAnchors, (0, codegen_1$n._)`{}`);
  });
}
function topSchemaObjCode(it) {
  const { schema, opts, gen } = it;
  validateFunction(it, () => {
    if (opts.$comment && schema.$comment)
      commentKeyword(it);
    checkNoDefault(it);
    gen.let(names_1$3.default.vErrors, null);
    gen.let(names_1$3.default.errors, 0);
    if (opts.unevaluated)
      resetEvaluated(it);
    typeAndKeywords(it);
    returnResults(it);
  });
  return;
}
function resetEvaluated(it) {
  const { gen, validateName } = it;
  it.evaluated = gen.const("evaluated", (0, codegen_1$n._)`${validateName}.evaluated`);
  gen.if((0, codegen_1$n._)`${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1$n._)`${it.evaluated}.props`, (0, codegen_1$n._)`undefined`));
  gen.if((0, codegen_1$n._)`${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1$n._)`${it.evaluated}.items`, (0, codegen_1$n._)`undefined`));
}
function funcSourceUrl(schema, opts) {
  const schId = typeof schema == "object" && schema[opts.schemaId];
  return schId && (opts.code.source || opts.code.process) ? (0, codegen_1$n._)`/*# sourceURL=${schId} */` : codegen_1$n.nil;
}
function subschemaCode(it, valid2) {
  if (isSchemaObj(it)) {
    checkKeywords(it);
    if (schemaCxtHasRules(it)) {
      subSchemaObjCode(it, valid2);
      return;
    }
  }
  (0, boolSchema_1.boolOrEmptySchema)(it, valid2);
}
function schemaCxtHasRules({ schema, self }) {
  if (typeof schema == "boolean")
    return !schema;
  for (const key in schema)
    if (self.RULES.all[key])
      return true;
  return false;
}
function isSchemaObj(it) {
  return typeof it.schema != "boolean";
}
function subSchemaObjCode(it, valid2) {
  const { schema, gen, opts } = it;
  if (opts.$comment && schema.$comment)
    commentKeyword(it);
  updateContext(it);
  checkAsyncSchema(it);
  const errsCount = gen.const("_errs", names_1$3.default.errors);
  typeAndKeywords(it, errsCount);
  gen.var(valid2, (0, codegen_1$n._)`${errsCount} === ${names_1$3.default.errors}`);
}
function checkKeywords(it) {
  (0, util_1$l.checkUnknownRules)(it);
  checkRefsAndKeywords(it);
}
function typeAndKeywords(it, errsCount) {
  if (it.opts.jtd)
    return schemaKeywords(it, [], false, errsCount);
  const types2 = (0, dataType_1$1.getSchemaTypes)(it.schema);
  const checkedTypes = (0, dataType_1$1.coerceAndCheckDataType)(it, types2);
  schemaKeywords(it, types2, !checkedTypes, errsCount);
}
function checkRefsAndKeywords(it) {
  const { schema, errSchemaPath, opts, self } = it;
  if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1$l.schemaHasRulesButRef)(schema, self.RULES)) {
    self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
  }
}
function checkNoDefault(it) {
  const { schema, opts } = it;
  if (schema.default !== void 0 && opts.useDefaults && opts.strictSchema) {
    (0, util_1$l.checkStrictMode)(it, "default is ignored in the schema root");
  }
}
function updateContext(it) {
  const schId = it.schema[it.opts.schemaId];
  if (schId)
    it.baseId = (0, resolve_1$2.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
}
function checkAsyncSchema(it) {
  if (it.schema.$async && !it.schemaEnv.$async)
    throw new Error("async schema in sync schema");
}
function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
  const msg = schema.$comment;
  if (opts.$comment === true) {
    gen.code((0, codegen_1$n._)`${names_1$3.default.self}.logger.log(${msg})`);
  } else if (typeof opts.$comment == "function") {
    const schemaPath = (0, codegen_1$n.str)`${errSchemaPath}/$comment`;
    const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
    gen.code((0, codegen_1$n._)`${names_1$3.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
  }
}
function returnResults(it) {
  const { gen, schemaEnv, validateName, ValidationError: ValidationError3, opts } = it;
  if (schemaEnv.$async) {
    gen.if((0, codegen_1$n._)`${names_1$3.default.errors} === 0`, () => gen.return(names_1$3.default.data), () => gen.throw((0, codegen_1$n._)`new ${ValidationError3}(${names_1$3.default.vErrors})`));
  } else {
    gen.assign((0, codegen_1$n._)`${validateName}.errors`, names_1$3.default.vErrors);
    if (opts.unevaluated)
      assignEvaluated(it);
    gen.return((0, codegen_1$n._)`${names_1$3.default.errors} === 0`);
  }
}
function assignEvaluated({ gen, evaluated, props, items: items2 }) {
  if (props instanceof codegen_1$n.Name)
    gen.assign((0, codegen_1$n._)`${evaluated}.props`, props);
  if (items2 instanceof codegen_1$n.Name)
    gen.assign((0, codegen_1$n._)`${evaluated}.items`, items2);
}
function schemaKeywords(it, types2, typeErrors, errsCount) {
  const { gen, schema, data, allErrors, opts, self } = it;
  const { RULES } = self;
  if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1$l.schemaHasRulesButRef)(schema, RULES))) {
    gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition));
    return;
  }
  if (!opts.jtd)
    checkStrictTypes(it, types2);
  gen.block(() => {
    for (const group of RULES.rules)
      groupKeywords(group);
    groupKeywords(RULES.post);
  });
  function groupKeywords(group) {
    if (!(0, applicability_1.shouldUseGroup)(schema, group))
      return;
    if (group.type) {
      gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
      iterateKeywords(it, group);
      if (types2.length === 1 && types2[0] === group.type && typeErrors) {
        gen.else();
        (0, dataType_2.reportTypeError)(it);
      }
      gen.endIf();
    } else {
      iterateKeywords(it, group);
    }
    if (!allErrors)
      gen.if((0, codegen_1$n._)`${names_1$3.default.errors} === ${errsCount || 0}`);
  }
}
function iterateKeywords(it, group) {
  const { gen, schema, opts: { useDefaults } } = it;
  if (useDefaults)
    (0, defaults_1.assignDefaults)(it, group.type);
  gen.block(() => {
    for (const rule of group.rules) {
      if ((0, applicability_1.shouldUseRule)(schema, rule)) {
        keywordCode(it, rule.keyword, rule.definition, group.type);
      }
    }
  });
}
function checkStrictTypes(it, types2) {
  if (it.schemaEnv.meta || !it.opts.strictTypes)
    return;
  checkContextTypes(it, types2);
  if (!it.opts.allowUnionTypes)
    checkMultipleTypes(it, types2);
  checkKeywordTypes(it, it.dataTypes);
}
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
class KeywordCxt2 {
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
      return;
    }
    this.gen.if(condition);
    this.error();
    if (this.allErrors)
      this.gen.endIf();
    else
      this.gen.else();
  }
  fail$data(condition) {
    if (!this.$data)
      return this.fail(condition);
    const { schemaCode } = this;
    this.fail((0, codegen_1$n._)`${schemaCode} !== undefined && (${(0, codegen_1$n.or)(this.invalid$data(), condition)})`);
  }
  error(append, errorParams, errorPaths) {
    if (errorParams) {
      this.setParams(errorParams);
      this._error(append, errorPaths);
      this.setParams({});
      return;
    }
    this._error(append, errorPaths);
  }
  _error(append, errorPaths) {
    (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
  }
  $dataError() {
    (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
  }
  reset() {
    if (this.errsCount === void 0)
      throw new Error('add "trackErrors" to keyword definition');
    (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
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
  block$data(valid2, codeBlock, $dataValid = codegen_1$n.nil) {
    this.gen.block(() => {
      this.check$data(valid2, $dataValid);
      codeBlock();
    });
  }
  check$data(valid2 = codegen_1$n.nil, $dataValid = codegen_1$n.nil) {
    if (!this.$data)
      return;
    const { gen, schemaCode, schemaType, def: def2 } = this;
    gen.if((0, codegen_1$n.or)((0, codegen_1$n._)`${schemaCode} === undefined`, $dataValid));
    if (valid2 !== codegen_1$n.nil)
      gen.assign(valid2, true);
    if (schemaType.length || def2.validateSchema) {
      gen.elseIf(this.invalid$data());
      this.$dataError();
      if (valid2 !== codegen_1$n.nil)
        gen.assign(valid2, false);
    }
    gen.else();
  }
  invalid$data() {
    const { gen, schemaCode, schemaType, def: def2, it } = this;
    return (0, codegen_1$n.or)(wrong$DataType(), invalid$DataSchema());
    function wrong$DataType() {
      if (schemaType.length) {
        if (!(schemaCode instanceof codegen_1$n.Name))
          throw new Error("ajv implementation error");
        const st = Array.isArray(schemaType) ? schemaType : [schemaType];
        return (0, codegen_1$n._)`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
      }
      return codegen_1$n.nil;
    }
    function invalid$DataSchema() {
      if (def2.validateSchema) {
        const validateSchemaRef = gen.scopeValue("validate$data", { ref: def2.validateSchema });
        return (0, codegen_1$n._)`!${validateSchemaRef}(${schemaCode})`;
      }
      return codegen_1$n.nil;
    }
  }
  subschema(appl, valid2) {
    const subschema2 = (0, subschema_1.getSubschema)(this.it, appl);
    (0, subschema_1.extendSubschemaData)(subschema2, this.it, appl);
    (0, subschema_1.extendSubschemaMode)(subschema2, appl);
    const nextContext = { ...this.it, ...subschema2, items: void 0, props: void 0 };
    subschemaCode(nextContext, valid2);
    return nextContext;
  }
  mergeEvaluated(schemaCxt, toName) {
    const { it, gen } = this;
    if (!it.opts.unevaluated)
      return;
    if (it.props !== true && schemaCxt.props !== void 0) {
      it.props = util_1$l.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
    }
    if (it.items !== true && schemaCxt.items !== void 0) {
      it.items = util_1$l.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
    }
  }
  mergeValidEvaluated(schemaCxt, valid2) {
    const { it, gen } = this;
    if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
      gen.if(valid2, () => this.mergeEvaluated(schemaCxt, codegen_1$n.Name));
      return true;
    }
  }
}
validate.KeywordCxt = KeywordCxt2;
function keywordCode(it, keyword2, def2, ruleType) {
  const cxt = new KeywordCxt2(it, def2, keyword2);
  if ("code" in def2) {
    def2.code(cxt, ruleType);
  } else if (cxt.$data && def2.validate) {
    (0, keyword_1.funcKeywordCode)(cxt, def2);
  } else if ("macro" in def2) {
    (0, keyword_1.macroKeywordCode)(cxt, def2);
  } else if (def2.compile || def2.validate) {
    (0, keyword_1.funcKeywordCode)(cxt, def2);
  }
}
const JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
const RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData($data, { dataLevel, dataNames, dataPathArr }) {
  let jsonPointer;
  let data;
  if ($data === "")
    return names_1$3.default.rootData;
  if ($data[0] === "/") {
    if (!JSON_POINTER.test($data))
      throw new Error(`Invalid JSON-pointer: ${$data}`);
    jsonPointer = $data;
    data = names_1$3.default.rootData;
  } else {
    const matches = RELATIVE_JSON_POINTER.exec($data);
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
      data = (0, codegen_1$n._)`${data}${(0, codegen_1$n.getProperty)((0, util_1$l.unescapeJsonPointer)(segment))}`;
      expr = (0, codegen_1$n._)`${expr} && ${data}`;
    }
  }
  return expr;
  function errorMsg(pointerType, up) {
    return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
validate.getData = getData;
var validation_error = {};
Object.defineProperty(validation_error, "__esModule", { value: true });
class ValidationError2 extends Error {
  constructor(errors2) {
    super("validation failed");
    this.errors = errors2;
    this.ajv = this.validation = true;
=======
var fn = {}, Wi;
function $o() {
  if (Wi) return fn;
  Wi = 1, Object.defineProperty(fn, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return fn.default = e, fn;
}
<<<<<<< HEAD
validation_error.default = ValidationError2;
var ref_error = {};
Object.defineProperty(ref_error, "__esModule", { value: true });
const resolve_1$1 = resolve$1;
class MissingRefError2 extends Error {
  constructor(resolver, baseId, ref2, msg) {
    super(msg || `can't resolve reference ${ref2} from id ${baseId}`);
    this.missingRef = (0, resolve_1$1.resolveUrl)(resolver, baseId, ref2);
    this.missingSchema = (0, resolve_1$1.normalizeId)((0, resolve_1$1.getFullPath)(resolver, this.missingRef));
=======
var hn = {}, Xi;
function is() {
  if (Xi) return hn;
  Xi = 1, Object.defineProperty(hn, "__esModule", { value: !0 });
  const e = je;
  class t extends Error {
    constructor(n, s, a, o) {
      super(o || `can't resolve reference ${a} from id ${s}`), this.missingRef = (0, e.resolveUrl)(n, s, a), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return hn.default = t, hn;
}
<<<<<<< HEAD
ref_error.default = MissingRefError2;
var compile = {};
Object.defineProperty(compile, "__esModule", { value: true });
compile.resolveSchema = compile.getCompilingSchema = compile.resolveRef = compile.compileSchema = compile.SchemaEnv = void 0;
const codegen_1$m = codegen;
const validation_error_1 = validation_error;
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
    allErrors: this.opts.allErrors,
    data: names_1$2.default.data,
    parentData: names_1$2.default.parentData,
    parentDataProperty: names_1$2.default.parentDataProperty,
    dataNames: [names_1$2.default.data],
    dataPathArr: [codegen_1$m.nil],
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    // TODO can its length be used as dataLevel if nil is removed?
    dataLevel: 0,
    dataTypes: [],
    definedProperties: /* @__PURE__ */ new Set(),
<<<<<<< HEAD
    topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true ? { ref: sch.schema, code: (0, codegen_1$m.stringify)(sch.schema) } : { ref: sch.schema }),
    validateName,
    ValidationError: _ValidationError,
    schema: sch.schema,
    schemaEnv: sch,
    rootId,
    baseId: sch.baseId || rootId,
    schemaPath: codegen_1$m.nil,
    errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
    errorPath: (0, codegen_1$m._)`""`,
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    opts: this.opts,
    self: this
  };
  let sourceCode;
  try {
<<<<<<< HEAD
    this._compilations.add(sch);
    (0, validate_1$1.validateFunctionCode)(schemaCxt);
    gen.optimize(this.opts.code.optimize);
    const validateCode = gen.toString();
    sourceCode = `${gen.scopeRefs(names_1$2.default.scope)}return ${validateCode}`;
    if (this.opts.code.process)
      sourceCode = this.opts.code.process(sourceCode, sch);
    const makeValidate = new Function(`${names_1$2.default.self}`, `${names_1$2.default.scope}`, sourceCode);
    const validate2 = makeValidate(this, this.scope.get());
    this.scope.value(validateName, { ref: validate2 });
    validate2.errors = null;
    validate2.schema = sch.schema;
    validate2.schemaEnv = sch;
    if (sch.$async)
      validate2.$async = true;
    if (this.opts.code.source === true) {
      validate2.source = { validateName, validateCode, scopeValues: gen._values };
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    if (this.opts.unevaluated) {
      const { props, items: items2 } = schemaCxt;
      validate2.evaluated = {
        props: props instanceof codegen_1$m.Name ? void 0 : props,
        items: items2 instanceof codegen_1$m.Name ? void 0 : items2,
        dynamicProps: props instanceof codegen_1$m.Name,
        dynamicItems: items2 instanceof codegen_1$m.Name
      };
      if (validate2.source)
        validate2.source.evaluated = (0, codegen_1$m.stringify)(validate2.evaluated);
    }
    sch.validate = validate2;
    return sch;
  } catch (e) {
    delete sch.validate;
    delete sch.validateName;
    if (sourceCode)
      this.logger.error("Error compiling schema, function code:", sourceCode);
    throw e;
  } finally {
    this._compilations.delete(sch);
  }
}
<<<<<<< HEAD
compile.compileSchema = compileSchema;
function resolveRef(root, baseId, ref2) {
  var _a;
  ref2 = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref2);
  const schOrFunc = root.refs[ref2];
  if (schOrFunc)
    return schOrFunc;
  let _sch = resolve.call(this, root, ref2);
  if (_sch === void 0) {
    const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref2];
    const { schemaId } = this.opts;
    if (schema)
      _sch = new SchemaEnv2({ schema, schemaId, root, baseId });
  }
  if (_sch === void 0)
    return;
  return root.refs[ref2] = inlineOrCompile.call(this, _sch);
}
compile.resolveRef = resolveRef;
function inlineOrCompile(sch) {
  if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
    return sch.schema;
  return sch.validate ? sch : compileSchema.call(this, sch);
}
function getCompilingSchema(schEnv) {
  for (const sch of this._compilations) {
    if (sameSchemaEnv(sch, schEnv))
      return sch;
  }
}
compile.getCompilingSchema = getCompilingSchema;
function sameSchemaEnv(s1, s2) {
  return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
}
function resolve(root, ref2) {
  let sch;
  while (typeof (sch = this.refs[ref2]) == "string")
    ref2 = sch;
  return sch || this.schemas[ref2] || resolveSchema.call(this, root, ref2);
}
function resolveSchema(root, ref2) {
  const p = this.opts.uriResolver.parse(ref2);
  const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
  let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
  if (Object.keys(root.schema).length > 0 && refPath === baseId) {
    return getJsonPointer.call(this, p, root);
  }
  const id2 = (0, resolve_1.normalizeId)(refPath);
  const schOrRef = this.refs[id2] || this.schemas[id2];
  if (typeof schOrRef == "string") {
    const sch = resolveSchema.call(this, root, schOrRef);
    if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
      return;
    return getJsonPointer.call(this, p, sch);
  }
  if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
    return;
  if (!schOrRef.validate)
    compileSchema.call(this, schOrRef);
  if (id2 === (0, resolve_1.normalizeId)(ref2)) {
    const { schema } = schOrRef;
    const { schemaId } = this.opts;
    const schId = schema[schemaId];
    if (schId)
      baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
    return new SchemaEnv2({ schema, schemaId, root, baseId });
  }
  return getJsonPointer.call(this, p, schOrRef);
}
compile.resolveSchema = resolveSchema;
const PREVENT_SCOPE_CHANGE = /* @__PURE__ */ new Set([
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "properties",
  "patternProperties",
  "enum",
  "dependencies",
  "definitions"
]);
function getJsonPointer(parsedRef, { baseId, schema, root }) {
  var _a;
  if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
    return;
  for (const part of parsedRef.fragment.slice(1).split("/")) {
    if (typeof schema === "boolean")
      return;
<<<<<<< HEAD
    const partSchema = schema[(0, util_1$k.unescapeFragment)(part)];
    if (partSchema === void 0)
      return;
    schema = partSchema;
    const schId = typeof schema === "object" && schema[this.opts.schemaId];
    if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
      baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
    }
  }
  let env2;
  if (typeof schema != "boolean" && schema.$ref && !(0, util_1$k.schemaHasRulesButRef)(schema, this.RULES)) {
    const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
    env2 = resolveSchema.call(this, root, $ref);
  }
  const { schemaId } = this.opts;
  env2 = env2 || new SchemaEnv2({ schema, schemaId, root, baseId });
  if (env2.schema !== env2.root.schema)
    return env2;
  return void 0;
}
const $id$1 = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#";
const description = "Meta-schema for $data reference (JSON AnySchema extension proposal)";
const type$1 = "object";
const required$1 = [
  "$data"
];
const properties$2 = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
<<<<<<< HEAD
};
const additionalProperties$1 = false;
const require$$9 = {
  $id: $id$1,
  description,
  type: type$1,
  required: required$1,
  properties: properties$2,
  additionalProperties: additionalProperties$1
};
var uri$1 = {};
Object.defineProperty(uri$1, "__esModule", { value: true });
const uri = fastUriExports;
uri.code = 'require("ajv/dist/runtime/uri").default';
uri$1.default = uri;
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
  var validate_12 = validate;
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } });
  var codegen_12 = codegen;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_12._;
  } });
<<<<<<< HEAD
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
  const validation_error_12 = validation_error;
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
=======
  const n = $o(), s = is(), a = er, o = Ge, c = se, l = je, d = Se, u = F, h = eg, w = go, $ = (N, p) => new RegExp(N, p);
  $.code = "new RegExp";
  const y = ["removeAdditional", "useDefaults", "coerceTypes"], g = /* @__PURE__ */ new Set([
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
  ]);
  const removedOptions = {
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
  };
  const deprecatedOptions = {
    ignoreKeywordsWithRef: "",
    jsPropertySyntax: "",
    unicode: '"minLength"/"maxLength" account for unicode characters by default.'
<<<<<<< HEAD
  };
  const MAX_EXPRESSION = 200;
  function requiredOptions(o) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    const s = o.strict;
    const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
    const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
    const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
    const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
    return {
      strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
      strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
      strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
      strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
      strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
      code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
      loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
      loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
      meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
      messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
      inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
      schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
      addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
      validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
      validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
      unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
      int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
      uriResolver
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    };
  }
  class Ajv {
    constructor(opts = {}) {
      this.schemas = {};
      this.refs = {};
      this.formats = {};
      this._compilations = /* @__PURE__ */ new Set();
      this._loading = {};
      this._cache = /* @__PURE__ */ new Map();
      opts = this.opts = { ...opts, ...requiredOptions(opts) };
      const { es5, lines } = this.opts.code;
      this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
      this.logger = getLogger(opts.logger);
      const formatOpt = opts.validateFormats;
      opts.validateFormats = false;
      this.RULES = (0, rules_12.getRules)();
      checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
      checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
      this._metaOpts = getMetaSchemaOptions.call(this);
      if (opts.formats)
        addInitialFormats.call(this);
      this._addVocabularies();
      this._addDefaultMetaSchema();
      if (opts.keywords)
        addInitialKeywords.call(this, opts.keywords);
      if (typeof opts.meta == "object")
        this.addMetaSchema(opts.meta);
      addInitialSchemas.call(this);
      opts.validateFormats = formatOpt;
    }
    _addVocabularies() {
      this.addKeyword("$async");
    }
    _addDefaultMetaSchema() {
      const { $data, meta, schemaId } = this.opts;
      let _dataRefSchema = $dataRefSchema;
      if (schemaId === "id") {
        _dataRefSchema = { ...$dataRefSchema };
        _dataRefSchema.id = _dataRefSchema.$id;
        delete _dataRefSchema.$id;
      }
      if (meta && $data)
        this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
    }
    defaultMeta() {
      const { meta, schemaId } = this.opts;
      return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
    }
    validate(schemaKeyRef, data) {
      let v;
      if (typeof schemaKeyRef == "string") {
        v = this.getSchema(schemaKeyRef);
        if (!v)
          throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
      } else {
        v = this.compile(schemaKeyRef);
      }
      const valid2 = v(data);
      if (!("$async" in v))
        this.errors = v.errors;
      return valid2;
    }
    compile(schema, _meta) {
      const sch = this._addSchema(schema, _meta);
      return sch.validate || this._compileSchemaEnv(sch);
    }
    compileAsync(schema, meta) {
      if (typeof this.opts.loadSchema != "function") {
        throw new Error("options.loadSchema should be a function");
      }
      const { loadSchema } = this.opts;
      return runCompileAsync.call(this, schema, meta);
      async function runCompileAsync(_schema, _meta) {
        await loadMetaSchema.call(this, _schema.$schema);
        const sch = this._addSchema(_schema, _meta);
        return sch.validate || _compileAsync.call(this, sch);
      }
      async function loadMetaSchema($ref) {
        if ($ref && !this.getSchema($ref)) {
          await runCompileAsync.call(this, { $ref }, true);
        }
      }
      async function _compileAsync(sch) {
        try {
          return this._compileSchemaEnv(sch);
        } catch (e) {
          if (!(e instanceof ref_error_12.default))
            throw e;
          checkLoaded.call(this, e);
          await loadMissingSchema.call(this, e.missingSchema);
          return _compileAsync.call(this, sch);
        }
      }
      function checkLoaded({ missingSchema: ref2, missingRef }) {
        if (this.refs[ref2]) {
          throw new Error(`AnySchema ${ref2} is loaded but ${missingRef} cannot be resolved`);
        }
      }
      async function loadMissingSchema(ref2) {
        const _schema = await _loadSchema.call(this, ref2);
        if (!this.refs[ref2])
          await loadMetaSchema.call(this, _schema.$schema);
        if (!this.refs[ref2])
          this.addSchema(_schema, ref2, meta);
      }
      async function _loadSchema(ref2) {
        const p = this._loading[ref2];
        if (p)
          return p;
        try {
          return await (this._loading[ref2] = loadSchema(ref2));
        } finally {
          delete this._loading[ref2];
        }
      }
    }
    // Adds schema to the instance
    addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
      if (Array.isArray(schema)) {
        for (const sch of schema)
          this.addSchema(sch, void 0, _meta, _validateSchema);
        return this;
      }
      let id2;
      if (typeof schema === "object") {
        const { schemaId } = this.opts;
        id2 = schema[schemaId];
        if (id2 !== void 0 && typeof id2 != "string") {
          throw new Error(`schema ${schemaId} must be string`);
        }
      }
      key = (0, resolve_12.normalizeId)(key || id2);
      this._checkUnique(key);
      this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
      return this;
    }
    // Add schema that will be used to validate other schemas
    // options in META_IGNORE_OPTIONS are alway set to false
    addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
      this.addSchema(schema, key, true, _validateSchema);
      return this;
    }
    //  Validate schema against its meta-schema
    validateSchema(schema, throwOrLogError) {
      if (typeof schema == "boolean")
        return true;
      let $schema2;
      $schema2 = schema.$schema;
      if ($schema2 !== void 0 && typeof $schema2 != "string") {
        throw new Error("$schema must be a string");
      }
      $schema2 = $schema2 || this.opts.defaultMeta || this.defaultMeta();
      if (!$schema2) {
        this.logger.warn("meta-schema not available");
        this.errors = null;
        return true;
      }
      const valid2 = this.validate($schema2, schema);
      if (!valid2 && throwOrLogError) {
        const message = "schema is invalid: " + this.errorsText();
        if (this.opts.validateSchema === "log")
          this.logger.error(message);
        else
          throw new Error(message);
      }
      return valid2;
    }
    // Get compiled schema by `key` or `ref`.
    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
    getSchema(keyRef) {
      let sch;
      while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
        keyRef = sch;
      if (sch === void 0) {
        const { schemaId } = this.opts;
        const root = new compile_12.SchemaEnv({ schema: {}, schemaId });
        sch = compile_12.resolveSchema.call(this, root, keyRef);
        if (!sch)
          return;
        this.refs[keyRef] = sch;
      }
      return sch.validate || this._compileSchemaEnv(sch);
    }
    // Remove cached schema(s).
    // If no parameter is passed all schemas but meta-schemas are removed.
    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
    removeSchema(schemaKeyRef) {
      if (schemaKeyRef instanceof RegExp) {
        this._removeAllSchemas(this.schemas, schemaKeyRef);
        this._removeAllSchemas(this.refs, schemaKeyRef);
        return this;
      }
      switch (typeof schemaKeyRef) {
        case "undefined":
          this._removeAllSchemas(this.schemas);
          this._removeAllSchemas(this.refs);
          this._cache.clear();
          return this;
        case "string": {
          const sch = getSchEnv.call(this, schemaKeyRef);
          if (typeof sch == "object")
            this._cache.delete(sch.schema);
          delete this.schemas[schemaKeyRef];
          delete this.refs[schemaKeyRef];
          return this;
        }
        case "object": {
          const cacheKey = schemaKeyRef;
          this._cache.delete(cacheKey);
          let id2 = schemaKeyRef[this.opts.schemaId];
          if (id2) {
            id2 = (0, resolve_12.normalizeId)(id2);
            delete this.schemas[id2];
            delete this.refs[id2];
          }
          return this;
        }
        default:
          throw new Error("ajv.removeSchema: invalid parameter");
      }
    }
    // add "vocabulary" - a collection of keywords
    addVocabulary(definitions2) {
      for (const def2 of definitions2)
        this.addKeyword(def2);
      return this;
    }
    addKeyword(kwdOrDef, def2) {
      let keyword2;
      if (typeof kwdOrDef == "string") {
        keyword2 = kwdOrDef;
        if (typeof def2 == "object") {
          this.logger.warn("these parameters are deprecated, see docs for addKeyword");
          def2.keyword = keyword2;
        }
      } else if (typeof kwdOrDef == "object" && def2 === void 0) {
        def2 = kwdOrDef;
        keyword2 = def2.keyword;
        if (Array.isArray(keyword2) && !keyword2.length) {
          throw new Error("addKeywords: keyword must be string or non-empty array");
        }
      } else {
        throw new Error("invalid addKeywords parameters");
      }
      checkKeyword.call(this, keyword2, def2);
      if (!def2) {
        (0, util_12.eachItem)(keyword2, (kwd) => addRule.call(this, kwd));
        return this;
      }
      keywordMetaschema.call(this, def2);
      const definition = {
        ...def2,
        type: (0, dataType_12.getJSONTypes)(def2.type),
        schemaType: (0, dataType_12.getJSONTypes)(def2.schemaType)
      };
      (0, util_12.eachItem)(keyword2, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t2) => addRule.call(this, k, definition, t2)));
      return this;
    }
    getKeyword(keyword2) {
      const rule = this.RULES.all[keyword2];
      return typeof rule == "object" ? rule.definition : !!rule;
    }
    // Remove keyword
    removeKeyword(keyword2) {
      const { RULES } = this;
      delete RULES.keywords[keyword2];
      delete RULES.all[keyword2];
      for (const group of RULES.rules) {
        const i = group.rules.findIndex((rule) => rule.keyword === keyword2);
        if (i >= 0)
          group.rules.splice(i, 1);
      }
      return this;
    }
    // Add format
    addFormat(name, format2) {
      if (typeof format2 == "string")
        format2 = new RegExp(format2);
      this.formats[name] = format2;
      return this;
    }
    errorsText(errors2 = this.errors, { separator = ", ", dataVar = "data" } = {}) {
      if (!errors2 || errors2.length === 0)
        return "No errors";
      return errors2.map((e) => `${dataVar}${e.instancePath} ${e.message}`).reduce((text, msg) => text + separator + msg);
    }
    $dataMetaSchema(metaSchema2, keywordsJsonPointers) {
      const rules2 = this.RULES.all;
      metaSchema2 = JSON.parse(JSON.stringify(metaSchema2));
      for (const jsonPointer of keywordsJsonPointers) {
        const segments = jsonPointer.split("/").slice(1);
        let keywords = metaSchema2;
        for (const seg of segments)
          keywords = keywords[seg];
        for (const key in rules2) {
          const rule = rules2[key];
          if (typeof rule != "object")
            continue;
          const { $data } = rule.definition;
          const schema = keywords[key];
          if ($data && schema)
            keywords[key] = schemaOrData(schema);
        }
      }
      return metaSchema2;
    }
    _removeAllSchemas(schemas, regex) {
      for (const keyRef in schemas) {
        const sch = schemas[keyRef];
        if (!regex || regex.test(keyRef)) {
          if (typeof sch == "string") {
            delete schemas[keyRef];
          } else if (sch && !sch.meta) {
            this._cache.delete(sch.schema);
            delete schemas[keyRef];
          }
        }
      }
    }
    _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
      let id2;
      const { schemaId } = this.opts;
      if (typeof schema == "object") {
        id2 = schema[schemaId];
      } else {
        if (this.opts.jtd)
          throw new Error("schema must be object");
        else if (typeof schema != "boolean")
          throw new Error("schema must be object or boolean");
      }
      let sch = this._cache.get(schema);
      if (sch !== void 0)
        return sch;
      baseId = (0, resolve_12.normalizeId)(id2 || baseId);
      const localRefs = resolve_12.getSchemaRefs.call(this, schema, baseId);
      sch = new compile_12.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
      this._cache.set(sch.schema, sch);
      if (addSchema && !baseId.startsWith("#")) {
        if (baseId)
          this._checkUnique(baseId);
        this.refs[baseId] = sch;
      }
      if (validateSchema)
        this.validateSchema(schema, true);
      return sch;
    }
    _checkUnique(id2) {
      if (this.schemas[id2] || this.refs[id2]) {
        throw new Error(`schema with key or id "${id2}" already exists`);
      }
    }
    _compileSchemaEnv(sch) {
      if (sch.meta)
        this._compileMetaSchema(sch);
      else
        compile_12.compileSchema.call(this, sch);
      if (!sch.validate)
        throw new Error("ajv implementation error");
      return sch.validate;
    }
    _compileMetaSchema(sch) {
      const currentOpts = this.opts;
      this.opts = this._metaOpts;
      try {
        compile_12.compileSchema.call(this, sch);
      } finally {
        this.opts = currentOpts;
      }
    }
  }
  Ajv.ValidationError = validation_error_12.default;
  Ajv.MissingRefError = ref_error_12.default;
  exports.default = Ajv;
  function checkOptions(checkOpts, options, msg, log = "error") {
    for (const key in checkOpts) {
      const opt = key;
      if (opt in options)
        this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
    }
  }
  function getSchEnv(keyRef) {
    keyRef = (0, resolve_12.normalizeId)(keyRef);
    return this.schemas[keyRef] || this.refs[keyRef];
  }
  function addInitialSchemas() {
    const optsSchemas = this.opts.schemas;
    if (!optsSchemas)
      return;
    if (Array.isArray(optsSchemas))
      this.addSchema(optsSchemas);
    else
      for (const key in optsSchemas)
        this.addSchema(optsSchemas[key], key);
  }
  function addInitialFormats() {
    for (const name in this.opts.formats) {
      const format2 = this.opts.formats[name];
      if (format2)
        this.addFormat(name, format2);
    }
  }
  function addInitialKeywords(defs) {
    if (Array.isArray(defs)) {
      this.addVocabulary(defs);
      return;
    }
    this.logger.warn("keywords option as map is deprecated, pass array");
    for (const keyword2 in defs) {
      const def2 = defs[keyword2];
      if (!def2.keyword)
        def2.keyword = keyword2;
      this.addKeyword(def2);
    }
  }
  function getMetaSchemaOptions() {
    const metaOpts = { ...this.opts };
    for (const opt of META_IGNORE_OPTIONS)
      delete metaOpts[opt];
    return metaOpts;
  }
  const noLogs = { log() {
  }, warn() {
  }, error() {
  } };
  function getLogger(logger) {
    if (logger === false)
      return noLogs;
    if (logger === void 0)
      return console;
    if (logger.log && logger.warn && logger.error)
      return logger;
    throw new Error("logger must implement log, warn and error methods");
  }
  const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
  function checkKeyword(keyword2, def2) {
    const { RULES } = this;
    (0, util_12.eachItem)(keyword2, (kwd) => {
      if (RULES.keywords[kwd])
        throw new Error(`Keyword ${kwd} is already defined`);
      if (!KEYWORD_NAME.test(kwd))
        throw new Error(`Keyword ${kwd} has invalid name`);
    });
    if (!def2)
      return;
    if (def2.$data && !("code" in def2 || "validate" in def2)) {
      throw new Error('$data keyword must have "code" or "validate" function');
    }
  }
  function addRule(keyword2, definition, dataType2) {
    var _a;
    const post = definition === null || definition === void 0 ? void 0 : definition.post;
    if (dataType2 && post)
      throw new Error('keyword with "post" flag cannot have "type"');
    const { RULES } = this;
    let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t2 }) => t2 === dataType2);
    if (!ruleGroup) {
      ruleGroup = { type: dataType2, rules: [] };
      RULES.rules.push(ruleGroup);
    }
    RULES.keywords[keyword2] = true;
    if (!definition)
      return;
    const rule = {
      keyword: keyword2,
      definition: {
        ...definition,
        type: (0, dataType_12.getJSONTypes)(definition.type),
        schemaType: (0, dataType_12.getJSONTypes)(definition.schemaType)
      }
    };
    if (definition.before)
      addBeforeRule.call(this, ruleGroup, rule, definition.before);
    else
      ruleGroup.rules.push(rule);
    RULES.all[keyword2] = rule;
    (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
  }
  function addBeforeRule(ruleGroup, rule, before) {
    const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
    if (i >= 0) {
      ruleGroup.rules.splice(i, 0, rule);
    } else {
      ruleGroup.rules.push(rule);
      this.logger.warn(`rule ${before} is not defined`);
    }
  }
  function keywordMetaschema(def2) {
    let { metaSchema: metaSchema2 } = def2;
    if (metaSchema2 === void 0)
      return;
    if (def2.$data && this.opts.$data)
      metaSchema2 = schemaOrData(metaSchema2);
    def2.validateSchema = this.compile(metaSchema2, true);
  }
  const $dataRef = {
    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
  };
  function schemaOrData(schema) {
    return { anyOf: [schema, $dataRef] };
  }
<<<<<<< HEAD
})(core$2);
var draft7 = {};
var core$1 = {};
var id = {};
Object.defineProperty(id, "__esModule", { value: true });
const def$s = {
=======
})(Gl);
var _o = {}, vo = {}, wo = {};
Object.defineProperty(wo, "__esModule", { value: !0 });
const tg = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "id",
  code() {
    throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
  }
};
<<<<<<< HEAD
id.default = def$s;
var ref = {};
Object.defineProperty(ref, "__esModule", { value: true });
ref.callRef = ref.getValidate = void 0;
const ref_error_1$1 = ref_error;
const code_1$8 = code;
const codegen_1$l = codegen;
const names_1$1 = names$1;
const compile_1$1 = compile;
const util_1$j = util;
const def$r = {
  keyword: "$ref",
  schemaType: "string",
  code(cxt) {
    const { gen, schema: $ref, it } = cxt;
    const { baseId, schemaEnv: env2, validateName, opts, self } = it;
    const { root } = env2;
    if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
      return callRootRef();
    const schOrEnv = compile_1$1.resolveRef.call(self, root, baseId, $ref);
    if (schOrEnv === void 0)
      throw new ref_error_1$1.default(it.opts.uriResolver, baseId, $ref);
    if (schOrEnv instanceof compile_1$1.SchemaEnv)
      return callValidate(schOrEnv);
    return inlineRefSchema(schOrEnv);
    function callRootRef() {
      if (env2 === root)
        return callRef(cxt, validateName, env2, env2.$async);
      const rootName = gen.scopeValue("root", { ref: root });
      return callRef(cxt, (0, codegen_1$l._)`${rootName}.validate`, root, root.$async);
    }
    function callValidate(sch) {
      const v = getValidate(cxt, sch);
      callRef(cxt, v, sch, sch.$async);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    function inlineRefSchema(sch) {
      const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1$l.stringify)(sch) } : { ref: sch });
      const valid2 = gen.name("valid");
      const schCxt = cxt.subschema({
        schema: sch,
        dataTypes: [],
        schemaPath: codegen_1$l.nil,
        topSchemaRef: schName,
        errSchemaPath: $ref
      }, valid2);
      cxt.mergeEvaluated(schCxt);
      cxt.ok(valid2);
    }
  }
};
<<<<<<< HEAD
function getValidate(cxt, sch) {
  const { gen } = cxt;
  return sch.validate ? gen.scopeValue("validate", { ref: sch.validate }) : (0, codegen_1$l._)`${gen.scopeValue("wrapper", { ref: sch })}.validate`;
}
ref.getValidate = getValidate;
function callRef(cxt, v, sch, $async) {
  const { gen, it } = cxt;
  const { allErrors, schemaEnv: env2, opts } = it;
  const passCxt = opts.passContext ? names_1$1.default.this : codegen_1$l.nil;
  if ($async)
    callAsyncRef();
  else
    callSyncRef();
  function callAsyncRef() {
    if (!env2.$async)
      throw new Error("async schema referenced by sync schema");
    const valid2 = gen.let("valid");
    gen.try(() => {
      gen.code((0, codegen_1$l._)`await ${(0, code_1$8.callValidateCode)(cxt, v, passCxt)}`);
      addEvaluatedFrom(v);
      if (!allErrors)
        gen.assign(valid2, true);
    }, (e) => {
      gen.if((0, codegen_1$l._)`!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
      addErrorsFrom(e);
      if (!allErrors)
        gen.assign(valid2, false);
    });
    cxt.ok(valid2);
  }
  function callSyncRef() {
    cxt.result((0, code_1$8.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  function addErrorsFrom(source) {
    const errs = (0, codegen_1$l._)`${source}.errors`;
    gen.assign(names_1$1.default.vErrors, (0, codegen_1$l._)`${names_1$1.default.vErrors} === null ? ${errs} : ${names_1$1.default.vErrors}.concat(${errs})`);
    gen.assign(names_1$1.default.errors, (0, codegen_1$l._)`${names_1$1.default.vErrors}.length`);
  }
  function addEvaluatedFrom(source) {
    var _a;
    if (!it.opts.unevaluated)
      return;
    const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
    if (it.props !== true) {
      if (schEvaluated && !schEvaluated.dynamicProps) {
        if (schEvaluated.props !== void 0) {
          it.props = util_1$j.mergeEvaluated.props(gen, schEvaluated.props, it.props);
        }
      } else {
        const props = gen.var("props", (0, codegen_1$l._)`${source}.evaluated.props`);
        it.props = util_1$j.mergeEvaluated.props(gen, props, it.props, codegen_1$l.Name);
      }
    }
    if (it.items !== true) {
      if (schEvaluated && !schEvaluated.dynamicItems) {
        if (schEvaluated.items !== void 0) {
          it.items = util_1$j.mergeEvaluated.items(gen, schEvaluated.items, it.items);
        }
      } else {
        const items2 = gen.var("items", (0, codegen_1$l._)`${source}.evaluated.items`);
        it.items = util_1$j.mergeEvaluated.items(gen, items2, it.items, codegen_1$l.Name);
      }
    }
  }
}
<<<<<<< HEAD
ref.callRef = callRef;
ref.default = def$r;
Object.defineProperty(core$1, "__esModule", { value: true });
const id_1 = id;
const ref_1 = ref;
const core = [
=======
tr.callRef = kn;
tr.default = ng;
Object.defineProperty(vo, "__esModule", { value: !0 });
const sg = wo, ag = tr, og = [
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "$schema",
  "$id",
  "$defs",
  "$vocabulary",
  { keyword: "$comment" },
  "definitions",
<<<<<<< HEAD
  id_1.default,
  ref_1.default
];
core$1.default = core;
var validation$1 = {};
var limitNumber = {};
Object.defineProperty(limitNumber, "__esModule", { value: true });
const codegen_1$k = codegen;
const ops = codegen_1$k.operators;
const KWDs = {
  maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
  minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
  exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
  exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
};
const error$i = {
  message: ({ keyword: keyword2, schemaCode }) => (0, codegen_1$k.str)`must be ${KWDs[keyword2].okStr} ${schemaCode}`,
  params: ({ keyword: keyword2, schemaCode }) => (0, codegen_1$k._)`{comparison: ${KWDs[keyword2].okStr}, limit: ${schemaCode}}`
};
const def$q = {
  keyword: Object.keys(KWDs),
  type: "number",
  schemaType: "number",
  $data: true,
  error: error$i,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    cxt.fail$data((0, codegen_1$k._)`${data} ${KWDs[keyword2].fail} ${schemaCode} || isNaN(${data})`);
  }
};
limitNumber.default = def$q;
var multipleOf = {};
Object.defineProperty(multipleOf, "__esModule", { value: true });
const codegen_1$j = codegen;
const error$h = {
  message: ({ schemaCode }) => (0, codegen_1$j.str)`must be multiple of ${schemaCode}`,
  params: ({ schemaCode }) => (0, codegen_1$j._)`{multipleOf: ${schemaCode}}`
};
const def$p = {
  keyword: "multipleOf",
  type: "number",
  schemaType: "number",
  $data: true,
  error: error$h,
  code(cxt) {
    const { gen, data, schemaCode, it } = cxt;
    const prec = it.opts.multipleOfPrecision;
    const res = gen.let("res");
    const invalid = prec ? (0, codegen_1$j._)`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : (0, codegen_1$j._)`${res} !== parseInt(${res})`;
    cxt.fail$data((0, codegen_1$j._)`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
  }
};
multipleOf.default = def$p;
var limitLength = {};
var ucs2length$1 = {};
Object.defineProperty(ucs2length$1, "__esModule", { value: true });
function ucs2length(str) {
  const len = str.length;
  let length = 0;
  let pos = 0;
  let value;
  while (pos < len) {
    length++;
    value = str.charCodeAt(pos++);
    if (value >= 55296 && value <= 56319 && pos < len) {
      value = str.charCodeAt(pos);
      if ((value & 64512) === 56320)
        pos++;
    }
  }
  return length;
}
ucs2length$1.default = ucs2length;
ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
Object.defineProperty(limitLength, "__esModule", { value: true });
const codegen_1$i = codegen;
const util_1$i = util;
const ucs2length_1 = ucs2length$1;
const error$g = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxLength" ? "more" : "fewer";
    return (0, codegen_1$i.str)`must NOT have ${comp} than ${schemaCode} characters`;
  },
  params: ({ schemaCode }) => (0, codegen_1$i._)`{limit: ${schemaCode}}`
};
const def$o = {
  keyword: ["maxLength", "minLength"],
  type: "string",
  schemaType: "number",
  $data: true,
  error: error$g,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode, it } = cxt;
    const op = keyword2 === "maxLength" ? codegen_1$i.operators.GT : codegen_1$i.operators.LT;
    const len = it.opts.unicode === false ? (0, codegen_1$i._)`${data}.length` : (0, codegen_1$i._)`${(0, util_1$i.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
    cxt.fail$data((0, codegen_1$i._)`${len} ${op} ${schemaCode}`);
  }
};
limitLength.default = def$o;
var pattern = {};
Object.defineProperty(pattern, "__esModule", { value: true });
const code_1$7 = code;
const codegen_1$h = codegen;
const error$f = {
  message: ({ schemaCode }) => (0, codegen_1$h.str)`must match pattern "${schemaCode}"`,
  params: ({ schemaCode }) => (0, codegen_1$h._)`{pattern: ${schemaCode}}`
};
const def$n = {
  keyword: "pattern",
  type: "string",
  schemaType: "string",
  $data: true,
  error: error$f,
  code(cxt) {
    const { data, $data, schema, schemaCode, it } = cxt;
    const u = it.opts.unicodeRegExp ? "u" : "";
    const regExp = $data ? (0, codegen_1$h._)`(new RegExp(${schemaCode}, ${u}))` : (0, code_1$7.usePattern)(cxt, schema);
    cxt.fail$data((0, codegen_1$h._)`!${regExp}.test(${data})`);
  }
};
pattern.default = def$n;
var limitProperties = {};
Object.defineProperty(limitProperties, "__esModule", { value: true });
const codegen_1$g = codegen;
const error$e = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxProperties" ? "more" : "fewer";
    return (0, codegen_1$g.str)`must NOT have ${comp} than ${schemaCode} properties`;
  },
  params: ({ schemaCode }) => (0, codegen_1$g._)`{limit: ${schemaCode}}`
};
const def$m = {
  keyword: ["maxProperties", "minProperties"],
  type: "object",
  schemaType: "number",
  $data: true,
  error: error$e,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    const op = keyword2 === "maxProperties" ? codegen_1$g.operators.GT : codegen_1$g.operators.LT;
    cxt.fail$data((0, codegen_1$g._)`Object.keys(${data}).length ${op} ${schemaCode}`);
  }
};
limitProperties.default = def$m;
var required = {};
Object.defineProperty(required, "__esModule", { value: true });
const code_1$6 = code;
const codegen_1$f = codegen;
const util_1$h = util;
const error$d = {
  message: ({ params: { missingProperty } }) => (0, codegen_1$f.str)`must have required property '${missingProperty}'`,
  params: ({ params: { missingProperty } }) => (0, codegen_1$f._)`{missingProperty: ${missingProperty}}`
};
const def$l = {
  keyword: "required",
  type: "object",
  schemaType: "array",
  $data: true,
  error: error$d,
  code(cxt) {
    const { gen, schema, schemaCode, data, $data, it } = cxt;
    const { opts } = it;
    if (!$data && schema.length === 0)
      return;
    const useLoop = schema.length >= opts.loopRequired;
    if (it.allErrors)
      allErrorsMode();
    else
      exitOnErrorMode();
    if (opts.strictRequired) {
      const props = cxt.parentSchema.properties;
      const { definedProperties } = cxt.it;
      for (const requiredKey of schema) {
        if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === void 0 && !definedProperties.has(requiredKey)) {
          const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
          const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
          (0, util_1$h.checkStrictMode)(it, msg, it.opts.strictRequired);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        }
      }
    }
<<<<<<< HEAD
    function allErrorsMode() {
      if (useLoop || $data) {
        cxt.block$data(codegen_1$f.nil, loopAllRequired);
      } else {
        for (const prop of schema) {
          (0, code_1$6.checkReportMissingProp)(cxt, prop);
        }
      }
    }
    function exitOnErrorMode() {
      const missing = gen.let("missing");
      if (useLoop || $data) {
        const valid2 = gen.let("valid", true);
        cxt.block$data(valid2, () => loopUntilMissing(missing, valid2));
        cxt.ok(valid2);
      } else {
        gen.if((0, code_1$6.checkMissingProp)(cxt, schema, missing));
        (0, code_1$6.reportMissingProp)(cxt, missing);
        gen.else();
      }
    }
    function loopAllRequired() {
      gen.forOf("prop", schemaCode, (prop) => {
        cxt.setParams({ missingProperty: prop });
        gen.if((0, code_1$6.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
      });
    }
    function loopUntilMissing(missing, valid2) {
      cxt.setParams({ missingProperty: missing });
      gen.forOf(missing, schemaCode, () => {
        gen.assign(valid2, (0, code_1$6.propertyInData)(gen, data, missing, opts.ownProperties));
        gen.if((0, codegen_1$f.not)(valid2), () => {
          cxt.error();
          gen.break();
        });
      }, codegen_1$f.nil);
    }
  }
};
required.default = def$l;
var limitItems = {};
Object.defineProperty(limitItems, "__esModule", { value: true });
const codegen_1$e = codegen;
const error$c = {
  message({ keyword: keyword2, schemaCode }) {
    const comp = keyword2 === "maxItems" ? "more" : "fewer";
    return (0, codegen_1$e.str)`must NOT have ${comp} than ${schemaCode} items`;
  },
  params: ({ schemaCode }) => (0, codegen_1$e._)`{limit: ${schemaCode}}`
};
const def$k = {
  keyword: ["maxItems", "minItems"],
  type: "array",
  schemaType: "number",
  $data: true,
  error: error$c,
  code(cxt) {
    const { keyword: keyword2, data, schemaCode } = cxt;
    const op = keyword2 === "maxItems" ? codegen_1$e.operators.GT : codegen_1$e.operators.LT;
    cxt.fail$data((0, codegen_1$e._)`${data}.length ${op} ${schemaCode}`);
  }
};
limitItems.default = def$k;
var uniqueItems = {};
var equal$1 = {};
Object.defineProperty(equal$1, "__esModule", { value: true });
const equal2 = fastDeepEqual;
equal2.code = 'require("ajv/dist/runtime/equal").default';
equal$1.default = equal2;
Object.defineProperty(uniqueItems, "__esModule", { value: true });
const dataType_1 = dataType;
const codegen_1$d = codegen;
const util_1$g = util;
const equal_1$2 = equal$1;
const error$b = {
  message: ({ params: { i, j } }) => (0, codegen_1$d.str)`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
  params: ({ params: { i, j } }) => (0, codegen_1$d._)`{i: ${i}, j: ${j}}`
};
const def$j = {
  keyword: "uniqueItems",
  type: "array",
  schemaType: "boolean",
  $data: true,
  error: error$b,
  code(cxt) {
    const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
    if (!$data && !schema)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    const valid2 = gen.let("valid");
    const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
    cxt.block$data(valid2, validateUniqueItems, (0, codegen_1$d._)`${schemaCode} === false`);
    cxt.ok(valid2);
    function validateUniqueItems() {
      const i = gen.let("i", (0, codegen_1$d._)`${data}.length`);
      const j = gen.let("j");
      cxt.setParams({ i, j });
      gen.assign(valid2, true);
      gen.if((0, codegen_1$d._)`${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
    }
    function canOptimize() {
      return itemTypes.length > 0 && !itemTypes.some((t2) => t2 === "object" || t2 === "array");
    }
    function loopN(i, j) {
      const item = gen.name("item");
      const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
      const indices = gen.const("indices", (0, codegen_1$d._)`{}`);
      gen.for((0, codegen_1$d._)`;${i}--;`, () => {
        gen.let(item, (0, codegen_1$d._)`${data}[${i}]`);
        gen.if(wrongType, (0, codegen_1$d._)`continue`);
        if (itemTypes.length > 1)
          gen.if((0, codegen_1$d._)`typeof ${item} == "string"`, (0, codegen_1$d._)`${item} += "_"`);
        gen.if((0, codegen_1$d._)`typeof ${indices}[${item}] == "number"`, () => {
          gen.assign(j, (0, codegen_1$d._)`${indices}[${item}]`);
          cxt.error();
          gen.assign(valid2, false).break();
        }).code((0, codegen_1$d._)`${indices}[${item}] = ${i}`);
      });
    }
<<<<<<< HEAD
    function loopN2(i, j) {
      const eql = (0, util_1$g.useFunc)(gen, equal_1$2.default);
      const outer = gen.name("outer");
      gen.label(outer).for((0, codegen_1$d._)`;${i}--;`, () => gen.for((0, codegen_1$d._)`${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1$d._)`${eql}(${data}[${i}], ${data}[${j}])`, () => {
        cxt.error();
        gen.assign(valid2, false).break(outer);
=======
    function $(y, g) {
      const _ = (0, Pg.useFunc)(t, Ng.default), m = t.name("outer");
      t.label(m).for((0, Ie._)`;${y}--;`, () => t.for((0, Ie._)`${g} = ${y}; ${g}--;`, () => t.if((0, Ie._)`${_}(${r}[${y}], ${r}[${g}])`, () => {
        e.error(), t.assign(l, !1).break(m);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      })));
    }
  }
};
<<<<<<< HEAD
uniqueItems.default = def$j;
var _const = {};
Object.defineProperty(_const, "__esModule", { value: true });
const codegen_1$c = codegen;
const util_1$f = util;
const equal_1$1 = equal$1;
const error$a = {
  message: "must be equal to constant",
  params: ({ schemaCode }) => (0, codegen_1$c._)`{allowedValue: ${schemaCode}}`
};
const def$i = {
  keyword: "const",
  $data: true,
  error: error$a,
  code(cxt) {
    const { gen, data, $data, schemaCode, schema } = cxt;
    if ($data || schema && typeof schema == "object") {
      cxt.fail$data((0, codegen_1$c._)`!${(0, util_1$f.useFunc)(gen, equal_1$1.default)}(${data}, ${schemaCode})`);
    } else {
      cxt.fail((0, codegen_1$c._)`${schema} !== ${data}`);
    }
  }
};
_const.default = def$i;
var _enum = {};
Object.defineProperty(_enum, "__esModule", { value: true });
const codegen_1$b = codegen;
const util_1$e = util;
const equal_1 = equal$1;
const error$9 = {
  message: "must be equal to one of the allowed values",
  params: ({ schemaCode }) => (0, codegen_1$b._)`{allowedValues: ${schemaCode}}`
};
const def$h = {
  keyword: "enum",
  schemaType: "array",
  $data: true,
  error: error$9,
  code(cxt) {
    const { gen, data, $data, schema, schemaCode, it } = cxt;
    if (!$data && schema.length === 0)
      throw new Error("enum must have non-empty array");
    const useLoop = schema.length >= it.opts.loopEnum;
    let eql;
    const getEql = () => eql !== null && eql !== void 0 ? eql : eql = (0, util_1$e.useFunc)(gen, equal_1.default);
    let valid2;
    if (useLoop || $data) {
      valid2 = gen.let("valid");
      cxt.block$data(valid2, loopEnum);
    } else {
      if (!Array.isArray(schema))
        throw new Error("ajv implementation error");
      const vSchema = gen.const("vSchema", schemaCode);
      valid2 = (0, codegen_1$b.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
    }
    cxt.pass(valid2);
    function loopEnum() {
      gen.assign(valid2, false);
      gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1$b._)`${getEql()}(${data}, ${v})`, () => gen.assign(valid2, true).break()));
    }
    function equalCode(vSchema, i) {
      const sch = schema[i];
      return typeof sch === "object" && sch !== null ? (0, codegen_1$b._)`${getEql()}(${data}, ${vSchema}[${i}])` : (0, codegen_1$b._)`${data} === ${sch}`;
    }
  }
};
_enum.default = def$h;
Object.defineProperty(validation$1, "__esModule", { value: true });
const limitNumber_1 = limitNumber;
const multipleOf_1 = multipleOf;
const limitLength_1 = limitLength;
const pattern_1 = pattern;
const limitProperties_1 = limitProperties;
const required_1 = required;
const limitItems_1 = limitItems;
const uniqueItems_1 = uniqueItems;
const const_1 = _const;
const enum_1 = _enum;
const validation = [
  // number
  limitNumber_1.default,
  multipleOf_1.default,
  // string
  limitLength_1.default,
  pattern_1.default,
  // object
  limitProperties_1.default,
  required_1.default,
  // array
  limitItems_1.default,
  uniqueItems_1.default,
  // any
  { keyword: "type", schemaType: ["string", "array"] },
  { keyword: "nullable", schemaType: "boolean" },
  const_1.default,
  enum_1.default
];
validation$1.default = validation;
var applicator = {};
var additionalItems = {};
Object.defineProperty(additionalItems, "__esModule", { value: true });
additionalItems.validateAdditionalItems = void 0;
const codegen_1$a = codegen;
const util_1$d = util;
const error$8 = {
  message: ({ params: { len } }) => (0, codegen_1$a.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$a._)`{limit: ${len}}`
};
const def$g = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "additionalItems",
  type: "array",
  schemaType: ["boolean", "object"],
  before: "uniqueItems",
<<<<<<< HEAD
  error: error$8,
  code(cxt) {
    const { parentSchema, it } = cxt;
    const { items: items2 } = parentSchema;
    if (!Array.isArray(items2)) {
      (0, util_1$d.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
      return;
    }
    validateAdditionalItems(cxt, items2);
  }
};
function validateAdditionalItems(cxt, items2) {
  const { gen, schema, data, keyword: keyword2, it } = cxt;
  it.items = true;
  const len = gen.const("len", (0, codegen_1$a._)`${data}.length`);
  if (schema === false) {
    cxt.setParams({ len: items2.length });
    cxt.pass((0, codegen_1$a._)`${len} <= ${items2.length}`);
  } else if (typeof schema == "object" && !(0, util_1$d.alwaysValidSchema)(it, schema)) {
    const valid2 = gen.var("valid", (0, codegen_1$a._)`${len} <= ${items2.length}`);
    gen.if((0, codegen_1$a.not)(valid2), () => validateItems(valid2));
    cxt.ok(valid2);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  function validateItems(valid2) {
    gen.forRange("i", items2.length, len, (i) => {
      cxt.subschema({ keyword: keyword2, dataProp: i, dataPropType: util_1$d.Type.Num }, valid2);
      if (!it.allErrors)
        gen.if((0, codegen_1$a.not)(valid2), () => gen.break());
    });
  }
}
<<<<<<< HEAD
additionalItems.validateAdditionalItems = validateAdditionalItems;
additionalItems.default = def$g;
var prefixItems = {};
var items = {};
Object.defineProperty(items, "__esModule", { value: true });
items.validateTuple = void 0;
const codegen_1$9 = codegen;
const util_1$c = util;
const code_1$5 = code;
const def$f = {
=======
Sr.validateAdditionalItems = uu;
Sr.default = Xg;
var Do = {}, Pr = {};
Object.defineProperty(Pr, "__esModule", { value: !0 });
Pr.validateTuple = void 0;
const xi = se, An = F, Yg = ie, Qg = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "items",
  type: "array",
  schemaType: ["object", "array", "boolean"],
  before: "uniqueItems",
<<<<<<< HEAD
  code(cxt) {
    const { schema, it } = cxt;
    if (Array.isArray(schema))
      return validateTuple(cxt, "additionalItems", schema);
    it.items = true;
    if ((0, util_1$c.alwaysValidSchema)(it, schema))
      return;
    cxt.ok((0, code_1$5.validateArray)(cxt));
  }
};
function validateTuple(cxt, extraItems, schArr = cxt.schema) {
  const { gen, parentSchema, data, keyword: keyword2, it } = cxt;
  checkStrictTuple(parentSchema);
  if (it.opts.unevaluated && schArr.length && it.items !== true) {
    it.items = util_1$c.mergeEvaluated.items(gen, schArr.length, it.items);
  }
  const valid2 = gen.name("valid");
  const len = gen.const("len", (0, codegen_1$9._)`${data}.length`);
  schArr.forEach((sch, i) => {
    if ((0, util_1$c.alwaysValidSchema)(it, sch))
      return;
    gen.if((0, codegen_1$9._)`${len} > ${i}`, () => cxt.subschema({
      keyword: keyword2,
      schemaProp: i,
      dataProp: i
    }, valid2));
    cxt.ok(valid2);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  });
  function checkStrictTuple(sch) {
    const { opts, errSchemaPath } = it;
    const l = schArr.length;
    const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
    if (opts.strictTuples && !fullTuple) {
      const msg = `"${keyword2}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
      (0, util_1$c.checkStrictMode)(it, msg, opts.strictTuples);
    }
  }
}
<<<<<<< HEAD
items.validateTuple = validateTuple;
items.default = def$f;
Object.defineProperty(prefixItems, "__esModule", { value: true });
const items_1$1 = items;
const def$e = {
=======
Pr.validateTuple = du;
Pr.default = Qg;
Object.defineProperty(Do, "__esModule", { value: !0 });
const Zg = Pr, xg = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "prefixItems",
  type: "array",
  schemaType: ["array"],
  before: "uniqueItems",
<<<<<<< HEAD
  code: (cxt) => (0, items_1$1.validateTuple)(cxt, "items")
};
prefixItems.default = def$e;
var items2020 = {};
Object.defineProperty(items2020, "__esModule", { value: true });
const codegen_1$8 = codegen;
const util_1$b = util;
const code_1$4 = code;
const additionalItems_1$1 = additionalItems;
const error$7 = {
  message: ({ params: { len } }) => (0, codegen_1$8.str)`must NOT have more than ${len} items`,
  params: ({ params: { len } }) => (0, codegen_1$8._)`{limit: ${len}}`
};
const def$d = {
=======
  code: (e) => (0, Zg.validateTuple)(e, "items")
};
Do.default = xg;
var Mo = {};
Object.defineProperty(Mo, "__esModule", { value: !0 });
const ec = se, e_ = F, t_ = ie, r_ = Sr, n_ = {
  message: ({ params: { len: e } }) => (0, ec.str)`must NOT have more than ${e} items`,
  params: ({ params: { len: e } }) => (0, ec._)`{limit: ${e}}`
}, s_ = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "items",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
<<<<<<< HEAD
  error: error$7,
  code(cxt) {
    const { schema, parentSchema, it } = cxt;
    const { prefixItems: prefixItems2 } = parentSchema;
    it.items = true;
    if ((0, util_1$b.alwaysValidSchema)(it, schema))
      return;
    if (prefixItems2)
      (0, additionalItems_1$1.validateAdditionalItems)(cxt, prefixItems2);
    else
      cxt.ok((0, code_1$4.validateArray)(cxt));
  }
};
items2020.default = def$d;
var contains = {};
Object.defineProperty(contains, "__esModule", { value: true });
const codegen_1$7 = codegen;
const util_1$a = util;
const error$6 = {
  message: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$7.str)`must contain at least ${min} valid item(s)` : (0, codegen_1$7.str)`must contain at least ${min} and no more than ${max} valid item(s)`,
  params: ({ params: { min, max } }) => max === void 0 ? (0, codegen_1$7._)`{minContains: ${min}}` : (0, codegen_1$7._)`{minContains: ${min}, maxContains: ${max}}`
};
const def$c = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "contains",
  type: "array",
  schemaType: ["object", "boolean"],
  before: "uniqueItems",
<<<<<<< HEAD
  trackErrors: true,
  error: error$6,
  code(cxt) {
    const { gen, schema, parentSchema, data, it } = cxt;
    let min;
    let max;
    const { minContains, maxContains } = parentSchema;
    if (it.opts.next) {
      min = minContains === void 0 ? 1 : minContains;
      max = maxContains;
    } else {
      min = 1;
    }
    const len = gen.const("len", (0, codegen_1$7._)`${data}.length`);
    cxt.setParams({ min, max });
    if (max === void 0 && min === 0) {
      (0, util_1$a.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    }
    if (max !== void 0 && min > max) {
      (0, util_1$a.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
      cxt.fail();
      return;
    }
<<<<<<< HEAD
    if ((0, util_1$a.alwaysValidSchema)(it, schema)) {
      let cond = (0, codegen_1$7._)`${len} >= ${min}`;
      if (max !== void 0)
        cond = (0, codegen_1$7._)`${cond} && ${len} <= ${max}`;
      cxt.pass(cond);
      return;
    }
    it.items = true;
    const valid2 = gen.name("valid");
    if (max === void 0 && min === 1) {
      validateItems(valid2, () => gen.if(valid2, () => gen.break()));
    } else if (min === 0) {
      gen.let(valid2, true);
      if (max !== void 0)
        gen.if((0, codegen_1$7._)`${data}.length > 0`, validateItemsWithCount);
    } else {
      gen.let(valid2, false);
      validateItemsWithCount();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    cxt.result(valid2, () => cxt.reset());
    function validateItemsWithCount() {
      const schValid = gen.name("_valid");
      const count = gen.let("count", 0);
      validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
    }
    function validateItems(_valid, block) {
      gen.forRange("i", 0, len, (i) => {
        cxt.subschema({
          keyword: "contains",
          dataProp: i,
          dataPropType: util_1$a.Type.Num,
          compositeRule: true
        }, _valid);
        block();
      });
    }
<<<<<<< HEAD
    function checkLimits(count) {
      gen.code((0, codegen_1$7._)`${count}++`);
      if (max === void 0) {
        gen.if((0, codegen_1$7._)`${count} >= ${min}`, () => gen.assign(valid2, true).break());
      } else {
        gen.if((0, codegen_1$7._)`${count} > ${max}`, () => gen.assign(valid2, false).break());
        if (min === 1)
          gen.assign(valid2, true);
        else
          gen.if((0, codegen_1$7._)`${count} >= ${min}`, () => gen.assign(valid2, true));
      }
    }
  }
};
contains.default = def$c;
var dependencies = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
  const codegen_12 = codegen;
  const util_12 = util;
  const code_12 = code;
  exports.error = {
    message: ({ params: { property, depsCount, deps } }) => {
      const property_ies = depsCount === 1 ? "property" : "properties";
      return (0, codegen_12.str)`must have ${property_ies} ${deps} when property ${property} is present`;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    },
    params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_12._)`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
    // TODO change to reference
  };
  const def2 = {
    keyword: "dependencies",
    type: "object",
    schemaType: "object",
    error: exports.error,
    code(cxt) {
      const [propDeps, schDeps] = splitDependencies(cxt);
      validatePropertyDeps(cxt, propDeps);
      validateSchemaDeps(cxt, schDeps);
    }
  };
  function splitDependencies({ schema }) {
    const propertyDeps = {};
    const schemaDeps = {};
    for (const key in schema) {
      if (key === "__proto__")
        continue;
      const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
      deps[key] = schema[key];
    }
    return [propertyDeps, schemaDeps];
  }
  function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
    const { gen, data, it } = cxt;
    if (Object.keys(propertyDeps).length === 0)
      return;
    const missing = gen.let("missing");
    for (const prop in propertyDeps) {
      const deps = propertyDeps[prop];
      if (deps.length === 0)
        continue;
      const hasProperty2 = (0, code_12.propertyInData)(gen, data, prop, it.opts.ownProperties);
      cxt.setParams({
        property: prop,
        depsCount: deps.length,
        deps: deps.join(", ")
      });
      if (it.allErrors) {
        gen.if(hasProperty2, () => {
          for (const depProp of deps) {
            (0, code_12.checkReportMissingProp)(cxt, depProp);
          }
        });
      } else {
        gen.if((0, codegen_12._)`${hasProperty2} && (${(0, code_12.checkMissingProp)(cxt, deps, missing)})`);
        (0, code_12.reportMissingProp)(cxt, missing);
        gen.else();
      }
    }
  }
  exports.validatePropertyDeps = validatePropertyDeps;
  function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
    const { gen, data, keyword: keyword2, it } = cxt;
    const valid2 = gen.name("valid");
    for (const prop in schemaDeps) {
      if ((0, util_12.alwaysValidSchema)(it, schemaDeps[prop]))
        continue;
      gen.if(
        (0, code_12.propertyInData)(gen, data, prop, it.opts.ownProperties),
        () => {
          const schCxt = cxt.subschema({ keyword: keyword2, schemaProp: prop }, valid2);
          cxt.mergeValidEvaluated(schCxt, valid2);
        },
        () => gen.var(valid2, true)
        // TODO var
      );
      cxt.ok(valid2);
    }
  }
<<<<<<< HEAD
  exports.validateSchemaDeps = validateSchemaDeps;
  exports.default = def2;
})(dependencies);
var propertyNames = {};
Object.defineProperty(propertyNames, "__esModule", { value: true });
const codegen_1$6 = codegen;
const util_1$9 = util;
const error$5 = {
  message: "property name must be valid",
  params: ({ params }) => (0, codegen_1$6._)`{propertyName: ${params.propertyName}}`
};
const def$b = {
  keyword: "propertyNames",
  type: "object",
  schemaType: ["object", "boolean"],
  error: error$5,
  code(cxt) {
    const { gen, schema, data, it } = cxt;
    if ((0, util_1$9.alwaysValidSchema)(it, schema))
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    const valid2 = gen.name("valid");
    gen.forIn("key", data, (key) => {
      cxt.setParams({ propertyName: key });
      cxt.subschema({
        keyword: "propertyNames",
        data: key,
        dataTypes: ["string"],
<<<<<<< HEAD
        propertyName: key,
        compositeRule: true
      }, valid2);
      gen.if((0, codegen_1$6.not)(valid2), () => {
        cxt.error(true);
        if (!it.allErrors)
          gen.break();
=======
        propertyName: o,
        compositeRule: !0
      }, a), t.if((0, hu.not)(a), () => {
        e.error(!0), s.allErrors || t.break();
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      });
    });
    cxt.ok(valid2);
  }
};
<<<<<<< HEAD
propertyNames.default = def$b;
var additionalProperties = {};
Object.defineProperty(additionalProperties, "__esModule", { value: true });
const code_1$3 = code;
const codegen_1$5 = codegen;
const names_1 = names$1;
const util_1$8 = util;
const error$4 = {
  message: "must NOT have additional properties",
  params: ({ params }) => (0, codegen_1$5._)`{additionalProperty: ${params.additionalProperty}}`
};
const def$a = {
  keyword: "additionalProperties",
  type: ["object"],
  schemaType: ["boolean", "object"],
  allowUndefined: true,
  trackErrors: true,
  error: error$4,
  code(cxt) {
    const { gen, schema, parentSchema, data, errsCount, it } = cxt;
    if (!errsCount)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("ajv implementation error");
    const { allErrors, opts } = it;
    it.props = true;
    if (opts.removeAdditional !== "all" && (0, util_1$8.alwaysValidSchema)(it, schema))
      return;
<<<<<<< HEAD
    const props = (0, code_1$3.allSchemaProperties)(parentSchema.properties);
    const patProps = (0, code_1$3.allSchemaProperties)(parentSchema.patternProperties);
    checkAdditionalProperties();
    cxt.ok((0, codegen_1$5._)`${errsCount} === ${names_1.default.errors}`);
    function checkAdditionalProperties() {
      gen.forIn("key", data, (key) => {
        if (!props.length && !patProps.length)
          additionalPropertyCode(key);
        else
          gen.if(isAdditional(key), () => additionalPropertyCode(key));
      });
    }
    function isAdditional(key) {
      let definedProp;
      if (props.length > 8) {
        const propsSchema = (0, util_1$8.schemaRefOrVal)(it, parentSchema.properties, "properties");
        definedProp = (0, code_1$3.isOwnProperty)(gen, propsSchema, key);
      } else if (props.length) {
        definedProp = (0, codegen_1$5.or)(...props.map((p) => (0, codegen_1$5._)`${key} === ${p}`));
      } else {
        definedProp = codegen_1$5.nil;
      }
      if (patProps.length) {
        definedProp = (0, codegen_1$5.or)(definedProp, ...patProps.map((p) => (0, codegen_1$5._)`${(0, code_1$3.usePattern)(cxt, p)}.test(${key})`));
      }
      return (0, codegen_1$5.not)(definedProp);
    }
    function deleteAdditional(key) {
      gen.code((0, codegen_1$5._)`delete ${data}[${key}]`);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    function additionalPropertyCode(key) {
      if (opts.removeAdditional === "all" || opts.removeAdditional && schema === false) {
        deleteAdditional(key);
        return;
      }
      if (schema === false) {
        cxt.setParams({ additionalProperty: key });
        cxt.error();
        if (!allErrors)
          gen.break();
        return;
      }
<<<<<<< HEAD
      if (typeof schema == "object" && !(0, util_1$8.alwaysValidSchema)(it, schema)) {
        const valid2 = gen.name("valid");
        if (opts.removeAdditional === "failing") {
          applyAdditionalSchema(key, valid2, false);
          gen.if((0, codegen_1$5.not)(valid2), () => {
            cxt.reset();
            deleteAdditional(key);
          });
        } else {
          applyAdditionalSchema(key, valid2);
          if (!allErrors)
            gen.if((0, codegen_1$5.not)(valid2), () => gen.break());
        }
=======
      if (typeof r == "object" && !(0, yn.alwaysValidSchema)(o, r)) {
        const m = t.name("valid");
        l.removeAdditional === "failing" ? (g(_, m, !1), t.if((0, et.not)(m), () => {
          e.reset(), $(_);
        })) : (g(_, m), c || t.if((0, et.not)(m), () => t.break()));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
    }
    function applyAdditionalSchema(key, valid2, errors2) {
      const subschema2 = {
        keyword: "additionalProperties",
        dataProp: key,
        dataPropType: util_1$8.Type.Str
      };
      if (errors2 === false) {
        Object.assign(subschema2, {
          compositeRule: true,
          createErrors: false,
          allErrors: false
        });
      }
      cxt.subschema(subschema2, valid2);
    }
  }
};
<<<<<<< HEAD
additionalProperties.default = def$a;
var properties$1 = {};
Object.defineProperty(properties$1, "__esModule", { value: true });
const validate_1 = validate;
const code_1$2 = code;
const util_1$7 = util;
const additionalProperties_1$1 = additionalProperties;
const def$9 = {
  keyword: "properties",
  type: "object",
  schemaType: "object",
  code(cxt) {
    const { gen, schema, parentSchema, data, it } = cxt;
    if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === void 0) {
      additionalProperties_1$1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1$1.default, "additionalProperties"));
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    const allProps = (0, code_1$2.allSchemaProperties)(schema);
    for (const prop of allProps) {
      it.definedProperties.add(prop);
    }
    if (it.opts.unevaluated && allProps.length && it.props !== true) {
      it.props = util_1$7.mergeEvaluated.props(gen, (0, util_1$7.toHash)(allProps), it.props);
    }
    const properties2 = allProps.filter((p) => !(0, util_1$7.alwaysValidSchema)(it, schema[p]));
    if (properties2.length === 0)
      return;
    const valid2 = gen.name("valid");
    for (const prop of properties2) {
      if (hasDefault(prop)) {
        applyPropertySchema(prop);
      } else {
        gen.if((0, code_1$2.propertyInData)(gen, data, prop, it.opts.ownProperties));
        applyPropertySchema(prop);
        if (!it.allErrors)
          gen.else().var(valid2, true);
        gen.endIf();
      }
      cxt.it.definedProperties.add(prop);
      cxt.ok(valid2);
    }
    function hasDefault(prop) {
      return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== void 0;
    }
    function applyPropertySchema(prop) {
      cxt.subschema({
        keyword: "properties",
        schemaProp: prop,
        dataProp: prop
      }, valid2);
    }
  }
};
<<<<<<< HEAD
properties$1.default = def$9;
var patternProperties = {};
Object.defineProperty(patternProperties, "__esModule", { value: true });
const code_1$1 = code;
const codegen_1$4 = codegen;
const util_1$6 = util;
const util_2 = util;
const def$8 = {
  keyword: "patternProperties",
  type: "object",
  schemaType: "object",
  code(cxt) {
    const { gen, schema, data, parentSchema, it } = cxt;
    const { opts } = it;
    const patterns = (0, code_1$1.allSchemaProperties)(schema);
    const alwaysValidPatterns = patterns.filter((p) => (0, util_1$6.alwaysValidSchema)(it, schema[p]));
    if (patterns.length === 0 || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || it.props === true)) {
      return;
    }
    const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
    const valid2 = gen.name("valid");
    if (it.props !== true && !(it.props instanceof codegen_1$4.Name)) {
      it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
    }
    const { props } = it;
    validatePatternProperties();
    function validatePatternProperties() {
      for (const pat of patterns) {
        if (checkProperties)
          checkMatchingProperties(pat);
        if (it.allErrors) {
          validateProperties(pat);
        } else {
          gen.var(valid2, true);
          validateProperties(pat);
          gen.if(valid2);
        }
      }
    }
    function checkMatchingProperties(pat) {
      for (const prop in checkProperties) {
        if (new RegExp(pat).test(prop)) {
          (0, util_1$6.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
        }
      }
    }
    function validateProperties(pat) {
      gen.forIn("key", data, (key) => {
        gen.if((0, codegen_1$4._)`${(0, code_1$1.usePattern)(cxt, pat)}.test(${key})`, () => {
          const alwaysValid = alwaysValidPatterns.includes(pat);
          if (!alwaysValid) {
            cxt.subschema({
              keyword: "patternProperties",
              schemaProp: pat,
              dataProp: key,
              dataPropType: util_2.Type.Str
            }, valid2);
          }
          if (it.opts.unevaluated && props !== true) {
            gen.assign((0, codegen_1$4._)`${props}[${key}]`, true);
          } else if (!alwaysValid && !it.allErrors) {
            gen.if((0, codegen_1$4.not)(valid2), () => gen.break());
          }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        });
      });
    }
  }
};
<<<<<<< HEAD
patternProperties.default = def$8;
var not = {};
Object.defineProperty(not, "__esModule", { value: true });
const util_1$5 = util;
const def$7 = {
  keyword: "not",
  schemaType: ["object", "boolean"],
  trackErrors: true,
  code(cxt) {
    const { gen, schema, it } = cxt;
    if ((0, util_1$5.alwaysValidSchema)(it, schema)) {
      cxt.fail();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    }
    const valid2 = gen.name("valid");
    cxt.subschema({
      keyword: "not",
      compositeRule: true,
      createErrors: false,
      allErrors: false
    }, valid2);
    cxt.failResult(valid2, () => cxt.reset(), () => cxt.error());
  },
  error: { message: "must NOT be valid" }
};
<<<<<<< HEAD
not.default = def$7;
var anyOf = {};
Object.defineProperty(anyOf, "__esModule", { value: true });
const code_1 = code;
const def$6 = {
  keyword: "anyOf",
  schemaType: "array",
  trackErrors: true,
  code: code_1.validateUnion,
  error: { message: "must match a schema in anyOf" }
};
anyOf.default = def$6;
var oneOf = {};
Object.defineProperty(oneOf, "__esModule", { value: true });
const codegen_1$3 = codegen;
const util_1$4 = util;
const error$3 = {
  message: "must match exactly one schema in oneOf",
  params: ({ params }) => (0, codegen_1$3._)`{passingSchemas: ${params.passing}}`
};
const def$5 = {
  keyword: "oneOf",
  schemaType: "array",
  trackErrors: true,
  error: error$3,
  code(cxt) {
    const { gen, schema, parentSchema, it } = cxt;
    if (!Array.isArray(schema))
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("ajv implementation error");
    if (it.opts.discriminator && parentSchema.discriminator)
      return;
<<<<<<< HEAD
    const schArr = schema;
    const valid2 = gen.let("valid", false);
    const passing = gen.let("passing", null);
    const schValid = gen.name("_valid");
    cxt.setParams({ passing });
    gen.block(validateOneOf);
    cxt.result(valid2, () => cxt.reset(), () => cxt.error(true));
    function validateOneOf() {
      schArr.forEach((sch, i) => {
        let schCxt;
        if ((0, util_1$4.alwaysValidSchema)(it, sch)) {
          gen.var(schValid, true);
        } else {
          schCxt = cxt.subschema({
            keyword: "oneOf",
            schemaProp: i,
            compositeRule: true
          }, schValid);
        }
        if (i > 0) {
          gen.if((0, codegen_1$3._)`${schValid} && ${valid2}`).assign(valid2, false).assign(passing, (0, codegen_1$3._)`[${passing}, ${i}]`).else();
        }
        gen.if(schValid, () => {
          gen.assign(valid2, true);
          gen.assign(passing, i);
          if (schCxt)
            cxt.mergeEvaluated(schCxt, codegen_1$3.Name);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        });
      });
    }
  }
};
<<<<<<< HEAD
oneOf.default = def$5;
var allOf = {};
Object.defineProperty(allOf, "__esModule", { value: true });
const util_1$3 = util;
const def$4 = {
=======
Go.default = E_;
var Ko = {};
Object.defineProperty(Ko, "__esModule", { value: !0 });
const b_ = F, S_ = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  keyword: "allOf",
  schemaType: "array",
  code(cxt) {
    const { gen, schema, it } = cxt;
    if (!Array.isArray(schema))
      throw new Error("ajv implementation error");
<<<<<<< HEAD
    const valid2 = gen.name("valid");
    schema.forEach((sch, i) => {
      if ((0, util_1$3.alwaysValidSchema)(it, sch))
=======
    const s = t.name("valid");
    r.forEach((a, o) => {
      if ((0, b_.alwaysValidSchema)(n, a))
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        return;
      const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid2);
      cxt.ok(valid2);
      cxt.mergeEvaluated(schCxt);
    });
  }
};
<<<<<<< HEAD
allOf.default = def$4;
var _if = {};
Object.defineProperty(_if, "__esModule", { value: true });
const codegen_1$2 = codegen;
const util_1$2 = util;
const error$2 = {
  message: ({ params }) => (0, codegen_1$2.str)`must match "${params.ifClause}" schema`,
  params: ({ params }) => (0, codegen_1$2._)`{failingKeyword: ${params.ifClause}}`
};
const def$3 = {
  keyword: "if",
  schemaType: ["object", "boolean"],
  trackErrors: true,
  error: error$2,
  code(cxt) {
    const { gen, parentSchema, it } = cxt;
    if (parentSchema.then === void 0 && parentSchema.else === void 0) {
      (0, util_1$2.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    const hasThen = hasSchema(it, "then");
    const hasElse = hasSchema(it, "else");
    if (!hasThen && !hasElse)
      return;
    const valid2 = gen.let("valid", true);
    const schValid = gen.name("_valid");
    validateIf();
    cxt.reset();
    if (hasThen && hasElse) {
      const ifClause = gen.let("ifClause");
      cxt.setParams({ ifClause });
      gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
    } else if (hasThen) {
      gen.if(schValid, validateClause("then"));
    } else {
      gen.if((0, codegen_1$2.not)(schValid), validateClause("else"));
    }
    cxt.pass(valid2, () => cxt.error(true));
    function validateIf() {
      const schCxt = cxt.subschema({
        keyword: "if",
        compositeRule: true,
        createErrors: false,
        allErrors: false
      }, schValid);
      cxt.mergeEvaluated(schCxt);
    }
    function validateClause(keyword2, ifClause) {
      return () => {
        const schCxt = cxt.subschema({ keyword: keyword2 }, schValid);
        gen.assign(valid2, schValid);
        cxt.mergeValidEvaluated(schCxt, valid2);
        if (ifClause)
          gen.assign(ifClause, (0, codegen_1$2._)`${keyword2}`);
        else
          cxt.setParams({ ifClause: keyword2 });
      };
    }
  }
};
<<<<<<< HEAD
function hasSchema(it, keyword2) {
  const schema = it.schema[keyword2];
  return schema !== void 0 && !(0, util_1$2.alwaysValidSchema)(it, schema);
}
_if.default = def$3;
var thenElse = {};
Object.defineProperty(thenElse, "__esModule", { value: true });
const util_1$1 = util;
const def$2 = {
  keyword: ["then", "else"],
  schemaType: ["object", "boolean"],
  code({ keyword: keyword2, parentSchema, it }) {
    if (parentSchema.if === void 0)
      (0, util_1$1.checkStrictMode)(it, `"${keyword2}" without "if" is ignored`);
  }
};
thenElse.default = def$2;
Object.defineProperty(applicator, "__esModule", { value: true });
const additionalItems_1 = additionalItems;
const prefixItems_1 = prefixItems;
const items_1 = items;
const items2020_1 = items2020;
const contains_1 = contains;
const dependencies_1 = dependencies;
const propertyNames_1 = propertyNames;
const additionalProperties_1 = additionalProperties;
const properties_1 = properties$1;
const patternProperties_1 = patternProperties;
const not_1 = not;
const anyOf_1 = anyOf;
const oneOf_1 = oneOf;
const allOf_1 = allOf;
const if_1 = _if;
const thenElse_1 = thenElse;
function getApplicator(draft20202 = false) {
  const applicator2 = [
    // any
    not_1.default,
    anyOf_1.default,
    oneOf_1.default,
    allOf_1.default,
    if_1.default,
    thenElse_1.default,
    // object
    propertyNames_1.default,
    additionalProperties_1.default,
    dependencies_1.default,
    properties_1.default,
    patternProperties_1.default
  ];
  if (draft20202)
    applicator2.push(prefixItems_1.default, items2020_1.default);
  else
    applicator2.push(additionalItems_1.default, items_1.default);
  applicator2.push(contains_1.default);
  return applicator2;
}
applicator.default = getApplicator;
var format$2 = {};
var format$1 = {};
Object.defineProperty(format$1, "__esModule", { value: true });
const codegen_1$1 = codegen;
const error$1 = {
  message: ({ schemaCode }) => (0, codegen_1$1.str)`must match format "${schemaCode}"`,
  params: ({ schemaCode }) => (0, codegen_1$1._)`{format: ${schemaCode}}`
};
const def$1 = {
  keyword: "format",
  type: ["number", "string"],
  schemaType: "string",
  $data: true,
  error: error$1,
  code(cxt, ruleType) {
    const { gen, data, $data, schema, schemaCode, it } = cxt;
    const { opts, errSchemaPath, schemaEnv, self } = it;
    if (!opts.validateFormats)
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return;
    if ($data)
      validate$DataFormat();
    else
      validateFormat();
    function validate$DataFormat() {
      const fmts = gen.scopeValue("formats", {
        ref: self.formats,
        code: opts.code.formats
      });
      const fDef = gen.const("fDef", (0, codegen_1$1._)`${fmts}[${schemaCode}]`);
      const fType = gen.let("fType");
      const format2 = gen.let("format");
      gen.if((0, codegen_1$1._)`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1$1._)`${fDef}.type || "string"`).assign(format2, (0, codegen_1$1._)`${fDef}.validate`), () => gen.assign(fType, (0, codegen_1$1._)`"string"`).assign(format2, fDef));
      cxt.fail$data((0, codegen_1$1.or)(unknownFmt(), invalidFmt()));
      function unknownFmt() {
        if (opts.strictSchema === false)
          return codegen_1$1.nil;
        return (0, codegen_1$1._)`${schemaCode} && !${format2}`;
      }
      function invalidFmt() {
        const callFormat = schemaEnv.$async ? (0, codegen_1$1._)`(${fDef}.async ? await ${format2}(${data}) : ${format2}(${data}))` : (0, codegen_1$1._)`${format2}(${data})`;
        const validData = (0, codegen_1$1._)`(typeof ${format2} == "function" ? ${callFormat} : ${format2}.test(${data}))`;
        return (0, codegen_1$1._)`${format2} && ${format2} !== true && ${fType} === ${ruleType} && !${validData}`;
      }
    }
    function validateFormat() {
      const formatDef = self.formats[schema];
      if (!formatDef) {
        unknownFormat();
        return;
      }
      if (formatDef === true)
        return;
      const [fmtType, format2, fmtRef] = getFormat(formatDef);
      if (fmtType === ruleType)
        cxt.pass(validCondition());
      function unknownFormat() {
        if (opts.strictSchema === false) {
          self.logger.warn(unknownMsg());
          return;
        }
        throw new Error(unknownMsg());
        function unknownMsg() {
          return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
        }
      }
      function getFormat(fmtDef) {
        const code2 = fmtDef instanceof RegExp ? (0, codegen_1$1.regexpCode)(fmtDef) : opts.code.formats ? (0, codegen_1$1._)`${opts.code.formats}${(0, codegen_1$1.getProperty)(schema)}` : void 0;
        const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code: code2 });
        if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
          return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1$1._)`${fmt}.validate`];
        }
        return ["string", fmtDef, fmt];
      }
      function validCondition() {
        if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
          if (!schemaEnv.$async)
            throw new Error("async format in sync schema");
          return (0, codegen_1$1._)`await ${fmtRef}(${data})`;
        }
        return typeof format2 == "function" ? (0, codegen_1$1._)`${fmtRef}(${data})` : (0, codegen_1$1._)`${fmtRef}.test(${data})`;
      }
    }
  }
};
<<<<<<< HEAD
format$1.default = def$1;
Object.defineProperty(format$2, "__esModule", { value: true });
const format_1$1 = format$1;
const format = [format_1$1.default];
format$2.default = format;
var metadata = {};
Object.defineProperty(metadata, "__esModule", { value: true });
metadata.contentVocabulary = metadata.metadataVocabulary = void 0;
metadata.metadataVocabulary = [
=======
Wo.default = J_;
Object.defineProperty(Jo, "__esModule", { value: !0 });
const W_ = Wo, X_ = [W_.default];
Jo.default = X_;
var gr = {};
Object.defineProperty(gr, "__esModule", { value: !0 });
gr.contentVocabulary = gr.metadataVocabulary = void 0;
gr.metadataVocabulary = [
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "title",
  "description",
  "default",
  "deprecated",
  "readOnly",
  "writeOnly",
  "examples"
];
metadata.contentVocabulary = [
  "contentMediaType",
  "contentEncoding",
  "contentSchema"
];
<<<<<<< HEAD
Object.defineProperty(draft7, "__esModule", { value: true });
const core_1 = core$1;
const validation_1 = validation$1;
const applicator_1 = applicator;
const format_1 = format$2;
const metadata_1 = metadata;
const draft7Vocabularies = [
  core_1.default,
  validation_1.default,
  (0, applicator_1.default)(),
  format_1.default,
  metadata_1.metadataVocabulary,
  metadata_1.contentVocabulary
];
draft7.default = draft7Vocabularies;
var discriminator = {};
var types = {};
Object.defineProperty(types, "__esModule", { value: true });
types.DiscrError = void 0;
var DiscrError;
(function(DiscrError2) {
  DiscrError2["Tag"] = "tag";
  DiscrError2["Mapping"] = "mapping";
})(DiscrError || (types.DiscrError = DiscrError = {}));
Object.defineProperty(discriminator, "__esModule", { value: true });
const codegen_1 = codegen;
const types_1 = types;
const compile_1 = compile;
const ref_error_1 = ref_error;
const util_1 = util;
const error = {
  message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
  params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._)`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
};
const def = {
  keyword: "discriminator",
  type: "object",
  schemaType: "object",
  error,
  code(cxt) {
    const { gen, data, schema, parentSchema, it } = cxt;
    const { oneOf: oneOf2 } = parentSchema;
    if (!it.opts.discriminator) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      throw new Error("discriminator: requires discriminator option");
    }
    const tagName = schema.propertyName;
    if (typeof tagName != "string")
      throw new Error("discriminator: requires propertyName");
    if (schema.mapping)
      throw new Error("discriminator: mapping is not supported");
    if (!oneOf2)
      throw new Error("discriminator: requires oneOf keyword");
    const valid2 = gen.let("valid", false);
    const tag = gen.const("tag", (0, codegen_1._)`${data}${(0, codegen_1.getProperty)(tagName)}`);
    gen.if((0, codegen_1._)`typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
    cxt.ok(valid2);
    function validateMapping() {
      const mapping = getMapping();
      gen.if(false);
      for (const tagValue in mapping) {
        gen.elseIf((0, codegen_1._)`${tag} === ${tagValue}`);
        gen.assign(valid2, applyTagSchema(mapping[tagValue]));
      }
      gen.else();
      cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
      gen.endIf();
    }
    function applyTagSchema(schemaProp) {
      const _valid = gen.name("valid");
      const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
      cxt.mergeEvaluated(schCxt, codegen_1.Name);
      return _valid;
    }
<<<<<<< HEAD
    function getMapping() {
      var _a;
      const oneOfMapping = {};
      const topRequired = hasRequired(parentSchema);
      let tagRequired = true;
      for (let i = 0; i < oneOf2.length; i++) {
        let sch = oneOf2[i];
        if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
          const ref2 = sch.$ref;
          sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref2);
          if (sch instanceof compile_1.SchemaEnv)
            sch = sch.schema;
          if (sch === void 0)
            throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref2);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        }
        const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
        if (typeof propSch != "object") {
          throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
        }
        tagRequired = tagRequired && (topRequired || hasRequired(sch));
        addMappings(propSch, i);
      }
      if (!tagRequired)
        throw new Error(`discriminator: "${tagName}" must be required`);
      return oneOfMapping;
      function hasRequired({ required: required2 }) {
        return Array.isArray(required2) && required2.includes(tagName);
      }
      function addMappings(sch, i) {
        if (sch.const) {
          addMapping(sch.const, i);
        } else if (sch.enum) {
          for (const tagValue of sch.enum) {
            addMapping(tagValue, i);
          }
        } else {
          throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
        }
      }
      function addMapping(tagValue, i) {
        if (typeof tagValue != "string" || tagValue in oneOfMapping) {
          throw new Error(`discriminator: "${tagName}" values must be unique strings`);
        }
        oneOfMapping[tagValue] = i;
      }
    }
  }
};
<<<<<<< HEAD
discriminator.default = def;
const $schema = "http://json-schema.org/draft-07/schema#";
const $id = "http://json-schema.org/draft-07/schema#";
const title = "Core schema meta-schema";
const definitions = {
=======
Xo.default = sv;
const av = "http://json-schema.org/draft-07/schema#", ov = "http://json-schema.org/draft-07/schema#", iv = "Core schema meta-schema", cv = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
        "default": 0
      }
    ]
  },
  simpleTypes: {
    "enum": [
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
    uniqueItems: true,
    "default": []
  }
<<<<<<< HEAD
};
const type = [
  "object",
  "boolean"
];
const properties = {
=======
}, lv = [
  "object",
  "boolean"
], uv = {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
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
  "default": true,
  readOnly: {
    type: "boolean",
    "default": false
  },
  examples: {
    type: "array",
    items: true
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
    "default": true
  },
  maxItems: {
    $ref: "#/definitions/nonNegativeInteger"
  },
  minItems: {
    $ref: "#/definitions/nonNegativeIntegerDefault0"
  },
  uniqueItems: {
    type: "boolean",
    "default": false
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
    "default": {}
  },
  properties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    "default": {}
  },
  patternProperties: {
    type: "object",
    additionalProperties: {
      $ref: "#"
    },
    propertyNames: {
      format: "regex"
    },
    "default": {}
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
  "const": true,
  "enum": {
    type: "array",
    items: true,
    minItems: 1,
    uniqueItems: true
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
        uniqueItems: true
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
  "if": {
    $ref: "#"
  },
  then: {
    $ref: "#"
  },
  "else": {
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
<<<<<<< HEAD
};
const require$$3 = {
  $schema,
  $id,
  title,
  definitions,
  type,
  properties,
  "default": true
};
(function(module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;
  const core_12 = core$2;
  const draft7_1 = draft7;
  const discriminator_1 = discriminator;
  const draft7MetaSchema = require$$3;
  const META_SUPPORT_DATA2 = ["/properties"];
  const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
  class Ajv extends core_12.default {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    _addVocabularies() {
      super._addVocabularies();
      draft7_1.default.forEach((v) => this.addVocabulary(v));
      if (this.opts.discriminator)
        this.addKeyword(discriminator_1.default);
    }
    _addDefaultMetaSchema() {
      super._addDefaultMetaSchema();
      if (!this.opts.meta)
        return;
      const metaSchema2 = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA2) : draft7MetaSchema;
      this.addMetaSchema(metaSchema2, META_SCHEMA_ID, false);
      this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
    }
    defaultMeta() {
      return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
    }
  }
<<<<<<< HEAD
  exports.Ajv = Ajv;
  module.exports = exports = Ajv;
  module.exports.Ajv = Ajv;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = Ajv;
  var validate_12 = validate;
  Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
    return validate_12.KeywordCxt;
=======
  t.Ajv = l, e.exports = t = l, e.exports.Ajv = l, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = l;
  var d = os();
  Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
    return d.KeywordCxt;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } });
  var codegen_12 = codegen;
  Object.defineProperty(exports, "_", { enumerable: true, get: function() {
    return codegen_12._;
  } });
<<<<<<< HEAD
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
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  };
  const error2 = {
    message: ({ keyword: keyword2, schemaCode }) => (0, codegen_12.str)`should be ${KWDs2[keyword2].okStr} ${schemaCode}`,
    params: ({ keyword: keyword2, schemaCode }) => (0, codegen_12._)`{comparison: ${KWDs2[keyword2].okStr}, limit: ${schemaCode}}`
  };
  exports.formatLimitDefinition = {
    keyword: Object.keys(KWDs2),
    type: "string",
    schemaType: "string",
    $data: true,
    error: error2,
    code(cxt) {
      const { gen, data, schemaCode, keyword: keyword2, it } = cxt;
      const { opts, self } = it;
      if (!opts.validateFormats)
        return;
      const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
      if (fCxt.$data)
        validate$DataFormat();
      else
        validateFormat();
      function validate$DataFormat() {
        const fmts = gen.scopeValue("formats", {
          ref: self.formats,
          code: opts.code.formats
        });
        const fmt = gen.const("fmt", (0, codegen_12._)`${fmts}[${fCxt.schemaCode}]`);
        cxt.fail$data((0, codegen_12.or)((0, codegen_12._)`typeof ${fmt} != "object"`, (0, codegen_12._)`${fmt} instanceof RegExp`, (0, codegen_12._)`typeof ${fmt}.compare != "function"`, compareCode(fmt)));
      }
      function validateFormat() {
        const format2 = fCxt.schema;
        const fmtDef = self.formats[format2];
        if (!fmtDef || fmtDef === true)
          return;
        if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
          throw new Error(`"${keyword2}": format "${format2}" does not define "compare" function`);
        }
        const fmt = gen.scopeValue("formats", {
          key: format2,
          ref: fmtDef,
          code: opts.code.formats ? (0, codegen_12._)`${opts.code.formats}${(0, codegen_12.getProperty)(format2)}` : void 0
        });
        cxt.fail$data(compareCode(fmt));
      }
      function compareCode(fmt) {
        return (0, codegen_12._)`${fmt}.compare(${data}, ${schemaCode}) ${KWDs2[keyword2].fail} 0`;
      }
    },
    dependencies: ["format"]
  };
<<<<<<< HEAD
  const formatLimitPlugin = (ajv2) => {
    ajv2.addKeyword(exports.formatLimitDefinition);
    return ajv2;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  };
  exports.default = formatLimitPlugin;
})(limit);
(function(module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  const formats_1 = formats;
  const limit_1 = limit;
  const codegen_12 = codegen;
  const fullName = new codegen_12.Name("fullFormats");
  const fastName = new codegen_12.Name("fastFormats");
  const formatsPlugin = (ajv2, opts = { keywords: true }) => {
    if (Array.isArray(opts)) {
      addFormats(ajv2, opts, formats_1.fullFormats, fullName);
      return ajv2;
    }
    const [formats2, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
    const list = opts.formats || formats_1.formatNames;
    addFormats(ajv2, list, formats2, exportName);
    if (opts.keywords)
      (0, limit_1.default)(ajv2);
    return ajv2;
  };
  formatsPlugin.get = (name, mode = "full") => {
    const formats2 = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
    const f = formats2[name];
    if (!f)
      throw new Error(`Unknown format "${name}"`);
    return f;
  };
  function addFormats(ajv2, list, fs2, exportName) {
    var _a;
    var _b;
    (_a = (_b = ajv2.opts.code).formats) !== null && _a !== void 0 ? _a : _b.formats = (0, codegen_12._)`require("ajv-formats/dist/formats").${exportName}`;
    for (const f of list)
      ajv2.addFormat(f, fs2[f]);
  }
<<<<<<< HEAD
  module.exports = exports = formatsPlugin;
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = formatsPlugin;
})(dist, dist.exports);
var distExports = dist.exports;
const ajvFormatsModule = /* @__PURE__ */ getDefaultExportFromCjs(distExports);
const copyProperty = (to, from, property, ignoreNonConfigurable) => {
  if (property === "length" || property === "prototype") {
    return;
  }
  if (property === "arguments" || property === "caller") {
    return;
  }
  const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
  const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);
  if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
    return;
  }
  Object.defineProperty(to, property, fromDescriptor);
};
const canCopyProperty = function(toDescriptor, fromDescriptor) {
  return toDescriptor === void 0 || toDescriptor.configurable || toDescriptor.writable === fromDescriptor.writable && toDescriptor.enumerable === fromDescriptor.enumerable && toDescriptor.configurable === fromDescriptor.configurable && (toDescriptor.writable || toDescriptor.value === fromDescriptor.value);
};
const changePrototype = (to, from) => {
  const fromPrototype = Object.getPrototypeOf(from);
  if (fromPrototype === Object.getPrototypeOf(to)) {
    return;
  }
  Object.setPrototypeOf(to, fromPrototype);
};
const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/
${fromBody}`;
const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, "toString");
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name");
const changeToString = (to, from, name) => {
  const withName = name === "" ? "" : `with ${name.trim()}() `;
  const newToString = wrappedToString.bind(null, withName, from.toString());
  Object.defineProperty(newToString, "name", toStringName);
  const { writable, enumerable, configurable } = toStringDescriptor;
  Object.defineProperty(to, "toString", { value: newToString, writable, enumerable, configurable });
};
function mimicFunction(to, from, { ignoreNonConfigurable = false } = {}) {
  const { name } = to;
  for (const property of Reflect.ownKeys(from)) {
    copyProperty(to, from, property, ignoreNonConfigurable);
  }
  changePrototype(to, from);
  changeToString(to, from, name);
  return to;
}
const debounceFunction = (inputFunction, options = {}) => {
  if (typeof inputFunction !== "function") {
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof inputFunction}\``);
  }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  const {
    wait = 0,
    maxWait = Number.POSITIVE_INFINITY,
    before = false,
    after = true
  } = options;
  if (wait < 0 || maxWait < 0) {
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  }
  if (!before && !after) {
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  }
  let timeout;
  let maxTimeout;
  let result;
  const debouncedFunction = function(...arguments_) {
    const context = this;
    const later = () => {
      timeout = void 0;
      if (maxTimeout) {
        clearTimeout(maxTimeout);
        maxTimeout = void 0;
      }
      if (after) {
        result = inputFunction.apply(context, arguments_);
      }
    };
    const maxLater = () => {
      maxTimeout = void 0;
      if (timeout) {
        clearTimeout(timeout);
        timeout = void 0;
      }
      if (after) {
        result = inputFunction.apply(context, arguments_);
      }
    };
    const shouldCallNow = before && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (maxWait > 0 && maxWait !== Number.POSITIVE_INFINITY && !maxTimeout) {
      maxTimeout = setTimeout(maxLater, maxWait);
    }
    if (shouldCallNow) {
      result = inputFunction.apply(context, arguments_);
    }
    return result;
  };
<<<<<<< HEAD
  mimicFunction(debouncedFunction, inputFunction);
  debouncedFunction.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = void 0;
    }
    if (maxTimeout) {
      clearTimeout(maxTimeout);
      maxTimeout = void 0;
    }
  };
  return debouncedFunction;
};
var re$2 = { exports: {} };
const SEMVER_SPEC_VERSION = "2.0.0";
const MAX_LENGTH$1 = 256;
const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991;
const MAX_SAFE_COMPONENT_LENGTH = 16;
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH$1 - 6;
const RELEASE_TYPES = [
=======
  return Ev(d, e), d.cancel = () => {
    o && (clearTimeout(o), o = void 0), c && (clearTimeout(c), c = void 0);
  }, d;
};
var xs = { exports: {} };
const bv = "2.0.0", pu = 256, Sv = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, Pv = 16, Nv = pu - 6, Rv = [
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
<<<<<<< HEAD
var constants$1 = {
  MAX_LENGTH: MAX_LENGTH$1,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const debug$1 = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
};
var debug_1 = debug$1;
(function(module, exports) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH2,
    MAX_SAFE_BUILD_LENGTH: MAX_SAFE_BUILD_LENGTH2,
    MAX_LENGTH: MAX_LENGTH2
  } = constants$1;
  const debug2 = debug_1;
  exports = module.exports = {};
  const re2 = exports.re = [];
  const safeRe = exports.safeRe = [];
  const src = exports.src = [];
  const safeSrc = exports.safeSrc = [];
  const t2 = exports.t = {};
  let R = 0;
  const LETTERDASHNUMBER = "[a-zA-Z0-9-]";
  const safeRegexReplacements = [
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    ["\\s", 1],
    ["\\d", MAX_LENGTH2],
    [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH2]
  ];
  const makeSafeRegex = (value) => {
    for (const [token, max] of safeRegexReplacements) {
      value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
    }
    return value;
  };
<<<<<<< HEAD
  const createToken = (name, value, isGlobal) => {
    const safe = makeSafeRegex(value);
    const index = R++;
    debug2(name, index, value);
    t2[name] = index;
    src[index] = value;
    safeSrc[index] = safe;
    re2[index] = new RegExp(value, isGlobal ? "g" : void 0);
    safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
  };
  createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
  createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
  createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
  createToken("MAINVERSION", `(${src[t2.NUMERICIDENTIFIER]})\\.(${src[t2.NUMERICIDENTIFIER]})\\.(${src[t2.NUMERICIDENTIFIER]})`);
  createToken("MAINVERSIONLOOSE", `(${src[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src[t2.NUMERICIDENTIFIERLOOSE]})\\.(${src[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASEIDENTIFIER", `(?:${src[t2.NONNUMERICIDENTIFIER]}|${src[t2.NUMERICIDENTIFIER]})`);
  createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t2.NONNUMERICIDENTIFIER]}|${src[t2.NUMERICIDENTIFIERLOOSE]})`);
  createToken("PRERELEASE", `(?:-(${src[t2.PRERELEASEIDENTIFIER]}(?:\\.${src[t2.PRERELEASEIDENTIFIER]})*))`);
  createToken("PRERELEASELOOSE", `(?:-?(${src[t2.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t2.PRERELEASEIDENTIFIERLOOSE]})*))`);
  createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
  createToken("BUILD", `(?:\\+(${src[t2.BUILDIDENTIFIER]}(?:\\.${src[t2.BUILDIDENTIFIER]})*))`);
  createToken("FULLPLAIN", `v?${src[t2.MAINVERSION]}${src[t2.PRERELEASE]}?${src[t2.BUILD]}?`);
  createToken("FULL", `^${src[t2.FULLPLAIN]}$`);
  createToken("LOOSEPLAIN", `[v=\\s]*${src[t2.MAINVERSIONLOOSE]}${src[t2.PRERELEASELOOSE]}?${src[t2.BUILD]}?`);
  createToken("LOOSE", `^${src[t2.LOOSEPLAIN]}$`);
  createToken("GTLT", "((?:<|>)?=?)");
  createToken("XRANGEIDENTIFIERLOOSE", `${src[t2.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
  createToken("XRANGEIDENTIFIER", `${src[t2.NUMERICIDENTIFIER]}|x|X|\\*`);
  createToken("XRANGEPLAIN", `[v=\\s]*(${src[t2.XRANGEIDENTIFIER]})(?:\\.(${src[t2.XRANGEIDENTIFIER]})(?:\\.(${src[t2.XRANGEIDENTIFIER]})(?:${src[t2.PRERELEASE]})?${src[t2.BUILD]}?)?)?`);
  createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t2.XRANGEIDENTIFIERLOOSE]})(?:${src[t2.PRERELEASELOOSE]})?${src[t2.BUILD]}?)?)?`);
  createToken("XRANGE", `^${src[t2.GTLT]}\\s*${src[t2.XRANGEPLAIN]}$`);
  createToken("XRANGELOOSE", `^${src[t2.GTLT]}\\s*${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH2}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH2}}))?`);
  createToken("COERCE", `${src[t2.COERCEPLAIN]}(?:$|[^\\d])`);
  createToken("COERCEFULL", src[t2.COERCEPLAIN] + `(?:${src[t2.PRERELEASE]})?(?:${src[t2.BUILD]})?(?:$|[^\\d])`);
  createToken("COERCERTL", src[t2.COERCE], true);
  createToken("COERCERTLFULL", src[t2.COERCEFULL], true);
  createToken("LONETILDE", "(?:~>?)");
  createToken("TILDETRIM", `(\\s*)${src[t2.LONETILDE]}\\s+`, true);
  exports.tildeTrimReplace = "$1~";
  createToken("TILDE", `^${src[t2.LONETILDE]}${src[t2.XRANGEPLAIN]}$`);
  createToken("TILDELOOSE", `^${src[t2.LONETILDE]}${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("LONECARET", "(?:\\^)");
  createToken("CARETTRIM", `(\\s*)${src[t2.LONECARET]}\\s+`, true);
  exports.caretTrimReplace = "$1^";
  createToken("CARET", `^${src[t2.LONECARET]}${src[t2.XRANGEPLAIN]}$`);
  createToken("CARETLOOSE", `^${src[t2.LONECARET]}${src[t2.XRANGEPLAINLOOSE]}$`);
  createToken("COMPARATORLOOSE", `^${src[t2.GTLT]}\\s*(${src[t2.LOOSEPLAIN]})$|^$`);
  createToken("COMPARATOR", `^${src[t2.GTLT]}\\s*(${src[t2.FULLPLAIN]})$|^$`);
  createToken("COMPARATORTRIM", `(\\s*)${src[t2.GTLT]}\\s*(${src[t2.LOOSEPLAIN]}|${src[t2.XRANGEPLAIN]})`, true);
  exports.comparatorTrimReplace = "$1$2$3";
  createToken("HYPHENRANGE", `^\\s*(${src[t2.XRANGEPLAIN]})\\s+-\\s+(${src[t2.XRANGEPLAIN]})\\s*$`);
  createToken("HYPHENRANGELOOSE", `^\\s*(${src[t2.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t2.XRANGEPLAINLOOSE]})\\s*$`);
  createToken("STAR", "(<|>)?=?\\s*\\*");
  createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
  createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(re$2, re$2.exports);
var reExports = re$2.exports;
const looseOption = Object.freeze({ loose: true });
const emptyOpts = Object.freeze({});
const parseOptions$1 = (options) => {
  if (!options) {
    return emptyOpts;
  }
  if (typeof options !== "object") {
    return looseOption;
  }
  return options;
};
var parseOptions_1 = parseOptions$1;
const numeric = /^[0-9]+$/;
const compareIdentifiers$1 = (a, b) => {
  const anum = numeric.test(a);
  const bnum = numeric.test(b);
  if (anum && bnum) {
    a = +a;
    b = +b;
  }
  return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
};
const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);
var identifiers$1 = {
  compareIdentifiers: compareIdentifiers$1,
  rcompareIdentifiers
};
const debug = debug_1;
const { MAX_LENGTH, MAX_SAFE_INTEGER } = constants$1;
const { safeRe: re$1, t: t$1 } = reExports;
const parseOptions = parseOptions_1;
const { compareIdentifiers } = identifiers$1;
let SemVer$d = class SemVer {
  constructor(version, options) {
    options = parseOptions(options);
    if (version instanceof SemVer) {
      if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
        return version;
      } else {
        version = version.version;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
    } else if (typeof version !== "string") {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
    }
    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      );
    }
    debug("SemVer", version, options);
    this.options = options;
    this.loose = !!options.loose;
    this.includePrerelease = !!options.includePrerelease;
    const m = version.trim().match(options.loose ? re$1[t$1.LOOSE] : re$1[t$1.FULL]);
    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`);
    }
    this.raw = version;
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];
    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError("Invalid major version");
    }
    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError("Invalid minor version");
    }
    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError("Invalid patch version");
    }
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split(".").map((id2) => {
        if (/^[0-9]+$/.test(id2)) {
          const num = +id2;
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num;
          }
        }
        return id2;
      });
    }
    this.build = m[5] ? m[5].split(".") : [];
    this.format();
  }
  format() {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join(".")}`;
    }
    return this.version;
  }
  toString() {
    return this.version;
  }
  compare(other) {
    debug("SemVer.compare", this.version, this.options, other);
    if (!(other instanceof SemVer)) {
      if (typeof other === "string" && other === this.version) {
        return 0;
      }
      other = new SemVer(other, this.options);
    }
    if (other.version === this.version) {
      return 0;
    }
    return this.compareMain(other) || this.comparePre(other);
  }
  compareMain(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
  }
  comparePre(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    if (this.prerelease.length && !other.prerelease.length) {
      return -1;
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1;
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0;
    }
    let i = 0;
    do {
      const a = this.prerelease[i];
      const b = other.prerelease[i];
      debug("prerelease compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  compareBuild(other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options);
    }
    let i = 0;
    do {
      const a = this.build[i];
      const b = other.build[i];
      debug("build compare", i, a, b);
      if (a === void 0 && b === void 0) {
        return 0;
      } else if (b === void 0) {
        return 1;
      } else if (a === void 0) {
        return -1;
      } else if (a === b) {
        continue;
      } else {
        return compareIdentifiers(a, b);
      }
    } while (++i);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(release, identifier, identifierBase) {
    if (release.startsWith("pre")) {
      if (!identifier && identifierBase === false) {
        throw new Error("invalid increment argument: identifier is empty");
      }
      if (identifier) {
        const match = `-${identifier}`.match(this.options.loose ? re$1[t$1.PRERELEASELOOSE] : re$1[t$1.PRERELEASE]);
        if (!match || match[1] !== identifier) {
          throw new Error(`invalid identifier: ${identifier}`);
        }
      }
    }
    switch (release) {
      case "premajor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "preminor":
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc("pre", identifier, identifierBase);
        break;
      case "prepatch":
        this.prerelease.length = 0;
        this.inc("patch", identifier, identifierBase);
        this.inc("pre", identifier, identifierBase);
        break;
      case "prerelease":
        if (this.prerelease.length === 0) {
          this.inc("patch", identifier, identifierBase);
        }
        this.inc("pre", identifier, identifierBase);
        break;
      case "release":
        if (this.prerelease.length === 0) {
          throw new Error(`version ${this.raw} is not a prerelease`);
        }
        this.prerelease.length = 0;
        break;
      case "major":
        if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break;
      case "minor":
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break;
      case "patch":
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break;
      case "pre": {
        const base = Number(identifierBase) ? 1 : 0;
        if (this.prerelease.length === 0) {
          this.prerelease = [base];
        } else {
          let i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === "number") {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1) {
            if (identifier === this.prerelease.join(".") && identifierBase === false) {
              throw new Error("invalid increment argument: identifier already exists");
            }
            this.prerelease.push(base);
          }
        }
        if (identifier) {
          let prerelease2 = [identifier, base];
          if (identifierBase === false) {
            prerelease2 = [identifier];
          }
          if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = prerelease2;
            }
          } else {
            this.prerelease = prerelease2;
          }
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${release}`);
    }
    this.raw = this.format();
    if (this.build.length) {
      this.raw += `+${this.build.join(".")}`;
    }
    return this;
  }
};
<<<<<<< HEAD
var semver$2 = SemVer$d;
const SemVer$c = semver$2;
const parse$6 = (version, options, throwErrors = false) => {
  if (version instanceof SemVer$c) {
    return version;
  }
  try {
    return new SemVer$c(version, options);
  } catch (er) {
    if (!throwErrors) {
=======
var ze = Cv;
const hc = ze, Dv = (e, t, r = !1) => {
  if (e instanceof hc)
    return e;
  try {
    return new hc(e, t);
  } catch (n) {
    if (!r)
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      return null;
    }
    throw er;
  }
};
<<<<<<< HEAD
var parse_1 = parse$6;
const parse$5 = parse_1;
const valid$2 = (version, options) => {
  const v = parse$5(version, options);
  return v ? v.version : null;
};
var valid_1 = valid$2;
const parse$4 = parse_1;
const clean$1 = (version, options) => {
  const s = parse$4(version.trim().replace(/^[=v]+/, ""), options);
  return s ? s.version : null;
};
var clean_1 = clean$1;
const SemVer$b = semver$2;
const inc$1 = (version, release, options, identifier, identifierBase) => {
  if (typeof options === "string") {
    identifierBase = identifier;
    identifier = options;
    options = void 0;
  }
  try {
    return new SemVer$b(
      version instanceof SemVer$b ? version.version : version,
      options
    ).inc(release, identifier, identifierBase).version;
  } catch (er) {
    return null;
  }
};
var inc_1 = inc$1;
const parse$3 = parse_1;
const diff$1 = (version1, version2) => {
  const v1 = parse$3(version1, null, true);
  const v2 = parse$3(version2, null, true);
  const comparison = v1.compare(v2);
  if (comparison === 0) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    return null;
  }
  const v1Higher = comparison > 0;
  const highVersion = v1Higher ? v1 : v2;
  const lowVersion = v1Higher ? v2 : v1;
  const highHasPre = !!highVersion.prerelease.length;
  const lowHasPre = !!lowVersion.prerelease.length;
  if (lowHasPre && !highHasPre) {
    if (!lowVersion.patch && !lowVersion.minor) {
      return "major";
    }
    if (lowVersion.compareMain(highVersion) === 0) {
      if (lowVersion.minor && !lowVersion.patch) {
        return "minor";
      }
      return "patch";
    }
  }
  const prefix = highHasPre ? "pre" : "";
  if (v1.major !== v2.major) {
    return prefix + "major";
  }
  if (v1.minor !== v2.minor) {
    return prefix + "minor";
  }
  if (v1.patch !== v2.patch) {
    return prefix + "patch";
  }
  return "prerelease";
};
<<<<<<< HEAD
var diff_1 = diff$1;
const SemVer$a = semver$2;
const major$1 = (a, loose) => new SemVer$a(a, loose).major;
var major_1 = major$1;
const SemVer$9 = semver$2;
const minor$1 = (a, loose) => new SemVer$9(a, loose).minor;
var minor_1 = minor$1;
const SemVer$8 = semver$2;
const patch$1 = (a, loose) => new SemVer$8(a, loose).patch;
var patch_1 = patch$1;
const parse$2 = parse_1;
const prerelease$1 = (version, options) => {
  const parsed = parse$2(version, options);
  return parsed && parsed.prerelease.length ? parsed.prerelease : null;
};
var prerelease_1 = prerelease$1;
const SemVer$7 = semver$2;
const compare$b = (a, b, loose) => new SemVer$7(a, loose).compare(new SemVer$7(b, loose));
var compare_1 = compare$b;
const compare$a = compare_1;
const rcompare$1 = (a, b, loose) => compare$a(b, a, loose);
var rcompare_1 = rcompare$1;
const compare$9 = compare_1;
const compareLoose$1 = (a, b) => compare$9(a, b, true);
var compareLoose_1 = compareLoose$1;
const SemVer$6 = semver$2;
const compareBuild$3 = (a, b, loose) => {
  const versionA = new SemVer$6(a, loose);
  const versionB = new SemVer$6(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB);
};
var compareBuild_1 = compareBuild$3;
const compareBuild$2 = compareBuild_1;
const sort$1 = (list, loose) => list.sort((a, b) => compareBuild$2(a, b, loose));
var sort_1 = sort$1;
const compareBuild$1 = compareBuild_1;
const rsort$1 = (list, loose) => list.sort((a, b) => compareBuild$1(b, a, loose));
var rsort_1 = rsort$1;
const compare$8 = compare_1;
const gt$4 = (a, b, loose) => compare$8(a, b, loose) > 0;
var gt_1 = gt$4;
const compare$7 = compare_1;
const lt$3 = (a, b, loose) => compare$7(a, b, loose) < 0;
var lt_1 = lt$3;
const compare$6 = compare_1;
const eq$2 = (a, b, loose) => compare$6(a, b, loose) === 0;
var eq_1 = eq$2;
const compare$5 = compare_1;
const neq$2 = (a, b, loose) => compare$5(a, b, loose) !== 0;
var neq_1 = neq$2;
const compare$4 = compare_1;
const gte$3 = (a, b, loose) => compare$4(a, b, loose) >= 0;
var gte_1 = gte$3;
const compare$3 = compare_1;
const lte$3 = (a, b, loose) => compare$3(a, b, loose) <= 0;
var lte_1 = lte$3;
const eq$1 = eq_1;
const neq$1 = neq_1;
const gt$3 = gt_1;
const gte$2 = gte_1;
const lt$2 = lt_1;
const lte$2 = lte_1;
const cmp$1 = (a, op, b, loose) => {
  switch (op) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    case "===":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a === b;
    case "!==":
      if (typeof a === "object") {
        a = a.version;
      }
      if (typeof b === "object") {
        b = b.version;
      }
      return a !== b;
    case "":
    case "=":
    case "==":
<<<<<<< HEAD
      return eq$1(a, b, loose);
    case "!=":
      return neq$1(a, b, loose);
    case ">":
      return gt$3(a, b, loose);
    case ">=":
      return gte$2(a, b, loose);
    case "<":
      return lt$2(a, b, loose);
    case "<=":
      return lte$2(a, b, loose);
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    default:
      throw new TypeError(`Invalid operator: ${op}`);
  }
};
<<<<<<< HEAD
var cmp_1 = cmp$1;
const SemVer$5 = semver$2;
const parse$1 = parse_1;
const { safeRe: re, t } = reExports;
const coerce$1 = (version, options) => {
  if (version instanceof SemVer$5) {
    return version;
  }
  if (typeof version === "number") {
    version = String(version);
  }
  if (typeof version !== "string") {
=======
var vu = Mw;
const Lw = ze, Vw = Nr, { safeRe: bn, t: Sn } = nn, Fw = (e, t) => {
  if (e instanceof Lw)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    return null;
  }
<<<<<<< HEAD
  options = options || {};
  let match = null;
  if (!options.rtl) {
    match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
  } else {
    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
    let next2;
    while ((next2 = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
      if (!match || next2.index + next2[0].length !== match.index + match[0].length) {
        match = next2;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
      coerceRtlRegex.lastIndex = next2.index + next2[1].length + next2[2].length;
    }
    coerceRtlRegex.lastIndex = -1;
  }
  if (match === null) {
    return null;
  }
  const major2 = match[2];
  const minor2 = match[3] || "0";
  const patch2 = match[4] || "0";
  const prerelease2 = options.includePrerelease && match[5] ? `-${match[5]}` : "";
  const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
  return parse$1(`${major2}.${minor2}.${patch2}${prerelease2}${build}`, options);
};
var coerce_1 = coerce$1;
class LRUCache {
  constructor() {
    this.max = 1e3;
    this.map = /* @__PURE__ */ new Map();
  }
  get(key) {
    const value = this.map.get(key);
    if (value === void 0) {
      return void 0;
    } else {
      this.map.delete(key);
      this.map.set(key, value);
      return value;
    }
  }
  delete(key) {
    return this.map.delete(key);
  }
  set(key, value) {
    const deleted = this.delete(key);
    if (!deleted && value !== void 0) {
      if (this.map.size >= this.max) {
        const firstKey = this.map.keys().next().value;
        this.delete(firstKey);
      }
      this.map.set(key, value);
    }
    return this;
  }
}
<<<<<<< HEAD
var lrucache = LRUCache;
var range;
var hasRequiredRange;
function requireRange() {
  if (hasRequiredRange) return range;
  hasRequiredRange = 1;
  const SPACE_CHARACTERS = /\s+/g;
  class Range2 {
    constructor(range2, options) {
      options = parseOptions2(options);
      if (range2 instanceof Range2) {
        if (range2.loose === !!options.loose && range2.includePrerelease === !!options.includePrerelease) {
          return range2;
        } else {
          return new Range2(range2.raw, options);
        }
      }
      if (range2 instanceof Comparator2) {
        this.raw = range2.value;
        this.set = [[range2]];
        this.formatted = void 0;
        return this;
      }
      this.options = options;
      this.loose = !!options.loose;
      this.includePrerelease = !!options.includePrerelease;
      this.raw = range2.trim().replace(SPACE_CHARACTERS, " ");
      this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
      if (!this.set.length) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      }
      if (this.set.length > 1) {
        const first = this.set[0];
        this.set = this.set.filter((c) => !isNullSet(c[0]));
        if (this.set.length === 0) {
          this.set = [first];
        } else if (this.set.length > 1) {
          for (const c of this.set) {
            if (c.length === 1 && isAny(c[0])) {
              this.set = [c];
              break;
            }
          }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let i = 0; i < this.set.length; i++) {
          if (i > 0) {
            this.formatted += "||";
          }
          const comps = this.set[i];
          for (let k = 0; k < comps.length; k++) {
            if (k > 0) {
              this.formatted += " ";
            }
            this.formatted += comps[k].toString().trim();
          }
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
    parseRange(range2) {
      const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
      const memoKey = memoOpts + ":" + range2;
      const cached = cache.get(memoKey);
      if (cached) {
        return cached;
      }
      const loose = this.options.loose;
      const hr = loose ? re2[t2.HYPHENRANGELOOSE] : re2[t2.HYPHENRANGE];
      range2 = range2.replace(hr, hyphenReplace(this.options.includePrerelease));
      debug2("hyphen replace", range2);
      range2 = range2.replace(re2[t2.COMPARATORTRIM], comparatorTrimReplace);
      debug2("comparator trim", range2);
      range2 = range2.replace(re2[t2.TILDETRIM], tildeTrimReplace);
      debug2("tilde trim", range2);
      range2 = range2.replace(re2[t2.CARETTRIM], caretTrimReplace);
      debug2("caret trim", range2);
      let rangeList = range2.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
      if (loose) {
        rangeList = rangeList.filter((comp) => {
          debug2("loose invalid filter", comp, this.options);
          return !!comp.match(re2[t2.COMPARATORLOOSE]);
        });
      }
      debug2("range list", rangeList);
      const rangeMap = /* @__PURE__ */ new Map();
      const comparators = rangeList.map((comp) => new Comparator2(comp, this.options));
      for (const comp of comparators) {
        if (isNullSet(comp)) {
          return [comp];
        }
        rangeMap.set(comp.value, comp);
      }
      if (rangeMap.size > 1 && rangeMap.has("")) {
        rangeMap.delete("");
      }
      const result = [...rangeMap.values()];
      cache.set(memoKey, result);
      return result;
    }
    intersects(range2, options) {
      if (!(range2 instanceof Range2)) {
        throw new TypeError("a Range is required");
      }
      return this.set.some((thisComparators) => {
        return isSatisfiable(thisComparators, options) && range2.set.some((rangeComparators) => {
          return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
            return rangeComparators.every((rangeComparator) => {
              return thisComparator.intersects(rangeComparator, options);
            });
          });
        });
      });
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(version) {
      if (!version) {
        return false;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer3(version, this.options);
        } catch (er) {
          return false;
        }
      }
      for (let i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version, this.options)) {
          return true;
        }
      }
      return false;
    }
  }
<<<<<<< HEAD
  range = Range2;
  const LRU = lrucache;
  const cache = new LRU();
  const parseOptions2 = parseOptions_1;
  const Comparator2 = requireComparator();
  const debug2 = debug_1;
  const SemVer3 = semver$2;
  const {
    safeRe: re2,
    t: t2,
    comparatorTrimReplace,
    tildeTrimReplace,
    caretTrimReplace
  } = reExports;
  const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = constants$1;
  const isNullSet = (c) => c.value === "<0.0.0-0";
  const isAny = (c) => c.value === "";
  const isSatisfiable = (comparators, options) => {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while (result && remainingComparators.length) {
      result = remainingComparators.every((otherComparator) => {
        return testComparator.intersects(otherComparator, options);
      });
      testComparator = remainingComparators.pop();
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    return result;
  };
<<<<<<< HEAD
  const parseComparator = (comp, options) => {
    debug2("comp", comp, options);
    comp = replaceCarets(comp, options);
    debug2("caret", comp);
    comp = replaceTildes(comp, options);
    debug2("tildes", comp);
    comp = replaceXRanges(comp, options);
    debug2("xrange", comp);
    comp = replaceStars(comp, options);
    debug2("stars", comp);
    return comp;
  };
  const isX = (id2) => !id2 || id2.toLowerCase() === "x" || id2 === "*";
  const replaceTildes = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
  };
  const replaceTilde = (comp, options) => {
    const r = options.loose ? re2[t2.TILDELOOSE] : re2[t2.TILDE];
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("tilde", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
      } else if (pr) {
        debug2("replaceTilde pr", pr);
        ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      }
      debug2("tilde return", ret);
      return ret;
    });
  };
  const replaceCarets = (comp, options) => {
    return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
  };
  const replaceCaret = (comp, options) => {
    debug2("caret", comp, options);
    const r = options.loose ? re2[t2.CARETLOOSE] : re2[t2.CARET];
    const z = options.includePrerelease ? "-0" : "";
    return comp.replace(r, (_, M, m, p, pr) => {
      debug2("caret", comp, _, M, m, p, pr);
      let ret;
      if (isX(M)) {
        ret = "";
      } else if (isX(m)) {
        ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
      } else if (isX(p)) {
        if (M === "0") {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
        }
      } else if (pr) {
        debug2("replaceCaret pr", pr);
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
        }
      } else {
        debug2("no pr");
        if (M === "0") {
          if (m === "0") {
            ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
          } else {
            ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
          }
        } else {
          ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
        }
      }
      debug2("caret return", ret);
      return ret;
    });
  };
  const replaceXRanges = (comp, options) => {
    debug2("replaceXRanges", comp, options);
    return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
  };
  const replaceXRange = (comp, options) => {
    comp = comp.trim();
    const r = options.loose ? re2[t2.XRANGELOOSE] : re2[t2.XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
      debug2("xRange", comp, ret, gtlt, M, m, p, pr);
      const xM = isX(M);
      const xm = xM || isX(m);
      const xp = xm || isX(p);
      const anyX = xp;
      if (gtlt === "=" && anyX) {
        gtlt = "";
      }
      pr = options.includePrerelease ? "-0" : "";
      if (xM) {
        if (gtlt === ">" || gtlt === "<") {
          ret = "<0.0.0-0";
        } else {
          ret = "*";
        }
      } else if (gtlt && anyX) {
        if (xm) {
          m = 0;
        }
        p = 0;
        if (gtlt === ">") {
          gtlt = ">=";
          if (xm) {
            M = +M + 1;
            m = 0;
            p = 0;
          } else {
            m = +m + 1;
            p = 0;
          }
        } else if (gtlt === "<=") {
          gtlt = "<";
          if (xm) {
            M = +M + 1;
          } else {
            m = +m + 1;
          }
        }
        if (gtlt === "<") {
          pr = "-0";
        }
        ret = `${gtlt + M}.${m}.${p}${pr}`;
      } else if (xm) {
        ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
      } else if (xp) {
        ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
      }
      debug2("xRange return", ret);
      return ret;
    });
  };
  const replaceStars = (comp, options) => {
    debug2("replaceStars", comp, options);
    return comp.trim().replace(re2[t2.STAR], "");
  };
  const replaceGTE0 = (comp, options) => {
    debug2("replaceGTE0", comp, options);
    return comp.trim().replace(re2[options.includePrerelease ? t2.GTE0PRE : t2.GTE0], "");
  };
  const hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
    if (isX(fM)) {
      from = "";
    } else if (isX(fm)) {
      from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
    } else if (isX(fp)) {
      from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
    } else if (fpr) {
      from = `>=${from}`;
    } else {
      from = `>=${from}${incPr ? "-0" : ""}`;
    }
    if (isX(tM)) {
      to = "";
    } else if (isX(tm)) {
      to = `<${+tM + 1}.0.0-0`;
    } else if (isX(tp)) {
      to = `<${tM}.${+tm + 1}.0-0`;
    } else if (tpr) {
      to = `<=${tM}.${tm}.${tp}-${tpr}`;
    } else if (incPr) {
      to = `<${tM}.${tm}.${+tp + 1}-0`;
    } else {
      to = `<=${to}`;
    }
    return `${from} ${to}`.trim();
  };
  const testSet = (set, version, options) => {
    for (let i = 0; i < set.length; i++) {
      if (!set[i].test(version)) {
        return false;
      }
    }
    if (version.prerelease.length && !options.includePrerelease) {
      for (let i = 0; i < set.length; i++) {
        debug2(set[i].semver);
        if (set[i].semver === Comparator2.ANY) {
          continue;
        }
        if (set[i].semver.prerelease.length > 0) {
          const allowed = set[i].semver;
          if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
            return true;
          }
        }
      }
      return false;
    }
    return true;
  };
  return range;
}
var comparator;
var hasRequiredComparator;
function requireComparator() {
  if (hasRequiredComparator) return comparator;
  hasRequiredComparator = 1;
  const ANY2 = Symbol("SemVer ANY");
  class Comparator2 {
    static get ANY() {
      return ANY2;
    }
    constructor(comp, options) {
      options = parseOptions2(options);
      if (comp instanceof Comparator2) {
        if (comp.loose === !!options.loose) {
          return comp;
        } else {
          comp = comp.value;
        }
      }
      comp = comp.trim().split(/\s+/).join(" ");
      debug2("comparator", comp, options);
      this.options = options;
      this.loose = !!options.loose;
      this.parse(comp);
      if (this.semver === ANY2) {
        this.value = "";
      } else {
        this.value = this.operator + this.semver.version;
      }
      debug2("comp", this);
    }
    parse(comp) {
      const r = this.options.loose ? re2[t2.COMPARATORLOOSE] : re2[t2.COMPARATOR];
      const m = comp.match(r);
      if (!m) {
        throw new TypeError(`Invalid comparator: ${comp}`);
      }
      this.operator = m[1] !== void 0 ? m[1] : "";
      if (this.operator === "=") {
        this.operator = "";
      }
      if (!m[2]) {
        this.semver = ANY2;
      } else {
        this.semver = new SemVer3(m[2], this.options.loose);
      }
    }
    toString() {
      return this.value;
    }
    test(version) {
      debug2("Comparator.test", version, this.options.loose);
      if (this.semver === ANY2 || version === ANY2) {
        return true;
      }
      if (typeof version === "string") {
        try {
          version = new SemVer3(version, this.options);
        } catch (er) {
          return false;
        }
      }
      return cmp2(version, this.operator, this.semver, this.options);
    }
    intersects(comp, options) {
      if (!(comp instanceof Comparator2)) {
        throw new TypeError("a Comparator is required");
      }
      if (this.operator === "") {
        if (this.value === "") {
          return true;
        }
        return new Range2(comp.value, options).test(this.value);
      } else if (comp.operator === "") {
        if (comp.value === "") {
          return true;
        }
        return new Range2(this.value, options).test(comp.semver);
      }
      options = parseOptions2(options);
      if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
        return false;
      }
      if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
        return false;
      }
      if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
        return true;
      }
      if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
        return true;
      }
      if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
        return true;
      }
      if (cmp2(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
        return true;
      }
      if (cmp2(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
        return true;
      }
      return false;
    }
  }
<<<<<<< HEAD
  comparator = Comparator2;
  const parseOptions2 = parseOptions_1;
  const { safeRe: re2, t: t2 } = reExports;
  const cmp2 = cmp_1;
  const debug2 = debug_1;
  const SemVer3 = semver$2;
  const Range2 = requireRange();
  return comparator;
}
const Range$9 = requireRange();
const satisfies$4 = (version, range2, options) => {
  try {
    range2 = new Range$9(range2, options);
  } catch (er) {
    return false;
=======
  Ts = t;
  const r = Yo, { safeRe: n, t: s } = nn, a = vu, o = hs, c = ze, l = at();
  return Ts;
}
const Gw = at(), Kw = (e, t, r) => {
  try {
    t = new Gw(t, r);
  } catch {
    return !1;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  return range2.test(version);
};
<<<<<<< HEAD
var satisfies_1 = satisfies$4;
const Range$8 = requireRange();
const toComparators$1 = (range2, options) => new Range$8(range2, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
var toComparators_1 = toComparators$1;
const SemVer$4 = semver$2;
const Range$7 = requireRange();
const maxSatisfying$1 = (versions, range2, options) => {
  let max = null;
  let maxSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$7(range2, options);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!max || maxSV.compare(v) === -1) {
        max = v;
        maxSV = new SemVer$4(max, options);
      }
    }
  });
  return max;
};
var maxSatisfying_1 = maxSatisfying$1;
const SemVer$3 = semver$2;
const Range$6 = requireRange();
const minSatisfying$1 = (versions, range2, options) => {
  let min = null;
  let minSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$6(range2, options);
  } catch (er) {
    return null;
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      if (!min || minSV.compare(v) === 1) {
        min = v;
        minSV = new SemVer$3(min, options);
      }
    }
  });
  return min;
};
var minSatisfying_1 = minSatisfying$1;
const SemVer$2 = semver$2;
const Range$5 = requireRange();
const gt$2 = gt_1;
const minVersion$1 = (range2, loose) => {
  range2 = new Range$5(range2, loose);
  let minver = new SemVer$2("0.0.0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = new SemVer$2("0.0.0-0");
  if (range2.test(minver)) {
    return minver;
  }
  minver = null;
  for (let i = 0; i < range2.set.length; ++i) {
    const comparators = range2.set[i];
    let setMin = null;
    comparators.forEach((comparator2) => {
      const compver = new SemVer$2(comparator2.semver.version);
      switch (comparator2.operator) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        case ">":
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
        case "":
        case ">=":
<<<<<<< HEAD
          if (!setMin || gt$2(compver, setMin)) {
            setMin = compver;
          }
=======
          (!a || vc(c, a)) && (a = c);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${comparator2.operator}`);
      }
<<<<<<< HEAD
    });
    if (setMin && (!minver || gt$2(minver, setMin))) {
      minver = setMin;
    }
=======
    }), a && (!r || vc(r, a)) && (r = a);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  if (minver && range2.test(minver)) {
    return minver;
  }
  return null;
};
<<<<<<< HEAD
var minVersion_1 = minVersion$1;
const Range$4 = requireRange();
const validRange$1 = (range2, options) => {
  try {
    return new Range$4(range2, options).range || "*";
  } catch (er) {
    return null;
  }
};
var valid$1 = validRange$1;
const SemVer$1 = semver$2;
const Comparator$2 = requireComparator();
const { ANY: ANY$1 } = Comparator$2;
const Range$3 = requireRange();
const satisfies$3 = satisfies_1;
const gt$1 = gt_1;
const lt$1 = lt_1;
const lte$1 = lte_1;
const gte$1 = gte_1;
const outside$3 = (version, range2, hilo, options) => {
  version = new SemVer$1(version, options);
  range2 = new Range$3(range2, options);
  let gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case ">":
      gtfn = gt$1;
      ltefn = lte$1;
      ltfn = lt$1;
      comp = ">";
      ecomp = ">=";
      break;
    case "<":
      gtfn = lt$1;
      ltefn = gte$1;
      ltfn = gt$1;
      comp = "<";
      ecomp = "<=";
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
<<<<<<< HEAD
  if (satisfies$3(version, range2, options)) {
    return false;
  }
  for (let i = 0; i < range2.set.length; ++i) {
    const comparators = range2.set[i];
    let high = null;
    let low = null;
    comparators.forEach((comparator2) => {
      if (comparator2.semver === ANY$1) {
        comparator2 = new Comparator$2(">=0.0.0");
      }
      high = high || comparator2;
      low = low || comparator2;
      if (gtfn(comparator2.semver, high.semver, options)) {
        high = comparator2;
      } else if (ltfn(comparator2.semver, low.semver, options)) {
        low = comparator2;
      }
    });
    if (high.operator === comp || high.operator === ecomp) {
      return false;
    }
    if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
  }
<<<<<<< HEAD
  return true;
};
var outside_1 = outside$3;
const outside$2 = outside_1;
const gtr$1 = (version, range2, options) => outside$2(version, range2, ">", options);
var gtr_1 = gtr$1;
const outside$1 = outside_1;
const ltr$1 = (version, range2, options) => outside$1(version, range2, "<", options);
var ltr_1 = ltr$1;
const Range$2 = requireRange();
const intersects$1 = (r1, r2, options) => {
  r1 = new Range$2(r1, options);
  r2 = new Range$2(r2, options);
  return r1.intersects(r2, options);
};
var intersects_1 = intersects$1;
const satisfies$2 = satisfies_1;
const compare$2 = compare_1;
var simplify = (versions, range2, options) => {
  const set = [];
  let first = null;
  let prev = null;
  const v = versions.sort((a, b) => compare$2(a, b, options));
  for (const version of v) {
    const included = satisfies$2(version, range2, options);
    if (included) {
      prev = version;
      if (!first) {
        first = version;
      }
    } else {
      if (prev) {
        set.push([first, prev]);
      }
      prev = null;
      first = null;
    }
  }
  if (first) {
    set.push([first, null]);
  }
  const ranges = [];
  for (const [min, max] of set) {
    if (min === max) {
      ranges.push(min);
    } else if (!max && min === v[0]) {
      ranges.push("*");
    } else if (!max) {
      ranges.push(`>=${min}`);
    } else if (min === v[0]) {
      ranges.push(`<=${max}`);
    } else {
      ranges.push(`${min} - ${max}`);
    }
  }
  const simplified = ranges.join(" || ");
  const original = typeof range2.raw === "string" ? range2.raw : String(range2);
  return simplified.length < original.length ? simplified : range2;
};
const Range$1 = requireRange();
const Comparator$1 = requireComparator();
const { ANY } = Comparator$1;
const satisfies$1 = satisfies_1;
const compare$1 = compare_1;
const subset$1 = (sub, dom, options = {}) => {
  if (sub === dom) {
    return true;
  }
  sub = new Range$1(sub, options);
  dom = new Range$1(dom, options);
  let sawNonNull = false;
  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options);
      sawNonNull = sawNonNull || isSub !== null;
      if (isSub) {
        continue OUTER;
      }
    }
    if (sawNonNull) {
      return false;
    }
  }
  return true;
};
const minimumVersionWithPreRelease = [new Comparator$1(">=0.0.0-0")];
const minimumVersion = [new Comparator$1(">=0.0.0")];
const simpleSubset = (sub, dom, options) => {
  if (sub === dom) {
    return true;
  }
  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY) {
      return true;
    } else if (options.includePrerelease) {
      sub = minimumVersionWithPreRelease;
    } else {
      sub = minimumVersion;
    }
  }
  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options.includePrerelease) {
      return true;
    } else {
      dom = minimumVersion;
    }
  }
  const eqSet = /* @__PURE__ */ new Set();
  let gt2, lt2;
  for (const c of sub) {
    if (c.operator === ">" || c.operator === ">=") {
      gt2 = higherGT(gt2, c, options);
    } else if (c.operator === "<" || c.operator === "<=") {
      lt2 = lowerLT(lt2, c, options);
    } else {
      eqSet.add(c.semver);
    }
  }
  if (eqSet.size > 1) {
    return null;
  }
  let gtltComp;
  if (gt2 && lt2) {
    gtltComp = compare$1(gt2.semver, lt2.semver, options);
    if (gtltComp > 0) {
      return null;
    } else if (gtltComp === 0 && (gt2.operator !== ">=" || lt2.operator !== "<=")) {
      return null;
    }
  }
  for (const eq2 of eqSet) {
    if (gt2 && !satisfies$1(eq2, String(gt2), options)) {
      return null;
    }
    if (lt2 && !satisfies$1(eq2, String(lt2), options)) {
      return null;
    }
    for (const c of dom) {
      if (!satisfies$1(eq2, String(c), options)) {
        return false;
      }
    }
    return true;
  }
  let higher, lower;
  let hasDomLT, hasDomGT;
  let needDomLTPre = lt2 && !options.includePrerelease && lt2.semver.prerelease.length ? lt2.semver : false;
  let needDomGTPre = gt2 && !options.includePrerelease && gt2.semver.prerelease.length ? gt2.semver : false;
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt2.operator === "<" && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false;
  }
  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
    hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
    if (gt2) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false;
        }
      }
      if (c.operator === ">" || c.operator === ">=") {
        higher = higherGT(gt2, c, options);
        if (higher === c && higher !== gt2) {
          return false;
        }
      } else if (gt2.operator === ">=" && !satisfies$1(gt2.semver, String(c), options)) {
        return false;
      }
    }
    if (lt2) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false;
        }
      }
      if (c.operator === "<" || c.operator === "<=") {
        lower = lowerLT(lt2, c, options);
        if (lower === c && lower !== lt2) {
          return false;
        }
      } else if (lt2.operator === "<=" && !satisfies$1(lt2.semver, String(c), options)) {
        return false;
      }
    }
    if (!c.operator && (lt2 || gt2) && gtltComp !== 0) {
      return false;
    }
  }
  if (gt2 && hasDomLT && !lt2 && gtltComp !== 0) {
    return false;
  }
  if (lt2 && hasDomGT && !gt2 && gtltComp !== 0) {
    return false;
  }
  if (needDomGTPre || needDomLTPre) {
    return false;
  }
  return true;
};
const higherGT = (a, b, options) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options);
  return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
};
const lowerLT = (a, b, options) => {
  if (!a) {
    return b;
  }
  const comp = compare$1(a.semver, b.semver, options);
  return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
};
var subset_1 = subset$1;
const internalRe = reExports;
const constants = constants$1;
const SemVer2 = semver$2;
const identifiers = identifiers$1;
const parse = parse_1;
const valid = valid_1;
const clean = clean_1;
const inc = inc_1;
const diff = diff_1;
const major = major_1;
const minor = minor_1;
const patch = patch_1;
const prerelease = prerelease_1;
const compare = compare_1;
const rcompare = rcompare_1;
const compareLoose = compareLoose_1;
const compareBuild = compareBuild_1;
const sort = sort_1;
const rsort = rsort_1;
const gt = gt_1;
const lt = lt_1;
const eq = eq_1;
const neq = neq_1;
const gte = gte_1;
const lte = lte_1;
const cmp = cmp_1;
const coerce = coerce_1;
const Comparator = requireComparator();
const Range = requireRange();
const satisfies = satisfies_1;
const toComparators = toComparators_1;
const maxSatisfying = maxSatisfying_1;
const minSatisfying = minSatisfying_1;
const minVersion = minVersion_1;
const validRange = valid$1;
const outside = outside_1;
const gtr = gtr_1;
const ltr = ltr_1;
const intersects = intersects_1;
const simplifyRange = simplify;
const subset = subset_1;
var semver = {
  parse,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
  SemVer: SemVer2,
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: constants.RELEASE_TYPES,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers
};
const semver$1 = /* @__PURE__ */ getDefaultExportFromCjs(semver);
const objectToString = Object.prototype.toString;
const uint8ArrayStringified = "[object Uint8Array]";
const arrayBufferStringified = "[object ArrayBuffer]";
function isType(value, typeConstructor, typeStringified) {
  if (!value) {
    return false;
  }
  if (value.constructor === typeConstructor) {
    return true;
  }
  return objectToString.call(value) === typeStringified;
}
function isUint8Array(value) {
  return isType(value, Uint8Array, uint8ArrayStringified);
}
function isArrayBuffer(value) {
  return isType(value, ArrayBuffer, arrayBufferStringified);
}
function isUint8ArrayOrArrayBuffer(value) {
  return isUint8Array(value) || isArrayBuffer(value);
}
function assertUint8Array(value) {
  if (!isUint8Array(value)) {
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
  }
}
function assertUint8ArrayOrArrayBuffer(value) {
  if (!isUint8ArrayOrArrayBuffer(value)) {
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof value}\``);
  }
}
function concatUint8Arrays(arrays, totalLength) {
  if (arrays.length === 0) {
    return new Uint8Array(0);
  }
  totalLength ?? (totalLength = arrays.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0));
  const returnValue = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    assertUint8Array(array);
    returnValue.set(array, offset);
    offset += array.length;
  }
  return returnValue;
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
}
const cachedDecoders = {
  utf8: new globalThis.TextDecoder("utf8")
};
<<<<<<< HEAD
function uint8ArrayToString(array, encoding = "utf8") {
  assertUint8ArrayOrArrayBuffer(array);
  cachedDecoders[encoding] ?? (cachedDecoders[encoding] = new globalThis.TextDecoder(encoding));
  return cachedDecoders[encoding].decode(array);
}
function assertString(value) {
  if (typeof value !== "string") {
    throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
  }
}
const cachedEncoder = new globalThis.TextEncoder();
function stringToUint8Array(string) {
  assertString(string);
  return cachedEncoder.encode(string);
}
Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));
const ajvFormats = ajvFormatsModule.default;
const encryptionAlgorithm = "aes-256-cbc";
const createPlainObject = () => /* @__PURE__ */ Object.create(null);
const isExist = (data) => data !== void 0 && data !== null;
const checkValueType = (key, value) => {
  const nonJsonTypes = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]);
  const type2 = typeof value;
  if (nonJsonTypes.has(type2)) {
    throw new TypeError(`Setting a value of type \`${type2}\` for key \`${key}\` is not allowed as it's not supported by JSON`);
  }
};
const INTERNAL_KEY = "__internal__";
const MIGRATION_KEY = `${INTERNAL_KEY}.migrations.version`;
class Conf {
  constructor(partialOptions = {}) {
    __publicField(this, "path");
    __publicField(this, "events");
    __privateAdd(this, _validator);
    __privateAdd(this, _encryptionKey);
    __privateAdd(this, _options);
    __privateAdd(this, _defaultValues, {});
    __publicField(this, "_deserialize", (value) => JSON.parse(value));
    __publicField(this, "_serialize", (value) => JSON.stringify(value, void 0, "	"));
    const options = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: false,
      accessPropertiesByDotNotation: true,
      configFileMode: 438,
      ...partialOptions
    };
    if (!options.cwd) {
      if (!options.projectName) {
        throw new Error("Please specify the `projectName` option.");
<<<<<<< HEAD
      }
      options.cwd = envPaths(options.projectName, { suffix: options.projectSuffix }).config;
    }
    __privateSet(this, _options, options);
    if (options.schema ?? options.ajvOptions ?? options.rootSchema) {
      if (options.schema && typeof options.schema !== "object") {
        throw new TypeError("The `schema` option must be an object.");
      }
      const ajv2 = new _2020Exports.Ajv2020({
        allErrors: true,
        useDefaults: true,
        ...options.ajvOptions
      });
      ajvFormats(ajv2);
      const schema = {
        ...options.rootSchema,
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        type: "object",
        properties: options.schema
      };
<<<<<<< HEAD
      __privateSet(this, _validator, ajv2.compile(schema));
      for (const [key, value] of Object.entries(options.schema ?? {})) {
        if (value == null ? void 0 : value.default) {
          __privateGet(this, _defaultValues)[key] = value.default;
        }
      }
    }
    if (options.defaults) {
      __privateSet(this, _defaultValues, {
        ...__privateGet(this, _defaultValues),
        ...options.defaults
      });
    }
    if (options.serialize) {
      this._serialize = options.serialize;
    }
    if (options.deserialize) {
      this._deserialize = options.deserialize;
    }
    this.events = new EventTarget();
    __privateSet(this, _encryptionKey, options.encryptionKey);
    const fileExtension = options.fileExtension ? `.${options.fileExtension}` : "";
    this.path = path$1.resolve(options.cwd, `${options.configName ?? "config"}${fileExtension}`);
    const fileStore = this.store;
    const store2 = Object.assign(createPlainObject(), options.defaults, fileStore);
    if (options.migrations) {
      if (!options.projectVersion) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
        throw new Error("Please specify the `projectVersion` option.");
      }
      this._migrate(options.migrations, options.projectVersion, options.beforeEachMigration);
    }
    this._validate(store2);
    try {
<<<<<<< HEAD
      assert.deepEqual(fileStore, store2);
=======
      Iu.deepEqual(s, a);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    } catch {
      this.store = store2;
    }
    if (options.watch) {
      this._watch();
    }
  }
  get(key, defaultValue) {
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      return this._get(key, defaultValue);
    }
    const { store: store2 } = this;
    return key in store2 ? store2[key] : defaultValue;
  }
  set(key, value) {
    if (typeof key !== "string" && typeof key !== "object") {
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof key}`);
    }
    if (typeof key !== "object" && value === void 0) {
      throw new TypeError("Use `delete()` to clear values");
<<<<<<< HEAD
    }
    if (this._containsReservedKey(key)) {
      throw new TypeError(`Please don't use the ${INTERNAL_KEY} key, as it's used to manage this module internal operations.`);
    }
    const { store: store2 } = this;
    const set = (key2, value2) => {
      checkValueType(key2, value2);
      if (__privateGet(this, _options).accessPropertiesByDotNotation) {
        setProperty(store2, key2, value2);
      } else {
        store2[key2] = value2;
      }
=======
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${Dn} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, s = (a, o) => {
      Nb(a, o), $e(this, He).accessPropertiesByDotNotation ? oi(n, a, o) : n[a] = o;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    };
    if (typeof key === "object") {
      const object = key;
      for (const [key2, value2] of Object.entries(object)) {
        set(key2, value2);
      }
    } else {
      set(key, value);
    }
    this.store = store2;
  }
<<<<<<< HEAD
  has(key) {
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      return hasProperty(this.store, key);
    }
    return key in this.store;
=======
  has(t) {
    return $e(this, He).accessPropertiesByDotNotation ? Du(this.store, t) : t in this.store;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
<<<<<<< HEAD
  reset(...keys) {
    for (const key of keys) {
      if (isExist(__privateGet(this, _defaultValues)[key])) {
        this.set(key, __privateGet(this, _defaultValues)[key]);
      }
    }
  }
  delete(key) {
    const { store: store2 } = this;
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      deleteProperty(store2, key);
    } else {
      delete store2[key];
    }
    this.store = store2;
=======
  reset(...t) {
    for (const r of t)
      Pb($e(this, gt)[r]) && this.set(r, $e(this, gt)[r]);
  }
  delete(t) {
    const { store: r } = this;
    $e(this, He).accessPropertiesByDotNotation ? Cu(r, t) : delete r[t], this.store = r;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
<<<<<<< HEAD
    this.store = createPlainObject();
    for (const key of Object.keys(__privateGet(this, _defaultValues))) {
      this.reset(key);
    }
=======
    this.store = ir();
    for (const t of Object.keys($e(this, gt)))
      this.reset(t);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  onDidChange(key, callback) {
    if (typeof key !== "string") {
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof key}`);
    }
    if (typeof callback !== "function") {
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
    }
    return this._handleChange(() => this.get(key), callback);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(callback) {
    if (typeof callback !== "function") {
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof callback}`);
    }
    return this._handleChange(() => this.store, callback);
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
<<<<<<< HEAD
      const data = fs.readFileSync(this.path, __privateGet(this, _encryptionKey) ? null : "utf8");
      const dataString = this._encryptData(data);
      const deserializedData = this._deserialize(dataString);
      this._validate(deserializedData);
      return Object.assign(createPlainObject(), deserializedData);
    } catch (error2) {
      if ((error2 == null ? void 0 : error2.code) === "ENOENT") {
        this._ensureDirectory();
        return createPlainObject();
      }
      if (__privateGet(this, _options).clearInvalidConfig && error2.name === "SyntaxError") {
        return createPlainObject();
      }
      throw error2;
=======
      const t = ne.readFileSync(this.path, $e(this, yt) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(ir(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), ir();
      if ($e(this, He).clearInvalidConfig && t.name === "SyntaxError")
        return ir();
      throw t;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
  }
  set store(value) {
    this._ensureDirectory();
    this._validate(value);
    this._write(value);
    this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [key, value] of Object.entries(this.store)) {
      yield [key, value];
    }
  }
<<<<<<< HEAD
  _encryptData(data) {
    if (!__privateGet(this, _encryptionKey)) {
      return typeof data === "string" ? data : uint8ArrayToString(data);
    }
    try {
      const initializationVector = data.slice(0, 16);
      const password = crypto.pbkdf2Sync(__privateGet(this, _encryptionKey), initializationVector.toString(), 1e4, 32, "sha512");
      const decipher = crypto.createDecipheriv(encryptionAlgorithm, password, initializationVector);
      const slice = data.slice(17);
      const dataUpdate = typeof slice === "string" ? stringToUint8Array(slice) : slice;
      return uint8ArrayToString(concatUint8Arrays([decipher.update(dataUpdate), decipher.final()]));
=======
  _encryptData(t) {
    if (!$e(this, yt))
      return typeof t == "string" ? t : jc(t);
    try {
      const r = t.slice(0, 16), n = kr.pbkdf2Sync($e(this, yt), r.toString(), 1e4, 32, "sha512"), s = kr.createDecipheriv(kc, n, r), a = t.slice(17), o = typeof a == "string" ? Cs(a) : a;
      return jc(Tc([s.update(o), s.final()]));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    } catch {
    }
    return data.toString();
  }
<<<<<<< HEAD
  _handleChange(getter, callback) {
    let currentValue = getter();
    const onChange = () => {
      const oldValue = currentValue;
      const newValue = getter();
      if (isDeepStrictEqual(newValue, oldValue)) {
        return;
      }
      currentValue = newValue;
      callback.call(this, newValue, oldValue);
=======
  _handleChange(t, r) {
    let n = t();
    const s = () => {
      const a = n, o = t();
      Ou(o, a) || (n = o, r.call(this, o, a));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    };
    this.events.addEventListener("change", onChange);
    return () => {
      this.events.removeEventListener("change", onChange);
    };
  }
<<<<<<< HEAD
  _validate(data) {
    if (!__privateGet(this, _validator)) {
      return;
    }
    const valid2 = __privateGet(this, _validator).call(this, data);
    if (valid2 || !__privateGet(this, _validator).errors) {
      return;
    }
    const errors2 = __privateGet(this, _validator).errors.map(({ instancePath, message = "" }) => `\`${instancePath.slice(1)}\` ${message}`);
    throw new Error("Config schema violation: " + errors2.join("; "));
=======
  _validate(t) {
    if (!$e(this, At) || $e(this, At).call(this, t) || !$e(this, At).errors)
      return;
    const n = $e(this, At).errors.map(({ instancePath: s, message: a = "" }) => `\`${s.slice(1)}\` ${a}`);
    throw new Error("Config schema violation: " + n.join("; "));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  _ensureDirectory() {
    fs.mkdirSync(path$1.dirname(this.path), { recursive: true });
  }
<<<<<<< HEAD
  _write(value) {
    let data = this._serialize(value);
    if (__privateGet(this, _encryptionKey)) {
      const initializationVector = crypto.randomBytes(16);
      const password = crypto.pbkdf2Sync(__privateGet(this, _encryptionKey), initializationVector.toString(), 1e4, 32, "sha512");
      const cipher = crypto.createCipheriv(encryptionAlgorithm, password, initializationVector);
      data = concatUint8Arrays([initializationVector, stringToUint8Array(":"), cipher.update(stringToUint8Array(data)), cipher.final()]);
=======
  _write(t) {
    let r = this._serialize(t);
    if ($e(this, yt)) {
      const n = kr.randomBytes(16), s = kr.pbkdf2Sync($e(this, yt), n.toString(), 1e4, 32, "sha512"), a = kr.createCipheriv(kc, s, n);
      r = Tc([n, Cs(":"), a.update(Cs(r)), a.final()]);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
    if (process$1.env.SNAP) {
      fs.writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
    } else {
      try {
<<<<<<< HEAD
        writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
      } catch (error2) {
        if ((error2 == null ? void 0 : error2.code) === "EXDEV") {
          fs.writeFileSync(this.path, data, { mode: __privateGet(this, _options).configFileMode });
=======
        zc(this.path, r, { mode: $e(this, He).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          ne.writeFileSync(this.path, r, { mode: $e(this, He).configFileMode });
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
          return;
        }
        throw error2;
      }
    }
  }
  _watch() {
<<<<<<< HEAD
    this._ensureDirectory();
    if (!fs.existsSync(this.path)) {
      this._write(createPlainObject());
    }
    if (process$1.platform === "win32") {
      fs.watch(this.path, { persistent: false }, debounceFunction(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 100 }));
    } else {
      fs.watchFile(this.path, { persistent: false }, debounceFunction(() => {
        this.events.dispatchEvent(new Event("change"));
      }, { wait: 5e3 }));
    }
=======
    this._ensureDirectory(), ne.existsSync(this.path) || this._write(ir()), Pe.platform === "win32" ? ne.watch(this.path, { persistent: !1 }, uc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : ne.watchFile(this.path, { persistent: !1 }, uc(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  }
  _migrate(migrations, versionToMigrate, beforeEachMigration) {
    let previousMigratedVersion = this._get(MIGRATION_KEY, "0.0.0");
    const newerVersions = Object.keys(migrations).filter((candidateVersion) => this._shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate));
    let storeBackup = { ...this.store };
    for (const version of newerVersions) {
      try {
        if (beforeEachMigration) {
          beforeEachMigration(this, {
            fromVersion: previousMigratedVersion,
            toVersion: version,
            finalVersion: versionToMigrate,
            versions: newerVersions
          });
        }
        const migration = migrations[version];
        migration == null ? void 0 : migration(this);
        this._set(MIGRATION_KEY, version);
        previousMigratedVersion = version;
        storeBackup = { ...this.store };
      } catch (error2) {
        this.store = storeBackup;
        throw new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${error2}`);
      }
    }
    if (this._isVersionInRangeFormat(previousMigratedVersion) || !semver$1.eq(previousMigratedVersion, versionToMigrate)) {
      this._set(MIGRATION_KEY, versionToMigrate);
    }
  }
  _containsReservedKey(key) {
    if (typeof key === "object") {
      const firstKey = Object.keys(key)[0];
      if (firstKey === INTERNAL_KEY) {
        return true;
      }
    }
    if (typeof key !== "string") {
      return false;
    }
    if (__privateGet(this, _options).accessPropertiesByDotNotation) {
      if (key.startsWith(`${INTERNAL_KEY}.`)) {
        return true;
      }
      return false;
    }
    return false;
  }
  _isVersionInRangeFormat(version) {
    return semver$1.clean(version) === null;
  }
  _shouldPerformMigration(candidateVersion, previousMigratedVersion, versionToMigrate) {
    if (this._isVersionInRangeFormat(candidateVersion)) {
      if (previousMigratedVersion !== "0.0.0" && semver$1.satisfies(previousMigratedVersion, candidateVersion)) {
        return false;
      }
      return semver$1.satisfies(versionToMigrate, candidateVersion);
    }
    if (semver$1.lte(candidateVersion, previousMigratedVersion)) {
      return false;
    }
    if (semver$1.gt(candidateVersion, versionToMigrate)) {
      return false;
    }
    return true;
  }
<<<<<<< HEAD
  _get(key, defaultValue) {
    return getProperty(this.store, key, defaultValue);
  }
  _set(key, value) {
    const { store: store2 } = this;
    setProperty(store2, key, value);
    this.store = store2;
  }
}
_validator = new WeakMap();
_encryptionKey = new WeakMap();
_options = new WeakMap();
_defaultValues = new WeakMap();
const { app, ipcMain, shell } = electron;
let isInitialized = false;
const initDataListener = () => {
  if (!ipcMain || !app) {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  }
  const appData = {
    defaultCwd: app.getPath("userData"),
    appVersion: app.getVersion()
  };
<<<<<<< HEAD
  if (isInitialized) {
    return appData;
  }
  ipcMain.on("electron-store-get-data", (event) => {
    event.returnValue = appData;
  });
  isInitialized = true;
  return appData;
};
class ElectronStore extends Conf {
  constructor(options) {
    let defaultCwd;
    let appVersion;
    if (process$1.type === "renderer") {
      const appData = electron.ipcRenderer.sendSync("electron-store-get-data");
      if (!appData) {
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      }
      ({ defaultCwd, appVersion } = appData);
    } else if (ipcMain && app) {
      ({ defaultCwd, appVersion } = initDataListener());
    }
    options = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      name: "config",
      ...options
    };
    options.projectVersion || (options.projectVersion = appVersion);
    if (options.cwd) {
      options.cwd = path$1.isAbsolute(options.cwd) ? options.cwd : path$1.join(defaultCwd, options.cwd);
    } else {
      options.cwd = defaultCwd;
    }
    options.configName = options.name;
    delete options.name;
    super(options);
  }
  static initRenderer() {
<<<<<<< HEAD
    initDataListener();
  }
  async openInEditor() {
    const error2 = await shell.openPath(this.path);
    if (error2) {
      throw new Error(error2);
    }
  }
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let lastScriptPath = null;
const children = /* @__PURE__ */ new Map();
let spawnedBackend = null;
const initialFormData = {
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  nomeCliente: "",
  ip: "",
  user: "",
  password: "",
  localCSV: "",
  metodoCSV: "",
  // '1' ou '2'
  habilitarCSV: false,
  serverDB: "",
  database: "",
  userDB: "",
  passwordDB: "",
  mySqlDir: "",
  dumpDir: "",
  batchDumpDir: ""
<<<<<<< HEAD
};
const store = new ElectronStore({
=======
}, Vn = new Ib({
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  defaults: {
    formData: initialFormData
  },
  name: "app-config"
});
ipcMain$1.handle("save-data", async (_, key, data) => {
  try {
    if (key === "all") {
      store.set("formData", data);
    } else {
      const existingData = store.get("formData", initialFormData);
      const updatedData = { ...existingData, ...data };
      store.set("formData", updatedData);
    }
    console.log("Dados salvos com sucesso para a chave:", key);
    return true;
  } catch (err) {
    console.error("Erro ao salvar dados:", err);
    return false;
  }
});
ipcMain$1.handle("load-data", async () => {
  try {
    const data = store.get("formData", initialFormData);
    return data;
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    return initialFormData;
  }
});
<<<<<<< HEAD
ipcMain$1.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog(win, {
=======
ft.handle("select-folder", async () => {
  const e = await Lc.showOpenDialog(ce, {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    properties: ["openDirectory"]
  });
  if (result.canceled || result.filePaths.length === 0) {
    console.log("Nenhuma pasta selecionada");
    return null;
  }
  const folderPath = result.filePaths[0];
  console.log("Pasta selecionada:", folderPath);
  return folderPath;
});
<<<<<<< HEAD
ipcMain$1.handle("select-file", async () => {
  const result = await dialog.showOpenDialog(win, {
=======
ft.handle("select-file", async () => {
  const e = await Lc.showOpenDialog(ce, {
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    properties: ["openFile"]
  });
  if (result.canceled || result.filePaths.length === 0) {
    console.log("Nenhum arquivo selecionado");
    return null;
  }
  const filePath = result.filePaths[0];
  console.log("Arquivo selecionado:", filePath);
  return filePath;
});
ipcMain$1.handle("clean-db", async () => {
  console.log("Limpando banco de dados...");
  return new Promise((resolve2) => {
    setTimeout(() => {
      console.log("Banco de dados limpo com sucesso");
      resolve2(true);
    }, 1e3);
  });
});
ipcMain$1.handle("print-pdf", async (_event, filePath) => {
  try {
    const printWin = new BrowserWindow({
      width: 800,
      height: 600,
      show: true,
      webPreferences: {
        plugins: true,
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    await printWin.loadFile(filePath);
    printWin.webContents.on("did-finish-load", () => {
      printWin.webContents.print({
        silent: false,
        // false para mostrar diálogo de impressão
        printBackground: true
      });
    });
    return { ok: true };
  } catch (err) {
    console.error("Erro ao imprimir PDF:", err);
    return { ok: false, error: err };
  }
});
ipcMain$1.handle("start-fork", async (_event, { script, args = [] } = {}) => {
  const projectRoot = path.dirname(path.dirname(__dirname));
  if (!script) {
    script = "../back-end/dist/src/index.js";
  }
  let scriptPath;
  if (path.isAbsolute(script)) {
    scriptPath = script;
  } else {
    const possiblePaths = [
      // Prefer IPC-only CJS build
      path.join(projectRoot, "back-end", "dist", "index.js"),
      // Fallback to full build structure if present
      path.join(projectRoot, "back-end", "dist", "src", "index.js"),
      // TypeScript source (will use ts-node)
      path.join(projectRoot, "back-end", "src", "index.ts"),
      // Original provided script path fallbacks
      path.join(__dirname, script),
      path.join(process.env.APP_ROOT || "", script),
      path.join(path.dirname(__dirname), script),
      path.join(projectRoot, script),
      path.resolve(script)
    ];
    console.log("Trying paths:", possiblePaths);
    scriptPath = possiblePaths.find((p) => {
      try {
<<<<<<< HEAD
        const exists = fs$1.existsSync(p);
        console.log(`Path ${p} exists: ${exists}`);
        return exists;
=======
        const c = _t.existsSync(o);
        return console.log(`Path ${o} exists: ${c}`), c;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      } catch {
        return false;
      }
    }) || possiblePaths[0];
  }
<<<<<<< HEAD
  console.log("Attempting to fork script at:", scriptPath);
  console.log("Script exists:", fs$1.existsSync(scriptPath));
  try {
    const frontendBackendDir = path.join(projectRoot, "Frontend", "backend");
    if (scriptPath.startsWith(frontendBackendDir)) {
      const realCandidates = [
        path.join(projectRoot, "back-end", "dist", "index.js"),
        path.join(projectRoot, "back-end", "dist", "src", "index.js"),
        path.join(projectRoot, "back-end", "src", "index.ts"),
        path.join(projectRoot, "back-end", "src", "index.js")
      ];
      const found = realCandidates.find((p) => fs$1.existsSync(p));
      if (found) {
        console.log("Replacing frontend shim script with real backend entry:", found);
        scriptPath = found;
      } else {
        console.log("No real backend entry found, will attempt to fork provided script (may fail if AMD-wrapped)");
      }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
    }
  } catch (e) {
  }
  try {
<<<<<<< HEAD
    const initialBackendDir = path.dirname(scriptPath);
    let backendDir = initialBackendDir;
    let foundBackendPackage = false;
    while (backendDir && backendDir !== path.dirname(backendDir)) {
      const packageJsonPath = path.join(backendDir, "package.json");
      if (fs$1.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs$1.readFileSync(packageJsonPath, "utf8"));
          if (packageJson.name === "backend") {
            foundBackendPackage = true;
=======
    const a = ae.dirname(s);
    let o = a, c = !1;
    for (; o && o !== ae.dirname(o); ) {
      const u = ae.join(o, "package.json");
      if (_t.existsSync(u))
        try {
          if (JSON.parse(_t.readFileSync(u, "utf8")).name === "backend") {
            c = !0;
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
            break;
          }
        } catch {
        }
      }
      backendDir = path.dirname(backendDir);
    }
    if (!foundBackendPackage) backendDir = initialBackendDir;
    console.log("Setting child process cwd to:", backendDir);
    lastScriptPath = scriptPath;
    const child = fork(scriptPath, args, {
      stdio: ["pipe", "pipe", "ipc"],
      cwd: backendDir,
      silent: false,
      env: { ...process.env }
    });
    const pid = child.pid;
    console.log("Child process forked with PID:", pid);
    if (typeof pid === "number") {
      children.set(pid, child);
      console.log("Child process added to children map. Total children:", children.size);
    } else {
      console.error("Child process PID is undefined");
      return { ok: false, reason: "fork-failed-no-pid" };
    }
    return new Promise((resolve2, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Timeout waiting for WebSocket port from backend"));
      }, 1e4);
      const messageHandler = (msg) => {
        if (msg && msg.type === "websocket-port" && typeof msg.port === "number") {
          clearTimeout(timeoutId);
          child.off("message", messageHandler);
          resolve2({ ok: true, port: msg.port, pid });
        }
      };
      child.on("message", messageHandler);
      child.on("error", (error2) => {
        console.error("Child process error:", error2);
        if (typeof child.pid === "number") {
          children.delete(child.pid);
        }
        clearTimeout(timeoutId);
        reject(error2);
      });
      child.on("exit", (code2, signal) => {
        console.log(`Child process ${child.pid} exited with code ${code2} and signal ${signal}`);
        if (typeof child.pid === "number") children.delete(child.pid);
        if (win && !win.isDestroyed()) {
          win.webContents.send("child-exit", { pid: child.pid, code: code2, signal });
        }
        clearTimeout(timeoutId);
        reject(new Error(`Child process exited with code ${code2}`));
      });
      child.on("message", (msg) => {
        console.log("Message from child:", msg);
        if (msg && typeof msg === "object" && "type" in msg && msg.type === "websocket-port") {
          return;
        }
        if (win && !win.isDestroyed()) {
          win.webContents.send("child-message", { pid: child.pid, msg });
        }
      });
      if (child.stdout) {
        child.stdout.on("data", (chunk) => {
          console.log("Child stdout:", chunk.toString());
          if (win && !win.isDestroyed()) {
            win.webContents.send("child-stdout", { pid: child.pid, data: chunk.toString() });
          }
        });
      }
      if (child.stderr) {
        child.stderr.on("data", (chunk) => {
          console.error("Child stderr:", chunk.toString());
          if (win && !win.isDestroyed()) {
            win.webContents.send("child-stderr", { pid: child.pid, data: chunk.toString() });
          }
        });
      }
    });
  } catch (error2) {
    console.error("Failed to fork child process:", error2);
    return { ok: false, reason: `fork-error: ${error2}` };
  }
});
<<<<<<< HEAD
ipcMain$1.handle("start-collector-fork", async (_event, { args = [] } = {}) => {
  const projectRoot = path.dirname(path.dirname(__dirname));
  const possible = [
    path.join(projectRoot, "back-end", "dist", "src", "collector", "runner.js"),
    path.join(projectRoot, "back-end", "dist", "collector", "runner.js"),
    path.join(projectRoot, "back-end", "src", "collector", "runner.ts")
  ];
  const scriptPath = possible.find((p) => fs$1.existsSync(p)) || possible[0];
  if (!fs$1.existsSync(scriptPath)) return { ok: false, reason: "collector-not-found", attempted: possible };
=======
ft.handle("start-collector-fork", async (e, { args: t = [] } = {}) => {
  const r = ae.dirname(ae.dirname(pr)), n = [
    ae.join(r, "back-end", "dist", "src", "collector", "runner.js"),
    ae.join(r, "back-end", "dist", "collector", "runner.js"),
    ae.join(r, "back-end", "src", "collector", "runner.ts")
  ], s = n.find((a) => _t.existsSync(a)) || n[0];
  if (!_t.existsSync(s)) return { ok: !1, reason: "collector-not-found", attempted: n };
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  try {
    const child = fork(scriptPath, args, { stdio: ["pipe", "pipe", "ipc"], cwd: path.dirname(scriptPath), env: { ...process.env } });
    const pid = child.pid;
    if (typeof pid === "number") {
      children.set(pid, child);
      child.on("message", (msg) => {
        if (win && !win.isDestroyed()) win.webContents.send("child-message", { pid, msg });
      });
      if (child.stdout) child.stdout.on("data", (c) => {
        if (win && !win.isDestroyed()) win.webContents.send("child-stdout", { pid, data: c.toString() });
      });
      if (child.stderr) child.stderr.on("data", (c) => {
        if (win && !win.isDestroyed()) win.webContents.send("child-stderr", { pid, data: c.toString() });
      });
    }
    return { ok: true, pid };
  } catch (err) {
    return { ok: false, reason: String(err) };
  }
});
ipcMain$1.handle("send-to-child", async (_event, { pid, msg } = {}) => {
  console.log("send-to-child called with PID:", pid, "Message type:", msg == null ? void 0 : msg.type);
  console.log("Available children PIDs:", Array.from(children.keys()));
  if (typeof pid !== "number") return { ok: false, reason: "invalid-pid" };
  const child = children.get(pid);
  if (!child) {
    console.log("Child not found for PID:", pid);
    if (lastScriptPath) {
      try {
        const backendDir = path.dirname(lastScriptPath);
        const refork = fork(lastScriptPath, [], { stdio: ["pipe", "pipe", "ipc"], cwd: backendDir, silent: false, env: { ...process.env } });
        const newPid = refork.pid;
        if (typeof newPid === "number") {
          children.set(newPid, refork);
          if (win && !win.isDestroyed()) {
            win.webContents.send("child-message", { pid: newPid, msg: { type: "event", event: "reforked", payload: { oldPid: pid, newPid } } });
          }
          try {
            refork.send(msg);
            return { ok: true };
          } catch (sendErr) {
            console.error("Error sending message after refork:", sendErr);
            return { ok: false, reason: String(sendErr) };
          }
        }
      } catch (rfErr) {
        console.error("Auto-refork failed:", rfErr);
      }
<<<<<<< HEAD
    }
    return { ok: false, reason: "not-found" };
  }
  try {
    console.log("Sending message to child:", msg);
    child.send(msg);
    return { ok: true };
  } catch (err) {
    console.error("Error sending message to child:", err);
    return { ok: false, reason: String(err) };
  }
});
ipcMain$1.handle("stop-child", async (_event, { pid } = {}) => {
  if (typeof pid !== "number") return { ok: false, reason: "invalid-pid" };
  const child = children.get(pid);
  if (!child) return { ok: false, reason: "not-found" };
  try {
    child.kill("SIGTERM");
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err) };
  }
});
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.maximize();
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
}
app$1.whenReady().then(() => {
  (async () => {
    if (app$1.isPackaged) {
      try {
<<<<<<< HEAD
        const exePath = path.join(process.resourcesPath, "backend", "backend.exe");
        if (fs$1.existsSync(exePath)) {
          console.log("[main] Spawning packaged backend exe at", exePath);
          spawnedBackend = spawn(exePath, [], { env: { ...process.env, FRONTEND_API_PORT: process.env.FRONTEND_API_PORT || "3000" }, cwd: process.resourcesPath });
          spawnedBackend.stdout.on("data", (d) => console.log("[backend exe stdout]", d.toString()));
          spawnedBackend.stderr.on("data", (d) => console.error("[backend exe stderr]", d.toString()));
          spawnedBackend.on("exit", (code2) => console.log("[backend exe] exited", code2));
        } else {
          console.warn("[main] packaged backend exe not found at", exePath);
        }
=======
        const e = ae.join(process.resourcesPath, "backend", "backend.exe");
        _t.existsSync(e) ? (console.log("[main] Spawning packaged backend exe at", e), Mt = ju(e, [], { env: { ...process.env, FRONTEND_API_PORT: process.env.FRONTEND_API_PORT || "3000" }, cwd: process.resourcesPath }), Mt.stdout.on("data", (t) => console.log("[backend exe stdout]", t.toString())), Mt.stderr.on("data", (t) => console.error("[backend exe stderr]", t.toString())), Mt.on("exit", (t) => console.log("[backend exe] exited", t))) : console.warn("[main] packaged backend exe not found at", e);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
      } catch (e) {
        console.error("[main] failed to spawn packaged backend exe", e);
      }
    } else {
      try {
        console.log("[main] running in development mode, backend fork will be started by renderer when needed");
      } catch (e) {
        console.warn("[main] dev auto-start failed", e);
      }
<<<<<<< HEAD
    }
    createWindow();
  })();
  app$1.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
=======
    Dc();
  })(), Qt.on("activate", () => {
    ra.getAllWindows().length === 0 && Dc();
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  });
});
app$1.on("window-all-closed", () => {
  if (process.platform !== "darwin") app$1.quit();
});
app$1.on("before-quit", () => {
  try {
<<<<<<< HEAD
    if (spawnedBackend && !spawnedBackend.killed) {
      spawnedBackend.kill();
      spawnedBackend = null;
    }
=======
    Mt && !Mt.killed && (Mt.kill(), Mt = null);
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
  } catch (e) {
    console.warn("[main] error killing spawned backend", e);
  }
  for (const [, child] of children.entries()) {
    try {
      child.kill("SIGTERM");
    } catch (e) {
    }
  }
});
<<<<<<< HEAD
const logFilePath = path.join(app$1.getPath("userData"), "error.log");
const logStream = fs$1.createWriteStream(logFilePath, { flags: "a" });
process.on("uncaughtException", (error2) => {
  logStream.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Uncaught Exception: ${error2.stack}
`);
});
process.on("unhandledRejection", (reason) => {
  logStream.write(`[${(/* @__PURE__ */ new Date()).toISOString()}] Unhandled Rejection: ${reason}
`);
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
=======
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
>>>>>>> 14604a8430096976ddd063172fe4ffff48276bea
};
