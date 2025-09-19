var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "ws"], function (require, exports, ws_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wsbridge = exports.WebSocketBridge = void 0;
    ws_1 = __importDefault(ws_1);
    class WebSocketBridge {
        constructor() {
            this.handlers = {};
            this.server = null;
            this.clients = new Set();
            this.port = 0;
            this.starting = null;
            this.metadata = {}; // Armazena metadados temporários
        }
        register(cmd, handler) {
            this.handlers[cmd] = handler;
        }
        sendToClient(ws, message) {
            if (ws.readyState === ws_1.default.OPEN)
                ws.send(JSON.stringify(message));
        }
        broadcast(message) {
            this.clients.forEach(ws => { if (ws.readyState === ws_1.default.OPEN)
                ws.send(JSON.stringify(message)); });
        }
        sendEvent(event, payload) {
            this.broadcast({ type: 'event', event, payload, ts: new Date().toISOString() });
        }
        handleMessage(ws, msg) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!msg || typeof msg !== 'object')
                    return;
                if (msg.type === 'config') {
                    this.sendToClient(ws, { type: 'event', event: 'config-ack', payload: { ok: true } });
                    return;
                }
                const { id, cmd, payload } = msg;
                if (!id || !cmd)
                    return;
                try {
                    const h = this.handlers[cmd];
                    if (!h)
                        throw Object.assign(new Error(`Unknown cmd: ${cmd}`), { status: 404 });
                    const data = yield h(payload);
                    this.sendToClient(ws, { id, ok: true, data });
                }
                catch (err) {
                    this.sendToClient(ws, { id, ok: false, error: { message: (err === null || err === void 0 ? void 0 : err.message) || String(err), status: err === null || err === void 0 ? void 0 : err.status } });
                }
            });
        }
        start() {
            if (this.port && this.server)
                return Promise.resolve(this.port);
            if (this.starting)
                return this.starting;
            this.starting = new Promise((resolve, reject) => {
                this.findAvailablePort(8080).then(port => {
                    this.port = port;
                    this.server = new ws_1.default.Server({ port });
                    this.server.on('connection', (ws) => {
                        this.clients.add(ws);
                        this.sendToClient(ws, { type: 'event', event: 'ready', payload: { ts: new Date().toISOString(), port } });
                        ws.on('message', (d) => { try {
                            const m = JSON.parse(d.toString());
                            this.handleMessage(ws, m);
                        }
                        catch (_a) { } });
                        ws.on('close', () => this.clients.delete(ws));
                        ws.on('error', () => this.clients.delete(ws));
                    });
                    this.server.on('listening', () => { resolve(port); this.starting = null; });
                    this.server.on('error', (err) => { this.starting = null; reject(err); });
                }).catch(err => { this.starting = null; reject(err); });
            });
            return this.starting;
        }
        findAvailablePort(startPort) {
            return __awaiter(this, void 0, void 0, function* () {
                const net = yield new Promise((resolve_1, reject_1) => { require(['net'], resolve_1, reject_1); }).then(__importStar);
                return new Promise((resolve, reject) => {
                    const server = net.createServer();
                    server.listen(startPort, () => { var _a; const port = (_a = server.address()) === null || _a === void 0 ? void 0 : _a.port; server.close(() => resolve(port)); });
                    server.on('error', () => { this.findAvailablePort(startPort + 1).then(resolve).catch(reject); });
                });
            });
        }
        stop() { if (this.server) {
            this.clients.forEach(ws => ws.close());
            this.clients.clear();
            this.server.close();
            this.server = null;
            this.port = 0;
            this.starting = null;
        } }
        getPort() { return this.port; }
        getClientCount() { return this.clients.size; }
        // Execute a registered command directly (used for IPC / child process messages)
        executeCommand(cmd, payload) {
            return __awaiter(this, void 0, void 0, function* () {
                const h = this.handlers[cmd];
                if (!h)
                    throw Object.assign(new Error(`Unknown cmd: ${cmd}`), { status: 404 });
                return yield Promise.resolve(h(payload));
            });
        }
        // Métodos para lidar com metadados temporários
        getMetadata(key) {
            return this.metadata[key];
        }
        setMetadata(key, value) {
            this.metadata[key] = value;
        }
        clearMetadata(key) {
            if (key) {
                delete this.metadata[key];
            }
            else {
                this.metadata = {};
            }
        }
    }
    exports.WebSocketBridge = WebSocketBridge;
    exports.wsbridge = new WebSocketBridge();
});
