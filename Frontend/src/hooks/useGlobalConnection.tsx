import React, { createContext, useContext, useState, useCallback } from 'react';
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
