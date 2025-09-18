import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { config } from './CFG'
import { Processador, getProcessador, setProcessador } from './Processador'

type StartForkResult = { ok: true; port: number; pid: number } | { ok: false; reason: string };

// Export for use in other components
export { Processador, getProcessador, setProcessador };


// Start the backend child process correctly using the preload API (only in Electron)
if ((window as any).electronAPI) {
  (window as any).electronAPI.startFork('../back-end/dist/index.js', [])
  .then(async (res: StartForkResult) => {
    if (res && res.ok) {
      console.log('Backend started:', res);
      config.contextoPid = res.pid;
      (window as any).contextoPid = res.pid;
      (window as any).backendPort = res.port;
  console.log('Backend child process started with PID:', res.pid, 'and WebSocket port:', res.port);

      // Debug: wire stdout/stderr/exit to console
      (window as any).electronAPI.onChildStdout((_evt: any, data: any) => {
        if (data?.pid === res.pid) console.log('[child stdout]', data.data);
      });
      (window as any).electronAPI.onChildStderr((_evt: any, data: any) => {
        if (data?.pid === res.pid) console.warn('[child stderr]', data.data);
      });
      (window as any).electronAPI.onChildExit((_evt: any, payload: any) => {
        if (payload?.pid === res.pid) console.warn('[child exit]', payload);
      });

      // Set up message listener to handle child responses - no longer needed for WebSocket communication
      // but keeping for legacy compatibility
      (window as any).electronAPI.onChildMessage((_evt: any, payload: any) => {
        const msg = payload?.msg;
        if (!msg) return;
        if (msg.type === 'event') {
          if (msg.event === 'reforked' && msg.payload?.newPid) {
            console.warn('Backend reforked. Adopting new PID:', msg.payload.newPid);
            (window as any).contextoPid = msg.payload.newPid;
            config.contextoPid = msg.payload.newPid;
            // Note: WebSocket will reconnect automatically through Processador
            return;
          }
        }
      });

      // Initialize WebSocket-based Processador
      console.log('Initializing WebSocket Processador on port:', res.port);
      const p = setProcessador(res.port);
      p.onEvent('file.processed', (e) => console.log('Arquivo processado:', e));
      p.onEvent('ready', () => {
        console.log('Backend WebSocket is ready, sending configuration...');
        sendConfigurationToBackend(p);
      });
      p.onEvent('config-ack', () => {
        console.log('Configuration applied successfully via WebSocket');
        p.collectorStart().catch((err) => {
          console.error('Error starting collector via WebSocket:', err);
        });
      });
      p.onEvent('heartbeat', (hb) => {
        console.log('[WS Heartbeat]', hb);
      });

      // Start WS loop (optional; backend also supports env auto-start)
      try {
        await p.wsLoopStart(10000);
      } catch (e) {
        console.warn('Could not start WS heartbeat loop:', e);
      }

      // Fallback: send config after a delay to ensure WebSocket connection is established
      setTimeout(() => {
        console.log('Timeout triggered, sending configuration via WebSocket...');
        sendConfigurationToBackend(p);
      }, 3000);

    } else {
      console.warn('Failed to start backend child process', res);
    }
  })
  .catch((err: unknown) => {
    console.error('Error starting backend child process', err);
  });
} else {
  console.warn('electronAPI not found. Skipping backend fork (running in non-Electron context).');
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


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

