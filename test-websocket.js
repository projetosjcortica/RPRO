#!/usr/bin/env node

/**
 * Script para testar a comunicação WebSocket entre frontend e backend
 * Execute com: node test-websocket.js
 */

const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 8080;
const BACKEND_PATH = path.join(__dirname, 'back-end');

class WebSocketTester {
  constructor() {
    this.ws = null;
    this.pending = new Map();
    this.backendProcess = null;
  }

  async startBackend() {
    console.log('🚀 Starting backend...');
    
    return new Promise((resolve, reject) => {
      this.backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: BACKEND_PATH,
        stdio: 'pipe',
        shell: true
      });

      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[Backend] ${output.trim()}`);
        
        // Check if WebSocket started
        if (output.includes('WebSocket started') && output.includes('port')) {
          console.log('✅ Backend WebSocket is ready!');
          setTimeout(resolve, 1000); // Give it a moment to fully initialize
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data.toString().trim()}`);
      });

      this.backendProcess.on('exit', (code) => {
        console.log(`❌ Backend process exited with code ${code}`);
        if (code !== 0) {
          reject(new Error(`Backend failed with exit code ${code}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Backend startup timeout'));
      }, 30000);
    });
  }

  async connectWebSocket() {
    console.log('🔌 Connecting to WebSocket...');
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://localhost:${PORT}`);

      this.ws.on('open', () => {
        console.log('✅ WebSocket connected!');
        resolve();
      });

      this.ws.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          this.handleMessage(msg);
        } catch (e) {
          console.error('❌ Error parsing message:', e);
        }
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
      });
    });
  }

  handleMessage(msg) {
    console.log('📨 Received:', msg);
    
    // Handle command responses
    if (msg.id && (msg.ok === true || msg.ok === false)) {
      const { resolve, reject } = this.pending.get(msg.id) || {};
      if (resolve && reject) {
        this.pending.delete(msg.id);
        if (msg.ok) {
          resolve(msg.data);
        } else {
          reject(new Error(msg.error?.message || 'Unknown error'));
        }
      }
    }
    
    // Handle events
    if (msg.type === 'event') {
      console.log(`🎉 Event: ${msg.event}`, msg.payload);
    }
  }

  async sendCommand(cmd, payload = {}) {
    const id = `test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      
      const message = { id, cmd, payload };
      console.log('📤 Sending:', message);
      
      this.ws.send(JSON.stringify(message));
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Timeout waiting for response to '${cmd}'`));
        }
      }, 10000);
    });
  }

  async runTests() {
    console.log('🧪 Running WebSocket tests...\n');

    try {
      // Test basic ping
      console.log('1. Testing ping...');
      const pingResult = await this.sendCommand('ping');
      console.log('✅ Ping result:', pingResult);

      // Test mock status
      console.log('\n2. Testing mock status...');
      const mockStatus = await this.sendCommand('mock.status');
      console.log('✅ Mock status:', mockStatus);

      // Test relatorio pagination
      console.log('\n3. Testing relatorio pagination...');
      const relatorioResult = await this.sendCommand('relatorio.paginate', {
        page: 1,
        pageSize: 5
      });
      console.log('✅ Relatorio result:', {
        total: relatorioResult.total,
        rowCount: relatorioResult.rows?.length || 0,
        page: relatorioResult.page
      });

      // Test materia prima
      console.log('\n4. Testing materia prima...');
      const materiaPrimaResult = await this.sendCommand('db.getMateriaPrima');
      console.log('✅ Materia Prima result:', {
        count: materiaPrimaResult?.length || 0
      });

      // Test WebSocket status
      console.log('\n5. Testing WebSocket status...');
      const wsStatus = await this.sendCommand('ws.status');
      console.log('✅ WebSocket status:', wsStatus);

      console.log('\n🎉 All tests passed!');

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      throw error;
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    
    if (this.ws) {
      this.ws.close();
    }
    
    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.backendProcess && !this.backendProcess.killed) {
          this.backendProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }

  async run() {
    try {
      await this.startBackend();
      await this.connectWebSocket();
      await this.runTests();
      
      console.log('\n✅ WebSocket communication test completed successfully!');
      
    } catch (error) {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
      process.exit(0);
    }
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⚠️  Received SIGINT, cleaning up...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Received SIGTERM, cleaning up...');
  process.exit(0);
});

// Run the test
const tester = new WebSocketTester();
tester.run().catch(console.error);