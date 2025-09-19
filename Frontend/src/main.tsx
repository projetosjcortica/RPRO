import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { config } from './CFG'
import { Processador, getProcessador, setProcessador } from './Processador'
import { getMockStatus } from './utils/mockHelper'
import { updateConfig } from './CFG'
import { BrowserRouter } from 'react-router-dom'

type StartForkResult = { ok: true; port: number; pid: number } | { ok: false; reason: string };

// Export for use in other components
export { Processador, getProcessador, setProcessador };

// Inicializa a configuração do aplicativo com base no status do mock
async function initializeAppConfig() {
  try {
    const mockStatus = await getMockStatus();
    console.log('Mock status loaded:', mockStatus);
    updateConfig(mockStatus);
  } catch (error) {
    console.error('Erro ao inicializar configuração do aplicativo:', error);
  }
}

// Start the backend child process correctly using the preload API (only in Electron)
if ((window as any).electronAPI) {
  // Use relative path to backend - Electron main will resolve the correct entry point
  (window as any).electronAPI.startFork()
  .then(async (res: StartForkResult) => {
    if (res && res.ok) {
      console.log('Backend started:', res);
      config.contextoPid = res.pid;
      (window as any).contextoPid = res.pid;
      (window as any).backendPort = res.port;
      console.log('Backend child process started with PID:', res.pid, 'and WebSocket port:', res.port);

      // Initialize WebSocket-based Processador
      console.log('Initializing WebSocket Processador on port:', res.port);
      const p = setProcessador(res.port);
      
      // Wait for WebSocket connection to be established
      const connected = await p.waitForConnection(15000);
      if (!connected) {
        console.error('Failed to establish WebSocket connection within timeout');
        return;
      }
      
      console.log('WebSocket connection established successfully');

      // Inicializa a configuração do aplicativo após o backend ser conectado
      await initializeAppConfig();

      // Setup event handlers
      p.onEvent('file.processed', (e) => console.log('Arquivo processado:', e));
      p.onEvent('ready', () => {
        console.log('Backend WebSocket is ready');
      });
      p.onEvent('config-ack', () => {
        console.log('Configuration applied successfully via WebSocket');
      });
      p.onEvent('heartbeat', (hb) => {
        console.log('[WS Heartbeat]', hb);
      });
      p.onEvent('connection-failed', (info) => {
        console.error('WebSocket connection failed after max attempts:', info);
      });

      // Debug: wire stdout/stderr/exit to console
      (window as any).electronAPI.onChildStdout((_evt: any, data: any) => {
        if (data?.pid === res.pid) console.log('[child stdout]', data.data);
      });
      (window as any).electronAPI.onChildStderr((_evt: any, data: any) => {
        if (data?.pid === res.pid) console.warn('[child stderr]', data.data);
      });
      (window as any).electronAPI.onChildExit((_evt: any, payload: any) => {
        if (payload?.pid === res.pid) {
          console.warn('[child exit]', payload);
          // Try to reconnect or restart backend if needed
          console.log('Backend process exited, attempting restart...');
          setTimeout(() => {
            (window as any).electronAPI.startFork().catch(console.error);
          }, 2000);
        }
      });

      // Set up message listener to handle child responses
      (window as any).electronAPI.onChildMessage((_evt: any, payload: any) => {
        const msg = payload?.msg;
        if (!msg) return;
        if (msg.type === 'event') {
          if (msg.event === 'reforked' && msg.payload?.newPid) {
            console.warn('Backend reforked. Adopting new PID:', msg.payload.newPid);
            (window as any).contextoPid = msg.payload.newPid;
            config.contextoPid = msg.payload.newPid;
            // WebSocket will reconnect automatically through Processador
            return;
          }
        }
      });

      // Start WS loop (optional; backend also supports env auto-start)
      try {
        await p.wsLoopStart(10000);
        console.log('WebSocket heartbeat loop started');
      } catch (e) {
        console.warn('Could not start WS heartbeat loop:', e);
      }

      // Send configuration to backend
      await sendConfigurationToBackend(p);

    } else {
      console.warn('Failed to start backend child process', res);
    }
  })
  .catch((err: unknown) => {
    console.error('Error starting backend child process', err);
    if (err instanceof Error) {
      console.error('Error details:', err.stack);
    }
  }); 
} else {
  console.warn('electronAPI not found. Skipping backend fork (running in non-Electron context).');
  
  // Try to connect to existing backend if running in browser/dev mode
  try {
    console.log('Attempting to connect to existing backend on port 8080...');
    const p = setProcessador(8080);
    
    p.waitForConnection(5000).then(async (connected) => {
      if (connected) {
        console.log('Connected to existing backend WebSocket');
        await initializeAppConfig();
        
        // Setup basic event handlers
        p.onEvent('ready', () => console.log('Backend WebSocket is ready'));
        p.onEvent('heartbeat', (hb) => console.log('[WS Heartbeat]', hb));
      } else {
        console.warn('Could not connect to backend. Please start backend manually.');
      }
    });
  } catch (e) {
    console.warn('Failed to connect to existing backend:', e);
  }
}

async function sendConfigurationToBackend(processador: Processador, retryCount = 0) {
  try {
    console.log(`Attempting to send config via WebSocket, attempt ${retryCount + 1}`);

    const formData = await (window as any).electronAPI.loadData();
    console.log('Sending configuration to backend via WebSocket:', formData);

    // Send config to backend via WebSocket using the 'config' command
    await processador.sendConfig(formData);
    console.log('Configuration sent successfully via WebSocket');

  } catch (configError) {
    console.error('Error sending configuration via WebSocket:', configError);
    
    // Retry up to 3 times with increasing delays
    if (retryCount < 3) {
      console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
      setTimeout(() => {
        sendConfigurationToBackend(processador, retryCount + 1);
      }, (retryCount + 1) * 1000);
    } else {
      console.error('Max retries reached, giving up on configuration');
    }
  }
}

// Exemplo de uso da classe Processador (pode ser removido em produção)
/*
if (config.contextoPid) {
  const processador = getProcessador(config.contextoPid);
  // Exemplo: buscar dados da tabela
  processador.relatorioPaginate(1, 10, { dateStart: '2024-01-01' })
    .then(data => console.log('Dados da tabela:', data))
    .catch(err => console.error('Erro ao buscar dados:', err));
}
*/


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

