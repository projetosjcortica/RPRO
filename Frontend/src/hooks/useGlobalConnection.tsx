import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toastManager from '../lib/toastManager';
import { getProcessador } from '../Processador';
import { Loader2 } from 'lucide-react';

type GlobalConnectionContextType = {
  isConnecting: boolean;
  message?: string;
  startConnecting: (message?: string) => void;
  stopConnecting: () => void;
};

const GlobalConnectionContext = createContext<GlobalConnectionContextType | null>(null);

export const useGlobalConnection = (): GlobalConnectionContextType => {
  const ctx = useContext(GlobalConnectionContext);
  if (!ctx) throw new Error('useGlobalConnection must be used within GlobalConnectionProvider');
  return ctx;
};

export const GlobalConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  // Periodic backend health check — show toast when backend unreachable
  useEffect(() => {
    let mounted = true;
    const processador = getProcessador();
    const key = 'backend-connection';

    const check = async () => {
      try {
        await processador.ping();
        // backend reachable — if we previously showed an error, show success and clear
        // try { toastManager.updateSuccess(key, 'Backend conectado', 2000); } catch (e) {}
      } catch (err: any) {
        if (!mounted) return;
        const msg = (err && err.message) ? err.message : String(err || 'Erro de conexão');
        try {
          // Persistent error toast until recovery
          toastManager.updateError(key, `Sistema interno inacessível: ${msg}`, false as any);
        } catch (e) {}
      }
    };

    // Run immediately then every 10s
    void check();
    const id = window.setInterval(() => void check(), 10000);
    return () => { mounted = false; window.clearInterval(id); };
  }, []);

  const startConnecting = useCallback((msg?: string) => {
    setMessage(msg);
    setIsConnecting(true);
  }, []);

  const stopConnecting = useCallback(() => {
    setIsConnecting(false);
    setMessage(undefined);
  }, []);

  return (
    <GlobalConnectionContext.Provider value={{ isConnecting, message, startConnecting, stopConnecting }}>
      {children}
      {isConnecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white/95 rounded-lg p-6 flex flex-col items-center gap-3 shadow">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <div className="text-center">
              <div className="font-semibold">{message ?? 'Conectando...'}</div>
              <div className="text-sm text-gray-600">Aguardando confirmação de conexão</div>
            </div>
          </div>
        </div>
      )}
    </GlobalConnectionContext.Provider>
  );
};

export default GlobalConnectionProvider;
