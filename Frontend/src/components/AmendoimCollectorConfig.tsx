import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Loader2, PlayCircle, StopCircle, RefreshCw, TestTube2, Trash2, Database } from "lucide-react";
import toastManager from "../lib/toastManager";

interface CollectorConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  remotePath: string;
  filePattern: string;
  enabled: boolean;
}

interface CollectorStatus {
  running: boolean;
  enabled: boolean;
}

export function AmendoimCollectorConfig() {
  const [config, setConfig] = useState<CollectorConfig>({
    host: "",
    port: 21,
    user: "",
    password: "",
    remotePath: "/amendoim",
    filePattern: "Amendoim_*.csv",
    enabled: false,
  });

  const [status, setStatus] = useState<CollectorStatus>({
    running: false,
    enabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [showCache, setShowCache] = useState(false);

  // Carregar configuração e status ao montar
  useEffect(() => {
    loadConfig();
    loadStatus();
    
    // Atualizar status a cada 10 segundos
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Erro ao carregar configuração:", err);
      toastManager.updateError('amendoim-collector-config', `Erro ao carregar configuração do coletor: ${(err as any)?.message || String(err)}. Verifique rede e backend.`);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Erro ao carregar status:", err);
      toastManager.updateError('amendoim-collector-status', `Erro ao carregar status do coletor: ${(err as any)?.message || String(err)}. Verifique IHM, credenciais e firewall.`);
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Configuração salva com sucesso!" });
        await loadStatus();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erro ao salvar configuração" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao salvar configuração" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/test", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        toastManager.updateSuccess('amendoim-test-conn', result.message, 4000);
      } else {
        setMessage({ type: "error", text: result.message });
        toastManager.updateError('amendoim-test-conn', `${result.message}. Verifique host/porta/usuário/senha e regras de firewall.`);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao testar conexão" });
      toastManager.updateError('amendoim-test-conn', `Erro ao testar conexão: ${err?.message || String(err)}. Verifique rede e IHM.`);
    } finally {
      setTesting(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intervalMinutes }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Coletor iniciado com sucesso!" });
        toastManager.updateSuccess('amendoim-collector-start', 'Coletor iniciado com sucesso', 3000);
        await loadStatus();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erro ao iniciar coletor" });
        toastManager.updateError('amendoim-collector-start', error.error || "Erro ao iniciar coletor. Verifique logs e configuração da IHM.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao iniciar coletor" });
      toastManager.updateError('amendoim-collector-start', `Erro ao iniciar coletor: ${err?.message || String(err)}. Verifique backend e conectividade.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/stop", {
        method: "POST",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Coletor parado com sucesso!" });
        toastManager.updateSuccess('amendoim-collector-stop', 'Coletor parado com sucesso', 3000);
        await loadStatus();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erro ao parar coletor" });
        toastManager.updateError('amendoim-collector-stop', error.error || "Erro ao parar coletor. Verifique backend.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao parar coletor" });
      toastManager.updateError('amendoim-collector-stop', `Erro ao parar coletor: ${err?.message || String(err)}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectOnce = async () => {
    setCollecting(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/collect", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: `Coleta concluída! ${result.filesProcessed} arquivo(s), ${result.recordsSaved} registro(s) salvos.`,
        });
        toastManager.updateSuccess('amendoim-collector-collect', `Coleta concluída: ${result.filesProcessed} arquivo(s), ${result.recordsSaved} registro(s) salvos.`, 4000);
      } else {
        setMessage({
          type: "error",
          text: `Coleta com erros: ${result.errors.join(", ")}`,
        });
        toastManager.updateError('amendoim-collector-collect', `Coleta com erros: ${result.errors.join(", ")}. Verifique logs e configuração da IHM.`);
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao executar coleta" });
      toastManager.updateError('amendoim-collector-collect', `Erro ao executar coleta: ${err?.message || String(err)}.`);
    } finally {
      setCollecting(false);
    }
  };

  const loadCacheStats = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/cache/stats");
      if (response.ok) {
        const data = await response.json();
        setCacheStats(data);
      }
    } catch (err) {
      console.error("Erro ao carregar estatísticas do cache:", err);
    }
  };

  const handleClearCache = async () => {
    if (!confirm("Tem certeza que deseja limpar todo o cache? Esta ação fará o coletor reprocessar todos os arquivos na próxima execução.")) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/cache", {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Cache limpo com sucesso!" });
        toastManager.updateSuccess('amendoim-collector-clearcache', 'Cache limpo com sucesso', 3000);
        await loadCacheStats();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erro ao limpar cache" });
        toastManager.updateError('amendoim-collector-clearcache', error.error || 'Erro ao limpar cache');
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao limpar cache" });
      toastManager.updateError('amendoim-collector-clearcache', `Erro ao limpar cache: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCache = async () => {
    setShowCache(!showCache);
    if (!showCache) {
      await loadCacheStats();
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <h2 className="text-lg font-semibold mb-4">Configuração do Coletor FTP</h2>

      {/* Status */}
      <div className="mb-4 p-3 border rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <span
              className={`px-2 py-1 rounded text-sm font-semibold ${
                status.running ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
              }`}
            >
              {status.running ? "Rodando" : "Parado"}
            </span>
            <span
              className={`px-2 py-1 rounded text-sm ${
                status.enabled ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              {status.enabled ? "Habilitado" : "Desabilitado"}
            </span>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Formulário de Configuração */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="host">Host FTP</Label>
          <Input
            id="host"
            value={config.host}
            onChange={(e) => setConfig({ ...config, host: e.target.value })}
            placeholder="ftp.exemplo.com"
          />
        </div>

        <div>
          <Label htmlFor="port">Porta</Label>
          <Input
            id="port"
            type="number"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 21 })}
          />
        </div>

        <div>
          <Label htmlFor="user">Usuário</Label>
          <Input
            id="user"
            value={config.user}
            onChange={(e) => setConfig({ ...config, user: e.target.value })}
            placeholder="usuario"
          />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={config.password}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <div>
          <Label htmlFor="remotePath">Caminho Remoto</Label>
          <Input
            id="remotePath"
            value={config.remotePath}
            onChange={(e) => setConfig({ ...config, remotePath: e.target.value })}
            placeholder="/amendoim"
          />
        </div>

        <div>
          <Label htmlFor="filePattern">Padrão de Arquivo</Label>
          <Input
            id="filePattern"
            value={config.filePattern}
            onChange={(e) => setConfig({ ...config, filePattern: e.target.value })}
            placeholder="Amendoim_*.csv"
          />
        </div>

        <div>
          <Label htmlFor="intervalMinutes">Intervalo (minutos)</Label>
          <Input
            id="intervalMinutes"
            type="number"
            value={intervalMinutes}
            onChange={(e) => setIntervalMinutes(parseInt(e.target.value) || 5)}
            min={1}
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
          />
          <Label htmlFor="enabled">Habilitar Coletor</Label>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleSaveConfig} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Salvar Configuração
        </Button>

        <Button onClick={handleTestConnection} disabled={testing} variant="outline">
          {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube2 className="w-4 h-4 mr-2" />}
          Testar Conexão
        </Button>

        {!status.running ? (
          <Button onClick={handleStart} disabled={loading || !config.enabled} className="bg-green-600 hover:bg-green-700">
            <PlayCircle className="w-4 h-4 mr-2" />
            Iniciar Coletor
          </Button>
        ) : (
          <Button onClick={handleStop} disabled={loading} variant="destructive">
            <StopCircle className="w-4 h-4 mr-2" />
            Parar Coletor
          </Button>
        )}

        <Button onClick={handleCollectOnce} disabled={collecting} variant="outline">
          {collecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Coletar Agora
        </Button>

        <Button onClick={handleToggleCache} variant="outline">
          <Database className="w-4 h-4 mr-2" />
          {showCache ? "Ocultar Cache" : "Ver Cache"}
        </Button>

        <Button onClick={handleClearCache} disabled={loading} variant="outline" className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar Cache
        </Button>
      </div>

      {/* Estatísticas do Cache */}
      {showCache && cacheStats && (
        <div className="mt-4 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Cache de Detecção de Mudanças
          </h3>
          
          <div className="mb-3">
            <div className="text-sm text-gray-600">
              Total de arquivos monitorados: <span className="font-semibold">{cacheStats.totalFiles}</span>
            </div>
          </div>

          {cacheStats.files && cacheStats.files.length > 0 ? (
            <div className="overflow-auto max-h-60">
              <table className="w-full text-sm border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2 text-left">Arquivo</th>
                    <th className="border p-2 text-right">Tamanho</th>
                    <th className="border p-2 text-right">Linhas</th>
                    <th className="border p-2 text-left">Última Modificação</th>
                    <th className="border p-2 text-left">Última Mudança</th>
                  </tr>
                </thead>
                <tbody>
                  {cacheStats.files.map((file: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border p-2">{file.fileName}</td>
                      <td className="border p-2 text-right">{(file.fileSize / 1024).toFixed(2)} KB</td>
                      <td className="border p-2 text-right">{file.rowCount}</td>
                      <td className="border p-2">{new Date(file.lastModified).toLocaleString('pt-BR')}</td>
                      <td className="border p-2">{new Date(file.lastChangedAt).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Nenhum arquivo no cache
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            ℹ️ O cache permite que o coletor detecte mudanças nos arquivos e processe apenas arquivos novos ou modificados,
            economizando recursos e evitando reprocessamento desnecessário.
          </div>
        </div>
      )}
    </div>
  );
}
