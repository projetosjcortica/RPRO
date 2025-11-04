import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2, PlayCircle, StopCircle, RefreshCw, Trash2, Database } from "lucide-react";

interface CollectorStatus {
  running: boolean;
}

export function AmendoimCollectorControl() {
  const [status, setStatus] = useState<CollectorStatus>({
    running: false,
  });

  const [loading, setLoading] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [showCache, setShowCache] = useState(false);

  // Carregar status ao montar
  useEffect(() => {
    loadStatus();
    
    // Atualizar status a cada 10 segundos
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Erro ao carregar status:", err);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/amendoim/collector/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intervalMinutes: 5 }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Coletor iniciado com sucesso!" });
        await loadStatus();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erro ao iniciar coletor" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao iniciar coletor" });
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
        await loadStatus();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erro ao parar coletor" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao parar coletor" });
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
      } else {
        setMessage({
          type: "error",
          text: `Coleta com erros: ${result.errors.join(", ")}`,
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao executar coleta" });
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
        await loadCacheStats();
      } else {
        const error = await response.json();
        setMessage({ type: "error", text: error.error || "Erro ao limpar cache" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao limpar cache" });
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
    <div className="flex flex-col gap-3 w-full">
      {/* Status */}
      <div className="p-3 border rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Status do Coletor:</span>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                status.running ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
              }`}
            >
              {status.running ? "Rodando" : "Parado"}
            </span>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {message && (
        <div
          className={`p-3 rounded text-sm ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-2 flex-wrap">
        {!status.running ? (
          <Button onClick={handleStart} disabled={loading} className="bg-green-600 hover:bg-green-700">
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
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Cache de Detecção de Mudanças
          </h3>
          
          <div className="mb-3">
            <div className="text-xs text-gray-600">
              Total de arquivos monitorados: <span className="font-semibold">{cacheStats.totalFiles}</span>
            </div>
          </div>

          {cacheStats.files && cacheStats.files.length > 0 ? (
            <div className="overflow-auto max-h-60">
              <table className="w-full text-xs border">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border p-2 text-left">Arquivo</th>
                    <th className="border p-2 text-right">Tamanho</th>
                    <th className="border p-2 text-right">Linhas</th>
                    <th className="border p-2 text-left">Última Modificação</th>
                  </tr>
                </thead>
                <tbody>
                  {cacheStats.files.map((file: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="border p-2">{file.fileName}</td>
                      <td className="border p-2 text-right">{(file.fileSize / 1024).toFixed(2)} KB</td>
                      <td className="border p-2 text-right">{file.rowCount}</td>
                      <td className="border p-2">{new Date(file.lastModified).toLocaleString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4 text-xs">
              Nenhum arquivo no cache
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            ℹ️ O cache permite que o coletor detecte mudanças nos arquivos e processe apenas arquivos novos ou modificados.
          </div>
        </div>
      )}
    </div>
  );
}
