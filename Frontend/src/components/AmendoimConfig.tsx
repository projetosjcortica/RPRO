import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Loader2, Save, X, Scale, ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "../lib/utils";
import toastManager from "../lib/toastManager";

interface AmendoimConfig {
  duasIHMs: boolean;
  ihm1: {
    ip: string;
    user: string;
    password: string;
    caminhoRemoto: string;
    usadaPara: "entrada" | "saida" | "ambos";
  };
  entrada: {
    tipoRelatorio: "mensal" | "geral";
    mesAno?: string;
    nomeArquivo?: string;
  };
  saida: {
    tipoRelatorio: "mensal" | "geral";
    mesAno?: string;
    nomeArquivo?: string;
  };
  ihm2?: {
    ip: string;
    user: string;
    password: string;
    caminhoRemoto: string;
    usadaPara: "entrada" | "saida";
  };
  mapeamentoBalancas?: {
    entrada: string[];
    saida: string[];
  };
  // NOVO: Seleção direta de qual IHM coleta cada tipo
  ihmEntrada?: "ihm1" | "ihm2";
  ihmSaida?: "ihm1" | "ihm2";
  // Modo de coleta para IHM única
  modoColeta?: "entrada-saida" | "apenas-entrada" | "apenas-saida";
  arquivoEntrada?: string;
  arquivoSaida?: string;
}

