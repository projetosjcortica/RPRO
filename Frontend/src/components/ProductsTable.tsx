import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';

type ProdDatum = { name: string; value: number; unit?: string };

export default function ProductsTable({ filters, onHoverName, onLeave, highlightName }: { filters?: any; onHoverName?: (name: string) => void; onLeave?: () => void; highlightName?: string | null }) {
  const [data, setData] = useState<ProdDatum[]>([]);
  // Estado para guardar informações de produtos (unidades, etc)
  const [produtosInfo, setProdutosInfo] = useState<Record<string, { nome: string; unidade: string }>>({});
  
  // Buscar informações de produtos
  useEffect(() => {
    const fetchProdutosInfo = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/materiaprima/labels');
        if (!res.ok) return;
        const data = await res.json();
        setProdutosInfo(data);
      } catch (e) {
        console.error('Erro ao buscar info de produtos:', e);
      }
    };
    
    fetchProdutosInfo();
  }, []);

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

  // Converter valor de acordo com a unidade
  const converterValor = (valor: number, colKey?: string): number => {
    if (typeof valor !== "number") return valor;
    let unidade = produtosInfo[colKey || '']?.unidade || 'kg';
    // Backend retorna valores sempre em kg. Se unidade configurada é 'g', dividimos por 1000
    if (unidade === 'g') return valor / 1000;
    return valor;
  };

  // Formatar dados para exibição igual à página de relatórios
  const displayProducts = data.map((p, idx) => {
    const colKey = `col${idx + 6}`; // Simular colKey como na página de relatórios
    return {
      nome: p.name,
      qtd: p.value,
      colKey
    };
  });

  return (
    <div className="border rounded w-full h-full overflow-auto thin-red-scrollbar">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow className="bg-gray-200 border sticky top-0 z-10">
            <TableHead className="text-center w-1/2 border-r">Produtos</TableHead>
            <TableHead className="text-center w-1/2">Quantidade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayProducts && displayProducts.length > 0 ? (
            displayProducts.map((produto, idx) => {
              return (
                <TableRow key={idx}
                  onMouseEnter={() => onHoverName?.(produto.nome)}
                  onMouseLeave={() => onLeave?.()}
                  className={`hover:bg-gray-50 cursor-default ${highlightName === produto.nome ? 'bg-red-50' : ''}`}
                >
                  <TableCell className="py-1 text-right border-r">
                    {produto.nome}
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    {Number(converterValor(Number(produto.qtd), produto.colKey)).toLocaleString("pt-BR", {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })} {(produto.colKey && produtosInfo[produto.colKey]?.unidade) || "kg"}
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
