import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface RefreshButtonProps {
  onRefresh?: () => void | Promise<void>;
  label?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  type?: 'default' | 'ihm' | 'amendoim';
  ihmConfig?: { ip: string; user: string; password: string };
}

export function RefreshButton({ 
  onRefresh, 
  label = 'Atualizar', 
  className = '',
  size = 'default',
  type = 'default',
  ihmConfig
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleIhmFetch = async () => {
    if (!ihmConfig?.ip) {
      throw new Error('Configuração IHM não fornecida');
    }

    const params = new URLSearchParams({
      ip: ihmConfig.ip,
      user: ihmConfig.user || 'anonymous',
      password: ihmConfig.password || '',
    });

    const response = await fetch(`http://localhost:3000/api/ihm/fetchLatest?${params}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados da IHM: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (type === 'ihm' || type === 'amendoim') {
        const result = await handleIhmFetch();
        console.log('Busca IHM concluída:', result);
        // Se houver callback onRefresh, executá-lo após a busca
        if (onRefresh) {
          await Promise.resolve(onRefresh());
        }
      } else if (onRefresh) {
        await Promise.resolve(onRefresh());
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      // Você pode adicionar um toast/notificação aqui
    } finally {
      // Manter animação por pelo menos 500ms para feedback visual
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      size={size}
      variant="outline"
      className={`${className} ${isRefreshing ? 'pointer-events-none' : ''}`}
      title={type === 'ihm' ? 'Buscar novos dados na IHM' : type === 'amendoim' ? 'Atualizar dados de amendoim' : 'Atualizar dados'}
    >
      <RefreshCw 
        className={`w-4 h-4 ${label ? 'mr-2' : ''} ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {label && <span>{label}</span>}
    </Button>
  );
}
