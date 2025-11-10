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
          duasIHMs: data.duasIHMs || false,
          ihm1: {
            ip: data.ip || "",
            user: data.user || "anonymous",
            password: data.password || "",
            caminhoRemoto: data.caminhoRemoto || "/InternalStorage/data/",
            usadaPara: data.ihm1UsadaPara || "ambos",
          },
          entrada: {
            tipoRelatorio: data.arquivoEntrada?.includes("Relatorio_1") ? "geral" : "mensal",
            mesAno: extractMesAno(data.arquivoEntrada),
            nomeArquivo: data.arquivoEntrada,
          },
          saida: {
            tipoRelatorio: data.arquivoSaida?.includes("Relatorio_1") ? "geral" : "mensal",
            mesAno: extractMesAno(data.arquivoSaida),
            nomeArquivo: data.arquivoSaida,
          },
          mapeamentoBalancas: data.mapeamentoBalancas || {
            entrada: [],
            saida: [],
          },
          ihmEntrada: data.ihmEntrada || "ihm1",
          ihmSaida: data.ihmSaida || "ihm1",
        };

        if (data.ihm2) {
          newConfig.ihm2 = data.ihm2;
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

  // Gerar nome de arquivo baseado na configuração
  const gerarNomeArquivo = (tipo: "entrada" | "saida"): string => {
    const cfg = config[tipo];
    
    if (cfg.nomeArquivo) {
      return cfg.nomeArquivo;
    }

    if (cfg.tipoRelatorio === "geral") {
      return "Relatorio_1.csv";
    }

    // Mensal
    if (cfg.mesAno) {
      const [ano, mes] = cfg.mesAno.split("-");
      return `Relatorio_${ano}_${mes}.csv`;
    }

    return "Relatorio_1.csv";
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Preparar payload para o backend
      const payload: any = {
        duasIHMs: config.duasIHMs,
        arquivoEntrada: gerarNomeArquivo("entrada"),
        arquivoSaida: gerarNomeArquivo("saida"),
        ip: config.ihm1.ip,
        user: config.ihm1.user,
        password: config.ihm1.password,
        caminhoRemoto: config.ihm1.caminhoRemoto,
        ihm1UsadaPara: config.ihm1.usadaPara,
        mapeamentoBalancas: config.mapeamentoBalancas,
        ihmEntrada: config.ihmEntrada,
        ihmSaida: config.ihmSaida,
      };

      if (config.duasIHMs && config.ihm2) {
        payload.ihm2 = config.ihm2;
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

                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1 block">
                      Esta IHM será usada para:
                    </label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          setConfig({
                            ...config,
                            ihm1: { ...config.ihm1, usadaPara: "entrada" },
                          })
                        }
                        className={cn(
                          "flex-1",
                          config.ihm1.usadaPara === "entrada"
                            ? "bg-green-600 text-white"
                            : "bg-white text-gray-600 border"
                        )}
                      >
                        Apenas Entrada
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setConfig({
                            ...config,
                            ihm1: { ...config.ihm1, usadaPara: "saida" },
                          })
                        }
                        className={cn(
                          "flex-1",
                          config.ihm1.usadaPara === "saida"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600 border"
                        )}
                      >
                        Apenas Saída
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setConfig({
                            ...config,
                            ihm1: { ...config.ihm1, usadaPara: "ambos" },
                          })
                        }
                        className={cn(
                          "flex-1",
                          config.ihm1.usadaPara === "ambos"
                            ? "bg-purple-600 text-white"
                            : "bg-white text-gray-600 border"
                        )}
                      >
                        Ambos (E + S)
                      </Button>
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
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">
                          Usada para:
                        </label>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setConfig({
                                ...config,
                                ihm2: { ...config.ihm2!, usadaPara: "entrada" },
                              })
                            }
                            className={cn(
                              "flex-1",
                              config.ihm2?.usadaPara === "entrada"
                                ? "bg-green-600 text-white"
                                : "bg-white text-gray-600 border"
                            )}
                          >
                            Entrada
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              setConfig({
                                ...config,
                                ihm2: { ...config.ihm2!, usadaPara: "saida" },
                              })
                            }
                            className={cn(
                              "flex-1",
                              config.ihm2?.usadaPara === "saida"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-600 border"
                            )}
                          >
                            Saída
                          </Button>
                        </div>
                      </div>

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
                              ihm2: { ...config.ihm2!, ip: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          placeholder="Ex: 192.168.1.100"
                        />
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
                                ihm2: { ...config.ihm2!, user: e.target.value },
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
                                ihm2: { ...config.ihm2!, password: e.target.value },
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

              {/* Seleção de IHM por Tipo de Dado */}
              {config.duasIHMs && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Roteamento de Dados
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Seleção IHM para ENTRADA */}
                    <div className="bg-white border-2 border-green-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowBigDown className="h-5 w-5 text-green-600" />
                        <label className="text-sm font-bold text-green-700">
                          Dados de ENTRADA coletados de:
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setConfig({ ...config, ihmEntrada: "ihm1" })}
                          className={cn(
                            "flex-1",
                            config.ihmEntrada === "ihm1"
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          IHM 1
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setConfig({ ...config, ihmEntrada: "ihm2" })}
                          className={cn(
                            "flex-1",
                            config.ihmEntrada === "ihm2"
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          IHM 2
                        </Button>
                      </div>
                      {config.ihmEntrada === "ihm1" && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          ✓ Usando IP: {config.ihm1.ip || "Não configurado"}
                        </div>
                      )}
                      {config.ihmEntrada === "ihm2" && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          ✓ Usando IP: {config.ihm2?.ip || "Não configurado"}
                        </div>
                      )}
                    </div>

                    {/* Seleção IHM para SAÍDA */}
                    <div className="bg-white border-2 border-blue-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowBigUp className="h-5 w-5 text-blue-600" />
                        <label className="text-sm font-bold text-blue-700">
                          Dados de SAÍDA coletados de:
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setConfig({ ...config, ihmSaida: "ihm1" })}
                          className={cn(
                            "flex-1",
                            config.ihmSaida === "ihm1"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          IHM 1
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setConfig({ ...config, ihmSaida: "ihm2" })}
                          className={cn(
                            "flex-1",
                            config.ihmSaida === "ihm2"
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          IHM 2
                        </Button>
                      </div>
                      {config.ihmSaida === "ihm1" && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          ✓ Usando IP: {config.ihm1.ip || "Não configurado"}
                        </div>
                      )}
                      {config.ihmSaida === "ihm2" && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          ✓ Usando IP: {config.ihm2?.ip || "Não configurado"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-purple-100 border border-purple-200 rounded text-xs text-purple-700">
                    <strong>💡 Dica:</strong> Use esta configuração quando seus dados de entrada e saída 
                    vêm de IHMs diferentes. Por exemplo: IHM1 na balança de entrada e IHM2 na balança de saída.
                  </div>
                </div>
              )}

              {/* Configuração de Entrada */}
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <h3 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                  Arquivo de ENTRADA
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tipo de Relatório:
                    </label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          setConfig({
                            ...config,
                            entrada: { ...config.entrada, tipoRelatorio: "mensal" },
                          })
                        }
                        className={cn(
                          "flex-1",
                          config.entrada.tipoRelatorio === "mensal"
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        Mensal
                      </Button>
                      <Button
                        onClick={() =>
                          setConfig({
                            ...config,
                            entrada: { ...config.entrada, tipoRelatorio: "geral" },
                          })
                        }
                        className={cn(
                          "flex-1",
                          config.entrada.tipoRelatorio === "geral"
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        Geral (Total)
                      </Button>
                    </div>
                  </div>

                  {config.entrada.tipoRelatorio === "mensal" && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                      <div className="text-xs text-green-700 font-medium mb-2">
                        ℹ️ A IHM gera automaticamente o relatório mensal
                      </div>
                      <div className="text-sm text-green-800">
                        O arquivo será coletado com base no <strong>mês atual</strong> da data do sistema.
                      </div>
                      <div className="mt-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Mês/Ano de coleta:
                        </label>
                        <input
                          type="month"
                          value={config.entrada.mesAno || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              entrada: { ...config.entrada, mesAno: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Padrão: mês atual ({new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-green-200 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Arquivo gerado:</div>
                    <div className="font-mono text-sm font-bold text-green-700">
                      {gerarNomeArquivo("entrada")}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Nome customizado (opcional):
                    </label>
                    <input
                      type="text"
                      value={config.entrada.nomeArquivo || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          entrada: { ...config.entrada, nomeArquivo: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Ex: Relatorio_Entrada_Custom.csv"
                    />
                  </div>
                </div>
              </div>

              {/* Configuração de Saída */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  Arquivo de SAÍDA
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tipo de Relatório:
                    </label>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          setConfig({
                            ...config,
                            saida: { ...config.saida, tipoRelatorio: "mensal" },
                          })
                        }
                        className={cn(
                          "flex-1",
                          config.saida.tipoRelatorio === "mensal"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        Mensal
                      </Button>
                      <Button
                        onClick={() =>
                          setConfig({
                            ...config,
                            saida: { ...config.saida, tipoRelatorio: "geral" },
                          })
                        }
                        className={cn(
                          "flex-1",
                          config.saida.tipoRelatorio === "geral"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                        )}
                      >
                        Geral (Total)
                      </Button>
                    </div>
                  </div>

                  {config.saida.tipoRelatorio === "mensal" && (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
                      <div className="text-xs text-blue-700 font-medium mb-2">
                        ℹ️ A IHM gera automaticamente o relatório mensal
                      </div>
                      <div className="text-sm text-blue-800">
                        O arquivo será coletado com base no <strong>mês atual</strong> da data do sistema.
                      </div>
                      <div className="mt-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Mês/Ano de coleta:
                        </label>
                        <input
                          type="month"
                          value={config.saida.mesAno || ""}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              saida: { ...config.saida, mesAno: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          Padrão: mês atual ({new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-white border border-blue-200 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Arquivo gerado:</div>
                    <div className="font-mono text-sm font-bold text-blue-700">
                      {gerarNomeArquivo("saida")}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Nome customizado (opcional):
                    </label>
                    <input
                      type="text"
                      value={config.saida.nomeArquivo || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          saida: { ...config.saida, nomeArquivo: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                      placeholder="Ex: Relatorio_Saida_Custom.csv"
                    />
                  </div>
                </div>
              </div>

              {/* Mapeamento de Balanças - apenas quando usa uma IHM */}
              {!config.duasIHMs && (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Mapeamento de Balanças
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    Define quais balanças do CSV correspondem a entrada e saída. Útil para análises comparativas.
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Balanças de Entrada */}
                    <div className="bg-green-50 border border-green-300 rounded-lg p-3">
                      <label className="text-sm font-bold text-green-800 mb-2 block flex items-center gap-1">
                        <ArrowBigDown className="h-4 w-4" />
                        Balanças de Entrada
                      </label>
                      <input
                        type="text"
                        value={config.mapeamentoBalancas?.entrada?.join(", ") || ""}
                        onChange={(e) => {
                          const valores = e.target.value
                            .split(",")
                            .map(v => v.trim())
                            .filter(v => v !== "");
                          setConfig({
                            ...config,
                            mapeamentoBalancas: {
                              ...config.mapeamentoBalancas,
                              entrada: valores,
                              saida: config.mapeamentoBalancas?.saida || [],
                            },
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Ex: 1, 2, 3"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Separe os IDs por vírgula
                      </div>
                    </div>

                    {/* Balanças de Saída */}
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                      <label className="text-sm font-bold text-blue-800 mb-2 block flex items-center gap-1">
                        <ArrowBigUp className="h-4 w-4" />
                        Balanças de Saída
                      </label>
                      <input
                        type="text"
                        value={config.mapeamentoBalancas?.saida?.join(", ") || ""}
                        onChange={(e) => {
                          const valores = e.target.value
                            .split(",")
                            .map(v => v.trim())
                            .filter(v => v !== "");
                          setConfig({
                            ...config,
                            mapeamentoBalancas: {
                              entrada: config.mapeamentoBalancas?.entrada || [],
                              saida: valores,
                            },
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="Ex: 9, 10"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Separe os IDs por vírgula
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 p-2 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600">
                    <strong>ℹ️ Nota:</strong> Este mapeamento será usado nas análises comparativas entre balanças específicas (ex: "entrada balanças 1,2,3 vs saída balanças 9,10").
                  </div>
                </div>
              )}

              {/* Resumo */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Resumo da Configuração:</h4>
                
                {/* Nota sobre geração automática */}
                <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                  <strong>📅 Geração Automática:</strong> A IHM gera os relatórios mensais automaticamente.
                  O sistema coletará o arquivo do mês atual ({new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}) ou o mês selecionado.
                </div>

                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • <strong>IHMs:</strong>{" "}
                    {config.duasIHMs ? "Duas IHMs separadas" : "Uma IHM (mesma fonte)"}
                  </li>
                  <li>
                    • <strong>Entrada:</strong> {gerarNomeArquivo("entrada")}{" "}
                    {config.duasIHMs && config.ihm2?.usadaPara === "entrada" && "(IHM2)"}
                  </li>
                  <li>
                    • <strong>Saída:</strong> {gerarNomeArquivo("saida")}{" "}
                    {config.duasIHMs && config.ihm2?.usadaPara === "saida" && "(IHM2)"}
                  </li>
                  {!config.duasIHMs && config.mapeamentoBalancas && (
                    <>
                      {config.mapeamentoBalancas.entrada && config.mapeamentoBalancas.entrada.length > 0 && (
                        <li>
                          • <strong>Balanças Entrada:</strong> {config.mapeamentoBalancas.entrada.join(", ")}
                        </li>
                      )}
                      {config.mapeamentoBalancas.saida && config.mapeamentoBalancas.saida.length > 0 && (
                        <li>
                          • <strong>Balanças Saída:</strong> {config.mapeamentoBalancas.saida.join(", ")}
                        </li>
                      )}
                    </>
                  )}
                </ul>
              </div>
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
