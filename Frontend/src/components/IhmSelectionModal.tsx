import { AlertCircle, ArrowDownToLine, ArrowUpFromLine, X, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";

interface IhmSelectionModalProps {
  isOpen: boolean;
  onSelect: (config: {
    modo: "entrada-saida" | "apenas-entrada" | "apenas-saida";
    arquivoEntrada?: string;
    arquivoSaida?: string;
  }) => void;
  onCancel: () => void;
}

export function IhmSelectionModal({ isOpen, onSelect, onCancel }: IhmSelectionModalProps) {
  const [modo, setModo] = useState<"entrada-saida" | "apenas-entrada" | "apenas-saida" | null>(null);
  const [arquivoEntrada, setArquivoEntrada] = useState("");
  const [arquivoSaida, setArquivoSaida] = useState("");
  
  console.log('[IhmSelectionModal] Renderizado - isOpen:', isOpen, 'modo:', modo);
  
  if (!isOpen) return null;

  const handleConfirm = () => {
    console.log('[IhmSelectionModal] ✅ Confirmando configuração:', { modo, arquivoEntrada, arquivoSaida });
    
    if (!modo) {
      alert("Por favor, selecione um modo de coleta");
      return;
    }

    const config: any = { modo };
    
    if (modo === "entrada-saida") {
      if (!arquivoEntrada || !arquivoSaida) {
        alert("Por favor, especifique ambos os arquivos CSV");
        return;
      }
      config.arquivoEntrada = arquivoEntrada;
      config.arquivoSaida = arquivoSaida;
    } else if (modo === "apenas-entrada") {
      if (!arquivoEntrada) {
        alert("Por favor, especifique o arquivo CSV de entrada");
        return;
      }
      config.arquivoEntrada = arquivoEntrada;
    } else if (modo === "apenas-saida") {
      if (!arquivoSaida) {
        alert("Por favor, especifique o arquivo CSV de saída");
        return;
      }
      config.arquivoSaida = arquivoSaida;
    }

    onSelect(config);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Configuração de IHM Única</h2>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 font-medium mb-2">
              ℹ️ Sistema de IHM Única Detectado
            </p>
            <p className="text-blue-700 text-sm">
              Você configurou apenas uma IHM. <strong>Uma IHM NUNCA coleta entrada e saída no mesmo arquivo CSV.</strong>
              <br />
              Por favor, informe como deseja realizar a coleta:
            </p>
          </div>

          {/* ETAPA 1: Escolher modo */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              1. Como você deseja coletar os dados?
            </h3>

            <div className="space-y-3">
              {/* Opção: Entrada E Saída (2 arquivos) */}
              <button
                type="button"
                onClick={() => setModo("entrada-saida")}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  modo === "entrada-saida"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mt-1">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Coletar ENTRADA e SAÍDA (2 arquivos)</h4>
                    <p className="text-sm text-gray-600">
                      A IHM gera um arquivo CSV para entrada e outro arquivo CSV diferente para saída
                    </p>
                  </div>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                    modo === "entrada-saida"
                      ? "bg-purple-500 border-purple-500"
                      : "border-gray-300"
                  } flex items-center justify-center`}>
                    {modo === "entrada-saida" && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                </div>
              </button>

              {/* Opção: Apenas ENTRADA */}
              <button
                type="button"
                onClick={() => setModo("apenas-entrada")}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  modo === "apenas-entrada"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mt-1">
                    <ArrowDownToLine className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Apenas ENTRADA</h4>
                    <p className="text-sm text-gray-600">
                      A IHM coleta apenas dados de amendoim bruto chegando (in natura)
                    </p>
                  </div>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                    modo === "apenas-entrada"
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300"
                  } flex items-center justify-center`}>
                    {modo === "apenas-entrada" && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                </div>
              </button>

              {/* Opção: Apenas SAÍDA */}
              <button
                type="button"
                onClick={() => setModo("apenas-saida")}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  modo === "apenas-saida"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                    <ArrowUpFromLine className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Apenas SAÍDA</h4>
                    <p className="text-sm text-gray-600">
                      A IHM coleta apenas dados de amendoim processado saindo (beneficiado)
                    </p>
                  </div>
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 ${
                    modo === "apenas-saida"
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300"
                  } flex items-center justify-center`}>
                    {modo === "apenas-saida" && <div className="w-3 h-3 bg-white rounded-full" />}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ETAPA 2: Especificar arquivos */}
          {modo && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2. Especifique o(s) nome(s) do(s) arquivo(s) CSV
              </h3>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                {(modo === "entrada-saida" || modo === "apenas-entrada") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ArrowDownToLine className="inline h-4 w-4 text-green-600 mr-1" />
                      Arquivo CSV de ENTRADA
                    </label>
                    <Input
                      type="text"
                      value={arquivoEntrada}
                      onChange={(e) => setArquivoEntrada(e.target.value)}
                      placeholder="Ex: Relatorio_2025_11.csv"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nome do arquivo que contém os dados de amendoim bruto (in natura)
                    </p>
                  </div>
                )}

                {(modo === "entrada-saida" || modo === "apenas-saida") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ArrowUpFromLine className="inline h-4 w-4 text-blue-600 mr-1" />
                      Arquivo CSV de SAÍDA
                    </label>
                    <Input
                      type="text"
                      value={arquivoSaida}
                      onChange={(e) => setArquivoSaida(e.target.value)}
                      placeholder="Ex: Relatorio2_2025_11.csv"
                      className="font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Nome do arquivo que contém os dados de amendoim processado (beneficiado)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {modo && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900 text-sm">
                <strong>⚠️ Importante:</strong> Certifique-se de que os nomes dos arquivos correspondem exatamente aos arquivos gerados pela IHM no servidor FTP.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t sticky bottom-0">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!modo}
            className={`${
              modo
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Confirmar Configuração
          </Button>
        </div>
      </div>
    </div>
  );
}
