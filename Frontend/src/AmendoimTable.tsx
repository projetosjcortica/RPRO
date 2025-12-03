import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Loader2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface AmendoimRecord {
  id: number;
  tipo: 'entrada' | 'saida';
  dia: string;
  hora: string;
  codigoProduto: string;
  codigoCaixa: string;
  nomeProduto: string;
  peso: number;
  balanca?: string;
  createdAt?: string;
}

interface Props {
  registros: AmendoimRecord[];
  loading?: boolean;
  error?: string | null;
  page?: number;
  pageSize?: number;
  onSort?: (col: string) => void;
  sortColumn?: string | null;
  sortDirection?: 'asc' | 'desc';
  onResetColumns?: () => void;
  resetKey?: number;
}

const safe = (v: any) => (v == null ? '' : String(v));

const DEFAULT_WIDTHS: Record<string, number> = {
  dia: 100,
  hora: 80,
  codigoProduto: 110,
  balanca: 80,
  nomeProduto: 300,
  peso: 110,
  tipo: 90,
};

const STORAGE_KEY = 'amendoim-table-column-widths';

function useColumnWidths() {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_WIDTHS, ...parsed };
      }
    } catch (e) {
      // ignore
    }
    return { ...DEFAULT_WIDTHS };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
    } catch (e) {}
  }, [widths]);

  const reset = useCallback(() => {
    setWidths({ ...DEFAULT_WIDTHS });
  }, []);

  return { widths, setWidths, reset } as const;
}

