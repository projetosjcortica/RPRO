import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "./components/ui/table";
import { useReportData } from "./hooks/useReportData";
import { Filtros, ReportRow } from "./components/types";
import { FilterBar } from "./components/FilterBar";
import { useIsMobile } from "./hooks/use-mobile";
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";

interface TableComponentProps {
  filtros?: Filtros;
  colLabels: Record<string, string>;
  dados?: any[];
  loading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
}

export default function TableComponent({ filtros, colLabels, dados: dadosProp, loading: loadingProp, error: errorProp, page = 1, pageSize = 300 }: TableComponentProps) {
  const isMobile = useIsMobile();
  const { dados: dadosFromHook, loading: loadingHook, error: errorHook } = useReportData(
    filtros ?? { dataInicio: "", dataFim: "", nomeFormula: "" }, page, pageSize
  );

  const dadosOriginais = dadosProp ?? dadosFromHook;
  const loading = loadingProp ?? loadingHook;
  const error = errorProp ?? errorHook;
  
  // Estado para filtro de categoria
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
  const [dadosFiltrados, setDadosFiltrados] = useState<ReportRow[]>([]);

  // Estado para as informações de produtos
  const [produtosInfo, setProdutosInfo] = useState<Record<string, any>>({});
  const [categorias, setCategorias] = useState<string[]>([]);
  
  // Carregar informações de produtos do localStorage
  useEffect(() => {
    try {
      const produtosInfoRaw = localStorage.getItem('produtosInfo');
      if (produtosInfoRaw) {
        const infoObj = JSON.parse(produtosInfoRaw);
        setProdutosInfo(infoObj);
        
        // Extrair categorias únicas
        const categoriasSet = new Set<string>();
        Object.keys(infoObj).forEach(key => {
          if (infoObj[key]?.categoria) {
            categoriasSet.add(infoObj[key].categoria);
          }
        });
        setCategorias(Array.from(categoriasSet).sort());
      }
    } catch (error) {
      console.error('Erro ao carregar informações de produtos:', error);
    }
  }, []);
  
  // Determinar quais dados mostrar (filtrados ou originais)
  const dados = categoriaSelecionada ? dadosFiltrados : dadosOriginais;

  // Filtrar dados por categoria quando a categoria selecionada mudar
  useEffect(() => {
    if (categoriaSelecionada && dadosOriginais.length > 0) {
      const colunasCategoria = Object.keys(produtosInfo).filter(
        colKey => produtosInfo[colKey]?.categoria === categoriaSelecionada
      );
      
      const filtrados = dadosOriginais.filter(registro => {
        return colunasCategoria.some(coluna => {
          const colNum = parseInt(coluna.replace('col', ''), 10);
          if (isNaN(colNum)) return false;
          
          const valueIdx = colNum - 6;
          return (
            registro.values && 
            valueIdx >= 0 && 
            valueIdx < registro.values.length && 
            registro.values[valueIdx] !== null && 
            registro.values[valueIdx] !== undefined && 
            registro.values[valueIdx] !== 0
          );
        });
      });
      
      setDadosFiltrados(filtrados);
    } else {
      setDadosFiltrados(dadosOriginais);
    }
  }, [categoriaSelecionada, dadosOriginais, produtosInfo]);
  
  const limparFiltroCategoria = () => {
    setCategoriaSelecionada("");
  };

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [lastSelected, setLastSelected] = useState<[number, number] | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);
  const selectionStart = useRef<[number, number] | null>(null);
  const selectionMode = useRef<'normal' | 'additive' | 'range'>('normal');
  
  const fixedColumns = ["Dia", "Hora", "Nome", "Codigo", "Numero"];

  // CORREÇÃO: Gerar dynamicColumns baseado nos dados reais
  const dynamicColumns = React.useMemo(() => {
    if (!dados || dados.length === 0) return [];
    
    // Encontrar o máximo número de colunas baseado nos dados
    const maxValues = Math.max(...dados.map(row => row.values?.length || 0));
    const availableCols = Object.keys(colLabels || {});
    
    const cols = Array.from({ length: Math.max(maxValues, availableCols.length) }, 
      (_, i) => `col${i + 6}`
    ).filter(colKey => {
      return colLabels[colKey] || dados.some(row => {
        const colNum = parseInt(colKey.replace('col', ''), 10);
        const valueIdx = colNum - 6;
        return row.values && valueIdx >= 0 && valueIdx < row.values.length;
      });
    });
    
    return cols;
  }, [dados, colLabels]);

  const cellKey = (rowIdx: number, colIdx: number) => `${rowIdx},${colIdx}`;

  // Função auxiliar para obter o valor de uma célula
  const getCellValue = useCallback((row: ReportRow, colIdx: number) => {
    if (colIdx < fixedColumns.length) {
      // Coluna fixa
      const colKey = fixedColumns[colIdx];
      return row[colKey as keyof ReportRow];
    } else {
      // Coluna dinâmica
      const dynIdx = colIdx - fixedColumns.length;
      if (dynIdx < dynamicColumns.length) {
        const colKey = dynamicColumns[dynIdx];
        const rawValue = row.values?.[dynIdx];
        
        // Aplicar conversão de unidade se necessário
        if (rawValue !== undefined && rawValue !== null) {
          const produtoInfo = produtosInfo[colKey];
          return produtoInfo?.unidade === "g" ? rawValue / 1000 : rawValue;
        }
      }
    }
    return undefined;
  }, [fixedColumns, dynamicColumns, produtosInfo]);

  const selectCellRange = useCallback((startRow: number, startCol: number, endRow: number, endCol: number) => {
    const rowStart = Math.min(startRow, endRow);
    const rowEnd = Math.max(startRow, endRow);
    const colStart = Math.min(startCol, endCol);
    const colEnd = Math.max(startCol, endCol)
    const newSet = new Set<string>();
    for (let r = rowStart; r <= rowEnd; r++) {
      for (let c = colStart; c <= colEnd; c++) {
        newSet.add(cellKey(r, c));
      }
    }
    return newSet;
  }, []);

  const handleCellClick = useCallback((rowIdx: number, colIdx: number, e: React.MouseEvent) => {
    const key = cellKey(rowIdx, colIdx);
    
    if (e.ctrlKey || e.metaKey) {
      setSelectedCells((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          newSet.add(key);
        }
        return newSet;
      });
      setLastSelected([rowIdx, colIdx]);
    } else if (e.shiftKey && lastSelected) {
      const [lastRow, lastCol] = lastSelected;
      const rangeSelection = selectCellRange(lastRow, lastCol, rowIdx, colIdx);
      setSelectedCells(rangeSelection);
      setLastSelected([rowIdx, colIdx]);
    } else {
      setSelectedCells(new Set([key]));
      setLastSelected([rowIdx, colIdx]);
    }
  }, [lastSelected, selectCellRange]);

  const handleMouseDown = useCallback((rowIdx: number, colIdx: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    isSelecting.current = true;
    selectionStart.current = [rowIdx, colIdx];
    const key = cellKey(rowIdx, colIdx);

    if (e.ctrlKey || e.metaKey) {
      selectionMode.current = 'additive';
      setLastSelected([rowIdx, colIdx]);
    } else if (e.shiftKey && lastSelected) {
      selectionMode.current = 'range';
      const [lastRow, lastCol] = lastSelected;
      const rangeSelection = selectCellRange(lastRow, lastCol, rowIdx, colIdx);
      setSelectedCells(rangeSelection);
      setLastSelected([rowIdx, colIdx]);
    } else {
      selectionMode.current = 'normal';
      setSelectedCells(new Set([key]));
      setLastSelected([rowIdx, colIdx]);
    }
  }, [lastSelected, selectCellRange]);

  const handleMouseEnter = useCallback((rowIdx: number, colIdx: number, e: React.MouseEvent) => {
    if (isSelecting.current && e.buttons === 1 && selectionStart.current) {
      const [startRow, startCol] = selectionStart.current;
      
      if (selectionMode.current === 'additive') {
        const newSelection = selectCellRange(startRow, startCol, rowIdx, colIdx);
        setSelectedCells((prev) => {
          const combinedSet = new Set(prev);
          newSelection.forEach(cell => combinedSet.add(cell));
          return combinedSet;
        });
      } else if (selectionMode.current === 'range' && lastSelected) {
        const [lastRow, lastCol] = lastSelected;
        const rangeSelection = selectCellRange(lastRow, lastCol, rowIdx, colIdx);
        setSelectedCells(rangeSelection);
      } else {
        const newSelection = selectCellRange(startRow, startCol, rowIdx, colIdx);
        setSelectedCells(newSelection);
      }
      
      setLastSelected([rowIdx, colIdx]);
    }
  }, [lastSelected, selectCellRange]);

  const handleMouseUp = useCallback(() => {
    isSelecting.current = false;
    selectionStart.current = null;
    selectionMode.current = 'normal';
  }, []);

  // Copiar para clipboard
  useEffect(() => {
    function handleCopy(e: ClipboardEvent) {
      if (selectedCells.size === 0) return;
      e.preventDefault();

      const coords = Array.from(selectedCells).map((key) =>
        key.split(",").map(Number)
      );
      const rows = coords.map(([r]) => r);
      const cols = coords.map(([, c]) => c);
      const minRow = Math.min(...rows);
      const maxRow = Math.max(...rows);
      const minCol = Math.min(...cols);
      const maxCol = Math.max(...cols);

      let text = "";

      for (let r = minRow; r <= maxRow; r++) {
        const rowText: string[] = [];
        for (let c = minCol; c <= maxCol; c++) {
          if (selectedCells.has(cellKey(r, c)) && dados && dados[r]) {
            const value = getCellValue(dados[r], c);
            rowText.push(value !== undefined && value !== null ? String(value) : "");
          } else {
            rowText.push("");
          }
        }
        text += rowText.join("\t") + "\n";
      }

      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", text);
      }
    }

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, [selectedCells, dados, getCellValue]);

  // Limpar seleção ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setSelectedCells(new Set());
        setLastSelected(null);
      }
    }
    
    function handleGlobalMouseUp() {
      isSelecting.current = false;
      selectionStart.current = null;
      selectionMode.current = 'normal';
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  // Navegação por teclado
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!lastSelected || !dados) return;
      
      const [row, col] = lastSelected;
      let newRow = row;
      let newCol = col;
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        newRow = Math.min(dados.length - 1, row + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        newRow = Math.max(0, row - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        newCol = Math.min(fixedColumns.length + dynamicColumns.length - 1, col + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        newCol = Math.max(0, col - 1);
      } else {
        return;
      }
      
      if (e.shiftKey) {
        const rangeSelection = selectCellRange(row, col, newRow, newCol);
        setSelectedCells(rangeSelection);
      } else {
        setSelectedCells(new Set([cellKey(newRow, newCol)]));
      }
      
      setLastSelected([newRow, newCol]);
      
      const cellElement = document.querySelector(`[data-key="${cellKey(newRow, newCol)}"]`);
      cellElement?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastSelected, dados, fixedColumns.length, dynamicColumns.length, selectCellRange]);

  // CORREÇÃO PRINCIPAL: Emit selection changes
  useEffect(() => {
    if (!dados || dados.length === 0 || selectedCells.size === 0) return;

    const detail = Array.from(selectedCells).map((k) => {
      const [r, c] = k.split(',').map(Number);
      const row = dados[r];
      
      if (!row) return null;

      const value = getCellValue(row, c);
      
      let colKey: string;
      if (c < fixedColumns.length) {
        colKey = fixedColumns[c];
      } else {
        const dynIdx = c - fixedColumns.length;
        colKey = dynIdx < dynamicColumns.length ? dynamicColumns[dynIdx] : `col${dynIdx + 6}`;
      }

      return { 
        rowIdx: r, 
        colIdx: c, 
        colKey, 
        value, 
        row,
        formattedValue: formatValue(value)
      };
    }).filter(Boolean);

    console.log('Dispatching table-selection event with detail:', detail);
    const ev = new CustomEvent('table-selection', { detail });
    window.dispatchEvent(ev);
  }, [selectedCells, dados, fixedColumns, dynamicColumns, getCellValue]);

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!dadosOriginais || dadosOriginais.length === 0) return <div className="p-4">Nenhum dado encontrado</div>;

  function formatValue(v: unknown): string {
    if (typeof v === "number") {
      return v.toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
    if (typeof v === "string") return v;
    return "";
  }
  
  return (
    <div ref={tableRef} className="overflow-hidden w-full h-full flex flex-col" onMouseUp={handleMouseUp}>
      {/* Barra de filtros por categoria */}
      {categorias.length > 0 && (
        <FilterBar
          categorias={categorias}
          categoriaSelecionada={categoriaSelecionada}
          onCategoriaChange={setCategoriaSelecionada}
          onClear={limparFiltroCategoria}
          total={dadosOriginais.length}
          filtrado={dados.length}
        />
      )}
      
      <div className="text-sm mb-2 p-2 bg-gray-100 rounded">
        {selectedCells.size > 0 ? `${selectedCells.size} células selecionadas` : "Nenhuma célula selecionada"}
        <span className="hidden md:inline-block ml-4 text-gray-600 text-xs">
          • Clique: seleciona uma célula • Ctrl+Clique: adiciona/remove células • Arraste: seleciona múltiplas células
        </span>
      </div>
      
      {isMobile && (
        <div className="block text-xs text-gray-500 mb-2">Deslize para ver todas as colunas</div>
      )}
      
      <div className="flex-1 h-100">
        <ScrollArea className="overflow-y-auto h-full w-full">
          <Table className="h-100 border-collapse border border-gray-300 table-fixed w-full">
            <TableHeader className="bg-gray-100 sticky top-0 z-10">
              <TableRow>
                {fixedColumns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className="py-1 px-1 md:py-2 md:px-3 break-words text-center border border-gray-300 font-semibold text-xs md:text-sm"
                    style={{ width: idx === 0 ? '100px' : idx === 1 ? '70px' : '100px' }}
                  >
                    {colLabels?.[col] ?? col}
                  </TableHead>
                ))}
                {dynamicColumns.map((colKey, idx) => {
                  const produtoInfo = produtosInfo[colKey];
                  const categoria = produtoInfo?.categoria || '';
                  const isCategoriaSelecionada = categoria === categoriaSelecionada && categoriaSelecionada !== '';
                  
                  return (
                    <TableHead
                      key={idx + fixedColumns.length}
                      className={`py-1 px-2 md:py-2 md:px-3 text-center border border-gray-300 font-semibold text-xs md:text-sm ${
                        isCategoriaSelecionada ? 'bg-green-100' : ''
                      }`}
                      style={{ width: '100px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center' }}
                      title={categoria ? `Categoria: ${categoria}` : ''}
                    >
                      <div className="flex flex-col">
                        <span className="break-words text-center">{colLabels?.[colKey] ?? colKey}</span>
                        {categoria && (
                          <span className="text-xs text-gray-500 font-normal mt-1 hidden md:block truncate">
                            {categoria}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {dados.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-gray-50">
                  {fixedColumns.map((col, colIdx) => (
                    <TableCell
                      key={colIdx}
                      data-key={cellKey(rowIdx, colIdx)}
                      className={`p-1 md:p-2 border max-h-20 border-gray-300 cursor-pointer select-none text-center text-xs md:text-sm ${
                        selectedCells.has(cellKey(rowIdx, colIdx))
                          ? "bg-blue-200 font-medium"
                          : rowIdx % 2 === 0
                          ? "bg-red-50"
                          : "bg-white"
                      }`}
                      style={{ width: colIdx === 0 ? '80px' : colIdx === 1 ? '70px' : '100px' }}
                      onClick={(e) => handleCellClick(rowIdx, colIdx, e)}
                      onMouseDown={(e) => handleMouseDown(rowIdx, colIdx, e)}
                      onMouseEnter={(e) => handleMouseEnter(rowIdx, colIdx, e)}
                    >
                      <div className="truncate">{row[col as keyof ReportRow]}</div>
                    </TableCell>
                  ))}

                  {dynamicColumns.map((colKey, dynIdx) => {
                    const colIdx = dynIdx + fixedColumns.length;
                    const rawValue = row.values?.[dynIdx];
                    const value = rawValue !== undefined && rawValue !== null && produtosInfo[colKey]?.unidade === "g" 
                      ? rawValue / 1000 
                      : rawValue;
                    
                    const temCategoria = produtosInfo[colKey]?.categoria === categoriaSelecionada;

                    return (
                      <TableCell
                        key={colIdx}
                        data-key={cellKey(rowIdx, colIdx)}
                        className={`p-1 md:p-2 border border-gray-300 cursor-pointer select-none text-center text-xs md:text-sm ${
                          selectedCells.has(cellKey(rowIdx, colIdx))
                            ? "bg-blue-200 font-medium"
                            : temCategoria && value !== undefined && value !== null
                            ? "bg-green-50 font-medium"
                            : rowIdx % 2 === 0
                            ? "bg-red-50"
                            : "bg-white"
                        }`}
                        style={{ width: '100px' }}
                        onClick={(e) => handleCellClick(rowIdx, colIdx, e)}
                        onMouseDown={(e) => handleMouseDown(rowIdx, colIdx, e)}
                        onMouseEnter={(e) => handleMouseEnter(rowIdx, colIdx, e)}
                      >
                        <div className="truncate">{formatValue(value)}</div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}