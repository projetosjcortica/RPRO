// src/components/TableComponent.tsx
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
  colLabels: Record<string, string>; // { col6: 'Milho', ... }
  dados?: any[]; // Dados externos (opcional)
  loading?: boolean; // Estado de loading externo (opcional)
  error?: string | null; // Estado de erro externo (opcional)
  total?: number; // Total externo (opcional)
  page?: number;
  pageSize?: number;
  useExternalData?: boolean; // Flag para forçar o uso de dados externos
}

export default function TableComponent({ 
  filtros, 
  colLabels, 
  dados: dadosProp, 
  loading: loadingProp, 
  error: errorProp, 
  page = 1, 
  pageSize = 300
}: TableComponentProps) {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");

  const tableRef = useRef<HTMLDivElement>(null);
  
  const fixedColumns = ["Dia", "Hora", "Nome", "Codigo", "Numero"];

  // Gerar dynamicColumns baseado nos dados reais e colLabels
  const dynamicColumns = React.useMemo(() => {
    if (!dadosProp || dadosProp.length === 0) return [];
    
    // Encontrar o máximo número de colunas baseado nos dados
    const maxValues = Math.max(...dadosProp.map(row => row.values?.length || 0));
    
    const cols = [];
    for (let i = 1; i < 1 + maxValues; i++) {
        const colKey = `Produto ${i}`;
        // colLabels[i] = colKey;
        cols.push(colKey);
    }
    return cols;
  }, [dadosProp, colLabels]);

  errorProp ? console.log('erro recebido', errorProp) : null;

  if (!dadosProp || dadosProp.length === 0) return <div className="p-4">Nenhum dado encontrado</div>;

  function formatValue(v: unknown): string {
    if (typeof v === "number") {
      return v.toLocaleString("pt-BR", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });
    }
    if (typeof v === "string") return v;
    return String(v);
  }

  // Helper function to generate a unique key for each cell
  function cellKey(rowIdx: number, colIdx: number): string {
    return `cell-${rowIdx}-${colIdx}`;
  }

  return (
    <div ref={tableRef} className="overflow-hidden w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        {categoriaSelecionada && (
          <FilterBar
            categoriaSelecionada={categoriaSelecionada}
            onCategoriaChange={setCategoriaSelecionada}
            onClear={() => setCategoriaSelecionada("")}
            total={dadosProp.length}
            filtrado={dadosProp.length}
            categorias={[]} // Passando array vazio para evitar erro de propriedade ausente
          />
        )}
      </div>
      
      
      <div className="flex-1 h-full">
        <ScrollArea className="overflow-y-auto h-full w-full">
          <Table className="h-full border-collapse border border-gray-300 table-fixed w-full">
            <TableHeader className="bg-gray-100 sticky top-0 z-10">
              <TableRow>
                {fixedColumns.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className="py-1 px-1 md:py-2 md:px-3 break-words text-center border border-gray-300 font-semibold text-xs md:text-sm"
                    style={{ width: idx === 0 ? '100px' : idx === 1 ? '70px' : '100px' }}
                  >
                    {colLabels?.[col] ?? col} {/* Placeholder se não houver label */}
                  </TableHead>
                ))}
                {dynamicColumns.map((colKey, idx) => {
                  return (
                    <TableHead
                      key={idx + fixedColumns.length}
                      className={`py-1 px-2 md:py-2 md:px-3 text-center border border-gray-300 font-semibold text-xs md:text-sm`}
                      style={{ width: '100px', whiteSpace: 'normal', wordWrap: 'break-word', textAlign: 'center' }}
                    >
                      <div className="flex flex-col">
                        <span className="break-words text-center">{colLabels?.[colKey] ?? colKey}</span> {/* Placeholder */}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {dadosProp.map((row, rowIdx) => (
                <TableRow key={rowIdx} className="hover:bg-gray-50">
                  {fixedColumns.map((col, colIdx) => (
                    <TableCell
                      key={colIdx}
                      data-key={cellKey(rowIdx, colIdx)}
                      className={`p-1 md:p-2 border max-h-20 border-gray-300 cursor-pointer select-none text-center text-xs md:text-sm bg-white`}
                      style={{ width: colIdx === 0 ? '80px' : colIdx === 1 ? '70px' : '100px' }}
                    >
                      <div className="truncate">{row[col as keyof ReportRow]}</div>
                    </TableCell>
                  ))}

                  {dynamicColumns.map((_, dynIdx) => {
                    const colIdx = dynIdx + fixedColumns.length;
                    const rawValue = row.values?.[dynIdx];
                    const value = rawValue !== undefined && rawValue !== null ? rawValue : null;

                    return (
                      <TableCell
                        key={colIdx}
                        data-key={cellKey(rowIdx, colIdx)}
                        className={`p-1 md:p-2 border border-gray-300 cursor-pointer select-none text-center text-xs md:text-sm bg-white`}
                        style={{ width: '100px' }}
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