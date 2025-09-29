// src/main.tsx ou src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { RuntimeConfigProvider } from './hooks/useRuntimeConfig';
import { AuthProvider } from './hooks/useAuth';
import { Processador, getProcessador, setProcessador } from './Processador' // Ajuste o caminho se necessário
import { HashRouter } from 'react-router-dom' // Se estiver usando rotas

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
    .then(() => {
    // console.log('Successfully connected to backend');
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
    <RuntimeConfigProvider>
      <AuthProvider>
        <HashRouter> {/* Se estiver usando rotas */}
          <App />
        </HashRouter>
      </AuthProvider>
    </RuntimeConfigProvider>
  </React.StrictMode>,
)