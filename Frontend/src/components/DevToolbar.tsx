import { RefreshCw, Code, X } from 'lucide-react';
import { Button } from './ui/button';

interface DevToolbarProps {
  enabled: boolean;
  onToggle: () => void;
  onRefreshAll: () => void;
  onRefreshComponent: (componentName: string) => void;
  components?: string[];
}

export function DevToolbar({
  enabled,
  onToggle,
  onRefreshAll,
  onRefreshComponent,
  components = []
}: DevToolbarProps) {
  if (!enabled) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600 shadow-lg"
          onClick={onToggle}
          title="Ativar Modo Dev (Ctrl+Shift+D)"
        >
          <Code className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-lg shadow-2xl border border-gray-700 min-w-[300px]">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-bold text-green-400">Modo Desenvolvedor</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-gray-800"
          onClick={onToggle}
          title="Fechar (Ctrl+Shift+D)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-gray-400 mb-2">
          <div>• Ctrl+Shift+D: Toggle modo dev</div>
          <div>• Ctrl+Shift+R: Refresh geral</div>
        </div>

        <Button
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onRefreshAll}
          title="Ctrl+Shift+R"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Geral
        </Button>

        {components.length > 0 && (
          <>
            <div className="text-xs text-gray-400 font-semibold mt-3 mb-1">
              Componentes:
            </div>
            <div className="space-y-1 max-h-[300px] overflow-y-auto">
              {components.map((comp) => (
                <Button
                  key={comp}
                  size="sm"
                  variant="outline"
                  className="w-full justify-start text-xs bg-gray-800 hover:bg-gray-700 border-gray-600"
                  onClick={() => onRefreshComponent(comp)}
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  {comp}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-500 text-center">
        Cortez Dev Tools v1.0
      </div>
    </div>
  );
}
