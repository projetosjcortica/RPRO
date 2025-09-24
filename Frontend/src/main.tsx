// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App'
// import './index.css'
// import { config } from './CFG'
// import { Processador, getProcessador, setProcessador } from './Processador'
// import { BrowserRouter } from 'react-router-dom'

// type StartForkResult = { ok: true; port: number; pid: number } | { ok: false; reason: string };

// // Export for use in other components
// export { Processador, getProcessador, setProcessador };



// // Start the backend child process correctly using the preload API (only in Electron)
// if ((window as any).electronAPI) {
//   // Use relative path to backend - Electron main will resolve the correct entry point
//   (window as any).electronAPI.startFork()
//   .then(async (res: StartForkResult) => {
//     if (res && res.ok) {
//       console.log('Backend started:', res);
//       config.contextoPid = res.pid;
//       (window as any).contextoPid = res.pid;
//       (window as any).backendPort = res.port;
//       console.log('Backend child process started with PID:', res.pid, 'and WebSocket port:', res.port);

//       // Initialize WebSocket-based Processador
//       console.log('Initializing WebSocket Processador on port:', res.port);
//       const p = setProcessador(res.port);
      
//       // For HTTP-based Processador we assume reachable backend
//       await p.waitForConnection(5000);

//       // Setup event handlers
//       p.onEvent('file.processed', (e) => console.log('Arquivo processado:', e));
//       p.onEvent('ready', () => {
//         console.log('Backend WebSocket is ready');
//       });
//       p.onEvent('config-ack', () => {
//         console.log('Configuration applied successfully via WebSocket');
//       });
//       p.onEvent('heartbeat', (hb) => {
//         console.log('[WS Heartbeat]', hb);
//       });
//       p.onEvent('connection-failed', (info) => {
//         console.error('WebSocket connection failed after max attempts:', info);
//       });

//       // Debug: wire stdout/stderr/exit to console
//       (window as any).electronAPI.onChildStdout((_evt: any, data: any) => {
//         if (data?.pid === res.pid) console.log('[child stdout]', data.data);
//       });
//       (window as any).electronAPI.onChildStderr((_evt: any, data: any) => {
//         if (data?.pid === res.pid) console.warn('[child stderr]', data.data);
//       });
//       (window as any).electronAPI.onChildExit((_evt: any, payload: any) => {
//         if (payload?.pid === res.pid) {
//           console.warn('[child exit]', payload);
//           // Try to reconnect or restart backend if needed
//           console.log('Backend process exited, attempting restart...');
//           setTimeout(() => {
//             (window as any).electronAPI.startFork().catch(console.error);
//           }, 2000);
//         }
//       });

//       // Set up message listener to handle child responses
//       (window as any).electronAPI.onChildMessage((_evt: any, payload: any) => {
//         const msg = payload?.msg;
//         if (!msg) return;
//         if (msg.type === 'event') {
//           if (msg.event === 'reforked' && msg.payload?.newPid) {
//             console.warn('Backend reforked. Adopting new PID:', msg.payload.newPid);
//             (window as any).contextoPid = msg.payload.newPid;
//             config.contextoPid = msg.payload.newPid;
//             // WebSocket will reconnect automatically through Processador
//             return;
//           }
//         }
//       });

//       // Send configuration to backend (HTTP)
//       await sendConfigurationToBackend(p);

//     } else {
//       console.warn('Failed to start backend child process', res);
//     }
//   })
//   .catch((err: unknown) => {
//     console.error('Error starting backend child process', err);
//     if (err instanceof Error) {
//       console.error('Error details:', err.stack);
//     }
//   }); 
// } else {
//   console.warn('electronAPI not found. Skipping backend fork (running in non-Electron context).');
  
//   // Try to connect to existing backend if running in browser/dev mode
//   try {
//     console.log('Attempting to connect to existing backend on port 8080...');
//     const p = setProcessador(8080);
    
//     p.waitForConnection(5000).then(async (connected) => {
//       if (connected) {
//           console.log('Connected to existing backend');
        
//           // Setup basic event handlers
//           p.onEvent('ready', () => console.log('Backend is ready'));
//           p.onEvent('heartbeat', (hb) => console.log('[Heartbeat]', hb));
//       } else {
//         console.warn('Could not connect to backend. Please start backend manually.');
//       }
//     });
//   } catch (e) {
//     console.warn('Failed to connect to existing backend:', e);
//   }
// }

// async function sendConfigurationToBackend(processador: Processador, retryCount = 0) {
//   try {
//     console.log(`Attempting to send config via WebSocket, attempt ${retryCount + 1}`);

//     const formData = await (window as any).electronAPI.loadData();
//     console.log('Sending configuration to backend via WebSocket:', formData);

//     // Send config to backend via WebSocket using the 'config' command
//     await processador.sendConfig(formData);
//     console.log('Configuration sent successfully via WebSocket');

//   } catch (configError) {
//     console.error('Error sending configuration via WebSocket:', configError);
    
//     // Retry up to 3 times with increasing delays
//     if (retryCount < 3) {
//       console.log(`Retrying in ${(retryCount + 1) * 1000}ms...`);
//       setTimeout(() => {
//         sendConfigurationToBackend(processador, retryCount + 1);
//       }, (retryCount + 1) * 1000);
//     } else {
//       console.error('Max retries reached, giving up on configuration');
//     }
//   }
// }

// // Exemplo de uso da classe Processador (pode ser removido em produção)
// /*
// if (config.contextoPid) {
//   const processador = getProcessador(config.contextoPid);
//   // Exemplo: buscar dados da tabela
//   processador.relatorioPaginate(1, 10, { dateStart: '2024-01-01' })
//     .then(data => console.log('Dados da tabela:', data))
//     .catch(err => console.error('Erro ao buscar dados:', err));
// }
// */


// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </React.StrictMode>,
// )


// src/main.tsx ou src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Processador, getProcessador, setProcessador } from './Processador' // Ajuste o caminho se necessário
import { BrowserRouter } from 'react-router-dom' // Se estiver usando rotas

// Export for use in other components
export { Processador, getProcessador, setProcessador };

// --- Lógica para conectar ao backend HTTP existente ---
// Assume que o backend está rodando em uma porta conhecida, por exemplo, 3000 (padrão do backend.md)
const BACKEND_PORT = 3000; // Ou defina via variável de ambiente: process.env.REACT_APP_BACKEND_PORT
const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

console.log(`Attempting to connect to backend at ${BACKEND_URL}...`);

// Inicializa o ProcessadorHTTP com a URL base do backend
const processador = setProcessador(BACKEND_PORT); 

// O ProcessadorHTTP não precisa de waitForConnection para uma requisição inicial,
// mas podemos fazer um ping para verificar conectividade.
processador.ping()
  .then((pong) => {
    // console.log('Successfully connected to backend:', pong);
    // Setup basic event handlers (se o ProcessadorHTTP tiver suporte, senão remova)
    // processador.onEvent('ready', () => console.log('Backend is ready'));
    // processador.onEvent('heartbeat', (hb) => console.log('[Heartbeat]', hb));
  })
  .catch((err) => {
    console.warn(`Could not connect to backend at ${BACKEND_URL}. Please ensure it is running.`, err);
    // O aplicativo pode continuar, mas funcionalidades que dependem do backend estarão indisponíveis
    // ou mostrarão erros quando tentarem acessar os endpoints.
  });

// --- Fim da lógica de conexão com o backend ---

// Renderiza a aplicação React
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* Se estiver usando rotas */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)