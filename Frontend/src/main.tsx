import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { config } from './CFG'
import { Processador, getProcessador, setProcessador } from './Processador'

type StartForkResult = { ok: true; pid: number } | { ok: false; reason: string };

// Export for use in other components
export { Processador, getProcessador, setProcessador };


// Start the backend child process correctly using the preload API (only in Electron)
if ((window as any).electronAPI) {
  (window as any).electronAPI.startFork('../back-end/dist/index.js', [])
  .then(async (res: StartForkResult) => {
    if (res && res.ok) {
      console.log(res)
      config.contextoPid = res.pid;
  console.log('Backend child process started with PID:', res.pid);
  ;(window as any).contextoPid = res.pid;

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

      // Set up message listener to handle child responses
      (window as any).electronAPI.onChildMessage((_evt: any, payload: any) => {
        const msg = payload?.msg;
        if (!msg) return;
        if (msg.type === 'event') {
          if (msg.event === 'reforked' && msg.payload?.newPid) {
            console.warn('Backend reforked. Adopting new PID:', msg.payload.newPid);
            (window as any).contextoPid = msg.payload.newPid;
            config.contextoPid = msg.payload.newPid;
            try { setProcessador(msg.payload.newPid); } catch {}
            sendConfigurationToChild(msg.payload.newPid);
            return;
          }
          if (msg.event === 'ready') {
            console.log('Child process is ready, sending configuration...');
            sendConfigurationToChild(res.pid);
            // Prepare Processador instance and bind handy events
            const p = setProcessador(res.pid);
            p.onEvent('file.processed', (e) => console.log('Arquivo processado:', e));
          }
          if (msg.event === 'config-ack') {
            console.log('Configuration applied successfully');
          }
        }
        if (msg.type === 'ready') {
          // Legacy path
          console.log('Child process is ready (legacy), sending configuration...');
          sendConfigurationToChild(res.pid);
        }
        if (msg.type === 'config-response') {
          console.log('Configuration applied successfully (legacy):', msg.result);
        }
      });

      // Fallback: send config after a longer delay to ensure child is fully registered
      setTimeout(() => {
        console.log('Timeout triggered, sending configuration...');
        sendConfigurationToChild(res.pid);
      }, 3000); // Increased delay

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

async function sendConfigurationToChild(pid: number, retryCount = 0) {
  try {
    console.log(`Attempting to send config to PID ${pid}, attempt ${retryCount + 1}`);

    const formData = await (window as any).electronAPI.loadData();
    console.log('Sending configuration to child process:', formData);

    // Send config to child process
    const configResult = await (window as any).electronAPI.sendToChild(pid, {
      type: 'config',
      data: formData
    });

    if (configResult.ok) {
      console.log('Configuration sent successfully to child process');
    } else {
      console.warn('Failed to send configuration to child process:', configResult.reason);
      // Immediate refork on not-found
      if (configResult.reason === 'not-found') {
        console.warn('Child not found. Attempting to refork backend and resend config...');
        try {
          const refork = await (window as any).electronAPI.startFork('../back-end/dist/index.js', []);
          if (refork && refork.ok) {
            (window as any).contextoPid = refork.pid;
            config.contextoPid = refork.pid;
            console.log('Reforked backend with PID:', refork.pid);
            await sendConfigurationToChild(refork.pid, 0);
          } else {
            console.error('Refork attempt failed:', refork);
          }
        } catch (reforkErr) {
          console.error('Refork error:', reforkErr);
        }
        return;
      }

      // Retry up to 3 times with increasing delays
      if (retryCount < 3) {
        console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
        setTimeout(() => {
          sendConfigurationToChild(pid, retryCount + 1);
        }, (retryCount + 1) * 1000);
      } else {
        console.error('Max retries reached, giving up on configuration');
      }
    }
  } catch (configError) {
    console.error('Error loading or sending configuration:', configError);
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
    <App />
  </React.StrictMode>,
)

