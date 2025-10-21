import { useState } from 'react';
import { 
  RefreshCw, 
  Code, 
  X, 
  Network, 
  Activity, 
  Terminal, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { NetworkRequest, PerformanceMetric, ConsoleLog } from '../hooks/useDevMode';

interface AdvancedDevToolbarProps {
  enabled: boolean;
  onToggle: () => void;
  onRefreshAll: () => void;
  onRefreshComponent: (componentName: string) => void;
  components?: string[];
  showNetworkMonitor: boolean;
  showPerformanceMonitor: boolean;
  showConsoleMonitor: boolean;
  onToggleNetwork: () => void;
  onTogglePerformance: () => void;
  onToggleConsole: () => void;
  networkRequests: NetworkRequest[];
  performanceMetrics: PerformanceMetric[];
  consoleLogs: ConsoleLog[];
  onClearLogs: () => void;
}

type TabType = 'components' | 'network' | 'performance' | 'console';

export function AdvancedDevToolbar({
  enabled,
  onToggle,
  onRefreshAll,
  onRefreshComponent,
  components = [],
  showNetworkMonitor,
  showPerformanceMonitor,
  showConsoleMonitor,
  onToggleNetwork,
  onTogglePerformance,
  onToggleConsole,
  networkRequests,
  performanceMetrics,
  consoleLogs,
  onClearLogs
}: AdvancedDevToolbarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('components');
  const [isExpanded, setIsExpanded] = useState(true);

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

  const formatDuration = (ms: number) => {
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'gray';
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'blue';
    if (status >= 400 && status < 500) return 'yellow';
    return 'red';
  };

  const getLogIcon = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'components' as TabType, label: 'Componentes', icon: RefreshCw, count: components?.length || 0 },
    { id: 'network' as TabType, label: 'Rede', icon: Network, count: networkRequests?.length || 0, active: showNetworkMonitor },
    { id: 'performance' as TabType, label: 'Performance', icon: Activity, count: performanceMetrics?.length || 0, active: showPerformanceMonitor },
    { id: 'console' as TabType, label: 'Console', icon: Terminal, count: consoleLogs?.length || 0, active: showConsoleMonitor }
  ];

  const avgResponseTime = (networkRequests?.length || 0) > 0
    ? networkRequests.reduce((acc, req) => acc + (req.duration || 0), 0) / networkRequests.filter(r => r.duration).length
    : 0;

  const avgRenderTime = (performanceMetrics?.filter(m => m.type === 'render')?.length || 0) > 0
    ? performanceMetrics.filter(m => m.type === 'render').reduce((acc, m) => acc + m.duration, 0) / performanceMetrics.filter(m => m.type === 'render').length
    : 0;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 flex flex-col"
      style={{ 
        width: isExpanded ? '600px' : '300px',
        maxHeight: isExpanded ? '80vh' : 'auto',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-bold text-green-400">Cortez DevTools</h3>
          <Badge variant="outline" className="text-xs border-green-500 text-green-400">v2.0</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-gray-800"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Minimizar" : "Expandir"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
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
      </div>

      {isExpanded && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-800 text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <Badge variant="secondary" className="text-xs h-4 px-1">
                    {tab.count}
                  </Badge>
                )}
                {tab.active !== undefined && (
                  <div className={`w-2 h-2 rounded-full ${tab.active ? 'bg-green-500' : 'bg-gray-600'}`} />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3" style={{ maxHeight: '60vh' }}>
            {/* Components Tab */}
            {activeTab === 'components' && (
              <div className="space-y-2">
                <div className="text-xs text-gray-400 mb-3">
                  <div>• Ctrl+Shift+D: Toggle modo dev</div>
                  <div>• Ctrl+Shift+R: Refresh geral</div>
                  <div>• Ctrl+Shift+N/P/C: Toggle monitores</div>
                  <div>• Ctrl+Shift+X: Limpar logs</div>
                </div>

                <Button
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={onRefreshAll}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Geral
                </Button>

                <div className="text-xs text-gray-400 font-semibold mt-3 mb-1">
                  Componentes ({components?.length || 0}):
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {(components || []).map((comp) => (
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
              </div>
            )}

            {/* Network Tab */}
            {activeTab === 'network' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs">
                    <div className="text-gray-400">Total: {networkRequests?.length || 0} requisições</div>
                    <div className="text-gray-400">Tempo médio: {formatDuration(avgResponseTime)}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onToggleNetwork}
                    className={`text-xs ${showNetworkMonitor ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700'}`}
                  >
                    {showNetworkMonitor ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>

                {!showNetworkMonitor && (
                  <div className="text-center text-gray-500 py-8">
                    Monitor de rede desativado. Pressione Ctrl+Shift+N para ativar.
                  </div>
                )}

                {showNetworkMonitor && (networkRequests?.length || 0) === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma requisição capturada ainda.
                  </div>
                )}

                <div className="space-y-1">
                  {(networkRequests || []).map((req) => (
                    <div
                      key={req.id}
                      className="bg-gray-800 p-2 rounded text-xs border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs h-4 px-1 bg-${getStatusColor(req.status)}-600`}>
                            {req.method}
                          </Badge>
                          {req.status && (
                            <Badge variant="outline" className={`text-xs h-4 px-1 border-${getStatusColor(req.status)}-500`}>
                              {req.status}
                            </Badge>
                          )}
                          {req.error && (
                            <Badge variant="destructive" className="text-xs h-4 px-1">
                              ERROR
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          {req.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(req.duration)}
                            </span>
                          )}
                          {req.size && <span>{formatSize(req.size)}</span>}
                        </div>
                      </div>
                      <div className="text-gray-300 truncate">{req.url}</div>
                      <div className="text-gray-500 text-xs mt-1">{formatTime(req.timestamp)}</div>
                      {req.error && (
                        <div className="text-red-400 text-xs mt-1">Error: {req.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs">
                    <div className="text-gray-400">Total: {performanceMetrics?.length || 0} métricas</div>
                    <div className="text-gray-400">Render médio: {formatDuration(avgRenderTime)}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onTogglePerformance}
                    className={`text-xs ${showPerformanceMonitor ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700'}`}
                  >
                    {showPerformanceMonitor ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>

                {!showPerformanceMonitor && (
                  <div className="text-center text-gray-500 py-8">
                    Monitor de performance desativado. Pressione Ctrl+Shift+P para ativar.
                  </div>
                )}

                {showPerformanceMonitor && (performanceMetrics?.length || 0) === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhuma métrica capturada ainda.
                  </div>
                )}

                <div className="space-y-1">
                  {(performanceMetrics || []).map((metric) => (
                    <div
                      key={metric.id}
                      className="bg-gray-800 p-2 rounded text-xs border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs h-4 px-1 ${
                            metric.type === 'render' ? 'bg-purple-600' :
                            metric.type === 'api' ? 'bg-blue-600' :
                            'bg-gray-600'
                          }`}>
                            {metric.type}
                          </Badge>
                          <span className="text-gray-300">{metric.name}</span>
                        </div>
                        <span className={`flex items-center gap-1 ${
                          metric.duration < 100 ? 'text-green-400' :
                          metric.duration < 500 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {formatDuration(metric.duration)}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs">{formatTime(metric.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Console Tab */}
            {activeTab === 'console' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-400">
                    Total: {consoleLogs?.length || 0} logs
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onToggleConsole}
                    className={`text-xs ${showConsoleMonitor ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700'}`}
                  >
                    {showConsoleMonitor ? 'Ativo' : 'Inativo'}
                  </Button>
                </div>

                {!showConsoleMonitor && (
                  <div className="text-center text-gray-500 py-8">
                    Monitor de console desativado. Pressione Ctrl+Shift+C para ativar.
                  </div>
                )}

                {showConsoleMonitor && (consoleLogs?.length || 0) === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Nenhum log capturado ainda.
                  </div>
                )}

                <div className="space-y-1">
                  {(consoleLogs || []).map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded text-xs border ${
                        log.type === 'error' ? 'bg-red-900/20 border-red-700' :
                        log.type === 'warn' ? 'bg-yellow-900/20 border-yellow-700' :
                        log.type === 'info' ? 'bg-blue-900/20 border-blue-700' :
                        'bg-gray-800 border-gray-700'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-1">
                        {getLogIcon(log.type)}
                        <div className="flex-1">
                          <pre className="text-gray-300 whitespace-pre-wrap break-words font-mono">
                            {log.message}
                          </pre>
                        </div>
                      </div>
                      <div className="text-gray-500 text-xs">{formatTime(log.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-2 flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-gray-400 hover:text-white"
              onClick={onClearLogs}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Limpar Logs (Ctrl+Shift+X)
            </Button>
            <div className="text-xs text-gray-500">
              Cortez Dev Tools v2.0
            </div>
          </div>
        </>
      )}
    </div>
  );
}
