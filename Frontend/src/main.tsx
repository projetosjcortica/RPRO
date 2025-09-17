import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { config } from './CFG.ts'
import { Processador, getProcessador, setProcessador } from './Processador'

type StartForkResult = { ok: true; pid: number } | { ok: false; reason: string };

// Export for use in other components
export { Processador, getProcessador, setProcessador };


// Start the backend child process correctly using the preload API.
// TÁ FUNCIONANDO, NÃO MEXER
(window as any).electronAPI.startFork('../back-end/dist/src/index.js', [])
  .then(async (res: StartForkResult) => {
    if (res && res.ok) {
      console.log(res)
      config.contextoPid = res.pid;
      console.log('Backend child process started with PID:', res.pid);
      
      // Set up message listener to handle child responses
      (window as any).electronAPI.onChildMessage((_evt: any, payload: any) => {
        if (payload && payload.msg && payload.msg.type === 'ready') {
          console.log('Child process is ready, sending configuration...');
          sendConfigurationToChild(res.pid);
        }
        if (payload && payload.msg && payload.msg.type === 'config-response') {
          console.log('Configuration applied successfully:', payload.msg.result);
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
  processador.getTableData(1, 10, { dateStart: '2024-01-01' })
    .then(data => console.log('Dados da tabela:', data))
    .catch(err => console.error('Erro ao buscar dados:', err));
  
  // Exemplo: buscar dados para gráficos
  processador.getChartData(1, 100, { formula: 'Produto A' })
    .then(data => console.log('Dados do gráfico:', data))
    .catch(err => console.error('Erro ao buscar dados do gráfico:', err));
}
*/


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

