// src/main.tsx ou src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { RuntimeConfigProvider } from './hooks/useRuntimeConfig';
import { AuthProvider } from './hooks/useAuth';
import { GlobalConnectionProvider } from './hooks/useGlobalConnection';
import { NotificationProvider } from './hooks/useNotifications';
import { Processador, getProcessador, setProcessador } from './Processador' // Ajuste o caminho se necessário
import { HashRouter } from 'react-router-dom' // Se estiver usando rotas
import { activityTracker } from './lib/activityTracker'; // Sistema de rastreamento

// Inicializar tracker globalmente
activityTracker.init();

// Export for use in other components
export { Processador, getProcessador, setProcessador };

// --- Lógica para conectar ao backend HTTP existente (mais resiliente) ---
// Try a list of candidate ports (common dev ports: 3000, 8080, 3001)
const CANDIDATE_BACKEND_PORTS = [
  Number(process.env.REACT_APP_BACKEND_PORT || 0) || 3000,
  8080,
  3001,
  3002,
];

async function detectBackendPort(): Promise<number | null> {
  for (const p of CANDIDATE_BACKEND_PORTS) {
    if (!p) continue;
    const base = `http://localhost:${p}`;
    try {
      // Try a quick ping
      const r = await fetch(`${base}/api/ping`, { method: 'GET' });
      if (r.ok) return p;
    } catch (e) {
      // ignore and try next
    }
  }
  return null;
}

(async () => {
  const detected = await detectBackendPort();
  const portToUse = detected || Number(process.env.REACT_APP_BACKEND_PORT || 3000);
  const baseUrl = `http://localhost:${portToUse}`;
  console.log(`Using backend at ${baseUrl} (detected: ${detected !== null})`);
  const processador = setProcessador(portToUse);
  (window as any).backendPort = portToUse;
  try {
    await processador.ping();
    // Listen to backend 'config-changed' events and notify other parts of the renderer
    try {
      processador.onEvent('config-changed', (_payload: any) => {
        try {
          window.dispatchEvent(new CustomEvent('runtime-config-changed'));
        } catch (e) {}
      });
    } catch (e) {}
  } catch (err) {
    console.warn(`Could not connect to backend at ${baseUrl}. Please ensure it is running.`, err);
  }
})();

// --- Fim da lógica de conexão com o backend ---

// Renderiza a aplicação React
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RuntimeConfigProvider>
      <AuthProvider>
        <NotificationProvider>
          <GlobalConnectionProvider>
            <HashRouter> {/* Se estiver usando rotas */}
              <App />
            </HashRouter>
          </GlobalConnectionProvider>
        </NotificationProvider>
      </AuthProvider>
    </RuntimeConfigProvider>
  </React.StrictMode>,
)