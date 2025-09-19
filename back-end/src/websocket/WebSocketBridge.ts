import WebSocket from 'ws';

export class WebSocketBridge {
  private handlers: Record<string, (payload: any) => Promise<any> | any> = {};
  private server: any = null;
  private clients: Set<any> = new Set();
  private port = 0;
  private starting: Promise<number> | null = null;
  private metadata: Record<string, any> = {}; // Armazena metadados temporários

  register(cmd: string, handler: (payload: any) => Promise<any> | any) {
    this.handlers[cmd] = handler;
  }

  private sendToClient(ws: any, message: any) {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
  }

  broadcast(message: any) {
    this.clients.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message)); });
  }

  sendEvent(event: string, payload: any) {
    this.broadcast({ type: 'event', event, payload, ts: new Date().toISOString() });
  }

  async handleMessage(ws: any, msg: any) {
    if (!msg || typeof msg !== 'object') return;
    if (msg.type === 'config') {
      this.sendToClient(ws, { type: 'event', event: 'config-ack', payload: { ok: true } });
      return;
    }
    const { id, cmd, payload } = msg;
    if (!id || !cmd) return;
    try { const h = this.handlers[cmd]; if (!h) throw Object.assign(new Error(`Unknown cmd: ${cmd}`), { status: 404 });
      const data = await h(payload); this.sendToClient(ws, { id, ok: true, data });
    } catch (err: any) { this.sendToClient(ws, { id, ok: false, error: { message: err?.message || String(err), status: err?.status } }); }
  }

  start(): Promise<number> {
    if (this.port && this.server) return Promise.resolve(this.port);
    if (this.starting) return this.starting;
    this.starting = new Promise((resolve, reject) => {
      this.findAvailablePort(8080).then(port => {
        this.port = port; this.server = new WebSocket.Server({ port });
        this.server.on('connection', (ws: any) => {
          this.clients.add(ws);
          this.sendToClient(ws, { type: 'event', event: 'ready', payload: { ts: new Date().toISOString(), port } });
          ws.on('message', (d: any) => { try { const m = JSON.parse(d.toString()); this.handleMessage(ws, m); } catch {} });
          ws.on('close', () => this.clients.delete(ws));
          ws.on('error', () => this.clients.delete(ws));
        });
        this.server.on('listening', () => { resolve(port); this.starting = null; });
        this.server.on('error', (err: any) => { this.starting = null; reject(err); });
      }).catch(err => { this.starting = null; reject(err); });
    });
    return this.starting;
  }

  private async findAvailablePort(startPort: number): Promise<number> {
    const net = await import('net');
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.listen(startPort, () => { const port = (server.address() as any)?.port; server.close(() => resolve(port)); });
      server.on('error', () => { this.findAvailablePort(startPort + 1).then(resolve).catch(reject); });
    });
  }

  stop() { if (this.server) { this.clients.forEach(ws => ws.close()); this.clients.clear(); this.server.close(); this.server = null; this.port = 0; this.starting = null; } }
  getPort() { return this.port; }
  getClientCount() { return this.clients.size; }

  // Execute a registered command directly (used for IPC / child process messages)
  async executeCommand(cmd: string, payload: any) {
    const h = this.handlers[cmd];
    if (!h) throw Object.assign(new Error(`Unknown cmd: ${cmd}`), { status: 404 });
    return await Promise.resolve(h(payload));
  }

  // Métodos para lidar com metadados temporários
  getMetadata(key: string): any {
    return this.metadata[key];
  }

  setMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  clearMetadata(key?: string): void {
    if (key) {
      delete this.metadata[key];
    } else {
      this.metadata = {};
    }
  }
}

export const wsbridge = new WebSocketBridge();