export default function AmendoimTable({ registros, loading, error, onSort, sortColumn, sortDirection, resetKey }: Props) {
  const incoming = useMemo(() => Array.isArray(registros) ? registros : [], [registros]);
  const { widths, setWidths, reset } = useColumnWidths();

  // Internal rows state so we can update contents in-place and avoid full remounts
  const [internalRows, setInternalRows] = useState<AmendoimRecord[]>(() => incoming.slice());

  // Merge incoming updates into internalRows in-place when possible.
  useEffect(() => {
    // Quick path: nothing before -> set directly
    if (!internalRows || internalRows.length === 0) {
      setInternalRows(incoming.slice());
      return;
    }

    // Build map of current rows by id
    const currentById = new Map<number | string, AmendoimRecord>();
    for (const r of internalRows) {
      currentById.set((r as any).id ?? JSON.stringify(r), r);
    }

    let changed = false;
    const newOrdered: AmendoimRecord[] = [];

    for (const inc of incoming) {
      const key = (inc as any).id ?? JSON.stringify(inc);
      const existing = currentById.get(key);
      if (existing) {
        // Update fields in-place to preserve object identity where possible
        const keys = Object.keys(inc) as (keyof AmendoimRecord)[];
        for (const k of keys) {
          const v = inc[k];
          if ((existing as any)[k] !== v) {
            (existing as any)[k] = v;
            changed = true;
          }
        }
        newOrdered.push(existing);
      } else {
        // New row, push copy
        newOrdered.push({ ...inc });
        changed = true;
      }
    }

    // If lengths differ (rows removed), mark changed
    if (incoming.length !== internalRows.length) changed = true;

    if (changed) {
      // Replace internalRows with ordered array (reused objects where possible)
      setInternalRows(newOrdered);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming]);

  const [resizing, setResizing] = useState<null | { key: string; startX: number; startWidth: number }>(null);

  useEffect(() => {
    if (!resizing) return;
    const handleMove = (e: MouseEvent) => {
      const diff = e.clientX - resizing.startX;
      const newW = Math.max(50, Math.round(resizing.startWidth + diff));
      setWidths((prev) => ({ ...prev, [resizing.key]: newW }));
    };
    const handleUp = () => setResizing(null);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [resizing, setWidths]);

  const handleResizeStart = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing({ key, startX: e.clientX, startWidth: widths[key] ?? DEFAULT_WIDTHS[key] });
  };

  // React to external reset requests from parent
  useEffect(() => {
    if (typeof resetKey !== 'undefined') {
      try {
        reset();
      } catch (e) {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  if ((loading || false) && internalRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 h-[50vh] w-full text-center">
        <Loader2 className="h-10 w-10 animate-spin text-red-600 mx-auto" />
        <p className="text-lg font-medium">Carregando dados...</p>
      </div>
    );
  }

  if (error && internalRows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-3 h-[50vh] w-full text-center">
        <div className="text-gray-700 font-semibold text-lg">Erro ao carregar dados</div>
        <div className="text-sm text-gray-600 max-w-md mx-auto">{error}</div>
      </div>
    );
  }

  // Lightweight indicators when we have data
  return (
    <div className="w-full h-full flex flex-col relative">
      {/* {loading && internalRows.length > 0 && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-2 bg-white/90 p-2 rounded shadow">
          <Loader2 className="h-5 w-5 animate-spin text-red-600" />
          <span className="text-xs text-gray-700">Atualizando...</span>
        </div>
      )} */}

      <div className="overflow-auto flex-1 thin-red-scrollbar h-[calc(100vh-200px)]">
        <div className="min-w-max w-full">
          <div className="sticky top-0 z-10 bg-gray-200 border-b border-gray-300">
            <div className="flex">
              <div className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200" style={{ width: `${widths.dia}px`, minWidth: `${widths.dia}px` }} onClick={() => onSort?.('dia')}>
                <span className="flex items-center gap-1 pointer-events-none">
                  Dia
                  {sortColumn === 'dia' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10" onMouseDown={(e) => handleResizeStart(e, 'dia')} onClick={(e) => e.stopPropagation()} />
              </div>

              <div className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200" style={{ width: `${widths.hora}px`, minWidth: `${widths.hora}px` }} onClick={() => onSort?.('hora')}>
                <span className="flex items-center gap-1 pointer-events-none">
                  Hora
                  {sortColumn === 'hora' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10" onMouseDown={(e) => handleResizeStart(e, 'hora')} onClick={(e) => e.stopPropagation()} />
              </div>

              <div className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200" style={{ width: `${widths.codigoProduto}px`, minWidth: `${widths.codigoProduto}px` }} onClick={() => onSort?.('codigoProduto')}>
                <span className="flex items-center gap-1 pointer-events-none">
                  Cód. Produto
                  {sortColumn === 'codigoProduto' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10" onMouseDown={(e) => handleResizeStart(e, 'codigoProduto')} onClick={(e) => e.stopPropagation()} />
              </div>

              <div className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200" style={{ width: `${widths.balanca}px`, minWidth: `${widths.balanca}px` }} onClick={() => onSort?.('balanca')}>
                <span className="flex items-center gap-1 pointer-events-none">
                  Balança
                  {sortColumn === 'balanca' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10" onMouseDown={(e) => handleResizeStart(e, 'balanca')} onClick={(e) => e.stopPropagation()} />
              </div>

              <div className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200" style={{ width: `${widths.nomeProduto}px`, minWidth: `${widths.nomeProduto}px` }} onClick={() => onSort?.('nomeProduto')}>
                <span className="flex items-center gap-1 pointer-events-none">
                  Nome do Produto
                  {sortColumn === 'nomeProduto' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10" onMouseDown={(e) => handleResizeStart(e, 'nomeProduto')} onClick={(e) => e.stopPropagation()} />
              </div>

              <div className="relative flex items-center justify-center py-1 px-3 border-r border-gray-300 font-semibold text-xs md:text-sm bg-gray-200" style={{ width: `${widths.peso}px`, minWidth: `${widths.peso}px` }} onClick={() => onSort?.('peso')}>
                <span className="flex items-center gap-1 pointer-events-none">
                  Peso (kg)
                  {sortColumn === 'peso' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10" onMouseDown={(e) => handleResizeStart(e, 'peso')} onClick={(e) => e.stopPropagation()} />
              </div>

              <div className="relative flex items-center justify-center py-1 px-3 font-semibold text-xs md:text-sm bg-gray-200" style={{ width: `${widths.tipo}px`, minWidth: `${widths.tipo}px` }} onClick={() => onSort?.('tipo')}>
                <span className="flex items-center gap-1 pointer-events-none">
                  Tipo
                  {sortColumn === 'tipo' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-40" />
                  )}
                </span>
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-red-500 transition-colors z-10" onMouseDown={(e) => handleResizeStart(e, 'tipo')} onClick={(e) => e.stopPropagation()} />
              </div>
            </div>
          </div>

          <div>
            {internalRows.map((r, idx) => (
              <div key={r.id ?? `r_${idx}`} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'} flex border-b border-gray-300`}> 
                <div className="flex items-center justify-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300" style={{ width: `${widths.dia}px`, minWidth: `${widths.dia}px` }}>{safe(r.dia)}</div>
                <div className="flex items-center justify-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300" style={{ width: `${widths.hora}px`, minWidth: `${widths.hora}px` }}>{safe(r.hora)}</div>
                <div className="flex items-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300" style={{ width: `${widths.codigoProduto}px`, minWidth: `${widths.codigoProduto}px` }}>{safe(r.codigoProduto)}</div>
                <div className="flex items-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300" style={{ width: `${widths.balanca}px`, minWidth: `${widths.balanca}px` }}>{safe(r.balanca)}</div>
                <div className="flex items-center p-1 md:p-2 text-xs md:text-sm border-r border-gray-300" style={{ width: `${widths.nomeProduto}px`, minWidth: `${widths.nomeProduto}px` }}>{safe(r.nomeProduto)}</div>
                <div className="flex items-center justify-end p-1 md:p-2 text-xs md:text-sm border-r border-gray-300" style={{ width: `${widths.peso}px`, minWidth: `${widths.peso}px` }}>{Number(r.peso || 0).toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</div>
                <div className="flex items-center p-1 md:p-2 text-xs md:text-sm" style={{ width: `${widths.tipo}px`, minWidth: `${widths.tipo}px` }}>{safe(r.tipo)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