interface AmendoimConfigProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export default function AmendoimConfig({ isOpen, onClose, onSave }: AmendoimConfigProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AmendoimConfig>({
    duasIHMs: false,
    ihm1: {
      ip: "",
      user: "anonymous",
      password: "",
      caminhoRemoto: "/InternalStorage/data/",
      usadaPara: "ambos",
    },
    entrada: {
      tipoRelatorio: "mensal",
      mesAno: new Date().toISOString().slice(0, 7),
    },
    saida: {
      tipoRelatorio: "mensal",
      mesAno: new Date().toISOString().slice(0, 7),
    },
    mapeamentoBalancas: {
      entrada: [],
      saida: [],
    },
    ihmEntrada: "ihm1",
    ihmSaida: "ihm1",
  });

  // Buscar configuração atual
  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/amendoim/config");
      if (res.ok) {
        const data = await res.json();
        
        // Converter configuração do backend para formato do componente
        const newConfig: AmendoimConfig = {
          duasIHMs: data.config?.duasIHMs || false,
          ihm1: {
            ip: data.config?.ip || "",
            user: data.config?.user || "anonymous",
            password: data.config?.password || "",
            caminhoRemoto: data.config?.caminhoRemoto || "/InternalStorage/data/",
            usadaPara: data.config?.ihm1UsadaPara || "ambos",
          },
          entrada: {
            tipoRelatorio: data.config?.arquivoEntrada?.includes("Relatorio_1") ? "geral" : "mensal",
            mesAno: extractMesAno(data.config?.arquivoEntrada),
            nomeArquivo: data.config?.arquivoEntrada,
          },
          saida: {
            tipoRelatorio: data.config?.arquivoSaida?.includes("Relatorio_1") ? "geral" : "mensal",
            mesAno: extractMesAno(data.config?.arquivoSaida),
            nomeArquivo: data.config?.arquivoSaida,
          },
          mapeamentoBalancas: data.config?.mapeamentoBalancas || {
            entrada: [],
            saida: [],
          },
          ihmEntrada: data.config?.ihmEntrada || "ihm1",
          ihmSaida: data.config?.ihmSaida || "ihm1",
          // Carregar modo de coleta e arquivos
          modoColeta: data.config?.modoColeta,
          arquivoEntrada: data.config?.arquivoEntrada,
          arquivoSaida: data.config?.arquivoSaida,
        };

        if (data.config?.ihm2) {
          newConfig.ihm2 = data.config.ihm2;
        }

        setConfig(newConfig);
      }
    } catch (err) {
      console.error("Erro ao buscar configuração:", err);
    } finally {
      setLoading(false);
    }
  };

  // Extrair mês/ano de nome de arquivo (ex: "Relatorio_2025_11.csv" -> "2025-11")
  const extractMesAno = (nomeArquivo?: string): string => {
    if (!nomeArquivo) return new Date().toISOString().slice(0, 7);
    
    const match = nomeArquivo.match(/Relatorio_(\d{4})_(\d{2})\.csv/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
    return new Date().toISOString().slice(0, 7);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // ⚡ VALIDAÇÃO: IP obrigatório
      if (!config.ihm1.ip || config.ihm1.ip.trim() === "") {
        toastManager.updateError("amendoim-config-save", "IP da IHM1 é obrigatório");
        return;
      }

      // ⚡ VALIDAÇÃO: Se usar duas IHMs, IP da IHM2 é obrigatório
      if (config.duasIHMs && (!config.ihm2?.ip || config.ihm2.ip.trim() === "")) {
        toastManager.updateError("amendoim-config-save", "IP da IHM2 é obrigatório quando usar duas IHMs");
        return;
      }
      
      // Preparar payload para o backend (novo formato simplificado)
      const payload: any = {
        duasIHMs: config.duasIHMs,
        ip: config.ihm1.ip.trim(),
        user: config.ihm1.user || "anonymous",
        password: config.ihm1.password || "",
        caminhoRemoto: config.ihm1.caminhoRemoto || "/InternalStorage/data/",
      };

      // ⚡ Adicionar ihm2 se configurada
      if (config.duasIHMs && config.ihm2) {
        payload.ihm2 = {
          ip: (config.ihm2.ip || "").trim(),
          user: config.ihm2.user || "anonymous",
          password: config.ihm2.password || "",
          caminhoRemoto: config.ihm2.caminhoRemoto || "/InternalStorage/data/",
          usadaPara: config.ihm2.usadaPara || "saida",
        };
      }

      const res = await fetch("http://localhost:3000/api/amendoim/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar configuração");
      }

      toastManager.updateSuccess("amendoim-config-save", "Configuração salva com sucesso!");
      
      if (onSave) {
        onSave();
      }
      
      onClose();
    } catch (err: any) {
      toastManager.updateError("amendoim-config-save", err.message || "Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  console.log('[AmendoimConfig] 🔍 Renderizando modal - duasIHMs:', config.duasIHMs, 'modoColeta:', (config as any).modoColeta);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Configuração de Coleta - Amendoim</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Configuração da IHM Principal */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-3">IHM Principal (IHM1)</h3>
                
                <div className="text-xs text-blue-700 mb-3 bg-blue-100 border border-blue-200 rounded p-2">
                  {config.duasIHMs 
                    ? "ℹ️ Esta IHM coleta dados de ENTRADA" 
                    : "ℹ️ Esta IHM coleta dados de ENTRADA e SAÍDA"}
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        IP da IHM:
                      </label>
                      <input
                        type="text"
                        value={config.ihm1.ip}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ihm1: { ...config.ihm1, ip: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Ex: 192.168.1.10"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Caminho Remoto:
                      </label>
                      <input
                        type="text"
                        value={config.ihm1.caminhoRemoto}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ihm1: { ...config.ihm1, caminhoRemoto: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="/InternalStorage/data/"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Usuário FTP:
                      </label>
                      <input
                        type="text"
                        value={config.ihm1.user}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ihm1: { ...config.ihm1, user: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="anonymous"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">
                        Senha FTP:
                      </label>
                      <input
                        type="password"
                        value={config.ihm1.password}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            ihm1: { ...config.ihm1, password: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuração de IHMs */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Sistema de IHMs</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    onClick={() => setConfig({ ...config, duasIHMs: false })}
                    className={cn(
                      "flex-1",
                      !config.duasIHMs
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    Uma IHM (Mesma fonte)
                  </Button>
                  <Button
                    onClick={() => setConfig({ ...config, duasIHMs: true })}
                    className={cn(
                      "flex-1",
                      config.duasIHMs
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    Duas IHMs (Fontes separadas)
                  </Button>
                </div>

                {config.duasIHMs && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-bold text-yellow-800 mb-3">
                      Configuração da Segunda IHM
                    </h4>
                    
                    <div className="text-xs text-yellow-700 mb-3 bg-yellow-100 border border-yellow-200 rounded p-2">
                      ℹ️ Esta IHM coleta dados de SAÍDA
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            IP da IHM2:
                          </label>
                          <input
                            type="text"
                            value={config.ihm2?.ip || ""}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                ihm2: { 
                                  ...config.ihm2!, 
                                  ip: e.target.value, 
                                  usadaPara: "saida",
                                  caminhoRemoto: config.ihm2?.caminhoRemoto || "/InternalStorage/data/",
                                },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="Ex: 192.168.1.100"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Caminho Remoto:
                          </label>
                          <input
                            type="text"
                            value={config.ihm2?.caminhoRemoto || "/InternalStorage/data/"}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                ihm2: { ...config.ihm2!, caminhoRemoto: e.target.value, usadaPara: "saida" },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="/InternalStorage/data/"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Usuário:
                          </label>
                          <input
                            type="text"
                            value={config.ihm2?.user || ""}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                ihm2: { ...config.ihm2!, user: e.target.value, usadaPara: "saida" },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="admin"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Senha:
                          </label>
                          <input
                            type="password"
                            value={config.ihm2?.password || ""}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                ihm2: { ...config.ihm2!, password: e.target.value, usadaPara: "saida" },
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                            placeholder="••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* INFORMAÇÃO SOBRE DETECÇÃO AUTOMÁTICA POR BALANÇA */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Detecção Automática de Tipo
                </h3>
                
                <div className="text-sm text-blue-700 space-y-2">
                  <p className="bg-blue-100 border border-blue-200 rounded p-3">
                    🔍 <strong>Sistema Inteligente:</strong> O tipo de registro (entrada/saída) é determinado automaticamente baseado no campo <strong>balança</strong> do CSV.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-white border-2 border-green-300 rounded-lg p-3">
                      <div className="text-xs font-bold text-green-800 mb-1">⬇️ ENTRADA</div>
                      <div className="text-xs text-green-600">Balanças <strong>1</strong> e <strong>2</strong></div>
                    </div>
                    
                    <div className="bg-white border-2 border-orange-300 rounded-lg p-3">
                      <div className="text-xs font-bold text-orange-800 mb-1">⬆️ SAÍDA</div>
                      <div className="text-xs text-orange-600">Balança <strong>3</strong></div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-blue-600 mt-3 italic">
                    💡 Todos os arquivos CSV encontrados no diretório FTP serão processados automaticamente.
                  </p>
                </div>
              </div>

              {/* Informação sobre roteamento automático */}
              {config.duasIHMs && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Roteamento Automático de Dados
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Informação ENTRADA fixo em IHM1 */}
                    <div className="bg-white border-2 border-green-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowBigDown className="h-5 w-5 text-green-600" />
                        <label className="text-sm font-bold text-green-700">
                          Dados de ENTRADA
                        </label>
                      </div>
                      <div className="bg-green-600 text-white px-3 py-2 rounded-md text-center font-medium">
                        IHM 1
                      </div>
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        ✓ IP: {config.ihm1.ip || "Não configurado"}
                      </div>
                    </div>

                    {/* Informação SAÍDA fixo em IHM2 */}
                    <div className="bg-white border-2 border-blue-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ArrowBigUp className="h-5 w-5 text-blue-600" />
                        <label className="text-sm font-bold text-blue-700">
                          Dados de SAÍDA
                        </label>
                      </div>
                      <div className="bg-blue-600 text-white px-3 py-2 rounded-md text-center font-medium">
                        IHM 2
                      </div>
                      <div className="mt-2 text-xs text-blue-600 font-medium">
                        ✓ IP: {config.ihm2?.ip || "Não configurado"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-purple-100 border border-purple-200 rounded text-xs text-purple-700">
                    <strong>ℹ️ Automático:</strong> O sistema coleta todos os CSVs de ambas IHMs e determina entrada/saída pela balança.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="border-gray-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configuração
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
