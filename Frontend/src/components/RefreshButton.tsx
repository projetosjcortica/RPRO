import { RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void>;
  label?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function RefreshButton({ 
  onRefresh, 
  label = 'Atualizar', 
  className = '',
  size = 'default'
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.resolve(onRefresh());
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
      className={`${className} ${isRefreshing ? 'pointer-events-none' : ''} z-10 w-9 absolute top-1 right-1`}
      title="Atualizar dados (ou pressione Ctrl+Shift+R no modo dev)"
    >
      <RefreshCw 
        className={`w-4 h-4 ${label ? 'mr-2' : ''} ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      {label && <span>{label}</span>}
    </Button>
  );
}
