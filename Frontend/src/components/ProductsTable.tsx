import { useEffect, useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
// import { Button } from './ui/button';
// import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

type ProdDatum = { name: string; value: number; unit?: string };

export default function ProductsTable({ filters }: { filters?: any }) {
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

  const top = data;

  return (
  <>
    <p className="text-lg font-medium">Produtos</p>
    <div className='h-72 overflow-auto'>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">Ver todos</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Produtos (completos)</SheetTitle>
        </SheetHeader>
        <div className="p-4 overflow-auto thin-red-scrollbar ">
          <Table className=''>
            <TableHeader>
              <tr>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Unidade</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {data.map((p, idx) => (
                <TableRow key={idx}>
                  <TableCell className="max-w-[260px] truncate">{p.name}</TableCell>
                  <TableCell className="text-right">{p.value.toLocaleString('pt-BR', { minimumFractionDigits: 3 })}</TableCell>
                  <TableCell className="text-right">{p.unit ?? 'kg'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet> */}
        </div>
      </div>

      <div>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {top.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell className="max-w-[160px] truncate">{p.name}</TableCell>
                <TableCell className="text-right">{p.value.toLocaleString('pt-BR', { minimumFractionDigits: 3 })} {'Kg'}</TableCell>
              </TableRow>
            ))}
            {top.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>Nenhum produto</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div></>
  );
}
