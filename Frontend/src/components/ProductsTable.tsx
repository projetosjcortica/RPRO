import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';

type ProdDatum = { name: string; value: number; unit?: string };

export default function ProductsTable({ filters, onHoverName, onLeave, highlightName }: { filters?: any; onHoverName?: (name: string) => void; onLeave?: () => void; highlightName?: string | null }) {
  const [data, setData] = useState<ProdDatum[]>([]);
  
  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters?.formula) params.set('formula', String(filters.formula));
      if (filters?.dataInicio) params.set('dataInicio', String(filters.dataInicio));
      if (filters?.dataFim) params.set('dataFim', String(filters.dataFim));
      const res = await fetch(`http://localhost:3000/api/chartdata/produtos?${params.toString()}`);
      if (!res.ok) throw new Error('fetch failed');
      const body = await res.json();
      setData(body.chartData || []);
    } catch (e) {
      console.error('ProductsTable fetch error', e);
      setData([]);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [JSON.stringify(filters)]);

  // Formatar dados para exibição igual à página de relatórios
  const displayProducts = data.map((p, idx) => {
    const colKey = `col${idx + 6}`; // Simular colKey como na página de relatórios
    return {
      nome: p.name,
      qtd: p.value, // Backend /api/chartdata/produtos já retorna tudo em kg
      colKey
    };
  });

  return (
    <div className="border rounded w-full h-full overflow-auto thin-red-scrollbar">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="bg-gray-200 border sticky top-0 z-10">
            <TableHead className="text-center w-1/2 border-r h-8 py-1">
              <div className="truncate max-w-full" title="Produtos">
                Produtos
              </div>
            </TableHead>
            <TableHead className="text-center w-1/2 h-8 py-1">
              <div className="truncate max-w-full" title="Quantidade">
                Quantidade
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayProducts && displayProducts.length > 0 ? (
            displayProducts.map((produto, idx) => {
              return (
                <TableRow key={idx}
                  onMouseEnter={() => onHoverName?.(produto.nome)}
                  onMouseLeave={() => onLeave?.()}
                  className={`hover:bg-gray-50 cursor-default h-10 border-b even:bg-gray-50/50 ${highlightName === produto.nome ? 'bg-red-50' : ''}`}
                >
                  <TableCell className="py-1 px-2 text-right border-r align-middle">
                    <div 
                      className="break-words overflow-hidden line-clamp-2"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        maxWidth: "100%",
                        lineHeight: "1.2",
                      }}
                      title={produto.nome}
                    >
                      {produto.nome}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2 text-right align-middle">
                    <div 
                      className="break-words overflow-hidden line-clamp-2"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        maxWidth: "100%",
                        lineHeight: "1.2",
                      }}
                    >
                      {Number(produto.qtd).toLocaleString("pt-BR", {
                        minimumFractionDigits: 3,
                        maximumFractionDigits: 3,
                      })} kg
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-gray-500 py-4">Nenhum produto</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
