import { useState, useEffect } from 'react';

type SystemMode = 'racao' | 'amendoim';

/**
 * Hook para gerenciar o modo do sistema (Ração ou Amendoim)
 * Lê a configuração do admin-config e escuta mudanças
 */
export function useSystemMode(): SystemMode {
  const [mode, setMode] = useState<SystemMode>('racao');

  useEffect(() => {
    // Carregar modo salvo
    const loadMode = async () => {
      try {
        const electronAPI: any = (window as any).electronAPI;
        const adminConfig = electronAPI?.loadData 
          ? await electronAPI.loadData('admin-config') 
          : null;
        
        if (adminConfig?.systemMode) {
          setMode(adminConfig.systemMode);
        }
      } catch (error) {
        console.error('Erro ao carregar modo do sistema:', error);
      }
    };

    loadMode();

    // Escutar mudanças no modo
    const handleModeChange = (event: any) => {
      const newMode = event.detail?.mode;
      if (newMode === 'racao' || newMode === 'amendoim') {
        setMode(newMode);
        // Forçar recarregamento da página para aplicar mudanças
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    };

    window.addEventListener('system-mode-changed', handleModeChange);
    
    return () => {
      window.removeEventListener('system-mode-changed', handleModeChange);
    };
  }, []);

  return mode;
}
