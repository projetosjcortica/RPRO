import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);

// Use contextBridge
if (typeof window !== 'undefined' && (window as any).ipcRenderer && typeof (window as any).ipcRenderer.on === 'function') {
  (window as any).ipcRenderer.on('main-process-message', (_event: any, message: any) => {
    console.log(message)
  })
} else {
  // ipcRenderer not available (e.g. running in browser dev), skip binding
}
