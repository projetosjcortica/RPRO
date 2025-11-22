import { useState } from 'react';
import { DonutChartWidget, BarChartWidget } from './Widgets';

interface ResumoCardsProps {
    resumo: any;
    loading: boolean;
    chartConfig: any;
    displayProducts?: any[];
    tableSelection?: any;
    highlightProduto?: string | null;
    setHighlightProduto?: (name: string | null) => void;
    highlightFormula?: string | null;
    setHighlightFormula?: (name: string | null) => void;
    error?: string | null;
    onReload?: () => void;
}

export function ResumoCards({
    resumo,
    loading,
    chartConfig,
    displayProducts,
    tableSelection,
    highlightProduto,
    setHighlightProduto,
    highlightFormula,
    setHighlightFormula,
    error,
    onReload
}: ResumoCardsProps) {
    // Local state fallback if props not provided (though we intend to provide them)
    const [localHighlightProduto, setLocalHighlightProduto] = useState<string | null>(null);
    const [localHighlightFormula, setLocalHighlightFormula] = useState<string | null>(null);

    const effectiveHighlightProduto = highlightProduto !== undefined ? highlightProduto : localHighlightProduto;
    const effectiveSetHighlightProduto = setHighlightProduto || setLocalHighlightProduto;

    const effectiveHighlightFormula = highlightFormula !== undefined ? highlightFormula : localHighlightFormula;
    const effectiveSetHighlightFormula = setHighlightFormula || setLocalHighlightFormula;

    const hasData = (resumo?.produtosCount ?? displayProducts?.length ?? 0) > 0 ||
        ((resumo?.formulasUtilizadas ? Object.keys(resumo.formulasUtilizadas).length : 0) || (tableSelection?.formulas?.length ?? 0)) > 0 ||
        (resumo && (resumo.totalPesos > 0 || resumo.batitdasTotais > 0));

    if (!hasData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-sm font-medium">Nenhum dado encontrado</p>
                    <p className="text-xs mt-1">Ajuste os filtros para ver mais resultados</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Produtos Donut */}
            {(resumo?.produtosCount ?? displayProducts?.length ?? 0) > 0 && (
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="text-sm font-bold text-gray-800">
                            Produtos
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                            {resumo?.produtosCount ??
                                (displayProducts?.length || 0)}{" "}
                            itens •{" "}
                            {(
                                resumo?.totalPesos ?? tableSelection?.total
                            ).toLocaleString("pt-BR", {
                                maximumFractionDigits: 0,
                            })}{" "}
                            kg
                        </div>
                    </div>
                    <div className="h-[280px] px-3 py-3 relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                            </div>
                        )}

                        {error && onReload && (
                            <button
                                onClick={onReload}
                                className="absolute top-2 right-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md flex items-center z-20"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Recarregar
                            </button>
                        )}

                        <DonutChartWidget
                            chartType="produtos"
                            config={chartConfig}
                            compact
                            highlightName={effectiveHighlightProduto}
                            onSliceHover={(name) => effectiveSetHighlightProduto(name)}
                            onSliceLeave={() => effectiveSetHighlightProduto(null)}
                        />
                    </div>
                </div>
            )}

            {/* Fórmulas Donut */}
            {((resumo?.formulasUtilizadas ? Object.keys(resumo.formulasUtilizadas).length : 0) || (tableSelection?.formulas?.length ?? 0)) > 0 && (
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="text-sm font-bold text-gray-800">
                            Fórmulas
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                            {resumo?.formulasUtilizadas
                                ? Object.keys(resumo.formulasUtilizadas).length
                                : tableSelection?.formulas?.length || 0}{" "}
                            fórmulas •{" "}
                            {(
                                resumo?.batitdasTotais ?? tableSelection?.batidas
                            ).toLocaleString("pt-BR")}{" "}
                            batidas
                        </div>
                    </div>
                    <div className="h-[280px] px-3 py-3 relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                            </div>
                        )}

                        {error && onReload && (
                            <button
                                onClick={onReload}
                                className="absolute top-2 right-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md flex items-center z-20"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Recarregar
                            </button>
                        )}

                        <DonutChartWidget
                            chartType="formulas"
                            config={chartConfig}
                            compact
                            highlightName={effectiveHighlightFormula}
                            onSliceHover={(name) => effectiveSetHighlightFormula(name)}
                            onSliceLeave={() => effectiveSetHighlightFormula(null)}
                        />
                    </div>
                </div>
            )}

            {/* Horários BarChart - só renderiza se houver dados */}
            {resumo && (resumo.totalPesos > 0 || resumo.batitdasTotais > 0) && (
                <div className="border-2 border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="text-sm font-bold text-gray-800">
                            Horários de Produção
                        </div>
                        <div className="text-xs text-gray-600 font-medium mt-0.5">
                            Distribuição por hora
                        </div>
                    </div>
                    <div className="h-[280px] px-3 py-3 relative">
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                            </div>
                        )}

                        {error && onReload && (
                            <button
                                onClick={onReload}
                                className="absolute top-2 right-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md flex items-center z-20"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Recarregar
                            </button>
                        )}

                        <BarChartWidget
                            chartType="horarios"
                            config={chartConfig}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
