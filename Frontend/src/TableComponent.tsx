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
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";

interface TableComponentProps {
  filtros?: Filtros;
  colLabels: { [key: string]: string };
}
export default function TableComponent({ filtros, colLabels }: TableComponentProps) {
  const { dados, loading, error } = useReportData(
    filtros ?? { dataInicio: "", dataFim: "", nomeFormula: "" }
  );

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [lastSelected, setLastSelected] = useState<[number, number] | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);
  const selectionStart = useRef<[number, number] | null>(null);
  const selectionMode = useRef<'normal' | 'additive' | 'range'>('normal');
  
  const fixedColumns = ["Dia", "Hora", "Nome", "Codigo", "Numero"];

// Use o maior entre: número de values ou número de colLabels
  const numValues = dados.length > 0 ? (dados[0]?.values?.length || 0) : 0;
  const numColLabels = Object.keys(colLabels || {}).length;

  const dynamicColumns = Array.from(
    { length: Math.max(numValues, numColLabels) }, 
    (_, i) => `col${i + 6}`
  ).filter((colKey, index) => {
    // Mostra a coluna se tiver label OU se tiver dados
    return colLabels[colKey] || (dados.some(row => row.values && index < row.values.length));
  });
  const columns = [...fixedColumns, ...dynamicColumns];

  const cellKey = (rowIdx: number, colIdx: number) => `${rowIdx},${colIdx}`;

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
          const cellKeyStr = cellKey(r, c);
          if (selectedCells.has(cellKeyStr) && dados && dados[r]) {
            const row = dados[r];
            if (c < columns.length) {
              const value = row[columns[c] as keyof ReportRow];
              rowText.push(value !== undefined && value !== null ? String(value) : "");
            } else {
              const valueIndex = c - columns.length;
              const value = row.values?.[valueIndex];
              rowText.push(value !== undefined && value !== null ? String(value) : "");
            }
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
  }, [selectedCells, dados, columns]);

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
        newCol = Math.min(columns.length + (dados[0]?.values?.length || 0) - 1, col + 1);
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
  }, [lastSelected, dados, columns.length, selectCellRange]);

  if (loading) return <div className="p-4">Carregando...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!dados || dados.length === 0) return <div className="p-4">Nenhum dado encontrado</div>;

  return (
    <div 
      ref={tableRef} 
      className="overflow-hidden" 
      onMouseUp={handleMouseUp} // moved para wrapper
    >
      <div className="text-sm mb-2 p-2 bg-gray-100 rounded">
        {selectedCells.size > 0 ? `${selectedCells.size} células selecionadas` : "Nenhuma célula selecionada"}
        <span className="ml-4 text-gray-600 text-xs">
          • Clique: seleciona uma célula • 
          Ctrl+Clique: adiciona/remove células •
          Arraste: seleciona múltiplas células
        </span>
      </div>
      <ScrollArea className="h-[70.5vh] m-b-4">
        <Table className="border-collapse border border-gray-300 w-full">
          <TableHeader className="bg-gray-100 sticky top-0">
            <TableRow>
              {fixedColumns.map((col, idx) => (
                <TableHead
                  key={idx}
                  className="py-2 px-8 text-center border border-gray-300 font-semibold"
                >
                  {colLabels?.[col] ?? col}
                </TableHead>
              ))}
              {dynamicColumns.map((colKey, idx) => (
                <TableHead
                  key={idx + fixedColumns.length}
                  className="py-2 px-5 text-center border border-gray-300 font-semibold"
                >
                  {/* Usa label do Products, se não existir usa colKey, se não existir fallback */}
                  {colLabels?.[colKey] ?? colKey ?? `Coluna ${idx + 6}`}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {dados.map((row, rowIdx) => (
              <TableRow key={rowIdx} className="hover:bg-gray-50">
                {/* Fixed columns */}
                {fixedColumns.map((col, colIdx) => (
                  <TableCell
                    key={colIdx}
                    data-key={cellKey(rowIdx, colIdx)}
                    className={`px-6 border border-gray-300 cursor-pointer select-none text-center ${
                      selectedCells.has(cellKey(rowIdx, colIdx))
                        ? "bg-blue-200 font-medium"
                        : rowIdx % 2 === 0
                        ? "bg-red-50"
                        : "bg-white"
                    }`}
                    onClick={(e) => handleCellClick(rowIdx, colIdx, e)}
                    onMouseDown={(e) => handleMouseDown(rowIdx, colIdx, e)}
                    onMouseEnter={(e) => handleMouseEnter(rowIdx, colIdx, e)}
                  >
                    {row[col as keyof ReportRow]}
                  </TableCell>
                ))}

                {/* Dynamic columns */}
                {dynamicColumns.map((_ , dynIdx) => {
                // Verifica se temos o value correspondente
                const hasValue = row.values && dynIdx < row.values.length;
                const value = hasValue ? row.values[dynIdx] : "";
                
                return (
                  <TableCell
                    key={dynIdx + fixedColumns.length}
                    data-key={cellKey(rowIdx, dynIdx + fixedColumns.length)}
                    className={`p-2 border border-gray-300 cursor-pointer select-none text-center ${
                      selectedCells.has(cellKey(rowIdx, dynIdx + fixedColumns.length))
                        ? "bg-blue-200 font-medium"
                        : rowIdx % 2 === 0
                        ? "bg-red-50"
                        : "bg-white"
                    }`}
                    onClick={(e) => handleCellClick(rowIdx, dynIdx + fixedColumns.length, e)}
                    onMouseDown={(e) => handleMouseDown(rowIdx, dynIdx + fixedColumns.length, e)}
                    onMouseEnter={(e) => handleMouseEnter(rowIdx, dynIdx + fixedColumns.length, e)}
                  >
                    {value}
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
  );
}
